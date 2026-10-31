const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
module.exports=async(scenes,{PORT=3391,w=1920,h=1080}={})=>{const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:''},stdio:'ignore'});await sl(800);
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:600000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const P=await b.newPage();await P.setViewport({width:w,height:h});const errs=[];P.on('pageerror',e=>errs.push(e.message));
await P.evaluateOnNewDocument(()=>{localStorage.bt_seenver='999';window.__pad={id:'Xbox Sim',index:0,connected:true,mapping:'standard',timestamp:0,buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0})),axes:[0,0,0,0]};navigator.getGamepads=()=>[window.__pad,null,null,null]});
await P.goto(`http://localhost:${PORT}/?q=3`,{waitUntil:'load',timeout:180000});
const ev=(f,...a)=>P.evaluate(f,...a),st=()=>ev(()=>__bt.state());
const frames=async n=>{const f0=await ev(()=>__bt.frames);while(await ev(()=>__bt.frames)<f0+n)await sl(15)};
const set=(i,v)=>ev((i,v)=>{const b=__pad.buttons[i];b.pressed=v;b.value=v?1:0},i,v);
const press=async(i,hold=2)=>{await set(i,true);await frames(hold);await set(i,false);await frames(3)};
await ev(()=>window.dispatchEvent(new Event('gamepadconnected')));
let s=await st();if(s.root=='splash'){await press(0);await frames(4)}if(await ev(()=>__bt.cre?.()))await press(1);await frames(3);if((await st()).root=='m-acct'){await ev(()=>document.querySelector('[data-a=guest]').click());await frames(3)}
await sl(3000);for(let k=0;k<6&&!(await ev(()=>!!__bt.W));k++){await press(0,4);await sl(4000);let r=await st();if(r.root=='m-acct')await ev(()=>document.querySelector('[data-a=guest]')?.click());}await frames(3);console.log('started',await ev(()=>!!__bt.W));
// close any popup (what's new)
await ev(()=>{document.querySelectorAll('[data-a=wnclose],[data-a=close]').forEach(e=>e.click())});
const W=()=>ev(()=>__bt.W),send=m=>ev(m=>__bt.send(m),m);
const give=async(k,gd)=>{await send({t:'dbg',give:k,gd});await sl(250)};const drop=async(x,z,ry=0)=>{await send({t:'drop',x,z,y:0,ry});await sl(300)};
const pl=async(type,x,z,data={},ry=0)=>{await send({t:'dbg',place:{type,x,z,data,ry}});await sl(200);return (await W()).ents.filter(e=>e.type==type&&!e.by).at(-1)};
const pot=async(x,z,s,age=470,p={})=>{await send({t:'dbg',spawn:{x,z,s,age,p}});await sl(150)};
const hud=on=>ev(on=>{let e=document.getElementById('mkcss');if(!e){e=document.createElement('style');e.id='mkcss';document.head.appendChild(e)}e.textContent=on?'':'#hud,#cross,#prompt,#stats,#clock,#hold,#toast,#alert,#bhint,#feed,#qbar,#padind,#help,#brand,#decohud,#phint{display:none!important}'},on);
const cam=(...a)=>ev(a=>__bt.cam(a.length?a:null),a);
const shot=async(n,o={})=>{await frames(o.f||8);await sl(o.s||300);await P.screenshot({path:'/workspace/ui-shots/marketing/'+n+'.png'});console.log('shot',n)};
const X={P,ev,st,frames,press,set,W,send,give,drop,pl,pot,hud,cam,shot,sl,b};
for(const sc of scenes){try{await sc(X)}catch(e){console.log('ERR',e.message)}}
console.log('errs',errs.slice(0,5));srv.kill();await b.close();process.exit(0)};
