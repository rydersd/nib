# Surfaces

**Tags:** `reference` · `surfaces`

Platform-specific CSS overlays that adapt the wireframe to different contexts.

> **Rule:** Use one surface CSS per page. Don't mix Slack + Salesforce on the same page.

## What are surfaces?

Surfaces are CSS overlays that add platform-specific styling on top of the core wireframe components. They provide the look and feel of specific platforms (Slack, Salesforce, internal portals) while maintaining the wireframe aesthetic.

Each surface provides its own set of prefixed components that complement the base `wf-` components (see [[Components]]):

- `ds-` — Internal Design System (portals, dashboards)
- `slack-` — Slack apps
- `sfdc-` — Salesforce Lightning

## Available surfaces

| Surface | Prefix | Use for | Wiki page |
|---|---|---|---|
| Internal DS | `ds-` | Dashboards, admin panels, internal portals | [[Surface-Internal]] |
| Slack | `slack-` | Bot messages, app home tabs, modals, threads | [[Surface-Slack]] |
| Salesforce | `sfdc-` | Record pages, Lightning components | [[Surface-Salesforce]] |

## Choosing a surface

When creating a wireframe, choose the surface that matches the target platform:

| Building for | Surface | Use when |
|---|---|---|
| Internal tools | [`surfaces/internal-ds.css`](../surfaces/internal-ds.css) | Dashboards, admin panels, portals |
| Slack apps | [`surfaces/slack.css`](../surfaces/slack.css) | Bot messages, app home tabs, modals |
| Salesforce | [`surfaces/salesforce.css`](../surfaces/salesforce.css) | Record pages, Lightning components |

Load exactly one:

```html
<link rel="stylesheet" href="../core/proto-core.css">
<link rel="stylesheet" href="../surfaces/internal-ds.css">
<!-- Don't also load slack.css or salesforce.css on the same page -->
```

## Creating a new surface

To add a surface for a new platform:

1. Create `surfaces/your-platform.css`
2. Use a unique prefix for all classes (e.g., `.jira-`, `.notion-`)
3. Build on top of core [[Design-Tokens|tokens]] — never hardcode hex values
4. Add wireframe-mode overrides: `html.wireframe .your-component { ... }`
5. Add napkin-mode button overrides for sharpie aesthetic
6. Create a reference doc at `ref/surface-your-platform.md`
7. Create a starter at `starters/your-platform-starter.html`

See existing surfaces in [`surfaces/`](../surfaces/) for reference.

---

## Related

- [[Surface-Internal]], [[Surface-Slack]], [[Surface-Salesforce]] — platform deep-dives
- [[Components]] — shared `wf-` components that work across all surfaces
- [[Design-Tokens]] — tokens that every surface builds on
- [`ref/surface-slack.md`](../ref/surface-slack.md), [`ref/surface-salesforce.md`](../ref/surface-salesforce.md), [`ref/surface-internal.md`](../ref/surface-internal.md) — agent-facing surface refs
