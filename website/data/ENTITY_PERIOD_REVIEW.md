# Entity and PKO period changes

Volume II uses PKO fiscal periods: A/75/5 (Vol. II) = **2019-20**; A/78/5 (Vol. II) = **2022-23**. Volume I retains calendar years. `audit_period` is the display field; numeric `audit_year` remains the ending year for chronology and calculations. Publication dates and source filenames remain unchanged.

## Responsibility rules

The supplied `entity.xlsx` is retained as a checksum-traced reference in `entity_catalogue.json`. DCO and UNDCO map to DCO. Distinct entity/office pairs determine Joint versus Individual: DMSPC/BTAD plus DMSPC/OPPFB is Joint. A generic department mention does not imply an office. Repeated mentions of the same unit count once. Overall totals count distinct recommendations, even when they have multiple responsible units.

The Entity / office filter accepts parent entities and specific offices. An entity breakdown can overlap with its office breakdown, and joint recommendations appear under each responsible unit. Do not add those breakdowns. Responsibility and entity attribution in trends are fixed to the selected reporting period. Raw source wording remains available.

Historical entities absent from the supplied list are retained separately and flagged for review, as instructed. No successor mapping is inferred. Plural collective wording establishes Joint responsibility but does not identify its individual members. Incomplete matches without enough evidence of multiple units remain Unknown.

## EOSG mapping update — 22 September 2026

Entity names and acronyms now use EOSG’s [UN System Chart dataset](https://github.com/UN-EOSG-Analytics/un-system-chart-navigator/blob/0873af1d3f9f89b12ffd60a3a9e9fd2a16a149c4/public/un-entities.json), combined with the supplied office catalogue. The UN80 abbreviation reference primarily covers leadership titles and is retained separately.

UNMSIL is normalized to UNSMIL using official UN evidence; source wording is preserved. RCS remains separate from DCO under the user's explicit instruction. Historical entities are not mapped to successors. Pinned source and decision records are included in metadata.json under entityMappingReference.

617 observations remain review-required, primarily historical or additional entities and collective wording. The corrected UNMSIL observation still includes historical entities requiring review. The initial EOSG application resolved 53 observation mappings; the spelling correction updated one further observation. All 6,890 source observations retain their non-mapping fields.

Entity matching and dashboard arithmetic/filter tests pass; SQLite integrity and foreign keys pass.
