#!/usr/bin/env node
// nib-cli.js — CLI for validating wireframe pages and managing review annotations
// Run: chmod +x tools/nib-cli.js to make executable
// Requires Node 18+. No external dependencies.

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

// ---------------------------------------------------------------------------
// ANSI colors
// ---------------------------------------------------------------------------
const { C } = require('./_cli-utils');

const PASS = `${C.green}PASS${C.reset}`;
const WARN = `${C.yellow}WARN${C.reset}`;
const FAIL = `${C.red}FAIL${C.reset}`;

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function usage() {
  console.log(`
${C.bold}nib-cli${C.reset} — Nib wireframe toolkit

${C.bold}Usage:${C.reset} node tools/nib-cli.js <command> [options]

${C.bold}Commands:${C.reset}
  validate <dir>                          Validate wireframe pages in a directory
  pull-reviews [--api <url>] [--out <dir>] Fetch review annotations from API
  review-report <dir>                     Summarize review JSONs in a directory
  brief <project-dir> [--reviews <dir>] [--out <file>]
                                          Generate iteration brief from review data
  dashboard <project-dir> [--reviews <dir>] [--out <file>]
                                          Generate confidence dashboard HTML page
  synthesize <project-dir> [--reviews <dir>] [--out <file>]
                                          Generate structured iteration brief for agents
`);
}

/** Resolve a directory argument relative to cwd. */
function resolveDir(dir) {
  return path.resolve(process.cwd(), dir);
}

