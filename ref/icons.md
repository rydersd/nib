# Icon Reference

> ⚠️ **Deprecated.** Edit [`docs/Icons.md`](../docs/Icons.md) instead. This file will be removed in a future release.

> How to use icons in wireframes. Design-system-agnostic — works with any SVG icon set.

## Usage Pattern

```html
<svg class="wf-icon" viewBox="0 0 520 520" aria-hidden="true">
  <path d="..."/>
</svg>
```

### Sizes

| Class | Size | Use |
|-------|------|-----|
| `.wf-icon` | 16×16 (default) | Inline with text, buttons, badges |
| `.wf-icon-sm` | 12×12 | Compact tables, pills, metadata |
| `.wf-icon-lg` | 24×24 | Page headers, empty states, standalone |

### Color

Icons inherit `currentColor` via `fill: currentColor`. To tint:

```html
<span style="color: var(--wf-green)">
  <svg class="wf-icon" viewBox="0 0 520 520" aria-hidden="true">...</svg>
</span>
```

### Accessibility

- Decorative icons: `aria-hidden="true"` (most cases)
- Meaningful icons (no adjacent text): add `role="img"` + `aria-label="Description"`

## Design-System-Specific Catalogs

Icon SVGs are organized by design system in subfolders:

| Design System | Catalog Location |
|---|---|
| Salesforce (SLDS) | `ref/sfdc/icons.md` |

Each catalog contains copy-paste-ready inline SVGs that work with the `.wf-icon` classes above.

## Adding Icons from a New System

1. Find the SVG sprite sheet or individual icon files (CDN, npm package, or docs site)
2. Extract the `<path>` data and `viewBox` from the `<symbol>` or `<svg>` element
3. Create a subfolder: `ref/{system}/icons.md`
4. Wrap in the `.wf-icon` pattern above — any SVG icon works with these CSS classes
