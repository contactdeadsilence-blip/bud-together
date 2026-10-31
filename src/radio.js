// v19 radio: procedurally generated stations (WebAudio synthesis, no recordings -> no licensing issues).
// Every radio entity gets its own HRTF panner at its position. Music is deterministic from (station, t0): all co-op clients hear the same bars.
import {audioCtx} from './audio.js';
export const STATIONS=[
 {n:'Lo-Fi Greenhouse',bpm:76,key:57,prog:[[0,3,7,10],[5,8,12,15],[-2,2,5,9],[3,7,10,14]],lead:'triangle',pad:'sine',swing:.18,drum:'lofi',crackle:.05},
 {n:'Roots & Dub FM',bpm:72,key:55,prog:[[0,4,7],[5,9,12],[7,11,14],[5,9,12]],lead:'square',pad:'square',swing:0,drum:'dub',crackle:.02},
 {n:'Neon Synthwave',bpm:100,key:52,prog:[[0,3,7],[-4,0,3],[-7,-3,0],[-2,2,5]],lead:'sawtooth',pad:'sawtooth',swing:0,drum:'synth',crackle:0},
 {n:'Ambient Garden',bpm:60,key:62,prog:[[0,4,7,11],[5,9,12,16],[2,5,9,12],[7,11,14,17]],lead:'sine',pad:'sine',swing:0,drum:'none',crackle:0},
 {n:'Funky Harvest',bpm:104,key:50,prog:[[0,3,7,10],[0,3,7,10],[5,9,12,15],[7,10,14,17]],lead:'square',pad:'triangle',swing:.1,drum:'funk',crackle:.01}];
const hz=m=>440*Math.pow(2,(m-69)/12);
function rng(s){return()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff}}
const R=new Map();let noiseB=null;
function nb(ac){if(noiseB)return noiseB;noiseB=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);const d=noiseB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return noiseB}
function voice(ac,out,t,f,dur,type,vol,cut=2400,atk=.01){const o=ac.createOscillator(),g=ac.createGain(),fl=ac.createBiquadFilter();o.type=type;o.frequency.value=f;fl.type='lowpass';fl.frequency.value=cut;
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+atk);g.gain.exponentialRampToValueAtTime(.0008,t+dur);o.connect(fl);fl.connect(g);g.connect(out);o.start(t);o.stop(t+dur+.05)}
function hit(ac,out,t,kind,vol){if(kind=='k'){const o=ac.createOscillator(),g=ac.createGain();o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(42,t+.18);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(g);g.connect(out);o.start(t);o.stop(t+.35);return}
 const s=ac.createBufferSource(),g=ac.createGain(),f=ac.createBiquadFilter();s.buffer=nb(ac);f.type=kind=='h'?'highpass':'bandpass';f.frequency.value=kind=='h'?7000:1800;const d=kind=='h'?.05:.16;
 g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(f);f.connect(g);g.connect(out);s.start(t,Math.random()*.5);s.stop(t+d+.02)}
