const pp=require('puppeteer-core'),{spawn}=require('child_process');const OUT='/workspace/ui-shots/grow/';const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT:3200,BT_DEBUG:1},stdio:'inherit'});await sl(800);
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--window-size=1280,720']});
const P=await b.newPage();await P.setViewport({width:1280,height:720});P.on('pageerror',e=>console.log('ERR',e.message));P.on('console',m=>m.type()=='error'&&console.log('CON',m.text()));
await P.goto('http://localhost:3200/',{waitUntil:'networkidle0'});await sl(3500);await P.screenshot({path:OUT+'1-title.png'});
const ev=(f,...a)=>P.evaluate(f,...a);const W=()=>ev(()=>__bt.W);
const find=async t=>(await W()).ents.filter(e=>e.type==t&&!e.by);
const doAt=async(x,z,y=.3,dz=1.1)=>{await ev((x,z,y,dz)=>{__bt.tp(x,z+dz);__bt.lookAt(x,y,z)},x,z,y,dz);await sl(250);const t=await ev(()=>__bt.target());await ev(()=>__bt.interact());await sl(500);return t};
await P.click('[data-a=solo]');await sl(2500);
await ev(()=>{__bt.tp(.5,2.5);__bt.look(.25,-.3)});await sl(1200);await P.screenshot({path:OUT+'2-grow-room.png'});
const pots=await find('pot');const soil=(await find('soil'))[0],seed=(await find('seed_haze'))[0],wat=(await find('water'))[0];
console.log('pickup soil ->',await doAt(soil.x,soil.z,.3));for(const p of pots)await doAt(p.x,p.z,.45);await ev(()=>__bt.drop());await sl(400);
await doAt(seed.x,seed.z,.15);for(const p of pots)await doAt(p.x,p.z,.45);await ev(()=>__bt.drop());await sl(400);
await doAt(wat.x,wat.z,.15);for(const p of pots)await doAt(p.x,p.z,.45);await ev(()=>__bt.drop());await sl(400);
console.log('planted',JSON.stringify((await W()).ents.filter(e=>e.type=='pot').map(e=>e.data.plant&&e.data.plant.s)));
// laptop shop
await ev(()=>__bt.tp(-2.6,-2));await ev(()=>__bt.lookAt(-3.6,1.05,-2));await sl(300);console.log('laptop target',await ev(()=>__bt.target()));await ev(()=>__bt.interact());await sl(500);
await P.screenshot({path:OUT+'4-laptop-shop.png'});const m0=(await W()).money;
for(const it of['rack','scale','jars','pot'])await ev(i=>document.querySelector(`[data-buy=${i}]`).click(),it);await sl(500);console.log('money',m0,'->',(await W()).money);
await ev(()=>__bt.tab('contracts'));await sl(300);await P.screenshot({path:OUT+'4b-laptop-contracts.png'});await ev(()=>__bt.closeLap());await sl(7000);
// third pot w/ soil+seed, then set stages
const np=(await find('pot')).find(p=>p.z>5);await doAt(np.x,np.z,.45);await ev(()=>__bt.tp(.5,-1.5));await sl(200);await ev(()=>__bt.drop());await sl(500);
const s2=(await find('soil'))[0];await doAt(s2.x,s2.z,.3);const p3=(await find('pot')).find(p=>!p.data.soil);await doAt(p3.x,p3.z,.45);await ev(()=>__bt.drop());await sl(300);
const sd=(await find('seed_haze'))[0];await doAt(sd.x,sd.z,.15);await doAt(p3.x,p3.z,.45);await ev(()=>__bt.drop());await sl(300);
const all=(await W()).ents.filter(e=>e.type=='pot');const ages=[40,160,330];for(let i=0;i<all.length;i++)await ev((id,age)=>__bt.send({t:'dbg',id,age}),all[i].id,ages[i%3]);
// put the light in the middle
const lt=(await find('light'))[0];await doAt(lt.x,lt.z,.1);await ev(()=>{__bt.tp(-.3,-2.2);__bt.look(Math.PI,0)});await ev(()=>__bt.drop());await sl(600);
await ev(()=>{__bt.tp(-.2,-.6);__bt.lookAt(-.2,.6,-3)});await sl(1500);await P.screenshot({path:OUT+'3-plant-stages.png'});
console.log('stages',JSON.stringify((await W()).ents.filter(e=>e.type=='pot').map(e=>e.data.plant&&Math.round(e.data.plant.age))));
// harvest -> dry -> pack -> deliver
const rp=all[0];await ev(id=>__bt.send({t:'dbg',id,age:480}),rp.id);await sl(500);await ev(()=>{__bt.tp(-.2,-.6);__bt.lookAt(-.2,.6,-3)});await sl(800);await P.screenshot({path:OUT+'3b-ready.png'});
const rpe=(await W()).ents.find(e=>e.id==rp.id);console.log('harvest ->',await doAt(rpe.x,rpe.z,.45));const wb=(await W()).ents.find(e=>e.by);console.log('carry',wb&&wb.type,wb&&JSON.stringify(wb.data));
await ev(s=>__bt.send({t:'dbg',contract:s}),wb.data.s);
const rk=(await find('rack'))[0];console.log('rack ->',await doAt(rk.x,rk.z,1.2,1.3));await ev(()=>__bt.send({t:'dbg',dry:1}));await sl(500);await doAt(rk.x,rk.z,1.2,1.3);
const sc=(await find('scale'))[0];console.log('scale ->',await doAt(sc.x,sc.z,.1,.9));const pk=(await W()).ents.find(e=>e.by);console.log('packed',pk&&pk.type,JSON.stringify(pk&&pk.data));
const m1=(await W()).money;await ev(()=>{__bt.tp(-2.6,6.2);__bt.lookAt(-2.8,.9,7.6)});await sl(300);console.log('drop target',await ev(()=>__bt.target()));await ev(()=>__bt.interact());await sl(700);
await P.screenshot({path:OUT+'5-contract-delivery.png'});const w=await W();console.log('money',m1,'->',w.money,'rep',w.rep);
console.log('health',await (await fetch('http://localhost:3200/health')).text());
await b.close();srv.kill();process.exit(0)})();
