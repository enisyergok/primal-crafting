(function(root){
'use strict';
const registry=typeof module!=='undefined'&&module.exports?require('./content.js'):root.PrimalContent;
const items=registry.items.map(item=>item.name);
// Tool is separate from ingredients. No input item is consumed before all guards pass.
const recipes=registry.recipes.map(recipe=>({...recipe,out:recipe.output,hint:recipe.hint||`${recipe.name} için doğru malzemeleri ve aleti birleştir.`}));
const regions=registry.regionNames;
const buildingNames={home:'Ev',depot:'Depo',workshop:'Atölye',farm:'Tarla',fire:'Ateş Alanı'};
const capacity=s=>16+s.buildings.depot*8+Object.entries(s.installed||{}).reduce((n,[id,count])=>n+(registry.items[id].effect?.capacity||0)*count,0)+(registry.items[s.equipment?.bag]?.effect?.capacity||0);
const used=s=>s.inventory.filter(n=>n>0).length;
const owned=(s,id)=>(s.inventory[id]||0)+(s.installed?.[id]||0);
const availableTool=(s,id)=>isTool(id)&&owned(s,id)>0;
function gatherSkill(id,kind){
 if(kind==='wood'||id===17)return 2;
 if([62,63,117,232,312].includes(id))return 3;
 if([64,65,66].includes(id))return 4;
 if(registry.items[id].category==='Malzeme'&&/taş|çakıl|kil|cevher|bazalt|obsidyen|tuz|kum|kuvars|kül|toprak/i.test(items[id]))return 7;
 return 1;
}
function gatherBonus(s,id,kind){
 const skill=gatherSkill(id,kind),tool=registry.items[s.tool],expected={2:'axe',3:'hunt',4:'fish',7:'pick'}[skill];
 const toolBonus=availableTool(s,s.tool)&&(!expected||tool?.toolKind===expected)?tool?.effect?.gather||0:0;
 return toolBonus+Math.floor(s.skills[skill].level/4)+(s.technologies[skill]?1:0);
}
function gatherOptions(s){return registry.items.filter(item=>item.gatherable&&item.id!==15&&item.region===s.region).map(item=>item.id)}
const chance=(s,r)=>Math.max(25,Math.min(100,100+(s.skill-r.level)*5+(s.skills[r.skill]?.level||0)*3+(s.technologies[r.skill]?8:0)+(registry.items[s.tool]?.effect?.craft||0)+Math.max(0,s.buildings.workshop-1)*3));
const isTool=id=>id===0||id===7||Boolean(registry.items[id]?.toolKind);
function toolMatches(actual,required){return actual===required||(required>=0&&Boolean(registry.items[required]?.toolKind)&&registry.items[actual]?.toolKind===registry.items[required].toolKind)}
function temperature(s){return [29,22,-8,42][s.region]+(s.minutes<360||s.minutes>=1200?-5:0)}
function protection(s){const worn=registry.items[s.equipment?.body];return (worn?.effect?.protection||0)+(s.inventory[s.region===2?14:13]>0?12:0)+(s.skills[13]?.level||0)+(s.technologies[13]?5:0)+(worn&&s.technologies[6]?5:0)}
function choiceOptions(s){if(s.chapter===0)return ['Mira’nın yardım çağrısına birlikte gidelim.','Önce kendi kurtuluş yolumu arayacağım.'];if(s.chapter===1)return ['Mira’yı yanıma alıp barınakta dinlendireceğim.','Mira’yı kampta bırakıp tek başıma ilerleyeceğim.'];if(s.chapter===2)return s.route<0?['Kar geçidi: sıcak giysiyle kuleye çık.','Volkan yolu: meşaleyle mağaradan geç.']:[];if(s.chapter===3)return ['Mira ve köylülerle birlikte gemiye bin.','İşaret verip tek başına gemiye bin.'];return []}
function questTarget(q){return q.type==='event'?registry.events[q.target].name:q.type==='explore'?regions[q.target]:q.type==='build'?buildingNames[q.target]:items[q.target]}

function newGame(now=Date.now()){
 const inventory=Array(items.length).fill(0);inventory[0]=3;inventory[1]=5;inventory[2]=2;inventory[3]=8;inventory[4]=6;inventory[17]=0;
 return {version:4,inventory,health:100,food:80,water:80,energy:100,day:1,minutes:480,
 chapter:0,region:0,trust:0,route:-1,searches:0,expeditions:0,storyBeat:0,metMira:false,ate:false,lens:false,ended:false,introduced:false,
  skill:12,skills:registry.skills.map(()=>({level:0,xp:0})),technologies:registry.technologies.map((_,i)=>i===0),tool:-1,durability:{},rng:now>>>0||1234567,discovered:recipes.map((_,i)=>i<3),
  quests:registry.quests.map(q=>({id:q.id,status:q.chapter===0&&!q.prerequisites.length?'active':'locked',progress:0})),events:registry.events.map((e,i)=>({id:e.id,resolved:false,active:i===0})),achievements:[],prestige:0,
  stats:{actions:0,gathered:0,crafted:0,events:0,quests:0},regionsVisited:[true,false,false,false],
 helper:{energy:100,gathering:18,lumber:9,body:-1,hand:-1,bag:-1,neck:-1,job:null},
  equipment:{body:-1,bag:-1,neck:-1},installed:{},studied:[],activity:{},buildings:{home:1,depot:1,workshop:1,farm:1,fire:1},journal:['Fırtına seni bu kıyıya getirdi. Usta Akın üretimi öğretecek; ormandan Mira’nın sesi geliyor.'],lastFarm:now-300000};
}
function validate(s){
 const bad=()=>{throw Error('Kayıt bozuk; özgün kayıt korunuyor.')};
 if(!s||s.version!==4||!Array.isArray(s.inventory)||s.inventory.length!==items.length)bad();
 const num=(n,min,max)=>Number.isFinite(n)&&Number.isInteger(n)&&n>=min&&n<=max;
 if(!s.inventory.every(n=>num(n,0,1000000)))bad();
 for(const key of ['health','food','water','energy'])if(!num(s[key],0,100))bad();
 for(const [key,min,max] of [['day',1,1000000],['minutes',0,1439],['chapter',0,4],['region',0,3],['route',-1,3],['skill',0,100],['tool',-1,items.length-1],['searches',0,1000000],['expeditions',0,3],['storyBeat',0,registry.storyBeats.length-1],['trust',-10,10],['rng',0,4294967295]])if(!num(s[key],min,max))bad();
 if(!s.buildings||!s.helper||!s.durability||!Array.isArray(s.discovered)||s.discovered.length!==recipes.length||!s.discovered.every(b=>typeof b==='boolean'))bad();
 if(!Array.isArray(s.skills)||s.skills.length!==registry.skills.length||!s.skills.every(x=>x&&num(x.level,0,20)&&num(x.xp,0,1000000)))bad();
 if(!Array.isArray(s.technologies)||s.technologies.length!==registry.technologies.length||!s.technologies.every(x=>typeof x==='boolean'))bad();
 if(!Array.isArray(s.quests)||s.quests.length!==registry.quests.length||!s.quests.every(x=>x&&num(x.id,0,registry.quests.length-1)&&['locked','active','complete','failed'].includes(x.status)&&num(x.progress,0,1000000)))bad();
 if(!Array.isArray(s.events)||s.events.length!==registry.events.length||!s.events.every(x=>x&&num(x.id,0,registry.events.length-1)&&typeof x.resolved==='boolean'&&(x.active===undefined||typeof x.active==='boolean')))bad();
 if(!Array.isArray(s.achievements)||!s.achievements.every(x=>Number.isInteger(x)&&x>=0&&x<registry.achievements.length))bad();
 if(!s.stats||!['actions','gathered','crafted','events','quests'].every(k=>num(s.stats[k],0,100000000)))bad();
 if(!Array.isArray(s.regionsVisited)||s.regionsVisited.length!==regions.length||!s.regionsVisited.every(v=>typeof v==='boolean'))bad();
 for(const key of Object.keys(buildingNames))if(!num(s.buildings[key],1,5))bad();
 for(const [key,min,max] of [['energy',0,100],['gathering',0,100],['lumber',0,100],['body',-1,items.length-1],['hand',-1,items.length-1],['bag',-1,items.length-1],['neck',-1,items.length-1]])if(!num(s.helper[key],min,max))bad();
 for(const key of Object.keys(s.durability))if(!num(s.durability[key],0,1000))bad();
 if(!Array.isArray(s.journal)||s.journal.length>100||!s.journal.every(v=>typeof v==='string'&&v.length<3000)||!Number.isFinite(s.lastFarm))bad();
 if(s.helper.job){const j=s.helper.job;if(!num(j.resource,0,19)||!num(j.amount,1,1000)||!Number.isFinite(j.until)||!Number.isFinite(j.start)||j.until<j.start)bad();}
 for(const k of ['ate','lens','ended','metMira','introduced'])if(typeof s[k]!=='boolean')bad();
 if(!s.equipment||!['body','bag','neck'].every(k=>num(s.equipment[k],-1,items.length-1)))bad();
 if(!s.installed||Object.entries(s.installed).some(([id,n])=>!registry.items[id]||registry.items[id].category!=='Yapı'||!num(n,0,5)))bad();
 if(!Array.isArray(s.studied)||!s.studied.every(id=>num(id,0,items.length-1)))bad();
 if(!s.activity||Object.values(s.activity).some(n=>!num(n,0,100000000)))bad();
 return s;
}
function migrate(old){
 if(!old||typeof old!=='object')throw Error('Kayıt okunamadı.');
 if(old.version===4)return validate(old);
 const s=newGame();
 for(const k of ['health','food','water','energy','chapter','region','trust','route','day','minutes','searches','expeditions','storyBeat','metMira','ate','lens','ended','introduced','prestige','lastFarm','skill','tool'])if(old[k]!==undefined)s[k]=old[k];
 if(Array.isArray(old.inventory))old.inventory.slice(0,items.length).forEach((n,i)=>s.inventory[i]=n);
 if(Array.isArray(old.journal))s.journal=old.journal.slice(-80);
 for(const k of ['skills','technologies','regionsVisited'])if(Array.isArray(old[k])&&old[k].length===s[k].length)s[k]=JSON.parse(JSON.stringify(old[k]));
 for(const k of ['helper','buildings','durability','stats'])if(old[k]&&typeof old[k]==='object')s[k]={...s[k],...old[k]};
 if(Array.isArray(old.achievements))s.achievements=[...new Set(old.achievements.filter(x=>Number.isInteger(x)&&x>=0&&x<registry.achievements.length))];
 if(Array.isArray(old.events)&&old.events.length===s.events.length)s.events=old.events.map((e,id)=>({id,resolved:Boolean(e.resolved),active:Boolean(e.active)}));
 const legacyOutputs=[9,5,6,7,8,11,12,13,14,16,18,19];
 const knownOutputs=new Set((old.discovered||[]).flatMap((known,id)=>known?[id<12?legacyOutputs[id]:id+8]:[]));
 recipes.forEach((r,i)=>{if(knownOutputs.has(r.out))s.discovered[i]=true});
 // New contracts differ from the old generated quests. Credit existing possessions,
 // resolved one-time events and visited regions instead of copying unrelated IDs.
 for(const r of recipes)if(s.inventory[r.out])s.activity['craft:'+r.out]=s.inventory[r.out];
 for(const item of registry.items)if(item.gatherable&&s.inventory[item.id])s.activity['gather:'+item.id]=s.inventory[item.id];
 s.events.forEach(e=>{if(e.resolved)s.activity['event:'+e.id]=1});
 s.regionsVisited.forEach((v,id)=>{if(v)s.activity['explore:'+id]=1});
 refreshQuests(s);
 return validate(s);
}
function findRecipe(list,tool){
 const input={};for(const id of list)input[id]=(input[id]||0)+1;
 return recipes.findIndex(r=>toolMatches(tool,r.tool)&&Object.keys(r.input).length===Object.keys(input).length&&Object.keys(r.input).every(k=>r.input[k]===input[k]));
}
function note(s,t){s.journal.push('Gün '+s.day+' · '+t);s.journal=s.journal.slice(-80)}
function spend(s,n){s.energy=Math.max(0,s.energy-Math.max(1,n-(s.technologies[13]?1:0)));s.food=Math.max(0,s.food-2);s.water=Math.max(0,s.water-3);s.minutes+=30;if(s.minutes>=1440){s.minutes-=1440;s.day++}if(!s.food||!s.water)s.health=Math.max(0,s.health-5);const exposure=Math.max(0,Math.abs(temperature(s)-24)-protection(s)-12);s.health=Math.max(0,s.health-Math.ceil(exposure/8));gainSkill(s,13,4);}
function rand(s){let x=s.rng;x^=x<<13;x^=x>>>17;x^=x<<5;s.rng=x>>>0;return s.rng/4294967296}
function wear(s,id){if(!registry.items[id]?.toolKind)return;s.durability[id]=(s.durability[id]??25)-1;if(s.durability[id]<=0){s.inventory[id]--;s.durability[id]=s.inventory[id]>0?25:0;if(!s.inventory[id])s.tool=-1;note(s,items[id]+' aşındı ve kırıldı.');}}
function objective(s){return ['Ateş ve su kabı üret, ceviz etini ye. Sonra Mira’ya cevap ver.','Ormanda Mira’yı bul. Taş balta ve barınak üret.','Kar ya da volkan rotasını seç. Hazırlan ve üç kez araştır.','Kıyıya dön. Mercekle işaret ateşi üret ve kararını ver.','Hikâye tamamlandı. Köyünü büyütmeye devam edebilirsin.'][s.chapter]}
function dialogue(s){return [
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
 if(skillId===0)s.skill=Math.min(100,Math.max(s.skill,skill.level*5));
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
function questStatus(s,id){
 const q=s.quests[id],d=registry.quests[id];if(!q||!d)return 'locked';
 if(q.status==='complete')return 'complete';
 return d.chapter<=s.chapter&&d.prerequisites.every(p=>s.quests[p].status==='complete')?'active':'locked';
}
function refreshQuests(s){
 for(const d of registry.quests){
  const q=s.quests[d.id];if(q.status==='complete')continue;
  q.status=questStatus(s,d.id);
  q.progress=Math.min(d.amount,s.activity[d.type+':'+d.target]||0);
  if(q.status==='active'&&q.progress>=d.amount){
   q.status='complete';const r=d.reward;s.inventory[r.item]+=r.amount;gainSkill(s,r.skill,r.xp);s.stats.quests++;note(s,'Görev tamamlandı: '+d.name);
  }
 }
}
function advanceQuests(s,type,target,amount=1){
 const key=type+':'+target;s.activity[key]=(s.activity[key]||0)+amount;refreshQuests(s);
}
function completeQuest(s,id,amount=1){
 const d=registry.quests[id];if(!d||questStatus(s,id)!=='active')return {ok:false,message:'Bu görev henüz açık değil.'};
 if(!Number.isInteger(amount)||amount<1)return {ok:false,message:'Geçersiz görev ilerlemesi.'};
 advanceQuests(s,d.type,d.target,amount);return {ok:true,message:s.quests[id].status==='complete'?'Görev tamamlandı.':'Görev ilerledi.'};
}
function newGamePlus(previous,prestige=1){
 if(!previous||!previous.ended)throw Error('Yeni oyun+ için önce hikâyeyi tamamla.');
 const next=newGame(Date.now());next.prestige=Math.max(1,Math.min(99,Number(prestige)||1));
 next.achievements=[...new Set(previous.achievements||[])];next.skills=previous.skills.map(x=>({level:x.level,xp:x.xp}));next.technologies=previous.technologies.map(Boolean);next.skill=previous.skill;next.discovered=previous.discovered.map(Boolean);
 for(const id of [5,6,7,8,11,12,13,14,18,19])if(previous.inventory[id]>0)next.inventory[id]=1;
 next.journal=['Yeni oyun+ başladı. Önceki ustalığın ve başarıların bu yolculuğa taşındı.'];return next;
}
function applyEvent(s,eventId,choice,now=Date.now()){
 const definition=registry.events[eventId],saved=s.events[eventId];
 if(!definition||!saved)return {ok:false,message:'Olay yok.'};
 if(!saved.active)return {ok:false,message:'Bu olayı önce bulunduğu bölgede keşfet.'};
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
function helperCapacity(s){return 8+(registry.items[s.helper.bag]?.effect?.capacity||0)+(registry.items[s.helper.hand]?.effect?.gather||0)*2}
function helperAmount(s,minutes){return Math.min(helperCapacity(s),Math.max(1,4+minutes-1+(s.helper.gathering>=25?2:0)+(s.helper.neck>=0?1:0)))}
function useBuilding(s,building,now=Date.now()){
 if(!buildingNames[building])return {ok:false,message:'Bina yok.'};
 if(building==='home'){s.health=Math.min(100,s.health+10*s.buildings.home);s.energy=Math.min(100,s.energy+15*s.buildings.home);s.food=Math.max(0,s.food-2);s.water=Math.max(0,s.water-2);advanceQuests(s,'build',building);note(s,'Evde dinlendin.');return {ok:true,message:'Evde dinlendin; sağlık ve enerji yenilendi.'};}
 if(building==='fire'){s.energy=Math.min(100,s.energy+25*s.buildings.fire);s.health=Math.min(100,s.health+5*s.buildings.fire);s.food=Math.max(0,s.food-1);s.water=Math.max(0,s.water-1);advanceQuests(s,'build',building);note(s,'Ateş alanında ısındın.');return {ok:true,message:'Ateş alanında ısındın.'};}
 if(building==='farm'){
   if(now<s.lastFarm+300000)return {ok:false,message:'Hasada henüz hazır değil; 5 dakikada yenilenir.'};
   if(!s.inventory[2]&&used(s)>=capacity(s))return {ok:false,message:'Depoda yer yok.'};
   s.inventory[2]+=s.buildings.farm*2;s.lastFarm=now;advanceQuests(s,'build',building);note(s,'Tarladan yiyecek toplandı.');return {ok:true,message:'Tarladan yiyecek toplandı.'};
 }
 if(s.buildings[building]>=5)return {ok:false,message:'En yüksek seviyede.'};
 const c=costs(s,building);
 if(Object.entries(c).some(([id,n])=>s.inventory[id]<n))return {ok:false,message:'Geliştirme malzemeleri eksik.'};
 Object.entries(c).forEach(([id,n])=>s.inventory[id]-=n);s.buildings[building]++;gainSkill(s,9,30);advanceQuests(s,'build',building);note(s,buildingNames[building]+' geliştirildi.');return {ok:true,message:'Bina seviye '+s.buildings[building]};
}
function updateAchievements(s){
 const done=new Set(s.achievements||[]),complete=s.quests.filter(q=>q.status==='complete').length,eventsDone=s.events.filter(e=>e.resolved).length,discovered=s.discovered.filter(Boolean).length;
 const checks=[
   ()=>s.inventory[9]>0,()=>[5,6,7,8,11,18].some(id=>s.inventory[id]>0),()=>owned(s,12)>0,
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
 const no=message=>({ok:false,message});const yes=message=>{s.stats.actions++;refreshQuests(s);updateAchievements(s);return {ok:true,message}};
 if(!a||typeof a.type!=='string')return no('Geçersiz işlem.');
 if(s.health<=0)return no('Yolculuğun sona erdi. Kayıt yükle veya yeni oyun başlat.');
 const ready=n=>s.energy>=n;
 const enough=inputs=>Object.entries(inputs).every(([id,n])=>s.inventory[id]>=n);
 const take=inputs=>Object.entries(inputs).forEach(([id,n])=>s.inventory[id]-=n);
 if(a.type==='equip'){
  if((a.item!==-1&&!isTool(a.item))||(a.item>=0&&!availableTool(s,a.item)))return no('Bu alet sende yok.');
  s.tool=a.item;return yes(a.item<0?'El ile çalışıyorsun.':items[a.item]+' ele takıldı.');
 }
 if(a.type==='craft'){
  const r=recipes[a.recipe];if(!r)return no('Bu birleşimden bir tarif çıkmadı.');
  if(!toolMatches(s.tool,r.tool)||(r.tool>=0&&!availableTool(s,s.tool)))return no('Gerekli alet: '+(r.tool<0?'El':items[r.tool]));
  if(!enough(r.input))return no('Malzeme eksik. Kırmızı adetleri kontrol et.');
  if(r.out===16&&(s.chapter<3||s.region!==0||!s.lens))return no('Merceği bulup kıyıya dönmelisin.');
  if(!ready(5))return no('Enerjin yetmiyor; yemek ye veya dinlen.');
  const projected=s.inventory.map((n,id)=>n-(r.input[id]||0)+(id===r.out?1:0)+(id===r.extra?1:0));
  if(projected.filter(n=>n>0).length>capacity(s))return no('Depo dolu. Önce alan aç.');
  const success=rand(s)>=1-chance(s,r)/100;take(r.input);spend(s,5);wear(s,s.tool);
  if(success){gainSkill(s,r.skill,12);s.skill=Math.min(100,s.skill+1);s.inventory[r.out]++;if(r.extra!==undefined)s.inventory[r.extra]++;s.discovered[a.recipe]=true;s.stats.crafted++;advanceQuests(s,'craft',r.out);if(registry.items[r.out].toolKind)s.durability[r.out]=25;note(s,r.name+' üretildi.');return yes(r.name+' üretildi!')}
  s.skill=Math.min(100,s.skill+2);note(s,'Deneme başarısız; ustalık +2.');return yes('Üretim tutmadı. Ustalık +2; sonraki denemede şansın arttı.');
 }
 if(a.type==='gather'){
  if(!ready(8))return no('Toplamak için 8 enerji gerekli.');
  if(a.kind==='wood'&&(registry.items[s.tool]?.toolKind!=='axe'||!s.inventory[s.tool]))return no('Odun kesmek için taş baltanı ele tak.');
  const options=gatherOptions(s);
  if(!options.length)return no('Bu bölgede toplanacak kaynak kalmadı.');
  const requested=a.resource===undefined?null:Number(a.resource);
  if(requested!==null&&(!Number.isInteger(requested)||!options.includes(requested)))return no('Bu kaynak bulunduğun bölgede toplanamaz.');
  const id=a.kind==='wood'?17:(requested===null?options[s.searches%options.length]:requested);
  if(!s.inventory[id]&&used(s)>=capacity(s))return no('Depo dolu.');spend(s,8);s.searches++;const bonus=gatherBonus(s,id,a.kind);const amount=2+bonus;s.inventory[id]+=amount;s.stats.gathered+=amount;gainSkill(s,gatherSkill(id,a.kind),10);advanceQuests(s,'gather',id,amount);if(s.tool>=0)wear(s,s.tool);
  if(s.chapter===1&&s.region===1)s.metMira=true;if(s.searches%2===0)triggerEvent(s,'toplama');return yes(items[id]+' +'+amount);
 }
 if(a.type==='eat'||a.type==='feed'){
  const id=a.item===undefined?s.inventory[9]>0?9:registry.items.find(x=>x.effect?.food&&s.inventory[x.id]>0)?.id:Number(a.item);
  const item=registry.items[id];if(!item?.effect?.food||!s.inventory[id])return no('Yiyecek yok; kaynak topla veya bir cevizi kır.');
  s.inventory[id]--;if(a.type==='feed')s.helper.energy=Math.min(100,s.helper.energy+item.effect.food);else {for(const [k,n] of Object.entries(item.effect))s[k]=Math.min(100,s[k]+n+(k==='food'&&s.technologies[5]?5:0));s.ate=true;}return yes(a.type==='feed'?'Kaya beslendi.':item.name+' yedin.');
 }
 if(a.type==='use'){
  const id=Number(a.item),item=registry.items[id];if(!item||!s.inventory[id])return no('Bu eşya sende yok.');
  if(item.category==='Tıp'){for(const [k,n] of Object.entries(item.effect))s[k]=Math.min(100,s[k]+n+(k==='health'&&s.technologies[8]?5:0));s.inventory[id]--;gainSkill(s,8,10);return yes(item.name+' kullandın.');}
  if(item.category==='Yapı'){
   if((s.installed[id]||0)>=5)return no('Bu yapıdan en fazla beş tane kurabilirsin.');
   s.inventory[id]--;s.installed[id]=(s.installed[id]||0)+1;gainSkill(s,9,15);return yes(item.name+' kampına kuruldu.');
  }
  if(item.category==='Bilgi'||item.category==='Süs'){
   if(s.studied.includes(id))return no('Bu parçayı zaten inceledin.');
   s.studied.push(id);gainSkill(s,item.category==='Bilgi'?10:14,item.effect.xp);
   const r=recipes.find(r=>!s.discovered[r.id]&&r.region===s.region);
   if(item.category==='Bilgi'&&r){s.discovered[r.id]=true;note(s,item.name+' sayesinde '+r.name+' tarifini öğrendin.');return yes('Yeni tarif öğrendin: '+r.name);}
   return yes(item.name+' koleksiyonuna işlendi. Ustalık deneyimi kazandın.');
  }
  return no('Bu eşyayı üretimde veya ekipman olarak kullan.');
 }
 if(a.type==='wear'){
  const id=Number(a.item),item=registry.items[id];if(!item?.slot||!s.inventory[id])return no('Bu giysi sende yok.');
  const slot=item.slot,previous=s.equipment[slot];if(previous>=0)s.inventory[previous]++;s.inventory[id]--;s.equipment[slot]=id;return yes(item.name+' kuşandın.');
 }
 if(a.type==='unequip'){
  if(!Object.hasOwn(s.equipment,a.slot)||s.equipment[a.slot]<0)return no('Bu yuva boş.');
  s.inventory[s.equipment[a.slot]]++;s.equipment[a.slot]=-1;return yes('Ekipman çantaya alındı.');
 }
 if(a.type==='discard'){
  const id=Number(a.item),amount=Number(a.amount||1);if(!registry.items[id]||!Number.isInteger(amount)||amount<1||s.inventory[id]<amount)return no('Geçersiz eşya adedi.');
  if(id===15||id===16)return no('Hikâye eşyaları korunur.');
  s.inventory[id]-=amount;if(s.tool===id&&!s.inventory[id])s.tool=-1;return yes(items[id]+' ×'+amount+' çantadan çıkarıldı.');
 }
 if(a.type==='trade'){
  const id=Number(a.item),out=Number(a.output??4),item=registry.items[id];
  if(s.chapter<1)return no('Köy takası ormana ulaştığında açılır.');
  if(!item||item.category!=='Malzeme'||![0,1,4].includes(out)||out===id||s.inventory[id]<2)return no('Takas için iki malzeme ve farklı bir temel kaynak seç.');
  if(!s.inventory[out]&&s.inventory[id]>2&&used(s)>=capacity(s))return no('Depoda yer aç.');
  s.inventory[id]-=2;s.inventory[out]+=1+(s.technologies[11]?1:0);gainSkill(s,11,15);
  return yes(item.name+' temel kaynakla takas edildi.');
 }
 if(a.type==='research'){
  if(!ready(10))return no('Araştırmak için 10 enerji gerekli.');
  const next=recipes.find(r=>!s.discovered[r.id]&&r.region===s.region&&(r.out!==16||s.chapter>=3));
  if(!next)return no('Bu bölgedeki bütün tarifleri öğrendin.');
  spend(s,10-(s.technologies[14]?2:0));gainSkill(s,14,15);s.discovered[next.id]=true;
  note(s,'Akın’ın notlarından öğrendin: '+next.name);return yes('Yeni tarif: '+next.name);
 }
 if(a.type==='drink'){if(!s.inventory[8]&&!registry.items.some(i=>i.toolKind==='container'&&s.inventory[i.id]))return no('Önce kabuktan su kabı yap.');s.water=100;return yes('Su kabını doldurup içtin.');}
 if(a.type==='rest'){s.energy=100;s.health=Math.min(100,s.health+5+(owned(s,12)?15:0)+(s.technologies[9]?5:0)+Object.entries(s.installed).reduce((a,[id,n])=>a+(registry.items[id].effect?.comfort||0)*n,0));s.food=Math.max(0,s.food-5);s.water=Math.max(0,s.water-5);s.minutes+=360;if(s.minutes>=1440){s.minutes-=1440;s.day++}return yes('Dinlendin; enerji yenilendi.');}
 if(a.type==='send'){
  if(s.helper.job)return no('Kaya zaten yolda.');if(![0,17,2,4].includes(a.resource)||![1,5,10].includes(a.minutes))return no('Geçersiz keşif.');
  if(s.helper.energy<20)return no('Kaya’yı önce besle.');if(a.resource===17&&registry.items[s.helper.hand]?.toolKind!=='axe')return no('Odun için Kaya’ya balta tak.');
  s.helper.energy-=20;const amount=helperAmount(s,a.minutes);
  s.helper.job={resource:a.resource,amount,start:now,until:now+a.minutes*60000};return yes('Kaya yola çıktı. Oyun kapalıyken de süre ilerler.');
 }
 if(a.type==='collect'){
  const j=s.helper.job;if(!j)return no('Bekleyen keşif yok.');if(now<j.until)return no('Kaya henüz dönmedi.');
  if(!s.inventory[j.resource]&&used(s)>=capacity(s))return no('Depoda yer aç; ganimet korunuyor.');
  s.inventory[j.resource]+=j.amount;s.stats.gathered+=j.amount;advanceQuests(s,'gather',j.resource,j.amount);s.helper.gathering=Math.min(100,s.helper.gathering+1);if(j.resource===17)s.helper.lumber=Math.min(100,s.helper.lumber+1);s.helper.job=null;note(s,'Kaya '+j.amount+' '+items[j.resource]+' getirdi.');return yes('Kaynaklar depoya alındı.');
 }
  if(a.type==='helperEquip'){
  const valid=Object.fromEntries(['hand','body','bag','neck'].map(slot=>[slot,registry.items.filter(i=>slot==='hand'?Boolean(i.toolKind):i.slot===slot).map(i=>i.id)]));if(s.helper.job)return no('Kaya dönünce ekipmanını değiştir.');
  if(!valid[a.slot]||!valid[a.slot].includes(a.item)||!s.inventory[a.item])return no('Bu ekipman sende yok.');
  if(s.helper[a.slot]>=0)s.inventory[s.helper[a.slot]]++;s.inventory[a.item]--;s.helper[a.slot]=a.item;
  if(s.tool===a.item&&!s.inventory[a.item])s.tool=-1;return yes('Kaya’nın ekipmanı güncellendi.');
 }
 if(a.type==='technology'){const result=unlockTechnology(s,a.technology);if(result.ok){s.stats.actions++;updateAchievements(s)}return result;}
 if(a.type==='building'){const result=useBuilding(s,a.building,now);if(result.ok){s.stats.actions++;updateAchievements(s)}return result;}
 if(a.type==='upgrade'){
  if(!buildingNames[a.building])return no('Bina yok.');if(s.buildings[a.building]>=5)return no('En yüksek seviyede.');
  const c=costs(s,a.building);if(!enough(c))return no('Geliştirme malzemeleri eksik.');take(c);s.buildings[a.building]++;gainSkill(s,9,30);advanceQuests(s,'build',a.building);note(s,buildingNames[a.building]+' geliştirildi.');return yes('Bina seviye '+s.buildings[a.building]);
 }
 if(a.type==='harvest'){const result=useBuilding(s,'farm',now);return result.ok?yes(result.message):result;}
  if(a.type==='travel'){
  const to=a.region;if(!Number.isInteger(to)||to<0||to>3)return no('Bölge yok.');if(to===s.region)return no('Zaten buradasın.');
  if(to===1&&s.chapter<1)return no('Önce kıyıdaki görevleri tamamla.');
  if(to>=2&&(s.chapter<2||(!s.ended&&s.route!==to)))return no('Önce Günlük’ten rotanı seç.');
  if(to===2&&!s.inventory[14]&&protection({...s,region:2})<15)return no('Sıcak giysi gerekli.');if(to===3&&!s.inventory[13]&&protection({...s,region:3})<15)return no('Meşale gerekli.');if(!ready(12))return no('Yolculuk için 12 enerji gerekli.');
  spend(s,12-(s.technologies[10]?2:0));gainSkill(s,10,10);s.region=to;s.regionsVisited[to]=true;advanceQuests(s,'explore',to);note(s,regions[to]+' bölgesine geldin.');return yes(regions[to]);
 }
 if(a.type==='explore'){
  if(!ready(10))return no('Araştırmak için 10 enerji gerekli.');spend(s,10-(s.technologies[12]?2:0));
  advanceQuests(s,'explore',s.region);gainSkill(s,12,10);triggerEvent(s,'keşif');if(s.chapter===1&&s.region===1){s.metMira=true;triggerEvent(s,'keşif');return yes('Mira’yı buldun. Günlük’ten konuş.');}
  if(s.chapter===2&&s.route===s.region&&s.route>=2){s.expeditions++;if(s.expeditions>=3){s.lens=true;s.inventory[15]=1;triggerEvent(s,'kule araştırması');s.chapter=3;note(s,'İşaret merceği bulundu!');return yes('Merceği kıyıya götür.')}if(s.expeditions%2===0)triggerEvent(s,'keşif');return yes('Kuleye yaklaşım '+s.expeditions+'/3');}
  return yes(objective(s));
 }
  if(a.type==='choice'){
  if(a.choice!==0&&a.choice!==1)return no('Seçim yok.');const c=a.choice;
  if(s.chapter===0){if(!owned(s,7)||!s.inventory[8]||!s.ate)return no('Önce ateş, su kabı ve yemek görevleri.');s.trust=Math.min(10,s.trust+(c===0?1:0));s.chapter=1;}
  else if(s.chapter===1){if(!s.metMira||!(s.activity['craft:11']||s.inventory[11]||s.helper.hand===11)||!owned(s,12))return no('Mira’yı bul; balta ve barınak üret.');s.trust=Math.max(-10,Math.min(10,s.trust+(c===0?2:-1)));s.chapter=2;}
  else if(s.chapter===2){if(s.route>=0)return no('Rotan zaten seçildi.');s.route=c===0?2:3;s.expeditions=0;}
  else if(s.chapter===3){if(s.region!==0||!owned(s,16))return no('Kıyıda işaret ateşi gerekli.');s.trust=Math.max(-10,Math.min(10,s.trust+(c===0?1:-2)));s.chapter=4;s.ended=true;}
  else return no('Hikâye tamamlandı.');s.storyBeat=Math.min(registry.storyBeats.length-1,s.storyBeat+1);note(s,dialogue(s));return yes(objective(s));
 }
 if(a.type==='event'){const result=applyEvent(s,a.event,a.choice,now);if(result.ok){s.stats.actions++;updateAchievements(s)}return result;}
 if(a.type==='quest')return no('Görevler yaptığın eylemlerle ilerler; günlükten hedefi takip et.');
 return no('Bilinmeyen işlem.');
}
const api={owned,availableTool,gatherSkill,gatherBonus,isTool,toolMatches,temperature,protection,choiceOptions,questTarget,refreshQuests,items,itemData:registry.items,recipes,regions,buildingNames,skills:registry.skills,technologies:registry.technologies,quests:registry.quests,events:registry.events,achievements:registry.achievements,storyBeats:registry.storyBeats,newGame,newGamePlus,validate,migrate,findRecipe,reduce,chance,capacity,used,gatherOptions,objective,dialogue,costs,skillCheck,technologyCost,unlockTechnology,questStatus,completeQuest,advanceQuests,triggerEvent,helperCapacity,helperAmount,applyEvent,useBuilding,updateAchievements,achievementStatus,statistics};
if(typeof module!=='undefined')module.exports=api;else root.Primal=api;
})(typeof globalThis!=='undefined'?globalThis:this);
