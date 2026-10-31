// v14 screenshots: node tools/shots14.cjs <scene>
const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));const O='/workspace/ui-shots/grow/';
(async()=>{const PORT=3261;const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:'',BT_DATA:'/tmp/bt-sh14.json'},stdio:'ignore'});await sl(800);
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:300000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const P=await b.newPage();await P.setViewport({width:1280,height:720});const errs=[];P.on('pageerror',e=>errs.push(e.message));
await P.evaluateOnNewDocument(()=>{localStorage.bt_look=JSON.stringify({sex:'m',tone:1});window.__pad={id:'Xbox Sim',index:0,connected:true,mapping:'standard',timestamp:0,buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0})),axes:[0,0,0,0]};navigator.getGamepads=()=>[__pad,null,null,null]});
await P.goto(`http://localhost:${PORT}/?q=0`,{waitUntil:'networkidle0'});await sl(500);
const ev=(f,...a)=>P.evaluate(f,...a),stt=()=>ev(()=>__bt.state());const frames=async n=>{const f0=await ev(()=>__bt.frames);while(await ev(()=>__bt.frames)<f0+n)await sl(15)};
const press=async(i,h=2)=>{await ev(i=>{__pad.buttons[i].pressed=true;__pad.buttons[i].value=1},i);await frames(h);await ev(i=>{__pad.buttons[i].pressed=false;__pad.buttons[i].value=0},i);await frames(2)};
let s=await stt();if(s.root=='splash'){await press(0);await frames(4)}if(await ev(()=>__bt.cre?.()))await press(1);await frames(3);if((await stt()).root=='m-acct'){await ev(()=>document.querySelector('[data-a=guest]').click());await frames(3)}
await ev(()=>document.querySelector('[data-a=solo]').click());await sl(1500);await frames(5);
const snd=m=>ev(m=>__bt.send(m),m);const W=()=>ev(()=>__bt.W);const shot=async n=>{await frames(4);await P.screenshot({path:O+'v14-'+n+'.png'});console.log('shot',n)};
global.ctx={P,ev,stt,frames,press,snd,W,shot,sl,errs};
const sc=process.argv[2]||'rack';
if(sc=='rack'){await snd({t:'dbg',give:'seedrack'});await sl(400);await snd({t:'drop',x:0,z:4.5});await sl(400);const rk=(await W()).ents.find(e=>e.type=='seedrack');
 for(const [k,n,sl0] of [['seed_haze',7,0],['seed_kush',10,1],['seed_owl',3,2],['seed_kush_f',4,3],['seed_haze_a',2,4],['seed_pack',5,5]])for(let i=0;i<n;i++){await snd({t:'dbg',give:k});await sl(60);await snd({t:'use',target:rk.id,slot:sl0});await sl(60)}
 await sl(500);await ev(r=>{__bt.tp(r.x,r.z-1.3);__bt.lookAt(r.x,1.42,r.z)},rk);await shot('seedrack');await ev(r=>{__bt.tp(r.x-.25,r.z-.8);__bt.lookAt(r.x-.32,1.5,r.z)},rk);await shot('seedrack-aim');console.log('prompt',(await stt()).prompt)}
if(sc!='rack')await require('./'+sc+'.cjs')(global.ctx);
console.log('errs',errs.slice(0,3));await b.close();srv.kill();require('fs').rmSync('/tmp/bt-sh14.json',{force:true})})();
