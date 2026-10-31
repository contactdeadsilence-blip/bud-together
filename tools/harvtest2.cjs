// later Section 3 stages (B..F), called from harvtest.cjs
module.exports=async H=>{const {c,tx,sl,ok,held,clear,E}=H;
// --- Stage B: trimming ---
await clear();tx({t:'dbg',give:'drybud',gd:{s:'owl',g:20,q:70}});await sl(200);tx({t:'use',trim:{acc:1,spd:.8}});await sl(250);
let b=held().find(e=>e.type=='drybud'),tr=held().find(e=>e.type=='trim');ok('perfect trim raises quality, splits off trim',b&&b.data.tr&&b.data.q>70&&b.data.g<20&&tr&&tr.data.g==20-b.data.g,JSON.stringify([b?.data,tr?.data,c.toast]));
tx({t:'use',trim:{acc:1,spd:1}});await sl(200);ok('cannot trim twice',/Already/.test(c.toast));
await clear();tx({t:'dbg',give:'drybud',gd:{s:'owl',g:20,q:70}});await sl(200);tx({t:'use',trim:{acc:.2,spd:0}});await sl(250);b=held().find(e=>e.type=='drybud');ok('sloppy trim lowers quality',b.data.q<70,b.data.q);
tx({t:'use',trim:{acc:9,spd:9}});await sl(150);await clear();tx({t:'dbg',give:'drybud',gd:{s:'owl',g:20,q:70}});await sl(200);tx({t:'use',trim:{acc:99,spd:99}});await sl(200);ok('trim inputs clamped',held().find(e=>e.type=='drybud').data.q<=84);
await clear();tx({t:'dbg',give:'trim',gd:{s:'owl',g:6,q:40}});await sl(200);const m0=c.w.money;tx({t:'use',target:'drop'});await sl(250);ok('trim sells at the drop box',c.w.money>m0&&!held().some(e=>e.type=='trim'),c.toast);
try{await require('./harvtest3.cjs')(H)}catch(e){if(e.code!=='MODULE_NOT_FOUND')throw e}};
