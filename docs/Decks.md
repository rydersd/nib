**Tags:** `authoring` · `deck` · `slides` · `presentation`

# Decks

A scroll-snap slide engine for review decks, briefings, and any narrative
presentation built as a single HTML file. Decks are keyboard-navigable,
export each slide to a standalone SVG, and carry their own warm-editorial
palette so they read as a presentation surface, not a wireframe.

> **Agent reference:** [`ref/decks.md`](../ref/decks.md) — the slim spec to read before generating a deck.

## When to use a deck

A deck is the right surface for a check-in, a design review, or a leadership
briefing — narrative content that is *read in sequence*. For interactive
prototypes use [[Page-Blueprint]] or [[Page-Compose]]; for a swimlane diagram
use [[Service-Blueprint]].

## The slide model

One deck is one HTML file. Inside `<main class="slides">`, each slide is a
`<section class="slide">`:

```html
<main class="slides">
  <section class="slide cover" id="s1" data-title="Cover"> ... </section>
  <section class="slide" id="s2" data-title="The arc"> ... </section>
  <section class="slide closing" id="s3" data-title="Closing"> ... </section>
</main>
```

`proto-deck.js` does the rest at load:

- Auto-assigns an `id` (`s1`, `s2`, …) to any slide missing one.
- Assigns a sequential `data-num` to every content slide.
- Injects the `.slide-header` chrome (number chip + title) and the big
  `.slide-numwatermark` into every content slide — so the per-deck HTML stays
  slim. Cover and closing slides are left bare.
- Builds the side-rail dot navigation from each slide's `id` + `data-title`.
- Tracks the active slide with an `IntersectionObserver`.

### Slide conventions

| Attribute / class | Meaning |
|---|---|
| `class="slide"` | A content slide — gets injected header + watermark |
| `class="slide cover"` | The opening slide — no chrome injected |
| `class="slide closing"` | The final slide — no chrome injected |
| `data-title="…"` | Slide title; shows in the header and the dot-nav tooltip |
| `data-num="03"` | Optional explicit section number; auto-assigned if omitted |
| `id="…"` | Optional; auto-assigned `s1`, `s2`, … if omitted |

If a slide already contains a `.slide-header`, the engine leaves it alone — you
can hand-author chrome on any slide.

## Content-block classes

The deck stylesheet ships a small set of editorial content blocks. Put them
inside `.slide-body` (use `.slide-body.single` for a one-column slide, or the
default two-column grid for text-left / content-right).

| Block | Use |
|---|---|
| `.slide-text` | The text column — `h2`, `p`, `p.lede`. `.accent` spans tint a word. |
| `.stats` → `.stat` | A row of big-number metrics (`.num`, `.l`; `<sup>` qualifier) |
| `.inputs` → `.input-card` | A grid of context cards (`.who`, `h4`, `p`). Add `unresolved` for an "unresolved" badge. |
| `.asks` → `.ask` | Scoped requests (`.ask-eye`, `h4`, `p`, `.ask-meta`) |
| `.stuck-grid` → `.stuck` | Blockers — gold-topped cards |
| `.pi-stack` → `.pi-line` | A timeline (`.pi-when` + `.pi-what`). Add `.pi-grid` for two columns. |
| `.screens` → `.screen` | Iframe thumbnails of prototype pages (`.one` / `.three` variants) |
| `.ai-block` | A dark feature panel; `.ai-refs` holds reference cards inside it |
| `.dia-wrap` → `.dia-frame` | A framed schematic — pair with a content slide to show its anatomy |
| `.closing-block` | The closing slide's centered block (`.ornament`, `h2`, `p`, `.back-btn`) |
| `.cover-stamp`, `.cover-meta`, `.cover-mark` | Cover-slide furniture |

## Fluid vs fixed-canvas

The deck has two layout modes. Pick one per deck.

### Fluid scroll-deck — `<main class="slides">`

Each slide sizes to the viewport and scroll-snaps. Content reflows at
narrow widths and short heights. This is the default; use it for decks read
on a laptop where reflow is fine. Starter: `starters/deck.html`.

### Fixed-canvas — `<main class="slides slides--fit">`

Each slide's content is wrapped in `<div class="slide-stage">` — a fixed
1600×900 canvas scaled uniformly to fill the viewport. The composition is
*identical at every resolution*: a 1440 laptop and a 4K monitor render the
same layout, just larger or smaller. `proto-deck.js` computes the scale.

Use fixed-canvas when the deck must look pixel-consistent — projector,
exported SVG, screenshots. Starter: `starters/deck-fit.html`.

```html
<main class="slides slides--fit">
  <section class="slide" id="s2" data-title="The setup">
    <div class="slide-stage">
      <div class="slide-body single"> ... </div>
    </div>
  </section>
</main>
```

## Keyboard map

| Key | Action |
|---|---|
| `↓` · `Page Down` · `Space` | Next slide |
| `↑` · `Page Up` · `Shift+Space` | Previous slide |
| `Home` | First slide |
| `End` | Last slide |
| `E` | Export the current slide as a standalone `.svg` |

Keys are ignored while typing in an `input` or `textarea`.

## SVG export

Press `E` or click the floating **Export SVG** button to download the current
slide as a self-contained `.svg`. The engine clones the slide, inlines every
`<style>` block and fetched stylesheet (resolving relative `url()` references
so fonts still load), and replaces iframes with placeholder cards (a
`foreignObject` cannot embed cross-origin iframes). The result opens
standalone in any SVG viewer.

## Configuring the home link

By default the injected slide header shows `Section N of M` with no link. To
add an "All slides →" link back to a deck index, set one of:

```html
<main class="slides" data-deck-home="index.html"> ... </main>
```

```html
<script>window.WIREFRAME_CONFIG = { deckHome: 'index.html' };</script>
```

`data-deck-home` wins over `WIREFRAME_CONFIG.deckHome`. If neither is set the
link is omitted entirely.

## Script load order

A deck needs only the two deck files plus the Google Fonts link:

```html
<link href="https://fonts.googleapis.com/css2?family=Newsreader:wght@400;500;600;700&family=Hanken+Grotesk:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="core/proto-deck.css">
...
<script src="core/proto-deck.js"></script>
```

The Nib [[Context-Bar]] is optional. To add the breadcrumb chrome, include
`project-data.js` then `core/proto-nav.js` — `proto-deck.css` restyles the
`.wf-ctx-bar` to a frosted white that suits the warm paper. The deck works
fully standalone with no context bar.

## The `--deck-*` palette

Decks do **not** use Nib's `--wf-*` tokens. They carry their own warm-editorial
palette under `--deck-*` custom properties (`--deck-paper`, `--deck-ink`,
`--deck-accent`, `--deck-gold`, `--deck-bar-h`, …). This is deliberate — a deck
is a presentation surface and the warm palette is part of its identity. The
`--deck-*` prefix guarantees it can never collide with `--wf-*`.

## Related

- [[Templates]] — `examples/design-review/` is the worked-example deck
- [[Page-Compose]] — for interactive prototype pages, not narrative decks
- [[Service-Blueprint]] — for swimlane diagrams
- [[Context-Bar]] — the optional breadcrumb chrome a deck can opt into
