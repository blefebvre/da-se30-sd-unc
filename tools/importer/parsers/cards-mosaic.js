/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-mosaic. Base: cards.
 * Sources: https://www.ustanationalcampus.com/en/home.html (home template) and the landing
 * template (events.html: 2 mosaics, play/programs.html).
 * Structure (2 columns): each row = one tile [image | heading + optional text + link].
 *   Row 1: featured tile (H2), other tiles H3. Image-less tile -> empty image cell (solid tile).
 *
 * Source DOM: nested AEM responsive grid. Each image tile is a
 * div.cmp-container(.cmp-container--clickable) carrying the image as an inline CSS
 * background (data-desktop-background-image) in the live DOM, or as a direct-child
 * <img> in scraped copies, and the link as data-redirect-url. The heading sits in a
 * nested overlay .cmp-container. Desktop-hidden alternates (phone/tablet copies) sit under
 * a column with class aem-GridColumn--default--hide and are skipped.
 *
 * Tiles are keyed on headings: the first heading inside a tile root (image container,
 * else outermost clickable container, else the heading's own container) is the tile
 * heading; further headings in the same root are secondary lines (dates -> bold
 * paragraph; a heading inside a nested clickable container -> the tile CTA link, e.g.
 * "BOOK NOW"). Tile description paragraphs and AEM buttons (a.cmp-button) are kept.
 */

const HIDDEN_COL = '[class*="aem-GridColumn--default--hide"]';

function isDesktopHidden(node, root) {
  let n = node;
  while (n && n !== root) {
    if (n.matches && n.matches(HIDDEN_COL)) return true;
    n = n.parentElement;
  }
  return false;
}

function bgSrc(el) {
  let src = el.getAttribute('data-desktop-background-image');
  if (!src) {
    const style = el.getAttribute('style') || '';
    const m = style.match(/background-image:\s*url\(\s*(['"]?)(.*?)\1\s*\)/i);
    if (m) src = m[2].replace(/&quot;/g, '');
  }
  return src || null;
}

// Nearest ancestor .cmp-container (inside root) that carries the tile image
function findImageContainer(heading, root) {
  let c = heading.parentElement ? heading.parentElement.closest('.cmp-container') : null;
  while (c && c !== root && root.contains(c)) {
    if (c.querySelector(':scope > img, :scope > picture') || bgSrc(c)) return c;
    c = c.parentElement ? c.parentElement.closest('.cmp-container') : null;
  }
  return null;
}

// Outermost clickable container (inside root) around the node
function findClickable(node, root) {
  let found = null;
  let c = node.parentElement ? node.parentElement.closest('.cmp-container--clickable') : null;
  while (c && c !== root && root.contains(c)) {
    found = c;
    c = c.parentElement ? c.parentElement.closest('.cmp-container--clickable') : null;
  }
  return found;
}

const norm = (s) => (s || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

export default function parse(element, { document }) {
  const headings = [...element.querySelectorAll('h1, h2, h3, h4, h5, h6')]
    .filter((h) => h.textContent.trim() && !isDesktopHidden(h, element));

  // Group headings into tiles
  const tiles = [];
  const seen = new Set();
  headings.forEach((h) => {
    const owner = tiles.find((t) => t.root && t.root !== element && t.root.contains(h) && t.heading !== h);
    if (owner) {
      // same text as the tile heading = duplicate copy -> ignore; otherwise secondary line
      if (norm(owner.heading.textContent) !== norm(h.textContent)) owner.secondary.push(h);
      return;
    }
    const imageContainer = findImageContainer(h, element);
    const textTile = h.closest('.cmp-container');
    let key = imageContainer || textTile || h;
    // Solid tiles (no image): group by the outermost container below the column grid
    // that has only this tile's content, so duplicate headings in one tile collapse.
    if (!imageContainer && textTile && textTile !== element) {
      const parentTile = textTile.parentElement ? textTile.parentElement.closest('.cmp-container') : null;
      if (parentTile && parentTile !== element && seen.has(parentTile)) key = parentTile;
    }
    if (seen.has(key)) return;
    seen.add(key);
    const clickable = imageContainer ? null : findClickable(h, element);
    tiles.push({
      heading: h,
      imageContainer,
      tile: imageContainer || textTile || h.parentElement,
      root: imageContainer || clickable || textTile,
      secondary: [],
    });
  });

  if (!tiles.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = tiles.map(({ heading, imageContainer, tile, root, secondary }, index) => {
    // Image cell
    let imageCell = '';
    if (imageContainer) {
      const existing = imageContainer.querySelector(':scope > picture, :scope > img');
      if (existing) {
        imageCell = existing;
      } else {
        const img = document.createElement('img');
        img.src = bgSrc(imageContainer);
        img.alt = heading.textContent.trim();
        imageCell = img;
      }
    }

    // Normalize heading level: featured tile H2, other tiles H3
    let tileHeading = heading;
    const level = index === 0 ? 'H2' : 'H3';
    if (heading.tagName !== level) {
      tileHeading = document.createElement(level);
      tileHeading.append(...heading.childNodes);
    }

    const textCell = [tileHeading];
    const scope = root || tile;
    const redirectEl = (imageContainer && imageContainer.closest('[data-redirect-url]'))
      || heading.closest('[data-redirect-url]');
    const redirect = redirectEl && redirectEl.getAttribute('data-redirect-url');

    // Secondary heading lines (date line / nested clickable CTA heading)
    let ctaFromHeading = false;
    secondary.forEach((h) => {
      const text = norm(h.textContent);
      const nestedClickable = h.closest('.cmp-container--clickable[data-redirect-url]');
      const p = document.createElement('p');
      if (nestedClickable && nestedClickable !== redirectEl && !h.querySelector('a')) {
        const a = document.createElement('a');
        a.href = nestedClickable.getAttribute('data-redirect-url');
        a.textContent = text;
        p.append(a);
        ctaFromHeading = true;
      } else {
        const strong = document.createElement('strong');
        strong.textContent = text;
        p.append(strong);
      }
      textCell.push(p);
    });

    // Description paragraphs of the tile text
    if (scope) {
      [...scope.querySelectorAll('.cmp-text > p')]
        .filter((p) => !isDesktopHidden(p, element) && norm(p.textContent) && !p.querySelector('a.cmp-button'))
        .forEach((p) => textCell.push(p));
    }

    // CTA: first visible link in the tile outside heading/paragraphs; otherwise link the heading
    const cta = ctaFromHeading ? null : [...tile.querySelectorAll('a[href]')]
      .find((a) => !heading.contains(a) && !isDesktopHidden(a, element) && a.textContent.trim()
        && !textCell.some((n) => n.contains && n.contains(a)));
    if (cta) {
      const p = document.createElement('p');
      p.append(cta);
      textCell.push(p);
    } else if (!ctaFromHeading && !tileHeading.querySelector('a') && redirect) {
      const a = document.createElement('a');
      a.href = redirect;
      a.textContent = tileHeading.textContent.trim();
      tileHeading.replaceChildren(a);
    }
    return [imageCell, textCell];
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-mosaic', cells });
  element.replaceWith(block);
}
