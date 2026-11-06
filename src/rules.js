export const STRAINS={kush:{name:'Silent Kush',speed:.85,g:14,ppg:14,diff:2,col:'#7a2fd0',look:{pis:'#e8862e',frost:.8,cal:'#5a1fb0'}},haze:{name:'Pixel Haze',speed:1.15,g:10,ppg:10,diff:1,col:'#f0cf4a',look:{pis:'#f2efe4',frost:.55,cal:'#b8c25a'}},owl:{name:'Night Owl',speed:1,g:12,ppg:12,diff:2,col:'#4fdc7a',look:{pis:'#ff9a3c',frost:.9,cal:'#7ec890'}},
 lemon:{name:'Lemon Byte',speed:1.3,g:8,ppg:9,diff:1,col:'#ffe24a',look:{pis:'#ffb030',frost:.6,cal:'#d8e04a'}},blue:{name:'Blue Glitch',speed:.95,g:13,ppg:13,diff:2,col:'#4a8cff',look:{pis:'#ff7a5a',frost:.75,cal:'#5f8fd8'}},og:{name:'Ghost OG',speed:.75,g:18,ppg:17,diff:3,col:'#e8f4ff',look:{pis:'#c86a2a',frost:1,cal:'#9ab88a'}}};
// v12 stage 3: seed types, pot sizes, soil tiers, nutrients, quality grades
export const SEEDT={r:{n:'Regular',m:1,d:'cheap · random phenotype (yield ±25%)'},f:{n:'Feminized',m:1.6,d:'stable · +4 quality'},a:{n:'Auto',m:1.4,d:'fast (+35%) · grows without much light · -20% yield'}};
export function seedOf(k){if(!k?.startsWith('seed_'))return null;const [,s,t]=k.split('_');return STRAINS[s]?{s,ty:t||'r'}:null}
const SEEDBASE={haze:15,owl:20,kush:30,lemon:12,blue:22,og:40,cherry:18,diesel:35,gelato:28,skunk:16};
export const SOILQ=['Basic Soil','Premium Soil','Super Soil'];
export const CURE=240,GRADES=[['A+',92,1.5],['A',85,1.3],['B',72,1.1],['C',58,.9],['D',0,.7]];
export const grade=q=>GRADES.find(g=>q>=g[1]);
export const gradeOk=(q,min)=>!min||GRADES.findIndex(g=>g[0]==grade(q)[0])<=GRADES.findIndex(g=>g[0]==min);
export const prodQ=d=>Math.max(0,Math.min(100,Math.round((d.q??70)+(d.cure||0)*(d.ct==='grove'?10:8)+(d.bq||0)-(d.pen||0))));
export function stage6(p){if(!p)return '';if(p.dead)return 'dead';const a=p.age;return a<15?'germination':a<60?'seedling':a<170?'veg':a<230?'pre-flower':a<READY?'flower':'ripe'}
export const STAGE6=['germination','seedling','veg','pre-flower','flower','ripe'];
export const SHOP={soil:{n:'Soil Bag',p:20,uses:4},soil_p:{n:'Premium Soil',p:35,uses:4,ent:'soil',dat:{sq:1}},soil_s:{n:'Super Soil',p:55,uses:4,ent:'soil',dat:{sq:2}},pot:{n:'Pot',p:10},pot_s:{n:'Small Pot',p:6,ent:'pot',dat:{sz:.7}},pot_l:{n:'Large Pot',p:18,ent:'pot',dat:{sz:1.4}},gbed:{n:'Garden Bed',p:45,ent:'pot',dat:{sz:2,bed:1}},nutr_g:{n:'Grow Nutrients (N)',p:18,uses:8,ent:'nutr',dat:{f:'g'},d:'Green bottle · nitrogen for veg. Best while the plant is bushing out.'},nutr_b:{n:'Bloom Nutrients (P-K)',p:18,uses:8,ent:'nutr',dat:{f:'b'},d:'Purple bottle · phosphorus & potassium for pre-flower and flower.'},
 water:{n:'Watering Can',p:0,hide:1},shelf:{n:'Storage Shelf',p:45},seedrack:{n:'Wall Seed Rack',p:35},nutr:{n:'Balanced Nutrients',p:15,uses:8,d:'All-purpose feed. Fine any stage, but Grow (N) is better in veg and Bloom (P-K) in flower.'},light:{n:'Grow Light',p:60},rack:{n:'Drying Rack',p:40},jars:{n:'Jar Box',p:12,uses:10},scale:{n:'Scale',p:35},shears:{n:'Trim Shears',p:15},trim:{n:'Trim',p:0,hide:1},hbin:{n:'Harvest Bin',p:25},gbag:{n:'Garbage Bags',p:4,uses:5},papers:{n:'Rolling Papers',p:6,uses:10},table:{n:'Work Table',p:60},bed:{n:'Bed',p:150},tcan:{n:'Trash Can',p:20},
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
 void:{name:'Violet Void',rar:5,hid:1,speed:.8,g:17,ppg:32,diff:3,col:'#5a1aa0',look:{pis:'#ff3ad0',frost:1,cal:'#2a0a5a',lf:'w',st:'chunky'}},
 cherry:{name:'Cherry Codec',rar:1,speed:1.25,g:9,ppg:11,diff:1,col:'#e83a5a',look:{pis:'#ff7a9a',frost:.65,cal:'#c84060',lf:'n',st:'spear'}},
 diesel:{name:'Diesel Bit',rar:2,speed:.75,g:16,ppg:16,diff:2,col:'#c8a040',look:{pis:'#f0d070',frost:.7,cal:'#a88830',lf:'w',st:'chunky'}},
 gelato:{name:'Neon Gelato',rar:3,speed:.95,g:13,ppg:18,diff:2,col:'#d07aff',look:{pis:'#ffe0f0',frost:.95,cal:'#b060e0',lf:'s',st:'fox'}},
 skunk:{name:'Crypto Skunk',rar:0,speed:1.1,g:11,ppg:10,diff:1,col:'#6aaa2a',look:{pis:'#e8f0a0',frost:.5,cal:'#5a9030',lf:'w',st:'spear'}},
 frost:{name:'Frost Protocol',rar:4,speed:.88,g:15,ppg:26,diff:3,col:'#d0f0ff',look:{pis:'#ffffff',frost:1,cal:'#a8d8f0',lf:'n',st:'fox'}},
 nebula:{name:'Nebula Kush',rar:5,hid:1,speed:.82,g:18,ppg:30,diff:3,col:'#3a2a8a',look:{pis:'#ff8ad0',frost:1,cal:'#2a1a6a',lf:'w',st:'chunky'}}});
