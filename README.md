# BOA recommendation trackers

An **unofficial, source-linked dashboard** for exploring United Nations Board of Auditors recommendations, follow-up assessments and trends.

**[Open the dashboard](https://henrisalomon.github.io/BOA-recommendation-trackers/)**

The dashboard brings together recommendations from BOA and Secretary-General reports. Search the recommendation register, filter by year, entity, status and priority, inspect annual changes, and follow links back to the source reports. The published data covers the available 2015–2025 audit years; coverage and review limits are described in the [data gaps](website/DATA_GAPS.md).

This is an independent research project. Its data were extracted with AI and remain subject to human review. Check the cited reports before relying on a recommendation or status. The project is not affiliated with or endorsed by the United Nations.

## Explore the project

- [Dashboard and data documentation](website/README.md)
- [Validation notes](website/VALIDATION.md)
- [Data gaps and limitations](website/DATA_GAPS.md)
- [Published data dictionary](website/data/DATA_DICTIONARY.md)

## Run locally

From the repository root, run:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory website
```

Then open <http://127.0.0.1:4173/>. The dashboard needs HTTP to load its local JSON files. See the [website documentation](website/README.md) for data updates, tests and the manual GitHub Pages publishing workflow.
