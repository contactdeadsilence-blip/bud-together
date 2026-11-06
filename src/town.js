// v1.11.0 Budville — map expansion + town buildings from player build pieces.
// Unowned town pieces are static (merged once). Owned pieces join editable build.
import {BP,BPF,bSlot,bExpand} from './rules.js';

export const TOWN_V=1;
// World playable bounds (player lot stays near origin)
export const MAP={x:95,zMin:-95,zMax:55};
export const bAllowedTown=(x,z)=>Math.abs(x)<MAP.x&&z>MAP.zMin&&z<MAP.zMax;

// Prefab helpers (tile units of 2m)
function boxL(W,D,m,o={}){const L=[],rf=o.roof!==false;for(let i=0;i<W;i++)for(let j=0;j<D;j++){L.push(['floor',2*i,2*j,0,o.fm??0]);if(rf){const mid=(D-1)/2;L.push(D%2&&j==mid?['roofr',2*i,2*j,0,o.rm??m]:['roofs',2*i,2*j,j<mid?0:2,o.rm??m])}}
 for(let i=0;i<W;i++){const mid=i===(W-1>>1);if(!o.openBack)L.push([o.backWin&&mid?'window':'wall',2*i,-1,0,m]);L.push([mid?(o.front||'door'):(o.win&&i!==mid?'window':'wall'),2*i,2*D-1,0,m])}
 for(let j=0;j<D;j++){const w=o.win&&j===(D-1>>1)?'window':'wall';L.push([w,-1,2*j,1,m]);L.push([w,2*W-1,2*j,1,m])}return L}
function shopL(W,D,m){const L=boxL(W,D,m,{front:'door',win:1,fm:0,rm:m===1?2:0});
 // sales fixtures on larger shops
 if(W>=3){L.push(['dcase',0,2*D-1,0,0],['dcount',2,2*D-3,0,0],['dshelf',2*W-2,0,0,0])}
 return L}

/** Catalog of buyable town properties. grow:1 counts toward second-property mission. */
export const PROPS=[
  {id:'cafe',n:'Bud Cafe',price:3500,ox:18,oz:26,kind:'shop',L:()=>boxL(3,3,4,{front:'door',win:1,fm:0,rm:0}),grow:0},
  {id:'general',n:'General Store',price:5500,ox:30,oz:26,kind:'shop',L:()=>shopL(4,3,1),grow:0},
  {id:'hardware',n:'Hardware & Supply',price:4800,ox:44,oz:26,kind:'shop',L:()=>boxL(3,3,2,{front:'door',win:1,fm:2,rm:2}),grow:0},
  {id:'realty',n:'Real Estate Office',price:4000,ox:18,oz:40,kind:'shop',L:()=>boxL(3,2,5,{front:'door',win:1}),grow:0},
  {id:'house_a',n:'Maple Cottage',price:8500,ox:-22,oz:26,kind:'house',L:()=>boxL(3,3,0,{front:'door',win:1}),grow:1},
  {id:'house_b',n:'Pine Bungalow',price:7800,ox:-36,oz:26,kind:'house',L:()=>boxL(3,3,6,{front:'door',win:1}),grow:1},
  {id:'lot_a',n:'Empty Lot A',price:2500,ox:-50,oz:26,kind:'lot',L:()=>[['floor',0,0,0,2],['floor',2,0,0,2],['floor',0,2,0,2],['floor',2,2,0,2]],grow:1},
  {id:'lot_b',n:'Empty Lot B',price:3000,ox:58,oz:26,kind:'lot',L:()=>[['floor',0,0,0,2],['floor',2,0,0,2],['floor',0,2,0,2],['floor',2,2,0,2]],grow:1},
];

export const propOf=id=>PROPS.find(p=>p.id===id);
export const ownedGrow=(w)=>PROPS.filter(p=>p.grow&&w.props?.[p.id]).length;
export const isTownGk=gk=>!!gk&&String(gk).startsWith('town_');
export const townIdOf=gk=>isTownGk(gk)?gk.slice(5):null;
export const ownsTown=(w,gk)=>{const id=townIdOf(gk);return id?!!w.props?.[id]:true};

