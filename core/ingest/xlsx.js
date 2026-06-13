/**
 * xlsx adapter: .xlsx file → tabs dict (consumed by build.js).
 *
 * Lifted from eqPartners/nib-export/tools/ingest-blueprint.js with the
 * project-level tabs (meta/pages/tokens/personas/stories) added on top.
 */

const fs = require('fs');
const path = require('path');

function loadXlsx() {
  const candidates = [
    path.resolve(__dirname, '..', '..', 'node_modules', 'xlsx'),
    path.resolve(process.cwd(), 'node_modules', 'xlsx'),
  ];
  for (const p of candidates) {
    try { return require(p); } catch (_) {}
  }
  try { return require('xlsx'); } catch (_) {
    throw new Error('xlsx not found. Install with: npm install xlsx');
  }
}

/**
 * @param {string} xlsxPath
 * @returns {{ tabs: Record<string, Array<Array<any>>>, sourceMeta: object }}
 */
function readWorkbook(xlsxPath) {
  if (!fs.existsSync(xlsxPath)) {
    throw new Error(`workbook not found: ${xlsxPath}`);
  }
  const xlsx = loadXlsx();
  const wb = xlsx.readFile(xlsxPath, { cellDates: false });
  const tabs = {};
  for (const tabName of wb.SheetNames) {
    const ws = wb.Sheets[tabName];
    const aoa = xlsx.utils.sheet_to_json(ws, { header: 1, defval: null, blankrows: false });
    tabs[tabName] = aoa;
  }
  const stat = fs.statSync(xlsxPath);
  return {
    tabs,
    sourceMeta: {
      kind: 'xlsx',
      path: path.resolve(xlsxPath),
      mtime: stat.mtime.toISOString(),
    },
  };
}

module.exports = { readWorkbook };
