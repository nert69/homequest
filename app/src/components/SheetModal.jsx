export default function SheetModal({ sheet, onClose, onStop, onNameChange, onRoomChange, onCostChange, onStatusChange, onKeyDown, onSave, onDelete }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(33,30,24,.42)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 80 }} onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 480, background: '#FFFCF3', borderRadius: '24px 24px 0 0', padding: '24px 20px calc(env(safe-area-inset-bottom) + 34px)', animation: 'hq-sheet .26s cubic-bezier(.16,1,.3,1)', boxSizing: 'border-box' }} onClick={onStop}>
        <div style={{ fontWeight: 700, fontSize: 20, color: '#241A33', marginBottom: 16 }}>{sheet.title}</div>

        <div style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em', color: 'rgba(36,26,51,.55)', margin: '0 2px 6px' }}>{sheet.fieldLabel}</div>
        <input
          className="hq-field"
          style={{ width: '100%', fontWeight: 500, fontSize: 15, color: '#241A33', background: '#fff', border: '2px solid rgba(36,26,51,.15)', borderRadius: 14, padding: '12px 14px', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" }}
          placeholder={sheet.placeholder}
          value={sheet.name}
          onChange={onNameChange}
          onKeyDown={onKeyDown}
          autoFocus
          inputMode={sheet.inputMode}
        />

        {sheet.showRoomPick && (
          <>
            <div style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em', color: 'rgba(36,26,51,.55)', margin: '12px 2px 6px' }}>Room</div>
            <select
              className="hq-field"
              style={{ width: '100%', fontWeight: 500, fontSize: 15, color: '#241A33', background: '#fff', border: '2px solid rgba(36,26,51,.15)', borderRadius: 14, padding: '12px 14px', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" }}
              value={sheet.roomId}
              onChange={onRoomChange}
            >
              {sheet.roomOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </>
        )}

        {sheet.showCostStatus && (
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em', color: 'rgba(36,26,51,.55)', margin: '0 2px 6px' }}>Estimated cost</div>
              <div style={{ display: 'flex', alignItems: 'center', border: '2px solid rgba(36,26,51,.15)', borderRadius: 14, background: '#fff', paddingLeft: 12, boxSizing: 'border-box' }}>
                <span style={{ color: 'rgba(36,26,51,.4)', fontWeight: 700, fontFamily: "'DM Sans', sans-serif", fontSize: 15, lineHeight: 1 }}>&#163;</span>
                <input
                  className="hq-field"
                  style={{ border: 'none', flex: 1, width: 0, padding: '12px 14px 12px 4px', fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#241A33', background: 'transparent', boxSizing: 'border-box' }}
                  type="number" inputMode="numeric" placeholder="0" value={sheet.cost} onChange={onCostChange}
                />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em', color: 'rgba(36,26,51,.55)', margin: '0 2px 6px' }}>Status</div>
              <select
                className="hq-field"
                style={{ width: '100%', fontWeight: 500, fontSize: 15, color: '#241A33', background: '#fff', border: '2px solid rgba(36,26,51,.15)', borderRadius: 14, padding: '12px 14px', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" }}
                value={sheet.status}
                onChange={onStatusChange}
              >
                <option value="todo">To do</option>
                <option value="doing">Doing</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button style={{ flexShrink: 0, fontWeight: 600, fontSize: 14, color: 'rgba(36,26,51,.65)', background: 'rgba(36,26,51,.08)', border: 'none', borderRadius: 14, padding: '12px 20px', cursor: 'pointer' }} onClick={onClose}>Cancel</button>
          {sheet.showDelete && (
            <button style={{ flexShrink: 0, fontWeight: 700, fontSize: 14, color: '#fff', background: '#E2542D', border: 'none', borderRadius: 14, padding: '12px 18px', cursor: 'pointer' }} onClick={onDelete}>Delete</button>
          )}
          <button style={{ flex: 1, fontWeight: 600, fontSize: 15, color: '#241A33', background: sheet.accent, border: 'none', borderRadius: 14, padding: 12, cursor: 'pointer' }} onClick={onSave}>{sheet.saveLabel}</button>
        </div>
      </div>
    </div>
  );
}
