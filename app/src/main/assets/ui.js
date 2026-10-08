(function(){
'use strict';
 const P=globalThis.Primal;let notice='';let state=load();let page='camp';let selectedRecipe=0;let selectedTool=-1;let selectedResource=0;let selectedBuilding='depot';let materialSelection=[];let inventoryFilter='all';let inventoryQuery='';let selectedItem=-1;let recipeFilter='all';let recipeQuery='';let onlyReady=false;let dragId=null;let pointerDrag=null;let suppressClickUntil=0;
const defaultPreferences={sound:true,volume:.45,vibrate:true,motion:true};let preferences=loadPreferences();
let audioContext=null;
const $=s=>document.querySelector(s), esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const artInk='#5a351a';
function loadPreferences(){try{const raw=globalThis.AndroidStore?AndroidStore.read('prefs'):localStorage.getItem('primal-prefs');return {...defaultPreferences,...(raw?JSON.parse(raw):{})}}catch(e){return {...defaultPreferences}}}
function savePreferences(){const raw=JSON.stringify(preferences);try{if(globalThis.AndroidStore)AndroidStore.write('prefs',raw);else localStorage.setItem('primal-prefs',raw)}catch(e){notice='Tercihler kaydedilemedi.'}}
function applyPreferences(){document.documentElement.dataset.motion=preferences.motion?'full':'reduced'}
function haptic(pattern=8){if(preferences.vibrate&&navigator.vibrate)try{navigator.vibrate(pattern)}catch(e){}}
function heroMood(s){if(s.ended)return 5;if(s.health<35)return 4;if(s.water<30||s.food<30)return s.water<=s.food?2:1;if(s.energy<30)return 3;return 0}
function heroPortrait(s){const mood=heroMood(s),col=mood%3,row=Math.floor(mood/3);return `<div class="portrait hero mood-portrait" style="background-image:url('art/portrait-moods.png');background-size:300% 200%;background-position:${col*50}% ${row*100}%"></div>`}
const rasterIcons={
  0:[1,0,0],1:[1,1,0],3:[1,2,0],4:[1,3,0],10:[1,0,1],17:[1,1,1],20:[1,2,1],21:[1,3,1],22:[1,0,2],23:[1,1,2],24:[1,2,2],25:[1,3,2],26:[1,0,3],27:[1,1,3],28:[1,2,3],29:[1,3,3],
  30:[2,0,0],31:[2,1,0],32:[2,2,0],33:[2,3,0],34:[2,0,1],35:[2,1,1],36:[2,2,1],37:[2,3,1],38:[2,0,2],39:[2,1,2],40:[2,2,2],41:[2,3,2],42:[2,0,3],43:[2,1,3],44:[2,2,3],45:[2,3,3],
  46:[3,0,0],47:[3,1,0],48:[3,2,0],49:[3,3,0],50:[3,0,1],51:[3,1,1],52:[3,2,1],53:[3,3,1],54:[3,0,2],55:[3,1,2],
  56:[4,0,0],57:[4,1,0],58:[4,2,0],59:[4,3,0],60:[4,0,1],61:[4,1,1],62:[4,2,1],63:[4,3,1],64:[4,0,2],65:[4,1,2],66:[4,2,2],67:[4,3,2],68:[4,0,3],69:[4,1,3],70:[4,2,3],71:[4,3,3],72:[5,0,0],73:[5,1,0],74:[5,2,0],75:[5,3,0],76:[5,0,1],77:[5,1,1],78:[5,2,1],79:[5,3,1],80:[5,0,2],81:[5,1,2],82:[5,2,2],83:[5,3,2],84:[5,0,3],85:[5,1,3]
};
const generatedIcons={
  86:['advanced-tools.png',0,0],87:['advanced-tools.png',1,0],88:['advanced-tools.png',2,0],89:['advanced-tools.png',3,0],
  90:['advanced-tools.png',0,1],91:['advanced-tools.png',1,1],92:['advanced-tools.png',2,1],93:['advanced-tools.png',3,1],
  94:['advanced-tools.png',0,2],95:['advanced-tools.png',1,2],96:['advanced-tools.png',2,2],97:['advanced-tools.png',3,2],
  98:['advanced-tools.png',0,3],99:['advanced-tools.png',1,3],100:['advanced-tools.png',2,3],101:['advanced-tools.png',3,3],
  102:['advanced-tools-02.png',0,0],103:['advanced-tools-02.png',1,0],104:['advanced-tools-02.png',2,0],105:['advanced-tools-02.png',3,0],
  106:['advanced-tools-02.png',0,1],107:['advanced-tools-02.png',1,1],108:['advanced-tools-02.png',2,1],109:['advanced-tools-02.png',3,1],
  110:['advanced-tools-02.png',0,2],111:['advanced-tools-02.png',1,2],112:['advanced-tools-02.png',2,2],113:['advanced-tools-02.png',2,1],
  114:['advanced-tools-02.png',3,2],115:['advanced-tools-02.png',0,3],116:['advanced-tools-02.png',1,3],117:['advanced-tools-02.png',2,3],
  118:['advanced-clothing.png',0,0],119:['advanced-clothing.png',1,0],120:['advanced-clothing.png',2,0],121:['advanced-clothing.png',3,0],
  122:['advanced-clothing.png',0,1],123:['advanced-clothing.png',1,1],124:['advanced-clothing.png',2,1],125:['advanced-clothing.png',3,1],
  126:['advanced-clothing.png',0,2],127:['advanced-clothing.png',1,2],128:['advanced-clothing.png',2,2],129:['advanced-clothing.png',3,2],
  130:['advanced-clothing.png',0,3],131:['advanced-clothing.png',1,3],
  132:['advanced-structures.png',0,0],133:['advanced-structures.png',1,0],134:['advanced-structures.png',2,0],135:['advanced-structures.png',3,0],
  136:['advanced-structures.png',0,1],137:['advanced-structures.png',1,1],138:['advanced-structures.png',2,1],139:['advanced-structures.png',3,1],
  140:['advanced-structures.png',0,2],141:['advanced-structures.png',1,2],142:['advanced-structures.png',2,2],143:['advanced-structures.png',3,2],
  144:['advanced-structures.png',0,3],145:['advanced-structures.png',1,3],146:['advanced-structures.png',2,3],147:['advanced-structures.png',3,3],
  152:['advanced-medicine.png',0,0],153:['advanced-medicine.png',1,0],154:['advanced-medicine.png',2,0],155:['advanced-medicine.png',3,0],
  156:['advanced-medicine.png',0,1],157:['advanced-medicine.png',1,1],158:['advanced-medicine.png',2,1],159:['advanced-medicine.png',3,1],
  160:['advanced-medicine.png',0,2],161:['advanced-medicine.png',1,2],162:['advanced-medicine.png',2,2],163:['advanced-medicine.png',3,2],
  164:['advanced-medicine.png',0,3],165:['advanced-medicine.png',1,3],166:['advanced-medicine.png',2,3],167:['advanced-medicine.png',3,3],
  148:['advanced-late.png',0,0],149:['advanced-late.png',1,0],150:['advanced-late.png',2,0],151:['advanced-late.png',3,0],
  168:['advanced-late.png',0,1],169:['advanced-late.png',1,1],170:['advanced-late.png',2,1],171:['advanced-late.png',3,1],
  188:['advanced-late.png',0,2],189:['advanced-late.png',1,2],
  172:['advanced-keepsakes.png',0,0],173:['advanced-keepsakes.png',1,0],174:['advanced-keepsakes.png',2,0],175:['advanced-keepsakes.png',3,0],
  176:['advanced-keepsakes.png',0,1],177:['advanced-keepsakes.png',1,1],178:['advanced-keepsakes.png',2,1],179:['advanced-keepsakes.png',3,1],
  180:['advanced-keepsakes.png',0,2],181:['advanced-keepsakes.png',1,2],182:['advanced-keepsakes.png',2,2],183:['advanced-keepsakes.png',3,2],
  184:['advanced-keepsakes.png',0,3],185:['advanced-keepsakes.png',1,3],186:['advanced-keepsakes.png',2,3],187:['advanced-keepsakes.png',3,3],
  190:['late-items-01.png',0,0],191:['late-items-01.png',1,0],192:['late-items-01.png',2,0],193:['late-items-01.png',3,0],
  194:['late-items-01.png',0,1],195:['late-items-01.png',1,1],196:['late-items-01.png',2,1],197:['late-items-01.png',3,1],
  198:['late-items-01.png',0,2],199:['late-items-01.png',1,2],200:['late-items-01.png',2,2],201:['late-items-01.png',3,2],
  202:['late-items-01.png',0,3],203:['late-items-01.png',1,3],204:['late-items-01.png',2,3],205:['late-items-01.png',3,3],
  206:['late-items-02.png',0,0],207:['late-items-02.png',1,0],208:['late-items-02.png',2,0],209:['late-items-02.png',3,0],
  210:['late-items-02.png',0,1],211:['late-items-02.png',1,1],212:['late-items-02.png',2,1],213:['late-items-02.png',3,1],
  214:['late-items-02.png',0,2],215:['late-items-02.png',1,2],216:['late-items-02.png',2,2],217:['late-items-02.png',3,2],
  218:['late-items-02.png',0,3],219:['late-items-02.png',1,3],220:['late-items-02.png',2,3],221:['late-items-02.png',3,3],
  222:['late-items-03.png',0,0],223:['late-items-03.png',1,0],224:['late-items-03.png',2,0],225:['late-items-03.png',3,0],
  226:['late-items-03.png',0,1],227:['late-items-03.png',1,1],228:['late-items-03.png',2,1],229:['late-items-03.png',3,1],
  230:['late-items-03.png',0,2],231:['late-items-03.png',1,2],232:['late-items-03.png',2,2],233:['late-items-03.png',3,2],
  234:['late-items-03.png',0,3],235:['late-items-03.png',1,3],236:['late-items-03.png',2,3],237:['late-items-03.png',3,3],
  238:['late-items-04.png',0,0],239:['late-items-04.png',1,0],240:['late-items-04.png',2,0],241:['late-items-04.png',3,0],
  242:['late-items-04.png',0,1],243:['late-items-04.png',1,1],244:['late-items-04.png',2,1],245:['late-items-04.png',3,1],
  246:['late-items-04.png',0,2],247:['late-items-04.png',1,2],248:['late-items-04.png',2,2],249:['late-items-04.png',3,2],
  250:['late-items-04.png',0,3],251:['late-items-04.png',1,3],252:['late-items-04.png',2,3],253:['late-items-04.png',3,3],
  254:['late-items-05.png',0,0],255:['late-items-05.png',1,0],256:['late-items-05.png',2,0],257:['late-items-05.png',3,0],
  258:['late-items-05.png',0,1],259:['late-items-05.png',1,1],260:['late-items-05.png',2,1],261:['late-items-05.png',3,1],
  262:['late-items-05.png',0,2],263:['late-items-05.png',1,2],264:['late-items-05.png',2,2],265:['late-items-05.png',3,2],
  266:['late-items-05.png',0,3],267:['late-items-05.png',1,3],268:['late-items-05.png',2,3],269:['late-items-05.png',3,3],
  270:['late-items-08.png',0,0],271:['late-items-06.png',2,0],272:['late-items-06.png',3,0],273:['late-items-06.png',0,1],
  274:['late-items-06.png',1,1],275:['late-items-09.png',1,3],276:['late-items-06.png',3,1],277:['late-items-06.png',0,2],
  278:['late-items-06.png',1,2],279:['late-items-06.png',2,2],280:['late-items-06.png',3,2],281:['late-items-06.png',0,3],
  282:['late-items-06.png',1,3],283:['late-items-06.png',2,3],284:['late-items-06.png',3,3],285:['late-items-07.png',0,0],
  286:['late-items-07.png',1,0],287:['late-items-07.png',2,0],288:['late-items-07.png',3,0],289:['late-items-07.png',0,1],
  290:['late-items-07.png',1,1],291:['late-items-07.png',2,1],292:['late-items-07.png',3,1],293:['late-items-07.png',0,2],
  294:['late-items-07.png',1,2],295:['late-items-07.png',2,2],296:['late-items-07.png',3,2],297:['late-items-07.png',0,3],
  298:['late-items-07.png',1,3],299:['late-items-07.png',2,3],300:['late-items-07.png',3,3],301:['late-items-04.png',3,1],
  302:['late-items-08.png',2,0],303:['late-items-06.png',1,0],304:['late-items-08.png',0,1],305:['late-items-08.png',1,1],
  306:['late-items-08.png',2,1],307:['late-items-08.png',3,1],308:['late-items-08.png',0,2],309:['late-items-08.png',1,2],
  310:['late-items-08.png',2,2],311:['late-items-08.png',3,2],312:['late-items-03.png',2,2],313:['late-items-10.png',3,2],
  314:['late-items-08.png',0,3],315:['late-items-08.png',1,3],316:['late-items-08.png',2,3],317:['late-items-08.png',3,3],
  318:['late-items-09.png',0,0],319:['late-items-09.png',1,0],320:['late-items-09.png',2,0],321:['late-items-09.png',3,0],
  322:['late-items-09.png',0,1],323:['late-items-09.png',1,1],324:['late-items-09.png',2,1],325:['late-items-09.png',3,1],
  326:['late-items-09.png',0,2],327:['late-items-09.png',1,2],328:['late-items-09.png',2,2],329:['late-items-09.png',3,2],
  330:['late-items-09.png',0,3],331:['late-items-09.png',1,3],332:['late-items-09.png',2,3],333:['late-items-09.png',3,3],
  334:['late-items-10.png',0,0],335:['late-items-10.png',1,0],336:['late-items-10.png',2,0],337:['late-items-10.png',3,0],
  338:['late-items-10.png',0,1],339:['late-items-10.png',1,1],340:['late-items-10.png',2,1],341:['late-items-10.png',3,1],
  342:['late-items-10.png',0,2]
};
function rasterIcon(id,cls){const [sheet,col,row]=rasterIcons[id];const x=col*33.333333,y=row*33.333333;const group=sheet<4?'materials':'foods';const local=sheet<4?sheet:sheet-3;return `<span class="item-art raster-art ${cls}" style="background-image:url('art/${group}-0${local}.png');background-position:${x}% ${y}%;background-size:400% 400%" aria-hidden="true"></span>`}
function generatedIcon(id,cls){const [file,col,row]=generatedIcons[id],x=col*33.333333,y=row*33.333333;return `<span class="item-art raster-art ${cls}" style="background-image:url('art/${file}');background-position:${x}% ${y}%;background-size:400% 400%" aria-hidden="true"></span>`}
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
const icon=(id,cls='')=>rasterIcons[id]?rasterIcon(id,cls):generatedIcons[id]?generatedIcon(id,cls):id<24?`<span class="sprite ${cls}" style="background-position:${(id%6)*20}% ${Math.floor(id/6)*33.333}%" aria-hidden="true"></span>`:`<span class="item-art ${cls}" aria-hidden="true">${itemArt(id)}</span>`;
const button=(label,attrs='',cls='secondary')=>`<button class="${cls}" ${attrs}>${label}</button>`;
function load(){
  let raw;
  try {
    raw=globalThis.AndroidStore?AndroidStore.read('auto'):localStorage.getItem('primal-auto');
    if(!raw)return P.newGame(Date.now());
    try{return P.migrate(JSON.parse(raw));}
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
  } catch(e){
    if(raw){const slot='recovery-'+Date.now();try{if(globalThis.AndroidStore){if(!AndroidStore.write(slot,raw))throw Error();}else localStorage.setItem('primal-'+slot,raw);notice='Kayıt okunamadı. Özgün kayıt '+slot+' yedeğinde korundu.';}catch(backupError){notice='Kayıt okunamadı; otomatik kayıt kapatıldı.';save.blocked=true;}}
    else notice=e.message;
    return P.newGame(Date.now());
  }
}
function save(slot='auto'){if(save.blocked){notice='Kayıt korunuyor; uygulamayı kapatmadan özgün kaydını yedekle.';return false;}const raw=JSON.stringify(state);try{if(globalThis.AndroidStore){if(!AndroidStore.write(slot,raw))throw Error('Yazılamadı');}else localStorage.setItem('primal-'+slot,raw);return true;}catch(e){notice='Kayıt yazılamadı.';return false;}}
function snapshot(){return JSON.parse(JSON.stringify(state))}
function dispatch(action){return act(action)}
globalThis.app={snapshot,dispatch};
function sound(kind){if(!preferences.sound||preferences.volume<=0)return;try{audioContext=audioContext||new (globalThis.AudioContext||globalThis.webkitAudioContext)();const oscillator=audioContext.createOscillator(),gain=audioContext.createGain();oscillator.type='triangle';oscillator.frequency.value=kind==='craft'?520:kind==='error'?170:330;gain.gain.setValueAtTime(.035*preferences.volume,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.09);oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start();oscillator.stop(audioContext.currentTime+.1)}catch(e){/* sound is an enhancement; gameplay must not depend on it */}}
function act(action){const result=P.reduce(state,action,Date.now());notice=result.message;if(result.ok){sound(action.type==='craft'?'craft':'ok');haptic(8);save();render()}else{sound('error');haptic([18,24]);toast(notice)}return result}
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2600)}
function stat(symbol,label,value,cls=''){return `<div class="stat"><span class="symbol ${cls}">${symbol}</span><b>${label}</b><small>${value}</small></div>`}
function render(){
 const time=String(Math.floor(state.minutes/60)).padStart(2,'0')+':'+String(state.minutes%60).padStart(2,'0');
 applyPreferences();$('#header').innerHTML=`<div class="day"><b>Gün ${state.day}</b>${time}</div><div class="header-tools">${button('▤','id="recipe-head" aria-label="Tarif defteri" title="Tarif defteri"','')} ${button('⚙','id="settings" aria-label="Ayarlar" title="Ayarlar"','')}</div>${heroPortrait(state)}<div class="region">${esc(P.regions[state.region])} · Bölüm ${state.chapter+1}</div>`;
 $('#stats').innerHTML=stat('❤','Sağlık',`${state.health}/100`,'heart')+stat('⌁','Açlık',`${state.food}/100`)+stat('💧','Susuzluk',`${state.water}/100`,'water')+stat('ϟ','Enerji',`${state.energy}/100`,'energy')+stat('♨','Ortam',`${P.temperature(state)} °C`,'temp');
 const names={camp:'Kamp',recipes:'Tarifler',helper:'Yardımcı',village:'Köy',map:'Harita',journal:'Günlük'};
 $('#content').dataset.page=page;$('#content').innerHTML=page==='camp'?camp():page==='recipes'?recipes():page==='helper'?helper():page==='village'?village():page==='map'?map():page==='settings'?settingsPage():journal();
  $('nav').innerHTML=Object.entries(names).map(([id,n])=>`<button data-nav="${id}" class="${id===page?'active':''}" ${id===page?'aria-current="page"':''}>${navIcon(id)}<span>${n}</span></button>`).join('');
 document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{page=b.dataset.nav;render()});
 bind();bindExtended();if(notice){toast(notice);notice=''}
}
function navIcon(id){if(id==='camp')return icon(0,'mini');if(id==='map')return icon(172,'mini');const cell={recipes:20,helper:21,village:22,journal:23}[id];return `<span class="sprite mini" style="background-position:${cell%6*20}% ${Math.floor(cell/6)*33.333}%" aria-hidden="true"></span>`}
 function tabs(active){return `<div class="tabs scroll-tabs" role="toolbar" aria-label="İçerik filtresi">${['all','Malzeme','Yiyecek','Araç','Yapı','Giysi','Tıp','Süs','Bilgi'].map(x=>`<button class="${active===x?'active':''}" aria-pressed="${active===x}" data-filter="${x}">${x==='all'?'Tümü':x}</button>`).join('')}</div>`}
