// Realistic rigged human characters (Quaternius Universal Base Characters, CC0) with
// a character-creator "look", skinned clothing shells that share the body skeleton,
// bone-attached accessories, hair, and an AnimationMixer driven by the Universal Animation Library (CC0).
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import {clone as skClone} from 'three/examples/jsm/utils/SkeletonUtils.js';
const BASE=((import.meta.env&&import.meta.env.BASE_URL)||'/')+'models/';
// ---------------- options (exported for the creator UI) ----------------
export const TONES=[['light','#fff2ec','Porcelain',.42],['light','#fbe6da','Fair',.26],['light','#f1d2bc','Light',.1],['light','#d9ab88','Medium',0],['dark','#f2e0d2','Olive'],['dark','#d9b79c','Tan'],['dark','#a77a5c','Brown'],['dark','#7a5440','Deep']];
export const EYES=[['#5a3a20','Brown'],['#2c1a10','Dark Brown'],['#7a5a2a','Hazel'],['#3f6b3a','Green'],['#3a6fa8','Blue'],['#8aa6c0','Grey'],['#b07a2a','Amber']];
export const HAIRC=[['#151110','Black'],['#3a2416','Dark Brown'],['#6b4428','Brown'],['#a0703d','Light Brown'],['#d8b475','Blonde'],['#efdcb0','Platinum'],['#8a2f1a','Auburn'],['#b4471f','Ginger'],['#8d8d8d','Grey'],['#e8e8e8','White'],['#3d6fd1','Blue'],['#c3417f','Pink'],['#3f8f4a','Green']];
export const HAIRS=[['bald','Shaved'],['buzz','Buzz Cut'],['soft','Short Crop'],['parted','Side Part'],['buns','Twin Buns'],['long','Long']];
const HAIRF={buzz:'hair_buzzed',soft:'hair_buzzedfemale',parted:'hair_simpleparted',buns:'hair_buns',long:'hair_long'};
export const FHAIR=[['none','Clean Shaven'],['stubble','Stubble'],['goatee','Goatee'],['short','Short Beard'],['full','Full Beard']];
export const BROWS=[['natural','Natural'],['thin','Thin'],['bold','Bold'],['arched','Arched']];
export const FACES=[['oval','Oval',0,0,0],['round','Round',.6,.2,-.3],['square','Square',.25,.9,0],['long','Long',-.4,-.2,.7],['heart','Heart',.3,-.6,0],['diamond','Diamond',-.2,-.3,.3]];
export const TATS=[['none','None'],['leaf','Leaf'],['rose','Rose'],['tribal','Tribal'],['star','Stars'],['script','Script']];
export const SCARS=[['none','None'],['brow','Eyebrow'],['cheek','Cheek'],['lip','Lip']];
export const COLORS=[['#f2f2f2','White'],['#1d1d1f','Black'],['#7c7f86','Heather Grey'],['#25324a','Navy'],['#2f5d9c','Royal Blue'],['#7fb3d9','Sky'],['#2f5c34','Forest'],['#6b8f3a','Olive'],['#8a2a2a','Maroon'],['#c8402e','Red'],['#e08a2e','Orange'],['#e9cf5b','Mustard'],['#c79a6b','Tan'],['#5a3b2a','Brown'],['#6a4b9a','Purple'],['#e59ab8','Pink'],['#3c4f73','Denim Blue'],['#2b3a52','Dark Denim']];
export const PATS=[['solid','Solid'],['plaid','Plaid'],['stripe','Stripes'],['camo','Camo'],['heather','Heather'],['tiedye','Tie-Dye']];
// clothing catalog: slot, price (0 = starter), fabric, default color/pattern
export const CLOTH={
 tee:{slot:'top',n:'Crew Tee',p:0,k:'cotton',c:0},longsleeve:{slot:'top',n:'Long Sleeve',p:0,k:'cotton',c:2},tank:{slot:'top',n:'Tank Top',p:15,k:'cotton',c:1},
 hoodie:{slot:'top',n:'Hoodie',p:60,k:'fleece',c:7},sweater:{slot:'top',n:'Knit Sweater',p:70,k:'knit',c:8},flannel:{slot:'top',n:'Flannel',p:55,k:'cotton',c:9,pt:1},jacket:{slot:'top',n:'Leather Jacket',p:120,k:'leather',c:1},denimjk:{slot:'top',n:'Denim Jacket',p:95,k:'denim',c:16},
 jeans:{slot:'bot',n:'Jeans',p:0,k:'denim',c:16},sweats:{slot:'bot',n:'Sweatpants',p:0,k:'fleece',c:2},shorts:{slot:'bot',n:'Shorts',p:25,k:'canvas',c:12},cargos:{slot:'bot',n:'Cargo Pants',p:45,k:'canvas',c:7},leggings:{slot:'bot',n:'Leggings',p:30,k:'knit',c:1},
 sneakers:{slot:'shoe',n:'Sneakers',p:0,k:'canvas',c:0},slides:{slot:'shoe',n:'Slides',p:0,k:'rubber',c:1},boots:{slot:'shoe',n:'Work Boots',p:80,k:'leather',c:13},sandals:{slot:'shoe',n:'Sandals',p:20,k:'leather',c:12},hightops:{slot:'shoe',n:'High-Tops',p:65,k:'canvas',c:9},
 cap:{slot:'hat',n:'Ball Cap',p:20,k:'cotton',c:6},beanie:{slot:'hat',n:'Beanie',p:0,k:'knit',c:10},bucket:{slot:'hat',n:'Bucket Hat',p:30,k:'canvas',c:7},
 shades:{slot:'eyes',n:'Sunglasses',p:30,k:'metal',c:1},aviators:{slot:'eyes',n:'Aviators',p:45,k:'metal',c:11},
 chain:{slot:'neck',n:'Gold Chain',p:90,k:'metal',c:11},pendant:{slot:'neck',n:'Leaf Pendant',p:150,k:'metal',c:11},
 hoops:{slot:'ears',n:'Hoop Earrings',p:40,k:'metal',c:11},studs:{slot:'ears',n:'Stud Earrings',p:25,k:'metal',c:0},
 watch:{slot:'wrist',n:'Sport Watch',p:75,k:'metal',c:1},goldwatch:{slot:'wrist',n:'Gold Watch',p:200,k:'metal',c:11}};
export const SLOTS=[['top','Top'],['bot','Bottoms'],['shoe','Shoes'],['hat','Hat'],['eyes','Eyewear'],['neck','Neck'],['ears','Earrings'],['wrist','Wrist']];
export const OPTIONAL={hat:1,eyes:1,neck:1,ears:1,wrist:1};
export const STARTER=Object.keys(CLOTH).filter(k=>CLOTH[k].p==0);
export function defLook(sex='m',seed=0){const r=(n)=>(seed*7919+n*104729)%997/997;const f=sex=='f';
 return {v:1,sex,tone:Math.floor(r(1)*8),face:0,fw:0,jaw:0,nose:0,nosew:0,lips:f?.2:0,brow:f?'thin':'natural',eye:Math.floor(r(2)*7),hair:f?'long':'parted',hlen:0,hcol:1+Math.floor(r(3)*4),fhair:f?'none':'stubble',build:0,mus:0,height:0,
  tatArm:'none',tatChest:'none',tatNeck:'none',pEar:0,pNose:0,pBrow:0,pLip:0,scar:'none',freck:0,
  fit:{top:{id:'tee',c:Math.floor(r(4)*COLORS.length),p:0},bot:{id:'jeans',c:16,p:0},shoe:{id:'sneakers',c:0,p:0},hat:null,eyes:null,neck:null,ears:null,wrist:null}}}
export function cleanLook(l){const d=defLook(l?.sex=='f'?'f':'m');if(!l||typeof l!='object')return d;const o={...d};for(const k in d){if(k=='fit')continue;if(typeof l[k]==typeof d[k])o[k]=l[k]}
 o.fit={};for(const [s] of SLOTS){const it=l.fit?.[s];o.fit[s]=it&&CLOTH[it.id]?.slot==s?{id:it.id,c:(it.c|0)%COLORS.length,p:(it.p|0)%PATS.length}:(OPTIONAL[s]?null:d.fit[s])}return o}
