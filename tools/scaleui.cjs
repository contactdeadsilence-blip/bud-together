// scale fill client repro
const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const PORT=3272;const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:''},stdio:'ignore'});await sl(700);
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:300000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const P=await b.newPage();await P.setViewport({width:960,height:540});const errs=[];P.on('pageerror',e=>errs.push(e.message));
await P.evaluateOnNewDocument(()=>{window.__pad={id:'Xbox Sim',index:0,connected:true,mapping:'standard',timestamp:0,buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0})),axes:[0,0,0,0]};navigator.getGamepads=()=>[window.__pad,null,null,null]});
await P.goto(`http://localhost:${PORT}/?q=0`,{waitUntil:'networkidle0'});
const ev=(f,...a)=>P.evaluate(f,...a),st=()=>ev(()=>__bt.state());
const frames=async n=>{const f0=await ev(()=>__bt.frames);while(await ev(()=>__bt.frames)<f0+n)await sl(15)};
const set=(i,v)=>ev((i,v)=>{const b=__pad.buttons[i];b.pressed=v;b.value=v?1:0},i,v);
const press=async(i,hold=2)=>{await set(i,true);await frames(hold);await set(i,false);await frames(3)};
const A=0,B=1,X=2,Y=3,LB=4,RB=5,LT=6,RT=7,UP=12,DOWN=13,LEFT=14,RIGHT=15;
const res=[];const ok=(n,c,i='')=>{res.push(c);console.log(c?'PASS':'FAIL',n,i)};
await ev(()=>window.dispatchEvent(new Event('gamepadconnected')));
let s=await st();if(s.root=='splash'){await press(A);await frames(4)}if(await ev(()=>__bt.cre?.()))await press(B);await frames(3);if((await st()).root=='m-acct'){await ev(()=>document.querySelector('[data-a=guest]').click());await frames(3)}
await press(A,4);await sl(1500);await frames(5);s=await st();ok('solo game started',s.root==null,s.root);
const D='/workspace/ui-shots/grow/v18-';const shot=n=>P.screenshot({path:D+n+'.png'});
const W=()=>ev(()=>__bt.W),send=m=>ev(m=>__bt.send(m),m),bs=()=>ev(()=>__bt.build());
const pr=()=>ev(()=>document.getElementById('prompt').textContent);
const put=async(k,x,z)=>{await send({t:'dbg',give:k});await sl(250);await send({t:'drop',x,z,y:0});await sl(250)};
await put('scale',2,9);await put('jars',2.8,9);
const sc=(await W()).ents.find(e=>e.type=='scale');ok('scale placed',sc&&!sc.by,JSON.stringify(sc));
for(let i=0;i<3;i++){await send({t:'dbg',give:'drybud',gd:{s:'owl',g:5,q:70}});await sl(300);
 await ev((x,z)=>__bt.warp(x,z+1.1,0,-.75),sc.x,sc.z);await frames(6);const p=await pr();
 await press(A);await sl(500);const h=(await st()).held;console.log('round',i,'prompt:',p,'held:',h,'toast:',await ev(()=>__bt.state().alert));ok('fill '+i,/Weigh/.test(p)&&h=='packed',p+' | '+h);
 await send({t:'drop',x:sc.x+.04,z:sc.z+.06,y:0});await sl(300);
 }
const n=res.filter(Boolean).length;console.log(n+'/'+res.length);await b.close();srv.kill();process.exit(0)})();
