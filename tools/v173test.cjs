// v1.7.3 AI farm workers
const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const PORT=3284;const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:''},stdio:['ignore',require('fs').openSync('/tmp/srv173.log','w'),require('fs').openSync('/tmp/srv172.log','a')]});await sl(700);
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
const D='/workspace/ui-shots/grow/v173-';const shot=n=>P.screenshot({path:D+n+'.png'});
const W=()=>ev(()=>__bt.W),send=m=>ev(m=>__bt.send(m),m),ff=async n=>{await send({t:'dbg',ff:n});await sl(250)};
await send({t:'dbg',money:20000});await sl(300);await send({t:'dbg',min:480});await sl(300);
let w=await W();console.log(JSON.stringify(w.ents.filter(e=>!e.by).map(e=>[e.type,+e.x.toFixed(1),+e.z.toFixed(1)])));
const give=async(k,x,z)=>{await send({t:'dbg',give:k});await sl(250);await send({t:'drop',x,z});await sl(250)};
const wk=()=>W().then(w=>w.workers||[]);
// 1) pad hire UI
const mPre=(await W()).money;await ev(()=>__bt.openLap('gen'));await frames(5);await press(RB,3);await frames(5);let tb=await ev(()=>document.querySelector('.tab.sel')?.dataset.tab);ok('RB cycles to 👥 Staff tab',tb=='staff',tb);
ok('hire cards render',await ev(()=>document.querySelectorAll('[data-bz^="whire|"]').length==9));
const fz=()=>ev(()=>document.querySelector('#laptop .f')?.dataset.bz||'');for(let i=0;i<14&&!(await fz()).startsWith('whire|grower');i++)await press(DOWN,2);await press(RIGHT,2);ok('D-pad reaches Hire Skilled Grower',(await fz())=='whire|grower|1',await fz());await press(A,3);await sl(600);
let L=await wk();const m0=(await W()).money;ok('grower hired with pad A (fee charged)',L.length==1&&L[0].k=='grower'&&L[0].sk==1&&m0==mPre-55,JSON.stringify(L)+' $'+m0);
await frames(5);await shot('hire-ui');await press(B,3);await frames(5);
// 2) grower: soil + plant the 2 starter pots, then water
await ff(60);w=await W();let pots=w.ents.filter(e=>e.type=='pot');ok('grower filled pots with soil and planted',pots.filter(p=>p.data.soil&&p.data.plant).length>=1,JSON.stringify(pots.map(p=>[p.data.soil,!!p.data.plant,p.data.moist|0]))+' say:'+(await wk())[0].say);
await send({t:'dbg',spawn:{x:1.5,z:-2,age:100,water:10,s:'haze'}});await sl(300);await ff(30);w=await W();let tp=w.ents.filter(e=>e.type=='pot').pop();ok('grower watered the thirsty plant',tp.data.moist>=60,tp.data.moist);
ok('grower carries their own can',w.ents.some(e=>e.type=='water'&&e.data.wk&&e.by<0));
await ev(()=>__bt.warp(1,3,0,-.3));await ff(0.1);await frames(30);await shot('grower-working');
// 3) harvester/trimmer: ready plant -> rack -> dry -> trim -> scale -> jar
await send({t:'work',op:'hire',k:'trimmer',sk:2});await sl(300);
await give('rack',-2,-1);await give('scale',-1,1);await give('jars',-0.4,1);
await send({t:'dbg',spawn:{x:0.5,z:0.5,age:500,water:90,s:'haze'}});await sl(300);
await ff(15);w=await W();const rk=w.ents.find(e=>e.type=='rack');ok('harvester harvested and hung bud on rack',(rk.data.slots||[]).length==1,JSON.stringify(rk.data.slots)+' '+JSON.stringify((await wk()).map(v=>[v.k,v.st,v.say])));
await ev(()=>__bt.warp(0.5,3.5,0,-.4));await frames(20);await shot('harvester-at-rack');
await send({t:'dbg',dry:1});await sl(300);await ff(25);w=await W();const pk=w.ents.filter(e=>e.type=='packed'),tr=w.ents.filter(e=>e.type=='trim');
ok('dried bud trimmed + jarred',pk.length==1&&pk[0].data.tr==1&&tr.length==1,JSON.stringify(pk.map(e=>e.data))+' trim:'+tr.length+' '+JSON.stringify((await wk()).map(v=>[v.k,v.st,v.say])));
// 4) stocker: case on a floor, jar -> case; never takes a player's held jar
const FX=14,FZ=-14;for(const [x,z] of [[FX,FZ],[FX+2,FZ]])await send({t:'bplace',k:'floor',x,z,r:0,m:0}),await sl(250);
await send({t:'bplace',k:'dcase',x:FX,z:FZ,r:0,m:0});await sl(400);w=await W();const dc=w.build.find(p=>p.k=='dcase');ok('display case placed',!!dc,JSON.stringify(w.build.map(p=>p.k)));
await send({t:'dbg',give:'packed'});await sl(300);const mine=(await W()).ents.find(e=>e.type=='packed'&&e.by>0);
await send({t:'work',op:'hire',k:'fstock',sk:2});await sl(300);await ff(40);w=await W();
ok('stocker moved the jar into the display case',(w.build.find(p=>p.k=='dcase').st||[]).length==1,JSON.stringify(w.build.find(p=>p.k=='dcase').st?.map(x=>x.t))+' '+JSON.stringify((await wk()).map(v=>[v.k,v.st,v.say,v.x,v.z])));
ok('co-op safe: player-held jar untouched',w.ents.some(e=>e.id==mine?.id&&e.by==mine.by),JSON.stringify(mine));
const sv=(await wk()).find(v=>v.k=='fstock');await ev(o=>__bt.warp(o.x+1.5,o.z+2,0,-.3),sv);await frames(25);await shot('stocker-at-case');
// 5) wages at day rollover, saves, fire
const mA=(await W()).money;await send({t:'dbg',min:1439});await sl(200);await ff(1);w=await W();ok('daily wages paid',mA-w.money>=55+91+70-1&&/Farm wages/.test(w.wlast||''),(mA-w.money)+' '+w.wlast);
await sl(2500);const svd=await ev(()=>{for(const k of Object.keys(localStorage)){const v=localStorage[k];if(v.includes('"workers"'))return v}return ''});const sw=svd?JSON.parse(svd):null;const sw2=sw&&(sw.workers||sw.w?.workers);ok('workers saved with the farm',sw2?.length==3&&sw2.every(v=>v.tg==null),svd.slice(0,80));
await send({t:'work',op:'fire',k:'grower'});await sl(300);w=await W();ok('fire removes worker + their can',!w.workers.some(v=>v.k=='grower')&&!w.ents.some(e=>e.data?.wk),JSON.stringify(w.workers.map(v=>v.k)));
await send({t:'dbg',money:10-(await W()).money});await sl(200);await send({t:'dbg',min:1439});await sl(200);await ff(1);w=await W();ok('unpaid workers quit',w.workers.length==0,w.wlast);
ok('no page errors',errs.length==0,errs.join(' | '));
console.log(res.filter(x=>x).length+'/'+res.length);await b.close();srv.kill();process.exit(0)})().catch(e=>{console.error(e);process.exit(1)});
