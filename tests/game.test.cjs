const {test}=require('node:test');
const assert=require('node:assert/strict');
let G;try{G=require('../app/src/main/assets/game.js')}catch{}
test('craft consumes coconut but retains the equipped stone and saves discovery',()=>{
 assert.ok(G,'game model is required'); const s=G.newGame(1000);s.tool=0;
 assert.equal(G.reduce(s,{type:'craft',recipe:0},1000).ok,true);
 assert.equal(s.inventory[2],1);assert.equal(s.inventory[0],3);assert.equal(s.inventory[9],1);
 assert.equal(G.validate(JSON.parse(JSON.stringify(s))).discovered[0],true);
});
test('game model uses the full registry and can craft a deep recipe atomically',()=>{
 assert.ok(G);assert.equal(G.items.length,343);assert.equal(G.recipes.length,254);
 const s=G.newGame(1000);const r=G.recipes[12];s.tool=r.tool;s.skill=100;s.inventory[r.tool]=1;for(const [id,n] of Object.entries(r.input))s.inventory[id]=n;
 assert.equal(G.reduce(s,{type:'craft',recipe:12},1000).ok,true);
 assert.equal(s.inventory[r.output],1);assert.equal(s.discovered[12],true);
});
test('every registry recipe executes through the real reducer when supplied valid inputs',()=>{
 assert.ok(G);
 for(const recipe of G.recipes){
  const s=G.newGame(1);s.chapter=4;s.region=0;s.lens=true;s.skill=100;s.rng=0;
  s.tool=recipe.tool;if(recipe.tool>=0)s.inventory[recipe.tool]=Math.max(1,s.inventory[recipe.tool]);
  for(const [id,amount] of Object.entries(recipe.input))s.inventory[id]+=amount;
  const result=G.reduce(s,{type:'craft',recipe:recipe.id},1);
  assert.equal(result.ok,true,`recipe ${recipe.id} failed: ${result.message}`);
  assert.equal(s.inventory[recipe.output]>=1,true,`recipe ${recipe.id} produced no output`);
 }
});
test('wrong tool and missing ingredients reject atomically',()=>{
 assert.ok(G);const s=G.newGame(1);const before=JSON.stringify(s);
 assert.equal(G.reduce(s,{type:'craft',recipe:0},1).ok,false);assert.equal(JSON.stringify(s),before);
 s.tool=0;s.inventory[2]=0;const empty=JSON.stringify(s);
 assert.equal(G.reduce(s,{type:'craft',recipe:0},1).ok,false);assert.equal(JSON.stringify(s),empty);
});
test('failed difficult craft gains skill without creating output',()=>{
 assert.ok(G);const s=G.newGame(1);s.inventory[5]=1;s.inventory[6]=1;s.rng=1;
 const before=s.skill; const result=G.reduce(s,{type:'craft',recipe:5},1);
 assert.equal(result.ok,true);assert.equal(s.inventory[11],0);assert.ok(s.skill>before);
 assert.equal(s.energy,95);
});
test('helper completes once after reload, not before deadline',()=>{
 assert.ok(G);let s=G.newGame(1000);G.reduce(s,{type:'send',resource:0,minutes:1},1000);
 const start=s.inventory[0];assert.ok(s.helper.job);const deadline=s.helper.job.until;
 assert.equal(G.reduce(s,{type:'collect'},deadline-1).ok,false);
 s=G.validate(JSON.parse(JSON.stringify(s)));
 assert.equal(G.reduce(s,{type:'collect'},deadline).ok,true);assert.equal(s.inventory[0],start+4);
 assert.equal(G.reduce(s,{type:'collect'},deadline).ok,false);assert.equal(s.inventory[0],start+4);
});
test('depot upgrades charge materials and increase capacity once',()=>{
 assert.ok(G);const s=G.newGame(1);assert.equal(G.reduce(s,{type:'upgrade',building:'depot'},1).ok,false);
 s.inventory[17]=30;s.inventory[6]=3;s.inventory[0]=3;
 assert.equal(G.reduce(s,{type:'upgrade',building:'depot'},1).ok,true);
 assert.equal(s.buildings.depot,2);assert.equal(G.capacity(s),32);assert.equal(s.inventory[17],10);assert.equal(s.inventory[6],1);
});
test('discovery matches unordered ingredients and wrong combination changes nothing',()=>{
 assert.ok(G);const s=G.newGame(1);s.tool=0;
 assert.equal(G.findRecipe([2],s.tool),0);assert.equal(G.findRecipe([1,5,6,1],-1),5);
 assert.equal(G.findRecipe([2,3],-1),-1);
});
test('corrupt state is rejected, no silent reset',()=>{
 assert.ok(G);assert.throws(()=>G.validate({}));const s=G.newGame(1);s.inventory[0]=-1;assert.throws(()=>G.validate(s));
});
test('legacy save retains story, items and decisions',()=>{
 assert.ok(G);const s=G.migrate({chapter:2,inventory:[9,8,7],health:61,food:42,water:39,energy:55,trust:2,route:3,day:8,minutes:650});
 assert.equal(s.chapter,2);assert.equal(s.inventory[0],9);assert.equal(s.health,61);assert.equal(s.trust,2);
});
test('death and exhausted actions cannot produce resources',()=>{
 assert.ok(G);const s=G.newGame(1);s.energy=0;const a=JSON.stringify(s);assert.equal(G.reduce(s,{type:'gather'},1).ok,false);assert.equal(JSON.stringify(s),a);
 s.health=0;assert.equal(G.reduce(s,{type:'rest'},1).ok,false);
});

