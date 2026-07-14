import { useEffect, useRef, useState } from 'react';
import {
  THEMES, loadRooms, saveRooms, loadTheme, saveTheme,
  iconFor, textFor, shapePalette, shapeFor, headlineFor, roomColor,
  resyncSubs, packShapes,
} from './data.js';
import BentoGrid from './components/BentoGrid.jsx';
import RoomDetail from './components/RoomDetail.jsx';
import SheetModal from './components/SheetModal.jsx';
import Celebration from './components/Celebration.jsx';
import Toast from './components/Toast.jsx';
import SettingsSheet from './components/SettingsSheet.jsx';

export default function App() {
  const [rooms, setRoomsState] = useState(loadRooms);
  const [themeKey, setThemeKeyState] = useState(loadTheme);
  const [screen, setScreen] = useState('home');
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [celebration, setCelebration] = useState(null);
  const [toast, setToast] = useState(null);
  const [hideDone, setHideDone] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState({});
  const [settingsOpen, setSettingsOpen] = useState(false);

  const celTimer = useRef(null);
  const toastTimer = useRef(null);
  const dragRef = useRef(null);
  const roomsRef = useRef(rooms);
  useEffect(() => { roomsRef.current = rooms; });

  const setRooms = (next) => { setRoomsState(next); saveRooms(next); };
  const setThemeKey = (t) => { setThemeKeyState(t); saveTheme(t); };

  const theme = THEMES[themeKey] || THEMES.camp;

  // ── celebration + toast ──
  function celebrate(shape, accent, opts = {}) {
    const big = !!opts.big;
    const count = big ? 36 : 22;
    const duration = big ? 2.2 : 1.5;
    const colors = [accent, theme.accent, theme.palette[0], theme.palette[2]];
    const particles = Array.from({ length: count }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.4 - 0.2);
      const dist = (big ? 100 : 70) + Math.random() * (big ? 170 : 110);
      return {
        id: i,
        tx: Math.round(Math.cos(angle) * dist),
        ty: Math.round(Math.sin(angle) * dist),
        rot: Math.round(Math.random() * 540),
        color: colors[i % colors.length],
        radius: i % 3 === 0 ? '50%' : '3px',
        duration: 900 + Math.round(Math.random() * 500),
        delay: Math.round(Math.random() * 90),
      };
    });
    setCelebration({ shapeColor: shape.stickerColor, accent, particles, label: opts.label || 'Nice one!', duration, stickerSize: big ? 150 : 96 });
    clearTimeout(celTimer.current);
    celTimer.current = setTimeout(() => setCelebration(null), duration * 1000 + 50);
  }

  function flashToast(msg) {
    setToast({ msg });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1900);
  }

  useEffect(() => () => { clearTimeout(celTimer.current); clearTimeout(toastTimer.current); }, []);

  // ── navigation ──
  const openRoom = (id) => { setScreen('room'); setActiveRoomId(id); setCelebration(null); };
  const goHome = () => { setScreen('home'); setActiveRoomId(null); setCelebration(null); };
  const stopClick = (e) => { if (e && e.stopPropagation) e.stopPropagation(); };

  // ── quick capture ──
  const smartCaptureRoom = () => {
    let best = null, bestPct = -1;
    rooms.forEach((r) => {
      const total = r.tasks.length;
      const done = r.tasks.filter((t) => t.done).length;
      if (total && done === total) return;
      const pct = total ? done / total : 0;
      if (pct > bestPct) { bestPct = pct; best = r.id; }
    });
    return best || (rooms[0] ? rooms[0].id : null);
  };

  const openCapture = () => setSheet({ mode: 'capture', roomId: smartCaptureRoom(), name: '', cost: '', status: 'todo' });
  const openAddJob = (roomId, e) => { stopClick(e); setSheet({ mode: 'job', roomId, name: '', cost: '', status: 'todo' }); };
  const openAddRoom = () => setSheet({ mode: 'room', name: '' });
  const openEditJob = (roomId, taskId, e) => {
    stopClick(e);
    const room = rooms.find((r) => r.id === roomId);
    const task = room.tasks.find((t) => t.id === taskId);
    setSheet({ mode: 'edit', roomId, taskId, name: task.label });
  };
  const openCostSheet = (roomId, taskId, e) => {
    stopClick(e);
    const room = rooms.find((r) => r.id === roomId);
    const task = room.tasks.find((t) => t.id === taskId);
    setSheet({ mode: 'cost', roomId, taskId, name: task.cost ? String(task.cost) : '' });
  };
  const openStepSheet = (roomId, taskId, e) => { stopClick(e); setSheet({ mode: 'step', roomId, taskId, name: '' }); };
  const openRenameRoom = () => {
    const room = rooms.find((r) => r.id === activeRoomId);
    if (!room) return;
    setSheet({ mode: 'renameRoom', roomId: room.id, name: room.name });
  };

  const confirmDeleteRoom = () => {
    const room = rooms.find((r) => r.id === activeRoomId);
    if (!room) return;
    const n = room.tasks.length;
    const msg = n ? `Delete "${room.name}" and its ${n} job${n !== 1 ? 's' : ''}? This can't be undone.` : `Delete "${room.name}"?`;
    if (typeof window !== 'undefined' && window.confirm && !window.confirm(msg)) return;
    setRooms(rooms.filter((r) => r.id !== room.id));
    setScreen('home');
    setActiveRoomId(null);
  };

  const closeSheet = () => setSheet(null);
  const setSheetName = (e) => setSheet((s) => ({ ...s, name: e.target.value }));
  const setSheetRoom = (e) => setSheet((s) => ({ ...s, roomId: e.target.value }));
  const setSheetCost = (e) => setSheet((s) => ({ ...s, cost: e.target.value }));
  const setSheetStatus = (e) => setSheet((s) => ({ ...s, status: e.target.value }));
  const sheetKeyDown = (e) => { if (e && e.key === 'Enter') saveSheet(); };
  const toggleHideDone = () => setHideDone((v) => !v);
  const toggleExpandTask = (taskId) => setExpandedTasks((s) => ({ ...s, [taskId]: !s[taskId] }));

  const toggleSub = (roomId, taskId, subId, e) => {
    stopClick(e);
    setRooms(rooms.map((r) => (r.id !== roomId ? r : {
      ...r, tasks: r.tasks.map((t) => (t.id !== taskId ? t : resyncSubs({ ...t, subs: t.subs.map((s) => (s.id === subId ? { ...s, done: !s.done } : s)) }))),
    })));
  };

  const deleteSub = (roomId, taskId, subId, e) => {
    stopClick(e);
    setRooms(rooms.map((r) => (r.id !== roomId ? r : {
      ...r, tasks: r.tasks.map((t) => (t.id !== taskId ? t : resyncSubs({ ...t, subs: t.subs.filter((s) => s.id !== subId) }))),
    })));
  };

  const toggleTask = (roomId, taskId, e) => {
    stopClick(e);
    const nextRooms = rooms.map((r) => (r.id !== roomId ? r : {
      ...r,
      tasks: r.tasks.map((t) => {
        if (t.id !== taskId) return t;
        if (!t.doing && !t.done) return { ...t, doing: true };
        if (t.doing && !t.done) return { ...t, doing: false, done: true, completedAt: Date.now() };
        return { ...t, done: false, doing: false, completedAt: null };
      }),
    }));
    const room = nextRooms.find((r) => r.id === roomId);
    const task = room.tasks.find((t) => t.id === taskId);
    setRooms(nextRooms);
    if (task.done) {
      const shapeColors = shapePalette(theme);
      celebrate(shapeFor(task.label, shapeColors), roomColor(rooms, theme, roomId), { label: 'Nice one!' });
      const roomJustCompleted = room.tasks.every((t) => t.done);
      if (roomJustCompleted) flashToast(room.name + ' complete!');
    }
  };

  // ── drag-to-reorder jobs within a room ──
  const onDragMove = (ev) => {
    if (!dragRef.current) return;
    const { roomId, taskId, container } = dragRef.current;
    const rows = [...container.querySelectorAll('[data-task-row]')];
    let targetId = null;
    for (const row of rows) {
      const rect = row.getBoundingClientRect();
      if (ev.clientY < rect.top + rect.height / 2) { targetId = row.getAttribute('data-task-row'); break; }
    }
    setRoomsState((cur) => {
      const room = cur.find((r) => r.id === roomId);
      if (!room) return cur;
      const tasks = [...room.tasks];
      const fromIdx = tasks.findIndex((t) => t.id === taskId);
      let toIdx = targetId ? tasks.findIndex((t) => t.id === targetId) : tasks.length;
      if (fromIdx === -1 || toIdx === -1) return cur;
      if (toIdx === fromIdx || toIdx === fromIdx + 1) return cur;
      const [moved] = tasks.splice(fromIdx, 1);
      if (toIdx > fromIdx) toIdx--;
      tasks.splice(toIdx, 0, moved);
      return cur.map((r) => (r.id === roomId ? { ...r, tasks } : r));
    });
  };

  const onDragEnd = () => {
    document.removeEventListener('pointermove', onDragMove);
    document.removeEventListener('pointerup', onDragEnd);
    if (dragRef.current) saveRooms(roomsRef.current);
    dragRef.current = null;
  };

  const onDragStart = (roomId, taskId, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const container = e.currentTarget.closest('[data-jobs-list]');
    if (!container) return;
    dragRef.current = { roomId, taskId, container };
    document.addEventListener('pointermove', onDragMove);
    document.addEventListener('pointerup', onDragEnd);
  };

  const saveSheet = () => {
    const s = sheet;
    if (!s) return;
    const name = (s.name || '').trim();
    if (!name && s.mode !== 'cost') return;
    let next = rooms;
    if (s.mode === 'cost') {
      const val = parseFloat(name.replace(/[^0-9.]/g, '')) || 0;
      next = next.map((r) => (r.id !== s.roomId ? r : { ...r, tasks: r.tasks.map((t) => (t.id === s.taskId ? { ...t, cost: val } : t)) }));
      flashToast('Cost saved');
    } else if (s.mode === 'step') {
      next = next.map((r) => (r.id !== s.roomId ? r : {
        ...r, tasks: r.tasks.map((t) => (t.id !== s.taskId ? t : resyncSubs({ ...t, subs: [...(t.subs || []), { id: 'sub' + Date.now(), label: name, done: false }] }))),
      }));
      setExpandedTasks((s2) => ({ ...s2, [s.taskId]: true }));
      flashToast('Step added');
    } else if (s.mode === 'edit') {
      next = next.map((r) => (r.id !== s.roomId ? r : { ...r, tasks: r.tasks.map((t) => (t.id === s.taskId ? { ...t, label: name } : t)) }));
      flashToast('Saved');
    } else if (s.mode === 'renameRoom') {
      if (next.some((r) => r.id !== s.roomId && r.name.toLowerCase() === name.toLowerCase())) {
        flashToast('You already have a room called that');
        return;
      }
      next = next.map((r) => (r.id !== s.roomId ? r : { ...r, name }));
      flashToast('Renamed');
    } else if (s.mode === 'job' || s.mode === 'capture') {
      const target = next.find((r) => r.id === s.roomId) || next[0];
      const cost = parseFloat(String(s.cost).replace(/[^0-9.]/g, '')) || 0;
      const isDone = s.status === 'done', isDoing = s.status === 'doing';
      next = next.map((r) => (r.id !== target.id ? r : {
        ...r, tasks: [...r.tasks, { id: 't' + Date.now(), label: name, cost, done: isDone, doing: isDoing, completedAt: isDone ? Date.now() : null, subs: [] }],
      }));
      flashToast(s.mode === 'capture' ? 'Added to ' + target.name : 'Job added');
    } else {
      next = [...next, { id: 'r' + Date.now(), name, tasks: [] }];
      flashToast('Room added');
    }
    setRooms(next);
    setSheet(null);
  };

  const deleteJob = () => {
    const s = sheet;
    setRooms(rooms.map((r) => (r.id !== s.roomId ? r : { ...r, tasks: r.tasks.filter((t) => t.id !== s.taskId) })));
    flashToast('Job deleted');
    setSheet(null);
  };

  // ── derived render values ──
  const matIsLight = textFor(theme.mat) === '#241A33';
  const matText80 = matIsLight ? 'rgba(36,26,51,.8)' : 'rgba(255,252,243,.8)';
  const matText75 = matIsLight ? 'rgba(36,26,51,.65)' : 'rgba(255,252,243,.75)';
  const matBorder50 = matIsLight ? 'rgba(36,26,51,.3)' : 'rgba(255,252,243,.5)';

  let allDone = 0, allTotal = 0, roomsDone = 0, monthlyCount = 0;
  const now = new Date();
  rooms.forEach((r) => r.tasks.forEach((t) => {
    if (!t.done) return;
    if (t.completedAt) {
      const d = new Date(t.completedAt);
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) monthlyCount++;
    }
  }));

  const gradientSet = theme.palette;
  const roomStats = rooms.map((r, idx) => {
    const bg = gradientSet[idx % gradientSet.length];
    const textColor = textFor(bg);
    const dark = textColor === '#241A33';
    const done = r.tasks.filter((t) => t.done).length;
    const total = r.tasks.length;
    allDone += done; allTotal += total;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const complete = total > 0 && done === total;
    if (complete) roomsDone++;
    return {
      id: r.id, name: r.name, icon: iconFor(r.name), gradient: bg, done, total, pct, complete, textColor,
      iconBadgeBg: dark ? 'rgba(36,26,51,.12)' : 'rgba(255,255,255,.22)',
      subColor: dark ? 'rgba(36,26,51,.6)' : 'rgba(255,252,243,.75)',
      barTrack: dark ? 'rgba(36,26,51,.16)' : 'rgba(255,252,243,.3)',
      barFill: textColor,
      addBtnColor: dark ? 'rgba(36,26,51,.45)' : 'rgba(255,252,243,.8)',
      onOpen: () => openRoom(r.id),
      onQuickAdd: (e) => openAddJob(r.id, e),
    };
  });
  const overallPct = allTotal ? Math.round((allDone / allTotal) * 100) : 0;

  const sorted = [...roomStats].sort((a, b) => (a.complete !== b.complete ? (a.complete ? 1 : -1) : 0));
  const shapeSeq = packShapes(sorted);
  const bentoRooms = sorted.map((r, i) => {
    const shape = shapeSeq[i];
    return {
      ...r,
      isWide: shape === 'wide', isTall: shape === 'tall', isSm: shape === 'sm',
      isBig: shape === 'big', isDone: shape === 'done', isDoneWide: shape === 'doneWide',
    };
  });

  let roomDetail = null;
  const activeRoomIdx = rooms.findIndex((r) => r.id === activeRoomId);
  const activeRoom = activeRoomIdx >= 0 ? rooms[activeRoomIdx] : null;
  if (activeRoom) {
    const bg = theme.palette[activeRoomIdx % theme.palette.length];
    const done = activeRoom.tasks.filter((t) => t.done).length;
    const total = activeRoom.tasks.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const textColor = textFor(bg);
    const dark = textColor === '#241A33';
    const shapeColors = shapePalette(theme);
    const tasksView = activeRoom.tasks.map((t) => {
      const hasSubs = !!(t.subs && t.subs.length);
      const chevOpen = !!expandedTasks[t.id];
      const subsView = hasSubs ? t.subs.map((s) => ({
        id: s.id, label: s.label,
        checkMark: s.done ? 'check' : '',
        checkBg: s.done ? theme.accent : 'transparent',
        checkColor: s.done ? '#241A33' : 'transparent',
        checkBorder: s.done ? 'none' : '2px solid rgba(36,26,51,.25)',
        labelColor: s.done ? 'rgba(36,26,51,.35)' : '#241A33',
        strike: s.done ? 'line-through' : 'none',
        onToggle: (e) => toggleSub(activeRoom.id, t.id, s.id, e),
        onDelete: (e) => deleteSub(activeRoom.id, t.id, s.id, e),
      })) : [];
      return {
        id: t.id, label: t.label, ...shapeFor(t.label, shapeColors),
        rowBg: t.done ? 'rgba(36,26,51,.05)' : t.doing ? 'rgba(232,169,63,.1)' : 'transparent',
        labelColor: t.done ? 'rgba(36,26,51,.35)' : '#241A33',
        strike: t.done ? 'line-through' : 'none',
        checkBg: t.done ? '#241A33' : t.doing ? `linear-gradient(90deg, ${theme.accent} 50%, transparent 50%)` : 'transparent',
        checkColor: t.done ? theme.accent : 'transparent',
        checkBorder: t.done ? 'none' : t.doing ? `2px solid ${theme.accent}` : '2px solid rgba(36,26,51,.25)',
        checkMark: t.done ? 'check' : '',
        isDone: t.done,
        hasSubs, chevOpen, subsView,
        showActions: !hasSubs,
        chevronRotate: chevOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        subCountLabel: hasSubs ? `${t.subs.filter((s) => s.done).length}/${t.subs.length}` : '',
        costLabel: t.cost ? '£' + t.cost.toLocaleString('en-GB') : '+ cost',
        costColor: t.cost ? 'rgba(36,26,51,.75)' : 'rgba(36,26,51,.4)',
        onToggle: hasSubs ? (() => toggleExpandTask(t.id)) : ((e) => toggleTask(activeRoom.id, t.id, e)),
        onToggleExpand: () => toggleExpandTask(t.id),
        onEdit: (e) => openEditJob(activeRoom.id, t.id, e),
        onDragStart: (e) => onDragStart(activeRoom.id, t.id, e),
        onCostClick: (e) => openCostSheet(activeRoom.id, t.id, e),
        onStepsClick: (e) => openStepSheet(activeRoom.id, t.id, e),
      };
    });
    const orderedTasksView = [...tasksView].sort((a, b) => (a.isDone === b.isDone ? 0 : a.isDone ? 1 : -1));
    const visibleTasksView = hideDone ? orderedTasksView.filter((t) => !t.isDone) : orderedTasksView;
    roomDetail = {
      id: activeRoom.id, name: activeRoom.name, icon: iconFor(activeRoom.name), bg, textColor,
      tileBg: dark ? 'rgba(36,26,51,.12)' : 'rgba(255,255,255,.22)',
      barTrack: dark ? 'rgba(36,26,51,.14)' : 'rgba(255,255,255,.3)',
      done, total, pct, left: total - done,
      tasksView: visibleTasksView,
      allClear: hideDone && total > 0 && visibleTasksView.length === 0,
      hideDone,
      hideDoneLabel: hideDone ? 'Showing to-do' : 'Hide done',
      hideDoneBg: hideDone ? '#241A33' : 'transparent',
      hideDoneColor: hideDone ? '#FFFCF3' : 'rgba(36,26,51,.6)',
      onToggleHideDone: toggleHideDone,
      onAddJob: (e) => openAddJob(activeRoom.id, e),
    };
  }

  let sheetView = null;
  if (sheet) {
    const isEdit = sheet.mode === 'edit';
    const isRoomMode = sheet.mode === 'room';
    const isCapture = sheet.mode === 'capture';
    const isRename = sheet.mode === 'renameRoom';
    const isCost = sheet.mode === 'cost';
    const isStep = sheet.mode === 'step';
    const isJob = sheet.mode === 'job';
    const roomTied = isJob || isEdit || isCost || isStep || isRename;
    const sheetAccent = isCapture ? '#3FAE6B' : roomTied ? roomColor(rooms, theme, sheet.roomId) : theme.accent;
    sheetView = {
      accent: sheetAccent,
      name: sheet.name,
      title: isEdit ? 'Edit job' : isRename ? 'Rename room' : isCost ? 'Estimated cost' : isStep ? 'Add a step' : isRoomMode ? 'Add a room' : isCapture ? 'Quick add' : 'Add a job',
      fieldLabel: isRoomMode || isRename ? 'Room name' : isCost ? 'Estimated cost' : isStep ? 'Step' : 'Job',
      placeholder: isRoomMode || isRename ? 'Room name…' : isCost ? 'e.g. 120' : isStep ? 'New step…' : isCapture ? 'What needs doing…' : 'e.g. Tile the splashback',
      showDelete: isEdit,
      saveLabel: (isEdit || isRename || isCost) ? 'Save' : isRoomMode ? 'Add room' : isStep ? 'Add step' : 'Add job',
      inputMode: isCost ? 'numeric' : 'text',
      showRoomPick: isCapture || isJob,
      roomId: sheet.roomId,
      roomOptions: (isCapture || isJob) ? rooms.map((r) => ({ id: r.id, name: r.name })) : [],
      showCostStatus: isCapture || isJob,
      cost: sheet.cost || '',
      status: sheet.status || 'todo',
    };
  }

  const headline = headlineFor(overallPct);
  const isHome = screen === 'home' && !!rooms.length;
  const isRoom = screen === 'room' && !!roomDetail;

  return (
    <div style={{ minHeight: '100dvh', background: theme.mat, color: '#241A33', fontFamily: "'Space Grotesk', sans-serif" }}>
      <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative', minHeight: '100dvh' }}>
        <div style={{ padding: 'calc(env(safe-area-inset-top) + 20px) 16px calc(env(safe-area-inset-bottom) + 40px)', boxSizing: 'border-box' }}>

          {isHome && (
            <div>
              <div style={{ position: 'relative', background: theme.cream, borderRadius: 18, padding: '18px 18px 16px', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
                  <div>
                    <div
                      style={{ fontWeight: 700, fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(36,26,51,.5)', marginBottom: 6, cursor: 'pointer' }}
                      onClick={() => setSettingsOpen(true)}
                    >&#10022; HOMEQUEST</div>
                    <div style={{ fontWeight: 800, fontSize: 22, lineHeight: 1.15, whiteSpace: 'pre-line' }}>{headline}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, paddingTop: 2 }}>
                    <div style={{ fontWeight: 800, fontSize: 28, lineHeight: 1 }}>{overallPct}%</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 11, color: 'rgba(36,26,51,.55)', marginTop: 2 }}>{allDone}/{allTotal} tasks</div>
                  </div>
                </div>
                <div style={{ height: 10, borderRadius: 999, background: 'rgba(36,26,51,.1)', overflow: 'hidden', marginBottom: 10 }}>
                  <div style={{ height: '100%', borderRadius: 999, background: theme.accent, width: `${overallPct}%`, transition: 'width .5s ease' }} />
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 11, color: 'rgba(36,26,51,.55)', marginTop: 7 }}>
                  {roomsDone} of {rooms.length} rooms done &#183; {monthlyCount} done this month
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 2, marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.2em', color: matText80 }}>Your rooms</div>
                <button className="hq-addjob" style={{ background: 'none', border: 'none', color: matText80, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.15em', cursor: 'pointer', padding: 0 }} onClick={openCapture}>+ Add a job</button>
              </div>

              <BentoGrid rooms={bentoRooms} matBorder50={matBorder50} matText75={matText75} onAddRoom={openAddRoom} />
            </div>
          )}

          {isRoom && (
            <RoomDetail
              theme={theme}
              matText75={matText75}
              roomDetail={roomDetail}
              onBack={goHome}
              onRename={openRenameRoom}
              onDelete={confirmDeleteRoom}
            />
          )}
        </div>

        {sheetView && (
          <SheetModal
            sheet={sheetView}
            theme={theme}
            onClose={closeSheet}
            onStop={stopClick}
            onNameChange={setSheetName}
            onRoomChange={setSheetRoom}
            onCostChange={setSheetCost}
            onStatusChange={setSheetStatus}
            onKeyDown={sheetKeyDown}
            onSave={saveSheet}
            onDelete={deleteJob}
          />
        )}

        {celebration && <Celebration celebration={celebration} theme={theme} />}
        {toast && <Toast toast={toast} theme={theme} />}
        {settingsOpen && (
          <SettingsSheet
            themeKey={themeKey}
            onPick={(t) => { setThemeKey(t); setSettingsOpen(false); }}
            onClose={() => setSettingsOpen(false)}
            onStop={stopClick}
          />
        )}
      </div>
    </div>
  );
}
