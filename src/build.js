// v18 Section 5: Build mode — grid walls/floors/doors/windows/roofs, prefab buildings, furniture placement, materials.
import * as THREE from 'three';
import {BP,BPF,BMAT,PAINTP,bSlot,bExpand,bAllowed,onBFloor,DECOR} from './rules.js';
let C=null;const G=new THREE.Group();G.name='build';let B=[],STOCK={},on=false,cat=0,idx=[0,0,0,0,0],rot=0,mi=0,ghost=null,gk='',gp=null,aimId=null,hud=null,selBox=null,walls=[];
const FURN=()=>Object.keys(DECOR).filter(k=>DECOR[k].s!='wall');
const CATS=[['🧱 Walls',()=>['wall','door','window','gdoor']],['⬛ Floors & Roofs',()=>['floor','roof']],['🏠 Buildings',()=>['room','greenhouse','garage','shed','ext','expand']],['🛋 Furniture',()=>FURN().map(k=>'f:'+k)],['🎨 Colors & Materials',()=>BMAT.map((_,i)=>'m:'+i)]];
const cur=()=>{const L=CATS[cat][1]();idx[cat]=((idx[cat]%L.length)+L.length)%L.length;return L[idx[cat]]};
const nameOf=k=>k=='expand'?'Expand Shed Grow Room':k.startsWith('f:')?DECOR[k.slice(2)].n:k.startsWith('m:')?BMAT[+k.slice(2)][1]:(BP[k]||BPF[k]).n;
const priceOf=k=>k=='expand'?500:k.startsWith('f:')?DECOR[k.slice(2)].p:k.startsWith('m:')?PAINTP:(BP[k]||BPF[k]).p;
const stockOf=k=>k.startsWith('f:')?STOCK['f_'+k.slice(2)]||0:STOCK[k]||0;
const MC={};function M(i){if(MC[i])return MC[i];const [t,,c]=BMAT[i]||BMAT[0];return MC[i]=t=='glass'?new THREE.MeshStandardMaterial({color:'#dff4ff',transparent:true,opacity:.28,roughness:.05,metalness:.1,depthWrite:false,side:THREE.DoubleSide}):C.mats[t]?C.mats[t]:new THREE.MeshStandardMaterial({color:c,roughness:.85})}
const GLASS=()=>MC.g||(MC.g=new THREE.MeshStandardMaterial({color:'#dff4ff',transparent:true,opacity:.25,roughness:.04,metalness:.15,depthWrite:false,side:THREE.DoubleSide}));
const FR=()=>MC.f||(MC.f=new THREE.MeshStandardMaterial({color:'#3a3530',roughness:.6}));
function bx(g,w,h,d,m,x,y,z){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=m.transparent?false:true;g.add(o);return o}
export function pieceModel(k,m=0,o=0){const g=new THREE.Group(),mt=M(m),T=.15;
 if(k=='wall')bx(g,2,3,T,mt,0,1.5,0);
 else if(k=='window'){bx(g,2,.9,T,mt,0,.45,0);bx(g,2,.7,T,mt,0,2.65,0);bx(g,.4,1.4,T,mt,-.8,1.6,0);bx(g,.4,1.4,T,mt,.8,1.6,0);bx(g,1.2,1.4,.02,GLASS(),0,1.6,0);for(const [w,h,x,y] of [[1.24,.05,0,.92],[1.24,.05,0,2.28],[.05,1.4,-.6,1.6],[.05,1.4,.6,1.6],[.03,1.4,0,1.6]])bx(g,w,h,.17,FR(),x,y,0)}
 else if(k=='door'){bx(g,.5,3,T,mt,-.75,1.5,0);bx(g,.5,3,T,mt,.75,1.5,0);bx(g,1,.8,T,mt,0,2.6,0);const h=new THREE.Group();h.position.set(-.5,0,0);const d=bx(h,.98,2.18,.06,C.mats.door||mt,.49,1.1,0);d.userData.door=1;const kn=bx(h,.06,.06,.12,FR(),.88,1.05,0);g.add(h);g.userData.hinge=h;h.rotation.y=o?-1.45:0}
 else if(k=='gdoor'){bx(g,2,.6,T,mt,0,2.7,0);const p=new THREE.Group();for(let i=0;i<6;i++)bx(p,1.96,.38,.06,C.mats.metal,0,.2+i*.4,0);g.add(p);g.userData.lift=p;p.position.y=o?2.1:0}
 else if(k=='floor')bx(g,2,.08,2,mt,0,.04,0);
 else if(k=='roof')bx(g,2.08,.1,2.08,mt,0,3.05,0);
 return g}
