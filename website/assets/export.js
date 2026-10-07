import {labels,statusKey,scope,searchRows,periodLabel} from './model.js';
import {workbook} from './xlsx.js';

const recommendationFields=['id','reportId','symbol','paragraph','chapter','text','textBasis','year','auditPeriod','volume','population','identityReview','priority'];
const snapshotFields=['status','observationYear','entity','assessment','hasAssessment','assessmentStream','entities','offices','responsibility','entityMappingStatus'];
const value=x=>x===null||x===undefined?'':typeof x==='object'?JSON.stringify(x):x;
const sourceUrl=report=>report?.download_url||'';

export function selectedRows(data,filters){
 const {year,volume,entity,responsibility,priority,search,status,fullRegister=false}=filters;
 const rows=scope(data,year,volume,entity,year,responsibility,priority);
 return searchRows(data,fullRegister?rows:rows.filter(row=>row.hasAssessment),search,status,fullRegister)
  .sort((a,b)=>data.byId.get(b.id).year-data.byId.get(a.id).year||a.id.localeCompare(b.id));
}

export function exportRecommendations(data,filters){
 const selected=selectedRows(data,filters);
 if(!selected.length)throw Error('No recommendations match the current filters.');
 const recommendations=[['Recommendation ID','Display status','Reporting period',...recommendationFields.slice(1),...snapshotFields,'Original report URL']];
 for(const s of selected){
  const r=data.byId.get(s.id);
  recommendations.push([r.id,labels[statusKey(s,r)],periodLabel(filters.year,filters.volume),...recommendationFields.slice(1).map(k=>value(r[k])),...snapshotFields.map(k=>value(s[k])),sourceUrl(data.reports[r.reportId])]);
 }
 const selection=[['Selection','Value'],['Volume',`Volume ${filters.volume}`],['Reporting period',periodLabel(filters.year,filters.volume)],['Register view',filters.fullRegister?'Full register':'Assessed in selected BOA report'],['Entity',filters.entity],['Responsibility',filters.responsibility],['Priority',filters.priority==='unavailable'?'Not available':filters.priority],['Status',filters.status==='all'?'All statuses':labels[filters.status]||filters.status],['Search',filters.search],['Recommendations',selected.length],['Source export timestamp',data.metadata.exportedAt||''],['Data scope','Strategic Heritage Plan recommendations excluded'],['Status basis','BOA status as of selected reporting period'],['Priority basis','Latest reported value, including later follow-up']];
 return {blob:workbook([{name:'Recommendations',rows:recommendations},{name:'Selection',rows:selection}]),count:selected.length};
}
