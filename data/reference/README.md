# EOSG entity references

Retrieved 22 September 2026. Immutable source URLs and checksums are recorded in `eosg-provenance.json`.

- The UN80 actions repository's `src/constants/abbreviations.ts` supplies 35 abbreviations, primarily leadership titles, bodies and workstreams. Its values are preserved in `eosg-un80-abbreviations.json`; leadership titles are not interpreted as entity names.
- EOSG's UN System Chart Navigator supplies 169 entity codes and full names in `public/un-entities.json`. The complete pinned dataset is preserved in `eosg-un-entities.json` and reused by `scripts/entities.py`.
- The user's `data/entity_catalogue.json` remains the authority for office-to-entity relationships. Existing DCO/UNDCO normalization and historical entity distinctions remain in place.
- RCS remains a separate entity from DCO, as explicitly instructed by the user. UNMSIL maps to UNSMIL based on official UN web evidence recorded in the provenance file; original source wording is preserved.

Run `python3 scripts/refresh_entity_mapping.py` to refresh derived database and website mappings without re-extracting source text or PDF locators. Run `python3 -m unittest discover -s tests -p test_entities.py` to validate matching rules. This refresh does not regenerate Excel exports or publish the website.

Initial application changed 53 observation mappings; all 6,890 observations retained their non-mapping fields. There remain 617 observations flagged for review, including intentionally separate historical entities and collective wording.
