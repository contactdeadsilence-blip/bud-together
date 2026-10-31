import {SLOTS,CAN,FILL,GAL,RATE,STRAINS,SHOP,READY,DRY,stage,WILT0,WILT1,DIE,POUR,DRAIN,DRAIN_EMPTY,NUTR,THIRSTY,HFLOOR,BAGCAP,STYLE,DECOR,defDecor,ROOMB,rackSnap,RACKN,MINPS,START_CASH,SURFS,BIG,JOINT,WAKE,canSleep,MAXORD,seedOf,settle,grade,gradeOk,prodQ,CURE,GRADES,inGH,harvQ,BASE,MUTS,rollMut,rollPack,makeCross,regGen,collPct,MILES,RAR,NW1,NW2} from '../src/rules.js';import express from 'express';import {WebSocketServer} from 'ws';import http from 'http';import crypto from 'crypto';import {openStore} from './store.js';import path from 'path';import {fileURLToPath} from 'url';
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
function snap(w){const c=JSON.parse(JSON.stringify(w));for(const e of c.ents)if(e.by){e.by=0;e.bi=0;e.x=PAD.x+(Math.random()-.5);e.z=PAD.z+(Math.random()-.5);e.y=0}c.log=[];delete c.toast;delete c.sound;delete c.fx;delete c.sleepers;delete c._sv;return c}
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
function newWorld(){const w={money:START_CASH,rep:0,day:1,min:8*60,room:1,ents:[],nid:1,contracts:[],pending:[],log:[],util:{gal:0,kwh:0,bills:[],off:0},decor:defDecor()};
 const add=(type,x,z,data={})=>w.ents.push({id:w.nid++,type,x,y:0,z,ry:0,by:0,data:{...data,...(SHOP[type]?.uses?{uses:SHOP[type].uses}:{})}});
 add('pot',-1,-3);add('pot',0,-3);add('soil',2.5,-3.8);add('seed_haze',1.5,-3.9);add('sink',3.55,-1.2,{fixed:1});w.ents.at(-1).ry=-Math.PI/2;add('water',3.3,-.45,{w:CAN});add('light',-.5,-3.9);add('gbag',3.3,-3.7);addV11(w);
 for(let i=0;i<3;i++)newContract(w);return w}
function addV11(w){const has=t=>w.ents.some(e=>e.type===t);const add=(type,x,z,data={},ry=0)=>w.ents.push({id:w.nid++,type,x,y:0,z,ry,by:0,data});
 if(!has('desk'))add('desk',-3.6,-2,{fixed:1,items:[]});if(!has('bed'))add('bed',-3.05,3.6,{},Math.PI/2);if(!has('tcan'))add('tcan',-2.9,-4.55);if(!has('papers'))add('papers',-3.45,-1.55,{uses:10})}
function newContract(w,sp){const ks=BASE,s=ks[Math.random()*ks.length|0],big=w.rep>=5&&Math.random()<.5;const g=(big?14:5)+Math.round(Math.random()*(big?20:8))+w.rep;
 const pre=w.rep>=1&&Math.random()<.35,mins=w.rep>=6?['B','A','A+']:w.rep>=2?['C','B','A']:['D','C','B'],min=mins[Math.random()*3|0],gm=GRADES.find(x=>x[0]==min)[2];w.contracts.push({id:w.nid++,shop:SHOPS[Math.random()*SHOPS.length|0],s,g,min,got:0,pay:Math.round(g*STRAINS[s].ppg*(1.4+Math.min(w.rep,20)*.04)*(pre?1.25:1)*(.6+.4*gm)),due:w.day+(sp?2:6),...(pre?{pre:1}:{})});if(sp){const c=w.contracts.pop(),gi=GRADES.findIndex(x=>x[0]==c.min);c.min=GRADES[Math.max(0,gi-1)][0];c.pay=Math.round(c.pay*1.7);c.sp=1;(w.offers||(w.offers=[])).push(c)}}
