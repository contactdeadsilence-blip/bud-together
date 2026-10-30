import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {GTAOPass} from 'three/examples/jsm/postprocessing/GTAOPass.js';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {sfx,initAudio,setVol} from './audio.js';
import {STRAINS,SHOP,READY,stage} from './rules.js';
const $=id=>document.getElementById(id);const Q=new URLSearchParams(location.search);
const settings=Object.assign({sens:5,qual:2,vol:7,inv:0},JSON.parse(localStorage.bt_set||'{}'));if(Q.has('q'))settings.qual=+Q.get('q');
const HQ=settings.qual>0;
// ---------- renderer ----------
const renderer=new THREE.WebGLRenderer({antialias:!HQ,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,settings.qual==2?1.5:1));renderer.setSize(innerWidth,innerHeight);
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
document.body.prepend(renderer.domElement);
const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,.05,400);scene.add(camera);
const SKY=new THREE.Color('#a8d8ff');scene.background=SKY.clone();scene.fog=new THREE.Fog('#d6ead0',30,110);
const GRADE={uniforms:{tDiffuse:{value:null}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);vec3 col=c.rgb*vec3(1.05,1.0,.9);float l=dot(col,vec3(.299,.587,.114));col=mix(vec3(l),col,1.1);col=(col-.5)*1.05+.5;vec2 d=vUv-.5;col*=1.-dot(d,d)*.6;gl_FragColor=vec4(col,c.a);}'};
let composer=null;
if(HQ){composer=new EffectComposer(renderer,new THREE.WebGLRenderTarget(innerWidth,innerHeight,{samples:settings.qual==2?4:0,type:THREE.HalfFloatType}));composer.addPass(new RenderPass(scene,camera));
 if(settings.qual==2){try{const ao=new GTAOPass(scene,camera,innerWidth,innerHeight);ao.blendIntensity=.85;ao.updateGtaoMaterial({radius:.5,distanceExponent:1.4,thickness:1,scale:1.1,samples:12});composer.addPass(ao)}catch(e){console.warn('AO off',e)}}
 composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth/2,innerHeight/2),.28,.5,.86));composer.addPass(new OutputPass());composer.addPass(new ShaderPass(GRADE))}
else{const vig=document.createElement('div');vig.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:5;background:radial-gradient(ellipse at center,transparent 60%,rgba(20,15,5,.4))';document.body.append(vig)}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer&&composer.setSize(innerWidth,innerHeight)});
const hemi=new THREE.HemisphereLight('#ffefd2','#5a4630',.75);scene.add(hemi);
const sun=new THREE.DirectionalLight('#ffe0b0',2.3);sun.position.set(-14,22,18);sun.castShadow=true;const SM=settings.qual==2?2048:1024;sun.shadow.mapSize.set(SM,SM);
Object.assign(sun.shadow.camera,{left:-20,right:20,top:20,bottom:-20,near:1,far:70});sun.shadow.bias=-.0004;sun.shadow.normalBias=.03;scene.add(sun);
// ---------- helpers ----------
const rnd=(s=>()=>(s=(s*16807)%2147483647)/2147483647)(4242);
const mulberry=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const mat=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.8},o));
const sh=m=>{m.castShadow=m.receiveShadow=true;return m};
const box=(w,h,d,c,o)=>sh(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof c=='string'?mat(c,o):c));
const cyl=(a,b,h,c,seg=12,o)=>sh(new THREE.Mesh(new THREE.CylinderGeometry(a,b,h,seg),typeof c=='string'?mat(c,o):c));
const at=(m,x,y,z)=>{m.position.set(x,y,z);return m};
const R=(a,b)=>a+Math.random()*(b-a);
function tex(w,h,draw,rep){const cv=document.createElement('canvas');cv.width=w;cv.height=h;draw(cv.getContext('2d'),w,h);const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...rep)}return t}
function speck(x,w,h,n,cols,sz=3){for(let i=0;i<n;i++){x.fillStyle=cols[i%cols.length];x.globalAlpha=R(.15,.5);x.fillRect(R(0,w),R(0,h),R(1,sz),R(1,sz))}x.globalAlpha=1}
const plankTex=(base,rep,vert)=>tex(512,512,(x,w,h)=>{if(vert){x.translate(w,0);x.rotate(Math.PI/2)}const n=6,ph=h/n;for(let i=0;i<n;i++){const c=new THREE.Color(base).offsetHSL(R(-.01,.01),R(-.05,.05),R(-.06,.06));x.fillStyle=c.getStyle();x.fillRect(0,i*ph,w,ph);
 x.strokeStyle='rgba(70,35,10,.2)';for(let k=0;k<10;k++){x.lineWidth=R(.5,2);x.beginPath();const y0=i*ph+R(4,ph-4);x.moveTo(0,y0);for(let X=0;X<=w;X+=24)x.lineTo(X,y0+Math.sin(X*.015+k)*R(1,3));x.stroke()}
 if(Math.random()<.5){x.fillStyle='rgba(80,40,15,.35)';x.beginPath();x.ellipse(R(40,w-40),i*ph+ph/2,10,5,0,0,7);x.fill()}
 x.fillStyle='rgba(40,20,5,.6)';x.fillRect(0,i*ph,w,3);const off=R(60,w-60);x.fillRect(off,i*ph,3,ph);x.fillStyle='rgba(40,40,40,.7)';for(const X of[off+10,off-8])for(const Y of[ph*.25,ph*.75]){x.beginPath();x.arc(X,i*ph+Y,2.5,0,7);x.fill()}}},rep);
const floorT=plankTex('#b47a48',[4,5]),wallT=plankTex('#dcbc8c',null,true),soilT=tex(128,128,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);speck(x,w,h,900,['#3a2614','#6a4a2a','#000'],4);speck(x,w,h,40,['#fff'],3)}),
 terraT=tex(128,128,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);speck(x,w,h,500,['#c79a7a','#fff2e0','#a0603a'],3)}),
 blobT=tex(64,64,(x,w,h)=>{const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(0,0,0,.6)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,w,h)}),
 edgeT=tex(8,64,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(0,0,0,.5)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,w,h)}),
 gravelT=tex(256,256,(x,w,h)=>{x.fillStyle='#c9b48a';x.fillRect(0,0,w,h);speck(x,w,h,1500,['#8a7a5a','#e8dcc0','#6a5a40'],5)},[1,3]),
 shingleT=tex(256,256,(x,w,h)=>{for(let r=0;r<8;r++)for(let c=0;c<9;c++){x.fillStyle=new THREE.Color('#8a3a2a').offsetHSL(0,0,R(-.06,.06)).getStyle();x.fillRect(c*32-(r%2)*16,r*32,31,30)}},[4,2]);
const blobM=new THREE.MeshBasicMaterial({map:blobT,transparent:true,depthWrite:false});const blobG=new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2);
const blob=(r,y=.012)=>{const m=new THREE.Mesh(blobG,blobM);m.scale.set(r*2,1,r*2);m.position.y=y;m.renderOrder=1;return m};
const lblC={};function lbl(key,draw,w=256,h=256){return lblC[key]||(lblC[key]=tex(w,h,draw))}
function leafIcon(x,cx,cy,s,col){x.fillStyle=col;for(let i=0;i<7;i++){const a=(i-3)*.42-Math.PI/2,l=s*(1-Math.abs(i-3)*.17);x.save();x.translate(cx,cy);x.rotate(a+Math.PI/2);x.beginPath();x.ellipse(0,-l/2,l*.13,l/2,0,0,7);x.fill();x.restore()}}
// ---------- plant geometry ----------
const prep=g=>{g=g.index?g.toNonIndexed():g;for(const k of Object.keys(g.attributes))if(k!='position'&&k!='normal')g.deleteAttribute(k);if(!g.attributes.normal)g.computeVertexNormals();return g};
function leafletGeo(){const n=8,W=.12,f=t=>W*Math.pow(Math.max(0,Math.sin(Math.PI*t)),.85)*(1-.3*t);const P=[];for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n,tm=t0+.65/n;P.push([f(tm)*1.1,tm],[i==n-1?0:f(t1)*.8,t1])}
 const s=new THREE.Shape();s.moveTo(0,0);P.forEach(([x,y])=>s.lineTo(x,y));for(let i=P.length-2;i>=0;i--)s.lineTo(-P[i][0],P[i][1]);s.lineTo(0,0);return new THREE.ShapeGeometry(s)}
function fanGeo(nl,spread=1.35,droop=.4){const base=leafletGeo();const parts=[];for(let k=0;k<nl;k++){const o=nl>1?(k-(nl-1)/2)/((nl-1)/2):0;const L=1-Math.abs(o)*.45;const g=base.clone();g.scale(L,L,1);g.rotateY(o*.15);g.rotateZ(-o*spread);parts.push(prep(g))}
 const g=mergeGeometries(parts);g.rotateZ(-Math.PI/2);g.rotateX(-Math.PI/2);const P=g.attributes.position;for(let i=0;i<P.count;i++){const x=P.getX(i),z=P.getZ(i);P.setY(i,P.getY(i)-droop*(x*x+z*z)+.12*Math.abs(z))}g.computeVertexNormals();return g}
const FAN7=fanGeo(7),FAN5=fanGeo(5,1.2),FAN3=fanGeo(3,.9,.3),FAN1=fanGeo(1,0,.5),ROUND=prep(new THREE.SphereGeometry(1,8,4)),BUD=prep(new THREE.IcosahedronGeometry(1,0)),CYL6=prep(new THREE.CylinderGeometry(1,1,1,6,1,true)),CYL3=prep(new THREE.CylinderGeometry(1,.4,1,3,1,true));
class PB{constructor(){this.g=[]}add(geo,m,col,grad=0){const q=geo.clone();const P=q.attributes.position,n=P.count,c=new Float32Array(n*3),C=new THREE.Color(col);
 for(let i=0;i<n;i++){const k=grad?.75+.4*Math.min(1,Math.hypot(P.getX(i),P.getZ(i))):1;c[i*3]=C.r*k;c[i*3+1]=C.g*k;c[i*3+2]=C.b*k}q.applyMatrix4(m);q.setAttribute('color',new THREE.BufferAttribute(c,3));this.g.push(q)}
 mesh(m=PLANTM){const g=this.g.length?mergeGeometries(this.g):new THREE.BufferGeometry();const me=new THREE.Mesh(g,m);me.castShadow=me.receiveShadow=true;return me}}
