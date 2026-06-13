/**
 * evidence.js — research-evidence model for the service blueprint.
 *
 * A sentiment / CSAT cell (and, in later waves, other blueprint elements)
 * can carry an `evidence[]` array. Each item is:
 *
 *   { kind: 'research'|'spec'|'design-rationale'|'author-construct',
 *     label: string,            // human description of the citation
 *     source?: string,          // a source ref (doc id, session id, …)
 *     sourceUrl?: string }      // an optional link
 *
 * This module is intentionally standalone — it has no React / DOM deps —
 * so later waves can import the evidence helpers independently of the
 * canvas rendering code.
 *
 * Ported from eqPartners/prototype/journey.js (the analytical viewer).
 */

// Evidence kinds ranked strongest → weakest. A cell's single display chip
// is driven by its strongest evidence item.
export const EVIDENCE_KIND_RANK = ['research', 'spec', 'design-rationale', 'author-construct'];

export const EVIDENCE_KIND_LABEL = {
  'research':         'Research',
  'spec':             'Spec',
  'design-rationale': 'Design',
  'author-construct': 'Scenario',
};

// Research state — a derived two-state model over an evidence item.
// "Researched": backed by a citation (has a source / sourceUrl).
// "To research": a gap or a design projection still to be validated.
// Applies to the research-dimension kinds (research, design-rationale).
export const RESEARCH_DIMENSION_KINDS = ['research', 'design-rationale'];
export const RESEARCH_STATE_LABEL = { 'researched': 'Researched', 'to-research': 'To research' };

/**
 * Two-state research derivation for one evidence item.
 * @returns {'researched'|'to-research'}
 */
export function evidenceState(ev) {
  return ev && (ev.source || ev.sourceUrl) ? 'researched' : 'to-research';
}

/**
 * Strongest evidence item on a cell (by EVIDENCE_KIND_RANK) — drives the
 * single chip rendered on the cell.
 * @param {Array} evidence
 * @returns {object|null}
 */
export function strongestEvidence(evidence) {
  if (!Array.isArray(evidence) || !evidence.length) return null;
  for (const k of EVIDENCE_KIND_RANK) {
    const hit = evidence.find((e) => e && e.kind === k);
    if (hit) return hit;
  }
  return evidence[0];
}

/**
 * Display chip descriptor for one evidence item → { label, cls }.
 * Research-dimension kinds report their research state; spec /
 * author-construct keep their kind label.
 */
export function evidenceChip(ev) {
  const kind = (ev && ev.kind) || 'author-construct';
  if (RESEARCH_DIMENSION_KINDS.includes(kind)) {
    const st = evidenceState(ev);
    return { label: RESEARCH_STATE_LABEL[st], cls: 'state-' + st };
  }
  return { label: EVIDENCE_KIND_LABEL[kind] || 'Note', cls: 'kind-' + kind };
}
