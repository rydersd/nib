/* Design-review deck — shared behavior.
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
  // Section numbering counts CONTENT slides only — decks without a closing
  // (or without a cover) still number correctly. Without this, total-2 / raw
  // index produces "Section 4 of 3" or "Section 0 of 5" on non-canonical decks.
  const contentSlides = slides.filter(s =>
    !s.classList.contains('cover') && !s.classList.contains('closing'));
  const totalContent = contentSlides.length;
  slides.forEach((s) => {
    if (s.classList.contains('cover') || s.classList.contains('closing')) return;
    // In fixed-canvas mode the chrome lives inside the scaled stage.
    const host = s.querySelector('.slide-stage') || s;
    // Skip if author already supplied a slide-header (allow override)
    if (host.querySelector('.slide-header')) return;
    const sectionNum = contentSlides.indexOf(s) + 1;
    const num = s.dataset.num || String(sectionNum).padStart(2, '0');
    const title = s.dataset.title || '';

    const watermark = document.createElement('div');
    watermark.className = 'slide-numwatermark';
    watermark.setAttribute('aria-hidden', 'true');
    watermark.textContent = num;

    const header = document.createElement('div');
    header.className = 'slide-header';
    header.innerHTML =
      '<div class="left">' +
        '<span class="pill">' + num + ' / ' + String(totalContent).padStart(2, '0') + '</span>' +
        '<span class="dim">' + title + '</span>' +
      '</div>' +
      '<div class="right">Section ' + sectionNum + ' of ' + totalContent + ' · <a href="index.html">All reviews →</a></div>';

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
    // Prefer the IntersectionObserver-driven active dot — works correctly in
    // .slides--fit mode where offsetTop is pre-transform (CSS-scaled) and the
    // scrollY math no longer matches the visible slide.
    if (dots.length) {
      const i = dots.findIndex(d => d.classList.contains('active'));
      if (i >= 0) return i;
    }
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
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' ||
        e.target.tagName === 'SELECT' || e.target.isContentEditable) return;
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
    } else if (e.key === 'x' || e.key === 'X') {
      e.preventDefault(); exportTablesToXlsx();
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
    const barHRaw = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--bar-h'), 10);
    const barH = isNaN(barHRaw) ? 36 : barHRaw;
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

    // Inline all <style> blocks + stylesheet contents so the SVG renders standalone.
    // On file:// fetch() throws on local stylesheet hrefs — we fall back to
    // reading rules directly from document.styleSheets (works same-origin
    // without the network round-trip, throws on cross-origin which we swallow).
    const styleParts = [];
    document.querySelectorAll('style').forEach(s => styleParts.push(s.textContent));
    const sheetLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    let sheetsInlined = 0;
    function readSheetRules(href) {
      try {
        for (const s of Array.from(document.styleSheets)) {
          if (s.href === href) {
            return Array.from(s.cssRules).map(r => r.cssText).join('\n');
          }
        }
      } catch (_) { /* opaque cross-origin sheet — caller falls through */ }
      return '';
    }
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
          sheetsInlined++;
          return;
        }
      } catch (_) { /* fetch failed (likely file://) — fall through to styleSheets */ }
      const rules = readSheetRules(link.href);
      if (rules) { styleParts.push(rules); sheetsInlined++; }
    }));
    const allCSS = styleParts.join('\n');
    const exportIncomplete = sheetLinks.length > 0 && sheetsInlined === 0;

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

    showToast(exportIncomplete
      ? 'Export incomplete — serve the deck over http:// for full styling'
      : 'Downloaded ' + fname);
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

  // --- SVG diagram -> native, editable PowerPoint shapes ------------
  // The schema sketches are a constrained vocabulary (rect / line / text /
  // circle / a few dashed <path> arrows), so each primitive maps to a real
  // PPT shape. This renders reliably (no SVG-embed dependency) and every box
  // and label stays directly editable. Coordinates map from the SVG viewBox
  // into the diagram's on-slide box.
  function colorHex(c) {
    if (!c) return null;
    c = c.trim();
    if (c === 'none' || c === 'transparent') return null;
    if (c[0] === '#') return (c.length === 4 ? c[1]+c[1]+c[2]+c[2]+c[3]+c[3] : c.slice(1, 7)).toUpperCase();
    if (c.indexOf('rgb') === 0) return rgbToHex(c);
    return null;
  }
  function nums(str) { return (String(str || '').match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []).map(Number); }
  function pairs(arr) { const p = []; for (let i = 0; i + 1 < arr.length; i += 2) p.push([arr[i], arr[i + 1]]); return p; }

  function emitSvg(svg, ps, sRect, pptx) {
    const b = box(svg, sRect);
    const vb = nums(svg.getAttribute('viewBox'));
    const VX = vb.length === 4 ? vb[0] : 0, VY = vb.length === 4 ? vb[1] : 0;
    const VW = vb.length === 4 ? vb[2] : (parseFloat(svg.getAttribute('width')) || b.w / PX2IN);
    const VH = vb.length === 4 ? vb[3] : (parseFloat(svg.getAttribute('height')) || b.h / PX2IN);
    const kx = b.w / VW, ky = b.h / VH;               // inches per viewBox unit
    const X = sx => b.x + (sx - VX) * kx;
    const Y = sy => b.y + (sy - VY) * ky;

    const lineFrom = (x1, y1, x2, y2, opt) => {
      ps.addShape(pptx.ShapeType.line, {
        x: Math.min(x1, x2), y: Math.min(y1, y2),
        w: Math.max(Math.abs(x2 - x1), 0.005), h: Math.max(Math.abs(y2 - y1), 0.005),
        flipH: x2 < x1, flipV: y2 < y1, line: opt
      });
    };

    svg.querySelectorAll('rect,line,circle,ellipse,path,polyline,polygon,text').forEach(el => {
      try {
        const cs = getComputedStyle(el);
        const strokeHex = colorHex(el.getAttribute('stroke')) || colorHex(cs.stroke);
        const sw = parseFloat(el.getAttribute('stroke-width') || cs.strokeWidth) || 1;
        const dash = (el.getAttribute('stroke-dasharray') || cs.strokeDasharray || '').replace(/none|normal/, '').trim();
        const lineOpt = strokeHex
          ? { color: strokeHex, width: Math.max(0.5, sw * kx * 72), dashType: dash ? 'dash' : 'solid' }
          : { type: 'none' };
        const fHex = colorHex(el.getAttribute('fill')) || (el.getAttribute('fill') === 'none' ? null : colorHex(cs.fill));
        const fOp = parseFloat(el.getAttribute('fill-opacity') || cs.fillOpacity);
        const fillOpt = fHex ? { color: fHex, transparency: isNaN(fOp) ? 0 : Math.round((1 - fOp) * 100) } : { type: 'none' };
        const tag = el.tagName.toLowerCase();

        if (tag === 'rect') {
          const x = +el.getAttribute('x') || 0, y = +el.getAttribute('y') || 0;
          const w = +el.getAttribute('width') || 0, h = +el.getAttribute('height') || 0;
          const rx = +el.getAttribute('rx') || 0;
          const o = { x: X(x), y: Y(y), w: w * kx, h: h * ky, fill: fillOpt, line: lineOpt };
          if (rx > 0) o.rectRadius = Math.min(rx * kx, h * ky / 2);
          ps.addShape(rx > 0 ? pptx.ShapeType.roundRect : pptx.ShapeType.rect, o);
        } else if (tag === 'line') {
          lineFrom(X(+el.getAttribute('x1')), Y(+el.getAttribute('y1')), X(+el.getAttribute('x2')), Y(+el.getAttribute('y2')), lineOpt);
        } else if (tag === 'circle') {
          const cx = +el.getAttribute('cx'), cy = +el.getAttribute('cy'), r = +el.getAttribute('r');
          ps.addShape(pptx.ShapeType.ellipse, { x: X(cx - r), y: Y(cy - r), w: 2 * r * kx, h: 2 * r * ky, fill: fillOpt, line: lineOpt });
        } else if (tag === 'ellipse') {
          const cx = +el.getAttribute('cx'), cy = +el.getAttribute('cy'), rx = +el.getAttribute('rx'), ry = +el.getAttribute('ry');
          ps.addShape(pptx.ShapeType.ellipse, { x: X(cx - rx), y: Y(cy - ry), w: 2 * rx * kx, h: 2 * ry * ky, fill: fillOpt, line: lineOpt });
        } else if (tag === 'path') {
          const pts = pairs(nums(el.getAttribute('d')));   // arrows: connect endpoints
          if (pts.length >= 2 && strokeHex) lineFrom(X(pts[0][0]), Y(pts[0][1]), X(pts[pts.length - 1][0]), Y(pts[pts.length - 1][1]), lineOpt);
        } else if (tag === 'polyline' || tag === 'polygon') {
          const pts = pairs(nums(el.getAttribute('points')));
          for (let i = 0; i + 1 < pts.length; i++) if (strokeHex) lineFrom(X(pts[i][0]), Y(pts[i][1]), X(pts[i + 1][0]), Y(pts[i + 1][1]), lineOpt);
        } else if (tag === 'text') {
          const txt = el.textContent.trim();
          if (!txt) return;
          const x = +el.getAttribute('x') || 0, y = +el.getAttribute('y') || 0;
          const fsPx = parseFloat(cs.fontSize) || 10;
          const ptFs = fsPx * ky * 72;
          const anchor = el.getAttribute('text-anchor') || cs.textAnchor || 'start';
          const align = anchor === 'middle' ? 'center' : anchor === 'end' ? 'right' : 'left';
          const ls = parseFloat(el.getAttribute('letter-spacing') || cs.letterSpacing) || 0;
          const wEst = ((txt.length * fsPx * 0.62) + Math.max(0, txt.length - 1) * ls) * kx + 0.25;
          const bx = align === 'center' ? X(x) - wEst / 2 : align === 'right' ? X(x) - wEst : X(x) - 0.04;
          ps.addText(txt, {
            x: bx, y: Y(y) - ptFs / 72 * 0.92, w: wEst, h: ptFs / 72 * 1.4,
            fontSize: ptFs, fontFace: firstFont(cs.fontFamily),
            color: colorHex(el.getAttribute('fill')) || colorHex(cs.fill) || '15110D',
            bold: (parseInt(cs.fontWeight, 10) || 400) >= 600, italic: cs.fontStyle === 'italic',
            align: align, valign: 'middle', margin: 0, wrap: false, charSpacing: ls * kx * 72
          });
        }
      } catch (e) { /* skip a malformed primitive rather than fail the export */ }
    });
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

  // ============================================================
  // EXCEL EXPORT — qualifying data tables (>=2 cols, >=2 body rows) -> .xlsx,
  // one sheet per table. Zero new deps: a minimal OOXML workbook zipped with
  // JSZip (already bundled inside the vendored pptxgenjs). Deliberately NOT the
  // vulnerable SheetJS 'xlsx' package. Press 'X' or click "Excel".
  // ============================================================
  async function ensureJSZip() {
    if (!window.JSZip) await loadScript(VENDOR_BASE + 'pptxgenjs.min.js'); // its bundle sets window.JSZip
    return window.JSZip;
  }
  function xmlEsc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function colRef(i) { let s = ''; i += 1; while (i) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = (i - m - 1) / 26; } return s; }
  function isNumericCell(t) { const s = t.trim(); return /^-?[\d,]+(\.\d+)?$/.test(s) && /\d/.test(s); }

  // A qualifying data table = real <table>, >= 2 columns and >= 2 body rows.
  function dataTables() {
    const out = [];
    slides.forEach((s, i) => {
      s.querySelectorAll('table').forEach(t => {
        const rows = Array.from(t.querySelectorAll('tr'));
        const cols = rows[0] ? rows[0].querySelectorAll('th,td').length : 0;
        const bodyRows = t.querySelectorAll('tbody tr').length || Math.max(0, rows.length - 1);
        if (cols >= 2 && bodyRows >= 2) out.push({ table: t, slide: i + 1, title: s.dataset.title || ('Slide ' + (i + 1)) });
      });
    });
    return out;
  }
  function sheetXml(table) {
    const xmlRows = Array.from(table.querySelectorAll('tr')).map((tr, r) => {
      const cells = Array.from(tr.querySelectorAll('th,td')).map((cell, c) => {
        const ref = colRef(c) + (r + 1);
        const txt = cell.textContent.replace(/\s+/g, ' ').trim();
        if (isNumericCell(txt)) return `<c r="${ref}"><v>${txt.replace(/,/g, '')}</v></c>`;
        return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xmlEsc(txt)}</t></is></c>`;
      }).join('');
      return `<row r="${r + 1}">${cells}</row>`;
    }).join('');
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${xmlRows}</sheetData></worksheet>`;
  }
  function safeSheetName(s, used) {
    let n = (s.replace(/[\\\/\?\*\[\]:]/g, ' ').replace(/\s+/g, ' ').slice(0, 28).trim()) || 'Sheet';
    const base = n; let k = 2;
    while (used.has(n.toLowerCase())) n = (base.slice(0, 25) + ' ' + k++);
    used.add(n.toLowerCase()); return n;
  }
  async function exportTablesToXlsx() {
    if (exporting) return;
    const tables = dataTables();
    if (!tables.length) { showToast('No data tables on this deck'); return; }
    exporting = true;
    try {
      showToast('Building Excel…');
      const JSZip = await ensureJSZip();
      const zip = new JSZip();
      const used = new Set();
      const sheets = tables.map((t, i) => ({ id: i + 1, name: safeSheetName('S' + t.slide + ' ' + t.title, used), table: t.table }));
      const ov = sheets.map(s => `<Override PartName="/xl/worksheets/sheet${s.id}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('');
      zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${ov}</Types>`);
      zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`);
      zip.file('xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map(s => `<sheet name="${xmlEsc(s.name)}" sheetId="${s.id}" r:id="rId${s.id}"/>`).join('')}</sheets></workbook>`);
      zip.file('xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map(s => `<Relationship Id="rId${s.id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${s.id}.xml"/>`).join('')}</Relationships>`);
      sheets.forEach(s => zip.file('xl/worksheets/sheet' + s.id + '.xml', sheetXml(s.table)));

      const blob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = (document.title || 'deck-tables').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-tables.xlsx';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(a.href), 1500);
      showToast('Downloaded ' + a.download + ' (' + tables.length + ' table' + (tables.length > 1 ? 's' : '') + ')');
    } catch (err) {
      console.error('[dr.js] Excel export failed:', err);
      showToast('Excel export failed — see console');
    } finally { exporting = false; }
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
    // Excel button only when the deck actually has data tables worth exporting.
    if (dataTables().length) {
      const xlsBtn = document.createElement('button');
      xlsBtn.className = 'dr-export-btn dr-export-secondary';
      xlsBtn.type = 'button';
      xlsBtn.setAttribute('aria-label', 'Export the deck\'s data tables to an Excel .xlsx file');
      xlsBtn.innerHTML = '<span class="dr-export-icon">↓</span><span class="dr-export-label">Excel</span>';
      xlsBtn.addEventListener('click', exportTablesToXlsx);
      dock.appendChild(xlsBtn);
    }
    dock.appendChild(pptxBtn);
    document.body.appendChild(dock);
  }
})();
