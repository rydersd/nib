/**
 * nib-react — napkin engine bridge. Loads the shared classic-script engine
 * (core/wf-napkin.js + core/wf-doodles.js — the SAME files the static
 * chrome and eqPartners use) on demand, and re-scatters marks on SPA route
 * changes via WFNapkin.reset().
 */

let _loading = null;

function injectScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error('failed to load ' + src));
    document.head.appendChild(s);
  });
}

/**
 * Load wf-napkin.js then wf-doodles.js from `coreBase` (the URL of nib's
 * core/ directory, e.g. '/core/' or 'https://…/nib/core/'). Idempotent.
 */
export function loadNapkinEngine(coreBase) {
  if (window.WFNapkin && window.WFDoodles) {
    if (!window.WFNapkin._inited) window.WFNapkin.init();
    return Promise.resolve();
  }
  if (!_loading) {
    const base = coreBase.endsWith('/') ? coreBase : coreBase + '/';
    _loading = injectScript(base + 'wf-napkin.js')
      .then(() => injectScript(base + 'wf-doodles.js'))
      .then(() => { window.WFNapkin.init(); });
  }
  return _loading;
}

/** Run the full asset pass (ink frames + gutter stains + doodles). */
export function runNapkinAssets() {
  if (window.WFNapkin) window.WFNapkin.runAssetsPass();
}

/** Clear scattered marks (route change) then re-run against new content. */
export function rescatterNapkin() {
  if (!window.WFNapkin) return;
  if (window.WFNapkin.reset) window.WFNapkin.reset();
  window.WFNapkin.runAssetsPass();
}

/**
 * Fill a drawer-bottom doodle strip — napkin only, once per mount.
 * Mirrors proto-nav.js wfDrawerDoodles (same sizes/opacity/rotation).
 */
export function fillDrawerDoodles(host) {
  if (!host || !window.WFDoodles) return;
  if (host.childNodes.length) return;
  const WFDoodles = window.WFDoodles;
  const n = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < n; i++) {
    const S = Math.round(44 + Math.random() * 22);
    const kind = WFDoodles.ORDER[Math.floor(Math.random() * WFDoodles.ORDER.length)];
    const cell = WFDoodles.cellSVG(kind, S);
    const d = document.createElement('span');
    d.className = 'wf-drawer-doodle';
    d.style.cssText = 'display:inline-block;width:' + S + 'px;height:' + S +
      'px;opacity:' + (0.45 + Math.random() * 0.25).toFixed(2) +
      ';transform:rotate(' + Math.floor(-14 + Math.random() * 28) + 'deg);';
    d.innerHTML = cell.svg;
    host.appendChild(d);
  }
}
