// Section 3 C–F shared rules: drying room, curing, packaging, storage, labels, quality categories, rosin, equipment tiers.
import {SHOP,prodQ,grade} from './rules.js';
export const LVX=[0,100,400,900,1600,2500,3600,5000];
export const lvl=w=>{const e=w?.earned||0;let l=1;while(l<LVX.length&&e>=LVX[l])l++;return l};
export const lvNext=w=>LVX[lvl(w)]??null;
// quality categories (shown everywhere; price multiplier)
export const QCAT=q=>q>=85?['Top Shelf','#ffd23f',1.35]:q>=68?['Mid','#7fd0ff',1]:['Budget','#c8a070',.75];
export const qcat=(type,d)=>type==='trim'||d?.src==='trim'&&type!=='conc'?['Trim','#9fbf6a',.5]:QCAT(prodQ(d||{}));
// containers that hold product (put with product in hand, take with empty hands)
export const STORE={sbin:{n:12,cure:0},stash:{n:24,cure:0},ccab:{n:8,cure:1.6,only:['packed']}};
export const PRODUCT=['packed','pkg','conc','joints','drybud','trim'];
export const PACKT={bud:[3.5,7,14,28],conc:[.5,1,2]};
export const BURP=45; // seconds between burps for glass jars
// equipment (shop entries; lv = player level needed). Tier chains shown in the shop.
export const TIERS=[['Trimming','shears','trimmer'],['Scale','scale','dscale'],['Drying air','fan','dehum'],['Sealer','hseal','vseal'],['Labels','hlabel','lprint'],['Rosin press','press','hpress']];
Object.assign(SHOP,{
 fan:{n:'Clip Fan',p:30,cat:'equip',d:'Moves air across a drying rack within 3 m: dries 30% faster and stops mold.'},
 dehum:{n:'Dehumidifier',p:140,lv:3,cat:'equip',d:'Pulls a drying room down to the ideal 55–62% humidity (within 4 m): +quality, faster drying.'},
 grove:{n:'Grove Bags ×10',p:18,uses:10,cat:'equip',d:'Humidity-controlled curing bags. No burping needed, +2 quality when fully cured.'},
 ccab:{n:'Curing Cabinet',p:220,lv:4,cat:'equip',d:'Holds 8 jars/bags, cures 60% faster and burps jars automatically.'},
 sbin:{n:'Storage Bin',p:30,cat:'furn',d:'Plastic tote that holds 12 products. Contents stay sealed.'},
 stash:{n:'Stash Cabinet',p:160,lv:2,cat:'furn',d:'Locking cabinet that holds 24 products.'},
 mylar:{n:'Mylar Bags ×10',p:10,uses:10,cat:'equip',d:'Retail bags for the packaging minigame at the scale. Works with dried bud or cured jars.'},
 oilres:{n:'Oil Reservoir',p:120,lv:2,cat:'equip',d:'Collector that pools every gram of rosin pressed within 3 m (keeps the fractions). Set it on a table next to the press.'},
 oilfill:{n:'Oil Filling Machine',p:280,lv:3,cat:'equip',d:'Dispenses 1g rosin jars from a nearby Oil Reservoir (needs Concentrate Jars within 3 m). Use for 1 jar, Shift+use fills a batch of 10.'},
 cjars:{n:'Concentrate Jars ×10',p:12,uses:10,cat:'equip',d:'1-gram glass concentrate jars with lids. Place next to the press or scale and use it while holding rosin to fill them.'},
 hseal:{n:'Hand Sealer',p:0,hide:1,d:'Built into every Mylar box — time the heat bar.'},hlabel:{n:'Hand Labels',p:0,hide:1,d:'Handwritten sticker labels.'},
 dscale:{n:'Digital Scale',p:90,lv:2,ent:'scale',dat:{dg:1},cat:'equip',d:'0.1 g precision: steadier pouring in the packaging minigame (+5% accuracy).'},
 vseal:{n:'Vacuum Sealer',p:150,lv:3,cat:'equip',d:'Perfect seals every time; vacuum-sealed packs sell for +10%.'},
 lprint:{n:'Label Printer',p:110,lv:2,cat:'equip',d:'Prints clean labels automatically; printed packs sell for +5%.'},
 trimmer:{n:'Trim Machine',p:260,lv:4,cat:'equip',d:'Bowl trimmer: every trim counts as full speed.'},
 radio:{n:'Boombox Radio',p:45,cat:'furn',d:'Portable radio with 5 generated music stations. E/A on/off, R/RT next station, [ ]/◀▶ volume.'},
 press:{n:'Hand Rosin Press',p:80,cat:'equip',d:'Press dried bud (~20%) or trim (~10%) into rosin concentrate. Fill 1g Concentrate Jars at the press or scale.'},
 hpress:{n:'Hydraulic Press',p:350,lv:5,ent:'press',dat:{hy:1},cat:'equip',d:'Hydraulic rosin press: +5% yield and +5 quality.'},
 conc:{n:'Rosin',p:0,hide:1},pkg:{n:'Retail Pack',p:0,hide:1}});
SHOP.scale.n='Pocket Scale';
export const locked=(k,w)=>(SHOP[k]?.lv||1)>lvl(w);
export const pkgVal=d=>{const q=prodQ(d),G=grade(q),C=QCAT(q);return Math.round(d.g*(d.n||1)*(d.cc?18:4)*G[2]*C[2]*1.15*(d.vac?1.1:1)*(d.lb==2?1.05:1))};
// drying room environment for a rack: humidity %, temperature °C, speed and quality bonus
export function dryEnv(ents,e){const near=(t,r)=>ents.some(o=>o.type===t&&!o.by&&Math.hypot(o.x-e.x,o.z-e.z)<r);const f=near('fan',3),dh=near('dehum',4),L=ents.filter(o=>o.type==='light'&&!o.by&&Math.hypot(o.x-e.x,o.z-e.z)<2.5).length;
 const P=ents.filter(o=>o.type==='pot'&&o.data?.plant&&!o.by&&Math.hypot(o.x-e.x,o.z-e.z)<3).length,h=64+Math.min(8,P*2)-(dh?9:0)-(f?2:0),T=21+L*3-(f?1:0)+(dh?1:0),sp=+((f?1.3:1)*(dh?1.15:1)*(h>65?.85:1)).toFixed(2),dq=(h>=55&&h<=62?2:0)+(h>65?(f?-1:-3):0)+(T>26?-2:0)+(dh?1:0);return{h,T,f:+f,dh:+dh,sp,dq}}
