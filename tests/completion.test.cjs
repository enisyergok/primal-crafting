const {test}=require('node:test');
const assert=require('node:assert/strict');
const P=require('../app/src/main/assets/game.js');
const {Player}=require('./campaign-player.cjs');

for(const route of [0,1])test('real fresh campaign, installed stations, route '+route+' and both endings',()=>{
 const p=new Player(91245+route).campaign(route,route);
 assert.equal(p.state.trust>=2,route===0);
 p.go(route===0?3:2);
 assert.equal(p.state.regionsVisited.every(Boolean),true,'opposite route must open after the ending');
});

test('completionist play obtains all recipes and completes every quest via real actions',()=>{
 const p=new Player().campaign();p.expandStorage();
 for(const r of P.recipes){if(r.out===16)continue;p.make(r.out);}
 // Resolve every regional, one-shot scene, including early events before later contracts.
 for(let region=0;region<4;region++){
  p.go(region);
  for(let i=0;i<6;i++){p.care();p.act({type:'explore'});}
  for(const e of P.events.filter(e=>e.region===region&&!p.state.events[e.id].resolved)){p.care();p.act({type:'event',event:e.id,choice:1});}
 }
 for(const q of P.quests){
  while(p.state.quests[q.id].status!=='complete'){
   const previous=p.state.quests[q.id].progress;
   if(q.type==='gather'){p.go(P.itemData[q.target].region);p.care();p.act({type:'gather',resource:q.target});}
   else if(q.type==='craft')p.make(q.target);
   else if(q.type==='explore'){p.go(q.target);p.care();p.act({type:'explore'});}
   else if(q.type==='build'){
    if(['depot','workshop'].includes(q.target))for(const [id,n]of Object.entries(P.costs(p.state,q.target)))p.ensure(+id,n);
    p.now+=300000;p.act({type:'building',building:q.target});
   }else assert.fail('unresolved event contract '+q.id);
   assert.ok(p.state.quests[q.id].progress>previous,'stalled quest '+q.id);
  }
 }
 assert.equal(p.state.discovered.filter(Boolean).length,P.recipes.length);
 assert.equal(p.state.quests.filter(q=>q.status==='complete').length,P.quests.length);
 assert.equal(p.state.events.filter(e=>e.resolved).length,P.events.length);
 assert.ok(p.state.health>0);
 console.log('Action-driven coverage: '+p.actions+' actions; '+P.recipes.length+' recipes, '+P.quests.length+' quests, '+P.events.length+' events.');
});

test('all recipes are unambiguous with every compatible owned tool',()=>{
 for(const r of P.recipes){
  const list=Object.entries(r.input).flatMap(([id,n])=>Array(n).fill(+id));
  for(const tool of [-1,...P.itemData.filter(i=>P.isTool(i.id)).map(i=>i.id)].filter(id=>P.toolMatches(id,r.tool)))
   assert.equal(P.findRecipe(list,tool),r.id,r.name+' with tool '+tool);
 }
});
test('no remaining tool dependency dead ends and lens is consumed only by the story signal',()=>{
 const reached=new Set(P.itemData.filter(i=>i.gatherable).map(i=>i.id));
 for(let i=0;i<P.recipes.length;i++)for(const r of P.recipes)if((r.tool===-1||reached.has(r.tool))&&Object.keys(r.input).every(id=>reached.has(+id))){reached.add(r.out);if(r.extra!==undefined)reached.add(r.extra);}
 assert.deepEqual(P.recipes.filter(r=>!reached.has(r.out)),[]);
 assert.deepEqual(P.recipes.filter(r=>r.input[15]).map(r=>r.out),[16]);
 assert.equal(P.recipes.some(r=>r.level>=50),true,'late mastery achievement must be attainable');
});
test('old expanded saves keep all late inventory and map discoveries by output',()=>{
 const old=P.newGame(32);old.version=3;old.inventory[342]=9;old.inventory[15]=1;
 old.discovered=Array(335).fill(false);old.discovered[334]=true;old.events[0].resolved=true;
 const migrated=P.migrate(old);
 assert.equal(migrated.inventory[342],9);assert.equal(migrated.inventory[15],1);
 assert.equal(migrated.discovered[P.recipes.find(r=>r.out===342).id],true);
 assert.equal(migrated.quests.find(q=>P.quests[q.id].type==='event'&&P.quests[q.id].target===0).status,'complete');
 P.validate(migrated);
});
test('every food, medicine, clothing and structure has a usable non-cosmetic effect',()=>{
 for(const item of P.itemData.filter(i=>['Yiyecek','Tıp','Giysi','Yapı'].includes(i.category))){
  const s=P.newGame(1);s.inventory[item.id]=1;s.health=50;s.energy=50;s.food=50;s.water=50;
  const type=item.category==='Yiyecek'?'eat':item.category==='Giysi'?'wear':'use';
  assert.equal(P.reduce(s,{type,item:item.id}).ok,true,item.name);
  assert.equal(s.inventory[item.id],0,item.name);
  if(type==='wear')assert.equal(s.equipment[item.slot],item.id);
  else if(item.category==='Yapı')assert.equal(s.installed[item.id],1);
  else assert.ok(s.food>50||s.health>50,item.name);
  P.validate(s);
 }
});
test('skills and technology actually improve gathering, survival, trade and crafting',()=>{
 const a=P.newGame(4),b=P.newGame(4);b.skills[1].level=8;b.technologies[1]=true;
 assert.ok(P.gatherBonus(b,4)>P.gatherBonus(a,4));
 b.technologies[13]=true;P.reduce(a,{type:'gather',resource:4});P.reduce(b,{type:'gather',resource:4});assert.ok(b.energy>a.energy);
 a.chapter=b.chapter=1;a.inventory[0]=b.inventory[0]=8;b.technologies[11]=true;
 P.reduce(a,{type:'trade',item:0});P.reduce(b,{type:'trade',item:0});assert.ok(b.inventory[4]>a.inventory[4]);
 a.skill=b.skill=0;b.skills[0].level=4;assert.ok(P.chance(b,P.recipes[5])>P.chance(a,P.recipes[5]));
 assert.equal(P.temperature({...a,region:2,minutes:500}),-8);assert.equal(P.temperature({...a,region:3,minutes:500}),42);
});
