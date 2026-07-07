/**
 * core/shell/fidelity.js — fidelity state, storage, and apply semantics.
 *
 * Canonical PURE implementation of the fidelity contract, shared by any
 * framework binding (packages/nib-react consumes it). The classic-script
 * chrome (core/proto-nav.js + core/wf-fidelity-boot.js) carries the same
 * logic inline because it must run on file:// without modules — keep the
 * two in sync when the contract changes.
 *
 * The contract itself is framework-agnostic:
 *   - <html data-wf-fidelity="napkin|blueprint|polished"> gates all CSS
 *   - localStorage 'wf_fidelity' (index as string) survives sessions and
 *     is read pre-paint by wf-fidelity-boot.js
 *   - sessionStorage 'wf_fidelity' is kept for legacy proto-nav pages so
 *     fidelity follows the user between a React shell and static pages
 */

export const FIDELITY_VALUES = ['napkin', 'blueprint', 'polished'];
export const FIDELITY_LABELS = ['Napkin', 'Blueprint', 'Polished'];
export const FIDELITY_STORAGE_KEY = 'wf_fidelity';
export const DEFAULT_FIDELITY = 'blueprint';

/** 'napkin' → 0; unknown names → index of DEFAULT_FIDELITY. */
export function fidelityIndex(name) {
  const i = FIDELITY_VALUES.indexOf(name);
  return i === -1 ? FIDELITY_VALUES.indexOf(DEFAULT_FIDELITY) : i;
}

/** 0 → 'napkin'; out-of-range → DEFAULT_FIDELITY. */
export function fidelityName(index) {
  return FIDELITY_VALUES[parseInt(index, 10)] || DEFAULT_FIDELITY;
}

/**
 * Read the persisted fidelity name, or null when nothing is stored.
 * sessionStorage wins (it reflects the newest in-tab choice on legacy
 * pages); localStorage is the cross-session fallback.
 */
export function readStoredFidelity(storage = globalThis) {
  let raw = null;
  try { raw = storage.sessionStorage?.getItem(FIDELITY_STORAGE_KEY); } catch (e) { /* sandboxed */ }
  if (raw == null) {
    try { raw = storage.localStorage?.getItem(FIDELITY_STORAGE_KEY); } catch (e) { /* sandboxed */ }
  }
  return raw == null ? null : fidelityName(raw);
}

/** Persist to BOTH storages (see contract note above). */
export function storeFidelity(name, storage = globalThis) {
  const val = String(fidelityIndex(name));
  try { storage.sessionStorage?.setItem(FIDELITY_STORAGE_KEY, val); } catch (e) { /* sandboxed */ }
  try { storage.localStorage?.setItem(FIDELITY_STORAGE_KEY, val); } catch (e) { /* sandboxed */ }
}

/** Stamp the attribute that gates every fidelity stylesheet rule. */
export function applyFidelity(name, root = document.documentElement) {
  root.setAttribute('data-wf-fidelity', fidelityName(fidelityIndex(name)));
}

/**
 * Inline-script source for SSR frameworks (Next.js etc.): emit this as the
 * FIRST <script> in <head> so the saved fidelity is applied before first
 * paint — the module graph loads far too late to prevent the flash. This is
 * the same logic as core/wf-fidelity-boot.js.
 */
export const FIDELITY_BOOT_SNIPPET =
  "(function(){try{var v=localStorage.getItem('" + FIDELITY_STORAGE_KEY + "');" +
  "if(v!=null){var f=['napkin','blueprint','polished'][parseInt(v,10)];" +
  "if(f)document.documentElement.setAttribute('data-wf-fidelity',f);}}catch(e){}})();";
