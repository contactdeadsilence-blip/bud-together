// v1.7.0 Business sim (server-authoritative): brand, logo, storefront, per-product prices, staff, upgrades,
// daily P&L + expenses, satisfaction/reputation/reviews, extra locations (simulated branches).
import {STRAINS,fairPrice,GRADES,DCAP,BP} from '../src/rules.js';
import {defBiz,pkey,MARK,SKILL,STAFFT,UPG,LOCS,UTIL,CLEAN_FEE,MAXREV,MAXHIST,BRANCH_CAP,SHAPES,ICONS,COLS,AWN,LTS,reviewText} from '../src/bizdata.js';
const CN=['Alex','Sam','Jordan','Riley','Casey','Morgan','Jamie','Taylor','Quinn','Avery','Drew','Rowan','Kai','Skyler','Reese','Parker'];
const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),int=(v,n)=>{v=Math.floor(+v);return Number.isFinite(v)&&v>=0&&v<n?v:null};
export function bizOf(w){const b=w.biz??=defBiz();const d=defBiz();for(const k in d)b[k]??=d[k];
 w.staff??={};for(const k in w.staff){const v=w.staff[k];if(v&&typeof v!='object')w.staff[k]={sk:1};else if(!v)delete w.staff[k]}
 if(!b.locs.length)b.locs.push({id:'home',upg:b.upg});b.locs[0].upg??=b.upg;for(const L of b.locs){L.upg??={};if(L.id!='home'){L.staff??={};L.inv??=[];L.today??=0}}
 if(!(b.cur<b.locs.length))b.cur=0;return b}
export const staffOf=(w,i)=>i?bizOf(w).locs[i].staff:(w.staff||{});
const lv=(w,i,k)=>bizOf(w).locs[i]?.upg?.[k]|0;
export function markOf(w,it,cs){const b=bizOf(w),k=pkey(it);return MARK[b.prices[k]??cs?.pm??1]??1}
const fairOf=it=>fairPrice(it.d.s,it.q,STRAINS,GRADES)*(it.t==='joints'?1.3:it.t==='conc'||it.d.cc?4:1);
export function itemPrice(w,it,cs){return Math.max(1,Math.round(fairOf(it)*markOf(w,it,cs)*it.u))}
export function fairTotal(it){return Math.max(1,Math.round(fairOf(it)*it.u))}
export function homeOpen(w){return !!bizOf(w).opened}
// spawn gap (s) driven by reputation + signage; customer cap by floor upgrade
export function spawnGap(w){const b=bizOf(w);return Math.max(4,26-b.rep*4)/(1+.2*lv(w,0,'sig'))}
export const custCap=w=>6+2*lv(w,0,'floor');
export const payTime=w=>lv(w,0,'reg')?1:2;
export function buyBoost(w){const s=w.staff?.budtender;return s?.15*SKILL[s.sk|0].f:0}
export function decorScore(w){const B=w.build||[],reg=B.find(p=>p.k==='dcount');if(!reg)return 0;const g=reg.g,G=g?B.filter(p=>p.g===g):[];let x0=reg.x-7,x1=reg.x+7,z0=reg.z-7,z1=reg.z+7;if(G.length>4){x0=Math.min(...G.map(p=>p.x));x1=Math.max(...G.map(p=>p.x));z0=Math.min(...G.map(p=>p.z));z1=Math.max(...G.map(p=>p.z))}
 const n=B.filter(p=>!(BP[p.k]&&'wfrx'.includes(BP[p.k].c))&&p.x>=x0&&p.x<=x1&&p.z>=z0&&p.z<=z1).length+(w.ents||[]).filter(e=>e.type==='light'&&e.x>=x0&&e.x<=x1&&e.z>=z0&&e.z<=z1).length;return n}
function addSat(w,sat,who,why,loc){const b=bizOf(w);sat=cl(Math.round(sat),0,100);b.sat.push(sat);if(b.sat.length>40)b.sat.shift();const st=cl(Math.round(sat/20),1,5);b.rep=cl(b.rep+(sat/20-b.rep)*.06,0,5);
 if(Math.random()<.45){b.reviews.unshift({d:w.day,n:who,st,t:reviewText(st,why,Math.random()),l:loc||0});if(b.reviews.length>MAXREV)b.reviews.length=MAXREV}return st}
