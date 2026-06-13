/**
 * Service blueprint canvas — React Flow wrapper.
 *
 * Two complementary halves, both shipped here:
 *  - EDITOR  (default) — drag-to-relane, inline rename, add/remove lanes
 *    & phases & edges, undo/redo, JSON/YAML/XLSX round-trip export,
 *    breadcrumb drill-down through nested blueprints.
 *  - VIEWER  (opt-in)  — analytical features back-ported from eqPartners'
 *    journey.js: text search + browser-find, the filter rail, the persona
 *    key (raise / knock-back), the sentiment-evidence drawer, and
 *    thumbnail interaction cards.
 *
 * The viewer features are ADDITIVE and OPTIONAL — gated by mountCanvas
 * options. The editor still works exactly as before with no options.
 *
 * Usage (from a module script in the page):
 *
 *   import { mountCanvas } from '../../core/blueprint/canvas.js';
 *   mountCanvas(document.getElementById('canvas'), {
 *     blueprints: window.NIB_BLUEPRINTS,        // { flowId: BlueprintFlow }
 *     index: window.NIB_BLUEPRINT_INDEX,        // { ids, tree }
 *     rootFlowId: 'program',                    // initial flow
 *     adapter: localStorageAdapter('my-proj'),  // optional persistence
 *
 *     // ── optional viewer features ──────────────────────────────────
 *     mode: 'editor',        // 'editor' (default) | 'viewer' (read-only)
 *     search: false,         // enable text search + browser-find nav
 *     filterRail: false,     // enable the <details>-popover filter rail
 *     personaKey: false,     // enable the persona-key raise/knock panel
 *     personas: {},          // { id: { label?, color? } } — data-driven
 *   });
 *
 * Loads React + React Flow from esm.sh — no bundler required.
 */

import * as React from 'https://esm.sh/react@18.3.1';
import * as ReactDOM from 'https://esm.sh/react-dom@18.3.1/client';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  Handle,
  Position,
  addEdge as rfAddEdge,
} from 'https://esm.sh/@xyflow/react@12.3.5?deps=react@18.3.1,react-dom@18.3.1';

import { makeNodeTypes } from './node-types.js';
import { computeLayout, LAYOUT_CONSTANTS } from './layout.js';
import * as ops from './operations.js';
import { createHistory } from './history.js';
import { exportJson, exportYaml, exportXlsx, exportXlsxBundle, downloadBlob } from './exporters.js';
import { localStorageAdapter, debounced, noopAdapter } from './sync-adapter.js';
import { INTERACTION_PHRASE } from './node-types.js';
import { evidenceChip } from './evidence.js';
import {
  searchTerms, textMatchesTerms, nodeSearchText, cellSearchText,
  orderedNodeMatches, stepMatchIndex, centerOnNode as panToNode,
} from './search.js';
import {
  EMPTY_FILTERS, isFilterActive, availableFacets,
  passesNodeFilters, isLaneVisible, makeFilterRail,
} from './filter-rail.js';

