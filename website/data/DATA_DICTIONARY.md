# BOA recommendations database — review edition

Collection cutoff: **22 September 2026**. This is a populated research and review dataset, not a certified implementation-rate study. The full acceptance criteria have **not** yet passed.

## Delivered evidence and coverage

- 52 catalogued documents; 52 downloaded PDFs. All **20 core BOA PDFs** for financial periods ending 2015–2024 have validated symbols and periods.
- 1,334 provisional recommendation identities and 6,890 source observations. These counts describe the extraction, not an independently certified population of recommendations.
- 0 observations lack a resolved recommendation identity; 4 history observations require review. These are overlapping populations. 0 recommendation identities also have potential lineage ambiguity.
- 20 of 23 extracted annex populations match their captured printed status totals. Matching a total does not validate every identity, wording, or status mark.
- Latest collected core follow-up: Volume I **A/80/5 (Vol. I), financial year 2024**, SG **A/80/353**; Volume II **A/80/5 (Vol. II), financial year 2025**, SG **A/80/629**. Nineteen new 2025 SG recommendation entries are excluded from the study cohort.
- Scope is restricted to recommendations originating in **Volume I or Volume II** and their BOA/SG volume-specific follow-up reports. Stand-alone special-stream reports and recommendations originating in other volumes are excluded. At the user’s request, 26 out-of-scope PDFs and their extracted caches were deleted.
- Original reference workbook `BOA rec.xlsx` is preserved unchanged in the workspace.

