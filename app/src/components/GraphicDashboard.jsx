import { useEffect, useState } from 'react';
import GraphicArt,{ART_SOURCES,artIndex} from './GraphicArt.jsx';
// Cards rise in one after another only on the app's first open, never when
// returning from a room (that would fight the restored scroll position).
// The cards are dealt a beat after the headline once the page is on screen
// (otherwise it plays out unseen); they never wait on the illustrations,
// which pop into their cards as soon as they have decoded.
let introPlayed=false;
const reduceMotion=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const onScreen=()=>document.visibilityState==='visible'?Promise.resolve():new Promise(res=>document.addEventListener('visibilitychange',res,{once:true}));
const pause=(ms)=>new Promise(res=>setTimeout(res,ms));
const artLoaded=()=>Promise.race([Promise.all(ART_SOURCES.map(src=>{const img=new Image();img.src=src;return img.decode().catch(()=>{});})),pause(3000)]);
// Each card is dealt onto the board in a diagonal wave with its own slight
// tilt (fixed per room, alternating by column) that springs flat as it lands.
function dealStyle(r,i) {
 let h=0; for(const ch of r.name) h=(h*31+ch.charCodeAt(0))>>>0;
 const col=i%2, row=Math.floor(i/2);
 return {'--d':(80+(row+col)*85+h%30)+'ms','--r':((col?1:-1)*(3+h%5))+'deg'};
}
export default function Dashboard({rooms,allDone,allTotal,overallPct,onShopping,onHistory,onCapture,onAddRoom,morphRoomId}) {
 const [intro,setIntro]=useState(()=>introPlayed||reduceMotion()?'none':'waiting');
 // 'hidden' until decoded; 'in' pops with the deal; 'late' if the cards were
 // already down by then, so the art follows in a quicker stagger.
 const [art,setArt]=useState('hidden');
 useEffect(()=>{
  introPlayed=true;
  if(intro!=='waiting') return;
  let live=true, dealt=false;
  onScreen().then(()=>pause(250)).then(()=>requestAnimationFrame(()=>{ if(!live) return; dealt=true; setIntro('playing'); }));
  artLoaded().then(()=>live&&setArt(dealt?'late':'in'));
  return()=>{live=false;};
 },[]);
 const ordered=[...rooms].sort((a,b)=>artIndex(a.name)-artIndex(b.name));
 const vt=(r,name)=>r.id===morphRoomId?name:undefined;
 return <main className={'graphic-home'+(intro==='none'?'':' is-intro')}><header className="graphic-header"><span>HOMEQUEST</span><button aria-label="Add a job" onClick={onCapture}>＋</button></header><section className="graphic-intro"><h1><span className="graphic-line"><span>A WORK</span></span><br/><span className="graphic-line"><span>IN PROGRESS.</span></span></h1><p>{allDone} / {allTotal} JOBS DONE</p><div className="graphic-progress"><i style={{width:overallPct+'%'}}/></div></section><div className={'graphic-grid'+(intro==='none'?'':' is-intro-'+intro+' art-'+art)}>{ordered.map((r,i)=><button className="graphic-card" key={r.id} onClick={r.onOpen} style={{...dealStyle(r,i),viewTransitionName:vt(r,'room-panel')}}><span className="graphic-card-top"><span className="graphic-number" style={{viewTransitionName:vt(r,'room-number')}}>{String(i+1).padStart(2,'0')}</span><span style={{viewTransitionName:vt(r,'room-title')}}>{r.name}</span></span><GraphicArt name={r.name} morph={vt(r,'room-art')} fill={r.total?r.done/r.total:0}/><span className="graphic-count" style={{viewTransitionName:vt(r,'room-count')}}>{r.done} / {r.total}</span></button>)}</div><button className="graphic-add" onClick={onAddRoom}>＋ ADD A ROOM</button><nav className="graphic-nav"><button aria-current="page">ROOMS</button><button onClick={onShopping}>SHOPPING</button><button onClick={onHistory}>DONE</button></nav></main>;
}
