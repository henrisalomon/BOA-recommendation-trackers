# Website validation — 24 September 2026

The 2025 report extension passed local validation. Publication is performed through the manual GitHub Pages workflow, which repeats model, browser, accessibility and build checks before deployment.

## Checks completed

- 13 Node model tests: all 53 PDF checksums, stable IDs, evidence page ranges, year/volume/entity register balances and continuity, rates, BOA/SG separation, SHP exclusions and the 38/19 new-recommendation populations.
- Nine Python build/helper tests: repository, root and local URL paths; invalid paths; PDF page labels.
- 27 source regression tests; database integrity, foreign keys and isolated repeat-build idempotence.
- Chrome desktop and 768/390/320px checks, keyboard navigation, filters/search/reset, source histories, SG target dates, 200% text resizing and methodology navigation. No uncaught JavaScript errors.
- Nine axe-core scans with zero detected WCAG 2 A/AA or WCAG 2.1 A/AA violations. These do not replace a full assistive-technology audit.
- Non-root `/boa-pages-preview/` browser check passed for assets, data, details, navigation and official PDF citations.
- Desktop and mobile layouts visually inspected with 2025 selected. The existing review-workbook exporter passed all 381,532 displayed-cell comparisons and formula checks; native Excel was not tested.

## Dataset

Exported **2026-09-24T12:45:48.060504+00:00**, version `2026-09-24-2025-coverage-v5`. Logical database SHA-256: `3def21e022f76869beb38705f2de594415c1dc9bb1f590dea4d1c9f6524437e0`.

| Measure | Count |
| --- | ---: |
| Recommendations | 1,360 |
| Observations | 7,035 |
| Reports | 53 |
| Comments | 8,558 |
| Comments passing PDF location checks | 7,338 |
| Comments with unverified locators | 1,220 |
| Recommendations without an explicit original target | 965 |
| Recommendations without an explicit revised target | 970 |
| Observations requiring review | 2 |

Both volumes now cover 2015–2025 (Volume II 2025 is fiscal 2024–25). A/81/5 (Vol. I) contributes 38 new recommendations and 137 in-scope annex assessments. A/80/5 (Vol. II) contributes 19 new recommendations with their SG updates from A/80/629. The corresponding Volume I SG report was not located as of 24 September 2026; publication status is unconfirmed and missing SG fields remain blank.

All previous recommendation IDs and source fields, and all 6,822 previous history records, are preserved. The cohort label expands to 2015–2025. SHP exclusions and approved human decisions remain in force. Earlier snapshots retain their previous assessments.

## Limits and reproduction

See [DATA_GAPS.md](DATA_GAPS.md) for source gaps and [README.md](README.md) for reproduction. Automated locator matching does not certify interpretation or attribution. Rates describe observed BOA assessments, not official performance measures. The two pre-existing review flags remain.

PDF links use official `documents.un.org` URLs with one-based `#page=N` fragments. Bundled copies are checksum-verified; tests do not verify every external response or viewer behaviour. Safari and Firefox were not tested. Detailed local logs and screenshots are under `tmp/site/`.
