# BOA Recommendations

The working static dashboard is in [`website/`](website/README.md). Existing source reports, extraction scripts, databases and review outputs are retained separately.

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory website
```

Local preview: http://127.0.0.1:4173/

- [Website documentation and data updates](website/README.md)
- [Validation results](website/VALIDATION.md)
- [Data gaps](website/DATA_GAPS.md)
- [Prepared manual-only GitHub Pages workflow](.github/workflows/pages.yml)

Repository: https://github.com/henrisalomon/BOA-recommendation-trackers

GitHub Pages: https://henrisalomon.github.io/BOA-recommendation-trackers/

Publication uses the manual workflow with `publish` enabled; pushes alone do not deploy.

## Review and local archives

- [Pending human review](outputs/boa-2015-2024/HUMAN_REVIEW_REGISTER.md)
- [Review follow-up and evidence](outputs/boa-2015-2024/HUMAN_REVIEW_FOLLOWUP.md)
- [Entity-mapping review](outputs/boa-2015-2024/entity_mapping_review.csv)
- [Cleanup archive and restore instructions](archives/cleanup-2026-09-22/README.md)

Active review material remains unpacked. Historical staging copies and diagnostics are compressed under `archives/`; validation baselines stay at their original paths.