/** Fetch JSON from a URL. Returns a promise that resolves with parsed JSON. */
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
      }
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error(`Invalid JSON from ${url}: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

/** Read the default API URL from wrangler.toml or fall back to localhost. */
function defaultApiUrl() {
  const tomlPath = path.resolve(__dirname, '..', 'wrangler.toml');
  // Default to local Pages dev server
  let base = 'http://localhost:8788';
  try {
    const toml = fs.readFileSync(tomlPath, 'utf-8');
    // Look for a [vars] REVIEW_API or similar — not standard, but a convenience
    const match = toml.match(/review_api\s*=\s*"([^"]+)"/i);
    if (match) base = match[1];
  } catch { /* no wrangler.toml, use default */ }
  return base;
}

// ---------------------------------------------------------------------------
// validate command
// ---------------------------------------------------------------------------

/** Surface CSS filenames we recognise. */
const SURFACE_CSS = ['salesforce.css', 'slack.css', 'internal-ds.css'];

/** Common hex patterns that should use tokens instead. */
const HEX_RE = /#(?:[0-9a-fA-F]{3}){1,2}\b/g;

function validate(dir) {
  const resolved = resolveDir(dir);
  if (!fs.existsSync(resolved)) {
    console.error(`${C.red}Directory not found:${C.reset} ${resolved}`);
    process.exit(1);
  }

  const htmlFiles = fs.readdirSync(resolved).filter(f => f.endsWith('.html'));
  if (htmlFiles.length === 0) {
    console.log(`${C.yellow}No .html files found in ${resolved}${C.reset}`);
    process.exit(0);
  }

  let totalFails = 0;

  for (const file of htmlFiles) {
    const filePath = path.join(resolved, file);
    const src = fs.readFileSync(filePath, 'utf-8');
    const results = [];

    // 1. Has class="wireframe" on <html>
    if (/class\s*=\s*"[^"]*wireframe[^"]*"/.test(src.slice(0, 2000))) {
      results.push({ status: 'pass', msg: 'html.wireframe class present' });
    } else {
      results.push({ status: 'fail', msg: 'Missing class="wireframe" on <html> tag' });
    }

    // 2. Has proto-core.css or modular CSS imports
    const hasCoreCSS = /proto-core\.css/.test(src);
    const hasModularCSS = /proto-tokens\.css/.test(src) || /proto-components\.css/.test(src);
    if (hasCoreCSS || hasModularCSS) {
      results.push({ status: 'pass', msg: 'Core CSS loaded' + (hasModularCSS ? ' (modular)' : ' (legacy monolith)') });
    } else {
      results.push({ status: 'fail', msg: 'Missing proto-core.css or modular CSS imports' });
    }

    // 3. project-data.js loaded before proto-nav.js
    const projIdx = src.indexOf('project-data.js');
    const navIdx = src.indexOf('proto-nav.js');
    if (projIdx === -1 || navIdx === -1) {
      results.push({ status: 'fail', msg: 'Missing project-data.js or proto-nav.js' });
    } else if (projIdx < navIdx) {
      results.push({ status: 'pass', msg: 'Script load order correct (project-data before proto-nav)' });
    } else {
      results.push({ status: 'fail', msg: 'project-data.js must load BEFORE proto-nav.js' });
    }

    // 4. Exactly one surface CSS
    const surfaceHits = SURFACE_CSS.filter(s => src.includes(s));
    if (surfaceHits.length === 1) {
      results.push({ status: 'pass', msg: `Surface CSS: ${surfaceHits[0]}` });
    } else if (surfaceHits.length === 0) {
      results.push({ status: 'warn', msg: 'No surface CSS detected (expected one of: salesforce.css, slack.css, internal-ds.css)' });
    } else {
      results.push({ status: 'fail', msg: `Multiple surface CSS loaded: ${surfaceHits.join(', ')} — use exactly one` });
    }

    // 5. Has .wf-design-notes div
    if (/class\s*=\s*"[^"]*wf-design-notes[^"]*"/.test(src)) {
      results.push({ status: 'pass', msg: 'Design notes div present' });
    } else {
      results.push({ status: 'fail', msg: 'Missing .wf-design-notes div' });
    }

    // 6. No hardcoded hex in inline styles
    const styleAttrRe = /style\s*=\s*"([^"]*)"/g;
    let inlineHexes = [];
    let m;
    while ((m = styleAttrRe.exec(src)) !== null) {
      const hexMatches = m[1].match(HEX_RE);
      if (hexMatches) inlineHexes.push(...hexMatches);
    }
    if (inlineHexes.length > 0) {
      const unique = [...new Set(inlineHexes)];
      results.push({ status: 'warn', msg: `Hardcoded hex in inline styles: ${unique.join(', ')} — use design tokens` });
    } else {
      results.push({ status: 'pass', msg: 'No hardcoded hex in inline styles' });
    }

    // 7. No inline <style> blocks
    if (/<style[\s>]/i.test(src)) {
      results.push({ status: 'warn', msg: 'Inline <style> block found — prefer external CSS' });
    } else {
      results.push({ status: 'pass', msg: 'No inline <style> blocks' });
    }

    // 8. Title follows "[Name] — [Project]" format (em dash separator)
    const titleMatch = src.match(/<title>([^<]*)<\/title>/i);
    if (titleMatch) {
      const title = titleMatch[1].trim();
      if (/\s\u2014\s/.test(title) || /\s—\s/.test(title)) {
        results.push({ status: 'pass', msg: `Title format OK: "${title}"` });
      } else {
        results.push({ status: 'warn', msg: `Title "${title}" should follow "Name \u2014 Project" format` });
      }
    } else {
      results.push({ status: 'fail', msg: 'No <title> tag found' });
    }

    // Print results for this file
    const fails = results.filter(r => r.status === 'fail').length;
    const warns = results.filter(r => r.status === 'warn').length;
    totalFails += fails;

    const icon = fails > 0 ? C.red + '\u2717' : warns > 0 ? C.yellow + '\u25CB' : C.green + '\u2713';
    console.log(`\n${icon} ${C.bold}${file}${C.reset}`);

    for (const r of results) {
      const tag = r.status === 'pass' ? PASS : r.status === 'warn' ? WARN : FAIL;
      console.log(`  ${tag}  ${r.msg}`);
    }
  }

  // Summary
  console.log(`\n${C.bold}Summary:${C.reset} ${htmlFiles.length} file(s) checked`);
  if (totalFails > 0) {
    console.log(`${C.red}${totalFails} failure(s) found${C.reset}`);
    process.exit(1);
  } else {
    console.log(`${C.green}All checks passed${C.reset}`);
    process.exit(0);
  }
}

// ---------------------------------------------------------------------------
// pull-reviews command
// ---------------------------------------------------------------------------

async function pullReviews(args) {
  // Parse --api and --out flags
  let apiUrl = null;
  let outDir = 'reviews';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--api' && args[i + 1]) {
      apiUrl = args[++i];
    } else if (args[i] === '--out' && args[i + 1]) {
      outDir = args[++i];
    }
  }

  if (!apiUrl) {
    apiUrl = defaultApiUrl();
  }
  const endpoint = apiUrl.replace(/\/+$/, '') + '/api/reviews';

  console.log(`${C.cyan}Fetching reviews from ${endpoint}${C.reset}`);

  let data;
  try {
    data = await fetchJSON(endpoint);
  } catch (err) {
    console.error(`${C.red}Failed to fetch reviews:${C.reset} ${err.message}`);
    process.exit(1);
  }

  const resolved = resolveDir(outDir);
  if (!fs.existsSync(resolved)) {
    fs.mkdirSync(resolved, { recursive: true });
  }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  let newCount = 0;
  let pageCount = 0;

  // data is expected as { pageName: [annotations...], ... }
  const pages = typeof data === 'object' && !Array.isArray(data) ? data : {};

  for (const [pageName, annotations] of Object.entries(pages)) {
    if (!Array.isArray(annotations) || annotations.length === 0) continue;
    pageCount++;

    const outFile = path.join(resolved, `${pageName}-${today}.json`);

    // Merge with existing file if present
    let existing = [];
    if (fs.existsSync(outFile)) {
      try {
        existing = JSON.parse(fs.readFileSync(outFile, 'utf-8'));
      } catch { existing = []; }
    }

    // Deduplicate by timestamp — only append annotations whose timestamp is not already present
    const existingTimestamps = new Set(existing.map(a => a.timestamp).filter(Boolean));
    const newAnnotations = annotations.filter(a => !existingTimestamps.has(a.timestamp));
    newCount += newAnnotations.length;

    if (newAnnotations.length > 0) {
      const merged = [...existing, ...newAnnotations];
      fs.writeFileSync(outFile, JSON.stringify(merged, null, 2));
    }
  }

  console.log(`${C.green}Pulled ${newCount} new annotation(s) for ${pageCount} page(s)${C.reset}`);
}

// ---------------------------------------------------------------------------
// review-report command
// ---------------------------------------------------------------------------

function reviewReport(dir) {
  const resolved = resolveDir(dir);
  if (!fs.existsSync(resolved)) {
    console.error(`${C.red}Directory not found:${C.reset} ${resolved}`);
    process.exit(1);
  }

  const jsonFiles = fs.readdirSync(resolved).filter(f => f.endsWith('.json'));
  if (jsonFiles.length === 0) {
    console.log(`${C.yellow}No .json files found in ${resolved}${C.reset}`);
    process.exit(0);
  }

  // Aggregate annotations by page
  const byPage = {};
  for (const file of jsonFiles) {
    const filePath = path.join(resolved, file);
    let annotations;
    try {
      annotations = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch { continue; }
    if (!Array.isArray(annotations)) continue;

    for (const a of annotations) {
      const page = a.page || file.replace(/-\d{4}-\d{2}-\d{2}\.json$/, '');
      if (!byPage[page]) byPage[page] = [];
      byPage[page].push(a);
    }
  }

  const pages = Object.keys(byPage);
  if (pages.length === 0) {
    console.log(`${C.yellow}No annotations found${C.reset}`);
    process.exit(0);
  }

  // Header
  console.log(`\n${C.bold}Review Report${C.reset}`);
  console.log('='.repeat(70));
  console.log(
    padRight('Page', 30) +
    padRight('Confirm', 10) +
    padRight('Question', 10) +
    padRight('Reject', 10) +
    'Total'
  );
  console.log('-'.repeat(70));

  let unresolvedItems = [];

  for (const page of pages.sort()) {
    const anns = byPage[page];
    const confirm = anns.filter(a => a.type === 'confirm').length;
    const question = anns.filter(a => a.type === 'question').length;
    const reject = anns.filter(a => a.type === 'reject').length;

    console.log(
      padRight(page, 30) +
      padRight(String(confirm), 10) +
      padRight(String(question), 10) +
      padRight(String(reject), 10) +
      anns.length
    );

    // Find unresolved: questioned or rejected items without a later confirm on the same element
    const confirmedElements = new Set(
      anns.filter(a => a.type === 'confirm').map(a => a.element).filter(Boolean)
    );
    const unresolved = anns.filter(
      a => (a.type === 'question' || a.type === 'reject') &&
           a.element && !confirmedElements.has(a.element)
    );
    for (const u of unresolved) {
      unresolvedItems.push({ page, ...u });
    }
  }

  console.log('-'.repeat(70));

  // Unresolved items
  if (unresolvedItems.length > 0) {
    console.log(`\n${C.bold}${C.yellow}Unresolved Items (${unresolvedItems.length})${C.reset}`);
    for (const item of unresolvedItems) {
      const typeColor = item.type === 'reject' ? C.red : C.yellow;
      console.log(`  ${typeColor}[${item.type}]${C.reset} ${item.page} > ${item.element || '?'}: ${item.comment || '(no comment)'}`);
    }
  } else {
    console.log(`\n${C.green}All items resolved${C.reset}`);
  }

  console.log('');
}

function padRight(str, len) {
  return str.length >= len ? str : str + ' '.repeat(len - str.length);
}

// ---------------------------------------------------------------------------
// Shared review aggregation helper (used by brief + dashboard)
// ---------------------------------------------------------------------------

/**
 * Aggregate review data from a project directory.
 * @param {string} projectDir - Resolved path to the project directory
 * @param {string} reviewsDir - Resolved path to the reviews directory
 * @returns {Object} Aggregated review stats
 */
function aggregateReviews(projectDir, reviewsDir) {
  // 1. Find all .html files in project dir
  const htmlFiles = fs.existsSync(projectDir)
    ? fs.readdirSync(projectDir).filter(f => f.endsWith('.html'))
    : [];

  // Detect which HTML files contain PAGE_BLUEPRINT
  const blueprintPages = [];
  for (const file of htmlFiles) {
    const src = fs.readFileSync(path.join(projectDir, file), 'utf-8');
    if (/PAGE_BLUEPRINT/.test(src)) blueprintPages.push(file);
  }

  // 2. Read all review JSON files
  const annotations = []; // flat list of all annotations
  if (fs.existsSync(reviewsDir)) {
    const jsonFiles = fs.readdirSync(reviewsDir).filter(f => f.endsWith('.json'));
    for (const file of jsonFiles) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(reviewsDir, file), 'utf-8'));
        if (Array.isArray(data)) {
          for (const a of data) {
            // Derive page name from annotation or filename
            const page = a.page || file.replace(/-\d{4}-\d{2}-\d{2}\.json$/, '').replace(/\.json$/, '');
            annotations.push({ ...a, page });
          }
        }
      } catch { /* skip malformed JSON */ }
    }
  }

  // 3. Group annotations by page
  const byPage = {};
  for (const a of annotations) {
    if (!byPage[a.page]) byPage[a.page] = [];
    byPage[a.page].push(a);
  }

  // 4. Compute per-page stats
  const pageStats = {};
  for (const [page, anns] of Object.entries(byPage)) {
    const elements = new Set(anns.map(a => a.elementSelector).filter(Boolean));
    const confirm = anns.filter(a => a.reaction === 'confirm').length;
    const question = anns.filter(a => a.reaction === 'question').length;
    const reject = anns.filter(a => a.reaction === 'reject').length;
    const total = elements.size || anns.length;
    const confidence = total > 0 ? Math.round((confirm / total) * 100) : 0;

    // Unresolved: questions/rejections without a later confirm on the same element
    const confirmedElements = new Set(
      anns.filter(a => a.reaction === 'confirm').map(a => a.elementSelector).filter(Boolean)
    );
    const unresolved = anns.filter(
      a => (a.reaction === 'question' || a.reaction === 'reject') &&
           a.elementSelector && !confirmedElements.has(a.elementSelector)
    );

    pageStats[page] = { elements: total, confirm, question, reject, confidence, unresolved, anns };
  }

  // 5. Project-level stats
  const reviewedPages = Object.keys(pageStats);
  const blockedPages = reviewedPages.filter(p => pageStats[p].reject > 0);
  const allConfidences = reviewedPages.map(p => pageStats[p].confidence);
  const overallConfidence = allConfidences.length > 0
    ? Math.round(allConfidences.reduce((a, b) => a + b, 0) / allConfidences.length)
    : 0;

  // Unreviewed pages: HTML files not in byPage
  const unreviewedPages = htmlFiles.filter(f => !byPage[f] && !byPage[f.replace(/\.html$/, '')]);

  // 6. Extract project name from project-data.js
  let projectName = path.basename(projectDir);
  const projDataPath = path.join(projectDir, 'project-data.js');
  if (fs.existsSync(projDataPath)) {
    const projSrc = fs.readFileSync(projDataPath, 'utf-8');
    const titleMatch = projSrc.match(/title\s*:\s*['"]([^'"]+)['"]/);
    if (titleMatch) projectName = titleMatch[1];
  }

  return {
    projectName,
    htmlFiles,
    blueprintPages,
    byPage,
    pageStats,
    reviewedPages,
    blockedPages,
    overallConfidence,
    unreviewedPages,
    annotations
  };
}

/**
 * Build a confidence bar string: filled + empty blocks, 10 wide.
 * @param {number} pct - 0..100
 * @returns {string}
 */
function confidenceBar(pct) {
  const filled = Math.round(pct / 10);
  return '\u2588'.repeat(filled) + '\u2591'.repeat(10 - filled);
}

// ---------------------------------------------------------------------------
// brief command
// ---------------------------------------------------------------------------

function brief(projectDir, args) {
  const resolved = resolveDir(projectDir);
  if (!fs.existsSync(resolved)) {
    console.error(`${C.red}Directory not found:${C.reset} ${resolved}`);
    process.exit(1);
  }

  // Parse flags
  let reviewsDir = path.join(resolved, 'reviews');
  let outFile = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--reviews' && args[i + 1]) {
      reviewsDir = resolveDir(args[++i]);
    } else if (args[i] === '--out' && args[i + 1]) {
      outFile = resolveDir(args[++i]);
    }
  }

  const data = aggregateReviews(resolved, reviewsDir);
  const date = new Date().toISOString().slice(0, 10);
  const useColor = !outFile; // ANSI colors only for terminal output

  const G = useColor ? C.green : '';
  const R = useColor ? C.red : '';
  const Y = useColor ? C.yellow : '';
  const B = useColor ? C.bold : '';
  const D = useColor ? C.dim : '';
  const X = useColor ? C.reset : '';

  const lines = [];
  const ln = (s) => lines.push(s || '');

  ln(`${B}# Iteration Brief \u2014 ${data.projectName} (${date})${X}`);
  ln('');
  ln(`${B}## Project Confidence: ${data.overallConfidence}% (${data.reviewedPages.length}/${data.htmlFiles.length} pages reviewed, ${data.blockedPages.length} with rejections)${X}`);
  ln('');

  // Blocked section
  const allRejected = [];
  for (const page of data.reviewedPages.sort()) {
    const stats = data.pageStats[page];
    for (const u of stats.unresolved.filter(a => a.reaction === 'reject')) {
      allRejected.push({ page, text: u.elementText || u.elementSelector || '?', note: u.note || '(no note)' });
    }
  }
  ln(`${B}## Blocked (must fix before next review)${X}`);
  if (allRejected.length === 0) {
    ln(`${G}No blocked items${X}`);
  } else {
    for (const item of allRejected) {
      ln(`- ${B}${item.page}${X}: ${item.text} ${R}REJECTED${X} \u2014 "${item.note}"`);
    }
  }
  ln('');

  // Needs Discussion
  const allQuestions = [];
  for (const page of data.reviewedPages.sort()) {
    const stats = data.pageStats[page];
    const pageQuestions = stats.unresolved.filter(a => a.reaction === 'question');
    if (pageQuestions.length > 0) {
      const notes = pageQuestions.map(q => q.note || '(no note)').join('; ');
      allQuestions.push({ page, count: pageQuestions.length, notes });
    }
  }
  ln(`${B}## Needs Discussion (${allQuestions.reduce((s, q) => s + q.count, 0)} unresolved questions)${X}`);
  if (allQuestions.length === 0) {
    ln(`${G}No open questions${X}`);
  } else {
    for (const item of allQuestions) {
      ln(`- ${B}${item.page}${X} (${item.count} questions): ${item.notes}`);
    }
  }
  ln('');

  // Confirmed
  ln(`${B}## Confirmed (don't touch)${X}`);
  let hasConfirmed = false;
  for (const page of data.reviewedPages.sort()) {
    const stats = data.pageStats[page];
    if (stats.confirm > 0) {
      hasConfirmed = true;
      const parts = [];
      if (stats.confirm > 0) parts.push(`${stats.confirm} element(s) confirmed`);
      ln(`- ${B}${page}${X}: ${parts.join(', ')}`);
    }
  }
  if (!hasConfirmed) ln(`${D}No confirmed elements yet${X}`);
  ln('');

  // Suggested Changes
  ln(`${B}## Suggested Changes${X}`);
  let changeNum = 0;
  for (const page of data.reviewedPages.sort()) {
    const stats = data.pageStats[page];
    for (const u of stats.unresolved) {
      changeNum++;
      const action = u.reaction === 'reject' ? 'Fix' : 'Discuss';
      const desc = u.note || u.elementText || u.elementSelector || 'Review this element';
      ln(`${changeNum}. ${page}: ${action} \u2014 ${desc}`);
    }
  }
  if (changeNum === 0) ln(`${G}No suggested changes${X}`);
  ln('');

  // Confidence by Page table
  ln(`${B}## Confidence by Page${X}`);
  ln('| Page | Reviewed | \u2713 | ? | \u2717 | Confidence |');
  ln('|------|----------|---|---|---|------------|');
  for (const page of data.reviewedPages.sort()) {
    const s = data.pageStats[page];
    const bar = confidenceBar(s.confidence);
    ln(`| ${page} | ${s.elements} | ${s.confirm} | ${s.question} | ${s.reject} | ${bar} ${s.confidence}% |`);
  }
  ln('');

  // Unreviewed Pages
  if (data.unreviewedPages.length > 0) {
    ln(`${B}## Unreviewed Pages${X}`);
    for (const p of data.unreviewedPages) {
      ln(`- ${p} (no annotations yet)`);
    }
    ln('');
  }

  const output = lines.join('\n');
  if (outFile) {
    fs.writeFileSync(outFile, output, 'utf-8');
    console.log(`${C.green}Brief written to ${outFile}${C.reset}`);
  } else {
    console.log(output);
  }
}

