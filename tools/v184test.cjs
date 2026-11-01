// repro: shed contents missing after reload (gumprr save)
const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const PORT=3314;const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:''},stdio:['ignore',require('fs').openSync('/tmp/repro.log','w'),require('fs').openSync('/tmp/srv172.log','a')]});await sl(700);
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
await press(A,4);await sl(2000);await frames(5);s=await st();ok('old save loads',s.root==null,s.root);
await ev(()=>document.body.click());await sl(4000);await frames(30);
let a=await ev(()=>__bt2.amb());console.log(JSON.stringify(a));ok('audio ctx',a.ac);ok('samples loaded',a.smp.length==3,a.smp.join());ok('ambience loaded + on',a.loaded&&a.on);
await ev(()=>__bt.warp(2,0,0,0));await frames(20);a=await ev(()=>__bt2.amb());ok('inside house = muffled',a.inside===true,JSON.stringify(a));
await ev(()=>__bt.warp(2,12,0,0));await frames(20);a=await ev(()=>__bt2.amb());ok('outside = open',a.inside===false,JSON.stringify(a));
const se=await ev(()=>{const r=[];for(const k of['press','clink','trim','scale','bag','seal'])try{__bt2.sfx(k)}catch(e){r.push(k+':'+e.message)}return r});ok('sample sfx play',!se.length,se.join());
await sl(1500);ok('no page errors',!errs.length,errs.join('|'));
console.log(res.filter(Boolean).length+'/'+res.length);await b.close();srv.kill();process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.error(e);process.exit(1)});
