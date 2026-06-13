/**
 * proto-analytics.js — Umami analytics integration + helpers
 *
 * Behavior:
 *   - Loads the Umami tracking script ONLY when an Umami website ID is
 *     configured via <meta name="wf-umami-id" content="..."> — so local
 *     development never sends events to production analytics.
 *   - Exposes window.wfTrack(eventName, data) for prototype-specific
 *     events (journey-node-open, fidelity-change, feedback-submit, etc.)
 *     Calls become no-ops when Umami isn't loaded.
 *   - Skips localhost / 127.0.0.1 / file:// hosts so devs don't pollute
 *     real metrics while iterating.
 *
 * Config — either of these works:
 *   1. <meta> tags in <head> (preferred, framework-general):
 *        <meta name="wf-umami-id"   content="abc-123-def-456">
 *        <meta name="wf-umami-host" content="https://cloud.umami.is">  (optional)
 *   2. WIREFRAME_CONFIG (set in project-data.js before this script loads):
 *        window.WIREFRAME_CONFIG = {
 *          umami: { id: 'abc-123-def-456', host: 'https://cloud.umami.is' }
 *        };
 *
 * The wf-umami-host can point at a self-hosted Umami install. Defaults to
 * cloud.umami.is. WIREFRAME_CONFIG values are used only when the matching
 * <meta> tag is absent — markup wins so a page can override its project.
 *
 * Load order: project-data.js → proto-nav.js → proto-analytics.js
 */
(function () {
  // Avoid double-init if something dynamically loads us twice.
  if (window.__wfAnalyticsInit) return;
  window.__wfAnalyticsInit = true;

  var WF = window.WIREFRAME_CONFIG || {};
  var cfg = WF.umami || {};

  function meta(name) {
    var el = document.querySelector('meta[name="' + name + '"]');
    return el ? el.getAttribute('content') : '';
  }

  function isLocal() {
    var h = window.location.hostname;
    return !h || h === 'localhost' || h === '127.0.0.1' || h === '::1' || window.location.protocol === 'file:';
  }

  // No-op tracker lives globally regardless of whether Umami loads.
  // Prototype-specific events go through this — call it freely.
  window.wfTrack = function (eventName, data) {
    try {
      if (window.umami && typeof window.umami.track === 'function') {
        if (data) window.umami.track(eventName, data);
        else window.umami.track(eventName);
      } else if (window.__wfTrackQueue) {
        // Buffer events fired before Umami finished loading; drained on init.
        window.__wfTrackQueue.push([eventName, data || null]);
      }
    } catch (e) { /* analytics must never break the page */ }
  };

  // Markup wins; WIREFRAME_CONFIG.umami is the fallback.
  var websiteId = meta('wf-umami-id') || cfg.id || '';
  if (!websiteId) return;        // not configured → no-op
  if (isLocal()) return;          // local dev → no-op
  if (document.querySelector('script[data-wf-umami]')) return; // already loaded

  // Buffer events that fire before script loads.
  window.__wfTrackQueue = [];

  var host = (meta('wf-umami-host') || cfg.host || 'https://cloud.umami.is').replace(/\/+$/, '');
  var s = document.createElement('script');
  s.async = true;
  s.defer = true;
  s.src = host + '/script.js';
  s.setAttribute('data-website-id', websiteId);
  s.setAttribute('data-wf-umami', '1');
  // Auto-track lets Umami record pageviews/clicks; we layer custom events on top.
  s.setAttribute('data-auto-track', 'true');
  s.onload = function () {
    var q = window.__wfTrackQueue || [];
    window.__wfTrackQueue = null;
    for (var i = 0; i < q.length; i++) {
      try {
        if (q[i][1]) window.umami.track(q[i][0], q[i][1]);
        else window.umami.track(q[i][0]);
      } catch (e) {}
    }
  };
  document.head.appendChild(s);
}());