const PLANTM=new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.62});
const _o=new THREE.Object3D(),_v=new THREE.Vector3(),_q=new THREE.Quaternion(),_m=new THREE.Matrix4(),UP=new THREE.Vector3(0,1,0),V=(x,y,z)=>new THREE.Vector3(x,y,z);
function seg(pb,a,b,r,col,geo=CYL6){_v.subVectors(b,a);const L=_v.length();if(L<1e-5)return;_q.setFromUnitVectors(UP,_v.normalize());_m.compose(a.clone().add(b).multiplyScalar(.5),_q,V(r,L,r));pb.add(geo,_m,col)}
function fan(pb,p,yaw,elev,s,col,geo=FAN7,roll=0){_o.position.copy(p);_o.rotation.set(roll,yaw,elev,'YXZ');_o.scale.setScalar(s);_o.updateMatrix();pb.add(geo,_o.matrix,col,1)}
function blobAt(pb,p,sx,sy,sz,col,geo=BUD,r=0){_o.position.copy(p);_o.rotation.set(r,r*2,r*3);_o.scale.set(sx,sy,sz);_o.updateMatrix();pb.add(geo,_o.matrix,col)}
const TINT={kush:'#8a62c8',haze:'#dcd070',owl:'#b8e8c0'},SCOL={kush:'#a06bf0',haze:'#f0cf4a',owl:'#4fdc7a'},LEAFC={kush:'#2f7a3a',haze:'#4ea53a',owl:'#2c8a50'};
const budCol=(s,fl,ready,dry)=>{const c=new THREE.Color('#8cc456').lerp(new THREE.Color(TINT[s]),.15+.4*fl);if(ready)c.lerp(new THREE.Color('#f4fff0'),.15);if(dry)c.lerp(new THREE.Color('#8a8a50'),.45).multiplyScalar(.85);return c};
function cola(pb,p,len,size,fl,s,r,leafC,o={}){const nb=Math.max(3,Math.round(len/size*2.2)),dir=o.down?-1:1;const bc=budCol(s,fl,o.ready,o.dry);
 const pc=new THREE.Color('#f4f0e2').lerp(new THREE.Color(o.ready||o.dry?'#c45a22':'#e8862e'),o.ready||o.dry?1:Math.max(0,fl-.35)*1.5);
 for(let i=0;i<nb;i++){const t=i/(nb-1),a=r()*6.28,rad=size*.5*(1-t*.6)*r();const q=V(p.x+Math.cos(a)*rad,p.y+dir*t*len,p.z+Math.sin(a)*rad);const sz=size*(.6+.45*r())*(1-.4*t);
  blobAt(pb,q,sz,sz*1.3,sz,bc.clone().offsetHSL(0,0,(r()-.5)*.08),BUD,r()*3);
  if(fl>.05)for(let k=0;k<2+(o.ready?1:0);k++){const d=V(r()-.5,r()*.8*dir+.1,r()-.5).normalize();const b0=q.clone().addScaledVector(d,sz*.8);seg(pb,b0,b0.clone().addScaledVector(d,sz*(.7+r()*.7)),sz*.09,pc,CYL3)}
  if(i%3==1&&leafC)fan(pb,q,a,.7*dir,sz*2.4,leafC,FAN1)}}
function plantModel(p,id){const g=new THREE.Group();if(!p)return g;const r=mulberry(id*7919+13),pb=new PB(),st=stage(p),hb=(p.health??100)/100;const YEL=new THREE.Color('#d8c24a');
 const lc=(x=0)=>new THREE.Color(LEAFC[p.s]).offsetHSL((r()-.5)*.03,0,(r()-.5)*.07).lerp(YEL,Math.min(1,(1-hb)*.8+x));const stemC=p.s=='kush'?'#6a7a3a':'#6f9a3c';
 if(st=='dead'){const top=V(.03,.28,0);seg(pb,V(0,0,0),top,.012,'#6a4a2a');for(let i=0;i<5;i++)fan(pb,V(0,.08+i*.045,0),i*1.3,-.7,.13,new THREE.Color('#7a5a32').offsetHSL(0,0,(r()-.5)*.1),FAN5);g.add(pb.mesh());return g}
 if(st=='seedling'){const f=p.age/60,H=.03+.09*f;seg(pb,V(0,0,0),V(0,H,0),.005+.003*f,'#9acb5a');for(const s of[0,Math.PI])blobAt(pb,V(Math.cos(s)*.02,H,-Math.sin(s)*.02),.028,.004,.014,lc(),ROUND,0);
  for(const s of[0,Math.PI])fan(pb,V(0,H,0),s,.45,.03+.08*f,lc(),FAN3);if(f>.6)for(const s of[Math.PI/2,-Math.PI/2])fan(pb,V(0,H+.012,0),s,.6,.05*f,lc(),FAN5);g.add(pb.mesh());return g}
 const gv=Math.min(1,(p.age-60)/140),fl=Math.max(0,Math.min(1,(p.age-200)/(READY-200))),ready=st=='ready',sc=.88+r()*.24;
 const H=(.2+.5*gv+.32*fl)*sc,N=3+Math.round(gv*4),lean=V((r()-.5)*.05,0,(r()-.5)*.05);let prev=V(0,0,0);
 for(let i=1;i<=N+1;i++){const t=i/(N+1),pt=V(lean.x*t*t,H*t,lean.z*t*t);seg(pb,prev,pt,(.016+.012*gv)*(1-t*.6),stemC);prev=pt}
 for(let i=1;i<=N;i++){const t=i/(N+.6),node=V(lean.x*t*t,H*t,lean.z*t*t),ph=i*Math.PI/2+(r()-.5)*.4;
  for(const side of[0,Math.PI]){const yaw=ph+side,dir=V(Math.cos(yaw),0,-Math.sin(yaw));const sz=(.15+.15*gv)*(1.15-.5*t)*(.85+r()*.3)*sc;
   const yel=ready&&r()<.45?.45:fl>.6&&i<2?.3:0;const pe=node.clone().addScaledVector(dir,sz*.35).add(V(0,sz*.12,0));seg(pb,node,pe,.004,stemC);
   fan(pb,pe,yaw,.5-.55*(1-t)+(r()-.5)*.2,sz,lc(yel),gv>.25?FAN7:FAN5,(r()-.5)*.3);
   if(i<N&&gv>.35){const bl=(.08+.22*gv)*(1-t*.7)*sc,bdir=V(Math.cos(yaw+.5)*.55,1,-Math.sin(yaw+.5)*.55).normalize(),be=node.clone().addScaledVector(bdir,bl);seg(pb,node,be,.007,stemC);
    fan(pb,be,yaw+.5,.75,sz*.55,lc(yel),FAN5);if(fl>0)cola(pb,be,.03+.09*fl,.012+.022*fl,fl,p.s,r,lc(),{ready})}}}
 const top=V(lean.x,H,lean.z);for(let k=0;k<3;k++)fan(pb,top.clone().add(V(0,.01,0)),k*2.1,1.0,(.06+.05*gv)*sc,lc(),FAN5);
 if(fl>0)cola(pb,top.clone().add(V(0,-.06*fl,0)),.06+.2*fl,.016+.03*fl,fl,p.s,r,lc(),{ready});
 const me=pb.mesh();g.add(me);g.userData.sway=r()*6;return g}
