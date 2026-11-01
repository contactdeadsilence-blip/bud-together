// v1.7.3 AI farm workers: server-authoritative NPCs that walk to targets and reuse the normal player actions (act) so every rule stays identical.
import {WORKT,WORK_MAX,WORK_HOURS,SKILL} from '../src/bizdata.js';
import {CAN,THIRSTY,DCAP,stage,SHOP} from '../src/rules.js';import {findEq,packBox} from './proc.js';import {PACKT} from '../src/proc.js';
const PAD={x:2.4,z:7.2},LOGMAX=20;
const SPD=1.6,HOME={x:1.2,z:6.4};
const wage=v=>Math.round(WORKT[v.k].wage*SKILL[v.sk].m);
export const wkWage=wage;
const held=(w,v)=>w.ents.filter(e=>e.by===v.id);
const free=e=>e&&!e.by;
const claimed=(w,v,id)=>(w.workers||[]).some(o=>o!==v&&o.tg&&o.tg.id===id);
const near=(v,x,z)=>Math.hypot(v.x-x,v.z-z);
const nearest=(v,L)=>L.sort((a,b)=>near(v,a.x,a.z)-near(v,b.x,b.z))[0];
// run a real player action as this worker with item `it` in hand (bi 0); keeps worker chatter out of the player toast unless it's useful
function doAct(w,v,act,m,it){held(w,v).forEach(e=>e.bi=e===it?0:1);const t0=w.toast,s0=w.sound;act(w,v.id,m);if(w.toast&&w.toast.pid===v.id){v.say=w.toast.t;w.toast=t0}if(w.sound!==s0&&near(v,HOME.x,HOME.z)>60)w.sound=s0}
function pickUp(w,v,e){e.by=v.id;e.bi=1;w._svw=1}
function mk(w,v,type,data){const e={id:w.nid++,type,x:v.x,y:0,z:v.z,ry:0,by:v.id,bi:1,data};w.ents.push(e);return e}
function drop(w,v,e,x,z){e.by=0;e.bi=0;e.x=(x??v.x)+(Math.random()-.5)*.3;e.z=(z??v.z)+(Math.random()-.5)*.3;e.y=0;w._svw=1}
const canSell=e=>e&&e.data&&e.data.s&&!['drybud','wetbud','trim','seed'].includes(e.type)&&!e.type.startsWith('seed_')&&(e.data.g||e.data.n);
const seedSrc=(w,v)=>{const L=w.ents.filter(e=>free(e)&&e.type.startsWith('seed_')&&!claimed(w,v,e.id));const r=w.ents.filter(e=>e.type==='seedrack'&&!e.by&&(e.data.sl||[]).some(s=>s&&s.n?.length)&&!claimed(w,v,e.id));return nearest(v,[...L,...r])};
// v1.8.0: workers restock their own supplies from the shop (farm money, shop prices, keeps a day of payroll in reserve), then collect the delivery at the pad
const ent=k=>SHOP[k]?.ent||k;
const cheapSeed=w=>{const own=w.ents.find(e=>e.type.startsWith('seed_')&&SHOP[e.type]&&!SHOP[e.type].hide);if(own)return own.type;return Object.keys(SHOP).filter(k=>/^seed_[a-z]+$/.test(k)&&k!=='seed_pack'&&k!=='seed_x'&&!SHOP[k].hide).sort((a,b)=>SHOP[a].p-SHOP[b].p)[0]};
export const payroll=w=>(w.workers||[]).reduce((a,v)=>a+wage(v),0);
function buy(w,v,k){if(!k||!SHOP[k])return null;if(v.buy)return null;const pr=SHOP[k].p,res=payroll(w);if(w.money-pr<res){if(v.nb!==k){v.nb=k;v.say=`Can't afford ${SHOP[k].n} ($${pr}) — keeping $${res} for wages`}return null}
 w.money-=pr;w.pending.push({type:k,t:4,wk:v.id});v.buy={k,type:ent(k)};v.nb=null;v.say=`Ordered ${SHOP[k].n} ($${pr})`;
 (w.wbuys??=[]).unshift({d:w.day,min:Math.round(w.min),who:WORKT[v.k].n,k,n:SHOP[k].n,p:pr});w.wbuys.length=Math.min(w.wbuys.length,LOGMAX);w.sound='buy';w._sv=1;return true}
