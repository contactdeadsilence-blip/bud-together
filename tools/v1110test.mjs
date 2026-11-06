import pup from 'puppeteer-core';
import fs from 'fs';
import http from 'http';
import {spawn} from 'child_process';
import {seedTown,PROPS,buyProp,ownedGrow,TOWN_V} from '../src/town.js';
import {misView} from '../src/missions.js';

fs.mkdirSync('/workspace/ui-shots/grow',{recursive:true});
let pass=0,fail=0;const ok=(n,c)=>{if(c){pass++;console.log('PASS',n)}else{fail++;console.log('FAIL',n)}}

const w0={money:50000,build:[],ents:[],nid:1,props:{},cnt:{},disc:{},biz:{opened:0,locs:[{id:'home'}]},room:1,xp:0,earned:0};
seedTown(w0);
ok('town seed',w0._townV===TOWN_V&&w0.build.filter(p=>p.gk?.startsWith('town_')).length>50);
ok('8 props',PROPS.length===8);
ok('signs',w0.ents.filter(e=>e.type==='forsale').length===8);
buyProp(w0,'lot_a',()=>{});
ok('buy lot',!!w0.props.lot_a&&ownedGrow(w0)>=1);
ok('mission',!!misView(w0).find(m=>m.id==='p_prop2'&&m.ready));

function up(url){return new Promise(r=>{try{const u=new URL(url);const req=http.get({hostname:u.hostname,port:u.port,path:'/health',timeout:1500},res=>{r(res.statusCode===200)});req.on('error',()=>r(false));req.on('timeout',()=>{req.destroy();r(false)})}catch{r(false)}})}
let child=null;const PORT=process.env.PORT||'3097';
if(!(await up('http://127.0.0.1:'+PORT+'/health'))){
  child=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_STORE:'memory',DATABASE_URL:'',BT_DEBUG:'1'},stdio:'ignore'});
  for(let i=0;i<50;i++){if(await up('http://127.0.0.1:'+PORT+'/health'))break;await new Promise(r=>setTimeout(r,200))}
}
const browser=await pup.launch({executablePath:process.env.CHROME||'/usr/bin/google-chrome-stable',headless:true,args:['--no-sandbox','--window-size=1280,720']});
const P=await browser.newPage();await P.setViewport({width:1280,height:720});
await P.evaluateOnNewDocument(()=>{localStorage.bt_look=JSON.stringify({sex:'m',skin:2,build:.5,muscle:.5,height:.5,fit:{top:{id:'tee',c:1,p:0},bot:{id:'jeans',c:0,p:0},shoe:{id:'sneakers',c:0,p:0}}});localStorage.bt_wn='1.11.0';localStorage.bt_book='1'});
await P.goto('http://127.0.0.1:'+PORT,{waitUntil:'domcontentloaded',timeout:60000});
await P.waitForSelector('button',{timeout:30000});
await P.evaluate(()=>[...document.querySelectorAll('button')].find(x=>x.dataset.a==='solo')?.click());
await P.waitForFunction(()=>window.__bt?.game,{timeout:30000});
await P.evaluate(()=>{window.__bt.closeCre?.();['cre','menu','wn','pause'].forEach(id=>document.getElementById(id)?.classList.remove('on'))});
await new Promise(r=>setTimeout(r,800));
ok('game',await P.evaluate(()=>!!window.__bt?.game));
const meta=await P.evaluate(()=>({townV:window.__bt.townV?.()|0,pieces:(window.__bt.W?.build||[]).filter(p=>String(p.gk||'').startsWith('town_')).length,signs:(window.__bt.W?.ents||[]).filter(e=>e.type==='forsale').length,shedB:!!window.__bt.W?.shedB,props:window.__bt.props?.()}));
ok('live town',meta.townV>=1&&meta.pieces>50&&meta.signs>=4);
ok('shed intact',meta.shedB);

// FPS baseline at shed
await P.evaluate(()=>{window.__bt.tp(0,3.5);window.__bt.look(0,-.1)});
await new Promise(r=>setTimeout(r,2000));
const fpsShed=await P.evaluate(()=>window.__bt.fps?.()||0);

// Town overview shot
await P.evaluate(()=>{window.__bt.cam([8,26,58,12,1,28])});
await new Promise(r=>setTimeout(r,1200));
await P.screenshot({path:'/workspace/ui-shots/grow/v1110-town-overview.png'});
await P.evaluate(()=>window.__bt.cam(null));
const fpsTown=await P.evaluate(()=>window.__bt.fps?.()||0);

// For-sale building
await P.evaluate(()=>{
  const s=(window.__bt.W?.ents||[]).find(e=>e.type==='forsale'&&e.data?.pid==='cafe');
  if(s){window.__bt.warp(s.x,s.z+2.2,0,-0.15)}
});
await new Promise(r=>setTimeout(r,700));
await P.screenshot({path:'/workspace/ui-shots/grow/v1110-forsale.png'});
ok('forsale prompt',await P.evaluate(()=>{const p=document.getElementById('prompt')?.innerText||'';return /Buy|For sale|FOR SALE/i.test(p)||window.__bt.target?.()==='buyprop'}));

// Buy house_a via dbg money + buyprop
await P.evaluate(()=>{window.__bt.send({t:'dbg',money:20000});window.__bt.send({t:'buyprop',id:'house_a'})});
await new Promise(r=>setTimeout(r,900));
ok('owned',await P.evaluate(()=>!!window.__bt.props?.()?.house_a));

await P.evaluate(()=>{
  window.__bt.bld?.toggle?.(true);
  window.__bt.cam([-18,12,40,-20,1.5,29]);
});
await new Promise(r=>setTimeout(r,800));
await P.screenshot({path:'/workspace/ui-shots/grow/v1110-owned-build.png'});
await P.evaluate(()=>window.__bt.cam(null));
ok('build mode',await P.evaluate(()=>!!window.__bt.bld?.isOn?.()));

console.log(JSON.stringify({meta,fpsShed,fpsTown}));
console.log(`${pass}/${pass+fail} passed`);
await browser.close();if(child)try{child.kill()}catch{}
process.exit(fail?1:0);
