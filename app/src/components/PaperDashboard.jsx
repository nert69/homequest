import { useRef, useState } from 'react';
import MaterialIcon from './MaterialIcon.jsx';


export default function PaperDashboard({ rooms, overallPct, allDone, allTotal, shoppingCount, completedCount, onShopping, onHistory, onCapture, onAddRoom }) {
  const [selected, setSelected] = useState(0);
  const rail = useRef(null);
  const active = rooms[Math.min(selected, rooms.length - 1)];
  function choose(index) {
    const target = rail.current?.children[index];
    if (!target) return;
    rail.current.scrollTo({ left: target.offsetLeft - (rail.current.clientWidth - target.clientWidth) / 2, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  function track() {
    const el = rail.current;
    const center = el.scrollLeft + el.clientWidth / 2;
    let nearest = 0, distance = Infinity;
    Array.from(el.children).forEach((card, i) => { const d = Math.abs(card.offsetLeft + card.clientWidth / 2 - center); if (d < distance) { distance = d; nearest = i; } });
    setSelected(nearest);
  }
  return <div className="paper-home">
    <header className="paper-masthead"><span>homequest<span className="paper-brand-dot">®</span></span><button onClick={onCapture} aria-label="Quick add a job"><MaterialIcon name="add" size={22} /></button></header>
    <div className="paper-intro"><span className="paper-eyebrow">A WORK IN PROGRESS</span><h1>A little more<br />like home.</h1><p>Pick a room. Find your next little job.</p></div>
    <div className="paper-rail-label"><span>YOUR ROOMS / {String(rooms.length).padStart(2, '0')}</span><span>SWIPE TO EXPLORE →</span></div>
    <div className="paper-room-rail" ref={rail} onScroll={track} aria-label="Choose a room">
      {rooms.map((room, i) => <button className="paper-room-card" data-active={selected === i} key={room.id} onClick={room.onOpen} aria-label={`Open ${room.name}`} style={{ '--folder-tint': room.accent }}>
        <span className="paper-card-top"><span>{String(i + 1).padStart(2, '0')}</span><span>{room.done}/{room.total} DONE</span></span>
        <span className="paper-folder-object" aria-hidden="true">
          <span className="paper-folder-back" />
          <span className="paper-insert paper-insert-back"><i /><i /><i /></span>
          <span className="paper-insert paper-insert-front"><span>HOME / {String(i + 1).padStart(2, '0')}</span><MaterialIcon name={room.icon} size={38} /><i /><i /></span>
          <span className="paper-folder-face"><span className="paper-folder-sticker">{room.name}</span><span className="paper-folder-stud" /></span>
        </span>
        <span className="paper-room-name">{room.name}</span><span className="paper-room-stage">{room.stage.label}</span>
        <span className="paper-mini-track"><i style={{ width: `${room.pct}%` }} /></span>
      </button>)}
    </div>
    <div className="paper-room-controls"><button aria-label="Previous room" disabled={selected === 0} onClick={() => choose(selected - 1)}>←</button><div>{rooms.map((r, i) => <button key={r.id} aria-label={`Select ${r.name}`} aria-pressed={selected === i} onClick={() => choose(i)} />)}</div><button aria-label="Next room" disabled={selected === rooms.length - 1} onClick={() => choose(selected + 1)}>→</button></div>
    {active && <section className="paper-next"><div><span className="paper-eyebrow">{active.complete ? 'ALL FINISHED' : 'NEXT IN ' + active.name.toUpperCase()}</span><h2>{active.nextTask}</h2></div><button className="paper-open-next" onClick={active.onOpen} aria-label={`View jobs in ${active.name}`}><span style={{ '--progress-angle': `${active.pct * 3.6}deg` }}><MaterialIcon name="arrow_forward" size={25} /></span></button></section>}
    <div className="paper-total"><span>{allDone} of {allTotal} jobs complete</span><span>{overallPct}%</span><div><i style={{ width: `${overallPct}%` }} /></div></div>
    <nav className="paper-bottom-links" aria-label="Your lists"><button onClick={onShopping}><MaterialIcon name="shopping_bag" size={22} /><span>Shopping</span><small>{shoppingCount} to buy</small></button><button onClick={onHistory}><MaterialIcon name="check_circle" size={22} /><span>Completed</span><small>{completedCount} finished</small></button><button onClick={onAddRoom}><MaterialIcon name="add_home" size={22} /><span>Add room</span><small>Make some space</small></button></nav>
    <p className="paper-preview">PAPER & OBJECTS / DESIGN PREVIEW</p>
  </div>;
}
