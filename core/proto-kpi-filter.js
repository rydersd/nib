/**
 * proto-kpi-filter.js — Universal KPI-card-as-filter for wireframe pages
 *
 * Convention-based: auto-discovers .ds-kpi-card elements and the nearest
 * filterable table (.ds-data-table, .wf-table, or first <table>).
 * Clicking a card filters the table to rows matching that card's segment.
 * Clicking again (or clicking "All Pipeline" / first card) clears the filter.
 *
 * How it decides what to filter:
 *  1. Explicit: data-kpi-filter="colIndex:value" on the card
 *  2. Explicit: data-kpi-col="3" data-kpi-match="Pending,Under Review"
 *  3. Auto: scans card label text for known status keywords, matches against
 *     table cell text content
 *
 * Cards that can't be mapped to a filter (percentages, rates, averages)
 * get a visual highlight on click but don't filter.
 *
 * Skips pages that define window.WF_KPI_FILTER_SKIP = true.
 *
 * Lightning-style pattern: click card → filter table + show pill, card gets
 * an accent ring. KPI values always show full-dataset numbers (cards are
 * entry points, not filtered views).
 */
(function() {
  'use strict';

  // Skip if page opts out or already has custom KPI filtering
  if (window.WF_KPI_FILTER_SKIP) return;

  // ── Known label → filter mapping (lowercase label → { keywords[], matchMode }) ──
  // matchMode: 'contains' = cell text contains any keyword
  //            'all'      = show all rows (pipeline/aggregate cards)
  //            'none'     = not filterable (analytics-only card)
  var LABEL_MAP = {
    // Status-based
    'pending':           { keywords: ['pending', 'pending review', 'pending approval'], mode: 'contains' },
    'pending review':    { keywords: ['pending', 'pending review'], mode: 'contains' },
    'pending approval':  { keywords: ['pending', 'pending approval'], mode: 'contains' },
    'approved':          { keywords: ['approved'], mode: 'contains' },
    'rejected':          { keywords: ['rejected', 'denied'], mode: 'contains' },
    'conflicts':         { keywords: ['conflict'], mode: 'contains' },
    'at risk':           { keywords: ['at risk', 'risk', 'warning'], mode: 'contains' },
    'at-risk':           { keywords: ['at risk', 'risk'], mode: 'contains' },
    'overdue':           { keywords: ['overdue'], mode: 'contains' },
    'urgent':            { keywords: ['urgent'], mode: 'contains' },
    'high priority':     { keywords: ['high'], mode: 'contains' },
    'sla warning':       { keywords: ['overdue', 'warning', 'sla'], mode: 'contains' },

    // Stage-based
    'qualify':           { keywords: ['qualify'], mode: 'contains' },
    'propose':           { keywords: ['propose'], mode: 'contains' },
    'negotiate':         { keywords: ['negotiate'], mode: 'contains' },
    'verbal':            { keywords: ['verbal'], mode: 'contains' },
    'closed won':        { keywords: ['closed won', 'won'], mode: 'contains' },
    'won':               { keywords: ['closed won', 'won'], mode: 'contains' },

    // Needs-action style
    'needs action':      { keywords: ['qualify', 'propose'], mode: 'contains' },
    'action required':   { keywords: ['action', 'urgent'], mode: 'contains' },

    // Pipeline / aggregate — show all
    'pipeline':          { keywords: [], mode: 'all' },
    'active':            { keywords: [], mode: 'all' },
    'total':             { keywords: [], mode: 'all' },
    'open':              { keywords: [], mode: 'all' },

    // Not filterable
    'avg':               { keywords: [], mode: 'none' },
    'average':           { keywords: [], mode: 'none' },
    'rate':              { keywords: [], mode: 'none' },
    'utilization':       { keywords: [], mode: 'none' },
    'roi':               { keywords: [], mode: 'none' },
    'pace':              { keywords: [], mode: 'none' },
    'compliance':        { keywords: [], mode: 'none' },
    'monthly':           { keywords: [], mode: 'none' },
    'burn':              { keywords: [], mode: 'none' }
  };

  // ── Styles (all colors via Nib design tokens) ──
  var STYLE_ID = 'wf-kpi-filter-styles';
  if (!document.getElementById(STYLE_ID)) {
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.ds-kpi-card[data-kpi-wired], .sfdc-kpi-card[data-kpi-wired] { cursor: pointer; transition: box-shadow .15s, background .15s; }',
      '.ds-kpi-card[data-kpi-wired]:hover, .sfdc-kpi-card[data-kpi-wired]:hover { box-shadow: 0 0 0 1px var(--wf-accent); }',
      '.ds-kpi-card[data-kpi-wired].kpi-active, .sfdc-kpi-card[data-kpi-wired].kpi-active { box-shadow: 0 0 0 2px var(--wf-accent); background: var(--wf-accent-lt); }',
      '.ds-kpi-card[data-kpi-nofilt], .sfdc-kpi-card[data-kpi-nofilt] { cursor: default; opacity: .75; }',
      '.ds-kpi-card[data-kpi-nofilt]:hover, .sfdc-kpi-card[data-kpi-nofilt]:hover { box-shadow: none; }',
      '[id^=wf-kpi-pill-bar] { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }',
      '.wf-kpi-pill { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; background: var(--wf-accent-lt); border: 1px solid var(--wf-accent); border-radius: 12px; font-size: 11px; color: var(--wf-accent); font-weight: 600; }',
      '.wf-kpi-pill button { background: none; border: none; cursor: pointer; font-size: 13px; color: var(--wf-accent); padding: 0; line-height: 1; }',
      '.wf-kpi-clear { font-size: 11px; color: var(--wf-accent); background: none; border: none; cursor: pointer; font-weight: 600; }',
      'tr.wf-kpi-hidden { display: none; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // Find all KPI grids (ds- and sfdc- variants)
    var grids = document.querySelectorAll('.ds-kpi-grid, .sfdc-kpi-grid');
    grids.forEach(function(grid) {
      wireGrid(grid);
    });

    // Wire up filter bars (search + selects)
    wireFilterBars();
  }

  function wireGrid(grid) {
    var cards = grid.querySelectorAll('.ds-kpi-card, .sfdc-kpi-card');
    if (!cards.length) return;

    // Find the nearest table below this grid
    var table = findTable(grid);
    if (!table) return; // No table to filter

    var tbody = table.querySelector('tbody') || table;
    var rows = tbody.querySelectorAll('tr');
    if (!rows.length) return;

    // Create pill bar (inserted after grid)
    var pillBar = document.createElement('div');
    pillBar.id = 'wf-kpi-pill-bar-' + Math.random().toString(36).substr(2, 6);
    pillBar.style.display = 'none';
    grid.parentNode.insertBefore(pillBar, grid.nextSibling);

    var state = { activeCard: null, pillBar: pillBar, table: table, tbody: tbody, rows: rows };

    cards.forEach(function(card) {
      var mapping = resolveMapping(card);
      if (mapping.mode === 'none') {
        card.setAttribute('data-kpi-nofilt', '');
        return;
      }

      card.setAttribute('data-kpi-wired', '');
      card.addEventListener('click', function() {
        if (state.activeCard === card) {
          clearFilter(state, cards);
        } else {
          applyFilter(card, mapping, state, cards);
        }
      });
    });
  }

  function findTable(grid) {
    // Walk siblings after the grid looking for a table
    var el = grid.nextElementSibling;
    var maxDepth = 8; // Don't look too far
    while (el && maxDepth-- > 0) {
      var t = el.querySelector('table.ds-data-table') ||
              el.querySelector('table.wf-table') ||
              el.querySelector('table');
      if (t) return t;
      if (el.tagName === 'TABLE') return el;
      el = el.nextElementSibling;
    }

    // Also try within parent container
    var parent = grid.parentElement;
    if (parent) {
      return parent.querySelector('table.ds-data-table') ||
             parent.querySelector('table.wf-table') ||
             parent.querySelector('table');
    }
    return null;
  }

  function resolveMapping(card) {
    // 1. Explicit data-kpi-filter attribute
    var explicit = card.getAttribute('data-kpi-filter');
    if (explicit) {
      var parts = explicit.split(':');
      return { mode: 'explicit', colIndex: parseInt(parts[0], 10), keywords: parts[1].split(',').map(function(s) { return s.trim().toLowerCase(); }) };
    }

    // 2. Explicit col + match
    var col = card.getAttribute('data-kpi-col');
    var match = card.getAttribute('data-kpi-match');
    if (col && match) {
      return { mode: 'explicit', colIndex: parseInt(col, 10), keywords: match.split(',').map(function(s) { return s.trim().toLowerCase(); }) };
    }

    // 3. Infer from label text
    var labelEl = card.querySelector('.ds-kpi-label, .sfdc-kpi-label');
    if (!labelEl) return { mode: 'none', keywords: [] };
    var label = labelEl.textContent.trim().toLowerCase();

    // Try exact match first, then partial
    for (var key in LABEL_MAP) {
      if (label === key || label.indexOf(key) !== -1) {
        return { mode: LABEL_MAP[key].mode, keywords: LABEL_MAP[key].keywords, label: labelEl.textContent.trim() };
      }
    }

    // Check if the card value looks like a count (number without $ or %)
    var valEl = card.querySelector('.ds-kpi-value, .sfdc-kpi-value');
    if (valEl) {
      var val = valEl.textContent.trim();
      if (/^\d+$/.test(val)) {
        return { mode: 'contains', keywords: [label.replace(/[^a-z ]/g, '').trim()], label: labelEl.textContent.trim() };
      }
    }

    // Dollar amounts with label → show all (pipeline-style)
    return { mode: 'all', keywords: [], label: labelEl.textContent.trim() };
  }

  function applyFilter(card, mapping, state, allCards) {
    state.activeCard = card;

    // Update card styles
    allCards.forEach(function(c) { c.classList.remove('kpi-active'); });
    card.classList.add('kpi-active');

    var rows = state.rows;

    if (mapping.mode === 'all') {
      rows.forEach(function(row) {
        row.classList.remove('wf-kpi-hidden');
      });
    } else if (mapping.mode === 'explicit') {
      rows.forEach(function(row) {
        var cells = row.querySelectorAll('td');
        if (!cells.length) return;
        var cell = cells[mapping.colIndex];
        if (!cell) { row.classList.add('wf-kpi-hidden'); return; }
        var text = cell.textContent.toLowerCase().trim();
        var match = mapping.keywords.some(function(kw) { return text.indexOf(kw) !== -1; });
        row.classList.toggle('wf-kpi-hidden', !match);
      });
    } else if (mapping.mode === 'contains') {
      rows.forEach(function(row) {
        var text = row.textContent.toLowerCase();
        var match = mapping.keywords.some(function(kw) { return text.indexOf(kw) !== -1; });
        row.classList.toggle('wf-kpi-hidden', !match);
      });
    }

    // Show pill
    var label = mapping.label || (card.querySelector('.ds-kpi-label, .sfdc-kpi-label') || {}).textContent || '';
    state.pillBar.style.display = 'flex';
    state.pillBar.innerHTML = '<span class="wf-kpi-pill">' + label +
      ' <button onclick="this.closest(\'[id^=wf-kpi-pill-bar]\').dispatchEvent(new Event(\'clear\'))" title="Remove filter">&times;</button></span>' +
      '<button class="wf-kpi-clear" onclick="this.closest(\'[id^=wf-kpi-pill-bar]\').dispatchEvent(new Event(\'clear\'))">Clear All</button>';

    // Wire clear event
    state.pillBar.addEventListener('clear', function handler() {
      state.pillBar.removeEventListener('clear', handler);
      clearFilter(state, allCards);
    });
  }

  function clearFilter(state, allCards) {
    state.activeCard = null;
    allCards.forEach(function(c) { c.classList.remove('kpi-active'); });
    state.rows.forEach(function(row) { row.classList.remove('wf-kpi-hidden'); });
    state.pillBar.style.display = 'none';
    state.pillBar.innerHTML = '';
  }

  // ── Filter bar wiring (search input + select dropdowns) ──
  function wireFilterBars() {
    var bars = document.querySelectorAll('.sfdc-filter-bar, .ds-filter-bar');
    bars.forEach(function(bar) {
      var table = findTable(bar);
      if (!table) return;
      var tbody = table.querySelector('tbody') || table;
      var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr'));

      var selects = bar.querySelectorAll('select');
      var searchInput = bar.querySelector('input[type="text"], input[type="search"]');

      function runFilters() {
        var search = searchInput ? searchInput.value.toLowerCase().trim() : '';
        var selectFilters = [];
        selects.forEach(function(sel) {
          // Skip if first option (the "All" option) is selected
          if (sel.selectedIndex === 0) return;
          selectFilters.push(sel.value.toLowerCase());
        });

        var visibleCount = 0;

        rows.forEach(function(row) {
          var text = row.textContent.toLowerCase();
          var show = true;

          // Search filter — match against first cell
          if (search) {
            var firstCell = row.querySelector('td');
            var firstText = firstCell ? firstCell.textContent.toLowerCase() : '';
            if (firstText.indexOf(search) === -1) show = false;
          }

          // Select filters — match against full row text
          selectFilters.forEach(function(sf) {
            if (text.indexOf(sf) === -1) show = false;
          });

          row.classList.toggle('wf-kpi-hidden', !show);
          if (show) visibleCount++;
        });

        // Update any "Showing N of M" count text in <main>
        var countEls = document.querySelectorAll('main span');
        countEls.forEach(function(el) {
          if (el.textContent.indexOf('Showing') !== -1) {
            el.textContent = el.textContent.replace(/Showing\s+\d+\s+of\s+\d+/i,
              'Showing ' + visibleCount + ' of ' + rows.length);
          }
        });
      }

      if (searchInput) {
        searchInput.addEventListener('input', runFilters);
      }
      selects.forEach(function(sel) {
        sel.addEventListener('change', runFilters);
      });
    });
  }

})();
