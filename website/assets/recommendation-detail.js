const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const field=(label,value)=>`<div class="report-field"><strong>${esc(label)}</strong><span>${value?esc(value):'<span class="report-empty">Not reported</span>'}</span></div>`;

function pdfLink(h,report,fields){
 const pages=[...new Set(fields.flatMap(f=>h.evidence?.[f]?.pages||[]))].sort((a,b)=>a-b);
 if(!pages.length&&h.pdf_page)pages.push(h.pdf_page);
 return pages.length?`<a href="${esc(report.download_url.split('#')[0])}#page=${pages[0]}" target="_blank" rel="noopener">PDF page ${pages[0]} ↗</a>`:'<span class="report-empty">PDF page unverified</span>';
}
const reportHeading=(name,h,report,fields)=>`<h4 class="report-heading"><span>${name}</span><span class="report-reference">${esc(report.symbol)} · ${pdfLink(h,report,fields)}</span></h4>`;
const boaStatus=h=>!h?'No BOA entry':h.kind==='issuance'?'Newly issued':h.reviewed_status||h.status_raw||'Not reported';

function correction(h){
 if(!h.review_case_id)return '';
 let decision={};try{decision=JSON.parse(h.review_decision_json||'{}')}catch{}
 const corrected=h.reviewed_status&&h.reviewed_status!==h.status_raw;
 return `<aside class="review-note"><strong>Human review ${esc(h.review_case_id)}</strong> · ${corrected?`Displayed status corrected to “${esc(h.reviewed_status)}”; extracted BOA status is “${esc(h.status_raw)}”.`:`Reviewed source status: “${esc(h.status_raw||'not reported')}”.`}${decision.decision_date?` Decision dated ${esc(decision.decision_date)}.`:''}</aside>`;
}
function boa(h,report){
 if(!h)return '<div class="report-panel"><h4>BOA report</h4><p class="report-empty">No BOA entry in the available data for this audit period.</p></div>';
 const status=h.kind==='issuance'?'Newly issued · no BOA status after verification':boaStatus(h);
 return `<div class="report-panel">${reportHeading('BOA report',h,report,['status_raw','administration_response','board_assessment','recommendation_text'])}<p class="report-status"><strong>Status after verification</strong> <span>${esc(status)}</span></p>${correction(h)}${field('The Administration’s response',h.administration_response)}${field('The Board’s assessment',h.board_assessment)}</div>`;
}
function sg(h,report){
 if(!h)return '<div class="report-panel"><h4>SG report</h4><p class="report-empty">No SG entry in the available data for this audit period.</p></div>';
 const dates=[['Original target date','initial_target_raw'],['Reported target date','target_raw'],['Revised target date','revised_target_raw']].filter(([,key])=>h[key]);
 return `<div class="report-panel">${reportHeading('SG report',h,report,['entities_raw','status_raw','priority_raw','initial_target_raw','target_raw','revised_target_raw','sg_progress'])}${field('Department responsible',h.entities_raw)}<div class="sg-fields">${field('Status',h.status_raw)}${field('Priority',h.priority_raw)}</div>${dates.length?`<div class="sg-fields sg-dates${dates.length===1?' single':''}">${dates.map(([label,key])=>field(label,h[key])).join('')}</div>`:''}${h.sg_progress?field('Progress reported by the Secretary-General',h.sg_progress):''}</div>`;
}

export function renderRecommendationDetail({recommendation:rec,history},reports){
 const initial=history.find(h=>h.source_type==='BOA'&&h.kind==='issuance');
 const years=[...new Set(history.map(h=>reports[h.report_id]?.audit_year).filter(Number.isFinite))].sort((a,b)=>b-a);
 const navigator=`<nav class="year-nav" aria-label="Jump to audit period"><span>Jump to audit period</span><div class="year-nav-years">${years.map(y=>`<button type="button" data-jump-year="${y}">${esc(reports[history.find(h=>reports[h.report_id]?.audit_year===y).report_id].audit_period||y)}</button>`).join('')}</div><div class="year-nav-actions"><button type="button" data-history-action="expand">Expand all</button><button type="button" data-history-action="collapse">Collapse older years</button></div></nav>`;
 const periods=years.map((year,index)=>{
  const entries=history.filter(h=>reports[h.report_id]?.audit_year===year);
  const b=entries.filter(h=>h.source_type==='BOA'),s=entries.filter(h=>h.source_type==='SG');
  const label=reports[(b[0]||s[0]).report_id].audit_period||year;
  return `<details class="report-year" data-year="${year}"${index===0?' open':''}><summary><span class="year-title">Audit period ${esc(label)}</span><span class="year-status">BOA: ${esc(boaStatus(b.at(-1)))}</span></summary><div class="report-columns"><div>${b.length?b.map(h=>boa(h,reports[h.report_id])).join(''):boa(null,null)}</div><div>${s.length?s.map(h=>sg(h,reports[h.report_id])).join(''):sg(null,null)}</div></div></details>`;
 }).join('');
 return `<article class="history-card"><h2 class="recommendation-heading"><span>${esc(rec.symbol)} · para. ${esc(rec.paragraph)}</span>${initial?`<span class="recommendation-link">${pdfLink(initial,reports[initial.report_id],['recommendation_text'])}</span>`:''}</h2><p class="preview-intro">${esc(rec.text)}</p>${navigator}${periods}</article>`;
}

export function bindRecommendationDetail(container){
 container.addEventListener('click',event=>{
  const jump=event.target.closest('[data-jump-year]');
  if(jump&&container.contains(jump)){
   const period=[...container.querySelectorAll('.report-year')].find(el=>el.dataset.year===jump.dataset.jumpYear);
   if(period){period.open=true;period.querySelector('summary').focus();period.scrollIntoView({block:'start'});}
   return;
  }
  const action=event.target.closest('[data-history-action]');
  if(action&&container.contains(action)){
   container.querySelectorAll('.report-year').forEach((period,index)=>{period.open=action.dataset.historyAction==='expand'||index===0});
  }
 });
}
