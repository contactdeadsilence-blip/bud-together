// Section 3 C–F server logic: drying env, curing/burping, storage, packaging, rosin, equipment locks, earnings/level.
import {STRAINS,SHOP,CURE,DRY,prodQ,grade,gradeOk} from '../src/rules.js';
import {STORE,PRODUCT,BURP,dryEnv,qcat,pkgVal,locked,lvl,PACKT} from '../src/proc.js';
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,+v||0)),r1=v=>Math.round(v*10)/10;
const near=(w,e,t,r=2.5,f)=>w.ents.filter(o=>o.type===t&&!o.by&&(!f||f(o))).sort((a,b)=>Math.hypot(a.x-e.x,a.z-e.z)-Math.hypot(b.x-e.x,b.z-e.z)).find(o=>Math.hypot(o.x-e.x,o.z-e.z)<r);
function cureStep(d,dt,k=1,auto=false){if(d.ct==='grove'){d.cure=Math.min(1,(d.cure||0)+dt*k/(CURE*1.15));return}
 if((d.cure||0)<1){d.cure=Math.min(1,(d.cure||0)+dt*k/CURE);d.hm=(d.hm||0)+dt/BURP;if(auto&&d.hm>=1){d.hm=0;d.bq=Math.min(4,(d.bq||0)+1)}if(d.hm>1.4)d.pen=Math.min(10,(d.pen||0)+dt/30)}else d.hm=0}
export function procTick(w,dt){for(const e of w.ents){const d=e.data;
 if(e.type==='packed')cureStep(d,dt);
 if(e.type==='rack'){const v=dryEnv(w.ents,e);d.env=v;for(const s of d.slots||[])if(s.t>0){s.t=Math.max(0,s.t-dt*v.sp);if(s.t<=0&&s.dq==null){s.dq=v.dq;s.q=Math.max(0,Math.min(100,(s.q??70)+v.dq))}}}
 if(STORE[e.type]?.cure)for(const it of d.st||[])if(it.type==='packed')cureStep(it.data,dt,STORE[e.type].cure,true)}}
// returns true when handled
export const RST=['Lo-Fi Greenhouse','Roots & Dub FM','Neon Synthwave','Ambient Garden','Funky Harvest'];
export function radioMsg(w,m,say){const r=w.ents.find(e=>e.id===m.id&&e.type==='radio');if(!r)return;const d=r.data;d.st??=0;d.vol??=.6;
 if(m.op==='st'){d.st=((d.st+(m.d<0?-1:1))%RST.length+RST.length)%RST.length;d.on=1;d.t0=Date.now();say(`📻 ${RST[d.st]} (${d.st+1}/${RST.length})`)}
 if(m.op==='vol'){d.vol=Math.round(Math.max(0,Math.min(1,d.vol+(m.d<0?-.1:.1)))*10)/10;say(`📻 Volume ${Math.round(d.vol*100)}%`)}w._sv=1}
