// Section 3 minigames (trim / pack / press): one overlay, mouse + gamepad cursor. A/click = act, B/Esc = cancel.
let st=null;const el=document.createElement('div');el.id='mg';el.style.cssText='position:fixed;inset:0;z-index:40;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.55);font:800 16px Nunito,sans-serif;color:#fff';
el.innerHTML='<div style="background:#1f2a22;border:3px solid #9fe07a;border-radius:16px;padding:14px;text-align:center;box-shadow:0 10px 40px #000"><div id="mgT" style="font-size:22px;margin-bottom:6px"></div><canvas id="mgC" width="420" height="300" style="background:#12301c;border-radius:10px;cursor:crosshair;touch-action:none"></canvas><div id="mgI" style="margin:6px 0;min-height:22px"></div><div id="mgB"></div></div>';
const C=()=>el.querySelector('#mgC'),X=()=>C().getContext('2d');
export const mgOn=()=>!!st;
export function mgInit(){document.body.appendChild(el);const c=C();
 c.addEventListener('mousemove',e=>{if(!st)return;const r=c.getBoundingClientRect();st.cx=(e.clientX-r.left)*c.width/r.width;st.cy=(e.clientY-r.top)*c.height/r.height});
 c.addEventListener('mousedown',e=>{if(!st)return;e.preventDefault();c.dispatchEvent(new MouseEvent('mousemove',e));st.act(st,true)});
 c.addEventListener('mouseup',()=>st?.rel?.(st));
 el.addEventListener('click',e=>{const b=e.target.closest('[data-mg]');if(!b||!st)return;const k=b.dataset.mg;if(k=='x')mgClose();else st.btn?.(st,k)})}
export function mgOpen(o){if(st)return;try{document.exitPointerLock?.()}catch{};st={cx:210,cy:150,t:0,...o};st.init?.(st);el.style.display='flex';el.querySelector('#mgT').textContent=o.title;
 el.querySelector('#mgB').innerHTML=(o.btns||[]).map(([k,n])=>`<button class="btn" data-mg="${k}">${n}</button>`).join(' ')+' <button class="btn" data-mg="x">Cancel (B/Esc)</button>';loop()}
export function mgClose(){if(!st)return;st=null;el.style.display='none'}
export function mgState(){return st}
let last=0;function loop(){if(!st)return;const now=performance.now(),dt=Math.min(.05,(now-(last||now))/1000);last=now;st.t+=dt;
 const g=X();g.clearRect(0,0,420,300);st.tick?.(st,dt);if(!st)return;st.draw(st,g);g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.arc(st.cx,st.cy,10,0,7);g.moveTo(st.cx-16,st.cy);g.lineTo(st.cx+16,st.cy);g.moveTo(st.cx,st.cy-16);g.lineTo(st.cx,st.cy+16);g.stroke();
 el.querySelector('#mgI').innerHTML=st.info?.(st)||'';requestAnimationFrame(loop)}
// gamepad: stick/dpad moves cursor, A acts (hold-aware), X/Y extra buttons, B cancels
export function mgPad(lx,ly,E,B,dt){if(!st)return;const sp=320*dt;st.cx=Math.max(0,Math.min(420,st.cx+lx*sp+((B(15)?1:0)-(B(14)?1:0))*sp));st.cy=Math.max(0,Math.min(300,st.cy+ly*sp+((B(13)?1:0)-(B(12)?1:0))*sp));
 if(E[0])st.act(st,true);if(st.aDown&&!B(0))st.rel?.(st);st.aDown=B(0);if(E[2])st.btn?.(st,'x');if(E[3])st.btn?.(st,'y');if(E[1])mgClose()}
