#!/usr/bin/env node
/**
 * nib-create — scaffold a new Nib project, then open a browser-based setup
 * wizard that asks: upload a workbook, pick a template, or start blank.
 *
 * Usage:
 *   npx create-nib <project-name> [--template <id>] [--port 5173] [--no-open]
 *   node tools/nib-create.js <project-name> [...flags]
 *
 * What it does:
 *   1. Creates ./<project-name>/ (refuses if non-empty)
 *   2. Starts an embedded HTTP server on the given port
 *   3. Opens the browser to /
 *   4. Wizard collects setup choice, POSTs /api/setup
 *   5. Server runs nib-ingest, copies a template, or writes a blank scaffold
 *   6. Browser redirects to /project/index.html (served by the same server)
 *   7. Server stays alive so the user can keep editing; Ctrl-C to stop.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');
const { spawn } = require('child_process');
const os = require('os');

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m',
};

// Resolve the nib repo root. When run from `node tools/nib-create.js`,
// __dirname is .../nib/tools so .. is the root. When bundled into an npm
// package, this script ships under the package's tools/ — same relative path.
const NIB_ROOT = path.resolve(__dirname, '..');
const WIZARD_DIR = path.join(__dirname, 'wizard');

function fail(msg) {
  console.error(`${C.red}✗${C.reset} ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    console.log(`${C.bold}create-nib${C.reset} — scaffold a new Nib project with a browser wizard.

${C.bold}Usage:${C.reset}
  npx create-nib <project-name> [options]
  npm create nib <project-name>

${C.bold}Options:${C.reset}
  --template <id>     Skip the picker; scaffold from this template id
                      (service-blueprint, feedback-triage, research-study,
                      deal-registration, agent-chat, kanban-board, …)
  --workbook <path>   Skip the picker; ingest this xlsx into a fresh project
  --sheet <url>       Skip the picker; ingest this Google Sheet
  --port <n>          Wizard port (default 5173)
  --no-open           Don't auto-open the browser
  --target <dir>      Override target directory (default: ./<project-name>)

${C.bold}Examples:${C.reset}
  npx create-nib lead-to-cash
  npx create-nib q3-research --template research-study
  npx create-nib partner-program --workbook ./pcp.xlsx`);
    process.exit(argv.length === 0 ? 1 : 0);
  }
  const flags = { port: 5173, open: true, template: null, workbook: null, sheet: null, target: null };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--port') flags.port = Number(argv[++i]) || fail('--port requires a number');
    else if (a === '--no-open') flags.open = false;
    else if (a === '--template') flags.template = argv[++i] || fail('--template requires an id');
    else if (a === '--workbook') flags.workbook = argv[++i] || fail('--workbook requires a path');
    else if (a === '--sheet') flags.sheet = argv[++i] || fail('--sheet requires a URL');
    else if (a === '--target') flags.target = argv[++i] || fail('--target requires a path');
    else if (a.startsWith('--')) fail(`unknown flag: ${a}`);
    else positional.push(a);
  }
  if (!positional.length) fail('project name is required');
  return { name: positional[0], ...flags };
}

function projectTitleFromName(name) {
  // "lead-to-cash" → "Lead to Cash"
  // "q3_research" → "Q3 Research"
  return name
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function listTemplates() {
  const dir = path.join(NIB_ROOT, 'examples');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const readme = path.join(dir, d.name, 'README.md');
      let summary = '';
      if (fs.existsSync(readme)) {
        const text = fs.readFileSync(readme, 'utf8');
        const para = text.split(/\n\s*\n/).slice(1, 3).join(' ').replace(/\n/g, ' ').trim();
        summary = para.slice(0, 220);
      }
      return { id: d.name, summary };
    });
}

function copyDirSync(src, dst, opts = {}) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (opts.skip && opts.skip.has(entry.name)) continue;
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDirSync(s, d, opts);
    else fs.copyFileSync(s, d);
  }
}

// Copy the minimal runtime subset of nib into <target>/nib/ so the project
// is self-contained and works under any static server (the wizard's, python's,
// vercel's, etc.). We skip dev-only directories.
function bundleNibInto(target) {
  const nibDir = path.join(target, 'nib');
  fs.mkdirSync(nibDir, { recursive: true });
  for (const sub of ['core', 'surfaces', 'starters']) {
    const src = path.join(NIB_ROOT, sub);
    if (fs.existsSync(src)) copyDirSync(src, path.join(nibDir, sub));
  }
}

// Rewrite the in-repo template paths (../../core/...) to the bundled-nib
// layout (nib/core/...). Walks .html/.js/.css; skips the bundled nib/ dir
// (we don't want to mangle the framework's own internal references) and any
// node_modules / generated data dir.
function rewriteAssetPaths(target) {
  const exts = new Set(['.html', '.js', '.css', '.htm']);
  const skipDirs = new Set(['node_modules', '.git', 'nib']);

  // Order matters — match the most-specific patterns first.
  const replacements = [
    [/\.\.\/\.\.\/core\//g, 'nib/core/'],
    [/\.\.\/\.\.\/surfaces\//g, 'nib/surfaces/'],
    [/\.\.\/\.\.\/starters\//g, 'nib/starters/'],
    [/\.\.\/nib\//g, 'nib/'],
  ];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (skipDirs.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      if (!exts.has(path.extname(entry.name).toLowerCase())) continue;
      let text = fs.readFileSync(full, 'utf8');
      let changed = false;
      for (const [pattern, replacement] of replacements) {
        if (pattern.test(text)) {
          text = text.replace(pattern, replacement);
          changed = true;
        }
      }
      if (changed) fs.writeFileSync(full, text);
    }
  }
  walk(target);
}

function writeBlankProject(target, name) {
  const title = projectTitleFromName(name);
  fs.mkdirSync(path.join(target, 'data'), { recursive: true });

  // Minimal project-data.js (compatible with proto-nav.js without ingest)
  fs.writeFileSync(
    path.join(target, 'project-data.js'),
    `/* Project: ${title} — created by create-nib. */
