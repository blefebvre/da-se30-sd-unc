import { createOptimizedPicture } from '../../scripts/aem.js';

const HEADINGS = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

/**
 * Cards Booking: grid of bookable court cards.
 * Each row = one card: [image | title + price paragraph(s) + CTA link].
 * The image cell is detected by content (a picture with no text), so authors
 * may swap cell order, omit the image, or add extra cells.
 * A bold/italic CTA link is buttonized globally; a plain trailing link is
 * promoted to a button here so every card keeps its BOOK NOW action.
 * Card body = leading heading(s), a description group (price text, carries the
 * short black rule) and an actions row pinned to the card bottom.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-booking-card';

    let imageCell = null;
    const body = document.createElement('div');
    body.className = 'cards-booking-card-body';

    [...row.children].forEach((cell) => {
      const pic = cell.querySelector('picture');
      if (!imageCell && pic && !cell.textContent.trim()) {
        imageCell = cell;
        imageCell.className = 'cards-booking-card-image';
      } else if (cell.textContent.trim() || cell.children.length) {
        while (cell.firstChild) body.append(cell.firstChild);
      }
    });

    if (!imageCell && !body.childNodes.length) return;

    // promote a lone trailing link paragraph to the card CTA
    const last = body.lastElementChild;
    if (last && last.tagName === 'P' && !last.classList.contains('button-wrapper')) {
      const a = last.querySelector(':scope > a[href]');
      if (a && last.children.length === 1 && last.textContent.trim() === a.textContent.trim()) {
        last.className = 'button-wrapper';
        a.className = 'button primary';
      }
    }

    // CTA paragraphs sit together at the bottom of the card
    const ctas = [...body.querySelectorAll(':scope > p.button-wrapper, :scope > p.button-container')];
    ctas.forEach((cta) => cta.remove());

    // everything after the leading heading(s) forms the description group
    const nodes = [...body.childNodes];
    const firstText = nodes.findIndex((n) => n.nodeType === Node.ELEMENT_NODE
      && !HEADINGS.includes(n.tagName));
    const descNodes = (firstText < 0 ? [] : nodes.slice(firstText))
      .filter((n) => n.nodeType === Node.ELEMENT_NODE || n.textContent.trim());
    if (descNodes.length) {
      const desc = document.createElement('div');
      desc.className = 'cards-booking-card-description';
      desc.append(...descNodes);
      body.append(desc);
    }

    if (ctas.length) {
      const actions = document.createElement('div');
      actions.className = 'cards-booking-card-actions';
      actions.append(...ctas);
      body.append(actions);
    }

    if (imageCell) li.append(imageCell);
    li.append(body);
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
    );
  });

  block.replaceChildren(ul);
}
