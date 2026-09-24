# Entity and PKO period changes

Volume II uses PKO fiscal periods: A/75/5 (Vol. II) = **2019-20**; A/78/5 (Vol. II) = **2022-23**. Volume I retains calendar years. `audit_period` is the display field; numeric `audit_year` remains the ending year for chronology and calculations. Publication dates and source filenames remain unchanged.

## Responsibility rules

The supplied `entity.xlsx` is retained as a checksum-traced reference in `entity_catalogue.json`. DCO and UNDCO map to DCO. Distinct entity/office pairs determine Joint versus Individual: DMSPC/BTAD plus DMSPC/OPPFB is Joint. A generic department mention does not imply an office. Repeated mentions of the same unit count once. Overall totals count distinct recommendations, even when they have multiple responsible units.

The Entity / office filter accepts parent entities and specific offices. An entity breakdown can overlap with its office breakdown, and joint recommendations appear under each responsible unit. Do not add those breakdowns. Responsibility and entity attribution in trends are fixed to the selected reporting period. Raw source wording remains available.

Historical entities absent from the supplied list are retained separately and flagged for review, as instructed. No successor mapping is inferred. Plural collective wording establishes Joint responsibility but does not identify its individual members. Incomplete matches without enough evidence of multiple units remain Unknown.

## Human review remaining

60 distinct source wordings across 618 observations remain flagged. The complete locator list is [entity_mapping_review.csv](entity_mapping_review.csv); each row contains a History ID and source report ID. Use those IDs when leaving comments in the human review register. Separate historical entities are intentionally retained; their flags are not evidence of an ingestion failure.

“UNMSIL” is normalized to UNSMIL using official UN web evidence recorded in data/reference/eosg-provenance.json; raw wording is retained. RCS remains separate from DCO under the explicit user decision. Collective labels such as “all peacekeeping missions” and “regional commissions” require review only if their individual members are needed.

A/74/323, PDF page 77, paragraph 423 explicitly gives OCHA. The prior extraction left only “Affairs” in the entity field and appended the preceding words to the reproduced recommendation. The derived entity is corrected to OCHA with checksum-bound evidence in `History.entity_mapping_evidence`. Original extracted fields are preserved; the reproduced-text extraction defect remains documented for follow-up.

