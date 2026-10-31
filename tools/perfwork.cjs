// worker perf profile (BT_PROF)
const pp=require('puppeteer-core'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const PORT=3295;const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,BT_PROF:1,DATABASE_URL:''},stdio:['ignore',require('fs').openSync('/tmp/perf.log','w'),require('fs').openSync('/tmp/perf.log','a')]});await sl(700);
const b=await pp.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:300000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const P=await b.newPage();await P.setViewport({width:960,height:540});const errs=[];P.on('pageerror',e=>errs.push(e.message));
await P.evaluateOnNewDocument(()=>{try{localStorage.bt_seenacct=1;localStorage.bt_seen_version='99.0.0'}catch(e){};window.__pad={id:'Xbox Sim',index:0,connected:true,mapping:'standard',timestamp:0,buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0})),axes:[0,0,0,0]};navigator.getGamepads=()=>[window.__pad,null,null,null]});
await P.goto(`http://localhost:${PORT}/?q='+(process.env.Q||2)+'`,{waitUntil:'networkidle0'});
const ev=(f,...a)=>P.evaluate(f,...a),st=()=>ev(()=>__bt.state());
const frames=async n=>{const f0=await ev(()=>__bt.frames);while(await ev(()=>__bt.frames)<f0+n)await sl(15)};
const set=(i,v)=>ev((i,v)=>{const b=__pad.buttons[i];b.pressed=v;b.value=v?1:0},i,v);
const press=async(i,hold=2)=>{await set(i,true);await frames(hold);await set(i,false);await frames(3)};
const A=0,B=1,X=2,Y=3,LB=4,RB=5,LT=6,RT=7,UP=12,DOWN=13,LEFT=14,RIGHT=15;
const res=[];const ok=(n,c,i='')=>{res.push(c);console.log(c?'PASS':'FAIL',n,i)};
await ev(()=>window.dispatchEvent(new Event('gamepadconnected')));
let s=await st();if(s.root=='splash'){await press(A);await frames(4)}if(await ev(()=>__bt.cre?.()))await press(B);await frames(3);if((await st()).root=='m-acct'){await ev(()=>document.querySelector('[data-a=guest]').click());await frames(3)}
await press(A,4);await sl(1500);await frames(5);s=await st();ok('solo game started',s.root==null,s.root);
const D='/workspace/ui-shots/grow/v173-';const shot=n=>P.screenshot({path:D+n+'.png'});
const W=()=>ev(()=>__bt.W),send=m=>ev(m=>__bt.send(m),m),ff=async n=>{await send({t:'dbg',ff:n});await sl(250)};
await send({t:'dbg',money:20000});await sl(300);await send({t:'dbg',min:480});await sl(300);
let w=await W();console.log(JSON.stringify(w.ents.filter(e=>!e.by).map(e=>[e.type,+e.x.toFixed(1),+e.z.toFixed(1)])));
const give=async(k,x,z)=>{await send({t:'dbg',give:k});await sl(250);await send({t:'drop',x,z});await sl(250)};
const wk=()=>W().then(w=>w.workers||[]);
const cdp=await P.target().createCDPSession();await cdp.send('Network.enable');let wb=0,wn=0,sv=0;cdp.on('Network.webSocketFrameReceived',e=>{wb+=e.response.payloadData.length;wn++;if(e.response.payloadData.startsWith('{"t":"saved"'))sv++});
for(let i=0;i<8;i++){await send({t:'dbg',spawn:{x:-3+(i%4)*1.3,z:-3+(i/4|0)*1.3,age:i<4?100:30,water:15,s:'haze'}});await sl(120)}
await cdp.send('Performance.enable');const pm=async()=>Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));
const meas=async(lbl,sec,prof)=>{const m0=await pm();if(prof){await cdp.send('Profiler.enable');await cdp.send('Profiler.start')}require('fs').appendFileSync('/tmp/perf.log',`--- ${lbl}\n`);await ev(()=>{window.__pf={n:0,mx:0,t:performance.now()};let l=performance.now();const f=()=>{const n=performance.now();__pf.mx=Math.max(__pf.mx,n-l);l=n;__pf.n++;if(!__pf.stop)requestAnimationFrame(f)};requestAnimationFrame(f)});wb=0;wn=0;sv=0;const h0=await ev(()=>performance.memory?.usedJSHeapSize||0);await sl(sec*1000);const r=await ev(()=>{__pf.stop=1;return{fps:__pf.n/((performance.now()-__pf.t)/1000),worst:__pf.mx}});const m1=await pm();let top='';if(prof){const {profile:pr}=await cdp.send('Profiler.stop');const self={};const dt=pr.timeDeltas;const byId=new Map(pr.nodes.map(n=>[n.id,n]));pr.samples.forEach((id,i)=>{const n=byId.get(id);const k=n.callFrame.functionName+'@'+(n.callFrame.url.split('/').pop())+':'+n.callFrame.lineNumber;self[k]=(self[k]||0)+(dt[i]||0)});top=Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,14).map(([k,v])=>`  ${(v/1000).toFixed(0)}ms ${k}`).join('\n')}
const h1=await ev(()=>performance.memory?.usedJSHeapSize||0);console.log(`${lbl}: fps ${r.fps.toFixed(1)} worst frame ${r.worst.toFixed(0)}ms | ws ${(wn/sec).toFixed(1)} msg/s ${(wb/sec/1024).toFixed(1)} KB/s saves ${sv} | heap +${((h1-h0)/1048576).toFixed(1)}MB | script ${((m1.ScriptDuration-m0.ScriptDuration)/sec*1000).toFixed(0)}ms/s task ${((m1.TaskDuration-m0.TaskDuration)/sec*1000).toFixed(0)}ms/s`+(top?'\n'+top:''))};
await meas('baseline 8 plants, no workers',12);
for(const k of ['grower','grower','trimmer','trimmer','fstock','fstock'])await send({t:'work',op:'hire',k,sk:2});await sl(500);
await meas('8 plants + 6 workers',20);await meas('8 plants + 6 workers (2nd window)',20,1);await send({t:'dbg',ff:5});await meas('8 plants + 6 workers (3rd window, busy)',20);
console.log(require('fs').readFileSync('/tmp/perf.log','utf8').split('\n').filter(l=>/PROF|---/.test(l)).join('\n'));
await b.close();srv.kill();process.exit(0)})().catch(e=>{console.log('Error',e);process.exit(1)});