for(const s of['cherry','diesel','gelato','skunk'])for(const t in SEEDT)SHOP['seed_'+s+(t=='r'?'':'_'+t)]={n:STRAINS[s].name+(t=='r'?' Seeds':' '+SEEDT[t].n+' Seeds'),p:Math.round(SEEDBASE[s]*SEEDT[t].m),uses:3};
export const pairKey=(a,b)=>[a,b].sort().join('+');
export const HIDDEN={'blue+kush':'void','ember+lemon':'sol','mint+og':'phantom','cherry+diesel':'nebula'};
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
export const SLOTS=12,RACKCAP=8,CAN=100,FILL=10,GAL=2;// shelf slots; can capacity %; % per fill tick; gallons per full can
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
 poster:{n:'Strain Poster',p:20,w:.6,d:.04,h:.85,s:'wall'},poster2:{n:'Retro Poster',p:20,w:.6,d:.04,h:.85,s:'wall'},neon:{n:'Neon Leaf Sign',p:120,w:.9,d:.06,h:.6,s:'wall'},clock:{n:'Wall Clock',p:25,w:.4,d:.05,h:.4,s:'wall'},shelfw:{n:'Floating Shelf',p:30,w:1,d:.25,h:.3,s:'wall'},
 // v22 lighting: lt=[color,intensity,range]; out=1 may be placed outdoors anywhere on the lot
 pendant:{n:'Ceiling Pendant Light',p:65,w:.4,d:.4,h:.1,s:'floor',lt:['#ffd49a',3,6]},ledstrip:{n:'LED Light Strip',p:40,w:1.6,d:.08,h:.03,s:'floor',lt:['#b48cff',1.6,3.5]},floorlamp:{n:'Floor Lamp',p:85,w:.45,d:.45,h:1.7,s:'floor',solid:1,lt:['#ffd8a0',2.6,5.5]},
 sconce:{n:'Wall Sconce',p:45,w:.22,d:.16,h:.3,s:'wall',lt:['#ffcf8a',1.8,4]},fairy:{n:'String Fairy Lights',p:35,w:1.8,d:.05,h:.25,s:'wall',lt:['#ffe2a8',1.2,3.5]},flood:{n:'LED Floodlight',p:110,w:.4,d:.4,h:.6,s:'floor',out:1,lt:['#f2f6ff',6,14]},
 neonsign:{n:'Neon "OPEN" Sign',p:95,w:.8,d:.06,h:.4,s:'wall',lt:['#ff4fa8',1.4,3.5]},pathlt:{n:'Outdoor Path Light',p:25,w:.18,d:.18,h:.5,s:'floor',out:1,lt:['#ffd49a',1.2,3]},lantern:{n:'Camping Lantern',p:30,w:.22,d:.22,h:.38,s:'top',out:1,lt:['#ffb85a',1.6,4]},desklamp:{n:'Desk Lamp',p:40,w:.3,d:.3,h:.5,s:'top',lt:['#fff0dc',1.5,3]}};
