import { useEffect, useRef } from 'react';
import GraphicArt from './GraphicArt.jsx';
const reduceMotion=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
// The done count rolls up (or down) to its new value like a small counter.
function RollNumber({value}) {
 const last=useRef({value,dir:null});
 if(last.current.value!==value) last.current={value,dir:value>last.current.value?'up':'down'};
 return <span className="graphic-roll"><span key={value} data-roll={last.current.dir||undefined}>{value}</span></span>;
}
function TaskRow({t}) {
 return <div className="graphic-job" data-complete={t.isDone}>
   <div className="graphic-job-line">
     <button className="graphic-check" data-partial={!t.isDone&&!!t.checkMark} aria-label={t.isDone?'Mark '+t.label+' as not done':'Complete '+t.label} aria-pressed={t.isDone} onClick={t.onToggle}><svg className="graphic-partial" viewBox="0 0 24 24" aria-hidden="true"><path pathLength="1" d="M6 12h12"/></svg><svg className="graphic-tick" viewBox="0 0 24 24" aria-hidden="true"><path pathLength="1" d="m5 12 4.5 4.5L19 7"/></svg></button>
     <button className="graphic-job-label" onClick={t.hasSubs?t.onToggleExpand:t.onEdit}><span>{t.label}</span>{t.hasSubs&&<small>{t.subCountLabel}</small>}{t.isStuck&&<small>Stuck{t.stuckReason?' · '+t.stuckReason:''}</small>}{t.notePreview&&<small>{t.notePreview}</small>}</button>
     <button className="graphic-job-options" onClick={t.onEdit} aria-label={'Edit '+t.label}>•••</button>
   </div>
   {t.chevOpen&&<div className="graphic-subtasks">{t.subsView.map(s=><div key={s.id}><button onClick={s.onToggle} aria-label={'Toggle '+s.label}>{s.checkMark?'✓':'○'}</button><span>{s.label}</span><button onClick={s.onDelete} aria-label={'Delete '+s.label}>×</button></div>)}</div>}
 </div>;
}
export default function GraphicRoom({roomDetail:r,onBack,onRename,onDelete,onShopping,onHistory}) {
 // The illustration gives a small nod whenever another job is ticked off.
 const hero=useRef(null), lastDone=useRef(r.done);
 useEffect(()=>{
  const prev=lastDone.current; lastDone.current=r.done;
  if(r.done<=prev||reduceMotion()) return;
  hero.current?.querySelector('.graphic-art')?.animate([
   {transform:'rotate(0) translateY(0)'},
   {transform:'rotate(-2.5deg) translateY(-3px)',offset:.3},
   {transform:'rotate(1.2deg) translateY(0)',offset:.65},
   {transform:'rotate(0) translateY(0)'},
  ],{duration:560,easing:'cubic-bezier(.3,.7,.3,1)'});
 },[r.done]);
 return <main className="graphic-room"><header className="graphic-header"><span>HOMEQUEST</span><button onClick={onBack} aria-label="Back to rooms">←</button></header><section className="graphic-room-hero" ref={hero} style={{viewTransitionName:'room-panel'}}><div className="graphic-card-top"><span className="graphic-number" style={{viewTransitionName:'room-number'}}>{String(r.number).padStart(2,'0')}</span><h1 style={{viewTransitionName:'room-title'}}>{r.name}</h1></div><GraphicArt name={r.name} morph="room-art"/><p className="graphic-count" aria-live="polite" style={{viewTransitionName:'room-count'}}><RollNumber value={r.done}/> / {r.total}</p></section><div className="graphic-room-tools"><button onClick={r.onToggleHideDone}>{r.hideDoneLabel}</button><details><summary aria-label="Room settings">•••</summary><button onClick={onRename}>Rename room</button><button onClick={onDelete}>Delete room</button></details></div><div className="graphic-tasks" data-jobs-list={r.id}>{r.tasksView.map(t=><TaskRow key={t.id} t={t}/>)}</div>{r.allClear&&<p className="graphic-empty">All done in here.</p>}<button className="graphic-add" onClick={r.onAddJob}>＋ ADD A JOB</button><nav className="graphic-nav"><button onClick={onBack}>ROOMS</button><button onClick={onShopping}>SHOPPING</button><button onClick={onHistory}>DONE</button></nav></main>;
}
