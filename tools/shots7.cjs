// v7: grow book pages, held items (first + third person), wilting warning, first-play hint
const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));const O='/workspace/ui-shots/grow/';
(async()=>{const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT:3207,BT_DEBUG:1},stdio:'ignore'});await sl(700);
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:600000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const P=await b.newPage();await P.setViewport({width:1280,height:720});const errs=[];P.on('pageerror',e=>errs.push('ERR '+e.message));P.on('console',m=>m.type()=='error'&&errs.push('CE '+m.text()));
await P.goto('http://localhost:3207/?q=2&nosplash',{waitUntil:'networkidle0'});await sl(1500);
const ev=(f,...a)=>P.evaluate(f,...a);const fr=async n=>{const f0=await ev(()=>__bt.frames);while(await ev(()=>__bt.frames)<f0+n)await sl(50)};const shot=async n=>{await fr(4);await P.screenshot({path:O+'v7-'+n+'.png'});console.log('shot',n)};
await ev(()=>{localStorage.removeItem('bt_book');document.querySelector('[data-a=solo]').click()});await sl(3000);for(let k=0;k<3&&(await ev(()=>__bt.state().root))=='cre';k++){await P.keyboard.press('Escape');await sl(800)}console.log('root',await ev(()=>__bt.state().root));
await ev(()=>{__bt.tp(-2.6,-1.2);__bt.lookAt(-3.55,.95,-2.42)});await shot('first-play-hint');
console.log('desk target',await ev(()=>__bt.target()));
await P.keyboard.press('KeyB');await sl(300);const n=await ev(()=>document.querySelectorAll('#bkn').length&&__bt.state().book);console.log('book open page',n);
const NP=11;for(let i=0;i<NP;i++){await shot('book-p'+String(i+1).padStart(2,'0'));await P.keyboard.press('ArrowRight');await sl(150)}
await P.keyboard.press('Escape');await sl(200);console.log('book closed',await ev(()=>__bt.state().book));
// held items first person
const items=['water','soil','seed_haze','gbag','trash','nutr','jars','wetbud','packed'];
await ev(()=>{__bt.tp(0,2.5);__bt.look(0,-.15)});
for(const t of items){await ev(t=>__bt.send({t:'dbg',give:t}),t);await sl(500);for(let k=0;k<10&&(await ev(()=>__bt.state().held))!=t;k++){await ev(()=>__bt.send({t:'cycle',d:1}));await sl(350)}await shot('fp-'+t)}
// third person: fake players holding items
await ev(()=>{const C=['#ff6b6b','#4dabf7','#ffd43b'];for(let i=0;i<3;i++)__bt.fake({t:'roster+',p:{id:900+i,name:['Sam','Jo','Rae'][i],color:C[i]}});__bt.fake({t:'s',id:900,p:[-.9,0],r:0,q:0,c:0});__bt.fake({t:'s',id:901,p:[0,0],r:0,q:0,c:0});__bt.fake({t:'s',id:902,p:[.9,0],r:0,q:0,c:0})});await sl(1500);
const tp=[['water','soil','seed_haze'],['gbag','trash','nutr'],['jars','wetbud','packed']];
for(let g=0;g<tp.length;g++){await ev(a=>a.forEach((t,i)=>__bt.tpHold(900+i,t)),tp[g]);await ev(()=>{__bt.tp(.4,-2.2);__bt.lookAt(0,1.0,0)});await shot('tp-held-'+tp[g].join('-'));if(!g){await ev(()=>{__bt.tp(2.2,-.8);__bt.lookAt(0,1.0,0)});await shot('tp-held-side-'+tp[g].join('-'))}}
await ev(()=>[900,901,902].forEach(i=>__bt.fake({t:'s',id:i,p:[20,20],r:0,q:0,c:0})));
// wilting warning
await ev(()=>__bt.send({t:'dbg',spawn:{x:1.5,z:-1,s:'owl',age:260,water:0}}));await sl(500);await ev(()=>__bt.send({t:'dbg',ff:30}));await sl(700);await ev(()=>{__bt.tp(1.5,.4);__bt.lookAt(1.5,.45,-1)});await sl(400);await shot('thirsty-warning');
await ev(()=>__bt.send({t:'dbg',ff:200}));await sl(800);await shot('wilting-warning');console.log('alert',await ev(()=>__bt.state().alert),'prompt',await ev(()=>__bt.state().prompt));
// pause menu + laptop entries
await ev(()=>__bt.send({t:'dbg',ff:0}));await P.keyboard.press('Escape');await sl(300);await shot('pause-menu');await P.keyboard.press('Escape');await sl(200);
console.log(errs.length?[...new Set(errs)].join('\n')+' x'+errs.length:'no console errors');await b.close();srv.kill()})();
