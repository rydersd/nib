# Fidelity Levels

**Tags:** `reference` · `aesthetic` · `fidelity`

Nib's three-mode fidelity slider. Each mode communicates a different level of design certainty — see [[Philosophy#fidelity-as-communication|Philosophy: Fidelity as Communication]].

## The three modes

| Mode | Meaning | Visual |
|---|---|---|
| **Napkin** | "Here's a rough idea. Everything is negotiable." | White paper, hand-drawn sharpie ink frames, scissor-cut cards, grayscale only, stains + doodles in the margins |
| **Blueprint** | "The structure is taking shape. Let's refine." | Default — the drafting table: blue-grey ink on blue-tinted paper, subtle grid, **no color** (semantic hues collapse to the one drafting ink) |
| **Polished** | "We're confident in this direction." | Clean lines, neutral-gray palette, vivid accent, minimal wireframe artifacts |

## How it works

The fidelity slider lives in the context bar at the top of every page. Selecting a mode updates CSS variables that control:

- `--wf-wobble-radius` — how imperfect borders look
- `--wf-wobble-filter` — SVG displacement filter applied to lines
- `--wf-grain-opacity` — paper texture overlay intensity
- `--wf-grid-opacity` — background grid visibility

See [[Design-Tokens#paper-effects|Design Tokens: Paper Effects]] for the full list.

## Persistence

The slider state persists in `sessionStorage` across page navigations (and mirrors to `localStorage` so `core/wf-fidelity-boot.js` can restore it **before first paint** on later visits — no fidelity flash). Starters load the boot script as the first element in `<head>`.

## Never hardcode fidelity values

Because the slider drives CSS variables, **never hardcode** `--wf-wobble-radius`, `--wf-grain-opacity`, or `--wf-grid-opacity`. Always use `var(--wf-*)` so your element responds to the slider.

## Blueprint mode: the drafting table

Blueprint (the default) retints the whole palette to blue-grey drafting ink on blue-tinted paper — including the semantic status colors, which collapse to value shifts of the same ink. Nothing on a blueprint may read as final art: the tier is still arguing placement and content, so labels and patterns carry status, not color. See the [[Design-Tokens#fidelity-overrides|full override table]] in Design Tokens.

## Napkin mode: the paper prototype

Napkin is the most dramatic transformation — a B&W paper prototype:

- **Tokens** shift to grayscale on white paper, and a saturation overlay desaturates everything below the framework chrome.
- **The napkin engine** (`core/wf-napkin.js` + `core/wf-doodles.js`, lazy-loaded by `proto-nav.js` — no page changes needed) stamps each card with a generated tapering **sharpie ink frame** and a **scissor-cut silhouette** (`--wf-ink-frame` / `--wf-cut-path`), stamps masking-tape strips on ~30% of pieces, and generates coffee-ring / tea-bag **stains**, scribbles, and a 24-mark **doodle** vocabulary.
- **Placement policy:** stains and doodles never sit under the content column. They live in the **left/right side gutters** (measured from the real content bounds, clipped at the page edges) and in the **doodle strip at the bottom of the nav drawer**. The marks make the screen a discussion piece without competing with the content.

---

## Related

- [[Philosophy]] — why fidelity is about communication, not just aesthetics
- [[Confidence-Levels]] — per-element certainty, complementary to page-level fidelity
- [[Design-Tokens]] — tokens that shift across modes
- [[Paper-Utilities]] — paper effects that respond to fidelity
