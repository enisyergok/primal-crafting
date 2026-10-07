const {test}=require('node:test');
const assert=require('node:assert/strict');
const P=require('../app/src/main/assets/game.js');

test('crafting advances the matching quest without a manual cheat button',()=>{
  const s=P.newGame(1);
  assert.equal(s.quests[0].status,'active');
  assert.equal(P.reduce(s,{type:'equip',item:0},1).ok,true);
  assert.equal(P.reduce(s,{type:'craft',recipe:0},1).ok,true);
  assert.equal(s.quests[0].status,'complete');
  assert.equal(s.stats.quests,1);
});

test('exploration activates regional events and event choice advances event quests',()=>{
  const s=P.newGame(1);s.events[0].resolved=true;s.chapter=1;s.region=1;s.energy=100;
  const result=P.reduce(s,{type:'explore'},1);
  assert.equal(result.ok,true);
  assert.ok(s.events.some(e=>e.active&&!e.resolved));
  const active=s.events.find(e=>e.active&&!e.resolved);
  assert.equal(P.applyEvent(s,active.id,0,1).ok,true);
  assert.equal(s.events[active.id].resolved,true);
});

test('helper equipment changes real carrying capacity and gathering amount',()=>{
  const plain=P.newGame(1),equipped=P.newGame(1);
  equipped.helper.hand=11;equipped.helper.bag=19;
  assert.ok(P.helperCapacity(equipped)>P.helperCapacity(plain));
  assert.ok(P.helperAmount(equipped,10)>P.helperAmount(plain,10));
});

test('technology tree unlocks in order and charges its real cost',()=>{
  const s=P.newGame(1);s.inventory[17]=100;s.inventory[6]=100;s.inventory[0]=100;
  assert.equal(P.reduce(s,{type:'technology',technology:2},1).ok,false);
  const before=s.inventory[17];
  assert.equal(P.reduce(s,{type:'technology',technology:0},1).ok,false);
  assert.equal(s.technologies[0],true);
  s.skills[0].level=1;
  assert.equal(P.reduce(s,{type:'technology',technology:1},1).ok,true);
  assert.ok(s.inventory[17]<before);
});