// ---------- world ----------
const WALLH=3;let WALLS=[];const roomG=new THREE.Group(),room2G=new THREE.Group();scene.add(roomG,room2G);
const woodM=mat('#9a6a40',{map:plankTex('#a8743f',[1,1])}),darkWood=mat('#7a4a2a'),trimM=mat('#6a3e22'),roofM=mat('#fff',{map:shingleT});
function wallMat(len){const t=wallT.clone();t.needsUpdate=true;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(Math.max(1,len/2.4),1);return mat('#fff',{map:t,roughness:.85})}
function wall(g,x0,x1,z0,z1,list){const w=x1-x0,d=z1-z0;g.add(at(box(w,WALLH,d,wallMat(Math.max(w,d))),(x0+x1)/2,WALLH/2,(z0+z1)/2));g.add(at(box(w+.03,.16,d+.03,trimM),(x0+x1)/2,.08,(z0+z1)/2));list.push({x0,x1,z0,z1})}
function aoStrip(g,cx,cz,len,th,w=.55){const m=new THREE.Mesh(new THREE.PlaneGeometry(len,w).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:edgeT,transparent:true,depthWrite:false}));const o=new THREE.Group();o.add(m);m.position.z=0;o.position.set(cx,.008,cz);o.rotation.y=th;g.add(o)}
const W1=[],W1b=[],W2=[];let grass;
function buildWorld(){
 const gg=new THREE.PlaneGeometry(200,200,70,70).toNonIndexed();gg.rotateX(-Math.PI/2);const gp=gg.attributes.position,gc=[],c=new THREE.Color();
 for(let k=0;k<gp.count;k++){const x=gp.getX(k),z=gp.getZ(k);const d=Math.max(0,Math.hypot(x,z)-25);gp.setY(k,-.03+Math.sin(x*.3+z*.2)*.03+d*d*.004)}
 gg.computeVertexNormals();for(let k=0;k<gp.count;k+=3){c.set('#78c850').offsetHSL((rnd()-.5)*.04,0,(rnd()-.5)*.08);for(let j=0;j<3;j++)gc.push(c.r,c.g,c.b)}
 gg.setAttribute('color',new THREE.Float32BufferAttribute(gc,3));const gm=new THREE.Mesh(gg,mat('#fff',{vertexColors:true,flatShading:true}));gm.receiveShadow=true;scene.add(gm);
 const path=new THREE.Mesh(new THREE.PlaneGeometry(2.2,6.4).rotateX(-Math.PI/2),mat('#fff',{map:gravelT}));path.position.set(0,.006,8.4);path.receiveShadow=true;scene.add(path);
 const padT=tex(256,256,(x,w,h)=>{x.fillStyle='#b8b4ac';x.fillRect(0,0,w,h);speck(x,w,h,800,['#888','#ddd'],3);x.strokeStyle='#f0b030';x.lineWidth=18;x.setLineDash([24,18]);x.strokeRect(12,12,w-24,h-24);x.fillStyle='#555';x.font='bold 34px sans-serif';x.textAlign='center';x.fillText('DELIVERY',w/2,h/2+12)});
 scene.add(at(sh(new THREE.Mesh(new THREE.BoxGeometry(2.2,.06,1.9),mat('#fff',{map:padT}))),2.4,.02,7.2));
 // floors
 const fl=(g,x,w)=>{const t=floorT.clone();t.needsUpdate=true;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(w/2,5);const f=new THREE.Mesh(new THREE.BoxGeometry(w,.1,10.4),mat('#fff',{map:t,roughness:.7}));f.position.set(x,-.045,0);f.receiveShadow=true;g.add(f)};fl(roomG,0,8.4);fl(room2G,7.6,7);
 wall(roomG,-4.3,-4.1,-5.2,5.2,W1);wall(roomG,-4.3,4.3,-5.2,-5,W1);wall(roomG,-4.3,-1,5,5.2,W1);wall(roomG,1,4.3,5,5.2,W1);roomG.add(at(box(2,.8,.2,wallMat(2)),0,2.6,5.1));
 const rw=new THREE.Group();wall(rw,4.1,4.3,-5.2,5.2,W1b);aoStrip(rw,3.85,0,10,-Math.PI/2);roomG.add(rw);roomG.userData.rw=rw;
 aoStrip(roomG,0,-4.75,8.2,0);aoStrip(roomG,-3.85,0,10,Math.PI/2);aoStrip(roomG,-2.6,4.75,3.2,Math.PI);aoStrip(roomG,2.6,4.75,3.2,Math.PI);
 wall(room2G,4.1,4.3,-5.2,-3.6,W2);wall(room2G,4.1,4.3,3.6,5.2,W2);room2G.add(at(box(.2,.8,7.2,wallMat(7)),4.2,2.6,0));
 wall(room2G,4.3,11.2,-5.2,-5,W2);wall(room2G,4.3,11.2,5,5.2,W2);wall(room2G,11,11.2,-5.2,5.2,W2);aoStrip(room2G,7.6,-4.75,6.8,0);aoStrip(room2G,10.75,0,10,-Math.PI/2);aoStrip(room2G,7.6,4.75,6.8,Math.PI);room2G.visible=false;
 const roof=(g,x,w)=>{for(const s of[-1,1]){const r=box(w,.15,5.9,roofM);r.position.set(x,3.55,s*2.55);r.rotation.x=s*.32;g.add(r)}const ceil=box(w-.2,.08,10.2,mat('#fff',{map:wallT}));ceil.position.set(x,3.02,0);ceil.castShadow=false;g.add(ceil);
  for(let i=-2;i<=2;i++)g.add(at(box(w-.3,.16,.16,darkWood),x,2.9,i*2.2))};roof(roomG,0,8.8);roof(room2G,7.6,7.4);
 roomG.add(at(box(.16,2.2,.32,trimM),-1,1.1,5.1),at(box(.16,2.2,.32,trimM),1,1.1,5.1),at(box(2.16,.16,.32,trimM),0,2.2,5.1));
 // barn doors swung open
 const doorT=plankTex('#8a5a32',[1,1],true);const leaf=()=>{const d=new THREE.Group();d.add(at(box(.98,2.1,.06,mat('#fff',{map:doorT})),.49,1.05,0));for(const y of[.35,1.75])d.add(at(box(.98,.12,.09,darkWood),.49,y,0));const br=box(1.15,.1,.08,darkWood);br.position.set(.49,1.05,0);br.rotation.z=.98;d.add(br);d.add(at(cyl(.025,.025,.2,'#222',6),.85,1.05,.08));return d};
 const dl=leaf();dl.position.set(-1,0,5.25);dl.rotation.y=-Math.PI/2+.25;const dr=leaf();dr.scale.x=-1;dr.position.set(1,0,5.25);dr.rotation.y=Math.PI/2-.25;scene.add(dl,dr);W1.push({x0:-1.3,x1:-.95,z0:5.2,z1:6.2},{x0:.95,x1:1.3,z0:5.2,z1:6.2});
 const winM=mat('#d8f0ff',{emissive:'#cfeaff',emissiveIntensity:.7});roomG.add(at(box(.06,1,1.6,winM),-4.12,1.7,2.5),at(box(.12,1.2,.1,trimM),-4.06,1.7,1.67),at(box(.12,1.2,.1,trimM),-4.06,1.7,3.33),at(box(.12,.1,1.75,trimM),-4.06,2.28,2.5),at(box(.12,.1,1.75,trimM),-4.06,1.12,2.5),at(box(.1,.06,1.6,trimM),-4.06,1.7,2.5));
 // desk
 const desk=new THREE.Group();desk.add(at(box(.9,.07,1.7,woodM),0,.9,0));for(const a of[-1,1])for(const b of[-1,1])desk.add(at(box(.07,.9,.07,darkWood),a*.38,.45,b*.78));desk.add(at(box(.8,.05,1.6,darkWood),0,.25,0));
 const kbT=lbl('kb',(x,w,h)=>{x.fillStyle='#2a3038';x.fillRect(0,0,w,h);x.fillStyle='#4a525c';for(let r=0;r<4;r++)for(let c=0;c<12;c++)x.fillRect(10+c*20,12+r*22,16,18);x.fillRect(80,100,90,30)},256,140);
 const scrT=lbl('scr',(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#1f6a3a');g.addColorStop(1,'#0e2a1a');x.fillStyle=g;x.fillRect(0,0,w,h);leafIcon(x,w/2,h*.42,90,'#7cff6a');x.fillStyle='#e8ffe0';x.font='bold 30px sans-serif';x.textAlign='center';x.fillText('BUD TOGETHER',w/2,h*.78);x.font='16px sans-serif';x.fillText('Shop · Contracts · Upgrades',w/2,h*.9)},256,160);
 const lap=new THREE.Group();lap.add(at(box(.36,.025,.5,'#c9ccd2',{metalness:.5,roughness:.35}),0,.947,0));const kb=new THREE.Mesh(new THREE.PlaneGeometry(.44,.22).rotateX(-Math.PI/2).rotateY(Math.PI/2),mat('#fff',{map:kbT}));kb.position.set(-.04,.961,0);lap.add(kb);
 const lid=new THREE.Group();lid.add(at(box(.02,.34,.5,'#c9ccd2',{metalness:.5,roughness:.35}),0,.17,0));const scr=new THREE.Mesh(new THREE.PlaneGeometry(.46,.3).rotateY(Math.PI/2),new THREE.MeshBasicMaterial({map:scrT}));scr.position.set(.012,.17,0);lid.add(scr);lid.position.set(-.17,.96,0);lid.rotation.z=.18;lap.add(lid);desk.add(lap);
 desk.add(at(cyl(.045,.04,.1,'#e8e2d4',12),.1,.98,.55),at(new THREE.Mesh(new THREE.TorusGeometry(.03,.008,6,10),mat('#e8e2d4')),.1,.98,.6));
 const lampL=new THREE.PointLight('#ffcf8a',2.2,3,1.6);lampL.position.set(-.1,1.35,-.65);desk.add(lampL,at(cyl(.07,.08,.03,'#2a2a2a'),-.2,.95,-.65),at(cyl(.01,.01,.4,'#2a2a2a',6),-.2,1.15,-.65),at(new THREE.Mesh(new THREE.ConeGeometry(.1,.12,12,1,true),mat('#3a7a4a',{side:THREE.DoubleSide})),-.15,1.38,-.65));
 const chair=new THREE.Group();chair.add(at(box(.48,.08,.48,'#3a6a9a'),0,.5,0),at(box(.08,.55,.48,'#3a6a9a'),.24,.8,0),at(cyl(.035,.035,.45,'#333',6),0,.25,0),at(cyl(.25,.25,.03,'#333',5),0,.03,0));chair.position.set(.8,0,.1);chair.rotation.y=.3;desk.add(chair);
 desk.position.set(-3.6,0,-2);roomG.add(desk);W1.push({x0:-4.1,x1:-3.1,z0:-2.9,z1:-1.1});
 const rugT=tex(256,256,(x,w,h)=>{x.fillStyle='#7a3a3a';x.fillRect(0,0,w,h);x.strokeStyle='#e8c87a';x.lineWidth=10;x.strokeRect(14,14,w-28,h-28);x.lineWidth=4;x.strokeRect(34,34,w-68,h-68);leafIcon(x,w/2,h/2+30,80,'#e8c87a')});
 roomG.add(at(new THREE.Mesh(new THREE.PlaneGeometry(1.6,2.2).rotateX(-Math.PI/2),mat('#fff',{map:rugT})),-2.5,.012,-2));roomG.children.at(-1).receiveShadow=true;
 const postT=tex(256,360,(x,w,h)=>{x.fillStyle='#1e2a22';x.fillRect(0,0,w,h);leafIcon(x,w/2,h*.45,150,'#6ad84a');x.fillStyle='#ffcf3a';x.font='bold 34px sans-serif';x.textAlign='center';x.fillText('GROW',w/2,60);x.fillText('TOGETHER',w/2,h-30)});
 const post=new THREE.Mesh(new THREE.PlaneGeometry(.7,1).rotateY(Math.PI/2),mat('#fff',{map:postT}));post.position.set(-4.08,1.8,-.2);roomG.add(post);
 const shelf=new THREE.Group();for(let i=0;i<3;i++)shelf.add(at(box(1.8,.05,.45,woodM),0,.45+i*.6,0));for(const a of[-1,1])shelf.add(at(box(.06,1.8,.45,darkWood),a*.9,.9,0));
 const glassM=mat('#e0f6ff',{transparent:true,opacity:.35,roughness:.05,metalness:.1});const sj=['kush','haze','owl'];for(let i=0;i<5;i++){const s=sj[i%3];shelf.add(at(cyl(.07,.07,.17,glassM,12),-.6+i*.3,1.14,0),at(cyl(.072,.072,.04,'#222',12),-.6+i*.3,1.24,0),at(cyl(.05,.05,.1,mat(budCol(s,1,1).getStyle()),8),-.6+i*.3,1.1,0))}
 shelf.add(at(box(.5,.35,.35,'#c49a6a'),-.4,.65,0),at(box(.3,.25,.3,'#d4aa7a'),.3,.6,0),at(cyl(.12,.12,.3,'#3a9bd8',10),.6,1.78,0));
 shelf.position.set(3.75,0,1.5);shelf.rotation.y=-Math.PI/2;roomG.add(shelf);W1.push({x0:3.45,x1:4.1,z0:.6,z1:2.4});
 const bulb=(g,x,z,shadow)=>{g.add(at(new THREE.Mesh(new THREE.SphereGeometry(.09,10,8),new THREE.MeshBasicMaterial({color:'#fff3c8'})),x,2.5,z),at(cyl(.008,.008,.4,'#222',4),x,2.8,z));const sd=new THREE.Mesh(new THREE.ConeGeometry(.28,.18,16,1,true),mat('#2f5a3a',{side:THREE.DoubleSide,metalness:.4,roughness:.4}));sd.position.set(x,2.6,z);g.add(sd);
  const l=new THREE.PointLight('#ffd49a',7,13,1.3);l.position.set(x,2.4,z);if(shadow){l.castShadow=true;l.shadow.mapSize.set(1024,1024);l.shadow.bias=-.003;l.shadow.radius=4}g.add(l)};bulb(roomG,0,.5,HQ);bulb(room2G,7.6,0,false);
 // drop box
 const dbT=tex(256,128,(x,w,h)=>{x.fillStyle='#2f7a3e';x.fillRect(0,0,w,h);leafIcon(x,40,70,60,'#cfffbf');x.fillStyle='#fff';x.font='bold 30px sans-serif';x.fillText('DISPENSARY',75,55);x.font='bold 26px sans-serif';x.fillText('DROP BOX',75,95)});
 const db=new THREE.Group();db.add(at(box(.8,1,.6,'#2f7a3e',{metalness:.4,roughness:.5}),0,.5,0),at(box(.86,.08,.66,'#245e30',{metalness:.4,roughness:.5}),0,1.03,0),at(box(.5,.05,.03,'#111'),0,.85,.31));
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(.8,.4),mat('#fff',{map:dbT}));sign.position.set(0,1.45,0);db.add(sign,at(cyl(.025,.025,.4,'#333',6),0,1.2,-.02),at(new THREE.Mesh(new THREE.PlaneGeometry(.6,.3),mat('#fff',{map:dbT})),0,.55,.302));db.add(blob(.6));db.position.set(-2.8,0,7.6);scene.add(db);
 const mb=new THREE.Group();mb.add(at(cyl(.04,.04,1.1,'#7a5a3a',6),0,.55,0),at(box(.25,.22,.45,'#c8402a',{metalness:.4,roughness:.4}),0,1.15,0),at(box(.04,.15,.04,'#ffcf3a'),.14,1.25,.1));mb.position.set(1.6,0,12.4);scene.add(mb);
 // nature
 const tr=mat('#7a5034'),lf=[mat('#3fae4a',{flatShading:true}),mat('#5cc85a',{flatShading:true}),mat('#2f9a5a',{flatShading:true})];
 const tree=(x,z,s)=>{const t=new THREE.Group();t.add(at(cyl(.14,.22,1.6,tr,7),0,.8,0));for(let k=0;k<4;k++){const cn=sh(new THREE.Mesh(new THREE.IcosahedronGeometry(1-k*.15,1),lf[k%3]));cn.position.set((rnd()-.5)*.8,1.9+k*.55,(rnd()-.5)*.8);t.add(cn)}t.position.set(x,0,z);t.scale.setScalar(s);t.rotation.y=rnd()*6;scene.add(t)};
 for(let k=0;k<45;k++){const a=rnd()*6.28,r=16+rnd()*40;tree(Math.cos(a)*r,Math.sin(a)*r,.8+rnd()*.9)}
 const fenceM=mat('#f1e3c8');for(let x=-13;x<=13;x+=1.6){scene.add(at(box(.12,1,.12,fenceM),x,.5,13.2),at(box(1.6,.1,.06,fenceM),x+.8,.75,13.2),at(box(1.6,.1,.06,fenceM),x+.8,.4,13.2))}
 for(let k=0;k<26;k++){const b=sh(new THREE.Mesh(new THREE.IcosahedronGeometry(.35+rnd()*.3,1),lf[k%3]));b.position.set((rnd()-.5)*26,.15,-7+rnd()*19);if(Math.abs(b.position.x)<5.5&&b.position.z<6.5&&b.position.z>-6||Math.abs(b.position.x)<2&&b.position.z>5)continue;scene.add(b)}
 // grass tufts
 const bg=[];for(let i=0;i<3;i++){const g=new THREE.BufferGeometry();const a=i*2.1,w=.035;g.setAttribute('position',new THREE.Float32BufferAttribute([-Math.cos(a)*w,0,Math.sin(a)*w,Math.cos(a)*w,0,-Math.sin(a)*w,Math.cos(a+.5)*.03,.28,-Math.sin(a+.5)*.03],3));g.setAttribute('color',new THREE.Float32BufferAttribute([.35,.6,.25,.35,.6,.25,.75,1,.5],3));g.computeVertexNormals();bg.push(g)}
 const blade=mergeGeometries(bg);const N=[500,1500,3000][settings.qual];grass=new THREE.InstancedMesh(blade,new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.9}),N);grass.receiveShadow=true;
 const M=new THREE.Matrix4(),col=new THREE.Color();let n=0;while(n<N){const x=(rnd()-.5)*50,z=(rnd()-.5)*50;if(x>-4.8&&x<11.8&&z>-5.8&&z<5.8||Math.abs(x)<1.3&&z>5&&z<11.8||x>1.2&&x<3.6&&z>6.1&&z<8.3)continue;
  _o.position.set(x,0,z);_o.rotation.set(0,rnd()*6,0);_o.scale.setScalar(.6+rnd()*.9);_o.updateMatrix();grass.setMatrixAt(n,_o.matrix);grass.setColorAt(n,col.setHSL(.27+rnd()*.05,.5,.45+rnd()*.15));n++}scene.add(grass);
 const fc=['#ff7aa8','#ffe066','#ffffff','#b48aff'];for(let k=0;k<60;k++){const x=(rnd()-.5)*24,z=-8+rnd()*20;if(x>-4.8&&x<11.8&&z>-5.8&&z<5.8||Math.abs(x)<1.4&&z>5)continue;scene.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(.05,0),mat(fc[k%4],{emissive:fc[k%4],emissiveIntensity:.15})),x,.2,z),at(cyl(.006,.006,.2,'#3a8a3a',3),x,.1,z))}
}
buildWorld();
const LAPTOP=new THREE.Vector3(-3.6,1.05,-2),DROP=new THREE.Vector3(-2.8,.9,7.6);
function setRoom(n){room2G.visible=n>1;roomG.userData.rw.visible=n<2;WALLS=[...W1,...(n<2?W1b:[]),...(n>1?W2:[])]}setRoom(1);
// ---------- props ----------
const POTG=new THREE.LatheGeometry([[0,0],[.16,0],[.172,.015],[.205,.29],[.232,.296],[.244,.33],[.244,.37],[.232,.378],[.212,.372],[.2,.33],[.168,.06],[0,.06]].map(([x,y])=>new THREE.Vector2(x,y)),22);
const terraM=mat('#d06c3c',{map:terraT,roughness:.92}),soilDry=mat('#a07a56',{map:soilT,roughness:1}),soilWet=mat('#5a3e2a',{map:soilT,roughness:.55});
const SOILG=(()=>{const g=new THREE.CircleGeometry(.198,20).rotateX(-Math.PI/2);const P=g.attributes.position;for(let i=0;i<P.count;i++){const d=Math.hypot(P.getX(i),P.getZ(i));P.setY(i,(1-d/.2)*.02+(i%3)*.002)}g.computeVertexNormals();return g})();
const glass=mat('#e0f6ff',{transparent:true,opacity:.35,roughness:.05,metalness:.1});
function bagGeo(){const g=new THREE.BoxGeometry(.5,.7,.26,4,6,3);const P=g.attributes.position;for(let i=0;i<P.count;i++){const y=P.getY(i)/.35,x=P.getX(i)/.25;let z=P.getZ(i)*(1.1-.35*y*y)*(1-.15*x*x);if(y>.85)z*=.25;P.setZ(i,z);P.setX(i,P.getX(i)*(1-.05*y))}g.computeVertexNormals();return g}const BAGG=bagGeo();
const soilBagT=lbl('soilbag',(x,w,h)=>{x.fillStyle='#6b4628';x.fillRect(0,0,w,h);speck(x,w,h,300,['#000','#8a6a48'],3);x.fillStyle='#f1e6cc';x.beginPath();x.roundRect(30,60,w-60,140,16);x.fill();leafIcon(x,w/2,120,70,'#3a9a3a');x.fillStyle='#4a2e18';x.font='bold 30px sans-serif';x.textAlign='center';x.fillText('GROW SOIL',w/2,185);x.fillStyle='#e8c040';x.fillRect(0,215,w,18)});
const seedT=s=>lbl('seed'+s,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,SCOL[s]);g.addColorStop(1,'#1a1a1a');x.fillStyle=g;x.fillRect(0,0,w,h);leafIcon(x,w/2,h*.42,100,'#fff');x.fillStyle='#fff';x.font='bold 26px sans-serif';x.textAlign='center';x.fillText(STRAINS[s].name.toUpperCase(),w/2,h*.78);x.font='18px sans-serif';x.fillText('FEMINIZED SEEDS',w/2,h*.9)});
const nutrT=lbl('nutr',(x,w,h)=>{x.fillStyle='#ff7a2a';x.fillRect(0,0,w,h);x.fillStyle='#fff';x.fillRect(0,h*.3,w,h*.4);x.fillStyle='#ff7a2a';x.font='bold 40px sans-serif';x.textAlign='center';for(const o of[.25,.75])x.fillText('BLOOM+',w*o,h*.6)},256,128);
const ledT=lbl('led',(x,w,h)=>{x.fillStyle='#202020';x.fillRect(0,0,w,h);for(let i=0;i<16;i++)for(let j=0;j<9;j++){x.fillStyle=(i+j)%4==0?'#ff6ad0':(i*j)%5==0?'#ffb0ff':'#fff4f8';x.beginPath();x.arc(10+i*15.5,10+j*12.5,4,0,7);x.fill()}},256,128);
const cardT=lbl('card',(x,w,h)=>{x.fillStyle='#c8a070';x.fillRect(0,0,w,h);speck(x,w,h,400,['#a07a50','#e0c090'],3);x.fillStyle='#4a3a2a';x.font='bold 40px sans-serif';x.textAlign='center';x.fillText('JARS',w/2,h*.55);x.strokeStyle='#4a3a2a';x.lineWidth=4;x.strokeRect(50,h*.25,w-100,h*.45)},256,128);
const lcdT=lbl('lcd',(x,w,h)=>{x.fillStyle='#0e2a14';x.fillRect(0,0,w,h);x.fillStyle='#7cff6a';x.font='bold 46px monospace';x.textAlign='center';x.fillText('0.00 g',w/2,h*.68)},256,80);
const jarLbl=(s,g)=>lbl('jar'+s+g,(x,w,h)=>{x.fillStyle='#fff8ea';x.fillRect(0,0,w,h);x.fillStyle=SCOL[s];x.fillRect(0,0,w,26);x.fillRect(0,h-26,w,26);x.fillStyle='#222';x.font='bold 30px sans-serif';x.textAlign='center';x.fillText(STRAINS[s].name,w/2,h*.48);x.font='bold 40px sans-serif';x.fillText(g+'g',w/2,h*.8)},256,128);
const JARG=new THREE.LatheGeometry([[0,0],[.09,0],[.1,.02],[.1,.17],[.085,.19],[.085,.21],[0,.21]].map(([x,y])=>new THREE.Vector2(x,y)),18);
function budBranch(s,dry,n=1,seed=1){const pb=new PB(),r=mulberry(seed);for(let k=0;k<n;k++){const o=V((k-(n-1)/2)*.07,0,0);seg(pb,o.clone().add(V(0,.06,0)),o.clone().add(V(0,-.12,0)),.006,dry?'#8a8a50':'#6f9a3c');cola(pb,o.clone().add(V(0,-.02,0)),.13,.025,1,s,r,dry?'#8a8a3a':'#3f8a3a',{down:1,dry})}return pb.mesh()}
function prop(e){const g=new THREE.Group(),t=e.type,d=e.data||{};
 if(t=='pot'){const p=sh(new THREE.Mesh(POTG,terraM));g.add(p,at(cyl(.2,.18,.025,'#a8552e',18),0,.012,0),blob(.32));if(d.soil){const s=new THREE.Mesh(SOILG,d.plant&&d.plant.water>45?soilWet:soilDry);s.position.y=.3;s.receiveShadow=true;g.add(s)}
  if(d.plant){const pl=plantModel(d.plant,e.id);pl.position.y=.31;g.add(pl);g.userData.plant=pl}}
 else if(t=='soil'){const b=sh(new THREE.Mesh(BAGG,mat('#fff',{map:soilBagT,roughness:.7})));b.position.y=.35;b.rotation.z=.04;g.add(b,blob(.35))}
 else if(t.startsWith('seed_')){const s=t.slice(5),pk=box(.2,.28,.02,mat('#fff',{map:seedT(s),roughness:.4}));pk.position.y=.14;pk.rotation.x=-.12;g.add(pk,at(box(.18,.02,.08,'#666'),0,.01,.04),blob(.15))}
 else if(t=='water'){const m=mat('#3a9bd8',{metalness:.55,roughness:.35});g.add(at(cyl(.15,.17,.3,m,16),0,.15,0),at(cyl(.155,.155,.02,'#2a7ab5',16),0,.3,0));const sp=cyl(.018,.035,.4,m,8);sp.position.set(.22,.26,0);sp.rotation.z=-.95;g.add(sp,at(cyl(.045,.02,.05,m,10),.38,.39,0));g.children.at(-1).rotation.z=-.95;
  const hd=new THREE.Mesh(new THREE.TorusGeometry(.11,.02,8,16,Math.PI),m);hd.position.set(-.04,.3,0);hd.rotation.z=.2;g.add(hd,blob(.25))}
 else if(t=='nutr'){g.add(sh(new THREE.Mesh(new THREE.LatheGeometry([[0,0],[.09,0],[.1,.02],[.1,.22],[.06,.28],[.04,.29],[0,.29]].map(([x,y])=>new THREE.Vector2(x,y)),16),mat('#fff',{map:nutrT,roughness:.4}))),at(cyl(.045,.045,.06,'#222',10),0,.31,0),blob(.15))}
 else if(t=='light'){const blk=mat('#2a2a2e',{metalness:.6,roughness:.4});g.add(at(cyl(.22,.25,.04,blk,16),0,.02,0),at(cyl(.02,.02,2.3,blk,8),0,1.17,0),at(box(.5,.04,.04,blk),.25,2.3,0));
  const pnl=new THREE.Group();pnl.add(at(box(.9,.06,.55,blk),0,0,0),at(new THREE.Mesh(new THREE.PlaneGeometry(.84,.5).rotateX(Math.PI/2),new THREE.MeshStandardMaterial({map:ledT,emissiveMap:ledT,emissive:'#fff',emissiveIntensity:2.2})),0,-.032,0));for(let i=0;i<8;i++)pnl.add(at(box(.02,.06,.53,blk),-.4+i*.115,.06,0));
  pnl.position.set(.5,2.25,0);g.add(pnl,blob(.3))}
 else if(t=='rack'){const w=woodM;for(const a of[-1,1]){g.add(at(box(.06,1.75,.06,w),a*.65,.875,0),at(box(.06,.06,.7,w),a*.65,.03,0))}g.add(at(box(1.36,.06,.06,w),0,1.75,0));for(let i=0;i<2;i++)g.add(at(cyl(.006,.006,1.3,'#eee',4),0,1.6-i*.4,0));g.children.slice(-2).forEach(c=>c.rotation.z=Math.PI/2);
  (d.slots||[]).forEach((s,i)=>{const b=budBranch(s.s,s.t<=0,2,e.id*10+i);b.position.set(-.45+i*.3,1.58,0);g.add(b,at(cyl(.003,.003,.08,'#eee',3),-.45+i*.3,1.63,0))});g.add(blob(.7))}
 else if(t=='jars'){const b=box(.46,.3,.36,mat('#fff',{map:cardT}));b.position.y=.15;g.add(b);for(const s of[-1,1]){const f=box(.46,.01,.16,'#c8a070');f.position.set(0,.3,s*.25);f.rotation.x=s*.6;g.add(f)}for(let i=0;i<6;i++)g.add(at(cyl(.065,.065,.03,'#222',12),-.15+(i%3)*.15,.31,i<3?-.08:.08));g.add(blob(.35))}
 else if(t=='scale'){const st=mat('#d8dce2',{metalness:.7,roughness:.3});g.add(at(box(.5,.08,.4,'#2a2e34',{roughness:.5}),0,.04,0),at(cyl(.17,.17,.015,st,24),0,.09,-.04),at(new THREE.Mesh(new THREE.PlaneGeometry(.2,.06).rotateX(-Math.PI/2+.0),new THREE.MeshBasicMaterial({map:lcdT})),0,.081,.15),blob(.35))}
 else if(t=='wetbud'||t=='drybud'){const b=budBranch(d.s,t=='drybud',2,e.id);b.rotation.x=Math.PI;b.position.y=.08;g.add(b)}
 else if(t=='packed'){g.add(new THREE.Mesh(JARG,glass),at(cyl(.092,.092,.04,'#1a1a1a',16),0,.225,0));const lb=new THREE.Mesh(new THREE.CylinderGeometry(.101,.101,.08,18,1,true,-.9,1.8),mat('#fff',{map:jarLbl(d.s,d.g)}));lb.position.y=.1;g.add(lb);
  const pb=new PB(),r=mulberry(e.id);for(let i=0;i<7;i++)blobAt(pb,V((r()-.5)*.1,.03+r()*.1,(r()-.5)*.1),.03,.035,.03,budCol(d.s,1,0,1),BUD,r()*3);g.add(pb.mesh(),blob(.15))}
 else g.add(at(box(.3,.3,.3,'#f0f'),0,.15,0));return g}
