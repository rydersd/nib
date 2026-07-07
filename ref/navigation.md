# Navigation System

> ⚠️ **Deprecated.** Edit [`docs/Navigation.md`](../docs/Navigation.md) instead. This file will be removed in a future release.

> Read when setting up proto-nav.js for a project, or when adding story maps / scenarios.

## How It Works

`proto-nav.js` runs on every page. It reads data from `project-data.js` (loaded before it) and builds:

1. **Context bar** — top bar with hamburger, breadcrumbs, and action buttons
2. **Drawer** — full-page nav panel triggered by hamburger, built from SECTIONS
3. **Design notes panel** — side panel that shows content from `<div class="wf-design-notes">`
4. **Story mode** — unified "Stories" button that opens a scenario selector. When a scenario is active, matching journey highlighting activates automatically. AC badges from STORY_MAP appear in the Notes Context tab
5. **Scenarios** — optional guided walkthroughs stored in sessionStorage

## Required: SECTIONS

Drives the drawer and breadcrumbs. Array of section groups:

```javascript
var SECTIONS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    epic: 'Epic 1',              // optional — shown as badge
    items: [
      { file: 'home', label: 'Home', type: 'page' },
      { file: 'reports', label: 'Reports', type: 'page' },
      { file: 'settings', label: 'Settings', type: 'modal' }
    ]
  },
  {
    id: 'onboarding',
    label: 'Onboarding Flow',
    epic: 'Epic 2',
    items: [
      { file: 'onboarding-welcome', label: 'Welcome', type: 'page' },
      { file: 'onboarding-company', label: 'Company Info', type: 'page' }
    ]
  }
];
```

`file` = HTML filename without `.html`. `type` = display hint (page, modal, channel, dm, canvas, sfdc, reference).

## Optional: STORY_MAP + STORY_TITLES (Lightweight Cross-Reference)

Maps pages to design stories (or any story IDs). Shows story badges in context bar.

```javascript
var STORY_MAP = {
  'home':               ['1.1', '1.2'],
  'onboarding-welcome': ['2.1'],
  'onboarding-company': ['2.2', '2.3']
};

var STORY_TITLES = {
  '1.1': 'Dashboard home layout',
  '1.2': 'KPI widget data binding',
  '2.1': 'Welcome screen with org lookup',
  '2.2': 'Company info form',
  '2.3': 'D&B integration for company search'
};
```

AC badges from STORY_MAP are automatically injected into the Notes panel's Context tab — authors don't need to manually reference them.

## Optional: JOURNEYS

Defines user journeys that can be highlighted on pages using `data-journey` attributes:

```javascript
var JOURNEYS = [
  { id: 'onboard-new-partner', label: 'Onboard a new partner', short: 'Onboard' },
  { id: 'submit-deal', label: 'Submit a deal registration', short: 'Deal Reg' }
];
```

On HTML elements, add `data-journey="onboard-new-partner"` to make them highlightable when that journey is selected.

JOURNEYS also accepts an object format (useful for keyed data). proto-nav.js normalizes both to arrays at init:

```javascript
var JOURNEYS = {
  'pricing-validation': {
    label: 'Pricing Table Validation',
    color: 'var(--wf-accent)',
    steps: ['home', 'results', 'detail']
  }
};
```

## Optional: SCENARIOS

Guided walkthroughs — step-by-step page tours with narrative:

```javascript
var SCENARIOS = [
  {
    id: 'new-partner-onboarding',
    persona: 'Admin',
    label: 'Admin: Onboard a new partner',
    steps: [
      { file: 'home', narrative: 'Jordan opens the partner portal dashboard.' },
      { file: 'onboarding-welcome', narrative: 'Clicks "Add Partner" to start onboarding.' },
      { file: 'onboarding-company', narrative: 'Searches D&B for the company. Fills in details.' }
    ]
  }
];
```

Steps can include an optional `friction` field for gap analysis:

```javascript
{ file: 'results', narrative: '...', friction: 'No visual indicator showing which SKUs changed since last review' }
```

When present, an amber callout appears below the narrative in the scenario banner, highlighting UX gaps.

Scenarios use sessionStorage to track current step. `wfScenarioStart(id)` begins, `wfScenarioNext()` advances.

