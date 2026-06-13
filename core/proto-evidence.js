/**
 * proto-evidence.js — evidence-driven fidelity.
 *
 * Turns the prototype's texture into a heatmap of design certainty. Any
 * element can carry a `data-wf-evidence` attribute declaring how grounded
 * that region is:
 *
 *   <div class="wf-card" data-wf-evidence="guess">       ...invented
 *   <div class="wf-card" data-wf-evidence="assumption">  ...rests on an assumption
 *   <div class="wf-card" data-wf-evidence="researched"   ...backed by research
 *        data-wf-evidence-source="Usability round 3, S07">
 *   <div class="wf-card" data-wf-evidence="validated">   ...tested / signed off
 *
 * Lower-evidence regions render rougher (hand-sketched, heavily wobbled);
 * higher-evidence regions render crisp — at *every* global fidelity level.
 * Roughness stops being a mode you toggle and becomes a signal you earn.
 *
 * This is the page-level generalisation of `data-wf-confidence` and a
 * sibling of the service-blueprint evidence model in core/blueprint/
 * evidence.js (which keeps the journey.js research/spec/design-rationale
 * kinds for the React canvas; the mapping is documented in ref/evidence.md).
 *
 * Opt-in: include the script + core/proto-evidence.css. It self-initialises
 * on DOMContentLoaded and is a no-op on pages with no `data-wf-evidence`.
 *
 * API: window.wfEvidence = { refresh, heatmap, summary, flashLevel, LEVELS, ORDER }.
 */

