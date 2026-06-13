# Project Deliverables

**Tags:** `guide` · `deliverables` · `reference-hubs`

A complete prototype isn't just wireframe pages — it's a set of **reference hub pages** that frame them: sitemap, JTBD, user flows, personas, design stories. These pages share a common nav bar and live alongside the wireframes.

> **Agent reference:** [`ref/project-deliverables.md`](../ref/project-deliverables.md) — full structure for each deliverable.

## The five hub pages

| Page | File | When to create | Starter |
|---|---|---|---|
| Sitemap | `index.html` | First — it's the landing page | `starters/sitemap.html` |
| JTBD Hub | `jobs-to-be-done.html` | After 3+ pages have JTBD in their design notes | `starters/jtbd.html` |
| User Flows | `user-flows.html` | After defining `JOURNEYS` | `starters/user-flows.html` |
| Personas | `story-reference.html` | When 2+ personas are referenced in design notes | `starters/story-reference.html` |
| Design Stories | `design-stories.html` | When tracking implementation (phases, AC, approach) | `starters/design-stories.html` |

All five share a **view-control nav bar** at the top that links them together.

## Data sources

| Deliverable | Driven by |
|---|---|
| Sitemap | `SECTIONS` in `project-data.js` |
| JTBD Hub | JTBD sections in each page's `wf-design-notes` |
| User Flows | `JOURNEYS` + optional `SCENARIOS` |
| Personas | Persona references in design notes |
| Design Stories | `DESIGN_STORIES` + `PROJECT_PHASES` |

The Design Stories page auto-generates from data — you don't hand-author cards. When both `STORY_MAP` and `DESIGN_STORIES` exist, AC badges in the Notes panel become clickable links back to the corresponding story card.

## Three kinds of "stories" — don't conflate them

Nib uses the word "story" in three places. Keep them separate:

| Concept | Where it lives | What it is |
|---|---|---|
| **User stories (JTBD)** | Design notes + JTBD hub | Persona-specific goals (e.g. "As a rep, I want…") |
| **Design stories** | `DESIGN_STORIES` + Design Stories page | Rich implementation tracking — AC, phases, decisions |
| **Personas** | Personas page | Character cards (not stories at all) |

[[Lessons-Learned]] #8 explains the incident that produced this split.

## Sitemap is data-driven

Never hand-author a sitemap — it drifts. Render it from `SECTIONS` so new pages appear automatically. See [[Lessons-Learned]] #7.

---

## Related

- [[Navigation]] — the data structures that drive these pages
- [[Design-Notes]] — where JTBD and persona references originate
- [[New-Project]] — when in the bootstrap process to add each
- [[Examples]] — see Sales Portal for a complete deliverables set