(function injectReactFlowCss() {
  if (document.querySelector('link[data-rf-css]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://esm.sh/@xyflow/react@12.3.5/dist/style.css';
  link.setAttribute('data-rf-css', '1');
  document.head.appendChild(link);
})();

const { useState, useEffect, useMemo, useCallback, useRef, createElement: h, Fragment } = React;
const { FilterRail } = makeFilterRail({ React });

// ── Persona config helpers ───────────────────────────────────────────────────
// Nib projects pass `personas` (from data/personas.js) into mountCanvas.
// Accepts either { id: { label, color } } or { id: 'Label' }. Splits it into
// the two flat maps the node types + filter rail want.
function splitPersonaConfig(personas) {
  const colors = {};
  const labels = {};
  for (const [id, v] of Object.entries(personas || {})) {
    if (v && typeof v === 'object') {
      if (v.color) colors[id] = v.color;
      if (v.label) labels[id] = v.label;
    } else if (typeof v === 'string') {
      labels[id] = v;
    }
  }
  return { personaColors: colors, personaLabels: labels };
}

// ── Toolbar ────────────────────────────────────────────────────────────────
function Toolbar({
  flow, breadcrumb, viewMode, readOnly,
  canUndo, canRedo,
  onUndo, onRedo, onSetView, onAddLane, onAddPhase,
  onExportJson, onExportYaml, onExportXlsx, onExportBundle,
  onDrillUp, onDrillRoot,
  filterRail,
}) {
  return h(
    'div',
    { className: 'nib-bp-toolbar' },
    h('div', { className: 'nib-bp-bc' },
      h('button', { className: 'nib-bp-bc-btn', onClick: onDrillRoot, title: 'Back to root' }, '⌂'),
      breadcrumb.map((b, i) => h(
        Fragment, { key: b.flowId },
        h('span', { className: 'nib-bp-bc-sep' }, '/'),
        i === breadcrumb.length - 1
          ? h('span', { className: 'nib-bp-bc-current' }, b.label)
          : h('button', { className: 'nib-bp-bc-btn', onClick: () => onDrillUp(i) }, b.label)
      ))
    ),
    h('div', { className: 'nib-bp-toolbar-mid' },
      filterRail || null,
      h('div', { className: 'nib-bp-segctl', role: 'tablist' },
        ['overview', 'detail'].map((m) => h('button', {
          key: m,
          className: 'nib-bp-segbtn' + (viewMode === m ? ' is-active' : ''),
          onClick: () => onSetView(m),
        }, m === 'overview' ? 'Overview' : 'Detail'))
      ),
    ),
    h('div', { className: 'nib-bp-toolbar-actions' },
      readOnly ? null : h('button', { className: 'nib-bp-btn', onClick: onUndo, disabled: !canUndo, title: 'Undo (⌘Z)' }, '↶'),
      readOnly ? null : h('button', { className: 'nib-bp-btn', onClick: onRedo, disabled: !canRedo, title: 'Redo (⇧⌘Z)' }, '↷'),
      readOnly ? null : h('button', { className: 'nib-bp-btn', onClick: onAddLane, title: 'Add lane' }, '+ Lane'),
      readOnly ? null : h('button', { className: 'nib-bp-btn', onClick: onAddPhase, title: 'Add phase' }, '+ Phase'),
      h('div', { className: 'nib-bp-menu' },
        h('button', { className: 'nib-bp-btn' }, 'Export ▾'),
        h('div', { className: 'nib-bp-menu-list' },
          h('button', { onClick: onExportJson }, 'JSON (this flow)'),
          h('button', { onClick: onExportYaml }, 'YAML (this flow)'),
          h('button', { onClick: onExportXlsx }, 'XLSX (this flow)'),
          h('button', { onClick: onExportBundle }, 'XLSX (all flows — round-trip)')
        )
      )
    )
  );
}

// ── Overview cards (leadership view) ───────────────────────────────────────
function OverviewSummary({ flow, allFlows, onDrillIn }) {
  const meta = flow.meta || {};
  const children = Object.values(allFlows || {}).filter((f) => f.meta && f.meta.parent === meta.flowId);
  return h(
    'div',
    { className: 'nib-bp-overview' },
    h('div', { className: 'nib-bp-overview-card' },
      h('div', { className: 'nib-bp-overview-title' }, meta.title || meta.flowId),
      meta.summary
        ? h('p', { className: 'nib-bp-overview-summary' }, meta.summary)
        : null,
      meta.whatChanges && meta.whatChanges.length
        ? h('ul', { className: 'nib-bp-overview-changes' },
            meta.whatChanges.map((c, i) => h('li', { key: i }, c)))
        : null,
      h('div', { className: 'nib-bp-overview-foot' },
        meta.ownerPersonaId ? h('span', null, 'Owner: ', h('strong', null, meta.ownerPersonaId)) : null,
        meta.status ? h('span', { className: `nib-bp-pill is-${meta.status}` }, meta.status) : null
      )
    ),
    children.length
      ? h('div', { className: 'nib-bp-overview-children' },
          h('div', { className: 'nib-bp-overview-children-h' }, 'Drill into:'),
          children.map((c) => h('button', {
            key: c.meta.flowId,
            className: 'nib-bp-overview-child',
            onClick: () => onDrillIn(c.meta.flowId),
          },
            h('div', { className: 'nib-bp-overview-child-t' }, c.meta.title || c.meta.flowId),
            c.meta.summary ? h('div', { className: 'nib-bp-overview-child-s' }, c.meta.summary) : null
          )))
      : null
  );
}

// ── Sentiment evidence drawer (viewer feature) ─────────────────────────────
// Lightweight modal showing a CSAT cell's full note + its evidence[] list.
function SentimentDrawer({ cell, onClose }) {
  if (!cell) return null;
  const sentiment = cell.sentiment || {};
  const evidence = Array.isArray(cell.evidence) ? cell.evidence : [];
  return h(
    'div',
    { className: 'nib-bp-csat-drawer-overlay', onClick: onClose },
    h(
      'div',
      {
        className: 'nib-bp-csat-drawer',
        onClick: (e) => e.stopPropagation(),
        role: 'dialog', 'aria-label': 'Sentiment evidence',
      },
      h(
        'div',
        { className: 'nib-bp-csat-drawer-hd' },
        h(
          'div',
          { className: 'nib-bp-csat-drawer-hd-left' },
          h('span', { className: 'nib-bp-csat-drawer-emoji', 'aria-hidden': 'true' }, sentiment.emoji || '·'),
          h(
            'div',
            { className: 'nib-bp-csat-drawer-title-stack' },
            h('span', { className: 'nib-bp-csat-drawer-eyebrow' },
              `${cell.laneLabel || 'Sentiment'} · ${cell.phaseLabel || cell.phase || ''}`),
            h('span', { className: 'nib-bp-csat-drawer-title' }, sentiment.label || '')
          )
        ),
        h('button', { className: 'nib-bp-csat-drawer-close', onClick: onClose, 'aria-label': 'Close' }, '✕')
      ),
      h(
        'div',
        { className: 'nib-bp-csat-drawer-bd' },
        h('p', null, cell.note || ''),
        h('h4', null, 'Backing'),
        evidence.length
          ? h(
              'ul',
              { className: 'nib-bp-csat-drawer-evidence-list' },
              ...evidence.map((ev, i) => {
                const chip = evidenceChip(ev);
                return h(
                  'li',
                  { key: i, className: 'nib-bp-csat-drawer-evidence-item' },
                  h(
                    'div',
                    { className: 'kind-row' },
                    h('span', { className: `nib-bp-csat-evidence-chip ${chip.cls}` }, chip.label),
                    ev.label ? h('span', { className: 'label' }, ev.label) : null
                  ),
                  ev.sourceUrl
                    ? h('div', { className: 'source' },
                        h('a', { href: ev.sourceUrl, target: '_blank', rel: 'noreferrer' }, 'View source ↗'))
                    : (ev.source ? h('div', { className: 'source' }, h('code', null, ev.source)) : null)
                );
              })
            )
          : h(
              'div',
              { className: 'nib-bp-csat-drawer-evidence-empty' },
              'No evidence recorded yet — this note is an author-constructed scenario detail. '
              + 'Add a cell.evidence entry to cite a research session, spec doc, or design rationale.'
            )
      )
    )
  );
}

// ── Persona key panel (viewer feature) ─────────────────────────────────────
// Collapsible legend; clicking a persona raises matching cards and knocks
// others back. Writes filters.personas (same channel the filter rail uses).
function PersonaKey({ personaIds, personaColors, personaLabels, selected, onToggle }) {
  const [open, setOpen] = useState(true);
  if (!personaIds.length) return null;
  return h(
    Panel,
    { position: 'bottom-right', className: 'nib-bp-legend-panel' + (open ? '' : ' is-collapsed') },
    h(
      'button',
      {
        className: 'nib-bp-legend-toggle',
        onClick: () => setOpen((o) => !o),
        'aria-expanded': open,
        title: open ? 'Collapse persona key' : 'Expand persona key',
      },
      h('span', { className: 'nib-bp-legend-chevron' }, open ? '▾' : '▸'),
      'Persona key'
    ),
    h(
      'div',
      { className: 'nib-bp-legend-body' },
      personaIds.map((id) => h(
        'div',
        {
          key: id,
          className: 'nib-bp-legend-row' + (selected.includes(id) ? ' is-on' : ''),
          role: 'button',
          tabIndex: 0,
          'aria-pressed': selected.includes(id),
          title: 'Raise ' + (personaLabels[id] || id) + ' on the blueprint',
          onClick: () => onToggle(id),
          onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(id); } },
        },
        h('span', {
          className: 'nib-bp-legend-swatch',
          style: { '--persona-color': personaColors[id] || 'var(--wf-muted)' },
        }),
        personaLabels[id] || id
      ))
    )
  );
}

