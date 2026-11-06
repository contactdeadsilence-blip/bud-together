// Missions menu rendering helpers (phone screen + pause panel).
import {misView,MCATS,plvl,xpNext} from './missions.js';
const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export function misHTML(W,cat='all',phone=false){
  const L=misView(W||{}).filter(m=>cat==='all'||m.cat===cat);
  const ready=L.filter(m=>m.ready).length;
  const lvl=plvl(W),need=xpNext(W),xp=W?.xp|0;
  const catAttr=k=>phone?`data-ph="miscat" data-v="${k}" data-pk="mc${k}"`:`data-miscat="${k}"`;
  const claimAttr=id=>phone?`data-ph="misclaim" data-v="${id}" data-pk="cl${id}"`:`data-misclaim="${id}"`;
  let h=`<div class="mis-hd"><b>🎯 Missions</b><small>Lv ${lvl} · ${xp}/${need} XP${ready?` · <span class="mis-ready">${ready} ready</span>`:''}</small></div>`;
  h+=`<div class="mis-cats"><button class="mis-cat${cat==='all'?' sel':''}" ${catAttr('all')}>All</button>${MCATS.map(([k,n])=>`<button class="mis-cat${cat===k?' sel':''}" ${catAttr(k)}>${n}</button>`).join('')}</div>`;
  h+=`<div class="mis-list">${L.length?L.map(m=>{
    const pct=Math.min(100,Math.round(m.cur/m.need*100));
    const st=m.coming?'coming':m.claimed?'claimed':m.ready?'ready':'open';
    const rw=m.r?[m.r.cash&&('$'+m.r.cash),m.r.xp&&(m.r.xp+' XP'),m.r.seed&&'seeds',m.r.deco&&'decor',m.r.cloth&&'outfit'].filter(Boolean).join(' · '):'';
    return `<div class="mis-card ${st}"><div class="mis-top"><b>${esc(m.n)}</b><small>${esc(m.cat)}</small></div><p>${esc(m.d)}</p>
      <div class="mis-bar"><i style="width:${m.coming?0:pct}%"></i></div>
      <div class="mis-meta">${m.coming?'🔒 Coming soon':m.claimed?'✅ Claimed':`${m.cur}/${m.need}`}${rw?` · ${rw}`:''}</div>
      ${m.ready&&!m.claimed?`<button class="mis-claim" ${claimAttr(m.id)}>Claim reward</button>`:''}</div>`;
  }).join(''):'<p class="mis-empty">No missions in this category.</p>'}</div>`;
  return h;
}
export const misCSS=`
.mis-hd{display:flex;flex-direction:column;gap:2px;padding:8px 10px;background:#1a2a1a;color:#eaffd0;font:900 16px Nunito}
.mis-hd small{font:700 12px Nunito;opacity:.85}.mis-ready{color:#ffd23f}
.mis-cats{display:flex;gap:6px;overflow-x:auto;padding:8px;background:#122}.mis-cat{flex:none;border:0;border-radius:12px;padding:6px 10px;font:800 12px Nunito;background:#234;color:#cfe;cursor:pointer}.mis-cat.sel{background:#5fcf3a;color:#123}
.mis-list{padding:8px;display:flex;flex-direction:column;gap:8px;overflow-y:auto;max-height:55vh}
.mis-card{background:#1c2733;border-radius:12px;padding:10px;border-left:5px solid #456;color:#e8eef5}
.mis-card.ready{border-color:#ffd23f}.mis-card.claimed{border-color:#5fcf3a;opacity:.75}.mis-card.coming{border-color:#666;opacity:.65}
.mis-top{display:flex;justify-content:space-between;gap:8px}.mis-top b{font:900 15px Nunito}.mis-top small{opacity:.7;text-transform:capitalize}
.mis-card p{margin:6px 0;font:600 13px Nunito;opacity:.9}
.mis-bar{height:7px;background:#0b1218;border-radius:4px;overflow:hidden}.mis-bar i{display:block;height:100%;background:linear-gradient(90deg,#5fcf3a,#b8f56a)}
.mis-meta{margin-top:6px;font:700 12px Nunito;opacity:.85}
.mis-claim{margin-top:8px;width:100%;border:0;border-radius:12px;padding:10px;font:900 14px Nunito;background:linear-gradient(#ffe08a,#ffb03a);color:#3a2306;cursor:pointer}
.mis-empty{text-align:center;opacity:.7;padding:24px;font:700 14px Nunito}
#m-mis.panel{max-width:520px;width:94vw}
#dlg{position:fixed;left:50%;bottom:12vh;transform:translateX(-50%);z-index:35;display:none;flex-direction:column;gap:8px;min-width:280px;max-width:420px;width:90vw;background:rgba(12,18,14,.92);border:2px solid #5fcf3a;border-radius:18px;padding:14px;color:#eaffd0;box-shadow:0 12px 40px #000a}
#dlg.on{display:flex}#dlg h3{margin:0;font:900 18px 'Lilita One'}#dlg .sub{opacity:.85;font:700 13px Nunito;margin:0 0 6px}
#dlg .opts{display:flex;flex-direction:column;gap:6px}#dlg .opts button{border:0;border-radius:12px;padding:10px 12px;font:900 14px Nunito;background:#234a28;color:#eaffd0;cursor:pointer;text-align:left}
#dlg .opts button.f{outline:3px solid #ffd23f!important}
`;