function collect(w,v){const b=v.buy;if(!b)return null;if(w.pending.some(p=>p.wk===v.id))return near(v,PAD.x,PAD.z)>1.2?{x:PAD.x,z:PAD.z,d:1,go:null}:{wait:1};
 const e=nearest(v,w.ents.filter(e=>free(e)&&e.type===b.type&&near(e,PAD.x,PAD.z)<2.5));v.buy=null;if(!e)return null;return {id:e.id,x:e.x,z:e.z,d:.8,go:()=>{if(free(e)){pickUp(w,v,e);v.say=`Collected ${SHOP[b.k]?.n||b.type}`}}}}
// returns the next goal {id,x,z,go:fn} or null
function plan(w,v,act){const H=held(w,v),pots=w.ents.filter(e=>e.type==='pot'&&!e.by),go=(t,fn,d=.9)=>({id:t.id,x:t.x,z:t.z,d,go:fn});
 if(v.buy)return collect(w,v);
 if(v.k==='grower'){let can=H.find(e=>e.type==='water'&&e.data.wk);if(!can){can=mk(w,v,'water',{w:CAN,wk:1})}
  const seed=H.find(e=>e.type.startsWith('seed_')),soil=H.find(e=>e.type==='soil');
  if(seed){const p=nearest(v,pots.filter(p=>p.data.soil&&!p.data.used&&!p.data.plant&&!claimed(w,v,p.id)));if(p)return go(p,()=>doAct(w,v,act,{t:'use',target:p.id},seed));drop(w,v,seed)}
  if(soil){const p=nearest(v,pots.filter(p=>!p.data.soil&&!claimed(w,v,p.id)));if(p)return go(p,()=>{doAct(w,v,act,{t:'use',target:p.id},soil);const s=w.ents.find(e=>e===soil&&e.by===v.id);if(s)drop(w,v,s,p.x+.5,p.z)});const s=w.ents.find(e=>e===soil);if(s)drop(w,v,s);return null}
  const thirsty=pots.filter(p=>p.data.soil&&p.data.plant&&!p.data.plant.dead&&(p.data.moist??0)<Math.max(THIRSTY+20,45)&&!claimed(w,v,p.id));
  if(thirsty.length){if((can.data.w??0)<15){const s=nearest(v,w.ents.filter(e=>e.type==='sink'&&!e.by));if(s)return go(s,()=>{for(let i=0;i<12&&(can.data.w??0)<CAN;i++)doAct(w,v,act,{t:'use',target:s.id},can)},1.1);return null}
   const p=nearest(v,thirsty);return go(p,()=>{for(let i=0;i<20&&(p.data.moist??0)<90&&(can.data.w??0)>0;i++)doAct(w,v,act,{t:'use',target:p.id},can)})}
  const hungry=pots.filter(p=>p.data.soil&&p.data.plant&&!p.data.plant.dead&&(p.data.plant.nutr??100)<25&&!claimed(w,v,p.id));
  if(hungry.length){const nu=H.find(e=>e.type==='nutr');if(nu){const p=nearest(v,hungry);return go(p,()=>{if((p.data.plant?.nutr??100)<25)doAct(w,v,act,{t:'use',target:p.id},nu)})}
   if(H.length<3){const s=nearest(v,w.ents.filter(e=>free(e)&&e.type==='nutr'&&!claimed(w,v,e.id)));if(s)return go(s,()=>{if(free(s))pickUp(w,v,s)});if(buy(w,v,'nutr'))return collect(w,v)}}
  const spent=pots.find(p=>p.data.soil&&p.data.used&&!p.data.plant&&!claimed(w,v,p.id));if(spent)return go(spent,()=>{if(spent.data.used&&!spent.data.plant){spent.data.soil=0;spent.data.used=0;spent.data.moist=0;v.say='Cleared spent soil';w._svw=1}});
  const empty=pots.filter(p=>p.data.soil&&!p.data.used&&!p.data.plant);if(empty.length&&H.length<3){const s=seedSrc(w,v);if(s)return go(s,()=>{if(s.type==='seedrack'){const sl=(s.data.sl||[]).find(x=>x&&x.n?.length);if(sl){mk(w,v,sl.k,sl.n.pop());if(!sl.n.length)s.data.sl.splice(s.data.sl.indexOf(sl),1);w._svw=1}}else if(free(s))pickUp(w,v,s)});if(buy(w,v,cheapSeed(w)))return collect(w,v)}
  const bare=pots.filter(p=>!p.data.soil);if(bare.length&&H.length<3){const s=nearest(v,w.ents.filter(e=>free(e)&&e.type==='soil'&&!claimed(w,v,e.id)));if(s)return go(s,()=>{if(free(s))pickUp(w,v,s)});if(buy(w,v,'soil'))return collect(w,v)}
  return null}
 if(v.k==='trimmer'){const wet=H.find(e=>e.type==='wetbud'),dry=H.find(e=>e.type==='drybud'),trim=H.find(e=>e.type==='trim'),pk=H.find(e=>e.type==='packed'||e.type==='pkg');const scale=findEq(w,v,'scale');
  // target helpers: equipment may sit on a table (virtual table item) — act on the table with sub=index
  const tgo=(o,fn,d=1.1)=>({id:o._tab?o._tab.id:o.id,x:o.x,z:o.z,d,go:fn}),um=o=>o._tab?{t:'use',target:o._tab.id,sub:o._tab.data.items.indexOf(o._it)}:{t:'use',target:o.id};
  const racks=w.ents.filter(e=>e.type==='rack'&&!e.by),dryR=racks.filter(e=>(e.data.slots||[]).some(s=>s.t<=0)&&!claimed(w,v,e.id)),room=racks.some(e=>(e.data.slots||[]).length<4);
  const takeDry=()=>{const r=nearest(v,dryR);return r?go(r,()=>doAct(w,v,act,{t:'use',target:r.id},null),1.1):null};
  if(trim){const T=nearest(v,w.ents.filter(e=>e.type==='table'&&!e.by))||scale;if(T)return go(T,()=>drop(w,v,trim,T.x+.3,T.z),1.1);drop(w,v,trim);return null}
  if(pk){const sh=nearest(v,w.ents.filter(e=>e.type==='shelf'&&!e.by&&(e.data.slots||[]).filter(Boolean).length<6));if(sh)return go(sh,()=>doAct(w,v,act,{t:'use',target:sh.id},pk),1.1);if(scale)return tgo(scale,()=>drop(w,v,pk,scale.x+.4,scale.z+.3));drop(w,v,pk);return null}
  if(dry){if(!dry.data.tr){const sk=SKILL[v.sk];doAct(w,v,act,{t:'trim',trim:{acc:Math.min(1,.45+.25*v.sk),spd:Math.min(1,.5+.25*v.sk)}},dry);return{wait:2.5/sk.f}}
   if(!scale){v.say='Need a Scale to pack dried bud';return null}const box=packBox(w,scale);if(!box){const jb=H.find(e=>e.type==='jars'||e.type==='mylar'||e.type==='grove');if(jb)return tgo(scale,()=>drop(w,v,jb,scale.x+.5,scale.z));const fj=nearest(v,w.ents.filter(e=>free(e)&&e.type==='jars'&&!claimed(w,v,e.id)));if(fj&&H.length<3)return go(fj,()=>{if(free(fj))pickUp(w,v,fj)});if(buy(w,v,'jars'))return collect(w,v);v.say='Need Jars, Grove Bags or Mylar Bags near the scale';return null}
   if(box.type==='mylar'){const T=PACKT.bud.filter(g=>g<=dry.data.g),tg=T.length?T[T.length-1]:0;if(!tg){v.say='Too little bud for a Mylar bag';drop(w,v,dry,scale.x+.4,scale.z);return null}
    return tgo(scale,()=>doAct(w,v,act,{...um(scale),pack:{tg,acc:Math.min(1,.7+.12*v.sk),seal:Math.min(1,.6+.18*v.sk)}},dry))}
   return tgo(scale,()=>doAct(w,v,act,um(scale),dry))}
  if(wet){const r=nearest(v,racks.filter(e=>(e.data.slots||[]).length<4));if(r)return go(r,()=>doAct(w,v,act,{t:'use',target:r.id},wet),1.1);const g=takeDry();if(g)return g;v.say='All drying racks are full';return null}
  // racks full of finished bud: empty them first so the next harvest has room
  if(!room&&dryR.length)return takeDry();
  const ripe=pots.filter(p=>stage(p.data.plant)==='ready'&&!claimed(w,v,p.id));if(ripe.length){const p=nearest(v,ripe);return go(p,()=>{if(stage(p.data.plant)==='ready')doAct(w,v,act,{t:'use',target:p.id},null)})}
  return takeDry()}
 if(v.k==='fstock'){const B=w.build||[],space=B.filter(p=>DCAP[p.k]&&(p.st||[]).length<DCAP[p.k]),it=H.find(canSell);
  if(it){const p=nearest(v,space.filter(p=>p.k==='dcase').length?space.filter(p=>p.k==='dcase'):space);if(p)return go(p,()=>doAct(w,v,act,{t:'dstock',id:p.id},it),1.2);v.say='Every case and shelf is full';return null}
  if(!space.length)return null;
  const loose=w.ents.filter(e=>free(e)&&canSell(e)&&!claimed(w,v,e.id)),shv=w.ents.filter(e=>e.type==='shelf'&&!e.by&&(e.data.slots||[]).some(s=>s&&canSell(s))&&!claimed(w,v,e.id));
  const s=nearest(v,[...loose,...shv]);if(s)return go(s,()=>{if(s.type==='shelf'){const sl=s.data.slots,i=sl.findIndex(x=>x&&canSell(x));if(i>=0){mk(w,v,sl[i].type,sl[i].data);sl.splice(i,1);w._svw=1}}else if(free(s))pickUp(w,v,s)},1.1);
  return null}
 return null}

