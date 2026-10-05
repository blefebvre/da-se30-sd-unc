import { createOptimizedPicture } from '../../scripts/aem.js';

/* wide: one card per row spanning the container (default: two per row) */
const OPTION_CLASSES = ['wide'];

/**
 * Cards Feature: teaser cards with a small square thumbnail beside the text.
 * Each row = one card: [image | heading + paragraph(s) + text link].
 * The image cell is detected by content (picture, no text) so authors may
 * swap cell order, omit the image or add extra cells.
 * @param {Element} block
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-feature-card';

    let imageCell = null;
    const body = document.createElement('div');
    body.className = 'cards-feature-card-body';

    [...row.children].forEach((cell) => {
      const pic = cell.querySelector('picture');
      if (!imageCell && pic && !cell.textContent.trim()) {
        imageCell = cell;
        imageCell.className = 'cards-feature-card-image';
      } else if (cell.textContent.trim() || cell.children.length) {
        while (cell.firstChild) body.append(cell.firstChild);
      }
    });

    if (!imageCell && !body.childNodes.length) return;
    if (imageCell) li.append(imageCell);
    else li.classList.add('cards-feature-card-no-image');
    if (body.childNodes.length) li.append(body);
    ul.append(li);
  });

  const width = active.includes('wide') ? '400' : '300';
  ul.querySelectorAll('.cards-feature-card-image picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width }]),
    );
  });

  block.replaceChildren(ul);
}
