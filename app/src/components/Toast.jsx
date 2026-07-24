export default function Toast({ toast, theme }) {
  return (
    <div style={{
      position: 'fixed', bottom: 'calc(env(safe-area-inset-bottom) + 40px)', left: '50%', zIndex: 70,
      display: 'flex', alignItems: 'center', gap: 14, fontWeight: 800, fontSize: 12,
      textTransform: 'uppercase', letterSpacing: '.5px', color: theme.accent,
      background: '#241A33', padding: toast.onAction ? '9px 10px 9px 18px' : '10px 22px', borderRadius: 10,
      border: `2px solid ${theme.accent}`, animation: `hq-toast ${toast.onAction ? 4.5 : 1.9}s ease forwards`,
      whiteSpace: 'nowrap', transform: 'translate(-50%,0)',
    }}>
      <span>{toast.msg}</span>
      {toast.onAction && <button style={{ border: 'none', borderRadius: 7, padding: '7px 10px', color: '#241A33', background: theme.accent, fontWeight: 800, fontSize: 11, cursor: 'pointer' }} onClick={toast.onAction}>undo</button>}
    </div>
  );
}

