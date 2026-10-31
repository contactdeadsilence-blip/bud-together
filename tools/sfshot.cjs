// v20 B+C: dispensary, roll-up, display cases, customers, staff
const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const PORT=3281;const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:''},stdio:['ignore',require('fs').openSync('/tmp/srv2.log','w'),require('fs').openSync('/tmp/srv2.log','a')]});await sl(700);
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
const D='/workspace/ui-shots/grow/v17x-';const shot=n=>P.screenshot({path:D+n+'.png'});
const W=()=>ev(()=>__bt.W),send=m=>ev(m=>__bt.send(m),m),bs=()=>ev(()=>__bt.build());
const pr=()=>ev(()=>document.getElementById('prompt').textContent);
const put=async(k,x,z,y=0)=>{await send({t:'dbg',give:k});await sl(250);await send({t:'drop',x,z,y});await sl(250)};

await send({t:'dbg',money:20000});await sl(300);await send({t:'dbg',min:600});
await send({t:'dbg',money:40000});await sl(300);await send({t:'dbg',min:1140});
await send({t:'bplace',k:'disp',x:-36,z:-36,r:0,m:0});await sl(500);await send({t:'biz',op:'open',name:'Emerald Leaf Co.'});await sl(300);
for(const [k,v] of [['sh',2],['ic',1],['bg',1],['tx','ELC']])await send({t:'biz',op:'logo',k,v});for(const [k,v] of [['aw',1],['lt',3],['sc',0],['ac',2]])await send({t:'biz',op:'front',k,v});await sl(800);await frames(30);
const o=await ev(()=>{const g=__bt.scene.getObjectByName('storefront');if(!g)return null;const T=g.parent.constructor;g.updateMatrixWorld(true);const a=g.localToWorld(g.position.clone().set(0,0,7)),c=g.position;return {x:a.x,z:a.z,ry:Math.atan2(-(c.x-a.x),-(c.z-a.z))}});console.log(JSON.stringify(o));
if(o){await ev(o=>__bt.warp(o.x,o.z,o.ry,.12),o);await frames(40);await shot('storefront')}
await send({t:'dbg',min:600});await sl(300);let w=await W();const PK=k=>w.build.filter(p=>p.k==k);
for(const cs of PK('dcase'))for(let i=0;i<3;i++){await send({t:'dbg',give:'packed',gd:{q:80}});await sl(150);await send({t:'dstock',id:cs.id});await sl(150)}
await send({t:'biz',op:'hire',k:'cashier',sk:1});await send({t:'biz',op:'hire',k:'budtender',sk:2});await send({t:'bdoor',id:PK('dsign')[0].id});await sl(300);
for(let i=0;i<40;i++){await sl(1500);w=await W();if((w.cust||[]).filter(u=>u.ph>=2&&u.ph<6).length>=2)break}
const rg=PK('dcount')[0],dr=PK('door').sort((a,b)=>Math.hypot(a.x-rg.x,a.z-rg.z)-Math.hypot(b.x-rg.x,b.z-rg.z))[0];const q=await ev((r,d)=>{const c=[1,0,-1,0][d.r],s=[0,1,0,-1][d.r];const x=d.x+s*1.2,z=d.z-c*1.2;return {x,z,ry:Math.atan2(-(r.x-x),-(r.z-z))}},rg,dr);
await ev(o=>__bt.warp(o.x,o.z,o.ry,-.12),q);await frames(30);await shot('sales-floor');console.log('cust',(w.cust||[]).length);
await b.close();srv.kill();process.exit(0)})();
