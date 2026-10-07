import {labels,statusKey,scope,searchRows,periodLabel,targetDates} from './model.js';
import {workbook} from './xlsx.js';

const recommendationFields=['id','reportId','symbol','paragraph','chapter','text','textBasis','year','auditPeriod','volume','population','identityReview','priority'];
const snapshotFields=['status','observationYear','entity','assessment','hasAssessment','assessmentStream','historyId','entities','offices','responsibility','entityMappingStatus','entityHistoryId'];
const historyFields=['history_id','recommendation_id','report_id','source_type','kind','annex','row_number','source_paragraph','pdf_page','pdf_pages_json','printed_page','status_raw','status_group','status_as_of','status_as_of_basis','recommendation_text','reference_raw','entities_raw','assignment_raw','area_raw','priority_raw','initial_target_raw','target_raw','revised_target_raw','administration_response','board_assessment','sg_progress','actual_completion_date_raw','status_marks_json','review_status','review_issues','reviewer_notes','field_pdf_pages_json','extraction_evidence_json','reviewed_status','reviewed_status_group','review_case_id','review_decision_json','entities_json','offices_json','responsibility_type','entity_mapping_status','unmatched_entity_text','entity_mapping_evidence','evidence'];
const value=x=>x===null||x===undefined?'':typeof x==='object'?JSON.stringify(x):x;
const sourceUrl=(report,pages)=>report?.download_url&&pages?.length?`${report.download_url.split('#')[0]}#page=${pages[0]}`:report?.download_url||'';

export function selectedRows(data,filters){
 const {year,volume,entity,responsibility,priority,search,status,fullRegister=false}=filters;
 const rows=scope(data,year,volume,entity,year,responsibility,priority);
 return searchRows(data,fullRegister?rows:rows.filter(row=>row.hasAssessment),search,status,fullRegister)
  .sort((a,b)=>data.byId.get(b.id).year-data.byId.get(a.id).year||a.id.localeCompare(b.id));
}

export async function exportRecommendations(data,filters,onProgress=()=>{},loadDetail=async id=>{
 const response=await fetch(`data/details/${id}.json`);
 if(!response.ok)throw Error(`Could not load recommendation ${id} (${response.status})`);
 return response.json();
}){
 const selected=selectedRows(data,filters);
 if(!selected.length)throw Error('No recommendations match the current filters.');
 const details=new Map();let next=0,done=0;
 await Promise.all(Array.from({length:Math.min(8,selected.length)},async()=>{
  while(next<selected.length){
   const row=selected[next++],detail=await loadDetail(row.id);
   details.set(row.id,detail);onProgress(++done,selected.length);
  }
 }));
 const recommendations=[['Recommendation ID','Display status','Reporting period','Original target date','Revised target date','Latest SG status',...recommendationFields.slice(1),...snapshotFields,'Original report URL']];
 const history=[['Recommendation ID','Report symbol','Report publication date','Report audit period','Source URL',...historyFields]];
 for(const s of selected){
  const r=data.byId.get(s.id),d=details.get(s.id),dates=targetDates(d.history),latestSG=d.history.filter(h=>h.source_type==='SG'&&h.status_raw).at(-1);
  recommendations.push([r.id,labels[statusKey(s,r)],periodLabel(filters.year,filters.volume),dates.original?.history[dates.original.field]||'',dates.revised?.history[dates.revised.field]||'',latestSG?.status_raw||'',...recommendationFields.slice(1).map(k=>value(r[k])),...snapshotFields.map(k=>value(s[k])),sourceUrl(data.reports[r.reportId])]);
  for(const h of d.history){const report=data.reports[h.report_id];history.push([r.id,report?.symbol||'',report?.publication_date||report?.publication_year||'',report?.audit_period||report?.audit_year||'',sourceUrl(report,h.evidence?.recommendation_text?.pages||h.evidence?.board_assessment?.pages||h.evidence?.sg_progress?.pages||[h.pdf_page].filter(Boolean)),...historyFields.map(k=>value(h[k]))]);}
 }
 const selection=[['Selection','Value'],['Volume',`Volume ${filters.volume}`],['Reporting period',periodLabel(filters.year,filters.volume)],['Register view',filters.fullRegister?'Full register':'Assessed in selected BOA report'],['Entity',filters.entity],['Responsibility',filters.responsibility],['Priority',filters.priority==='unavailable'?'Not available':filters.priority],['Status',filters.status==='all'?'All statuses':labels[filters.status]||filters.status],['Search',filters.search],['Recommendations',selected.length],['Source export timestamp',data.metadata.exportedAt||''],['Data scope','Strategic Heritage Plan recommendations excluded'],['Status basis','BOA status as of selected reporting period'],['Priority basis','Latest reported value, including later follow-up'],['History coverage','All available reports, including after selected reporting period']];
 return {blob:workbook([{name:'Recommendations',rows:recommendations},{name:'History',rows:history},{name:'Selection',rows:selection}]),count:selected.length,historyCount:history.length-1};
}
