# Component Catalog

> ⚠️ **Deprecated.** Edit [`docs/Components.md`](../docs/Components.md) instead. This file will be removed in a future release.

> Shared components from proto-core.css. Use these before building custom.

## Buttons

| Class | Use |
|-------|-----|
| `.btn` | Base button (no fill) |
| `.btn-primary` | Primary action (accent bg, white text) |
| `.btn-secondary` | Secondary action (accent text, tint bg) |
| `.btn-ghost` | Tertiary/cancel (text only, hover fills) |
| `.btn-danger` | Destructive action (red text) |
| `.btn-sm` | Add to any btn for compact size |

```html
<button class="btn btn-primary">Save Changes</button>
<button class="btn btn-secondary">Cancel</button>
<button class="btn btn-ghost btn-sm">Dismiss</button>
```

## Cards

```html
<div class="wf-card">
  <div class="wf-card-header">Card Title</div>
  <div class="wf-card-body">Content here</div>
</div>
```

Variant: add inline `style="border-left: 3px solid var(--wf-accent)"` for accent card.

## Tables

```html
<table class="wf-table">
  <thead>
    <tr><th>Name</th><th>Status</th><th>Date</th></tr>
  </thead>
  <tbody>
    <tr><td>Item one</td><td><span class="wf-badge wf-badge-green">Active</span></td><td>Mar 5</td></tr>
    <tr><td>Item two</td><td><span class="wf-badge wf-badge-amber">Pending</span></td><td>Mar 3</td></tr>
  </tbody>
</table>
```

## Badges

| Class | Color | Use |
|-------|-------|-----|
| `.wf-badge` | Neutral (muted) | Default status |
| `.wf-badge-green` | Green | Active, confirmed, success |
| `.wf-badge-amber` | Amber | Pending, warning, snoozed |
| `.wf-badge-red` | Red | Error, overdue, blocked |
| `.wf-badge-purple` | Purple | AI-generated, special |

```html
<span class="wf-badge wf-badge-green">Confirmed</span>
```

## Forms

```html
<div class="wf-form-group">
  <label class="wf-label">Field Label</label>
  <input type="text" class="wf-input" placeholder="Enter value">
</div>

<div class="wf-form-group">
  <label class="wf-label">Select</label>
  <select class="wf-select">
    <option>Option 1</option>
    <option>Option 2</option>
  </select>
</div>

<div class="wf-form-group">
  <label class="wf-label">Notes</label>
  <textarea class="wf-textarea" rows="3" placeholder="Details..."></textarea>
</div>
```

## Tabs

```html
<div class="wf-tabs">
  <button class="wf-tab active">Tab One</button>
  <button class="wf-tab">Tab Two</button>
  <button class="wf-tab">Tab Three</button>
</div>
```

## Modal Overlay

```html
<div class="wf-modal-overlay" id="my-modal" style="display:none;">
  <div class="wf-modal">
    <div class="wf-modal-header">
      <span class="wf-modal-title">Modal Title</span>
      <button class="wf-modal-close" onclick="wfModalClose('my-modal')">&times;</button>
    </div>
    <div class="wf-modal-body">
      <!-- form content -->
    </div>
    <div class="wf-modal-footer">
      <button class="btn btn-ghost" onclick="wfModalClose('my-modal')">Cancel</button>
      <button class="btn btn-primary">Save</button>
    </div>
  </div>
</div>
```

Show with: `document.getElementById('my-modal').style.display='flex';`
Close with: `wfModalClose('my-modal')` (from proto-nav.js)

## Toast

```html
<button onclick="wfToast('Changes saved')">Save</button>
<button onclick="wfToast('Item deleted', 3000)">Delete</button>
```

`wfToast(message, durationMs)` — shows a brief notification. Default 2500ms.

## Design Notes Panel

Always include at bottom of page, before scripts:

```html
<div class="wf-design-notes">
  <div class="wf-spec-panel">
    <div class="wf-spec-header">Page Name</div>
    <div class="wf-spec-section">
      <div class="wf-spec-section-title">Summary</div>
      <div class="wf-spec-body">What this page shows.</div>
    </div>
  </div>
</div>
```

## Rules

- Use `wf-` prefixed components for anything shared across surfaces
- Use surface-specific components (slack-, sfdc-, ds-) for platform UI
- Don't duplicate: if wf-card works, don't make a custom card
- Buttons never need a surface prefix — `.btn-primary` works everywhere
- Toast and modal are JS functions from proto-nav.js — no extra imports

## Feedback Panel

The feedback panel (💬 button in context bar) provides in-context feedback with type selection, screenshot paste/drop, and mailto integration. Fully styled via `.wf-fb-*` classes in proto-core.css Section 20.

**Classes**: `.wf-fb-overlay`, `.wf-fb-panel`, `.wf-fb-hd`, `.wf-fb-body`, `.wf-fb-type-pills`, `.wf-fb-textarea`, `.wf-fb-drop`, `.wf-fb-submit-btn`

Auto-closes after submission. ESC key dismisses.

## Paper Utility Classes

Physical artifact effects — add to any element for corkboard/blueprint feel.

| Class | Effect | Notes |
|-------|--------|-------|
| `.wf-torn-top` | Irregular torn edge on top | Uses `::before` pseudo-element |
| `.wf-torn-bottom` | Irregular torn edge on bottom | Uses `::after` pseudo-element |
| `.wf-tape` | Semi-transparent tape strip centered on top | Uses `::before`; variants `.wf-tape-left`, `.wf-tape-right` |
| `.wf-pin` | Red pushpin dot centered on top | Uses `::before` |
| `.wf-stacked` | Layered paper sheets behind element | Uses `::before` and `::after` |
| `.wf-sketch` | Hand-drawn border feel | Asymmetric border-radius, no pseudo-elements |

## Confidence Attribute

Add `data-wf-confidence` to any element to encode design certainty:

| Value | Rendering | Meaning |
|-------|-----------|---------|
| `uncertain` | Wobbly borders, reduced opacity, SVG filter | Feature not yet validated |
| `partial` | Mildly asymmetric borders | Some validation done |
| `confirmed` | Clean, precise borders | Design validated and approved |

At Polished fidelity, uncertain elements show dashed borders instead of wobble.