## Optional: DESIGN_STORIES + PROJECT_PHASES (Living Design Document)

Rich story definitions that power the Design Stories page (`design-stories.html`). While `STORY_MAP` is a lightweight cross-reference (page → story IDs), `DESIGN_STORIES` is the full source of truth for implementation planning.

When both `STORY_MAP` and `DESIGN_STORIES` are defined, AC badges in the Notes Context tab become clickable links to the Design Stories page.

```javascript
var DESIGN_STORIES = [
  {
    id: '1.1',                    // Must match STORY_MAP/STORY_TITLES IDs
    title: 'Dashboard home layout',
    userStory: 'As a pricing analyst, I want to see KPIs on login so I can prioritize my day',
    status: 'in-progress',        // 'draft' | 'in-progress' | 'accepted' | 'deferred'
    version: 2,                   // Increment when scope changes
    journeyId: 'first-login',    // Optional: ties to a JOURNEY
    pages: ['home', 'dashboard'], // Wireframe pages where this story is realized
    acceptance: [                 // Acceptance criteria
      'Page loads with KPI widgets populated',
      'Dashboard shows data from last 30 days by default'
    ],
    phases: [                     // Per-story phased implementation
      {
        phase: 1,
        label: 'Foundation',
        scope: ['Basic record layout', 'Standard related lists'],
        dependencies: [],
        approach: 'oob'           // 'oob' | 'config' | 'custom-lwc'
      }
    ],
    decisions: [                  // Reverse-chronological decision log
      { date: '2026-03-14', decision: 'Defer custom chart to Phase 2', rationale: 'Dependent on data pipeline' }
    ],
    sfdc: {                       // Optional: SFDC-specific suggestions
      suggestions: [
        'Consider Report Chart component for KPI visualizations',
        'Dynamic Forms can handle field-level visibility rules'
      ]
    }
  }
];
```

Optional project-level phase grouping:

```javascript
var PROJECT_PHASES = [
  { phase: 1, label: 'Foundation', stories: ['1.1', '1.2'], systemDeps: [] },
  { phase: 2, label: 'Enhancement', stories: ['1.3'], systemDeps: ['Data pipeline deployed'] }
];
```

**Relationship:** `STORY_MAP` = lightweight cross-ref (always present for badge injection). `DESIGN_STORIES` = living document (present when implementation tracking is needed). Both use the same story IDs.

## Key Functions (from proto-nav.js)

| Function | What it does |
|----------|-------------|
| `wfToast(msg, ms)` | Show brief notification (default 2500ms) |
| `wfModalClose(id)` | Close modal by element ID |
| `wfThreadOpen()` | Show `.slack-thread-panel` |
| `wfThreadClose()` | Hide `.slack-thread-panel` |
| `wfDnToggle()` | Toggle design notes panel |
| `wfScenarioStart(id)` | Start a guided scenario |
| `wfScenarioNext()` | Next step in scenario |
| `wfScenarioExit()` | Exit scenario mode |

## Rules

- `project-data.js` must load BEFORE `proto-nav.js` in the HTML
- SECTIONS is required — without it, no drawer or breadcrumbs render
- STORY_MAP, JOURNEYS, SCENARIOS are optional — features silently skip if missing
- File names in SECTIONS/STORY_MAP never include `.html` extension
- Every page's filename must match a `file` value in SECTIONS for breadcrumbs to work

## WIREFRAME_CONFIG

Optional global configuration object defined in `project-data.js` before SECTIONS. Controls project-level settings for proto-nav.js.

