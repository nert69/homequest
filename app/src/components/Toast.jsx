export default function Toast({ toast, theme }) {
  return (
    <div style={{
      position: 'fixed', bottom: 'calc(env(safe-area-inset-bottom) + 40px)', left: '50%', zIndex: 70,
      fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.5px', color: theme.accent,
      background: '#241A33', padding: '10px 22px', borderRadius: 8, border: `2px solid ${theme.accent}`,
      animation: 'hq-toast 1.9s ease forwards', pointerEvents: 'none', whiteSpace: 'nowrap', transform: 'translate(-50%,0)',
    }}>{toast.msg}</div>
  );
}