function prefabModel(k,m){const g=new THREE.Group();for(const p of bExpand(k,0,0,0)){const o=pieceModel(p.k,BPF[k]?p.m:m);o.position.set(p.x,0,p.z);o.rotation.y=-p.r*Math.PI/2;g.add(o)}return g}
export function thumbModel(t){const k=t.slice(2);if(k.startsWith('f_'))return C.decoModel(k.slice(2));if(BP[k])return pieceModel(k,k=='window'?4:0);const g=prefabModel(k,0);g.scale.setScalar(.35);return g}
export function init(ctx){C=ctx;C.scene.add(G);hud=document.createElement('div');hud.id='buildhud';hud.style.cssText='position:fixed;left:50%;bottom:86px;transform:translateX(-50%);z-index:7;display:none;background:rgba(14,20,16,.86);color:#eef;border:1px solid #6c8;border-radius:12px;padding:8px 12px;font:14px system-ui;text-align:center;max-width:94vw';document.body.appendChild(hud);
 hud.addEventListener('click',e=>{const b=e.target.closest('[data-bc],[data-bi],[data-bx]');if(!b)return;if(b.dataset.bc!=null){cat=+b.dataset.bc;setGhost()}else if(b.dataset.bi!=null){idx[cat]+=+b.dataset.bi;setGhost()}else if(b.dataset.bx=='exit')toggle(false);C.sfx('ui');renderHud()})}
// world sync
const pkey=p=>p.k+p.m;
export function sync(list,stock){STOCK=stock||{};const L=list||[];const old=new Map(G.children.map(o=>[o.userData.bid,o]));G.clear();walls=[];
 for(const p of L){let o=old.get(p.id);if(!o||o.userData.key!=pkey(p)){o=pieceModel(p.k,p.m,p.o);o.position.set(p.x,0,p.z);o.rotation.y=-p.r*Math.PI/2}o.userData.bid=p.id;o.userData.key=pkey(p);o.userData.o=p.o;G.add(o);
  if(BP[p.k].c!='w')continue;const sw=p.r&1,seg=(a,b)=>{const lo=Math.min(a,b),hi=Math.max(a,b);walls.push(sw?{x0:p.x-.1,x1:p.x+.1,z0:p.z+lo,z1:p.z+hi,bid:p.id}:{x0:p.x+lo,x1:p.x+hi,z0:p.z-.1,z1:p.z+.1,bid:p.id})};
  if(p.k=='door'){seg(-1,-.5);seg(.5,1);if(!p.o)seg(-.5,.5)}else if(p.k=='gdoor'){seg(-1,-.95);seg(.95,1);if(!p.o)seg(-.95,.95)}else seg(-1,1)}
 B=L;C.setWalls(walls);if(on)renderHud()}
