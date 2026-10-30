// v10/v11: sink close-up, interior before/after decor, outside, dirt dump flow, decorate UI, table + pre-rolls, bed/clock
const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));const O='/workspace/ui-shots/grow/';
(async()=>{const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT:3213,BT_DEBUG:1,DATABASE_URL:''},stdio:'ignore'});await sl(900);
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:600000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const P=await b.newPage();await P.setViewport({width:1280,height:720});const errs=[];P.on('pageerror',e=>errs.push('ERR '+e.message));P.on('console',m=>m.type()=='error'&&errs.push('CON '+m.text()));
await P.goto('http://localhost:3213/?q=2&nosplash',{waitUntil:'networkidle0'});await sl(1500);const ev=(f,...a)=>P.evaluate(f,...a);
for(let k=0;k<3&&(await ev(()=>__bt.state().root))=='cre';k++){await P.keyboard.press('Escape');await sl(800)}
await ev(()=>{localStorage.bt_book='1';document.querySelector('[data-a=solo]').click()});await sl(3000);for(let k=0;k<3&&(await ev(()=>__bt.state().root))=='cre';k++){await P.keyboard.press('Escape');await sl(800)}
const S=async(n,f,w=1500)=>{await ev(f);await sl(w);await P.screenshot({path:O+'v10-'+n+'.png'});console.log('shot',n)};
const tx=m=>ev(m=>__bt.send(m),m);
await tx({t:'dbg',min:600});
await S('sink',()=>{__bt.tp(2.3,-.5);__bt.lookAt(3.55,.85,-.45)});
await S('interior-before',()=>{__bt.tp(3.6,4.2);__bt.lookAt(-2,1,-2.5)},2000);
for(const [k,v] of [['paint','sage'],['panel','shiplap'],['floor','walnut'],['light','neutral'],['fix','pendant']])await tx({t:'dstyle',k,v});
for(const q of [{k:'rug',x:.5,y:0,z:1,ry:0},{k:'couch',x:1.5,y:0,z:4.3,ry:Math.PI},{k:'plant',x:3.6,y:0,z:4.4,ry:0},{k:'clock',x:0,y:1.9,z:-4.95,ry:0}])await tx({t:'dplace',...q});
await tx({t:'dbg',place:{type:'table',x:1.2,z:-1.5,data:{items:[{type:'jars',data:{},x:-.3,z:0,ry:0},{type:'joints',data:{s:'owl',n:5},x:.2,z:.05,ry:.3},{type:'papers',data:{uses:9},x:.4,z:-.15,ry:0}]}}});
await sl(800);await S('interior-after',()=>{__bt.tp(3.6,4.2);__bt.lookAt(-2,1,-2.5)},2500);
await S('outside',()=>{__bt.tp(2,10.5);__bt.lookAt(0,1.2,4)},2500);
await tx({t:'dbg',spawn:{x:0,z:-2.8}});await sl(1000);const pid=await ev(()=>__bt.W.ents.find(e=>e.type=='pot'&&e.x==0&&e.z==-2.8).id);await tx({t:'dbg',set:{id:pid,d:{soil:1,used:1,moist:40}}});await tx({t:'dbg',give:'gbag'});await sl(800);
await S('dump1-usedsoil',()=>{__bt.tp(0,-1.2);__bt.lookAt(0,.4,-2.8)});
await tx({t:'use',target:pid});await sl(600);await S('dump2-bagged',()=>{__bt.tp(0,-1.2);__bt.lookAt(0,.4,-2.8)});
await S('dump3-dumpster',()=>{__bt.tp(4.2,7.4);__bt.lookAt(5,.9,8.6)});
await tx({t:'use',target:'bin'});await sl(600);
await S('table-ghost',()=>{__bt.tp(1.2,-.3);__bt.lookAt(1.2,.8,-1.5)});
await S('decor-ui',()=>{__bt.decoMode(true);__bt.openDecoCat('items')},2000);
await ev(()=>document.querySelector('[data-a=decoclose]')?.click());await sl(500);
await S('decor-place',()=>{__bt.decoPick('beanbag');__bt.tp(.5,2);__bt.lookAt(-1,.2,3)},2000);
await ev(()=>__bt.decoMode(false));await tx({t:'dbg',min:1290});
await S('bed-night',()=>{__bt.tp(-1.2,2);__bt.lookAt(-3.05,.4,3.6)},2000);
console.log(errs.join('\n'));await b.close();srv.kill();process.exit(0)})();