const NAME=t=>t=='wetbud'?'Wet Bud':t=='drybud'?'Dried Bud':t=='packed'?'Packed Jar':SHOP[t]?.n||t;
const ekey=e=>{const p=e.data.plant;return e.type+'|'+(e.data.soil||0)+'|'+(p?stage(p)+(p.age/12|0)+'|'+Math.round(p.health/20)+(p.water>45):'')+'|'+JSON.stringify(e.data.slots?.map(s=>s.t>0))+'|'+(e.data.g||'')}
// ---------- input glyphs ----------
let padMode=false;const GP={use:['A','pA'],drop:['B','pB'],alt:['X','pX'],phone:['Y','pY'],cycle:['LB/RB','pL'],pause:['☰','pL']},GK={use:'E',drop:'G',alt:'F',phone:'Tab',cycle:'Q',pause:'Esc'};
const G=a=>padMode?`<span class="g ${GP[a][1]}">${GP[a][0]}</span>`:`<span class="g">${GK[a]}</span>`;
function renderHelp(){$('help').innerHTML=`${padMode?'L-stick move · R-stick look':'WASD move · Mouse look'} · ${G('use')} use · ${G('alt')} use held only · ${G('drop')} drop · ${G('cycle')} swap held · ${G('phone')} contracts · ${G('pause')} pause`}
function setMode(p){if(padMode===p)return;padMode=p;document.body.classList.toggle('pad',p);renderHelp();const r=uiRoot();if(p&&r&&r.id!='splash'&&!fEl)setFocus(defFocus(r));if(lapOpen)renderLap(true)}renderHelp();
// ---------- input ----------
const keys={};let yaw=Math.PI,pitch=-.1,locked=false;
const free=()=>game&&!paused&&!lapOpen&&!$('menu').classList.contains('on');
addEventListener('keydown',e=>{setMode(false);if(e.code=='Tab'&&game)e.preventDefault();keys[e.code]=true;if(e.repeat)return;
 if(e.code=='Escape'&&game&&!$('menu').classList.contains('on')){if(lapOpen)closeLap();else setPause(!paused);return}
 if(e.code=='Tab'&&game&&!paused&&!$('menu').classList.contains('on')){lapOpen?closeLap():openLap('contracts');return}
 if(free()){if(e.code=='KeyE')interact();if(e.code=='KeyF')interact(true);if(e.code=='KeyG')drop();if(e.code=='KeyQ')cycle(1)}});
