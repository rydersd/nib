/**
 * nib-react — <NibProvider>. Owns the shell contract that static Nib pages
 * and the React world share:
 *
 *   <html class="wireframe" data-wf-fidelity data-wf-theme data-wf-surface>
 *   localStorage/sessionStorage 'wf_fidelity', sessionStorage theme keys
 *
 * Because the contract lives on <html> + storage, fidelity and theme
 * follow the user between this app and any static Nib prototype.
 *
 * Written with React.createElement (no JSX) so the package needs no build
 * step — same no-bundler ethos as core/blueprint/canvas.js.
 */
import { createElement as e, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_FIDELITY, applyFidelity, readStoredFidelity, storeFidelity,
  BUILT_IN_THEMES, THEME_OVERRIDE_KEY, THEME_ASSIGNMENTS_KEY,
  mergeThemes, readCustomThemes, resolveThemeId, applyTheme,
  fileFromPath, findPage, detectSurface
} from '../../../core/shell/index.js';
import { NibContext } from './context.js';
import { loadNapkinEngine, runNapkinAssets, rescatterNapkin } from './napkin.js';

/** The split stylesheets, in the canonical cascade order (see starters). */
const NIB_STYLESHEETS = [
  'proto-tokens.css', 'proto-chrome.css', 'proto-components.css',
  'proto-story.css', 'proto-feedback.css', 'proto-blueprint.css',
  'proto-keyframes.css'
];

function injectStylesheets(coreBase) {
  const base = coreBase.endsWith('/') ? coreBase : coreBase + '/';
  NIB_STYLESHEETS.forEach((file) => {
    const href = base + file;
    if (document.querySelector('link[href="' + href + '"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute('data-nib-react', '1');
    document.head.appendChild(link);
  });
}

function readSession(key) {
  try { return sessionStorage.getItem(key); } catch (err) { return null; }
}

/**
 * @param {object} props
 *   sections     — the SECTIONS array (same schema as project-data.js)
 *   config       — WIREFRAME_CONFIG subset: { title, subtitle, logo,
 *                  defaultTheme, themes, fallbackPage }
 *   location     — current pathname (feed your router's location here so
 *                  breadcrumbs/active states track SPA navigation);
 *                  defaults to window.location.pathname
 *   onNavigate   — (href, event) => void; when given, drawer/breadcrumb
 *                  links preventDefault and delegate routing to you
 *   surface      — explicit 'sfdc' | 'slack' | 'internal' | null;
 *                  defaults to detectSurface(sections, file)
 *   coreBase     — URL of nib's core/ directory (stylesheets + napkin
 *                  engine load from here). Default 'core/'.
 *   injectStyles — inject the split Nib stylesheets (default true; pass
 *                  false when your app links them itself)
 */
export function NibProvider({
  sections = [],
  config = {},
  location = null,
  onNavigate = null,
  surface = null,
  coreBase = 'core/',
  injectStyles = true,
  children
}) {
  const pathname = location != null
    ? location
    : (typeof window !== 'undefined' ? window.location.pathname : '/');
  const file = fileFromPath(pathname);
  const page = useMemo(() => findPage(sections, file), [sections, file]);

  const themes = useMemo(
    () => mergeThemes(config.themes || {}, typeof window !== 'undefined' ? readCustomThemes() : {}),
    [config.themes]
  );

  const [fidelity, setFidelityState] = useState(() =>
    (typeof window !== 'undefined' && readStoredFidelity()) || DEFAULT_FIDELITY
  );
  const [themeOverride, setThemeOverrideState] = useState(() =>
    typeof window !== 'undefined' ? readSession(THEME_OVERRIDE_KEY) : null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const themeId = useMemo(() => {
    let assignments = null;
    if (typeof window !== 'undefined') {
      try { assignments = JSON.parse(readSession(THEME_ASSIGNMENTS_KEY) || 'null'); } catch (err) { /* ignore */ }
    }
    return resolveThemeId({
      page, sections,
      defaultTheme: config.defaultTheme || 'nib',
      override: themeOverride,
      assignments
    });
  }, [page, sections, config.defaultTheme, themeOverride]);

  // ── mount: wireframe class + stylesheets ─────────────────────────────
  useEffect(() => {
    document.documentElement.classList.add('wireframe');
    if (injectStyles) injectStylesheets(coreBase);
  }, [coreBase, injectStyles]);

  // ── fidelity: attribute + storage + napkin engine ────────────────────
  useEffect(() => {
    applyFidelity(fidelity);
    if (fidelity === 'napkin') {
      loadNapkinEngine(coreBase).then(runNapkinAssets).catch(() => { /* engine unavailable — tokens still gate the look */ });
    }
  }, [fidelity, coreBase]);

  const setFidelity = useCallback((name) => {
    storeFidelity(name);
    setFidelityState(name);
  }, []);

  // ── theme: resolve + apply (release-then-stamp semantics) ────────────
  useEffect(() => {
    applyTheme(themeId, themes);
  }, [themeId, themes]);

  const setThemeOverride = useCallback((id) => {
    try {
      if (id) sessionStorage.setItem(THEME_OVERRIDE_KEY, id);
      else sessionStorage.removeItem(THEME_OVERRIDE_KEY);
    } catch (err) { /* sandboxed */ }
    setThemeOverrideState(id || null);
  }, []);

  // ── surface: explicit prop wins, else SECTIONS item type ─────────────
  useEffect(() => {
    const s = surface || detectSurface(sections, file);
    if (s) document.documentElement.setAttribute('data-wf-surface', s);
    else document.documentElement.removeAttribute('data-wf-surface');
  }, [surface, sections, file]);

  // ── route change at napkin: marks were scattered against the OLD
  //    content — clear and re-scatter once the new route has committed ──
  const prevFileRef = useRef(file);
  useEffect(() => {
    if (prevFileRef.current === file) return;
    prevFileRef.current = file;
    setDrawerOpen(false);
    if (fidelity === 'napkin' && window.WFNapkin) {
      // rAF: let the routed content paint before measuring gutters
      requestAnimationFrame(() => rescatterNapkin());
    }
  }, [file, fidelity]);

  const navigate = useCallback((href, event) => {
    if (onNavigate) {
      if (event && event.preventDefault) event.preventDefault();
      onNavigate(href, event);
    }
    // No handler: let the <a> perform a normal full-page navigation —
    // that's how you cross from the React shell into static prototypes.
  }, [onNavigate]);

  const value = useMemo(() => ({
    sections, config, file, page,
    fidelity, setFidelity,
    themeId, themes, setThemeOverride,
    drawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
    navigate, coreBase
  }), [sections, config, file, page, fidelity, setFidelity, themeId, themes, setThemeOverride, drawerOpen, navigate, coreBase]);

  return e(NibContext.Provider, { value }, children);
}
