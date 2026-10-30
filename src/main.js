import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {sfx,initAudio,setVol} from './audio.js';
import {STRAINS,SHOP,READY,stage} from './rules.js';
const $=id=>document.getElementById(id);const Q=new URLSearchParams(location.search);
const settings=Object.assign({sens:5,qual:2,vol:7},JSON.parse(localStorage.bt_set||'{}'));
// ---------- renderer ----------
const renderer=new THREE.WebGLRenderer({antialias:settings.qual<2,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,settings.qual==2?1.5:1));renderer.setSize(innerWidth,innerHeight);
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;renderer.shadowMap.enabled=settings.qual>0;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
document.body.prepend(renderer.domElement);
const vig=document.createElement('div');vig.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:5;background:radial-gradient(ellipse at center,transparent 60%,rgba(20,15,5,.4))';document.body.append(vig);
const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,.05,400);scene.add(camera);
const SKY=new THREE.Color('#9fd4ff');scene.background=SKY.clone();scene.fog=new THREE.Fog('#cfe6d0',30,120);
let composer=null;
if(settings.qual>0){composer=new EffectComposer(renderer,new THREE.WebGLRenderTarget(innerWidth,innerHeight,{samples:settings.qual==2?4:0,type:THREE.HalfFloatType}));
 composer.addPass(new RenderPass(scene,camera));composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth/2,innerHeight/2),.3,.5,.85));composer.addPass(new OutputPass());}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer&&composer.setSize(innerWidth,innerHeight)});
