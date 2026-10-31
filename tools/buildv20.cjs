// v20 A: detailed build pieces + pitched prefab roofs
const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const PORT=3278;const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:''},stdio:'ignore'});await sl(700);
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
const D='/workspace/ui-shots/grow/v20-';const shot=n=>P.screenshot({path:D+n+'.png'});
const W=()=>ev(()=>__bt.W),send=m=>ev(m=>__bt.send(m),m),bs=()=>ev(()=>__bt.build());
const pr=()=>ev(()=>document.getElementById('prompt').textContent);
const put=async(k,x,z,y=0)=>{await send({t:'dbg',give:k});await sl(250);await send({t:'drop',x,z,y});await sl(250)};

await send({t:'dbg',money:20000});await sl(300);
const pl=async(k,x,z,r=0,m=0)=>{await send({t:'bplace',k,x,z,r,m});await sl(350)};
await pl('room',14,-12);await pl('greenhouse',-24,-12);await pl('garage',22,-24,1);await pl('shed',30,-12);await pl('ext',14,-24);
let L=(await W()).build;ok('room has pitched roof',L.filter(p=>p.k=='roofs').length>=4,L.filter(p=>p.k=='roofs').length);
ok('garage (3 deep) has ridge',L.some(p=>p.k=='roofr'),'');ok('no flat roofs in new prefabs',!L.some(p=>p.k=='roof'),'');
ok('glass greenhouse roof',L.filter(p=>p.m==3&&p.k=='roofs').length==6,'');
await pl('wall',2,-20,0,1);await pl('window',4,-20,0,0);await pl('door',6,-20,0,4);await pl('wall',8,-20,0,2);await pl('roof',2,-26);await pl('roofs',6,-26,0,2);
L=(await W()).build;ok('single pieces placed',['wall','window','door','roof','roofs'].every(k=>L.some(p=>p.k==k)),'');
const gm=await ev(()=>{let n=0,tri=0;__bt.scene?.traverse?.(o=>{});return 1});
// collision still from walls list
const wl=await ev(()=>__bt.bld.wallsList().length);ok('wall collision segments',wl>20,wl);
// shed unchanged: walls still collide where they did
const c=await ev(()=>__bt.collide(-4.2,0));ok('shed west wall still collides',Math.abs(c[0]+4.2)>.05,JSON.stringify(c));
await ev(()=>__bt.warp(18,-1,.35,-.12));await frames(25);await shot('A-room-ext');
await ev(()=>__bt.warp(5,-15.5,0,-.05));await frames(25);await shot('A-pieces');
await ev(()=>__bt.warp(-20,-3,-.4,-.12));await frames(25);await shot('A-greenhouse');
await ev(()=>__bt.warp(31,-15,.8,-.1));await frames(25);await shot('A-garage-shed');
await ev(()=>__bt.warp(0,13,0,-.06));await frames(25);await shot('A-original-shed');
await ev(()=>__bt.warp(15,-15,0,.5));await frames(25);await shot('A-interior-ceiling');
ok('no page errors',!errs.length,errs.slice(0,3).join(' | '));
const n=res.filter(Boolean).length;console.log(n+'/'+res.length);await b.close();srv.kill();process.exit(0)})();
