# Surface: Internal Design System

> ⚠️ **Deprecated.** Edit [`docs/Surface-Internal.md`](../docs/Surface-Internal.md) instead. This file will be removed in a future release.

> Read when building internal portal wireframes (partner portals, admin panels, dashboards). Requires `surfaces/internal-ds.css` + `proto-core.css`.

## Page Structure

Internal portal pages typically use a top header bar + content area:

```html
<body>
  <!-- Header injected by proto-nav.js from PORTAL_HEADERS -->

  <main style="max-width:1200px;margin:0 auto;padding:24px;">
    <!-- KPIs -->
    <!-- Cards/Tables -->
    <!-- Forms -->
  </main>

  <script src="project-data.js"></script>
  <script src="../core/proto-nav.js"></script>
</body>
```

## KPI Grid

```html
<div class="ds-kpi-grid">
  <div class="ds-kpi-card">
    <div class="ds-kpi-value">$2.4M</div>
    <div class="ds-kpi-label">Pipeline Value</div>
    <div class="ds-kpi-trend ds-kpi-up">↑ 12% vs last quarter</div>
  </div>
  <div class="ds-kpi-card">
    <div class="ds-kpi-value">42</div>
    <div class="ds-kpi-label">Active Deals</div>
  </div>
  <div class="ds-kpi-card">
    <div class="ds-kpi-value">87%</div>
    <div class="ds-kpi-label">Win Rate</div>
    <div class="ds-kpi-trend ds-kpi-down">↓ 3% vs last quarter</div>
  </div>
</div>
```

## Cards (ds- variant)

```html
<div class="ds-card">
  <div class="ds-card-header">
    <span class="ds-card-title">Section Title</span>
    <button class="btn btn-sm btn-ghost">Action</button>
  </div>
  <div class="ds-card-body">
    <!-- content -->
  </div>
</div>
```

## Form Groups

```html
<div class="ds-form-row">
  <div class="ds-form-group">
    <label class="ds-label">Company Name</label>
    <input type="text" class="ds-input" placeholder="Search or enter…">
  </div>
  <div class="ds-form-group">
    <label class="ds-label">Country</label>
    <select class="ds-select">
      <option>United States</option>
      <option>Canada</option>
    </select>
  </div>
</div>
```

`ds-form-row` lays children side-by-side. Each `ds-form-group` takes equal width.

## Modal (ds- variant)

```html
<div class="ds-modal-overlay" id="my-modal" style="display:none;">
  <div class="ds-modal">
    <div class="ds-modal-header">
      <span class="ds-modal-title">Modal Title</span>
      <button onclick="wfModalClose('my-modal')">&times;</button>
    </div>
    <div class="ds-modal-body">
      <!-- form content -->
    </div>
    <div class="ds-modal-footer">
      <button class="btn btn-ghost" onclick="wfModalClose('my-modal')">Cancel</button>
      <button class="btn btn-primary">Save</button>
    </div>
  </div>
</div>
```

## Class Reference

| Class | Purpose |
|-------|---------|
| `.ds-kpi-grid` | Auto-fit grid of KPI cards |
| `.ds-kpi-card` | Single KPI metric card |
| `.ds-kpi-value` | Large metric number |
| `.ds-kpi-label` | Metric label |
| `.ds-kpi-trend` | Trend indicator (`.ds-kpi-up` green, `.ds-kpi-down` red) |
| `.ds-card` | Standard content card |
| `.ds-card-header` | Card header with title + optional action |
| `.ds-card-body` | Card content area |
| `.ds-form-row` | Horizontal form field group |
| `.ds-form-group` | Single form field container |
| `.ds-label` | Form field label |
| `.ds-input` | Text input |
| `.ds-select` | Select dropdown |
| `.ds-modal-overlay` | Modal overlay |
| `.ds-modal` | Modal container |

## Rules

- Use `ds-` prefixed classes for internal portal pages, `wf-` for shared components
- KPI grid auto-sizes — add 2-5 cards and it flows
- Forms use `ds-form-row` for side-by-side fields, stack `ds-form-group` for vertical
- Max content width: 1200px centered — don't go full-bleed
- Buttons still use `.btn` / `.btn-primary` (shared, no ds- variant needed)
