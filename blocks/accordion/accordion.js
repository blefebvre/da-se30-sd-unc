/*
 * Accordion Block (Block Collection accordion)
 * https://www.aem.live/developer/block-collection/accordion
 * Each row = one item: [title | body]. A row with only a title gets an empty
 * body; extra cells are merged into the body; empty rows are dropped.
 * Several items may be open at once (native details/summary).
 */

export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [label, ...bodyCells] = [...row.children];
    if (!label || (!label.textContent.trim() && !bodyCells.some((c) => c.textContent.trim()))) {
      row.remove();
      return;
    }

    // decorate accordion item label
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    const labelP = label.querySelector(':scope > p');
    summary.append(...(labelP && label.children.length === 1 ? labelP : label).childNodes);

    // decorate accordion item body
    const body = document.createElement('div');
    body.className = 'accordion-item-body';
    bodyCells.forEach((cell) => body.append(...cell.childNodes));

    // decorate accordion item
    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}
