import { useEffect, useRef, useState } from 'react';
import {
  THEMES, loadRooms, saveRooms, loadTheme, saveTheme, loadShopping, saveShopping, stageFor,
  iconFor, textFor, shapePalette, shapeFor, headlineFor, roomColor,
  resyncSubs, packShapes, completionHistory,
} from './data.js';
import BentoGrid from './components/BentoGrid.jsx';
import RoomDetail from './components/RoomDetail.jsx';
import SheetModal from './components/SheetModal.jsx';
import Toast from './components/Toast.jsx';
import OnboardSheet from './components/OnboardSheet.jsx';
import ShoppingList from './components/ShoppingList.jsx';
import HistoryList from './components/HistoryList.jsx';
import {
  syncEnabled, loadHouseholdCode, saveHouseholdCode, generateCode,
  fetchHousehold, pushHousehold, subscribeHousehold,
} from './sync.js';

const BUILD_LABEL = 'build 19';

export default function App() {
  const [rooms, setRoomsState] = useState(loadRooms);
  const [themeKey, setThemeKeyState] = useState(loadTheme);
  const [shopping, setShoppingState] = useState(loadShopping);
  const [screen, setScreen] = useState('home');
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [toast, setToast] = useState(null);
  const [hideDone, setHideDone] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState({});
  const [householdCode, setHouseholdCodeState] = useState(loadHouseholdCode);
  const [joinError, setJoinError] = useState('');
  const [joinBusy, setJoinBusy] = useState(false);
  // Drives the home header collapsing once it's pinned to the top.
  const [scrolled, setScrolled] = useState(false);

  const toastTimer = useRef(null);
  const dragRef = useRef(null);
  const roomsRef = useRef(rooms);
  useEffect(() => { roomsRef.current = rooms; });
  const lastSyncedRef = useRef(null);

  const setRooms = (next) => { setRoomsState(next); saveRooms(next); };
  const setShopping = (next) => { setShoppingState(next); saveShopping(next); };

  // ── household sync (optional — app works fully offline if unconfigured) ──
  useEffect(() => {
    if (!householdCode || !syncEnabled) return undefined;
    let cancelled = false;
    (async () => {
      const remote = await fetchHousehold(householdCode);
      if (cancelled || !remote.ok) return; // couldn't reach the server — keep using local data, try again next mount
      if (remote.data) {
        const { rooms: remoteRooms, theme: remoteTheme, shopping: remoteShopping } = remote.data;
        lastSyncedRef.current = JSON.stringify(remote.data);
        if (Array.isArray(remoteRooms)) { setRoomsState(remoteRooms); saveRooms(remoteRooms); }
        if (remoteTheme) { setThemeKeyState(remoteTheme); saveTheme(remoteTheme); }
        if (Array.isArray(remoteShopping)) { setShoppingState(remoteShopping); saveShopping(remoteShopping); }
      } else {
        const payload = { rooms: roomsRef.current, theme: themeKey, shopping };
        lastSyncedRef.current = JSON.stringify(payload);
        pushHousehold(householdCode, payload);
      }
    })();
    const unsubscribe = subscribeHousehold(householdCode, (row) => {
      if (!row || !row.data) return;
      const serialized = JSON.stringify(row.data);
      if (serialized === lastSyncedRef.current) return; // our own write echoed back
      lastSyncedRef.current = serialized;
      const { rooms: remoteRooms, theme: remoteTheme, shopping: remoteShopping } = row.data;
      if (Array.isArray(remoteRooms)) { setRoomsState(remoteRooms); saveRooms(remoteRooms); }
      if (remoteTheme) { setThemeKeyState(remoteTheme); saveTheme(remoteTheme); }
        if (Array.isArray(remoteShopping)) { setShoppingState(remoteShopping); saveShopping(remoteShopping); }
    });
    return () => { cancelled = true; unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [householdCode]);

  // push local changes up to the household row (debounced, skips echoes of our own remote-applied state)
  useEffect(() => {
    if (!householdCode || !syncEnabled) return undefined;
    const payload = { rooms, theme: themeKey, shopping };
    const serialized = JSON.stringify(payload);
    if (serialized === lastSyncedRef.current) return undefined;
    const t = setTimeout(() => {
      lastSyncedRef.current = serialized;
      pushHousehold(householdCode, payload);
    }, 500);
    return () => clearTimeout(t);
  }, [rooms, themeKey, shopping, householdCode]);

  const handleCreateHousehold = () => generateCode();
  const handleConfirmCreate = (code) => { saveHouseholdCode(code); setHouseholdCodeState(code); };
  const handleJoinHousehold = async (code) => {
    setJoinError(''); setJoinBusy(true);
    const remote = await fetchHousehold(code);
    setJoinBusy(false);
    if (!remote.ok) { setJoinError("couldn't reach the server — check your connection and try again."); return; }
    if (!remote.data) { setJoinError("couldn't find that code — double-check it with your partner."); return; }
    saveHouseholdCode(code);
    setHouseholdCodeState(code);
  };

  const theme = THEMES[themeKey] || THEMES.camp;

  // iOS reveals the plain <html>/<body> background during rubber-band overscroll,
  // and tints the status bar from <meta name="theme-color">. Point both at the
  // active theme so the bar and the overscroll area blend into the app instead
  // of flashing white or reading as a separate banner.
  useEffect(() => {
    document.documentElement.style.background = theme.mat;
    document.body.style.background = theme.mat;
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', theme.mat);
  }, [theme.mat]);

  // ── celebration + toast ──
  function flashToast(msg, undo = null) {
    clearTimeout(toastTimer.current);
    const onAction = undo ? () => { undo(); setToast(null); clearTimeout(toastTimer.current); } : null;
    setToast({ msg, onAction });
    toastTimer.current = setTimeout(() => setToast(null), undo ? 4500 : 1900);
  }

  useEffect(() => () => { clearTimeout(toastTimer.current); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── navigation ──
  const openRoom = (id) => { setScreen('room'); setActiveRoomId(id); };
  const goHome = () => { setScreen('home'); setActiveRoomId(null); };
  const stopClick = (e) => { if (e && e.stopPropagation) e.stopPropagation(); };
  const openShopping = () => { setScreen('shopping'); setActiveRoomId(null); };
  const openHistory = () => { setScreen('history'); setActiveRoomId(null); };
  const openAddShopping = () => setSheet({ mode: 'shopping', name: '', roomId: '' });
  const toggleShopping = (itemId) => {
    const previous = shopping;
    const next = shopping.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item));
    setShopping(next);
    flashToast(next.find((item) => item.id === itemId)?.done ? 'marked bought' : 'back on the list', () => setShopping(previous));
  };
  const deleteShopping = (itemId) => {
    const previous = shopping;
    setShopping(shopping.filter((item) => item.id !== itemId));
    flashToast('item deleted', () => setShopping(previous));
  };

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

  const openCapture = () => setSheet({ mode: 'capture', roomId: smartCaptureRoom(), name: '', status: 'todo' });
  const openAddJob = (roomId, e) => { stopClick(e); setSheet({ mode: 'job', roomId, name: '', status: 'todo' }); };
  const openAddRoom = () => setSheet({ mode: 'room', name: '' });
  const openEditJob = (roomId, taskId, e) => {
    stopClick(e);
    const room = rooms.find((r) => r.id === roomId);
    const task = room.tasks.find((t) => t.id === taskId);
    const status = task.done ? 'done' : task.stuck ? 'stuck' : task.doing ? 'doing' : 'todo';
    setSheet({ mode: 'edit', roomId, taskId, name: task.label, status, stuckReason: task.stuckReason || '', notes: task.notes || '' });
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
    const previous = rooms;
    setRooms(rooms.filter((r) => r.id !== room.id));
    setScreen('home');
    setActiveRoomId(null);
    flashToast('room deleted', () => setRooms(previous));
  };

  const closeSheet = () => setSheet(null);
  const setSheetName = (e) => setSheet((s) => ({ ...s, name: e.target.value }));
  const setSheetRoom = (e) => setSheet((s) => ({ ...s, roomId: e.target.value }));
  const setSheetStatus = (e) => setSheet((s) => ({ ...s, status: e.target.value }));
  const setSheetStuckReason = (e) => setSheet((s) => ({ ...s, stuckReason: e.target.value }));
  const setSheetNotes = (e) => setSheet((s) => ({ ...s, notes: e.target.value }));
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
    const previous = rooms;
    setRooms(rooms.map((r) => (r.id !== roomId ? r : {
      ...r, tasks: r.tasks.map((t) => (t.id !== taskId ? t : resyncSubs({ ...t, subs: t.subs.filter((s) => s.id !== subId) }))),
    })));
    flashToast('step deleted', () => setRooms(previous));
  };

  const toggleTask = (roomId, taskId, e) => {
    stopClick(e);
    const nextRooms = rooms.map((r) => (r.id !== roomId ? r : {
      ...r,
      tasks: r.tasks.map((t) => {
        if (t.id !== taskId) return t;
        if (t.stuck) return { ...t, stuck: false, stuckReason: '', doing: true };
        if (!t.doing && !t.done) return { ...t, doing: true };
        if (t.doing && !t.done) return { ...t, doing: false, done: true, completedAt: Date.now() };
        return { ...t, done: false, doing: false, completedAt: null };
      }),
    }));
    setRooms(nextRooms);
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
    if (!name) return;
    let next = rooms;
    if (s.mode === 'shopping') {
      const previous = shopping;
      setShopping([...shopping, { id: `shop${Date.now()}`, label: name, roomId: s.roomId || '', done: false }]);
      flashToast('added to shopping', () => setShopping(previous));
      setSheet(null);
      return;
    }
    if (s.mode === 'step') {
      next = next.map((r) => (r.id !== s.roomId ? r : {
        ...r, tasks: r.tasks.map((t) => (t.id !== s.taskId ? t : resyncSubs({ ...t, subs: [...(t.subs || []), { id: 'sub' + Date.now(), label: name, done: false }] }))),
      }));
      setExpandedTasks((s2) => ({ ...s2, [s.taskId]: true }));
      flashToast('step added');
    } else if (s.mode === 'edit') {
      const isDone = s.status === 'done', isDoing = s.status === 'doing', isStuck = s.status === 'stuck';
      next = next.map((r) => (r.id !== s.roomId ? r : { ...r, tasks: r.tasks.map((t) => (t.id === s.taskId ? {
        ...t, label: name, done: isDone, doing: isDoing, stuck: isStuck,
        stuckReason: isStuck ? (s.stuckReason || '').trim() : '',
        notes: (s.notes || '').trim(),
        completedAt: isDone ? (t.completedAt || Date.now()) : null,
      } : t)) }));
      flashToast('saved', () => setRooms(rooms));
    } else if (s.mode === 'renameRoom') {
      if (next.some((r) => r.id !== s.roomId && r.name.toLowerCase() === name.toLowerCase())) {
        flashToast('you already have a room called that');
        return;
      }
      next = next.map((r) => (r.id !== s.roomId ? r : { ...r, name }));
      flashToast('renamed');
    } else if (s.mode === 'job' || s.mode === 'capture') {
      const target = next.find((r) => r.id === s.roomId) || next[0];
      const isDone = s.status === 'done', isDoing = s.status === 'doing', isStuck = s.status === 'stuck';
      next = next.map((r) => (r.id !== target.id ? r : {
        ...r, tasks: [...r.tasks, { id: 't' + Date.now(), label: name, done: isDone, doing: isDoing, stuck: isStuck, stuckReason: isStuck ? (s.stuckReason || '').trim() : '', completedAt: isDone ? Date.now() : null, subs: [] }],
      }));
      flashToast(s.mode === 'capture' ? 'added to ' + target.name : 'job added');
    } else {
      next = [...next, { id: 'r' + Date.now(), name, tasks: [] }];
      flashToast('room added');
    }
    setRooms(next);
    setSheet(null);
  };

  const deleteJob = () => {
    const s = sheet;
    const previous = rooms;
    setRooms(rooms.map((r) => (r.id !== s.roomId ? r : { ...r, tasks: r.tasks.filter((t) => t.id !== s.taskId) })));
    flashToast('job deleted', () => setRooms(previous));
    setSheet(null);
  };
  const moveJob = (direction) => {
    const s = sheet;
    setRooms(rooms.map((r) => {
      if (r.id !== s.roomId) return r;
      const tasks = [...r.tasks];
      const index = tasks.findIndex((t) => t.id === s.taskId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= tasks.length) return r;
      [tasks[index], tasks[target]] = [tasks[target], tasks[index]];
      return { ...r, tasks };
    }));
    flashToast(direction < 0 ? 'moved up' : 'moved down');
  };

  // ── derived render values ──
  const matIsLight = textFor(theme.mat) === '#241A33';
  const matText80 = matIsLight ? 'rgba(36,26,51,.8)' : 'rgba(255,252,243,.8)';
  const matText75 = matIsLight ? 'rgba(36,26,51,.65)' : 'rgba(255,252,243,.75)';

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
    const stage = stageFor(done, total);
    if (complete) roomsDone++;
    return {
      id: r.id, name: r.name, icon: iconFor(r.name), gradient: bg, done, total, pct, complete, stage, textColor,
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

  const sorted = roomStats;
  const shapeSeq = packShapes(sorted.map((room) => ({ ...room, complete: false })));
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
        rowBg: t.done ? 'rgba(36,26,51,.05)' : t.stuck ? 'rgba(226,84,45,.08)' : t.doing ? 'rgba(232,169,63,.1)' : 'transparent',
        labelColor: t.done ? 'rgba(36,26,51,.35)' : '#241A33',
        isStuck: !!t.stuck,
        stuckReason: t.stuck ? (t.stuckReason || '') : '',
        notePreview: (t.notes || '').replace(/\s+/g, ' ').trim(),
        strike: t.done ? 'line-through' : 'none',
        checkBg: t.done ? '#241A33' : t.stuck ? '#E2542D' : t.doing ? theme.accent : 'transparent',
        checkColor: t.done ? theme.accent : t.stuck ? '#fff' : t.doing ? '#241A33' : 'transparent',
        checkBorder: t.done || t.stuck || t.doing ? 'none' : '2px solid rgba(36,26,51,.25)',
        checkMark: t.done ? 'check' : t.stuck ? 'priority_high' : t.doing ? 'more_horiz' : '',
        isDone: t.done,
        hasSubs, chevOpen, subsView,
        showActions: !hasSubs,
        chevronRotate: chevOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        subCountLabel: hasSubs ? `${t.subs.filter((s) => s.done).length}/${t.subs.length}` : '',
        onToggle: hasSubs ? (() => toggleExpandTask(t.id)) : ((e) => toggleTask(activeRoom.id, t.id, e)),
        onToggleExpand: () => toggleExpandTask(t.id),
        onEdit: (e) => openEditJob(activeRoom.id, t.id, e),
        onDragStart: (e) => onDragStart(activeRoom.id, t.id, e),
        onStepsClick: (e) => openStepSheet(activeRoom.id, t.id, e),
      };
    });
    const orderedTasksView = [...tasksView].sort((a, b) => (a.isDone === b.isDone ? 0 : a.isDone ? 1 : -1));
    const visibleTasksView = hideDone ? orderedTasksView.filter((t) => !t.isDone) : orderedTasksView;
    roomDetail = {
      id: activeRoom.id, name: activeRoom.name, icon: iconFor(activeRoom.name), bg, textColor,
      tileBg: dark ? 'rgba(36,26,51,.12)' : 'rgba(255,255,255,.22)',
      barTrack: dark ? 'rgba(36,26,51,.14)' : 'rgba(255,255,255,.3)',
      done, total, pct, stage: stageFor(done, total), left: total - done,
      tasksView: visibleTasksView,
      allClear: hideDone && total > 0 && visibleTasksView.length === 0,
      hideDone,
      hideDoneLabel: hideDone ? 'showing to-do' : 'hide done',
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
    const isStep = sheet.mode === 'step';
    const isJob = sheet.mode === 'job';
    const isShoppingSheet = sheet.mode === 'shopping';
    const roomTied = isJob || isEdit || isStep || isRename;
    const sheetAccent = isCapture ? '#3FAE6B' : roomTied ? roomColor(rooms, theme, sheet.roomId) : isRoomMode ? theme.palette[1] : theme.accent;
    const sheetTitleText = textFor(sheetAccent);
    sheetView = {
      accent: sheetAccent,
      titleText: sheetTitleText,
      titleBadgeBg: sheetTitleText === '#241A33' ? 'rgba(36,26,51,.12)' : 'rgba(255,255,255,.22)',
      icon: isShoppingSheet ? 'shopping_cart' : (isEdit || isRename) ? 'edit' : isStep ? 'playlist_add' : isRoomMode ? 'add_home' : 'add_task',
      name: sheet.name,
      title: isShoppingSheet ? 'add shopping item' : isEdit ? 'edit job' : isRename ? 'rename room' : isStep ? 'add a step' : isRoomMode ? 'add a room' : isCapture ? 'quick add' : '+ add a job',
      fieldLabel: isShoppingSheet ? 'item' : isRoomMode || isRename ? 'room name' : isStep ? 'step' : 'job',
      placeholder: isShoppingSheet ? 'e.g. paint rollers' : isRoomMode || isRename ? 'room name…' : isStep ? 'new step…' : isCapture ? 'what needs doing…' : 'e.g. tile the splashback',
      showDelete: isEdit,
      saveLabel: isShoppingSheet ? 'add item' : (isEdit || isRename) ? 'save' : isRoomMode ? 'add room' : isStep ? 'add step' : 'add job',
      inputMode: 'text',
      showRoomPick: isCapture || isJob || isShoppingSheet,
      roomId: sheet.roomId || '',
      roomOptions: isShoppingSheet ? [{ id: '', name: 'no room' }, ...rooms.map((r) => ({ id: r.id, name: r.name }))] : (isCapture || isJob) ? rooms.map((r) => ({ id: r.id, name: r.name })) : [],
      showStatus: isCapture || isJob || isEdit,
      showEditActions: isEdit,
      showNotes: isEdit,
      stuckReason: sheet.stuckReason || '',
      notes: sheet.notes || '',
      status: sheet.status || 'todo',
    };
  }

  const historyEntries = completionHistory(rooms);
  const headline = headlineFor(overallPct);
  const isHome = screen === 'home' && !!rooms.length;
  const isRoom = screen === 'room' && !!roomDetail;
  const isShopping = screen === 'shopping';
  const isHistory = screen === 'history';


  return (
    <div style={{ minHeight: '100dvh', background: theme.mat, color: '#241A33', fontFamily: "'Space Grotesk', sans-serif" }}>

      <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative', minHeight: '100dvh' }}>
        {/* No top padding — each screen's pinned header supplies its own, so
            spacing looks the same whether it's stuck to the top or not. */}
        <div style={{ padding: '0 16px calc(env(safe-area-inset-bottom) + 40px)', boxSizing: 'border-box' }}>

          {isHome && (
            <div>
              {/* Pinned to the top so cards scroll underneath a deliberate
                  header rather than being clipped by the iOS status bar.
                  Collapses to a compact bar once it's stuck. */}
              <div style={{ position: 'sticky', top: 0, zIndex: 20, marginLeft: -16, marginRight: -16, marginBottom: 14 }}>
                <div style={{ position: 'relative', background: theme.cream, borderRadius: '0 0 22px 22px', padding: scrolled ? '12px 18px 14px' : '16px 18px 18px', transition: 'padding .22s ease, box-shadow .22s ease', boxShadow: scrolled ? '0 10px 16px -12px rgba(36,26,51,.45)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: scrolled ? 0 : 12, transition: 'margin-bottom .22s ease' }}>
                    <div>
                      <div
                        style={{ fontWeight: 700, fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(36,26,51,.5)', marginBottom: scrolled ? 2 : 6, transition: 'margin-bottom .22s ease' }}
                      >&#10022; HOMEQUEST</div>
                      <div style={{ fontWeight: 800, fontSize: scrolled ? 15 : 22, lineHeight: 1.15, whiteSpace: 'pre-line', transition: 'font-size .22s ease' }}>{headline}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, paddingTop: 2 }}>
                      <div style={{ fontWeight: 800, fontSize: scrolled ? 19 : 28, lineHeight: 1, transition: 'font-size .22s ease' }}>{overallPct}%</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 11, color: 'rgba(36,26,51,.55)', marginTop: 2 }}>{allDone}/{allTotal} tasks</div>
                    </div>
                  </div>
                  <div style={{ maxHeight: scrolled ? 0 : 60, opacity: scrolled ? 0 : 1, overflow: 'hidden', transition: 'max-height .22s ease, opacity .16s ease' }}>
                    <div style={{ height: 10, borderRadius: 999, background: 'rgba(36,26,51,.1)', overflow: 'hidden', marginBottom: 10 }}>
                      <div style={{ height: '100%', borderRadius: 999, background: theme.accent, width: `${overallPct}%`, transition: 'width .5s ease' }} />
                    </div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 11, color: 'rgba(36,26,51,.55)', marginTop: 7 }}>
                      {roomsDone} of {rooms.length} rooms done &#183; {monthlyCount} done this month
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                <button className="hq-home-shortcut" onClick={openShopping}>
                  <span>Shopping</span>
                  <span>{shopping.filter((item) => !item.done).length} to buy</span>
                </button>
                <button className="hq-home-shortcut" onClick={openHistory}>
                  <span>Completed</span>
                  <span>{historyEntries.length} finished</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 2, marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.2em', color: matText80 }}>your rooms</div>
                <button className="hq-addjob" style={{ background: 'none', border: 'none', color: matText80, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.12em', cursor: 'pointer', padding: 0 }} onClick={openCapture}>+ job</button>
              </div>

              <BentoGrid rooms={bentoRooms} matText75={matText75} cream={theme.cream} accent={theme.palette[1]} accentText={textFor(theme.palette[1])} onAddRoom={openAddRoom} />

              {/* Lets us confirm at a glance which build a device is actually
                  running, rather than guessing whether a deploy landed. */}
              <div style={{ marginTop: 18, textAlign: 'center', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '.08em', color: 'rgba(36,26,51,.3)' }}>{BUILD_LABEL}</div>
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
          {isShopping && (
            <ShoppingList
              theme={theme}
              matText75={matText75}
              items={shopping}
              rooms={rooms}
              onBack={goHome}
              onAdd={openAddShopping}
              onToggle={toggleShopping}
              onDelete={deleteShopping}
            />
          )}
          {isHistory && (
            <HistoryList
              theme={theme}
              matText75={matText75}
              entries={historyEntries}
              onBack={goHome}
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
            onStatusChange={setSheetStatus}
            onStuckReasonChange={setSheetStuckReason}
            onNotesChange={setSheetNotes}
            onAddStep={() => setSheet({ mode: 'step', roomId: sheet.roomId, taskId: sheet.taskId, name: '' })}
            onMoveUp={() => moveJob(-1)}
            onMoveDown={() => moveJob(1)}
            onKeyDown={sheetKeyDown}
            onSave={saveSheet}
            onDelete={deleteJob}
          />
        )}
        {toast && <Toast toast={toast} theme={theme} />}

        {syncEnabled && !householdCode && (
          <OnboardSheet
            onCreate={handleCreateHousehold}
            onConfirmCreate={handleConfirmCreate}
            onJoin={handleJoinHousehold}
            joinError={joinError}
            busy={joinBusy}
          />
        )}
      </div>
    </div>
  );
}


























