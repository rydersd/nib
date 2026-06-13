# Getting Started

**Tags:** `guide` · `project-setup`

Bootstrap a new wireframe project in 5 minutes.

> **Prerequisite:** You need a copy of the Nib framework. The [`core/`](../core/) and [`surfaces/`](../surfaces/) directories must be accessible from your project. If you're setting up a new project from scratch, see the submodule guide in the [README](../README.md).

## 1. Copy a starter

The [`starters/`](../starters/) directory contains ready-to-use HTML templates for different surface types. Copy one to your project directory:

```bash
cp starters/internal-ds-starter.html my-project/dashboard.html
```

Available starters:

- `internal-ds-starter.html` — see [[Surface-Internal]]
- `slack-starter.html` — see [[Surface-Slack]]
- `salesforce-starter.html` — see [[Surface-Salesforce]]
- Declarative: `blueprint-dashboard.html`, `blueprint-record.html`
- Compose-format: `compose-record.html`, `compose-wizard.html`
- Reference hubs: `sitemap.html`, `jtbd.html`, `user-flows.html`, `story-reference.html`, `design-stories.html`

## 2. Create `project-data.js`

Every project needs a `project-data.js` file that defines the page structure. This drives the navigation drawer automatically.

```js
/* project-data.js */
window.WIREFRAME_CONFIG = {
  title: 'My Project',
  subtitle: 'Wireframe Prototype'
};

window.SECTIONS = [
  {
    epic: 'E1',
    label: 'Core Screens',
    items: [
      { file: 'dashboard', label: 'Dashboard' },
      { file: 'settings',  label: 'Settings' }
    ]
  }
];
```

For deeper options (`STORY_MAP`, `DESIGN_STORIES`, `JOURNEYS`, `SCENARIOS`), see [`ref/new-project.md`](../ref/new-project.md) and the [README](../README.md).

## 3. Script load order

Scripts must load in this order at the bottom of your HTML:

```html
<script src="project-data.js"></script>
<script src="../core/proto-nav.js"></script>
```

- `project-data.js` sets `window.SECTIONS` and `window.WIREFRAME_CONFIG`
- `proto-nav.js` reads these to build the context bar, navigation drawer, and design notes panel

For declarative/compose pages, see [`ref/page-blueprint.md`](../ref/page-blueprint.md) and [`ref/page-compose.md`](../ref/page-compose.md) for extended load orders.

## 4. Design tokens

Never hardcode hex colors. Always use CSS custom properties (tokens):

```css
/* DO — uses token */
color: var(--wf-ink);
background: var(--wf-surface);

/* DON'T — hardcoded hex */
color: #1e2a3a;
background: #edf1f7;
```

Tokens automatically adapt across fidelity modes. See [[Design-Tokens]] for the full palette.

## 5. Paper utilities

Add physical-artifact texture with CSS classes. See [[Paper-Utilities]] for the full catalog.

```html
<div class="ds-card wf-tape">
  <!-- Card with tape decoration -->
</div>
```

## 6. Fidelity slider

The context bar includes a fidelity slider with three modes — see [[Fidelity-Levels]]:

- **Napkin** — rough, hand-drawn look
- **Blueprint** — default, structured wireframe
- **Polished** — clean, minimal artifacts

The slider state persists in `sessionStorage` across page navigations.

---

## Next steps

- Read [[Philosophy]] to understand the design rationale behind the framework
- Browse [[Components]] ([live demo](components.html)) to see what's available
- Pick a [[Surfaces|surface]] that matches your target platform
- Explore [[Examples]] for reference implementations
