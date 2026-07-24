import MaterialIcon from './MaterialIcon.jsx';

function TaskRow({ t }) {
  return (
    <div style={{ borderBottom: '1px solid rgba(36,26,51,.08)' }} data-task-row={t.id}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '13px 12px 13px 14px', background: t.rowBg }}>
        <button
          aria-label={t.isDone ? 'Mark as not done' : 'Update task progress'}
          className="hq-task-check"
          data-done={t.isDone}
          style={{ width: 40, height: 40, borderRadius: '50%', border: t.checkBorder, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Material Symbols Rounded'", fontVariationSettings: "'FILL' 1", fontSize: 16, fontWeight: 800, background: t.checkBg, color: t.checkColor, padding: 0, cursor: 'pointer' }}
          onClick={t.onToggle}
        >{t.checkMark}</button>
        <button
          style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', padding: 0, textAlign: 'left', cursor: t.hasSubs ? 'pointer' : 'default' }}
          onClick={t.hasSubs ? t.onToggleExpand : undefined}
        >
          <span style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, lineHeight: 1.35, color: t.labelColor, textDecoration: t.strike }}>
            {t.label}{t.hasSubs && <span style={{ fontWeight: 700, fontSize: 11, color: 'rgba(36,26,51,.42)', marginLeft: 7 }}>{t.subCountLabel}</span>}
          </span>
{t.isStuck && <span style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 11, color: '#B64225', marginTop: 3 }}>stuck{t.stuckReason ? ` · ${t.stuckReason}` : ''}</span>}
{t.notePreview && <span style={{ display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 1, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 11, lineHeight: 1.35, color: 'rgba(36,26,51,.52)', marginTop: 3 }}>{t.notePreview}</span>}
        </button>
        <button aria-label="Task options" style={{ width: 40, height: 40, border: 'none', background: 'transparent', color: 'rgba(36,26,51,.48)', fontSize: 20, cursor: 'pointer', borderRadius: 10, flexShrink: 0, padding: 0 }} onClick={t.onEdit}>&#8943;</button>
      </div>
      {t.chevOpen && (
        <div style={{ padding: '2px 16px 12px 52px' }}>
          {t.subsView.map((s) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', borderRadius: 10 }}>
              <button style={{ width: 32, height: 32, borderRadius: '50%', border: s.checkBorder, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Material Symbols Rounded'", fontVariationSettings: "'FILL' 1", fontSize: 13, fontWeight: 800, background: s.checkBg, color: s.checkColor, padding: 0, cursor: 'pointer' }} onClick={s.onToggle}>{s.checkMark}</button>
              <span style={{ flex: 1, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13, color: s.labelColor, textDecoration: s.strike, cursor: 'pointer' }} onClick={s.onToggle}>{s.label}</span>
              <button aria-label="Delete step" style={{ border: 'none', background: 'transparent', color: 'rgba(36,26,51,.35)', fontSize: 15, cursor: 'pointer', padding: '0 4px' }} onClick={s.onDelete}>&#215;</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default function RoomDetail({ theme, matText75, roomDetail: rd, onBack, onRename, onDelete }) {
  return (
    <div>
      {/* Pinned so the job list scrolls under a deliberate header rather than
          being clipped by the iOS status bar. */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: theme.mat, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 10, paddingBottom: 12, marginBottom: 4 }}>
        <button style={{ width: 44, height: 44, borderRadius: 999, background: theme.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none', padding: 0, flexShrink: 0 }} onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#241A33" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="hq-linkbtn" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 12, color: matText75, background: 'transparent', border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer' }} onClick={onRename}>rename</button>
          <button className="hq-linkbtn-danger" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 12, color: matText75, background: 'transparent', border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer' }} onClick={onDelete}>delete room</button>
        </div>
      </div>

      <div style={{ borderRadius: 18, padding: 16, background: rd.bg, color: rd.textColor }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: rd.tileBg, flexShrink: 0 }}>
            <MaterialIcon name={rd.icon} size={28} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 20, lineHeight: 1.1 }}>{rd.name}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 12, opacity: .8, marginTop: 3 }}>{rd.stage.label} · {rd.done}/{rd.total} done</div>
          </div>
          <div style={{ fontWeight: 800, fontSize: 22, flexShrink: 0 }}>{rd.pct}%</div>
        </div>
        <div style={{ height: 10, borderRadius: 999, overflow: 'hidden', marginTop: 13, background: rd.barTrack }}>
          <div style={{ height: '100%', borderRadius: 999, width: `${rd.pct}%`, background: rd.textColor, transition: 'width .5s ease' }} />
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.2em', color: matText75 }}>to do &#183; {rd.left} left</div>
          <button style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 11, padding: '6px 12px', borderRadius: 999, border: '1.5px solid rgba(36,26,51,.18)', cursor: 'pointer', background: rd.hideDoneBg, color: rd.hideDoneColor }} onClick={rd.onToggleHideDone}>{rd.hideDoneLabel}</button>
        </div>
        {rd.allClear && (
          <div style={{ textAlign: 'center', color: matText75, fontWeight: 700, fontSize: 13, padding: '26px 0' }}>all done in here &#10003;</div>
        )}
        <div style={{ background: theme.cream, borderRadius: 16, overflow: 'hidden' }} data-jobs-list={rd.id}>
          {rd.tasksView.map((t) => <TaskRow key={t.id} t={t} />)}
        </div>
        <button className="hq-linkbtn" style={{ marginTop: 14, background: 'transparent', border: 'none', color: matText75, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: '6px 4px' }} onClick={rd.onAddJob}>+ add a job</button>
      </div>
    </div>
  );
}