| Source wording | Observations | Unmatched fragment (if any) |
| --- | ---: | --- |
| African Union-United Nations Hybrid Operation in Darfur | 2 | Historical/additional entity retained for review |
| All peacekeeping missions | 4 | All peacekeeping missions |
| All peacekeeping missions, Department of Management Strategy, Policy and Compliance and Department of Operational Support | 1 | All peacekeeping missions |
| Department for General Assembly and Conference Management and Department of Management | 2 | Historical/additional entity retained for review |
| Department of Economic and Social Affairs and Department of Management | 1 | Historical/additional entity retained for review |
| Department of Economic and Social Affairs, regional commissions and Development Coordination Office | 2 | regional commissions |
| Department of Economic and Social Affairs; regional commissions; and Development Coordination Office | 1 | regional commissions |
| Department of Field Support | 72 | Historical/additional entity retained for review |
| Department of Field Support and Department of Management | 14 | Historical/additional entity retained for review |
| Department of Field Support and Department of Peacekeeping Operations | 3 | Historical/additional entity retained for review |
| Department of Field Support and Department of Political Affairs | 4 | Historical/additional entity retained for review |
| Department of Field Support and Office of Internal Oversight Services | 2 | Historical/additional entity retained for review |
| Department of Field Support, Department of Political Affairs and Department of Management | 1 | Historical/additional entity retained for review |
| Department of Field Support; Department of Peacekeeping Operations and Department of Management | 1 | Historical/additional entity retained for review |
| Department of Field Support; Department of Peacekeeping Operations and Department of Political Affairs | 1 | Historical/additional entity retained for review |
| Department of Management | 281 | Historical/additional entity retained for review |
| Department of Management Strategy, Policy and Compliance and all peacekeeping missions | 12 | all peacekeeping missions |
| Department of Management Strategy, Policy and Compliance and peacekeeping missions | 3 | peacekeeping missions |
| Department of Management Strategy, Policy and Compliance, Department of Operational Support, Office for Disarmament Affairs, Office of the Special Envoy of the Secretary-General for Syria, United Nations Office for West Africa and the Sahel, United Nations Assistance Mission in Somalia, United Nations Support Mission in Libya, United Nations Integrated Office in Haiti, United Nations Integrated Transition Assistance Mission in the Sudan, Office of the Special Envoy of the Secretary-General for the Great Lakes Region and United Nations Assistance Mission in Afghanistan | 1 | Historical/additional entity retained for review |
| Department of Management Strategy, Policy and Compliance, Department of Peace Operations and all peacekeeping missions | 6 | all peacekeeping missions |
| Department of Management Strategy, Policy and Compliance, UNMISS, UNSOS, MINUSMA, MINUSCA, MONUSCO and UNISFA | 1 | Historical/additional entity retained for review |
| Department of Management Strategy, Policy and Compliance; and all peacekeeping missions | 1 | all peacekeeping missions |
| Department of Management and Department for General Assembly and Conference Management | 1 | Historical/additional entity retained for review |
| Department of Management and Department of Field Support | 57 | Historical/additional entity retained for review |
| Department of Management and Ethics Office | 3 | Historical/additional entity retained for review |
| Department of Management and Executive Office of the Secretary-General | 1 | Historical/additional entity retained for review |
| Department of Management and Office for the Coordination of Humanitarian Affairs | 2 | Historical/additional entity retained for review |
| Department of Management and Office of Internal Oversight Services | 7 | Historical/additional entity retained for review |
| Department of Management and Office of Legal Affairs | 9 | Historical/additional entity retained for review |
| Department of Management and United Nations Joint Staff Pension Fund | 1 | Historical/additional entity retained for review |
| Department of Management, Department of Field Support and Office of Internal Oversight Services | 2 | Historical/additional entity retained for review |
| Department of Management, Department of Peacekeeping Operations and Department of Field Support | 10 | Historical/additional entity retained for review |
| Department of Management, Executive Office of the Secretary-General and Office of Legal Affairs | 1 | Historical/additional entity retained for review |
| Department of Management; Department of Field Support; and Department of Peacekeeping Operations | 1 | Historical/additional entity retained for review |
| Department of Management; Department of Peacekeeping Operations and Department of Field Support | 2 | Historical/additional entity retained for review |
| Department of Management; Department of Peacekeeping Operations; and Department of Field Support | 1 | Historical/additional entity retained for review |
| Department of Operational Support and African Union-United Nations Hybrid Operation in Darfur | 1 | Historical/additional entity retained for review |
| Department of Operational Support and all peacekeeping missions | 1 | all peacekeeping missions |
| Department of Operational Support, Office of Information and Communications Technology and all peacekeeping missions | 1 | all peacekeeping missions |
| Department of Peace Operations and all peacekeeping missions | 6 | all peacekeeping missions |
| Department of Peacekeeping Operations | 1 | Historical/additional entity retained for review |
| Department of Peacekeeping Operations and Department of Field Support | 62 | Historical/additional entity retained for review |
| Department of Peacekeeping Operations; Department of Field Support and Department of Management | 2 | Historical/additional entity retained for review |
| Department of Peacekeeping Operations; Department of Field Support and Department of Political Affairs | 1 | Historical/additional entity retained for review |
| Department of Political Affairs | 6 | Historical/additional entity retained for review |
| Department of Political Affairs and Department of Management | 2 | Historical/additional entity retained for review |
| Department of Political Affairs and Department of Safety and Security | 1 | Historical/additional entity retained for review |
| Department of Political Affairs, Department of Field Support and Department of Management | 1 | Historical/additional entity retained for review |
| Department of Safety and Security and Department of Management | 1 | Historical/additional entity retained for review |
| Executive Office of the Secretary-General and Department of Management | 4 | Historical/additional entity retained for review |
| Executive Office of the Secretary-General, Department of Management and Office of Internal Oversight Services | 3 | Historical/additional entity retained for review |
| Executive Office of the Secretary-General, Ethics Office and Department of Management | 1 | Historical/additional entity retained for review |
| Executive Office of the Secretary-General, Ethics Office, Department of Management and Office of Internal Oversight Services | 1 | Historical/additional entity retained for review |
| Office for Disarmament Affairs, Office of the Special Envoy of the Secretary-General for Syria, United Nations Office for West Africa and the Sahel, United Nations Assistance Mission in Somalia, UNMSIL, United Nations Integrated Office in Haiti (BINUH), United Nations Integrated Transition Assistance Mission in the Sudan, Office of the Special Envoy of the Secretary-General for the Great Lakes Region and UNAMA | 1 | Historical/additional entity retained for review |
| Office of Internal Oversight Services and Department of Field Support | 2 | Historical/additional entity retained for review |
| Office of Internal Oversight Services and Department of Management | 1 | Historical/additional entity retained for review |
| United Nations Assistance Mission in Afghanistan and United Nations Assistance Mission in Somalia | 1 | Historical/additional entity retained for review |
| United Nations Assistance Mission in Somalia | 2 | Historical/additional entity retained for review |
| United Nations Office at Geneva and Department of Management | 1 | Historical/additional entity retained for review |
| United Nations Office at Geneva, Department of Management and Department for General Assembly and Conference Management | 1 | Historical/additional entity retained for review |

## Validation

- No local baseline supplied; source-field comparison not performed.
- Fiscal-period examples, SQLite integrity, foreign keys, normalized relation and responsibility rules passed.
- Entity parsing uses longest explicit-name matching and caches repeated wording; it does not split on commas or “and” inside entity names.
