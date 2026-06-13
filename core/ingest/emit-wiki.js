/**
 * Wiki emitter: canonical project shape → docs/*.md.
 *
 * Two kinds of pages:
 *   - Auto pages — overwritten on every sync. Carry the
 *     `<!-- nib:auto source=… -->` marker on line 1. Stable across runs
 *     (no timestamp in the marker) so idempotent sync produces byte-
 *     identical files when the project shape is unchanged.
 *     Personas, Blueprints, Pages, Stories, Tokens, Home, _Sidebar, _Footer.
 *
 *   - Stub pages — written only when missing; never touched again.
 *     README, Decisions, Architecture, Glossary, Lessons-Learned.
 *     The LLM owns these; nib-sync leaves them alone.
 *
 * Cross-references use [[Page-Name]] wikilinks (Obsidian / Foam / GitHub
 * wiki style). Page names are kebab-with-hyphens, prefixed by resource
 * type (Persona-<id>, Blueprint-<id>, Story-<id>) to keep the namespace
 * collision-free. Anything outside these prefixes is free for the LLM
 * to author by hand — sync never touches non-auto-marked pages.
 */

const fs = require('fs');
const path = require('path');

// Stable marker (no timestamp) so byte-identical regen produces no drift
// in nib-sync's diff. Last-sync timestamp lives on Home.md, sourced from
// data/source-of-truth.txt instead.
const AUTO_MARKER = (source, extra = '') =>
  `<!-- nib:auto source=${source}${extra ? ' ' + extra : ''} -->`;

const STUB_MARKER = '<!-- nib:starter — this page is yours to edit. Never auto-regenerated. -->';

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function writeAutoPage(target, relPath, content) {
  const full = path.join(target, relPath);
  ensureDir(path.dirname(full));
  fs.writeFileSync(full, content);
  return relPath;
}

function writeStubIfMissing(target, relPath, content) {
  const full = path.join(target, relPath);
  if (fs.existsSync(full)) return null;
  ensureDir(path.dirname(full));
  fs.writeFileSync(full, content);
  return relPath;
}

function wikilink(name, label) {
  if (label && label !== name) return `[[${name}|${label}]]`;
  return `[[${name}]]`;
}