export function mgKey(e){if(!st)return false;if(e.code=='Escape'||e.code=='KeyQ')mgClose();else if(e.code=='Space'||e.code=='KeyE'){st.act(st,true)}else if(e.code=='KeyF')st.btn?.(st,'x');else if(e.code=='KeyR')st.btn?.(st,'y');return true}
export function mgKeyUp(e){if(st&&(e.code=='Space'||e.code=='KeyE'))st.rel?.(st)}
// ---- Trim: snip the 9 sugar leaves off the bud; misses nick the bud. Accuracy+speed -> quality.
export function trimGame(bud,send,sfx){const N=9,T=20;mgOpen({title:'✂ Trim the bud — snip every leaf',
 init:s=>{s.L=Array.from({length:N},(_,i)=>{const a=i/N*Math.PI*2+Math.random()*.3,r=88+Math.random()*18;return{x:210+Math.cos(a)*r,y:150+Math.sin(a)*r*.85,a,on:1}});s.h=0;s.m=0},
 tick:s=>{if(s.t>=T)fin(s)},
 act:s=>{const l=s.L.find(l=>l.on&&Math.hypot(l.x-s.cx,l.y-s.cy)<24);if(l){l.on=0;s.h++;sfx?.('pick')}else{s.m++;sfx?.('ui')}if(s.h>=N)fin(s)},
 draw:(s,g)=>{for(const l of s.L)if(l.on){g.save();g.translate(l.x,l.y);g.rotate(l.a);g.fillStyle='#4f9a35';g.beginPath();g.ellipse(0,0,26,9,0,0,7);g.fill();g.strokeStyle='#2f6a20';g.beginPath();g.moveTo(-26,0);g.lineTo(26,0);g.stroke();g.restore()}
  const gr=g.createRadialGradient(200,140,10,210,150,80);gr.addColorStop(0,'#c9e89a');gr.addColorStop(1,'#6a9a3a');g.fillStyle=gr;g.beginPath();g.ellipse(210,150,62,78,0,0,7);g.fill();g.fillStyle='#e8a050';for(let i=0;i<30;i++){g.fillRect(170+(i*37%80),95+(i*53%110),3,3)}},
 info:s=>`Leaves ${s.h}/${N} · nicks ${s.m} · ${Math.max(0,T-s.t).toFixed(1)}s · ${bud.g}g`});
 function fin(s){const acc=s.h/N*(s.h/(s.h+s.m||1)),spd=s.h>=N?Math.max(0,1-s.t/T):0;send({t:'use',trim:{acc:+acc.toFixed(3),spd:+spd.toFixed(3)}});mgClose()}}
// ---- Pack: pour to the target weight (hold A / mouse), then seal (timing) and label. Digital scale = steadier pour.
export function packGame(it,o,send,sfx){const cc=it.type=='conc',T=cc?[.5,1,2]:[3.5,7,14,28],ok=T.filter(v=>v<=it.data.g);if(!ok.length){sfx?.('ui');return false}
 mgOpen({title:`📦 Package ${cc?'rosin':'bud'} — fill, seal, label`,btns:[['t','Target (X/F)']],
 init:s=>{s.T=ok;s.ti=ok.length-1;s.w=0;s.ph='fill';s.pour=0;s.sx=0;s.acc=0;s.seal=o.vac?1:0},
 tick:(s,dt)=>{if(s.ph=='fill'&&s.pour){s.w+=dt*s.T[s.ti]*.55*(o.dg?1:.8+Math.random()*.6)}if(s.ph=='seal')s.sx=(Math.sin(s.t*3.2)+1)/2;if(s.ph=='done'&&s.t-s.dt0>.6){send({t:'use',target:o.id,...(o.sub!=null?{sub:o.sub}:{}),pack:{tg:s.T[s.ti],acc:+s.acc.toFixed(3),seal:+s.seal.toFixed(3)}});mgClose()}},
 act:s=>{if(s.ph=='fill'){s.pour=1}else if(s.ph=='seal'){s.seal=Math.max(0,1-Math.abs(s.sx-.5)*2.5);sfx?.('check');s.ph=o.pr?'done':'label';s.dt0=s.t}else if(s.ph=='label'){sfx?.('pick');s.ph='done';s.dt0=s.t}},
 rel:s=>{if(s.ph=='fill'&&s.pour){s.pour=0;if(s.w>0){const tg=s.T[s.ti];s.acc=Math.max(0,1-Math.abs(s.w-tg)/tg);s.ph=o.vac?(o.pr?'done':'label'):'seal';s.dt0=s.t;sfx?.('pick')}}},
 btn:(s,k)=>{if((k=='t'||k=='x')&&s.ph=='fill'&&!s.w){s.ti=(s.ti+1)%s.T.length;sfx?.('ui')}},
 draw:(s,g)=>{const tg=s.T[s.ti];g.fillStyle='#2a2e34';g.fillRect(110,200,200,40);g.fillStyle='#d8dce2';g.fillRect(130,190,160,12);g.fillStyle='#0e2a14';g.fillRect(170,212,80,22);g.fillStyle='#7dff9a';g.font='bold 16px monospace';g.textAlign='center';g.fillText((o.dg?s.w.toFixed(1):Math.round(s.w))+' g',210,229);
  g.fillStyle=cc?'#e8a02a':'#9ad0a0';g.fillRect(170,110,80,80);const f=Math.min(1,s.w/(tg*1.3));g.fillStyle=cc?'#f2c040':'#6a9a3a';g.fillRect(172,188-76*f,76,76*f);g.strokeStyle='#ff4a4a';g.beginPath();g.moveTo(165,188-76/1.3);g.lineTo(255,188-76/1.3);g.stroke();
  g.fillStyle='#fff';g.font='bold 15px sans-serif';g.fillText(s.ph=='fill'?(s.w?'':'Hold A / mouse to pour · X/F changes target'):s.ph=='seal'?'Press A / click in the green to heat-seal':s.ph=='label'?'Press A / click to stick the label':'✔ Packed!',210,30);g.fillText('Target '+tg+' g',210,60);
  if(s.ph=='seal'){g.fillStyle='#333';g.fillRect(60,80,300,16);g.fillStyle='#3a9a4a';g.fillRect(180,80,60,16);g.fillStyle='#fff';g.fillRect(60+s.sx*300-3,76,6,24)}
  if(s.ph=='label'||s.ph=='done'&&!o.pr){g.fillStyle='#fff8ea';g.fillRect(180,130,60,30);g.fillStyle='#222';g.font='bold 10px sans-serif';g.fillText(tg+'g',210,150)}},
 info:s=>`${it.data.g}g available · ${o.dg?'Digital scale (0.1 g)':'Pocket scale'} · ${o.vac?'Vacuum sealer: auto seal':'Hand sealer'} · ${o.pr?'Label printer':'Hand label'}${s.acc?` · fill ${Math.round(s.acc*100)}%`:''}`});return true}
