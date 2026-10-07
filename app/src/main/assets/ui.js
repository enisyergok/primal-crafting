(function(){
'use strict';
const P=globalThis.Primal;let state=load();let page='camp';let selectedRecipe=0;let selectedTool=-1;let selectedResource=0;let selectedBuilding='depot';let materialSelection=[];let notice='';let dragId=null;let pointerDrag=null;let suppressClickUntil=0;
let audioContext=null;
const $=s=>document.querySelector(s), esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const artInk='#5a351a';
const rasterIcons={
  0:[1,0,0],1:[1,1,0],3:[1,2,0],4:[1,3,0],10:[1,0,1],17:[1,1,1],20:[1,2,1],21:[1,3,1],22:[1,0,2],23:[1,1,2],24:[1,2,2],25:[1,3,2],26:[1,0,3],27:[1,1,3],28:[1,2,3],29:[1,3,3],
  30:[2,0,0],31:[2,1,0],32:[2,2,0],33:[2,3,0],34:[2,0,1],35:[2,1,1],36:[2,2,1],37:[2,3,1],38:[2,0,2],39:[2,1,2],40:[2,2,2],41:[2,3,2],42:[2,0,3],43:[2,1,3],44:[2,2,3],45:[2,3,3],
  46:[3,0,0],47:[3,1,0],48:[3,2,0],49:[3,3,0],50:[3,0,1],51:[3,1,1],52:[3,2,1],53:[3,3,1],54:[3,0,2],55:[3,1,2]
};
function rasterIcon(id,cls){const [sheet,col,row]=rasterIcons[id];const x=col*33.333333,y=row*33.333333;return `<span class="item-art raster-art ${cls}" style="background-image:url('art/materials-0${sheet}.png');background-position:${x}% ${y}%;background-size:400% 400%" aria-hidden="true"></span>`}
function itemArt(id){
 const item=P.itemData?.[id]||{};const name=(item.name||P.items[id]||'').toLocaleLowerCase('tr-TR');const category=item.category||'Malzeme';const hue=(id*37)%360;const fill=`hsl(${hue} 42% 62%)`;
 const wrap=body=>`<svg viewBox="0 0 80 80" role="img" aria-label="${esc(P.items[id])}" xmlns="http://www.w3.org/2000/svg"><g stroke="${artInk}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
 if(category==='Yiyecek'||item.tags?.includes('food')){
  if(/balık|fish|yengeç|karides|midye/.test(name))return wrap(`<path fill="${fill}" d="M12 42c12-16 35-16 48 0-13 16-36 16-48 0Z"/><path fill="${fill}" d="m60 42 13-11v22L60 42Z"/><circle fill="#fff1bd" cx="27" cy="37" r="3"/>`);
  if(/mantar|mushroom/.test(name))return wrap(`<path fill="#c66a4b" d="M12 39c2-17 23-24 36-14 5 4 8 9 8 14H12Z"/><path fill="#e7bc82" d="M30 39h12v25H30z"/><path fill="#fff1bd" d="M20 31h5m13-5h5m5 10h4"/>`);
  if(/çorba|içecek|çay|kahve|öz|iksir|karışım/.test(name))return wrap(`<path fill="#b97642" d="M20 33h40l-4 30H24l-4-30Z"/><path fill="#dba45e" d="M17 30h46c0 7-8 10-23 10S17 37 17 30Z"/><path d="M30 21c-4-7 5-8 1-15m12 15c-4-7 5-8 1-15" fill="none"/>`);
  return wrap(`<path fill="${fill}" d="M20 48c-8-17 9-31 22-22 2-8 17-5 18 8 12 4 7 20-5 21-11 8-29 4-35-7Z"/><path fill="#5b8b3c" d="m39 28 5-12 9 5-7 9"/>`);
 }
 if(category==='Araç'||item.tags?.includes('tool')){
  if(/balta|axe/.test(name))return wrap(`<path d="M22 64 52 17" stroke-width="6"/><path fill="#9f6040" d="M47 27c9-15 19-12 20-5-8 8-15 10-20 5Z"/>`);
  if(/bıçak|keski|kazma|çekiç|maşa/.test(name))return wrap(`<path d="M19 62 49 32" stroke-width="6"/><path fill="#aeb7b2" d="m43 27 24-8-14 20-12-2Z"/>`);
  if(/mızrak|spear|iğne|bız|kanca|olta/.test(name))return wrap(`<path d="M19 66 59 19" stroke-width="4"/><path fill="#aeb7b2" d="m57 19 12-7-6 13Z"/><path fill="#b97642" d="m16 65 8-2-5 8Z"/>`);
  if(/sepet|çanta|basket|bag|kase|testi|kap/.test(name))return wrap(`<path fill="#a96d32" d="M17 31h46l-5 32H22l-5-32Z"/><path d="M25 31c0-20 30-20 30 0M22 42h36M25 52h30" fill="none"/>`);
  return wrap(`<path fill="#b97642" d="M20 57 47 30l12 12-27 27Z"/><path fill="#b9c4c0" d="m43 26 13-10 11 11-10 13Z"/>`);
 }
 if(category==='Giysi')return wrap(`<path fill="${fill}" d="m27 18 13 8 13-8 12 13-9 9v27H24V40l-9-9 12-13Z"/><path d="M40 26v41M24 42h32" fill="none"/>`);
 if(category==='Yapı'){
  if(/kule|kapı|kulübe|sığınak|alanı/.test(name))return wrap(`<path fill="#b9783d" d="M17 65V35l23-20 23 20v30Z"/><path fill="#8a4f2a" d="m12 37 28-25 28 25-6 6-22-19-22 19Z"/><path fill="#efd18d" d="M34 65V48h12v17Z"/>`);
  return wrap(`<path fill="#a86a31" d="M16 36h48v31H16z"/><path fill="#8d4b26" d="m10 37 30-25 30 25-6 7-24-20-24 20Z"/><path fill="#efd18d" d="M34 67V50h12v17Z"/>`);
 }
 if(category==='Tıp')return wrap(`<path fill="#e7d1a1" d="M29 24h22v40H29z"/><path fill="#b85c4b" d="M34 17h12v12H34z"/><path d="M35 43h10M40 38v10" stroke="#fff1bd" stroke-width="4"/>`);
 if(category==='Bilgi')return wrap(`<path fill="#d6a760" d="M19 18h38v48H19z"/><path fill="#f7e5ad" d="M25 25h26v4H25zm0 10h20v4H25zm0 10h25v4H25z"/>`);
 if(category==='Süs')return wrap(`<circle fill="${fill}" cx="40" cy="35" r="18"/><path fill="#e9c86e" d="m40 17 5 13 14 5-14 5-5 13-5-13-14-5 14-5Z"/>`);
 if(item.tags?.includes('fiber')||/lif|kamış|sarmaşık|ot|kök|yosun/.test(name))return wrap(`<path d="M18 62c15-17 30-24 45-44M21 64c12-12 25-15 38-18M28 67c11-8 21-8 31-7" fill="none" stroke="#98703f" stroke-width="5"/><path d="M27 48 18 39m17 2-6-12m17 3-1-13" fill="none" stroke="#6b8b43" stroke-width="5"/>`);
 if(item.tags?.includes('wood')||/dal|odun|bambu|tahta|ağaç/.test(name))return wrap(`<path d="M18 61 61 19" stroke="#8c542e" stroke-width="8"/><path d="m37 42 4-19m8 11 15-9" fill="none" stroke="#8c542e" stroke-width="6"/><path d="M23 59 58 24" stroke="#d29a55"/>`);
 if(item.tags?.includes('container')||/kabuk|deniz|mercan|kil/.test(name))return wrap(`<path fill="#b97b48" d="M17 34c4 22 42 22 46 0-7 8-39 8-46 0Z"/><path fill="#efd09a" d="M17 34c3-12 43-12 46 0-9 8-37 8-46 0Z"/>`);
 return wrap(`<path fill="${fill}" d="m14 47 12-28 32-6 10 27-20 22-28-4Z"/><path d="m28 25 16 12 14-18" fill="none" stroke="#e8d2a0"/>`);
}
const icon=(id,cls='')=>rasterIcons[id]?rasterIcon(id,cls):id<24?`<span class="sprite ${cls}" style="background-position:${(id%6)*20}% ${Math.floor(id/6)*33.333}%" aria-hidden="true"></span>`:`<span class="item-art ${cls}" aria-hidden="true">${itemArt(id)}</span>`;
const button=(label,attrs='',cls='secondary')=>`<button class="${cls}" ${attrs}>${label}</button>`;
function load(){
  try {
    const raw=globalThis.AndroidStore?AndroidStore.read('auto'):localStorage.getItem('primal-auto');
    if(!raw)return P.newGame(Date.now());
    try{return P.validate(JSON.parse(raw));}
    catch(jsonError){
      if(raw.trim().startsWith('{')){
        const legacy=JSON.parse(raw);
        if(legacy.version===2||legacy.version===3||(Array.isArray(legacy.inventory)&&legacy.inventory.length< P.items.length)){
          notice='Eski PRIMAL kaydı geniş içerik sistemine aktarıldı.';return P.migrate(legacy);
        }
      }
      if(raw.includes('version=1')){
        const old={inventory:[],journal:[]};
        raw.split(/\r?\n/).forEach(line=>{
          const m=line.match(/^v(\d+)=(.*)$/);if(m)old[['chapter','region','health','food','water','energy','minutes','day','trust','route','searches'][+m[1]]] = +m[2];
          const i=line.match(/^i(\d+)=(.*)$/);if(i)old.inventory[+i[1]]=+i[2];
        });
        notice='Eski kayıt yeni sisteme aktarıldı.';return P.migrate(old);
      }
      throw jsonError;
    }
  } catch(e){notice=e.message;return P.newGame(Date.now());}
}
function save(slot='auto'){const raw=JSON.stringify(state);try{if(globalThis.AndroidStore)AndroidStore.write(slot,raw);else localStorage.setItem('primal-'+slot,raw)}catch(e){notice='Kayıt yazılamadı.'}}
function snapshot(){return JSON.parse(JSON.stringify(state))}
function dispatch(action){return act(action)}
globalThis.app={snapshot,dispatch};
function sound(kind){try{audioContext=audioContext||new (globalThis.AudioContext||globalThis.webkitAudioContext)();const oscillator=audioContext.createOscillator(),gain=audioContext.createGain();oscillator.type='triangle';oscillator.frequency.value=kind==='craft'?520:kind==='error'?170:330;gain.gain.setValueAtTime(.035,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.09);oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start();oscillator.stop(audioContext.currentTime+.1)}catch(e){/* sound is an enhancement; gameplay must not depend on it */}}
function act(action){const result=P.reduce(state,action,Date.now());notice=result.message;if(result.ok){sound(action.type==='craft'?'craft':'ok');save();render()}else{sound('error');toast(notice)}return result}
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2600)}
function stat(symbol,label,value,cls=''){return `<div class="stat"><span class="symbol ${cls}">${symbol}</span><b>${label}</b><small>${value}</small></div>`}
function render(){
 const time=String(Math.floor(state.minutes/60)).padStart(2,'0')+':'+String(state.minutes%60).padStart(2,'0');
 $('#header').innerHTML=`<div class="day"><b>Gün ${state.day}</b>${time}</div><div class="header-tools">${button('▤','id="recipe-head"','')} ${button('⚙','id="settings"','')}</div><div class="portrait hero"></div><div class="region">${esc(P.regions[state.region])} · Bölüm ${state.chapter+1}</div>`;
 $('#stats').innerHTML=stat('❤','Sağlık',`${state.health}/100`,'heart')+stat('⌁','Açlık',`${state.food}/100`)+stat('💧','Susuzluk',`${state.water}/100`,'water')+stat('ϟ','Enerji',`${state.energy}/100`,'energy')+stat('♨','Sıcaklık','36 °C','temp');
 const names={camp:'Kamp',recipes:'Tarifler',helper:'Yardımcı',village:'Köy',map:'Harita',journal:'Günlük'};
 $('#content').dataset.page=page;$('#content').innerHTML=page==='camp'?camp():page==='recipes'?recipes():page==='helper'?helper():page==='village'?village():page==='map'?map():journal();
 $('nav').innerHTML=Object.entries(names).map(([id,n])=>`<button data-nav="${id}" class="${id===page?'active':''}">${navIcon(id)}<span>${n}</span></button>`).join('');
 document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{page=b.dataset.nav;render()});
 bind();if(notice){toast(notice);notice=''}
}
function navIcon(id){return id==='camp'?icon(0,'mini'):id==='recipes'?icon(22,'mini'):id==='helper'?icon(18,'mini'):id==='village'?icon(23,'mini'):id==='map'?icon(15,'mini'):icon(21,'mini')}
function tabs(active){return `<div class="tabs">${['all','food','tool','building'].map((x,i)=>`<button class="${active===x?'active':''}" data-filter="${x}">${['Tümü','Yiyecek','Araç','Yapı'][i]}</button>`).join('')}</div>`}
function gatheringPanel(){
 const options=P.gatherOptions(state),shown=options.slice(0,8),extra=options.slice(8),axe=state.tool===11&&state.inventory[11]>0;
 return `<section class="panel gathering-panel"><div class="row"><div class="grow"><h2>Kaynak toplama</h2><p class="muted">${esc(P.regions[state.region])} · Dokunarak kaynak topla. Aleti ele takınca özel kaynaklar açılır.</p></div>${button(axe?'Odun kes':'Topla',axe?'data-gather-kind="wood"':'data-gather="1"','wood')}</div><div class="gather-grid">${shown.map(id=>button(`${icon(id,'mini')} ${esc(P.items[id])}`,`data-gather-resource="${id}"`,'secondary')).join('')}</div>${extra.length?`<details><summary>Diğer kaynaklar · ${extra.length}</summary><div class="gather-grid">${extra.map(id=>button(`${icon(id,'mini')} ${esc(P.items[id])}`,`data-gather-resource="${id}"`,'secondary')).join('')}</div></details>`:''}</section>`;
}
function camp(){
 const ids=state.inventory.map((n,i)=>n?i:-1).filter(i=>i>=0);return `<h1>Kamp ve envanter</h1>${tabs('all')}<div class="inventory">${ids.map(id=>itemCard(id)).join('')}</div>
 <section class="panel"><h2>Üretim masası</h2><div class="workbench"><div><h3>Malzeme</h3><div id="material-drop" class="dropzone" data-drop="material">${materialSelection.length?materialSelection.map(id=>`<span class="chip">${icon(id,'mini')}<b>${esc(P.items[id])}</b></span>`).join(''):'<span class="hint">Malzemeleri buraya sürükle</span>'}${materialSelection.length?button('Temizle','data-clear-material="1"','secondary'):''}</div></div><div><h3>Alet</h3><select id="tool-select" class="tool-select"><option value="-1">El ile</option>${[0,5,7,11,18].filter(i=>state.inventory[i]).map(i=>`<option value="${i}" ${selectedTool===i?'selected':''}>${esc(P.items[i])}</option>`).join('')}</select></div></div>${button('✦ Üret','id="craft-now"','wood primary')}<div class="task">⚑ ${esc(P.objective(state))}</div></section>${gatheringPanel()}
 <div class="actions">${button('🍖 Ye','id="eat"')}${button('💧 Su iç','id="drink"')}${button('☼ Dinlen','id="rest"')}${button('⌁ Keşif','id="explore"')}</div>`
}
function itemCard(id){const r=P.recipes.findIndex(x=>x.out===id);return `<button class="item" draggable="true" data-item="${id}" aria-label="${esc(P.items[id])}, adet ${state.inventory[id]}">${icon(id)}<span class="name">${esc(P.items[id])}</span><b class="count">${state.inventory[id]}</b>${r>=0&&state.discovered[r]?'<small class="badge">tarif</small>':''}</button>`}
function recipeParts(r){return Object.entries(r.input).map(([id,n])=>`<span>${icon(+id,'mini')} ${esc(P.items[id])} ${state.inventory[id]||0}/${n}</span>`).join('')}
function recipes(){
 const r=P.recipes[selectedRecipe]||P.recipes[0];const required=r.tool<0?'El':P.items[r.tool];return `<h1>Tarif defteri</h1>${tabs(r.category==='Yiyecek'?'food':r.category==='Yapı'?'building':'tool')}<section class="panel center"><h2>${esc(r.name)}</h2><p class="muted">${esc(r.hint)}</p><div class="inputs">${Object.entries(r.input).map(([id,n])=>`<div class="ingredient panel">${icon(+id)}<b>${esc(P.items[id])}</b><span class="qty ${state.inventory[id]>=n?'good':'bad'}">${state.inventory[id]||0}/${n}</span></div>`).join('')}</div><div class="arrows">↓ ↓ ↓</div><div class="craft-output"><div class="slot result">${icon(r.out)}</div><div class="facts">Başarı <b class="good">%${P.chance(state,r)}</b><br/>Beceri ${state.skill}<br/>Enerji −5</div><div class="slot">Alet<br/><select id="recipe-tool" class="select"><option value="-1">El</option>${[0,5,7,11,18].filter(i=>state.inventory[i]).map(i=>`<option value="${i}" ${state.tool===i?'selected':''}>${P.items[i]}</option>`).join('')}</select>${r.tool>=0?button(`Tak: ${required}`,'id="equip-required" data-required-tool="'+r.tool+'"','secondary'):''}</div></div>${button('Üret','id="craft-now"','wood primary')}</section><h2 class="subheading">Tarifler</h2><input id="recipe-search" class="recipe-search" type="search" placeholder="Tarif veya malzeme ara…" aria-label="Tarif ara"/>${P.recipes.map((x,i)=>`<article class="recipe-card ${state.discovered[i]?'':'unknown'}" data-recipe-category="${x.category}" data-recipe-name="${esc((x.name+' '+x.hint).toLocaleLowerCase('tr-TR'))}" data-open-recipe="${i}">${icon(x.out)}<div class="grow"><h3>${state.discovered[i]?esc(x.name):'Bilinmeyen tarif'}</h3><p class="description">${state.discovered[i]?esc(x.hint):'Malzemeleri farklı aletlerle birleştirerek keşfet.'}</p><div class="recipe-parts">${state.discovered[i]?recipeParts(x):'<span>◆ ?</span><span>◆ ?</span><span>◆ ?</span>'}</div></div>${state.discovered[i]?button('Üret',`data-craft-recipe="${i}"`,'secondary'):'<span class="badge">? keşfet</span>'}</article>`).join('')}<div class="panel center">Taş ${icon(0,'mini')} → Keskin taş ${icon(5,'mini')} → Taş balta ${icon(11,'mini')} → Taş mızrak ${icon(18,'mini')}</div>`
}
function helper(){const h=state.helper;return `<h1>Yardımcı · Kaya</h1><section class="panel"><div class="row"><div class="portrait helper-face" style="background-position:50% 0"></div><div class="grow"><h2>Kaya <small>Seviye ${Math.floor(h.gathering/10)+1}</small></h2><div class="meter"><i style="width:${h.energy}%"></i></div><small>Enerji ${h.energy}/100 · Toplama ${h.gathering} · Odunculuk ${h.lumber}</small></div></div><div class="equipment">${equip('Baş','body',h.body)}${equip('El','hand',h.hand)}${equip('Çanta','bag',h.bag)}${equip('Yuva','hand',h.hand)}</div><h3 class="subheading">Gönderilecek kaynak</h3><div class="resource-choice">${[[0,'Taş'],[17,'Odun'],[2,'Meyve']].map(([id,n])=>button(`${icon(id,'mini')}<br/>${n}`,`data-resource="${id}"`,selectedResource===id?'secondary chosen':'secondary')).join('')}</div><div class="save-row"><select id="job-length" class="select"><option value="1">5 dk</option><option value="5">10 dk</option><option value="10">20 dk</option></select>${button('Toplamaya gönder','id="send-helper"','wood')}</div>${h.job?`<div class="task">Kaya yolda · ${P.items[h.job.resource]} · ${Math.max(0,Math.ceil((h.job.until-Date.now())/60000))} dk kaldı ${button('Döndüyse teslim al','id="collect-helper"','secondary')}</div>`:''}<p class="muted">Çanta kapasitesi: ${P.helperCapacity(state)} · El aleti ve çanta yardımcının toplama verimini artırır.</p></section><section class="panel"><h2>Yardımcıyı besle</h2>${button('Ceviz eti ver','id="feed-helper"','secondary')}</section>`}
function equip(name,slot,id){const candidates={hand:[11,18],body:[14],bag:[19]}[slot]||[];const available=candidates.filter(i=>state.inventory[i]>0||i===id);return `<div class="slot equip-slot">${id>=0?icon(id):'<span class="empty-slot">＋</span>'}<small>${name}</small>${id>=0?`<br/><span class="good">${state.durability[id]||100}/100</span>`:''}${available.map(i=>button(id===i?`Takılı: ${P.items[i]}`:`Tak: ${P.items[i]}`,`data-helper-equip="${slot}:${i}"`,'secondary')).join('')}</div>`}
function village(){const b=state.buildings,sel=selectedBuilding,title=P.buildingNames[sel],cost=P.costs(state,sel),upgrade=sel==='depot'||sel==='workshop';const action=sel==='farm'?button('Hasadı topla','data-building-action="1"','wood'):button(sel==='home'?'Dinlen ve iyileş':sel==='fire'?'Ateş alanını kullan':`${title} geliştir`,'data-building-action="1"','wood');return `<h1>Köy · Seviye ${Math.max(...Object.values(b))}</h1><div class="village-scene">${[['home','Ev','left:8%;top:15%'],['depot','Depo','right:8%;top:19%'],['workshop','Atölye','left:8%;bottom:22%'],['farm','Tarla','right:10%;bottom:21%'],['fire','Ateş alanı','left:40%;bottom:8%']].map(([id,n,style])=>`<button class="hotspot ${sel===id?'selected':''}" style="${style}" data-building="${id}">${n}<small>Seviye ${b[id]}</small></button>`).join('')}</div><section class="panel"><h2>${title}</h2><p>${sel==='depot'?'Daha fazla kaynak saklamanı sağlar.':sel==='workshop'?'Yeni üretim zincirlerinin merkezidir.':sel==='farm'?'Her beş dakikada yiyecek yetiştirir.':sel==='fire'?'Isınır, enerji ve sağlık kazanırsın.':'Güvenli dinlenme ve toparlanma alanıdır.'}</p>${sel==='depot'?`<div class="row"><b>Kapasite ${P.used(state)}/${P.capacity(state)}</b><span class="good">→ ${P.capacity(state)+8}</span></div>`:''}${upgrade?`<p class="muted">Gerekli: Odun ${state.inventory[17]||0}/${cost[17]||0} · İp ${state.inventory[6]||0}/${cost[6]||0} · Taş ${state.inventory[0]||0}/${cost[0]||0}</p>`:''}${action}</section>`}
function map(){return `<h1>Keşif ve bölgeler</h1><div class="map-art" aria-label="PRIMAL bölge haritası"></div><section class="panel"><p class="muted">Bölge seç; hikâye ilerledikçe yeni geçitler ve kaynaklar açılır. Enerji bedeli: 12.</p>${P.regions.map((name,i)=>`<button class="recipe-card ${state.region===i?'selected':''}" data-travel-region="${i}">${icon(15+i,'mini')}<span class="grow"><b>${esc(name)}</b><br/><small>${state.regionsVisited?.[i]?'Keşfedildi':'Bilinmiyor'} · ${i===0?'Kıyı kampı':i===1?'Mira’nın ormanı':i===2?'Kar geçidi':'Volkan yolu'}</small></span>${state.region===i?'<b>Buradasın</b>':'<span>→</span>'}</button>`).join('')}</section><section class="panel"><h2>Mevcut hedef</h2><p>${esc(P.objective(state))}</p></section>`}
function eventPanel(){const e=P.events.find(x=>state.events[x.id]&&state.events[x.id].active&&!state.events[x.id].resolved);if(!e)return '<section class="panel"><h2>Olay günlüğü</h2><p class="muted">Şimdilik sakin. Keşif yaptıkça yeni olaylar açılacak.</p></section>';return `<section class="panel"><h2>${esc(e.name)}</h2><p class="muted">Bu olayın sonucu gelecekteki kaynakları ve güveni etkiler.</p><div class="actions">${e.choices.map((c,i)=>button(esc(c.text),`data-event="${e.id}" data-event-choice="${i}"`,'secondary')).join('')}</div></section>`}
function skillPanel(){const techs=P.technologies||[];return `<section class="panel"><h2>15 beceri</h2><div class="recipe-parts">${P.skills.map((s,i)=>`<span>${esc(s.name)} ${state.skills[i].level}.${state.skills[i].xp}/${s.xpPerLevel}</span>`).join('')}</div><h3 class="subheading">Teknoloji ağacı</h3>${techs.map((t,i)=>`<div class="countline"><span>${state.technologies?.[i]?'✓':'○'} ${esc(t.name)}<small> · ${esc(t.description)}</small></span>${state.technologies?.[i]?'':button('Aç',`data-technology="${i}"`,'secondary')}</div>`).join('')}</section>`}
function questPanel(){return `<section class="panel"><h2>Görev günlüğü · ${state.quests.filter(q=>q.status==='complete').length}/87</h2>${state.quests.map(q=>{const d=P.quests[q.id],status=P.questStatus(state,q.id),target=d.type==='craft'?P.items[d.target]:d.type==='explore'?P.regions[d.target]:d.type==='build'?P.buildingNames[d.target]:d.type==='event'?(P.events[d.target]?.name||'olay'):P.items[d.target];return `<div class="countline"><span>${esc(d.name)}<small> · ${d.type} / ${esc(target)} · ${q.progress}/${d.amount}</small></span><b class="${status==='complete'?'good':''}">${status}</b></div>`}).join('')}</section>`}
function journal(){const st=P.statistics(state);return `<h1>Ustalığa ilk adım</h1><section class="panel dialogue"><div class="row"><div class="portrait" style="background-position:100% 0"></div><p><b>Akın:</b><br/>${esc(P.dialogue(state))}</p></div>${state.chapter<4?`<div class="actions">${button('Nasıl yapacağım?','data-choice="0"','secondary')}${button('Hazırım.','data-choice="1"','secondary')}</div>`:''}</section>${eventPanel()}${questPanel()}${skillPanel()}<section class="panel"><h2>İlerleme istatistikleri</h2><div class="recipe-parts"><span>Bulunan nesne: ${st.items}/343</span><span>Tarif: ${st.recipes}/237</span><span>Görev: ${st.quests}/87</span><span>Bölüm: ${st.chapter}/5</span><span>Başarım: ${st.achievements}/${P.achievements.length}</span></div></section><section class="panel"><h2>Başarımlar</h2>${P.achievements.map(a=>`<div class="countline"><span>${esc(a.name)}<small> · ${esc(a.description)}</small></span><b class="${P.achievementStatus(state,a.id)==='unlocked'?'good':''}">${P.achievementStatus(state,a.id)==='unlocked'?'✓':'·'}</b></div>`).join('')}</section><section class="panel"><h2>Hikâye kayıtları</h2>${state.journal.slice().reverse().map(x=>`<p class="journal-log">${esc(x)}</p>`).join('')}</section><section class="panel"><h2>Kayıt yuvaları</h2><p class="muted">Üç ayrı yolculuğu sakla; otomatik kayıt ayrıca korunur.</p><div class="save-row">${[1,2,3].map(i=>button(`Slot ${i} kaydet`,`data-slot-save="${i}"`,'secondary')).join('')}</div><div class="save-row">${[1,2,3].map(i=>button(`Slot ${i} yükle`,`data-slot-load="${i}"`,'secondary')).join('')}</div><div class="save-row">${button('Şimdi elle kaydet','data-save="1"','secondary')}${button('Elle kaydı yükle','data-load="1"','secondary')}</div><div class="save-row">${button('Yeni oyun','data-new="1"','secondary danger')}${state.ended?button('Yeni oyun+','data-new-plus="1"','wood'):''}</div></section>`}
function finishPointerMaterial(id,x,y){
  const target=document.elementFromPoint(x,y);
  const zone=target&&target.closest?target.closest('.dropzone'):null;
  if(pointerDrag?.ghost)pointerDrag.ghost.remove();
  pointerDrag=null;
  if(!zone)return false;
  materialSelection.push(id);render();return true;
}
function bind(){
 document.querySelectorAll('[data-item]').forEach(el=>{
  const id=+el.dataset.item;
  const isIngredient=P.recipes.some(r=>Object.prototype.hasOwnProperty.call(r.input,id));
  el.onclick=()=>{if(Date.now()<suppressClickUntil)return;if(id===9)act({type:'eat'});else if(id===8)act({type:'drink'});else if([0,5,7,11,18].includes(id)){selectedTool=id;act({type:'equip',item:id})}else if(P.recipes.some(r=>r.out===id)){selectedRecipe=P.recipes.findIndex(r=>r.out===id);page='recipes';render()}};
  el.ondragstart=e=>{dragId=id;e.dataTransfer.setData('text/plain',dragId)};
  el.onpointerdown=e=>{
   if(e.pointerType==='mouse')return;
   pointerDrag={id,startX:e.clientX,startY:e.clientY,moved:false,ghost:null};
   el.setPointerCapture?.(e.pointerId);e.preventDefault();
  };
  el.onpointermove=e=>{
   if(!pointerDrag||pointerDrag.id!==id)return;
   const moved=Math.hypot(e.clientX-pointerDrag.startX,e.clientY-pointerDrag.startY)>8;
   if(moved&&!pointerDrag.moved){
    pointerDrag.moved=true;
    const ghost=el.cloneNode(true);ghost.className='drag-ghost';document.body.appendChild(ghost);pointerDrag.ghost=ghost;
   }
   if(pointerDrag.moved&&pointerDrag.ghost){pointerDrag.ghost.style.left=e.clientX+'px';pointerDrag.ghost.style.top=e.clientY+'px';e.preventDefault()}
  };
  el.onpointerup=e=>{
   if(!pointerDrag||pointerDrag.id!==id)return;
   const drag=pointerDrag;suppressClickUntil=Date.now()+500;
   if(drag.moved)finishPointerMaterial(drag.id,e.clientX,e.clientY);
   else if(page==='camp'&&isIngredient){pointerDrag=null;materialSelection.push(drag.id);render()}
   else{if(drag.ghost)drag.ghost.remove();pointerDrag=null}
   e.preventDefault();
  };
  el.onpointercancel=()=>{if(pointerDrag?.ghost)pointerDrag.ghost.remove();pointerDrag=null};
  el.ondblclick=()=>{selectedTool=id;state.tool=id;toast(P.items[id]+' ele takıldı.')}
 });
 document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{document.querySelectorAll('.item').forEach(x=>{const id=+x.dataset.item;const r=P.recipes.find(z=>z.out===id);const f=b.dataset.filter;x.style.display=f==='all'||(f==='food'&&r?.category==='Yemek')||(f==='tool'&&r?.category==='Araç')||(f==='building'&&r?.category==='Yapı')?'':'none'})});
 document.querySelectorAll('.dropzone').forEach(z=>{z.ondragover=e=>{e.preventDefault();z.classList.add('over')};z.ondragleave=()=>z.classList.remove('over');z.ondrop=e=>{e.preventDefault();z.classList.remove('over');dragId=+e.dataTransfer.getData('text');if(Number.isInteger(dragId)&&dragId>=0&&dragId<P.items.length){materialSelection.push(dragId);render()}}});document.querySelectorAll('[data-clear-material]').forEach(b=>b.onclick=()=>{materialSelection=[];render()});
 const recipeSearch=$('#recipe-search');if(recipeSearch)recipeSearch.oninput=()=>{const query=recipeSearch.value.trim().toLocaleLowerCase('tr-TR');document.querySelectorAll('[data-open-recipe]').forEach(card=>{card.style.display=!query||card.dataset.recipeName.includes(query)?'':'none'})};
 const craft=()=>{const recipe=materialSelection.length?P.findRecipe(materialSelection,state.tool):selectedRecipe;if(recipe<0){toast('Bu malzeme birleşimi için tarif yok.');return {ok:false}}const result=act({type:'craft',recipe});if(result.ok){materialSelection=[];render()}return result};const cb=$('#craft-now');if(cb)cb.onclick=craft;const req=$('#equip-required');if(req)req.onclick=()=>{const id=+req.dataset.requiredTool;if(state.inventory[id]){state.tool=id;selectedTool=id;render()}else toast('Gerekli alet envanterinde yok.')};const ts=$('#tool-select');if(ts)ts.onchange=()=>{selectedTool=+ts.value;state.tool=selectedTool;render()};const rs=$('#recipe-tool');if(rs)rs.onchange=()=>{state.tool=+rs.value;selectedTool=state.tool;render()};
 document.querySelectorAll('[data-craft-recipe]').forEach(b=>b.onclick=e=>{selectedRecipe=+b.dataset.craftRecipe;state.tool=P.recipes[selectedRecipe].tool;act({type:'craft',recipe:selectedRecipe})});
 document.querySelectorAll('[data-gather]').forEach(b=>b.onclick=()=>act({type:'gather'}));document.querySelectorAll('[data-gather-kind]').forEach(b=>b.onclick=()=>act({type:'gather',kind:b.dataset.gatherKind}));document.querySelectorAll('[data-gather-resource]').forEach(b=>b.onclick=()=>act({type:'gather',resource:+b.dataset.gatherResource}));
 [['#eat',{type:'eat'}],['#drink',{type:'drink'}],['#rest',{type:'rest'}],['#explore',{type:'explore'}],['#feed-helper',{type:'feed'}],['#collect-helper',{type:'collect'}],['#harvest',{type:'harvest'}]].forEach(([q,a])=>{const b=$(q);if(b)b.onclick=()=>act(a)});
 const send=$('#send-helper');if(send)send.onclick=()=>act({type:'send',resource:selectedResource,minutes:+$('#job-length').value});document.querySelectorAll('[data-resource]').forEach(b=>b.onclick=()=>{selectedResource=+b.dataset.resource;render()});
 document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>act({type:'choice',choice:+b.dataset.choice}));document.querySelectorAll('[data-event-choice]').forEach(b=>b.onclick=()=>act({type:'event',event:+b.dataset.event,choice:+b.dataset.eventChoice}));document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{const f=b.dataset.filter;document.querySelectorAll('.item').forEach(x=>{const id=+x.dataset.item,r=P.recipes.find(z=>z.out===id);x.style.display=f==='all'||(f==='food'&&r?.category==='Yiyecek')||(f==='tool'&&r?.category==='Araç')||(f==='building'&&r?.category==='Yapı')?'':'none'});document.querySelectorAll('[data-recipe-category]').forEach(x=>{const c=x.dataset.recipeCategory;x.style.display=f==='all'||(f==='food'&&c==='Yiyecek')||(f==='tool'&&c==='Araç')||(f==='building'&&c==='Yapı')?'':'none'})});document.querySelectorAll('[data-open-recipe]').forEach(b=>b.onclick=()=>{selectedRecipe=+b.dataset.openRecipe;page='recipes';render()});
 document.querySelectorAll('[data-helper-equip]').forEach(b=>b.onclick=()=>{const [slot,item]=b.dataset.helperEquip.split(':');act({type:'helperEquip',slot,item:+item})});document.querySelectorAll('[data-travel-region]').forEach(b=>b.onclick=()=>act({type:'travel',region:+b.dataset.travelRegion}));document.querySelectorAll('[data-technology]').forEach(b=>b.onclick=()=>act({type:'technology',technology:+b.dataset.technology}));document.querySelectorAll('[data-building]').forEach(b=>b.onclick=()=>{selectedBuilding=b.dataset.building;render()});const buildingAction=$('[data-building-action]');if(buildingAction)buildingAction.onclick=()=>act({type:'building',building:selectedBuilding});
 const saveB=$('[data-save]');if(saveB)saveB.onclick=()=>{save('manual');toast('Elle kayıt alındı.')};const loadB=$('[data-load]');if(loadB)loadB.onclick=()=>{try{const raw=globalThis.AndroidStore?AndroidStore.read('manual'):localStorage.getItem('primal-manual');if(!raw)throw Error('Elle kayıt yok.');state=P.validate(JSON.parse(raw));render();toast('Elle kayıt yüklendi.')}catch(e){toast(e.message)}};document.querySelectorAll('[data-slot-save]').forEach(b=>b.onclick=()=>{save(`slot-${b.dataset.slotSave}`);toast(`Slot ${b.dataset.slotSave} kaydedildi.`)});document.querySelectorAll('[data-slot-load]').forEach(b=>b.onclick=()=>{try{const slot=b.dataset.slotLoad,raw=globalThis.AndroidStore?AndroidStore.read(`slot-${slot}`):localStorage.getItem(`primal-slot-${slot}`);if(!raw)throw Error(`Slot ${slot} boş.`);state=P.validate(JSON.parse(raw));render();toast(`Slot ${slot} yüklendi.`)}catch(e){toast(e.message)}});const nb=$('[data-new]');if(nb)nb.onclick=()=>{if(confirm('Yeni oyun başlatılsın mı? Elle kayıt korunur.')){state=P.newGame(Date.now());state.introduced=true;save();render()}};
 const nbp=$('[data-new-plus]');if(nbp)nbp.onclick=()=>{try{state=P.newGamePlus(state,(state.prestige||0)+1);save();render()}catch(e){toast(e.message)}};const settings=$('#settings');if(settings)settings.onclick=()=>{page='journal';render()};const rh=$('#recipe-head');if(rh)rh.onclick=()=>{page='recipes';render()};
}
render();
})();
