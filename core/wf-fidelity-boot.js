/* wf-fidelity-boot.js — portable pre-paint fidelity bootstrap (the FLASH-1 fix).
 *
 * Load this as the FIRST element in <head>, before any stylesheet:
 *     <script src="core/wf-fidelity-boot.js"></script>
 *
 * It reads the saved fidelity from localStorage and sets data-wf-fidelity on
 * <html> BEFORE first paint, so napkin pages don't paint blueprint-first and
 * then snap. Any project that links its fidelity CSS in <head> gets a flash-free
 * load from this one line. (eqPartners loads its fidelity CSS lazily via
 * wf-nav.js, so it injects the equivalent at the edge in worker/index.js.)
 *
 * FLASH-2 (the stencil/ink-frame pop-in) is already handled for every consumer
 * inside wf-napkin.js — gated on napkin + stamped early. This file only covers
 * the pre-paint attribute, which no end-of-body script can fix.
 */
(function () {
  try {
    var v = localStorage.getItem('wf_fidelity');
    if (v != null) {
      var f = ['napkin', 'blueprint', 'polished'][parseInt(v, 10)];
      if (f) document.documentElement.setAttribute('data-wf-fidelity', f);
    }
  } catch (e) {}
})();
