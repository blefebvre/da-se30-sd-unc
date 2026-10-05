// desktop layout (horizontal nav + hover dropdowns) starts at 1200px, matching the source site
const isDesktop = window.matchMedia('(width >= 1200px)');
const ALERT_DISMISSED_KEY = 'alertBannerClosed';

/**
 * Fetches the nav fragment. Metadata-independent dual fetch:
 * /content/nav.plain.html (local preview) first, then /nav.plain.html (DA/EDS).
 * @returns {Promise<{html: string, base: string}|null>}
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  return { html: await resp.text(), base: resp.url };
}

/**
 * Resolves relative image sources against the fragment URL so that
 * "images/x.svg" works no matter which page the header is rendered on.
 * @param {Element} root fragment root
 * @param {string} base URL the fragment was fetched from
 */
function resolveMedia(root, base) {
  root.querySelectorAll('img[src], source[srcset]').forEach((el) => {
    const attr = el.hasAttribute('src') ? 'src' : 'srcset';
    const value = el.getAttribute(attr);
    if (value && !/^(https?:|data:|\/)/.test(value)) {
      el.setAttribute(attr, new URL(value, base).href);
    }
  });
}

/**
 * Normalizes a path for breadcrumb matching (drops /content prefix, .html, trailing slash).
 * @param {string} href link href or pathname
 * @returns {string}
 */
function normalizePath(href) {
  let { pathname } = new URL(href, window.location.href);
  pathname = pathname.replace(/^\/content(?=\/)/, '').replace(/\.html$/, '').replace(/\/index$/, '');
  return pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
}