// schedule one 16th-note step
function step(ac,out,S,i,t,sp){const bar=Math.floor(i/16),q=i%16,ch=S.prog[bar%S.prog.length],r=rng(bar*977+q*31+S.key),root=S.key-12;
 const D=S.drum;if(D!='none'){
  if(D=='lofi'){if(q==0||q==10)hit(ac,out,t,'k',.5);if(q==4||q==12)hit(ac,out,t,'s',.22);if(q%2==0)hit(ac,out,t,'h',.05)}
  if(D=='dub'){if(q==8)hit(ac,out,t,'k',.55),hit(ac,out,t,'s',.25);if(q%4==2)hit(ac,out,t,'h',.06)}
  if(D=='synth'){if(q%4==0)hit(ac,out,t,'k',.5);if(q==4||q==12)hit(ac,out,t,'s',.25);if(q%2==1)hit(ac,out,t,'h',.05)}
  if(D=='funk'){if(q==0||q==7||q==10)hit(ac,out,t,'k',.5);if(q==4||q==12)hit(ac,out,t,'s',.28);hit(ac,out,t,'h',q%2?.03:.06)}}
 // bass
 if(D=='dub'?(q==0||q==6||q==10):D=='synth'?q%2==0:D=='funk'?(q==0||q==3||q==7||q==10||q==14):(q==0||q==8))voice(ac,out,t,hz(root+ch[(D=='synth'&&q%4==2)?2:0]),D=='synth'?sp*1.6:sp*3,D=='synth'?'sawtooth':'sine',.32,D=='synth'?700:500);
 // chords / pads
 if(D=='dub'){if(q%8==4)for(const n of ch)voice(ac,out,t,hz(S.key+n),.18,'square',.045,1600)}
 else if(D=='none'){if(q==0)for(const n of ch)voice(ac,out,t,hz(S.key+n),sp*15,'sine',.07,1800,1.2)}
 else if(q==0||(D=='funk'&&q==6))for(const n of ch)voice(ac,out,t,hz(S.key+n),D=='synth'?sp*14:sp*8,S.pad,D=='synth'?.035:.06,D=='synth'?1400:1900,D=='lofi'?.05:.02);
 // melody (seeded per bar so every client plays the same tune)
 const mel=D=='synth'?q%2==0:D=='none'?q%4==0&&r()<.6:r()<(D=='funk'?.35:.28);if(mel&&bar%8>=2){const sc=[0,2,3,5,7,8,10,12,14,15],n=S.key+12+sc[Math.floor(r()*sc.length)]+(D=='synth'?0:0);voice(ac,out,t,hz(n),D=='none'?sp*6:sp*1.8,S.lead,D=='synth'?.04:.06,D=='none'?3000:2600)}
 if(S.crackle&&r()<.5)hit(ac,out,t+r()*sp,'h',S.crackle*.6)}
export function radioSync(ents,cam){const A=audioCtx();if(!A)return;const {ac,master}=A;const L=ac.listener;
 if(cam){const p=cam.position,f=cam.getWorldDirection?cam.getWorldDirection(new cam.position.constructor()):null;if(L.positionX){L.positionX.value=p.x;L.positionY.value=p.y;L.positionZ.value=p.z;if(f){L.forwardX.value=f.x;L.forwardY.value=f.y;L.forwardZ.value=f.z;L.upX.value=0;L.upY.value=1;L.upZ.value=0}}else{L.setPosition(p.x,p.y,p.z);f&&L.setOrientation(f.x,f.y,f.z,0,1,0)}}
 const live=new Set();
 for(const e of ents){if(e.type!=='radio'||!e.data?.on)continue;live.add(e.id);let r=R.get(e.id);
  if(!r){const g=ac.createGain(),p=ac.createPanner();p.panningModel='HRTF';p.distanceModel='inverse';p.refDistance=1.2;p.maxDistance=40;p.rolloffFactor=1.3;g.connect(p);p.connect(master);r={g,p,next:0,st:-1,t0:0};R.set(e.id,r)}
  const x=e.x,y=(e.y||0)+.2,z=e.z;if(r.p.positionX){r.p.positionX.value=x;r.p.positionY.value=y;r.p.positionZ.value=z}else r.p.setPosition(x,y,z);
  r.g.gain.setTargetAtTime((e.data.vol??.6)*.8,ac.currentTime,.05);
  const S=STATIONS[(e.data.st||0)%STATIONS.length],sp=60/S.bpm/4;
  if(r.st!==e.data.st||r.t0!==e.data.t0){r.st=e.data.st;r.t0=e.data.t0;const el=Math.max(0,(Date.now()-(e.data.t0||Date.now()))/1000);r.next=Math.ceil(el/sp);r.base=ac.currentTime-el+.05}
  const ahead=ac.currentTime+.25;let n=0;while(r.base+r.next*sp<ahead&&n<64){const t=r.base+r.next*sp+((r.next%2)?S.swing*sp:0);if(t>=ac.currentTime-.01)step(ac,r.g,S,r.next,t,sp);r.next++;n++}}
 for(const [id,r] of R)if(!live.has(id)){r.g.gain.setTargetAtTime(0,ac.currentTime,.03);setTimeout(()=>{try{r.g.disconnect()}catch(e){}},300);R.delete(id)}}
export const radioPlaying=()=>[...R.keys()];
