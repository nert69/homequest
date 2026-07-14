export default function Celebration({ celebration: c, theme }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 65, pointerEvents: 'none', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(36,26,51,.34)', animation: `hq-fade ${c.duration}s ease forwards` }} />
      <div style={{
        position: 'absolute', top: '44%', left: '50%', width: 360, height: 360, transform: 'translate(-50%,-50%)',
        borderRadius: '50%', opacity: .25,
        background: `repeating-conic-gradient(${c.accent} 0 10deg, transparent 10deg 22deg)`,
        WebkitMask: 'radial-gradient(circle,#000 26%,transparent 68%)',
        mask: 'radial-gradient(circle,#000 26%,transparent 68%)',
        animation: `hq-rays ${c.duration}s linear forwards`,
      }} />
      <div style={{
        position: 'absolute', top: '44%', left: '50%', width: c.stickerSize, height: c.stickerSize,
        animation: `hq-pop ${c.duration}s cubic-bezier(.2,1.3,.4,1) forwards`,
        filter: 'drop-shadow(2px 4px 2px rgba(36,26,51,.45))',
        background: c.shapeColor, borderRadius: '50%',
      }} />
      <div style={{
        position: 'absolute', top: '62%', left: '50%', background: '#241A33', border: `3px solid ${theme.accent}`,
        borderRadius: 8, padding: '9px 20px', fontWeight: 800, fontSize: 14, color: theme.accent,
        textTransform: 'uppercase', letterSpacing: '.5px', whiteSpace: 'nowrap',
        animation: `hq-ribbon ${c.duration}s ease forwards`,
      }}>{c.label}</div>
      {c.particles.map((p) => (
        <div key={p.id} style={{
          position: 'absolute', top: '44%', left: '50%', width: 11, height: 15, borderRadius: p.radius, background: p.color,
          animation: `hq-confetti ${p.duration}ms cubic-bezier(.15,.7,.3,1) forwards`,
          animationDelay: `${p.delay}ms`,
          '--tx': `${p.tx}px`, '--ty': `${p.ty}px`, '--rot': `${p.rot}deg`,
        }} />
      ))}
    </div>
  );
}
