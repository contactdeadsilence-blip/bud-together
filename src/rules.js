export const STRAINS={kush:{name:'Silent Kush',speed:.85,g:14,ppg:14,diff:2,col:'#7a2fd0',look:{pis:'#e8862e',frost:.8,cal:'#5a1fb0'}},haze:{name:'Pixel Haze',speed:1.15,g:10,ppg:10,diff:1,col:'#f0cf4a',look:{pis:'#f2efe4',frost:.55,cal:'#b8c25a'}},owl:{name:'Night Owl',speed:1,g:12,ppg:12,diff:2,col:'#4fdc7a',look:{pis:'#ff9a3c',frost:.9,cal:'#7ec890'}},
 lemon:{name:'Lemon Byte',speed:1.3,g:8,ppg:9,diff:1,col:'#ffe24a',look:{pis:'#ffb030',frost:.6,cal:'#d8e04a'}},blue:{name:'Blue Glitch',speed:.95,g:13,ppg:13,diff:2,col:'#4a8cff',look:{pis:'#ff7a5a',frost:.75,cal:'#5f8fd8'}},og:{name:'Ghost OG',speed:.75,g:18,ppg:17,diff:3,col:'#e8f4ff',look:{pis:'#c86a2a',frost:1,cal:'#9ab88a'}}};
// v12 stage 3: seed types, pot sizes, soil tiers, nutrients, quality grades
export const SEEDT={r:{n:'Regular',m:1,d:'cheap · random phenotype (yield ±25%)'},f:{n:'Feminized',m:1.6,d:'stable · +4 quality'},a:{n:'Auto',m:1.4,d:'fast (+35%) · grows without much light · -20% yield'}};
export function seedOf(k){if(!k?.startsWith('seed_'))return null;const [,s,t]=k.split('_');return STRAINS[s]?{s,ty:t||'r'}:null}
const SEEDBASE={haze:15,owl:20,kush:30,lemon:12,blue:22,og:40};
export const SOILQ=['Basic Soil','Premium Soil','Super Soil'];
export const CURE=240,GRADES=[['A+',92,1.5],['A',85,1.3],['B',72,1.1],['C',58,.9],['D',0,.7]];
export const grade=q=>GRADES.find(g=>q>=g[1]);
export const gradeOk=(q,min)=>!min||GRADES.findIndex(g=>g[0]==grade(q)[0])<=GRADES.findIndex(g=>g[0]==min);
export const prodQ=d=>Math.min(100,Math.round((d.q??70)+(d.cure||0)*8));
export function stage6(p){if(!p)return '';if(p.dead)return 'dead';const a=p.age;return a<15?'germination':a<60?'seedling':a<170?'veg':a<230?'pre-flower':a<READY?'flower':'ripe'}
export const STAGE6=['germination','seedling','veg','pre-flower','flower','ripe'];
export const SHOP={soil:{n:'Soil Bag',p:20,uses:4},soil_p:{n:'Premium Soil',p:35,uses:4,ent:'soil',dat:{sq:1}},soil_s:{n:'Super Soil',p:55,uses:4,ent:'soil',dat:{sq:2}},pot:{n:'Pot',p:10},pot_s:{n:'Small Pot',p:6,ent:'pot',dat:{sz:.7}},pot_l:{n:'Large Pot',p:18,ent:'pot',dat:{sz:1.4}},gbed:{n:'Garden Bed',p:45,ent:'pot',dat:{sz:2,bed:1}},nutr_g:{n:'Grow Nutrients (N)',p:18,uses:8,ent:'nutr',dat:{f:'g'}},nutr_b:{n:'Bloom Nutrients (P-K)',p:18,uses:8,ent:'nutr',dat:{f:'b'}},
 water:{n:'Watering Can',p:0,hide:1},shelf:{n:'Storage Shelf',p:45},seedrack:{n:'Wall Seed Rack',p:35},nutr:{n:'Nutrients',p:15,uses:8},light:{n:'Grow Light',p:60},rack:{n:'Drying Rack',p:40},jars:{n:'Jar Box',p:12,uses:10},scale:{n:'Scale',p:35},gbag:{n:'Garbage Bags',p:4,uses:5},papers:{n:'Rolling Papers',p:6,uses:10},table:{n:'Work Table',p:60},bed:{n:'Bed',p:150},tcan:{n:'Trash Can',p:20},
 pal_soil:{n:'Pallet · 8 Soil Bags',p:136,pal:'soil',k:8},pal_nutr:{n:'Pallet · 6 Nutrients',p:72,pal:'nutr',k:6},pal_pot:{n:'Pallet · 10 Pots',p:80,pal:'pot',k:10},pal_jars:{n:'Pallet · 6 Jar Boxes',p:61,pal:'jars',k:6}};
