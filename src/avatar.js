import * as THREE from 'three';
// Detailed procedural co-op avatars + first-person arms.
const M={};const mt=(c,r=.75,o={})=>{const k=c+r+JSON.stringify(o);return M[k]||(M[k]=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:r},o)))};
const S=m=>{m.castShadow=true;m.receiveShadow=true;return m};
const P=(geo,m,x=0,y=0,z=0,p)=>{const o=S(new THREE.Mesh(geo,m));o.position.set(x,y,z);p&&p.add(o);return o};
const G=(p,x=0,y=0,z=0)=>{const g=new THREE.Group();g.position.set(x,y,z);p&&p.add(g);return g};
// Canvas textures for denim / knit fabric give the cloth some grain.
function fabric(base,lines,seed){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.fillStyle=base;x.fillRect(0,0,64,64);let s=seed;const r=()=>(s=(s*9301+49297)%233280)/233280;
 for(let i=0;i<500;i++){x.fillStyle=`rgba(${r()<.5?'255,255,255':'0,0,0'},${.05+r()*.07})`;x.fillRect(r()*64,r()*64,lines?1:2,lines?3:2)}
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,3);t.colorSpace=THREE.SRGBColorSpace;return t}
const TEX={};const cloth=(c,denim)=>{const k=c+denim;return TEX[k]||(TEX[k]=new THREE.MeshStandardMaterial({color:'#fff',map:fabric(c,denim,c.length*97+(denim?7:3)),roughness:.92}))};
// Four outfit variants — slot index picks one; player color tints the top.
const VAR=[
 {skin:'#e8b48f',hair:'#3b2416',style:'short',top:'hoodie',pants:'#2f4a73',shoe:'#e9e9e9',acc:'apron'},
 {skin:'#a8714d',hair:'#141010',style:'bun',top:'tee',pants:'#3b3f46',shoe:'#3a2a1c',acc:'cap'},
 {skin:'#f3cfb0',hair:'#c9873a',style:'long',top:'flannel',pants:'#4a6a8c',shoe:'#2b2b2b',acc:'belt'},
 {skin:'#6b4630',hair:'#0d0b0a',style:'buzz',top:'hoodie',pants:'#56492f',shoe:'#c24a2a',acc:'beanie'}];
function hand(skin,side,p){const h=G(p);P(new THREE.BoxGeometry(.075,.085,.035),mt(skin,.6),0,-.04,0,h);
 const fg=new THREE.CapsuleGeometry(.0105,.04,3,6);for(let i=0;i<4;i++){const f=P(fg,mt(skin,.6),(i-1.5)*.019,-.105,.004,h);f.rotation.x=.25}
 const th=P(new THREE.CapsuleGeometry(.012,.035,3,6),mt(skin,.6),side*.045,-.055,.015,h);th.rotation.z=side*.6;h.userData.grip=G(h,0,-.11,.03);return h}
function arm(v,top,side,p){const sh=G(p,side*.215,1.38,0);const sleeve=top=='tee'?mt(v.skin,.6):top;
 P(new THREE.SphereGeometry(.07,12,8),top,0,0,0,sh);P(new THREE.CapsuleGeometry(.058,.2,4,10),v.top=='tee'?top:sleeve,0,-.14,0,sh);
 if(v.top=='tee')P(new THREE.CapsuleGeometry(.048,.12,4,10),mt(v.skin,.6),0,-.2,0,sh);
 const el=G(sh,0,-.28,0);P(new THREE.SphereGeometry(.05,10,8),v.top=='tee'?mt(v.skin,.6):top,0,0,0,el);
 P(new THREE.CapsuleGeometry(.047,.19,4,10),v.top=='tee'?mt(v.skin,.6):top,0,-.12,0,el);
 if(v.top!='tee')P(new THREE.CylinderGeometry(.05,.05,.03,10),top,0,-.22,0,el);
 const w=G(el,0,-.25,0);const h=hand(v.skin,side,w);return {sh,el,w,h}}
