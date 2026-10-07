const {test}=require('node:test');
const assert=require('node:assert/strict');
const P=require('../app/src/main/assets/game.js');

test('skill checks are deterministic and award XP only on successful action',()=>{
  assert.equal(typeof P.skillCheck,'function');
  const s=P.newGame(1);s.skills[0]={level:2,xp:95};s.rng=0xffffffff;
  const before=JSON.stringify(s.skills[0]);
  const result=P.skillCheck(s,0,10);
  assert.equal(result.success,true);assert.ok(result.chance>=90);
  assert.notEqual(JSON.stringify(s.skills[0]),before);
});

test('quest status respects prerequisites and completes with progress',()=>{
  assert.equal(typeof P.questStatus,'function');
  const s=P.newGame(1);
  assert.equal(P.questStatus(s,0),'active');
  assert.equal(P.questStatus(s,10),'locked');
  s.quests[0].progress=1;s.quests[0].status='complete';
  assert.equal(P.questStatus(s,0),'complete');
  assert.equal(P.questStatus(s,1),'active');
});

test('event choices apply one atomic reward and cannot be claimed twice',()=>{
  assert.equal(typeof P.applyEvent,'function');
  const s=P.newGame(1);const before=s.energy;
  const result=P.applyEvent(s,0,0,1);
  assert.equal(result.ok,true);assert.equal(s.energy,before-8);assert.equal(s.events[0].resolved,true);
  const snapshot=JSON.stringify(s);
  assert.equal(P.applyEvent(s,0,1,1).ok,false);assert.equal(JSON.stringify(s),snapshot);
});
