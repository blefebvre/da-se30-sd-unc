# hero-overlay

Custom **hero** block. Purpose: page-hero / in-page event banner.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row, one cell of content.

## Supported variations

| Variation | Option class |
| --- | --- |
| Centered | `centered` |
| Light band | `light` |

## Content-shape layouts (default variant)

`decorate()` adds hooks so the default band follows the source layout for
what was authored:

| Content | Class added | Layout |
| --- | --- | --- |
| H1 only (home) | none | 75% band, 17px padding |
| H1 + CTA links | `hero-overlay-has-actions` | rgba(0,0,0,.6) band, full / 7-col, blue 40px buttons |
| H1 + paragraph | `hero-overlay-has-text` | 11 / 8-col band, copy under heading |

`centered` + CTAs renders the in-page event banner (white pill buttons,
3-up row from 768px).

## Universal Editor fields

N/A (Document Authoring project)
