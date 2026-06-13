/**
 * Pure operations on a BlueprintFlow. Every op returns a new flow object —
 * never mutates input. Each op is independently undoable via the snapshot
 * history stack maintained in the canvas component.
 */

function clone(flow) {
  return JSON.parse(JSON.stringify(flow));
}

function uniqueId(flow, base) {
  const ids = new Set([
    ...(flow.nodes || []).map((n) => n.id),
    ...(flow.lanes || []).map((l) => l.id),
    ...(flow.phases || []).map((p) => p.id),
  ]);
  let id = base;
  let suffix = 2;
  while (ids.has(id)) id = `${base}-${suffix++}`;
  return id;
}

// ── Node operations ────────────────────────────────────────────────────────

export function moveNode(flow, nodeId, newLane, newPhase) {
  const next = clone(flow);
  const node = next.nodes.find((n) => n.id === nodeId);
  if (!node) return flow;
  if (newLane) node.lane = newLane;
  if (newPhase) node.phase = newPhase;
  return next;
}

export function renameNode(flow, nodeId, label) {
  const next = clone(flow);
  const node = next.nodes.find((n) => n.id === nodeId);
  if (!node) return flow;
  node.label = label;
  return next;
}

export function setNodeField(flow, nodeId, field, value) {
  const next = clone(flow);
  const node = next.nodes.find((n) => n.id === nodeId);
  if (!node) return flow;
  if (value === '' || value == null) delete node[field];
  else node[field] = value;
  return next;
}

export function addNode(flow, { laneId, phaseId, label = 'New step' }) {
  const next = clone(flow);
  const id = uniqueId(next, kebab(`${laneId}-${label}`));
  next.nodes = next.nodes || [];
  next.nodes.push({
    id, lane: laneId, phase: phaseId, label, summary: '', status: 'draft',
  });
  return { flow: next, nodeId: id };
}

export function removeNode(flow, nodeId) {
  const next = clone(flow);
  next.nodes = (next.nodes || []).filter((n) => n.id !== nodeId);
  next.edges = (next.edges || []).filter((e) => e.from !== nodeId && e.to !== nodeId);
  return next;
}

// ── Edge operations ────────────────────────────────────────────────────────

export function addEdge(flow, from, to, style = 'solid') {
  if (from === to) return flow;
  const next = clone(flow);
  next.edges = next.edges || [];
  if (next.edges.some((e) => e.from === from && e.to === to)) return flow;
  next.edges.push({ from, to, style });
  return next;
}

export function removeEdge(flow, from, to) {
  const next = clone(flow);
  next.edges = (next.edges || []).filter((e) => !(e.from === from && e.to === to));
  return next;
}

// ── Lane operations ────────────────────────────────────────────────────────

export function addLane(flow, { label = 'New lane', tier = null, after = null } = {}) {
  const next = clone(flow);
  const id = uniqueId(next, kebab(label));
  const lane = { id, label };
  if (tier) lane.tier = tier;
  next.lanes = next.lanes || [];
  if (after) {
    const idx = next.lanes.findIndex((l) => l.id === after);
    if (idx >= 0) next.lanes.splice(idx + 1, 0, lane);
    else next.lanes.push(lane);
  } else {
    next.lanes.push(lane);
  }
  return { flow: next, laneId: id };
}

export function removeLane(flow, laneId) {
  const next = clone(flow);
  next.lanes = (next.lanes || []).filter((l) => l.id !== laneId);
  // Drop nodes in the removed lane (with their edges).
  const dropped = new Set((flow.nodes || []).filter((n) => n.lane === laneId).map((n) => n.id));
  next.nodes = (next.nodes || []).filter((n) => !dropped.has(n.id));
  next.edges = (next.edges || []).filter((e) => !dropped.has(e.from) && !dropped.has(e.to));
  return next;
}

export function renameLane(flow, laneId, label) {
  const next = clone(flow);
  const lane = next.lanes.find((l) => l.id === laneId);
  if (!lane) return flow;
  lane.label = label;
  return next;
}

export function reorderLane(flow, laneId, newIndex) {
  const next = clone(flow);
  const idx = next.lanes.findIndex((l) => l.id === laneId);
  if (idx < 0) return flow;
  const [lane] = next.lanes.splice(idx, 1);
  next.lanes.splice(Math.max(0, Math.min(next.lanes.length, newIndex)), 0, lane);
  return next;
}

// ── Phase operations ───────────────────────────────────────────────────────

export function addPhase(flow, { label = 'New phase', after = null } = {}) {
  const next = clone(flow);
  const id = uniqueId(next, kebab(label));
  const phase = { id, label };
  next.phases = next.phases || [];
  if (after) {
    const idx = next.phases.findIndex((p) => p.id === after);
    if (idx >= 0) next.phases.splice(idx + 1, 0, phase);
    else next.phases.push(phase);
  } else {
    next.phases.push(phase);
  }
  return { flow: next, phaseId: id };
}

export function removePhase(flow, phaseId) {
  const next = clone(flow);
  next.phases = (next.phases || []).filter((p) => p.id !== phaseId);
  const dropped = new Set((flow.nodes || []).filter((n) => n.phase === phaseId).map((n) => n.id));
  next.nodes = (next.nodes || []).filter((n) => !dropped.has(n.id));
  next.edges = (next.edges || []).filter((e) => !dropped.has(e.from) && !dropped.has(e.to));
  return next;
}

export function renamePhase(flow, phaseId, label) {
  const next = clone(flow);
  const phase = next.phases.find((p) => p.id === phaseId);
  if (!phase) return flow;
  phase.label = label;
  return next;
}

export function reorderPhase(flow, phaseId, newIndex) {
  const next = clone(flow);
  const idx = next.phases.findIndex((p) => p.id === phaseId);
  if (idx < 0) return flow;
  const [phase] = next.phases.splice(idx, 1);
  next.phases.splice(Math.max(0, Math.min(next.phases.length, newIndex)), 0, phase);
  return next;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function kebab(s) {
  return String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
