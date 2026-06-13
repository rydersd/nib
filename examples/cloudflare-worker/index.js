/**
 * Reference Cloudflare Worker for nib feedback.
 *
 * Handles `POST /api/feedback` from the feedback panel (wfFbSubmit) and
 * creates a GitHub issue in a target repo using the GITHUB_TOKEN secret.
 * When an R2 binding is configured, a submitted screenshot is uploaded
 * there and embedded in the issue body; otherwise it's silently skipped
 * with a note so the author knows why the image didn't land.
 *
 * Required secrets:
 *   GITHUB_TOKEN              GitHub PAT with `repo` scope
 *
 * Required vars (wrangler.jsonc):
 *   GITHUB_REPO               e.g. "your-org/your-repo"
 *
 * Optional:
 *   SCREENSHOTS               R2 bucket binding (any name) — see wrangler.jsonc
 *   SCREENSHOTS_PUBLIC_BASE   Custom domain for the bucket (no trailing slash)
 *
 * Everything not under /api/feedback passes through to the ASSETS binding,
 * so your prototype's static HTML is served by the same Worker.
 */

const KNOWN_TYPES = ['bug', 'question', 'idea', 'issue', 'suggestion', 'approved', 'other'];
const MAX_DESCRIPTION = 5000;
const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024; // 5 MB

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/feedback') {
      if (request.method === 'OPTIONS') return corsPreflight();
      if (request.method === 'POST') return handleFeedback(request, env);
      return errJson('Method not allowed', 405);
    }

    if (url.pathname === '/api/nodes/counts') {
      if (request.method === 'OPTIONS') return corsPreflight();
      if (request.method === 'GET') return handleNodeCounts(env);
      return errJson('Method not allowed', 405);
    }

    if (url.pathname === '/api/card-sort') {
      if (request.method === 'OPTIONS') return corsPreflight();
      if (request.method === 'POST') return handleCardSort(request, env);
      return errJson('Method not allowed', 405);
    }

    // Static asset passthrough. Remove this branch if you only want the
    // Worker to serve the API and nothing else.
    if (env.ASSETS) return env.ASSETS.fetch(request);
    return errJson('Not found', 404);
  },
};

async function handleFeedback(request, env) {
  if (!env.GITHUB_TOKEN) return errJson('Server not configured (missing GITHUB_TOKEN)', 500);
  if (!env.GITHUB_REPO)  return errJson('Server not configured (missing GITHUB_REPO)', 500);

  let payload;
  try {
    payload = await request.json();
  } catch {
    return errJson('Invalid JSON body', 400);
  }

  const description = String(payload.description || '').trim();
  const rawType     = String(payload.type || 'other').toLowerCase();
  const type        = KNOWN_TYPES.includes(rawType) ? rawType : 'other';
  const pageUrl     = String(payload.page_url || '').slice(0, 500);
  const pageFile    = String(payload.page_file || 'unknown').slice(0, 100);
  const persona     = String(payload.persona || '').slice(0, 100);
  const userAgent   = String(payload.user_agent || '').slice(0, 500);
  const screenshotB64 = typeof payload.screenshot_base64 === 'string' ? payload.screenshot_base64 : null;
  // Optional: which blueprint / journey node this comment is scoped to.
  // Sanitized to match the kebab character set so GitHub label rules accept
  // it and we can't be tricked into constructing something weird.
  const nodeIdRaw = String(payload.node_id || '').trim();
  const nodeId = /^[a-z0-9][a-z0-9-]{0,60}$/i.test(nodeIdRaw) ? nodeIdRaw : '';

  if (!description) return errJson('description required', 400);
  if (description.length > MAX_DESCRIPTION) {
    return errJson(`description too long (max ${MAX_DESCRIPTION} chars)`, 400);
  }

  let screenshotUrl = null;
  let screenshotNote = null;
  if (screenshotB64) {
    try {
      const upload = await uploadScreenshot(screenshotB64, env, pageFile);
      if (upload) screenshotUrl = upload;
      else screenshotNote = '_(Screenshot was attached but no R2 bucket is bound — image skipped.)_';
    } catch (e) {
      screenshotNote = `_(Screenshot upload failed: ${String(e.message || e).slice(0, 120)})_`;
    }
  }

  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
  const firstLine = description.split('\n')[0].trim().slice(0, 80);
  const title = `[${typeLabel}] ${pageFile}: ${firstLine}`;

  const body = [
    `**Page:** \`${pageFile}\``,
    pageUrl ? `**URL:** ${pageUrl}` : null,
    persona ? `**Persona:** ${persona}` : null,
    nodeId ? `**Node:** \`${nodeId}\`` : null,
    `**Type:** ${typeLabel}`,
    `**Submitted:** ${new Date().toISOString()}`,
    '',
    '---',
    '',
    description,
    '',
    screenshotUrl ? `### Screenshot\n![screenshot](${screenshotUrl})` : null,
    screenshotNote,
    '',
    '---',
    userAgent ? `_User Agent: ${userAgent}_` : null,
    '_Auto-created from the nib feedback panel._',
  ].filter(Boolean).join('\n');

  const ghRes = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'nib-feedback-worker',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      body,
      labels: nodeId ? [`feedback:${type}`, `node:${nodeId}`] : [`feedback:${type}`],
    }),
  });

  if (!ghRes.ok) {
    const detail = (await ghRes.text()).slice(0, 500);
    return new Response(
      JSON.stringify({ error: `GitHub API ${ghRes.status}`, detail }),
      { status: 502, headers: corsHeaders({ 'Content-Type': 'application/json' }) }
    );
  }

  const issue = await ghRes.json();
  return new Response(
    JSON.stringify({
      success: true,
      issue_number: issue.number,
      issue_url: issue.html_url,
      screenshot_url: screenshotUrl,
    }),
    { status: 201, headers: corsHeaders({ 'Content-Type': 'application/json' }) }
  );
}

