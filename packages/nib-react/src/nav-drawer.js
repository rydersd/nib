/**
 * nib-react — <NavDrawer>. Renders the same wf-nav-drawer* classes that
 * core/proto-chrome.css styles. Sections/items come from the headless
 * drawerModel; active state tracks the provider's `location`. At napkin
 * fidelity the bottom doodle strip fills from the shared doodle engine —
 * the sanctioned in-chrome home for doodles.
 */
import { createElement as e, useEffect, useRef } from 'react';
import { drawerModel } from '../../../core/shell/index.js';
import { useNib } from './hooks.js';
import { fillDrawerDoodles } from './napkin.js';

/**
 * @param {object} props
 *   footer — extra React nodes at the drawer bottom (e.g. a settings link)
 */
export function NavDrawer({ footer = null }) {
  const { sections, config, file, drawerOpen, closeDrawer, navigate, fidelity } = useNib();
  const model = drawerModel(sections, file, {
    sitemapHref: config.fallbackPage || 'index.html'
  });
  const doodleHost = useRef(null);

  // ESC closes
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (ev) => { if (ev.key === 'Escape') closeDrawer(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen, closeDrawer]);

  // Napkin doodle strip — fills once per mount, when the engine is up
  useEffect(() => {
    if (fidelity !== 'napkin' || !drawerOpen) return;
    fillDrawerDoodles(doodleHost.current);
  }, [fidelity, drawerOpen]);

  const link = (item, key, extraClass) => e('a', {
    key,
    href: item.href,
    className: 'wf-nav-drawer-link' + (item.active ? ' active' : '') + (extraClass ? ' ' + extraClass : ''),
    style: item.indent ? { paddingLeft: '36px' } : undefined,
    onClick: (ev) => { navigate(item.href, ev); closeDrawer(); }
  }, item.label);

  const body = [];
  body.push(link({ href: model.sitemap.href, label: model.sitemap.label, active: false, indent: 0 }, 'sitemap', 'wf-nav-sitemap-link'));
  model.groups.forEach((group, gi) => {
    body.push(e('div', { key: 'g' + gi, className: 'wf-nav-drawer-section' }, group.label));
    group.items.forEach((item, ii) => body.push(link(item, 'g' + gi + 'i' + ii)));
  });

  return e('div', null,
    e('div', {
      className: 'wf-nav-overlay' + (drawerOpen ? ' open' : ''),
      id: 'wf-nav-overlay',
      onClick: closeDrawer
    }),
    e('nav', { className: 'wf-nav-drawer' + (drawerOpen ? ' open' : ''), id: 'wf-nav-drawer' },
      e('div', { className: 'wf-nav-drawer-hd' },
        e('div', null,
          config.logo ? e('img', {
            src: config.logo, className: 'wf-nav-drawer-logo', alt: config.title || '',
            onError: (ev) => { ev.currentTarget.style.display = 'none'; }
          }) : null,
          e('div', { className: 'wf-nav-drawer-title' }, config.title || 'Wireframes'),
          config.subtitle ? e('div', { className: 'wf-nav-drawer-subtitle' }, config.subtitle) : null
        ),
        e('button', { className: 'wf-nav-drawer-close', onClick: closeDrawer, title: 'Close navigation' }, '✕')
      ),
      e('div', { className: 'wf-nav-drawer-bd' },
        body,
        footer,
        e('div', { className: 'wf-drawer-doodles', 'aria-hidden': 'true', ref: doodleHost })
      )
    )
  );
}
