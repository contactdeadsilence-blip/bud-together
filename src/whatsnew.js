// Self-contained What's New overlay. Mouse, keyboard and Xbox controller.
import {CHANGELOG,CURRENT_VERSION} from './changelog.js';
const KEY='bt_seen_version',$=id=>document.getElementById(id);
const cmp=(a,b)=>{const x=String(a).split('.').map(Number),y=String(b).split('.').map(Number);for(let i=0;i<Math.max(x.length,y.length);i++){const d=(x[i]||0)-(y[i]||0);if(d)return d}return 0};
const css=`#wn{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;background:#000a;font-family:Nunito,sans-serif}#wn.on{display:flex}
#wnp{width:min(720px,92vw);max-height:84vh;display:flex;flex-direction:column;background:#16241a;border:3px solid #2ecc71;border-radius:16px;color:#eee;box-shadow:0 10px 40px #000}
#wnp h2{margin:16px 20px 4px;font:900 28px Nunito;color:#7dffaf}#wnsub{margin:0 20px 8px;opacity:.75;font-weight:700}
#wnl{overflow:auto;padding:0 20px;flex:1}.wne{border-top:1px solid #2a4;padding:10px 0}.wne h3{margin:0;font:900 19px Nunito}.wne .d{opacity:.65;font-size:13px;font-weight:700}.wne ul{margin:6px 0 0 18px;padding:0}.wne li{margin:3px 0;line-height:1.35}
.wntag{background:#2ecc71;color:#062;border-radius:6px;padding:1px 6px;font-size:12px;margin-left:6px}
#wnb{display:flex;gap:10px;justify-content:center;align-items:center;padding:12px;flex-wrap:wrap}#wnb button{font:900 17px Nunito;padding:9px 18px;border-radius:10px;border:2px solid #2ecc71;background:#1f3a27;color:#fff;cursor:pointer}#wnb button.f,#wnb button:hover{background:#2ecc71;color:#062}#wnh{opacity:.7;font-size:13px;font-weight:700}
#wnver{position:fixed;left:12px;bottom:10px;font:900 14px Nunito;color:#fff;opacity:.6;z-index:50;pointer-events:none}`;
let open=false,mode='latest',foc=0,raf=0,prev=[];
const entry=(e,i)=>`<div class="wne"><h3>v${e.v} — ${e.title}${i==0?'<span class="wntag">LATEST</span>':''}</h3><div class="d">${e.date}</div><ul>${e.notes.map(n=>`<li>${n}</li>`).join('')}</ul></div>`;
function render(){const all=mode=='all';$('wnp').querySelector('h2').textContent=all?"What's New — All Updates":"What's New in v"+CURRENT_VERSION;
 $('wnsub').textContent=all?CHANGELOG.length+' updates':CHANGELOG[0].title+' · '+CHANGELOG[0].date;
 $('wnl').innerHTML=(all?CHANGELOG:[CHANGELOG[0]]).map(entry).join('');$('wnl').scrollTop=0;
 $('wnb').innerHTML=(all?'':'<button data-w="all">See All Updates</button>')+'<button data-w="close">'+(all?'Close':'Got it!')+'</button><span id="wnh">D-pad/Stick scroll · A select · B close</span>';foc=0;focus()}
const btns=()=>[...$('wnb').querySelectorAll('button')];
function focus(){btns().forEach((b,i)=>b.classList.toggle('f',i==foc))}
function act(w){if(w=='all'){mode='all';render()}else close()}
// Hide the controller from the main game loop while open so it doesn't also navigate menus.
const realGP=navigator.getGamepads?.bind(navigator);
const neutral=p=>p&&{id:p.id,index:p.index,connected:p.connected,mapping:p.mapping,timestamp:p.timestamp,axes:p.axes.map(()=>0),buttons:p.buttons.map(()=>({pressed:false,touched:false,value:0})),vibrationActuator:p.vibrationActuator};
export function openWhatsNew(m='all'){if(open)return;open=true;mode=m;document.exitPointerLock?.();$('wn').classList.add('on');render();
 if(realGP)navigator.getGamepads=()=>[...realGP()].map(neutral);prev=[];poll()}