function escMd(s) {
  return String(s == null ? '' : s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function asList(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return String(v).split(/[;\r\n]+/).map((s) => s.trim()).filter(Boolean);
}

// ── Page builders ──────────────────────────────────────────────────────────

function buildHome(project, sourceMeta) {
  const meta = project.meta || {};
  const stats = {
    pages: (project.pages || []).length,
    personas: (project.personas || []).length,
    blueprints: Object.keys(project.blueprints || {}).length,
    stories: (project.stories || []).length,
    registries: Object.keys(project.registries || {}).length,
  };
  const sourceLine = sourceMeta && sourceMeta.path
    ? `**Source:** \`${path.basename(sourceMeta.path)}\` (last modified ${sourceMeta.mtime || 'unknown'})`
    : sourceMeta && sourceMeta.url
    ? `**Source:** ${sourceMeta.url}`
    : '';

  return `${AUTO_MARKER('project')}

# ${meta.title || 'Untitled Nib Project'}

${meta.subtitle || `A Nib wireframe project — ${stats.pages} page${stats.pages === 1 ? '' : 's'}, ${stats.personas} persona${stats.personas === 1 ? '' : 's'}, ${stats.blueprints} blueprint${stats.blueprints === 1 ? '' : 's'}, ${stats.stories} stor${stats.stories === 1 ? 'y' : 'ies'}.`}

## Generated index

Pages auto-derived from the workbook (refresh with \`npx nib-sync\`):

- ${wikilink('Pages')} — every page in the project
- ${wikilink('Personas')} — who the project serves
- ${wikilink('Blueprints')} — service blueprint flows + drill-down
- ${wikilink('Stories')} — design stories + JTBDs
${Object.keys(project.tokens || {}).length ? `- ${wikilink('Tokens')} — CSS variable overrides\n` : ''}${stats.registries ? `- ${wikilink('Registries')} — controlled vocab\n` : ''}
## Narrative

Hand-authored — edit freely, the sync never overwrites these:

- ${wikilink('README')} — project pitch
- ${wikilink('Decisions')} — decision log
- ${wikilink('Architecture')} — architectural notes
- ${wikilink('Glossary')} — terminology
- ${wikilink('Lessons-Learned')} — what worked, what didn't

## Status

${sourceLine}
**Auto-pages:** regenerate from \`data/*.js\` and the source workbook on every \`nib-sync\`.
**Stub pages:** never overwritten — yours and the LLM's to author.

> Wiki maintenance contract: see [\`CLAUDE.md\`](../CLAUDE.md).
`;
}

function buildSidebar(project) {
  const hasTokens = Object.keys(project.tokens || {}).length > 0;
  const hasRegistries = Object.keys(project.registries || {}).length > 0;
  return `${AUTO_MARKER('project')}

### ${wikilink('Home')}

**Generated**
- ${wikilink('Pages')}
- ${wikilink('Personas')}
- ${wikilink('Blueprints')}
- ${wikilink('Stories')}
${hasTokens ? `- ${wikilink('Tokens')}\n` : ''}${hasRegistries ? `- ${wikilink('Registries')}\n` : ''}
**Narrative**
- ${wikilink('README')}
- ${wikilink('Decisions')}
- ${wikilink('Architecture')}
- ${wikilink('Glossary')}
- ${wikilink('Lessons-Learned')}
`;
}

function buildFooter(project) {
  return `${AUTO_MARKER('project')}

_${(project.meta && project.meta.title) || 'Project'} wiki — generated by [Nib](https://github.com/rybooth-eq/nib). Edit auto-pages by editing the workbook + running \`npx nib-sync\`._
`;
}

function buildPagesIndex(project) {
  const pages = project.pages || [];
  const byParent = new Map();
  for (const p of pages) {
    const key = p.parent || '__root__';
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(p);
  }
  const roots = byParent.get('__root__') || [];

  let body = '';
  if (!roots.length) {
    body = '_No pages defined yet._\n';
  } else {
    for (const root of roots) {
      body += `### ${root.label}\n\n`;
      body += pageBullet(root, project);
      const children = byParent.get(root.id) || [];
      for (const child of children) body += pageBullet(child, project);
      body += '\n';
    }
  }

  return `${AUTO_MARKER('data/sections.js')}

# Pages

${pages.length} page${pages.length === 1 ? '' : 's'}.

${body}
> Edit the workbook \`pages\` tab to change. \`npx nib-sync\` refreshes this page.
`;
}

function pageBullet(page, project) {
  const bits = [`- **${page.label}** \`${page.id}\``];
  if (page.surface) bits.push(`· surface: ${page.surface}`);
  if (page.template) bits.push(`· template: \`${page.template}\``);
  if (page.personaId) bits.push(`· persona: ${wikilink('Persona-' + page.personaId)}`);
  if (page.blueprintId) bits.push(`· renders ${wikilink('Blueprint-' + page.blueprintId)}`);
  if (page.summary) bits.push(`\n  ${page.summary}`);
  return bits.join(' ') + '\n';
}

function buildPersonasIndex(project) {
  const personas = project.personas || [];
  const rows = personas.map((p) =>
    `| ${wikilink('Persona-' + p.id, p.label)} | ${escMd(p.role)} | ${escMd(p.org)} | ${escMd(p.summary)} |`
  ).join('\n');
  return `${AUTO_MARKER('data/personas.js')}

# Personas

${personas.length ? `${personas.length} persona${personas.length === 1 ? '' : 's'}.

| Persona | Role | Org | Summary |
|---|---|---|---|
${rows}` : '_No personas defined yet._'}

> Edit the workbook \`personas\` tab + run \`npx nib-sync\`.

## Related

- ${wikilink('Pages')} — which pages each persona uses
- ${wikilink('Stories')} — JTBDs and design stories
- ${wikilink('Blueprints')}
`;
}

function buildPersonaPage(persona, project) {
  const ownsBlueprints = Object.values(project.blueprints || {})
    .filter((f) => f.meta.ownerPersonaId === persona.id);
  const ownsPages = (project.pages || []).filter((pg) => pg.personaId === persona.id);
  const stories = (project.stories || []).filter((s) => s.personaId === persona.id);

  return `${AUTO_MARKER('data/personas.js', `id=${persona.id}`)}

# ${persona.label}

**Role:** ${persona.role || '—'} · **Org:** ${persona.org || '—'}${persona.initials ? ` · **Initials:** ${persona.initials}` : ''}

${persona.summary || ''}

${section('Jobs to be done', asList(persona.jtbd))}
${section('Pains', asList(persona.pains))}
${section('Goals', asList(persona.goals))}

${ownsPages.length ? `## Pages

${ownsPages.map((p) => `- ${p.label} \`${p.id}\``).join('\n')}

` : ''}${ownsBlueprints.length ? `## Owns blueprints

${ownsBlueprints.map((f) => `- ${wikilink('Blueprint-' + f.meta.flowId, f.meta.title)}`).join('\n')}

` : ''}${stories.length ? `## Stories

${stories.map((s) => `- ${wikilink('Story-' + s.id, s.title)}`).join('\n')}

` : ''}## Related

- ${wikilink('Personas')} — back to index
- ${wikilink('Pages')}
- ${wikilink('Home')}
`;
}

function section(title, items) {
  if (!items.length) return '';
  return `## ${title}\n\n${items.map((i) => `- ${i}`).join('\n')}\n`;
}

function buildBlueprintsIndex(project) {
  const flows = project.blueprints || {};
  const ids = Object.keys(flows);
  const tree = buildTree(flows);

  return `${AUTO_MARKER('data/blueprints/_index.js')}

# Blueprints

${ids.length ? `${ids.length} flow${ids.length === 1 ? '' : 's'}.

## Hierarchy

${renderTree(tree, flows)}

## Index

${ids.map((id) => {
  const f = flows[id];
  const owner = f.meta.ownerPersonaId ? ` — owned by ${wikilink('Persona-' + f.meta.ownerPersonaId)}` : '';
  const status = f.meta.status ? ` · _${f.meta.status}_` : '';
  return `- ${wikilink('Blueprint-' + id, f.meta.title)}${owner}${status}\n  ${f.meta.summary || ''}`;
}).join('\n')}` : '_No blueprints defined yet._'}

> Edit each flow's tab in the workbook + run \`npx nib-sync\`. Each tab is one blueprint flow; \`meta:parent\` rows establish the hierarchy.
`;
}

function buildTree(flows) {
  const childrenOf = {};
  const roots = [];
  for (const [id, flow] of Object.entries(flows)) {
    const parent = flow.meta && flow.meta.parent;
    if (parent) (childrenOf[parent] = childrenOf[parent] || []).push(id);
    else roots.push(id);
  }
  const node = (id) => ({ id, children: (childrenOf[id] || []).map(node) });
  return roots.map(node);
}

function renderTree(tree, flows, depth = 0) {
  return tree.map((n) => {
    const f = flows[n.id];
    const indent = '  '.repeat(depth);
    const line = `${indent}- ${wikilink('Blueprint-' + n.id, f ? f.meta.title : n.id)}`;
    const children = n.children.length ? '\n' + renderTree(n.children, flows, depth + 1) : '';
    return line + children;
  }).join('\n');
}

function buildBlueprintPage(flow, project) {
  const meta = flow.meta || {};
  const phases = flow.phases || [];
  const lanes = flow.lanes || [];
  const nodes = flow.nodes || [];
  const edges = flow.edges || [];
  const drillIns = nodes.filter((n) => n.childBlueprintId);
  const childFlows = Object.values(project.blueprints || {})
    .filter((f) => f.meta.parent === meta.flowId);

  const phaseRows = phases.map((p) => `| \`${p.id}\` | ${escMd(p.label)} |`).join('\n');
  const laneRows = lanes.map((l) =>
    `| \`${l.id}\` | ${escMd(l.label || l.id)} | ${l.tier || '—'} | ${l.actorGroup || '—'} |`
  ).join('\n');

  return `${AUTO_MARKER('data/blueprints/' + meta.flowId + '.js')}

# ${meta.title || meta.flowId}

${meta.summary ? `> ${meta.summary}\n` : ''}
**Status:** ${meta.status || '—'}${meta.ownerPersonaId ? ` · **Owner:** ${wikilink('Persona-' + meta.ownerPersonaId)}` : ''}${meta.parent ? ` · **Parent:** ${wikilink('Blueprint-' + meta.parent)}` : ''}

${asList(meta.whatChanges).length ? `## What changes

${asList(meta.whatChanges).map((c) => `- ${c}`).join('\n')}

` : ''}## Phases

| ID | Label |
|---|---|
${phaseRows}

## Lanes

| ID | Label | Tier | Actor group |
|---|---|---|---|
${laneRows}

## Nodes

${nodes.length} node${nodes.length === 1 ? '' : 's'} across ${edges.length} edge${edges.length === 1 ? '' : 's'}.

${drillIns.length ? `## Drill-in points

${drillIns.map((n) => `- **${n.label}** (\`${n.phase}\` / \`${n.lane}\`) → ${wikilink('Blueprint-' + n.childBlueprintId)}`).join('\n')}

` : ''}${childFlows.length ? `## Sub-blueprints

${childFlows.map((f) => `- ${wikilink('Blueprint-' + f.meta.flowId, f.meta.title)}`).join('\n')}

` : ''}## Open the canvas

Service blueprints render via the React Flow canvas in \`examples/service-blueprint/\` (when included). Open the project in a browser and the canvas reads this flow's \`data/blueprints/${meta.flowId}.js\`.

## Related

- ${wikilink('Blueprints')} — index
- ${wikilink('Home')}
`;
}

function buildStoriesIndex(project) {
  const stories = project.stories || [];
  if (!stories.length) {
    return `${AUTO_MARKER('data/stories.js')}

# Stories

_No stories defined yet._
`;
  }
  const byKind = { jtbd: [], design: [], ac: [], other: [] };
  for (const s of stories) (byKind[s.kind] || byKind.other).push(s);

  function block(title, list) {
    if (!list.length) return '';
    return `## ${title}\n\n${list.map((s) => {
      const persona = s.personaId ? ` — ${wikilink('Persona-' + s.personaId)}` : '';
      const status = s.status ? ` · _${s.status}_` : '';
      return `- ${wikilink('Story-' + s.id, s.title)}${persona}${status}`;
    }).join('\n')}\n`;
  }

  return `${AUTO_MARKER('data/stories.js')}

# Stories

${stories.length} stor${stories.length === 1 ? 'y' : 'ies'}.

${block('Jobs to be done', byKind.jtbd)}
${block('Design stories', byKind.design)}
${block('Acceptance criteria', byKind.ac)}
${block('Other', byKind.other)}

> Edit the workbook \`stories\` tab + run \`npx nib-sync\`.
`;
}

function buildStoryPage(story) {
  return `${AUTO_MARKER('data/stories.js', `id=${story.id}`)}

# ${story.title}

**Kind:** ${story.kind || 'jtbd'}${story.status ? ` · **Status:** ${story.status}` : ''}${story.personaId ? ` · **Persona:** ${wikilink('Persona-' + story.personaId)}` : ''}

${story.summary || ''}

${asList(story.criteria).length ? `## Acceptance criteria

${asList(story.criteria).map((c) => `- ${c}`).join('\n')}

` : ''}${asList(story.pageIds).length ? `## Pages

${asList(story.pageIds).map((p) => `- \`${p}\``).join('\n')}

` : ''}## Related

- ${wikilink('Stories')} — back to index
- ${wikilink('Personas')}
`;
}

function buildTokensPage(project) {
  const tokens = project.tokens || {};
  const entries = Object.entries(tokens);
  return `${AUTO_MARKER('data/tokens.css')}

# Tokens

${entries.length ? `${entries.length} CSS variable override${entries.length === 1 ? '' : 's'}.

| Token | Value |
|---|---|
${entries.map(([k, v]) => `| \`${k}\` | \`${v}\` |`).join('\n')}` : '_No token overrides defined yet._'}

> Edit the workbook \`tokens\` tab + run \`npx nib-sync\`.
`;
}

function buildRegistriesPage(project) {
  const regs = project.registries || {};
  const names = Object.keys(regs);
  if (!names.length) return null;
  let body = '';
  for (const name of names) {
    const data = regs[name];
    const ids = Object.keys(data);
    body += `## \`${name}\`\n\n${ids.length} entr${ids.length === 1 ? 'y' : 'ies'}.\n\n`;
    if (ids.length) {
      const cols = new Set();
      for (const id of ids) for (const k of Object.keys(data[id])) cols.add(k);
      const colList = Array.from(cols);
      body += '| id | ' + colList.join(' | ') + ' |\n';
      body += '|' + ['---', ...colList.map(() => '---')].join('|') + '|\n';
      for (const id of ids) {
        body += `| \`${id}\` | ` + colList.map((c) => escMd(data[id][c] || '')).join(' | ') + ' |\n';
      }
      body += '\n';
    }
  }
  return `${AUTO_MARKER('data/registries/*.js')}

# Registries

${body}

> Edit \`_<name>\` tabs in the workbook + run \`npx nib-sync\`.
`;
}

// ── Stub pages (written once, never touched again) ─────────────────────────

function stubReadme(project) {
  return `${STUB_MARKER}

# ${(project.meta && project.meta.title) || 'Project'}

> One-paragraph pitch. What's the problem? Who's it for? What changes?

## Status

Where the project is right now.

## Quick start

How to run the prototype, who to ask, what to read first.

## Cross-reference

- ${wikilink('Home')} — the auto-generated index
- ${wikilink('Decisions')} — log of significant choices
`;
}

function stubDecisions() {
  return `${STUB_MARKER}

# Decisions

> Append-only log of significant project decisions. Each entry: date, decision, rationale, who/what was consulted.

| Date | Decision | Rationale | Affects |
|---|---|---|---|
| | | | |

## Format

\`\`\`
## YYYY-MM-DD — Short title

**Context:** what triggered the decision.
**Decision:** what we chose.
**Alternatives considered:** what we didn't choose, briefly.
**Trade-offs accepted:** what we're paying for the choice.
**Affects:** [[Page-Name]] / [[Persona-id]] / [[Blueprint-id]] (cross-link)
\`\`\`

## Related

- ${wikilink('Architecture')} — broader context for these decisions
- ${wikilink('Lessons-Learned')} — retrospective view
`;
}

function stubArchitecture() {
  return `${STUB_MARKER}

# Architecture

> The shape of the system this prototype models. Surfaces, integrations, data flow.

## Surfaces

Which platforms is this project rendered for, and which Nib surface CSS each page uses.

## Personas + roles

Who interacts where. Cross-link from ${wikilink('Personas')}.

## Data + integrations

Where data comes from, where it goes. Note any external systems and their boundaries.

## Open questions

Architecture decisions still being debated. Move to ${wikilink('Decisions')} once resolved.
`;
}

function stubGlossary() {
  return `${STUB_MARKER}

# Glossary

> Project-specific terminology. Words that mean something specific in this domain.

| Term | Definition |
|---|---|
| | |

## Conventions

How we name things in this project (page IDs, persona IDs, blueprint IDs).
`;
}

function stubLessons() {
  return `${STUB_MARKER}

# Lessons learned

> Retrospective notes — what surprised us, what we'd do differently, what to share with the next team.

## What worked

## What didn't

## Patterns to repeat

## Anti-patterns to avoid

## Cross-reference

- ${wikilink('Decisions')} — the calls we made
- ${wikilink('Architecture')} — what we built
`;
}

// ── Main ───────────────────────────────────────────────────────────────────

/**
 * @param {object} project Canonical project shape
 * @param {string} target Project root directory
 * @param {object} sourceMeta { kind, path|url, mtime }
 * @param {object} [opts]
 * @param {boolean} [opts.skipStubs] When true, don't write README/Decisions/
 *        Architecture/Glossary/Lessons-Learned stubs. Used by nib-sync's
 *        shadow-diff so hand-edited stubs in the project don't show up as
 *        drift. (Stubs are only ever created on initial scaffold.)
 * @returns {{ written: string[], stubs: string[] }}
 */
function emitWiki(project, target, sourceMeta = {}, opts = {}) {
  const written = [];
  const stubs = [];

  // Auto pages
  written.push(writeAutoPage(target, 'docs/Home.md', buildHome(project, sourceMeta)));
  written.push(writeAutoPage(target, 'docs/_Sidebar.md', buildSidebar(project)));
  written.push(writeAutoPage(target, 'docs/_Footer.md', buildFooter(project)));
  written.push(writeAutoPage(target, 'docs/Pages.md', buildPagesIndex(project)));
  written.push(writeAutoPage(target, 'docs/Personas.md', buildPersonasIndex(project)));
  written.push(writeAutoPage(target, 'docs/Blueprints.md', buildBlueprintsIndex(project)));
  written.push(writeAutoPage(target, 'docs/Stories.md', buildStoriesIndex(project)));
  written.push(writeAutoPage(target, 'docs/Tokens.md', buildTokensPage(project)));

  for (const persona of project.personas || []) {
    written.push(writeAutoPage(target, `docs/Persona-${persona.id}.md`, buildPersonaPage(persona, project)));
  }
  for (const story of project.stories || []) {
    written.push(writeAutoPage(target, `docs/Story-${story.id}.md`, buildStoryPage(story)));
  }
  for (const flow of Object.values(project.blueprints || {})) {
    written.push(writeAutoPage(target, `docs/Blueprint-${flow.meta.flowId}.md`, buildBlueprintPage(flow, project)));
  }

  const reg = buildRegistriesPage(project);
  if (reg) written.push(writeAutoPage(target, 'docs/Registries.md', reg));

  // Stub pages — only if missing, and only when caller wants them (skipped
  // by nib-sync to avoid spurious drift on hand-edited stubs).
  if (!opts.skipStubs) {
    const maybe = (rel, content) => {
      const w = writeStubIfMissing(target, rel, content);
      if (w) stubs.push(w);
    };
    maybe('docs/README.md', stubReadme(project));
    maybe('docs/Decisions.md', stubDecisions());
    maybe('docs/Architecture.md', stubArchitecture());
    maybe('docs/Glossary.md', stubGlossary());
    maybe('docs/Lessons-Learned.md', stubLessons());
  }

  return { written, stubs };
}

module.exports = { emitWiki, AUTO_MARKER, STUB_MARKER };