for(const k of ['soil_p','soil_s','pot_s','pot_l','gbed','nutr_g','nutr_b','pal_soil','pal_nutr','pal_pot','pal_jars']){const v=SHOP[k];delete SHOP[k];SHOP[k]=v}
for(const s in STRAINS)for(const t in SEEDT)SHOP['seed_'+s+(t=='r'?'':'_'+t)]={n:STRAINS[s].name+(t=='r'?' Seeds':' '+SEEDT[t].n+' Seeds'),p:Math.round(SEEDBASE[s]*SEEDT[t].m),uses:3};
// v13 section 2: strain collection & genetics
export const RAR=[['Common','#b8b8b8'],['Uncommon','#5fd36a'],['Rare','#4a8cff'],['Epic','#b45aff'],['Legendary','#ffb030'],['Mythical','#ff4a9a']];
const LK={kush:[2,'w','chunky'],haze:[0,'n','spear'],owl:[1,'s','fox'],lemon:[0,'n','spear'],blue:[1,'w','fox'],og:[3,'s','chunky']};
for(const k in LK){STRAINS[k].rar=LK[k][0];STRAINS[k].look.lf=LK[k][1];STRAINS[k].look.st=LK[k][2]}
export const BASE=Object.keys(STRAINS);
Object.assign(STRAINS,{mint:{name:'Mint Static',rar:2,speed:1.05,g:12,ppg:15,diff:2,col:'#5ae8d0',look:{pis:'#f4f4f4',frost:.95,cal:'#7ad8c8',lf:'s',st:'fox'}},
 ember:{name:'Ember Queen',rar:3,speed:.9,g:14,ppg:19,diff:2,col:'#ff6a3a',look:{pis:'#ff3a1a',frost:.7,cal:'#c8502a',lf:'w',st:'chunky'}},
 aurora:{name:'Aurora Byte',rar:4,speed:.85,g:15,ppg:24,diff:3,col:'#7af0ff',look:{pis:'#ff7af0',frost:1,cal:'#6ab8ff',lf:'n',st:'spear'}},
 phantom:{name:'Phantom Mint',rar:3,hid:1,speed:1,g:14,ppg:20,diff:2,col:'#c8fff0',look:{pis:'#ffffff',frost:1,cal:'#b8f0e0',lf:'s',st:'spear'}},
 sol:{name:'Solar Flare',rar:4,hid:1,speed:1.2,g:13,ppg:25,diff:2,col:'#ffb020',look:{pis:'#ff5a00',frost:.85,cal:'#ffc040',lf:'n',st:'fox'}},
 void:{name:'Violet Void',rar:5,hid:1,speed:.8,g:17,ppg:32,diff:3,col:'#5a1aa0',look:{pis:'#ff3ad0',frost:1,cal:'#2a0a5a',lf:'w',st:'chunky'}}});
