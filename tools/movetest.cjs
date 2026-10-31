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
const can=c.w.ents.find(e=>e.type=='water');tx({t:'use',target:can.id,only:true});await sl(200);const w0=E(can.id).data.w??0;
if(w0>0){/* empty a bit by pouring isn't needed: dbg set */}
can.data.w=0;tx({t:'dbg',canw:0});await sl(100);tx({t:'use',target:sink.id});await sl(250);ok('moved sink still fills the can',(E(can.id).data.w??0)>=(w0>0?w0:0.01)||/full/i.test(JSON.stringify(c.w.msg||'')),E(can.id).data.w);
for(const t of ['desk','bed','shelf','table','tcan','rack','light','pot'])await move(t,-1+Math.random(),1+Math.random());
await clear();const d=c.w.ents.find(e=>e.type=='desk');tx({t:'dbg',give:'jars'});await sl(150);tx({t:'use',target:d.id});await sl(200);tx({t:'use',target:d.id,only:true});await sl(200);ok('loaded desk is not lifted with items (items come off first)',!E(d.id).by);
srv.kill();require('fs').rmSync('/tmp/bt-move.json',{force:true});const n=res.filter(Boolean).length;console.log(`${n}/${res.length} passed`);process.exit(n==res.length?0:1)})();
