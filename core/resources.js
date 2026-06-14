/* resources.js — expands declarative guide attributes into elements so sheet
   HTML stays thin. No deps; safe to backport to nib/core alongside resources.css.
   - [data-cols="N"]  on .rs-colgrid  -> N .rs-col column bands
   - [data-cells="N"] on .rs-cells    -> N numbered .rs-cell frames
   - [data-vdivs="a,b,.."] on .rs-table__body -> vertical dividers at those % */
(function () {
  'use strict';
  function build() {
    document.querySelectorAll('.rs-colgrid[data-cols]').forEach(function (el) {
      var n = parseInt(el.getAttribute('data-cols'), 10) || 12;
      el.style.setProperty('--rs-cols', n);
      for (var i = 0; i < n; i++) { var c = document.createElement('div'); c.className = 'rs-col'; el.appendChild(c); }
    });
    document.querySelectorAll('.rs-cells[data-cells]').forEach(function (el) {
      var n = parseInt(el.getAttribute('data-cells'), 10) || 8;
      var cols = parseInt(el.getAttribute('data-cell-cols'), 10);
      if (cols) el.style.setProperty('--rs-cell-cols', cols);
      for (var i = 0; i < n; i++) { var c = document.createElement('div'); c.className = 'rs-cell'; c.setAttribute('data-n', i + 1); el.appendChild(c); }
    });
    document.querySelectorAll('.rs-table__body[data-vdivs]').forEach(function (el) {
      el.getAttribute('data-vdivs').split(',').forEach(function (p) {
        p = p.trim(); if (!p) return;
        var d = document.createElement('div'); d.className = 'rs-vdiv'; d.style.left = p; el.appendChild(d);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
