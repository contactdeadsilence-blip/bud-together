import {SLOTS,CAN,FILL,GAL,RATE,STRAINS,SHOP,READY,DRY,stage,WILT0,WILT1,DIE,POUR,DRAIN,DRAIN_EMPTY,NUTR,THIRSTY,HFLOOR} from '../src/rules.js';import express from 'express';import {WebSocketServer} from 'ws';import http from 'http';import crypto from 'crypto';import {openStore} from './store.js';import path from 'path';import {fileURLToPath} from 'url';
const dir=path.join(path.dirname(fileURLToPath(import.meta.url)),'..','dist');
const app=express();app.use(express.static(dir));app.get('/health',(q,r)=>r.send('ok'));
// ---------- accounts + saves ----------
const store=await openStore();console.log('Store:',store.kind);
app.use('/api',express.json({limit:'200kb'}));
const U=n=>String(n||'').trim().toLowerCase();const okU=n=>/^[a-z0-9_]{3,16}$/.test(n);
const hash=(pw,salt)=>crypto.scryptSync(String(pw),salt,64).toString('hex');
async function newSess(u){const tok=crypto.randomBytes(24).toString('hex');await store.set('sess:'+tok,{u,t:Date.now()});return tok}
async function who(tok){if(!tok||typeof tok!='string')return null;const s=await store.get('sess:'+tok);return s?.u||null}
const authed=f=>async(q,r)=>{try{const u=await who(q.get('x-bt-token'));if(!u)return r.status(401).json({e:'Not logged in'});await f(q,r,u)}catch(e){console.error(e);r.status(500).json({e:'Server error'})}};
app.post('/api/signup',async(q,r)=>{const u=U(q.body?.user),pw=String(q.body?.pass||'');if(!okU(u))return r.status(400).json({e:'Username: 3-16 letters, numbers or _'});if(pw.length<4)return r.status(400).json({e:'Password must be 4+ characters'});
 if(await store.get('user:'+u))return r.status(409).json({e:'Username taken'});const salt=crypto.randomBytes(16).toString('hex');await store.set('user:'+u,{u,salt,h:hash(pw,salt),c:Date.now()});r.json({user:u,token:await newSess(u)})});
app.post('/api/login',async(q,r)=>{const u=U(q.body?.user),a=await store.get('user:'+u);if(!a)return r.status(401).json({e:'Wrong username or password'});const h=hash(String(q.body?.pass||''),a.salt);
 if(!crypto.timingSafeEqual(Buffer.from(h,'hex'),Buffer.from(a.h,'hex')))return r.status(401).json({e:'Wrong username or password'});r.json({user:u,token:await newSess(u)})});
app.post('/api/logout',async(q,r)=>{const t=q.get('x-bt-token');if(t)await store.del('sess:'+t);r.json({ok:1})});
app.get('/api/me',authed(async(q,r,u)=>r.json({user:u})));
app.get('/api/profile',authed(async(q,r,u)=>r.json((await store.get('prof:'+u))||{})));
app.put('/api/profile',authed(async(q,r,u)=>{const b=q.body;if(!b||typeof b!='object')return r.status(400).json({e:'bad'});const o={};for(const[k,v]of Object.entries(b))if(/^bt_\w{1,20}$/.test(k)&&typeof v=='string'&&v.length<20000)o[k]=v;await store.set('prof:'+u,o);r.json({ok:1})}));
app.get('/api/saves',authed(async(q,r,u)=>r.json((await store.list('save:'+u+':')).map(({k,v})=>({id:k.split(':')[2],name:v.name,day:v.w.day,money:v.w.money,rep:v.w.rep,plants:v.w.ents.filter(e=>e.data?.plant&&!e.data.plant.dead).length,at:v.at})).sort((a,b)=>b.at-a.at))));
app.delete('/api/saves/:id',authed(async(q,r,u)=>{await store.del('save:'+u+':'+String(q.params.id).replace(/\W/g,''));r.json({ok:1})}));
// world save: strip transient fields; held items get dropped at the delivery pad
function snap(w){const c=JSON.parse(JSON.stringify(w));for(const e of c.ents)if(e.by){e.by=0;e.bi=0;e.x=PAD.x+(Math.random()-.5);e.z=PAD.z+(Math.random()-.5);e.y=0}c.log=[];delete c.toast;delete c.sound;delete c.fx;return c}
async function saveRoom(r){if(!r.owner||!r.started)return;try{await store.set('save:'+r.owner+':'+r.sid,{name:r.sname,at:Date.now(),w:snap(r.w)});r.savedAt=Date.now()}catch(e){console.error('save failed',e.message)}}

