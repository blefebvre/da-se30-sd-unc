/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-icons. Base: cards.
 * Sources (program-detail template):
 *   - adult-red-ball "Community Drop-In Features" (icon + 2-line caption, 3 + 2 per row)
 *   - 2026-bnp-paribas-world-team-cup "Qualified Countries" flags (inside a tab section, 4 per row)
 *   - adult-tennis "Adult Tennis Pathway" (#aa-default-programs, text-only level cards)
 * Block model (blocks/cards-icons/README.md): N rows x 2 cells [image (optional) | caption].
 * Option: `cards-icons (four)` when the items are quarter-width (aem-GridColumn--default--3).
 *
 * Source DOM: .cmp-container > .aem-Grid > children:
 *   - item: div.container(.justify-content_space-around) > .cmp-container > .aem-Grid
 *       > div.image (.cmp-image img) + div.text (.cmp-text p...)       -> [img | caption]
 *     pathway items have no image: div.container.full-width (default--4) > div.text
 *       (h5 level + p lines with <b> group labels)                     -> ['' | caption]
 *   - non-item children (e.g. red-ball heading container default--8 with a text component)
 *       -> their text becomes default content BEFORE (or AFTER) the block
 *   - separators -> dropped
 */

const clean = (s) => (s || '').replace(/[\s ]+/g, ' ').trim();

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

function textNodes(component, document) {
  const root = component.querySelector('.cmp-text, .cmp-title') || component;
  const out = [];
  [...root.children].forEach((n) => {
    if (n.matches('.phe-block')) return;
    if (isBlank(n)) return;
    if (n.matches('.cmp-text__icon')) {
      const p = document.createElement('p');
      p.append(...n.childNodes);
      out.push(p);
      return;
    }
    n.removeAttribute('style');
    out.push(n);
  });
  return out;
}

function width(el) {
  const m = (el.getAttribute('class') || '').match(/aem-GridColumn--default--(\d+)/);
  return m ? parseInt(m[1], 10) : 12;
}

/** Collect text/title components (any depth, source order) of a non-item child. */
function looseText(el, document) {
  if (el.classList.contains('text') || el.classList.contains('title')) return textNodes(el, document);
  const out = [];
  el.querySelectorAll('.text, .title').forEach((t) => {
    if (!t.parentElement.closest('.text, .title')) out.push(...textNodes(t, document));
  });
  return out;
}

export default function parse(element, { document }) {
  const grid = element.querySelector(':scope > .aem-Grid') || element;
  const children = [...grid.children]
    .filter((c) => !c.matches('[class*="aem-GridColumn--default--hide"], .separator, link, script, style'));

  // items: space-around containers when present, else partial-width containers (pathway levels)
  let items = children.filter((c) => c.classList.contains('container') && c.classList.contains('justify-content_space-around') && width(c) < 12);
  if (!items.length) items = children.filter((c) => c.classList.contains('container') && width(c) < 12 && c.querySelector('.text, .image'));

  const before = [];
  const after = [];
  const cells = [];
  children.forEach((c) => {
    if (items.includes(c)) {
      const img = resolveImage(c.querySelector('.image .cmp-image img, .image img'));
      const caption = [];
      c.querySelectorAll('.text, .title').forEach((t) => {
        if (!t.parentElement.closest('.text, .title')) caption.push(...textNodes(t, document));
      });
      if (img || caption.length) cells.push([img || '', caption.length ? caption : '']);
      return;
    }
    const nodes = looseText(c, document);
    (cells.length ? after : before).push(...nodes);
  });

  if (!cells.length) {
    element.replaceWith(...before, ...after);
    return;
  }

  const four = items.length && items.every((c) => width(c) === 3);
  const name = four ? 'cards-icons (four)' : 'cards-icons';
  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  if (before.length) element.before(...before);
  if (after.length) element.after(...after);
  element.replaceWith(block);
}
