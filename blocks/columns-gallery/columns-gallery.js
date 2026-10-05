import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Columns Gallery: events collage = CTA tile + thumbnail grid + tall photo.
 * Authored as one row: [CTA: heading + icon + link | several photos | one photo].
 * Cells are classified by content, not position:
 * - a cell with text is the CTA tile (its first link makes the whole tile clickable)
 * - a picture-only cell with 2+ pictures is the thumbnail grid
 * - a picture-only cell with a single picture is a feature photo
 * Empty cells are dropped; additional rows are handled the same way.
 * @param {Element} block
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-gallery-row');
    [...row.children].forEach((cell) => {
      const pictures = [...cell.querySelectorAll('picture')];
      const hasText = !!cell.textContent.trim();

      if (hasText) {
        cell.className = 'columns-gallery-cta';
        const link = cell.querySelector('a[href]');
        if (link) {
          link.classList.add('columns-gallery-cta-link');
          // plain links only: drop global button styling inside the tile
          link.classList.remove('button', 'primary', 'secondary', 'accent');
          const wrapper = link.closest('.button-wrapper, .button-container');
          if (wrapper) wrapper.classList.remove('button-wrapper', 'button-container');
          link.closest('p')?.classList.add('columns-gallery-cta-action');
          // label + decorative arrow icon laid out side by side, as on the source tile
          const label = document.createElement('span');
          label.className = 'columns-gallery-cta-label';
          label.append(...link.childNodes);
          const arrow = document.createElement('span');
          arrow.className = 'columns-gallery-cta-arrow';
          arrow.setAttribute('aria-hidden', 'true');
          link.replaceChildren(label, arrow);
        }
        cell.querySelectorAll('picture').forEach((pic) => {
          const p = pic.closest('p');
          if (p && !p.textContent.trim()) p.classList.add('columns-gallery-cta-icon');
        });
      } else if (pictures.length > 1) {
        cell.className = 'columns-gallery-grid';
        const grid = document.createElement('div');
        grid.className = 'columns-gallery-grid-inner';
        pictures.forEach((pic) => {
          const img = pic.querySelector('img');
          const item = document.createElement('div');
          item.className = 'columns-gallery-thumb';
          item.append(img
            ? createOptimizedPicture(img.src, img.alt, false, [{ width: '500' }])
            : pic);
          grid.append(item);
        });
        cell.replaceChildren(grid);
      } else if (pictures.length === 1) {
        cell.className = 'columns-gallery-feature';
        const img = pictures[0].querySelector('img');
        if (img) {
          cell.replaceChildren(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
        }
      } else {
        cell.remove();
      }
    });
    if (!row.children.length) row.remove();
  });
}
