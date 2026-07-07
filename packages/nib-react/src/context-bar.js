/**
 * nib-react — <ContextBar>. Renders the same wf-ctx-* classes that
 * core/proto-chrome.css styles, so the React shell and static prototypes
 * share one visual source of truth. Breadcrumbs come from the headless
 * nav-model and track the provider's `location`.
 *
 * The static chrome's Stories/Notes/Feedback/Review buttons belong to
 * proto-chrome-extras.js (page-annotation tooling for static prototypes);
 * in an app shell, pass your own buttons via the `actions` prop.
 */
import { createElement as e, Fragment } from 'react';
import { FIDELITY_LABELS, FIDELITY_VALUES, fidelityIndex, breadcrumbs } from '../../../core/shell/index.js';
import { useNib } from './hooks.js';

function Crumbs() {
  const { sections, file, navigate, config } = useNib();
  const crumbs = breadcrumbs(sections, file, {
    rootLabel: config.title || 'Wireframes',
    rootHref: (config.fallbackPage || 'index.html')
  });
  const parts = [];
  crumbs.forEach((c, i) => {
    if (i > 0) parts.push(e('span', { key: 'sep' + i, className: 'wf-ctx-breadcrumb-sep' }, '›'));
    if (c.current) {
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
        onClick: (ev) => navigate(c.href, ev)
      }, c.label));
    }
  });
  return e('nav', { className: 'wf-ctx-breadcrumbs' }, parts);
}

function FidelitySelect() {
  const { fidelity, setFidelity } = useNib();
  return e('div', { className: 'wf-ctx-fidelity' },
    e('label', null, 'Fidelity'),
    e('select', {
      id: 'wf-fidelity-select',
      title: 'Wireframe fidelity level',
      value: String(fidelityIndex(fidelity)),
      onChange: (ev) => setFidelity(FIDELITY_VALUES[parseInt(ev.target.value, 10)])
    }, FIDELITY_LABELS.map((label, i) => e('option', { key: label, value: String(i) }, label)))
  );
}

/**
 * @param {object} props
 *   actions       — extra React nodes rendered before the theme badge
 *   onThemeClick  — click handler for the theme badge (e.g. open your
 *                   own settings surface); omit to render it inert
 *   timestamp     — string to show at right (default: none in SPA — the
 *                   static chrome shows document.lastModified, which is
 *                   meaningless for a client-rendered app)
 */
export function ContextBar({ actions = null, onThemeClick = null, timestamp = null }) {
  const { config, openDrawer, themeId, themes } = useNib();
  const theme = themes[themeId] || {};
  return e('div', { className: 'wf-ctx-bar' },
    e('div', { className: 'wf-ctx-inner' },
      e('div', { className: 'wf-ctx-left' },
        e('button', {
          className: 'wf-ctx-hamburger', title: 'Open navigation', onClick: openDrawer
        }, e('span'), e('span'), e('span')),
        config.logo ? e('img', {
          src: config.logo, className: 'wf-ctx-logo', alt: config.title || 'Logo',
          onError: (ev) => { ev.currentTarget.style.display = 'none'; }
        }) : null,
        e(Crumbs)
      ),
      e('div', { className: 'wf-ctx-right' },
        timestamp ? e('span', { className: 'wf-ctx-timestamp' }, timestamp) : null,
        actions ? e(Fragment, null, actions) : null,
        e('span', {
          className: 'wf-ctx-theme-badge',
          id: 'wf-theme-badge',
          title: onThemeClick ? 'Current theme — click to change' : 'Current theme',
          onClick: onThemeClick || undefined
        }, theme.label || themeId),
        e(FidelitySelect)
      )
    )
  );
}
