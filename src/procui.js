// Section 3 C–F client: 3D props, prompts and minigame hooks for drying env, curing, storage, packaging, rosin, equipment.
import {STRAINS,SHOP,grade,prodQ} from './rules.js';import {STORE,PRODUCT,qcat,dryEnv,lvl,lvNext,PACKT} from './proc.js';import {packGame,pressGame} from './minigames.js';
let H,SH=0;addEventListener('keydown',e=>{if(e.key=='Shift')SH=1});addEventListener('keyup',e=>{if(e.key=='Shift')SH=0});export function procInit(h){H=h}
const sn=s=>STRAINS[s]?.name||s||'';
export function catTxt(type,d){if(!d)return'';const q=type=='trim'?d.q??50:prodQ(d),C=qcat(type,d);return `${C[0]} · ${grade(q)[0]}`}
export function procKey(e){const d=e.data||{};return (STORE[e.type]?'st'+(d.st||[]).length:'')+(e.type=='rack'&&d.env?'h'+d.env.h+'T'+d.env.T:'')+(e.type=='radio'?'r'+(d.on?1:0):'')+(e.type=='oilres'?'g'+Math.round(d.g||0):'')+(e.type=='packed'?'hm'+Math.round(Math.min(1.5,d.hm||0)*2)+(d.ct||''):'')+(e.type=='pkg'||e.type=='conc'?d.g+'|'+d.n+'|'+d.q+'|'+(d.cj||0)+(d.vac||0)+'|'+(d.lb||1):'')+(e.type=='packed'?'v'+(d.vac||0)+'l'+(d.lb||1):'')}
const EQ=['press','scale','vseal','lprint','mylar','jars','grove','cjars','trimmer','oilres','oilfill'];
const tabItems=()=>{const L=[];for(const t of H.W().ents)if(!t.by&&Array.isArray(t.data?.items)){const c=Math.cos(t.ry||0),s=Math.sin(t.ry||0);t.data.items.forEach((it,i)=>{if(it&&EQ.includes(it.type))L.push({id:t.id,sub:i,type:it.type,data:it.data,x:t.x+it.x*c+it.z*s,z:t.z-it.x*s+it.z*c,by:0})})}return L};
const dd=(a,e)=>Math.hypot(a.x-e.x,a.z-e.z);
const near=(t,e,r=3)=>[...H.W().ents,...tabItems()].filter(o=>o.type==t&&!o.by&&dd(o,e)<r).sort((a,b)=>dd(a,e)-dd(b,e))[0];
const packBox=e=>['jars','grove','mylar'].map(k=>near(k,e,3)).filter(Boolean).sort((a,b)=>dd(a,e)-dd(b,e))[0]||near('jars',e,60)||near('grove',e,60)||near('mylar',e,60)||null;
// equipment sitting on a table/desk that the player is aiming at
export function subAim(t){const e=t?.e;if(!e||!Array.isArray(e.data?.items)||!e.data.items.length||!H.surfAim)return null;const a=H.surfAim(e);if(!a)return null;let b=null,bd=.32;
 e.data.items.forEach((it,i)=>{if(!it||!EQ.includes(it.type))return;const d=Math.hypot(it.x-a.lx,it.z-a.lz);if(d<bd){bd=d;b={i,it}}});if(!b)return null;const c=Math.cos(e.ry||0),s=Math.sin(e.ry||0);
 return {id:e.id,sub:b.i,type:b.it.type,data:b.it.data,x:e.x+b.it.x*c+b.it.z*s,z:e.z-b.it.x*s+b.it.z*c,by:0}}
