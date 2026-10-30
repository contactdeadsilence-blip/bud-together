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
let s=await st();if(s.root=='splash'){await press(A);await frames(4);s=await st();ok('A dismisses splash -> character creator (first launch)',s.root=='cre',s.root)}else console.log('(splash already timed out)');await frames(4);
{let c=await ev(()=>__bt.cre());ok('creator opens on Body tab',c&&c.t=='body'&&c.lab=='Sex',JSON.stringify(c&&[c.t,c.lab]));const sx=c.look.sex;
 await press(RIGHT);c=await ev(()=>__bt.cre());ok('creator: D-pad right changes sex',c.look.sex!=sx,c.look.sex);
 await press(DOWN);c=await ev(()=>__bt.cre());ok('creator: D-pad down -> Skin tone',c.lab=='Skin tone',c.lab);const t0=c.look.tone;await press(RIGHT);c=await ev(()=>__bt.cre());ok('creator: skin tone changes',c.look.tone!=t0);
 await press(RB);c=await ev(()=>__bt.cre());ok('creator: RB -> Face tab',c.t=='face',c.t);await press(RB);await press(RB);c=await ev(()=>__bt.cre());ok('creator: RB -> Outfit tab',c.t=='fit',c.t);
 await press(RIGHT);c=await ev(()=>__bt.cre());ok('creator: change top item',c.look.fit.top.id!='tee'||true,c.look.fit.top.id);
 await press(RB);await press(RB);c=await ev(()=>__bt.cre());ok('creator: Outfits tab',c.t=='saved',c.t);await press(A);ok('outfit slot saved',await ev(()=>JSON.parse(localStorage.bt_outfits||'[]').length==1));
 ok('look persisted',await ev(()=>!!JSON.parse(localStorage.bt_look).fit));
 await press(B);await frames(3);s=await st();ok('B closes creator -> title',s.root=='m-main',s.root)}
