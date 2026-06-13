# Nib

**Plan, document, and maintain a project from one workbook.**

Nib is a wireframe prototyping framework that turns a single Excel or Google Sheets workbook into a working multi-page prototype **and** a fully cross-referenced project wiki — both auto-generated, both kept in sync as the workbook (or the project) evolves.

The wiki is the project's living documentation: personas, blueprints, page index, design stories, decisions, architecture, glossary, lessons-learned. Some pages are derived from the workbook (Personas, Blueprints, Pages, Stories) and regenerate on every sync. Others are narrative and hand-authored (Decisions, Architecture, Glossary, README, Lessons-Learned). An LLM working on the project — Claude Code or otherwise — gets a `CLAUDE.md` with the maintenance contract: which pages are auto vs hand, when to run sync, how to keep wikilinks fresh.

Think of it as a Google Design Sprint that lives in a repo, where the spreadsheet is the source of truth and the wiki is the human-readable face.

## 60-second start

```sh
npm create nib lead-to-cash
# or:  npx create-nib lead-to-cash
```

A browser window opens. Pick one of three paths:

- **📊 From a workbook** — drop in an Excel file or paste a Google Sheets URL. Pages, personas, journeys, blueprints, tokens, and stories all generate from the workbook — and a wiki documenting all of them.
- **🎨 From a template** — clone a working scaffold (service blueprint canvas, feedback triage, research study, multi-step flow, …) with the wiki pre-populated.
- **✨ Start blank** — minimal one-page scaffold + an empty wiki ready for narrative.

The same server keeps serving so you can keep clicking. `Ctrl-C` to stop. The new project is fully self-contained — `cd lead-to-cash && python3 -m http.server` works without any further setup.

Headless flags skip the picker:

```sh
npx create-nib partner-program --workbook ./brief.xlsx
npx create-nib q3-research --template research-study
npx create-nib service-design --sheet 'https://docs.google.com/spreadsheets/d/...'
```

What you get inside `./lead-to-cash/`:

```
lead-to-cash/
├── CLAUDE.md              ← Wiki maintenance contract for any LLM working on this
├── example.xlsx           ← Source of truth (or your own workbook name)
├── index.html             ← Working prototype entry
├── data/                  ← Generated JS — refreshed by `npx nib-sync`
├── docs/                  ← The wiki
│   ├── Home.md            ← Index of every page (auto)
│   ├── _Sidebar.md        ← Wiki nav (auto)
│   ├── Pages.md           ← Sitemap (auto)
│   ├── Personas.md        ← Persona index (auto)
│   ├── Persona-{id}.md    ← One per persona (auto)
│   ├── Blueprints.md      ← Service blueprint hierarchy (auto)
│   ├── Blueprint-{id}.md  ← One per flow with drill-in points (auto)
│   ├── Stories.md         ← Design stories + JTBDs (auto)
│   ├── Story-{id}.md      ← One per story (auto)
│   ├── Tokens.md          ← CSS variable overrides (auto)
│   ├── README.md          ← Project pitch (yours)
│   ├── Decisions.md       ← Decision log (yours)
│   ├── Architecture.md    ← System shape (yours)
│   ├── Glossary.md        ← Terminology (yours)
│   └── Lessons-Learned.md ← Retrospective (yours)
└── nib/                   ← Bundled framework runtime (CSS + JS)
```

Auto pages start with `<!-- nib:auto -->` and regenerate on every `npx nib-sync`. Hand pages have no marker and are never overwritten — they're yours and the LLM's to author.

Full reference: [`docs/Create-Project.md`](docs/Create-Project.md) · [`docs/Project-Wiki.md`](docs/Project-Wiki.md).

## The Problem It Solves

This isn't a new story. Healthcare.gov launched after $1.7 billion in development and crashed on day one — built by teams that never tested the end-to-end experience. Snapchat redesigned their app in 2018 without meaningful user validation and lost $1.3 billion in market value when users revolted. It happens at every scale: teams build what seems right under deadline pressure, skip the experience planning, and spend the next year fixing things that could have been avoided.

The wireframes that were supposed to prevent this either didn't get made (no time), got made but weren't detailed enough (lorem ipsum and gray boxes), or got made but nobody could follow them without the designer in the room to explain.

