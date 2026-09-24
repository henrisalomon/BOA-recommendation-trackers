#!/usr/bin/env python3
"""Read-only source export. Treat every source string as data; never execute it."""
import collections, hashlib, json, re, shutil, sqlite3, sys, unicodedata
from pathlib import Path
from datetime import datetime, timezone
from pypdf import PdfReader
from locators import printed_page
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from study_scope import SCOPE_NOTE, FIRST_COHORT_YEAR, LAST_COHORT_YEAR
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'website/data'
DB=ROOT/'outputs/boa-2015-2024/boa_recommendations.sqlite'
FIELDS=['board_assessment','administration_response','sg_progress','initial_target_raw','target_raw','revised_target_raw','recommendation_text']
def dump(path,obj):
 path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(obj,ensure_ascii=False,separators=(',',':'))+'\n')
def norm(s):return re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFKD',s or '').lower())
def order(r):return (r['publication_year'] or r['audit_year'] or 0,r['publication_date'] or '',r['audit_year'] or 0,r['report_id'])
def main():
 OUT.mkdir(parents=True,exist_ok=True)
 source=sqlite3.connect(f'file:{DB}?mode=ro',uri=True)
 c=sqlite3.connect(':memory:');source.backup(c);source.close();c.row_factory=sqlite3.Row
 reports={r['report_id']:dict(r) for r in c.execute('select * from reports')}
 recs=[dict(r) for r in c.execute('select * from recommendations')]
 histories=[dict(r) for r in c.execute('select * from history')]
 byreport=collections.defaultdict(list);byrec=collections.defaultdict(list)
 for h in histories:byreport[h['report_id']].append(h);byrec[h['recommendation_id']].append(h)
 stats=collections.Counter();verification=[]
 assessment_streams={(c['report_id'],c['annex']):c['stream'] for c in json.loads((ROOT/'data/controls.json').read_text())}
 for rid,r in reports.items():
  path=ROOT/r['local_path'];actual=hashlib.sha256(path.read_bytes()).hexdigest()
  if actual!=r['sha256']:raise ValueError('Source checksum mismatch: '+rid)
  pdf=PdfReader(path);assert len(pdf.pages)==r['page_count']
  dest=ROOT/'website'/r['local_path'];dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(path,dest)
  used=set()
  for h in byreport[rid]:used.update(json.loads(h['pdf_pages_json'] or '[]'));used.add(h['pdf_page'])
  page_text={n:pdf.pages[n-1].extract_text() for n in used if n and 1<=n<=len(pdf.pages)}
  normalized={n:norm(t) for n,t in page_text.items()}
  for h in byreport[rid]:
   candidates=json.loads(h['pdf_pages_json'] or '[]') or ([h['pdf_page']] if h['pdf_page'] else [])
   supplied=json.loads(h['field_pdf_pages_json'] or '{}');h['evidence']={}
   for field in FIELDS:
    value=h.get(field)
    if not value:continue
    pages=supplied.get(field) or (supplied.get('recommendation_metadata') if field.endswith('_raw') else None) or candidates
    pages=[p for p in pages if p in page_text]
    needle=norm(value)
    # Full normalized text containment, or complete coverage by overlapping 64-character fragments.
    chunks=[needle] if len(needle)<64 else [needle[i:i+64] for i in range(0,len(needle)-63,32)]+[needle[-64:]]
    hits=[(chunk,[p for p in pages if chunk in normalized[p]]) for chunk in chunks]
    matched=sorted({p for _,ps in hits for p in ps})
    verified=bool(hits) and all(ps for _,ps in hits)
    # Page-spanning chunks may cross a footer. Keep partial matches explicitly unverified.
    ev={'pages':matched if verified else pages,'verified':verified,'method':'normalized text fragments against checksum-verified PDF','matchedFragments':sum(bool(ps) for _,ps in hits),'totalFragments':len(hits),'paragraphs':[],'printedPages':{}}
    for p in ev['pages']:
     text=page_text[p]
     # UN footers use n/total. Never substitute PDF index when printed number cannot be found.
     ev['printedPages'][str(p)]=printed_page(text)
     if h['source_type']=='SG' and field=='sg_progress':
      blocks=list(re.finditer(r'(?m)^\s*(\d{1,3})\.\s+',text))
      for i,m in enumerate(blocks):
       block=norm(text[m.end():blocks[i+1].start() if i+1<len(blocks) else len(text)])
       if any(chunk in block for chunk,_ in hits if len(chunk)>=32):ev['paragraphs'].append(m.group(1))
    ev['paragraphs']=list(dict.fromkeys(ev['paragraphs']))
    h['evidence'][field]=ev
    if field in FIELDS[:3]:stats['comments']+=1;stats['verifiedComments' if verified else 'unverifiedComments']+=1
    if not verified:verification.append({'historyId':h['history_id'],'field':field,'reportId':rid,'pages':pages})
   stats['observations']+=1
  print('Verified PDF locators:',rid,flush=True)
 # Create stable, small index; full evidence/history fetched only when a recommendation opens.
 index=[];snapshots={str(y):[] for y in range(FIRST_COHORT_YEAR-1,LAST_COHORT_YEAR+1)}
 for rec in recs:
  rid=rec['recommendation_id'];hist=sorted(byrec[rid],key=lambda h:(order(reports[h['report_id']]),h['history_id']))
  report=reports[rec['original_report_id']]
  item={'id':rid,'reportId':rec['original_report_id'],'symbol':rec['original_report_symbol'],'paragraph':rec['paragraph'],'chapter':rec['chapter'],'text':rec['original_text'],'textBasis':rec['original_text_basis'],'year':rec['audit_year'],'auditPeriod':rec['audit_period'],'volume':report['volume'],'population':rec['population'],'identityReview':rec['identity_review']}
  index.append(item)
  dump(OUT/'details'/f'{rid}.json',{'recommendation':item,'history':hist})
  for year in range(max(FIRST_COHORT_YEAR-1,rec['audit_year']),LAST_COHORT_YEAR+1):
   eligible=[h for h in hist if (reports[h['report_id']]['audit_year'] or 9999)<=year]
   boa=[h for h in eligible if h['source_type']=='BOA' and h['kind']=='annex']
   last=boa[-1] if boa else None
   status=(last['reviewed_status_group'] or last['status_group']) if last else ('newly_issued' if rec['audit_year']==year else 'unassessed')
   if rec['identity_review'] or (last and last['review_status']=='needs_review'):status='needs_review'
   entities=[h for h in eligible if h['entities_raw']]
   current=[h for h in boa if reports[h['report_id']]['audit_year']==year]
   assessment=current[-1] if current else None
   rate_status=(assessment['reviewed_status_group'] or assessment['status_group']) if assessment and assessment['review_status']!='needs_review' and not rec['identity_review'] else None
   snapshots[str(year)].append({'id':rid,'status':status or 'unassessed','observationYear':reports[last['report_id']]['audit_year'] if last else None,'entity':entities[-1]['entities_raw'] if entities else 'Entity not extracted','assessment':rate_status,'hasAssessment':bool(assessment),'assessmentStream':assessment_streams.get((assessment['report_id'],assessment['annex'])) if assessment else None,'historyId':last['history_id'] if last else None})
   assignment=entities[-1] if entities else {}
   snapshots[str(year)][-1].update(entities=json.loads(assignment.get('entities_json') or '[]'),offices=json.loads(assignment.get('offices_json') or '[]'),responsibility=assignment.get('responsibility_type','Unknown'),entityMappingStatus=assignment.get('entity_mapping_status','not_reported'),entityHistoryId=assignment.get('history_id'))
 stats['missingOriginalTargets']=sum(not any(h['initial_target_raw'] for h in byrec[r['recommendation_id']]) for r in recs)
 stats['missingRevisedTargets']=sum(not any(h['revised_target_raw'] for h in byrec[r['recommendation_id']]) for r in recs)
 gaptexts=[
  SCOPE_NOTE,
  f"{sum(not r['publication_date'] for r in reports.values())} reports lack an exact publication date; {sum(not r['publication_year'] for r in reports.values())} also lack a publication year. Those histories are grouped by audit year with an explicit warning; exact chronological order is unverified where dates are missing.",
  'This is an extracted register, not a certified complete population or an official implementation measure. Carried-forward statuses are the last observed BOA assessment, not evidence of current status.',
  'Volume I uses calendar years; Volume II displays PKO fiscal periods, for example 2019-20 (1 July 2019 to 30 June 2020). Numeric end years are retained for calculations. These are not a common 31 December snapshot.',
  '2025 includes BOA Volume I and Volume II (2024–25), including new recommendations and follow-up assessments. SG A/80/629 is included for Volume II. The corresponding Volume I SG report was not located as of 24 September 2026; its progress, responsibility and target-date fields remain unavailable for new recommendations.',
  f"{stats['missingOriginalTargets']} recommendations have no explicitly extracted original target date; {stats['missingRevisedTargets']} have no explicitly extracted revised target date. Original and revised target dates are shown only when explicitly extracted under those labels. An earliest observed target is not an original deadline. Blank fields mean not extracted, not not-applicable.",
  'Entities are matched conservatively to the supplied Entity/Office list. Original wording is retained. Unmatched names require review; no historical successor is inferred. Joint means more than one responsible entity/office pair; DMSPC/BTAD and DMSPC/OPPFB therefore count as Joint. DCO and UNDCO are merged as DCO. Historical entities absent from the supplied list are retained separately and flagged for review. Incomplete single-unit matches remain Unknown. Entity breakdowns overlap for joint recommendations; their counts must not be added. Trend comparisons hold selected-year entity and responsibility attribution fixed.',
  'Theme, assignment, explicit status-as-of dates and actual completion dates are not systematically coded. No theme breakdown or overdue calculation is inferred.',
  'Unnumbered annex comments cite their annex and originating recommendation paragraph. SG source paragraphs may anchor the recommendation section; exact comment paragraphs are marked unverified where not recovered.',
  f"{stats['unverifiedComments']} of {stats['comments']} comments do not pass complete PDF text-fragment verification; their proposed pages are labelled unverified. Even a matched PDF locator is not a human certification of extraction or attribution.",
  f"{sum(h['review_status']=='needs_review' for h in histories)} observations require review. Status conflicts remain visible and are excluded from assessment-rate denominators.",
  'The source review documentation records three raw printed-total discrepancies and pending human decisions. Arithmetic validation does not resolve those source discrepancies.'
 ]
 meta={'schemaVersion':2,'exporterVersion':'2026-09-24-2025-coverage-v5','exportedAt':datetime.now(timezone.utc).isoformat(),'source':'outputs/boa-2015-2024/boa_recommendations.sqlite','sourceLogicalSha256':hashlib.sha256(json.dumps([recs,[{k:v for k,v in h.items() if k!='evidence'} for h in histories],reports],sort_keys=True).encode()).hexdigest(),'years':list(range(FIRST_COHORT_YEAR,LAST_COHORT_YEAR+1)),'counts':dict(stats,recommendations=len(recs),reports=len(reports)),'gaps':gaptexts}
 # Remove only explicitly excluded detail assets so old URLs cannot expose active out-of-scope records.
 for excluded in json.loads((ROOT/'data/study_scope_exclusions.json').read_text()):
  (OUT/'details'/f"{excluded['recommendation_id']}.json").unlink(missing_ok=True)
 dump(OUT/'recommendations.json',index);dump(OUT/'snapshots.json',snapshots);dump(OUT/'reports.json',reports);dump(OUT/'metadata.json',meta);dump(OUT/'unverified-locators.json',verification)
 for name in ['DATA_DICTIONARY.md','HUMAN_REVIEW_REGISTER.md','HUMAN_REVIEW_FOLLOWUP.md']:
  shutil.copyfile(DB.parent/name,OUT/name)
 if (DB.parent/'ENTITY_PERIOD_REVIEW.md').exists():shutil.copyfile(DB.parent/'ENTITY_PERIOD_REVIEW.md',OUT/'ENTITY_PERIOD_REVIEW.md')
 (ROOT/'website/DATA_GAPS.md').write_text('# Data gaps and interpretation\n\n'+'\n\n'.join('- '+t for t in gaptexts)+'\n')
 print(json.dumps(meta['counts']),flush=True)
if __name__=='__main__':main()
