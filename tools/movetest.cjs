// v15d: every placeable is movable (sink keeps water, desk, bed, shelf, table, trash can, drying rack, light, pot); baked fake shelf removed
const WS=require('ws'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));const PORT=3238;
const res=[];const ok=(n,c,i='')=>{res.push(!!c);console.log(c?'PASS':'FAIL',n,i)};
(async()=>{const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:'',BT_DATA:'/tmp/bt-move.json'},stdio:'ignore'});await sl(900);
const c={w:null};const ws=new WS(`ws://localhost:${PORT}/ws`);ws.on('message',d=>{const m=JSON.parse(d);if(m.t=='w')c.w=m.w});await new Promise(r=>ws.on('open',r));const tx=m=>ws.send(JSON.stringify(m));
tx({t:'host',name:'M'});await sl(200);tx({t:'start'});await sl(400);
const E=id=>c.w.ents.find(e=>e.id==id);const held=()=>c.w.ents.filter(e=>e.by);
const clear=async()=>{for(const h of held()){tx({t:'drop',x:0,z:2.5,y:0});await sl(150)}};
async function move(type,x,z){await clear();if(!c.w.ents.some(e=>e.type==type&&!e.by)){tx({t:'dbg',give:type});await sl(200);tx({t:'drop',x:1,z:1,y:0});await sl(200)}
 const e=c.w.ents.find(e=>e.type==type&&!e.by);tx({t:'use',target:e.id,only:true});await sl(250);const p=!!E(e.id)?.by;tx({t:'drop',x,z,y:0,ry:1.2});await sl(250);const n=E(e.id);
 ok(type+' picks up and re-places',p&&!n.by&&Math.hypot(n.x-x,n.z-z)<.6,JSON.stringify([p,n.x,n.z]));return n}
const sink=await move('sink',-2,3);
ok('sink no longer fixed',!sink.data.fixed);
const can=c.w.ents.find(e=>e.type=='water');tx({t:'use',target:can.id,only:true});await sl(200);tx({t:'dbg',canw:0});await sl(250);const w0=E(can.id).data.w??0;
ok('can is empty before filling',w0==0,w0);tx({t:'use',target:sink.id});await sl(300);ok('moved sink fills an EMPTY can',(E(can.id).data.w??0)>0,E(can.id).data.w);
ok('held-item rotation saved on drop',Math.abs(sink.ry-1.2)<.01,sink.ry);
for(const t of ['desk','bed','shelf','table','tcan','rack','light','pot'])await move(t,-1+Math.random(),1+Math.random());
await clear();const d=c.w.ents.find(e=>e.type=='desk');tx({t:'dbg',give:'jars'});await sl(150);tx({t:'use',target:d.id});await sl(200);tx({t:'use',target:d.id,only:true});await sl(200);ok('loaded desk is not lifted with items (items come off first)',!E(d.id).by);
await clear();
for(const [k,ty,x,z] of [['drop','dropbox',-1.5,6],['bin','dumpster',3,8]]){tx({t:'use',target:k,only:true});await sl(250);const h=held().find(e=>e.type==ty);ok(ty+' picks up',h&&!c.w.fixp[k],JSON.stringify(c.w.fixp));tx({t:'drop',x,z,y:0,ry:.7});await sl(250);const f=c.w.fixp[k];ok(ty+' placed with rotation, no loose entity',f&&Math.hypot(f.x-x,f.z-z)<.6&&Math.abs(f.ry-.7)<.01&&!c.w.ents.some(e=>e.type==ty),JSON.stringify(f));}
tx({t:'dbg',give:'packed'});await sl(200);const m0=c.w.money,rp0=c.w.rep;tx({t:'use',target:'drop'});await sl(250);ok('moved drop box still sells',!held().some(e=>e.type=='packed')&&(c.w.money!=m0||c.w.rep!=rp0),JSON.stringify(c.w.msg||''));
tx({t:'dbg',give:'trash'});await sl(200);tx({t:'use',target:'bin'});await sl(250);ok('moved dumpster still trashes',!held().some(e=>e.type=='trash'));
let snap=null;ws.on('message',d=>{const m=JSON.parse(d);if(m.t=='saved'&&m.w)snap=m.w});tx({t:'save'});await sl(400);ok('save snapshot has fixp',!!snap?.fixp);ws.close();await sl(200);
const c2={w:null};const ws2=new WS(`ws://localhost:${PORT}/ws`);ws2.on('message',d=>{const m=JSON.parse(d);if(m.t=='w')c2.w=m.w});await new Promise(r=>ws2.on('open',r));const tx2=m=>ws2.send(JSON.stringify(m));
tx2({t:'host',name:'M',gw:snap});await sl(200);tx2({t:'start'});await sl(500);
ok('reloaded save keeps sink rotation',Math.abs(c2.w.ents.find(e=>e.id==sink.id).ry-1.2)<.01);ok('reloaded save keeps moved drop box & dumpster',Math.hypot(c2.w.fixp.drop.x+1.5,c2.w.fixp.drop.z-6)<.6&&Math.abs(c2.w.fixp.bin.ry-.7)<.01,JSON.stringify(c2.w.fixp));ws2.close();await sl(150);
const old=JSON.parse(JSON.stringify(snap));delete old.fixp;const c3={w:null};const ws3=new WS(`ws://localhost:${PORT}/ws`);ws3.on('message',d=>{const m=JSON.parse(d);if(m.t=='w')c3.w=m.w});await new Promise(r=>ws3.on('open',r));
ws3.send(JSON.stringify({t:'host',name:'M',gw:old}));await sl(200);ws3.send(JSON.stringify({t:'start'}));await sl(500);ok('old save without fixp migrates to default spots',c3.w.fixp?.drop?.x==-2.8&&c3.w.fixp?.bin?.z==8.6,JSON.stringify(c3.w.fixp));
srv.kill();require('fs').rmSync('/tmp/bt-move.json',{force:true});const n=res.filter(Boolean).length;console.log(`${n}/${res.length} passed`);process.exit(n==res.length?0:1)})();
