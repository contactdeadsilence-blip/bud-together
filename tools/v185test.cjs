// repro: shed contents missing after reload (gumprr save)
const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const PORT=3385;const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:''},stdio:['ignore',require('fs').openSync('/tmp/repro.log','w'),require('fs').openSync('/tmp/srv172.log','a')]});await sl(700);
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:300000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const P=await b.newPage();await P.setViewport({width:1280,height:720});const errs=[];P.on('pageerror',e=>errs.push(e.message));
const GW=require('fs').readFileSync(process.env.SAVE||'/tmp/gumsave.json','utf8');await P.evaluateOnNewDocument(gw=>{try{localStorage.bt_guestw=JSON.stringify(JSON.parse(gw).w);localStorage.bt_seenacct=1;localStorage.bt_seen_version='99.0.0'}catch(e){};window.__pad={id:'Xbox Sim',index:0,connected:true,mapping:'standard',timestamp:0,buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0})),axes:[0,0,0,0]};navigator.getGamepads=()=>[window.__pad,null,null,null]},GW);
await P.goto(`http://localhost:${PORT}/?q='+(process.env.Q||2)+'`,{waitUntil:'networkidle0'});
const ev=(f,...a)=>P.evaluate(f,...a),st=()=>ev(()=>__bt.state());
const frames=async n=>{const f0=await ev(()=>__bt.frames);while(await ev(()=>__bt.frames)<f0+n)await sl(15)};
const set=(i,v)=>ev((i,v)=>{const b=__pad.buttons[i];b.pressed=v;b.value=v?1:0},i,v);
const press=async(i,hold=2)=>{await set(i,true);await frames(hold);await set(i,false);await frames(3)};
const A=0,B=1,X=2,Y=3,LB=4,RB=5,LT=6,RT=7,UP=12,DOWN=13,LEFT=14,RIGHT=15;
const res=[];const ok=(n,c,i='')=>{res.push(c);console.log(c?'PASS':'FAIL',n,i)};

await ev(()=>window.dispatchEvent(new Event('gamepadconnected')));
let s=await st();if(s.root=='splash'){await press(A);await frames(4)}if(await ev(()=>__bt.cre?.()))await press(B);await frames(3);if((await st()).root=='m-acct'){await ev(()=>document.querySelector('[data-a=guest]').click());await frames(3)}
s=await st();ok('menu shown',s.root=='m-main',s.root);
ok('no title/subtitle/HUD on menu',await ev(()=>!document.querySelector('#m-main h1')&&getComputedStyle(document.getElementById('hud')).display=='none'));
ok('menu renders at low pixel ratio',await ev(()=>__bt.gfx().pr<=1),JSON.stringify(await ev(()=>__bt.gfx().pr)));
const S=m=>ev(m=>__bt.send(m),m),Wd=()=>ev(()=>JSON.parse(JSON.stringify(__bt.W)));
await press(A,4);await frames(30);await S({t:'dbg',min:480});await S({t:'dbg',money:20000});await frames(10);
const put=async(k,x,z)=>{await S({t:'dbg',give:k});await frames(6);await S({t:'drop',x,z});await frames(6)};
await put('press',-2,-1);await put('oilres',-1.6,-1);await put('oilfill',-1.2,-1);await put('cjars',-1.2,-.7);await put('sbin',-.5,-1.6);
for(let i=0;i<3;i++)await put('trim',-3+i*.3,-2);
const m0=(await Wd()).money;await S({t:'cheat'});await frames(10);{const w=await Wd();ok('cheat +10000 and flagged',w.money-m0>=9999&&w.cheat==1,w.money-m0)}
await S({t:'work',op:'hire',k:'extractor',sk:2});await frames(10);
let ok2=0;for(let i=0;i<2&&!ok2;i++){await sl(1500);const w=await Wd();const b=w.ents.find(e=>e.type==='sbin');ok2=(b?.data.st||[]).some(x=>x.type==='pkg'&&x.data.cj);if(i%10==0)console.log(i,JSON.stringify(w.ents.find(e=>e.type==='oilres')?.data),w.workers?.[0]?.say)}
const w=await Wd();ok('extractor pooled oil',w.ents.some(e=>e.type==='oilres'),JSON.stringify(w.ents.find(e=>e.type==='oilres')?.data));ok('jar packed into storage bin',ok2);
ok('no trim left on floor',!w.ents.some(e=>e.type==='trim'&&!e.by));
await ev(()=>__bt.warp(-1.4,.6,0,-.5));await frames(20);await P.screenshot({path:'/workspace/ui-shots/grow/v185-oil.png'});
ok('no page errors',!errs.length,errs.join('|'));console.log(res.every(Boolean)?'ALL PASS':'SOME FAIL');await b.close();srv.kill();process.exit(0)})();
