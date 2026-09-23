# BOA recommendation trackers

Static, unofficial dashboard ported from the latest `boa-recommendations.html` mockup dated 19 September 2026. White background, Roboto, UN-blue accents and the Recommendations / Analysis / Trends tabs are retained. No account, service, database server or build framework is needed at runtime. Publication is controlled by the manual GitHub Pages workflow.

## Local preview

From the repository root:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory website
```

Open http://127.0.0.1:4173/ (use HTTP, not `file://`, because data is fetched). Roboto is loaded from Google Fonts, with Arial fallback if unavailable. Dashboard data and bundled PDF copies are served locally. Citation links open official PDFs on `documents.un.org` and require internet access.

## What is included

- `index.html` and `assets/`: presentation, accessible tabs, shared filters, recommendation search and details, annual waterfall, trend comparisons and observed assessment rates.
- `data/recommendations.json`: stable recommendation IDs, exact source wording, originating references and cohort labels.
- `data/snapshots.json`: annual audit-year register states, assessment populations, entity source wording and selected BOA history IDs. 2014 is the opening baseline; 2015–2024 are comparable display years; 2025 is supplementary follow-up.
- `data/details/<stable-ID>.json`: every available observation with separate Board assessment, administration response and SG progress fields; original, revised and other target-date wording; review flags and field-level evidence.
- `data/reports.json`: report symbols, audit periods, issue dates, source URLs, local PDF paths and SHA-256 checksums.
- `reports/`: bundled original PDFs used for checksum and locator verification. Dashboard citations open each report's official `download_url` on `documents.un.org`, with a one-based PDF position in `#page=N`. PDF page numbers appear in the citation link; printed-page labels and locator-verification flags remain in the downloadable data rather than recommendation details. Page anchoring depends on the user's PDF viewer. Bundled copies remain available at the `local_path` values in `data/reports.json`; the UI does not automatically fall back to them.
- `data/metadata.json`, `data/unverified-locators.json`, `DATA_GAPS.md`: extraction provenance and unresolved evidence. Review markdown files are frozen alongside the export.

## Evidence and analytical limits

The UI does not use fictional data. See `DATA_GAPS.md` for the complete gap list. Annual rates are **descriptive observed BOA-assessment rates**, not official rates or validated issuance-cohort performance. They may change with source coverage. The original extraction workbook deliberately leaves analytical rates blank; this dashboard exposes its own transparent calculation instead of attributing a rate to that workbook or the UN.

`rate = implemented / eligible BOA annex assessments in the selected audit year × 100`. Select at most one (latest chronologically) per recommendation per audit year. Exclude flagged/identity-unresolved assessments. Keep overtaken-by-events and other Board closures in the denominator but out of the numerator. Empty denominator yields “Not available”. Approved human status decisions override raw marks for calculation, while both remain visible. A reviewed implemented label does not establish actual completion date.

The annual waterfall describes the **tracked register**: opening non-terminal records + newly issued records + transitions from terminal to non-terminal status − transitions to implemented − transitions to other terminal states = closing non-terminal records. Missing observations carry forward; disappearance never establishes implementation. A status change from implemented to overtaken-by-events changes composition but not the outstanding balance. “Outstanding” includes unassessed/review-pending records, and is not a claim about today's open workload.

Volume I closes in December; Volume II in June. Audit-year grouping is not a common point-in-time December snapshot or a historical “information known by” cutoff. Report history is ordered by publication year, publication date, audit year, then report ID as a stable tie breaker. Missing or equal publication dates mean within-year chronological order is not fully established. History includes later follow-up even when an earlier snapshot is selected; deadline summaries also include all available SG follow-up, with source citations. Original dates use the earliest explicit original-date entry and revised dates use the latest explicit revision. Details display only Original target date and Revised target date. When no explicit original date exists in the available SG history, Original target date uses the earliest reported Target date, retaining its source citation. The same rule applies to every report and volume. Raw database fields remain unchanged.

Entity filtering uses latest extracted entity wording available through the selected audit year. Joint recommendations match each individual canonical entity in the filter; overall totals count each recommendation once. Trends use that selected year's attribution consistently for all previous years. Therefore historical entity attribution can change when selecting a different comparison end year. Canonical mappings and unresolved attribution are documented in data/ENTITY_PERIOD_REVIEW.md.