addEventListener('keyup',e=>keys[e.code]=false);addEventListener('blur',()=>{for(const k in keys)keys[k]=false});
addEventListener('wheel',e=>{if(free())cycle(Math.sign(e.deltaY))});
renderer.domElement.addEventListener('mousedown',e=>{setMode(false);if(free()){if(!locked)renderer.domElement.requestPointerLock?.();else if(e.button==0)interact();else if(e.button==2)drop()}});addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('pointerlockchange',()=>locked=document.pointerLockElement==renderer.domElement);
addEventListener('mousemove',e=>{if(Math.abs(e.movementX)+Math.abs(e.movementY)>3)setMode(false);if(!locked||!free())return;const s=settings.sens*.0005;yaw-=e.movementX*s;pitch=THREE.MathUtils.clamp(pitch-e.movementY*s*(settings.inv?-1:1),-1.4,1.4)});
// ---------- game ----------
let game=null,W=null,ws=null,myId=0,hostId=0,roster=[],paused=false,lapOpen=false,pendingSolo=false;const ENTS=new Map(),OTH=new Map();
const me={pos:new THREE.Vector3(0,0,3),bob:0};
function collide(p){for(const w of WALLS){const r=.3;const cx=THREE.MathUtils.clamp(p.x,w.x0,w.x1),cz=THREE.MathUtils.clamp(p.z,w.z0,w.z1);const dx=p.x-cx,dz=p.z-cz,l=Math.hypot(dx,dz);
 if(l<r){if(l<1e-4){p.x+=r}else{p.x+=dx/l*(r-l);p.z+=dz/l*(r-l)}}}p.x=THREE.MathUtils.clamp(p.x,-14,14);p.z=THREE.MathUtils.clamp(p.z,-12,12.8)}
