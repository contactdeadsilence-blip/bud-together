import {thumbCloth,img} from './thumbs.js';
// Character creator + Threads clothing store + outfit slots. Fully pad/keyboard navigable.
import * as THREE from 'three';
import {TONES,EYES,HAIRC,HAIRS,FHAIR,BROWS,FACES,TATS,SCARS,COLORS,PATS,CLOTH,SLOTS,OPTIONAL,STARTER,defLook,cleanLook,makeHuman,setLook,animateAvatar,ready} from './human.js';
const $=id=>document.getElementById(id);
const LS={get look(){try{const l=JSON.parse(localStorage.bt_look);return l?cleanLook(l):null}catch{return null}},
 get owned(){try{return new Set([...STARTER,...JSON.parse(localStorage.bt_owned||'[]')])}catch{return new Set(STARTER)}},
 get outfits(){try{const o=JSON.parse(localStorage.bt_outfits||'[]');return Array.isArray(o)?o:[]}catch{return[]}}};
export function savedLook(){return LS.look}
export function hasLook(){return !!LS.look}
const css=`#cre{position:fixed;inset:0;z-index:60;display:none;background:radial-gradient(circle at 30% 40%,#2c4a32,#0d1610);color:#fff;font-family:Nunito}
#cre.on{display:flex}#crev{flex:1.1;position:relative}#crev canvas{width:100%;height:100%;display:block}
#crep{flex:1;max-width:560px;display:flex;flex-direction:column;padding:22px 26px;background:rgba(10,20,14,.82)}
#crep h2{font:34px 'Lilita One';margin:0 0 8px;color:#b8f56a}#cret{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}
#cret b{font:900 15px Nunito;padding:7px 14px;border-radius:10px;background:#2c3a4a}#cret b.sel{background:#5fcf3a;color:#12320a}
#crer{flex:1;overflow:auto}.cr{display:flex;align-items:center;justify-content:space-between;padding:7px 12px;margin:3px 0;border-radius:10px;background:rgba(255,255,255,.07);font:800 16px Nunito;cursor:pointer}
.cr.f{outline:4px solid #ffd23f;background:rgba(255,210,63,.18)}.cr i{font-style:normal;color:#ffd23f;font-weight:900}.cr .v{display:flex;gap:10px;align-items:center}
.cr .sw{width:18px;height:18px;border-radius:5px;border:2px solid #fff8;display:inline-block}.cr.h{background:none;color:#b8f56a;font:18px 'Lilita One';cursor:default}
.cr .bar{width:120px;height:8px;border-radius:4px;background:#fff3;position:relative}.cr .bar u{position:absolute;top:-3px;width:6px;height:14px;background:#ffd23f;border-radius:3px}
#crh{font:800 13px Nunito;opacity:.8;margin-top:8px}#crm{font:22px 'Lilita One';color:#b8f56a;position:absolute;left:20px;top:16px}#crmsg{position:absolute;left:0;right:0;bottom:24px;text-align:center;font:24px 'Lilita One';color:#eaffd0;text-shadow:0 3px 8px #000}`;
const TABS=[['body','Body'],['face','Face'],['hair','Hair'],['fit','Outfit'],['store','Threads Store'],['saved','Outfits']];
let C=null;
function ui(){if(C)return C;const st=document.createElement('style');st.textContent=css;document.head.append(st);
 const d=document.createElement('div');d.id='cre';d.innerHTML=`<div id="crev"><div id="crm"></div><div id="crmsg"></div></div><div id="crep"><h2 id="crtt">CREATE YOUR GROWER</h2><div id="cret"></div><div id="crer"></div><div id="crh"></div></div>`;document.body.append(d);
 const r=new THREE.WebGLRenderer({antialias:true,alpha:true});r.setPixelRatio(Math.min(devicePixelRatio,2));r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;$('crev').prepend(r.domElement);
 const s=new THREE.Scene();s.add(new THREE.HemisphereLight('#dfe9ff','#3a3020',1.4));const k=new THREE.DirectionalLight('#fff4e6',2.4);k.position.set(2,3,3);s.add(k);const b=new THREE.DirectionalLight('#9fc8ff',1.2);b.position.set(-3,2,-2);s.add(b);
 const fl=new THREE.Mesh(new THREE.CircleGeometry(1.1,40).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:'#24402a',roughness:1}));s.add(fl);
 const cam=new THREE.PerspectiveCamera(28,1,.05,30);C={d,r,s,cam,rot:0,zoom:0,t:'body',row:0,cb:null,look:null,man:null,mode:'create'};
 d.addEventListener('click',e=>{const t=e.target.closest('[data-t]');if(t){C.t=t.dataset.t;C.row=0;render();return}const rw=e.target.closest('.cr[data-i]');if(rw){C.row=+rw.dataset.i;const half=e.clientX>rw.getBoundingClientRect().left+rw.offsetWidth*.6;act(half?1:-1,true);render()}});
 d.addEventListener('wheel',e=>{if(e.target.closest('#crev')){C.zoom=Math.max(0,Math.min(1,C.zoom-e.deltaY*.001))}},{passive:true});
 let drag=null;d.addEventListener('pointerdown',e=>{if(e.target.closest('#crev'))drag=e.clientX});addEventListener('pointerup',()=>drag=null);addEventListener('pointermove',e=>{if(drag!=null&&C.open){C.rot+=(e.clientX-drag)*.01;drag=e.clientX}});
 addEventListener('keydown',e=>{if(!C.open)return;e.stopImmediatePropagation();e.preventDefault();const k=e.code;
  if(k=='ArrowUp'||k=='KeyW')mv(-1);else if(k=='ArrowDown'||k=='KeyS')mv(1);else if(k=='ArrowLeft'||k=='KeyA')act(-1);else if(k=='ArrowRight'||k=='KeyD')act(1);
  else if(k=='Enter'||k=='Space')act(1,true);else if(k=='KeyQ'||k=='PageUp')tab(-1);else if(k=='KeyE'||k=='PageDown'||k=='Tab')tab(e.shiftKey?-1:1);else if(k=='KeyZ')C.rot-=.4;else if(k=='KeyC')C.rot+=.4;else if(k=='Escape')close(true)},true);
 addEventListener('keyup',e=>{if(C.open)e.stopImmediatePropagation()},true);
 return C}
