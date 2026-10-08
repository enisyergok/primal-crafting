const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const P=require('../app/src/main/assets/game.js');
const {Player}=require('./campaign-player.cjs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const entry='file:///'+path.resolve('app/src/main/assets/index.html').replaceAll('\\','/');
async function withPage(run){
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(entry);await run(page);
  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
}
test('learned recipe UI: filters intersect, selection stays correct, hidden formulas stay hidden',()=>withPage(async page=>{
 await page.locator('[data-nav="recipes"]').click();
 assert.equal(await page.locator('#recipe-results article').count(),3);
 assert.equal(await page.locator('[data-open-recipe="5"]').count(),0);
 assert.equal(await page.locator('#content').innerText().then(t=>t.includes('Taş balta')),false);
 await page.locator('[data-open-recipe="2"]').click();
 assert.equal(await page.locator('main>section h2').first().textContent(),'İp');
 await page.locator('[data-recipe-filter="Araç"]').click();
 await page.locator('#recipe-search').fill('taş');
 assert.equal(await page.locator('#recipe-results article').count(),1);
 assert.match(await page.locator('#recipe-results article').innerText(),/Keskin taş/);
 // Search never changes the craft button's selected recipe.
 await page.locator('#craft-now').click();
 let s=await page.evaluate(()=>app.snapshot());assert.equal(s.inventory[6],1);assert.equal(s.inventory[5],0);
 await page.locator('[data-nav="camp"]').click();
 const before=await page.evaluate(()=>JSON.stringify(app.snapshot()));
 await page.locator('#craft-now').click();
 assert.equal(await page.evaluate(()=>JSON.stringify(app.snapshot())),before,'empty camp selection must not auto-craft a previous recipe');
 await page.locator('[data-filter="Yiyecek"]').click();
 const visible=await page.locator('.item-wrap:not([hidden]) [data-item]').evaluateAll(els=>els.map(e=>+e.dataset.item));
 assert.deepEqual(visible,[2],'raw coconut is food, not a material');
}));
test('touch tap, horizontal shelf and material removal work without dragging',()=>withPage(async page=>{
 await page.locator('[data-item="0"]').tap();await page.locator('[data-item="0"]').tap();
 assert.equal(await page.locator('[data-remove-material]').count(),2);
 await page.locator('[data-remove-material="1"]').tap();assert.equal(await page.locator('[data-remove-material]').count(),1);
 await page.locator('[data-clear-material]').tap();
 await page.locator('[data-item="0"]').tap();await page.locator('[data-item="0"]').tap();
 await page.locator('#craft-now').tap();
 assert.equal((await page.evaluate(()=>app.snapshot())).inventory[5],1);
 await page.locator('[data-inspect="5"]').tap();await page.locator('[data-equip-item="5"]').tap();
 assert.equal((await page.evaluate(()=>app.snapshot())).tool,5);
 await page.locator('[data-close-detail]').tap();
 const shelf=page.locator('.inventory');
 const dimensions=await shelf.evaluate(el=>({client:el.clientWidth,scroll:el.scrollWidth}));
 assert.ok(dimensions.scroll>dimensions.client);
 await shelf.evaluate(el=>el.scrollLeft=el.scrollWidth);
 assert.ok(await shelf.evaluate(el=>el.scrollLeft)>0);
}));
test('late inventory artwork and detail actions render without schematic fallback',()=>withPage(async page=>{
 const fixture=new Player().campaign().state;
 fixture.inventory=P.items.map(()=>2);fixture.discovered=P.recipes.map(()=>true);
 await page.evaluate(s=>localStorage.setItem('primal-auto',JSON.stringify(s)),fixture);await page.reload();
 assert.equal(await page.locator('.inventory .item-wrap').count(),343);
 assert.equal(await page.locator('.inventory .item svg').count(),0);
 for(const [id,expected]of [[113,'advanced-tools-02.png'],[117,'advanced-tools-02.png'],[285,'late-items-07.png'],[302,'late-items-08.png']]){
  const style=await page.locator('[data-item="'+id+'"] .item-art').getAttribute('style');
  assert.ok(style.includes(expected),P.items[id]);
 }
 await page.locator('#inventory-search').fill('Şifalı lapa');
 await page.locator('[data-inspect="152"]').click();
 await page.locator('[data-use-item="152"]').click();
 assert.equal((await page.evaluate(()=>app.snapshot())).inventory[152],1);
 await page.locator('[data-close-detail]').click();
 await page.locator('#clear-inventory-search').click();await page.locator('#inventory-search').fill('Örgü çanta');
 await page.locator('[data-inspect="19"]').click();await page.locator('[data-wear-item="19"]').click();
 assert.equal((await page.evaluate(()=>app.snapshot())).equipment.bag,19);
 await page.locator('[data-nav="village"]').click();
 for(const name of ['home','farm','fire','workshop','depot']){
  await page.locator('[data-building="'+name+'"]').click();
  assert.equal(await page.locator('[data-upgrade="'+name+'"]').count(),1);
 }
 await page.locator('[data-nav="recipes"]').click();
 await page.locator('[data-recipe-filter="Tıp"]').click();await page.locator('#recipe-search').fill('lapa');
 const names=await page.locator('#recipe-results article h3').allTextContents();assert.ok(names.length>=1);const cards=await page.locator('#recipe-results article').allTextContents();assert.ok(cards.every(n=>n.toLocaleLowerCase('tr-TR').includes('lapa')));
 fs.mkdirSync('build/ui-screenshots',{recursive:true});await page.screenshot({path:'build/ui-screenshots/late-recipes.png'});
}));
test('corrupt autosave is backed up intact before a new run can overwrite it',()=>withPage(async page=>{
 const bad='{"version":4,"inventory":[-1]}';
 await page.evaluate(raw=>localStorage.setItem('primal-auto',raw),bad);await page.reload();
 const values=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('primal-recovery-')).map(k=>localStorage.getItem(k)));
 assert.ok(values.includes(bad));
 await page.locator('[data-gather-resource="0"]').click();
 const data=await page.evaluate(()=>JSON.parse(localStorage.getItem('primal-auto')));assert.equal(data.version,4);
 const backups=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('primal-recovery-')).map(k=>localStorage.getItem(k)));
 assert.ok(backups.includes(bad));
}));
test('all 343 item IDs have real bitmap art, atlas files exist, audited cells are stable',()=>{
 const ui=fs.readFileSync('app/src/main/assets/ui.js','utf8'),vm=require('node:vm');
 const evaluate=name=>vm.runInNewContext('('+ui.match(new RegExp('const '+name+'=(\\{[\\s\\S]*?\\n\\});'))[1]+')');
 const raster=evaluate('rasterIcons'),generated=evaluate('generatedIcons');
 for(let id=0;id<343;id++){
  assert.ok(id<20||raster[id]||generated[id],'missing art: '+id);
  if(generated[id]){const[file,x,y]=generated[id];assert.ok(fs.existsSync('app/src/main/assets/art/'+file));assert.ok(x>=0&&x<4&&y>=0&&y<4);}
 }
 const expected={114:['advanced-tools-02.png',3,2],117:['advanced-tools-02.png',2,3],148:['advanced-late.png',0,0],271:['late-items-06.png',2,0],285:['late-items-07.png',0,0],302:['late-items-08.png',2,0],313:['late-items-10.png',3,2]};
 for(const[id,cell]of Object.entries(expected))assert.equal(JSON.stringify(generated[id]),JSON.stringify(cell),'audited art '+id);
});