export function procAct(w,pid,m,X){const {bag,c,t,say,give,full}=X,ct=c?.type,mk=(type,data,at)=>({id:w.nid++,type,x:at?.x||0,y:0,z:at?.z||0,ry:0,by:0,data});
 if(m.t==='order'){for(const x of Array.isArray(m.items)?m.items:[])if(SHOP[x?.k]&&locked(x.k,w)){say(`🔒 ${SHOP[x.k].n} unlocks at level ${SHOP[x.k].lv} (you are level ${lvl(w)})`);return true}return false}
 if(m.t==='burp'){if(ct!=='packed')return say('Hold a curing jar to burp it'),true;const d=c.data;if(d.ct==='grove')return say('Grove bags never need burping'),true;if((d.cure||0)>=1)return say('Fully cured — no need to burp'),true;
  if((d.hm||0)<.5)return say(`Not ready to burp yet (${Math.round((d.hm||0)*100)}%)`),true;const late=(d.hm||0)>1.4;d.hm=0;d.bq=Math.min(4,(d.bq||0)+(late?0:1));w.sound='check';return say(late?'Burped — late, some moisture damage already':`Burped the jar 💨 +1 quality (${d.bq}/4 burp bonus)`),true}
 if(m.t!=='use')return false;
 // packaging minigame result (at the scale)
 if(m.pack&&t?.type==='scale'){if(!c||(ct!=='packed'&&ct!=='conc'))return say('Hold cured product or rosin to package it'),true;const box=near(w,t,'mylar',3);if(!box)return say('Place a box of Mylar Bags near the scale'),true;
  const cc=ct==='conc',T=PACKT[cc?'conc':'bud'],tg=T.includes(+m.pack.tg)?+m.pack.tg:T[0];if(c.data.g<tg)return say(`Not enough product for a ${tg}g pack`),true;
  const vs=!!near(w,t,'vseal',3),pr=!!near(w,t,'lprint',3);let acc=cl(m.pack.acc)+(t.data.dg?.05:0);acc=Math.min(1,acc);const seal=vs?1:cl(m.pack.seal);const n=Math.max(1,Math.floor(c.data.g/tg));
  const q=Math.max(0,Math.min(100,prodQ(c.data)+Math.round((acc-.8)*10)+(seal<.4?-6:0)));if(--box.data.uses<=0)w.ents=w.ents.filter(e=>e!==box);
  c.type='pkg';c.data={s:c.data.s,g:tg,n,q,cure:0,cc:cc?1:0,vac:vs?1:0,lb:pr?2:1,day:w.day,acc:Math.round(acc*100),seal:Math.round(seal*100)};t.data.last=tg;w.sound='cash';w._sv=1;
  return say(`📦 Packaged ${n}× ${tg}g ${STRAINS[c.data.s]?.name||''}${cc?' rosin':''} · ${qcat('pkg',c.data)[0]} (grade ${grade(q)[0]}) · fill ${Math.round(acc*100)}% · seal ${Math.round(seal*100)}%${vs?' (vacuum)':''}`),true}
 // rosin press result
 if(m.press&&t?.type==='press'){if(ct!=='drybud'&&ct!=='trim')return say('Hold dried bud or trim to press it'),true;const a=(Array.isArray(m.press.a)?m.press.a:[]).slice(0,3).map(v=>cl(v));while(a.length<3)a.push(0);const av=a.reduce((x,y)=>x+y,0)/3,hy=!!t.data.hy,bud=ct==='drybud';
  const yld=(bud?.2:.1)+(hy?.05:0),g=Math.max(.1,r1(c.data.g*yld*(.6+.4*av))),q=Math.round(Math.max(0,Math.min(100,(c.data.q??70)*(bud?.6:.9)+av*40-8+(hy?5:0))));
  c.type='conc';c.data={s:c.data.s,g,q,src:bud?'bud':'trim'};w.sound='check';w._sv=1;return say(`🍯 Pressed ${g}g ${STRAINS[c.data.s]?.name||''} rosin · ${qcat('conc',c.data)[0]} (grade ${grade(q)[0]}) · temp ${Math.round(a[0]*100)}% · pressure ${Math.round(a[1]*100)}% · time ${Math.round(a[2]*100)}%`),true}
 // radio: use = power toggle
 if(t?.type==='radio'&&!m.only&&!c){t.data.on=t.data.on?0:1;t.data.st??=0;t.data.vol??=.6;if(t.data.on)t.data.t0=Date.now();w._sv=1;w.sound='ui';return say(t.data.on?`📻 Radio on · ${RST[t.data.st%RST.length]}`:'📻 Radio off'),true}
 // trim machine: load dried or wet bud, it auto-trims (full speed, steady accuracy)
 if(t?.type==='trimmer'&&!m.only){if(ct!=='drybud'&&ct!=='wetbud')return say(c?'Only dried or wet bud goes in the Trim Machine':'Hold dried or wet bud and use the Trim Machine to trim it'),true;if(c.data.tr)return say('Already trimmed'),true;
  const tg=Math.max(1,Math.round(c.data.g*.12)),dq=7;c.data.q=Math.max(0,Math.min(100,(c.data.q??70)+dq));c.data.g=Math.max(1,c.data.g-tg);c.data.tr=1;w._sv=1;w.sound='check';
  const tr=mk('trim',{s:c.data.s,g:tg,q:Math.round(c.data.q*.6)},{x:t.x+.45,z:t.z});w.ents.push(tr);if(bag.length<3){tr.by=pid;tr.bi=-1}
  return say(`✂ Trim Machine: +${dq} quality · ${c.data.g}g ${ct==='wetbud'?'wet ':''}bud + ${tg}g trim${bag.length<3?'':' (trim left by the machine)'}`),true}
 // pack dried bud into a curing container at the scale (jar box or grove bags, nearest wins)
 if(t?.type==='scale'&&ct==='drybud'){const j=near(w,t,'jars',60),gv=near(w,t,'grove',60),b=j&&gv?(Math.hypot(j.x-t.x,j.z-t.z)<=Math.hypot(gv.x-t.x,gv.z-t.z)?j:gv):j||gv;if(!b)return say('Need a Jar Box or Grove Bags placed in the shed'),true;
  t.data.last=c.data.g;c.type='packed';c.data.cure=0;if(b.type==='grove')c.data.ct='grove';else{c.data.ct='jar';c.data.hm=0}if(--b.data.uses<=0)w.ents=w.ents.filter(e=>e!==b);w.sound='cash';
  return say(`Weighed & packed: ${c.data.g}g ${STRAINS[c.data.s].name} into a ${b.type==='grove'?'grove bag (no burping)':'glass jar — burp it when it fogs up'} · grade ${grade(prodQ(c.data))[0]} · ${qcat('packed',c.data)[0]}`),true}
 if(t?.type==='scale'&&(ct==='packed'||ct==='conc')&&!m.only)return say('Use the packaging minigame — place Mylar Bags near the scale'),true;
 // storage containers
 if(t&&STORE[t.type]){const S=STORE[t.type],L=t.data.st=t.data.st||[];if(c&&!m.only){if(!PRODUCT.includes(ct)||(S.only&&!S.only.includes(ct)))return say(S.only?'Only curing jars and grove bags go in the curing cabinet':'Only product goes in here'),true;if(L.length>=S.n)return say(`${SHOP[t.type].n} is full (${S.n})`),true;
   L.push({type:ct,data:c.data});w.ents=w.ents.filter(e=>e!==c);w.sound='drop';return say(`Stored in ${SHOP[t.type].n} (${L.length}/${S.n})`),true}
  if(!c&&!m.only){if(!L.length)return say(`${SHOP[t.type].n} is empty — hold product here to store it`),true;if(full())return true;const it=L.pop();give(mk(it.type,it.data));w.sound='pick';return say(`Took ${it.type==='pkg'?'a retail pack':it.type} out (${L.length} left)`),true}
  return false}
 // selling packs / rosin at the drop box (contracts first)
 if(m.target==='drop'&&(ct==='pkg'||ct==='conc')){const d=c.data,cc=ct==='conc'||!!d.cc,g=r1(d.g*(d.n||1)),q=prodQ(d),G=grade(q),C=qcat(ct,d);
  const k=w.contracts.find(k=>k.s===d.s&&!!k.cc===cc&&!k.pre&&gradeOk(q,k.min));w.ents=w.ents.filter(e=>e!==c);
  if(k){k.got=r1(k.got+g);if(k.got>=k.g){w.money+=k.pay;w.rep+=1;w.contracts=w.contracts.filter(x=>x!==k);w.sound='cash';return say(`Contract done! +$${k.pay} · +rep`),true}return say(`${k.shop}: ${k.got}/${k.g}g${cc?' rosin':''} delivered`),true}
  const v=ct==='pkg'?pkgVal(d):Math.round(g*18*G[2]*C[2]*(1+(STRAINS[d.s]?.rar||0)*.25));w.money+=v;w.sound='cash';return say(`Sold ${ct==='pkg'?`${d.n}× ${d.g}g pack${d.n>1?'s':''}`:g+'g rosin'} · ${C[0]} grade ${G[0]} for $${v}`),true}
 return false}
// contracts for rosin (rep 2+)
export function concContract(w,k){if(w.rep>=2&&!k.pre&&Math.random()<.25){k.cc=1;k.g=2+Math.round(Math.random()*4);k.pay=Math.round(k.g*(STRAINS[k.s]?.ppg||12)*5)}}
