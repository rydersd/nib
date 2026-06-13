/**
 * proto-search.js — opt-in portal header + collapsible search + AI search mode.
 *
 * Activate via WIREFRAME_CONFIG flags:
 *   portalHeader: true | { logo, nav: [{ label, href }] }
 *     Adds a `.wf-header` strip above the context bar.
 *   search: true | { ai: true, aiMatcher: (query) => result }
 *     Injects a collapsible search widget into the header utility area.
 *     ai: true enables an Ask AI toggle that runs aiMatcher (or a
 *     deterministic fallback that picks the highest-overlap page).
 *
 * This module is loaded by proto-nav.js after the context bar is built when
 * either flag is truthy. It mutates the DOM directly — no React, no build
 * step. Search index is rebuilt from window.SECTIONS on first open.
 */

(function () {
  'use strict';
  var WF = window.WIREFRAME_CONFIG || {};
  var portalCfg = WF.portalHeader;
  var searchCfg = WF.search;

  if (!portalCfg && !searchCfg) return;

  // ── Portal header chrome ─────────────────────────────────────────────────
  function buildPortalHeader() {
    if (!portalCfg) return null;
    var cfg = (typeof portalCfg === 'object') ? portalCfg : {};
    var logo = cfg.logo || WF.logo || '';
    var nav = Array.isArray(cfg.nav) ? cfg.nav : [];
    var navHtml = nav.map(function (n) {
      var href = n.href || '#';
      var label = n.label || '';
      return '<a class="wf-header-nav-link" href="' + href + '">' + label + '</a>';
    }).join('');

    var header = document.createElement('div');
    header.className = 'wf-header';
    header.innerHTML =
      '<div class="wf-header-inner">' +
        '<div class="wf-header-brand">' +
          (logo ? '<img class="wf-header-logo" src="' + logo + '" alt="' + (WF.title || 'Logo') + '" onerror="this.style.display=\'none\'">' : '') +
          '<span class="wf-header-title">' + (WF.title || '') + '</span>' +
        '</div>' +
        '<nav class="wf-header-nav">' + navHtml + '</nav>' +
        '<div class="wf-header-util" id="wf-header-util"></div>' +
      '</div>';

    document.body.insertBefore(header, document.body.firstChild);
    document.body.classList.add('wf-has-portal-header');
    return header;
  }

  // ── Search index — built from SECTIONS lazily ────────────────────────────
  var _searchIndex = null;
  function buildSearchIndex() {
    if (_searchIndex) return _searchIndex;
    var sections = window.SECTIONS || [];
    var out = [];
    for (var i = 0; i < sections.length; i++) {
      var s = sections[i];
      for (var j = 0; j < (s.items || []).length; j++) {
        var it = s.items[j];
        out.push({
          id: it.file,
          label: it.label,
          section: s.label,
          href: it.file + '.html',
          tokens: (s.label + ' ' + it.label + ' ' + it.file).toLowerCase(),
        });
      }
    }
    _searchIndex = out;
    return out;
  }

  function searchFilter(query) {
    var idx = buildSearchIndex();
    var q = String(query || '').trim().toLowerCase();
    if (!q) return [];
    var terms = q.split(/\s+/);
    var scored = [];
    for (var i = 0; i < idx.length; i++) {
      var entry = idx[i];
      var score = 0;
      for (var t = 0; t < terms.length; t++) {
        if (entry.tokens.indexOf(terms[t]) !== -1) score += 1;
      }
      if (score > 0) scored.push({ entry: entry, score: score });
    }
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.slice(0, 10).map(function (s) { return s.entry; });
  }

  // ── Search widget ────────────────────────────────────────────────────────
  var _state = { open: false, ai: false };

  function buildSearchWidget(host) {
    if (!host) return;
    var aiEnabled = searchCfg && typeof searchCfg === 'object' && searchCfg.ai;

    var widget = document.createElement('div');
    widget.className = 'wf-search';
    widget.innerHTML =
      '<button class="wf-search-trigger" type="button" aria-label="Search" title="Search (or click to expand)">' +
        '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">' +
          '<circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
          '<line x1="11" y1="11" x2="14" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
        '</svg>' +
      '</button>' +
      '<div class="wf-search-pane" hidden>' +
        '<input class="wf-search-input" type="search" placeholder="Search pages…" aria-label="Search pages">' +
        (aiEnabled ? '<label class="wf-search-ai-toggle"><input type="checkbox" id="wf-search-ai-cb"> Ask AI</label>' : '') +
        '<div class="wf-search-results" role="listbox"></div>' +
      '</div>';

    host.appendChild(widget);

    var trigger = widget.querySelector('.wf-search-trigger');
    var pane = widget.querySelector('.wf-search-pane');
    var input = widget.querySelector('.wf-search-input');
    var results = widget.querySelector('.wf-search-results');
    var aiCb = widget.querySelector('#wf-search-ai-cb');

    function open() {
      pane.hidden = false;
      _state.open = true;
      setTimeout(function () { input.focus(); }, 0);
    }
    function close() {
      pane.hidden = true;
      _state.open = false;
      input.value = '';
      results.innerHTML = '';
    }

    trigger.addEventListener('click', function () {
      if (_state.open) close(); else open();
    });

    document.addEventListener('click', function (e) {
      if (!widget.contains(e.target) && _state.open) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        open();
      } else if (e.key === 'Escape' && _state.open) {
        close();
      }
    });

    if (aiCb) {
      aiCb.addEventListener('change', function () {
        _state.ai = !!aiCb.checked;
        renderResults(input.value);
      });
    }

    input.addEventListener('input', function () { renderResults(input.value); });

    function renderResults(query) {
      if (!query.trim()) { results.innerHTML = ''; return; }
      if (_state.ai) {
        results.innerHTML = '<div class="wf-search-thinking">🤖 Thinking…</div>';
        runAiQuery(query).then(function (out) {
          results.innerHTML = '';
          if (out.kind === 'page') results.appendChild(renderPageMatch(out.entry, /*ai*/ true, out.rationale));
          else results.appendChild(renderText(out.message || 'No clear match.'));
        });
        return;
      }
      var matches = searchFilter(query);
      results.innerHTML = '';
      if (!matches.length) { results.appendChild(renderText('No matches.')); return; }
      matches.forEach(function (m) { results.appendChild(renderPageMatch(m, /*ai*/ false)); });
    }
  }

  function renderPageMatch(entry, isAi, rationale) {
    var a = document.createElement('a');
    a.className = 'wf-search-result' + (isAi ? ' is-ai' : '');
    a.href = entry.href;
    a.innerHTML =
      '<div class="wf-search-result-label">' + (isAi ? '🤖 ' : '') + entry.label + '</div>' +
      '<div class="wf-search-result-section">' + entry.section + '</div>' +
      (rationale ? '<div class="wf-search-result-rationale">' + rationale + '</div>' : '');
    return a;
  }
  function renderText(msg) {
    var div = document.createElement('div');
    div.className = 'wf-search-empty';
    div.textContent = msg;
    return div;
  }

  // Synthetic Ask-AI matcher — projects can override via WIREFRAME_CONFIG.search.aiMatcher
  function runAiQuery(query) {
    var custom = searchCfg && typeof searchCfg === 'object' && typeof searchCfg.aiMatcher === 'function'
      ? searchCfg.aiMatcher
      : null;
    if (custom) {
      try {
        var p = custom(query);
        return Promise.resolve(p);
      } catch (e) { /* fall through to default */ }
    }
    // Default: pick the highest-scoring page and pretend it's a thoughtful pick.
    return new Promise(function (resolve) {
      setTimeout(function () {
        var matches = searchFilter(query);
        if (matches.length) {
          resolve({ kind: 'page', entry: matches[0], rationale: 'Closest page by token overlap.' });
        } else {
          resolve({ kind: 'message', message: 'No good match. Try different keywords.' });
        }
      }, 350);
    });
  }

  // ── Boot ─────────────────────────────────────────────────────────────────
  function boot() {
    var header = buildPortalHeader();
    if (searchCfg) {
      var host = (header && header.querySelector('#wf-header-util')) || document.body;
      buildSearchWidget(host);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
