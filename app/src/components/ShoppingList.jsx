import MaterialIcon from './MaterialIcon.jsx';

export default function ShoppingList({ theme, matText75, items, rooms, onBack, onAdd, onToggle, onDelete, onEdit }) {
  const roomName = (id) => rooms.find((room) => room.id === id)?.name || '';
  const open = items.filter((item) => !item.done);
  const bought = items.filter((item) => item.done);
  const renderItem = (item) => {
    const metaBits = [item.roomId && roomName(item.roomId), item.source].filter(Boolean);
    return (
      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 11, minHeight: 56, padding: '7px 10px 7px 14px', borderBottom: '1px solid rgba(36,26,51,.08)', opacity: item.done ? .52 : 1 }}>
        <button aria-label={item.done ? 'Mark as needed' : 'Mark as bought'} style={{ width: 38, height: 38, flexShrink: 0, borderRadius: '50%', border: item.done ? 'none' : '2px solid rgba(36,26,51,.25)', color: item.done ? theme.accent : 'transparent', background: item.done ? '#241A33' : 'transparent', fontFamily: "'Material Symbols Rounded'", fontVariationSettings: "'FILL' 1", fontSize: 17, padding: 0, cursor: 'pointer' }} onClick={() => onToggle(item.id)}>{item.done ? 'check' : ''}</button>
        <button style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', padding: 0, textAlign: 'left', cursor: 'pointer' }} onClick={() => onEdit(item.id)}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#241A33', textDecoration: item.done ? 'line-through' : 'none' }}>{item.label}</div>
          {!!metaBits.length && <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 11, color: 'rgba(36,26,51,.45)', marginTop: 2 }}>{metaBits.join(' · ')}</div>}
        </button>
        {item.link && (
          <a
            href={/^https?:\/\//i.test(item.link) ? item.link : `https://${item.link}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open purchase link"
            style={{ width: 36, height: 36, flexShrink: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(36,26,51,.06)', color: 'rgba(36,26,51,.55)' }}
            onClick={(e) => e.stopPropagation()}
          ><MaterialIcon name="open_in_new" size={17} /></a>
        )}
        <button aria-label="Delete shopping item" style={{ width: 40, height: 40, border: 'none', background: 'transparent', color: 'rgba(36,26,51,.35)', fontSize: 19, cursor: 'pointer' }} onClick={() => onDelete(item.id)}>&#215;</button>
      </div>
    );
  };
  return (
    <div>
      <div style={{ position: 'sticky', top: 0, zIndex: 95, marginLeft: -16, marginRight: -16, marginBottom: 14, background: theme.cream, borderRadius: '0 0 22px 22px', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px 12px' }}>
        <button style={{ width: 44, height: 44, borderRadius: 999, background: theme.mat, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none', padding: 0 }} onClick={onBack}>
          <MaterialIcon name="arrow_back" size={21} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 22 }}>Shopping List</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 12, color: matText75 }}>{open.length} thing{open.length === 1 ? '' : 's'} to buy</div>
        </div>
        <button className="hq-linkbtn" style={{ minWidth: 64, minHeight: 44, border: 'none', padding: '8px 4px', color: matText75, background: 'transparent', fontWeight: 800, fontSize: 13, cursor: 'pointer' }} onClick={onAdd}>+ add</button>
      </div>
      {!items.length && <div style={{ padding: '36px 18px', borderRadius: 16, color: matText75, background: theme.cream, textAlign: 'center', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14 }}>nothing to buy yet.</div>}
      {!!items.length && <div style={{ overflow: 'hidden', borderRadius: 16, background: theme.cream }}>{open.map(renderItem)}{bought.length > 0 && <div style={{ padding: '12px 14px 5px', fontWeight: 800, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(36,26,51,.42)' }}>bought</div>}{bought.map(renderItem)}</div>}
    </div>
  );
}
