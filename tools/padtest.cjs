// Gamepad simulation test: injects a fake standard gamepad and drives every menu + in-game actions.
const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const PORT=3201;const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1},stdio:'ignore'});await sl(700);
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const P=await b.newPage();await P.setViewport({width:960,height:540});const errs=[];P.on('pageerror',e=>errs.push(e.message));
await P.evaluateOnNewDocument(()=>{window.__pad={id:'Sim Pad',index:0,connected:true,mapping:'standard',timestamp:0,buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0})),axes:[0,0,0,0]};
 navigator.getGamepads=()=>[window.__pad.connected?window.__pad:null,null,null,null]});
await P.goto(`http://localhost:${PORT}/?q=0`,{waitUntil:'networkidle0'});
const ev=(f,...a)=>P.evaluate(f,...a),st=()=>ev(()=>__bt.state());
const frames=async n=>{const f0=await ev(()=>__bt.frames);while(await ev(()=>__bt.frames)<f0+n)await sl(15)};
const set=(i,v)=>ev((i,v)=>{const b=__pad.buttons[i];b.pressed=v;b.value=v?1:0},i,v);
const press=async(i,hold=2)=>{await set(i,true);await frames(hold);await set(i,false);await frames(2)};
const axis=async(i,v,n)=>{await ev((i,v)=>__pad.axes[i]=v,i,v);await frames(n);await ev(i=>__pad.axes[i]=0,i);await frames(2)};
const A=0,B=1,X=2,Y=3,LB=4,RB=5,RT=7,START=9,UP=12,DOWN=13,LEFT=14,RIGHT=15;
const res=[];const ok=(name,c,info='')=>{res.push([c?'PASS':'FAIL',name,info]);console.log(c?'PASS':'FAIL',name,info)};
await ev(()=>window.dispatchEvent(new Event('gamepadconnected')));
let s=await st();if(s.root=='splash'){await press(A);s=await st();ok('A dismisses splash',s.root=='m-main',s.root)}else console.log('(splash already timed out)');await frames(2);s=await st();
ok('glyph mode on',s.padMode);ok('title auto-focus Play Solo',s.focus=='solo',s.focus);
await press(DOWN);s=await st();ok('D-pad down -> Host',s.focus=='host',s.focus);
await axis(1,.9,3);s=await st();ok('L-stick down -> Join',s.focus=='join',s.focus);
await press(A);s=await st();ok('A opens Join menu',s.root=='m-join'&&s.focus=='code',s.root+' '+s.focus);
await press(A);s=await st();ok('A on code field enters on-screen keyboard',s.focus=='A',s.focus);
await press(RIGHT);await press(A);await press(A);s=await st();ok('OSK types (B,B)',s.code=='BB',s.code);
await press(B);s=await st();ok('B on OSK = backspace',s.code=='B',s.code);
await press(B);await press(B);s=await st();ok('B on empty OSK returns to field',s.focus=='code',s.focus);
await press(B);s=await st();ok('B backs out to title',s.root=='m-main',s.root);
await press(DOWN);await press(DOWN);await press(DOWN);s=await st();ok('navigate to Settings',s.focus=='set',s.focus);
await press(A);s=await st();ok('Settings opens w/ focus',s.root=='m-set'&&!!s.focus,s.focus);
const s0=s.sens;await press(RIGHT);s=await st();ok('D-pad right changes slider',s.sens==s0+1,s0+'->'+s.sens);await press(LEFT);
await press(B);s=await st();ok('B from settings -> title',s.root=='m-main',s.root);
await press(DOWN);await press(A);await frames(10);await sl(500);s=await st();ok('Host Co-op -> lobby',s.root=='m-lobby',s.root+' '+s.focus);
await press(B);s=await st();ok('B leaves lobby',s.root=='m-main',s.root);
await press(UP);s=await st();ok('focus back to Solo',s.focus=='solo',s.focus);
await press(A,4);await sl(1500);await frames(5);s=await st();ok('Solo starts game',s.root==null&&s.money==150,s.root+' $'+s.money);
ok('no A bleed into game',s.held==null,s.held);
// movement & look
let x0=s.x,z0=s.z,y0=s.yaw;await ev(()=>__pad.axes[1]=-1);await sl(700);await ev(()=>__pad.axes[1]=0);await frames(2);s=await st();ok('L-stick moves',Math.hypot(s.x-x0,s.z-z0)>.5,(Math.hypot(s.x-x0,s.z-z0)).toFixed(2));
await ev(()=>__pad.axes[2]=.04);await frames(6);s=await st();ok('R-stick deadzone ignores drift',Math.abs(s.yaw-y0)<1e-6);
await ev(()=>__pad.axes[2]=1);await sl(500);await ev(()=>__pad.axes[2]=0);await frames(10);s=await st();ok('R-stick looks',Math.abs(s.yaw-y0)>.3,(s.yaw-y0).toFixed(2));
// interact
const W=await ev(()=>__bt.W);const soil=W.ents.find(e=>e.type=='soil'),seed=W.ents.find(e=>e.type=='seed_haze'),pot=W.ents.find(e=>e.type=='pot');
const aim=async(e,y=.2)=>{await ev((x,z,y)=>{__bt.tp(x,z+1.1);__bt.lookAt(x,y,z)},e.x,e.z,y);await frames(2)};
await aim(soil);await press(A);await sl(400);s=await st();ok('A picks up soil',s.held=='soil',s.held);
await aim(seed);await press(RT);await sl(400);s=await st();ok('RT picks up seeds (bag of 2)',s.held=='seed_haze'&&s.bag.length==2,s.bag);
await press(LB);await sl(400);s=await st();ok('LB cycles held item',s.held=='soil',s.held);
await press(RB);await sl(400);s=await st();ok('RB cycles back',s.held=='seed_haze',s.held);
await press(LB);await sl(300);await aim(pot,.45);await press(X);await sl(400);let w=await ev(()=>__bt.W);ok('X uses held soil on pot',w.ents.find(e=>e.id==pot.id).data.soil==1);
await press(B);await sl(400);s=await st();ok('B drops held item',s.bag.length==1,s.bag);
// pause
await press(START);s=await st();ok('Start pauses w/ focus',s.root=='pause'&&s.focus=='resume',s.focus);
await press(DOWN);s=await st();ok('pause nav',s.focus!='resume',s.focus);await press(B);s=await st();ok('B resumes',s.root==null&&!s.paused);
// laptop
await ev(()=>{__bt.tp(-2.6,-2);__bt.lookAt(-3.6,1.05,-2)});await frames(2);await press(A);s=await st();ok('A opens laptop, focus on first shop item',s.lapOpen&&s.focus=='soil',s.focus);
await press(DOWN);s=await st();ok('down -> next item',s.focus=='pot',s.focus);
await press(RIGHT);await press(RIGHT);s=await st();ok('right = quantity +',s.qty.pot==3,JSON.stringify(s.qty));await press(LEFT);s=await st();ok('left = quantity -',s.qty.pot==2);
const m0=s.money;await press(A);await sl(500);s=await st();ok('A buys 2 pots',s.money==m0-20,m0+'->'+s.money);
await P.screenshot({path:'/workspace/ui-shots/grow/v2-laptop-controller.png'});
await press(RB);s=await st();ok('RB -> Contracts tab',s.tab=='contracts'&&!!s.focus,s.focus);await press(DOWN);
await press(RB);s=await st();ok('RB -> Upgrades tab',s.tab=='upg');await press(LB);await press(LB);s=await st();ok('LB back to Shop',s.tab=='shop');
const held0=(await st()).bag.length;await press(B);await frames(4);s=await st();ok('B closes laptop',!s.lapOpen&&s.root==null);ok('no B bleed (nothing dropped)',s.bag.length==held0,s.bag);
await press(Y);s=await st();ok('Y opens contracts',s.lapOpen&&s.tab=='contracts');await press(START);s=await st();ok('Start closes laptop',!s.lapOpen);
// reconnect
await ev(()=>{__pad.connected=false;window.dispatchEvent(new Event('gamepaddisconnected'))});await frames(3);await ev(()=>{__pad.connected=true;__pad.index=1});await frames(3);
await press(START);s=await st();ok('reconnected pad works',s.paused);await press(B);
ok('no page errors',errs.length==0,errs.join(' | '));
const f=res.filter(r=>r[0]=='FAIL').length;console.log(`\n${res.length-f}/${res.length} passed`);await b.close();srv.kill();process.exit(f?1:0)})();
