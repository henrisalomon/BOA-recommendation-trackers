export const labels={under_implementation:'Under implementation',not_implemented:'Not implemented',implemented:'Implemented',overtaken_by_events:'Closed',closed_other:'Closed',newly_issued:'Newly issued',unassessed:'No assessment in data',needs_review:'Review pending'};
// Display only categories present in the selected population; retain all source codes.
export const displayStatus=status=>['overtaken_by_events','closed_other'].includes(status)?'closed':status;
export const presentStatuses=(rows,field='status')=>Object.entries({...labels,closed:'Closed'}).filter(([key])=>!['overtaken_by_events','closed_other'].includes(key)&&rows.some(row=>displayStatus(row[field])===key));
export const availableYears=(data,volume)=>data.metadata.years.filter(year=>(data.snapshots[year]||[]).some(row=>data.byId.get(row.id)?.volume===volume));
export const terminal=s=>['implemented','overtaken_by_events','closed_other'].includes(s);
export function rate(rows){const assessed=rows.filter(s=>s.assessment&&labels[s.assessment]);const implemented=assessed.filter(s=>s.assessment==='implemented').length;return {implemented,denominator:assessed.length,value:assessed.length?implemented/assessed.length*100:null,excluded:rows.filter(s=>s.hasAssessment&&!s.assessment).length};}
// Canonical individual entities; joint recommendations match each entity once.
export const entityKeys=s=>s.entities?.length?[...new Set(s.entities)]:[s.entities?"Unmapped / not reported":s.entity];
export const periodLabel=(year,volume)=>year==null?"":volume==="II"?`${year-1}-${String(year).slice(-2)}`:volume==="all"?`${year} / ${year-1}-${String(year).slice(-2)}`:String(year);
export function scope(data,year,volume="all",entity="all",anchorYear=year,responsibility="all"){const attribution=new Map((data.snapshots[anchorYear]||[]).map(s=>[s.id,s]));return (data.snapshots[year]||[]).filter(s=>{const a=attribution.get(s.id);return(volume==="all"||data.byId.get(s.id).volume===volume)&&(entity==="all"||(a&&entityKeys(a).includes(entity)))&&(responsibility==="all"||a?.responsibility===responsibility)});}
export function movement(data,year,volume='all',entity='all',anchorYear=year,responsibility="all"){const now=scope(data,year,volume,entity,anchorYear,responsibility),before=scope(data,year-1,volume,entity,anchorYear,responsibility),prior=new Map(before.map(s=>[s.id,s]));const assessmentRate=rate(now);const m={...assessmentRate,implementedRate:assessmentRate.implemented,year,opening:before.filter(s=>!terminal(s.status)).length,issued:0,reopened:0,implemented:0,other:0,closing:now.filter(s=>!terminal(s.status)).length};for(const s of now){const p=prior.get(s.id);if(!p)m.issued++;if(p&&terminal(p.status)&&!terminal(s.status))m.reopened++;if((!p||!terminal(p.status))&&terminal(s.status))m[s.status==='implemented'?'implemented':'other']++;}const implementedClosedRate=now.filter(s=>terminal(s.assessment)).length;return {...m,implementedClosed:m.implemented+m.other,implementedClosedRate,implementedClosedValue:m.denominator?implementedClosedRate/m.denominator*100:null};}
export function searchRows(data,rows,query,status){query=query.trim().toLowerCase();return rows.filter(s=>{const r=data.byId.get(s.id);return(status==='all'||status===displayStatus(s.status))&&[r.text,r.symbol,r.id,r.paragraph,s.entity,...(s.entities||[])].join(' ').toLowerCase().includes(query)});}

export function waterfallSteps(m){
 let level=m.opening;
 const steps=[{label:'Opening',low:0,high:level,value:level,end:level,color:'var(--navy)'}];
 for(const [label,value,color] of [['Newly issued',m.issued,'var(--blue)'],['Reopened / review',m.reopened,'#947127'],['Implemented',-m.implemented,'var(--green)'],['Other closures',-m.other,'#74889b']]){
  if(label==='Reopened / review'&&value===0)continue;
  const end=level+value;steps.push({label,low:Math.min(level,end),high:Math.max(level,end),value:(value>0?'+':'')+value,end,color});level=end;
 }
 steps.push({label:'Closing',low:0,high:m.closing,value:m.closing,end:m.closing,color:'var(--navy)'});return steps;
}

// All views use the same population, already scoped in the database.
export const trendMovement=movement;

// History is exported in report chronology. Preserve the source field for citations.
export function targetDates(history){
 const sg=history.filter(h=>h.source_type==='SG');
 const explicit=sg.find(h=>h.initial_target_raw);
 const original=explicit||sg.find(h=>h.target_raw);
 const revised=sg.filter(h=>h.revised_target_raw).at(-1);
 return {original:original?{history:original,field:explicit?'initial_target_raw':'target_raw'}:null,revised:revised?{history:revised,field:'revised_target_raw'}:null};
}