Nib started because I was in a meeting trying to explain a partner portal ecosystem to a service designer helping with onboarding. I could talk through the big picture, but I couldn't get into the weeds on the personas, the flows, the implementation approach — not in any format someone could pick up and run with. An outside firm was coming in to make recommendations. I needed something they could riff on without me. Not a slide deck. Not a Figma file that requires everyone to have an account and navigate a tool they might not know.

I needed a prototype that explained itself.

## What It Produces

A nib project generates two artifacts side-by-side:

**1. The prototype** — linked HTML pages anyone can open in a browser:

- **Sitemap** — visual information architecture showing every page, organized by section
- **Wireframe pages** — interactive layouts with real labels, real data patterns, and design notes explaining every decision
- **Personas** — character cards and organizational context for guided walkthroughs
- **User Flows / Service Blueprints** — step-by-step journeys; the React Flow canvas in `examples/service-blueprint/` supports nested blueprints with leadership Overview + drill-down
- **Design Stories** — living implementation tracking with phased delivery, acceptance criteria, platform approach, and decision logs

**2. The wiki** — a fully cross-referenced Markdown wiki at `docs/`:

- **Auto pages** (regenerated on every sync from the workbook): `Home`, `Pages`, `Personas`, `Persona-{id}`, `Blueprints`, `Blueprint-{id}`, `Stories`, `Story-{id}`, `Tokens`, `Registries`, `_Sidebar`, `_Footer`. They open with a `<!-- nib:auto -->` marker — your edits get overwritten.
- **Hand pages** (yours and the LLM's): `README`, `Decisions`, `Architecture`, `Glossary`, `Lessons-Learned`, plus any custom narrative pages you create. Sync never touches them.

Cross-references use `[[Page-Name]]` wikilinks — Obsidian / Foam / Dendron compatible. The project's `CLAUDE.md` documents the maintenance contract so any LLM working on the project (Claude Code or otherwise) knows when to run sync and where to put narrative.

## Who It's For

- **Designers** who want to validate an experience before handing it off, and need the connective tissue (sitemaps, flows, personas) that usually gets skipped
- **Product owners** who need stakeholders to see and agree on what's being built before development starts
- **Engineers** who want wireframes with actual implementation context — not just pictures, but phased approach (OOB vs. config vs. custom), acceptance criteria, and platform suggestions
- **Leadership** who want to understand what a project delivers without scheduling a 30-minute walkthrough
- **Outside firms and new team members** who need to understand the system from scratch, without the original designer in the room

## How It Works

The framework is built around **one canonical project shape** that flows through three transformations:

```
   ┌─────────────┐
   │  Workbook   │  Excel / Google Sheets — one tab per resource type
   │ (or data/)  │  (the source of truth)
   └──────┬──────┘
          │  nib-ingest (or nib-sync)
          ▼
   ┌─────────────┐
   │  Project    │  Canonical shape (validated against workbook.schema.json)
   │   shape     │  — meta, pages, tokens, personas, stories, blueprints,
   └──────┬──────┘    registries
          │
   ┌──────┴──────┬──────────────────────┐
   ▼             ▼                      ▼
data/*.js   docs/*.md (auto)      docs/*.md (hand stubs, only on first run)
prototype   project wiki          README, Decisions, Architecture, …
```

The mechanical part — workbook → data + auto wiki — is the npm package. The narrative part — hand-authored wiki pages — is yours and the LLM's. The project's `CLAUDE.md` is the contract between them.

### Three ways to start a project

| Path | When | Read |
|---|---|---|
| `npx create-nib <name>` | Most common — wizard guides you | [`docs/Create-Project.md`](docs/Create-Project.md) |
| `nib-ingest <workbook>.xlsx --out <dir>` | You already have a brief in a spreadsheet | [`docs/Spreadsheet-Authoring.md`](docs/Spreadsheet-Authoring.md) |
| Copy a template + author by hand | You want full control | [`docs/New-Project.md`](docs/New-Project.md) |

### Project data drives everything

Whether scaffolded from a workbook or hand-authored, every project sets up these globals (some optional):

```javascript
WIREFRAME_CONFIG   // Project title, surface defaults, feedback endpoint, portal header / search opt-ins
SECTIONS           // Pages and navigation structure
PERSONAS           // Persona records (drives STORY_MAP + persona pages)
DESIGN_STORIES     // Rich implementation tracking (phases, AC, decisions)
JOURNEYS           // User flow definitions
SCENARIOS          // Guided walkthrough scripts
NIB_BLUEPRINTS     // Service blueprint flows (drives the React Flow canvas)
NIB_REGISTRIES     // Controlled vocab (initiatives, tags, etc.)
```

Agents read this data and the reference docs to generate pages that are internally consistent — the sitemap reflects SECTIONS, design notes reference the right personas, the AC badges link to the right design stories, and blueprint canvases drill into nested sub-blueprints.

### Spreadsheet as source of truth

The fastest path is letting Excel or Google Sheets drive the project. One workbook, one tab per resource type:

| Tab | Drives data | Drives wiki |
|---|---|---|
| `meta` | `WIREFRAME_CONFIG` | `Home.md` title + status |
| `pages` | `SECTIONS` | `Pages.md` |
| `tokens` | CSS variable overrides | `Tokens.md` |
| `personas` | Persona records | `Personas.md` + `Persona-{id}.md` per row |
| `stories` | `DESIGN_STORIES` + JTBDs | `Stories.md` + `Story-{id}.md` per row |
| `<flow-id>` | One service blueprint per non-reserved tab | `Blueprints.md` + `Blueprint-{id}.md` per tab |
| `_<name>` | Registries (controlled vocab) | `Registries.md` |

`nib-ingest` reads the workbook, writes `data/*.js`, **and** regenerates the wiki's auto pages. Edit the workbook, run `nib-sync`, refresh the page; the wiki reflects the change. The blueprint canvas in `examples/service-blueprint/` also round-trips canvas edits back to xlsx.

## Other ways to set up

### Submodule (long-lived projects that want to track upstream nib)

`npx create-nib` bundles a runtime subset of nib into your project so it's self-contained — that's the right shape for a one-off prototype or a project that may diverge from upstream. For long-lived projects that should always track the latest nib, use a git submodule instead:

```bash
mkdir my-project && cd my-project && git init
git submodule add https://github.com/rydersd/nib.git nib
mkdir pages
```

Pages reference `../nib/core/proto-tokens.css` and `../nib/core/proto-nav.js`. Pull updates with:

```bash
git submodule update --remote nib
git add nib && git commit -m "Update nib framework"
```

Clone a project that uses the submodule with `git clone --recurse-submodules <url>`.

### Migrating an existing project to the submodule

If you already copied `core/` and `surfaces/` into a project, swap them for a submodule + symlinks so existing paths keep working:

```bash
rm -rf core/ surfaces/
git submodule add https://github.com/rydersd/nib.git nib
ln -s nib/core core
ln -s nib/surfaces surfaces
git add .gitmodules nib core surfaces
git commit -m "Migrate nib from copy to submodule"
```

### Copy (no-git environments)

Copy `core/` and `surfaces/` directly into your project. Pages reference `core/proto-core.css` with no `nib/` prefix. Manual re-copy required when nib updates.

For the full bootstrap process, read [`ref/new-project.md`](ref/new-project.md).

## Agent Compatibility

Nib is built and tested with [Claude Code](https://claude.ai/claude-code), but the contract is in plain Markdown. Every scaffolded project ships with a `CLAUDE.md` that explains the wiki maintenance contract — which `docs/*.md` are auto vs hand, when to run `nib-sync`, where narrative belongs. Any frontier model that reads `CLAUDE.md`-style instructions (Cursor, Continue, GitHub Copilot Workspace, etc.) can pick up the contract.

If you get Nib working with another agent and want to adapt the project `CLAUDE.md` template for a different agent's conventions, PRs welcome.

## Key Concepts

**Design tokens, not hex values.** Every color is a CSS custom property (`--wf-ink`, `--wf-accent`, `--wf-surface`, etc.). Change the token, change every page.

**Surfaces for platform context.** Building a Salesforce wireframe? Load `surfaces/salesforce.css` and get SLDS-aware components. Slack? Load `surfaces/slack.css`. Internal portal? `surfaces/internal-ds.css`. One surface per page.

**Fidelity communicates certainty.** A three-position slider shifts every page between napkin sketch (hand-drawn feel), blueprint (balanced wireframe), and polished (clean, precise). Use `data-wf-confidence` on any element to visually flag uncertain features.

**Design stories track implementation.** Each story has a user story statement, acceptance criteria, phased implementation approach (OOB / Config / Custom LWC), decision log, and optional platform suggestions. The Design Stories page auto-generates a roadmap, metrics, and validation warnings from this data.

**Everything explains itself.** Every wireframe page includes a design notes panel with context (what and why), design specification (how it works), and technical details (how to build it). Stakeholders don't need a walkthrough — they can read the notes.

**Spreadsheets are first-class.** Service designers usually have an Excel workbook or a Google Sheet long before they have a project. Nib reads the workbook directly — `nib-ingest` materializes the project from it, `nib-sync` keeps them in sync, and the React Flow blueprint canvas in `examples/service-blueprint/` round-trips edits back to xlsx. The same canonical schema (`core/schema/workbook.schema.json`) validates Excel, Sheets, and hand-authored JS.

**Service blueprints are nested.** Leadership gets a bird's-eye Overview card per blueprint (one-line outcome plus a "what changes" list); clicking a node with a `childBlueprintId` drills into the sub-blueprint and updates the breadcrumb. One workbook can express a multi-level program → sub-process → step hierarchy without leaving the spreadsheet.

**The wiki is the documentation surface.** Every Nib project includes a `docs/` wiki — auto-generated pages from the workbook (Personas, Blueprints, Pages, Stories, …) plus hand-authored narrative (Decisions, Architecture, Glossary, …). Auto pages have a `<!-- nib:auto -->` marker; sync overwrites only those. Hand pages with no marker are immune. The project's `CLAUDE.md` documents the contract so any LLM working on the project knows when to run sync and where narrative belongs.

## Structure

```
nib/
├── core/           Shared CSS + JS runtime (do not modify per-project)
│   ├── proto-core.css         Design tokens + base components
│   ├── proto-nav.js           Navigation engine, design notes, walkthroughs, deep-link copy
│   ├── proto-search.js        Opt-in portal header + search + Ask AI mode
│   ├── proto-gen.js           Declarative page renderer
│   ├── proto-compose.js       COMPOSE → PAGE_BLUEPRINT transformation
│   ├── proto-stories.js       Design stories page renderer
│   ├── compose-flow.js        Multi-page flow wiring (wizard, scenarios)
│   ├── schema/                JSON Schema for the canonical Nib project shape
│   ├── ingest/                Adapter-agnostic Excel/Sheets → project pipeline
│   └── blueprint/             React Flow service blueprint canvas + exporters
├── surfaces/       Platform CSS overlays
│   ├── salesforce.css         SFDC record pages, path bar, feed
│   ├── slack.css              Slack app shell, messages, threads
│   └── internal-ds.css        Portal KPIs, form groups, cards
├── tools/          Node CLIs
│   ├── nib-create.js          Browser-based project scaffolder
│   ├── nib-ingest.js          Excel / Sheets → Nib project
│   ├── nib-sync.js            Idempotent re-ingest with diff
│   ├── wizard/                UI served by nib-create
│   └── nib-cli.js             Validation / pull-reviews / brief / dashboard
├── packages/
│   └── create-nib/            Thin npm wrapper so `npm create nib <name>` resolves
├── ref/            Agent reference docs (read before building)
├── docs/           Wiki — human-facing companion to ref/
├── starters/       Single-file copy-paste HTML templates
└── examples/       Multi-file project templates (clone whole)
    ├── spreadsheet-bootstrap/ 9-tab worked example with nested blueprints
    ├── service-blueprint/     Editable React Flow canvas
    ├── feedback-triage/       File System Access API review tool
    ├── research-study/        Card-sort runner + persona/JTBD scaffolds
    ├── deal-registration/     Multi-step business flow
    ├── cloudflare-worker/     Backend for feedback + comment counts + card-sort
    ├── kanban-board/ · charts-dashboard/ · data-table/ · agent-chat/
    └── pinterest-board/ · newspaper/ · test-project/
```

## Design Token Palette

| Token | Use |
|-------|-----|
| `--wf-ink` | Headings, borders |
| `--wf-text` | Body text |
| `--wf-accent` | The ONE blue — links, active states |
| `--wf-surface` | Card backgrounds |
| `--wf-canvas` | Page background |
| `--wf-green` | Success, confirmed, OOB approach |
| `--wf-amber` | Warnings, pending, config approach |
| `--wf-red` | Errors, overdue, custom dev approach |
| `--wf-purple` | AI, suggestions |

## License

MIT
