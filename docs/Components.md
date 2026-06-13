# Components

**Tags:** `reference` · `components` · `design-system`

Reusable UI primitives available across all surfaces.

> **Live demo:** Open [`components.html`](components.html) in a browser to see every primitive rendered interactively with the [[Fidelity-Levels|fidelity slider]] attached.

For the agent-facing component reference, see [`ref/components.md`](../ref/components.md).

## Buttons

All buttons use the `.btn` base class with optional variant modifiers. Buttons have no surface prefix — they're shared across [[Surfaces|all surfaces]].

```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-danger">Danger</button>
<button class="btn btn-ghost">Ghost</button>
<button class="btn">Default</button>
<button class="btn btn-sm">Small</button>
```

## Badges

```html
<span class="wf-badge wf-badge-green">Active</span>
<span class="wf-badge wf-badge-amber">Pending</span>
<span class="wf-badge wf-badge-red">Overdue</span>
<span class="wf-badge wf-badge-purple">AI</span>
<span class="wf-badge">Default</span>
```

Badge colors map to [[Design-Tokens#semantic-colors|semantic color tokens]].

## Cards

The base `.wf-card` provides border, shadow, and paper texture. Surface-specific cards (`.ds-card`, `.sfdc-card`) extend with platform styling — see [[Surfaces]].

```html
<!-- Base wireframe card -->
<div class="wf-card">...</div>

<!-- Internal DS card with header/body structure -->
<div class="ds-card">
  <div class="ds-card-header">
    <span class="ds-card-title">Card Title</span>
  </div>
  <div class="ds-card-body">Content</div>
</div>
```

## Paper utilities

Add physical-artifact texture to any card — see [[Paper-Utilities]] for the full catalog.

- `.wf-tape` — tape strip across top center
- `.wf-pin` — pushpin dot at top center
- `.wf-sketch` — heavy hand-drawn border
- `.wf-torn-top` / `.wf-torn-bottom` — torn paper edge
- `.wf-stacked` — stacked paper pile effect

## Forms

```html
<div class="wf-form-group">
  <label class="wf-label">Text Input</label>
  <input type="text" class="wf-input" placeholder="Enter value...">
</div>
<div class="wf-form-group">
  <label class="wf-label">Select</label>
  <select class="wf-select">
    <option>Option 1</option>
  </select>
</div>
<div class="wf-form-group">
  <label class="wf-label">Textarea</label>
  <textarea class="wf-textarea" placeholder="Enter text..."></textarea>
</div>
```

## Tables

```html
<table class="wf-table">
  <thead>
    <tr><th>Name</th><th>Role</th><th>Status</th></tr>
  </thead>
  <tbody>
    <tr><td>Alice</td><td>Designer</td><td><span class="wf-badge wf-badge-green">Active</span></td></tr>
  </tbody>
</table>
```

## Tabs

```html
<div class="wf-tabs">
  <button class="wf-tab active">Overview</button>
  <button class="wf-tab">Details</button>
  <button class="wf-tab">History</button>
</div>
```

## Confidence levels

Use `data-wf-confidence` to communicate design certainty on individual elements — see [[Confidence-Levels]] for the full pattern.

```html
<div class="ds-card" data-wf-confidence="confirmed">...</div>
<div class="ds-card" data-wf-confidence="partial">...</div>
<div class="ds-card" data-wf-confidence="uncertain">...</div>
```

---

## Related

- [Live demo](components.html) — every primitive rendered interactively
- [[Design-Tokens]] — tokens that style these components
- [[Paper-Utilities]] — paper effect utility classes
- [[Confidence-Levels]] — per-element certainty
- [[Surfaces]] — platform-specific component overlays
- [`ref/components.md`](../ref/components.md) — agent-facing component catalog
