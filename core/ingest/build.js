/**
 * Orchestrator: tabs (a dict of { tabName: rows }) → canonical project shape.
 * Adapter-agnostic. Adapters convert their input format to a tabs dict and
 * hand it here.
 */

const { classifyTab } = require('./util');
const {
  parseMetaTab,
  parsePagesTab,
  parseTokensTab,
  parsePersonasTab,
  parseStoriesTab,
  parseFlowTab,
  parseRegistryTab,
} = require('./parsers');

/**
 * @param {Record<string, Array<Array<any>>>} tabs
 * @param {object} [options]
 * @param {(msg: string) => void} [options.warn]
 * @returns {{ project: object, warnings: string[] }}
 */
function buildProject(tabs, options = {}) {
  const warnings = [];
  const warn = (msg) => {
    warnings.push(msg);
    if (options.warn) options.warn(msg);
  };

  const project = {
    meta: { title: 'Untitled Nib Project' },
    pages: [],
    tokens: {},
    personas: [],
    stories: [],
    blueprints: {},
    registries: {},
  };

  for (const [tabName, rows] of Object.entries(tabs)) {
    const kind = classifyTab(tabName);
    switch (kind) {
      case 'empty':
        continue;
      case 'meta':
        project.meta = parseMetaTab(rows, warn);
        break;
      case 'pages':
        project.pages = parsePagesTab(rows, warn);
        break;
      case 'tokens':
        project.tokens = parseTokensTab(rows);
        break;
      case 'personas':
        project.personas = parsePersonasTab(rows, warn);
        break;
      case 'stories':
        project.stories = parseStoriesTab(rows, warn);
        break;
      case 'registry': {
        const r = parseRegistryTab(tabName, rows, warn);
        if (r) project.registries[r.name] = r.data;
        break;
      }
      case 'flow':
      default: {
        const flow = parseFlowTab(tabName, rows, warn);
        if (flow) {
          delete flow._stats;
          project.blueprints[flow.meta.flowId] = flow;
        }
        break;
      }
    }
  }

  validateCrossReferences(project, warn);

  return { project, warnings };
}

/**
 * Light cross-tab validation. Only warns; never throws.
 */
function validateCrossReferences(project, warn) {
  const personaIds = new Set(project.personas.map((p) => p.id));
  const pageIds = new Set(project.pages.map((p) => p.id));
  const blueprintIds = new Set(Object.keys(project.blueprints));

  for (const page of project.pages) {
    if (page.parent && !pageIds.has(page.parent)) {
      warn(`page "${page.id}" references unknown parent "${page.parent}"`);
    }
    if (page.personaId && !personaIds.has(page.personaId)) {
      warn(`page "${page.id}" references unknown personaId "${page.personaId}"`);
    }
    if (page.blueprintId && !blueprintIds.has(page.blueprintId)) {
      warn(`page "${page.id}" references unknown blueprintId "${page.blueprintId}"`);
    }
  }

  for (const story of project.stories) {
    if (story.personaId && !personaIds.has(story.personaId)) {
      warn(`story "${story.id}" references unknown personaId "${story.personaId}"`);
    }
  }

  for (const [flowId, flow] of Object.entries(project.blueprints)) {
    if (flow.meta.parent && !blueprintIds.has(flow.meta.parent)) {
      warn(`blueprint "${flowId}" references unknown parent "${flow.meta.parent}"`);
    }
    if (flow.meta.ownerPersonaId && !personaIds.has(flow.meta.ownerPersonaId)) {
      warn(`blueprint "${flowId}" references unknown ownerPersonaId "${flow.meta.ownerPersonaId}"`);
    }
    for (const node of flow.nodes) {
      if (node.childBlueprintId && !blueprintIds.has(node.childBlueprintId)) {
        warn(`blueprint "${flowId}" node "${node.id}" references unknown childBlueprintId "${node.childBlueprintId}"`);
      }
    }
  }
}

module.exports = { buildProject };
