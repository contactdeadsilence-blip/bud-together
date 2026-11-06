// Client: static merged Budville (unowned) + roads. Owned pieces stay in Build sync.
import * as THREE from 'three';
import {ROADS,PROPS,isTownGk,ownsTown,TOWN_V} from './town.js';
import * as BLD from './build.js';

let root=null,sig='',walls=[];
const _box=new THREE.Box3(),_v=new THREE.Vector3();

export function townWalls(){return walls}

function roadMat(k){
  if(k==='walk')return new THREE.MeshStandardMaterial({color:'#b8b4ac',roughness:.92});
  return new THREE.MeshStandardMaterial({color:'#3a3c40',roughness:.85});
}

function buildRoads(g){
  for(const r of ROADS){
    const w=r.x1-r.x0,d=r.z1-r.z0;
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,.06,d),roadMat(r.k));
    m.position.set((r.x0+r.x1)/2,.02,(r.z0+r.z1)/2);m.receiveShadow=true;g.add(m);
  }
}

function mergeGroup(parts){
  // group pieces by material key then merge geometries roughly via nesting (reuse piece models)
  const g=new THREE.Group();g.name='townStatic';
  for(const o of parts)g.add(o);
  return g;
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
  const parts=[];
  for(const p of (w?.build||[])){
    if(!isTownGk(p.gk))continue;
    if(ownsTown(w,p.gk))continue; // owned → Build sync
    const o=pieceModel(p.k,p.m,p.o,0);
    o.position.set(p.x,0,p.z);o.rotation.y=-(p.r|0)*Math.PI/2;
    o.userData.bid=p.id;parts.push(o);
    // walls for collision (same as build.js)
    const BP=null; // filled below via heuristic
  }
  // wall AABBs from unowned town pieces (mirror build.js logic lightly)
  for(const p of (w?.build||[])){
    if(!isTownGk(p.gk)||ownsTown(w,p.gk))continue;
    if(!['wall','window','door','gdoor','rollup'].includes(p.k))continue;
    const sw=p.r&1,seg=(a,b)=>{const lo=Math.min(a,b),hi=Math.max(a,b);walls.push(sw?{x0:p.x-.1,x1:p.x+.1,z0:p.z+lo,z1:p.z+hi}:{x0:p.x+lo,x1:p.x+hi,z0:p.z-.1,z1:p.z+.1})};
    if(p.k==='door'){seg(-1,-.65);seg(.65,1);if(!p.o)seg(-.65,.65)}
    else if(p.k==='gdoor'||p.k==='rollup'){seg(-1,-.95);seg(.95,1);if(!p.o)seg(-.95,.95)}
    else seg(-1,1);
  }
  root.add(mergeGroup(parts));
  // distance cull helper
  root.userData.cull=1;
  scene.add(root);
  return walls;
}

export function townCull(cam){
  if(!root||!cam)return;
  const dx=cam.position.x-30,dz=cam.position.z-30;
  const far=dx*dx+dz*dz>140*140;
  // keep roads always; hide far building children beyond view
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