// v1.8.1 worker pathfinding: 0.4m grid over walls + placed objects (sent by clients when the layout changes), A* per new target, cached per target
const NAV=new WeakMap(),PATH=new WeakMap(),CS=.4,GX0=-44,GZ0=-44,GW=220,GH=143,RAD=.22;
export function navSet(w,R){const b=new Uint8Array(GW*GH);let n=0;for(const r of R){if(!Array.isArray(r)||r.length<4||++n>3000)break;const [x0,x1,z0,z1]=r.map(Number);if(![x0,x1,z0,z1].every(Number.isFinite))continue;
 const i0=Math.max(0,Math.ceil((x0-RAD-GX0)/CS-.5)),i1=Math.min(GW-1,Math.floor((x1+RAD-GX0)/CS-.5)),j0=Math.max(0,Math.ceil((z0-RAD-GZ0)/CS-.5)),j1=Math.min(GH-1,Math.floor((z1+RAD-GZ0)/CS-.5));for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)b[j*GW+i]=1}NAV.set(w,{b,ver:(NAV.get(w)?.ver||0)+1})}
const cell=(x,z)=>[Math.max(0,Math.min(GW-1,Math.round((x-GX0)/CS-.5))),Math.max(0,Math.min(GH-1,Math.round((z-GZ0)/CS-.5)))],cx=i=>GX0+(i+.5)*CS,cz=j=>GZ0+(j+.5)*CS;
function astar(N,sx,sz,g){const B=N.b,[si,sj]=cell(sx,sz),goal=Math.max(g.d+.5,.6),G=new Float32Array(GW*GH).fill(1e9),P=new Int32Array(GW*GH).fill(-1),H=[];const s0=sj*GW+si;G[s0]=0;
 const push=(k,f)=>{H.push([f,k]);let i=H.length-1;while(i){const p=(i-1)>>1;if(H[p][0]<=H[i][0])break;[H[p],H[i]]=[H[i],H[p]];i=p}},pop=()=>{const t=H[0],l=H.pop();if(H.length){H[0]=l;let i=0;for(;;){const a=2*i+1,c=a+1;let m=i;if(a<H.length&&H[a][0]<H[m][0])m=a;if(c<H.length&&H[c][0]<H[m][0])m=c;if(m==i)break;[H[m],H[i]]=[H[i],H[m]];i=m}}return t};
 const h=k=>Math.hypot(cx(k%GW)-g.x,cz((k/GW)|0)-g.z);push(s0,h(s0));let it=0,end=-1;
 while(H.length&&it++<25000){const [,k]=pop(),i=k%GW,j=(k/GW)|0;if(h(k)<=goal){end=k;break}
  for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const ni=i+di,nj=j+dj;if(ni<0||nj<0||ni>=GW||nj>=GH)continue;const nk=nj*GW+ni;if(B[nk]&&h(nk)>goal)continue;if(di&&dj&&(B[j*GW+ni]||B[nj*GW+i]))continue;const ng=G[k]+(di&&dj?1.414:1);if(ng<G[nk]){G[nk]=ng;P[nk]=k;push(nk,ng+h(nk))}}}
 if(end<0)return null;const pts=[];for(let k=end;k!=-1&&k!=s0;k=P[k])pts.push({x:cx(k%GW),z:cz((k/GW)|0)});pts.reverse();
 // drop collinear points
 const out=[];for(let i=0;i<pts.length;i++){const a=out[out.length-1]||{x:sx,z:sz},b=pts[i],c=pts[i+1];if(c&&Math.abs((b.x-a.x)*(c.z-b.z)-(b.z-a.z)*(c.x-b.x))<1e-4)continue;out.push(b)}return out}