window.WIREFRAME_CONFIG = {
  title: ${JSON.stringify(title)},
  defaultSurface: 'internal'
};

var SECTIONS = [
  {
    id: 'main',
    label: 'Main',
    epic: '',
    items: [
      { file: 'index', label: 'Home', type: 'page' }
    ]
  }
];
window.SECTIONS = SECTIONS;
`
  );

  fs.writeFileSync(
    path.join(target, 'index.html'),
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link rel="stylesheet" href="nib/core/proto-tokens.css">
  <link rel="stylesheet" href="nib/core/proto-core.css">
  <link rel="stylesheet" href="nib/core/proto-components.css">
  <link rel="stylesheet" href="nib/core/proto-chrome.css">
</head>
<body>
  <main style="padding:32px;max-width:720px;margin:0 auto;">
    <h1 style="margin:0 0 8px;">${title}</h1>
    <p style="color:var(--wf-muted);">Empty Nib project. Edit <code>project-data.js</code> to add pages, or run <code>npx nib-ingest &lt;workbook.xlsx&gt; --out .</code> to scaffold from a spreadsheet.</p>
  </main>
  <script src="project-data.js"></script>
  <script src="nib/core/proto-nav.js"></script>
</body>
</html>
`
  );
}

function runIngest(workbookPath, outDir, sheetsUrl) {
  // Spawn `node tools/nib-ingest.js` so we get the same logging + warnings the
  // user would get on the CLI. Resolve nib-ingest relative to NIB_ROOT.
  return new Promise((resolve, reject) => {
    const args = [
      path.join(NIB_ROOT, 'tools', 'nib-ingest.js'),
      sheetsUrl ? sheetsUrl : workbookPath,
      '--out', outDir,
      '--quiet',
    ];
    const child = spawn('node', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (d) => { stderr += d.toString(); });
    child.on('close', (code) => {
      if (code === 0) resolve({ ok: true, stderr });
      else reject(new Error(`nib-ingest exited ${code}: ${stderr.slice(0, 600)}`));
    });
  });
}

function openBrowser(targetUrl) {
  const platform = process.platform;
  const cmd = platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open';
  const args = platform === 'win32' ? ['', targetUrl] : [targetUrl];
  try {
    spawn(cmd, args, { stdio: 'ignore', detached: true }).unref();
  } catch (_) {
    // Browser failed to open — that's fine, we already printed the URL.
  }
}