const hemi=new THREE.HemisphereLight('#fff4dc','#6a5238',.9);scene.add(hemi);
const sun=new THREE.DirectionalLight('#ffe2b0',2.2);sun.position.set(-14,22,18);sun.castShadow=true;const SM=settings.qual==2?2048:1024;sun.shadow.mapSize.set(SM,SM);
Object.assign(sun.shadow.camera,{left:-22,right:22,top:22,bottom:-22,near:1,far:70});sun.shadow.bias=-.0004;sun.shadow.normalBias=.03;sun.shadow.radius=3;scene.add(sun);
// ---------- helpers ----------
const rnd=(s=>()=>(s=(s*16807)%2147483647)/2147483647)(4242);
const mat=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.8,flatShading:true},o));
const sh=m=>{m.castShadow=m.receiveShadow=settings.qual>0;return m};
const box=(w,h,d,c,o)=>sh(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof c=='string'?mat(c,o):c));
const cyl=(a,b,h,c,seg=10,o)=>sh(new THREE.Mesh(new THREE.CylinderGeometry(a,b,h,seg),typeof c=='string'?mat(c,o):c));
const at=(m,x,y,z)=>{m.position.set(x,y,z);return m};
// ---------- world ----------
const WALLH=3;let WALLS=[];const roomG=new THREE.Group(),room2G=new THREE.Group();scene.add(roomG,room2G);
const plank=[mat('#c98b55'),mat('#b97a48'),mat('#d39a62')],wallM=mat('#e9d6b5'),wallM2=mat('#d8c29c'),trimM=mat('#7a4a2a'),roofM=mat('#8a5a3a');
function wall(g,x0,x1,z0,z1,list){const w=x1-x0,d=z1-z0;g.add(at(box(w,WALLH,d,(w>d?wallM:wallM2)),(x0+x1)/2,WALLH/2,(z0+z1)/2));g.add(at(box(w+.02,.18,d+.02,trimM),(x0+x1)/2,.09,(z0+z1)/2));list.push({x0,x1,z0,z1})}
const W1=[],W1b=[],W2=[];
function buildWorld(){
 // ground
 const gg=new THREE.PlaneGeometry(200,200,60,60).toNonIndexed();gg.rotateX(-Math.PI/2);const gp=gg.attributes.position,gc=[],c=new THREE.Color();
 for(let k=0;k<gp.count;k++){const x=gp.getX(k),z=gp.getZ(k);const d=Math.max(0,Math.hypot(x,z)-25);gp.setY(k,-.02+Math.sin(x*.3+z*.2)*.03+d*d*.004)}
 gg.computeVertexNormals();for(let k=0;k<gp.count;k+=3){c.set('#7ccf55').offsetHSL((rnd()-.5)*.03,0,(rnd()-.5)*.08);for(let j=0;j<3;j++)gc.push(c.r,c.g,c.b)}
 gg.setAttribute('color',new THREE.Float32BufferAttribute(gc,3));const gm=new THREE.Mesh(gg,mat('#fff',{vertexColors:true}));gm.receiveShadow=true;scene.add(gm);
 // path + pad
 scene.add(at(box(2.4,.04,6,'#c9b48a'),0,.01,8.2));const pad=at(box(2.2,.05,1.8,'#e0a23a'),2.4,.02,7.2);scene.add(pad);
 for(let i=0;i<4;i++)scene.add(at(box(.3,.06,1.8,'#3a3a3a'),1.55+i*.55,.03,7.2));
 // floor (room1 + room2)
 for(let i=0;i<10;i++)roomG.add(at(box(8.4,.1,1.04,plank[i%3]),0,.0,-4.7+i*1.04));
 for(let i=0;i<10;i++)room2G.add(at(box(7,.1,1.04,plank[(i+1)%3]),7.6,.0,-4.7+i*1.04));
 // walls room1
 wall(roomG,-4.3,-4.1,-5.2,5.2,W1);wall(roomG,-4.3,4.3,-5.2,-5,W1);wall(roomG,-4.3,-1,5,5.2,W1);wall(roomG,1,4.3,5,5.2,W1);
 roomG.add(at(box(2,.8,.2,wallM),0,2.6,5.1));
 const rw=new THREE.Group();wall(rw,4.1,4.3,-5.2,5.2,W1b);roomG.add(rw);roomG.userData.rw=rw;
 // room2 walls
 wall(room2G,4.1,4.3,-5.2,-3.6,W2);wall(room2G,4.1,4.3,3.6,5.2,W2);room2G.add(at(box(.2,.8,7.2,wallM2),4.2,2.6,0));
 wall(room2G,4.3,11.2,-5.2,-5,W2);wall(room2G,4.3,11.2,5,5.2,W2);wall(room2G,11,11.2,-5.2,5.2,W2);room2G.visible=false;
 // roofs
 const roof=(g,x,w)=>{for(const s of[-1,1]){const r=box(w,.15,5.9,roofM);r.position.set(x,3.55,s*2.55);r.rotation.x=s*.32;g.add(r)}const ceil=box(w-.2,.08,10.2,'#c8a57a');ceil.position.set(x,3.02,0);ceil.castShadow=false;g.add(ceil);
  for(let i=-2;i<=2;i++)g.add(at(box(w-.3,.14,.14,trimM),x,2.92,i*2.2))};roof(roomG,0,8.8);roof(room2G,7.6,7.4);
 // door frame + window
 roomG.add(at(box(.15,2.2,.3,trimM),-1,1.1,5.1),at(box(.15,2.2,.3,trimM),1,1.1,5.1),at(box(2.15,.15,.3,trimM),0,2.2,5.1));
 const win=at(box(.06,1,1.6,mat('#cfeaff',{emissive:'#cfeaff',emissiveIntensity:.6})),-4.12,1.7,2.5);roomG.add(win,at(box(.1,1.15,.1,trimM),-4.08,1.7,2.5),at(box(.1,.1,1.75,trimM),-4.08,1.7,2.5));
 // desk + laptop
 const desk=new THREE.Group();desk.add(at(box(.9,.08,1.7,'#9a6a40'),0,.9,0));for(const a of[-1,1])for(const b of[-1,1])desk.add(at(box(.08,.9,.08,'#6a4426'),a*.38,.45,b*.78));
 desk.add(at(box(.5,.03,.38,'#222a33'),0,.955,0));const scr=at(box(.03,.34,.5,'#222a33'),-.24,1.13,0);desk.add(scr);desk.add(at(box(.01,.28,.44,mat('#7fe3ff',{emissive:'#5fd3ff',emissiveIntensity:1.2})),-.22,1.13,0));
 const chair=at(box(.5,.08,.5,'#3a6a9a'),.75,.5,0);desk.add(chair,at(box(.08,.6,.5,'#3a6a9a'),1,.8,0),at(cyl(.04,.04,.5,'#333'),.75,.25,0));
 desk.position.set(-3.6,0,-2);roomG.add(desk);W1.push({x0:-4.1,x1:-3.1,z0:-2.9,z1:-1.1});
 // shelf, bench, bulbs
 const shelf=new THREE.Group();for(let i=0;i<3;i++)shelf.add(at(box(1.8,.06,.5,'#9a6a40'),0,.5+i*.6,0));for(const a of[-1,1])shelf.add(at(box(.06,1.8,.5,'#6a4426'),a*.9,.9,0));
 const jars=['#8e5be8','#e8c84a','#58d07a'];for(let i=0;i<6;i++)shelf.add(at(cyl(.08,.08,.18,mat(jars[i%3],{transparent:true,opacity:.75,roughness:.2})),-.7+i*.28,1.2+(i>2?.6:0)*0,0));
 shelf.position.set(3.7,0,1.5);shelf.rotation.y=-Math.PI/2;roomG.add(shelf);W1.push({x0:3.4,x1:4.1,z0:.6,z1:2.4});
 const bulb=(g,x,z)=>{const b=at(new THREE.Mesh(new THREE.SphereGeometry(.12,10,8),new THREE.MeshBasicMaterial({color:'#fff1c0'})),x,2.6,z);g.add(b,at(cyl(.01,.01,.35,'#222'),x,2.82,z),at(cyl(.22,.3,.12,'#3a3a3a',12),x,2.72,z));
  const l=new THREE.PointLight('#ffd9a0',6,12,1.4);l.position.set(x,2.5,z);if(settings.qual>0&&g==roomG){l.castShadow=true;l.shadow.mapSize.set(512,512);l.shadow.bias=-.002}g.add(l)};bulb(roomG,0,0);bulb(room2G,7.6,0);
 // drop box
 const db=new THREE.Group();db.add(at(box(.8,1,.6,'#3f8a4a'),0,.5,0),at(box(.85,.1,.65,'#2c6a36'),0,1.02,0),at(box(.5,.06,.04,'#111'),0,.82,.31));
 const sg=at(box(.8,.3,.04,mat('#fff6d8',{emissive:'#fff6d8',emissiveIntensity:.15})),0,1.35,0);db.add(sg,at(cyl(.03,.03,.4,'#333'),0,1.15,0));db.position.set(-2.8,0,7.6);scene.add(db);
 // fence, trees, bushes
 const tr=mat('#8a5a3a'),lf=[mat('#3fae4a'),mat('#5cc85a'),mat('#2f9a5a')];
 const tree=(x,z,s)=>{const t=new THREE.Group();t.add(at(cyl(.15,.22,1.4,tr,7),0,.7,0));for(let k=0;k<3;k++){const cn=sh(new THREE.Mesh(new THREE.IcosahedronGeometry(1.1-k*.2,0),lf[k%3]));cn.position.set((rnd()-.5)*.5,1.8+k*.7,(rnd()-.5)*.5);t.add(cn)}t.position.set(x,0,z);t.scale.setScalar(s);scene.add(t)};
 for(let k=0;k<45;k++){const a=rnd()*6.28,r=16+rnd()*40;tree(Math.cos(a)*r,Math.sin(a)*r,.8+rnd()*.9)}
 for(let x=-13;x<=13;x+=1.6){scene.add(at(box(.12,1,.12,'#f1e3c8'),x,.5,13),at(box(1.6,.1,.06,'#f1e3c8'),x+.8,.75,13),at(box(1.6,.1,.06,'#f1e3c8'),x+.8,.4,13))}
 const pot=new THREE.Mesh(new THREE.ConeGeometry(.3,.9,6),mat('#e86a8a'));for(let k=0;k<20;k++){const b=sh(new THREE.Mesh(new THREE.IcosahedronGeometry(.4+rnd()*.3,0),lf[k%3]));b.position.set((rnd()-.5)*24,.2,6+rnd()*6);if(Math.abs(b.position.x)<3.5)continue;scene.add(b)}
}
buildWorld();
const LAPTOP=new THREE.Vector3(-3.6,1.05,-2),DROP=new THREE.Vector3(-2.8,.9,7.6);
function setRoom(n){room2G.visible=n>1;roomG.userData.rw.visible=n<2;WALLS=[...W1,...(n<2?W1b:[]),...(n>1?W2:[])]}setRoom(1);
// ---------- props ----------
const SCOL={kush:'#a06bf0',haze:'#f0cf4a',owl:'#4fdc7a'};
const terr=mat('#c8663a'),soilM=mat('#4a2e1c'),glass=mat('#d8f4ff',{transparent:true,opacity:.45,roughness:.1,metalness:.1});
function label(c,t){const cv=document.createElement('canvas');cv.width=128;cv.height=64;const x=cv.getContext('2d');x.fillStyle=c;x.fillRect(0,0,128,64);x.fillStyle='#fff';x.font='bold 22px sans-serif';x.textAlign='center';x.fillText(t,64,40);const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshStandardMaterial({map:tx,roughness:.7})}
const LBL={};const lbl=(c,t)=>LBL[c+t]||(LBL[c+t]=label(c,t));
function budCluster(col,n,s){const g=new THREE.Group();const m=mat(col),m2=mat('#6aa84a');for(let i=0;i<n;i++){const b=sh(new THREE.Mesh(new THREE.IcosahedronGeometry(s*(.6+rnd()*.5),0),i%3?m:m2));b.position.set((rnd()-.5)*s*2,(rnd()-.5)*s*1.4,(rnd()-.5)*s*2);g.add(b)}return g}
function fanLeaf(m,s){const g=new THREE.Group();const bl=new THREE.ConeGeometry(.045,.42,4);bl.translate(0,.21,0);bl.scale(1,1,.25);
 for(let i=0;i<7;i++){const a=(i-3)*.42,l=1-Math.abs(i-3)*.18;const b=new THREE.Mesh(bl,m);b.castShadow=settings.qual>0;b.rotation.z=-a;b.scale.setScalar(l);g.add(b)}g.scale.setScalar(s);return g}