const rng=(k,lab,a=-1,b=1)=>({lab,k,rng:[a,b]});const opt=(k,lab,list,fmt)=>({lab,k,list,fmt});
const sw=c=>`<span class="sw" style="background:${c}"></span>`;
function rows(){const L=C.look,R=[];const h=t=>R.push({h:t});
 if(C.t=='body'){R.push(opt('sex','Sex',['m','f'],v=>v=='f'?'Female':'Male'),opt('tone','Skin tone',TONES.map((_,i)=>i),i=>sw(TONES[i][1])+TONES[i][2]),rng('build','Build'),rng('mus','Muscle'),rng('height','Height'));h('Details');
  R.push(rng('freck','Freckles',0,1),opt('scar','Scar',SCARS.map(x=>x[0]),v=>SCARS.find(x=>x[0]==v)[1]),opt('tatArm','Arm tattoo',TATS.map(x=>x[0]),v=>TATS.find(x=>x[0]==v)[1]),opt('tatChest','Chest tattoo',TATS.map(x=>x[0]),v=>TATS.find(x=>x[0]==v)[1]),opt('tatNeck','Neck tattoo',TATS.map(x=>x[0]),v=>TATS.find(x=>x[0]==v)[1]));h('Piercings');
  for(const[k,n]of[['pEar','Ears'],['pNose','Nose'],['pBrow','Eyebrow'],['pLip','Lip']])R.push(opt(k,n,[0,1],v=>v?'Yes':'No'))}
 if(C.t=='face')R.push(opt('face','Face shape',FACES.map((_,i)=>i),i=>FACES[i][1]),rng('fw','Face width'),rng('jaw','Jaw'),rng('nose','Nose length'),rng('nosew','Nose width'),rng('lips','Lips'),opt('eye','Eye color',EYES.map((_,i)=>i),i=>sw(EYES[i][0])+EYES[i][1]),opt('brow','Brows',BROWS.map(x=>x[0]),v=>BROWS.find(x=>x[0]==v)[1]));
 if(C.t=='hair')R.push(opt('hair','Hair style',HAIRS.map(x=>x[0]),v=>HAIRS.find(x=>x[0]==v)[1]),rng('hlen','Hair length',0,1),opt('hcol','Hair color',HAIRC.map((_,i)=>i),i=>sw(HAIRC[i][0])+HAIRC[i][1]),opt('fhair','Facial hair',FHAIR.map(x=>x[0]),v=>FHAIR.find(x=>x[0]==v)[1]));
 if(C.t=='fit'){const own=LS.owned;for(const[s,n]of SLOTS){h(n);const ids=Object.keys(CLOTH).filter(k=>CLOTH[k].slot==s&&own.has(k));R.push({lab:'Item',fit:s,f:'id',list:[...(OPTIONAL[s]?[null]:[]),...ids],fmt:v=>v?CLOTH[v].n:'None'});
  if(L.fit[s]){R.push({lab:'Color',fit:s,f:'c',list:COLORS.map((_,i)=>i),fmt:i=>sw(COLORS[i][0])+COLORS[i][1]});if(!['metal','rubber'].includes(CLOTH[L.fit[s].id].k))R.push({lab:'Pattern',fit:s,f:'p',list:PATS.map((_,i)=>i),fmt:i=>PATS[i][1]})}}}
 if(C.t=='store'){const own=LS.owned;for(const[s,n]of SLOTS){h(n);for(const k in CLOTH)if(CLOTH[k].slot==s&&CLOTH[k].p>0)R.push({lab:CLOTH[k].n,buy:k,own:own.has(k)})}}
 if(C.t=='saved'){const O=LS.outfits;for(let i=0;i<4;i++){h('Outfit '+(i+1)+(O[i]?' — '+[O[i].top?.id,O[i].bot?.id,O[i].shoe?.id].filter(Boolean).map(x=>CLOTH[x].n).join(' · '):' — empty'));R.push({lab:'Save current outfit',save:i},{lab:'Wear this outfit',wear:i,dis:!O[i]})}}
 R.push({h:''},{lab:C.mode=='create'?'✔ Done — start growing':'✔ Save & close',done:1});return R}
