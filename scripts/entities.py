"""Conservative, reproducible entity matching. Never split on internal commas/and."""
import json
import re
from functools import lru_cache


def audit_period(year, volume):
    if year is None:
        return None
    return f'{int(year)-1}-{int(year)%100:02d}' if volume == 'II' else str(year)


NAMES = {
    'DCO': ['Development Coordination Office', 'United Nations Development Coordination Office', 'UNDCO'],
    'DMSPC': ['Department of Management Strategy, Policy and Compliance', 'Department Management Strategy, Policy and Compliance'],
    'DOS': ['Department of Operational Support'],
    'DPO': ['Department of Peace Operations'],
    'DPPA': ['Department of Political and Peacebuilding Affairs', 'Department of Peacebuilding and Political Affairs'],
    'OICT': ['Office of Information and Communications Technology'],
    'OCHA': ['Office for the Coordination of Humanitarian Affairs'],
    'DESA': ['Department of Economic and Social Affairs'],
    'DGACM': ['Department for General Assembly and Conference Management'],
    'DGC': ['Department of Global Communications'],
    'DSS': ['Department of Safety and Security'],
    'UNOG': ['United Nations Office at Geneva'],
    'UNON': ['United Nations Office at Nairobi'],
    'UNOV': ['United Nations Office at Vienna'],
    'UNOP': ['United Nations Office for Partnerships'],
    'ECA': ['Economic Commission for Africa'],
    'ESCAP': ['Economic and Social Commission for Asia and the Pacific'],
    'ESCWA': ['Economic and Social Commission for Western Asia'],
    'OAJ': ['Office of Administration of Justice'],
    'ODA': ['Office for Disarmament Affairs'],
    'OHCHR': ['Office of the United Nations High Commissioner for Human Rights'],
    'OHRLLS': ['Office of the High Representative for the Least Developed Countries, Landlocked Developing Countries and Small Island Developing States'],
    'EOSG': ['Executive Office of the Secretary-General'],
    'CEB': ['United Nations System Chief Executives Board for Coordination', 'United Nations Chief Executives Board for Coordination'],
    'ERPSD': ['Enterprise Resource Planning Solution Division'],
    'UNAMA': ['United Nations Assistance Mission in Afghanistan'],
    'UNAMI': ['United Nations Assistance Mission for Iraq'],
    'UNSMIL': ['United Nations Support Mission in Libya'],
    'UNMISS': ['United Nations Mission in South Sudan'],
    'MINUSCA': ['United Nations Multidimensional Integrated Stabilization Mission in the Central African Republic'],
    'MONUSCO': ['United Nations Organization Stabilization Mission in the Democratic Republic of the Congo'],
    'UNISFA': ['United Nations Interim Security Force for Abyei'],
    'UNSOS': ['United Nations Support Office in Somalia'],
    'UNTSO': ['United Nations Truce Supervision Organization'],
    'UNIFIL': ['United Nations Interim Force in Lebanon'],
    'UNDOF': ['United Nations Disengagement Observer Force'],
    'UNFICYP': ['United Nations Peacekeeping Force in Cyprus'],
    'UNMIK': ['United Nations Interim Administration Mission in Kosovo'],
    'MINURSO': ['United Nations Mission for the Referendum in Western Sahara'],
    'UNMOGIP': ['United Nations Military Observer Group in India and Pakistan'],
    'BINUH': ['United Nations Integrated Office in Haiti'],
    'UNOWAS': ['United Nations Office for West Africa and the Sahel'],
    'UNOCA': ['United Nations Regional Office for Central Africa'],
    'UNLB': ['United Nations Logistics Base at Brindisi, Italy', 'United Nations Logistics Base'],
    'OSESGY': ['Office of the Special Envoy of the Secretary-General for Yemen'],
}

