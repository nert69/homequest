// Room illustrations. The six crops from the original mockup sheet are
// pre-baked transparent WebPs in public/art/: the pale paper was removed with
// the same maths the old live SVG filter used (alpha = clamp(15 - 6(r+g+b))),
// so edges are identical, but nothing is filtered at render time. That live
// filter ran on the main thread in Safari for every card on every visit to
// home and left the page blank for seconds. Sources are in art-source/.
// The two new illustrations are 720px WebP copies of their PNGs.
//
// `fill` (0–1) is how finished the room is: a pale sketch sits underneath and
// the full-colour art is revealed from the bottom up to that level, so a room
// colours in as its jobs get done. Leave it out for full colour. The sketches
// are pre-baked *-ghost.webp files (grey, 30% alpha), again so nothing is
// filtered while rendering.
const base=import.meta.env.BASE_URL;
const CROPS=['kitchen','living','bathroom','bedroom','hall','other'].map((n)=>base+'art/'+n+'.webp');
export const ART={crops:CROPS,toilet:base+'downstairs-toilet.webp',hallway:base+'downstairs-hallway.webp'};
export const ART_SOURCES=[...CROPS,ART.toilet,ART.hallway].flatMap((s)=>[s,s.replace(/\.webp$/,'-ghost.webp')]);
export function artIndex(name) { const n=name.toLowerCase(); return n.includes('kitchen')?0:n.includes('living')||n.includes('lounge')?1:n.includes('bath')||n.includes('toilet')?2:n.includes('bed')?3:n.includes('hall')?4:5; }
export default function GraphicArt({name,morph,fill}) {
 const n=name.toLowerCase();
 const custom=n.includes('toilet')?ART.toilet:n.includes('downstairs')&&n.includes('hall')?ART.hallway:null;
 const src=custom||CROPS[artIndex(name)];
 const ghost=src.replace(/\.webp$/,'-ghost.webp');
 const kind=custom?undefined:'graphic-art-crop';
 const level=fill==null?1:Math.max(0,Math.min(1,fill));
 const style={...(morph?{viewTransitionName:morph}:{}),'--fill':level};
 return <div className="graphic-art" aria-hidden="true" style={style} data-fill={fill==null?undefined:Math.round(level*100)}>
  {fill!=null&&<img className={['graphic-art-ghost',kind].filter(Boolean).join(' ')} src={ghost} alt="" decoding="async"/>}
  <img className={['graphic-art-ink',kind].filter(Boolean).join(' ')} src={src} alt="" decoding="async"/>
 </div>;
}
