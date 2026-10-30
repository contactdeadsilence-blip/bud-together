const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));const O='/workspace/ui-shots/grow/';
(async()=>{const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT:3204,BT_DEBUG:1},stdio:'ignore'});await sl(700);
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:600000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const P=await b.newPage();await P.setViewport({width:1280,height:720});P.on('pageerror',e=>console.log('ERR',e.message));
await P.goto('http://localhost:3204/?q=2&nosplash',{waitUntil:'networkidle0'});await sl(1500);
await P.evaluate(()=>document.querySelector('[data-a=solo]').click());await sl(2500);
const ev=(f,...a)=>P.evaluate(f,...a);const fr=async n=>{const f0=await ev(()=>__bt.frames);while(await ev(()=>__bt.frames)<f0+n)await sl(50)};

const sp=(o)=>ev(o=>__bt.send({t:'dbg',spawn:o}),o);
await sp({x:-2,z:-3.6,s:'owl',age:200,water:3,crack:.9,dry:45});await sp({x:-1,z:-3.6,s:'haze',age:200,water:15,crack:.35});await sp({x:0,z:-3.6,s:'kush',age:200,water:80});await sl(1500);
await ev(()=>{__bt.tp(-1,-1.9);__bt.lookAt(-1,.3,-3.6)});await fr(4);await P.screenshot({path:O+'v3-dry-cracked.png'});console.log('dry');
await ev(()=>__bt.send({t:'dbg',give:'water'}));await ev(()=>{__bt.tp(-1,-2.6);__bt.lookAt(-1,.25,-3.6)});await fr(3);
await P.keyboard.down('KeyE');let s0;for(let i=0;i<400;i++){await sl(150);s0=await ev(()=>__bt.state());if(s0.checks>0)break}
await fr(2);await P.screenshot({path:O+'v3-watering-check.png'});await P.keyboard.up('KeyE');console.log('water',JSON.stringify({m:s0.meter,c:s0.checks}));
await sp({x:1,z:-3.6,s:'owl',age:300,water:0,dead:true});await ev(()=>__bt.send({t:'dbg',give:'gbag'}));await sl(800);
await ev(()=>{__bt.tp(1,-2.5);__bt.lookAt(1,.4,-3.6)});await fr(4);await P.screenshot({path:O+'v3-bagging-dead.png'});
await P.keyboard.press('KeyE');await sl(1500);await ev(()=>{__bt.tp(5,6.4);__bt.lookAt(5,.8,8.6)});await fr(4);await P.screenshot({path:O+'v3-dumpster-trash.png'});
await b.close();srv.kill()})();