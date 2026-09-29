import MaterialIcon from './MaterialIcon.jsx';

function IconBadge({ room, size = 44, iconSize = 24 }) {
  return (
    <div className="hq-room-icon" style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: room.iconBadgeBg, color: room.accent }}>
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
      style={{ flexShrink: 0, width: size, height: size, border: 'none', background: 'transparent', color: room.addBtnColor, fontSize, fontWeight: 500, borderRadius: 8, cursor: 'pointer', padding: 0, ...style }}
      onClick={room.onQuickAdd}
    >+</button>
  );
}

function FolderShell({ room, outerStyle, frontStyle, children }) {
  const wide = outerStyle.gridColumn === 'span 2';
  return (
    <div
      className={`hq-folder${wide ? ' hq-folder-wide' : ''}`}
      style={{ ...outerStyle, '--hq-folder-color': room.gradient, '--room-accent': room.accent, color: room.textColor }}
      role="button"
      tabIndex={0}
      aria-label={`Open ${room.name}`}
      onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); room.onOpen(); } }}
      onClick={room.onOpen}
    >
      {(room.slips || []).map((slip, index) => (
        <span
          aria-hidden="true"
          className={`hq-folder-slip ${index === 0 ? 'one' : 'two'}`}
          key={`${room.id}-slip-${index}`}
        >
          {slip.decorative ? (
            <span className="hq-folder-slip-lines">
              <i />
              <i />
              <i />
            </span>
          ) : (
            <>
              <span>{slip.label}</span>
              {slip.status && <small>{slip.status}</small>}
            </>
          )}
        </span>
      ))}
      <div
        className="hq-folder-front hq-room-card"
        style={{ ...frontStyle, background: room.gradient, color: room.textColor }}
      >
        {children}
      </div>
    </div>
  );
}

function WideCard({ room }) {
  return (
    <FolderShell room={room} outerStyle={{ gridColumn: 'span 2' }} frontStyle={{ position: 'relative', padding: '16px 15px 13px', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 9 }}>
        <IconBadge room={room} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.2 }}>{room.name}</div>
          <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 500, fontSize: 12, color: room.subColor }}>{room.stage.label} · {room.done}/{room.total}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 19 }}>{room.pct}%</div>
        </div>
        <AddButton room={room} />
      </div>
      <ProgressBar pct={room.pct} track={room.barTrack} fill={room.barFill} />
    </FolderShell>
  );
}

function TallCard({ room }) {
  return (
    <FolderShell room={room} outerStyle={{ gridColumn: 'span 1', gridRow: 'span 2' }} frontStyle={{ position: 'relative', padding: '16px 15px 13px', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
      <div style={{ marginBottom: 9 }}><IconBadge room={room} /></div>
      <div style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.2 }}>{room.name}</div>
      <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 500, fontSize: 12, color: room.subColor }}>{room.stage.label} · {room.done}/{room.total}</div>
      <div style={{ flex: 1 }} />
      <div style={{ fontWeight: 600, fontSize: 19, marginBottom: 9 }}>{room.pct}%</div>
      <ProgressBar pct={room.pct} track={room.barTrack} fill={room.barFill} />
      <AddButton room={room} style={{ position: 'absolute', top: 14, right: 13 }} />
    </FolderShell>
  );
}

function SmCard({ room }) {
  return (
    <FolderShell room={room} outerStyle={{ gridColumn: 'span 1' }} frontStyle={{ position: 'relative', padding: '16px 15px 13px', cursor: 'pointer' }}>
      <div style={{ marginBottom: 9 }}><IconBadge room={room} /></div>
      <div style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.2 }}>{room.name}</div>
      <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 500, fontSize: 12, color: room.subColor }}>{room.stage.label} · {room.done}/{room.total}</div>
      <div style={{ fontWeight: 600, fontSize: 19, marginTop: 8 }}>{room.pct}%</div>
      <div style={{ marginTop: 8 }}><ProgressBar pct={room.pct} track={room.barTrack} fill={room.barFill} /></div>
      <AddButton room={room} style={{ position: 'absolute', top: 14, right: 13 }} />
    </FolderShell>
  );
}

function BigCard({ room }) {
  return (
    <FolderShell room={room} outerStyle={{ gridColumn: 'span 2', gridRow: 'span 2' }} frontStyle={{ position: 'relative', padding: '20px 19px 17px', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
        <IconBadge room={room} />
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ textAlign: 'right', flexShrink: 0, paddingTop: 4 }}>
            <div style={{ fontWeight: 600, fontSize: 19, lineHeight: 1 }}>{room.pct}%</div>
          </div>
          <AddButton room={room} size={28} fontSize={19} />
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.2 }}>{room.name}</div>
      <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 500, fontSize: 12, color: room.subColor, marginBottom: 10 }}>{room.stage.label} · {room.done}/{room.total}</div>
      <ProgressBar pct={room.pct} track={room.barTrack} fill={room.barFill} height={10} />
    </FolderShell>
  );
}

function DoneCard({ room }) {
  return (
    <FolderShell room={room} outerStyle={{ gridColumn: 'span 1' }} frontStyle={{ position: 'relative', padding: '14px 15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', minHeight: 88 }}>
      <div style={{ fontWeight: 600, fontSize: 16 }}>{room.name}</div>
      <div style={{ borderRadius: 5, padding: '3px 8px', fontWeight: 600, fontSize: 9, textTransform: 'uppercase', letterSpacing: '.5px', background: '#241A33', color: '#FFFCF3', alignSelf: 'flex-start' }}>DONE &#10003;</div>
    </FolderShell>
  );
}

function DoneWideCard({ room }) {
  return (
    <FolderShell room={room} outerStyle={{ gridColumn: 'span 2' }} frontStyle={{ position: 'relative', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
        <IconBadge room={room} />
        <div style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.2 }}>{room.name}</div>
      </div>
      <div style={{ borderRadius: 5, padding: '3px 8px', fontWeight: 600, fontSize: 9, textTransform: 'uppercase', letterSpacing: '.5px', background: '#241A33', color: '#FFFCF3', flexShrink: 0 }}>DONE &#10003;</div>
    </FolderShell>
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
        style={{ gridColumn: 'span 2', width: '100%', minHeight: 62, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, border: 'none', borderRadius: 16, padding: 15, textAlign: 'center', fontWeight: 600, fontSize: 14, lineHeight: 1, color: matText75, background: cream, cursor: 'pointer' }}
        onClick={onAddRoom}
      ><span aria-hidden="true" style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentText, background: accent }}><MaterialIcon name="add" size={18} /></span><span>add a room</span></button>
    </div>
  );
}