const send=m=>ws&&ws.readyState==1&&ws.send(JSON.stringify(m));
function net(cb){if(ws&&ws.readyState==1)return cb();ws=new WebSocket((location.protocol=='https:'?'wss://':'ws://')+location.host+'/ws');ws.onopen=cb;
 ws.onmessage=e=>{const m=JSON.parse(e.data);
  if(m.t=='err')$('jerr').textContent=m.e;
  if(m.t=='joined'){myId=m.id;hostId=m.host;$('lcode').textContent=m.code;if(!pendingSolo&&!m.started)showMenu('lobby')}
  if(m.t=='roster'){roster=m.pl;hostId=m.host;renderLobby();if(pendingSolo&&myId==hostId){pendingSolo=false;send({t:'start'})}
   if(m.left){const o=OTH.get(m.left);if(o){scene.remove(o.g);o.tag.remove();OTH.delete(m.left)}}}
  if(m.t=='start')startGame(m.pl);
  if(m.t=='w')applyWorld(m.w);
  if(m.t=='s'&&game){let o=OTH.get(m.id);if(!o){const r=roster.find(p=>p.id==m.id)||{color:'#fff',name:'?'};o={g:dude(r.color),tag:document.createElement('div'),tp:new THREE.Vector3()};o.tag.className='tag';o.tag.textContent=r.name;o.tag.style.color=r.color;document.body.append(o.tag);scene.add(o.g);o.g.position.set(m.p[0],0,m.p[1]);OTH.set(m.id,o)}
   o.tp.set(m.p[0],0,m.p[1]);o.yaw=m.r}};
 ws.onclose=()=>{if(game)toast('Disconnected')}}
function renderLobby(){$('lpl').innerHTML=roster.map(p=>`<div class="pl" style="color:${p.color}">● ${p.name}${p.id==hostId?' (host)':''}</div>`).join('')+`<p>${roster.length}/4 growers</p>`;$('bstart').style.display=myId==hostId?'':'none'}
function dude(c){const g=new THREE.Group(),m=mat(c),sk=mat('#ffd3a8'),dk=mat('#2a3a5a');g.add(at(sh(new THREE.Mesh(new THREE.CapsuleGeometry(.28,.5,4,12),m)),0,.95,0),at(sh(new THREE.Mesh(new THREE.SphereGeometry(.23,16,12),sk)),0,1.55,0),
 at(sh(new THREE.Mesh(new THREE.SphereGeometry(.245,16,8,0,6.3,0,1.5),m)),0,1.6,0),at(box(.3,.04,.22,c),0,1.62,.2),blob(.4));for(const s of[-1,1]){g.add(at(new THREE.Mesh(new THREE.SphereGeometry(.035,8,6),mat('#111')),s*.08,1.57,.21),at(sh(new THREE.Mesh(new THREE.CapsuleGeometry(.09,.35,3,8),dk)),s*.13,.3,0))}g.add(at(new THREE.Group(),0,1,.4));return g}
const hand=new THREE.Group();hand.position.set(.32,-.38,-.62);camera.add(hand);const bagG=new THREE.Group();
function applyWorld(w){W=w;setRoom(w.room);
 const seen=new Set();for(const e of w.ents){seen.add(e.id);let o=ENTS.get(e.id);const k=ekey(e);
  if(!o||o.k!=k){if(o)o.g.parent?.remove(o.g);o={g:prop(e),k};ENTS.set(e.id,o)}o.e=e;
  if(e.by){const tgt=e.bi?bagG:e.by==myId?hand:OTH.get(e.by)?.g.children.at(-1);if(tgt&&o.g.parent!=tgt){tgt.add(o.g);o.g.position.set(0,e.type=='light'?-1.1:e.type=='rack'?-.5:0,0);o.g.rotation.set(0,0,0);o.g.scale.setScalar(e.type=='light'||e.type=='rack'?.45:1)}}
  else{if(o.g.parent!=scene){scene.add(o.g);o.g.scale.setScalar(1)}o.g.position.set(e.x,e.y,e.z);o.g.rotation.set(0,e.ry,0)}}
 for(const [id,o] of ENTS)if(!seen.has(id)){o.g.parent?.remove(o.g);ENTS.delete(id)}
 w.log.forEach(t=>feed(t));if(w.toast&&w.toast.pid==myId)toast(w.toast.t);if(w.sound)sfx(w.sound);if(lapOpen)renderLap(true)}
let feedL=[];function feed(t){feedL.push(t);feedL=feedL.slice(-5);$('feed').innerHTML=feedL.join('<br>')}
let toastT;function toast(t){$('toast').textContent=t;$('toast').style.opacity=1;clearTimeout(toastT);toastT=setTimeout(()=>$('toast').style.opacity=0,2400)}
const bag=()=>W?W.ents.filter(e=>e.by==myId).sort((a,b)=>(a.bi||0)-(b.bi||0)):[];const carried=()=>bag()[0]||null;
function target(){if(!W)return null;const eye=camera.position,dir=new THREE.Vector3();camera.getWorldDirection(dir);let best=null,bs=-1;
 const cands=[{fx:'laptop',p:LAPTOP},{fx:'drop',p:DROP},...W.ents.filter(e=>!e.by).map(e=>({e,p:new THREE.Vector3(e.x,e.type=='light'?1.2:e.type=='rack'?1.2:e.type=='pot'?.45:.15,e.z)}))];
 for(const c of cands){const v=c.p.clone().sub(eye),d=v.length();if(d>2.6)continue;const dot=v.normalize().dot(dir);const sc=dot-d*.015;if(dot>.9&&sc>bs){bs=sc;best=c}}return best}
function useRule(c,e){const d=e.data,ct=c.type;if(e.type=='pot'){if(ct=='soil')return d.soil?'':'Fill with soil';if(ct.startsWith('seed_'))return !d.soil?'':d.plant?'':'Plant '+STRAINS[ct.slice(5)].name;if(ct=='water')return d.plant?'Water':'';if(ct=='nutr')return d.plant?'Feed nutrients':''}
 if(e.type=='rack'&&ct=='wetbud')return 'Hang to dry';if(e.type=='scale'&&ct=='drybud')return 'Weigh & pack';return null}
function promptFor(c,t,only){if(!t)return null;if(t.fx=='laptop')return only?null:'Use Laptop';if(t.fx=='drop')return c?.type=='packed'?'Deliver '+c.data.g+'g to Drop Box':'Drop Box — bring packed jars';
 const e=t.e,st=stage(e.data.plant);if(c){const u=useRule(c,e);if(u)return u;if(u==='')return null}if(only)return null;
 if(e.type=='pot'&&st=='ready')return 'Harvest';if(st=='dead')return 'Clear dead plant';if(e.type=='rack'&&e.data.slots?.some(s=>s.t<=0))return 'Take dried bud';return bag().length>=3?null:'Pick up '+NAME(e.type)}
let curT=null;
function syncCam(){camera.position.set(me.pos.x,1.62+Math.sin(me.bob)*.035,me.pos.z);camera.rotation.set(pitch,yaw,0,'YXZ');camera.updateMatrixWorld()}
function interact(only){initAudio();syncCam();curT=target();const c=carried(),t=curT;if(!t)return;if(t.fx=='laptop'){if(!only)openLap();return}
 if(t.fx=='drop'){if(c)send({t:'use',target:'drop'});return}
 if(promptFor(c,t,only))send({t:'use',target:t.e.id,only:!!only});else if(c)toast("Can't use "+NAME(c.type)+' on that');else if(bag().length>=3)toast('Hands full — drop something')}
function drop(){const c=carried();if(!c)return;const dir=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));const p=me.pos.clone().addScaledVector(dir,1.1);collide(p);send({t:'drop',x:+p.x.toFixed(2),z:+p.z.toFixed(2),y:0,ry:yaw});sfx('drop')}
function cycle(d){if(bag().length>1){send({t:'cycle',d});sfx('ui')}}
function plantInfo(e){const p=e.data.plant;if(!p)return e.data.soil?'Soil ready — plant a seed':'Empty pot — add soil';const st=stage(p);if(st=='dead')return 'Dead plant';
 const bar=(n,v,c)=>`<span style="color:${v<15?'#ff6a5a':c}">${n} ${Math.round(v)}%</span>`;
 return `<b>${STRAINS[p.s].name}</b> · ${st.toUpperCase()}${st!='ready'?' '+Math.round(p.age/READY*100)+'%':''}<br>${bar('💧',p.water,'#7fd3ff')} · ${bar('🧪',p.nutr,'#ffb36a')} · ${bar('❤',p.health,'#9f9')} · ${p.lit?'💡 lit':'<span style="color:#ff6a5a">no light</span>'}`}
