// Customer personalities + outdoor town wanderers. Caps NPC count for browser perf.
import {itemPrice,fairTotal,buyBoost,custDone,custCap,spawnGap,homeOpen,decorScore} from './biz.js';
import {STRAINS,prodQ} from '../src/rules.js';
import {misNote} from './missions.js';
import {townDoors} from '../src/town.js';

export const PERS={
  regular:{n:'Regular',buy:1,price:1,q:1,chat:.4},
  picky:{n:'Picky',buy:.7,price:1.15,q:1.35,chat:.25},
  bargain:{n:'Bargain hunter',buy:1.1,price:1.45,q:.85,chat:.35},
  connoisseur:{n:'Connoisseur',buy:.85,price:.95,q:1.5,chat:.5},
  chatty:{n:'Chatty',buy:.95,price:1,q:1,chat:.85}
};
const PKEYS=Object.keys(PERS);
const CUSTN=['Alex','Sam','Jordan','Riley','Casey','Morgan','Jamie','Taylor','Quinn','Avery','Drew','Rowan','Kai','Skyler','Reese','Parker','Blake','Cameron','Hayden','Finley'];
const TOWN_CAP=8; // outdoor wanderers
const fwd=(p,d)=>{const r=p.r|0,c=[1,0,-1,0][r],s=[0,1,0,-1][r];return {x:p.x-s*d,z:p.z+c*d}};
function shopOpen(w){return (w.build||[]).some(p=>p.k==='dsign'&&p.o)}
function rollPers(){const r=Math.random();return r<.18?'picky':r<.36?'bargain':r<.52?'connoisseur':r<.7?'chatty':'regular'}
function sched(hr){// simple daily schedule tags
  if(hr<8||hr>=22)return 'home';
  if(hr<11)return 'browse';
  if(hr<14)return 'lunch';
  if(hr<17)return 'browse';
  if(hr<20)return 'evening';
  return 'wind';
}

export function makeCust(extra={}){
  const pers=rollPers(),lk=Math.random()*1e3|0;
  return {id:0,n:CUSTN[Math.random()*CUSTN.length|0],pers,lk,ph:0,t:0,mv:0,say:'',...extra};
}

// Personality-aware browse score
export function browsePick(w,u,cs){
  const P=PERS[u.pers]||PERS.regular;
  const dec=1+Math.min(.2,decorScore(w)*.02)+(w.biz?.clean||70)/500;
  const L=(cs?.st||[]).map((it,i)=>{
    const pr=itemPrice(w,it,cs),fair=fairTotal(it);
    const rar=STRAINS[it.d?.s]?.rar||0;
    const qf=Math.pow((it.q||70)/100,P.q);
    const pf=Math.pow(fair/Math.max(1,pr),2.2*P.price);
    const sc=Math.min(.97,.55*pf*qf*(.7+rar*.12)*P.buy*dec+buyBoost(w));
    return {i,pr,sc,it};
  }).sort((a,b)=>b.sc-a.sc)[0];
  return L;
}

