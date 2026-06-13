# For AI Agents

**Tags:** `reference` · `agents`

Nib is built to be operated by AI agents as well as humans — see [[Philosophy#agent-consumable-design|Philosophy: Agent-Consumable Design]]. This page explains how agents interact with the framework.

## Where to start

If you're an AI agent generating wireframes, your entry point is:

**[`ref/_index.md`](../ref/_index.md)** — the routing table that tells you which reference docs to load based on your task.

The `ref/` directory is optimized for LLM consumption: structured markdown, predictable headings, explicit rules. The `docs/` wiki (where you are now) is the human-facing mirror.

## The ref/ directory

Organized by topic:

### Foundations (read first)

- [`ref/tokens.md`](../ref/tokens.md) — design tokens (never hardcode hex)
- [`ref/page-template.md`](../ref/page-template.md) — required HTML boilerplate
- [`ref/components.md`](../ref/components.md) — shared component catalog
- [`ref/architecture.md`](../ref/architecture.md) — script load order, global data structures

### Per-surface (read one for your target)

- [`ref/surface-internal.md`](../ref/surface-internal.md) — see [[Surface-Internal]]
- [`ref/surface-slack.md`](../ref/surface-slack.md) — see [[Surface-Slack]]
- [`ref/surface-salesforce.md`](../ref/surface-salesforce.md) + [`ref/surface-salesforce-rules.md`](../ref/surface-salesforce-rules.md) — see [[Surface-Salesforce]]

### Page formats

- [`ref/page-blueprint.md`](../ref/page-blueprint.md) — declarative `PAGE_BLUEPRINT` rendering
- [`ref/page-compose.md`](../ref/page-compose.md) — compose-format (template references + variables)
- [`ref/layouts.md`](../ref/layouts.md) — grid, sidebar, split view patterns

### Project structure

- [`ref/new-project.md`](../ref/new-project.md) — 7-step bootstrap
- [`ref/project-deliverables.md`](../ref/project-deliverables.md) — sitemap, JTBD, flows, personas, story reference
- [`ref/design-notes-guide.md`](../ref/design-notes-guide.md) — design notes panel structure
- [`ref/navigation.md`](../ref/navigation.md) — drawer, breadcrumbs, JOURNEYS, SCENARIOS

### Salesforce review agents

- [`ref/agent-install.md`](../ref/agent-install.md) — how to install review agents locally
- [`ref/agent-sfdc-ux.md`](../ref/agent-sfdc-ux.md) — SFDC UX review
- [`ref/agent-sfdc-dev.md`](../ref/agent-sfdc-dev.md) — SFDC dev feasibility review

### Diagnostics and audits

- [`ref/doctor.md`](../ref/doctor.md) — page diagnostics
- [`ref/audit/`](../ref/audit/) — audit methodology and checklists
- [`ref/lessons-learned.md`](../ref/lessons-learned.md) — patterns and pitfalls from real projects

### Theming and compliance

- [`ref/design-system-theme.md`](../ref/design-system-theme.md) — multi-system theming
- [`ref/compliance-global.md`](../ref/compliance-global.md) — global accessibility / privacy concerns

## Key rules

- Never hardcode hex — always use tokens (see [[Design-Tokens]])
- One [[Surfaces|surface]] per page
- Every page needs design notes (`wf-design-notes` div)
- Script load order is strict — see [`ref/page-template.md`](../ref/page-template.md)
- [[Fidelity-Levels|Fidelity]] and [[Confidence-Levels|confidence]] values are data-driven — never hardcode wobble or grain values

See [`CLAUDE.md`](../CLAUDE.md) at the repository root for the full set of project instructions Claude Code loads automatically.

---

## Related

- [[Home]] — wiki home
- [[Philosophy]] — why Nib is agent-consumable
- [[Glossary]] — concepts and terminology
- [`ref/_index.md`](../ref/_index.md) — agent routing table
