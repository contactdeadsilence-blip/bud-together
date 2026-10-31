// Section 3 C–F client: 3D props, prompts and minigame hooks for drying env, curing, storage, packaging, rosin, equipment.
import {STRAINS,SHOP,grade,prodQ} from './rules.js';import {STORE,PRODUCT,qcat,dryEnv,lvl,lvNext,PACKT} from './proc.js';import {packGame,pressGame} from './minigames.js';
let H;export function procInit(h){H=h}
const sn=s=>STRAINS[s]?.name||s||'';
export function catTxt(type,d){if(!d)return'';const q=type=='trim'?d.q??50:prodQ(d),C=qcat(type,d);return `${C[0]} · ${grade(q)[0]}`}
export function procKey(e){const d=e.data||{};return (STORE[e.type]?'st'+(d.st||[]).length:'')+(e.type=='rack'&&d.env?'h'+d.env.h+'T'+d.env.T:'')+(e.type=='packed'?'hm'+Math.round(Math.min(1.5,d.hm||0)*2)+(d.ct||''):'')+(e.type=='pkg'||e.type=='conc'?d.g+'|'+d.n+'|'+d.q:'')}
const near=(t,e,r=3)=>H.W().ents.find(o=>o.type==t&&!o.by&&Math.hypot(o.x-e.x,o.z-e.z)<r);
export function procRule(c,e){const ct=c.type,S=STORE[e.type];
 if(S){if(!PRODUCT.includes(ct))return null;if(S.only&&!S.only.includes(ct))return'';return (e.data.st||[]).length>=S.n?'':'Store '+H.NAME(ct)+` in ${SHOP[e.type].n} (${(e.data.st||[]).length}/${S.n})`}
 if(e.type=='scale'&&(ct=='packed'||ct=='conc'))return near('mylar',e)?'Package '+(ct=='conc'?'rosin':'bud')+' (minigame)':'Place Mylar Bags by the scale to package';
 if(e.type=='press'&&(ct=='drybud'||ct=='trim'))return 'Press '+(ct=='trim'?'trim':'bud')+' into rosin (minigame)';
 if(e.type=='scale'&&ct=='drybud')return 'Weigh & pack into '+(near('grove',e,60)&&!near('jars',e,60)?'grove bag':'curing container');
 return undefined}
const MOVE=['fan','dehum','grove','jars','ccab','sbin','stash','scale','press','hbin','mylar','vseal','lprint','trimmer','shears'];
export function procPrompt(c,t,only){const e=t?.e;if(!e)return undefined;const S=STORE[e.type];
 if(only&&!c&&MOVE.includes(e.type)&&!(e.type=='hbin'&&(e.data.br||[]).length)){const n=(e.data.st||[]).length;return H.bag().length<3?'Pick up '+(SHOP[e.type]?.n||H.NAME(e.type))+(n?` (${n} inside stay stored)`:''):'Hands full'}
 if(S&&!c&&!only){const L=e.data.st||[];return L.length?`Take ${L.at(-1).type=='pkg'?'retail pack':H.NAME(L.at(-1).type)} · ${SHOP[e.type].n} ${L.length}/${S.n}`:`${SHOP[e.type].n} — empty (hold product to store)`}
 if(e.type=='rack'&&!c&&e.data.env&&!only&&!(e.data.slots||[]).length){const v=e.data.env;return `Drying rack · ${v.h}% RH · ${v.T}°C · speed ×${v.sp}${v.dq>0?' · ideal':v.dq<0?' · too humid/hot':''}`}
 return undefined}
