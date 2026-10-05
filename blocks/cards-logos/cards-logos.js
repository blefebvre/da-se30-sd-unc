import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Cards Logos: sponsor/partner logo wall.
 * Each row = one partner: [logo image | partner link].
 * The logo becomes the link; the link cell text is not shown but is used as
 * the accessible name (unless it is just the URL, then the image alt is used).
 * Tolerates a missing link (logo rendered unlinked), the link and image in
 * the same cell, swapped cells, or extra cells.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const img = row.querySelector('picture > img, img');
    if (!img) return;
    const link = row.querySelector('a[href]');

    // Only same-origin (media bus) images support the ?width/format params;
    // external images are reused as authored.
    const sameOrigin = new URL(img.src, window.location.href).origin === window.location.origin;
    const picture = sameOrigin
      ? createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }])
      : img.closest('picture') || img;
    const li = document.createElement('li');
    li.className = 'cards-logos-item';

    if (link) {
      const a = document.createElement('a');
      a.href = link.href;
      a.className = 'cards-logos-link';
      if (link.target) a.target = link.target;
      if (link.origin && link.origin !== window.location.origin) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      const text = link.textContent.trim();
      const isUrlText = /^(https?:\/\/|www\.)/i.test(text);
      const label = (!isUrlText && text) || img.alt || text;
      if (label) a.setAttribute('aria-label', label);
      a.append(picture);
      li.append(a);
    } else {
      li.append(picture);
    }

    ul.append(li);
  });

  block.replaceChildren(ul);
}
