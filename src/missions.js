// Shared mission catalog + helpers (client + server). Persist progress on w.mis.
// Categories: beginner, daily, weekly, hidden, collection, business, property, exploration, seasonal.
import {STRAINS,collPct} from './rules.js';
import {lvl as shopLvl} from './proc.js';

export const MCATS=[
  ['beginner','Beginner'],['daily','Daily'],['weekly','Weekly'],['hidden','Hidden'],
  ['collection','Collection'],['business','Business'],['property','Property'],
  ['exploration','Exploration'],['seasonal','Seasonal']
];

// Rewards are server-applied. r:{cash,xp,seed,deco,cloth,note}
// coming: true → locked / coming soon (no auto-progress)
export const MDEF=[
  // Beginner
  {id:'b_plant',cat:'beginner',n:'First Seed',d:'Plant your first seed in a pot.',need:1,get:w=>w.cnt?.plants|0,r:{cash:50,xp:20}},
  {id:'b_harv',cat:'beginner',n:'First Harvest',d:'Harvest a ripe plant.',need:1,get:w=>w.cnt?.grams|0?1:0,r:{cash:100,xp:40}},
  {id:'b_biz',cat:'beginner',n:'Open for Business',d:'Name & open your dispensary on the laptop.',need:1,get:w=>w.biz?.opened?1:0,r:{cash:200,xp:50}},
  {id:'b_sale',cat:'beginner',n:'First Customer',d:'Complete a dispensary sale.',need:1,get:w=>w.sales|0,r:{cash:75,xp:30}},
  {id:'b_earn1k',cat:'beginner',n:'First Grand',d:'Earn $1,000 from sales (lifetime).',need:1000,get:w=>w.earned|0,r:{cash:150,xp:60}},
  // Daily (reset by calendar day key)
  {id:'d_sell3',cat:'daily',n:'Daily Hustle',d:'Make 3 dispensary sales today.',need:3,get:w=>w.mis?.dSell|0,r:{cash:80,xp:25},daily:1},
  {id:'d_talk2',cat:'daily',n:'Small Talk',d:'Chat with 2 town customers today.',need:2,get:w=>w.mis?.dTalk|0,r:{cash:40,xp:15},daily:1},
  {id:'d_plant1',cat:'daily',n:'Green Thumb',d:'Plant 1 seed today.',need:1,get:w=>w.mis?.dPlant|0,r:{cash:30,xp:15},daily:1},
  // Weekly
  {id:'w_earn2k',cat:'weekly',n:'Weekly Grind',d:'Earn $2,000 this week.',need:2000,get:w=>w.mis?.wEarn|0,r:{cash:400,xp:100},weekly:1},
  {id:'w_sales10',cat:'weekly',n:'Busy Counter',d:'Ring up 10 sales this week.',need:10,get:w=>w.mis?.wSell|0,r:{cash:250,xp:80},weekly:1},
  // Hidden
  {id:'h_cheat',cat:'hidden',n:'Honest Grower',d:'Never use the money cheat.',need:1,get:w=>w.cheat?0:1,r:{cash:500,xp:100},hide:1},
  {id:'h_disc3',cat:'hidden',n:'Curious Mind',d:'Discover 3 journal entries (strains or mutations).',need:3,get:w=>Object.keys(w.disc||{}).length,r:{cash:200,xp:80,seed:'seed_owl'},hide:1},
  // Collection
  {id:'c_str5',cat:'collection',n:'Strain Scout',d:'Discover 5 different strains or mutations.',need:5,get:w=>Object.keys(w.disc||{}).length,r:{cash:300,xp:100}},
  {id:'c_full',cat:'collection',n:'Full Journal',d:'Complete the strain & mutation journal (100%).',need:100,get:w=>collPct(w),r:{cash:2000,xp:400,deco:'neon'}},
  // Business
  {id:'biz_open',cat:'business',n:'Storefront',d:'Open your named business.',need:1,get:w=>w.biz?.opened?1:0,r:{cash:150,xp:40}},
  {id:'biz_rep3',cat:'business',n:'Rising Star',d:'Reach 3.0 store reputation.',need:30,get:w=>Math.round((w.biz?.rep||0)*10),r:{cash:400,xp:120}},
  {id:'biz_branch',cat:'business',n:'Expansion',d:'Buy a second business location.',need:2,get:w=>(w.biz?.locs||[]).length,r:{cash:800,xp:200}},
  // Property
  {id:'p_shed',cat:'property',n:'Starter Shed',d:'Own your grow shed (always yours).',need:1,get:()=>1,r:{cash:25,xp:10}},
  {id:'p_expand',cat:'property',n:'Room to Grow',d:'Expand the shed ($500 + 5★).',need:2,get:w=>w.room|1,r:{cash:300,xp:80,deco:'rug'}},
  {id:'p_vehicle',cat:'property',n:'First Ride',d:'Purchase your first vehicle.',need:1,get:()=>0,r:{cash:0,xp:0},coming:1},
  {id:'p_prop2',cat:'property',n:'Second Property',d:'Purchase a second grow property.',need:1,get:()=>0,r:{cash:0,xp:0},coming:1},
  // Exploration
  {id:'x_town',cat:'exploration',n:'Meet the Town',d:'Talk to a townsperson.',need:1,get:w=>w.mis?.talks|0,r:{cash:40,xp:20}},
  {id:'x_map',cat:'exploration',n:'Know the Land',d:'Open the property map.',need:1,get:w=>w.mis?.mapOpen|0,r:{cash:20,xp:10}},
  // Seasonal (month buckets — soft seasonal)
  {id:'s_spring',cat:'seasonal',n:'Spring Sprout',d:'Plant 5 seeds during spring months (Mar–May).',need:5,get:w=>w.mis?.sPlant|0,r:{cash:200,xp:60,seed:'seed_haze'},season:'spring'},
  {id:'s_winter',cat:'seasonal',n:'Winter Stock',d:'Make 8 sales during winter months (Dec–Feb).',need:8,get:w=>w.mis?.sSell|0,r:{cash:250,xp:70},season:'winter'},
  // Level
  {id:'b_lvl10',cat:'beginner',n:'Level 10 Grower',d:'Reach player level 10 (mission XP).',need:10,get:w=>plvl(w),r:{cash:1000,xp:0,cloth:1}},
  {id:'b_earn10k',cat:'beginner',n:'Ten Grand',d:'Earn $10,000 from sales (lifetime).',need:10000,get:w=>w.earned|0,r:{cash:500,xp:200}},
];

