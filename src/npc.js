// v20: dispensary AI customers + staff rendering (server-authoritative positions; client lerps + animates).
import * as THREE from 'three';
import {makeHuman,animateAvatar,defLook} from './human.js';
const N=new Map();
export function tickNPC(W,scene,dt,cam,lowq){const L=[...(W?.cust||[]).map(u=>({id:'c'+u.id,x:u.x,z:u.z,ry:u.ry||0,lk:u.lk|0,mv:u.mv})),...(W?.crew||[]).map((c,i)=>({id:'w'+c.k,x:c.x,z:c.z,ry:c.ry||0,lk:c.k=='cashier'?7:13,crew:1})),...(W?.workers||[]).map(v=>({id:'k'+v.id,x:v.x,z:v.z,ry:v.ry||0,lk:v.k=='grower'?4:v.k=='trimmer'?9:10,wk:v}))],seen=new Set();
 for(const u of L){seen.add(u.id);let o=N.get(u.id);if(!o){const lk=defLook(u.lk%2?'f':'m',u.lk);o={g:makeHuman(lk),lp:new THREE.Vector3(u.x,0,u.z),spd:0};o.g.position.copy(o.lp);o.g.userData.npc=u.id;if(u.wk)o.g.add(o.tag=wkTag(u.wk));scene.add(o.g);N.set(u.id,o)}if(u.wk&&o.tag&&o.tag.userData.k!==u.wk.st+u.wk.say){o.g.remove(o.tag);o.g.add(o.tag=wkTag(u.wk))}
  o.tp=new THREE.Vector3(u.x,0,u.z);const d=cam?Math.hypot(cam.position.x-u.x,cam.position.z-u.z):0;o.g.visible=d<(lowq?28:45);if(!o.g.visible)continue;
  const p0=o.g.position.clone();o.g.position.lerp(o.tp,1-Math.exp(-dt*6));const sp=p0.distanceTo(o.g.position)/Math.max(dt,1e-3);o.spd+=(sp-o.spd)*(1-Math.exp(-dt*5));
  let dr=u.ry+Math.PI-o.g.rotation.y;dr=Math.atan2(Math.sin(dr),Math.cos(dr));o.g.rotation.y+=dr*Math.min(1,dt*6);if(!(lowq&&d>14))animateAvatar(o.g,dt,{spd:o.spd})}
 for(const [k,o] of N)if(!seen.has(k)){scene.remove(o.g);N.delete(k)}}
export const npcCount=()=>N.size;
// v1.7.3 farm worker name tag + their hold group (held items parent here)
const WKN={grower:'🌱 Grower',trimmer:'✂ Harvester',fstock:'📦 Stocker'};
function wkTag(v){const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');x.fillStyle='rgba(20,40,25,.8)';x.beginPath();x.roundRect(4,4,248,56,14);x.fill();x.fillStyle='#bfffc8';x.font='bold 24px Nunito,sans-serif';x.textAlign='center';x.fillText(WKN[v.k]||'Worker',128,30);x.fillStyle='#fff';x.font='16px Nunito,sans-serif';x.fillText((v.st=='walk'?'on the way':v.st=='work'?'working':v.st=='off'?'off shift':'idle').slice(0,28),128,52);
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true}));s.scale.set(1,.25,1);s.position.y=2.15;s.renderOrder=5;s.userData.k=v.st+v.say;return s}
export const npcHold=id=>N.get('k'+id)?.g.userData.hold;
