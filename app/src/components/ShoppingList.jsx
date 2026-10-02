import MaterialIcon from './MaterialIcon.jsx';
import useEntering from '../hooks/useEntering.js';

export default function ShoppingList({ theme, matText75, items, rooms, onBack, onAdd, onToggle, onDelete, onEdit }) {
  const roomName = (id) => rooms.find((room) => room.id === id)?.name || '';
  const open = items.filter((item) => !item.done);
  const bought = items.filter((item) => item.done);
  const entering = useEntering();
  const order = [...open, ...bought].map((item) => item.id);
  const renderItem = (item) => {
    const metaBits = [item.roomId && roomName(item.roomId), item.source].filter(Boolean);
    return (
      <div key={item.id} className="graphic-row" style={{ '--i': order.indexOf(item.id), display: 'flex', alignItems: 'center', gap: 11, minHeight: 56, padding: '7px 10px 7px 14px', borderBottom: '1px solid rgba(36,26,51,.08)', opacity: item.done ? .52 : 1 }}>
        <button aria-label={item.done ? 'Mark as needed' : 'Mark as bought'} style={{ width: 38, height: 38, flexShrink: 0, borderRadius: '50%', border: item.done ? 'none' : '2px solid rgba(36,26,51,.25)', color: item.done ? theme.accent : 'transparent', background: item.done ? '#241A33' : 'transparent', fontFamily: "'Material Symbols Rounded'", fontVariationSettings: "'FILL' 1", fontSize: 17, padding: 0, cursor: 'pointer' }} onClick={() => onToggle(item.id)}>{item.done && <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: '62%', height: '62%', display: 'block', margin: 'auto', fill: 'none', stroke: '#111', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}><path d="m5 12 4.5 4.5L19 7" /></svg>}</button>
        <button style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', padding: 0, textAlign: 'left', cursor: 'pointer' }} onClick={() => onEdit(item.id)}>
          <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 500, fontSize: 14, color: '#241A33', textDecoration: item.done ? 'line-through' : 'none' }}>{item.label}</div>
          {!!metaBits.length && <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 500, fontSize: 11, color: 'rgba(36,26,51,.45)', marginTop: 2 }}>{metaBits.join(' · ')}</div>}
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
    <div className={'graphic-support' + (entering ? ' is-entering' : '')}>
      <header className="graphic-support-header"><span>HOMEQUEST</span><button onClick={onBack} aria-label="Back to rooms">←</button></header>
      <section className="graphic-support-title"><h1><span className="graphic-line"><span>SHOPPING</span></span></h1><p>{open.length} {open.length === 1 ? 'thing' : 'things'} to buy</p></section>
      <button className="graphic-add" onClick={onAdd}>＋ ADD AN ITEM</button>
      {!items.length && <div style={{ padding: '36px 18px', borderRadius: 16, color: matText75, background: theme.cream, textAlign: 'center', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 500, fontSize: 14 }}>nothing to buy yet.</div>}
      {!!items.length && <div style={{ overflow: 'hidden', borderRadius: 16, background: theme.cream }}>{open.map(renderItem)}{bought.length > 0 && <div style={{ padding: '12px 14px 5px', fontWeight: 600, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(36,26,51,.42)' }}>bought</div>}{bought.map(renderItem)}</div>}
    </div>
  );
}
