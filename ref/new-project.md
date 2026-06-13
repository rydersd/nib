# New Project Bootstrap

> Read when starting a project from scratch. Two paths:
>
> **Path A — From a spreadsheet (recommended).** If you have an Excel workbook or Google Sheet describing the project's pages, personas, blueprints, etc., read [`spreadsheet-authoring.md`](spreadsheet-authoring.md) and run `node tools/nib-ingest.js <workbook> --out ./my-project`. The CLI generates `data/*.js` files that this guide's Step 2 hand-authors. Then continue from Step 1 below to set up the directory layout (skipping Step 2 since it's already generated).
>
> **Path B — From scratch.** Follow all 6 steps below.

## Step 1: Create Project Directory

### Option A: Git submodule (recommended)

```bash
mkdir my-project && cd my-project && git init
git submodule add https://github.com/rybooth/nib.git nib
mkdir pages
```

```
my-project/
├── nib/               ← submodule (don't modify — updates from upstream)
│   ├── core/
│   ├── surfaces/
│   ├── starters/
│   └── ref/
├── pages/
│   ├── project-data.js
│   ├── project.css    → project-specific styles (optional, start empty)
│   ├── login.html     → auth gate page (optional)
│   └── [pages].html
└── reviews/           ← review annotations (auto-generated)
```

Pages reference nib via relative paths: `../nib/core/proto-core.css`, `../nib/core/proto-nav.js`, `../nib/surfaces/salesforce.css`, etc.

**Updating nib:** When new framework features ship, pull them in:

```bash
git submodule update --remote nib
git add nib
git commit -m "Update nib framework"
```

**Cloning a project that uses the submodule:**

```bash
git clone --recurse-submodules <project-url>
# or if already cloned:
git submodule init && git submodule update
```

### Option B: Copy (simple projects or no-git environments)

```
my-project/
├── core/          → copy from nib/core/
├── surfaces/      → copy from nib/surfaces/
├── project-data.js
├── project.css
└── [pages].html
```

Copy `core/` and `surfaces/` from the framework. Don't modify them — they're shared. Pages reference `core/` and `surfaces/` directly (no `nib/` prefix). You'll need to manually re-copy when nib updates.

## Step 2: Create project-data.js

Copy `starters/project-data.js` and fill in SECTIONS:

```javascript
var SECTIONS = [
  {
    id: 'main',
    label: 'Main Pages',
    items: [
      { file: 'home', label: 'Home', type: 'page' },
      { file: 'dashboard', label: 'Dashboard', type: 'page' }
    ]
  }
];
```

See `ref/navigation.md` for full SECTIONS spec and optional data structures.

## Step 3: Create First Page

Copy `starters/blank-page.html` (or a surface starter). Update:

1. `<title>` — page name + project name
2. Surface CSS link — pick the right one for this page's platform
3. Page content — build from `ref/components.md` and `ref/layouts.md`
4. Design notes — fill in Summary, JTBD, Design Spec
5. `project-data.js` path — make sure it points to your file

## Step 4: Add Project-Specific CSS (if needed)

Create `project.css` for classes unique to this project. Prefix with your project abbreviation:

```css
/* Project: Partner Portal (pp-) */
.pp-partner-card { ... }
.pp-tier-badge { ... }
```

Link after surface CSS: `<link rel="stylesheet" href="project.css">`

## Step 5: Build More Pages

For each new page:

1. Read the relevant refs (`_index.md` tells you which)
2. Copy a starter or duplicate an existing page
3. Add the page to SECTIONS in project-data.js
4. Add design notes

## Step 6: Add Stories + Scenarios (Optional)

If project needs story mapping or guided walkthroughs, add to project-data.js:

```javascript
var STORY_MAP = { 'home': ['1.1'], 'dashboard': ['1.2', '1.3'] };
var STORY_TITLES = { '1.1': 'Home page layout', '1.2': 'KPI widgets', '1.3': 'Pipeline chart' };
var SCENARIOS = [ { id: 'first-login', persona: 'Rep', label: 'Rep: First login', steps: [...] } ];
```

For implementation tracking, add the rich story definitions:

```javascript
var DESIGN_STORIES = [ { id: '1.1', title: 'Home page layout', status: 'draft', ... } ];
var PROJECT_PHASES = [ { phase: 1, label: 'Foundation', stories: ['1.1'], systemDeps: [] } ];
```

See `ref/navigation.md` for the full DESIGN_STORIES schema.

## File Loading Order

In every HTML page, scripts load in this order:

```html
<!-- Submodule layout (pages/ directory) -->
<script src="project-data.js"></script>           <!-- 1. data first -->
<script src="../nib/core/proto-nav.js"></script>  <!-- 2. nav engine second -->

<!-- Copy layout (flat directory) -->
<script src="project-data.js"></script>    <!-- 1. data first -->
<script src="core/proto-nav.js"></script>  <!-- 2. nav engine second -->
```

---

## Step 7 — Create Reference Hub Pages

A complete prototype includes structural pages that frame the wireframes with information architecture, user context, and workflow logic. Create these after your first few wireframe pages are in place.

| Page | File | Starter | When |
|------|------|---------|------|
| Sitemap | `index.html` | `starters/sitemap.html` | First — becomes landing page |
| JTBD Hub | `jobs-to-be-done.html` | `starters/jtbd.html` | After 3+ pages have design notes with JTBD |
| User Flows | `user-flows.html` | `starters/user-flows.html` | After defining JOURNEYS in project-data.js |
| Story Reference | `story-reference.html` | `starters/story-reference.html` | When 2+ personas exist |
| Design Stories | `design-stories.html` | `starters/design-stories.html` | When implementation tracking needed |

All reference pages share a **view-control nav bar** at the top (see `ref/project-deliverables.md`).

### Populate content from your wireframes
- **Sitemap:** One node per page from `SECTIONS`, with key components listed per node
- **JTBD:** Consolidate JTBD items from each page's `wf-design-notes` into persona blocks
- **Flows:** One chain per journey from `JOURNEYS` in `project-data.js`
- **Story Reference:** One character card per persona referenced in design notes

See `ref/project-deliverables.md` for full details on each deliverable.

---

## Project Completeness Checklist

- [ ] Sitemap page created with all pages listed
- [ ] JTBD defined per persona and consolidated in hub page
- [ ] Key user flows documented with linked steps
- [ ] Story reference with character cards and org cards
- [ ] `STORY_MAP` linking pages to stories in `project-data.js`
- [ ] `STORY_TITLES` defining story/AC labels
- [ ] Scenarios defined for guided walkthroughs
- [ ] `DESIGN_STORIES` with acceptance criteria and phased implementation (if tracking needed)
- [ ] Design Stories page created with roadmap and story cards
- [ ] View-control nav linking all reference pages
- [ ] Design notes complete on every wireframe page (see `ref/design-notes-guide.md`)

## Checklist

- [ ] `core/` and `surfaces/` copied (not modified)
- [ ] `project-data.js` has at least one SECTIONS entry
- [ ] First page loads without console errors
- [ ] Context bar shows with breadcrumbs
- [ ] Drawer opens and lists your pages
- [ ] Design notes button works
