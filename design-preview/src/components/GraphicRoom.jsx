import GraphicArt from './GraphicArt.jsx';
function TaskRow({t}) {
 return <div className="graphic-job" data-complete={t.isDone}>
   <div className="graphic-job-line">
     <button className="graphic-check" aria-label={t.isDone?'Mark '+t.label+' as not done':'Complete '+t.label} aria-pressed={t.isDone} onClick={t.onToggle}>{t.isDone?<svg className="graphic-tick" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4.5 4.5L19 7"/></svg>:t.checkMark?<svg className="graphic-partial" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg>:null}</button>
     <button className="graphic-job-label" onClick={t.hasSubs?t.onToggleExpand:t.onEdit}><span>{t.label}</span>{t.hasSubs&&<small>{t.subCountLabel}</small>}{t.isStuck&&<small>Stuck{t.stuckReason?' · '+t.stuckReason:''}</small>}{t.notePreview&&<small>{t.notePreview}</small>}</button>
     <button className="graphic-job-options" onClick={t.onEdit} aria-label={'Edit '+t.label}>•••</button>
   </div>
   {t.chevOpen&&<div className="graphic-subtasks">{t.subsView.map(s=><div key={s.id}><button onClick={s.onToggle} aria-label={'Toggle '+s.label}>{s.checkMark?'✓':'○'}</button><span>{s.label}</span><button onClick={s.onDelete} aria-label={'Delete '+s.label}>×</button></div>)}</div>}
 </div>;
}
export default function GraphicRoom({roomDetail:r,onBack,onRename,onDelete,onShopping,onHistory}) {
 return <main className="graphic-room"><header className="graphic-header"><span>HOMEQUEST</span><button onClick={onBack} aria-label="Back to rooms">←</button></header><section className="graphic-room-hero"><div className="graphic-card-top"><span className="graphic-number">{String(r.number).padStart(2,'0')}</span><h1>{r.name}</h1></div><GraphicArt name={r.name}/><p className="graphic-count" aria-live="polite" key={r.done}>{r.done} / {r.total}</p></section><div className="graphic-room-tools"><button onClick={r.onToggleHideDone}>{r.hideDoneLabel}</button><details><summary aria-label="Room settings">•••</summary><button onClick={onRename}>Rename room</button><button onClick={onDelete}>Delete room</button></details></div><div className="graphic-tasks" data-jobs-list={r.id}>{r.tasksView.map(t=><TaskRow key={t.id} t={t}/>)}</div>{r.allClear&&<p className="graphic-empty">All done in here.</p>}<button className="graphic-add" onClick={r.onAddJob}>＋ ADD A JOB</button><nav className="graphic-nav"><button onClick={onBack}>ROOMS</button><button onClick={onShopping}>SHOPPING</button><button onClick={onHistory}>DONE</button></nav></main>;
}