(function () {
  'use strict';

  /* ── The evidence ladder — roughest → crispest ───────────────────────── */
  var LEVELS = {
    guess: {
      rank: 0, label: 'Guess',
      hint: 'Invented to move forward — no backing yet.',
    },
    assumption: {
      rank: 1, label: 'Assumption',
      hint: 'Rests on a stated design assumption, not evidence.',
    },
    researched: {
      rank: 2, label: 'Researched',
      hint: 'Backed by a research finding or citation.',
    },
    validated: {
      rank: 3, label: 'Validated',
      hint: 'Tested with users or signed off by stakeholders.',
    },
  };
  var ORDER = ['guess', 'assumption', 'researched', 'validated'];
  var SOURCED_LEVELS = ['researched', 'validated']; // a claim here wants a source
  var HEATMAP_KEY = 'wf_evidence_heatmap';

  /* ── Helpers ─────────────────────────────────────────────────────────── */
  function normLevel(raw) {
    var v = String(raw || '').trim().toLowerCase();
    // tolerate a few natural synonyms so authoring stays forgiving
    if (v === 'sketch' || v === 'placeholder' || v === 'invented') v = 'guess';
    if (v === 'assumed' || v === 'rationale') v = 'assumption';
    if (v === 'research' || v === 'evidence' || v === 'cited') v = 'researched';
    if (v === 'tested' || v === 'signed-off' || v === 'approved') v = 'validated';
    return LEVELS[v] ? v : null;
  }

  function regions() {
    return Array.prototype.slice.call(
      document.querySelectorAll('[data-wf-evidence]')
    );
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[<>&"]/g, function (c) {
      return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c];
    });
  }

  function track(event, data) {
    if (typeof window.wfTrack === 'function') window.wfTrack(event, data);
  }

  /* ── Decorate one region ─────────────────────────────────────────────── */
  function decorate(el) {
    var raw = el.getAttribute('data-wf-evidence');
    var level = normLevel(raw);
    if (!level) {
      // Unknown value — treat as a guess (unknown grounding *is* a guess)
      // but keep the authored attribute visible for debugging.
      if (window.console) console.warn(
        'proto-evidence: unrecognised data-wf-evidence="' + raw +
        '" — treating as "guess".', el);
      level = 'guess';
    }

    // State classes — wf-ev is the hook, wf-ev--<level> drives the styling.
    el.classList.add('wf-ev', 'wf-ev--' + level);
    ORDER.forEach(function (l) {
      if (l !== level) el.classList.remove('wf-ev--' + l);
    });

    // A sourced-tier claim with no citation is honest about being unbacked.
    var source = (el.getAttribute('data-wf-evidence-source') || '').trim();
    var unsourced = SOURCED_LEVELS.indexOf(level) !== -1 && !source;
    el.classList.toggle('wf-ev--unsourced', unsourced);

    // Table-structural and root elements can't host an absolutely-positioned
    // child reliably (and `position:relative` on them is invalid/ignored), so
    // skip the position mutation + chip entirely — the border treatment from
    // the wf-ev classes above still applies.
    var NO_CHIP_TAGS = ['TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'TD', 'TH',
                        'COL', 'COLGROUP', 'BODY', 'HTML'];
    if (NO_CHIP_TAGS.indexOf(el.tagName) !== -1) {
      var staleChip = el.querySelector(':scope > .wf-ev-chip');
      if (staleChip) staleChip.remove();
      return { el: el, level: level, source: source, unsourced: unsourced };
    }

    // Containing block for the absolutely-positioned chip.
    if (getComputedStyle(el).position === 'static') {
      el.style.position = 'relative';
    }

    // Inject (or refresh) the corner chip unless opted out.
    var existing = el.querySelector(':scope > .wf-ev-chip');
    if (el.getAttribute('data-wf-evidence-chip') === 'off') {
      if (existing) existing.remove();
    } else {
      var meta = LEVELS[level];
      var title = meta.hint + (source ? '  •  Source: ' + source
        : (unsourced ? '  •  No source cited yet' : ''));
      var html =
        '<span class="wf-ev-chip-dot"></span>' +
        '<span class="wf-ev-chip-label">' + meta.label + '</span>' +
        (unsourced ? '<span class="wf-ev-chip-flag" title="No source cited">?</span>'
                   : '');
      if (existing) {
        existing.innerHTML = html;
      } else {
        existing = document.createElement('span');
        existing.innerHTML = html;
        el.insertBefore(existing, el.firstChild);
      }
      existing.className = 'wf-ev-chip wf-ev-chip--' + level;
      existing.setAttribute('title', title);
    }
    return { el: el, level: level, source: source, unsourced: unsourced };
  }

  /* ── The legend / certainty panel ────────────────────────────────────── */
  function tally(records) {
    var counts = { guess: 0, assumption: 0, researched: 0, validated: 0 };
    var unsourced = 0;
    records.forEach(function (r) {
      counts[r.level]++;
      if (r.unsourced) unsourced++;
    });
    return { counts: counts, unsourced: unsourced, total: records.length };
  }

  function renderLegend(records) {
    var t = tally(records);
    var panel = document.getElementById('wf-ev-legend');
    if (!t.total) { if (panel) panel.remove(); return; }

    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'wf-ev-legend';
      panel.className = 'wf-ev-legend';
      document.body.appendChild(panel);
    }

    // The certainty score — share of regions at researched-or-better.
    var grounded = t.counts.researched + t.counts.validated;
    var pct = Math.round((grounded / t.total) * 100);

    var rows = ORDER.map(function (l) {
      var m = LEVELS[l];
      return '<button class="wf-ev-legend-row" data-level="' + l + '" ' +
        'title="Highlight ' + m.label + ' regions">' +
        '<span class="wf-ev-swatch wf-ev-swatch--' + l + '"></span>' +
        '<span class="wf-ev-legend-label">' + m.label + '</span>' +
        '<span class="wf-ev-legend-count">' + t.counts[l] + '</span>' +
        '</button>';
    }).join('');

    var heatOn = document.body.classList.contains('wf-ev-heatmap');
    panel.innerHTML =
      '<div class="wf-ev-legend-head">' +
        '<span class="wf-ev-legend-title">Evidence</span>' +
        '<span class="wf-ev-score" title="Share of regions backed by ' +
          'research or validation">' + pct + '% grounded</span>' +
        '<button class="wf-ev-legend-collapse" title="Collapse">–</button>' +
      '</div>' +
      '<div class="wf-ev-legend-body">' +
        '<div class="wf-ev-meter" aria-hidden="true">' +
          ORDER.map(function (l) {
            var w = t.total ? (t.counts[l] / t.total * 100) : 0;
            return '<span class="wf-ev-meter-seg wf-ev-meter-seg--' + l +
              '" style="width:' + w + '%"></span>';
          }).join('') +
        '</div>' +
        rows +
        (t.unsourced
          ? '<p class="wf-ev-legend-note">' + t.unsourced +
            ' region' + (t.unsourced > 1 ? 's' : '') +
            ' claim research/validation with no source cited.</p>'
          : '') +
        '<label class="wf-ev-heatmap-toggle">' +
          '<input type="checkbox" id="wf-ev-heatmap-cb"' +
            (heatOn ? ' checked' : '') + '> Heatmap' +
        '</label>' +
        '<p class="wf-ev-legend-summary">' + t.total + ' marked region' +
          (t.total > 1 ? 's' : '') + ' on this page.</p>' +
      '</div>';

    // Collapse toggle
    panel.querySelector('.wf-ev-legend-collapse').onclick = function () {
      panel.classList.toggle('is-collapsed');
      this.textContent = panel.classList.contains('is-collapsed') ? '+' : '–';
      this.title = panel.classList.contains('is-collapsed') ? 'Expand' : 'Collapse';
    };
    // Heatmap checkbox
    panel.querySelector('#wf-ev-heatmap-cb').onchange = function () {
      heatmap(this.checked);
    };
    // Click a legend row → flash that level's regions
    panel.querySelectorAll('.wf-ev-legend-row').forEach(function (btn) {
      btn.onclick = function () { flashLevel(btn.getAttribute('data-level')); };
    });
  }

  /* ── Interactions ────────────────────────────────────────────────────── */
  function flashLevel(level) {
    document.querySelectorAll('.wf-ev--' + level).forEach(function (el) {
      el.classList.remove('wf-ev-flash');
      void el.offsetWidth;          // restart the animation
      el.classList.add('wf-ev-flash');
      setTimeout(function () { el.classList.remove('wf-ev-flash'); }, 1200);
    });
    track('evidence_flash', { level: level });
  }

  function heatmap(on) {
    on = !!on;
    document.body.classList.toggle('wf-ev-heatmap', on);
    try { sessionStorage.setItem(HEATMAP_KEY, on ? '1' : '0'); } catch (e) {}
    var cb = document.getElementById('wf-ev-heatmap-cb');
    if (cb) cb.checked = on;
    track('evidence_heatmap', { on: on });
  }

  /* ── Public refresh — re-scan after dynamic DOM changes ──────────────── */
  function refresh() {
    var records = regions().map(decorate);
    renderLegend(records);
    return tally(records);
  }

  /* ── Init ────────────────────────────────────────────────────────────── */
  function init() {
    if (!regions().length) return;     // no-op when the page uses no evidence
    var heatSaved;
    try { heatSaved = sessionStorage.getItem(HEATMAP_KEY); } catch (e) {}
    if (heatSaved === '1') document.body.classList.add('wf-ev-heatmap');
    refresh();
    track('evidence_init', summary());
  }

  function summary() { return refresh(); }

  window.wfEvidence = {
    refresh: refresh,
    heatmap: heatmap,
    summary: summary,
    flashLevel: flashLevel,
    LEVELS: LEVELS,
    ORDER: ORDER.slice(),
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
