/**
 * thumbnails.js — UI-archetype thumbnail SVG manifest for the blueprint
 * canvas. 23 responsive (desktop/mobile pairs) + 11 SFDC singles = 57 SVGs,
 * shipped in core/blueprint/thumbnails/.
 *
 * When a blueprint node carries a `thumbnail` key (e.g. "form",
 * "card.grid", "sfdc--dashboard"), the JourneyCardNode renders the matching
 * SVG inset on the card. Use thumb(name, variant) to resolve a path.
 *
 * Ported from eqPartners/prototype/data/thumbnails.js — paths re-rooted to
 * core/blueprint/thumbnails/.
 */

// Resolved relative to this module's URL so the manifest works no matter
// where the consuming page lives.
const THUMB_BASE = new URL('./thumbnails/', import.meta.url).href;

export const THUMBNAILS = {
  responsive: {
    'accordion.list':  { desktop: 'accordion.list--desktop.svg',  mobile: 'accordion.list--mobile.svg' },
    'article':         { desktop: 'article--desktop.svg',         mobile: 'article--mobile.svg' },
    'calendar':        { desktop: 'calendar--desktop.svg',        mobile: 'calendar--mobile.svg' },
    'card.grid':       { desktop: 'card.grid--desktop.svg',       mobile: 'card.grid--mobile.svg' },
    'card.grid.map':   { desktop: 'card.grid.map--desktop.svg',   mobile: 'card.grid.map--mobile.svg' },
    'chart.multiple':  { desktop: 'chart.multiple--desktop.svg',  mobile: 'chart.multiple--mobile.svg' },
    'chart.single':    { desktop: 'chart.single--desktop.svg',    mobile: 'chart.single--mobile.svg' },
    'checkout':        { desktop: 'checkout--desktop.svg',        mobile: 'checkout--mobile.svg' },
    'compare':         { desktop: 'compare--desktop.svg',         mobile: 'compare--mobile.svg' },
    'details.page':    { desktop: 'details.page--desktop.svg',    mobile: 'details.page--mobile.svg' },
    'details.page.map':{ desktop: 'details.page.map--desktop.svg',mobile: 'details.page.map--mobile.svg' },
    'files.directory': { desktop: 'files.directory--desktop.svg', mobile: 'files.directory--mobile.svg' },
    'form':            { desktop: 'form--desktop.svg',            mobile: 'form--mobile.svg' },
    'list':            { desktop: 'list--desktop.svg',            mobile: 'list--mobile.svg' },
    'login':           { desktop: 'login--desktop.svg',           mobile: 'login--mobile.svg' },
    'map':             { desktop: 'map--desktop.svg',             mobile: 'map--mobile.svg' },
    'modal.generic':   { desktop: 'modal.generic--desktop.svg',   mobile: 'modal.generic--mobile.svg' },
    'profile':         { desktop: 'profile--desktop.svg',         mobile: 'profile--mobile.svg' },
    'settings':        { desktop: 'settings--desktop.svg',        mobile: 'settings--mobile.svg' },
    'stepper.wizard':  { desktop: 'stepper.wizard--desktop.svg',  mobile: 'stepper.wizard--mobile.svg' },
    'table':           { desktop: 'table--desktop.svg',           mobile: 'table--mobile.svg' },
    'text.page':       { desktop: 'text.page--desktop.svg',       mobile: 'text.page--mobile.svg' },
    'timeline':        { desktop: 'timeline--desktop.svg',        mobile: 'timeline--mobile.svg' },
  },
  sfdc: {
    'dashboard':          'sfdc--dashboard.svg',
    'dual-bar':           'sfdc--dual-bar.svg',
    'email-gen':          'sfdc--email-gen.svg',
    'metrics-table':      'sfdc--metrics-table.svg',
    'object-details':     'sfdc--object-details.svg',
    'object-kanban-view': 'sfdc--object-kanban-view.svg',
    'object-list-view':   'sfdc--object-list-view.svg',
    'object-split-view':  'sfdc--object-split-view.svg',
    'table-metrics':      'sfdc--table-metrics.svg',
    'timeline':           'sfdc--timeline.svg',
    'workflow':           'sfdc--workflow.svg',
  },
};

/**
 * Resolve a thumbnail name to an absolute SVG URL.
 *
 *   thumb('form')                 → …/thumbnails/form--desktop.svg
 *   thumb('form', 'mobile')       → …/thumbnails/form--mobile.svg
 *   thumb('sfdc--dashboard')      → …/thumbnails/sfdc--dashboard.svg
 *   thumb('dashboard')            → …/thumbnails/sfdc--dashboard.svg
 *
 * @param {string} name     archetype key, or an `sfdc--*` name
 * @param {string} [variant] 'desktop' (default) or 'mobile' — responsive only
 * @returns {string|null}   absolute URL, or null when unknown
 */
export function thumb(name, variant) {
  if (!name) return null;
  let file = null;
  if (THUMBNAILS.responsive[name]) {
    file = THUMBNAILS.responsive[name][variant || 'desktop'];
  } else if (name.startsWith('sfdc--')) {
    file = THUMBNAILS.sfdc[name.slice(6)];
  } else if (THUMBNAILS.sfdc[name]) {
    file = THUMBNAILS.sfdc[name];
  }
  return file ? THUMB_BASE + file : null;
}

/** True when a thumbnail name resolves to a shipped SVG. */
export function hasThumbnail(name) {
  return thumb(name) != null;
}
