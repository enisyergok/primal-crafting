const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const ui=fs.readFileSync('app/src/main/assets/ui.js','utf8');
const css=fs.readFileSync('app/src/main/assets/style.css','utf8');

test('Android material drag has a pointer-event fallback',()=>{
 assert.match(ui,/onpointerdown/);
 assert.match(ui,/onpointermove/);
 assert.match(ui,/onpointerup/);
 assert.match(ui,/elementFromPoint\(x,y\)/);
 assert.match(ui,/closest\('\.dropzone'\)/);
 assert.match(ui,/page==='camp'&&isIngredient/);
 assert.match(ui,/data-gather-resource/);
 assert.match(ui,/recipe-search/);
 assert.match(ui,/function itemArt\(id\)/);
 assert.match(ui,/P\.itemData/);
 assert.match(ui,/const rasterIcons/);
 assert.match(ui,/const group=sheet<4\?'materials':'foods'/);
 assert.match(ui,/function settingsPage\(\)/);
 assert.match(ui,/page='settings'/);
assert.match(ui,/pref-sound/);
assert.match(ui,/pref-volume/);
assert.match(ui,/pref-vibrate/);
assert.match(ui,/pref-motion/);
assert.match(ui,/portrait-moods\.png/);
assert.match(ui,/equip\('Boyun','neck'/);
 assert.match(css,/\.item\[draggable="true"\][^}]*touch-action:pan-x/);
 assert.match(css,/overflow-x:auto/);
 assert.match(ui,/swipe-hint/);
 assert.match(ui,/axis/);
 assert.match(css,/\.item-art svg/);
 assert.match(css,/\.raster-art/);
});