const server=http.createServer(app);const wss=new WebSocketServer({server,path:'/ws'});
const rooms=new Map();const COLORS=['#ff6b4a','#3fb5ff','#ffd23f','#9b6bff'];
const mk=()=>{let c;do c=Array.from({length:4},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.random()*24|0]).join('');while(rooms.has(c));return c};
const roster=r=>r.players.map((p,i)=>({id:p.id,name:p.name,color:COLORS[i],look:p.look||null}));
const okLook=l=>l&&typeof l=='object'&&JSON.stringify(l).length<3000?l:null;
const bc=(r,m,ex)=>{const s=JSON.stringify(m);r.players.forEach(p=>p!==ex&&p.ws.readyState===1&&p.ws.send(s))};
// ---------- game rules ----------
const SHOPS=['Green Leaf Co.','Pacific Buds','Dead Calm Dispensary','High Tide','Mellow Mart','The Herb Loft'];
const PAD={x:2.4,z:7.2};
function newWorld(){const w={money:150,rep:0,day:1,min:8*60,room:1,ents:[],nid:1,contracts:[],pending:[],log:[],util:{gal:0,kwh:0,bills:[],off:0}};
 const add=(type,x,z,data={})=>w.ents.push({id:w.nid++,type,x,y:0,z,ry:0,by:0,data:{...data,...(SHOP[type]?.uses?{uses:SHOP[type].uses}:{})}});
 add('pot',-1,-3);add('pot',0,-3);add('soil',2.5,-3.8);add('seed_haze',1.5,-3.9);add('sink',3.55,-1.2,{fixed:1});w.ents.at(-1).ry=-Math.PI/2;add('water',3.3,-.45,{w:CAN});add('light',-.5,-3.9);add('gbag',3.3,-3.7);
 for(let i=0;i<3;i++)newContract(w);return w}
function newContract(w){const ks=Object.keys(STRAINS),s=ks[Math.random()*ks.length|0],big=w.rep>=5&&Math.random()<.5;const g=(big?14:5)+Math.round(Math.random()*(big?20:8))+w.rep;
 w.contracts.push({id:w.nid++,shop:SHOPS[Math.random()*SHOPS.length|0],s,g,got:0,pay:Math.round(g*STRAINS[s].ppg*(1.4+Math.min(w.rep,20)*.04)),due:w.day+(big?3:2)})}
