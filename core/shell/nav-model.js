/**
 * core/shell/nav-model.js — SECTIONS → navigation view-models. PURE.
 *
 * Canonical implementation of the page-matching / breadcrumb / drawer
 * logic from core/proto-nav.js (which keeps a classic-script copy for
 * file:// pages — keep them in sync). No DOM: every function takes data
 * and returns data, so a React (or any) binding just renders the result.
 *
 * SECTIONS schema (unchanged from project-data.js):
 *   [{ id, label, theme?, isGroup?, items: [{ file, label, type?, theme?,
 *      variant?, children?: [{ file, label, ... }] }] }]
 */

/** '/path/to/04-deal-room.html' → '04-deal-room' */
export function fileFromPath(pathname) {
  const filename = String(pathname || '').split('/').pop();
  return filename.replace(/\.html$/, '');
}

/**
 * JOURNEYS accepts array or keyed-object format; normalize to array.
 * (Object entries get their key as .id.) Pure version of proto-nav's
 * normalizeJourneys.
 */
export function normalizeJourneys(journeys) {
  if (!journeys) return [];
  if (Array.isArray(journeys)) return journeys;
  return Object.keys(journeys).map((key) => Object.assign({ id: key }, journeys[key], { id: key }));
}

/**
 * Find the page for a file stem. Returns
 * { section, sectionIndex, item, parentItem?, index, pageNum } or null.
 */
export function findPage(sections, file) {
  let pageNum = 1;
  for (let s = 0; s < (sections || []).length; s++) {
    const section = sections[s];
    if (!section.items) continue;
    for (let i = 0; i < section.items.length; i++) {
      const item = section.items[i];
      if (item.file === file) {
        return { section, sectionIndex: s, item, index: i, pageNum };
      }
      if (item.children) {
        for (let c = 0; c < item.children.length; c++) {
          if (item.children[c].file === file) {
            return { section, sectionIndex: s, item: item.children[c], parentItem: item, index: i, pageNum };
          }
        }
      }
      pageNum++;
    }
  }
  return null;
}

/**
 * Breadcrumb view-model: [{ label, href?, current? }].
 * Mirrors proto-nav's buildBreadcrumbs (section link → current page).
 */
export function breadcrumbs(sections, file, { rootLabel = 'Wireframes', rootHref = 'index.html' } = {}) {
  const page = findPage(sections, file);
  if (!page) return [{ label: rootLabel, current: true }];
  return [
    { label: page.section.label, href: rootHref },
    { label: page.item.label, current: true }
  ];
}

/**
 * Drawer view-model:
 *   { sitemap: { label, href }, groups: [{ label, items: [{ label, href,
 *     active, indent, badge? }] }] }
 * Mirrors proto-nav's buildDrawer section/item/children walk (framework
 * nav — examples/docs — is the static chrome's concern, not the shell's).
 */
export function drawerModel(sections, file, { sitemapHref = 'index.html', sitemapLabel = 'Sitemap' } = {}) {
  const groups = [];
  for (let s = 0; s < (sections || []).length; s++) {
    const section = sections[s];
    if (!section.items || !section.items.length) {
      if (section.isGroup) groups.push({ label: section.label, isGroup: true, items: [] });
      continue;
    }
    const items = [];
    for (let i = 0; i < section.items.length; i++) {
      const item = section.items[i];
      items.push({
        label: item.label,
        href: item.file + '.html',
        file: item.file,
        active: item.file === file,
        indent: 0
      });
      if (item.children) {
        for (let c = 0; c < item.children.length; c++) {
          const child = item.children[c];
          items.push({
            label: child.label,
            href: child.file + '.html',
            file: child.file,
            active: child.file === file,
            indent: 1
          });
        }
      }
    }
    groups.push({ label: section.label, isGroup: !!section.isGroup, items });
  }
  return { sitemap: { label: sitemapLabel, href: sitemapHref }, groups };
}

/**
 * Surface for a page from SECTIONS item .type ('sfdc' | 'slack' |
 * 'internal' | ...), falling back to the first typed section item.
 * Mirrors proto-nav's detectSurface without the markup sniffing (a React
 * shell states its surface; pass an explicit surface prop to override).
 */
export function detectSurface(sections, file) {
  const page = findPage(sections, file);
  if (page) return page.item.type || null;
  for (let s = 0; s < (sections || []).length; s++) {
    const items = sections[s].items || [];
    if (items.length && items[0].type) return items[0].type;
  }
  return null;
}
