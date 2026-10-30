// v7: grow book pages, held items (first + third person), wilting warning, first-play hint
const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));const O='/workspace/ui-shots/grow/';
(async()=>{const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT:3208,BT_DEBUG:1},stdio:'ignore'});await sl(700);
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:600000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const P=await b.newPage();await P.setViewport({width:1280,height:720});const errs=[];P.on('pageerror',e=>errs.push('ERR '+e.message));P.on('console',m=>m.type()=='error'&&errs.push('CE '+m.text()));
await P.goto('http://localhost:3208/?q=2&nosplash',{waitUntil:'networkidle0'});await sl(1500);
const ev=(f,...a)=>P.evaluate(f,...a);const fr=async n=>{const f0=await ev(()=>__bt.frames);while(await ev(()=>__bt.frames)<f0+n)await sl(50)};const shot=async n=>{await fr(4);await P.screenshot({path:O+'v8-'+n+'.png'});console.log('shot',n)};
await ev(()=>{localStorage.bt_book='1';document.querySelector('[data-a=solo]').click()});await sl(3000);for(let k=0;k<3&&(await ev(()=>__bt.state().root))=='cre';k++){await P.keyboard.press('Escape');await sl(800)}
const S=d=>ev(m=>__bt.send(m),d);
await S({t:'dbg',place:{type:'shelf',x:0.8,z:-1.2,data:{slots:[{type:'soil',data:{uses:4}},{type:'nutr',data:{uses:8}},{type:'seed_owl',data:{uses:3}},{type:'jars',data:{uses:10}},{type:'gbag',data:{uses:5},ry:.5},{type:'seed_kush',data:{uses:3}}]}}});
await S({t:'dbg',pallet:{x:-1.2,z:1.2,it:'soil'}});await sl(800);
await ev(()=>{__bt.tp(0.8,.6);__bt.lookAt(0.8,.8,-1.2)});await shot('shelf-with-items');
await ev(()=>{__bt.tp(-1.2,3.2);__bt.lookAt(-1.2,.4,1.2)});await shot('pallet');
await ev(()=>{const c=__bt.W.ents.find(e=>e.type=='water');__bt.tp(2.2,-.6);__bt.lookAt(3.3,.1,-.45)});await sl(300);await ev(()=>__bt.interact());await sl(600);
await S({t:'dbg',set:{id:await ev(()=>__bt.W.ents.find(e=>e.type=='water').id),d:{w:40}}});await sl(500);
await ev(()=>{__bt.tp(2.4,-1.2);__bt.lookAt(3.55,.9,-1.2)});await P.keyboard.down('KeyE');await sl(700);await shot('sink-refilling');await P.keyboard.up('KeyE');
await S({t:'dbg',spawn:{x:1.5,z:-2.6,s:'owl',age:120,water:30}});await ev(()=>{__bt.tp(1.5,-1.4);__bt.lookAt(1.5,.35,-2.6)});await sl(500);await P.keyboard.down('KeyE');await sl(600);await shot('fp-watering-can');await P.keyboard.up('KeyE');
await S({t:'dbg',place:{type:'light',x:-1,z:-2}});await S({t:'dbg',ff:30});await S({t:'dbg',bill:1});await sl(500);await ev(()=>{__bt.openLap();__bt.tab('util')});await shot('utilities-tab');
console.log(errs.join('\n'));await b.close();srv.kill();process.exit(0)})();
