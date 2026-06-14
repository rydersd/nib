/* wf-napkin.js — the shared napkin texture pipeline + doodle stroke engine.
 * ONE source of truth, loaded by both wf-nav.js (eqPartners) and proto-nav.js
 * (nib). Exposes window.WFNapkin. Generators extracted verbatim from wf-nav.js;
 * the only edits vs that copy: self-locating texture path, broadened card-header
 * selector, and the gated/early asset-pass lifecycle (the load-flash fix).
 * Plain <script> (no ES module) so it works on file:// and the worker. */
(function () {
  if (window.WFNapkin) return;

  // ── self-locating texture path (replaces the _fdBase / wfTexturePath split) ──
  var _texOverride = null;
  function wfTexturePath() {
    if (_texOverride) return _texOverride;
    var s = document.getElementsByTagName('script');
    for (var i = 0; i < s.length; i++) {
      var src = s[i].getAttribute('src') || '';
      if (src.indexOf('wf-napkin.js') !== -1) return src.replace(/wf-napkin\.js([?#].*)?$/, '') + 'textures/';
    }
    return 'core/textures/';
  }

  // ── doodle stroke engine (shared low-level; the 24-mark vocabulary lives in
  //    wf-doodles.js). Lifted from the doodle lab. PENS_INK below is the
  //    canonical card-ink palette; doodles pass their own DOODLE_PENS profile. ──
  function rnd(a,b){ return a+Math.random()*(b-a); }
  function ri(a,b){ return Math.floor(rnd(a,b+1)); }
  function r1(n){ return Math.round(n*10)/10; }
  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  var TAU = Math.PI*2;
  var _uid = 0;
  function ink(pen,al){ return 'rgba('+pen.rgb[0]+','+pen.rgb[1]+','+pen.rgb[2]+','+Math.max(.08,al).toFixed(2)+')'; }
  function plen(pts){ var L=0; for(var i=1;i<pts.length;i++){ var dx=pts[i][0]-pts[i-1][0],dy=pts[i][1]-pts[i-1][1]; L+=Math.sqrt(dx*dx+dy*dy);} return L; }
  function gesture(pts, pen, o){
    o=o||{};
    var a=rnd(pen.a[0],pen.a[1])*(o.aMul||1), w=rnd(pen.w[0],pen.w[1])*(o.wMul||1);
    var d='M'+r1(pts[0][0])+','+r1(pts[0][1]);
    for(var i=1;i<pts.length;i++) d+=' L'+r1(pts[i][0])+','+r1(pts[i][1]);
    var out='';
    if(Math.random() < pen.pool*(o.poolMul==null?1:o.poolMul))
      out+='<circle cx="'+r1(pts[0][0])+'" cy="'+r1(pts[0][1])+'" r="'+r1(w*rnd(pen.poolR[0],pen.poolR[1]))+'" fill="'+ink(pen,Math.min(.7,a+.12))+'"/>';
    var dash='';
    if(Math.random() < pen.skip*(o.skipMul==null?1:o.skipMul)){
      var L=plen(pts), p1=L*rnd(.2,.5), g1=rnd(pen.skipLen[0],pen.skipLen[1]);
      dash=' stroke-dasharray="'+r1(p1)+' '+r1(g1)+' '+r1(L)+'"';
    }
    out+='<path d="'+d+'" fill="none" stroke="'+ink(pen,a)+'" stroke-width="'+r1(w)+'" stroke-linecap="round" stroke-linejoin="round"'+dash+'/>';
    if(Math.random() < pen.twin){
      var off=rnd(.9,1.6)*(Math.random()<.5?1:-1), d2='M'+r1(pts[0][0]+off)+','+r1(pts[0][1]);
      for(var k=1;k<pts.length;k++) d2+=' L'+r1(pts[k][0]+off)+','+r1(pts[k][1]);
      out+='<path d="'+d2+'" fill="none" stroke="'+ink(pen,a*.45)+'" stroke-width="'+r1(w*.7)+'" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    if(!o.noEnd && Math.random() < pen.endDot){
      var e=pts[pts.length-1];
      out+='<circle cx="'+r1(e[0])+'" cy="'+r1(e[1])+'" r="'+r1(w*rnd(.5,.85))+'" fill="'+ink(pen,a*.9)+'"/>';
    }
    return out;
  }
  function dot(x,y,r,pen,al){ return '<circle cx="'+r1(x)+'" cy="'+r1(y)+'" r="'+r1(r)+'" fill="'+ink(pen,al)+'"/>'; }
  function wrap(W,H,body,opts){
    opts=opts||{};
    var id='k'+(_uid++), freq=opts.freq||'0.020 0.028', scale=opts.scale==null?2.0:opts.scale, seed=ri(1,98);
    return '<svg xmlns="http://www.w3.org/2000/svg" width="'+(opts.w||W)+'" height="'+(opts.h||H)+'" viewBox="0 0 '+W+' '+H+'">'+
      '<defs><filter id="'+id+'" x="-12%" y="-12%" width="124%" height="124%">'+
      '<feTurbulence type="turbulence" baseFrequency="'+freq+'" numOctaves="2" seed="'+seed+'" result="n"/>'+
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="'+scale+'"/></filter></defs>'+
      '<g filter="url(#'+id+')">'+body+'</g></svg>';
  }

  // ════════════════ napkin generators (verbatim from wf-nav.js) ════════════════
      function paperTile() {
        var seed = Math.floor(1 + Math.random() * 98);
        var bf = (0.55 + Math.random() * 0.3).toFixed(2);
        // Stakeholder bar is "very faint" (2026-06-12) — was 0.26-0.38,
        // which read as visible speckle on the white pieces.
        var amp = (0.17 + Math.random() * 0.08).toFixed(2);
        var svg =
          '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">' +
          '<filter id="p" x="0" y="0" width="100%" height="100%">' +
          '<feTurbulence type="fractalNoise" baseFrequency="' + bf + '" numOctaves="2" seed="' + seed + '" stitchTiles="stitch"/>' +
          '<feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.53  0 0 0 0 0.50  ' + amp + ' 0 0 0 0"/>' +
          '</filter>' +
          '<rect width="256" height="256" filter="url(#p)"/>' +
          '</svg>';
        document.documentElement.style.setProperty('--wf-paper-tex',
          'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '")');
      }

      // ── Tea-bag stain generator ─────────────────────────────────────
      // Three layers, modeled on a real tea-bag stain photo:
      //   1. the seeping water — pale halo with a ragged, displaced
      //      tide-line edge where the liquid wicked through the paper
      //   2. the bag body — soft rounded-rect imprint with fine fabric
      //      mottle, multiply-blended
      //   3. the bag edge — the dark amber seam band where pigment
      //      concentrated, crisper than everything around it
      // Every call randomizes turbulence seeds, seep geometry, bag size
      // and angle, seam side, and color temperature, then returns a data
      // URI. SVG filters rasterize once at <img> decode — no runtime cost.
      // Tea palette — coffee is always coffee, but tea varies by leaf:
      // mostly classic black (tawny amber), with the occasional very-faint
      // ceylon (coppery red) or green tea (grassy). The faint variants get
      // an opacity boost < 1 so the off-colors stay whisper-subtle.
      var TEA_PALETTE = [
        { h: 38, s: 34, boost: 1 },     // black tea — tawny amber (the usual)
        { h: 38, s: 34, boost: 1 },
        { h: 40, s: 32, boost: 1 },
        { h: 42, s: 30, boost: 1 },
        { h: 24, s: 40, boost: 0.6 },   // ceylon — very faint coppery red
        { h: 95, s: 28, boost: 0.5 }    // green tea — very faint grassy green
      ];

      function buildTeaStainSVG(leaf) {
        function rnd(a, b) { return a + Math.random() * (b - a); }
        function r1(n) { return Math.round(n * 10) / 10; }
        // smooth closed blob: n points around an ellipse with radial
        // jitter, joined with catmull-rom-derived beziers
        function blob(cx, cy, rx, ry, n, jit) {
          var pts = [];
          for (var i = 0; i < n; i++) {
            var ang = (i / n) * Math.PI * 2;
            var k = 1 - jit + Math.random() * jit * 2;
            pts.push([cx + Math.cos(ang) * rx * k, cy + Math.sin(ang) * ry * k]);
          }
          var d = 'M' + r1(pts[0][0]) + ',' + r1(pts[0][1]);
          for (var j = 0; j < n; j++) {
            var p0 = pts[(j - 1 + n) % n], p1 = pts[j], p2 = pts[(j + 1) % n], p3 = pts[(j + 2) % n];
            d += 'C' + r1(p1[0] + (p2[0] - p0[0]) / 6) + ',' + r1(p1[1] + (p2[1] - p0[1]) / 6) +
                 ' ' + r1(p2[0] - (p3[0] - p1[0]) / 6) + ',' + r1(p2[1] - (p3[1] - p1[1]) / 6) +
                 ' ' + r1(p2[0]) + ',' + r1(p2[1]);
          }
          return d + 'Z';
        }

        var s1 = Math.floor(rnd(1, 99)), s2 = Math.floor(rnd(1, 99)), s3 = Math.floor(rnd(1, 99));
        // A specific leaf can be passed in (a tea drinker brews the same pot
        // all day); otherwise pick per stain (shared desk, different mugs).
        var tea = leaf || TEA_PALETTE[Math.floor(Math.random() * TEA_PALETTE.length)];
        var hue = tea.h + Math.floor(rnd(-3, 3)), sat = tea.s, boost = tea.boost;
        // 290x280 canvas, bag pivot (145,104): generous margins so jittered
        // blob points + displacement never reach the bitmap edge (geometry
        // past the raster cuts off dead-straight — the clipped-ring look).
        // The water FLARES OUT along the bag's long axis (reference photo:
        // the seep runs away from the bag, aligned with its rectangle), so
        // the seep blob is elongated along that axis and offset down-flow,
        // and the whole stain shares one rotation so flare and bag stay
        // aligned. Placement already spins the <img> 0-360deg, so down-flow
        // in SVG space costs no variety.
        var bw = rnd(58, 76), bh = bw * rnd(1.15, 1.35);    // tea-bag proportions
        var ang = r1(rnd(-16, 16));
        var seamLeft = Math.random() < 0.5;
        // Fluid direction (annotated reference 2026-06-12): the water runs
        // DIAGONALLY away from the seam side, at an angle to the bag
        // rectangle — not straight down its long axis. The seep gets its
        // own tilt (rendered as a nested rotation so the blob's elongation
        // follows the flow vector) and its center offsets down-flow.
        var flow = bh * rnd(0.22, 0.35);                    // how far the water ran
        var tilt = r1((seamLeft ? -1 : 1) * rnd(18, 45));   // negative = flow swings right, away from a left seam
        // Seep ALWAYS encloses the bag: the wet halo wicks OUT from the bag, so
        // it surrounds it. Short axis clears the bag half-diagonal + the tide-line
        // displacement; long axis adds the down-flow bulge. Centered on the bag
        // (only a slight down-flow nudge) so the imprint can never poke outside.
        var diag = Math.sqrt(bw * bw + bh * bh) / 2;
        var seepRx = r1(diag + rnd(40, 54));
        var seepRy = r1(seepRx + flow);
        var seepD = blob(145, r1(104 + flow * 0.25), seepRx, seepRy, 10, 0.16);
        var bx = r1(145 - bw / 2 + rnd(-6, 6)), by = r1(104 - bh / 2 + rnd(-4, 4));
        var sx = r1(seamLeft ? bx - 3 : bx + bw - 6);
        var sh = r1(bh * rnd(0.75, 1.0) + 6), sy = r1(by - 3 + rnd(0, bh - sh + 6));

        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 290 280" width="290" height="280">' +
          '<defs>' +
            '<filter id="seep" x="-25%" y="-25%" width="150%" height="150%">' +
              '<feTurbulence type="turbulence" baseFrequency="0.052 0.068" numOctaves="3" seed="' + s1 + '" result="t"/>' +
              '<feDisplacementMap in="SourceGraphic" in2="t" scale="22"/>' +
              '<feGaussianBlur stdDeviation="0.6"/>' +
            '</filter>' +
            // The tide line rides the SAME displacement field as the wash
            // (same seed/scale) but skips the blur — pigment dries darkest
            // and crispest right at the drying boundary.
            '<filter id="seepEdge" x="-25%" y="-25%" width="150%" height="150%">' +
              '<feTurbulence type="turbulence" baseFrequency="0.052 0.068" numOctaves="3" seed="' + s1 + '" result="t"/>' +
              '<feDisplacementMap in="SourceGraphic" in2="t" scale="22"/>' +
              '<feGaussianBlur stdDeviation="0.2"/>' +
            '</filter>' +
            '<filter id="bag" x="-25%" y="-25%" width="150%" height="150%">' +
              '<feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="' + s2 + '" result="t"/>' +
              '<feDisplacementMap in="SourceGraphic" in2="t" scale="13" result="d"/>' +
              '<feGaussianBlur in="d" stdDeviation="3" result="soft"/>' +
              '<feTurbulence type="fractalNoise" baseFrequency="0.38" numOctaves="2" seed="' + (s2 + 31) + '" result="g"/>' +
              '<feColorMatrix in="g" type="matrix" values="0 0 0 0 0.52 0 0 0 0 0.42 0 0 0 0 0.27 0 0 0 0.45 0" result="gt"/>' +
              '<feComposite in="gt" in2="soft" operator="in" result="sp"/>' +
              '<feBlend in="soft" in2="sp" mode="multiply"/>' +
            '</filter>' +
            // Bag tide — same turbulence as #bag so the rim rides the same
            // displaced boundary, but near-zero blur: pigment concentrates
            // where the water stops at the imprint edge, the same crisp
            // transition the seep outline has (stakeholder 2026-06-12).
            '<filter id="bagEdge" x="-25%" y="-25%" width="150%" height="150%">' +
              '<feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="' + s2 + '" result="t"/>' +
              '<feDisplacementMap in="SourceGraphic" in2="t" scale="13"/>' +
              '<feGaussianBlur stdDeviation="0.25"/>' +
            '</filter>' +
            '<filter id="seam" x="-30%" y="-30%" width="160%" height="160%">' +
              '<feTurbulence type="turbulence" baseFrequency="0.06 0.09" numOctaves="2" seed="' + s3 + '" result="t"/>' +
              '<feDisplacementMap in="SourceGraphic" in2="t" scale="7"/>' +
              '<feGaussianBlur stdDeviation="1.4"/>' +
            '</filter>' +
          '</defs>' +
          // Outer rotation orients the whole stain; the nested rotation
          // tilts ONLY the seep so its elongation and offset follow the
          // fluid direction, diagonal to the bag rectangle.
          '<g transform="rotate(' + ang + ' 145 104)">' +
            '<g transform="rotate(' + tilt + ' 145 104)">' +
              // 1 — seeping water: pale wash (fainter — stakeholder
              //     2026-06-12), then the tide line as its own crisp pass
              '<path d="' + seepD + '" fill="hsl(' + hue + ',' + (sat - 8) + '%,74%)" fill-opacity="' + (0.22 * boost).toFixed(2) + '" filter="url(#seep)"/>' +
              '<path d="' + seepD + '" fill="none" ' +
                'stroke="hsl(' + hue + ',' + (sat - 2) + '%,50%)" stroke-opacity="' + (0.5 * boost).toFixed(2) + '" stroke-width="' + r1(rnd(1.4, 2.2)) + '" filter="url(#seepEdge)"/>' +
            '</g>' +
            // 2 — bag body: fabric-mottled imprint
            '<rect x="' + bx + '" y="' + by + '" width="' + r1(bw) + '" height="' + r1(bh) + '" rx="8" ' +
              'fill="hsl(' + hue + ',' + (sat - 4) + '%,58%)" fill-opacity="' + (0.26 * boost).toFixed(2) + '" style="mix-blend-mode:multiply" filter="url(#bag)"/>' +
            // 2b — bag tide: crisp rim on the imprint boundary
            '<rect x="' + bx + '" y="' + by + '" width="' + r1(bw) + '" height="' + r1(bh) + '" rx="8" fill="none" ' +
              'stroke="hsl(' + hue + ',' + (sat + 6) + '%,48%)" stroke-opacity="' + (0.4 * boost).toFixed(2) + '" stroke-width="' + r1(rnd(1.2, 1.8)) + '" style="mix-blend-mode:multiply" filter="url(#bagEdge)"/>' +
            // 3 — bag edge: the dark seam where pigment concentrated
            '<rect x="' + sx + '" y="' + sy + '" width="11" height="' + sh + '" rx="5.5" ' +
              'fill="hsl(' + (hue - 3) + ',' + (sat + 18) + '%,43%)" fill-opacity="' + (0.42 * boost).toFixed(2) + '" style="mix-blend-mode:multiply" filter="url(#seam)"/>' +
          '</g>' +
          '</svg>'
        );
      }

      // ── Coffee-ring generator ───────────────────────────────────────
      // Modeled on three reference photos: a thin crisp band, a medium ring
      // broken into arcs (lifted and set down twice), and a heavy annulus
      // with a faint offset ghost echo. Same turbulence/displace/blur shader
      // family as the tea stain. Coffee is ALWAYS the same pigment — one
      // pale-khaki color; variety comes from geometry and the page-level
      // strength tiers. Rasterizes once at <img> decode; zero runtime cost.
      function buildCoffeeRingSVG() {
        function rnd(a, b) { return a + Math.random() * (b - a); }
        function r1(n) { return Math.round(n * 10) / 10; }
        var s1 = Math.floor(rnd(1, 99));
        var col = 'hsl(47,30%,62%)';
        // Smaller cups read truer at dashboard zoom (stakeholder 2026-06-12).
        var rx = rnd(44, 62), ry = rx * rnd(0.93, 1.0);
        var rot = r1(rnd(0, 180));
        // band style: thin crisp / medium / heavy annulus
        // Tighter edge noise — rings now render at 490-551px (2x+ the old
        // size), which magnified the displacement into big smooth lobes.
        // Less excursion + higher frequency keeps the wobble in scale
        // (stakeholder note on the 225% lab sample, 2026-06-12).
        var roll = Math.random(), w, disp, blur;
        if (roll < 0.3)      { w = rnd(3, 6);   disp = 4; blur = 0.4; }
        else if (roll < 0.7) { w = rnd(8, 14);  disp = 6; blur = 0.7; }
        else                 { w = rnd(15, 24); disp = 8; blur = 1.0; }
        var circ = Math.PI * (rx + ry);
        // broken arcs — the lifted-cup look (~45% of rings)
        var dash = '';
        if (Math.random() < 0.45) {
          var segs = [], total = 0;
          while (total < circ) {
            var draw = rnd(circ * 0.15, circ * 0.4), gap = rnd(6, 22);
            segs.push(r1(draw), r1(gap)); total += draw + gap;
          }
          dash = ' stroke-dasharray="' + segs.join(' ') + '" stroke-dashoffset="' + r1(rnd(0, circ)) + '"';
        }
        // 240px canvas, ring at 120: set-downs, ghost echoes and displacement
        // must all stay inside the raster — anything that reaches the bitmap
        // edge cuts off in a dead-straight line (the "clipped" ring look).
        function ell(dx, dy, sw, op, d) {
          return '<ellipse cx="' + r1(120 + dx) + '" cy="' + r1(120 + dy) + '" rx="' + r1(rx) +
            '" ry="' + r1(ry) + '" fill="none" stroke="' + col + '" stroke-width="' + r1(sw) +
            '" stroke-opacity="' + op + '" stroke-linecap="round"' + (d || '') + '/>';
        }
        var body = ell(0, 0, w, 0.55, dash);
        if (Math.random() < 0.35) {                       // double set-down
          var a = rnd(0, 6.283), d = rnd(5, 16);
          body += ell(Math.cos(a) * d, Math.sin(a) * d, w * rnd(0.6, 1.1), 0.4, dash);
        }
        if (Math.random() < 0.4) {                        // faint fat ghost echo
          var a2 = rnd(0, 6.283), d2 = rnd(3, 10);
          body += ell(Math.cos(a2) * d2, Math.sin(a2) * d2, w * rnd(1.4, 2.0), 0.16, '');
        }
        if (Math.random() < 0.4) {                        // interior haze arc
          body += '<ellipse cx="120" cy="120" rx="' + r1(rx * 0.8) + '" ry="' + r1(ry * 0.8) +
            '" fill="none" stroke="' + col + '" stroke-width="' + r1(rx * 0.5) +
            '" stroke-opacity="0.10" stroke-dasharray="' + r1(circ * 0.35) + ' ' + r1(circ) +
            '" stroke-dashoffset="' + r1(rnd(0, circ)) + '"/>';
        }
        // The tide line — pigment migrates to the drying boundary and dries
        // darker and CRISPER than the body wash (the coffee-ring effect).
        // Same turbulence seed/scale as the body so the wobbles align, but
        // its own filter pass with almost no blur keeps the rim sharp.
        var tw = rnd(1.2, 2);
        var tide = '<ellipse cx="120" cy="120" rx="' + r1(rx + w / 2 - tw / 2) +
          '" ry="' + r1(ry + w / 2 - tw / 2) +
          '" fill="none" stroke="hsl(45,38%,46%)" stroke-width="' + r1(tw) +
          '" stroke-opacity="' + rnd(0.45, 0.65).toFixed(2) + '" stroke-linecap="round"' + dash + '/>';
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">' +
          '<defs><filter id="rg" x="-20%" y="-20%" width="140%" height="140%">' +
          '<feTurbulence type="turbulence" baseFrequency="0.09 0.12" numOctaves="2" seed="' + s1 + '" result="t"/>' +
          '<feDisplacementMap in="SourceGraphic" in2="t" scale="' + disp + '" result="d"/>' +
          '<feGaussianBlur in="d" stdDeviation="' + blur + '" result="soft"/>' +
          '<feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="2" seed="' + (s1 + 17) + '" result="g"/>' +
          '<feColorMatrix in="g" type="matrix" values="0 0 0 0 0.52 0 0 0 0 0.45 0 0 0 0 0.3 0 0 0 0.4 0" result="gt"/>' +
          '<feComposite in="gt" in2="soft" operator="in" result="sp"/>' +
          '<feBlend in="soft" in2="sp" mode="multiply"/>' +
          '</filter>' +
          '<filter id="rt" x="-20%" y="-20%" width="140%" height="140%">' +
          '<feTurbulence type="turbulence" baseFrequency="0.09 0.12" numOctaves="2" seed="' + s1 + '" result="t"/>' +
          '<feDisplacementMap in="SourceGraphic" in2="t" scale="' + disp + '"/>' +
          '<feGaussianBlur stdDeviation="0.2"/>' +
          '</filter></defs>' +
          '<g transform="rotate(' + rot + ' 120 120)">' +
          '<g filter="url(#rg)">' + body + '</g>' +
          '<g filter="url(#rt)">' + tide + '</g>' +
          '</g>' +
          '</svg>'
        );
      }

      // ── Sharpie ink-frame generator ─────────────────────────────────
      // Paper-prototype card outlines, modeled on how humans actually draw
      // them: a hand-pulled marker rectangle whose line TAPERS — a base nib
      // stroke plus one or two heavier "pressure" passes at random spots
      // along the perimeter — with an occasional pen-lift gap. Ink alpha,
      // nib width, margin, and wobble seed vary per frame. Stamped onto each
      // card as a CSS custom prop (--wf-ink-frame) and shown only at napkin
      // by wf-fidelity.css. One tiny SVG, rasterized once per card.
      // Calibrated pen profiles (evidence: nib/docs/Pen-Samples.md). rgb is
      // the pen's ink — ballpoint runs blue-grey, sharpie warm black. twin =
      // odds of double-tracking (a faint parallel ghost stroke, clear in the
      // clean ballpoint sheets). The sharpie carries the bolder MARKER look
      // and feel for the tiles that suit it.
      // Spread far enough apart that two hands on one page READ as two
      // hands at dashboard zoom: hairline-dark / medium-smooth / faint-blue
      // / bold-marker.
      var PENS_INK = [
        { rgb: [22, 23, 26], w: [0.55, 0.8],  a: [0.55, 0.72], pool: 0.7,  poolR: [1.5, 2.2], skip: 0.25, skipLen: [2, 5],  tail: 0.55, endDot: 0.5,  frag: 0.25, catch: 0.2,  twin: 0.05 }, // rotring — hairline, dark, crisp
        { rgb: [30, 31, 38], w: [1.0, 1.35],  a: [0.42, 0.55], pool: 0.25, poolR: [1.3, 1.8], skip: 0.1,  skipLen: [2, 4],  tail: 0.35, endDot: 0.35, frag: 0.1,  catch: 0.25, twin: 0.05 }, // muji gel — medium, smooth
        { rgb: [48, 53, 74], w: [0.65, 0.9],  a: [0.24, 0.38], pool: 0.05, poolR: [1.2, 1.5], skip: 0.55, skipLen: [4, 18], tail: 0.7,  endDot: 0.4,  frag: 0.55, catch: 0.15, twin: 0.35 }, // ballpoint — faint blue-grey, broken
        { rgb: [32, 29, 27], w: [1.9, 2.7],   a: [0.55, 0.68], pool: 0.35, poolR: [1.4, 1.9], skip: 0.04, skipLen: [2, 4],  tail: 0.25, endDot: 0.25, frag: 0.05, catch: 0.08, twin: 0 }    // marker — bold, warm, solid
      ];

      // One page, a few hands: every tile is drawn by one of 1–3 AUTHORS —
      // a dominant hand plus contributors ("x drawn by one hand, x drawn by
      // others"). An author owns a pen, a wobble signature (fixed turbulence
      // seed + frequency → their frames share one wave character), a frame-
      // inset habit, and a discipline factor scaling their pen's quirks.
      function makeAuthor(excludePens) {
        var pool = PENS_INK.filter(function (pn) { return (excludePens || []).indexOf(pn) === -1; });
        if (!pool.length) pool = PENS_INK;
        return {
          pen: pool[Math.floor(Math.random() * pool.length)],
          seed: Math.floor(1 + Math.random() * 98),
          freq: (0.008 + Math.random() * 0.008).toFixed(3) + ' ' + (0.012 + Math.random() * 0.01).toFixed(3),
          m: 5 + Math.random() * 4,
          disc: 0.7 + Math.random() * 0.6   // <1 sloppier, >1 more careful
        };
      }

      function buildInkFrameSVG(W, H, headerY, author) {
        function rnd(a, b) { return a + Math.random() * (b - a); }
        function r1(n) { return Math.round(n * 10) / 10; }
        var seed = author.seed;
        // Hand-ruled technical-pen frame, per the reference boards: each side
        // is its OWN stroke, slightly angled, overshooting the corners —
        // working fast and technically. Pen physics per stroke:
        //   · the START pools — a rounder dot where the nib first lands
        //   · the END finishes quick and light — thinner, fainter tail
        //   · ~35% of strokes skip — small gaps where the pen didn't fully
        //     touch the surface
        // The frame sits clearly INSIDE the piece; the paper edge itself
        // carries no ink — tone + shadow define the cut.
        var m = author.m + rnd(-1, 1);           // the author's frame-inset habit
        var pen = author.pen;
        // Author discipline: careful hands pool and dot more, skip and
        // fragment less; sloppy hands the reverse.
        function c01(v) { return Math.max(0, Math.min(1, v)); }
        var P = {
          pool: c01(pen.pool * author.disc), endDot: c01(pen.endDot * author.disc),
          catch: c01(pen.catch * (1.7 - author.disc)),
          skip: c01(pen.skip * (1.7 - author.disc)), frag: c01(pen.frag * (1.7 - author.disc)),
          tail: pen.tail, twin: pen.twin
        };
        // Dying pen — rare whole-frame wash (the faint sets in the samples)
        var dying = Math.random() < 0.07 ? 0.45 + Math.random() * 0.15 : 1;
        function ln(x1, y1, x2, y2) {
          var a = rnd(pen.a[0], pen.a[1]) * dying;  // stroke ink density
          var w = rnd(pen.w[0], pen.w[1]);          // stroke nib width
          var ink = function (al) { return 'rgba(' + pen.rgb[0] + ',' + pen.rgb[1] + ',' + pen.rgb[2] + ',' + Math.max(0.08, al).toFixed(2) + ')'; };
          var len = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
          var t = rnd(0.8, 0.92);                   // where the light lift begins
          var mx = x1 + (x2 - x1) * t, my = y1 + (y2 - y1) * t;
          // pen-skip: gaps in the main run — pen-specific lengths (a ballpoint
          // can lose contact for a long stretch)
          var dash = '';
          if (Math.random() < P.skip) {
            var run = len * t, p1 = run * rnd(0.15, 0.55), g1 = rnd(pen.skipLen[0], pen.skipLen[1]);
            if (Math.random() < 0.4) {
              var p2 = run * rnd(0.6, 0.85) - p1 - g1, g2 = rnd(pen.skipLen[0], pen.skipLen[1] * 0.7);
              dash = ' stroke-dasharray="' + r1(p1) + ' ' + r1(g1) + ' ' + r1(Math.max(4, p2)) + ' ' + r1(g2) + ' ' + r1(run) + '"';
            } else {
              dash = ' stroke-dasharray="' + r1(p1) + ' ' + r1(g1) + ' ' + r1(run) + '"';
            }
          }
          var out = '';
          // pooled landing — pen-dependent, never guaranteed; pools run
          // 1.4–2× the nib in the samples
          if (Math.random() < P.pool) {
            out += '<circle cx="' + r1(x1) + '" cy="' + r1(y1) + '" r="' + r1(w * rnd(pen.poolR[0], pen.poolR[1])) + '" fill="' + ink(Math.min(0.7, a + 0.12)) + '"/>';
          }
          if (Math.random() < P.tail) {
            out += '<path d="M' + r1(x1) + ',' + r1(y1) + ' L' + r1(mx) + ',' + r1(my) +
              '" fill="none" stroke="' + ink(a) + '" stroke-width="' + r1(w) + '" stroke-linecap="round"' + dash + '/>';
            if (Math.random() < P.frag) {
              // tail disintegrates into fragments rather than thinning
              out += '<path d="M' + r1(mx) + ',' + r1(my) + ' L' + r1(x2) + ',' + r1(y2) +
                '" fill="none" stroke="' + ink(a * 0.5) + '" stroke-width="' + r1(w * 0.55) +
                '" stroke-linecap="round" stroke-dasharray="' + r1(rnd(2, 4)) + ' ' + r1(rnd(2, 4)) + ' ' + r1(rnd(1, 2.5)) + ' ' + r1(rnd(2.5, 4.5)) + '"/>';
            } else {
              out += '<path d="M' + r1(mx) + ',' + r1(my) + ' L' + r1(x2) + ',' + r1(y2) +
                '" fill="none" stroke="' + ink(a * 0.45) + '" stroke-width="' + r1(w * 0.6) + '" stroke-linecap="round"/>';
            }
          } else {
            out += '<path d="M' + r1(x1) + ',' + r1(y1) + ' L' + r1(x2) + ',' + r1(y2) +
              '" fill="none" stroke="' + ink(a) + '" stroke-width="' + r1(w) + '" stroke-linecap="round"' + dash + '/>';
          }
          // lift-off dot at the stroke end
          if (Math.random() < P.endDot) {
            out += '<circle cx="' + r1(x2) + '" cy="' + r1(y2) + '" r="' + r1(w * rnd(0.5, 0.85)) + '" fill="' + ink(a * 0.9) + '"/>';
          }
          // double-tracking: a faint parallel ghost stroke (ballpoint habit)
          if (Math.random() < P.twin) {
            var off = rnd(0.9, 1.6) * (Math.random() < 0.5 ? 1 : -1);
            // Offset perpendicular to the stroke's DOMINANT axis — the
            // endpoints carry jitter, so an exact y2===y1 test never matched
            // on horizontal strokes and the ghost slid along them (hidden
            // under the main line) instead of tracking beside them.
            var horiz = Math.abs(x2 - x1) >= Math.abs(y2 - y1);
            var px = horiz ? 0 : off, py = horiz ? off : 0;
            out += '<path d="M' + r1(x1 + px) + ',' + r1(y1 + py) + ' L' + r1(x2 + px) + ',' + r1(y2 + py) +
              '" fill="none" stroke="' + ink(a * 0.45) + '" stroke-width="' + r1(w * 0.7) + '" stroke-linecap="round"/>';
          }
          // mid-line catch dots — the nib snagging a paper bump
          if (Math.random() < P.catch) {
            var nDots = Math.random() < 0.3 ? 2 : 1;
            for (var di = 0; di < nDots; di++) {
              var ct = rnd(0.15, 0.85);
              out += '<circle cx="' + r1(x1 + (x2 - x1) * ct) + '" cy="' + r1(y1 + (y2 - y1) * ct) +
                '" r="' + r1(w * rnd(0.5, 0.8)) + '" fill="' + ink(Math.min(0.7, a + 0.08)) + '"/>';
            }
          }
          return out;
        }
        function o() { return rnd(1.5, Math.max(2, m - 1.5)); }  // corner overshoot
        function j() { return rnd(-0.8, 0.8); }                  // hand angle drift
        var body =
          ln(m - o(), m + j(), W - m + o(), m + j()) +           // top
          ln(m - o(), H - m + j(), W - m + o(), H - m + j()) +   // bottom
          ln(m + j(), m - o(), m + j(), H - m + o()) +           // left
          ln(W - m + j(), m - o(), W - m + j(), H - m + o());    // right
        // Title-bar rule — every sheet on the reference wall draws a line
        // under its header chrome. Ruled with the same pen, just inside the
        // verticals, sitting next to the CSS divider = the double-rule look.
        if (headerY && headerY > m + 6 && headerY < H * 0.5) {
          body += ln(m + rnd(0, 2), headerY + j(), W - m - rnd(0, 2), headerY + j());
        }
        return 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + Math.round(W) + ' ' + Math.round(H) + '" preserveAspectRatio="none">' +
          '<defs><filter id="k" x="-5%" y="-5%" width="110%" height="110%">' +
          '<feTurbulence type="turbulence" baseFrequency="' + author.freq + '" numOctaves="2" seed="' + seed + '" result="n"/>' +
          '<feDisplacementMap in="SourceGraphic" in2="n" scale="2.4"/>' +
          '</filter></defs><g filter="url(#k)">' + body + '</g></svg>'
        ) + '")';
      }
      // Scissor-cut silhouette: a human cutting out a sharpie box leaves
      // straight-ish runs with small angle changes and clipped (chamfered)
      // corners — never perfect 90°s. Inward-only jitter so the cut always
      // stays inside the layout box. Applied as clip-path to the paper
      // pseudo; the card's drop-shadow follows this silhouette.
      function buildCutPath(W, H) {
        function rnd(a, b) { return a + Math.random() * (b - a); }
        function r1(n) { return Math.round(n * 10) / 10; }
        var j = 2.4;                                    // edge waver depth
        function ch() { return rnd(2.5, 7); }           // corner chamfer size
        var pts = [
          [ch(), rnd(0, j)],
          [W * 0.33 + rnd(-9, 9), rnd(0, j)],
          [W * 0.66 + rnd(-9, 9), rnd(0, j)],
          [W - ch(), rnd(0, j)],
          [W - rnd(0, j), ch()],
          [W - rnd(0, j), H * 0.5 + rnd(-12, 12)],
          [W - rnd(0, j), H - ch()],
          [W - ch(), H - rnd(0, j)],
          [W * 0.5 + rnd(-12, 12), H - rnd(0, j)],
          [ch(), H - rnd(0, j)],
          [rnd(0, j), H - ch()],
          [rnd(0, j), H * 0.5 + rnd(-12, 12)],
          [rnd(0, j), ch()]
        ];
        return 'polygon(' + pts.map(function (pt) { return r1(pt[0]) + 'px ' + r1(pt[1]) + 'px'; }).join(', ') + ')';
      }

      function stampInkFrames() {
        // Frames are drawn at each card's real rendered size so the nib
        // width stays true (a stretched viewBox would fatten the stroke).
        // ~30% of pieces also get a strip of masking tape at the top edge,
        // like the reference boards. Visible only at napkin via CSS.
        var cards = document.querySelectorAll('.wf-card, .ds-card, .ds-kpi-card, .sfdc-card, .ds-sidebar-card, .pr-card, .pr-hero');
        // Cast this page's hands. Dashboards with several tiles always get
        // at least two authors (a lone hand made every module read same-pen
        // — stakeholder note 2026-06-12); sparse pages may be one person.
        // Authors always hold DIFFERENT pens, and the first is dominant,
        // drawing ~55% of the tiles.
        var ar = Math.random();
        var nAuthors = cards.length >= 5
          ? (ar < 0.55 ? 2 : 3)
          : (ar < 0.4 ? 1 : 2);
        var pageAuthors = [];
        for (var ai = 0; ai < nAuthors; ai++) {
          pageAuthors.push(makeAuthor(pageAuthors.map(function (a) { return a.pen; })));
        }
        for (var ki = 0; ki < cards.length; ki++) {
          var el = cards[ki];
          if (el.style.getPropertyValue('--wf-ink-frame')) continue;
          var cw = el.offsetWidth, ch = el.offsetHeight;
          if (cw < 40 || ch < 24) continue;   // hidden or degenerate — skip
          // If the card has a header, rule a title-bar line under it —
          // measured with RECTS, not offsetTop: offsetTop needs the card to
          // be the offsetParent, which is only true at napkin (cards get
          // position:relative under that gate), and frames are stamped at
          // whatever fidelity the page loaded in.
          var hd = el.querySelector('.ds-card-header, .ds-card-hd, .pr-card-hd, .wf-card-hd, .wf-card-header, .sfdc-card-hd, .sfdc-card-header');
          var hy = 0;
          if (hd) {
            var hr = hd.getBoundingClientRect(), cr = el.getBoundingClientRect();
            if (hr.height) hy = Math.round(hr.top - cr.top + hr.height);
          }
          var author = (nAuthors === 1 || Math.random() < 0.55)
            ? pageAuthors[0]
            : pageAuthors[1 + Math.floor(Math.random() * (nAuthors - 1))];
          el.style.setProperty('--wf-ink-frame', buildInkFrameSVG(cw, ch, hy, author));
          el.style.setProperty('--wf-cut-path', buildCutPath(cw, ch));
          if (Math.random() < 0.3) {
            var tape = document.createElement('span');
            tape.className = 'wf-tape-strip';
            tape.setAttribute('aria-hidden', 'true');
            tape.style.left = Math.round(15 + Math.random() * 55) + '%';
            tape.style.width = Math.round(46 + Math.random() * 38) + 'px';
            tape.style.transform = 'rotate(' + (Math.random() * 10 - 5).toFixed(1) + 'deg)';
            el.appendChild(tape);
          }
        }
        // Second pass: any opaque box that reaches a card corner paints
        // PAST the scissor cut — the chamfer eats up to ~9px inside the
        // layout box, but only the ::before paper is clipped, never the
        // content. Tag offenders (a class, not inline style, so toggling
        // fidelity restores them); wf-fidelity.css lifts their fills at
        // napkin only. Reads batched after all stamping writes above.
        var BLEED = 9; // corner chamfer 7px + edge waver 2.4px, rounded
        function bgAlpha(c) {
          var m = /rgba?\(([^)]+)\)/.exec(c || '');
          if (!m) return 0;
          var ch4 = m[1].split(',');
          return ch4.length === 4 ? parseFloat(ch4[3]) : 1;
        }
        for (var bi = 0; bi < cards.length; bi++) {
          var bc = cards[bi];
          if (!bc.style.getPropertyValue('--wf-cut-path')) continue;
          var br = bc.getBoundingClientRect();
          var zones = [
            [br.left, br.top], [br.right - BLEED, br.top],
            [br.left, br.bottom - BLEED], [br.right - BLEED, br.bottom - BLEED]
          ];
          var kids = bc.querySelectorAll('*');
          for (var di = 0; di < kids.length; di++) {
            var kid = kids[di];
            if (kid.classList.contains('wf-tape-strip') || kid.classList.contains('wf-cut-bleed')) continue;
            var dr = kid.getBoundingClientRect();
            if (!dr.width || !dr.height) continue;
            var hit = false;
            for (var zi = 0; zi < 4; zi++) {
              if (dr.left < zones[zi][0] + BLEED && dr.right > zones[zi][0] &&
                  dr.top < zones[zi][1] + BLEED && dr.bottom > zones[zi][1]) { hit = true; break; }
            }
            if (!hit) continue;
            var kcs = getComputedStyle(kid);
            if (bgAlpha(kcs.backgroundColor) > 0.05 || kcs.backgroundImage !== 'none') {
              kid.classList.add('wf-cut-bleed');
            }
          }
        }
      }

      function spawnNapkinStencils() {
        if (document.querySelector('.wf-stencil-layer')) return; // already built
        var texPath = wfTexturePath();

        // Stains live on the paper, not the glass — they scroll with the
        // page. Measure the body's LAYOUT box (offsetHeight), not its scroll
        // height: scrollHeight includes absolute overflow and unstyled late
        // chrome, and anything placed past the layout box paints over bare
        // canvas (the truncated-texture seam). Runs at window load so the
        // measurement is settled.
        var docH = Math.max(document.body.offsetHeight, window.innerHeight);

        var scribbles = [
          { cls: 'wf-stencil--scribble-1', file: 'scribble-1.svg', w: 130, h: 65 },
          { cls: 'wf-stencil--scribble-2', file: 'scribble-2.svg', w: 100, h: 85 },
          { cls: 'wf-stencil--scribble-3', file: 'scribble-3.svg', w: 115, h: 50 }
        ];
        var layer = document.createElement('div');
        layer.className = 'wf-stencil-layer';
        for (var si = 0; si < scribbles.length; si++) {
          if (Math.random() > 0.7) continue;
          var sc = scribbles[si];
          var img = document.createElement('img');
          img.className = 'wf-stencil ' + sc.cls;
          img.src = texPath + sc.file;
          img.alt = '';
          img.setAttribute('aria-hidden', 'true');
          var scale = 0.8 + Math.random() * 0.4;
          img.style.width = Math.round(sc.w * scale) + 'px';
          img.style.height = Math.round(sc.h * scale) + 'px';
          img.style.left = (-5 + Math.random() * 90) + '%';
          img.style.top = (5 + Math.random() * 80) + '%';
          img.style.transform = 'rotate(' + ((-8 + Math.random() * 16).toFixed(1)) + 'deg)';
          layer.appendChild(img);
        }
        // Stretch the layer to the document so the scribbles' % offsets
        // resolve against the whole page, not just the first viewport.
        layer.style.height = docH + 'px';
        document.body.appendChild(layer);

        // Coffee + tea stains: probabilistic, like a real desk where people
        // are hard at work on the paper prototype. ~30% of loads are clean;
        // the rest collect 1–5 marks (weighted toward 1–2), spread over the
        // full page. Rings and tea stains are generated fresh per spawn —
        // geometry, seeds, palette, breaks all vary; position, rotation and
        // saturation vary at placement below.
        if (Math.random() < 0.7) {
          // Whose desk is this today? Humans don't all drink coffee — pick
          // a beverage profile per page: a coffee drinker (all rings + the
          // odd spill), a tea drinker (all tea, brewing the SAME leaf all
          // day), or a shared desk with a genuine mix.
          var prof = Math.random();
          var pageLeaf = null;
          var STAINS;
          if (prof < 0.45) {            // coffee drinker
            STAINS = [
              { gen: 'ring',              weight: 8, spill: false },
              { file: 'coffee-spill.svg', weight: 1, spill: true }
            ];
          } else if (prof < 0.7) {      // tea drinker — one pot, one leaf
            pageLeaf = TEA_PALETTE[Math.floor(Math.random() * TEA_PALETTE.length)];
            STAINS = [{ gen: 'tea', weight: 1, spill: false }];
          } else {                      // shared desk — the real mix
            STAINS = [
              { gen: 'ring',              weight: 5, spill: false },
              { gen: 'tea',               weight: 4, spill: false },
              { file: 'coffee-spill.svg', weight: 1, spill: true }
            ];
          }
          var stainPool = [];
          STAINS.forEach(function (s) { for (var wi = 0; wi < s.weight; wi++) stainPool.push(s); });

          // 1..5, weighted toward a couple of marks; very long pages nudge up
          var cr = Math.random();
          var count = cr < 0.32 ? 1 : cr < 0.59 ? 2 : cr < 0.79 ? 3 : cr < 0.92 ? 4 : 5;
          if (docH > 3200 && count < 5 && Math.random() < 0.4) count++;
          for (var ci = 0; ci < count; ci++) {
            var stain = stainPool[Math.floor(Math.random() * stainPool.length)];
            var ring = document.createElement('img');
            ring.className = 'wf-coffee-ring';
            ring.src = stain.gen === 'tea' ? buildTeaStainSVG(pageLeaf)
                     : stain.gen === 'ring' ? buildCoffeeRingSVG()
                     : texPath + stain.file;
            ring.alt = '';
            ring.setAttribute('aria-hidden', 'true');
            ring.setAttribute('decoding', 'async');   // never block the main thread
            var big = stain.spill || stain.gen === 'tea';
            // Sizes locked from the scale lab (notes/stain-scale-lab.html,
            // stakeholder pick 2026-06-12): rings 200-225% of the 245px
            // base, tea 175-200% of the 330px base. Spill unchanged.
            var size = stain.gen === 'ring'
              ? Math.round(490 + Math.random() * 61)
              : stain.gen === 'tea'
                ? Math.round(577 + Math.random() * 83)
                : Math.round(250 + Math.random() * 160);
            ring.style.width = size + 'px';
            ring.style.height = size + 'px';
            ring.style.transform = 'rotate(' + Math.floor(Math.random() * 360) + 'deg)';
            // Strength tiers — like a real desk: most marks are faded ghosts
            // or medium stamps, but spills (and the odd ring) read dark and
            // fresh. The texture itself is light tan, so the dark tier also
            // deepens the pigment via brightness/saturate; ghosts get a
            // touch of blur so even their edges fade.
            var roll = Math.random();
            var strength;
            if (stain.spill || roll < 0.22) {
              strength = 0.45 + Math.random() * 0.18;
              ring.style.filter = 'brightness(0.82) saturate(1.35)';
            } else if (roll < 0.55) {
              strength = 0.10 + Math.random() * 0.10;
              ring.style.filter = 'blur(' + (0.6 + Math.random() * 0.8).toFixed(1) + 'px)';
            } else {
              strength = 0.22 + Math.random() * 0.14;
            }
            ring.style.opacity = strength.toFixed(2);
            // Horizontal: clamped so the right edge stays inside the body —
            // stains are position:absolute (they scroll with the page), so a
            // right overhang would grow the scroll area past the painted
            // background. Left bleed is fine: negative offsets clip, they
            // don't scroll.
            var bodyW = document.body.clientWidth || window.innerWidth;
            ring.style.left = Math.min(
              Math.round((-0.10 + Math.random() * 0.95) * bodyW),
              Math.max(0, bodyW - size)) + 'px';
            // px against full document height — % would resolve against the
            // viewport-sized containing block, bunching every ring up top.
            // Clamped fully INSIDE the document: a stain poking past the
            // content used to extend the scroll area beyond body's painted
            // background, where the napkin overlays blend against
            // transparency and show as a raw gray band.
            ring.style.top = Math.round(Math.random() * Math.max(0, docH - size)) + 'px';
            document.body.appendChild(ring);
          }
        }
      }

  // ════════════════════════════ lifecycle / flash fix ════════════════════════════
  function isNapkin(){ return document.documentElement.getAttribute('data-wf-fidelity') === 'napkin'; }
  function stampFrames(){ if (isNapkin()) stampInkFrames(); }
  function spawnStains(){
    if (isNapkin()) {
      spawnNapkinStencils();
    }
    document.documentElement.classList.add('wf-napkin-ready');
  }
  // Public: re-run both passes (used by the live fidelity toggle). Idempotent —
  // spawnNapkinStencils self-guards on .wf-stencil-layer, stampInkFrames skips
  // cards that already carry --wf-ink-frame.
  function spawnDoodles(){
    if (isNapkin() && window.WFDoodles && WFDoodles.scatterDoodles) { try { WFDoodles.scatterDoodles(); } catch (e) {} }
  }
  function runAssetsPass(){ stampFrames(); spawnStains(); spawnDoodles(); }

  var _scheduled = false;
  function schedule(){
    if (_scheduled) return; _scheduled = true;
    // FLASH-2 fix: ink frames stamp EARLY (cards exist at DOMContentLoaded) so the
    // cut-paper look is present at first paint instead of popping in 2-5s later on
    // window 'load'. Stains + doodles still wait for 'load' because they need the
    // settled full-page height (an early spawn places marks past the painted body
    // → bare-canvas seam). Both passes are gated on napkin and idempotent.
    function early(){ if (isNapkin()) requestAnimationFrame(stampFrames); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', early);
    else early();
    if (document.readyState === 'complete') runAssetsPass();
    else window.addEventListener('load', runAssetsPass);
  }

  function init(opts){
    opts = opts || {};
    if (opts.texPath) _texOverride = opts.texPath;
    if (window.WFNapkin._inited) return;
    window.WFNapkin._inited = true;
    paperTile();          // cheap; sets --wf-paper-tex; harmless at any fidelity
    schedule();
  }

  window.WFNapkin = {
    _inited: false,
    PENS_INK: PENS_INK, TEA_PALETTE: TEA_PALETTE, makeAuthor: makeAuthor,
    buildInkFrameSVG: buildInkFrameSVG, buildCutPath: buildCutPath,
    buildCoffeeRingSVG: buildCoffeeRingSVG, buildTeaStainSVG: buildTeaStainSVG,
    paperTile: paperTile, stampInkFrames: stampInkFrames, spawnNapkinStencils: spawnNapkinStencils,
    gesture: gesture, wrap: wrap, ink: ink, dot: dot, plen: plen,
    rnd: rnd, ri: ri, r1: r1, pick: pick, TAU: TAU, uid: function(){ return _uid++; },
    wfTexturePath: wfTexturePath, init: init, runAssetsPass: runAssetsPass
  };
  // Back-compat: notes/stain-scale-lab.html reads window.wfStainLab.ring/tea.
  window.wfStainLab = { ring: buildCoffeeRingSVG, tea: buildTeaStainSVG };
})();
