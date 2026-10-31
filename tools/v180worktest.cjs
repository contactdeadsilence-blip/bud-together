// v1.8.0 worker supply buying, nutrients, facing
const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const PORT=3291;const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:''},stdio:['ignore',require('fs').openSync('/tmp/srv180w.log','w'),require('fs').openSync('/tmp/srv172.log','a')]});await sl(700);
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
const D='/workspace/ui-shots/grow/v173-';const shot=n=>P.screenshot({path:D+n+'.png'});
const W=()=>ev(()=>__bt.W),send=m=>ev(m=>__bt.send(m),m),ff=async n=>{await send({t:'dbg',ff:n});await sl(250)};
await send({t:'dbg',money:20000});await sl(300);await send({t:'dbg',min:480});await sl(300);
let w=await W();console.log(JSON.stringify(w.ents.filter(e=>!e.by).map(e=>[e.type,+e.x.toFixed(1),+e.z.toFixed(1)])));
const give=async(k,x,z)=>{await send({t:'dbg',give:k});await sl(250);await send({t:'drop',x,z});await sl(250)};
const wk=()=>W().then(w=>w.workers||[]);
const D8='/workspace/ui-shots/grow/v180-';const shot8=n=>P.screenshot({path:D8+n+'.png'});
const wsay=async()=>JSON.stringify((await wk()).map(v=>[v.k,v.st,v.say,v.x,v.z]));
await send({t:'work',op:'hire',k:'grower',sk:2});await sl(300);
await send({t:'dbg',del:['soil','nutr','seed_*','seedrack']});await sl(300);
// 1) nutrients: hungry plant, no nutrients anywhere -> buy, walk to pad, collect, feed
await send({t:'dbg',spawn:{x:-1.5,z:-2.5,age:30,water:100,s:'haze'}});await sl(300);w=await W();let hp=w.ents.filter(e=>e.type=='pot').pop();
await send({t:'dbg',pn:{id:hp.id,v:5}});await sl(200);const m0=(await W()).money;
let ordered=false,facing=[];for(let i=0;i<120;i++){await ff(0.5);w=await W();if((w.wbuys||[]).some(b=>b.k=='nutr'))ordered=true;const v=(await wk())[0];if(v?.mv){const v2=await new Promise(r=>setTimeout(async()=>r((await wk())[0]),120));const dx=v2.x-v.x,dz=v2.z-v.z;if(Math.hypot(dx,dz)>.02)facing.push(Math.cos(Math.atan2(-dx,-dz)-v2.ry))}if(ordered&&facing.length>=3)break}
ok('grower ordered nutrients when out',ordered,JSON.stringify(w.wbuys)+await wsay());
ok('paid shop price from farm money',m0-(await W()).money>=15,m0-(await W()).money);
ok('walk facing matches direction (no moonwalk)',facing.length>0&&facing.every(c=>c>.9),JSON.stringify(facing));
const gv=(await wk())[0];await ev(o=>__bt.warp(o.x+1.2,o.z+2.2,0,-.3),gv);await frames(25);await shot8('worker-walking-forward');
let fed=false,col=false;for(let i=0;i<60&&!fed;i++){await ff(0.5);w=await W();if(w.ents.some(e=>e.type=='nutr'&&e.by<0))col=true;if(i%4==0&&!col){}const p=w.ents.find(e=>e.id==hp.id);if(p.data.plant.nutr>90)fed=true;if(col&&!globalThis._s){globalThis._s=1;const v=(await wk())[0];await ev(o=>__bt.warp(o.x+1,o.z+2,0,-.3),v);await frames(25);await shot8('worker-collecting-delivery')}}
ok('grower collected the delivery at the pad',col,await wsay());
ok('grower fed the hungry plant',fed,JSON.stringify(w.ents.find(e=>e.id==hp.id).data.plant));
// 2) soil: bare pot, no soil -> buys soil
await send({t:'dbg',give:'pot'});await sl(250);await send({t:'drop',x:-2.5,z:-1});await sl(300);
let sb=false;for(let i=0;i<60&&!sb;i++){await ff(0.5);w=await W();sb=(w.wbuys||[]).some(b=>b.k=='soil')&&w.ents.filter(e=>e.type=='pot').some(p=>p.data.soil&&p.data.plant)}
ok('grower bought soil (and seeds) then filled and planted the pot',sb,JSON.stringify(w.wbuys)+await wsay());
ok('grower bought seeds when out',(w.wbuys||[]).some(b=>b.k.startsWith('seed_')),JSON.stringify(w.wbuys));
// 3) affordability: broke -> no purchase
await send({t:'dbg',del:['soil','nutr','seed_*']});await send({t:'dbg',money:10-(await W()).money});await sl(300);const nb=(w.wbuys||[]).length;
await send({t:'dbg',spawn:{x:-3,z:-3,age:30,water:100,s:'haze'}});await sl(300);w=await W();const p2=w.ents.filter(e=>e.type=='pot').pop();await send({t:'dbg',pn:{id:p2.id,v:5}});
for(let i=0;i<10;i++)await ff(0.5);w=await W();ok('no purchase when farm money is short',(w.wbuys||[]).length==nb&&w.money==10,(w.money)+' '+await wsay());
await send({t:'dbg',money:5000});await sl(300);
// 4) staff tab log
await ev(()=>__bt.openLap('staff'));await frames(8);ok('Staff tab logs worker purchases',await ev(()=>/bought .*Nutrients for \$15/.test(document.getElementById('wbuys')?.textContent||'')),await ev(()=>document.getElementById('wbuys')?.textContent));
await ev(()=>document.getElementById('wbuys')?.scrollIntoView());await frames(5);await shot8('staff-purchase-log');
ok('no page errors',errs.length==0,errs.join(' | '));
console.log(res.filter(Boolean).length+'/'+res.length);await b.close();srv.kill();process.exit(0)})().catch(e=>{console.log('Error',e);process.exit(1)});
