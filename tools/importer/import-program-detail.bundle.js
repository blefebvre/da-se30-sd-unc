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

  // tools/importer/import-program-detail.js
  var import_program_detail_exports = {};
  __export(import_program_detail_exports, {
    default: () => import_program_detail_default
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

  // tools/importer/parsers/columns-split.js
  function resolveImage(img) {
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
  function isBlank(node) {
    return !node.textContent.replace(/ /g, " ").trim() && !node.querySelector("img");
  }
  function accordionItems(accordion) {
    const root = accordion.querySelector(".cmp-accordion") || accordion;
    return [...root.querySelectorAll(".cmp-accordion__item")].filter((it) => it.parentElement.closest(".cmp-accordion") === root);
  }
  function tableToList(table, document2) {
    const clean6 = (s) => (s || "").replace(/\s+/g, " ").trim();
    let rows = [...table.querySelectorAll(".aem-responsive-table__row")];
    let cellSel = ":scope > .aem-responsive-table__column";
    if (!rows.length) {
      rows = [...table.querySelectorAll("tr")];
      cellSel = ":scope > th, :scope > td";
    }
    const data = rows.map((r) => [...r.querySelectorAll(cellSel)].map((c) => clean6(c.textContent))).filter((cells) => cells.some(Boolean));
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
  function parse2(element, { document: document2 }) {
    const grid = element.querySelector(":scope > .aem-Grid") || element;
    const columns = [...grid.children].filter((c) => !c.matches('[class*="aem-GridColumn--default--hide"], .separator'));
    let media = "";
    const panel = [];
    let headingCount = 0;
    const addText = (textComp) => {
      const root = textComp.querySelector(".cmp-text") || textComp;
      [...root.children].forEach((n) => {
        if (n.matches(".cmp-text__icon, .phe-block") && !n.querySelector("img")) return;
        if (isBlank(n)) return;
        n.removeAttribute("style");
        if (/^H[1-6]$/.test(n.tagName)) {
          const h = document2.createElement(headingCount === 0 ? "h2" : "h3");
          h.textContent = n.textContent.replace(/\s+/g, " ").trim();
          headingCount += 1;
          panel.push(h);
          return;
        }
        n.querySelectorAll("[style]").forEach((s) => s.removeAttribute("style"));
        n.querySelectorAll("img").forEach(resolveImage);
        panel.push(n);
      });
    };
    const walk = (gridEl) => {
      [...gridEl.children].forEach((c) => {
        if (c.matches('[class*="aem-GridColumn--default--hide"], .separator')) return;
        if (c.classList.contains("text")) addText(c);
        else if (c.classList.contains("button")) {
          const btn = c.querySelector("a.cmp-button[href], a[href]");
          if (btn) panel.push(buttonNode(btn, document2));
        } else if (c.classList.contains("image") && !media) {
          media = resolveImage(c.querySelector(".cmp-image img, img")) || "";
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
          media = resolveImage(img);
          return;
        }
      }
      if (col.classList.contains("text")) addText(col);
      else if (col.classList.contains("image") && !media) media = resolveImage(col.querySelector("img")) || "";
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

  // tools/importer/parsers/tabs.js
  var NESTED = ".accordion, .tile, .carousel, .embed, .iframetext, div.table, .image, .core-tabs";
  var clean = (s) => (s || "").replace(/[\s ]+/g, " ").trim();
  function resolveImage2(img) {
    if (!img) return null;
    const src = img.getAttribute("src") || "";
    if (!src || src.startsWith("data:") || src.startsWith("blob:")) {
      const holder = img.closest("[data-asset], [data-cmp-src]");
      const real = holder && (holder.getAttribute("data-asset") || holder.getAttribute("data-cmp-src"));
      if (real) img.setAttribute("src", real.replace("{.width}", ""));
    }
    const cur = img.getAttribute("src") || "";
    if (/\.svg$/i.test(cur) || /\/icon-[^/?#]*$/i.test(cur)) img.setAttribute("src", `${cur}?asset=image`);
    return img;
  }
  function isBlank2(node) {
    return !clean(node.textContent) && !(node.querySelector && node.querySelector("img"));
  }
  function buttonNode2(btn, document2) {
    const text = clean((btn.querySelector(".button-core__text-content, .cmp-button__text") || btn).textContent);
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
  function textNodes(component, document2) {
    const root = component.querySelector(".cmp-text, .cmp-title") || component;
    const out = [];
    [...root.children].forEach((n) => {
      if (n.matches(".phe-block")) return;
      if (isBlank2(n)) return;
      n.querySelectorAll("img").forEach(resolveImage2);
      n.querySelectorAll("b, strong, i, em, u").forEach((f) => {
        if (!clean(f.textContent) && !f.querySelector("img")) f.replaceWith(...f.childNodes);
      });
      if (n.matches(".cmp-text__icon")) {
        const p = document2.createElement("p");
        p.append(...n.childNodes);
        out.push(p);
        return;
      }
      out.push(n);
    });
    return out;
  }
  function collect(root, document2, out) {
    [...root.children].forEach((c) => {
      if (c.matches('[class*="aem-GridColumn--default--hide"], .separator, link, script, style, noscript, .phe-block')) return;
      if (c.classList.contains("text") || c.classList.contains("title")) {
        out.push(...textNodes(c, document2));
      } else if (c.classList.contains("button")) {
        const btn = c.querySelector("a.cmp-button[href], a[href]");
        const p = btn && buttonNode2(btn, document2);
        if (p) out.push(p);
      } else if (c.matches("a.cmp-button")) {
        const p = buttonNode2(c, document2);
        if (p) out.push(p);
      } else if (c.tagName === "IMG") {
        out.push(resolveImage2(c));
      } else {
        collect(c, document2, out);
      }
    });
    return out;
  }
  function contentFollows(node, document2) {
    const root = document2.querySelector("#mainContent") || document2.body;
    if (!root.contains(node)) return false;
    const walker = document2.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: (n2) => n2.nodeType === 1 && n2.matches("script, style, noscript, template, link") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    let last = node;
    while (last.lastChild) last = last.lastChild;
    walker.currentNode = last;
    let n = walker.nextNode();
    while (n) {
      if (n.nodeType === 3) {
        if (clean(n.textContent)) return true;
      } else if (n.tagName === "HR") {
        if (!n.closest(".cmp-separator, .separator")) return false;
      } else if (n.matches("img, picture, table, iframe, video")) {
        return true;
      }
      n = walker.nextNode();
    }
    return false;
  }
  function parse3(element, { document: document2 }) {
    const tabs = element.querySelector(".cmp-tabs") || element;
    const own = (el) => el.closest(".cmp-tabs") === tabs || tabs === element && !el.closest(".cmp-tabs");
    const tabEls = [...tabs.querySelectorAll(".cmp-tabs__tablist .cmp-tabs__tab")].filter(own);
    const panels = [...tabs.querySelectorAll(".cmp-tabs__tabpanel")].filter(own);
    const labels = panels.map((panel, i) => {
      const tab = tabEls[i];
      const fromTab = tab && clean((tab.querySelector(".cmp-tabs__title") || tab).textContent);
      return fromTab || clean(panel.getAttribute("data-title")) || clean(tab && tab.getAttribute("data-title")) || `Tab ${i + 1}`;
    });
    if (!panels.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const name = element.classList.contains("core-tabs__button-styled") ? "tabs (pills)" : "tabs";
    const sectionMode = panels.some((panel) => panel.querySelector(NESTED));
    if (!sectionMode) {
      const cells2 = panels.map((panel, i) => {
        const content = collect(panel, document2, []);
        return [labels[i], content.length ? content : ""];
      });
      const block2 = WebImporter.Blocks.createBlock(document2, { name, cells: cells2 });
      element.replaceWith(block2);
      return;
    }
    const cells = labels.map((label) => [label]);
    const block = WebImporter.Blocks.createBlock(document2, { name, cells });
    const following = [];
    panels.forEach((panel, i) => {
      following.push(document2.createElement("hr"));
      const wrapper = document2.createElement("div");
      wrapper.className = "cmp-tabs";
      wrapper.append(...panel.childNodes);
      wrapper.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => {
        if (isBlank2(h)) h.remove();
      });
      following.push(wrapper);
      following.push(WebImporter.Blocks.createBlock(document2, {
        name: "Section Metadata",
        cells: { Tab: labels[i] }
      }));
    });
    element.replaceWith(block);
    block.after(...following);
    const lastMeta = following[following.length - 1];
    if (contentFollows(lastMeta, document2)) lastMeta.after(document2.createElement("hr"));
  }

  // tools/importer/parsers/columns-media.js
  function resolveImage3(img) {
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
  function textNodes2(textComponent) {
    const root = textComponent.querySelector(".cmp-text") || textComponent;
    const out = [];
    [...root.children].forEach((n) => {
      if (n.matches(".cmp-text__icon, .phe-block") && !n.querySelector("img")) return;
      n.querySelectorAll("img").forEach(resolveImage3);
      if (!isBlank3(n)) out.push(n);
    });
    return out;
  }
  function buttonNode3(btn, document2) {
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
  function collect2(gridEl, document2, out) {
    [...gridEl.children].forEach((c) => {
      if (c.matches('[class*="aem-GridColumn--default--hide"]')) return;
      if (c.classList.contains("text")) out.push(...textNodes2(c));
      else if (c.classList.contains("button")) {
        const btn = c.querySelector("a.cmp-button[href], a[href]");
        if (btn) out.push(buttonNode3(btn, document2));
      } else if (c.classList.contains("image")) {
        const img = resolveImage3(c.querySelector(".cmp-image img, img"));
        if (img) out.push(imageParagraph(img, document2));
      } else if (c.classList.contains("container")) {
        const g = c.querySelector(":scope > .cmp-container > .aem-Grid");
        if (g) collect2(g, document2, out);
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
  function parse4(element, { document: document2 }) {
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
        collect2(g, document2, before);
        return;
      }
      if (c.classList.contains("image")) {
        const img = resolveImage3(c.querySelector(".cmp-image img, img"));
        if (img) cells.push(img);
        const cap = captionNode(c, document2);
        if (cap) captions.push(cap);
        return;
      }
      const content = collect2({ children: [c] }, document2, []);
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

  // tools/importer/parsers/cards-icons.js
  var clean2 = (s) => (s || "").replace(/[\s ]+/g, " ").trim();
  function resolveImage4(img) {
    if (!img) return null;
    const src = img.getAttribute("src") || "";
    if (!src || src.startsWith("data:") || src.startsWith("blob:")) {
      const holder = img.closest("[data-asset], [data-cmp-src]");
      const real = holder && (holder.getAttribute("data-asset") || holder.getAttribute("data-cmp-src"));
      if (real) img.setAttribute("src", real.replace("{.width}", ""));
    }
    const cur = img.getAttribute("src") || "";
    if (/\.svg$/i.test(cur) || /\/icon-[^/?#]*$/i.test(cur)) img.setAttribute("src", `${cur}?asset=image`);
    return img;
  }
  function isBlank4(node) {
    return !clean2(node.textContent) && !(node.querySelector && node.querySelector("img"));
  }
  function textNodes3(component, document2) {
    const root = component.querySelector(".cmp-text, .cmp-title") || component;
    const out = [];
    [...root.children].forEach((n) => {
      if (n.matches(".phe-block")) return;
      if (isBlank4(n)) return;
      if (n.matches(".cmp-text__icon")) {
        const p = document2.createElement("p");
        p.append(...n.childNodes);
        out.push(p);
        return;
      }
      n.removeAttribute("style");
      out.push(n);
    });
    return out;
  }
  function width2(el) {
    const m = (el.getAttribute("class") || "").match(/aem-GridColumn--default--(\d+)/);
    return m ? parseInt(m[1], 10) : 12;
  }
  function looseText(el, document2) {
    if (el.classList.contains("text") || el.classList.contains("title")) return textNodes3(el, document2);
    const out = [];
    el.querySelectorAll(".text, .title").forEach((t) => {
      if (!t.parentElement.closest(".text, .title")) out.push(...textNodes3(t, document2));
    });
    return out;
  }
  function parse5(element, { document: document2 }) {
    const grid = element.querySelector(":scope > .aem-Grid") || element;
    const children = [...grid.children].filter((c) => !c.matches('[class*="aem-GridColumn--default--hide"], .separator, link, script, style'));
    let items = children.filter((c) => c.classList.contains("container") && c.classList.contains("justify-content_space-around") && width2(c) < 12);
    if (!items.length) items = children.filter((c) => c.classList.contains("container") && width2(c) < 12 && c.querySelector(".text, .image"));
    const before = [];
    const after = [];
    const cells = [];
    children.forEach((c) => {
      if (items.includes(c)) {
        const img = resolveImage4(c.querySelector(".image .cmp-image img, .image img"));
        const caption = [];
        c.querySelectorAll(".text, .title").forEach((t) => {
          if (!t.parentElement.closest(".text, .title")) caption.push(...textNodes3(t, document2));
        });
        if (img || caption.length) cells.push([img || "", caption.length ? caption : ""]);
        return;
      }
      const nodes = looseText(c, document2);
      (cells.length ? after : before).push(...nodes);
    });
    if (!cells.length) {
      element.replaceWith(...before, ...after);
      return;
    }
    const four = items.length && items.every((c) => width2(c) === 3);
    const name = four ? "cards-icons (four)" : "cards-icons";
    const block = WebImporter.Blocks.createBlock(document2, { name, cells });
    if (before.length) element.before(...before);
    if (after.length) element.after(...after);
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-programs.js
  function resolveImage5(img) {
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
  function parse6(element, { document: document2 }) {
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
        if (img) resolveImage5(img);
        n.querySelectorAll("img").forEach(resolveImage5);
        if (n.textContent.trim() || n.querySelector("img") || img) target.push(n);
      });
    });
    const cells = cardEls.map((card) => {
      const img = resolveImage5(card.querySelector(".cmp-image img, img.cmp-image__image, picture img, img"));
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
  function isBlank5(node) {
    return !node.textContent.replace(/ /g, " ").trim() && !node.querySelector("img");
  }
  function textContentNodes(component) {
    const root = component.querySelector(".cmp-text, .cmp-title") || component;
    const nodes = [];
    [...root.children].forEach((n) => {
      if (n.matches(".cmp-text__icon, .phe-block") && !n.querySelector("img")) return;
      n.querySelectorAll("img").forEach(resolveImage6);
      if (!isBlank5(n)) nodes.push(n);
    });
    return nodes;
  }
  function parse7(element, { document: document2 }) {
    const grid = element.querySelector(":scope > .aem-Grid") || element;
    const children = [...grid.children];
    const before = [];
    const after = [];
    const cells = [];
    children.forEach((child) => {
      if (child.classList.contains("teaser") || child.querySelector(":scope > .cmp-teaser")) {
        const teaser = child.querySelector(".cmp-teaser") || child;
        const img = resolveImage6(teaser.querySelector(".cmp-teaser__image img, img"));
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
              if (!isBlank5(p)) textCell.push(p);
            });
          } else if (!isBlank5(desc)) {
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

  // tools/importer/parsers/accordion.js
  var clean3 = (s) => (s || "").replace(/[\s ]+/g, " ").trim();
  function resolveImage7(img) {
    if (!img) return null;
    const src = img.getAttribute("src") || "";
    if (!src || src.startsWith("data:") || src.startsWith("blob:")) {
      const holder = img.closest("[data-asset], [data-cmp-src]");
      const real = holder && (holder.getAttribute("data-asset") || holder.getAttribute("data-cmp-src"));
      if (real) img.setAttribute("src", real.replace("{.width}", ""));
    }
    const cur = img.getAttribute("src") || "";
    if (/\.svg$/i.test(cur) || /\/icon-[^/?#]*$/i.test(cur)) img.setAttribute("src", `${cur}?asset=image`);
    return img;
  }
  function isBlank6(node) {
    return !clean3(node.textContent) && !(node.querySelector && node.querySelector("img"));
  }
  function buttonNode4(btn, document2) {
    const text = clean3((btn.querySelector(".button-core__text-content, .cmp-button__text") || btn).textContent);
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
  function textNodes4(component, document2) {
    const root = component.querySelector(".cmp-text, .cmp-title") || component;
    const out = [];
    [...root.children].forEach((n) => {
      if (n.matches(".phe-block")) return;
      if (isBlank6(n)) return;
      n.querySelectorAll("img").forEach(resolveImage7);
      if (n.matches(".cmp-text__icon")) {
        const p = document2.createElement("p");
        p.append(...n.childNodes);
        out.push(p);
        return;
      }
      out.push(n);
    });
    return out;
  }
  function tableRows(table) {
    let rows = [...table.querySelectorAll(".aem-responsive-table__row")];
    let cellSel = ":scope > .aem-responsive-table__column";
    if (!rows.length) {
      rows = [...table.querySelectorAll("tr")];
      cellSel = ":scope > th, :scope > td";
    }
    return rows.map((r) => [...r.querySelectorAll(cellSel)].map((c) => clean3(c.textContent))).filter((cells) => cells.some(Boolean));
  }
  function tableToList2(table, document2) {
    const rows = tableRows(table);
    if (!rows.length) return [];
    const out = [];
    const [header, ...data] = rows;
    const p = document2.createElement("p");
    const strong = document2.createElement("strong");
    strong.textContent = header.filter(Boolean).join(" \u2013 ");
    p.append(strong);
    out.push(p);
    if (data.length) {
      const ul = document2.createElement("ul");
      data.forEach((cells) => {
        const li = document2.createElement("li");
        li.textContent = cells.filter(Boolean).join(" \u2013 ");
        ul.append(li);
      });
      out.push(ul);
    }
    return out;
  }
  function ownItems(accordion) {
    const root = accordion.querySelector(".cmp-accordion") || accordion;
    return [...root.querySelectorAll(".cmp-accordion__item")].filter((it) => it.parentElement.closest(".cmp-accordion") === root || root === accordion && !it.parentElement.closest(".cmp-accordion"));
  }
  function itemTitle(item) {
    const t = item.querySelector(":scope > .cmp-accordion__header .cmp-accordion__title") || item.querySelector(".cmp-accordion__title") || item.querySelector(".cmp-accordion__button");
    return clean3(t && t.textContent);
  }
  function collect3(root, document2, out) {
    [...root.children].forEach((c) => {
      if (c.matches('[class*="aem-GridColumn--default--hide"], .separator, link, script, style, noscript, .phe-block')) return;
      if (c.classList.contains("text") || c.classList.contains("title")) {
        out.push(...textNodes4(c, document2));
      } else if (c.classList.contains("table")) {
        out.push(...tableToList2(c, document2));
      } else if (c.classList.contains("accordion")) {
        ownItems(c).forEach((item) => {
          const title = itemTitle(item);
          if (title) {
            const p = document2.createElement("p");
            const strong = document2.createElement("strong");
            strong.textContent = title;
            p.append(strong);
            out.push(p);
          }
          const panel = item.querySelector(":scope > .cmp-accordion__panel");
          if (panel) collect3(panel, document2, out);
        });
      } else if (c.classList.contains("button")) {
        const btn = c.querySelector("a.cmp-button[href], a[href]");
        const p = btn && buttonNode4(btn, document2);
        if (p) out.push(p);
      } else if (c.matches("a.cmp-button")) {
        const p = buttonNode4(c, document2);
        if (p) out.push(p);
      } else if (c.classList.contains("image")) {
        const img = resolveImage7(c.querySelector(".cmp-image img, img"));
        if (img) {
          const p = document2.createElement("p");
          p.append(img);
          out.push(p);
        }
      } else {
        collect3(c, document2, out);
      }
    });
    return out;
  }
  function parse8(element, { document: document2 }) {
    const items = ownItems(element);
    const cells = [];
    items.forEach((item) => {
      const title = itemTitle(item);
      const panel = item.querySelector(":scope > .cmp-accordion__panel") || item.querySelector(".cmp-accordion__panel");
      const body = panel ? collect3(panel, document2, []) : [];
      if (!title && !body.length) return;
      cells.push([title, body.length ? body : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/table.js
  var clean4 = (s) => (s || "").replace(/[\s ]+/g, " ").trim();
  function isBlank7(node) {
    return !clean4(node.textContent) && !(node.querySelector && node.querySelector("img"));
  }
  function cellContent(cell, document2) {
    const texts = [...cell.querySelectorAll(".cmp-text")];
    const out = [];
    texts.forEach((root) => {
      [...root.children].forEach((n) => {
        if (n.matches(".phe-block") || isBlank7(n)) return;
        if (n.matches(".cmp-text__icon")) {
          const p = document2.createElement("p");
          p.append(...n.childNodes);
          out.push(p);
          return;
        }
        out.push(n);
      });
    });
    if (out.length) return out.length === 1 && out[0].tagName === "P" ? [...out[0].childNodes] : out;
    const t = clean4(cell.textContent);
    return t || "";
  }
  function parse9(element, { document: document2 }) {
    let rows = [...element.querySelectorAll(".aem-responsive-table__row")];
    let cellSel = ":scope > .aem-responsive-table__column";
    if (!rows.length) {
      rows = [...element.querySelectorAll("tr")];
      cellSel = ":scope > th, :scope > td";
    }
    let cells = rows.map((r) => [...r.querySelectorAll(cellSel)].map((c) => cellContent(c, document2))).filter((r) => r.some((c) => Array.isArray(c) ? c.length : c));
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cols = Math.max(...cells.map((r) => r.length));
    cells = cells.map((r) => r.length < cols ? [...r, ...Array(cols - r.length).fill("")] : r);
    const striped = !!element.querySelector(".aem-responsive-table--shaded, .aem-responsive-table__row--shaded");
    const name = striped ? "table (striped)" : "table";
    const block = WebImporter.Blocks.createBlock(document2, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel.js
  var clean5 = (s) => (s || "").replace(/[\s ]+/g, " ").trim();
  function isBlank8(node) {
    return !clean5(node.textContent) && !(node.querySelector && node.querySelector("img"));
  }
  function slideImage(item, document2) {
    const holder = item.querySelector('.cmp-image[data-asset], .cmp-image[data-cmp-src], [data-cmp-is="image"]') || item.querySelector(".cmp-image");
    const srcImg = [...item.querySelectorAll("img")].find((i) => !i.closest("noscript"));
    let src = srcImg && srcImg.getAttribute("src") || "";
    if (!src || src.startsWith("data:") || src.startsWith("blob:")) {
      src = holder && (holder.getAttribute("data-asset") || (holder.getAttribute("data-cmp-src") || "").replace("{.width}", "")) || "";
    }
    const rendition = src.match(/\.coreimg(?:\.\d+)?\.(\d+)\.(?:jpe?g|png|gif|webp)/i);
    const asset = holder && holder.getAttribute("data-asset");
    if (rendition && parseInt(rendition[1], 10) < 600 && asset) src = asset;
    if (!src) return null;
    if (/\.svg$/i.test(src)) src = `${src}?asset=image`;
    const img = document2.createElement("img");
    img.setAttribute("src", src);
    const alt = srcImg && srcImg.getAttribute("alt") || holder && holder.getAttribute("data-title") || "";
    img.setAttribute("alt", clean5(alt));
    return img;
  }
  function slideText(item) {
    const out = [];
    item.querySelectorAll(".cmp-text, .cmp-title, .cmp-teaser__content").forEach((root) => {
      [...root.children].forEach((n) => {
        if (n.matches(".phe-block, .cmp-text__icon") && !clean5(n.textContent)) return;
        if (!isBlank8(n)) out.push(n);
      });
    });
    item.querySelectorAll(".cmp-image__title").forEach((cap) => {
      if (clean5(cap.textContent)) {
        const p = cap.ownerDocument.createElement("p");
        p.textContent = clean5(cap.textContent);
        out.push(p);
      }
    });
    return out;
  }
  function parse10(element, { document: document2 }) {
    const root = element.querySelector(".cmp-carousel") || element;
    const items = [...root.querySelectorAll(".cmp-carousel__item")].filter((it) => it.closest(".cmp-carousel") === root || root === element);
    const slides = items.map((item) => ({ img: slideImage(item, document2), text: slideText(item) })).filter((s) => s.img || s.text.length);
    if (!slides.length) {
      element.remove();
      return;
    }
    const hasText = slides.some((s) => s.text.length);
    const cells = slides.map((s) => hasText ? [s.img || "", s.text.length ? s.text : ""] : [s.img]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/embed.js
  function embedUrl(element) {
    const iframe = element.querySelector("iframe[data-src], iframe[src]");
    let raw = iframe ? iframe.getAttribute("data-src") || iframe.getAttribute("src") || "" : "";
    if (!raw.trim()) {
      const link = element.querySelector('a[href*="youtube.com"], a[href*="youtu.be"], a[href*="vimeo.com"]');
      raw = link ? link.getAttribute("href") : "";
    }
    raw = (raw || "").trim();
    if (!raw) return null;
    if (raw.startsWith("//")) raw = `https:${raw}`;
    const yt = raw.match(/youtube(?:-nocookie)?\.com\/(?:embed|shorts|v)\/([\w-]{6,})/i) || raw.match(/youtu\.be\/([\w-]{6,})/i) || raw.match(/youtube\.com\/watch\?(?:.*&)?v=([\w-]{6,})/i);
    if (yt) return `https://www.youtube.com/watch?v=${yt[1]}`;
    const vimeo = raw.match(/player\.vimeo\.com\/video\/(\d+)/i);
    if (vimeo) return `https://vimeo.com/${vimeo[1]}`;
    return raw;
  }
  function parse11(element, { document: document2 }) {
    const url = embedUrl(element);
    if (!url) {
      element.querySelectorAll(".usta-consent-placeholder, iframe").forEach((n) => n.remove());
      element.replaceWith(...element.childNodes);
      return;
    }
    const a = document2.createElement("a");
    a.href = url;
    a.textContent = url;
    const cells = [[a]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "embed", cells });
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
            const width3 = rendered > 0 ? widths.find((w) => w >= rendered) || widths[widths.length - 1] : 0;
            img.setAttribute("src", template.includes("{.width}") && width3 ? template.replace("{.width}", `.${width3}`) : real);
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

  // tools/importer/import-program-detail.js
  var parsers = {
    "hero-overlay": parse,
    "columns-split": parse2,
    "tabs": parse3,
    "columns-media": parse4,
    "cards-icons": parse5,
    "cards-programs": parse6,
    "cards-booking": parse7,
    "accordion": parse8,
    "table": parse9,
    "carousel": parse10,
    "embed": parse11
  };
  var PAGE_TEMPLATE = {
    "name": "program-detail",
    "description": "Program/event detail pages with title banner, tabs, accordions, carousels, teasers",
    "urls": [
      "https://www.ustanationalcampus.com/en/home/play/davebailey.html",
      "https://www.ustanationalcampus.com/en/home/play/free30.html",
      "https://www.ustanationalcampus.com/en/home/play/high-performance.html",
      "https://www.ustanationalcampus.com/en/home/play/pickleball.html",
      "https://www.ustanationalcampus.com/en/home/play/play-padel.html",
      "https://www.ustanationalcampus.com/en/home/play/private-lessons.html",
      "https://www.ustanationalcampus.com/en/home/play/programs/adult-tennis.html",
      "https://www.ustanationalcampus.com/en/home/play/programs/junior-tennis-programs.html",
      "https://www.ustanationalcampus.com/en/home/play/tennis/adult-camps.html",
      "https://www.ustanationalcampus.com/en/home/play/tennis/adult-red-ball.html",
      "https://www.ustanationalcampus.com/en/home/play/tennis/junior-programming-welcome-letter.html",
      "https://www.ustanationalcampus.com/en/home/play/tennis/summer-camps.html",
      "https://www.ustanationalcampus.com/en/home/watch/save-my-play.html",
      "https://www.ustanationalcampus.com/en/home/events/2026-bnp-paribas-world-team-cup.html",
      "https://www.ustanationalcampus.com/en/home/about/meet-our-team.html"
    ],
    "blocks": [
      {
        "name": "hero-overlay",
        "instances": [
          "#mainContent .cmp-container[data-desktop-background-image]:not(.cmp-container--clickable):not(:has(.cmp-container--clickable)):has(h1)"
        ]
      },
      {
        "name": "columns-split",
        "instances": [
          "#mainContent .cmp-container[style*='background-color']:not(:has(h1)):has(> .aem-Grid > .container > .cmp-container[data-desktop-background-image]:not(.cmp-container--clickable)):has(> .aem-Grid > .container > .cmp-container .text)"
        ]
      },
      {
        "name": "tabs",
        "instances": [
          "#mainContent .core-tabs"
        ]
      },
      {
        "name": "columns-media",
        "instances": [
          "#mainContent .cmp-container:has(> .aem-Grid > .image:is(.aem-GridColumn--default--5, .aem-GridColumn--default--6)):has(> .aem-Grid > :is(.text, .container):is(.aem-GridColumn--default--6, .aem-GridColumn--default--7))"
        ]
      },
      {
        "name": "cards-icons",
        "instances": [
          "#mainContent .cmp-container:has(> .aem-Grid > .container.justify-content_space-around:not(.aem-GridColumn--default--12) ~ .container.justify-content_space-around:not(.aem-GridColumn--default--12) ~ .container.justify-content_space-around:not(.aem-GridColumn--default--12))",
          "#mainContent #aa-default-programs:not(:has(#aa-default-programs)):not(:has(.image))"
        ]
      },
      {
        "name": "cards-programs",
        "instances": [
          "#mainContent #aa-default-programs:not(:has(#aa-default-programs)):has(.image)"
        ]
      },
      {
        "name": "cards-booking",
        "instances": [
          "#mainContent .cmp-container:has(> .aem-Grid > .tile.teaser)"
        ]
      },
      {
        "name": "accordion",
        "instances": [
          "#mainContent .accordion.panelcontainer"
        ]
      },
      {
        "name": "table",
        "instances": [
          "#mainContent div.table"
        ]
      },
      {
        "name": "carousel",
        "instances": [
          "#mainContent div.carousel"
        ]
      },
      {
        "name": "embed",
        "instances": [
          "#mainContent div.embed",
          "#mainContent div.iframetext:has(iframe)"
        ]
      }
    ],
    "sections": [
      {
        "id": "1",
        "name": "title-banner",
        "selector": [
          "#mainContent > .aem-Grid > .container:first-child"
        ],
        "style": null,
        "blocks": [
          "hero-overlay",
          "tabs",
          "columns-media",
          "carousel",
          "accordion",
          "table",
          "cards-icons",
          "cards-programs",
          "cards-booking"
        ],
        "defaultContent": [
          "#mainContent .text .cmp-text",
          "#mainContent .button a.cmp-button"
        ]
      },
      {
        "id": "2",
        "name": "stone-offerings",
        "selector": [
          "#mainContent .container:has(> .cmp-container[style*='#DCDFCF'] .accordion)"
        ],
        "style": "stone",
        "blocks": [
          "accordion"
        ],
        "defaultContent": [
          ".text .cmp-text h2"
        ]
      },
      {
        "id": "3",
        "name": "after-offerings",
        "selector": [
          "#mainContent .container:has(> .cmp-container[style*='#DCDFCF'] .accordion) + .container"
        ],
        "style": null,
        "blocks": [
          "table"
        ],
        "defaultContent": [
          ".text .cmp-text"
        ]
      },
      {
        "id": "4",
        "name": "stone-results",
        "selector": [
          "#mainContent .container:has(> .cmp-container[style*='#DCDFCF'] .iframetext)"
        ],
        "style": "stone",
        "blocks": [
          "embed"
        ],
        "defaultContent": [
          ".text .cmp-text h2",
          ".text .cmp-text p"
        ]
      },
      {
        "id": "5",
        "name": "after-results",
        "selector": [
          "#mainContent .container:has(> .cmp-container[style*='#DCDFCF'] .iframetext) + .container"
        ],
        "style": null,
        "blocks": [
          "tabs",
          "cards-icons"
        ],
        "defaultContent": []
      },
      {
        "id": "6",
        "name": "stone-visit",
        "selector": [
          "#mainContent .container:has(> .cmp-container[style*='rgba(220,223,207'])"
        ],
        "style": "stone",
        "blocks": [
          "columns-media"
        ],
        "defaultContent": []
      },
      {
        "id": "7",
        "name": "have-questions",
        "selector": [
          "#mainContent .container:not(.cmp-tabs .container):has(> .cmp-container > .aem-Grid > .text.cmp-text--alignment-center a[href^='mailto:'])"
        ],
        "style": "centered",
        "blocks": [],
        "defaultContent": [
          ".text .cmp-text",
          ".image img"
        ]
      },
      {
        "id": "8",
        "name": "teal-video",
        "selector": [
          "#mainContent .container:has(> .cmp-container[style*='#92BFB7'] .embed)"
        ],
        "style": "teal, media-split",
        "blocks": [
          "embed"
        ],
        "defaultContent": [
          ".text .cmp-text"
        ]
      },
      {
        "id": "9",
        "name": "after-teal-video",
        "selector": [
          "#mainContent .container:has(> .cmp-container[style*='#92BFB7'] .embed) + .container"
        ],
        "style": null,
        "blocks": [
          "cards-icons",
          "carousel",
          "columns-split"
        ],
        "defaultContent": [
          ".text .cmp-text",
          ".button a.cmp-button"
        ]
      },
      {
        "id": "10",
        "name": "video",
        "selector": [
          "#mainContent .container:not(.cmp-container[style*='#92BFB7'] .container):has(> .cmp-container > .aem-Grid > .embed)"
        ],
        "style": "media-split",
        "blocks": [
          "embed"
        ],
        "defaultContent": [
          ".text .cmp-text"
        ]
      },
      {
        "id": "11",
        "name": "after-video",
        "selector": [
          "#mainContent .container:not(.cmp-container[style*='#92BFB7'] .container):has(> .cmp-container > .aem-Grid > .embed) + .container:not(:has(> .cmp-container[style*='#A4EE90']))"
        ],
        "style": null,
        "blocks": [
          "tabs",
          "accordion",
          "cards-booking"
        ],
        "defaultContent": []
      },
      {
        "id": "12",
        "name": "lime-band",
        "selector": [
          "#mainContent .container:has(> .cmp-container[style*='#A4EE90'])"
        ],
        "style": "lime, centered",
        "blocks": [],
        "defaultContent": [
          ".text .cmp-text",
          ".button a.cmp-button"
        ]
      },
      {
        "id": "13",
        "name": "after-lime",
        "selector": [
          "#mainContent .container:has(> .cmp-container[style*='#A4EE90']) + .container"
        ],
        "style": null,
        "blocks": [
          "accordion"
        ],
        "defaultContent": [
          ".text .cmp-text"
        ]
      },
      {
        "id": "14",
        "name": "learn-programs",
        "selector": [
          "#mainContent .container:has(> .cmp-container > .aem-Grid > .text.cmp-text--banner-button)"
        ],
        "style": "centered",
        "blocks": [],
        "defaultContent": [
          ".text .cmp-text h2",
          ".button a.cmp-button"
        ]
      },
      {
        "id": "15",
        "name": "centered-text",
        "selector": [
          "#mainContent .container:not(.cmp-tabs .container, .cmp-container[style*='background-color'] .container):not(:has(> .cmp-container[style*='background-color'])):has(> .cmp-container > .aem-Grid > .text:first-child h2[style*='text-align: center'] ~ h5[style*='text-align: center'])"
        ],
        "style": "centered",
        "blocks": [],
        "defaultContent": [
          ".text .cmp-text",
          ".button a.cmp-button"
        ]
      },
      {
        "id": "16",
        "name": "contact",
        "selector": [
          "#mainContent .container:has(> .cmp-container[style*='#DCDFCF']):has(a[href^='mailto:']):not(:has(.accordion, .iframetext, .image, table))"
        ],
        "style": "contact-band",
        "blocks": [],
        "defaultContent": [
          ".text .cmp-text h2",
          ".button a.cmp-button"
        ]
      },
      {
        "id": "17",
        "name": "membership",
        "selector": [
          "#mainContent .container:has(> .cmp-container[style*='#DCDFCF']):has(.button):not(:has(a[href^='mailto:'], .accordion, .iframetext, .image, [data-desktop-background-image], table))"
        ],
        "style": "contact-band",
        "blocks": [],
        "defaultContent": [
          ".text .cmp-text",
          ".button a.cmp-button"
        ]
      },
      {
        "id": "18",
        "name": "after-membership",
        "selector": [
          "#mainContent .container:has(> .cmp-container[style*='#DCDFCF']):has(.button):not(:has(a[href^='mailto:'], .accordion, .iframetext, .image, [data-desktop-background-image], table)) ~ .container"
        ],
        "style": null,
        "blocks": [
          "columns-media",
          "carousel"
        ],
        "defaultContent": [
          ".text .cmp-text"
        ]
      },
      {
        "id": "19",
        "name": "app-download",
        "selector": [
          "#mainContent .container:has(> .cmp-container > .aem-Grid > .text + .container [data-redirect-url*='apps.apple.com'])"
        ],
        "style": "centered",
        "blocks": [],
        "defaultContent": [
          ".text .cmp-text p",
          ".cmp-container--clickable .image"
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
  var import_program_detail_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.isConnected) return;
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
  return __toCommonJS(import_program_detail_exports);
})();
