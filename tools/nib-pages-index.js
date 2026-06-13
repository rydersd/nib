#!/usr/bin/env node
/**
 * nib-pages-index — build a generated, filterable index of every .html
 * page in a Nib project. Two outputs:
 *
 *   1. <project>/pages-index.html — a human-facing filterable table
 *      (search, persona/recency chips, design-notes summary expanders).
 *   2. <project>/data/pages.json — a lean, machine-readable index: one
 *      compact JSON object per page so an agent can grep a single line
 *      instead of reading whole HTML pages.
 *
 * For each page it extracts: title, persona (top-level directory),
 * last-modified date (git log, fallback to fs mtime), a short summary
 * (first paragraph of the design-notes panel), inbound link count, and
 * the data-topic / data-role attributes seeded by nib-seed-topics.js.
 *
 * Usage:
 *   node tools/nib-pages-index.js <project-dir>
 *   node tools/nib-pages-index.js <project-dir> --no-html   (only pages.json)
 *
 * Companion to nib-seed-topics.js. Run seed-topics first so every page
 * carries data-topic; this tool reports any page that still lacks it.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SKIP_DIRS = new Set([
  'node_modules', 'nib', 'core', 'surfaces', 'tools', 'scripts',
  'data', 'fonts', 'icons', 'assets', 'functions', '_archive',
]);
const SKIP_FILES = new Set(['pages-index.html', 'sitemap.html']);
const HOTSPOT_THRESHOLD = 10;

function parseArgs(argv) {
  const out = { project: null, html: true };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--no-html') out.html = false;
    else if (!a.startsWith('--') && !out.project) out.project = a;
  }
  return out;
}

function walk(dir, root, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
      walk(path.join(dir, entry.name), root, out);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      if (SKIP_FILES.has(entry.name)) continue;
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]+)<\/title>/i);
  return m ? m[1].trim() : null;
}

function extractSummary(html) {
  // Try known design-notes containers, take the first <p> of text.
  const containers = [
    /<div[^>]*class=["'][^"']*wf-design-notes[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    /<aside[^>]*id=["']spec-panel["'][^>]*>([\s\S]*?)<\/aside>/i,
  ];
  for (const re of containers) {
    const m = html.match(re);
    if (!m) continue;
    const para = m[1].match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    if (!para) continue;
    let text = para[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (text.length > 220) text = text.slice(0, 217) + '…';
    return text;
  }
  return null;
}

function extractHtmlAttr(html, attr) {
  const tag = html.match(/<html\b[^>]*>/i);
  if (!tag) return null;
  const m = tag[0].match(new RegExp(attr + '=["\']([^"\']*)["\']', 'i'));
  return m ? m[1].trim() : null;
}

function lastModified(absPath, root) {
  try {
    const rel = path.relative(root, absPath);
    const out = execSync(`git log -1 --format=%cs -- "${rel}"`,
      { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    if (out) return out;
  } catch (_) {}
  return fs.statSync(absPath).mtime.toISOString().slice(0, 10);
}

function personaOf(relPath) {
  const segs = relPath.split('/');
  return segs.length === 1 ? 'root' : segs[0];
}

function buildInboundIndex(files, projectDir) {
  const counts = new Map();
  for (const abs of files) {
    counts.set(path.relative(projectDir, abs).replace(/\\/g, '/'), 0);
  }
  const re = /href=["']([^"'#?]+\.html)(?:[#?][^"']*)?["']/g;
  for (const abs of files) {
    const fromRel = path.relative(projectDir, abs).replace(/\\/g, '/');
    const fromDir = path.posix.dirname(fromRel);
    const html = fs.readFileSync(abs, 'utf8');
    const seen = new Set();
    let m;
    while ((m = re.exec(html)) !== null) {
      let href = m[1];
      if (/^https?:\/\//i.test(href)) continue;
      let target = href.startsWith('/')
        ? href.slice(1)
        : path.posix.normalize(path.posix.join(fromDir === '.' ? '' : fromDir, href));
      target = target.replace(/^\.\//, '');
      if (counts.has(target) && target !== fromRel && !seen.has(target)) {
        counts.set(target, counts.get(target) + 1);
        seen.add(target);
      }
    }
  }
  return counts;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function titleCase(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildHtml(rows, stats) {
  const { total, personaOrder, personas, missing, orphans, hotspots, generatedAt } = stats;
  const today = new Date();
  const daysAgo = (d) => {
    if (!d) return null;
    const t = new Date(d + 'T00:00:00Z');
    return isNaN(t) ? null : Math.round((today - t) / 86400000);
  };

  return `<!DOCTYPE html>
<html lang="en" class="wireframe">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pages index</title>
<link rel="stylesheet" href="../nib/core/proto-core.css">
<style>
  body { background: var(--wf-canvas); margin: 0; font-family: system-ui, sans-serif; }
  .pi-hero { border-bottom: 1px solid var(--wf-line); padding: 22px 28px; background: var(--wf-white); }
  .pi-hero h1 { font-size: 22px; color: var(--wf-ink); margin: 0 0 4px; }
  .pi-hero p { font-size: 13px; color: var(--wf-muted); margin: 0; line-height: 1.55; max-width: 820px; }
  .pi-hero .gen { font-size: 11px; color: var(--wf-muted); margin-top: 8px; font-family: var(--wf-mono, monospace); }
  .pi-stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; max-width: 1500px; margin: 18px auto 0; padding: 0 28px; }
  .pi-stat { background: var(--wf-white); border: 1px solid var(--wf-line); border-radius: 6px; padding: 12px 16px; }
  .pi-stat .v { font-size: 22px; font-weight: 700; color: var(--wf-ink); line-height: 1; }
  .pi-stat .v.warn { color: var(--wf-amber); }
  .pi-stat .v.accent { color: var(--wf-accent); }
  .pi-stat .l { font-size: 11px; color: var(--wf-muted); text-transform: uppercase; letter-spacing: .05em; margin-top: 4px; }
  .pi-controls { max-width: 1500px; margin: 16px auto 0; padding: 0 28px; display: flex; flex-direction: column; gap: 10px; }
  .pi-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  .pi-search { display: flex; align-items: center; gap: 8px; background: var(--wf-white); border: 1px solid var(--wf-line); border-radius: 18px; padding: 8px 14px; flex: 0 0 320px; }
  .pi-search input { flex: 1; border: none; background: transparent; outline: none; font-size: 13px; color: var(--wf-ink); }
  .pi-chips { display: flex; gap: 6px; flex-wrap: wrap; }
  .pi-chips-label { font-size: 10px; font-weight: 700; color: var(--wf-muted); text-transform: uppercase; letter-spacing: .06em; margin-right: 4px; align-self: center; }
  .pi-chip { padding: 4px 11px; border-radius: 12px; font-size: 11px; font-weight: 600; background: var(--wf-white); color: var(--wf-text); border: 1px solid var(--wf-line); cursor: pointer; user-select: none; }
  .pi-chip:hover:not(.active) { background: var(--wf-surface); }
  .pi-chip.active { background: var(--wf-accent); color: var(--wf-white); border-color: var(--wf-accent); }
  .pi-chip .ct { opacity: .7; font-weight: 400; margin-left: 4px; }
  .pi-table-wrap { max-width: 1500px; margin: 16px auto 32px; padding: 0 28px; }
  .pi-table { width: 100%; border-collapse: collapse; background: var(--wf-white); border: 1px solid var(--wf-line); border-radius: 6px; overflow: hidden; font-size: 12.5px; }
  .pi-table th { text-align: left; font-size: 10px; font-weight: 700; color: var(--wf-muted); text-transform: uppercase; letter-spacing: .06em; padding: 11px 14px; background: var(--wf-surface); border-bottom: 1px solid var(--wf-line); }
  .pi-table td { padding: 10px 14px; border-bottom: 1px solid var(--wf-tint); color: var(--wf-text); }
  .pi-table tr.pi-row-main { cursor: pointer; }
  .pi-table tr.pi-row-main:hover td { background: var(--wf-surface); }
  .pi-table tr.pi-row-main.hidden, .pi-table tr.pi-row-detail.hidden { display: none; }
  .pi-table tr.pi-row-detail td { background: var(--wf-surface); padding: 0 14px 14px 38px; }
  .pi-table tr.pi-row-detail:not(.open) td { padding-top: 0; padding-bottom: 0; border-bottom: none; }
  .pi-summary-inner { max-height: 0; overflow: hidden; transition: max-height .18s ease; font-size: 12px; color: var(--wf-text); line-height: 1.55; }
  .pi-row-detail.open .pi-summary-inner { max-height: 240px; padding-top: 4px; }
  .pi-cell-expand { width: 24px; text-align: center; }
  .pi-expand-btn { background: none; border: none; padding: 4px; cursor: pointer; color: var(--wf-muted); }
  .pi-expand-btn.open .chev { display: inline-block; transform: rotate(90deg); }
  .pi-expand-btn[disabled] { opacity: .25; cursor: default; }
  .pi-title { font-weight: 600; color: var(--wf-ink); }
  .pi-path { font-family: var(--wf-mono, monospace); font-size: 11px; color: var(--wf-muted); }
  .pi-empty { text-align: center; padding: 40px; color: var(--wf-muted); font-size: 13px; }
</style>
</head>
<body>
<div class="pi-hero">
  <h1>Pages index</h1>
  <p>Generated index of every <code>.html</code> page in this project. Click a row to open the page; click the chevron to expand the design-notes summary. Filter by persona or recency to find what you need.</p>
  <p class="gen">Regenerated: ${generatedAt} · <code>node tools/nib-pages-index.js</code></p>
</div>
<div class="pi-stats">
  <div class="pi-stat"><div class="v">${total}</div><div class="l">Total pages</div></div>
  <div class="pi-stat"><div class="v">${personaOrder.length}</div><div class="l">Personas / areas</div></div>
  <div class="pi-stat"><div class="v ${missing ? 'warn' : ''}">${missing}</div><div class="l">Missing data-topic</div></div>
  <div class="pi-stat"><div class="v ${orphans ? 'warn' : ''}">${orphans}</div><div class="l">Orphans (0 inbound)</div></div>
  <div class="pi-stat"><div class="v accent">${hotspots}</div><div class="l">Nexus (≥${HOTSPOT_THRESHOLD} inbound)</div></div>
</div>
<div class="pi-controls">
  <div class="pi-row">
    <div class="pi-search">
      <span aria-hidden="true">⌕</span>
      <input id="pi-q" type="search" placeholder="Search title, path, summary…" aria-label="Search pages">
    </div>
  </div>
  <div class="pi-row">
    <span class="pi-chips-label">Persona</span>
    <div class="pi-chips" id="pi-personas">
      <span class="pi-chip active" data-persona="">All <span class="ct">${total}</span></span>
${personaOrder.map((p) => `      <span class="pi-chip" data-persona="${p}">${titleCase(p)} <span class="ct">${personas[p]}</span></span>`).join('\n')}
    </div>
  </div>
  <div class="pi-row">
    <span class="pi-chips-label">Modified</span>
    <div class="pi-chips" id="pi-recency">
      <span class="pi-chip active" data-recency="">Any time</span>
      <span class="pi-chip" data-recency="7">Last 7 days</span>
      <span class="pi-chip" data-recency="30">Last 30 days</span>
      <span class="pi-chip" data-recency="90">Last 90 days</span>
    </div>
  </div>
</div>
<div class="pi-table-wrap">
  <table class="pi-table" id="pi-table">
    <thead><tr>
      <th class="pi-cell-expand"></th>
      <th style="width:40%">Title</th>
      <th style="width:14%">Persona</th>
      <th style="width:14%">Topic</th>
      <th style="width:18%">Path</th>
      <th style="width:14%">Modified</th>
    </tr></thead>
    <tbody id="pi-rows">
${rows.map((r, i) => {
  const days = daysAgo(r.modified);
  const hasSummary = !!r.summary;
  return `      <tr class="pi-row-main" data-i="${i}" data-persona="${r.persona}" data-days="${days == null ? -1 : days}" data-href="${escapeHtml(r.rel)}" data-text="${escapeHtml(((r.title || '') + ' ' + r.rel + ' ' + (r.summary || '')).toLowerCase())}">
        <td class="pi-cell-expand"><button class="pi-expand-btn" type="button" ${hasSummary ? '' : 'disabled'} aria-label="Expand summary"><span class="chev">▶</span></button></td>
        <td><span class="pi-title">${escapeHtml(r.title)}</span></td>
        <td>${escapeHtml(titleCase(r.persona))}</td>
        <td>${escapeHtml(r.topic || '—')}</td>
        <td><span class="pi-path">${escapeHtml(r.rel)}</span></td>
        <td>${r.modified}</td>
      </tr>
      <tr class="pi-row-detail" data-i="${i}"><td colspan="6"><div class="pi-summary-inner">${r.summary ? escapeHtml(r.summary) : ''}</div></td></tr>`;
}).join('\n')}
    </tbody>
  </table>
  <div class="pi-empty" id="pi-empty" hidden>No pages match the current filters.</div>
</div>
<script>
(function() {
  var q = document.getElementById('pi-q');
  var personasEl = document.getElementById('pi-personas');
  var recencyEl = document.getElementById('pi-recency');
  var tbody = document.getElementById('pi-rows');
  var empty = document.getElementById('pi-empty');
  var mainRows = Array.prototype.slice.call(tbody.querySelectorAll('tr.pi-row-main'));
  var detailRows = Array.prototype.slice.call(tbody.querySelectorAll('tr.pi-row-detail'));
  var detailByIdx = {};
  detailRows.forEach(function(r) { detailByIdx[r.dataset.i] = r; });
  var activePersona = '', activeRecency = '';

  function apply() {
    var term = q.value.trim().toLowerCase();
    var visible = 0;
    mainRows.forEach(function(r) {
      var d = r.dataset, show = true;
      if (term && d.text.indexOf(term) === -1) show = false;
      if (activePersona && d.persona !== activePersona) show = false;
      if (activeRecency) {
        var days = parseInt(d.days, 10);
        if (days < 0 || days > parseInt(activeRecency, 10)) show = false;
      }
      r.classList.toggle('hidden', !show);
      var det = detailByIdx[d.i];
      if (det) det.classList.toggle('hidden', !show);
      if (show) visible++;
    });
    empty.hidden = visible !== 0;
  }

  q.addEventListener('input', apply);
  personasEl.addEventListener('click', function(e) {
    var chip = e.target.closest('.pi-chip');
    if (!chip) return;
    activePersona = chip.dataset.persona;
    personasEl.querySelectorAll('.pi-chip').forEach(function(c) { c.classList.toggle('active', c === chip); });
    apply();
  });
  recencyEl.addEventListener('click', function(e) {
    var chip = e.target.closest('.pi-chip');
    if (!chip) return;
    activeRecency = chip.dataset.recency;
    recencyEl.querySelectorAll('.pi-chip').forEach(function(c) { c.classList.toggle('active', c === chip); });
    apply();
  });
  tbody.addEventListener('click', function(e) {
    var btn = e.target.closest('.pi-expand-btn');
    if (btn) {
      e.stopPropagation();
      if (btn.disabled) return;
      var row = btn.closest('tr.pi-row-main');
      var det = detailByIdx[row.dataset.i];
      var open = btn.classList.toggle('open');
      if (det) det.classList.toggle('open', open);
      return;
    }
    var main = e.target.closest('tr.pi-row-main');
    if (!main || !main.dataset.href) return;
    if (e.metaKey || e.ctrlKey) window.open(main.dataset.href, '_blank');
    else window.location.href = main.dataset.href;
  });
})();
</script>
</body>
</html>
`;
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.project) {
    console.error('Usage: node tools/nib-pages-index.js <project-dir> [--no-html]');
    process.exit(1);
  }
  const projectDir = path.resolve(args.project);
  if (!fs.existsSync(projectDir)) {
    console.error(`✗ project directory not found: ${projectDir}`);
    process.exit(1);
  }

  const files = walk(projectDir, projectDir).sort();
  const inbound = buildInboundIndex(files, projectDir);
  const rows = [];

  for (const abs of files) {
    const rel = path.relative(projectDir, abs).replace(/\\/g, '/');
    const html = fs.readFileSync(abs, 'utf8');
    rows.push({
      rel,
      title: extractTitle(html) || rel,
      summary: extractSummary(html),
      modified: lastModified(abs, projectDir),
      persona: personaOf(rel),
      inbound: inbound.get(rel) || 0,
      topic: extractHtmlAttr(html, 'data-topic'),
      role: extractHtmlAttr(html, 'data-role'),
    });
  }

  const total = rows.length;
  const personas = {};
  let missing = 0, orphans = 0, hotspots = 0;
  for (const r of rows) {
    personas[r.persona] = (personas[r.persona] || 0) + 1;
    if (!r.topic) missing++;
    if (r.inbound === 0) orphans++;
    if (r.inbound >= HOTSPOT_THRESHOLD) hotspots++;
  }
  const personaOrder = Object.keys(personas).sort((a, b) => personas[b] - personas[a]);
  const generatedAt = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';

  // Lean machine-readable index: data/pages.json
  const dataDir = path.join(projectDir, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const jsonLines = rows.map((r) => JSON.stringify({
    p: r.rel, ti: r.title || '', t: r.topic || null, r: r.role || null,
    ps: r.persona, s: r.summary || '', in: r.inbound, m: r.modified,
  }));
  const pagesJson = path.join(dataDir, 'pages.json');
  fs.writeFileSync(pagesJson, '[\n' + jsonLines.join(',\n') + '\n]\n', 'utf8');
  console.log(`nib-pages-index: wrote data/pages.json · ${total} entries`);

  if (args.html) {
    const outHtml = path.join(projectDir, 'pages-index.html');
    fs.writeFileSync(outHtml, buildHtml(rows, {
      total, personaOrder, personas, missing, orphans, hotspots, generatedAt,
    }), 'utf8');
    console.log(`nib-pages-index: wrote pages-index.html · ${total} pages · ${personaOrder.length} personas`);
  }

  if (missing) {
    console.error(`\n  ✗ ${missing} of ${total} pages missing data-topic on <html>.`);
    console.error(`  Run: node tools/nib-seed-topics.js <project-dir>\n`);
    process.exitCode = 1;
  } else {
    console.log(`nib-pages-index: ✓ all ${total} pages carry data-topic`);
  }
}

main();
