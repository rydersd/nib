# Glossary

**Tags:** `reference` · `glossary`

Concepts and terminology used throughout Nib. Each term links to the wiki page where it's covered in depth.

## A

**Acceptance Criteria (AC)** — Per-story checklist of behaviors that must pass before a story ships. Tracked in `DESIGN_STORIES` and rendered as badges on wireframe elements via AC badge auto-injection. See [`ref/project-deliverables.md`](../ref/project-deliverables.md).

**Agent-consumable** — Documentation and patterns designed so LLMs can read and correctly generate against them without hand-holding. See [[For-Agents]] and [[Philosophy#agent-consumable-design|Philosophy]].

## B

**Blueprint** — The default [[Fidelity-Levels|fidelity level]]. Balanced wireframe aesthetic — subtle grid, paper texture.

## C

**Compose format** — Template-level authoring where pages are defined as `COMPOSE` objects referencing reusable templates. Runtime (`proto-compose.js`) transforms them into `PAGE_BLUEPRINT`. See [`ref/page-compose.md`](../ref/page-compose.md).

**Confidence** — Per-element design certainty expressed via `data-wf-confidence`. Values: `confirmed`, `partial`, `uncertain`. See [[Confidence-Levels]].

**Context bar** — Top-of-page chrome housing the fidelity slider, hamburger menu, and design notes toggle. Built by `proto-nav.js`.

**Core** — The [`core/`](../core/) directory. Shared CSS modules and JS. Never modify per-project.

## D

**Declarative Page (Blueprint)** — Data-driven page rendered by `proto-gen.js` from a `PAGE_BLUEPRINT` object. See [`ref/page-blueprint.md`](../ref/page-blueprint.md).

**Design notes** — The `wf-design-notes` div on every page. Three tabs: Context / Design / Technical. See [`ref/design-notes-guide.md`](../ref/design-notes-guide.md).

**Design stories** — Rich, implementation-focused stories in `DESIGN_STORIES` (phases, AC, decisions, platform approach). Not the same as JTBD. See [`ref/project-deliverables.md`](../ref/project-deliverables.md).

**Design tokens** — CSS custom properties (`--wf-*`) for colors, spacing, paper effects. Never hardcode hex. See [[Design-Tokens]].

## F

**Fidelity** — Page-wide visual mode: Napkin, Blueprint, or Polished. See [[Fidelity-Levels]].

## J

**JOURNEYS** — User flow definitions in `project-data.js`. Power the User Flows page and guided walkthroughs. See [`ref/navigation.md`](../ref/navigation.md).

**JTBD (Jobs to Be Done)** — Persona-specific user goals surfaced from design notes into a hub page. See [`ref/project-deliverables.md`](../ref/project-deliverables.md).

## N

**Napkin** — The most informal [[Fidelity-Levels|fidelity level]]. White paper + sharpie, grayscale only.

## P

**Paper utilities** — CSS classes (`.wf-tape`, `.wf-pin`, `.wf-torn-*`, `.wf-stacked`, `.wf-sketch`) that add physical-artifact textures. See [[Paper-Utilities]].

**Polished** — The cleanest [[Fidelity-Levels|fidelity level]]. Minimal wireframe artifacts for handoff.

**`project-data.js`** — Per-project data file defining `SECTIONS`, `WIREFRAME_CONFIG`, and optionally `STORY_MAP`, `DESIGN_STORIES`, `JOURNEYS`, `SCENARIOS`. See [[Getting-Started]].

## R

**`ref/`** — Agent-facing reference documentation. The [`ref/_index.md`](../ref/_index.md) routing table tells agents which files to load. See [[For-Agents]].

## S

**SCENARIOS** — Guided walkthrough scripts for demos. See [`ref/navigation.md`](../ref/navigation.md).

**SECTIONS** — Page-list data structure in `project-data.js` that drives the navigation drawer. See [[Getting-Started]].

**SLDS** — Salesforce Lightning Design System. See [[Surface-Salesforce]] and [`ref/slds/`](../ref/slds/).

**Starters** — Copy-paste HTML templates in [`starters/`](../starters/) for each page type. Start new projects here.

**STORY_MAP** — Maps design stories to the pages they appear on. See [`ref/project-deliverables.md`](../ref/project-deliverables.md).

**Surface** — Platform-specific CSS overlay: Internal DS, Slack, or Salesforce. One per page. See [[Surfaces]].

## W

**`wf-` prefix** — Shared core components. Surface-specific classes use `ds-`, `slack-`, or `sfdc-` prefixes.

**Wireframe mode** — The `html.wireframe` root class that enables wireframe styling. Every Nib page has it.

**`WIREFRAME_CONFIG`** — Project metadata (title, subtitle) in `project-data.js`. See [[Getting-Started]].

---

## Related

- [[Home]] — wiki index
- [[For-Agents]] — agent-facing reference map
