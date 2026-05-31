# Surface: Design Review Deck

> Read when building an editorial **presentation deck** (design reviews, position papers, briefings) as a wireframe page. Requires `surfaces/deck.css` + `core/proto-deck.js`. **Self-contained** — this surface owns its own tokens and does NOT load `proto-core.css` / `proto-tokens.css` (the one surface exception; it is an editorial artifact, not a portal screen).

One review = one HTML file. Each slide is a `<section class="slide">`; the deck renders as a vertically-scrolling, scroll-snapped slideshow with arrow-key navigation, a side-rail dot nav, per-slide SVG export, and whole-deck PowerPoint (`.pptx`) export.

## Two layout modes

| Mode | `<main>` class | Behavior | Use |
|---|---|---|---|
| **Fixed-canvas** (preferred) | `class="slides slides--fit"` | Every slide is a fixed **1600×900** stage scaled uniformly to fill any viewport at constant ratio. Always centered, always one screen, fully responsive. 16:9 = native PowerPoint frame. | **Default for all new decks.** |
| Flow (legacy) | `class="slides"` | `min-height` slides, `justify-content: center`. Top-aligns short content, clips tall content. | Avoid — migrate to fixed-canvas. |

**Always use fixed-canvas.** The flow mode exists only for backward compatibility.

## Page structure (fixed-canvas)

```html
<html class="wireframe">
<head>
  <link rel="stylesheet" href="../nib/surfaces/deck.css">
</head>
<body>
  <main class="slides slides--fit">

    <!-- Cover -->
    <section class="slide cover" id="s1" data-title="Cover">
      <div class="slide-stage">
        <div class="cover-stamp">…</div>
        <h1>…</h1>
        <p class="cover-deck">…</p>
      </div>
    </section>

    <!-- Content slide -->
    <section class="slide" id="s2" data-title="The premise">
      <div class="slide-stage">
        <div class="slide-body single">
          <div class="slide-text">
            <h2>Headline. <span class="accent">Emphasis.</span></h2>
            <p class="lede">…</p>
          </div>
          <div class="inputs">…</div>
        </div>
      </div>
    </section>

    <!-- Closing -->
    <section class="slide closing" id="sN" data-title="Close">
      <div class="slide-stage">
        <div class="closing-block">…</div>
      </div>
    </section>

  </main>
  <nav class="slidenav"></nav>
  <script src="../nib/core/proto-deck.js"></script>
</body>
</html>
```

**The one structural rule:** every `<section class="slide">` wraps a single `<div class="slide-stage">`, and all slide content lives inside that stage. `proto-deck.js` auto-injects the slide-number chip, title, watermark, and dot-nav **into** the stage — do not author those by hand. `data-title` feeds the header + dot tooltip; `data-num` is optional (auto-assigned).

## The 1600×900 fit constraint

The stage is a **fixed 1600×900** box: padding `52px 80px` leaves ≈ **1440 wide × 796 tall** of usable space. The header overlays the top **absolutely**, so it does not consume body height. **There is no internal scroll** — content taller than 796px is clipped. Author each slide to fit:

- Type is **pinned to px** in `.slides--fit` (never `vw`/`vh`/`clamp` — those would double-scale inside the transform). Lean on the existing overrides; don't fight them.
- Give tall inline `<svg>` / `<iframe>` an explicit height that clears the header (≈ ≤ 700px) and fits ≈ 1440px wide.
- If a slide is over-full, split it rather than shrink past legibility.

## Navigation & export (from `proto-deck.js`)

| Action | Key | UI |
|---|---|---|
| Next / prev slide | ↓ ↑ · PgDn PgUp · Space | side-rail dots |
| First / last | Home / End | — |
| Export current slide → `.svg` | `E` | "SVG" button (dock, bottom-right) |
| Export whole deck → `.pptx` | `A` | "Export PPTX" button (dock, bottom-right) |

**PowerPoint export** rasterizes each `.slide-stage` to a full-bleed image (via `html2canvas`, using the live same-origin DOM + loaded webfonts — avoids the `@font-face`/canvas-taint problems of SVG rasterization) and assembles a real `.pptx` (via `PptxGenJS`) at 13.333×7.5in (16:9). Both libs **lazy-load on first use** from `vendor/html2canvas.min.js` + `vendor/pptxgenjs.min.js` (paths resolved relative to `proto-deck.js`, so decks at any folder depth work), so normal page loads never pay the ~700KB cost.

## Class reference

| Class | Purpose |
|---|---|
| `main.slides.slides--fit` | Deck container in fixed-canvas mode |
| `section.slide` | One slide (add `.cover` / `.closing` for those) |
| `div.slide-stage` | The fixed 1600×900 canvas — **required child of every slide** |
| `div.slide-body` (`.single`) | 2-col body grid (`.single` = one column) |
| `div.slide-text` | Left/primary text column — `h2`, `p`, `p.lede`, `span.accent` |
| `div.inputs` / `div.input-card` | Card grid + card |
| `div.stat` / `.num` / `.l` | Big-number stat block |
| `div.cover-stamp` / `h1` / `.cover-deck` | Cover slide parts |
| `div.closing-block` | Closing slide content |
| `nav.slidenav` | Empty element; dots are auto-built |

## Rules

- Every deck uses `class="slides slides--fit"` and wraps each slide in `.slide-stage`. No exceptions.
- Never hand-author `.slide-header` / `.slide-numwatermark` — `proto-deck.js` injects them into the stage.
- Keep each slide within 1440×796; there is no scroll inside a stage.
- This surface is **self-contained** — do not also load `proto-core.css` (its tokens are independent and would collide).
- Verify after authoring: count of `.slide-stage` must equal count of `section.slide`.