function close(){open=false;$('wn').classList.remove('on');localStorage.setItem(KEY,CURRENT_VERSION);if(realGP)navigator.getGamepads=realGP;cancelAnimationFrame(raf);document.activeElement?.blur?.()}
function poll(){if(!open)return;raf=requestAnimationFrame(poll);const p=[...(realGP?.()||[])].find(g=>g&&g.connected);if(!p)return;
 const b=i=>p.buttons[i]?.pressed,was=i=>prev[i];const edge=i=>b(i)&&!was(i);
 const ay=Math.abs(p.axes[1])>.25?p.axes[1]:0,ry=Math.abs(p.axes[3]||0)>.25?p.axes[3]:0;const l=$('wnl');
 l.scrollTop+=(ay+ry)*14+(b(12)?-12:0)+(b(13)?12:0);
 if(edge(14)||(Math.abs(p.axes[0])>.6&&!prev.ax)){foc=Math.max(0,foc-(p.axes[0]>0&&!edge(14)?-1:1));foc=Math.min(btns().length-1,foc);focus()}
 if(edge(15)){foc=Math.min(btns().length-1,foc+1);focus()}
 if(edge(0))act(btns()[foc]?.dataset.w);else if(edge(1))close();
 prev=p.buttons.map(x=>x.pressed);prev.ax=Math.abs(p.axes[0])>.6}
function init(){const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 const d=document.createElement('div');d.id='wn';d.innerHTML='<div id="wnp" role="dialog" aria-label="What\'s New"><h2></h2><div id="wnsub"></div><div id="wnl" tabindex="0"></div><div id="wnb"></div></div>';document.body.appendChild(d);
 d.addEventListener('click',e=>{const w=e.target.closest('[data-w]')?.dataset.w;if(w)act(w);else if(e.target==d)close();e.stopPropagation()});
 d.addEventListener('mousedown',e=>e.stopPropagation());
 window.addEventListener('keydown',e=>{if(!open)return;e.stopImmediatePropagation();e.preventDefault();const l=$('wnl'),n=btns().length;
  if(e.code=='Escape'||e.code=='Backspace')close();else if(e.code=='ArrowDown'||e.code=='KeyS')l.scrollTop+=60;else if(e.code=='ArrowUp'||e.code=='KeyW')l.scrollTop-=60;
  else if(e.code=='PageDown')l.scrollTop+=l.clientHeight;else if(e.code=='PageUp')l.scrollTop-=l.clientHeight;
  else if(e.code=='ArrowLeft'||e.code=='KeyA'){foc=Math.max(0,foc-1);focus()}else if(e.code=='ArrowRight'||e.code=='KeyD'||e.code=='Tab'){foc=(foc+1)%n;focus()}
  else if(e.code=='Enter'||e.code=='Space')act(btns()[foc]?.dataset.w)},true);
 window.addEventListener('keyup',e=>{if(open){e.stopImmediatePropagation()}},true);
 // Buttons on main menu and pause menu (after How to Play)
 for(const sel of ['#m-main [data-a="howto"]','#pause [data-a="howto"]']){const h=document.querySelector(sel);if(!h)continue;const b=document.createElement('button');b.className='btn b';b.dataset.w='wnbtn';b.textContent="📰 What's New";h.after(b)}
 document.addEventListener('click',e=>{if(e.target.closest('[data-w="wnbtn"]')){e.stopPropagation();openWhatsNew('all')}},true);
 const v=document.createElement('div');v.id='wnver';v.textContent='v'+CURRENT_VERSION;document.body.appendChild(v);
 const vis=()=>{v.style.display=$('menu')?.classList.contains('on')&&$('m-main')?.style.display!='none'?'':'none'};setInterval(vis,300);vis();
 // Popup on load if the player hasn't seen this version yet (wait for splash to finish)
 const seen=localStorage.getItem(KEY);if(!seen||cmp(seen,CURRENT_VERSION)<0){const t=setInterval(()=>{if(!$('splash')?.classList.contains('on')){clearInterval(t);setTimeout(()=>openWhatsNew('latest'),400)}},250)}
 window.__wn={open:openWhatsNew,close,isOpen:()=>open,version:CURRENT_VERSION}}
document.readyState=='loading'?document.addEventListener('DOMContentLoaded',init):init();
