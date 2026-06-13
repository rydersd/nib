#!/usr/bin/env node
/**
 * nib-sync — idempotent re-ingest with diff.
 *
 * Re-reads the source workbook (or Sheets URL), regenerates the canonical
 * project files, and only writes the ones whose contents changed. Reports
 * a diff summary. The source of truth is recorded in
 * <project>/data/source-of-truth.txt by nib-ingest.
 *
 * Usage:
 *   node tools/nib-sync.js                            # auto-detect from data/source-of-truth.txt
 *   node tools/nib-sync.js --project ./my-project
 *   node tools/nib-sync.js --source ./latest.xlsx --project ./my-project
 *   node tools/nib-sync.js --auth creds.json          # if source is a Sheets URL
 *   node tools/nib-sync.js --check                    # exit 1 if anything would change (CI mode)
 */

const fs = require('fs');
const path = require('path');

const { buildProject } = require('../core/ingest/build');
const { emit } = require('../core/ingest/emit');
const { emitWiki } = require('../core/ingest/emit-wiki');

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function fail(msg) {
  console.error(`${C.red}✗${C.reset} ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  const flags = { project: process.cwd(), source: null, auth: null, check: false, quiet: false, wiki: true };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--project') flags.project = argv[++i] || fail('--project requires a path');
    else if (a === '--source') flags.source = argv[++i] || fail('--source requires a path or URL');
    else if (a === '--auth') flags.auth = argv[++i] || fail('--auth requires a path');
    else if (a === '--check') flags.check = true;
    else if (a === '--quiet') flags.quiet = true;
    else if (a === '--no-wiki') flags.wiki = false;
    else if (a === '--help' || a === '-h') {
      console.log(`Usage: node tools/nib-sync.js [--project <dir>] [--source <xlsx|url>] [--auth <creds>] [--check] [--no-wiki] [--quiet]`);
      process.exit(0);
    } else fail(`unknown flag: ${a}`);
  }
  return flags;
}

function readSourceOfTruth(projectDir) {
  const sotPath = path.join(projectDir, 'data', 'source-of-truth.txt');
  if (!fs.existsSync(sotPath)) return null;
  const text = fs.readFileSync(sotPath, 'utf8');
  const out = {};
  for (const line of text.split('\n')) {
    const m = line.match(/^([^:]+):\s*(.*)$/);
    if (m) out[m[1].trim()] = m[2].trim();
  }
  return out;
}

function isSheetsUrl(input) {
  return /^https?:\/\/(?:docs\.google\.com|sheets\.googleapis\.com)/i.test(input);
}

async function ingest(source, auth) {
  if (isSheetsUrl(source)) {
    if (auth) {
      const { readSheets } = require('../core/ingest/sheets-api');
      return readSheets(source, auth);
    }
    const { readPublishedCsv } = require('../core/ingest/sheets-csv');
    return readPublishedCsv(source);
  }
  const ext = path.extname(source).toLowerCase();
  if (ext !== '.xlsx') fail(`unsupported source: ${source} (need .xlsx or a Sheets URL)`);
  const { readWorkbook } = require('../core/ingest/xlsx');
  return readWorkbook(source);
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const log = args.quiet ? () => {} : (...a) => console.log(...a);

  // Resolve source
  let source = args.source;
  if (!source) {
    const sot = readSourceOfTruth(args.project);
    if (!sot || !sot.Location) {
      fail(`no --source given and ${path.join(args.project, 'data/source-of-truth.txt')} doesn't record one. Pass --source <xlsx|url>.`);
    }
    source = sot.Location;
  }

  log(`${C.cyan}→${C.reset} Re-ingesting from ${source}`);
  const { tabs, sourceMeta } = await ingest(source, args.auth);
  const { project, warnings } = buildProject(tabs, {
    warn: (msg) => console.warn(`${C.yellow}!${C.reset} ${msg}`),
  });
  sourceMeta.tabsIngested = Object.keys(tabs);

  // Stage outputs in memory by capturing what emit() would write, then
  // diff against the existing project. We achieve this by running emit
  // into a shadow directory and comparing file-by-file.
  const shadow = fs.mkdtempSync(path.join(require('os').tmpdir(), 'nib-sync-'));
  try {
    emit(project, sourceMeta, shadow);
    if (args.wiki) {
      // skipStubs: hand-edited stubs in the project would otherwise look
      // like drift. Stubs are scaffold-time only; sync only touches the
      // auto pages.
      emitWiki(project, shadow, sourceMeta, { skipStubs: true });
    }
    const diff = diffDirectories(shadow, args.project);

    if (!diff.changed.length && !diff.added.length && !diff.removed.length) {
      log(`${C.green}✓${C.reset} No changes — project is in sync.`);
      if (warnings.length) console.warn(`${C.yellow}${warnings.length} warning${warnings.length === 1 ? '' : 's'}.${C.reset}`);
      return;
    }

    log(`${C.bold}Changes:${C.reset}`);
    for (const f of diff.added) log(`  ${C.green}+${C.reset} ${f}`);
    for (const f of diff.changed) log(`  ${C.yellow}~${C.reset} ${f}`);
    for (const f of diff.removed) log(`  ${C.red}-${C.reset} ${f}`);

    if (args.check) {
      log(`${C.yellow}!${C.reset} --check: ${diff.added.length + diff.changed.length + diff.removed.length} drift(s) detected. Exiting 1.`);
      process.exit(1);
    }

    // Apply changes
    for (const rel of [...diff.added, ...diff.changed]) {
      const from = path.join(shadow, rel);
      const to = path.join(args.project, rel);
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
    }
    for (const rel of diff.removed) {
      // Only remove files we previously auto-generated. Never delete
      // user-authored files. data/ files are always ours; docs/ files
      // are only ours if they carry the nib:auto marker on line 1.
      if (rel.startsWith('data/')) {
        try { fs.unlinkSync(path.join(args.project, rel)); } catch (_) {}
      } else if (rel.startsWith('docs/')) {
        const full = path.join(args.project, rel);
        try {
          const firstLine = fs.readFileSync(full, 'utf8').split('\n', 1)[0];
          if (firstLine.includes('<!-- nib:auto')) fs.unlinkSync(full);
        } catch (_) {}
      }
    }

    log(`${C.green}✓${C.reset} Synced ${diff.added.length} added, ${diff.changed.length} changed, ${diff.removed.length} removed.`);
    if (warnings.length) console.warn(`${C.yellow}${warnings.length} warning${warnings.length === 1 ? '' : 's'}.${C.reset}`);
  } finally {
    rmRecursive(shadow);
  }
}

