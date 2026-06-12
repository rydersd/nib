/* ============================================================================
   home-alt.js — interactivity for the realistic Day-N landing alternates
   ============================================================================
   Simulated agent, demo-grade. Three layers:

   1. Single-shot asks — chips / module rows carry data-ask (what lands in the
      input), data-reply (the canned grounded answer) and optionally
      data-confirm (a commit-level action behind an explicit confirm — Rung 4
      of the agentic-experience autonomy ladder).

   2. Scripted conversations — elements with data-convo="<key>" start a
      multi-turn thread from the CONVOS registry below. Replies can carry
      follow-up chips that continue the thread, so the user gets a canned
      back-and-forth (e.g. the "What's new" release tour).

   3. Recent searches — focusing the ask input drops a "Recent" panel of
      story-grounded items per persona; picking one runs the matching reply.

   Free-text asks fall back to the container's data-default-reply.
   No network, no persistence — pure prototype theater.
   ============================================================================ */
(function () {
  'use strict';

  /* ── Persona story variables ────────────────────────────────────────────
        The same release tour grounds itself in each persona's own book:
        Pepper (admin) sees the org pipeline, Sarah (rep) sees her deals. */
  var VARS = {
    Pepper: {
      deal1: 'Roxxon Energy', deal2: 'AIM Technologies', stalled: 'Hammer Industries',
      ne2confirm: 'Send to James Rhodes to deliver',
      stalledNote: 'the deal has sat in Qualification for 3 weeks — a new reason to talk beats a check-in'
    },
    Sarah: {
      deal1: 'Global Finance Corp', deal2: 'Stark Industries', stalled: 'Oscorp DR Site',
      ne2confirm: 'Save the re-engagement draft',
      stalledNote: 'it is still waiting on PSM approval — a fresh angle keeps the customer warm meanwhile'
    }
  };

  /* ── Scripted conversations ─────────────────────────────────────────────
        {p} interpolates the persona first name; {deal1}/{deal2}/{stalled}/
        {ne2confirm}/{stalledNote} pull from VARS so the tour stays grounded
        in the viewer's own records. followups reference other CONVOS keys —
        that's what makes it a back-and-forth rather than a one-shot answer. */
  var CONVOS = {
    'new-releases': {
      ask: "What's new — latest Equinix releases?",
      reply:
        'Quite a bit since you last checked, {p}. Three public releases are worth your attention:' +
        '<ul>' +
        '<li><strong>Fabric Cloud Router — now GA.</strong> Multicloud routing as a service, no hardware to own. There’s already a partner cert course in the catalog.</li>' +
        '<li><strong>Network Edge 2.0.</strong> Eight new virtual-device vendors and faster spin-up — virtual firewalls and SD-WAN in minutes.</li>' +
        '<li><strong>Equinix Precision Time</strong> opened to channel resale in North America — niche, but very sticky with financial services.</li>' +
        '</ul>' +
        'Want the partner angle on any of these?',
      followups: ['rel-fcr', 'rel-ne2', 'rel-time', 'rel-sell-first']
    },
    'rel-fcr': {
      ask: 'Tell me about Fabric Cloud Router',
      label: 'Fabric Cloud Router',
      reply:
        '<strong>Fabric Cloud Router</strong> replaces the DIY routing VMs customers run between clouds — Equinix hosts the router, customers connect VPCs in minutes, billed as a service.' +
        '<ul>' +
        '<li><strong>Why it matters to CloudBridge:</strong> it attaches naturally to deals you already run — {deal1} and {deal2} both fit the profile.</li>' +
        '<li><strong>Enablement:</strong> the new FCR course is 2 hours, and completions count toward your Gold-tier training requirement.</li>' +
        '<li><strong>Margin:</strong> standard Gold reseller rate applies from day one.</li>' +
        '</ul>' +
        'Shall I line anything up?',
      followups: ['rel-fcr-enroll', 'rel-fcr-pitch', 'rel-ne2', 'rel-time']
    },
    'rel-fcr-enroll': {
      ask: 'Set up the Fabric Cloud Router course',
      label: 'Set up the FCR course',
      reply:
        'The <strong>Fabric Cloud Router</strong> course is self-paced, 2 hours, and live in the catalog now. It counts toward the Gold-tier training requirement, and it’s a prerequisite for registering FCR deals once the SKU opens next quarter.',
      confirm: 'Enroll via the course catalog'
    },
    'rel-fcr-pitch': {
      ask: 'Draft a Fabric Cloud Router pitch for an open deal',
      label: 'Draft a customer pitch',
      reply:
        'Here’s a starting paragraph, grounded in the {deal1} opportunity:' +
        '<br><em>“{deal1}’s footprint already lands in two Equinix metros. Fabric Cloud Router would let your team route between AWS and Azure from those same cages — no routing VMs to patch, billed monthly, live in days rather than a network project.”</em>' +
        '<br>I can save it to the deal record for you.',
      confirm: 'Save draft to the {deal1} deal'
    },
    'rel-ne2': {
      ask: 'Tell me about Network Edge 2.0',
      label: 'Network Edge 2.0',
      reply:
        '<strong>Network Edge 2.0</strong> is the bigger virtual-device catalog: eight new vendors (the Palo Alto and Fortinet additions are the headline), plus device cloning and faster provisioning.' +
        '<ul>' +
        '<li><strong>Sell it as:</strong> “network functions without shipping hardware” — pairs well with every colo and Fabric deal.</li>' +
        '<li><strong>For your book:</strong> {stalled} asked about managed firewall in discovery — this is the natural re-engagement hook.</li>' +
        '</ul>',
      followups: ['rel-ne2-hammer', 'rel-fcr', 'rel-time']
    },
    'rel-ne2-hammer': {
      ask: 'Use Network Edge 2.0 to re-engage {stalled}',
      label: 'Re-engage {stalled} with NE 2.0',
      reply:
        'Good instinct — {stalledNote}. Draft: <em>“Since we last spoke, Equinix shipped Network Edge 2.0 — the managed firewall option you asked about is now a 15-minute virtual deploy. Worth a fresh look at the Data Hub design?”</em>',
      confirm: '{ne2confirm}'
    },
    'rel-time': {
      ask: 'Tell me about Equinix Precision Time',
      label: 'Precision Time',
      reply:
        '<strong>Equinix Precision Time</strong> delivers sub-millisecond time sync as a service (PTP/NTP), and as of this release North American channel partners can resell it.' +
        '<ul>' +
        '<li><strong>Who buys it:</strong> trading platforms, payments, broadcast — anyone with audit-grade timestamp requirements.</li>' +
        '<li><strong>Honest take:</strong> it’s a niche attach for CloudBridge’s current book, but it’s sticky revenue where it lands. Worth knowing it exists when a financial-services prospect shows up.</li>' +
        '</ul>',
      followups: ['rel-fcr', 'rel-ne2', 'rel-sell-first']
    },
    'rel-sell-first': {
      ask: 'Which release should we sell first?',
      label: 'Which should we sell first?',
      reply:
        'Given your live pipeline, {p}: <strong>Fabric Cloud Router</strong>.' +
        '<ul>' +
        '<li>Two open opportunities ({deal1}, {deal2}) are deals where FCR attaches without a new buying motion.</li>' +
        '<li>The cert course double-counts toward the Gold-tier training requirement you’re tracking for Platinum.</li>' +
        '<li>Network Edge 2.0 is the follow-on — use it to re-open {stalled}.</li>' +
        '</ul>',
      followups: ['rel-fcr-enroll', 'rel-fcr-pitch', 'rel-ne2-hammer']
    }
  };

  /* ── Recent searches — story-grounded, per persona ─────────────────────
        Items resolve in order: a matching data-convo / CONVOS ask, then a
        matching on-page data-ask element, then the default reply. */
  var RECENTS = {
    Pepper: [
      { q: 'ESC-0012 escalation status' },
      { q: "What's new — latest Equinix releases?", convo: 'new-releases' },
      { q: 'Why is the Hammer Industries deal stalled?' },
      { q: 'Fastest path from Gold to Platinum', match: 'fastest path' },
      { q: 'Q1 commission payout date' }
    ],
    Sarah: [
      { q: 'Security Fundamentals re-enroll', match: 'security fundamentals' },
      { q: "What's new — latest Equinix releases?", convo: 'new-releases' },
      { q: 'Global Finance Corp deal status', match: 'global finance' },
      { q: 'Where is my Q1 commission?' },
      { q: 'Shortest path to my remaining certs', match: 'shortest path' }
    ]
  };

  document.querySelectorAll('[data-agent]').forEach(function (root) {
    var input = root.querySelector('input[type="text"]');
    var askBtn = root.querySelector('.pr-ask button, .pr-agent-ask button');
    var out = root.querySelector('[data-agent-output]');
    if (!input || !out) return;

    var persona = root.getAttribute('data-persona') || 'there';
    var defaultReply = root.getAttribute('data-default-reply') ||
      'I can help with that — here is what I found in your partner data.';

    var vars = VARS[persona] || {};
    function personalize(s) {
      return s.replace(/\{(\w+)\}/g, function (m, k) {
        if (k === 'p') return persona;
        return vars[k] !== undefined ? vars[k] : m;
      });
    }

    function thread() {
      var t = out.querySelector('.pr-thread');
      if (!t) {
        t = document.createElement('div');
        t.className = 'pr-thread';
        out.appendChild(t);
      }
      return t;
    }

    /* Append one user→agent exchange to the thread. */
    function appendTurn(question, replyHtml, confirmLabel, followupKeys) {
      var card = document.createElement('div');
      card.className = 'pr-agent-reply';
      card.innerHTML =
        '<div class="q">' + escapeHtml(question) + '</div>' +
        '<div class="a"><span class="pr-agent-mark" aria-hidden="true">✦</span>' +
        '<div class="body"><span class="thinking">Looking at your records<span>.</span><span>.</span><span>.</span></span></div></div>';
      thread().appendChild(card);
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      setTimeout(function () {
        var body = card.querySelector('.body');
        body.innerHTML = personalize(replyHtml);

        if (confirmLabel) {
          var row = document.createElement('div');
          row.className = 'confirm-row';
          row.innerHTML =
            '<button type="button" class="pr-btn pr-btn--agent confirm">' + escapeHtml(confirmLabel) + '</button>' +
            '<button type="button" class="pr-btn pr-btn--ghost dismiss">Not now</button>' +
            '<span class="hint">Nothing happens until you confirm.</span>';
          body.appendChild(row);
          row.querySelector('.confirm').addEventListener('click', function () {
            row.innerHTML = '<span class="done">✓ Done — ' + escapeHtml(confirmLabel) +
              '. Logged to your activity feed (undo available for 5 min).</span>';
          });
          row.querySelector('.dismiss').addEventListener('click', function () { row.remove(); });
        }

        if (followupKeys && followupKeys.length) {
          var fu = document.createElement('div');
          fu.className = 'followups';
          followupKeys.forEach(function (key) {
            var c = CONVOS[key];
            if (!c) return;
            var chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'fu-chip';
            chip.innerHTML = '<span class="spark">✦</span>' + escapeHtml(personalize(c.label || c.ask));
            chip.addEventListener('click', function () { runConvo(key); });
            fu.appendChild(chip);
          });
          body.appendChild(fu);
        }
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 850);
    }

    function runConvo(key) {
      var c = CONVOS[key];
      if (!c) return;
      input.value = '';
      appendTurn(personalize(c.ask), c.reply, c.confirm && personalize(c.confirm), c.followups);
    }

    function runDefault(q) {
      appendTurn(q, defaultReply +
        '<ul><li>Open items from your <strong>Needs attention</strong> list are summarized below.</li>' +
        '<li>Try one of the suggested asks — each is grounded in a live record.</li></ul>', null, null);
    }

    /* Resolve a recent-search item to the richest canned response available. */
    function runRecent(item) {
      if (item.convo) { runConvo(item.convo); return; }
      if (item.match) {
        var els = root.querySelectorAll('[data-ask]');
        for (var i = 0; i < els.length; i++) {
          if (els[i].getAttribute('data-ask').toLowerCase().indexOf(item.match) !== -1) {
            appendTurn(item.q, els[i].getAttribute('data-reply') || defaultReply,
              els[i].getAttribute('data-confirm'), null);
            return;
          }
        }
      }
      runDefault(item.q);
    }

    function submitFreeText() {
      var q = input.value.trim();
      if (!q) { input.focus(); return; }
      input.value = '';
      closeRecents();
      runDefault(q);
    }

    if (askBtn) askBtn.addEventListener('click', submitFreeText);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') submitFreeText();
      if (e.key === 'Escape') closeRecents();
    });

    /* Chips / module rows — single-shot or scripted */
    root.querySelectorAll('[data-ask], [data-convo]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        closeRecents();
        var convo = el.getAttribute('data-convo');
        if (convo) { runConvo(convo); return; }
        var q = el.getAttribute('data-ask');
        input.value = q;
        input.focus();
        closeRecents();
        appendTurn(q, el.getAttribute('data-reply') || defaultReply,
          el.getAttribute('data-confirm'), null);
      });
    });

    /* ── Recent searches dropdown ── */
    var askWrap = input.closest('.pr-ask, .pr-agent-ask');
    var recentsPanel = null;

    function closeRecents() {
      if (recentsPanel) { recentsPanel.remove(); recentsPanel = null; }
    }

    function openRecents() {
      if (recentsPanel || input.value.trim()) return;
      var items = RECENTS[persona];
      if (!items || !askWrap) return;
      recentsPanel = document.createElement('div');
      recentsPanel.className = 'pr-recent';
      recentsPanel.setAttribute('role', 'listbox');
      recentsPanel.innerHTML = '<div class="hd">Recent</div>';
      items.forEach(function (item) {
        var row = document.createElement('button');
        row.type = 'button';
        row.className = 'item';
        row.innerHTML = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.5V8l2.5 1.5"/></svg><span>' + escapeHtml(item.q) + '</span>';
        row.addEventListener('mousedown', function (e) {
          e.preventDefault(); /* keep input focus semantics simple */
          closeRecents();
          runRecent(item);
        });
        recentsPanel.appendChild(row);
      });
      askWrap.appendChild(recentsPanel);
    }

    input.addEventListener('focus', openRecents);
    input.addEventListener('input', function () {
      if (input.value.trim()) closeRecents(); else openRecents();
    });
    /* Close on blur so the panel never blocks the chips below the input.
       Item handlers fire on mousedown (before blur), so picks still land. */
    input.addEventListener('blur', function () { setTimeout(closeRecents, 120); });
    document.addEventListener('click', function (e) {
      if (recentsPanel && !askWrap.contains(e.target)) closeRecents();
    });
  });

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
})();