function gatheringPanel(){
 const options=P.gatherOptions(state),shown=options.slice(0,8),extra=options.slice(8),axe=P.itemData[state.tool]?.toolKind==='axe'&&state.inventory[state.tool]>0;
 return `<section class="panel gathering-panel"><div class="row"><div class="grow"><h2>Kaynak toplama</h2><p class="muted">${esc(P.regions[state.region])} · Dokunarak kaynak topla. Aleti ele takınca özel kaynaklar açılır.</p></div>${button(axe?'Odun kes':'Topla',axe?'data-gather-kind="wood"':'data-gather="1"','wood')}</div><div class="gather-grid">${shown.map(id=>button(`${icon(id,'mini')} ${esc(P.items[id])}`,`data-gather-resource="${id}"`,'secondary')).join('')}</div>${extra.length?`<details><summary>Diğer kaynaklar · ${extra.length}</summary><div class="gather-grid">${extra.map(id=>button(`${icon(id,'mini')} ${esc(P.items[id])}`,`data-gather-resource="${id}"`,'secondary')).join('')}</div></details>`:''}</section>`;
}
 function camp(){
  const ids=state.inventory.map((n,i)=>n?i:-1).filter(i=>i>=0);return `<div class="camp-intro"><div><span class="eyebrow">YOLCULUK GÜNLÜĞÜ · ${String(state.day).padStart(2,'0')}</span><h1>Kamp ve envanter</h1><p>Kaynaklara dokunarak seç veya üretim masasına sürükle.</p></div><span class="camp-mark" aria-hidden="true">✦</span></div>${tabs(inventoryFilter)}<div class="inventory-toolbar"><b>Çanta</b><span>${ids.length}/${P.items.length} eşya türü · <span class="swipe-hint">yana kaydır ↔</span></span></div><label class="inventory-search"><span aria-hidden="true">⌕</span><input id="inventory-search" type="search" value="${esc(inventoryQuery)}" placeholder="Çantada ara…" aria-label="Çantada eşya ara"/><button type="button" id="clear-inventory-search" aria-label="Envanter aramasını temizle">×</button></label><div class="inventory">${ids.map(id=>itemCard(id)).join('')}</div>
 ${selectedItem>=0?itemDetail(selectedItem):''}<section class="panel workbench-panel"><h2>Üretim masası</h2><div class="workbench"><div><h3>Malzeme</h3><div id="material-drop" class="dropzone" data-drop="material">${materialSelection.length?materialSelection.map((id,index)=>button(`${icon(id,'mini')} ${esc(P.items[id])} ×`, `data-remove-material="${index}" aria-label="${esc(P.items[id])} malzemesini çıkar"`,'material-chip')).join(''):'<span class="hint">Çantadan malzemelere dokun veya buraya sürükle.</span>'}${materialSelection.length?button('Temizle','data-clear-material="1"','secondary'):''}</div></div><div><h3>Alet</h3><select id="tool-select" class="tool-select"><option value="-1">El ile</option>${P.items.map((_,i)=>i).filter(i=>P.availableTool(state,i)).map(i=>`<option value="${i}" ${state.tool===i?'selected':''}>${esc(P.items[i])}</option>`).join('')}</select></div></div>${button('✦ Üret','id="craft-now"','wood primary')}<div class="task">⚑ ${esc(P.objective(state))}${button('Hikâyeyi aç','data-go-journal','secondary')}</div></section>${gatheringPanel()}
 <div class="actions">${button('🍖 Ye','id="eat"')}${button('💧 Su iç','id="drink"')}${button('☼ Dinlen','id="rest"')}${button('⌁ Keşif','id="explore"')}</div>${playerEquipment()}`
}
 function itemCard(id){const r=P.recipes.findIndex(x=>x.out===id);return `<div class="item-wrap"><button class="item" draggable="true" data-item="${id}" data-item-name="${esc(P.items[id].toLocaleLowerCase('tr-TR'))}" aria-label="${esc(P.items[id])}, adet ${state.inventory[id]}, üretime ekle">${icon(id)}<span class="name">${esc(P.items[id])}</span><b class="count">${state.inventory[id]}</b>${r>=0&&state.discovered[r]?'<small class="badge">tarif</small>':''}</button>${button('İncele',`data-inspect="${id}" aria-label="${esc(P.items[id])} özelliklerini incele"`,'item-info')}</div>`}