function leg(v,pants,side,p){const hip=G(p,side*.1,.9,0);P(new THREE.CapsuleGeometry(.082,.3,4,10),pants,0,-.2,0,hip);
 const kn=G(hip,0,-.42,0);P(new THREE.CapsuleGeometry(.072,.3,4,10),pants,0,-.2,0,kn);P(new THREE.CylinderGeometry(.078,.078,.03,10),pants,0,-.37,0,kn);
 const ft=G(kn,0,-.43,0);const sm=mt(v.shoe,.55);P(new THREE.BoxGeometry(.11,.08,.25),sm,0,-.02,.05,ft);P(new THREE.BoxGeometry(.115,.025,.26),mt('#f2f2f2',.7),0,-.06,.05,ft);
 P(new THREE.BoxGeometry(.06,.012,.06),mt('#ddd',.6),0,.025,.11,ft);return {hip,kn,ft}}
export function makeAvatar(color,idx=0){const v=VAR[idx%4],g=new THREE.Group();const top=v.top=='flannel'?cloth(color,false):cloth(color,false),pants=cloth(v.pants,true);
 const root=G(g),pel=G(root,0,0,0);
 // torso
 const chest=G(pel,0,0,0);const tor=P(new THREE.CapsuleGeometry(.2,.36,6,16),top,0,1.17,0,chest);tor.scale.set(1.08,1,.68);
 P(new THREE.CylinderGeometry(.19,.2,.12,16),pants,0,.95,0,pel).scale.z=.75;
 if(v.top=='hoodie'){const hood=P(new THREE.TorusGeometry(.13,.05,8,16),top,0,1.44,-.06,chest);hood.rotation.x=1.3;
  P(new THREE.BoxGeometry(.24,.1,.02),cloth(color,false),0,1.04,.145,chest);P(new THREE.BoxGeometry(.24,.004,.022),mt('#000',.9,{transparent:true,opacity:.25}),0,1.09,.147,chest);
  for(const s of[-1,1]){const st=P(new THREE.CylinderGeometry(.006,.006,.14,5),mt('#eee',.6),s*.04,1.32,.14,chest);st.rotation.x=-.1}
  P(new THREE.CylinderGeometry(.2,.19,.05,16),top,0,1.0,0,chest).scale.z=.72}
 if(v.top=='flannel'){for(let i=0;i<4;i++)P(new THREE.SphereGeometry(.009,6,4),mt('#222',.4),0,1.0+i*.09,.142,chest);P(new THREE.BoxGeometry(.006,.42,.004),mt('#000',.9,{transparent:true,opacity:.35}),0,1.17,.141,chest);
  for(const s of[-1,1]){P(new THREE.BoxGeometry(.08,.07,.01),top,s*.09,1.27,.142,chest);const col=P(new THREE.BoxGeometry(.09,.05,.02),top,s*.05,1.42,.1,chest);col.rotation.z=s*.5}}
 if(v.top=='tee'){P(new THREE.TorusGeometry(.075,.012,6,16),top,0,1.43,.02,chest).rotation.x=1.45;P(new THREE.CircleGeometry(.05,16),mt('#2e7d32',.7),0,1.25,.142,chest)}
 if(v.acc=='apron'){const ap=mt('#3f5a2a',.85);P(new THREE.BoxGeometry(.3,.48,.012),ap,0,1.1,.15,chest);P(new THREE.BoxGeometry(.2,.09,.016),ap,0,1.0,.158,chest);
  P(new THREE.BoxGeometry(.004,.09,.018),mt('#223318'),0,1.0,.16,chest);for(const s of[-1,1]){const t=P(new THREE.BoxGeometry(.02,.2,.01),ap,s*.1,1.38,.1,chest);t.rotation.x=-.3}}
 // belt + buckle + back pockets
 P(new THREE.CylinderGeometry(.2,.2,.035,16),mt('#3a2616',.5),0,.99,0,pel).scale.z=.74;P(new THREE.BoxGeometry(.045,.032,.01),mt('#c9a64a',.3,{metalness:.8}),0,.99,.15,pel);
 for(const s of[-1,1])P(new THREE.BoxGeometry(.08,.08,.01),pants,s*.09,.88,-.15,pel);
 // neck + head
 const nk=G(chest,0,1.45,0);P(new THREE.CylinderGeometry(.055,.065,.1,12),mt(v.skin,.6),0,.03,0,nk);
 const hd=G(nk,0,.15,0);const sk=mt(v.skin,.55);const sk2=mt(v.skin,.65);const skull=P(new THREE.SphereGeometry(.13,24,18),sk,0,0,0,hd);skull.scale.set(.92,1.05,1);
 P(new THREE.SphereGeometry(.085,16,10),sk,0,-.06,.03,hd).scale.set(1,.8,1);
 for(const s of[-1,1]){P(new THREE.SphereGeometry(.024,10,8),mt('#f5f5f0',.25),s*.042,.015,.105,hd);P(new THREE.SphereGeometry(.012,8,6),mt('#3d2a18',.2),s*.042,.015,.125,hd);
  P(new THREE.SphereGeometry(.005,6,4),mt('#fff',.1,{emissive:'#fff',emissiveIntensity:.3}),s*.038,.02,.135,hd);
  const br=P(new THREE.BoxGeometry(.045,.011,.012),mt(v.hair,.9),s*.044,.05,.118,hd);br.rotation.z=-s*.12;
  P(new THREE.SphereGeometry(.025,8,6),sk2,s*.12,0,0,hd).scale.set(.5,1,.8);
  P(new THREE.SphereGeometry(.018,8,6),mt('#e88a7a',.8,{transparent:true,opacity:.25}),s*.065,-.03,.1,hd)}
 P(new THREE.ConeGeometry(.02,.05,8),sk2,0,-.015,.13,hd).rotation.x=1.35;P(new THREE.SphereGeometry(.016,8,6),sk2,0,-.035,.13,hd);
 const mo=P(new THREE.TorusGeometry(.024,.006,6,12,Math.PI),mt('#8a3c38',.6),0,-.065,.11,hd);mo.rotation.z=Math.PI;
 const hm=mt(v.hair,.85);
 if(v.style!='buzz'||1){const cap=P(new THREE.SphereGeometry(.137,24,14,0,Math.PI*2,0,v.style=='buzz'?1.35:1.6),hm,0,.012,-.008,hd);cap.scale.set(.95,1.05,1.04);if(v.style=='buzz')cap.material=mt(v.hair,.95,{transparent:true,opacity:.85})}
 if(v.style=='short')for(let i=0;i<5;i++){const t=P(new THREE.SphereGeometry(.04,8,6),hm,(i-2)*.035,.1,.08,hd);t.scale.set(1,.6,1)}
 if(v.style=='bun')P(new THREE.SphereGeometry(.055,12,10),hm,0,.1,-.11,hd);
 if(v.style=='long'){P(new THREE.CapsuleGeometry(.1,.18,4,12),hm,0,-.1,-.06,hd).scale.set(1.25,1,.6)}
 if(v.acc=='cap'){const cm=mt(color,.7);P(new THREE.SphereGeometry(.142,20,10,0,Math.PI*2,0,1.3),cm,0,.02,0,hd);const b=P(new THREE.CylinderGeometry(.1,.1,.012,16,1,false,-Math.PI/2,Math.PI),cm,0,.05,.1,hd);b.rotation.x=.15}
 if(v.acc=='beanie'){const bm=cloth(color,false);P(new THREE.SphereGeometry(.143,20,10,0,Math.PI*2,0,1.25),bm,0,.03,0,hd);P(new THREE.TorusGeometry(.13,.02,8,20),bm,0,.06,0,hd).rotation.x=Math.PI/2;P(new THREE.SphereGeometry(.03,8,6),bm,0,.18,0,hd)}
 const L=arm(v,top,-1,chest),R=arm(v,top,1,chest),LL=leg(v,pants,-1,pel),RL=leg(v,pants,1,pel);
 // soft contact shadow
 const bl=new THREE.Mesh(new THREE.CircleGeometry(.35,24),new THREE.MeshBasicMaterial({color:'#000',transparent:true,opacity:.3,depthWrite:false}));bl.rotation.x=-Math.PI/2;bl.position.y=.01;g.add(bl);
 g.userData.rig={root,pel,chest,nk,hd,L,R,LL,RL,ph:Math.random()*6,t:0,spd:0,cr:0,pitch:0};
 // hold anchor must stay the LAST child of g (item attach code uses g.children.at(-1))
 const hold=new THREE.Group();g.add(hold);g.userData.hold=hold;return g}
