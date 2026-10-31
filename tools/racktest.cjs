// seed rack: buy/give, wall snap, store per strain+type up to 10, take by slot, block move when full, persists in snapshot
const WS=require('ws'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));const PORT=3214;
const res=[];const ok=(n,c,i='')=>{res.push(!!c);console.log(c?'PASS':'FAIL',n,i)};
(async()=>{const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:'',BT_DATA:'/tmp/bt-rack.json'},stdio:'ignore'});await sl(900);
const c={w:null};const ws=new WS(`ws://localhost:${PORT}/ws`);ws.on('message',d=>{const m=JSON.parse(d);if(m.t=='w')c.w=m.w});await new Promise(r=>ws.on('open',r));const tx=m=>ws.send(JSON.stringify(m));
tx({t:'host',name:'R'});await sl(200);tx({t:'start'});await sl(300);
tx({t:'dbg',money:500});await sl(200);const m0=c.w.money;tx({t:'buy',item:'seedrack'});await sl(400);ok('seed rack is buyable',c.w.money==m0-35||c.w.ents.some(e=>e.type=='seedrack'),m0+'->'+c.w.money);
c.w.ents.filter(e=>e.type=='seedrack').forEach(()=>0);tx({t:'dbg',give:'seedrack'});await sl(300);let rk=c.w.ents.find(e=>e.type=='seedrack'&&e.by);ok('holding a rack',!!rk);
tx({t:'drop',x:1,z:4.6,y:0});await sl(300);rk=c.w.ents.find(e=>e.id==rk.id);ok('rack snaps to nearest wall facing the room',Math.abs(rk.z-(5-.06))<.01&&Math.abs(Math.abs(rk.ry)-Math.PI)<.01,JSON.stringify([rk.x,rk.z,rk.ry]));
const put=async(k,slot)=>{tx({t:'dbg',give:k});await sl(150);tx({t:'use',target:rk.id,slot});await sl(150)};
for(let i=0;i<11;i++)await put('seed_haze',0);rk=c.w.ents.find(e=>e.id==rk.id);let S=rk.data.sl;
ok('same strain+type stacks to 10 per slot',S[0].k=='seed_haze'&&S[0].n.length==10,JSON.stringify(S.map(s=>s&&[s.k,s.n.length])));ok('11th overflows into another slot',S.filter(s=>s&&s.k=='seed_haze').length==2);
await put('seed_kush_f',0);rk=c.w.ents.find(e=>e.id==rk.id);S=rk.data.sl;ok('different strain/type gets its own slot',S.some(s=>s&&s.k=='seed_kush_f'&&s.n.length==1));
tx({t:'dbg',give:'soil'});await sl(150);const n0=c.w.ents.length;tx({t:'use',target:rk.id,slot:2});await sl(150);ok('non-seed rejected',c.w.ents.find(e=>e.type=='soil'&&e.by));
tx({t:'trash'});await sl(100);
const held=()=>c.w.ents.filter(e=>e.by).length;for(const e of c.w.ents.filter(e=>e.by)){tx({t:'drop',x:-2,z:0});await sl(120)}
tx({t:'use',target:rk.id,slot:0,only:true});await sl(200);rk=c.w.ents.find(e=>e.id==rk.id);ok('take from aimed slot',rk.data.sl[0].n.length==9&&c.w.ents.some(e=>e.by&&e.type=='seed_haze'),rk.data.sl[0].n.length);
for(const e of c.w.ents.filter(e=>e.by)){tx({t:'drop',x:-2,z:0});await sl(120)}
const tot=r=>r.data.sl.reduce((a,x)=>a+(x?.n?.length||0),0);const t0=tot(rk);
tx({t:'use',target:rk.id,slot:-1});await sl(200);rk=c.w.ents.find(e=>e.id==rk.id);ok('loaded rack picks up when aiming at frame',!!rk.by);ok('stored seeds travel with the rack',tot(rk)==t0&&t0>0,t0);
tx({t:'drop',x:-1.8,z:1,y:0});await sl(300);rk=c.w.ents.find(e=>e.id==rk.id);ok('re-placed rack snaps to a wall, seeds kept',!rk.by&&Math.abs(Math.abs(rk.x)-3)<1.2&&tot(rk)==t0,JSON.stringify([rk.x,rk.z,rk.ry]));
tx({t:'dbg',give:'seedrack'});await sl(200);const r2=c.w.ents.find(e=>e.type=='seedrack'&&e.by);tx({t:'drop',x:0,z:-4.5,y:0});await sl(250);tx({t:'use',target:r2.id,slot:1});await sl(200);ok('fresh empty rack: empty hands on a slot picks it up',c.w.ents.find(e=>e.id==r2.id).by);
srv.kill();require('fs').rmSync('/tmp/bt-rack.json',{force:true});const n=res.filter(Boolean).length;console.log(`${n}/${res.length} passed`);process.exit(n==res.length?0:1)})();
