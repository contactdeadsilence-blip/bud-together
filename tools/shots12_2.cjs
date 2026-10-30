module.exports=async({ev,frames,shot,sl})=>{
 const S=m=>ev(m=>__bt.send({t:'dbg',...m}),m);
 // three strains, flowering → ripe, side by side
 const xs=[-1.2,-.4,.4];const ss=['kush','haze','owl'];for(let i=0;i<3;i++)await S({spawn:{x:xs[i],z:-3,s:ss[i],age:470}});await sl(1200);
 await ev(()=>__bt.tp(-.4,-1.4));await ev(()=>__bt.lookAt(-.4,.55,-3));await shot('buds-plants');
 const W=await ev(()=>__bt.W);const pots=W.ents.filter(e=>e.type=='pot'&&e.data.plant&&e.data.plant.age>=400);
 for(const p of pots){await ev(([x,z])=>__bt.cam([x+.28,.95,z+.32,x,.82,z]),[p.x,p.z]);await sl(500);await shot('bud-closeup-'+p.data.plant.s)}
 await ev(([x,z])=>__bt.cam([x+3.2,1.3,z+3.2,x,.8,z]),[pots[0].x,pots[0].z]);await sl(400);await shot('bud-lod-far');
 // harvested / dried / packed product close-ups (on the floor, camera close)
 await ev(()=>__bt.cam(null));const items=[['wetbud','kush'],['drybud','owl'],['packed','haze'],['packed','kush']];
 for(let i=0;i<items.length;i++)await S({place:{type:items[i][0],x:1.6+i*.3,z:-1,data:{s:items[i][1],g:12}}});await sl(1200);
 await ev(()=>__bt.cam([2.05,.55,-.35,2.05,.05,-1]));await sl(500);await shot('bud-product');
 await ev(()=>__bt.cam([1.75,.3,-.75,1.75,.06,-1]));await sl(500);await shot('bud-product-closeup');await ev(()=>__bt.cam(null));
};
