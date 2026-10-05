/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-stats. Base: columns.
 * Source: https://www.ustanationalcampus.com/en/home.html
 * Structure: 1 row, N columns (4 on the home page); each cell = value heading (H2) + label paragraph.
 * Source DOM: .cmp-container > .aem-Grid > div.aem-GridColumn--default--3 (x4), each holding
 * a .cmp-text with <h2>value</h2> and <h5>label</h5> (label sometimes wrapped in <b>).
 * The label H5 is converted to a <p> to match the block content model (number + label paragraph).
 */
export default function parse(element, { document }) {
  // Primary: direct grid columns; fallback: every .cmp-text containing a heading
  let columns = [...element.querySelectorAll(':scope > .aem-Grid > .aem-GridColumn')]
    .filter((col) => col.querySelector('h1, h2, h3, h4, h5, h6'));
  if (!columns.length) {
    columns = [...element.querySelectorAll('.cmp-text')]
      .filter((t) => t.querySelector('h1, h2, h3, h4, h5, h6'));
  }

  const cells = columns.map((col) => {
    const headings = [...col.querySelectorAll('h1, h2, h3, h4, h5, h6')]
      .filter((h) => h.textContent.trim());
    const value = headings[0];
    const cell = [];
    if (value) cell.push(value);
    headings.slice(1).forEach((h) => {
      const p = document.createElement('p');
      p.textContent = h.textContent.trim();
      cell.push(p);
    });
    // Any plain label paragraphs (alternative authoring)
    col.querySelectorAll('.cmp-text p').forEach((p) => {
      if (p.textContent.trim()) cell.push(p);
    });
    return cell;
  }).filter((cell) => cell.length);

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-stats', cells: [cells] });
  element.replaceWith(block);
}