const leafMs={};const leafM=(h,col)=>{const k=h+col;return leafMs[k]||(leafMs[k]=mat(new THREE.Color(col).lerp(new THREE.Color('#c8b84a'),1-h).getStyle(),{side:THREE.DoubleSide}))};
function plantModel(p){const g=new THREE.Group();const st=stage(p);if(!p)return g;
 if(st=='dead'){const m=mat('#7a5a32');g.add(at(cyl(.02,.03,.35,m,5),0,.17,0));for(let i=0;i<4;i++){const l=fanLeaf(m,.4);l.position.y=.25;l.rotation.set(1.6,i*1.6,0);g.add(l)}return g}
 const f=Math.min(1,p.age/READY),hb=Math.round((p.health||100)/25)/4,col=p.s=='kush'?'#3f9a4a':p.s=='haze'?'#5cbf3e':'#2f8f52',lm=leafM(hb,col);
 const H=.12+Math.min(1,p.age/260)*.95+(f>.42?(f-.42)*.25:0);g.add(at(cyl(.012+H*.02,.02+H*.03,H,mat('#6a9a3a'),6),0,H/2,0));
 const layers=st=='seedling'?1:2+Math.floor(Math.min(1,p.age/260)*5);
 for(let i=0;i<layers;i++){const y=st=='seedling'?H:H*(.25+.75*i/Math.max(1,layers-1)),s=st=='seedling'?.25+p.age/60*.25:(.55+(1-i/layers)*.5)*(.6+f*.6);
  for(let k=0;k<(st=='seedling'?2:3);k++){const l=fanLeaf(lm,s);l.position.y=y;l.rotation.order='YXZ';l.rotation.set(1.05-.25*(i/layers),k*2.09+i*.9,0);g.add(l)}}
 if(st=='flower'||st=='ready'){const bf=Math.min(1,(p.age-200)/(READY-200)),bc=new THREE.Color('#bfe39a').lerp(new THREE.Color(SCOL[p.s]),st=='ready'?.75:bf*.5).getStyle();
  const top=budCluster(bc,6+Math.round(bf*6),.035+bf*.045);top.position.y=H+.03;g.add(top);
  for(let i=1;i<layers;i++){const y=H*(.25+.75*i/Math.max(1,layers-1));for(let k=0;k<2;k++){const a=k*3.14+i;const b=budCluster(bc,3+Math.round(bf*3),.025+bf*.03);b.position.set(Math.cos(a)*.18*(1-i/layers+.3),y+.05,Math.sin(a)*.18*(1-i/layers+.3));g.add(b)}}
  if(st=='ready'){const tri=new THREE.Mesh(new THREE.IcosahedronGeometry(.02,0),new THREE.MeshBasicMaterial({color:'#fff'}));for(let i=0;i<10;i++){const t=tri.clone();t.position.set((rnd()-.5)*.25,H*(.4+rnd()*.65),(rnd()-.5)*.25);g.add(t)}}}
 return g}
