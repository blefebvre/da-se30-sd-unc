/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroOverlayParser from './parsers/hero-overlay.js';
import columnsSplitParser from './parsers/columns-split.js';
import tabsParser from './parsers/tabs.js';
import columnsMediaParser from './parsers/columns-media.js';
import cardsIconsParser from './parsers/cards-icons.js';
import cardsProgramsParser from './parsers/cards-programs.js';
import cardsBookingParser from './parsers/cards-booking.js';
import accordionParser from './parsers/accordion.js';
import tableParser from './parsers/table.js';
import carouselParser from './parsers/carousel.js';
import embedParser from './parsers/embed.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/ustanationalcampus-cleanup.js';
import sectionsTransformer from './transformers/ustanationalcampus-sections.js';

// PARSER REGISTRY
const parsers = {
  "hero-overlay": heroOverlayParser,
  "columns-split": columnsSplitParser,
  "tabs": tabsParser,
  "columns-media": columnsMediaParser,
  "cards-icons": cardsIconsParser,
  "cards-programs": cardsProgramsParser,
  "cards-booking": cardsBookingParser,
  "accordion": accordionParser,
  "table": tableParser,
  "carousel": carouselParser,
  "embed": embedParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json (template: program-detail)
// Block order matters: parsers run in this order; columns-split flattens nested accordions/tables,
// tabs (section mode) moves panel content (incl. nested blocks) into Tab sections before their parsers run.
const PAGE_TEMPLATE = {
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
      // skip elements consumed/detached by an earlier parser (e.g. accordion flattened into columns-split)
      if (!block.element.isConnected) return;
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
