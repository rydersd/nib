/**
 * nib-react — <ContextBar>. Renders the same wf-ctx-* classes that
 * core/proto-chrome.css styles, so the React shell and static prototypes
 * share one visual source of truth.
 *
 * Two ways to drive it:
 *   · Provider mode (default) — inside <NibProvider>: breadcrumbs come from
 *     the headless nav-model and track the provider's `location`, the
 *     hamburger opens the NavDrawer, fidelity and theme read the provider.
 *   · Controlled mode — hosts with their own router / state pass `crumbs`,
 *     `onNavigate`, `onHamburger`, `fidelity` + `onFidelityChange`; every
 *     prop falls back to the provider when present, and a fully-controlled
 *     bar needs no <NibProvider> at all.
 *
 * The static chrome's Stories/Notes/Feedback/Review buttons belong to
 * proto-chrome-extras.js (page-annotation tooling for static prototypes);
 * in an app shell, pass your own controls via the `leftActions` / `actions`
 * slots.
 */
import { createElement as e, Fragment, useContext } from 'react';
import { FIDELITY_LABELS, FIDELITY_VALUES, fidelityIndex, breadcrumbs } from '../../../core/shell/index.js';
import { NibContext } from './context.js';

function Crumbs({ model, navigate }) {
  const parts = [];
  model.forEach((c, i) => {
    const current = c.current != null ? c.current : i === model.length - 1;
    if (i > 0) parts.push(e('span', { key: 'sep' + i, className: 'wf-ctx-breadcrumb-sep' }, '›'));
    if (current) {
      parts.push(e('span', {
        key: 'c' + i,
        className: 'wf-ctx-breadcrumb-current',
        title: 'Click to copy a deep link to this page',
        role: 'button',
        tabIndex: 0,
        onClick: () => {
          const url = window.location.href;
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url);
        },
        onKeyDown: (ev) => {
          if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); ev.currentTarget.click(); }
        }
      }, c.label));
    } else {
      parts.push(e('a', {
        key: 'c' + i,
        className: 'wf-ctx-breadcrumb-link',
        href: c.href,
        onClick: (ev) => { if (navigate) navigate(c.href, ev); }
      }, c.label));
    }
  });
  return e('nav', { className: 'wf-ctx-breadcrumbs' }, parts);
}

function FidelitySelect({ value, onChange }) {
  return e('div', { className: 'wf-ctx-fidelity' },
    e('label', null, 'Fidelity'),
    e('select', {
      id: 'wf-fidelity-select',
      title: 'Wireframe fidelity level',
      value: String(fidelityIndex(value)),
      onChange: (ev) => onChange(FIDELITY_VALUES[parseInt(ev.target.value, 10)])
    }, FIDELITY_LABELS.map((label, i) => e('option', { key: label, value: String(i) }, label)))
  );
}

/**
 * @param {object} props
 *   actions          — extra React nodes rendered on the right, before the
 *                      theme badge
 *   leftActions      — extra React nodes rendered on the left, after the
 *                      breadcrumbs
 *   onThemeClick     — click handler for the theme badge (e.g. open your
 *                      own settings surface); omit to render it inert
 *   timestamp        — string to show at right (default: none in SPA — the
 *                      static chrome shows document.lastModified, which is
 *                      meaningless for a client-rendered app)
 *   crumbs           — [{ label, href, current? }] breadcrumb override; the
 *                      last item is current unless flagged. Omit to derive
 *                      from the provider's nav-model.
 *   onNavigate       — (href, event) => void for breadcrumb links; falls
 *                      back to the provider's navigate
 *   onHamburger      — hamburger click override; falls back to the
 *                      provider's openDrawer. Hidden when neither exists.
 *   fidelity         — controlled fidelity value ('napkin'|'blueprint'|
 *                      'polished'); falls back to the provider's state
 *   onFidelityChange — (name) => void for the fidelity select; falls back
 *                      to the provider's setFidelity
 *   showTheme        — render the theme badge (default true; it only
 *                      renders in provider mode — themes live there)
 */
export function ContextBar({
  actions = null,
  leftActions = null,
  onThemeClick = null,
  timestamp = null,
  crumbs = null,
  onNavigate = null,
  onHamburger = null,
  fidelity = null,
  onFidelityChange = null,
  showTheme = true
}) {
  const ctx = useContext(NibContext);
  const config = (ctx && ctx.config) || {};
  const model = crumbs || (ctx ? breadcrumbs(ctx.sections, ctx.file, {
    rootLabel: config.title || 'Wireframes',
    rootHref: config.fallbackPage || 'index.html'
  }) : []);
  const navigate = onNavigate || (ctx && ctx.navigate) || null;
  const openNav = onHamburger || (ctx && ctx.openDrawer) || null;
  const fidValue = fidelity != null ? fidelity : (ctx ? ctx.fidelity : null);
  const setFid = onFidelityChange || (ctx && ctx.setFidelity) || null;
  const theme = (showTheme && ctx) ? (ctx.themes[ctx.themeId] || {}) : null;

  return e('div', { className: 'wf-ctx-bar' },
    e('div', { className: 'wf-ctx-inner' },
      e('div', { className: 'wf-ctx-left' },
        openNav ? e('button', {
          className: 'wf-ctx-hamburger', title: 'Open navigation', onClick: openNav
        }, e('span'), e('span'), e('span')) : null,
        config.logo ? e('img', {
          src: config.logo, className: 'wf-ctx-logo', alt: config.title || 'Logo',
          onError: (ev) => { ev.currentTarget.style.display = 'none'; }
        }) : null,
        model.length ? e(Crumbs, { model, navigate }) : null,
        leftActions ? e(Fragment, null, leftActions) : null
      ),
      e('div', { className: 'wf-ctx-right' },
        timestamp ? e('span', { className: 'wf-ctx-timestamp' }, timestamp) : null,
        actions ? e(Fragment, null, actions) : null,
        theme ? e('span', {
          className: 'wf-ctx-theme-badge',
          id: 'wf-theme-badge',
          title: onThemeClick ? 'Current theme — click to change' : 'Current theme',
          onClick: onThemeClick || undefined
        }, theme.label || ctx.themeId) : null,
        (fidValue != null && setFid) ? e(FidelitySelect, { value: fidValue, onChange: setFid }) : null
      )
    )
  );
}