// ---------------- loading ----------------
const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);const texL=new THREE.TextureLoader();
const gl=f=>new Promise((res,rej)=>loader.load(BASE+f+'.glb',res,undefined,rej));
const img=f=>new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=BASE+'tex/'+f});
const tex=(f,srgb)=>{const t=texL.load(BASE+'tex/'+f);t.flipY=false;if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t};
let A=null;export const ready=(async()=>{const [m,f,an,...hs]=await Promise.all([gl('male'),gl('female'),gl('anims'),...[...Object.values(HAIRF),'hair_beard'].map(gl)]);
 const [mi,fi,ml,fl,eye]=await Promise.all(['male_dark.jpg','female_dark.jpg','male_light.jpg','female_light.jpg','eye.jpg'].map(img));
 A={base:{m:prep(m,{dark:mi,light:ml},'male'),f:prep(f,{dark:fi,light:fl},'female')},clips:Object.fromEntries(an.animations.map(c=>[c.name,c])),hair:{},eyeImg:eye,
  tx:{hair1:tex('hair1.jpg',1),hair1n:tex('hair1_n.jpg'),hair2:tex('hair2.jpg',1),hair2n:tex('hair2_n.jpg'),eyen:tex('eye_n.jpg')}};
 [...Object.values(HAIRF),'hair_beard'].forEach((k,i)=>{let sm=null;hs[i].scene.traverse(o=>{if(o.isSkinnedMesh&&!sm)sm=o});A.hair[k]=sm});
 A.carry=samplePose('Driving_Loop',.2);return A})();
ready.catch(e=>console.error('human assets',e.stack||e));
// per-sex derived data: vertex groups, limb t, smooth normals, landmarks
function prep(g,imgs,name){let body,eyes,brows;g.scene.traverse(o=>{if(!o.isSkinnedMesh)return;const mn=o.material.name;if(/Eyes/.test(mn))eyes=o;else if(/Hair/.test(mn))brows=o;else body=o});
 const sk=body.skeleton,bn=sk.bones.map(b=>b.name),BP={};sk.bones.forEach((b,i)=>BP[b.name]=new THREE.Vector3().setFromMatrixPosition(sk.boneInverses[i].clone().invert()));
 const geo=body.geometry,pos=geo.attributes.position,n=pos.count,si=geo.attributes.skinIndex,sw=geo.attributes.skinWeight;const G=new Array(n),T=new Float32Array(n),S=new Int8Array(n);
 const grp=nm=>nm=='Head'?'head':nm=='neck_01'?'neck':/^(spine_03|clavicle)/.test(nm)?'chest':/^spine_0[12]/.test(nm)?'abd':nm=='pelvis'?'pelvis':/^upperarm/.test(nm)?'uarm':/^lowerarm/.test(nm)?'larm':/^(hand|index|middle|ring|pinky|thumb)/.test(nm)?'hand':/^thigh/.test(nm)?'thigh':/^calf/.test(nm)?'calf':/^(foot|ball)/.test(nm)?'foot':'x';
 const SEG={uarm:['upperarm','lowerarm'],larm:['lowerarm','hand'],thigh:['thigh','calf'],calf:['calf','foot']};const v=new THREE.Vector3(),ab=new THREE.Vector3(),av=new THREE.Vector3();
 for(let i=0;i<n;i++){let bi=0,bw=-1;for(let k=0;k<4;k++){const w=sw.getComponent(i,k);if(w>bw){bw=w;bi=si.getComponent(i,k)}}const nm=bn[bi];G[i]=grp(nm);v.fromBufferAttribute(pos,i);S[i]=v.x>=0?1:-1;
  const sg=SEG[G[i]];if(sg){const s=nm.endsWith('_r')||v.x<0?'_r':'_l';const a=BP[sg[0]+s],b=BP[sg[1]+s];ab.subVectors(b,a);T[i]=av.subVectors(v,a).dot(ab)/ab.lengthSq()}}
 // smooth (position-welded) normals so clothing shells don't split at UV seams
 const nr=geo.attributes.normal,N=new Float32Array(n*3),key=new Map(),K=new Int32Array(n);for(let i=0;i<n;i++){const k=Math.round(pos.getX(i)*1e4)+','+Math.round(pos.getY(i)*1e4)+','+Math.round(pos.getZ(i)*1e4);let j=key.get(k);if(j==null){j=i;key.set(k,i)}K[i]=j;N[j*3]+=nr.getX(i);N[j*3+1]+=nr.getY(i);N[j*3+2]+=nr.getZ(i)}
 for(let i=0;i<n;i++){const j=K[i];v.set(N[j*3],N[j*3+1],N[j*3+2]).normalize();N[i*3]=v.x;N[i*3+1]=v.y;N[i*3+2]=v.z}
 // landmarks
 let nose=null,top=-1,chin=9,earL=null;const hb=new THREE.Box3();const eb=new THREE.Box3().setFromBufferAttribute(eyes.geometry.attributes.position);const eyeC=eb.getCenter(new THREE.Vector3());
 for(let i=0;i<n;i++){if(G[i]!='head')continue;v.fromBufferAttribute(pos,i);hb.expandByPoint(v);if(Math.abs(v.x)<.012&&v.y<eyeC.y&&v.y>eyeC.y-.08&&(!nose||v.z>nose.z))nose=v.clone();if(v.y>top)top=v.y;
  if(Math.abs(v.x)<.02&&v.z>eyeC.z-.04&&v.y<chin)chin=v.y;if(v.y<eyeC.y&&v.y>eyeC.y-.05&&v.x>0&&(!earL||v.x>earL.x))earL=v.clone()}
 const mouthY=nose.y-(nose.y-chin)*.42;
 return {name,src:g.scene,geo,n,G,T,S,N,BP,eyes,brows,eyeC,eyeR:eb.max.z,nose,top,chin,mouthY,ear:earL,hb,imgs,nm:tex(name+'_n.jpg'),rm:tex(name+'_r.jpg')}}
function samplePose(clip,t){const B=A.base.m,root=skClone(B.src),mx=new THREE.AnimationMixer(root);mx.clipAction(A.clips[clip]).play();mx.update(t);const q={};root.traverse(o=>{if(o.isBone&&/(upperarm|lowerarm|hand)_r$/.test(o.name))q[o.name]=o.quaternion.clone()});return q}
// ---------------- geometry: body shaping ----------------
const GC=new Map();const gcache=(k,f)=>GC.has(k)?GC.get(k):(GC.set(k,f()),GC.get(k));
const sm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
function shapeKey(L){return [L.sex,L.face,L.fw,L.jaw,L.nose,L.nosew,L.lips,L.build,L.mus].map(v=>typeof v=='number'?+v.toFixed(2):v).join('|')}
function shapedPos(B,L){return gcache('P'+shapeKey(L),()=>{const p=B.geo.attributes.position.array,P=new Float32Array(p),F=FACES.find(f=>f[0]==L.face)||FACES[0];
 const fw=THREE.MathUtils.clamp(L.fw+F[2],-1.2,1.2),jaw=THREE.MathUtils.clamp(L.jaw+F[3],-1.2,1.2),flen=F[4]||0,ns=L.nose,nw=L.nosew,lp=L.lips,bd=L.build,mu=L.mus;
 const hc=B.hb.getCenter(new THREE.Vector3()),ey=B.eyeC.y,nose=B.nose,my=B.mouthY,ch=B.chin;
 for(let i=0;i<B.n;i++){let x=P[i*3],y=P[i*3+1],z=P[i*3+2];const g=B.G[i];
  if(g=='head'||g=='neck'){const below=sm(ey+.01,ey-.05,y);
   x=hc.x+(x-hc.x)*(1+.06*fw*below);// face width
   const jw=sm(nose.y-.01,ch+.01,y)*sm(hc.z-.06,hc.z+.02,z);x=hc.x+(x-hc.x)*(1+.13*jaw*jw);if(jaw>0)z+=.006*jaw*jw*sm(.03,0,Math.abs(x));// jaw width / chin
   if(flen&&y<nose.y)y-=(nose.y-y)*.07*flen*sm(hc.z-.04,hc.z+.03,z);
   const dn=Math.hypot(x/.022,(y-(nose.y+.006))/.03,(z-nose.z)/.035);if(dn<1.6){const w=Math.exp(-dn*dn*1.4);z+=(z-(nose.z-.03))*.22*ns*w;x*=1+.3*nw*w;y+=(y-(nose.y+.01))*.12*ns*w}// nose
   const dl=Math.hypot(x/.03,(y-my)/.014,(z-(nose.z-.012))/.03);if(dl<1.6){const w=Math.exp(-dl*dl*1.6);z+=.0045*lp*w;y+=(y-my)*.3*lp*w}}// lips
  else if(g!='x'){const nx=B.N[i*3],ny=B.N[i*3+1],nz=B.N[i*3+2];let d=0;
   const limb=g=='uarm'||g=='larm'||g=='thigh'||g=='calf';if(limb)d=.004*bd+.005*mu*(g=='uarm'||g=='calf'?1.2:.8);if(g=='chest')d=.004*bd+.007*mu;if(g=='abd'||g=='pelvis')d=.011*Math.max(0,bd)+.003*Math.min(0,bd)-.002*mu;
   if(g=='abd'&&bd>0&&z>0)d+=.022*bd*sm(-.02,.1,z)*sm(1.35,1.15,y);if(g=='hand'||g=='foot')d=.0015*bd;x+=nx*d;y+=ny*d;z+=nz*d}
  P[i*3]=x;P[i*3+1]=y;P[i*3+2]=z}return P})}
