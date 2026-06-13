# Review Mode

**Tags:** `reference` · `review` · `runtime` · `feedback`

Stakeholder reactions on wireframe elements. Reviewers toggle a mode, hover any element with `data-wf-confidence`, and mark it ✓ / ? / ✗ with a comment. Annotations persist per session and can sync to Cloudflare KV for team-wide collection.

> **Source reference:** See [`ref/architecture.md`](../ref/architecture.md) §9 for the full review-mode interaction flow and data-persistence architecture.

## How it works

1. Reviewer clicks the **Review** toggle in the context bar → `html.wf-review-active` added
2. All `[data-wf-confidence]` elements get a floating toolbar on hover
3. Click ✓ (confirm) / ? (question) / ✗ (reject) → capture a note + reviewer name
4. Each reaction becomes a `data-wf-review` attribute and an annotation record
5. Annotations stored in `sessionStorage` as `wf_review_annotations` (full array across all pages)
6. Optional: `POST /api/reviews` to a Cloudflare Pages Function → KV store → `nib pull-reviews` drops them into `reviews/{page}-{date}.json` (committed to git)

## Annotation record

```js
{
  elementSelector: '.sfdc-card[data-journey="eligibility"]',
  elementText:     'Eligibility Check',
  previousConfidence: 'partial',
  reaction: 'question',        // 'confirm' | 'question' | 'reject'
  note:     'Can we try dropdown instead of radio buttons?',
  reviewer: 'stakeholder-name',
  timestamp: '2026-03-18T14:30:00Z',
  page:     'eligibility-check'
}
```

## Heat map view

Toggle `html.wf-review-heatmap` to colorize all reacted elements by their `data-wf-review` state — confirms green, questions amber, rejects red — for an at-a-glance view of where stakeholders had concerns.

## Where to annotate

Apply `data-wf-confidence` to anything reviewers should evaluate — not just the uncertain ones. See [[Confidence-Levels]] for when to use each value. Elements without `data-wf-confidence` can't be reacted to.

## Reviews tab in the notes panel

When review mode is active, a **Reviews** tab appears in the Notes panel showing a per-page summary, export controls, and the full annotation list.

---

## Related

- [[Feedback]] — freeform feedback button → GitHub issues + R2 screenshots
- [[Confidence-Levels]] — the attribute that makes an element reviewable
- [[Architecture]] — data flow, sessionStorage keys, Cloudflare sync
- [[Philosophy]] — why deliberate imperfection invites feedback
- [[Design-Notes]] — static notes vs interactive reviews
