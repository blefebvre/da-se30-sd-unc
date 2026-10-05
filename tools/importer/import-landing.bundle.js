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

  // tools/importer/import-landing.js
  var import_landing_exports = {};
  __export(import_landing_exports, {
    default: () => import_landing_default
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
    const bgImage2 = element.querySelector(":scope > img") || element.querySelector(":scope > picture") || bgImageFrom(element, document2);
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
    if (!heading && !bgImage2) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const variant = detectVariant(element, heading);
    const cells = [];
    if (bgImage2) cells.push([bgImage2]);
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
  function parse3(element, { document: document2 }) {
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

  // tools/importer/parsers/cards-booking.js
  function resolveImage2(img) {
    if (!img) return null;
    const src = img.getAttribute("src") || "";
    if (!src || src.startsWith("data:")) {
      const holder = img.closest("[data-asset], [data-cmp-src]");
      const real = holder && (holder.getAttribute("data-asset") || holder.getAttribute("data-cmp-src"));
      if (real) img.setAttribute("src", real.replace("{.width}", ""));
    }
    const cur = img.getAttribute("src") || "";
    if (/\.svg$/i.test(cur) || /\/icon-[^/?#]*$/i.test(cur)) img.setAttribute("src", `${cur}?asset=image`);
    return img;
  }
  function isBlank(node) {
    return !node.textContent.replace(/ /g, " ").trim() && !node.querySelector("img");
  }
  function textContentNodes(component) {
    const root = component.querySelector(".cmp-text, .cmp-title") || component;
    const nodes = [];
    [...root.children].forEach((n) => {
      if (n.matches(".cmp-text__icon, .phe-block") && !n.querySelector("img")) return;
      n.querySelectorAll("img").forEach(resolveImage2);
      if (!isBlank(n)) nodes.push(n);
    });
    return nodes;
  }
  function parse4(element, { document: document2 }) {
    const grid = element.querySelector(":scope > .aem-Grid") || element;
    const children = [...grid.children];
    const before = [];
    const after = [];
    const cells = [];
    children.forEach((child) => {
      if (child.classList.contains("teaser") || child.querySelector(":scope > .cmp-teaser")) {
        const teaser = child.querySelector(".cmp-teaser") || child;
        const img = resolveImage2(teaser.querySelector(".cmp-teaser__image img, img"));
        const textCell = [];
        const titleSrc = teaser.querySelector(".cmp-teaser__title_scalable") || teaser.querySelector(".cmp-teaser__title:not(.cmp-teaser__title_hidden)") || teaser.querySelector(".cmp-teaser__title");
        if (titleSrc) {
          const h3 = document2.createElement("h3");
          h3.textContent = titleSrc.textContent.replace(/\s+/g, " ").trim();
          textCell.push(h3);
        }
        const desc = teaser.querySelector(".cmp-teaser__description");
        if (desc) {
          const paras = [...desc.querySelectorAll(":scope > p, :scope > ul, :scope > ol")];
          if (paras.length) {
            paras.forEach((p) => {
              if (!isBlank(p)) textCell.push(p);
            });
          } else if (!isBlank(desc)) {
            const p = document2.createElement("p");
            p.textContent = desc.textContent.trim();
            textCell.push(p);
          }
        }
        const action = teaser.querySelector("a.cmp-teaser__action-link[href]");
        if (action) {
          const a = document2.createElement("a");
          a.href = action.getAttribute("href");
          a.textContent = action.textContent.replace(/\s+/g, " ").trim().toUpperCase();
          const strong = document2.createElement("strong");
          strong.append(a);
          const p = document2.createElement("p");
          p.append(strong);
          textCell.push(p);
        }
        if (img || textCell.length) cells.push([img || "", textCell]);
        return;
      }
      if (child.classList.contains("separator")) return;
      if (child.classList.contains("title") || child.classList.contains("text")) {
        const nodes = textContentNodes(child);
        (cells.length ? after : before).push(...nodes);
      }
    });
    if (!cells.length) {
      element.replaceWith(...before, ...after);
      return;
    }
    const tiles = children.filter((c) => c.classList.contains("tile"));
    const three = tiles.length > 0 && tiles.every((c) => c.classList.contains("aem-GridColumn--default--4"));
    const name = three ? "cards-booking (three)" : "cards-booking";
    const block = WebImporter.Blocks.createBlock(document2, { name, cells });
    if (before.length) element.before(...before);
    if (after.length) element.after(...after);
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-logos.js
  function resolveImage3(img) {
    if (!img) return null;
    const src = img.getAttribute("src") || "";
    if (!src || src.startsWith("data:")) {
      const holder = img.closest("[data-asset], [data-cmp-src]");
      const real = holder && (holder.getAttribute("data-asset") || holder.getAttribute("data-cmp-src"));
      if (real) img.setAttribute("src", real.replace("{.width}", ""));
    }
    const cur = img.getAttribute("src") || "";
    if (/\.svg$/i.test(cur) || /\/icon-[^/?#]*$/i.test(cur)) img.setAttribute("src", `${cur}?asset=image`);
    return img;
  }
  function hostLabel(url) {
    try {
      return new URL(url, "https://www.ustanationalcampus.com").hostname.replace(/^www\./, "");
    } catch (e) {
      return url;
    }
  }
  function parse5(element, { document: document2 }) {
    const grid = element.querySelector(":scope > .aem-Grid") || element;
    let items = [...grid.children].filter((c) => c.querySelector(".cmp-image img, img"));
    if (!items.length) items = [...element.querySelectorAll(".image")];
    const cells = [];
    items.forEach((item) => {
      const img = resolveImage3(item.querySelector(".cmp-image img, img"));
      if (!img) return;
      const holder = img.closest(".cmp-image");
      const redirectEl = item.matches("[data-redirect-url]") ? item : item.querySelector("[data-redirect-url]");
      const anchor = item.querySelector("a[href]");
      const href = redirectEl && redirectEl.getAttribute("data-redirect-url") || anchor && anchor.getAttribute("href");
      const alt = (img.getAttribute("alt") || "").trim();
      const title = holder ? (holder.getAttribute("data-title") || "").trim() : "";
      const name = alt || title || (href ? hostLabel(href) : "");
      if (!alt && name) img.setAttribute("alt", name);
      let linkCell = "";
      if (href) {
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = name || href;
        linkCell = a;
      }
      cells.push([img, linkCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-logos", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-feature.js
  function resolveImage4(img) {
    if (!img) return null;
    const src = img.getAttribute("src") || "";
    if (!src || src.startsWith("data:")) {
      const holder = img.closest("[data-asset], [data-cmp-src]");
      const real = holder && (holder.getAttribute("data-asset") || holder.getAttribute("data-cmp-src"));
      if (real) img.setAttribute("src", real.replace("{.width}", ""));
    }
    const cur = img.getAttribute("src") || "";
    if (/\.svg$/i.test(cur) || /\/icon-[^/?#]*$/i.test(cur)) img.setAttribute("src", `${cur}?asset=image`);
    return img;
  }
  function backgroundImage(container, document2) {
    if (!container) return null;
    let src = container.getAttribute("data-desktop-background-image");
    if (!src) {
      const m = (container.getAttribute("style") || "").match(/background-image:\s*url\((['"]|&quot;)?([^'")&]+)\1?\)/i);
      if (m) [, , src] = m;
    }
    if (!src) return null;
    const img = document2.createElement("img");
    img.setAttribute("src", src);
    img.setAttribute("alt", "");
    return resolveImage4(img);
  }
  function isBlank2(node) {
    return !node.textContent.replace(/ /g, " ").trim() && !node.querySelector("img");
  }
  function buildText(textComponent, document2) {
    const root = textComponent.querySelector(".cmp-text") || textComponent;
    const out = [];
    [...root.children].forEach((n) => {
      if (n.matches(".cmp-text__icon, .phe-block") && !n.querySelector("img")) return;
      if (isBlank2(n)) return;
      if (/^H[1-6]$/.test(n.tagName)) {
        const h2 = document2.createElement("h2");
        h2.append(...n.childNodes);
        out.push(h2);
        return;
      }
      n.querySelectorAll("img").forEach(resolveImage4);
      out.push(n);
    });
    return out;
  }
  function parse6(element, { document: document2 }) {
    const grid = element.querySelector(":scope > .aem-Grid") || element;
    const cardEls = [...grid.children].filter((c) => c.classList.contains("container") && c.querySelector(".text"));
    const cards = cardEls.map((card) => {
      const inner = card.querySelector(":scope > .cmp-container > .aem-Grid") || card;
      const textComp = inner.querySelector(":scope > .text") || card.querySelector(".text");
      let img = resolveImage4(inner.querySelector(":scope > .image .cmp-image img, :scope > .image img"));
      if (!img) {
        const bg = inner.querySelector(':scope > .container > .cmp-container[data-desktop-background-image], :scope > .container > .cmp-container[style*="background-image"]') || card.querySelector(".cmp-container[data-desktop-background-image]");
        img = backgroundImage(bg, document2);
      }
      if (!img) img = resolveImage4(card.querySelector(".cmp-image img"));
      const wide = !card.classList.contains("aem-GridColumn--default--6") && (card.classList.contains("aem-GridColumn--default--12") || !inner.querySelector(":scope > .image"));
      return { wide, row: [img || "", textComp ? buildText(textComp, document2) : []] };
    }).filter(({ row }) => row[0] || row[1].length);
    if (!cards.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const groups = [];
    cards.forEach((c) => {
      const last = groups[groups.length - 1];
      if (last && last.wide === c.wide) last.cells.push(c.row);
      else groups.push({ wide: c.wide, cells: [c.row] });
    });
    const blocks = groups.map((g) => WebImporter.Blocks.createBlock(document2, {
      name: g.wide ? "cards-feature (wide)" : "cards-feature",
      cells: g.cells
    }));
    const block = blocks.shift();
    if (blocks.length) element.after(...blocks);
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-media.js
  function resolveImage5(img) {
    if (!img) return null;
    const src = img.getAttribute("src") || "";
    if (!src || src.startsWith("data:")) {
      const holder = img.closest("[data-asset], [data-cmp-src]");
      const real = holder && (holder.getAttribute("data-asset") || holder.getAttribute("data-cmp-src"));
      if (real) img.setAttribute("src", real.replace("{.width}", ""));
    }
    const cur = img.getAttribute("src") || "";
    if (/\.svg$/i.test(cur) || /\/icon-[^/?#]*$/i.test(cur)) {
      const holder = img.closest("[data-asset]");
      const asset = holder && holder.getAttribute("data-asset") || cur;
      img.setAttribute("src", `${asset}?asset=image`);
    }
    return img;
  }
  function isBlank3(node) {
    return !node.textContent.replace(/ /g, " ").trim() && !node.querySelector("img");
  }
  function textNodes(textComponent) {
    const root = textComponent.querySelector(".cmp-text") || textComponent;
    const out = [];
    [...root.children].forEach((n) => {
      if (n.matches(".cmp-text__icon, .phe-block") && !n.querySelector("img")) return;
      n.querySelectorAll("img").forEach(resolveImage5);
      if (!isBlank3(n)) out.push(n);
    });
    return out;
  }
  function buttonNode(btn, document2) {
    const a = document2.createElement("a");
    a.href = btn.getAttribute("href");
    const label = btn.querySelector(".button-core__text-content") || btn;
    a.textContent = label.textContent.replace(/\s+/g, " ").trim();
    const strong = document2.createElement("strong");
    strong.append(a);
    const p = document2.createElement("p");
    p.append(strong);
    return p;
  }
  function imageParagraph(img, document2) {
    const p = document2.createElement("p");
    p.append(img);
    return p;
  }
  function collect(gridEl, document2, out) {
    [...gridEl.children].forEach((c) => {
      if (c.matches('[class*="aem-GridColumn--default--hide"]')) return;
      if (c.classList.contains("text")) out.push(...textNodes(c));
      else if (c.classList.contains("button")) {
        const btn = c.querySelector("a.cmp-button[href], a[href]");
        if (btn) out.push(buttonNode(btn, document2));
      } else if (c.classList.contains("image")) {
        const img = resolveImage5(c.querySelector(".cmp-image img, img"));
        if (img) out.push(imageParagraph(img, document2));
      } else if (c.classList.contains("container")) {
        const g = c.querySelector(":scope > .cmp-container > .aem-Grid");
        if (g) collect(g, document2, out);
      }
    });
    return out;
  }
  function width(el) {
    const m = (el.getAttribute("class") || "").match(/aem-GridColumn--default--(\d+)/);
    return m ? parseInt(m[1], 10) : 12;
  }
  function isPairPart(c) {
    return (c.classList.contains("image") || c.classList.contains("text") || c.classList.contains("container")) && !c.classList.contains("container--full-width-deep-container") && !c.matches('[class*="aem-GridColumn--default--hide"]') && width(c) < 12;
  }
  function captionNode(imageComp, document2) {
    const cap = imageComp.querySelector(".cmp-image__title");
    const text = cap && cap.textContent.replace(/\s+/g, " ").trim();
    if (!text) return null;
    const em = document2.createElement("em");
    em.textContent = text;
    const p = document2.createElement("p");
    p.append(em);
    return p;
  }
  function parse7(element, { document: document2 }) {
    const grid = element.querySelector(":scope > .aem-Grid") || element;
    const before = [];
    const cells = [];
    const captions = [];
    const kids = [...grid.children];
    let members = kids;
    const leadNodes = [];
    const trailNodes = [];
    const extras = kids.filter((c) => !c.classList.contains("separator") && !c.classList.contains("container--full-width-deep-container") && !c.matches('[class*="aem-GridColumn--default--hide"]') && !isPairPart(c));
    if (extras.length) {
      let imgIdx = kids.findIndex((c) => c.classList.contains("image") && isPairPart(c) && [5, 6].includes(width(c)));
      if (imgIdx < 0) imgIdx = kids.findIndex((c) => c.classList.contains("image") && isPairPart(c));
      if (imgIdx >= 0) {
        let start = imgIdx;
        let end = imgIdx;
        while (start > 0 && isPairPart(kids[start - 1])) start -= 1;
        while (end < kids.length - 1 && isPairPart(kids[end + 1])) end += 1;
        members = kids.slice(start, end + 1);
        leadNodes.push(...kids.slice(0, start));
        trailNodes.push(...kids.slice(end + 1));
      }
    }
    members.forEach((c) => {
      if (c.classList.contains("separator")) return;
      if (c.matches('[class*="aem-GridColumn--default--hide"]')) return;
      if (c.classList.contains("container--full-width-deep-container")) {
        const g = c.querySelector(":scope > .cmp-container > .aem-Grid") || c;
        collect(g, document2, before);
        return;
      }
      if (c.classList.contains("image")) {
        const img = resolveImage5(c.querySelector(".cmp-image img, img"));
        if (img) cells.push(img);
        const cap = captionNode(c, document2);
        if (cap) captions.push(cap);
        return;
      }
      const content = collect({ children: [c] }, document2, []);
      if (content.length) cells.push(content);
    });
    if (!cells.length) {
      element.replaceWith(...leadNodes, ...before, ...trailNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-media", cells: [cells] });
    if (leadNodes.length || before.length) element.before(...leadNodes, ...before);
    if (captions.length || trailNodes.length) element.after(...captions, ...trailNodes);
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-split.js
  function resolveImage6(img) {
    if (!img) return null;
    const src = img.getAttribute("src") || "";
    if (!src || src.startsWith("data:")) {
      const holder = img.closest("[data-asset], [data-cmp-src]");
      const real = holder && (holder.getAttribute("data-asset") || holder.getAttribute("data-cmp-src"));
      if (real) img.setAttribute("src", real.replace("{.width}", ""));
    }
    const cur = img.getAttribute("src") || "";
    if (/\.svg$/i.test(cur) || /\/icon-[^/?#]*$/i.test(cur)) img.setAttribute("src", `${cur}?asset=image`);
    return img;
  }
  function backgroundUrl(container) {
    if (!container) return null;
    const data = container.getAttribute("data-desktop-background-image");
    if (data) return data;
    const m = (container.getAttribute("style") || "").match(/background-image:\s*url\(\s*(?:&quot;|["'])?([^"')&]+)/i);
    return m ? m[1] : null;
  }
  function isBlank4(node) {
    return !node.textContent.replace(/ /g, " ").trim() && !node.querySelector("img");
  }
  function accordionItems(accordion) {
    const root = accordion.querySelector(".cmp-accordion") || accordion;
    return [...root.querySelectorAll(".cmp-accordion__item")].filter((it) => it.parentElement.closest(".cmp-accordion") === root);
  }
  function tableToList(table, document2) {
    const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
    let rows = [...table.querySelectorAll(".aem-responsive-table__row")];
    let cellSel = ":scope > .aem-responsive-table__column";
    if (!rows.length) {
      rows = [...table.querySelectorAll("tr")];
      cellSel = ":scope > th, :scope > td";
    }
    const data = rows.map((r) => [...r.querySelectorAll(cellSel)].map((c) => clean(c.textContent))).filter((cells) => cells.some(Boolean));
    if (!data.length) return [];
    const [header, ...body] = data;
    const p = document2.createElement("p");
    const strong = document2.createElement("strong");
    strong.textContent = header.filter(Boolean).join(" \u2013 ");
    p.append(strong);
    const out = [p];
    if (body.length) {
      const ul = document2.createElement("ul");
      body.forEach((cells) => {
        const li = document2.createElement("li");
        li.textContent = cells.filter(Boolean).join(" \u2013 ");
        ul.append(li);
      });
      out.push(ul);
    }
    return out;
  }
  function buttonNode2(btn, document2) {
    const a = document2.createElement("a");
    a.href = btn.getAttribute("href");
    const label = btn.querySelector(".button-core__text-content") || btn;
    a.textContent = label.textContent.replace(/\s+/g, " ").trim();
    const strong = document2.createElement("strong");
    strong.append(a);
    const p = document2.createElement("p");
    p.append(strong);
    return p;
  }
  function parse8(element, { document: document2 }) {
    const grid = element.querySelector(":scope > .aem-Grid") || element;
    const columns = [...grid.children].filter((c) => !c.matches('[class*="aem-GridColumn--default--hide"], .separator'));
    let media = "";
    const panel = [];
    let headingCount = 0;
    const addText = (textComp) => {
      const root = textComp.querySelector(".cmp-text") || textComp;
      [...root.children].forEach((n) => {
        if (n.matches(".cmp-text__icon, .phe-block") && !n.querySelector("img")) return;
        if (isBlank4(n)) return;
        n.removeAttribute("style");
        if (/^H[1-6]$/.test(n.tagName)) {
          const h = document2.createElement(headingCount === 0 ? "h2" : "h3");
          h.textContent = n.textContent.replace(/\s+/g, " ").trim();
          headingCount += 1;
          panel.push(h);
          return;
        }
        n.querySelectorAll("[style]").forEach((s) => s.removeAttribute("style"));
        n.querySelectorAll("img").forEach(resolveImage6);
        panel.push(n);
      });
    };
    const walk = (gridEl) => {
      [...gridEl.children].forEach((c) => {
        if (c.matches('[class*="aem-GridColumn--default--hide"], .separator')) return;
        if (c.classList.contains("text")) addText(c);
        else if (c.classList.contains("button")) {
          const btn = c.querySelector("a.cmp-button[href], a[href]");
          if (btn) panel.push(buttonNode2(btn, document2));
        } else if (c.classList.contains("image") && !media) {
          media = resolveImage6(c.querySelector(".cmp-image img, img")) || "";
        } else if (c.classList.contains("accordion")) {
          accordionItems(c).forEach((item) => {
            const t = item.querySelector(":scope > .cmp-accordion__header .cmp-accordion__title") || item.querySelector(".cmp-accordion__title");
            const title = t && t.textContent.replace(/\s+/g, " ").trim();
            if (title) {
              const h = document2.createElement("h3");
              h.textContent = title;
              headingCount += 1;
              panel.push(h);
            }
            const body = item.querySelector(":scope > .cmp-accordion__panel");
            if (body) walk(body);
          });
        } else if (c.classList.contains("table")) {
          panel.push(...tableToList(c, document2));
        } else if (c.classList.contains("container")) {
          const g = c.querySelector(":scope > .cmp-container > .aem-Grid");
          if (g) walk(g);
        } else if (c.closest(".cmp-accordion__panel") && !c.matches("link, script, style")) {
          walk(c);
        }
      });
    };
    columns.forEach((col) => {
      const bgContainer = col.querySelector(':scope > .cmp-container[data-desktop-background-image], :scope > .cmp-container[style*="background-image"]');
      if (!media && bgContainer && !bgContainer.querySelector(".text")) {
        const src = backgroundUrl(bgContainer);
        if (src) {
          const img = document2.createElement("img");
          img.setAttribute("src", src);
          img.setAttribute("alt", "");
          media = resolveImage6(img);
          return;
        }
      }
      if (col.classList.contains("text")) addText(col);
      else if (col.classList.contains("image") && !media) media = resolveImage6(col.querySelector("img")) || "";
      else {
        const g = col.querySelector(":scope > .cmp-container > .aem-Grid");
        if (g) walk(g);
      }
    });
    if (!media && !panel.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const bg = ((element.getAttribute("style") || "").match(/background-color\s*:\s*([^;]+)/i) || [])[1] || "";
    const isTeal = /#92bfb7/i.test(bg.trim()) || /rgb\(\s*146\s*,\s*191\s*,\s*183\s*\)/i.test(bg);
    const isOrange = /#f0aa54/i.test(bg) || /rgba?\(\s*240\s*,\s*170\s*,\s*84\s*[,)]/i.test(bg);
    const isClay = /#c15642/i.test(bg) || /rgba?\(\s*193\s*,\s*86\s*,\s*66\s*[,)]/i.test(bg);
    let name = "columns-split";
    if (isTeal) name = "columns-split (teal)";
    else if (isOrange) name = "columns-split (orange)";
    else if (isClay) name = "columns-split (clay)";
    const block = WebImporter.Blocks.createBlock(document2, { name, cells: [[media, panel]] });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-gallery.js
  function resolveImage7(img) {
    if (!img) return null;
    const src = img.getAttribute("src") || "";
    if (!src || src.startsWith("data:")) {
      const holder = img.closest("[data-asset], [data-cmp-src]");
      const real = holder && (holder.getAttribute("data-asset") || holder.getAttribute("data-cmp-src"));
      if (real) img.setAttribute("src", real.replace("{.width}", ""));
    }
    const cur = img.getAttribute("src") || "";
    if (/\.svg$/i.test(cur) || /\/icon-[^/?#]*$/i.test(cur)) {
      const holder = img.closest("[data-asset]");
      const asset = holder && holder.getAttribute("data-asset") || cur;
      img.setAttribute("src", `${asset}?asset=image`);
    }
    return img;
  }
  function isBlank5(node) {
    return !node.textContent.replace(/ /g, " ").trim() && !node.querySelector("img");
  }
  function isHidden(c) {
    return c.matches('[class*="aem-GridColumn--default--hide"], .separator');
  }
  function textChildren(textComp) {
    const root = textComp.querySelector(".cmp-text") || textComp;
    return [...root.children].filter((n) => !(n.matches(".cmp-text__icon, .phe-block") && !n.querySelector("img")) && !isBlank5(n));
  }
  function imageParagraph2(img, document2) {
    const p = document2.createElement("p");
    p.append(img);
    return p;
  }
  function innerGrid(container) {
    return container.querySelector(":scope > .cmp-container > .aem-Grid");
  }
  function bgImage(container, document2) {
    const holder = container.querySelector(':scope > .cmp-container[data-desktop-background-image], :scope > .cmp-container[style*="background-image"]');
    if (!holder) return null;
    let src = holder.getAttribute("data-desktop-background-image");
    if (!src) {
      const m = (holder.getAttribute("style") || "").match(/background-image:\s*url\(\s*(?:&quot;|["'])?([^"')&]+)/i);
      if (m) [, src] = m;
    }
    if (!src) return null;
    const img = document2.createElement("img");
    img.setAttribute("src", src);
    img.setAttribute("alt", "");
    return resolveImage7(img);
  }
  function buildCta(clickable, document2) {
    const href = clickable.getAttribute("data-redirect-url");
    const grid = clickable.querySelector(":scope > .aem-Grid") || clickable;
    const cta = [];
    let linkAdded = false;
    [...grid.children].forEach((c) => {
      if (isHidden(c)) return;
      if (c.classList.contains("text")) {
        textChildren(c).forEach((n) => {
          if (/^H[1-6]$/.test(n.tagName)) {
            const h3 = document2.createElement("h3");
            h3.textContent = n.textContent.replace(/\s+/g, " ").trim();
            cta.push(h3);
          } else if (!linkAdded && href && !n.querySelector("a")) {
            const a = document2.createElement("a");
            a.href = href;
            a.textContent = n.textContent.replace(/\s+/g, " ").trim();
            const p = document2.createElement("p");
            p.append(a);
            cta.push(p);
            linkAdded = true;
          } else {
            cta.push(n);
            if (n.querySelector("a")) linkAdded = true;
          }
        });
      } else if (c.classList.contains("image")) {
        if (linkAdded) return;
        const img = resolveImage7(c.querySelector(".cmp-image img, img"));
        if (img) cta.push(imageParagraph2(img, document2));
      }
    });
    if (!linkAdded && href) {
      const a = document2.createElement("a");
      a.href = href;
      a.textContent = href;
      const p = document2.createElement("p");
      p.append(a);
      cta.push(p);
    }
    return cta;
  }
  function parse9(element, { document: document2 }) {
    const grid = element.querySelector(":scope > .aem-Grid") || element;
    const before = [];
    const cells = [];
    [...grid.children].forEach((c) => {
      if (isHidden(c)) return;
      if (c.classList.contains("container--full-width-deep-container")) {
        const g2 = innerGrid(c) || c;
        [...g2.children].forEach((k) => {
          if (isHidden(k)) return;
          if (k.classList.contains("image")) {
            const img = resolveImage7(k.querySelector(".cmp-image img, img"));
            if (img) before.push(imageParagraph2(img, document2));
          } else if (k.classList.contains("text")) {
            before.push(...textChildren(k));
          }
        });
        return;
      }
      if (c.classList.contains("text")) {
        if (cells.length) return;
        before.push(...textChildren(c));
        return;
      }
      if (!c.classList.contains("container")) return;
      const clickable = c.querySelector(":scope > .cmp-container--clickable[data-redirect-url]");
      if (clickable) {
        cells.push(buildCta(clickable, document2));
        return;
      }
      const g = innerGrid(c);
      const thumbs = g ? [...g.querySelectorAll(":scope > .image")].filter((i) => !isHidden(i)) : [];
      if (thumbs.length) {
        const imgs = thumbs.map((i) => resolveImage7(i.querySelector(".cmp-image img, img"))).filter(Boolean);
        if (imgs.length) cells.push(imgs.map((img) => imageParagraph2(img, document2)));
        return;
      }
      const tall = bgImage(c, document2);
      if (tall) cells.push(tall);
    });
    if (!cells.length) {
      element.replaceWith(...before);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-gallery", cells: [cells] });
    if (before.length) element.before(...before);
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
            const width2 = rendered > 0 ? widths.find((w) => w >= rendered) || widths[widths.length - 1] : 0;
            img.setAttribute("src", template.includes("{.width}") && width2 ? template.replace("{.width}", `.${width2}`) : real);
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

  // tools/importer/import-landing.js
  var parsers = {
    "hero-overlay": parse,
    "cards-mosaic": parse2,
    "cards-programs": parse3,
    "cards-booking": parse4,
    "cards-logos": parse5,
    "cards-feature": parse6,
    "columns-media": parse7,
    "columns-split": parse8,
    "columns-gallery": parse9
  };
  var PAGE_TEMPLATE = {
    "name": "landing",
    "description": "Core-component grid landing pages (hero banners, tile mosaics, card grids, text/image columns, contact/app CTA bands)",
    "urls": [
      "https://www.ustanationalcampus.com/en/home/about.html",
      "https://www.ustanationalcampus.com/en/home/about/sponsors---partners.html",
      "https://www.ustanationalcampus.com/en/home/events.html",
      "https://www.ustanationalcampus.com/en/home/play.html",
      "https://www.ustanationalcampus.com/en/home/calendar.html",
      "https://www.ustanationalcampus.com/en/home/play/programs.html",
      "https://www.ustanationalcampus.com/en/home/watch.html",
      "https://www.ustanationalcampus.com/en/home/play/book-a-court.html",
      "https://www.ustanationalcampus.com/en/home/about/holiday-hours.html",
      "https://www.ustanationalcampus.com/en/home/about/usta-national-campus-scholarship.html"
    ],
    "blocks": [
      {
        "name": "hero-overlay",
        "instances": [
          "#mainContent .cmp-container[data-desktop-background-image]:not(.cmp-container--clickable):not(:has(.cmp-container--clickable)):has(h1)"
        ]
      },
      {
        "name": "cards-mosaic",
        "instances": [
          "#mainContent .container.full-width-limit.inner_full-height > .cmp-container"
        ]
      },
      {
        "name": "cards-programs",
        "instances": [
          "#aa-default-programs:not(:has(#aa-default-programs))"
        ]
      },
      {
        "name": "cards-booking",
        "instances": [
          "#mainContent .cmp-container:has(> .aem-Grid > .tile.teaser)"
        ]
      },
      {
        "name": "cards-logos",
        "instances": [
          "#mainContent .container.align-items-center > .cmp-container:has(> .aem-Grid > .container > .cmp-container--clickable .image):not(:has(> .aem-Grid > .text))"
        ]
      },
      {
        "name": "cards-feature",
        "instances": [
          "#mainContent > .aem-Grid > .container > .cmp-container:has(> .aem-Grid > .container.full-width > .cmp-container > .aem-Grid > .image ~ .text)"
        ]
      },
      {
        "name": "columns-media",
        "instances": [
          "#mainContent .cmp-container:has(> .aem-Grid > .image[class*='aem-GridColumn--mobile--hide'])"
        ]
      },
      {
        "name": "columns-split",
        "instances": [
          "#mainContent .cmp-container[style*='background-color']:has(> .aem-Grid > .container > .cmp-container[data-desktop-background-image]:not(.cmp-container--clickable)):has(> .aem-Grid > .container > .cmp-container .text)"
        ]
      },
      {
        "name": "columns-gallery",
        "instances": [
          "#mainContent .cmp-container:has(> .aem-Grid > .container > .cmp-container--clickable[data-redirect-url] .text):has(> .aem-Grid > .container > .cmp-container > .aem-Grid > .image ~ .image ~ .image ~ .image)"
        ]
      }
    ],
    "sections": [
      {
        "id": "1",
        "name": "intro",
        "selector": [
          "#mainContent > .aem-Grid > .container:first-child"
        ],
        "style": null,
        "blocks": [
          "hero-overlay",
          "cards-mosaic"
        ],
        "defaultContent": [
          "#mainContent .text h1",
          "#aa-default-programs > .aem-Grid > .text .cmp-text",
          "#mainContent > .aem-Grid > .container > .cmp-container > .aem-Grid > .text .cmp-text"
        ]
      },
      {
        "id": "2",
        "name": "icon-heading",
        "selector": [
          "#mainContent > .aem-Grid > .container:has(.container--full-width-deep-container > .cmp-container > .aem-Grid > .image + .text h2)"
        ],
        "style": "icon-heading",
        "blocks": [
          "columns-media",
          "columns-gallery",
          "cards-feature"
        ],
        "defaultContent": [
          ".container--full-width-deep-container > .cmp-container > .aem-Grid > .image",
          ".container--full-width-deep-container > .cmp-container > .aem-Grid > .text h2",
          ".cmp-container > .aem-Grid > .text .cmp-text p"
        ]
      },
      {
        "id": "3",
        "name": "title-rule",
        "selector": [
          "#mainContent .container:has(> .cmp-container > .aem-Grid > .title + .separator--background--dusty-clay)"
        ],
        "style": "title-rule",
        "blocks": [
          "hero-overlay",
          "cards-booking"
        ],
        "defaultContent": [
          ".title .cmp-title h1",
          ".text.label-style .cmp-text",
          ".cmp-container:has(> .aem-Grid > .tile.teaser) > .aem-Grid > .text .cmp-text"
        ]
      },
      {
        "id": "4",
        "name": "clay-band",
        "selector": [
          "#mainContent > .aem-Grid > .container:has(> .cmp-container[style*='#C15642'])",
          "#mainContent > .aem-Grid > .container.margin-top-small:has(> .cmp-container > .aem-Grid > .button)"
        ],
        "style": "clay",
        "blocks": [],
        "defaultContent": [
          ".button a.cmp-button"
        ]
      },
      {
        "id": "5",
        "name": "calendar-glance",
        "selector": [
          "#mainContent .container:has(> #aa-default-programs > .aem-Grid > .separator--background--dusty-clay)"
        ],
        "style": "dusty-clay-divider",
        "blocks": [
          "cards-programs"
        ],
        "defaultContent": [
          "#aa-default-programs > .aem-Grid > .text .cmp-text h2",
          ".button a.cmp-button"
        ]
      },
      {
        "id": "6",
        "name": "sponsors-intro",
        "selector": [
          "#mainContent .container:has(> .cmp-container > .aem-Grid > .text ~ .container.align-items-center > .cmp-container > .aem-Grid > .container > .cmp-container--clickable .image)"
        ],
        "style": "centered",
        "blocks": [
          "cards-logos"
        ],
        "defaultContent": [
          ".cmp-container > .aem-Grid > .text .cmp-text"
        ]
      },
      {
        "id": "7",
        "name": "split",
        "selector": [
          "#mainContent .cmp-container[style*='background-color']:has(> .aem-Grid > .container > .cmp-container[data-desktop-background-image]:not(.cmp-container--clickable)):has(> .aem-Grid > .container > .cmp-container .text)"
        ],
        "style": null,
        "blocks": [
          "columns-split"
        ],
        "defaultContent": []
      },
      {
        "id": "8",
        "name": "centered-cta",
        "selector": [
          "#mainContent > .aem-Grid > .container > .cmp-container:not([data-desktop-background-image]) > .aem-Grid > .container:has(> .cmp-container > .aem-Grid > .text ~ .button)"
        ],
        "style": "centered",
        "blocks": [],
        "defaultContent": [
          ".text .cmp-text h1",
          ".text .cmp-text p",
          ".button a.cmp-button"
        ]
      },
      {
        "id": "9",
        "name": "gradient",
        "selector": [
          "#mainContent .container:has(> .cmp-container[style*='linear-gradient'])"
        ],
        "style": "gradient",
        "blocks": [],
        "defaultContent": [
          ".text .cmp-text h2",
          ".text .cmp-text h5",
          ".button a.cmp-button"
        ]
      },
      {
        "id": "10",
        "name": "contact",
        "selector": [
          "#mainContent .container.vertical-right-white-stripe.vertical-left-white-stripe:has(a[href^='mailto:'])"
        ],
        "style": "contact-band",
        "blocks": [],
        "defaultContent": [
          ".text .cmp-text h2",
          ".button a.cmp-button"
        ]
      },
      {
        "id": "11",
        "name": "app-download",
        "selector": [
          "#mainContent .container.container--full-width-deep-container:has(a[href*='apps.apple.com'])"
        ],
        "style": "centered",
        "blocks": [],
        "defaultContent": [
          ".text .cmp-text p",
          ".cmp-container--clickable .image a"
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
  var import_landing_default = {
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
  return __toCommonJS(import_landing_exports);
})();