// ---------------- clothing coverage ----------------
const torso=(B,y,g,i)=>g=='chest'||g=='abd'||(g=='pelvis'&&y>B.BP.pelvis.y+.045);
const legs=(B,y,g,t,tmax)=>g=='pelvis'||(g=='abd'&&y<B.BP.pelvis.y+.1)||g=='thigh'&&t<tmax+1||(g=='calf'&&t<tmax);
const GARM={
 tee:{d:.0065,cov:(B,g,t,y)=>torso(B,y,g)||g=='uarm'&&t<.45},tank:{d:.006,cov:(B,g,t,y,x,z)=>torso(B,y,g)&&!(g=='chest'&&Math.abs(x)>.13)},
 longsleeve:{d:.007,cov:(B,g,t,y)=>torso(B,y,g)||g=='uarm'||g=='larm'&&t<.93,fold:1},
 hoodie:{d:.015,loose:.5,cov:(B,g,t,y)=>torso(B,y,g)||g=='uarm'||g=='larm'&&t<.9,fold:1.4,cuff:.84,hood:1},
 sweater:{d:.011,loose:.25,cov:(B,g,t,y)=>torso(B,y,g)||g=='uarm'||g=='larm'&&t<.9,fold:1,cuff:.86},
 flannel:{d:.01,loose:.2,cov:(B,g,t,y)=>torso(B,y,g)||g=='uarm'||g=='larm'&&t<.92,fold:1.1,placket:1},
 jacket:{d:.02,loose:.35,cov:(B,g,t,y)=>torso(B,y,g)||g=='uarm'||g=='larm'&&t<.92,fold:1.6,zip:1,collar:1},
 denimjk:{d:.018,loose:.3,cov:(B,g,t,y)=>torso(B,y,g)||g=='uarm'||g=='larm'&&t<.92,fold:1.3,zip:1,collar:1},
 jeans:{d:.0065,cov:(B,g,t,y)=>legs(B,y,g,t,.95),fold:1,belt:1},shorts:{d:.009,loose:.3,cov:(B,g,t,y)=>g=='pelvis'||(g=='abd'&&y<B.BP.pelvis.y+.1)||(g=='thigh'&&t<.55),fold:.8},
 cargos:{d:.012,loose:.45,cov:(B,g,t,y)=>legs(B,y,g,t,.95),fold:1.6,pockets:1,belt:1},leggings:{d:.0028,cov:(B,g,t,y)=>legs(B,y,g,t,.93)},
 sweats:{d:.013,loose:.4,cov:(B,g,t,y)=>legs(B,y,g,t,.93),fold:1.8,cuff:.82},
 sneakers:{d:.012,cov:(B,g,t,y)=>g=='foot'||g=='calf'&&t>.9,sole:.035},hightops:{d:.013,cov:(B,g,t,y)=>g=='foot'||g=='calf'&&t>.78,sole:.035},boots:{d:.016,cov:(B,g,t,y)=>g=='foot'||g=='calf'&&t>.66,sole:.04,dark:1},
 sandals:{d:.006,keep:1,cov:(B,g,t,y,x,z,s)=>g=='foot'&&(y<.022||Math.abs(z-.0)<.012||Math.abs(z-.045)<.009),sole:.022},slides:{d:.007,keep:1,cov:(B,g,t,y,x,z)=>g=='foot'&&(y<.022||(z>-.005&&z<.05&&y>.03)),sole:.022}};
function covMask(B,P,id){return gcache('M'+B.name+id,()=>{const s=GARM[id],m=new Uint8Array(B.n),p=B.geo.attributes.position.array;for(let i=0;i<B.n;i++)m[i]=s.cov(B,B.G[i],B.T[i],p[i*3+1],p[i*3],p[i*3+2],B.S[i])?1:0;return m})}
function garmentGeo(B,L,id,fp){return gcache('G'+shapeKey(L)+id+(fp?'fp':''),()=>{const s=GARM[id],P=shapedPos(B,L),m=covMask(B,P,id),n=B.n,src=B.geo;
 const out=new Float32Array(n*3),col=new Float32Array(n*3);for(let i=0;i<n;i++){const g=B.G[i],t=B.T[i];let d=s.d;const y=P[i*3+1];
  if(s.loose&&(g=='chest'||g=='abd'||g=='thigh'||g=='pelvis'))d*=1+s.loose;
  if(s.fold&&(g=='larm'||g=='calf')&&t>.55){const a=Math.atan2(P[i*3+2],P[i*3+1]-0)+Math.atan2(P[i*3+2],P[i*3]);d+=.0025*s.fold*sm(.55,.9,t)*(.5+.5*Math.sin(t*46+a*3))}
  if(s.fold&&(g=='uarm'||g=='thigh')&&t>.6){d+=.0012*s.fold*(.5+.5*Math.sin(t*38+P[i*3+2]*90))}
  let c=1;if(s.cuff&&(g=='larm'&&t>.8||g=='calf'&&t>.82))c=s.cuff;if(s.sole&&y<s.sole){c=-1}if(s.belt&&g=='abd'&&y<B.BP.pelvis.y+.1&&y>B.BP.pelvis.y+.07)c=.6;
  if(s.sole&&y<.01)d+=.004;out[i*3]=P[i*3]+B.N[i*3]*d;out[i*3+1]=P[i*3+1]+B.N[i*3+1]*d-(s.sole&&y<.012?.012:0);out[i*3+2]=P[i*3+2]+B.N[i*3+2]*d;col[i*3]=col[i*3+1]=col[i*3+2]=c}
 const idx=src.index.array,keep=[];for(let f=0;f<idx.length;f+=3){const a=idx[f],b=idx[f+1],c=idx[f+2];if(m[a]&&m[b]&&m[c]&&(!fp||fpTri(B,a,b,c)))keep.push(a,b,c)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(out,3));g.setAttribute('normal',new THREE.BufferAttribute(B.N,3));g.setAttribute('uv',src.attributes.uv);g.setAttribute('skinIndex',src.attributes.skinIndex);g.setAttribute('skinWeight',src.attributes.skinWeight);g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(keep);g.computeBoundingSphere();return g})}
const fpTri=(B,a,b,c)=>[a,b,c].every(i=>B.G[i]=='hand'||B.G[i]=='larm'||(B.G[i]=='uarm'&&B.T[i]>.35));
function bodyGeo(B,L,hideIds,fp){return gcache('B'+shapeKey(L)+hideIds.join(',')+(fp?'fp':''),()=>{const P=shapedPos(B,L),ms=hideIds.map(id=>covMask(B,P,id)),src=B.geo,idx=src.index.array,keep=[];
 for(let f=0;f<idx.length;f+=3){const a=idx[f],b=idx[f+1],c=idx[f+2];if(fp&&!fpTri(B,a,b,c))continue;if(ms.some(m=>m[a]&&m[b]&&m[c]))continue;keep.push(a,b,c)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));['normal','uv','skinIndex','skinWeight'].forEach(k=>g.setAttribute(k,src.attributes[k]));g.setIndex(keep);g.computeBoundingSphere();return g})}