ADDITIONAL = {
    'DM': ['Department of Management'],
    'DFS': ['Department of Field Support'],
    'DPKO': ['Department of Peacekeeping Operations'],
    'DPA': ['Department of Political Affairs'],
    'OIOS': ['Office of Internal Oversight Services'],
    'OLA': ['Office of Legal Affairs'],
    'Ethics Office': [],
    'UNCTAD': ['United Nations Conference on Trade and Development'],
    'UNJSPF': ['United Nations Joint Staff Pension Fund'],
    'UNAMID': ['African Union-United Nations Hybrid Operation in Darfur', 'African Union–United Nations Hybrid Operation in Darfur'],
    'MINUSMA': ['United Nations Multidimensional Integrated Stabilization Mission in Mali'],
    'UNSOM': ['United Nations Assistance Mission in Somalia'],
    'UNITAMS': ['United Nations Integrated Transition Assistance Mission in the Sudan'],
}


def normalized(text):
    return re.sub(r'\s+', ' ', (text or '').replace('Secretary- General', 'Secretary-General')).strip()


class EntityResolver:
    def __init__(self, root):
        self.catalogue = json.loads((root/'data/entity_catalogue.json').read_text())
        self.pairs = {(p['entity'] if p['entity']!='UNDCO' else 'DCO', p['office'] if p['office']!='UNDCO' else 'DCO') for p in self.catalogue['pairs']}
        self.codes = {p[0] for p in self.pairs}
        aliases = {}
        for code in self.codes:
            for name in [code, *NAMES.get(code, [])]:
                aliases[name] = (code, code if (code, code) in self.pairs else '')
        for code,names in ADDITIONAL.items():
            for name in [code,*names]:aliases[name]=(code,code)
        # Pinned EOSG reference data supplies entity names, not office assignments.
        reference = json.loads((root/'data/reference/eosg-un-entities.json').read_text())
        self.eosg_codes = {entry['entity'] for entry in reference}
        for entry in reference:
            code = entry['entity']
            pair = (code, code if (code, code) in self.pairs or code not in self.codes else '')
            for name in (code, entry.get('entity_long')):
                if name:
                    aliases.setdefault(normalized(name), pair)
        # Official UN sources use UNMSIL as a misspelling of the Libya mission.
        # Evidence and the user's separate-RCS decision are recorded in provenance.
        aliases['UNMSIL'] = ('UNSMIL', 'UNSMIL')
        aliases['RCS'] = ('RCS', 'RCS')
        for office, name in [('Great Lakes Region', 'Great Lakes Region'), ('Syria', 'Syria')]:
            aliases['Office of the Special Envoy of the Secretary-General for '+name] = ('OSESG', office)
            aliases['Office of the Special Envoy of the Secretary-General for the '+name] = ('OSESG', office)
        # Explicit office wording only; department-level wording never implies an office.
        for code, office in self.pairs:
            if office != code and office not in ('Syria', 'Great Lakes Region'):
                aliases[office] = (code, office)
        for name, office in [('Office of Human Resources', 'OHR'), ('Office of Programme Planning, Finance and Budget', 'OPPFB'), ('Business Transformation and Accountability Division', 'BTAD'), ('Office of Supply Chain Management', 'OSCM')]:
            pair = next((p for p in self.pairs if p[1] == office), None)
            if pair:
                aliases[name] = pair
        self.aliases = {normalized(k).casefold():v for k,v in aliases.items()}
        self.pattern = re.compile(r'(?<!\w)(?:'+ '|'.join(re.escape(k) for k in sorted(self.aliases, key=len, reverse=True))+r')(?!\w)', re.I)

    @lru_cache(maxsize=2048)
    def resolve(self, raw):
        text = normalized(raw)
        found = []; remainder = []; last = 0
        for match in self.pattern.finditer(text):
            remainder.append(text[last:match.start()]);last=match.end()
            pair=self.aliases[match[0].casefold()]
            if pair not in found:found.append(pair)
        remainder.append(text[last:])
        # Punctuation and conjunctions between complete names are safe separators.
        residue = ' '.join(remainder)
        residue = re.sub(r'\b(?:and|the)\b|[,;()&/]', ' ', residue, flags=re.I)
        residue = normalized(residue)
        # An explicitly named office replaces an accompanying parent mention for counting.
        found=[p for p in found if p[1] not in ('',p[0]) or not any(q[0]==p[0] and q[1] not in ('',q[0]) for q in found)]
        codes = sorted({p[0] for p in found})
        complete = bool(text) and not residue and bool(found)
        # Unknown fragments could conceal another entity, so never infer Individual.
        collective=bool(re.search(r'\b(?:peacekeeping missions|regional commissions)\b', residue, re.I))
        kind = 'Joint' if len(found)>1 or collective else 'Individual' if complete else 'Unknown'
        additional=any(p[0] in ADDITIONAL and p[0] not in self.eosg_codes for p in found)
        return dict(entities=codes, offices=[{'entity':a,'office':b or None} for a,b in sorted(found)],
                    responsibility_type=kind, entity_mapping_status='review_required' if additional or (text and not complete) else 'matched' if complete else 'not_reported',
                    unmatched_entity_text=residue or None)


