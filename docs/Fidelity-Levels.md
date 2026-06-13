# Fidelity Levels

**Tags:** `reference` · `aesthetic` · `fidelity`

Nib's three-mode fidelity slider. Each mode communicates a different level of design certainty — see [[Philosophy#fidelity-as-communication|Philosophy: Fidelity as Communication]].

## The three modes

| Mode | Meaning | Visual |
|---|---|---|
| **Napkin** | "Here's a rough idea. Everything is negotiable." | White paper, sharpie outlines, grayscale only |
| **Blueprint** | "The structure is taking shape. Let's refine." | Default — subtle grid, paper texture, wireframe aesthetic |
| **Polished** | "We're confident in this direction." | Clean lines, minimal wireframe artifacts |

## How it works

The fidelity slider lives in the context bar at the top of every page. Selecting a mode updates CSS variables that control:

- `--wf-wobble-radius` — how imperfect borders look
- `--wf-wobble-filter` — SVG displacement filter applied to lines
- `--wf-grain-opacity` — paper texture overlay intensity
- `--wf-grid-opacity` — background grid visibility

See [[Design-Tokens#paper-effects|Design Tokens: Paper Effects]] for the full list.

## Persistence

The slider state persists in `sessionStorage` across page navigations within the same browser session. Users don't need to re-select on every page.

## Never hardcode fidelity values

Because the slider drives CSS variables, **never hardcode** `--wf-wobble-radius`, `--wf-grain-opacity`, or `--wf-grid-opacity`. Always use `var(--wf-*)` so your element responds to the slider.

## Napkin mode overrides

Napkin mode is the most dramatic transformation — it strips color and shifts every token to grayscale on white paper. See the [[Design-Tokens#napkin-mode-overrides|full override table]] in Design Tokens.

---

## Related

- [[Philosophy]] — why fidelity is about communication, not just aesthetics
- [[Confidence-Levels]] — per-element certainty, complementary to page-level fidelity
- [[Design-Tokens]] — tokens that shift across modes
- [[Paper-Utilities]] — paper effects that respond to fidelity
