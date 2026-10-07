const {test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
test('illustrated UI exists and real browser actions preserve inventory and saves',async()=>{
 const entry=path.resolve('app/src/main/assets/index.html');assert.ok(fs.existsSync(entry),'interactive UI missing');
 const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
 const browser=await chromium.launch({headless:true});
 try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file:///'+entry.replaceAll('\\','/'));
 await page.locator('[data-nav="camp"]').waitFor();
 for(const tab of ['recipes','helper','village','journal','camp']){await page.locator(`[data-nav="${tab}"]`).click();assert.equal(await page.locator('main').getAttribute('data-page'),tab);}
 await page.locator('[data-open-recipe="0"]').click();
 await page.locator('#equip-required').click();await page.locator('#craft-now').click();
 let state=await page.evaluate(()=>app.snapshot());assert.equal(state.inventory[2],1);assert.equal(state.inventory[9],1);
 await page.locator('[data-nav="camp"]').click();await page.locator('#eat').click();
 await page.locator('#settings').click();await page.locator('[data-save="1"]').click();
 await page.reload();assert.equal((await page.evaluate(()=>app.snapshot())).ate,true);
 for(const size of [{width:360,height:640},{width:390,height:844},{width:800,height:1280},{width:800,height:450}]){
 await page.setViewportSize(size);
 for(const tab of ['camp','recipes','helper','village','journal']){
 await page.locator(`[data-nav="${tab}"]`).click();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'horizontal overflow');
 const bounds=await page.locator('nav').boundingBox();assert.ok(bounds.y+bounds.height<=size.height+1,'nav clipped');
 fs.mkdirSync('build/ui-screenshots',{recursive:true});await page.screenshot({path:`build/ui-screenshots/${size.width}x${size.height}-${tab}.png`});
 }
 }
 assert.deepEqual(errors,[]);
 }finally{await browser.close()}
});
