import MaterialIcon from './MaterialIcon.jsx';
import useEntering from '../hooks/useEntering.js';
import DoneCalendar from './DoneCalendar.jsx';

function dateLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'date unavailable';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).toLowerCase();
}

export default function HistoryList({ theme, matText75, entries, onBack }) {
  const groups = entries.reduce((all, entry) => {
    const label = dateLabel(entry.completedAt);
    const latest = all[all.length - 1];
    if (latest && latest.label === label) latest.entries.push(entry);
    else all.push({ label, entries: [entry] });
    return all;
  }, []);
  const entering = useEntering();
  let row = 0;

  return (
    <div className={'graphic-support' + (entering ? ' is-entering' : '')}>
      <header className="graphic-support-header"><span>HOMEQUEST</span><button onClick={onBack} aria-label="Back to rooms">←</button></header>
      <section className="graphic-support-title"><h1><span className="graphic-line"><span>DONE</span></span></h1><p>{entries.length} jobs finished</p></section>
      <DoneCalendar entries={entries} />
      
      {!entries.length && (
        <div style={{ padding: '36px 22px', textAlign: 'center', borderRadius: 18, background: theme.cream, color: 'rgba(36,26,51,.55)' }}>
          <MaterialIcon name="history" size={28} />
          <div style={{ fontWeight: 600, fontSize: 15, marginTop: 8 }}>nothing here yet</div>
          <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 600, fontSize: 12, marginTop: 4 }}>finished jobs will appear here automatically.</div>
        </div>
      )}

      {groups.map((group) => (
        <section key={group.label} style={{ marginBottom: 20 }}>
          <div style={{ margin: '0 2px 8px', color: matText75, fontSize: 10, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase' }}>{group.label}</div>
          <div style={{ overflow: 'hidden', borderRadius: 16, background: theme.cream }}>
            {group.entries.map((entry, index) => (
              <div key={entry.id} className="graphic-row" style={{ '--i': row++, display: 'flex', alignItems: 'center', gap: 11, padding: '13px 14px', borderBottom: index < group.entries.length - 1 ? '1px solid rgba(36,26,51,.08)' : 'none' }}>
                <span className="graphic-done-badge" style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: theme.accent, background: '#241A33' }}><MaterialIcon name="check" size={17} /></span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ overflowWrap: 'anywhere', color: '#241A33', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 14, fontWeight: 500, lineHeight: 1.3 }}>{entry.label}</div>
                  <div style={{ marginTop: 2, color: 'rgba(36,26,51,.5)', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 11, fontWeight: 500 }}>{entry.roomName}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}