export const pairKey=(a,b)=>[a,b].sort().join('+');
export const HIDDEN={'blue+kush':'void','ember+lemon':'sol','mint+og':'phantom'};
export const MUTS={vari:{n:'Variegated',rar:2,q:3,d:'marbled white-green leaves · +3 quality'},albino:{n:'Albino',rar:3,q:6,d:'ghost-white leaves · +6 quality'},twin:{n:'Twin Cola',rar:3,y:1.3,d:'double top cola · +30% yield'},gold:{n:'Golden Trichomes',rar:5,q:12,y:1.1,d:'gold frost · +12 quality'}};
export function rollMut(ch=.04,rng=Math.random){if(rng()>=ch)return null;const r=rng();return r<.4?'vari':r<.7?'albino':r<.92?'twin':'gold'}
export const PACKW=[60,30,14,6,2,1];
export function rollPack(rng=Math.random){const ks=Object.keys(STRAINS).filter(k=>!STRAINS[k].hid&&!STRAINS[k].x),wt=ks.map(k=>PACKW[STRAINS[k].rar||0]);let t=rng()*wt.reduce((a,b)=>a+b,0);for(let i=0;i<ks.length;i++)if((t-=wt[i])<0)return ks[i];return ks[0]}
export const JOURNAL=()=>[...Object.keys(STRAINS).filter(k=>!STRAINS[k].x),...Object.keys(MUTS).map(k=>'mu:'+k)];
export const collPct=w=>{const J=JOURNAL(),d=w.disc||{};return Math.round(J.filter(k=>d[k]).length/J.length*100)};
export const MILES=[[25,150,1],[50,400,1],[75,900,2],[100,2500,3]];// [% collected, $, ★]
export function regGen(gen){for(const k in gen||{})STRAINS[k]=gen[k]}
export const NW1=['Midnight','Neon','Cosmic','Frosty','Royal','Wild','Golden','Shadow','Electric','Velvet','Lucky','Crimson'],NW2=['Dream','Haze','Kush','Cookie','Fire','Glitch','Diesel','Breath','Nova','Runtz','Thunder','Gelato'];
const mixc=(x,y)=>'#'+[1,3,5].map(i=>Math.round((parseInt(x.slice(i,i+2),16)+parseInt(y.slice(i,i+2),16))/2).toString(16).padStart(2,'0')).join('');
export function makeCross(w,a,b){const pk=pairKey(a,b);if(HIDDEN[pk])return HIDDEN[pk];const G=w.gen??={};for(const k in G)if(G[k].pk==pk)return k;const A=STRAINS[a],B=STRAINS[b],av=f=>(A[f]+B[f])/2;
 const k='x'+(w.nid++);G[k]={name:A.name.split(' ')[0]+' × '+B.name.split(' ')[0],x:1,pk,par:[a,b],rar:Math.min(5,Math.max(A.rar||0,B.rar||0)+(Math.random()<.35?1:0)),speed:Math.round(av('speed')*100)/100,g:Math.round(av('g'))+1,ppg:Math.round(av('ppg'))+2,diff:Math.max(A.diff,B.diff),col:mixc(A.col,B.col),look:{pis:A.look.pis,frost:Math.max(A.look.frost,B.look.frost),cal:mixc(A.look.cal,B.look.cal),lf:A.look.lf,st:B.look.st}};regGen(G);return k}
SHOP.seed_pack={n:'Mystery Seed Pack',p:60,uses:1};SHOP.brush={n:'Pollen Brush',p:25,uses:3};SHOP.seed_x={n:'Bred Seeds',p:0,uses:3,hide:1};
export const GH={x0:-11,x1:-6.2,z0:-2.6,z1:2.6};// greenhouse footprint (west of the shed)
export const inGH=e=>e.x>GH.x0&&e.x<GH.x1&&e.z>GH.z0&&e.z<GH.z1;
// shelves / sink / utilities
export const SLOTS=6,CAN=100,FILL=10,GAL=2;// shelf slots; can capacity %; % per fill tick; gallons per full can
export const RATE={water:.5,kwh:.15,base:2,light:.6};// $/gallon, $/kWh, $/day base, kW per placed grow light

export const WILT0=120,WILT1=300,DIE=480;// seconds at 0% moisture: wilting starts, fully wilted, dead (8 min grace)
export const DRAIN=600,DRAIN_EMPTY=900,NUTR=600,THIRSTY=25,HFLOOR=30;// s for full->empty soil with a live plant / without; nutrient run-out; thirsty warning %; light/food can't push health below this
export const POUR=5;
export const READY=480,DRY=60;
export function stage(p){if(!p)return '';if(p.dead)return 'dead';const a=p.age;return a<60?'seedling':a<200?'veg':a<READY?'flower':'ready'}
// v10: dirt dumping + shed decor
export const BAGCAP=3;// pots of soil one garbage bag holds
export const STYLE={
 paint:{cream:{n:'Cream',c:'#efe4cf',p:0},white:{n:'Chalk White',c:'#f4f3ee',p:25},sage:{n:'Sage Green',c:'#a9bf9a',p:25},forest:{n:'Forest',c:'#4f6e4f',p:30},slate:{n:'Slate Blue',c:'#7c8fa3',p:30},clay:{n:'Terracotta',c:'#c98a68',p:30},charcoal:{n:'Charcoal',c:'#4a4c50',p:35},blush:{n:'Blush',c:'#e2b7b0',p:25}},
 panel:{plank:{n:'Vertical Planks',p:0},shiplap:{n:'Shiplap',p:60},drywall:{n:'Smooth Drywall',p:40},brick:{n:'Exposed Brick',p:90},osb:{n:'OSB Board',p:30}},
 floor:{oak:{n:'Oak Planks',p:0},walnut:{n:'Walnut Planks',p:80},concrete:{n:'Polished Concrete',p:70},tile:{n:'Checker Tile',p:90},rubber:{n:'Rubber Grow Mat',p:60}},
 light:{warm:{n:'Warm 2700K',c:'#ffd49a',p:0},neutral:{n:'Neutral 4000K',c:'#fff0dc',p:15},cool:{n:'Daylight 6500K',c:'#e4efff',p:15},purple:{n:'Purple Haze',c:'#c79bff',p:30},green:{n:'Grow Green',c:'#9dffb0',p:30},sunset:{n:'Sunset',c:'#ff9a6a',p:30}},
 fix:{shade:{n:'Green Shade',p:0},cage:{n:'Industrial Cage',p:35},pendant:{n:'Glass Pendant',p:45},tube:{n:'LED Shop Tube',p:40}}};