// ── Tiny multipart-free upload: client sends base64 in a JSON body. ────────
function readJsonBody(req, limitBytes = 25 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (c) => {
      total += c.length;
      if (total > limitBytes) {
        reject(new Error(`Request body too large (max ${limitBytes / 1024 / 1024} MB)`));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch (e) { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.ico':  'image/x-icon',
  '.txt':  'text/plain; charset=utf-8',
  '.md':   'text/markdown; charset=utf-8',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

function serveStatic(res, filePath) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404).end('Not found');
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
}

function safeJoin(root, requested) {
  // Normalize and reject anything that escapes root.
  const decoded = decodeURIComponent(requested.replace(/^\/+/, ''));
  const abs = path.normalize(path.join(root, decoded));
  if (!abs.startsWith(path.normalize(root + path.sep)) && abs !== path.normalize(root)) return null;
  return abs;
}

// ── Server ─────────────────────────────────────────────────────────────────
function startServer({ target, name, port }) {
  const state = { setupComplete: false };

  const server = http.createServer(async (req, res) => {
    const parsed = url.parse(req.url, true);
    const pathname = parsed.pathname;

    try {
      // /api/setup — finalize the project
      if (pathname === '/api/setup' && req.method === 'POST') {
        const body = await readJsonBody(req);
        await handleSetup(body, target, name);
        state.setupComplete = true;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, redirect: '/project/' }));
        return;
      }

      // /api/templates — list available templates with summaries
      if (pathname === '/api/templates' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ templates: listTemplates(), suggestedTitle: projectTitleFromName(name) }));
        return;
      }

      // /project/* — serve the user's new project (after setup)
      if (pathname.startsWith('/project')) {
        const rel = pathname.slice('/project'.length) || '/';
        const file = rel.endsWith('/') ? rel + 'index.html' : rel;
        const abs = safeJoin(target, file);
        if (!abs) { res.writeHead(403).end('Forbidden'); return; }
        return serveStatic(res, abs);
      }

      // /nib/* — serve the nib framework (so the user's project can <link> it)
      if (pathname.startsWith('/nib/')) {
        const abs = safeJoin(NIB_ROOT, pathname.slice('/nib/'.length));
        if (!abs) { res.writeHead(403).end('Forbidden'); return; }
        return serveStatic(res, abs);
      }

      // /  → wizard
      if (pathname === '/' || pathname === '') {
        return serveStatic(res, path.join(WIZARD_DIR, 'index.html'));
      }

      // Wizard assets
      const wizardFile = safeJoin(WIZARD_DIR, pathname);
      if (wizardFile && fs.existsSync(wizardFile) && fs.statSync(wizardFile).isFile()) {
        return serveStatic(res, wizardFile);
      }

      res.writeHead(404).end('Not found');
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message || String(err) }));
    }
  });

  return new Promise((resolve, reject) => {
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        reject(new Error(`port ${port} is in use — pass --port <n> to pick another`));
      } else reject(err);
    });
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

async function handleSetup(body, target, name) {
  await _handleSetupInner(body, target, name);
  // Every setup mode lands the project with paths that need rewriting and a
  // bundled nib subset so the project works under any static server.
  bundleNibInto(target);
  rewriteAssetPaths(target);
  // Drop the project's CLAUDE.md — the wiki maintenance contract for any LLM
  // that works on this project later. Never overwrites a pre-existing one.
  writeProjectClaudeMd(target, name, body);
}