// ---------- laptop ----------
let tab='shop';const qty={};const TABS=['shop','contracts','upg'];
function openLap(t){if(t)tab=t;lapOpen=true;document.exitPointerLock?.();$('laptop').classList.add('on');renderLap();sfx('ui')}
function closeLap(){lapOpen=false;$('laptop').classList.remove('on');setFocus(null)}
function cycleTab(d){tab=TABS[(TABS.indexOf(tab)+d+3)%3];renderLap();setFocus(defFocus($('laptop')));sfx('ui')}
function renderLap(keep){if(!W)return;const L0=[...document.querySelectorAll('#laptop button')],fi=keep&&fEl?L0.indexOf(fEl):-1;
 document.querySelectorAll('.tab[data-tab]').forEach(b=>b.classList.toggle('sel',b.dataset.tab==tab));$('lmoney').textContent='$'+W.money+' · ★'+W.rep;
 let h='';if(tab=='shop')h=Object.entries(SHOP).map(([k,v])=>{const q=qty[k]||1;return `<button class="card shop" data-buy="${k}"><span class="qty"><span class="qb" data-q="-1">−</span>${padMode?'◀ ':''}×${q}${padMode?' ▶':''}<span class="qb" data-q="1">+</span></span><h3>${v.n}</h3>${v.uses?v.uses+' uses each · ':''}<span class="p">$${v.p*q}</span></button>`}).join('')+(W.pending?.length?`<div class="card">🚚 ${W.pending.length} item(s) on the way</div>`:'')+`<div class="card" style="opacity:.75">${padMode?'◀ ▶ quantity · <span class="g pA">A</span> buy · <span class="g pL">LB/RB</span> tabs · <span class="g pB">B</span> close':'Click to buy · −/+ quantity'}</div>`;
 if(tab=='contracts')h=W.contracts.map(c=>`<button class="card info" style="border-left:6px solid ${SCOL[c.s]}"><h3>${c.shop}</h3>${c.g}g ${STRAINS[c.s].name}<br>Delivered ${c.got}/${c.g}g · Due end of day ${c.due}<br><span class="p">$${c.pay}</span></button>`).join('')+'<div class="card">Deliver packed jars at the green Drop Box outside. Contracts auto-match by strain.</div>';
 if(tab=='upg')h=`<button class="card" data-upg="1"><h3>Big Grow Room</h3>Doubles your space.<br>Needs ★5 reputation.<br>${W.room>1?'<b>OWNED</b>':'<span class="p">$500</span>'}</button><button class="card info"><h3>Reputation ★${W.rep}</h3>Finish contracts to earn rep. Higher rep = bigger, better-paying contracts.</button>`;
 $('lbody').innerHTML=h;$('lbody').classList.toggle('one',tab=='shop');if(fi>=0){const L=[...document.querySelectorAll('#laptop button')];setFocus(L[fi]||null)}}
// ---------- menus / focus ----------
function setPause(v){if(!game)return;paused=v;$('pause').classList.toggle('on',v);if(v)document.exitPointerLock?.();setFocus(null)}
function showMenu(which){setFocus(null);$('menu').classList.add('on');['main','join','lobby','set'].forEach(k=>$('m-'+k).style.display=k==which?(k=='main'?'flex':''):'none')}
const OSK='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';let oskT=null;
$('osk').innerHTML=[...OSK].map(c=>`<button class="key" data-k="${c}">${c}</button>`).join('')+'<button class="key w" data-k="DEL">DEL</button><button class="key w" data-k="OK">OK</button>';
['code','nm'].forEach(k=>$(k).addEventListener('focus',()=>{oskT=$(k);setTgt()}));
function setTgt(){document.querySelectorAll('#code,#nm').forEach(e=>e.classList.toggle('tgt',e==(oskT||$('code'))))}
function oskKey(k){const t=oskT||$('code');if(k=='DEL')t.value=t.value.slice(0,-1);else if(k=='OK'){if(t.id=='code'){oskT=$('nm')}else{setFocus(document.querySelector('[data-a=dojoin]'))}}else if(t.value.length<(+t.maxLength||10))t.value+=k;setTgt()}
function uiRoot(){if($('splash').classList.contains('on'))return $('splash');if($('menu').classList.contains('on'))return [...$('menu').children].find(e=>e.id!='brand'&&e.offsetParent)||null;if(lapOpen)return $('laptop');if(paused)return $('pause');return null}
let fEl=null;const focusables=r=>[...r.querySelectorAll('button,input,select')].filter(e=>e.offsetParent&&!e.disabled);
function setFocus(e){fEl&&fEl.classList.remove('f');fEl=e;if(e){e.classList.add('f');e.scrollIntoView?.({block:'nearest'})}}
function defFocus(root){const L=focusables(root);for(const s of['.card[data-buy]','#code','[data-a=solo]','[data-a=resume]','#bstart','#sens','.card','[data-a=back]'])if(L.find(e=>e.matches(s)))return L.find(e=>e.matches(s));return L[0]||null}
function nav(dx,dy){const root=uiRoot();if(!root||root.id=='splash')return;const L=focusables(root);if(!L.length)return;if(!fEl||!L.includes(fEl)){setFocus(defFocus(root));return}
 if(dx&&fEl.dataset.buy){const k=fEl.dataset.buy;qty[k]=THREE.MathUtils.clamp((qty[k]||1)+dx,1,10);renderLap(true);sfx('ui');return}
 if(dx&&(fEl.type=='range'||fEl.tagName=='SELECT')){if(fEl.type=='range')fEl.value=+fEl.value+dx;else fEl.selectedIndex=THREE.MathUtils.clamp(fEl.selectedIndex+dx,0,fEl.options.length-1);fEl.dispatchEvent(new Event('change'));sfx('ui');return}
 const a=fEl.getBoundingClientRect(),ax=a.x+a.width/2,ay=a.y+a.height/2;let best=null,bs=1e9;
 for(const e of L){if(e==fEl)continue;const b=e.getBoundingClientRect(),ex=b.x+b.width/2-ax,ey=b.y+b.height/2-ay,al=ex*dx+ey*dy;if(al<=4)continue;const sc=al+(Math.abs(ex*dy)+Math.abs(ey*dx))*2.5;if(sc<bs){bs=sc;best=e}}
 if(best){setFocus(best);sfx('ui')}}
function uiA(){const root=uiRoot();if(!root)return;if(root.id=='splash')return endSplash();if(!fEl||!focusables(root).includes(fEl))return setFocus(defFocus(root));
 if(fEl.tagName=='INPUT'&&fEl.type!='range'){oskT=fEl;setTgt();setFocus(document.querySelector('#osk .key'));return}if(fEl.tagName=='SELECT'){nav(1,0);return}fEl.click()}
function uiB(){const root=uiRoot();if(!root||root.id=='splash')return;if(fEl&&fEl.closest('#osk')){const t=oskT||$('code');if(t.value){oskKey('DEL');return}setFocus(t);return}
 document.activeElement?.blur?.();const b=root.querySelector('[data-a=back],[data-a=leave],[data-a=resume],[data-a=close]');b&&b.click()}
// ---------- gamepad ----------
let padIdx=-1,gate=false,lastRoot=undefined;const pb={},rp={t:0,d:''},lookV=new THREE.Vector2();
addEventListener('gamepadconnected',e=>{setMode(true);toast('🎮 Controller connected')});
addEventListener('gamepaddisconnected',e=>{if(!e.gamepad||e.gamepad.index===padIdx){padIdx=-1;toast('🎮 Controller disconnected')}});
function getPad(){const ps=[...(navigator.getGamepads?.()||[])].filter(p=>p&&p.connected!==false);if(!ps.length){padIdx=-1;return null}let p=ps.find(p=>p.index===padIdx);
 if(!p){p=ps.find(p=>p.mapping==='standard')||ps[0];padIdx=p.index;for(const k in pb)pb[k]=true;gate=true}return p}
const radial=(x,y,dz)=>{const m=Math.hypot(x,y);if(m<dz)return [0,0];const s=Math.min(1,(m-dz)/(1-dz))/m;return [x*s,y*s]};
function pollPad(dt){const gp=getPad(),root=uiRoot();
 if(root!==lastRoot){lastRoot=root;gate=true;rp.d='';if(root&&root.id!='splash'&&padMode)setFocus(defFocus(root))}
 if(!gp)return null;
 const B=k=>{const b=gp.buttons[k];return !!b&&(b.pressed||b.value>.5)};const E={};let any=false;for(let k=0;k<17;k++){const v=B(k);if(v)any=true;E[k]=v&&!pb[k];pb[k]=v}
 const std=gp.mapping==='standard'||gp.axes.length<6,ax=i=>gp.axes[i]||0;const lx=ax(0),ly=ax(1),rx=std?ax(2):ax(3),ry=std?ax(3):ax(4);
 if(any||Math.hypot(lx,ly)>.4||Math.hypot(rx,ry)>.4)setMode(true);
 if(root){if(root.id=='splash'){if(E[0]||E[9])endSplash();return null}
  if(E[9]){if(lapOpen)closeLap();else if(root.id=='pause')setPause(false);else if(!game)uiA();return null}
  let dx=(B(15)?1:0)-(B(14)?1:0),dy=(B(13)?1:0)-(B(12)?1:0);if(!dx&&!dy){const [x,y]=radial(lx,ly,.5);if(Math.abs(x)>Math.abs(y)){if(x)dx=Math.sign(x)}else if(y)dy=Math.sign(y)}
  const d=dx+','+dy;if(dx||dy){if(d!=rp.d){rp.d=d;rp.t=.35;nav(dx,dy)}else if((rp.t-=dt)<=0){rp.t=.11;nav(dx,dy)}}else rp.d='';
  if(lapOpen&&(E[4]||E[5]))cycleTab(E[5]?1:-1);if(E[0])uiA();else if(E[1])uiB();return null}
 if(gate&&!any)gate=false;
 if(!gate){if(E[0]||E[7])interact();else if(E[2])interact(true);if(E[1])drop();if(E[3])openLap('contracts');if(E[4])cycle(-1);if(E[5])cycle(1);if(E[9])setPause(true)}
 return {mx:lx,my:ly,rx,ry,sprint:B(10)}}
