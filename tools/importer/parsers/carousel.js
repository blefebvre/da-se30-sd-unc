/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel. Base: carousel.
 * Sources (program-detail template): adult-red-ball (photos), adult-tennis, high-performance
 *   (inside a tab section), junior-tennis-programs / junior-programming-welcome-letter
 *   (pathway infographics), play-padel, summer-camps.
 * Block model (blocks/carousel/README.md): N rows x 1-2 cells [image | optional text].
 *
 * Source DOM: div.carousel.panelcontainer > section.cmp-carousel > div.cmp-carousel__content
 *   > div.cmp-carousel__item (one per slide) > div.image > div.cmp-image[data-asset][data-cmp-src]
 *   > img.cmp-image__image. Controls (prev/next buttons, ol.cmp-carousel__indicators) are dropped.
 * Image src: the resolved src; when it is still a data:/blob: placeholder (or missing) the
 *   DAM asset (data-asset) or data-cmp-src with {.width} removed is used.
 * Alt: img alt, else the image holder's data-title.
 * A second cell is added only when slides carry text (all rows then get 2 cells).
 */

const clean = (s) => (s || '').replace(/[\s ]+/g, ' ').trim();

function isBlank(node) {
  return !clean(node.textContent) && !(node.querySelector && node.querySelector('img'));
}

function slideImage(item, document) {
  const holder = item.querySelector('.cmp-image[data-asset], .cmp-image[data-cmp-src], [data-cmp-is="image"]')
    || item.querySelector('.cmp-image');
  const srcImg = [...item.querySelectorAll('img')].find((i) => !i.closest('noscript'));
  let src = (srcImg && srcImg.getAttribute('src')) || '';
  if (!src || src.startsWith('data:') || src.startsWith('blob:')) {
    src = (holder && (holder.getAttribute('data-asset')
      || (holder.getAttribute('data-cmp-src') || '').replace('{.width}', ''))) || '';
  }
  // Inactive slides are lazy-loaded at the smallest AEM rendition (…coreimg.90.128.jpeg);
  // prefer the DAM original for those so the slideshow is not imported at thumbnail size.
  const rendition = src.match(/\.coreimg(?:\.\d+)?\.(\d+)\.(?:jpe?g|png|gif|webp)/i);
  const asset = holder && holder.getAttribute('data-asset');
  if (rendition && parseInt(rendition[1], 10) < 600 && asset) src = asset;
  if (!src) return null;
  if (/\.svg$/i.test(src)) src = `${src}?asset=image`;
  const img = document.createElement('img');
  img.setAttribute('src', src);
  const alt = (srcImg && srcImg.getAttribute('alt')) || (holder && holder.getAttribute('data-title')) || '';
  img.setAttribute('alt', clean(alt));
  return img;
}

function slideText(item) {
  const out = [];
  item.querySelectorAll('.cmp-text, .cmp-title, .cmp-teaser__content').forEach((root) => {
    [...root.children].forEach((n) => {
      if (n.matches('.phe-block, .cmp-text__icon') && !clean(n.textContent)) return;
      if (!isBlank(n)) out.push(n);
    });
  });
  // image caption (cmp-image__title) is visible slide text
  item.querySelectorAll('.cmp-image__title').forEach((cap) => {
    if (clean(cap.textContent)) {
      const p = cap.ownerDocument.createElement('p');
      p.textContent = clean(cap.textContent);
      out.push(p);
    }
  });
  return out;
}

export default function parse(element, { document }) {
  const root = element.querySelector('.cmp-carousel') || element;
  const items = [...root.querySelectorAll('.cmp-carousel__item')]
    .filter((it) => it.closest('.cmp-carousel') === root || root === element);

  const slides = items.map((item) => ({ img: slideImage(item, document), text: slideText(item) }))
    .filter((s) => s.img || s.text.length);

  if (!slides.length) {
    element.remove();
    return;
  }

  const hasText = slides.some((s) => s.text.length);
  const cells = slides.map((s) => (hasText
    ? [s.img || '', s.text.length ? s.text : '']
    : [s.img]));

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel', cells });
  element.replaceWith(block);
}
