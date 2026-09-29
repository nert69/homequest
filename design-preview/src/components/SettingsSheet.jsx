export default function SettingsSheet({ onClose, onStop, householdCode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(33,30,24,.42)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 80 }} onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 480, background: '#FFFCF3', borderRadius: '24px 24px 0 0', padding: '24px 20px max(52px, calc(env(safe-area-inset-bottom) + 32px))', animation: 'hq-sheet .26s cubic-bezier(.16,1,.3,1)', boxSizing: 'border-box' }} onClick={onStop}>
        <div style={{ fontWeight: 800, fontSize: 20, color: '#241A33', marginBottom: 6 }}>your household</div>
        {householdCode ? (
          <>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(36,26,51,.65)', marginBottom: 12 }}>use this code to connect another phone to the same house.</div>
            <div style={{ padding: 16, borderRadius: 14, background: '#F3EFE5', fontWeight: 800, fontSize: 22, letterSpacing: '.15em', color: '#241A33', textAlign: 'center' }}>{householdCode}</div>
          </>
        ) : (
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(36,26,51,.65)' }}>household syncing is not connected on this device.</div>
        )}
        <button style={{ marginTop: 18, width: '100%', fontWeight: 700, fontSize: 14, color: '#241A33', background: 'rgba(36,26,51,.08)', border: 'none', borderRadius: 14, padding: 12, cursor: 'pointer' }} onClick={onClose}>close</button>
      </div>
    </div>
  );
}

