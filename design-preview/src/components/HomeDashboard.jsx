import MaterialIcon from './MaterialIcon.jsx';

export default function HomeDashboard({ rooms, overallPct, allDone, allTotal, roomsDone, shoppingCount, completedCount, onShopping, onHistory, onCapture, onAddRoom }) {
  return (
    <div className="hq-new-home">
      <header className="hq-colour-hero">
        <div className="hq-hero-top"><span>HOMEQUEST</span><button aria-label="Quick add a job" onClick={onCapture}><MaterialIcon name="add" size={24} /></button></div>
        <h1>Home,<br />in progress.</h1>
        <div className="hq-hero-bottom">
          <div className="hq-hero-percent">{overallPct}<span>%</span></div>
          <div><strong>{allDone} of {allTotal} jobs done</strong><span>{roomsDone} of {rooms.length} rooms complete</span></div>
        </div>
        <div className="hq-hero-track" role="progressbar" aria-label="Overall completion" aria-valuenow={overallPct} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${overallPct}%` }} /></div>
      </header>

      <nav className="hq-shortcut-rail" aria-label="Your lists">
        <button onClick={onShopping}><MaterialIcon name="shopping_bag" size={19} /><span>Shopping</span><b>{shoppingCount}</b></button>
        <button onClick={onHistory}><MaterialIcon name="check_circle" size={19} /><span>Completed</span><b>{completedCount}</b></button>
      </nav>

      <div className="hq-rooms-heading"><h2>Your rooms <span>{rooms.length}</span></h2><button onClick={onAddRoom} aria-label="Add a room"><MaterialIcon name="add" size={22} /></button></div>
      <div className="hq-room-collection">
        {rooms.map((room, index) => (
          <article className="hq-space-card" key={room.id} style={{ '--room-accent': room.accent, '--entry-delay': `${Math.min(index, 5) * 35}ms` }}>
            <button className="hq-space-main" onClick={room.onOpen} aria-label={`Open ${room.name}`}>
              <div className="hq-space-top"><span className="hq-stage-pill"><i />{room.stage.label}</span><span className="hq-space-number">{String(index + 1).padStart(2, '0')}</span></div>
              <div className="hq-space-title"><h3>{room.name}</h3><span className="hq-space-icon"><MaterialIcon name={room.icon} size={25} /></span></div>
              <div className="hq-next-job"><span className="hq-next-label">{room.complete ? 'Finished' : 'Next up'}</span><span>{room.nextTask}</span><MaterialIcon name="arrow_outward" size={16} /></div>
              <div className="hq-ruler-caption"><span>Progress</span><strong>{room.pct}%</strong></div>
              <div className="hq-progress-ruler" aria-hidden="true">{Array.from({ length: 45 }, (_, i) => <i key={i} data-filled={i < Math.ceil(room.pct * .45)} />)}</div>
            </button>
            <footer><span>{room.done} / {room.total} jobs complete</span><button onClick={room.onQuickAdd} aria-label={`Add job to ${room.name}`}><MaterialIcon name="add" size={16} /> Add job</button></footer>
          </article>
        ))}
      </div>
      <button className="hq-add-space" onClick={onAddRoom}><MaterialIcon name="add" size={21} />Add a room</button>
      <p className="hq-preview-note">COLOUR STUDY · LOCAL PREVIEW</p>
    </div>
  );
}