function val(r){const L=C.look;return r.fit?(r.f=='id'?L.fit[r.fit]?.id??null:L.fit[r.fit]?.[r.f]):L[r.k]}
function setv(r,v){const L=C.look;if(r.fit){if(r.f=='id'){L.fit[r.fit]=v?{id:v,c:L.fit[r.fit]?.id==v?L.fit[r.fit].c:CLOTH[v].c,p:CLOTH[v].pt||0}:null}else L.fit[r.fit][r.f]=v}else L[r.k]=v;
 if(r.k=='sex'){if(v=='f'&&L.fhair!='none')L.fhair='none'}save();rebuild()}
let rbT=0;function rebuild(){clearTimeout(rbT);rbT=setTimeout(()=>{if(C.man)setLook(C.man,cleanLook(C.look))},60)}
function save(){C.look=cleanLook(C.look);localStorage.bt_look=JSON.stringify(C.look);C.cb?.(C.look)}
function msg(t){$('crmsg').textContent=t;clearTimeout(msg.t);msg.t=setTimeout(()=>$('crmsg').textContent='',2200)}
function act(d,press){const R=rows(),r=R[C.row];if(!r||r.h!=null)return;
 if(r.done){if(press||d>0)close(false);return}
 if(r.buy!=null){if(!press&&d<0)return;if(r.own){const s=CLOTH[r.buy].slot;C.look.fit[s]={id:r.buy,c:CLOTH[r.buy].c,p:CLOTH[r.buy].pt||0};save();rebuild();msg('Wearing '+CLOTH[r.buy].n);render();return}
  const m=C.money?.();if(m==null)return msg('Shop in-game with your grow money');const p=CLOTH[r.buy].p;if(m<p)return msg('Not enough money ($'+p+')');
  if(!C.spend(p,CLOTH[r.buy].n))return msg('Purchase failed');const o=JSON.parse(localStorage.bt_owned||'[]');o.push(r.buy);localStorage.bt_owned=JSON.stringify(o);const s=CLOTH[r.buy].slot;C.look.fit[s]={id:r.buy,c:CLOTH[r.buy].c,p:CLOTH[r.buy].pt||0};save();rebuild();msg('Bought '+CLOTH[r.buy].n+' — -$'+p);render();return}
 if(r.save!=null){if(!press&&d<0)return;const O=LS.outfits;O[r.save]=JSON.parse(JSON.stringify(C.look.fit));localStorage.bt_outfits=JSON.stringify(O);msg('Saved outfit '+(r.save+1));render();return}
 if(r.wear!=null){if(r.dis||(!press&&d<0))return;const O=LS.outfits[r.wear];C.look.fit={...O};save();rebuild();msg('Wearing outfit '+(r.wear+1));render();return}
 if(r.rng){const v=+(Math.max(r.rng[0],Math.min(r.rng[1],(val(r)||0)+d*.1))).toFixed(2);setv(r,v)}
 else if(r.list){const i=r.list.indexOf(val(r));setv(r,r.list[(i+d+r.list.length)%r.list.length])}render()}
