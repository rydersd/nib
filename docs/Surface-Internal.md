# Surface: Internal Design System

**Tags:** `surface` · `internal-ds` · `dashboards`

For internal portals, dashboards, and admin tools. Uses the `ds-` prefix.

**CSS file:** [`surfaces/internal-ds.css`](../surfaces/internal-ds.css)
**Agent reference:** [`ref/surface-internal.md`](../ref/surface-internal.md)
**Starter:** [`starters/dashboard.html`](../starters/dashboard.html)

```html
<link rel="stylesheet" href="../core/proto-core.css">
<link rel="stylesheet" href="../surfaces/internal-ds.css">
```

## Key components

| Class | Purpose |
|---|---|
| `.ds-card` | Card with header/body structure |
| `.ds-card-header` | Card header region |
| `.ds-card-title` | Card header title |
| `.ds-card-body` | Card body region |
| `.ds-kpi-card` | KPI metric card with label / value / delta |
| `.ds-kpi-grid` | Auto-fit grid for KPI cards |
| `.ds-sidebar-card` | Sidebar info card |

## Example

```html
<div class="ds-kpi-grid">
  <div class="ds-kpi-card">
    <div class="ds-kpi-label">Revenue</div>
    <div class="ds-kpi-value">$1.2M</div>
    <div class="ds-kpi-delta">+12%</div>
  </div>
  <!-- more KPI cards -->
</div>

<div class="ds-card">
  <div class="ds-card-header">
    <span class="ds-card-title">Recent Activity</span>
  </div>
  <div class="ds-card-body">
    <!-- content -->
  </div>
</div>
```

## When to use

- Internal dashboards (sales, ops, engineering)
- Admin panels and configuration pages
- Multi-page portals with consistent chrome
- Any tool that doesn't live inside Slack or Salesforce

---

## Related

- [[Surfaces]] — overview and comparison
- [[Components]] — shared `wf-` components that work here too
- [[Design-Tokens]] — tokens this surface builds on
- [`ref/surface-internal.md`](../ref/surface-internal.md) — agent-facing reference
- [`examples/test-project/dashboard.html`](../examples/test-project/dashboard.html) — live example
