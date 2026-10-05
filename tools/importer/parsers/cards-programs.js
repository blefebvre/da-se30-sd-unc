/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-programs. Base: cards.
 * Sources: https://www.ustanationalcampus.com/en/home.html (home template); landing template:
 *   play.html, events.html, calendar.html (event cards: H6 date + H4 title + location -> bold date
 *   line + H3 title + paragraph; image-less promo tile = linked heading only).
 * Structure (2 columns): each row = one card [image | H3 title + description + link].
 *   Promo card ("GET STARTED WITH A FREE 30"): [logo | heading + text + <strong>link</strong>] (strong -> button).
 *
 * Source DOM: #aa-default-programs.cmp-container > .aem-Grid > children:
 *   - div.text (default content: icon + <h2>Programs</h2>) -> moved BEFORE the block, kept outside it
 *   - div.container.responsivegrid (x8) -> one card each: .cmp-image img + .cmp-text (h5, p, a)
 *   - div.separator -> ignored
 *   - ad container (h4.adTitle / skipAd / iframe) -> ignored (also removed by cleanup transformer)
 * Lazy AEM images: src may be a data: placeholder; the real path is in .cmp-image[data-asset] / [data-cmp-src].
 */

function resolveImage(img) {
  if (!img) return null;
  const src = img.getAttribute('src') || '';
  if (!src || src.startsWith('data:')) {
    const holder = img.closest('[data-asset], [data-cmp-src]');
    let real = holder && (holder.getAttribute('data-asset') || holder.getAttribute('data-cmp-src'));
    if (real) {
      real = real.replace('{.width}', '');
      img.setAttribute('src', real);
    }
  }
  // html2md turns images whose file name starts with "icon-" into :icon: tokens,
  // which would drop the promo logo picture. Prefer the DAM asset path and add a
  // query string so the file is imported as a regular image.
  const cur = img.getAttribute('src') || '';
  if (/\/icon-[^/?#]*$/i.test(cur)) {
    const holder = img.closest('[data-asset]');
    const asset = (holder && holder.getAttribute('data-asset')) || cur;
    img.setAttribute('src', `${asset}?asset=image`);
  }
  return img;
}

function isAd(node) {
  return !!node.querySelector('.cmp-experiencefragment--ros-ad-experience-fragment, h4.adTitle, a.skipAd, iframe, [id^="google_ads"]');
}

export default function parse(element, { document }) {
  const grid = element.querySelector(':scope > .aem-Grid') || element;
  const children = [...grid.children];

  // Cards: container columns that hold a heading and are not the ad slot (event/program cards)
  const cardEls = children.filter((c) => c.classList.contains('container')
    && c.querySelector('h2, h3, h4, h5, h6')
    && !isAd(c));
  const lastCardIndex = cardEls.length ? children.indexOf(cardEls[cardEls.length - 1]) : -1;

  // Default content (section heading) stays outside the block: text before the cards goes
  // before the block, text after the last card (e.g. a closing note) goes after it
  const defaultContent = [];
  const trailingContent = [];
  children
    .filter((c) => c.classList.contains('text'))
    .forEach((c) => {
      const target = lastCardIndex >= 0 && children.indexOf(c) > lastCardIndex ? trailingContent : defaultContent;
      const text = c.querySelector('.cmp-text') || c;
      [...text.children].forEach((n) => {
        if (n.matches('.cmp-text__icon') && !n.querySelector('img')) return;
        const img = n.matches('img') ? n : null;
        if (img) resolveImage(img);
        n.querySelectorAll('img').forEach(resolveImage);
        if (n.textContent.trim() || n.querySelector('img') || img) target.push(n);
      });
    });

  const cells = cardEls.map((card) => {
    const img = resolveImage(card.querySelector('.cmp-image img, img.cmp-image__image, picture img, img'));
    const isPromo = !!card.querySelector('a.cmp-button');

    const textCell = [];
    // Title = the most prominent heading (lowest level); with several headings (event cards:
    // H6 date line + H4 title) the other headings become bold paragraph lines around it
    const textHeadings = [...card.querySelectorAll('.cmp-text h2, .cmp-text h3, .cmp-text h4, .cmp-text h5, .cmp-text h6')]
      .filter((h) => h.textContent.trim());
    const headingSrc = (textHeadings.length > 1
      ? textHeadings.reduce((best, h) => (h.tagName < best.tagName ? h : best), textHeadings[0])
      : textHeadings[0])
      || card.querySelector('h2, h3, h4, h5, h6');
    textHeadings.forEach((h) => {
      if (h === headingSrc) {
        const h3 = document.createElement('h3');
        h3.append(...h.childNodes);
        textCell.push(h3);
      } else {
        const strong = document.createElement('strong');
        strong.textContent = h.textContent.replace(/\s+/g, ' ').trim();
        const p = document.createElement('p');
        p.append(strong);
        textCell.push(p);
      }
    });
    if (headingSrc && !textHeadings.includes(headingSrc)) {
      const h3 = document.createElement('h3');
      h3.append(...headingSrc.childNodes);
      textCell.push(h3);
    }

    // Description + link paragraphs (skip &nbsp;-only spacers)
    card.querySelectorAll('.cmp-text p').forEach((p) => {
      if (p.textContent.replace(/ /g, ' ').trim()) textCell.push(p);
    });

    // Promo CTA button -> <p><strong><a></a></strong></p>
    card.querySelectorAll('a.cmp-button').forEach((btn) => {
      const a = document.createElement('a');
      a.href = btn.getAttribute('href');
      a.textContent = btn.textContent.replace(/\s+/g, ' ').trim();
      const strong = document.createElement('strong');
      strong.append(a);
      const p = document.createElement('p');
      p.append(strong);
      textCell.push(p);
    });

    // Promo card without explicit button: link the heading to the tile redirect
    if (isPromo === false && !textCell.some((n) => n.querySelector && n.querySelector('a'))) {
      const redirect = card.querySelector('[data-redirect-url]');
      if (redirect && textCell[0]) {
        const a = document.createElement('a');
        a.href = redirect.getAttribute('data-redirect-url');
        a.append(...textCell[0].childNodes);
        textCell[0].append(a);
      }
    }

    return [img || '', textCell];
  }).filter(([, text]) => text.length);

  if (!cells.length) {
    element.replaceWith(...defaultContent, ...trailingContent);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-programs', cells });
  if (defaultContent.length) element.before(...defaultContent);
  if (trailingContent.length) element.after(...trailingContent);
  element.replaceWith(block);
}
