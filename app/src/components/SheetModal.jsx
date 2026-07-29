import { useEffect, useRef } from 'react';
import MaterialIcon from './MaterialIcon.jsx';
import useModalScrollLock from '../hooks/useModalScrollLock.js';

export default function SheetModal({ sheet, onClose, onStop, onNameChange, onRoomChange, onStatusChange, onStuckReasonChange, onNotesChange, onLinkChange, onSourceChange, onKeyDown, onSave, onDelete, onAddStep, onMoveUp, onMoveDown }) {
  const autoFocus = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;
  const inputRef = useRef(null);
  useModalScrollLock('.hq-sheet');

  // Focused manually with preventScroll rather than via the autoFocus
  // attribute — the latter scrolls the page behind the sheet to bring the
  // field into view, which shunted the list up every time a sheet opened.
  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus({ preventScroll: true });
  }, [autoFocus]);

  // Keep the body's layout untouched so opening a sheet cannot jump the page.
  // useModalScrollLock cancels only gestures that would escape the sheet into
  // the page behind it, while still allowing a long sheet itself to scroll.
  // Sized with 100dvh rather than inset:0 — in Safari the latter tracks the
  // small viewport, leaving the sheet floating above the bottom of the screen
  // once the address bar collapses.
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '100dvh', width: '100%', overflow: 'hidden', overscrollBehavior: 'none', touchAction: 'none', background: 'transparent', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 80 }} onClick={onClose}>
      <div className="hq-sheet" style={{ width: '100%', maxWidth: 480, maxHeight: 'calc(100% - 8px)', overflowY: 'auto', overscrollBehavior: 'contain', touchAction: 'pan-y', background: '#FFFCF3', border: '1px solid rgba(36,26,51,.12)', boxShadow: '0 -18px 48px -24px rgba(36,26,51,.5)', borderRadius: '24px 24px 0 0', padding: '24px 20px max(52px, calc(env(safe-area-inset-bottom) + 32px))', animation: 'hq-sheet .26s cubic-bezier(.16,1,.3,1)', boxSizing: 'border-box' }} onClick={onStop}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderRadius: 18, padding: '14px 16px', color: sheet.titleText, background: sheet.accent, marginBottom: 18 }}>
          <span aria-hidden="true" style={{ width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: sheet.titleBadgeBg }}><MaterialIcon name={sheet.icon} size={21} /></span>
          <div style={{ fontWeight: 800, fontSize: 19 }}>{sheet.title}</div>
        </div>

        <div className="hq-field-label">{sheet.fieldLabel}</div>
        <input ref={inputRef} className="hq-field" style={fieldStyle} placeholder={sheet.placeholder} value={sheet.name} onChange={onNameChange} onKeyDown={onKeyDown} inputMode={sheet.inputMode} />

        {sheet.showRoomPick && (
          <>
            <div className="hq-field-label" style={{ marginTop: 12 }}>room</div>
            <select className="hq-field" style={fieldStyle} value={sheet.roomId} onChange={onRoomChange}>
              {sheet.roomOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </>
        )}

        {sheet.showStatus && (
          <div style={{ marginTop: 12 }}>
            <div className="hq-field-label">status</div>
            <select className="hq-field" style={fieldStyle} value={sheet.status} onChange={onStatusChange}>
              <option value="todo">to do</option>
              <option value="doing">doing</option>
              <option value="stuck">stuck</option>
              <option value="done">done</option>
            </select>
          </div>
        )}

        {sheet.status === 'stuck' && (
          <div style={{ marginTop: 12 }}>
            <div className="hq-field-label">what is it waiting for? <span style={{ textTransform: 'none', letterSpacing: 0 }}>(optional)</span></div>
            <input className="hq-field" style={fieldStyle} placeholder="e.g. need the right drill bit" value={sheet.stuckReason} onChange={onStuckReasonChange} />
          </div>
        )}

        {sheet.showNotes && (
          <div style={{ marginTop: 12 }}>
            <div className="hq-field-label">notes <span style={{ textTransform: 'none', letterSpacing: 0 }}>(optional)</span></div>
            <textarea className="hq-field" style={{ ...fieldStyle, minHeight: 92, resize: 'vertical', lineHeight: 1.4 }} placeholder="measurements, paint colour, product link..." value={sheet.notes} onChange={onNotesChange} />
          </div>
        )}

        {sheet.showLink && (
          <div style={{ marginTop: 12 }}>
            <div className="hq-field-label">purchase link <span style={{ textTransform: 'none', letterSpacing: 0 }}>(optional)</span></div>
            <input className="hq-field" style={fieldStyle} placeholder="paste a link to buy it online…" value={sheet.link} onChange={onLinkChange} inputMode="url" />
          </div>
        )}

        {sheet.showSource && (
          <div style={{ marginTop: 12 }}>
            <div className="hq-field-label">from <span style={{ textTransform: 'none', letterSpacing: 0 }}>(optional)</span></div>
            <input className="hq-field" style={fieldStyle} placeholder="e.g. B&Q, Amazon, IKEA…" value={sheet.source} onChange={onSourceChange} />
          </div>
        )}
        {sheet.showEditActions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 14, flexWrap: 'wrap' }}>
            <button className="hq-action-button hq-action-button-primary" onClick={onAddStep}>+ add a step</button>
            <span style={{ flex: 1 }} />
            <button className="hq-action-button" onClick={onMoveUp}>&#8593; move up</button>
            <button className="hq-action-button" onClick={onMoveDown}>&#8595; move down</button>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button style={secondaryButtonStyle} onClick={onClose}>cancel</button>
          {sheet.showDelete && <button style={{ ...secondaryButtonStyle, color: '#fff', background: '#E2542D', fontWeight: 700 }} onClick={onDelete}>delete</button>}
          <button style={{ flex: 1, fontWeight: 700, fontSize: 15, color: sheet.titleText, background: sheet.accent, border: 'none', borderRadius: 14, padding: 12, cursor: 'pointer' }} onClick={onSave}>{sheet.saveLabel}</button>
        </div>
      </div>
    </div>
  );
}

const fieldStyle = { width: '100%', fontWeight: 600, fontSize: 15, color: '#241A33', background: 'rgba(36,26,51,.035)', border: '1.5px solid rgba(36,26,51,.13)', borderRadius: 14, padding: '12px 14px', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" };
const secondaryButtonStyle = { flexShrink: 0, fontWeight: 600, fontSize: 14, color: 'rgba(36,26,51,.65)', background: 'rgba(36,26,51,.08)', border: 'none', borderRadius: 14, padding: '12px 16px', cursor: 'pointer' };







