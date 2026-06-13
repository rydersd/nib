# Feedback Worker

A reference Cloudflare Worker that turns feedback from the nib context bar into GitHub issues, with optional screenshots uploaded to R2.

## What it does

- Accepts `POST /api/feedback` from `wfFbSubmit` in `core/proto-nav.js`
- Creates an issue in the GitHub repo set by `GITHUB_REPO` using the `GITHUB_TOKEN` secret
- If an R2 bucket is bound, uploads the screenshot and embeds it in the issue body; otherwise notes that the image was received but not persisted
- Serves the prototype's static HTML from the same Worker (so the client and the API share an origin — no CORS to worry about)

## Setup

1. **Create the bucket** (optional — skip for text-only feedback):

   ```bash
   npx wrangler r2 bucket create my-feedback-shots
   ```

   Enable public access on the bucket in the Cloudflare dashboard. Copy the `pub-*.r2.dev` URL.

2. **Edit `wrangler.jsonc`** — replace every `TODO-*` placeholder:

   - `name` → your Worker name
   - `assets.directory` → path to your prototype HTML
   - `vars.GITHUB_REPO` → `your-org/your-repo`
   - `r2_buckets[0].bucket_name` → the bucket you created (or remove the whole block for text-only)
   - Uncomment `SCREENSHOTS_PUBLIC_BASE` and set it to the public URL from step 1

3. **Add the GitHub PAT** as a secret (never commit it):

   ```bash
   npx wrangler secret put GITHUB_TOKEN
   ```

   The token needs `repo` scope for private repos, or `public_repo` for public ones.

4. **Deploy:**

   ```bash
   npx wrangler deploy
   ```

5. **Point the client at it** — in your project's `project-data.js`:

   ```js
   var WIREFRAME_CONFIG = {
     // ...existing config...
     feedbackEndpoint: '/api/feedback',  // same origin — no CORS
     emailRecipient:   'team@example.com' // optional fallback if the Worker is down
   };
   ```

   Leave `feedbackEndpoint` blank to keep the legacy mailto behavior.

## Request / response shape

**Request** (from `wfFbSubmit` when `feedbackEndpoint` is set):

```json
{
  "type": "issue",
  "description": "The header wraps on mobile.",
  "page_url": "https://example.pages.dev/home.html",
  "page_file": "home",
  "persona": "Admin",
  "user_agent": "Mozilla/5.0 …",
  "screenshot_base64": "data:image/png;base64,iVBOR…"
}
```

`screenshot_base64` is null when no screenshot was captured. `type` is one of `bug`, `question`, `idea`, `issue`, `suggestion`, `approved`, `other` (anything else becomes `other`).

**Response:**

```json
{
  "success": true,
  "issue_number": 42,
  "issue_url": "https://github.com/your-org/your-repo/issues/42",
  "screenshot_url": "https://pub-…r2.dev/1714000000-home-ab12cd.png"
}
```

On failure, `wfFbSubmit` automatically falls back to mailto: when `emailRecipient` is also configured, so feedback is never dropped.

## Guardrails

- Descriptions are capped at 5 000 characters
- Screenshots are capped at 5 MB (bigger ones return an error rather than silently truncate)
- Only recognized `type` values are used; unknown values are coerced to `other`
- CORS is permissive (`Access-Control-Allow-Origin: *`) — tighten in the worker if you need to
- No rate limiting is built in; add a Turnstile or per-IP KV counter if you're exposing this publicly
