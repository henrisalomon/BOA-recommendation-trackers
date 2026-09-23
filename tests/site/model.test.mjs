import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {labels,rate,scope,movement,trendMovement,searchRows,terminal,entityKeys,periodLabel,waterfallSteps} from '../../website/assets/model.js';
const root=new URL('../../website/',import.meta.url),load=n=>JSON.parse(readFileSync(new URL(`data/${n}.json`,root),'utf8'));
const recommendations=load('recommendations'),snapshots=load('snapshots'),reports=load('reports');
const data={recommendations,snapshots,reports,byId:new Map(recommendations.map(r=>[r.id,r]))};
test('PKO display and individual entity filters preserve distinct joint recommendations',()=>{
 assert.equal(periodLabel(2020,'II'),'2019-20');assert.equal(periodLabel(2023,'II'),'2022-23');
 const fixture={byId:new Map([['a',{id:'a',volume:'II'}]]),snapshots:{2020:[],2021:[{id:'a',entities:['DMSPC'],offices:[{entity:'DMSPC',office:'BTAD'},{entity:'DMSPC',office:'OPPFB'}],responsibility:'Joint',status:'under_implementation'}]}};
 assert.deepEqual(entityKeys(fixture.snapshots[2021][0]),['DMSPC']);assert.equal(scope(fixture,2021,'all','DMSPC',2021,'Joint').length,1);assert.equal(scope(fixture,2021,'all','DMSPC/BTAD',2021,'Joint').length,0);
 assert.equal(scope(fixture,2021,'all','all',2021,'Individual').length,0);
 assert.equal(movement(fixture,2021,'II','DMSPC',2021,'Joint').issued,1);
 for(const year of load('metadata').years){
  const all=scope(data,year);assert.equal(['Joint','Individual','Unknown'].reduce((n,k)=>n+scope(data,year,'all','all',year,k).length,0),all.length);
  for(const kind of ['Joint','Individual','Unknown'])for(const volume of ['all','I','II']){
   let previous;
   for(const y of load('metadata').years.filter(y=>y<=year)){
    const m=movement(data,y,volume,'all',year,kind);
    assert.equal(m.opening+m.issued+m.reopened-m.implemented-m.other,m.closing);
    if(previous)assert.equal(previous.closing,m.opening);previous=m;
   }
  }
 }
});
test('Stable IDs, snapshots, evidence references and source checksums',()=>{
 assert.equal(data.byId.size,recommendations.length);
 const historyIds=new Set();let comments=0,unverified=0;
 for(const r of recommendations){assert.match(r.id,/^R_[a-f0-9]+$/);assert.ok(reports[r.reportId]);const detail=load('details/'+r.id);assert.equal(detail.recommendation.id,r.id);for(const h of detail.history){assert(!historyIds.has(h.history_id));historyIds.add(h.history_id);assert.equal(h.recommendation_id,r.id);assert.ok(reports[h.report_id]);for(const [field,e] of Object.entries(h.evidence)){assert(h[field]);if(['board_assessment','administration_response','sg_progress'].includes(field)){comments++;if(!e.verified)unverified++}for(const p of e.pages){assert(Number.isInteger(p)&&p>0&&p<=reports[h.report_id].page_count)}if(e.verified){assert(e.pages.length);assert.equal(e.matchedFragments,e.totalFragments)}}}}
 for(const [year,rows] of Object.entries(snapshots)){assert.equal(new Set(rows.map(s=>s.id)).size,rows.length);for(const s of rows){assert(data.byId.has(s.id));assert(data.byId.get(s.id).year<=+year);assert(labels[s.status]);assert(!s.observationYear||s.observationYear<=+year)}}
 const meta=load('metadata');assert.equal(comments,meta.counts.comments);assert.equal(unverified,meta.counts.unverifiedComments);assert.equal(historyIds.size,meta.counts.observations);
 for(const r of Object.values(reports)){assert.equal(createHash('sha256').update(readFileSync(new URL(r.local_path,root))).digest('hex'),r.sha256)}
});
test('Waterfall balances for every year, volume and observed entity; trends reconcile across years',()=>{
 for(const anchor of load('metadata').years)for(const volume of ['all','I','II']){
  const entities=['all',...new Set(scope(data,anchor,volume).flatMap(entityKeys))];
  for(const entity of entities){let last;for(const year of load('metadata').years.filter(y=>y<=anchor)){
   const m=movement(data,year,volume,entity,anchor);assert.equal(m.opening+m.issued+m.reopened-m.implemented-m.other,m.closing,JSON.stringify({year,volume,entity,anchor,m}));
   if(last)assert.equal(last.closing,m.opening);last=m;
   const rows=scope(data,year,volume,entity,anchor);assert.equal(m.closing,rows.filter(s=>!terminal(s.status)).length);
   assert(m.value===null||(m.value>=0&&m.value<=100));assert(m.implementedRate<=m.denominator);
  }}
 }
});
test('Rates exclude unresolved records and keep other closures out of numerator; empty denominator is null',()=>{
 const r=rate([{assessment:'implemented'},{assessment:'under_implementation'},{assessment:'overtaken_by_events'},{assessment:'closed_other'},{assessment:null,hasAssessment:true},{assessment:null}]);assert.equal(r.implemented,1);assert.equal(r.denominator,4);assert.equal(r.value,25);assert.equal(r.excluded,1);assert.equal(rate([]).value,null);
});
test('A continuing implemented assessment is not a new implemented transition',()=>{
 const fixture={byId:new Map([['a',{id:'a',volume:'I'}]]),snapshots:{2020:[{id:'a',status:'implemented',entity:'E'}],2021:[{id:'a',status:'implemented',entity:'E',assessment:'implemented'}]}};
 const m=movement(fixture,2021);assert.equal(m.implemented,0);assert.equal(m.implementedRate,1);assert.equal(m.value,100);
});
test('Filtering is exact for volume and entities; search includes stable IDs and symbols',()=>{
 const all=scope(data,2024);assert.equal(scope(data,2024,'I').length+scope(data,2024,'II').length,all.length);
 const e=all.flatMap(entityKeys).find(e=>e!=='Unmapped / not reported');assert(scope(data,2024,'all',e).every(s=>entityKeys(s).includes(e)));assert(scope(data,2024,'all',e).length>0);assert.equal(scope(data,2024,'all','nonexistent').length,0);
 const id=all[0].id;assert.equal(searchRows(data,all,id,'all')[0].id,id);assert(searchRows(data,all,'','implemented').every(s=>s.status==='implemented'));assert.equal(searchRows(data,all,'xxxxxxxx-no-match','all').length,0);
});

