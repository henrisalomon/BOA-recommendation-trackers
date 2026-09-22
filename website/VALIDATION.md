# Local validation — 22 September 2026

Completed against the source-based static website. No publication or GitHub remote configuration was performed.

- 5 Node test groups passed: stable IDs and all 52 PDF checksums, source page ranges, exhaustive annual/year-end attribution/volume/entity waterfall balances and continuity, rate denominators and zero cases, continuing implementation vs new transitions, filters and search.
- 9 Python checks passed: local/project/user-site/custom-domain base paths, invalid paths, printed-page footers vs document symbols, and missing labels.
- 8 axe-core accessibility scans passed with zero WCAG 2 A/AA and WCAG 2.1 A/AA violations detected, across desktop tabs, expanded evidence and mobile sizes. This is not a full assistive-technology certification.
- Chrome checks passed for keyboard arrow/Home/End tab navigation, search/no-results/reset/status/volume/year filters, original/revised target fields, 10-year source history, PDF HTTP responses, desktop/768/390/320px layouts and 200% text resizing. No uncaught JavaScript errors.
- Non-root `/boa-pages-preview/` build passed for HTML, JavaScript modules, CSS, JSON, recommendation details and PDF links.
- Visually inspected Recommendations, Analysis and Trends, mobile layouts, enlarged text, and representative BOA and SG source PDF pages. The spot check caught and corrected confusion between UN document symbols and printed page labels; PDF indexes are never substituted for missing printed labels.
- All source text is escaped before HTML insertion. Source files were read as data; upstream extraction files and review decisions were not modified.

## Source limitations remain

The frozen export contains 1,334 recommendations, 6,890 observations, 52 reports and 8,307 separately labelled comments. 7,146 comments passed automated PDF text-fragment location checks; 1,161 remain explicitly unverified. 939 recommendations lack an explicitly extracted original target and 944 lack a revised target. Five reports lack exact publication dates; two also lack publication years. Four source observations remain flagged for review. See DATA_GAPS.md and data/metadata.json.

“Locator matched” is an automated text check, not a human certification of correct attribution or a full verification of every paragraph boundary. Annual rates describe the available BOA assessment population; they are not official or certified complete-population performance measures.

## Reproduce

See README.md for export/build and test commands. Detailed browser results and screenshots are stored locally in tmp/site/; tests are checked in under tests/site/. The workflow performs model, base-path, browser and accessibility tests before creating a Pages artifact, and only deploys on an explicitly requested manual run with publish enabled.
