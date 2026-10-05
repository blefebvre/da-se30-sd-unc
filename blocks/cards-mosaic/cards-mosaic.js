import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Cards Mosaic: image tiles with overlaid heading + link.
 * Each row = one tile: [image | heading + link]. The first row is the featured
 * (large) tile. A row with an empty/missing image cell renders as a solid tile.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row, index) => {
    const li = document.createElement('li');
    li.className = 'cards-mosaic-tile';
    if (index === 0) li.classList.add('cards-mosaic-featured');

    let imageCell = null;
    const body = document.createElement('div');
    body.className = 'cards-mosaic-body';

    [...row.children].forEach((cell) => {
      const pic = cell.querySelector('picture');
      if (!imageCell && pic && !cell.textContent.trim()) {
        imageCell = cell;
        imageCell.className = 'cards-mosaic-image';
      } else if (cell.textContent.trim() || cell.children.length) {
        while (cell.firstChild) body.append(cell.firstChild);
      }
    });

    if (imageCell) li.append(imageCell);
    else li.classList.add('cards-mosaic-no-image');
    if (body.childNodes.length) li.append(body);

    // the first heading link acts as the tile's primary link
    const headingLink = body.querySelector('h1 a, h2 a, h3 a, h4 a, h5 a, h6 a');
    if (headingLink) li.classList.add('cards-mosaic-linked');

    // a standalone link paragraph outside headings is the tile CTA (e.g. "SHOW ME").
    // On a solid (no-image) tile it renders as a dark bottom strip link instead.
    body.querySelectorAll(':scope > p').forEach((p) => {
      const a = p.querySelector(':scope > a, :scope > strong > a, :scope > em > a');
      if (!a || p.textContent.trim() !== a.textContent.trim()) return;
      if (!imageCell) {
        p.classList.add('cards-mosaic-strip');
        li.classList.add('cards-mosaic-has-strip');
        return;
      }
      p.classList.add('button-wrapper');
      a.classList.add('button', 'primary');
      li.classList.add('cards-mosaic-has-cta');
      const icon = a.querySelector('picture, img');
      if (icon) {
        icon.classList.add('cards-mosaic-button-icon');
        a.classList.add('cards-mosaic-button-with-icon');
      }
    });

    // remaining paragraphs: an all-bold line (event date) or description text
    body.querySelectorAll(':scope > p:not(.button-wrapper, .cards-mosaic-strip)').forEach((p) => {
      const strong = p.querySelector(':scope > strong, :scope > b');
      if (strong && p.children.length === 1 && p.textContent.trim() === strong.textContent.trim()) {
        p.classList.add('cards-mosaic-date');
      } else if (p.textContent.trim()) {
        li.classList.add('cards-mosaic-has-text');
      }
    });

    // all-caps headings (e.g. "COLLEGIATE") render as small semibold labels
    const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
    const headingText = heading ? heading.textContent.trim() : '';
    if (index > 0 && /[A-Z]/.test(headingText) && headingText === headingText.toUpperCase()) {
      li.classList.add('cards-mosaic-label');
    }

    if (li.children.length) ul.append(li);
  });

  // tiles with descriptions switch to the content-rich layout (events, programs)
  const tiles = [...ul.children];
  if (tiles.some((li, i) => i > 0 && li.classList.contains('cards-mosaic-has-text'))) {
    block.classList.add('cards-mosaic-rich');
    // featured + two full-height tiles (no 2x2 grid)
    if (tiles.length === 3) block.classList.add('cards-mosaic-trio');
  }

  ul.querySelectorAll('picture > img').forEach((img) => {
    if (img.closest('a')) return; // keep inline button icons as authored
    const featured = img.closest('.cards-mosaic-featured');
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: featured ? '1200' : '750' }]),
    );
  });

  block.replaceChildren(ul);
}
