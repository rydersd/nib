/* card-sort.js — closed card sort using React Flow.
 *
 * Loads study definition from prototype/data/card-sort-taxonomy.json,
 * renders cards in a left tray + buckets on the right, lets the user
 * drag cards into buckets. Submit POSTs all placements to /api/card-sort.
 *
 * Cards that haven't been moved into a bucket count as "unsorted" in
 * the result so partial submissions are still useful.
 */
import * as React from 'https://esm.sh/react@18.3.1';
import * as ReactDOM from 'https://esm.sh/react-dom@18.3.1/client';
import {
  ReactFlow,
  Background,
  Handle,
  Position,
} from 'https://esm.sh/@xyflow/react@12.3.5?deps=react@18.3.1,react-dom@18.3.1';

(function injectReactFlowCss() {
  if (document.querySelector('link[data-rf-css]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://esm.sh/@xyflow/react@12.3.5/dist/style.css';
  link.setAttribute('data-rf-css', '1');
  document.head.appendChild(link);
})();

const { useState, useEffect, useMemo, useCallback, useRef, createElement: h } = React;

// ── Node components ───────────────────────────────────────────────

function CardNode({ data }) {
  return h(
    React.Fragment, null,
    h(Handle, { type: 'target', position: Position.Top, style: { opacity: 0, pointerEvents: 'none' } }),
    h('div', { className: `card-sort-card${data.placed ? ' is-placed' : ''}` }, data.text),
    h(Handle, { type: 'source', position: Position.Bottom, style: { opacity: 0, pointerEvents: 'none' } })
  );
}

function BucketNode({ data }) {
  return h(
    'div',
    { className: 'card-sort-bucket', style: { '--bucket-color': data.color, height: data.height } },
    h('div', { className: 'card-sort-bucket-label' }, data.label),
    h('div', { className: 'card-sort-bucket-count' }, `${data.count} card${data.count === 1 ? '' : 's'}`)
  );
}

const nodeTypes = { card: CardNode, bucket: BucketNode };

// ── Layout constants ──────────────────────────────────────────────
const TRAY_X       = 24;
const TRAY_W       = 240;
const TRAY_GAP_Y   = 12;
const CARD_W       = 220;
const CARD_H       = 38;
const BUCKET_X     = 320;
const BUCKET_W     = 380;
const BUCKET_GAP_Y = 18;
const BUCKET_HEAD  = 64;

// Geometric hit-test: which bucket does a card position fall into?
function findBucketAt(x, y, buckets) {
  for (const b of buckets) {
    if (x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height) return b.id;
  }
  return null;
}

// Stack cards inside a bucket vertically without overlapping each other.
function bucketCardOffset(idx) {
  return BUCKET_HEAD + 8 + idx * (CARD_H + 6);
}

// ── App ───────────────────────────────────────────────────────────

function App({ study }) {
  // placement: card.id → bucket.id (or null = still in tray)
  const initialPlacement = useMemo(
    () => Object.fromEntries(study.cards.map(c => [c.id, null])),
    [study]
  );
  const [placement, setPlacement] = useState(initialPlacement);
  const [submitState, setSubmitState] = useState('idle'); // idle | sending | done | error
  const [errorMsg, setErrorMsg] = useState('');
  const startedAt = useRef(new Date().toISOString());

  // Compute bucket geometry — height fits the cards currently inside it
  // (or the head height when empty).
  const bucketsLaid = useMemo(() => {
    const counts = {};
    for (const cid in placement) {
      const b = placement[cid];
      if (b) counts[b] = (counts[b] || 0) + 1;
    }
    let yCursor = 24;
    return study.buckets.map(b => {
      const cnt = counts[b.id] || 0;
      const h = BUCKET_HEAD + 16 + cnt * (CARD_H + 6);
      const obj = { ...b, x: BUCKET_X, y: yCursor, width: BUCKET_W, height: h, count: cnt };
      yCursor += h + BUCKET_GAP_Y;
      return obj;
    });
  }, [study, placement]);

  // Build React Flow nodes (cards + buckets) every render.
  const rfNodes = useMemo(() => {
    const out = [];

    // Buckets first (lower z-index)
    for (const b of bucketsLaid) {
      out.push({
        id: `bucket-${b.id}`,
        type: 'bucket',
        position: { x: b.x, y: b.y },
        data: { label: b.label, color: b.color, count: b.count, height: b.height },
        style: { width: b.width, height: b.height },
        draggable: false,
        selectable: false,
        zIndex: 0,
      });
    }

    // Tray (unsorted) cards stack vertically on the left
    let trayY = 24;
    const indexInBucket = {}; // bucketId → next placement index
    for (const card of study.cards) {
      const bucketId = placement[card.id];
      let pos;
      if (bucketId) {
        const bucket = bucketsLaid.find(b => b.id === bucketId);
        const idx = (indexInBucket[bucketId] || 0);
        indexInBucket[bucketId] = idx + 1;
        pos = {
          x: bucket.x + (BUCKET_W - CARD_W) / 2,
          y: bucket.y + bucketCardOffset(idx),
        };
      } else {
        pos = { x: TRAY_X + (TRAY_W - CARD_W) / 2, y: trayY };
        trayY += CARD_H + TRAY_GAP_Y;
      }
      out.push({
        id: `card-${card.id}`,
        type: 'card',
        position: pos,
        data: { text: card.text, placed: !!bucketId },
        style: { width: CARD_W, height: CARD_H },
        draggable: true,
        zIndex: 10,
      });
    }
    return out;
  }, [study, placement, bucketsLaid]);

  // After a drag, snap the card into a bucket if it landed inside one,
  // or back to tray (placement=null) if it didn't.
  const onNodeDragStop = useCallback((_evt, node) => {
    if (!node.id.startsWith('card-')) return;
    const cardId = node.id.slice('card-'.length);
    const bid = findBucketAt(
      node.position.x + CARD_W / 2,
      node.position.y + CARD_H / 2,
      bucketsLaid
    );
    setPlacement(p => ({ ...p, [cardId]: bid }));
  }, [bucketsLaid]);

  const sortedCount = Object.values(placement).filter(Boolean).length;
  const totalCount = study.cards.length;
  const allSorted = sortedCount === totalCount;

  const handleSubmit = useCallback(async () => {
    setSubmitState('sending');
    setErrorMsg('');
    const payload = {
      study_id: study.study_id,
      started_at: startedAt.current,
      finished_at: new Date().toISOString(),
      placements: placement,
      user_agent: navigator.userAgent,
    };
    try {
      const res = await fetch('/api/card-sort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error('HTTP ' + res.status + ' ' + txt.slice(0, 120));
      }
      setSubmitState('done');
      if (window.wfTrack) window.wfTrack('card-sort-submit', { study_id: study.study_id, sorted: sortedCount, total: totalCount });
    } catch (e) {
      setSubmitState('error');
      setErrorMsg(String(e.message || e));
    }
  }, [study, placement, sortedCount, totalCount]);

  return h(
    React.Fragment, null,
    h('div', { className: 'card-sort-topbar' },
      h('span', { className: 'card-sort-title' }, study.title),
      h('span', { className: 'card-sort-progress' }, `${sortedCount}/${totalCount} sorted`)
    ),
    submitState === 'done'
      ? h('div', { className: 'card-sort-thanks' },
          h('h3', null, 'Thanks!'),
          h('p', null, 'Your responses are saved. You can close this tab.'),
          h('p', { style: { fontSize: 11, color: 'var(--wf-muted)' } },
            `Recorded ${sortedCount} of ${totalCount} card placements.`)
        )
      : h(
          ReactFlow,
          {
            nodes: rfNodes,
            edges: [],
            nodeTypes,
            onNodeDragStop,
            fitView: false,
            minZoom: 1,
            maxZoom: 1,
            panOnDrag: false,
            panOnScroll: true,
            zoomOnScroll: false,
            zoomOnDoubleClick: false,
            nodesConnectable: false,
            elementsSelectable: false,
            proOptions: { hideAttribution: true },
          },
          h(Background, { gap: 24, size: 1, color: '#d4ddeb' })
        ),
    submitState !== 'done' && h('div', { className: 'card-sort-footer' },
      h('div', { className: 'card-sort-intro' }, study.intro),
      h('div', { className: 'card-sort-actions' },
        submitState === 'error' && h('span', { className: 'card-sort-err' }, 'Failed: ' + errorMsg),
        h('button',
          {
            className: 'btn btn-primary',
            disabled: submitState === 'sending' || sortedCount === 0,
            onClick: handleSubmit,
          },
          submitState === 'sending' ? 'Sending…' : (allSorted ? 'Submit' : `Submit (${totalCount - sortedCount} left in tray)`)
        )
      )
    )
  );
}

// ── Bootstrap ─────────────────────────────────────────────────────

async function bootstrap() {
  const root = document.getElementById('card-sort-root');
  if (!root) return;
  root.innerHTML = '<div class="card-sort-loading">Loading…</div>';
  const params = new URLSearchParams(location.search);
  const studyParam = params.get('study') || 'taxonomy';
  const study = await fetch(`data/card-sort-${studyParam}.json`)
    .then(r => r.ok ? r.json() : Promise.reject(new Error('Study not found')))
    .catch(() => null);
  if (!study) {
    root.innerHTML = `<div class="card-sort-loading">Study not found: ${studyParam}</div>`;
    return;
  }
  root.innerHTML = '';
  ReactDOM.createRoot(root).render(h(App, { study }));
  if (window.wfTrack) window.wfTrack('card-sort-start', { study_id: study.study_id });
}

bootstrap();