// called when a home-store customer leaves. o={bought,pr,fair,wait,why}
export function custDone(w,u,o){const b=bizOf(w),bt=w.staff?.budtender;let s=62,why='';
 if(o.bought){const r=o.fair/o.pr;s+=cl((r-1)*70,-35,18);if(r<.75)why='Prices are way too high.'}else{s-=26;why=o.why||'Nothing I wanted was in stock.'}
 const wt=Math.max(0,(o.wait||0)-4);s-=cl(wt*2,0,30);if(wt>8&&!why)why='Waited forever at the register.';
 s+=(b.clean-70)/3;if(b.clean<45&&!why)why='Store could be cleaner.';s+=Math.min(15,decorScore(w)*1.5)-5;if(bt)s+=8*SKILL[bt.sk|0].f;
 b.clean=cl(b.clean-1.2,0,100);return addSat(w,s,u.n,why,0)}
export function sale(w,pr){const C=w.cnt??={};C.jars=(C.jars||0)+1;C.drev=(C.drev||0)+pr;const b=bizOf(w);b.today.rev+=pr;b.today.sales++;w.stats&&(w.stats.disp=(w.stats.disp||0)+pr)}
export function bizTick(w,dt){const b=bizOf(w),st=w.staff?.stocker;if(st)b.clean=cl(b.clean+dt*.05*SKILL[st.sk|0].f,0,100);
 const h=Math.floor(w.min/60);if(h===b._h)return;b._h=h;if(h<8||h>=22)return;
 b.locs.forEach((L,i)=>{if(!i||!L.inv.length)return;const S=L.staff,meta=LOCS.find(x=>x.id===L.id)||LOCS[1];let n=(meta.tr||1)*(.6+b.rep*.3)*(1+.2*(L.upg.sig|0))*(S.cashier?SKILL[S.cashier.sk|0].f:.3)*(S.budtender?1.2:1);n=Math.floor(n+Math.random());
  for(let j=0;j<n&&L.inv.length;j++){const ix=Math.random()*L.inv.length|0,it=L.inv[ix],pr=itemPrice(w,it,null),fair=fairTotal(it);const p=Math.min(.95,.8*Math.pow(fair/pr,2.2)*(S.budtender?1.15:1));const who=CN[Math.random()*CN.length|0];
   if(Math.random()<p){L.inv.splice(ix,1);w.money+=pr;w.earned=(w.earned||0)+pr;sale(w,pr);L.today=(L.today||0)+pr;addSat(w,62+cl((fair/pr-1)*70,-35,18)+(S.budtender?8:0)+(S.stocker?4:-4),who,fair/pr<.75?'Prices are way too high.':'',i)}
   else{b.today.lost++;addSat(w,40,who,'Prices are way too high.',i)}}})}
export function bizDay(w,msg){const b=bizOf(w);let wag=0,rent=0,util=0,stolen=0;
 b.locs.forEach((L,i)=>{const S=staffOf(w,i);for(const k in S)if(S[k]&&STAFFT[k])wag+=Math.round(STAFFT[k].wage*SKILL[S[k].sk|0].m);
  if(i||b.opened){rent+=(LOCS.find(x=>x.id===L.id)||LOCS[0]).rent;util+=UTIL}
  if(!L.upg.sec&&Math.random()<.3){if(i){if(L.inv.length){L.inv.splice(Math.random()*L.inv.length|0,1);stolen++}}else{const cs=(w.build||[]).filter(p=>p.k==='dcase'&&p.st?.length);if(cs.length){cs[0].st.pop();stolen++}}}});
 const exp=wag+rent+util;w.money-=exp;const t=b.today;b.hist.push({d:w.day-1,rev:t.rev,sales:t.sales,lost:t.lost,wag,rent,util,prof:t.rev-exp});if(b.hist.length>MAXHIST)b.hist.shift();b.today={rev:0,sales:0,lost:0};b.locs.forEach(L=>{if(L.today!=null)L.today=0});
 if(exp)msg(w,`🏪 Business expenses paid: $${exp} (wages $${wag} · rent $${rent} · utilities $${util})`);if(stolen)msg(w,`🚨 Shoplifter! ${stolen} item${stolen>1?'s':''} stolen — buy a Security System`)}
