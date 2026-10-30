// accounts + saves: signup/login, wrong pw, profile + farm round trip, restart persistence (file store), co-op host load
const WS=require('ws'),{spawn}=require('child_process'),fs=require('fs'),os=require('os'),path=require('path');const sl=ms=>new Promise(r=>setTimeout(r,ms));
const PORT=3209,B=`http://localhost:${PORT}`,DATA=path.join(os.tmpdir(),'bt-savetest-'+process.pid+'.json');
const up=()=>{const p=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,BT_DATA:DATA,BT_AUTOSAVE_MS:1000,DATABASE_URL:''},stdio:'ignore'});return sl(900).then(()=>p)};
const res=[];const ok=(n,c,i='')=>{res.push(!!c);console.log(c?'PASS':'FAIL',n,i)};
const api=async(m,u,b,t)=>{const r=await fetch(B+u,{method:m,headers:{'content-type':'application/json','x-bt-token':t||''},body:b?JSON.stringify(b):undefined});return {s:r.status,j:await r.json().catch(()=>({}))}};
const cl=()=>new Promise(r=>{const ws=new WS(`ws://localhost:${PORT}/ws`);const c={ws,w:null};ws.on('message',d=>{const m=JSON.parse(d);if(m.t=='joined')c.code=m.code,c.id=m.id,c.save=m.save;if(m.t=='roster')c.pl=m.pl;if(m.t=='err')c.err=m.e;if(m.t=='w')c.w=m.w});ws.on('open',()=>r(c))});
const tx=(c,m)=>c.ws.send(JSON.stringify(m));
(async()=>{let srv=await up();
let a=await api('POST','/api/signup',{user:'Gumprr',pass:'weed420'});ok('sign-up',a.s==200&&a.j.token&&a.j.user=='gumprr');
ok('duplicate username rejected',(await api('POST','/api/signup',{user:'gumprr',pass:'x1234'})).s==409);
ok('wrong password rejected',(await api('POST','/api/login',{user:'gumprr',pass:'nope'})).s==401);
ok('unknown user rejected',(await api('POST','/api/login',{user:'ghost',pass:'nope'})).s==401);
let L=await api('POST','/api/login',{user:'GUMPRR',pass:'weed420'});ok('log-in',L.s==200&&L.j.token);const T=L.j.token;
ok('no token -> 401',(await api('GET','/api/saves')).s==401);
const prof={bt_look:JSON.stringify({sex:'f',skin:3}),bt_outfits:'[{"n":"A"}]',bt_owned:'["hoodie"]',bt_set:'{"sens":7}',bt_binds:'{"use":2}'};
await api('PUT','/api/profile',prof,T);const P=(await api('GET','/api/profile',null,T)).j;ok('profile round trip (look, outfits, owned, settings, remaps)',JSON.stringify(P)==JSON.stringify(prof));
const raw=fs.readFileSync(DATA,'utf8');ok('password stored hashed',!raw.includes('weed420')&&raw.includes('"salt"'));
// host a farm, mutate world, save
const H=await cl();tx(H,{t:'host',name:'G',token:T});await sl(200);ok('logged-in host gets a save slot',H.save&&H.save.owner=='gumprr');tx(H,{t:'start'});await sl(400);
tx(H,{t:'dbg',money:777,spawn:{x:0,z:-2,s:'haze',age:300,water:60},give:'shelf'});await sl(400);
const pot=H.w.ents.find(e=>e.type=='pot'&&e.data.plant?.age>=300);tx(H,{t:'save'});await sl(400);
let S=(await api('GET','/api/saves',null,T)).j;ok('saves list',S.length==1&&S[0].money==927&&S[0].plants==1,JSON.stringify(S));
const sid=S[0].id;const age0=pot.data.plant.age;H.ws.close();await sl(500);
// restart server — file store persists
srv.kill('SIGTERM');await sl(500);srv=await up();
ok('session survives restart',(await api('GET','/api/me',null,T)).j.user=='gumprr');
S=(await api('GET','/api/saves',null,T)).j;ok('save survives restart',S.length==1&&S[0].id==sid);
ok('profile survives restart',JSON.stringify((await api('GET','/api/profile',null,T)).j)==JSON.stringify(prof));
await sl(3000);// offline time must not drain or grow plants
const H2=await cl();tx(H2,{t:'host',name:'G',token:T,save:sid});await sl(200);const F=await cl();tx(F,{t:'join',code:H2.code,name:'FRIEND',look:{sex:'m',skin:1}});await sl(200);tx(H2,{t:'start'});await sl(400);
const p2=H2.w.ents.find(e=>e.id==pot.id);ok('co-op host loads farm (money, plant, shelf)',H2.w.money==927&&p2&&H2.w.ents.some(e=>e.type=='shelf'),H2.w.money);
ok('plant paused while offline (alive, not drained)',p2&&!p2.data.plant.dead&&p2.data.plant.age-age0<5&&p2.data.moist>50,p2&&JSON.stringify([p2.data.plant.age,age0,p2.data.moist]));
ok('held items dropped back into world',H2.w.ents.filter(e=>e.by).length==0);
ok('friend keeps own character',F.pl&&F.pl.find(p=>p.name=='FRIEND')?.look?.sex=='m');
tx(H2,{t:'dbg',money:3});await sl(1600);ok('autosave',(await api('GET','/api/saves',null,T)).j[0].money==930);
ok('bad save id rejected',await (async()=>{const X=await cl();tx(X,{t:'host',token:T,save:'nope'});await sl(200);return X.err=='Save not found'})());
const G=await cl();tx(G,{t:'host',name:'guest'});await sl(200);ok('guest mode hosts without a save',G.code&&!G.save);
await api('POST','/api/logout',null,T);ok('logout kills session',(await api('GET','/api/me',null,T)).s==401);
srv.kill();fs.rmSync(DATA,{force:true});const n=res.filter(Boolean).length;console.log(`${n}/${res.length} passed`);process.exit(n==res.length?0:1)})();
