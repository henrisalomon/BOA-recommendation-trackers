"""Authoritative analytical scope; raw PDFs and extraction caches stay intact."""
import re

# Verified SHP body sections, including recommendations whose wording omits SHP.
# Symbol and paragraph boundaries prevent keyword-based false exclusions.
SHP_SECTIONS = {
    'A/72/5 (Vol. I)': (368, 413),
    'A/74/5 (Vol. I)': (488, 558),
    'A/76/5 (Vol. I)': (180, 276),
    'A/78/5 (Vol. I)': (295, 309),
}
SCOPE_NOTE = ('Strategic Heritage Plan recommendations and all linked BOA/SG history '
              'are excluded from the analytical database, dashboard and Excel/CSV exports. '
              'Original PDFs and extraction caches are retained as source evidence.')


def is_strategic_heritage(rec):
    if rec.get('stream') == 'Strategic heritage plan':
        return True
    bounds = SHP_SECTIONS.get(rec.get('original_report_symbol'))
    paragraph = re.match(r'^\d+', rec.get('paragraph') or '')
    return bool(bounds and paragraph and bounds[0] <= int(paragraph[0]) <= bounds[1])


def exclude_strategic_heritage(recs, history):
    excluded = {key: rec for key, rec in recs.items() if is_strategic_heritage(rec)}
    removed_history = [h for h in history if h['recommendation_id'] in excluded]
    log = [dict(recommendation_id=key, original_report_symbol=rec['original_report_symbol'],
                paragraph=rec['paragraph'], audit_year=rec['audit_year'],
                reason='Strategic Heritage Plan excluded by user, 23 September 2026',
                source_section_paragraphs=SHP_SECTIONS.get(rec['original_report_symbol']),
                history_ids=[h['history_id'] for h in removed_history if h['recommendation_id'] == key])
           for key, rec in excluded.items()]
    return ({k: r for k, r in recs.items() if k not in excluded},
            [h for h in history if h['recommendation_id'] not in excluded], log)