// ---------------- textures ----------------
const TC=new Map();const tcache=(k,f)=>TC.has(k)?TC.get(k):(TC.set(k,f()),TC.get(k));
function rng(s){return()=>(s=(s*16807)%2147483647)/2147483647}
function canvasTex(c,rep,srgb=true){const t=new THREE.CanvasTexture(c);t.flipY=false;if(srgb)t.colorSpace=THREE.SRGBColorSpace;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep,rep)}t.anisotropy=4;return t}
function uvOf(B,i){const u=B.geo.attributes.uv;return [u.getX(i),u.getY(i)]}
function nearestV(B,pt,filt){const p=B.geo.attributes.position,v=new THREE.Vector3();let bi=0,bd=1e9;for(let i=0;i<B.n;i++){if(filt&&!filt(i))continue;v.fromBufferAttribute(p,i);const d=v.distanceToSquared(pt);if(d<bd){bd=d;bi=i}}return bi}
function skinTex(B,L){const k=['S',B.name,L.tone,L.fhair,L.hcol,L.tatArm,L.tatChest,L.tatNeck,L.scar,L.freck].join('|');return tcache(k,()=>{const tn=TONES[L.tone]||TONES[2],im=B.imgs[tn[0]],S=1024,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d');
 x.drawImage(im,0,0,S,S);x.globalCompositeOperation='multiply';x.fillStyle=tn[1];x.fillRect(0,0,S,S);if(tn[3]){x.globalCompositeOperation='screen';x.globalAlpha=tn[3];x.fillStyle='#ffe9de';x.fillRect(0,0,S,S);x.globalAlpha=1}x.globalCompositeOperation='source-over';const R=rng(7+L.tone*13);const pos=B.geo.attributes.position,v=new THREE.Vector3();
 const each=(pred,fn)=>{for(let i=0;i<B.n;i++){if(B.G[i]!='head'&&B.G[i]!='neck')continue;v.fromBufferAttribute(pos,i);if(pred(v)){const [u,w]=uvOf(B,i);fn(u*S,w*S,v)}}};
 const hc=HAIRC[L.hcol]?.[0]||'#3a2416';
 if(L.fhair=='stubble'||L.fhair=='short'||L.fhair=='full'||L.fhair=='goatee'){x.fillStyle=hc;each(p=>p.y<B.nose.y-.012&&p.z>B.hb.min.z+.06&&p.y>B.chin-.012&&!(Math.abs(p.x)<.024&&Math.abs(p.y-B.mouthY)<.008&&p.z>B.nose.z-.03),(px,py)=>{for(let j=0;j<10;j++){x.globalAlpha=.18+R()*.18;x.fillRect(px+(R()-.5)*14,py+(R()-.5)*14,1.5,1.5)}});x.globalAlpha=1}
 if(L.freck>0){each(p=>p.z>B.nose.z-.05&&Math.abs(p.y-(B.nose.y+.012))<.022&&Math.abs(p.x)<.055,(px,py)=>{for(let j=0;j<3;j++)if(R()<L.freck*.8){x.globalAlpha=.25+R()*.3;x.fillStyle='#7a4024';x.beginPath();x.arc(px+(R()-.5)*10,py+(R()-.5)*10,.9+R()*1.6,0,7);x.fill()}});x.globalAlpha=1}
 const scarAt={brow:[new THREE.Vector3(-.035,B.eyeC.y+.022,B.eyeR-.005),new THREE.Vector3(-.03,B.eyeC.y+.002,B.eyeR)],cheek:[new THREE.Vector3(.05,B.nose.y+.008,B.eyeR-.02),new THREE.Vector3(.035,B.nose.y-.022,B.eyeR-.012)],lip:[new THREE.Vector3(.012,B.mouthY+.016,B.nose.z-.012),new THREE.Vector3(.008,B.mouthY-.004,B.nose.z-.01)]}[L.scar];
 if(scarAt){const hf=i=>B.G[i]=='head';const [a,b]=scarAt.map(p=>uvOf(B,nearestV(B,p,hf)).map(q=>q*S));x.lineCap='round';x.strokeStyle='rgba(120,60,50,.45)';x.lineWidth=7;x.beginPath();x.moveTo(...a);x.lineTo(...b);x.stroke();x.strokeStyle='rgba(255,220,205,.75)';x.lineWidth=3;x.stroke()}
 const tat=(design,region)=>{if(design=='none')return;const p=B.geo.attributes.position;let u0=1,v0=1,u1=0,v1=0,cnt=0;for(let i=0;i<B.n;i++){v.fromBufferAttribute(p,i);if(!region(i,v))continue;const [u,w]=uvOf(B,i);u0=Math.min(u0,u);v0=Math.min(v0,w);u1=Math.max(u1,u);v1=Math.max(v1,w);cnt++}if(!cnt)return;
  const cx=(u0+u1)/2*S,cy=(v0+v1)/2*S,r=Math.min(u1-u0,v1-v0)*S*.42;drawTat(x,design,cx,cy,r)};
 tat(L.tatArm,(i,p)=>B.G[i]=='larm'&&p.x>0&&B.T[i]>.25&&B.T[i]<.75&&p.y>B.BP.lowerarm_l.y-.005&&p.z>B.BP.lowerarm_l.z);
 tat(L.tatChest,(i,p)=>B.G[i]=='chest'&&p.x>.03&&p.x<.13&&p.z>.04&&p.y>B.BP.spine_03.y+.03&&p.y<B.BP.spine_03.y+.14);
 tat(L.tatNeck,(i,p)=>B.G[i]=='neck'&&p.x>.02&&p.z>-.06&&p.z<.02);
 return canvasTex(c)})}
function drawTat(x,d,cx,cy,r){x.save();x.translate(cx,cy);x.strokeStyle=x.fillStyle='rgba(28,32,44,.82)';x.lineWidth=Math.max(1.5,r*.07);x.lineCap=x.lineJoin='round';
 if(d=='leaf'){for(let k=-3;k<=3;k++){x.save();x.rotate(k*.38);const l=r*(1-Math.abs(k)*.18);x.beginPath();x.moveTo(0,r*.5);x.quadraticCurveTo(l*.18,-l*.2+r*.5- l*.6,0,r*.5-l);x.quadraticCurveTo(-l*.18,r*.5-l*.6,0,r*.5);x.fill();x.restore()}x.beginPath();x.moveTo(0,r*.5);x.lineTo(0,r*.95);x.stroke()}
 if(d=='rose'){for(let k=0;k<4;k++){x.beginPath();x.arc(0,-r*.2,r*(.12+k*.1),k,k+4.2);x.stroke()}x.beginPath();x.moveTo(0,r*.25);x.quadraticCurveTo(r*.15,r*.6,0,r*.95);x.stroke();x.beginPath();x.ellipse(r*.22,r*.55,r*.18,r*.08,-.5,0,7);x.fill()}
 if(d=='tribal'){for(const s of[-1,1]){x.beginPath();x.moveTo(0,-r);x.bezierCurveTo(s*r*.9,-r*.4,s*r*.2,0,s*r*.7,r*.6);x.bezierCurveTo(s*r*.1,r*.2,s*r*.3,-r*.3,0,-r*.5);x.fill()}}
 if(d=='star'){for(const [sx,sy,sr] of[[0,0,.5],[.45,-.5,.28],[-.4,.55,.22]]){x.beginPath();for(let k=0;k<10;k++){const a=k*Math.PI/5-Math.PI/2,rr=(k%2?.42:1)*sr*r;x.lineTo(sx*r+Math.cos(a)*rr,sy*r+Math.sin(a)*rr)}x.closePath();x.stroke()}}
 if(d=='script'){x.font=`italic 700 ${r*.62|0}px Georgia`;x.textAlign='center';x.textBaseline='middle';x.fillText('Grow',0,0);x.beginPath();x.moveTo(-r*.7,r*.42);x.quadraticCurveTo(0,r*.62,r*.7,r*.42);x.stroke()}x.restore()}
function eyeTex(L){return tcache('E'+L.eye,()=>{const im=A.eyeImg,c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.drawImage(im,0,0,256,256);const d=x.getImageData(0,0,256,256),p=d.data,tc=new THREE.Color(EYES[L.eye]?.[0]||'#5a3a20'),hsl={};tc.getHSL(hsl);const q=new THREE.Color();
 for(let i=0;i<p.length;i+=4){q.setRGB(p[i]/255,p[i+1]/255,p[i+2]/255);const h={};q.getHSL(h);if(h.s>.18&&h.l<.85){q.setHSL(hsl.h,Math.min(1,hsl.s*1.05),THREE.MathUtils.clamp(h.l*(.55+hsl.l*1.6),0,.92));p[i]=q.r*255;p[i+1]=q.g*255;p[i+2]=q.b*255}}x.putImageData(d,0,0);return canvasTex(c)})}
