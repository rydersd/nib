/**
 * Exporters: BlueprintFlow → JSON | YAML | xlsx (round-trip).
 *
 * The xlsx export is the round-trip contract — the produced workbook can be
 * fed back into nib-ingest and yields a byte-identical canonical project
 * shape (modulo cell-internal ordering).
 *
 * Runs in the browser. xlsx and js-yaml are loaded from esm.sh on demand.
 */

const XLSX_URL = 'https://esm.sh/xlsx@0.18.5';
const YAML_URL = 'https://esm.sh/js-yaml@4.1.0';

let _xlsx = null;
let _yaml = null;

async function getXlsx() {
  if (_xlsx) return _xlsx;
  _xlsx = await import(XLSX_URL);
  return _xlsx;
}
async function getYaml() {
  if (_yaml) return _yaml;
  _yaml = await import(YAML_URL);
  return _yaml.default || _yaml;
}

// ── Flow → workbook tab rows ───────────────────────────────────────────────
// Mirrors the format the ingest parser reads.
export function flowToTabRows(flow) {
  const meta = flow.meta || {};
  const phases = flow.phases || [];
  const lanes = flow.lanes || [];
  const nodes = flow.nodes || [];
  const edgesByTarget = new Map();
  for (const e of flow.edges || []) {
    if (!edgesByTarget.has(e.to)) edgesByTarget.set(e.to, []);
    edgesByTarget.get(e.to).push(e);
  }

  const rows = [];
  rows.push(['meta:title', meta.title || flow.meta.flowId]);
  rows.push(['meta:phases', phases.map((p) => p.id).join(', ')]);
  rows.push([
    'meta:lanes',
    ...lanes.map((l) => l.id + (l.tier ? `:${l.tier}` : '') + (l.actorGroup ? `:${l.actorGroup}` : '')),
  ]);
  if (meta.parent) rows.push(['meta:parent', meta.parent]);
  if (meta.summary) rows.push(['meta:summary', meta.summary]);
  if (meta.whatChanges && meta.whatChanges.length) {
    rows.push(['meta:whatChanges', Array.isArray(meta.whatChanges) ? meta.whatChanges.join('; ') : meta.whatChanges]);
  }
  if (meta.ownerPersonaId) rows.push(['meta:ownerPersonaId', meta.ownerPersonaId]);
  if (meta.status) rows.push(['meta:status', meta.status]);
  rows.push([]);

  // Header
  rows.push([
    'id', 'phase', 'lane', 'label', 'summary', 'status',
    'predecessors', 'childBlueprintId', 'persona',
    'sentimentEmoji', 'sentimentLabel',
    'pages', 'gapNotes', 'initiativeIds',
  ]);

  // Sentiment rows from signal lanes' cells
  for (const lane of lanes) {
    if (lane.tier !== 'signal') continue;
    for (const cell of lane.cells || []) {
      rows.push([
        `s-${lane.id}-${cell.phase}`,
        cell.phase,
        lane.id,
        '',
        cell.note || '',
        'draft',
        '', '', '',
        (cell.sentiment && cell.sentiment.emoji) || '',
        (cell.sentiment && cell.sentiment.label) || '',
        '', '', '',
      ]);
    }
  }

  // Node rows
  for (const node of nodes) {
    const preds = (edgesByTarget.get(node.id) || []).map((e) => {
      const overrides = [];
      if (e.style && e.style !== 'solid') overrides.push(`style=${e.style}`);
      if (e.label) overrides.push(`label=${e.label}`);
      return overrides.length ? `${e.from}[${overrides.join(',')}]` : e.from;
    });
    rows.push([
      node.id,
      node.phase,
      node.lane,
      node.label,
      node.summary || '',
      node.status || 'draft',
      preds.join('; '),
      node.childBlueprintId || '',
      node.persona || '',
      '', '',
      asListCell(node.pages),
      asListCell(node.gapNotes),
      asListCell(node.initiativeIds),
    ]);
  }

  return rows;
}

function asListCell(v) {
  if (!v) return '';
  return Array.isArray(v) ? v.join('; ') : String(v);
}

// ── JSON export ────────────────────────────────────────────────────────────
export function exportJson(flow) {
  return JSON.stringify(flow, null, 2);
}

// ── YAML export ────────────────────────────────────────────────────────────
export async function exportYaml(flow) {
  const yaml = await getYaml();
  return yaml.dump(flow, { lineWidth: 120, noRefs: true, quotingType: "'" });
}

// ── xlsx export (round-trip) ───────────────────────────────────────────────
// Produces a single-tab workbook for one flow. To round-trip a whole project
// of nested blueprints, pass `{ <flowId>: flow, ... }` to exportXlsxBundle.
export async function exportXlsx(flow) {
  const xlsx = await getXlsx();
  const rows = flowToTabRows(flow);
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.aoa_to_sheet(rows);
  xlsx.utils.book_append_sheet(wb, ws, flow.meta && flow.meta.flowId ? flow.meta.flowId : 'flow');
  return xlsx.write(wb, { type: 'array', bookType: 'xlsx' });
}

export async function exportXlsxBundle(flowsById) {
  const xlsx = await getXlsx();
  const wb = xlsx.utils.book_new();
  for (const [id, flow] of Object.entries(flowsById)) {
    const rows = flowToTabRows(flow);
    const ws = xlsx.utils.aoa_to_sheet(rows);
    xlsx.utils.book_append_sheet(wb, ws, id);
  }
  return xlsx.write(wb, { type: 'array', bookType: 'xlsx' });
}

// ── Browser file-save helper ───────────────────────────────────────────────
export function downloadBlob(content, filename, mime) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime || 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
