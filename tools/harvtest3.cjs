// Section 3 stages C–F server checks
module.exports=async H=>{const {c,tx,sl,ok,held,clear,E}=H;
const put=async(k,x,z,gd)=>{await clear();tx({t:'dbg',give:k,...(gd?{gd}:{})});await sl(150);const e=held().find(e=>e.type==(k=='dscale'?'scale':k=='hpress'?'press':k));tx({t:'drop',x,z,y:0});await sl(180);return e&&E(e.id)};
// --- C: drying env ---
const rk=await put('rack',4,6);await sl(1300);ok('rack reports humidity/temp',rk&&E(rk.id).data.env?.h>=60,JSON.stringify(E(rk.id)?.data.env));
await put('fan',4.6,6);await put('dehum',3.4,6);await sl(1300);const v=E(rk.id).data.env;ok('fan+dehumidifier: ideal humidity, faster, +quality',v.h<=62&&v.sp>1.3&&v.dq>0,JSON.stringify(v));
// --- C: curing jar burp + grove bags ---
await clear();tx({t:'dbg',give:'packed',gd:{s:'owl',g:14,q:70,cure:0,ct:'jar',hm:0}});await sl(200);tx({t:'burp'});await sl(200);ok('cannot burp a fresh jar',/Not ready/.test(c.toast),c.toast);
let j=held().find(e=>e.type=='packed');tx({t:'dbg',id:j.id,gd:{hm:.8}});await sl(150);E(j.id).data.hm=.8;
await clear();tx({t:'dbg',give:'packed',gd:{s:'owl',g:14,q:70,cure:0,ct:'jar',hm:.9}});await sl(250);tx({t:'burp'});await sl(200);j=held().find(e=>e.type=='packed');ok('burping a foggy jar adds quality',/Burped/.test(c.toast)&&j.data.bq==1&&j.data.hm<.2,c.toast+JSON.stringify(j?.data));
await clear();tx({t:'dbg',give:'packed',gd:{s:'owl',g:14,q:70,cure:0,ct:'grove'}});await sl(200);tx({t:'burp'});await sl(150);ok('grove bags never need burping',/never/.test(c.toast),c.toast);
const cab=await put('ccab',5,4);await clear();tx({t:'dbg',give:'packed',gd:{s:'owl',g:7,q:70,cure:0,ct:'jar',hm:0}});await sl(200);tx({t:'use',target:cab.id});await sl(200);ok('jar stored in curing cabinet',E(cab.id).data.st?.length==1,c.toast);
await clear();tx({t:'dbg',give:'drybud',gd:{s:'owl',g:5,q:70}});await sl(200);tx({t:'use',target:cab.id});await sl(200);ok('curing cabinet rejects loose bud',/Only curing/.test(c.toast),c.toast);
await clear();await sl(1200);ok('cabinet cures contents',(E(cab.id).data.st[0].data.cure||0)>0);tx({t:'use',target:cab.id});await sl(200);ok('take jar back out of cabinet',held().some(e=>e.type=='packed'),c.toast);
// --- quick fix: every section 3 equipment piece can be picked up (F/X) with contents kept
tx({t:'dbg',give:'packed',gd:{s:'owl',g:7,q:70,cure:0,ct:'jar',hm:0}});await sl(200);tx({t:'use',target:cab.id});await sl(200);await clear();
tx({t:'use',target:cab.id,only:1});await sl(250);{const h=held().find(e=>e.type=='ccab');ok('F/X picks up the curing cabinet with jars inside',h&&h.data.st?.length>=1,c.toast);tx({t:'drop',x:5,z:4,y:0});await sl(200);ok('cabinet placed back, jars kept',E(cab.id)&&!E(cab.id).by&&E(cab.id).data.st?.length>=1)}
for(const k of ['fan','dehum','grove','jars','stash','scale','press','hbin','mylar','vseal','lprint','trimmer']){const e=await put(k,6,1.5);if(!e){ok('spawn '+k,false);continue}await clear();tx({t:'use',target:e.id,only:1});await sl(220);ok('F/X picks up '+k,held().some(h=>h.id==e.id),c.toast);await clear()}
// --- D: storage, packaging, quality categories ---
const bn=await put('sbin',5,2.5);await clear();tx({t:'dbg',give:'packed',gd:{s:'owl',g:7,q:90,cure:1}});await sl(200);tx({t:'use',target:bn.id});await sl(200);ok('storage bin holds product',E(bn.id).data.st?.length==1&&!held().length,c.toast);
tx({t:'use',target:bn.id,only:1});await sl(200);ok('F/X with empty hands picks up the bin itself',held().some(e=>e.type=='sbin'),c.toast);tx({t:'drop',x:5,z:2.5,y:0});await sl(200);
const sc=await put('scale',6,3);await clear();tx({t:'dbg',give:'packed',gd:{s:'owl',g:14,q:90,cure:1}});await sl(200);tx({t:'use',target:sc.id,pack:{tg:7,acc:1,seal:1}});await sl(200);ok('packaging needs mylar',/Mylar/.test(c.toast),c.toast);
await clear();await put('mylar',6.5,3);tx({t:'dbg',give:'packed',gd:{s:'owl',g:14,q:90,cure:1}});await sl(200);tx({t:'use',target:sc.id,pack:{tg:7,acc:1,seal:1}});await sl(250);let pk=held().find(e=>e.type=='pkg');
ok('packaging minigame makes labelled retail packs',pk&&pk.data.n==2&&pk.data.g==7&&pk.data.day!=null&&/Top Shelf/.test(c.toast),c.toast);
let m0=c.w.money;tx({t:'use',target:'drop'});await sl(250);ok('retail packs sell at the drop box',c.w.money>m0,c.toast);
await clear();tx({t:'dbg',give:'packed',gd:{s:'owl',g:14,q:50,cure:0}});await sl(200);m0=c.w.money;tx({t:'use',target:'drop'});await sl(250);const lo=c.w.money-m0;
await clear();tx({t:'dbg',give:'packed',gd:{s:'owl',g:14,q:95,cure:1}});await sl(200);m0=c.w.money;tx({t:'use',target:'drop'});await sl(250);ok('Top Shelf sells for far more than Budget',c.w.money-m0>lo*2,[lo,c.w.money-m0]);
// --- E: rosin press ---
const pr=await put('press',7,4);await clear();tx({t:'dbg',give:'drybud',gd:{s:'owl',g:20,q:80}});await sl(200);tx({t:'use',target:pr.id,press:{a:[1,1,1]}});await sl(250);let cn=held().find(e=>e.type=='conc');
ok('rosin press turns bud into graded concentrate',cn&&cn.data.g>=3&&cn.data.g<=5&&cn.data.q>60,c.toast);
tx({t:'use',target:sc.id,pack:{tg:1,acc:1,seal:1}});await sl(250);pk=held().find(e=>e.type=='pkg');ok('rosin packages into 1g packs',pk&&pk.data.cc&&pk.data.g==1,c.toast);m0=c.w.money;tx({t:'use',target:'drop'});await sl(250);ok('rosin packs sell',c.w.money>m0,c.toast);
await clear();tx({t:'dbg',give:'trim',gd:{s:'owl',g:20,q:50}});await sl(200);tx({t:'use',target:pr.id,press:{a:[.2,.2,.2]}});await sl(250);cn=held().find(e=>e.type=='conc');ok('trim presses to less rosin',cn&&cn.data.g<2.5,c.toast);
m0=c.w.money;tx({t:'use',target:'drop'});await sl(250);ok('loose rosin sells',c.w.money>m0,c.toast);
// --- F: equipment locks ---
tx({t:'buy',item:'hpress'});await sl(250);ok('hydraulic press locked at low level',/unlocks at level 5/.test(c.toast),c.toast);
ok('earnings tracked for levels',(c.w.earned||0)>0,c.w.earned);
// --- garbage bag box: F picks up whole box, E takes one bag ---
const gb=await put('gbag',7,1);await clear();tx({t:'use',target:gb.id});await sl(200);ok('E takes a single garbage bag',held().some(e=>e.type=='gbag1'),c.toast);await clear();
tx({t:'use',target:gb.id,only:1});await sl(200);ok('F/X picks up the whole garbage bag box',held().some(e=>e.type=='gbag'),c.toast);await clear();
};
