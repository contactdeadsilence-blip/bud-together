// v15: item thumbnails rendered once offscreen from the real in-game 3D models, cached as data URLs.
import * as THREE from 'three';
import {SHOP} from './rules.js';
import {CLOTH,defLook,makeHuman,ready} from './human.js';
const C={},SZ=160;let R=null,mk=null,cbs=[],hReady=false;ready.then(()=>{hReady=true;const f=cbs;cbs=[];f.forEach(x=>x())});
export function initThumbs(prop){mk=prop}
function rend(){if(R)return R;const c=document.createElement('canvas');c.width=c.height=SZ;R=new THREE.WebGLRenderer({canvas:c,antialias:true,alpha:true,preserveDrawingBuffer:true});R.setSize(SZ,SZ,false);R.outputColorSpace=THREE.SRGBColorSpace;R.toneMapping=THREE.ACESFilmicToneMapping;return R}
function shoot(obj,box,dir=[1,.75,1.25]){const r=rend(),sc=new THREE.Scene();sc.add(new THREE.HemisphereLight('#ffffff','#556070',2.2));const d=new THREE.DirectionalLight('#fff',2.4);d.position.set(2,4,3);sc.add(d,obj);
 const b=box||new THREE.Box3().setFromObject(obj),c=b.getCenter(new THREE.Vector3()),s=b.getSize(new THREE.Vector3()).length()||1;const cam=new THREE.PerspectiveCamera(30,1,.01,100);
 cam.position.copy(c).add(new THREE.Vector3(...dir).normalize().multiplyScalar(s*1.75));cam.lookAt(c);r.setClearColor(0,0);r.render(sc,cam);const u=r.domElement.toDataURL('image/png');
return u}
export const itemEnt=k=>{const v=SHOP[k]||{};return v.pal?{id:-1,type:'pallet',data:{it:v.pal,n:v.k}}:{id:-1,type:v.ent||k,data:{...(v.dat||{}),n:v.uses||1,u:v.uses||1}}};
export function thumb(k){if(C[k]!=null)return C[k];try{C[k]=mk?shoot(mk(itemEnt(k))):''}catch(e){console.warn('thumb',k,e);C[k]=''}return C[k]}
const CROP={top:[1.0,1.55],bot:[.45,1.05],shoe:[0,.22],hat:[1.5,1.9],eyes:[1.55,1.78],neck:[1.3,1.6],ears:[1.55,1.78],wrist:[.75,1.05]};
export function thumbCloth(id,onReady){const key='c:'+id;if(C[key]!=null)return C[key];if(!hReady){if(onReady)cbs.push(onReady);return ''}
 try{const L=defLook('m',3);const it=CLOTH[id];L.fit={...L.fit,[it.slot]:{id,c:it.c,p:it.pt||0}};const h=makeHuman(L);h.updateMatrixWorld(true);const full=new THREE.Box3().setFromObject(h),H=full.max.y-full.min.y||1.8,[a,b]=CROP[it.slot]||[0,1.9],k=H/1.8;
  const bx=new THREE.Box3(new THREE.Vector3(-.3,full.min.y+a*k,-.2),new THREE.Vector3(.3,full.min.y+b*k,.2));C[key]=shoot(h,bx,[.5,.15,1])}catch(e){console.warn('thumbCloth',id,e);C[key]=''}return C[key]}
export const thumbCount=()=>Object.values(C).filter(Boolean).length;
export const img=(u,cls='th')=>u?`<img class="${cls}" src="${u}" alt="">`:`<span class="${cls} th0">📦</span>`;
