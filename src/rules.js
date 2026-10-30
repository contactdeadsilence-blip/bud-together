export const STRAINS={kush:{name:'Silent Kush',speed:.85,g:14,ppg:14},haze:{name:'Pixel Haze',speed:1.15,g:10,ppg:10},owl:{name:'Night Owl',speed:1,g:12,ppg:12}};
export const SHOP={soil:{n:'Soil Bag',p:20,uses:4},pot:{n:'Pot',p:10},seed_haze:{n:'Pixel Haze Seeds',p:15,uses:3},seed_owl:{n:'Night Owl Seeds',p:20,uses:3},seed_kush:{n:'Silent Kush Seeds',p:30,uses:3},
 water:{n:'Watering Can',p:0,hide:1},shelf:{n:'Storage Shelf',p:45},nutr:{n:'Nutrients',p:15,uses:8},light:{n:'Grow Light',p:60},rack:{n:'Drying Rack',p:40},jars:{n:'Jar Box',p:12,uses:10},scale:{n:'Scale',p:35},gbag:{n:'Garbage Bags',p:4,uses:5},papers:{n:'Rolling Papers',p:6,uses:10},table:{n:'Work Table',p:60},bed:{n:'Bed',p:150},tcan:{n:'Trash Can',p:20},
 pal_soil:{n:'Pallet · 8 Soil Bags',p:136,pal:'soil',k:8},pal_nutr:{n:'Pallet · 6 Nutrients',p:72,pal:'nutr',k:6},pal_pot:{n:'Pallet · 10 Pots',p:80,pal:'pot',k:10},pal_jars:{n:'Pallet · 6 Jar Boxes',p:61,pal:'jars',k:6}};
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
export const ROOMB=r=>({x0:-4.1,x1:r>1?11:4.1,z0:-5,z1:5});
// v11: day length, surfaces, sleep, pre-rolls
export const DAYSEC=720;// real seconds per in-game day (12 min)
export const MINPS=1440/DAYSEC;// in-game minutes per real second
export const START_CASH=1000;
export const SURFS={desk:{w:.8,d:1.5,h:.935,max:8},table:{w:1.1,d:.6,h:.78,max:8}};// local top size (x,z) + height
export const BIG=['shelf','pallet','sink','table','bed','tcan','desk','dirtbag','trash','light','rack','water'];// can't sit on a table
export const ROLL=1.6,JOINT=6;// seconds to roll; $ per pre-roll on the spot (vs $4/g jar)
export const WAKE=7*60,canSleep=min=>min>=19*60||min<5*60;
