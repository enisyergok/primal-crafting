const {test}=require('node:test');
const assert=require('node:assert/strict');

test('PRIMAL registry contains the full depth target',()=>{
  const C=require('../app/src/main/assets/content.js');
  assert.equal(C.items.length,343);
  assert.equal(C.recipes.length,237);
  assert.equal(C.quests.length,87);
  assert.equal(C.skills.length,15);
  assert.equal(C.items.some(item=>/^(İnce|Sağlam|Oyma|Kurutulmuş|Parlak|Örgü|Keskin|Sıcak|Soğuk|Közlenmiş|Büyük|Usta) (malzeme|yiyecek|araç|giysi|yapı|tıp|süs|bilgi) \d+$/i.test(item.name)),false,'generated items must have real names');
});

test('every recipe has valid references and a distinct output',()=>{
  const C=require('../app/src/main/assets/content.js');
  const itemIds=new Set(C.items.map(x=>x.id));
  const outputs=new Set();
  for(const recipe of C.recipes){
    assert.equal(recipe.id,C.recipes.indexOf(recipe));
    assert.ok(recipe.name);
    assert.ok(itemIds.has(recipe.output),`missing output for ${recipe.id}`);
    assert.ok(!outputs.has(recipe.output),`duplicate output for ${recipe.id}`);
    outputs.add(recipe.output);
    assert.ok(recipe.input&&Object.keys(recipe.input).length>0);
    for(const [id,amount] of Object.entries(recipe.input)){
      assert.ok(itemIds.has(Number(id)),`missing input ${id} for ${recipe.id}`);
      assert.ok(Number.isInteger(amount)&&amount>0);
      assert.notEqual(Number(id),recipe.output,'recipe cannot consume its own output');
    }
    assert.ok(recipe.tool===-1||itemIds.has(recipe.tool),`missing tool for ${recipe.id}`);
    assert.ok(Number.isInteger(recipe.skill)&&recipe.skill>=0&&recipe.skill<15);
  }
});

test('recipe graph reaches every crafted output from gathered roots',()=>{
  const C=require('../app/src/main/assets/content.js');
  const produced=new Set(C.items.filter(x=>x.gatherable).map(x=>x.id));
  let changed=true;
  while(changed){
    changed=false;
    for(const r of C.recipes){
      if(!produced.has(r.output)&&Object.keys(r.input).every(id=>produced.has(Number(id)))){
        produced.add(r.output);if(r.extra!==undefined)produced.add(r.extra);changed=true;
      }
    }
  }
  const missing=C.recipes.filter(r=>!produced.has(r.output));
  assert.deepEqual(missing,[],'unreachable recipe outputs: '+missing.map(x=>x.id).join(','));
});
