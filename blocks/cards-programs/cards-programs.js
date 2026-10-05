import { createOptimizedPicture } from '../../scripts/aem.js';

const HEADINGS = 'h1, h2, h3, h4, h5, h6';

/**
 * Image-less tile whose only content is a heading (typically a link),
 * e.g. "Book a Court at the USTA National Campus".
 */
function isHeadingTile(imageCell, body) {
  if (imageCell) return false;
  const els = [...body.children];
  return els.length === 1 && els[0].matches(HEADINGS);
}

/**
 * Event card: body starts with a date line (<p><strong>…</strong></p>)
 * followed by a heading, and carries no links.
 */
function isEventCard(body) {
  const first = body.firstElementChild;
  if (!first || first.tagName !== 'P' || body.querySelector('a')) return false;
  const strong = first.querySelector(':scope > strong');
  if (!strong || first.textContent.trim() !== strong.textContent.trim()) return false;
  return !!first.nextElementSibling?.matches(HEADINGS);
}

/**
 * A heading authored with a trailing <br> renders an extra blank line on the
 * source (it is followed by &nbsp;); keep that line so card heights match.
 * @returns {boolean} true when a blank line was added
 */
function padTrailingBreak(heading) {
  if (!heading) return false;
  let last = heading.lastChild;
  while (last && last.nodeType === Node.TEXT_NODE && !last.textContent.trim()) {
    last = last.previousSibling;
  }
  if (last?.nodeName !== 'BR') return false;
  last.after('\u00a0');
  return true;
}

/**
 * Cards Programs: grid of program cards.
 * Each row = one card: [image | title + description + link].
 * A card whose body carries a button CTA (bold link, buttonized by
 * decorateButtons) is treated as a promo card: its image is a logo
 * (contained, not cropped) and its content is centered.
 * An image-less card holding only a heading is a solid brand tile
 * (.cards-programs-tile). Cards that open with a bold date line and carry
 * no links are event cards (.cards-programs-event); a block made only of
 * event cards gets .cards-programs-events.
 * Tolerates missing image cells and extra cells.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-programs-card';

    let imageCell = null;
    const body = document.createElement('div');
    body.className = 'cards-programs-card-body';

    [...row.children].forEach((cell) => {
      const pic = cell.querySelector('picture');
      if (!imageCell && pic && !cell.textContent.trim()) {
        imageCell = cell;
        imageCell.className = 'cards-programs-card-image';
      } else if (cell.textContent.trim() || cell.children.length) {
        while (cell.firstChild) body.append(cell.firstChild);
      }
    });

    if (imageCell) li.append(imageCell);
    if (body.childNodes.length) li.append(body);
    if (!li.children.length) return;

    if (body.querySelector('a.button, strong > a, em > a')) {
      li.classList.add('cards-programs-promo');
    } else if (isHeadingTile(imageCell, body)) {
      li.classList.add('cards-programs-tile');
    } else if (isEventCard(body)) {
      li.classList.add('cards-programs-event');
      const date = body.firstElementChild;
      date.classList.add('cards-programs-card-date');
      const title = date.nextElementSibling;
      // the title's own trailing blank line replaces the gap before the meta line
      if (!padTrailingBreak(title)) {
        title.nextElementSibling?.classList.add('cards-programs-card-meta');
      }
    }

    ul.append(li);
  });

  const cards = [...ul.children];
  if (cards.length && cards.every((li) => li.classList.contains('cards-programs-event'))) {
    block.classList.add('cards-programs-events');
  }

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
    );
  });

  block.replaceChildren(ul);
}