test('gathering exposes regional roots and targeted gathering reaches deep recipes',()=>{
 const s=G.newGame(1);const options=G.gatherOptions(s);assert.ok(options.includes(0));
 const deep=options.find(id=>id>=245);assert.ok(Number.isInteger(deep),'deep regional resource missing');
 const before=JSON.stringify(s);s.energy=100;
 assert.equal(G.reduce(s,{type:'gather',resource:deep},1).ok,true);
 assert.equal(s.inventory[deep],2);
 const unchanged=JSON.stringify(s);assert.equal(G.reduce(s,{type:'gather',resource:999},1).ok,false);assert.equal(JSON.stringify(s),unchanged);
 assert.equal(G.newGame(1).inventory[15],0,'story lens must be discovered, not gifted');
 assert.notEqual(before,JSON.stringify(s));
});
test('equipped axe wears out while lumberjacking',()=>{
 assert.ok(G);const s=G.newGame(1);s.inventory[11]=1;s.tool=11;s.durability[11]=1;
 assert.equal(G.reduce(s,{type:'gather',kind:'wood'},1).ok,true);assert.equal(s.inventory[17],3);assert.equal(s.inventory[11],0);assert.equal(s.tool,-1);
});
test('both story routes reach their endings and survive serialization',()=>{
 assert.ok(G);
 for(const route of [0,1]){const s=G.newGame(1);s.inventory[7]=1;s.inventory[8]=1;s.ate=true;
 assert.equal(G.reduce(s,{type:'choice',choice:0},1).ok,true);
 G.reduce(s,{type:'travel',region:1},1);G.reduce(s,{type:'explore'},1);
 s.inventory[11]=1;s.inventory[12]=1;G.reduce(s,{type:'choice',choice:route},1);
 G.reduce(s,{type:'choice',choice:route},1);s.inventory[14]=1;s.inventory[13]=1;
 G.reduce(s,{type:'travel',region:route?3:2},1);
 for(let i=0;i<3;i++){s.energy=100;G.reduce(s,{type:'explore'},1)}
 assert.equal(s.chapter,3);assert.equal(s.inventory[15],1);s.energy=100;G.reduce(s,{type:'travel',region:0},1);
 s.inventory[16]=1;G.reduce(s,{type:'choice',choice:route},1);
 assert.equal(G.validate(JSON.parse(JSON.stringify(s))).chapter,4);
 assert.equal(s.trust>=2,route===0);
 }
});
