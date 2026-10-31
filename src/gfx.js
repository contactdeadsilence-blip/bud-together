// v19 graphics settings: presets + individual options, persisted in localStorage.bt_gfx
export const PRESETS=[
 {n:'Low',   aa:'msaa',sh:512, soft:0,rs:.75,an:1, vd:70, bloom:0,ao:0,env:0,tm:'aces',grass:400},
 {n:'Medium',aa:'fxaa',sh:1024,soft:1,rs:1,  an:4, vd:110,bloom:1,ao:0,env:1,tm:'aces',grass:1500},
 {n:'High',  aa:'msaa',sh:2048,soft:1,rs:1.25,an:8,vd:150,bloom:1,ao:1,env:1,tm:'aces',grass:3000},
 {n:'Ultra', aa:'smaa',sh:4096,soft:1,rs:1.5,an:16,vd:220,bloom:1,ao:1,env:1,tm:'aces',grass:5000}];
export const OPTS={aa:[['off','Off'],['fxaa','FXAA'],['smaa','SMAA'],['msaa','MSAA 4×']],sh:[[0,'Off'],[512,'Low 512'],[1024,'Medium 1024'],[2048,'High 2048'],[4096,'Ultra 4096']],soft:[[0,'Hard'],[1,'Soft']],
 rs:[[.5,'50%'],[.75,'75%'],[1,'100%'],[1.25,'125%'],[1.5,'150%'],[2,'200%']],an:[[1,'Off'],[4,'4×'],[8,'8×'],[16,'16×']],vd:[[70,'Near'],[110,'Medium'],[150,'Far'],[220,'Max']],
 bloom:[[0,'Off'],[1,'On']],ao:[[0,'Off'],[1,'On (GTAO)']],env:[[0,'Off'],[1,'On']],tm:[['aces','ACES Filmic'],['agx','AgX'],['none','None']],grass:[[400,'Low'],[1500,'Medium'],[3000,'High'],[5000,'Ultra']]};
export const LABEL={aa:'Anti-aliasing',sh:'Shadow quality',soft:'Shadow edges',rs:'Render scale',an:'Texture filtering',vd:'View distance',bloom:'Bloom',ao:'Ambient occlusion',env:'Reflections / ambient light',tm:'Tone mapping',grass:'Grass & foliage'};
export function autoPreset(){try{const c=document.createElement('canvas').getContext('webgl2');if(!c)return 0;const d=c.getExtension('WEBGL_debug_renderer_info'),r=(d?c.getParameter(d.UNMASKED_RENDERER_WEBGL):'')+'';
 const mob=/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent),weak=/SwiftShader|llvmpipe|Software|Mali-4|Adreno \(TM\) [3-5]/i.test(r),igpu=/Intel|UHD|Iris|Apple M1|Mali|Adreno|PowerVR/i.test(r),cores=navigator.hardwareConcurrency||4;
 if(weak)return 0;if(mob)return 1;if(/RTX|Radeon RX [67]|Apple M[2-9]/i.test(r)&&cores>=8)return 3;if(igpu)return 1;return 2}catch(e){return 1}}
export function loadGfx(Q){let s={};try{s=JSON.parse(localStorage.bt_gfx||'{}')}catch(e){}
 if(s.preset==null){let p=autoPreset();try{const o=JSON.parse(localStorage.bt_set||'{}');if(o.qual!=null)p=Math.min(+o.qual,2)}catch(e){}s={preset:p}}
 if(Q?.has('q'))s={preset:Math.max(0,Math.min(3,+Q.get('q')))};
 const base=PRESETS[s.preset??1]||PRESETS[1];const g={...base,...(s.preset==-1?s:{}),preset:s.preset??1};return g}
export function saveGfx(g){localStorage.bt_gfx=JSON.stringify(g)}
