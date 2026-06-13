#!/usr/bin/env node
/**
 * nib-ingest — turn a workbook into a Nib project.
 *
 * Usage:
 *   node tools/nib-ingest.js <input> [--out <project-dir>]
 *
 *   <input>   Path to a .xlsx file, OR a Google Sheets published-CSV URL,
 *             OR a Google Sheets sharing URL (with --auth, uses Sheets API).
 *   --out     Target project directory. Defaults to the current working dir.
 *   --auth    Path to a Google service-account credentials JSON. Switches
 *             Sheets ingestion to the API path (private sheets, write-back).
 *   --dry     Print the canonical project shape; don't write files.
 *   --quiet   Suppress info logs (warnings still show).
 *
 * Examples:
 *   node tools/nib-ingest.js my-project.xlsx --out ./my-project
 *   node tools/nib-ingest.js https://docs.google.com/.../pub?output=csv
 *   node tools/nib-ingest.js https://docs.google.com/spreadsheets/d/<id> --auth ./creds.json
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

function usage(code = 0) {
  console.log(`${C.bold}nib-ingest${C.reset} — turn a workbook into a Nib project.

${C.bold}Usage:${C.reset}
  node tools/nib-ingest.js <input> [--out <project-dir>] [--auth <creds.json>] [--dry] [--quiet]

  <input>   .xlsx path, Google Sheets published-CSV URL, or Sheets sharing URL (+ --auth)

${C.bold}Examples:${C.reset}
  node tools/nib-ingest.js my-project.xlsx --out ./my-project
  node tools/nib-ingest.js https://docs.google.com/.../pub?output=csv
  node tools/nib-ingest.js https://docs.google.com/spreadsheets/d/<id> --auth ./creds.json
`);
  process.exit(code);
}

function fail(msg) {
  console.error(`${C.red}✗${C.reset} ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  if (!argv.length || argv.includes('--help') || argv.includes('-h')) usage(0);
  const positional = [];
  const flags = { out: process.cwd(), auth: null, dry: false, quiet: false, wiki: true };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') flags.out = argv[++i] || fail('--out requires a path');
    else if (a === '--auth') flags.auth = argv[++i] || fail('--auth requires a path');
    else if (a === '--dry') flags.dry = true;
    else if (a === '--quiet') flags.quiet = true;
    else if (a === '--no-wiki') flags.wiki = false;
    else if (a.startsWith('--')) fail(`unknown flag: ${a}`);
    else positional.push(a);
  }
  if (!positional.length) fail('input is required (xlsx path or sheets URL)');
  return { input: positional[0], ...flags };
}

function isSheetsUrl(input) {
  return /^https?:\/\/(?:docs\.google\.com|sheets\.googleapis\.com)/i.test(input);
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const log = args.quiet ? () => {} : (...a) => console.log(...a);

  let tabs;
  let sourceMeta;

  if (isSheetsUrl(args.input)) {
    if (args.auth) {
      const { readSheets } = require('../core/ingest/sheets-api');
      log(`${C.cyan}→${C.reset} Reading Google Sheets via API: ${args.input}`);
      ({ tabs, sourceMeta } = await readSheets(args.input, args.auth));
    } else {
      const { readPublishedCsv } = require('../core/ingest/sheets-csv');
      log(`${C.cyan}→${C.reset} Reading Google Sheets (published CSV): ${args.input}`);
      ({ tabs, sourceMeta } = await readPublishedCsv(args.input));
    }
  } else {
    const ext = path.extname(args.input).toLowerCase();
    if (ext === '.xlsx') {
      const { readWorkbook } = require('../core/ingest/xlsx');
      log(`${C.cyan}→${C.reset} Reading workbook: ${args.input}`);
      ({ tabs, sourceMeta } = readWorkbook(args.input));
    } else {
      fail(`unsupported input: ${args.input} (need .xlsx or a Sheets URL)`);
    }
  }

  log(`  ${C.dim}${Object.keys(tabs).length} tabs found${C.reset}`);

  const { project, warnings } = buildProject(tabs, {
    warn: (msg) => console.warn(`${C.yellow}!${C.reset} ${msg}`),
  });

  sourceMeta.tabsIngested = Object.keys(tabs);

  log(
    `  ${C.dim}${(project.pages || []).length} pages · ` +
      `${(project.personas || []).length} personas · ` +
      `${Object.keys(project.blueprints || {}).length} blueprints · ` +
      `${(project.stories || []).length} stories${C.reset}`
  );

  if (args.dry) {
    process.stdout.write(JSON.stringify(project, null, 2) + '\n');
    return;
  }

  const outDir = path.resolve(args.out);
  fs.mkdirSync(outDir, { recursive: true });
  const { written } = emit(project, sourceMeta, outDir);

  let wikiWritten = [];
  let wikiStubs = [];
  if (args.wiki) {
    const r = emitWiki(project, outDir, sourceMeta);
    wikiWritten = r.written;
    wikiStubs = r.stubs;
  }

  log(`${C.green}✓${C.reset} Wrote ${written.length} data file${written.length === 1 ? '' : 's'}` +
    (args.wiki ? ` + ${wikiWritten.length} wiki page${wikiWritten.length === 1 ? '' : 's'}` +
      (wikiStubs.length ? ` (+ ${wikiStubs.length} stub${wikiStubs.length === 1 ? '' : 's'})` : '') : '') +
    ` to ${path.relative(process.cwd(), outDir) || '.'}`);
  for (const rel of written) log(`  ${C.dim}${rel}${C.reset}`);
  for (const rel of wikiWritten) log(`  ${C.dim}${rel}${C.reset}`);
  for (const rel of wikiStubs) log(`  ${C.dim}${rel} (stub, only if missing)${C.reset}`);

  if (warnings.length) {
    console.warn(`${C.yellow}${warnings.length} warning${warnings.length === 1 ? '' : 's'}.${C.reset}`);
  }
}

run().catch((err) => fail(err.message || String(err)));
