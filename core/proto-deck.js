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
  // POWERPOINT EXPORT — every slide → one full-bleed 16:9 image in a
  // real .pptx. Press 'A' or click the export button.
  //
  // Rasterization uses html2canvas (live, same-origin DOM with already-
  // loaded webfonts) rather than the SVG/foreignObject path above —
  // SVG image contexts drop @font-face and can taint the canvas, which
  // would break toDataURL. Both libs lazy-load on first use so normal
  // page loads never pay the ~700KB cost. 1600x900 stages are the native
  // PowerPoint frame (13.333in x 7.5in).
  // ============================================================
  const VENDOR_BASE = DR_SCRIPT ? new URL('../../vendor/', DR_SCRIPT.src).href : 'vendor/';
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
  async function ensurePptxLibs() {
    if (!window.html2canvas) await loadScript(VENDOR_BASE + 'html2canvas.min.js');
    if (!window.PptxGenJS)   await loadScript(VENDOR_BASE + 'pptxgenjs.min.js');
  }

  let exporting = false;
  async function exportDeckAsPptx() {
    if (exporting) return;
    exporting = true;
    try {
      showToast('Loading export libraries…');
      await ensurePptxLibs();

      const pptx = new window.PptxGenJS();
      pptx.defineLayout({ name: 'DR16x9', width: 13.333, height: 7.5 });
      pptx.layout = 'DR16x9';

      for (let i = 0; i < slides.length; i++) {
        showToast('Rendering slide ' + (i + 1) + ' / ' + slides.length + '…');
        const slide = slides[i];
        const stage = slide.querySelector('.slide-stage') || slide;
        const isFixed = stage.classList.contains('slide-stage');
        const w = isFixed ? 1600 : Math.round(stage.getBoundingClientRect().width);
        const h = isFixed ? 900  : Math.round(stage.getBoundingClientRect().height);

        const canvas = await window.html2canvas(stage, {
          backgroundColor: getComputedStyle(document.body).backgroundColor || '#f5f0e6',
          scale: 2,
          width: w, height: h,
          windowWidth: 1600, windowHeight: 900,
          useCORS: true, logging: false,
          onclone: (doc) => {
            // Neutralize the fit-scale transform so the stage rasterizes at
            // its full native 1600x900 instead of the on-screen scaled size.
            doc.documentElement.style.setProperty('--deck-scale', '1');
            doc.querySelectorAll('.slide-stage').forEach(st => { st.style.transform = 'none'; });
          }
        });

        pptx.addSlide().addImage({
          data: canvas.toDataURL('image/png'),
          x: 0, y: 0, w: 13.333, h: 7.5
        });
      }

      showToast('Building .pptx…');
      const fname = (document.title || 'design-review-deck')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.pptx';
      await pptx.writeFile({ fileName: fname });
      showToast('Downloaded ' + fname);
    } catch (err) {
      console.error('[dr.js] PPTX export failed:', err);
      showToast('PPTX export failed — see console');
    } finally {
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
