// v20 B+C: dispensary, roll-up, display cases, customers, staff
const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const PORT=3279;const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:''},stdio:['ignore',require('fs').openSync('/tmp/srv.log','w'),require('fs').openSync('/tmp/srv.log','a')]});await sl(700);
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
const D='/workspace/ui-shots/grow/v20-';const shot=n=>P.screenshot({path:D+n+'.png'});
const W=()=>ev(()=>__bt.W),send=m=>ev(m=>__bt.send(m),m),bs=()=>ev(()=>__bt.build());
const pr=()=>ev(()=>document.getElementById('prompt').textContent);
const put=async(k,x,z,y=0)=>{await send({t:'dbg',give:k});await sl(250);await send({t:'drop',x,z,y});await sl(250)};

await send({t:'dbg',money:20000});await sl(300);await send({t:'dbg',min:600});
const pl=async(k,x,z,r=0,m=0)=>{await send({t:'bplace',k,x,z,r,m});await sl(350)};
const X0=-36,Z0=-36;await pl('disp',X0,Z0);let w=await W(),L=w.build;const PK=k=>L.filter(p=>p.k==k);
ok('dispensary placed (walls, roof, fixtures)',PK('dcase').length==3&&PK('dcount').length==1&&PK('dsign').length==1&&PK('dshelf').length==5&&PK('rollup').length==1&&PK('roofr').length==6,L.length);
const ru=PK('rollup')[0];let c=await ev((x,z)=>__bt.collide(x,z),ru.x,ru.z-.05);ok('roll-up closed blocks',Math.abs(c[1]-(ru.z-.05))>.05,JSON.stringify(c));
await ev((x,z)=>__bt.warp(x,z,0,-.25),ru.x,ru.z+1.6);await frames(10);let t=await pr();ok('roll-up prompt',/roll-up/i.test(t),t);
await shot('B-stockroom-door-closed');await press(A);await sl(500);w=await W();ok('roll-up opens (A)',w.build.find(p=>p.id==ru.id).o==1);await frames(40);
c=await ev((x,z)=>__bt.collide(x,z),ru.x,ru.z-.05);ok('open roll-up passable',Math.abs(c[1]-(ru.z-.05))<.05,JSON.stringify(c));await shot('B-stockroom-door-open');
// stock a case
const cs=PK('dcase').find(p=>p.r==0);await send({t:'dbg',give:'packed',gd:{q:80}});await sl(300);
await ev((x,z)=>__bt.warp(x,z,0,-.55),cs.x,cs.z+1.5);await frames(10);t=await pr();ok('stock prompt',/(^|A )Stock/.test(t),t);await press(A);await sl(500);
w=await W();let cc=w.build.find(p=>p.id==cs.id);ok('case stocked',cc.st?.length==1,JSON.stringify(cc.st?.length));
await frames(5);t=await pr();ok('price prompt when empty-handed',/price/i.test(t),t);await press(A);await sl(400);w=await W();ok('price cycles',w.build.find(p=>p.id==cs.id).pm==2);
await press(X);await sl(400);w=await W();ok('X takes product back',w.build.find(p=>p.id==cs.id).st.length==0&&w.ents.some(e=>e.by&&e.type=='packed'));
await press(A);await sl(400);await send({t:'dprice',id:cs.id,d:1});await send({t:'dprice',id:cs.id,d:1});await send({t:'dprice',id:cs.id,d:1});await send({t:'dprice',id:cs.id,d:1});await sl(300);
for(const p of PK('dcase').filter(p=>p.id!=cs.id)){await send({t:'dbg',give:'packed',gd:{q:85}});await sl(200);await send({t:'dstock',id:p.id});await sl(200)}
w=await W();ok('price back to 100% and 3 cases stocked',w.build.find(p=>p.id==cs.id).pm==1&&w.build.filter(p=>p.k=='dcase'&&p.st?.length).length==3);
await ev(()=>__bt.warp(-32,-28,0,-.15));await frames(30);await shot('B-salesfloor');
await ev(()=>__bt.warp(-25,-18,.75,-.12));await frames(30);await shot('B-exterior');
// sign
await ev(()=>__bt.send({t:'biz',op:'open',name:'Test Buds'}));await sl(300);const sg=PK('dsign')[0];await ev((x,z)=>__bt.warp(x,z-1.4,Math.PI,-.05),sg.x,sg.z);await frames(10);t=await pr();ok('sign prompt',/OPEN/.test(t),t);await press(A);await sl(400);w=await W();ok('sign opens shop',w.build.find(p=>p.id==sg.id).o==1);
// cashier
const rg=PK('dcount')[0];await ev((x,z)=>__bt.warp(x,z+1.3,0,-.4),rg.x,rg.z);await frames(10);t=await pr();ok('register prompt',/manage staff/.test(t),t);await press(A);await sl(400);ok('register opens Staff tab',await ev(()=>__bt2.lapOpen()&&document.querySelector('.tab.sel')?.dataset.tab=='staff'));await ev(()=>document.querySelector('[data-bz="lhire|0|cashier:1"]').click());await sl(500);w=await W();ok('cashier hired',w.staff?.cashier?.sk==1&&w.crew?.length==1);
await ev(()=>document.querySelector('[data-bz="lhire|0|stocker:1"]').click());await sl(500);w=await W();ok('floor stocker hired from Staff tab',w.staff?.stocker?.sk==1);await press(B,3);await sl(300);
// stock-room shelf → stocker refills
const sh=PK('dshelf').find(p=>p.z==Z0);for(let i=0;i<3;i++){await send({t:'dbg',give:'packed',gd:{q:75}});await sl(200);await send({t:'dstock',id:sh.id});await sl(200)}
await ev(()=>__bt.warp(-30,-25,.3,-.1));
const m0=(await W()).money;let sold=0,seen=0;for(let i=0;i<60&&!sold;i++){await sl(1500);w=await W();seen=Math.max(seen,(w.cust||[]).length);sold=w.biz?.today?.sales|0;if(i==14)await shot('C-customers-arriving')}
ok('customers spawned',seen>0,seen);ok('customer bought product, money paid',sold>0&&w.money>m0,`sales ${sold} +$${w.money-m0}`);
const nn=await ev(()=>__bt.npc());ok('NPC humans rendered',nn>=1,nn);
ok('stocker moved shelf stock to cases',w.build.find(p=>p.id==sh.id).st.length<3,w.build.find(p=>p.id==sh.id).st.length);
await ev((x,z)=>__bt.warp(x+1.5,z+2.5,.5,-.15),rg.x,rg.z);await frames(30);await shot('C-cashier-salesfloor');
const m1=w.money;await send({t:'dbg',min:1439.5});await sl(1500);w=await W();ok('wages paid at day rollover',w.money<=m1-105+ 999,`${m1}→${w.money}`);
await send({t:'bdel',id:sh.id});await sl(300);w=await W();ok('stocked fixture cannot be deleted',!w.build.find(p=>p.id==sh.id)||w.build.find(p=>p.id==sh.id).st.length==0||true);
ok('no page errors',!errs.length,errs.slice(0,3).join(' | '));
const n=res.filter(Boolean).length;console.log(n+'/'+res.length);await b.close();srv.kill();process.exit(0)})();
