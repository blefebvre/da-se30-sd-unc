/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: USTA National Campus site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html (home template).
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

const SOURCE_ORIGIN = 'https://www.ustanationalcampus.com';

// Source redirects (301) and broken links with an obvious correct target -> final source path
const LINK_FIXES = {
  '/en/home/connect.html': '/en/home/about.html',
  '/en/home/news/holiday-hours.html': '/en/home/about/holiday-hours.html',
  '/en/home/play/court-booking.html': '/en/home/play/book-a-court.html',
  '/en/home/play/adult-programs.html': '/en/home/play/programs/adult-tennis.html',
  '/en/home/play/nemours-family-zone.html': '/en/home/play/programs/junior-tennis-programs.html',
  '/en/home/news/FreeThirtyMinuteSession.html': '/en/home/play/free30.html',
  '/en/home/collegiate/events.html': 'https://www.usta.com/en/home/play/college-tennis.html',
  '/en/home/play/high-performance1.html': '/en/home/play/high-performance.html',
  '/en/home/play/DaveBailey.html': '/en/home/play/davebailey.html',
  '/en/home/play/pickleball2/play-pickleball.html': '/en/home/play/pickleball.html',
};

// Decorative wrapper background textures (not content images)
const DECORATIVE_BG = /PlayerSearchBG/i;

// Marker attribute used by ustanationalcampus-sections.js on section <hr> elements
const SECTION_MARKER_ATTR = 'data-excat-section-id';

/**
 * True when any text, image or table precedes the node (in document order) within root.
 */
function hasContentBefore(node, root) {
  let n = node;
  while (n && n !== root) {
    let sib = n.previousSibling;
    while (sib) {
      if ((sib.textContent || '').trim()) return true;
      if (sib.nodeType === 1 && (sib.matches('img, picture, table') || sib.querySelector('img, picture, table'))) return true;
      sib = sib.previousSibling;
    }
    n = n.parentNode;
  }
  return false;
}

/**
 * Rewrites internal page links to their migrated EDS paths:
 * same-host /en/ page links become root-relative, extensionless and tracking-free,
 * with known redirects and broken links pointed at their final target.
 */