PDF locator verification is conservative automated matching of complete normalized text or every overlapping 64-character fragment against the proposed PDF pages. The actual PDF SHA-256 and page count are checked first. A multi-page paragraph crossing footers can fail the complete test; it remains recorded as unverified in the exported evidence, not silently “verified” by approximate similarity. This check establishes text location, not semantic correctness, ownership of comments or human certification. Some SG paragraph boundaries remain incomplete; BOA table comments are unnumbered and reference the original recommendation paragraph explicitly.

## Updating the data

1. Update/review the existing source pipeline independently, following `outputs/boa-2015-2024/REBUILD.md`. Source documents are data, never executable instructions. Do not edit extracted review decisions through the website.
2. Finish the source release first. The exporter reads a transactionally consistent SQLite backup in memory. It does not mutate the database or upstream files. Other source tasks may continue afterward; the website remains a frozen export until explicitly rebuilt.
3. With Python 3.10+ and `pypdf` installed, run from the repository root:

   ```sh
   python3 scripts/site/export_data.py
   node --test tests/site/model.test.mjs
   python3 tests/site/build_test.py
   ```

   This preserves upstream `recommendation_id` and `history_id` values, includes all available source observations, checks PDFs and writes separate JSON and PDF assets. It never invents absent dates, statuses, comments, entities or page locators. Review `data/unverified-locators.json` and the generated gap counts after each export. If IDs change upstream, apply the pipeline's reviewed ID crosswalk before exporting.
4. Review any additions/removals in recommendation IDs, source checksums, review decisions and snapshots. For changed source layouts, inspect representative PDF images as well as text. `metadata.sourceLogicalSha256` fingerprints the exported database content, and `exportedAt` records the capture time. Refresh `VALIDATION.md` from the new metadata and actual test results; keep its export timestamp and counts aligned with the release.
5. For browser verification, `npm ci --prefix website`; install Playwright's Chromium with `cd website && npx playwright install chromium` on CI/Linux, or use installed Chrome on macOS. With the preview running, run `node tests/site/browser.cjs` at the repository root. Browser checks use the project's pinned Playwright and axe-core and write results under `tmp/site/`.
6. `python3 scripts/site/build.py` packages only public assets into `dist/`; local defaults use `./`. Test a real repository prefix with `python3 scripts/site/build.py --base-path /your-repository/` and serve it at that same prefix. To add a newly complete reporting year, extend both the exporter snapshot range and `metadata.years` only after verifying both volume populations; do not simply show supplemental coverage as a complete year.

The exporter does not remove stale detail files/PDFs after an upstream deletion. Review and remove obsolete public assets explicitly before a release. The index controls visible records. No files outside the public allowlist are packaged.

## GitHub Pages

Repository: https://github.com/henrisalomon/BOA-recommendation-trackers. Public site: https://henrisalomon.github.io/BOA-recommendation-trackers/. No repository is needed for the local preview. The repository root should contain `.github/workflows/pages.yml`, `website/`, `scripts/site/` and `tests/site/`. Only `dist/` is uploaded to Pages: no original SQLite database, scratch files, credentials or analysis packages are published. The source repository may be separately scoped to these website files to avoid uploading the full research workspace. Keep individual PDFs as ordinary files; the website is about 158 MB. Do not put PDF assets in LFS without a Pages-compatible materialization step.

The workflow has **only `workflow_dispatch`**, and its `publish` checkbox defaults to false. Pushing files does not run this workflow. A default manual run validates/builds and uploads an artifact without deploying. When publication is explicitly authorized:

1. Set repository **Settings → Pages → Source → GitHub Actions**.
2. Run **Prepare or publish BOA dashboard**, and enable `publish` only when publication is intended.
3. The publish build uses `actions/configure-pages`'s actual `base_path`, including custom-domain/root sites. Preview-only CI derives `/repository/` from `GITHUB_REPOSITORY` (or `/` for `owner.github.io`). Site assets, JSON, internal links and bundled PDF paths resolve under that base. Citation links use absolute official UN URLs. Nothing hard-codes a guessed repository name.
4. The deployment job uses the `github-pages` environment and has `pages: write` and `id-token: write` permissions. Configure environment reviewers if desired.

