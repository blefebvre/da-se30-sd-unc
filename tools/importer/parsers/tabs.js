/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs. Base: tabs.
 * Sources (program-detail template): adult-tennis, junior-tennis-programs, pickleball, play-padel,
 *   summer-camps (inline panels); adult-camps, meet-our-team, high-performance,
 *   2026-bnp-paribas-world-team-cup (section panels).
 * Block model (blocks/tabs/README.md): N rows x 2 cells [label | panel content (optional)];
 *   panels holding nested blocks are supplied by following sections with Section Metadata "Tab".
 * Option: `tabs (pills)` when the source has core-tabs__button-styled (pill buttons), else `tabs`.
 *
 * Source DOM: div.core-tabs > div.cmp-tabs
 *   - ol.cmp-tabs__tablist > li.cmp-tabs__tab > span.cmp-tabs__title   -> labels
 *   - div.cmp-tabs__tabpanel (one per tab, same order)                 -> panels
 *     panel > div.container > .cmp-container > .aem-Grid > AEM components (text, button, image,
 *     accordion, tile.teaser, carousel, embed, table, container ...)
 *
 * Modes:
 *   INLINE  - no panel holds a nested component (accordion/tile/carousel/embed/iframetext/table/
 *             image/core-tabs): one row per tab [label | text content + buttons + images].
 *   SECTION - otherwise: rows are [label] only; after the block, per panel: <hr>, the panel's
 *             content MOVED (same DOM nodes, so the accordion / cards-booking / cards-icons /
 *             carousel parsers that run later still find their elements), then
 *             Section Metadata { Tab: label }. A closing <hr> is added only when meaningful content
 *             follows the tabs element before the next section break.
 */

const NESTED = '.accordion, .tile, .carousel, .embed, .iframetext, div.table, .image, .core-tabs';

const clean = (s) => (s || '').replace(/[\s ]+/g, ' ').trim();

