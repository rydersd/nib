/**
 * Google Sheets CSV adapter — unauthenticated path.
 *
 * Three input forms are supported:
 *   1. Sharing URL  — https://docs.google.com/spreadsheets/d/<id>/edit?...
 *      Downloads the full workbook via /export?format=xlsx and reuses the
 *      xlsx adapter. This is the canonical "Sheets default" path.
 *
 *   2. Published URL — https://docs.google.com/spreadsheets/d/e/<pubid>/pubhtml
 *      Scrapes the embedded tab metadata, then fetches each tab as CSV via
 *      gviz. Requires the sheet to be published to web.
 *
 *   3. Single CSV URL — anything ending in `output=csv` or `format=csv`.
 *      Fetches one tab; emits as a single-tab workbook (useful for tests).
 *
 * No OAuth, no API key, no SDK. Pure HTTP.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const https = require('https');
const http = require('http');

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers: { 'User-Agent': 'nib-ingest/1.0' } }, (res) => {
      // Follow redirects (sharing URLs hop through several)
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        res.resume();
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).toString();
        return resolve(fetchBuffer(next));
      }
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
    req.on('error', reject);
  });
}

function fetchText(url) {
  return fetchBuffer(url).then((buf) => buf.toString('utf8'));
}

function extractSpreadsheetId(url) {
  // Matches /d/<id> and /d/e/<pubid>
  const m = url.match(/\/spreadsheets\/d\/(?:e\/)?([a-zA-Z0-9-_]+)/);
  return m ? m[1] : null;
}

function classifyUrl(url) {
  if (/\/pub(?:html)?\b/.test(url)) return 'published';
  if (/[?&](?:output|format)=csv\b/i.test(url)) return 'csv';
  if (/\/spreadsheets\/d\//.test(url)) return 'sharing';
  return 'unknown';
}

// Minimal CSV parser. Handles RFC-4180 quoted fields with embedded commas,
// CRLF, and doubled quotes. Sufficient for Sheets exports — not a full spec.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(coerce(field));
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(coerce(field));
      field = '';
      rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length) {
    row.push(coerce(field));
    rows.push(row);
  }
  // Strip fully-empty trailing rows
  while (rows.length && rows[rows.length - 1].every((v) => v === '' || v == null)) rows.pop();
  // Normalize empty cells to null (matches the xlsx adapter convention)
  return rows.map((r) => r.map((v) => (v === '' ? null : v)));
}

function coerce(s) {
  if (s === '' || s == null) return s;
  // Numbers (avoid touching IDs that happen to be numeric strings — leave
  // it to the parser to interpret. Sheet ingest is forgiving.)
  return s;
}

// ── Sharing URL → xlsx download ────────────────────────────────────────────
async function readViaXlsxExport(sharingUrl) {
  const id = extractSpreadsheetId(sharingUrl);
  if (!id) throw new Error(`could not extract spreadsheet id from ${sharingUrl}`);
  const exportUrl = `https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`;
  const buf = await fetchBuffer(exportUrl);
  // Persist to a temp file so the existing xlsx adapter (which reads from
  // disk) can consume it unchanged.
  const tmp = path.join(os.tmpdir(), `nib-sheet-${id}-${Date.now()}.xlsx`);
  fs.writeFileSync(tmp, buf);
  try {
    const { readWorkbook } = require('./xlsx');
    const result = readWorkbook(tmp);
    return {
      tabs: result.tabs,
      sourceMeta: {
        kind: 'sheets-csv',
        url: sharingUrl,
        spreadsheetId: id,
        downloadedAt: new Date().toISOString(),
      },
    };
  } finally {
    try { fs.unlinkSync(tmp); } catch (_) {}
  }
}

// ── Published URL → scrape tabs, fetch each as CSV ─────────────────────────
async function readViaPublished(publishedUrl) {
  const html = await fetchText(publishedUrl);
  // Pubhtml pages embed a JS array of sheet metadata; the simplest reliable
  // pattern is a list of <a id="sheet-button-{gid}"> + an "items" array. We
  // pull tab names from the {name: '...', gid: '...'} pairs in the bootstrap
  // payload.
  const tabs = {};
  const re = /\{[^{}]*?"name":"([^"]+)"[^{}]*?"gid":"?(\d+)"?[^{}]*?\}/g;
  const seen = new Set();
  let m;
  while ((m = re.exec(html))) {
    const name = m[1];
    const gid = m[2];
    if (seen.has(gid)) continue;
    seen.add(gid);
    const csvUrl = publishedUrl.replace(/\/pubhtml.*$/, `/pub?gid=${gid}&single=true&output=csv`);
    const csv = await fetchText(csvUrl);
    tabs[name] = parseCsv(csv);
  }
  if (!Object.keys(tabs).length) {
    throw new Error(`could not find tabs in published URL — re-publish the sheet to web with all tabs`);
  }
  return {
    tabs,
    sourceMeta: { kind: 'sheets-csv-published', url: publishedUrl, fetchedAt: new Date().toISOString() },
  };
}

// ── Single CSV URL ─────────────────────────────────────────────────────────
async function readSingleCsv(csvUrl) {
  const csv = await fetchText(csvUrl);
  const tabs = { sheet: parseCsv(csv) };
  return {
    tabs,
    sourceMeta: { kind: 'sheets-csv-single', url: csvUrl, fetchedAt: new Date().toISOString() },
  };
}

/**
 * Public entry point.
 * @param {string} url
 * @returns {Promise<{ tabs: Record<string, Array>, sourceMeta: object }>}
 */
async function readPublishedCsv(url) {
  switch (classifyUrl(url)) {
    case 'sharing':
      return readViaXlsxExport(url);
    case 'published':
      return readViaPublished(url);
    case 'csv':
      return readSingleCsv(url);
    default:
      throw new Error(`unrecognized Sheets URL shape: ${url}`);
  }
}

module.exports = { readPublishedCsv, parseCsv, classifyUrl };