const KIND={cotton:{r:.92,rep:9},knit:{r:.95,rep:7},fleece:{r:.98,rep:6},denim:{r:.88,rep:10},leather:{r:.5,rep:5},canvas:{r:.9,rep:9},rubber:{r:.7,rep:4}};
function fabricTex(kind,col,pat){return tcache('F'+kind+col+pat,()=>{const S=256,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d'),R=rng(11+col.length*7);const base=new THREE.Color(col);x.fillStyle=col;x.fillRect(0,0,S,S);
 const sh=(k)=>'#'+base.clone().multiplyScalar(k).getHexString();const acc=pat=='plaid'?(base.getHSL({}).l>.5?'#222':'#e8e2d0'):'#fff';
 if(pat=='plaid'){for(const [w,a,cl] of[[64,.38,sh(.45)],[18,.5,acc],[6,.35,sh(1.5)]]){x.globalAlpha=a;x.fillStyle=cl;for(let o=0;o<S;o+=128){x.fillRect(o+40,0,w,S);x.fillRect(0,o+40,S,w)}}x.globalAlpha=1}
 if(pat=='stripe'){x.fillStyle=base.getHSL({}).l>.6?'#25324a':'#f0f0f0';for(let o=0;o<S;o+=64)x.fillRect(0,o,S,22)}
 if(pat=='camo'){for(const cl of[sh(.62),sh(1.35),'#2a2a20']){x.fillStyle=cl;for(let i=0;i<14;i++){x.beginPath();const cx=R()*S,cy=R()*S;for(let k=0;k<8;k++){const a=k/8*6.28,rr=14+R()*22;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.7)}x.fill()}}}
 if(pat=='tiedye'){for(let i=0;i<6;i++){const g=x.createRadialGradient(R()*S,R()*S,4,R()*S,R()*S,140);const hc=new THREE.Color().setHSL(R(),.7,.55);g.addColorStop(0,'#'+hc.getHexString()+'aa');g.addColorStop(1,'#0000');x.fillStyle=g;x.fillRect(0,0,S,S)}}
 const nz=pat=='heather'?.16:.06;for(let i=0;i<5000;i++){x.fillStyle=R()<.5?`rgba(255,255,255,${R()*nz})`:`rgba(0,0,0,${R()*nz})`;x.fillRect(R()*S,R()*S,1+R()*2,1)}
 if(kind=='denim'){x.globalAlpha=.18;for(let o=-S;o<S;o+=3){x.strokeStyle=o%6?'#fff':'#000';x.beginPath();x.moveTo(o,0);x.lineTo(o+S,S);x.stroke()}x.globalAlpha=1}
 if(kind=='knit'){x.globalAlpha=.22;x.strokeStyle='#000';for(let yy=0;yy<S;yy+=8)for(let xx=0;xx<S;xx+=8){x.beginPath();x.moveTo(xx,yy);x.lineTo(xx+4,yy+7);x.lineTo(xx+8,yy);x.stroke()}x.globalAlpha=1}
 if(kind=='leather'){for(let i=0;i<300;i++){x.strokeStyle=`rgba(0,0,0,${R()*.12})`;x.beginPath();const a=R()*S,b=R()*S;x.moveTo(a,b);x.lineTo(a+(R()-.5)*30,b+(R()-.5)*30);x.stroke()}}
 return canvasTex(c,KIND[kind]?.rep||8)})}
function weaveNormal(kind){return tcache('N'+kind,()=>{const S=128,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d'),h=new Float32Array(S*S),R=rng(5+kind.length);
 for(let j=0;j<S;j++)for(let i=0;i<S;i++){let v=0;if(kind=='denim')v=Math.sin((i+j)*1.6)*.5;else if(kind=='knit')v=Math.abs(Math.sin(i*.4+ (j%8<4?1:-1)*j*.2))*.8;else if(kind=='canvas')v=(Math.sin(i*1.5)+Math.sin(j*1.5))*.3;else if(kind=='cotton')v=(Math.sin(i*2.2)*Math.sin(j*2.2))*.3;h[j*S+i]=v+R()*(kind=='fleece'||kind=='leather'?.9:.35)}
 const d=x.createImageData(S,S);for(let j=0;j<S;j++)for(let i=0;i<S;i++){const hx=h[j*S+(i+1)%S]-h[j*S+(i+S-1)%S],hy=h[((j+1)%S)*S+i]-h[((j+S-1)%S)*S+i];const v=new THREE.Vector3(-hx,-hy,2.2).normalize();const o=(j*S+i)*4;d.data[o]=(v.x*.5+.5)*255;d.data[o+1]=(v.y*.5+.5)*255;d.data[o+2]=(v.z*.5+.5)*255;d.data[o+3]=255}
 x.putImageData(d,0,0);return canvasTex(c,KIND[kind]?.rep*1.5||10,false)})}
const MC=new Map();const mcache=(k,f)=>MC.has(k)?MC.get(k):(MC.set(k,f()),MC.get(k));
function clothMat(id,it,fp){const C=CLOTH[id],col=COLORS[it.c]?.[0]||'#888',pat=PATS[it.p]?.[0]||'solid',k=C.k;return mcache('C'+id+col+pat,()=>{const m=new THREE.MeshStandardMaterial({map:fabricTex(k,col,pat),normalMap:weaveNormal(k),normalScale:new THREE.Vector2(k=='fleece'||k=='knit'?.25:.5,k=='fleece'||k=='knit'?.25:.5),roughness:KIND[k]?.r??.9,metalness:0,vertexColors:true,side:THREE.DoubleSide});
 // vertex color < 0 marks shoe soles: render them as off-white rubber
 m.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#if defined( USE_COLOR_ALPHA ) || defined( USE_COLOR )\n if(vColor.r<0.){diffuseColor.rgb=vec3(.86,.85,.82);}else{diffuseColor.rgb*=vColor;}\n#endif')};m.customProgramCacheKey=()=>'cl';return m})}
const metal=(c)=>mcache('M'+c,()=>new THREE.MeshStandardMaterial({color:c,metalness:.95,roughness:.28}));
// ---------------- character assembly ----------------
const hairMat=(L,tx,which)=>mcache('H'+which+L.hcol,()=>new THREE.MeshStandardMaterial({map:A.tx[which],normalMap:A.tx[which+'n'],color:new THREE.Color(HAIRC[L.hcol]?.[0]||'#3a2416').multiplyScalar(2.2),roughness:.78,side:THREE.DoubleSide}));
function hairGeo(B,L,key,hat){return gcache('HG'+B.name+key+L.hlen+(hat?'h':''),()=>{const sm0=A.hair[key];const g=sm0.geometry.clone(),p=g.attributes.position,v=new THREE.Vector3();
 // remap skin indices to our skeleton by bone name
 const bn=sm0.skeleton.bones.map(b=>b.name),our=B.geo&&null;const si=g.attributes.skinIndex;const map=bn.map(n=>ourBones[B.name].indexOf(n));for(let i=0;i<si.count;i++)for(let k=0;k<4;k++)si.setComponent(i,k,Math.max(0,map[si.getComponent(i,k)]));
 // fit hair from the Regular head to this head: align to eye centre & head top
 const hb=new THREE.Box3().setFromBufferAttribute(p);const dy=0;const ey=B.eyeC.y;
 for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);v.y+=dy;if(key=='hair_long'&&v.y<ey)v.y=ey-(ey-v.y)*(1+.45*L.hlen);if(key!='hair_long'&&key!='hair_beard'&&L.hlen&&v.y>ey){const k=1+.12*L.hlen;v.x*=k;v.z=B.hb.getCenter(new THREE.Vector3()).z+(v.z-B.hb.getCenter(new THREE.Vector3()).z)*k;v.y=ey+(v.y-ey)*(1+.08*L.hlen)}p.setXYZ(i,v.x,v.y,v.z)}
 if(hat){const idx=g.index.array,keep=[];for(let f=0;f<idx.length;f+=3){if([0,1,2].some(k=>p.getY(idx[f+k])>B.eyeC.y+.035))continue;keep.push(idx[f],idx[f+1],idx[f+2])}g.setIndex(keep)}
 if(key=='hair_beard'&&L.fhair!='full'){const idx=g.index.array,keep=[];for(let f=0;f<idx.length;f+=3){const ok=[0,1,2].every(k=>{const i=idx[f+k];return L.fhair=='goatee'?Math.abs(p.getX(i))<.03&&p.getY(i)<B.nose.y-.01:p.getY(i)<B.nose.y+.002});if(ok)keep.push(idx[f],idx[f+1],idx[f+2])}g.setIndex(keep);
  if(L.fhair=='short'){const c=B.hb.getCenter(new THREE.Vector3());for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);v.lerp(new THREE.Vector3(c.x,v.y,c.z),.12);v.y=Math.max(v.y,B.chin-.012-(v.y<B.chin?.0:0));p.setXYZ(i,v.x,v.y,v.z)}}}
 g.computeBoundingSphere();return g})}
