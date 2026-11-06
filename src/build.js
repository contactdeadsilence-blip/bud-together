// v18 Section 5: Build mode — grid walls/floors/doors/windows/roofs, prefab buildings, furniture placement, materials.
import * as THREE from 'three';
import {DCAP,BP,BPF,BMAT,PAINTP,bSlot,bExpand,bAllowed,onBFloor,DECOR} from './rules.js';
let C=null;const G=new THREE.Group();G.name='build';let B=[],STOCK={},on=false,cat=0,idx=[0,0,0,0,0,0],rot=0,mi=0,ghost=null,gk='',gp=null,aimId=null,hud=null,selBox=null,walls=[];
const FURN=()=>Object.keys(DECOR).filter(k=>DECOR[k].s!='wall');
const CATS=[['🧱 Walls',()=>['wall','door','window','gdoor']],['⬛ Floors & Roofs',()=>['floor','roof','roofs','roofr']],['🏠 Buildings',()=>['room','greenhouse','garage','shed','ext','expand']],['🏪 Dispensary',()=>['disp','dcase','dcount','dshelf','dsign','rollup']],['🛋 Furniture',()=>FURN().map(k=>'f:'+k)],['🎨 Colors & Materials',()=>BMAT.map((_,i)=>'m:'+i)]];
const cur=()=>{const L=CATS[cat][1]();idx[cat]=((idx[cat]%L.length)+L.length)%L.length;return L[idx[cat]]};
const nameOf=k=>k=='expand'?'Expand Shed (editable pieces)':k.startsWith('f:')?DECOR[k.slice(2)].n:k.startsWith('m:')?BMAT[+k.slice(2)][1]:(BP[k]||BPF[k]).n;
const priceOf=k=>k=='expand'?500:k.startsWith('f:')?DECOR[k.slice(2)].p:k.startsWith('m:')?PAINTP:(BP[k]||BPF[k]).p;
const stockOf=k=>k.startsWith('f:')?STOCK['f_'+k.slice(2)]||0:STOCK[k]||0;
import {pmat,WOOD,PANEL,FLOOR,SURF} from './pbr.js';
// v20: detailed pieces — siding/brick/corrugated exteriors, baseboards, crown trim, corner posts, window sills/casings, plank/paver floors, shingle roofs with fascia, pitched roofs with gable ends
const MC={},GC={};const RISE=1;
const bt=(i)=>(BMAT[i]||BMAT[0]);
function cache(k,f){return MC[k]||(MC[k]=f())}
function M(i){const [t,,c]=bt(i);return t=='glass'?GLASS():cache('e'+i,()=>t=='wood'?pmat(SURF.siding(),.7,1.1,{ns:1.2}):t=='brick'?pmat(PANEL.brick(),1,1.4,{color:'#d27a5e',ns:1.15}):t=='metal'?pmat(SURF.paintMetal('#97a0a8','bm'),1.1,.95,{metalness:.55,roughness:.45,ns:1.1}):pmat(PANEL.shiplap(),.7,1.1,{color:c,ns:1.15}))}
function FLM(i){const [t,,c]=bt(i);return t=='glass'?GLASS():cache('f'+i,()=>t=='wood'?pmat(WOOD.oak(),.85,.85,{ns:1.1}):t=='brick'?pmat(PANEL.brick(),1.6,1.6,{color:'#b88070',ns:1.1}):t=='metal'?pmat(SURF.brushed(),2,2,{metalness:.7,roughness:.35}):pmat(FLOOR.concrete(),.9,.9,{color:c,ns:1.05}))}
function RFM(i){const [t]=bt(i);return t=='glass'?GLASS():cache('r'+i,()=>t=='metal'?pmat(SURF.paintMetal('#6f7a82','rm'),1.2,1,{metalness:.6,roughness:.4,ns:1.15}):pmat(SURF.shingle(),.85,1,{ns:1.2}))}
const TRIM=()=>cache('trim',()=>pmat(WOOD.dark(),1,.2,{color:'#c8a890'}));
const WTRIM=()=>cache('wtrim',()=>pmat(WOOD.oak(),1,.15,{color:'#e8dfd0'}));
const CEIL=()=>cache('ceil',()=>pmat(PANEL.drywall(),1,1,{color:'#efece6'}));
const GLASS=()=>MC.g||(MC.g=new THREE.MeshPhysicalMaterial({color:'#cfefff',transparent:true,opacity:.22,roughness:.02,metalness:.05,transmission:.55,thickness:.4,ior:1.45,depthWrite:false,side:THREE.DoubleSide}));
const DOORM=()=>cache('doorm',()=>pmat(WOOD.door(),1,1.2,{ns:1.15}));
const FR=()=>MC.f||(MC.f=new THREE.MeshStandardMaterial({color:'#3a3530',roughness:.6}));
const BG=(w,h,d)=>{const k=w+'|'+h+'|'+d;return GC[k]||(GC[k]=new THREE.BoxGeometry(w,h,d))};
function bx(g,w,h,d,m,x,y,z){const o=new THREE.Mesh(BG(w,h,d),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=m.transparent||m[0]?.transparent?false:true;g.add(o);return o}
const lowq=()=>C?.lowq?.()||false;
// core slab with trim-coloured edges, exterior both faces; + baseboards, crown, end post
function core(g,w,h,x,y,mt,T){if(mt.transparent)return bx(g,w,h,T*.3,mt,x,y,0);const tr=TRIM();return bx(g,w,h,T,[tr,tr,tr,tr,mt,mt],x,y,0)}
function dress(g,mt,T,post=true){if(lowq()||mt.transparent)return;const tr=TRIM();bx(g,2,.14,T+.05,tr,0,.07,0);bx(g,2,.08,T+.05,tr,0,2.96,0);if(post)bx(g,.14,3,T+.06,tr,.93,1.5,0)}
const JCOL=s=>C?.strainCol?.(s)||'#7a2fd0',JC=['#7a2fd0','#f0cf4a','#3fa04a','#d04a7a','#4a8ad0','#e8862e'];
function stockMeshes(g,st,y0,dy,rows=1){if(!Array.isArray(st))return;const jg=GC.jar||(GC.jar=new THREE.CylinderGeometry(.07,.07,.16,10)),lg=GC.lid||(GC.lid=new THREE.CylinderGeometry(.072,.072,.03,10));st.forEach((c,i)=>{const per=rows>1?2:6,r=Math.floor(i/per),j=i%per,x=-.6+j*(rows>1?1.2:.24),y=y0+r*dy+.08;const m=cache('jar'+c,()=>new THREE.MeshStandardMaterial({color:c,roughness:.2,transparent:true,opacity:.8}));const o=new THREE.Mesh(jg,m);o.position.set(x,y,0);g.add(o);const l=new THREE.Mesh(lg,FR());l.position.set(x,y+.095,0);g.add(l)})}
export function gableTri(m){const s=new THREE.Shape([new THREE.Vector2(-1,0),new THREE.Vector2(1,0),new THREE.Vector2(1,RISE)]);const geo=GC.gt||(GC.gt=new THREE.ShapeGeometry(s));const o=new THREE.Mesh(geo,m.transparent?m:cache('gs'+m.uuid,()=>{const c=m.clone();c.side=THREE.DoubleSide;return c}));o.rotation.y=-Math.PI/2;o.castShadow=o.receiveShadow=!m.transparent;return o}
export function pieceModel(k,m=0,o=0,ex=0){const g=new THREE.Group(),mt=M(m),T=.15,lq=lowq();
 if(k=='wall'){core(g,2,3,0,1.5,mt,T);dress(g,mt,T)}
 else if(k=='window'){core(g,2,.9,0,.45,mt,T);core(g,2,.7,0,2.65,mt,T);core(g,.4,1.4,-.8,1.6,mt,T);core(g,.4,1.4,.8,1.6,mt,T);bx(g,1.2,1.4,.02,GLASS(),0,1.6,0);for(const [w,h,x,y] of [[1.24,.05,0,.92],[1.24,.05,0,2.28],[.05,1.4,-.6,1.6],[.05,1.4,.6,1.6],[.03,1.4,0,1.6],[1.2,.03,0,1.6]])bx(g,w,h,.17,FR(),x,y,0);
  if(!lq&&!mt.transparent){const w=WTRIM();bx(g,1.46,.06,.34,w,0,.88,0);for(const x of[-.67,.67])bx(g,.1,1.5,T+.07,w,x,1.6,0);bx(g,1.5,.1,T+.07,w,0,2.36,0)}dress(g,mt,T)}
 else if(k=='door'){core(g,1.5,3,-1.25,1.5,mt,T);core(g,1.5,3,1.25,1.5,mt,T);core(g,1,.8,0,2.6,mt,T);const h=new THREE.Group();h.position.set(-.5,0,0);const dm=DOORM();const d=bx(h,.98,2.18,.06,dm,.49,1.1,0);d.userData.door=1;bx(h,.06,.06,.12,FR(),.88,1.05,0);
  if(!lq)for(const y of[.6,1.55])for(const s of[-1,1])bx(h,.7,.7,.012,dm,.49,y,s*.034);g.add(h);g.userData.hinge=h;h.rotation.y=o?-1.45:0;
  if(!lq&&!mt.transparent){const w=WTRIM();for(const x of[-.55,.55])bx(g,.1,2.3,T+.07,w,x,1.15,0);bx(g,1.2,.12,T+.07,w,0,2.28,0)}if(!lq&&!mt.transparent){const tr=TRIM();for(const x of[-1.25,1.25])bx(g,1.5,.14,T+.05,tr,x,.07,0);bx(g,2,.08,T+.05,tr,0,2.96,0)}}
 else if(k=='gdoor'){core(g,2,.6,0,2.7,mt,T);const p=new THREE.Group();const pm=cache('gd',()=>pmat(SURF.paintMetal('#d9dcdf','gd'),1,.3,{metalness:.5,roughness:.45}));for(let i=0;i<6;i++){bx(p,1.96,.38,.06,pm,0,.2+i*.4,0);if(!lq)bx(p,1.9,.02,.07,FR(),0,.4+i*.4,0)}if(!lq)bx(p,.3,.04,.1,FR(),0,.35,0);g.add(p);g.userData.lift=p;p.position.y=o?2.1:0;if(!lq&&!mt.transparent){const w=WTRIM();for(const x of[-.99,.99])bx(g,.08,2.4,T+.07,w,x,1.2,0)}}
 else if(k=='rollup'){core(g,2,.55,0,2.725,mt,T);const p=new THREE.Group(),pm=cache('ru',()=>pmat(SURF.paintMetal('#b9c0c6','ru'),1,.15,{metalness:.65,roughness:.38}));for(let i=0;i<(lq?3:12);i++)bx(p,1.94,lq?.8:.2,.05,pm,0,(lq?.4:.1)+i*(lq?.8:.2),0);bx(p,1.94,.06,.08,FR(),0,.03,0);g.add(p);g.userData.lift=p;p.position.y=o?2.1:0;if(!lq){bx(g,2,.3,.4,pm,0,2.6,.22);for(const x of[-.98,.98])bx(g,.05,2.45,.1,FR(),x,1.22,0)}}
 else if(k=='dcase'){const wd=cache('dw',()=>pmat(WOOD.dark(),1,1,{color:'#3b2a20'})),gl=GLASS();bx(g,1.7,.55,.6,wd,0,.275,0);bx(g,1.7,.04,.62,FR(),0,.57,0);bx(g,1.7,.5,.6,gl,0,.84,0);bx(g,1.66,.03,.56,cache('dl',()=>new THREE.MeshStandardMaterial({color:'#fff',emissive:'#fff6e0',emissiveIntensity:.8})),0,1.07,0);if(!lq)for(const x of[-.84,.84])bx(g,.03,.5,.6,FR(),x,.84,0);stockMeshes(g,ex,.6,.62)}
 else if(k=='dshelf'){const wd=cache('sw',()=>pmat(WOOD.oak(),1,1,{color:'#c9a77c'}));for(const x of[-.78,.78])bx(g,.05,1.9,.42,FR(),x,.95,0);for(let i=0;i<4;i++)bx(g,1.6,.04,.42,wd,0,.25+i*.5,0);bx(g,1.6,1.9,.03,wd,0,.95,-.2);stockMeshes(g,ex,.27,.5,4)}
 else if(k=='dcount'){const wd=cache('dw',()=>pmat(WOOD.dark(),1,1,{color:'#3b2a20'})),tp=cache('ct',()=>new THREE.MeshStandardMaterial({color:'#e9e5dc',roughness:.25,metalness:.05}));bx(g,1.9,1,.62,wd,0,.5,0);bx(g,1.98,.05,.7,tp,0,1.02,0);bx(g,.36,.12,.3,FR(),.4,1.1,0);const sc=cache('scr',()=>new THREE.MeshStandardMaterial({color:'#103020',emissive:'#2aa86a',emissiveIntensity:.7}));const s=bx(g,.3,.22,.02,sc,.4,1.3,.02);s.rotation.x=-.3;if(!lq){bx(g,.05,.16,.05,FR(),.4,1.18,-.02);bx(g,1.9,.06,.02,cache('ac',()=>new THREE.MeshStandardMaterial({color:'#2f9a55',emissive:'#1f7a40',emissiveIntensity:.5})),0,.8,.315);const L=new THREE.PointLight('#fff3dd',6,9,1.6);L.position.set(0,2.6,.6);g.add(L)}}
 else if(k=='dsign'){bx(g,.06,1.2,.06,FR(),0,.6,0);const cv=document.createElement('canvas');cv.width=256;cv.height=96;const x=cv.getContext('2d');x.fillStyle=o?'#0f2a18':'#2a0f0f';x.fillRect(0,0,256,96);x.strokeStyle=o?'#3dff7a':'#ff4d4d';x.lineWidth=8;x.strokeRect(6,6,244,84);x.fillStyle=x.strokeStyle;x.font='900 54px sans-serif';x.textAlign='center';x.fillText(o?'OPEN':'CLOSED',128,68);const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Mesh(new THREE.PlaneGeometry(1,.38),new THREE.MeshStandardMaterial({map:t,emissive:'#fff',emissiveMap:t,emissiveIntensity:.9,side:THREE.DoubleSide}));s.position.set(0,1.4,0);g.add(s)}
 else if(k=='floor'){bx(g,2,.08,2,FLM(m),0,.04,0)}
 else if(k=='roof'){const r=RFM(m);bx(g,2.04,.1,2.04,r,0,3.05,0);if(!r.transparent){bx(g,2,.04,2,CEIL(),0,2.99,0);if(!lq)fascia(g,ex,3.05)}}
 else if(k=='roofs'){const r=RFM(m),gl=r.transparent,L=Math.hypot(2,RISE),ov=gl?0:.35,s=new THREE.Group();s.position.set(0,3,-1);s.rotation.x=-Math.atan2(RISE,2);bx(s,2.04,.1,L+ov,r,0,.05,(L-ov)/2);if(!gl&&!lq)bx(s,2.06,.22,.06,TRIM(),0,-.02,-ov);g.add(s);
  if(!gl)bx(g,2,.04,2,CEIL(),0,2.99,0);for(const sd of[1,-1])if(ex&(sd>0?1:2)){const t=gableTri(gl?r:M(m));t.position.set(sd*1,3,0);g.add(t)}}
 else if(k=='roofr'){const r=RFM(m),gl=r.transparent;bx(g,2.04,.1,2.04,r,0,3+RISE+.05,0);if(!gl){if(!lq)bx(g,2.06,.08,.2,TRIM(),0,3+RISE+.13,0);bx(g,2,.04,2,CEIL(),0,2.99,0)}for(const sd of[1,-1])if(ex&(sd>0?1:2))bx(g,.1,RISE,2,gl?r:M(m),sd*.98,3+RISE/2,0)}
 return g}
function fascia(g,ex,y){const t=TRIM();if(ex&1)bx(g,.06,.2,2.08,t,1.03,y,0);if(ex&2)bx(g,.06,.2,2.08,t,-1.03,y,0);if(ex&4)bx(g,2.08,.2,.06,t,0,y,1.03);if(ex&8)bx(g,2.08,.2,.06,t,0,y,-1.03)}
// exposed-edge flags for roof pieces (local +x=1,-x=2,+z=4,-z=8) so gables/fascia only appear on the outside
const _v=new THREE.Vector3(),_Y=new THREE.Vector3(0,1,0);
function roofEx(p,R){let f=0;for(const [b,lx,lz] of[[1,2,0],[2,-2,0],[4,0,2],[8,0,-2]]){_v.set(lx,0,lz).applyAxisAngle(_Y,-p.r*Math.PI/2);if(!R.has(Math.round(p.x+_v.x)+','+Math.round(p.z+_v.z)))f|=b}return f}
function prefabModel(k,m){const g=new THREE.Group(),L=bExpand(k,0,0,0),R=new Set(L.filter(p=>BP[p.k].c=='r').map(p=>p.x+','+p.z));for(const p of L){const o=pieceModel(p.k,BPF[k]?p.m:m,0,BP[p.k].c=='r'?roofEx(p,R):0);o.position.set(p.x,0,p.z);o.rotation.y=-p.r*Math.PI/2;g.add(o)}return g}
export function thumbModel(t){const k=t.slice(2);if(k.startsWith('f_'))return C.decoModel(k.slice(2));if(BP[k])return pieceModel(k,k=='window'?4:0);const g=prefabModel(k,0);g.scale.setScalar(.35);return g}
export function init(ctx){C=ctx;C.scene.add(G);hud=document.createElement('div');hud.id='buildhud';hud.style.cssText='position:fixed;left:50%;bottom:86px;transform:translateX(-50%);z-index:7;display:none;background:rgba(14,20,16,.86);color:#eef;border:1px solid #6c8;border-radius:12px;padding:8px 12px;font:14px system-ui;text-align:center;max-width:94vw';document.body.appendChild(hud);
 hud.addEventListener('click',e=>{const b=e.target.closest('[data-bc],[data-bi],[data-bx]');if(!b)return;if(b.dataset.bc!=null){cat=+b.dataset.bc;setGhost()}else if(b.dataset.bi!=null){idx[cat]+=+b.dataset.bi;setGhost()}else if(b.dataset.bx=='exit')toggle(false);else if(b.dataset.bx=='rm')del();else if(b.dataset.bx=='sell')sell(false);else if(b.dataset.bx=='sellall')sell(true,true);else if(b.dataset.bx=='light')light();C.sfx('ui');renderHud()})}
// world sync
const pkey=p=>p.k+p.m+':'+(p.ex|0)+(lowq()?'l':'')+(p.k=='dsign'?'o'+p.o:'')+(p.st?'s'+p.st.map(i=>i.d?.s).join():'');
export function sync(list,stock){STOCK=stock||{};const L=list||[];const old=new Map(G.children.map(o=>[o.userData.bid,o]));G.clear();walls=[];const RS=new Set((list||[]).filter(p=>BP[p.k]?.c=='r').map(p=>p.x+','+p.z));
 for(const p0 of L){const p=BP[p0.k]?.c=='r'?{...p0,ex:roofEx(p0,RS)}:p0;let o=old.get(p.id);if(!o||o.userData.key!=pkey(p)){o=pieceModel(p.k,p.m,p.o,BP[p.k]?.c=='x'?(p.st||[]).map(i=>JCOL(i.d?.s)):p.ex|0);o.position.set(p.x,0,p.z);o.rotation.y=-p.r*Math.PI/2}o.userData.bid=p.id;o.userData.key=pkey(p);o.userData.o=p.o;G.add(o);
  if(BP[p.k].c=='x'){if(p.k!='dsign'){const hw=p.k=='dshelf'?.82:.9,hd=p.k=='dshelf'?.22:.32,sw=p.r&1;walls.push(sw?{x0:p.x-hd,x1:p.x+hd,z0:p.z-hw,z1:p.z+hw,bid:p.id}:{x0:p.x-hw,x1:p.x+hw,z0:p.z-hd,z1:p.z+hd,bid:p.id})}continue}if(BP[p.k].c!='w')continue;const sw=p.r&1,seg=(a,b)=>{const lo=Math.min(a,b),hi=Math.max(a,b);walls.push(sw?{x0:p.x-.1,x1:p.x+.1,z0:p.z+lo,z1:p.z+hi,bid:p.id}:{x0:p.x+lo,x1:p.x+hi,z0:p.z-.1,z1:p.z+.1,bid:p.id})};
  if(p.k=='door'){seg(-1,-.65);seg(.65,1);if(!p.o)seg(-.65,.65)}else if(p.k=='gdoor'||p.k=='rollup'){seg(-1,-.95);seg(.95,1);if(!p.o)seg(-.95,.95)}else seg(-1,1)}
 B=L;C.setWalls(walls);if(on)renderHud()}
export const wallsList=()=>walls;
export function tick(dt){for(const o of G.children){const h=o.userData.hinge,l=o.userData.lift;if(h){const tg=o.userData.o?-1.45:0;h.rotation.y+=(tg-h.rotation.y)*Math.min(1,dt*6)}if(l){const tg=o.userData.o?2.1:0;l.position.y+=(tg-l.position.y)*Math.min(1,dt*4)}}if(on){holdTick(dt);frame()}}
export function doorTargets(){const fw=(p,d)=>{const c=[1,0,-1,0][p.r|0],s=[0,1,0,-1][p.r|0];return [p.x-s*d,p.z+c*d]};return B.filter(p=>['door','gdoor','rollup','dsign','dcase','dshelf','dcount'].includes(p.k)).map(p=>{const fx=p.k=='dsign'?'bsign':p.k=='dcount'?'breg':DCAP[p.k]?'bcase':'bdoor',y=p.k=='dsign'?1.4:p.k=='dcase'?.9:p.k=='dshelf'?1:p.k=='dcount'?1.1:1.2,[x,z]=BP[p.k].c=='x'?fw(p,p.k=='dcount'?.1:0):[p.x,p.z];return {fx,id:p.id,o:p.o,k:p.k,st:p.st||[],pm:p.pm??1,p:new THREE.Vector3(x,y,z)}})}
// aim
const rc=new THREE.Raycaster(),dir=new THREE.Vector3();
function aimPiece(){C.camera.getWorldDirection(dir);rc.set(C.camera.position,dir);rc.far=7;const h=rc.intersectObjects(G.children,true)[0];if(!h)return null;let o=h.object;while(o&&o.parent!==G)o=o.parent;return o?B.find(p=>p.id==o.userData.bid):null}
function groundPt(){C.camera.getWorldDirection(dir);const e=C.camera.position;let t=dir.y<-.05?-e.y/dir.y:6;t=Math.min(t,10);return new THREE.Vector3(e.x+dir.x*t,0,e.z+dir.z*t)}
function snap(k,pt){const ev=v=>Math.round(v/2)*2,od=v=>Math.round((v-1)/2)*2+1;if(k.startsWith('f:'))return {x:Math.round(pt.x*2)/2,z:Math.round(pt.z*2)/2};if(BP[k]?.c=='w')return rot&1?{x:od(pt.x),z:ev(pt.z)}:{x:ev(pt.x),z:od(pt.z)};return {x:ev(pt.x),z:ev(pt.z)}}
function setGhost(){const k=cur();if(gk==k&&ghost)return;if(ghost){C.scene.remove(ghost);ghost=null}gk=k;if(k=='expand'||k.startsWith('m:'))return;ghost=k.startsWith('f:')?C.decoModel(k.slice(2)):BP[k]?pieceModel(k,mi):prefabModel(k,mi);ghost.traverse(o=>{if(o.isMesh){const gm=c=>{c=c.clone();c.transparent=true;c.opacity=.45;c.depthWrite=false;return c};o.material=Array.isArray(o.material)?o.material.map(gm):gm(o.material);o.castShadow=false;o.userData.gm=1}});C.scene.add(ghost)}
function tint(ok){ghost?.traverse(o=>{if(o.isMesh){const un=c=>{c=c.clone();c.userData.sh=0;return c};if(o.material?.userData?.sh)o.material=un(o.material);if(Array.isArray(o.material))o.material=o.material.map(c=>c.userData?.sh?un(c):c)}[].concat(o.material).forEach(c=>c?.emissive?.set(ok?'#1a6a2a':'#8a1a1a'))})}
function frame(){const k=cur();aimId=null;if(selBox){C.scene.remove(selBox);selBox=null}
 const ap=aimPiece();if(ap&&(k.startsWith('m:')||!ghost||C.keysDel)){aimId=ap.id}
 if(ap){const o=G.children.find(c=>c.userData.bid==ap.id);if(o){selBox=new THREE.BoxHelper(o,k.startsWith('m:')?'#7fd3ff':'#ffd23f');C.scene.add(selBox)}}
 if(ghost){const s=snap(k,groundPt());gp={...s,ok:true};if(k.startsWith('f:')){const W=C.W(),Rb=C.ROOMB(W?.room||1);const dk=DECOR[k.slice(2)];gp.ok=s.x>Rb.x0&&s.x<Rb.x1&&s.z>Rb.z0&&s.z<Rb.z1||onBFloor(B,s.x,s.z)||!!dk.out&&Math.abs(s.x)<=42&&Math.abs(s.z)<=42;ghost.rotation.y=rot*Math.PI/2}else{const L=bExpand(k,s.x,s.z,rot),used=new Set(B.map(p=>bSlot(p.k,p.x,p.z,p.r)));gp.ok=L.every(p=>bAllowed(p.x,p.z))&&L.some(p=>!used.has(bSlot(p.k,p.x,p.z,p.r)));ghost.rotation.y=-rot*Math.PI/2}ghost.position.set(s.x,0,s.z);tint(gp.ok)}
 lastT=target();if(C.frames()%12==0||hold)renderHud();if(ap)lastAim=ap;else lastAim=null}
let lastAim=null,hold=null,conf=null;
const sellP=k=>Math.floor(((BP[k]||BPF[k])?.p||0)/2);
// what the player is aiming at for remove/sell: a built piece, else a furniture item
function target(){const ap=aimPiece();if(ap)return{t:'b',p:ap,n:BP[ap.k].n,v:sellP(ap.k),grp:ap.g?B.filter(e=>e.g==ap.g):null};const d=C.decoAim?.();if(d)return{t:'d',d,n:DECOR[d.k].n,v:Math.floor(DECOR[d.k].p/2),lt:!!DECOR[d.k].lt};return null}
const grpV=T=>T.grp.reduce((a,e)=>a+sellP(e.k),0),grpN=T=>(BPF[T.p.gk]?.n||'building').replace(/ Kit.*$/,'');
function selTxt(p,g){const T=lastT;if(!T)return `${p?g(3):'<span class="g">X</span>'} Remove · ${p?'hold '+g(3):'<span class="g">Shift</span>+<span class="g">X</span>'} Sell <small style="opacity:.7">(aim at a piece)</small>`;
 const B0='border:0;color:#fff;border-radius:6px;cursor:pointer;padding:2px 7px;margin:0 2px';
 let h=`<button data-bx="rm" style="${B0};background:#3a4a6a">${p?g(3):'<span class="g">X</span>'} Remove ${T.n} (to inventory)</button><button data-bx="sell" style="${B0};background:#3c7a3a">${p?'hold '+g(3):'<span class="g">Shift</span>+<span class="g">X</span>'} Sell for $${T.v}</button>`;
 if(T.grp&&T.grp.length>1)h+=`<button data-bx="sellall" style="${B0};background:#7a5a20">${p?'keep holding '+g(3):'<span class="g">Ctrl</span>+<span class="g">Shift</span>+<span class="g">X</span>'} Sell whole ${grpN(T)} $${grpV(T)}</button>`;
 if(T.lt)h+=`<button data-bx="light" style="${B0};background:#5a4a20">${p?g(11):'<span class="g">L</span>'} Light ${T.d.off?'on':'off'}</button>`;
 if(hold)h+=`<div style="height:6px;background:#333;border-radius:3px;margin:3px 0"><div style="height:6px;width:${Math.min(100,hold.t/2*100)}%;background:${hold.t<.7?'#8ab':hold.t<2?'#6c6':'#fc4'};border-radius:3px"></div></div>`;
 return '<div style="margin:3px 0">'+h+'</div>'}
let lastT=null;
function renderHud(){if(!on)return;const k=cur(),p=C.padMode(),g=C.glyph,st=stockOf(k),ap=lastAim;
 const tabs=CATS.map((c,i)=>`<button data-bc="${i}" style="margin:2px;padding:3px 8px;border-radius:8px;border:0;background:${i==cat?'#3c9a5a':'#2a332e'};color:#fff;cursor:pointer">${c[0]}</button>`).join('');
 const act=k=='expand'?(C.W()?.room>1?'Already expanded':'Expand ($500, needs 5★)'):k.startsWith('m:')?(ap?`Paint ${BP[ap.k].n} ($${PAINTP})`:'Aim at a wall/floor to apply'):gp?.ok?(st?`Place (in stock: ${st})`:`Buy & place $${priceOf(k)}`):'<span style="color:#ff7a6a">Can\'t place here</span>';
 hud.innerHTML=`<div><b>🔨 BUILD MODE</b> · Money $${C.W()?.money??0}</div><div>${tabs}</div><div style="margin:4px 0"><button data-bi="-1" style="border:0;background:#2a332e;color:#fff;border-radius:6px;cursor:pointer">◀</button> <b>${nameOf(k)}</b> · $${priceOf(k)}${st?` · 📦${st} owned`:''}${BP[k]?` · ${BMAT[mi][1]}`:''} <button data-bi="1" style="border:0;background:#2a332e;color:#fff;border-radius:6px;cursor:pointer">▶</button></div>
 <div style="font-size:12px;opacity:.9">${p?g(0):'<span class="g">E</span>/Click'} ${act} · ${p?g(6)+g(7):'<span class="g">R</span>'} Rotate · ${p?g(4)+g(5):'<span class="g">[</span><span class="g">]</span>'} Category · ${p?g(14)+g(15):'<span class="g">←</span><span class="g">→</span>/Wheel'} Item · ${selTxt(p,g)} · ${p?g(2):'<span class="g">F</span>'} Move · ${BP[k]?(p?g(13):'<span class="g">T</span>')+' Material · ':''}${p?g(1):'<span class="g">B</span>/Esc'} Exit <button data-bx="exit" style="border:0;background:#7a3030;color:#fff;border-radius:6px;cursor:pointer">✕</button></div>`}
export const isOn=()=>on;
export function toggle(v=!on){if(v==on)return;if(v&&!C.W())return;on=v;hud.style.display=on?'block':'none';if(on){C.onEnter();setGhost();C.toast('Build mode — place walls, floors, doors, windows, buildings and furniture')}else{if(ghost){C.scene.remove(ghost);ghost=null}gk='';if(selBox){C.scene.remove(selBox);selBox=null}}C.sfx('ui');renderHud()}
export function act(){const k=cur(),W=C.W();if(!W)return;
 if(k=='expand'){if(W.room>1)return C.toast('Your grow room is already expanded');C.send({t:'upgrade'});return}
 if(k.startsWith('m:')){const ap=aimPiece();if(!ap)return C.toast('Aim at a built wall, floor or roof to paint it');C.send({t:'bpaint',id:ap.id,m:+k.slice(2)});return}
 if(!gp?.ok){C.toast("Can't place that there");C.sfx('err');return}
 if(!stockOf(k)&&W.money<priceOf(k)){C.toast(`Need $${priceOf(k)} — or buy it at budsupply.shop → Furniture & Construction`);C.sfx('err');return}
 if(k.startsWith('f:'))C.send({t:'dplace',k:k.slice(2),x:gp.x,y:0,z:gp.z,ry:rot*Math.PI/2});else C.send({t:'bplace',k,x:gp.x,z:gp.z,r:rot,m:mi})}
export function del(){const T=target();if(!T)return C.toast('Aim at a built piece or furniture to remove it');C.send(T.t=='b'?{t:'bdel',id:T.p.id}:{t:'dstow',id:T.d.id})}
// sell: piece/furniture for 50%; whole=true sells every piece of a prefab building (keyboard/mouse needs a 2nd press within 3s to confirm; pad confirms by holding Y 2s)
export function sell(whole=false,ask=false){const T=target();if(!T)return C.toast('Aim at a built piece or furniture to sell it');
 if(whole&&T.grp?.length>1){if(ask&&!(conf&&conf.g==T.p.g&&performance.now()-conf.t<3000)){conf={g:T.p.g,t:performance.now()};C.toast(`Sell the whole ${grpN(T)} (${T.grp.length} pieces) for $${grpV(T)}? Press again to confirm`);C.sfx('ui');return}conf=null;C.send({t:'bsell',id:T.p.id,whole:1});return}
 C.send(T.t=='b'?{t:'bsell',id:T.p.id}:{t:'drem',id:T.d.id})}
export function light(){const T=target();if(!T?.lt)return C.toast('Aim at a light to switch it on or off');C.send({t:'dlight',id:T.d.id})}
const padY=()=>{for(const gp of navigator.getGamepads?.()||[])if(gp?.buttons?.[3]?.pressed)return true;return false};
// pad Y: tap = remove, hold 0.7s = sell piece, hold 2s = sell whole prefab building
function holdTick(dt){if(!hold)return;if(padY()){hold.t=(performance.now()-hold.t0)/1000;if(hold.t>=2&&hold.whole){hold=null;sell(true);renderHud()}else if(hold.t>=.7&&!hold.whole){hold=null;sell(false);renderHud()}return}
 const t=hold.t;hold=null;if(t<.7)del();else sell(false);renderHud()}
export function move(){const ap=aimPiece();if(ap){C.send({t:'bdel',id:ap.id});const L=CATS.findIndex(c=>c[1]().includes(ap.k));cat=L;idx[cat]=CATS[cat][1]().indexOf(ap.k);mi=ap.m;rot=ap.r;setGhost();gk='';setGhost();C.toast('Moving '+BP[ap.k].n+' — place it again');return}const d=C.decoAim();if(d){toggle(false);C.decoGrab(d);return}C.toast('Aim at a piece or furniture to move it')}
export const rotate=d=>{rot=(rot+d+4)%4;C.sfx('ui')};
export function cycleCat(d){cat=(cat+d+CATS.length)%CATS.length;setGhost();renderHud();C.sfx('ui')}
export function cycleItem(d){idx[cat]+=d;setGhost();renderHud();C.sfx('ui')}
export function cycleMat(){mi=(mi+1)%BMAT.length;if(ghost&&BP[gk]){gk='';setGhost()}C.toast('Material: '+BMAT[mi][1]);renderHud()}
export function key(code,e){if(code=='KeyB'||code=='Escape'){toggle(false);return true}if(code=='KeyE')act();else if(code=='KeyX'&&e?.shiftKey)sell(!!(e.ctrlKey||e.metaKey),true);else if(code=='KeyX'||code=='Delete')del();else if(code=='KeyL')light();else if(code=='KeyF')move();else if(code=='KeyR')rotate(e?.shiftKey?-1:1);else if(code=='BracketLeft')cycleCat(-1);else if(code=='BracketRight')cycleCat(1);else if(code=='ArrowLeft')cycleItem(-1);else if(code=='ArrowRight')cycleItem(1);else if(code=='KeyT')cycleMat();else if(/^Digit[1-5]$/.test(code)){cat=+code[5]-1;setGhost();renderHud()}else return false;return true}
// Xbox: LB/RB category · D-pad ◀▶ item · LT/RT rotate · A place · B exit · Y tap remove / hold sell / keep holding sell whole building · RS click light on/off · X move · D-pad ▼ material · D-pad ▲ exit
export function pad(E){if(E[4])cycleCat(-1);if(E[5])cycleCat(1);if(E[14])cycleItem(-1);if(E[15])cycleItem(1);if(E[6])rotate(1);if(E[7])rotate(-1);if(E[0])act();if(E[3]){const T=target();hold={t:0,t0:performance.now(),whole:!!(T?.grp?.length>1)}}if(E[11])light();if(E[2])move();if(E[13])cycleMat();if(E[1]||E[12])toggle(false)}
export const state=()=>({on,cat,item:cur(),rot,mi,ok:!!gp?.ok,gp,n:B.length,stock:STOCK,walls:walls.length,aim:lastAim?.id||null,tgt:lastT?{t:lastT.t,n:lastT.n,v:lastT.v,id:lastT.p?.id||lastT.d?.id,grp:lastT.grp?.length||0}:null});
export const setSel=(c,i)=>{cat=c;idx[c]=i;setGhost();renderHud()};