// ---------------------------------------------------------------------------
// dashboard command
// ---------------------------------------------------------------------------

function dashboard(projectDir, args) {
  const resolved = resolveDir(projectDir);
  if (!fs.existsSync(resolved)) {
    console.error(`${C.red}Directory not found:${C.reset} ${resolved}`);
    process.exit(1);
  }

  // Parse flags
  let reviewsDir = path.join(resolved, 'reviews');
  let outFile = path.join(resolved, 'confidence-dashboard.html');

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--reviews' && args[i + 1]) {
      reviewsDir = resolveDir(args[++i]);
    } else if (args[i] === '--out' && args[i + 1]) {
      outFile = resolveDir(args[++i]);
    }
  }

  const data = aggregateReviews(resolved, reviewsDir);
  const date = new Date().toISOString().slice(0, 10);

  // Build KPI items
  const totalPages = data.htmlFiles.length;
  const reviewed = data.reviewedPages.length;
  const totalConfirm = data.reviewedPages.reduce((s, p) => s + data.pageStats[p].confirm, 0);
  const totalQuestion = data.reviewedPages.reduce((s, p) => s + data.pageStats[p].question, 0);
  const totalReject = data.reviewedPages.reduce((s, p) => s + data.pageStats[p].reject, 0);

  // Build table rows for per-page breakdown
  const tableRows = data.reviewedPages.sort().map(page => {
    const s = data.pageStats[page];
    const badgeColor = s.confidence >= 80 ? 'green' : s.confidence >= 50 ? 'amber' : 'red';
    return {
      page: page,
      reviewed: String(s.elements),
      confirmed: String(s.confirm),
      questions: String(s.question),
      rejected: String(s.reject),
      confidence: '<span class="wf-badge wf-badge-' + badgeColor + '">' + s.confidence + '%</span>'
    };
  });

  // Build blocked items content
  const blockedItems = [];
  for (const page of data.reviewedPages.sort()) {
    for (const u of data.pageStats[page].unresolved.filter(a => a.reaction === 'reject')) {
      const text = (u.elementText || u.elementSelector || '?').replace(/'/g, "\\'");
      const note = (u.note || '(no note)').replace(/'/g, "\\'");
      blockedItems.push('<div style="padding:6px 0;border-bottom:1px solid var(--wf-tint);">' +
        '<strong>' + escapeHtml(page) + '</strong>: ' + escapeHtml(u.elementText || u.elementSelector || '?') +
        ' <span class="wf-badge wf-badge-red">REJECTED</span> &mdash; ' + escapeHtml(u.note || '(no note)') +
        '</div>');
    }
  }

  // Build open questions content
  const questionItems = [];
  for (const page of data.reviewedPages.sort()) {
    for (const u of data.pageStats[page].unresolved.filter(a => a.reaction === 'question')) {
      questionItems.push('<div style="padding:6px 0;border-bottom:1px solid var(--wf-tint);">' +
        '<strong>' + escapeHtml(page) + '</strong>: ' + escapeHtml(u.elementText || u.elementSelector || '?') +
        ' <span class="wf-badge wf-badge-amber">QUESTION</span> &mdash; ' + escapeHtml(u.note || '(no note)') +
        '</div>');
    }
  }

  // Serialize the PAGE_BLUEPRINT as a JS string
  const blueprint = {
    surface: 'internal',
    layout: 'dashboard',
    header: {
      icon: '\uD83D\uDCCA',
      type: 'Review Summary',
      name: 'Confidence Dashboard'
    },
    columns: {
      center: [
        {
          type: 'kpi-row',
          items: [
            { label: 'Total Pages', value: String(totalPages), trend: totalPages + ' in project', color: 'green' },
            { label: 'Reviewed', value: String(reviewed), trend: reviewed + '/' + totalPages + ' pages', color: reviewed === totalPages ? 'green' : 'amber' },
            { label: 'Confirmed', value: String(totalConfirm), color: 'green' },
            { label: 'Questions', value: String(totalQuestion), color: totalQuestion > 0 ? 'amber' : 'green' },
            { label: 'Rejected', value: String(totalReject), color: totalReject > 0 ? 'red' : 'green' },
            { label: 'Confidence', value: data.overallConfidence + '%', color: data.overallConfidence >= 80 ? 'green' : data.overallConfidence >= 50 ? 'amber' : 'red' }
          ]
        },
        {
          type: 'table',
          title: 'Confidence by Page',
          sortable: true,
          columns: [
            { label: 'Page', field: 'page' },
            { label: 'Reviewed', field: 'reviewed' },
            { label: 'Confirmed', field: 'confirmed' },
            { label: 'Questions', field: 'questions' },
            { label: 'Rejected', field: 'rejected' },
            { label: 'Confidence', field: 'confidence' }
          ],
          rows: tableRows
        },
        {
          type: 'card',
          title: 'Blocked Items (' + blockedItems.length + ')',
          content: blockedItems.length > 0
            ? '<div style="font-size:12px;color:var(--wf-text);line-height:1.8;">' + blockedItems.join('') + '</div>'
            : '<div style="color:var(--wf-muted);font-style:italic;">No blocked items</div>'
        },
        {
          type: 'card',
          title: 'Open Questions (' + questionItems.length + ')',
          content: questionItems.length > 0
            ? '<div style="font-size:12px;color:var(--wf-text);line-height:1.8;">' + questionItems.join('') + '</div>'
            : '<div style="color:var(--wf-muted);font-style:italic;">No open questions</div>'
        }
      ]
    },
    notes: {
      summary: 'Auto-generated confidence dashboard for ' + data.projectName + '. Generated on ' + date + ' from ' + data.annotations.length + ' review annotations across ' + reviewed + ' pages.',
      designSpec: 'Internal DS surface with dashboard layout. KPI row shows project-level metrics. Table shows per-page confidence breakdown. Cards list blocked items and open questions.',
      acceptance: [
        'KPI row shows total pages, reviewed count, and reaction counts',
        'Table shows per-page confidence with color-coded badges',
        'Blocked items card lists all unresolved rejections',
        'Questions card lists all unresolved questions'
      ]
    },
    confidence: 'full'
  };

  // Serialize blueprint to JS source (using JSON.stringify with 4-space indent)
  const blueprintJS = JSON.stringify(blueprint, null, 4);

  const html = `<!DOCTYPE html>
<html lang="en" class="wireframe">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confidence Dashboard \u2014 ${escapeHtml(data.projectName)}</title>
  <link rel="stylesheet" href="core/proto-tokens.css">
  <link rel="stylesheet" href="core/proto-chrome.css">
  <link rel="stylesheet" href="core/proto-components.css">
  <link rel="stylesheet" href="core/proto-story.css">
  <link rel="stylesheet" href="core/proto-feedback.css">
  <link rel="stylesheet" href="core/proto-blueprint.css">
  <link rel="stylesheet" href="core/proto-keyframes.css">
  <link rel="stylesheet" href="surfaces/internal-ds.css">
</head>
<body>

  <script src="project-data.js"></script>
  <script src="core/proto-nav.js"></script>

  <script>
  var PAGE_BLUEPRINT = ${blueprintJS};
  </script>

  <script src="core/proto-gen.js"></script>

</body>
</html>
`;

  fs.writeFileSync(outFile, html, 'utf-8');
  console.log(`${C.green}Dashboard written to ${outFile}${C.reset}`);
}

/** Escape HTML entities for safe embedding. */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------------------------------------------------------------------------
// synthesize command
// ---------------------------------------------------------------------------

/**
 * Pattern-match a reviewer note to produce an actionable instruction.
 * @param {string} note - The reviewer's note text
 * @returns {string} Synthesized action or suggestion
 */
function synthesizeAction(note) {
  if (!note) return 'Review this element';
  const lower = note.toLowerCase();
  if (/instead of|rather than|try |replace/.test(lower)) {
    return 'Replace current implementation per stakeholder suggestion: "' + note + '"';
  }
  if (/too many|cluttered|simplify|reduce/.test(lower)) {
    return 'Simplify \u2014 reduce number of items or consolidate';
  }
  if (/\badd\b|need|missing|where is/.test(lower)) {
    const what = note.replace(/^(add|need|missing|where is)\s*/i, '').trim() || note;
    return 'Add missing element: ' + what;
  }
  if (/move|reorder|position|placement/.test(lower)) {
    return 'Reposition element per stakeholder request';
  }
  if (/\?\s*$/.test(note)) {
    return note;
  }
  return note;
}

function synthesize(projectDir, args) {
  const resolved = resolveDir(projectDir);
  if (!fs.existsSync(resolved)) {
    console.error(`${C.red}Directory not found:${C.reset} ${resolved}`);
    process.exit(1);
  }

  // Parse flags
  let reviewsDir = path.join(resolved, 'reviews');
  let outFile = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--reviews' && args[i + 1]) {
      reviewsDir = resolveDir(args[++i]);
    } else if (args[i] === '--out' && args[i + 1]) {
      outFile = resolveDir(args[++i]);
    }
  }

  const data = aggregateReviews(resolved, reviewsDir);
  const timestamp = new Date().toISOString();
  const useColor = !outFile;

  const B = useColor ? C.bold : '';
  const X = useColor ? C.reset : '';

  const lines = [];
  const ln = (s) => lines.push(s || '');

  ln(`# Synthesis: ${data.projectName}`);
  ln(`Generated: ${timestamp}`);
  ln('');

  // ---- STOP — Do Not Change ------------------------------------------------
  ln(`${B}## STOP \u2014 Do Not Change${X}`);
  ln('<!-- Elements confirmed by stakeholders. Agent must not modify these. -->');
  ln('');
  ln('| Page | Element | Confirmed By | Date |');
  ln('|------|---------|-------------|------|');

  const confirmedItems = [];
  for (const page of data.reviewedPages.sort()) {
    const anns = data.pageStats[page].anns;
    for (const a of anns) {
      if (a.reaction === 'confirm') {
        const el = a.elementSelector || '?';
        const text = a.elementText || '';
        const reviewer = a.reviewer || a.author || 'unknown';
        const date = a.timestamp ? a.timestamp.slice(0, 10) : '?';
        confirmedItems.push({ page, el, text, reviewer, date });
        ln(`| ${page} | \`${el}\` \u2014 "${text}" | ${reviewer} | ${date} |`);
      }
    }
  }
  if (confirmedItems.length === 0) {
    ln('| (none) | | | |');
  }
  ln('');

  // ---- FIX — Required Changes -----------------------------------------------
  ln(`${B}## FIX \u2014 Required Changes${X}`);
  ln('<!-- Rejections with stakeholder rationale. Agent must address all of these. -->');
  ln('');

  const rejectedItems = [];
  for (const page of data.reviewedPages.sort()) {
    const stats = data.pageStats[page];
    for (const u of stats.unresolved.filter(a => a.reaction === 'reject')) {
      const el = u.elementSelector || '?';
      const text = u.elementText || '';
      const reviewer = u.reviewer || u.author || 'unknown';
      const date = u.timestamp ? u.timestamp.slice(0, 10) : '?';
      const note = u.note || '(no note)';
      const confidence = u.confidence || u.previousConfidence || '?';
      const action = synthesizeAction(note);
      rejectedItems.push({ page, el, text, action });

      ln(`### ${page}`);
      ln(`- **Element:** \`${el}\` \u2014 "${text}"`);
      ln(`- **Rejected by:** ${reviewer} on ${date}`);
      ln(`- **Reason:** ${note}`);
      ln(`- **Previous confidence:** ${confidence}`);
      ln(`- **Action:** ${action}`);
      ln('');
    }
  }
  if (rejectedItems.length === 0) {
    ln('(No rejections)');
    ln('');
  }

  // ---- DISCUSS — Open Questions ---------------------------------------------
  ln(`${B}## DISCUSS \u2014 Open Questions${X}`);
  ln('<!-- Questions without resolution. Agent should propose alternatives. -->');
  ln('');

  const questionItems = [];
  for (const page of data.reviewedPages.sort()) {
    const stats = data.pageStats[page];
    for (const u of stats.unresolved.filter(a => a.reaction === 'question')) {
      const el = u.elementSelector || '?';
      const text = u.elementText || '';
      const reviewer = u.reviewer || u.author || 'unknown';
      const date = u.timestamp ? u.timestamp.slice(0, 10) : '?';
      const note = u.note || '(no note)';
      const suggestion = synthesizeAction(note);
      questionItems.push({ page, el, text, question: note });

      ln(`### ${page}`);
      ln(`- **Element:** \`${el}\` \u2014 "${text}"`);
      ln(`- **Asked by:** ${reviewer} on ${date}`);
      ln(`- **Question:** ${note}`);
      ln(`- **Suggestion:** ${suggestion}`);
      ln('');
    }
  }
  if (questionItems.length === 0) {
    ln('(No open questions)');
    ln('');
  }

  // ---- CONFLICTS ------------------------------------------------------------
  // Same element with both confirm and reject from different reviewers
  const conflicts = [];
  for (const page of data.reviewedPages.sort()) {
    const anns = data.pageStats[page].anns;
    const byElement = {};
    for (const a of anns) {
      if (!a.elementSelector) continue;
      if (!byElement[a.elementSelector]) byElement[a.elementSelector] = [];
      byElement[a.elementSelector].push(a);
    }
    for (const [el, elAnns] of Object.entries(byElement)) {
      const hasConfirm = elAnns.some(a => a.reaction === 'confirm');
      const hasReject = elAnns.some(a => a.reaction === 'reject');
      if (hasConfirm && hasReject) {
        const confirmers = elAnns.filter(a => a.reaction === 'confirm').map(a => a.reviewer || a.author || 'unknown');
        const rejecters = elAnns.filter(a => a.reaction === 'reject').map(a => a.reviewer || a.author || 'unknown');
        conflicts.push({ page, el, confirmers, rejecters });
      }
    }
  }

  if (conflicts.length > 0) {
    ln(`${B}## CONFLICTS${X}`);
    ln('<!-- Same element confirmed by one reviewer and rejected by another. Needs resolution. -->');
    ln('');
    for (const c of conflicts) {
      ln(`- **${c.page}** \u2014 \`${c.el}\`: confirmed by ${c.confirmers.join(', ')} but rejected by ${c.rejecters.join(', ')}`);
    }
    ln('');
  }

  // ---- GAPS — Unreviewed Areas ----------------------------------------------
  ln(`${B}## GAPS \u2014 Unreviewed Areas${X}`);
  ln('<!-- Pages or high-confidence elements that haven\'t been reviewed yet. -->');
  ln('');

  if (data.unreviewedPages.length > 0) {
    for (const p of data.unreviewedPages) {
      // Count elements with data-wf-confidence in the HTML
      const filePath = path.join(resolved, p);
      let confidenceCount = 0;
      if (fs.existsSync(filePath)) {
        const src = fs.readFileSync(filePath, 'utf-8');
        const matches = src.match(/data-wf-confidence/g);
        if (matches) confidenceCount = matches.length;
      }
      if (confidenceCount > 0) {
        ln(`- **${p}** \u2014 ${confidenceCount} elements with \`data-wf-confidence\` but no review annotations`);
      } else {
        ln(`- **${p}** \u2014 no review annotations`);
      }
    }
  } else {
    ln('(All pages have been reviewed)');
  }
  ln('');

  // ---- METRICS --------------------------------------------------------------
  ln(`${B}## METRICS${X}`);

  const totalPages = data.htmlFiles.length;
  const reviewed = data.reviewedPages.length;
  const reviewedPct = totalPages > 0 ? Math.round((reviewed / totalPages) * 100) : 0;

  const totalElements = data.annotations.length;
  const totalConfirm = confirmedItems.length;
  const totalQuestion = questionItems.length;
  const totalReject = rejectedItems.length;
  const totalReviewed = totalConfirm + totalQuestion + totalReject;
  const confirmPct = totalReviewed > 0 ? Math.round((totalConfirm / totalReviewed) * 100) : 0;
  const questionPct = totalReviewed > 0 ? Math.round((totalQuestion / totalReviewed) * 100) : 0;
  const rejectPct = totalReviewed > 0 ? Math.round((totalReject / totalReviewed) * 100) : 0;
  const unresolved = totalQuestion + totalReject;

  // Scope estimation
  let scope, scopeReason;
  if (totalReject >= 6 || totalQuestion >= 9) {
    scope = 'large';
    scopeReason = totalReject + ' rejections and ' + totalQuestion + ' questions require significant rework';
  } else if (totalReject >= 3 || totalQuestion >= 4) {
    scope = 'medium';
    scopeReason = totalReject + ' rejections and ' + totalQuestion + ' questions require moderate changes';
  } else {
    scope = 'small';
    scopeReason = totalReject + ' rejections and ' + totalQuestion + ' questions \u2014 minor iteration needed';
  }

  ln(`- Pages reviewed: ${reviewed}/${totalPages} (${reviewedPct}%)`);
  ln(`- Elements reviewed: ${totalElements}`);
  ln(`- Confirmed: ${totalConfirm} (${confirmPct}%)`);
  ln(`- Questioned: ${totalQuestion} (${questionPct}%)`);
  ln(`- Rejected: ${totalReject} (${rejectPct}%)`);
  ln(`- Unresolved: ${unresolved} (questions + rejections without later confirm)`);
  ln(`- Estimated iteration scope: ${scope} \u2014 ${scopeReason}`);
  ln('');

  // ---- PROMPT ---------------------------------------------------------------
  ln(`${B}## PROMPT${X}`);
  ln('<!-- Ready-to-use agent prompt for the next iteration -->');
  ln('');
  ln(`You are updating wireframes for ${data.projectName}. Review annotations from stakeholders have been collected. Here are your instructions:`);
  ln('');

  // Do not modify
  ln('**Do not modify** the following confirmed elements:');
  if (confirmedItems.length > 0) {
    for (const item of confirmedItems) {
      ln(`- ${item.page}: \`${item.el}\` \u2014 "${item.text}"`);
    }
  } else {
    ln('- (none confirmed yet)');
  }
  ln('');

  // Must fix
  ln('**Must fix** these rejected elements:');
  if (rejectedItems.length > 0) {
    rejectedItems.forEach((item, i) => {
      ln(`${i + 1}. ${item.page}: \`${item.el}\` \u2014 "${item.text}" \u2192 ${item.action}`);
    });
  } else {
    ln('- (no rejections)');
  }
  ln('');

  // Propose alternatives
  ln('**Propose alternatives** for these questioned elements:');
  if (questionItems.length > 0) {
    questionItems.forEach((item, i) => {
      ln(`${i + 1}. ${item.page}: \`${item.el}\` \u2014 "${item.text}" \u2192 Stakeholder asked: "${item.question}"`);
    });
  } else {
    ln('- (no open questions)');
  }
  ln('');

  // Investigate
  ln('**Investigate** these unreviewed pages:');
  if (data.unreviewedPages.length > 0) {
    for (const p of data.unreviewedPages) {
      ln(`- ${p}`);
    }
  } else {
    ln('- (all pages reviewed)');
  }
  ln('');

  ln('After making changes, update `data-wf-confidence` attributes:');
  ln('- Fixed rejections \u2192 set to "partial" (needs re-review)');
  ln('- Addressed questions \u2192 set to "partial"');
  ln('- Do not change confirmed elements\' confidence');

  const output = lines.join('\n');
  if (outFile) {
    fs.writeFileSync(outFile, output, 'utf-8');
    console.log(`${C.green}Synthesis written to ${outFile}${C.reset}`);
  } else {
    console.log(output);
  }
}

