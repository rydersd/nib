/**
 * core/shell/theme.js — theme resolution + apply/release semantics.
 *
 * Canonical PURE implementation extracted from core/proto-nav.js (which
 * keeps a classic-script copy for file:// pages — keep them in sync).
 *
 * Semantics that matter (learned the hard way — see the 992abf1 commit):
 * applying a theme first RELEASES every themable token (removeProperty)
 * so the stylesheets govern again, then stamps only the theme's own
 * overrides inline. Never re-stamp captured computed values — they are
 * fidelity-specific and freezing them inline pins the load-time palette
 * across live fidelity switches.
 */

export const THEME_TOKENS = [
  '--wf-ink', '--wf-text', '--wf-muted', '--wf-line', '--wf-tint',
  '--wf-surface', '--wf-canvas', '--wf-accent', '--wf-red', '--wf-amber',
  '--wf-green', '--wf-purple', '--wf-radius', '--wf-font'
];

export const THEME_OVERRIDE_KEY = 'wf_theme_override';
export const THEME_ASSIGNMENTS_KEY = 'wf_theme_assignments';
export const CUSTOM_THEMES_KEY = 'wf_custom_themes';

/** Mirrors proto-nav.js _builtInThemes. */
export const BUILT_IN_THEMES = {
  'nib': {
    label: 'Nib (Default)',
    // No font/token overrides: the default theme leaves everything to the
    // stylesheets, where fidelity sets --wf-font (Figtree at blueprint +
    // napkin, the base stack at polished).
    font: '',
    tokens: {}
  },
  'slds': {
    label: 'Salesforce Lightning',
    font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    tokens: {
      '--wf-accent': '#0176d3',
      '--wf-ink': '#181818',
      '--wf-text': '#3e3e3c',
      '--wf-muted': '#706e6b',
      '--wf-line': '#c9c9c9',
      '--wf-tint': '#f3f3f3',
      '--wf-surface': '#f3f3f3',
      '--wf-canvas': '#ffffff'
    }
  },
  'material': {
    label: 'Material Design',
    font: "'Roboto', -apple-system, sans-serif",
    fontUrl: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
    tokens: {
      '--wf-accent': '#1a73e8',
      '--wf-surface': '#f5f5f5',
      '--wf-canvas': '#fafafa',
      '--wf-radius': '4px'
    }
  },
  'high-contrast': {
    label: 'High Contrast (A11y)',
    font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    tokens: {
      '--wf-ink': '#000000',
      '--wf-text': '#000000',
      '--wf-muted': '#333333',
      '--wf-accent': '#0000ee',
      '--wf-surface': '#ffffff',
      '--wf-canvas': '#ffffff',
      '--wf-line': '#000000'
    }
  }
};

/**
 * Merge built-in + project + custom themes. Later sources override earlier
 * ones with the same id (mirrors proto-nav.js _wfMergedThemes).
 */
export function mergeThemes(projectThemes = {}, customThemes = {}) {
  return Object.assign({}, BUILT_IN_THEMES, projectThemes, customThemes);
}

/** Parse the session-saved custom themes blob (never throws). */
export function readCustomThemes(storage = globalThis) {
  try {
    const raw = storage.sessionStorage?.getItem(CUSTOM_THEMES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}

/**
 * Resolve which theme id applies to a page. PURE — pass everything in.
 * Resolution order (mirrors proto-nav.js wfThemeDetect):
 *   session override → per-section assignment → item.theme → section.theme
 *   → nearest isGroup walk-back → config.defaultTheme → 'nib'
 *
 * @param {object} opts
 *   page          — findPage() result (or null)
 *   sections      — the SECTIONS array (for the group walk-back)
 *   defaultTheme  — WF_CONFIG.defaultTheme
 *   override      — sessionStorage wf_theme_override value (or null)
 *   assignments   — parsed wf_theme_assignments map (or null)
 */
export function resolveThemeId({ page, sections = [], defaultTheme = 'nib', override = null, assignments = null }) {
  if (override) return override;

  let resolved = defaultTheme || 'nib';
  if (page) {
    const item = page.parentItem || page.item;
    if (item && item.theme) {
      resolved = item.theme;
    } else if (page.section && page.section.theme) {
      resolved = page.section.theme;
    } else if (page.sectionIndex !== undefined) {
      for (let g = page.sectionIndex - 1; g >= 0; g--) {
        if (sections[g].isGroup && sections[g].theme) { resolved = sections[g].theme; break; }
      }
    }
  }

  if (assignments && page) {
    if (page.sectionIndex !== undefined) {
      for (let g = page.sectionIndex; g >= 0; g--) {
        if (sections[g].isGroup && assignments[sections[g].id]) { resolved = assignments[sections[g].id]; break; }
      }
    }
    // Section-level assignment overrides group
    if (page.section && assignments[page.section.id]) {
      resolved = assignments[page.section.id];
    }
  }
  return resolved;
}

const _injectedFontUrls = {};

/**
 * Apply a theme: release every themable token back to the stylesheets,
 * then stamp the theme's own font/token overrides inline. Also loads the
 * theme's webfont (once) and stamps data-wf-theme for CSS hooks.
 * Returns the id actually applied ('nib' when the id is unknown).
 */
export function applyTheme(themeId, themes = BUILT_IN_THEMES, root = document.documentElement) {
  let theme = themes[themeId];
  if (!theme) { themeId = 'nib'; theme = themes['nib'] || BUILT_IN_THEMES['nib']; }

  for (let i = 0; i < THEME_TOKENS.length; i++) root.style.removeProperty(THEME_TOKENS[i]);

  if (theme.fontUrl && !_injectedFontUrls[theme.fontUrl] && typeof document !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = theme.fontUrl;
    document.head.appendChild(link);
    _injectedFontUrls[theme.fontUrl] = true;
  }

  if (theme.font) root.style.setProperty('--wf-font', theme.font);
  if (theme.tokens) {
    for (const token in theme.tokens) {
      if (Object.prototype.hasOwnProperty.call(theme.tokens, token)) {
        root.style.setProperty(token, theme.tokens[token]);
      }
    }
  }
  root.setAttribute('data-wf-theme', themeId);
  return themeId;
}
