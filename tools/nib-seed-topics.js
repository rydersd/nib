#!/usr/bin/env node
/**
 * nib-seed-topics — add data-topic + data-role attributes to every
 * wireframe page's <html> tag, so an agent can grep pages by topic
 * instead of reading them.
 *
 * Topic is matched from the page path by keyword. Role is matched the
 * same way. The topic vocabulary is a closed list read from a JSON file
 * (default: <project>/data/topics.json) — every assigned slug is
 * validated against it.
 *
 * Idempotent: a page that already carries data-topic is left untouched
 * (hand-set values win). Per-file validation guards every write.
 *
 * Usage:
 *   node tools/nib-seed-topics.js <project-dir>
 *   node tools/nib-seed-topics.js <project-dir> --dry-run
 *   node tools/nib-seed-topics.js <project-dir> --topics ./vocab.json
 *
 * topics.json shape:
 *   {
 *     "topics": {
 *       "onboarding":   { "label": "Partner onboarding", "match": ["onboard","apply"] },
 *       "billing":      { "label": "Billing",            "match": ["billing","invoice"] }
 *     },
 *     "roles": {
 *       "index":     ["sitemap","pages-index","index"],
 *       "reference": ["reference","glossary"]
 *     }
 *   }
 *
 * `match` is a list of substrings tested against the lower-cased relative
 * path. First topic whose any keyword matches wins; pages with no match
 * get "general". Roles work the same way and default to "wireframe".
 * If topics.json has no `roles` key a small built-in default set is used.
 */
const fs = require('fs');
const path = require('path');

// Folders that are never wireframe pages — never tag.
const SKIP_DIRS = new Set([
  'node_modules', 'nib', 'core', 'surfaces', 'tools', 'scripts',
  'data', 'fonts', 'icons', 'assets', 'functions', '_archive',
]);

const DEFAULT_ROLES = {
  index: ['sitemap', 'pages-index', 'index'],
  reference: ['reference', 'glossary', 'reference-hub'],
  ledger: ['-ledger', 'consistency-ledger'],
  spec: ['-spec', 'decisions'],
};

function parseArgs(argv) {
  const out = { project: null, dry: false, topics: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') out.dry = true;
    else if (a === '--topics') out.topics = argv[++i];
    else if (!a.startsWith('--') && !out.project) out.project = a;
  }
  return out;
}

function loadVocab(projectDir, topicsArg) {
  const candidate = topicsArg
    ? path.resolve(topicsArg)
    : path.join(projectDir, 'data', 'topics.json');
  if (!fs.existsSync(candidate)) {
    console.error(`✗ topic vocabulary not found: ${candidate}`);
    console.error(`  Create data/topics.json or pass --topics <file>.`);
    process.exit(1);
  }
  const json = JSON.parse(fs.readFileSync(candidate, 'utf8'));
  const topics = json.topics || {};
  const roles = json.roles || DEFAULT_ROLES;
  // Build first-match-wins rule lists.
  const topicRules = Object.keys(topics).map((slug) => [
    slug,
    (topics[slug].match || [slug]).map((s) => String(s).toLowerCase()),
  ]);
  const roleRules = Object.keys(roles).map((slug) => [
    slug,
    (roles[slug] || []).map((s) => String(s).toLowerCase()),
  ]);
  return { topicRules, roleRules, validTopics: new Set(Object.keys(topics)) };
}

function matchFirst(rules, rel, fallback) {
  for (const [slug, keywords] of rules) {
    for (const kw of keywords) {
      if (rel.indexOf(kw) !== -1) return slug;
    }
  }
  return fallback;
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name) || e.name.startsWith('.')) continue;
      walk(path.join(dir, e.name), out);
    } else if (e.isFile() && e.name.endsWith('.html')) {
      out.push(path.join(dir, e.name));
    }
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.project) {
    console.error('Usage: node tools/nib-seed-topics.js <project-dir> [--dry-run] [--topics file]');
    process.exit(1);
  }
  const projectDir = path.resolve(args.project);
  if (!fs.existsSync(projectDir)) {
    console.error(`✗ project directory not found: ${projectDir}`);
    process.exit(1);
  }

  const { topicRules, roleRules, validTopics } = loadVocab(projectDir, args.topics);
  const files = walk(projectDir).sort();

  let tagged = 0, already = 0, failed = 0;
  const byTopic = {};

  for (const abs of files) {
    const rel = path.relative(projectDir, abs).replace(/\\/g, '/');
    const src = fs.readFileSync(abs, 'utf8');
    const tagMatch = src.match(/<html\b[^>]*>/i);
    if (!tagMatch) { console.error(`  ✗ no <html> tag: ${rel}`); failed++; continue; }
    const tag = tagMatch[0];

    if (/\bdata-topic=/i.test(tag)) {
      const existing = (tag.match(/data-topic=["']([^"']*)/i) || [])[1] || '?';
      byTopic[existing] = (byTopic[existing] || 0) + 1;
      already++;
      continue;
    }

    const lc = rel.toLowerCase();
    const topic = matchFirst(topicRules, lc, 'general');
    const role = matchFirst(roleRules, lc, 'wireframe');

    if (topic !== 'general' && !validTopics.has(topic)) {
      console.error(`  ✗ invalid topic '${topic}' for ${rel}`); failed++; continue;
    }

    const newTag = tag.replace(/>$/, ` data-topic="${topic}" data-role="${role}">`);
    const out = src.replace(tag, newTag);

    // Per-file validation: structure intact, attribute present, sane growth.
    const grew = out.length - src.length;
    const ok = out.includes('<html') && /<\/html>/i.test(out) &&
               out.includes(`data-topic="${topic}"`) && grew > 0 && grew < 80;
    if (!ok) { console.error(`  ✗ validation failed: ${rel} (Δ${grew})`); failed++; continue; }

    if (!args.dry) fs.writeFileSync(abs, out, 'utf8');
    tagged++;
    byTopic[topic] = (byTopic[topic] || 0) + 1;
  }

  console.log(`\nnib-seed-topics${args.dry ? ' (dry-run)' : ''}: ${files.length} files · ` +
    `${tagged} tagged · ${already} already tagged · ${failed} failed`);
  console.log('topic distribution:');
  for (const [t, n] of Object.entries(byTopic).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(4)}  ${t}`);
  }
  if (failed) process.exitCode = 1;
}

main();