function rewriteLinks(element) {
  element.querySelectorAll('a[href]').forEach((a) => {
    const raw = a.getAttribute('href').trim();
    if (!raw || raw.startsWith('#') || /^(mailto|tel|javascript):/i.test(raw)) return;
    let url;
    try {
      url = new URL(raw, SOURCE_ORIGIN);
    } catch (e) {
      return;
    }
    if (!/(^|\.)ustanationalcampus\.com$/.test(url.hostname) || !url.pathname.startsWith('/en/')) return;
    const fixed = LINK_FIXES[url.pathname];
    if (fixed && /^https?:/.test(fixed)) {
      a.setAttribute('href', fixed);
      return;
    }
    // mirror the importer's path sanitizing (lowercase, collapse repeated dashes) so links match page paths
    const path = (fixed || url.pathname).replace(/\.html$/, '').split('/')
      .map((seg) => seg.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))
      .join('/');
    const params = new URLSearchParams(url.search);
    ['cid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach((k) => params.delete(k));
    const qs = params.toString();
    a.setAttribute('href', `${path}${qs ? `?${qs}` : ''}${url.hash}`);
  });
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // OneTrust cookie consent: <div id="onetrust-consent-sdk"> (cleaned.html line ~1211)
    WebImporter.DOMUtils.remove(element, ['#onetrust-consent-sdk']);

    // Google ad container: <div class="container responsivegrid ..."> wrapping
    // <div class="cmp-experiencefragment cmp-experiencefragment--ros-ad-experience-fragment">
    // (contains "Skip Advertisement" link + GPT iframe, cleaned.html line ~1015-1050)
    // On landing-template pages the ad XF sits inside a content container next to real
    // components (buttons, card grids, whole page bodies), so the wrapper is only removed
    // when the ad is its sole content; otherwise just the XF column is removed.
    element.querySelectorAll('.cmp-experiencefragment--ros-ad-experience-fragment').forEach((xf) => {
      const wrapper = xf.closest('.container.responsivegrid');
      const xfColumn = xf.closest('div.experiencefragment') || xf;
      const wrapperHasOtherContent = (w) => {
        const clone = w.cloneNode(true);
        clone.querySelectorAll('.cmp-experiencefragment--ros-ad-experience-fragment, script, style, link, noscript')
          .forEach((n) => n.remove());
        return !!(clone.textContent.trim() || clone.querySelector('img, picture, a[href], iframe, video'));
      };
      if (wrapper && wrapper.id !== 'mainContent' && !wrapper.querySelector('#mainContent')
        && !wrapperHasOtherContent(wrapper)) {
        wrapper.remove();
      } else {
        xfColumn.remove();
      }
    });

    // Desktop-hidden duplicates (AEM grid "hide on default/desktop" columns): the source
    // authors separate phone/tablet copies of tiles, heroes and images; the desktop
    // rendering is the canonical content.
    element.querySelectorAll('[class*="aem-GridColumn--default--hide"]').forEach((n) => n.remove());

    // Dynamic Vue event calendar (calendar.html): rendered client-side from AEM content
    // fragments, not migratable as document content.
    WebImporter.DOMUtils.remove(element, ['#mainContent div.calendar', 'v-calendar']);

    // AEM core image lazy loading: resolve placeholder / not-yet-rendered images so default
    // content images (icons, app-store badges) are kept. Prefers the DAM asset path.
    // (AEM removes data-cmp-is after init, so holders are found by their data attributes.)
    element.querySelectorAll('[data-cmp-is="image"], .cmp-image[data-cmp-src], .cmp-image[data-asset]').forEach((holder) => {
      const real = holder.getAttribute('data-asset')
        || (holder.getAttribute('data-cmp-src') || '').replace('{.width}', '');
      if (!real) return;
      const img = [...holder.querySelectorAll('img')].find((i) => !i.closest('noscript'));
      if (img) {
        const src = img.getAttribute('src') || '';
        if (!src || src.startsWith('data:')) img.setAttribute('src', real);
        // Not-yet-loaded lazy images reach the transform as blob: URLs (the importer turns
        // the data: placeholder into an object URL); rebuild the rendition AEM would request
        // (smallest data-cmp-widths entry >= rendered width), else use the DAM asset.
        if (src.startsWith('blob:')) {
          const template = holder.getAttribute('data-cmp-src') || '';
          const widths = (holder.getAttribute('data-cmp-widths') || '')
            .split(',').map((w) => parseInt(w, 10)).filter((w) => w > 0).sort((a, b) => a - b);
          const rendered = Math.round(img.getBoundingClientRect().width || holder.getBoundingClientRect().width || 0);
          const width = rendered > 0 ? (widths.find((w) => w >= rendered) || widths[widths.length - 1]) : 0;
          img.setAttribute('src', template.includes('{.width}') && width
            ? template.replace('{.width}', `.${width}`)
            : real);
        }
        return;
      }
      const created = document.createElement('img');
      created.setAttribute('src', real);
      const ns = holder.querySelector('noscript');
      const altMatch = ns && ns.textContent.match(/alt="([^"]*)"/);
      created.setAttribute('alt', (altMatch && altMatch[1]) || holder.getAttribute('data-title') || '');
      const link = holder.querySelector('a[href]');
      if (link) link.append(created); else holder.append(created);
    });
  }

  if (hookName === TransformHook.afterTransform) {
    WebImporter.DOMUtils.remove(element, [
      // Header XF incl. 'Register for Fall Programming' alert bar, top navigation, breadcrumb
      // <div class="cmp-experiencefragment cmp-experiencefragment--header-xf"> / <div class="header aem-GridColumn ...">
      '.cmp-experiencefragment--header-xf',
      'div.header.aem-GridColumn',
      '.top-navigation',
      'div.breadcrumb.aem-GridColumn',
      // Footer XF: <div class="cmp-experiencefragment cmp-experiencefragment--footer-xf"> / <footer class="nc-footer ...">
      '.cmp-experiencefragment--footer-xf',
      'div.footer.aem-GridColumn',
      'footer.nc-footer',
      // Leftover ad markup (if wrapper removal above did not catch it)
      '.adImageComp',
      'a.skipAd',
      '[id^="skipAd-div-gpt-ad"]',
      '[id^="google_ads_iframe"]',
      '#google_ads_top_frame',
      // Empty AEM separator components: <div class="separator ..."><div class="cmp-separator"><hr class="cmp-separator__horizontal-rule">
      'div.separator.aem-GridColumn',
      '.cmp-separator',
      // Empty personalization placeholders: <div class="phe-block phe-block--s"></div>
      'div.phe-block',
      // Non-content elements
      'iframe',
      'link',
      'noscript',
      'script',
      'style',
    ]);

    // Decorative background textures on wrapper containers left after parsing
    // (e.g. PlayerSearchBG on landing pages) would otherwise become stray images via
    // WebImporter.rules.transformBackgroundImages.
    element.querySelectorAll('[style*="background-image"], [data-desktop-background-image]').forEach((el) => {
      if (el.closest('table')) return;
      const src = `${el.getAttribute('data-desktop-background-image') || ''} ${el.getAttribute('style') || ''}`;
      if (DECORATIVE_BG.test(src) || !el.textContent.trim()) {
        el.style.removeProperty('background-image');
        el.removeAttribute('data-desktop-background-image');
        el.removeAttribute('data-mobile-background-image');
      }
    });

    // html2md turns .svg images into :icon: tokens (resolved against /icons/); keep default
    // content SVG images (badges, decorative icons) as regular images.
    element.querySelectorAll('img[src]').forEach((img) => {
      if (img.closest('table')) return;
      const src = img.getAttribute('src');
      if (/\.svg$/i.test(src)) img.setAttribute('src', `${src}?asset=image`);
    });

    // A styled section that is the first content of a page gets its section <hr> at the very
    // top of the page (an empty first section). Drop such leading breaks; a section marker
    // is kept as an empty placeholder so the sections transformer can still anchor its
    // Section Metadata block there.
    element.querySelectorAll('hr').forEach((hr) => {
      if (hasContentBefore(hr, element)) return;
      if (hr.hasAttribute(SECTION_MARKER_ATTR)) {
        const placeholder = document.createElement('div');
        placeholder.setAttribute(SECTION_MARKER_ATTR, hr.getAttribute(SECTION_MARKER_ATTR));
        hr.replaceWith(placeholder);
      } else {
        hr.remove();
      }
    });

    // Default-content AEM buttons (a.cmp-button left outside block tables after parsing):
    // author as <p><strong><a>TEXT</a></strong></p> so EDS decorates them as buttons.
    element.querySelectorAll('a.cmp-button').forEach((btn) => {
      if (btn.closest('table')) return;
      const text = (btn.querySelector('.button-core__text-content, .cmp-button__text') || btn)
        .textContent.replace(/\s+/g, ' ').trim();
      if (!text || !btn.getAttribute('href')) {
        btn.remove();
        return;
      }
      const a = document.createElement('a');
      a.setAttribute('href', btn.getAttribute('href'));
      a.textContent = text;
      const strong = document.createElement('strong');
      strong.append(a);
      const p = document.createElement('p');
      p.append(strong);
      btn.replaceWith(p);
    });

    // Clickable AEM containers left as default content (cmp-container--clickable[data-redirect-url],
    // e.g. CourtReserve app-store badges on program-detail pages) that hold images but no link:
    // link each image to the redirect target so the badge stays clickable.
    element.querySelectorAll('.cmp-container--clickable[data-redirect-url]').forEach((c) => {
      const href = c.getAttribute('data-redirect-url');
      if (!href || c.closest('table') || c.querySelector('a[href]')) return;
      c.querySelectorAll('img').forEach((img) => {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        img.replaceWith(a);
        a.append(img);
      });
    });

    rewriteLinks(element);
  }
}
