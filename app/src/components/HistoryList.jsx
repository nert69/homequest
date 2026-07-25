import MaterialIcon from './MaterialIcon.jsx';

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

  return (
    <div>
      <div style={{ position: 'sticky', top: 0, zIndex: 20, marginLeft: -16, marginRight: -16, marginBottom: 14, background: theme.cream, borderRadius: '0 0 22px 22px', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px 12px' }}>
        <button aria-label="Back home" style={{ width: 44, height: 44, borderRadius: 999, background: theme.mat, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none', padding: 0, flexShrink: 0 }} onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#241A33" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <div>
          <div style={{ fontWeight: 800, fontSize: 22 }}>Completed</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 12, color: matText75 }}>{entries.length} finished {entries.length === 1 ? 'job' : 'jobs'}</div>
        </div>
      </div>

      {!entries.length && (
        <div style={{ padding: '36px 22px', textAlign: 'center', borderRadius: 18, background: theme.cream, color: 'rgba(36,26,51,.55)' }}>
          <MaterialIcon name="history" size={28} />
          <div style={{ fontWeight: 800, fontSize: 15, marginTop: 8 }}>nothing here yet</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 12, marginTop: 4 }}>finished jobs will appear here automatically.</div>
        </div>
      )}

      {groups.map((group) => (
        <section key={group.label} style={{ marginBottom: 20 }}>
          <div style={{ margin: '0 2px 8px', color: matText75, fontSize: 10, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase' }}>{group.label}</div>
          <div style={{ overflow: 'hidden', borderRadius: 16, background: theme.cream }}>
            {group.entries.map((entry, index) => (
              <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '13px 14px', borderBottom: index < group.entries.length - 1 ? '1px solid rgba(36,26,51,.08)' : 'none' }}>
                <span style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: theme.accent, background: '#241A33' }}><MaterialIcon name="check" size={17} /></span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ overflowWrap: 'anywhere', color: '#241A33', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>{entry.label}</div>
                  <div style={{ marginTop: 2, color: 'rgba(36,26,51,.5)', fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700 }}>{entry.roomName}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}



