import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Columns Media: text beside an image inside the content container.
 * Authored as one row with two cells: [text | image] (either order).
 * Cells holding only a picture become the media column; every other
 * non-empty cell is a text column. Extra rows are laid out the same way,
 * empty cells are dropped.
 *
 * Source behaviour (ustanationalcampus.com):
 * - text only (no CTA): image is desktop-only, text top-aligned with it.
 * - text with a CTA: image stacks above the text on mobile/tablet, the
 *   columns are vertically centred on desktop and the CTA is a centred
 *   black pill. Flagged with `columns-media-has-cta` on the block.
 * @param {Element} block
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-media-row');
    [...row.children].forEach((cell) => {
      const pic = cell.querySelector('picture');
      if (pic && !cell.textContent.trim()) {
        cell.className = 'columns-media-image';
        const img = pic.querySelector('img');
        if (img) {
          pic.replaceWith(createOptimizedPicture(img.src, img.alt, false, [
            { media: '(min-width: 900px)', width: '1200' },
            { width: '750' },
          ]));
        }
      } else if (cell.textContent.trim() || cell.children.length) {
        cell.className = 'columns-media-text';
        // CTA = a paragraph decorateButtons turned into a button (bold/italic link)
        const cta = cell.querySelector('.button-wrapper, .button-container');
        if (cta) {
          cta.classList.add('columns-media-cta');
          block.classList.add('columns-media-has-cta');
        }
      } else {
        cell.remove();
      }
    });
    if (!row.children.length) row.remove();
    else if (row.children.length === 1) row.classList.add('columns-media-single');
  });
}