// ---- Press: lock temperature, pressure and time in the green (A / click) for the best rosin yield and quality.
export function pressGame(it,o,send,sfx){const N=['🌡 Temperature','⚙ Pressure','⏱ Time'];mgOpen({title:`🍯 Rosin press — ${it.type=='trim'?'trim':'dried bud'} ${it.data.g}g`,
 init:s=>{s.i=0;s.a=[];s.id=N.map(()=>.35+Math.random()*.3);s.v=0},
 tick:s=>{s.v=(Math.sin(s.t*(2.2+s.i*.6))+1)/2;if(s.i>=3&&s.t-s.dt0>.6){send({t:'use',target:o.id,...(o.sub!=null?{sub:o.sub}:{}),press:{a:s.a}});mgClose()}},
 act:s=>{if(s.i>=3)return;s.a.push(+Math.max(0,1-Math.abs(s.v-s.id[s.i])*4).toFixed(3));s.i++;sfx?.('check');if(s.i>=3)s.dt0=s.t},
 draw:(s,g)=>{g.textAlign='center';N.forEach((n,i)=>{const y=60+i*75;g.fillStyle='#fff';g.font='bold 15px sans-serif';g.fillText(n+(s.a[i]!=null?' ✔ '+Math.round(s.a[i]*100)+'%':''),210,y-8);g.fillStyle='#333';g.fillRect(40,y,340,18);g.fillStyle='#3a9a4a';g.fillRect(40+(s.id[i]-.12)*340,y,.24*340,18);g.fillStyle='#7dff9a';g.fillRect(40+(s.id[i]-.04)*340,y,.08*340,18);
  const v=s.a[i]!=null?null:i==s.i?s.v:null;if(v!=null){g.fillStyle='#fff';g.fillRect(40+v*340-3,y-4,6,26)}});g.fillStyle='#ffd23f';g.font='bold 14px sans-serif';g.fillText(s.i<3?'Press A / click when the needle is in the green':'Pressing…',210,285)},
 info:s=>`${o.hy?'Hydraulic press (+5% yield, +5 quality)':'Hand press'} · step ${Math.min(3,s.i+1)}/3`})}