const ourBones={};
function neckEdge(B,L,id,off){const g=garmentGeo(B,L,id,0),ix=g.index.array,P=g.attributes.position.array,E=new Map();const sh=B.geo.attributes.position.array;
 // weld by original position so UV seams don't count as edges
 const key=i=>Math.round(sh[i*3]*1e4)+','+Math.round(sh[i*3+1]*1e4)+','+Math.round(sh[i*3+2]*1e4);
 for(let f=0;f<ix.length;f+=3)for(let k=0;k<3;k++){const a=ix[f+k],b=ix[f+(k+1)%3],ka=key(a),kb=key(b),e=ka<kb?ka+'|'+kb:kb+'|'+ka;const o=E.get(e);E.set(e,o?{n:o.n+1,a,b}:{n:1,a,b})}
 const nk=B.BP.neck_01,bins=new Array(32).fill(null);for(const e of E.values()){if(e.n!=1)continue;for(const i of[e.a,e.b]){const x=P[i*3],y=P[i*3+1],z=P[i*3+2];if(y<B.BP.spine_03.y+.04||Math.abs(x)>.13)continue;const a=Math.atan2(x,z-nk.z),bi=Math.floor((a+Math.PI)/(Math.PI*2)*32)%32;if(!bins[bi]||y<bins[bi].y)bins[bi]=new THREE.Vector3(x+B.N[i*3]*off,y+B.N[i*3+1]*off,z+B.N[i*3+2]*off)}}
 const pts=bins.filter(Boolean);return pts.length>6?new THREE.CatmullRomCurve3(pts,true):null}
// closed curve hugging the body around the neck (skeleton space), offset outwards by `off`
function neckRing(B,L,y0,k,off){const P=shapedPos(B,L),bins=new Array(36).fill(null),v=new THREE.Vector3(),nz=B.BP.neck_01.z;
 for(let i=0;i<B.n;i++){const g=B.G[i];if(g!='chest'&&g!='neck')continue;const x=P[i*3],y=P[i*3+1],z=P[i*3+2];if(Math.abs(y-(y0-k*Math.max(0,z-nz)))>.008)continue;const a=Math.atan2(x,z-nz),bi=Math.floor((a+Math.PI)/(Math.PI*2)*36)%36,r=Math.hypot(x,z-nz);if(!bins[bi]||r>bins[bi].r)bins[bi]={r,i}}
 const pts=[];bins.forEach(b=>{if(!b)return;const i=b.i;pts.push(new THREE.Vector3(P[i*3]+B.N[i*3]*off,P[i*3+1]+B.N[i*3+1]*off,P[i*3+2]+B.N[i*3+2]*off))});return new THREE.CatmullRomCurve3(pts,true)}
function attachRigid(root,sk,boneName,o0){const i=sk.bones.findIndex(b=>b.name==boneName);const b=sk.bones[i];const obj=new THREE.Group();obj.add(o0);obj.matrixAutoUpdate=false;obj.matrix.copy(sk.boneInverses[i]);b.add(obj);obj.traverse(o=>{if(o.isMesh){o.castShadow=true}});return obj}
function accessories(B,L,sk,fp){const out=[];const F=L.fit,hc=B.hb.getCenter(new THREE.Vector3()),hr=(B.hb.max.x-B.hb.min.x)/2,top=B.top,ey=B.eyeC.y;
 const add=(bone,o)=>{out.push(attachRigid(null,sk,bone,o))};
 if(!fp&&F.hat){const C=CLOTH[F.hat.id],mat=clothMat(F.hat.id,F.hat).clone();mat.vertexColors=false;const g=new THREE.Group();const zc=hc.z-.008;
  if(F.hat.id=='cap'){const d=new THREE.Mesh(new THREE.SphereGeometry(1,28,14,0,Math.PI*2,0,Math.PI*.5),mat);d.scale.set(hr+.006,top-ey-.02,(B.hb.max.z-B.hb.min.z)/2+.004);d.position.set(hc.x,ey+.035,zc);const br=new THREE.Mesh(new THREE.CylinderGeometry(.085,.085,.008,24,1,false,-Math.PI/2,Math.PI),mat);br.scale.set(1,1,.85);br.position.set(hc.x,ey+.04,B.hb.max.z-.02);br.rotation.x=.1;g.add(d,br);const bt=new THREE.Mesh(new THREE.SphereGeometry(.008,8,6),mat);bt.position.set(hc.x,top-.006,zc);g.add(bt)}
  if(F.hat.id=='beanie'){const d=new THREE.Mesh(new THREE.SphereGeometry(1,28,16,0,Math.PI*2,0,Math.PI*.55),mat);d.scale.set(hr+.014,top-ey-.005,(B.hb.max.z-B.hb.min.z)/2+.01);d.position.set(hc.x,ey+.035,zc);const cf=new THREE.Mesh(new THREE.CylinderGeometry(hr+.02,hr+.022,.045,28,1,true),mat);cf.scale.z=((B.hb.max.z-B.hb.min.z)/2+.02)/(hr+.02);cf.position.set(hc.x,ey+.045,zc);g.add(d,cf)}
  if(F.hat.id=='bucket'){const d=new THREE.Mesh(new THREE.CylinderGeometry(hr+.004,hr+.02,top-ey-.005,28,1),mat);d.scale.z=((B.hb.max.z-B.hb.min.z)/2+.016)/(hr+.016);d.position.set(hc.x,(top+ey)/2+.022,zc);const br=new THREE.Mesh(new THREE.CylinderGeometry(hr+.02,hr+.07,.03,28,1,true),mat);br.position.set(hc.x,ey+.03,zc);br.scale.z=d.scale.z;br.material=mat.clone();br.material.side=THREE.DoubleSide;g.add(d,br)}
  add('Head',g)}
 if(!fp&&F.eyes){const met=metal(F.eyes.id=='aviators'?'#c9a24a':'#151515');const lens=mcache('lens'+F.eyes.c,()=>new THREE.MeshStandardMaterial({color:new THREE.Color(COLORS[F.eyes.c]?.[0]||'#111').multiplyScalar(.35),metalness:.6,roughness:.08,transparent:true,opacity:.88}));const g=new THREE.Group(),z=B.eyeR+.012,y=B.eyeC.y;
  for(const s of[-1,1]){const l=new THREE.Mesh(new THREE.CircleGeometry(.021,24),lens);l.scale.set(F.eyes.id=='aviators'?1.05:1.15,F.eyes.id=='aviators'?1.05:.8,1);l.position.set(s*.033,y-.002,z);const r=new THREE.Mesh(new THREE.TorusGeometry(.021,.0022,6,24),met);r.scale.copy(l.scale);r.position.copy(l.position);const arm=new THREE.Mesh(new THREE.BoxGeometry(.003,.004,.1),met);arm.position.set(s*(hr+.003),y+.004,z-.055);g.add(l,r,arm)}
  const br=new THREE.Mesh(new THREE.BoxGeometry(.02,.003,.003),met);br.position.set(0,y+.006,z+.002);g.add(br);add('Head',g)}
 if(!fp&&F.neck){const met=metal(F.neck.c==11||F.neck.c==12?'#d4af37':COLORS[F.neck.c]?.[0]||'#d4af37');const nk=B.BP.neck_01;const off=.006+(GARM[F.top?.id]?.d||0)*1.4;const cv=neckRing(B,L,nk.y-.015,.45,off);const g=new THREE.Group();g.add(new THREE.Mesh(new THREE.TubeGeometry(cv,64,.003,6,true),met));
  if(F.neck.id=='pendant'){let lo=cv.getPoint(0);for(let t=0;t<1;t+=.01){const q=cv.getPoint(t);if(q.z>lo.z)lo=q}const p=new THREE.Mesh(new THREE.CylinderGeometry(.013,.013,.003,16),met);p.rotation.x=Math.PI/2-.2;p.position.set(0,lo.y-.018,lo.z+.004);g.add(p)}add('spine_03',g)}
 if(!fp&&(F.ears||L.pEar)){const met=metal(F.ears?.id=='hoops'||!F.ears?'#d4af37':'#e0e0e0');for(const s of[-1,1]){const e=B.ear,m=F.ears?.id=='hoops'?new THREE.Mesh(new THREE.TorusGeometry(.009,.0012,6,18),met):new THREE.Mesh(new THREE.SphereGeometry(.0028,8,6),met);m.position.set(s*(e.x+.002),e.y-.018-(F.ears?.id=='hoops'?.008:0),e.z-.004);if(m.geometry.type=='TorusGeometry')m.rotation.y=Math.PI/2;add('Head',m)}}
 if(!fp){const met=metal('#cfcfcf'),n=B.nose;if(L.pNose){const m=new THREE.Mesh(new THREE.TorusGeometry(.0045,.0011,6,14),met);m.position.set(.009,n.y-.006,n.z-.008);m.rotation.y=Math.PI/2;add('Head',m)}
  if(L.pBrow){const m=new THREE.Mesh(new THREE.TorusGeometry(.005,.0011,6,14),met);m.position.set(.042,B.eyeC.y+.02,B.eyeR-.008);m.rotation.y=Math.PI/2;add('Head',m)}
  if(L.pLip){const m=new THREE.Mesh(new THREE.TorusGeometry(.005,.0012,6,14),met);m.position.set(.008,B.mouthY-.008,n.z-.01);m.rotation.y=Math.PI/2;add('Head',m)}}
 if(F.wrist){const gold=F.wrist.id=='goldwatch',met=metal(gold?'#d4af37':'#202020');const h=B.BP.hand_l,g=new THREE.Group();const band=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.018,20,1,true),gold?met:mcache('band',()=>new THREE.MeshStandardMaterial({color:'#1b1b1b',roughness:.6,side:THREE.DoubleSide})));band.rotation.z=Math.PI/2;band.scale.set(1,1,.82);band.position.set(h.x-.035,h.y,h.z);
  const face=new THREE.Mesh(new THREE.CylinderGeometry(.017,.017,.008,20),met);face.position.set(h.x-.035,h.y+.026,h.z);const gl=new THREE.Mesh(new THREE.CircleGeometry(.014,20),mcache('wf',()=>new THREE.MeshStandardMaterial({color:'#0d1a22',metalness:.3,roughness:.1})));gl.rotation.x=-Math.PI/2;gl.position.set(h.x-.035,h.y+.0305,h.z);g.add(band,face,gl);add('lowerarm_l',g)}
 if(!fp){const top=F.top&&GARM[F.top.id];if(top?.hood){const m=clothMat(F.top.id,F.top).clone();m.vertexColors=false;const t=new THREE.Mesh(new THREE.TorusGeometry(.085,.03,10,28,Math.PI),m);t.rotation.set(Math.PI/2+.5,0,Math.PI);t.scale.set(1.05,1.1,.7);t.position.set(0,B.BP.neck_01.y-.02,B.BP.neck_01.z-.03);const g=new THREE.Group();g.add(t);
   for(const s of[-1,1]){const st=new THREE.Mesh(new THREE.CylinderGeometry(.003,.003,.12,6),mcache('str',()=>new THREE.MeshStandardMaterial({color:'#eee',roughness:.8})));st.position.set(s*.03,B.BP.neck_01.y-.11,B.BP.neck_01.z+.105);g.add(st)}add('spine_03',g)}
  if(top&&['tee','longsleeve','sweater','tank','flannel','hoodie'].includes(F.top.id)){const m=clothMat(F.top.id,F.top).clone();m.vertexColors=false;m.color.setScalar(.8);const nk=B.BP.neck_01;const cv=neckEdge(B,L,F.top.id,.002);if(cv)add('spine_03',new THREE.Mesh(new THREE.TubeGeometry(cv,64,.006,8,true),m))}
  if(top?.collar){const m=clothMat(F.top.id,F.top).clone();m.vertexColors=false;const t=new THREE.Mesh(new THREE.CylinderGeometry(.075,.09,.045,24,1,true,Math.PI*.15,Math.PI*1.7),m);t.material.side=THREE.DoubleSide;t.scale.z=.95;t.position.set(0,B.BP.neck_01.y-.02,B.BP.neck_01.z+.01);add('spine_03',t)}}
 return out}
