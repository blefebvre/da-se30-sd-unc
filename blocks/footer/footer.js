/**
 * Footer block.
 * Content lives in footer.plain.html (flat, semantic sections). This block only builds
 * layout shells around that content; it never hardcodes copy, links or images.
 *
 * Fragment contract (one top-level <div> per band):
 *  1. main band: lead content (logo, CTA) before the first heading, then heading groups.
 *     Heading + paragraphs = info group, heading + list = link column,
 *     CTA paragraphs after the last list = actions column.
 *  2. social band: list of icon links + legal/copyright paragraphs.
 * Links whose href ends with "#_blank" open in a new tab.
 */

const NEW_TAB_MARKER = '#_blank';

/**
 * Fetches the footer fragment (metadata-independent).
 * /content/footer.plain.html serves local preview; /footer.plain.html serves DA/EDS.
 * @returns {Promise<Document|null>}
 */
async function fetchFooterFragment() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  // inert parse so relative image paths are resolved against the fragment, not the page
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), resp.url).href;
  });
  return doc;
}

/**
 * Converts authored new-tab markers into target attributes.
 * @param {Element} root
 */
function decorateLinkTargets(root) {
  root.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (href.endsWith(NEW_TAB_MARKER)) {
      a.setAttribute('href', href.slice(0, -NEW_TAB_MARKER.length));
      a.target = '_blank';
      a.rel = 'noopener';
    }
  });
}

/**
 * Turns <p><strong|em><a> CTA paragraphs into site buttons (strong+em = accent).
 * @param {Element} root
 */
function decorateButtonParagraphs(root) {
  root.querySelectorAll('p').forEach((p) => {
    const a = p.querySelector(':scope > strong > a, :scope > em > a, :scope > strong > em > a, :scope > em > strong > a');
    if (!a || p.textContent.trim() !== a.textContent.trim() || a.querySelector('img')) return;
    const strong = p.querySelector('strong');
    const em = p.querySelector('em');
    a.className = 'button';
    if (strong && em) a.classList.add('accent');
    else a.classList.add(strong ? 'primary' : 'secondary');
    p.className = 'button-wrapper';
    p.replaceChildren(a);
  });
}

function el(tag, className, children = []) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

function isButtonParagraph(node) {
  return node.matches('p.button-wrapper');
}

/**
 * Splits the main band into lead content, heading groups and trailing actions.
 * @param {Element} section
 */
function buildMainBand(section) {
  const nodes = [...section.children];
  const firstHeading = nodes.findIndex((n) => /^H[1-6]$/.test(n.tagName));
  const lead = firstHeading === -1 ? nodes : nodes.slice(0, firstHeading);
  const rest = firstHeading === -1 ? [] : nodes.slice(firstHeading);

  const groups = [];
  rest.forEach((node) => {
    if (/^H[1-6]$/.test(node.tagName)) groups.push({ heading: node, body: [] });
    else groups[groups.length - 1].body.push(node);
  });

  // CTA paragraphs that follow the last list become their own actions column
  const actions = [];
  const last = groups[groups.length - 1];
  if (last) {
    while (last.body.length && isButtonParagraph(last.body[last.body.length - 1])
      && last.body.some((n) => n.tagName === 'UL')) {
      actions.unshift(last.body.pop());
    }
  }

  const details = el('div', 'footer-info-details');
  const columns = [details];
  groups.forEach(({ heading, body }) => {
    heading.className = 'footer-heading';
    const list = body.find((n) => n.tagName === 'UL');
    if (list) {
      columns.push(el('nav', 'footer-links', [heading, ...body]));
      if (!heading.id) heading.id = `footer-links-${columns.length - 1}`;
      columns[columns.length - 1].setAttribute('aria-labelledby', heading.id);
    } else {
      const group = el('div', 'footer-info-group', [heading, el('div', 'footer-info-content', body)]);
      // paragraphs that pair a link with an image render as an inline row
      body.forEach((p) => {
        if (p.querySelector('a') && p.querySelector('img') && !p.querySelector('a img')) p.classList.add('footer-inline-link');
      });
      details.append(group);
    }
  });
  if (actions.length) columns.push(el('div', 'footer-booking', actions));

  const subscription = el('section', 'footer-subscription', lead);
  const info = el('section', 'footer-info', columns);
  return el('div', 'footer-main footer-band', [subscription, info]);
}

/**
 * Builds the social icon row and legal text band.
 * @param {Element} section
 */
function buildSocialBand(section) {
  const list = section.querySelector('ul');
  const nav = el('nav', 'footer-social-nav');
  if (list) {
    list.className = 'footer-social-links';
    nav.append(list);
  }
  const legal = el('div', 'footer-copyright', [...section.children]);
  return el('div', 'footer-social footer-band', [nav, legal]);
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const doc = await fetchFooterFragment();
  if (!doc) return;
  const sections = [...doc.body.children].filter((n) => n.tagName === 'DIV');
  sections.forEach((section) => {
    decorateLinkTargets(section);
    decorateButtonParagraphs(section);
  });

  const bands = [];
  if (sections[0]) bands.push(buildMainBand(sections[0]));
  if (sections[1]) bands.push(buildSocialBand(sections[1]));
  sections.slice(2).forEach((section) => bands.push(el('div', 'footer-band', [...section.children])));
  // decorative closing bar (layout only, no content)
  bands.push(el('div', 'footer-bottom-line'));

  block.textContent = '';
  block.append(...bands);
}
