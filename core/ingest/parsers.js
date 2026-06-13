/**
 * Per-tab parsers. Input: rows = array-of-arrays (header-less, raw cell values).
 * Output: contributions to the canonical project shape.
 *
 * Adapters (xlsx, sheets-csv, sheets-api) all produce rows in the same form,
 * so these parsers are reused unchanged across input formats.
 */

const {
  VALID_TIERS,
  kebabCase,
  splitListCell,
  findRowByLabel,
  findHeaderRow,
  rowsToObjects,
  isCommentRow,
} = require('./util');

// ── meta tab ───────────────────────────────────────────────────────────────
// Two-column key/value rows. Reserved keys land in project.meta; unknown
// keys are passed through so projects can stash custom config.
// First row is skipped if it looks like a header.
const META_HEADER_LABELS = new Set(['key', 'name', 'setting', 'config']);
function parseMetaTab(rows, warn) {
  const meta = {};
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[0]) continue;
    const key = String(row[0]).trim();
    if (!key || key.startsWith('#')) continue;
    if (i === 0 && META_HEADER_LABELS.has(key.toLowerCase())) continue;
    let value = row[1];
    if (typeof value === 'string') value = value.trim();
    // Coerce booleans / null sentinels common in spreadsheets
    if (value === 'true') value = true;
    else if (value === 'false') value = false;
    else if (value === '' || value == null) continue;
    // Nested keys ("portalHeader.logo") fold into objects
    if (key.includes('.')) {
      const parts = key.split('.');
      let cur = meta;
      for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        if (typeof cur[p] !== 'object' || cur[p] == null) cur[p] = {};
        cur = cur[p];
      }
      cur[parts[parts.length - 1]] = value;
    } else {
      meta[key] = value;
    }
  }
  if (!meta.title) warn('meta tab has no `title` row — using "Untitled Nib Project"');
  return { title: 'Untitled Nib Project', ...meta };
}

// ── pages tab ──────────────────────────────────────────────────────────────
function parsePagesTab(rows, warn) {
  const headerIdx = findHeaderRow(rows, ['id', 'label']);
  if (headerIdx === -1) {
    warn('pages tab has no `id, label` header row — skipping');
    return [];
  }
  const { objects } = rowsToObjects(rows, headerIdx);
  return objects
    .filter((o) => !isCommentRow(o))
    .map((o) => ({
      id: kebabCase(o.id),
      label: String(o.label || '').trim(),
      parent: o.parent ? kebabCase(o.parent) : null,
      surface: o.surface ? String(o.surface).trim().toLowerCase() : null,
      template: o.template ? String(o.template).trim() : null,
      icon: o.icon || null,
      summary: o.summary || null,
      personaId: o.personaId ? kebabCase(o.personaId) : null,
      storyIds: splitListCell(o.storyIds),
      blueprintId: o.blueprintId ? kebabCase(o.blueprintId) : null,
    }));
}

// ── tokens tab ─────────────────────────────────────────────────────────────
// Two-column rows: --wf-name | value. Names without the `--` prefix get one.
// First row is skipped if it looks like a header (`name`/`key`/`token` in A).
const TOKEN_HEADER_LABELS = new Set(['name', 'key', 'token', 'variable']);
function parseTokensTab(rows) {
  const out = {};
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[0]) continue;
    let name = String(row[0]).trim();
    if (!name || name.startsWith('#')) continue;
    if (i === 0 && TOKEN_HEADER_LABELS.has(name.toLowerCase())) continue;
    if (!/^--/.test(name)) name = `--wf-${name.replace(/^--?/, '')}`;
    const value = row[1];
    if (value == null || value === '') continue;
    out[name] = String(value).trim();
  }
  return out;
}

// ── personas tab ───────────────────────────────────────────────────────────
function parsePersonasTab(rows, warn) {
  const headerIdx = findHeaderRow(rows, ['id', 'label']);
  if (headerIdx === -1) {
    warn('personas tab has no `id, label` header row — skipping');
    return [];
  }
  const { objects } = rowsToObjects(rows, headerIdx);
  return objects.filter((o) => !isCommentRow(o)).map((o) => ({
    id: kebabCase(o.id),
    label: String(o.label || '').trim(),
    role: o.role || null,
    org: o.org || null,
    initials: o.initials || null,
    color: o.color || null,
    summary: o.summary || null,
    jtbd: splitListCell(o.jtbd),
    pains: splitListCell(o.pains),
    goals: splitListCell(o.goals),
  }));
}