const ent=(w,id)=>w.ents.find(e=>e.id===id);
const near=(a,b,r)=>Math.hypot(a.x-b.x,a.z-b.z)<r;
const isDay=w=>w.min>=6*60&&w.min<19*60;
function outdoor(w,e){const B=ROOMB(w.room);return e.x<B.x0||e.x>B.x1||e.z<B.z0||e.z>B.z1}
function lit(w,e){if(powered(w)&&w.ents.some(l=>l.type==='light'&&!l.by&&near(l,e,3.2)))return 1;if(inGH(e)&&!isDay(w)&&powered(w))return 1;/* v13a greenhouse grow lights at night */if(outdoor(w,e)&&isDay(w))return inGH(e)?'gh':'sun';return 0}
function tick(w,dt){const U=w.util;if(!(U.off&2))U.kwh+=w.ents.filter(e=>e.type=='light'&&!e.by).length*RATE.light*dt*MINPS/60;w.min+=dt*MINPS;if(w.min>=1440){w.min-=1440;w.day++;bill(w);
  for(const b of U.bills)if(b.due<w.day&&!(U.off&3)){U.off=3;msg(w,'⚠ Utility bill overdue — water & power are OFF until you pay (laptop → Utilities)')}
  w.contracts=w.contracts.filter(c=>{if(c.due<w.day){w.rep=Math.max(0,w.rep-1);msg(w,`Missed contract for ${c.shop} (-1 rep)`);return false}return true});w.offers=(w.offers||[]).filter(c=>c.due>=w.day)}
 if((w.offers||[]).length<2&&Math.random()<dt/600)newContract(w,1);/* v13a board specials: 1-2 game days */
 while(w.contracts.length<3+Math.min(3,w.rep>>2))newContract(w);
 w.pending=w.pending.filter(p=>{if((p.t-=dt)>0)return true;const S=SHOP[p.type],pal=S.pal;const e={id:w.nid++,type:pal?'pallet':S.ent||p.type,x:PAD.x+(Math.random()-.5)*1.4,y:0,z:PAD.z+(Math.random()-.5)*1.2,ry:pal?0:Math.random()*6,by:0,data:pal?{it:pal,n:S.k}:S.uses?{uses:S.uses}:p.type=='shelf'?{slots:[]}:p.type=='table'?{items:[]}:{}};if(S.dat)Object.assign(e.data,S.dat);w.ents.push(e);msg(w,SHOP[p.type].n+' delivered at the door');return false});
 for(const e of w.ents){const pl=e.data.plant,d=e.data;
  if(e.type==='pot'&&d.soil){if(d.moist==null)d.moist=pl?pl.water:30;const live=pl&&!pl.dead;const ex=outdoor(w,e)&&!inGH(e)&&isDay(w)?1.3:1;d.moist=Math.max(0,d.moist-dt*100*ex/Math.sqrt(d.sz||1)/(live?DRAIN:DRAIN_EMPTY));
   if(d.moist<25)d.crack=Math.min(1,(d.crack||0)+dt*(25-d.moist)/25/240);else if(d.moist>=60)d.crack=Math.max(0,(d.crack||0)-dt/20);
   if(live){pl.water=d.moist;pl.dry=d.moist<=0?(pl.dry||0)+dt:Math.max(0,(pl.dry||0)-dt*3);pl.wilt=Math.min(1,Math.max(0,(pl.dry-WILT0)/(WILT1-WILT0)));if(d.moist<THIRSTY&&!pl.warn){pl.warn=1;msg(w,'A plant is thirsty — water it soon')}if(pl.wilt>0&&pl.warn<2){pl.warn=2;msg(w,'⚠ A plant is WILTING — water it now to save it')}if(d.moist>=THIRSTY+10)pl.warn=0;if(pl.dry>=DIE){pl.dead=true;msg(w,'A plant died of thirst')}}}
  if(e.type==='pot'&&pl&&!pl.dead){const L=lit(w,e),S=STRAINS[pl.s]||STRAINS.haze,auto=pl.ty==='a',night=!L&&outdoor(w,e)&&!isDay(w),df=S.diff||1;pl.lit=L;pl.nutr=Math.max(0,pl.nutr-dt*100/NUTR);pl.burn=Math.max(0,(pl.burn||0)-dt/400);
   const grow=pl.water>0&&pl.age<READY;if(grow)pl.age+=dt*S.speed*(auto?1.35:1)*(L?1:auto?.7:night?.15:.3)*(pl.nutr>0?1:.7);
   if(pl.nutr<5||(!L&&!night&&!auto)||pl.burn>.5)pl.health=Math.max(Math.min(pl.health,HFLOOR),pl.health-dt*.25*(.7+.3*df));else pl.health=Math.min(100,pl.health+dt*.6/(.8+.2*df));
   if(grow){const fl=pl.age>=170,fit=pl.fd==='g'?(fl?.3:1):pl.fd==='b'?(fl?1:.4):pl.fd?.6:0,sc=pl.health/100*.6+(L==='gh'?.17:L?.15:night?.12:0)+fit*.15+(1-(pl.burn||0))*.1;pl.qs=(pl.qs||0)+sc*dt;pl.qt=(pl.qt||0)+dt}}
  if(e.type==='packed'&&(e.data.cure||0)<1)e.data.cure=Math.min(1,(e.data.cure||0)+dt/CURE);
  if(e.type==='rack')for(const s of e.data.slots||[])if(s.t>0)s.t=Math.max(0,s.t-dt)}}
function msg(w,t){w.log.push(t)}
// v12: one order path for the laptop shop and the Quick Bud phone app (validated, priced and delivered server-side)
function order(w,m,say){const L=[];for(const x of Array.isArray(m.items)?m.items.slice(0,40):[]){const it=SHOP[x?.k];if(!it)return say('Unknown item');if(it.hide)return say('Not sold — fill your can at the sink');const n=Math.max(1,Math.min(MAXORD,x.n|0||1));const o=L.find(l=>l.k===x.k);if(o)o.n=Math.min(MAXORD,o.n+n);else L.push({k:x.k,n})}
 if(!L.length)return say('Cart is empty');const tot=L.reduce((a,l)=>a+SHOP[l.k].p*l.n,0);if(w.money<tot)return say(`Not enough money — need $${tot}`);w.money-=tot;const oid=w.nid++,os=w.orders??=[];let i=0;
 for(const l of L)for(let k=0;k<l.n;k++)w.pending.push({type:l.k,t:4+(i++)*.5,oid});os.unshift({id:oid,via:m.via==='phone'?'phone':'laptop',day:w.day,min:Math.round(w.min),items:L,tot,n:i});os.length=Math.min(os.length,12);w.sound='buy';
 const units=L.reduce((a,l)=>a+l.n,0);return say(L.length===1?`Ordered ${L[0].n}× ${SHOP[L[0].k].n} — arriving at the door`:`Order #${oid} placed: ${units} items, $${tot} — arriving at the door`)}
const orderView=w=>(w.orders||[]).map(o=>{const P=w.pending.filter(p=>p.oid===o.id);return{...o,left:P.length,eta:P.length?Math.ceil(Math.max(...P.map(p=>p.t))):0}});
function trash(w,c,say){w.ents=w.ents.filter(e=>e!==c);w.sound='drop';if(c.type==='water'&&!w.ents.some(e=>e.type==='water'))w.ents.push({id:w.nid++,type:'water',x:3.3,y:0,z:-.45,ry:0,by:0,data:{w:0}});
 return say(c.type==='dirtbag'?`Dumped ${c.data.f} pot${c.data.f>1?'s':''} of old dirt`:c.type==='trash'?'Trash disposed':c.type==='pallet'&&!c.data.n?'Empty pallet disposed':c.type==='water'?'Tossed the can — a fresh one is by the sink':'Threw away '+(SHOP[c.type]?.n||c.type))}
