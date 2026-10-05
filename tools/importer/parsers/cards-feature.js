/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-feature. Base: cards.
 * Source: https://www.ustanationalcampus.com/en/home/about.html
 * Structure (2 columns): each row = one card [image | H2 heading + paragraph(s) + text link].
 *
 * Source DOM: .cmp-container > .aem-Grid > div.container (x4), one per card:
 *   - half-width cards (GridColumn--default--6): nested .aem-Grid > div.image (.cmp-image img) + div.text
 *   - full-width cards (GridColumn--default--12): nested .aem-Grid > div.container
 *       (.cmp-container[data-desktop-background-image], may carry mobile/tablet hide classes) + div.text
 * Output: consecutive half-width cards -> `cards-feature`; consecutive full-width cards ->
 *   `cards-feature (wide)`; blocks emitted in source order.
 */

function resolveImage(img) {
  if (!img) return null;
  const src = img.getAttribute('src') || '';
  if (!src || src.startsWith('data:')) {
    const holder = img.closest('[data-asset], [data-cmp-src]');
    const real = holder && (holder.getAttribute('data-asset') || holder.getAttribute('data-cmp-src'));
    if (real) img.setAttribute('src', real.replace('{.width}', ''));
  }
  const cur = img.getAttribute('src') || '';
  if (/\.svg$/i.test(cur) || /\/icon-[^/?#]*$/i.test(cur)) img.setAttribute('src', `${cur}?asset=image`);
  return img;
}

function backgroundImage(container, document) {
  if (!container) return null;
  let src = container.getAttribute('data-desktop-background-image');
  if (!src) {
    const m = (container.getAttribute('style') || '').match(/background-image:\s*url\((['"]|&quot;)?([^'")&]+)\1?\)/i);
    if (m) [, , src] = m;
  }
  if (!src) return null;
  const img = document.createElement('img');
  img.setAttribute('src', src);
  img.setAttribute('alt', '');
  return resolveImage(img);
}

function isBlank(node) {
  return !node.textContent.replace(/ /g, ' ').trim() && !node.querySelector('img');
}

function buildText(textComponent, document) {
  const root = textComponent.querySelector('.cmp-text') || textComponent;
  const out = [];
  [...root.children].forEach((n) => {
    if (n.matches('.cmp-text__icon, .phe-block') && !n.querySelector('img')) return;
    if (isBlank(n)) return;
    if (/^H[1-6]$/.test(n.tagName)) {
      const h2 = document.createElement('h2');
      h2.append(...n.childNodes);
      out.push(h2);
      return;
    }
    n.querySelectorAll('img').forEach(resolveImage);
    out.push(n);
  });
  return out;
}

export default function parse(element, { document }) {
  const grid = element.querySelector(':scope > .aem-Grid') || element;
  const cardEls = [...grid.children].filter((c) => c.classList.contains('container') && c.querySelector('.text'));

  const cards = cardEls.map((card) => {
    const inner = card.querySelector(':scope > .cmp-container > .aem-Grid') || card;
    const textComp = inner.querySelector(':scope > .text') || card.querySelector('.text');
    let img = resolveImage(inner.querySelector(':scope > .image .cmp-image img, :scope > .image img'));
    if (!img) {
      const bg = inner.querySelector(':scope > .container > .cmp-container[data-desktop-background-image], :scope > .container > .cmp-container[style*="background-image"]')
        || card.querySelector('.cmp-container[data-desktop-background-image]');
      img = backgroundImage(bg, document);
    }
    if (!img) img = resolveImage(card.querySelector('.cmp-image img'));
    const wide = !card.classList.contains('aem-GridColumn--default--6')
      && (card.classList.contains('aem-GridColumn--default--12') || !inner.querySelector(':scope > .image'));
    return { wide, row: [img || '', textComp ? buildText(textComp, document) : []] };
  }).filter(({ row }) => row[0] || row[1].length);

  if (!cards.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Group consecutive cards of the same width into one block each
  const groups = [];
  cards.forEach((c) => {
    const last = groups[groups.length - 1];
    if (last && last.wide === c.wide) last.cells.push(c.row);
    else groups.push({ wide: c.wide, cells: [c.row] });
  });

  const blocks = groups.map((g) => WebImporter.Blocks.createBlock(document, {
    name: g.wide ? 'cards-feature (wide)' : 'cards-feature',
    cells: g.cells,
  }));

  const block = blocks.shift();
  if (blocks.length) element.after(...blocks);
  element.replaceWith(block);
}