// returns true if handled
export function procInteract(c,t,only){if(only)return false;const W=H.W();
 if(c?.type=='packed'&&!t&&c.data.ct!='grove'&&(c.data.cure||0)<1){H.send({t:'burp'});H.sfx('ui');return true}
 const e=t?.e;if(!e||!c)return false;
 if(e.type=='scale'&&(c.type=='packed'||c.type=='conc')&&near('mylar',e)){return packGame(c,{id:e.id,dg:!!e.data.dg,vac:!!near('vseal',e),pr:!!near('lprint',e)},H.send,H.sfx)||false}
 if(e.type=='press'&&(c.type=='drybud'||c.type=='trim')){pressGame(c,{id:e.id,hy:!!e.data.hy},H.send,H.sfx);return true}
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
 if(t=='fan'){g.add(at(cyl(.12,.14,.04,'#2a2a2a'),0,.02,0),at(cyl(.02,.02,.3,'#555'),0,.17,0));const r=new THREE.Mesh(new THREE.TorusGeometry(.2,.012,8,24),mat('#ddd'));r.position.y=.42;g.add(r);for(let i=0;i<3;i++){const b=box(.06,.17,.01,'#9ac');b.position.set(Math.cos(i*2.1)*.08,.42+Math.sin(i*2.1)*.08,0);b.rotation.z=i*2.1+1.57;g.add(b)}return true}
 if(t=='dehum'){g.add(at(H.rbox(.36,.6,.26,'#e8ecef'),0,.3,0),at(box(.26,.08,.01,'#333'),0,.5,.131),at(box(.3,.18,.01,'#888'),0,.18,.131),at(box(.06,.03,.01,'#3aff6a'),.08,.5,.137));return true}
 if(t=='grove'){g.add(at(box(.34,.2,.24,'#2a3a2a'),0,.1,0));for(let i=0;i<3;i++)g.add(at(box(.09,.16,.02,'#1a2e20'),-.1+i*.1,.28,0));g.add(at(box(.3,.06,.01,'#8ad06a'),0,.12,.121));return true}
 if(t=='ccab'){g.add(at(H.rbox(.6,1.1,.45,'#5a3a22'),0,.55,0),at(box(.5,.9,.01,'#cfe8ff',{transparent:true,opacity:.35}),0,.58,.226),at(box(.12,.05,.01,'#111'),.18,1.02,.23),at(box(.06,.025,.005,'#3aff6a'),.18,1.02,.235));
  const n=(d.st||[]).length;for(let i=0;i<Math.min(8,n);i++)g.add(at(new THREE.Mesh(H.JARG,glass),-.18+(i%4)*.12,.2+Math.floor(i/4)*.45,0));for(const y of [.15,.6])g.add(at(box(.54,.02,.38,'#7a5434'),0,y,0));return true}
 if(t=='sbin'){g.add(at(box(.6,.32,.4,'#3a4a5a',{transparent:true,opacity:.85}),0,.16,0),at(box(.62,.04,.42,'#2a6ad0'),0,.34,0));const n=(d.st||[]).length;for(let i=0;i<Math.min(6,n);i++)g.add(at(box(.1,.12,.02,'#c8b070'),-.2+i*.08,.12,0));return true}
 if(t=='stash'){g.add(at(H.rbox(.8,1.2,.45,'#2e2e32'),0,.6,0),at(box(.36,1.1,.01,'#3a3a40'),-.19,.6,.226),at(box(.36,1.1,.01,'#3a3a40'),.19,.6,.226),at(box(.02,.16,.02,'#aaa'),-.03,.7,.24),at(box(.02,.16,.02,'#aaa'),.03,.7,.24),at(box(.1,.06,.01,'#111'),0,.95,.235));return true}
 if(t=='mylar'){g.add(at(box(.3,.16,.22,'#1a1a1a'),0,.08,0),at(box(.24,.06,.01,'#c0c0c8'),0,.1,.111));for(let i=0;i<3;i++)g.add(at(box(.08,.12,.01,'#b8bcc4'),-.08+i*.08,.2,0));return true}
 if(t=='pkg'){const m=mat('#fff',{map:pkgTex(d,'pkg')});const b=box(.16,.2,.03,d.vac?'#202024':'#9aa0a8');b.position.y=.1;g.add(b);const f=new THREE.Mesh(new THREE.PlaneGeometry(.13,.13),m);f.position.set(0,.1,.016);g.add(f);return true}
 if(t=='conc'){g.add(at(cyl(.06,.06,.035,'#ddd',16),0,.018,0),at(cyl(.05,.05,.012,'#e8a828',16),0,.04,0));const f=new THREE.Mesh(new THREE.PlaneGeometry(.09,.09),mat('#fff',{map:pkgTex(d,'conc')}));f.rotation.x=-1.57;f.position.y=.05;g.add(f);return true}
 if(t=='vseal'){g.add(at(H.rbox(.42,.08,.16,'#222'),0,.04,0),at(box(.38,.02,.1,'#555'),0,.085,0),at(box(.05,.015,.01,'#3aff6a'),.15,.06,.081));return true}
 if(t=='lprint'){g.add(at(H.rbox(.2,.14,.22,'#f2f2f2'),0,.07,0),at(box(.12,.01,.08,'#fff8ea'),0,.12,.12),at(box(.04,.02,.01,'#2a7aff'),.06,.1,.111));return true}
 if(t=='trimmer'){g.add(at(cyl(.3,.26,.25,'#c8ccd0',20),0,.25,0),at(cyl(.32,.32,.03,'#888',20),0,.38,0),at(box(.16,.1,.1,'#333'),.3,.2,0),at(box(.05,.5,.05,'#555'),-.25,.12,-.2),at(box(.05,.5,.05,'#555'),.25,.12,-.2));return true}
 if(t=='press'){const hy=d.hy;g.add(at(box(.36,.04,.3,'#333'),0,.02,0),at(box(.04,hy?.7:.5,.04,'#555'),-.15,hy?.35:.25,0),at(box(.04,hy?.7:.5,.04,'#555'),.15,hy?.35:.25,0),at(box(.36,.06,.3,'#444'),0,hy?.68:.48,0),at(box(.22,.04,.18,'#d03a2a'),0,.12,0),at(box(.22,.04,.18,'#d03a2a'),0,.2,0));
  if(hy)g.add(at(cyl(.06,.06,.3,'#2a6ad0'),0,.5,0),at(box(.1,.08,.01,'#111'),.12,.6,.15));else{const hd=at(cyl(.015,.015,.4,'#aaa'),.25,.5,0);hd.rotation.z=1.57;g.add(hd)};return true}
 if(t=='rack'&&d.env){const v=d.env,m=H.lbl('hyg'+v.h+v.T,(x,w,h)=>{x.fillStyle='#0e1a14';x.fillRect(0,0,w,h);x.fillStyle=v.dq>0?'#7dff9a':v.dq<0?'#ff8a5a':'#fff';x.font='bold 54px monospace';x.textAlign='center';x.fillText(v.h+'%',w/2,62);x.font='bold 40px monospace';x.fillText(v.T+'°C',w/2,112)},128,128);
  const p=new THREE.Mesh(new THREE.PlaneGeometry(.12,.12),mat('#fff',{map:m,emissive:'#fff',emissiveMap:m,emissiveIntensity:.5}));p.position.set(0,1.3,.2);p.name='hyg';g.add(p);return false}
 return false}