const clampN=(v,a)=>Math.max(-a,Math.min(a,+v||0));
function surf(w,t,c,m,bag,give,full,say){const S=SURFS[t.type],it=t.data.items??=[];
 if(c&&c.type==='drybud'&&m.roll){const pp=bag.find(e=>e.type==='papers')||w.ents.find(e=>e.type==='papers'&&!e.by&&Math.hypot(e.x-t.x,e.z-t.z)<1.6)||null;const onT=it.findIndex(x=>x.type==='papers');
  if(!pp&&onT<0)return say('Need Rolling Papers (in hand or on this table)'),1;const n=c.data.g;c.type='joints';c.data={s:c.data.s,n};if(pp){if(--pp.data.uses<=0)w.ents=w.ents.filter(e=>e!==pp)}else if(--it[onT].data.uses<=0)it.splice(onT,1);w.sound='cash';w.fx={k:'roll',id:t.id};return say(`Rolled ${n} ${STRAINS[c.data.s].name} pre-rolls`),1}
 if(c&&!m.only){if(BIG.includes(c.type))return say("That's too big for the table"),1;if(it.length>=S.max)return say('Table is full'),1;it.push({type:c.type,data:c.data,x:+clampN(m.lx,S.w/2-.08).toFixed(2),z:+clampN(m.lz,S.d/2-.08).toFixed(2),ry:+(+m.ry||0).toFixed(2)});w.ents=w.ents.filter(e=>e!==c);w.sound='drop';return say('Set '+(SHOP[c.type]?.n||c.type)+' on the '+(t.type==='desk'?'desk':'table')),1}
 if(it.length){if(full())return 1;let i=it.length-1;if(m.lx!=null){let b=1e9;it.forEach((x,k)=>{const d=Math.hypot(x.x-m.lx,x.z-m.lz);if(d<b){b=d;i=k}})}const x=it.splice(i,1)[0];give({id:w.nid++,type:x.type,x:0,y:0,z:0,ry:0,data:x.data});w.sound='pick';return say('Took '+(SHOP[x.type]?.n||x.type)),1}
 if(t.type==='desk')return say('Desk — set items on it to store them'),1;if(t.data.items.length)return 1;return undefined}
function sleepReq(w,pid,m,say){const S=w.sleepers??=[];const i=S.indexOf(pid);if(m.on===false||m.on==null&&i>=0){if(i>=0)S.splice(i,1);return say('You got out of bed')}
 if(!canSleep(w.min))return say("You're not tired — you can sleep after 7 PM");if(i<0)S.push(pid);return say('In bed — waiting for everyone to sleep…')}
// skip to next morning: run the sim in 1s steps; plants that were watered can't die or wilt from the skip
function doSleep(w){const until=(w.min>=WAKE?1440-w.min+WAKE:WAKE-w.min),sec=Math.round(until/MINPS);const safe=w.ents.filter(e=>e.type==='pot'&&e.data.plant&&!e.data.plant.dead&&(e.data.moist??0)>=THIRSTY);
 for(let i=0;i<sec;i++){tick(w,1);for(const e of safe){const d=e.data,p=d.plant;if(!p)continue;p.dead=false;p.dry=0;p.wilt=0;d.moist=Math.max(d.moist,THIRSTY+5);p.water=d.moist;d.crack=0}}
 w.min=WAKE;w.sleepers=[];msg(w,`☀ Good morning! Day ${w.day} — you slept ${Math.round(until/60)} hours`);w.sound='check';w.slept=(w.slept||0)+1}
