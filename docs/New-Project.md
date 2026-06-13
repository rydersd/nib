# New Project Bootstrap

**Tags:** `guide` · `project-setup`

Start a fresh project from scratch in six steps (plus optional reference hubs).

> **Agent reference:** [`ref/new-project.md`](../ref/new-project.md) — full submodule + copy layouts, file trees, update workflow.

## Step 1 — Create the project directory

**Option A — Git submodule (recommended):**

```bash
mkdir my-project && cd my-project && git init
git submodule add https://github.com/rybooth/nib.git nib
mkdir pages
```

Pages reference Nib via `../nib/core/...`. Update Nib with `git submodule update --remote nib`.

**Option B — Copy layout:**

Copy `core/` and `surfaces/` directly into the project. Simpler, but you re-copy on upgrade.

## Step 2 — Create `project-data.js`

Define at least `WIREFRAME_CONFIG` and `SECTIONS` — see [[Navigation]] for the full schema.

## Step 3 — Create the first page

Copy a starter from `starters/` and fill in `<title>`, surface CSS, content, design notes, and the `project-data.js` path. See [[Page-Template]] for the boilerplate.

## Step 4 — Project-specific CSS (optional)

Create `project.css` for classes unique to this project. Prefix with your project abbreviation (e.g. `pp-` for "Partner Portal") to avoid collisions with `wf-` / surface prefixes.

## Step 5 — Build more pages

For each new page:
1. Consult [[For-Agents]] or [`ref/_index.md`](../ref/_index.md) for which refs to read
2. Copy a starter — see [[Examples]] for the catalog
3. Add the page to `SECTIONS`
4. Write [[Design-Notes]]

## Step 6 — Stories & scenarios (optional)

Add `STORY_MAP`, `STORY_TITLES`, `SCENARIOS`, `DESIGN_STORIES`, `PROJECT_PHASES` to `project-data.js` when you need implementation tracking or guided walkthroughs.

## Step 7 — Reference hub pages

Once 3+ wireframe pages exist, create the deliverables layer: sitemap, JTBD hub, user flows, personas, design stories. See [[Project-Deliverables]].

## Completeness checklist

- [ ] `core/` and `surfaces/` present (submoduled or copied)
- [ ] `project-data.js` has `SECTIONS` with at least one item
- [ ] First page loads without console errors
- [ ] Context bar, drawer, and design notes button all work
- [ ] Every wireframe page has design notes (see [[Design-Notes]])
- [ ] Sitemap, JTBD, flows, personas, design stories in place (see [[Project-Deliverables]])

---

## Related

- [[Getting-Started]] — the condensed 5-minute version
- [[Page-Template]] — required HTML boilerplate
- [[Navigation]] — `project-data.js` data structures
- [[Project-Deliverables]] — sitemap / JTBD / flows hub pages
- [[Design-Notes]] — per-page notes structure
- [[Doctor]] — catches setup mistakes
- [[Lessons-Learned]] — pitfalls from real-world bootstrap
