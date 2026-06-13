# Nib Doctor

**Tags:** `reference` · `diagnostics` · `runtime`

Diagnostic engine that catches silent failures before they cost hours to debug. Load it as a script, open the console.

> **Agent reference:** [`ref/doctor.md`](../ref/doctor.md) — full check list with severity and linked lessons.

## Usage

Add after your last `<script>` tag:

```html
<script src="../core/proto-doctor.js"></script>
```

Open the browser console:

```
[nib-doctor] Running 15 checks on "home"...
[nib-doctor] ✓ WIREFRAME_CONFIG keys valid
[nib-doctor] ⚠ STORY_MAP references page "detail" not found in SECTIONS
[nib-doctor] ✗ filter: grayscale(1) on body — move to html (lesson #9)
[nib-doctor] 13/15 passed · 1 warning · 1 error
```

## What it catches

15 checks across five categories:

| Category | Examples |
|---|---|
| Data structure | `SECTIONS` missing fields, `JOURNEYS` format, unknown `WIREFRAME_CONFIG` keys |
| Cross-references | `STORY_MAP` pointing to nonexistent pages, `DESIGN_STORIES` id drift |
| Load order | `project-data.js` loaded after `proto-nav.js` |
| Surface mismatch | SFDC/Slack/DS elements on pages without matching surface CSS |
| Framework hygiene | `filter` on body (lesson #9), z-index violations (lesson #11), polished-mode wobble leak (lesson #10), hardcoded hex colors, missing design notes, dead drawer links |

Each error links back to a [[Lessons-Learned]] entry explaining **why** it's a problem.

## Principles

- **Read-only** — never modifies the page
- **Optional** — omit the script tag and it's gone
- **Agent-parseable** — every line starts with `[nib-doctor]`
- **Programmatic** — full results at `window.NibDoctor` (`{ checks, results, passed, warnings, errors, timestamp }`)

## Typical workflow

- **Development** — keep the script tag active, fix warnings as they appear
- **Review/demo** — comment it out (zero runtime overhead when not loaded)
- **CI** — parse `window.NibDoctor.errors` count as a quality gate

---

## Related

- [[Lessons-Learned]] — every error links back to a numbered lesson
- [[Architecture]] — z-index architecture the z-index check enforces
- [[Navigation]] — data structures the config/sections checks validate
- [[Design-Tokens]] — what the hardcoded-hex check is pushing you toward