function bill(w){const U=w.util,wa=+(U.gal*RATE.water).toFixed(2),el=+(U.kwh*RATE.kwh).toFixed(2),amt=Math.ceil(RATE.base+wa+el);U.bills.push({id:w.nid++,day:w.day-1,gal:+U.gal.toFixed(1),kwh:+U.kwh.toFixed(1),wa,el,amt,due:w.day});U.gal=0;U.kwh=0;msg(w,`💡 Utility bill for Day ${w.day-1}: $${amt} — pay by end of Day ${w.day} (laptop → Utilities)`)}
const powered=w=>!(w.util.off&2),wet=w=>!(w.util.off&1);
function norm(w,pid){w.ents.filter(e=>e.by===pid).sort((a,b)=>(a.bi||0)-(b.bi||0)).forEach((e,i)=>e.bi=i)}
function act(w,pid,m){act0(w,pid,m);norm(w,pid)}
function act0(w,pid,m){const bag=w.ents.filter(e=>e.by===pid);const c=bag.find(e=>!e.bi)||null,t=m.target&&m.target!=='drop'?ent(w,m.target):null;const say=s=>{w.toast={pid,t:s}};
 const give=e=>{if(!w.ents.includes(e))w.ents.push(e);for(const o of bag)o.bi=(o.bi||0)+1;e.by=pid;e.bi=0};const full=()=>bag.length>=3&&(say('Hands full (3 items max) — drop something'),true);
 if(m.t==='buy')m={t:'order',items:[{k:m.item,n:m.n}],via:'laptop'};
 if(m.t==='order')return order(w,m,say);
 if(m.t==='acceptc'){const i=(w.offers||[]).findIndex(c=>c.id===m.id);if(i<0)say('That notice is gone');else if(w.contracts.length>=8)say('Too many active contracts');else{const c=w.offers.splice(i,1)[0];w.contracts.push(c);say(`Accepted special: ${c.g}g ${STRAINS[c.s].name} for ${c.shop} — $${c.pay}`);w.sound='ui'}}else if(m.t==='paybill'){const U=w.util,tot=U.bills.reduce((a,b)=>a+b.amt,0);if(!tot)return say('No bills due');if(w.money<tot)return say(`Need $${tot} to pay utilities`);w.money-=tot;U.bills=[];const was=U.off;U.off=0;w.sound='cash';return say(`Paid utilities $${tot}`+(was?' — water & power back on':''))}
 if(m.t==='claim'){const i=m.i|0,M=MILES[i],R=w.rew??=[];if(!M||R[i])return;if(collPct(w)<M[0])return say(`Need ${M[0]}% collection`);R[i]=1;w.money+=M[1];w.rep+=M[2];w.sound='cash';return say(`Journal reward: +$${M[1]} ★+${M[2]}`)}
 if(m.t==='gname'){const G=w.gen?.[m.k],[a,b]=String(m.name||'').split(' ');if(!G||!NW1.includes(a)||!NW2.includes(b))return;G.name=a+' '+b;G.named=1;return say(`Strain registered as ${G.name}`)}
 if(m.t==='upgrade'){if(w.room>1)return;if(w.rep<5)return say('Need 5 reputation');if(w.money<500)return say('Need $500');w.money-=500;w.room=2;return say('Grow room expanded!')}
 if(m.t==='drop'){if(!c)return;c.by=0;c.bi=0;const P=settle(w,+m.x||0,+m.z||0,(+m.y||0)+.1);c.x=P.x;c.z=P.z;c.y=P.y;c.ry=+m.ry||0;if(c.type==='seedrack'){const S=rackSnap(ROOMB(w.room),c.x,c.z);c.x=S.x;c.z=S.z;c.ry=S.ry;c.y=0}return}
 if(m.t==='cycle'){if(bag.length<2)return;const L=bag.length;if(m.sel!=null){const k=+m.sel;if(k>0&&k<L)for(const e of bag)e.bi=((e.bi||0)-k+L)%L;return}const d=m.d<0?1:L-1;for(const e of bag)e.bi=((e.bi||0)+d)%L;return}
 if(m.t==='dstyle'||m.t==='dplace'||m.t==='dmove'||m.t==='drem')return decor(w,m,say);
 if(m.t==='trash'){if(!c)return;return trash(w,c,say)}
 if(m.t==='sleep')return sleepReq(w,pid,m,say);
 if(m.t!=='use')return;
 if(m.target==='bin'){if(!c)return say('Dumpster — hold anything here to throw it away');return trash(w,c,say)}
 if(m.target==='drop'){if(!c||c.type!=='packed'&&c.type!=='joints')return say('Pack product into a jar or roll pre-rolls first');const {s}=c.data,g=c.type==='joints'?c.data.n:c.data.g,pre=c.type==='joints';
  const q=prodQ(c.data),G=grade(q);const k=w.contracts.find(k=>k.s===s&&!!k.pre===pre&&gradeOk(q,k.min));const lo=w.contracts.find(k=>k.s===s&&!!k.pre===pre);if(!k&&lo&&!c.data.wn){c.data.wn=1;return say(`${lo.shop} wants grade ${lo.min}+ — this is grade ${G[0]}. Cure it longer, or drop it again to sell on the spot`)}w.ents=w.ents.filter(e=>e!==c);if(k){k.got+=g;if(pre&&k.got<k.g)say(`${k.shop}: ${k.got}/${k.g} pre-rolls delivered`);if(k.got>=k.g){w.money+=k.pay;w.rep+=k.g>=20?2:1;w.contracts=w.contracts.filter(x=>x!==k);say(`Contract done! +$${k.pay} · +rep`);w.sound='cash'}else if(!pre)say(`${k.shop}: ${k.got}/${k.g}g delivered`)}
  else{const v=Math.round(g*(pre?JOINT:4)*(c.data.q==null?1:G[2])*(1+(STRAINS[s]?.rar||0)*.25));w.money+=v;say(`No ${STRAINS[s].name}${pre?' pre-roll':''} contract — sold on the spot (grade ${G[0]}) for $${v}`);w.sound='cash'}return}
 if(!t)return;
 const mkIt=(type,data)=>({id:w.nid++,type,x:0,y:0,z:0,ry:0,data});
 if(t&&t.type==='tcan'&&c&&!m.only)return trash(w,c,say);
 if(t&&t.type==='bed'&&!c)return sleepReq(w,pid,{on:!(w.sleepers||[]).includes(pid)},say);
 if(t&&(t.type==='table'||t.type==='desk')){const r=surf(w,t,c,m,bag,give,full,say);if(r!==undefined)return}
 if(t&&t.type==='sink'){if(!c||c.type!=='water')return say('Sink — hold the watering can here to fill it');if(!wet(w))return say('Water is shut off — pay the utility bill');const lv=c.data.w??0;if(lv>=CAN)return say('Can is full');const a=Math.min(FILL,CAN-lv);c.data.w=lv+a;w.util.gal+=a/CAN*GAL;if(c.data.w>=CAN){w.fx={k:'full',id:t.id};w.sound='check'}return}
 if(t&&t.type==='seedrack'){const sl=t.data.sl=t.data.sl||[];const k=Math.max(0,Math.min(5,m.slot|0));if(c&&!m.only){if(!c.type.startsWith('seed_'))return say('Only seed packets go in the seed rack');let i=sl[k]&&sl[k].k===c.type&&sl[k].n.length<RACKN?k:sl.findIndex(s=>s&&s.k===c.type&&s.n.length<RACKN);if(i<0)i=!sl[k]?k:[0,1,2,3,4,5].find(j=>!sl[j]);if(i==null||i<0)return say('Seed rack is full');sl[i]=sl[i]||{k:c.type,n:[]};sl[i].n.push(c.data);w.ents=w.ents.filter(e=>e!==c);w.sound='drop';return say(`Stored ${SHOP[c.type]?.n||'seeds'} in slot ${i+1} (${sl[i].n.length}/${RACKN})`)}
  const s=sl[k];if(!s?.n.length)return say('That rack slot is empty');if(full())return;give(mkIt(s.k,s.n.pop()));const left=s.n.length;if(!left)sl[k]=null;w.sound='pick';return say(`Took ${SHOP[s.k]?.n||'seeds'} (${left} left)`)}
 if(t&&t.type==='shelf'){const sl=t.data.slots=t.data.slots||[];if(c&&!m.only){if(['seedrack','shelf','pallet','trash','sink','dirtbag','table','bed','tcan'].includes(c.type))return say("That doesn't fit on a shelf");if(sl.filter(Boolean).length>=SLOTS)return say('Shelf is full');let i=sl.findIndex(x=>!x);if(i<0)i=sl.length;sl[i]={type:c.type,data:c.data,ry:+m.ry||0};w.ents=w.ents.filter(e=>e!==c);w.sound='drop';return say('Stored '+(SHOP[c.type]?.n||c.type)+' on the shelf')}
  let i=-1;for(let k=sl.length-1;k>=0;k--)if(sl[k]){i=k;break}if(i>=0){if(full())return;const it=sl[i];sl[i]=null;while(sl.length&&!sl.at(-1))sl.pop();give(mkIt(it.type,it.data));w.sound='pick';return say('Took '+(SHOP[it.type]?.n||it.type)+' off the shelf')}}
 if(t&&t.type==='pallet'&&c&&!m.only&&c.type===t.data.it){const S=Object.values(SHOP).find(s=>s.pal===c.type);if(S&&t.data.n>=S.k)return say('Pallet is full');if(c.data.uses!=null&&SHOP[c.type].uses&&c.data.uses<SHOP[c.type].uses)return say('Only unused items go back on the pallet');t.data.n=(t.data.n||0)+1;w.ents=w.ents.filter(e=>e!==c);w.sound='drop';return say(`Put ${SHOP[c.type].n} back on the pallet (${t.data.n})`)}
 if(t&&t.type==='gbag'&&!t.by&&c?.type!=='gbag'){if(c?.type==='gbag1'&&!m.only){t.data.uses=(t.data.uses||0)+1;w.ents=w.ents.filter(e=>e!==c);return say(`Put the bag back (${t.data.uses} left)`)}if(full())return;t.data.uses=(t.data.uses??5)-1;if(t.data.uses<=0)w.ents=w.ents.filter(e=>e!==t);give({id:w.nid++,type:'gbag1',x:0,y:0,z:0,ry:0,data:{}});w.sound='pick';return say(`Took one garbage bag (${Math.max(0,t.data.uses)} left in the box)`)}
 if(t&&t.type==='pallet'&&t.data.n>0&&(!c||m.only||!m.only)){if(full())return;const k=t.data.it;t.data.n--;give(mkIt(k,SHOP[k].uses?{uses:SHOP[k].uses}:{}));w.sound='pick';return say(`Took ${SHOP[k].n} off the pallet (${t.data.n} left)`+(t.data.n?'':' — pallet empty, toss it in the dumpster'))}
 if(c){const use=()=>{if(c.data.uses!=null&&--c.data.uses<=0)w.ents=w.ents.filter(e=>e!==c)};const ct=c.type;
 if(t?.type==='pot'&&ct==='brush'){const p=t.data.plant;if(!p||p.dead)return say('Brush a living flowering plant');if(p.age<170)return say('Plant must be flowering to breed');if(!c.data.pol){c.data.pol=p.s;return say(`Collected ${STRAINS[p.s].name} pollen — brush a different flowering strain`)}if(c.data.pol===p.s)return say('Same strain — pick a different strain to cross');if(p.x)return say('Already pollinated');p.x=c.data.pol;c.data.pol=null;use();return say(`Pollinated with ${STRAINS[p.x].name} — harvest it for cross seeds`)}
  if(t.type==='pot'&&(ct==='gbag'||ct==='gbag1'||ct==='dirtbag')&&!t.data.plant?.dead){const d=t.data;if(d.plant)return say("Can't bag a living plant");if(!d.soil)return say('Pot is already empty — add fresh soil');
   const emp=()=>{d.soil=0;d.used=0;d.moist=0;d.crack=0};w.sound='pour';
   if(ct==='dirtbag'){if(c.data.f>=BAGCAP)return say('Bag is full — throw it in the dumpster');c.data.f++;emp();return say(`Dumped the soil — bag ${c.data.f}/${BAGCAP}`+(c.data.f>=BAGCAP?' · full, take it to the dumpster':''))}
   if(ct==='gbag1'){c.type='dirtbag';c.data={f:1}}else{if(c.data.uses>1&&full())return;use();c.bi=1;give({id:w.nid++,type:'dirtbag',x:0,y:0,z:0,ry:0,data:{f:1}})}emp();return say(`Dumped the soil into a bag (1/${BAGCAP}) — pot is empty, add fresh soil`)}
  if(t.type==='pot'&&ct==='dirtbag')return say('Bag the dead plant with a fresh Garbage Bag first');
  if(t.type==='pot'&&(ct==='gbag'||ct==='gbag1')){if(!t.data.plant?.dead)return say('Only dead plants go in the bag');if(ct==='gbag'&&c.data.uses>1&&full())return;const bad=(t.data.crack||0)>.6;t.data.plant=null;if(bad){t.data.soil=0;t.data.crack=0;t.data.moist=0}else t.data.used=1;if(ct==='gbag1'){c.type='trash';c.data={}}else{use();c.bi=1;give({id:w.nid++,type:'trash',x:0,y:0,z:0,ry:0,data:{}})}w.sound='pick';return say('Bagged the dead plant — toss it in the dumpster'+(bad?' · soil was ruined, add fresh soil':' · dump the old soil with another bag'))}
  if(t.type==='pot'&&(ct==='soil'||ct.startsWith('seed_')||ct==='water'||ct==='nutr')){const d=t.data;
   if(ct==='soil'){if(d.soil)return say(d.used?'Old soil in the pot — dump it into a Garbage Bag first':'Pot already has soil');d.soil=1;d.used=0;d.sq=c.data.sq||0;d.moist=30;d.crack=0;use();w.sound='pour';return say('Filled pot with soil')}
   if(ct.startsWith('seed_')){if(!d.soil)return say('Add soil first');if(d.plant)return say('Already planted');if(d.used)return say('Spent soil — dump it into a Garbage Bag and add fresh soil');const pack=ct==='seed_pack',sd=pack?{s:rollPack(),ty:'r'}:c.data.s&&STRAINS[c.data.s]?{s:c.data.s,ty:c.data.ty||'r'}:seedOf(ct);if(!sd)return say('Unknown seed');const mu=rollMut(pack?.1:c.data.s?.08:.03);const pre=(pack||mu)&&((pack?`Mystery seed: ${STRAINS[sd.s].name} (${RAR[STRAINS[sd.s].rar||0][0]})! `:'')+(mu?`Rare mutation: ${MUTS[mu].n}! `:''));d.plant={s:sd.s,ty:sd.ty,...(mu?{mu}:{}),age:0,water:40,nutr:30+(d.sq||0)*25,health:80,ph:sd.ty==='r'?Math.round((.75+Math.random()*.55)*100)/100:1,sq:d.sq||0,qs:0,qt:0};use();return say((pre||'')+'Planted '+STRAINS[sd.s].name+(sd.ty==='f'?' (feminized)':sd.ty==='a'?' (auto)':' (regular)'))}
   if(ct==='water'){if(!d.soil)return say('Add soil first');if((c.data.w??0)<=0)return say('Can is empty — refill it at the sink');if(d.plant?.dead)return say('Plant is dead — bag it first');const m0=d.moist??0;if(m0>=98){w.fx={k:'spill',id:t.id};return}
    d.moist=m0+POUR>=98?100:Math.min(100,m0+POUR);if(d.plant){d.plant.water=d.moist;d.plant.dry=0;d.plant.wilt=0}c.data.w=Math.max(0,(c.data.w??0)-POUR);if(c.data.w<=0)say('Can is empty — refill it at the sink')
    if(d.moist>=100){w.fx={k:'full',id:t.id};w.sound='check'}return}
   if(ct==='nutr'){if(!d.plant)return say('Nothing to feed');if(d.plant.dead)return say('Plant is dead — bag it first');const P=d.plant,f=c.data.f||'m',df=STRAINS[P.s]?.diff||1;let b='';if(P.nutr>70){P.burn=Math.min(1,(P.burn||0)+.4*(.7+.3*df));b=' — ⚠ too much! Nutrient burn (leaf tips browning)'}P.nutr=100;P.fd=f;use();w.sound='pour';return say(`Fed ${f==='g'?'Grow (N)':f==='b'?'Bloom (P-K)':'balanced'} nutrients${b}`)}}
  if(t.type==='rack'&&ct==='wetbud'){const sl=t.data.slots=t.data.slots||[];if(sl.length>=4)return say('Rack is full');sl.push({s:c.data.s,g:c.data.g,q:c.data.q,t:DRY});w.ents=w.ents.filter(e=>e!==c);return say('Hung to dry (1 min)')}
  if(t.type==='scale'&&ct==='drybud'){const j=w.ents.find(e=>e.type==='jars'&&!e.by);if(!j)return say('Need a Jar Box placed in the shed');c.type='packed';c.data.cure=0;if(--j.data.uses<=0)w.ents=w.ents.filter(e=>e!==j);w.sound='cash';return say(`Weighed & packed: ${c.data.g}g ${STRAINS[c.data.s].name} · grade ${grade(prodQ(c.data))[0]} — let it cure in the jar to raise quality`)}
  if(m.only)return say("Can't use "+(SHOP[ct]?.n||ct)+' on that')}
 if(t.type==='pot'&&stage(t.data.plant)==='ready'){if(full())return;const p=t.data.plant,M=MUTS[p.mu]||{},g=Math.max(1,Math.round((M.y||1)*STRAINS[p.s].g*(t.data.sz||1)*(p.ph||1)*(p.ty==='a'?.8:1)*(.35+.65*p.health/100))),q=harvQ(p);t.data.plant=null;t.data.used=1;t.data.moist=Math.min(t.data.moist??30,40);
  const q2=Math.min(100,q+(M.q||0)),D=w.disc??={},nw=[p.s,p.mu&&'mu:'+p.mu].filter(k=>k&&!D[k]&&!STRAINS[k]?.x);nw.forEach(k=>D[k]=1);let xs='';if(p.x&&STRAINS[p.x]){const k=makeCross(w,p.s,p.x);if(!STRAINS[k].x&&!D[k]){D[k]=1;nw.push(k)}w.ents.push({id:w.nid++,type:'seed_x',x:t.x+.35,y:0,z:t.z,ry:0,by:0,data:{s:k,ty:'r',uses:3}});xs=` · 🌱 ${STRAINS[k].name} seeds dropped by the pot!`}if(nw.length)w.sound='cash';
  give({id:w.nid++,type:'wetbud',x:0,y:0,z:0,ry:0,by:pid,data:{s:p.s,g,q:q2}});w._sv=1;return say(`${nw.length?'📖 NEW DISCOVERY: '+nw.map(k=>k.startsWith('mu:')?MUTS[k.slice(3)].n:STRAINS[k].name).join(', ')+'! ':''}Harvested ${g}g wet ${STRAINS[p.s].name} (grade ${grade(q)[0]} so far) — hang it to dry · dump the spent soil${xs}`)}
 if(t.type==='pot'&&t.data.plant?.dead)return say('Dead plant — use a Garbage Bag on it (laptop shop)');
 if(t.type==='rack'){const sl=t.data.slots||[];const i=sl.findIndex(s=>s.t<=0);if(i>=0){if(full())return;const s=sl.splice(i,1)[0];give({id:w.nid++,type:'drybud',x:0,y:0,z:0,ry:0,data:{s:s.s,g:s.g,q:s.q??70}});return say(`Took ${s.g}g dried bud — pack it at the scale`)}
  if(sl.length)return say('Still drying…')}
 if(t.by||t.data.fixed||full())return;if(t.type==='shelf'&&t.data.slots?.some(Boolean))return say('Empty the shelf before moving it');if(t.type==='seedrack'&&t.data.sl?.some(s=>s?.n?.length))return say('Empty the seed rack before moving it');give(t);w.sound='pick'}