function mv(d){const R=rows();let i=C.row;for(let n=0;n<R.length;n++){i=(i+d+R.length)%R.length;if(R[i].h==null)break}C.row=i;render()}
function tab(d){const i=TABS.findIndex(t=>t[0]==C.t);C.t=TABS[(i+d+TABS.length)%TABS.length][0];C.row=0;const R=rows();while(R[C.row]?.h!=null)C.row++;render()}
function render(){const R=rows();if(C.row>=R.length)C.row=R.length-1;while(R[C.row]?.h!=null)C.row++;
 $('cret').innerHTML=TABS.map(([k,n])=>`<b data-t="${k}" class="${k==C.t?'sel':''}">${n}</b>`).join('');
 $('crer').innerHTML=R.map((r,i)=>{if(r.h!=null)return `<div class="cr h">${r.h}</div>`;let v='';
  if(r.done)v='';else if(r.buy!=null)v=r.own?'<i>OWNED · wear</i>':`<i>$${CLOTH[r.buy].p}</i>`;else if(r.save!=null||r.wear!=null)v=r.dis?'—':'<i>A</i>';
  else if(r.rng){const x=((val(r)||0)-r.rng[0])/(r.rng[1]-r.rng[0]);v=`<i>◀</i><span class="bar"><u style="left:${x*114}px"></u></span><i>▶</i>`}else v=`<i>◀</i>${r.fmt(val(r))}<i>▶</i>`;
  return `<div class="cr${i==C.row?' f':''}" data-i="${i}"><span>${r.buy!=null?img(thumbCloth(r.buy,()=>{if(creatorOpen())render()}),'th'):''}${r.lab}</span><span class="v">${v}</span></div>`}).join('');
 $('crer').querySelector('.f')?.scrollIntoView({block:'nearest'});const m=C.money?.();$('crm').textContent=m!=null?'$'+m:'';
 $('crtt').textContent=C.mode=='create'?'CREATE YOUR GROWER':C.t=='store'?'THREADS — CLOTHING STORE':'WARDROBE';
 $('crh').innerHTML=(document.body.classList.contains('pad')?'D-pad/LS ▲▼ select · ◀▶ change · A choose · LB/RB tabs · RS rotate · B done':'↑↓ select · ←→ change · Enter choose · Q/E tabs · Z/C rotate · Esc done')}
// gamepad
const pb={};let rep={d:0,t:0},last=0;
function pad(dt){const gp=[...(navigator.getGamepads?.()||[])].find(p=>p&&p.connected!==false);if(!gp)return;const B=k=>{const b=gp.buttons[k];return !!b&&(b.pressed||b.value>.5)};const E={};for(let k=0;k<17;k++){const v=B(k);E[k]=v&&!pb[k];pb[k]=v}
 if(C.gate){if(!Object.values(pb).some(Boolean))C.gate=false;return}
 const ax=i=>gp.axes[i]||0;let dy=(B(13)?1:0)-(B(12)?1:0),dx=(B(15)?1:0)-(B(14)?1:0);if(!dx&&!dy){if(Math.abs(ax(1))>.5)dy=Math.sign(ax(1));else if(Math.abs(ax(0))>.5)dx=Math.sign(ax(0))}
 const d=dx+','+dy;if(dx||dy){if(d!=rep.d){rep.d=d;rep.t=.35;dy?mv(dy):act(dx)}else if((rep.t-=dt)<=0){rep.t=.09;dy?mv(dy):act(dx)}}else rep.d=0;
 if(Math.abs(ax(2))>.2)C.rot+=ax(2)*dt*3;if(Math.abs(ax(3))>.2)C.zoom=Math.max(0,Math.min(1,C.zoom-ax(3)*dt*1.5));
 if(E[4])tab(-1);if(E[5])tab(1);if(E[0])act(1,true);if(E[1]||E[9])close(true)}
function loop(t){if(!C.open)return;requestAnimationFrame(loop);const dt=Math.min(.1,(t-last)/1000||0);last=t;pad(dt);
 const el=$('crev'),w=el.clientWidth,h=el.clientHeight;if(C.r.domElement.width!=Math.round(w*C.r.getPixelRatio())){C.r.setSize(w,h,false);C.cam.aspect=w/h;C.cam.updateProjectionMatrix()}
 if(C.man){C.man.rotation.y=C.rot;animateAvatar(C.man,dt,{spd:0})}const z=C.zoom,ty=1+z*.62;C.cam.position.set(0,ty+.05,4.6-z*3.6);C.cam.lookAt(0,ty,0);C.r.render(C.s,C.cam)}
export async function openCreator(o={}){ui();C.mode=o.mode||'edit';C.cb=o.onChange;C.onClose=o.onClose;C.money=o.money;C.spend=o.spend;C.t=o.tab||'body';C.row=0;C.gate=true;
 C.look=cleanLook(LS.look||o.look||defLook(Math.random()<.5?'m':'f',Math.random()*1000|0));if(!LS.look)localStorage.bt_look=JSON.stringify(C.look);
 C.open=true;C.d.classList.add('on');document.exitPointerLock?.();render();await ready;if(!C.man){C.man=makeHuman(cleanLook(C.look));C.s.add(C.man)}else setLook(C.man,cleanLook(C.look));last=performance.now();requestAnimationFrame(loop)}
export function closeCreator(){close(true)}
function close(){if(!C?.open)return;C.open=false;C.d.classList.remove('on');save();C.onClose?.(C.look)}
export function creatorOpen(){return !!C?.open}
export function creatorState(){return C?.open?{t:C.t,row:C.row,lab:rows()[C.row]?.lab,look:C.look}:null}
