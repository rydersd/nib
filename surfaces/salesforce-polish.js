/* salesforce-polish.js — Progressive-enhancement companion to
   surfaces/salesforce.css. Layers three behaviors onto SFDC record pages
   that already use the surface's feed/activity markup.

   Behaviors:
     1. Inject .sfdc-feed-actions (Reply / Forward / More, etc.) into each
        .sfdc-feed-item. The action set depends on the item's
        data-activity-type. CSS handles the hover-reveal.
     2. Add a `title` attribute with an absolute-date tooltip to each
        .sfdc-feed-time element (derived from its relative text).
     3. Toggle `.is-empty` on a .sfdc-activity-panel when its feed items
        are all hidden (e.g. by filter chips), so the user sees a clean
        "No items match this filter" message instead of an empty void.

   Pure progressive enhancement — degrades gracefully if the page lacks
   any of these elements. Safe to load on any page that includes
   surfaces/salesforce.css.

   The script also injects a small style block for .sfdc-feed-actions and
   the .is-empty panel state so the surface CSS doesn't need to change.
   All colors come from Nib design tokens.

   Load: after salesforce.css and after the page's own feed markup.
*/
(function () {
  'use strict';

  /* ── 0. Inject companion styles (idempotent) ─────────────────────── */
  function injectStyles() {
    var STYLE_ID = 'sfdc-polish-styles';
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.sfdc-feed-actions { display: flex; gap: 4px; margin-top: 6px; opacity: 0; transition: opacity .12s; }',
      '.sfdc-feed-item:hover .sfdc-feed-actions, .sfdc-feed-item:focus-within .sfdc-feed-actions { opacity: 1; }',
      '.sfdc-feed-actions button { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 3px;',
      '  border: 1px solid var(--wf-line); background: var(--wf-white, #fff); color: var(--wf-accent);',
      '  cursor: pointer; font-family: inherit; }',
      '.sfdc-feed-actions button:hover { background: var(--wf-accent-lt); }',
      '.sfdc-activity-panel.is-empty::after { content: "No items match this filter."; display: block;',
      '  padding: 24px 12px; text-align: center; font-size: 12px; color: var(--wf-muted); }',
      '.sfdc-activity-panel.is-empty .sfdc-feed-item { display: none; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  /* ── 1. Inject Reply / Forward / More into every feed item ───────── */
  function injectFeedActions() {
    var items = document.querySelectorAll('.sfdc-feed-item');
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var body = item.querySelector('.sfdc-feed-body');
      if (!body) continue;
      if (body.querySelector('.sfdc-feed-actions')) continue; // idempotent

      var type = item.getAttribute('data-activity-type') || 'system';
      var actions = document.createElement('div');
      actions.className = 'sfdc-feed-actions';

      // Action set depends on item type — emails get Reply, calls/meetings
      // get Log notes, Slack-bound items get Open in Slack.
      var html;
      if (item.querySelector('.sfdc-feed-avatar.slack')) {
        html = '<button>Open in Slack</button><button>Reply in thread</button><button>Save</button>';
      } else if (type === 'emails') {
        html = '<button>Reply</button><button>Forward</button><button>Mark unread</button>';
      } else if (type === 'meetings') {
        html = '<button>Open</button><button>Reschedule</button><button>Notes</button>';
      } else if (type === 'calls') {
        html = '<button>Notes</button><button>Schedule follow-up</button><button>Edit</button>';
      } else {
        html = '<button>Open</button><button>Edit</button><button>More</button>';
      }
      actions.innerHTML = html;
      body.appendChild(actions);
    }
  }

  /* ── 2. Add hover-tooltip absolute date to each feed-time ────────── */
  function decorateFeedTimes() {
    var times = document.querySelectorAll('.sfdc-feed-time');
    var now = new Date();
    for (var i = 0; i < times.length; i++) {
      var el = times[i];
      if (el.getAttribute('title')) continue;
      var rel = (el.textContent || '').trim().toLowerCase();
      var abs = computeAbsolute(rel, now);
      if (abs) el.setAttribute('title', abs);
    }
  }

  function computeAbsolute(rel, now) {
    // Crude parser — only meant to give a feel of "absolute hover", not
    // production parsing. Handles "today, 7:45am", "3 days ago",
    // "in 4 days", scheduled-style strings.
    if (!rel) return null;
    var d = new Date(now);
    var m;
    if (/^today/.test(rel)) {
      return now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
             ' · ' + (rel.split(',')[1] || '').trim();
    }
    if ((m = rel.match(/^(\d+)\s*days?\s*ago/))) {
      d.setDate(d.getDate() - parseInt(m[1], 10));
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }
    if ((m = rel.match(/^in\s*(\d+)\s*days?/))) {
      d.setDate(d.getDate() + parseInt(m[1], 10));
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }
    if (/scheduled|thursday|next/i.test(rel)) {
      return rel.charAt(0).toUpperCase() + rel.slice(1);
    }
    return null;
  }

  /* ── 3. Empty-state toggle for the activity panel ────────────────── */
  function updateEmptyState() {
    var panels = document.querySelectorAll('.sfdc-activity-panel');
    for (var i = 0; i < panels.length; i++) {
      var panel = panels[i];
      var items = panel.querySelectorAll('.sfdc-feed-item');
      var anyVisible = false;
      for (var j = 0; j < items.length; j++) {
        // Filter logic may hide items via a CSS class (not just inline
        // style), so test the computed display rather than the inline one.
        if (getComputedStyle(items[j]).display !== 'none') { anyVisible = true; break; }
      }
      var hasItems = items.length > 0;
      panel.classList.toggle('is-empty', hasItems && !anyVisible);
    }
  }

  /* Wire empty-state updates to filter clicks + tab switches. Event
     delegation so this works regardless of when the page-level filter
     listener runs. */
  function wireEmptyStateObservation() {
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t) return;
      if (t.closest('.sfdc-activity-filter-chip') ||
          t.closest('.sfdc-activity-tab')) {
        // Defer so the page's own handler runs first and applies display:none.
        setTimeout(updateEmptyState, 0);
      }
    });
  }

  /* ── Bootstrap ──────────────────────────────────────────────────── */
  function init() {
    injectStyles();
    injectFeedActions();
    decorateFeedTimes();
    wireEmptyStateObservation();
    updateEmptyState(); // initial pass
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