// Resolve the first R2 bucket binding the project has configured. The
// binding can be called anything in wrangler.jsonc — we look for a `.put`
// method rather than hardcoding a name so this worker ships unchanged.
function resolveR2(env) {
  if (env.SCREENSHOTS && typeof env.SCREENSHOTS.put === 'function') return env.SCREENSHOTS;
  for (const key of Object.keys(env)) {
    const v = env[key];
    if (v && typeof v.put === 'function' && typeof v.get === 'function') return v;
  }
  return null;
}

async function uploadScreenshot(dataUrl, env, pageFile) {
  const bucket = resolveR2(env);
  if (!bucket) return null;

  const m = /^data:(image\/[a-z+]+);base64,(.+)$/i.exec(dataUrl);
  if (!m) throw new Error('Unrecognized data URL format');
  const mime = m[1];
  const b64  = m[2];
  const ext  = mime.replace(/^image\//, '').replace('jpeg', 'jpg');

  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  if (bytes.length > MAX_SCREENSHOT_BYTES) {
    throw new Error(`Screenshot exceeds ${MAX_SCREENSHOT_BYTES / 1024 / 1024} MB limit`);
  }

  const stamp = Date.now();
  const rand  = Math.random().toString(36).slice(2, 8);
  const safeFile = (pageFile || 'page').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
  const key = `${stamp}-${safeFile}-${rand}.${ext}`;

  await bucket.put(key, bytes, { httpMetadata: { contentType: mime } });

  const base = (env.SCREENSHOTS_PUBLIC_BASE || '').replace(/\/+$/, '');
  if (base) return `${base}/${key}`;
  // No public base configured — caller may want to build the URL at
  // review time. Returning null triggers the "R2 bucket is not bound"
  // note in the issue body, which is the honest signal.
  return null;
}

function corsPreflight() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders({
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    }),
  });
}

function corsHeaders(extra = {}) {
  return { 'Access-Control-Allow-Origin': '*', ...extra };
}

function errJson(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: corsHeaders({ 'Content-Type': 'application/json' }),
  });
}

