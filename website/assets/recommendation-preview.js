import {renderRecommendationDetail,bindRecommendationDetail} from './recommendation-detail.js';
const preview=document.querySelector('#preview');
const id=new URLSearchParams(location.search).get('id')||'R_f893baf30707e83a8c';
const get=async path=>{const response=await fetch(path);if(!response.ok)throw Error(`${path}: ${response.status}`);return response.json()};
try{
 if(!/^R_[a-f0-9]+$/.test(id))throw Error('Invalid recommendation ID');
 const [detail,reports]=await Promise.all([get(`data/details/${id}.json`),get('data/reports.json')]);
 preview.innerHTML=`<div class="preview-card">${renderRecommendationDetail(detail,reports)}</div>`;
 bindRecommendationDetail(preview);
}catch(error){preview.textContent=`Could not load recommendation history: ${error.message}`;console.error(error)}
