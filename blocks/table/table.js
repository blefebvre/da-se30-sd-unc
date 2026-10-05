/*
 * Table Block (Block Collection table)
 * https://www.aem.live/developer/block-collection/table
 * Row 1 = header cells (thead) unless the `no-header` option is set; the
 * following rows are data rows. Options (CSS): striped, bordered, no-header.
 * Rows shorter than the widest row are padded so columns stay aligned.
 */

/**
 * @param {Element} block
 */
export default async function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const header = !block.classList.contains('no-header');

  const rows = [...block.children].filter((row) => row.children.length);
  const columns = Math.max(0, ...rows.map((row) => row.children.length));

  rows.forEach((row, i) => {
    const isHead = i === 0 && header;
    const tr = document.createElement('tr');
    const cells = [...row.children];
    for (let c = 0; c < columns; c += 1) {
      const cell = document.createElement(isHead ? 'th' : 'td');
      if (isHead) cell.setAttribute('scope', 'col');
      if (cells[c]) cell.append(...cells[c].childNodes);
      tr.append(cell);
    }
    if (isHead) thead.append(tr);
    else tbody.append(tr);
  });

  // the CSS lays rows out as flex boxes (stacked on mobile), which drops the
  // implicit table semantics in some browsers; restore them explicitly.
  table.setAttribute('role', 'table');
  [thead, tbody].forEach((group) => group.setAttribute('role', 'rowgroup'));
  [...thead.children, ...tbody.children].forEach((tr) => {
    tr.setAttribute('role', 'row');
    [...tr.children].forEach((cell) => {
      cell.setAttribute('role', cell.tagName === 'TH' ? 'columnheader' : 'cell');
    });
  });

  if (thead.children.length) table.append(thead);
  table.append(tbody);
  block.replaceChildren(table);
}
