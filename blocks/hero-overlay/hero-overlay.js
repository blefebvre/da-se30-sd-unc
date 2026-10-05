import { createOptimizedPicture } from '../../scripts/aem.js';

/* centered: text centered over a full-image tint; light: white translucent band */
const OPTION_CLASSES = ['centered', 'light'];

/**
 * Paragraphs that hold only emphasised links (several CTAs authored in one
 * paragraph) are skipped by the global decorateButtons; buttonize them here.
 * @param {Element} p
 */
function buttonizeLinkParagraph(p) {
  if (p.classList.contains('button-wrapper')) return;
  const links = [...p.querySelectorAll('a[href]')];
  if (!links.length) return;
  const linkText = links.map((a) => a.textContent.trim()).join('');
  if (p.textContent.replace(/\s+/g, '') !== linkText.replace(/\s+/g, '')) return;
  if (!links.every((a) => a.closest('strong, em'))) return;
  links.forEach((a) => {
    a.className = 'button primary';
    const wrapper = document.createElement('p');
    wrapper.className = 'button-wrapper';
    wrapper.append(a);
    p.before(wrapper);
  });
  p.remove();
}

/**
 * Group consecutive button paragraphs into one row container.
 * No-op when the content has no buttons (e.g. H1-only heroes).
 * @param {Element} content
 */
function groupActions(content) {
  [...content.querySelectorAll(':scope > p')].forEach(buttonizeLinkParagraph);
  let group = null;
  [...content.children].forEach((el) => {
    if (el.matches('p.button-wrapper, p.button-container')) {
      if (!group) {
        group = document.createElement('div');
        group.className = 'hero-overlay-actions';
        el.before(group);
      }
      group.append(el);
    } else {
      group = null;
    }
  });
}

/**
 * Hero Overlay: full-bleed background image with heading text overlaid.
 * Authored as rows: [image] then [heading + optional text/CTA].
 * Tolerates the image and text sharing a row, missing image, or extra rows.
 * @param {Element} block
 */
export default function decorate(block) {
  const picture = block.querySelector('picture');
  const media = document.createElement('div');
  media.className = 'hero-overlay-media';

  if (picture) {
    const img = picture.querySelector('img');
    const optimized = img
      ? createOptimizedPicture(img.src, img.alt, true, [
        { media: '(min-width: 900px)', width: '2000' },
        { width: '900' },
      ])
      : picture;
    const parentP = picture.parentElement;
    media.append(optimized);
    picture.remove();
    if (parentP && parentP.tagName === 'P' && !parentP.textContent.trim() && !parentP.children.length) {
      parentP.remove();
    }
  }

  const content = document.createElement('div');
  content.className = 'hero-overlay-content';
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      while (cell.firstChild) content.append(cell.firstChild);
    });
  });

  // drop whitespace-only text nodes left behind by empty cells
  [...content.childNodes].forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE && !n.textContent.trim()) n.remove();
  });

  groupActions(content);
  // content-shape hooks: the source lays out the band differently for
  // heading + CTAs and heading + copy (H1-only heroes get neither class)
  if (content.querySelector(':scope > .hero-overlay-actions')) {
    block.classList.add('hero-overlay-has-actions');
  }
  if (content.querySelector(':scope > p:not(.button-wrapper, .button-container)')) {
    block.classList.add('hero-overlay-has-text');
  }
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  if (active.includes('centered')) {
    // centered banners use white buttons over the tinted image
    content.querySelectorAll('a.button.primary').forEach((a) => {
      a.classList.replace('primary', 'secondary');
    });
  }

  block.replaceChildren();
  if (media.children.length) block.append(media);
  else block.classList.add('hero-overlay-no-image');
  if (content.childNodes.length) block.append(content);
}
