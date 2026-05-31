/* Nib Surface engine: Design Review Deck — pairs with surfaces/deck.css.
   Self-contained IIFE; no proto-nav.js dependency (the context bar, when present,
   comes from the host project's nav and is merely styled by deck.css).
   See ref/surface-deck.md.

   Design-review deck — shared behavior.
   - Auto-injects slide-header chrome + section watermark from data-num + data-title
   - Builds the side-rail dot navigation
   - Highlights the active slide via IntersectionObserver
   - Wires keyboard navigation (arrow / pgup-pgdn / space / home / end)
   The context bar itself comes from the prototype's wf-nav.js and is styled by dr.css. */

(function() {
  // Captured at parse time so vendor/ resolves relative to dr.js's own URL,
  // not the deck page (decks live at varying folder depths).
  const DR_SCRIPT = document.currentScript;
  const slides = Array.from(document.querySelectorAll('.slide'));
  const nav = document.querySelector('.slidenav');
  if (!slides.length) return;

  // Auto-give each slide an id if missing (s1, s2, ...) and a sequential data-num if missing
  slides.forEach((s, i) => {
    if (!s.id) s.id = 's' + (i + 1);
    if (!s.dataset.num && !s.classList.contains('cover') && !s.classList.contains('closing')) {
      s.dataset.num = String(i).padStart(2, '0');
    }
  });

  // Auto-inject slide-header + section watermark on every non-cover/non-closing slide,
  // so per-review HTML stays slim (data-num + data-title + body content only).
  const total = slides.length;
  slides.forEach((s, i) => {
    if (s.classList.contains('cover') || s.classList.contains('closing')) return;
    // In fixed-canvas mode the chrome lives inside the scaled stage.
    const host = s.querySelector('.slide-stage') || s;
    // Skip if author already supplied a slide-header (allow override)
    if (host.querySelector('.slide-header')) return;
    const num = s.dataset.num || String(i).padStart(2, '0');
    const title = s.dataset.title || '';
    const oneBased = i + 1;
    const totalContent = total - slides.filter(x => x.classList.contains('cover') || x.classList.contains('closing')).length;
    const numForUser = num.replace(/^0/, '') || num;

    const watermark = document.createElement('div');
    watermark.className = 'slide-numwatermark';
    watermark.setAttribute('aria-hidden', 'true');
    watermark.textContent = num;

    const header = document.createElement('div');
    header.className = 'slide-header';
    header.innerHTML =
      '<div class="left">' +
        '<span class="pill">' + num + ' / ' + String(total - 2).padStart(2, '0') + '</span>' +
        '<span class="dim">' + title + '</span>' +
      '</div>' +
      '<div class="right">Section ' + (i) + ' of ' + (total - 2) + ' · <a href="index.html">All reviews →</a></div>';

    host.insertBefore(header, host.firstChild);
    host.insertBefore(watermark, host.firstChild);
  });

  // Build dot navigation from slide ids + data-title
  if (nav) {
    slides.forEach((s, i) => {
      const a = document.createElement('a');
      a.href = '#' + s.id;
      a.dataset.idx = i;
      const tip = document.createElement('span');
      tip.className = 'tip';
      tip.textContent = (i + 1).toString().padStart(2, '0') + ' · ' + (s.dataset.title || '');
      a.appendChild(tip);
      nav.appendChild(a);
    });
  }
  const dots = nav ? Array.from(nav.querySelectorAll('a')) : [];

  // Active dot follows the slide currently in view
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && e.intersectionRatio > 0.5) {
        const id = e.target.id;
        dots.forEach(d => d.classList.toggle('active', d.getAttribute('href') === '#' + id));
      }
    });
  }, { threshold: [0.5] });
  slides.forEach(s => io.observe(s));

  // Keyboard navigation — arrow keys, page up/down, space, home/end
  function currentIdx() {
    const top = window.scrollY + window.innerHeight / 2;
    let idx = 0;
    slides.forEach((s, i) => { if (s.offsetTop <= top) idx = i; });
    return idx;
  }
  function jump(idx) {
    idx = Math.max(0, Math.min(slides.length - 1, idx));
    slides[idx].scrollIntoView({ behavior: 'smooth' });
  }
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
      e.preventDefault(); jump(currentIdx() + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
      e.preventDefault(); jump(currentIdx() - 1);
    } else if (e.key === 'Home') {
      e.preventDefault(); jump(0);
    } else if (e.key === 'End') {
      e.preventDefault(); jump(slides.length - 1);
    } else if (e.key === 'e' || e.key === 'E') {
      e.preventDefault(); exportCurrentSlideAsSVG();
    } else if (e.key === 'a' || e.key === 'A') {
      e.preventDefault(); exportDeckAsPptx();
    }
  });

  // ============================================================
  // FIXED-CANVAS SCALING — when <main> carries .slides--fit, scale
  // every 1600x900 stage uniformly so the deck fills any viewport at
  // a constant ratio (a 1440 laptop and a 4K monitor render the same
  // composition). Recomputed on resize.
  // ============================================================
  if (document.querySelector('.slides--fit')) {
    const CW = 1600, CH = 900;
    const barH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--bar-h'), 10) || 36;
    const setScale = () => {
      const scale = Math.min(window.innerWidth / CW, (window.innerHeight - barH) / CH);
      document.documentElement.style.setProperty('--deck-scale', scale.toFixed(4));
    };
    setScale();
    window.addEventListener('resize', setScale);
    window.addEventListener('orientationchange', setScale);

    // ----------------------------------------------------------
    // AUTO-FIT — the stage is a hard 1600x900 box with no scroll, so a
    // content-dense slide authored for variable height would clip. Wrap
    // each stage's flow content (everything except the absolutely-
    // positioned header + watermark) in a .stage-fit box, measure its
    // natural size, and scale it DOWN only when it overflows the usable
    // area. Slides that already fit are untouched (scale stays 1). This
    // is what keeps every slide centered + fully visible regardless of
    // how much copy it carries.
    // ----------------------------------------------------------
    const PAD_X = 80, PAD_Y = 52;            // .slide-stage padding (see dr.css .slides--fit .slide-stage)
    const AVAIL_W = CW - PAD_X * 2;          // 1440
    const AVAIL_H = CH - PAD_Y * 2;          // 796
    document.querySelectorAll('.slide-stage').forEach(stage => {
      if (stage.querySelector(':scope > .stage-fit')) return;
      const flow = Array.from(stage.children).filter(c =>
        !c.classList.contains('slide-header') && !c.classList.contains('slide-numwatermark'));
      if (!flow.length) return;
      const wrap = document.createElement('div');
      wrap.className = 'stage-fit';
      flow.forEach(c => wrap.appendChild(c));   // moves the nodes
      stage.appendChild(wrap);
    });
    const autofit = () => {
      document.querySelectorAll('.slide-stage > .stage-fit').forEach(wrap => {
        wrap.style.transform = 'none';          // reset to measure natural size
        const h = wrap.scrollHeight, w = wrap.scrollWidth;
        const scale = Math.min(1, AVAIL_H / h, AVAIL_W / w);
        wrap.style.transform = scale < 0.999 ? 'scale(' + scale.toFixed(4) + ')' : 'none';
      });
    };
    autofit();
    window.addEventListener('resize', autofit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(autofit);
    window.addEventListener('load', autofit);   // images/iframes settled
  }

  // ============================================================
  // SVG EXPORT — current slide → standalone .svg file via foreignObject
  // Press 'E' or click the export button in the slidenav.
  // ============================================================
  async function exportCurrentSlideAsSVG() {
    const slide = slides[currentIdx()];
    if (!slide) return;

    showToast('Exporting slide…');

    const rect = slide.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);

    // Clone the slide and remove things that don't serialize well
    const clone = slide.cloneNode(true);
    clone.querySelectorAll('script').forEach(s => s.remove());
    // Replace iframes with placeholder cards (foreignObject can't embed cross-origin iframes)
    clone.querySelectorAll('iframe').forEach(f => {
      const ph = document.createElement('div');
      const src = (f.getAttribute('src') || '').replace(/^\.\.\/\.\.\//, '');
      ph.style.cssText = 'background:#fafbfd;border:1px dashed #b0bdd0;padding:24px;text-align:center;font-family:monospace;font-size:11px;color:#6b6258;height:100%;display:flex;align-items:center;justify-content:center;';
      ph.textContent = src;
      f.replaceWith(ph);
    });

    // Inline all <style> blocks + fetched stylesheet contents so the SVG renders standalone
    const styleParts = [];
    document.querySelectorAll('style').forEach(s => styleParts.push(s.textContent));
    const sheetLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    await Promise.all(sheetLinks.map(async link => {
      try {
        const r = await fetch(link.href);
        if (r.ok) {
          let css = await r.text();
          // Resolve relative url() references against the stylesheet's URL so fonts still load
          css = css.replace(/url\(([^)]+)\)/g, (m, p) => {
            const raw = p.trim().replace(/^['"]|['"]$/g, '');
            if (/^(data:|https?:|\/)/.test(raw)) return 'url(' + raw + ')';
            try { return 'url(' + new URL(raw, link.href).href + ')'; }
            catch (_) { return m; }
          });
          styleParts.push(css);
        }
      } catch (_) { /* ignore */ }
    }));
    const allCSS = styleParts.join('\n');

    // Build the SVG document. The width/height attribute are explicit so SVG viewers can size it.
    const xhtmlNS = 'http://www.w3.org/1999/xhtml';
    const svgNS = 'http://www.w3.org/2000/svg';
    const svgDoc =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<svg xmlns="' + svgNS + '" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">\n' +
      '  <foreignObject width="100%" height="100%">\n' +
      '    <div xmlns="' + xhtmlNS + '" style="width:' + w + 'px;min-height:' + h + 'px;font-family:\'Hanken Grotesk\',sans-serif;background:#f5f0e6;">\n' +
      '      <style><![CDATA[\n' + allCSS.replace(/]]>/g, ']] >') + '\n]]></style>\n' +
      '      ' + new XMLSerializer().serializeToString(clone) + '\n' +
      '    </div>\n' +
      '  </foreignObject>\n' +
      '</svg>';

    const blob = new Blob([svgDoc], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fname = 'design-review-' + (slide.id || 'slide') + '-' + (slide.dataset.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.svg';
    a.href = url;
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);

    showToast('Downloaded ' + fname);
  }

  // Tiny toast for export feedback
  let toastEl = null;
  function showToast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'dr-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove('show'), 2400);
  }

  // ============================================================
  // POWERPOINT EXPORT — a fully EDITABLE .pptx (no images). Each slide's
  // live DOM is mapped to native PowerPoint objects: text -> text boxes
  // (with bold / italic / hyperlink / accent runs preserved), <table> ->
  // real PPT tables, card containers -> shapes, and inline <svg> diagrams
  // -> embedded vector SVG (right-click -> Convert to Shape to edit).
  //
  // 100% client-side and deterministic — no rasterization, no network at
  // export time, no model in the loop. PptxGenJS lazy-loads on first use.
  // Positions read from each element's box in the neutralized 1600x900
  // stage; px map to inches (x PX2IN) and font px to points (x PX2PT).
  // Press 'A' or click "Export PPTX".
  // ============================================================
  const VENDOR_BASE = DR_SCRIPT ? new URL('../../vendor/', DR_SCRIPT.src).href : 'vendor/';
  const PX2IN = 13.333 / 1600;   // canvas px -> inches
  const PX2PT = 0.6;             // canvas px -> points (1600px == 960pt wide)
  const ACCENT_HEX = '6B1A26';  // --accent (deck burgundy)
  const PAPER_HEX  = 'F5F0E6';  // --paper
  const INLINE = { A:1, SPAN:1, STRONG:1, B:1, EM:1, I:1, BR:1, SUB:1, SUP:1, CODE:1, SMALL:1, U:1, MARK:1, KBD:1 };

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[data-vendor="' + src + '"]')) return resolve();
      const s = document.createElement('script');
      s.src = src; s.dataset.vendor = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load ' + src));
      document.head.appendChild(s);
    });
  }
  async function ensurePptx() {
    if (!window.PptxGenJS) await loadScript(VENDOR_BASE + 'pptxgenjs.min.js');
  }

  // "rgb(r, g, b)" / "rgba(...)" -> "RRGGBB", or null when fully transparent.
  function rgbToHex(rgb) {
    const m = /rgba?\(([^)]+)\)/.exec(rgb || '');
    if (!m) return null;
    const p = m[1].split(',').map(s => parseFloat(s.trim()));
    if (p.length >= 4 && p[3] === 0) return null;
    return p.slice(0, 3).map(n => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')).join('').toUpperCase();
  }
  function firstFont(ff) { return (ff || '').split(',')[0].replace(/["']/g, '').trim() || 'Arial'; }
  function isTextLeaf(el) {
    if (!el.textContent.trim()) return false;
    for (const c of el.children) if (!INLINE[c.tagName]) return false;
    return true;
  }
  function isCardLike(el) {
    const cs = getComputedStyle(el);
    const bw = parseFloat(cs.borderTopWidth) || 0;
    const bg = rgbToHex(cs.backgroundColor);
    const bordered = bw >= 0.5 && cs.borderTopStyle !== 'none';
    const filled = bg && bg !== PAPER_HEX;
    return bordered || filled;
  }
  // Build PptxGenJS text runs from a leaf's inline children (preserves
  // <strong>/<em>/<a href>/.accent and <br> line breaks).
  function inlineRuns(el, baseColor) {
    const runs = [];
    (function rec(node, inh) {
      node.childNodes.forEach(ch => {
        if (ch.nodeType === 3) {
          const t = ch.textContent.replace(/\s+/g, ' ');
          if (t) runs.push({ text: t, options: Object.assign({}, inh) });
        } else if (ch.nodeType === 1) {
          if (ch.tagName === 'BR') { if (runs.length) runs[runs.length - 1].options.breakLine = true; return; }
          const o = Object.assign({}, inh);
          if (ch.tagName === 'STRONG' || ch.tagName === 'B') o.bold = true;
          if (ch.tagName === 'EM' || ch.tagName === 'I') o.italic = true;
          if (ch.classList && ch.classList.contains('accent')) o.color = ACCENT_HEX;
          if (ch.tagName === 'A' && ch.href) { o.hyperlink = { url: ch.href }; o.underline = true; o.color = ACCENT_HEX; }
          rec(ch, o);
        }
      });
    })(el, { color: baseColor });
    return runs.length ? runs : [{ text: el.textContent.trim(), options: { color: baseColor } }];
  }

  function box(el, sRect) {
    const r = el.getBoundingClientRect();
    return {
      x: (r.left - sRect.left) * PX2IN,
      y: (r.top - sRect.top) * PX2IN,
      w: Math.max(0.1, r.width * PX2IN),
      h: Math.max(0.1, r.height * PX2IN)
    };
  }

  function emitText(el, ps, sRect) {
    const cs = getComputedStyle(el);
    const b = box(el, sRect);
    ps.addText(inlineRuns(el, rgbToHex(cs.color) || '15110D'), {
      x: b.x, y: b.y, w: b.w, h: b.h + 0.06,
      fontSize: parseFloat(cs.fontSize) * PX2PT,
      fontFace: firstFont(cs.fontFamily),
      color: rgbToHex(cs.color) || '15110D',
      bold: (parseInt(cs.fontWeight, 10) || 400) >= 600,
      italic: cs.fontStyle === 'italic',
      align: cs.textAlign === 'center' ? 'center' : cs.textAlign === 'right' ? 'right' : 'left',
      valign: 'top', margin: 0, wrap: true,
      lineSpacingMultiple: 1.08, charSpacing: (parseFloat(cs.letterSpacing) || 0) * PX2PT
    });
  }

  function emitBox(el, ps, sRect, pptx) {
    const cs = getComputedStyle(el);
    const b = box(el, sRect);
    const fill = rgbToHex(cs.backgroundColor);
    const line = parseFloat(cs.borderTopWidth) >= 0.5 ? rgbToHex(cs.borderTopColor) : null;
    if (!fill && !line) return;
    const opt = { x: b.x, y: b.y, w: b.w, h: b.h };
    opt.fill = fill ? { color: fill } : { type: 'none' };
    if (line) opt.line = { color: line, width: Math.max(0.5, parseFloat(cs.borderTopWidth) * PX2PT) };
    const rad = parseFloat(cs.borderTopLeftRadius) || 0;
    ps.addShape(rad > 1 ? pptx.ShapeType.roundRect : pptx.ShapeType.rect, opt);
  }

  function emitTable(table, ps, sRect, pptx) {
    const b = box(table, sRect);
    const rows = [];
    let colW = null;
    table.querySelectorAll('tr').forEach(tr => {
      const cells = [];
      tr.querySelectorAll('th,td').forEach(cell => {
        const cs = getComputedStyle(cell);
        const head = cell.tagName === 'TH';
        cells.push({
          text: cell.textContent.trim().replace(/\s+/g, ' '),
          options: {
            bold: head || (parseInt(cs.fontWeight, 10) || 400) >= 600,
            color: rgbToHex(cs.color) || '2D251C',
            fill: { color: rgbToHex(cs.backgroundColor) || (head ? 'EBE3CF' : 'FFFFFF') },
            align: 'left', valign: 'top',
            fontSize: parseFloat(cs.fontSize) * PX2PT,
            fontFace: firstFont(cs.fontFamily)
          }
        });
      });
      if (cells.length) rows.push(cells);
      if (!colW && tr.querySelectorAll('th').length) {
        colW = Array.from(tr.querySelectorAll('th')).map(th => (th.getBoundingClientRect().width) * PX2IN);
      }
    });
    if (!rows.length) return;
    ps.addTable(rows, {
      x: b.x, y: b.y, w: b.w, colW: colW || undefined,
      border: { type: 'solid', color: 'DDD3BF', pt: 0.5 },
      valign: 'top', autoPage: false
    });
  }

  function emitSvg(svg, ps, sRect) {
    const b = box(svg, sRect);
    const clone = svg.cloneNode(true);
    if (!clone.getAttribute('xmlns')) clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const str = new XMLSerializer().serializeToString(clone);
    const data = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(str)));
    ps.addImage({ data: data, x: b.x, y: b.y, w: b.w, h: b.h });
  }

  function walkSlide(node, ps, sRect, pptx) {
    for (const el of node.children) {
      if (el.classList.contains('slide-numwatermark') || el.classList.contains('slide-header')) continue;
      const tag = el.tagName;
      if (tag === 'svg') { emitSvg(el, ps, sRect); continue; }
      if (tag === 'TABLE') { emitTable(el, ps, sRect, pptx); continue; }
      if (isTextLeaf(el)) { emitText(el, ps, sRect); continue; }
      if (isCardLike(el)) emitBox(el, ps, sRect, pptx);
      walkSlide(el, ps, sRect, pptx);
    }
  }

  let exporting = false;
  async function exportDeckAsPptx() {
    if (exporting) return;
    exporting = true;
    // Neutralize the fit-scale + autofit transforms so every element measures
    // in true 1600x900 stage coordinates; restore afterward.
    const rootEl = document.documentElement;
    const prevScale = rootEl.style.getPropertyValue('--deck-scale');
    const fits = Array.from(document.querySelectorAll('.slide-stage > .stage-fit'));
    const prevT = fits.map(f => f.style.transform);
    try {
      showToast('Loading PowerPoint engine…');
      await ensurePptx();
      rootEl.style.setProperty('--deck-scale', '1');
      fits.forEach(f => { f.style.transform = 'none'; });
      void document.body.offsetHeight; // force reflow before measuring

      const pptx = new window.PptxGenJS();
      pptx.defineLayout({ name: 'DR16x9', width: 13.333, height: 7.5 });
      pptx.layout = 'DR16x9';

      for (let i = 0; i < slides.length; i++) {
        showToast('Building slide ' + (i + 1) + ' / ' + slides.length + '…');
        const stage = slides[i].querySelector('.slide-stage') || slides[i];
        const sRect = stage.getBoundingClientRect();
        const ps = pptx.addSlide();
        ps.background = { color: PAPER_HEX };
        const content = stage.querySelector(':scope > .stage-fit') || stage;
        walkSlide(content, ps, sRect, pptx);
      }

      showToast('Writing .pptx…');
      const fname = (document.title || 'design-review-deck')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.pptx';
      await pptx.writeFile({ fileName: fname });
      showToast('Downloaded ' + fname);
    } catch (err) {
      console.error('[dr.js] PPTX export failed:', err);
      showToast('PPTX export failed — see console');
    } finally {
      rootEl.style.setProperty('--deck-scale', prevScale || '');
      fits.forEach((f, j) => { f.style.transform = prevT[j]; });
      exporting = false;
    }
  }

  // Floating export dock — primary "Export PPTX" (whole deck) + secondary
  // "Export SVG" (current slide), bottom-right beside the side-rail dots.
  if (slides.length > 1) {
    const dock = document.createElement('div');
    dock.className = 'dr-export-dock';

    const svgBtn = document.createElement('button');
    svgBtn.className = 'dr-export-btn dr-export-secondary';
    svgBtn.type = 'button';
    svgBtn.setAttribute('aria-label', 'Export current slide as SVG');
    svgBtn.innerHTML = '<span class="dr-export-icon">↓</span><span class="dr-export-label">SVG</span>';
    svgBtn.addEventListener('click', exportCurrentSlideAsSVG);

    const pptxBtn = document.createElement('button');
    pptxBtn.className = 'dr-export-btn';
    pptxBtn.type = 'button';
    pptxBtn.setAttribute('aria-label', 'Export the whole deck as a PowerPoint .pptx file');
    pptxBtn.innerHTML = '<span class="dr-export-icon">↓</span><span class="dr-export-label">Export PPTX</span>';
    pptxBtn.addEventListener('click', exportDeckAsPptx);

    dock.appendChild(svgBtn);
    dock.appendChild(pptxBtn);
    document.body.appendChild(dock);
  }
})();