DECOR.lamp.lt=['#ffcf8a',1.4,3];DECOR.neon.lt=['#7dff9a',1.2,3];
export const defDecor=()=>({paint:'cream',panel:'plank',floor:'oak',light:'warm',fix:'shade',own:[],items:[]});
// interior bounds the decor must fit in (room 1 / with the expansion)
export const FXB={kush:['relax','😌','Relaxed',60],haze:['speed','⚡','Speed boost',40],owl:['nv','🦉','Night vision',60],lemon:['jump','🍋','Jump boost',30],blue:['wobble','🌀','Glitch vision',45],og:['fog','👻','Ghostly fog',50]};const FXMAP={mint:'lemon',ember:'haze',aurora:'owl',phantom:'og',sol:'haze',void:'kush',cherry:'lemon',diesel:'og',gelato:'blue',skunk:'haze',frost:'owl',nebula:'kush'};
export function fxBase(s,d=0){if(FXB[s])return s;if(FXMAP[s])return FXMAP[s];const p=STRAINS[s]?.par;if(p&&d<4)return fxBase(p[0],d+1);const k=Object.keys(FXB);let h=0;for(const ch of String(s))h=h*31+ch.charCodeAt(0)|0;return k[Math.abs(h)%k.length]}
export const RACKN=10;export function rackSnap(B,x,z){const d=[[x-B.x0,B.x0+.06,z,Math.PI/2],[B.x1-x,B.x1-.06,z,-Math.PI/2],[z-B.z0,x,B.z0+.06,0],[B.z1-z,x,B.z1-.06,Math.PI]];const m=d.reduce((a,b)=>Math.abs(b[0])<Math.abs(a[0])?b:a);return m[2]===z&&m[3]!==0&&m[3]!==Math.PI?{x:m[1],z,ry:m[3]}:{x,z:m[2],ry:m[3]}}
export const ROOMB=r=>({x0:-4.1,x1:r>1?11:4.1,z0:-5,z1:5});
// v11: day length, surfaces, sleep, pre-rolls
export const DAYSEC=1800;// real seconds per in-game day (30 min)
export const MINPS=1440/DAYSEC;// in-game minutes per real second
export const START_CASH=1000;
export const SURFS={desk:{w:.8,d:1.5,h:.935,max:8},table:{w:1.1,d:.6,h:.78,max:8}};// local top size (x,z) + height
export const BIG=['dropbox','dumpster','seedrack','shelf','pallet','sink','table','bed','tcan','desk','dirtbag','trash','light','rack','water'];// can't sit on a table
export const ROLL=1.6,JOINT=6;// seconds to roll; $ per pre-roll on the spot (vs $4/g jar)
export const WAKE=7*60,canSleep=min=>min>=19*60||min<5*60;
// v12: shared catalog categories (laptop shop + Quick Bud phone app)
export const CATS={seeds:'Seeds',grow:'Grow Supplies',equip:'Equipment',furn:'Furniture',bulk:'Bulk Pallets',build:'Furniture & Construction'};
export function catOf(k){if(k.startsWith('b_'))return 'build';if(k.startsWith('seed_'))return 'seeds';if(k.startsWith('pal_'))return 'bulk';if(k.startsWith('pot_')||k=='gbed')return 'equip';const S=SHOP[k];if(S?.cat)return S.cat;if(['light','rack','scale','shelf','seedrack'].includes(k))return 'equip';if(['table','bed','tcan'].includes(k))return 'furn';return 'grow'}
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
// ---------- v18: Section 5 building & decorating (shared by client + server) ----------
export const BP={wall:{n:'Wall Panel',p:30,c:'w'},door:{n:'Door',p:60,c:'w'},window:{n:'Glass Window Wall',p:55,c:'w'},gdoor:{n:'Garage Door',p:120,c:'w'},floor:{n:'Floor Tile',p:20,c:'f'},roof:{n:'Flat Roof Panel',p:25,c:'r'},roofs:{n:'Pitched Roof Slope',p:35,c:'r'},roofr:{n:'Roof Ridge',p:35,c:'r'},rollup:{n:'Roll-Up Door',p:160,c:'w'},dcase:{n:'Glass Display Case',p:140,c:'x'},dcount:{n:'Sales Counter + Register',p:220,c:'x'},dshelf:{n:'Retail / Stock Shelf',p:80,c:'x'},dsign:{n:'Open/Closed Sign',p:60,c:'x'}};
// v20 dispensary: display/stock fixture capacity, price markups, staff
export const DCAP={dcase:6,dshelf:8},DMARK=[.8,1,1.25,1.5,2],STAFF={cashier:{n:'Cashier',wage:60},stocker:{n:'Stocker',wage:45}};
export const fairPrice=(s,q,STR,GR)=>{const b=(STR[s]?.ppg||10),G=GR.find(x=>q>=x[1])||GR[GR.length-1];return Math.round(b*G[2]*10)/10};
export const BMAT=[['wood','Wood','#b88250'],['brick','Brick','#b5563a'],['metal','Metal','#9aa3ab'],['glass','Glass','#cfefff'],['paint','White Paint','#f2efe8'],['paint','Sage Paint','#8fae8b'],['paint','Navy Paint','#2f4466'],['paint','Barn Red Paint','#9b2f2a'],['paint','Sunny Yellow Paint','#e8c547']];
export const PAINTP=5;
// prefab = list of [piece, tileX, tileZ, rot(0..3), mat] in a grid of 2m tiles; walls sit on tile edges
function boxPF(W,D,m,o={}){const L=[],rf=o.roof!==false;for(let i=0;i<W;i++)for(let j=0;j<D;j++){L.push(['floor',2*i,2*j,0,o.fm??0]);if(rf){const mid=(D-1)/2;L.push(D%2&&j==mid?['roofr',2*i,2*j,0,o.rm??o.roofM??m]:['roofs',2*i,2*j,j<mid?0:2,o.rm??o.roofM??m])}}
 for(let i=0;i<W;i++){const mid=i==(W-1>>1);if(!o.openBack)L.push([o.backWin&&mid?'window':'wall',2*i,-1,0,m]);L.push([mid?(o.front||'door'):(o.win&&i!=mid?'window':'wall'),2*i,2*D-1,0,m])}
 for(let j=0;j<D;j++){const w=o.win&&j==(D-1>>1)?'window':'wall';L.push([w,-1,2*j,1,m]);L.push([w,2*W-1,2*j,1,m])}return L}
