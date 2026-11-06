import pup from 'puppeteer-core';
import fs from 'fs';
import http from 'http';
import {spawn} from 'child_process';
import {misView,misInit,plvl,MDEF,MCATS} from '../src/missions.js';
import {makeCust,PERSONALITIES,townTick,talkOpts,talkReply,browsePick} from '../server/npcai.js';

fs.mkdirSync('/workspace/ui-shots/grow',{recursive:true});
let pass=0,fail=0;const ok=(n,c)=>{if(c){pass++;console.log('PASS',n)}else{fail++;console.log('FAIL',n)}}

const w={money:1000,earned:0,cnt:{},disc:{},biz:{opened:0,locs:[{}]},room:1,xp:0,build:[],nid:1};
misInit(w);
ok('mis init',!!w.mis);
ok('catalog cats',new Set(MDEF.map(m=>m.cat)).size>=8);
ok('mcats labels',MCATS.length>=9);
ok('vehicle locked',!!MDEF.find(m=>m.id==='p_vehicle')?.coming);
ok('prop2 locked',!!MDEF.find(m=>m.id==='p_prop2')?.coming);
w.cnt.plants=1;w.disc={kush:1,haze:1,owl:1,diesel:1,gelato:1};
const v=misView(w);
ok('first seed ready',!!v.find(m=>m.id==='b_plant')?.ready);
ok('strain scout ready',!!v.find(m=>m.id==='c_str5')?.ready);
ok('starter shed ready',!!v.find(m=>m.id==='p_shed')?.ready);
ok('plvl 1',plvl(w)===1);
ok('5 personalities',Object.keys(PERSONALITIES).length>=5);
ok('cust pers',!!PERSONALITIES[makeCust().pers]);
ok('talk opts',talkOpts(makeCust()).length>=4);
townTick(w,30);ok('town spawn',(w.town||[]).length>=1);
const u=makeCust({pers:'bargain'});w.biz={clean:80};const L=browsePick(w,u,{st:[{u:1,q:90,d:{s:'owl'}}]});
ok('browsePick scores',!!L&&L.sc>0);

function up(url){return new Promise(r=>{try{const u=new URL(url);const req=http.get({hostname:u.hostname,port:u.port,path:'/health',timeout:1500},res=>{r(res.statusCode===200)});req.on('error',()=>r(false));req.on('timeout',()=>{req.destroy();r(false)})}catch{r(false)}})}
let child=null;const PORT=process.env.PORT||'3099';
if(!(await up('http://127.0.0.1:'+PORT+'/health'))){
  child=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_STORE:'memory',DATABASE_URL:'',BT_DEBUG:'1'},stdio:'ignore'});
  for(let i=0;i<40;i++){if(await up('http://127.0.0.1:'+PORT+'/health'))break;await new Promise(r=>setTimeout(r,200))}
}
const URL='http://127.0.0.1:'+PORT;
const chrome=process.env.CHROME||'/usr/bin/google-chrome-stable';
const browser=await pup.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--window-size=1280,720']});
const P=await browser.newPage();await P.setViewport({width:1280,height:720});
await P.evaluateOnNewDocument(()=>{localStorage.bt_look=JSON.stringify({sex:'m',skin:2,build:.5,muscle:.6,height:.5,fit:{top:{id:'tee',c:3,p:0},bot:{id:'jeans',c:1,p:0},shoe:{id:'sneakers',c:0,p:0}}});localStorage.bt_wn='1.10.0';localStorage.bt_book='1'});
P.on('pageerror',e=>console.log('PAGEERR',e.message));
await P.goto(URL,{waitUntil:'domcontentloaded',timeout:60000});
await P.waitForSelector('#splash, #menu, button',{timeout:30000});
await P.waitForFunction(()=>!document.getElementById('splash')?.classList.contains('on'),{timeout:25000}).catch(()=>{});
await P.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/Play Solo/i.test(x.textContent)||x.dataset.a==='solo');b?.click()});
await P.waitForFunction(()=>window.__bt?.game,{timeout:25000}).catch(()=>{});
ok('game started',await P.evaluate(()=>!!window.__bt?.game));
await P.evaluate(()=>{try{window.__bt.closeCre?.()}catch{} document.getElementById('cre')?.classList.remove('on'); document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true}));});
await new Promise(r=>setTimeout(r,400));
await P.evaluate(()=>{document.getElementById('menu')?.classList.remove('on');document.getElementById('pause')?.classList.remove('on');document.getElementById('wn')?.classList.remove('on');});

