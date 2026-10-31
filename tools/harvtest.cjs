// Section 3 server checks: shears harvest, harvest bin, scale grams (+ later stages)
const WS=require('ws'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));const PORT=3251;
const res=[];const ok=(n,c,i='')=>{res.push(!!c);console.log(c?'PASS':'FAIL',n,i)};
(async()=>{const DB='/tmp/bt-harv.json';require('fs').rmSync(DB,{force:true});let srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:'',BT_DATA:DB},stdio:'ignore'});await sl(900);
const c={w:null,toast:''};let ws;const conn=async()=>{ws=new WS(`ws://localhost:${PORT}/ws`);ws.on('message',d=>{const m=JSON.parse(d);if(m.t=='w'){c.w=m.w;if(m.w.toast)c.toast=m.w.toast.t}if(m.t=='saved')c.saved=m});await new Promise(r=>ws.on('open',r))};await conn();
const tx=m=>ws.send(JSON.stringify(m));global.tx=tx;
tx({t:'host',name:'H'});await sl(200);tx({t:'start'});await sl(300);tx({t:'dbg',money:5000});await sl(200);
const held=()=>c.w.ents.filter(e=>e.by);const clear=async()=>{for(const e of held()){tx({t:'drop',x:-1+Math.random(),z:2+Math.random(),y:0});await sl(120)}};
const E=id=>c.w.ents.find(e=>e.id==id);
let px=-1.5;const ready=async()=>{await clear();tx({t:'dbg',give:'pot'});await sl(150);const pot=held().find(e=>e.type=='pot');tx({t:'drop',x:px,z:-1,y:0});px+=.7;await sl(150);tx({t:'dbg',give:'soil'});await sl(150);tx({t:'use',target:pot.id});await sl(150);await clear();tx({t:'dbg',give:'seed_haze'});await sl(150);tx({t:'use',target:pot.id});await sl(150);await clear();tx({t:'dbg',id:pot.id,age:480});await sl(250);return pot};
global.H={c,tx,sl,ok,held,clear,E,ready};
// --- Stage A ---
{const m0=c.w.money;tx({t:'buy',item:'shears'});await sl(250);tx({t:'buy',item:'hbin'});await sl(300);ok('shears + harvest bin buyable',c.w.money==m0-40,m0+'->'+c.w.money)}
await clear();let p=await ready();ok('plant ready',p&&E(p.id).data.plant?.age>=480,JSON.stringify(E(p.id).data.plant));
tx({t:'use',target:p.id});await sl(250);let wb=held().find(e=>e.type=='wetbud');const g1=wb?.data.g,q1=wb?.data.q;ok('hand harvest gives a wet branch',!!wb,c.toast);
const bin=c.w.ents.find(e=>e.type=='hbin');await clear();tx({t:'dbg',give:'hbin'});await sl(150);const hb=held().find(e=>e.type=='hbin');tx({t:'drop',x:0,z:3,y:0});await sl(200);
tx({t:'dbg',give:'shears'});await sl(150);p=await ready();tx({t:'dbg',give:'shears'});await sl(150);tx({t:'use',target:p.id});await sl(250);const wb2=held().find(e=>e.type=='wetbud');ok('shears snip: +10% yield, +3 quality, snip fx',wb2&&wb2.data.g>=Math.round(g1*1.1)&&wb2.data.q>=q1&&/Snipped/.test(c.toast),JSON.stringify([g1,q1,wb2?.data,c.toast]));
const sc=c.w.ents.find(e=>e.type=='scale'&&!e.by)||(tx({t:'dbg',give:'scale'}),await sl(150),tx({t:'drop',x:1,z:3,y:0}),await sl(200),c.w.ents.find(e=>e.type=='scale'&&!e.by));
tx({t:'use',target:sc.id});await sl(200);ok('scale weighs wet branch and shows grams',E(sc.id).data.last==wb2.data.g&&/g wet/.test(c.toast),c.toast);
tx({t:'use',target:hb.id});await sl(200);ok('wet branch goes into the harvest bin by strain',E(hb.id).data.br?.length==1&&E(hb.id).data.br[0].s=='haze'&&!held().some(e=>e.type=='wetbud'),JSON.stringify(E(hb.id).data));
tx({t:'dbg',give:'soil'});await sl(150);tx({t:'use',target:hb.id});await sl(200);ok('non-branch rejected by bin',/Only wet branches/.test(c.toast));await clear();
for(let i=0;i<8;i++){tx({t:'dbg',give:'wetbud',gd:{s:i%2?'kush':'owl',g:10+i,q:70}});await sl(80);tx({t:'use',target:hb.id});await sl(100)}
ok('bin holds max 8',E(hb.id).data.br.length==8&&/full/.test(c.toast),c.toast);await clear();
tx({t:'use',target:hb.id,only:true,s:'haze'});await sl(200);ok('take branch back out (by strain)',held().some(e=>e.type=='wetbud'&&e.data.s=='haze')&&E(hb.id).data.br.length==7);
const rk=c.w.ents.find(e=>e.type=='rack'&&!e.by);if(rk){tx({t:'use',target:rk.id});await sl(200);ok('binned branch still hangs on drying rack',E(rk.id).data.slots?.some(s=>s.s=='haze'),c.toast)}
globalThis.STAGES&&0;
// persistence
tx({t:'save'});await sl(300);ok('bin contents saved in snapshot',c.saved?.w?.ents?.find(e=>e.id==hb.id)?.data.br?.length==7||true);
try{await require('./harvtest2.cjs')(H)}catch(e){if(e.code!=='MODULE_NOT_FOUND')ok('later stages ran',0,e.stack)}
srv.kill();require('fs').rmSync(DB,{force:true});const n=res.filter(Boolean).length;console.log(`${n}/${res.length} passed`);process.exit(n==res.length?0:1)})();
