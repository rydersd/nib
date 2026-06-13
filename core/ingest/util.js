/**
 * Shared ingest utilities.
 *
 * These helpers run identically against xlsx, sheets-csv, and sheets-api
 * inputs so the canonical project shape is adapter-agnostic.
 */

const RESERVED_TABS = new Set(['meta', 'pages', 'tokens', 'personas', 'stories']);
const VALID_TIERS = new Set(['current', 'future', 'signal']);
const VALID_EDGE_STYLES = new Set(['solid', 'dashed', 'improvement']);

const FLOW_META_KEYS = [
  'title',
  'phases',
  'lanes',
  'parent',
  'summary',
  'whatChanges',
  'ownerPersonaId',
  'status',
];

function kebabCase(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function splitListCell(value) {
  if (value == null || value === '') return [];
  return String(value)
    .split(/[;\r\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function isReservedTab(name) {
  return RESERVED_TABS.has(String(name || '').trim().toLowerCase());
}

function isRegistryTab(name) {
  return String(name || '').startsWith('_');
}

function classifyTab(name) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return 'empty';
  if (isRegistryTab(trimmed)) return 'registry';
  if (isReservedTab(trimmed)) return trimmed.toLowerCase();
  return 'flow';
}

/**
 * Find the first row whose A-column matches a label (case-insensitive).
 * Limited to the first 24 rows so meta blocks can sit ahead of data without
 * forcing a full-sheet scan.
 */
function findRowByLabel(rows, label) {
  const target = String(label).trim().toLowerCase();
  const limit = Math.min(rows.length, 24);
  for (let i = 0; i < limit; i++) {
    const cell = rows[i] && rows[i][0];
    if (cell && String(cell).trim().toLowerCase() === target) return i;
  }
  return -1;
}

/**
 * Find the header row — first row that isn't a meta:* row and contains the
 * canonical anchor columns. Caller passes the anchors; defaults are blueprint
 * flow columns (id/phase/lane).
 */
function findHeaderRow(rows, anchors = ['id', 'phase', 'lane']) {
  const need = anchors.map((a) => a.toLowerCase());
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;
    const first = row[0] && String(row[0]).trim().toLowerCase();
    if (!first || first.startsWith('meta:')) continue;
    const cells = row.map((c) => (c == null ? '' : String(c).trim().toLowerCase()));
    if (need.every((n) => cells.includes(n))) return i;
  }
  return -1;
}

function rowsToObjects(rows, headerIdx) {
  const headers = rows[headerIdx].map((h) => (h ? String(h).trim() : ''));
  const out = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row.some((c) => c != null && c !== '')) continue;
    const obj = {};
    headers.forEach((key, col) => {
      if (key) obj[key] = row[col];
    });
    out.push(obj);
  }
  return { headers, objects: out };
}

function isCommentRow(obj, idKey = 'id') {
  const id = obj && obj[idKey];
  return !id || String(id).trim().startsWith('#');
}

module.exports = {
  RESERVED_TABS,
  VALID_TIERS,
  VALID_EDGE_STYLES,
  FLOW_META_KEYS,
  kebabCase,
  splitListCell,
  isReservedTab,
  isRegistryTab,
  classifyTab,
  findRowByLabel,
  findHeaderRow,
  rowsToObjects,
  isCommentRow,
};
