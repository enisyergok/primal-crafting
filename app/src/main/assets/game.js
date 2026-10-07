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
const chance=(s,r)=>Math.max(25,Math.min(100,100+(s.skill-r.level)*5));
function newGame(now=Date.now()){
 const inventory=Array(items.length).fill(0);inventory[0]=3;inventory[1]=5;inventory[2]=2;inventory[3]=8;inventory[4]=6;inventory[15]=1;inventory[17]=0;
 return {version:3,inventory,health:100,food:80,water:80,energy:100,day:1,minutes:480,
 chapter:0,region:0,trust:0,route:-1,searches:0,expeditions:0,metMira:false,ate:false,lens:false,ended:false,introduced:false,
 skill:12,skills:registry.skills.map(()=>({level:0,xp:0})),tool:-1,durability:{},rng:now>>>0||1234567,discovered:recipes.map((_,i)=>i<3),
 quests:registry.quests.map((q,i)=>({id:q.id,status:i<3?'active':'locked',progress:0})),achievements:[],prestige:0,
 helper:{energy:100,gathering:18,lumber:9,body:-1,hand:-1,bag:-1,job:null},
 buildings:{home:1,depot:1,workshop:1,farm:1,fire:1},journal:['Fırtına seni bu kıyıya getirdi. Usta Akın üretimi öğretecek; ormandan Mira’nın sesi geliyor.'],lastFarm:now};
}
function validate(s){
 const bad=()=>{throw Error('Kayıt bozuk; özgün kayıt korunuyor.')};
 if(!s||s.version!==3||!Array.isArray(s.inventory)||s.inventory.length!==items.length)bad();
 const num=(n,min,max)=>Number.isFinite(n)&&Number.isInteger(n)&&n>=min&&n<=max;
 if(!s.inventory.every(n=>num(n,0,1000000)))bad();
 for(const key of ['health','food','water','energy'])if(!num(s[key],0,100))bad();
 for(const [key,min,max] of [['day',1,1000000],['minutes',0,1439],['chapter',0,4],['region',0,3],['route',-1,3],['skill',0,100],['tool',-1,19],['searches',0,1000000],['expeditions',0,3],['trust',-10,10],['rng',0,4294967295]])if(!num(s[key],min,max))bad();
 if(!s.buildings||!s.helper||!s.durability||!Array.isArray(s.discovered)||s.discovered.length!==recipes.length||!s.discovered.every(b=>typeof b==='boolean'))bad();
 if(!Array.isArray(s.skills)||s.skills.length!==registry.skills.length||!s.skills.every(x=>x&&num(x.level,0,20)&&num(x.xp,0,1000000)))bad();
 if(!Array.isArray(s.quests)||s.quests.length!==registry.quests.length||!s.quests.every(x=>x&&num(x.id,0,registry.quests.length-1)&&['locked','active','complete','failed'].includes(x.status)&&num(x.progress,0,1000000)))bad();
 if(!Array.isArray(s.achievements)||!s.achievements.every(x=>Number.isInteger(x)&&x>=0))bad();
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
 for(const k of ['health','food','water','energy','chapter','region','trust','route','day','minutes','searches','expeditions','metMira','ate','lens','ended','introduced'])if(old[k]!==undefined)s[k]=old[k];
 if(Array.isArray(old.inventory))old.inventory.slice(0,20).forEach((n,i)=>s.inventory[i]=n);
 if(Array.isArray(old.journal))s.journal=old.journal.slice(-80);
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
function dialogue(s){return [
 'Akın: Önce ateşi ve su kabını hazırlayalım. Bir taşı eline alıp cevizi kır; kabuğunu sakla. Ormandaki çağrıya güçlü çıkmalısın.',
 s.metMira?'Mira: Bacağım yaralı. Kuledeki mercekle gemilere işaret verebiliriz. Beni yanında götürecek misin?':'Akın: Baltanı hazırla. Ormanda yardım isteyen birini duydum.',
 s.route<0?'Mira: Kuleye iki yol var. Kar geçidinde sıcak giysi, volkan yolunda meşale gerekecek. Hangisini seçiyorsun?':'Mira: Seçtiğin yolda üç araştırma bizi gözcü kulesine ulaştıracak.',
 'Mira: Ufukta bir yelken! Kıyıda ateşi yak. Birlikte mi ayrılacağız?',
 s.trust>=2?'Birlikte kurtuldunuz. SON — Birlikte doğan gün.':'Gemi seni aldı; geride kalan çağrıyı unutmadın. SON — Yalnız ufuk.'
 ][s.chapter]}
function costs(s,b){const n=s.buildings[b];return {17:20*n,6:2*n,0:3*n}}
function reduce(s,a,now=Date.now()){
 const no=message=>({ok:false,message});const yes=message=>({ok:true,message});
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
  if(success){s.inventory[r.out]++;if(r.extra!==undefined)s.inventory[r.extra]++;s.discovered[a.recipe]=true;if(r.out===11||r.out===18)s.durability[r.out]=25;note(s,r.name+' üretildi.');return yes(r.name+' üretildi!')}
  s.skill=Math.min(100,s.skill+2);note(s,'Deneme başarısız; ustalık +2.');return yes('Üretim tutmadı. Ustalık +2; sonraki denemede şansın arttı.');
 }
 if(a.type==='gather'){
  if(!ready(8))return no('Toplamak için 8 enerji gerekli.');
  if(a.kind==='wood'&&(s.tool!==11||!s.inventory[11]))return no('Odun kesmek için taş baltanı ele tak.');
  const drops=[[0,1,2,3,4],[1,4,3,0,2],[0,1,4],[0,1,0,4]];
  const id=a.kind==='wood'?17:drops[s.region][s.searches%drops[s.region].length];
  if(!s.inventory[id]&&used(s)>=capacity(s))return no('Depo dolu.');spend(s,8);s.searches++;s.inventory[id]+=2;if(a.kind==='wood')wear(s,11);
  if(s.chapter===1&&s.region===1)s.metMira=true;return yes(items[id]+' +2');
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
  s.helper.energy-=20;const amount=Math.min(s.helper.bag===19?16:8,4+a.minutes-1);
  s.helper.job={resource:a.resource,amount,start:now,until:now+a.minutes*60000};return yes('Kaya yola çıktı. Oyun kapalıyken de süre ilerler.');
 }
 if(a.type==='collect'){
  const j=s.helper.job;if(!j)return no('Bekleyen keşif yok.');if(now<j.until)return no('Kaya henüz dönmedi.');
  if(!s.inventory[j.resource]&&used(s)>=capacity(s))return no('Depoda yer aç; ganimet korunuyor.');
  s.inventory[j.resource]+=j.amount;s.helper.gathering=Math.min(100,s.helper.gathering+1);if(j.resource===17)s.helper.lumber=Math.min(100,s.helper.lumber+1);s.helper.job=null;note(s,'Kaya '+j.amount+' '+items[j.resource]+' getirdi.');return yes('Kaynaklar depoya alındı.');
 }
 if(a.type==='helperEquip'){
  const valid={hand:[11,18],body:[14],bag:[19]};if(s.helper.job)return no('Kaya dönünce ekipmanını değiştir.');
  if(!valid[a.slot]||!valid[a.slot].includes(a.item)||!s.inventory[a.item])return no('Bu ekipman sende yok.');
  if(s.helper[a.slot]>=0)s.inventory[s.helper[a.slot]]++;s.inventory[a.item]--;s.helper[a.slot]=a.item;
  if(s.tool===a.item&&!s.inventory[a.item])s.tool=-1;return yes('Kaya’nın ekipmanı güncellendi.');
 }
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
  spend(s,12);s.region=to;note(s,regions[to]+' bölgesine geldin.');return yes(regions[to]);
 }
 if(a.type==='explore'){
  if(!ready(10))return no('Araştırmak için 10 enerji gerekli.');spend(s,10);
  if(s.chapter===1&&s.region===1){s.metMira=true;return yes('Mira’yı buldun. Günlük’ten konuş.');}
  if(s.chapter===2&&s.route===s.region&&s.route>=2){s.expeditions++;if(s.expeditions>=3){s.lens=true;s.inventory[15]=1;s.chapter=3;note(s,'İşaret merceği bulundu!');return yes('Merceği kıyıya götür.')}return yes('Kuleye yaklaşım '+s.expeditions+'/3');}
  return yes(objective(s));
 }
 if(a.type==='choice'){
  if(a.choice!==0&&a.choice!==1)return no('Seçim yok.');const c=a.choice;
  if(s.chapter===0){if(!s.inventory[7]||!s.inventory[8]||!s.ate)return no('Önce ateş, su kabı ve yemek görevleri.');s.trust+=c===0?1:0;s.chapter=1;}
  else if(s.chapter===1){if(!s.metMira||!s.inventory[11]||!s.inventory[12])return no('Mira’yı bul; balta ve barınak üret.');s.trust+=c===0?2:-1;s.chapter=2;}
  else if(s.chapter===2){if(s.route>=0)return no('Rotan zaten seçildi.');s.route=c===0?2:3;s.expeditions=0;}
  else if(s.chapter===3){if(s.region!==0||!s.inventory[16])return no('Kıyıda işaret ateşi gerekli.');s.trust+=c===0?1:-2;s.chapter=4;s.ended=true;}
  else return no('Hikâye tamamlandı.');note(s,dialogue(s));return yes(objective(s));
 }
 return no('Bilinmeyen işlem.');
}
const api={items,recipes,regions,buildingNames,skills:registry.skills,quests:registry.quests,events:registry.events,newGame,validate,migrate,findRecipe,reduce,chance,capacity,used,objective,dialogue,costs};
if(typeof module!=='undefined')module.exports=api;else root.Primal=api;
})(typeof globalThis!=='undefined'?globalThis:this);
