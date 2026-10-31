// v20 B+C: dispensary, roll-up, display cases, customers, staff
const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const PORT=3281;const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:''},stdio:['ignore',require('fs').openSync('/tmp/srv2.log','w'),require('fs').openSync('/tmp/srv2.log','a')]});await sl(700);
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:300000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const P=await b.newPage();await P.setViewport({width:960,height:540});const errs=[];P.on('pageerror',e=>errs.push(e.message));
await P.evaluateOnNewDocument(()=>{try{localStorage.bt_seenacct=1;localStorage.bt_seen_version='99.0.0'}catch(e){};window.__pad={id:'Xbox Sim',index:0,connected:true,mapping:'standard',timestamp:0,buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0})),axes:[0,0,0,0]};navigator.getGamepads=()=>[window.__pad,null,null,null]});
await P.goto(`http://localhost:${PORT}/?q='+(process.env.Q||2)+'`,{waitUntil:'networkidle0'});
const ev=(f,...a)=>P.evaluate(f,...a),st=()=>ev(()=>__bt.state());
const frames=async n=>{const f0=await ev(()=>__bt.frames);while(await ev(()=>__bt.frames)<f0+n)await sl(15)};
const set=(i,v)=>ev((i,v)=>{const b=__pad.buttons[i];b.pressed=v;b.value=v?1:0},i,v);
const press=async(i,hold=2)=>{await set(i,true);await frames(hold);await set(i,false);await frames(3)};
const A=0,B=1,X=2,Y=3,LB=4,RB=5,LT=6,RT=7,UP=12,DOWN=13,LEFT=14,RIGHT=15;
const res=[];const ok=(n,c,i='')=>{res.push(c);console.log(c?'PASS':'FAIL',n,i)};
await ev(()=>window.dispatchEvent(new Event('gamepadconnected')));
let s=await st();if(s.root=='splash'){await press(A);await frames(4)}if(await ev(()=>__bt.cre?.()))await press(B);await frames(3);if((await st()).root=='m-acct'){await ev(()=>document.querySelector('[data-a=guest]').click());await frames(3)}
await press(A,4);await sl(1500);await frames(5);s=await st();ok('solo game started',s.root==null,s.root);
const D='/workspace/ui-shots/grow/v17x-';const shot=n=>P.screenshot({path:D+n+'.png'});
const W=()=>ev(()=>__bt.W),send=m=>ev(m=>__bt.send(m),m),bs=()=>ev(()=>__bt.build());
const pr=()=>ev(()=>document.getElementById('prompt').textContent);
const put=async(k,x,z,y=0)=>{await send({t:'dbg',give:k});await sl(250);await send({t:'drop',x,z,y});await sl(250)};

