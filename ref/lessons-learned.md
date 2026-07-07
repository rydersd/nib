# Lessons Learned

> ⚠️ **Deprecated.** Edit [`docs/Lessons-Learned.md`](../docs/Lessons-Learned.md) instead. This file will be removed in a future release.

> Root cause documentation from PP-Selfserve Phase 2 implementation. Read this before starting a new project to avoid repeating these mistakes.

## 1. Stale File Copies

**What happened:** pp-selfserve had an old copy of proto-nav.js missing the 3-tab notes split and "Notes" rename.

**Root cause:** No sync mechanism between nib source of truth and project copies. Authors copy files once and forget.

**Fix:** Always sync core files from nib before making changes. Consider symlinks or a build step.

**Framework instruction:** Before editing any page, verify core/ files match nib.

## 2. Wrong WIREFRAME_CONFIG Keys

**What happened:** project-data.js used `projectTitle` and `feedbackMailto` — proto-nav.js expects `title` and `emailRecipient`.

**Root cause:** The config key names weren't documented anywhere. Authors guess based on what seems logical.

**Fix:** Fixed the keys. Added config key reference to navigation.md.

**Framework instruction:** See navigation.md for the complete WIREFRAME_CONFIG key reference with expected types.

## 3. JOURNEYS Object vs Array Mismatch

**What happened:** proto-nav.js loops JOURNEYS with `.length` (array), but pp-selfserve defines it as an object with string keys. Journey features silently break because `JOURNEYS.length === undefined`.

**Root cause:** navigation.md shows JOURNEYS as an array example but doesn't enforce it. The object format is more natural for keyed data.

**Fix:** Added `normalizeJourneys()` that accepts both formats and converts objects to arrays. Docs updated to show both formats.

## 4. Notes Panel Clipping Page Content

**What happened:** Notes panel is position:fixed and overlays content. Opening it clips the wireframe page.

**Root cause:** The panel was designed as a modal overlay (like mobile), not a persistent sidebar. No mechanism to push content left.

**Fix:** Added `html.wf-dn-open` class that sets `body { margin-right: 400px }` with transition.

## 5. Missing SFDC Global Header

**What happened:** Pages had the framework context bar but no Salesforce-style header, confusing reviewers about what's wireframe chrome vs app UI.

**Root cause:** Framework didn't distinguish between "wireframe tools" (context bar, notes, fidelity) and "app chrome" (platform header, nav tabs). No surface-specific header injection.

**Fix:** Added `buildSurfaceHeader()` in proto-nav.js that auto-injects SFDC global header when `type: 'sfdc'` is set on SECTIONS items.

## 6. Story Mode Confusion (Three Overlapping Features)

**What happened:** "Journeys" highlights elements, "Stories" shows Jira badges, "Scenarios" does narrative walkthroughs — but they're presented as separate features with unclear purposes.

**Root cause:** Features were added incrementally without a unifying design. The naming is confusing (wfStory* functions control journeys, not stories).

**Fix:** Unified into single "Stories" button → scenario selector → narrative walkthrough with optional journey highlighting and friction analysis. Jira AC badges moved to Notes Context tab.

## 7. Sitemap Was Hardcoded HTML

**What happened:** index.html had static HTML cards that drifted from SECTIONS when variants were added.

**Root cause:** No guidance that sitemaps should be generated from SECTIONS. The sitemap was hand-authored once and never updated.

**Fix:** Rewrote sitemap as JS-generated from SECTIONS with journey filtering.

## 8. User Stories vs Design Stories vs Personas Confusion

**What happened:** The framework conflated three concepts under "stories": user stories (JTBD items in design notes), design/implementation stories (STORY_MAP + STORY_TITLES), and story reference (proto-personas page).

**Root cause:** Incremental feature growth without clear naming. "Story Reference" page was actually about personas. "Story badges" were actually implementation tracking IDs. JTBD items in design notes were the actual user stories.

**Fix:** Separated the three concepts:
- **User stories (JTBD):** Persona goals in design notes, aggregated on the JTBD hub page
- **Design stories:** Rich implementation tracking via `DESIGN_STORIES` array, rendered on a dedicated Design Stories page with phased delivery, decisions, and SFDC approach suggestions
- **Personas:** Story Reference page renamed to "Personas & Organizations" to reflect actual content

**Framework instruction:** Use JTBD for user goals, DESIGN_STORIES for implementation planning, and the Personas page for character context. STORY_MAP remains as the lightweight page-to-story cross-reference for badge injection.

## 9. CSS `filter` on `body` Breaks Fixed Positioning

**What happened:** In napkin fidelity mode, `filter: grayscale(1)` was applied to `body`. The nav drawer (hamburger menu) used `position: fixed` — but CSS spec says `filter` on a non-root element creates a containing block for fixed descendants. Links in the drawer became unclickable because the drawer was positioned relative to body, not viewport.

**Root cause:** The filter was originally on `body` because that's where the background texture lives. But CSS containing block rules mean any `filter`, `transform`, or `will-change` on a non-root element traps fixed descendants.

**Fix:** Moved `filter: grayscale(1)` from `body` to `html` (the root element). Per CSS spec, the root element does NOT create a containing block for fixed descendants even with filter applied.

**Framework instruction:** Never apply `filter`, `transform`, `perspective`, `will-change`, or `contain: paint` to `body` or any ancestor of `position: fixed` elements. Apply to `html` (root) instead, or use an intermediate wrapper that doesn't contain fixed elements.

**File:** `proto-system/core/proto-tokens.css`

## 10. Inline CSS Custom Properties Override Declarations

**What happened:** In polished fidelity mode, hand-drawn edge wobble persisted despite CSS declaring `--wf-wobble-filter: none` on `html[data-wf-fidelity="polished"]`. Elements still showed wobble effects.

**Root cause:** `randomizeWobble()` runs at page load and sets `element.style.setProperty('--wf-wobble-filter', 'url(#wf-wobble-N)')` on every wobble-eligible element. Inline styles have higher specificity than any CSS declaration. So polished mode's CSS rule was overridden by every element's inline style.

**Fix:** (a) `randomizeWobble()` now checks fidelity and skips polished mode entirely. (b) Added `clearWobbleOverrides()` that removes inline `--wf-wobble-filter` from all elements. (c) `wfFidelityChange()` calls the appropriate function based on fidelity level.

**Framework instruction:** Avoid setting CSS custom properties via `element.style.setProperty()` when those properties need to be overridden by CSS declarations (e.g., fidelity changes). If you must set inline custom properties, provide a cleanup function and call it when the override condition changes.

**File:** `proto-system/core/proto-nav.js`

## 11. Paper Texture Z-Index Was Above All Content

**What happened:** The paper grain texture overlay (napkin mode `body::after`) had `z-index: 9998`, placing it above nearly everything including interactive elements. Combined with `pointer-events: none`, clicks passed through — but it created visual layering confusion and could interfere with screen readers.

**Root cause:** The original value was likely chosen to "always be on top" without considering the framework's z-index architecture. The framework has a clear layering system: page content → context bar (1000) → nav drawer (2001) → notes panel (3001) → modals (4000). A background texture at 9998 violates this.

**Fix:** Lowered to `z-index: 800` — above page content but below all framework chrome.

**Framework instruction:** Follow the z-index architecture: page < 1000 ≤ context bar < 2001 ≤ nav drawer < 3001 ≤ notes panel < 4000 ≤ modals. Never assign arbitrary high z-index values.

**File:** `proto-system/core/proto-tokens.css`
