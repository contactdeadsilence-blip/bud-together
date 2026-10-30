// v11 server tests: cash, day length, pallet return, trash anything, trash can, table place/take, rolling, pre-roll delivery, sleep (co-op), watered plants survive sleep
const WS=require('ws'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
const R=require('fs').readFileSync('src/rules.js','utf8');
(async()=>{const PORT=3211;const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:''},stdio:'ignore'});await sl(800);
const cl=()=>new Promise(r=>{const ws=new WS(`ws://localhost:${PORT}/ws`);const c={ws,w:null,toasts:[]};ws.on('message',d=>{const m=JSON.parse(d);if(m.t=='joined')c.code=m.code,c.id=m.id;if(m.t=='w'){c.w=m.w;if(m.w.toast&&m.w.toast.pid==c.id)c.toasts.push(m.w.toast.t)}});ws.on('open',()=>r(c))});
const res=[];const ok=(n,c,i='')=>{res.push(!!c);console.log(c?'PASS':'FAIL',n,i)};const tx=(c,m)=>c.ws.send(JSON.stringify(m));const st=()=>sl(350);
const A=await cl(),B=await cl();tx(A,{t:'host',name:'A'});await sl(200);tx(B,{t:'join',code:A.code,name:'B'});await sl(200);tx(A,{t:'start'});await sl(500);
const held=c=>c.w.ents.filter(e=>e.by==c.id).sort((a,b)=>a.bi-b.bi);const clear=async c=>{for(let i=0;i<4&&held(c).length;i++){tx(c,{t:'trash'});await st()}};const E=t=>A.w.ents.find(e=>e.type==t&&!e.by);
ok('starting cash $1000',A.w.money==1000,A.w.money);
ok('day ≈ 12 real minutes',/DAYSEC=720/.test(R)&&/MINPS=1440\/DAYSEC/.test(R.replace(/\s/g,'')));
{const m0=A.w.min;tx(A,{t:'dbg',ff:60});await st();const d=(A.w.min-m0+1440)%1440;ok('60 s real = 120 game minutes',Math.abs(d-120)<3,d.toFixed(1))}
ok('starter desk, bed, trash can, papers',['desk','bed','tcan','papers'].every(t=>E(t)));
ok('shop sells table, bed, trash can, papers',/table:\{/.test(R)&&/bed:\{/.test(R)&&/tcan:\{/.test(R)&&/papers:\{/.test(R));
// pallet return
tx(A,{t:'dbg',pallet:{it:'soil',x:1,z:1}});await st();const pal=A.w.ents.filter(e=>e.type=='pallet').at(-1);const n0=pal.data.n;
tx(A,{t:'use',target:pal.id});await st();ok('take from pallet',held(A)[0]?.type=='soil'&&A.w.ents.find(e=>e.id==pal.id).data.n==n0-1);
tx(A,{t:'use',target:pal.id});await st();ok('put item back on matching pallet',!held(A).some(e=>e.type=='soil')&&A.w.ents.find(e=>e.id==pal.id).data.n==n0);
tx(A,{t:'dbg',give:'seed_owl'});await st();A.toasts=[];tx(A,{t:'use',target:pal.id});await st();ok('wrong item not put on pallet',held(A).some(e=>e.type=='seed_owl'));await clear(A);tx(A,{t:'dbg',give:'seed_owl'});await st();
// trash anything
tx(A,{t:'trash'});await st();ok('trash action discards held seed',!held(A).some(e=>e.type=='seed_owl'));
tx(A,{t:'dbg',give:'jars'});await st();tx(A,{t:'use',target:'bin'});await st();ok('dumpster takes any item (jar)',!held(A).some(e=>e.type=='jars'));
tx(A,{t:'dbg',give:'nutr'});await st();tx(A,{t:'use',target:E('tcan').id});await st();ok('trash can prop takes item',!held(A).some(e=>e.type=='nutr'));
{const w0=A.w.ents.find(e=>e.type=='water');if(w0){tx(A,{t:'use',target:w0.id});await st()}tx(A,{t:'trash'});await st();ok('trashed watering can respawns empty by sink',A.w.ents.filter(e=>e.type=='water').length==1&&!held(A).some(e=>e.type=='water'))}
// table
await clear(A);tx(A,{t:'dbg',place:{type:'table',x:0,z:2,data:{items:[]}}});await st();const T=A.w.ents.filter(e=>e.type=='table').at(-1);
tx(A,{t:'dbg',give:'jars'});await st();tx(A,{t:'use',target:T.id,lx:.3,lz:-.1,ry:.5});await st();let t=A.w.ents.find(e=>e.id==T.id);
ok('place item on table at aim point',t.data.items.length==1&&t.data.items[0].type=='jars'&&t.data.items[0].x==.3&&t.data.items[0].z==-.1,JSON.stringify(t.data.items));
ok('co-op sees table item',B.w.ents.find(e=>e.id==T.id).data.items.length==1);
tx(A,{t:'dbg',give:'nutr'});await st();tx(A,{t:'use',target:T.id,lx:9,lz:9});await st();t=A.w.ents.find(e=>e.id==T.id);ok('placement clamped to surface',t.data.items[1]&&t.data.items[1].x<=.55&&t.data.items[1].z<=.3);
await clear(A);tx(A,{t:'dbg',give:'light'});await st();A.toasts=[];tx(A,{t:'use',target:T.id,lx:0,lz:0});await st();ok('big item refused on table',held(A)[0]?.type=='light'&&A.toasts.some(x=>/too big/.test(x)));tx(A,{t:'trash'});await st();
tx(A,{t:'use',target:T.id,lx:.3,lz:-.1});await st();ok('take nearest item off table',held(A)[0]?.type=='jars'&&A.w.ents.find(e=>e.id==T.id).data.items.length==1);tx(A,{t:'trash'});await st();
const D=E('desk');tx(A,{t:'dbg',give:'jars'});await st();tx(A,{t:'use',target:D.id,lx:0,lz:.4});await st();ok('starter desk takes items',A.w.ents.find(e=>e.id==D.id).data.items.length==1);
// rolling
await clear(A);tx(A,{t:'dbg',give:'drybud'});await st();const bud=held(A)[0];const pu=E('papers').data.uses;tx(A,{t:'use',target:D.id,roll:1});await st();let h=held(A)[0];
ok('roll dried bud into pre-rolls (desk, nearby papers)',h?.type=='joints'&&h.data.n==12&&h.data.s=='owl',JSON.stringify(h));ok('rolling uses a paper',E('papers').data.uses==pu-1);
tx(A,{t:'dbg',give:'drybud'});await st();tx(A,{t:'use',target:T.id,roll:1});await st();A.toasts=[];ok('no papers near table → refused',held(A)[0]?.type=='drybud');tx(A,{t:'trash'});await st();
// deliver: pre-roll contract
A.w.contracts.length;tx(A,{t:'dbg',contract:'owl'});await st();
{const m0=A.w.money,k=A.w.contracts[0];if(k.pre){tx(A,{t:'use',target:'drop'});await st();ok('pre-roll contract accepts joints',A.w.contracts.find(x=>x.id==k.id)?.got>0||A.w.money>m0)}else{tx(A,{t:'use',target:'drop'});await st();ok('loose pre-rolls sell at the drop box ($6 each)',A.w.money==m0+12*6,m0+'->'+A.w.money)}}
ok('pre-roll contracts exist in generator',/pre:1/.test(require('fs').readFileSync('server/index.js','utf8')));
// sleep
tx(A,{t:'dbg',min:600});await st();A.toasts=[];tx(A,{t:'use',target:E('bed').id});await st();ok("can't sleep at 10 AM",!(A.w.sleepers||[]).length&&A.toasts.some(x=>/7 PM/.test(x)));
tx(A,{t:'dbg',min:1260,spawn:{x:-1,z:-3,s:'owl',age:100,water:95}});await st();const P1=A.w.ents.at(-1).id;tx(A,{t:'dbg',spawn:{x:1,z:-3,s:'owl',age:100,water:3}});await st();const P2=A.w.ents.at(-1).id;
const d0=A.w.day,s0=A.w.slept||0;tx(A,{t:'use',target:E('bed').id});await st();ok('A in bed (1/2)',A.w.sleepers?.length==1&&A.w.min>1200);
tx(B,{t:'sleep'});await sl(900);ok('all in bed → skips to 7 AM next day',A.w.min>=420&&A.w.min<440&&A.w.day==d0+1&&(A.w.slept||0)==s0+1,A.w.day+' '+A.w.min);
const p1=A.w.ents.find(e=>e.id==P1),p2=A.w.ents.find(e=>e.id==P2);ok('watered plant survived and grew',p1.data.plant&&!p1.data.plant.dead&&p1.data.plant.age>100,JSON.stringify(p1.data.plant));
ok('bill generated overnight',A.w.util.bills.length>=1);ok('sleepers cleared',!(A.w.sleepers||[]).length);
console.log('(unwatered plant after night: '+(p2.data.plant?.dead?'dead':'alive')+')');
console.log(res.filter(x=>x).length+'/'+res.length+' passed');srv.kill();process.exit(res.every(x=>x)?0:1)})();
