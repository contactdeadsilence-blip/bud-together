// v12 screenshots: node tools/shots12.cjs <stage>  -> /workspace/ui-shots/grow/v12-*.png
const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));const ST=process.argv[2]||'1';const OUT='/workspace/ui-shots/grow/';
(async()=>{const PORT=3231;const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:''},stdio:'ignore'});await sl(700);
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:300000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const P=await b.newPage();await P.setViewport({width:1280,height:720});P.on('pageerror',e=>console.log('ERR',e.message));
await P.evaluateOnNewDocument(()=>{window.__pad={id:'Xbox Sim',index:0,connected:true,mapping:'standard',timestamp:0,buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0})),axes:[0,0,0,0]};navigator.getGamepads=()=>[window.__pad,null,null,null]});
await P.goto(`http://localhost:${PORT}/?q=2&nosplash`,{waitUntil:'networkidle0'});
const ev=(f,...a)=>P.evaluate(f,...a);const frames=async n=>{const f0=await ev(()=>__bt.frames);while(await ev(()=>__bt.frames)<f0+n)await sl(15)};
const set=(i,v)=>ev((i,v)=>{const b=__pad.buttons[i];b.pressed=v;b.value=v?1:0},i,v);const press=async(i,h=2)=>{await set(i,true);await frames(h);await set(i,false);await frames(2)};
await sl(1500);for(let k=0;k<3&&(await ev(()=>__bt.state().root))=='cre';k++){await P.keyboard.press('Escape');await sl(800)}
await ev(()=>{localStorage.bt_book='1';document.querySelector('[data-a=solo]').click()});await sl(3000);for(let k=0;k<3&&(await ev(()=>__bt.state().root))=='cre';k++){await P.keyboard.press('Escape');await sl(800)}
const shot=async n=>{await frames(4);await P.screenshot({path:OUT+'v12-'+n+'.png'});console.log('shot',n)};
const dbg=m=>ev(m=>__bt.dbg(m),m);const click=sel=>ev(s=>document.querySelector(s)?.click(),sel);
global.H={P,ev,frames,press,set,shot,dbg,click,sl};
await require('./shots12_'+ST+'.cjs')(global.H);
await b.close();srv.kill();process.exit(0)})().catch(e=>{console.error(e);process.exit(1)});
