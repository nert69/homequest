// Room illustrations. The six crops from the original mockup sheet are
// pre-baked transparent WebPs in public/art/: the pale paper was removed with
// the same maths the old live SVG filter used (alpha = clamp(15 - 6(r+g+b))),
// so edges are identical, but nothing is filtered at render time. That live
// filter ran on the main thread in Safari for every card on every visit to
// home and left the page blank for seconds. Sources are in art-source/.
// The two new illustrations are 720px WebP copies of their PNGs.
const base=import.meta.env.BASE_URL;
const CROPS=['kitchen','living','bathroom','bedroom','hall','other'].map((n)=>base+'art/'+n+'.webp');
export const ART={crops:CROPS,toilet:base+'downstairs-toilet.webp',hallway:base+'downstairs-hallway.webp'};
export const ART_SOURCES=[...CROPS,ART.toilet,ART.hallway];
export function artIndex(name) { const n=name.toLowerCase(); return n.includes('kitchen')?0:n.includes('living')||n.includes('lounge')?1:n.includes('bath')||n.includes('toilet')?2:n.includes('bed')?3:n.includes('hall')?4:5; }
export default function GraphicArt({name,morph}) {
 const style=morph?{viewTransitionName:morph}:undefined;
 const n=name.toLowerCase();
 const custom=n.includes('toilet')?ART.toilet:n.includes('downstairs')&&n.includes('hall')?ART.hallway:null;
 return <div className="graphic-art" aria-hidden="true" style={style}><img className={custom?undefined:'graphic-art-crop'} src={custom||CROPS[artIndex(name)]} alt="" decoding="async" style={{width:'100%',height:'100%',objectFit:'contain',display:'block'}}/></div>;
}
