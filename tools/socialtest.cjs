// v1.8.0: profiles, stats, leaderboard, public/private lobbies, lobby browser (pad), rate limits
const pp=require('puppeteer-core'),{spawn}=require('child_process'),fs=require('fs');const sl=ms=>new Promise(r=>setTimeout(r,ms));
const SH='/workspace/ui-shots/grow/';
(async()=>{const PORT=3291,U=`http://localhost:${PORT}`;const DATA='/tmp/bt-social-'+Date.now()+'.json';
const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:'',BT_DATA:DATA,BT_STAT_MS:1500},stdio:['ignore',fs.openSync('/tmp/srv-social.log','w'),fs.openSync('/tmp/srv-social.log','a')]});await sl(900);
const res=[];const ok=(n,c,i='')=>{res.push(!!c);console.log(c?'PASS':'FAIL',n,i)};
const J=async(meth,url,body,tok)=>{const r=await fetch(U+url,{method:meth,headers:{'content-type':'application/json','x-bt-token':tok||''},body:body?JSON.stringify(body):undefined});return {s:r.status,j:await r.json().catch(()=>({}))}};
try{
// ---- API
const a=await J('POST','/api/signup',{user:'alice',pass:'pass1'}),bb=await J('POST','/api/signup',{user:'bob_b',pass:'pass1'});ok('signup',a.j.token&&bb.j.token);
let r=await J('GET','/api/u/alice');ok('public profile defaults',r.s==200&&r.j.dn=='alice'&&r.j.joined>0&&r.j.stats.plants===0,JSON.stringify(r.j).slice(0,120));
ok('unknown profile 404',(await J('GET','/api/u/nobody9')).s==404);ok('bad name 400',(await J('GET','/api/u/'+encodeURIComponent('<x>'))).s==400);
ok('pub needs login',(await J('PUT','/api/pub',{dn:'Al'})).s==401);
ok('short display name rejected',(await J('PUT','/api/pub',{dn:'x'},a.j.token)).s==400);
r=await J('PUT','/api/pub',{dn:'Alice <b>Green</b>',bio:'Grows '+'x'.repeat(300)},a.j.token);ok('display name sanitized + bio capped',r.s==200&&!/[<>]/.test(r.j.dn)&&r.j.bio.length==160,r.j.dn);
await J('PUT','/api/pub',{dn:'Alice Green',bio:'Head grower at Dead Calm. Purple Owl forever 🦉'},a.j.token);
await J('PUT','/api/pub',{dn:'Bobby B',bio:'Trimmer, packer, delivery guy.'},bb.j.token);
ok('lobbies empty',(await J('GET','/api/lobbies')).j.length===0);
// ---- browser
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:300000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const BR=[b];const mkP=async(tok,user)=>{const bx=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:300000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});BR.push(bx);const P=await bx.newPage();await P.setViewport({width:960,height:540});P.errs=[];P.on('pageerror',e=>P.errs.push(e.message));
 await P.evaluateOnNewDocument((tok,user)=>{try{localStorage.bt_seenacct=1;localStorage.bt_seen_version='99.0.0';localStorage.bt_look=JSON.stringify(user=='alice'?{v:1,sex:'f',tone:2,hair:'long',hcol:4,fit:{top:{id:'tee',c:10,p:0},bot:{id:'jeans',c:16,p:0},shoe:{id:'sneakers',c:0,p:0}}}:{v:1,sex:'m',tone:5,hair:'parted',hcol:1,fit:{top:{id:'tee',c:6,p:0},bot:{id:'jeans',c:16,p:0},shoe:{id:'sneakers',c:0,p:0}}});localStorage.bt_nm=user?user.slice(0,5).toUpperCase():'GUEST';if(tok){localStorage.bt_tok=tok;localStorage.bt_user=user}}catch(e){};window.__pad={id:'Xbox Sim',index:0,connected:true,mapping:'standard',timestamp:0,buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0})),axes:[0,0,0,0]};navigator.getGamepads=()=>[window.__pad,null,null,null]},tok,user);
 await P.goto(U+'/?q=1',{waitUntil:'load',timeout:90000});await sl(1500);await P.evaluate(()=>window.dispatchEvent(new Event('gamepadconnected')));return P};
