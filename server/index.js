import {STRAINS,SHOP,READY,DRY,stage} from '../src/rules.js';import express from 'express';import {WebSocketServer} from 'ws';import http from 'http';import path from 'path';import {fileURLToPath} from 'url';
const dir=path.join(path.dirname(fileURLToPath(import.meta.url)),'..','dist');
const app=express();app.use(express.static(dir));app.get('/health',(q,r)=>r.send('ok'));
const server=http.createServer(app);const wss=new WebSocketServer({server,path:'/ws'});
const rooms=new Map();const COLORS=['#ff6b4a','#3fb5ff','#ffd23f','#9b6bff'];
const mk=()=>{let c;do c=Array.from({length:4},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.random()*24|0]).join('');while(rooms.has(c));return c};
const roster=r=>r.players.map((p,i)=>({id:p.id,name:p.name,color:COLORS[i]}));
const bc=(r,m,ex)=>{const s=JSON.stringify(m);r.players.forEach(p=>p!==ex&&p.ws.readyState===1&&p.ws.send(s))};
// ---------- game rules ----------
const SHOPS=['Green Leaf Co.','Pacific Buds','Dead Calm Dispensary','High Tide','Mellow Mart','The Herb Loft'];
const PAD={x:2.4,z:7.2};
function newWorld(){const w={money:150,rep:0,day:1,min:8*60,room:1,ents:[],nid:1,contracts:[],pending:[],log:[]};
 const add=(type,x,z,data={})=>w.ents.push({id:w.nid++,type,x,y:0,z,ry:0,by:0,data:{...data,...(SHOP[type]?.uses?{uses:SHOP[type].uses}:{})}});
 add('pot',-1,-3);add('pot',0,-3);add('soil',2.5,-3.8);add('seed_haze',1.5,-3.9);add('water',3,-2.5);add('light',-.5,-3.9);
 for(let i=0;i<3;i++)newContract(w);return w}
function newContract(w){const ks=Object.keys(STRAINS),s=ks[Math.random()*ks.length|0],big=w.rep>=5&&Math.random()<.5;const g=(big?14:5)+Math.round(Math.random()*(big?20:8))+w.rep;
 w.contracts.push({id:w.nid++,shop:SHOPS[Math.random()*SHOPS.length|0],s,g,got:0,pay:Math.round(g*STRAINS[s].ppg*(1.4+Math.min(w.rep,20)*.04)),due:w.day+(big?3:2)})}
const ent=(w,id)=>w.ents.find(e=>e.id===id);
const near=(a,b,r)=>Math.hypot(a.x-b.x,a.z-b.z)<r;
function lit(w,e){return w.ents.some(l=>l.type==='light'&&!l.by&&near(l,e,3.2))}
function tick(w,dt){w.min+=dt*4;if(w.min>=1440){w.min-=1440;w.day++;
  w.contracts=w.contracts.filter(c=>{if(c.due<w.day){w.rep=Math.max(0,w.rep-1);msg(w,`Missed contract for ${c.shop} (-1 rep)`);return false}return true})}
 while(w.contracts.length<3+Math.min(3,w.rep>>2))newContract(w);
 w.pending=w.pending.filter(p=>{if((p.t-=dt)>0)return true;const e={id:w.nid++,type:p.type,x:PAD.x+(Math.random()-.5)*1.4,y:0,z:PAD.z+(Math.random()-.5)*1.2,ry:Math.random()*6,by:0,data:SHOP[p.type].uses?{uses:SHOP[p.type].uses}:{}};w.ents.push(e);msg(w,SHOP[p.type].n+' delivered at the door');return false});
 for(const e of w.ents){const pl=e.data.plant;
  if(e.type==='pot'&&pl&&!pl.dead){const L=lit(w,e);pl.lit=L;pl.water=Math.max(0,pl.water-dt*100/150);pl.nutr=Math.max(0,pl.nutr-dt*100/240);
   if(pl.water>0&&pl.age<READY)pl.age+=dt*STRAINS[pl.s].speed*(L?1:.3)*(pl.nutr>0?1:.7);
   if(pl.water<10||pl.nutr<5||!L)pl.health=Math.max(0,pl.health-dt*(pl.water<10?1.2:.5));else pl.health=Math.min(100,pl.health+dt*.6);
   if(pl.health<=0)pl.dead=true}
  if(e.type==='rack')for(const s of e.data.slots||[])if(s.t>0)s.t=Math.max(0,s.t-dt)}}
