// v1.8.6 outdoor scenery: KayKit Forest Nature Pack by Kay Lousberg (CC0, https://kaylousberg.itch.io/kaykit-forest).
// One InstancedMesh per model sharing a 256px gradient atlas, no shadow casting; trunks and big rocks get circle colliders.
import * as THREE from 'three';import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
export const TREEC=[];
const gy=(x,z)=>{const ox=Math.max(0,Math.abs(x)-45),oz=Math.max(0,z-14,-46-z),d=Math.hypot(ox,oz);return -.03+d*d*.004};
let sd=1867;const R=()=>(sd=(sd*16807)%2147483647)/2147483647;// seeded: same forest for everyone
// outside the build zone (|x|<43, -43<z<12.2) and clear of the front path/drive
const spot=(near)=>{for(let i=0;i<60;i++){const x=(R()-.5)*(near?104:150),z=(near?-50+R()*68:-75+R()*105);if(Math.abs(x)<44.5&&z>-44.5&&z<13)continue;if(z>11&&Math.abs(x)<14)continue;return [x,z]}return null};
// name, count, height range [m], collider: 't' trunk / 'r' rock
const SET=[['Tree_1_A',14,5,8,'t'],['Tree_1_B',14,5,8,'t'],['Tree_2_A',12,6,9,'t'],['Tree_2_C',10,7,10,'t'],['Tree_3_A',12,4,7,'t'],['Tree_4_A',14,7,10,'t'],['Tree_Bare_1_A',5,4,6,'t'],
 ['Bush_1_A',25,.7,1.2],['Bush_2_A',25,.8,1.4],['Bush_4_A',20,.6,1.1],['Rock_1_A',8,1.4,2.4,'r'],['Rock_3_A',8,1.2,2,'r'],['Rock_2_A',25,.3,.6],['Grass_1_A',60,.35,.6,0,1],['Grass_2_A',60,.4,.7,0,1]];
export function loadForest(scene){const L=new GLTFLoader(),mt={};const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),up=new THREE.Vector3(0,1,0),v=new THREE.Vector3(),sv=new THREE.Vector3();
 for(const [n,cnt,h0,h1,col,near] of SET){const pts=[];for(let i=0;i<cnt;i++){const p=spot(near);if(p)pts.push([p[0],p[1],R(),R()*6.28])}
  L.load(`models/kaykit/${n}_Color1.gltf`,g=>{g.scene.updateMatrixWorld(true);let src;g.scene.traverse(o=>{if(o.isMesh&&!src)src=o});if(!src)return;
   const geo=src.geometry.clone().applyMatrix4(src.matrixWorld);geo.computeBoundingBox();const bb=geo.boundingBox,H=bb.max.y-bb.min.y||1,W=Math.max(bb.max.x-bb.min.x,bb.max.z-bb.min.z);geo.translate(0,-bb.min.y,0);
   const m=mt[src.material.uuid]??=(()=>{const o=src.material.clone();o.side=near?THREE.DoubleSide:o.side;return o})();
   const im=new THREE.InstancedMesh(geo,m,pts.length);
   pts.forEach(([x,z,t,r],i)=>{const s=(h0+t*(h1-h0))/H;q.setFromAxisAngle(up,r);m4.compose(v.set(x,gy(x,z)-(col=='r'?.1*s*H:0),z),q,sv.set(s,s,s));im.setMatrixAt(i,m4);
    if(col=='t')TREEC.push({x,z,r:.35});else if(col=='r')TREEC.push({x,z,r:W*s*.4})});
   im.castShadow=false;im.receiveShadow=false;im.computeBoundingSphere();scene.add(im)})}}
export function collideForest(p,r=.3){for(const c of TREEC){const dx=p.x-c.x,dz=p.z-c.z,m=c.r+r;if(Math.abs(dx)>m||Math.abs(dz)>m)continue;const l=Math.hypot(dx,dz);if(l<m&&l>1e-5){p.x=c.x+dx/l*m;p.z=c.z+dz/l*m}}}
