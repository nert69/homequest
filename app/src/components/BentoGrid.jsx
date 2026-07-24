import MaterialIcon from './MaterialIcon.jsx';

function IconBadge({ room, size = 44, iconSize = 24 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: room.iconBadgeBg }}>
      <MaterialIcon name={room.icon} size={iconSize} />
    </div>
  );
}

function ProgressBar({ pct, track, fill, height = 8 }) {
  return (
    <div style={{ height, borderRadius: 999, background: track, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, borderRadius: 999, background: fill, transition: 'width .5s ease' }} />
    </div>
  );
}

function AddButton({ room, size = 26, fontSize = 18, style = {} }) {
  return (
    <button
      style={{ flexShrink: 0, width: size, height: size, border: 'none', background: 'transparent', color: room.addBtnColor, fontSize, fontWeight: 700, borderRadius: 8, cursor: 'pointer', padding: 0, ...style }}
      onClick={room.onQuickAdd}
    >+</button>
  );
}

function WideCard({ room }) {
  return (
    <div className="hq-room-card" style={{ gridColumn: 'span 2', position: 'relative', background: room.gradient, borderRadius: 16, padding: '16px 15px 13px', cursor: 'pointer', color: room.textColor }} onClick={room.onOpen}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 9 }}>
        <IconBadge room={room} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>{room.name}</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 12, color: room.subColor }}>{room.stage.label} · {room.done}/{room.total}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 19 }}>{room.pct}%</div>
        </div>
        <AddButton room={room} />
      </div>
      <ProgressBar pct={room.pct} track={room.barTrack} fill={room.barFill} />
    </div>
  );
}

function TallCard({ room }) {
  return (
    <div className="hq-room-card" style={{ gridColumn: 'span 1', gridRow: 'span 2', position: 'relative', background: room.gradient, borderRadius: 16, padding: '16px 15px 13px', display: 'flex', flexDirection: 'column', cursor: 'pointer', color: room.textColor }} onClick={room.onOpen}>
      <div style={{ marginBottom: 9 }}><IconBadge room={room} /></div>
      <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>{room.name}</div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 12, color: room.subColor }}>{room.stage.label} · {room.done}/{room.total}</div>
      <div style={{ flex: 1 }} />
      <div style={{ fontWeight: 800, fontSize: 19, marginBottom: 9 }}>{room.pct}%</div>
      <ProgressBar pct={room.pct} track={room.barTrack} fill={room.barFill} />
      <AddButton room={room} style={{ position: 'absolute', top: 14, right: 13 }} />
    </div>
  );
}

function SmCard({ room }) {
  return (
    <div className="hq-room-card" style={{ gridColumn: 'span 1', position: 'relative', background: room.gradient, borderRadius: 16, padding: '16px 15px 13px', cursor: 'pointer', color: room.textColor }} onClick={room.onOpen}>
      <div style={{ marginBottom: 9 }}><IconBadge room={room} /></div>
      <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>{room.name}</div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 12, color: room.subColor }}>{room.stage.label} · {room.done}/{room.total}</div>
      <div style={{ fontWeight: 800, fontSize: 19, marginTop: 8 }}>{room.pct}%</div>
      <div style={{ marginTop: 8 }}><ProgressBar pct={room.pct} track={room.barTrack} fill={room.barFill} /></div>
      <AddButton room={room} style={{ position: 'absolute', top: 14, right: 13 }} />
    </div>
  );
}

function BigCard({ room }) {
  return (
    <div className="hq-room-card" style={{ gridColumn: 'span 2', gridRow: 'span 2', position: 'relative', background: room.gradient, borderRadius: 18, padding: '20px 19px 17px', display: 'flex', flexDirection: 'column', cursor: 'pointer', color: room.textColor }} onClick={room.onOpen}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
        <IconBadge room={room} />
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ textAlign: 'right', flexShrink: 0, paddingTop: 4 }}>
            <div style={{ fontWeight: 800, fontSize: 19, lineHeight: 1 }}>{room.pct}%</div>
          </div>
          <AddButton room={room} size={28} fontSize={19} />
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>{room.name}</div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 12, color: room.subColor, marginBottom: 10 }}>{room.stage.label} · {room.done}/{room.total}</div>
      <ProgressBar pct={room.pct} track={room.barTrack} fill={room.barFill} height={10} />
    </div>
  );
}

function DoneCard({ room }) {
  return (
    <div className="hq-room-card" style={{ gridColumn: 'span 1', position: 'relative', background: room.gradient, borderRadius: 16, padding: '14px 15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', minHeight: 88, color: room.textColor }} onClick={room.onOpen}>
      <div style={{ fontWeight: 800, fontSize: 16 }}>{room.name}</div>
      <div style={{ borderRadius: 5, padding: '3px 8px', fontWeight: 800, fontSize: 9, textTransform: 'uppercase', letterSpacing: '.5px', background: '#241A33', color: '#FFFCF3', alignSelf: 'flex-start' }}>DONE &#10003;</div>
    </div>
  );
}

function DoneWideCard({ room }) {
  return (
    <div className="hq-room-card" style={{ gridColumn: 'span 2', position: 'relative', background: room.gradient, borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, cursor: 'pointer', color: room.textColor }} onClick={room.onOpen}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
        <IconBadge room={room} />
        <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>{room.name}</div>
      </div>
      <div style={{ borderRadius: 5, padding: '3px 8px', fontWeight: 800, fontSize: 9, textTransform: 'uppercase', letterSpacing: '.5px', background: '#241A33', color: '#FFFCF3', flexShrink: 0 }}>DONE &#10003;</div>
    </div>
  );
}

export default function BentoGrid({ rooms, matText75, cream, accent, accentText, onAddRoom }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {rooms.map((room) => {
        if (room.isWide) return <WideCard key={room.id} room={room} />;
        if (room.isTall) return <TallCard key={room.id} room={room} />;
        if (room.isSm) return <SmCard key={room.id} room={room} />;
        if (room.isBig) return <BigCard key={room.id} room={room} />;
        if (room.isDone) return <DoneCard key={room.id} room={room} />;
        if (room.isDoneWide) return <DoneWideCard key={room.id} room={room} />;
        return null;
      })}
      <button
        type="button"
        style={{ gridColumn: 'span 2', width: '100%', minHeight: 62, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, border: 'none', borderRadius: 16, padding: 15, textAlign: 'center', fontWeight: 800, fontSize: 14, lineHeight: 1, color: matText75, background: cream, cursor: 'pointer' }}
        onClick={onAddRoom}
      ><span aria-hidden="true" style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentText, background: accent }}><MaterialIcon name="add" size={18} /></span><span>add a room</span></button>
    </div>
  );
}








