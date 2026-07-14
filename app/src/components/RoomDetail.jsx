import MaterialIcon from './MaterialIcon.jsx';

function TaskRow({ t }) {
  return (
    <div style={{ borderBottom: '1px solid rgba(36,26,51,.08)' }} data-task-row={t.id}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 16px 12px 10px', cursor: 'pointer', background: t.rowBg }}>
        <div
          style={{ width: 20, height: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Material Symbols Rounded'", fontSize: 19, color: 'rgba(36,26,51,.28)', cursor: 'grab', touchAction: 'none' }}
          onPointerDown={t.onDragStart}
        >drag_indicator</div>
        <div
          style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Material Symbols Rounded'", fontVariationSettings: "'FILL' 1", fontSize: 16, fontWeight: 800, background: t.checkBg, color: t.checkColor, border: t.checkBorder }}
          onClick={t.onToggle}
        >{t.checkMark}</div>
        <span style={{ flex: 1, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, lineHeight: 1.4, color: t.labelColor, textDecoration: t.strike }} onClick={t.onToggle}>
          {t.label}
          {t.hasSubs && <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 11, color: 'rgba(36,26,51,.4)', marginLeft: 7 }}>{t.subCountLabel}</span>}
        </span>
        {t.hasSubs && (
          <button
            style={{ width: 24, height: 24, border: 'none', background: 'transparent', color: 'rgba(36,26,51,.45)', fontFamily: "'Material Symbols Rounded'", fontSize: 19, cursor: 'pointer', flexShrink: 0, padding: 0, transform: t.chevronRotate }}
            onClick={t.onToggleExpand}
          >expand_more</button>
        )}
        {t.showActions && (
          <>
            <button style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 11, color: t.costColor, background: 'rgba(36,26,51,.06)', border: 'none', borderRadius: 999, padding: '5px 10px', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }} onClick={t.onCostClick}>{t.costLabel}</button>
            <button style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 11, color: 'rgba(36,26,51,.55)', background: 'rgba(36,26,51,.06)', border: 'none', borderRadius: 999, padding: '5px 10px', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }} onClick={t.onStepsClick}>+ steps</button>
          </>
        )}
        <button style={{ width: 28, height: 28, border: 'none', background: 'transparent', color: 'rgba(36,26,51,.4)', fontSize: 17, cursor: 'pointer', borderRadius: 8, flexShrink: 0, padding: 0 }} onClick={t.onEdit}>&#8943;</button>
      </div>
      {t.chevOpen && (
        <div style={{ padding: '2px 16px 12px 45px' }}>
          {t.subsView.map((s) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', cursor: 'pointer', borderRadius: 10 }}>
              <div
                style={{ width: 21, height: 21, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Material Symbols Rounded'", fontVariationSettings: "'FILL' 1", fontSize: 13, fontWeight: 800, background: s.checkBg, color: s.checkColor, border: s.checkBorder }}
                onClick={s.onToggle}
              >{s.checkMark}</div>
              <span style={{ flex: 1, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13, color: s.labelColor, textDecoration: s.strike }} onClick={s.onToggle}>{s.label}</span>
              <button style={{ border: 'none', background: 'transparent', color: 'rgba(36,26,51,.35)', fontSize: 15, cursor: 'pointer', padding: '0 4px' }} onClick={s.onDelete}>&#215;</button>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', padding: '8px 6px 8px 31px', cursor: 'pointer', opacity: .65 }} onClick={t.onStepsClick}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13, color: 'rgba(36,26,51,.5)' }}>+ add a step</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RoomDetail({ theme, matText75, roomDetail: rd, onBack, onRename, onDelete }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 14 }}>
        <button style={{ width: 44, height: 44, borderRadius: 999, background: theme.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none', padding: 0, flexShrink: 0 }} onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#241A33" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="hq-linkbtn" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 12, color: matText75, background: 'transparent', border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer' }} onClick={onRename}>Rename</button>
          <button className="hq-linkbtn-danger" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 12, color: matText75, background: 'transparent', border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer' }} onClick={onDelete}>Delete room</button>
        </div>
      </div>

      <div style={{ borderRadius: 18, padding: 16, background: rd.bg, color: rd.textColor }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: rd.tileBg, flexShrink: 0 }}>
            <MaterialIcon name={rd.icon} size={28} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 20, lineHeight: 1.1 }}>{rd.name}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 12, opacity: .8, marginTop: 3 }}>{rd.done} of {rd.total} done</div>
          </div>
          <div style={{ fontWeight: 800, fontSize: 22, flexShrink: 0 }}>{rd.pct}%</div>
        </div>
        <div style={{ height: 10, borderRadius: 999, overflow: 'hidden', marginTop: 13, background: rd.barTrack }}>
          <div style={{ height: '100%', borderRadius: 999, width: `${rd.pct}%`, background: rd.textColor, transition: 'width .5s ease' }} />
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.2em', color: matText75 }}>To do &#183; {rd.left} left</div>
          <button style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 11, padding: '6px 12px', borderRadius: 999, border: '1.5px solid rgba(36,26,51,.18)', cursor: 'pointer', background: rd.hideDoneBg, color: rd.hideDoneColor }} onClick={rd.onToggleHideDone}>{rd.hideDoneLabel}</button>
        </div>
        {rd.allClear && (
          <div style={{ textAlign: 'center', color: matText75, fontWeight: 700, fontSize: 13, padding: '26px 0' }}>All done in here &#10003;</div>
        )}
        <div style={{ background: theme.cream, borderRadius: 16, overflow: 'hidden' }} data-jobs-list={rd.id}>
          {rd.tasksView.map((t) => <TaskRow key={t.id} t={t} />)}
        </div>
        <button className="hq-linkbtn" style={{ marginTop: 14, background: 'transparent', border: 'none', color: matText75, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: '6px 4px' }} onClick={rd.onAddJob}>+ add a job</button>
      </div>
    </div>
  );
}
