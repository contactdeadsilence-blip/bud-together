// v10 server tests: old-dirt dump flow (3 pots per bag → dumpster → refill) and shed decor (styles, buy/place/move/rotate/remove, validation, co-op sync)
const WS=require('ws'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const PORT=3212;const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:''},stdio:'ignore'});await sl(800);
const cl=()=>new Promise(r=>{const ws=new WS(`ws://localhost:${PORT}/ws`);const c={ws,w:null,toasts:[]};ws.on('message',d=>{const m=JSON.parse(d);if(m.t=='joined')c.code=m.code,c.id=m.id;if(m.t=='w'){c.w=m.w;if(m.w.toast&&m.w.toast.pid==c.id)c.toasts.push(m.w.toast.t)}});ws.on('open',()=>r(c))});
const res=[];const ok=(n,c,i='')=>{res.push(!!c);console.log(c?'PASS':'FAIL',n,i)};const tx=(c,m)=>c.ws.send(JSON.stringify(m));const st=()=>sl(350);
const A=await cl(),B=await cl();tx(A,{t:'host',name:'A'});await sl(200);tx(B,{t:'join',code:A.code,name:'B'});await sl(200);tx(A,{t:'start'});await sl(500);
const held=c=>c.w.ents.filter(e=>e.by==c.id).sort((a,b)=>a.bi-b.bi);const pot=id=>A.w.ents.find(e=>e.id==id);
const P=[];for(let i=0;i<4;i++){tx(A,{t:'dbg',spawn:{x:-2+i,z:-3}});await st();const id=A.w.ents.at(-1).id;tx(A,{t:'dbg',set:{id,d:{soil:1,used:1,moist:40}}});await st();P.push(id)}
ok('used-soil pots exist',P.every(id=>pot(id).data.used));
tx(A,{t:'dbg',give:'gbag'});await st();tx(A,{t:'use',target:P[0]});await st();let h=held(A);
ok('garbage bag scoops old dirt → dirt bag 1/3',h[0]?.type=='dirtbag'&&h[0].data.f==1&&!pot(P[0]).data.soil,JSON.stringify(h.map(e=>e.type)));
ok('one garbage bag use spent',h.find(e=>e.type=='gbag')?.data.uses==4);
tx(A,{t:'use',target:P[1]});await st();tx(A,{t:'use',target:P[2]});await st();h=held(A);ok('bag fills to 3 pots',h[0].data.f==3);
A.toasts=[];tx(A,{t:'use',target:P[3]});await st();ok('full bag refuses 4th pot',pot(P[3]).data.soil==1&&A.toasts.some(x=>/full/i.test(x)));
ok('co-op sees emptied pots',B.w.ents.find(e=>e.id==P[0]).data.soil==0);
tx(A,{t:'use',target:'bin'});await st();ok('dumpster takes dirt bag',!held(A).some(e=>e.type=='dirtbag')&&!A.w.ents.some(e=>e.type=='dirtbag'));
while(held(A).length&&held(A)[0].type!='soil'){tx(A,{t:'trash'});await st()}tx(A,{t:'dbg',give:'soil'});await st();tx(A,{t:'use',target:P[0]});await st();ok('refill emptied pot with fresh soil',pot(P[0]).data.soil==1&&!pot(P[0]).data.used);
// decor
const m0=A.w.money,D=()=>A.w.decor;ok('default decor',D().paint=='cream'&&D().items.length==0);
tx(A,{t:'dstyle',k:'paint',v:'sage'});await st();ok('buy paint (-$25), applied',D().paint=='sage'&&A.w.money==m0-25);
tx(A,{t:'dstyle',k:'paint',v:'cream'});await st();tx(A,{t:'dstyle',k:'paint',v:'sage'});await st();ok('owned style re-applies free',D().paint=='sage'&&A.w.money==m0-25);
for(const [k,v] of [['panel','brick'],['floor','tile'],['light','cool'],['fix','cage']]){tx(A,{t:'dstyle',k,v});await st()}ok('panel/floor/light/fixture styles',D().panel=='brick'&&D().floor=='tile'&&D().light=='cool'&&D().fix=='cage',JSON.stringify(D()));
const m1=A.w.money;tx(A,{t:'dplace',k:'couch',x:0,y:0,z:3,ry:0});await st();ok('place couch, pay',D().items.length==1&&A.w.money<m1);
A.toasts=[];tx(A,{t:'dplace',k:'couch',x:40,y:0,z:3});await st();ok('outside shed rejected',D().items.length==1&&A.toasts.some(x=>/Can't place/.test(x)));
const it=D().items[0];tx(A,{t:'dmove',id:it.id,x:1,y:0,z:2.5,ry:1.57});await st();ok('move + rotate',D().items[0].x==1&&D().items[0].ry==1.57);
ok('co-op sees decor',B.w.decor.items[0]?.x==1&&B.w.decor.paint=='sage');
tx(A,{t:'dbg',money:-A.w.money+5});await st();A.toasts=[];tx(A,{t:'dplace',k:'couch',x:0,y:0,z:0});await st();ok('cannot afford → refused',D().items.length==1&&A.toasts.some(x=>/Need/.test(x)));
const m2=A.w.money;tx(A,{t:'drem',id:it.id});await st();ok('remove refunds 50%',D().items.length==0&&A.w.money==m2+110,m2+'->'+A.w.money);
console.log(res.filter(x=>x).length+'/'+res.length+' passed');srv.kill();process.exit(res.every(x=>x)?0:1)})();
