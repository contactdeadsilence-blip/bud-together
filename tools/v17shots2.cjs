// Section 3 later stages, called from v17shots.cjs
module.exports=async X=>{const {ev,send,give,drop,W,frames,sl,shot,ok,press}=X;
const empty=async()=>{for(let i=0;i<3;i++){await drop(1.2+i*.3,1.6);}};
// Stage B: trimming minigame
await empty();let tb=(await W()).ents.find(e=>e.type=='table'&&!e.by);if(!tb){await give('table');await drop(1.5,-1);tb=(await W()).ents.find(e=>e.type=='table'&&!e.by)}
await give('drybud',{s:'owl',g:18,q:72});await give('shears');await send({t:'cycle',d:1});await sl(200);
await ev(p=>{__bt.tp(p.x+.9,p.z+.9);__bt.lookAt(p.x,.75,p.z)},tb);await frames(10);
ok('trim prompt at table',await ev(()=>/Trim bud/.test(document.body.innerText)),await ev(()=>document.body.innerText.slice(0,300)));
await ev(()=>__bt.interact());await frames(4);let g=await ev(()=>__bt.mg());ok('trim minigame opens',g&&g.L.length==9,JSON.stringify(g));
for(const l of g.L.slice(0,5))await ev(l=>__bt.mgAct(l[0],l[1]),l);await frames(3);await shot('B-trim');
for(const l of g.L.slice(5))await ev(l=>__bt.mgAct(l[0],l[1]),l);await sl(900);await frames(3);
ok('minigame closes & bud trimmed',!(await ev(()=>__bt.mg()))&&(await W()).ents.some(e=>e.type=='drybud'&&e.data.tr)&&(await W()).ents.some(e=>e.type=='trim'));await shot('B-trim-done');
// pad B cancels
await give('drybud',{s:'kush',g:10,q:70});await ev(p=>{__bt.tp(p.x+.9,p.z+.9);__bt.lookAt(p.x,.75,p.z)},tb);await frames(8);await ev(()=>__bt.interact());await frames(4);
const o=!!(await ev(()=>__bt.mg()));await press(1,3);await frames(4);ok('pad B cancels minigame',o&&!(await ev(()=>__bt.mg())));
try{await require('./v17shots3.cjs')(X)}catch(e){if(e.code!=='MODULE_NOT_FOUND')ok('later stages',0,e.stack)}};
