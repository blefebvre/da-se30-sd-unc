/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-booking. Base: cards.
 * Source: https://www.ustanationalcampus.com/en/play/book-a-court.html
 * Structure (2 columns): each row = one court card
 *   [image | H3 title + price paragraph(s) + <p><strong><a>BOOK NOW</a></strong></p>].
 *
 * Source DOM: .cmp-container > .aem-Grid > children:
 *   - div.title (h1 "Book a Court")            -> default content BEFORE the block
 *   - div.separator (x3)                        -> dropped
 *   - div.tile.teaser (x4)                      -> one card each
 *       .cmp-teaser__image img, h4.cmp-teaser__title_scalable (visible title;
 *       h4.cmp-teaser__title_hidden is a duplicate), .cmp-teaser__description p,
 *       a.cmp-teaser__action-link (duplicated; first one used)
 *   - div.text (h4 "Hours of Availability:" + ul) -> default content AFTER the block
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

function isBlank(node) {
  return !node.textContent.replace(/ /g, ' ').trim() && !node.querySelector('img');
}

/** Collect the meaningful children of a .text / .title component. */
function textContentNodes(component) {
  const root = component.querySelector('.cmp-text, .cmp-title') || component;
  const nodes = [];
  [...root.children].forEach((n) => {
    if (n.matches('.cmp-text__icon, .phe-block') && !n.querySelector('img')) return;
    n.querySelectorAll('img').forEach(resolveImage);
    if (!isBlank(n)) nodes.push(n);
  });
  return nodes;
}

export default function parse(element, { document }) {
  const grid = element.querySelector(':scope > .aem-Grid') || element;
  const children = [...grid.children];

  const before = [];
  const after = [];
  const cells = [];

  children.forEach((child) => {
    if (child.classList.contains('teaser') || child.querySelector(':scope > .cmp-teaser')) {
      const teaser = child.querySelector('.cmp-teaser') || child;
      const img = resolveImage(teaser.querySelector('.cmp-teaser__image img, img'));

      const textCell = [];
      const titleSrc = teaser.querySelector('.cmp-teaser__title_scalable')
        || teaser.querySelector('.cmp-teaser__title:not(.cmp-teaser__title_hidden)')
        || teaser.querySelector('.cmp-teaser__title');
      if (titleSrc) {
        const h3 = document.createElement('h3');
        h3.textContent = titleSrc.textContent.replace(/\s+/g, ' ').trim();
        textCell.push(h3);
      }

      const desc = teaser.querySelector('.cmp-teaser__description');
      if (desc) {
        const paras = [...desc.querySelectorAll(':scope > p, :scope > ul, :scope > ol')];
        if (paras.length) {
          paras.forEach((p) => { if (!isBlank(p)) textCell.push(p); });
        } else if (!isBlank(desc)) {
          const p = document.createElement('p');
          p.textContent = desc.textContent.trim();
          textCell.push(p);
        }
      }

      const action = teaser.querySelector('a.cmp-teaser__action-link[href]');
      if (action) {
        const a = document.createElement('a');
        a.href = action.getAttribute('href');
        a.textContent = action.textContent.replace(/\s+/g, ' ').trim().toUpperCase();
        const strong = document.createElement('strong');
        strong.append(a);
        const p = document.createElement('p');
        p.append(strong);
        textCell.push(p);
      }

      if (img || textCell.length) cells.push([img || '', textCell]);
      return;
    }

    if (child.classList.contains('separator')) return;

    if (child.classList.contains('title') || child.classList.contains('text')) {
      const nodes = textContentNodes(child);
      (cells.length ? after : before).push(...nodes);
    }
  });

  if (!cells.length) {
    element.replaceWith(...before, ...after);
    return;
  }

  // program-detail camp-date tiles are 4/12 wide (3 per row); landing tiles are 3/12 (4 per row)
  const tiles = children.filter((c) => c.classList.contains('tile'));
  const three = tiles.length > 0 && tiles.every((c) => c.classList.contains('aem-GridColumn--default--4'));
  const name = three ? 'cards-booking (three)' : 'cards-booking';
  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  if (before.length) element.before(...before);
  if (after.length) element.after(...after);
  element.replaceWith(block);
}
