/**
 * search.js — text search + browser-find navigation for the blueprint
 * canvas. Additive, optional viewer feature (gated by mountCanvas
 * { search: true }).
 *
 * Two halves:
 *  1. Matching — `searchTerms` (AND of space-separated terms) +
 *     `nodeSearchText` / `cellSearchText` build the text a node/cell is
 *     searched over. `textMatchesTerms` is the AND test.
 *  2. Navigation — `orderedMatches` produces a reading-order list of
 *     matching node ids; `centerOnNode` pans+zooms React Flow to a node.
 *
 * Non-matching cards/cells get the `is-search-dimmed` class (40% opacity);
 * the current find match gets `is-search-current` (accent ring + raised
 * zIndex). The canvas wires Enter / Shift+Enter to step the cursor.
 *
 * Ported from eqPartners/prototype/journey.js — INTERACTION_PHRASE lookup
 * is passed in so this module stays free of card-rendering concerns.
 */

/** Split a query into lowercased AND terms. */
export function searchTerms(query) {
  return String(query || '').toLowerCase().split(/\s+/).filter(Boolean);
}

/** AND test — text contains every term. */
export function textMatchesTerms(text, terms) {
  return terms.every((t) => text.includes(t));
}

/**
 * Searchable text for a journey node — label, summary, interaction
 * phrase, persona (code + label), status, gap notes.
 *
 * @param {object} node
 * @param {object} [ctx] { interactionPhrase?: {[thumb]:string},
 *                          personaLabels?: {[code]:string} }
 */
export function nodeSearchText(node, ctx = {}) {
  const phrase = (ctx.interactionPhrase && ctx.interactionPhrase[node.thumbnail]) || '';
  const personaLabel = (ctx.personaLabels && ctx.personaLabels[node.persona]) || '';
  return [
    node.label,
    node.summary,
    phrase,
    personaLabel,
    node.persona,
    node.status,
    ...(Array.isArray(node.gapNotes) ? node.gapNotes : []),
  ].filter(Boolean).join(' • ').toLowerCase();
}

/**
 * Searchable text for a sentiment/CSAT cell — note, sentiment label,
 * evidence labels + sources.
 */
export function cellSearchText(cell) {
  const ev = Array.isArray(cell.evidence) ? cell.evidence : [];
  return [
    cell.note,
    cell.sentiment && cell.sentiment.label,
    ...ev.map((e) => e && e.label),
    ...ev.map((e) => e && e.source),
  ].filter(Boolean).join(' • ').toLowerCase();
}

/**
 * Ordered list of matching node ids in reading order (phase x, then y).
 * Used to drive the prev/next find navigation.
 *
 * @param {Array} nodes   the blueprint nodes (each needs id, x, y)
 * @param {Array} positions  optional map id→{x,y} when nodes lack x/y
 * @param {string[]} terms  AND terms (from searchTerms)
 * @param {object} ctx     passed to nodeSearchText
 * @returns {string[]} matching ids, reading order
 */
export function orderedNodeMatches(nodes, positions, terms, ctx = {}) {
  if (!terms.length) return [];
  const pos = (n) => (positions && positions[n.id]) || n;
  return (nodes || [])
    .filter((n) => textMatchesTerms(nodeSearchText(n, ctx), terms))
    .slice()
    .sort((a, b) => {
      const pa = pos(a);
      const pb = pos(b);
      return ((pa.x || 0) - (pb.x || 0)) || ((pa.y || 0) - (pb.y || 0));
    })
    .map((n) => n.id);
}

/**
 * Step a circular match cursor. Returns the next index given a direction
 * (+1 / -1). When the cursor is unset (-1), +1 lands on the first match
 * and -1 on the last.
 */
export function stepMatchIndex(currentIndex, dir, matchCount) {
  if (!matchCount) return -1;
  if (currentIndex < 0) return dir > 0 ? 0 : matchCount - 1;
  return ((currentIndex + dir) % matchCount + matchCount) % matchCount;
}

/**
 * Human readout string for the find nav — "3 / 12" when a match is
 * active, "12 matches" before the first jump, "No matches" when empty.
 */
export function matchReadout(matchIndex, matchCount) {
  if (matchCount <= 0) return 'No matches';
  if (matchIndex >= 0) return `${matchIndex + 1} / ${matchCount}`;
  return `${matchCount} match${matchCount > 1 ? 'es' : ''}`;
}

/**
 * Pan + zoom a React Flow instance to centre a node.
 *
 * @param {object} rfInstance  the React Flow instance (from onInit)
 * @param {object} rfNode      the rendered React Flow node ({position, style})
 * @param {object} [opts] { zoom?, duration? }
 */
export function centerOnNode(rfInstance, rfNode, opts = {}) {
  if (!rfInstance || !rfNode || !rfNode.position ||
      typeof rfInstance.setCenter !== 'function') return;
  const w = (rfNode.style && rfNode.style.width) || 200;
  const ht = (rfNode.style && rfNode.style.height) || 120;
  rfInstance.setCenter(
    rfNode.position.x + w / 2,
    rfNode.position.y + ht / 2,
    { zoom: opts.zoom != null ? opts.zoom : 0.9, duration: opts.duration != null ? opts.duration : 420 }
  );
}
