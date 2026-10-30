const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));const O='/workspace/ui-shots/grow/';
(async()=>{const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT:3205,BT_DEBUG:1},stdio:'ignore'});await sl(700);
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:600000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const P=await b.newPage();await P.setViewport({width:1280,height:720});P.on('pageerror',e=>console.log('ERR',e.message));P.on('console',m=>m.type()=='error'&&console.log('CE',m.text()));
await P.goto('http://localhost:3205/?q=2&nosplash',{waitUntil:'networkidle0'});await sl(1500);
await P.evaluate(()=>document.querySelector('[data-a=solo]').click());await sl(2500);
const ev=(f,...a)=>P.evaluate(f,...a);const fr=async n=>{const f0=await ev(()=>__bt.frames);while(await ev(()=>__bt.frames)<f0+n)await sl(50)};
await ev(()=>{const C=['#ff6b6b','#4dabf7','#ffd43b'];for(let i=0;i<3;i++)__bt.fake({t:'roster+',p:{id:900+i,name:['Sam','Jo','Rae'][i],color:C[i]}});
 __bt.fake({t:'s',id:900,p:[-.9,0],r:0,q:0,c:0});__bt.fake({t:'s',id:901,p:[0,0],r:0,q:.3,c:0});__bt.fake({t:'s',id:902,p:[.9,0],r:0,q:0,c:1})});await sl(1200);
await ev(()=>{__bt.tp(0,-2.6);__bt.lookAt(0,1.0,0)});await fr(6);await P.screenshot({path:O+'v5-players-front.png'});
await ev(()=>{__bt.tp(2.6,0);__bt.lookAt(0,1.0,0)});await fr(6);await P.screenshot({path:O+'v5-players-side.png'});
await ev(()=>{__bt.tp(-.5,-1.1);__bt.lookAt(-.9,1.5,0)});await fr(6);await P.screenshot({path:O+'v5-face-closeup.png'});
// walking
for(let i=0;i<8;i++){await ev(i=>__bt.fake({t:'s',id:900,p:[-.9,-i*.25],r:0,q:0,c:0}),i);await sl(66)}
await ev(()=>{__bt.tp(2.2,-1);__bt.lookAt(-.9,.9,-1.5)});await fr(3);await P.screenshot({path:O+'v5-walk.png'});
await ev(()=>{__bt.send({t:'dbg',give:'water'})});await sl(800);await ev(()=>{__bt.tp(0,3);__bt.look(0,-.1)});await fr(5);await P.screenshot({path:O+'v5-fp-hands.png'});
await b.close();srv.kill()})();
