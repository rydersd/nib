# Design Tokens

**Tags:** `reference` · `design-system` · `tokens` · `colors`

The color palette, typography, and spacing system. Never hardcode hex values.

> **Rule:** Always use `var(--wf-token-name)` instead of hex values. Tokens automatically adapt across [[Fidelity-Levels|fidelity modes]].

For the agent-facing token reference, see [`ref/tokens.md`](../ref/tokens.md).

## Core palette (base / Polished)

The base `:root` palette is neutral gray with one vivid accent — this is what [[Fidelity-Levels|Polished mode]] renders. Blueprint and Napkin override it (see the fidelity table below).

| Token | Swatch | Default | Use |
|---|---|---|---|
| `--wf-ink` | <span style="display:inline-block;width:20px;height:20px;background:#15110d;border:1px solid #999;vertical-align:middle;"></span> | `#15110d` | Headings, borders, primary text emphasis |
| `--wf-text` | <span style="display:inline-block;width:20px;height:20px;background:#4a4c4e;border:1px solid #999;vertical-align:middle;"></span> | `#4a4c4e` | Body text, default content |
| `--wf-muted` | <span style="display:inline-block;width:20px;height:20px;background:#646567;border:1px solid #999;vertical-align:middle;"></span> | `#646567` | Secondary text, labels, captions |
| `--wf-line` | <span style="display:inline-block;width:20px;height:20px;background:#c4c5c7;border:1px solid #999;vertical-align:middle;"></span> | `#c4c5c7` | Borders, dividers, separator lines |
| `--wf-tint` | <span style="display:inline-block;width:20px;height:20px;background:#e4e4e6;border:1px solid #999;vertical-align:middle;"></span> | `#e4e4e6` | Subtle fills, hover backgrounds |
| `--wf-surface` | <span style="display:inline-block;width:20px;height:20px;background:#eeeeef;border:1px solid #999;vertical-align:middle;"></span> | `#eeeeef` | Card backgrounds, panel fills |
| `--wf-canvas` | <span style="display:inline-block;width:20px;height:20px;background:#f3f3f4;border:1px solid #999;vertical-align:middle;"></span> | `#f3f3f4` | Page background |
| `--wf-accent` | <span style="display:inline-block;width:20px;height:20px;background:#2c6af2;border:1px solid #999;vertical-align:middle;"></span> | `#2c6af2` | **The ONE blue** — links, primary actions, active states |

## Semantic colors (base / Polished)

| Token | Swatch | Default | Use |
|---|---|---|---|
| `--wf-red` | <span style="display:inline-block;width:20px;height:20px;background:#8b4553;border:1px solid #999;vertical-align:middle;"></span> | `#8b4553` | Errors, overdue, danger actions |
| `--wf-amber` | <span style="display:inline-block;width:20px;height:20px;background:#6b5a2f;border:1px solid #999;vertical-align:middle;"></span> | `#6b5a2f` | Warnings, pending states |
| `--wf-green` | <span style="display:inline-block;width:20px;height:20px;background:#45785a;border:1px solid #999;vertical-align:middle;"></span> | `#45785a` | Success, confirmed, positive |
| `--wf-purple` | <span style="display:inline-block;width:20px;height:20px;background:#6b5b8a;border:1px solid #999;vertical-align:middle;"></span> | `#6b5b8a` | AI features, suggestions |

At Blueprint fidelity the semantic hues collapse to value shifts of the drafting ink (`--wf-red #3a4f73`, `--wf-amber #62759a`, `--wf-green #4c6288`, `--wf-purple #55688e`) — a blueprint has one ink, so status is carried by labels and patterns, not color. At Napkin everything is desaturated by the grayscale overlay.

## Paper effects

| Token | Use |
|---|---|
| `--wf-paper-shadow` | Multi-layer shadow for paper depth. Applied to cards. See [[Paper-Utilities]]. |
| `--wf-tape-color` | Tape strip fill — `rgba(220, 228, 200, 0.55)` |
| `--wf-pin-color` | Pushpin dot — `#c0392b` |
| `--wf-wobble-radius` | Imperfect border-radius. Varies by fidelity. |
| `--wf-wobble-filter` | SVG displacement filter. Napkin: `none`. Blueprint: `url(#wf-line-wobble)`. |
| `--wf-grain-opacity` | Paper texture overlay opacity. |
| `--wf-grid-opacity` | Background grid line opacity. |

## Fidelity overrides

Each [[Fidelity-Levels|fidelity mode]] retints the palette to match its message. Blueprint is the **drafting table** — blue-grey ink on blue-tinted paper, no color, still arguing placement and content. Napkin is a **B&W paper prototype** — grayscale on white paper.

| Token | Blueprint (drafting) | Napkin (paper) | Polished (base) |
|---|---|---|---|
| `--wf-canvas` | `#f0f4fa` | `#ffffff` | `#f3f3f4` |
| `--wf-ink` | `#1e2a3a` | `#1a1a1a` | `#15110d` |
| `--wf-text` | `#3b4f68` | `#2a2a2a` | `#4a4c4e` |
| `--wf-muted` | `#4a5f7f` | `#888888` | `#646567` |
| `--wf-line` | `#b0bdd0` | `#aaaaaa` | `#c4c5c7` |
| `--wf-surface` | `#edf1f7` | `#f8f8f8` | `#eeeeef` |
| `--wf-accent` | `#3d6daa` | `#1a1a1a` | `#2c6af2` |
| `--wf-font` | `'Figtree', …` | `'Figtree', …` | `'Inter', …` (base stack) |
| `--wf-wobble-filter` | `url(#wf-line-wobble)` | `none` (ink frames carry the line) | `none` |

Figtree (Google Fonts) is loaded by `core/proto-tokens.css` itself via `@import` — no page-level `<link>` needed; offline pages fall back through the system stack. The working tiers (Blueprint + Napkin) render in Figtree; Polished uses the base font.

---

## Related

- [[Components]] — Components built from these tokens ([live demo](components.html))
- [[Paper-Utilities]] — Paper effect classes that use the paper tokens
- [[Fidelity-Levels]] — How tokens shift across Napkin / Blueprint / Polished modes
- [`ref/tokens.md`](../ref/tokens.md) — Agent-facing token reference
- [`ref/design-system-theme.md`](../ref/design-system-theme.md) — Multi-system theming (overriding tokens per brand)
