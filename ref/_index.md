# Nib Reference Index

> ⚠️ **`ref/` is deprecated.** The framework's documentation has moved to `docs/` (the wiki). Each page below is now mirrored at `docs/<Title-Case-With-Dashes>.md` — edit the wiki version. `ref/` files will be removed in a future release.
>
> Wiki entry point: [`docs/Home.md`](../docs/Home.md). Sidebar: [`docs/_Sidebar.md`](../docs/_Sidebar.md).

> Read this first. It tells you which refs to load for your task.

## By Task

| Building… | Read these refs |
|-----------|----------------|
| Creating a new project (CLI + browser wizard) | `create-project.md` |
| Bootstrapping a project from a workbook | `spreadsheet-authoring.md` |
| Picking a project template (clone-and-edit) | `templates.md` |
| Editable service blueprint (React Flow canvas) | `service-blueprint.md` + `spreadsheet-authoring.md` |
| Any page | `tokens.md` + `page-template.md` |
| Slack wireframe | + `surface-slack.md` + `components.md` |
| Salesforce wireframe | + `surface-salesforce.md` + `surface-salesforce-rules.md` + `components.md` |
| Internal portal wireframe | + `surface-internal.md` + `components.md` |
| Presentation deck / design review | `surface-deck.md` (self-contained — no `tokens.md`/`page-template.md`) |
| Complex layout | + `layouts.md` |
| New project from scratch | `new-project.md` (reads others for you) |
| Understanding the system | `architecture.md` |
| Adding navigation/drawer | `navigation.md` |
| Configuring context bar / portal header / search | `context-bar.md` |
| Multi-system theming | `design-system-theme.md` + `navigation.md` |
| Paper/blueprint features | `components.md` | Paper utility classes, confidence attribute |
| Declarative page from data | `page-blueprint.md` + surface ref |
| Compose-format pages | `page-compose.md` + surface ref |
| Deck / review presentation | `decks.md` |
| Evidence-driven fidelity (`data-wf-evidence`) | `evidence.md` |

| Building a sitemap page | `project-deliverables.md` |
| Writing design notes | `design-notes-guide.md` |
| JTBD, user flows, personas | `project-deliverables.md` |
| Reference hub pages | `project-deliverables.md` |
| Design stories, story tracking | `project-deliverables.md` + `navigation.md` |
| Project completeness checklist | `new-project.md` (Step 7) |

| Using icons in wireframes | `icons.md` (generic) or `sfdc/icons.md` (SLDS) |
| Running page diagnostics | `doctor.md` |
| Global compliance concerns | `compliance-global.md` |
| Feedback → GitHub issues endpoint | `feedback.md` |
| Analytics, KPI-card filters, signal bar | load `core/proto-analytics.js` / `proto-kpi-filter.js` / `proto-signals.js` |
| Making a large project AI-navigable | `docs/Agentic-Retrieval.md` + `tools/nib-seed-topics.js` |
| Salesforce UX review | `agent-sfdc-ux.md` + `surface-salesforce-rules.md` |
| Salesforce dev feasibility | `agent-sfdc-dev.md` + `surface-salesforce-rules.md` |
| Agent installation guide | `agent-install.md` |

## Rules

- Always read `tokens.md` — never hardcode colors
- Always read `page-template.md` — every page needs the same boilerplate
- Read ONE surface ref per page (don't mix Slack + SFDC on one page)
- `components.md` has the shared stuff; surface refs have platform-specific stuff
