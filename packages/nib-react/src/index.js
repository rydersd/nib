/**
 * nib-react — React bindings for the Nib wireframe shell.
 *
 *   import { NibProvider, ContextBar, NavDrawer, useFidelity, useTheme }
 *     from 'nib-react';
 *
 * The provider owns the shared contract (<html> attributes + storage
 * keys), so fidelity and theme interoperate with static Nib prototypes.
 * Pure logic lives in nib's core/shell; styling is the shared
 * proto-tokens.css / proto-chrome.css.
 */
export { NibProvider } from './provider.js';
export { ContextBar } from './context-bar.js';
export { NavDrawer } from './nav-drawer.js';
export { NibContext } from './context.js';
export { useNib, useFidelity, useTheme } from './hooks.js';
export { loadNapkinEngine, rescatterNapkin } from './napkin.js';
// Re-export the headless shell for app code that needs the raw models
export * from '../../../core/shell/index.js';
