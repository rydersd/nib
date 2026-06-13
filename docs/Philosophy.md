# Philosophy

**Tags:** `reference` · `aesthetic` · `disposability`

Why deliberate imperfection makes better prototypes.

## The disposable prototype

High-fidelity mockups create a problem: stakeholders are reluctant to criticize work that looks "finished." When a design looks polished, feedback becomes about surface details — colors, fonts, spacing — rather than structure, flow, and information architecture.

Nib deliberately looks rough. Wireframes with wobbly borders, paper textures, and hand-drawn aesthetics communicate a clear message: **this is disposable.** Stakeholders feel comfortable crossing things out, rearranging sections, and questioning assumptions.

## Fidelity as communication

The three [[Fidelity-Levels|fidelity levels]] aren't just visual preferences — they communicate design certainty:

- **Napkin** — "Here's a rough idea. Everything is negotiable." White paper, sharpie outlines, no color. For early ideation and brainstorming sessions.
- **Blueprint** — "The structure is taking shape. Let's refine." Subtle grid, paper texture, wireframe aesthetic. For design reviews and iteration.
- **Polished** — "We're confident in this direction." Clean lines, minimal artifacts. For stakeholder review and handoff.

## Confidence-aware rendering

Individual components can declare their design certainty with the [[Confidence-Levels|`data-wf-confidence`]] attribute:

- `uncertain` — heavy wobble, reduced opacity. "We haven't figured this out yet."
- `partial` — moderate wobble. "Direction is set, details TBD."
- `confirmed` — clean rendering. "This is decided."

This lets a single wireframe page communicate different levels of design maturity for different sections — far more nuanced than a single fidelity level for the whole page.

## Structure over style

Nib focuses attention on what matters in early product design:

- **Information architecture** — what goes where, what's grouped together
- **User flow** — how users move between screens, what triggers navigation
- **Content hierarchy** — what's prominent, what's secondary, what's hidden
- **Interaction patterns** — buttons, forms, modals, notifications

The wireframe aesthetic strips away the visual design layer so teams can focus on these structural decisions first.

## Agent-consumable design

Nib is built to be operated by AI agents as well as humans. The [`ref/`](../ref/) directory contains structured documentation that agents read before generating wireframe pages. Tokens, components, and layout patterns are documented in a format optimized for LLM consumption — see [[For-Agents]].

This means a designer can describe a screen in natural language and an agent can generate a structurally correct wireframe using the framework's components and tokens — without hardcoding values or inventing new patterns.

---

## Related

- [[Fidelity-Levels]] — The three-mode slider in detail
- [[Confidence-Levels]] — Per-element design certainty
- [[Design-Tokens]] — How tokens shift across fidelity modes
- [[For-Agents]] — Agent-consumable design in practice
