/**
 * Custom React Flow node types for the Nib service blueprint canvas.
 *
 * Lifted + merged from eqPartners/prototype/journey.js. The editor halves
 * (inline rename, remove buttons, drill-in) are Nib's own; the viewer
 * halves (thumbnail card layout, persona strip, sentiment-evidence chip,
 * raise/knock-back, search dimming) are back-ported as ADDITIVE behaviour.
 *
 * Persona colours are DATA-DRIVEN: `makeNodeTypes` takes a `personaColors`
 * map and a `personaLabels` map (Nib projects supply these from
 * data/personas.js). A generic default palette covers the unconfigured case.
 *
 * Loaded as an ES module by the canvas, which injects React / Handle /
 * Position.
 */

import { strongestEvidence, evidenceChip } from './evidence.js';
import { thumb } from './thumbnails.js';

const STATUS_LABELS = {
  live: 'Live',
  designed: 'Designed',
  draft: 'Draft',
  future: 'Proposed',
  partial: 'Partial',
  gap: 'Spec gap',
  todo: 'Todo',
  blocked: 'Blocked',
};

/**
 * Core-interaction phrase for an interaction card — keyed by the node's
 * thumbnail archetype. Rendered under the thumbnail in place of a type
 * pill. Ported verbatim from journey.js. Exported so search.js can index
 * the phrase text.
 */
export const INTERACTION_PHRASE = {
  'form':            'Form · enter & submit',
  'stepper.wizard':  'Workflow · step-by-step',
  'list':            'List view · browse & filter',
  'table':           'Table · scan & sort',
  'timeline':        'Timeline · track over time',
  'files.directory': 'Library · browse & search',
  'card.grid':       'Dashboard · monitor & drill in',
  'login':           'Sign-in · authenticate',
  'details.page':    'Detail view · read & act',
  'text.page':       'Document · read & review',
  'article':         'Document · read & review',
  'chart.multiple':  'Analytics · compare trends',
  'chart.single':    'Analytics · read a metric',
  'calendar':        'Calendar · schedule & plan',
  'compare':         'Compare · weigh options',
  'checkout':        'Checkout · confirm & pay',
  'map':             'Map · locate & explore',
  'profile':         'Profile · review & edit',
  'settings':        'Settings · configure',
  'modal.generic':   'Dialog · decide & confirm',
};

/**
 * Generic fallback persona palette — used when a project doesn't pass a
 * `personaColors` map. Keyed by 0-based index so the Nth distinct persona
 * in a flow gets a stable colour. All values are Nib design tokens.
 */
export const DEFAULT_PERSONA_PALETTE = [
  'var(--wf-accent)',
  'var(--wf-green)',
  'var(--wf-amber)',
  'var(--wf-purple)',
  'var(--wf-red)',
  'var(--wf-muted)',
];

/**
 * Build the node type table for the canvas.
 *
 * @param {object} deps  { React, Handle, Position,
 *                          personaColors?, personaLabels? }
 *   personaColors — { [personaId]: cssColor }  (data-driven; optional)
 *   personaLabels — { [personaId]: displayLabel } (optional)
 */
