// v1.7.0 Business sim: shared constants (server + client). No DOM here.
export const SHAPES=['Circle','Shield','Hexagon','Square','Badge','Diamond'];
export const ICONS=['🌿','🍃','🔥','⭐','👑','💎','🌙','☘️','🌈','🌵','🍯','⚡'];
export const COLS=['#1d6b3a','#3dff7a','#f0cf4a','#ff4fa8','#4a8ad0','#7a2fd0','#e8862e','#d33a3a','#ffffff','#1a1a1a','#2ad4c8','#9b6b3a'];
export const AWN=['None','Striped','Solid','Scalloped'];
export const LTS=['Off','Warm Bulbs','Neon Glow','Rainbow'];
export const NW1=['Green','Golden','Purple','Lucky','Happy','Mellow','Cosmic','Wild','Royal','Sunny','Misty','Velvet','High','Dank','Chill','Emerald'];
export const NW2=['Leaf','Bud Co.','Dispensary','Garden','Collective','Apothecary','Farms','Lounge','Corner','Grove','Cannabis Co.','Supply','Haze','Kush House','Market','Club'];
export const SKILL=[{n:'Rookie',m:.8,f:.75},{n:'Skilled',m:1,f:1},{n:'Expert',m:1.4,f:1.35}];
export const STAFFT={cashier:{n:'Cashier',wage:60,d:'Runs the register so customers can pay without you.'},stocker:{n:'Floor Stocker',wage:45,d:'Works inside the store: moves product from the stock room onto the floor and keeps it clean. (Getting jars from your farm to the store is the farm Shelf Stocker\'s job.)'},budtender:{n:'Budtender',wage:70,d:'Helps customers choose — more sales and happier customers.'}};
export const UPG={floor:{n:'Bigger Sales Floor',c:[600,1500],d:'+2 customers inside at once per level'},reg:{n:'Extra Register',c:[450],d:'Checkout twice as fast'},sec:{n:'Security System',c:[500],d:'Cameras + guard: stops shoplifting'},sig:{n:'Premium Signage',c:[300,900],d:'+20% foot traffic per level'}};
export const LOCS=[{id:'home',n:'Main Store (your lot)',cost:0,rent:40},{id:'downtown',n:'Downtown Storefront',cost:6000,rent:150,tr:1.3},{id:'beach',n:'Beach Boardwalk',cost:9000,rent:220,tr:1.6},{id:'mall',n:'Westfield Mall Kiosk',cost:12000,rent:300,tr:2}];
export const MARK=[.8,1,1.25,1.5,2];
export const UTIL=25,CLEAN_FEE=20,MAXREV=40,MAXHIST=14,BRANCH_CAP=40;
export const defBiz=()=>({name:'',opened:0,logo:{sh:0,ic:0,bg:0,fg:2,tx:''},front:{sc:0,ac:2,aw:1,lt:1},prices:{},upg:{},rep:2.5,sat:[],clean:100,hist:[],today:{rev:0,sales:0,lost:0},reviews:[],locs:[],cur:0});
export const pkey=it=>(it.t||it.type)+':'+((it.d||it.data)?.s||'');
const RV={5:['Best dispensary in town!','Amazing selection and super friendly staff.','Fair prices and top shelf bud. 10/10.','Clean store, great vibes, will be back!'],4:['Really good experience overall.','Nice store, quick checkout.','Good product, a little pricey.','Solid shop, friendly budtender.'],3:['It was okay.','Decent but the wait was long.','Average prices, average selection.','Fine, nothing special.'],2:['Prices are way too high.','Waited forever at the register.','Shelves were half empty.','Store could be cleaner.'],1:['Terrible. Nothing in stock.','Nobody at the register, I left.','Overpriced and dirty.','Never coming back.']};
export function reviewText(st,why,r){const L=RV[st];let t=L[Math.floor(r*L.length)%L.length];if(st<=2&&why)t=why;return t}
export function stars(r){const n=Math.round(r*2)/2;return '★'.repeat(Math.floor(n))+(n%1?'½':'')+'☆'.repeat(5-Math.ceil(n))}
// v1.7.3 farm AI workers (hired from the laptop's 👷 Workers tab). Wage is per in-game day, scaled by SKILL[sk].m; speed by SKILL[sk].f.
export const WORKT={grower:{n:'Grower',e:'🌱',wage:55,d:'Fills empty pots with soil, plants seeds from the floor or seed rack, refills the can at the sink and waters thirsty plants. Clears spent soil.'},trimmer:{n:'Harvester / Trimmer',e:'✂',wage:65,d:'Harvests ripe plants, hangs them on drying racks, hand-trims the dried bud, then weighs and jars it at the scale.'},fstock:{n:'Shelf Stocker',e:'📦',wage:50,d:'Walks packed jars and pre-rolls from your farm (floor and storage shelves) to the dispensary display cases and shelves. Works alongside the in-store Floor Stocker.'}};
export const WORK_MAX=2,WORK_HOURS=[6,22];