// ── Main canvas component ──────────────────────────────────────────────────
function BlueprintCanvas({ blueprints, index, rootFlowId, adapter, viewerOpts, personaConfig }) {
  const readOnly = viewerOpts.mode === 'viewer';
  const { personaColors, personaLabels } = personaConfig;
  const nodeTypes = useMemo(
    () => makeNodeTypes({ React, Handle, Position, personaColors, personaLabels }),
    [personaColors, personaLabels]
  );

  const [drillStack, setDrillStack] = useState([rootFlowId]);
  const currentFlowId = drillStack[drillStack.length - 1];
  const [viewMode, setViewMode] = useState('overview');
  const [editingNodeId, setEditingNodeId] = useState(null);
  const historyRefs = useRef({}); // flowId → history

  // Viewer state — filters, search cursor, open sentiment drawer.
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS });
  const [matchIndex, setMatchIndex] = useState(-1);
  const [openCsat, setOpenCsat] = useState(null);
  const rfInstanceRef = useRef(null);

  // Initial flow snapshot. If adapter has a saved version, use it.
  const [flow, setFlow] = useState(blueprints[currentFlowId]);

  // Re-bind history + flow on drill or first-mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = adapter ? await adapter.load(currentFlowId) : null;
      if (cancelled) return;
      const initial = stored || blueprints[currentFlowId];
      if (!historyRefs.current[currentFlowId]) {
        historyRefs.current[currentFlowId] = createHistory(initial);
      } else {
        historyRefs.current[currentFlowId].replace(initial);
      }
      setFlow(initial);
    })();
    return () => { cancelled = true; };
  }, [currentFlowId]);

  const history = historyRefs.current[currentFlowId];

  const apply = useCallback((nextFlow) => {
    history.set(nextFlow);
    setFlow(nextFlow);
    if (adapter) adapter.save(currentFlowId, nextFlow);
  }, [currentFlowId, adapter, history]);

  const undo = useCallback(() => { setFlow(history.undo()); }, [history]);
  const redo = useCallback(() => { setFlow(history.redo()); }, [history]);

  // Drill helpers
  const drillIn = useCallback((childId) => {
    if (!blueprints[childId]) return;
    setDrillStack((s) => [...s, childId]);
  }, [blueprints]);
  const drillUp = useCallback((targetIdx) => {
    setDrillStack((s) => s.slice(0, targetIdx + 1));
  }, []);
  const drillRoot = useCallback(() => setDrillStack([rootFlowId]), [rootFlowId]);

  const breadcrumb = useMemo(() =>
    drillStack.map((id) => ({ flowId: id, label: (blueprints[id] && blueprints[id].meta.title) || id }))
  , [drillStack, blueprints]);

  // Layout
  const { rfNodes, rfEdges, canvasSize } = useMemo(() => {
    if (!flow) return { rfNodes: [], rfEdges: [], canvasSize: { width: 800, height: 600 } };
    return computeLayout(flow, viewMode);
  }, [flow, viewMode]);

  // Whether any viewer feature wants per-node decoration (search / filter).
  const viewerActive = viewerOpts.search || viewerOpts.filterRail || viewerOpts.personaKey;

  // ── Search ─────────────────────────────────────────────────────────────
  const searchCtx = useMemo(() => ({ interactionPhrase: INTERACTION_PHRASE, personaLabels }), [personaLabels]);
  const positionsById = useMemo(() => {
    const m = {};
    for (const n of rfNodes) if (n.type === 'journeyNode') m[n.id] = n.position;
    return m;
  }, [rfNodes]);
  const searchMatches = useMemo(() => {
    if (!viewerOpts.search || !flow) return [];
    const terms = searchTerms(filters.query);
    if (!terms.length) return [];
    return orderedNodeMatches(flow.nodes || [], positionsById, terms, searchCtx);
  }, [viewerOpts.search, flow, filters.query, positionsById, searchCtx]);
  const currentMatchId = (matchIndex >= 0 && searchMatches[matchIndex]) || null;

  // Reset the find cursor whenever the query changes.
  useEffect(() => { setMatchIndex(-1); }, [filters.query]);

  const goToMatch = useCallback((dir) => {
    if (!searchMatches.length) return;
    const next = stepMatchIndex(matchIndex, dir, searchMatches.length);
    setMatchIndex(next);
    const id = searchMatches[next];
    const rn = rfNodes.find((n) => n.id === id);
    panToNode(rfInstanceRef.current, rn);
  }, [searchMatches, matchIndex, rfNodes]);

  // ── Esc-clears-filter (viewer feature) ─────────────────────────────────
  // First press closes any open filter popover; with none open, resets all
  // filters + search back to the unfiltered blueprint.
  useEffect(() => {
    if (!viewerActive) return undefined;
    function onKey(e) {
      if (e.key !== 'Escape') return;
      const open = document.querySelectorAll('details.nib-bp-filter-pop[open]');
      if (open.length) {
        open.forEach((d) => d.removeAttribute('open'));
        e.stopPropagation();
        return;
      }
      if (isFilterActive(filters)) {
        setFilters({ ...EMPTY_FILTERS });
        e.stopPropagation();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [viewerActive, filters]);

  // ── Filter facets + lane-by-id ─────────────────────────────────────────
  const facets = useMemo(() => availableFacets(flow), [flow]);
  const lanesById = useMemo(() => {
    const m = new Map();
    for (const l of (flow && flow.lanes) || []) m.set(l.id, l);
    return m;
  }, [flow]);

  // Decorate node data with editing handlers + viewer flags.
  const decoratedNodes = useMemo(() => {
    if (!flow) return [];
    const searchTermList = viewerOpts.search ? searchTerms(filters.query) : [];
    const searchOn = searchTermList.length > 0;
    const personaSel = (viewerOpts.filterRail || viewerOpts.personaKey) ? (filters.personas || []) : [];
    const raiseActive = personaSel.length > 0;

    return rfNodes.map((n) => {
      if (n.type === 'lane') {
        return { ...n, data: {
          ...n.data,
          editable: !readOnly,
          onRenameLane: (laneId, label) => apply(ops.renameLane(flow, laneId, label)),
          onRemoveLane: (laneId) => {
            if (confirm(`Remove lane "${laneId}" and all its nodes?`)) apply(ops.removeLane(flow, laneId));
          },
        } };
      }
      if (n.type === 'phase') {
        return { ...n, data: {
          ...n.data,
          editable: !readOnly,
          onRenamePhase: (phaseId, label) => apply(ops.renamePhase(flow, phaseId, label)),
          onRemovePhase: (phaseId) => {
            if (confirm(`Remove phase "${phaseId}" and all its nodes?`)) apply(ops.removePhase(flow, phaseId));
          },
        } };
      }
      if (n.type === 'csatCell') {
        if (!viewerOpts.search) return n;
        const dimmed = searchOn && !textMatchesTerms(cellSearchText(n.data), searchTermList);
        return { ...n, data: { ...n.data, searchDimmed: dimmed } };
      }
      if (n.type === 'journeyNode') {
        const node = (flow.nodes || []).find((x) => x.id === n.data.id) || n.data;
        const lane = lanesById.get(node.lane);
        const dimmed = viewerOpts.filterRail
          ? !passesNodeFilters(node, lane, filters, blueprints && blueprints.__initiatives)
          : false;
        const raised = raiseActive && personaSel.includes(node.persona);
        const knockedBack = raiseActive && !personaSel.includes(node.persona);
        const searchDimmed = searchOn && !dimmed
          && !textMatchesTerms(nodeSearchText(node, searchCtx), searchTermList);
        const isSearchCurrent = n.id === currentMatchId;
        return {
          ...n,
          zIndex: isSearchCurrent ? 25 : raised ? 20 : n.style && n.style.zIndex,
          data: {
            ...n.data,
            // viewer flags
            dimmed, raised, knockedBack, searchDimmed, isSearchCurrent,
            // pass-through extras the card may want
            thumbnail: node.thumbnail,
            persona: node.persona,
            initiativeIds: node.initiativeIds,
            // editor handlers
            editing: editingNodeId === n.data.id,
            onEditNode: readOnly ? undefined : (id) => setEditingNodeId(id),
            onCommitEdit: (id, label) => {
              setEditingNodeId(null);
              if (!readOnly && label && label.trim()) apply(ops.renameNode(flow, id, label.trim()));
            },
            onDrillIn: (childId) => drillIn(childId),
          },
        };
      }
      return n;
    });
  }, [rfNodes, flow, editingNodeId, apply, drillIn, readOnly, viewerOpts, filters,
      lanesById, searchCtx, currentMatchId, blueprints]);

  // Handlers (editor)
  const onNodeDragStop = useCallback((_evt, dragged) => {
    if (readOnly || dragged.type !== 'journeyNode' || !flow) return;
    const targetLane = laneAtY(flow, dragged.position.y);
    const targetPhase = phaseAtX(flow, dragged.position.x);
    if (!targetLane || !targetPhase) return;
    const node = flow.nodes.find((n) => n.id === dragged.id);
    if (!node || (node.lane === targetLane && node.phase === targetPhase)) return;
    apply(ops.moveNode(flow, dragged.id, targetLane, targetPhase));
  }, [flow, apply, readOnly]);

  const onConnect = useCallback((conn) => {
    if (readOnly || !conn.source || !conn.target) return;
    apply(ops.addEdge(flow, conn.source, conn.target));
  }, [flow, apply, readOnly]);

  const onEdgesDelete = useCallback((deleted) => {
    if (readOnly) return;
    let next = flow;
    for (const e of deleted) next = ops.removeEdge(next, e.source, e.target);
    if (next !== flow) apply(next);
  }, [flow, apply, readOnly]);

  const onNodesDelete = useCallback((deleted) => {
    if (readOnly) return;
    let next = flow;
    for (const n of deleted) {
      if (n.type === 'journeyNode') next = ops.removeNode(next, n.id);
    }
    if (next !== flow) apply(next);
  }, [flow, apply, readOnly]);

  // Toolbar callbacks
  const addLane = useCallback(() => {
    const label = prompt('Lane label:', 'New lane');
    if (!label) return;
    const tier = prompt('Tier (current / future / signal / —):', '—');
    const result = ops.addLane(flow, { label, tier: tier && tier !== '—' ? tier : null });
    apply(result.flow);
  }, [flow, apply]);

  const addPhase = useCallback(() => {
    const label = prompt('Phase label:', 'New phase');
    if (!label) return;
    const result = ops.addPhase(flow, { label });
    apply(result.flow);
  }, [flow, apply]);

  const onExportJson = useCallback(() => {
    downloadBlob(exportJson(flow), `${flow.meta.flowId}.json`, 'application/json');
  }, [flow]);
  const onExportYaml = useCallback(async () => {
    const text = await exportYaml(flow);
    downloadBlob(text, `${flow.meta.flowId}.yaml`, 'text/yaml');
  }, [flow]);
  const onExportXlsx = useCallback(async () => {
    const buf = await exportXlsx(flow);
    downloadBlob(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `${flow.meta.flowId}.xlsx`);
  }, [flow]);
  const onExportBundle = useCallback(async () => {
    const all = {};
    for (const id of Object.keys(blueprints)) {
      if (id.startsWith('__')) continue;
      const hist = historyRefs.current[id];
      all[id] = hist ? hist.get() : blueprints[id];
    }
    const buf = await exportXlsxBundle(all);
    downloadBlob(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      'blueprints.xlsx');
  }, [blueprints]);

  // Keyboard shortcuts (editor)
  useEffect(() => {
    if (readOnly) return undefined;
    const handler = (e) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      else if (meta && (e.key === 'Z' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, readOnly]);

  // Sentiment-drawer open handler — only attached when search/filter viewer
  // features are on; otherwise cells stay decorative.
  const csatNodes = useMemo(() => {
    if (!viewerOpts.search && !viewerOpts.filterRail) return decoratedNodes;
    return decoratedNodes.map((n) => n.type === 'csatCell'
      ? { ...n, data: { ...n.data, onOpen: (d) => setOpenCsat(d) } }
      : n);
  }, [decoratedNodes, viewerOpts]);

  if (!flow) return h('div', { className: 'nib-bp-loading' }, 'Loading…');

  const allFlows = blueprints;

  // Persona toggle (used by both the persona key + filter rail).
  const togglePersona = (id) => setFilters((f) => ({
    ...f,
    personas: f.personas.includes(id) ? f.personas.filter((x) => x !== id) : [...f.personas, id],
  }));

  const filterRailEl = viewerOpts.filterRail
    ? h(FilterRail, {
        filters, setFilters, facets, personaLabels,
        showSearch: viewerOpts.search,
        matchCount: searchMatches.length,
        matchIndex,
        onPrevMatch: () => goToMatch(-1),
        onNextMatch: () => goToMatch(1),
      })
    : null;

  return h(
    'div',
    { className: 'nib-bp-shell' + (readOnly ? ' is-readonly' : '') },
    h(Toolbar, {
      flow, breadcrumb, viewMode, readOnly,
      canUndo: history && history.canUndo(), canRedo: history && history.canRedo(),
      onUndo: undo, onRedo: redo, onSetView: setViewMode,
      onAddLane: addLane, onAddPhase: addPhase,
      onExportJson, onExportYaml, onExportXlsx, onExportBundle,
      onDrillUp: drillUp, onDrillRoot: drillRoot,
      filterRail: filterRailEl,
    }),
    viewMode === 'overview'
      ? h(OverviewSummary, { flow, allFlows, onDrillIn: drillIn })
      : null,
    h('div', { className: 'nib-bp-canvas-wrap' },
      h(ReactFlow, {
        nodes: csatNodes,
        edges: rfEdges,
        nodeTypes,
        onNodeDragStop,
        onConnect,
        onEdgesDelete,
        onNodesDelete,
        onInit: (inst) => { rfInstanceRef.current = inst; },
        fitView: true,
        defaultEdgeOptions: { type: 'default' },
        nodesDraggable: !readOnly,
        nodesConnectable: !readOnly,
        elementsSelectable: true,
        proOptions: { hideAttribution: true },
      },
        h(Background, { color: '#cdd6e3', gap: 18, size: 1 }),
        viewerOpts.personaKey
          ? h(PersonaKey, {
              personaIds: facets.personas,
              personaColors, personaLabels,
              selected: filters.personas,
              onToggle: togglePersona,
            })
          : null,
        h(MiniMap, { pannable: true, zoomable: true }),
        h(Controls, null)
      )
    ),
    openCsat ? h(SentimentDrawer, { cell: openCsat, onClose: () => setOpenCsat(null) }) : null
  );
}

// ── Position → lane/phase resolvers ────────────────────────────────────────
function laneAtY(flow, y) {
  let cursorY = LAYOUT_CONSTANTS.PHASE_H;
  for (const lane of flow.lanes) {
    const h = lane.tier === 'signal'
      ? LAYOUT_CONSTANTS.CSAT_H + LAYOUT_CONSTANTS.LANE_PAD_Y * 2
      : LAYOUT_CONSTANTS.CARD_H + LAYOUT_CONSTANTS.LANE_PAD_Y * 2;
    if (y >= cursorY - LAYOUT_CONSTANTS.LANE_PAD_Y && y < cursorY + h) return lane.id;
    cursorY += h;
  }
  return flow.lanes[flow.lanes.length - 1]?.id;
}

function phaseAtX(flow, x) {
  const adjusted = x - LAYOUT_CONSTANTS.LANE_LABEL_W;
  if (adjusted < 0) return flow.phases[0]?.id;
  const idx = Math.min(flow.phases.length - 1, Math.floor(adjusted / LAYOUT_CONSTANTS.PHASE_W));
  return flow.phases[idx]?.id;
}

// ── Public mount API ───────────────────────────────────────────────────────
/**
 * Mount the blueprint canvas.
 *
 * @param {HTMLElement} container
 * @param {object} options
 *   blueprints   {[flowId]: BlueprintFlow}        — required
 *   index        {ids, tree}                      — optional
 *   rootFlowId   string                           — required
 *   adapter      SyncAdapter                      — optional persistence
 *   mode         'editor' (default) | 'viewer'    — viewer = read-only
 *   search       boolean (default false)          — text search + find nav
 *   filterRail   boolean (default false)          — popover filter rail
 *   personaKey   boolean (default false)          — persona-key raise/knock
 *   personas     {[id]: {label?, color?}}|{[id]:string} — data-driven palette
 */
export function mountCanvas(container, options) {
  const {
    blueprints,
    index,
    rootFlowId,
    adapter = debounced(localStorageAdapter('nib-bp')),
    mode = 'editor',
    search = false,
    filterRail = false,
    personaKey = false,
    personas = {},
  } = options;
  if (!blueprints || !blueprints[rootFlowId]) {
    container.innerHTML = `<p style="padding:24px;color:var(--wf-red,#8b4553);">`
      + `No blueprint named "${rootFlowId}" — check NIB_BLUEPRINTS / rootFlowId.</p>`;
    return;
  }
  const viewerOpts = { mode, search, filterRail, personaKey };
  const personaConfig = splitPersonaConfig(personas);
  const root = ReactDOM.createRoot(container);
  root.render(h(BlueprintCanvas, { blueprints, index, rootFlowId, adapter, viewerOpts, personaConfig }));
}

// Re-export for convenience
export { localStorageAdapter, debounced, noopAdapter, ops };