function pushProp(w,P){
  const B=w.build??=[],used=new Set(B.map(p=>bSlot(p.k,p.x,p.z,p.r))),gid=w.nid++,gk='town_'+P.id;
  for(const [pk,tx,tz,pr,m] of P.L()){
    const x=P.ox+tx,z=P.oz+tz,r=pr|0;if(used.has(bSlot(pk,x,z,r)))continue;
    const open=pk==='door'||pk==='gdoor'||pk==='rollup'?1:0;
    B.push({id:w.nid++,k:pk,x,z,r,m:m||0,o:open,g:gid,gk});used.add(bSlot(pk,x,z,r));
  }
  return gid;
}

function ensureSign(w,P){
  w.ents??=[];
  const sx=P.ox+(P.kind==='lot'?1:2),sz=P.oz+(P.kind==='lot'?-2:P.kind==='shop'?7:5);
  if(w.ents.some(e=>e.type==='forsale'&&e.data?.pid===P.id))return;
  w.ents.push({id:w.nid++,type:'forsale',x:sx,y:0,z:sz,ry:0,by:0,data:{pid:P.id}});
}

/** Idempotent town seed + map migration. Call from addV11. */
export function seedTown(w){
  if(!w)return;
  w.build??=[];w.ents??=[];w.nid??=1;w.props??={};
  // always ensure props keys exist
  for(const P of PROPS)w.props[P.id]=w.props[P.id]|0;
  if((w._townV|0)>=TOWN_V){
    // refresh signs for unowned
    for(const P of PROPS){if(!w.props[P.id])ensureSign(w,P);else w.ents=w.ents.filter(e=>!(e.type==='forsale'&&e.data?.pid===P.id))}
    return;
  }
  // wipe prior town_* if any then rebuild
  w.build=w.build.filter(p=>!isTownGk(p.gk));
  w.ents=w.ents.filter(e=>e.type!=='forsale');
  for(const P of PROPS){pushProp(w,P);if(!w.props[P.id])ensureSign(w,P)}
  w._townV=TOWN_V;w._sv=1;
}

export function buyProp(w,id,say){
  const P=propOf(id);if(!P)return say('Unknown property');
  w.props??={};if(w.props[P.id])return say('You already own '+P.n);
  if((w.money|0)<P.price)return say(`Need $${P.price} for ${P.n}`);
  w.money-=P.price;w.props[P.id]=1;
  w.ents=(w.ents||[]).filter(e=>!(e.type==='forsale'&&e.data?.pid===P.id));
  // optional: register as business branch for shop kinds
  if(P.kind==='shop'){const b=w.biz||(w.biz={name:'Bud Co',opened:0,locs:[{id:'home',upg:{},staff:{},inv:[],today:0}],cur:0,rep:0,clean:70,sat:[],reviews:[],hist:[],today:{rev:0,sales:0,lost:0}});
    b.locs??=[{id:'home'}];if(!b.locs.some(l=>l.id===P.id))b.locs.push({id:P.id,staff:{},upg:{},inv:[],today:0,prop:1})}
  w.sound='cash';w._sv=1;
  return say(`🏡 Bought ${P.n} for $${P.price}! Build mode can edit it.`+(P.grow?' · Grow/property mission progress!':''));
}

/** Door / visit points for town NPCs */
export function townDoors(w){
  return PROPS.map(P=>{
    const door=(w.build||[]).find(p=>p.gk==='town_'+P.id&&p.k==='door');
    const x=door?door.x:P.ox+2,z=door?door.z+(door.r&1?0:1.2):P.oz+6;
    return {id:P.id,n:P.n,x,z,own:!!w.props?.[P.id]};
  });
}

/** Road/sidewalk rectangles for client static mesh (not build pieces). */
export const ROADS=[
  // main street east-west through town
  {x0:-55,x1:70,z0:20,z1:24,k:'road'},
  {x0:-55,x1:70,z0:24,z1:25.2,k:'walk'},
  {x0:-55,x1:70,z0:18.8,z1:20,k:'walk'},
  // spur north to realty
  {x0:16,x1:24,z0:24,z1:42,k:'road'},
  {x0:15,x1:16,z0:24,z1:42,k:'walk'},
  {x0:24,x1:25,z0:24,z1:42,k:'walk'},
  // path from player lot up to main street
  {x0:-2.5,x1:2.5,z0:8,z1:21,k:'road'},
  {x0:-3.5,x1:-2.5,z0:8,z1:21,k:'walk'},
  {x0:2.5,x1:3.5,z0:8,z1:21,k:'walk'},
];
