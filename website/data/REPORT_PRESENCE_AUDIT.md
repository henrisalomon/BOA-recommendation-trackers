# BOA report presence and carried status audit

Audit date: 7 October 2026. Scope: in-scope Volume I and II recommendations in the extracted 2015–2025 reports. SG observations remain separate and do not establish a BOA assessment.

## Rule

A recommendation's status **in a given BOA report** exists only if that report contains an assessment row for it. If no row appears, record **Not assessed in selected BOA report** for that year. Keep the recommendation's earlier BOA and SG observations in its history without inferring that it is implemented, closed, open, or still included in a later report. A cumulative last-observed status may be calculated for a separate analytical register, but must be identified as derived and must not be presented as the report's own population or status.

## Audit result

After the approved correction for A/70/5 (Vol. II), paragraph 342, no recommendation classified as Under implementation or Not implemented in the preceding dashboard year lacks a BOA assessment in the next year while remaining open in the derived register. Paragraph 342 was the one such carry-forward: its A/71/5 (Vol. II) X is under Implemented, while the Board's comment says under implementation and SG A/71/801 says In progress. It is absent from A/72/5 (Vol. II). The reviewed treatment follows the BOA mark and preserves the conflict as source evidence.

The earlier dashboard design also repeated **terminal** statuses on cards for recommendations absent from a selected year's BOA report. Those are historical last-observed statuses, not that year's report assessments. At the 2025 endpoint, 709 earlier Volume I recommendations and 384 earlier Volume II recommendations have no current-year BOA assessment; all had earlier terminal statuses in the cumulative register. They remain in the searchable historical catalogue but now display **Not assessed in selected BOA report** for that year. The separate `lastObservedStatus` field records the analytical carry-forward.

| Selected report year | Volume I earlier recommendations without an assessment | Volume II earlier recommendations without an assessment |
|---|---:|---:|
| 2017 | 31 | 95 |
| 2024 | 608 | 369 |
| 2025 | 709 | 384 |

These counts are absences from selected report assessment populations, not evidence of implementation or closure. Annual assessed totals must be counted from the current report's BOA rows (`hasAssessment`), with issued recommendations counted separately. The cumulative waterfall can differ from published BOA opening balances because it applies last-observed state transitions across years.

## Volume I annual check

The same rule was checked independently for every Volume I report from 2016 through 2025. No recommendation with a prior nonterminal BOA status is missing from the next year's Volume I assessment population. Earlier recommendations absent from a selected report all display **Not assessed in selected BOA report**, while their prior statuses remain only in the dated history and derived register field.

| Volume I report year | BOA assessments in that report | Earlier recommendations absent from that report | Absent recommendations given a report status |
|---|---:|---:|---:|
| 2016 | 98 | 9 | 0 |
| 2017 | 129 | 31 | 0 |
| 2018 | 167 | 64 | 0 |
| 2019 | 224 | 78 | 0 |
| 2020 | 279 | 136 | 0 |
| 2021 | 278 | 263 | 0 |
| 2022 | 262 | 381 | 0 |
| 2023 | 220 | 503 | 0 |
| 2024 | 187 | 608 | 0 |
| 2025 | 137 | 709 | 0 |