function dispPF(){const L=boxPF(6,5,1,{front:'door',win:1,fm:0,rm:2});for(let i=0;i<6;i++)L.push([i==2?'rollup':'wall',2*i,3,0,4]);
 L.push(['dcase',0,5,3,0],['dcase',0,7,3,0],['dcase',4,6,0,0],['dcount',8,5,0,0],['dshelf',10,7,1,0],['dsign',8,8,0,0],['dshelf',0,0,0,0],['dshelf',2,0,0,0],['dshelf',8,0,0,0],['dshelf',10,0,0,0]);return L}
export const BPF={room:{n:'Room Kit (4×4m)',p:420,L:()=>boxPF(2,2,0,{win:1})},greenhouse:{n:'Greenhouse Kit (6×4m)',p:560,L:()=>boxPF(3,2,3,{rm:3,fm:2,front:'door'})},garage:{n:'Garage Kit (6×6m)',p:780,L:()=>boxPF(3,3,2,{front:'gdoor',win:1,fm:2})},shed:{n:'Storage Shed Kit (2×4m)',p:220,L:()=>boxPF(1,2,0,{front:'door'})},disp:{n:'Dispensary (12×10m, stock room + sales floor)',p:2400,L:()=>dispPF()},ext:{n:'Room Extension (4×4m, open back)',p:300,L:()=>boxPF(2,2,0,{openBack:1,win:1})}};
export const bSlot=(k,x,z,r,y=0)=>BP[k].c+':'+x+','+z+(BP[k].c=='w'?':'+(r&1):'');
// expand a placement (piece or prefab) to absolute pieces; origin snapped to even tile centers
export function bExpand(k,x,z,r){r=((r|0)%4+4)%4;if(BP[k])return [{k,x,z,r}];const P=BPF[k];if(!P)return [];const c=[1,0,-1,0][r],s=[0,1,0,-1][r];
 return P.L().map(([pk,tx,tz,pr,m])=>({k:pk,x:x+tx*c-tz*s,z:z+tx*s+tz*c,r:(pr+r)%4,m}))}
