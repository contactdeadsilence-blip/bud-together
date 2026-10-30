const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));const O='/workspace/ui-shots/grow/';
(async()=>{const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT:3203,BT_DEBUG:1},stdio:'ignore'});await sl(700);
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:600000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const P=await b.newPage();await P.setViewport({width:1280,height:720});P.on('pageerror',e=>console.log('ERR',e.message));
await P.goto('http://localhost:3203/?q=2&nosplash',{waitUntil:'networkidle0'});await sl(1500);await P.screenshot({path:O+'v2-title.png'});
await P.evaluate(()=>document.querySelector('[data-a=solo]').click());await sl(2500);
const ev=(f,...a)=>P.evaluate(f,...a);const fr=async n=>{const f0=await ev(()=>__bt.frames);while(await ev(()=>__bt.frames)<f0+n)await sl(50)};
const st=[['seedling',40,100],['veg',170,100],['flower',300,100],['ready',480,100],['sick',260,35],['dead',100,0]];
st.forEach(([n,age,h],i)=>{});
for(const [i,[n,age,h]] of st.entries())await ev((x,age,h,dead)=>__bt.send({t:'dbg',spawn:{x,z:-3.6,s:['haze','kush','owl'][Math.abs(x*2)%3|0],age,health:h,water:80,dead}}),-2.5+i*1,age,h,n=='dead');
await ev(()=>__bt.send({t:'dbg',spawn:{x:-2,z:3.2,s:'kush',age:480,health:100,water:30}}));await sl(1500);
for(const [i,[n]] of st.entries()){const x=-2.5+i;const y=n=='seedling'?.35:n=='veg'?.6:.75;await ev((x,y)=>{__bt.tp(x+.05,-3.6+(y<.5?.55:.95));__bt.lookAt(x,y,-3.6)},x,y);await fr(3);await P.screenshot({path:O+`v2-plant-${n}.png`});console.log(n)}
await ev(()=>{__bt.tp(3,3.8);__bt.lookAt(-1,.8,-2)});await fr(3);await P.screenshot({path:O+'v2-grow-room.png'});
await ev(()=>{__bt.tp(0,9.5);__bt.lookAt(0,1.4,4)});await fr(3);await P.screenshot({path:O+'v2-outside.png'});
await b.close();srv.kill()})();
