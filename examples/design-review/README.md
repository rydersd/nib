# Design Review Deck — Nib Example

A worked example of the Nib deck engine: a weekly design-review deck for a
fictional product, **Beacon Analytics**. Single HTML file, scroll-snap slides,
keyboard navigable, SVG-exportable. All people, companies, and links are
placeholders — drop in your own content.

## Run

```sh
# Serve over HTTP (the Google Fonts link and SVG export work best over http://)
python3 -m http.server 8000
# then open http://localhost:8000/examples/design-review/index.html
```

`file://` works too, but serving over HTTP keeps font loading and the SVG
export's stylesheet fetch reliable.

## What it demonstrates

- **The slide model** — one `<section class="slide">` per slide inside
  `<main class="slides">`. The cover (`.cover`) and closing (`.closing`)
  slides are bare; every content slide gets its header chrome and section
  watermark injected by `proto-deck.js` from `data-num` + `data-title`.
- **Content-block components** — `.stats`, `.input-card` (with the
  `unresolved` flag), `.ask`, `.stuck`, `.pi-line`, `.screen` thumbnails.
- **Fluid scroll-deck mode** — `<main class="slides">` with no `.slides--fit`.
  Slides size to the viewport and scroll-snap. For the fixed-canvas variant,
  see `starters/deck-fit.html`.
- **Keyboard navigation** — arrows / space / Page Up-Down / Home / End move
  between slides; `E` exports the current slide as a standalone `.svg`.
- **Side-rail dot nav** — the `<nav class="slidenav">` is populated from the
  slides; the active dot follows the slide in view.

## How this example was sanitized from a real deck

This deck was ported from an internal design-review deck and scrubbed:

- Every company, product, and person name was replaced with a fictional
  product (Beacon Analytics) and generic roles ("Design Lead", "the data team").
- All `iframe` thumbnail `src` values point at `about:blank` and `<a>` targets
  at `#` — wire them to your own prototype pages.
- The auth/gate script that the source deck carried in `<head>` was removed
  entirely. Decks ship with no auth shim.

## Files

```
examples/design-review/
└── index.html        # The deck — links core/proto-deck.css + core/proto-deck.js
```

The engine lives in `core/`:

- `core/proto-deck.css` — slide engine + warm-paper `--deck-*` palette
- `core/proto-deck.js` — chrome injection, dot nav, keyboard nav, SVG export

## Related

- `starters/deck.html` — blank fluid scroll-deck skeleton
- `starters/deck-fit.html` — blank fixed-canvas (`.slides--fit`) skeleton
- `docs/Decks.md` — full deck documentation
- `ref/decks.md` — agent-facing deck reference