await send({t:'dbg',money:20000});await sl(300);await send({t:'dbg',min:600});
const fk=()=>ev(()=>{const f=__bt2.fk();return f?(f.dataset.bz||f.dataset.bzs||f.dataset.bzw||f.dataset.tab||f.textContent).slice(0,40):null});
const clk=async sel=>{const r=await ev(s=>{const e=document.querySelector(s);if(!e)return false;e.click();return true},sel);await sl(450);return r};
const bz=()=>W().then(w=>w.biz);
await send({t:'dbg',money:40000});await sl(300);await send({t:'dbg',min:600});
const pl=async(k,x,z,r=0,m=0)=>{await send({t:'bplace',k,x,z,r,m});await sl(350)};
const X0=-36,Z0=-36;await pl('disp',X0,Z0);let w=await W();const PK=k=>w.build.filter(p=>p.k==k);ok('dispensary placed',PK('dcount').length==1);
// laptop → Business via pad bumpers
await ev(()=>__bt2.openLap('shop'));await frames(4);await press(RB);await frames(4);ok('RB cycles to Business tab',await ev(()=>document.querySelector('.tab.sel')?.dataset.tab)=='biz');
ok('closed business shows name form',await ev(()=>!!document.getElementById('bzname')&&!!document.querySelector('[data-bz=open]')));
await clk('[data-bzw="1"]');await clk('[data-bzw="2"]');const nm=await ev(()=>document.getElementById('bzname').value);ok('word pickers build a name',nm.split(' ').length>=2,nm);
await ev(()=>{document.getElementById('bzname').value='Emerald Leaf Co.'});await clk('[data-bz=open]');await sl(400);let bb=await bz();ok('business opened + named (server)',bb.opened>0&&bb.name=='Emerald Leaf Co.',bb.name);
// pad: D-pad to a nav button and A
await ev(()=>__bt.lapTab('biz'));await frames(3);await ev(()=>document.querySelector('[data-bzs=logo]').focus());
await clk('[data-bzs=logo]');ok('logo section renders',await ev(()=>!!document.querySelector('.bzlogo')&&!!document.querySelector('[data-bz^="logo|sh"]')));
for(const s of ['[data-bz^="logo|sh"]','[data-bz^="logo|sh"]','[data-bz^="logo|ic"]','[data-bz^="logo|bg"]'])await clk(s);
await ev(()=>{document.getElementById('bztx').value='ELC'});await clk('[data-bz=logotx]');bb=await bz();ok('logo edits saved on server',bb.logo.sh==2&&bb.logo.ic==1&&bb.logo.bg==1&&bb.logo.tx=='ELC',JSON.stringify(bb.logo));
// pad A on focused card
const before=(await bz()).logo.fg;await ev(()=>{const e=document.querySelector('[data-bz^="logo|fg"]');__bt.focus?__bt.focus(e):e.focus()});
await shot('logo-maker');
await clk('[data-bzs=front]');await clk('[data-bz^="front|aw"]');await clk('[data-bz^="front|lt"]');await clk('[data-bz^="front|lt"]');await clk('[data-bz^="front|sc"]');bb=await bz();ok('storefront options saved',bb.front.aw==2&&bb.front.lt==3&&bb.front.sc==1,JSON.stringify(bb.front));
// staff + upgrades
await clk('[data-bzs=staff]');await clk('[data-bz="hire|cashier|2"]');await clk('[data-bz="hire|stocker|1"]');await clk('[data-bz="hire|budtender|0"]');w=await W();ok('hire 3 roles w/ skill',w.staff.cashier?.sk==2&&w.staff.stocker?.sk==1&&w.staff.budtender?.sk==0,JSON.stringify(w.staff));
await clk('[data-bz="fire|budtender"]');w=await W();ok('fire',!w.staff.budtender);await clk('[data-bz="hire|budtender|1"]');
await clk('[data-bzs=upg]');const m0=(await W()).money;await clk('[data-bz="upg|floor"]');await clk('[data-bz="upg|reg"]');await clk('[data-bz="upg|sec"]');await clk('[data-bz="upg|sig"]');w=await W();ok('upgrades bought',w.biz.locs[0].upg.floor==1&&w.biz.locs[0].upg.reg==1&&w.money==m0-600-450-500-300,m0-w.money);
// stock: shelves in stock room, then restock from laptop
const sh=PK('dshelf');for(let i=0;i<10;i++){await send({t:'dbg',give:'packed',gd:{q:80}});await sl(200);await send({t:'dstock',id:sh[i%sh.length].id});await sl(200)}
await clk('[data-bzs=inv]');await clk('[data-bz=restock]');w=await W();const onF=w.build.filter(p=>p.k=='dcase').reduce((a,p)=>a+(p.st?.length||0),0);ok('restock moves product to cases',onF>0,onF);
await clk('[data-bzs=prod]');const pk=await ev(()=>document.querySelector('[data-bz^="price|"]')?.dataset.bz);ok('product price list',!!pk,pk);if(pk){await clk(`[data-bz="${pk}"]`);bb=await bz();ok('per-product price set',Object.values(bb.prices)[0]==2,JSON.stringify(bb.prices))}
// open sign, customers
const sg=PK('dsign')[0];await send({t:'bdoor',id:sg.id});const ru=PK('rollup')[0];if(ru)await send({t:'bdoor',id:ru.id});await sl(400);
await press(B);await frames(5);
let sold=0,seen=0;for(let i=0;i<50&&!(sold>=2&&seen>=2);i++){await sl(1500);w=await W();seen=Math.max(seen,(w.cust||[]).length);sold=w.biz.today.sales;if(seen&&i==6){const c=w.cust[0];await ev((x,z)=>__bt.warp(x,z+4,0,-.1),c.x,c.z)}}
ok('customers bought, server money',sold>0,`sales ${sold} seen ${seen}`);ok('NPCs rendered',await ev(()=>__bt.npc())>=1);
{const c=(await W()).cust?.[0]||PK('dcount')[0];await ev((x,z)=>__bt.warp(x+2,z+3,.6,-.12),c.x,c.z);await frames(20);await shot('sales-floor')}
// storefront outside
{const d=PK('rollup')[0]||PK('door')[0];await ev((x,z)=>__bt.warp(x,z,0,0),d.x,d.z);const sf=await ev(()=>{const g=__bt.scene?.getObjectByName?.('storefront');return g?[g.position.x,g.position.z,g.rotation.y]:null});ok('3D storefront built',!!sf,JSON.stringify(sf));
 const o=await ev(()=>{const p=__bt.W.build.find(q=>q.k=='rollup')||__bt.W.build.find(q=>q.k=='door');const c=[1,0,-1,0][p.r],s=[0,1,0,-1][p.r];const x=p.x-s*6.5,z=p.z+c*6.5;return {x,z,ry:Math.atan2(-(p.x-x),-(p.z-z))}});await ev(o=>__bt.warp(o.x,o.z,o.ry,.18),o);await frames(25);await shot('storefront')}
