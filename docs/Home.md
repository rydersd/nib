# Nib Wiki

> Human-facing documentation for the Nib wireframe prototyping framework. For agent-facing reference docs, see [[For-Agents]] or browse [`ref/`](../ref/).

Nib is an agent-consumable wireframe prototyping framework. It provides shared CSS, JS, and reference documentation so agents (and humans) can rapidly generate consistent, professional wireframe pages.

**Quick start:** Copy a starter from [`starters/`](../starters/), create a `project-data.js`, and you're ready to build. See [[Getting-Started]] for the 5-minute walkthrough or [[New-Project]] for the full bootstrap.

---

## Get started

- [[Getting-Started]] — 5-minute bootstrap for a new project
- [[New-Project]] — 7-step full project setup, including reference hubs
- [[Philosophy]] — Why deliberate imperfection makes better prototypes
- [[Glossary]] — Terms and concepts

## Design system

- [[Design-Tokens]] — Color, typography, spacing — never hardcode hex
- [[Components]] — Buttons, cards, badges, forms, tables, tabs ([live demo](components.html))
- [[Paper-Utilities]] — `.wf-tape`, `.wf-pin`, `.wf-torn-*`, `.wf-stacked`, `.wf-sketch`
- [[Icons]] — SVG icon usage + per-design-system catalogs
- [[Themes]] — Nib / SLDS / Material / High-Contrast + custom theme builder
- [[Fidelity-Levels]] — Napkin / Blueprint / Polished
- [[Confidence-Levels]] — `data-wf-confidence` for per-element certainty
- [[Evidence]] — `data-wf-evidence`: the prototype as a heatmap of design certainty

## Authoring pages

- [[Page-Template]] — Required HTML boilerplate
- [[Page-Blueprint]] — Declarative `PAGE_BLUEPRINT` rendering
- [[Page-Compose]] — Template-level authoring (SLDS record pages, list views, wizards)
- [[Decks]] — Scroll-snapping review-presentation decks with SVG export
- [[Layouts]] — Grid, sidebar, split-view, app-shell recipes
- [[Design-Notes]] — Per-page notes structure, JTBD, friction points

## Runtime

- [[Architecture]] — Load order, globals, CSS modules, z-index system
- [[Navigation]] — `SECTIONS`, `JOURNEYS`, `SCENARIOS`, `DESIGN_STORIES`
- [[Review-Mode]] — Stakeholder reactions, heat map, Cloudflare sync
- [[Feedback]] — Context-bar feedback → GitHub issues + R2 screenshots
- [[Doctor]] — 15 automated checks for common mistakes

## Platform surfaces

- [[Surfaces]] — Overview + how to create a new surface
- [[Surface-Internal]] — Internal portals, dashboards (`.ds-*`)
- [[Surface-Slack]] — Slack apps, messages, threads (`.slack-*`)
- [[Surface-Salesforce]] — SFDC record pages, Lightning (`.sfdc-*`)
- [[SLDS-Rules]] — SLDS 2 compliance rules for Salesforce pages

## Deliverables & examples

- [[Project-Deliverables]] — Sitemap, JTBD, flows, personas, design stories
- [[Examples]] — Sales Portal, Deal Registration, Kanban, Charts, and more ([all examples](../examples/index.html))

## Governance

- [[Compliance]] — GDPR, PII, SOX, accessibility, cookie consent, locale
- [[Review-Agents]] — SFDC UX + Dev review agents
- [[Lessons-Learned]] — 11 incidents that shaped the framework

## For AI agents

- [[For-Agents]] — How agents read and use this framework
- [[Agentic-Retrieval]] — Make a large wireframe project AI-navigable in ≤2000 tokens
- [`ref/_index.md`](../ref/_index.md) — Agent routing table

## Project updates

- [[updates/2026-03-13-reference-hub-patterns|2026-03-13: Reference Hub Patterns]]

---

## Conventions used in this wiki

- `[[Page-Name]]` — wikilink to another wiki page (filename without `.md`)
- `[[Page-Name|Display Text]]` — wikilink with custom link text
- `[[Page-Name#section-anchor]]` — link to a specific heading on another page
- Every page starts with a `**Tags:** ...` line for discoverability
- Every page ends with a `## Related` section of cross-links
- Links to code, starters, examples, and `ref/` use standard relative paths
- All tokens in code examples use the `--wf-*` convention — see [[Design-Tokens]]
