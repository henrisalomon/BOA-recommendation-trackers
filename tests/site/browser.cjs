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
 assert.equal(await page.locator('[role=tab]').count(),3);
 assert.deepEqual(await page.locator('.scope label').evaluateAll(x=>x.map(e=>e.childNodes[0].textContent)),['Reporting year','Volume','Entity']);
 await page.locator('#tab-recommendations').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#tab-analysis').getAttribute('aria-selected'),'true');await audit('desktop analysis');await shot('analysis');
 await page.keyboard.press('End');assert.equal(await page.locator('#tab-trends').getAttribute('aria-selected'),'true');await shot('trends');await audit('desktop trends');
 await page.selectOption('#volume','II');await page.selectOption('#year','2020');await page.click('#tab-recommendations');assert(await page.locator('#list').innerText().then(s=>s.includes('Volume II')));
 await page.selectOption('#status','implemented');assert(await page.locator('.recommendation').count()>0);await page.fill('#search','not-a-real-reference-xyz');assert.equal(await page.locator('.recommendation').count(),0);assert(await page.locator('.empty').isVisible());await page.click('#reset');
 await page.fill('#search','R_454bc57cfe25e6fdfa');await page.locator('.recommendation summary').click();await page.waitForSelector('.recommendation[data-loaded=true]');
 const detail=await page.locator('.detail').innerText();assert(detail.includes('Original target date'));assert(detail.includes('Revised target date'));assert(detail.includes('BOA comments'));assert(detail.includes('Administration comments'));assert(detail.includes('PDF page'));assert(detail.includes('printed'));
 const years=await page.locator('.comment-year h4').allTextContents();assert.deepEqual(years,[...years].sort());
 const href=await page.locator('.detail a[href*="#page="]').first().getAttribute('href');const response=await page.request.get(new URL(href,base).href.split('#')[0]);assert.equal(response.status(),200);assert(response.headers()['content-type'].includes('pdf'));
 await audit('expanded evidence');await shot('details');
 await page.click('#reset');
 await page.fill('#search','R_f893baf30707e83a8c');await page.locator('.recommendation summary').click();await page.waitForSelector('.recommendation[data-loaded=true]');assert(await page.locator('.comment-year').count()>=8);assert(!(await page.locator('.detail dl dd').nth(0).innerText()).includes('Not extracted / unverified'));assert(!(await page.locator('.detail dl dd').nth(1).innerText()).includes('Not extracted / unverified'));
 await page.screenshot({path:'tmp/site/history-viewport.png'});await page.click('#reset');
 for(const width of [390,320,768]){
  await page.setViewportSize({width,height:844});await page.click('#tab-recommendations');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width}`);await audit(`mobile ${width}`);await shot(`mobile-${width}`);
  for(const tab of ['analysis','trends']){await page.click('#tab-'+tab);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width} ${tab}`);if(width===390)await shot(`mobile-${tab}`)}
 }
 await page.setViewportSize({width:1280,height:900});await page.click('#tab-recommendations');await page.evaluate(()=>document.documentElement.style.fontSize='200%');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'200% text overflow');await shot('text-200');
 await page.evaluate(()=>document.documentElement.style.fontSize='');
 await page.setViewportSize({width:390,height:844});await page.fill('#search','R_f893baf30707e83a8c');await page.locator('.recommendation summary').click();await page.waitForSelector('.recommendation[data-loaded=true]');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile evidence overflow');await audit('mobile expanded evidence');await page.click('#reset');
 await page.click('a[href="#data-quality"]');assert(await page.locator('#data-quality').getAttribute('open')!==null);
 assert.equal(errors.length,0,errors.join('\n'));
 fs.writeFileSync('tmp/site/browser-results.json',JSON.stringify({results,consoleErrors:errors,pdfLink:href,viewports:[1440,768,390,320],textZoom:'200%',passed:true},null,2));
 console.log('Browser checks passed:',results.length,'accessibility audits; filters, keyboard tabs, evidence, PDF response, mobile overflow, 200% text, zero JS errors.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
