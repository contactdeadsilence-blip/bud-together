module.exports=async({ev,stt,frames,shot,sl})=>{const chk=(n,c,i='')=>console.log(c?'PASS':'FAIL',n,i);const pr=()=>ev(()=>document.getElementById('prompt').textContent);
 await ev(()=>{__bt.tp(-6.2,4.4);__bt.lookAt(-6.4,1.5,6.9)});await frames(6);let p=await pr();chk('board not targetable through shed wall',!/Contract Board/.test(p),p);
 await ev(()=>{__bt.tp(-6.3,8.3);__bt.lookAt(-6.4,1.5,6.9)});await frames(6);p=await pr();chk('board targetable from front',/Contract Board/.test(p),p);await shot('board-front');
 await ev(()=>{__bt.tp(-6.4,6.85)});await frames(6);const z=await ev(()=>__bt.state().pos||null);chk('board has collision (pushed out)',JSON.stringify(z),JSON.stringify(z))};
