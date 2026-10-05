/* eslint-disable */
/* global WebImporter */
/**
 * Parser for table. Base: table.
 * Sources (program-detail template): davebailey (5 pricing tables "Number of Players | 2027 Price
 *   Per Player"); private-lessons tables sit inside an accordion and are flattened by the
 *   columns-split / accordion parsers (they are disconnected before this parser runs).
 * Block model (blocks/table/README.md): N rows x M cells, first row = header.
 * Option: `table (striped)` when the source table is shaded (alternate row shading), else `table`.
 *
 * Source DOM: div.table > div.aem-responsive-table(.aem-responsive-table--shaded)
 *   > div.aem-responsive-table__row(--shaded) > div.aem-responsive-table__column
 *   > div > div.cmp-text > p (header cells hold <p><b>…</b></p>).
 * Fallback: a real <table> (tr > th/td).
 */

const clean = (s) => (s || '').replace(/[\s ]+/g, ' ').trim();

function isBlank(node) {
  return !clean(node.textContent) && !(node.querySelector && node.querySelector('img'));
}

/** Cell content: the cell's text-component children (keeps bold/links), else its text. */
function cellContent(cell, document) {
  const texts = [...cell.querySelectorAll('.cmp-text')];
  const out = [];
  texts.forEach((root) => {
    [...root.children].forEach((n) => {
      if (n.matches('.phe-block') || isBlank(n)) return;
      if (n.matches('.cmp-text__icon')) {
        const p = document.createElement('p');
        p.append(...n.childNodes);
        out.push(p);
        return;
      }
      out.push(n);
    });
  });
  if (out.length) return out.length === 1 && out[0].tagName === 'P' ? [...out[0].childNodes] : out;
  const t = clean(cell.textContent);
  return t || '';
}

export default function parse(element, { document }) {
  let rows = [...element.querySelectorAll('.aem-responsive-table__row')];
  let cellSel = ':scope > .aem-responsive-table__column';
  if (!rows.length) {
    rows = [...element.querySelectorAll('tr')];
    cellSel = ':scope > th, :scope > td';
  }

  let cells = rows
    .map((r) => [...r.querySelectorAll(cellSel)].map((c) => cellContent(c, document)))
    .filter((r) => r.some((c) => (Array.isArray(c) ? c.length : c)));

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // equal cell count per row
  const cols = Math.max(...cells.map((r) => r.length));
  cells = cells.map((r) => (r.length < cols ? [...r, ...Array(cols - r.length).fill('')] : r));

  const striped = !!element.querySelector('.aem-responsive-table--shaded, .aem-responsive-table__row--shaded');
  const name = striped ? 'table (striped)' : 'table';
  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);
}
