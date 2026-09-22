// Local UI regression checks. Uses an isolated Chrome profile; never touches user tabs.
const {chromium}=require('../../website/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const axePath=require.resolve('../../website/node_modules/axe-core/axe.min.js');
(async()=>{
 const browser=await chromium.launch(process.env.CI?{headless:true}:{headless:true,channel:'chrome'});
 const page=await browser.newPage({viewport:{width:1440,height:1050}}),errors=[],results=[];
 page.on('pageerror',e=>errors.push(e.message));
 const base=process.env.SITE_URL||'http://127.0.0.1:4173/';
 const shot=async name=>{await page.screenshot({path:`tmp/site/${name}.png`,fullPage:true});if(name.startsWith('mobile-'))await page.screenshot({path:`tmp/site/${name}-viewport.png`})};
 const audit=async name=>{await page.addScriptTag({path:axePath});const result=await page.evaluate(async()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));results.push({name,violations:result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});assert.equal(result.violations.length,0,JSON.stringify(results.at(-1)))};
 await page.goto(base);await page.waitForSelector('.recommendation');await page.evaluate(()=>document.fonts.ready);await audit('desktop recommendations');await shot('desktop');
 assert.equal(await page.locator('[role=tab]').count(),3);assert.equal(await page.locator('#provenance').count(),0);assert.equal(await page.locator('#data-quality').count(),0);const entityOptions=await page.locator('#entity option').allTextContents();assert(entityOptions.includes('DMSPC'));assert(!entityOptions.some(x=>x.includes(' and ')||x.includes(';')||x.includes('DMSPC/')));await page.selectOption('#entity','DMSPC');assert(await page.locator('.recommendation').count()>0);await page.click('#reset');
 assert.deepEqual(await page.locator('.scope label').evaluateAll(x=>x.map(e=>e.childNodes[0].textContent)),['Reporting year','Volume','Entity','Responsibility']);
 await page.locator('#tab-recommendations').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#tab-analysis').getAttribute('aria-selected'),'true');assert(!(await page.locator('#waterfall svg').textContent()).includes('Reopened / review'));await audit('desktop analysis');await shot('analysis');
 await page.keyboard.press('End');assert.equal(await page.locator('#tab-trends').getAttribute('aria-selected'),'true');assert.equal(await page.locator('.bar-value').count(),0);await page.check('#show-values');assert.equal(await page.locator('.bar-value').count(),30);await shot('trends');await audit('desktop trends');await page.uncheck('#show-values');assert.equal(await page.locator('.bar-value').count(),0);
 await page.selectOption('#volume','II');await page.selectOption('#year','2020');await page.click('#tab-recommendations');assert(await page.locator('#list').innerText().then(s=>s.includes('Volume II')));
 assert.equal(await page.locator('#year option:checked').textContent(),'2019-20');
 await page.selectOption('#responsibility','Joint');
 assert(await page.locator('.recommendation').count()>0);
 assert((await page.locator('.recommendation .meta').allTextContents()).every(t=>t.includes('Joint')));
 assert(new URLSearchParams(new URL(page.url()).hash.slice(1)).get('responsibility')==='Joint');
 await page.reload();await page.waitForSelector('.recommendation');assert.equal(await page.locator('#responsibility').inputValue(),'Joint');
 await page.selectOption('#responsibility','all');
 await page.selectOption('#status','implemented');assert(await page.locator('.recommendation').count()>0);await page.fill('#search','not-a-real-reference-xyz');assert.equal(await page.locator('.recommendation').count(),0);assert(await page.locator('.empty').isVisible());await page.click('#reset');
 await page.fill('#search','R_454bc57cfe25e6fdfa');await page.locator('.recommendation summary').click();await page.waitForSelector('.recommendation[data-loaded=true]');
 const detail=await page.locator('.detail').innerText();assert(detail.includes('Original target date'));assert(detail.includes('Revised target date'));assert(detail.includes('BOA comments'));assert(detail.includes('Administration comments'));assert(detail.includes('PDF page'));assert(detail.includes('printed'));assert(!detail.includes('Stable ID:'));assert(!detail.includes('wording basis'));assert(!detail.includes('cohort 2015'));assert(!detail.includes('Locator matched against source PDF'));
 const years=await page.locator('.comment-year h4').allTextContents();assert.deepEqual(years,[...years].sort());
 const href=await page.locator('.detail a[href*="#page="]').first().getAttribute('href');const links=await page.locator('.detail a[href*="#page="]').evaluateAll(nodes=>nodes.map(a=>({href:a.href,text:a.textContent})));for(const link of links){const url=new URL(link.href);assert.equal(url.origin,"https://documents.un.org");assert.equal(url.searchParams.get("t"),"pdf");assert.equal(url.hash,"#page="+link.text.match(/PDF page (\d+)/)[1]);}
 await audit('expanded evidence');await shot('details');
 await page.click('#reset');
 await page.fill('#search','R_f893baf30707e83a8c');await page.locator('.recommendation summary').click();await page.waitForSelector('.recommendation[data-loaded=true]');assert(await page.locator('.comment-year').count()>=8);assert(!(await page.locator('.detail dl dd').nth(0).innerText()).includes('Not extracted'));assert(!(await page.locator('.detail dl dd').nth(1).innerText()).includes('Not extracted'));
 await page.screenshot({path:'tmp/site/history-viewport.png'});await page.click('#reset');
 for(const width of [390,320,768]){
  await page.setViewportSize({width,height:844});await page.click('#tab-recommendations');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width}`);await audit(`mobile ${width}`);await shot(`mobile-${width}`);
  for(const tab of ['analysis','trends']){await page.click('#tab-'+tab);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width} ${tab}`);if(width===390)await shot(`mobile-${tab}`)}
 }
 await page.setViewportSize({width:1280,height:900});await page.click('#tab-recommendations');await page.evaluate(()=>document.documentElement.style.fontSize='200%');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'200% text overflow');await shot('text-200');
 await page.evaluate(()=>document.documentElement.style.fontSize='');
 await page.setViewportSize({width:390,height:844});await page.fill('#search','R_f893baf30707e83a8c');await page.locator('.recommendation summary').click();await page.waitForSelector('.recommendation[data-loaded=true]');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile evidence overflow');await audit('mobile expanded evidence');await page.click('#reset');
 await page.click('a[href="methodology.html"]');await page.waitForSelector('#gaps li');assert(await page.locator('h1').innerText().then(s=>s.includes('Data gaps')));await audit('methodology');await page.click('a[href="index.html"]');await page.waitForSelector('.recommendation');
 assert.equal(errors.length,0,errors.join('\n'));
 fs.writeFileSync('tmp/site/browser-results.json',JSON.stringify({results,consoleErrors:errors,pdfLink:href,viewports:[1440,768,390,320],textZoom:'200%',passed:true},null,2));
 console.log('Browser checks passed:',results.length,'accessibility audits; filters, keyboard tabs, evidence, UN PDF page links, mobile overflow, 200% text, zero JS errors.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