function prop(e){const g=new THREE.Group(),t=e.type,d=e.data||{};
 if(t=='pot'){g.add(at(cyl(.24,.17,.36,terr,12),0,.18,0),at(cyl(.26,.26,.05,terr,12),0,.35,0));if(d.soil)g.add(at(cyl(.22,.22,.03,soilM,12),0,.34,0));if(d.plant){const p=plantModel(d.plant);p.position.y=.35;g.add(p)}}
 else if(t=='soil'){const b=box(.5,.65,.25,lbl('#6a4a2a','SOIL'));b.position.y=.33;b.rotation.z=.05;g.add(b,at(box(.42,.08,.2,'#5a3a1a'),0,.7,0))}
 else if(t.startsWith('seed_')){const s=t.slice(5);g.add(at(box(.18,.24,.04,lbl(SCOL[s],'SEEDS')),0,.12,0))}
 else if(t=='water'){g.add(at(cyl(.15,.17,.32,'#3fa9f5',12),0,.16,0),at(cyl(.025,.035,.34,'#3fa9f5',6),.2,.28,0),at(new THREE.Mesh(new THREE.TorusGeometry(.1,.025,6,12,Math.PI),mat('#2a7ac5')),0,.33,0));g.children[1].rotation.z=-.9}
 else if(t=='nutr'){g.add(at(cyl(.09,.1,.3,lbl('#ff7a2a','NUTR'),10),0,.15,0),at(cyl(.05,.05,.07,'#222',8),0,.33,0))}
 else if(t=='light'){g.add(at(box(.9,.07,.5,'#2a2a2a'),0,2.35,0),at(box(.82,.02,.42,mat('#ffe6ff',{emissive:'#ffd0ff',emissiveIntensity:2.2})),0,2.31,0));for(const a of[-1,1])g.add(at(cyl(.008,.008,.6,'#111',4),a*.4,2.68,0));g.add(at(box(.5,.12,.35,'#555'),0,.06,0))}
 else if(t=='rack'){for(const a of[-1,1]){g.add(at(box(.06,1.7,.06,'#c9a06a'),a*.6,.85,0),at(box(.06,.06,.6,'#c9a06a'),a*.6,.03,0))}for(let i=0;i<2;i++)g.add(at(cyl(.01,.01,1.2,'#eee',4),0,1.6-i*.35,0));g.children.slice(-2).forEach(c=>c.rotation.z=Math.PI/2);
  (d.slots||[]).forEach((s,i)=>{const b=budCluster(s.t>0?'#7ab85a':'#9a8a4a',6,.05);b.position.set(-.45+i*.3,1.42,0);g.add(b,at(cyl(.004,.004,.15,'#eee',3),-.45+i*.3,1.52,0))})}
 else if(t=='jars'){g.add(at(box(.45,.3,.35,'#d9b47a'),0,.15,0),at(box(.46,.04,.36,'#b98f55'),0,.31,0));for(let i=0;i<3;i++)g.add(at(cyl(.06,.06,.12,glass,8),-.13+i*.13,.38,0))}
 else if(t=='scale'){g.add(at(box(.5,.12,.4,'#e8e8ee',{metalness:.3,roughness:.4}),0,.06,0),at(cyl(.17,.17,.02,'#bbb',16,{metalness:.7,roughness:.3}),0,.13,0),at(box(.16,.06,.02,mat('#7cff6a',{emissive:'#5f5',emissiveIntensity:1.5})),0,.08,.205))}
 else if(t=='wetbud'||t=='drybud'){const b=budCluster(t=='wetbud'?'#6ab84a':new THREE.Color(SCOL[d.s]).lerp(new THREE.Color('#8a9a4a'),.5).getStyle(),9,.06);b.position.y=.1;g.add(b)}
 else if(t=='packed'){g.add(at(cyl(.1,.1,.2,glass,12),0,.1,0),at(cyl(.105,.105,.05,'#222',12),0,.22,0));const b=budCluster(SCOL[d.s],5,.04);b.position.y=.08;g.add(b);g.add(at(box(.12,.08,.005,lbl(SCOL[d.s],d.g+'g')),0,.1,.1))}
 else g.add(at(box(.3,.3,.3,'#f0f'),0,.15,0));return g}
const NAME=t=>t=='wetbud'?'Wet Bud':t=='drybud'?'Dried Bud':t=='packed'?'Packed Jar':SHOP[t]?.n||t;
const ekey=e=>{const p=e.data.plant;return e.type+'|'+(e.data.soil||0)+'|'+(p?stage(p)+(p.age/15|0)+'|'+Math.round(p.health/25):'')+'|'+JSON.stringify(e.data.slots?.map(s=>s.t>0))+'|'+(e.data.g||'')}
// ---------- input ----------
const keys={};let yaw=Math.PI,pitch=-.1,locked=false;
addEventListener('keydown',e=>{keys[e.code]=true;if(e.code=='Escape'&&game&&!$('menu').classList.contains('on')){if(lapOpen)closeLap();else setPause(!paused)}
 if(game&&!paused&&!lapOpen&&!$('menu').classList.contains('on')){if(e.code=='KeyE')interact();if(e.code=='KeyG')drop()}if(e.code=='Enter'&&$('m-join').offsetParent&&document.activeElement.tagName!='INPUT');});
addEventListener('keyup',e=>keys[e.code]=false);
renderer.domElement.addEventListener('mousedown',e=>{if(game&&!paused&&!lapOpen){if(!locked)renderer.domElement.requestPointerLock?.();else if(e.button==0)interact();else if(e.button==2)drop()}});addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('pointerlockchange',()=>locked=document.pointerLockElement==renderer.domElement);
addEventListener('mousemove',e=>{if(!locked)return;const s=settings.sens*.0005;yaw-=e.movementX*s;pitch=THREE.MathUtils.clamp(pitch-e.movementY*s,-1.4,1.4)});
// ---------- game ----------
let game=null,W=null,ws=null,myId=0,hostId=0,roster=[],paused=false,lapOpen=false;const ENTS=new Map(),OTH=new Map();
const me={pos:new THREE.Vector3(0,0,3),bob:0};
function collide(p){for(const w of WALLS){const r=.3;const cx=THREE.MathUtils.clamp(p.x,w.x0,w.x1),cz=THREE.MathUtils.clamp(p.z,w.z0,w.z1);const dx=p.x-cx,dz=p.z-cz,l=Math.hypot(dx,dz);
 if(l<r){if(l<1e-4){p.x+=r}else{p.x+=dx/l*(r-l);p.z+=dz/l*(r-l)}}}p.x=THREE.MathUtils.clamp(p.x,-14,14);p.z=THREE.MathUtils.clamp(p.z,-12,12.6)}
