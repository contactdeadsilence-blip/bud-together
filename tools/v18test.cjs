// v18: Section 5 build mode tests + screenshots
const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const PORT=3271;const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:''},stdio:'ignore'});await sl(700);
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
const D='/workspace/ui-shots/grow/v18-';const shot=n=>P.screenshot({path:D+n+'.png'});
const W=()=>ev(()=>__bt.W),send=m=>ev(m=>__bt.send(m),m),bs=()=>ev(()=>__bt.build());
await send({t:'dbg',money:20000});await sl(300);
// Stage A: toggle with D-pad up, place wall with A
await ev(()=>__bt.warp(0,-14,0,-.35));await frames(3);
await press(UP);ok('D-pad ▲ enters build mode',(await bs()).on);
await frames(10);let q=await bs();ok('ghost valid on lawn',q.ok,JSON.stringify(q.gp));await shot('A-ghost');
const n0=(await W()).build?.length||0;await press(A);await sl(500);ok('A places wall',((await W()).build||[]).length==n0+1);
await press(RT);ok('RT rotates',(await bs()).rot==3);await press(LT);
await press(RIGHT);ok('D-pad ▶ item -> door',(await bs()).item=='door');
await ev(()=>__bt.warp(4,-14,0,-.35));await frames(8);await press(A);await sl(500);let L=(await W()).build;ok('door placed',L.some(p=>p.k=='door'));
await press(RIGHT);await ev(()=>__bt.warp(-4,-14,0,-.35));await frames(8);await press(A);await sl(500);L=(await W()).build;ok('window placed',L.some(p=>p.k=='window'));
// collision: wall blocks
const w0=L.find(p=>p.k=='wall');const c=await ev((x,z)=>__bt.collide(x,z),w0.x+.3,w0.z);ok('wall collides',Math.abs(c[1]-w0.z)>.05,JSON.stringify([w0,c]));
// door toggle
const dr=L.find(p=>p.k=='door');await send({t:'bdoor',id:dr.id});await sl(500);ok('door opens',(await W()).build.find(p=>p.id==dr.id).o==1);
const c2=await ev((x,z)=>__bt.collide(x,z),dr.x,dr.z+.02);ok('open door passable',Math.abs(c2[1]-(dr.z+.02))<.01,JSON.stringify([c2,dr,await ev((x,z)=>__bt.bld.wallsList().filter(w=>Math.abs(w.x0-x)<3&&Math.abs(w.z0-z)<3),dr.x,dr.z)]));
// delete with Y
await ev((x,z)=>__bt.warp(x,z+2.5,0,-.25),w0.x,w0.z);await frames(8);q=await bs();ok('aim at wall',q.aim==w0.id,q.aim);await shot('A-aim');
await press(Y);await sl(500);ok('Y deletes, back to stock',!(await W()).build.some(p=>p.id==w0.id)&&(await W()).bstock.wall==1);
// Stage B: prefabs
await press(RB);await press(RB);ok('RB to Buildings',(await bs()).cat==2);
await ev(()=>__bt.warp(22,-12,0,-.4));await frames(8);await press(A);await sl(600);L=(await W()).build;ok('room kit placed',L.length>=18,L.length);
await press(RIGHT);await ev(()=>__bt.warp(-22,-12,0,-.4));await frames(8);await press(A);await sl(600);ok('greenhouse placed',(await W()).build.filter(p=>p.m==3).length>10);
await press(RIGHT);await ev(()=>__bt.warp(22,-28,0,-.4));await frames(8);await press(A);await sl(600);ok('garage placed',(await W()).build.some(p=>p.k=='gdoor'));
await press(RIGHT);await ev(()=>__bt.warp(-22,-28,0,-.4));await frames(8);await press(A);await sl(600);
await press(RIGHT);q=await bs();ok('extension selected',q.item=='ext');
await press(B);ok('B exits build',!(await bs()).on);
await ev(()=>__bt.warp(0,2,0,-.08));await frames(20);await shot('B-buildings');
await ev(()=>__bt.warp(34,-6,.6,-.12));await frames(20);await shot('B-buildings2');
// Stage C: paint + furniture
await press(UP);await press(RB);await press(RB);ok('Colors cat',(await bs()).cat==4);await press(RIGHT);
const rm=(await W()).build.filter(p=>p.k=='wall'&&p.m==0&&p.r%2==0).sort((a,b)=>b.z-a.z)[0];await ev((x,z)=>__bt.warp(x,z+2.2,0,-.2),rm.x,rm.z);await frames(8);await press(A);await sl(500);q=await bs();ok('paint brick',(await W()).build.find(p=>p.id==rm.id).m==1,JSON.stringify([rm,q]));
await press(LB);ok('Furniture cat',(await bs()).cat==3);
const fl=(await W()).build.find(p=>p.k=='floor');await ev((x,z)=>__bt.warp(x,z+2.2,0,-.6),fl.x,fl.z);await frames(8);const di=(await W()).decor.items.length;await press(A);await sl(500);ok('furniture on built floor',(await W()).decor.items.length==di+1);await shot('C-furn');
await press(B);
// Stage D: shop + stock
await send({t:'order',items:[{k:'b_wall',n:3},{k:'b_room',n:1}],via:'laptop'});await sl(500);let w=await W();ok('shop purchase to stock',w.bstock.wall==4&&w.bstock.room==1,JSON.stringify(w.bstock));
const m0=w.money;await press(UP);await ev(()=>__bt.bld.setSel(0,0));await ev(()=>__bt.warp(0,-30,0,-.35));await frames(8);await press(A);await sl(500);w=await W();ok('placing uses stock not money',w.money==m0&&w.bstock.wall==3);
await press(B);
await ev(()=>{__bt.openLap?.('shop')});
await ev(()=>__bt.tab?.('shop'));await sl(300);
// help
const hp=await ev(()=>import('/src/help.js').then(m=>m.ask('how do i build walls').slice?.(0,1)).catch(e=>'x'));
console.log('errors',errs);ok('no page errors',!errs.length);
console.log(res.filter(x=>x).length+'/'+res.length);await b.close();srv.kill();process.exit(res.every(x=>x)?0:1)})().catch(e=>{console.error(e);process.exit(1)});
