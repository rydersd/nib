# SLDS 2 Component Reference (Cosmos Theme)

> ⚠️ **Deprecated.** This content has not been migrated to the wiki yet — the closest page is [`docs/SLDS-Rules.md`](../docs/SLDS-Rules.md). This file will be removed in a future release.

> Extracted from SLDS 2 Storybook (`sds-site-docs-1fea39e7763a.herokuapp.com`) on 2026-03-16.
> Cross-referenced with `surface-salesforce-rules.md` for Nib token mappings.
> CSS definitions extracted from authored stylesheets with resolved custom property values.

## Purpose

Design system surface reference for proto-system polished fidelity.
Extensible pattern: same structure can be replicated for Material, Carbon, etc.

This file provides the CSS class names, CSS property definitions, ARIA attributes,
styling hooks, and variant lists for every SLDS 2 component. Agents building Salesforce
wireframes should consult this file alongside `surface-salesforce-rules.md` for layout
rules and `surface-salesforce.md` for the CSS implementation.

---

## Styling Hook Naming Convention

```
--[namespace]-[scope]-[category]-[property]-[role]-[state]-[range]
```

- **Global:** `--slds-g-[category]-[property]-[variant]`
- **Component:** `--slds-c-[component]-[property]-[variant]`

| Segment | Values | Example |
|---------|--------|---------|
| Namespace | `--slds` | Always |
| Scope | `g` (global), `c` (component) | `--slds-g-*`, `--slds-c-*` |
| Category | `color`, `font`, `spacing`, `shadow`, `radius`, `sizing` | `--slds-g-color-*` |
| Property | Specific aspect | `surface`, `border`, `accent` |
| Role | Semantic purpose | `container`, `on-surface`, `disabled` |
| Range | Scale level | `1`, `2`, `3`, `4` |

---

## Global Design Tokens

### Colors (Semantic)

| Role | Hex | SLDS Token | Nib Token |
|------|-----|-----------|-----------|
| Brand / Accent | `#0070D2` | SCIENCE_BLUE / `--slds-g-color-accent-1` | `--wf-accent` |
| Header bg | `#061C3F` | DEEP_COVE | (surface CSS) |
| Success | `#04844B` | SALEM / `--slds-g-color-success-1` | `--wf-green` |
| Warning text | `#844800` | CINNAMON / `--slds-g-color-warning-1` | `--wf-amber` |
| Warning bg | `#FF9A3C` | TANGERINE | (surface CSS) |
| Error | `#C23934` | FLUSH_MAHOGANY / `--slds-g-color-error-1` | `--wf-red` |
| Neutral text | `#7E8C99` | REGENT_GREY | `--wf-muted` |
| On-surface (primary) | `#181818` | `--slds-g-color-on-surface-1` | `--wf-ink` |
| Body text | `#444444` | `--slds-g-color-on-surface-2` | `--wf-text` |
| Border | `#C9C9C9` | `--slds-g-color-border-1` | `--wf-line` |
| Surface | `#F3F3F3` | `--slds-g-color-surface-container-1` | `--wf-surface` |
| Purple / Info | `#5A1BA9` | `--slds-g-color-info-1` | `--wf-purple` |

### Colors (Palette System)

11 families x 12 stops: Blue, Cloud Blue, Green, Hot Orange, Indigo, Orange, Pink, Purple, Red, Teal, Violet, Yellow, Neutral.

Shade range: 10 (darkest) through 95 (lightest).

```
neutral-base-10 -> neutral-base-100  (13 values: grays)
brand-base-10   -> brand-base-100    (13 values: primary brand)
error-base-10   -> error-base-100    (10 values: reds)
warning-base-10 -> warning-base-100  (10 values: ambers/oranges)
success-base-10 -> success-base-100  (10 values: greens)
```

### Typography