```javascript
var WIREFRAME_CONFIG = {
  title: 'My Project',              // Shown in drawer header
  subtitle: '',                      // Shown below title in drawer
  fallbackPage: 'index.html',       // Fallback for modal close navigation
  emailPrefix: '[WF]',              // Subject line prefix for feedback emails
  emailFooter: 'Sent from wireframe prototype',  // Footer text in feedback emails
  emailRecipient: 'team@example.com', // Recipient for feedback panel submissions
  defaultTheme: 'nib',              // Default design system theme
  themes: {                          // Project-specific themes (merged with built-ins)
    'my-brand': {
      label: 'My Brand',
      font: "'Next Text', -apple-system, sans-serif",
      fontUrl: 'fonts/next-text.css',
      tokens: {
        '--wf-accent': '#0070c9',
        '--wf-ink': '#1a1a1a'
      }
    }
  }
};
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `title` | string | `'Wireframes'` | Display name in the drawer header |
| `subtitle` | string | `''` | Subtitle text below the title |
| `fallbackPage` | string | `'index.html'` | Navigation target when modal close has no referrer |
| `emailPrefix` | string | `'[WF]'` | Subject line prefix for feedback emails |
| `emailFooter` | string | `'Sent from wireframe prototype'` | Footer text appended to feedback emails |
| `emailRecipient` | string | `''` | Recipient email for feedback panel |
| `noSurfaceHeader` | boolean | `false` | When `true`, suppresses auto-generated surface headers (e.g., SFDC global nav). Use when you build a custom header in HTML |
| `defaultTheme` | string | `'nib'` | Default design system theme applied when no group/section theme is set |
| `themes` | object | `{}` | Project-specific theme definitions (merged with built-in themes: nib, slds, material, high-contrast) |

## Design System Themes

Themes control fonts and design tokens per section/group. See `ref/design-system-theme.md` for the full guide.

### Group-level theme assignment

Use `isGroup: true` entries in SECTIONS to assign themes to groups of sections:

```javascript
var SECTIONS = [
  // Group header — theme applies to all sections until the next group
  { id: 'grp-sfdc', label: 'SFDC', isGroup: true, theme: 'slds' },
  { id: 'ae', label: 'AE', persona: 'ae', items: [/* ... */] },
  { id: 'psm', label: 'PSM', persona: 'psm', items: [/* ... */] },

  // New group — different theme
  { id: 'grp-partner', label: 'Partner Portal', isGroup: true, theme: 'partner-portal' },
  { id: 'rep', label: 'Sales Rep', items: [/* ... */] },

  // Section can override its group's theme
  { id: 'brand', label: 'Brand Pages', theme: 'blueprint-ds', items: [/* ... */] }
];
```

### Theme resolution order (most specific wins)

1. **Item-level:** `item.theme` (rare, for one-off pages)
2. **Section-level:** `section.theme` (explicit on the section)
3. **Group-level:** nearest `isGroup` entry above this section with a `theme`
4. **Global default:** `WIREFRAME_CONFIG.defaultTheme` or `'nib'`
5. **Session override:** Force-all via Settings panel (`sessionStorage('wf_theme_override')`)

### Nested children

Items with `children: [...]` sub-pages inherit their parent item's section/group theme chain.

```javascript
items: [
  { file: 'opportunities', label: 'Opportunities', type: 'sfdc',
    children: [
      { file: 'create-order', label: 'Create Order' },
      { file: 'fulfillment', label: 'Fulfillment' }
    ]
  }
]
```

### Settings panel

Accessible via the drawer's "Settings" link or by clicking the theme badge in the context bar. Shows:
- Active theme (auto-detected from current page)
- Theme assignments table (groups with dropdowns, sections showing inheritance)
- Session override (force all pages to one theme)
- Custom theme builder (name, font, accent/surface colors)

## Fidelity Slider

The context bar includes a three-position fidelity slider: **Napkin**, **Blueprint**, and **Polished**.

- **Napkin** — hand-drawn feel with heavy wobble, visible paper grain, and loose grid lines
- **Blueprint** — balanced wireframe look with mild asymmetry and subtle grid (default)
- **Polished** — clean, precise rendering with no grain or wobble

The slider sets CSS custom properties on `:root` (`--wf-wobble-radius`, `--wf-grain-opacity`, `--wf-grid-opacity`, `--wf-shadow-scale`, `--wf-wobble-filter`) and persists the selection to `sessionStorage` under the key `wf_fidelity`. On page load, proto-nav.js restores the saved fidelity level automatically.

## Confidence Attribute

Add `data-wf-confidence` to any HTML element to communicate design certainty visually:

| Value | Effect |
|-------|--------|
| `confirmed` | Clean, precise borders — design is validated and approved |
| `partial` | Mildly asymmetric borders — some validation done |
| `uncertain` | Wobbly borders, reduced opacity, SVG filter applied — feature not yet validated |

At **Polished** fidelity, `uncertain` elements render with dashed borders instead of wobble effects. This attribute works on any element — cards, sections, buttons, entire page regions.
