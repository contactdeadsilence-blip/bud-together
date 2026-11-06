// Dispensary customers + town NPCs + staff (server-authoritative; client lerps).
import * as THREE from 'three';
import {makeHuman,animateAvatar,defLook} from './human.js';
const N=new Map();
// v1.7.4 perf: no per-frame allocations, reused name-tag canvas/texture, far NPCs animate at a lower rate
let _ani=0;const _buf=[];const _p0=new THREE.Vector3();
const pushU=(id,x,z,ry,lk,wk,meta)=>{let u=_buf[_ani];if(!u)u=_buf[_ani]={};u.id=id;u.x=x;u.z=z;u.ry=ry||0;u.lk=lk;u.wk=wk;u.meta=meta;_ani++};
export function tickNPC(W,scene,dt,cam,lowq){_ani=0;
 for(const u of W?.cust||[])pushU('c'+u.id,u.x,u.z,u.ry,u.lk|0,null,u);
 for(const u of W?.town||[])pushU('t'+u.id,u.x,u.z,u.ry,u.lk|0,null,u);
 for(const c of W?.crew||[])pushU('w'+c.k,c.x,c.z,c.ry,c.k=='cashier'?7:13,null,null);
 for(const v of W?.workers||[])pushU('k'+v.id,v.x,v.z,v.ry,v.k=='grower'?4:v.k=='trimmer'?9:10,v,null);
 const seen=new Set();
 for(let i=0;i<_ani;i++){const u=_buf[i];seen.add(u.id);let o=N.get(u.id);if(!o){const lk=defLook(u.lk%2?'f':'m',u.lk);o={g:makeHuman(lk),tp:new THREE.Vector3(u.x,0,u.z),spd:0,acc:0,meta:null};o.g.position.copy(o.tp);o.g.userData.npc=u.id;o.g.userData.nid=+(String(u.id).replace(/\D/g,''))||0;if(u.wk)o.g.add(o.tag=wkTag(u.wk));scene.add(o.g);N.set(u.id,o)}o.meta=u.meta;if(u.wk&&o.tag)wkTagSet(o.tag,u.wk);
  o.tp.set(u.x,0,u.z);o.g.rotation.y=u.ry||0;
  _p0.copy(o.g.position);o.g.position.lerp(o.tp,1-Math.exp(-dt*6));const sp=_p0.distanceTo(o.g.position)/Math.max(dt,1e-3);o.spd+=(sp-o.spd)*(1-Math.exp(-dt*5));
  const far=cam&&cam.position.distanceToSquared(o.g.position)>900;o.acc+=dt;if(!lowq||!far||o.acc>.08){animateAvatar(o.g,Math.min(o.acc,.2),{spd:o.spd});o.acc=0}}
 for(const [id,o] of N)if(!seen.has(id)){scene.remove(o.g);N.delete(id)}
}
export const npcCount=()=>N.size;
export function nearestNpc(W,px,pz,max=2.4){
  let best=null,bd=max;
  for(const list of [W?.cust,W?.town])if(list)for(const u of list){const d=Math.hypot(u.x-px,u.z-pz);if(d<bd){bd=d;best=u}}
  return best;
}
export const npcHold=id=>N.get('k'+id)?.g.userData.hold;
const WKN={grower:'Grower',trimmer:'Trimmer',packer:'Packer',stocker:'Shelf Stocker',extractor:'Extractor'};
function wkTag(v){const c=document.createElement('canvas');c.width=256;c.height=64;const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false});const s=new THREE.Sprite(m);s.scale.set(1.6,.4,1);s.position.set(0,2.15,0);s.userData.cv=c;s.userData.tx=t;wkTagSet(s,v);return s}
function wkTagSet(s,v){const c=s.userData.cv,x=c.getContext('2d'),lab=wkLbl(v);if(s.userData.lab===lab)return;s.userData.lab=lab;x.clearRect(0,0,256,64);x.fillStyle='rgba(0,0,0,.55)';x.roundRect(8,8,240,48,10);x.fill();x.fillStyle='#fff';x.font='700 22px Nunito,sans-serif';x.textAlign='center';x.fillText(lab.split('|')[0],128,30);x.font='600 16px Nunito,sans-serif';x.fillStyle='#b8f56a';x.fillText(lab.split('|')[1]||'',128,50);s.userData.tx.needsUpdate=true}
const wkLbl=v=>(WKN[v.k]||'Worker')+'|'+(v.st=='walk'?'on the way':v.st=='work'?'working':v.st=='off'?'off shift':'idle');