// decor: w/d footprint (m), h height, s='floor'|'wall'|'top'(floor or table top), solid blocks walking
export const DECOR={rug:{n:'Woven Rug',p:40,w:1.6,d:2.2,h:.02,s:'floor'},rugr:{n:'Round Jute Rug',p:35,w:1.5,d:1.5,h:.02,s:'floor'},couch:{n:'Leather Couch',p:220,w:1.9,d:.85,h:.85,s:'floor',solid:1},beanbag:{n:'Bean Bag',p:60,w:.8,d:.8,h:.6,s:'floor',solid:1},
 table:{n:'Coffee Table',p:70,w:1.1,d:.6,h:.42,s:'floor',solid:1,top:.42},wtable:{n:'Work Table',p:95,w:1.4,d:.7,h:.9,s:'floor',solid:1,top:.9},bookcase:{n:'Bookcase',p:110,w:.9,d:.35,h:1.8,s:'floor',solid:1},fridge:{n:'Mini Fridge',p:140,w:.5,d:.5,h:.85,s:'floor',solid:1,top:.85},
 fan:{n:'Standing Fan',p:45,w:.45,d:.45,h:1.3,s:'floor',solid:1},plant:{n:'Monstera Plant',p:35,w:.5,d:.5,h:1.1,s:'top'},cactus:{n:'Desk Cactus',p:15,w:.18,d:.18,h:.25,s:'top'},lamp:{n:'Table Lamp',p:30,w:.3,d:.3,h:.5,s:'top'},
 poster:{n:'Strain Poster',p:20,w:.6,d:.04,h:.85,s:'wall'},poster2:{n:'Retro Poster',p:20,w:.6,d:.04,h:.85,s:'wall'},neon:{n:'Neon Leaf Sign',p:120,w:.9,d:.06,h:.6,s:'wall'},clock:{n:'Wall Clock',p:25,w:.4,d:.05,h:.4,s:'wall'},shelfw:{n:'Floating Shelf',p:30,w:1,d:.25,h:.3,s:'wall'}};
