const WS=require('ws'),pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
let srv;
(async()=>{const PORT=3398;srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:'',STRIPE_SECRET_KEY:'rk_live_x'},stdio:'ignore'});await sl(900);
const res=[];const ok=(n,c,i='')=>{res.push(!!c);console.log(c?'PASS':'FAIL',n,i)};
const r=await fetch('http://localhost:'+PORT+'/api/shop/packs').then(r=>r.json());
ok('shop refuses live keys',!r.ready&&/sk_test/.test(r.why||''),r.why);
ok('packs listed',r.packs?.length===3&&r.packs[0].cash===5000);
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:300000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const P=await b.newPage();await P.setViewport({width:1280,height:720});const errs=[];P.on('pageerror',e=>errs.push(e.message));
await P.evaluateOnNewDocument(()=>{window.__pad={id:'Xbox Sim',index:0,connected:true,mapping:'standard',timestamp:0,buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0})),axes:[0,0,0,0]};navigator.getGamepads=()=>[window.__pad,null,null,null]});
await P.goto(`http://localhost:${PORT}/?q=2`,{waitUntil:'networkidle0'});await sl(500);
const ev=(f,...a)=>P.evaluate(f,...a);const frames=async n=>{const f0=await ev(()=>__bt.frames);while(await ev(()=>__bt.frames)<f0+n)await sl(15)};
const set=(i,v)=>ev((i,v)=>{const b=__pad.buttons[i];b.pressed=v;b.value=v?1:0},i,v);const press=async(i,h=2)=>{await set(i,true);await frames(h);await set(i,false);await frames(2)};
await ev(()=>window.dispatchEvent(new Event('gamepadconnected')));
for(let i=0;i<50;i++){if(await ev(()=>typeof __bt!=='undefined'))break;await sl(80)}
let s=await ev(()=>__bt.state());if(s.root=='splash'){await press(0);await frames(4)}if(await ev(()=>__bt.cre?.()))await press(1);await frames(3);if((await ev(()=>__bt.state())).root=='m-acct'){await ev(()=>document.querySelector('[data-a=guest]').click());await frames(3)}
await press(0,4);await sl(2800);
ok('in game shedB',await ev(()=>!!__bt.W?.shedB));
await ev(()=>__bt.warp(0,-1,0,-0.15));await sl(800);
const L=await ev(()=>__bt.lit());
ok('indoor fill boosted',L.fill>=.5&&L.inn,JSON.stringify(L));
await P.screenshot({path:'/workspace/ui-shots/grow/v192-lighting.png'});
// settings fullscreen control exists
await press(9,2);await sl(400); // start/menu pause?
await ev(()=>{document.querySelector('[data-a=set]')?.click()});await sl(400);
ok('fullscreen setting present',await ev(()=>!!document.getElementById('fs')));
await P.screenshot({path:'/workspace/ui-shots/grow/v192-settings.png'});
await ev(()=>{document.querySelector('[data-a=shop]')?.click()});await sl(600);
ok('shop UI',await ev(()=>/Currency Shop|Starter Bundle|Shop offline/i.test(document.getElementById('shopbody')?.innerText||'')));
await P.screenshot({path:'/workspace/ui-shots/grow/v192-shop.png'});
ok('no page errors',!errs.length,errs.join('|'));
console.log(res.filter(Boolean).length+'/'+res.length+' passed');
await b.close();srv.kill();process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.error(e);try{srv.kill()}catch{};process.exit(1)});