const send=m=>ws&&ws.readyState==1&&ws.send(JSON.stringify(m));
function net(cb){if(ws&&ws.readyState==1)return cb();ws=new WebSocket((location.protocol=='https:'?'wss://':'ws://')+location.host+'/ws');ws.onopen=cb;
 ws.onmessage=e=>{const m=JSON.parse(e.data);
  if(m.t=='err')$('jerr').textContent=m.e;
  if(m.t=='joined'){myId=m.id;hostId=m.host;$('lcode').textContent=m.code;if(game&&game.solo)return;if(!pendingSolo)showMenu('lobby')}
  if(m.t=='roster'){roster=m.pl;hostId=m.host;renderLobby();if(pendingSolo&&myId==hostId){pendingSolo=false;send({t:'start'})}
   if(m.left){const o=OTH.get(m.left);if(o){scene.remove(o.g);o.tag.remove();OTH.delete(m.left)}}}
  if(m.t=='start')startGame(m.pl);
  if(m.t=='w')applyWorld(m.w);
  if(m.t=='s'&&game){let o=OTH.get(m.id);if(!o){const r=roster.find(p=>p.id==m.id)||{color:'#fff',name:'?'};o={g:dude(r.color),tag:document.createElement('div'),tp:new THREE.Vector3()};o.tag.className='tag';o.tag.textContent=r.name;o.tag.style.color=r.color;document.body.append(o.tag);scene.add(o.g);o.g.position.set(m.p[0],0,m.p[1]);OTH.set(m.id,o)}
   o.tp.set(m.p[0],0,m.p[1]);o.yaw=m.r}};
 ws.onclose=()=>{if(game)toast('Disconnected')}}
function renderLobby(){$('lpl').innerHTML=roster.map(p=>`<div class="pl" style="color:${p.color}">● ${p.name}${p.id==hostId?' (host)':''}</div>`).join('')+`<p>${roster.length}/4 growers</p>`;$('bstart').style.display=myId==hostId?'':'none'}
function dude(c){const g=new THREE.Group(),m=mat(c,{flatShading:false}),sk=mat('#ffd3a8',{flatShading:false});g.add(at(sh(new THREE.Mesh(new THREE.CapsuleGeometry(.3,.6,4,10),m)),0,.75,0),at(sh(new THREE.Mesh(new THREE.SphereGeometry(.24,14,10),sk)),0,1.45,0),
 at(sh(new THREE.Mesh(new THREE.SphereGeometry(.25,14,8,0,6.3,0,1.6),m)),0,1.5,0),at(box(.3,.04,.2,c),0,1.52,.2));for(const s of[-1,1])g.add(at(new THREE.Mesh(new THREE.SphereGeometry(.035,6,6),mat('#111')),s*.08,1.47,.21));g.add(at(new THREE.Group(),0,.9,.45));return g}
function applyWorld(w){W=w;setRoom(w.room);
 const seen=new Set();for(const e of w.ents){seen.add(e.id);let o=ENTS.get(e.id);const k=ekey(e);
  if(!o||o.k!=k){if(o)o.g.parent?.remove(o.g);o={g:prop(e),k};ENTS.set(e.id,o)}o.e=e;
  if(e.by){const tgt=e.by==myId?hand:OTH.get(e.by)?.g.children.at(-1);if(tgt&&o.g.parent!=tgt){tgt.add(o.g);o.g.position.set(0,e.type=='light'?-2.2:0,0);o.g.rotation.set(0,0,0);o.g.scale.setScalar(e.type=='light'||e.type=='rack'?.5:1)}}
  else{if(o.g.parent!=scene){scene.add(o.g);o.g.scale.setScalar(1)}o.g.position.set(e.x,e.y,e.z);o.g.rotation.set(0,e.ry,0)}}
 for(const [id,o] of ENTS)if(!seen.has(id)){o.g.parent?.remove(o.g);ENTS.delete(id)}
 w.log.forEach(t=>feed(t));if(w.toast&&w.toast.pid==myId)toast(w.toast.t);if(w.sound)sfx(w.sound);if(lapOpen)renderLap(true)}
const hand=new THREE.Group();hand.position.set(.32,-.38,-.62);camera.add(hand);
let feedL=[];function feed(t){feedL.push(t);feedL=feedL.slice(-5);$('feed').innerHTML=feedL.join('<br>')}
let toastT;function toast(t){$('toast').textContent=t;$('toast').style.opacity=1;clearTimeout(toastT);toastT=setTimeout(()=>$('toast').style.opacity=0,2400)}
const carried=()=>W&&W.ents.find(e=>e.by==myId);
function target(){if(!W)return null;const eye=camera.position,dir=new THREE.Vector3();camera.getWorldDirection(dir);let best=null,bs=-1;
 const cands=[{fx:'laptop',p:LAPTOP},{fx:'drop',p:DROP},...W.ents.filter(e=>!e.by).map(e=>({e,p:new THREE.Vector3(e.x,e.type=='light'?.3:e.type=='rack'?1.2:e.type=='pot'?.45:.15,e.z)}))];
 for(const c of cands){const v=c.p.clone().sub(eye),d=v.length();if(d>2.6)continue;const dot=v.normalize().dot(dir);const sc=dot-d*.015;if(dot>.9&&sc>bs){bs=sc;best=c}}return best}
