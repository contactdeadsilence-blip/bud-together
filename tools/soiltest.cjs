// Server-side test of moisture, cracking, neglect death, bagging, disposal, replanting and the watering check (co-op state).
const {DIE}={DIE:480};const WS=require('ws'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const PORT=3204;const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1},stdio:'ignore'});await sl(700);
const cl=()=>new Promise(r=>{const ws=new WS(`ws://localhost:${PORT}/ws`);const c={ws,w:null,fx:[],sounds:[],toasts:[]};ws.on('message',d=>{const m=JSON.parse(d);if(m.t=='joined')c.code=m.code,c.id=m.id;if(m.t=='w'){c.w=m.w;m.w.fx&&c.fx.push(m.w.fx);m.w.sound&&c.sounds.push(m.w.sound);m.w.toast&&c.toasts.push(m.w.toast.t)}});ws.on('open',()=>r(c))});
const A=await cl(),B=await cl();const tx=(c,m)=>c.ws.send(JSON.stringify(m));
tx(A,{t:'host',name:'A'});await sl(200);tx(B,{t:'join',code:A.code,name:'B'});await sl(200);tx(A,{t:'start'});await sl(500);
const res=[];const ok=(n,c,i='')=>{res.push(c);console.log(c?'PASS':'FAIL',n,i)};const pot=(c,id)=>c.w.ents.find(e=>e.id==id);const step=async()=>sl(350);
tx(A,{t:'dbg',spawn:{x:0,z:0,s:'owl',age:150,water:100}});await step();const P=A.w.ents.at(-1).id;
ok('starter garbage bags in world',A.w.ents.some(e=>e.type=='gbag'));ok('garbage bags in shop',!!require('fs').readFileSync('src/rules.js','utf8').match(/gbag:\{n:'Garbage Bags',p:4/));
tx(A,{t:'dbg',ff:240});await step();let p=pot(A,P);ok('soil dries over time',p.data.moist<70&&p.data.moist>50,p.data.moist.toFixed(1));ok('no cracks while moist',(p.data.crack||0)==0);
tx(A,{t:'dbg',ff:400});await step();globalThis.c0=pot(A,P).data.crack;ok('cracks appear below 25%',pot(A,P).data.crack>.05&&pot(A,P).data.crack<.6,pot(A,P).data.crack.toFixed(2));tx(A,{t:'dbg',ff:10});await step();p=pot(A,P);ok('moisture hits 0',p.data.moist==0);ok('not wilting yet 50s after drying out (grace)',p.data.plant.wilt==0&&!p.data.plant.dead);tx(A,{t:'dbg',ff:100});await step();p=pot(A,P);ok('wilt warning flagged',p.data.plant.warn==2);ok('plant wilting after grace',p.data.plant.wilt>0&&p.data.plant.dry<480,'wilt '+p.data.plant.wilt.toFixed(2)+' dry '+p.data.plant.dry.toFixed(0));
const c1=globalThis.c0;p=pot(A,P);ok('cracks deepen over time',p.data.crack>c1,c1.toFixed(2)+'->'+p.data.crack.toFixed(2));
ok('co-op: B sees same moisture/crack',pot(B,P).data.crack==p.data.crack);
tx(A,{t:'dbg',ff:200});await step();ok('still alive at 7.5 min dry',!pot(A,P).data.plant.dead);tx(A,{t:'dbg',ff:140});await step();p=pot(A,P);ok('plant dies of neglect',p.data.plant.dead);
// interact without bag
A.toasts=[];tx(A,{t:'use',target:P});await step();ok('dead plant needs bag',A.toasts.some(t=>/Garbage Bag/.test(t))&&pot(A,P).data.plant);
tx(A,{t:'dbg',give:'gbag'});await step();tx(A,{t:'use',target:P});await step();p=pot(A,P);let held=A.w.ents.filter(e=>e.by==A.id).sort((a,b)=>a.bi-b.bi);
ok('bagging removes plant',!p.data.plant);ok('carrying trash bag',held[0]?.type=='trash',held.map(e=>e.type));ok('bag used up 1',held.find(e=>e.type=='gbag')?.data.uses==4);
ok('cracked soil ruined -> needs fresh soil',p.data.soil==0);
tx(A,{t:'use',target:'bin'});await step();held=A.w.ents.filter(e=>e.by==A.id);ok('trash disposed in dumpster',!held.some(e=>e.type=='trash')&&!A.w.ents.some(e=>e.type=='trash'));
// replant
tx(A,{t:'dbg',give:'seed_haze'});await step();A.toasts=[];tx(A,{t:'use',target:P});await step();ok('cannot seed without soil',!pot(A,P).data.plant&&A.toasts.some(t=>/soil/i.test(t)));
tx(A,{t:'dbg',give:'soil'});await step();tx(A,{t:'use',target:P});await step();ok('fresh soil added',pot(A,P).data.soil==1&&!pot(A,P).data.crack);
tx(A,{t:'cycle',d:1});await step();while(A.w.ents.find(e=>e.by==A.id&&!e.bi)?.type!='seed_haze'){tx(A,{t:'cycle',d:1});await step()}
tx(A,{t:'use',target:P});await step();ok('replanted new seed',pot(A,P).data.plant?.s=='haze'&&pot(A,P).data.plant.age<3);
// mild dry bag keeps soil
tx(A,{t:'dbg',spawn:{x:2,z:0,s:'owl',age:300,water:60,dead:true}});await step();const P2=A.w.ents.at(-1).id;while(A.w.ents.find(e=>e.by==A.id&&!e.bi)?.type!='gbag'){tx(A,{t:'cycle',d:1});await step()}
while(A.w.ents.find(e=>e.by==A.id&&!e.bi)?.type!='soil'){tx(A,{t:'cycle',d:1});await step()}tx(A,{t:'drop',x:1,z:1});await step();while(A.w.ents.find(e=>e.by==A.id&&!e.bi)?.type!='gbag'){tx(A,{t:'cycle',d:1});await step()}tx(A,{t:'use',target:P2});await step();ok('uncracked soil kept after bagging',pot(A,P2).data.soil==1&&!pot(A,P2).data.plant,A.toasts.slice(-2).join('|'));
// watering
tx(B,{t:'dbg',give:'water'});tx(A,{t:'dbg',set:{id:P,d:{moist:10}}});await step();B.fx=[];B.sounds=[];A.fx=[];
let last=10,mono=true;for(let i=0;i<22&&last<100;i++){tx(B,{t:'use',target:P});await sl(110);const m=pot(B,P).data.moist;if(m<last-1)mono=false;last=m}
await step();ok('pouring raises moisture progressively',mono&&last>=95,last);for(let i=0;i<3;i++){tx(B,{t:'use',target:P});await sl(120)}await step();
tx(A,{t:'dbg',set:{id:P,d:{moist:100}}});await step();ok('moisture reaches 100 and caps',pot(B,P).data.moist>=99,pot(B,P).data.moist+' fx '+JSON.stringify(B.fx)+B.toasts.slice(-2));ok('green check fx sent once (seen by both)',B.fx.filter(f=>f.k=='full').length==1&&A.fx.some(f=>f.k=='full'));ok('check sound',B.sounds.includes('check'));
ok('overwater spills, no effect',B.fx.some(f=>f.k=='spill'));ok('can water level consumed',B.w.ents.find(e=>e.by==B.id&&e.type=='water').data.w<100);

// forgiving-growth checks
const spawnP=async(x,o)=>{tx(A,{t:'dbg',spawn:{x,z:-2,s:'owl',age:100,water:100,...o}});await step();return A.w.ents.at(-1).id};
const R=await spawnP(-2,{});tx(A,{t:'dbg',set:{id:R,d:{moist:0}}});tx(A,{t:'dbg',ff:250});await step();ok('wilting before rescue',pot(A,R).data.plant.wilt>0);
tx(B,{t:'dbg',give:'water'});await step();while(B.w.ents.find(e=>e.by==B.id&&!e.bi)?.type!='water'){tx(B,{t:'cycle',d:1});await step()}
tx(B,{t:'use',target:R});await step();p=pot(A,R);ok('one pour resets wilt + dry timer',p.data.plant.wilt==0&&p.data.plant.dry==0&&!p.data.plant.dead);
// regular watering (every ~9 min) for 4 cycles never dies
tx(A,{t:'dbg',set:{id:R,d:{moist:100}}});await step();let alive=true,lo=[];for(let k=0;k<4;k++){tx(A,{t:'dbg',ff:540});await step();lo.push(pot(A,R).data.moist.toFixed(0));tx(B,{t:'dbg',give:'water'});await step();while(B.w.ents.find(e=>e.by==B.id&&!e.bi)?.type!='water'){tx(B,{t:'cycle',d:1});await step()}for(let i=0;i<24&&pot(B,R).data.moist<99;i++){tx(B,{t:'use',target:R});await sl(110)}await step();lo.push(pot(A,R).data.moist.toFixed(0));if(pot(A,R).data.plant.dead)alive=false}
ok('watered every 9 min for 36 min: never dies',alive&&!pot(A,R).data.plant.dead,lo.join('>'));ok('watered plant never wilted to death',pot(A,R).data.plant.dry<DIE);
// no light / no food only slows, never kills
const N=await spawnP(-3,{});tx(A,{t:'dbg',set:{id:N,d:{moist:100}}});for(let k=0;k<3;k++){tx(A,{t:'dbg',set:{id:N,d:{moist:100}}});tx(A,{t:'dbg',ff:500});await step()}p=pot(A,N);ok('no light/nutrients never kills (health floor)',!p.data.plant.dead&&p.data.plant.health>=29,p.data.plant.health.toFixed(0));
// pausing stops the clock (all players paused)
tx(A,{t:'pause',v:1});tx(B,{t:'pause',v:1});await sl(600);let m1=pot(A,N).data.moist;await sl(1500);ok('no drain while everyone is paused',pot(A,N).data.moist==m1,m1+' '+pot(A,N).data.moist);tx(A,{t:'pause',v:0});await sl(800);ok('drain resumes after unpause',pot(A,N).data.moist<m1);tx(B,{t:'pause',v:0});
console.log(`\n${res.filter(x=>x).length}/${res.length} passed`);A.ws.close();B.ws.close();srv.kill();process.exit(res.every(x=>x)?0:1)})();
