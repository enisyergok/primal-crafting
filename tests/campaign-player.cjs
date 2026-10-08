const assert=require('node:assert/strict');
const P=require('../app/src/main/assets/game.js');

// Drives only public player actions. No inventory, energy, skill, quest or story injection.
class Player {
 constructor(seed=123456){this.state=P.newGame(seed);this.now=1000000;this.actions=0;}
 act(action){
  this.now+=1000;this.actions++;
  assert.ok(this.actions<100000,'campaign did not converge');
  const result=P.reduce(this.state,action,this.now);
  assert.equal(result.ok,true,JSON.stringify(action)+': '+result.message);
  P.validate(this.state);return result;
 }
 care(){
  const s=this.state;
  while(s.health<70)this.act({type:'building',building:'home'});
  if(s.energy<35)this.act({type:'rest'});
  if(s.water<45&&s.inventory[8])this.act({type:'drink'});
  if(s.food<40){
   let food=P.itemData.find(i=>i.effect?.food&&s.inventory[i.id]>0);
   if(!food){
    const id=P.gatherOptions(s).find(id=>P.itemData[id].effect?.food);
    assert.notEqual(id,undefined,'regional survival food required');
    this.act({type:'equip',item:-1});this.act({type:'gather',resource:id});food=P.itemData[id];
   }
   this.act({type:'eat',item:food.id});
  }
 }
 go(region){
  if(this.state.region===region)return;
  if(region===2)this.ensure(14,1);
  if(region===3)this.ensure(13,1);
  this.care();this.act({type:'travel',region});
 }
 ensure(id,amount=1,stack=[]){
  assert.ok(!stack.includes(id),'recipe dependency cycle: '+[...stack,id]);
  let tries=0;
  while(this.state.inventory[id]<amount){
   assert.ok(++tries<2000,'cannot obtain '+id);
   this.care();
   const r=P.recipes.find(r=>r.out===id);
   if(!r){
    assert.ok(P.itemData[id].gatherable&&id!==15,'not gatherable: '+id);
    this.go(P.itemData[id].region);
    this.act({type:'equip',item:-1});this.act({type:'gather',resource:id});continue;
   }
   if(r.tool>=0&&!P.availableTool(this.state,r.tool))this.ensure(r.tool,1,[...stack,id]);
   for(const [input,n]of Object.entries(r.input))this.ensure(+input,n,[...stack,id]);
   this.care();
   if(Object.entries(r.input).some(([input,n])=>this.state.inventory[input]<n))continue;
   if(r.tool>=0&&!P.availableTool(this.state,r.tool))continue;
   this.act({type:'equip',item:r.tool});
   const list=Object.entries(r.input).flatMap(([input,n])=>Array(n).fill(+input));
   assert.equal(P.findRecipe(list,this.state.tool),r.id,'ambiguous workbench: '+r.name);
   this.act({type:'craft',recipe:r.id});
  }
 }
 make(id){const before=this.state.activity['craft:'+id]||0;this.ensure(id,this.state.inventory[id]+1);assert.ok(this.state.activity['craft:'+id]>before);}
 campaign(route=0,kind=0){
  this.ensure(9);this.act({type:'eat',item:9});this.ensure(8);this.ensure(7);
  // Installing story structures must never invalidate chapter requirements or the fire tool.
  this.act({type:'use',item:7});
  this.act({type:'choice',choice:kind});this.go(1);this.care();this.act({type:'explore'});
  this.ensure(11);this.ensure(12);this.act({type:'use',item:12});this.act({type:'choice',choice:kind});
  this.act({type:'choice',choice:route});
  this.go(route===0?2:3);
  for(let i=0;i<3;i++){this.care();this.act({type:'explore'});}
  this.go(0);this.ensure(16);this.act({type:'use',item:16});this.act({type:'choice',choice:kind});
  assert.equal(this.state.ended,true);assert.equal(this.state.chapter,4);
  const saved=JSON.stringify(this.state);this.state=P.migrate(JSON.parse(saved));assert.equal(JSON.stringify(this.state),saved);
  return this;
 }
 expandStorage(){
  // Early, craftable shelving adds real slots before the completionist collection.
  for(const id of [132,138,139,195,203,211,219,227,251,259,267,275,283,307,315,323,331,339]){
   if(!P.itemData[id].effect?.capacity)continue;
   for(let i=0;i<5;i++){this.ensure(id);this.act({type:'use',item:id});}
   if(P.capacity(this.state)>P.items.length+10)break;
  }
  assert.ok(P.capacity(this.state)>P.items.length);
 }
}
module.exports={Player};
