# Salesforce Lightning Design System Rules

> ⚠️ **Deprecated.** Edit [`docs/SLDS-Rules.md`](../docs/SLDS-Rules.md) instead. This file will be removed in a future release.

> Authoritative rules for building Salesforce-style wireframes in nib. Grounded in the official Lightning Design System 2 (SLDS 2), Cosmos theme, and WCAG 2.1 AA accessibility standards.

## How This Document Was Established

See [ref/research/slds-research-sources.md](research/slds-research-sources.md) for the full provenance trail — every source URL, what was extracted, and how findings were synthesized into these rules.

---

## 1. Design System Architecture

SLDS 2 decouples **structure** from **visual style** using CSS custom properties called **styling hooks**. This replaces the SLDS 1 design token approach with a more flexible, themeable system.

### Naming Convention

All official hooks use the `--slds` namespace:

```
--[namespace]-[scope]-[category]-[property]-[role]-[state]-[range]
```

| Segment | Values | Example |
|---------|--------|---------|
| Namespace | `--slds` | Always |
| Scope | `g` (global), `c` (component) | `--slds-g-*`, `--slds-c-*` |
| Category | `color`, `font`, `spacing`, `shadow`, `radius`, `sizing` | `--slds-g-color-*` |
| Property | Specific aspect | `surface`, `border`, `accent` |
| Role | Semantic purpose | `container`, `on-surface`, `disabled` |
| Range | Scale level | `1`, `2`, `3`, `4` |

### Nib Mapping

Nib uses `--wf-*` tokens instead of `--slds-g-*` hooks. The Salesforce surface CSS (`surfaces/salesforce.css`) maps framework tokens to SLDS-equivalent visual roles:

| SLDS 2 Hook | Nib Token | SLDS Hex (Cosmos) | Purpose |
|-------------|-------------------|-------------------|---------|
| `--slds-g-color-surface-1` | `var(--wf-white)` | `#FFFFFF` | Primary background |
| `--slds-g-color-surface-container-1` | `var(--wf-surface)` | `#F3F3F3` | Card/container background |
| `--slds-g-color-on-surface-1` | `var(--wf-ink)` | `#181818` | Primary text |
| `--slds-g-color-on-surface-2` | `var(--wf-text)` | `#444444` | Body text |
| `--slds-g-color-on-surface-3` | `var(--wf-muted)` | `#7E8C99` | Secondary/label text |
| `--slds-g-color-border-1` | `var(--wf-line)` | `#C9C9C9` | Primary borders |
| `--slds-g-color-border-2` | `var(--wf-tint)` | `#E5E5E5` | Subtle dividers |
| `--slds-g-color-accent-1` | `var(--wf-accent)` | `#0070D2` | Brand/action (SCIENCE_BLUE) |
| `--slds-g-color-error-1` | `var(--wf-red)` | `#C23934` | Error/destructive (FLUSH_MAHOGANY) |
| `--slds-g-color-warning-1` | `var(--wf-amber)` | `#844800` | Warning/caution (CINNAMON) |
| `--slds-g-color-success-1` | `var(--wf-green)` | `#04844B` | Success/positive (SALEM) |
| `--slds-g-color-info-1` | `var(--wf-purple)` | `#5A1BA9` | Informational/AI |
| (header) | (surface CSS) | `#061C3F` | SFDC global header bg (DEEP_COVE) |
| (warning bg) | (surface CSS) | `#FF9A3C` | Warning background (TANGERINE) |

> **Polished fidelity:** When `data-wf-fidelity="polished"` and `data-wf-surface="sfdc"`, `surfaces/salesforce.css` overrides the wireframe-muted `--wf-*` values with the real SLDS hex values above. This gives pages production-accurate colors without changing any HTML.

---

## 2. Color System

### Semantic Color Roles

SLDS 2 organizes colors by **semantic role**, not by hue. Every color has a purpose:

