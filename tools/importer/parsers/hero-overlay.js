/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-overlay. Base: hero.
 * Sources: https://www.ustanationalcampus.com/en/home.html (home template) and the
 * landing template (about, play, sponsors---partners, watch, usta-national-campus-scholarship).
 * Structure (1 column): row 1 = background image (optional), row 2 = heading + optional text/CTA.
 * Source DOM: div.cmp-container with the background as an inline CSS background-image
 * (also exposed as data-desktop-background-image); scraped copies carry it as a direct-child <img>.
 * Heading: nested .cmp-text > h1 (fallback h2). Sub-headings inside the text (e.g. an H4
 * "SPONSORED BY ..." line) become paragraphs. AEM buttons (a.cmp-button) become
 * <p><strong><a></a></strong></p> so EDS decorates them as buttons.
 * Variants (landing template):
 *   - centered: heading is center-aligned in the source (text-align: center / alignment-center)
 *   - light: the text band is a white translucent overlay (rgba(255,255,255,x))
 * Home hero (left-aligned H1 in a dark band, no buttons) produces the same output as before.
 * Program-detail template (davebailey, pickleball, summer-camps, private-lessons, ...): the H1 sits in
 * a separate .cmp-title component (.title .cmp-title h1) and the copy in one or more .text
 * components. When the first .cmp-text has no h1/h2, the .cmp-title heading is used and the
 * paragraphs / sub-headings of ALL .cmp-text components are collected in source order (inline
 * formatting and links kept). When the heading is in the first .cmp-text and further .cmp-text
 * components follow (free30), their copy is collected too. Single-.cmp-text heroes are unchanged.
 */

function bgImageFrom(el, document) {
  if (!el) return null;
  let src = el.getAttribute('data-desktop-background-image');
  if (!src) {
    const style = el.getAttribute('style') || '';
    const m = style.match(/background-image:\s*url\(\s*(['"]?)(.*?)\1\s*\)/i);
    if (m) src = m[2].replace(/&quot;/g, '');
  }
  if (!src) return null;
  const img = document.createElement('img');
  img.src = src;
  return img;
}

function detectVariant(element, heading) {
  const isCentered = !!heading && (
    /text-align:\s*center/i.test(heading.getAttribute('style') || '')
    || !!heading.closest('.cmp-text--alignment-center')
  );
  if (isCentered) return 'centered';
  const bands = [...element.querySelectorAll('.cmp-container[style*="background-color"]')];
  const isLight = bands.some((b) => /background-color:\s*rgba?\(\s*255\s*,\s*255\s*,\s*255/i
    .test(b.getAttribute('style') || ''));
  return isLight ? 'light' : null;
}

function buttonParagraph(btn, document) {
  const text = (btn.querySelector('.button-core__text-content, .cmp-button__text') || btn)
    .textContent.replace(/\s+/g, ' ').trim();
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

export default function parse(element, { document }) {
  // Background image: direct-child img (scraped DOM) or inline CSS background (live DOM)
  const bgImage = element.querySelector(':scope > img')
    || element.querySelector(':scope > picture')
    || bgImageFrom(element, document);

  // Text content lives in .cmp-text; the heading is an h1 (fallback h2)
  const textComps = [...element.querySelectorAll('.cmp-text')];
  const textRoot = textComps[0] || element;
  let heading = textRoot.querySelector('h1') || textRoot.querySelector('h2');
  // Text sources, in source order. Home/landing heroes have a single .cmp-text (unchanged).
  let textRoots = [textRoot];
  if (!heading && textComps.length) {
    // program-detail heroes: H1 in a separate .cmp-title component, copy in one or more
    // .text components (e.g. davebailey intro + red "PLEASE NOTE" line with a link)
    const titleHeading = element.querySelector('.cmp-title h1, .cmp-title h2');
    if (titleHeading) {
      heading = titleHeading;
      textRoots = textComps;
    }
  } else if (heading && textComps.length > 1) {
    // e.g. free30: H1 in the first .cmp-text, sub-heading copy in a following .cmp-text
    textRoots = textComps;
  }
  const paragraphs = textRoots.flatMap((r) => [...r.querySelectorAll(':scope > p')])
    .filter((p) => p.textContent.replace(/\u00a0/g, ' ').trim());
  const ctas = textRoots.flatMap((r) => [...r.querySelectorAll('a[href]')])
    .filter((a) => !a.classList.contains('cmp-button'));

  if (!heading && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const variant = detectVariant(element, heading);

  const cells = [];
  if (bgImage) cells.push([bgImage]);

  const contentCell = [];
  if (heading) {
    heading.removeAttribute('style');
    contentCell.push(heading);
  }
  // Sub-headings within the hero text (e.g. scholarship "SPONSORED BY ...") -> paragraphs,
  // kept in source order relative to the text paragraphs
  textRoots.flatMap((r) => [...r.querySelectorAll(':scope > p, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6')])
    .forEach((n) => {
      if (n === heading || contentCell.includes(n)) return;
      if (!n.textContent.replace(/ /g, ' ').trim()) return;
      if (n.tagName === 'P') {
        if (paragraphs.includes(n)) contentCell.push(n);
        return;
      }
      const p = document.createElement('p');
      p.append(...n.childNodes);
      contentCell.push(p);
    });
  ctas.forEach((a) => {
    if (!contentCell.some((el) => el.contains(a))) contentCell.push(a);
  });
  // AEM button components anywhere in the hero (outside the text component)
  [...element.querySelectorAll('a.cmp-button')].forEach((btn) => {
    const p = buttonParagraph(btn, document);
    if (p) contentCell.push(p);
  });
  cells.push([contentCell]);

  // program-detail title banners (H1 in a .cmp-title component; never present on home/landing
  // heroes): translucent text panel on the left part of the image -> additional `panel` option
  const options = [variant, element.querySelector('.cmp-title') ? 'panel' : null].filter(Boolean);
  const name = options.length ? `hero-overlay (${options.join(', ')})` : 'hero-overlay';
  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);
}
