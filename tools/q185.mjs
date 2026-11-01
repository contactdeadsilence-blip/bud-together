import WebSocket from 'ws';import {spawn} from 'child_process';
const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT:3391,BT_DEBUG:1,DATABASE_URL:''},stdio:'ignore'});await new Promise(r=>setTimeout(r,900));
const ws=new WebSocket('ws://localhost:3391/ws');let W;ws.on('message',d=>{const m=JSON.parse(d);if(m.w)W=m.w;if(m.t==='w'||m.t==='state')W=m.w||W;if(m.toast||m.w?.toast)last=(m.w||m).toast});let last;
await new Promise(r=>ws.on('open',r));const S=m=>ws.send(JSON.stringify(m)),sl=t=>new Promise(r=>setTimeout(r,t));
S({t:'host',name:'T'});await sl(500);S({t:'start'});await sl(800);const m0=W?.money;S({t:'cheat'});await sl(800);console.log('cheat',m0,W?.money,W?.cheat);
S({t:'dbg',money:20000});S({t:'dbg',min:480});const put=async(k,x,z)=>{S({t:'dbg',give:k});await sl(300);S({t:'drop',x,z});await sl(300)};
await put('press',-2,-1);await put('oilres',-1.6,-1);await put('oilfill',-1.2,-1);await put('cjars',-1.2,-.7);await put('sbin',-.5,-1.6);
S({t:'dbg',give:'drybud'});await sl(300);const pr=W.ents.find(e=>e.type==='press');S({t:'use',target:pr.id});await sl(500);console.log('res',JSON.stringify(W.ents.find(e=>e.type==='oilres').data),JSON.stringify(last));
const f=W.ents.find(e=>e.type==='oilfill');S({t:'use',target:f.id});await sl(500);console.log('fill',JSON.stringify(last),W.ents.filter(e=>e.type==='pkg').length);
for(let i=0;i<3;i++)await put('trim',-3+i*.3,-2);S({t:'work',op:'hire',k:'extractor',sk:2});
for(let i=0;i<40;i++){await sl(1500);const b=W.ents.find(e=>e.type==='sbin');if(i%5==0)console.log(i,W.workers?.map(v=>v.k+':'+v.say).join(','),(b.data.st||[]).length,W.ents.find(e=>e.type==='oilres').data.g);if((b.data.st||[]).length){console.log('BIN OK');break}}
srv.kill();process.exit(0)