Catalogue starting points: [BOA reports](https://www.un.org/en/united-nations-board-auditors/board-auditors-reports#reportsCollapse26) and [related/SG reports](https://www.un.org/en/united-nations-board-auditors/acabq-reports). Direct catalogue access was restricted; indexed official catalogue content and the official UN document endpoint were used. The manifest records document URLs and SHA-256 checksums. Recheck publication availability when refreshing.

## Files and use

`boa_recommendations.sqlite` is the authoritative structured research dataset. `BOA_recommendations_review.xlsx` provides Recommendations, History, Analysis and Reports sheets with filters, frozen identifiers and reviewer-note columns. CSV exports preserve the full cell contents and support independent analysis. `reports/BOA/` and `reports/SG/` contain original PDFs, relative to the workspace or package root. `report_manifest.json` records collection provenance; `reconciliation.csv`, `unresolved_matches.json`, `validation_summary.json`, and `rule_validation.json` disclose quality checks.

Excel does not write back into SQLite. The staged pipeline captures reviewer notes by stable IDs before rebuilding and migrates unique source locators; ambiguous migrations are quarantined in data/reviewer_state.json. Long source narratives remain complete in cell values, SQLite and CSV; some exceed Excel's maximum displayed row height and should be read in the formula bar or source PDF.

## Three tables

**Reports:** one document, including separately catalogued corrigenda. `report_id` is the internal key; `symbol` is unique. `source_type` is BOA or SG. `volume`, `stream`, and `scope_role` describe coverage. `audit_year` is the financial-period end year for core reports; the originating report and the update report retain separate years. `period_start` and `period_end` are explicit financial-period dates where validated. `publication_date`, `publication_year`, and `publication_date_basis` preserve the documented issue date/year; a missing date is blank, not estimated. `related_boa_symbol` links SG reports where catalogued. URL, local path, checksum, page count, collection cutoff, download/validation/extraction status, and history/review counts provide provenance.

**Recommendations:** one tracked original recommendation. Identity is original document + chapter + paragraph/subparagraph, backed by `recommendation_id`. `original_text_basis` distinguishes wording recovered from an originating report, annex reproduction, and separately tracked subparts whose parent paragraph was recovered. `audit_year` is the original audit year. `stream` preserves the originating stream. `population` is cohort_2015_2024, inherited_backlog, or scope_review. `identity_review` flags uncertain lineage. `linked_references_json` retains other report symbols mentioned in originating wording; these are references, not validated equivalence or reissue links.

**History:** one appearance/update in a source document. `history_id`, `recommendation_id`, and `report_id` link evidence. A null recommendation ID explicitly retains an unresolved match. `kind` distinguishes issuance, BOA annex, SG narrative update, and SG table. `status_raw` preserves the printed column heading selected by its X, or SG status wording. `status_group` is a separate BOA-only analytical mapping. `recommendation_text` preserves wording as reproduced in that source. Entities, assignment, area, priority and all deadline fields preserve source wording. `administration_response` and `board_assessment` are separate from `sg_progress`. Locators include annex, row number, paragraph, printed page, first PDF page and all PDF pages; `status_marks_json` retains X coordinates. `review_status`, `review_issues` and `reviewer_notes` are explicit review fields.

## Status and counting rules

No automatic splitting of multi-part recommendations, fuzzy merging of similar recommendations, or implementation inferred from disappearance. Where different original references contain nearly identical wording, identities remain separate and are flagged. Some lineage remains unresolved.

BOA “Implemented” and “Fully implemented” map to analytical implemented. “Under implementation”, “Not implemented”, “Overtaken by events”, and “Closed by the Board” remain distinct. Exact source wording remains intact. SG statuses never populate BOA confirmation. A conflicting X and Board narrative are retained rather than silently corrected. Out-of-scope annex recommendations are excluded even when reproduced inside a retained Volume I/II document.

Chronology uses documented publication year, audit year, then exact issue date where known. Missing dates remain blank; same-period uncertain ordering is flagged. Checked-response source columns identify the source independently of the latest observation. `latest_boa` and `latest_sg` select the last unflagged assessment independently; they can therefore be older than the latest flagged observation. The Recommendations export separately shows the **latest observed** source/status/review flag, so an unresolved newer observation is visible. Response/assessment fields explicitly labelled “checked row” come from the latest unflagged row. `first_boa_confirmation` selects the earliest unflagged BOA implemented assessment and excludes recommendation identities with unresolved lineage. “Machine checked” is not a manual certification.

## Human decisions

`reviewed_status`, `reviewed_status_group`, `review_case_id` and `review_decision_json` retain attributable human decisions separately from `status_raw` and `status_group`. Approved decisions drive confirmation and checked latest BOA treatment; exact latest source marks remain visible alongside the reviewed status. HUM-01 and HUM-03 are approved by Henri on 22 September 2026. The narrative for HUM-01 describes closure/reiteration, so its reviewed Implemented label is not evidence of actual completion date. HUM-02, HUM-04 and HUM-05 remain pending final decisions.

## Dates and deadlines

Original audit year, update-report audit year, and report date are separate. An annex title such as “up to financial year ended 2023” describes its recommendation population and is not assigned as a status date. Explicit status-as-of and actual completion-date fields exist but have not been systematically coded; they remain blank. Completion information in narratives is retained as text.

BOA confirmation audit year is the audit year of the first observed qualifying BOA assessment, with its confirming report and report date. It is **not** actual completion year. A year difference is an audit-cycle interval, not elapsed time in days.

`initial_target_raw` is populated only from an explicitly labelled initial/original deadline; `target_raw` and `revised_target_raw` retain their own labels. Earliest observed target is derived from chronological SG observations and is not presented as an original deadline. Distinct deadline strings are a review aid, not a finalized count of extensions: wording changes and date precision must be reconciled first. No date parsing is imposed on “second quarter”, “ongoing” or other source wording. Missing and not-applicable are not interchangeable.

## Analysis restrictions

Rates are intentionally blank. The Analysis sheet contains extraction inventories, separate annual annex status populations, reconciliation controls and 1/2/3-audit-year follow-up windows. Insufficient calendar follow-up is labelled and is not counted as failure. Available calendar coverage does not establish complete source coverage or a validated denominator.

Open-backlog age uses the last documented open BOA assessment's audit year minus origin audit year. It does not assert that a recommendation remains open today. Inherited backlog must be analyzed separately from 2015–2024 issuance cohorts. Reviewed-annex rates, issuance-cohort rates and backlog composition have different denominators and must never be combined without explanation.

## Outstanding work before analytical release

1. Resolve remaining original-reference/lineage matches and review all flagged rows against PDF images.
2. Issuance counts for all 20 core reports now reconcile with their corresponding SG published current-year totals. The decision log records unusual wording and excluded narrative reiterations. This count reconciliation does not alone certify every field. All tracked original paragraphs are now recovered; separately tracked subparts retain their explicit basis. The 20 current-year paragraph identity sets also match their SG counterparts.
3. Reconcile remaining table discrepancies and inspect formats with no captured total. Preserve source contradictions where no authoritative correction resolves them.
4. Retain only Volume I/II and their volume-specific SG sources. Four collected corrigenda were read and do not change recommendation wording or implementation statuses.
5. Validate source locators, SG section matching, explicit as-of dates and actual completion dates before using them analytically. “Validated PDF” means identity/period validated, not that every extracted field was reviewed.

Database integrity, foreign keys, repeat-import stability, all 20 core PDFs and the critical status rules are tested in `rule_validation.json`. Workbook counts are checked against SQLite. Full manual review and methodology approval remain pending. See IMPLEMENTATION_REPORT.md, HUMAN_REVIEW_REGISTER.md and mitigation_validation.json for the completed corrections and remaining gates. Four source-dependent history rows remain excluded from qualifying confirmation; three raw printed-total discrepancies remain visible; TECH-10 is reconciled by Henri’s reviewed HUM-03 treatment.

### Missing originating documents

None among the currently catalogued documents. A/65/5 (Vol. I) was supplied by the user and verified against its document symbol and biennium.

### Detected source-status conflicts

| Update report | PDF page | Origin reference | Printed status mark |
|---|---:|---|---|
| A/70/5 (Vol. II) | 145 | A/69/5 (Vol. II), chap. II, for the year; para. 373 | Implemented |
| A/71/5 (Vol. II) | 141 | A/70/5 (Vol. II), chap. II, for the year ended 30 June 2015; para. 342 | Implemented |
| A/72/5 (Vol. II) | 120 | A/68/5 (Vol. II), chap. II, for the period; para. 93 | Under implementation |
| A/79/5 (Vol. I) | 143 | A/77/5 (Vol. I), chap. II, para. 231 | Under implementation |
| A/79/5 (Vol. I) | 179 | A/78/5 (Vol. I), chap. II, para. 324 | Under implementation |

The conflicting Board narrative is preserved in History; affected observations are excluded from first-confirmation calculations.

## SQLite field inventory

**Reports:** `report_id`, `symbol`, `source_type`, `volume`, `stream`, `audit_year`, `period_start`, `period_end`, `publication_date`, `publication_year`, `publication_date_basis`, `scope_role`, `related_boa_symbol`, `catalogue_url`, `download_url`, `local_path`, `sha256`, `page_count`, `download_status`, `validation_status`, `extraction_status`, `history_count`, `unresolved_history_count`, `collection_cutoff`.

**Recommendations:** `recommendation_id`, `original_report_id`, `original_report_symbol`, `chapter`, `paragraph`, `original_text`, `original_text_basis`, `audit_year`, `stream`, `population`, `identity_review`, `linked_references_json`.

**History:** `history_id`, `recommendation_id`, `report_id`, `source_type`, `kind`, `annex`, `row_number`, `source_paragraph`, `pdf_page`, `pdf_pages_json`, `printed_page`, `status_raw`, `status_group`, `status_as_of`, `status_as_of_basis`, `recommendation_text`, `reference_raw`, `entities_raw`, `assignment_raw`, `area_raw`, `priority_raw`, `initial_target_raw`, `target_raw`, `revised_target_raw`, `administration_response`, `board_assessment`, `sg_progress`, `actual_completion_date_raw`, `status_marks_json`, `review_status`, `review_issues`, `reviewer_notes`, `field_pdf_pages_json`, `extraction_evidence_json`, `reviewed_status`, `reviewed_status_group`, `review_case_id`, `review_decision_json`.