test('Waterfall hides a zero reopening step without changing balances or connectors',()=>{
 const zero={opening:100,issued:20,reopened:0,implemented:30,other:5,closing:85};
 const steps=waterfallSteps(zero);assert.equal(steps.length,5);assert(!steps.some(s=>s.label==='Reopened / review'));assert.equal(steps.at(-2).end,85);
 const reopened=waterfallSteps({...zero,reopened:4,closing:89});assert.equal(reopened.length,6);assert.equal(reopened[2].value,'+4');assert.equal(reopened.at(-2).end,89);
});

test('Main status follows BOA assessments; only unassessed issuance-year records are newly issued',()=>{
 for(const r of recommendations){
  const h=load('details/'+r.id).history;
  for(const [year,rows] of Object.entries(snapshots)){
   const s=rows.find(x=>x.id===r.id);if(!s)continue;
   const boa=h.filter(x=>x.source_type==='BOA'&&x.kind==='annex'&&reports[x.report_id].audit_year<=+year).at(-1);
   const expected=r.identityReview||boa?.review_status==='needs_review'?'needs_review':boa?(boa.reviewed_status_group||boa.status_group||'unassessed'):r.year===+year?'newly_issued':'unassessed';
   assert.equal(s.status,expected,`${r.id} / ${year}`);
   assert.equal(s.historyId,boa?.history_id??null);
   if(s.status==='newly_issued'){assert.equal(s.assessment,null);assert.equal(s.hasAssessment,false);assert.equal(terminal(s.status),false)}
  }
 }
 const example=snapshots['2024'].find(s=>s.id==='R_1d330d1cf2fdb7a898');
 assert.equal(example.status,'newly_issued');assert.equal(rate([example]).denominator,0);
});

