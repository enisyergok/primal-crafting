(function(root,factory){
  const value=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=value;
  root.PrimalContent=value;
})(typeof globalThis!=='undefined'?globalThis:this,()=>{
'use strict';

const categories=['Malzeme','Yiyecek','Araç','Yapı','Giysi','Tıp','Süs','Bilgi'];
const regionNames=['Tropik Ada','Orman','Kar Geçidi','Volkan Yolu'];
const toolIds=[-1,0,5,7,11,18];
const items=[];
function addItem(name,category,region,tier,gatherable=false,tags=[]){
  const id=items.length;items.push({id,name,category,region,tier,gatherable,tags});return id;
}
// IDs 0-19 are stable: old saves and the first illustrated screens depend on them.
[
 ['Taş','Malzeme',0,0,true,['mineral']],['Dal','Malzeme',0,0,true,['wood']],['Hindistan cevizi','Yiyecek',0,0,true,['food']],
 ['Yaprak','Malzeme',0,0,true,['fiber']],['Lif','Malzeme',0,0,true,['fiber']],['Keskin taş','Araç',0,1,false,['tool']],
 ['İp','Araç',0,1,false,['fiber']],['Ateş','Yapı',0,1,false,['fire']],['Su kabı','Araç',0,1,false,['container']],
 ['Ceviz eti','Yiyecek',0,1,false,['food']],['Kabuk','Malzeme',0,1,true,['container']],['Taş balta','Araç',1,2,false,['tool','wood']],
 ['Barınak','Yapı',1,2,false,['shelter']],['Meşale','Araç',3,2,false,['tool','light']],['Sıcak giysi','Giysi',2,2,false,['clothing']],
 ['İşaret merceği','Bilgi',2,3,true,['quest']],['İşaret ateşi','Yapı',0,3,false,['fire','quest']],['Odun','Malzeme',1,1,true,['wood']],
 ['Taş mızrak','Araç',1,2,false,['tool','weapon']],['Örgü çanta','Giysi',1,2,false,['bag']]
].forEach(x=>addItem(...x));

const raw=['Kıyı çakılı','Kuru kamış','Palmiye lifi','İnce sarmaşık','Bambu gövdesi','Mavi kil','Kırmızı kil','Kumtaşı','Bazalt parçası','Obsidyen parçası','Kav mantarı','Reçine damlası','Kuru kabuk','Deniz kabuğu','Mercan dalı','Tuz kristali','Kükürt taşı','Demir cevheri','Bakır cevheri','Gümüş cevheri','Kömür parçası','Kireç taşı','Buz parçası','Volkanik kül','Kara kum','Dağ kökü','Çam sakızı','Keten lifi','Yaban otu','Acı yaprak','Gece çiçeği','Kızıl yosun','Sahil yosunu','Gölet sazı','Kaya tuzu','Parlak çakıl'];
const food=['Muz','Turunç','Yabani incir','Dağ meyvesi','Kızıl yemiş','Bal peteği','Yumurta','Yengeç eti','Balık','Midye','Karides','Mantar','Tatlı kök','Acı biber','Yabani domates','Kakao çekirdeği','Kahve çekirdeği','Kurutulmuş et','Dumanlı balık','Kurutulmuş meyve','Meyve özü','Tohum kesesi','Şifalı meyve','Soğuk meyve','Volkan hurması','Kış mantarı','Orman cevizi','Kuru bakla','Sıcak çorba','Baharat karışımı'];
const tool=['Taş bıçak','Kemik iğne','Kemik kanca','Tahta kaşık','Kızıl balta','Kemik balta','Taş çekiç','Taş kazma','Kemik mızrak','Sarmaşık yay','Tahta yay','Balık oltası','Av tuzağı','Dokuma ağ','Kil kase','Kil testi','Saklama sepeti','Büyük sepet','Kömür maşası','Bronz keski','Bakır bız','Gümüş iğne','Demir bıçak','Demir balta','Demir kazma','Demir mızrak','Avcı yayı','Usta bıçak'];
const clothing=['Yaprak pelerin','Lif kemeri','Sarmaşık sandalet','Kürk parçası','Kürk bot','Kürk başlık','Lif zırhı','Kabuk zırhı','Kemik kolye','Taş kolye','Savaş boyası','Kar maskesi','Volkan pelerini','Su geçirmez örtü','Gece örtüsü','Usta kemeri','Avcı çantası','Gezgin pelerini'];
const structures=['Kurutma rafı','Taş ocak','Kil fırını','Lif tezgâhı','Sarmaşık tezgâhı','Balık kurutma alanı','Depo sandığı','Büyük depo','Gözlem kulesi','Harita masası','Köy kapısı','Bekçi kulübesi','Şifacı kulübesi','Takas kulübesi','Tohum yatağı','Sulama kanalı','Duman bacası','Sığınak kapısı','Tören alanı','Anı taşı'];
const medicine=['Şifalı lapa','Yaprak bandajı','Kök çayı','Bal karışımı','Kav merhemi','Soğuk kompres','Sıcak içecek','Ağrı kesici öz','Zehir panzehiri','Enerji iksiri','Su arıtıcı','Uyku karışımı','Kül sabunu','Reçine merhemi','Mantar özü','Kan durdurucu','Kış ilacı','Volkan ilacı','Usta şifası','Hayat tohumu'];
const keepsake=['Kıyı haritası','Eski düğme','Oyma taş','Kırık düdük','Renkli tüy','Balıkçı ipi','Kaptan işareti','Kule güncesi','Mira rozeti','Akın mührü','Köy bayrağı','İlk ateş anısı','Fırtına taşı','Deniz feneri modeli','Ataların boncuğu','Dostluk bilekliği','Usta madalyası','Yeni çağ kitabı'];
const pools=[
  [raw,'Malzeme',0,1,true,'doğadan'],[food,'Yiyecek',0,1,true,'yiyecek'],[tool,'Araç',1,2,false,'alet'],
  [clothing,'Giysi',2,2,false,'donanım'],[structures,'Yapı',1,2,false,'köy'],[medicine,'Tıp',2,2,false,'şifa'],[keepsake,'Süs',3,3,true,'hatıra']
];
for(const [names,category,region,tier,gatherable,tag] of pools){
  for(const name of names){
    if(items.length>=343)break;
    addItem(name,category,region,tier,gatherable,[tag]);
  }
}
const modifiers=['İnce','Sağlam','Oyma','Kurutulmuş','Parlak','Örgü','Keskin','Sıcak','Soğuk','Közlenmiş','Büyük','Usta'];
let modIndex=0;
while(items.length<343){
  const category=categories[items.length%categories.length];
  const region=items.length%4,tier=Math.min(5,1+Math.floor(items.length/70));
  const name=`${modifiers[modIndex++%modifiers.length]} ${category.toLocaleLowerCase('tr-TR')} ${String(items.length).padStart(3,'0')}`;
  addItem(name,category,region,tier,category==='Malzeme'||category==='Yiyecek',[category.toLowerCase()]);
}
// Late-region discoveries are gathered roots for the deep recipe graph even
// when their category is equipment or a keepsake.
items.slice(245).forEach(item=>{item.gatherable=true;item.tags.push('discovery-root')});

const recipes=[];
function addRecipe(name,input,tool,output,skill,level,category,region,extra){
  recipes.push({id:recipes.length,name,input,tool,output,skill,level,category,region,...(extra===undefined?{}:{extra})});
}
addRecipe('Cevizi kır',{2:1},0,9,0,0,'Yiyecek',0,10);
addRecipe('Keskin taş',{0:2},-1,5,1,0,'Araç',0);
addRecipe('İp',{4:3},-1,6,2,0,'Araç',0);
addRecipe('Ateş',{1:3,0:2},-1,7,3,0,'Yapı',0);
addRecipe('Su kabı',{10:1},-1,8,4,0,'Araç',0);
addRecipe('Taş balta',{5:1,1:2,6:1},-1,11,5,17,'Araç',1);
addRecipe('Barınak',{1:6,3:4,6:2},-1,12,6,15,'Yapı',1);
addRecipe('Meşale',{1:2,4:1},7,13,7,12,'Araç',3);
addRecipe('Sıcak giysi',{4:6,3:4,6:2},-1,14,8,15,'Giysi',2);
addRecipe('İşaret ateşi',{1:5,6:2,15:1},7,16,9,12,'Yapı',0);
addRecipe('Taş mızrak',{5:1,1:3,6:1},-1,18,10,20,'Araç',1);
addRecipe('Örgü çanta',{4:6,6:2},-1,19,11,18,'Giysi',1);
const recipeNouns=['Sahil','Orman','Kar','Volkan','Köy','Usta','Gezgin','Mira','Akın','Fırtına','Gölge','Güneş'];
const recipeActions=['hazırlığı','alet seti','erzağı','sığınağı','şifası','haritası','deposu','teçhizatı','takas paketi','keşif kiti','töreni','hatırası'];
for(let output=20;output<=244;output++){
  const previous=output===20?5:output-1;
  const material=245+((output-20)%98);
  const tool=toolIds[1+((output-20)% (toolIds.length-1))];
  const skill=(output-20+3)%15;
  const tier=Math.min(5,2+Math.floor((output-20)/55));
  const category=categories[1+((output-20)%7)];
  const actionByCategory={Yiyecek:'hazırlama',Araç:'işleme',Yapı:'kurulumu',Giysi:'dikimi',Tıp:'hazırlama',Süs:'işçiligi',Bilgi:'derlemesi',Malzeme:'işleme'};
  addRecipe(`${items[output]} · ${actionByCategory[category]||'yapımı'}`,
    {[previous]:1,[material]:1},tool,output,skill,tier*10,category,(output-20)%4);
}

const skillNames=['Üretim','Toplayıcılık','Odunculuk','Avcılık','Balıkçılık','Aşçılık','Dokumacılık','Taş işçiliği','Şifacılık','İnşaat','Haritacılık','Takas','İz sürme','Dayanıklılık','Ustalık'];
const skills=skillNames.map((name,id)=>({id,name,maxLevel:20,xpPerLevel:100+id*20}));
const quests=[];
const questVerbs=['topla','üret','keşfet','götür','yardım et','geliştir','öğren','takas et','hazırla','tamamla'];
for(let i=0;i<87;i++){
  const chapter=Math.min(4,Math.floor(i/18));
  const target=i<recipes.length?recipes[i%recipes.length].output:0;
  quests.push({id:i,name:`${regionNames[chapter%4]} görevi ${i+1}: ${questVerbs[i%questVerbs.length]}`,
    chapter,type:i%5===0?'choice':i%3===0?'explore':'craft',target,amount:1+(i%4),
    prerequisites:i===0?[]:[Math.max(0,i-1)],reward:{xp:25+i*5,skill:i%15,item:(20+i)%343,amount:1}});
}
const events=[];
const eventNames=['Yağmur sonrası izler','Kayıp sepet','Yabancı tüccar','Kırık köprü','Gece ateşi','Yaban arısı','Kar fırtınası','Volkan dumanı','Eski mağara','Köy şöleni','Sessiz göl','Uzak davul'];
for(let i=0;i<24;i++)events.push({id:i,name:eventNames[i%eventNames.length],region:i%4,skill:i%15,choices:[
  {text:'Risk al ve araştır.',delta:{energy:-8,xp:15,trust:i%2?1:0}},
  {text:'Güvenli yolu seç.',delta:{energy:-3,item:(245+i)%343,amount:1}}
]});

function validateRegistry(){
  if(items.length!==343||recipes.length!==237||quests.length!==87||skills.length!==15)throw Error('PRIMAL registry count mismatch');
  const itemIds=new Set(items.map(x=>x.id));
  if(itemIds.size!==items.length||[...itemIds].some((id,i)=>id!==i))throw Error('item IDs are not contiguous');
  const outputs=new Set();
  for(const r of recipes){
    if(r.id<0||r.id>=recipes.length||outputs.has(r.output)||!itemIds.has(r.output))throw Error('invalid recipe output '+r.id);
    outputs.add(r.output);
    if(!Object.keys(r.input).length||!Number.isInteger(r.skill)||r.skill<0||r.skill>=skills.length)throw Error('invalid recipe '+r.id);
    for(const [id,n] of Object.entries(r.input))if(!itemIds.has(+id)||!Number.isInteger(n)||n<1||+id===r.output)throw Error('invalid recipe input '+r.id);
    if(r.tool!==-1&&!itemIds.has(r.tool))throw Error('invalid recipe tool '+r.id);
  }
  return true;
}
validateRegistry();
return {items,recipes,skills,quests,events,categories,regionNames,validateRegistry};
});
