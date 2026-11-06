// Real-money currency packs via Stripe Checkout (live or test).
// Env: STRIPE_SECRET_KEY=sk_live_…|sk_test_…  STRIPE_WEBHOOK_SECRET=whsec_…
//      STRIPE_PRICE_STARTER / GROWER / TYCOON = price_…   PUBLIC_URL=https://host
import Stripe from 'stripe';
import express from 'express';

export const PACKS=[
  {id:'starter',n:'Starter Bundle',cash:5000,usd:'$4.99',env:'STRIPE_PRICE_STARTER'},
  {id:'grower',n:'Grower Bundle',cash:12000,usd:'$9.99',env:'STRIPE_PRICE_GROWER'},
  {id:'tycoon',n:'Tycoon Bundle',cash:30000,usd:'$19.99',env:'STRIPE_PRICE_TYCOON'}
];

const sk=()=>process.env.STRIPE_SECRET_KEY||'';
const skOk=k=>k.startsWith('sk_live_')||k.startsWith('sk_test_');
export function stripeReady(){
  const k=sk();
  if(!skOk(k))return {ok:0,why:!k?'STRIPE_SECRET_KEY missing':'STRIPE_SECRET_KEY must be sk_live_… or sk_test_…'};
  const miss=PACKS.filter(p=>!process.env[p.env]).map(p=>p.env);
  if(miss.length)return {ok:0,why:'Missing '+miss.join(', ')};
  if(!(process.env.PUBLIC_URL||'').startsWith('http'))return {ok:0,why:'PUBLIC_URL missing'};
  if(!(process.env.STRIPE_WEBHOOK_SECRET||'').startsWith('whsec_'))return {ok:0,why:'STRIPE_WEBHOOK_SECRET missing'};
  return {ok:1,live:k.startsWith('sk_live_')};
}
export function packPublic(){
  const r=stripeReady();
  return {ready:!!r.ok,why:r.why||null,live:!!r.live,test:!r.live,packs:PACKS.map(p=>({id:p.id,n:p.n,cash:p.cash,usd:p.usd}))};
}
const client=()=>{const r=stripeReady();if(!r.ok)throw new Error(r.why);return new Stripe(sk(),{apiVersion:'2024-11-20.acacia'})};

export function mountShopEarly(app,store,rooms){
  // must be registered BEFORE express.json()
  app.post('/api/shop/webhook',express.raw({type:'application/json'}),(q,r)=>{
    (async()=>{
      const wh=process.env.STRIPE_WEBHOOK_SECRET||'';
      if(!wh.startsWith('whsec_')||!skOk(sk()))return r.status(503).send('not configured');
      let ev;try{ev=new Stripe(sk(),{apiVersion:'2024-11-20.acacia'}).webhooks.constructEvent(q.body,q.get('stripe-signature'),wh)}
      catch(e){return r.status(400).send(e.message)}
      if(ev.type==='checkout.session.completed')await fulfill(store,rooms,ev.data.object);
      r.json({received:1});
    })().catch(e=>{console.error('wh',e);r.status(500).send('err')});
  });
}

export function mountShop({app,store,authed,A,rooms}){
  app.get('/api/shop/packs',A(async(q,r)=>r.json(packPublic())));
  app.post('/api/shop/checkout',authed(async(q,r,u)=>{
    const ready=stripeReady();if(!ready.ok)return r.status(503).json({e:ready.why});
    const pack=PACKS.find(p=>p.id===String(q.body?.pack||''));if(!pack)return r.status(400).json({e:'Unknown pack'});
    const sid=String(q.body?.save||'').replace(/\W/g,'');if(!sid)return r.status(400).json({e:'Load a logged-in farm save first'});
    if(!(await store.get('save:'+u+':'+sid)))return r.status(404).json({e:'Save not found'});
    const base=(process.env.PUBLIC_URL||'').replace(/\/$/,'');
    const sess=await client().checkout.sessions.create({
      mode:'payment',line_items:[{price:process.env[pack.env],quantity:1}],
      success_url:base+'/?shop=ok&session_id={CHECKOUT_SESSION_ID}',cancel_url:base+'/?shop=cancel',
      client_reference_id:u+':'+sid+':'+pack.id,
      metadata:{user:u,save:sid,pack:pack.id}
    });
    r.json({url:sess.url,id:sess.id});
  }));
  app.post('/api/shop/claim',authed(async(q,r,u)=>{
    const ready=stripeReady();if(!ready.ok)return r.status(503).json({e:ready.why});
    const id=String(q.body?.session||'');
    if(!/^cs_(test|live)_/.test(id))return r.status(400).json({e:'Invalid Checkout session'});
    const sess=await client().checkout.sessions.retrieve(id);
    if(sess.payment_status!=='paid')return r.status(400).json({e:'Payment not complete'});
    if(sess.metadata?.user!==u)return r.status(403).json({e:'Wrong account'});
    r.json(await fulfill(store,rooms,sess));
  }));
}

async function fulfill(store,rooms,sess){
  const id=sess.id;if(!id)return {ok:0,e:'no session'};
  const key='paid:'+id;if(await store.get(key))return {ok:1,dup:1,cash:0};
  const u=sess.metadata?.user,sid=sess.metadata?.save,packId=sess.metadata?.pack;
  const pack=PACKS.find(p=>p.id===packId);if(!u||!sid||!pack)return {ok:0,e:'bad metadata'};
  const cash=pack.cash;// server table only — never trust client amounts
  await store.set(key,{at:Date.now(),u,sid,pack:packId,cash});
  for(const room of rooms.values()){
    if(room.owner===u&&room.sid===sid&&room.w){
      room.w.money=(room.w.money||0)+cash;room.w.toast={t:`💎 +$${cash.toLocaleString()} (${pack.n})`,pid:room.host};
      room.dirty=true;room.w._sv=1;break;
    }
  }
  const sv=await store.get('save:'+u+':'+sid);
  if(sv?.w){sv.w.money=(sv.w.money||0)+cash;sv.at=Date.now();await store.set('save:'+u+':'+sid,sv)}
  return {ok:1,cash,pack:packId};
}