export const wallsList=()=>walls;
export function tick(dt){for(const o of G.children){const h=o.userData.hinge,l=o.userData.lift;if(h){const tg=o.userData.o?-1.45:0;h.rotation.y+=(tg-h.rotation.y)*Math.min(1,dt*6)}if(l){const tg=o.userData.o?2.1:0;l.position.y+=(tg-l.position.y)*Math.min(1,dt*4)}}if(on)frame()}
export function doorTargets(){return B.filter(p=>p.k=='door'||p.k=='gdoor').map(p=>({fx:'bdoor',id:p.id,o:p.o,p:new THREE.Vector3(p.x,1.2,p.z)}))}
// aim
const rc=new THREE.Raycaster(),dir=new THREE.Vector3();
function aimPiece(){C.camera.getWorldDirection(dir);rc.set(C.camera.position,dir);rc.far=7;const h=rc.intersectObjects(G.children,true)[0];if(!h)return null;let o=h.object;while(o&&o.parent!==G)o=o.parent;return o?B.find(p=>p.id==o.userData.bid):null}
function groundPt(){C.camera.getWorldDirection(dir);const e=C.camera.position;let t=dir.y<-.05?-e.y/dir.y:6;t=Math.min(t,10);return new THREE.Vector3(e.x+dir.x*t,0,e.z+dir.z*t)}
function snap(k,pt){const ev=v=>Math.round(v/2)*2,od=v=>Math.round((v-1)/2)*2+1;if(k.startsWith('f:'))return {x:Math.round(pt.x*2)/2,z:Math.round(pt.z*2)/2};if(BP[k]?.c=='w')return rot&1?{x:od(pt.x),z:ev(pt.z)}:{x:ev(pt.x),z:od(pt.z)};return {x:ev(pt.x),z:ev(pt.z)}}
function setGhost(){const k=cur();if(gk==k&&ghost)return;if(ghost){C.scene.remove(ghost);ghost=null}gk=k;if(k=='expand'||k.startsWith('m:'))return;ghost=k.startsWith('f:')?C.decoModel(k.slice(2)):BP[k]?pieceModel(k,mi):prefabModel(k,mi);ghost.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.transparent=true;o.material.opacity=.45;o.material.depthWrite=false;o.castShadow=false;o.userData.gm=1}});C.scene.add(ghost)}
function tint(ok){ghost?.traverse(o=>{if(o.isMesh)o.material.emissive?.set(ok?'#1a6a2a':'#8a1a1a')})}
function frame(){const k=cur();aimId=null;if(selBox){C.scene.remove(selBox);selBox=null}
 const ap=aimPiece();if(ap&&(k.startsWith('m:')||!ghost||C.keysDel)){aimId=ap.id}
 if(ap){const o=G.children.find(c=>c.userData.bid==ap.id);if(o){selBox=new THREE.BoxHelper(o,k.startsWith('m:')?'#7fd3ff':'#ffd23f');C.scene.add(selBox)}}
 if(ghost){const s=snap(k,groundPt());gp={...s,ok:true};if(k.startsWith('f:')){const W=C.W(),Rb=C.ROOMB(W?.room||1);gp.ok=s.x>Rb.x0&&s.x<Rb.x1&&s.z>Rb.z0&&s.z<Rb.z1||onBFloor(B,s.x,s.z);ghost.rotation.y=rot*Math.PI/2}else{const L=bExpand(k,s.x,s.z,rot),used=new Set(B.map(p=>bSlot(p.k,p.x,p.z,p.r)));gp.ok=L.every(p=>bAllowed(p.x,p.z))&&L.some(p=>!used.has(bSlot(p.k,p.x,p.z,p.r)));ghost.rotation.y=-rot*Math.PI/2}ghost.position.set(s.x,0,s.z);tint(gp.ok)}
 if(C.frames()%12==0)renderHud();if(ap)lastAim=ap;else lastAim=null}
let lastAim=null;
function renderHud(){if(!on)return;const k=cur(),p=C.padMode(),g=C.glyph,st=stockOf(k),ap=lastAim;
 const tabs=CATS.map((c,i)=>`<button data-bc="${i}" style="margin:2px;padding:3px 8px;border-radius:8px;border:0;background:${i==cat?'#3c9a5a':'#2a332e'};color:#fff;cursor:pointer">${c[0]}</button>`).join('');
 const act=k=='expand'?(C.W()?.room>1?'Already expanded':'Expand ($500, needs 5★)'):k.startsWith('m:')?(ap?`Paint ${BP[ap.k].n} ($${PAINTP})`:'Aim at a wall/floor to apply'):gp?.ok?(st?`Place (in stock: ${st})`:`Buy & place $${priceOf(k)}`):'<span style="color:#ff7a6a">Can\'t place here</span>';
 hud.innerHTML=`<div><b>🔨 BUILD MODE</b> · Money $${C.W()?.money??0}</div><div>${tabs}</div><div style="margin:4px 0"><button data-bi="-1" style="border:0;background:#2a332e;color:#fff;border-radius:6px;cursor:pointer">◀</button> <b>${nameOf(k)}</b> · $${priceOf(k)}${st?` · 📦${st} owned`:''}${BP[k]?` · ${BMAT[mi][1]}`:''} <button data-bi="1" style="border:0;background:#2a332e;color:#fff;border-radius:6px;cursor:pointer">▶</button></div>
 <div style="font-size:12px;opacity:.9">${p?g(0):'<span class="g">E</span>/Click'} ${act} · ${p?g(6)+g(7):'<span class="g">R</span>'} Rotate · ${p?g(4)+g(5):'<span class="g">[</span><span class="g">]</span>'} Category · ${p?g(14)+g(15):'<span class="g">←</span><span class="g">→</span>/Wheel'} Item · ${p?g(3):'<span class="g">X</span>'} Delete${ap?' '+BP[ap.k].n:''} · ${p?g(2):'<span class="g">F</span>'} Move · ${BP[k]?(p?g(13):'<span class="g">T</span>')+' Material · ':''}${p?g(1):'<span class="g">B</span>/Esc'} Exit <button data-bx="exit" style="border:0;background:#7a3030;color:#fff;border-radius:6px;cursor:pointer">✕</button></div>`}
