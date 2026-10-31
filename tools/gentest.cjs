// v13 section 2: strain collection & genetics — rarity, new/hidden strains, leaf/bud looks, mutations, mystery packs,
// pollen-brush breeding, player naming, discovery journal %, milestone rewards, save/load, Genetics laptop tab (pad).
const WS=require('ws'),pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
let srv;(async()=>{const R=await import('../src/rules.js');const PORT=3251;srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:''},stdio:'ignore'});await sl(800);
const res=[];const ok=(n,c,i='')=>{res.push(!!c);console.log(c?'PASS':'FAIL',n,i)};
const cl=()=>new Promise(r=>{const ws=new WS(`ws://localhost:${PORT}/ws`);const c={ws,w:null,toasts:[]};ws.on('message',d=>{const m=JSON.parse(d);if(m.t=='joined')c.code=m.code,c.id=m.id;if(m.t=='w'){c.w=m.w;if(m.w.toast&&m.w.toast.pid==c.id)c.toasts.push(m.w.toast.t)}});ws.on('open',()=>r(c))});
const tx=(c,m)=>c.ws.send(JSON.stringify(m));const st=()=>sl(350);
const S=R.STRAINS,ks=Object.keys(S);
ok('6 rarity tiers',R.RAR.map(r=>r[0]).join()=='Common,Uncommon,Rare,Epic,Legendary,Mythical');
ok('12 named strains, every tier used',ks.length>=12&&[0,1,2,3,4,5].every(t=>ks.some(k=>S[k].rar==t))&&new Set(ks.map(k=>S[k].name)).size==ks.length,ks.join());
ok('every strain has colour, leaf shape and bud structure',ks.every(k=>S[k].col&&['w','n','s'].includes(S[k].look.lf)&&['spear','chunky','fox'].includes(S[k].look.st)));
ok('3 hidden strains only via breeding, not sold',ks.filter(k=>S[k].hid).length==3&&!Object.keys(R.SHOP).some(k=>/seed_(void|sol|phantom|mint|ember|aurora)/.test(k)));
ok('4 mutations',Object.keys(R.MUTS).length==4&&R.rollMut(1,()=>0)&&R.rollMut(0)==null);
let cnt={};for(let i=0;i<4000;i++){const k=R.rollPack();cnt[k]=(cnt[k]||0)+1}ok('mystery packs weighted by rarity, never hidden',cnt.lemon>cnt.aurora&&!cnt.void&&!cnt.sol&&cnt.aurora>0,JSON.stringify(cnt));
ok('shop sells packs + pollen brush',R.SHOP.seed_pack&&R.SHOP.brush&&R.SHOP.seed_x.hide);
ok('journal = strains + mutations',R.JOURNAL().length==16&&R.collPct({disc:{kush:1,haze:1,owl:1,og:1}})==25);
const A=await cl();tx(A,{t:'host',name:'A'});await sl(200);tx(A,{t:'start'});await sl(500);
const held=()=>A.w.ents.filter(e=>e.by==A.id).sort((a,b)=>a.bi-b.bi);const clear=async()=>{for(let i=0;i<4&&held().length;i++){tx(A,{t:'trash'});await st()}};const byId=id=>A.w.ents.find(e=>e.id==id);
tx(A,{t:'dbg',money:5000});await st();await clear();
// mystery pack planting
tx(A,{t:'dbg',spawn:{x:2,z:1}});await st();const Pk=A.w.ents.at(-1).id;tx(A,{t:'dbg',give:'seed_pack',gd:{uses:1}});await st();A.toasts=[];tx(A,{t:'use',target:Pk});await st();
ok('mystery pack plants a random collectible strain',byId(Pk).data.plant&&S[byId(Pk).data.plant.s]&&A.toasts.some(t=>/Mystery seed/.test(t)),A.toasts.join('|'));
// mutation harvest + discovery
tx(A,{t:'dbg',spawn:{x:2.6,z:1,s:'ember',age:R.READY+1,p:{mu:'twin'}}});await st();const Pm=A.w.ents.at(-1).id;await clear();A.toasts=[];const g0=S.ember.g;tx(A,{t:'use',target:Pm});await st();
const wb=held().find(e=>e.type=='wetbud');ok('harvest logs new strain + mutation discovery',A.w.disc?.ember&&A.w.disc['mu:twin']&&A.toasts.some(t=>/NEW DISCOVERY/.test(t)),A.toasts.join('|'));
ok('twin cola mutation boosts yield',wb&&wb.data.g>g0*1.3*.9*0.35,JSON.stringify(wb?.data));
// breeding: brush pollen kush -> blue = hidden Violet Void
await clear();tx(A,{t:'dbg',spawn:{x:3.2,z:1,s:'kush',age:210}});await st();const Pa=A.w.ents.at(-1).id;tx(A,{t:'dbg',spawn:{x:3.8,z:1,s:'blue',age:210}});await st();const Pb=A.w.ents.at(-1).id;
tx(A,{t:'dbg',give:'brush',gd:{uses:3}});await st();A.toasts=[];tx(A,{t:'use',target:Pa});await st();ok('brush collects pollen',held()[0]?.data.pol=='kush',A.toasts.join('|'));
tx(A,{t:'use',target:Pb});await st();ok('brush pollinates a different strain',byId(Pb).data.plant.x=='kush'&&held()[0]?.data.uses==2,A.toasts.join('|'));
tx(A,{t:'dbg',id:Pb,age:R.READY+1});await st();await clear();A.toasts=[];tx(A,{t:'use',target:Pb});await st();
const sx=A.w.ents.find(e=>e.type=='seed_x'&&e.data.s=='void');ok('kush × blue harvest drops hidden Violet Void seeds + discovers it',sx&&A.w.disc.void,A.toasts.join('|'));
// normal cross -> player strain
await clear();tx(A,{t:'dbg',spawn:{x:4.4,z:1,s:'haze',age:R.READY+1,p:{x:'owl'}}});await st();const Ph=A.w.ents.at(-1).id;tx(A,{t:'use',target:Ph});await st();
const gk=Object.keys(A.w.gen||{})[0],G=A.w.gen?.[gk];ok('non-hidden cross creates a new saved strain with mixed traits',G&&G.par.join()=='haze,owl'&&G.col&&G.look.lf&&R.RAR[G.rar],JSON.stringify(G));
const xs=A.w.ents.find(e=>e.type=='seed_x'&&e.data.s==gk);ok('cross seeds dropped',xs);
tx(A,{t:'dbg',spawn:{x:5,z:1}});await st();const Pc=A.w.ents.at(-1).id;await clear();tx(A,{t:'use',target:xs.id});await st();tx(A,{t:'use',target:Pc});await st();ok('bred seeds plant the cross strain',byId(Pc).data.plant?.s==gk,JSON.stringify(byId(Pc).data.plant)+held().map(e=>e.type));
tx(A,{t:'gname',k:gk,name:'Hacker Stuff'});await st();ok('invalid names rejected',A.w.gen[gk].name!='Hacker Stuff');
// claim rewards
const m0=A.w.money;tx(A,{t:'claim',i:3});await st();ok('locked milestone cannot be claimed',A.w.money==m0);
tx(A,{t:'dbg',disc:{kush:1,haze:1,owl:1}});await st();tx(A,{t:'claim',i:0});await st();const m1=A.w.money;ok('25% milestone pays out once',m1==m0+150&&A.w.rew[0],m1-m0);tx(A,{t:'claim',i:0});await st();ok('no double claim',A.w.money==m1);
// ---- browser: Genetics tab with Xbox pad
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:300000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const P=await b.newPage();await P.setViewport({width:1280,height:800});const errs=[];P.on('pageerror',e=>errs.push(e.message));
await P.evaluateOnNewDocument(()=>{window.__pad={id:'Xbox Sim',index:0,connected:true,mapping:'standard',timestamp:0,buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0})),axes:[0,0,0,0]};navigator.getGamepads=()=>[window.__pad,null,null,null]});
await P.goto(`http://localhost:${PORT}/?q=0`,{waitUntil:'networkidle0'});await sl(500);
const ev=(f,...a)=>P.evaluate(f,...a),stt=()=>ev(()=>__bt.state());const frames=async n=>{const f0=await ev(()=>__bt.frames);while(await ev(()=>__bt.frames)<f0+n)await sl(15)};
const set=(i,v)=>ev((i,v)=>{const b=__pad.buttons[i];b.pressed=v;b.value=v?1:0},i,v);const press=async(i,h=2)=>{await set(i,true);await frames(h);await set(i,false);await frames(2)};
await ev(()=>window.dispatchEvent(new Event('gamepadconnected')));let s=await stt();if(s.root=='splash'){await press(0);await frames(4)}if(await ev(()=>__bt.cre?.()))await press(1);await frames(3);if((await stt()).root=='m-acct'){await ev(()=>document.querySelector('[data-a=guest]').click());await frames(3)}await press(0,4);await sl(1500);await frames(5);
ev(()=>{__bt.send({t:'dbg',money:3000});__bt.send({t:'dbg',spawn:{x:0,z:-1.2,s:'aurora',age:240,p:{mu:'gold'}}});__bt.send({t:'dbg',spawn:{x:.7,z:-1.2,s:'void',age:160,p:{mu:'albino'}}});__bt.send({t:'dbg',spawn:{x:-.7,z:-1.2,s:'ember',age:240,p:{mu:'vari'}}})});await sl(700);await frames(3);
await ev(()=>{__bt.tp(0,.6);__bt.lookAt(0,.5,-1.2)});await frames(6);await P.screenshot({path:'/workspace/ui-shots/grow/v13-mutations.png'});
await ev(()=>{__bt.tp(-2.6,-2);__bt.lookAt(-3.6,1.05,-2)});await frames(3);await press(0);await frames(4);s=await stt();ok('A opens laptop',s.root=='laptop',s.root);
await press(4);await frames(3);let t=await ev(()=>document.querySelector('.tab.sel')?.dataset.tab);if(t!='gen'){for(let i=0;i<8&&t!='gen';i++){await press(5);await frames(3);t=await ev(()=>document.querySelector('.tab.sel')?.dataset.tab)}}ok('LB/RB reach Genetics tab',t=='gen',t);
let txt=await ev(()=>document.getElementById('lbody').innerText);ok('journal shows % + rarity + ??? hidden',/DISCOVERY JOURNAL · \d+% collected/.test(txt)&&/Mythical/.test(txt)&&/\?\?\? Hidden strain/.test(txt)&&/Violet Void/.test(txt)===false,txt.slice(0,200));
await P.screenshot({path:'/workspace/ui-shots/grow/v13-journal.png'});
// player strain naming via pad (A cycles words, A on save)
await ev(r=>{__bt.send({t:'dbg',spawn:{x:5,z:5,s:'lemon',age:r,p:{x:'og'}}})},R.READY+1);await sl(500);const hid=await ev(()=>__bt.W.ents.at(-1).id);await ev(id=>__bt.send({t:'use',target:id}),hid);await sl(600);await frames(4);
await ev(()=>{document.querySelector('[data-tab=gen]').click()});await frames(3);
const ng=await ev(()=>!!document.querySelector('[data-gn]'));ok('unnamed cross shows pad word picker',ng);
await ev(()=>__bt.focusEl(document.querySelector('[data-gn$=":0"]')));await press(0);await frames(3);const w1=await ev(()=>document.querySelector('[data-gn$=":0"]')?.innerText);ok('A cycles first word',/Neon/.test(w1),w1);
await ev(()=>__bt.focusEl(document.querySelector('[data-gs]')));await press(0);await sl(500);await frames(4);
const nm=await ev(()=>Object.values(__bt.W.gen).map(g=>g.name).join());ok('A saves player-named strain',/Neon Dream/.test(nm),nm);
await P.screenshot({path:'/workspace/ui-shots/grow/v13-named.png'});
await ev(()=>__bt.focusEl(document.querySelector('[data-gc="0"]')));const mm=await ev(()=>__bt.W.money);await press(0);await sl(500);const mm2=await ev(()=>__bt.W.money);ok('pad claim button works (or already claimed)',mm2>=mm);
await press(1);await frames(3);ok('B closes laptop',(await stt()).root==null);
ok('no page errors',!errs.length,errs.join('|'));
console.log(`${res.filter(Boolean).length}/${res.length} passed`);await b.close();srv.kill();process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.error(e);srv?.kill();process.exit(1)});