export function procRule(c,e){const ct=c.type,S=STORE[e.type];
 if(S){if(!PRODUCT.includes(ct))return null;if(S.only&&!S.only.includes(ct))return'';return (e.data.st||[]).length>=S.n?'':'Store '+H.NAME(ct)+` in ${SHOP[e.type].n} (${(e.data.st||[]).length}/${S.n})`}
 if((e.type=='scale'||e.type=='press')&&ct=='conc')return near('cjars',e,60)?(c.data.g>=1?'Fill 1g concentrate jars ('+Math.floor(c.data.g+1e-6)+'×)':'Need 1g+ of rosin to fill a jar'):e.type=='scale'&&near('mylar',e,60)?'Package rosin (minigame)':'Place Concentrate Jars next to the '+(e.type=='press'?'press':'scale');
 if(e.type=='oilres')return ct=='conc'?'Pour rosin into reservoir':'';
 if(e.type=='scale'&&ct=='packed')return near('mylar',e,60)?'Package bud into Mylar bags (minigame)':'Place Mylar Bags by the scale to package';
 if(e.type=='press'&&(ct=='drybud'||ct=='trim'))return 'Press '+(ct=='trim'?'trim':'bud')+' into rosin (minigame)';
 if(e.type=='vseal')return ct=='pkg'?(c.data.cj?'Concentrate jars need no sealing':c.data.vac?'Already vacuum sealed':'Vacuum seal Mylar bag'):ct=='packed'&&c.data.ct=='grove'?(c.data.vac?'Already vacuum sealed':'Vacuum seal grove bag'):'';
 if(e.type=='lprint')return ['pkg','packed','conc'].includes(ct)?(c.data.lb==2?'Already labeled':'Print & apply label'):'';
 if(e.type=='trimmer')return (ct=='drybud'||ct=='wetbud')?(c.data.tr?'Already trimmed':'Load '+(ct=='wetbud'?'wet':'dried')+' bud into Trim Machine (auto-trim)'):'Hold dried or wet bud to use the Trim Machine';
 if(e.type=='scale'&&ct=='drybud'){const b=packBox(e);return !b?'Place a Jar Box, Grove Bags or Mylar Bags near the scale':b.type=='mylar'?'Package bud into Mylar bags (minigame)':'Weigh & pack into '+(b.type=='grove'?'grove bag':'glass jar')}
 return undefined}
const MOVE=['oilres','oilfill','cjars','fan','dehum','grove','jars','ccab','sbin','stash','scale','press','hbin','mylar','vseal','lprint','trimmer','shears','radio'];
export function procPrompt(c,t,only){let e=t?.e;if(!e)return undefined;if(c&&!only){const v=subAim(t);if(v){const r=procRule(c,v);if(r)return r}}const S=STORE[e.type];
 if(e.type=='radio'&&!c&&!only){const d=e.data||{},ST=['Lo-Fi Greenhouse','Roots & Dub FM','Neon Synthwave','Ambient Garden','Funky Harvest'],pm=H.pad?.();return (d.on?'Turn radio off':'Turn radio on')+` · 📻 ${ST[(d.st||0)%5]} ${Math.round((d.vol??.6)*100)}%`+(pm?' · RT station · ◀ ▶ volume':' · R station · [ ] volume')}
 if(only&&!c&&MOVE.includes(e.type)&&!(e.type=='hbin'&&(e.data.br||[]).length)){const n=(e.data.st||[]).length;return H.bag().length<3?'Pick up '+(SHOP[e.type]?.n||H.NAME(e.type,e.data))+(n?` (${n} inside stay stored)`:''):'Hands full'}
 if(e.type=='oilres')return only?undefined:c?.type=='conc'?`Pour ${c.data.g}g rosin into reservoir`:`🛢 Oil Reservoir · ${Math.round((e.data.g||0)*10)/10}g pooled`;
 if(e.type=='oilfill'&&!c&&!only){const r=near('oilres',e,3);return r?`Fill 1g rosin jar · pool ${Math.round((r.data.g||0)*10)/10}g (Shift+use = batch 10)`:'Oil Filler — place an Oil Reservoir within 3 m'}
 if(S&&!c&&!only){const L=e.data.st||[];return L.length?`Take ${L.at(-1).type=='pkg'?'retail pack':H.NAME(L.at(-1).type)} · ${SHOP[e.type].n} ${L.length}/${S.n}`:`${SHOP[e.type].n} — empty (hold product to store)`}
 if(e.type=='rack'&&!c&&e.data.env&&!only&&!(e.data.slots||[]).length){const v=e.data.env;return `Drying rack · ${v.h}% RH · ${v.T}°C · speed ×${v.sp}${v.dq>0?' · ideal':v.dq<0?' · too humid/hot':''}`}
 return undefined}
