/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-gallery. Base: columns.
 * Source: https://www.ustanationalcampus.com/en/home/about.html ("USTA National Campus Events")
 * Structure: 1 row, 3 cells:
 *   [CTA: H3 + calendar icon <p><img></p> + <p><a href=data-redirect-url>VIEW CALENDAR</a></p>
 *    | the thumbnail images | the tall photo (from data-desktop-background-image)].
 *
 * Source DOM: .cmp-container > .aem-Grid > children:
 *   - div.container.container--full-width-deep-container: icon div.image + div.text H2 -> default content BEFORE
 *   - div.text (intro paragraph)                                                      -> default content BEFORE
 *   - div.container > .cmp-container--clickable[data-redirect-url] > .aem-Grid:
 *       separators, div.text h3, div.image (calendar icon), div.text <p><b>VIEW CALENDAR</b></p>,
 *       div.image (arrow icon, decorative - dropped so the CTA keeps a single text link)
 *   - div.container > .cmp-container > .aem-Grid > div.image (x6)                    -> thumbnail cell
 *   - div.container > .cmp-container[data-desktop-background-image] (empty grid)     -> tall photo cell
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

function isHidden(c) {
  return c.matches('[class*="aem-GridColumn--default--hide"], .separator');
}

function textChildren(textComp) {
  const root = textComp.querySelector('.cmp-text') || textComp;
  return [...root.children].filter((n) => !(n.matches('.cmp-text__icon, .phe-block') && !n.querySelector('img')) && !isBlank(n));
}

function imageParagraph(img, document) {
  const p = document.createElement('p');
  p.append(img);
  return p;
}

function innerGrid(container) {
  return container.querySelector(':scope > .cmp-container > .aem-Grid');
}

function bgImage(container, document) {
  const holder = container.querySelector(':scope > .cmp-container[data-desktop-background-image], :scope > .cmp-container[style*="background-image"]');
  if (!holder) return null;
  let src = holder.getAttribute('data-desktop-background-image');
  if (!src) {
    const m = (holder.getAttribute('style') || '').match(/background-image:\s*url\(\s*(?:&quot;|["'])?([^"')&]+)/i);
    if (m) [, src] = m;
  }
  if (!src) return null;
  const img = document.createElement('img');
  img.setAttribute('src', src);
  img.setAttribute('alt', '');
  return resolveImage(img);
}

function buildCta(clickable, document) {
  const href = clickable.getAttribute('data-redirect-url');
  const grid = clickable.querySelector(':scope > .aem-Grid') || clickable;
  const cta = [];
  let linkAdded = false;
  [...grid.children].forEach((c) => {
    if (isHidden(c)) return;
    if (c.classList.contains('text')) {
      textChildren(c).forEach((n) => {
        if (/^H[1-6]$/.test(n.tagName)) {
          const h3 = document.createElement('h3');
          h3.textContent = n.textContent.replace(/\s+/g, ' ').trim();
          cta.push(h3);
        } else if (!linkAdded && href && !n.querySelector('a')) {
          // the bold label (e.g. VIEW CALENDAR) becomes the tile link
          const a = document.createElement('a');
          a.href = href;
          a.textContent = n.textContent.replace(/\s+/g, ' ').trim();
          const p = document.createElement('p');
          p.append(a);
          cta.push(p);
          linkAdded = true;
        } else {
          cta.push(n);
          if (n.querySelector('a')) linkAdded = true;
        }
      });
    } else if (c.classList.contains('image')) {
      // decorative arrow next to the link label is dropped (keeps one icon + one link)
      if (linkAdded) return;
      const img = resolveImage(c.querySelector('.cmp-image img, img'));
      if (img) cta.push(imageParagraph(img, document));
    }
  });
  if (!linkAdded && href) {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = href;
    const p = document.createElement('p');
    p.append(a);
    cta.push(p);
  }
  return cta;
}

export default function parse(element, { document }) {
  const grid = element.querySelector(':scope > .aem-Grid') || element;
  const before = [];
  const cells = [];

  [...grid.children].forEach((c) => {
    if (isHidden(c)) return;

    // Section heading (icon + H2) and intro text -> default content before the block
    if (c.classList.contains('container--full-width-deep-container')) {
      const g = innerGrid(c) || c;
      [...g.children].forEach((k) => {
        if (isHidden(k)) return;
        if (k.classList.contains('image')) {
          const img = resolveImage(k.querySelector('.cmp-image img, img'));
          if (img) before.push(imageParagraph(img, document));
        } else if (k.classList.contains('text')) {
          before.push(...textChildren(k));
        }
      });
      return;
    }
    if (c.classList.contains('text')) {
      if (cells.length) return; // no trailing text expected inside the gallery
      before.push(...textChildren(c));
      return;
    }
    if (!c.classList.contains('container')) return;

    const clickable = c.querySelector(':scope > .cmp-container--clickable[data-redirect-url]');
    if (clickable) {
      cells.push(buildCta(clickable, document));
      return;
    }

    const g = innerGrid(c);
    const thumbs = g ? [...g.querySelectorAll(':scope > .image')].filter((i) => !isHidden(i)) : [];
    if (thumbs.length) {
      const imgs = thumbs.map((i) => resolveImage(i.querySelector('.cmp-image img, img'))).filter(Boolean);
      if (imgs.length) cells.push(imgs.map((img) => imageParagraph(img, document)));
      return;
    }

    const tall = bgImage(c, document);
    if (tall) cells.push(tall);
  });

  if (!cells.length) {
    element.replaceWith(...before);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-gallery', cells: [cells] });
  if (before.length) element.before(...before);
  element.replaceWith(block);
}
