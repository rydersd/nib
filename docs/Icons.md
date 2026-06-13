# Icons

**Tags:** `pattern` · `icons`

How to use SVG icons in wireframes. Design-system-agnostic — works with any icon set.

> **Agent reference:** [`ref/icons.md`](../ref/icons.md) — base pattern. For SLDS icons specifically, see `ref/sfdc/icons.md`.

## Usage

```html
<svg class="wf-icon" viewBox="0 0 520 520" aria-hidden="true">
  <path d="..."/>
</svg>
```

## Sizes

| Class | Size | Use |
|---|---|---|
| `.wf-icon` | 16×16 (default) | Inline with text, buttons, badges |
| `.wf-icon-sm` | 12×12 | Compact tables, pills, metadata |
| `.wf-icon-lg` | 24×24 | Page headers, empty states, standalone |

## Color

Icons inherit `currentColor`. Tint by wrapping in a span with a [[Design-Tokens|token color]]:

```html
<span style="color: var(--wf-green)">
  <svg class="wf-icon" viewBox="0 0 520 520" aria-hidden="true">...</svg>
</span>
```

## Accessibility

- Decorative icons: `aria-hidden="true"` (most cases)
- Meaningful icons (no adjacent text): `role="img"` + `aria-label="Description"`

## Per-system catalogs

Paths live next to their design system so they can be copy-pasted:

| Design system | Catalog |
|---|---|
| Salesforce (SLDS) | [`ref/sfdc/icons.md`](../ref/sfdc/icons.md) |

Adding a new system: extract `viewBox` + `<path>`, create `ref/{system}/icons.md`, wrap in the `.wf-icon` pattern above.

---

## Related

- [[Design-Tokens]] — color tokens for icon tinting
- [[Components]] — where icons get used (buttons, badges, cards)
- [[Surface-Salesforce]] — SLDS-specific icon usage
