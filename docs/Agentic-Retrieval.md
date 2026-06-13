**Tags:** `tooling` · `agents`

# Agentic Retrieval

A pattern for making a large wireframe project AI-navigable. When a project has dozens or hundreds of HTML pages, an agent asked "where is X?" or "what is X?" shouldn't have to read every file. Agentic retrieval makes any such question answerable from a small, structured surface.

> **Agent reference:** None — this page is the source of truth.

## The problem

A mature Nib project sprawls. An agent (or a teammate) opening it cold faces a directory of opaque `*.html` files. Grepping page bodies is slow and noisy; reading them all blows the context budget. The fix is three lightweight artifacts that an agent can consult first.

## The three artifacts

### 1. Entry-point map

A short hand-written file (e.g. a `PROJECT-MAP.md` at the project root, or the wiki `Home.md`) that lists the project's main topics and points at the canonical page for each. This is the "front door" — an agent reads it once, then jumps straight to the right area.

### 2. Closed topic vocabulary

A single JSON file — by convention `data/topics.json` — defines every topic the project recognises. Every page is tagged with exactly one slug from this list, so the vocabulary never drifts.

```json
{
  "topics": {
    "onboarding": { "label": "Partner onboarding", "match": ["onboard", "apply"] },
    "billing":    { "label": "Billing & statements", "match": ["billing", "invoice"] },
    "deal-registration": { "label": "Deal registration", "match": ["deal-reg", "conflict"] }
  },
  "roles": {
    "index":     ["sitemap", "pages-index", "index"],
    "reference": ["reference", "glossary"]
  }
}
```

Each topic's `match` array is a list of substrings tested against a page's path. Roles work the same way and describe what *kind* of page it is (`wireframe`, `index`, `reference`, `ledger`, `spec`, …). If `roles` is omitted a small built-in default set is used.

### 3. Generated page index

Two generated files keep the project map honest:

- **`pages-index.html`** — a human-facing filterable table: search box, persona and recency chips, expandable design-notes summaries. Companion to a hand-curated sitemap.
- **`data/pages.json`** — a lean, machine-readable index. One compact JSON object per page (`p` path, `ti` title, `t` topic, `r` role, `ps` persona, `s` summary, `in` inbound link count, `m` modified date). An agent greps one line per page instead of reading whole HTML files.

## The two tools

Both ship in `tools/` and take a project directory as their first argument.

### `nib-seed-topics.js`

Adds `data-topic` and `data-role` attributes to every page's `<html>` tag, matched from the page path against the closed vocabulary.

```sh
node tools/nib-seed-topics.js ./my-project
node tools/nib-seed-topics.js ./my-project --dry-run         # report only
node tools/nib-seed-topics.js ./my-project --topics ./vocab.json
```

It is **idempotent** — a page that already carries `data-topic` is left untouched, so hand-set values always win. Per-file validation guards every write (structure intact, attribute present, sane size growth). Pages whose path matches no topic get `general`.

### `nib-pages-index.js`

Builds `pages-index.html` and `data/pages.json`.

```sh
node tools/nib-pages-index.js ./my-project
node tools/nib-pages-index.js ./my-project --no-html         # only pages.json
```

For each page it extracts title, persona (top-level directory), last-modified date (`git log`, falling back to file mtime), a short summary (first paragraph of the design-notes panel), inbound link count, and the seeded `data-topic` / `data-role`. It flags pages still missing `data-topic` and exits non-zero so the step can gate CI.

## Recommended workflow

```sh
# 1. Tag every page (one-time, then on each new page)
node tools/nib-seed-topics.js ./my-project

# 2. Regenerate the index (wire into a predeploy / CI step)
node tools/nib-pages-index.js ./my-project
```

Run seed-topics first so every page carries a topic; run pages-index after so the index reflects the tags. Both are safe to re-run — seed-topics skips already-tagged pages, and pages-index simply overwrites its two outputs.

## Related

- [[Navigation]] — the in-page drawer that complements the generated index
- [[Project-Wiki]] — the `docs/` wiki, which can serve as the entry-point map
- [[Architecture]] — where these tools sit relative to the framework
