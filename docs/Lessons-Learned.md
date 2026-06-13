# Lessons Learned

**Tags:** `reference` · `postmortems` · `governance`

Root-cause writeups from real projects. Read this before starting a new project — it's the fastest way to avoid recurring mistakes.

> **Agent reference:** [`ref/lessons-learned.md`](../ref/lessons-learned.md) — full writeups with file paths and diffs.

## The 11 lessons

| # | Lesson | Why it matters |
|---|---|---|
| 1 | Stale file copies | Pages drift from framework source of truth — sync `core/` before editing |
| 2 | Wrong `WIREFRAME_CONFIG` keys | `projectTitle` and `feedbackMailto` fail silently — see [[Navigation]] for canonical keys |
| 3 | `JOURNEYS` object vs array | Both formats now supported; `normalizeJourneys()` converts at init |
| 4 | Notes panel clipping page content | Fixed via `html.wf-dn-open` → `body { margin-right: 400px }` |
| 5 | Missing SFDC global header | `buildSurfaceHeader()` now auto-injects when `type: 'sfdc'` |
| 6 | Story mode confusion (3 overlapping features) | Unified "Stories" button + scenario selector + optional journey highlighting |
| 7 | Hardcoded sitemap HTML | Sitemap must be generated from `SECTIONS` — see [[Project-Deliverables]] |
| 8 | User stories vs design stories vs personas | Three distinct concepts — see [[Project-Deliverables]] |
| 9 | `filter: grayscale(1)` on body broke `position:fixed` | CSS containing-block rule — apply `filter`/`transform`/`will-change` to `html`, never `body` |
| 10 | Inline CSS custom properties override CSS declarations | `randomizeWobble()` now skips polished mode + cleanup function on fidelity change |
| 11 | Paper texture `z-index: 9998` | Follow the architecture: page < 1000 ≤ context bar < 2001 ≤ drawer < 3001 ≤ notes < 4000 ≤ modals |

## How these map to automated checks

[[Doctor]] runs 15 checks on page load. Many trace directly to lessons here — the error messages include lesson numbers (`lesson #9`, `lesson #11`) so you can jump straight to the root cause.

---

## Related

- [[Architecture]] — the z-index architecture (#11) and state model
- [[Doctor]] — automated checks that catch most of these
- [[Navigation]] — `WIREFRAME_CONFIG` keys (#2) and `JOURNEYS` formats (#3)
- [[Project-Deliverables]] — the three-stories distinction (#8)
