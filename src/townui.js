// Client: static merged Budville (unowned) + roads. Owned pieces stay in Build sync.
import * as THREE from 'three';
import {ROADS,PROPS,isTownGk,ownsTown,TOWN_V} from './town.js';
import * as BLD from './build.js';

let root=null,sig='',walls=[];

export function townWalls(){return walls}

function roadMat(k){
  const m=k==='walk'
    ? new THREE.MeshStandardMaterial({color:'#b8b4ac',roughness:.92})
    : new THREE.MeshStandardMaterial({color:'#3a3c40',roughness:.85});
  // kill z-fighting at abutting edges
  m.polygonOffset=true;m.polygonOffsetFactor=k==='walk'?-1:-2;m.polygonOffsetUnits=1;
  m.depthWrite=true;
  return m;
}

/** Build non-overlapping road meshes with layered Y (road under walk). */
function buildRoads(g){
  const roads=new THREE.Group();roads.name='roads';
  for(const r of ROADS){
    const w=r.x1-r.x0,d=r.z1-r.z0;
    if(w<=0||d<=0)continue;
    const y=r.k==='walk'?0.028:0.018;
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,.05,d),roadMat(r.k));
    m.position.set((r.x0+r.x1)/2,y,(r.z0+r.z1)/2);
    m.receiveShadow=true;m.castShadow=false;
    roads.add(m);
  }
  g.add(roads);
}

function mergeGroup(parts){
  const g=new THREE.Group();g.name='townStatic';
  for(const o of parts)g.add(o);
  return g;
}

/** Exposed-edge flags for roof pieces so gables/fascia render on town buildings. */
function roofExFlags(list){
  const R=new Set(list.filter(p=>p.k==='roof'||p.k==='roofs'||p.k==='roofr').map(p=>Math.round(p.x)+','+Math.round(p.z)));
  const _v=new THREE.Vector3(),_Y=new THREE.Vector3(0,1,0);
  return (p)=>{
    let f=0;
    for(const [b,lx,lz] of[[1,2,0],[2,-2,0],[4,0,2],[8,0,-2]]){
      _v.set(lx,0,lz).applyAxisAngle(_Y,-(p.r|0)*Math.PI/2);
      if(!R.has(Math.round(p.x+_v.x)+','+Math.round(p.z+_v.z)))f|=b;
    }
    return f;
  };
}

/** Rebuild static town when version/ownership changes. Returns wall AABBs. */
export function syncTownStatic(scene,w,pieceModel){
  const own=JSON.stringify(w?.props||{});
  const key=(w?._townV|0)+':'+own+':'+(w?.build||[]).filter(p=>isTownGk(p.gk)).length;
  if(key===sig&&root)return walls;
  sig=key;
  if(root){scene.remove(root);root.traverse(o=>{if(o.geometry)o.geometry.dispose?.()});root=null}
  walls=[];
  root=new THREE.Group();root.name='budville';
  buildRoads(root);
  const town=(w?.build||[]).filter(p=>isTownGk(p.gk)&&!ownsTown(w,p.gk));
  const exOf=roofExFlags(town);
  const parts=[];
  for(const p of town){
    const isR=p.k==='roof'||p.k==='roofs'||p.k==='roofr';
    const o=pieceModel(p.k,p.m,p.o,isR?exOf(p):0);
    o.position.set(p.x,0,p.z);o.rotation.y=-(p.r|0)*Math.PI/2;
    o.userData.bid=p.id;parts.push(o);
  }
  for(const p of town){
    if(!['wall','window','door','gdoor','rollup'].includes(p.k))continue;
    const sw=p.r&1,seg=(a,b)=>{const lo=Math.min(a,b),hi=Math.max(a,b);walls.push(sw?{x0:p.x-.1,x1:p.x+.1,z0:p.z+lo,z1:p.z+hi}:{x0:p.x+lo,x1:p.x+hi,z0:p.z-.1,z1:p.z+.1})};
    if(p.k==='door'){seg(-1,-.65);seg(.65,1);if(!p.o)seg(-.65,.65)}
    else if(p.k==='gdoor'||p.k==='rollup'){seg(-1,-.95);seg(.95,1);if(!p.o)seg(-.95,.95)}
    else seg(-1,1);
  }
  root.add(mergeGroup(parts));
  root.userData.cull=1;
  scene.add(root);
  return walls;
}

export function townCull(cam){
  if(!root||!cam)return;
  const dx=cam.position.x-30,dz=cam.position.z-30;
  const far=dx*dx+dz*dz>140*140;
  if(root.children[1])root.children[1].visible=!far||cam.position.z>5;
}

export function forsaleMesh(e){
  const g=new THREE.Group();
  const post=new THREE.Mesh(new THREE.BoxGeometry(.1,1.55,.1),new THREE.MeshStandardMaterial({color:'#5a3a1a',roughness:.9}));
  post.position.y=.78;g.add(post);
  const board=new THREE.Mesh(new THREE.BoxGeometry(1.1,.7,.05),new THREE.MeshStandardMaterial({color:'#fff8e8',roughness:.75,emissive:'#3a2a10',emissiveIntensity:.12}));
  board.position.set(0,1.35,.06);g.add(board);
  const cv=document.createElement('canvas');cv.width=256;cv.height=160;const x=cv.getContext('2d');
  x.fillStyle='#1a5a2a';x.fillRect(0,0,256,160);x.fillStyle='#fff';x.font='900 36px Nunito,sans-serif';x.textAlign='center';
  x.fillText('FOR SALE',128,55);x.font='800 28px Nunito,sans-serif';
  const P=PROPS.find(p=>p.id===e.data?.pid);x.fillText(P?('$'+P.price):'$$$',128,100);
  x.font='700 18px Nunito,sans-serif';x.fillText(P?.n||'',128,130);
  const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;
  const face=new THREE.Mesh(new THREE.PlaneGeometry(1.05,.65),new THREE.MeshBasicMaterial({map:tx}));
  face.position.set(0,1.35,.09);g.add(face);
  return g;
}
