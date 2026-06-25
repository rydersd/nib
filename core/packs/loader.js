/* ========================================================================
   Nib Design-System Pack Loader (core/packs/loader.js)

   A "design-system pack" lets a Nib project adopt a real design system's
   tokens, theme, and (optionally) a Figma component map for round-trip
   generation. The pack ENGINE is generic and IP-free; the pack DATA can
   live in a private package (e.g. @equinix/nib-eqds) installed separately.

   ── How a pack registers itself ──
   A pack ships a `theme.js` that does:

     window.NIB_PACKS = window.NIB_PACKS || {};
     window.NIB_PACKS['eqds'] = {
       id: 'eqds',
       label: 'Equinix Quix',
       nibContract: '1.0',
       theme: {                          // consumed by proto-nav's theme engine
         label: 'Equinix Quix',
         font: "'Nexa Text', sans-serif",
         fontUrl: 'https://…/nexa.css',  // optional
         tokens: { '--wf-ink': '#242932', '--wf-accent': '#086ae3', … }
       },
       figmaMapUrl: 'figma-map.json'      // optional; lazy-loaded by the draw skill
     };

   ── How a project opts in ──
   In data/wireframe-config.js (or project-data.js):

     window.WIREFRAME_CONFIG = { …, pack: 'eqds' };
     // or, to register without forcing it as the active theme:
     window.WIREFRAME_CONFIG = { …, pack: { id: 'eqds', applyTheme: false } };

   ── Load order ──
     project-data.js  →  pack's theme.js  →  proto-nav.js  →  core/packs/loader.js

   This file reuses proto-nav's wfThemeApply()/_wfMergedThemes() when present
   (so the theme switcher + font injection + badge all "just work"), and
   degrades to applying tokens directly if proto-nav isn't loaded.

   Supported nibContract versions: see PACK_CONTRACT below.
   ======================================================================== */

(function () {
  'use strict';

  var PACK_CONTRACT = '1.0';

  function warn(msg) { try { console.warn('[nib-pack] ' + msg); } catch (e) {} }
  function info(msg) { try { console.info('[nib-pack] ' + msg); } catch (e) {} }

  // ── Resolve the requested pack from WIREFRAME_CONFIG ──────────────────
  var WF = window.WIREFRAME_CONFIG || {};
  var packRef = WF.pack;
  if (!packRef) return; // no pack requested — no-op

  var packId = typeof packRef === 'string' ? packRef : (packRef && packRef.id);
  var applyTheme = typeof packRef === 'object' && packRef.applyTheme === false ? false : true;

  if (!packId) { warn('WIREFRAME_CONFIG.pack is set but has no id — ignoring.'); return; }

  var packs = window.NIB_PACKS || {};
  var pack = packs[packId];
  if (!pack) {
    warn('pack "' + packId + '" requested but not registered. Did you include its theme.js BEFORE core/packs/loader.js?');
    return;
  }

  // ── Contract version check (major must match) ─────────────────────────
  var contract = String(pack.nibContract || '');
  if (contract && contract.split('.')[0] !== PACK_CONTRACT.split('.')[0]) {
    warn('pack "' + packId + '" declares nibContract ' + contract + ' but this loader supports ' + PACK_CONTRACT + '. Proceeding, but mismatches may occur.');
  }

  // ── Register the pack's theme into the existing theme engine ──────────
  // proto-nav reads WF_CONFIG.themes (a snapshot taken at its load time) AND
  // window.WIREFRAME_CONFIG.themes. Push into both so it's visible regardless
  // of which one _wfMergedThemes() ends up reading.
  if (pack.theme) {
    WF.themes = WF.themes || {};
    WF.themes[packId] = pack.theme;
    window.WIREFRAME_CONFIG = WF;
    if (typeof WF_CONFIG !== 'undefined' && WF_CONFIG) {
      WF_CONFIG.themes = WF_CONFIG.themes || {};
      WF_CONFIG.themes[packId] = pack.theme;
    }
  }

  // Expose the active pack for the draw skill / figma-map consumers.
  window.NIB_ACTIVE_PACK = pack;

  if (!applyTheme) {
    info('pack "' + packId + '" registered (theme available in switcher; not applied — applyTheme:false).');
    return;
  }

  // Make this pack the default theme unless the project already chose one or
  // the user has a session override in effect.
  var userOverride = null;
  try { userOverride = sessionStorage.getItem('wf_theme_override') || sessionStorage.getItem('wf_theme'); } catch (e) {}
  if (!userOverride) {
    if (WF.defaultTheme == null || WF.defaultTheme === 'nib') WF.defaultTheme = packId;
    if (typeof WF_CONFIG !== 'undefined' && WF_CONFIG && (WF_CONFIG.defaultTheme == null || WF_CONFIG.defaultTheme === 'nib')) {
      WF_CONFIG.defaultTheme = packId;
    }
  }

  // ── Apply ─────────────────────────────────────────────────────────────
  function applyNow() {
    if (userOverride) return; // respect explicit user theme choice
    if (typeof window.wfThemeApply === 'function') { window.wfThemeApply(packId); return; }
    if (typeof wfThemeApply === 'function') { wfThemeApply(packId); return; }
    applyTokensDirect(); // proto-nav absent — minimal fallback
  }

  // Minimal self-contained fallback mirroring wfThemeApply's core behavior.
  function applyTokensDirect() {
    var theme = pack.theme || {};
    var root = document.documentElement;
    if (theme.fontUrl) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = theme.fontUrl;
      document.head.appendChild(link);
    }
    if (theme.font) root.style.setProperty('--wf-font', theme.font);
    if (theme.tokens) {
      for (var t in theme.tokens) {
        if (theme.tokens.hasOwnProperty(t)) root.style.setProperty(t, theme.tokens[t]);
      }
    }
    root.setAttribute('data-wf-theme', packId);
    root.setAttribute('data-nib-pack', packId);
  }

  // Apply immediately (covers the case where proto-nav already initialized),
  // then re-apply once on DOMContentLoaded to win over proto-nav's own
  // theme-detect pass if it runs after us. Both are idempotent.
  applyNow();
  document.documentElement.setAttribute('data-nib-pack', packId);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { applyNow(); });
  }

  info('pack "' + packId + '" applied' + (pack.figmaMapUrl ? ' (figma-map available at ' + pack.figmaMapUrl + ')' : '') + '.');
})();
