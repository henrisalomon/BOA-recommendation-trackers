# Website validation — 24 September 2026

The 2025 report extension and historical SG recovery passed local validation. Publication is performed through the manual GitHub Pages workflow, which repeats model, browser, accessibility and build checks before deployment.

## Checks completed

- 14 Node model tests: all 55 PDF checksums, stable IDs, evidence page ranges, year/volume/entity register balances and continuity, rates, BOA/SG separation, SHP exclusions and the 38/19 new-recommendation populations.
- Nine Python build/helper tests: repository, root and local URL paths; invalid paths; PDF page labels.
- 31 source regression tests; database integrity, foreign keys and isolated repeat-build idempotence.
- Chrome desktop and 768/390/320px checks, keyboard navigation, filters/search/reset, source histories, SG target dates, 200% text resizing and methodology navigation. No uncaught JavaScript errors.
- Nine axe-core scans with zero detected WCAG 2 A/AA or WCAG 2.1 A/AA violations. These do not replace a full assistive-technology audit.
- Non-root `/boa-pages-preview/` browser check passed for assets, data, details, navigation and official PDF citations.
- Desktop and mobile layouts visually inspected with 2025 selected. The existing review-workbook exporter passed all 381,532 displayed-cell comparisons and formula checks; native Excel was not tested.

## Dataset

Exported **2026-09-24T13:52:21.667065+00:00**, version `2026-09-24-2025-coverage-v5`. Logical database SHA-256: `fb923c08260a27abd67d096417bc7965b430390398e4144b9c8452e00292d0d4`.

| Measure | Count |
| --- | ---: |
| Recommendations | 1,360 |
| Observations | 7,053 |
| Reports | 55 |
| Comments | 8,576 |
| Comments passing PDF location checks | 7,356 |
| Comments with unverified locators | 1,220 |
| Recommendations without an explicit original target | 965 |
| Recommendations without an explicit revised target | 970 |
| Observations requiring review | 2 |

Both volumes now cover 2015–2025 (Volume II 2025 is fiscal 2024–25). A/81/5 (Vol. I) contributes 38 new recommendations and 137 in-scope annex assessments. A/80/5 (Vol. II) contributes 19 new recommendations with their SG updates from A/80/629. The corresponding Volume I SG report was not located as of 24 September 2026; publication status is unconfirmed and missing SG fields remain blank.

All previous recommendation IDs and source fields, and all 6,822 previous history records, are preserved. The cohort label expands to 2015–2025. SHP exclusions and approved human decisions remain in force. Earlier snapshots retain their previous assessments.

## Limits and reproduction

See [DATA_GAPS.md](DATA_GAPS.md) for source gaps and [README.md](README.md) for reproduction. Automated locator matching does not certify interpretation or attribution. Rates describe observed BOA assessments, not official performance measures. The two pre-existing review flags remain.

PDF links use official `documents.un.org` URLs with one-based `#page=N` fragments. Bundled copies are checksum-verified; tests do not verify every external response or viewer behaviour. Safari and Firefox were not tested. Detailed local logs and screenshots are under `tmp/site/`.

## Historical SG recovery checks

All twelve formerly missing Volume I recommendations have responsible entities, target wording and SG statuses with verified field-level PDF locators. New source documents: A/70/338 and its reviewed corrigendum. Eighteen SG observations were added; all 1,360 recommendation identities and all prior BOA observations remain unchanged. Zero unmatched observations; the two pre-existing source review flags remain. Browser regressions verify paragraph 95’s recovered fields, PDF links, “Audit year” labels and “Published in” headings. Existing workbook validation above predates this recovery; the SQLite database, CSV/JSON exports and dashboard have been updated.