function promptFor(c,t){if(!t)return null;if(t.fx=='laptop')return 'Use Laptop';if(t.fx=='drop')return c?.type=='packed'?'Deliver '+c.data.g+'g to Drop Box':'Drop Box — bring packed jars';
 const e=t.e,d=e.data,st=stage(d.plant);
 if(!c){if(e.type=='pot'&&st=='ready')return 'Harvest';if(st=='dead')return 'Clear dead plant';if(e.type=='rack'&&d.slots?.some(s=>s.t<=0))return 'Take dried bud';return 'Pick up '+NAME(e.type)}
 if(e.type=='pot'){if(c.type=='soil')return d.soil?null:'Fill with soil';if(c.type.startsWith('seed_'))return d.soil&&!d.plant?'Plant '+STRAINS[c.type.slice(5)].name:null;if(c.type=='water'&&d.plant)return 'Water';if(c.type=='nutr'&&d.plant)return 'Feed nutrients'}
 if(e.type=='rack'&&c.type=='wetbud')return 'Hang to dry';if(e.type=='scale'&&c.type=='drybud')return 'Weigh & pack';return null}
let curT=null;
function syncCam(){camera.position.set(me.pos.x,1.62+Math.sin(me.bob)*.035,me.pos.z);camera.rotation.set(pitch,yaw,0,'YXZ');camera.updateMatrixWorld()}
function interact(){initAudio();syncCam();curT=target();const c=carried(),t=curT;if(!t){return}if(t.fx=='laptop')return openLap();
 if(t.fx=='drop'){if(c)send({t:'use',target:'drop'});return}
 if(!c||promptFor(c,t))send({t:'use',target:t.e.id});else toast("Can't use "+NAME(c.type)+' on that')}
function drop(){const c=carried();if(!c)return;const dir=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));const p=me.pos.clone().addScaledVector(dir,1.1);collide(p);send({t:'drop',x:+p.x.toFixed(2),z:+p.z.toFixed(2),y:0,ry:yaw});sfx('drop')}
function plantInfo(e){const p=e.data.plant;if(!p)return e.data.soil?'Soil ready — plant a seed':'Empty pot — add soil';const st=stage(p);if(st=='dead')return 'Dead plant';
 const bar=(n,v,c)=>`<span style="color:${v<15?'#ff6a5a':c}">${n} ${Math.round(v)}%</span>`;
 return `<b>${STRAINS[p.s].name}</b> · ${st.toUpperCase()}${st!='ready'?' '+Math.round(p.age/READY*100)+'%':''}<br>${bar('💧',p.water,'#7fd3ff')} · ${bar('🧪',p.nutr,'#ffb36a')} · ${bar('❤',p.health,'#9f9')} · ${p.lit?'💡 lit':'<span style="color:#ff6a5a">no light</span>'}`}
// ---------- laptop ----------
let tab='shop';
function openLap(){lapOpen=true;document.exitPointerLock?.();$('laptop').classList.add('on');renderLap();sfx('ui')}
function closeLap(){lapOpen=false;$('laptop').classList.remove('on');setFocus(null)}
function renderLap(keep){if(!W)return;const fi=keep&&fEl?[...document.querySelectorAll('#laptop button')].indexOf(fEl):-1;
 document.querySelectorAll('.tab[data-tab]').forEach(b=>b.classList.toggle('sel',b.dataset.tab==tab));$('lmoney').textContent='$'+W.money+' · ★'+W.rep;
 let h='';if(tab=='shop')h=Object.entries(SHOP).map(([k,v])=>`<button class="card" data-buy="${k}"><h3>${v.n}</h3>${v.uses?v.uses+' uses · ':''}<span class="p">$${v.p}</span></button>`).join('')+(W.pending?`<div class="card">🚚 ${W.pending} item(s) on the way</div>`:'');
 if(tab=='contracts')h=W.contracts.map(c=>`<div class="card" style="border-left:6px solid ${SCOL[c.s]}"><h3>${c.shop}</h3>${c.g}g ${STRAINS[c.s].name}<br>Delivered ${c.got}/${c.g}g<br>Due end of day ${c.due}<br><span class="p">$${c.pay}</span></div>`).join('')+'<div class="card">Deliver packed jars at the green Drop Box outside. Contracts auto-match by strain.</div>';
 if(tab=='upg')h=`<button class="card" data-upg="1"><h3>Big Grow Room</h3>Doubles your space.<br>Needs ★5 reputation.<br>${W.room>1?'<b>OWNED</b>':'<span class="p">$500</span>'}</button><div class="card"><h3>Reputation ★${W.rep}</h3>Finish contracts to earn rep. Higher rep = bigger, better-paying contracts.</div>`;
 $('lbody').innerHTML=h;if(fi>=0){const L=[...document.querySelectorAll('#laptop button')];setFocus(L[fi]||null)}}
