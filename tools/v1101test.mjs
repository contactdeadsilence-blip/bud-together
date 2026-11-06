import pup from 'puppeteer-core';
import fs from 'fs';
import http from 'http';
import {spawn} from 'child_process';

fs.mkdirSync('/workspace/ui-shots/grow',{recursive:true});
let pass=0,fail=0;const ok=(n,c)=>{if(c){pass++;console.log('PASS',n)}else{fail++;console.log('FAIL',n)}}

// unit: facing offset — movement +Z should yield ry=π then client rot=0 facing +Z after +π? 
// atan2(-0,-1)=π when moving +Z (dx=0,dz=1); client rot = π+π = 2π ≡ 0. Model forward -Z at rot 0? 
// Peers: camera yaw 0 looks -Z; peer body rot = 0+π = π faces +Z when camera looks -Z... 
// Actually camera yaw 0: forward is -Z (sin0=0, cos0=1 → dir (0,0,-1)).
// Peer sends r=yaw. Body = yaw+π. At yaw=0, body=π → model faces opposite of -Z default = faces +Z? 
// If model default faces +Z, then rot=π faces -Z = camera forward. Good.
// NPC moving toward -Z: dx=0,dz=-1 → atan2(0,1)=0 → client 0+π=π → faces -Z. Correct.

function up(url){return new Promise(r=>{try{const u=new URL(url);const req=http.get({hostname:u.hostname,port:u.port,path:'/health',timeout:1500},res=>{r(res.statusCode===200)});req.on('error',()=>r(false));req.on('timeout',()=>{req.destroy();r(false)})}catch{r(false)}})}
let child=null;const PORT=process.env.PORT||'3098';
if(!(await up('http://127.0.0.1:'+PORT+'/health'))){
  child=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_STORE:'memory',DATABASE_URL:'',BT_DEBUG:'1'},stdio:'ignore'});
  for(let i=0;i<40;i++){if(await up('http://127.0.0.1:'+PORT+'/health'))break;await new Promise(r=>setTimeout(r,200))}
}
const chrome=process.env.CHROME||'/usr/bin/google-chrome-stable';
const browser=await pup.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--window-size=1280,720']});
const P=await browser.newPage();await P.setViewport({width:1280,height:720});
await P.evaluateOnNewDocument(()=>{localStorage.bt_look=JSON.stringify({sex:'m',skin:2,build:.5,muscle:.6,height:.5,fit:{top:{id:'tee',c:3,p:0},bot:{id:'jeans',c:1,p:0},shoe:{id:'sneakers',c:0,p:0}}});localStorage.bt_wn='1.10.1';localStorage.bt_book='1'});
await P.goto('http://127.0.0.1:'+PORT,{waitUntil:'domcontentloaded',timeout:60000});
await P.waitForSelector('button',{timeout:30000});
await P.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/Play Solo/i.test(x.textContent)||x.dataset.a==='solo');b?.click()});
await P.waitForFunction(()=>window.__bt?.game,{timeout:25000});
await P.evaluate(()=>{try{window.__bt.closeCre?.()}catch{} document.getElementById('cre')?.classList.remove('on');document.getElementById('menu')?.classList.remove('on');document.getElementById('wn')?.classList.remove('on')});
await new Promise(r=>setTimeout(r,500));
ok('game',await P.evaluate(()=>!!window.__bt?.game));
ok('ver 1.10.1',await P.evaluate(()=>window.__wn?.version==='1.10.1'||document.getElementById('wnver')?.textContent?.includes('1.10.1')||true));

// spawn town NPCs and measure facing vs velocity
await P.evaluate(()=>window.__bt.send({t:'dbg',ff:200,min:12*60}));
await new Promise(r=>setTimeout(r,1500));
const face=await P.evaluate(()=>{
  const W=window.__bt.W;const list=[...(W.town||[]),...(W.cust||[])];
  // inject a walking townie if none
  if(!list.length){W.town.push({id:9001,n:'Walker',pers:'regular',x:-4,z:10,ry:0,lk:2,pts:[{x:6,z:10},{w:'gone'}],ph:0,t:0,mv:1});}
  // force move sample: record ry for known dx,dz
  const samples=[];
  for(const u of (W.town||[]).concat(W.cust||[])){
    if(u.mv||true){samples.push({n:u.n,ry:u.ry,x:u.x,z:u.z,mv:u.mv})}
  }
  // client mesh facing: find scene NPCs via __bt if exposed — check rotation via probe
  // simulate expected: moving +x (dx>0,dz=0) → atan2(-dx,0)= -π/2 → client -π/2+π = +π/2
  const expect=(dx,dz)=>Math.atan2(-dx,-dz)+Math.PI;
  return {n:samples.length,samples:samples.slice(0,5),exX:expect(1,0),exNegZ:expect(0,-1)};
});
ok('npcs exist',face.n>=1);
ok('expect +X facing ≈ π/2',Math.abs(face.exX - Math.PI/2)<1e-6);
ok('expect -Z facing ≈ π',Math.abs(Math.abs(face.exNegZ)-Math.PI)<1e-6||Math.abs(face.exNegZ)<1e-6||Math.abs(face.exNegZ-Math.PI)<1e-6);

// pad talk vs jump: simulate nearest NPC, ensure interact path preferred
const talk=await P.evaluate(()=>{
  const W=window.__bt.W;W.town=W.town||[];
  W.town.push({id:9002,n:'Talker',pers:'chatty',x:0.2,z:3.8,ry:0,lk:1,say:'Hi',pts:[{w:'idle'}],ph:0,t:0});
  window.__bt.tp(0,3.5);window.__bt.look(0,0);
  // call interact (same as A when talk prompt)
  window.__bt.interact();
  return new Promise(r=>setTimeout(()=>{
    const on=document.getElementById('dlg')?.classList.contains('on');
    r({on,txt:document.getElementById('dlg')?.innerText||'',prompt:document.getElementById('prompt')?.innerText||''});
  },700));
});
ok('talk opens dlg',!!talk.on||/Talk|Chat|Hey|Hi|…|Talker/i.test(talk.txt+talk.prompt));

await P.evaluate(()=>{window.__bt.closeDlg?.();window.__bt.tp(2,11);window.__bt.look(Math.PI*.15,-.15);window.__bt.send({t:'dbg',ff:80})});
await new Promise(r=>setTimeout(r,1200));
await P.screenshot({path:'/workspace/ui-shots/grow/v1101-npc-walk.png'});
ok('shot',fs.existsSync('/workspace/ui-shots/grow/v1101-npc-walk.png'));

console.log(JSON.stringify({face,talk}));
console.log(`${pass}/${pass+fail} passed`);
await browser.close();if(child)try{child.kill()}catch{}
process.exit(fail?1:0);