// st: {spd (m/s), cr (0..1), pitch (rad), held (bool)}
export function animateAvatar(g,dt,st){const r=g.userData.rig;if(!r)return;const k=1-Math.exp(-dt*10);r.spd+=(st.spd-r.spd)*k;r.cr+=((st.cr||0)-r.cr)*k;r.pitch+=((st.pitch||0)-r.pitch)*k;r.t+=dt;
 const m=Math.min(r.spd/4,1.4);r.ph+=dt*(3+r.spd*2.2);const s=Math.sin(r.ph),c=Math.cos(r.ph),br=Math.sin(r.t*1.8)*.012,cr=r.cr;
 r.pel.position.y=-cr*.42+Math.abs(c)*.035*m+br*.3;
 r.chest.rotation.x=cr*.35+m*.06;r.LL.hip.rotation.x=s*.6*m-cr*1.35;r.RL.hip.rotation.x=-s*.6*m-cr*1.35;
 r.LL.kn.rotation.x=Math.max(0,-c)*.8*m+cr*2.3;r.RL.kn.rotation.x=Math.max(0,c)*.8*m+cr*2.3;r.LL.ft.rotation.x=-cr*.8;r.RL.ft.rotation.x=-cr*.8;
 r.L.sh.rotation.x=-s*.5*m+br;r.L.sh.rotation.z=-.08;r.L.el.rotation.x=-.25-m*.3;
 if(st.held){r.R.sh.rotation.x=-.9-r.pitch*.5;r.R.el.rotation.x=-.7;r.R.sh.rotation.z=.15}else{r.R.sh.rotation.x=s*.5*m-br;r.R.sh.rotation.z=.08;r.R.el.rotation.x=-.25-m*.3}
 r.hd.rotation.x=-r.pitch*.7-r.chest.rotation.x*.5;r.nk.rotation.x=-r.pitch*.25;
 // place hold anchor at right hand grip (world→g local)
 const h=g.userData.hold;g.updateMatrixWorld(true);const p=new THREE.Vector3();r.R.h.userData.grip.getWorldPosition(p);g.worldToLocal(p);h.position.copy(p);h.rotation.set(-r.pitch*.4,0,0)}
