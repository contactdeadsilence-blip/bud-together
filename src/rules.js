export const STRAINS={kush:{name:'Silent Kush',speed:.85,g:14,ppg:14},haze:{name:'Pixel Haze',speed:1.15,g:10,ppg:10},owl:{name:'Night Owl',speed:1,g:12,ppg:12}};
export const SHOP={soil:{n:'Soil Bag',p:20,uses:4},pot:{n:'Pot',p:10},seed_haze:{n:'Pixel Haze Seeds',p:15,uses:3},seed_owl:{n:'Night Owl Seeds',p:20,uses:3},seed_kush:{n:'Silent Kush Seeds',p:30,uses:3},
 water:{n:'Watering Can',p:0,hide:1},shelf:{n:'Storage Shelf',p:45},nutr:{n:'Nutrients',p:15,uses:8},light:{n:'Grow Light',p:60},rack:{n:'Drying Rack',p:40},jars:{n:'Jar Box',p:12,uses:10},scale:{n:'Scale',p:35},gbag:{n:'Garbage Bags',p:4,uses:5},
 pal_soil:{n:'Pallet · 8 Soil Bags',p:136,pal:'soil',k:8},pal_nutr:{n:'Pallet · 6 Nutrients',p:72,pal:'nutr',k:6},pal_pot:{n:'Pallet · 10 Pots',p:80,pal:'pot',k:10},pal_jars:{n:'Pallet · 6 Jar Boxes',p:61,pal:'jars',k:6}};
// shelves / sink / utilities
export const SLOTS=6,CAN=100,FILL=10,GAL=2;// shelf slots; can capacity %; % per fill tick; gallons per full can
export const RATE={water:.5,kwh:.15,base:2,light:.6};// $/gallon, $/kWh, $/day base, kW per placed grow light

export const WILT0=120,WILT1=300,DIE=480;// seconds at 0% moisture: wilting starts, fully wilted, dead (8 min grace)
export const DRAIN=600,DRAIN_EMPTY=900,NUTR=600,THIRSTY=25,HFLOOR=30;// s for full->empty soil with a live plant / without; nutrient run-out; thirsty warning %; light/food can't push health below this
export const POUR=5;
export const READY=480,DRY=60;
export function stage(p){if(!p)return '';if(p.dead)return 'dead';const a=p.age;return a<60?'seedling':a<200?'veg':a<READY?'flower':'ready'}
