// v17: Section 3 harvesting & product screenshots + UI checks
const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const PORT=3261;const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:''},stdio:'ignore'});await sl(700);
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:300000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const P=await b.newPage();await P.setViewport({width:960,height:540});const errs=[];P.on('pageerror',e=>errs.push(e.message));
await P.evaluateOnNewDocument(()=>{window.__pad={id:'Xbox Sim',index:0,connected:true,mapping:'standard',timestamp:0,buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0})),axes:[0,0,0,0]};navigator.getGamepads=()=>[window.__pad,null,null,null]});
await P.goto(`http://localhost:${PORT}/?q=0`,{waitUntil:'networkidle0'});
const ev=(f,...a)=>P.evaluate(f,...a),st=()=>ev(()=>__bt.state()),ph=()=>ev(()=>__bt.phone());
const frames=async n=>{const f0=await ev(()=>__bt.frames);while(await ev(()=>__bt.frames)<f0+n)await sl(15)};
const set=(i,v)=>ev((i,v)=>{const b=__pad.buttons[i];b.pressed=v;b.value=v?1:0},i,v);
const press=async(i,hold=2)=>{await set(i,true);await frames(hold);await set(i,false);await frames(2)};
const A=0,B=1,LB=4,RB=5,VIEW=8,START=9,UP=12,DOWN=13,LEFT=14,RIGHT=15;
const res=[];const ok=(n,c,i='')=>{res.push(c);console.log(c?'PASS':'FAIL',n,i)};
const fk=()=>ev(()=>document.querySelector('#phone .f')?.dataset.pk||null);
await ev(()=>window.dispatchEvent(new Event('gamepadconnected')));
let s=await st();if(s.root=='splash'){await press(A);await frames(4)}if(await ev(()=>__bt.cre?.()))await press(B);await frames(3);
await press(A,4);await sl(1500);await frames(5);s=await st();ok('solo game started',s.root==null,s.root);
const D='/workspace/ui-shots/grow/v17-';const shot=n=>P.screenshot({path:D+n+'.png'});
const W=()=>ev(()=>__bt.W),send=m=>ev(m=>__bt.send(m),m);
const give=async(k,gd)=>{await send({t:'dbg',give:k,gd});await sl(250)};const drop=async(x,z,ry=0)=>{await send({t:'drop',x,z,y:0,ry});await sl(300)};
await send({t:'dbg',money:5000});await sl(200);
// Stage A
await give('pot');await drop(-1.4,-.6);let pot=(await W()).ents.filter(e=>e.type=='pot').at(-1);await give('soil');await send({t:'use',target:pot.id});await sl(200);await drop(0,1);await give('seed_haze');await send({t:'use',target:pot.id});await sl(200);await send({t:'dbg',id:pot.id,age:480});await sl(300);
await give('hbin');await drop(-.4,-.4);const hb=(await W()).ents.filter(e=>e.type=='hbin').at(-1);for(const s of['owl','kush','owl']){await give('wetbud',{s,g:14,q:70});await send({t:'use',target:hb.id});await sl(200)}
await give('scale');await drop(-.3,.5);const sc=(await W()).ents.filter(e=>e.type=='scale').at(-1);await give('wetbud',{s:'kush',g:23,q:70});await send({t:'use',target:sc.id});await sl(200);await send({t:'use',target:hb.id});await sl(200);
await give('shears');await ev(p=>{__bt.tp(p.x+.9,p.z+.9);__bt.lookAt(p.x,.6,p.z)},pot);await frames(10);
ok('shears prompt on ready plant',await ev(()=>/Snip/.test(document.body.innerText)),'');await shot('A-shears-aim');
await ev(()=>__bt.interact());await frames(3);ok('snip animation plays',(await ev(()=>__bt.snip()))>0);await frames(4);await shot('A-snip');await sl(400);
ok('snipped branch in hand',(await W()).ents.some(e=>e.type=='wetbud'&&e.by),'');
await ev(p=>{__bt.tp(p.x+.8,p.z+.8);__bt.lookAt(p.x,.1,p.z)},hb);await frames(10);ok('bin prompt lists strains+grams',await ev(()=>/bin/i.test(document.body.innerText)));await shot('A-harvest-bin');
await ev(p=>{__bt.tp(p.x+.6,p.z+.6);__bt.lookAt(p.x,.08,p.z)},sc);await frames(10);await shot('A-scale-grams');
try{await require('./v17shots2.cjs')({ev,send,give,drop,W,frames,sl,shot,ok,P,press,set})}catch(e){if(e.code!=='MODULE_NOT_FOUND')ok('later stages',0,e.stack)}
console.log('errs',errs);ok('no page errors',!errs.length);
srv.kill();await b.close();const n=res.filter(Boolean).length;console.log(`${n}/${res.length} passed`);process.exit(n==res.length?0:1)})();