export const bAllowed=(x,z)=>Math.abs(x)<43&&z>-43&&z<12.2;

export const onBFloor=(B,x,z)=>(B||[]).some(p=>p.k=='floor'&&Math.abs(p.x-x)<=1.05&&Math.abs(p.z-z)<=1.05);
// v1.9.1: starter shed / extension / greenhouse as editable build pieces (same grid as player kits)
// Core footprints match the old shell (±4×±5 shed, GH west). Front door centered on the path (x≈0).
function stripFront(L,tz){for(let i=L.length-1;i>=0;i--){const p=L[i];if(p[2]===tz&&(p[0]==='wall'||p[0]==='door'||p[0]==='window'||p[0]==='gdoor'))L.splice(i,1)}return L}
function shedPF(){const L=boxPF(4,5,0,{win:1,front:'wall',fm:0,rm:0});stripFront(L,9);
 // Front z=5: solid sides + centered door at x=0 (odd tile ok for doorway)
 L.push(['wall',0,9,0,0],['door',3,9,0,0],['wall',6,9,0,0]);return L}
function extPF(){const L=boxPF(4,5,0,{openBack:1,win:1,front:'wall',fm:0,rm:0});stripFront(L,9);
 L.push(['wall',0,9,0,0],['door',3,9,0,0],['wall',6,9,0,0]);return L}
function ghPF(){const L=boxPF(3,3,3,{rm:3,fm:2,front:'wall',win:1});stripFront(L,5);
 // GH ox=-10 → door at x=-7 (mid of 6m bay): tiles 0,2,4 → center door on tx=2
 L.push(['wall',0,5,0,3],['door',2,5,0,3],['wall',4,5,0,3]);return L}
