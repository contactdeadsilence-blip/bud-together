// Server-side mission progress + claims. Idempotent claim; cheat-flag respected on rewards.
import {MDEF,misInit,misView,misToast,plvl,seasonOf} from '../src/missions.js';
import {SHOP,DECOR} from '../src/rules.js';

export {misInit,misView,plvl};

export function misTick(w){
  const M=misInit(w);
  for(const m of MDEF){
    if(m.coming)continue;
    if(m.season&&m.season!==seasonOf())continue;
    const cur=Math.min(m.need,Math.max(0,m.get(w)|0));
    const prev=M.prog[m.id]|0;
    if(cur!==prev)M.prog[m.id]=cur;
    if(cur>=m.need&&!M.done[m.id]&&!M.claim[m.id]){M.done[m.id]=1;misToast(w,m.id);w._sv=1}
  }
}

export function misNote(w,ev,n=1){
  const M=misInit(w);
  if(ev==='sell'){M.dSell=(M.dSell|0)+n;M.wSell=(M.wSell|0)+n;if(seasonOf()==='winter')M.sSell=(M.sSell|0)+n}
  if(ev==='earn'){M.wEarn=(M.wEarn|0)+n}
  if(ev==='talk'){M.dTalk=(M.dTalk|0)+n;M.talks=(M.talks|0)+n}
  if(ev==='plant'){M.dPlant=(M.dPlant|0)+n;if(seasonOf()==='spring')M.sPlant=(M.sPlant|0)+n}
  if(ev==='map')M.mapOpen=1;
  misTick(w);
}

export function misClaim(w,id,say,pid=0){
  const M=misInit(w);
  const m=MDEF.find(x=>x.id===id);if(!m)return say('Unknown mission');
  if(m.coming)return say('Coming soon');
  if(m.season&&m.season!==seasonOf())return say('Out of season');
  const cur=Math.min(m.need,Math.max(0,m.get(w)|0));
  if(cur<m.need)return say('Not complete yet');
  if(M.claim[m.id])return say('Already claimed');
  M.claim[m.id]=1;M.done[m.id]=1;
  const r=m.r||{};
  // Cheat-flag: still grant cosmetic unlocks, but cash/xp halved if cheated (honest play preferred)
  const half=!!w.cheat;
  const cash=half?Math.floor((r.cash||0)/2):(r.cash|0);
  const xp=half?Math.floor((r.xp||0)/2):(r.xp|0);
  if(cash){w.money=(w.money||0)+cash}
  if(xp){w.xp=(w.xp|0)+xp}
  if(r.seed&&SHOP[r.seed]){
    const uses=SHOP[r.seed].uses||3;
    if(pid){w.ents.push({id:w.nid++,type:r.seed,x:0,y:0,z:0,ry:0,by:pid,bi:-1,data:{...(SHOP[r.seed].dat||{}),uses}})}
    else{w.bstock??={};w.bstock[r.seed]=(w.bstock[r.seed]|0)+uses}
  }
  if(r.deco&&DECOR[r.deco]){const D=w.decor??={own:[],items:[]};D.own??=[];const key='item:'+r.deco;if(!D.own.includes(key))D.own.push(key);w.bstock??={};w.bstock['f_'+r.deco]=(w.bstock['f_'+r.deco]|0)+1}
  if(r.cloth){w.mis.unlockCloth=1}
  w.sound='cash';w._sv=1;misTick(w);
  const bits=[];if(cash)bits.push('$'+cash);if(xp)bits.push(xp+' XP');if(r.seed)bits.push('rare seeds');if(r.deco)bits.push(DECOR[r.deco].n);if(r.cloth)bits.push('Threads unlock');
  return say(`🎯 ${m.n} claimed!`+(bits.length?' · '+bits.join(' · '):'')+(half?' (cheat farm — rewards halved)':''));
}
