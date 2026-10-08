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
const tool=['Taş bıçak','Kemik iğne','Kemik kanca','Tahta kaşık','Kızıl balta','Kemik balta','Taş çekiç','Taş kazma','Kemik mızrak','Sarmaşık yay','Tahta yay','Balık oltası','Av tuzağı','Dokuma ağ','Kil kase','Kil testi','Saklama sepeti','Büyük sepet','Kömür maşası','Bakır keski','Bakır bız','Gümüş iğne','Demir bıçak','Demir balta','Demir kazma','Demir mızrak','Avcı yayı','Usta bıçak'];
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
// Stable item IDs also identify their illustrated atlas cells.
const families={
 Süs:['Oyma boncuk','Tüy kolye','Kabuk düğme','Kaya mührü','Renkli bileklik','Kaptan rozeti'],
 Bilgi:['Kule haritası','Oyma tablet','Gözcü notu','Kıyı işareti','Mira güncesi','Akın planı'],
 Malzeme:['Kuvars parçası','Kuru kozalak','Kızıl taş','Parlak cevher','Yontulmuş kabuk','Sert kemik','Deniz taşı','Kırmızı toprak','Cam çakıl','Kül topağı'],
 Yiyecek:['Orman yemişi','Tropik şurup','Kavrulmuş tohum','Tuzlu balık','Kök lokması','Bal özü','Kurutulmuş mantar','Dağ meyvesi'],
 Araç:['Yontma bıçak','Lif iğnesi','Kemik kanca','Taş tokmak','Bambu boru','Kabuk kepçe','Örgü ağ','Kömür maşası'],
 Yapı:['Kamp rafı','Taş fırın','Bambu kulübe','Kurutma askısı','Depo rafı','Gözlem direği','Takas tezgâhı'],
 Giysi:['Lif başlık','Kürk pelerin','Kabuk dizlik','Bambu sandalet','Örgü eldiven','Dağ çizmesi','Su geçirmez başlık'],
 Tıp:['Yaprak lapası','Kök şurubu','Reçine kremi','Kül pansumanı','Mantar özü','Şifa demeti','Soğuk merhem']
};
const familyIndex=Object.fromEntries(categories.map(c=>[c,0]));
while(items.length<343){
 const category=categories[items.length%8],index=familyIndex[category]++,family=index%families[category].length;
 const quality=Math.floor(index/families[category].length),base=families[category][family];
 const grade=category==='Malzeme'?['','Saf ','Seçilmiş ','Parlak '][quality]:['Yiyecek','Tıp'].includes(category)?['','Özenle hazırlanmış ','Usta işi ','Özel '][quality]:['','Güçlendirilmiş ','Usta işi ','İnce işlenmiş '][quality];
 addItem(grade+base,category,category==='Malzeme'?[0,1,3,3,0,1,0,0,2,3][family]:1,quality+2,category==='Malzeme',[base]);
 Object.assign(items.at(-1),{family,quality,base});
}
const rawRegions=[0,0,0,1,1,0,1,0,3,3,1,1,0,0,0,0,3,3,3,2,1,0,2,2,1,1,1,1,1,1,1,3,0,0,2,0];
for(let id=20;id<=55;id++)items[id].region=rawRegions[id-20];
for(let id=56;id<=72;id++)items[id].region=[0,0,1,2,1,1,0,0,0,0,0,1,1,3,1,0,1][id-56];
for(const id of [78,79,80,81,82,83,117,173,175,176])items[id].gatherable=true;
for(const id of [73,74,75,76,77,84,85,...Array.from({length:18},(_,i)=>172+i)])items[id].gatherable=false;
for(const id of [173,175,176])items[id].gatherable=true;
items[117].region=1;items[79].region=2;items[80].region=3;items[81].region=2;

