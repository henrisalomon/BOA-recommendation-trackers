# Website validation — 23 September 2026

Validated the local static website and the [public GitHub Pages site](https://henrisalomon.github.io/BOA-recommendation-trackers/). The deployed summary cards match the local version: five cards on Recommendations, hidden on Analysis and Trends. The [deployment of commit 6b46319](https://github.com/henrisalomon/BOA-recommendation-trackers/actions/runs/35800489300) passed the workflow checks and publication step.

## Checks completed

- 11 Node model tests passed: stable IDs, all 52 bundled PDF checksums, evidence page ranges, exhaustive year/volume/entity register balances and continuity, rate denominators and zero cases, transitions versus repeated terminal assessments, filters/search, BOA versus SG status handling and Strategic Heritage Plan exclusions.
- 9 Python build/helper checks passed: local/project/user-site/custom-domain base paths, invalid paths, printed-page footers versus document symbols, and missing labels.
- 24 source-pipeline Python regression tests passed with the bundled Python runtime, including entity mappings, review-decision handling, mitigation and study scope. System Python lacked `pdfplumber`; this dependency is needed for the source-PDF regression check.
- Chrome browser checks passed against both local and public sites: keyboard tab navigation; search, no-results, reset, status, volume, year and responsibility filters; shared-filter URL restoration; target fields; source history; methodology navigation; desktop and 768/390/320px layouts; and 200% text resizing. No uncaught JavaScript errors were detected.
- Each browser run passed 9 axe-core scans with zero detected WCAG 2 A/AA and WCAG 2.1 A/AA violations. This is not a complete assistive-technology certification; Safari and Firefox were not tested.
- The deployment workflow passed the non-root `/boa-pages-preview/` browser check for HTML, modules, styles, JSON, recommendation details, methodology navigation and official PDF link construction.
- Visually inspected Recommendations, Analysis, Trends and the mobile landing layout. Earlier source-page spot checks distinguished printed page labels from PDF positions; missing printed labels are not replaced with PDF positions.
- Browser tests verify official `documents.un.org` PDF URLs and their `#page=N` fragments, not every external PDF response. A separate download of A/71/5 (Vol. I) returned a PDF whose SHA-256 matched the bundled source. External availability and page opening in individual PDF viewers remain outside the automated checks.

## Dataset and source limitations

Counts below match [data/metadata.json](data/metadata.json), exported at **2026-09-22 23:33:41 UTC** (23 September in Europe/Paris), exporter version `2026-09-23-global-scope-v4`:

| Measure | Count |
| --- | ---: |
| Recommendations | 1,303 |
| Observations | 6,822 |
| Reports | 52 |
| Separately labelled comments | 8,265 |
| Comments passing automated PDF text-fragment location checks | 7,106 |
| Comments with unverified PDF locators | 1,159 |
| Recommendations without an explicitly extracted original target | 908 |
| Recommendations without an explicitly extracted revised target | 913 |
| Reports missing an exact publication date | 5 |
| Reports also missing a publication year | 2 |
| Observations requiring review | 2 |

Strategic Heritage Plan recommendations and their linked histories are excluded. Comparable dashboard years remain 2015–2024, with an opening baseline and supplementary 2025 Volume II follow-up in the available history. See [DATA_GAPS.md](DATA_GAPS.md) for interpretation limits.

“Locator matched” is an automated text check, not human certification of attribution or paragraph boundaries. Annual rates describe the available BOA assessment population; they are not official or certified complete-population performance measures.

## PDF links and verification

Dashboard citations open official PDFs on `documents.un.org` with one-based `#page=N` positions. These links require internet access and depend on the external service and PDF viewer. Printed page labels are displayed separately.

The site also retains bundled PDF copies for checksum and locator verification. Their paths and SHA-256 values are recorded in [data/reports.json](data/reports.json). The current UI does not automatically fall back to bundled copies when an official link is unavailable.

## Reproduce and maintain

See [README.md](README.md) for export/build and test commands. Detailed browser results and screenshots are stored locally in `tmp/site/`; website tests are checked in under `tests/site/`. The workflow runs model, base-path, browser and accessibility checks before creating a Pages artifact, and deploys only on a manual run with `publish` enabled.

After a data export, refresh the timestamp and counts here from `data/metadata.json`. Update validation claims only from completed checks. The source-pipeline tests are local research-workspace checks; they are separate from the website deployment workflow.
