/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-logos. Base: cards.
 * Source: https://www.ustanationalcampus.com/en/home/about/sponsors---partners.html
 * Structure (2 columns): each row = one partner [logo image | <a href>partner name</a>].
 *
 * Source DOM: .cmp-container > .aem-Grid > div.container (x17) >
 *   .cmp-container.cmp-container--clickable[data-redirect-url] > .aem-Grid > div.image > .cmp-image img
 * Iteration is keyed on the block-level div.container grid columns (not on anchors).
 * Partner name: img alt, else .cmp-image[data-title], else the redirect URL hostname.
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

function hostLabel(url) {
  try {
    return new URL(url, 'https://www.ustanationalcampus.com').hostname.replace(/^www\./, '');
  } catch (e) {
    return url;
  }
}

export default function parse(element, { document }) {
  const grid = element.querySelector(':scope > .aem-Grid') || element;
  let items = [...grid.children].filter((c) => c.querySelector('.cmp-image img, img'));
  if (!items.length) items = [...element.querySelectorAll('.image')];

  const cells = [];
  items.forEach((item) => {
    const img = resolveImage(item.querySelector('.cmp-image img, img'));
    if (!img) return;
    const holder = img.closest('.cmp-image');
    const redirectEl = item.matches('[data-redirect-url]') ? item : item.querySelector('[data-redirect-url]');
    const anchor = item.querySelector('a[href]');
    const href = (redirectEl && redirectEl.getAttribute('data-redirect-url'))
      || (anchor && anchor.getAttribute('href'));

    const alt = (img.getAttribute('alt') || '').trim();
    const title = holder ? (holder.getAttribute('data-title') || '').trim() : '';
    const name = alt || title || (href ? hostLabel(href) : '');
    if (!alt && name) img.setAttribute('alt', name);

    let linkCell = '';
    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = name || href;
      linkCell = a;
    }
    cells.push([img, linkCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-logos', cells });
  element.replaceWith(block);
}
