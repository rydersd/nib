# Examples

**Tags:** `reference` · `examples`

Reference implementations of the Nib framework. Browse the full collection at [`examples/index.html`](../examples/index.html).

> **Note:** Examples are for learning. When bootstrapping a new project, copy from [`starters/`](../starters/) — not from `examples/`. See [[Getting-Started]].

## Multi-page projects

| Project | Surfaces | Path |
|---|---|---|
| Sales Portal (test-project) | [[Surface-Internal]], [[Surface-Slack]], [[Surface-Salesforce]] | [`examples/test-project/`](../examples/test-project/) |
| Deal Registration | [[Surface-Salesforce]] (compose format, 9 screens) | [`examples/deal-registration/`](../examples/deal-registration/) |

## Single-surface demos

| Project | Surface | Path |
|---|---|---|
| Kanban Board | [[Surface-Internal]] | [`examples/kanban-board/`](../examples/kanban-board/) |
| Charts Dashboard | [[Surface-Internal]] (SVG charts + tables) | [`examples/charts-dashboard/`](../examples/charts-dashboard/) |
| Data Table | [[Surface-Internal]] | [`examples/data-table/`](../examples/data-table/) |
| Agent Chat | [[Surface-Slack]] | [`examples/agent-chat/`](../examples/agent-chat/) |
| Newspaper | Editorial layout | [`examples/newspaper/`](../examples/newspaper/) |
| Pinterest Board | Image-heavy grid | [`examples/pinterest-board/`](../examples/pinterest-board/) |

## What to study in each example

When looking at an example, notice:

1. **`project-data.js`** — how `SECTIONS`, `WIREFRAME_CONFIG`, and optionally `STORY_MAP`, `JOURNEYS`, `SCENARIOS` are defined
2. **Script load order** — always `project-data.js` → `proto-nav.js`, with optional `proto-gen.js` or `proto-compose.js` for declarative pages
3. **Design notes** — every page has a `wf-design-notes` div explaining purpose, JTBD, specs, and AC
4. **Surface choice** — one surface per page, never mixed

---

## Related

- [[Getting-Started]] — bootstrap a new project from a starter
- [[Surfaces]] — pick the right surface for your target platform
- [`starters/`](../starters/) — copy-paste templates (start here, not from examples)
- [`ref/new-project.md`](../ref/new-project.md) — 7-step project bootstrap