| Role | Usage | Proto Equivalent |
|------|-------|-----------------|
| **Surface** | Page and card backgrounds | `--wf-white`, `--wf-canvas`, `--wf-surface` |
| **On-surface** | Text and icons on surfaces | `--wf-ink`, `--wf-text`, `--wf-muted` |
| **Border** | Lines, dividers, card edges | `--wf-line`, `--wf-tint` |
| **Accent** | Brand, links, primary actions | `--wf-accent` |
| **Error** | Destructive actions, validation errors | `--wf-red` |
| **Warning** | Caution states, pending items | `--wf-amber` |
| **Success** | Confirmation, completed states | `--wf-green` |
| **Info** | AI suggestions, informational | `--wf-purple` |
| **Disabled** | Non-interactive, inactive states | `--wf-muted` + reduced opacity |

### Color Accessibility (WCAG 2.1 AA)

These ratios are **mandatory** — SLDS 2 enforces them:

| Element | Minimum Contrast Ratio |
|---------|----------------------|
| Body text (< 24px) | 4.5:1 against background |
| Large text (>= 24px or >= 19px bold) | 3:1 against background |
| UI components (borders, icons, focus rings) | 3:1 against adjacent colors |
| Non-text content (charts, status indicators) | 3:1 against background |

**Rules for nib wireframes:**
- Never use `--wf-muted` text on `--wf-surface` background — insufficient contrast
- Status badges must use their color-on-white variant (the `wf-badge-*` classes handle this)
- Icon-only buttons need visible borders or backgrounds, not just color
- Focus states must show a visible outline (SLDS uses 2px solid accent)
- Do not rely on color alone to convey meaning — always pair with text, icons, or patterns

### Accessible Color Palette (SLDS 2)

SLDS 2 provides 14 immutable color families, each with 12 lightness stops (10-95). The mutable brand palette maps to these stops:

```
neutral-base-10 → neutral-base-100  (13 values: grays)
brand-base-10   → brand-base-100    (13 values: primary brand)
error-base-10   → error-base-100    (10 values: reds)
warning-base-10 → warning-base-100  (10 values: ambers/oranges)
success-base-10 → success-base-100  (10 values: greens)
```

Immutable palette families: blue, cloud-blue, green, hot-orange, indigo, orange, pink, purple, red, teal, violet, yellow, neutral.

---

## 3. Typography

### Font Stack

SLDS deprecated **Salesforce Sans** in Summer '21 (Safe Harbor release). The default is now the OS system font stack:

```css
/* SLDS 2 default (post Summer '21): */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
/* Nib: */
font-family: var(--wf-font); /* system stack — already aligned */
```

**Key facts:**
- Salesforce Sans is no longer bundled or loaded by default
- Existing orgs that previously used Salesforce Sans were migrated automatically
- The system-ui stack renders platform-native (San Francisco on macOS/iOS, Segoe UI on Windows, Roboto on Android)
- Nib's `var(--wf-font)` system stack already matches this behavior — no changes needed

### Type Scale

SLDS 2 uses a scaled type system via `--slds-g-font-size-base` with 15 graduated sizes. Nib maps to these approximate ranges:

| SLDS Purpose | SLDS Range | Proto Size | Proto Usage |
|-------------|-----------|-----------|-------------|
| Page title | 20-24px | 20px | `.sfdc-record-name` |
| Section heading | 12-14px | 12px, bold, uppercase | `.sfdc-card-header h3` |
| Body text | 12-14px | 12-13px | `.sfdc-feed-text`, `.sfdc-field-value` |
| Label text | 10-11px | 10px, bold, uppercase | `.sfdc-highlight-label`, `.sfdc-detail-label` |
| Meta/timestamp | 10-11px | 10-11px | `.sfdc-feed-time`, `.sfdc-related-sub` |
| Badge text | 9-11px | 11px | `wf-badge` |

### Typography Rules

- **Labels** are ALWAYS uppercase, letter-spaced (0.3-0.5px), 10px, bold
- **Values** are sentence-case, 12-13px, medium weight (500-600)
- **Section headers** in cards are uppercase, 12px, bold, letter-spaced
- **Record names** are the largest text on the page (20px, 700 weight)
- Never exceed 20px for any text in the record page body
- Timestamps use 10px `--wf-muted` color

---

## 4. Spacing & Sizing

### Spacing Scale