export function townTick(w,dt){
  w.town??=[];const hr=w.min/60,sc=sched(hr);
  // spawn outdoor NPCs near the road/path (z~8–14, x±18)
  if(sc!=='home'&&w.town.length<TOWN_CAP){w._ts=(w._ts||0)+dt;if(w._ts>9){w._ts=0;
    const doors=townDoors(w);const side=Math.random()<.5?-1:1;
    const startZ=22+Math.random()*4,startX=side*(8+Math.random()*40);
    const u=makeCust({id:w.nid++,x:startX,z:startZ,ry:Math.random()*6.28,pts:[],role:'town',sch:sc});
    const dest=doors[Math.random()*doors.length|0];
    const mid={x:(startX+dest.x)/2,z:22};
    u.pts=[{x:startX,z:startZ},mid,{x:dest.x,z:dest.z},{w:'idle'},{x:dest.x+side*6,z:dest.z},{x:0,z:14},{w:'gone'}];
    w.town.push(u)}}
  for(const u of w.town){
    const g=u.pts[u.ph];if(!g){u.dead=1;continue}
    if(g.w){u.t+=dt;u.mv=0;if(g.w==='idle'&&u.t>4+Math.random()*6){u.ph++;u.t=0}else if(g.w==='gone')u.dead=1;continue}
    const dx=g.x-u.x,dz=g.z-u.z,d=Math.hypot(dx,dz),sp=1.1*dt;u.mv=1;
    if(d<=sp){u.x=g.x;u.z=g.z;u.ph++;u.t=0}else{u.x+=dx/d*sp;u.z+=dz/d*sp;u.ry=Math.atan2(-dx,-dz)}
  }
  w.town=w.town.filter(u=>!u.dead);
  // Cap total NPCs (customers + town)
  const cap=custCap(w)+TOWN_CAP;
  while((w.cust?.length||0)+w.town.length>cap&&w.town.length)w.town.pop();
}

const WANT={
  picky:['Something top-shelf — quality over quantity.','Only A-grade for me.'],
  bargain:['Got anything on sale?','I want a deal, not a rip-off.'],
  connoisseur:['Surprise me with a rare cut.','What\'s your frostiest jar?'],
  chatty:['Nice place! How\'s the grow going?','Been a long week — what do you recommend?'],
  regular:['Just browsing.','What\'s popular today?']
};
const CHAT={
  picky:['Hmm. Impress me.','I\'ve tried better… maybe.','Standards, friend.'],
  bargain:['Prices look high from here.','Convince me it\'s worth it.','I\'ll wait for a discount.'],
  connoisseur:['Tell me about the terps.','I respect a careful cure.','Interesting selection.'],
  chatty:['Love the vibe here!','You grow this yourself? Wild.','Come hang sometime — kidding. Or am I?'],
  regular:['Hey.','Looks decent.','Alright then.']
};

export function talkOpts(u){
  const p=u.pers||'regular';
  return [
    {k:'chat',l:'Chat'},
    {k:'want',l:'What do you want?'},
    {k:'rec',l:'Recommend a strain'},
    {k:'disc',l:'Offer a small discount'}
  ];
}
export function talkReply(w,u,k){
  const p=u.pers||'regular',P=PERS[p]||PERS.regular;
  misNote(w,'talk',1);
  if(k==='chat'){u.say=CHAT[p][Math.random()*CHAT[p].length|0];if(P.chat>.6){w.biz&&(w.biz.clean=Math.min(100,(w.biz.clean||70)+.3))}return u.say}
  if(k==='want'){u.say=WANT[p][Math.random()*WANT[p].length|0];return u.say}
  if(k==='rec'){
    const cases=(w.build||[]).filter(x=>x.k==='dcase'&&x.st?.length);
    const stock=cases.flatMap(c=>c.st.map(it=>({it,c})));
    if(!stock.length){u.say='Nothing on the floor yet.';return u.say}
    stock.sort((a,b)=>(b.it.q|0)-(a.it.q|0));
    const pick=p==='bargain'?stock.sort((a,b)=>itemPrice(w,a.it,a.c)-itemPrice(w,b.it,b.c))[0]:stock[0];
    const nm=STRAINS[pick.it.d?.s]?.name||'that jar';
    u.say=p==='connoisseur'?`Try the ${nm} — look at that frost.`:`I'd go with ${nm}.`;
    return u.say;
  }
  if(k==='disc'){
    u.mood=(u.mood||0)+1;u.say=p==='bargain'?'Now you\'re talking.':'Appreciate it.';
    // next browse gets a soft buy boost flag
    u.boost=.12;return u.say;
  }
  return '…';
}

export {CUSTN,fwd,shopOpen,rollPers,sched,TOWN_CAP,PERS as PERSONALITIES};
