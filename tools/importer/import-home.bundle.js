/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/hero-overlay.js
  function bgImageFrom(el, document2) {
    if (!el) return null;
    let src = el.getAttribute("data-desktop-background-image");
    if (!src) {
      const style = el.getAttribute("style") || "";
      const m = style.match(/background-image:\s*url\(\s*(['"]?)(.*?)\1\s*\)/i);
      if (m) src = m[2].replace(/&quot;/g, "");
    }
    if (!src) return null;
    const img = document2.createElement("img");
    img.src = src;
    return img;
  }
  function detectVariant(element, heading) {
    const isCentered = !!heading && (/text-align:\s*center/i.test(heading.getAttribute("style") || "") || !!heading.closest(".cmp-text--alignment-center"));
    if (isCentered) return "centered";
    const bands = [...element.querySelectorAll('.cmp-container[style*="background-color"]')];
    const isLight = bands.some((b) => /background-color:\s*rgba?\(\s*255\s*,\s*255\s*,\s*255/i.test(b.getAttribute("style") || ""));
    return isLight ? "light" : null;
  }
  function buttonParagraph(btn, document2) {
    const text = (btn.querySelector(".button-core__text-content, .cmp-button__text") || btn).textContent.replace(/\s+/g, " ").trim();
    const href = btn.getAttribute("href");
    if (!text || !href) return null;
    const a = document2.createElement("a");
    a.href = href;
    a.textContent = text;
    const strong = document2.createElement("strong");
    strong.append(a);
    const p = document2.createElement("p");
    p.append(strong);
    return p;
  }
  function parse(element, { document: document2 }) {
    const bgImage = element.querySelector(":scope > img") || element.querySelector(":scope > picture") || bgImageFrom(element, document2);
    const textComps = [...element.querySelectorAll(".cmp-text")];
    const textRoot = textComps[0] || element;
    let heading = textRoot.querySelector("h1") || textRoot.querySelector("h2");
    let textRoots = [textRoot];
    if (!heading && textComps.length) {
      const titleHeading = element.querySelector(".cmp-title h1, .cmp-title h2");
      if (titleHeading) {
        heading = titleHeading;
        textRoots = textComps;
      }
    } else if (heading && textComps.length > 1) {
      textRoots = textComps;
    }
    const paragraphs = textRoots.flatMap((r) => [...r.querySelectorAll(":scope > p")]).filter((p) => p.textContent.replace(/\u00a0/g, " ").trim());
    const ctas = textRoots.flatMap((r) => [...r.querySelectorAll("a[href]")]).filter((a) => !a.classList.contains("cmp-button"));
    if (!heading && !bgImage) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const variant = detectVariant(element, heading);
    const cells = [];
    if (bgImage) cells.push([bgImage]);
    const contentCell = [];
    if (heading) {
      heading.removeAttribute("style");
      contentCell.push(heading);
    }
    textRoots.flatMap((r) => [...r.querySelectorAll(":scope > p, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6")]).forEach((n) => {
      if (n === heading || contentCell.includes(n)) return;
      if (!n.textContent.replace(/ /g, " ").trim()) return;
      if (n.tagName === "P") {
        if (paragraphs.includes(n)) contentCell.push(n);
        return;
      }
      const p = document2.createElement("p");
      p.append(...n.childNodes);
      contentCell.push(p);
    });
    ctas.forEach((a) => {
      if (!contentCell.some((el) => el.contains(a))) contentCell.push(a);
    });
    [...element.querySelectorAll("a.cmp-button")].forEach((btn) => {
      const p = buttonParagraph(btn, document2);
      if (p) contentCell.push(p);
    });
    cells.push([contentCell]);
    const options = [variant, element.querySelector(".cmp-title") ? "panel" : null].filter(Boolean);
    const name = options.length ? `hero-overlay (${options.join(", ")})` : "hero-overlay";
    const block = WebImporter.Blocks.createBlock(document2, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-mosaic.js
  var HIDDEN_COL = '[class*="aem-GridColumn--default--hide"]';
  function isDesktopHidden(node, root) {
    let n = node;
    while (n && n !== root) {
      if (n.matches && n.matches(HIDDEN_COL)) return true;
      n = n.parentElement;
    }
    return false;
  }
  function bgSrc(el) {
    let src = el.getAttribute("data-desktop-background-image");
    if (!src) {
      const style = el.getAttribute("style") || "";
      const m = style.match(/background-image:\s*url\(\s*(['"]?)(.*?)\1\s*\)/i);
      if (m) src = m[2].replace(/&quot;/g, "");
    }
    return src || null;
  }
  function findImageContainer(heading, root) {
    let c = heading.parentElement ? heading.parentElement.closest(".cmp-container") : null;
    while (c && c !== root && root.contains(c)) {
      if (c.querySelector(":scope > img, :scope > picture") || bgSrc(c)) return c;
      c = c.parentElement ? c.parentElement.closest(".cmp-container") : null;
    }
    return null;
  }
  function findClickable(node, root) {
    let found = null;
    let c = node.parentElement ? node.parentElement.closest(".cmp-container--clickable") : null;
    while (c && c !== root && root.contains(c)) {
      found = c;
      c = c.parentElement ? c.parentElement.closest(".cmp-container--clickable") : null;
    }
    return found;
  }
  var norm = (s) => (s || "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
  function parse2(element, { document: document2 }) {
    const headings = [...element.querySelectorAll("h1, h2, h3, h4, h5, h6")].filter((h) => h.textContent.trim() && !isDesktopHidden(h, element));
    const tiles = [];
    const seen = /* @__PURE__ */ new Set();
    headings.forEach((h) => {
      const owner = tiles.find((t) => t.root && t.root !== element && t.root.contains(h) && t.heading !== h);
      if (owner) {
        if (norm(owner.heading.textContent) !== norm(h.textContent)) owner.secondary.push(h);
        return;
      }
      const imageContainer = findImageContainer(h, element);
      const textTile = h.closest(".cmp-container");
      let key = imageContainer || textTile || h;
      if (!imageContainer && textTile && textTile !== element) {
        const parentTile = textTile.parentElement ? textTile.parentElement.closest(".cmp-container") : null;
        if (parentTile && parentTile !== element && seen.has(parentTile)) key = parentTile;
      }
      if (seen.has(key)) return;
      seen.add(key);
      const clickable = imageContainer ? null : findClickable(h, element);
      tiles.push({
        heading: h,
        imageContainer,
        tile: imageContainer || textTile || h.parentElement,
        root: imageContainer || clickable || textTile,
        secondary: []
      });
    });
    if (!tiles.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = tiles.map(({ heading, imageContainer, tile, root, secondary }, index) => {
      let imageCell = "";
      if (imageContainer) {
        const existing = imageContainer.querySelector(":scope > picture, :scope > img");
        if (existing) {
          imageCell = existing;
        } else {
          const img = document2.createElement("img");
          img.src = bgSrc(imageContainer);
          img.alt = heading.textContent.trim();
          imageCell = img;
        }
      }
      let tileHeading = heading;
      const level = index === 0 ? "H2" : "H3";
      if (heading.tagName !== level) {
        tileHeading = document2.createElement(level);
        tileHeading.append(...heading.childNodes);
      }
      const textCell = [tileHeading];
      const scope = root || tile;
      const redirectEl = imageContainer && imageContainer.closest("[data-redirect-url]") || heading.closest("[data-redirect-url]");
      const redirect = redirectEl && redirectEl.getAttribute("data-redirect-url");
      let ctaFromHeading = false;
      secondary.forEach((h) => {
        const text = norm(h.textContent);
        const nestedClickable = h.closest(".cmp-container--clickable[data-redirect-url]");
        const p = document2.createElement("p");
        if (nestedClickable && nestedClickable !== redirectEl && !h.querySelector("a")) {
          const a = document2.createElement("a");
          a.href = nestedClickable.getAttribute("data-redirect-url");
          a.textContent = text;
          p.append(a);
          ctaFromHeading = true;
        } else {
          const strong = document2.createElement("strong");
          strong.textContent = text;
          p.append(strong);
        }
        textCell.push(p);
      });
      if (scope) {
        [...scope.querySelectorAll(".cmp-text > p")].filter((p) => !isDesktopHidden(p, element) && norm(p.textContent) && !p.querySelector("a.cmp-button")).forEach((p) => textCell.push(p));
      }
      const cta = ctaFromHeading ? null : [...tile.querySelectorAll("a[href]")].find((a) => !heading.contains(a) && !isDesktopHidden(a, element) && a.textContent.trim() && !textCell.some((n) => n.contains && n.contains(a)));
      if (cta) {
        const p = document2.createElement("p");
        p.append(cta);
        textCell.push(p);
      } else if (!ctaFromHeading && !tileHeading.querySelector("a") && redirect) {
        const a = document2.createElement("a");
        a.href = redirect;
        a.textContent = tileHeading.textContent.trim();
        tileHeading.replaceChildren(a);
      }
      return [imageCell, textCell];
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-mosaic", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-stats.js
  function parse3(element, { document: document2 }) {
    let columns = [...element.querySelectorAll(":scope > .aem-Grid > .aem-GridColumn")].filter((col) => col.querySelector("h1, h2, h3, h4, h5, h6"));
    if (!columns.length) {
      columns = [...element.querySelectorAll(".cmp-text")].filter((t) => t.querySelector("h1, h2, h3, h4, h5, h6"));
    }
    const cells = columns.map((col) => {
      const headings = [...col.querySelectorAll("h1, h2, h3, h4, h5, h6")].filter((h) => h.textContent.trim());
      const value = headings[0];
      const cell = [];
      if (value) cell.push(value);
      headings.slice(1).forEach((h) => {
        const p = document2.createElement("p");
        p.textContent = h.textContent.trim();
        cell.push(p);
      });
      col.querySelectorAll(".cmp-text p").forEach((p) => {
        if (p.textContent.trim()) cell.push(p);
      });
      return cell;
    }).filter((cell) => cell.length);
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-stats", cells: [cells] });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-programs.js
  function resolveImage(img) {
    if (!img) return null;
    const src = img.getAttribute("src") || "";
    if (!src || src.startsWith("data:")) {
      const holder = img.closest("[data-asset], [data-cmp-src]");
      let real = holder && (holder.getAttribute("data-asset") || holder.getAttribute("data-cmp-src"));
      if (real) {
        real = real.replace("{.width}", "");
        img.setAttribute("src", real);
      }
    }
    const cur = img.getAttribute("src") || "";
    if (/\/icon-[^/?#]*$/i.test(cur)) {
      const holder = img.closest("[data-asset]");
      const asset = holder && holder.getAttribute("data-asset") || cur;
      img.setAttribute("src", `${asset}?asset=image`);
    }
    return img;
  }
  function isAd(node) {
    return !!node.querySelector('.cmp-experiencefragment--ros-ad-experience-fragment, h4.adTitle, a.skipAd, iframe, [id^="google_ads"]');
  }
  function parse4(element, { document: document2 }) {
    const grid = element.querySelector(":scope > .aem-Grid") || element;
    const children = [...grid.children];
    const cardEls = children.filter((c) => c.classList.contains("container") && c.querySelector("h2, h3, h4, h5, h6") && !isAd(c));
    const lastCardIndex = cardEls.length ? children.indexOf(cardEls[cardEls.length - 1]) : -1;
    const defaultContent = [];
    const trailingContent = [];
    children.filter((c) => c.classList.contains("text")).forEach((c) => {
      const target = lastCardIndex >= 0 && children.indexOf(c) > lastCardIndex ? trailingContent : defaultContent;
      const text = c.querySelector(".cmp-text") || c;
      [...text.children].forEach((n) => {
        if (n.matches(".cmp-text__icon") && !n.querySelector("img")) return;
        const img = n.matches("img") ? n : null;
        if (img) resolveImage(img);
        n.querySelectorAll("img").forEach(resolveImage);
        if (n.textContent.trim() || n.querySelector("img") || img) target.push(n);
      });
    });
    const cells = cardEls.map((card) => {
      const img = resolveImage(card.querySelector(".cmp-image img, img.cmp-image__image, picture img, img"));
      const isPromo = !!card.querySelector("a.cmp-button");
      const textCell = [];
      const textHeadings = [...card.querySelectorAll(".cmp-text h2, .cmp-text h3, .cmp-text h4, .cmp-text h5, .cmp-text h6")].filter((h) => h.textContent.trim());
      const headingSrc = (textHeadings.length > 1 ? textHeadings.reduce((best, h) => h.tagName < best.tagName ? h : best, textHeadings[0]) : textHeadings[0]) || card.querySelector("h2, h3, h4, h5, h6");
      textHeadings.forEach((h) => {
        if (h === headingSrc) {
          const h3 = document2.createElement("h3");
          h3.append(...h.childNodes);
          textCell.push(h3);
        } else {
          const strong = document2.createElement("strong");
          strong.textContent = h.textContent.replace(/\s+/g, " ").trim();
          const p = document2.createElement("p");
          p.append(strong);
          textCell.push(p);
        }
      });
      if (headingSrc && !textHeadings.includes(headingSrc)) {
        const h3 = document2.createElement("h3");
        h3.append(...headingSrc.childNodes);
        textCell.push(h3);
      }
      card.querySelectorAll(".cmp-text p").forEach((p) => {
        if (p.textContent.replace(/ /g, " ").trim()) textCell.push(p);
      });
      card.querySelectorAll("a.cmp-button").forEach((btn) => {
        const a = document2.createElement("a");
        a.href = btn.getAttribute("href");
        a.textContent = btn.textContent.replace(/\s+/g, " ").trim();
        const strong = document2.createElement("strong");
        strong.append(a);
        const p = document2.createElement("p");
        p.append(strong);
        textCell.push(p);
      });
      if (isPromo === false && !textCell.some((n) => n.querySelector && n.querySelector("a"))) {
        const redirect = card.querySelector("[data-redirect-url]");
        if (redirect && textCell[0]) {
          const a = document2.createElement("a");
          a.href = redirect.getAttribute("data-redirect-url");
          a.append(...textCell[0].childNodes);
          textCell[0].append(a);
        }
      }
      return [img || "", textCell];
    }).filter(([, text]) => text.length);
    if (!cells.length) {
      element.replaceWith(...defaultContent, ...trailingContent);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-programs", cells });
    if (defaultContent.length) element.before(...defaultContent);
    if (trailingContent.length) element.after(...trailingContent);
    element.replaceWith(block);
  }

  // tools/importer/transformers/ustanationalcampus-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var SOURCE_ORIGIN = "https://www.ustanationalcampus.com";
  var LINK_FIXES = {
    "/en/home/connect.html": "/en/home/about.html",
    "/en/home/news/holiday-hours.html": "/en/home/about/holiday-hours.html",
    "/en/home/play/court-booking.html": "/en/home/play/book-a-court.html",
    "/en/home/play/adult-programs.html": "/en/home/play/programs/adult-tennis.html",
    "/en/home/play/nemours-family-zone.html": "/en/home/play/programs/junior-tennis-programs.html",
    "/en/home/news/FreeThirtyMinuteSession.html": "/en/home/play/free30.html",
    "/en/home/collegiate/events.html": "https://www.usta.com/en/home/play/college-tennis.html",
    "/en/home/play/high-performance1.html": "/en/home/play/high-performance.html",
    "/en/home/play/DaveBailey.html": "/en/home/play/davebailey.html",
    "/en/home/play/pickleball2/play-pickleball.html": "/en/home/play/pickleball.html"
  };
  var DECORATIVE_BG = /PlayerSearchBG/i;
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function hasContentBefore(node, root) {
    let n = node;
    while (n && n !== root) {
      let sib = n.previousSibling;
      while (sib) {
        if ((sib.textContent || "").trim()) return true;
        if (sib.nodeType === 1 && (sib.matches("img, picture, table") || sib.querySelector("img, picture, table"))) return true;
        sib = sib.previousSibling;
      }
      n = n.parentNode;
    }
    return false;
  }
  function rewriteLinks(element) {
    element.querySelectorAll("a[href]").forEach((a) => {
      const raw = a.getAttribute("href").trim();
      if (!raw || raw.startsWith("#") || /^(mailto|tel|javascript):/i.test(raw)) return;
      let url;
      try {
        url = new URL(raw, SOURCE_ORIGIN);
      } catch (e) {
        return;
      }
      if (!/(^|\.)ustanationalcampus\.com$/.test(url.hostname) || !url.pathname.startsWith("/en/")) return;
      const fixed = LINK_FIXES[url.pathname];
      if (fixed && /^https?:/.test(fixed)) {
        a.setAttribute("href", fixed);
        return;
      }
      const path = (fixed || url.pathname).replace(/\.html$/, "").split("/").map((seg) => seg.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-")).join("/");
      const params = new URLSearchParams(url.search);
      ["cid", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((k) => params.delete(k));
      const qs = params.toString();
      a.setAttribute("href", `${path}${qs ? `?${qs}` : ""}${url.hash}`);
    });
  }
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, ["#onetrust-consent-sdk"]);
      element.querySelectorAll(".cmp-experiencefragment--ros-ad-experience-fragment").forEach((xf) => {
        const wrapper = xf.closest(".container.responsivegrid");
        const xfColumn = xf.closest("div.experiencefragment") || xf;
        const wrapperHasOtherContent = (w) => {
          const clone = w.cloneNode(true);
          clone.querySelectorAll(".cmp-experiencefragment--ros-ad-experience-fragment, script, style, link, noscript").forEach((n) => n.remove());
          return !!(clone.textContent.trim() || clone.querySelector("img, picture, a[href], iframe, video"));
        };
        if (wrapper && wrapper.id !== "mainContent" && !wrapper.querySelector("#mainContent") && !wrapperHasOtherContent(wrapper)) {
          wrapper.remove();
        } else {
          xfColumn.remove();
        }
      });
      element.querySelectorAll('[class*="aem-GridColumn--default--hide"]').forEach((n) => n.remove());
      WebImporter.DOMUtils.remove(element, ["#mainContent div.calendar", "v-calendar"]);
      element.querySelectorAll('[data-cmp-is="image"], .cmp-image[data-cmp-src], .cmp-image[data-asset]').forEach((holder) => {
        const real = holder.getAttribute("data-asset") || (holder.getAttribute("data-cmp-src") || "").replace("{.width}", "");
        if (!real) return;
        const img = [...holder.querySelectorAll("img")].find((i) => !i.closest("noscript"));
        if (img) {
          const src = img.getAttribute("src") || "";
          if (!src || src.startsWith("data:")) img.setAttribute("src", real);
          if (src.startsWith("blob:")) {
            const template = holder.getAttribute("data-cmp-src") || "";
            const widths = (holder.getAttribute("data-cmp-widths") || "").split(",").map((w) => parseInt(w, 10)).filter((w) => w > 0).sort((a, b) => a - b);
            const rendered = Math.round(img.getBoundingClientRect().width || holder.getBoundingClientRect().width || 0);
            const width = rendered > 0 ? widths.find((w) => w >= rendered) || widths[widths.length - 1] : 0;
            img.setAttribute("src", template.includes("{.width}") && width ? template.replace("{.width}", `.${width}`) : real);
          }
          return;
        }
        const created = document.createElement("img");
        created.setAttribute("src", real);
        const ns = holder.querySelector("noscript");
        const altMatch = ns && ns.textContent.match(/alt="([^"]*)"/);
        created.setAttribute("alt", altMatch && altMatch[1] || holder.getAttribute("data-title") || "");
        const link = holder.querySelector("a[href]");
        if (link) link.append(created);
        else holder.append(created);
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Header XF incl. 'Register for Fall Programming' alert bar, top navigation, breadcrumb
        // <div class="cmp-experiencefragment cmp-experiencefragment--header-xf"> / <div class="header aem-GridColumn ...">
        ".cmp-experiencefragment--header-xf",
        "div.header.aem-GridColumn",
        ".top-navigation",
        "div.breadcrumb.aem-GridColumn",
        // Footer XF: <div class="cmp-experiencefragment cmp-experiencefragment--footer-xf"> / <footer class="nc-footer ...">
        ".cmp-experiencefragment--footer-xf",
        "div.footer.aem-GridColumn",
        "footer.nc-footer",
        // Leftover ad markup (if wrapper removal above did not catch it)
        ".adImageComp",
        "a.skipAd",
        '[id^="skipAd-div-gpt-ad"]',
        '[id^="google_ads_iframe"]',
        "#google_ads_top_frame",
        // Empty AEM separator components: <div class="separator ..."><div class="cmp-separator"><hr class="cmp-separator__horizontal-rule">
        "div.separator.aem-GridColumn",
        ".cmp-separator",
        // Empty personalization placeholders: <div class="phe-block phe-block--s"></div>
        "div.phe-block",
        // Non-content elements
        "iframe",
        "link",
        "noscript",
        "script",
        "style"
      ]);
      element.querySelectorAll('[style*="background-image"], [data-desktop-background-image]').forEach((el) => {
        if (el.closest("table")) return;
        const src = `${el.getAttribute("data-desktop-background-image") || ""} ${el.getAttribute("style") || ""}`;
        if (DECORATIVE_BG.test(src) || !el.textContent.trim()) {
          el.style.removeProperty("background-image");
          el.removeAttribute("data-desktop-background-image");
          el.removeAttribute("data-mobile-background-image");
        }
      });
      element.querySelectorAll("img[src]").forEach((img) => {
        if (img.closest("table")) return;
        const src = img.getAttribute("src");
        if (/\.svg$/i.test(src)) img.setAttribute("src", `${src}?asset=image`);
      });
      element.querySelectorAll("hr").forEach((hr) => {
        if (hasContentBefore(hr, element)) return;
        if (hr.hasAttribute(SECTION_MARKER_ATTR)) {
          const placeholder = document.createElement("div");
          placeholder.setAttribute(SECTION_MARKER_ATTR, hr.getAttribute(SECTION_MARKER_ATTR));
          hr.replaceWith(placeholder);
        } else {
          hr.remove();
        }
      });
      element.querySelectorAll("a.cmp-button").forEach((btn) => {
        if (btn.closest("table")) return;
        const text = (btn.querySelector(".button-core__text-content, .cmp-button__text") || btn).textContent.replace(/\s+/g, " ").trim();
        if (!text || !btn.getAttribute("href")) {
          btn.remove();
          return;
        }
        const a = document.createElement("a");
        a.setAttribute("href", btn.getAttribute("href"));
        a.textContent = text;
        const strong = document.createElement("strong");
        strong.append(a);
        const p = document.createElement("p");
        p.append(strong);
        btn.replaceWith(p);
      });
      element.querySelectorAll(".cmp-container--clickable[data-redirect-url]").forEach((c) => {
        const href = c.getAttribute("data-redirect-url");
        if (!href || c.closest("table") || c.querySelector("a[href]")) return;
        c.querySelectorAll("img").forEach((img) => {
          const a = document.createElement("a");
          a.setAttribute("href", href);
          img.replaceWith(a);
          a.append(img);
        });
      });
      rewriteLinks(element);
    }
  }

  // tools/importer/transformers/ustanationalcampus-sections.js
  var SECTION_MARKER_ATTR2 = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform" && sections.length > 1) {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR2, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform" && sections.length > 1) {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR2}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR2);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-home.js
  var parsers = {
    "hero-overlay": parse,
    "cards-mosaic": parse2,
    "columns-stats": parse3,
    "cards-programs": parse4
  };
  var PAGE_TEMPLATE = {
    "name": "home",
    "description": "USTA National Campus homepage: hero, mosaic tiles, stats, programs grid",
    "urls": [
      "https://www.ustanationalcampus.com/en/home.html"
    ],
    "blocks": [
      {
        "name": "hero-overlay",
        "instances": [
          "#mainContent > .aem-Grid > .container.padding-top-large.full-width > .cmp-container"
        ]
      },
      {
        "name": "cards-mosaic",
        "instances": [
          "#mainContent > .aem-Grid > .container.full-width-limit.inner_full-height > .cmp-container"
        ]
      },
      {
        "name": "columns-stats",
        "instances": [
          "#mainContent > .aem-Grid > .container.padding-left-triple.full-width-limit > .cmp-container"
        ]
      },
      {
        "name": "cards-programs",
        "instances": [
          "#aa-default-programs"
        ]
      }
    ],
    "sections": [
      {
        "id": "1",
        "name": "hero",
        "selector": [
          "#mainContent > .aem-Grid > .container.padding-top-large.full-width"
        ],
        "style": null,
        "blocks": [
          "hero-overlay"
        ],
        "defaultContent": []
      },
      {
        "id": "2",
        "name": "mosaic",
        "selector": [
          "#mainContent > .aem-Grid > .container.full-width-limit.inner_full-height"
        ],
        "style": null,
        "blocks": [
          "cards-mosaic"
        ],
        "defaultContent": []
      },
      {
        "id": "3",
        "name": "stats",
        "selector": [
          "#mainContent > .aem-Grid > .container.padding-left-triple.full-width-limit"
        ],
        "style": null,
        "blocks": [
          "columns-stats"
        ],
        "defaultContent": []
      },
      {
        "id": "5",
        "name": "programs",
        "selector": [
          "#mainContent > .aem-Grid > .container:has(> #aa-default-programs)"
        ],
        "style": "teal-divider",
        "blocks": [
          "cards-programs"
        ],
        "defaultContent": [
          "#aa-default-programs > .aem-Grid > .text .cmp-text"
        ]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        let elements = [];
        try {
          elements = document2.querySelectorAll(selector);
        } catch (e) {
          console.warn(`Invalid selector for "${blockDef.name}": ${selector}`);
        }
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_home_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_home_exports);
})();