function msg(w,t){w.log.push(t)}
function norm(w,pid){w.ents.filter(e=>e.by===pid).sort((a,b)=>(a.bi||0)-(b.bi||0)).forEach((e,i)=>e.bi=i)}
function act(w,pid,m){act0(w,pid,m);norm(w,pid)}
function act0(w,pid,m){const bag=w.ents.filter(e=>e.by===pid);const c=bag.find(e=>!e.bi)||null,t=m.target&&m.target!=='drop'?ent(w,m.target):null;const say=s=>{w.toast={pid,t:s}};
 const give=e=>{if(!w.ents.includes(e))w.ents.push(e);for(const o of bag)o.bi=(o.bi||0)+1;e.by=pid;e.bi=0};const full=()=>bag.length>=3&&(say('Hands full (3 items max) — drop something'),true);
 if(m.t==='buy'){const it=SHOP[m.item];if(!it)return;const n=Math.max(1,Math.min(10,m.n|0||1));if(w.money<it.p*n)return say('Not enough money');w.money-=it.p*n;for(let i=0;i<n;i++)w.pending.push({type:m.item,t:4+i*.5});w.sound='buy';return say(`Ordered ${n}× ${it.n} — arriving at the door`)}
 if(m.t==='upgrade'){if(w.room>1)return;if(w.rep<5)return say('Need 5 reputation');if(w.money<500)return say('Need $500');w.money-=500;w.room=2;return say('Grow room expanded!')}
 if(m.t==='drop'){if(!c)return;c.by=0;c.bi=0;c.x=+m.x||0;c.z=+m.z||0;c.y=+m.y||0;c.ry=+m.ry||0;return}
 if(m.t==='cycle'){if(bag.length<2)return;const L=bag.length,d=m.d<0?1:L-1;for(const e of bag)e.bi=((e.bi||0)+d)%L;return}
 if(m.t!=='use')return;
 if(m.target==='drop'){if(!c||c.type!=='packed')return say('Pack product into a jar first');const {s,g}=c.data;w.ents=w.ents.filter(e=>e!==c);
  const k=w.contracts.find(k=>k.s===s);if(k){k.got+=g;if(k.got>=k.g){w.money+=k.pay;w.rep+=k.g>=20?2:1;w.contracts=w.contracts.filter(x=>x!==k);say(`Contract done! +$${k.pay} · +rep`);w.sound='cash'}else say(`${k.shop}: ${k.got}/${k.g}g delivered`)}
  else{const v=g*4;w.money+=v;say(`No ${STRAINS[s].name} contract — sold on the spot for $${v}`);w.sound='cash'}return}
 if(!t)return;
 if(c){const use=()=>{if(c.data.uses!=null&&--c.data.uses<=0)w.ents=w.ents.filter(e=>e!==c)};const ct=c.type;
  if(t.type==='pot'&&(ct==='soil'||ct.startsWith('seed_')||ct==='water'||ct==='nutr')){const d=t.data;
   if(ct==='soil'){if(d.soil)return say('Pot already has soil');d.soil=1;use();w.sound='pour';return say('Filled pot with soil')}
   if(ct.startsWith('seed_')){if(!d.soil)return say('Add soil first');if(d.plant)return say('Already planted');d.plant={s:ct.slice(5),age:0,water:40,nutr:30,health:80};use();return say('Planted '+STRAINS[d.plant.s].name)}
   if(ct==='water'){if(!d.plant)return say('Nothing to water');d.plant.water=100;use();w.sound='pour';return say('Watered')}
   if(ct==='nutr'){if(!d.plant)return say('Nothing to feed');d.plant.nutr=100;use();w.sound='pour';return say('Fed nutrients')}}
  if(t.type==='rack'&&ct==='wetbud'){const sl=t.data.slots=t.data.slots||[];if(sl.length>=4)return say('Rack is full');sl.push({s:c.data.s,g:c.data.g,t:DRY});w.ents=w.ents.filter(e=>e!==c);return say('Hung to dry (1 min)')}
  if(t.type==='scale'&&ct==='drybud'){const j=w.ents.find(e=>e.type==='jars'&&!e.by);if(!j)return say('Need a Jar Box placed in the shed');c.type='packed';if(--j.data.uses<=0)w.ents=w.ents.filter(e=>e!==j);w.sound='cash';return say(`Weighed & packed: ${c.data.g}g ${STRAINS[c.data.s].name}`)}
  if(m.only)return say("Can't use "+(SHOP[ct]?.n||ct)+' on that')}
 if(t.type==='pot'&&stage(t.data.plant)==='ready'){if(full())return;const p=t.data.plant,g=Math.max(1,Math.round(STRAINS[p.s].g*(.35+.65*p.health/100)));t.data.plant=null;t.data.soil=0;
  give({id:w.nid++,type:'wetbud',x:0,y:0,z:0,ry:0,by:pid,data:{s:p.s,g}});return say(`Harvested ${g}g wet ${STRAINS[p.s].name} — hang it to dry`)}
 if(t.type==='pot'&&t.data.plant?.dead){t.data.plant=null;t.data.soil=0;return say('Cleared the dead plant')}
 if(t.type==='rack'){const sl=t.data.slots||[];const i=sl.findIndex(s=>s.t<=0);if(i>=0){if(full())return;const s=sl.splice(i,1)[0];give({id:w.nid++,type:'drybud',x:0,y:0,z:0,ry:0,data:{s:s.s,g:s.g}});return say(`Took ${s.g}g dried bud — pack it at the scale`)}
  if(sl.length)return say('Still drying…')}
 if(t.by||full())return;give(t);w.sound='pick'}
