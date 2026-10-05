import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Columns Split: full-bleed 50/50 split of a cover image and a colored
 * text panel. Authored as one row: [image | text panel] (either order).
 * A cell holding only a picture is the media half; the first text cell is
 * the panel. Further text cells are merged into the panel; empty cells and
 * rows are dropped. Without an image the panel spans the full width.
 * Options `teal`, `orange` and `clay` (panel colour; clay uses white text)
 * are purely presentational and handled in CSS.
 * @param {Element} block
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-split-row');
    let panel = null;
    let media = null;
    [...row.children].forEach((cell) => {
      const pic = cell.querySelector('picture');
      if (!media && pic && !cell.textContent.trim()) {
        media = cell;
        cell.className = 'columns-split-media';
        const img = pic.querySelector('img');
        if (img) {
          pic.replaceWith(createOptimizedPicture(img.src, img.alt, false, [
            { media: '(min-width: 900px)', width: '1200' },
            { width: '750' },
          ]));
        }
      } else if (cell.textContent.trim() || cell.children.length) {
        if (!panel) {
          panel = cell;
          cell.className = 'columns-split-panel';
          const inner = document.createElement('div');
          inner.className = 'columns-split-panel-inner';
          inner.append(...cell.childNodes);
          cell.append(inner);
        } else {
          panel.firstElementChild.append(...cell.childNodes);
          cell.remove();
        }
      } else {
        cell.remove();
      }
    });
    if (!row.children.length) row.remove();
    else if (!media) row.classList.add('columns-split-no-media');
  });
}
