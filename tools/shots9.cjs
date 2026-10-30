// v9: login screen, saves list, sink facing the room
const pp=require('puppeteer-core'),{spawn}=require('child_process'),os=require('os');const sl=ms=>new Promise(r=>setTimeout(r,ms));const O='/workspace/ui-shots/grow/';
(async()=>{const DATA=os.tmpdir()+'/bt-shots9.json';require('fs').rmSync(DATA,{force:true});const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT:3210,BT_DEBUG:1,BT_DATA:DATA,DATABASE_URL:''},stdio:'ignore'});await sl(900);
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:600000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const P=await b.newPage();await P.setViewport({width:1280,height:720});const errs=[];P.on('pageerror',e=>errs.push('ERR '+e.message));
await P.goto('http://localhost:3210/?q=2&nosplash',{waitUntil:'networkidle0'});await sl(1500);const ev=(f,...a)=>P.evaluate(f,...a);
for(let k=0;k<3&&(await ev(()=>__bt.state().root))=='cre';k++){await P.keyboard.press('Escape');await sl(800)}
await ev(()=>{if(document.querySelector('#m-acct').style.display=='none')document.querySelector('#bacct').click()});await sl(400);
await ev(()=>{document.querySelector('#au').value='gumprr';document.querySelector('#ap').value='weed420'});await sl(300);await P.screenshot({path:O+'v9-login.png'});
await ev(()=>document.querySelector('[data-a=signup]').click());await sl(1200);
const T=await ev(()=>localStorage.bt_tok);const mk=async(n,money)=>{await ev(async([n,money])=>{const ws=new WebSocket('ws://'+location.host+'/ws');await new Promise(r=>ws.onopen=r);ws.send(JSON.stringify({t:'host',name:'G',token:localStorage.bt_tok,sname:n}));await new Promise(r=>setTimeout(r,200));ws.send(JSON.stringify({t:'start'}));await new Promise(r=>setTimeout(r,200));ws.send(JSON.stringify({t:'dbg',money}));ws.send(JSON.stringify({t:'dbg',spawn:{x:0,z:-2,s:'haze',age:200}}));await new Promise(r=>setTimeout(r,300));ws.send(JSON.stringify({t:'save'}));await new Promise(r=>setTimeout(r,300));ws.close()},[n,money])};
await mk('Shed Grow',420);await sl(300);await ev(()=>document.querySelector('[data-a=saves]').click());await sl(1200);await P.screenshot({path:O+'v9-saves.png'});
await ev(()=>document.querySelector('[data-a=back]').click());await sl(800);await P.screenshot({path:O+'v9-mainmenu.png'});
await ev(()=>{localStorage.bt_book='1';document.querySelector('[data-a=solo]').click()});await sl(3000);for(let k=0;k<3&&(await ev(()=>__bt.state().root))=='cre';k++){await P.keyboard.press('Escape');await sl(800)}
await ev(()=>{__bt.tp(1.6,-1.2);__bt.lookAt(3.55,.8,-1.2)});await sl(1500);await P.screenshot({path:O+'v9-sink.png'});
console.log(errs.join('\n'));await b.close();srv.kill();process.exit(0)})();