function startGame(pl){roster=pl;game={};$('menu').classList.remove('on');$('hud').style.display='block';me.pos.set(0,0,3.5);yaw=0;pitch=-.15;toast('Welcome to your grow shed! Check the laptop.')}
function endGame(){game=null;W=null;for(const o of ENTS.values())o.g.parent?.remove(o.g);ENTS.clear();for(const o of OTH.values()){scene.remove(o.g);o.tag.remove()}OTH.clear();$('hud').style.display='none';ws&&ws.close();ws=null;paused=false;$('pause').classList.remove('on');closeLap();document.exitPointerLock?.()}
document.addEventListener('click',e=>{initAudio();setVol(settings.vol/10);const qb=e.target.closest('[data-q]');const el=e.target.closest('button');if(!el)return;const ds=el.dataset;sfx('ui');
 if(qb&&ds.buy){qty[ds.buy]=THREE.MathUtils.clamp((qty[ds.buy]||1)+(+qb.dataset.q),1,10);renderLap(true);return}
 if(ds.k)return oskKey(ds.k);if(ds.tab){tab=ds.tab;renderLap();return}if(ds.buy){send({t:'buy',item:ds.buy,n:qty[ds.buy]||1});return}if(ds.upg){send({t:'upgrade'});return}
 const a=ds.a,nm=()=>($('nm').value||localStorage.bt_nm||'Grower').toUpperCase();
 if(a=='solo'){pendingSolo=true;net(()=>send({t:'host',name:nm()}))}
 if(a=='host'){pendingSolo=false;net(()=>send({t:'host',name:nm()}))}if(a=='join'){showMenu('join');oskT=$('code');setTgt()}if(a=='set')showMenu('set');
 if(a=='back'){if(game){$('menu').classList.remove('on');setFocus(null)}else showMenu('main')}
 if(a=='dojoin'){localStorage.bt_nm=$('nm').value;pendingSolo=false;net(()=>send({t:'join',code:$('code').value,name:nm()}))}
 if(a=='start')send({t:'start'});if(a=='leave'){ws&&ws.close();ws=null;showMenu('main')}
 if(a=='resume')setPause(false);if(a=='close')closeLap();if(a=='tomenu'){endGame();showMenu('main')}});
['sens','qual','vol','inv'].forEach(k=>{$(k).value=settings[k];$(k).onchange=()=>{settings[k]=+$(k).value;localStorage.bt_set=JSON.stringify(settings);setVol(settings.vol/10);if(k=='qual')location.reload()}});
const endSplash=()=>{if(!$('splash').classList.contains('on'))return;$('splash').classList.remove('on');if(!game)showMenu('main')};$('splash').onclick=endSplash;setTimeout(endSplash,Q.has('nosplash')?0:2900);
// ---------- grow-light pool ----------
const GLP=[];for(let i=0;i<3;i++){const l=new THREE.SpotLight('#ffd6f4',0,5,1.1,.6,1.2);l.castShadow=HQ&&i==0;l.shadow.mapSize.set(512,512);l.shadow.bias=-.002;scene.add(l,l.target);GLP.push(l)}
// ---------- loop ----------
const clock=new THREE.Clock();let T=0,sendT=0,frames=0;
function frame(){requestAnimationFrame(frame);frames++;const dt=Math.min(clock.getDelta(),.1);T+=dt;const pad=pollPad(dt);
 if(game){const fr=free();let mx=0,my=0;
  if(fr){mx=(keys.KeyD?1:0)-(keys.KeyA?1:0);my=(keys.KeyW?1:0)-(keys.KeyS?1:0);
   if(pad){const [x,y]=radial(pad.mx,pad.my,.18);mx+=x;my-=y;const [lx,ly]=radial(pad.rx,pad.ry,.14);const m=Math.hypot(lx,ly),c=m>0?Math.pow(m,1.7)/m:0,s=settings.sens/5;
    const k=1-Math.exp(-dt*16);lookV.x+=(lx*c*3.6*s-lookV.x)*k;lookV.y+=(ly*c*2.6*s*(settings.inv?-1:1)-lookV.y)*k;yaw-=lookV.x*dt;pitch=THREE.MathUtils.clamp(pitch-lookV.y*dt,-1.4,1.4)}else lookV.set(0,0)}else lookV.set(0,0);
  const f=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)),r=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));const v=f.multiplyScalar(my).addScaledVector(r,mx);if(v.length()>1)v.normalize();
  const sp=keys.ShiftLeft||pad?.sprint?6:4;me.pos.addScaledVector(v,sp*dt);collide(me.pos);me.bob+=v.length()*dt*9;syncCam();hand.position.y=-.38+Math.sin(me.bob*.5)*.01;
  if((sendT-=dt)<0){sendT=1/15;send({t:'s',p:[+me.pos.x.toFixed(2),+me.pos.z.toFixed(2)],r:+yaw.toFixed(2)})}
  for(const o of OTH.values()){o.g.position.lerp(o.tp,1-Math.exp(-dt*10));o.g.rotation.y=o.yaw+Math.PI;const p=o.g.position.clone().setY(2.1).project(camera);o.tag.style.display=p.z<1?'':'none';o.tag.style.left=(p.x+1)/2*innerWidth+'px';o.tag.style.top=(1-p.y)/2*innerHeight+'px'}
  if(W){const c=carried(),bg=bag();curT=fr?target():null;const pr=promptFor(c,curT);let h='';
   if(curT){h=pr?`${G('use')} ${pr}`:(c?`<span style="opacity:.7">Can't use ${NAME(c.type)} here</span>`:'');if(curT.e?.type=='pot')h+='<br><small>'+plantInfo(curT.e)+'</small>';
    if(curT.e?.type=='rack'&&curT.e.data.slots?.length)h+='<br><small>'+curT.e.data.slots.map(s=>s.t>0?`drying ${Math.ceil(s.t)}s`:'✔ dry').join(' · ')+'</small>'}
   $('prompt').innerHTML=h;$('hold').innerHTML=c?`Holding <b>${NAME(c.type)}</b>${c.data.uses!=null?' ('+c.data.uses+' left)':''}${c.data.g?' · '+c.data.g+'g '+STRAINS[c.data.s].name:''}<br>${bg.length>1?`<small>Also carrying: ${bg.slice(1).map(e=>NAME(e.type)).join(', ')} · ${G('cycle')} swap</small><br>`:''}${G('drop')} drop`:'';
   $('stats').innerHTML=`$${W.money}<br><small>★ ${W.rep} REP · ${W.contracts.length} CONTRACTS</small>`;const hh=W.min/60|0,mm=(W.min%60|0);$('clock').innerHTML=`DAY ${W.day}<br><small style="font:900 18px Nunito">${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}</small>`;
   const dl=Math.max(.15,Math.sin((W.min/1440-.25)*Math.PI*2)*.5+.5);sun.intensity=2.4*dl;hemi.intensity=.35+.5*dl;scene.background.copy(SKY).multiplyScalar(.25+.75*dl);
   const ls=W.ents.filter(e=>e.type=='light'&&!e.by).sort((a,b)=>Math.hypot(a.x-me.pos.x,a.z-me.pos.z)-Math.hypot(b.x-me.pos.x,b.z-me.pos.z));GLP.forEach((l,i)=>{const e=ls[i];l.intensity=e?9:0;if(e){const ox=Math.cos(e.ry)*.5,oz=-Math.sin(e.ry)*.5;l.position.set(e.x+ox,2.18,e.z+oz);l.target.position.set(e.x+ox,0,e.z+oz)}})}}
 else{const a=T*.05;camera.position.set(Math.sin(a)*1.2+.5,1.7,1.2+Math.cos(a)*.6);camera.lookAt(0,.6,-3)}
 for(const o of ENTS.values()){const pl=o.g.userData.plant;if(pl){const s=pl.userData.sway||0;pl.rotation.z=Math.sin(T*1.3+s)*.025;pl.rotation.x=Math.cos(T*1.05+s)*.02}}
 for(const pl of demoPl){const s=pl.userData.sway||0;pl.rotation.z=Math.sin(T*1.3+s)*.025}
 composer?composer.render():renderer.render(scene,camera)}
const demo=new THREE.Group(),demoPl=[];[[-1.2,-3,300],[0,-3.2,470],[1.2,-3,130]].forEach(([x,z,a],i)=>{const g=prop({id:900+i,type:'pot',data:{soil:1,plant:{s:['owl','kush','haze'][i],age:a,health:100,water:80,nutr:80}}});g.position.set(x,0,z);demo.add(g);demoPl.push(g.userData.plant)});
const dlp=prop({type:'light',data:{}});dlp.position.set(-.5,0,-3.1);demo.add(dlp);scene.add(demo);setInterval(()=>demo.visible=!game,200);
frame();
window.__bt={get W(){return W},get game(){return game},get frames(){return frames},send,look(y,p){yaw=y;pitch=p},tp(x,z){me.pos.set(x,0,z)},lookAt(x,y,z){const dx=x-me.pos.x,dz=z-me.pos.z;yaw=Math.atan2(-dx,-dz);pitch=Math.atan2(y-1.62,Math.hypot(dx,dz))},interact,drop,openLap,closeLap,tab:t=>{tab=t;renderLap()},
 target:()=>{syncCam();const t=target();return t&&(t.fx||t.e.type)},state:()=>({root:uiRoot()?.id||null,focus:fEl?(fEl.dataset.a||fEl.dataset.buy||fEl.dataset.tab||fEl.dataset.k||fEl.id||fEl.className):null,tab,lapOpen,paused,padMode,held:carried()?.type||null,bag:bag().map(e=>e.type),yaw,pitch,x:me.pos.x,z:me.pos.z,money:W?.money,code:$('code').value,sens:settings.sens,qty:{...qty}})};
