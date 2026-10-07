const {test}=require('node:test');
const assert=require('node:assert/strict');
const P=require('../app/src/main/assets/game.js');

test('helper equipment action consumes the item and updates the loadout',()=>{
  const s=P.newGame(1);s.inventory[11]=1;
  const result=P.reduce(s,{type:'helperEquip',slot:'hand',item:11},1);
  assert.equal(result.ok,true);assert.equal(s.helper.hand,11);assert.equal(s.inventory[11],0);
});

test('each village building has a real action with a state result',()=>{
  assert.equal(typeof P.useBuilding,'function');
  for(const building of ['home','workshop','farm','fire','depot']){
    const s=P.newGame(1);s.inventory[17]=100;s.inventory[6]=20;s.inventory[0]=20;
    const result=P.useBuilding(s,building,1);
    assert.equal(result.ok,true,`${building}: ${result.message}`);
    assert.ok(s.journal.length>1||s.lastFarm!==1||s.energy<100,building);
  }
});

test('achievement definitions and unlocks are persistent and idempotent',()=>{
  assert.ok(P.achievements.length>=20);
  const s=P.newGame(1);s.inventory[9]=1;P.updateAchievements(s);
  assert.equal(P.achievementStatus(s,0),'unlocked');
  const count=s.achievements.length;P.updateAchievements(s);assert.equal(s.achievements.length,count);
  assert.equal(P.validate(JSON.parse(JSON.stringify(s))).achievements.length,count);
});

test('statistics expose progress for items recipes quests and chapters',()=>{
  assert.equal(typeof P.statistics,'function');
  const s=P.newGame(1);s.discovered.fill(true);s.quests.forEach(q=>q.status='complete');s.chapter=4;
 assert.deepEqual(P.statistics(s),{items:5,recipes:237,quests:87,chapter:5,achievements:0});
});
