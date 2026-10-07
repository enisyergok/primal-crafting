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
 assert.match(ui,/materials-0\$\{sheet\}/);
 assert.match(css,/\.item\[draggable="true"\]\{[^}]*touch-action:none/);
 assert.match(css,/\.item-art svg/);
 assert.match(css,/\.raster-art/);
});