function filterInventory(){const q=inventoryQuery.trim().toLocaleLowerCase('tr-TR');document.querySelectorAll('.inventory .item').forEach(el=>{const id=+el.dataset.item,category=P.itemData[id].category;const typeOk=inventoryFilter==='all'||inventoryFilter===category;const queryOk=!q||el.dataset.itemName.includes(q);el.closest('.item-wrap').hidden=!(typeOk&&queryOk)})}
function recipeParts(r){return Object.entries(r.input).map(([id,n])=>`<span>${icon(+id,'mini')} ${esc(P.items[id])} ${state.inventory[id]||0}/${n}</span>`).join('')}
function recipes(){
 if(!state.discovered[selectedRecipe])selectedRecipe=state.discovered.findIndex(Boolean);
 const r=P.recipes[selectedRecipe],known=P.recipes.filter(r=>state.discovered[r.id]),locked=P.recipes.length-known.length;
 const matches=known.filter(r=>(recipeFilter==='all'||r.category===recipeFilter)&&(!onlyReady||canMake(r))&&(!recipeQuery||(r.name+' '+Object.keys(r.input).map(id=>P.items[id]).join(' ')).toLocaleLowerCase('tr-TR').includes(recipeQuery.toLocaleLowerCase('tr-TR'))));
 return `<h1>Tarif defteri</h1><p class="muted center recipe-progress">${known.length}/${P.recipes.length} tarif keşfedildi</p>${r?recipeDetail(r):'<section class="panel"><h2>İlk keşfini yap</h2><p>Kampta malzemeleri birleştir. Başarılı denemelerin bu deftere kaydolur.</p></section>'}<h2 class="subheading">Öğrendiğin tarifler</h2><input id="recipe-search" class="recipe-search" type="search" value="${esc(recipeQuery)}" placeholder="Tarif veya malzeme ara…" aria-label="Keşfedilen tariflerde ara"><div class="tabs scroll-tabs" role="toolbar" aria-label="Tarif kategorisi">${['all',...new Set(known.map(r=>r.category))].map(c=>button(c==='all'?'Tümü':esc(c),`data-recipe-filter="${c}" aria-pressed="${recipeFilter===c}"`,recipeFilter===c?'active':'')).join('')}</div><label class="ready-filter"><input type="checkbox" id="only-ready" ${onlyReady?'checked':''}> Yalnızca üretime hazır olanlar</label><div id="recipe-results">${matches.map(r=>`<article class="recipe-card known">${icon(r.out)}<div class="grow"><h3>${esc(r.name)}</h3><div class="recipe-parts">${recipeParts(r)}</div><p class="muted">${canMake(r)?'Üretime hazır':'Malzeme, alet, enerji veya hikâye koşulu eksik'}</p><div class="row">${button('İncele',`data-open-recipe="${r.id}" aria-label="${esc(r.name)} tarifini aç"`)}${button('Üret',`data-craft-recipe="${r.id}" ${canMake(r)?'':'disabled'}`)}</div></div></article>`).join('')||'<p class="panel">Bu filtreye uygun öğrenilmiş tarif yok.</p>'}</div>${locked?`<details class="panel"><summary>Keşfedilmeyi bekleyen ${locked} tarif</summary><div class="recipe-card unknown"><span class="recipe-mystery" aria-hidden="true">?</span><p>Yeni tarifleri üretim masasında deneyerek veya bulduğun belgeleri inceleyerek öğren. Bilinmeyen formüller ve sonuçları burada gösterilmez.</p></div>${button('Üretim masasına dön','data-back-camp=1')}</details>`:'<p class="panel good">Bütün tarifleri keşfettin.</p>'}`;
}
function canMake(r){return state.energy>=5&&state.health>0&&Object.entries(r.input).every(([id,n])=>state.inventory[id]>=n)&&(r.tool<0||P.items.some((_,id)=>P.availableTool(state,id)&&P.toolMatches(id,r.tool)))&&(r.out!==16||(state.chapter>=3&&state.lens&&state.region===0))}
function recipeDetail(r){
 if(!state.discovered[r.id])return '';
 const required=r.tool<0?'El':P.items[r.tool];
 return `<section class="panel center"><h2>${esc(r.name)}</h2><div class="inputs">${Object.entries(r.input).map(([id,n])=>`<div class="ingredient panel">${icon(+id)}<b>${esc(P.items[id])}</b><span class="qty">${state.inventory[id]||0}/${n} ${state.inventory[id]>=n?'✓':'eksik'}</span></div>`).join('')}</div><div class="arrows">↓</div><div class="row">${icon(r.out)}<div class="grow"><b>${esc(P.items[r.out])}</b><p class="muted">Alet: ${esc(required)} · Beceri: ${esc(P.skills[r.skill].name)}<br>Başarı %${P.chance({...state,tool:r.tool<0?-1:P.items.findIndex((_,id)=>P.availableTool(state,id)&&P.toolMatches(id,r.tool))},r)} · Enerji 5</p></div></div>${button('Üret','id="craft-now" '+(canMake(r)?'':'disabled'),'wood primary')}</section>`;
}
function itemDetail(id){
 const item=P.itemData[id],r=P.recipes.find(r=>r.out===id);
 const effects=Object.entries(item.effect||{}).map(([k,n])=>n?({food:'Açlık',water:'Su',energy:'Enerji',health:'Sağlık',capacity:'Çanta kapasitesi',protection:'Koruma',gather:'Toplama bonusu',craft:'Üretim şansı',comfort:'Kamp konforu',xp:'Deneyim'}[k]||k)+' +'+n:'').filter(Boolean).join(' · ');
 return `<section class="panel item-detail"><div class="row">${icon(id)}<div class="grow"><h2>${esc(item.name)}</h2><p class="muted">${esc(item.category)} · ${state.inventory[id]} adet</p></div>${button('×','data-close-detail aria-label="Eşya detayını kapat"')}</div><p>${esc(item.description)}</p><p class="muted">${esc(effects)}</p><div class="actions">${button('Üretime ekle',`data-add-material="${id}" ${state.inventory[id]>materialSelection.filter(x=>x===id).length?'':'disabled'}`)}${item.category==='Yiyecek'?button('Ye',`data-eat-item="${id}"`):''}${['Tıp','Yapı','Bilgi','Süs'].includes(item.category)?button(item.category==='Yapı'?'Kampta kur':item.category==='Bilgi'||item.category==='Süs'?'İncele / öğren':'Kullan',`data-use-item="${id}" ${state.studied.includes(id)?'disabled':''}`):''}${item.slot?button('Kuşan',`data-wear-item="${id}"`):''}${P.isTool(id)?button('Ele tak',`data-equip-item="${id}"`):''}${r&&state.discovered[r.id]?button('Tarifini aç',`data-open-recipe="${r.id}"`):''}${item.category==='Malzeme'&&state.chapter>=1?button('Takas: 2 adet → 1 lif',`data-trade-item="${id}" ${id===4||state.inventory[id]<2?'disabled':''}`):''}${id!==15&&id!==16?button('Bir adet bırak',`data-discard-item="${id}"`):''}</div></section>`;
}
function bindExtended(){
 document.querySelectorAll('[data-inspect]').forEach(b=>b.onclick=()=>{selectedItem=+b.dataset.inspect;render();$('.item-detail')?.scrollIntoView({block:'nearest'})});
 const close=$('[data-close-detail]');if(close)close.onclick=()=>{selectedItem=-1;render()};
 document.querySelectorAll('[data-add-material]').forEach(b=>b.onclick=()=>{const id=+b.dataset.addMaterial;if(materialSelection.filter(x=>x===id).length<state.inventory[id])materialSelection.push(id);render()});
 document.querySelectorAll('[data-remove-material]').forEach(b=>b.onclick=()=>{materialSelection.splice(+b.dataset.removeMaterial,1);render()});
 for(const [attr,type] of [['trade-item','trade'],['eat-item','eat'],['use-item','use'],['wear-item','wear'],['equip-item','equip'],['discard-item','discard']])document.querySelectorAll('[data-'+attr+']').forEach(b=>b.onclick=()=>act({type,item:+b.getAttribute('data-'+attr)}));
 document.querySelectorAll('[data-unequip]').forEach(b=>b.onclick=()=>act({type:'unequip',slot:b.dataset.unequip}));
 document.querySelectorAll('[data-recipe-filter]').forEach(b=>b.onclick=()=>{recipeFilter=b.dataset.recipeFilter;render()});
 const ready=$('#only-ready');if(ready)ready.onchange=()=>{onlyReady=ready.checked;render()};
 const search=$('#recipe-search');if(search)search.oninput=()=>{recipeQuery=search.value;render();$('#recipe-search').focus()};
 document.querySelectorAll('[data-research]').forEach(b=>b.onclick=()=>act({type:'research'}));
 document.querySelectorAll('[data-upgrade]').forEach(b=>b.onclick=()=>act({type:'upgrade',building:b.dataset.upgrade}));
 document.querySelectorAll('[data-go-journal]').forEach(b=>b.onclick=()=>{page='journal';render()});
 document.querySelectorAll('[data-learn-hint]').forEach(b=>b.onclick=()=>toast('Ateş için dalları taşlarla çevrele. Su kabı için boş ceviz kabuğunu elinle işle.'));
}
function helper(){const h=state.helper;return `<h1>Yardımcı · Kaya</h1><section class="panel"><div class="row"><div class="portrait helper-face" style="background-position:50% 0"></div><div class="grow"><h2>Kaya <small>Seviye ${Math.floor(h.gathering/10)+1}</small></h2><div class="meter"><i style="width:${h.energy}%"></i></div><small>Enerji ${h.energy}/100 · Toplama ${h.gathering} · Odunculuk ${h.lumber}</small></div></div><div class="equipment">${equip('Baş','body',h.body)}${equip('El','hand',h.hand)}${equip('Çanta','bag',h.bag)}${equip('Boyun','neck',h.neck)}</div><h3 class="subheading">Gönderilecek kaynak</h3><div class="resource-choice">${[[0,'Taş'],[17,'Odun'],[2,'Meyve']].map(([id,n])=>button(`${icon(id,'mini')}<br/>${n}`,`data-resource="${id}"`,selectedResource===id?'secondary chosen':'secondary')).join('')}</div><div class="save-row"><select id="job-length" class="select"><option value="1">1 dk</option><option value="5">5 dk</option><option value="10">10 dk</option></select>${button('Toplamaya gönder','id="send-helper"','wood')}</div>${h.job?`<div class="task">Kaya yolda · ${P.items[h.job.resource]} · ${Math.max(0,Math.ceil((h.job.until-Date.now())/60000))} dk kaldı ${button('Döndüyse teslim al','id="collect-helper"','secondary')}</div>`:''}<p class="muted">Çanta kapasitesi: ${P.helperCapacity(state)} · El aleti ve çanta yardımcının toplama verimini artırır.</p></section><section class="panel"><h2>Yardımcıyı besle</h2>${button('Yiyecek ver','id="feed-helper"','secondary')}</section>`}
function equip(name,slot,id){const candidates=P.itemData.filter(item=>slot==='hand'?Boolean(item.toolKind):item.slot===slot).map(item=>item.id);const available=candidates.filter(i=>state.inventory[i]>0||i===id);return `<div class="slot equip-slot">${id>=0?icon(id):'<span class="empty-slot">＋</span>'}<small>${name}</small>${id>=0?`<br/><span class="good">Takılı</span>`:''}${available.map(i=>button(id===i?`Takılı: ${P.items[i]}`:`Tak: ${P.items[i]}`,`data-helper-equip="${slot}:${i}"`,'secondary')).join('')}</div>`}
function village(){const b=state.buildings,sel=selectedBuilding,title=P.buildingNames[sel],cost=P.costs(state,sel),upgrade=true;const action=sel==='farm'?button('Hasadı topla','data-building-action="1"','wood'):button(sel==='home'?'Dinlen ve iyileş':sel==='fire'?'Ateş alanını kullan':`${title} geliştir`,'data-building-action="1"','wood');return `<h1>Köy · Seviye ${Math.max(...Object.values(b))}</h1><div class="village-scene">${[['home','Ev','left:8%;top:15%'],['depot','Depo','right:8%;top:19%'],['workshop','Atölye','left:8%;bottom:22%'],['farm','Tarla','right:10%;bottom:21%'],['fire','Ateş alanı','left:40%;bottom:8%']].map(([id,n,style])=>`<button class="hotspot ${sel===id?'selected':''}" style="${style}" data-building="${id}">${n}<small>Seviye ${b[id]}</small></button>`).join('')}</div><section class="panel"><h2>${title}</h2><p>${sel==='depot'?'Daha fazla kaynak saklamanı sağlar.':sel==='workshop'?'Yeni üretim zincirlerinin merkezidir.':sel==='farm'?'Her beş dakikada yiyecek yetiştirir.':sel==='fire'?'Isınır, enerji ve sağlık kazanırsın.':'Güvenli dinlenme ve toparlanma alanıdır.'}</p>${sel==='depot'?`<div class="row"><b>Kapasite ${P.used(state)}/${P.capacity(state)}</b><span class="good">→ ${P.capacity(state)+8}</span></div>`:''}${upgrade?`<p class="muted">Gerekli: Odun ${state.inventory[17]||0}/${cost[17]||0} · İp ${state.inventory[6]||0}/${cost[6]||0} · Taş ${state.inventory[0]||0}/${cost[0]||0}</p>`:''}${sel==='depot'||sel==='workshop'?'':action}${button('Geliştir · Seviye '+Math.min(5,b[sel]+1),`data-upgrade="${sel}" ${b[sel]>=5?'disabled':''}`,'wood')}${b[sel]>=5?'<p class="good">En yüksek seviye</p>':''}</section>`}
function map(){return `<h1>Keşif ve bölgeler</h1><div class="map-art" aria-label="PRIMAL bölge haritası"></div><section class="panel"><p class="muted">Bölge seç; hikâye ilerledikçe yeni geçitler ve kaynaklar açılır. Enerji bedeli: 12.</p>${P.regions.map((name,i)=>`<button class="recipe-card ${state.region===i?'selected':''}" data-travel-region="${i}">${icon(15+i,'mini')}<span class="grow"><b>${esc(name)}</b><br/><small>${state.regionsVisited?.[i]?'Keşfedildi':'Bilinmiyor'} · ${i===0?'Kıyı kampı':i===1?'Mira’nın ormanı':i===2?'Kar geçidi':'Volkan yolu'}</small></span>${state.region===i?'<b>Buradasın</b>':'<span>→</span>'}</button>`).join('')}</section><section class="panel"><h2>Mevcut hedef</h2><p>${esc(P.objective(state))}</p></section>`}
function eventPanel(){const e=P.events.find(x=>state.events[x.id]&&state.events[x.id].active&&!state.events[x.id].resolved);if(!e)return '<section class="panel"><h2>Olay günlüğü</h2><p class="muted">Şimdilik sakin. Keşif yaptıkça yeni olaylar açılacak.</p></section>';return `<section class="panel"><h2>${esc(e.name)}</h2><p>${esc(e.text)}</p><div class="actions">${e.choices.map((c,i)=>button(esc(c.text),`data-event="${e.id}" data-event-choice="${i}"`,'secondary')).join('')}</div></section>`}
function skillPanel(){const techs=P.technologies||[];return `<section class="panel"><h2>15 beceri</h2><div class="recipe-parts">${P.skills.map((s,i)=>`<span>${esc(s.name)} · Seviye ${state.skills[i].level} · ${state.skills[i].xp}/${100+state.skills[i].level*20} DP<br><small>${esc(s.action)}</small></span>`).join('')}</div><h3 class="subheading">Teknoloji ağacı</h3>${techs.map((t,i)=>`<div class="countline"><span>${state.technologies?.[i]?'✓':'○'} ${esc(t.name)}<small> · ${esc(t.description)}</small></span>${state.technologies?.[i]?'':button('Aç',`data-technology="${i}"`,'secondary')+`<small>Gerekli beceri ${Math.floor(i/3)} · Odun ${t.cost[17]}, ip ${t.cost[6]}, taş ${t.cost[0]}</small>`}</div>`).join('')}</section>`}
function questPanel(){
 const active=state.quests.filter(q=>P.questStatus(state,q.id)==='active'),done=state.quests.filter(q=>q.status==='complete'),locked=state.quests.length-active.length-done.length;
 const row=q=>{const d=P.quests[q.id];return `<div class="quest-row"><b>${esc(d.name)}</b><p>${esc(P.questTarget(d))} · ${q.progress}/${d.amount}</p><small>${{craft:'Üret',gather:'Topla',explore:'Ziyaret et veya araştır',build:'Binayı kullan veya geliştir',event:'Olayı çöz'}[d.type]} · Ödül: ${d.reward.xp} deneyim</small></div>`};
 return `<section class="panel"><h2>Görevler · ${done.length}/${P.quests.length}</h2>${active.slice(0,4).map(row).join('')||'<p>Bu bölümde bekleyen görev yok.</p>'}${active.length>4?`<details><summary>Diğer aktif görevler (${active.length-4})</summary>${active.slice(4).map(row).join('')}</details>`:''}<p class="muted">${locked} görev ilerleyen bölümlerde açılacak.</p><details><summary>Tamamlananlar (${done.length})</summary>${done.map(row).join('')}</details></section>`;
}
function journal(){const st=P.statistics(state);return `<h1>Ustalığa ilk adım</h1><section class="panel dialogue"><div class="row"><div class="portrait" style="background-position:100% 0"></div><p>${esc(P.dialogue(state))}</p></div>${P.choiceOptions(state).length?`<div class="story-choices">${P.choiceOptions(state).map((label,i)=>button(esc(label),`data-choice="${i}"`,'secondary')).join('')}</div>`:''}${state.chapter===0?button('Akın’dan ateş ve kap ipucu al','data-learn-hint'):''}</section><section class="panel"><h2>Akın’ın notları</h2><p>Bulunduğun bölgedeki yeni bir üretim tekniğini öğren. Bedeli 10 enerji; bütün formülleri bir kerede göstermez.</p>${button('Yeni tarif araştır','data-research','secondary')}</section>${eventPanel()}${questPanel()}${skillPanel()}<section class="panel"><h2>İlerleme istatistikleri</h2><div class="recipe-parts"><span>Bulunan nesne: ${st.items}/343</span><span>Tarif: ${st.recipes}/${P.recipes.length}</span><span>Görev: ${st.quests}/87</span><span>Bölüm: ${st.chapter}/5</span><span>Başarım: ${st.achievements}/${P.achievements.length}</span></div></section><section class="panel"><h2>Başarımlar</h2>${P.achievements.map(a=>`<div class="countline"><span>${esc(a.name)}<small> · ${esc(a.description)}</small></span><b class="${P.achievementStatus(state,a.id)==='unlocked'?'good':''}">${P.achievementStatus(state,a.id)==='unlocked'?'✓':'·'}</b></div>`).join('')}</section><section class="panel"><h2>Hikâye kayıtları</h2>${state.journal.slice().reverse().map(x=>`<p class="journal-log">${esc(x)}</p>`).join('')}</section><section class="panel"><h2>Kayıt yuvaları</h2><p class="muted">Üç ayrı yolculuğu sakla; otomatik kayıt ayrıca korunur.</p><div class="save-row">${[1,2,3].map(i=>button(`Slot ${i} kaydet`,`data-slot-save="${i}"`,'secondary')).join('')}</div><div class="save-row">${[1,2,3].map(i=>button(`Slot ${i} yükle`,`data-slot-load="${i}"`,'secondary')).join('')}</div><div class="save-row">${button('Şimdi elle kaydet','data-save="1"','secondary')}${button('Elle kaydı yükle','data-load="1"','secondary')}</div><div class="save-row">${button('Yeni oyun','data-new="1"','secondary danger')}${state.ended?button('Yeni oyun+','data-new-plus="1"','wood'):''}</div></section>`}
function playerEquipment(){return `<details class="panel"><summary>Ekipmanın ve kampın · ${P.used(state)}/${P.capacity(state)} çanta türü</summary>${Object.entries(state.equipment).map(([slot,id])=>`<div class="row"><span class="grow">${{body:'Giysi',bag:'Çanta / kemer',neck:'Boyun'}[slot]}: ${id>=0?esc(P.items[id]):'Boş'}</span>${id>=0?button('Çıkar',`data-unequip="${slot}"`):''}</div>`).join('')}<p class="muted">Koruma ${P.protection(state)} · Ortam ${P.temperature(state)} °C</p>${Object.entries(state.installed).map(([id,n])=>`<p>${esc(P.items[id])} ×${n}</p>`).join('')}</details>`}
function settingsPage(){const volume=Math.round(preferences.volume*100);return `<h1>Ayarlar</h1><section class='panel settings-panel'><div class='settings-intro'><h2>PRIMAL yolculuğu</h2><p class='muted'>Kontroller, ses ve kayıtlar burada. Bu ekran telefonun sistem saatinden bağımsızdır.</p>${button('Kampa dön','data-back-camp=1','wood')}</div></section><section class='panel settings-panel'><h2>Konfor</h2><label class='setting-row'><span><b>Ses efektleri</b><small>Üretim, hata ve başarı seslerini kullan</small></span><input id='pref-sound' type='checkbox' ${preferences.sound?'checked':''}></label><label class='setting-row'><span><b>Ses seviyesi</b><small>Efekt yüksekliği</small></span><span class='range-wrap'><input id='pref-volume' type='range' min='0' max='1' step='.05' value='${preferences.volume}'><output id='pref-volume-value'>${volume}%</output></span></label><label class='setting-row'><span><b>Titreşim</b><small>Dokunma geri bildirimi</small></span><input id='pref-vibrate' type='checkbox' ${preferences.vibrate?'checked':''}></label><label class='setting-row'><span><b>Hareketler</b><small>Geçiş animasyonları</small></span><input id='pref-motion' type='checkbox' ${preferences.motion?'checked':''}></label><div class='save-row'>${button('Varsayılanlara dön','data-reset-prefs=1','secondary')}</div></section><section class='panel settings-panel'><h2>Kayıt yönetimi</h2><p class='muted'>Otomatik kayıt her işlemden sonra tutulur. Elle kayıt ve üç ayrı slot birbirinden bağımsızdır.</p><div class='save-row'>${button('Şimdi elle kaydet','data-save=1','secondary')}${button('Elle kaydı yükle','data-load=1','secondary')}</div><div class='save-row'>${[1,2,3].map(i=>button('Slot '+i+' kaydet','data-slot-save='+i,'secondary')).join('')}</div><div class='save-row'>${[1,2,3].map(i=>button('Slot '+i+' yükle','data-slot-load='+i,'secondary')).join('')}</div></section><section class='panel settings-panel'><h2>Yolculuk</h2><p class='muted'>Hikâye: Bölüm ${state.chapter+1}/5 · Tarif: ${state.discovered.filter(Boolean).length}/${P.recipes.length} · Eşya: ${state.inventory.filter(n=>n>0).length}/${P.items.length}</p><div class='save-row'>${button('Yeni oyun','data-new=1','secondary danger')}${state.ended?button('Yeni oyun+','data-new-plus=1','wood'):''}</div></section>`}
function finishPointerMaterial(id,x,y){
  const target=document.elementFromPoint(x,y);
  const zone=target&&target.closest?target.closest('.dropzone'):null;
  if(pointerDrag?.ghost)pointerDrag.ghost.remove();
  pointerDrag=null;
  if(!zone)return false;
  if(materialSelection.filter(x=>x===id).length<state.inventory[id])materialSelection.push(id);render();return true;
}
function bind(){
 document.querySelectorAll('[data-item]').forEach(el=>{
  const id=+el.dataset.item;
  const isIngredient=P.recipes.some(r=>Object.prototype.hasOwnProperty.call(r.input,id));
  el.onclick=()=>{if(Date.now()<suppressClickUntil)return;if(materialSelection.filter(x=>x===id).length<state.inventory[id]){materialSelection.push(id);render()}else toast('Bu malzemeden daha fazla yok.');};
  el.ondragstart=e=>{dragId=id;e.dataTransfer.setData('text/plain',dragId)};
  el.onpointerdown=e=>{
   if(e.pointerType==='mouse')return;
   pointerDrag={id,startX:e.clientX,startY:e.clientY,moved:false,axis:null,ghost:null,pointerId:e.pointerId};
  };
  el.onpointermove=e=>{
   if(!pointerDrag||pointerDrag.id!==id)return;
   const dx=e.clientX-pointerDrag.startX,dy=e.clientY-pointerDrag.startY;
   const moved=Math.hypot(dx,dy)>8;
   if(!moved)return;
   if(!pointerDrag.axis)pointerDrag.axis=Math.abs(dx)>Math.abs(dy)?'scroll':'drag';
   if(pointerDrag.axis==='scroll'){suppressClickUntil=Date.now()+500;pointerDrag=null;return}
   if(!pointerDrag.moved){
    pointerDrag.moved=true;
    el.setPointerCapture?.(e.pointerId);
    const ghost=el.cloneNode(true);ghost.className='drag-ghost';document.body.appendChild(ghost);pointerDrag.ghost=ghost;
   }
   if(pointerDrag.moved&&pointerDrag.ghost){pointerDrag.ghost.style.left=e.clientX+'px';pointerDrag.ghost.style.top=e.clientY+'px';e.preventDefault()}
  };
  el.onpointerup=e=>{
   if(!pointerDrag||pointerDrag.id!==id)return;
   const drag=pointerDrag;suppressClickUntil=Date.now()+500;
   if(drag.moved)finishPointerMaterial(drag.id,e.clientX,e.clientY);
   else if(page==='camp'&&isIngredient){pointerDrag=null;if(materialSelection.filter(x=>x===drag.id).length<state.inventory[drag.id])materialSelection.push(drag.id);render()}
   else{if(drag.ghost)drag.ghost.remove();pointerDrag=null}
   e.preventDefault();
  };
  el.onpointercancel=()=>{if(pointerDrag?.ghost)pointerDrag.ghost.remove();pointerDrag=null};
  el.ondblclick=()=>{selectedItem=id;render()}
 });
 document.querySelectorAll('.dropzone').forEach(z=>{z.ondragover=e=>{e.preventDefault();z.classList.add('over')};z.ondragleave=()=>z.classList.remove('over');z.ondrop=e=>{e.preventDefault();z.classList.remove('over');dragId=+e.dataTransfer.getData('text');if(Number.isInteger(dragId)&&dragId>=0&&dragId<P.items.length&&materialSelection.filter(id=>id===dragId).length<state.inventory[dragId]){materialSelection.push(dragId);render()}}});document.querySelectorAll('[data-clear-material]').forEach(b=>b.onclick=()=>{materialSelection=[];render()});
 const recipeSearch=$('#recipe-search');if(recipeSearch)recipeSearch.oninput=()=>{const query=recipeSearch.value.trim().toLocaleLowerCase('tr-TR');document.querySelectorAll('[data-recipe-category]').forEach(card=>{card.style.display=!query||card.dataset.recipeName.includes(query)?'':'none'})};
 const quickCraft=index=>{
  const r=P.recipes[index];if(!r||!state.discovered[index])return toast('Bu tarif henüz keşfedilmedi.');
  selectedRecipe=index;
  const tool=r.tool<0?-1:P.items.findIndex((_,id)=>P.availableTool(state,id)&&P.toolMatches(id,r.tool));
  if(r.tool>=0&&tool<0)return toast('Gerekli alet sende yok.');
  const equipped=P.reduce(state,{type:'equip',item:tool});if(!equipped.ok)return toast(equipped.message);
  selectedTool=tool;return act({type:'craft',recipe:index});
 };
 const craft=()=>{
  if(page==='recipes')return quickCraft(selectedRecipe);
  if(!materialSelection.length)return toast('Önce çantadan malzeme seç.');
  const plan=P.findRecipePlan(materialSelection,state.tool);
  if(!plan)return toast('Bu birleşim sonuç vermedi. Aleti ve malzeme adetlerini değiştir; hiçbir malzeme harcanmadı.');
  const result=act({type:'craft',recipe:plan.recipeId,quantity:plan.batches});
  if(result.ok){
   const remaining=[],used={...(result.consumedInputs||{})};
   for(const id of materialSelection){if(used[id]>0)used[id]--;else remaining.push(id)}
   materialSelection=remaining;render();
  }
  return result;
 };
 const craftButton=$('#craft-now');if(craftButton)craftButton.onclick=craft;
 const toolSelect=$('#tool-select');if(toolSelect)toolSelect.onchange=()=>{selectedTool=+toolSelect.value;act({type:'equip',item:selectedTool})};
 document.querySelectorAll('[data-craft-recipe]').forEach(b=>b.onclick=()=>quickCraft(+b.dataset.craftRecipe));
 document.querySelectorAll('[data-gather]').forEach(b=>b.onclick=()=>act({type:'gather'}));document.querySelectorAll('[data-gather-kind]').forEach(b=>b.onclick=()=>act({type:'gather',kind:b.dataset.gatherKind}));document.querySelectorAll('[data-gather-resource]').forEach(b=>b.onclick=()=>act({type:'gather',resource:+b.dataset.gatherResource}));
 [['#eat',{type:'eat'}],['#drink',{type:'drink'}],['#rest',{type:'rest'}],['#explore',{type:'explore'}],['#feed-helper',{type:'feed'}],['#collect-helper',{type:'collect'}],['#harvest',{type:'harvest'}]].forEach(([q,a])=>{const b=$(q);if(b)b.onclick=()=>act(a)});
 const send=$('#send-helper');if(send)send.onclick=()=>act({type:'send',resource:selectedResource,minutes:+$('#job-length').value});document.querySelectorAll('[data-resource]').forEach(b=>b.onclick=()=>{selectedResource=+b.dataset.resource;render()});
  document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>act({type:'choice',choice:+b.dataset.choice}));document.querySelectorAll('[data-event-choice]').forEach(b=>b.onclick=()=>act({type:'event',event:+b.dataset.event,choice:+b.dataset.eventChoice}));document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{inventoryFilter=b.dataset.filter;render()});const inventorySearch=$('#inventory-search');if(inventorySearch)inventorySearch.oninput=()=>{inventoryQuery=inventorySearch.value;filterInventory()};const clearInventorySearch=$('#clear-inventory-search');if(clearInventorySearch)clearInventorySearch.onclick=()=>{inventoryQuery='';render()};filterInventory();document.querySelectorAll('[data-open-recipe]').forEach(b=>b.onclick=()=>{const id=+b.dataset.openRecipe;if(!state.discovered[id])return;selectedRecipe=id;page='recipes';render();$('#content').scrollTop=0});
 document.querySelectorAll('[data-helper-equip]').forEach(b=>b.onclick=()=>{const [slot,item]=b.dataset.helperEquip.split(':');act({type:'helperEquip',slot,item:+item})});document.querySelectorAll('[data-travel-region]').forEach(b=>b.onclick=()=>act({type:'travel',region:+b.dataset.travelRegion}));document.querySelectorAll('[data-technology]').forEach(b=>b.onclick=()=>act({type:'technology',technology:+b.dataset.technology}));document.querySelectorAll('[data-building]').forEach(b=>b.onclick=()=>{selectedBuilding=b.dataset.building;render()});const buildingAction=$('[data-building-action]');if(buildingAction)buildingAction.onclick=()=>act({type:'building',building:selectedBuilding});
 document.querySelectorAll('[data-back-camp]').forEach(b=>b.onclick=()=>{page='camp';render()});
 const prefSound=$('#pref-sound');if(prefSound)prefSound.onchange=()=>{preferences.sound=prefSound.checked;savePreferences();render()};const prefVolume=$('#pref-volume');if(prefVolume)prefVolume.oninput=()=>{preferences.volume=+prefVolume.value;savePreferences();const out=$('#pref-volume-value');if(out)out.value=Math.round(preferences.volume*100)+'%';if(out)out.textContent=Math.round(preferences.volume*100)+'%'};const prefVibrate=$('#pref-vibrate');if(prefVibrate)prefVibrate.onchange=()=>{preferences.vibrate=prefVibrate.checked;savePreferences();render()};const prefMotion=$('#pref-motion');if(prefMotion)prefMotion.onchange=()=>{preferences.motion=prefMotion.checked;savePreferences();applyPreferences();render()};const resetPrefs=$('[data-reset-prefs]');if(resetPrefs)resetPrefs.onclick=()=>{preferences={...defaultPreferences};savePreferences();render()};const saveB=$('[data-save]');if(saveB)saveB.onclick=()=>{toast(save('manual')?'Elle kayıt alındı.':notice)};const loadB=$('[data-load]');if(loadB)loadB.onclick=()=>{try{const raw=globalThis.AndroidStore?AndroidStore.read('manual'):localStorage.getItem('primal-manual');if(!raw)throw Error('Elle kayıt yok.');state=P.migrate(JSON.parse(raw));render();toast('Elle kayıt yüklendi.')}catch(e){toast(e.message)}};document.querySelectorAll('[data-slot-save]').forEach(b=>b.onclick=()=>{toast(save(`slot-${b.dataset.slotSave}`)?`Slot ${b.dataset.slotSave} kaydedildi.`:notice)});document.querySelectorAll('[data-slot-load]').forEach(b=>b.onclick=()=>{try{const slot=b.dataset.slotLoad,raw=globalThis.AndroidStore?AndroidStore.read(`slot-${slot}`):localStorage.getItem(`primal-slot-${slot}`);if(!raw)throw Error(`Slot ${slot} boş.`);state=P.migrate(JSON.parse(raw));render();toast(`Slot ${slot} yüklendi.`)}catch(e){toast(e.message)}});const nb=$('[data-new]');if(nb)nb.onclick=()=>{if(confirm('Yeni oyun başlatılsın mı? Elle kayıt korunur.')){state=P.newGame(Date.now());state.introduced=true;save();render()}};
 const nbp=$('[data-new-plus]');if(nbp)nbp.onclick=()=>{try{state=P.newGamePlus(state,(state.prestige||0)+1);save();render()}catch(e){toast(e.message)}};const settings=$('#settings');if(settings)settings.onclick=()=>{page='settings';render()};const rh=$('#recipe-head');if(rh)rh.onclick=()=>{page='recipes';render()};
}
render();
})();
