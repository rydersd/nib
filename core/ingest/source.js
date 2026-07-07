/**
 * Source loading: pick the right adapter (xlsx / sheets-csv / sheets-api)
 * for an input, and resolve a project's recorded source of truth.
 *
 * Previously copy-pasted into tools/nib-ingest.js, tools/nib-sync.js and
 * tools/nib-wiki.js; the CLIs now share this module.
 */

const fs = require('fs');
const path = require('path');

function isSheetsUrl(input) {
  return /^https?:\/\/(?:docs\.google\.com|sheets\.googleapis\.com)/i.test(input);
}

/**
 * Read <project>/data/source-of-truth.txt (written by nib-ingest) into a
 * { Key: value } dict. Returns null if the file doesn't exist.
 *
 * @param {string} projectDir
 * @returns {Record<string, string>|null}
 */
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

/**
 * Resolve the source to ingest: an explicit --source value if given,
 * otherwise the Location recorded in data/source-of-truth.txt.
 * Throws if neither is available.
 *
 * @param {string|null} explicitSource
 * @param {string} projectDir
 * @returns {string}
 */
function resolveSource(explicitSource, projectDir) {
  if (explicitSource) return explicitSource;
  const sot = readSourceOfTruth(projectDir);
  if (!sot || !sot.Location) {
    throw new Error(
      `no --source given and ${path.join(projectDir, 'data/source-of-truth.txt')} doesn't record one. Pass --source <xlsx|url>.`
    );
  }
  return sot.Location;
}

/**
 * Load a workbook source into a tabs dict, dispatching on the input:
 *
 *   - Google Sheets URL + auth  → sheets-api (readSheets)
 *   - Google Sheets URL         → sheets-csv (readPublishedCsv)
 *   - .xlsx path                → xlsx (readWorkbook)
 *
 * Adapters are required lazily so e.g. googleapis is only needed on the
 * --auth path.
 *
 * @param {string} input .xlsx path or Google Sheets URL
 * @param {object} [opts]
 * @param {string|null} [opts.auth] Path to service-account credentials JSON
 * @param {(kind: 'sheets-api'|'sheets-csv'|'xlsx') => void} [opts.log]
 *   Called with the chosen adapter before reading (for CLI logging).
 * @param {string} [opts.noun] Word used in the unsupported-input error
 *   ("source" by default; nib-ingest says "input").
 * @returns {Promise<{ tabs: Record<string, Array<Array<any>>>, sourceMeta: object }>}
 */
async function loadSource(input, opts = {}) {
  const { auth = null, log = () => {}, noun = 'source' } = opts;
  if (isSheetsUrl(input)) {
    if (auth) {
      const { readSheets } = require('./sheets-api');
      log('sheets-api');
      return readSheets(input, auth);
    }
    const { readPublishedCsv } = require('./sheets-csv');
    log('sheets-csv');
    return readPublishedCsv(input);
  }
  const ext = path.extname(input).toLowerCase();
  if (ext !== '.xlsx') {
    throw new Error(`unsupported ${noun}: ${input} (need .xlsx or a Sheets URL)`);
  }
  const { readWorkbook } = require('./xlsx');
  log('xlsx');
  return readWorkbook(input);
}

module.exports = {
  isSheetsUrl,
  readSourceOfTruth,
  resolveSource,
  loadSource,
};