const H=f=>({ev:(g,...x)=>f.evaluate(g,...x),frames:async n=>{await f.bringToFront();const f0=await f.evaluate(()=>__bt.frames);while(await f.evaluate(()=>__bt.frames)<f0+n)await sl(15)},
 press:async(i)=>{await f.bringToFront();const s=v=>f.evaluate((i,v)=>{const b=__pad.buttons[i];b.pressed=v;b.value=v?1:0},i,v);const fr=async n=>{const f0=await f.evaluate(()=>__bt.frames);while(await f.evaluate(()=>__bt.frames)<f0+n)await sl(15)};await s(true);await fr(3);await s(false);await fr(3)},
 st:()=>f.evaluate(()=>__bt.state()),vis:id=>f.evaluate(id=>!!document.getElementById(id)?.offsetParent,id),txt:id=>f.evaluate(id=>document.getElementById(id)?.innerText||'',id)});
const A=0,B=1,DOWN=13,UP=12;
const PA=await mkP(a.j.token,'alice'),ha=H(PA);await sl(800);
ok('menu shows profile/lobby/leaderboard buttons',await ha.ev(()=>['lobbies','lb','myprof'].every(k=>document.querySelector(`[data-a=${k}]`)?.offsetParent)));
await ha.ev(()=>document.querySelector('[data-a=host]').click());await sl(900);
ok('host lobby shown',await ha.vis('m-lobby'));ok('private by default',/Private/.test(await ha.txt('bpub')));
const code=await ha.txt('lcode');
// pad: focus pub toggle and press A
await ha.ev(()=>__bt.focusEl(document.getElementById('bpub')));await ha.press(A);await sl(400);
ok('pad toggles public',/Public/.test(await ha.txt('bpub')));
r=await J('GET','/api/lobbies');ok('lobby listed',r.j.length==1&&r.j[0].code==code&&r.j[0].n==1&&r.j[0].host=='ALICE',JSON.stringify(r.j));
// bob browses with the pad
const PB=await mkP(bb.j.token,'bob_b'),hb=H(PB);await sl(800);
await hb.ev(()=>__bt.focusEl(document.querySelector('[data-a=lobbies]')));await hb.press(A);await sl(900);
ok('browser opened via pad',await hb.vis('m-lobbies'));const row=await hb.txt('lbl');ok('row: host, players, day, ping',/ALICE/.test(row)&&/1\/4/.test(row)&&/ms/.test(row),row.replace(/\s+/g,' '));
ok('default focus on Join',(await hb.ev(()=>document.querySelector('.f')?.dataset.lj))==code);
await PB.screenshot({path:SH+'v180-lobby-browser.png'});
await hb.press(A);await sl(1200);ok('bob joined via pad',await hb.vis('m-lobby')&&(await hb.txt('lcode'))==code);
const lob=await ha.txt('lpl');ok('roster has profile buttons',(await ha.ev(()=>document.querySelectorAll('#lpl [data-pu]').length))==2,lob.replace(/\s+/g,' '));
await PA.screenshot({path:SH+'v180-lobby-room.png'});
// quick join (guest) + private hides
const PC=await mkP('',''),hc=H(PC);await sl(600);await hc.ev(()=>document.querySelector('[data-a=lobbies]').click());await sl(700);await hc.ev(()=>document.querySelector('[data-a=quickjoin]').click());await sl(1200);
ok('quick join (guest)',(await hc.txt('lcode'))==code);ok('guest shows no profile',/guest/.test(await ha.txt('lpl')));
await ha.ev(()=>document.getElementById('bpub').click());await sl(400);ok('private hides from browser',(await J('GET','/api/lobbies')).j.length==0);
await PC.browser().close();await sl(400);
// ws join rate limit
{const WS=require('ws');let errs=0;for(let i=0;i<22;i++){await new Promise(res=>{const s=new WS(`ws://localhost:${PORT}/ws`);s.on('open',()=>s.send(JSON.stringify({t:'join',code:'ZZZZ',name:'x'})));s.on('message',d=>{const m=JSON.parse(d);if(/Too many/.test(m.e||''))errs++;s.close();res()});setTimeout(res,1500)})}ok('ws join rate limited',errs>0,errs)}
// start + stats accrual
await ha.ev(()=>document.querySelector('[data-a=start]').click());await sl(2500);
await ha.ev(()=>__bt.send({t:'dbg',cnt:{plants:3,grams:42,jars:5,drev:310},earn:1200}));await sl(4000);
const sa=(await J('GET','/api/u/alice')).j.stats,sb=(await J('GET','/api/u/bob_b')).j.stats;
ok('stats credited to host',sa.plants==3&&sa.grams==42&&sa.jars==5&&sa.drev==310&&sa.earned==1200&&sa.play>0,JSON.stringify(sa));
ok('co-op stats credited to bob',sb.plants==3&&sb.earned==1200,JSON.stringify(sb));
r=await J('GET','/api/leaderboard?k=grams');ok('leaderboard',r.j.k=='grams'&&r.j.rows.length==2&&r.j.rows[0].v==42&&r.j.rows.some(x=>x.dn=='Alice Green'),JSON.stringify(r.j));
ok('leaderboard bad key falls back',(await J('GET','/api/leaderboard?k=__proto__')).j.k=='earned');
// in-game: look at bob, press A -> profile
await sl(1500);let O=await ha.ev(()=>__bt.oth());ok('peer avatar present',O.length==1,JSON.stringify(O));
if(O.length){const o=O[0];await ha.ev(o=>{__bt.tp(o.x,o.z+1.6);__bt.lookAt(o.x,1.3,o.z)},o);await ha.frames(8);const t=await ha.txt('prompt');ok('look-at-player prompt',/View BOB_B's profile|View BOB_B/.test(t),t);
 await ha.press(A);await sl(1500);ok('A opens profile in-game',await ha.vis('m-prof')&&/Bobby B/.test(await ha.txt('pfv')),await ha.txt('pfv'));
 await PA.screenshot({path:SH+'v180-profile-ingame.png'});await ha.press(B);await sl(500);
 await ha.ev(()=>document.querySelector('[data-a=pfback]').click());await sl(500);ok('back returns to game/pause',!(await ha.vis('m-prof')))}
// pause -> players
await ha.ev(()=>document.querySelector('[data-a=players]').click());await sl(500);ok('pause players list',await ha.vis('m-players')&&(await ha.ev(()=>document.querySelectorAll('#plv [data-pu]').length))==2);
// own profile edit (bob, from menu)
await PB.browser().close();
const PD=await mkP(a.j.token,'alice'),hd=H(PD);await sl(900);
await hd.ev(()=>document.querySelector('[data-a=myprof]').click());await sl(1200);
ok('own profile editable',await hd.ev(()=>!!document.getElementById('pfdn')&&document.getElementById('pfdn').value=='Alice Green'));
await hd.ev(()=>{document.getElementById('pfbio').value='Head grower at Dead Calm. Purple Owl forever 🦉 · 42g club'});await hd.ev(()=>__bt.focusEl(document.querySelector('[data-a=pfsave]')));await hd.press(A);let sv=false;for(let i=0;i<20&&!sv;i++){await sl(300);sv=/42g club/.test((await J('GET','/api/u/alice')).j.bio)}
ok('profile saved via pad',sv,(await hd.txt('pferr'))+JSON.stringify(await hd.st()).slice(0,80));
await PD.screenshot({path:SH+'v180-profile.png'});
await hd.ev(()=>document.querySelector('[data-a=pfback]').click());await sl(400);await hd.ev(()=>document.querySelector('[data-a=lb]').click());await sl(1200);
ok('leaderboard UI',/Alice Green/.test(await hd.txt('lbd')));await PD.screenshot({path:SH+'v180-leaderboard.png'});
await hd.ev(()=>__bt.focusEl(document.querySelector('[data-lbk=grams]')));await hd.press(A);await sl(1000);ok('switch stat via pad',/42/.test(await hd.txt('lbd')));
// rate limit on profile writes
let c429=0;for(let i=0;i<10;i++)if((await J('PUT','/api/pub',{bio:'spam'+i},bb.j.token)).s==429)c429++;ok('profile write rate limited',c429>0,c429);
// persistence
const db=JSON.parse(fs.readFileSync(DATA,'utf8'));ok('stats persisted in store',db['stat:alice']?.grams==42&&db['pub:alice']?.dn=='Alice Green');
ok('no page errors',![PA,PD].some(p=>p.errs.length),[...PA.errs,...PD.errs].join('|'));
for(const x of BR)await x.close().catch(()=>{})}catch(e){console.log('FAIL exception',e.stack)}
srv.kill();console.log(res.filter(x=>x).length+'/'+res.length);process.exit(0)})();
