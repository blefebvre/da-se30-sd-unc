/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroOverlayParser from './parsers/hero-overlay.js';
import cardsMosaicParser from './parsers/cards-mosaic.js';
import columnsStatsParser from './parsers/columns-stats.js';
import cardsProgramsParser from './parsers/cards-programs.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/ustanationalcampus-cleanup.js';
import sectionsTransformer from './transformers/ustanationalcampus-sections.js';

// PARSER REGISTRY
const parsers = {
  "hero-overlay": heroOverlayParser,
  "cards-mosaic": cardsMosaicParser,
  "columns-stats": columnsStatsParser,
  "cards-programs": cardsProgramsParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
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
