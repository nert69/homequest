export default function ConfirmDialog({ confirm, theme, onCancel, onStop }) {
  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '100dvh', zIndex: 90,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, boxSizing: 'border-box',
        background: 'transparent',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: '100%', maxWidth: 340, boxSizing: 'border-box',
          background: theme.cream, border: '1px solid rgba(36,26,51,.14)', borderRadius: 24, padding: 24,
          boxShadow: '0 24px 60px -18px rgba(36,26,51,.55), 0 0 0 1px rgba(255,255,255,.45)',
          animation: 'hq-dialog .2s cubic-bezier(.2,1.1,.4,1)',
        }}
        onClick={onStop}
      >
        <div style={{ fontWeight: 800, fontSize: 20, color: '#241A33', lineHeight: 1.2 }}>{confirm.title}</div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, lineHeight: 1.5, color: 'rgba(36,26,51,.6)', marginTop: 8 }}>{confirm.body}</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button
            style={{ flex: 1, fontWeight: 600, fontSize: 15, color: 'rgba(36,26,51,.65)', background: 'rgba(36,26,51,.08)', border: 'none', borderRadius: 14, padding: 13, cursor: 'pointer' }}
            onClick={onCancel}
          >Cancel</button>
          <button
            style={{ flex: 1, fontWeight: 700, fontSize: 15, color: '#FFFCF3', background: '#E2542D', border: 'none', borderRadius: 14, padding: 13, cursor: 'pointer' }}
            onClick={confirm.onConfirm}
          >{confirm.confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
