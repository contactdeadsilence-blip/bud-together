// v13a: item collisions (sink basin, tables, shelves, pallets, decor, floor) + single garbage bags that grow with fill.
const WS=require('ws'),pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
let srv;(async()=>{const R=await import('../src/rules.js');const PORT=3252;srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:''},stdio:'ignore'});await sl(800);
const res=[];const ok=(n,c,i='')=>{res.push(!!c);console.log(c?'PASS':'FAIL',n,i)};
const cl=()=>new Promise(r=>{const ws=new WS(`ws://localhost:${PORT}/ws`);const c={ws,w:null,toasts:[]};ws.on('message',d=>{const m=JSON.parse(d);if(m.t=='joined')c.code=m.code,c.id=m.id;if(m.t=='w'){c.w=m.w;if(m.w.toast&&m.w.toast.pid==c.id)c.toasts.push(m.w.toast.t)}});ws.on('open',()=>r(c))});
const tx=(c,m)=>c.ws.send(JSON.stringify(m));const st=()=>sl(350);
// unit: settle
const w0={ents:[{type:'sink',x:0,z:0,ry:0,data:{}},{type:'table',x:3,z:0,ry:Math.PI/2,data:{}},{type:'shelf',x:-3,z:0,ry:0,data:{}},{type:'pallet',x:0,z:3,ry:0,data:{}}],decor:{items:[{k:'couch',x:0,y:0,z:-4,ry:0}]}};
let s=R.settle(w0,.34,.26);ok('seed dropped on sink rim rests inside basin bottom',s.on=='sink'&&s.y>.5&&s.y<.6&&Math.abs(s.x)<.3&&Math.abs(s.z)<.2,JSON.stringify(s));
ok('rotated table top',R.settle(w0,3.25,0).y==R.SURFS.table.h&&R.settle(w0,3,.5).on=='table'&&R.settle(w0,3.5,0).y==0);
ok('shelf picks board under aim height',R.settle(w0,-3,0,.6).y==.568&&R.settle(w0,-3,0).y==1.268&&R.settle(w0,-3,0,.2).y==.098);
ok('pallet top',R.settle(w0,0,3).y==.16);ok('decor top (couch)',R.settle(w0,0,-4).on=='couch',JSON.stringify(R.settle(w0,0,-4)));ok('open floor y=0',R.settle(w0,5,5).y==0&&!R.settle(w0,5,5).on);
const A=await cl();tx(A,{t:'host',name:'A'});await sl(200);tx(A,{t:'start'});await sl(500);
const held=()=>A.w.ents.filter(e=>e.by==A.id).sort((a,b)=>a.bi-b.bi);const clear=async()=>{for(let i=0;i<4&&held().length;i++){tx(A,{t:'trash'});await st()}};const byId=id=>A.w.ents.find(e=>e.id==id);
await clear();const sink=A.w.ents.find(e=>e.type=='sink');tx(A,{t:'dbg',give:'seed_haze',gd:{uses:3}});await st();const sd=held()[0];
tx(A,{t:'drop',x:sink.x+.3*Math.cos(sink.ry||0),z:sink.z-.3*Math.sin(sink.ry||0),y:.95,ry:0});await st();let e=byId(sd.id);ok('server settles dropped seed into the sink basin',e&&e.y>.5&&e.y<.62,JSON.stringify(e&&{x:e.x,y:e.y,z:e.z,sx:sink.x}));
tx(A,{t:'use',target:sd.id});await st();tx(A,{t:'drop',x:20,z:20,y:5});await st();ok('cannot float items mid-air',byId(sd.id).y==0);
// garbage bags
await clear();tx(A,{t:'dbg',place:{type:'gbag',x:1,z:2,data:{uses:5}}});await st();const box=A.w.ents.at(-1);
tx(A,{t:'use',target:box.id});await st();ok('taking from the box gives ONE bag',held().length==1&&held()[0].type=='gbag1'&&byId(box.id).data.uses==4&&!byId(box.id).by,A.toasts.at(-1));
tx(A,{t:'use',target:box.id});await st();ok('put the bag back',held().length==0&&byId(box.id).data.uses==5);
tx(A,{t:'use',target:box.id});await st();tx(A,{t:'dbg',spawn:{x:2,z:2,d:{used:1}}});await st();const pot=A.w.ents.at(-1);
tx(A,{t:'use',target:pot.id});await st();let b=held()[0];ok('single bag fills with old dirt (1/3)',b?.type=='dirtbag'&&b.data.f==1&&held().length==1,JSON.stringify(b));
tx(A,{t:'dbg',spawn:{x:2.6,z:2,s:'kush',age:100,dead:1}});await st();const dp=A.w.ents.at(-1);tx(A,{t:'use',target:box.id});await st();tx(A,{t:'cycle'});await st();
const g1=held().find(e=>e.type=='gbag1');for(let i=0;i<3&&held()[0]?.type!='gbag1';i++){tx(A,{t:'cycle'});await st()}tx(A,{t:'use',target:dp.id});await st();ok('single bag bags a dead plant into a trash bag',byId(g1.id)?.type=='trash',byId(g1.id)?.type);
// browser shots
const br=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:300000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const P=await br.newPage();await P.setViewport({width:1280,height:800});const errs=[];P.on('pageerror',e=>errs.push(e.message));
await P.evaluateOnNewDocument(()=>{window.__pad={id:'Xbox Sim',index:0,connected:true,mapping:'standard',timestamp:0,buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0})),axes:[0,0,0,0]};navigator.getGamepads=()=>[window.__pad,null,null,null]});
await P.goto(`http://localhost:${PORT}/?q=0`,{waitUntil:'networkidle0'});await sl(500);
const ev=(f,...a)=>P.evaluate(f,...a),frames=async n=>{const f0=await ev(()=>__bt.frames);while(await ev(()=>__bt.frames)<f0+n)await sl(15)};
const set=(i,v)=>ev((i,v)=>{const b=__pad.buttons[i];b.pressed=v;b.value=v?1:0},i,v);const press=async(i,h=2)=>{await set(i,true);await frames(h);await set(i,false);await frames(2)};
await ev(()=>window.dispatchEvent(new Event('gamepadconnected')));let s0=await ev(()=>__bt.state());if(s0.root=='splash'){await press(0);await frames(4)}if(await ev(()=>__bt.cre?.()))await press(1);await frames(3);await press(0,4);await sl(1500);await frames(5);
for(let i=0;i<100&&!(await ev(()=>!!(__bt.W&&__bt.W.ents)));i++)await sl(100);
const sk=await ev(()=>__bt.W.ents.find(e=>e.type=='sink'));
await ev(sk=>{__bt.send({t:'dbg',give:'seed_og',gd:{uses:3}})},sk);await sl(400);await ev(sk=>{__bt.tp(sk.x+1.1,sk.z);__bt.lookAt(sk.x,.6,sk.z)},sk);await frames(3);
await P.keyboard.press('KeyG');await sl(500);await frames(3);
const seed=await ev(()=>__bt.W.ents.find(e=>e.type=='seed_og'&&!e.by));ok('browser drop aimed at sink lands in basin',seed&&seed.y>.5&&seed.y<.62,JSON.stringify([seed&&[seed.x,seed.y,seed.z],sk.x,sk.z,sk.ry]));
await ev(sk=>{__bt.tp(sk.x+.9,sk.z+.3);__bt.lookAt(sk.x,.6,sk.z)},sk);await frames(5);await P.screenshot({path:'/workspace/ui-shots/grow/v13-sink-drop.png'});
await ev(()=>{for(const [i,f] of [[0,0],[1,1],[2,2],[3,3]]){__bt.send({t:'dbg',place:{type:f?'dirtbag':'gbag1',x:-1+i*.5,z:3,data:f?{f}:{}}})}__bt.send({t:'dbg',place:{type:'trash',x:1.2,z:3,data:{}}});__bt.send({t:'dbg',place:{type:'gbag',x:-1.7,z:3,data:{uses:5}}})});await sl(600);
await ev(()=>{__bt.tp(0,4.6);__bt.lookAt(0,.2,3)});await frames(6);await P.screenshot({path:'/workspace/ui-shots/grow/v13-bags.png'});
await ev(()=>{__bt.send({t:'dbg',money:1})});const fe=await ev(async()=>{const F=document.getElementById('feed');const pe=getComputedStyle(F).pointerEvents;const n0=F.children.length;await new Promise(r=>setTimeout(r,5000));return [pe,n0,F.children.length]});
ok('HUD notices pointer-events none and fade out after ~4s',fe[0]=='none'&&fe[2]==0,JSON.stringify(fe));
// greenhouse roof (outside, day) + night lights
await ev(()=>{__bt.send({t:'dbg',min:720});__bt.tp(-8.6,7.5);__bt.lookAt(-8.6,2,0)});await sl(400);await frames(8);await P.screenshot({path:'/workspace/ui-shots/grow/v13-greenhouse-roof.png'});
await ev(()=>{__bt.send({t:'dbg',min:1320})});await sl(400);await frames(8);await P.screenshot({path:'/workspace/ui-shots/grow/v13-night-greenhouse.png'});
await ev(()=>{__bt.tp(0,-10);__bt.lookAt(0,1,0)});await frames(8);await P.screenshot({path:'/workspace/ui-shots/grow/v13-night-yard.png'});
tx(A,{t:'dbg',min:1320});tx(A,{t:'dbg',spawn:{x:-8.6,z:0,s:'kush',age:50}});await st();tx(A,{t:'dbg',ff:.2});await st();const gp=A.w.ents.at(-1);ok('server: greenhouse pot lit at night by grow lights',gp.data.plant.lit===1,JSON.stringify([gp.data.plant.lit,A.w.min,A.w.util&&A.w.util.off]));
ok('no page errors',!errs.length,errs.join('|'));
console.log(`${res.filter(Boolean).length}/${res.length} passed`);await br.close();srv.kill();process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.error(e);srv?.kill();process.exit(1)});