// returns true if handled
export function procInteract(c,t,only){if(only)return false;const W=H.W();
 {const v=subAim(t),e=v&&(v.type=='oilfill'||v.type=='oilres')?v:t?.e;if(e&&!c&&e.type=='oilfill'){const sub=e.sub!=null?{sub:e.sub}:{};H.send({t:'use',target:e.id,...sub,batch:SH?1:0});return true}}
 if(c?.type=='packed'&&!t&&c.data.ct!='grove'&&(c.data.cure||0)<1){H.send({t:'burp'});H.sfx('ui');return true}
 let e=t?.e;if(!e||!c)return false;const v=subAim(t);if(v&&procRule(c,v))e=v;const sub=e.sub!=null?{sub:e.sub}:{};
 if(c.type=='conc'&&(e.type=='scale'||e.type=='press')&&near('cjars',e,60)){H.send({t:'use',target:e.id,...sub});H.sfx('ui');return true}
 if(e.type=='scale'&&(c.type=='packed'||c.type=='conc'||c.type=='drybud'&&packBox(e)?.type=='mylar')&&near('mylar',e,60)){return packGame(c,{id:e.id,...sub,dg:!!e.data.dg,vac:!!near('vseal',e),pr:!!near('lprint',e)},H.send,H.sfx)||false}
 if(e.type=='press'&&(c.type=='drybud'||c.type=='trim')){pressGame(c,{id:e.id,...sub,hy:!!e.data.hy},H.send,H.sfx);return true}
 if(e.sub!=null&&procRule(c,e)){H.send({t:'use',target:e.id,sub:e.sub});H.sfx('ui');return true}
 return false}
export function procHold(c){if(!c)return'';const d=c.data||{};let s='';
 if(c.type=='packed'){s=` · ${qcat('packed',d)[0]}`;if(d.ct=='grove')s+=' · grove bag';else if((d.cure||0)<1)s+=(d.hm||0)>=1.4?' · 💧 OVERDUE burp (V, or A/E aiming at nothing)':(d.hm||0)>=.5?' · 💧 ready to burp (V, or A/E aiming at nothing)':' · sealed'}
 if(c.type=='pkg')s=` · ${d.n}× ${d.g}g ${d.cc?'rosin':''} · ${catTxt('pkg',d)}`;if(c.type=='conc')s=` · ${d.g}g rosin · ${catTxt('conc',d)}`;if(c.type=='trim')s=' · Trim';if(c.type=='drybud'&&d.q!=null)s=` · ${qcat('drybud',d)[0]}`;return s}
export function lvlTxt(W){const l=lvl(W),n=lvNext(W);return `Lv ${l}${n?` · $${W.earned||0}/${n}`:''}`}
// ---------- 3D props ----------
function pkgTex(d,type){return H.lbl('pk'+d.s+d.g+d.q+d.lb+d.day+type,(x,w,h)=>{const C=qcat(type,d);x.fillStyle=d.lb==2?'#fff':'#f4ecd8';x.fillRect(0,0,w,h);x.fillStyle=C[0]=='Top Shelf'?'#c8a020':C[0]=='Mid'?'#3a7a4a':C[0]=='Trim'?'#888':'#7a5a3a';x.fillRect(0,0,w,42);
 x.fillStyle='#fff';x.font='bold 26px sans-serif';x.textAlign='center';x.fillText(C[0].toUpperCase(),w/2,31);x.fillStyle='#222';x.font='bold 28px sans-serif';x.fillText(sn(d.s).slice(0,14),w/2,80);x.font='bold 34px sans-serif';x.fillText(d.g+'g'+(type=='conc'||d.cc?' ROSIN':''),w/2,122);
 x.font='22px sans-serif';x.fillText('Grade '+grade(type=='conc'?d.q:prodQ(d))[0]+' · Day '+(d.day??H.W()?.day??1),w/2,160);if(d.lb==2){x.fillStyle='#000';for(let i=0;i<30;i++)x.fillRect(40+i*6,180,i%3?2:4,40)}},256,256)}