export function coreLayouts(){return{
 shed:{ox:-3,oz:-4,L:shedPF,gk:'coreshed'},
 ext:{ox:5,oz:-4,L:extPF,gk:'coreext'},
 gh:{ox:-10,oz:-2,L:ghPF,gk:'coregh'}
}}
const CORE_V=2;
function pushCore(w,key){const C=coreLayouts()[key],B=w.build??=([]),used=new Set(B.map(p=>bSlot(p.k,p.x,p.z,p.r))),gid=w.nid++,L=C.L();
 for(const [pk,tx,tz,pr,m] of L){const x=C.ox+tx,z=C.oz+tz,r=pr|0;if(used.has(bSlot(pk,x,z,r)))continue;
  const open=pk==='door'||pk==='gdoor'||pk==='rollup'?1:0;
  B.push({id:w.nid++,k:pk,x,z,r,m:m||0,o:open,g:gid,gk:C.gk});used.add(bSlot(pk,x,z,r))}return gid}
function openShedToExt(w){const B=w.build||[];w.build=B.filter(p=>{if(p.gk!=='coreshed'||BP[p.k]?.c!=='w')return true;return !(p.x===4&&(p.r&1))})}
function rebuildCores(w){const keep=(w.build||[]).filter(p=>!p.gk||(p.gk!=='coreshed'&&p.gk!=='coreext'&&p.gk!=='coregh'));
 w.build=keep;pushCore(w,'shed');if((w.room|0)>1){pushCore(w,'ext');openShedToExt(w)}pushCore(w,'gh');w._coreV=CORE_V}
/** Migrate / seed editable shed+GH pieces. Idempotent. Keeps ents/plants/player décor. */
export function seedCoreBuild(w){if(!w)return;w.build??=[];w.nid??=1;w.bstock??={};
 if((w._coreV|0)<CORE_V)rebuildCores(w);
 else{const has=gk=>(w.build||[]).some(p=>p.gk===gk);
  if(!has('coreshed'))pushCore(w,'shed');
  if((w.room|0)>1){if(!has('coreext')){pushCore(w,'ext');openShedToExt(w)}else openShedToExt(w)}
  if(!has('coregh'))pushCore(w,'gh');
  // ensure core exterior doors stay walkable (open) after older saves
  for(const p of w.build)if(p.gk&&(p.k==='door'||p.k==='gdoor')&&p.o==null)p.o=1}
 w.shedB=1}
export function seedExtBuild(w){if((w.room|0)<2)w.room=2;if((w._coreV|0)<CORE_V){rebuildCores(w);w.shedB=1;return}
 if(!(w.build||[]).some(p=>p.gk==='coreext'))pushCore(w,'ext');openShedToExt(w);w.shedB=1}

// shop listings for construction stock (bought items go to your build inventory, saved with the farm)
for(const [k,v] of Object.entries(BP))SHOP['b_'+k]=v.c=='x'?{n:v.n,p:v.p,cat:'build',d:'Dispensary fixture — delivered in a crate to the delivery pad. Pick it up, then press B (D-pad ▲ on controller) to unpack it into Build mode and place it.'}:{n:v.n,p:v.p,cat:'build',bld:1,d:'Construction stock — goes to your Build inventory. Press B (D-pad ▲ on controller) to enter Build mode and place it.'};
for(const [k,v] of Object.entries(BPF))SHOP['b_'+k]={n:v.n,p:v.p,cat:'build',bld:1,d:'Prefab building kit — walls, door, floor and roof snap together in one placement. Goes to your Build inventory; place it in Build mode (B / D-pad ▲).'};
// v22: wall paint / panels / floors / light color / fixtures — formerly the laptop Decorate tab; buying applies it to your shed (owned styles re-apply free)
const STN={paint:'Shed Paint',panel:'Shed Wall Panels',floor:'Shed Flooring',light:'Shed Light Color',fix:'Shed Light Fixture'};
for(const [c,O] of Object.entries(STYLE))for(const [v,o] of Object.entries(O))if(o.p)SHOP['b_s_'+c+'_'+v]={n:STN[c]+': '+o.n,p:o.p,cat:'build',style:[c,v],d:'Shed style — applied to your grow shed right away. Already own it? Buying again re-applies it for free.'};
for(const [k,v] of Object.entries(DECOR))SHOP['b_f_'+k]={n:v.n,p:v.p,cat:'build',bld:1,d:'Furniture — goes to your Build inventory. Place it in Build mode (B / D-pad ▲) inside your shed or on any floor you have built.'};
