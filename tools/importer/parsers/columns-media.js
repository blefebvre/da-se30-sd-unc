/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-media. Base: columns.
 * Sources: https://www.ustanationalcampus.com/en/home/about.html ("Who, Why and What We Are"),
 *          https://www.ustanationalcampus.com/en/home/about/usta-national-campus-scholarship.html
 * Structure: 1 row, cells in source (desktop) order: [text: heading + paragraphs + strong button | image].
 *
 * Source DOM: .cmp-container > .aem-Grid > children:
 *   - div.container.container--full-width-deep-container (about only): icon div.image + div.text H2
 *       -> default content BEFORE the block (<p><img></p>, H2)
 *   - div.container (text column) > .cmp-container > .aem-Grid > div.text (+ optional div.button > a.cmp-button)
 *   - div.image (.cmp-image img; mobile/tablet-hidden, desktop-visible) -> image cell
 * Heading levels are kept as in source (about H3, scholarship H2).
 *
 * Program-detail template (junior-tennis-programs, junior-programming-welcome-letter, pickleball,
 * summer-camps, free30, 2026-bnp-paribas-world-team-cup, ...): when the grid also holds children
 * that are not part of the half-width pair (full-width aem-GridColumn--default--12 components,
 * .carousel, ...), the block is built only from the contiguous run of partial-width columns around
 * the .image (default--5/6) and its text/container partner (default--6/7). Grid children before
 * that run are moved, untouched, BEFORE the block; children after it AFTER the block. Cells keep
 * source desktop order (image left or right). A visible image caption (.cmp-image__title) is kept
 * as an italic paragraph after the block (the media cell must hold only the picture).
 */

