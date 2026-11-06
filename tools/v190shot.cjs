const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const PORT=3391;const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:''},stdio:'ignore'});await sl(700);
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:300000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const P=await b.newPage();await P.setViewport({width:1280,height:720});
await P.evaluateOnNewDocument(()=>{window.__pad={id:'Xbox Sim',index:0,connected:true,mapping:'standard',timestamp:0,buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0})),axes:[0,0,0,0]};navigator.getGamepads=()=>[window.__pad,null,null,null]});
await P.goto(`http://localhost:${PORT}/?q=2`,{waitUntil:'networkidle0'});await sl(400);
const ev=(f,...a)=>P.evaluate(f,...a);const frames=async n=>{const f0=await ev(()=>__bt.frames);while(await ev(()=>__bt.frames)<f0+n)await sl(15)};
const set=(i,v)=>ev((i,v)=>{const b=__pad.buttons[i];b.pressed=v;b.value=v?1:0},i,v);const press=async(i,h=2)=>{await set(i,true);await frames(h);await set(i,false);await frames(2)};
await ev(()=>window.dispatchEvent(new Event('gamepadconnected')));let s=await ev(()=>__bt.state());if(s.root=='splash'){await press(0);await frames(4)}if(await ev(()=>__bt.cre?.()))await press(1);await frames(3);if((await ev(()=>__bt.state())).root=='m-acct'){await ev(()=>document.querySelector('[data-a=guest]').click());await frames(3)}await press(0,4);await sl(2500);
await ev(()=>{
  // clear clutter near spawn
  __bt.send({t:'dbg',del:['light']});
  __bt.send({t:'dbg',place:{type:'nutr',x:0,z:-2.2,ry:0,data:{f:'g',uses:8}}});
  __bt.send({t:'dbg',place:{type:'nutr',x:.55,z:-2.2,ry:0,data:{f:'b',uses:8}}});
  __bt.send({t:'dbg',place:{type:'nutr',x:1.1,z:-2.2,ry:0,data:{uses:8}}});
  __bt.send({t:'dbg',spawn:{x:-.7,z:-2.2,s:'cherry',age:340}});
  __bt.send({t:'dbg',spawn:{x:1.7,z:-2.2,s:'gelato',age:430}});
  __bt.send({t:'dbg',spawn:{x:2.3,z:-2.2,s:'diesel',age:470}});
});await sl(1000);
await ev(()=>__bt.warp(.55,-.3,Math.PI,0.25));await sl(1500);
await P.screenshot({path:'/workspace/ui-shots/grow/v190-nutrients.png'});
await ev(()=>__bt.warp(1.7,-.3,Math.PI,0.2));await sl(1000);
await P.screenshot({path:'/workspace/ui-shots/grow/v190-strains.png'});
console.log('ents',await ev(()=>__bt.W.ents.filter(e=>e.type=='nutr'||e.type=='pot').map(e=>[e.type,e.x,e.z,e.data.f||e.data.plant?.s])));
await b.close();srv.kill();process.exit(0)})().catch(e=>{console.error(e);process.exit(1)});
