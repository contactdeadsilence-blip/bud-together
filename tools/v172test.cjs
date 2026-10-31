// v1.7.2: grass hidden under floors; dispensary fixtures delivered to pad
const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const PORT=3283;const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:''},stdio:['ignore',require('fs').openSync('/tmp/srv172.log','w'),require('fs').openSync('/tmp/srv172.log','a')]});await sl(700);
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:300000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const P=await b.newPage();await P.setViewport({width:960,height:540});const errs=[];P.on('pageerror',e=>errs.push(e.message));
await P.evaluateOnNewDocument(()=>{try{localStorage.bt_seenacct=1;localStorage.bt_seen_version='99.0.0'}catch(e){};window.__pad={id:'Xbox Sim',index:0,connected:true,mapping:'standard',timestamp:0,buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0})),axes:[0,0,0,0]};navigator.getGamepads=()=>[window.__pad,null,null,null]});
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
const D='/workspace/ui-shots/grow/v172-';const pr=()=>ev(()=>document.getElementById('prompt').textContent);const shot=n=>P.screenshot({path:D+n+'.png'});
const W=()=>ev(()=>__bt.W),send=m=>ev(m=>__bt.send(m),m);
await send({t:'dbg',money:20000});await sl(300);await send({t:'dbg',min:600});await sl(300);
// 1) grass under floors
const FX=14,FZ=-14;const gh0=await ev(()=>window.__grassHidden||0);
for(const [x,z] of [[FX,FZ],[FX+2,FZ],[FX,FZ+2],[FX+2,FZ+2],[FX-2,FZ],[FX-2,FZ+2]])await send({t:'bplace',k:'floor',x,z,r:0,m:0}),await sl(250);
await frames(45);let w=await W();const fl=w.build.filter(p=>p.k=='floor');ok('floors placed',fl.length==6,fl.length);
const vis=(x,z)=>ev((x,z)=>__bt.grassAt(x,z),x,z);
let g=await vis(FX,FZ);ok('no grass tufts under floor',g.under>0&&g.shown==0,JSON.stringify(g));
await ev((x,z)=>__bt.warp(x,z,0,-.9),FX+1,FZ+5.5);await frames(20);await shot('floor-no-grass');
await send({t:'bdel',id:fl[0].id});await sl(400);await frames(45);g=await vis(fl[0].x,fl[0].z);ok('grass restored when floor removed',g.shown>0,JSON.stringify(g));
await send({t:'bplace',k:'floor',x:fl[0].x,z:fl[0].z,r:0,m:0});await sl(400);
// 2) fixtures delivered
await send({t:'order',items:[{k:'b_dcase',n:1},{k:'b_dcount',n:1}],via:'laptop'});await sl(8000);
w=await W();const ks=w.ents.filter(e=>e.type=='b_dcase'||e.type=='b_dcount');ok('cabinet + checkout on delivery pad',ks.length==2&&ks.every(e=>Math.hypot(e.x-2.4,e.z-7.2)<1.6),JSON.stringify(ks.map(e=>[e.type,e.x,e.z])));
ok('not silently added to build stock',!(w.bstock?.dcase>0)&&!(w.bstock?.dcount>0),JSON.stringify(w.bstock));
await ev(()=>__bt.warp(2.4,10.2,0,-.45));await frames(25);await shot('fixtures-on-pad');
// pick up the case by pad, then B/D-pad up unpacks into build mode
const cs=ks.find(e=>e.type=='b_dcase');await ev(o=>{__bt.warp(o.x,o.z+1.3,0,-.6)},cs);await frames(10);
await send({t:'use',target:cs.id});await sl(400);w=await W();let held=w.ents.find(e=>e.id==cs.id);ok('cabinet crate can be picked up',held&&held.by,JSON.stringify(held&&{by:held.by}));
await press(UP,3);await sl(600);w=await W();s=await ev(()=>__bt.build());ok('D-pad up unpacks into build mode',w.bstock?.dcase==1&&!w.ents.some(e=>e.id==cs.id)&&s.on&&s.item=='dcase',JSON.stringify({st:w.bstock,on:s.on,item:s.item}));
await ev((x,z)=>__bt.warp(x,z,0,-.7),FX,FZ+3.2);await frames(15);await press(A,3);await sl(600);w=await W();ok('cabinet placed from stock',w.build.some(p=>p.k=='dcase')&&!(w.bstock?.dcase>0),JSON.stringify(w.bstock)+' '+(await ev(()=>document.getElementById('toast').textContent)));
await frames(10);await shot('cabinet-placed');await press(B,3);await frames(5);
ok('no page errors',errs.length==0,errs.join(' | '));
console.log(res.filter(x=>x).length+'/'+res.length);await b.close();srv.kill();process.exit(0)})().catch(e=>{console.error(e);process.exit(1)});