// First-person arms; returns group to add to camera. Item hand anchor is passed in and reparented.
export function makeFPArms(color,idx,itemHand){const v=VAR[idx%4],g=new THREE.Group(),top=cloth(color,false);
 const mk=(side)=>{const a=G(g,side*.34,-.26,-.2);a.rotation.set(1.4,side*-.12,side*.08);P(new THREE.CapsuleGeometry(.05,.34,4,12),v.top=='tee'?mt(v.skin,.6):top,0,-.2,0,a);
  if(v.top!='tee')P(new THREE.CylinderGeometry(.056,.056,.04,12),top,0,-.4,0,a);const w=G(a,0,-.44,0);P(new THREE.CapsuleGeometry(.04,.06,4,10),mt(v.skin,.6),0,.02,0,w);hand(v.skin,side,w);
  P(new THREE.BoxGeometry(.05,.012,.03),mt('#222',.4,{metalness:.5}),0,-.36,-.045,a).visible=side<0;return a};
 g.userData.L=mk(-1);g.userData.R=mk(1);g.traverse(o=>{if(o.isMesh)o.castShadow=false});return g}
export function animateFP(g,dt,bob,held,pour){const L=g.userData.L,R=g.userData.R;const b=Math.sin(bob*.5)*.012;
 L.position.y=-.3+b;R.position.y=-.26-b-(held?0:.06);R.rotation.z=.08+(pour?-.5:0)}
