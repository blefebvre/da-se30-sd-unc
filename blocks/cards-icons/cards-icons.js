import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Cards Icons: centered, borderless grid of icon/flag/text items.
 * Each row = one item: [image/icon (optional) | caption]. The image cell is
 * detected by content (a picture with no text), so authors may omit it (the
 * item becomes text-only), leave it empty, swap the cell order or add extra
 * caption cells (merged). Empty rows are dropped.
 * Option `four` (4 per row instead of 3) is handled in CSS.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    let image = null;
    const body = document.createElement('div');
    body.className = 'cards-icons-card-body';

    [...row.children].forEach((cell) => {
      const pic = cell.querySelector('picture');
      if (!image && pic && !cell.textContent.trim()) {
        image = cell;
        image.className = 'cards-icons-card-image';
      } else if (cell.textContent.trim() || cell.querySelector('img, a')) {
        body.append(...cell.childNodes);
      }
    });

    if (!image && !body.textContent.trim() && !body.querySelector('img')) return;

    const li = document.createElement('li');
    li.className = 'cards-icons-card';
    if (image) li.append(image);
    else li.classList.add('cards-icons-card-text-only');
    if (body.childNodes.length) li.append(body);
    ul.append(li);
  });

  ul.querySelectorAll('.cards-icons-card-image picture > img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]);
    // keep authored intrinsic size so small icons are not upscaled
    const optimizedImg = optimized.querySelector('img');
    ['width', 'height'].forEach((attr) => {
      if (img.getAttribute(attr)) optimizedImg.setAttribute(attr, img.getAttribute(attr));
    });
    img.closest('picture').replaceWith(optimized);
  });

  block.replaceChildren(ul);
}
