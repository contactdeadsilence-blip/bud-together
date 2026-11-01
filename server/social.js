// v1.8.0 social: public profiles, lifetime stats + leaderboard, public lobby browser. Stored in the kv store (Postgres in prod).
import {bizOf} from './biz.js';
export const STATK=['plants','grams','jars','earned','play','drev','rep','biz'];
export const STATN={plants:'Plants grown',grams:'Grams harvested',jars:'Jars sold',earned:'Money earned',play:'Playtime',drev:'Dispensary revenue',rep:'Best reputation',biz:'Businesses owned'};
const clean=(s,n)=>String(s??'').replace(/[\u0000-\u001f\u007f<>]/g,'').replace(/\s+/g,' ').trim().slice(0,n);
const okName=u=>/^[a-z0-9_]{3,16}$/.test(u);
// tiny per-key token-bucket limiter
export function limiter(per,ms){const M=new Map();return k=>{const now=Date.now();let b=M.get(k);if(!b||now-b.t>ms){b={t:now,n:0};M.set(k,b)}if(M.size>5000)for(const[x,v]of M)if(now-v.t>ms)M.delete(x);return ++b.n<=per}}
export function cnt(w,k,n){(w.cnt??={})[k]=(w.cnt[k]||0)+n}
export function setupSocial({app,store,authed,A,rooms,who}){
 const rl=limiter(90,60000),rlw=limiter(8,60000),ip=q=>q.ip||q.socket?.remoteAddress||'?';
 const lim=(L,f)=>(q,r,...a)=>L(ip(q))?f(q,r,...a):r.status(429).json({e:'Slow down — try again in a minute'});
 const pubOf=async u=>{const a=await store.get('user:'+u);if(!a)return null;const p=(await store.get('pub:'+u))||{};const s=(await store.get('stat:'+u))||{};
  return {u,dn:p.dn||u,bio:p.bio||'',look:p.look||null,joined:a.c||null,stats:Object.fromEntries(STATK.map(k=>[k,Math.round(s[k]||0)]))}};
 app.get('/api/u/:name',lim(rl,A(async(q,r)=>{const u=String(q.params.name||'').toLowerCase();if(!okName(u))return r.status(400).json({e:'Bad username'});const p=await pubOf(u);if(!p)return r.status(404).json({e:'No such player'});r.json(p)})));
 app.put('/api/pub',lim(rlw,authed(async(q,r,u)=>{const b=q.body||{};const dn=clean(b.dn,20),bio=clean(b.bio,160);if(b.dn!=null&&dn.length<2)return r.status(400).json({e:'Display name: 2-20 characters'});
  const look=b.look&&typeof b.look=='object'&&JSON.stringify(b.look).length<3000?b.look:undefined;const o=(await store.get('pub:'+u))||{};if(b.dn!=null)o.dn=dn;if(b.bio!=null)o.bio=bio;if(look)o.look=look;await store.set('pub:'+u,o);r.json(await pubOf(u))})));
 let lbc={t:0,v:null};
 app.get('/api/leaderboard',lim(rl,A(async(q,r)=>{const k=STATK.includes(q.query.k)?q.query.k:'earned';if(!lbc.v||Date.now()-lbc.t>15000){const L=await store.list('stat:');const P=await store.list('pub:');const dn=Object.fromEntries(P.map(({k,v})=>[k.slice(4),v.dn]));lbc={t:Date.now(),v:L.map(({k,v})=>({u:k.slice(5),dn:dn[k.slice(5)]||k.slice(5),...v}))}}
  r.json({k,rows:lbc.v.filter(x=>!x.cheat&&(x[k]||0)>0).sort((a,b)=>(b[k]||0)-(a[k]||0)).slice(0,25).map((x,i)=>({rank:i+1,u:x.u,dn:x.dn,v:Math.round(x[k]||0)}))})})));
 app.get('/api/lobbies',lim(rl,(q,r)=>{r.json([...rooms.values()].filter(x=>x.pub&&x.players.length&&x.players.length<4).map(x=>{const h=x.players.find(p=>p.id===x.host)||x.players[0];return {code:x.code,host:h?.name||'?',hu:h?.u||null,n:x.players.length,day:x.w.day|0,started:!!x.started,name:x.sname||''}}).sort((a,b)=>b.n-a.n).slice(0,50))}));
 const STMS=+process.env.BT_STAT_MS||10000;
 // stats accrual: every 10s, room deltas credited to every logged-in player present (co-op = shared credit)
 setInterval(async()=>{for(const r of rooms.values()){if(!r.started)continue;const w=r.w,c={...(w.cnt||{}),earned:w.earned||0};if(!r._cnt){r._cnt=c;continue}const p=r._cnt;const b=bizOf(w);
  const d={plants:(c.plants||0)-(p.plants||0),grams:(c.grams||0)-(p.grams||0),jars:(c.jars||0)-(p.jars||0),drev:(c.drev||0)-(p.drev||0),earned:Math.max(0,(c.earned||0)-(p.earned||0))};r._cnt={...c};
  for(const pl of r.players){if(!pl.u)continue;try{const s=(await store.get('stat:'+pl.u))||{};for(const k in d)if(d[k]>0)s[k]=(s[k]||0)+d[k];if(r.w?.cheat)s.cheat=1;s.play=(s.play||0)+(pl.paused?0:STMS/1000);if(b.opened)s.rep=Math.max(s.rep||0,b.rep||0);s.biz=Math.max(s.biz||0,b.opened?Math.max(1,(b.locs||[]).length):0);await store.set('stat:'+pl.u,s)}catch(e){console.error('stat',e.message)}}}},STMS);
}
