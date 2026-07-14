import { THEMES } from '../data.js';

const LABELS = { camp: 'Camp', sunset: 'Sunset', ocean: 'Ocean' };

export default function SettingsSheet({ themeKey, onPick, onClose, onStop, householdCode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(33,30,24,.42)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 80 }} onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 480, background: '#FFFCF3', borderRadius: '24px 24px 0 0', padding: '24px 20px calc(env(safe-area-inset-bottom) + 34px)', animation: 'hq-sheet .26s cubic-bezier(.16,1,.3,1)', boxSizing: 'border-box' }} onClick={onStop}>
        <div style={{ fontWeight: 700, fontSize: 20, color: '#241A33', marginBottom: 16 }}>Pick a vibe</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.keys(THEMES).map((key) => {
            const t = THEMES[key];
            const active = key === themeKey;
            return (
              <button
                key={key}
                onClick={() => onPick(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14,
                  border: active ? '2px solid #241A33' : '2px solid rgba(36,26,51,.12)',
                  background: t.cream, cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', gap: 4 }}>
                  {t.palette.slice(0, 4).map((c, i) => (
                    <div key={i} style={{ width: 18, height: 18, borderRadius: '50%', background: c }} />
                  ))}
                </div>
                <div style={{ flex: 1, fontWeight: 800, fontSize: 15, color: '#241A33' }}>{LABELS[key]}</div>
                {active && <span style={{ fontWeight: 800, fontSize: 13, color: '#241A33' }}>&#10003;</span>}
              </button>
            );
          })}
        </div>
        {householdCode && (
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(36,26,51,.1)' }}>
            <div style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(36,26,51,.5)', marginBottom: 6 }}>Household code</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(36,26,51,.65)', marginBottom: 8 }}>Share this so a new phone can join and see the same progress.</div>
            <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: '.15em', color: '#241A33' }}>{householdCode}</div>
          </div>
        )}
        <button style={{ marginTop: 16, width: '100%', fontWeight: 600, fontSize: 14, color: 'rgba(36,26,51,.65)', background: 'rgba(36,26,51,.08)', border: 'none', borderRadius: 14, padding: 12, cursor: 'pointer' }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
