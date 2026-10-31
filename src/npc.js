// v20: dispensary AI customers + staff rendering (server-authoritative positions; client lerps + animates).
import * as THREE from 'three';
import {makeHuman,animateAvatar,defLook} from './human.js';
const N=new Map();
// v1.7.4 perf: no per-frame allocations, reused name-tag canvas/texture, far NPCs animate at a lower rate
const _p0=new THREE.Vector3(),_buf=[];let _ani=0;
const pushU=(id,x,z,ry,lk,wk)=>{let u=_buf[_ani];if(!u)u=_buf[_ani]={};u.id=id;u.x=x;u.z=z;u.ry=ry||0;u.lk=lk;u.wk=wk;_ani++};
export function tickNPC(W,scene,dt,cam,lowq){_ani=0;for(const u of W?.cust||[])pushU('c'+u.id,u.x,u.z,u.ry,u.lk|0,null);for(const c of W?.crew||[])pushU('w'+c.k,c.x,c.z,c.ry,c.k=='cashier'?7:13,null);for(const v of W?.workers||[])pushU('k'+v.id,v.x,v.z,v.ry,v.k=='grower'?4:v.k=='trimmer'?9:10,v);
 const seen=tickNPC.seen??=new Set();seen.clear();
 for(let i=0;i<_ani;i++){const u=_buf[i];seen.add(u.id);let o=N.get(u.id);if(!o){const lk=defLook(u.lk%2?'f':'m',u.lk);o={g:makeHuman(lk),tp:new THREE.Vector3(u.x,0,u.z),spd:0,acc:0};o.g.position.copy(o.tp);o.g.userData.npc=u.id;if(u.wk)o.g.add(o.tag=wkTag(u.wk));scene.add(o.g);N.set(u.id,o)}if(u.wk&&o.tag)wkTagSet(o.tag,u.wk);
  o.tp.set(u.x,0,u.z);const d=cam?Math.hypot(cam.position.x-u.x,cam.position.z-u.z):0;o.g.visible=d<(lowq?28:45);if(!o.g.visible)continue;
  _p0.copy(o.g.position);o.g.position.lerp(o.tp,1-Math.exp(-dt*6));const sp=_p0.distanceTo(o.g.position)/Math.max(dt,1e-3);o.spd+=(sp-o.spd)*(1-Math.exp(-dt*5));
  let dr=u.ry+Math.PI-o.g.rotation.y;dr=Math.atan2(Math.sin(dr),Math.cos(dr));o.g.rotation.y+=dr*Math.min(1,dt*6);
  if(lowq&&d>14)continue;o.acc+=dt;const step=d>20?1/15:d>10?1/30:0;if(o.acc>=step){animateAvatar(o.g,o.acc,{spd:o.spd});o.acc=0}}
 for(const [k,o] of N)if(!seen.has(k)){scene.remove(o.g);if(o.tag){o.tag.material.map.dispose();o.tag.material.dispose()}N.delete(k)}}
export const npcCount=()=>N.size;
// v1.7.3 farm worker name tag + their hold group (held items parent here)
const WKN={grower:'🌱 Grower',trimmer:'✂ Harvester',fstock:'📦 Stocker'};
const wkLbl=v=>(WKN[v.k]||'Worker')+'|'+(v.st=='walk'?'on the way':v.st=='work'?'working':v.st=='off'?'off shift':'idle');
function wkDraw(c,l){const x=c.getContext('2d'),[a,b]=l.split('|');x.clearRect(0,0,256,64);x.fillStyle='rgba(20,40,25,.8)';x.beginPath();x.roundRect(4,4,248,56,14);x.fill();x.fillStyle='#bfffc8';x.font='bold 24px Nunito,sans-serif';x.textAlign='center';x.fillText(a,128,30);x.fillStyle='#fff';x.font='16px Nunito,sans-serif';x.fillText(b,128,52)}
function wkTag(v){const c=document.createElement('canvas');c.width=256;c.height=64;const l=wkLbl(v);wkDraw(c,l);
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true}));s.scale.set(1,.25,1);s.position.y=2.15;s.renderOrder=5;s.userData.k=l;s.userData.c=c;return s}
function wkTagSet(s,v){const l=wkLbl(v);if(s.userData.k===l)return;s.userData.k=l;wkDraw(s.userData.c,l);s.material.map.needsUpdate=true}
export const npcHold=id=>N.get('k'+id)?.g.userData.hold;
