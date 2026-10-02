// A GitHub-style grid of the last 26 weeks on the Done screen: one square per
// day (Monday at the top), lit lime by how many jobs were finished that day,
// with the current streak above it. Squares cascade in by week and lit ones
// pop on a spring (graphic-motion.css section 10).
const WEEKS = 26;
const DAY = 86400000;
const key = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const midnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export default function DoneCalendar({ entries }) {
  const counts = new Map();
  for (const e of entries) {
    const d = new Date(e.completedAt);
    if (Number.isNaN(d.getTime())) continue;
    counts.set(key(d), (counts.get(key(d)) || 0) + 1);
  }

  const today = midnight(new Date());
  const monday = new Date(today.getTime() - ((today.getDay() + 6) % 7) * DAY);
  const first = new Date(monday.getTime() - (WEEKS - 1) * 7 * DAY);
  // Day steps via setDate so clock changes never skip or repeat a day.
  const dayAt = (week, dow) => { const d = new Date(first); d.setDate(first.getDate() + week * 7 + dow); return d; };

  const cells = [], months = [];
  let lastMonth = -1, activeDays = 0;
  for (let w = 0; w < WEEKS; w++) {
    const m = dayAt(w, 0).getMonth();
    if (m !== lastMonth) { months.push({ w, label: dayAt(w, 0).toLocaleDateString('en-GB', { month: 'short' }).slice(0, 3) }); lastMonth = m; }
    for (let dow = 0; dow < 7; dow++) {
      const d = dayAt(w, dow);
      const future = d > today;
      const n = future ? 0 : counts.get(key(d)) || 0;
      if (n) activeDays++;
      cells.push({ w, dow, n, future, today: d.getTime() === today.getTime(), label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) });
    }
  }

  // Streak: consecutive days with a finished job, ending today (or yesterday,
  // so it isn't lost before today's first job).
  let streak = 0;
  const start = counts.get(key(today)) ? today : new Date(today.getTime() - DAY);
  for (let d = midnight(start); counts.get(key(d)); d.setDate(d.getDate() - 1)) streak++;

  const level = (n) => (n >= 3 ? 3 : n);
  return (
    <section className="graphic-calendar" aria-label={`${activeDays} active days in the last ${WEEKS} weeks, ${streak}-day streak`}>
      <p className="graphic-calendar-stats">
        <span>{streak ? `${streak}-DAY STREAK` : 'NO STREAK YET'}</span>
        <span>{activeDays} {activeDays === 1 ? 'DAY' : 'DAYS'} ACTIVE</span>
      </p>
      <div className="graphic-calendar-panel" role="img">
        <div className="graphic-calendar-months" style={{ '--weeks': WEEKS }}>
          {/* <b>, not <span>: a broad Done-list badge rule targets section > div > div > span */}
          {months.map((m) => <b key={m.w} style={{ gridColumn: m.w + 1 }}>{m.label}</b>)}
        </div>
        <div className="graphic-calendar-grid" style={{ '--weeks': WEEKS }}>
          {cells.map((c) => (
            <i
              key={`${c.w}-${c.dow}`}
              title={c.future ? undefined : `${c.label}: ${c.n} job${c.n === 1 ? '' : 's'}`}
              data-level={c.future ? undefined : level(c.n)}
              data-future={c.future || undefined}
              data-today={c.today || undefined}
              style={{ gridColumn: c.w + 1, gridRow: c.dow + 1, '--w': c.w }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