function browGeo(B,L){return gcache('BR'+B.name+L.brow,()=>{const g=B.brows.geometry.clone(),p=g.attributes.position,c=new THREE.Box3().setFromBufferAttribute(p).getCenter(new THREE.Vector3()),v=new THREE.Vector3();
 for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const s=Math.sign(v.x)||1,ax=Math.abs(v.x);if(L.brow=='thin')v.y=c.y+(v.y-c.y)*.55;if(L.brow=='bold'){v.y=c.y+(v.y-c.y)*1.45;v.z+=.0008}if(L.brow=='arched')v.y+=.006*Math.sin(Math.min(1,Math.max(0,(ax-.012)/.05))*Math.PI);p.setXYZ(i,v.x,v.y,v.z)}return g})}
export function lookKey(L){return JSON.stringify(L)}
// Build a full character into group `root`.  fp=true builds first-person arms only.
function build(root,L,fp){L=cleanLook(L);const B=A.base[L.sex];const g=skClone(B.src);let body=null,eyes=null,brows=null;g.traverse(o=>{if(!o.isSkinnedMesh)return;const mn=o.material.name;if(/Eyes/.test(mn))eyes=o;else if(/Hair/.test(mn))brows=o;else body=o});
 const sk=body.skeleton;ourBones[B.name]=sk.bones.map(b=>b.name);const F=L.fit,garms=[F.top?.id,F.bot?.id,F.shoe?.id].filter(Boolean);
 body.geometry=bodyGeo(B,L,garms.filter(id=>!GARM[id].keep),fp);const tn=TONES[L.tone]||TONES[2];
 body.material=mcache('skin'+B.name+skinTex(B,L).uuid,()=>new THREE.MeshStandardMaterial({map:skinTex(B,L),normalMap:B.nm,roughnessMap:B.rm,roughness:1,metalness:0}));
 const meshes=[body];
 for(const s of['top','bot','shoe']){const it=F[s];if(!it)continue;const m=new THREE.SkinnedMesh(garmentGeo(B,L,it.id,fp),clothMat(it.id,it));m.bind(sk,body.bindMatrix);body.parent.add(m);meshes.push(m)}
 if(fp){eyes.visible=brows.visible=false}else{
  eyes.material=mcache('eye'+L.eye,()=>new THREE.MeshStandardMaterial({map:eyeTex(L),normalMap:A.tx.eyen,roughness:.15}));
  brows.geometry=browGeo(B,L);brows.material=mcache('brow'+L.hcol,()=>new THREE.MeshStandardMaterial({map:A.tx.hair1,color:new THREE.Color(HAIRC[L.hcol]?.[0]||'#333').multiplyScalar(1.6),roughness:.9}));
  const hk=HAIRF[L.hair];const hat=!!F.hat;if(hk){const h0=A.hair[hk],w=/Hair_1/.test(h0.material.name)?'hair1':'hair2';const m=new THREE.SkinnedMesh(hairGeo(B,L,hk,hat),hairMat(L,0,w));m.bind(sk,body.bindMatrix);body.parent.add(m);meshes.push(m)}
  if(['goatee','short','full'].includes(L.fhair)){const h0=A.hair.hair_beard,w=/Hair_1/.test(h0.material.name)?'hair1':'hair2';const m=new THREE.SkinnedMesh(hairGeo(B,L,'hair_beard',0),hairMat(L,0,w));m.bind(sk,body.bindMatrix);body.parent.add(m);meshes.push(m)}}
 accessories(B,L,sk,fp);
 g.traverse(o=>{if(o.isMesh){o.castShadow=!fp;o.receiveShadow=true;o.frustumCulled=false}});
 const hs=1+THREE.MathUtils.clamp(L.height,-1,1)*.05*(fp?0:1);g.scale.setScalar(hs);root.add(g);
 const mixer=new THREE.AnimationMixer(g),acts={};for(const [k,c] of Object.entries(A.clips))acts[k]=mixer.clipAction(c);
 const bones={};sk.bones.forEach(b=>bones[b.name]=b);
 const H={g,mixer,acts,bones,sk,L,B,cur:{},one:null,oneT:0,pose:null,look:0,fp};
 for(const k of['Idle_Loop','Walk_Loop','Jog_Fwd_Loop','Sprint_Loop','Crouch_Idle_Loop','Crouch_Fwd_Loop'])acts[k].play().setEffectiveWeight(0);acts.Idle_Loop.setEffectiveWeight(1);
 return H}
