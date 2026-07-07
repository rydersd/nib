/**
 * core/shell — the headless Nib shell: fidelity, theme, and navigation
 * logic as pure dependency-free ESM. Framework bindings (packages/
 * nib-react) render these view-models; the classic-script chrome
 * (core/proto-nav.js) carries the same logic inline for file:// pages.
 */
export * from './fidelity.js';
export * from './theme.js';
export * from './nav-model.js';