function stepTo(w,v,g){const N=NAV.get(w);if(!N)return g;let P=PATH.get(g);if(!P||P.ver!==N.ver){P={ver:N.ver,pts:astar(N,v.x,v.z,g)||[]};PATH.set(g,P)}while(P.pts.length&&Math.hypot(P.pts[0].x-v.x,P.pts[0].z-v.z)<.12)P.pts.shift();return P.pts[0]||g}
export function workTick(w,dt,act){const L=w.workers;if(!L?.length)return;const h=w.min/60,on=h>=WORK_HOURS[0]&&h<WORK_HOURS[1];
 for(const v of L){const f=SKILL[v.sk]?.f||1;v.mv=0;
  if(v.wait>0){v.wait-=dt;continue}
  if(!v.tg){if(!on){v.st='off';v.tg={x:HOME.x+(L.indexOf(v)*.7),z:HOME.z,d:.2}}else{if((v.nx=(v.nx||0)-dt)>0)continue;v.nx=.5;const g=plan(w,v,act);if(g?.wait){v.wait=g.wait;v.st='work';continue}v.tg=g||null;v.st=g?'walk':'idle';if(!g){v.wait=1.5;continue}}}
  const g=v.tg,D=Math.hypot(g.x-v.x,g.z-v.z);
  if(D>g.d){const q=stepTo(w,v,g),dx=q.x-v.x,dz=q.z-v.z,Dq=Math.hypot(dx,dz)||1e-6,s=q===g?Math.min(D-g.d+.01,SPD*f*dt):Math.min(Dq,SPD*f*dt);v.x+=dx/Dq*s;v.z+=dz/Dq*s;v.ry=Math.atan2(-dx,-dz);v.mv=1;continue}
  if(g.go){if(g.id==null||w.ents.some(e=>e.id===g.id)||(w.build||[]).some(p=>p.id===g.id))g.go();v.wait=1.1/f;v.st='work'}else v.st=on?'idle':'off';v.tg=null}}
