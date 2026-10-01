import { useId } from 'react';
// WebP copies of the PNG sources in public/ (about 150 KB in total instead
// of 2.6 MB); the two new illustrations are scaled to 720px, still above
// their largest on-screen size at 3x.
const base=import.meta.env.BASE_URL;
export const ART={sheet:base+'room-art.webp',toilet:base+'downstairs-toilet.webp',hallway:base+'downstairs-hallway.webp'};
const positions = [[135,380,258,278],[535,389,320,280],[82,793,336,281],[539,797,339,269],[159,1201,188,288],[599,1208,210,286]];
export function artIndex(name) { const n=name.toLowerCase(); return n.includes('kitchen')?0:n.includes('living')||n.includes('lounge')?1:n.includes('bath')||n.includes('toilet')?2:n.includes('bed')?3:n.includes('hall')?4:5; }
export default function GraphicArt({name,morph}) {
 const style=morph?{viewTransitionName:morph}:undefined;
 const id=useId(), n=name.toLowerCase();
 const custom=n.includes('toilet')?ART.toilet:n.includes('downstairs')&&n.includes('hall')?ART.hallway:null;
 if(custom) return <div className="graphic-art" aria-hidden="true" style={style}><img src={custom} alt="" style={{width:'100%',height:'100%',objectFit:'contain',display:'block'}}/></div>;
 const [x,y,w,h]=positions[artIndex(name)];
 return <div className="graphic-art" aria-hidden="true" style={style}><svg viewBox={`${x} ${y} ${w} ${h}`} preserveAspectRatio="xMidYMid meet">
  <defs>
   <clipPath id={`${id}-bounds`}>{artIndex(name)===2?<path d="M150 793H418V1074H82V830H150Z"/>:<rect x={x} y={y} width={w} height={h}/>}</clipPath>
   <filter id={id} colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
    {/* Remove pale paper rather than tracing and cutting illustration edges. */}
    <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -6 -6 -6 0 15" result="ink"/>
    <feComposite in="SourceGraphic" in2="ink" operator="in"/>
   </filter>
  </defs>
  <image href={ART.sheet} width="941" height="1672" filter={`url(#${id})`} clipPath={`url(#${id}-bounds)`}/>
 </svg></div>;
}