// public API ------------------------------------------------------------
export function makeHuman(look,opt={}){const root=new THREE.Group();const model=new THREE.Group();root.add(model);const hold=new THREE.Group();root.add(hold);root.userData.hold=hold;root.userData.model=model;root.userData.look=look;
 const go=()=>{model.clear();const H=build(model,look,!!opt.fp);root.userData.h=H;if(opt.fp)fpSetup(root,H)};if(A)go();else ready.then(go);return root}
export function setLook(root,look){root.userData.look=look;if(!A)return;const fp=!!root.userData.h?.fp;root.userData.model.clear();const H=build(root.userData.model,look,fp);root.userData.h=H;if(fp)fpSetup(root,H)}
const _q=new THREE.Quaternion(),_q2=new THREE.Quaternion(),_v=new THREE.Vector3(),_ax=new THREE.Vector3();
function pitchBone(H,b,ang){if(!b)return;b.updateMatrixWorld(true);const pw=b.parent.getWorldQuaternion(_q2);const bw=b.getWorldQuaternion(_q);_ax.set(1,0,0).applyQuaternion(H.g.getWorldQuaternion(new THREE.Quaternion()));const r=new THREE.Quaternion().setFromAxisAngle(_ax,ang);bw.premultiply(r);b.quaternion.copy(pw.invert().multiply(bw))}
const ONESHOT={pick:['PickUp_Table',1],use:['Interact',1.1],kneel:['Fixing_Kneeling',1.6],jump:['Jump_Start',1]};
const POSES={sit:'Sitting_Idle_Loop',drive:'Driving_Loop',talk:'Idle_Talking_Loop',dance:'Dance_Loop',push:'Push_Loop',kneel:'Fixing_Kneeling',use:'Interact',pick:'PickUp_Table'};
// st: {spd, cr(0..1), pitch, held, act:{k,n}, pose}
export function animateAvatar(root,dt,st){const H=root.userData.h;if(!H)return;const a=H.acts,k=1-Math.exp(-dt*8);H.spd=(H.spd??0)+((st.spd||0)-(H.spd??0))*k;H.cr=(H.cr??0)+((st.cr||0)-(H.cr??0))*k;const s=H.spd,cr=H.cr;
 // one-shot actions
 if(st.act&&st.act.n!==H.actN){H.actN=st.act.n;const o=ONESHOT[st.act.k];if(o&&H.actN!=null){if(H.one)H.one.fadeOut(.1);const ac=a[o[0]];ac.reset().setLoop(THREE.LoopOnce,1);ac.clampWhenFinished=true;ac.setEffectiveWeight(1).fadeIn(.12).play();H.one=ac;H.oneT=Math.min(o[1],ac.getClip().duration)}}
 if(H.one){H.oneT-=dt;if(H.oneT<=0){H.one.fadeOut(.25);H.one=null}}
 // looping pose (sit / drive / ...)
 const pn=POSES[st.pose]||null;if(pn!==H.pose){if(H.poseA)H.poseA.fadeOut(.3);H.pose=pn;H.poseA=pn?a[pn].reset().setLoop(THREE.LoopRepeat).setEffectiveWeight(1).fadeIn(.3).play():null}
 // locomotion blend by speed (walk 0-1.6, jog ~4, sprint ~6)
 const ow=H.one||H.poseA?0:1;const kn=[0,1.6,4,6];const w=[0,0,0,0];if(s<=kn[1])w[0]=1-s/kn[1],w[1]=s/kn[1];else if(s<=kn[2]){const t=(s-kn[1])/(kn[2]-kn[1]);w[1]=1-t;w[2]=t}else{const t=Math.min(1,(s-kn[2])/(kn[3]-kn[2]));w[2]=1-t;w[3]=t}
 const up=(1-cr)*ow,dn=cr*ow,cw=Math.min(1,s/1.5);
 a.Idle_Loop.setEffectiveWeight(w[0]*up);a.Walk_Loop.setEffectiveWeight(w[1]*up);a.Jog_Fwd_Loop.setEffectiveWeight(w[2]*up);a.Sprint_Loop.setEffectiveWeight(w[3]*up);
 a.Crouch_Idle_Loop.setEffectiveWeight((1-cw)*dn);a.Crouch_Fwd_Loop.setEffectiveWeight(cw*dn);
 a.Walk_Loop.timeScale=THREE.MathUtils.clamp(s/1.4,.6,1.6);a.Jog_Fwd_Loop.timeScale=THREE.MathUtils.clamp(s/4,.7,1.3);a.Sprint_Loop.timeScale=THREE.MathUtils.clamp(s/6,.8,1.2);a.Crouch_Fwd_Loop.timeScale=THREE.MathUtils.clamp(s/1.6,.5,1.4);
 H.mixer.update(dt);
 // carry pose on the right arm while holding something
 H.carry=(H.carry??0)+((st.held&&!H.one&&!H.poseA?1:0)-(H.carry??0))*k;if(H.carry>.01&&A.carry)for(const [n,q] of Object.entries(A.carry)){const b=H.bones[n];b&&b.quaternion.slerp(q,H.carry)}
 // head/neck/spine follow look pitch
 H.look+=((st.pitch||0)-H.look)*k;const p=-H.look;if(Math.abs(p)>.001&&!H.fp){pitchBone(H,H.bones.spine_03,p*.2);pitchBone(H,H.bones.neck_01,p*.3);pitchBone(H,H.bones.Head,p*.4)}
 // hold anchor follows the right hand
 const hb=H.bones.hand_r;if(hb){root.updateMatrixWorld(true);hb.getWorldPosition(_v);root.worldToLocal(_v);root.userData.hold.position.copy(_v);root.userData.hold.rotation.set(-(st.pitch||0)*.4,0,0)}}
export function makeAvatar(color,idx,look){return makeHuman(look||defLook(idx%2?'f':'m',idx))}
// ---------------- first-person arms ----------------
function fpSetup(root,H){const a=H.acts;for(const k in a)a[k].stop();H.fpA=a.Idle_Loop.reset().play();H.fpA.timeScale=0;H.mixer.update(.35);H.g.rotation.y=Math.PI;H.g.position.set(0,0,0);H.g.updateMatrixWorld(true);const hp=H.bones.Head.getWorldPosition(new THREE.Vector3());H.g.parent.worldToLocal(hp);H.hd=hp;H.fq=['upperarm_r','upperarm_l','lowerarm_r','lowerarm_l','hand_r','hand_l'].map(n=>[H.bones[n],H.bones[n].quaternion.clone()]);H.g.position.set(-hp.x,FPP.y-hp.y,FPP.z-hp.z)}
export const FPP={y:-.06,z:-.22,ua:-1.05,la:-.55,yaw:.12};
function yawBone(H,b,ang){b.updateMatrixWorld(true);const pw=b.parent.getWorldQuaternion(_q2),bw=b.getWorldQuaternion(_q);_ax.set(0,1,0).applyQuaternion(H.g.getWorldQuaternion(new THREE.Quaternion()));bw.premultiply(new THREE.Quaternion().setFromAxisAngle(_ax,ang));b.quaternion.copy(pw.invert().multiply(bw))}
function fpPose(H,lift){for(const sd of['_r','_l']){const sg=sd=='_r'?1:-1;pitchBone(H,H.bones['upperarm'+sd],FPP.ua-lift);yawBone(H,H.bones['upperarm'+sd],sg*FPP.yaw);pitchBone(H,H.bones['lowerarm'+sd],FPP.la)}}
export function makeFPArms(color,idx,look){return makeHuman(look||defLook('m',idx),{fp:1})}
export function animateFP(root,dt,bob,held,pour){const H=root.userData.h;if(!H)return;const b=Math.sin(bob*.5)*.01;H.g.position.y=FPP.y-H.hd.y+b;H.g.position.z=FPP.z-H.hd.z;for(const[b,q]of H.fq)b.quaternion.copy(q);H.g.updateMatrixWorld(true);fpPose(H,held?.15:0);
 const r=H.bones.upperarm_r,hr=H.bones.hand_r;if(held&&r){H.g.updateMatrixWorld(true)}if(pour&&hr)hr.rotateX(-.6)}
