**Tags:** `wiki` · `runtime` · `automation`

# Project Wiki

Every Nib project ships with a `docs/` wiki that's **auto-generated from the workbook and auto-maintained by the LLM working on the project**. This page describes the contract.

> **Agent reference:** None — this page is the source of truth. The framework's emitter lives at `core/ingest/emit-wiki.js`.

## Two kinds of pages

| Kind | Marker | Who owns it | Sync behavior |
|---|---|---|---|
| **Auto** | `<!-- nib:auto source=… -->` on line 1 | The framework | Overwritten on every `nib-sync` |
| **Hand** | `<!-- nib:starter -->` or no marker | You + the LLM | Never touched by sync |

### Auto pages

Regenerated from the canonical project shape on every sync. Identical input → byte-identical output (idempotent), so `nib-sync --check` is CI-safe.

- `Home.md` · `_Sidebar.md` · `_Footer.md`
- `Pages.md` — sections + page table
- `Personas.md` (index) + `Persona-{id}.md` per persona
- `Blueprints.md` (index + tree) + `Blueprint-{id}.md` per flow
- `Stories.md` (grouped by `kind`: jtbd / design / ac) + `Story-{id}.md` per story
- `Tokens.md` — when token overrides exist
- `Registries.md` — when underscore tabs exist

The marker on line 1 is what `nib-sync` checks — anything starting `<!-- nib:auto` is treated as overwriteable.

### Hand pages

Written once on initial scaffold (with a `<!-- nib:starter -->` marker), never touched again:

- `README.md` — project pitch
- `Decisions.md` — append-only decision log
- `Architecture.md` — system shape, surfaces, integrations
- `Glossary.md` — terminology
- `Lessons-Learned.md` — retrospective

You can also create your own narrative pages — anything that isn't an auto-page name (e.g. `Notes-Persona-leadership.md`, `Phase-2-plan.md`, `Stakeholder-feedback.md`). Sync ignores them. The starter marker is just a hint; pages with no marker at all are also immune (the rule is "must contain `<!-- nib:auto` to be overwriteable").

## Maintenance contract

Every scaffolded project gets a `CLAUDE.md` at the repo root that codifies this contract for any LLM working on the project. It says:

1. **After structural edits → run `npx nib-sync`.** Workbook changes, page renames, new personas, etc. all flow through sync.
2. **After significant decisions → append to `docs/Decisions.md`.** Format: dated heading, context, decision, alternatives, trade-offs, affected pages (cross-linked).
3. **When renaming a resource id → search-replace `[[Persona-old]]` references** so wikilinks don't dangle.
4. **Never edit auto pages directly.** Narrative goes on hand pages or sibling notes pages.

This is "push" maintenance: the LLM is responsible for invoking sync. We don't ship a Claude Code Stop hook because hooks fire at unexpected times — explicit instructions are predictable.

## Cross-references

Wikilinks use `[[Page-Name]]` syntax — Obsidian / Foam / Dendron compatible. GitHub renders the structure but not the link arrows; that's an accepted trade-off (matches the framework wiki's existing convention and the user's "wikis live in main repo, no `*.wiki.git` submodule" rule).

Display labels: `[[Page-Name|Custom Label]]`.

## Mechanics

The pipeline:

```
   Workbook (or data/*.js)
          │
          │  buildProject(tabs)
          ▼
   Canonical project shape  ← validated against core/schema/workbook.schema.json
          │
   ┌──────┴──────┐
   ▼             ▼
 emit()      emitWiki()
 data/*.js   docs/*.md
```

`emit()` and `emitWiki()` both consume the same canonical shape, so the data files and the wiki can never disagree about, say, who the personas are. `nib-sync` runs both into a shadow directory, byte-diffs against the project, and applies the diff — auto pages and data files only.

## CLI

| Command | What it does |
|---|---|
| `npx nib-ingest <workbook> --out <dir>` | First-time scaffold — writes data/* + wiki/* + stub pages |
| `npx nib-ingest <workbook> --out <dir> --no-wiki` | Same, skip the wiki |
| `npx nib-sync --project <dir>` | Re-ingest, regenerate auto data + wiki, leave hand pages |
| `npx nib-sync --project <dir> --check` | Dry-run; exit 1 on drift |
| `npx nib-wiki sync --project <dir>` | Wiki only (skip data/ regen) |
| `npx nib-wiki check --project <dir>` | Dry-run wiki only |
| `npx nib-wiki sync --restore-stubs` | Recreate any deleted hand-page starters |

## Naming conventions (don't collide)

The framework owns these page names — don't create hand pages with these names:

```
Home, _Sidebar, _Footer,
Pages, Personas, Blueprints, Stories, Tokens, Registries,
Persona-*, Blueprint-*, Story-*
```

Anything else is yours. A useful pattern: prefix narrative pages with `Notes-`, `Phase-`, or a topic name (`Onboarding-Lessons.md`, `Q3-Stakeholders.md`).

## Related

- [[Spreadsheet-Authoring]] — the workbook → project shape mapping
- [[Create-Project]] — the wizard that scaffolds the wiki on day 1
- [[Service-Blueprint]] — `Blueprint-{id}.md` cross-references this canvas
- [[Templates]] — every template ships with a wiki out of the box
