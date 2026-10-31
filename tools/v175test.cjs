// v1.7.5 packing/press hotfix
const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const PORT=3301;const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:''},stdio:['ignore',require('fs').openSync('/tmp/srv175.log','w'),require('fs').openSync('/tmp/srv172.log','a')]});await sl(700);
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:300000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const P=await b.newPage();await P.setViewport({width:960,height:540});const errs=[];P.on('pageerror',e=>errs.push(e.message));
const GW=process.env.SAVE?JSON.stringify(JSON.parse(require('fs').readFileSync(process.env.SAVE,'utf8')).w):'';await P.evaluateOnNewDocument(gw=>{try{if(gw&&!sessionStorage.bt_loaded){localStorage.bt_guestw=gw;sessionStorage.bt_loaded=1}localStorage.bt_seenacct=1;localStorage.bt_seen_version='99.0.0'}catch(e){};window.__pad={id:'Xbox Sim',index:0,connected:true,mapping:'standard',timestamp:0,buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0})),axes:[0,0,0,0]};navigator.getGamepads=()=>[window.__pad,null,null,null]},GW);
await P.goto(`http://localhost:${PORT}/?q='+(process.env.Q||2)+'`,{waitUntil:'networkidle0'});
const ev=(f,...a)=>P.evaluate(f,...a),st=()=>ev(()=>__bt.state());
const frames=async n=>{const f0=await ev(()=>__bt.frames);while(await ev(()=>__bt.frames)<f0+n)await sl(15)};
const set=(i,v)=>ev((i,v)=>{const b=__pad.buttons[i];b.pressed=v;b.value=v?1:0},i,v);
const press=async(i,hold=2)=>{await set(i,true);await frames(hold);await set(i,false);await frames(3)};
const A=0,B=1,X=2,Y=3,LB=4,RB=5,LT=6,RT=7,UP=12,DOWN=13,LEFT=14,RIGHT=15;
const res=[];const ok=(n,c,i='')=>{res.push(c);console.log(c?'PASS':'FAIL',n,i)};
await ev(()=>window.dispatchEvent(new Event('gamepadconnected')));
const start=async()=>{let s=await st();if(s.root=='splash'){await press(A);await frames(4)}if(await ev(()=>__bt.cre?.()))await press(B);await frames(3);if((await st()).root=='m-acct'){await ev(()=>document.querySelector('[data-a=guest]').click());await frames(3)}
await press(A,4);await sl(1500);await frames(5);s=await st();ok('solo game started',s.root==null,s.root)};await start();
const D='/workspace/ui-shots/grow/v175-';const shot=n=>P.screenshot({path:D+n+'.png'});
const W=()=>ev(()=>__bt.W),send=m=>ev(m=>__bt.send(m),m),ff=async n=>{await send({t:'dbg',ff:n});await sl(250)};
const place=async(type,x,z,data)=>{await send({t:'dbg',place:{type,x,z,data}});await sl(200)};
const give=async(k,gd)=>{await send({t:'dbg',give:k,gd});await sl(300)};
const held=async()=>{const w=await W();const me=await ev(()=>__bt.me?.()||null);return w.ents.filter(e=>e.by&&e.by!==0).sort((a,b)=>a.bi-b.bi)[0]};
const face=async(x,z)=>{await ev((x,z)=>__bt.warp(x,z+1.2,0,-.75),x,z);await frames(8)};
const mg=()=>ev(()=>{const s=__bt.mg();return s&&s.title||null});
const toast=()=>ev(()=>__bt.W.toast?.t||document.getElementById('toast')?.textContent||'');
await send({t:'dbg',money:20000});await sl(300);await send({t:'dbg',min:600});await sl(300);
module.exports={};globalThis.T={start,P,ev,st,frames,set,press,ok,shot,W,send,ff,place,give,held,face,mg,toast,sl,A,B,X,res,errs};
const stage=require(process.env.STAGE||'/tmp/stage.cjs');await stage(globalThis.T);
console.log('errors',errs.join('|'));console.log(res.filter(Boolean).length+'/'+res.length);await b.close();srv.kill();process.exit(0)})();
