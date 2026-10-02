import { useState } from 'react';
import useModalScrollLock from '../hooks/useModalScrollLock.js';

// Household setup, styled as a full page in the graphic look (see
// graphic-household.css). Each step remounts its body so the entrance
// cascade plays again when moving between start / create / join.
function Title({ children }) {
  return <h1>{children.map((line) => <span key={line} className="graphic-line"><span>{line}</span></span>)}</h1>;
}

function CodeBoxes({ code }) {
  return <div className="graphic-code" aria-label={`Household code ${code.split('').join(' ')}`}>{code.split('').map((ch, i) => <span key={i} style={{ '--i': i }}>{ch}</span>)}</div>;
}

export default function OnboardSheet({ onCreate, onConfirmCreate, onJoin, joinError, busy }) {
  useModalScrollLock();
  const [mode, setMode] = useState(null); // null | 'create' | 'join'
  const [code, setCode] = useState('');
  const [createdCode, setCreatedCode] = useState(null);

  const startCreate = () => { setCreatedCode(onCreate()); setMode('create'); };

  return (
    <div className="graphic-household" role="dialog" aria-modal="true" aria-labelledby="household-title">
      <header className="graphic-support-header"><span>HOMEQUEST</span></header>
      <div className="graphic-household-body" key={mode || 'start'}>
        {mode === null && (
          <>
            <div id="household-title"><Title>{['SET UP YOUR', 'HOUSEHOLD.']}</Title></div>
            <p>So you and your partner see the same progress on both phones. Whoever opens the app first starts a household; the other joins with the code.</p>
            <button className="graphic-primary" onClick={startCreate}>START A NEW HOUSEHOLD</button>
            <button className="graphic-secondary" onClick={() => setMode('join')}>I HAVE A CODE FROM MY PARTNER</button>
          </>
        )}

        {mode === 'create' && (
          <>
            <div id="household-title"><Title>{['YOUR', 'HOUSEHOLD CODE.']}</Title></div>
            <p>Send this to your partner. They enter it when they first open the app. It's only shown here, so note it down.</p>
            <CodeBoxes code={createdCode} />
            <button className="graphic-primary" onClick={() => onConfirmCreate(createdCode)} disabled={busy}>CONTINUE</button>
          </>
        )}

        {mode === 'join' && (
          <>
            <div id="household-title"><Title>{['ENTER', 'YOUR CODE.']}</Title></div>
            <p>The 6-character code your partner shared with you.</p>
            <input
              className="graphic-code-input"
              aria-label="Household code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              autoFocus
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              placeholder="ABC123"
            />
            {joinError && <p className="graphic-household-error" role="alert">{joinError}</p>}
            <button className="graphic-primary" onClick={() => onJoin(code)} disabled={code.length !== 6 || busy}>{busy ? 'JOINING…' : 'CONTINUE'}</button>
            <button className="graphic-secondary" onClick={() => setMode(null)}>BACK</button>
          </>
        )}
      </div>
    </div>
  );
}
