// v1.8.6 outdoor scenery: Stylized Nature MegaKit (Standard) by Quaternius (CC0, https://quaternius.itch.io/stylized-nature-megakit).
// One InstancedMesh per model per primitive, textures downsized to 256-512px, no shadow casting; trunks and big rocks get circle colliders.
import * as THREE from 'three';import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
export const TREEC=[];
const gy=(x,z)=>{const ox=Math.max(0,Math.abs(x)-45),oz=Math.max(0,z-14,-46-z),d=Math.hypot(ox,oz);return -.03+d*d*.004};
let sd=1867;const R=()=>(sd=(sd*16807)%2147483647)/2147483647;// seeded: same forest for everyone
// outside the build zone (|x|<43, -43<z<12.2) and clear of the front path/drive
const spot=(near)=>{for(let i=0;i<60;i++){const x=(R()-.5)*(near?104:150),z=(near?-50+R()*68:-75+R()*105);if(Math.abs(x)<44.5&&z>-44.5&&z<13)continue;if(z>11&&Math.abs(x)<14)continue;return [x,z]}return null};
// name, count, height range [m], collider: 't' trunk / 'r' rock
const SET=[['CommonTree_1',8,7,10,'t'],['CommonTree_3',8,8,11,'t'],['Pine_1',7,7,11,'t'],['Pine_2',7,7,11,'t'],['Pine_3',6,8,12,'t'],['DeadTree_1',3,6,8,'t'],
 ['Bush_Common',40,.9,1.6],['Rock_Medium_1',10,1.2,2.2,'r'],['Rock_Medium_2',12,.5,1.2],['Rock_Medium_3',8,1.4,2.4,'r'],['Grass_Common_Tall',70,.5,.9,0,1]];
export function loadForest(scene){const L=new GLTFLoader(),mc=new Map();const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),up=new THREE.Vector3(0,1,0),v=new THREE.Vector3(),sv=new THREE.Vector3(),bb=new THREE.Box3();
 const mat=o=>{if(!mc.has(o.uuid)){const m=new THREE.MeshLambertMaterial({map:o.map,color:o.color});if(o.map)o.map.anisotropy=1;if(/Leaf|Leaves|Grass/i.test(o.name)){m.alphaTest=.5;m.side=THREE.DoubleSide}mc.set(o.uuid,m)}return mc.get(o.uuid)};
 for(const [n,cnt,h0,h1,col,near] of SET){const pts=[];for(let i=0;i<cnt;i++){const p=spot(near);if(p)pts.push([p[0],p[1],R(),R()*6.28])}
  L.load(`models/nature/${n}.gltf`,g=>{g.scene.updateMatrixWorld(true);bb.setFromObject(g.scene);const H=bb.max.y-bb.min.y||1,W=Math.max(bb.max.x-bb.min.x,bb.max.z-bb.min.z),y0=bb.min.y;
   const parts=[];g.scene.traverse(o=>{if(o.isMesh)parts.push(o)});
   for(const src of parts){const geo=src.geometry.clone().applyMatrix4(src.matrixWorld);geo.translate(0,-y0,0);const mats=Array.isArray(src.material)?src.material.map(mat):mat(src.material);
    const im=new THREE.InstancedMesh(geo,mats,pts.length);
    pts.forEach(([x,z,t,r],i)=>{const s=(h0+t*(h1-h0))/H;q.setFromAxisAngle(up,r);m4.compose(v.set(x,gy(x,z)-(col=='r'?.12*s*H:0),z),q,sv.set(s,s,s));im.setMatrixAt(i,m4)});
    im.castShadow=false;im.receiveShadow=false;im.computeBoundingSphere();scene.add(im)}
   for(const [x,z,t] of pts){const s=(h0+t*(h1-h0))/H;if(col=='t')TREEC.push({x,z,r:.4});else if(col=='r')TREEC.push({x,z,r:W*s*.38})}})}}
export function collideForest(p,r=.3){for(const c of TREEC){const dx=p.x-c.x,dz=p.z-c.z,m=c.r+r;if(Math.abs(dx)>m||Math.abs(dz)>m)continue;const l=Math.hypot(dx,dz);if(l<m&&l>1e-5){p.x=c.x+dx/l*m;p.z=c.z+dz/l*m}}}
