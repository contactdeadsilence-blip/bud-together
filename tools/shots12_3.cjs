module.exports=async({ev,frames,shot,sl})=>{
 const R=await import('../src/rules.js');const RD=R.READY;
 const S=m=>ev(m=>__bt.send({t:'dbg',...m}),m);await S({min:12*60});
 // growth-stage lineup: germination → ripe (Silent Kush)
 const ages=[6,35,110,200,(230+RD)/2,RD+5];for(let i=0;i<6;i++)await S({spawn:{x:-1.75+i*.7,z:-2.3,s:'kush',age:ages[i],p:{ty:'f'}}});await sl(1500);
 await ev(()=>__bt.cam([0,1.15,-.35,0,.42,-2.3]));await sl(600);await shot('stages-lineup');
 // six strains ripe
 const ss=Object.keys(R.STRAINS);for(let i=0;i<6;i++)await S({spawn:{x:-1.75+i*.7,z:-1.1,s:ss[i],age:RD+5}});await sl(1500);
 await ev(()=>__bt.cam([0,1.35,1.1,0,.55,-1.1]));await sl(600);await shot('strains-lineup');
 await ev(()=>__bt.cam([-.35,1.0,-.45,-.35,.75,-1.1]));await sl(500);await shot('strains-closeup-kush');
 // greenhouse with plants + garden beds outside in the sun
 for(let i=0;i<3;i++)await S({spawn:{x:-8.6,z:-1.6+i*1.6,s:ss[i+3],age:[120,300,RD+5][i]}});
 for(let i=0;i<2;i++)await S({spawn:{x:-3.5+i*2.4,z:7,s:['lemon','og'][i],age:[200,RD+5][i],d:{sz:2,bed:1,sq:2}}});
 await S({spawn:{x:-1,z:7.2,s:'haze',age:150,d:{sz:1.4}}});await S({spawn:{x:0,z:7.2,s:'blue',age:90,d:{sz:.7}}});await sl(2000);
 await ev(()=>__bt.cam([-2,3.2,11.5,-6,.8,2]));await sl(800);await shot('greenhouse-beds');
 await ev(()=>__bt.cam([-5.6,1.7,.3,-8.6,.7,0]));await sl(600);await shot('greenhouse-inside');
 await ev(()=>__bt.cam([-2.2,1.9,10.2,-2.2,.5,7]));await sl(600);await shot('garden-beds');
 await S({min:22*60});await sl(1500);await ev(()=>__bt.cam([-2,3.2,11.5,-6,.8,2]));await sl(600);await shot('greenhouse-night');await S({min:12*60});
 // inspection panel
 await ev(()=>__bt.cam(null));const W=await ev(()=>__bt.W);const k=W.ents.find(e=>e.type=='pot'&&e.data.plant&&e.data.plant.s=='kush'&&e.data.plant.age>230&&e.data.plant.age<RD);
 await S({set:{id:k.id,d:{sz:1.4,sq:2},p:{burn:.25,qs:88,qt:100,fd:'b'}}});await sl(600);
 await ev(()=>{__bt.tp(-.5,-1.9);__bt.lookAt(.35,.6,-3)});await ev(i=>__bt.insp(i),k.id);await sl(1500);await shot('inspect-panel');
 await ev(()=>__bt.closeInsp());
 // curing jars: fresh, half, fully cured — different grades
 const J=[[30,0,'og'],[66,.5,'blue'],[80,1,'lemon'],[90,1,'kush']];for(let i=0;i<J.length;i++)await S({place:{type:'packed',x:1.3+i*.28,z:-.6,data:{s:J[i][2],g:12,q:J[i][0],cure:J[i][1]}}});await sl(1500);
 await ev(()=>__bt.cam([1.72,.55,.05,1.72,.08,-.6]));await sl(600);await shot('curing-jars');await ev(()=>__bt.cam(null));
};