export const isOn=()=>on;
export function toggle(v=!on){if(v==on)return;if(v&&!C.W())return;on=v;hud.style.display=on?'block':'none';if(on){C.onEnter();setGhost();C.toast('Build mode — place walls, floors, doors, windows, buildings and furniture')}else{if(ghost){C.scene.remove(ghost);ghost=null}gk='';if(selBox){C.scene.remove(selBox);selBox=null}}C.sfx('ui');renderHud()}
export function act(){const k=cur(),W=C.W();if(!W)return;
 if(k=='expand'){if(W.room>1)return C.toast('Your grow room is already expanded');C.send({t:'upgrade'});return}
 if(k.startsWith('m:')){const ap=aimPiece();if(!ap)return C.toast('Aim at a built wall, floor or roof to paint it');C.send({t:'bpaint',id:ap.id,m:+k.slice(2)});return}
 if(!gp?.ok){C.toast("Can't place that there");C.sfx('err');return}
 if(!stockOf(k)&&W.money<priceOf(k)){C.toast(`Need $${priceOf(k)} — or buy it at budsupply.shop → Furniture & Construction`);C.sfx('err');return}
 if(k.startsWith('f:'))C.send({t:'dplace',k:k.slice(2),x:gp.x,y:0,z:gp.z,ry:rot*Math.PI/2});else C.send({t:'bplace',k,x:gp.x,z:gp.z,r:rot,m:mi})}
export function del(){const ap=aimPiece();if(ap){C.send({t:'bdel',id:ap.id});return}if(!C.decoRemoveAim())C.toast('Aim at a built piece or furniture to delete it')}
export function move(){const ap=aimPiece();if(ap){C.send({t:'bdel',id:ap.id});const L=CATS.findIndex(c=>c[1]().includes(ap.k));cat=L;idx[cat]=CATS[cat][1]().indexOf(ap.k);mi=ap.m;rot=ap.r;setGhost();gk='';setGhost();C.toast('Moving '+BP[ap.k].n+' — place it again');return}const d=C.decoAim();if(d){toggle(false);C.decoGrab(d);return}C.toast('Aim at a piece or furniture to move it')}
export const rotate=d=>{rot=(rot+d+4)%4;C.sfx('ui')};
export function cycleCat(d){cat=(cat+d+CATS.length)%CATS.length;setGhost();renderHud();C.sfx('ui')}
export function cycleItem(d){idx[cat]+=d;setGhost();renderHud();C.sfx('ui')}
export function cycleMat(){mi=(mi+1)%BMAT.length;if(ghost&&BP[gk]){gk='';setGhost()}C.toast('Material: '+BMAT[mi][1]);renderHud()}
export function key(code,e){if(code=='KeyB'||code=='Escape'){toggle(false);return true}if(code=='KeyE')act();else if(code=='KeyX'||code=='Delete')del();else if(code=='KeyF')move();else if(code=='KeyR')rotate(e?.shiftKey?-1:1);else if(code=='BracketLeft')cycleCat(-1);else if(code=='BracketRight')cycleCat(1);else if(code=='ArrowLeft')cycleItem(-1);else if(code=='ArrowRight')cycleItem(1);else if(code=='KeyT')cycleMat();else if(/^Digit[1-5]$/.test(code)){cat=+code[5]-1;setGhost();renderHud()}else return false;return true}
// Xbox: LB/RB category · D-pad ◀▶ item · LT/RT rotate · A place · B exit · Y delete · X move · D-pad ▼ material · D-pad ▲ exit
export function pad(E){if(E[4])cycleCat(-1);if(E[5])cycleCat(1);if(E[14])cycleItem(-1);if(E[15])cycleItem(1);if(E[6])rotate(1);if(E[7])rotate(-1);if(E[0])act();if(E[3])del();if(E[2])move();if(E[13])cycleMat();if(E[1]||E[12])toggle(false)}
export const state=()=>({on,cat,item:cur(),rot,mi,ok:!!gp?.ok,gp,n:B.length,stock:STOCK,walls:walls.length,aim:lastAim?.id||null});
export const setSel=(c,i)=>{cat=c;idx[c]=i;setGhost();renderHud()};
