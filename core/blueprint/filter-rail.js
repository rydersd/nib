/**
 * filter-rail.js — the <details>-popover filter rail for the blueprint
 * canvas. Additive, optional viewer feature (gated by mountCanvas
 * { filterRail: true }).
 *
 * Exposes:
 *  - EMPTY_FILTERS              the unfiltered baseline
 *  - PRESETS                    named filter bundles
 *  - STATUS_OPTIONS / TIER_OPTIONS / INITIATIVE_STATUS_OPTIONS
 *  - isFilterActive(filters)    true when anything is filtering
 *  - availableFacets(flow)      personas / actorGroups / hasTieredLanes
 *  - passesNodeFilters(...)     per-node dim test
 *  - isLaneVisible(lane, f)     lane-band visibility under the tier toggle
 *  - makeFilterRail({ React })  → FilterRail React component
 *
 * The filter pipeline DIMS, never hides — relationships stay visible.
 * Persona selection is special: it is NOT a dim filter, it drives the
 * raise/knock-back treatment (see node-types.js + the persona key).
 *
 * Ported from eqPartners/prototype/journey.js — Equinix-specific facets
 * (Lucid, BR-gap) dropped; personaLabels are passed in (data-driven).
 */

export const STATUS_OPTIONS = ['live', 'designed', 'draft', 'partial', 'gap', 'todo'];
export const INITIATIVE_STATUS_OPTIONS = ['discovery', 'building', 'shipping', 'shipped'];
export const TIER_OPTIONS = ['all', 'current', 'future'];

export const EMPTY_FILTERS = {
  personas: [],
  statuses: [],
  actorGroups: [],
  tier: 'all',
  hasGapsOnly: false,
  hasInitiativesOnly: false,
  initiativeStatuses: [],
  query: '',
};

export const PRESETS = {
  developer:   { ...EMPTY_FILTERS, statuses: ['designed', 'partial', 'gap'], tier: 'future' },
  lead:        { ...EMPTY_FILTERS, hasGapsOnly: true, tier: 'current' },
  stakeholder: { ...EMPTY_FILTERS, hasInitiativesOnly: true, initiativeStatuses: ['building', 'shipping'] },
};

const cap = (s) => String(s).charAt(0).toUpperCase() + String(s).slice(1);

/** Actor group for a node — the lane's actorGroup, else the lane id. */
export function nodeActorGroup(node, lane) {
  if (lane && lane.actorGroup) return lane.actorGroup;
  if (lane && lane.id) return lane.id;
  return null;
}

/** True when any filter (incl. a non-blank query) is active. */
export function isFilterActive(filters) {
  return filters.personas.length > 0
    || filters.statuses.length > 0
    || filters.actorGroups.length > 0
    || filters.tier !== 'all'
    || filters.hasGapsOnly
    || filters.hasInitiativesOnly
    || filters.initiativeStatuses.length > 0
    || !!(filters.query && filters.query.trim());
}

/**
 * Per-node dim test. A node is dimmed (NOT hidden) when it fails the
 * active filters. Persona selection is excluded — it drives raise/knock.
 */
export function passesNodeFilters(node, lane, filters, initiatives) {
  if (filters.statuses.length && !filters.statuses.includes(node.status)) return false;
  if (filters.actorGroups.length) {
    const ag = nodeActorGroup(node, lane);
    if (!ag || !filters.actorGroups.includes(ag)) return false;
  }
  if (filters.tier !== 'all') {
    const t = lane && lane.tier;
    if (filters.tier === 'current' && t === 'future') return false;
    if (filters.tier === 'future' && t === 'current') return false;
  }
  if (filters.hasGapsOnly && !(node.gapNotes && node.gapNotes.length)) return false;
  if (filters.hasInitiativesOnly && !(node.initiativeIds && node.initiativeIds.length)) return false;
  if (filters.initiativeStatuses.length) {
    const ids = node.initiativeIds || [];
    if (!ids.length) return false;
    const matched = ids.some((id) => {
      const init = initiatives && initiatives[id];
      return init && filters.initiativeStatuses.includes(init.status);
    });
    if (!matched) return false;
  }
  return true;
}

/**
 * Lane-band visibility under the tier toggle. A lane is hidden only when
 * the active tier filter is the OPPOSITE of the lane's tier. Untiered
 * lanes (systems) always render; signal lanes pair via `signalTier`.
 */