function resolveImage(img) {
  if (!img) return null;
  const src = img.getAttribute('src') || '';
  if (!src || src.startsWith('data:')) {
    const holder = img.closest('[data-asset], [data-cmp-src]');
    const real = holder && (holder.getAttribute('data-asset') || holder.getAttribute('data-cmp-src'));
    if (real) img.setAttribute('src', real.replace('{.width}', ''));
  }
  // html2md turns *.svg (and icon-*) images into :icon: tokens; keep them as real images
  const cur = img.getAttribute('src') || '';
  if (/\.svg$/i.test(cur) || /\/icon-[^/?#]*$/i.test(cur)) {
    const holder = img.closest('[data-asset]');
    const asset = (holder && holder.getAttribute('data-asset')) || cur;
    img.setAttribute('src', `${asset}?asset=image`);
  }
  return img;
}

function isBlank(node) {
  return !node.textContent.replace(/ /g, ' ').trim() && !node.querySelector('img');
}

function textNodes(textComponent) {
  const root = textComponent.querySelector('.cmp-text') || textComponent;
  const out = [];
  [...root.children].forEach((n) => {
    if (n.matches('.cmp-text__icon, .phe-block') && !n.querySelector('img')) return;
    n.querySelectorAll('img').forEach(resolveImage);
    if (!isBlank(n)) out.push(n);
  });
  return out;
}

function buttonNode(btn, document) {
  const a = document.createElement('a');
  a.href = btn.getAttribute('href');
  const label = btn.querySelector('.button-core__text-content') || btn;
  a.textContent = label.textContent.replace(/\s+/g, ' ').trim();
  const strong = document.createElement('strong');
  strong.append(a);
  const p = document.createElement('p');
  p.append(strong);
  return p;
}

function imageParagraph(img, document) {
  const p = document.createElement('p');
  p.append(img);
  return p;
}

/** Walk a grid's components in order, collecting content into one cell. */
function collect(gridEl, document, out) {
  [...gridEl.children].forEach((c) => {
    if (c.matches('[class*="aem-GridColumn--default--hide"]')) return;
    if (c.classList.contains('text')) out.push(...textNodes(c));
    else if (c.classList.contains('button')) {
      const btn = c.querySelector('a.cmp-button[href], a[href]');
      if (btn) out.push(buttonNode(btn, document));
    } else if (c.classList.contains('image')) {
      const img = resolveImage(c.querySelector('.cmp-image img, img'));
      if (img) out.push(imageParagraph(img, document));
    } else if (c.classList.contains('container')) {
      const g = c.querySelector(':scope > .cmp-container > .aem-Grid');
      if (g) collect(g, document, out);
    }
  });
  return out;
}

function width(el) {
  const m = (el.getAttribute('class') || '').match(/aem-GridColumn--default--(\d+)/);
  return m ? parseInt(m[1], 10) : 12;
}

/** Partial-width image / text / container column that can form the image+text pair. */
function isPairPart(c) {
  return (c.classList.contains('image') || c.classList.contains('text') || c.classList.contains('container'))
    && !c.classList.contains('container--full-width-deep-container')
    && !c.matches('[class*="aem-GridColumn--default--hide"]')
    && width(c) < 12;
}

/** Visible image caption (.cmp-image__title) -> <p><em>caption</em></p> (kept after the block). */
function captionNode(imageComp, document) {
  const cap = imageComp.querySelector('.cmp-image__title');
  const text = cap && cap.textContent.replace(/\s+/g, ' ').trim();
  if (!text) return null;
  const em = document.createElement('em');
  em.textContent = text;
  const p = document.createElement('p');
  p.append(em);
  return p;
}

export default function parse(element, { document }) {
  const grid = element.querySelector(':scope > .aem-Grid') || element;
  const before = [];
  const cells = [];
  const captions = [];

  // Program-detail grids also hold full-width components (headings, policies, carousels,
  // separators) next to the image/text pair. Only then is the block limited to the contiguous
  // run of partial-width columns around the .image; the other grid children are moved, untouched,
  // before/after the block (so e.g. the carousel parser still processes its carousel).
  // Landing grids (pair + optional container--full-width-deep-container) keep the old behaviour.
  const kids = [...grid.children];
  let members = kids;
  const leadNodes = [];
  const trailNodes = [];
  const extras = kids.filter((c) => !c.classList.contains('separator')
    && !c.classList.contains('container--full-width-deep-container')
    && !c.matches('[class*="aem-GridColumn--default--hide"]')
    && !isPairPart(c));
  if (extras.length) {
    let imgIdx = kids.findIndex((c) => c.classList.contains('image') && isPairPart(c) && [5, 6].includes(width(c)));
    if (imgIdx < 0) imgIdx = kids.findIndex((c) => c.classList.contains('image') && isPairPart(c));
    if (imgIdx >= 0) {
      let start = imgIdx;
      let end = imgIdx;
      while (start > 0 && isPairPart(kids[start - 1])) start -= 1;
      while (end < kids.length - 1 && isPairPart(kids[end + 1])) end += 1;
      members = kids.slice(start, end + 1);
      leadNodes.push(...kids.slice(0, start));
      trailNodes.push(...kids.slice(end + 1));
    }
  }

  members.forEach((c) => {
    if (c.classList.contains('separator')) return;
    // desktop-hidden duplicates (normally removed by the cleanup transformer)
    if (c.matches('[class*="aem-GridColumn--default--hide"]')) return;
    if (c.classList.contains('container--full-width-deep-container')) {
      const g = c.querySelector(':scope > .cmp-container > .aem-Grid') || c;
      collect(g, document, before);
      return;
    }
    if (c.classList.contains('image')) {
      const img = resolveImage(c.querySelector('.cmp-image img, img'));
      if (img) cells.push(img);
      const cap = captionNode(c, document);
      if (cap) captions.push(cap);
      return;
    }
    const content = collect({ children: [c] }, document, []);
    if (content.length) cells.push(content);
  });

  if (!cells.length) {
    element.replaceWith(...leadNodes, ...before, ...trailNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media', cells: [cells] });
  if (leadNodes.length || before.length) element.before(...leadNodes, ...before);
  if (captions.length || trailNodes.length) element.after(...captions, ...trailNodes);
  element.replaceWith(block);
}