// ─────────────────────────────────────────────────────────────
// POST /api/card-sort
//
// Body: { study_id, started_at, finished_at, placements, user_agent }
// Stores each submission as a GitHub issue with label
// `card-sort:<study_id>` so all responses for a study can be listed
// later via the issues API.
// ─────────────────────────────────────────────────────────────
async function handleCardSort(request, env) {
  if (!env.GITHUB_TOKEN) return errJson('Server not configured (missing GITHUB_TOKEN)', 500);
  if (!env.GITHUB_REPO)  return errJson('Server not configured (missing GITHUB_REPO)', 500);

  let payload;
  try { payload = await request.json(); } catch { return errJson('Invalid JSON body', 400); }

  const studyIdRaw = String(payload.study_id || '').trim();
  if (!/^[a-z0-9][a-z0-9-]{0,60}$/i.test(studyIdRaw)) return errJson('study_id required', 400);
  if (!payload.placements || typeof payload.placements !== 'object') return errJson('placements required', 400);

  // Cap placements size — a reasonable closed sort has <200 cards.
  const placements = {};
  let count = 0;
  for (const k of Object.keys(payload.placements)) {
    if (count++ >= 200) break;
    const v = payload.placements[k];
    if (v === null || (typeof v === 'string' && v.length < 60)) {
      placements[String(k).slice(0, 80)] = v;
    }
  }
  const sorted = Object.values(placements).filter((v) => v).length;
  const total = Object.keys(placements).length;

  const stored = {
    study_id: studyIdRaw,
    started_at: String(payload.started_at || '').slice(0, 40),
    finished_at: String(payload.finished_at || '').slice(0, 40),
    placements,
    user_agent: String(payload.user_agent || '').slice(0, 400),
  };
  const title = `[Card sort] ${studyIdRaw}: ${sorted}/${total} sorted`;
  const body = '```json\n' + JSON.stringify(stored, null, 2) + '\n```';

  const ghRes = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'nib-card-sort-worker',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, body, labels: [`card-sort:${studyIdRaw}`] }),
  });
  if (!ghRes.ok) {
    const detail = (await ghRes.text()).slice(0, 400);
    return new Response(JSON.stringify({ error: `GitHub API ${ghRes.status}`, detail }),
      { status: 502, headers: corsHeaders({ 'Content-Type': 'application/json' }) });
  }
  const issue = await ghRes.json();
  return new Response(JSON.stringify({ success: true, issue_number: issue.number }),
    { status: 201, headers: corsHeaders({ 'Content-Type': 'application/json' }) });
}

// ─────────────────────────────────────────────────────────────
// GET /api/nodes/counts
//
// Returns { "<node-id>": <issue-count>, ... } so a journey/blueprint
// canvas can render a comment badge per card without N fetches.
// 5-minute server-side cache to keep GitHub rate limits happy.
// ─────────────────────────────────────────────────────────────
const COUNTS_CACHE_TTL_MS = 5 * 60 * 1000;
let _countsCache = { at: 0, data: null };

async function handleNodeCounts(env) {
  if (!env.GITHUB_TOKEN) return errJson('Server not configured (missing GITHUB_TOKEN)', 500);
  if (!env.GITHUB_REPO)  return errJson('Server not configured (missing GITHUB_REPO)', 500);

  if (_countsCache.data && Date.now() - _countsCache.at < COUNTS_CACHE_TTL_MS) {
    return new Response(JSON.stringify(_countsCache.data), {
      status: 200,
      headers: corsHeaders({ 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' }),
    });
  }

  // Page through up to 4 × 100 results; beyond that we accept truncation.
  const counts = {};
  let page = 1;
  const maxPages = 4;
  while (page <= maxPages) {
    const url = `https://api.github.com/repos/${env.GITHUB_REPO}/issues?state=all&per_page=100&page=${page}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'nib-feedback-worker',
      },
    });
    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `GitHub API ${res.status}`, detail: (await res.text()).slice(0, 300) }),
        { status: 502, headers: corsHeaders({ 'Content-Type': 'application/json' }) }
      );
    }
    const list = await res.json();
    if (!Array.isArray(list) || list.length === 0) break;
    for (const issue of list) {
      if (issue.pull_request) continue;
      for (const label of issue.labels || []) {
        const name = typeof label === 'string' ? label : (label && label.name);
        if (!name || !name.startsWith('node:')) continue;
        const id = name.slice('node:'.length);
        counts[id] = (counts[id] || 0) + 1;
      }
    }
    if (list.length < 100) break;
    page += 1;
  }

  _countsCache = { at: Date.now(), data: counts };

  return new Response(JSON.stringify(counts), {
    status: 200,
    headers: corsHeaders({ 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' }),
  });
}
