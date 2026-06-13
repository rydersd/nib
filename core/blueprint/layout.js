/**
 * Layout: BlueprintFlow → { rfNodes, rfEdges } with computed x/y positions.
 * The grid is phase columns × lane rows. Sentiment lanes show CSAT cells
 * pinned to phase columns; ordinary lanes pack their nodes into the cell
 * (left-to-right) with vertical wrap when more than `maxPerCell` exist.
 */

const PHASE_W = 220;
const PHASE_H = 44;
const LANE_LABEL_W = 160;
const CARD_W = 200;
const CARD_H = 96;
const CSAT_H = 64;
const LANE_PAD_Y = 12;
const ROW_GAP = 8;

export function computeLayout(flow, viewMode = 'detail') {
  const phases = flow.phases || [];
  const lanes = flow.lanes || [];
  const nodes = flow.nodes || [];
  const edges = flow.edges || [];

  // Compute lane y positions + heights based on node packing.
  const nodesByLanePhase = new Map();
  for (const node of nodes) {
    const key = node.lane + '::' + node.phase;
    if (!nodesByLanePhase.has(key)) nodesByLanePhase.set(key, []);
    nodesByLanePhase.get(key).push(node);
  }

  const laneHeights = {};
  for (const lane of lanes) {
    if (lane.tier === 'signal') {
      laneHeights[lane.id] = CSAT_H + LANE_PAD_Y * 2;
      continue;
    }
    let maxStack = 1;
    for (const phase of phases) {
      const stack = (nodesByLanePhase.get(lane.id + '::' + phase.id) || []).length;
      if (stack > maxStack) maxStack = stack;
    }
    if (viewMode === 'overview') {
      // Compact each lane to a single row in Overview mode.
      laneHeights[lane.id] = CARD_H + LANE_PAD_Y * 2;
    } else {
      laneHeights[lane.id] = maxStack * (CARD_H + ROW_GAP) - ROW_GAP + LANE_PAD_Y * 2;
    }
  }

  const laneY = {};
  let cursorY = PHASE_H;
  for (const lane of lanes) {
    laneY[lane.id] = cursorY;
    cursorY += laneHeights[lane.id];
  }
  const totalH = cursorY;
  const totalW = LANE_LABEL_W + phases.length * PHASE_W;

  const rfNodes = [];

  // Phase header nodes
  phases.forEach((phase, i) => {
    rfNodes.push({
      id: `__phase-${phase.id}`,
      type: 'phase',
      draggable: false,
      selectable: false,
      position: { x: LANE_LABEL_W + i * PHASE_W, y: 0 },
      style: { width: PHASE_W, height: PHASE_H, zIndex: 5 },
      data: { phaseId: phase.id, label: phase.label, accent: 'rgba(60, 100, 170, 0.06)' },
    });
  });

  // Lane band nodes (full-width, behind cards)
  for (const lane of lanes) {
    rfNodes.push({
      id: `__lane-${lane.id}`,
      type: 'lane',
      draggable: false,
      selectable: false,
      position: { x: 0, y: laneY[lane.id] },
      style: { width: totalW, height: laneHeights[lane.id], zIndex: 0 },
      data: {
        laneId: lane.id,
        label: lane.label || lane.id,
        tier: lane.tier,
        accent: lane.accent || tierAccent(lane.tier),
      },
    });
  }

  // Phase column watermarks (vertical dashed dividers)
  phases.forEach((phase, i) => {
    rfNodes.push({
      id: `__col-${phase.id}`,
      type: 'phaseColumn',
      draggable: false,
      selectable: false,
      position: { x: LANE_LABEL_W + i * PHASE_W, y: PHASE_H },
      style: { width: PHASE_W, height: totalH - PHASE_H, zIndex: 1 },
      data: { label: phase.label },
    });
  });

  // Sentiment cells (signal lanes)
  for (const lane of lanes) {
    if (lane.tier !== 'signal') continue;
    const cells = lane.cells || [];
    for (const cell of cells) {
      const phaseIdx = phases.findIndex((p) => p.id === cell.phase);
      if (phaseIdx === -1) continue;
      rfNodes.push({
        id: `__csat-${lane.id}-${cell.phase}`,
        type: 'csatCell',
        draggable: false,
        selectable: false,
        position: {
          x: LANE_LABEL_W + phaseIdx * PHASE_W + 12,
          y: laneY[lane.id] + LANE_PAD_Y,
        },
        style: { width: PHASE_W - 24, height: CSAT_H, zIndex: 3 },
        data: {
          sentiment: cell.sentiment || {},
          note: cell.note || '',
          // Viewer features read these — evidence drives the chip + drawer;
          // phase / lane label title the drawer. Editor ignores them.
          evidence: Array.isArray(cell.evidence) ? cell.evidence : [],
          phase: cell.phase,
          phaseLabel: (phases.find((p) => p.id === cell.phase) || {}).label || cell.phase,
          laneLabel: lane.label || lane.id,
        },
      });
    }
  }

  // Journey cards
  const cellCounter = new Map();
  for (const node of nodes) {
    const phaseIdx = phases.findIndex((p) => p.id === node.phase);
    if (phaseIdx === -1) continue;
    const key = node.lane + '::' + node.phase;
    const stackIdx = cellCounter.get(key) || 0;
    cellCounter.set(key, stackIdx + 1);
    if (viewMode === 'overview' && stackIdx > 0) continue; // Show only first card per cell in overview.

    rfNodes.push({
      id: node.id,
      type: 'journeyNode',
      position: {
        x: LANE_LABEL_W + phaseIdx * PHASE_W + 10,
        y: laneY[node.lane] + LANE_PAD_Y + stackIdx * (CARD_H + ROW_GAP),
      },
      style: { width: CARD_W, height: CARD_H, zIndex: 4 },
      data: {
        id: node.id,
        label: node.label,
        summary: node.summary,
        status: node.status,
        persona: node.persona,
        gapNotes: node.gapNotes,
        initiativeIds: node.initiativeIds,
        childBlueprintId: node.childBlueprintId,
        editing: false,
      },
    });
  }

  const rfEdges = edges.map((e, i) => ({
    id: `e-${i}-${e.from}-${e.to}`,
    source: e.from,
    target: e.to,
    label: e.label,
    style: edgeStyle(e.style),
    animated: e.style === 'improvement',
  }));

  return {
    rfNodes,
    rfEdges,
    canvasSize: { width: totalW, height: totalH },
  };
}

function tierAccent(tier) {
  switch (tier) {
    case 'current': return 'rgba(70, 95, 135, 0.05)';
    case 'future':  return 'rgba(60, 130, 90, 0.05)';
    case 'signal':  return 'rgba(180, 145, 70, 0.06)';
    default:        return 'transparent';
  }
}

function edgeStyle(style) {
  if (style === 'dashed') return { stroke: '#7d8b9f', strokeDasharray: '6 4', strokeWidth: 1.5 };
  if (style === 'improvement') return { stroke: '#3d6daa', strokeWidth: 2 };
  return { stroke: '#7d8b9f', strokeWidth: 1.5 };
}

export const LAYOUT_CONSTANTS = {
  PHASE_W,
  PHASE_H,
  LANE_LABEL_W,
  CARD_W,
  CARD_H,
  CSAT_H,
  LANE_PAD_Y,
  ROW_GAP,
};
