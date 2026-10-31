module.exports=async({ev,stt,frames,press,snd,W,shot,sl})=>{const chk=(n,c,i='')=>console.log(c?'PASS':'FAIL',n,i);
 await ev(()=>{__bt.tp(2,9);__bt.lookAt(2,2.2,14)});
 for(const s of (process.env.SMK||'kush,owl,lemon,blue,og,haze').split(',')){await snd({t:'dbg',give:'joints',gd:{s,n:3,g:10}});await sl(300);await frames(4);
  const p=(await stt()).prompt||await ev(()=>document.getElementById('prompt').textContent);if(s=='kush')chk('prompt shows Smoke',/Smoke/.test(p),p.slice(0,80));
  await press(0);await sl(500);const hud=await ev(()=>document.getElementById('fxhud').textContent);chk('A smokes '+s+' -> hud',hud.length>2,hud+' '+JSON.stringify((await W()).smoke)+' '+(await W()).ents.filter(e=>e.by).map(e=>e.type));
  await sl(900);await shot('smoke-'+s);await snd({t:'trash'});await sl(200)}
 await ev(()=>{const e=document.getElementById('rfx');e.value='1';e.dispatchEvent(new Event('change'))});await sl(200);await shot('smoke-og-reduced');
 chk('reduced saved',await ev(()=>JSON.parse(localStorage.bt_set).rfx==1))};
