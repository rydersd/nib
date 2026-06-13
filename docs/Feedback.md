# Feedback → GitHub Issues

**Tags:** `guide` · `runtime` · `feedback` · `integrations`

The feedback button in the context bar can POST directly to a backend that opens a GitHub issue (and uploads the screenshot to R2). Set one config option; you're done.

> **Reference worker:** [`examples/cloudflare-worker/`](../examples/cloudflare-worker/) — ready-to-deploy Cloudflare Worker with the matching request/response contract.

## Two modes

| Mode | Selected when | Behavior |
|---|---|---|
| **Endpoint** | `WIREFRAME_CONFIG.feedbackEndpoint` is set | POST JSON payload to the endpoint. On success, toast the issue number. On failure, fall back to mailto if `emailRecipient` is also set. |
| **Mailto** (default) | `feedbackEndpoint` is blank | Open the user's mail client with a pre-filled subject + body. Screenshot (if any) is copied to the clipboard so the user can paste it. |

Both modes use the same [[Review-Mode|feedback panel]] UI — the capture, paste, and drop-to-upload options are identical.

## Client config

In `project-data.js`:

```js
var WIREFRAME_CONFIG = {
  title: 'My Project',
  feedbackEndpoint: '/api/feedback',   // any same-origin or CORS-enabled URL
  emailRecipient:   'team@example.com' // optional — used as fallback on network/server error
};
```

## Payload

`wfFbSubmit` sends this JSON:

```json
{
  "type": "issue",
  "description": "Header wraps awkwardly on mobile.",
  "page_url": "https://example.pages.dev/home.html",
  "page_file": "home",
  "persona": "Admin",
  "user_agent": "Mozilla/5.0 …",
  "screenshot_base64": "data:image/png;base64,iVBOR…",
  "node_id": "ds-rev"
}
```

`screenshot_base64` is `null` when no image was captured/pasted. `type` is one of `bug`, `question`, `idea`, `issue`, `suggestion`, `approved`, `other`. `node_id` is included when `window._wfActiveNodeId` is set — the [[Service-Blueprint]] canvas sets this when feedback is opened from a node so the worker can label the issue `node:<id>` (additive on top of `feedback:<type>`).

## Expected response

```json
{
  "success": true,
  "issue_number": 42,
  "issue_url": "https://github.com/your-org/your-repo/issues/42",
  "screenshot_url": "https://pub-….r2.dev/1714000000-home-ab12cd.png"
}
```

When the response includes an `issue_number`, the toast reads "Issue #42 created ✓"; otherwise it's a generic "Feedback sent ✓".

## Capture this page

The "📷 Capture this page" button in the panel uses [html2canvas](https://html2canvas.hertzen.com/) (~50 KB, lazy-loaded from jsdelivr on first click). The feedback overlay is hidden during capture so it doesn't appear in the snapshot. Captured images are stored as data URLs in the same `_wfFbScreenshot` slot that Paste and upload use.

Paste and drag-to-upload still work — use whichever is fastest.

## Reference worker

The [`examples/cloudflare-worker/`](../examples/cloudflare-worker/) recipe deploys in about ten minutes:

1. `npx wrangler r2 bucket create <name>` (optional — skip for text-only)
2. Edit `wrangler.jsonc` placeholders: worker name, assets directory, `GITHUB_REPO`, R2 bucket
3. `npx wrangler secret put GITHUB_TOKEN` (PAT with `repo` scope)
4. `npx wrangler deploy`
5. Point the client at it via `feedbackEndpoint`

The worker resolves the R2 binding by duck-typing (looks for any binding with `.put`/`.get`), so you can name it anything in `wrangler.jsonc` — no code changes required per project.

## Guardrails baked into the reference worker

- Descriptions capped at 5 000 characters
- Screenshots capped at 5 MB (bigger returns an error rather than silently truncate)
- Unknown `type` values are coerced to `other`
- CORS is permissive by default — tighten the `Access-Control-Allow-Origin` header if the worker is exposed publicly
- No rate limiting out of the box — add Turnstile or a per-IP KV counter if needed

## Bonus endpoints

The reference worker also ships two adjacent endpoints that pair with Nib features:

- **`GET /api/nodes/counts`** — returns `{ "<node-id>": <issue-count>, ... }` so a [[Service-Blueprint]] canvas can render a comment badge per card without N round-trips. 5-minute server-side cache.
- **`POST /api/card-sort`** — stores closed-card-sort study results as `card-sort:<study_id>`-labeled issues. Pair with a card-sort runner page to capture taxonomy data into the same issue tracker.

## Triage

For locally-stored feedback (offline review sessions writing JSON to disk), [`examples/feedback-triage/`](../examples/feedback-triage/) is a File System Access API tool that reads `<page>/feedback/` and `<page>/resolved/` subfolders and lets reviewers toggle status per item. For GitHub-issue-backed feedback, the GitHub UI's label filter (`label:feedback:bug`, `label:node:foo-step`) is the equivalent triage view.

## Fallback behavior

When the POST fails (network error, worker down, GitHub rate limited), the client silently falls back to mailto: if `emailRecipient` is configured. The user sees "Feedback sent ✓" either way; the console logs the underlying failure for debugging.

Leaving both `feedbackEndpoint` and `emailRecipient` unset shows "Could not send feedback. Please try again later." — the only case where feedback is actually dropped.

---

## Related

- [[Review-Mode]] — the broader review system; per-element annotations sit alongside freeform feedback
- [[Navigation]] — `WIREFRAME_CONFIG` schema including `feedbackEndpoint`
- [[Architecture]] — where the feedback panel lives in the load order
- [[Doctor]] — catches common config mistakes
