import { useState } from 'react';

export default function OnboardSheet({ onCreate, onConfirmCreate, onJoin, joinError, busy }) {
  const [mode, setMode] = useState(null); // null | 'create' | 'join'
  const [code, setCode] = useState('');
  const [createdCode, setCreatedCode] = useState(null);

  const startCreate = () => { setCreatedCode(onCreate()); setMode('create'); };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(33,30,24,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 90, padding: 20, boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: 380, background: '#FFFCF3', borderRadius: 24, padding: 24, boxSizing: 'border-box' }}>
        {mode === null && (
          <>
            <div style={{ fontWeight: 800, fontSize: 22, color: '#241A33', marginBottom: 8 }}>set up your household</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(36,26,51,.65)', lineHeight: 1.5, marginBottom: 20 }}>
              so you and your partner see the same progress on both phones. whoever opens the app first starts a household; the other joins with the code.
            </div>
            <button style={{ width: '100%', fontWeight: 700, fontSize: 15, color: '#241A33', background: '#E8A93F', border: 'none', borderRadius: 14, padding: 14, cursor: 'pointer', marginBottom: 10 }} onClick={startCreate}>start a new household</button>
            <button style={{ width: '100%', fontWeight: 600, fontSize: 15, color: 'rgba(36,26,51,.75)', background: 'rgba(36,26,51,.08)', border: 'none', borderRadius: 14, padding: 14, cursor: 'pointer' }} onClick={() => setMode('join')}>i have a code from my partner</button>
          </>
        )}

        {mode === 'create' && (
          <>
            <div style={{ fontWeight: 800, fontSize: 22, color: '#241A33', marginBottom: 8 }}>your household code</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(36,26,51,.65)', lineHeight: 1.5, marginBottom: 16 }}>
              send this to your partner - they'll enter it when they open the app.
            </div>
            <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 34, letterSpacing: '.1em', color: '#241A33', background: 'rgba(36,26,51,.06)', borderRadius: 14, padding: '18px 0', marginBottom: 20 }}>{createdCode}</div>
            <button style={{ width: '100%', fontWeight: 700, fontSize: 15, color: '#241A33', background: '#E8A93F', border: 'none', borderRadius: 14, padding: 14, cursor: 'pointer' }} onClick={() => onConfirmCreate(createdCode)} disabled={busy}>continue</button>
          </>
        )}

        {mode === 'join' && (
          <>
            <div style={{ fontWeight: 800, fontSize: 22, color: '#241A33', marginBottom: 8 }}>enter your code</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(36,26,51,.65)', lineHeight: 1.5, marginBottom: 16 }}>
              the 6-character code your partner shared with you.
            </div>
            <input
              style={{ width: '100%', textAlign: 'center', fontWeight: 800, fontSize: 22, letterSpacing: '.15em', textTransform: 'uppercase', color: '#241A33', background: '#fff', border: '2px solid rgba(36,26,51,.15)', borderRadius: 14, padding: '14px 10px', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif", marginBottom: 10 }}
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              autoFocus
              placeholder="ABC123"
            />
            {joinError && <div style={{ color: '#E2542D', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>{joinError}</div>}
            <button style={{ width: '100%', fontWeight: 700, fontSize: 15, color: '#241A33', background: '#E8A93F', border: 'none', borderRadius: 14, padding: 14, cursor: 'pointer', marginBottom: 10, opacity: code.length === 6 ? 1 : .5 }} onClick={() => onJoin(code)} disabled={code.length !== 6 || busy}>{busy ? 'joining...' : 'continue'}</button>
            <button style={{ width: '100%', fontWeight: 600, fontSize: 14, color: 'rgba(36,26,51,.6)', background: 'transparent', border: 'none', padding: 8, cursor: 'pointer' }} onClick={() => setMode(null)}>back</button>
          </>
        )}
      </div>
    </div>
  );
}


