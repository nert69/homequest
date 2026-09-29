import { useEffect, useState } from 'react';
import GraphicArt,{artIndex} from './GraphicArt.jsx';
// Cards rise in one after another only on the app's first open, never when
// returning from a room (that would fight the restored scroll position).
let introPlayed=false;
export default function Dashboard({rooms,allDone,allTotal,overallPct,onShopping,onHistory,onCapture,onAddRoom,morphRoomId}) {
 const [intro]=useState(()=>!introPlayed);
 useEffect(()=>{introPlayed=true;},[]);
 const ordered=[...rooms].sort((a,b)=>artIndex(a.name)-artIndex(b.name));
 const vt=(r,name)=>r.id===morphRoomId?name:undefined;
 return <main className="graphic-home"><header className="graphic-header"><span>HOMEQUEST</span><button aria-label="Add a job" onClick={onCapture}>＋</button></header><section className="graphic-intro"><h1>A WORK<br/>IN PROGRESS.</h1><p>{allDone} / {allTotal} JOBS DONE</p><div className="graphic-progress"><i style={{width:overallPct+'%'}}/></div></section><div className={'graphic-grid'+(intro?' is-intro':'')}>{ordered.map((r,i)=><button className="graphic-card" key={r.id} onClick={r.onOpen} style={{'--i':i,viewTransitionName:vt(r,'room-panel')}}><span className="graphic-card-top"><span className="graphic-number" style={{viewTransitionName:vt(r,'room-number')}}>{String(i+1).padStart(2,'0')}</span><span style={{viewTransitionName:vt(r,'room-title')}}>{r.name}</span></span><GraphicArt name={r.name} morph={vt(r,'room-art')}/><span className="graphic-count" style={{viewTransitionName:vt(r,'room-count')}}>{r.done} / {r.total}</span></button>)}</div><button className="graphic-add" onClick={onAddRoom}>＋ ADD A ROOM</button><nav className="graphic-nav"><button aria-current="page">ROOMS</button><button onClick={onShopping}>SHOPPING</button><button onClick={onHistory}>DONE</button></nav></main>;
}