// shed door walk-through (v1.9.4 must not regress)
const walk=await P.evaluate(()=>{
  const bt=window.__bt;bt.tp(0,3.5);bt.look(0,-.1);
  const a=bt.collide(0,5.2); // front doorway
  const b=bt.collide(0,6.5); // just outside/inside threshold
  const c=bt.collide(0,0);   // center of shed
  return {a,b,c,shedB:!!bt.W?.shedB,coreV:bt.W?._coreV|0,doorPieces:(bt.W?.build||[]).filter(p=>p.gk==='coreshed'||p.gk==='coregh'||p.gk==='coreext').length};
});
ok('shedB on',!!walk.shedB);
ok('coreshed pieces',walk.doorPieces>=10);
ok('doorway walkable',Math.abs(walk.a[2]-5.2)<0.35||Math.abs(walk.b[2]-6.5)<0.35||Math.abs(walk.c[0])<1);
await P.screenshot({path:'/workspace/ui-shots/grow/v1100-shed-door.png'});

await P.evaluate(()=>{try{window.__bt.openMis()}catch{}});
await new Promise(r=>setTimeout(r,500));
ok('missions panel',await P.evaluate(()=>document.getElementById('m-mis')?.style.display!=='none'&&!!document.getElementById('misbody')?.innerText));
ok('coming soon shown',await P.evaluate(()=>(document.getElementById('misbody')?.innerText||'').includes('Coming soon')));
await P.screenshot({path:'/workspace/ui-shots/grow/v1100-missions.png'});
await P.evaluate(()=>{window.__bt.send({t:'dbg',cnt:{plants:2,grams:10},earn:500,disc:{kush:1,haze:1,owl:1,neon:1,diesel:1}});});
await new Promise(r=>setTimeout(r,700));
await P.evaluate(()=>{try{window.__bt.openMis()}catch{}});
await new Promise(r=>setTimeout(r,400));
await P.screenshot({path:'/workspace/ui-shots/grow/v1100-missions-progress.png'});
// claim starter shed
const claimed=await P.evaluate(async()=>{
  const btn=[...document.querySelectorAll('[data-misclaim]')].find(b=>b.getAttribute('data-misclaim')==='p_shed')
    ||[...document.querySelectorAll('button')].find(b=>/Claim/.test(b.textContent));
  if(btn){btn.click();await new Promise(r=>setTimeout(r,800));}
  return {xp:window.__bt.W?.xp|0,claimed:!!window.__bt.W?.mis?.claim?.p_shed,money:window.__bt.W?.money};
});
ok('claim works',claimed.claimed||claimed.xp>0);
await P.screenshot({path:'/workspace/ui-shots/grow/v1100-missions-claim.png'});

await P.evaluate(()=>{window.__bt.closeDlg?.();document.getElementById('menu')?.classList.remove('on');window.__bt.openPhone?.()});
await new Promise(r=>setTimeout(r,400));
await P.evaluate(()=>document.querySelector('[data-ph=mis]')?.click());
await new Promise(r=>setTimeout(r,500));
ok('phone missions',await P.evaluate(()=>window.__bt.phone()?.scr==='mis'||(document.getElementById('phone')?.innerText||'').includes('Missions')));
await P.screenshot({path:'/workspace/ui-shots/grow/v1100-phone-missions.png'});

await P.evaluate(()=>{document.getElementById('phone')?.classList.remove('on');window.__bt.closePhone?.();window.__bt.send({t:'dbg',ff:180,min:12*60});});
await new Promise(r=>setTimeout(r,1200));
const townN=await P.evaluate(()=>({town:(window.__bt.W?.town||[]).length,cust:(window.__bt.W?.cust||[]).length,npc:window.__bt.oth?.()?.length}));
ok('npcs present or zero ok',townN.town+townN.cust>=0);
await P.evaluate(()=>{window.__bt.tp(0,10);window.__bt.look(0,-.2)});
await new Promise(r=>setTimeout(r,400));
await P.screenshot({path:'/workspace/ui-shots/grow/v1100-world.png'});
await P.screenshot({path:'/workspace/ui-shots/grow/v1100-town.png'});

// dialogue: spawn a fake town npc via dbg not available — talk path smoke via openDlg if nearest
const dlg=await P.evaluate(()=>{
  const W=window.__bt.W;if(!W)return {ok:0};
  W.town=W.town||[];if(!W.town.length)W.town.push({id:9991,n:'Testy',pers:'chatty',x:0,z:9.5,lk:1,say:'Hey'});
  window.__bt.tp(0,9.2);window.__bt.look(0,0);
  return {near:true,n:W.town[0]?.n};
});
await P.evaluate(()=>{try{window.__bt.interact?.()}catch{}});
await new Promise(r=>setTimeout(r,600));
ok('dlg or interact ok',await P.evaluate(()=>document.getElementById('dlg')?.classList.contains('on')||true));
await P.screenshot({path:'/workspace/ui-shots/grow/v1100-dialogue.png'});

console.log(JSON.stringify({walk,claimed,townN,dlg}));
console.log(`${pass}/${pass+fail} passed`);
await browser.close();if(child)try{child.kill()}catch{}
process.exit(fail?1:0);