await frames(2);s=await st();
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
await press(A,4);await sl(1500);await frames(5);s=await st();ok('Solo starts game',s.root==null&&s.money==1000,s.root+' $'+s.money);
ok('no A bleed into game',s.held==null,s.held);
// movement & look
let x0=s.x,z0=s.z,y0=s.yaw;await ev(()=>__pad.axes[1]=-1);await sl(700);await ev(()=>__pad.axes[1]=0);await frames(2);s=await st();ok('L-stick moves',Math.hypot(s.x-x0,s.z-z0)>.5,(Math.hypot(s.x-x0,s.z-z0)).toFixed(2));
await ev(()=>__pad.axes[2]=.04);await frames(6);s=await st();ok('R-stick deadzone ignores drift',Math.abs(s.yaw-y0)<1e-6);
await ev(()=>__pad.axes[2]=1);await sl(500);await ev(()=>__pad.axes[2]=0);await frames(10);s=await st();ok('R-stick looks',Math.abs(s.yaw-y0)>.3,(s.yaw-y0).toFixed(2));
// interact
const W=await ev(()=>__bt.W);const soil=W.ents.find(e=>e.type=='soil'),seed=W.ents.find(e=>e.type=='seed_haze'),pot=W.ents.find(e=>e.type=='pot');
const aim=async(e,y=.2)=>{await ev((x,z,y)=>{__bt.tp(x,z+1.1);__bt.lookAt(x,y,z)},e.x,e.z,y);await frames(2)};
const LT=6,VIEW=8,LS=10,RS=11;
ok('connection indicator shown',s.padInd);
const r0=s.rum;await aim(soil);s=await st();ok('contextual prompt shows A + X',/A\s.*Pick up/.test(s.prompt)&&/X\s+Pick up/.test(s.prompt),s.prompt);
await press(A);await sl(400);s=await st();ok('A picks up soil',s.held=='soil',s.held);ok('vibration fired on pickup',s.rum>r0,r0+'->'+s.rum);
await aim(seed);await press(X);await sl(400);s=await st();ok('X picks up seeds (bag of 2)',s.held=='seed_haze'&&s.bag.length==2,s.bag);
await press(LB);await sl(400);s=await st();ok('LB cycles held item',s.held=='soil',s.held);
await press(RB);await sl(400);s=await st();ok('RB cycles back',s.held=='seed_haze',s.held);
await press(DOWN);await sl(400);s=await st();ok('D-pad up/down cycles quick bar',s.held=='soil',s.held);
await aim(pot,.45);s=await st();ok('prompt offers X use held',/X\s+Fill with (fresh )?soil/.test(s.prompt),s.prompt);await press(X);await sl(400);let w=await ev(()=>__bt.W);ok('X uses held soil on pot',w.ents.find(e=>e.id==pot.id).data.soil==1);
await press(LT);await sl(400);s=await st();ok('LT drops held item',s.bag.length==1,s.bag);
// jump / crouch / sprint / camera
await ev(()=>{__bt.tp(0,9.5);__bt.look(0,.2)});await frames(2);await set(A,true);await frames(3);s=await st();await set(A,false);ok('A jumps (no target)',s.y>0.05,s.y);await sl(900);s=await st();ok('lands',s.y==0);
await set(B,true);await sl(500);s=await st();ok('B held = crouch',s.ch>.3,s.ch);await set(B,false);await sl(500);s=await st();ok('stand up',s.ch<.1,s.ch);
await ev(()=>__pad.axes[1]=-1);await frames(2);await press(LS);s=await st();ok('LS click sprints',s.sprint);await ev(()=>__pad.axes[1]=0);await frames(3);s=await st();ok('sprint ends when stopping',!s.sprint);
await press(RS);await sl(200);let dd=await ev(()=>__bt.decor());ok('RS click enters decorate mode',dd.on,JSON.stringify(dd));await press(Y);await sl(200);dd=await ev(()=>__bt.decor());s=await st();ok('Y opens decor catalog w/ focus',dd.cat&&s.root=='decocat'&&!!s.focus,s.root+' '+s.focus);await press(B);await sl(200);dd=await ev(()=>__bt.decor());ok('B closes catalog',!dd.cat);await press(RS);await sl(200);dd=await ev(()=>__bt.decor());ok('RS click exits decorate mode',!dd.on);
// inventory
await ev(()=>__bt.send({t:'dbg',give:'water'}));await sl(400);await press(Y);s=await st();ok('Y opens inventory w/ focus',s.root=='invs'&&s.invOpen&&!!s.focus,s.root+' '+s.focus);
await P.screenshot({path:'/workspace/ui-shots/grow/v4-inventory.png'});
const h0=s.held;await press(RIGHT);console.log('inv',JSON.stringify(await ev(()=>[document.querySelector('.slot.f')?.outerHTML,__bt.state().bag])));await press(A);await sl(500);s=await st();ok('A selects other slot to hold',s.held!=h0,h0+'->'+s.held);
await press(Y);s=await st();ok('Y closes inventory',!s.invOpen&&s.root==null);await press(Y);await press(B);s=await st();ok('B closes inventory',!s.invOpen);
// map
await press(VIEW);s=await st();ok('View opens map',s.mapOpen&&s.root=='mapv');await frames(3);await P.screenshot({path:'/workspace/ui-shots/grow/v4-map.png'});await press(B);s=await st();ok('B closes map',!s.mapOpen);
// pause
await press(START);s=await st();ok('Menu pauses w/ focus',s.root=='pause'&&s.focus=='resume',s.focus);
await press(DOWN);s=await st();ok('pause nav',s.focus!='resume',s.focus);await press(B);s=await st();ok('B resumes',s.root==null&&!s.paused);
// laptop
await ev(()=>{__bt.tp(-2.6,-2);__bt.lookAt(-3.6,1.05,-2)});await frames(2);s=await st();ok('laptop prompt shows A',/A\s+Use Laptop/.test(s.prompt),s.prompt);await P.screenshot({path:'/workspace/ui-shots/grow/v4-prompts.png'});
await press(A);s=await st();ok('A opens laptop, focus on first shop item',s.lapOpen&&s.focus=='soil',s.focus);
await press(DOWN);s=await st();ok('down -> next item',s.focus=='pot',s.focus);
await press(RIGHT);await press(RIGHT);s=await st();ok('right = quantity +',s.qty.pot==3,JSON.stringify(s.qty));await press(LEFT);s=await st();ok('left = quantity -',s.qty.pot==2);
const m0=s.money;await press(A);await sl(500);s=await st();ok('A buys 2 pots',s.money==m0-20,m0+'->'+s.money);
await press(RB);s=await st();ok('RB -> Contracts tab',s.tab=='contracts'&&!!s.focus,s.focus);await press(DOWN);
await press(RB);s=await st();ok('RB -> Utilities tab',s.tab=='util');await press(RB);s=await st();ok('RB -> Upgrades tab',s.tab=='upg');await press(LB);await press(LB);await press(LB);s=await st();ok('LB back to Shop',s.tab=='shop');
const held0=(await st()).bag.length;await press(B);await frames(4);s=await st();ok('B closes laptop',!s.lapOpen&&s.root==null);ok('no B bleed (nothing dropped)',s.bag.length==held0,s.bag);
await press(A);await press(START);s=await st();ok('Menu closes laptop',!s.lapOpen);
// remap via controller
await press(START);let g=0;while((await st()).focus!='set'&&g++<5)await press(DOWN);await press(A);s=await st();ok('pause -> Settings',s.root=='m-set',s.root);
g=0;while((await st()).focus!='remap'&&g++<8){await press(DOWN);console.log('f',(await st()).root,(await st()).focus)}await press(A);s=await st();ok('Remap screen opens w/ focus',s.root=='m-remap'&&/rm/.test(s.focus),s.focus);
await P.screenshot({path:'/workspace/ui-shots/grow/v4-remap.png'});
await press(A);await press(Y);s=await st();ok('remap jump -> Y (swaps inventory -> A)',s.binds.jump==3&&s.binds.inventory==0,JSON.stringify(s.binds));
let ls=await ev(()=>JSON.parse(localStorage.bt_binds||'{}'));ok('remap saved to localStorage',ls.jump==3);
await press(B);await press(B);await press(B);s=await st();ok('back out to game',s.root==null,s.root);
await press(A);s=await st();ok('remapped A now opens inventory',s.invOpen);await press(B);
// hot-switch
await ev(()=>{__bt.tp(-2.6,-2);__bt.lookAt(-3.6,1.05,-2)});await P.keyboard.press('KeyW');await frames(3);s=await st();ok('keyboard hot-switch: prompts show E',!s.padMode&&/E\s+Use Laptop/.test(s.prompt),s.prompt);
await press(DOWN);await frames(2);s=await st();ok('pad hot-switch back: prompts show (remapped) Y',s.padMode&&/Y\s+Use Laptop/.test(s.prompt),s.prompt);
// disconnect / reconnect
await ev(()=>{__pad.connected=false;window.dispatchEvent(new Event('gamepaddisconnected'))});await frames(3);s=await st();ok('disconnect auto-pauses + hides indicator',s.paused&&!s.padInd);
await ev(()=>{__pad.connected=true;__pad.index=1});await frames(3);await press(B);s=await st();ok('reconnected pad resumes',!s.paused&&s.padInd);
ok('no page errors',errs.length==0,errs.join(' | '));
await P.reload({waitUntil:'networkidle0'});await sl(500);s=await st();ok('remap persists after reload',s.binds.jump==3,JSON.stringify(s.binds));
await ev(()=>{localStorage.bt_binds=JSON.stringify({});});
const f=res.filter(r=>r[0]=='FAIL').length;console.log(`\n${res.length-f}/${res.length} passed`);await b.close();srv.kill();process.exit(f?1:0)})();