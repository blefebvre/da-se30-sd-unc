/* eslint-disable */
/* global WebImporter */
/**
 * Parser for embed. Base: embed.
 * Sources (program-detail template): save-my-play, adult-camps, adult-red-ball (YouTube videos);
 *   2026-bnp-paribas-world-team-cup (ioncourt.com live results iframe).
 * Block model (blocks/embed/README.md): 1 row [optional placeholder image + embed URL link].
 *
 * Source DOM:
 *   - div.embed > div.cmp-embed > div.youtube.usta-consent-embed
 *       > iframe.usta-consent-embed__iframe[data-src=https://www.youtube.com/embed/<id>?origin=…]
 *         (src stays empty until cookies are accepted)
 *       > div.usta-consent-placeholder ("This video requires Social Media cookies…") -> dropped
 *     -> https://www.youtube.com/watch?v=<id>
 *   - div.iframetext > div.iframealignment > div.iframeEmbedded > iframe[src=https://ioncourt.com/…]
 *     -> iframe src as-is
 */

function embedUrl(element) {
  const iframe = element.querySelector('iframe[data-src], iframe[src]');
  let raw = iframe ? (iframe.getAttribute('data-src') || iframe.getAttribute('src') || '') : '';
  if (!raw.trim()) {
    const link = element.querySelector('a[href*="youtube.com"], a[href*="youtu.be"], a[href*="vimeo.com"]');
    raw = link ? link.getAttribute('href') : '';
  }
  raw = (raw || '').trim();
  if (!raw) return null;
  if (raw.startsWith('//')) raw = `https:${raw}`;
  const yt = raw.match(/youtube(?:-nocookie)?\.com\/(?:embed|shorts|v)\/([\w-]{6,})/i)
    || raw.match(/youtu\.be\/([\w-]{6,})/i)
    || raw.match(/youtube\.com\/watch\?(?:.*&)?v=([\w-]{6,})/i);
  if (yt) return `https://www.youtube.com/watch?v=${yt[1]}`;
  const vimeo = raw.match(/player\.vimeo\.com\/video\/(\d+)/i);
  if (vimeo) return `https://vimeo.com/${vimeo[1]}`;
  return raw;
}

export default function parse(element, { document }) {
  const url = embedUrl(element);
  if (!url) {
    // nothing embeddable: drop the cookie-consent placeholder, keep any other content
    element.querySelectorAll('.usta-consent-placeholder, iframe').forEach((n) => n.remove());
    element.replaceWith(...element.childNodes);
    return;
  }

  const a = document.createElement('a');
  a.href = url;
  a.textContent = url;
  const cells = [[a]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'embed', cells });
  element.replaceWith(block);
}