// ---------- menus / pause / controller UI ----------
function setPause(v){if(!game)return;paused=v;$('pause').classList.toggle('on',v);if(v)document.exitPointerLock?.();setFocus(null)}
function showMenu(which){setFocus(null);$('menu').classList.add('on');['main','join','lobby','set'].forEach(k=>$('m-'+k).style.display=k==which?(k=='main'?'flex':''):'none')}
const OSK='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';let oskT=null;
$('osk').innerHTML=[...OSK].map(c=>`<button class="key" data-k="${c}">${c}</button>`).join('')+'<button class="key w" data-k="DEL">DEL</button><button class="key w" data-k="OK">OK</button>';
['code','nm'].forEach(k=>$(k).addEventListener('focus',()=>{oskT=$(k);setTgt()}));
function setTgt(){document.querySelectorAll('#code,#nm').forEach(e=>e.classList.toggle('tgt',e==(oskT||$('code'))))}
function oskKey(k){const t=oskT||$('code');if(k=='DEL')t.value=t.value.slice(0,-1);else if(k=='OK'){if(t.id=='code')oskT=$('nm');else document.querySelector('[data-a=dojoin]').click()}else if(t.value.length<(+t.maxLength||10))t.value+=k;setTgt()}
function uiRoot(){if($('splash').classList.contains('on'))return $('splash');if($('menu').classList.contains('on'))return [...$('menu').children].find(e=>e.id!='brand'&&e.offsetParent);if(lapOpen)return $('laptop');if(paused)return $('pause');return null}
let fEl=null;const focusables=r=>[...r.querySelectorAll('button,input,select')].filter(e=>e.offsetParent);
function setFocus(e){fEl&&fEl.classList.remove('f');fEl=e;if(e){e.classList.add('f');e.scrollIntoView?.({block:'nearest'})}}
function nav(dx,dy){const root=uiRoot();if(!root||root.id=='splash')return;const L=focusables(root);if(!L.length)return;if(!fEl||!L.includes(fEl)){setFocus(L[0]);return}
 if(dx&&(fEl.type=='range'||fEl.tagName=='SELECT')){if(fEl.type=='range')fEl.value=+fEl.value+dx;else fEl.selectedIndex=THREE.MathUtils.clamp(fEl.selectedIndex+dx,0,fEl.options.length-1);fEl.dispatchEvent(new Event('change'));sfx('ui');return}
 const a=fEl.getBoundingClientRect(),ax=a.x+a.width/2,ay=a.y+a.height/2;let best=null,bs=1e9;
 for(const e of L){if(e==fEl)continue;const b=e.getBoundingClientRect(),ex=b.x+b.width/2-ax,ey=b.y+b.height/2-ay,al=ex*dx+ey*dy;if(al<=4)continue;const sc=al+(Math.abs(ex*dy)+Math.abs(ey*dx))*2.5;if(sc<bs){bs=sc;best=e}}
 if(best){setFocus(best);sfx('ui')}}
function uiA(){const root=uiRoot();if(!root)return;if(root.id=='splash')return endSplash();if(!fEl||!focusables(root).includes(fEl))return nav(0,1);
 if(fEl.tagName=='INPUT'&&fEl.type!='range'){fEl.focus();setFocus(document.querySelector('#osk .key'));return}fEl.click()}
function uiB(){const root=uiRoot();if(!root||root.id=='splash')return;document.activeElement?.blur?.();const b=root.querySelector('[data-a=back],[data-a=leave],[data-a=resume],[data-a=close]');b&&b.click()}
const pb={},rp={t:0,d:''};
function pollPad(dt){const gp=[...(navigator.getGamepads?.()||[])].find(Boolean);if(!gp)return null;const B=k=>!!gp.buttons[k]?.pressed||(k==7&&gp.buttons[7]?.value>.4);const edge=k=>{const v=B(k),w=!pb[k]&&v;pb[k]=v;return w};
 const st=edge(9),a=edge(0),b=edge(1),rt=edge(7),lb=edge(4),rb=edge(5);const root=uiRoot();
 if(st){if(game&&!$('menu').classList.contains('on')){if(lapOpen)closeLap();else setPause(!paused)}else if(!game)uiA()}
 if(root){let dx=(B(15)?1:0)-(B(14)?1:0),dy=(B(13)?1:0)-(B(12)?1:0);if(!dx&&!dy){const x=gp.axes[0],y=gp.axes[1];if(Math.abs(x)>.55)dx=Math.sign(x);else if(Math.abs(y)>.55)dy=Math.sign(y)}
  const d=dx+','+dy;if(dx||dy){if(d!=rp.d){rp.d=d;rp.t=.38;nav(dx,dy)}else if((rp.t-=dt)<=0){rp.t=.13;nav(dx,dy)}}else rp.d='';
  if(lapOpen&&(lb||rb)){const T=['shop','contracts','upg'];tab=T[(T.indexOf(tab)+(rb?1:2))%3];renderLap();setFocus(null)}
  if(a)uiA();if(b)uiB();return null}
 if(a||rt)interact();if(b)drop();const dz=v=>Math.abs(v)>.15?v:0;return {mx:dz(gp.axes[0]),my:-dz(gp.axes[1]),lx:dz(gp.axes[2]),ly:dz(gp.axes[3])}}
let pendingSolo=false;
function startGame(pl){roster=pl;game={solo:pl.length==1&&pendingSolo===false&&roster.length==1};$('menu').classList.remove('on');$('hud').style.display='block';me.pos.set(0,0,3.5);yaw=Math.PI*0;pitch=-.15;toast('Welcome to your grow shed! Check the laptop.')}
function endGame(){game=null;W=null;for(const o of ENTS.values())o.g.parent?.remove(o.g);ENTS.clear();for(const o of OTH.values()){scene.remove(o.g);o.tag.remove()}OTH.clear();$('hud').style.display='none';ws&&ws.close();ws=null;paused=false;$('pause').classList.remove('on');closeLap();document.exitPointerLock?.()}
document.addEventListener('click',e=>{initAudio();setVol(settings.vol/10);const el=e.target.closest('button');if(!el)return;const ds=el.dataset;sfx('ui');
 if(ds.k)return oskKey(ds.k);if(ds.tab){tab=ds.tab;renderLap();return}if(ds.buy){send({t:'buy',item:ds.buy});sfx('buy');return}if(ds.upg){send({t:'upgrade'});return}
 const a=ds.a,nm=()=>($('nm').value||localStorage.bt_nm||'Grower').toUpperCase();
 if(a=='solo'){pendingSolo=true;net(()=>send({t:'host',name:nm()}))}
 if(a=='host')net(()=>send({t:'host',name:nm()}));if(a=='join'){showMenu('join');oskT=$('code');setTgt()}if(a=='set')showMenu('set');
 if(a=='back'){if(game){$('menu').classList.remove('on');setFocus(null)}else showMenu('main')}
 if(a=='dojoin'){localStorage.bt_nm=$('nm').value;net(()=>send({t:'join',code:$('code').value,name:nm()}))}
 if(a=='start')send({t:'start'});if(a=='leave'){ws&&ws.close();ws=null;showMenu('main')}
 if(a=='resume')setPause(false);if(a=='close')closeLap();if(a=='tomenu'){endGame();showMenu('main')}});