function writeProjectClaudeMd(target, name, body) {
  const dest = path.join(target, 'CLAUDE.md');
  if (fs.existsSync(dest)) return;

  const title = projectTitleFromName(name);
  let sourceLine = '';
  if (body.mode === 'workbook') {
    sourceLine = body.sheetsUrl
      ? `**Source of truth:** ${body.sheetsUrl} (Google Sheet)`
      : `**Source of truth:** \`${body.filename || 'project.xlsx'}\` in this directory`;
  } else if (body.mode === 'template') {
    sourceLine = `**Source of truth:** \`${body.template}\` template (copied from nib at scaffold time)`;
  } else {
    sourceLine = '**Source of truth:** hand-authored — `project-data.js` and the pages.';
  }

  const md = [
    `# ${title}`,
    '',
    'A Nib wireframe project. The framework auto-generates a wiki at `docs/` and keeps it in sync with the project\'s data.',
    '',
    sourceLine,
    '',
    '## Wiki structure',
    '',
    '`docs/` has two kinds of pages:',
    '',
    '**Auto-generated** — start with `<!-- nib:auto -->` on line 1. These pages are derived from the workbook (or `data/*.js`). Don\'t edit them by hand — your edits get overwritten on the next sync.',
    '',
    '- `Home.md` · `_Sidebar.md` · `_Footer.md`',
    '- `Pages.md` · `Personas.md` · `Persona-{id}.md`',
    '- `Blueprints.md` · `Blueprint-{id}.md`',
    '- `Stories.md` · `Story-{id}.md`',
    '- `Tokens.md` · `Registries.md` (when applicable)',
    '',
    '**Hand-authored** — start with `<!-- nib:starter -->` (or no marker at all). Sync never touches these.',
    '',
    '- `README.md` — project pitch',
    '- `Decisions.md` — append-only decision log',
    '- `Architecture.md` — system shape, surfaces, integrations',
    '- `Glossary.md` — terminology',
    '- `Lessons-Learned.md` — retrospective',
    '',
    'You can also create your own narrative pages — anything that isn\'t an auto-page name (e.g. `Notes-on-Persona-leadership.md`, `Phase-2-plan.md`). Sync ignores them.',
    '',
    '## Maintenance contract',
    '',
    'When you make changes to this project:',
    '',
    '1. **After any structural edit** (workbook, `data/*.js`, page added/removed/renamed):',
    '   ```',
    '   npx nib-sync',
    '   ```',
    '   Regenerates auto pages + data files. Hand pages are untouched.',
    '',
    '2. **After significant decisions or architectural changes**:',
    '   - Append a dated entry to `docs/Decisions.md`.',
    '   - Update `docs/Architecture.md` if the system shape changed.',
    '   - Cross-link with `[[Page-Name]]` wikilinks.',
    '',
    '3. **When renaming an auto page\'s source** (e.g. a persona id changes from `leadership` to `exec-sponsor`):',
    '   - Run sync — `Persona-leadership.md` gets removed, `Persona-exec-sponsor.md` appears.',
    '   - Search-replace any `[[Persona-leadership]]` references in hand pages so the links don\'t dangle.',
    '',
    '4. **Never edit auto pages directly.** If you want narrative on a persona, blueprint, or story, create a sibling hand page (e.g. `Notes-Persona-leadership.md`) and link to it from the auto page\'s narrative neighbors (`Architecture.md`, `Decisions.md`).',
    '',
    '## Useful commands',
    '',
    '| Command | What it does |',
    '|---|---|',
    '| `npx nib-sync` | Re-ingest workbook, regenerate `data/*.js` + auto wiki pages |',
    '| `npx nib-sync --check` | Dry-run; exit 1 on drift (CI-friendly) |',
    '| `npx nib-wiki sync` | Regenerate wiki only (skip data emit) |',
    '| `npx nib-wiki check` | Dry-run wiki only |',
    '| `npx nib-ingest <new-source>.xlsx --out .` | Switch to a different source workbook |',
    '',
    '## Rules baked in',
    '',
    '- **Wiki lives in this repo.** No `*.wiki.git` submodule.',
    '- **Auto pages are derived; never source.** The workbook is the source.',
    '- **Hand pages are yours.** Sync never touches them.',
    '- **Wikilinks are `[[Page-Name]]` style** — Obsidian / Foam / Dendron compatible.',
    '',
    '## Useful skills (Claude Code)',
    '',
    'If the `wiki-author` skill is available, prefer it for substantive narrative edits — it knows the wiki conventions used here. Otherwise edit Markdown directly; the contract above still applies.',
    '',
    '---',
    '',
    'This file was generated by `nib-create`. Edit freely — `nib-sync` never touches `CLAUDE.md`.',
    '',
  ].join('\n');

  fs.writeFileSync(dest, md);
}