**Font stack (post Summer '21):**

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

NOTE: NOT Salesforce Sans (deprecated Summer '21). Nib `var(--wf-font)` already matches.

**Size scale:**

| Token | Size |
|-------|------|
| FONT_SIZE_1 | 10px |
| FONT_SIZE_2 | 11px |
| FONT_SIZE_3 | 12px |
| FONT_SIZE_4 | 13px |
| FONT_SIZE_5 | 14px |
| FONT_SIZE_6 | 16px |
| FONT_SIZE_7 | 18px |
| FONT_SIZE_8 | 20px |
| FONT_SIZE_9 | 24px |
| FONT_SIZE_10 | 32px |
| FONT_SIZE_11 | 42px |

### Spacing

| Token | Value |
|-------|-------|
| SPACING_XXX_SMALL | 2px |
| SPACING_XX_SMALL | 4px |
| SPACING_X_SMALL | 8px |
| SPACING_SMALL | 12px |
| SPACING_MEDIUM | 16px |
| SPACING_LARGE | 24px |
| SPACING_X_LARGE | 32px |
| SPACING_XX_LARGE | 48px |

### Border Radius

| Token | Value | Cosmos Usage |
|-------|-------|-------------|
| SMALL | 2px | Subtle rounding |
| MEDIUM | 4px | Inputs |
| LARGE | 8px | Cards |
| CIRCLE | 50% | Avatars |
| PILL | 15rem / 999px | Pill badges |

Cosmos defaults: cards = 8px, buttons = 6px, inputs = 4px.

### Shadow Scale

| Hook | Usage | Nib Equivalent |
|------|-------|---------------|
| `--slds-g-shadow-1` | Subtle card shadow | `var(--wf-paper-shadow)` |
| `--slds-g-shadow-2` | Elevated card (hover) | hover shadow |
| `--slds-g-shadow-3` | Modal overlay | modal shadow |
| `--slds-g-shadow-4` | Popover/dropdown | dropdown shadow |

---

## Components (A-Z)

### Accordion

- **Root:** `div.slds-accordion`
- **LWC:** `<lightning-accordion>`, `<lightning-accordion-section>`
- **Key CSS classes:**
  - `slds-accordion` -- root container
  - `slds-accordion__list-item` -- each section wrapper
  - `slds-accordion__section` -- section element
  - `slds-accordion__summary` -- header row
  - `slds-accordion__summary-heading` -- h2 wrapper
  - `slds-accordion__summary-action` -- toggle button
  - `slds-accordion__summary-content` -- title text
  - `slds-accordion__content` -- collapsible body
  - `slds-section` -- expandable section root
  - `slds-section__title` -- section title bar
  - `slds-section__title-action` -- clickable title
  - `slds-section__content` -- collapsible content
- **States:**
  - `.slds-is-open` -- section is expanded
- **ARIA:**
  - `aria-expanded="true|false"` on summary button
  - `aria-controls="[content-id]"` linking button to content
  - `aria-hidden="true|false"` on content div
  - `role="list"` on accordion, `role="listitem"` on sections
- **Styling hooks:**
  - `--slds-c-accordion-heading-color`
  - `--slds-c-accordion-heading-color-hover`
  - `--slds-c-accordion-heading-font-size`
  - `--slds-c-accordion-heading-font-lineheight`
  - `--slds-c-accordion-section-color-border`
  - `--slds-c-accordion-section-sizing-border`
  - `--slds-c-accordion-section-spacing-block-start`
  - `--slds-c-accordion-section-spacing-block-end`
  - `--slds-c-accordion-section-spacing-inline-start`
  - `--slds-c-accordion-section-spacing-inline-end`
  - `--slds-c-accordion-summary-color-background`
- **Variants:**
  - Base
  - Non-Collapsible
  - Closed
  - Section Heading With Truncation
  - Action Menu (with `slds-dropdown-trigger` per section)
  - Nested (accordion inside accordion)
  - Wrapped In Card (`slds-card` wrapper)
- **Nib mapping:** `.sfdc-card` with collapsible sections; no dedicated sfdc-accordion class yet.

#### CSS Definitions

`.slds-section__title` {
  display: flex;
  align-items: center;
  font-size: var(--slds-s-container-heading-var-font-size, var(--slds-g-font-scale-2)) /* = 1rem */;
  line-height: 1.875rem;
}

`.slds-section__content` {
  overflow-x: hidden;
  overflow-y: hidden;
  opacity: 0;
  height: 0px;
}

`.slds-section__title-action` {
  display: flex;
  align-items: center;
  background-color: var(--slds-g-color-surface-container-2) /* = light-dark(#f3f3f3, #181818) */;
  width: 100%;
  text-align: left;
  color: var(--slds-g-color-on-surface-3) /* = light-dark(#03234d, #d8e6fe) */;
  font-size: inherit;
  font-weight: var(--slds-s-container-heading-font-weight) /* = 400 */;
}

`.slds-section__title .slds-button` {
  --slds-c-button-radius-border: var(--slds-g-radius-border-2) /* = 0.5rem */;
}

`.slds-is-open > .slds-accordion__content` {
  overflow-x: visible;
  overflow-y: visible;
  opacity: 1;
  height: auto;
  color: var(--slds-g-color-on-surface-1) /* = light-dark(#5c5c5c, #aeaeae) */;
}

`.slds-section.slds-is-open .slds-section__content` {
  padding-top: var(--slds-g-spacing-2) /* = 0.5rem */;
  overflow-x: visible;
  overflow-y: visible;
  opacity: 1;
  height: auto;
  color: var(--slds-g-color-on-surface-1) /* = light-dark(#5c5c5c, #aeaeae) */;
}

`.slds-button` {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding-block-start: var(--slds-c-button-spacing-block-start);
  padding-inline-end: var(--slds-c-button-spacing-inline-end);
  padding-block-end: var(--slds-c-button-spacing-block-end);
  padding-inline-start: var(--slds-c-button-spacing-inline-start);
  background-color: var(--slds-c-button-color-background);
  box-shadow: var(--slds-c-button-shadow, var(--slds-s-button-shadow));
  line-height: 1.875rem;
  color: var(--slds-c-button-text-color, var(--slds-s-button-color, var(--slds-g-color-accent-2))) /* = light-dark(#0250d9, #7cb1fe) */;
  font-weight: var(--slds-c-button-font-weight, var(--slds-g-font-weight-4)) /* = 400 */;
  vertical-align: middle;
}

`.slds-button + .slds-button` {
  margin-inline-start: var(--slds-g-spacing-1) /* = 0.25rem */;
}

`.slds-button[disabled], .slds-button:disabled` {
  background-color: transparent;
  border-top-color: transparent;
  border-right-color: transparent;
  border-bottom-color: transparent;
  border-left-color: transparent;
  color: var(--slds-g-color-disabled-1) /* = #757575 */;
}

`.slds-modal__footer .slds-button + .slds-button` {
  margin-inline-start: var(--slds-g-spacing-2) /* = 0.5rem */;
}

`.slds-button-group-row .slds-button-group-item .slds-button` {
  margin-top: 0px;
  margin-right: 0px;
  margin-bottom: 0px;
  margin-left: 0px;
}


#### Resolved Tokens

| Token | Value |
|-------|-------|
| `--slds-g-color-accent-2` | `light-dark(#0250d9, #7cb1fe)` |
| `--slds-g-color-disabled-1` | `#757575` |
| `--slds-g-color-neutral-base-100` | `light-dark(#fff, #000)` |
| `--slds-g-color-on-surface-1` | `light-dark(#5c5c5c, #aeaeae)` |
| `--slds-g-color-on-surface-3` | `light-dark(#03234d, #d8e6fe)` |
| `--slds-g-color-surface-container-2` | `light-dark(#f3f3f3, #181818)` |
| `--slds-g-font-scale-2` | `1rem` |
| `--slds-g-font-weight-4` | `400` |
| `--slds-g-radius-border-2` | `0.5rem` |
| `--slds-g-shadow-inset-focus-1` | `0px 0px 0px 2px light-dark(#001e5b, #c2daff) inset` |
| `--slds-g-shadow-outset-focus-1` | `0px 0px 0px 2px light-dark(#fff, #000), 0px 0px 0px 4px light-dark(#001e5b, #c2daff)` |
| `--slds-g-sizing-3` | `0.5rem` |
| `--slds-g-sizing-4` | `0.75rem` |
| `--slds-g-sizing-7` | `1.5rem` |
| `--slds-g-spacing-1` | `0.25rem` |
| `--slds-g-spacing-2` | `0.5rem` |
| `--slds-g-spacing-3` | `0.75rem` |
| `--slds-g-spacing-5` | `1.5rem` |
| `--slds-s-container-heading-font-weight` | `400` |
| `--slds-s-navigation-font-weight` | `600` |


---

### Badge

- **Root:** `span.slds-badge`
- **LWC:** `<lightning-badge>`
- **Key CSS classes:**
  - `slds-badge` -- base badge
  - `slds-badge_inverse` -- dark background variant
  - `slds-badge_lightest` -- light/subtle variant
  - `slds-badge__icon` -- icon container inside badge
  - `slds-badge__icon_left` / `slds-badge__icon_right` -- icon position
  - `slds-theme_info` -- info theme (blue)
  - `slds-theme_success` -- success theme (green)
  - `slds-theme_error` -- error theme (red)
  - `slds-theme_warning` -- warning theme (amber)
- **States:**
  - Theme classes control color variants.
- **ARIA:**
  - `aria-hidden="true"` on decorative icons.
- **Styling hooks:**
  - `--slds-c-badge-color-background`
  - `--slds-c-badge-color-border`
  - `--slds-c-badge-font-size`
  - `--slds-c-badge-icon-color-foreground`
  - `--slds-c-badge-icon-inverse-color-foreground`
  - `--slds-c-badge-inverse-color-background`
  - `--slds-c-badge-inverse-text-color`
  - `--slds-c-badge-lightest-color-background`
  - `--slds-c-badge-lightest-color-border`
  - `--slds-c-badge-radius-border`
  - `--slds-c-badge-sizing-border`
  - `--slds-c-badge-text-color`
- **Variants:**
  - Base
  - Base With Left Icon
  - Base With Right Icon
  - Inverse
  - Light (lightest)
  - Info
  - Success
  - Error
  - Warning
  - With Child Element
- **Nib mapping:** `wf-badge`, `wf-badge-green`, `wf-badge-amber`, `wf-badge-red`, `wf-badge-purple`.

#### CSS Definitions

`.slds-badge` {
  display: inline-flex;
  align-items: center;
  color: var(--slds-c-badge-text-color, var(--slds-g-color-on-surface-1)) /* = light-dark(#5c5c5c, #aeaeae) */;
  font-size: var(--slds-c-badge-font-size, var(--slds-g-font-scale-neg-1)) /* = 0.75rem */;
  font-weight: var(--slds-g-font-weight-4) /* = 400 */;
  line-height: normal;
  background-color: var(--slds-c-badge-color-background, var(--slds-g-color-surface-container-3)) /* = light-dark(#e5e5e5, #2e2e2e) */;
}

`.slds-badge:empty` {
  padding-top: 0px;
  padding-right: 0px;
  padding-bottom: 0px;
  padding-left: 0px;
}

`.slds-badge + .slds-badge` {
  margin-inline-start: var(--slds-g-spacing-2) /* = 0.5rem */;
}

`.slds-popover_dark .slds-badge, .slds-popover--dark .slds-badge` {
  background-color: var(--slds-g-color-surface-container-1) /* = light-dark(#fff, #242424) */;
}

`[lwc-54j1ecj2k1t-host]:not(:first-of-type).slds-badge[data-render-mode="shadow"]` {
  margin-inline-start: var(--slds-g-spacing-2, 0.5rem);
}


#### Resolved Tokens

| Token | Value |
|-------|-------|
| `--slds-g-color-on-surface-1` | `light-dark(#5c5c5c, #aeaeae)` |
| `--slds-g-color-surface-container-1` | `light-dark(#fff, #242424)` |
| `--slds-g-color-surface-container-3` | `light-dark(#e5e5e5, #2e2e2e)` |
| `--slds-g-font-scale-neg-1` | `0.75rem` |
| `--slds-g-font-weight-4` | `400` |
| `--slds-g-spacing-2` | `0.5rem` |


---

### Button

- **Root:** `button.slds-button`
- **LWC:** `<lightning-button>`
- **Key CSS classes:**
  - `slds-button` -- base (looks like a link)
  - `slds-button_neutral` -- outlined secondary
  - `slds-button_brand` -- filled primary (accent bg)
  - `slds-button_outline-brand` -- brand outline
  - `slds-button_inverse` -- for dark backgrounds
  - `slds-button_destructive` -- filled red
  - `slds-button_text-destructive` -- text-only red
  - `slds-button_success` -- filled green
  - `slds-button_stretch` -- full-width stretching
  - `slds-button_full-width` -- full container width
  - `slds-button__icon` -- icon inside button
  - `slds-button__icon_left` -- icon on left side
- **States:**
  - `aria-disabled="true|false"`
  - `:focus-visible` -- 2px solid accent outline
- **ARIA:**
  - `aria-disabled="false"` on interactive buttons.
- **Styling hooks:**
  - `--slds-c-button-brand-color-background` / `-hover` / `-active` / `-focus`
  - `--slds-c-button-brand-color-border` / `-hover` / `-active` / `-focus`
  - `--slds-c-button-brand-text-color` / `-hover` / `-active`
  - `--slds-c-button-neutral-color-background` / `-hover` / `-active` / `-focus`
  - `--slds-c-button-neutral-color-border` / `-hover` / `-active` / `-focus`
  - `--slds-c-button-neutral-text-color` / `-hover` / `-active` / `-focus`
  - `--slds-c-button-neutral-shadow` / `-focus`
  - `--slds-c-button-destructive-color` / `-background` / `-border` / `-hover`
  - `--slds-c-button-success-color` / `-background` / `-border` / `-hover`
  - `--slds-c-button-inverse-color-background` / `-border` / `-hover`
  - `--slds-c-button-inverse-text-color` / `-hover` / `-active`
  - `--slds-c-button-radius-border`
  - `--slds-c-button-spacing-inline` / `-start` / `-end`
  - `--slds-c-button-spacing-block-start` / `-end`
  - `--slds-c-button-font-weight`
  - `--slds-c-button-shadow` / `-focus`
  - `--slds-c-button-sizing-border`
  - `--slds-c-button-text-color` / `-hover` / `-active`
  - `--slds-c-button-color-background` / `-hover` / `-active`
  - `--slds-c-button-color-border` / `-hover` / `-active`
- **Variants:**
  - Base (link-style)
  - Neutral (outlined)
  - Brand (filled primary)
  - Brand Outline
  - Inverse
  - Destructive (filled red)
  - Destructive Text
  - Success (filled green)
  - Stretch
  - Full Width
- **Nib mapping:** `.sfdc-btn` (neutral), `.sfdc-btn-primary` (brand), `.sfdc-btn-sm` (small).

#### CSS Definitions

`.slds-button` {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding-block-start: var(--slds-c-button-spacing-block-start);
  padding-inline-end: var(--slds-c-button-spacing-inline-end);
  padding-block-end: var(--slds-c-button-spacing-block-end);
  padding-inline-start: var(--slds-c-button-spacing-inline-start);
  background-color: var(--slds-c-button-color-background);
  box-shadow: var(--slds-c-button-shadow, var(--slds-s-button-shadow));
  line-height: 1.875rem;
  color: var(--slds-c-button-text-color, var(--slds-s-button-color, var(--slds-g-color-accent-2))) /* = light-dark(#0250d9, #7cb1fe) */;
  font-weight: var(--slds-c-button-font-weight, var(--slds-g-font-weight-4)) /* = 400 */;
  vertical-align: middle;
}

`.slds-button a` {
  --slds-c-button-text-color: currentColor;
}

`.slds-button:focus-visible` {
  box-shadow: var(--slds-c-button-shadow-focus, var(--slds-g-shadow-outline-focus-1)) /* = 0px 0px 0px 2px light-dark(#001e5b, #c2daff) */;
  color: var( --slds-c-button-text-color-hover, var(--slds-s-button-color-hover, var(--slds-g-color-accent-3)) ) /* = light-dark(#022ac0, #a8cbff) */;
  --slds-c-button-color-border: transparent;
}

`.slds-button + .slds-button` {
  margin-inline-start: var(--slds-g-spacing-1) /* = 0.25rem */;
}

`.slds-tree__item .slds-button` {
  margin-block-start: 2px;
}

`.slds-section__title .slds-button` {
  --slds-c-button-radius-border: var(--slds-g-radius-border-2) /* = 0.5rem */;
}

`.slds-picklist__input .slds-button` {
  line-height: 0;
}

`.slds-publisher__actions > .slds-button` {
  margin-inline-start: var(--slds-g-spacing-3) /* = 0.75rem */;
}

`.slds-docked-composer__footer .slds-button` {
  justify-content: center;
}

`.slds-docked-composer__actions .slds-button` {
  margin-inline-start: var(--slds-g-spacing-3) /* = 0.75rem */;
}

`.slds-button[disabled], .slds-button:disabled` {
  background-color: transparent;
  border-top-color: transparent;
  border-right-color: transparent;
  border-bottom-color: transparent;
  border-left-color: transparent;
  color: var(--slds-g-color-disabled-1) /* = #757575 */;
}

`.slds-modal__footer .slds-button + .slds-button` {
  margin-inline-start: var(--slds-g-spacing-2) /* = 0.5rem */;
}

`.slds-dueling-list__column .slds-button:first-of-type` {
  margin-top: var(--slds-g-spacing-5) /* = 1.5rem */;
}

`.slds-button-group-row .slds-button-group-item .slds-button` {
  margin-top: 0px;
  margin-right: 0px;
  margin-bottom: 0px;
  margin-left: 0px;
}

`.slds-accordion__summary-heading .slds-button:focus-visible` {
  box-shadow: var(--slds-g-shadow-inset-focus-1) /* = 0px 0px 0px 2px light-dark(#001e5b, #c2daff) inset */;
  margin-inline-end: var(--slds-c-accordion-section-spacing-inline-end, revert);
}

`.slds-button-group .slds-button, .slds-button-group-list .slds-button` {
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
  border-bottom-left-radius: 0px;
}

`.slds-button + .slds-button-group, .slds-button + .slds-button-group-list` {
  margin-inline-start: var(--slds-g-spacing-1) /* = 0.25rem */;
}

`.slds-tabs_scoped__overflow-button .slds-button, .slds-tabs--scoped__overflow-button .slds-button` {
  line-height: inherit;
  color: var(--slds-s-navigation-color, var(--slds-g-color-on-surface-1)) /* = light-dark(#5c5c5c, #aeaeae) */;
  padding-block-start: 0px;
  padding-block-end: 0px;
  font-weight: var(--slds-s-navigation-font-weight) /* = 600 */;
  --slds-c-button-color-background-hover: transparent;
  --slds-c-button-shadow-focus: none;
  --slds-c-button-radius-border: 0;
}

`.slds-button-group .slds-button:focus-visible, .slds-button-group-list .slds-button:focus-visible` {
  --slds-c-button-shadow-focus: none;
}

`.slds-button-group .slds-button + .slds-button, .slds-button-group-list .slds-button + .slds-button` {
  margin-inline-start: 0px;
}


#### Resolved Tokens

| Token | Value |
|-------|-------|
| `--slds-g-color-accent-2` | `light-dark(#0250d9, #7cb1fe)` |
| `--slds-g-color-accent-3` | `light-dark(#022ac0, #a8cbff)` |
| `--slds-g-color-disabled-1` | `#757575` |
| `--slds-g-color-neutral-base-100` | `light-dark(#fff, #000)` |
| `--slds-g-color-on-surface-1` | `light-dark(#5c5c5c, #aeaeae)` |
| `--slds-g-font-weight-4` | `400` |
| `--slds-g-radius-border-2` | `0.5rem` |
| `--slds-g-shadow-inset-focus-1` | `0px 0px 0px 2px light-dark(#001e5b, #c2daff) inset` |
| `--slds-g-shadow-outline-focus-1` | `0px 0px 0px 2px light-dark(#001e5b, #c2daff)` |
| `--slds-g-shadow-outset-focus-1` | `0px 0px 0px 2px light-dark(#fff, #000), 0px 0px 0px 4px light-dark(#001e5b, #c2daff)` |
| `--slds-g-spacing-1` | `0.25rem` |
| `--slds-g-spacing-2` | `0.5rem` |
| `--slds-g-spacing-3` | `0.75rem` |
| `--slds-g-spacing-5` | `1.5rem` |
| `--slds-s-navigation-font-weight` | `600` |


---

### Card

- **Root:** `article.slds-card`
- **LWC:** `<lightning-card>`
- **Key CSS classes:**
  - `slds-card` -- root article element
  - `slds-card__header` -- header container (flex grid)
  - `slds-card__header-title` -- title h2
  - `slds-card__header-link` -- clickable title
  - `slds-card__body` -- main content area
  - `slds-card__body_inner` -- inner padding
  - `slds-card__footer` -- footer area
  - `slds-card__footer-action` -- footer link
  - `slds-card_boundary` -- bordered variant
  - `slds-card-wrapper` -- wrapper for multiple cards
  - `slds-card__tile` -- tile layout inside card
- **States:**
  - `.slds-is-active` -- active card
  - `.slds-is-open` -- expanded state (for nested accordions)
- **ARIA:**
  - `aria-label` on embedded tables
  - `aria-disabled="false"` on action buttons
  - Standard heading hierarchy (h2 inside header)
- **Styling hooks:**
  - `--slds-c-card-color-background`
  - `--slds-c-card-color-border`
  - `--slds-c-card-radius-border`
  - `--slds-c-card-shadow`
  - `--slds-c-card-sizing-border`
  - `--slds-c-card-text-color`
  - `--slds-c-card-heading-font-size`
  - `--slds-c-card-heading-font-weight`
  - `--slds-c-card-header-spacing-block` / `-start` / `-end`
  - `--slds-c-card-header-spacing-inline` / `-start` / `-end`
  - `--slds-c-card-body-spacing-block` / `-start` / `-end`
  - `--slds-c-card-body-spacing-inline` / `-start` / `-end`
  - `--slds-c-card-footer-color-border`
  - `--slds-c-card-footer-font-size`
  - `--slds-c-card-footer-sizing-border`
  - `--slds-c-card-footer-spacing-block` / `-start` / `-end`
  - `--slds-c-card-footer-spacing-inline` / `-start` / `-end`
- **Variants:**
  - Base (icon + title + actions + body + footer)
  - No Header Icon
  - No Header
  - No Footer
  - No Padding
  - Wrapped Cards (multiple cards in wrapper)
  - Nested Cards
  - Related List (with data table)
  - Collapsed
  - Empty Illustration
  - Loading (with spinner)
  - Data Table (table inside card)
  - Data Tiles (tile layout)
- **Nib mapping:** `.sfdc-card`, `.sfdc-card-header`, `.sfdc-card-body`, `.sfdc-card` + accent variants (`-accent`, `-green`, `-amber`, `-red`, `-purple`).

#### CSS Definitions

`.slds-subtheme-agentic .slds-card::before, .slds-subtheme-agentic .slds-card::after` {
  display: block;
  position: absolute;
  z-index: -1;
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  border-bottom-right-radius: inherit;
  border-bottom-left-radius: inherit;
  opacity: 0;
}

`.slds-subtheme-agentic:has(> .slds-card), .slds-subtheme-agentic :has(> .slds-card)` {
  position: relative;
  z-index: 1;
  display: block;
}

`.slds-card-wrapper .slds-card__header, /* +2 more */` {
  padding-inline-start: 0px;
  padding-inline-end: 0px;
}

`.slds-tabs_card .slds-card__header, /* +3 more */` {
  padding-block-start: 0px;
}

`.slds-tabs_card .slds-card, /* +7 more */` {
  padding-inline-start: 0px;
  padding-inline-end: 0px;
}

`.slds-tabs_card .slds-card_boundary .slds-card__header, /* +5 more */` {
  padding-block-start: var( --slds-c-card-header-spacing-block-start, var(--slds-c-card-header-spacing-block, var(--slds-g-spacing-var-block-3)) ) /* = 0.75rem */;
  padding-inline-end: var( --slds-c-card-header-spacing-inline-end, var(--slds-c-card-header-spacing-inline, var(--slds-g-spacing-var-inline-4)) ) /* = 1rem */;
  padding-block-end: var( --slds-c-card-header-spacing-block-end, var(--slds-c-card-header-spacing-block, 0) );
  padding-inline-start: var( --slds-c-card-header-spacing-inline-start, var(--slds-c-card-header-spacing-inline, var(--slds-g-spacing-var-inline-4)) ) /* = 1rem */;
}

`.slds-tabs_card .slds-card_boundary .slds-card__footer, /* +5 more */` {
  padding-block-start: var( --slds-c-card-footer-spacing-block-start, var(--slds-c-card-footer-spacing-block, var(--slds-g-spacing-var-block-3)) ) /* = 0.75rem */;
  padding-inline-end: var( --slds-c-card-footer-spacing-inline-end, var(--slds-c-card-footer-spacing-inline, var(--slds-g-spacing-var-inline-4)) ) /* = 1rem */;
  padding-block-end: var( --slds-c-card-footer-spacing-block-end, var(--slds-c-card-footer-spacing-block, var(--slds-g-spacing-var-block-3)) ) /* = 0.75rem */;
  padding-inline-start: var( --slds-c-card-footer-spacing-inline-start, var(--slds-c-card-footer-spacing-inline, var(--slds-g-spacing-var-inline-4)) ) /* = 1rem */;
}

`.slds-tabs_card .slds-card_boundary .slds-card__body_inner, /* +5 more */` {
  padding-top: 0px;
  padding-right: 0px;
  padding-bottom: 0px;
  padding-left: 0px;
  padding-inline-end: var( --slds-c-card-body-spacing-inline-end, var(--slds-c-card-body-spacing-inline, var(--slds-g-spacing-var-inline-4)) ) /* = 1rem */;
  padding-inline-start: var( --slds-c-card-body-spacing-inline-start, var(--slds-c-card-body-spacing-inline, var(--slds-g-spacing-var-inline-4)) ) /* = 1rem */;
}

`.slds-tabs_card .slds-card__header, /* +11 more */` {
  padding-inline-start: 0px;
  padding-inline-end: 0px;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
}

`.slds-region__pinned-left .slds-card, /* +11 more */` {
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
  border-bottom-left-radius: 0px;
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 0px;
  border-left-width: 0px;
  border-top-color: initial;
  border-right-color: initial;
  border-bottom-color: initial;
  border-left-color: initial;
  box-shadow: none;
}

`.slds-card .slds-card, /* +17 more */` {
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 0px;
  border-left-width: 0px;
  border-top-color: initial;
  border-right-color: initial;
  border-bottom-color: initial;
  border-left-color: initial;
  box-shadow: none;
}

`.slds-button` {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding-block-start: var(--slds-c-button-spacing-block-start);
  padding-inline-end: var(--slds-c-button-spacing-inline-end);
  padding-block-end: var(--slds-c-button-spacing-block-end);
  padding-inline-start: var(--slds-c-button-spacing-inline-start);
  background-color: var(--slds-c-button-color-background);
  box-shadow: var(--slds-c-button-shadow, var(--slds-s-button-shadow));
  line-height: 1.875rem;
  color: var(--slds-c-button-text-color, var(--slds-s-button-color, var(--slds-g-color-accent-2))) /* = light-dark(#0250d9, #7cb1fe) */;
  font-weight: var(--slds-c-button-font-weight, var(--slds-g-font-weight-4)) /* = 400 */;
  vertical-align: middle;
}

`.slds-button[disabled], .slds-button:disabled` {
  background-color: transparent;
  border-top-color: transparent;
  border-right-color: transparent;
  border-bottom-color: transparent;
  border-left-color: transparent;
  color: var(--slds-g-color-disabled-1) /* = #757575 */;
}

`.slds-image__title .slds-media, .slds-file__title .slds-media` {
  overflow-x: hidden;
  overflow-y: hidden;
}

`.slds-button-group .slds-button, .slds-button-group-list .slds-button` {
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
  border-bottom-left-radius: 0px;
}

`.slds-lookup__item-action_label > .slds-icon, .slds-lookup__item-action--label > .slds-icon` {
  margin-inline-start: var(--slds-g-spacing-1) /* = 0.25rem */;
  margin-inline-end: var(--slds-g-spacing-3) /* = 0.75rem */;
}


#### Resolved Tokens

| Token | Value |
|-------|-------|
| `--slds-g-color-accent-2` | `light-dark(#0250d9, #7cb1fe)` |
| `--slds-g-color-border-1` | `light-dark(#c9c9c9, #444)` |
| `--slds-g-color-disabled-1` | `#757575` |
| `--slds-g-color-disabled-container-1` | `light-dark(#e5e5e5, #2e2e2e)` |
| `--slds-g-color-neutral-base-100` | `light-dark(#fff, #000)` |
| `--slds-g-color-on-disabled-1` | `#757575` |
| `--slds-g-color-on-surface-1` | `light-dark(#5c5c5c, #aeaeae)` |
| `--slds-g-color-on-surface-inverse-1` | `light-dark(#fff, #181818)` |
| `--slds-g-color-surface-container-2` | `light-dark(#f3f3f3, #181818)` |
| `--slds-g-font-scale-neg-2` | `0.625rem` |
| `--slds-g-font-weight-4` | `400` |
| `--slds-g-shadow-inset-focus-1` | `0px 0px 0px 2px light-dark(#001e5b, #c2daff) inset` |
| `--slds-g-shadow-outset-focus-1` | `0px 0px 0px 2px light-dark(#fff, #000), 0px 0px 0px 4px light-dark(#001e5b, #c2daff)` |
| `--slds-g-sizing-5` | `1rem` |
| `--slds-g-sizing-6` | `1.25rem` |
| `--slds-g-spacing-1` | `0.25rem` |
| `--slds-g-spacing-2` | `0.5rem` |
| `--slds-g-spacing-3` | `0.75rem` |
| `--slds-g-spacing-var-block-3` | `0.75rem` |
| `--slds-g-spacing-var-inline-4` | `1rem` |
| `--slds-s-navigation-font-weight` | `600` |


---

### Combobox

- **Root:** `div.slds-combobox_container`
- **LWC:** `<lightning-combobox>`, `<lightning-base-combobox>`
- **Key CSS classes:**
  - `slds-combobox_container` -- outer wrapper
  - `slds-combobox` -- inner combobox
  - `slds-combobox__form-element` -- input wrapper
  - `slds-combobox__input` -- the button/input element
  - `slds-combobox__input-value` -- selected value display
  - `slds-dropdown` -- dropdown container
  - `slds-dropdown_fluid` -- full-width dropdown
  - `slds-dropdown_length-5` / `_length-with-icon-7` -- height limits
  - `slds-listbox` / `slds-listbox_vertical` -- option list
  - `slds-listbox__option` -- single option
  - `slds-listbox__option_entity` -- entity-type option
  - `slds-listbox__option-text` -- text display
  - `slds-listbox__option-meta` -- secondary text
  - `slds-listbox__option-icon` -- option icon
  - `slds-input_faux` -- faux input display
- **States:**
  - `.slds-is-open` -- dropdown visible
  - `.slds-is-disabled` -- disabled
  - `.slds-has-focus` -- focused
  - `.slds-has-selection` -- value selected
- **ARIA:**
  - `role="combobox"` on the input/button
  - `role="listbox"` on the dropdown
  - `role="option"` on each option
  - `aria-expanded="true|false"`
  - `aria-haspopup="listbox"`
  - `aria-activedescendant="[option-id]"`
  - `aria-autocomplete="list"` (for typeahead)
  - `aria-selected="true"` on selected options
  - `aria-controls="[dropdown-id]"`
- **Variants:**
  - Base (single select picklist)
  - Disabled
  - Required
  - Grouped Combobox Closed / Open
  - Picklist Multiple Selection
  - Lookup Closed / Open / Single / Multiple Selection / Typeahead
- **Nib mapping:** Standard `<select>` or custom dropdowns in wireframes. No dedicated sfdc-combobox class.

#### CSS Definitions

`.slds-dropdown` {
  position: absolute;
  z-index: 7000;
  left: 50%;
  min-width: calc(var(--slds-g-sizing-5) * 6) /* = 1rem */;
  max-width: var(--slds-g-sizing-15) /* = 20rem */;
  width: max-content;
  margin-block-start: calc(var(--slds-g-spacing-1) / 2) /* = 0.25rem */;
  margin-block-end: calc(var(--slds-g-spacing-1)) / 2 /* = 0.25rem */;
  padding-inline-start: 0px;
  padding-inline-end: 0px;
  font-size: var(--slds-g-font-scale-neg-1) /* = 0.75rem */;
  background-color: var(--slds-g-color-surface-container-1) /* = light-dark(#fff, #242424) */;
  box-shadow: var(--slds-g-shadow-2) /* = 0px 0px 5px 0px light-dark(#00000029, #00000052), 0px 3px 3px 0px light-dark(#00000029, #00000052), 0px -1px 2px 0px light-dark(#00000017, #0000002e) */;
  color: var(--slds-g-color-on-surface-2) /* = light-dark(#2e2e2e, #e5e5e5) */;
}

`.slds-combobox__input:focus-visible, .slds-combobox__input.slds-has-focus` {
  box-shadow: var(--slds-g-shadow-outline-focus-1) /* = 0px 0px 0px 2px light-dark(#001e5b, #c2daff) */;
  border-top-color: transparent;
  border-right-color: transparent;
  border-bottom-color: transparent;
  border-left-color: transparent;
}

`.slds-listbox_selection-group .slds-listbox, .slds-listbox--selection-group .slds-listbox` {
  padding-block-start: 0px;
  padding-block-end: 0.125rem;
  padding-inline-start: 0px;
  padding-inline-end: 0px;
}

`.slds-has-inline-listbox .slds-combobox__input, .slds-has-object-switcher .slds-combobox__input` {
  min-height: 100%;
  line-height: calc(var(--slds-g-sizing-9) - 4px) /* = 2rem */;
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 0px;
  border-left-width: 0px;
  border-top-color: initial;
  border-right-color: initial;
  border-bottom-color: initial;
  border-left-color: initial;
  padding-block-start: 0.125rem;
  padding-block-end: 0.125rem;
}

`.slds-combobox_container.slds-is-open .slds-dropdown, /* +1 more */` {
  display: block;
}

`.slds-dropdown-trigger_click.slds-is-open .slds-dropdown, /* +1 more */` {
  display: block;
  opacity: 1;
}

`[lwc-4kb6kaqheak-host].slds-is-open.slds-dropdown-trigger_click[data-render-mode="shadow"] .slds-dropdown[lwc-4kb6kaqheak], /* +1 more */` {
  display: block;
  opacity: 1;
}

`.slds-input-has-icon_left .slds-combobox__input[value], /* +7 more */` {
  padding-inline-start: calc(var(--slds-g-sizing-7) + var(--slds-g-spacing-3)) /* = 1.5rem */;
}

`.slds-input__icon` {
  --_slds-c-icon-sizing: calc(var(--slds-g-sizing-1) + var(--slds-g-sizing-4)) /* = 0.125rem */;
  position: absolute;
  top: 50%;
  margin-block-start: -0.4375rem;
  line-height: var(--slds-g-font-lineheight-1) /* = 1 */;
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 0px;
  border-left-width: 0px;
  border-top-color: initial;
  border-right-color: initial;
  border-bottom-color: initial;
  border-left-color: initial;
  z-index: 2;
}

`.slds-input-has-icon .slds-input__icon` {
  width: 0.875rem;
  height: 0.875rem;
  position: absolute;
  top: 50%;
  margin-top: -0.4375rem;
  line-height: 1;
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 0px;
  border-left-width: 0px;
  border-top-color: initial;
  border-right-color: initial;
  border-bottom-color: initial;
  border-left-color: initial;
  z-index: 2;
}

`.slds-input-has-icon lightning-button-icon.slds-input__icon` {
  line-height: normal;
  width: auto;
  height: auto;
  margin-block-start: 0px;
}

`[lwc-ce9l7grm4d-host][data-render-mode="shadow"] .slds-input__icon[lwc-ce9l7grm4d]` {
  --slds-c-icon-sizing: calc(var(--slds-g-sizing-1, 0.125rem) + var(--slds-g-sizing-4, 0.75rem));
  position: absolute;
  top: 50%;
  margin-block-start: -0.4375rem;
  line-height: var(--slds-g-font-lineheight-1, 1);
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 0px;
  border-left-width: 0px;
  border-top-color: initial;
  border-right-color: initial;
  border-bottom-color: initial;
  border-left-color: initial;
  z-index: 2;
}

`.slds-form_compound > .slds-form-element, .slds-form--compound > .slds-form-element` {
  margin-block-start: 0px;
  margin-block-end: 0px;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
}


#### Resolved Tokens

| Token | Value |
|-------|-------|
| `--slds-g-color-on-surface-2` | `light-dark(#2e2e2e, #e5e5e5)` |
| `--slds-g-color-surface-container-1` | `light-dark(#fff, #242424)` |
| `--slds-g-font-lineheight-1` | `1` |
| `--slds-g-font-scale-neg-1` | `0.75rem` |
| `--slds-g-font-scale-neg-2` | `0.625rem` |
| `--slds-g-shadow-2` | `0px 0px 5px 0px light-dark(#00000029, #00000052), 0px 3px 3px 0px light-dark(#00000029, #00000052), 0px -1px 2px 0px light-dark(#00000017, #0000002e)` |
| `--slds-g-shadow-outline-focus-1` | `0px 0px 0px 2px light-dark(#001e5b, #c2daff)` |
| `--slds-g-sizing-1` | `0.125rem` |
| `--slds-g-sizing-15` | `20rem` |
| `--slds-g-sizing-3` | `0.5rem` |
| `--slds-g-sizing-4` | `0.75rem` |
| `--slds-g-sizing-5` | `1rem` |
| `--slds-g-sizing-7` | `1.5rem` |
| `--slds-g-sizing-9` | `2rem` |
| `--slds-g-spacing-1` | `0.25rem` |
| `--slds-g-spacing-2` | `0.5rem` |
| `--slds-g-spacing-3` | `0.75rem` |
| `--slds-g-spacing-6` | `2rem` |


---

### Data Table

- **Root:** `table.slds-table`
- **LWC:** `<lightning-datatable>`
- **Key CSS classes:**
  - `slds-table` -- base table
  - `slds-table_bordered` -- bordered rows
  - `slds-table_cell-buffer` -- cell padding
  - `slds-table_fixed-layout` -- fixed column widths
  - `slds-table_striped` -- alternating row colors
  - `slds-table_col-bordered` -- column dividers
  - `slds-table_resizable-cols` -- resizable columns
  - `slds-table_header-fixed` -- sticky header
  - `slds-table_header-hidden` -- headless table
  - `slds-table_edit` -- inline edit mode
  - `slds-th__action` -- sortable header action
  - `slds-is-sortable` -- sortable column
  - `slds-is-sortable__icon` -- sort direction icon
  - `slds-cell-edit` -- editable cell
  - `slds-cell-wrap` -- text wrapping cell
  - `slds-row-number` -- row number column
  - `slds-line-clamp` -- multi-line truncation
- **States:**
  - `.slds-has-error` -- row/cell error
  - `.slds-is-sorted_asc` -- sort direction
  - `aria-selected="true"` -- row selected
- **ARIA:**
  - `role="grid"` implicit on table
  - `aria-multiselectable="true"` -- multi-row select
  - `aria-sort="none|other"` -- sort state
  - `aria-selected="true|false"` -- row selection
  - `aria-readonly="true|false"` -- edit state
  - `aria-label` -- table description
- **Variants:**
  - Base
  - With Sorting
  - With Inline Edit
  - Headless (hidden headers)
  - With Row Actions
  - With Row Numbers
  - With Text Wrapping
  - With Striped Rows
  - With Column Dividers
- **Nib mapping:** `.sfdc-table`, header row uses surface bg + uppercase labels.

#### CSS Definitions

`.slds-table_tree .slds-button:not(.slds-th__action-button), /* +1 more */` {
  margin-block-start: 0px;
}

`.slds-table th:focus-visible, /* +3 more */` {
  box-shadow: var(--slds-g-shadow-insetinverse-focus-1) /* = 0px 0px 0px 2px light-dark(#001e5b, #c2daff) inset, 0px 0px 0px 4px light-dark(#fff, #000) inset */;
}

`.slds-table th:focus-visible:has(:focus-visible), /* +3 more */` {
  box-shadow: none;
}

`.slds-hint-parent .slds-cell-edit .slds-button__icon_edit, /* +3 more */` {
  opacity: 0;
}

`.slds-table .slds-cell-edit.slds-has-focus .slds-button__icon_edit, /* +3 more */` {
  opacity: 1;
}

`[lwc-ssv0jn7orr-host][data-render-mode="shadow"] .slds-table_tree[lwc-ssv0jn7orr] .slds-button:not(.slds-th__action-button)[lwc-ssv0jn7orr], /* +1 more */` {
  margin-block-start: 0px;
}

`.slds-table_resizable-cols thead th:last-of-type .slds-resizable__handle .slds-resizable__divider::before, /* +3 more */` {
  width: 0px;
}

`[lwc-ssv0jn7orr-host][data-render-mode="shadow"] .slds-table[lwc-ssv0jn7orr] tbody[lwc-ssv0jn7orr] tr.slds-is-selected[lwc-ssv0jn7orr] > td[lwc-ssv0jn7orr], /* +3 more */` {
  background-color: var(--slds-g-color-neutral-base-95, #f3f3f3);
}

`[lwc-ssv0jn7orr-host][data-render-mode="shadow"] .slds-table[lwc-ssv0jn7orr] .slds-cell-edit.slds-has-focus[lwc-ssv0jn7orr] .slds-button__icon_edit[lwc-ssv0jn7orr], /* +3 more */` {
  opacity: 1;
}

`.slds-checkbox .slds-checkbox__label .slds-form-element__label` {
  display: inline;
  vertical-align: middle;
  font-size: var(--slds-s-label-font-size, var(--slds-g-font-scale-neg-2)) /* = 0.625rem */;
  font-weight: 400;
  color: var(--slds-g-color-on-surface-2) /* = light-dark(#2e2e2e, #e5e5e5) */;
}

`.slds-checkbox .slds-checkbox_faux, .slds-checkbox .slds-checkbox--faux` {
  width: var(--slds-g-sizing-5) /* = 1rem */;
  height: var(--slds-g-sizing-5) /* = 1rem */;
  display: inline-block;
  position: relative;
  vertical-align: middle;
  background-color: var( --slds-c-checkbox-color-background, var(--slds-s-mark-color-background, var(--slds-g-color-surface-container-1)) ) /* = light-dark(#fff, #242424) */;
  box-shadow: var(--slds-c-checkbox-shadow);
}

`.slds-button_icon-x-small .slds-button__icon, .slds-button--icon-x-small .slds-button__icon` {
  width: var(--slds-g-sizing-4) /* = 0.75rem */;
  height: var(--slds-g-sizing-4) /* = 0.75rem */;
}

`.slds-button-group .slds-button + .slds-button, .slds-button-group-list .slds-button + .slds-button` {
  margin-inline-start: 0px;
}

`[lwc-ssv0jn7orr-host][data-render-mode="shadow"] .slds-checkbox[lwc-ssv0jn7orr] [type="checkbox"]:indeterminate[lwc-ssv0jn7orr] + .slds-checkbox__label[lwc-ssv0jn7orr] .slds-checkbox_faux[lwc-ssv0jn7orr]::after` {
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--slds-g-sizing-3, 0.5rem);
  height: var(--slds-g-sizing-border-2, 2px);
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 0px;
  border-left-width: 0px;
  border-top-color: initial;
  border-right-color: initial;
  border-bottom-color: initial;
  border-left-color: initial;
}


#### Resolved Tokens

| Token | Value |
|-------|-------|
| `--slds-g-color-accent-2` | `light-dark(#0250d9, #7cb1fe)` |
| `--slds-g-color-border-accent-1` | `#066afe` |
| `--slds-g-color-disabled-container-2` | `light-dark(#c9c9c9, #444)` |
| `--slds-g-color-neutral-base-100` | `light-dark(#fff, #000)` |
| `--slds-g-color-on-accent-1` | `#fff` |
| `--slds-g-color-on-disabled-1` | `#757575` |
| `--slds-g-color-on-disabled-2` | `light-dark(#757575, #939393)` |
| `--slds-g-color-on-surface-2` | `light-dark(#2e2e2e, #e5e5e5)` |
| `--slds-g-color-surface-container-1` | `light-dark(#fff, #242424)` |
| `--slds-g-font-scale-neg-2` | `0.625rem` |
| `--slds-g-shadow-insetinverse-focus-1` | `0px 0px 0px 2px light-dark(#001e5b, #c2daff) inset, 0px 0px 0px 4px light-dark(#fff, #000) inset` |
| `--slds-g-shadow-outset-focus-1` | `0px 0px 0px 2px light-dark(#fff, #000), 0px 0px 0px 4px light-dark(#001e5b, #c2daff)` |
| `--slds-g-sizing-2` | `0.25rem` |
| `--slds-g-sizing-3` | `0.5rem` |
| `--slds-g-sizing-4` | `0.75rem` |
| `--slds-g-sizing-5` | `1rem` |
| `--slds-g-sizing-6` | `1.25rem` |
| `--slds-g-sizing-border-2` | `2px` |
| `--slds-s-mark-color-background-checked` | `#066afe` |
| `--slds-s-mark-color-background-invalid` | `light-dark(#b60554, #ff538a)` |
| `--slds-s-mark-shadow-checked` | `0px 1px 0px 0px rgba(0, 0, 0, 0.08) inset, 0px 0.5px 2px 0px rgba(0, 0, 0, 0.08) inset, 2px 2px 5px 0px rgba(0, 0, 0, 0.08) inset` |


---

### Global Header

- **Root:** `header.slds-global-header_container`
- **LWC:** `<lightning-global-header>`
- **Key CSS classes:**
  - `slds-global-header_container` -- root header container
  - `slds-global-header` -- inner header bar
  - `slds-global-header__item` -- header section
  - `slds-global-header__item_search` -- search section
  - `slds-global-header__logo` -- Salesforce logo area
  - `slds-global-actions` -- action buttons area
  - `slds-global-actions__item` -- single action item
  - `slds-global-actions__item_notification` -- notification button
- **ARIA:**
  - `role="banner"` on header
  - `role="search"` on search form
- **Variants:**
  - Standard
  - Notification
  - Search Open
- **Nib mapping:** `.sfdc-global-header`.

#### CSS Definitions

`.slds-global-header_container, .slds-global-header--container` {
  --_slds-c-globalheader-logo: var(--lwc-brandLogoImage);
  --_slds-c-globalheader-color-background: var(--slds-g-color-surface-container-1, #ffffff);
  --_slds-c-globalheader-buttonicon-color-active: var(--slds-g-color-on-surface-2, #2e2e2e);
  --_slds-c-globalheader-task-color-background-active: var(--slds-g-color-on-surface-2, #2e2e2e);
  --_slds-c-globalheader-favorites-color-border-hover: var(--slds-g-color-on-surface-2, #2e2e2e);
  --_slds-c-globalheader-buttonicon-color: var(--slds-g-color-on-surface-1, #5c5c5c);
  --_slds-c-globalheader-task-color-background: var(--slds-g-color-on-surface-1, #5c5c5c);
  --_slds-c-globalheader-favorites-color-border: var(--slds-g-color-on-surface-1, #5c5c5c);
  --_slds-c-globalheader-buttonicon-color-hover: var(--slds-g-color-on-surface-2, #2e2e2e);
  --_slds-c-globalheader-task-color-background-hover: var(--slds-g-color-on-surface-2, #2e2e2e);
  --_slds-c-globalheader-notificationbadge-color-background: var(--slds-g-color-palette-red-50, #ea001e);
  --_slds-c-globalheader-favorites-color-background-selected: var(--slds-g-color-accent-container-2, #014486);
  --_slds-c-globalheader-favorites-color-border-selected: var(--slds-g-color-border-accent-2, #014486);
  --_slds-c-globalheader-favorites-color-background-selected-hover: var( --slds-g-color-accent-container-3, #014486 );
  --_slds-c-globalheader-favorites-color-border-selected-hover: var(--slds-g-color-border-accent-3, #014486);
  --_slds-c-globalheader-favorites-color-text-disabled: var(--slds-g-color-on-disabled-1, #c9c9c9);
  --_slds-c-globalheader-favorites-color-border-disabled: var(--slds-g-color-border-disabled-1, #c9c9c9);
  position: fixed;
  width: 100%;
  top: 0px;
  left: 0px;
  z-index: 100;
}

`.slds-global-actions__task .slds-button__icon, .slds-global-actions__task .slds-icon` {
  width: var(--slds-g-sizing-5) /* = 1rem */;
  height: var(--slds-g-sizing-5) /* = 1rem */;
}

`.slds-global-actions__item_notification .slds-icon, /* +1 more */` {
  width: var(--slds-g-sizing-6) /* = 1.25rem */;
  height: var(--slds-g-sizing-6) /* = 1.25rem */;
}

`.slds-assistive-text` {
  position: absolute;
  margin-top: -1px;
  margin-right: -1px;
  margin-bottom: -1px;
  margin-left: -1px;
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 0px;
  border-left-width: 0px;
  border-top-color: initial;
  border-right-color: initial;
  border-bottom-color: initial;
  border-left-color: initial;
  padding-top: 0px;
  padding-right: 0px;
  padding-bottom: 0px;
  padding-left: 0px;
  width: 1px;
  height: 1px;
  overflow-x: hidden;
  overflow-y: hidden;
  text-transform: none;
}

`.slds-button-group .slds-button, .slds-button-group-list .slds-button` {
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
  border-bottom-left-radius: 0px;
}

`.slds-button + .slds-button-group, .slds-button + .slds-button-group-list` {
  margin-inline-start: var(--slds-g-spacing-1) /* = 0.25rem */;
}

`[lwc-ug158eacc1-host][data-render-mode="shadow"] .slds-assistive-text[lwc-ug158eacc1]` {
  position: absolute;
  margin-top: -1px;
  margin-right: -1px;
  margin-bottom: -1px;
  margin-left: -1px;
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 0px;
  border-left-width: 0px;
  border-top-color: initial;
  border-right-color: initial;
  border-bottom-color: initial;
  border-left-color: initial;
  padding-top: 0px;
  padding-right: 0px;
  padding-bottom: 0px;
  padding-left: 0px;
  width: 1px;
  height: 1px;
  overflow-x: hidden;
  overflow-y: hidden;
  text-transform: none;
}

`[lwc-ce9l7grm4d-host][data-render-mode="shadow"] .slds-assistive-text[lwc-ce9l7grm4d]` {
  position: absolute;
  margin-top: -1px;
  margin-right: -1px;
  margin-bottom: -1px;
  margin-left: -1px;
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 0px;
  border-left-width: 0px;
  border-top-color: initial;
  border-right-color: initial;
  border-bottom-color: initial;
  border-left-color: initial;
  padding-top: 0px;
  padding-right: 0px;
  padding-bottom: 0px;
  padding-left: 0px;
  width: 1px;
  height: 1px;
  overflow-x: hidden;
  overflow-y: hidden;
  text-transform: none;
}


#### Resolved Tokens

| Token | Value |
|-------|-------|
| `--slds-g-color-accent-2` | `light-dark(#0250d9, #7cb1fe)` |
| `--slds-g-color-accent-container-2` | `light-dark(#0250d9, #d6e6ff)` |
| `--slds-g-color-neutral-base-100` | `light-dark(#fff, #000)` |
| `--slds-g-color-on-accent-2` | `light-dark(#fff, #0250d9)` |
| `--slds-g-color-on-disabled-2` | `light-dark(#757575, #939393)` |
| `--slds-g-color-on-surface-1` | `light-dark(#5c5c5c, #aeaeae)` |
| `--slds-g-font-scale-neg-2` | `0.625rem` |
| `--slds-g-shadow-inset-focus-1` | `0px 0px 0px 2px light-dark(#001e5b, #c2daff) inset` |
| `--slds-g-shadow-outset-focus-1` | `0px 0px 0px 2px light-dark(#fff, #000), 0px 0px 0px 4px light-dark(#001e5b, #c2daff)` |
| `--slds-g-sizing-5` | `1rem` |
| `--slds-g-sizing-6` | `1.25rem` |
| `--slds-g-spacing-1` | `0.25rem` |
| `--slds-g-spacing-2` | `0.5rem` |
| `--slds-s-navigation-font-weight` | `600` |


---

### Input

- **Root:** `div.slds-form-element` > `input.slds-input`
- **LWC:** `<lightning-input>`
- **Key CSS classes:**
  - `slds-input` -- the input element
  - `slds-input-has-icon` -- input with icon(s)
  - `slds-input-has-icon_left` -- icon on left
  - `slds-input-has-icon_right` -- icon on right
  - `slds-input-has-icon_left-right` -- icons on both sides
  - `slds-input__icon` -- icon element
  - `slds-input__icon_left` / `_right` -- positioned icons
  - `slds-input-has-fixed-addon` -- with fixed text addon
  - `slds-form-element` -- root wrapper
  - `slds-form-element__label` -- label text
  - `slds-form-element__control` -- input wrapper
  - `slds-form-element__help` -- help/error text
  - `slds-has-error` -- error state on form-element
  - `slds-required` -- required asterisk
- **States:**
  - `.slds-has-error` -- validation error
  - `disabled` attribute -- disabled state
  - `required` attribute -- required field
  - `readonly` attribute -- read-only
- **ARIA:**
  - `aria-describedby` linking to help/error message
  - `aria-invalid="true|false"`
  - `aria-live="polite"` on help text container
- **Variants:**
  - Base (text)
  - Left Icon
  - Right Icon
  - Icon And Clear Button
  - Email Input
  - Search Input
  - URL Input
  - Telephone Input
  - Fixed Text (prefix/suffix addons)
  - Required
  - Disabled
  - Error
  - Read Only
- **Nib mapping:** Standard HTML inputs styled via `.sfdc-detail-field` containers.

#### CSS Definitions

`.slds-input[disabled], .slds-input.slds-is-disabled` {
  background-color: var(--slds-s-input-color-background-disabled, var(--slds-g-color-disabled-container-1)) /* = light-dark(#e5e5e5, #2e2e2e) */;
  color: var(--slds-s-input-color-disabled, var(--slds-g-color-on-disabled-2)) /* = light-dark(#757575, #939393) */;
}

`.slds-input[type="url"], .slds-input[type="tel"], .slds-input[type="email"]` {
  text-align: left;
}

`.slds-subtheme-agentic .slds-form-element__control .slds-input:not(:disabled)` {
  border-top-left-radius: 0.94rem;
  border-top-right-radius: 0.94rem;
  border-bottom-right-radius: 0.94rem;
  border-bottom-left-radius: 0.94rem;
}

`.slds-form_compound > .slds-form-element, .slds-form--compound > .slds-form-element` {
  margin-block-start: 0px;
  margin-block-end: 0px;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
}

`.slds-form-element__control .slds-radio, .slds-form-element__control .slds-checkbox` {
  display: block;
}

`.slds-popover_edit .slds-form-element__help, .slds-popover--edit .slds-form-element__help` {
  width: 100%;
  padding-inline-start: var(--slds-g-spacing-2) /* = 0.5rem */;
}

`.slds-form-element_compound .slds-form-element, .slds-form-element--compound .slds-form-element` {
  padding-inline-start: var(--slds-g-spacing-1) /* = 0.25rem */;
  padding-inline-end: var(--slds-g-spacing-1) /* = 0.25rem */;
}

`.slds-checkbox_toggle .slds-form-element__label, .slds-checkbox--toggle .slds-form-element__label` {
  font-weight: 400;
  color: var(--slds-g-color-on-surface-1) /* = light-dark(#5c5c5c, #aeaeae) */;
}

`.slds-form-element_readonly .slds-form-element__label, /* +1 more */` {
  margin-block-end: 0px;
}

`.slds-form-element_readonly .slds-form-element__control, /* +1 more */` {
  padding-block-start: calc(var(--slds-g-spacing-1) / 2) /* = 0.25rem */;
  padding-block-end: calc(var(--slds-g-spacing-1) / 2) /* = 0.25rem */;
}

`.slds-form_inline .slds-form-element + .slds-form-element, /* +1 more */` {
  margin-block-start: var(--slds-g-spacing-3) /* = 0.75rem */;
}

`.slds-form_compound .slds-form-element__row .slds-form-element + .slds-form-element, /* +1 more */` {
  padding-inline-start: var(--slds-g-spacing-2) /* = 0.5rem */;
  margin-block-start: 0px;
}

`[lwc-enmikoh2qu-host][data-render-mode="shadow"] .slds-form_compound[lwc-enmikoh2qu] .slds-form-element__row[lwc-enmikoh2qu] .slds-form-element[lwc-enmikoh2qu] + .slds-form-element[lwc-enmikoh2qu]` {
  padding-inline-start: var(--slds-g-spacing-2, 0.5rem);
  margin-block-start: 0px;
}

`[lwc-66unc5l95ad-host][data-render-mode="shadow"] .slds-form_compound[lwc-66unc5l95ad] .slds-form-element__row[lwc-66unc5l95ad] .slds-form-element[lwc-66unc5l95ad] + .slds-form-element[lwc-66unc5l95ad]` {
  padding-inline-start: var(--slds-g-spacing-2, 0.5rem);
  margin-block-start: 0px;
}

`[lwc-2fb3f2nu4or-host][data-render-mode="shadow"] .slds-form_compound[lwc-2fb3f2nu4or] .slds-form-element__row[lwc-2fb3f2nu4or] .slds-form-element[lwc-2fb3f2nu4or] + .slds-form-element[lwc-2fb3f2nu4or]` {
  padding-inline-start: var(--slds-g-spacing-2, 0.5rem);
  margin-block-start: 0px;
}

`[lwc-287jov2qseb-host][data-render-mode="shadow"] .slds-form_compound[lwc-287jov2qseb] .slds-form-element__row[lwc-287jov2qseb] .slds-form-element[lwc-287jov2qseb] + .slds-form-element[lwc-287jov2qseb]` {
  padding-inline-start: var(--slds-g-spacing-2, 0.5rem);
  margin-block-start: 0px;
}

`.slds-input[type="search"]::-webkit-search-decoration, /* +3 more */` {
  display: none;
}

`.slds-form-element_stacked, /* +5 more */` {
  display: block;
}

`[lwc-enmikoh2qu-host][data-render-mode="shadow"] .slds-form-element_compound[lwc-enmikoh2qu] .slds-form-element[lwc-enmikoh2qu], /* +1 more */` {
  padding-inline-start: var(--slds-g-spacing-1, 0.25rem);
  padding-inline-end: var(--slds-g-spacing-1, 0.25rem);
}

`[lwc-66unc5l95ad-host][data-render-mode="shadow"] .slds-form-element_compound[lwc-66unc5l95ad] .slds-form-element[lwc-66unc5l95ad], /* +1 more */` {
  padding-inline-start: var(--slds-g-spacing-1, 0.25rem);
  padding-inline-end: var(--slds-g-spacing-1, 0.25rem);
}


#### Resolved Tokens

| Token | Value |
|-------|-------|
| `--slds-g-color-disabled-container-1` | `light-dark(#e5e5e5, #2e2e2e)` |
| `--slds-g-color-on-disabled-2` | `light-dark(#757575, #939393)` |
| `--slds-g-color-on-surface-1` | `light-dark(#5c5c5c, #aeaeae)` |
| `--slds-g-sizing-3` | `0.5rem` |
| `--slds-g-spacing-1` | `0.25rem` |
| `--slds-g-spacing-2` | `0.5rem` |
| `--slds-g-spacing-3` | `0.75rem` |
| `--slds-g-spacing-6` | `2rem` |


---

### Modal

- **Root:** `section.slds-modal[role="dialog"]`
- **Key CSS classes:**
  - `slds-modal` -- root modal section
  - `slds-modal__container` -- modal box
  - `slds-modal__header` -- header with title
  - `slds-modal__title` -- h1 title (with `slds-hyphenate`)
  - `slds-modal__content` -- scrollable body (with `slds-p-around_medium`)
  - `slds-modal__content_headless` -- headless variant body
  - `slds-modal__footer` -- action button row
  - `slds-modal__footer_directional` -- back/next footer layout
  - `slds-modal__close` -- close button (top-right X)
  - `slds-modal_small` -- small size
  - `slds-modal_medium` -- medium size
  - `slds-modal_large` -- large size
  - `slds-modal_full` -- full viewport
  - `slds-fade-in-open` -- visible/animated state
  - `slds-backdrop` -- overlay behind modal
  - `slds-backdrop_open` -- visible backdrop
- **States:**
  - `.slds-fade-in-open` -- modal is visible
  - `.slds-backdrop_open` -- backdrop is visible
- **ARIA:**
  - `role="dialog"` on the `<section>`
  - `aria-modal="true"`
  - `aria-labelledby="[heading-id]"` or `aria-label="..."` (headless)
  - `aria-label="Cancel and close"` on close button
  - `role="presentation"` on backdrop
  - `tabindex="-1"` on modal section (for focus trap)
- **Variants:**
  - Base (header + body + footer)
  - Layout Taglines (header with subtitle)
  - Layout Headless (no header, uses `aria-label`)
  - Layout Footless (no footer)
  - Layout Directional (back/next buttons)
  - Size Small
  - Size Medium
  - Size Large
  - Size Full
- **Nib mapping:** Modals use centered overlay pattern. Footer: Cancel (neutral, left) + Save (brand, right).

#### CSS Definitions

`.slds-modal__container` {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-block-start: 0px;
  margin-block-end: 0px;
  height: 100%;
  padding-block-start: var(--slds-g-spacing-8) /* = 3rem */;
  padding-inline-end: 0px;
  padding-block-end: var(--slds-g-spacing-12) /* = 5rem */;
  padding-inline-start: 0px;
}

`.slds-modal .slds-modal__title` {
  font-weight: var(--slds-c-modal-heading-font-weight, var(--slds-s-container-heading-font-weight)) /* = 400 */;
  font-size: var( --slds-c-modal-heading-font-size, var(--slds-s-container-heading-font-size, var(--slds-g-font-scale-2)) ) /* = 1rem */;
  line-height: var(--slds-g-font-lineheight-2) /* = 1.25 */;
}

`.slds-modal__header .slds-modal__close` {
  position: absolute;
  margin-inline-start: 0px;
}

`.slds-modal__footer .slds-button + .slds-button` {
  margin-inline-start: var(--slds-g-spacing-2) /* = 0.5rem */;
}

`.slds-modal_prompt .slds-modal__header, .slds-modal--prompt .slds-modal__header` {
  text-align: var(--slds-s-container-heading-font-align, center);
  font-size: var(--slds-s-container-heading-font-size) /* = 1.25rem */;
  font-weight: var(--slds-s-container-heading-font-weight) /* = 400 */;
}

`.slds-modal_prompt .slds-modal__footer, .slds-modal--prompt .slds-modal__footer` {
  text-align: var(--slds-s-container-footer-font-align, center);
}

`.slds-modal_prompt .slds-modal__content, .slds-modal--prompt .slds-modal__content` {
  padding-inline-start: var(--slds-g-spacing-6) /* = 2rem */;
  padding-inline-end: var(--slds-g-spacing-6) /* = 2rem */;
}

`.slds-subtheme-agentic .slds-modal__header::before, /* +2 more */` {
  display: block;
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: -1;
  top: auto;
  right: auto;
  bottom: 0px;
  left: 0px;
  opacity: 0;
  background-color: rgb(2, 83, 212);
}

`.slds-modal__content_footless, /* +4 more */` {
  box-shadow: var(--slds-g-shadow-4) /* = 0px 0px 10px 0px light-dark(#0000001f, #0000003d), 0px 7px 7px 0px light-dark(#0000001f, #0000003d), 0px -1px 3px 0px light-dark(#00000012, #00000024) */;
}

`.slds-card .slds-card, /* +17 more */` {
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 0px;
  border-left-width: 0px;
  border-top-color: initial;
  border-right-color: initial;
  border-bottom-color: initial;
  border-left-color: initial;
  box-shadow: none;
}

`.slds-button` {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding-block-start: var(--slds-c-button-spacing-block-start);
  padding-inline-end: var(--slds-c-button-spacing-inline-end);
  padding-block-end: var(--slds-c-button-spacing-block-end);
  padding-inline-start: var(--slds-c-button-spacing-inline-start);
  background-color: var(--slds-c-button-color-background);
  box-shadow: var(--slds-c-button-shadow, var(--slds-s-button-shadow));
  line-height: 1.875rem;
  color: var(--slds-c-button-text-color, var(--slds-s-button-color, var(--slds-g-color-accent-2))) /* = light-dark(#0250d9, #7cb1fe) */;
  font-weight: var(--slds-c-button-font-weight, var(--slds-g-font-weight-4)) /* = 400 */;
  vertical-align: middle;
}

`.slds-assistive-text` {
  position: absolute;
  margin-top: -1px;
  margin-right: -1px;
  margin-bottom: -1px;
  margin-left: -1px;
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 0px;
  border-left-width: 0px;
  border-top-color: initial;
  border-right-color: initial;
  border-bottom-color: initial;
  border-left-color: initial;
  padding-top: 0px;
  padding-right: 0px;
  padding-bottom: 0px;
  padding-left: 0px;
  width: 1px;
  height: 1px;
  overflow-x: hidden;
  overflow-y: hidden;
  text-transform: none;
}

`.slds-button + .slds-button` {
  margin-inline-start: var(--slds-g-spacing-1) /* = 0.25rem */;
}

`.slds-button[disabled], .slds-button:disabled` {
  background-color: transparent;
  border-top-color: transparent;
  border-right-color: transparent;
  border-bottom-color: transparent;
  border-left-color: transparent;
  color: var(--slds-g-color-disabled-1) /* = #757575 */;
}

`.slds-button-group .slds-button, .slds-button-group-list .slds-button` {
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
  border-bottom-left-radius: 0px;
}


#### Resolved Tokens

| Token | Value |
|-------|-------|
| `--slds-g-color-accent-2` | `light-dark(#0250d9, #7cb1fe)` |
| `--slds-g-color-border-1` | `light-dark(#c9c9c9, #444)` |
| `--slds-g-color-disabled-1` | `#757575` |
| `--slds-g-color-disabled-container-1` | `light-dark(#e5e5e5, #2e2e2e)` |
| `--slds-g-color-disabled-container-2` | `light-dark(#c9c9c9, #444)` |
| `--slds-g-color-neutral-base-100` | `light-dark(#fff, #000)` |
| `--slds-g-color-on-disabled-1` | `#757575` |
| `--slds-g-color-on-disabled-2` | `light-dark(#757575, #939393)` |
| `--slds-g-color-on-surface-1` | `light-dark(#5c5c5c, #aeaeae)` |
| `--slds-g-color-surface-container-2` | `light-dark(#f3f3f3, #181818)` |
| `--slds-g-font-lineheight-2` | `1.25` |
| `--slds-g-font-scale-2` | `1rem` |
| `--slds-g-font-weight-4` | `400` |
| `--slds-g-shadow-4` | `0px 0px 10px 0px light-dark(#0000001f, #0000003d), 0px 7px 7px 0px light-dark(#0000001f, #0000003d), 0px -1px 3px 0px light-dark(#00000012, #00000024)` |
| `--slds-g-shadow-inset-focus-1` | `0px 0px 0px 2px light-dark(#001e5b, #c2daff) inset` |
| `--slds-g-shadow-insetinverse-focus-1` | `0px 0px 0px 2px light-dark(#001e5b, #c2daff) inset, 0px 0px 0px 4px light-dark(#fff, #000) inset` |
| `--slds-g-shadow-outset-focus-1` | `0px 0px 0px 2px light-dark(#fff, #000), 0px 0px 0px 4px light-dark(#001e5b, #c2daff)` |
| `--slds-g-sizing-3` | `0.5rem` |
| `--slds-g-sizing-4` | `0.75rem` |
| `--slds-g-sizing-7` | `1.5rem` |
| `--slds-g-spacing-1` | `0.25rem` |
| `--slds-g-spacing-12` | `5rem` |
| `--slds-g-spacing-2` | `0.5rem` |
| `--slds-g-spacing-5` | `1.5rem` |
| `--slds-g-spacing-6` | `2rem` |
| `--slds-g-spacing-8` | `3rem` |
| `--slds-s-container-heading-font-size` | `1.25rem` |
| `--slds-s-container-heading-font-weight` | `400` |
| `--slds-s-navigation-font-weight` | `600` |


---

### Page Header

- **Root:** `div.slds-page-header`
- **LWC:** `<lightning-page-header>` (custom)
- **Key CSS classes:**
  - `slds-page-header` -- base header
  - `slds-page-header_object-home` -- list view header
  - `slds-page-header_record-home` -- record detail header
  - `slds-page-header_related-list` -- related list header
  - `slds-page-header_vertical` -- vertical layout
  - `slds-page-header__row` -- header row
  - `slds-page-header__row_gutters` -- row with gutters
  - `slds-page-header__col-title` -- title column
  - `slds-page-header__col-actions` -- actions column
  - `slds-page-header__col-meta` -- metadata column
  - `slds-page-header__col-details` -- details column
  - `slds-page-header__name` -- name wrapper
  - `slds-page-header__name-title` -- title h1
  - `slds-page-header__title` -- title span
  - `slds-page-header__meta-text` -- item count / update text
  - `slds-page-header__detail-row` -- detail fields row
  - `slds-page-header__detail-block` -- detail block
- **ARIA:**
  - `role="navigation"` on breadcrumbs
  - `role="group"` on button groups
  - `aria-pressed` on stateful buttons
  - `aria-expanded="false"` on menus
  - `aria-haspopup="true"` on dropdown triggers
- **Styling hooks:**
  - `--slds-c-icon-color-background` (for header icon)
- **Variants:**
  - Base (icon + title + meta)
  - Object Home (list view: title + view switcher + New button + controls)
  - Record Home (record: icon + type + name + follow + actions + detail fields)
  - Related List (breadcrumbs + title + count + controls)
  - Vertical Record Home (vertical layout with detail fields below)
- **Nib mapping:** `.sfdc-record-header`, `.sfdc-record-header-top`, `.sfdc-record-icon`, `.sfdc-record-info`, `.sfdc-record-type`, `.sfdc-record-name`, `.sfdc-record-actions`.

#### CSS Definitions

`.slds-page-header__name` {
  display: inline-flex;
  padding-inline-end: var(--slds-g-spacing-3) /* = 0.75rem */;
  max-width: 100%;
}

`.slds-page-header__title` {
  font-size: var(--slds-s-pageheader-title-font-size, var(--slds-g-font-scale-1)) /* = 0.875rem */;
  font-weight: var(--slds-s-pageheader-title-font-weight, var(--slds-g-font-weight-7)) /* = 700 */;
  color: var(--slds-g-color-on-surface-3) /* = light-dark(#03234d, #d8e6fe) */;
  line-height: var(--slds-g-font-lineheight-2) /* = 1.25 */;
  display: block;
}

`.slds-page-header__name-meta` {
  max-width: 100%;
  overflow-x: hidden;
  overflow-y: hidden;
  text-overflow: ellipsis;
  padding-inline-end: var(--slds-g-spacing-3) /* = 0.75rem */;
  color: var(--slds-g-color-on-surface-1) /* = light-dark(#5c5c5c, #aeaeae) */;
}

`.slds-page-header .slds-media` {
  align-items: center;
}

`.slds-page-header__row .slds-media` {
  align-items: center;
}

`.slds-card_related-list-fix .slds-page-header .slds-button-group-list .slds-button_icon-border-filled, /* +1 more */` {
  width: var(--slds-g-sizing-7) /* = 1.5rem */;
  height: var(--slds-g-sizing-7) /* = 1.5rem */;
}

`.slds-icon` {
  display: inline-flex;
  height: var(--_slds-c-icon-sizing, var(--slds-s-icon-sizing, var(--slds-g-sizing-9))) /* = 2rem */;
  width: var(--_slds-c-icon-sizing, var(--slds-s-icon-sizing, var(--slds-g-sizing-9))) /* = 2rem */;
}

`.slds-truncate` {
  max-width: 100%;
  overflow-x: hidden;
  overflow-y: hidden;
  text-overflow: ellipsis;
}

`.slds-picklist__label .slds-icon` {
  width: var(--slds-g-sizing-4) /* = 0.75rem */;
  height: var(--slds-g-sizing-4) /* = 0.75rem */;
  position: absolute;
  right: var(--slds-g-spacing-4) /* = 1rem */;
  top: 50%;
  margin-top: -0.375rem;
}

`.slds-icon_container, .slds-icon--container` {
  padding-block-start: var(--slds-s-icon-spacing);
  padding-block-end: var(--slds-s-icon-spacing);
  padding-inline-start: var(--slds-s-icon-spacing);
  padding-inline-end: var(--slds-s-icon-spacing);
  background-color: var(--slds-c-icon-color-background, var(--slds-s-icon-color-background));
  display: inline-block;
  line-height: 1;
}

`.slds-media__body, .slds-media__body > :last-child` {
  margin-block-end: 0px;
}


#### Resolved Tokens

| Token | Value |
|-------|-------|
| `--slds-g-color-on-success-1` | `light-dark(#056764, #acf3e4)` |
| `--slds-g-color-on-surface-1` | `light-dark(#5c5c5c, #aeaeae)` |
| `--slds-g-color-on-surface-3` | `light-dark(#03234d, #d8e6fe)` |
| `--slds-g-color-on-surface-inverse-1` | `light-dark(#fff, #181818)` |
| `--slds-g-font-lineheight-2` | `1.25` |
| `--slds-g-font-scale-1` | `0.875rem` |
| `--slds-g-font-scale-neg-2` | `0.625rem` |
| `--slds-g-font-weight-7` | `700` |
| `--slds-g-sizing-4` | `0.75rem` |
| `--slds-g-sizing-5` | `1rem` |
| `--slds-g-sizing-6` | `1.25rem` |
| `--slds-g-sizing-7` | `1.5rem` |
| `--slds-g-sizing-9` | `2rem` |
| `--slds-g-spacing-1` | `0.25rem` |
| `--slds-g-spacing-2` | `0.5rem` |
| `--slds-g-spacing-3` | `0.75rem` |
| `--slds-g-spacing-4` | `1rem` |
| `--slds-g-spacing-5` | `1.5rem` |


---

### Path

- **Root:** `div.slds-path`
- **LWC:** `<lightning-path>` (custom)
- **Key CSS classes:**
  - `slds-path` -- root container
  - `slds-path__track` -- track container (grid)
  - `slds-path__scroller` -- scrollable area
  - `slds-path__scroller_inner` -- inner scroll container
  - `slds-path__nav` -- step list (`<ul>` with `role="listbox"`)
  - `slds-path__item` -- single step (`<li>`)
  - `slds-path__link` -- clickable step anchor
  - `slds-path__stage` -- stage icon container
  - `slds-path__title` -- step title text
  - `slds-path__action` -- action area (mark complete button)
  - `slds-path__trigger` -- coaching toggle button
  - `slds-path__coach` -- coaching panel
  - `slds-path__keys` -- key fields section
  - `slds-path__guidance` -- guidance section
  - `slds-path__scroll-controls` -- overflow scroll buttons
  - `slds-path_has-coaching` -- path with coaching variant
- **States:**
  - `.slds-is-current` -- current stage
  - `.slds-is-active` -- actively selected/focused stage
  - `.slds-is-complete` -- completed stage (checkmark icon)
  - `.slds-is-incomplete` -- future stage
  - `.slds-is-lost` -- closed lost (red)
  - `.slds-is-won` -- closed won (green, all complete)
- **ARIA:**
  - `role="listbox"` on the step list
  - `role="option"` on each step
  - `aria-orientation="horizontal"`
  - `aria-selected="true|false"` on step links
  - `aria-expanded="true|false"` on coaching trigger
- **Styling hooks:**
  - `--slds-c-icon-color-background` (inherited)
- **Variants:**
  - Base (current stage + mark complete)
  - Later Stage (multiple completed + current)
  - Different Stage Selected
  - Coaching Available (with toggle + key fields + guidance)
  - Lost (`slds-is-lost`)
  - Won (`slds-is-won`)
  - With Overflow (scroll controls)
- **Nib mapping:** `.sfdc-path-bar`, `.sfdc-path-step` (+`.complete`, `.current`, `.lost`), `.sfdc-path-detail`.

#### CSS Definitions

`.slds-path__nav .slds-is-active:first-child` {
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 0px;
  border-left-width: 0px;
  border-top-color: initial;
  border-right-color: initial;
  border-bottom-color: initial;
  border-left-color: initial;
}

`.slds-path__nav .slds-is-active .slds-path__link` {
  color: var(--slds-g-color-on-surface-inverse-1) /* = light-dark(#fff, #181818) */;
}

`.slds-path__nav .slds-is-current .slds-path__link` {
  color: var(--slds-g-color-brand-base-20) /* = light-dark(#002775, #a8cbff) */;
}

`.slds-path__nav .slds-is-incomplete .slds-path__link` {
  color: var(--_slds-c-path-item-color-incomplete);
}

`.slds-path__nav .slds-is-active:hover .slds-path__link` {
  color: var(--slds-g-color-on-surface-inverse-1) /* = light-dark(#fff, #181818) */;
}

`.slds-path__nav .slds-is-current:hover .slds-path__link` {
  color: var(--slds-g-color-brand-base-20) /* = light-dark(#002775, #a8cbff) */;
}

`.slds-path__nav .slds-is-active:first-child .slds-path__link` {
  height: 2rem;
}

`.slds-path__nav .slds-is-current:first-child .slds-path__link` {
  height: var(--_slds-c-path-item-sizing-height);
}

`.slds-path__nav .slds-is-current::before, .slds-path__nav .slds-is-current::after` {
  background-color: var(--slds-g-color-surface-container-1) /* = light-dark(#fff, #242424) */;
}

`.slds-path__nav .slds-is-won .slds-path__link, .slds-path__nav .slds-is-won:hover .slds-path__link` {
  color: var(--slds-g-color-on-success-1) /* = light-dark(#056764, #acf3e4) */;
}

`.slds-path__nav .slds-is-lost .slds-path__link, .slds-path__nav .slds-is-lost:hover .slds-path__link` {
  color: var(--slds-g-color-on-error-1) /* = light-dark(#b60554, #fddde3) */;
}

`.slds-path__nav .slds-is-current:first-child::before, /* +1 more */` {
  background-color: transparent;
}

`.slds-path__track.slds-has-overflow .slds-path__scroller_inner, /* +1 more */` {
  display: flex;
  width: 100%;
  overflow-x: hidden;
  overflow-y: hidden;
}

`.slds-assistive-text` {
  position: absolute;
  margin-top: -1px;
  margin-right: -1px;
  margin-bottom: -1px;
  margin-left: -1px;
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 0px;
  border-left-width: 0px;
  border-top-color: initial;
  border-right-color: initial;
  border-bottom-color: initial;
  border-left-color: initial;
  padding-top: 0px;
  padding-right: 0px;
  padding-bottom: 0px;
  padding-left: 0px;
  width: 1px;
  height: 1px;
  overflow-x: hidden;
  overflow-y: hidden;
  text-transform: none;
}

`[lwc-r2ueuvbpqo-host][data-render-mode="shadow"] .slds-assistive-text[lwc-r2ueuvbpqo]` {
  position: absolute;
  margin-top: -1px;
  margin-right: -1px;
  margin-bottom: -1px;
  margin-left: -1px;
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 0px;
  border-left-width: 0px;
  border-top-color: initial;
  border-right-color: initial;
  border-bottom-color: initial;
  border-left-color: initial;
  padding-top: 0px;
  padding-right: 0px;
  padding-bottom: 0px;
  padding-left: 0px;
  width: 1px;
  height: 1px;
  overflow-x: hidden;
  overflow-y: hidden;
  text-transform: none;
}

`[lwc-31cthfl1g6j-host][data-render-mode="shadow"] .slds-assistive-text[lwc-31cthfl1g6j]` {
  position: absolute;
  margin-top: -1px;
  margin-right: -1px;
  margin-bottom: -1px;
  margin-left: -1px;
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 0px;
  border-left-width: 0px;
  border-top-color: initial;
  border-right-color: initial;
  border-bottom-color: initial;
  border-left-color: initial;
  padding-top: 0px;
  padding-right: 0px;
  padding-bottom: 0px;
  padding-left: 0px;
  width: 1px;
  height: 1px;
  overflow-x: hidden;
  overflow-y: hidden;
  text-transform: none;
}

`[lwc-25f9lgh55ct-host][data-render-mode="shadow"] .slds-assistive-text[lwc-25f9lgh55ct]` {
  position: absolute;
  margin-top: -1px;
  margin-right: -1px;
  margin-bottom: -1px;
  margin-left: -1px;
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 0px;
  border-left-width: 0px;
  border-top-color: initial;
  border-right-color: initial;
  border-bottom-color: initial;
  border-left-color: initial;
  padding-top: 0px;
  padding-right: 0px;
  padding-bottom: 0px;
  padding-left: 0px;
  width: 1px;
  height: 1px;
  overflow-x: hidden;
  overflow-y: hidden;
  text-transform: none;
}

`[lwc-42d11p52f0f-host][data-render-mode="shadow"] .slds-assistive-text[lwc-42d11p52f0f]` {
  position: absolute;
  margin-top: -1px;
  margin-right: -1px;
  margin-bottom: -1px;
  margin-left: -1px;
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 0px;
  border-left-width: 0px;
  border-top-color: initial;
  border-right-color: initial;
  border-bottom-color: initial;
  border-left-color: initial;
  padding-top: 0px;
  padding-right: 0px;
  padding-bottom: 0px;
  padding-left: 0px;
  width: 1px;
  height: 1px;
  overflow-x: hidden;
  overflow-y: hidden;
  text-transform: none;
}


#### Resolved Tokens

| Token | Value |
|-------|-------|
| `--slds-g-color-brand-base-20` | `light-dark(#002775, #a8cbff)` |
| `--slds-g-color-neutral-base-100` | `light-dark(#fff, #000)` |
| `--slds-g-color-on-error-1` | `light-dark(#b60554, #fddde3)` |
| `--slds-g-color-on-success-1` | `light-dark(#056764, #acf3e4)` |
| `--slds-g-color-on-surface-1` | `light-dark(#5c5c5c, #aeaeae)` |
| `--slds-g-color-on-surface-3` | `light-dark(#03234d, #d8e6fe)` |
| `--slds-g-color-on-surface-inverse-1` | `light-dark(#fff, #181818)` |
| `--slds-g-color-surface-container-1` | `light-dark(#fff, #242424)` |
| `--slds-g-color-surface-container-inverse-1` | `light-dark(#032d60, #aacbff)` |
| `--slds-g-color-surface-container-inverse-2` | `light-dark(#03234d, #78b0fd)` |
| `--slds-g-font-scale-neg-2` | `0.625rem` |
| `--slds-g-shadow-inset-focus-1` | `0px 0px 0px 2px light-dark(#001e5b, #c2daff) inset` |
| `--slds-g-shadow-outset-focus-1` | `0px 0px 0px 2px light-dark(#fff, #000), 0px 0px 0px 4px light-dark(#001e5b, #c2daff)` |
| `--slds-g-sizing-5` | `1rem` |
| `--slds-g-spacing-2` | `0.5rem` |
| `--slds-s-navigation-color-active` | `light-dark(#022ac0, #a8cbff)` |
| `--slds-s-navigation-font-weight` | `600` |


---

### Pill

- **Root:** `span.slds-pill`
- **LWC:** `<lightning-pill>`, `<lightning-pill-container>`
- **Key CSS classes:**
  - `slds-pill` -- base pill
  - `slds-pill_link` -- pill with anchor link
  - `slds-pill_bare` -- minimal/bare variant
  - `slds-pill__action` -- clickable anchor inside pill
  - `slds-pill__label` -- text label
  - `slds-pill__icon_container` -- leading icon/avatar
  - `slds-pill__remove` -- remove (close) button
  - `slds-pill_container` -- container for multiple pills
  - `slds-listbox_horizontal` / `slds-listbox_inline` -- list of pills
- **States:**
  - `.slds-has-error` -- pill in error state
  - `.slds-pill_link` -- clickable pill
  - `.slds-pill_bare` -- minimal styling
- **ARIA:**
  - `aria-label="Selected Options:"` on pill list
  - `aria-hidden="true"` on decorative icons
  - Close button has `title="Remove [label]"` and assistive text
- **Styling hooks:**
  - `--slds-c-icon-color-background` (for embedded icons)
- **Variants:**
  - Base (with link, with remove handler)
  - Avatar (with user avatar)
  - Error (with `slds-has-error`)
  - Icon (with standard icon)
  - List Box Pills (multiple pills in container)
  - Bare List Box Pills (`slds-pill_bare`)
- **Nib mapping:** Used in combobox multi-select patterns. No dedicated sfdc-pill class.

#### CSS Definitions

`.slds-pill` {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  line-height: var(--slds-g-font-lineheight-2) /* = 1.25 */;
  max-width: 100%;
  font-size: var(--slds-g-font-scale-neg-1) /* = 0.75rem */;
  padding-block-start: var(--slds-c-pill-spacing-block-start);
  padding-inline-end: var(--slds-c-pill-spacing-inline-end);
  padding-block-end: var(--slds-c-pill-spacing-block-end);
  padding-inline-start: var(--slds-c-pill-spacing-inline-start, var(--slds-g-spacing-2)) /* = 0.5rem */;
  background-color: var(--slds-c-pill-color-background, var(--slds-g-color-surface-container-1)) /* = light-dark(#fff, #242424) */;
  box-shadow: var(--slds-c-pill-shadow);
  position: relative;
  height: 1.5rem;
}

`.slds-pill_link, .slds-pill--link` {
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 0px;
  border-left-width: 0px;
  border-top-color: initial;
  border-right-color: initial;
  border-bottom-color: initial;
  border-left-color: initial;
  padding-top: 0px;
  padding-right: 0px;
  padding-bottom: 0px;
  padding-left: 0px;
  align-items: stretch;
}

`.slds-pill_link .slds-pill__remove, .slds-pill--link .slds-pill__remove` {
  position: absolute;
}

`.slds-pill__remove .slds-button_icon, .slds-pill__remove .slds-button--icon` {
  color: var(--slds-g-color-accent-2) /* = light-dark(#0250d9, #7cb1fe) */;
  line-height: var(--slds-g-font-lineheight-1) /* = 1 */;
  font-size: var(--slds-g-sizing-3) /* = 0.5rem */;
}

`[lwc-4pem77tm5o-host][data-render-mode="shadow"] .slds-pill[lwc-4pem77tm5o]` {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  line-height: var(--slds-g-font-lineheight-4, 1.5);
  max-width: 100%;
  padding-block-start: var(--slds-c-pill-spacing-blockstart, calc(var(--slds-g-spacing-1, 0.25rem) / 2));
  padding-inline-end: var(--slds-c-pill-spacing-inlineend, calc(var(--slds-g-spacing-1, 0.25rem) / 2));
  padding-block-end: var(--slds-c-pill-spacing-blockend, calc(var(--slds-g-spacing-1, 0.25rem) / 2));
  padding-inline-start: var(--slds-c-pill-spacing-inlinestart, calc(var(--slds-g-spacing-1, 0.25rem) / 2));
  background-color: var(--slds-c-pill-color-background, var(--slds-g-color-surface-container-1, #ffffff));
  box-shadow: var(--slds-c-pill-shadow);
  position: relative;
  min-height: calc(var(--slds-g-sizing-7, 1.5rem) + var(--slds-g-sizing-1, 0.125rem));
}

`[lwc-3teh57k397h-host][data-render-mode="shadow"] .slds-pill[lwc-3teh57k397h]` {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  line-height: var(--slds-g-font-lineheight-4, 1.5);
  max-width: 100%;
  padding-block-start: var(--slds-c-pill-spacing-blockstart, calc(var(--slds-g-spacing-1, 0.25rem) / 2));
  padding-inline-end: var(--slds-c-pill-spacing-inlineend, calc(var(--slds-g-spacing-1, 0.25rem) / 2));
  padding-block-end: var(--slds-c-pill-spacing-blockend, calc(var(--slds-g-spacing-1, 0.25rem) / 2));
  padding-inline-start: var(--slds-c-pill-spacing-inlinestart, calc(var(--slds-g-spacing-1, 0.25rem) / 2));
  background-color: var(--slds-c-pill-color-background, var(--slds-g-color-surface-container-1, #ffffff));
  box-shadow: var(--slds-c-pill-shadow);
  position: relative;
  min-height: calc(var(--slds-g-sizing-7, 1.5rem) + var(--slds-g-sizing-1, 0.125rem));
}

`[lwc-480ebo68o1e-host][data-render-mode="shadow"] .slds-pill[lwc-480ebo68o1e]` {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  line-height: var(--slds-g-font-lineheight-4, 1.5);
  max-width: 100%;
  padding-block-start: var(--slds-c-pill-spacing-blockstart, calc(var(--slds-g-spacing-1, 0.25rem) / 2));
  padding-inline-end: var(--slds-c-pill-spacing-inlineend, calc(var(--slds-g-spacing-1, 0.25rem) / 2));
  padding-block-end: var(--slds-c-pill-spacing-blockend, calc(var(--slds-g-spacing-1, 0.25rem) / 2));
  padding-inline-start: var(--slds-c-pill-spacing-inlinestart, calc(var(--slds-g-spacing-1, 0.25rem) / 2));
  background-color: var(--slds-c-pill-color-background, var(--slds-g-color-surface-container-1, #ffffff));
  box-shadow: var(--slds-c-pill-shadow);
  position: relative;
  min-height: calc(var(--slds-g-sizing-7, 1.5rem) + var(--slds-g-sizing-1, 0.125rem));
}

`[lwc-6ffh7am62m2-host][data-render-mode="shadow"] .slds-pill[lwc-6ffh7am62m2]` {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  line-height: var(--slds-g-font-lineheight-4, 1.5);
  max-width: 100%;
  padding-block-start: var(--slds-c-pill-spacing-blockstart, calc(var(--slds-g-spacing-1, 0.25rem) / 2));
  padding-inline-end: var(--slds-c-pill-spacing-inlineend, calc(var(--slds-g-spacing-1, 0.25rem) / 2));
  padding-block-end: var(--slds-c-pill-spacing-blockend, calc(var(--slds-g-spacing-1, 0.25rem) / 2));
  padding-inline-start: var(--slds-c-pill-spacing-inlinestart, calc(var(--slds-g-spacing-1, 0.25rem) / 2));
  background-color: var(--slds-c-pill-color-background, var(--slds-g-color-surface-container-1, #ffffff));
  box-shadow: var(--slds-c-pill-shadow);
  position: relative;
  min-height: calc(var(--slds-g-sizing-7, 1.5rem) + var(--slds-g-sizing-1, 0.125rem));
}

`[lwc-1rvugoq1l0r-host][data-render-mode="shadow"] .slds-pill[lwc-1rvugoq1l0r]` {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  line-height: var(--slds-g-font-lineheight-4, 1.5);
  max-width: 100%;
  padding-block-start: var(--slds-c-pill-spacing-blockstart, calc(var(--slds-g-spacing-1, 0.25rem) / 2));
  padding-inline-end: var(--slds-c-pill-spacing-inlineend, calc(var(--slds-g-spacing-1, 0.25rem) / 2));
  padding-block-end: var(--slds-c-pill-spacing-blockend, calc(var(--slds-g-spacing-1, 0.25rem) / 2));
  padding-inline-start: var(--slds-c-pill-spacing-inlinestart, calc(var(--slds-g-spacing-1, 0.25rem) / 2));
  background-color: var(--slds-c-pill-color-background, var(--slds-g-color-surface-container-1, #ffffff));
  box-shadow: var(--slds-c-pill-shadow);
  position: relative;
  min-height: calc(var(--slds-g-sizing-7, 1.5rem) + var(--slds-g-sizing-1, 0.125rem));
}

`.slds-pill.slds-has-error .slds-button_icon, .slds-pill.slds-has-error .slds-button--icon` {
  color: var(--slds-g-color-error-1) /* = light-dark(#b60554, #fe8aa7) */;
}

`[lwc-4pem77tm5o-host][data-render-mode="shadow"] .slds-pill_link[lwc-4pem77tm5o] .slds-pill__remove[lwc-4pem77tm5o]` {
  position: absolute;
  top: 50%;
  right: calc(var(--slds-g-spacing-1, 0.25rem) / 2);
}

`[lwc-3teh57k397h-host][data-render-mode="shadow"] .slds-pill_link[lwc-3teh57k397h] .slds-pill__remove[lwc-3teh57k397h]` {
  position: absolute;
  top: 50%;
  right: calc(var(--slds-g-spacing-1, 0.25rem) / 2);
}

`[lwc-480ebo68o1e-host][data-render-mode="shadow"] .slds-pill_link[lwc-480ebo68o1e] .slds-pill__remove[lwc-480ebo68o1e]` {
  position: absolute;
  top: 50%;
  right: calc(var(--slds-g-spacing-1, 0.25rem) / 2);
}

`[lwc-6ffh7am62m2-host][data-render-mode="shadow"] .slds-pill_link[lwc-6ffh7am62m2] .slds-pill__remove[lwc-6ffh7am62m2]` {
  position: absolute;
  top: 50%;
  right: calc(var(--slds-g-spacing-1, 0.25rem) / 2);
}

`[lwc-1rvugoq1l0r-host][data-render-mode="shadow"] .slds-pill_link[lwc-1rvugoq1l0r] .slds-pill__remove[lwc-1rvugoq1l0r]` {
  position: absolute;
  top: 50%;
  right: calc(var(--slds-g-spacing-1, 0.25rem) / 2);
}

`.slds-pill__icon ~ .slds-pill__action, /* +2 more */` {
  padding-inline-start: calc(var(--slds-g-spacing-2) + var(--slds-g-sizing-5) + var(--slds-g-sizing-2)) /* = 0.5rem */;
}

`.slds-button` {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding-block-start: var(--slds-c-button-spacing-block-start);
  padding-inline-end: var(--slds-c-button-spacing-inline-end);
  padding-block-end: var(--slds-c-button-spacing-block-end);
  padding-inline-start: var(--slds-c-button-spacing-inline-start);
  background-color: var(--slds-c-button-color-background);
  box-shadow: var(--slds-c-button-shadow, var(--slds-s-button-shadow));
  line-height: 1.875rem;
  color: var(--slds-c-button-text-color, var(--slds-s-button-color, var(--slds-g-color-accent-2))) /* = light-dark(#0250d9, #7cb1fe) */;
  font-weight: var(--slds-c-button-font-weight, var(--slds-g-font-weight-4)) /* = 400 */;
  vertical-align: middle;
}

`.slds-assistive-text` {
  position: absolute;
  margin-top: -1px;
  margin-right: -1px;
  margin-bottom: -1px;
  margin-left: -1px;
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 0px;
  border-left-width: 0px;
  border-top-color: initial;
  border-right-color: initial;
  border-bottom-color: initial;
  border-left-color: initial;
  padding-top: 0px;
  padding-right: 0px;
  padding-bottom: 0px;
  padding-left: 0px;
  width: 1px;
  height: 1px;
  overflow-x: hidden;
  overflow-y: hidden;
  text-transform: none;
}

`.slds-button[disabled], .slds-button:disabled` {
  background-color: transparent;
  border-top-color: transparent;
  border-right-color: transparent;
  border-bottom-color: transparent;
  border-left-color: transparent;
  color: var(--slds-g-color-disabled-1) /* = #757575 */;
}

`.slds-button-group .slds-button, .slds-button-group-list .slds-button` {
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
  border-bottom-left-radius: 0px;
}

`[lwc-4pem77tm5o-host][data-render-mode="shadow"] .slds-assistive-text[lwc-4pem77tm5o]` {
  position: absolute;
  margin-top: -1px;
  margin-right: -1px;
  margin-bottom: -1px;
  margin-left: -1px;
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 0px;
  border-left-width: 0px;
  border-top-color: initial;
  border-right-color: initial;
  border-bottom-color: initial;
  border-left-color: initial;
  padding-top: 0px;
  padding-right: 0px;
  padding-bottom: 0px;
  padding-left: 0px;
  width: 1px;
  height: 1px;
  overflow-x: hidden;
  overflow-y: hidden;
  text-transform: none;
}


#### Resolved Tokens

| Token | Value |
|-------|-------|
| `--slds-g-color-accent-2` | `light-dark(#0250d9, #7cb1fe)` |
| `--slds-g-color-disabled-1` | `#757575` |
| `--slds-g-color-error-1` | `light-dark(#b60554, #fe8aa7)` |
| `--slds-g-color-neutral-base-100` | `light-dark(#fff, #000)` |
| `--slds-g-color-on-surface-1` | `light-dark(#5c5c5c, #aeaeae)` |
| `--slds-g-color-surface-container-1` | `light-dark(#fff, #242424)` |
| `--slds-g-font-lineheight-1` | `1` |
| `--slds-g-font-lineheight-2` | `1.25` |
| `--slds-g-font-scale-neg-1` | `0.75rem` |
| `--slds-g-font-weight-4` | `400` |
| `--slds-g-shadow-inset-focus-1` | `0px 0px 0px 2px light-dark(#001e5b, #c2daff) inset` |
| `--slds-g-shadow-outset-focus-1` | `0px 0px 0px 2px light-dark(#fff, #000), 0px 0px 0px 4px light-dark(#001e5b, #c2daff)` |
| `--slds-g-sizing-2` | `0.25rem` |
| `--slds-g-sizing-3` | `0.5rem` |
| `--slds-g-sizing-5` | `1rem` |
| `--slds-g-sizing-7` | `1.5rem` |
| `--slds-g-spacing-2` | `0.5rem` |
| `--slds-s-navigation-font-weight` | `600` |


---

### Tabs

- **Root:** `div.slds-tabs_default` or `div.slds-tabs_scoped` or `div.slds-vertical-tabs`
- **LWC:** `<lightning-tabset>`, `<lightning-tab>`, `<lightning-tab-bar>`
- **Key CSS classes:**
  - **Default tabs:**
  - `slds-tabs_default` -- root container
  - `slds-tabs_default__nav` -- tab bar `<ul>` with `role="tablist"`
  - `slds-tabs_default__item` -- tab `<li>` with `role="presentation"`
  - `slds-tabs_default__link` -- tab anchor with `role="tab"`
  - `slds-tabs_default__content` -- tab panel
  - `slds-tabs_default__overflow-button` -- overflow "More" button
  - **Scoped tabs:**
  - `slds-tabs_scoped` -- root container
  - `slds-tabs_scoped__nav` -- tab bar
  - `slds-tabs_scoped__item` -- tab item
  - `slds-tabs_scoped__link` -- tab link
  - `slds-tabs_scoped__content` -- tab panel
  - **Vertical tabs:**
  - `slds-vertical-tabs` -- root container
  - `slds-vertical-tabs__nav` -- vertical nav list
  - `slds-vertical-tabs__nav-item` -- nav item
  - `slds-vertical-tabs__link` -- nav link
  - `slds-vertical-tabs__content` -- content panel
  - **Shared:**
  - `slds-is-active` -- active tab item
  - `slds-show` -- visible tab panel
  - `slds-hide` -- hidden tab panel
- **States:**
  - `.slds-is-active` -- currently selected tab
  - `.slds-show` -- visible panel
  - `.slds-hide` -- hidden panel
- **ARIA:**
  - `role="tablist"` on the `<ul>` nav
  - `role="tab"` on each tab link
  - `role="presentation"` on `<li>` wrappers
  - `role="tabpanel"` on each content panel
  - `aria-selected="true|false"` on tabs
  - `aria-controls="[panel-id]"` on tab links
  - `aria-labelledby="[tab-id]"` on panels
  - `tabindex="0"` on active tab, `tabindex="-1"` on inactive tabs
- **Variants:**
  - Base (default horizontal tabs)
  - Base Active Tab (non-first tab active)
  - Scoped (bordered tab style)
  - Scoped With Overflow (many tabs + "More" menu)
  - Scoped Vertical (vertical layout)
- **Nib mapping:** `.sfdc-tabs`, `.sfdc-tab` (+`.active`).

#### CSS Definitions

`.slds-tabs_default__link, .slds-tabs--default__link` {
  max-width: 100%;
  overflow-x: hidden;
  overflow-y: hidden;
  text-overflow: ellipsis;
  display: inline-flex;
  align-items: center;
  height: var(--slds-c-tabs-item-sizing-height, var(--slds-s-navigation-sizing-height, 2.5rem));
  line-height: var(--slds-c-tabs-item-font-lineheight, var(--slds-s-navigation-font-lineheight, 2.5rem));
  color: currentcolor;
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 0px;
  border-left-width: 0px;
  border-top-color: initial;
  border-right-color: initial;
  border-bottom-color: initial;
  border-left-color: initial;
  text-transform: inherit;
}

`.slds-tabs_default__item.slds-is-active, .slds-tabs--default__item.slds-is-active` {
  --slds-c-tabs-item-text-color: var( --slds-c-tabs-item-text-color-active, var(--slds-s-navigation-color-active, var(--slds-g-color-on-surface-3)) ) /* = light-dark(#03234d, #d8e6fe) */;
}

`.slds-is-active .slds-tabs_scoped__link, .slds-is-active .slds-tabs--scoped__link` {
  background-color: var(--slds-s-navigation-color-background-active) /* = light-dark(#fff, #242424) */;
  font-weight: var(--slds-s-navigation-font-weight-active) /* = 600 */;
  color: var(--slds-s-navigation-color-active, var(--slds-g-color-on-surface-3)) /* = light-dark(#03234d, #d8e6fe) */;
}

`.slds-tabs_default__item.slds-is-active::after, .slds-tabs--default__item.slds-is-active::after` {
  background-color: var(--slds-c-tabs-item-color-border-active, var(--slds-g-color-accent-2)) /* = light-dark(#0250d9, #7cb1fe) */;
  height: var(--slds-c-tabs-list-sizing-border, var(--slds-s-navigation-sizing-border-active)) /* = 3px */;
}

`.slds-tabs_scoped__overflow-button .slds-button, .slds-tabs--scoped__overflow-button .slds-button` {
  line-height: inherit;
  color: var(--slds-s-navigation-color, var(--slds-g-color-on-surface-1)) /* = light-dark(#5c5c5c, #aeaeae) */;
  padding-block-start: 0px;
  padding-block-end: 0px;
  font-weight: var(--slds-s-navigation-font-weight) /* = 600 */;
  --slds-c-button-color-background-hover: transparent;
  --slds-c-button-shadow-focus: none;
  --slds-c-button-radius-border: 0;
}

`.slds-tabs_default__overflow-button .slds-button, .slds-tabs--default__overflow-button .slds-button` {
  line-height: inherit;
  color: var(--slds-c-tabs-item-text-color, var(--slds-g-color-on-surface-1)) /* = light-dark(#5c5c5c, #aeaeae) */;
  box-shadow: none;
  --slds-c-button-color-border-active: transparent;
}

`.slds-tabs_default__item.slds-is-active .slds-tabs_default__link, /* +1 more */` {
  font-weight: var(--slds-s-navigation-font-weight-active) /* = 600 */;
}

`.slds-tabs_default__item.slds-is-active .slds-tabs_default__link:hover, /* +1 more */` {
  color: currentcolor;
}

`.slds-tabs_default__overflow-button.slds-has-error .slds-button, /* +3 more */` {
  color: var(--slds-g-color-neutral-base-100) /* = light-dark(#fff, #000) */;
}

`.slds-sub-tabs__item.slds-has-warning:has(.slds-tabs_default__link:focus-visible)::before, /* +5 more */` {
  box-shadow: var(--slds-g-shadow-insetinverse-focus-1) /* = 0px 0px 0px 2px light-dark(#001e5b, #c2daff) inset, 0px 0px 0px 4px light-dark(#fff, #000) inset */;
}

`.slds-card .slds-card, /* +17 more */` {
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 0px;
  border-left-width: 0px;
  border-top-color: initial;
  border-right-color: initial;
  border-bottom-color: initial;
  border-left-color: initial;
  box-shadow: none;
}

`.slds-button` {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding-block-start: var(--slds-c-button-spacing-block-start);
  padding-inline-end: var(--slds-c-button-spacing-inline-end);
  padding-block-end: var(--slds-c-button-spacing-block-end);
  padding-inline-start: var(--slds-c-button-spacing-inline-start);
  background-color: var(--slds-c-button-color-background);
  box-shadow: var(--slds-c-button-shadow, var(--slds-s-button-shadow));
  line-height: 1.875rem;
  color: var(--slds-c-button-text-color, var(--slds-s-button-color, var(--slds-g-color-accent-2))) /* = light-dark(#0250d9, #7cb1fe) */;
  font-weight: var(--slds-c-button-font-weight, var(--slds-g-font-weight-4)) /* = 400 */;
  vertical-align: middle;
}

`.slds-assistive-text` {
  position: absolute;
  margin-top: -1px;
  margin-right: -1px;
  margin-bottom: -1px;
  margin-left: -1px;
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 0px;
  border-left-width: 0px;
  border-top-color: initial;
  border-right-color: initial;
  border-bottom-color: initial;
  border-left-color: initial;
  padding-top: 0px;
  padding-right: 0px;
  padding-bottom: 0px;
  padding-left: 0px;
  width: 1px;
  height: 1px;
  overflow-x: hidden;
  overflow-y: hidden;
  text-transform: none;
}

`.slds-button[disabled], .slds-button:disabled` {
  background-color: transparent;
  border-top-color: transparent;
  border-right-color: transparent;
  border-bottom-color: transparent;
  border-left-color: transparent;
  color: var(--slds-g-color-disabled-1) /* = #757575 */;
}

`.slds-button-group .slds-button, .slds-button-group-list .slds-button` {
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
  border-bottom-left-radius: 0px;
}

`.slds-publisher_comment.slds-is-active, .slds-publisher--comment.slds-is-active` {
  min-height: calc(var(--slds-g-sizing-10) + var(--slds-g-sizing-9)) /* = 3rem */;
  max-height: var(--slds-g-sizing-14) /* = 15rem */;
}


#### Resolved Tokens

| Token | Value |
|-------|-------|
| `--slds-g-color-accent-2` | `light-dark(#0250d9, #7cb1fe)` |
| `--slds-g-color-disabled-1` | `#757575` |
| `--slds-g-color-neutral-base-100` | `light-dark(#fff, #000)` |
| `--slds-g-color-on-surface-1` | `light-dark(#5c5c5c, #aeaeae)` |
| `--slds-g-color-on-surface-3` | `light-dark(#03234d, #d8e6fe)` |
| `--slds-g-color-success-1` | `light-dark(#056764, #01c3b3)` |
| `--slds-g-color-surface-container-1` | `light-dark(#fff, #242424)` |
| `--slds-g-font-weight-4` | `400` |
| `--slds-g-shadow-inset-focus-1` | `0px 0px 0px 2px light-dark(#001e5b, #c2daff) inset` |
| `--slds-g-shadow-insetinverse-focus-1` | `0px 0px 0px 2px light-dark(#001e5b, #c2daff) inset, 0px 0px 0px 4px light-dark(#fff, #000) inset` |
| `--slds-g-shadow-outset-focus-1` | `0px 0px 0px 2px light-dark(#fff, #000), 0px 0px 0px 4px light-dark(#001e5b, #c2daff)` |
| `--slds-g-sizing-10` | `3rem` |
| `--slds-g-sizing-14` | `15rem` |
| `--slds-g-sizing-3` | `0.5rem` |
| `--slds-g-sizing-4` | `0.75rem` |
| `--slds-g-sizing-7` | `1.5rem` |
| `--slds-g-sizing-9` | `2rem` |
| `--slds-s-navigation-color-active` | `light-dark(#022ac0, #a8cbff)` |
| `--slds-s-navigation-color-background-active` | `light-dark(#fff, #242424)` |
| `--slds-s-navigation-font-weight` | `600` |
| `--slds-s-navigation-font-weight-active` | `600` |
| `--slds-s-navigation-sizing-border-active` | `3px` |


---

### Toast

- **Root:** `div.slds-notify_container` > `div.slds-notify.slds-notify_toast`
- **LWC:** `<lightning-toast>` (platform event)
- **Key CSS classes:**
  - `slds-notify_container` -- positioning container
  - `slds-notify` -- notification base
  - `slds-notify_toast` -- toast variant
  - `slds-notify__content` -- message content
  - `slds-notify__close` -- close button container
  - `slds-theme_info` -- info/default (blue)
  - `slds-theme_success` -- success (green)
  - `slds-theme_warning` -- warning (amber)
  - `slds-theme_error` -- error (red)
  - `slds-is-relative` -- position context
- **States:**
  - Theme classes control variant: `slds-theme_info`, `_success`, `_warning`, `_error`
- **ARIA:**
  - `role="status"` on the toast div
  - `aria-hidden="true"` on decorative icons
- **Styling hooks:**
  - `--slds-c-icon-color-background` (transparent for utility icons)
- **Variants:**
  - Base / Info (`slds-theme_info` + utility:info icon)
  - Warning (`slds-theme_warning` + utility:warning icon)
  - Success (`slds-theme_success` + utility:success icon)
  - Error (`slds-theme_error` + utility:error icon)
  - Error With Details
- **Nib mapping:** Toast notifications use top-center positioning. Auto-dismiss ~5s for success, persistent for error. Maps to `wf-badge` color variants.

#### CSS Definitions

`.slds-notify_toast, .slds-notify--toast` {
  display: inline-flex;
  align-items: center;
  position: relative;
  background-color: var(--slds-c-toast-color-background, var(--slds-g-color-on-surface-1)) /* = light-dark(#5c5c5c, #aeaeae) */;
  color: var(--slds-c-toast-text-color);
  padding-block-start: var(--slds-c-toast-spacing-block-start, var(--slds-g-spacing-3)) /* = 0.75rem */;
  padding-inline-end: var(--slds-c-toast-spacing-inline-end, var(--slds-g-spacing-8)) /* = 3rem */;
  padding-block-end: var(--slds-c-toast-spacing-block-end, var(--slds-g-spacing-3)) /* = 0.75rem */;
  padding-inline-start: var(--slds-c-toast-spacing-inline-start, var(--slds-g-spacing-5)) /* = 1.5rem */;
  min-width: var(--slds-c-toast-sizing-min-width, var(--slds-g-sizing-16)) /* = 30rem */;
  text-align: left;
  justify-content: flex-start;
  box-shadow: var(--slds-g-shadow-3) /* = 0px 0px 7px 0px light-dark(#00000024, #00000047), 0px 5px 5px 0px light-dark(#00000024, #00000047), 0px -1px 2px 0px light-dark(#00000014, #00000029) */;
  max-width: 50%;
}

`.slds-notify_toast .slds-notify__close, .slds-notify--toast .slds-notify__close` {
  position: absolute;
  top: var(--slds-g-spacing-3) /* = 0.75rem */;
  margin-inline-start: var(--slds-g-spacing-1) /* = 0.25rem */;
}

`.slds-notify_toast .slds-notify__content .slds-text-heading_small, /* +1 more */` {
  font-weight: var(--slds-s-alert-font-weight) /* = 600 */;
}

`.slds-button` {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding-block-start: var(--slds-c-button-spacing-block-start);
  padding-inline-end: var(--slds-c-button-spacing-inline-end);
  padding-block-end: var(--slds-c-button-spacing-block-end);
  padding-inline-start: var(--slds-c-button-spacing-inline-start);
  background-color: var(--slds-c-button-color-background);
  box-shadow: var(--slds-c-button-shadow, var(--slds-s-button-shadow));
  line-height: 1.875rem;
  color: var(--slds-c-button-text-color, var(--slds-s-button-color, var(--slds-g-color-accent-2))) /* = light-dark(#0250d9, #7cb1fe) */;
  font-weight: var(--slds-c-button-font-weight, var(--slds-g-font-weight-4)) /* = 400 */;
  vertical-align: middle;
}

`.slds-assistive-text` {
  position: absolute;
  margin-top: -1px;
  margin-right: -1px;
  margin-bottom: -1px;
  margin-left: -1px;
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 0px;
  border-left-width: 0px;
  border-top-color: initial;
  border-right-color: initial;
  border-bottom-color: initial;
  border-left-color: initial;
  padding-top: 0px;
  padding-right: 0px;
  padding-bottom: 0px;
  padding-left: 0px;
  width: 1px;
  height: 1px;
  overflow-x: hidden;
  overflow-y: hidden;
  text-transform: none;
}

`.slds-button + .slds-button` {
  margin-inline-start: var(--slds-g-spacing-1) /* = 0.25rem */;
}

`.slds-button[disabled], .slds-button:disabled` {
  background-color: transparent;
  border-top-color: transparent;
  border-right-color: transparent;
  border-bottom-color: transparent;
  border-left-color: transparent;
  color: var(--slds-g-color-disabled-1) /* = #757575 */;
}

`.slds-button-group .slds-button, .slds-button-group-list .slds-button` {
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
  border-bottom-left-radius: 0px;
}


#### Resolved Tokens

| Token | Value |
|-------|-------|
| `--slds-g-color-accent-2` | `light-dark(#0250d9, #7cb1fe)` |
| `--slds-g-color-disabled-1` | `#757575` |
| `--slds-g-color-neutral-base-100` | `light-dark(#fff, #000)` |
| `--slds-g-color-on-surface-1` | `light-dark(#5c5c5c, #aeaeae)` |
| `--slds-g-color-on-surface-inverse-1` | `light-dark(#fff, #181818)` |
| `--slds-g-font-scale-neg-2` | `0.625rem` |
| `--slds-g-font-weight-4` | `400` |
| `--slds-g-shadow-3` | `0px 0px 7px 0px light-dark(#00000024, #00000047), 0px 5px 5px 0px light-dark(#00000024, #00000047), 0px -1px 2px 0px light-dark(#00000014, #00000029)` |
| `--slds-g-shadow-inset-focus-1` | `0px 0px 0px 2px light-dark(#001e5b, #c2daff) inset` |
| `--slds-g-shadow-outset-focus-1` | `0px 0px 0px 2px light-dark(#fff, #000), 0px 0px 0px 4px light-dark(#001e5b, #c2daff)` |
| `--slds-g-sizing-16` | `30rem` |
| `--slds-g-sizing-3` | `0.5rem` |
| `--slds-g-sizing-4` | `0.75rem` |
| `--slds-g-sizing-5` | `1rem` |
| `--slds-g-sizing-6` | `1.25rem` |
| `--slds-g-sizing-7` | `1.5rem` |
| `--slds-g-spacing-1` | `0.25rem` |
| `--slds-g-spacing-2` | `0.5rem` |
| `--slds-g-spacing-3` | `0.75rem` |
| `--slds-g-spacing-5` | `1.5rem` |
| `--slds-g-spacing-8` | `3rem` |
| `--slds-s-alert-font-weight` | `600` |
| `--slds-s-navigation-font-weight` | `600` |


---

### Activity Timeline

- **Slug:** `activity-timeline`
- **Variants:** (skeleton)
- **Nib mapping:** `.sfdc-feed-item-link`, `.sfdc-feed-avatar`

---

### Agentforce

- **Slug:** `agentforce`
- **Variants:** (skeleton)

---

### Alert

- **Slug:** `alert`
- **Variants:** (skeleton)

---

### App Launcher

- **Slug:** `app-launcher`
- **Variants:** (skeleton)

---

### Avatar

- **Slug:** `avatar`
- **Key CSS classes:** `slds-avatar`, `slds-avatar_circle`, `slds-avatar_x-small`, `slds-avatar_small`, `slds-avatar_medium`, `slds-avatar_large`
- **Variants:** (skeleton)
- **Nib mapping:** `.sfdc-feed-avatar`

---

### Avatar Group

- **Slug:** `avatar-group`
- **Variants:** (skeleton)

---

### Brand Band

- **Slug:** `brand-band`
- **Variants:** (skeleton)

---

### Breadcrumbs

- **Slug:** `breadcrumbs`
- **Key CSS classes:** `slds-breadcrumb`, `slds-breadcrumb__item`, `slds-list_horizontal`, `slds-wrap`
- **Variants:** (skeleton)

---

### Builder Header

- **Slug:** `builder-header`
- **Variants:** (skeleton)

---

### Button Dual Stateful

- **Slug:** `button-dual-stateful`
- **Variants:** (skeleton)

---

### Button Group

- **Slug:** `button-group`
- **Key CSS classes:** `slds-button-group`, `slds-button-group-list`, `slds-button_last`
- **Variants:** (skeleton)

---

### Button Icon

- **Slug:** `button-icon`
- **Key CSS classes:** `slds-button_icon`, `slds-button_icon-border`, `slds-button_icon-border-filled`, `slds-button_icon-bare`, `slds-button_icon-inverse`, `slds-button_icon-container`
- **Variants:** (skeleton)

---

### Button Stateful

- **Slug:** `button-stateful`
- **Key CSS classes:** `slds-button_stateful`, `slds-not-selected`, `slds-text-not-selected`, `slds-text-selected`
- **Variants:** (skeleton)

---

### Carousel

- **Slug:** `carousel`
- **Variants:** (skeleton)

---

### Chat

- **Slug:** `chat`
- **Variants:** (skeleton)

---

### Checkbox

- **Slug:** `checkbox`
- **Key CSS classes:** `slds-checkbox`, `slds-checkbox__label`, `slds-checkbox_faux`, `slds-checkbox_standalone`
- **Variants:** (skeleton)

---

### Checkbox Button

- **Slug:** `checkbox-button`
- **Variants:** (skeleton)

---

### Checkbox Button Group

- **Slug:** `checkbox-button-group`
- **Variants:** (skeleton)

---

### Checkbox Toggle

- **Slug:** `checkbox-toggle`
- **Variants:** (skeleton)

---

### Color Picker

- **Slug:** `color-picker`
- **Variants:** (skeleton)

---

### Counter

- **Slug:** `counter`
- **Variants:** (skeleton)

---

### Datepicker

- **Slug:** `datepicker`
- **Variants:** (skeleton)

---

### Datetime Picker

- **Slug:** `datetime-picker`
- **Variants:** (skeleton)

---

### Docked Composer

- **Slug:** `docked-composer`
- **Variants:** (skeleton)

---

### Docked Form Footer

- **Slug:** `docked-form-footer`
- **Variants:** (skeleton)

---

### Docked Utility Bar

- **Slug:** `docked-utility-bar`
- **Variants:** (skeleton)

---

### Drop Zone

- **Slug:** `drop-zone`
- **Variants:** (skeleton)

---

### Dueling Picklist

- **Slug:** `dueling-picklist`
- **Key CSS classes:** `slds-dueling-list`, `slds-dueling-list__column`, `slds-dueling-list__options`
- **Variants:** (skeleton)

---

### Dynamic Icons

- **Slug:** `dynamic-icons`
- **Variants:** (skeleton)

---

### Dynamic Menu

- **Slug:** `dynamic-menu`
- **Variants:** (skeleton)

---

### Expandable Section

- **Slug:** `expandable-section`
- **Variants:** (skeleton)

---

### Expression

- **Slug:** `expression`
- **Variants:** (skeleton)

---

### Feed

- **Slug:** `feed`
- **Variants:** (skeleton)
- **Nib mapping:** `.sfdc-feed-item-link`, `.sfdc-feed-avatar`, `.sfdc-feed-text`, `.sfdc-feed-time`

---

### File

- **Slug:** `file`
- **Variants:** (skeleton)

---

### File Selector

- **Slug:** `file-selector`
- **Variants:** (skeleton)

---

### Form Element

- **Slug:** `form-element`
- **Key CSS classes:** `slds-form-element`, `slds-form-element__label`, `slds-form-element__control`, `slds-form-element__help`
- **Variants:** (skeleton)

---

### Global Navigation

- **Slug:** `global-navigation`
- **Variants:** (skeleton)

---

### Icon

- **Slug:** `icon`
- **Key CSS classes:** `slds-icon`, `slds-icon_container`, `slds-icon_small`, `slds-icon_x-small`, `slds-icon-text-default`, `slds-current-color`
- **Variants:** (skeleton)

---

### Illustration

- **Slug:** `illustration`
- **Key CSS classes:** `slds-illustration`, `slds-illustration_small`, `slds-illustration__svg`
- **Variants:** (skeleton)

---

### Lookup

- **Slug:** `lookup`
- **Variants:** (skeleton)

---

### Map

- **Slug:** `map`
- **Variants:** (skeleton)

---

### Menu

- **Slug:** `menu`
- **Key CSS classes:** `slds-dropdown`, `slds-dropdown-trigger`, `slds-dropdown-trigger_click`
- **Variants:** (skeleton)

---

### Notifications

- **Slug:** `notifications`
- **Variants:** (skeleton)

---

### Panel

- **Slug:** `panel`
- **Variants:** (skeleton)

---

### Path Simple

- **Slug:** `path-simple`
- **Variants:** (skeleton)

---

### Picklist

- **Slug:** `picklist`
- **Variants:** (skeleton)

---

### Popover

- **Slug:** `popover`
- **Key CSS classes:** `slds-popover`, `slds-popover__body`, `slds-popover_tooltip`, `slds-nubbin_top`, `slds-nubbin_bottom-left`
- **Variants:** (skeleton)

---

### Progress Bar

- **Slug:** `progress-bar`
- **Variants:** (skeleton)

---

### Progress Indicator

- **Slug:** `progress-indicator`
- **Variants:** (skeleton)

---

### Progress Ring

- **Slug:** `progress-ring`
- **Variants:** (skeleton)

---

### Prompt

- **Slug:** `prompt`
- **Variants:** (skeleton)

---

### Publisher

- **Slug:** `publisher`
- **Variants:** (skeleton)

---

### Radio Button Group

- **Slug:** `radio-button-group`
- **Variants:** (skeleton)

---

### Radio Group

- **Slug:** `radio-group`
- **Variants:** (skeleton)

---

### Rich Text Editor

- **Slug:** `rich-text-editor`
- **Variants:** (skeleton)

---

### Scoped Notifications

- **Slug:** `scoped-notifications`
- **Variants:** (skeleton)

---

### Select

- **Slug:** `select`
- **Variants:** (skeleton)

---

### Setup Assistant

- **Slug:** `setup-assistant`
- **Variants:** (skeleton)

---

### Slider

- **Slug:** `slider`
- **Variants:** (skeleton)

---

### Spinner

- **Slug:** `spinner`
- **Key CSS classes:** `slds-spinner`, `slds-spinner_small`, `slds-spinner_brand`, `slds-spinner__dot-a`, `slds-spinner__dot-b`
- **Variants:** (skeleton)

---

### Split View

- **Slug:** `split-view`
- **Variants:** (skeleton)

---

### Summary Detail

- **Slug:** `summary-detail`
- **Variants:** (skeleton)

---

### Textarea

- **Slug:** `textarea`
- **Variants:** (skeleton)

---

### Tile

- **Slug:** `tile`
- **Key CSS classes:** `slds-tile`, `slds-tile__title`, `slds-tile__detail`
- **Variants:** (skeleton)

---

### Timepicker

- **Slug:** `timepicker`
- **Variants:** (skeleton)

---

### Tooltip

- **Slug:** `tooltip`
- **Key CSS classes:** `slds-popover`, `slds-popover_tooltip`, `slds-popover__body`
- **Variants:** (skeleton)

---

### Tree Grid

- **Slug:** `tree-grid`
- **Variants:** (skeleton)

---

### Trees

- **Slug:** `trees`
- **Variants:** (skeleton)

---

### Trial Bar

- **Slug:** `trial-bar`
- **Variants:** (skeleton)

---

### Vertical Navigation

- **Slug:** `vertical-navigation`
- **Variants:** (skeleton)

---

### Visual Picker

- **Slug:** `visual-picker`
- **Variants:** (skeleton)

---

### Welcome Mat

- **Slug:** `welcome-mat`
- **Variants:** (skeleton)

---

### Wizard

- **Slug:** `wizard`
- **Variants:** (skeleton)

---

## Appendix: Full Component List (87)

1. Accordion
2. Activity Timeline
3. Agentforce
4. Alert
5. App Launcher
6. Avatar
7. Avatar Group
8. Badge
9. Brand Band
10. Breadcrumbs
11. Builder Header
12. Button
13. Button Dual Stateful
14. Button Group
15. Button Icon
16. Button Stateful
17. Card
18. Carousel
19. Chat
20. Checkbox
21. Checkbox Button
22. Checkbox Button Group
23. Checkbox Toggle
24. Color Picker
25. Combobox
26. Counter
27. Data Table
28. Datepicker
29. Datetime Picker
30. Docked Composer
31. Docked Form Footer
32. Docked Utility Bar
33. Drop Zone
34. Dueling Picklist
35. Dynamic Icons
36. Dynamic Menu
37. Expandable Section
38. Expression
39. Feed
40. File
41. File Selector
42. Form Element
43. Global Header
44. Global Navigation
45. Icon
46. Illustration
47. Input
48. Lookup
49. Map
50. Menu
51. Modal
52. Notifications
53. Page Header
54. Panel
55. Path
56. Path Simple
57. Picklist
58. Pill
59. Popover
60. Progress Bar
61. Progress Indicator
62. Progress Ring
63. Prompt
64. Publisher
65. Radio Button Group
66. Radio Group
67. Rich Text Editor
68. Scoped Notifications
69. Select
70. Setup Assistant
71. Slider
72. Spinner
73. Split View
74. Summary Detail
75. Tabs
76. Textarea
77. Tile
78. Timepicker
79. Toast
80. Tooltip
81. Tree Grid
82. Trees
83. Trial Bar
84. Vertical Navigation
85. Visual Picker
86. Welcome Mat
87. Wizard

---

## Appendix: Nib Token Cross-Reference

| SLDS 2 Hook | Nib Token | Purpose |
|-------------|-----------|---------|
| `--slds-g-color-surface-1` | `var(--wf-white)` | Primary background |
| `--slds-g-color-surface-container-1` | `var(--wf-surface)` | Card/container background |
| `--slds-g-color-on-surface-1` | `var(--wf-ink)` | Primary text |
| `--slds-g-color-on-surface-2` | `var(--wf-text)` | Body text |
| `--slds-g-color-on-surface-3` | `var(--wf-muted)` | Secondary/label text |
| `--slds-g-color-border-1` | `var(--wf-line)` | Primary borders |
| `--slds-g-color-border-2` | `var(--wf-tint)` | Subtle dividers |
| `--slds-g-color-accent-1` | `var(--wf-accent)` | Brand/action color |
| `--slds-g-color-error-1` | `var(--wf-red)` | Error/destructive |
| `--slds-g-color-warning-1` | `var(--wf-amber)` | Warning/caution |
| `--slds-g-color-success-1` | `var(--wf-green)` | Success/positive |
| `--slds-g-color-info-1` | `var(--wf-purple)` | Informational/AI |

---

## Appendix: Nib Class Cross-Reference

| SLDS Class Pattern | Nib Class | Notes |
|-------------------|-----------|-------|
| `slds-page-header` | `.sfdc-record-header` | Record page header |
| `slds-card` | `.sfdc-card` | Card container |
| `slds-card__header` | `.sfdc-card-header` | Card header |
| `slds-card__body` | `.sfdc-card-body` | Card body |
| `slds-button_neutral` | `.sfdc-btn` | Standard button |
| `slds-button_brand` | `.sfdc-btn-primary` | Primary button |
| `slds-path` | `.sfdc-path-bar` | Stage progress bar |
| `slds-path__item` | `.sfdc-path-step` | Path step |
| `slds-tabs_default` | `.sfdc-tabs` | Tab bar |
| `slds-tabs_default__item.slds-is-active` | `.sfdc-tab.active` | Active tab |
| `slds-table` | `.sfdc-table` | Data table |
| `slds-badge` | `wf-badge` | Status badge |
| `slds-form-element` | `.sfdc-detail-field` | Form field |
| `slds-notify_toast` | (inline toast) | Toast notification |
| `slds-modal` | (overlay pattern) | Modal dialog |
