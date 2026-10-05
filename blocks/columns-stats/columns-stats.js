/**
 * Columns Stats: a row of statistic columns, each a large value + label.
 * Each cell: number (heading or strong) followed by a label paragraph.
 * Tolerates any number of cells/rows and cells without a distinct value element
 * (the first paragraph is then treated as the value).
 * @param {Element} block
 */
export default function decorate(block) {
  const firstRow = block.firstElementChild;
  const colCount = firstRow ? firstRow.children.length : 0;
  if (colCount) block.classList.add(`columns-stats-${colCount}-cols`);

  [...block.children].forEach((row) => {
    row.classList.add('columns-stats-row');
    [...row.children].forEach((cell) => {
      if (!cell.textContent.trim()) {
        cell.classList.add('columns-stats-empty');
        return;
      }
      cell.classList.add('columns-stats-item');

      // value: prefer a heading, otherwise a paragraph consisting only of <strong>
      let value = cell.querySelector('h1, h2, h3, h4, h5, h6');
      if (!value) {
        value = [...cell.querySelectorAll('p')].find((p) => {
          const strong = p.querySelector(':scope > strong');
          return strong && strong.textContent.trim() === p.textContent.trim();
        });
      }
      if (!value) value = cell.querySelector('p');
      if (value) value.classList.add('columns-stats-value');

      [...cell.children].forEach((child) => {
        if (child !== value) child.classList.add('columns-stats-label');
      });
    });
  });
}
