// v12 Stage 1: Quick Bud phone app — controller-only flow + keyboard P + shared server order path.
const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const PORT=3221;const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:''},stdio:'ignore'});await sl(700);
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:300000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const P=await b.newPage();await P.setViewport({width:960,height:540});const errs=[];P.on('pageerror',e=>errs.push(e.message));
await P.evaluateOnNewDocument(()=>{try{localStorage.bt_seenacct=1}catch(e){};window.__pad={id:'Xbox Sim',index:0,connected:true,mapping:'standard',timestamp:0,buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0})),axes:[0,0,0,0]};navigator.getGamepads=()=>[window.__pad,null,null,null]});
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
// hold View opens phone; tap View still opens map
await press(VIEW,3);await frames(3);s=await st();ok('tap View still opens Map',s.root=='mapv',s.root);await press(VIEW);await frames(3);s=await st();ok('View closes map',s.root==null,s.root);
await set(VIEW,true);await sl(900);await frames(4);await set(VIEW,false);await frames(3);let p=await ph();s=await st();ok('hold View opens phone',p.on&&s.root=='phone',s.root);
ok('phone focus on Quick Bud app',await fk()=='app',await fk());
await press(A);p=await ph();ok('A opens Quick Bud shop',p.scr=='qb'&&p.tab=='shop',p.scr+p.tab);
const n0=await ev(()=>document.querySelectorAll('#phone .ph-it').length);ok('shop lists catalog items',n0>=15,n0);
// category: navigate down to chips and pick Seeds
let f=await fk();for(let i=0;i<6&&!/^c/.test(f||'');i++){await press(DOWN);f=await fk()}ok('D-pad reaches category chips',/^c/.test(f||''),f);
for(let i=0;i<7&&f!='call';i++){await press(LEFT);f=await fk()}await press(RIGHT);f=await fk();await press(A);p=await ph();const ns=await ev(()=>[...document.querySelectorAll('#phone .ph-it')].map(e=>e.dataset.v));ok('Seeds category filters',p.cat=='seeds'&&ns.length&&ns.every(k=>k.startsWith('seed_')),ns.join());
// add first seed to cart
for(let i=0;i<8&&!/^a/.test(f||'');i++){await press(DOWN);f=await fk()}const k1=f.slice(1);await press(A);await press(A);p=await ph();ok('A adds item to cart (x2)',p.cart[k1]==2,JSON.stringify(p.cart));
// search with on-screen keyboard
for(let i=0;i<12&&f!='search';i++){await press(UP);f=await fk()}ok('reach search box',f=='search',f);await press(A);p=await ph();ok('search opens keyboard',p.scr=='search'&&/^k/.test(await fk()||''),await fk());
const typ=async ch=>{await ev(c=>{const e=document.querySelector(`#phone [data-pk="k${c}"]`);__bt.focusEl?.(e)},ch);};
// navigate keyboard by D-pad to S,O,I,L
const go=async ch=>{for(let i=0;i<20;i++){const cur=(await fk()).slice(1);if(cur==ch)break;const K='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';const a=K.indexOf(cur),t=K.indexOf(ch);if(a<0){await press(UP);continue}const ar=a/6|0,ac=a%6,tr=t/6|0,tc=t%6;await press(tr>ar?DOWN:tr<ar?UP:tc>ac?RIGHT:LEFT)}await press(A)};
for(const c of 'SOIL')await go(c);p=await ph();ok('OSK typed SOIL',p.q=='SOIL',p.q);await press(B);p=await ph();ok('B leaves keyboard',p.scr=='qb',p.scr);
const ns2=await ev(()=>[...document.querySelectorAll('#phone .ph-it')].map(e=>e.dataset.v));ok('search filters (soil)',ns2.length&&ns2.every(k=>/soil/.test(k)),ns2.join());
// RB -> cart; qty with D-pad on line
await press(RB);p=await ph();ok('RB -> Cart tab',p.tab=='cart',p.tab);
await ev(k=>__bt.focusEl(document.querySelector(`#phone [data-pk="l${k}"]`)),k1);await press(RIGHT);p=await ph();ok('D-pad right on cart line adds qty',p.cart[k1]==3,p.cart[k1]);await press(LEFT);p=await ph();ok('D-pad left lowers qty',p.cart[k1]==2,JSON.stringify(p.cart)+' '+await fk());
const m0=(await ev(()=>__bt.W)).money;f=await fk();for(let i=0;i<6&&f!='co';i++){await press(DOWN);f=await fk()}ok('reach Place order',f=='co',f);await press(A);await sl(500);p=await ph();let W=await ev(()=>__bt.W);
const price=await ev(k=>0,k1);ok('checkout charges money & creates order',W.money<m0&&W.orders?.[0]?.via=='phone',m0+'->'+W.money);ok('cart cleared, Orders tab shown',p.tab=='orders'&&!Object.keys(p.cart).length,p.tab);
ok('order tracking shows progress',await ev(()=>/Order #\d+/.test(document.querySelector('#phone').innerText)));
await sl(6500);await frames(3);W=await ev(()=>__bt.W);ok('order delivered to door (same delivery as laptop)',W.orders[0].left==0&&W.ents.filter(e=>e.type==k1).length>=2,W.orders[0].left);
ok('tracking says Delivered',await ev(()=>/Delivered/.test(document.querySelector('#phone').innerText)));
await press(B);await press(B);p=await ph();ok('B backs to home',p.scr=='home',p.scr);await press(VIEW);p=await ph();s=await st();ok('View closes phone, gameplay resumes',!p.on&&s.root==null,s.root);
// keyboard P
await P.keyboard.press('KeyP');await frames(3);p=await ph();ok('P opens phone',p.on);await P.keyboard.press('KeyP');await frames(3);p=await ph();ok('P closes phone',!p.on);
// remap entry exists & persists purchases
ok('Phone action in remap list',(await ev(()=>__bt.acts())).includes('phone'));
ok('no page errors',!errs.length,errs.join('|'));
console.log(`${res.filter(Boolean).length}/${res.length} passed`);await b.close();srv.kill();process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.error(e);process.exit(1)});
