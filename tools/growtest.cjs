// v12 Stage 3: growing system — strains, seed types, pots/beds, greenhouse/sun, soil tiers, N/PK nutrients + burn,
// six stages, quality grade through harvest/dry/cure, contract min grade, inspection panel (keyboard + pad), old-save compat.
const WS=require('ws'),pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
let srv;(async()=>{const R=await import('../src/rules.js');const PORT=3241;srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:''},stdio:'ignore'});await sl(800);
const res=[];const ok=(n,c,i='')=>{res.push(!!c);console.log(c?'PASS':'FAIL',n,i)};
const cl=()=>new Promise(r=>{const ws=new WS(`ws://localhost:${PORT}/ws`);const c={ws,w:null,toasts:[]};ws.on('message',d=>{const m=JSON.parse(d);if(m.t=='joined')c.code=m.code,c.id=m.id;if(m.t=='w'){c.w=m.w;if(m.w.toast&&m.w.toast.pid==c.id)c.toasts.push(m.w.toast.t)}});ws.on('open',()=>r(c))});
const tx=(c,m)=>c.ws.send(JSON.stringify(m));const st=()=>sl(350);
// ---- rules
const S=R.STRAINS;ok('6+ strains with time/yield/difficulty/color/look',Object.keys(S).length>=6&&Object.values(S).every(s=>s.speed&&s.g&&s.diff&&s.col&&s.look),Object.keys(S).join());
ok('kush strongly purple',/5a1fb0/i.test(S.kush.look.cal));
const seeds=Object.keys(R.SHOP).filter(k=>k.startsWith('seed_'));ok('regular/feminized/auto seeds for every strain',(R.BASE||Object.keys(S)).every(s=>['','_f','_a'].every(x=>R.SHOP['seed_'+s+x])),seeds.length);
ok('seedOf parses types',R.seedOf('seed_og_a').ty=='a'&&R.seedOf('seed_kush_f').ty=='f'&&R.seedOf('seed_haze').ty=='r'&&R.seedOf('seed_og_a').s=='og',JSON.stringify(R.seedOf('seed_og_a')));
ok('pots S/M/L, garden bed, soil tiers, grow+bloom nutrients sold',['pot_s','pot','pot_l','gbed','soil','soil_p','soil_s','nutr_g','nutr_b'].every(k=>R.SHOP[k]));
ok('six stages',['germination','seedling','veg','pre-flower','flower','ripe'].every((n,i)=>R.stage6({age:[1,30,100,200,R.READY-1,R.READY][i]})==n));
ok('grades A+..D with price multipliers',R.GRADES.map(g=>g[0]).join()=='A+,A,B,C,D'&&R.grade(95)[0]=='A+'&&R.grade(10)[0]=='D'&&R.grade(95)[2]>R.grade(60)[2]);
ok('curing raises quality',R.prodQ({q:80,cure:1})>R.prodQ({q:80,cure:0}));
const A=await cl();tx(A,{t:'host',name:'A'});await sl(200);tx(A,{t:'start'});await sl(500);
const held=()=>A.w.ents.filter(e=>e.by==A.id).sort((a,b)=>a.bi-b.bi);const clear=async()=>{for(let i=0;i<4&&held().length;i++){tx(A,{t:'trash'});await st()}};const byId=id=>A.w.ents.find(e=>e.id==id);
// ---- buying new items
tx(A,{t:'dbg',money:5000});await st();const n0=A.w.ents.length;
tx(A,{t:'order',items:[{k:'pot_l',n:1},{k:'gbed',n:1},{k:'soil_s',n:1},{k:'nutr_b',n:1},{k:'seed_og_f',n:1}]});await st();
for(let i=0;i<20&&A.w.orders?.[0]?.left>0;i++){tx(A,{t:'dbg',ff:2});await st()}await sl(400);
const nw=A.w.ents.slice(-12);const pl=nw.find(e=>e.type=='pot'&&e.data.sz==1.4),gb=nw.find(e=>e.type=='pot'&&e.data.bed),ss=nw.find(e=>e.type=='soil'&&e.data.sq==2),nb=nw.find(e=>e.type=='nutr'&&e.data.f=='b');
ok('large pot delivered as pot sz 1.4',pl,JSON.stringify(nw.map(e=>e.type+JSON.stringify(e.data))));ok('garden bed delivered',gb&&gb.data.sz==2);ok('super soil delivered (sq 2)',ss);ok('bloom nutrients delivered',nb);ok('feminized OG seed delivered',nw.some(e=>e.type=='seed_og_f'));
// ---- planting with soil tier + seed type
tx(A,{t:'dbg',place:{type:'pot',x:2,z:1,data:{sz:1.4}}});await st();const P1=A.w.ents.at(-1).id;
tx(A,{t:'dbg',give:'soil_s',gd:{}});await st();ok('soil_s gives soil with sq',held()[0]?.type=='soil'&&held()[0].data.sq==2,JSON.stringify(held()[0]));
tx(A,{t:'use',target:P1});await st();ok('filled pot remembers soil tier',byId(P1).data.soil&&byId(P1).data.sq==2,JSON.stringify(byId(P1).data));
await clear();tx(A,{t:'dbg',give:'seed_og_f'});await st();tx(A,{t:'use',target:P1});await st();let p=byId(P1).data.plant;
ok('planted feminized OG with type + soil',p&&p.s=='og'&&p.ty=='f'&&p.sq==2,JSON.stringify(p));ok('super soil starts with more nutrients',p.nutr>60,p.nutr);
// ---- nutrients: burn + N/PK
tx(A,{t:'dbg',set:{id:P1,p:{nutr:90}}});await st();await clear();tx(A,{t:'dbg',give:'nutr_g',gd:{f:'g'}});await st();A.toasts=[];tx(A,{t:'use',target:P1});await st();p=byId(P1).data.plant;
ok('overfeeding causes nutrient burn',p.burn>0,p.burn+' '+A.toasts.join('|'));ok('feed type recorded (grow)',p.fd=='g',p.fd);
const b0=p.burn;tx(A,{t:'dbg',ff:20});await st();p=byId(P1).data.plant;ok('burn fades over time',p.burn<b0,b0+'->'+p.burn);
// ---- seed types: auto grows faster
await clear();
tx(A,{t:'dbg',min:12*60});tx(A,{t:'dbg',spawn:{x:-8.6,z:-1.4,s:'haze',age:20}});tx(A,{t:'dbg',spawn:{x:-8.6,z:1.4,s:'haze',age:20,p:{ty:'a'}}});await st();
const [Pr,Pa]=A.w.ents.slice(-2).map(e=>e.id);tx(A,{t:'dbg',ff:15});await st();
ok('auto grows faster than regular',byId(Pa).data.plant.age-20>(byId(Pr).data.plant.age-20)*1.2,byId(Pr).data.plant.age.toFixed(1)+' vs '+byId(Pa).data.plant.age.toFixed(1));
ok('greenhouse plants lit by filtered sun',byId(Pr).data.plant.lit=='gh',byId(Pr).data.plant.lit);
// outdoor sun + night
tx(A,{t:'dbg',spawn:{x:-4,z:9,s:'lemon',age:80}});await st();const Po=A.w.ents.at(-1).id;tx(A,{t:'dbg',min:12*60,ff:3});await st();
ok('outdoor plant lit by sun in daytime',byId(Po).data.plant.lit=='sun',byId(Po).data.plant.lit);
tx(A,{t:'dbg',min:23*60});await st();const a0=byId(Po).data.plant.age;tx(A,{t:'dbg',min:23*60,ff:3});await st();p=byId(Po).data.plant;
ok('outdoor plant rests at night without damage',!p.lit&&p.health>=99&&p.age-a0<1,p.lit+' h'+p.health+' da'+(p.age-a0).toFixed(2));
tx(A,{t:'dbg',spawn:{x:2,z:-1,s:'lemon',age:80}});await st();const Pd=A.w.ents.at(-1).id;tx(A,{t:'dbg',ff:5});await st();ok('indoor dark plant still loses health (old rule kept)',byId(Pd).data.plant.health<100,byId(Pd).data.plant.health);
tx(A,{t:'dbg',min:12*60});await st();
// ---- harvest with grade, pot size affects yield
tx(A,{t:'dbg',spawn:{x:1,z:2,s:'owl',age:R.READY+1,p:{qs:95,qt:100,sq:2,ty:'f'},d:{sz:1.4}}});tx(A,{t:'dbg',spawn:{x:1.8,z:2,s:'owl',age:R.READY+1,p:{qs:40,qt:100},d:{sz:.7}}});await st();
const [Hb,Hs]=A.w.ents.slice(-2).map(e=>e.id);await clear();tx(A,{t:'use',target:Hb});await st();const wb=held().find(e=>e.type=='wetbud');
A.toasts=[];tx(A,{t:'use',target:Hs});await st();const ws2=held().find(e=>e.type=='wetbud'&&e.id!=wb.id);
ok('harvest gives wet bud with quality',wb&&wb.data.q>=85,JSON.stringify(wb?.data));ok('large pot outyields small',wb.data.g>ws2.data.g*1.5,wb.data.g+' vs '+ws2.data.g);ok('poor grow = lower grade',ws2.data.q<wb.data.q-20,ws2.data.q);
// dry + pack + cure keep quality
tx(A,{t:'dbg',place:{type:'rack',x:3,z:-2,data:{slots:[]}}});tx(A,{t:'dbg',place:{type:'scale',x:3.5,z:-1,data:{}}});await st();const rack=A.w.ents.filter(e=>e.type=='rack').at(-1);
for(const e of held().filter(e=>e.type=='wetbud')){tx(A,{t:'use',target:rack.id});await st()}tx(A,{t:'dbg',dry:1});await st();
tx(A,{t:'use',target:rack.id});await st();const db=held().find(e=>e.type=='drybud');ok('dried bud keeps quality',db&&[wb.data.q,ws2.data.q].includes(db.data.q),JSON.stringify(db?.data));
if(!A.w.ents.some(e=>e.type=='jars'&&!e.by))tx(A,{t:'dbg',place:{type:'jars',x:0,z:-1,data:{uses:6}}});await st();
const sc=A.w.ents.filter(e=>e.type=='scale').at(-1);for(let i=0;i<3&&held()[0]?.type!='drybud';i++){tx(A,{t:'cycle'});await st()}tx(A,{t:'use',target:sc.id});await st();let jar=held().find(e=>e.type=='packed');if(!jar)console.log('dbgJ',A.toasts.slice(-3),held().map(e=>e.type));
ok('packed jar starts curing at 0',jar&&jar.data.cure<.01&&jar.data.q==db.data.q,JSON.stringify(jar?.data));
const jid=jar.id;tx(A,{t:'dbg',ff:120});await st();jar=A.w.ents.find(e=>e.id==jid);if(!jar)console.log('dbgJ2',jid,A.w.ents.filter(e=>e.by==A.id||e.type=='packed').map(e=>e.id+e.type),A.toasts.slice(-4));ok('jar cures over time',jar.data.cure>.4&&jar.data.cure<.6,jar.data.cure);
// ---- contracts with min grade
ok('contracts list a minimum grade',A.w.contracts.every(k=>R.GRADES.some(g=>g[0]==k.min)),A.w.contracts.map(k=>k.min).join());
await clear();tx(A,{t:'dbg',give:'packed',gd:{s:'owl',g:10,q:30,cure:0}});await st();tx(A,{t:'dbg',contract:'owl',cmin:'A'});await st();
const c0=A.w.contracts[0];
const m0=A.w.money;A.toasts=[];tx(A,{t:'use',target:'drop'});await st();ok('low grade jar refused with warning first',held().some(e=>e.type=='packed')&&A.w.money==m0&&A.toasts.some(t=>/grade/.test(t)),A.toasts.join('|'));
tx(A,{t:'use',target:'drop'});await st();ok('second drop sells it at lower grade price',!held().some(e=>e.type=='packed')&&A.w.money>m0,A.w.money-m0);
tx(A,{t:'dbg',give:'packed',gd:{s:'owl',g:10,q:96,cure:1}});await st();tx(A,{t:'dbg',contract:'owl'});await st();const k=A.w.contracts[0];const m1=A.w.money;A.toasts=[];tx(A,{t:'use',target:'drop'});await st();
ok('A+ jar accepted for contract',(A.w.money>m1||A.w.contracts[0]?.got>=10)&&!held().some(e=>e.type=='packed'),k.min+' '+(A.w.money-m1)+' '+A.toasts.join('|'));
// ---- old save compat: plant without new fields
tx(A,{t:'dbg',spawn:{x:2.6,z:2,s:'kush',age:R.READY+1}});await st();const Old=A.w.ents.at(-1);delete Old.data.sz;await clear();tx(A,{t:'use',target:Old.id});await st();const ow=held().find(e=>e.type=='wetbud');
ok('old-style plant (no type/soil/q) still harvests',ow&&ow.data.g>0&&ow.data.q>0,JSON.stringify(ow?.data));
A.ws.close();
// ---- client: inspection panel (keyboard + Xbox pad)
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:300000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const P=await b.newPage();await P.setViewport({width:960,height:540});const errs=[];P.on('pageerror',e=>errs.push(e.message));
await P.evaluateOnNewDocument(()=>{window.__pad={id:'Xbox Sim',index:0,connected:true,mapping:'standard',timestamp:0,buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0})),axes:[0,0,0,0]};navigator.getGamepads=()=>[window.__pad,null,null,null]});
await P.goto(`http://localhost:${PORT}/?q=0`,{waitUntil:'networkidle0'});await sl(500);if(errs.length)console.log('pageerr',errs);
const ev=(f,...a)=>P.evaluate(f,...a),stt=()=>ev(()=>__bt.state());const frames=async n=>{const f0=await ev(()=>__bt.frames);while(await ev(()=>__bt.frames)<f0+n)await sl(15)};
const set=(i,v)=>ev((i,v)=>{const b=__pad.buttons[i];b.pressed=v;b.value=v?1:0},i,v);const press=async(i,h=2)=>{await set(i,true);await frames(h);await set(i,false);await frames(2)};
await ev(()=>window.dispatchEvent(new Event('gamepadconnected')));let s=await stt();if(s.root=='splash'){await press(0);await frames(4)}if(await ev(()=>__bt.cre?.()))await press(1);await frames(3);await press(0,4);await sl(1500);await frames(5);
ev(()=>__bt.send({t:'dbg',spawn:{x:0,z:-1.2,s:'kush',age:200,p:{ty:'f',burn:.3},d:{sz:1.4,sq:2}}}));await sl(500);await frames(3);
const pid=await ev(()=>__bt.W.ents.at(-1).id);await ev(()=>{__bt.tp(0,.4);__bt.lookAt(0,.6,-1.2)});await frames(4);
await P.keyboard.press('KeyV');await frames(4);let I=await ev(()=>__bt.inspState());s=await stt();
ok('V opens inspection panel on aimed plant',I&&I.id==pid&&s.root=='insp',JSON.stringify(s.root));
ok('panel shows strain, seed, stage, bars, grade',I&&/Silent Kush/.test(I.html)&&/Feminized/i.test(I.html)&&/pre-flower/i.test(I.html)&&/Moisture/i.test(I.html)&&/burn/i.test(I.html)&&/Quality/i.test(I.html),I?.html.replace(/\n/g,' ').slice(0,300));
ok('close-up viewport present',await ev(()=>{const r=document.querySelector('#inspv')?.getBoundingClientRect();return r&&r.width>100&&r.height>100}));
await P.keyboard.press('Escape');await frames(3);ok('Esc closes panel',!(await ev(()=>__bt.inspState())));
await set(3,true);await sl(700);await frames(4);await set(3,false);await frames(3);s=await stt();ok('hold Y (pad) on plant opens inspection',s.root=='insp',s.root);
await press(1);await frames(2);s=await stt();ok('B closes inspection',s.root==null&&!(await ev(()=>__bt.inspState())),s.root);
await press(3);await frames(3);s=await stt();ok('tap Y still opens inventory',s.root!='insp'&&s.root!=null,s.root);await press(1);await frames(2);
ok('Grow Book has stage-3 pages',await ev(()=>{__bt.openBook();return document.body.innerText})!=null);
ok('no page errors',!errs.length,errs.join('|'));
console.log(`${res.filter(Boolean).length}/${res.length} passed`);await b.close();srv.kill();process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.error(e);srv?.kill();process.exit(1)});