def enrich_database(db, root):
    resolver=EntityResolver(root)
    for table in ('Reports','Recommendations'):
        db.execute(f'ALTER TABLE {table} ADD COLUMN audit_period TEXT')
    for rid,year,volume in db.execute('SELECT report_id,audit_year,volume FROM Reports').fetchall():
        db.execute('UPDATE Reports SET audit_period=? WHERE report_id=?',(audit_period(year,volume),rid))
    for rid,year,volume in db.execute('SELECT q.recommendation_id,q.audit_year,r.volume FROM Recommendations q JOIN Reports r ON r.report_id=q.original_report_id').fetchall():
        db.execute('UPDATE Recommendations SET audit_period=? WHERE recommendation_id=?',(audit_period(year,volume),rid))
    db.executescript('''
      CREATE TABLE EntityOffices(entity TEXT NOT NULL,office TEXT NOT NULL,PRIMARY KEY(entity,office));
      CREATE TABLE HistoryEntities(history_id TEXT NOT NULL REFERENCES History(history_id),entity TEXT NOT NULL,office TEXT NOT NULL DEFAULT '',PRIMARY KEY(history_id,entity,office));
      CREATE INDEX history_entities_entity ON HistoryEntities(entity,history_id);
      ALTER TABLE History ADD COLUMN entities_json TEXT;
      ALTER TABLE History ADD COLUMN offices_json TEXT;
      ALTER TABLE History ADD COLUMN responsibility_type TEXT;
      ALTER TABLE History ADD COLUMN entity_mapping_status TEXT;
      ALTER TABLE History ADD COLUMN unmatched_entity_text TEXT;
      ALTER TABLE History ADD COLUMN entity_mapping_evidence TEXT;
    ''')
    db.executemany('INSERT INTO EntityOffices VALUES (?,?)',sorted(resolver.pairs))
    for hid,raw in db.execute('SELECT history_id,entities_raw FROM History').fetchall():
        result=resolver.resolve(raw)
        evidence=None
        if hid=='H_aa055e1fca4a0b370c74' and raw=='Affairs':
            expected='ae8e0e1b6ec0fc88a15ec7139a683d13efc28a6b3aaf613504b166b09b980c56'
            actual=db.execute('SELECT r.sha256 FROM Reports r JOIN History h USING(report_id) WHERE h.history_id=?',(hid,)).fetchone()[0]
            if actual!=expected:raise ValueError('Entity evidence source checksum changed')
            result=resolver.resolve('Office for the Coordination of Humanitarian Affairs')
            evidence='A/74/323, PDF page 77, source paragraph 423: Department responsible is Office for the Coordination of Humanitarian Affairs. Extracted raw fragment retained. PDF SHA-256: '+expected
        db.execute('UPDATE History SET entity_mapping_evidence=? WHERE history_id=?',(evidence,hid))
        db.execute('UPDATE History SET entities_json=?,offices_json=?,responsibility_type=?,entity_mapping_status=?,unmatched_entity_text=? WHERE history_id=?',
                   (json.dumps(result['entities']),json.dumps(result['offices']),result['responsibility_type'],result['entity_mapping_status'],result['unmatched_entity_text'],hid))
        db.executemany('INSERT INTO HistoryEntities VALUES (?,?,?)',[(hid,p['entity'],p['office'] or '') for p in result['offices']])
