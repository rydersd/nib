# Deck Reference

> A scroll-snap slide engine for review decks and briefings. One deck = one HTML file.
> Read this before generating a deck.

## When to Use a Deck

| Use Case | Format |
|----------|--------|
| Design review, check-in, leadership briefing — read in sequence | **Deck** |
| Interactive prototype page | `page-blueprint.md` / `page-compose.md` |
| Swimlane service diagram | `service-blueprint.md` |

## Files

- `core/proto-deck.css` — slide engine + warm-paper `--deck-*` palette
- `core/proto-deck.js` — chrome injection, dot nav, keyboard nav, SVG export
- `starters/deck.html` — fluid scroll-deck skeleton
- `starters/deck-fit.html` — fixed-canvas skeleton
- `examples/design-review/` — worked-example deck

## Boilerplate

```html
<!DOCTYPE html>
<html lang="en" class="deck" data-role="deck">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Deck Title — Project</title>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:wght@400;500;600;700&family=Hanken+Grotesk:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="core/proto-deck.css">
</head>
<body>
<nav class="slidenav" aria-label="Slides"></nav>
<div class="kbd-hint">Use <kbd>↓</kbd> <kbd>↑</kbd> or <kbd>Space</kbd></div>
<main class="slides">
  <section class="slide cover" id="s1" data-title="Cover"> ... </section>
  <section class="slide" id="s2" data-title="The arc"> ... </section>
  <section class="slide closing" id="s3" data-title="Closing"> ... </section>
</main>
<script src="core/proto-deck.js"></script>
</body>
</html>
```

`core/proto-deck.js` and `core/proto-deck.css` are the only required assets.
The Google Fonts link supplies Newsreader / Hanken Grotesk / JetBrains Mono.

## The Slide Model

Each slide is `<section class="slide">` inside `<main class="slides">`.
`proto-deck.js` auto-injects, per content slide:

- a sequential `data-num` and an `id` (`s1`, `s2`, …) if missing
- the `.slide-header` chrome (number chip + title) and `.slide-numwatermark`
- a side-rail dot in `.slidenav`

| Class / attribute | Meaning |
|---|---|
| `slide` | Content slide — chrome injected |
| `slide cover` | First slide — no chrome |
| `slide closing` | Last slide — no chrome |
| `data-title` | Title (header + dot tooltip) |
| `data-num` | Explicit section number; auto-assigned if omitted |

A slide that already contains a `.slide-header` is left untouched.

## Layout Modes

| Mode | `<main>` class | Slide wrapping | Use |
|---|---|---|---|
| Fluid | `slides` | content direct in `.slide` | laptop reading; reflows |
| Fixed-canvas | `slides slides--fit` | content in `<div class="slide-stage">` | pixel-consistent; projector, SVG |

In fixed-canvas mode every stage is a fixed 1600×900 canvas scaled uniformly
to the viewport.

## Body Layout

Put content in `.slide-body` (default = two-column text-left grid;
`.slide-body.single` = one column).

```html
<div class="slide-body single">
  <div class="slide-text">
    <h2>Headline with an <span class="accent">accent word.</span></h2>
    <p class="lede">The lede paragraph.</p>
  </div>
</div>
```

## Content Blocks

| Block (container → item) | Use |
|---|---|
| `.stats` → `.stat` (`.num`, `.l`) | Big-number metrics |
| `.inputs` → `.input-card` (`.who`, `h4`, `p`) | Context cards; `unresolved` adds a badge |
| `.asks` → `.ask` (`.ask-eye`, `h4`, `p`, `.ask-meta`) | Scoped requests |
| `.stuck-grid` → `.stuck` | Blockers |
| `.pi-stack` → `.pi-line` (`.pi-when`, `.pi-what`) | Timeline; add `.pi-grid` for 2 columns |
| `.screens` → `.screen` | Iframe page thumbnails; `.one` / `.three` variants |
| `.ai-block` (`.ai-refs` inside) | Dark feature panel |
| `.dia-wrap` → `.dia-frame` | Framed SVG schematic |
| `.closing-block` | Closing slide block (`.ornament`, `h2`, `p`) |

## Keyboard Map

| Key | Action |
|---|---|
| `↓` / `Page Down` / `Space` | Next |
| `↑` / `Page Up` / `Shift+Space` | Previous |
| `Home` / `End` | First / last |
| `E` | Export current slide as SVG |

## SVG Export

`E` or the floating **Export SVG** button downloads the current slide as a
self-contained `.svg` — styles inlined, iframes swapped for placeholder cards.

## Home Link (optional)

To add an "All slides →" link to every injected header, set
`data-deck-home="index.html"` on `<main class="slides">`, or
`window.WIREFRAME_CONFIG = { deckHome: 'index.html' }`. Omit both and no link
is shown.

## Context Bar (optional)

The deck runs standalone. To add Nib's breadcrumb, include `project-data.js`
then `core/proto-nav.js` after `proto-deck.js`; `proto-deck.css` restyles the
`.wf-ctx-bar` for the warm palette.

## Rules

- Decks use the `--deck-*` palette, **not** Nib's `--wf-*` tokens — never mix them.
- One layout mode per deck (fluid OR `slides--fit`).
- Cover + closing slides stay bare; let the engine inject chrome on content slides.
- No auth/gate scripts — decks ship without an auth shim.