// ---------- shed decor (server-authoritative: money, bounds, ownership) ----------
function decor(w,m,say){const D=w.decor??=defDecor();const B=ROOMB(w.room),num=v=>Math.round((+v||0)*100)/100;
 if(m.t==='dstyle'){const cat=STYLE[m.k],o=cat?.[m.v];if(!o)return say('Unknown style');if(D[m.k]===m.v)return say('Already applied');const key=m.k+':'+m.v;
  if(o.p&&!D.own.includes(key)){if(w.money<o.p)return say(`Need $${o.p}`);w.money-=o.p;D.own.push(key)}D[m.k]=m.v;w.sound='buy';return say(`${o.n} applied`+(o.p?'':''))}
 const fits=(k,x,y,z)=>{const it=DECOR[k];const r=Math.max(it.w,it.d)/2*.7;if(it.s==='wall')return x>=B.x0-.1&&x<=B.x1+.1&&z>=B.z0-.1&&z<=B.z1+.1&&y>=.3&&y<=2.8;return x-r>=B.x0-.05&&x+r<=B.x1+.05&&z-r>=B.z0-.05&&z+r<=B.z1+.05&&y>=0&&y<=1.2};
 if(m.t==='dplace'){const it=DECOR[m.k];if(!it)return say('Unknown item');if(D.items.length>=60)return say('Decor limit reached (60)');const x=num(m.x),y=num(m.y),z=num(m.z);if(!fits(m.k,x,y,z))return say("Can't place that there");
  if(w.money<it.p)return say(`Need $${it.p} for ${it.n}`);w.money-=it.p;D.items.push({id:w.nid++,k:m.k,x,y,z,ry:num(m.ry)});w.sound='drop';return say(`Placed ${it.n} (-$${it.p})`)}
 const i=D.items.find(e=>e.id===m.id);if(!i)return say('Item not found');
 if(m.t==='dmove'){const x=num(m.x),y=num(m.y),z=num(m.z);if(!fits(i.k,x,y,z))return say("Can't place that there");Object.assign(i,{x,y,z,ry:num(m.ry)});w.sound='drop';return say('Moved '+DECOR[i.k].n)}
 if(m.t==='drem'){const back=Math.floor(DECOR[i.k].p/2);D.items=D.items.filter(e=>e!==i);w.money+=back;w.sound='pick';return say(`Removed ${DECOR[i.k].n} (+$${back} back)`)}}