SLDS 2 uses `--slds-g-spacing-*` hooks with a root-font-size-based scale. Nib uses pixel values:

| Context | SLDS Approach | Proto Value |
|---------|--------------|------------|
| Card padding | `--slds-g-spacing-4` | 14-16px |
| Card header padding | `--slds-g-spacing-3` | 10-16px |
| Section gap | `--slds-g-spacing-4` | 12-16px |
| Page padding | `--slds-g-spacing-6` | 16-24px |
| Item gap (vertical) | `--slds-g-spacing-2` | 8-10px |
| Inline gap | `--slds-g-spacing-2` | 6-8px |

### Border Radius

SLDS 2 introduces more rounded corners via `--slds-g-radius-border-*`:

| Hook | Approx. Value | Proto Usage |
|------|-------------|-------------|
| `--slds-g-radius-border-1` | 2-3px | Subtle rounding (inputs) |
| `--slds-g-radius-border-2` | 4px | Buttons, path steps |
| `--slds-g-radius-border-3` | 6px | Cards (`.sfdc-card`) |
| `--slds-g-radius-border-4` | 8-12px | Record icons, large containers |
| `--slds-g-radius-circle` | 50% | Avatars, status dots |
| `--slds-g-radius-border-pill` | 999px | Pill badges, partner badges |

**Cosmos theme note:** SLDS 2 Cosmos uses noticeably more rounded corners than SLDS 1. Cards use 6px radius. Buttons use 4px. The overall aesthetic is softer and more welcoming.

### Shadow Scale

| Hook | Usage | Proto Equivalent |
|------|-------|-----------------|
| `--slds-g-shadow-1` | Subtle card shadow | `var(--wf-paper-shadow)` |
| `--slds-g-shadow-2` | Elevated card (hover) | hover shadow in wireframe mode |
| `--slds-g-shadow-3` | Modal overlay | modal backdrop shadow |
| `--slds-g-shadow-4` | Popover/dropdown | dropdown shadow |

### Border Width

| Hook | Value | Usage |
|------|-------|-------|
| `--slds-g-sizing-border-1` | 1px | Standard borders |
| `--slds-g-sizing-border-2` | 1.5px | Emphasized borders (cards) |
| `--slds-g-sizing-border-3` | 2px | Active/focus states |
| `--slds-g-sizing-border-4` | 3px | Accent borders (card variants) |

---

## 5. Component Patterns

### Complete SLDS 2 Component Inventory

Components available in Lightning Design System 2:

**Input & Forms:**
Checkbox, Checkbox Button, Checkbox Toggle, Color Picker, Combobox, Datepicker, Datetime Picker, Dual Listbox, File Selector, Form Element, Input, Radio Button Group, Radio Group, Rich Text Editor, Select, Slider, Textarea, Timepicker

**Display & Data:**
Accordion, Avatar, Badge, Cards, Carousel, Data Table, Dynamic Icons, Empty State, Icons, Map, Pills, Progress Bar, Progress Indicator, Progress Ring, Spinners, Tree, Tree Grid

**Navigation:**
Breadcrumbs, Button, Button Groups, Button Icons, Menu, Scoped Tabs, Tabs, Vertical Navigation

**Feedback:**
Modals, Prompt, Toast, Tooltip

### Record Page Anatomy (SLDS Pattern)

Every Salesforce record page follows this hierarchy:

```
┌─────────────────────────────────────────────┐
│  Record Header                              │
│  [Icon] [Type] [Name]        [Actions]      │
├─────────────────────────────────────────────┤
│  Highlights Bar (3-5 key fields)            │
├─────────────────────────────────────────────┤
│  Path/Stage Bar (progress indicator)        │
├─────────────────────────────────────────────┤
│  Tab Bar (Details | Activity | Related)     │
├──────────┬──────────────────┬───────────────┤
│ Related  │ Record Detail    │ Activity      │
│ Lists    │ (field/value     │ Timeline      │
│          │  pairs in grid)  │               │
│ Contacts │                  │ Feed items    │
│ Products │ Detail Grid      │ with avatars  │
│ Tasks    │ (2-col labels)   │               │
└──────────┴──────────────────┴───────────────┘
```

