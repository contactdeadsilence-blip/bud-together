// v19 graphics settings test
const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const PORT=3275;const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:''},stdio:'ignore'});await sl(700);
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:300000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const P=await b.newPage();await P.setViewport({width:960,height:540});const errs=[];P.on('pageerror',e=>errs.push(e.message));
await P.evaluateOnNewDocument(()=>{window.__pad={id:'Xbox Sim',index:0,connected:true,mapping:'standard',timestamp:0,buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0})),axes:[0,0,0,0]};navigator.getGamepads=()=>[window.__pad,null,null,null]});
const go=async q=>{await P.goto(`http://localhost:${PORT}/${q==null?"":"?q="+q}`,{waitUntil:"networkidle0"})};
const ev=(f,...a)=>P.evaluate(f,...a),st=()=>ev(()=>__bt.state());
const frames=async n=>{const f0=await ev(()=>__bt.frames);while(await ev(()=>__bt.frames)<f0+n)await sl(15)};
const set=(i,v)=>ev((i,v)=>{const b=__pad.buttons[i];b.pressed=v;b.value=v?1:0},i,v);
const press=async(i,hold=2)=>{await set(i,true);await frames(hold);await set(i,false);await frames(3)};
const A=0,B=1,X=2,Y=3,LB=4,RB=5,LT=6,RT=7,UP=12,DOWN=13,LEFT=14,RIGHT=15;
const res=[];const ok=(n,c,i='')=>{res.push(c);console.log(c?'PASS':'FAIL',n,i)};
const start=async()=>{await ev(()=>window.dispatchEvent(new Event('gamepadconnected')));let s=await st();if(s.root=='splash'){await press(A);await frames(4)}if(await ev(()=>__bt.cre?.()))await press(B);await frames(3);if((await st()).root=='m-acct'){await ev(()=>document.querySelector('[data-a=guest]').click());await frames(3)}await press(A,4);await sl(1500);await frames(5);return (await st()).root==null};
const D='/workspace/ui-shots/grow/v19-';
const exp=[{sh:512,smaa:false,composer:false},{sh:1024,fxaa:true,composer:true},{sh:2048,composer:true},{sh:4096,smaa:true,composer:true}];
for(let q=+(process.env.Q0||0);q<4;q++){await go(q);ok('q'+q+' game started',await start());await ev(()=>__bt.warp(0,8,Math.PI,-.1));await frames(30);const g=await ev(()=>__bt.gfx());const e=exp[q];
 ok('preset '+q+' applied',g.preset==q&&g.shadow==e.sh&&(e.smaa==null||g.smaa==e.smaa)&&(e.fxaa==null||g.fxaa==e.fxaa)&&g.composer==e.composer,JSON.stringify(g));
 const t0=Date.now(),f0=await ev(()=>__bt.frames);await sl(2000);console.log('  fps (swiftshader)',((await ev(()=>__bt.frames))-f0)/((Date.now()-t0)/1000));
 await P.screenshot({path:D+'gfx-'+['low','medium','high','ultra'][q]+'.png'})}
// controller navigation of the graphics panel
await press(9);await frames(5);ok('paused',(await st()).root=='pause',(await st()).root);
await ev(()=>document.querySelector('#pause [data-a=set]').click());await frames(4);await ev(()=>document.querySelector('[data-a=gfx]').click());await frames(5);
ok('gfx panel open',(await st()).root=='m-gfx'||await ev(()=>getComputedStyle(document.getElementById('m-gfx')).display!='none'),(await st()).root);
ok('focus on preset',await ev(()=>document.activeElement?.id||__bt.state().focus),await ev(()=>document.activeElement?.id));
await press(LEFT);await frames(5);let v=await ev(()=>document.getElementById('g_preset').value);ok('d-pad changes preset',v=='2',v);
await press(DOWN);await press(LEFT);await frames(5);v=await ev(()=>[document.getElementById('g_preset').value,document.getElementById('g_aa').value]);ok('changing an option -> Custom',v[0]=='-1'&&v[1]!='msaa',JSON.stringify(v));
await P.screenshot({path:D+'gfx-menu.png'});
await ev(()=>document.querySelector('[data-a=gfxapply]').click());await sl(2500);const ls=await ev(()=>localStorage.bt_gfx);ok('saved to localStorage',ls&&JSON.parse(ls).preset==-1,ls);
await go(null);await sl(500);const g2=await ev(()=>__bt.gfx());ok('persisted custom after reload',g2.preset==-1&&g2.aa==v[1],JSON.stringify(g2));
ok('no page errors',!errs.length,errs.slice(0,3).join(' | '));
const n=res.filter(Boolean).length;console.log(n+'/'+res.length);await b.close();srv.kill();process.exit(0)})();
