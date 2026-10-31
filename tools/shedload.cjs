// repro: shed contents missing after reload (gumprr save)
const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const PORT=3297;const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:''},stdio:['ignore',require('fs').openSync('/tmp/repro.log','w'),require('fs').openSync('/tmp/srv172.log','a')]});await sl(700);
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:300000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const P=await b.newPage();await P.setViewport({width:960,height:540});const errs=[];P.on('pageerror',e=>errs.push(e.message));
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
await press(A,4);await sl(1500);await frames(5);s=await st();ok('solo game started',s.root==null,s.root);
const D='/workspace/ui-shots/grow/v173-';const shot=n=>P.screenshot({path:D+n+'.png'});
const W=()=>ev(()=>__bt.W),send=m=>ev(m=>__bt.send(m),m),ff=async n=>{await send({t:'dbg',ff:n});await sl(250)};
await send({t:'dbg',money:20000});await sl(300);await send({t:'dbg',min:480});await sl(300);
let w=await W();console.log(JSON.stringify(w.ents.filter(e=>!e.by).map(e=>[e.type,+e.x.toFixed(1),+e.z.toFixed(1)])));
const give=async(k,x,z)=>{await send({t:'dbg',give:k});await sl(250);await send({t:'drop',x,z});await sl(250)};
const wk=()=>W().then(w=>w.workers||[]);
w=await W();console.log('room',w.room,'ents',w.ents.length,'build',(w.build||[]).length);
for(const [n,x,z,ry] of [['shed-a',0,3,Math.PI],['shed-b',2,-3,0],['shed-c',8,2,-Math.PI/2]]){await ev((x,z,ry)=>__bt.warp(x,z,ry,-.25),x,z,ry);await frames(30);await P.screenshot({path:`/workspace/ui-shots/grow/shedload-${process.env.TAG||'x'}-${n}.png`})}
console.log('errors',errs.join(' | '));await b.close();srv.kill();process.exit(0)})().catch(e=>{console.log('Error',e);process.exit(1)});
