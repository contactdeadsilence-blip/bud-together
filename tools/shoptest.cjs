// v15: browser-style laptop shop (www.budsupply.shop) + 3D thumbnails everywhere
const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const PORT=3231;const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:''},stdio:'ignore'});await sl(700);
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
const W2=f=>ev(f);const SH=async n=>{if(process.env.SHOTS){await P.setViewport({width:1280,height:720});await frames(3);await P.screenshot({path:'/workspace/ui-shots/grow/v15-'+n+'.png'});await P.setViewport({width:960,height:540});await frames(2)}};const fcls=()=>ev(()=>{const e=__bt2.fk();return e?(e.dataset.bs||e.dataset.a||e.className):null});
await ev(()=>__bt.send({t:'dbg',earned:99999}));await sl(300);await W2(()=>__bt2.openLap('shop'));await frames(3);
ok('laptop shop is full screen',await ev(()=>{const r=document.getElementById('lap').getBoundingClientRect();return r.width>=innerWidth-2&&r.height>=innerHeight-2}));
ok('URL bar shows www.budsupply.shop',(await ev(()=>document.getElementById('wurl').textContent)).includes('www.budsupply.shop'));
ok('browser chrome: back/forward/refresh + logo + search + cart + categories',await ev(()=>!!(document.querySelector('[data-a=wback]')&&document.querySelector('[data-a=wfwd]')&&document.querySelector('[data-a=wref]')&&document.querySelector('.wlogo')&&document.getElementById('wsq')&&document.querySelector('.wcart')&&document.querySelectorAll('.wcat').length>=6)));
const th=await ev(()=>{const L=[...document.querySelectorAll('.wp')];return{n:L.length,img:L.filter(e=>e.querySelector('img.th')?.src.startsWith('data:image/png')).length}});await SH('shop-home');ok('every product card has a 3D thumbnail',th.n>=20&&th.img==th.n,JSON.stringify(th));
ok('thumbnail is not blank',await ev(async()=>{const im=new Image();im.src=__bt2.thumb('light');await im.decode();const c=document.createElement('canvas');c.width=c.height=160;const x=c.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,160,160).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>0)n++;return n>800}));
// controller: D-pad to a product, A opens detail
let f=await fcls();for(let i=0;i<10&&!/wp/.test(f||'');i++){await press(DOWN);f=await fcls()}ok('D-pad reaches product grid',/wp|item/.test(f||'')||f=='item',f);
await press(A);await frames(2);let S=await ev(()=>({...__bt2.WS.S}));ok('A opens product page',S.pg=='item'&&(await ev(()=>document.getElementById('wurl').textContent)).includes('/p/'+S.item),S.pg);
await SH('shop-product');const k=S.item;f=await fcls();ok('product page focus on Add to cart',f=='add',f);
// qty + via D-pad buttons: find + button
await ev(()=>document.querySelector('[data-bs=q][data-v="1"]').click());S=await ev(()=>({...__bt2.WS.S}));ok('qty + works',S.qty==2);
await ev(()=>document.querySelector('[data-bs=add]').click());S=await ev(()=>({...__bt2.WS.S}));ok('add to cart',S.cart[k]==2,JSON.stringify(S.cart));
await press(B);await frames(2);S=await ev(()=>({...__bt2.WS.S}));ok('B = browser back',S.pg=='home'&&await ev(()=>__bt2.lapOpen()),S.pg);
await ev(()=>document.querySelector('[data-a=wfwd]').click());S=await ev(()=>({...__bt2.WS.S}));ok('forward button',S.pg=='item');
await ev(()=>document.querySelector('[data-a=wback]').click());S=await ev(()=>({...__bt2.WS.S}));ok('back button',S.pg=='home');
// search by keyboard
await ev(()=>{const i=document.getElementById('wsq');i.focus();i.value='kush';i.dispatchEvent(new Event('input',{bubbles:true}))});await ev(()=>document.getElementById('wsq').dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true})));await frames(2);
const sr=await ev(()=>[...document.querySelectorAll('.wp')].map(e=>e.dataset.v));ok('search finds Kush seeds',sr.length>0&&sr.every(x=>x.includes('kush')),sr.join());
ok('URL shows search',(await ev(()=>document.getElementById('wurl').textContent)).includes('search?q=kush'));
// controller on-screen keyboard
await ev(()=>{__bt2.WS.S.q='';__bt2.WS.S.kb=true});await ev(()=>document.querySelector('[data-a=wref]').click());await ev(()=>document.querySelector('[data-bk=S]').click());await ev(()=>document.querySelector('[data-bk=O]').click());await ev(()=>document.querySelector('[data-bk=I]').click());await ev(()=>document.querySelector('[data-bk=L]').click());await ev(()=>document.querySelector('[data-bk=OK]').click());
const sr2=await ev(()=>[...document.querySelectorAll('.wp')].map(e=>e.dataset.v));ok('on-screen keyboard search "soil"',sr2.length>=2&&sr2.every(x=>x.includes('soil')),sr2.join());
// category
await ev(()=>document.querySelector('.wcat[data-v=bulk]').click());const cb=await ev(()=>[...document.querySelectorAll('.wp')].map(e=>e.dataset.v));await SH('shop-bulk');ok('category filter',cb.length&&cb.every(x=>x.startsWith('pal_')),cb.join());
// cart + checkout
await ev(()=>document.querySelector('.wcart').click());await SH('shop-cart');ok('cart page lists item with thumbnail',await ev(()=>document.querySelectorAll('.wci img.th').length>=1));
await ev(()=>document.querySelector('[data-bs=cq][data-d="-1"]').click());S=await ev(()=>({...__bt2.WS.S}));ok('cart − qty',S.cart[k]==1);
const m0=await ev(()=>__bt2.money());await ev(()=>document.querySelector('[data-bs=checkout]').click());await sl(600);await frames(3);const m1=await ev(()=>__bt2.money());S=await ev(()=>({...__bt2.WS.S}));
ok('checkout charges money + thank-you page',m1<m0&&S.pg=='done'&&!Object.keys(S.cart).length,m0+'->'+m1);
// tabs still work; LB/RB
await press(RB);ok('RB switches browser tab',await ev(()=>document.querySelector('.tab.sel').dataset.tab)!='shop');
await press(START);await frames(2);
// phone + Threads thumbnails
await ev(()=>{__bt.openPhone();});await frames(2);await ev(()=>document.querySelector('[data-ph=app]')?.click());await frames(2);
const pt=await ev(()=>{const L=[...document.querySelectorAll('#phone .ph-it')];return [L.length,L.filter(e=>e.querySelector('img.ph-th')).length]});await SH('phone-thumbs');ok('Quick Bud items show thumbnails',pt[0]>=15&&pt[0]==pt[1],pt.join());
await sl(3000);const ct=await ev(()=>__bt2.thumbCloth('hoodie'));ok('Threads clothing thumbnail rendered from 3D human',(ct||'').startsWith('data:image/png'));
ok('no page errors',!errs.length,errs.join('|'));
console.log(`${res.filter(Boolean).length}/${res.length} passed`);await b.close();srv.kill();process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.error(e);process.exit(1)});
