// v1.9.4: shed door walkable + core rebuild + screenshots
import pp from 'puppeteer-core';
import {spawn} from 'child_process';
import fs from 'fs';
const sl=ms=>new Promise(r=>setTimeout(r,ms));
const PORT=33194;
const D='/workspace/ui-shots/grow/';
fs.mkdirSync(D,{recursive:true});
let srv;
const res=[]; const ok=(n,c,i='')=>{res.push(!!c); console.log(c?'PASS':'FAIL',n,i||'')};
(async()=>{
 srv=spawn('node',['server/index.js'],{env:{...process.env,PORT:String(PORT),BT_DEBUG:'1',DATABASE_URL:''},stdio:['ignore',fs.openSync('/tmp/v194.log','w'),fs.openSync('/tmp/v194.log','a')]});
 await sl(900);
 const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:300000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const P=await b.newPage(); await P.setViewport({width:1280,height:720});
 const errs=[]; P.on('pageerror',e=>errs.push(String(e.message||e)));
 await P.evaluateOnNewDocument(()=>{try{localStorage.bt_seenacct='1';localStorage.bt_seen_version='99.0.0';localStorage.removeItem('bt_guestw')}catch(e){}
  window.__pad={id:'Xbox Sim',index:0,connected:true,mapping:'standard',timestamp:0,buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0})),axes:[0,0,0,0]};
  navigator.getGamepads=()=>[window.__pad,null,null,null]});
 await P.goto(`http://localhost:${PORT}/?q=1`,{waitUntil:'networkidle0',timeout:120000});
 const ev=(f,...a)=>P.evaluate(f,...a);
 const frames=async n=>{const f0=await ev(()=>__bt.frames); while(await ev(()=>__bt.frames)<f0+n) await sl(16)};
 const set=(i,v)=>ev((i,v)=>{const b=__pad.buttons[i];b.pressed=v;b.value=v?1:0},i,v);
 const press=async(i,h=2)=>{await set(i,true);await frames(h);await set(i,false);await frames(3)};
 await ev(()=>window.dispatchEvent(new Event('gamepadconnected')));
 let s=await ev(()=>__bt.state());
 if(s.root==='splash'){await press(0);await frames(4)}
 if(await ev(()=>!!__bt.cre?.())){await press(1);await frames(3)}
 if((await ev(()=>__bt.state())).root==='m-acct'){await ev(()=>{document.querySelector('[data-a=guest]')?.click()});await frames(4)}
 await press(0,4); await sl(1800); await frames(8);
 for(let i=0;i<80&&!(await ev(()=>!!(__bt.W&&__bt.W.build)));i++) await sl(100);
 s=await ev(()=>__bt.state());
 ok('solo started',!s.root,s.root);
 const meta=await ev(()=>{
  const w=__bt.W; const doors=(w.build||[]).filter(p=>p.gk==='coreshed'&&p.k==='door');
  const barn=!!__bt.scene.children.find(c=>c===undefined);
  // old barn door meshes should be hidden
  const doorsVis=__bt.scene.children.filter(c=>c?.name==='door'||c?.userData?.barnDoor).length;
  return {shedB:w.shedB,room:w.room,nBuild:(w.build||[]).length,
   doors:doors.map(d=>({x:d.x,z:d.z,o:d.o})),
   coreshed:(w.build||[]).filter(p=>p.gk==='coreshed').length,
   coregh:(w.build||[]).filter(p=>p.gk==='coregh').length,
   innOut:__bt.lit(),
   pos:[+__bt.state().x.toFixed(2),+__bt.state().z.toFixed(2)]};
 });
 console.log(JSON.stringify(meta));
 ok('shedB on',!!meta.shedB);
 ok('centered open door',meta.doors.length===1&&meta.doors[0].x===0&&meta.doors[0].z===5&&meta.doors[0].o===1,JSON.stringify(meta.doors));
 ok('has greenhouse core',meta.coregh>10);

 // collide probe through doorway
 const probes=await ev(()=>{
  const pts=[[0,6.2],[0,5.5],[0,5.0],[0,4.2],[0,2],[3,5],[ -3,5]];
  return pts.map(([x,z])=>{const [nx,nz]=__bt.collide(x,z); return {x,z,nx:+nx.toFixed(3),nz:+nz.toFixed(3),ok:Math.hypot(nx-x,nz-z)<.05}});
 });
 console.log('probes',JSON.stringify(probes));
 ok('walk outside approach',probes[0].ok);
 ok('walk z=5.5 doorway',probes[1].ok);
 ok('walk z=5.0 doorway',probes[2].ok);
 ok('walk inside z=4.2',probes[3].ok);
 ok('walk deep inside',probes[4].ok);
 ok('side wall still blocks',!probes[5].ok||Math.abs(probes[5].nx-3)>.05);

 // physical walk: start outside, move in over frames via warp+collide chain
 await ev(()=>{__bt.warp(0,6.5,Math.PI, -.1)}); await frames(20);
 await P.screenshot({path:D+'v194-door-outside.png'});
 // step through
 for(let z=6.2;z>=2.5;z-=.25){await ev(z=>{const p=__bt.collide(0,z); __bt.tp(p[0],p[1])},z); await frames(2)}
 const after=await ev(()=>({x:__bt.state().x,z:__bt.state().z,inn:__bt.lit().inn}));
 console.log('after walk',after);
 ok('ended inside shed',after.z<4.5&&after.inn,JSON.stringify(after));
 await ev(()=>{__bt.look(Math.PI,-.15)}); await frames(25);
 await P.screenshot({path:D+'v194-door-inside.png'});

 // exterior facade
 await ev(()=>{__bt.warp(0,9.5,Math.PI,-.2)}); await frames(30);
 await P.screenshot({path:D+'v194-shed-front.png'});

 // interior looking at walls/floor textures
 await ev(()=>{__bt.warp(0,0,0,-.2)}); await frames(25);
 await P.screenshot({path:D+'v194-shed-interior.png'});

 // greenhouse
 await ev(()=>{__bt.warp(-8,6,Math.PI,-.15)}); await frames(25);
 await P.screenshot({path:D+'v194-greenhouse.png'});

 // extension: buy expand if needed
 await ev(()=>__bt.send({t:'dbg',money:5000,rep:10})); await sl(400);
 let room=await ev(()=>__bt.W.room);
 if(room<2){await ev(()=>__bt.send({t:'expand'})); await sl(600); room=await ev(()=>__bt.W.room)}
 ok('extension room',room>=2,room);
 const extDoor=await ev(()=>(__bt.W.build||[]).filter(p=>p.gk==='coreext'&&p.k==='door').map(d=>({x:d.x,z:d.z,o:d.o})));
 console.log('extDoor',extDoor);
 ok('ext door open centered-ish',extDoor.some(d=>d.o===1&&d.z===5),JSON.stringify(extDoor));
 await ev(()=>{__bt.warp(8,9,Math.PI,-.2)}); await frames(30);
 await P.screenshot({path:D+'v194-extension.png'});

 // walk out again
 await ev(()=>{__bt.warp(0,3,0,-.1)}); await frames(10);
 for(let z=3;z<=7;z+=.3){await ev(z=>{const p=__bt.collide(0,z); __bt.tp(p[0],p[1])},z); await frames(2)}
 const out=await ev(()=>({x:__bt.state().x,z:__bt.state().z,inn:__bt.lit().inn}));
 ok('walked back outside',out.z>5.5&&!out.inn,JSON.stringify(out));
 await P.screenshot({path:D+'v194-door-exit.png'});

 ok('no page errors',!errs.length,errs.slice(0,3).join('|'));
 console.log(`${res.filter(Boolean).length}/${res.length} passed`);
 await b.close(); srv.kill();
 process.exit(res.every(Boolean)?0:1);
})().catch(e=>{console.error(e); try{srv?.kill()}catch(_){ } process.exit(1)});