### Card Pattern

SLDS cards have a consistent structure:

```
┌─────────────────────────────────┐
│ SECTION TITLE          [Action] │  ← header: bg=surface, uppercase title
├─────────────────────────────────┤
│                                 │
│  Card body content              │  ← body: bg=white, 14-16px padding
│                                 │
└─────────────────────────────────┘
```

- Header background: `var(--wf-surface)` (light gray)
- Header title: 12px, bold, uppercase, letter-spaced
- Header action: 11px, accent color link
- Body: 14-16px padding
- Border: 1px `var(--wf-line)`
- Radius: 6px

### Path/Stage Bar Pattern

- Steps fill horizontally with equal widths
- States: `.complete` (filled accent), `.current` (outline accent), default (surface bg), `.lost` (red fill)
- "Mark as Complete" button anchored to the right
- Expandable detail panel shows coaching guidance + key fields for each stage
- Chevron icon rotates 90° when expanded

### Data Table Pattern

- Header row: surface background, uppercase labels, 10px, bold
- Data rows: 12px, border-bottom tint
- Row hover: accent-fill background
- Links: accent color, no underline until hover
- Inline editing supported via `lightning-datatable` pattern

### Toast Notification Pattern

- Position: top-center, floating above content
- Duration: auto-dismiss after ~5 seconds (success), persistent (error)
- Variants: success (green), error (red), warning (amber), info (purple)
- Structure: icon + label + message + optional link + close button

### Modal Pattern

- Centered overlay with backdrop
- Header: title + close button
- Body: scrollable content area
- Footer: action buttons (right-aligned, primary on right)
- Focus trapped within modal while open
- Escape key dismisses

---

## 6. Layout Rules

### Record Page Grid

The 3-column layout is the standard Salesforce record page:

| Column | Width | Content |
|--------|-------|---------|
| Left (`.sfdc-col-related`) | 280px fixed | Related lists, partner cards |
| Center (`.sfdc-col-record`) | 1fr flex | Record details, detail grid |
| Right (`.sfdc-col-activity`) | 320px fixed | Activity timeline, feed |

**Responsive breakpoints:**
- < 1200px: 2-column (left + center); activity drops to full-width row
- < 900px: single column stack

### Display Density

SLDS 2 supports two density modes:

| Mode | Vertical Padding | Row Height | Use Case |
|------|-----------------|------------|----------|
| Comfy | Standard (12-16px) | Relaxed | Default, readability |
| Compact | Reduced (8-10px) | Tight | Data-heavy views, power users |

Nib defaults to Comfy density.

---

## 7. Accessibility Requirements

### WCAG 2.1 AA Compliance (Mandatory)

SLDS 2 base components conform to WCAG 2.1 AA. Nib wireframes MUST maintain:

1. **Text contrast**: 4.5:1 minimum (3:1 for large text)
2. **Non-text contrast**: 3:1 for UI component boundaries (buttons, inputs, focus states)
3. **Focus visibility**: All interactive elements must show a visible focus ring
4. **Keyboard navigation**: All functionality accessible via keyboard
5. **ARIA landmarks**: Use semantic HTML + ARIA roles for screen readers
6. **Touch targets**: Minimum 44x44px for mobile interactions

### Focus State Pattern

```css
/* SLDS focus pattern */
:focus-visible {
  outline: 2px solid var(--wf-accent);
  outline-offset: 2px;
}
```

### Screen Reader Considerations

- Labels always visible (no placeholder-only inputs)
- Status badges include `aria-label` with full status text
- Path steps use `aria-current="step"` for the current stage
- Modals use `role="dialog"` with `aria-modal="true"`
- Toast notifications use `role="status"` with `aria-live="polite"`

---

## 8. Interaction Patterns

### Button Hierarchy

SLDS defines a strict button hierarchy:

| Priority | Class | Visual | Usage |
|----------|-------|--------|-------|
| Primary | `.sfdc-btn-primary` | Filled accent | One per section max |
| Secondary | `.sfdc-btn` | Outlined | Supporting actions |
| Destructive | `.sfdc-btn` + red variant | Outlined red | Delete, remove |
| Ghost/Icon | `.sfdc-btn-sm` | Minimal | Overflow menus, compact areas |

