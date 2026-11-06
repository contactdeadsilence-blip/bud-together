// Player-facing patch notes. Newest first. Bump CURRENT_VERSION when adding an entry.
export const CHANGELOG=[
{v:'1.9.2',date:'Nov 6, 2026',title:'Beta v1.9.2 — Lighting, Fullscreen & Currency Shop',notes:['Interior fill lighting after the editable shed/greenhouse conversion — warmer indoors, stronger shed lamps, gentler exposure so rooms are not muddy or blown-out','Settings → Fullscreen toggle (Fullscreen API, controller-friendly, preference saved)','💎 Currency Shop (Stripe TEST mode only): buy Starter / Grower / Tycoon cash packs; server-side Checkout + webhook/claim credits your save once (needs sk_test keys on the server)','Bug/quality: shop refuse live Stripe keys; pack amounts only from server table']},
{v:'1.9.1',date:'Nov 6, 2026',title:'Beta v1.9.1 — Editable Shed, Extension & Greenhouse',notes:['Starter shed, purchased grow-room extension, and greenhouse are now real build pieces (walls, floors, roofs, doors, windows) — remove, move, replace or add pieces in Build mode like any kit you place','Old saves convert cleanly: plants, gear and furniture stay put; collision, indoor ambience and worker nav use the new pieces','Expand Shed still costs $500 / 5★ and now drops editable extension pieces with the shared wall opened']},
{v:'1.9.0',date:'Nov 6, 2026',title:'Beta v1.9.0 — New Strains, Crossbreeding & Clear Nutrients',notes:['New shop strains: Cherry Codec (fast), Diesel Bit (big yield), Neon Gelato (potent), Crypto Skunk (easy) — plus Frost Protocol in Mystery Packs','Crossbreed with the Pollen Brush: collect pollen from one flowering plant, brush another strain, harvest for bred seeds (traits inherit; cherry×diesel unlocks hidden Nebula Kush)','Name your crosses in the Genetics laptop tab; bred strains sell, save, and show in UI','Nutrient bottles are color-coded: green Grow (N), purple Bloom (P-K), amber Balanced — labels match in world, inventory and shop']},
{v:'1.8.7',date:'Nov 1, 2026',title:'Beta v1.8.7 — More Realistic Forest',notes:['Outdoor trees, bushes, rocks and grass swapped for textured, more natural-looking models (still instanced, no extra shadows)','You still bump into tree trunks and big rocks','Credit: Stylized Nature MegaKit by Quaternius (CC0) — replaces the KayKit set']},
{v:'1.8.6',date:'Nov 1, 2026',title:'Beta v1.8.6 — Forest Outdoors',notes:['Low-poly trees, bushes, rocks and grass clumps now surround the farm outside the build area (instanced, no extra shadows)','You bump into tree trunks and big rocks','Credit: KayKit Forest Nature Pack by Kay Lousberg (CC0) — kaylousberg.itch.io/kaykit-forest']},
{v:'1.8.5',date:'Nov 1, 2026',title:'Beta v1.8.5 — Oil Reservoir, Filling Machine & Extractor',notes:['New Oil Reservoir pools every gram of rosin pressed nearby (fractions kept) and shows the pooled grams','New Oil Filling Machine dispenses 1g rosin jars from the pool — Shift+use fills a batch of 10','New Extractor worker collects trimmings, presses them into oil, fills jars and packs them into Storage Bins','Shelf Stockers now take product out of Storage Bins and Stash Cabinets','Trimmers merge trim into one pile instead of hundreds']},
{v:'1.8.4',date:'Nov 1, 2026',title:'Beta v1.8.4 — Real Sounds & Outdoor Ambience',notes:['Real recorded sounds for trimming, setting down glass jars and the rosin press','Looping outdoor birdsong ambience: full outside, softer and muffled indoors, with smooth fades','Sounds load in the background after you first interact (about 0.7MB total), so startup stays fast','Follows your volume setting']},
{v:'1.8.3',date:'Nov 1, 2026',title:'Beta v1.8.3 — Bigger Storage & New Sounds',notes:['Shelves now hold 12 items (4 per level, including the bottom level) and drying racks hang 8 buds on two lines','Workers use the new shelf and rack capacity','New sounds: rosin press hiss and sizzle, glass jar clink on shelves, scale beeps, Mylar and grove bag crinkle, label printer, vacuum sealer, hanging and taking bud off the rack, and trimming','All sounds follow your volume setting']},
{v:'1.8.2',date:'Nov 1, 2026',title:'Beta v1.8.2 — Controller Polish',notes:['Controller focus no longer lands on a hidden field behind the character creator']},
{v:'1.8.1',date:'Nov 1, 2026',title:'Beta v1.8.1 — New Main Menu, Collision & Smarter Workers',notes:[
'🌿 New main menu: a live 3D grow room with swaying plants, drifting light and a slow camera, behind clean dark-glass buttons (cheap to render and paused once you play).',
'🧱 You now bump into placed furniture, shelves, tables, pots, racks and equipment instead of walking through them (you can never get trapped inside one).',
'🧭 AI workers path around walls and objects instead of walking through them.',
'🐛 Fixed a crash in build mode when previewing some pieces.',
]},
{v:'1.8.0',date:'Oct 31, 2026',title:'Beta v1.8.0 — Profiles, Leaderboard & Lobbies',notes:[
'👤 Public profiles: display name, avatar preview, bio and join date. View anyone from the room screen, Pause → 👥 Players, the leaderboard, or by looking at them and pressing A / E.',
'📊 Lifetime stats saved on the server: plants grown, grams harvested, jars sold, money earned, playtime, dispensary revenue, best reputation and businesses owned.',
'🏆 Leaderboard: top 25 for every stat, from the main menu.',
'🌐 Public & private games: hosts choose who can find them. Browse Games shows the host, players, day and ping, with Join, Refresh and Quick Join. Private games still use the room code.',
'👥 One Staff tab on the laptop for everyone you employ: farm AI workers, and dispensary staff for each location. It shows every employee, their wage and your total daily payroll, with hire and fire buttons that all work on the controller. The old Business → Staff page and the hire/fire shortcuts on the register are gone (pressing A at the register now opens the Staff tab). Existing hires carry over from your save.',
'🧾 Workers now buy their own supplies. When they run out of seeds, soil, nutrients or jar boxes, they order more at shop prices with farm money, always keeping a day of wages in reserve. They then walk to the delivery pad, collect the order and use it. Every purchase is logged in the Staff tab.',
'🧪 Growers now feed nutrients to hungry plants as well as watering them.',
'📦 The dispensary Stocker is now called the Floor Stocker (works inside the store). The farm Shelf Stocker is the one who carries jars from your farm to the store.',
'🎮 Everything works with an Xbox controller. Rate limits and input checks keep things fair.']},
{v:'1.7.6',date:'Oct 31, 2026',title:'Beta v1.7.6 — Performance Hotfix',notes:[
'Big farms run much smoother: about half as many draw calls and triangles per frame on a busy 70-item save.',
'Props now share geometry and materials, and each item\'s static parts are merged, so tables with jars and bags are much cheaper to draw.',
'Fixed a memory leak: plants and other items that update leaked GPU memory every time they changed. Plants also redraw less often.',
'Lamp and grow-light shadows are now limited to the High and Ultra presets (the ceiling lamp\'s 6-sided shadow is Ultra only). Lights that are off no longer cost anything.',
'Tip: Settings → Graphics has Low/Medium/High/Ultra presets and a Render Scale down to 50% if your game still feels slow.']},
{v:'1.7.5',date:'Oct 31, 2026',title:'Beta v1.7.5 — Packaging Hotfix',notes:[
'Fixed: the Scale, Rosin Press, Vacuum Sealer, Label Printer and bag boxes now work when they sit on a Work Table or desk, not only on the floor.',
'Fixed: packing into Mylar Bags at the scale works again, including straight from dried bud.',
'Fixed: pressing rosin on the press works again.',
'New: Concentrate Jars ×10 ($12). After pressing, hold the rosin at the Scale or Press with the box nearby to fill detailed 1g glass jars with a label and amber rosin inside. You can sell them, deliver them to contracts and stock them in your dispensary.',
'New: Grove Bags now have their own bag model and label instead of a jar.',
'New: a packed Mylar Bag now looks like a filled, heat-sealed pouch with a label. Vacuum-sealed bags look tighter.',
'Fixed: the Label Printer now prints a barcode label onto packed product you hold. The Vacuum Sealer now seals the Mylar or Grove bag you hold.',
'Fixed: the Harvester takes dry buds off full drying racks before harvesting more. It no longer gets stuck when every rack is full. It then trims and packs the buds into Jars, Grove Bags or Mylar Bags, whichever is available.']},
{v:'1.7.4',date:'Oct 31, 2026',title:'Beta v1.7.4 — Hotfix',notes:[
'Fixed: items in your shed (seed rack, furniture and more) could disappear after reloading a save. It happened after a Shelf Stocker took the last item from a shelf. Saves that were affected now load correctly.',
'Fixed lag when AI workers are on the farm. Workers no longer cause constant autosaves, name tags are no longer rebuilt every few seconds, and far-away characters animate more cheaply.',
'Fixed: workers walked backwards. They now face the way they walk.']},
{v:'1.7.3',date:'Oct 31, 2026',title:'Beta v1.7.3 — AI Farm Workers',notes:[
'New 👷 Workers tab on the laptop. Hire a Grower, a Harvester / Trimmer or a Shelf Stocker (Rookie, Skilled or Expert), up to 2 of each. It works fully with the controller.',
'Workers walk around your farm and do the chores themselves, from 6:00 to 22:00. Each one has a name tag that shows what they are doing.',
'Grower: fills empty pots with soil, plants seeds from the floor or the seed rack, refills their own can at the sink and waters thirsty plants. Also clears spent soil.',
'Harvester / Trimmer: harvests ripe plants, hangs them on drying racks, hand-trims the dried bud, then weighs and jars it at the scale (needs a Jar Box). Jars go on a storage shelf.',
'Shelf Stocker: carries packed jars and pre-rolls from the floor and storage shelves to your dispensary display cases and retail shelves.',
'The first day is paid when you hire. After that, wages come out each morning. A worker you cannot pay quits. Workers and what they carry are saved with your farm and synced in co-op. They never grab anything a player is holding.']},
{v:'1.7.2',date:'Oct 31, 2026',title:'Beta v1.7.2 — Fixes',notes:[
'Grass and flowers no longer poke through built floors. They are hidden under any floor or building you place and come back if you remove it.',
'Display cases, sales counters, retail shelves and Open/Closed signs bought from the shop now arrive in a crate on the delivery pad. Pick one up and press B (D-pad ▲ on controller) to unpack it into Build mode and place it.']},
{v:'1.7.1',date:'Oct 31, 2026',title:'Beta v1.7.1 — Storefront polish',notes:[
'Ground is now flat across the whole buildable lot, so buildings far from the house no longer get grass poking through the floor.',
'Trees are hidden where you build, so they no longer grow through your walls.',
'Storefront sign sits below the eave and faces the customer door; taller P&L chart.']},
{v:'1.7.0',date:'Oct 31, 2026',title:'Beta v1.7.0 — Dispensary Business',notes:[
'Run your own dispensary! Build the 🏪 Dispensary kit, then open Laptop → 🏪 Business to name your store and open for business.',
'Logo maker: shapes, icons, colors and text. Your logo and name appear on a lit sign above the storefront.',
'Storefront: sign color, accent color, awnings (striped, solid, scalloped) and lights (warm, neon, rainbow).',
'Stock display cases with your own jars and pre-rolls, set a price per product, and restock from the stock room.',
'Hire and fire Cashiers, Stockers and Budtenders at Rookie, Skilled or Expert level. Each one has a daily wage.',
'Upgrades: bigger sales floor, extra register, security system (stops shoplifting) and premium signage.',
'Daily Profit & Loss with a chart. Rent, wages and utilities are paid at midnight.',
'Customer satisfaction depends on price, wait, stock, cleanliness, decor and staff. It builds your reputation, which brings more customers.',
'Customers leave star reviews. Read them in the Reviews panel.',
'Expand to Downtown, the Beach Boardwalk and the Mall, ship stock to each branch and switch between locations.',
'Full controller support: LB/RB to reach the Business tab, D-pad and A for everything. Co-op partners share the same business.']},
{v:'1.6.1',date:'Oct 31, 2026',title:'Beta v1.6.1 — Controller Fix',notes:[
'Fixed: on your very first launch the character creator ignored the controller (D-pad, A, LB/RB) because the What\'s New popup opened behind it. What\'s New now waits until you finish creating your character.',
'Character creator controller input is smoother on slower PCs.']},
{v:'1.6.0',date:'Oct 31, 2026',title:'Beta v1.6.0 — Bug Fixes & Performance',notes:[
'Bud Together is now in Beta! New version numbers start at Beta v1.6.0.',
'Smoother frame rate: the HUD (money, clock, prompts, hands) only redraws when something actually changes instead of every frame.',
'Fixed a memory leak when aiming at furniture in decorate mode.',
'Outdoors: fixed dark square shadow patches on the hills around your lot (shadows now cover the whole area).',
'Test suite fixes.']},
{v:'0.22',date:'Oct 31, 2026',title:'Sell Builds & New Lights',notes:[
'Build mode: aim at any wall, floor, roof, door, window or furniture to Remove it (back to your Build inventory) or Sell it for half its price.',
'Prefab buildings can be sold piece by piece or all at once (hold Y on controller, or Ctrl+Shift+X and press again to confirm).',
'Keyboard: X / Delete removes, Shift+X sells. Controller: tap Y removes, hold Y sells. Mouse: click the buttons on the build bar.',
'10 new lights in budsupply.shop → Furniture & Construction: ceiling pendant, LED strip, floor lamp, wall sconce, fairy lights, floodlight, neon OPEN sign, outdoor path lights, lantern and desk lamp. They really light up the room — switch them on/off with L or the right stick click.',
'Floodlights, path lights and lanterns can be placed outdoors anywhere on your lot.',
'The laptop Decorate tab is gone: shed paint, wall panels, flooring, light colors and fixtures are now sold in the shop. Styles you already own stay owned and re-apply free.']},
{v:'0.21',date:'Oct 31, 2026',title:"What's New",notes:[
"New What's New screen: see what changed in every update from the main menu or pause menu.",
"The game version is now shown on the main menu."]},
{v:'0.20',date:'Oct 31, 2026',title:'Better Buildings & Roofs',notes:[
'Walls now have real siding, brick or metal textures with trim and baseboards.',
'Windows and doors get proper frames.',
'Every prefab building now comes with a pitched roof (the greenhouse gets a glass one).',
'The original shed was rebuilt with the same high-quality pieces. Your save layout is unchanged.']},
{v:'0.19.1',date:'Oct 31, 2026',title:'Boombox Radio',notes:[
'Buy a Boombox ($45, Furniture in the shop) and place it anywhere.',
'Turn it on with A / E, change station with RT / R, volume with the D-pad or [ ].',
'Five stations of in-game music that is safe to stream. Co-op players hear the same station.']},
{v:'0.19',date:'Oct 31, 2026',title:'Graphics Settings',notes:[
'New Graphics Quality menu under Settings: Low, Medium, High and Ultra presets.',
'Fine-tune anti-aliasing, shadows, render scale, texture filtering, view distance, bloom and more.',
'The game picks a good preset for your device the first time you play.']},
{v:'0.18.2',date:'Oct 31, 2026',title:'Scale & Trim Machine Fixes',notes:[
'Scales on tables and desks now work, so you can fill jar after jar.',
'Full jars are set down beside the scale instead of covering it.',
'The Trim Machine works properly, with clearer trimming prompts.']},
{v:'0.18',date:'Oct 31, 2026',title:'Build Mode & Construction Shop',notes:[
'Press B (or D-pad Up) to enter Build Mode with grid snapping and a ghost preview.',
'Place, rotate, move and delete walls, floors, roofs, doors, glass windows and garage doors.',
'Prefab rooms, greenhouses, garages and sheds, plus expanding your existing buildings.',
'Wood, brick, metal, glass and paint materials. New Furniture & Construction shop section.',
'Your buildable lot is bigger. Everything is saved and synced in co-op.']},
{v:'0.17.3',date:'Oct 31, 2026',title:'Harvest Fixes',notes:[
'You can pick up the curing cabinet and all harvesting equipment (contents are kept).',
'Deliver jars at the Drop Box with A / E. Burping jars moved to V.']},
{v:'0.17.2',date:'Oct 30, 2026',title:'Real Doors & Glass Windows',notes:[
'Front doors swing open on hinges, block you when closed, and remember their state.',
'The shed window is now see-through glass.']},
{v:'0.17.1',date:'Oct 30, 2026',title:'Drying, Curing & Packaging',notes:[
'Dry your harvest with fans and dehumidifiers.',
'Cure in jars, Grove Bags or a curing cabinet, and burp jars to keep quality up.',
'Storage bins and a stash for your product.',
'New packaging minigame with 3D labels and quality categories.',
'Rosin press for concentrates, with new concentrate contracts.',
'Better equipment tiers unlock as you level up.']},
{v:'0.17',date:'Oct 30, 2026',title:'Harvesting & Trimming',notes:[
'Snip-harvest with trim shears for +10% yield, into a harvest bin sorted by strain.',
'Trimming minigame: accuracy and speed decide your quality. Trim is sellable.',
'The scale screen shows grams.']},
{v:'0.16',date:'Oct 30, 2026',title:'Move Everything',notes:[
'Pick up and move the sink, desk, bed, drop box, dumpster and decorations.',
'Controller X picks things up just like F.']},
{v:'0.15',date:'Oct 30, 2026',title:'Shop Browser & How to Play',notes:[
'The laptop shop is now a full in-game web browser with tabs, search and a cart.',
'New How to Play guide with searchable questions and answers.',
'Wall-mounted seed rack.']},
{v:'0.14',date:'Oct 30, 2026',title:'Saves, Days & Smoking',notes:[
'Play Solo continues your last farm. Autosave every minute, plus Save Game in the pause menu.',
'30-minute in-game days. Contracts last about a week, specials 3 days.',
'Smoke pre-rolls with strain effects.']},
{v:'0.13',date:'Oct 30, 2026',title:'Strains & Contracts',notes:[
'Strain collection with rarities, mutations, hidden strains and naming your own.',
'Contract timers and a 3D contract corkboard.',
'Items settle on surfaces, greenhouse grow lights and night lights.']},
{v:'0.12',date:'Oct 30, 2026',title:'Growing System & Phone',notes:[
'Six strains, seed types, pot sizes, garden beds, soil and nutrients.',
'Six visible growth stages and quality grades.',
'High-detail buds. A cell phone with the Quick Bud shop app.']},
{v:'0.9',date:'Oct 30, 2026',title:'Accounts & Saves',notes:[
'Create an account (or play as a guest) and keep your farms saved online.',
'Storage shelves, bulk pallets, sink and watering can, utility bills.']},
{v:'0.5',date:'Oct 30, 2026',title:'Players & Controller',notes:[
'Realistic characters with a character creator and the Threads clothing store.',
'Full Xbox controller support with button remapping, inventory and a property map.']},
{v:'0.1',date:'Oct 30, 2026',title:'Bud Together Launch',notes:['The first version of Bud Together: a 1–4 player co-op grow sim.']}];
export const CURRENT_VERSION=CHANGELOG[0].v;