function diffDirectories(shadowDir, projectDir) {
  const shadowFiles = walk(shadowDir);
  const result = { added: [], changed: [], removed: [] };
  const shadowSet = new Set(shadowFiles);

  for (const rel of shadowFiles) {
    const projectPath = path.join(projectDir, rel);
    if (!fs.existsSync(projectPath)) {
      result.added.push(rel);
      continue;
    }
    const a = fs.readFileSync(path.join(shadowDir, rel));
    const b = fs.readFileSync(projectPath);
    if (!a.equals(b)) result.changed.push(rel);
  }

  // Check for files we previously generated but no longer would. data/ is
  // always ours. docs/ files are ours only if they carry the nib:auto marker
  // on line 1 — hand-authored wiki pages must never be reported as removed.
  const projectDataDir = path.join(projectDir, 'data');
  if (fs.existsSync(projectDataDir)) {
    for (const rel of walk(projectDataDir, 'data')) {
      if (!shadowSet.has(rel)) result.removed.push(rel);
    }
  }
  const projectDocsDir = path.join(projectDir, 'docs');
  if (fs.existsSync(projectDocsDir)) {
    for (const rel of walk(projectDocsDir, 'docs')) {
      if (shadowSet.has(rel)) continue;
      const full = path.join(projectDir, rel);
      try {
        const firstLine = fs.readFileSync(full, 'utf8').split('\n', 1)[0];
        if (firstLine.includes('<!-- nib:auto')) result.removed.push(rel);
      } catch (_) {}
    }
  }

  return result;
}

function walk(root, prefix = '') {
  const out = [];
  function recurse(dir, rel) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const next = rel ? path.join(rel, entry.name) : entry.name;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) recurse(full, next);
      else out.push(next);
    }
  }
  recurse(root, prefix);
  return out.sort();
}

function rmRecursive(p) {
  try { fs.rmSync(p, { recursive: true, force: true }); } catch (_) {}
}

run().catch((err) => fail(err.message || String(err)));
