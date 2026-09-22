import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {labels,rate,scope,movement,searchRows,terminal} from '../../website/assets/model.js';
const root=new URL('../../website/',import.meta.url),load=n=>JSON.parse(readFileSync(new URL(`data/${n}.json`,root),'utf8'));
const recommendations=load('recommendations'),snapshots=load('snapshots'),reports=load('reports');
const data={recommendations,snapshots,reports,byId:new Map(recommendations.map(r=>[r.id,r]))};
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
  const entities=['all',...new Set(scope(data,anchor,volume).map(s=>s.entity))];
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
 const e=all.find(s=>s.entity!=='Entity not extracted').entity;assert(scope(data,2024,'all',e).every(s=>s.entity===e));assert.equal(scope(data,2024,'all','nonexistent').length,0);
 const id=all[0].id;assert.equal(searchRows(data,all,id,'all')[0].id,id);assert(searchRows(data,all,'','implemented').every(s=>s.status==='implemented'));assert.equal(searchRows(data,all,'xxxxxxxx-no-match','all').length,0);
});
