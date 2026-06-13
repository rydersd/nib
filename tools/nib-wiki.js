#!/usr/bin/env node
/**
 * nib-wiki — regenerate the per-project wiki from the source workbook
 * without re-running the data emitter. Useful when:
 *
 *   - The wiki has drifted (a stub got deleted, an auto page got hand-edited
 *     by mistake) and you want to regenerate without disturbing data/.
 *   - You want to preview what the wiki *would* look like (--check).
 *
 * Subcommands:
 *   sync     Regenerate auto wiki pages. Stubs are NOT recreated by sync —
 *            stubs only land on initial scaffold (nib-ingest, nib-create).
 *            To restore deleted stubs, use `sync --restore-stubs`.
 *   check    Dry-run: exit 1 if any auto wiki page would change.
 *
 * The wiki re-ingests from the source recorded in
 * <project>/data/source-of-truth.txt (same convention as nib-sync).
 */

const fs = require('fs');
const path = require('path');

const { buildProject } = require('../core/ingest/build');
const { emitWiki } = require('../core/ingest/emit-wiki');

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m',
};

function fail(msg) {
  console.error(`${C.red}✗${C.reset} ${msg}`);
  process.exit(1);
}

function usage(code = 0) {
  console.log(`${C.bold}nib-wiki${C.reset} — regenerate the project wiki without re-running the data emitter.

${C.bold}Usage:${C.reset}
  node tools/nib-wiki.js <subcommand> [options]

${C.bold}Subcommands:${C.reset}
  sync     Regenerate auto wiki pages (Home, Pages, Personas, Blueprints, Stories, …).
  check    Dry-run; exit 1 if any auto wiki page would change.

${C.bold}Options:${C.reset}
  --project <dir>     Project root (default: cwd)
  --source <path|url> Override the source recorded in data/source-of-truth.txt
  --auth <creds.json> Use Google Sheets API for the source (private sheets)
  --restore-stubs     Recreate any missing stub pages (Decisions, Architecture, …)
  --quiet
`);
  process.exit(code);
}

function parseArgs(argv) {
  if (!argv.length || argv[0] === '--help' || argv[0] === '-h') usage(0);
  const sub = argv[0];
  if (sub !== 'sync' && sub !== 'check') fail(`unknown subcommand: ${sub} (need sync | check)`);
  const flags = { project: process.cwd(), source: null, auth: null, restoreStubs: false, quiet: false };
  for (let i = 1; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--project') flags.project = argv[++i] || fail('--project requires a path');
    else if (a === '--source') flags.source = argv[++i] || fail('--source requires a path or URL');
    else if (a === '--auth') flags.auth = argv[++i] || fail('--auth requires a path');
    else if (a === '--restore-stubs') flags.restoreStubs = true;
    else if (a === '--quiet') flags.quiet = true;
    else if (a === '--help' || a === '-h') usage(0);
    else fail(`unknown flag: ${a}`);
  }
  return { sub, ...flags };
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

function diffWiki(shadow, projectDir) {
  const result = { added: [], changed: [], removed: [] };
  const shadowDocs = path.join(shadow, 'docs');
  if (!fs.existsSync(shadowDocs)) return result;
  const shadowFiles = walk(shadowDocs).map((p) => path.join('docs', p));
  const shadowSet = new Set(shadowFiles);

  for (const rel of shadowFiles) {
    const projectPath = path.join(projectDir, rel);
    if (!fs.existsSync(projectPath)) {
      result.added.push(rel);
      continue;
    }
    const a = fs.readFileSync(path.join(shadow, rel));
    const b = fs.readFileSync(projectPath);
    if (!a.equals(b)) result.changed.push(rel);
  }
  // Track removed auto pages — hand pages are never reported.
  const projectDocs = path.join(projectDir, 'docs');
  if (fs.existsSync(projectDocs)) {
    for (const name of fs.readdirSync(projectDocs)) {
      const rel = `docs/${name}`;
      if (shadowSet.has(rel)) continue;
      try {
        const firstLine = fs.readFileSync(path.join(projectDocs, name), 'utf8').split('\n', 1)[0];
        if (firstLine.includes('<!-- nib:auto')) result.removed.push(rel);
      } catch (_) {}
    }
  }
  return result;
}

function walk(root) {
  if (!fs.existsSync(root)) return [];
  const out = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.isFile()) out.push(entry.name);
    // Wiki is flat; don't recurse.
  }
  return out.sort();
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const log = args.quiet ? () => {} : (...a) => console.log(...a);

  let source = args.source;
  if (!source) {
    const sot = readSourceOfTruth(args.project);
    if (!sot || !sot.Location) {
      fail(`no --source given and ${path.join(args.project, 'data/source-of-truth.txt')} doesn't record one. Pass --source <xlsx|url>.`);
    }
    source = sot.Location;
  }

  log(`${C.cyan}→${C.reset} Re-ingesting wiki source: ${source}`);
  const { tabs, sourceMeta } = await ingest(source, args.auth);
  const { project, warnings } = buildProject(tabs, {
    warn: (msg) => console.warn(`${C.yellow}!${C.reset} ${msg}`),
  });
  sourceMeta.tabsIngested = Object.keys(tabs);

  const shadow = fs.mkdtempSync(path.join(require('os').tmpdir(), 'nib-wiki-'));
  try {
    emitWiki(project, shadow, sourceMeta, { skipStubs: !args.restoreStubs });
    const diff = diffWiki(shadow, args.project);

    if (!diff.added.length && !diff.changed.length && !diff.removed.length) {
      log(`${C.green}✓${C.reset} Wiki is in sync.`);
      if (warnings.length) console.warn(`${C.yellow}${warnings.length} warning${warnings.length === 1 ? '' : 's'}.${C.reset}`);
      return;
    }

    log(`${C.bold}Changes:${C.reset}`);
    for (const f of diff.added) log(`  ${C.green}+${C.reset} ${f}`);
    for (const f of diff.changed) log(`  ${C.yellow}~${C.reset} ${f}`);
    for (const f of diff.removed) log(`  ${C.red}-${C.reset} ${f}`);

    if (args.sub === 'check') {
      log(`${C.yellow}!${C.reset} check: ${diff.added.length + diff.changed.length + diff.removed.length} drift(s). Exiting 1.`);
      process.exit(1);
    }

    // Apply
    for (const rel of [...diff.added, ...diff.changed]) {
      fs.mkdirSync(path.dirname(path.join(args.project, rel)), { recursive: true });
      fs.copyFileSync(path.join(shadow, rel), path.join(args.project, rel));
    }
    for (const rel of diff.removed) {
      try { fs.unlinkSync(path.join(args.project, rel)); } catch (_) {}
    }

    log(`${C.green}✓${C.reset} Wiki: ${diff.added.length} added, ${diff.changed.length} changed, ${diff.removed.length} removed.`);
    if (warnings.length) console.warn(`${C.yellow}${warnings.length} warning${warnings.length === 1 ? '' : 's'}.${C.reset}`);
  } finally {
    try { fs.rmSync(shadow, { recursive: true, force: true }); } catch (_) {}
  }
}

run().catch((err) => fail(err.message || String(err)));