export const defDecor=()=>({paint:'cream',panel:'plank',floor:'oak',light:'warm',fix:'shade',own:[],items:[]});
// interior bounds the decor must fit in (room 1 / with the expansion)
export const FXB={kush:['relax','😌','Relaxed',60],haze:['speed','⚡','Speed boost',40],owl:['nv','🦉','Night vision',60],lemon:['jump','🍋','Jump boost',30],blue:['wobble','🌀','Glitch vision',45],og:['fog','👻','Ghostly fog',50]};const FXMAP={mint:'lemon',ember:'haze',aurora:'owl',phantom:'og',sol:'haze',void:'kush'};
export function fxBase(s,d=0){if(FXB[s])return s;if(FXMAP[s])return FXMAP[s];const p=STRAINS[s]?.par;if(p&&d<4)return fxBase(p[0],d+1);const k=Object.keys(FXB);let h=0;for(const ch of String(s))h=h*31+ch.charCodeAt(0)|0;return k[Math.abs(h)%k.length]}
export const RACKN=10;export function rackSnap(B,x,z){const d=[[x-B.x0,B.x0+.06,z,Math.PI/2],[B.x1-x,B.x1-.06,z,-Math.PI/2],[z-B.z0,x,B.z0+.06,0],[B.z1-z,x,B.z1-.06,Math.PI]];const m=d.reduce((a,b)=>Math.abs(b[0])<Math.abs(a[0])?b:a);return m[2]===z&&m[3]!==0&&m[3]!==Math.PI?{x:m[1],z,ry:m[3]}:{x,z:m[2],ry:m[3]}}
export const ROOMB=r=>({x0:-4.1,x1:r>1?11:4.1,z0:-5,z1:5});
// v11: day length, surfaces, sleep, pre-rolls
export const DAYSEC=1800;// real seconds per in-game day (30 min)
export const MINPS=1440/DAYSEC;// in-game minutes per real second
export const START_CASH=1000;
export const SURFS={desk:{w:.8,d:1.5,h:.935,max:8},table:{w:1.1,d:.6,h:.78,max:8}};// local top size (x,z) + height
export const BIG=['seedrack','shelf','pallet','sink','table','bed','tcan','desk','dirtbag','trash','light','rack','water'];// can't sit on a table
export const ROLL=1.6,JOINT=6;// seconds to roll; $ per pre-roll on the spot (vs $4/g jar)
export const WAKE=7*60,canSleep=min=>min>=19*60||min<5*60;
// v12: shared catalog categories (laptop shop + Quick Bud phone app)
export const CATS={seeds:'Seeds',grow:'Grow Supplies',equip:'Equipment',furn:'Furniture',bulk:'Bulk Pallets'};
export function catOf(k){if(k.startsWith('seed_'))return 'seeds';if(k.startsWith('pal_'))return 'bulk';if(k.startsWith('pot_')||k=='gbed')return 'equip';const S=SHOP[k];if(S?.cat)return S.cat;if(['light','rack','scale','shelf','seedrack'].includes(k))return 'equip';if(['table','bed','tcan'].includes(k))return 'furn';return 'grow'}
export const MAXORD=10;// max units per line in one order
export function harvQ(p){const b=p.qt?p.qs/p.qt*100:60;return Math.max(15,Math.min(92,Math.round(b*.9+(p.sq||0)*4+(p.ty==='f'?4:0)+((p.ph||1)-1)*8)))}
// v13a: light-weight item collisions — per-object support shapes; dropped items settle on the highest surface under them
// (sink basin = bottom + walls that keep items inside, tables/desk tops, shelf boards, pallets, decor tops, else floor)
const SINKB={W:.72,D:.56,T:.045,bot:.585,rim:.905};
export function shapesOf(w){const S=[];for(const e of w.ents||[]){if(e.by)continue;const t=e.type;
  if(t==='sink')S.push({e,w:SINKB.W,d:SINKB.D,tops:[SINKB.bot],basin:1});
  else if(SURFS[t])S.push({e,w:SURFS[t].w,d:SURFS[t].d,tops:[SURFS[t].h]});
  else if(t==='shelf')S.push({e,w:1.26,d:.46,tops:[.098,.568,1.268]});
  else if(t==='pallet')S.push({e,w:1.1,d:1,tops:[.16]});}
 for(const it of w.decor?.items||[]){const D=DECOR[it.k];if(D&&D.h>.05&&D.s!=='wall')S.push({e:it,w:D.w,d:D.d,tops:[(it.y||0)+D.h]})}return S}
export function settle(w,x,z,yh=9,r=.1){let best={x,z,y:0,on:null};
 for(const s of shapesOf(w)){const e=s.e,ry=e.ry||0,c=Math.cos(ry),sn=Math.sin(ry),dx=x-e.x,dz=z-e.z;let lx=dx*c-dz*sn,lz=dx*sn+dz*c;
  if(Math.abs(lx)>s.w/2||Math.abs(lz)>s.d/2)continue;const top=s.tops.filter(t=>t<=yh+.08).pop();if(top==null||top<best.y)continue;
  if(s.basin){const ix=s.w/2-SINKB.T-r,iz=s.d/2-SINKB.T-r;lx=Math.max(-ix,Math.min(ix,lx));lz=Math.max(-iz,Math.min(iz,lz))}
  best={x:+(e.x+lx*c+lz*sn).toFixed(3),z:+(e.z-lx*sn+lz*c).toFixed(3),y:+top.toFixed(3),on:e.type||e.k}}
 return best}
