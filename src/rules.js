export const STRAINS={kush:{name:'Silent Kush',speed:.85,g:14,ppg:14},haze:{name:'Pixel Haze',speed:1.15,g:10,ppg:10},owl:{name:'Night Owl',speed:1,g:12,ppg:12}};
export const SHOP={soil:{n:'Soil Bag',p:20,uses:4},pot:{n:'Pot',p:10},seed_haze:{n:'Pixel Haze Seeds',p:15,uses:3},seed_owl:{n:'Night Owl Seeds',p:20,uses:3},seed_kush:{n:'Silent Kush Seeds',p:30,uses:3},
 water:{n:'Watering Can',p:5,uses:12},nutr:{n:'Nutrients',p:15,uses:8},light:{n:'Grow Light',p:60},rack:{n:'Drying Rack',p:40},jars:{n:'Jar Box',p:12,uses:10},scale:{n:'Scale',p:35},gbag:{n:'Garbage Bags',p:4,uses:5}};
export const WILT0=20,WILT1=60,DIE=75;// seconds at 0% moisture: wilting starts, fully wilted, dead
export const POUR=5;
export const READY=480,DRY=60;
export function stage(p){if(!p)return '';if(p.dead)return 'dead';const a=p.age;return a<60?'seedling':a<200?'veg':a<READY?'flower':'ready'}