const nameOk=s=>String(s||'').replace(/[^\w &'.!-]/g,'').replace(/\s+/g,' ').trim().slice(0,28);
export function bizMsg(w,m,say){const b=bizOf(w),op=m.op,L=b.locs[b.cur],ci=b.cur;w.sound='ui';
 if(op==='open'||op==='name'){const n=nameOk(m.name);if(n.length<2)return say('Business name needs at least 2 letters');b.name=n;if(!b.logo.tx)b.logo.tx=n.split(' ').map(x=>x[0]).join('').slice(0,3).toUpperCase();if(!b.opened){b.opened=w.day;w.sound='cash';return say(`🎉 ${n} is open for business! Flip the Open sign to start selling.`)}return say('Renamed to '+n)}
 if(!b.opened)return say('Open your business first (Business → Open)');
 if(op==='logo'){if(m.k==='tx'){b.logo.tx=nameOk(m.v).toUpperCase().slice(0,10);return}const N={sh:SHAPES,ic:ICONS,bg:COLS,fg:COLS}[m.k];if(!N)return;const v=int(m.v,N.length);if(v==null)return;b.logo[m.k]=v;return}
 if(op==='front'){const N={sc:COLS,ac:COLS,aw:AWN,lt:LTS}[m.k];if(!N)return;const v=int(m.v,N.length);if(v==null)return;b.front[m.k]=v;return}
 if(op==='price'){const k=String(m.key||'').slice(0,40);if(!/^[a-z_]+:[\w-]*$/.test(k))return;b.prices[k]=((b.prices[k]??1)+(m.d<0?MARK.length-1:1))%MARK.length;return}
 if(op==='hire'){const k=m.k,sk=int(m.sk,SKILL.length);if(!STAFFT[k]||sk==null)return;const S=ci?L.staff:(w.staff??={});const fee=Math.round(STAFFT[k].wage*SKILL[sk].m);if(w.money<fee)return say('Not enough cash — hiring costs the first day\'s wage ($'+fee+')');w.money-=fee;S[k]={sk};w.sound='cash';return say(`Hired ${sk==2?'an':'a'} ${SKILL[sk].n} ${STAFFT[k].n} — $${fee}/day`)}
 if(op==='fire'){const k=m.k,S=ci?L.staff:(w.staff||{});if(!S[k])return;delete S[k];return say(STAFFT[k].n+' let go')}
 if(op==='upg'){const U=UPG[m.k];if(!U)return;const l=L.upg[m.k]|0;if(l>=U.c.length)return say('Already maxed');if(w.money<U.c[l])return say('Not enough cash ($'+U.c[l]+')');w.money-=U.c[l];L.upg[m.k]=l+1;w.sound='cash';return say(`${U.n} upgraded (level ${l+1})`)}
 if(op==='clean'){if(b.clean>=99)return say('Already spotless');if(w.money<CLEAN_FEE)return say('Not enough cash');w.money-=CLEAN_FEE;b.clean=100;return say('🧹 Store cleaned — customers notice!')}
 const B=w.build||[],shelves=B.filter(p=>p.k==='dshelf'&&p.st?.length),cases=B.filter(p=>p.k==='dcase');
 if(op==='restock'){let n=0;for(const cs of cases){cs.st??=[];while(cs.st.length<DCAP.dcase){const sh=shelves.find(p=>p.st.length);if(!sh)break;cs.st.push(sh.st.pop());n++}}w._sv=1;return say(n?`Restocked ${n} item${n>1?'s':''} onto the sales floor`:'Nothing to restock — stock room empty or floor full')}
 if(op==='toback'){let n=0;for(const cs of cases)while(cs.st?.length){const sh=B.find(p=>p.k==='dshelf'&&(p.st?.length||0)<DCAP.dshelf);if(!sh)break;(sh.st??=[]).push(cs.st.pop());n++}w._sv=1;return say(`Moved ${n} item${n==1?'':'s'} to the stock room`)}
 if(op==='send'){if(!ci)return say('Switch to a branch location first');let n=0;const want=cl(int(m.n,41)||4,1,40);while(n<want&&L.inv.length<BRANCH_CAP){const sh=B.find(p=>p.k==='dshelf'&&p.st?.length);if(!sh)break;L.inv.push(sh.st.pop());n++}w._sv=1;return say(n?`🚚 Sent ${n} item${n>1?'s':''} to ${LOCS.find(x=>x.id===L.id).n}`:'Put product on your stock-room shelves first')}
 if(op==='buyloc'){const meta=LOCS.find(x=>x.id===m.id);if(!meta||!meta.cost||b.locs.some(x=>x.id===m.id))return;if(w.money<meta.cost)return say('Not enough cash ($'+meta.cost+')');w.money-=meta.cost;b.locs.push({id:meta.id,staff:{},upg:{},inv:[],today:0});b.cur=b.locs.length-1;w.sound='cash';return say(`🏬 Opened ${b.name} — ${meta.n}!`)}
 if(op==='switch'){const i=int(m.i,b.locs.length);if(i==null)return;b.cur=i;return}}
