/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-split. Base: columns.
 * Sources: https://www.ustanationalcampus.com/en/home/about/sponsors---partners.html ("Interested in joining us?", #92BFB7)
 *          https://www.ustanationalcampus.com/en/home/about/usta-national-campus-scholarship.html ("Application Deadlines", #DCDFCF)
 * Structure: 1 row, 2 cells: [image | text panel: H2 heading, H3 sub-headings, lists, paragraphs, strong button].
 * Option: `columns-split (teal)` when the instance background-color is #92BFB7, else `columns-split`.
 *
 * Source DOM: .cmp-container[style*=background-color] > .aem-Grid > div.container (x2):
 *   - media column: .cmp-container[data-desktop-background-image] (empty grid)  -> <img> cell
 *   - text column:  .cmp-container > .aem-Grid > div.text (+ optional div.button > a.cmp-button)
 * The first panel heading becomes H2; later headings (source H3/H5) become H3 (block CSS styles h2 / h3-h4).
 *
 * Program-detail template (adult-tennis #F0AA54, adult-red-ball #C15642, private-lessons #92BFB7,
 * adult-camps / junior-programming-welcome-letter / private-lessons #DCDFCF):
 *   - options `columns-split (orange)` (#F0AA54 / rgb(240,170,84)) and `columns-split (clay)`
 *     (#C15642 / rgb(193,86,66)); teal unchanged; other colours -> plain `columns-split`.
 *   - an .accordion in the text panel (private-lessons "Lesson Types") is flattened into the panel:
 *     each .cmp-accordion__item -> <h3>title</h3> + body; a div.table in a body -> bold header
 *     paragraph + <ul> of rows. Buttons ("Book Online", "Call To Book") and the trailing note stay
 *     in source order.
 */

function resolveImage(img) {
  if (!img) return null;
  const src = img.getAttribute('src') || '';
  if (!src || src.startsWith('data:')) {
    const holder = img.closest('[data-asset], [data-cmp-src]');
    const real = holder && (holder.getAttribute('data-asset') || holder.getAttribute('data-cmp-src'));
    if (real) img.setAttribute('src', real.replace('{.width}', ''));
  }
  const cur = img.getAttribute('src') || '';
  if (/\.svg$/i.test(cur) || /\/icon-[^/?#]*$/i.test(cur)) img.setAttribute('src', `${cur}?asset=image`);
  return img;
}

function backgroundUrl(container) {
  if (!container) return null;
  const data = container.getAttribute('data-desktop-background-image');
  if (data) return data;
  const m = (container.getAttribute('style') || '').match(/background-image:\s*url\(\s*(?:&quot;|["'])?([^"')&]+)/i);
  return m ? m[1] : null;
}

function isBlank(node) {
  return !node.textContent.replace(/ /g, ' ').trim() && !node.querySelector('img');
}

/** Own items of an AEM accordion component. */
function accordionItems(accordion) {
  const root = accordion.querySelector('.cmp-accordion') || accordion;
  return [...root.querySelectorAll('.cmp-accordion__item')]
    .filter((it) => it.parentElement.closest('.cmp-accordion') === root);
}

/**
 * div-based AEM responsive table (cannot nest in a block cell) ->
 * <p><strong>header cells</strong></p> + <ul> with one <li> per data row ("cell1 – cell2 …").
 */
function tableToList(table, document) {
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
  let rows = [...table.querySelectorAll('.aem-responsive-table__row')];
  let cellSel = ':scope > .aem-responsive-table__column';
  if (!rows.length) {
    rows = [...table.querySelectorAll('tr')];
    cellSel = ':scope > th, :scope > td';
  }
  const data = rows.map((r) => [...r.querySelectorAll(cellSel)].map((c) => clean(c.textContent)))
    .filter((cells) => cells.some(Boolean));
  if (!data.length) return [];
  const [header, ...body] = data;
  const p = document.createElement('p');
  const strong = document.createElement('strong');
  strong.textContent = header.filter(Boolean).join(' – ');
  p.append(strong);
  const out = [p];
  if (body.length) {
    const ul = document.createElement('ul');
    body.forEach((cells) => {
      const li = document.createElement('li');
      li.textContent = cells.filter(Boolean).join(' – ');
      ul.append(li);
    });
    out.push(ul);
  }
  return out;
}

function buttonNode(btn, document) {
  const a = document.createElement('a');
  a.href = btn.getAttribute('href');
  const label = btn.querySelector('.button-core__text-content') || btn;
  a.textContent = label.textContent.replace(/\s+/g, ' ').trim();
  const strong = document.createElement('strong');
  strong.append(a);
  const p = document.createElement('p');
  p.append(strong);
  return p;
}

export default function parse(element, { document }) {
  const grid = element.querySelector(':scope > .aem-Grid') || element;
  const columns = [...grid.children].filter((c) => !c.matches('[class*="aem-GridColumn--default--hide"], .separator'));

  let media = '';
  const panel = [];
  let headingCount = 0;

  const addText = (textComp) => {
    const root = textComp.querySelector('.cmp-text') || textComp;
    [...root.children].forEach((n) => {
      if (n.matches('.cmp-text__icon, .phe-block') && !n.querySelector('img')) return;
      if (isBlank(n)) return;
      n.removeAttribute('style');
      if (/^H[1-6]$/.test(n.tagName)) {
        const h = document.createElement(headingCount === 0 ? 'h2' : 'h3');
        h.textContent = n.textContent.replace(/\s+/g, ' ').trim();
        headingCount += 1;
        panel.push(h);
        return;
      }
      n.querySelectorAll('[style]').forEach((s) => s.removeAttribute('style'));
      n.querySelectorAll('img').forEach(resolveImage);
      panel.push(n);
    });
  };

  const walk = (gridEl) => {
    [...gridEl.children].forEach((c) => {
      if (c.matches('[class*="aem-GridColumn--default--hide"], .separator')) return;
      if (c.classList.contains('text')) addText(c);
      else if (c.classList.contains('button')) {
        const btn = c.querySelector('a.cmp-button[href], a[href]');
        if (btn) panel.push(buttonNode(btn, document));
      } else if (c.classList.contains('image') && !media) {
        media = resolveImage(c.querySelector('.cmp-image img, img')) || '';
      } else if (c.classList.contains('accordion')) {
        // private-lessons "Lesson Types": flatten each item into the panel as H3 title + body
        accordionItems(c).forEach((item) => {
          const t = item.querySelector(':scope > .cmp-accordion__header .cmp-accordion__title')
            || item.querySelector('.cmp-accordion__title');
          const title = t && t.textContent.replace(/\s+/g, ' ').trim();
          if (title) {
            const h = document.createElement('h3');
            h.textContent = title;
            headingCount += 1;
            panel.push(h);
          }
          const body = item.querySelector(':scope > .cmp-accordion__panel');
          if (body) walk(body);
        });
      } else if (c.classList.contains('table')) {
        panel.push(...tableToList(c, document));
      } else if (c.classList.contains('container')) {
        const g = c.querySelector(':scope > .cmp-container > .aem-Grid');
        if (g) walk(g);
      } else if (c.closest('.cmp-accordion__panel') && !c.matches('link, script, style')) {
        // accordion panel wrappers (e.g. div.responsivegrid without the .container class)
        walk(c);
      }
    });
  };

  columns.forEach((col) => {
    const bgContainer = col.querySelector(':scope > .cmp-container[data-desktop-background-image], :scope > .cmp-container[style*="background-image"]');
    if (!media && bgContainer && !bgContainer.querySelector('.text')) {
      const src = backgroundUrl(bgContainer);
      if (src) {
        const img = document.createElement('img');
        img.setAttribute('src', src);
        img.setAttribute('alt', '');
        media = resolveImage(img);
        return;
      }
    }
    if (col.classList.contains('text')) addText(col);
    else if (col.classList.contains('image') && !media) media = resolveImage(col.querySelector('img')) || '';
    else {
      const g = col.querySelector(':scope > .cmp-container > .aem-Grid');
      if (g) walk(g);
    }
  });

  if (!media && !panel.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const bg = ((element.getAttribute('style') || '').match(/background-color\s*:\s*([^;]+)/i) || [])[1] || '';
  const isTeal = /#92bfb7/i.test(bg.trim()) || /rgb\(\s*146\s*,\s*191\s*,\s*183\s*\)/i.test(bg);
  const isOrange = /#f0aa54/i.test(bg) || /rgba?\(\s*240\s*,\s*170\s*,\s*84\s*[,)]/i.test(bg);
  const isClay = /#c15642/i.test(bg) || /rgba?\(\s*193\s*,\s*86\s*,\s*66\s*[,)]/i.test(bg);
  let name = 'columns-split';
  if (isTeal) name = 'columns-split (teal)';
  else if (isOrange) name = 'columns-split (orange)';
  else if (isClay) name = 'columns-split (clay)';

  const block = WebImporter.Blocks.createBlock(document, { name, cells: [[media, panel]] });
  element.replaceWith(block);
}
