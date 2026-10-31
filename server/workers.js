// v1.7.3 AI farm workers: server-authoritative NPCs that walk to targets and reuse the normal player actions (act) so every rule stays identical.
import {WORKT,WORK_MAX,WORK_HOURS,SKILL} from '../src/bizdata.js';
import {CAN,THIRSTY,DCAP,stage} from '../src/rules.js';import {findEq,packBox} from './proc.js';import {PACKT} from '../src/proc.js';
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
// returns the next goal {id,x,z,go:fn} or null
function plan(w,v,act){const H=held(w,v),pots=w.ents.filter(e=>e.type==='pot'&&!e.by),go=(t,fn,d=.9)=>({id:t.id,x:t.x,z:t.z,d,go:fn});
 if(v.k==='grower'){let can=H.find(e=>e.type==='water'&&e.data.wk);if(!can){can=mk(w,v,'water',{w:CAN,wk:1})}
  const seed=H.find(e=>e.type.startsWith('seed_')),soil=H.find(e=>e.type==='soil');
  if(seed){const p=nearest(v,pots.filter(p=>p.data.soil&&!p.data.used&&!p.data.plant&&!claimed(w,v,p.id)));if(p)return go(p,()=>doAct(w,v,act,{t:'use',target:p.id},seed));drop(w,v,seed)}
  if(soil){const p=nearest(v,pots.filter(p=>!p.data.soil&&!claimed(w,v,p.id)));if(p)return go(p,()=>{doAct(w,v,act,{t:'use',target:p.id},soil);const s=w.ents.find(e=>e===soil&&e.by===v.id);if(s)drop(w,v,s,p.x+.5,p.z)});const s=w.ents.find(e=>e===soil);if(s)drop(w,v,s);return null}
  const thirsty=pots.filter(p=>p.data.soil&&p.data.plant&&!p.data.plant.dead&&(p.data.moist??0)<Math.max(THIRSTY+20,45)&&!claimed(w,v,p.id));
  if(thirsty.length){if((can.data.w??0)<15){const s=nearest(v,w.ents.filter(e=>e.type==='sink'&&!e.by));if(s)return go(s,()=>{for(let i=0;i<12&&(can.data.w??0)<CAN;i++)doAct(w,v,act,{t:'use',target:s.id},can)},1.1);return null}
   const p=nearest(v,thirsty);return go(p,()=>{for(let i=0;i<20&&(p.data.moist??0)<90&&(can.data.w??0)>0;i++)doAct(w,v,act,{t:'use',target:p.id},can)})}
  const spent=pots.find(p=>p.data.soil&&p.data.used&&!p.data.plant&&!claimed(w,v,p.id));if(spent)return go(spent,()=>{if(spent.data.used&&!spent.data.plant){spent.data.soil=0;spent.data.used=0;spent.data.moist=0;v.say='Cleared spent soil';w._svw=1}});
  const empty=pots.filter(p=>p.data.soil&&!p.data.used&&!p.data.plant);if(empty.length&&H.length<3){const s=seedSrc(w,v);if(s)return go(s,()=>{if(s.type==='seedrack'){const sl=(s.data.sl||[]).find(x=>x&&x.n?.length);if(sl){mk(w,v,sl.k,sl.n.pop());if(!sl.n.length)s.data.sl[s.data.sl.indexOf(sl)]=null;w._svw=1}}else if(free(s))pickUp(w,v,s)})}
  const bare=pots.filter(p=>!p.data.soil);if(bare.length&&H.length<3){const s=nearest(v,w.ents.filter(e=>free(e)&&e.type==='soil'&&!claimed(w,v,e.id)));if(s)return go(s,()=>{if(free(s))pickUp(w,v,s)})}
  return null}
 if(v.k==='trimmer'){const wet=H.find(e=>e.type==='wetbud'),dry=H.find(e=>e.type==='drybud'),trim=H.find(e=>e.type==='trim'),pk=H.find(e=>e.type==='packed'||e.type==='pkg');const scale=findEq(w,v,'scale');
  // target helpers: equipment may sit on a table (virtual table item) — act on the table with sub=index
  const tgo=(o,fn,d=1.1)=>({id:o._tab?o._tab.id:o.id,x:o.x,z:o.z,d,go:fn}),um=o=>o._tab?{t:'use',target:o._tab.id,sub:o._tab.data.items.indexOf(o._it)}:{t:'use',target:o.id};
  const racks=w.ents.filter(e=>e.type==='rack'&&!e.by),dryR=racks.filter(e=>(e.data.slots||[]).some(s=>s.t<=0)&&!claimed(w,v,e.id)),room=racks.some(e=>(e.data.slots||[]).length<4);
  const takeDry=()=>{const r=nearest(v,dryR);return r?go(r,()=>doAct(w,v,act,{t:'use',target:r.id},null),1.1):null};
  if(trim){const T=nearest(v,w.ents.filter(e=>e.type==='table'&&!e.by))||scale;if(T)return go(T,()=>drop(w,v,trim,T.x+.3,T.z),1.1);drop(w,v,trim);return null}
  if(pk){const sh=nearest(v,w.ents.filter(e=>e.type==='shelf'&&!e.by&&(e.data.slots||[]).filter(Boolean).length<6));if(sh)return go(sh,()=>doAct(w,v,act,{t:'use',target:sh.id},pk),1.1);if(scale)return tgo(scale,()=>drop(w,v,pk,scale.x+.4,scale.z+.3));drop(w,v,pk);return null}
  if(dry){if(!dry.data.tr){const sk=SKILL[v.sk];doAct(w,v,act,{t:'trim',trim:{acc:Math.min(1,.45+.25*v.sk),spd:Math.min(1,.5+.25*v.sk)}},dry);return{wait:2.5/sk.f}}
   if(!scale){v.say='Need a Scale to pack dried bud';return null}const box=packBox(w,scale);if(!box){v.say='Need Jars, Grove Bags or Mylar Bags near the scale';return null}
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
export function workTick(w,dt,act){const L=w.workers;if(!L?.length)return;const h=w.min/60,on=h>=WORK_HOURS[0]&&h<WORK_HOURS[1];
 for(const v of L){const f=SKILL[v.sk]?.f||1;v.mv=0;
  if(v.wait>0){v.wait-=dt;continue}
  if(!v.tg){if(!on){v.st='off';v.tg={x:HOME.x+(L.indexOf(v)*.7),z:HOME.z,d:.2}}else{if((v.nx=(v.nx||0)-dt)>0)continue;v.nx=.5;const g=plan(w,v,act);if(g?.wait){v.wait=g.wait;v.st='work';continue}v.tg=g||null;v.st=g?'walk':'idle';if(!g){v.wait=1.5;continue}}}
  const g=v.tg,dx=g.x-v.x,dz=g.z-v.z,D=Math.hypot(dx,dz);
  if(D>g.d){const s=Math.min(D-g.d+.01,SPD*f*dt);v.x+=dx/D*s;v.z+=dz/D*s;v.ry=Math.atan2(-dx,-dz);v.mv=1;continue}
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
