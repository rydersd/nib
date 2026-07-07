# Components

**Tags:** `reference` · `components` · `design-system`

Reusable UI primitives available across all surfaces.

> **Live demo:** Open [`components.html`](components.html) in a browser to see every primitive rendered interactively with the [[Fidelity-Levels|fidelity slider]] attached.

Use these before building custom. They live in `proto-components.css` (and the legacy `proto-core.css` monolith).

## Buttons

All buttons use the `.btn` base class with optional variant modifiers. Buttons have no surface prefix — they're shared across [[Surfaces|all surfaces]].

| Class | Use |
|-------|-----|
| `.btn` | Base button (no fill) |
| `.btn-primary` | Primary action (accent bg, white text) |
| `.btn-secondary` | Secondary action (accent text, tint bg) |
| `.btn-ghost` | Tertiary/cancel (text only, hover fills) |
| `.btn-danger` | Destructive action (red text) |
| `.btn-sm` | Add to any btn for compact size |

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

<!-- Base card with header/body structure -->
<div class="wf-card">
  <div class="wf-card-header">Card Title</div>
  <div class="wf-card-body">Content here</div>
</div>

<!-- Internal DS card with header/body structure -->
<div class="ds-card">
  <div class="ds-card-header">
    <span class="ds-card-title">Card Title</span>
  </div>
  <div class="ds-card-body">Content</div>
</div>
```

Variant: add inline `style="border-left: 3px solid var(--wf-accent)"` for an accent card.

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

## Modal overlay

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

Show with `document.getElementById('my-modal').style.display='flex';` — close with `wfModalClose('my-modal')` (from `proto-nav.js`).

## Toast

```html
<button onclick="wfToast('Changes saved')">Save</button>
<button onclick="wfToast('Item deleted', 3000)">Delete</button>
```

`wfToast(message, durationMs)` — shows a brief notification. Default 2500ms. Provided by `proto-nav.js` — no extra imports.

## Design notes panel

Always include at the bottom of the page, before scripts — see [[Design-Notes]] for how to write the content:

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

## Feedback panel

The feedback panel (💬 button in the context bar) provides in-context feedback with type selection, screenshot paste/drop, and mailto integration — see [[Feedback]] for the full pipeline. Fully styled via `.wf-fb-*` classes: `.wf-fb-overlay`, `.wf-fb-panel`, `.wf-fb-hd`, `.wf-fb-body`, `.wf-fb-type-pills`, `.wf-fb-textarea`, `.wf-fb-drop`, `.wf-fb-submit-btn`. Auto-closes after submission; ESC dismisses.

## Confidence levels

Use `data-wf-confidence` to communicate design certainty on individual elements — see [[Confidence-Levels]] for the full pattern.

```html
<div class="ds-card" data-wf-confidence="confirmed">...</div>
<div class="ds-card" data-wf-confidence="partial">...</div>
<div class="ds-card" data-wf-confidence="uncertain">...</div>
```

## Rules

- Use `wf-` prefixed components for anything shared across surfaces
- Use surface-specific components (`slack-`, `sfdc-`, `ds-`) for platform UI
- Don't duplicate: if `wf-card` works, don't make a custom card
- Buttons never need a surface prefix — `.btn-primary` works everywhere
- Toast and modal are JS functions from `proto-nav.js` — no extra imports

---

## Related

- [Live demo](components.html) — every primitive rendered interactively
- [[Design-Tokens]] — tokens that style these components
- [[Paper-Utilities]] — paper effect utility classes
- [[Confidence-Levels]] — per-element certainty
- [[Surfaces]] — platform-specific component overlays
- [[Design-Notes]] — the notes panel every page must include
