(function(root){
'use strict';
const registry=typeof module!=='undefined'&&module.exports?require('./content.js'):root.PrimalContent;
const items=registry.items.map(item=>item.name);
// Tool is separate from ingredients. No input item is consumed before all guards pass.
const recipes=registry.recipes.map(recipe=>({...recipe,out:recipe.output,hint:recipe.hint||`${recipe.name} için doğru malzemeleri ve aleti birleştir.`}));
const regions=registry.regionNames;
const buildingNames={home:'Ev',depot:'Depo',workshop:'Atölye',farm:'Tarla',fire:'Ateş Alanı'};
const capacity=s=>16+s.buildings.depot*8;
const used=s=>s.inventory.filter(n=>n>0).length;
const chance=(s,r)=>Math.max(25,Math.min(100,100+(s.skill-r.level)*5+(s.tool===11||s.tool===18?5:0)));
function newGame(now=Date.now()){
 const inventory=Array(items.length).fill(0);inventory[0]=3;inventory[1]=5;inventory[2]=2;inventory[3]=8;inventory[4]=6;inventory[15]=1;inventory[17]=0;
 return {version:3,inventory,health:100,food:80,water:80,energy:100,day:1,minutes:480,
 chapter:0,region:0,trust:0,route:-1,searches:0,expeditions:0,storyBeat:0,metMira:false,ate:false,lens:false,ended:false,introduced:false,
  skill:12,skills:registry.skills.map(()=>({level:0,xp:0})),technologies:registry.technologies.map((_,i)=>i===0),tool:-1,durability:{},rng:now>>>0||1234567,discovered:recipes.map((_,i)=>i<3),
  quests:registry.quests.map((q,i)=>({id:q.id,status:i<3?'active':'locked',progress:0})),events:registry.events.map((e,i)=>({id:e.id,resolved:false,active:i===0})),achievements:[],prestige:0,
  stats:{actions:0,gathered:0,crafted:0,events:0,quests:0},regionsVisited:[true,false,false,false],
 helper:{energy:100,gathering:18,lumber:9,body:-1,hand:-1,bag:-1,job:null},
  buildings:{home:1,depot:1,workshop:1,farm:1,fire:1},journal:['Fırtına seni bu kıyıya getirdi. Usta Akın üretimi öğretecek; ormandan Mira’nın sesi geliyor.'],lastFarm:now-300000};
}
function validate(s){
 const bad=()=>{throw Error('Kayıt bozuk; özgün kayıt korunuyor.')};
 if(!s||s.version!==3||!Array.isArray(s.inventory)||s.inventory.length!==items.length)bad();
 const num=(n,min,max)=>Number.isFinite(n)&&Number.isInteger(n)&&n>=min&&n<=max;
 if(!s.inventory.every(n=>num(n,0,1000000)))bad();
 for(const key of ['health','food','water','energy'])if(!num(s[key],0,100))bad();
 for(const [key,min,max] of [['day',1,1000000],['minutes',0,1439],['chapter',0,4],['region',0,3],['route',-1,3],['skill',0,100],['tool',-1,19],['searches',0,1000000],['expeditions',0,3],['storyBeat',0,registry.storyBeats.length-1],['trust',-10,10],['rng',0,4294967295]])if(!num(s[key],min,max))bad();
 if(!s.buildings||!s.helper||!s.durability||!Array.isArray(s.discovered)||s.discovered.length!==recipes.length||!s.discovered.every(b=>typeof b==='boolean'))bad();
 if(!Array.isArray(s.skills)||s.skills.length!==registry.skills.length||!s.skills.every(x=>x&&num(x.level,0,20)&&num(x.xp,0,1000000)))bad();
 if(!Array.isArray(s.technologies)||s.technologies.length!==registry.technologies.length||!s.technologies.every(x=>typeof x==='boolean'))bad();
 if(!Array.isArray(s.quests)||s.quests.length!==registry.quests.length||!s.quests.every(x=>x&&num(x.id,0,registry.quests.length-1)&&['locked','active','complete','failed'].includes(x.status)&&num(x.progress,0,1000000)))bad();
 if(!Array.isArray(s.events)||s.events.length!==registry.events.length||!s.events.every(x=>x&&num(x.id,0,registry.events.length-1)&&typeof x.resolved==='boolean'&&(x.active===undefined||typeof x.active==='boolean')))bad();
 if(!Array.isArray(s.achievements)||!s.achievements.every(x=>Number.isInteger(x)&&x>=0&&x<registry.achievements.length))bad();
 if(!s.stats||!['actions','gathered','crafted','events','quests'].every(k=>num(s.stats[k],0,100000000)))bad();
 if(!Array.isArray(s.regionsVisited)||s.regionsVisited.length!==regions.length||!s.regionsVisited.every(v=>typeof v==='boolean'))bad();
 for(const key of Object.keys(buildingNames))if(!num(s.buildings[key],1,5))bad();
 for(const [key,min,max] of [['energy',0,100],['gathering',0,100],['lumber',0,100],['body',-1,19],['hand',-1,19],['bag',-1,19]])if(!num(s.helper[key],min,max))bad();
 for(const key of Object.keys(s.durability))if(!num(s.durability[key],0,1000))bad();
 if(!Array.isArray(s.journal)||s.journal.length>100||!s.journal.every(v=>typeof v==='string'&&v.length<3000)||!Number.isFinite(s.lastFarm))bad();
 if(s.helper.job){const j=s.helper.job;if(!num(j.resource,0,19)||!num(j.amount,1,1000)||!Number.isFinite(j.until)||!Number.isFinite(j.start)||j.until<j.start)bad();}
 for(const k of ['ate','lens','ended','metMira','introduced'])if(typeof s[k]!=='boolean')bad();
 return s;
}
function migrate(old){
 const s=newGame();
 for(const k of ['health','food','water','energy','chapter','region','trust','route','day','minutes','searches','expeditions','storyBeat','metMira','ate','lens','ended','introduced','prestige','lastFarm'])if(old[k]!==undefined)s[k]=old[k];
 if(Array.isArray(old.inventory))old.inventory.slice(0,20).forEach((n,i)=>s.inventory[i]=n);
 if(Array.isArray(old.journal))s.journal=old.journal.slice(-80);
 if(Array.isArray(old.skills)&&old.skills.length===s.skills.length)s.skills=old.skills.map(x=>({level:Number(x.level)||0,xp:Number(x.xp)||0}));
 if(Array.isArray(old.technologies)&&old.technologies.length===s.technologies.length)s.technologies=old.technologies.map(Boolean);
 if(Array.isArray(old.achievements))s.achievements=[...new Set(old.achievements.filter(x=>Number.isInteger(x)&&x>=0&&x<registry.achievements.length))];
 if(old.helper&&typeof old.helper==='object')s.helper={...s.helper,...old.helper};
 if(old.buildings&&typeof old.buildings==='object')s.buildings={...s.buildings,...old.buildings};
 if(Array.isArray(old.regionsVisited)&&old.regionsVisited.length===regions.length)s.regionsVisited=old.regionsVisited.map(Boolean);
 if(Array.isArray(old.events)&&old.events.length===s.events.length)s.events=old.events.map((e,i)=>({id:i,resolved:Boolean(e.resolved),active:e.active===undefined?i===0:Boolean(e.active)}));
 recipes.forEach((r,i)=>{if(s.inventory[r.out])s.discovered[i]=true});
 return validate(s);
}
function findRecipe(list,tool){
 const input={};for(const id of list)input[id]=(input[id]||0)+1;
 return recipes.findIndex(r=>r.tool===tool&&Object.keys(r.input).length===Object.keys(input).length&&Object.keys(r.input).every(k=>r.input[k]===input[k]));
}
function note(s,t){s.journal.push('Gün '+s.day+' · '+t);s.journal=s.journal.slice(-80)}
function spend(s,n){s.energy-=n;s.food=Math.max(0,s.food-2);s.water=Math.max(0,s.water-3);s.minutes+=30;if(s.minutes>=1440){s.minutes-=1440;s.day++}if(!s.food||!s.water)s.health=Math.max(0,s.health-5)}
function rand(s){let x=s.rng;x^=x<<13;x^=x>>>17;x^=x<<5;s.rng=x>>>0;return s.rng/4294967296}
function wear(s,id){if(id!==11&&id!==18)return;s.durability[id]=(s.durability[id]||25)-1;if(s.durability[id]<=0){s.inventory[id]--;s.durability[id]=s.inventory[id]>0?25:0;if(!s.inventory[id])s.tool=-1;note(s,items[id]+' aşındı ve kırıldı.')}}
function objective(s){return ['Ateş ve su kabı üret, ceviz etini ye. Sonra Mira’ya cevap ver.','Ormanda Mira’yı bul. Taş balta ve barınak üret.','Kar ya da volkan rotasını seç. Hazırlan ve üç kez araştır.','Kıyıya dön. Mercekle işaret ateşi üret ve kararını ver.','Hikâye tamamlandı. Köyünü büyütmeye devam edebilirsin.'][s.chapter]}
function dialogue(s){const beat=registry.storyBeats&&registry.storyBeats[s.storyBeat];if(beat&&beat.chapter===s.chapter)return beat.speaker+': '+beat.text;return [
 'Akın: Önce ateşi ve su kabını hazırlayalım. Bir taşı eline alıp cevizi kır; kabuğunu sakla. Ormandaki çağrıya güçlü çıkmalısın.',
 s.metMira?'Mira: Bacağım yaralı. Kuledeki mercekle gemilere işaret verebiliriz. Beni yanında götürecek misin?':'Akın: Baltanı hazırla. Ormanda yardım isteyen birini duydum.',
 s.route<0?'Mira: Kuleye iki yol var. Kar geçidinde sıcak giysi, volkan yolunda meşale gerekecek. Hangisini seçiyorsun?':'Mira: Seçtiğin yolda üç araştırma bizi gözcü kulesine ulaştıracak.',
 'Mira: Ufukta bir yelken! Kıyıda ateşi yak. Birlikte mi ayrılacağız?',
 s.trust>=2?'Birlikte kurtuldunuz. SON — Birlikte doğan gün.':'Gemi seni aldı; geride kalan çağrıyı unutmadın. SON — Yalnız ufuk.'
 ][s.chapter]}
function gainSkill(s,skillId,xp){
 const skill=s.skills[skillId];if(!skill)return;
 skill.xp+=Math.max(0,xp);
 while(skill.level<20&&skill.xp>=100+skill.level*20){skill.xp-=100+skill.level*20;skill.level++}
 if(skillId===0)s.skill=Math.max(s.skill,skill.level*5);
}
function skillCheck(s,skillId,difficulty){
 if(!Number.isInteger(skillId)||skillId<0||skillId>=s.skills.length)throw Error('Beceri yok.');
 const skill=s.skills[skillId],chance=Math.max(5,Math.min(100,80+skill.level*10-difficulty));
 const roll=((s.rng>>>0)%1000)/1000;s.rng=(Math.imul(s.rng>>>0,1664525)+1013904223)>>>0;
 const success=roll<chance/100;if(success)gainSkill(s,skillId,5+Math.floor(difficulty/5));
 return {chance,roll,success};
}
function technologyCost(s,technologyId){const t=registry.technologies[technologyId];return t?t.cost:null}
function unlockTechnology(s,technologyId){
 const t=registry.technologies[technologyId];if(!t||s.technologies[technologyId])return {ok:false,message:'Bu teknoloji zaten açık.'};
 if(!t.prerequisites.every(id=>s.technologies[id]))return {ok:false,message:'Önce önceki teknoloji yolunu aç.'};
 if(s.skills[t.skill].level<Math.floor(technologyId/3))return {ok:false,message:'Bu teknoloji için beceri seviyen yetmiyor.'};
 const cost=t.cost;if(Object.entries(cost).some(([id,n])=>s.inventory[id]<n))return {ok:false,message:'Teknoloji için kaynakların eksik.'};
 Object.entries(cost).forEach(([id,n])=>s.inventory[id]-=n);s.technologies[technologyId]=true;gainSkill(s,t.skill,10);note(s,t.name+' açıldı.');return {ok:true,message:t.name+' açıldı.'};
}
function questStatus(s,questId){
 const q=s.quests[questId];if(!q||!registry.quests[questId])return 'locked';
 const definition=registry.quests[questId];
 if(q.status==='complete'||q.status==='failed')return q.status;
 if(definition.prerequisites.some(id=>s.quests[id]?.status!=='complete'))return 'locked';
 return q.status==='active'?'active':'locked';
}
function advanceQuests(s,type,target,amount=1){
 const messages=[];
 registry.quests.forEach(definition=>{
   const q=s.quests[definition.id];
   if(q&&q.status==='active'&&definition.type===type&&definition.target===target){
     const result=completeQuest(s,definition.id,amount);if(result.ok)messages.push(result.message);
   }
 });
 return messages;
}
function completeQuest(s,questId,amount=1){
 const definition=registry.quests[questId],q=s.quests[questId];
 if(!definition||!q)return {ok:false,message:'Görev yok.'};
 if(questStatus(s,questId)!=='active')return {ok:false,message:'Bu görev henüz açık değil.'};
 if(!Number.isInteger(amount)||amount<1)return {ok:false,message:'Geçersiz görev ilerlemesi.'};
 if(q.status==='complete')return {ok:false,message:'Bu görev zaten tamamlandı.'};
 const nextProgress=Math.min(definition.amount,q.progress+amount),reward=definition.reward;
 if(nextProgress>=definition.amount&&reward.item!==undefined&&!s.inventory[reward.item]&&used(s)>=capacity(s))return {ok:false,message:'Ödül için depoda yer aç.'};
 q.progress=nextProgress;
 if(q.progress>=definition.amount){
  q.status='complete';s.inventory[reward.item]+=reward.amount;gainSkill(s,reward.skill,reward.xp);s.stats.quests++;note(s,'Görev tamamlandı: '+definition.name);
  registry.quests.forEach(next=>{const target=s.quests[next.id];if(target.status==='locked'&&next.prerequisites.every(id=>s.quests[id].status==='complete'))target.status='active'});
  return {ok:true,message:'Görev tamamlandı: '+definition.name};
 }
 return {ok:true,message:`Görev ilerlemesi ${q.progress}/${definition.amount}.`};
}
function newGamePlus(previous,prestige=1){
 if(!previous||!previous.ended)throw Error('Yeni oyun+ için önce hikâyeyi tamamla.');
 const next=newGame(Date.now());next.prestige=Math.max(1,Math.min(99,Number(prestige)||1));
 next.achievements=[...new Set(previous.achievements||[])];next.skills=previous.skills.map(x=>({level:x.level,xp:x.xp}));next.technologies=previous.technologies.map(Boolean);next.skill=previous.skill;
 for(const id of [5,6,7,8,11,12,13,14,18,19])if(previous.inventory[id]>0)next.inventory[id]=1;
 next.journal=['Yeni oyun+ başladı. Önceki ustalığın ve başarıların bu yolculuğa taşındı.'];return next;
}
function applyEvent(s,eventId,choice,now=Date.now()){
 const definition=registry.events[eventId],saved=s.events[eventId];
 if(!definition||!saved)return {ok:false,message:'Olay yok.'};
 if(saved.resolved)return {ok:false,message:'Bu olay zaten çözüldü.'};
 const selected=definition.choices[choice];if(!selected)return {ok:false,message:'Seçim yok.'};
 const delta=selected.delta||{};
 if(delta.item!==undefined&&(!Number.isInteger(delta.item)||delta.item<0||delta.item>=items.length))return {ok:false,message:'Olay ödülü bozuk.'};
 if(delta.item!==undefined&&!s.inventory[delta.item]&&used(s)>=capacity(s))return {ok:false,message:'Depo dolu; ödül korunuyor.'};
 if(s.energy+Number(delta.energy||0)<0)return {ok:false,message:'Bu seçim için enerjin yetmiyor.'};
 s.energy=Math.max(0,Math.min(100,s.energy+Number(delta.energy||0)));s.trust=Math.max(-10,Math.min(10,s.trust+Number(delta.trust||0)));
 if(delta.item!==undefined)s.inventory[delta.item]+=Number(delta.amount||1);
 if(delta.xp)gainSkill(s,Number(delta.skill||definition.skill),delta.xp);
 saved.resolved=true;saved.active=false;s.stats.events++;advanceQuests(s,'event',eventId);note(s,definition.name+' · '+selected.text);return {ok:true,message:selected.text};
}
function triggerEvent(s,source){
 const candidate=registry.events.find(event=>event.region===s.region&&!s.events[event.id].resolved&&!s.events[event.id].active);
 if(!candidate)return null;
 s.events[candidate.id].active=true;note(s,candidate.name+' başladı: '+source);return candidate.id;
}
function costs(s,b){const n=s.buildings[b];return {17:20*n,6:2*n,0:3*n}}
function helperCapacity(s){return (s.helper.bag===19?16:8)+(s.helper.hand===11?2:0)}
function helperAmount(s,minutes){return Math.min(helperCapacity(s),Math.max(1,4+minutes-1+(s.helper.gathering>=25?2:0)))}
function useBuilding(s,building,now=Date.now()){
 if(!buildingNames[building])return {ok:false,message:'Bina yok.'};
 if(building==='home'){s.health=Math.min(100,s.health+10);s.energy=Math.min(100,s.energy+15);s.food=Math.max(0,s.food-2);s.water=Math.max(0,s.water-2);advanceQuests(s,'build',building);note(s,'Evde dinlendin.');return {ok:true,message:'Evde dinlendin; sağlık ve enerji yenilendi.'};}
 if(building==='fire'){s.energy=Math.min(100,s.energy+25);s.health=Math.min(100,s.health+5);s.food=Math.max(0,s.food-1);s.water=Math.max(0,s.water-1);advanceQuests(s,'build',building);note(s,'Ateş alanında ısındın.');return {ok:true,message:'Ateş alanında ısındın.'};}
 if(building==='farm'){
   if(now<s.lastFarm+300000)return {ok:false,message:'Hasada henüz hazır değil; 5 dakikada yenilenir.'};
   if(!s.inventory[2]&&used(s)>=capacity(s))return {ok:false,message:'Depoda yer yok.'};
   s.inventory[2]+=s.buildings.farm*2;s.lastFarm=now;advanceQuests(s,'build',building);note(s,'Tarladan yiyecek toplandı.');return {ok:true,message:'Tarladan yiyecek toplandı.'};
 }
 if(s.buildings[building]>=5)return {ok:false,message:'En yüksek seviyede.'};
 const c=costs(s,building);
 if(Object.entries(c).some(([id,n])=>s.inventory[id]<n))return {ok:false,message:'Geliştirme malzemeleri eksik.'};
 Object.entries(c).forEach(([id,n])=>s.inventory[id]-=n);s.buildings[building]++;advanceQuests(s,'build',building);note(s,buildingNames[building]+' geliştirildi.');return {ok:true,message:'Bina seviye '+s.buildings[building]};
}
function updateAchievements(s){
 const done=new Set(s.achievements||[]),complete=s.quests.filter(q=>q.status==='complete').length,eventsDone=s.events.filter(e=>e.resolved).length,discovered=s.discovered.filter(Boolean).length;
 const checks=[
   ()=>s.inventory[9]>0,()=>[5,6,7,8,11,18].some(id=>s.inventory[id]>0),()=>s.inventory[12]>0,
   ()=>Boolean(s.helper.job||s.helper.hand>=0),()=>Object.values(s.buildings).some(v=>v>1),()=>eventsDone>0,
   ()=>discovered>=100,()=>complete>=10,()=>complete>=registry.quests.length,()=>s.chapter>=4,
   ()=>s.skills.every(x=>x.level>0),()=>s.prestige>0,()=>s.regionsVisited.every(Boolean),()=>discovered>=200,
   ()=>s.inventory.some(n=>n>=50),()=>s.day>=10&&s.health>10,()=>Object.values(s.buildings).every(v=>v>=3),
   ()=>eventsDone>=12,()=>s.discovered.some((v,i)=>v&&recipes[i].level>=50),()=>done.size>=registry.achievements.length-1
 ];
 checks.forEach((check,id)=>{if(check()&&id<registry.achievements.length)done.add(id)});
 s.achievements=[...done].filter(id=>id>=0&&id<registry.achievements.length).sort((a,b)=>a-b);return s.achievements;
}
function achievementStatus(s,id){return (s.achievements||[]).includes(id)?'unlocked':'locked'}
function statistics(s){return {items:s.inventory.filter(n=>n>0).length,recipes:s.discovered.filter(Boolean).length,quests:s.quests.filter(q=>q.status==='complete').length,chapter:s.chapter+1,achievements:(s.achievements||[]).length}}
function reduce(s,a,now=Date.now()){
 const no=message=>({ok:false,message});const yes=message=>{s.stats.actions++;updateAchievements(s);return {ok:true,message}};
 if(!a||typeof a.type!=='string')return no('Geçersiz işlem.');
 if(s.health<=0)return no('Yolculuğun sona erdi. Kayıt yükle veya yeni oyun başlat.');
 const ready=n=>s.energy>=n;
 const enough=inputs=>Object.entries(inputs).every(([id,n])=>s.inventory[id]>=n);
 const take=inputs=>Object.entries(inputs).forEach(([id,n])=>s.inventory[id]-=n);
 if(a.type==='equip'){
  if(![-1,0,5,7,11,18].includes(a.item)||(a.item>=0&&!s.inventory[a.item]))return no('Bu alet sende yok.');
  s.tool=a.item;return yes(a.item<0?'El ile çalışıyorsun.':items[a.item]+' ele takıldı.');
 }
 if(a.type==='craft'){
  const r=recipes[a.recipe];if(!r)return no('Bu birleşimden bir tarif çıkmadı.');
  if(r.tool!==s.tool)return no('Gerekli alet: '+(r.tool<0?'El':items[r.tool]));
  if(!enough(r.input))return no('Malzeme eksik. Kırmızı adetleri kontrol et.');
  if(a.recipe===9&&(s.chapter<3||s.region!==0||!s.lens))return no('Merceği bulup kıyıya dönmelisin.');
  if(!ready(5))return no('Enerjin yetmiyor; yemek ye veya dinlen.');
  if(!s.inventory[r.out]&&used(s)>=capacity(s))return no('Depo dolu. Önce alan aç.');
  const success=rand(s)>=1-chance(s,r)/100;take(r.input);spend(s,5);wear(s,s.tool);
  if(success){s.inventory[r.out]++;if(r.extra!==undefined)s.inventory[r.extra]++;s.discovered[a.recipe]=true;s.stats.crafted++;advanceQuests(s,'craft',r.out);if(r.out===11||r.out===18)s.durability[r.out]=25;note(s,r.name+' üretildi.');return yes(r.name+' üretildi!')}
  s.skill=Math.min(100,s.skill+2);note(s,'Deneme başarısız; ustalık +2.');return yes('Üretim tutmadı. Ustalık +2; sonraki denemede şansın arttı.');
 }
 if(a.type==='gather'){
  if(!ready(8))return no('Toplamak için 8 enerji gerekli.');
  if(a.kind==='wood'&&(s.tool!==11||!s.inventory[11]))return no('Odun kesmek için taş baltanı ele tak.');
  const drops=[[0,1,2,3,4],[1,4,3,0,2],[0,1,4],[0,1,0,4]];
  const id=a.kind==='wood'?17:drops[s.region][s.searches%drops[s.region].length];
  if(!s.inventory[id]&&used(s)>=capacity(s))return no('Depo dolu.');spend(s,8);s.searches++;s.inventory[id]+=2;s.stats.gathered+=2;advanceQuests(s,'gather',id,2);if(a.kind==='wood')wear(s,11);
  if(s.chapter===1&&s.region===1)s.metMira=true;if(s.searches%2===0)triggerEvent(s,'toplama');return yes(items[id]+' +2');
 }
 if(a.type==='eat'||a.type==='feed'){
  const id=a.item===2?2:9;if(!s.inventory[id])return no('Yiyecek yok; bir cevizi kır.');s.inventory[id]--;
  if(a.type==='feed')s.helper.energy=Math.min(100,s.helper.energy+30);else {s.food=Math.min(100,s.food+(id===9?30:10));s.energy=Math.min(100,s.energy+10);s.ate=true;}
  return yes(a.type==='feed'?'Kaya’nın enerjisi yenilendi.':'Yemek yedin.');
 }
 if(a.type==='drink'){if(!s.inventory[8])return no('Önce kabuktan su kabı yap.');s.water=100;return yes('Su kabını doldurup içtin.');}
 if(a.type==='rest'){s.energy=100;s.health=Math.min(100,s.health+5+(s.inventory[12]?15:0));s.food=Math.max(0,s.food-5);s.water=Math.max(0,s.water-5);s.minutes+=360;if(s.minutes>=1440){s.minutes-=1440;s.day++}return yes('Dinlendin; enerji yenilendi.');}
 if(a.type==='send'){
  if(s.helper.job)return no('Kaya zaten yolda.');if(![0,17,2,4].includes(a.resource)||![1,5,10].includes(a.minutes))return no('Geçersiz keşif.');
  if(s.helper.energy<20)return no('Kaya’yı önce besle.');if(a.resource===17&&s.helper.hand!==11)return no('Odun için Kaya’ya balta tak.');
  s.helper.energy-=20;const amount=helperAmount(s,a.minutes);
  s.helper.job={resource:a.resource,amount,start:now,until:now+a.minutes*60000};return yes('Kaya yola çıktı. Oyun kapalıyken de süre ilerler.');
 }
 if(a.type==='collect'){
  const j=s.helper.job;if(!j)return no('Bekleyen keşif yok.');if(now<j.until)return no('Kaya henüz dönmedi.');
  if(!s.inventory[j.resource]&&used(s)>=capacity(s))return no('Depoda yer aç; ganimet korunuyor.');
  s.inventory[j.resource]+=j.amount;s.stats.gathered+=j.amount;advanceQuests(s,'gather',j.resource,j.amount);s.helper.gathering=Math.min(100,s.helper.gathering+1);if(j.resource===17)s.helper.lumber=Math.min(100,s.helper.lumber+1);s.helper.job=null;note(s,'Kaya '+j.amount+' '+items[j.resource]+' getirdi.');return yes('Kaynaklar depoya alındı.');
 }
 if(a.type==='helperEquip'){
  const valid={hand:[11,18],body:[14],bag:[19]};if(s.helper.job)return no('Kaya dönünce ekipmanını değiştir.');
  if(!valid[a.slot]||!valid[a.slot].includes(a.item)||!s.inventory[a.item])return no('Bu ekipman sende yok.');
  if(s.helper[a.slot]>=0)s.inventory[s.helper[a.slot]]++;s.inventory[a.item]--;s.helper[a.slot]=a.item;
  if(s.tool===a.item&&!s.inventory[a.item])s.tool=-1;return yes('Kaya’nın ekipmanı güncellendi.');
 }
 if(a.type==='technology'){const result=unlockTechnology(s,a.technology);if(result.ok){s.stats.actions++;updateAchievements(s)}return result;}
 if(a.type==='building'){const result=useBuilding(s,a.building,now);if(result.ok){s.stats.actions++;updateAchievements(s)}return result;}
 if(a.type==='upgrade'){
  if(!buildingNames[a.building])return no('Bina yok.');if(s.buildings[a.building]>=5)return no('En yüksek seviyede.');
  const c=costs(s,a.building);if(!enough(c))return no('Geliştirme malzemeleri eksik.');take(c);s.buildings[a.building]++;note(s,buildingNames[a.building]+' geliştirildi.');return yes('Bina seviye '+s.buildings[a.building]);
 }
 if(a.type==='harvest'){
  if(now<s.lastFarm+300000)return no('Hasada henüz hazır değil; 5 dakikada yenilenir.');s.inventory[2]+=s.buildings.farm*2;s.lastFarm=now;return yes('Tarladan yiyecek toplandı.');
 }
  if(a.type==='travel'){
  const to=a.region;if(!Number.isInteger(to)||to<0||to>3)return no('Bölge yok.');if(to===s.region)return no('Zaten buradasın.');
  if(to===1&&s.chapter<1)return no('Önce kıyıdaki görevleri tamamla.');
  if(to>=2&&(s.chapter<2||s.route!==to))return no('Önce Günlük’ten rotanı seç.');
  if(to===2&&!s.inventory[14])return no('Sıcak giysi gerekli.');if(to===3&&!s.inventory[13])return no('Meşale gerekli.');if(!ready(12))return no('Yolculuk için 12 enerji gerekli.');
  spend(s,12);s.region=to;s.regionsVisited[to]=true;advanceQuests(s,'explore',to);note(s,regions[to]+' bölgesine geldin.');return yes(regions[to]);
 }
 if(a.type==='explore'){
  if(!ready(10))return no('Araştırmak için 10 enerji gerekli.');spend(s,10);
  advanceQuests(s,'explore',s.region);if(s.chapter===1&&s.region===1){s.metMira=true;triggerEvent(s,'keşif');return yes('Mira’yı buldun. Günlük’ten konuş.');}
  if(s.chapter===2&&s.route===s.region&&s.route>=2){s.expeditions++;if(s.expeditions>=3){s.lens=true;s.inventory[15]=1;triggerEvent(s,'kule araştırması');s.chapter=3;note(s,'İşaret merceği bulundu!');return yes('Merceği kıyıya götür.')}if(s.expeditions%2===0)triggerEvent(s,'keşif');return yes('Kuleye yaklaşım '+s.expeditions+'/3');}
  return yes(objective(s));
 }
  if(a.type==='choice'){
  if(a.choice!==0&&a.choice!==1)return no('Seçim yok.');const c=a.choice;
  if(s.chapter===0){if(!s.inventory[7]||!s.inventory[8]||!s.ate)return no('Önce ateş, su kabı ve yemek görevleri.');s.trust+=c===0?1:0;s.chapter=1;}
  else if(s.chapter===1){if(!s.metMira||!s.inventory[11]||!s.inventory[12])return no('Mira’yı bul; balta ve barınak üret.');s.trust+=c===0?2:-1;s.chapter=2;}
  else if(s.chapter===2){if(s.route>=0)return no('Rotan zaten seçildi.');s.route=c===0?2:3;s.expeditions=0;}
  else if(s.chapter===3){if(s.region!==0||!s.inventory[16])return no('Kıyıda işaret ateşi gerekli.');s.trust+=c===0?1:-2;s.chapter=4;s.ended=true;}
  else return no('Hikâye tamamlandı.');s.storyBeat=Math.min(registry.storyBeats.length-1,s.storyBeat+1);note(s,dialogue(s));return yes(objective(s));
 }
 if(a.type==='event'){const result=applyEvent(s,a.event,a.choice,now);if(result.ok){s.stats.actions++;updateAchievements(s)}return result;}
 if(a.type==='quest')return no('Görevler yaptığın eylemlerle ilerler; günlükten hedefi takip et.');
 return no('Bilinmeyen işlem.');
}
const api={items,recipes,regions,buildingNames,skills:registry.skills,technologies:registry.technologies,quests:registry.quests,events:registry.events,achievements:registry.achievements,storyBeats:registry.storyBeats,newGame,newGamePlus,validate,migrate,findRecipe,reduce,chance,capacity,used,objective,dialogue,costs,skillCheck,technologyCost,unlockTechnology,questStatus,completeQuest,advanceQuests,triggerEvent,helperCapacity,helperAmount,applyEvent,useBuilding,updateAchievements,achievementStatus,statistics};
if(typeof module!=='undefined')module.exports=api;else root.Primal=api;
})(typeof globalThis!=='undefined'?globalThis:this);
