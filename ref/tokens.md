# Design Tokens

> ⚠️ **Deprecated.** Edit [`docs/Design-Tokens.md`](../docs/Design-Tokens.md) instead. This file will be removed in a future release.

> Read before styling any element. Never hardcode hex values.

## Color Tokens

| Token | Hex | Use for |
|-------|-----|---------|
| `--wf-ink` | #1e2a3a | Headings, borders, strong text |
| `--wf-text` | #3b4f68 | Body text |
| `--wf-muted` | #4a5f7f | Secondary text, labels, captions |
| `--wf-line` | #b0bdd0 | Borders, dividers, separators |
| `--wf-tint` | #dce4ef | Subtle fills, zebra rows, hover states |
| `--wf-surface` | #edf1f7 | Card/section backgrounds |
| `--wf-canvas` | #f0f4fa | Page background |
| `--wf-white` | #ffffff | Input backgrounds, overlays, panels |
| `--wf-accent` | #3d6daa | Links, primary buttons, active states — the ONE blue |
| `--wf-accent-lt` | #e8eff8 | Light accent fill (selected rows, hover) |
| `--wf-accent-fill` | rgba(61,109,170,0.07) | Ultra-subtle accent tint |
| `--wf-red` | #8b4553 | Errors, overdue, destructive, blocked |
| `--wf-amber` | #6b5a2f | Warnings, pending, caution, snoozed |
| `--wf-green` | #45785a | Success, confirmed, completed, active |
| `--wf-purple` | #6b5b8a | AI-generated, suggestions, special |

## Typography + Spacing

| Token | Value |
|-------|-------|
| `--wf-font` | 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif |
| `--wf-mono` | 'SF Mono', 'Fira Code', 'Consolas', monospace |
| `--wf-radius` | 4px |

## Semantic Pairings

| Need | Background | Text/Border |
|------|-----------|-------------|
| Error badge | `--wf-red` bg + `#fff` text | or `--wf-red` text on light bg |
| Success badge | `--wf-green` bg + `#fff` text | or `--wf-green` text on light bg |
| Warning badge | `--wf-amber` bg + `#fff` text | or `--wf-amber` text on light bg |
| Card on page | `--wf-white` bg | `--wf-line` border |
| Section on card | `--wf-surface` bg | `--wf-line` border |
| Muted label | — | `--wf-muted` color |
| Active/selected | `--wf-accent-lt` bg | `--wf-accent` text |

## Rules

- `--wf-accent` is the ONE blue. Don't introduce additional blues.
- Semantic colors (red/amber/green/purple) are intentionally muted — these are wireframes, not production UI.
- Page background is always `--wf-canvas`. Card background is `--wf-white`.
- All borders use `--wf-line` unless indicating status.

## Blueprint & Paper Tokens

| Token | Value | Use |
|-------|-------|-----|
| `--wf-paper-shadow` | layered box-shadow | Stacked paper depth on cards |
| `--wf-tape-color` | rgba(220,228,200,0.55) | Tape strip fill |
| `--wf-tape-border` | rgba(180,190,160,0.3) | Tape strip edge |
| `--wf-pin-color` | #c0392b | Pushpin dot |

## Fidelity Variables (auto-set by slider)

| Variable | Napkin | Blueprint | Polished |
|----------|--------|-----------|----------|
| `--wf-wobble-radius` | extreme asymmetry | mild asymmetry | `--wf-radius` |
| `--wf-grain-opacity` | 0.15 | 0.06 | 0 |
| `--wf-grid-opacity` | 0.15 | 0.08 | 0.02 |
| `--wf-shadow-scale` | 1.5 | 1 | 0 |
| `--wf-wobble-filter` | heavy wobble | line wobble | none |
