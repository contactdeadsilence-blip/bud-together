// v12: cell phone + "Quick Bud" shopping app. Same catalog (SHOP) and same server order path as the laptop shop.
import {SHOP,CATS,catOf,MAXORD} from './rules.js';import {thumb,img} from './thumbs.js';
const $=id=>document.getElementById(id);
const P={on:false,scr:'home',tab:'shop',cat:'all',q:'',cart:JSON.parse(localStorage.bt_cart||'{}'),lastOrd:0};
let D=null;// deps from main.js
export const phoneOn=()=>P.on;export const phoneState=()=>({on:P.on,scr:P.scr,tab:P.tab,cat:P.cat,q:P.q,cart:{...P.cart}});
const saveCart=()=>{localStorage.bt_cart=JSON.stringify(P.cart)};
export function initPhone(deps){D=deps}
export function openPhone(){if(P.on||!D.game())return;P.on=true;P.scr=P.scr=='search'?'qb':P.scr;document.exitPointerLock?.();$('phone').classList.add('on');render();D.sfx('ui');D.rumble(.2,60)}
export function closePhone(){if(!P.on)return;P.on=false;$('phone').classList.remove('on');D.setFocus(null);D.sfx('ui')}
export function togglePhone(){P.on?closePhone():openPhone()}
const ITEMS=()=>Object.entries(SHOP).filter(([k,v])=>!v.hide);
const cartN=()=>Object.values(P.cart).reduce((a,b)=>a+b,0),cartT=()=>Object.entries(P.cart).reduce((a,[k,n])=>a+(SHOP[k]?.p||0)*n,0);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function clock(W){const m=W?W.min|0:0;const h=m/60|0;return `${(h+11)%12+1}:${String(m%60).padStart(2,'0')} ${h<12?'AM':'PM'}`}
export function phoneTab(d){if(!P.on||P.scr!='qb')return;const T=['shop','cart','orders'];P.tab=T[(T.indexOf(P.tab)+d+3)%3];render(false,true);D.sfx('ui')}
export function phoneBack(){if(P.scr=='search'){P.scr='qb';render(false,true);return}if(P.scr=='qb'&&P.tab!='shop'){P.tab='shop';render(false,true);return}if(P.scr=='qb'){P.scr='home';render(false,true);return}closePhone()}
export function phoneKey(e){// physical keyboard while the phone is open; returns true if handled
 if(!P.on)return false;if(e.code=='Escape'||e.code=='KeyP'&&P.scr!='search'){if(e.code=='Escape'&&P.scr!='home'){phoneBack();return true}closePhone();return true}
 if(P.scr=='search'){if(e.key.length==1&&/[a-z0-9 ]/i.test(e.key)){typeK(e.key.toUpperCase());return true}if(e.code=='Backspace'){typeK('DEL');return true}if(e.code=='Enter'){typeK('OK');return true}}
 if(P.scr=='qb'&&(e.code=='KeyQ'||e.code=='KeyE')){phoneTab(e.code=='KeyE'?1:-1);return true}return false}
function typeK(k){if(k=='DEL')P.q=P.q.slice(0,-1);else if(k=='CLR')P.q='';else if(k=='OK'){P.scr='qb';P.tab='shop';render(false,true);return}else if(P.q.length<18)P.q+=k;render(true)}
export function phoneClick(el){const d=el.dataset;if(!d.ph)return false;const a=d.ph;D.sfx('ui');
 if(a=='help'){closePhone();D.openHelp?.();return true}if(a=='app'){P.scr='qb';P.tab='shop'}else if(a=='home'){P.scr='home'}else if(a=='close'){closePhone();return true}else if(a=='back'){phoneBack();return true}
 else if(a=='tab')P.tab=d.v;else if(a=='cat')P.cat=d.v;else if(a=='search'){P.scr='search';P.cat='all'}else if(a=='key'){typeK(d.v);return true}
 else if(a=='add'){const n=P.cart[d.v]||0;if(n>=MAXORD){D.toast('Max '+MAXORD+' per item');return true}P.cart[d.v]=n+1;saveCart();D.toast('🛒 Added '+SHOP[d.v].n);D.rumble(.15,40)}
 else if(a=='inc'||a=='dec'){const n=(P.cart[d.v]||0)+(a=='inc'?1:-1);if(n<=0)delete P.cart[d.v];else P.cart[d.v]=Math.min(MAXORD,n);saveCart()}
 else if(a=='rm'){delete P.cart[d.v];saveCart()}
 else if(a=='checkout'){const W=D.W();const items=Object.entries(P.cart).map(([k,n])=>({k,n}));if(!items.length){D.toast('Cart is empty');return true}const t=cartT();if(!W||W.money<t){D.toast(`Not enough money — need $${t}`);D.sfx('err');return true}
  D.send({t:'order',items,via:'phone'});P.cart={};saveCart();P.tab='orders';P.lastOrd=Date.now()}
 render(true);return true}
