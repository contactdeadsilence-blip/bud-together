// v22: build-mode remove/sell prompts + pad hold-Y sell + placed lights
const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const PORT=3347;const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:''},stdio:'ignore'});await sl(700);
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:300000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const P=await b.newPage();await P.setViewport({width:960,height:540});const errs=[];P.on('pageerror',e=>errs.push(e.message));
await P.evaluateOnNewDocument(()=>{window.__pad={id:'Xbox Sim',index:0,connected:true,mapping:'standard',timestamp:0,buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0})),axes:[0,0,0,0]};navigator.getGamepads=()=>[window.__pad,null,null,null]});
await P.goto(`http://localhost:${PORT}/?q='+(process.env.Q||2)+'`,{waitUntil:'networkidle0'});
const ev=(f,...a)=>P.evaluate(f,...a),st=()=>ev(()=>__bt.state());
const frames=async n=>{const f0=await ev(()=>__bt.frames);while(await ev(()=>__bt.frames)<f0+n)await sl(15)};
const set=(i,v)=>ev((i,v)=>{const b=__pad.buttons[i];b.pressed=v;b.value=v?1:0},i,v);
const press=async(i,hold=2)=>{await set(i,true);await frames(hold);await set(i,false);await frames(3)};
const A=0,B=1,X=2,Y=3,LB=4,RB=5,LT=6,RT=7,UP=12,DOWN=13,LEFT=14,RIGHT=15;
const res=[];const ok=(n,c,i='')=>{res.push(c);console.log(c?'PASS':'FAIL',n,i)};
await ev(()=>window.dispatchEvent(new Event('gamepadconnected')));
let s=await st();if(s.root=='splash'){await press(A);await frames(4)}if(await ev(()=>__bt.cre?.()))await press(B);await frames(3);if((await st()).root=='m-acct'){await ev(()=>document.querySelector('[data-a=guest]').click());await frames(3)}
await press(A,4);await sl(1500);await frames(5);s=await st();ok('solo game started',s.root==null,s.root);
const D='/workspace/ui-shots/grow/v22-';const shot=n=>P.screenshot({path:D+n+'.png'});
const W=()=>ev(()=>__bt.W),send=m=>ev(m=>__bt.send(m),m),bs=()=>ev(()=>__bt.build());
await send({t:'dbg',money:20000});await sl(300);
await send({t:'bplace',k:'room',x:14,z:-12,r:0,m:0});await sl(400);await send({t:'bplace',k:'wall',x:20,z:-20,r:0,m:2});await sl(400);
for(const [k,x,z] of [['floorlamp',13,-11],['pathlt',12,-6],['pathlt',16,-6],['flood',19,-5],['lantern',11,-7]]){await send({t:'dplace',k,x,y:0,z,ry:0});await sl(300)}
await send({t:'dbg',min:21*60});await sl(400);
await ev(()=>__bt.bld.toggle(true));await frames(5);
await ev(()=>__bt.warp(14,-4,0,-.08));await frames(30);let s2=await bs();ok('aim at prefab piece shows target',s2.tgt?.t=='b'&&s2.tgt.grp>4,JSON.stringify(s2.tgt));
const hud=await ev(()=>document.getElementById('buildhud').textContent);ok('hud shows remove + sell + sell whole',/Remove/.test(hud)&&/Sell for \$/.test(hud)&&/Sell whole/.test(hud),hud.slice(0,200));
await shot('sell');await P.screenshot({path:'/workspace/ui-shots/grow/v22-sell.png'});
// pad: hold Y ~1s → sells one piece
const n0=(await W()).build.length,m0=(await W()).money;await set(Y,true);await frames(3);const t0=Date.now();while(Date.now()-t0<1100)await frames(2);await set(Y,false);await frames(4);await sl(500);
let w2=await W();ok('hold Y sells a piece',w2.build.length==n0-1&&w2.money>m0,(n0-w2.build.length)+' $'+(w2.money-m0));
// tap Y removes to inventory
await ev(()=>__bt.warp(15.5,-6,0,-.1));await frames(20);console.log('tgt',JSON.stringify((await bs()).tgt));const n1=w2.build.length;await press(Y,2);await sl(500);w2=await W();ok('tap Y removes to inventory',w2.build.length==n1-1,'');
// hold Y 2.2s sells whole building
await frames(10);const n2=w2.build.length;await set(Y,true);await frames(3);const t1=Date.now();while(Date.now()-t1<2400)await frames(2);await set(Y,false);await sl(600);w2=await W();ok('long hold Y sells whole building',!w2.build.some(p=>p.gk=='room'),n2+'→'+w2.build.length);
await ev(()=>__bt.bld.toggle(false));await ev(()=>__bt.warp(15,-1,.2,-.1));await frames(30);await shot('lights-night');
ok('no page errors',!errs.length,errs.join('|'));
console.log(res.filter(x=>x).length+'/'+res.length+' passed');await b.close();srv.kill();process.exit(res.every(x=>x)?0:1)})();