// Explicit recipes: ingredients describe the object being made, not an arbitrary ID chain.
const recipes=[];
function addRecipe(output,input,tool=-1,level=0,extra){
 const item=items[output],skill={Malzeme:7,Yiyecek:5,Araç:0,Yapı:9,Giysi:6,Tıp:8,Süs:14,Bilgi:10}[item.category];
 recipes.push({id:recipes.length,name:item.name,input,tool,output,skill,level,category:item.category,region:item.region,...(extra===undefined?{}:{extra})});
 item.gatherable=false;
}
addRecipe(9,{2:1},0,0,10);recipes[0].name='Cevizi kır';
addRecipe(5,{0:2});addRecipe(6,{4:3});addRecipe(7,{1:3,0:2});addRecipe(8,{10:1});
addRecipe(11,{5:1,1:2,6:1},-1,17);addRecipe(12,{1:6,3:4,6:2},-1,15);
addRecipe(13,{1:2,4:1},7,12);addRecipe(14,{4:6,3:4,6:2},-1,15);
addRecipe(16,{1:5,6:2,15:1},7,12);addRecipe(18,{5:1,1:3,6:1},-1,20);addRecipe(19,{4:6,6:2},-1,18);
const authored=[
 [40,{17:2},7], [73,{63:2,35:1},7], [74,{64:2,32:1},7], [75,{56:2,58:1},7],
 [76,{57:2,60:1},0], [77,{70:2},5], [84,{68:2,67:1,8:1},7], [85,{69:1,35:1},0],
 [86,{5:1,1:1,6:1}], [87,{232:1},5], [88,{232:1,6:1},5], [89,{17:1},5],
 [90,{208:2,17:1,6:1},0], [91,{232:2,17:1,6:1},5], [92,{0:2,17:1,6:1}],
 [93,{5:2,17:2,6:1}], [94,{232:2,1:3,6:1},5], [95,{23:3,6:2},5],
 [96,{17:2,6:2},5], [97,{88:1,21:2,6:1}], [98,{17:3,6:2},5],
 [99,{4:8,6:3}], [100,{25:3},7], [101,{26:4},7], [102,{23:4,4:2}],
 [103,{102:1,23:4,6:2}], [104,{17:2},5], [105,{38:3,17:1},7],
 [106,{38:2,1:1},7], [107,{39:2},7], [108,{37:3,17:1},7],
 [109,{37:4,17:2,6:1},7], [110,{37:5,17:2,6:1},7],
 [111,{37:3,1:3,6:1},7], [112,{96:1,23:3,6:2},5], [113,{108:1,29:2},92],
 [114,{3:6,6:2}], [115,{4:5,6:1}], [116,{23:4,6:1}], [118,{117:2,6:2},87],
 [119,{117:1,4:2},87], [120,{4:10,6:3},87], [121,{33:6,6:3},87],
 [122,{232:2,6:1},5], [123,{55:2,6:1},5], [124,{26:1,31:1},0],
 [125,{117:1,47:2},87], [126,{47:6,25:2,6:2},87], [127,{3:6,31:2,6:1}],
 [128,{117:3,6:2},87], [129,{115:1,38:1},87], [130,{117:3,6:3},87],
 [131,{114:1,117:2,6:1},87],
 [132,{17:4,6:2},5], [133,{0:6,25:2}], [134,{26:6,0:4},7],
 [135,{17:6,6:4},5], [136,{24:6,23:4},5], [137,{17:6,6:3,32:2},5],
 [138,{17:8,6:3},5], [139,{138:1,17:12,6:4},92],
 [140,{17:14,6:6},92], [141,{17:5,0:2},5], [142,{17:10,6:4},92],
 [143,{17:12,3:8,6:4},92], [144,{12:1,17:4,3:6},92], [145,{17:8,6:2,3:4},92],
 [146,{25:4,77:1}], [147,{24:6,25:4},5], [148,{26:8,0:2},7],
 [149,{17:6,6:2},92], [150,{0:10,17:6,33:4}], [151,{0:8,55:2},92],
 [152,{48:3,3:1},0], [153,{3:3,4:2}], [154,{45:2,8:1},7],
 [155,{61:1,78:2},0], [156,{30:2,31:1},0], [157,{42:1,3:2}],
 [158,{68:1,69:1,8:1},7], [159,{49:2,45:1},0], [160,{49:1,48:3,61:1},7],
 [161,{72:2,61:1,8:1},7], [162,{40:2,44:2,4:1}], [163,{50:2,8:1},7],
 [164,{43:2,31:1,8:1},7], [165,{31:2,48:2},0], [166,{67:2,8:1},7],
 [167,{3:2,31:1,4:1}], [168,{45:2,81:1,8:1},7], [169,{51:2,78:1},0],
 [170,{152:1,155:1,165:1}], [171,{77:1,170:1}],
 [172,{32:2,40:1},5], [174,{55:1},5], [177,{4:4,31:1}],
 [178,{33:1,6:1},5], [179,{32:4,40:1,6:1},5], [180,{33:2,6:1},5],
 [181,{0:1,31:1},5], [182,{47:5,26:1,6:1},87], [183,{40:1,33:1,6:1}],
 [184,{55:1,39:1},5], [185,{17:3,55:1},5], [186,{25:2,6:1},7],
 [187,{4:3,176:1}], [188,{38:2,39:1},7], [189,{179:1,172:1,47:2},87]
];
for(const [out,input,tool=-1] of authored)addRecipe(out,input,tool,items[out].tier*6);
const familyRecipes={
 Süs:[[174,{6:1}],[176,{6:1}],[33,{6:1}],[0,{31:1}],[4,{26:1}],[178,{39:1}]],
 Bilgi:[[172,{40:1}],[25,{40:1}],[32,{40:1}],[17,{40:1}],[179,{47:1}],[172,{32:1}]],
 Yiyecek:[[60,{35:1}],[76,{61:1}],[77,{35:1}],[64,{35:2}],[68,{35:1}],[61,{57:1}],[67,{35:1}],[59,{61:1}]],
 Araç:[[5,{1:1}],[47,{232:1}],[88,{31:1}],[0,{17:2}],[24,{31:1}],[10,{1:1}],[99,{23:1}],[104,{31:1}]],
 Yapı:[[132,{17:2}],[133,{26:2}],[12,{24:4}],[132,{6:1}],[138,{17:2}],[140,{17:2}],[145,{17:2}]],
 Giysi:[[47,{6:1}],[117,{6:2}],[33,{6:2}],[24,{6:1}],[4,{6:2}],[117,{31:1}],[3,{31:2}]],
 Tıp:[[48,{3:2}],[45,{61:1}],[31,{48:1}],[43,{3:2}],[67,{45:1}],[48,{49:1,50:1}],[42,{31:1}]]
};
const previousFamily={};
for(const item of items.slice(190)){
 if(item.category==='Malzeme')continue;
 const key=item.category+':'+item.family,[base,extras]=familyRecipes[item.category][item.family];
 const previous=previousFamily[key],input=previous===undefined?{[base]:2,...extras}:{[previous]:1,[base]:2+item.quality,...extras};
 const tool=item.category==='Yiyecek'||item.category==='Tıp'?7:item.category==='Giysi'?87:item.category==='Araç'||item.category==='Süs'||item.category==='Bilgi'?5:92;
 // Distinguish visually related products at the workbench.
 if(item.id===204)input[3]=2;
 if(item.id===206)input[33]=3;
 if(item.id===207)input[32]=3;
 addRecipe(item.id,input,tool,12+item.quality*14);previousFamily[key]=item.id;
}
const toolKinds={
 cut:[5,86,108,113],axe:[11,90,91,109],pick:[93,110],hammer:[92],needle:[87,107],
 hunt:[18,94,95,96,98,111,112],fish:[88,97,99],container:[8,100,101],basket:[102,103],tongs:[104],carve:[105,106],spoon:[89],light:[13]
};
for(const [kind,ids] of Object.entries(toolKinds))for(const id of ids)items[id].toolKind=kind;
for(const item of items){
 if(item.base&&item.category==='Araç')item.toolKind=['cut','needle','fish','hammer','container','spoon','fish','tongs'][item.family];
 if(item.id===117){item.category='Malzeme';item.tags=['fur'];}
 if(item.category==='Giysi')item.slot=/çanta|kemeri/i.test(item.name)?'bag':/kolye|boyası/i.test(item.name)?'neck':'body';
 const power=1+(item.quality||0);
 if(item.category==='Yiyecek')item.effect={food:18+item.tier*4,energy:5+power*2,water:/şurup|özü|çorba|meyve|Turunç/i.test(item.name)?8:0};
 if(item.category==='Tıp')item.effect={health:14+item.tier*4,energy:/Enerji|Sıcak|Kök|Uyku|Kış/.test(item.name)?20:5,water:5};
 if(item.category==='Giysi')item.effect={protection:10+power*5,capacity:item.slot==='bag'?4+power*4:0};
 if(item.toolKind)item.effect={gather:power,craft:3+power*2};
 if(item.category==='Yapı')item.effect={capacity:/depo|raf|sandık|sepet/i.test(item.name)?6*power:0,comfort:power};
 if(item.category==='Süs'||item.category==='Bilgi')item.effect={xp:15+power*10};
 item.description=item.category==='Malzeme'?'Üretimde kullanılan doğal kaynak.':item.category==='Yiyecek'?'Yiyerek açlığını ve enerjini yenile.':item.category==='Tıp'?'Kullanarak sağlığını ve enerjini toparla.':item.category==='Giysi'?'Kuşanarak yolculuğa hazırlan.':item.category==='Yapı'?'Kampta kurarak konfor veya depolama kazan.':item.category==='Bilgi'?'İnceleyerek haritacılık deneyimi kazan ve yeni bir tarif ipucu öğren.':item.category==='Süs'?'Koleksiyonuna ekleyerek ustalık deneyimi kazan.':item.toolKind?'Ele tak; toplama verimi ve üretim şansı artar.':'Diğer eşyaların üretiminde kullanılır.';
}
const skillNames=['Üretim','Toplayıcılık','Odunculuk','Avcılık','Balıkçılık','Aşçılık','Dokumacılık','Taş işçiliği','Şifacılık','İnşaat','Haritacılık','Takas','İz sürme','Dayanıklılık','Ustalık'];
const skillActions=['Alet üret','Kaynak topla','Baltayla odun kes','Av aletiyle av malzemesi topla','Olta veya ağla deniz ürünü topla','Yiyecek pişir','Giysi dik','Taş ve maden topla','İlaç hazırla veya kullan','Yapı kur veya köyü geliştir','Yolculuk yap veya belge incele','Köyde malzeme takas et','Bölgede keşif yap','Enerji harcayan eylemler yap','Süs eşyası incele veya araştır'];
const technologyEffects=['Alet üretiminde +8 başarı','Bitki ve lif toplamada +1 kaynak','Odun kesiminde +1 kaynak','Avlanmada +1 kaynak','Balıkçılıkta +1 kaynak','Pişirmede +8 başarı, yemekten +5 açlık','Dikimde +8 başarı, giysiden +5 koruma','Maden toplamada +1 kaynak','İlaçta +8 başarı ve +5 iyileşme','Yapılarda +8 başarı, dinlenmede +5 sağlık','Belge üretiminde +8 başarı, yolculukta 2 daha az enerji','Takasta +1 kaynak','Keşifte 2 daha az enerji','Eylemlerde 1 daha az enerji, +5 çevre koruması','Hatıra üretiminde +8 başarı, araştırmada 2 daha az enerji'];
const skills=skillNames.map((name,id)=>({id,name,maxLevel:20,xpPerLevel:100,action:skillActions[id]}));
const technologies=skills.map((skill,id)=>({id,name:`${skill.name} yolu`,description:technologyEffects[id],prerequisites:id===0?[]:[id-1],skill:id,cost:{17:10+id*3,6:1+Math.floor(id/3),0:2+id}}));
const quests=[];
const questPlan=[
 ['İlk lokma','craft',9,1,0],['Taşı yont','craft',5,1,0],['Lifleri bağla','craft',6,1,0],
 ['Kamp ateşi','craft',7,1,0],['Suyu sakla','craft',8,1,0],['Kıyının dalları','gather',1,6,0],
 ['Ormana ilk adım','explore',1,1,1],['Baltanın sapı','craft',11,1,1],['Mira için barınak','craft',12,1,1],
 ['Kışa hazırlan','craft',14,1,2],['Karanlığa ışık','craft',13,1,2],['Dönüş işareti','craft',16,1,3]
];
for(const [name,type,target,amount,chapter] of questPlan)quests.push({name,type,target,amount,chapter});
for(const id of [20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49]){
 // Charcoal is crafted; collection contracts only request actual gathered resources.
 quests.push({name:items[id].name+' stoku',type:items[id].gatherable?'gather':'craft',target:id,amount:items[id].gatherable?4:1,chapter:items[id].region>=2?2:items[id].region});
}
for(const id of [86,87,88,89,92,93,97,99,100,101,102,103,108,109,110,111,114,118,119,120,121,122,123,125,126,127,130,132,134,135]){
 quests.push({name:items[id].name+' atölyesi',type:'craft',target:id,amount:1,chapter:1});
}
for(const id of [0,1,2,3,4,5,6,7,8,9])quests.push({name:'Adanın tanığı · '+(id+1),type:'event',target:id,amount:1,chapter:0});
for(const target of ['home','workshop','farm','fire','depot'])quests.push({name:buildingLabel(target)+' yaşamı',type:'build',target,amount:1,chapter:1});
function buildingLabel(id){return {home:'Ev',workshop:'Atölye',farm:'Tarla',fire:'Ateş',depot:'Depo'}[id]}
quests.forEach((q,id)=>Object.assign(q,{id,prerequisites:id>0&&id<6?[id-1]:[],reward:{xp:30+q.chapter*10,skill:q.type==='craft'?0:q.type==='gather'?1:q.type==='explore'?10:14,item:4,amount:1}}));
const eventScenes=[
 ['Yağmur sonrası izler','Kıyıda yarısı suya gömülmüş bir sepet buldun.','Sepeti dal yardımıyla çıkar.','Kıyıya vuran lifleri al.'],
 ['Kayıp sepet','Mira’nın erzak sepeti sarmaşıklara takılmış.','Mira için sepeti kurtar.','Yerdeki sarmaşıkları topla.'],
 ['Kar fırtınası','Gözcü kulübesinin çatısı rüzgârda açılıyor.','Çatıyı tutup yolcuya yardım et.','Kayalıkta bekleyip kuru dal topla.'],
 ['Volkan dumanı','Eski patika duman altında; taş işaretler silinmiş.','Geçidi yeniden işaretle.','Güvenli kıyıdan bazalt al.'],
 ['Yabancı tüccar','Kıyıdaki tüccar kayıp teknesini arıyor.','Aramaya katıl.','Takas için deniz kabuğu topla.'],
 ['Kırık köprü','Orman deresindeki ip köprü kopmuş.','Geçiş ipini yeniden bağla.','Kıyıdaki odunları kurtar.'],
 ['Buzdaki iz','Karda küçük bir hayvanın izi kayboluyor.','Hayvanı güvenli yere yönlendir.','Yakındaki kökleri çıkar.'],
 ['Sıcak kaynak','Sıcak suyun yanında terk edilmiş bir kap var.','Kaynağın güvenli yolunu çiz.','Kenardaki mineralleri topla.'],
 ['Gece ateşi','Ufukta bir teknenin ışığı belirdi.','Ateşe dal ekleyerek işaret ver.','Sabah için kabuk biriktir.'],
 ['Yaban arısı','Bal peteği yolun üstünde asılı duruyor.','Dumanla yolu aç.','Düşen yaprakları topla.'],
 ['Eski gözcü','Kar geçidinde bir gözcünün işareti var.','Taşları kaldırıp işareti incele.','Parlak çakılları sakla.'],
 ['Lav kıyısı','Soğumuş lavda yeni bir geçit açılmış.','Geçidi araştır ve haritala.','Girişten obsidyen topla.'],
 ['Köy şöleni','Kıyıdaki kamp sakinleri akşam için hazırlanıyor.','Hazırlıklara yardım et.','Süsleme için kabuk topla.'],
 ['Sessiz göl','Gölün kıyısında ağa takılmış bir kuş var.','Kuşu serbest bırak.','Kıyıdaki sazları topla.'],
 ['Kule kapısı','Kuleye çıkan merdiven karla kapanmış.','Merdiveni temizle.','Donmuş dalları al.'],
 ['Kül bahçesi','Küller arasında yeşeren bir bitki gördün.','Bitkinin çevresini koru.','Yakındaki külü sakla.'],
 ['Uzak davul','Sahildeki eski davul köyü çağırıyor.','Çağrıya cevap ver.','Davulun ipini onaracak lif al.'],
 ['Yaralı gezgin','Bir gezgin ormanda ayağını burkmuş.','Gezgine kampa kadar eşlik et.','Yardım için yaprak topla.'],
 ['Kış barınağı','Terk edilmiş barınakta ayak izleri var.','İçeridekileri kontrol et.','Dışarıdaki kökleri topla.'],
 ['Kızıl mağara','Mağaranın duvarında eski bir harita var.','Haritayı dikkatle incele.','Girişteki kırmızı toprağı al.'],
 ['Dönüş haberi','Bir şişe içinde denizcinin notunu buldun.','Notu köyle paylaş.','Şişenin çevresindeki kabukları al.'],
 ['Orman tohumu','Yağmur, tohumları dereye sürüklüyor.','Tohumları korunaklı yere taşı.','Kıyıda kalan lifleri al.'],
 ['Son gözcü','Karlı tepede eski bir gözcü feneri duruyor.','Feneri temizleyip yol işareti bırak.','Yanındaki taşları sakla.'],
 ['Yeni geçit','Volkan yolunun sonunda kıyıyı gördün.','Yeni yolu köy için haritala.','Geçitten mineral örneği al.']
];
const eventLoot=[4,23,45,28,33,17,45,36,10,3,55,29,33,53,1,43,4,3,45,26,33,4,0,28];
const events=eventScenes.map(([name,text,risk,safe],id)=>({id,name,text,region:id%4,skill:id%15,choices:[
 {text:risk,delta:{energy:-8,xp:25,trust:1}},
 {text:safe,delta:{energy:-3,item:eventLoot[id],amount:2}}
]}));
const achievementSeeds=[
  ['İlk lokma','Ceviz etini üret.'],['Taşın sesi','İlk aletini üret.'],['Barınak kuruldu','İlk barınağı kur.'],
  ['Kaya’nın ortağı','Yardımcıya bir görev ver.'],['Köyün temeli','Bir binayı geliştir.'],['İlk seçim','Bir olayın sonucunu seç.'],
  ['Yüz tarif','100 farklı tarif keşfet.'],['Görev insanı','10 görevi tamamla.'],['Bütün yollar','87 görevi tamamla.'],
  ['Bölüm sonu','Hikâyenin beş bölümünü tamamla.'],['Çok yönlü usta','15 becerinin tamamında seviye kazan.'],
  ['Yeni çağ','Yeni oyun+ yolculuğuna başla.'],['Kıyı gezgini','Dört bölgeyi ziyaret et.'],['Usta zanaatkâr','200 tarif keşfet.'],
  ['Dolu ambar','Bir kaynak yığınını 50 adede çıkar.'],['Hayatta kalan','Sağlığını 10’un üzerinde tutarak 10 gün geçir.'],
  ['Köy bekçisi','Beş binayı da 3. seviyeye çıkar.'],['Olayların tanığı','12 farklı olayı çöz.'],
  ['Derin kökler','5. seviye bir tarif üret.'],['Primal ustası','Tüm başarımları kazan.']
];
const achievements=achievementSeeds.map(([name,description],id)=>({id,name,description}));
const storyBeats=[
  {id:0,chapter:0,speaker:'Akın',text:'Fırtına dindi. Kıyıda bulduğun her şey bir iz bırakır; önce ateşi kur, sonra suyu güvene al.'},
  {id:1,chapter:0,speaker:'Sen',text:'Kıyıdaki kabukları ve dalları ayırdın. Açlığın hafifleyince uzaktan gelen bir çığlık duydun.'},
  {id:2,chapter:1,speaker:'Mira',text:'Ormanın içinden geldim. Kuleye giden yol kapanmış; bizi oraya ulaştıracak bir balta ve sağlam bir barınak gerek.'},
  {id:3,chapter:1,speaker:'Akın',text:'Mira güvenini hemen vermiyor. Yardım etmek için önce onun izlerini takip etmelisin.'},
  {id:4,chapter:2,speaker:'Mira',text:'Kar geçidi sessiz, volkan yolu ise sıcak. İkisi de aynı kuleye çıkar ama hazırlığın farklı olmalı.'},
  {id:5,chapter:2,speaker:'Sen',text:'Haritana iki yol çizdin. Seçimin sadece rotayı değil, köyün gelecekteki kaynaklarını da değiştirecek.'},
  {id:6,chapter:2,speaker:'Akın',text:'Her araştırma bizi gözcü kulesine yaklaştırıyor. Acele etme; enerji, su ve ateş olmadan yol seni yarı yolda bırakır.'},
  {id:7,chapter:3,speaker:'Mira',text:'Mercek bulundu. Şimdi kıyıya dönüp işaret ateşini yakmalıyız; ufuktaki gemi çok uzun beklemeyecek.'},
  {id:8,chapter:3,speaker:'Sen',text:'Köyde kalanların yüzleri aklına geldi. Kurtuluş sadece senin kararın olmayacak.'},
  {id:9,chapter:4,speaker:'Akın',text:'Ateş göğe yükseldi. Bu yolculuk bitti sanıyorsun ama kurduğun her bina yeni bir hikâyenin başlangıcı.'},
  {id:10,chapter:4,speaker:'Mira',text:'Yeni kıyılar, yeni tarifler ve yeni sorular var. Ustalık, vardığın yerde durmak değil, öğrendiğini paylaşmaktır.'},
  {id:11,chapter:4,speaker:'Sen',text:'İkinci yolculuk için çantanı hazırladın. Bu kez ada seni değil, sen adayı değiştireceksin.'}
];

function validateRegistry(){
  if(items.length!==343||recipes.length<200||quests.length!==87||skills.length!==15)throw Error('PRIMAL registry count mismatch');
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
return {items,recipes,skills,technologies,quests,events,achievements,storyBeats,categories,regionNames,validateRegistry};
});