// D-pad left/right on a cart line changes quantity
export function phoneNav(dx){
 const f=D.fEl();if(!P.on||!f||!f.dataset.line)return false;phoneClick({dataset:{ph:dx>0?'inc':'dec',v:f.dataset.line}});return true}
let sig='';export function phoneRefresh(){if(!P.on)return;const W=D.W(),k=JSON.stringify([W?.money,W?.orders,W?.min|0]);if(k==sig)return;sig=k;render(true)}
function render(keep,reset){const W=D.W(),pad=D.padMode(),g=D.bglyph;const f=D.fEl(),fk=keep&&f?f.dataset.pk:null;let h='';
 const top=`<div class="ph-st"><span>${clock(W)}</span><span>📶 5G ▮▮▮</span><span>$${W?W.money:0}</span></div>`;
 if(P.scr=='home'){h=`<div class="ph-home"><div class="ph-wall">Day ${W?.day||1}</div><button class="ph-app" data-ph="app" data-pk="app"><i>🛍️</i><span>Quick Bud</span>${cartN()?`<b class="ph-badge">${cartN()}</b>`:''}</button><button class="ph-app" data-ph="help" data-pk="help"><i>❓</i><span>Help</span></button></div>`}
 else if(P.scr=='search'){const K='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('').concat(['SPACE','DEL','CLR','OK']);
  h=`<div class="ph-hd"><button class="ph-bk" data-ph="back" data-pk="bk">‹</button><b>Search Quick Bud</b></div><div class="ph-q">${esc(P.q)||'<i>type to search…</i>'}<span class="ph-car">|</span></div><div class="ph-kb">${K.map(k=>`<button class="ph-k${k.length>1?' w':''}" data-ph="key" data-v="${k=='SPACE'?' ':k}" data-pk="k${k}">${k=='SPACE'?'␣':k=='OK'?'Search':k}</button>`).join('')}</div>`}
 else{const tabs=`<div class="ph-tabs">${[['shop','Shop'],['cart',`Cart${cartN()?' ('+cartN()+')':''}`],['orders','Orders']].map(([k,n])=>`<button class="ph-tab${P.tab==k?' sel':''}" data-ph="tab" data-v="${k}" data-pk="t${k}">${n}</button>`).join('')}</div>`;
  h=`<div class="ph-hd ph-qbh"><button class="ph-bk" data-ph="home" data-pk="home">‹</button><b>quick<span>bud</span></b><small>${pad?g(4)+g(5):'Q/E'}</small></div>${tabs}`;
  if(P.tab=='shop'){const q=P.q.trim().toLowerCase();const L=ITEMS().filter(([k,v])=>(P.cat=='all'||catOf(k)==P.cat)&&(!q||v.n.toLowerCase().includes(q)||catOf(k).includes(q)));
   h+=`<button class="ph-search" data-ph="search" data-pk="search">🔍 ${P.q?esc(P.q):'Search everything'}</button><div class="ph-cats">${[['all','All'],...Object.entries(CATS)].map(([k,n])=>`<button class="ph-cat${P.cat==k?' sel':''}" data-ph="cat" data-v="${k}" data-pk="c${k}">${n}</button>`).join('')}</div>
   <div class="ph-list">${L.length?L.map(([k,v])=>`<button class="ph-it" data-ph="add" data-v="${k}" data-pk="a${k}">${img(thumb(k),'ph-th')}<span><b>${esc(v.n)}</b><small>${CATS[catOf(k)]}${v.uses?' · '+v.uses+' uses':''}</small></span><em>$${v.p}${P.cart[k]?`<small>🛒${P.cart[k]}</small>`:''}</em></button>`).join(''):'<p class="ph-empty">No matches. Try another word.</p>'}</div>`}
  if(P.tab=='cart'){const L=Object.entries(P.cart).filter(([k])=>SHOP[k]);const t=cartT();
   h+=`<div class="ph-list">${L.length?L.map(([k,n])=>`<div class="ph-line"><button class="ph-lq" data-ph="dec" data-v="${k}" data-pk="d${k}">−</button><button class="ph-ln" data-line="${k}" data-ph="rm" data-v="${k}" data-pk="l${k}"><b>${esc(SHOP[k].n)}</b><small>${n} × $${SHOP[k].p} = $${n*SHOP[k].p} · ${pad?g(0)+' remove · ◀▶ qty':'click to remove'}</small></button><button class="ph-lq" data-ph="inc" data-v="${k}" data-pk="i${k}">+</button></div>`).join(''):'<p class="ph-empty">Your cart is empty.</p>'}</div>
   ${L.length?`<div class="ph-tot">Total <b>$${t}</b>${W&&W.money<t?' <span class="bad">not enough cash</span>':''}</div><button class="ph-co" data-ph="checkout" data-pk="co">Place order · same-day delivery</button>`:''}`}
  if(P.tab=='orders'){const O=W?.orders||[];h+=`<div class="ph-list">${O.length?O.map(o=>{const pct=o.left?Math.round((1-o.left/o.n)*100):100;return `<div class="ph-ord"><b>Order #${o.id}</b> <small>${o.via=='phone'?'📱 Quick Bud':'💻 Laptop'} · Day ${o.day}</small><div>${o.items.map(l=>l.n+'× '+esc(SHOP[l.k]?.n||l.k)).join(', ')}</div><div class="ph-bar"><i style="width:${pct}%"></i></div><small>${o.left?`🚚 Out for delivery — ${o.n-o.left}/${o.n} dropped, ~${o.eta}s`:'✅ Delivered at the door'} · $${o.tot}</small></div>`}).join(''):'<p class="ph-empty">No orders yet.</p>'}</div>`}}
 const hint=`<div class="ph-hint">${pad?`${g(0)} select · ${g(1)} back · ${g(D.binds().phone)} close`:'Click · Esc back · P close'}</div>`;
 $('phone').innerHTML=`<div id="phbody"><div class="ph-notch"></div>${top}<div class="ph-scr">${h}</div>${hint}</div>`;
 const L=[...$('phone').querySelectorAll('button')];const nf=fk&&L.find(e=>e.dataset.pk==fk);if(nf)D.setFocus(nf);else if(pad||reset)D.setFocus(P.scr=='search'?$('phone').querySelector('[data-pk=kA]'):D.defFocus($('phone')));D.fEl()?.scrollIntoView?.({block:'nearest',inline:'nearest'})}
export const phoneCSS=`#phone{z-index:31;background:rgba(0,0,0,.25);justify-content:center;align-items:flex-end;padding-right:6vw}
#phbody{width:340px;height:min(680px,92vh);background:#0d0f12;border-radius:44px;border:10px solid #23262b;box-shadow:0 0 0 2px #555,0 30px 70px #000c;display:flex;flex-direction:column;overflow:hidden;color:#1d1d1f;font-family:Nunito,sans-serif;position:relative}
.ph-notch{position:absolute;top:6px;left:50%;transform:translateX(-50%);width:96px;height:22px;background:#000;border-radius:14px;z-index:3}
.ph-st{display:flex;justify-content:space-between;padding:8px 22px 4px;color:#fff;font:800 12px Nunito;background:#111}
.ph-scr{flex:1;background:#f3f4f6;overflow-y:auto;display:flex;flex-direction:column}
.ph-home{flex:1;background:linear-gradient(160deg,#1f6a3a,#0b2a1a 60%,#3a1a5a);padding:24px;display:grid;grid-template-columns:repeat(3,1fr);align-content:start;gap:16px}
.ph-wall{grid-column:1/-1;color:#fff;font:900 34px 'Lilita One';text-shadow:0 2px 8px #0008;margin:20px 0}
.ph-app{background:none;border:0;color:#fff;font:800 12px Nunito;display:flex;flex-direction:column;align-items:center;gap:4px;position:relative;cursor:pointer;border-radius:16px;padding:4px}
.ph-app i{font-style:normal;font-size:34px;width:64px;height:64px;border-radius:16px;background:linear-gradient(150deg,#ff9f1c,#e85d04);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px #0006}
.ph-badge{position:absolute;top:-2px;right:6px;background:#e11;color:#fff;border-radius:10px;padding:1px 6px;font-size:11px}
.ph-hd{display:flex;align-items:center;gap:8px;padding:8px 10px;background:#fff;border-bottom:1px solid #ddd}.ph-hd b{flex:1;font:900 18px Nunito}
.ph-hd.ph-qbh{background:#131921;color:#fff}.ph-hd.ph-qbh b{font:900 22px 'Lilita One';letter-spacing:.5px}.ph-hd.ph-qbh b span{color:#ff9f1c}
.ph-bk{background:#ffffff22;border:0;color:inherit;font:900 22px Nunito;width:34px;height:34px;border-radius:10px;cursor:pointer}
.ph-tabs{display:flex;background:#232f3e}.ph-tab{flex:1;background:none;border:0;color:#cfd8e3;font:800 13px Nunito;padding:8px 0;cursor:pointer;border-bottom:3px solid transparent}.ph-tab.sel{color:#fff;border-color:#ff9f1c}
.ph-search{margin:8px;padding:9px 12px;border-radius:10px;border:2px solid #ff9f1c;background:#fff;text-align:left;font:700 14px Nunito;color:#555;cursor:pointer}
.ph-cats{display:flex;gap:6px;overflow-x:auto;padding:0 8px 6px;flex:none;scrollbar-width:none}.ph-cat{flex:none}.ph-cat{border:0;background:#e4e7eb;border-radius:14px;padding:5px 10px;font:800 12px Nunito;cursor:pointer}.ph-cat.sel{background:#131921;color:#fff}
.ph-list{padding:4px 8px 10px;display:flex;flex-direction:column;gap:6px}
.ph-it{display:flex;align-items:center;gap:10px;background:#fff;border:0;border-radius:12px;padding:8px;text-align:left;cursor:pointer;box-shadow:0 1px 3px #0002}
.ph-it span{flex:1;display:flex;flex-direction:column}.ph-it b{font:800 14px Nunito}.ph-it small{color:#667;font:600 11px Nunito}.ph-it em{font:900 16px Nunito;color:#b12704;font-style:normal;text-align:right;display:flex;flex-direction:column}
.ph-ic{width:38px;height:38px;border-radius:9px;flex:none;background:#ccc}.c-seeds{background:linear-gradient(135deg,#7ad35a,#2f7a3a)}.c-grow{background:linear-gradient(135deg,#c79a6a,#6a4a2a)}.c-equip{background:linear-gradient(135deg,#9ab,#456)}.c-furn{background:linear-gradient(135deg,#e0b070,#8a5a32)}.c-bulk{background:linear-gradient(135deg,#ffcf3a,#c08a1a)}
.ph-line{display:flex;gap:6px;align-items:stretch}.ph-lq{width:36px;border:0;border-radius:10px;background:#ffd814;font:900 20px Nunito;cursor:pointer}.ph-ln{flex:1;border:0;border-radius:10px;background:#fff;text-align:left;padding:8px;display:flex;flex-direction:column;cursor:pointer}.ph-ln small{color:#667;font:600 11px Nunito}
.ph-tot{padding:6px 14px;font:800 16px Nunito}.ph-tot .bad{color:#c00;font-size:12px}.ph-co{margin:4px 10px 12px;padding:12px;border:0;border-radius:22px;background:#ffd814;font:900 15px Nunito;cursor:pointer}
.ph-ord{background:#fff;border-radius:12px;padding:8px 10px;font:600 12px Nunito;display:flex;flex-direction:column;gap:3px}.ph-ord b{font:900 14px Nunito}.ph-bar{height:7px;background:#e4e7eb;border-radius:4px;overflow:hidden}.ph-bar i{display:block;height:100%;background:#2fa84f}
.ph-empty{text-align:center;color:#778;font:700 14px Nunito;margin-top:30px}
.ph-q{margin:10px;padding:10px;background:#fff;border-radius:10px;border:2px solid #ff9f1c;font:900 18px Nunito;min-height:26px}.ph-q i{color:#999;font-weight:600}.ph-car{animation:blink 1s steps(2) infinite}@keyframes blink{50%{opacity:0}}
.ph-kb{display:grid;grid-template-columns:repeat(6,1fr);gap:5px;padding:6px 8px}.ph-k{border:0;border-radius:8px;background:#fff;font:900 15px Nunito;padding:9px 0;box-shadow:0 1px 2px #0003;cursor:pointer}.ph-k.w{grid-column:span 3;background:#dde3ea}
.ph-hint{background:#111;color:#ccc;font:700 11px Nunito;text-align:center;padding:6px}
#phone .f{outline:3px solid #ff9f1c!important;outline-offset:1px;box-shadow:0 0 0 5px #ff9f1c55!important;transform:none}`;