**Rules:**
- Maximum ONE primary button per visible section
- Primary button is always the rightmost action
- Destructive actions require confirmation (modal or inline)
- Button groups use consistent sizing (don't mix sizes)

### Navigation Patterns

- **Breadcrumbs**: Object type > Record name (max 3 levels)
- **Tabs**: Details | Activity | Related (standard order)
- **Vertical Navigation**: Left sidebar for app-level nav
- **Path Bar**: Linear stage progression (not random-access)

### Notification Hierarchy

| Type | Pattern | Persistence |
|------|---------|-------------|
| Toast | Top-center floating | Auto-dismiss (5s) |
| Banner | Full-width inline | Until dismissed |
| Modal prompt | Centered overlay | Until action taken |
| Inline validation | Below field | Until corrected |

---

## 9. SLDS 2 vs SLDS 1 Changes

Key visual and architectural differences:

| Aspect | SLDS 1 | SLDS 2 (Cosmos) |
|--------|--------|-----------------|
| Theming | Design tokens (Sass) | CSS custom properties (styling hooks) |
| Border radius | Sharp (2-4px) | Rounded (4-12px) |
| Visual density | Dense by default | Comfy by default |
| Color palette | Fixed brand blue | 9 accent color options + expanded palette |
| Dark mode | Not supported | Architecturally supported |
| Icons | Static | Dynamic icon variants |
| Typography | Tighter | More reader-friendly scale |
| Spacing | Compact | More generous whitespace |
| Cognitive load | Information-dense | Reduced, at-a-glance views |

### Migration Implications for Nib

The current `surfaces/salesforce.css` follows SLDS 1 patterns (sharp corners, compact density). To align with Cosmos:
- Cards could use `border-radius: 8px` instead of `6px`
- Buttons could use `border-radius: 6px` instead of `4px`
- More generous padding (16-20px instead of 10-14px in headers)
- The `html.wireframe` overrides already handle this via `--wf-wobble-radius`

---

## 10. AI & Agentic Design (SLDS 2)

SLDS 2 is described as "the foundation of our agentic design system." Components include descriptive metadata for AI-first experiences:

- Components are enhanced with metadata that AI agents can read
- The design system supports "AI Ready" components
- Conversation design patterns exist for agent UIs
- "Vibe coding" guidance helps agents generate SLDS-compliant UI

**For nib:** This aligns with our agent-consumable ref docs approach. Agents generating Salesforce wireframes should read this rules file to produce SLDS-compliant output.

---

## 11. Wireframe-Specific Rules

### Always

- Start record pages with `.sfdc-record-page`
- Use `.sfdc-record-layout` for the 3-column grid (NOT custom grids)
- Wrap card titles in `<h3>` tags
- Use `<label>` for field names in detail grids
- Show 3-5 highlights in the highlights bar (not the full record)
- Put the path bar between highlights and the tab/layout area
- Use `wf-badge` for status indicators (shared framework, not SFDC-specific)
- Make activity feed items that link to wireframe screens clickable (`<a>`)
- Maintain the paper aesthetic in wireframe mode (shadows, wobble, sketchy borders)

### Never

- Don't mix Salesforce surface CSS with other surfaces (Slack, Internal DS) on the same page
- Don't exceed 5 columns in the highlights bar
- Don't use more than one primary button per card/section
- Don't hardcode hex colors — always use `var(--wf-*)` tokens
- Don't skip the record header on record pages
- Don't use `sfdc-record-grid` (the correct class is `sfdc-record-layout`)
- Don't use `sfdc-col-detail` (the correct class is `sfdc-col-record`)
- Don't place related lists in the center column (they go left)
- Don't put record details in the right column (activity feed goes there)

---

## Quick Reference: Class Inventory

### Page Structure
| Class | Purpose |
|-------|---------|
| `.sfdc-record-page` | Root container |
| `.sfdc-record-header` | Page header area |
| `.sfdc-record-header-top` | Header flex row |
| `.sfdc-record-icon` | Object icon (colored square) |
| `.sfdc-record-info` | Name + type container |
| `.sfdc-record-type` | Object type label |
| `.sfdc-record-name` | Record title |
| `.sfdc-record-actions` | Action button group |

### Layout
| Class | Purpose |
|-------|---------|
| `.sfdc-record-layout` | 3-column grid |
| `.sfdc-col-related` | Left column |
| `.sfdc-col-record` | Center column |
| `.sfdc-col-activity` | Right column |

### Cards & Content
| Class | Purpose |
|-------|---------|
| `.sfdc-card` | Standard card (+`-accent`, `-green`, `-amber`, `-red`, `-purple`) |
| `.sfdc-card-header` | Card header with title + action |
| `.sfdc-card-body` | Card content area |
| `.sfdc-detail-grid` | 2-column field/value layout |
| `.sfdc-detail-field` | Single field (+`.full` for span) |
| `.sfdc-highlights-bar` | Key field summary bar |
| `.sfdc-highlight` | Individual highlight cell |

### Navigation & Progress
| Class | Purpose |
|-------|---------|
| `.sfdc-path-bar` | Stage/path progress bar |
| `.sfdc-path-step` | Stage step (+`.complete`, `.current`, `.lost`) |
| `.sfdc-path-detail` | Expandable guidance (+`.open`) |
| `.sfdc-tabs` | Tab navigation bar |
| `.sfdc-tab` | Individual tab (+`.active`) |

### Lists & Feeds
| Class | Purpose |
|-------|---------|
| `.sfdc-related-item` | Related list row |
| `.sfdc-related-icon` | Item icon (+`.green`, `.amber`, `.red`, `.purple`, `.accent`) |
| `.sfdc-feed-item-link` | Activity feed entry |
| `.sfdc-feed-avatar` | Feed user icon (+`.system`, `.slack`) |
| `.sfdc-table` | Data table |

### Buttons
| Class | Purpose |
|-------|---------|
| `.sfdc-btn` | Standard (outlined) |
| `.sfdc-btn-primary` | Primary (filled accent) |
| `.sfdc-btn-slack` | Slack integration (dark) |
| `.sfdc-btn-sm` | Small variant |

---

## 12. Lightning Web Component Styling

Understanding LWC styling constraints is critical when translating wireframes into production Salesforce UI. Nib wireframes bypass these constraints (we target the outer DOM directly), but agents and developers should know what's feasible in real implementation.

### Shadow DOM Constraints

LWC base components (`<lightning-button>`, `<lightning-input>`, etc.) render inside **Shadow DOM**. This means:

- External CSS cannot pierce the shadow boundary — no `.my-class lightning-button { ... }` overrides
- Global stylesheets and `<style>` blocks in parent components have no effect on base component internals
- The only way to customize appearance is through **styling hooks** exposed on the component's host element
- Each base component exposes a specific set of `--slds-c-*` hooks (component-scoped)

### Base Component Customization

Customize LWC base components using attributes and styling hooks:

**Attributes** (structure/variant):
```html
<lightning-button label="Save" variant="brand"></lightning-button>
<lightning-button label="Cancel" variant="neutral"></lightning-button>
<lightning-button label="Delete" variant="destructive"></lightning-button>
<lightning-badge label="New" icon-name="utility:new"></lightning-badge>
```

**Styling hooks** (visual override):
```css
/* In your component's CSS: */
lightning-button {
  --slds-c-button-brand-color-background: var(--wf-accent);
  --slds-c-button-brand-color-border: var(--wf-accent);
  --slds-c-button-brand-text-color: #fff;
}

lightning-badge {
  --slds-c-badge-color-background: var(--wf-tint);
  --slds-c-badge-text-color: var(--wf-text);
}
```

**Important**: SLDS 2 does not yet expose all component-level hooks as of Summer '25. If a hook doesn't exist for the property you need, you cannot customize it — this is by design, not a bug.

### SLDS 1 Fallback Requirement

During the SLDS 1 → SLDS 2 transition, always provide fallback values:

```css
/* Provide SLDS 1 token fallback alongside SLDS 2 hook: */
.my-component {
  /* SLDS 2 hook (preferred): */
  background: var(--slds-g-color-surface-container-1,
    /* SLDS 1 fallback: */
    var(--lwc-colorBackgroundAlt, #f3f3f3));
}
```

This ensures components render correctly in orgs that haven't yet migrated to SLDS 2 / Cosmos theme.

### What This Means for Nib Wireframes

- Nib CSS targets the outer DOM directly — no Shadow DOM in wireframes
- All `.sfdc-*` classes work without restriction in our HTML wireframes
- When annotating wireframes, note components that will face Shadow DOM constraints in production
- Use `data-wf-confidence="partial"` on elements where the real LWC customization may be limited by available hooks

---

## 13. Lightning App Builder & Low-Effort Patterns

Understanding what's configurable via drag-and-drop vs what requires custom code helps prioritize wireframe scope and set accurate implementation expectations.

### Standard Drag-and-Drop Components (~40)

Lightning App Builder provides these components out of the box — no code required:

**Record & Data:**
- Record Detail — full field layout (or individual fields via Dynamic Forms)
- Related Lists — child object tables
- Related Record — single related record display
- Highlights Panel — key field summary
- Path — stage progression bar

**Activity & Collaboration:**
- Activity Timeline — logged calls, emails, tasks, events
- Chatter Feed — collaboration feed
- Chatter Publisher — post/comment composer

**Visualization:**
- Report Chart — embedded report charts
- List View — filtered object list
- Rich Text — static content blocks
- Image — static images

**Automation & Integration:**
- Flow — embedded screen flows
- Visualforce Page — legacy page embedding
- Custom Actions — quick action buttons

**Layout:**
- Tabs — tabbed content areas
- Accordion — collapsible sections
- Blank Space — spacing control

### Dynamic Forms (No Code)

Dynamic Forms break the monolithic Record Detail component into individual field sections:

- **Field-level control**: Drag individual fields onto the canvas
- **Section grouping**: Organize fields into labeled sections with 1 or 2 column layouts
- **Conditional visibility**: Show/hide fields based on:
  - Record type
  - User profile or permission set
  - Field values (e.g., show "Reason Lost" only when Stage = "Closed Lost")
- **Admin-managed**: No developer involvement for field rearrangement

### Dynamic Actions (No Code)

Dynamic Actions replace static action button layouts with context-aware rules:

- **Visibility filters**: Show/hide action buttons based on:
  - Record type
  - User profile
  - Field values (e.g., "Show Approve only when Status = Pending")
  - Record ownership (e.g., "Show Edit only for record owner")
- **Priority ordering**: Control button display order per context
- **No code deployment**: Configured entirely in Lightning App Builder

### What Requires Custom Code

These patterns need custom Lightning Web Components:

| Pattern | Why It Needs Code |
|---------|------------------|
| Custom data visualization | No standard chart/graph component beyond Report Chart |
| Complex validation logic | Cross-field or cross-object validation rules |
| Real-time data updates | WebSocket/streaming connections |
| Custom integrations | Third-party API calls, external data display |
| Non-standard layouts | Layouts beyond the standard grid templates |
| Custom path/flow UIs | Stage bars with custom behavior or branching |
| Interactive dashboards | Drill-down, filtering beyond standard report charts |

### Nib Wireframe Guidance

When wireframing Salesforce pages, annotate implementation effort:

```html
<!-- Standard App Builder component — no code needed -->
<div class="sfdc-card" data-wf-confidence="confirmed">
  <div class="sfdc-card-header"><h3>RELATED CONTACTS</h3></div>
  <!-- Related List: drag-and-drop in App Builder -->
</div>

<!-- Custom LWC required — needs development -->
<div class="sfdc-card" data-wf-confidence="partial">
  <div class="sfdc-card-header"><h3>RISK SCORE TIMELINE</h3></div>
  <!-- Custom chart component: requires LWC development -->
</div>
```

- Use `data-wf-confidence="confirmed"` for elements buildable with standard App Builder components
- Use `data-wf-confidence="partial"` for elements requiring custom LWC development
- Add HTML comments noting whether a section is "App Builder standard" or "custom LWC"
- This helps stakeholders understand implementation cost during wireframe review