test('Trends combine implementation and Board closures without recounting continuing terminal states',()=>{
 const fixture={byId:new Map(['a','b','c','d','e','f'].map(id=>[id,{id,volume:'I'}])),snapshots:{
  2023:[{id:'a',status:'under_implementation'},{id:'b',status:'under_implementation'},{id:'c',status:'not_implemented'},{id:'d',status:'overtaken_by_events'},{id:'e',status:'needs_review'}],
  2024:[{id:'a',status:'implemented',assessment:'implemented'},{id:'b',status:'overtaken_by_events',assessment:'overtaken_by_events'},{id:'c',status:'closed_other',assessment:'closed_other'},{id:'d',status:'implemented',assessment:'implemented'},{id:'e',status:'needs_review',assessment:null,hasAssessment:true},{id:'f',status:'newly_issued',assessment:null}]
 }};
 const m=movement(fixture,2024,'I');
 assert.equal(m.implementedClosed,3);assert.equal(m.implementedClosedRate,4);assert.equal(m.implementedClosedValue,100);assert.equal(m.excluded,1);
 assert.equal(m.opening+m.issued+m.reopened-m.implementedClosed,m.closing);
 assert.equal(movement(fixture,2024,'II').implementedClosedValue,null);
 const volumeI=movement(data,2024,'I'),volumeII=movement(data,2024,'II');
 assert.equal(volumeI.implementedClosed,101);assert.equal(volumeI.implementedClosedRate,101);assert.equal(volumeI.denominator,187);
 assert.equal(volumeII.implementedClosed,15);assert.equal(volumeII.implementedClosedRate,15);assert.equal(volumeII.denominator,53);
});

test('All dashboard views exclude SHP records; HUM-06 remains implemented',()=>{
 const a=trendMovement(data,2018,'I'),b=trendMovement(data,2020,'I');
 assert.equal(a.implementedClosed,14);assert.equal(a.implementedClosedRate,14);assert.equal(a.denominator,167);
 assert.equal(b.implementedClosed,127);assert.equal(b.denominator,279);
 assert.equal(movement(data,2018,'I').implementedClosed,14);
 assert.equal(scope(data,2018,'I').filter(s=>s.assessmentStream==='Strategic heritage plan').length,0);
 const excluded=JSON.parse(readFileSync(new URL('../../data/study_scope_exclusions.json',import.meta.url)));
 assert.equal(excluded.length,31);
 for(const r of excluded){assert(!data.byId.has(r.recommendation_id));assert(!readdirSync(new URL('data/details/',root)).includes(r.recommendation_id+'.json'));}
 for(const [year,issued] of [[2016,53],[2018,71],[2020,126],[2022,80]])assert.equal(movement(data,year,'I').issued,issued);
 for(let year=2015;year<=2025;year++)assert.equal(data.snapshots[year].find(s=>s.id==='R_090f16c406e66a69f9').status,'implemented');
 assert.equal(trendMovement(data,2015,'II').implementedClosed,48);assert.equal(trendMovement(data,2015,'II').denominator,80);
 assert.equal(trendMovement(data,2024,'II').opening,54);
 assert.equal(data.snapshots[2024].find(s=>s.id==='R_d864098f1c73905723').status,'under_implementation');
});

test('Approved HUM-02 reconciles 2015–16 assessments without inventing a later closure',()=>{const m=movement(data,2016,'II');assert.equal(m.implementedRate,39);assert.equal(m.implementedClosedRate,46);assert.equal(m.denominator,63);assert.equal(movement(data,2017,'II').opening,72);assert.equal(movement(data,2024,'II').opening,54);});
