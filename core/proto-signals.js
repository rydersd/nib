/**
 * proto-signals.js — Intelligence Signal Layer
 *
 * A collapsible "intelligence signal bar" — a thin strip that expands into
 * a panel of insight cards. Generic: drop a mount div anywhere between the
 * context bar and page content and pass it signal data as JSON.
 *
 * Usage:
 *
 *   <div class="wf-signal-mount"
 *        data-label="Account Intelligence"
 *        data-signals='[
 *          {
 *            "type": "opportunity",
 *            "label": "Upsell",
 *            "headline": "Expansion opportunity",
 *            "body": "Comparable accounts that add the analytics module retain at 1.8x the rate.",
 *            "metric": "1.8x",
 *            "metricLabel": "retention lift",
 *            "action": "See the analytics module",
 *            "actionHref": "#"
 *          }
 *        ]'>
 *   </div>
 *   <script src="../nib/core/proto-signals.js"></script>
 *
 * Signal types: program | risk | opportunity | insight
 *
 *   program     — tied to an active program or playbook. color: accent/blue.
 *   risk        — something that may go wrong or shows a warning pattern.
 *                 color: amber/red. Signals friction, churn risk, a gap.
 *   opportunity — a positive action someone could take right now.
 *                 color: green. Signals upside.
 *   insight     — a neutral observation derived from pattern matching.
 *                 color: muted. Signals "here's what we noticed."
 *
 * data-label sets the bar/panel title (defaults to "Intelligence").
 * Companion CSS lives in core/proto-components.css under "Signal layer".
 */

(function () {
  'use strict';

  var TYPE_META = {
    program:     { icon: '⚡', label: 'Program Signal' }, // ⚡
    risk:        { icon: '⚠', label: 'Risk Detected' },  // ⚠
    opportunity: { icon: '↑', label: 'Opportunity' },    // ↑
    insight:     { icon: '◎', label: 'Insight' }         // ◎
  };

  function classFor(type) {
    return TYPE_META[type] ? type : 'insight';
  }

  function buildBar(mount, signals, label) {
    label = label || 'Intelligence';

    /* ── Collapsed bar ── */
    var bar = document.createElement('div');
    bar.className = 'wf-signal-bar';
    bar.setAttribute('role', 'button');
    bar.setAttribute('aria-expanded', 'false');
    bar.setAttribute('aria-controls', 'wf-signal-panel');
    bar.setAttribute('tabindex', '0');
    bar.setAttribute('title', label + ' — click to expand');

    var barLabel = document.createElement('span');
    barLabel.className = 'wf-signal-bar-label';
    barLabel.innerHTML = '<span class="wf-signal-icon">✨</span> ' + escapeHtml(label);

    var pills = document.createElement('span');
    pills.className = 'wf-signal-pills';
    signals.slice(0, 3).forEach(function (sig) {
      var cls = classFor(sig.type);
      var m = TYPE_META[cls];
      var pill = document.createElement('span');
      pill.className = 'wf-signal-pill ' + cls;
      pill.textContent = m.icon + ' ' + (sig.label || m.label);
      pills.appendChild(pill);
    });

    var toggle = document.createElement('span');
    toggle.className = 'wf-signal-bar-toggle';
    toggle.textContent = countText(signals.length) + ' · Expand ↓';

    bar.appendChild(barLabel);
    bar.appendChild(pills);
    bar.appendChild(toggle);

    /* ── Expanded panel ── */
    var panel = document.createElement('div');
    panel.className = 'wf-signal-panel';
    panel.id = 'wf-signal-panel';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', label + ' signals');

    var hd = document.createElement('div');
    hd.className = 'wf-signal-panel-hd';

    var title = document.createElement('span');
    title.className = 'wf-signal-panel-title';
    title.innerHTML = '✨ ' + escapeHtml(label);

    var ctx = document.createElement('span');
    ctx.className = 'wf-signal-panel-context';
    ctx.textContent = countText(signals.length);

    var closeBtn = document.createElement('button');
    closeBtn.className = 'wf-signal-panel-close';
    closeBtn.textContent = 'Collapse ↑';
    closeBtn.setAttribute('aria-label', 'Collapse signal panel');

    hd.appendChild(title);
    hd.appendChild(ctx);
    hd.appendChild(closeBtn);

    var cards = document.createElement('div');
    cards.className = 'wf-signal-cards';

    signals.forEach(function (sig) {
      var cls = classFor(sig.type);
      var m = TYPE_META[cls];
      var card = document.createElement('div');
      card.className = 'wf-signal-card ' + cls;

      var typeRow = document.createElement('div');
      typeRow.className = 'wf-signal-card-type';
      typeRow.textContent = m.icon + ' ' + m.label;

      var headline = document.createElement('div');
      headline.className = 'wf-signal-card-headline';
      headline.textContent = sig.headline || '';

      card.appendChild(typeRow);
      card.appendChild(headline);

      if (sig.metric) {
        var metricVal = document.createElement('div');
        metricVal.className = 'wf-signal-card-metric';
        metricVal.textContent = sig.metric;
        card.appendChild(metricVal);
        if (sig.metricLabel) {
          var metricLbl = document.createElement('div');
          metricLbl.className = 'wf-signal-card-metric-label';
          metricLbl.textContent = sig.metricLabel;
          card.appendChild(metricLbl);
        }
      }

      var body = document.createElement('div');
      body.className = 'wf-signal-card-body';
      body.textContent = sig.body || '';
      card.appendChild(body);

      if (sig.action) {
        var action = document.createElement('a');
        action.className = 'wf-signal-card-action';
        action.textContent = sig.action + ' →';
        action.href = sig.actionHref || '#';
        card.appendChild(action);
      }

      cards.appendChild(card);
    });

    panel.appendChild(hd);
    panel.appendChild(cards);

    /* ── Toggle logic ── */
    function openPanel() {
      panel.classList.add('open');
      bar.setAttribute('aria-expanded', 'true');
      toggle.textContent = countText(signals.length) + ' · Collapse ↑';
    }
    function closePanel() {
      panel.classList.remove('open');
      bar.setAttribute('aria-expanded', 'false');
      toggle.textContent = countText(signals.length) + ' · Expand ↓';
    }

    bar.addEventListener('click', function () {
      panel.classList.contains('open') ? closePanel() : openPanel();
    });
    bar.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        panel.classList.contains('open') ? closePanel() : openPanel();
      }
    });
    closeBtn.addEventListener('click', function (e) { e.stopPropagation(); closePanel(); });

    /* ── Mount ── */
    mount.parentNode.insertBefore(bar, mount);
    mount.parentNode.insertBefore(panel, mount);
    mount.remove();
  }

  function countText(n) {
    return n + ' signal' + (n !== 1 ? 's' : '');
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function init() {
    document.querySelectorAll('.wf-signal-mount').forEach(function (mount) {
      var signals = [];
      try {
        signals = JSON.parse(mount.dataset.signals || '[]');
      } catch (e) {
        console.warn('proto-signals: invalid JSON in data-signals', e);
      }
      if (!signals.length) return;
      buildBar(mount, signals, mount.dataset.label || '');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