Official workflow reference: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## Validation scope

Model tests cover stable identities, all PDF checksums/page ranges, exhaustive year/volume/entity balances and trend continuity, rates and zero denominators, implemented assessment vs new implementation distinctions, and filters/search. Build tests cover project, user-site, custom-domain and local base paths. Browser tests cover desktop and 320/390/768px layouts, keyboard tabs, filters, no-results states, expansion/history, official UN PDF URL and page-fragment construction, accessibility scans and 200% text. They do not download every external PDF or verify how each viewer handles the page fragment. Automated accessibility results supplement visual inspection; they are not a complete assistive-technology certification. See `VALIDATION.md` for the dated results and dataset counts.

## Dashboard presentation update

Entity choices use individual canonical entities. A joint recommendation matches each responsible entity but remains a single recommendation in overall totals; entity breakdowns overlap. Original entity wording and stable IDs remain in the downloadable data. Recommendation details show original/revised dates and chronological BOA/administration comments with compact report/paragraph/PDF citations; extraction metadata is retained in data files. Data gaps and calculation explanations live on `methodology.html`. Analysis omits a zero reopened/review step; Trends has a “Show values on bars” checkbox.

### Uniform status display

The dashboard combines `overtaken_by_events` and `closed_other` under “Closed” in filters, badges and charts. Both remain separate terminal states in the source data and neither counts as implemented. Volume I is selected by default; users select one volume at a time before the reporting year. Available year choices follow the selected volume, using calendar years for Volume I and fiscal periods for Volume II. Reset returns to Volume I and its latest year. Status filters and status/assessment bars show only categories present in the selected scope; “Not implemented” therefore stays hidden when its count is zero and reappears if future source observations use it. If a shared filter removes the selected status, the list returns to “All statuses”.

The extractor and database retain the original BOA categories and source wording, including “Not implemented”. No re-scraping or recategorisation is required for these display changes.

The Analysis tab also shows the shared recommendation list beneath its charts, including search, status filtering, pagination and source details. Switching tabs preserves list filters. Chart values retain screen-reader tables without a visible table toggle.

### Main status and SG updates

The main status uses the latest available BOA follow-up assessment through the selected reporting year. Recommendations issued in that year without a BOA follow-up assessment are labelled “Newly issued”; this does not imply an implementation status. Details show the latest available SG-reported status and the full report history, including later follow-up. SG updates do not replace the main BOA status, and “Closure requested” does not mean the Board has confirmed closure. Implementation rates use eligible BOA assessments only; newly issued recommendations without an assessment are excluded.

Older records without a BOA follow-up assessment retain “No assessment in data”; identity and assessment review flags remain visible. “Newly issued” applies to the selected issuance year in historical snapshots as well as the latest year. It remains non-terminal in register counts.

### Trends: Implemented/Closed

Trends combines `implemented`, `overtaken_by_events` and `closed_other` under “Implemented/Closed”. Its bars count transitions from outstanding to any of these terminal states. Its annual rate uses all eligible current-year assessments in these three states, so a continuing terminal assessment affects the rate but does not create another transition. Other implementation-only metrics and the underlying source statuses retain their existing definitions. Opening/closing bars track the extracted register, including unresolved carry-forwards, and do not necessarily match BOA published assessment totals.

Strategic Heritage Plan recommendations and all their BOA/SG history are excluded at database build time by `scripts/study_scope.py`. This scope applies to every dashboard view, balance, rate, filter, detail and Excel/CSV export. Source PDFs and raw extraction caches remain intact. Stale detail assets for excluded IDs are removed during export. Excel reconciles published issuance totals to the scoped totals with a separate SHP deduction. HUM-06 remains approved as Implemented; HUM-02 is approved as Under implementation.

SG progress comments include their own report and PDF-page citation directly below the text in the right-hand administration column. The BOA citation remains in the left column and covers the combined assessment/administration-response pages.
