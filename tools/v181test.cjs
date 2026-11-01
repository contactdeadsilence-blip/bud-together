// repro: shed contents missing after reload (gumprr save)
const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const PORT=3311;const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:''},stdio:['ignore',require('fs').openSync('/tmp/repro.log','w'),require('fs').openSync('/tmp/srv172.log','a')]});await sl(700);
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:300000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const P=await b.newPage();await P.setViewport({width:1280,height:720});const errs=[];P.on('pageerror',e=>errs.push(e.message));
const GW=require('fs').readFileSync(process.env.SAVE||'/tmp/gumsave.json','utf8');await P.evaluateOnNewDocument(gw=>{try{localStorage.bt_guestw=JSON.stringify(JSON.parse(gw).w);localStorage.bt_seenacct=1;localStorage.bt_seen_version='99.0.0'}catch(e){};window.__pad={id:'Xbox Sim',index:0,connected:true,mapping:'standard',timestamp:0,buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0})),axes:[0,0,0,0]};navigator.getGamepads=()=>[window.__pad,null,null,null]},GW);
await P.goto(`http://localhost:${PORT}/?q='+(process.env.Q||2)+'`,{waitUntil:'networkidle0'});
const ev=(f,...a)=>P.evaluate(f,...a),st=()=>ev(()=>__bt.state());
const frames=async n=>{const f0=await ev(()=>__bt.frames);while(await ev(()=>__bt.frames)<f0+n)await sl(15)};
const set=(i,v)=>ev((i,v)=>{const b=__pad.buttons[i];b.pressed=v;b.value=v?1:0},i,v);
const press=async(i,hold=2)=>{await set(i,true);await frames(hold);await set(i,false);await frames(3)};
const A=0,B=1,X=2,Y=3,LB=4,RB=5,LT=6,RT=7,UP=12,DOWN=13,LEFT=14,RIGHT=15;
const res=[];const ok=(n,c,i='')=>{res.push(c);console.log(c?'PASS':'FAIL',n,i)};

await ev(()=>window.dispatchEvent(new Event('gamepadconnected')));
let s=await st();if(s.root=='splash'){await press(A);await frames(4)}if(await ev(()=>__bt.cre?.()))await press(B);await frames(3);if((await st()).root=='m-acct'){await ev(()=>document.querySelector('[data-a=guest]').click());await frames(3)}
s=await st();ok('menu shown',s.root=='m-main',s.root);
ok('no title/subtitle/HUD on menu',await ev(()=>!document.querySelector('#m-main h1')&&getComputedStyle(document.getElementById('hud')).display=='none'));
ok('menu renders at low pixel ratio',await ev(()=>__bt.gfx().pr<=1),JSON.stringify(await ev(()=>__bt.gfx().pr)));
ok('version label visible',await ev(()=>/1\.8\.1/.test(document.body.innerText)));
for(let i=1;i<=4;i++){await sl(1200);await frames(20);await P.screenshot({path:`/workspace/ui-shots/grow/v181-menu-${i}.png`})}
await press(DOWN);await frames(4);await P.screenshot({path:'/workspace/ui-shots/grow/v181-menu-focus.png'});ok('pad focus visible',await ev(()=>!!document.querySelector('#menu .btn.f')));await press(UP);await frames(4);
const f0=await ev(()=>__bt.frames),t0=Date.now();await sl(3000);const mfps=(await ev(()=>__bt.frames)-f0)/((Date.now()-t0)/1000);console.log('menu fps (swiftshader)',mfps.toFixed(1));
await press(A,4);await sl(2000);await frames(5);s=await st();ok('game started from save',s.root==null,s.root);
ok('pixel ratio restored in game',await ev(()=>__bt.gfx().pr>=0.5));
const W=()=>ev(()=>__bt.W);let w=await W();console.log('ents',w.ents.length,'room',w.room);
const sh=w.ents.find(e=>e.type=='shelf'&&!e.by);
// walk into a shelf from 1.6m away
await ev((x,z)=>{__bt.warp(x,z+1.6,0,0)},sh.x,sh.z);await frames(5);
await ev(()=>window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyW'})));await frames(90);await ev(()=>window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyW'})));await frames(3);
s=await st();const d=Math.hypot(s.x-sh.x,s.z-sh.z);ok('player blocked by shelf',d>.3,'dist '+d.toFixed(2)+' pos '+s.x?.toFixed?.(2)+','+s.z?.toFixed?.(2));
// placed inside an object -> can walk out
await ev((x,z)=>__bt.warp(x,z,0,0),sh.x,sh.z);await frames(3);
await ev(()=>window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyS'})));await frames(60);await ev(()=>window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyS'})));await frames(3);
s=await st();ok('never trapped inside object',Math.hypot(s.x-sh.x,s.z-sh.z)>.5,(s.x-sh.x).toFixed(2)+','+(s.z-sh.z).toFixed(2));
const fp0=await ev(()=>__bt.frames),tp0=Date.now();await sl(3000);console.log('game fps (swiftshader)',((await ev(()=>__bt.frames)-fp0)/((Date.now()-tp0)/1000)).toFixed(1));
await P.screenshot({path:'/workspace/ui-shots/grow/v181-ingame.png'});
ok('no page errors',!errs.length,errs.join(' | '));
console.log(res.filter(Boolean).length+'/'+res.length);await b.close();srv.kill();process.exit(0)})().catch(e=>{console.log('Error',e);process.exit(1)});