export function workDay(w){const L=w.workers;if(!L?.length)return '';let tot=0,quit=[];for(const v of [...L]){const c=wage(v);if(w.money>=c){w.money-=c;tot+=c;v.days=(v.days||0)+1}else{fireW(w,v);quit.push(WORKT[v.k].n)}}
 return (tot?`Farm wages −$${tot}`:'')+(quit.length?` · Unpaid ${quit.join(', ')} quit`:'')}
function fireW(w,v){for(const e of held(w,v)){if(e.data.wk)w.ents=w.ents.filter(x=>x!==e);else drop(w,v,e)}w.workers=w.workers.filter(x=>x!==v);w._sv=1}
export function workMsg(w,m,say){const L=w.workers??=[];const T=WORKT[m.k];if(!T)return say('Unknown worker');
 if(m.op==='hire'){const sk=Math.max(0,Math.min(2,m.sk|0));if(L.filter(v=>v.k===m.k).length>=WORK_MAX)return say(`You already have ${WORK_MAX} ${T.n}s`);const c=Math.round(T.wage*SKILL[sk].m);if(w.money<c)return say(`Need $${c} to hire (first day paid up front)`);w.money-=c;
  const id=-(1000+(w.wnid=(w.wnid||0)+1));L.push({id,k:m.k,sk,x:HOME.x,z:HOME.z,ry:0,st:'idle',tg:null,wait:0,days:0});w.sound='cash';w._sv=1;return say(`Hired a ${SKILL[sk].n} ${T.n} — $${c}/day, paid each morning`)}
 if(m.op==='fire'){const v=[...L].reverse().find(v=>v.k===m.k);if(!v)return say(`No ${T.n} to let go`);fireW(w,v);w.sound='ui';return say(`${T.n} let go — anything they carried was put down`)}}
// public view for the client (no closures)
export const workView=w=>(w.workers||[]).map(v=>({id:v.id,k:v.k,sk:v.sk,x:+v.x.toFixed(2),z:+v.z.toFixed(2),ry:+(v.ry||0).toFixed(2),mv:v.mv,st:v.st,say:v.say||''}));