// day rollover → P&L
for(let d=0;d<3;d++){await send({t:'dbg',min:1439.5});await sl(1800);await send({t:'dbg',min:600});await sl(4000)}
bb=await bz();ok('P&L history recorded',bb.hist.length>=3&&bb.hist.every(h=>h.wag>0&&h.rent>0),JSON.stringify(bb.hist[0]));ok('reviews generated',bb.reviews.length>0,bb.reviews.length);
await ev(()=>__bt2.openLap('biz'));await frames(3);await clk('[data-bzs=pl]');ok('P&L chart drawn',await ev(()=>document.querySelectorAll('#bzchart rect').length>=6));await shot('pl');
await clk('[data-bzs=rev]');await shot('reviews');
// locations
await clk('[data-bzs=loc]');await clk('[data-bz="buyloc|downtown"]');bb=await bz();ok('bought downtown, switched',bb.locs.length==2&&bb.cur==1);
await clk('[data-bzs=staff]');await clk('[data-bz="hire|cashier|1"]');bb=await bz();ok('branch staff separate',bb.locs[1].staff.cashier?.sk==1);
for(let i=0;i<4;i++){await send({t:'dbg',give:'packed',gd:{q:80}});await sl(200);await send({t:'dstock',id:sh[0].id});await sl(200)}
await clk('[data-bzs=inv]');await clk('[data-bz="send|4"]');bb=await bz();ok('ship stock to branch',bb.locs[1].inv.length>0,bb.locs[1].inv.length);
await clk('[data-bzs=loc]');await clk('[data-bz="switch|0"]');bb=await bz();ok('switch back home',bb.cur==0);await shot('locations');
// pad: A on focused card in laptop
await ev(()=>__bt2.openLap('biz'));await frames(3);await press(DOWN);await frames(3);const f1=await fk();await press(A);await frames(6);ok('pad focus + A in Business tab',!!f1,f1);
// save persists biz
const sv=await ev(()=>new Promise(r=>{__bt.send({t:'save'});setTimeout(()=>r(1),800)}));ok('no page errors',!errs.length,errs.slice(0,3).join(' | '));
const n=res.filter(Boolean).length;console.log(n+'/'+res.length);await b.close();srv.kill();process.exit(0)})();