// ── stories tab ────────────────────────────────────────────────────────────
function parseStoriesTab(rows, warn) {
  const headerIdx = findHeaderRow(rows, ['id', 'title']);
  if (headerIdx === -1) {
    warn('stories tab has no `id, title` header row — skipping');
    return [];
  }
  const { objects } = rowsToObjects(rows, headerIdx);
  return objects.filter((o) => !isCommentRow(o)).map((o) => ({
    id: String(o.id).trim(),
    title: String(o.title || '').trim(),
    kind: (o.kind && String(o.kind).trim()) || 'jtbd',
    personaId: o.personaId ? kebabCase(o.personaId) : null,
    summary: o.summary || null,
    status: o.status || null,
    pageIds: splitListCell(o.pageIds),
    criteria: splitListCell(o.criteria),
  }));
}

// ── flow tab (service blueprint) ───────────────────────────────────────────
// Extends eqPartners' format with parent/summary/whatChanges/ownerPersonaId/
// status meta rows for the leadership Overview view, and a childBlueprintId
// node column for drill-down.
function parseFlowTab(tabName, rows, warn) {
  if (!rows.length) {
    warn(`flow "${tabName}" is empty — skipping`);
    return null;
  }

  const metaRow = (label) => rows[findRowByLabel(rows, label)] || [];
  const titleRow = metaRow('meta:title');
  const phasesRow = metaRow('meta:phases');
  const lanesRow = metaRow('meta:lanes');
  const parentRow = metaRow('meta:parent');
  const summaryRow = metaRow('meta:summary');
  const whatChangesRow = metaRow('meta:whatchanges');
  const ownerRow = metaRow('meta:ownerpersonaid');
  const statusRow = metaRow('meta:status');

  const flowId = kebabCase(tabName);
  if (!flowId) {
    warn(`flow tab "${tabName}" produces empty flowId — skipping`);
    return null;
  }
  const title = (titleRow[1] || tabName).toString().trim();

  // Phases: comma-separated id list. Labels default to title-case of id.
  const phaseIds = (phasesRow[1] || '').toString().split(',').map((s) => s.trim()).filter(Boolean);
  if (!phaseIds.length) {
    warn(`flow "${tabName}" has no meta:phases — using single "main" phase`);
    phaseIds.push('main');
  }
  const phases = phaseIds.map((id) => ({
    id,
    label: id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' '),
  }));

  // Lanes: each cell after column A is `id[:tier[:actorGroup]]`
  const laneCells = lanesRow.slice(1).filter((c) => c != null && c !== '');
  if (!laneCells.length) {
    warn(`flow "${tabName}" has no meta:lanes — using single "default" lane`);
    laneCells.push('default');
  }
  const lanes = laneCells.map((spec) => {
    const [id, tier, actorGroup] = String(spec).split(':').map((s) => s && s.trim());
    const lane = { id, label: id.replace(/-/g, ' ') };
    if (tier) {
      if (!VALID_TIERS.has(tier)) {
        warn(`flow "${tabName}": invalid tier "${tier}" on lane "${id}" — dropping tier`);
      } else {
        lane.tier = tier;
      }
    }
    if (actorGroup) lane.actorGroup = actorGroup;
    return lane;
  });

  const headerIdx = findHeaderRow(rows, ['id', 'phase', 'lane']);
  if (headerIdx === -1) {
    warn(`flow "${tabName}" has no header row containing id/phase/lane — skipping`);
    return null;
  }
  const { headers, objects } = rowsToObjects(rows, headerIdx);

  const nodes = [];
  const csatCells = [];
  const edges = [];

  for (const obj of objects) {
    if (isCommentRow(obj)) continue;
    const lane = lanes.find((l) => l.id === obj.lane);
    if (!lane) {
      warn(`flow "${tabName}": row id "${obj.id}" references unknown lane "${obj.lane}"`);
      continue;
    }

    if (lane.tier === 'signal') {
      csatCells.push({
        phase: obj.phase,
        sentiment: { emoji: obj.sentimentEmoji || '·', label: obj.sentimentLabel || '' },
        note: obj.summary || '',
      });
      continue;
    }

    const node = {
      id: String(obj.id).trim(),
      phase: obj.phase,
      lane: obj.lane,
      label: obj.label,
      summary: obj.summary || '',
      status: obj.status || 'draft',
    };
    if (obj.persona) node.persona = obj.persona;
    if (obj.pages) node.pages = splitListCell(obj.pages);
    if (obj.gapNotes) node.gapNotes = splitListCell(obj.gapNotes);
    if (obj.initiativeIds) node.initiativeIds = splitListCell(obj.initiativeIds);
    if (obj.childBlueprintId) node.childBlueprintId = kebabCase(obj.childBlueprintId);
    if (obj.lucidUrl) node.lucidUrl = String(obj.lucidUrl).trim();
    if (obj.lucidLabel) node.lucidLabel = String(obj.lucidLabel).trim();

    for (const pred of splitListCell(obj.predecessors)) {
      const m = pred.match(/^([^[]+)(?:\[([^\]]+)\])?$/);
      if (!m) continue;
      const predId = m[1].trim();
      const overrides = m[2]
        ? Object.fromEntries(m[2].split(',').map((p) => p.split('=').map((s) => s.trim())))
        : {};
      const edge = { from: predId, to: node.id, style: overrides.style || 'solid' };
      if (overrides.label) edge.label = overrides.label;
      edges.push(edge);
    }

    nodes.push(node);
  }

  // Auto-detect cross-tier improvement edges
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  for (const edge of edges) {
    if (edge.style === 'improvement') continue;
    const from = nodeById.get(edge.from);
    const to = nodeById.get(edge.to);
    if (!from || !to) continue;
    const fromLane = lanes.find((l) => l.id === from.lane);
    const toLane = lanes.find((l) => l.id === to.lane);
    if (!fromLane || !toLane) continue;
    if (fromLane.actorGroup && fromLane.actorGroup === toLane.actorGroup) {
      if (fromLane.tier === 'current' && toLane.tier === 'future') {
        edge.style = 'improvement';
      }
    }
  }

  // Attach CSAT cells to the signal lane
  const signalLane = lanes.find((l) => l.tier === 'signal');
  if (signalLane && csatCells.length) signalLane.cells = csatCells;

  const meta = { flowId, title };
  if (parentRow[1]) meta.parent = kebabCase(parentRow[1]);
  if (summaryRow[1]) meta.summary = String(summaryRow[1]).trim();
  if (whatChangesRow[1]) meta.whatChanges = splitListCell(whatChangesRow[1]);
  if (ownerRow[1]) meta.ownerPersonaId = kebabCase(ownerRow[1]);
  if (statusRow[1]) meta.status = String(statusRow[1]).trim().toLowerCase();

  return {
    meta,
    phases,
    lanes,
    nodes,
    edges,
    _stats: { nodes: nodes.length, edges: edges.length, csatCells: csatCells.length },
  };
}

// ── registry tab (underscore-prefixed) ─────────────────────────────────────
// Generic: any tab with `id` header row becomes a registry. Values keyed by id.
function parseRegistryTab(tabName, rows, warn) {
  const headerIdx = findHeaderRow(rows, ['id']);
  if (headerIdx === -1) {
    warn(`registry tab "${tabName}" has no \`id\` header row — skipping`);
    return null;
  }
  const { headers, objects } = rowsToObjects(rows, headerIdx);
  const out = {};
  for (const obj of objects) {
    if (isCommentRow(obj)) continue;
    const id = String(obj.id).trim();
    if (!id) continue;
    const entry = {};
    for (const key of headers) {
      if (!key || key === 'id') continue;
      const v = obj[key];
      if (v == null || v === '') continue;
      entry[key] = v;
    }
    out[id] = entry;
  }
  const name = String(tabName).replace(/^_/, '');
  return { name, data: out };
}

module.exports = {
  parseMetaTab,
  parsePagesTab,
  parseTokensTab,
  parsePersonasTab,
  parseStoriesTab,
  parseFlowTab,
  parseRegistryTab,
};
