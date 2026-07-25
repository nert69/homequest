export default function Toast({ toast, theme }) {
  return (
    <div style={{
      position: 'fixed', bottom: 'max(84px, calc(env(safe-area-inset-bottom) + 60px))', left: '50%', zIndex: 70,
      display: 'flex', alignItems: 'center', gap: 12,
      maxWidth: 'calc(100vw - 40px)',
      fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14,
      color: '#FFFCF3', background: '#241A33',
      padding: toast.onAction ? '10px 10px 10px 18px' : '12px 20px',
      borderRadius: 14,
      boxShadow: '0 12px 28px -10px rgba(36,26,51,.55)',
      animation: `hq-toast ${toast.onAction ? 4.5 : 1.9}s ease forwards`,
      transform: 'translate(-50%,0)',
    }}>
      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{toast.msg}</span>
      {toast.onAction && (
        <button
          style={{
            flexShrink: 0, border: 'none', borderRadius: 10, padding: '8px 14px',
            color: '#241A33', background: theme.accent,
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer',
          }}
          onClick={toast.onAction}
        >Undo</button>
      )}
    </div>
  );
}