function resolveImage(img) {
  if (!img) return null;
  const src = img.getAttribute('src') || '';
  if (!src || src.startsWith('data:') || src.startsWith('blob:')) {
    const holder = img.closest('[data-asset], [data-cmp-src]');
    const real = holder && (holder.getAttribute('data-asset') || holder.getAttribute('data-cmp-src'));
    if (real) img.setAttribute('src', real.replace('{.width}', ''));
  }
  const cur = img.getAttribute('src') || '';
  if (/\.svg$/i.test(cur) || /\/icon-[^/?#]*$/i.test(cur)) img.setAttribute('src', `${cur}?asset=image`);
  return img;
}

function isBlank(node) {
  return !clean(node.textContent) && !(node.querySelector && node.querySelector('img'));
}

function buttonNode(btn, document) {
  const text = clean((btn.querySelector('.button-core__text-content, .cmp-button__text') || btn).textContent);
  const href = btn.getAttribute('href');
  if (!text || !href) return null;
  const a = document.createElement('a');
  a.href = href;
  a.textContent = text;
  const strong = document.createElement('strong');
  strong.append(a);
  const p = document.createElement('p');
  p.append(strong);
  return p;
}

/** Meaningful children of a .text / .title component (headings keep their level). */
function textNodes(component, document) {
  const root = component.querySelector('.cmp-text, .cmp-title') || component;
  const out = [];
  [...root.children].forEach((n) => {
    if (n.matches('.phe-block')) return;
    if (isBlank(n)) return;
    n.querySelectorAll('img').forEach(resolveImage);
    // empty inline formatting (e.g. <i><b><br><br></b></i>) -> keep only the line breaks
    n.querySelectorAll('b, strong, i, em, u').forEach((f) => {
      if (!clean(f.textContent) && !f.querySelector('img')) f.replaceWith(...f.childNodes);
    });
    if (n.matches('.cmp-text__icon')) {
      // stray inline content parsed into the icon placeholder
      const p = document.createElement('p');
      p.append(...n.childNodes);
      out.push(p);
      return;
    }
    out.push(n);
  });
  return out;
}

/** Walk a panel's components in source order (INLINE mode). */
function collect(root, document, out) {
  [...root.children].forEach((c) => {
    if (c.matches('[class*="aem-GridColumn--default--hide"], .separator, link, script, style, noscript, .phe-block')) return;
    if (c.classList.contains('text') || c.classList.contains('title')) {
      out.push(...textNodes(c, document));
    } else if (c.classList.contains('button')) {
      const btn = c.querySelector('a.cmp-button[href], a[href]');
      const p = btn && buttonNode(btn, document);
      if (p) out.push(p);
    } else if (c.matches('a.cmp-button')) {
      const p = buttonNode(c, document);
      if (p) out.push(p);
    } else if (c.tagName === 'IMG') {
      out.push(resolveImage(c));
    } else {
      collect(c, document, out);
    }
  });
  return out;
}

/** True when text, an image, a table or an iframe follows `node` (document order) before the next <hr>. */
function contentFollows(node, document) {
  const root = document.querySelector('#mainContent') || document.body;
  if (!root.contains(node)) return false;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.nodeType === 1 && n.matches('script, style, noscript, template, link')
      ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  let last = node;
  while (last.lastChild) last = last.lastChild;
  walker.currentNode = last;
  let n = walker.nextNode();
  while (n) {
    if (n.nodeType === 3) {
      if (clean(n.textContent)) return true;
    } else if (n.tagName === 'HR') {
      if (!n.closest('.cmp-separator, .separator')) return false;
    } else if (n.matches('img, picture, table, iframe, video')) {
      return true;
    }
    n = walker.nextNode();
  }
  return false;
}

export default function parse(element, { document }) {
  const tabs = element.querySelector('.cmp-tabs') || element;
  const own = (el) => el.closest('.cmp-tabs') === tabs || (tabs === element && !el.closest('.cmp-tabs'));

  const tabEls = [...tabs.querySelectorAll('.cmp-tabs__tablist .cmp-tabs__tab')].filter(own);
  const panels = [...tabs.querySelectorAll('.cmp-tabs__tabpanel')].filter(own);
  const labels = panels.map((panel, i) => {
    const tab = tabEls[i];
    const fromTab = tab && clean((tab.querySelector('.cmp-tabs__title') || tab).textContent);
    return fromTab || clean(panel.getAttribute('data-title')) || clean(tab && tab.getAttribute('data-title')) || `Tab ${i + 1}`;
  });

  if (!panels.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const name = element.classList.contains('core-tabs__button-styled') ? 'tabs (pills)' : 'tabs';
  const sectionMode = panels.some((panel) => panel.querySelector(NESTED));

  if (!sectionMode) {
    const cells = panels.map((panel, i) => {
      const content = collect(panel, document, []);
      return [labels[i], content.length ? content : ''];
    });
    const block = WebImporter.Blocks.createBlock(document, { name, cells });
    element.replaceWith(block);
    return;
  }

  // SECTION mode: label-only rows; panel content becomes following "Tab" sections
  const cells = labels.map((label) => [label]);
  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  const following = [];
  panels.forEach((panel, i) => {
    following.push(document.createElement('hr'));
    // Panel content is MOVED (not cloned). The wrapper keeps the `.cmp-tabs` ancestry so
    // template selectors that exclude tab content (`:not(.cmp-tabs .container)`) still do;
    // html2md unwraps the div.
    const wrapper = document.createElement('div');
    wrapper.className = 'cmp-tabs';
    wrapper.append(...panel.childNodes);
    wrapper.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => { if (isBlank(h)) h.remove(); });
    following.push(wrapper);
    following.push(WebImporter.Blocks.createBlock(document, {
      name: 'Section Metadata',
      cells: { Tab: labels[i] },
    }));
  });
  element.replaceWith(block);
  block.after(...following);
  const lastMeta = following[following.length - 1];
  if (contentFollows(lastMeta, document)) lastMeta.after(document.createElement('hr'));
}
