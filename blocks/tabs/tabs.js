import { toClassName, loadBlock } from '../../scripts/aem.js';

/*
 * Tabs (Block Collection tabs, extended).
 * Content model: each row = one tab [label | panel content (optional)].
 * Extra cells are merged into the panel; rows without a label are dropped.
 *
 * Section panels: DA cannot nest blocks in cells, so a panel may instead be
 * supplied by the sections that directly follow the tabs block's section and
 * carry Section Metadata "Tab" = <label> (section.dataset.tab). Their content
 * is moved into the matching panel (after any cell content), the emptied
 * section is removed and any blocks it held are loaded here. Labels match
 * case-insensitively; if a section's label matches no tab it falls back to
 * the tab at the position of its label among the distinct section labels.
 * Collection stops at the first following section without a "Tab" value.
 *
 * Options (CSS only): `pills` = centered pill buttons. The default (underline
 * strip) swaps to a native select below 768px, as on the source.
 */

let tabsCount = 0;

const normalize = (text) => (text || '').replace(/\s+/g, ' ').trim().toLowerCase();

/**
 * Collects the sections following the block's section that carry a Tab value.
 * @param {Element} block
 * @returns {Element[]}
 */
function getTabSections(block) {
  const section = block.closest('.section');
  if (!section || !section.parentElement) return [];
  const found = [];
  let next = section.nextElementSibling;
  while (next && next.classList.contains('section') && normalize(next.dataset.tab)) {
    // a section holding another tabs block starts its own tab group
    if (next.querySelector('div.tabs')) break;
    found.push(next);
    next = next.nextElementSibling;
  }
  return found;
}

/**
 * Moves tab sections into their panels and returns the blocks to load.
 * @param {Element} block
 * @param {{label: string, panel: Element}[]} items
 * @returns {Element[]}
 */
function adoptTabSections(block, items) {
  const sections = getTabSections(block);
  // distinct labels in order of appearance (several sections may share one)
  const labels = [...new Set(sections.map((s) => normalize(s.dataset.tab)))];
  const blocks = [];
  sections.forEach((section) => {
    const label = normalize(section.dataset.tab);
    let target = items.find((item) => item.label === label);
    if (!target) target = items[labels.indexOf(label)];
    if (!target) return; // no tab to receive it: leave the section on the page
    blocks.push(...section.querySelectorAll('div.block'));
    target.panel.append(...section.children);
    section.remove();
  });
  return blocks;
}

export default async function decorate(block) {
  tabsCount += 1;
  const prefix = `tabs-${tabsCount}`;

  // collect tab items from rows
  const items = [];
  const usedIds = new Set();
  [...block.children].forEach((row) => {
    const [labelCell, ...contentCells] = [...row.children];
    if (!labelCell || !labelCell.textContent.trim()) {
      row.remove();
      return;
    }
    let id = toClassName(labelCell.textContent) || 'tab';
    if (usedIds.has(id)) id = `${id}-${items.length + 1}`;
    usedIds.add(id);

    const panel = document.createElement('div');
    panel.className = 'tabs-panel';
    panel.id = `${prefix}-panel-${id}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `${prefix}-tab-${id}`);
    panel.tabIndex = 0;
    contentCells.forEach((cell) => {
      if (cell.textContent.trim() || cell.children.length) {
        const content = document.createElement('div');
        content.className = 'tabs-panel-content';
        content.append(...cell.childNodes);
        panel.append(content);
      }
    });

    items.push({
      id,
      label: normalize(labelCell.textContent),
      labelCell,
      panel,
    });
    row.remove();
  });

  if (!items.length) return;

  // build tablist + mobile select
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');

  const select = document.createElement('select');
  select.className = 'tabs-select';
  select.setAttribute('aria-label', 'Select a tab');

  const buttons = [];
  const activate = (index, focus = false) => {
    items.forEach((item, i) => {
      const selected = i === index;
      buttons[i].setAttribute('aria-selected', selected);
      buttons[i].tabIndex = selected ? 0 : -1;
      item.panel.hidden = !selected;
      item.panel.setAttribute('aria-hidden', !selected);
    });
    select.selectedIndex = index;
    if (focus) buttons[index].focus();
  };

  items.forEach((item, i) => {
    const button = document.createElement('button');
    button.className = 'tabs-tab';
    button.id = `${prefix}-tab-${item.id}`;
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', item.panel.id);
    const p = item.labelCell.querySelector(':scope > p');
    button.innerHTML = (p && item.labelCell.children.length === 1 ? p : item.labelCell).innerHTML;
    button.addEventListener('click', () => activate(i));
    button.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowRight') next = (i + 1) % items.length;
      else if (e.key === 'ArrowLeft') next = (i - 1 + items.length) % items.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = items.length - 1;
      if (next !== null) {
        e.preventDefault();
        activate(next, true);
      }
    });
    buttons.push(button);
    tablist.append(button);

    const option = document.createElement('option');
    option.value = String(i);
    option.textContent = item.labelCell.textContent.trim();
    select.append(option);
  });
  select.addEventListener('change', () => activate(Number(select.value)));

  const panels = document.createElement('div');
  panels.className = 'tabs-panels';
  panels.append(...items.map((item) => item.panel));

  block.replaceChildren(select, tablist, panels);

  // sections tagged with Section Metadata "Tab" become panel content
  const nestedBlocks = adoptTabSections(block, items);

  activate(0);

  if (nestedBlocks.length) {
    await Promise.all(nestedBlocks.map((nested) => loadBlock(nested)));
  }
}
