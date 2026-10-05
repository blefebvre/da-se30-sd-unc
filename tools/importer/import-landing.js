/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroOverlayParser from './parsers/hero-overlay.js';
import cardsMosaicParser from './parsers/cards-mosaic.js';
import cardsProgramsParser from './parsers/cards-programs.js';
import cardsBookingParser from './parsers/cards-booking.js';
import cardsLogosParser from './parsers/cards-logos.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import columnsMediaParser from './parsers/columns-media.js';
import columnsSplitParser from './parsers/columns-split.js';
import columnsGalleryParser from './parsers/columns-gallery.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/ustanationalcampus-cleanup.js';
import sectionsTransformer from './transformers/ustanationalcampus-sections.js';

// PARSER REGISTRY
const parsers = {
  "hero-overlay": heroOverlayParser,
  "cards-mosaic": cardsMosaicParser,
  "cards-programs": cardsProgramsParser,
  "cards-booking": cardsBookingParser,
  "cards-logos": cardsLogosParser,
  "cards-feature": cardsFeatureParser,
  "columns-media": columnsMediaParser,
  "columns-split": columnsSplitParser,
  "columns-gallery": columnsGalleryParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json (template: landing)
const PAGE_TEMPLATE = {
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

// TRANSFORMER REGISTRY (sections transformer runs after cleanup)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      let elements = [];
      try {
        elements = document.querySelectorAll(selector);
      } catch (e) {
        console.warn(`Invalid selector for "${blockDef.name}": ${selector}`);
      }
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name, selector, element, section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. beforeTransform (initial cleanup + section breaks)
    executeTransformers("beforeTransform", main, payload);

    // 2. Find blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse blocks
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section metadata)
    executeTransformers("afterTransform", main, payload);

    // 5. Built-in rules
    const hr = document.createElement("hr");
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path (root maps to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, "")
      .replace(/\.html?$/, "");
    const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
