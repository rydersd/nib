/* ============================================================================
   Nib Docs — interactivity
   ----------------------------------------------------------------------------
   One classic script, no dependencies, shared by the landing + every doc page.
   Everything is feature-detected, so it is safe on any page.
   ============================================================================ */
(function () {
  'use strict';
  var doc = document;

  /* ── Fidelity demo (landing) ──────────────────────────────────────────── */
  (function fidelity() {
    var stage = doc.getElementById('fidStage');
    var range = doc.getElementById('fidRange');
    if (!stage || !range) return;
    var MODES = ['napkin', 'blueprint', 'polished'];
    var buttons = Array.prototype.slice.call(doc.querySelectorAll('.fid-labels button'));

    function set(i) {
      i = Math.max(0, Math.min(2, i | 0));
      MODES.forEach(function (m) { stage.classList.remove('fid--' + m); });
      stage.classList.add('fid--' + MODES[i]);
      range.value = String(i);
      range.setAttribute('aria-valuetext', MODES[i]);
      buttons.forEach(function (b) {
        b.classList.toggle('is-on', Number(b.dataset.fid) === i);
      });
    }
    range.addEventListener('input', function () { set(Number(range.value)); });
    buttons.forEach(function (b) {
      b.addEventListener('click', function () { set(Number(b.dataset.fid)); });
    });
    set(Number(range.value) || 1);
  })();

  /* ── Mobile navigation drawer ─────────────────────────────────────────── */
  (function mobileNav() {
    var toggle = doc.getElementById('navToggle');
    var scrim = doc.getElementById('navScrim');
    if (!toggle) return;
    function close() {
      doc.body.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
    toggle.addEventListener('click', function () {
      var open = doc.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    if (scrim) scrim.addEventListener('click', close);
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  })();

  /* ── Copy buttons on code blocks ──────────────────────────────────────── */
  (function copyButtons() {
    var blocks = doc.querySelectorAll('pre.codeblock');
    Array.prototype.forEach.call(blocks, function (pre) {
      var code = pre.querySelector('code');
      if (!code) return;
      var btn = doc.createElement('button');
      btn.className = 'codeblock-copy';
      btn.type = 'button';
      btn.textContent = 'Copy';
      btn.addEventListener('click', function () {
        var text = code.innerText;
        var done = function () {
          btn.textContent = 'Copied';
          btn.classList.add('is-done');
          setTimeout(function () {
            btn.textContent = 'Copy';
            btn.classList.remove('is-done');
          }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, done);
        } else {
          var sel = doc.createRange(); sel.selectNodeContents(code);
          var s = window.getSelection(); s.removeAllRanges(); s.addRange(sel);
          try { doc.execCommand('copy'); } catch (e) {}
          s.removeAllRanges(); done();
        }
      });
      pre.appendChild(btn);
    });
  })();

  /* ── Scroll-spy: highlight the current section in the TOC ─────────────── */
  (function scrollSpy() {
    var links = Array.prototype.slice.call(doc.querySelectorAll('.otp-link'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    var byId = {};
    var targets = [];
    links.forEach(function (a) {
      var id = (a.getAttribute('href') || '').replace(/^#/, '');
      var el = id && doc.getElementById(id);
      if (el) { byId[id] = a; targets.push(el); }
    });
    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        visible[en.target.id] = en.isIntersecting;
      });
      var current = null;
      for (var i = 0; i < targets.length; i++) {
        if (visible[targets[i].id]) { current = targets[i].id; break; }
      }
      links.forEach(function (a) { a.classList.remove('is-active'); });
      if (current && byId[current]) byId[current].classList.add('is-active');
    }, { rootMargin: '-68px 0px -70% 0px', threshold: 0 });
    targets.forEach(function (t) { io.observe(t); });
  })();

  /* ── Section-anchor links on hover-able headings ──────────────────────── */
  (function anchors() {
    var hs = doc.querySelectorAll('.doc h2[id], .doc h3[id]');
    Array.prototype.forEach.call(hs, function (h) {
      var a = doc.createElement('a');
      a.className = 'anchor';
      a.href = '#' + h.id;
      a.textContent = '#';
      a.setAttribute('aria-label', 'Link to this section');
      h.appendChild(a);
    });
  })();

  /* ── Search ───────────────────────────────────────────────────────────── */
  (function search() {
    var input = doc.getElementById('docsearch');
    if (!input) return;

    // Index: prefer the generated window.NIB_DOCS, else derive from the sidebar.
    var index = [];
    if (window.NIB_DOCS && window.NIB_DOCS.length) {
      index = window.NIB_DOCS.map(function (d) {
        return { title: d.title, url: d.url, hint: d.group || d.summary || '' };
      });
    } else {
      var seen = {};
      Array.prototype.forEach.call(
        doc.querySelectorAll('.nav-link, .docmap a'), function (a) {
          var url = a.getAttribute('href');
          if (!url || seen[url]) return;
          seen[url] = 1;
          index.push({ title: a.textContent.trim(), url: url, hint: '' });
        });
    }

    var box = doc.createElement('div');
    box.className = 'search-results';
    box.hidden = true;
    input.parentNode.appendChild(box);
    var active = -1, shown = [];

    function render(q) {
      q = q.trim().toLowerCase();
      if (!q) { box.hidden = true; box.innerHTML = ''; return; }
      shown = index.filter(function (d) {
        return d.title.toLowerCase().indexOf(q) !== -1 ||
               d.hint.toLowerCase().indexOf(q) !== -1;
      }).slice(0, 8);
      active = -1;
      if (!shown.length) {
        box.innerHTML = '<p class="search-empty">No matches for “' +
          q.replace(/[<>&]/g, '') + '”</p>';
        box.hidden = false; return;
      }
      box.innerHTML = shown.map(function (d, i) {
        return '<a class="search-hit" data-i="' + i + '" href="' + d.url + '">' +
          '<span>' + d.title + '</span>' +
          (d.hint ? '<em>' + d.hint + '</em>' : '') + '</a>';
      }).join('');
      box.hidden = false;
    }
    function move(delta) {
      var hits = box.querySelectorAll('.search-hit');
      if (!hits.length) return;
      active = (active + delta + hits.length) % hits.length;
      Array.prototype.forEach.call(hits, function (h, i) {
        h.classList.toggle('is-active', i === active);
      });
      hits[active].scrollIntoView({ block: 'nearest' });
    }

    input.addEventListener('input', function () { render(input.value); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter') {
        var pick = shown[active] || shown[0];
        if (pick) { e.preventDefault(); window.location.href = pick.url; }
      } else if (e.key === 'Escape') { input.value = ''; render(''); input.blur(); }
    });
    doc.addEventListener('click', function (e) {
      if (!input.parentNode.contains(e.target)) { box.hidden = true; }
    });
    // "/" focuses search from anywhere
    doc.addEventListener('keydown', function (e) {
      if (e.key === '/' && doc.activeElement !== input &&
          !/^(INPUT|TEXTAREA|SELECT)$/.test((doc.activeElement || {}).tagName || '')) {
        e.preventDefault(); input.focus();
      }
    });
  })();

})();
