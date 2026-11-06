import pup from 'puppeteer-core';
import fs from 'fs';
import http from 'http';
import {spawn} from 'child_process';
import {seedTown,PROPS,ROADS,onRoad,onCorridor,TOWN_V,isTownGk} from '../src/town.js';

fs.mkdirSync('/workspace/ui-shots/grow',{recursive:true});
let pass=0,fail=0;const ok=(n,c)=>{if(c){pass++;console.log('PASS',n)}else{fail++;console.log('FAIL',n)}}

// Road interiors must not overlap
function overlap(a,b){
  const x0=Math.max(a.x0,b.x0),x1=Math.min(a.x1,b.x1),z0=Math.max(a.z0,b.z0),z1=Math.min(a.z1,b.z1);
  return x1>x0&&z1>z0;
}
let ov=0;
for(let i=0;i<ROADS.length;i++)for(let j=i+1;j<ROADS.length;j++)if(overlap(ROADS[i],ROADS[j])){ov++;console.log('overlap',ROADS[i],ROADS[j])}
ok('roads non-overlap',ov===0);
ok('onRoad main',onRoad(0,22)&&onRoad(0,12)&&!onRoad(80,0)&&!onRoad(0,-20));
ok('corridor clears path',onCorridor(0,12,0.5));

const w0={money:50000,build:[{id:1,k:'wall',x:0,z:0,r:0,m:0,o:0,g:1}],ents:[],nid:2,props:{},cnt:{},disc:{},biz:{opened:0,locs:[{id:'home'}]},room:1,xp:0,earned:0};
seedTown(w0);
ok('town v2',w0._townV===TOWN_V);
ok('player piece kept',w0.build.some(p=>p.k==='wall'&&!isTownGk(p.gk)));
ok('town pieces',w0.build.filter(p=>isTownGk(p.gk)).length>50);
const roofs=w0.build.filter(p=>isTownGk(p.gk)&&(p.k==='roofs'||p.k==='roofr'));
ok('town roofs',roofs.length>=20);
// migrate again is idempotent
const n=w0.build.length;seedTown(w0);ok('idempotent',w0.build.length===n);

function up(url){return new Promise(r=>{try{const u=new URL(url);const req=http.get({hostname:u.hostname,port:u.port,path:'/health',timeout:1500},res=>{r(res.statusCode===200)});req.on('error',()=>r(false));req.on('timeout',()=>{req.destroy();r(false)})}catch{r(false)}})}
let child=null;const PORT=process.env.PORT||'3098';
if(!(await up('http://127.0.0.1:'+PORT+'/health'))){
  child=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_STORE:'memory',DATABASE_URL:'',BT_DEBUG:'1'},stdio:'ignore'});
  for(let i=0;i<50;i++){if(await up('http://127.0.0.1:'+PORT+'/health'))break;await new Promise(r=>setTimeout(r,200))}
}
const browser=await pup.launch({executablePath:process.env.CHROME||'/usr/bin/google-chrome-stable',headless:true,args:['--no-sandbox','--window-size=1280,720']});
const P=await browser.newPage();await P.setViewport({width:1280,height:720});
await P.evaluateOnNewDocument(()=>{localStorage.bt_look=JSON.stringify({sex:'m',skin:2,build:.5,muscle:.5,height:.5,fit:{top:{id:'tee',c:1,p:0},bot:{id:'jeans',c:0,p:0},shoe:{id:'sneakers',c:0,p:0}}});localStorage.bt_wn='1.11.1';localStorage.bt_book='1'});
await P.goto('http://127.0.0.1:'+PORT,{waitUntil:'domcontentloaded',timeout:60000});
await P.waitForSelector('button',{timeout:30000});
await P.evaluate(()=>[...document.querySelectorAll('button')].find(x=>x.dataset.a==='solo')?.click());
await P.waitForFunction(()=>window.__bt?.game,{timeout:35000});
await P.evaluate(()=>{window.__bt.closeCre?.();['cre','menu','wn','pause'].forEach(id=>document.getElementById(id)?.classList.remove('on'))});
await new Promise(r=>setTimeout(r,1500));
ok('game',await P.evaluate(()=>!!window.__bt?.game));
ok('townV2 live',await P.evaluate(()=>(window.__bt.townV?.()|0)>=2));

// Intersection shot (main + spur)
await P.evaluate(()=>window.__bt.cam([20,18,32, 20,0,24]));
await new Promise(r=>setTimeout(r,600));
await P.screenshot({path:'/workspace/ui-shots/grow/v1111-intersection.png'});

// Road clear of objects — look down main street
await P.evaluate(()=>window.__bt.cam([5,12,38, 10,0,22]));
await new Promise(r=>setTimeout(r,500));
await P.screenshot({path:'/workspace/ui-shots/grow/v1111-road-clear.png'});

// Roofs overview
await P.evaluate(()=>window.__bt.cam([8,22,55, 15,2,30]));
await new Promise(r=>setTimeout(r,600));
await P.screenshot({path:'/workspace/ui-shots/grow/v1111-roofs.png'});

await P.evaluate(()=>window.__bt.cam(null));
const fps=await P.evaluate(()=>window.__bt.fps?.()||0);
console.log(JSON.stringify({fps,townV:await P.evaluate(()=>window.__bt.townV()),roofs:roofs.length}));
console.log(`${pass}/${pass+fail} passed`);
await browser.close();if(child)try{child.kill()}catch{}
process.exit(fail?1:0);