async function _handleSetupInner(body, target, name) {
  const mode = body.mode;
  if (mode === 'workbook') {
    // body: { filename, base64 } OR { sheetsUrl }
    if (body.sheetsUrl) {
      await runIngest(null, target, body.sheetsUrl);
    } else if (body.base64 && body.filename) {
      // Keep the workbook in the project — it's the source of truth for sync.
      const safeName = body.filename.replace(/[^\w.-]/g, '_').slice(0, 80) || 'project.xlsx';
      const dest = path.join(target, safeName);
      fs.writeFileSync(dest, Buffer.from(body.base64, 'base64'));
      await runIngest(dest, target, null);
    } else {
      throw new Error('workbook setup requires either { sheetsUrl } or { filename, base64 }');
    }
    return;
  }
  if (mode === 'template') {
    const tmplDir = path.join(NIB_ROOT, 'examples', body.template);
    if (!fs.existsSync(tmplDir)) throw new Error(`template not found: ${body.template}`);
    copyDirSync(tmplDir, target, { skip: new Set(['node_modules']) });
    // Patch the project title if there's a generated wireframe-config.js.
    const wfPath = path.join(target, 'data', 'wireframe-config.js');
    if (fs.existsSync(wfPath)) {
      let text = fs.readFileSync(wfPath, 'utf8');
      text = text.replace(/("title"\s*:\s*)"[^"]*"/, `$1${JSON.stringify(projectTitleFromName(name))}`);
      fs.writeFileSync(wfPath, text);
    }
    return;
  }
  if (mode === 'blank') {
    writeBlankProject(target, name);
    return;
  }
  throw new Error(`unknown setup mode: ${mode}`);
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const args = parseArgs(process.argv.slice(2));
  const target = path.resolve(args.target || `./${args.name}`);

  // Refuse to overwrite a non-empty directory.
  if (fs.existsSync(target)) {
    const entries = fs.readdirSync(target).filter((e) => !e.startsWith('.'));
    if (entries.length) fail(`target directory is not empty: ${target}`);
  } else {
    fs.mkdirSync(target, { recursive: true });
  }

  console.log(`${C.cyan}→${C.reset} Creating ${C.bold}${args.name}${C.reset} at ${path.relative(process.cwd(), target) || '.'}`);

  // Headless modes (--template / --workbook / --sheet) skip the wizard.
  if (args.template || args.workbook || args.sheet) {
    if (args.template) {
      await handleSetup({ mode: 'template', template: args.template }, target, args.name);
      console.log(`${C.green}✓${C.reset} Scaffolded from template ${C.bold}${args.template}${C.reset}`);
    } else if (args.workbook) {
      const abs = path.resolve(args.workbook);
      if (!fs.existsSync(abs)) fail(`workbook not found: ${args.workbook}`);
      // Copy the workbook into the project (source-of-truth for sync), then
      // ingest from the in-project copy + bundle nib + rewrite paths.
      const dest = path.join(target, path.basename(abs));
      fs.copyFileSync(abs, dest);
      await runIngest(dest, target, null);
      bundleNibInto(target);
      rewriteAssetPaths(target);
      writeProjectClaudeMd(target, args.name, { mode: 'workbook', filename: path.basename(abs) });
      console.log(`${C.green}✓${C.reset} Ingested ${path.basename(abs)} into ${args.name}`);
    } else if (args.sheet) {
      await runIngest(null, target, args.sheet);
      bundleNibInto(target);
      rewriteAssetPaths(target);
      writeProjectClaudeMd(target, args.name, { mode: 'workbook', sheetsUrl: args.sheet });
      console.log(`${C.green}✓${C.reset} Ingested Google Sheet into ${args.name}`);
    }
    console.log(`\n${C.dim}cd ${args.name} && python3 -m http.server 8000${C.reset}`);
    process.exit(0);
  }

  // Interactive wizard.
  const server = await startServer({ target, name: args.name, port: args.port });
  const wizardUrl = `http://127.0.0.1:${args.port}/?name=${encodeURIComponent(args.name)}`;

  console.log(`${C.green}✓${C.reset} Setup wizard at ${C.bold}${wizardUrl}${C.reset}`);
  console.log(`  ${C.dim}Press Ctrl-C to stop the server.${C.reset}`);

  if (args.open) openBrowser(wizardUrl);

  process.on('SIGINT', () => {
    console.log(`\n${C.dim}Shutting down.${C.reset}`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 1500);
  });
}

main().catch((err) => fail(err.message || String(err)));
