let ac,master,windG,windF;
export function initAudio(){if(ac)return;setTimeout(()=>{for(const k in SFILE)loadS(k)},800);ac=new (window.AudioContext||window.webkitAudioContext)();master=ac.createGain();master.gain.value=.7;
 const comp=ac.createDynamicsCompressor();master.connect(comp);comp.connect(ac.destination);
 const b=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<d.length;i++){l=(l+.02*(Math.random()*2-1))/1.02;d[i]=l*3.5}
 const n=ac.createBufferSource();n.buffer=b;n.loop=true;windF=ac.createBiquadFilter();windF.type='bandpass';windF.frequency.value=500;windF.Q.value=.6;windG=ac.createGain();windG.gain.value=0;n.connect(windF);windF.connect(windG);windG.connect(master);n.start()}
export const setVol=v=>master&&(master.gain.value=v);
export function setWind(v){if(!ac)return;windG.gain.setTargetAtTime(v*.5,ac.currentTime,.5);windF.frequency.setTargetAtTime(300+v*900+Math.sin(ac.currentTime*.7)*150,ac.currentTime,.3)}
function tone(f,f2,dur,type='sine',vol=.25,delay=0){const t=ac.currentTime+delay,o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f2,t+dur);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.05)}
function noise(dur,freq,vol=.3){const t=ac.currentTime,s=ac.createBufferSource(),b=ac.createBuffer(1,ac.sampleRate*dur,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;s.buffer=b;
 const f=ac.createBiquadFilter();f.type='bandpass';f.frequency.value=freq;const g=ac.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f);f.connect(g);g.connect(master);s.start()}
let NB=null;const nbuf=()=>{if(!NB){NB=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}return NB};
// v1.8.3 shaped noise from one cached buffer (no per-call allocation): filter type, freq start→end, duration, volume, delay, attack
function nz(dur,f1,f2,vol=.2,delay=0,type='bandpass',q=1,att=.005){const t=ac.currentTime+delay,s=ac.createBufferSource();s.buffer=nbuf();const f=ac.createBiquadFilter();f.type=type;f.Q.value=q;f.frequency.setValueAtTime(f1,t);f.frequency.exponentialRampToValueAtTime(f2,t+dur);
 const g=ac.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+att);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f);f.connect(g);g.connect(master);s.start(t,Math.random()*1.5);s.stop(t+dur+.05)}
// v1.8.4 real recorded samples (public/sfx, ~90KB total) lazy-loaded after first user gesture; procedural fallback until decoded
const SMP={},SFILE={press:'press',clink:'jar',trim:'trim'},SVOL={press:.9,clink:.8,trim:.8};
function loadS(k){if(SMP[k]!==undefined)return;SMP[k]=null;fetch('sfx/'+SFILE[k]+'.mp3').then(r=>r.arrayBuffer()).then(b=>ac.decodeAudioData(b)).then(b=>SMP[k]=b).catch(()=>{})}
function playS(k){const b=SMP[k];if(!b){loadS(k);return false}const s=ac.createBufferSource(),g=ac.createGain();s.buffer=b;s.playbackRate.value=k=='press'?1:.95+Math.random()*.1;g.gain.value=SVOL[k];s.connect(g);g.connect(master);s.start();return true}
// looping outdoor ambience: buffer source -> lowpass -> gain; louder outside, muffled indoors, smooth crossfade
let amb=null,ambIn=null,ambOn=false,ambReq=false;
function loadAmb(){if(amb)return;fetch('sfx/ambience.mp3').then(r=>r.arrayBuffer()).then(b=>ac.decodeAudioData(b)).then(buf=>{const s=ac.createBufferSource();s.buffer=buf;s.loop=true;s.loopStart=.06;s.loopEnd=buf.duration-.06;
 const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=18000;f.Q.value=.5;const g=ac.createGain();g.gain.value=0;s.connect(f);f.connect(g);g.connect(master);s.start(0,.06);amb={s,f,g};if(ambIn!=null){const v=ambIn;ambIn=null;setAmbience(ambOn,v)}}).catch(()=>{amb=false})}
export function setAmbience(on,inside){if(!ac)return;if(!ambReq){ambReq=true;setTimeout(loadAmb,1500)}ambOn=on;if(!amb){ambIn=inside;return}if(ambIn===inside&&ambOn===on&&amb.on===on)return;ambIn=inside;amb.on=on;const t=ac.currentTime;
 amb.g.gain.setTargetAtTime(on?(inside?.16:.42):0,t,.7);amb.f.frequency.setTargetAtTime(inside?650:18000,t,.6)}