['sens','qual','vol'].forEach(k=>{$(k).value=settings[k];$(k).onchange=()=>{settings[k]=+$(k).value;localStorage.bt_set=JSON.stringify(settings);setVol(settings.vol/10);if(k=='qual')location.reload()}});
const endSplash=()=>{if(!$('splash').classList.contains('on'))return;$('splash').classList.remove('on');if(!game)showMenu('main')};$('splash').onclick=endSplash;setTimeout(endSplash,Q.has('nosplash')?0:2900);
// ---------- grow-light pool ----------
const GL=[];for(let i=0;i<4;i++){const l=new THREE.PointLight('#ffc8ff',0,5,1.5);scene.add(l);GL.push(l)}
// ---------- loop ----------
const clock=new THREE.Clock();let T=0,sendT=0;
function frame(){requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.1);T+=dt;const pad=pollPad(dt);
 if(game){const free=!paused&&!lapOpen&&!$('menu').classList.contains('on');let mx=0,my=0;
  if(free){mx=(keys.KeyD?1:0)-(keys.KeyA?1:0);my=(keys.KeyW?1:0)-(keys.KeyS?1:0);if(pad){mx+=pad.mx;my+=pad.my;const s=settings.sens/5;yaw-=pad.lx*2.6*s*dt;pitch=THREE.MathUtils.clamp(pitch-pad.ly*2*s*dt,-1.4,1.4)}}
  const f=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)),r=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));const v=f.multiplyScalar(my).addScaledVector(r,mx);if(v.length()>1)v.normalize();
  const sp=keys.ShiftLeft?6:4;me.pos.addScaledVector(v,sp*dt);collide(me.pos);me.bob+=v.length()*dt*9;
  camera.position.set(me.pos.x,1.62+Math.sin(me.bob)*.035,me.pos.z);camera.rotation.set(pitch,yaw,0,'YXZ');hand.position.y=-.38+Math.sin(me.bob*.5)*.01;
  if((sendT-=dt)<0){sendT=1/15;send({t:'s',p:[+me.pos.x.toFixed(2),+me.pos.z.toFixed(2)],r:+yaw.toFixed(2)})}
  for(const o of OTH.values()){o.g.position.lerp(o.tp,1-Math.exp(-dt*10));o.g.rotation.y=o.yaw;const p=o.g.position.clone().setY(2).project(camera);o.tag.style.display=p.z<1?'':'none';o.tag.style.left=(p.x+1)/2*innerWidth+'px';o.tag.style.top=(1-p.y)/2*innerHeight+'px'}
  if(W){const c=carried();curT=free?target():null;const pr=promptFor(c,curT);let h='';
   if(curT){h=pr?`<span class="g a">A</span><span class="g">E</span> ${pr}`:(c?`<span style="opacity:.7">Can't use ${NAME(c.type)} here</span>`:'');if(curT.e?.type=='pot')h+='<br><small>'+plantInfo(curT.e)+'</small>';
    if(curT.e?.type=='rack'&&curT.e.data.slots?.length)h+='<br><small>'+curT.e.data.slots.map(s=>s.t>0?`drying ${Math.ceil(s.t)}s`:'✔ dry').join(' · ')+'</small>'}
   $('prompt').innerHTML=h;$('hold').innerHTML=c?`Holding <b>${NAME(c.type)}</b>${c.data.uses!=null?' ('+c.data.uses+' left)':''}${c.data.g?' · '+c.data.g+'g '+STRAINS[c.data.s].name:''}<br><span class="g b">B</span><span class="g">G</span> drop`:'';
   $('stats').innerHTML=`$${W.money}<br><small>★ ${W.rep} REP · ${W.contracts.length} CONTRACTS</small>`;const hh=W.min/60|0,mm=(W.min%60|0);$('clock').innerHTML=`DAY ${W.day}<br><small style="font:900 18px Nunito">${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}</small>`;
   const dl=Math.max(.15,Math.sin((W.min/1440-.25)*Math.PI*2)*.5+.5);sun.intensity=2.4*dl;hemi.intensity=.4+.6*dl;scene.background.copy(SKY).multiplyScalar(.25+.75*dl);
   const ls=W.ents.filter(e=>e.type=='light'&&!e.by).sort((a,b)=>Math.hypot(a.x-me.pos.x,a.z-me.pos.z)-Math.hypot(b.x-me.pos.x,b.z-me.pos.z));GL.forEach((l,i)=>{const e=ls[i];l.intensity=e?5:0;if(e)l.position.set(e.x,2.1,e.z)})}}
 else{const a=T*.05;camera.position.set(Math.sin(a)*1.2+.5,1.7,1.2+Math.cos(a)*.6);camera.lookAt(0,.6,-3)}
 composer?composer.render():renderer.render(scene,camera)}
frame();
// title backdrop: a few demo plants
const demo=new THREE.Group();[[-1.2,-3,300],[0,-3.2,470],[1.2,-3,120]].forEach(([x,z,a],i)=>{const g=prop({type:'pot',data:{soil:1,plant:{s:['owl','kush','haze'][i],age:a,health:100,water:80,nutr:80}}});g.position.set(x,0,z);demo.add(g)});
const dl=prop({type:'light',data:{}});dl.position.set(0,0,-3);dl.children.at(-1).visible=false;demo.add(dl);scene.add(demo);
const syncDemo=()=>demo.visible=!game;setInterval(syncDemo,200);
window.__bt={get W(){return W},get game(){return game},send,look(y,p){yaw=y;pitch=p},tp(x,z){me.pos.set(x,0,z)},lookAt(x,y,z){const dx=x-me.pos.x,dz=z-me.pos.z;yaw=Math.atan2(-dx,-dz);pitch=Math.atan2(y-1.62,Math.hypot(dx,dz))},interact,drop,openLap,closeLap,tab:t=>{tab=t;renderLap()},target:()=>{syncCam();const t=target();return t&&(t.fx||t.e.type)}};