const ent=(w,id)=>w.ents.find(e=>e.id===id);
const near=(a,b,r)=>Math.hypot(a.x-b.x,a.z-b.z)<r;
function lit(w,e){return powered(w)&&w.ents.some(l=>l.type==='light'&&!l.by&&near(l,e,3.2))}
function tick(w,dt){const U=w.util;if(!(U.off&2))U.kwh+=w.ents.filter(e=>e.type=='light'&&!e.by).length*RATE.light*dt*4/60;w.min+=dt*4;if(w.min>=1440){w.min-=1440;w.day++;bill(w);
  for(const b of U.bills)if(b.due<w.day&&!(U.off&3)){U.off=3;msg(w,'⚠ Utility bill overdue — water & power are OFF until you pay (laptop → Utilities)')}
  w.contracts=w.contracts.filter(c=>{if(c.due<w.day){w.rep=Math.max(0,w.rep-1);msg(w,`Missed contract for ${c.shop} (-1 rep)`);return false}return true})}
 while(w.contracts.length<3+Math.min(3,w.rep>>2))newContract(w);
 w.pending=w.pending.filter(p=>{if((p.t-=dt)>0)return true;const S=SHOP[p.type],pal=S.pal;const e={id:w.nid++,type:pal?'pallet':p.type,x:PAD.x+(Math.random()-.5)*1.4,y:0,z:PAD.z+(Math.random()-.5)*1.2,ry:pal?0:Math.random()*6,by:0,data:pal?{it:pal,n:S.k}:S.uses?{uses:S.uses}:p.type=='shelf'?{slots:[]}:{}};w.ents.push(e);msg(w,SHOP[p.type].n+' delivered at the door');return false});
 for(const e of w.ents){const pl=e.data.plant,d=e.data;
  if(e.type==='pot'&&d.soil){if(d.moist==null)d.moist=pl?pl.water:30;const live=pl&&!pl.dead;d.moist=Math.max(0,d.moist-dt*100/(live?DRAIN:DRAIN_EMPTY));
   if(d.moist<25)d.crack=Math.min(1,(d.crack||0)+dt*(25-d.moist)/25/240);else if(d.moist>=60)d.crack=Math.max(0,(d.crack||0)-dt/20);
   if(live){pl.water=d.moist;pl.dry=d.moist<=0?(pl.dry||0)+dt:Math.max(0,(pl.dry||0)-dt*3);pl.wilt=Math.min(1,Math.max(0,(pl.dry-WILT0)/(WILT1-WILT0)));if(d.moist<THIRSTY&&!pl.warn){pl.warn=1;msg(w,'A plant is thirsty — water it soon')}if(pl.wilt>0&&pl.warn<2){pl.warn=2;msg(w,'⚠ A plant is WILTING — water it now to save it')}if(d.moist>=THIRSTY+10)pl.warn=0;if(pl.dry>=DIE){pl.dead=true;msg(w,'A plant died of thirst')}}}
  if(e.type==='pot'&&pl&&!pl.dead){const L=lit(w,e);pl.lit=L;pl.nutr=Math.max(0,pl.nutr-dt*100/NUTR);
   if(pl.water>0&&pl.age<READY)pl.age+=dt*STRAINS[pl.s].speed*(L?1:.3)*(pl.nutr>0?1:.7);
   if(pl.nutr<5||!L)pl.health=Math.max(Math.min(pl.health,HFLOOR),pl.health-dt*.25);else pl.health=Math.min(100,pl.health+dt*.6)}
  if(e.type==='rack')for(const s of e.data.slots||[])if(s.t>0)s.t=Math.max(0,s.t-dt)}}