const SFX2={press:()=>{if(!playS('press'))SFX2.press0()},clink:()=>{if(!playS('clink'))SFX2.clink0()},trim:()=>{if(!playS('trim'))SFX2.trim0()},
 press0:()=>{tone(68,52,1.3,'sawtooth',.07);tone(136,104,1.3,'triangle',.04);nz(1.2,2500,900,.12,0,'bandpass',.7,.3);for(let i=0;i<14;i++)nz(.05+Math.random()*.06,5000+Math.random()*3000,4000,.05+Math.random()*.08,1.15+i*.05+Math.random()*.03,'highpass',.5);nz(.9,6000,3500,.06,1.15,'highpass',.4,.05)},
 clink0:()=>{tone(2650,2600,.35,'sine',.12);tone(3980,3950,.25,'sine',.07,.005);tone(5300,5250,.15,'sine',.04,.01);nz(.03,6000,6000,.08);tone(2650,2600,.18,'sine',.05,.09)},
 scale:()=>{tone(1900,1900,.06,'square',.05);tone(1900,1900,.08,'square',.05,.1)},
 bag:()=>{for(let i=0;i<7;i++)nz(.04+Math.random()*.05,2500+Math.random()*4000,2000,.08+Math.random()*.06,i*.045+Math.random()*.03,'bandpass',1.5);nz(.06,1200,800,.08,.36)},
 label:()=>{tone(210,210,.45,'square',.035);nz(.45,2600,2200,.07,0,'bandpass',4,.02);for(let i=0;i<5;i++)tone(900,700,.02,'square',.04,.05+i*.08);tone(1300,1300,.05,'triangle',.06,.5)},
 seal:()=>{tone(150,150,1.1,'sawtooth',.03);nz(1.1,1800,350,.14,0,'lowpass',.8,.1);tone(1000,400,.08,'triangle',.08,1.1);nz(.06,3000,3000,.08,1.12)},
 hang:()=>{nz(.18,1400,900,.1,0,'bandpass',.8);tone(520,420,.07,'triangle',.06,.12)},
 unhang:()=>{nz(.18,900,1500,.1,0,'bandpass',.8);tone(420,560,.07,'triangle',.06,.1)},
 trim0:()=>{for(let i=0;i<4;i++){nz(.035,4500,3000,.12,i*.11,'highpass',.7,.002);tone(1600,900,.03,'square',.03,i*.11)}}};
export function sfx(k,x=0){if(!ac)return;if(SFX2[k])return SFX2[k]();
 ({grab:()=>{noise(.08,1800,.25);tone(220,140,.08,'triangle',.15)},jump:()=>tone(300,600,.18,'square',.08),leap:()=>{tone(250,700+x*500,.3,'sawtooth',.08);noise(.3,900,.15)},
  mantle:()=>tone(400,800,.15,'triangle',.15),land:()=>{tone(120,50,.2,'sine',.4*x+.1);noise(.15,400,.2*x+.05)},slip:()=>tone(600,150,.4,'triangle',.18),
  cp:()=>[523,659,784,1046].forEach((f,i)=>tone(f,f,.25,'triangle',.15,i*.09)),win:()=>[523,659,784,1046,784,1046,1318].forEach((f,i)=>tone(f,f*1.01,.35,'square',.08,i*.13)),
  buy:()=>[784,1046].forEach((f,i)=>tone(f,f,.12,'triangle',.15,i*.07)),pick:()=>tone(330,520,.08,'triangle',.15),drop:()=>tone(300,160,.1,'triangle',.15),pour:()=>noise(.5,700,.15),cash:()=>[1046,1318,1568].forEach((f,i)=>tone(f,f,.18,'square',.07,i*.08)),emote:()=>tone(880,1200,.1,'sine',.12),check:()=>[880,1320].forEach((f,i)=>tone(f,f,.16,'sine',.18,i*.1)),ui:()=>tone(660,880,.06,'triangle',.12)})[k]?.()}
export const audioCtx=()=>ac?{ac,master}:null;
export const ambState=()=>({ac:!!ac,loaded:!!amb,on:ambOn,inside:ambIn,smp:Object.keys(SFILE).filter(k=>SMP[k])});
