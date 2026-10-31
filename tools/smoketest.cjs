// smoking: hold pre-roll, smoke consumes one, records smoke event for co-op, removes when empty, not saved
const WS=require('ws'),{spawn}=require('child_process');const sl=ms=>new Promise(r=>setTimeout(r,ms));const PORT=3215;
const res=[];const ok=(n,c,i='')=>{res.push(!!c);console.log(c?'PASS':'FAIL',n,i)};
(async()=>{const srv=spawn('node',['server/index.js'],{env:{...process.env,PORT,BT_DEBUG:1,DATABASE_URL:'',BT_DATA:'/tmp/bt-smk.json'},stdio:'ignore'});await sl(900);
const {fxBase,FXB}=await import('../src/rules.js');
ok('all strains map to an effect',['kush','haze','owl','lemon','blue','og','mint','void','zzz'].every(s=>FXB[fxBase(s)]));ok('base strains keep own effect',fxBase('owl')=='owl'&&fxBase('og')=='og');
const c={w:null},d={w:null};const ws=new WS(`ws://localhost:${PORT}/ws`);ws.on('message',x=>{const m=JSON.parse(x);if(m.t=='w')c.w=m.w;if(m.t=='lobby'||m.code)c.code=m.code||c.code});await new Promise(r=>ws.on('open',r));const tx=m=>ws.send(JSON.stringify(m));
tx({t:'host',name:'S'});await sl(200);tx({t:'start'});await sl(300);
tx({t:'smoke'});await sl(200);ok('smoking empty-handed does nothing',!(c.w.smoke||[]).length);
tx({t:'dbg',give:'joints',gd:{s:'lemon',n:2,g:10}});await sl(200);const me=c.w.ents.find(e=>e.type=='joints'&&e.by);ok('holding pre-rolls',!!me);
tx({t:'smoke'});await sl(200);ok('smoke event broadcast in world',c.w.smoke?.at(-1)?.s=='lemon'&&c.w.smoke.at(-1).pid);ok('one pre-roll used',c.w.ents.find(e=>e.id==me.id)?.data.n==1);
tx({t:'smoke'});await sl(200);ok('last pre-roll consumed',!c.w.ents.find(e=>e.id==me.id));ok('two smoke events',c.w.smoke.length==2);
srv.kill();require('fs').rmSync('/tmp/bt-smk.json',{force:true});const n=res.filter(Boolean).length;console.log(`${n}/${res.length} passed`);process.exit(n==res.length?0:1)})();
