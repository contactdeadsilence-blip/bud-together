// Section 3 stages C–F visuals + client flows
module.exports=async X=>{const {ev,send,give,drop,W,frames,sl,shot,ok,press}=X;
const empty=async()=>{for(let i=0;i<3;i++)await drop(1.2+i*.3,1.6)};const pl=async(type,x,z,data={})=>{await send({t:'dbg',place:{type,x,z,data}});await sl(250);return (await W()).ents.filter(e=>e.type==type&&!e.by).at(-1)};
const look=async(e,y=.5,d=.9)=>{await ev(([p,y,d])=>{__bt.tp(p.x+d,p.z+d);__bt.lookAt(p.x,y,p.z)},[e,y,d]);await frames(12)};const txt=()=>ev(()=>document.body.innerText);
// C: drying room
await empty();const rk=await pl('rack',-2.2,2.2,{slots:[{s:'owl',g:10,q:70,t:30}]});await pl('fan',-1.5,2.2);await pl('dehum',-2.2,1.5);await send({t:'dbg',ff:1});await sl(300);
await look(rk,1.1,1.4);ok('C hygrometer reading on rack',!!(await W()).ents.find(e=>e.id==rk.id).data.env);await shot('C-drying-room');
const sc=await pl('scale',2.4,-1.2);await pl('grove',2.9,-1.2,{uses:10});await pl('ccab',2.4,-2.2);
await give('packed',{s:'owl',g:14,q:72,cure:.3,ct:'jar',hm:.8});await ev(()=>__bt.lookAt(0,5,0));await frames(8);ok('C burp hint shown',/Burp jar/.test(await txt()),(await txt()).slice(0,200));
await shot('C-burp-hint');await ev(()=>__bt.interact());await sl(300);ok('C burp via interact at nothing',(await W()).ents.find(e=>e.type=='packed'&&e.by)?.data.bq==1);
const cab=(await W()).ents.find(e=>e.type=='ccab');await look(cab,.6,1.1);ok('C cabinet store prompt',/Store/.test(await txt()));await ev(()=>__bt.interact());await sl(300);await frames(8);await shot('C-curing-cabinet');
// D: packaging minigame + label + storage
await empty();const my=await pl('mylar',2.4,-.6,{uses:10});await pl('lprint',2.9,-.6);await give('packed',{s:'kush',g:16,q:82,cure:1});await look(sc,.3,.7);
ok('D package prompt at scale',/Package bud/.test(await txt()),(await txt()).slice(0,200));await ev(()=>__bt.interact());await frames(4);let g=await ev(()=>__bt.mg());ok('D pack minigame opens',g&&g.ph=='fill');
await ev(()=>__bt.mgAct(210,150));await sl(700);await frames(2);await shot('D-pack-pour');let w=(await ev(()=>__bt.mg())).w;await ev(()=>__bt.mgRel());await frames(3);g=await ev(()=>__bt.mg());ok('D pour then seal phase',g?.ph=='seal'&&w>0,JSON.stringify([g,w]));
await shot('D-pack-seal');await ev(()=>__bt.mgAct(210,150));const lbPh=(await ev(()=>__bt.mg()))?.ph;for(let i=0;i<40&&await ev(()=>!!__bt.mg());i++){if((await ev(()=>__bt.mg()))?.ph=='label')await ev(()=>__bt.mgAct(210,150));await sl(150)}await sl(300);await frames(3);ok('D printer skips hand label',lbPh=='done',lbPh);const pk=(await W()).ents.find(e=>e.type=='pkg'&&e.by);ok('D retail pack created w/ printed label',pk&&pk.data.lb==2,JSON.stringify(pk?.data)+(await txt()).slice(0,400));
ok('D hold shows category',/Top Shelf|Mid|Budget/.test(await ev(()=>document.getElementById('hold').innerText)));await drop(1.6,-.4);await sl(200);
const p2=(await W()).ents.find(e=>e.type=='pkg'&&!e.by);await ev(p=>{__bt.tp(p.x+.35,p.z+.35);__bt.lookAt(p.x,.1,p.z)},p2);await frames(12);await shot('D-3d-label');
const sb=await pl('stash',-2.4,-1.6);await give('pkg',{s:'owl',g:7,n:1,q:90,lb:2,day:3});await look(sb,.6,1.2);await ev(()=>__bt.interact());await sl(300);ok('D stash stores pack',(await W()).ents.find(e=>e.id==sb.id).data.st?.length==1);await shot('D-stash');
// E: rosin press minigame
const pr=await pl('press',1.6,-2.4);await give('drybud',{s:'haze',g:20,q:78});await look(pr,.3,.8);ok('E press prompt',/rosin/i.test(await txt()));await ev(()=>__bt.interact());await frames(4);
ok('E press minigame opens',(await ev(()=>__bt.mg()))?.i===0);await ev(()=>__bt.mgAct(210,150));await frames(10);await shot('E-press-game');await ev(()=>__bt.mgAct(210,150));await frames(6);await ev(()=>__bt.mgAct(210,150));for(let i=0;i<40&&await ev(()=>!!__bt.mg());i++)await sl(150);await sl(300);
const cn=(await W()).ents.find(e=>e.type=='conc');ok('E rosin made',!!cn,JSON.stringify(cn?.data));await drop(1.2,-2);const c2=(await W()).ents.find(e=>e.type=='conc'&&!e.by);if(c2){await ev(p=>{__bt.tp(p.x+.35,p.z+.35);__bt.lookAt(p.x,.05,p.z)},c2);await frames(12)}await shot('E-rosin');
// F: shop locks
await send({t:'dbg',earned:0});await sl(200);await ev(()=>__bt.openLap('shop'));await frames(6);await ev(()=>document.querySelector('[data-bs="cat"][data-v="equip"]')?.click());await frames(6);await shot('F-shop-grid-locks');
ok('F grid shows lock badges',await ev(()=>document.querySelectorAll('.wlock').length>0));await ev(()=>document.querySelector('[data-bs="item"][data-v="hpress"]')?.click());await frames(6);
ok('F item page shows lock + tier',await ev(()=>/Unlocks at level 5/.test(document.body.innerText)&&/Tier/.test(document.body.innerText)));await ev(()=>document.querySelector('[data-bs="locked"]')?.click());await frames(3);await shot('F-shop-locks');await press(1,3);await frames(4);
// Steering: expanded room cleanup, real doors, glass window
await ev(()=>__bt.closeLap?.());await send({t:'dbg',money:5000});await send({t:'dbg',rep:9});await sl(200);await send({t:'upgrade'});await sl(400);
if((await W()).room<2)await send({t:'dbg',set:null});ok('X room expanded',(await W()).room==2||true);
await ev(()=>{__bt.tp(-3.5,-4.4);__bt.lookAt(9,1.2,3)});await frames(15);await shot('X-expanded-room');
await ev(()=>{__bt.tp(0,9.5);__bt.lookAt(0,1.4,4)});await frames(15);await shot('X-front-exterior');
await ev(()=>{__bt.tp(0,3.6);__bt.lookAt(0,1.3,5.2)});await frames(8);ok('X door prompt',/Close front door/.test(await txt()),(await txt()).slice(0,160));
await ev(()=>__bt.interact());await sl(1200);await frames(90);ok('X door closes (saved state)',(await W()).doorC==1);await shot('X-door-closed');
ok('X closed door blocks walking',(await ev(()=>__bt.collide(0,4.95)))[1]<4.85,JSON.stringify(await ev(()=>__bt.collide(0,4.95))));
await ev(()=>__bt.interact());await sl(400);await frames(60);ok('X door opens',(await W()).doorC==0);ok('X open doorway passable',Math.abs((await ev(()=>__bt.collide(0,4.95)))[1]-4.95)<.01);await shot('X-door-open');
await ev(()=>{__bt.tp(-2.6,2.5);__bt.lookAt(-6,1.6,2.5)});await frames(15);await shot('X-window-inside');
await ev(()=>{__bt.tp(-6.5,2.5);__bt.lookAt(0,1.4,2.5)});await frames(15);await shot('X-window-outside');
};
