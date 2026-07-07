# Project Deliverables

> ⚠️ **Deprecated.** Edit [`docs/Project-Deliverables.md`](../docs/Project-Deliverables.md) instead. This file will be removed in a future release.

Beyond individual wireframe pages, a complete prototype includes structural deliverables that establish the project's information architecture, user context, and workflow logic. These pages live alongside your wireframe pages in the `project/` directory.

## Sitemap Page (`index.html`)

A visual information-architecture map showing every page in the prototype organized by section/audience.

**When to create:** First — it becomes the landing page and navigation hub for the prototype.

**What goes in it:**
- Header with project name, page count, version, phase
- View-control nav bar linking to sibling reference pages (JTBD, Flows, Story Reference)
- Page-type icon legend (dashboard, form, list, detail, etc.)
- Search/filter input to find pages quickly
- Branch containers grouped by section (matching `SECTIONS` from `project-data.js`)
- Expandable nodes per page showing key components (tables, forms, cards, badges)
- Tab system for audience segmentation if multi-portal/multi-audience

**Starter:** `starters/sitemap.html`

**How it connects:** Each node links to its wireframe page. The view-control nav links to all other reference pages.

---

## JTBD Hub (`jobs-to-be-done.html`)

A centralized Jobs-to-Be-Done page that consolidates all persona-specific job statements from individual wireframe design notes into one browsable hub.

**When to create:** After 3+ wireframe pages exist with JTBD items in their design notes.

**What goes in it:**
- Header with total JTBD count and persona count
- View-control nav bar
- Validation status callout (proto-persona notice)
- Method box explaining "What is a JTBD?"
- Persona summary table (name, role, JTBD count, key screens)
- Tab system by audience segment
- Persona blocks with avatar (initials), name, role, numbered JTBD items
- Each JTBD links to the specific wireframe page(s) that address it

**Starter:** `starters/jtbd.html`

**How it connects:** JTBD items reference wireframe pages via links. Persona blocks correspond to the personas mentioned in each page's `wf-design-notes`.

---

## User Flows (`user-flows.html`)

Process chain visualizations showing how personas move through the prototype to accomplish tasks. Maps to `JOURNEYS` defined in `project-data.js`.

**When to create:** After defining `JOURNEYS` in `project-data.js`.

**What goes in it:**
- View-control nav bar
- One flow chain per journey: step boxes with arrows, labels, sub-steps
- Each step links to its wireframe page
- Key decision points annotated
- Links to detailed swimlane views (optional)
- Summary metadata (SF objects queried, emails triggered, integrations)

**Starter:** `starters/user-flows.html`

**How it connects:** Steps link to wireframe pages. Journey names match `JOURNEYS` keys in `project-data.js`.

---

## Personas & Organizations (`story-reference.html`)

Character cards and organizational context for the proto-personas used throughout the prototype.

**When to create:** When your prototype has 2+ personas referenced in design notes.

**What goes in it:**
- View-control nav bar
- Character cards: avatar (initials), name, title, org tag, description, metadata rows (email, location, tools), goals list
- Org cards: logo placeholder, name, type, description, key attributes
- Relationship diagrams: rel-node → rel-arrow → rel-node showing how personas interact
- Proto-persona validation notice ("These are proto-personas based on research assumptions...")

**Starter:** `starters/story-reference.html`

**How it connects:** Character names match persona references in design notes and JTBD items.

---

## Design Stories (`design-stories.html`)

A living document tracking implementation scope, product decisions, phased delivery, and platform approach for each design story. Auto-generated from `DESIGN_STORIES` in `project-data.js`.

**When to create:** When your project needs implementation tracking beyond simple STORY_MAP cross-references — phased delivery, SFDC approach decisions, or acceptance criteria management.

**What goes in it:**
- Auto-generated from `DESIGN_STORIES` array in `project-data.js`
- Project metrics: story counts by status, approach mix (OOB/Config/Custom LWC), page coverage
- Implementation roadmap: visual phase dependency map from `PROJECT_PHASES`
- Status filter pills (Draft / In Progress / Accepted / Deferred)
- Story cards with: user story statement, acceptance criteria, phased implementation table, SFDC suggestions, decision log
- Auto-validation warnings for orphan references, dead links, missing journeys, uncovered pages

**Starter:** `starters/design-stories.html`

**How it connects:** Story IDs in `STORY_MAP` link to story cards on this page. AC badges in design notes become clickable links. Story `pages[]` link back to wireframe pages. Story `journeyId` links to user-flows.html.

---

## Personas Page (`personas.html`) — Optional

A full persona research page with detailed demographics, time allocation, research confidence, and design implications. More detailed than story-reference.

**When to create:** When you have research data to validate proto-personas.

---

## Reference Hub Navigation

All reference pages share a **view-control nav bar** at the top that links them together:

```html
<nav class="wf-view-control" aria-label="View selector">
  <span class="wf-view-label">View</span>
  <div class="wf-view-btns" role="navigation">
    <a class="wf-view-btn active" href="index.html">Sitemap</a>
    <a class="wf-view-btn" href="jobs-to-be-done.html">Jobs to Be Done</a>
    <a class="wf-view-btn" href="user-flows.html">User Flows</a>
    <a class="wf-view-btn" href="story-reference.html">Personas</a>
    <a class="wf-view-btn" href="design-stories.html">Design Stories</a>
  </div>
</nav>
```

This creates a cohesive reference layer on top of the wireframe pages. The active button indicates the current page.