export function isLaneVisible(lane, filters) {
  if (!filters || filters.tier === 'all') return true;
  const t = lane && lane.tier;
  if (t === 'signal') {
    const st = lane.signalTier;
    return !st || st === filters.tier;
  }
  if (filters.tier === 'future' && t === 'current') return false;
  if (filters.tier === 'current' && t === 'future') return false;
  return true;
}

/** Derive the selectable facets (personas, actor groups, tiered?) from a flow. */
export function availableFacets(flow) {
  const personas = new Set();
  const actorGroups = new Set();
  let hasTieredLanes = false;
  const nodes = (flow && Array.isArray(flow.nodes)) ? flow.nodes : [];
  const lanes = (flow && Array.isArray(flow.lanes)) ? flow.lanes : [];
  for (const node of nodes) {
    if (node.persona) personas.add(node.persona);
  }
  for (const lane of lanes) {
    if (lane.tier === 'current' || lane.tier === 'future') hasTieredLanes = true;
    if (lane.tier === 'signal') continue;
    const ag = lane.actorGroup || lane.id;
    if (ag) actorGroups.add(ag);
  }
  return {
    personas: Array.from(personas),
    actorGroups: Array.from(actorGroups),
    hasTieredLanes,
  };
}

/**
 * Build the FilterRail React component. `React` is injected so this module
 * has no hard import of a particular React build.
 *
 * @returns {{ FilterRail: Function, FilterPopover: Function }}
 */
