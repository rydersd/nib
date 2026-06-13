/**
 * Google Sheets API adapter — opt-in, requires a service-account credentials
 * file. Reads private sheets and supports write-back from the round-trip
 * exporter.
 *
 * Activate via `nib-ingest --auth <path-to-creds.json>`.
 *
 * The service account must be granted at least Viewer on the target sheet
 * (Reader for read-only ingestion, Editor for round-trip write-back).
 */

const fs = require('fs');
const path = require('path');

function loadGoogleApis() {
  const candidates = [
    path.resolve(__dirname, '..', '..', 'node_modules', 'googleapis'),
    path.resolve(process.cwd(), 'node_modules', 'googleapis'),
  ];
  for (const p of candidates) {
    try { return require(p); } catch (_) {}
  }
  try { return require('googleapis'); } catch (_) {
    throw new Error('googleapis not found. Install with: npm install googleapis');
  }
}

function extractSpreadsheetId(url) {
  const m = url.match(/\/spreadsheets\/d\/(?:e\/)?([a-zA-Z0-9-_]+)/);
  if (m) return m[1];
  // Allow passing a bare ID directly
  if (/^[a-zA-Z0-9-_]+$/.test(url)) return url;
  return null;
}

/**
 * @param {string} sheetUrlOrId Sharing URL or bare spreadsheet id
 * @param {string} credsPath Path to service-account credentials JSON
 * @returns {Promise<{ tabs: Record<string, Array>, sourceMeta: object }>}
 */
async function readSheets(sheetUrlOrId, credsPath) {
  const id = extractSpreadsheetId(sheetUrlOrId);
  if (!id) throw new Error(`could not extract spreadsheet id from "${sheetUrlOrId}"`);

  if (!fs.existsSync(credsPath)) throw new Error(`credentials not found: ${credsPath}`);
  const credsRaw = fs.readFileSync(credsPath, 'utf8');
  let creds;
  try { creds = JSON.parse(credsRaw); }
  catch (e) { throw new Error(`could not parse credentials JSON: ${e.message}`); }

  const { google } = loadGoogleApis();
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  // 1. List tab names
  const meta = await sheets.spreadsheets.get({ spreadsheetId: id, fields: 'sheets(properties(title))' });
  const tabNames = (meta.data.sheets || []).map((s) => s.properties.title);
  if (!tabNames.length) throw new Error(`no tabs found in spreadsheet ${id}`);

  // 2. Batch-read all tabs as raw cell values
  const ranges = tabNames.map((name) => `'${name.replace(/'/g, "''")}'`);
  const batch = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: id,
    ranges,
    valueRenderOption: 'UNFORMATTED_VALUE',
  });

  const tabs = {};
  (batch.data.valueRanges || []).forEach((vr, idx) => {
    const name = tabNames[idx];
    const rows = (vr.values || []).map((row) => row.map((v) => (v === '' ? null : v)));
    tabs[name] = rows;
  });

  return {
    tabs,
    sourceMeta: {
      kind: 'sheets-api',
      url: sheetUrlOrId,
      spreadsheetId: id,
      fetchedAt: new Date().toISOString(),
    },
  };
}

/**
 * Optional: write-back support for round-trip. Currently a stub — round-trip
 * write goes through the xlsx exporter (Track 2). This is reserved for a
 * future "edit canvas → push directly to live sheet" mode.
 */
async function writeSheets(/* sheetUrlOrId, credsPath, project */) {
  throw new Error('writeSheets is not implemented yet. Use the xlsx exporter for round-trip.');
}

module.exports = { readSheets, writeSheets };
