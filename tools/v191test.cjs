// v1.9.1 editable shed / extension / greenhouse
const WS=require('ws'),pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
let srv;
(async()=>{const R=await import('../src/rules.js');const PORT=3394;srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:''},stdio:'ignore'});await sl(800);
const res=[];const ok=(n,c,i='')=>{res.push(!!c);console.log(c?'PASS':'FAIL',n,i)};
const w0={nid:1,room:1,build:[],ents:[{id:1,type:'pot',x:-1,z:-3,by:0,data:{soil:1,plant:{s:'haze',age:100}}}]};R.seedCoreBuild(w0);
ok('seed adds shed+gh pieces',w0.shedB&&w0.build.some(p=>p.gk==='coreshed')&&w0.build.some(p=>p.gk==='coregh'),w0.build.length);
ok('ents preserved + indoor floor',w0.ents[0].data.plant&&R.onBFloor(w0.build,-1,-3));
const n0=w0.build.length;R.seedCoreBuild(w0);ok('idempotent migration',w0.build.length===n0);
R.seedExtBuild(w0);ok('extension opens east wall',w0.room===2&&w0.build.some(p=>p.gk==='coreext')&&!w0.build.some(p=>p.gk==='coreshed'&&p.x===4&&R.BP[p.k].c==='w'));
ok('bAllowed on shed footprint',R.bAllowed(0,0)&&R.bAllowed(-8,0));
const cl=()=>new Promise(r=>{const ws=new WS('ws://localhost:'+PORT+'/ws');const c={ws,w:null,toasts:[]};ws.on('message',d=>{const m=JSON.parse(d);if(m.t=='joined')c.id=m.id;if(m.t=='w'){c.w=m.w;if(m.w.toast&&m.w.toast.pid==c.id)c.toasts.push(m.w.toast.t)}});ws.on('open',()=>r(c))});
const A=await cl();const tx=m=>A.ws.send(JSON.stringify(m));const st=()=>sl(400);
tx({t:'host',name:'A'});await sl(200);tx({t:'start'});await st();
ok('new world has shedB pieces',A.w.shedB&&(A.w.build||[]).filter(p=>p.gk==='coreshed').length>20,(A.w.build||[]).length);
ok('starter pots still there',A.w.ents.filter(e=>e.type==='pot').length>=2);
const wall=A.w.build.find(p=>p.gk==='coreshed'&&p.k==='wall'&&p.z===-5);ok('found back wall',!!wall,wall&&wall.id);
tx({t:'dbg',money:5000});await st();
if(wall){tx({t:'bdel',id:wall.id});await st();ok('removed wall to stock',!(A.w.build||[]).some(p=>p.id===wall.id)&&(A.w.bstock?.wall|0)>=1,JSON.stringify(A.w.bstock));
 tx({t:'bplace',k:'wall',x:wall.x,z:wall.z,r:wall.r,m:0});await st();
 ok('replaced wall piece',(A.w.build||[]).some(p=>p.k==='wall'&&p.x===wall.x&&p.z===wall.z))}
const old={nid:50,room:2,money:1000,rep:5,day:2,min:100,ents:[{id:1,type:'pot',x:0,z:-2,by:0,data:{soil:1,plant:{s:'kush',age:200}}}],contracts:[],build:[],decor:R.defDecor()};
R.seedCoreBuild(old);ok('old expanded save migrates',old.shedB&&old.build.some(p=>p.gk==='coreext')&&old.ents[0].data.plant.s==='kush',old.build.length);
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:300000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const P=await b.newPage();await P.setViewport({width:1280,height:720});const errs=[];P.on('pageerror',e=>errs.push(e.message));
await P.evaluateOnNewDocument(()=>{window.__pad={id:'Xbox Sim',index:0,connected:true,mapping:'standard',timestamp:0,buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0})),axes:[0,0,0,0]};navigator.getGamepads=()=>[window.__pad,null,null,null]});
await P.goto(`http://localhost:${PORT}/?q=2`,{waitUntil:'networkidle0'});await sl(500);
const ev=(f,...a)=>P.evaluate(f,...a);const frames=async n=>{const f0=await ev(()=>__bt.frames);while(await ev(()=>__bt.frames)<f0+n)await sl(15)};
const set=(i,v)=>ev((i,v)=>{const b=__pad.buttons[i];b.pressed=v;b.value=v?1:0},i,v);const press=async(i,h=2)=>{await set(i,true);await frames(h);await set(i,false);await frames(2)};
await ev(()=>window.dispatchEvent(new Event('gamepadconnected')));
for(let i=0;i<40;i++){if(await ev(()=>typeof __bt!=='undefined'))break;await sl(100)}
let s=await ev(()=>__bt.state());if(s.root=='splash'){await press(0);await frames(4)}if(await ev(()=>__bt.cre?.()))await press(1);await frames(3);if((await ev(()=>__bt.state())).root=='m-acct'){await ev(()=>document.querySelector('[data-a=guest]').click());await frames(3)}
await press(0,4);await sl(3000);
const has=__bt=>{};
ok('in game with shedB',await ev(()=>!!__bt.W?.shedB&&(__bt.W.build||[]).length>50),await ev(()=>({shedB:__bt.W?.shedB,n:(__bt.W.build||[]).length,root:__bt.state()?.root})));
await ev(()=>__bt.warp(0,-1,0,-0.25));await sl(600);
await press(12,3);await sl(800); // dpad up often toggles build
if(!await ev(()=>document.getElementById('buildhud')))await ev(()=>document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyB',key:'b',bubbles:true})));
await sl(600);
await P.screenshot({path:'/workspace/ui-shots/grow/v191-shed-build.png'});
await ev(()=>__bt.warp(-8.2,0,1.2,-0.2));await sl(1000);
await P.screenshot({path:'/workspace/ui-shots/grow/v191-greenhouse.png'});
ok('no page errors',!errs.length,errs.join('|'));
console.log(res.filter(Boolean).length+'/'+res.length+' passed');
await b.close();srv.kill();process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.error(e);try{srv.kill()}catch{};process.exit(1)});