let nid=1;
wss.on('connection',ws=>{const me={ws,id:nid++,name:'Grower'};let room=null;
 const send=m=>ws.send(JSON.stringify(m));
 ws.on('message',d=>{let m;try{m=JSON.parse(d)}catch{return}
  if(m.t==='host'||m.t==='join'){me.name=String(m.name||'Grower').slice(0,10);
   if(m.t==='host'){room={code:mk(),players:[],host:me.id,started:false,w:newWorld()};rooms.set(room.code,room)}
   else{const r=rooms.get(String(m.code||'').toUpperCase());if(!r)return send({t:'err',e:'Room not found'});if(r.players.length>=4)return send({t:'err',e:'Room full'});room=r}
   room.players.push(me);send({t:'joined',code:room.code,id:me.id,host:room.host,started:room.started});bc(room,{t:'roster',pl:roster(room),host:room.host});
   if(room.started)send({t:'start',pl:roster(room)})}
  else if(!room)return;
  else if(m.t==='start'&&me.id===room.host){room.started=true;bc(room,{t:'start',pl:roster(room)})}
  else if(m.t==='s'){m.id=me.id;bc(room,m,me)}
  else if(m.t==='dbg'){if(!process.env.BT_DEBUG)return;const w=room.w;if(m.id){const e=w.ents.find(e=>e.id===m.id);if(e?.data.plant)Object.assign(e.data.plant,{age:m.age,health:100,water:100,nutr:100})}if(m.dry)w.ents.forEach(e=>(e.data.slots||[]).forEach(s=>s.t=0));if(m.contract)w.contracts[0].s=m.contract;if(m.spawn){const q=m.spawn;w.ents.push({id:w.nid++,type:'pot',x:q.x,y:0,z:q.z,ry:0,by:0,data:{soil:1,plant:q.age==null?null:{s:q.s,age:q.age,water:q.water??100,nutr:100,health:q.health??100,dead:!!q.dead}}})}if(m.money)w.money+=m.money;room.dirty=true}
  else{act(room.w,me.id,m);room.dirty=true}
 });
 ws.on('close',()=>{if(!room)return;room.w.ents.forEach(e=>{if(e.by===me.id){e.by=0}});room.players=room.players.filter(p=>p!==me);if(!room.players.length)rooms.delete(room.code);else{if(room.host===me.id)room.host=room.players[0].id;bc(room,{t:'roster',pl:roster(room),host:room.host,left:me.id})}});
});
let acc=0;setInterval(()=>{acc++;for(const r of rooms.values()){if(!r.started)continue;tick(r.w,.1);if(r.dirty||acc%3==0){r.dirty=false;const w=r.w;bc(r,{t:'w',w:{money:w.money,rep:w.rep,day:w.day,min:w.min,room:w.room,ents:w.ents,contracts:w.contracts,log:w.log,toast:w.toast,sound:w.sound,pending:w.pending.length}});w.log=[];w.toast=null;w.sound=null}}},100);
const PORT=process.env.PORT||3000;server.listen(PORT,()=>console.log('Bud Together on :'+PORT));