function closeAllDropdowns(navSections, except = null) {
  if (!navSections) return;
  navSections.querySelectorAll('.nav-drop').forEach((item) => {
    if (item === except) return;
    item.classList.remove('active');
    const toggle = item.querySelector(':scope > .nav-drop-toggle');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Opens/closes the mobile drawer. State lives on the hamburger button (aria-expanded)
 * and as a class on the nav; on desktop the drawer is always closed.
 * @param {Element} nav nav element
 * @param {boolean|null} forceExpanded force state (null = toggle)
 */
function toggleMenu(nav, forceExpanded = null) {
  const button = nav.querySelector('.nav-hamburger button');
  const isOpen = nav.classList.contains('nav-menu-open');
  const open = !isDesktop.matches && (forceExpanded !== null ? forceExpanded : !isOpen);
  nav.classList.toggle('nav-menu-open', open);
  document.body.style.overflowY = open ? 'hidden' : '';
  if (button) {
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  }
}

/**
 * Builds the alert banner (row 0) from its fragment section.
 * @param {Element} section fragment section (icon paragraph + message paragraph)
 * @param {Element} wrapper nav wrapper (gets the dismissed class)
 * @returns {Element|null}
 */
function buildAlert(section, wrapper) {
  if (!section || !section.textContent.trim()) return null;
  const alert = document.createElement('div');
  alert.className = 'nav-alert';
  const content = document.createElement('div');
  content.className = 'nav-alert-content';

  const icon = section.querySelector('img');
  if (icon) {
    const iconWrap = icon.closest('p') || icon;
    const img = icon.closest('picture') || icon;
    img.classList.add('nav-alert-icon');
    content.append(img);
    if (iconWrap !== img && !iconWrap.textContent.trim()) iconWrap.remove();
  }
  const text = document.createElement('div');
  text.className = 'nav-alert-text';
  text.append(...section.children);
  content.append(text);

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'nav-alert-close';
  close.setAttribute('aria-label', 'Close alert');
  close.addEventListener('click', () => {
    wrapper.classList.add('nav-alert-dismissed');
    try { sessionStorage.setItem(ALERT_DISMISSED_KEY, 'true'); } catch (e) { /* ignore */ }
  });
  content.append(close);
  alert.append(content);

  try {
    if (sessionStorage.getItem(ALERT_DISMISSED_KEY) === 'true') wrapper.classList.add('nav-alert-dismissed');
  } catch (e) { /* ignore */ }
  return alert;
}

/**
 * Decorates the main nav list: dropdown triggers get a caret toggle button.
 * @param {Element} navSections nav sections container
 */
function decorateSections(navSections) {
  const list = navSections.querySelector('ul');
  if (!list) return;
  list.classList.add('nav-list');
  [...list.children].forEach((item, i) => {
    item.classList.add('nav-item');
    const subList = item.querySelector(':scope > ul');
    const link = item.querySelector(':scope > a, :scope > p > a, :scope > strong > a');
    if (link) {
      if (link.parentElement !== item) link.parentElement.replaceWith(link);
      link.classList.add('nav-link');
    }
    // controls row (label + caret), like the source's controls wrapper
    const row = document.createElement('div');
    row.className = 'nav-item-row';
    if (link) row.append(link);
    item.prepend(row);
    if (!subList) return;
    item.classList.add('nav-drop');
    const id = `nav-dropdown-${i}`;
    subList.id = id;
    subList.classList.add('nav-dropdown');
    const label = link ? link.textContent.trim() : '';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-drop-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', id);
    toggle.setAttribute('aria-label', `${label} submenu`);
    subList.before(toggle);
    const toggleItem = () => {
      const open = !item.classList.contains('active');
      closeAllDropdowns(navSections, item);
      item.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      // desktop dropdowns open on hover; like the source, a pointer click on the caret
      // does not latch the dropdown open (keyboard activation, detail === 0, still does)
      if (isDesktop.matches && e.detail > 0) return;
      toggleItem();
    });
    // mobile: tapping the empty part of the row also toggles (label still navigates)
    row.addEventListener('click', (e) => {
      if (isDesktop.matches || e.target !== row) return;
      e.stopPropagation();
      toggleItem();
    });
  });
}

/**
 * Builds the breadcrumb bar (row 2). The root crumb (label + href) comes from the
 * fragment; intermediate crumbs reuse nav labels for matching paths; the last crumb
 * is the current page title.
 * @param {Element} section fragment section holding the root (home) link
 * @param {Element} nav nav element (for label lookup)
 * @returns {Element|null}
 */
function buildBreadcrumb(section, nav) {
  const rootLink = section && section.querySelector('a[href]');
  if (!rootLink) return null;
  const rootPath = normalizePath(rootLink.getAttribute('href'));
  const current = normalizePath(window.location.pathname);

  const crumbs = [{ label: rootLink.textContent.trim(), href: rootLink.getAttribute('href') }];
  if (current !== rootPath) {
    const navLinks = [...nav.querySelectorAll('a[href]')];
    const findLabel = (path) => navLinks.find((a) => normalizePath(a.getAttribute('href')) === path);
    if (current.startsWith(`${rootPath}/`)) {
      const segments = current.slice(rootPath.length + 1).split('/');
      segments.slice(0, -1).forEach((seg, i) => {
        const path = `${rootPath}/${segments.slice(0, i + 1).join('/')}`;
        const match = findLabel(path);
        crumbs.push({
          label: match ? match.textContent.trim() : seg.replace(/-/g, ' '),
          href: match ? match.getAttribute('href') : path,
        });
      });
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const title = (ogTitle && ogTitle.content) || document.title;
    crumbs.push({ label: title.split('|')[0].trim() });
  }

  const bar = document.createElement('div');
  bar.className = 'nav-breadcrumb';
  const bcNav = document.createElement('nav');
  bcNav.setAttribute('aria-label', 'Breadcrumb');
  const ol = document.createElement('ol');
  crumbs.forEach((crumb, i) => {
    const li = document.createElement('li');
    const last = i === crumbs.length - 1;
    if (last) {
      li.className = 'nav-breadcrumb-active';
      li.setAttribute('aria-current', 'page');
      li.textContent = crumb.label;
    } else {
      const a = document.createElement('a');
      a.href = crumb.href;
      a.textContent = crumb.label;
      const divider = document.createElement('span');
      divider.className = 'nav-breadcrumb-divider';
      divider.setAttribute('aria-hidden', 'true');
      divider.textContent = '>';
      li.append(a, divider);
    }
    ol.append(li);
  });
  bcNav.append(ol);
  bar.append(bcNav);
  return bar;
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navData = await fetchNav();
  block.textContent = '';
  if (!navData) return;

  const fragment = document.createElement('div');
  fragment.innerHTML = navData.html;
  resolveMedia(fragment, navData.base);
  const sections = [...fragment.children].filter((el) => el.tagName === 'DIV');

  // locate sections by content so an omitted alert/breadcrumb does not shift roles
  let sectionsIdx = sections.findIndex((s) => s.querySelector('ul'));
  if (sectionsIdx < 0) sectionsIdx = Math.min(1, sections.length - 1);
  const alertSection = sectionsIdx >= 2 ? sections[sectionsIdx - 2] : null;
  const brandSection = sectionsIdx >= 1 ? sections[sectionsIdx - 1] : null;
  const sectionsSection = sections[sectionsIdx];
  const toolsSection = sections[sectionsIdx + 1];
  const breadcrumbSection = sections[sectionsIdx + 2];

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';

  // row 0: alert banner + divider line
  const alert = buildAlert(alertSection, navWrapper);
  if (alert) {
    const divider = document.createElement('div');
    divider.className = 'nav-divider';
    navWrapper.append(alert, divider);
  }

  // row 1: brand, sections, tools
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main menu');

  if (brandSection) {
    brandSection.className = 'nav-brand';
    const brandLink = brandSection.querySelector('a');
    if (brandLink) {
      brandLink.classList.add('nav-brand-link');
      brandSection.replaceChildren(brandLink);
    }
    nav.append(brandSection);
  }

  if (sectionsSection) {
    sectionsSection.className = 'nav-sections';
    decorateSections(sectionsSection);
    nav.append(sectionsSection);
  }

  if (toolsSection) {
    toolsSection.className = 'nav-tools';
    toolsSection.querySelectorAll('a').forEach((a) => {
      a.classList.add('nav-cta');
      const p = a.closest('p');
      if (p && p.parentElement === toolsSection) p.replaceWith(a);
    });
    nav.append(toolsSection);
  }

  // hamburger (shown below the desktop breakpoint)
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  const hamburgerButton = document.createElement('button');
  hamburgerButton.type = 'button';
  hamburgerButton.setAttribute('aria-controls', 'nav');
  hamburgerButton.setAttribute('aria-label', 'Open navigation');
  [['open', 'hamburger'], ['close', 'close-bold']].forEach(([state, icon]) => {
    const img = document.createElement('img');
    img.className = `nav-hamburger-${state}`;
    img.src = `${window.hlx.codeBasePath}/icons/${icon}.svg`;
    img.alt = '';
    img.width = state === 'open' ? 24 : 18;
    img.height = img.width;
    hamburgerButton.append(img);
  });
  hamburgerButton.addEventListener('click', () => toggleMenu(nav));
  hamburger.append(hamburgerButton);
  nav.prepend(hamburger);

  navWrapper.append(nav);

  // row 2: breadcrumb
  const breadcrumb = buildBreadcrumb(breadcrumbSection, nav);
  if (breadcrumb) navWrapper.append(breadcrumb);

  // close caret-opened dropdowns on outside click / Escape
  document.addEventListener('click', (e) => {
    if (!sectionsSection || sectionsSection.contains(e.target)) return;
    closeAllDropdowns(sectionsSection);
  });
  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    if (sectionsSection) closeAllDropdowns(sectionsSection);
    if (!isDesktop.matches && nav.classList.contains('nav-menu-open')) {
      toggleMenu(nav, false);
      hamburgerButton.focus();
    }
  });

  // reset state when crossing the desktop breakpoint
  toggleMenu(nav, false);
  isDesktop.addEventListener('change', () => {
    if (sectionsSection) closeAllDropdowns(sectionsSection);
    toggleMenu(nav, false);
  });

  block.append(navWrapper);
}