// ---------------------------------------------------------------------------
// Main dispatch
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'validate':
    if (!args[1]) {
      console.error(`${C.red}Usage: nib-cli.js validate <dir>${C.reset}`);
      process.exit(1);
    }
    validate(args[1]);
    break;

  case 'pull-reviews':
    pullReviews(args.slice(1));
    break;

  case 'review-report':
    if (!args[1]) {
      console.error(`${C.red}Usage: nib-cli.js review-report <dir>${C.reset}`);
      process.exit(1);
    }
    reviewReport(args[1]);
    break;

  case 'brief':
    if (!args[1]) {
      console.error(`${C.red}Usage: nib-cli.js brief <project-dir> [--reviews <dir>] [--out <file>]${C.reset}`);
      process.exit(1);
    }
    brief(args[1], args.slice(2));
    break;

  case 'dashboard':
    if (!args[1]) {
      console.error(`${C.red}Usage: nib-cli.js dashboard <project-dir> [--reviews <dir>] [--out <file>]${C.reset}`);
      process.exit(1);
    }
    dashboard(args[1], args.slice(2));
    break;

  case 'synthesize':
    if (!args[1]) {
      console.error(`${C.red}Usage: nib-cli.js synthesize <project-dir> [--reviews <dir>] [--out <file>]${C.reset}`);
      process.exit(1);
    }
    synthesize(args[1], args.slice(2));
    break;

  default:
    usage();
    process.exit(command ? 1 : 0);
}