export function procProp(g,e){const {THREE,mat,box,cyl,at,glass}=H,t=e.type,d=e.data||{};
 if(t=='radio'){const on=!!d.on;g.add(at(box(.46,.24,.13,'#2b2d33'),0,.12,0));for(const sx of [-.14,.14]){const sp=at(cyl(.075,.075,.02,'#111',20),sx,.12,.066);sp.rotation.x=Math.PI/2;g.add(sp);const cn=at(cyl(.03,.03,.022,'#555',12),sx,.12,.07);cn.rotation.x=Math.PI/2;g.add(cn)}
  g.add(at(box(.12,.05,.005,on?'#7dff9a':'#1d3a24'),0,.2,.067));const hd=new THREE.Mesh(new THREE.TorusGeometry(.17,.012,6,16,Math.PI),mat('#888'));hd.position.y=.24;g.add(hd);const an=at(cyl(.004,.004,.3,'#bbb'),.18,.38,-.04);an.rotation.z=-.3;g.add(an);if(on){const l=new THREE.PointLight('#7dff9a',.25,.8);l.position.set(0,.2,.12);g.add(l)}return true}
 if(t=='fan'){g.add(at(cyl(.12,.14,.04,'#2a2a2a'),0,.02,0),at(cyl(.02,.02,.3,'#555'),0,.17,0));const r=new THREE.Mesh(new THREE.TorusGeometry(.2,.012,8,24),mat('#ddd'));r.position.y=.42;g.add(r);for(let i=0;i<3;i++){const b=box(.06,.17,.01,'#9ac');b.position.set(Math.cos(i*2.1)*.08,.42+Math.sin(i*2.1)*.08,0);b.rotation.z=i*2.1+1.57;g.add(b)}return true}
 if(t=='dehum'){g.add(at(H.rbox(.36,.6,.26,'#e8ecef'),0,.3,0),at(box(.26,.08,.01,'#333'),0,.5,.131),at(box(.3,.18,.01,'#888'),0,.18,.131),at(box(.06,.03,.01,'#3aff6a'),.08,.5,.137));return true}
 if(t=='grove'){g.add(at(box(.34,.2,.24,'#2a3a2a'),0,.1,0));for(let i=0;i<3;i++)g.add(at(box(.09,.16,.02,'#1a2e20'),-.1+i*.1,.28,0));g.add(at(box(.3,.06,.01,'#8ad06a'),0,.12,.121));return true}
 if(t=='ccab'){g.add(at(H.rbox(.6,1.1,.45,'#5a3a22'),0,.55,0),at(box(.5,.9,.01,'#cfe8ff',{transparent:true,opacity:.35}),0,.58,.226),at(box(.12,.05,.01,'#111'),.18,1.02,.23),at(box(.06,.025,.005,'#3aff6a'),.18,1.02,.235));
  const n=(d.st||[]).length;for(let i=0;i<Math.min(8,n);i++)g.add(at(new THREE.Mesh(H.JARG,glass),-.18+(i%4)*.12,.2+Math.floor(i/4)*.45,0));for(const y of [.15,.6])g.add(at(box(.54,.02,.38,'#7a5434'),0,y,0));return true}
 if(t=='oilres'){g.add(at(cyl(.11,.11,.3,'#9aa0a8',16),0,.15,0),at(cyl(.1,.1,Math.min(.27,.02+(d.g||0)/200),'#d89a20',16),0,.02+Math.min(.27,.02+(d.g||0)/200)/2,0),at(H.box(.18,.002,.06,mat('#fff',{map:H.lbl('or'+Math.round(d.g||0),(x,w,h)=>{x.fillStyle='#111';x.fillRect(0,0,w,h);x.fillStyle='#ffb020';x.font='bold 40px sans-serif';x.textAlign='center';x.fillText(Math.round((d.g||0)*10)/10+'g',w/2,46)},128,64)})),0,.31,0));return true}
 if(t=='oilfill'){g.add(at(box(.3,.36,.26,'#2a5a8a'),0,.18,0),at(box(.12,.06,.12,'#ccc'),0,.42,0),at(cyl(.015,.015,.08,'#aaa'),0,.3,.14),at(box(.14,.02,.1,'#333'),0,.05,.16),at(box(.1,.05,.005,'#3aff6a'),.08,.3,.131));return true}
 if(t=='sbin'){g.add(at(box(.6,.32,.4,'#3a4a5a',{transparent:true,opacity:.85}),0,.16,0),at(box(.62,.04,.42,'#2a6ad0'),0,.34,0));const n=(d.st||[]).length;for(let i=0;i<Math.min(6,n);i++)g.add(at(box(.1,.12,.02,'#c8b070'),-.2+i*.08,.12,0));return true}
 if(t=='stash'){g.add(at(H.rbox(.8,1.2,.45,'#2e2e32'),0,.6,0),at(box(.36,1.1,.01,'#3a3a40'),-.19,.6,.226),at(box(.36,1.1,.01,'#3a3a40'),.19,.6,.226),at(box(.02,.16,.02,'#aaa'),-.03,.7,.24),at(box(.02,.16,.02,'#aaa'),.03,.7,.24),at(box(.1,.06,.01,'#111'),0,.95,.235));return true}
 if(t=='mylar'){g.add(at(box(.3,.16,.22,'#1a1a1a'),0,.08,0),at(box(.24,.06,.01,'#c0c0c8'),0,.1,.111));for(let i=0;i<3;i++)g.add(at(box(.08,.12,.01,'#b8bcc4'),-.08+i*.08,.2,0));return true}
// filled pouch: box subdivided then puffed (pillow) — used for Mylar and Grove bags
function pouch(w,h,d,m,puff=1,bump=0){const {THREE}=H,G=new THREE.BoxGeometry(w,h,d,10,12,3),P=G.attributes.position;for(let i=0;i<P.count;i++){const x=P.getX(i)/(w/2),y=P.getY(i)/(h/2),z=P.getZ(i);
  const top=y>.78?Math.max(0,1-(y-.78)/.22):1,f=Math.max(.04,(1-x*x*.85)*(1-Math.pow(Math.max(0,y),6))*top*puff);let nz=z*f*(1+(bump?Math.sin(x*9+y*7)*Math.cos(y*11)*bump:0));
  const bx=y<-.82?1+(-.82-y)*.4:1;P.setXYZ(i,P.getX(i)*bx,P.getY(i),nz)}G.computeVertexNormals();const o=new THREE.Mesh(G,m);o.castShadow=true;return o}
function crimp(w,c){return H.lbl('crimp'+c,(x,W,Hh)=>{x.fillStyle=c;x.fillRect(0,0,W,Hh);x.fillStyle='rgba(0,0,0,.35)';for(let i=0;i<W;i+=6)x.fillRect(i,0,2,Hh)},128,16)}
function bagTex(d,kind){return H.lbl('bag'+kind+d.s+d.g+(d.n||1)+d.q+(d.lb||1)+(d.vac||0)+Math.round((d.cure||0)*10),(x,w,h)=>{const C=qcat(kind=='grove'?'packed':'pkg',d),pr=d.lb==2;
  if(kind=='grove'){x.fillStyle='#e9e2cf';x.fillRect(0,0,w,h);x.fillStyle='#2f6b3a';x.fillRect(0,0,w,56);x.fillStyle='#fff';x.font='bold 30px sans-serif';x.textAlign='center';x.fillText('GROVE BAG',w/2,38);x.fillStyle='#2f6b3a';x.font='bold 14px sans-serif';x.fillText('TERPLOC® CURING',w/2,76);
   x.fillStyle='#222';x.font='bold 30px sans-serif';x.fillText(sn(d.s).slice(0,13),w/2,118);x.font='bold 36px sans-serif';x.fillText(d.g+'g',w/2,160);x.font='20px sans-serif';x.fillText(`Grade ${grade(prodQ(d))[0]} · cure ${Math.round((d.cure||0)*100)}%`,w/2,196);if(d.vac){x.fillStyle='#2a7aff';x.fillText('VACUUM SEALED',w/2,226)}return}
  x.fillStyle=pr?'#ffffff':'#f4ecd8';x.fillRect(0,0,w,h);x.fillStyle=C[0]=='Top Shelf'?'#c8a020':C[0]=='Mid'?'#3a7a4a':C[0]=='Trim'?'#888':'#7a5a3a';x.fillRect(0,0,w,46);x.fillStyle='#fff';x.textAlign='center';x.font='bold 26px sans-serif';x.fillText(C[0].toUpperCase(),w/2,33);
  x.fillStyle='#222';x.font=(pr?'bold 30px sans-serif':'italic bold 28px cursive');x.fillText(sn(d.s).slice(0,13),w/2,88);x.font='bold 40px sans-serif';x.fillText((d.n>1?d.n+'× ':'')+d.g+'g',w/2,138);x.font='20px sans-serif';x.fillText('Grade '+grade(prodQ(d))[0]+' · Day '+(d.day??1),w/2,172);
  if(pr){x.fillStyle='#000';for(let i=0;i<34;i++)x.fillRect(44+i*5,190,i%3?2:4,40);x.font='12px monospace';x.fillText('BT-'+String(d.s).toUpperCase()+'-'+(d.day??1),w/2,246)}else{x.strokeStyle='#999';x.strokeRect(20,186,w-40,50)}})}
function cjarTex(d){return H.lbl('cj'+d.s+d.q+(d.lb||1),(x,w,h)=>{const pr=d.lb==2;x.fillStyle=pr?'#fff':'#f6efdc';x.fillRect(0,0,w,h);x.fillStyle='#e8a020';x.fillRect(0,0,w,22);x.fillStyle='#fff';x.font='bold 16px sans-serif';x.textAlign='center';x.fillText('LIVE ROSIN',w/2,17);
  x.fillStyle='#222';x.font=pr?'bold 20px sans-serif':'italic bold 19px cursive';x.fillText(sn(d.s).slice(0,14),w/2,46);x.font='bold 22px sans-serif';x.fillText('1.0 g · '+grade(d.q??60)[0],w/2,72);if(pr){x.fillStyle='#000';for(let i=0;i<24;i++)x.fillRect(70+i*5,82,i%3?2:3,12)}},256,100)}
// detailed 1 g concentrate jar: thick glass, amber rosin inside, ribbed black lid, wrap label
function cjar(g,d,x0,z0){const {THREE,mat,cyl,at,glass}=H,o=new THREE.Group();const R=.034,Hh=.042;
 const gl=new THREE.Mesh(new THREE.CylinderGeometry(R,R*.97,Hh,28,1,true),glass);gl.position.y=Hh/2+.006;o.add(gl);o.add(at(cyl(R*.97,R*.97,.008,mat('#e8f6ff',{transparent:true,opacity:.55,roughness:.05}),28),0,.004,0));
 const oil=mat('#d88a12',{transparent:true,opacity:.92,roughness:.12,metalness:.05,emissive:'#5a2a00',emissiveIntensity:.35});o.add(at(cyl(R*.9,R*.9,.012,oil,28),0,.014,0));const men=new THREE.Mesh(new THREE.SphereGeometry(R*.9,20,8,0,Math.PI*2,0,.5),oil);men.scale.y=.25;men.position.y=.019;o.add(men);
 const lid=mat(d.cj==2?'#2a2a2a':'#151515',{roughness:.45});o.add(at(cyl(R*1.04,R*1.04,.016,lid,28),0,Hh+.014,0),at(cyl(R*.98,R*1.04,.004,lid,28),0,Hh+.024,0));for(let i=0;i<18;i++){const r=at(H.box(.003,.014,.004,lid),Math.cos(i/18*6.283)*R*1.05,Hh+.014,Math.sin(i/18*6.283)*R*1.05);r.rotation.y=-i/18*6.283;o.add(r)}
 const lb=new THREE.Mesh(new THREE.CylinderGeometry(R*1.006,R*1.006,.022,28,1,true,-1.4,2.8),mat('#fff',{map:cjarTex(d),transparent:true}));lb.position.y=.03;o.add(lb);o.position.set(x0,0,z0);g.add(o)}
 if(t=='pkg'){if(d.cj){const n=Math.min(3,d.n||1);for(let i=0;i<n;i++)cjar(g,d,(i-(n-1)/2)*.075,i%2?.03:0);return true}
  const vac=!!d.vac,m=mat(vac?'#1e2024':'#2b2f36',{metalness:.75,roughness:vac?.45:.28}),W=.17,Hh=.23;const b=pouch(W,Hh,.07,m,vac?.62:1,vac?.06:0);b.position.y=Hh/2;g.add(b);
  const sm=mat('#fff',{map:crimp(W,vac?'#33363c':'#4a4f58'),metalness:.6,roughness:.35});g.add(at(H.box(W,.022,.006,sm),0,Hh-.012,0),at(H.box(W*.96,.004,.012,'#111'),0,Hh-.045,0));
  const hole=at(H.cyl(.008,.008,.008,'#0a0a0a',12),0,Hh-.012,0);hole.rotation.x=Math.PI/2;g.add(hole);g.add(at(H.box(.012,.012,.008,'#0a0a0a'),W/2-.004,Hh-.06,0));
  const f=new THREE.Mesh(new THREE.PlaneGeometry(.12,.12),mat('#fff',{map:bagTex(d,'pkg'),roughness:.6}));f.position.set(0,Hh*.44,.036*(vac?.62:1)+.002);g.add(f);const bk=f.clone();bk.rotation.y=Math.PI;bk.position.z*=-1;g.add(bk);return true}
 if(t=='packed'&&d.ct=='grove'){const m=mat('#4a5246',{roughness:.85}),W=.19,Hh=.25;const b=pouch(W,Hh,.08,m,d.vac?.7:1,.04);b.position.y=Hh/2;g.add(b);
  const win=new THREE.Mesh(new THREE.PlaneGeometry(.07,.05),mat('#6a8a3a',{roughness:.9}));win.position.set(0,Hh*.18,.041);g.add(win);g.add(at(H.box(.076,.056,.002,mat('#fff',{transparent:true,opacity:.25,roughness:.05})),0,Hh*.18,.043));
  g.add(at(H.box(W,.02,.006,mat('#fff',{map:crimp(W,'#3a4236')})),0,Hh-.01,0),at(H.box(W*.96,.004,.011,'#1a1a1a'),0,Hh-.04,0));
  const f=new THREE.Mesh(new THREE.PlaneGeometry(.13,.12),mat('#fff',{map:bagTex(d,'grove')}));f.position.set(0,Hh*.6,.041);g.add(f);return true}
 if(t=='conc'){const p=new THREE.Mesh(new THREE.PlaneGeometry(.2,.16),mat('#f3ead2',{roughness:.9,side:THREE.DoubleSide}));p.rotation.x=-Math.PI/2;p.position.y=.003;g.add(p);
  const oil=mat('#d88a12',{transparent:true,opacity:.9,roughness:.1,emissive:'#5a2a00',emissiveIntensity:.35});const pk=new THREE.Mesh(new THREE.SphereGeometry(.055,24,10,0,Math.PI*2,0,Math.PI/2),oil);pk.scale.set(1,.12,.8);pk.position.y=.004;g.add(pk);return true}
 if(t=='cjars'){g.add(at(H.box(.24,.1,.16,'#c8a070'),0,.05,0),at(H.box(.2,.002,.12,mat('#fff',{map:H.lbl('cjbox',(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);x.fillStyle='#e8a020';x.font='bold 30px sans-serif';x.textAlign='center';x.fillText('1g JARS ×10',w/2,h/2+10)},256,96)})),0,.101,0));
  for(let i=0;i<3;i++)cjar(g,{s:'',q:0,cj:2},-.07+i*.07,0);g.children.slice(-3).forEach(o=>o.position.y=.1);return true}
 if(t=='vseal'){g.add(at(H.rbox(.42,.08,.16,'#222'),0,.04,0),at(box(.38,.02,.1,'#555'),0,.085,0),at(box(.05,.015,.01,'#3aff6a'),.15,.06,.081));return true}
 if(t=='lprint'){g.add(at(H.rbox(.2,.14,.22,'#f2f2f2'),0,.07,0),at(box(.12,.01,.08,'#fff8ea'),0,.12,.12),at(box(.04,.02,.01,'#2a7aff'),.06,.1,.111));return true}
 if(t=='trimmer'){g.add(at(cyl(.3,.26,.25,'#c8ccd0',20),0,.25,0),at(cyl(.32,.32,.03,'#888',20),0,.38,0),at(box(.16,.1,.1,'#333'),.3,.2,0),at(box(.05,.5,.05,'#555'),-.25,.12,-.2),at(box(.05,.5,.05,'#555'),.25,.12,-.2));return true}
 if(t=='press'){const hy=d.hy;g.add(at(box(.36,.04,.3,'#333'),0,.02,0),at(box(.04,hy?.7:.5,.04,'#555'),-.15,hy?.35:.25,0),at(box(.04,hy?.7:.5,.04,'#555'),.15,hy?.35:.25,0),at(box(.36,.06,.3,'#444'),0,hy?.68:.48,0),at(box(.22,.04,.18,'#d03a2a'),0,.12,0),at(box(.22,.04,.18,'#d03a2a'),0,.2,0));
  if(hy)g.add(at(cyl(.06,.06,.3,'#2a6ad0'),0,.5,0),at(box(.1,.08,.01,'#111'),.12,.6,.15));else{const hd=at(cyl(.015,.015,.4,'#aaa'),.25,.5,0);hd.rotation.z=1.57;g.add(hd)};return true}
 if(t=='rack'&&d.env){const v=d.env,m=H.lbl('hyg'+v.h+v.T,(x,w,h)=>{x.fillStyle='#0e1a14';x.fillRect(0,0,w,h);x.fillStyle=v.dq>0?'#7dff9a':v.dq<0?'#ff8a5a':'#fff';x.font='bold 54px monospace';x.textAlign='center';x.fillText(v.h+'%',w/2,62);x.font='bold 40px monospace';x.fillText(v.T+'°C',w/2,112)},128,128);
  const p=new THREE.Mesh(new THREE.PlaneGeometry(.12,.12),mat('#fff',{map:m,emissive:'#fff',emissiveMap:m,emissiveIntensity:.5}));p.position.set(0,1.3,.2);p.name='hyg';g.add(p);return false}
 return false}