function msg(w,t){w.log.push(t)}
function bill(w){const U=w.util,wa=+(U.gal*RATE.water).toFixed(2),el=+(U.kwh*RATE.kwh).toFixed(2),amt=Math.ceil(RATE.base+wa+el);U.bills.push({id:w.nid++,day:w.day-1,gal:+U.gal.toFixed(1),kwh:+U.kwh.toFixed(1),wa,el,amt,due:w.day});U.gal=0;U.kwh=0;msg(w,`💡 Utility bill for Day ${w.day-1}: $${amt} — pay by end of Day ${w.day} (laptop → Utilities)`)}
const powered=w=>!(w.util.off&2),wet=w=>!(w.util.off&1);
function norm(w,pid){w.ents.filter(e=>e.by===pid).sort((a,b)=>(a.bi||0)-(b.bi||0)).forEach((e,i)=>e.bi=i)}
function act(w,pid,m){act0(w,pid,m);norm(w,pid)}
function act0(w,pid,m){const bag=w.ents.filter(e=>e.by===pid);const c=bag.find(e=>!e.bi)||null,t=m.target&&m.target!=='drop'?ent(w,m.target):null;const say=s=>{w.toast={pid,t:s}};
 const give=e=>{if(!w.ents.includes(e))w.ents.push(e);for(const o of bag)o.bi=(o.bi||0)+1;e.by=pid;e.bi=0};const full=()=>bag.length>=3&&(say('Hands full (3 items max) — drop something'),true);
 if(m.t==='buy'){const it=SHOP[m.item];if(!it||it.hide)return say('Not sold — fill your can at the sink');const n=Math.max(1,Math.min(10,m.n|0||1));if(w.money<it.p*n)return say('Not enough money');w.money-=it.p*n;for(let i=0;i<n;i++)w.pending.push({type:m.item,t:4+i*.5});w.sound='buy';return say(`Ordered ${n}× ${it.n} — arriving at the door`)}
 if(m.t==='paybill'){const U=w.util,tot=U.bills.reduce((a,b)=>a+b.amt,0);if(!tot)return say('No bills due');if(w.money<tot)return say(`Need $${tot} to pay utilities`);w.money-=tot;U.bills=[];const was=U.off;U.off=0;w.sound='cash';return say(`Paid utilities $${tot}`+(was?' — water & power back on':''))}
 if(m.t==='upgrade'){if(w.room>1)return;if(w.rep<5)return say('Need 5 reputation');if(w.money<500)return say('Need $500');w.money-=500;w.room=2;return say('Grow room expanded!')}
 if(m.t==='drop'){if(!c)return;c.by=0;c.bi=0;c.x=+m.x||0;c.z=+m.z||0;c.y=+m.y||0;c.ry=+m.ry||0;return}
 if(m.t==='cycle'){if(bag.length<2)return;const L=bag.length;if(m.sel!=null){const k=+m.sel;if(k>0&&k<L)for(const e of bag)e.bi=((e.bi||0)-k+L)%L;return}const d=m.d<0?1:L-1;for(const e of bag)e.bi=((e.bi||0)+d)%L;return}
 if(m.t!=='use')return;
 if(m.target==='bin'){const ep=c&&c.type==='pallet'&&!c.data.n;if(!c||c.type!=='trash'&&!ep)return say('Dumpster — bring bagged dead plants or empty pallets here');w.ents=w.ents.filter(e=>e!==c);w.sound='drop';return say(ep?'Empty pallet disposed':'Trash disposed')}
 if(m.target==='drop'){if(!c||c.type!=='packed')return say('Pack product into a jar first');const {s,g}=c.data;w.ents=w.ents.filter(e=>e!==c);
  const k=w.contracts.find(k=>k.s===s);if(k){k.got+=g;if(k.got>=k.g){w.money+=k.pay;w.rep+=k.g>=20?2:1;w.contracts=w.contracts.filter(x=>x!==k);say(`Contract done! +$${k.pay} · +rep`);w.sound='cash'}else say(`${k.shop}: ${k.got}/${k.g}g delivered`)}
  else{const v=g*4;w.money+=v;say(`No ${STRAINS[s].name} contract — sold on the spot for $${v}`);w.sound='cash'}return}
 if(!t)return;
 const mkIt=(type,data)=>({id:w.nid++,type,x:0,y:0,z:0,ry:0,data});
 if(t&&t.type==='sink'){if(!c||c.type!=='water')return say('Sink — hold the watering can here to fill it');if(!wet(w))return say('Water is shut off — pay the utility bill');const lv=c.data.w??0;if(lv>=CAN)return say('Can is full');const a=Math.min(FILL,CAN-lv);c.data.w=lv+a;w.util.gal+=a/CAN*GAL;if(c.data.w>=CAN){w.fx={k:'full',id:t.id};w.sound='check'}return}
 if(t&&t.type==='shelf'){const sl=t.data.slots=t.data.slots||[];if(c&&!m.only){if(['shelf','pallet','trash','sink'].includes(c.type))return say("That doesn't fit on a shelf");if(sl.filter(Boolean).length>=SLOTS)return say('Shelf is full');let i=sl.findIndex(x=>!x);if(i<0)i=sl.length;sl[i]={type:c.type,data:c.data,ry:+m.ry||0};w.ents=w.ents.filter(e=>e!==c);w.sound='drop';return say('Stored '+(SHOP[c.type]?.n||c.type)+' on the shelf')}
  let i=-1;for(let k=sl.length-1;k>=0;k--)if(sl[k]){i=k;break}if(i>=0){if(full())return;const it=sl[i];sl[i]=null;while(sl.length&&!sl.at(-1))sl.pop();give(mkIt(it.type,it.data));w.sound='pick';return say('Took '+(SHOP[it.type]?.n||it.type)+' off the shelf')}}
 if(t&&t.type==='pallet'&&t.data.n>0&&(!c||m.only||!m.only)){if(full())return;const k=t.data.it;t.data.n--;give(mkIt(k,SHOP[k].uses?{uses:SHOP[k].uses}:{}));w.sound='pick';return say(`Took ${SHOP[k].n} off the pallet (${t.data.n} left)`+(t.data.n?'':' — pallet empty, toss it in the dumpster'))}
 if(c){const use=()=>{if(c.data.uses!=null&&--c.data.uses<=0)w.ents=w.ents.filter(e=>e!==c)};const ct=c.type;
  if(t.type==='pot'&&ct==='gbag'){if(!t.data.plant?.dead)return say('Only dead plants go in the bag');if(c.data.uses>1&&full())return;const bad=(t.data.crack||0)>.6;t.data.plant=null;if(bad){t.data.soil=0;t.data.crack=0;t.data.moist=0}use();c.bi=1;give({id:w.nid++,type:'trash',x:0,y:0,z:0,ry:0,data:{}});w.sound='pick';return say('Bagged the dead plant — toss it in the dumpster'+(bad?' · soil was ruined, add fresh soil':''))}
  if(t.type==='pot'&&(ct==='soil'||ct.startsWith('seed_')||ct==='water'||ct==='nutr')){const d=t.data;
   if(ct==='soil'){if(d.soil)return say('Pot already has soil');d.soil=1;d.moist=30;d.crack=0;use();w.sound='pour';return say('Filled pot with soil')}
   if(ct.startsWith('seed_')){if(!d.soil)return say('Add soil first');if(d.plant)return say('Already planted');d.plant={s:ct.slice(5),age:0,water:40,nutr:30,health:80};use();return say('Planted '+STRAINS[d.plant.s].name)}
   if(ct==='water'){if(!d.soil)return say('Add soil first');if((c.data.w??0)<=0)return say('Can is empty — refill it at the sink');if(d.plant?.dead)return say('Plant is dead — bag it first');const m0=d.moist??0;if(m0>=98){w.fx={k:'spill',id:t.id};return}
    d.moist=m0+POUR>=98?100:Math.min(100,m0+POUR);if(d.plant){d.plant.water=d.moist;d.plant.dry=0;d.plant.wilt=0}c.data.w=Math.max(0,(c.data.w??0)-POUR);if(c.data.w<=0)say('Can is empty — refill it at the sink')
    if(d.moist>=100){w.fx={k:'full',id:t.id};w.sound='check'}return}
   if(ct==='nutr'){if(!d.plant)return say('Nothing to feed');d.plant.nutr=100;use();w.sound='pour';return say('Fed nutrients')}}
  if(t.type==='rack'&&ct==='wetbud'){const sl=t.data.slots=t.data.slots||[];if(sl.length>=4)return say('Rack is full');sl.push({s:c.data.s,g:c.data.g,t:DRY});w.ents=w.ents.filter(e=>e!==c);return say('Hung to dry (1 min)')}
  if(t.type==='scale'&&ct==='drybud'){const j=w.ents.find(e=>e.type==='jars'&&!e.by);if(!j)return say('Need a Jar Box placed in the shed');c.type='packed';if(--j.data.uses<=0)w.ents=w.ents.filter(e=>e!==j);w.sound='cash';return say(`Weighed & packed: ${c.data.g}g ${STRAINS[c.data.s].name}`)}
  if(m.only)return say("Can't use "+(SHOP[ct]?.n||ct)+' on that')}
 if(t.type==='pot'&&stage(t.data.plant)==='ready'){if(full())return;const p=t.data.plant,g=Math.max(1,Math.round(STRAINS[p.s].g*(.35+.65*p.health/100)));t.data.plant=null;t.data.soil=0;
  give({id:w.nid++,type:'wetbud',x:0,y:0,z:0,ry:0,by:pid,data:{s:p.s,g}});return say(`Harvested ${g}g wet ${STRAINS[p.s].name} — hang it to dry`)}
 if(t.type==='pot'&&t.data.plant?.dead)return say('Dead plant — use a Garbage Bag on it (laptop shop)');
 if(t.type==='rack'){const sl=t.data.slots||[];const i=sl.findIndex(s=>s.t<=0);if(i>=0){if(full())return;const s=sl.splice(i,1)[0];give({id:w.nid++,type:'drybud',x:0,y:0,z:0,ry:0,data:{s:s.s,g:s.g}});return say(`Took ${s.g}g dried bud — pack it at the scale`)}
  if(sl.length)return say('Still drying…')}
 if(t.by||t.data.fixed||full())return;if(t.type==='shelf'&&t.data.slots?.some(Boolean))return say('Empty the shelf before moving it');give(t);w.sound='pick'}