export function makeFilterRail(deps) {
  const { React } = deps;
  const h = React.createElement;

  // name="nib-bp-filter" makes the <details> an exclusive accordion in
  // modern browsers — opening one closes the others.
  function FilterPopover({ label, count, children }) {
    return h(
      'details',
      { className: 'nib-bp-filter-pop', name: 'nib-bp-filter' },
      h('summary', { className: 'nib-bp-filter-pop-trigger' },
        label,
        count > 0 ? h('span', { className: 'nib-bp-filter-pop-count' }, count) : null,
        h('span', { className: 'nib-bp-filter-pop-caret' }, '▾')
      ),
      h('div', { className: 'nib-bp-filter-pop-body' }, children)
    );
  }

  function FilterRail(props) {
    const {
      filters, setFilters, facets, personaLabels = {},
      matchCount = 0, matchIndex = -1, onPrevMatch, onNextMatch,
      showSearch = true,
    } = props;

    const toggleIn = (key, value) => setFilters((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((x) => x !== value) : [...f[key], value],
    }));
    const setTier = (t) => setFilters((f) => ({ ...f, tier: t }));
    const setBool = (k, v) => setFilters((f) => ({ ...f, [k]: v }));
    const setQuery = (q) => setFilters((f) => ({ ...f, query: q }));
    const reset = () => setFilters({ ...EMPTY_FILTERS });
    const applyPreset = (name) => { const p = PRESETS[name]; if (p) setFilters({ ...p }); };

    const queryActive = !!(filters.query && filters.query.trim());

    return h(
      'div',
      { className: 'nib-bp-filter-rail' },

      // Text search + browser-find nav
      showSearch
        ? h('div', { className: 'nib-bp-filter-search' },
            h('input', {
              type: 'search',
              className: 'nib-bp-filter-search-input',
              placeholder: 'Search the blueprint…',
              value: filters.query || '',
              onChange: (e) => setQuery(e.target.value),
              onKeyDown: (e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  (e.shiftKey ? onPrevMatch : onNextMatch) && (e.shiftKey ? onPrevMatch() : onNextMatch());
                }
              },
              'aria-label': 'Search blueprint nodes and notes',
            }),
            queryActive
              ? (matchCount > 0
                  ? h('div', { className: 'nib-bp-filter-find' },
                      h('button', {
                        className: 'nib-bp-filter-find-nav',
                        onClick: onPrevMatch,
                        'aria-label': 'Previous match',
                        title: 'Previous match (Shift+Enter)',
                      }, '‹'),
                      h('span', { className: 'nib-bp-filter-find-count' },
                        matchIndex >= 0
                          ? `${matchIndex + 1} / ${matchCount}`
                          : `${matchCount} match${matchCount > 1 ? 'es' : ''}`),
                      h('button', {
                        className: 'nib-bp-filter-find-nav',
                        onClick: onNextMatch,
                        'aria-label': 'Next match',
                        title: 'Next match (Enter)',
                      }, '›')
                    )
                  : h('div', { className: 'nib-bp-filter-find nib-bp-filter-find--none' }, 'No matches'))
              : null
          )
        : null,

      // Persona
      h(FilterPopover, { label: 'Persona', count: filters.personas.length },
        facets.personas.length === 0
          ? h('p', { className: 'nib-bp-filter-empty' }, 'No personas in this flow.')
          : facets.personas.map((p) => h(
              'label', { key: p, className: 'nib-bp-filter-check' },
              h('input', {
                type: 'checkbox',
                checked: filters.personas.includes(p),
                onChange: () => toggleIn('personas', p),
              }),
              personaLabels[p] || p
            ))
      ),

      // Status
      h(FilterPopover, { label: 'Status', count: filters.statuses.length },
        STATUS_OPTIONS.map((s) => h(
          'label', { key: s, className: 'nib-bp-filter-check' },
          h('input', {
            type: 'checkbox',
            checked: filters.statuses.includes(s),
            onChange: () => toggleIn('statuses', s),
          }),
          cap(s)
        ))
      ),

      // Actor
      h(FilterPopover, { label: 'Actor', count: filters.actorGroups.length },
        facets.actorGroups.length === 0
          ? h('p', { className: 'nib-bp-filter-empty' }, 'No actor groups in this flow.')
          : facets.actorGroups.map((a) => h(
              'label', { key: a, className: 'nib-bp-filter-check' },
              h('input', {
                type: 'checkbox',
                checked: filters.actorGroups.includes(a),
                onChange: () => toggleIn('actorGroups', a),
              }),
              a
            ))
      ),

      // Tier (segmented control — only when paired tier lanes exist)
      facets.hasTieredLanes
        ? h('div',
            { className: 'nib-bp-filter-segmented', role: 'group', 'aria-label': 'Tier filter' },
            h('span', { className: 'nib-bp-filter-segmented-label' }, 'Tier'),
            TIER_OPTIONS.map((t) => h('button', {
              key: t,
              className: 'nib-bp-filter-seg' + (filters.tier === t ? ' active' : ''),
              onClick: () => setTier(t),
              'aria-pressed': filters.tier === t,
            }, t === 'all' ? 'All' : t === 'current' ? 'Today' : 'Proposed'))
          )
        : null,

      // Initiatives popover (boolean + status multi-select)
      h(FilterPopover,
        { label: 'Initiatives', count: (filters.hasInitiativesOnly ? 1 : 0) + filters.initiativeStatuses.length },
        h('label', { className: 'nib-bp-filter-check nib-bp-filter-check--head' },
          h('input', {
            type: 'checkbox',
            checked: filters.hasInitiativesOnly,
            onChange: (e) => setBool('hasInitiativesOnly', e.target.checked),
          }),
          'Has initiative in flight'
        ),
        h('div', { className: 'nib-bp-filter-pop-sub' }, 'Status'),
        INITIATIVE_STATUS_OPTIONS.map((s) => h(
          'label', { key: s, className: 'nib-bp-filter-check' },
          h('input', {
            type: 'checkbox',
            checked: filters.initiativeStatuses.includes(s),
            onChange: () => toggleIn('initiativeStatuses', s),
          }),
          cap(s)
        ))
      ),

      // Quick toggle chip
      h('button', {
        className: 'nib-bp-filter-chip' + (filters.hasGapsOnly ? ' active' : ''),
        onClick: () => setBool('hasGapsOnly', !filters.hasGapsOnly),
        title: 'Show only nodes with gap notes',
        'aria-pressed': filters.hasGapsOnly,
      }, '⚠ Gaps'),

      // Presets
      h(FilterPopover, { label: 'Presets', count: 0 },
        h('button', { className: 'nib-bp-filter-preset-btn', onClick: () => applyPreset('developer') }, 'Developer view'),
        h('button', { className: 'nib-bp-filter-preset-btn', onClick: () => applyPreset('lead') }, 'Lead view'),
        h('button', { className: 'nib-bp-filter-preset-btn', onClick: () => applyPreset('stakeholder') }, 'Stakeholder review')
      ),

      isFilterActive(filters)
        ? h('button', { className: 'nib-bp-filter-reset', onClick: reset, title: 'Clear all filters' }, 'Reset')
        : null
    );
  }

  return { FilterRail, FilterPopover };
}
