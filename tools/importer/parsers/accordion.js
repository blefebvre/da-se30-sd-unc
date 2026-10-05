/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion. Base: accordion.
 * Sources (program-detail template): davebailey (offerings), free30 (FAQ), adult-camps (camp
 *   schedules, inside tab sections), adult-tennis, pickleball, play-padel, private-lessons,
 *   save-my-play, summer-camps.
 * Block model (blocks/accordion/README.md): N rows x 2 cells [title | body].
 *
 * Source DOM: div.accordion.panelcontainer > div.cmp-accordion > div.cmp-accordion__item (each):
 *   - h4.cmp-accordion__header > button > span.cmp-accordion__title       -> title cell (text)
 *   - div.cmp-accordion__panel > AEM components (text, button, image, container, table)
 *       text component children (p, ul/ol, headings, links) are kept as-is,
 *       a.cmp-button -> <p><strong><a>label</a></strong></p>, images resolved,
 *       div.table (div-based .aem-responsive-table) cannot nest in a cell -> bold header
 *       paragraph + <ul> with one <li> per data row ("cell1 – cell2 …").
 * An accordion nested in an already-processed accordion is flattened into the body.
 */

const clean = (s) => (s || '').replace(/[\s ]+/g, ' ').trim();

function resolveImage(img) {
  if (!img) return null;
  const src = img.getAttribute('src') || '';
  if (!src || src.startsWith('data:') || src.startsWith('blob:')) {
    const holder = img.closest('[data-asset], [data-cmp-src]');
    const real = holder && (holder.getAttribute('data-asset') || holder.getAttribute('data-cmp-src'));
    if (real) img.setAttribute('src', real.replace('{.width}', ''));
  }
  const cur = img.getAttribute('src') || '';
  if (/\.svg$/i.test(cur) || /\/icon-[^/?#]*$/i.test(cur)) img.setAttribute('src', `${cur}?asset=image`);
  return img;
}

function isBlank(node) {
  return !clean(node.textContent) && !(node.querySelector && node.querySelector('img'));
}

function buttonNode(btn, document) {
  const text = clean((btn.querySelector('.button-core__text-content, .cmp-button__text') || btn).textContent);
  const href = btn.getAttribute('href');
  if (!text || !href) return null;
  const a = document.createElement('a');
  a.href = href;
  a.textContent = text;
  const strong = document.createElement('strong');
  strong.append(a);
  const p = document.createElement('p');
  p.append(strong);
  return p;
}

function textNodes(component, document) {
  const root = component.querySelector('.cmp-text, .cmp-title') || component;
  const out = [];
  [...root.children].forEach((n) => {
    if (n.matches('.phe-block')) return;
    if (isBlank(n)) return;
    n.querySelectorAll('img').forEach(resolveImage);
    if (n.matches('.cmp-text__icon')) {
      const p = document.createElement('p');
      p.append(...n.childNodes);
      out.push(p);
      return;
    }
    out.push(n);
  });
  return out;
}

/** div-based AEM responsive table -> array of rows of cell texts. */
function tableRows(table) {
  let rows = [...table.querySelectorAll('.aem-responsive-table__row')];
  let cellSel = ':scope > .aem-responsive-table__column';
  if (!rows.length) {
    rows = [...table.querySelectorAll('tr')];
    cellSel = ':scope > th, :scope > td';
  }
  return rows
    .map((r) => [...r.querySelectorAll(cellSel)].map((c) => clean(c.textContent)))
    .filter((cells) => cells.some(Boolean));
}

/** Table that cannot be nested in a block cell -> <p><strong>header</strong></p> + <ul>. */
function tableToList(table, document) {
  const rows = tableRows(table);
  if (!rows.length) return [];
  const out = [];
  const [header, ...data] = rows;
  const p = document.createElement('p');
  const strong = document.createElement('strong');
  strong.textContent = header.filter(Boolean).join(' – ');
  p.append(strong);
  out.push(p);
  if (data.length) {
    const ul = document.createElement('ul');
    data.forEach((cells) => {
      const li = document.createElement('li');
      li.textContent = cells.filter(Boolean).join(' – ');
      ul.append(li);
    });
    out.push(ul);
  }
  return out;
}

function ownItems(accordion) {
  const root = accordion.querySelector('.cmp-accordion') || accordion;
  return [...root.querySelectorAll('.cmp-accordion__item')]
    .filter((it) => it.parentElement.closest('.cmp-accordion') === root
      || (root === accordion && !it.parentElement.closest('.cmp-accordion')));
}

function itemTitle(item) {
  const t = item.querySelector(':scope > .cmp-accordion__header .cmp-accordion__title')
    || item.querySelector('.cmp-accordion__title')
    || item.querySelector('.cmp-accordion__button');
  return clean(t && t.textContent);
}

/** Walk panel components in source order. */
function collect(root, document, out) {
  [...root.children].forEach((c) => {
    if (c.matches('[class*="aem-GridColumn--default--hide"], .separator, link, script, style, noscript, .phe-block')) return;
    if (c.classList.contains('text') || c.classList.contains('title')) {
      out.push(...textNodes(c, document));
    } else if (c.classList.contains('table')) {
      out.push(...tableToList(c, document));
    } else if (c.classList.contains('accordion')) {
      ownItems(c).forEach((item) => {
        const title = itemTitle(item);
        if (title) {
          const p = document.createElement('p');
          const strong = document.createElement('strong');
          strong.textContent = title;
          p.append(strong);
          out.push(p);
        }
        const panel = item.querySelector(':scope > .cmp-accordion__panel');
        if (panel) collect(panel, document, out);
      });
    } else if (c.classList.contains('button')) {
      const btn = c.querySelector('a.cmp-button[href], a[href]');
      const p = btn && buttonNode(btn, document);
      if (p) out.push(p);
    } else if (c.matches('a.cmp-button')) {
      const p = buttonNode(c, document);
      if (p) out.push(p);
    } else if (c.classList.contains('image')) {
      const img = resolveImage(c.querySelector('.cmp-image img, img'));
      if (img) {
        const p = document.createElement('p');
        p.append(img);
        out.push(p);
      }
    } else {
      collect(c, document, out);
    }
  });
  return out;
}

export default function parse(element, { document }) {
  const items = ownItems(element);
  const cells = [];
  items.forEach((item) => {
    const title = itemTitle(item);
    const panel = item.querySelector(':scope > .cmp-accordion__panel') || item.querySelector('.cmp-accordion__panel');
    const body = panel ? collect(panel, document, []) : [];
    if (!title && !body.length) return;
    cells.push([title, body.length ? body : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(block);
}