let nid=1;
wss.on('connection',ws=>{const me={ws,id:nid++,name:'Grower'};let room=null;
 const send=m=>ws.send(JSON.stringify(m));
 ws.on('message',async d=>{let m;try{m=JSON.parse(d)}catch{return}
  if(m.t==='host'||m.t==='join'){me.name=String(m.name||'Grower').slice(0,10);me.look=okLook(m.look);
   if(m.t==='host'){const u=await who(m.token);let w=null,sid=null,sname='Farm';
    if(u&&m.save){sid=String(m.save).replace(/\W/g,'');const sv=await store.get('save:'+u+':'+sid);if(!sv)return send({t:'err',e:'Save not found'});w=sv.w;sname=sv.name;w.log=['Welcome back — farm loaded (Day '+w.day+')']}
    else if(u){sid=crypto.randomBytes(5).toString('hex');sname=String(m.sname||'').slice(0,20)||('Farm '+new Date().toISOString().slice(0,10))}
    if(room&&room.players.includes(me))return;room={code:mk(),players:[],host:me.id,started:false,w:w||newWorld(),owner:u,sid,sname};rooms.set(room.code,room)}
   else{const r=rooms.get(String(m.code||'').toUpperCase());if(!r)return send({t:'err',e:'Room not found'});if(r.players.length>=4)return send({t:'err',e:'Room full'});room=r}
   room.players.push(me);send({t:'joined',code:room.code,id:me.id,host:room.host,started:room.started,save:room.owner?{id:room.sid,name:room.sname,owner:room.owner}:null});bc(room,{t:'roster',pl:roster(room),host:room.host});
   if(room.started)send({t:'start',pl:roster(room)})}
  else if(!room)return;
  else if(m.t==='save'&&room.owner){await saveRoom(room);send({t:'saved'})}
  else if(m.t==='start'&&me.id===room.host){room.started=true;room.owner&&saveRoom(room);bc(room,{t:'start',pl:roster(room)})}
  else if(m.t==='s'){m.id=me.id;bc(room,m,me)}
  else if(m.t==='pause'){me.paused=!!m.v}
  else if(m.t==='look'){me.look=okLook(m.look);if(me.look)bc(room,{t:'look',id:me.id,look:me.look},me)}
  else if(m.t==='spend'){const n=Math.max(0,m.n|0);if(room.w.money>=n){room.w.money-=n;room.w.toast={pid:me.id,t:'Bought '+String(m.why||'item').slice(0,30)+' (-$'+n+')'}}}
  else if(m.t==='dbg'){if(!process.env.BT_DEBUG)return;const w=room.w;if(m.id){const e=w.ents.find(e=>e.id===m.id);if(e?.data.plant)Object.assign(e.data.plant,{age:m.age,health:100,water:100,nutr:100})}if(m.dry)w.ents.forEach(e=>(e.data.slots||[]).forEach(s=>s.t=0));if(m.contract)w.contracts[0].s=m.contract;if(m.spawn){const q=m.spawn;w.ents.push({id:w.nid++,type:'pot',x:q.x,y:0,z:q.z,ry:0,by:0,data:{soil:1,moist:q.water??100,crack:q.crack||0,plant:q.age==null?null:{s:q.s,age:q.age,water:q.water??100,nutr:100,health:q.health??100,dead:!!q.dead,dry:q.dry||0,wilt:0}}})}if(m.ff)for(let i=0;i<m.ff*10;i++)tick(w,.1);if(m.give)w.ents.push({id:w.nid++,type:m.give,x:0,y:0,z:0,ry:0,by:me.id,bi:-1,data:/bud|packed/.test(m.give)?{s:'owl',g:12}:SHOP[m.give]?.uses?{uses:SHOP[m.give].uses}:{}}),norm(w,me.id);if(m.set){const e=ent(w,m.set.id);Object.assign(e.data,m.set.d||{});if(m.set.p)Object.assign(e.data.plant,m.set.p)}if(m.money)w.money+=m.money;if(m.bill)bill(w);if(m.overdue){for(const b of w.util.bills)b.due=0;w.util.off=3}if(m.give==='water')w.ents.at(-1).data.w=CAN;if(m.give==='shelf')w.ents.at(-1).data.slots=[];if(m.pallet){w.ents.push({id:w.nid++,type:'pallet',x:m.pallet.x,y:0,z:m.pallet.z,ry:0,by:0,data:{it:m.pallet.it,n:SHOP['pal_'+m.pallet.it].k}})}if(m.place){const q=m.place;w.ents.push({id:w.nid++,type:q.type,x:q.x,y:0,z:q.z,ry:q.ry||0,by:0,data:q.data||{}})}room.dirty=true}
  else{act(room.w,me.id,m);room.dirty=true}
 });
 ws.on('close',()=>{if(!room)return;saveRoom(room);room.w.ents.forEach(e=>{if(e.by===me.id){e.by=0}});room.players=room.players.filter(p=>p!==me);if(!room.players.length)rooms.delete(room.code);else{if(room.host===me.id)room.host=room.players[0].id;bc(room,{t:'roster',pl:roster(room),host:room.host,left:me.id})}});
});
setInterval(()=>{for(const r of rooms.values())saveRoom(r)},+process.env.BT_AUTOSAVE_MS||45000);
let acc=0;setInterval(()=>{acc++;for(const r of rooms.values()){if(!r.started)continue;if(!r.players.every(p=>p.paused))tick(r.w,.1);if(r.dirty||acc%3==0){r.dirty=false;const w=r.w;bc(r,{t:'w',w:{money:w.money,rep:w.rep,day:w.day,min:w.min,room:w.room,ents:w.ents,contracts:w.contracts,log:w.log,toast:w.toast,sound:w.sound,fx:w.fx,pending:w.pending.length,util:w.util}});w.log=[];w.toast=null;w.sound=null;w.fx=null}}},100);
const shutdown=async()=>{await Promise.all([...rooms.values()].map(saveRoom));process.exit(0)};process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
const PORT=process.env.PORT||3000;server.listen(PORT,()=>console.log('Bud Together on :'+PORT));