export function makeNodeTypes(deps) {
  const { React, Handle, Position } = deps;
  const personaColors = deps.personaColors || {};
  const personaLabels = deps.personaLabels || {};
  const h = React.createElement;

  // Resolve a persona id → display colour. Configured map wins; otherwise
  // hash the id onto the generic token palette so it stays stable.
  function personaColor(personaId) {
    if (!personaId) return 'var(--wf-muted)';
    if (personaColors[personaId]) return personaColors[personaId];
    let n = 0;
    for (let i = 0; i < personaId.length; i++) n = (n + personaId.charCodeAt(i)) | 0;
    return DEFAULT_PERSONA_PALETTE[Math.abs(n) % DEFAULT_PERSONA_PALETTE.length];
  }
  function personaLabel(personaId) {
    return personaLabels[personaId] || personaId || 'System';
  }

  function LaneBandNode({ data }) {
    const tier = data.tier;
    const cls = 'nib-bp-lane' + (tier ? ` is-${tier}` : '');
    const tierChip =
      tier === 'current' ? 'Today' :
      tier === 'future'  ? 'Proposed' :
      tier === 'signal'  ? 'Sentiment' : null;
    return h(
      'div',
      { className: cls, style: { background: data.accent || 'transparent' } },
      h(
        'div',
        { className: 'nib-bp-lane-label' },
        data.editable
          ? h('input', {
              className: 'nib-bp-lane-input',
              defaultValue: data.label,
              onBlur: (e) => data.onRenameLane && data.onRenameLane(data.laneId, e.target.value),
              onKeyDown: (e) => { if (e.key === 'Enter') e.target.blur(); },
            })
          : data.label,
        tierChip ? h('span', { className: `nib-bp-lane-chip is-${tier}` }, tierChip) : null,
        data.editable
          ? h('button', {
              className: 'nib-bp-lane-rm',
              onClick: () => data.onRemoveLane && data.onRemoveLane(data.laneId),
              title: 'Remove lane',
            }, '×')
          : null
      )
    );
  }

  // Sentiment cell — tile in a tier:signal lane band. Carries an
  // evidence[] array; the strongest item drives a chip + the cell opens
  // an evidence drawer (the canvas supplies data.onOpen).
  function CsatCellNode({ data }) {
    const sentiment = data.sentiment || {};
    const ev = strongestEvidence(data.evidence);
    const chip = ev ? evidenceChip(ev) : null;
    const interactive = !!data.onOpen;
    const cls = 'nib-bp-csat'
      + (data.searchDimmed ? ' is-search-dimmed' : '')
      + (interactive ? ' is-interactive' : '');
    return h(
      'div',
      {
        className: cls,
        title: interactive ? 'Click for backing details' : (data.note || ''),
        role: interactive ? 'button' : undefined,
        tabIndex: interactive ? 0 : undefined,
        onClick: interactive ? () => data.onOpen(data) : undefined,
        onKeyDown: interactive
          ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); data.onOpen(data); } }
          : undefined,
      },
      h('span', { className: 'nib-bp-csat-emoji' }, sentiment.emoji || '·'),
      h(
        'span',
        { className: 'nib-bp-csat-body' },
        h('span', { className: 'nib-bp-csat-label' }, sentiment.label || ''),
        h('span', { className: 'nib-bp-csat-note' }, data.note || ''),
        chip
          ? h('span', { className: `nib-bp-csat-evidence-chip ${chip.cls}` }, chip.label)
          : null
      )
    );
  }

  function PhaseHeaderNode({ data }) {
    return h(
      'div',
      { className: 'nib-bp-phase-header', style: { background: data.accent } },
      data.editable
        ? h('input', {
            className: 'nib-bp-phase-input',
            defaultValue: data.label,
            onBlur: (e) => data.onRenamePhase && data.onRenamePhase(data.phaseId, e.target.value),
            onKeyDown: (e) => { if (e.key === 'Enter') e.target.blur(); },
          })
        : h('div', null, data.label),
      data.editable
        ? h('button', {
            className: 'nib-bp-phase-rm',
            onClick: () => data.onRemovePhase && data.onRemovePhase(data.phaseId),
            title: 'Remove phase',
          }, '×')
        : null
    );
  }

  function PhaseColumnNode({ data }) {
    return h(
      'div',
      { className: 'nib-bp-phase-col' },
      h('span', { className: 'nib-bp-phase-watermark' }, data.label)
    );
  }

  function JourneyCardNode({ data, selected }) {
    const persona = data.persona;
    const hasThumb = !!(data.thumbnail && thumb(data.thumbnail));
    const cardStyle = { '--persona-color': personaColor(persona) };

    const cls = [
      'nib-bp-card',
      `is-${data.status || 'draft'}`,
      hasThumb ? 'has-thumb' : '',
      data.dimmed ? 'is-dimmed' : '',
      data.raised ? 'is-raised' : '',
      data.knockedBack ? 'is-knocked-back' : '',
      data.searchDimmed ? 'is-search-dimmed' : '',
      data.isSearchCurrent ? 'is-search-current' : '',
      selected ? 'is-selected' : '',
      data.childBlueprintId ? 'is-drillable' : '',
    ].filter(Boolean).join(' ');

    // Footer — identical for both layouts.
    const foot = h(
      'div',
      { className: 'nib-bp-card-foot' },
      h('span', { className: `nib-bp-pill is-${data.status || 'draft'}` },
        STATUS_LABELS[data.status] || data.status || 'Draft')
    );

    let cardChildren;
    if (hasThumb) {
      // Interaction card: persona strip → title + summary → thumbnail →
      // core-interaction line → footer. No persona chip — the strip is it.
      cardChildren = [
        h('div', {
          className: 'nib-bp-card-personastrip nib-bp-card-personastrip--' + (persona || 'none'),
          key: 'ps',
          title: personaLabel(persona),
        },
          h('span', { className: 'nib-bp-card-personastrip-label' }, personaLabel(persona))),
        data.editing
          ? h('input', {
              className: 'nib-bp-card-edit', key: 'l', autoFocus: true,
              defaultValue: data.label,
              onBlur: (e) => data.onCommitEdit && data.onCommitEdit(data.id, e.target.value),
              onKeyDown: (e) => {
                if (e.key === 'Enter') e.target.blur();
                if (e.key === 'Escape') { e.target.value = data.label; e.target.blur(); }
              },
            })
          : h('div', { className: 'nib-bp-card-label', key: 'l' }, data.label),
        data.summary ? h('div', { className: 'nib-bp-card-summary', key: 's' }, data.summary) : null,
        h('div', { className: 'nib-bp-card-thumb', key: 't' },
          h('img', { src: thumb(data.thumbnail), alt: '', loading: 'lazy' })),
        h('div', { className: 'nib-bp-card-interaction', key: 'i' },
          INTERACTION_PHRASE[data.thumbnail] || ''),
        h(React.Fragment, { key: 'f' }, foot),
      ];
    } else {
      // Standard card: head (persona + badges + drill) → label → summary → footer.
      cardChildren = [
        h(
          'div',
          { className: 'nib-bp-card-head', key: 'h' },
          persona
            ? h('span', { className: 'nib-bp-card-persona' }, personaLabel(persona))
            : h('span', { className: 'nib-bp-card-persona is-system' }, 'System'),
          (data.gapNotes && data.gapNotes.length)
            ? h('span', {
                className: 'nib-bp-card-badge is-gap',
                title: `${data.gapNotes.length} gap note${data.gapNotes.length > 1 ? 's' : ''}`,
              }, '⚠')
            : null,
          (Array.isArray(data.initiativeIds) && data.initiativeIds.length)
            ? h('span', {
                className: 'nib-bp-card-badge is-initiative',
                title: `${data.initiativeIds.length} initiative${data.initiativeIds.length > 1 ? 's' : ''} in flight`,
              }, '⚙')
            : null,
          data.childBlueprintId
            ? h('button', {
                className: 'nib-bp-card-drill',
                title: `Drill into ${data.childBlueprintId}`,
                onClick: (e) => {
                  e.stopPropagation();
                  data.onDrillIn && data.onDrillIn(data.childBlueprintId);
                },
              }, '↳ Open')
            : null
        ),
        data.editing
          ? h('input', {
              className: 'nib-bp-card-edit', key: 'l', autoFocus: true,
              defaultValue: data.label,
              onBlur: (e) => data.onCommitEdit && data.onCommitEdit(data.id, e.target.value),
              onKeyDown: (e) => {
                if (e.key === 'Enter') e.target.blur();
                if (e.key === 'Escape') { e.target.value = data.label; e.target.blur(); }
              },
            })
          : h('div', { className: 'nib-bp-card-label', key: 'l' }, data.label),
        data.summary ? h('div', { className: 'nib-bp-card-summary', key: 's' }, data.summary) : null,
        h(React.Fragment, { key: 'f' }, foot),
      ];
    }

    return h(
      React.Fragment,
      null,
      h(Handle, { type: 'target', position: Position.Left, style: { opacity: 0, pointerEvents: 'none' } }),
      h(
        'div',
        {
          className: cls,
          style: cardStyle,
          title: data.childBlueprintId ? `${data.label} — drill into ${data.childBlueprintId}` : data.label,
          onDoubleClick: () => data.onEditNode && data.onEditNode(data.id),
          onClick: (e) => {
            if (data.childBlueprintId && (e.metaKey || e.ctrlKey)) {
              data.onDrillIn && data.onDrillIn(data.childBlueprintId);
              e.stopPropagation();
              return;
            }
            data.onOpen && data.onOpen(data);
          },
        },
        ...cardChildren
      ),
      h(Handle, { type: 'source', position: Position.Right, style: { opacity: 0, pointerEvents: 'none' } })
    );
  }

  return {
    lane: LaneBandNode,
    phase: PhaseHeaderNode,
    phaseColumn: PhaseColumnNode,
    journeyNode: JourneyCardNode,
    csatCell: CsatCellNode,
  };
}