export function plvl(w){const x=w?.xp|0;let l=1;while(l<40&&x>=l*l*40)l++;return l}
export function xpNext(w){const l=plvl(w);return l*l*40}
export function dayKey(d=new Date()){return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate()}
export function weekKey(d=new Date()){const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const day=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-day);const y=new Date(Date.UTC(t.getUTCFullYear(),0,1));return t.getUTCFullYear()*100+Math.ceil(((t-y)/86400000+1)/7)}
export function seasonOf(d=new Date()){const m=d.getMonth();return m>=2&&m<=4?'spring':m>=5&&m<=7?'summer':m>=8&&m<=10?'fall':'winter'}

export function misInit(w){
  const M=w.mis??={done:{},claim:{},prog:{},dSell:0,dTalk:0,dPlant:0,wEarn:0,wSell:0,talks:0,mapOpen:0,sPlant:0,sSell:0,dk:0,wk:0,sk:''};
  M.done??={};M.claim??={};M.prog??={};
  const dk=dayKey(),wk=weekKey(),sk=seasonOf();
  if(M.dk!==dk){M.dk=dk;M.dSell=0;M.dTalk=0;M.dPlant=0;for(const m of MDEF)if(m.daily){delete M.done[m.id];delete M.claim[m.id];delete M.prog[m.id]}}
  if(M.wk!==wk){M.wk=wk;M.wEarn=0;M.wSell=0;for(const m of MDEF)if(m.weekly){delete M.done[m.id];delete M.claim[m.id];delete M.prog[m.id]}}
  if(M.sk!==sk){M.sk=sk;M.sPlant=0;M.sSell=0;for(const m of MDEF)if(m.season){delete M.done[m.id];delete M.claim[m.id];delete M.prog[m.id]}}
  w.xp=w.xp|0;return M;
}

export function misView(w){
  misInit(w);const sk=seasonOf();
  return MDEF.map(m=>{
    const coming=!!m.coming||(m.season&&m.season!==sk&&!m.daily&&!m.weekly);
    const cur=coming?0:Math.min(m.need,Math.max(0,m.get(w)|0));
    const ready=!coming&&cur>=m.need&&!w.mis.claim[m.id];
    const claimed=!!w.mis.claim[m.id];
    return {id:m.id,cat:m.cat,n:m.n,d:m.d,need:m.need,cur,ready,claimed,coming,hide:!!m.hide&&!ready&&!claimed&&cur<m.need,r:m.r};
  }).filter(v=>!v.hide);
}

export function misToast(w,id){const m=MDEF.find(x=>x.id===id);if(!m)return;w.toast={t:`🎯 Mission ready: ${m.n} — claim in Missions`,pid:0}}
export {shopLvl};
