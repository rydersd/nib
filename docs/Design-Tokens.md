# Design Tokens

**Tags:** `reference` · `design-system` · `tokens` · `colors`

The color palette, typography, and spacing system. Never hardcode hex values.

> **Rule:** Always use `var(--wf-token-name)` instead of hex values. Tokens automatically adapt across [[Fidelity-Levels|fidelity modes]].

For the agent-facing token reference, see [`ref/tokens.md`](../ref/tokens.md).

## Core palette

| Token | Swatch | Default | Use |
|---|---|---|---|
| `--wf-ink` | <span style="display:inline-block;width:20px;height:20px;background:#1e2a3a;border:1px solid #999;vertical-align:middle;"></span> | `#1e2a3a` | Headings, borders, primary text emphasis |
| `--wf-text` | <span style="display:inline-block;width:20px;height:20px;background:#3b4f68;border:1px solid #999;vertical-align:middle;"></span> | `#3b4f68` | Body text, default content |
| `--wf-muted` | <span style="display:inline-block;width:20px;height:20px;background:#4a5f7f;border:1px solid #999;vertical-align:middle;"></span> | `#4a5f7f` | Secondary text, labels, captions |
| `--wf-line` | <span style="display:inline-block;width:20px;height:20px;background:#b0bdd0;border:1px solid #999;vertical-align:middle;"></span> | `#b0bdd0` | Borders, dividers, separator lines |
| `--wf-tint` | <span style="display:inline-block;width:20px;height:20px;background:#dce4ef;border:1px solid #999;vertical-align:middle;"></span> | `#dce4ef` | Subtle fills, hover backgrounds |
| `--wf-surface` | <span style="display:inline-block;width:20px;height:20px;background:#edf1f7;border:1px solid #999;vertical-align:middle;"></span> | `#edf1f7` | Card backgrounds, panel fills |
| `--wf-canvas` | <span style="display:inline-block;width:20px;height:20px;background:#f0f4fa;border:1px solid #999;vertical-align:middle;"></span> | `#f0f4fa` | Page background |
| `--wf-accent` | <span style="display:inline-block;width:20px;height:20px;background:#3d6daa;border:1px solid #999;vertical-align:middle;"></span> | `#3d6daa` | **The ONE blue** — links, primary actions, active states |

## Semantic colors

| Token | Swatch | Default | Use |
|---|---|---|---|
| `--wf-red` | <span style="display:inline-block;width:20px;height:20px;background:#8b4553;border:1px solid #999;vertical-align:middle;"></span> | `#8b4553` | Errors, overdue, danger actions |
| `--wf-amber` | <span style="display:inline-block;width:20px;height:20px;background:#6b5a2f;border:1px solid #999;vertical-align:middle;"></span> | `#6b5a2f` | Warnings, pending states |
| `--wf-green` | <span style="display:inline-block;width:20px;height:20px;background:#45785a;border:1px solid #999;vertical-align:middle;"></span> | `#45785a` | Success, confirmed, positive |
| `--wf-purple` | <span style="display:inline-block;width:20px;height:20px;background:#6b5b8a;border:1px solid #999;vertical-align:middle;"></span> | `#6b5b8a` | AI features, suggestions |

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

## Napkin mode overrides

In [[Fidelity-Levels|napkin mode]], the palette shifts to pure grayscale on white paper:

| Token | Blueprint | Napkin |
|---|---|---|
| `--wf-canvas` | `#f0f4fa` | `#ffffff` |
| `--wf-ink` | `#1e2a3a` | `#1a1a1a` |
| `--wf-text` | `#3b4f68` | `#2a2a2a` |
| `--wf-line` | `#b0bdd0` | `#aaaaaa` |
| `--wf-wobble-filter` | `url(#wf-line-wobble)` | `none` |

---

## Related

- [[Components]] — Components built from these tokens ([live demo](components.html))
- [[Paper-Utilities]] — Paper effect classes that use the paper tokens
- [[Fidelity-Levels]] — How tokens shift across Napkin / Blueprint / Polished modes
- [`ref/tokens.md`](../ref/tokens.md) — Agent-facing token reference
- [`ref/design-system-theme.md`](../ref/design-system-theme.md) — Multi-system theming (overriding tokens per brand)
