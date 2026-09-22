"""Refresh derived entity fields without re-extracting source evidence or locators."""
import csv
import hashlib
import json
import sqlite3
from pathlib import Path
from entities import EntityResolver

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT/'outputs/boa-2015-2024'
FIELDS = ('entities_json', 'offices_json', 'responsibility_type', 'entity_mapping_status', 'unmatched_entity_text')

def main():
    resolver = EntityResolver(ROOT)
    db = sqlite3.connect(OUT/'boa_recommendations.sqlite')
    db.row_factory = sqlite3.Row
    columns = [r[1] for r in db.execute('PRAGMA table_info(History)') if r[1] not in FIELDS]
    query = 'SELECT '+','.join(columns)+' FROM History ORDER BY history_id'
    before = [tuple(r) for r in db.execute(query)]
    changed = 0
    with db:
        for h in db.execute('SELECT * FROM History').fetchall():
            if h['entity_mapping_evidence']:
                continue  # Preserve checksum-bound corrections already reviewed.
            result = resolver.resolve(h['entities_raw'])
            values = (json.dumps(result['entities']), json.dumps(result['offices']), result['responsibility_type'], result['entity_mapping_status'], result['unmatched_entity_text'])
            changed += values != tuple(h[k] for k in FIELDS)
            db.execute('UPDATE History SET '+','.join(k+'=?' for k in FIELDS)+' WHERE history_id=?', (*values,h['history_id']))
            db.execute('DELETE FROM HistoryEntities WHERE history_id=?',(h['history_id'],))
            db.executemany('INSERT INTO HistoryEntities VALUES (?,?,?)', [(h['history_id'],p['entity'],p['office'] or '') for p in result['offices']])
        assert before == [tuple(r) for r in db.execute(query)]
        assert db.execute('PRAGMA integrity_check').fetchone()[0] == 'ok'
        assert not db.execute('PRAGMA foreign_key_check').fetchall()
    histories = {r['history_id']:dict(r) for r in db.execute('SELECT * FROM History')}
    site = ROOT/'website/data'
    for path in (site/'details').glob('*.json'):
        obj=json.loads(path.read_text());modified=False
        for h in obj['history']:
            new=histories[h['history_id']]
            for field in FIELDS:
                if h.get(field)!=new[field]:h[field]=new[field];modified=True
        if modified:path.write_text(json.dumps(obj,ensure_ascii=False,separators=(',',':'))+'\n')
    path=site/'snapshots.json';snapshots=json.loads(path.read_text())
    for rows in snapshots.values():
        for row in rows:
            h=histories.get(row.get('entityHistoryId'))
            if h:
                row.update(entities=json.loads(h['entities_json']),offices=json.loads(h['offices_json']),responsibility=h['responsibility_type'],entityMappingStatus=h['entity_mapping_status'])
    path.write_text(json.dumps(snapshots,ensure_ascii=False,separators=(',',':'))+'\n')
    review=[{k:h[k] for k in ('history_id','report_id','entities_raw',*FIELDS)} for h in histories.values() if h['entity_mapping_status']=='review_required']
    with (OUT/'entity_mapping_review.csv').open('w') as f:
        writer=csv.DictWriter(f,fieldnames=['history_id','report_id','entities_raw',*FIELDS]);writer.writeheader();writer.writerows(review)
    metadata_path=site/'metadata.json'
    metadata=json.loads(metadata_path.read_text())
    records=[dict(r) for r in db.execute('SELECT * FROM Recommendations')]
    reports={r['report_id']:dict(r) for r in db.execute('SELECT * FROM Reports')}
    metadata['sourceLogicalSha256']=hashlib.sha256(json.dumps([records,list(histories.values()),reports],sort_keys=True).encode()).hexdigest()
    metadata['entityMappingReference']=json.loads((ROOT/'data/reference/eosg-provenance.json').read_text())
    metadata_path.write_text(json.dumps(metadata,ensure_ascii=False,separators=(',',':'))+'\n')
    result={'changed_observations':changed,'remaining_review_observations':len(review),'source_fields_unchanged':len(before),'eosg_entities':len(resolver.eosg_codes)}
    (OUT/'eosg_mapping_validation.json').write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(result))

if __name__=='__main__':main()
