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
