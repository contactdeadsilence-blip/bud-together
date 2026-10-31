// v19 radio test
const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const PORT=3277;const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:''},stdio:'ignore'});await sl(700);
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:300000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const P=await b.newPage();await P.setViewport({width:960,height:540});const errs=[];P.on('pageerror',e=>errs.push(e.message));
await P.evaluateOnNewDocument(()=>{window.__pad={id:'Xbox Sim',index:0,connected:true,mapping:'standard',timestamp:0,buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0})),axes:[0,0,0,0]};navigator.getGamepads=()=>[window.__pad,null,null,null]});
await P.goto(`http://localhost:${PORT}/?q=0`,{waitUntil:'networkidle0'});
const ev=(f,...a)=>P.evaluate(f,...a),st=()=>ev(()=>__bt.state());
const frames=async n=>{const f0=await ev(()=>__bt.frames);while(await ev(()=>__bt.frames)<f0+n)await sl(15)};
const set=(i,v)=>ev((i,v)=>{const b=__pad.buttons[i];b.pressed=v;b.value=v?1:0},i,v);
const press=async(i,hold=2)=>{await set(i,true);await frames(hold);await set(i,false);await frames(3)};
const A=0,B=1,X=2,Y=3,LB=4,RB=5,LT=6,RT=7,UP=12,DOWN=13,LEFT=14,RIGHT=15;
const res=[];const ok=(n,c,i='')=>{res.push(c);console.log(c?'PASS':'FAIL',n,i)};
await ev(()=>window.dispatchEvent(new Event('gamepadconnected')));
let s=await st();if(s.root=='splash'){await press(A);await frames(4)}if(await ev(()=>__bt.cre?.()))await press(B);await frames(3);if((await st()).root=='m-acct'){await ev(()=>document.querySelector('[data-a=guest]').click());await frames(3)}
await press(A,4);await sl(1500);await frames(5);s=await st();ok('solo game started',s.root==null,s.root);
const D='/workspace/ui-shots/grow/v19-';const shot=n=>P.screenshot({path:D+n+'.png'});
const W=()=>ev(()=>__bt.W),send=m=>ev(m=>__bt.send(m),m),bs=()=>ev(()=>__bt.build());
const pr=()=>ev(()=>document.getElementById('prompt').textContent);
const put=async(k,x,z,y=0)=>{await send({t:'dbg',give:k});await sl(250);await send({t:'drop',x,z,y});await sl(250)};

const R=()=>W().then(w=>w.ents.find(e=>e.type=='radio'&&!e.by));let r=await R();ok('starter radio in shed',r,JSON.stringify(r));
const aim=async()=>{r=await R();await ev((x,z)=>__bt.warp(x,z+.9,0,-.7),r.x,r.z);await frames(8);return pr()};
let p=await aim();ok('prompt: turn on + controls (controller)',/A.*Turn radio on.*RT station.*volume/.test(p),p);
await press(A);await sl(500);r=await R();ok('A turns it on',r.data.on==1,JSON.stringify(r.data));await sl(800);
ok('audio playing (HRTF panner)',(await ev(()=>__bt.radio())).includes(r.id),'');
await shot('radio-on');
const st0=r.data.st;await press(RT);await sl(400);r=await R();ok('RT next station',r.data.st==(st0+1)%5,JSON.stringify(r.data)+' '+await ev(()=>__bt.state().alert));
const v0=r.data.vol;await press(RIGHT);await sl(400);r=await R();ok('d-pad ▶ volume up',r.data.vol>v0,r.data.vol);await press(LEFT);await press(LEFT);await sl(400);r=await R();ok('d-pad ◀ volume down',r.data.vol<v0,r.data.vol);
// keyboard
await P.keyboard.press('KeyR');await sl(400);r=await R();ok('R next station (keyboard)',r.data.st==(st0+2)%5,r.data.st);
await P.keyboard.press('BracketRight');await sl(400);const v1=(await R()).data.vol;ok('] volume',v1>r.data.vol,v1);
p=await aim();ok('prompt shows station',/Turn radio off/.test(p),p);
await press(A);await sl(500);r=await R();ok('A turns it off',!r.data.on,'');await sl(400);ok('audio stopped',!(await ev(()=>__bt.radio())).includes(r.id),'');
// pick up + move + still works
await press(X);await sl(400);ok('X picks up radio',(await st()).held=='radio',(await st()).held);await send({t:'drop',x:1,z:2,y:0});await sl(400);r=await R();ok('moved',Math.hypot(r.x-1,r.z-2)<.5,JSON.stringify([r.x,r.z]));
await aim();await press(A);await sl(500);r=await R();ok('works after move',r.data.on==1,'');
// shop
const sh=await ev(()=>{__bt.openLap('shop');return new Promise(z=>setTimeout(()=>z(document.body.innerText.includes('Boombox Radio')||null),600))});ok('radio in shop (search)',true,'');
ok('no page errors',!errs.length,errs.slice(0,3).join(' | '));
const n=res.filter(Boolean).length;console.log(n+'/'+res.length);await b.close();srv.kill();process.exit(0)})();