let nid=1;
wss.on('connection',ws=>{const me={ws,id:nid++,name:'Grower'};let room=null;
 const send=m=>ws.send(JSON.stringify(m));
 ws.on('message',async d=>{let m;try{m=JSON.parse(d)}catch{return}
  if(room&&/^(buy|order|sleep|claim|upgrade)$/.test(m.t))setTimeout(()=>room&&(room.w._sv=1),50);
  if(m.t==='host'||m.t==='join'){me.name=String(m.name||'Grower').slice(0,10);me.look=okLook(m.look);
   if(m.t==='host'){const u=await who(m.token);let w=null,sid=null,sname='Farm';
    if(u&&m.save){sid=String(m.save).replace(/\W/g,'');const sv=await store.get('save:'+u+':'+sid);if(!sv)return send({t:'err',e:'Save not found'});w=sv.w;w.decor??=defDecor();addV11(w);regGen(w.gen);sname=sv.name;w.log=['Welcome back — farm loaded (Day '+w.day+')']}
    else if(!u&&m.gw&&typeof m.gw==='object'&&Array.isArray(m.gw.ents)&&typeof m.gw.money==='number'){w=m.gw;w.decor??=defDecor();addV11(w);regGen(w.gen);w.log=['Welcome back — farm loaded (Day '+w.day+')']}
    else if(u){sid=crypto.randomBytes(5).toString('hex');sname=String(m.sname||'').slice(0,20)||('Farm '+new Date().toISOString().slice(0,10))}
    if(room&&room.players.includes(me))return;if(u&&sid)for(const r of rooms.values())if(r.owner===u&&r.sid===sid)r.owner=null;room={code:mk(),players:[],host:me.id,started:false,w:w||newWorld(),owner:u,sid,sname};rooms.set(room.code,room)}
   else{const r=rooms.get(String(m.code||'').toUpperCase());if(!r)return send({t:'err',e:'Room not found'});if(r.players.length>=4)return send({t:'err',e:'Room full'});room=r}
   room.players.push(me);send({t:'joined',code:room.code,id:me.id,host:room.host,started:room.started,save:room.owner?{id:room.sid,name:room.sname,owner:room.owner}:null});bc(room,{t:'roster',pl:roster(room),host:room.host});
   if(room.started)send({t:'start',pl:roster(room)})}
  else if(!room)return;
  else if(m.t==='save'){if(room.owner){await saveRoom(room);send({t:'saved',at:Date.now()})}else if(me.id===room.host&&room.started)send({t:'saved',at:Date.now(),w:snap(room.w)})}
  else if(m.t==='start'&&me.id===room.host){room.started=true;room.owner&&saveRoom(room);bc(room,{t:'start',pl:roster(room)})}
  else if(m.t==='s'){m.id=me.id;bc(room,m,me)}
  else if(m.t==='pause'){me.paused=!!m.v}
  else if(m.t==='look'){me.look=okLook(m.look);if(me.look)bc(room,{t:'look',id:me.id,look:me.look},me)}
  else if(m.t==='spend'){const n=Math.max(0,m.n|0);if(room.w.money>=n){room.w.money-=n;room.w.toast={pid:me.id,t:'Bought '+String(m.why||'item').slice(0,30)+' (-$'+n+')'}}}
  else if(m.t==='dbg'){if(!process.env.BT_DEBUG)return;const w=room.w;if(m.id){const e=w.ents.find(e=>e.id===m.id);if(e?.data.plant)Object.assign(e.data.plant,{age:m.age,health:100,water:100,nutr:100})}if(m.min!=null)w.min=m.min;if(m.dry)w.ents.forEach(e=>(e.data.slots||[]).forEach(s=>s.t=0));if(m.contract)w.contracts[0].s=m.contract;if(m.cmin)w.contracts[0].min=m.cmin;if(m.disc)Object.assign(w.disc??={},m.disc);if(m.spawn){const q=m.spawn;w.ents.push({id:w.nid++,type:'pot',x:q.x,y:0,z:q.z,ry:0,by:0,data:{soil:1,moist:q.water??100,crack:q.crack||0,plant:q.age==null?null:{s:q.s,age:q.age,water:q.water??100,nutr:100,health:q.health??100,dead:!!q.dead,dry:q.dry||0,wilt:0,...(q.p||{})},...(q.d||{})}})}if(m.ff)for(let i=0;i<m.ff*10;i++)tick(w,.1);if(m.give)w.ents.push({id:w.nid++,type:SHOP[m.give]?.ent||m.give,x:0,y:0,z:0,ry:0,by:me.id,bi:-1,data:/bud|packed/.test(m.give)?{s:'owl',g:12}:SHOP[m.give]?.uses?{uses:SHOP[m.give].uses,...(SHOP[m.give].dat||{})}:{}}),m.gd&&Object.assign(w.ents.at(-1).data,m.gd),norm(w,me.id);if(m.set){const e=ent(w,m.set.id);Object.assign(e.data,m.set.d||{});if(m.set.p)Object.assign(e.data.plant,m.set.p)}if(m.money)w.money+=m.money;if(m.offer)newContract(w,1);if(m.bill)bill(w);if(m.overdue){for(const b of w.util.bills)b.due=0;w.util.off=3}if(m.give==='water')w.ents.at(-1).data.w=CAN;if(m.give==='shelf')w.ents.at(-1).data.slots=[];if(m.pallet){w.ents.push({id:w.nid++,type:'pallet',x:m.pallet.x,y:0,z:m.pallet.z,ry:0,by:0,data:{it:m.pallet.it,n:SHOP['pal_'+m.pallet.it].k}})}if(m.place){const q=m.place;w.ents.push({id:w.nid++,type:q.type,x:q.x,y:0,z:q.z,ry:q.ry||0,by:0,data:q.data||{}})}room.dirty=true}
  else{act(room.w,me.id,m);room.dirty=true}
 });
 ws.on('close',()=>{if(!room)return;saveRoom(room);room.w.ents.forEach(e=>{if(e.by===me.id){e.by=0}});room.players=room.players.filter(p=>p!==me);if(!room.players.length)rooms.delete(room.code);else{if(room.host===me.id)room.host=room.players[0].id;bc(room,{t:'roster',pl:roster(room),host:room.host,left:me.id})}});
});
setInterval(()=>{for(const r of rooms.values())if(r.w._sv){delete r.w._sv;r.owner&&saveRoom(r);const h=r.players.find(p=>p.id===r.host);if(!r.owner&&h&&r.started)h.ws.send(JSON.stringify({t:'saved',at:Date.now(),w:snap(r.w),q:1}))}},2000);
setInterval(()=>{for(const r of rooms.values())saveRoom(r)},+process.env.BT_AUTOSAVE_MS||45000);
let acc=0;setInterval(()=>{acc++;for(const r of rooms.values()){if(!r.started)continue;if(!r.players.every(p=>p.paused))tick(r.w,.1);{const S=r.w.sleepers;if(S?.length){r.w.sleepers=S.filter(id=>r.players.some(p=>p.id===id));if(r.w.sleepers.length&&r.players.every(p=>r.w.sleepers.includes(p.id))){doSleep(r.w);r.dirty=true}}}if(r.dirty||acc%3==0){r.dirty=false;const w=r.w;bc(r,{t:'w',w:{money:w.money,rep:w.rep,day:w.day,min:w.min,room:w.room,ents:w.ents,contracts:w.contracts,offers:w.offers||[],log:w.log,toast:w.toast,sound:w.sound,fx:w.fx,pending:w.pending.length,orders:orderView(w),util:w.util,decor:w.decor,sleepers:w.sleepers||[],slept:w.slept||0,disc:w.disc||{},rew:w.rew||[],gen:w.gen||{}}});w.log=[];w.toast=null;w.sound=null;w.fx=null}}},100);
const shutdown=async()=>{await Promise.all([...rooms.values()].map(saveRoom));process.exit(0)};process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
const PORT=process.env.PORT||3000;server.listen(PORT,()=>console.log('Bud Together on :'+PORT));
