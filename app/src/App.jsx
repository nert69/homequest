import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { artIndex } from './components/GraphicArt.jsx';
import {
  THEMES, loadRooms, saveRooms, loadTheme, saveTheme, loadShopping, saveShopping, stageFor,
  iconFor, textFor, shapePalette, shapeFor, roomColor,
  resyncSubs, packShapes, completionHistory,
} from './data.js';
import HomeDashboard from './components/GraphicDashboard.jsx';
import RoomDetail from './components/GraphicRoom.jsx';
import SheetModal from './components/SheetModal.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';
import OnboardSheet from './components/OnboardSheet.jsx';
import ShoppingList from './components/ShoppingList.jsx';
import HistoryList from './components/HistoryList.jsx';
import useSwipeBack from './hooks/useSwipeBack.js';
import {
  syncEnabled, loadHouseholdCode, saveHouseholdCode, generateCode,
  fetchHousehold, pushHousehold, subscribeHousehold,
} from './sync.js';


// Home-folder fills based on the Pinboard Study preview, with a light
// saturation lift. The extra Hallway keeps that study's royal-blue accent.
const PINBOARD_FOLDER_COLORS = {
  front: '#A7D943',
  'downstairs hallway': '#B3A0D5',
  'downstairs toilet': '#E9B358',
  kitchen: '#EA9878',
  hallway: '#83B8CC',
  'living room': '#D8A0B8',
  bedroom: '#83BBA0',
  bathroom: '#DDD16B',
};

const pinboardRoomColor = (room, fallback) => (
  PINBOARD_FOLDER_COLORS[room?.name?.trim().toLowerCase()] || fallback
);

export default function App() {
  const [rooms, setRoomsState] = useState(loadRooms);
  const [themeKey, setThemeKeyState] = useState(loadTheme);
  const [shopping, setShoppingState] = useState(loadShopping);
  const [screen, setScreen] = useState('home');
  const [activeRoomId, setActiveRoomId] = useState(null);
  // The room whose card morphs into (and back out of) the room screen.
  const [morphRoomId, setMorphRoomId] = useState(null);
  // A closed sheet stays mounted for a moment so it can slide away rather
  // than vanish; it ignores input while it leaves.
  const lastSheetView = useRef(null);
  const [leavingSheet, setLeavingSheet] = useState(null);
  // Jobs just ticked stay put briefly so the tick can draw where it was
  // tapped, before sliding into the finished pile at the bottom.
  const [settling, setSettling] = useState(() => new Set());
  const settleTimers = useRef({});
  const settle = (taskId) => {
    clearTimeout(settleTimers.current[taskId]);
    setSettling((prev) => new Set(prev).add(taskId));
    settleTimers.current[taskId] = setTimeout(() => {
      delete settleTimers.current[taskId];
      setSettling((prev) => { const next = new Set(prev); next.delete(taskId); return next; });
    }, 650);
  };
  const [sheet, setSheet] = useState(null);
  const [hideDone, setHideDone] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState({});
  const [householdCode, setHouseholdCodeState] = useState(loadHouseholdCode);
  const [joinError, setJoinError] = useState('');
  const [joinBusy, setJoinBusy] = useState(false);
  const [confirm, setConfirm] = useState(null);

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

  const theme = { ...(THEMES[themeKey] || THEMES.camp), mat: '#F0F0E8', cream: '#F0F0E8', accent: '#70834A', palette: Object.values(PINBOARD_FOLDER_COLORS) };

  // iOS reveals the plain <html>/<body> background during rubber-band overscroll,
  // and tints the status bar from <meta name="theme-color">. Point both at the
  // active theme. The page/overscroll area uses the mat, while the status bar
  // uses the same cream as the pinned header so their boundary nearly disappears.
  //
  // Deliberately not attempting to dim this to match a sheet/dialog overlay —
  // on a real device the status bar strip didn't respond to live updates to
  // this tag at all (it likely only reads it once, not on every state change),
  // so the tint just stays fixed rather than chase an effect that can't be
  // verified from here.
  useEffect(() => {
    document.documentElement.style.background = theme.mat;
    document.body.style.background = theme.mat;
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', theme.cream);
  }, [theme.mat, theme.cream]);


  // Each screen starts at the top. Without this the scroll position carries
  // over, so opening a room from halfway down the home screen dropped you
  // partway down its job list.
  const homeScroll = useRef(0);
  useLayoutEffect(() => {
    window.scrollTo(0, screen === 'home' ? homeScroll.current : 0);
  }, [screen, activeRoomId]);

  // ── navigation ──
  const rememberHome = () => { if (screen === 'home') homeScroll.current = window.scrollY; };
  // Morph the tapped card into the room screen where the browser supports
  // view transitions (iOS 18+); elsewhere, or with Reduce Motion on, it just
  // switches instantly as before.
  const morph = (update) => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !document.startViewTransition) { update(); return; }
    document.startViewTransition(() => flushSync(update));
  };
  // Screens away from home sit one browser-history step above it, so the
  // back arrow, a swipe, Safari's edge swipe and Android's back button all
  // land in the same place. Leaving home pushes that step; moving between
  // non-home screens replaces it. Going back pops it, and the popstate
  // handler below does the actual switch, morphing only when the app itself
  // asked (a native gesture has already animated, and a swipe slid off).
  const backStyle = useRef(null);
  const showHome = () => { setScreen('home'); setActiveRoomId(null); };
  const enter = (update) => {
    const step = { hq: 1 };
    if (screen === 'home') window.history.pushState(step, ''); else window.history.replaceState(step, '');
    morph(update);
  };
  const back = (style) => {
    if (window.history.state?.hq) { backStyle.current = style; window.history.back(); }
    else if (style === 'morph') morph(showHome);
    else showHome();
  };
  useEffect(() => {
    const onPop = (e) => {
      if (e.state?.hq) return; // forward onto a screen we no longer know; stay put
      const style = backStyle.current;
      backStyle.current = null;
      if (style === 'morph') morph(showHome); else showHome();
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const openRoom = (id) => {
    rememberHome();
    flushSync(() => setMorphRoomId(id));
    enter(() => { setScreen('room'); setActiveRoomId(id); });
  };
  const goHome = () => { if (screen !== 'home') back('morph'); };
  const stopClick = (e) => { if (e && e.stopPropagation) e.stopPropagation(); };
  const openShopping = () => { if (screen === 'shopping') return; rememberHome(); enter(() => { setScreen('shopping'); setActiveRoomId(null); }); };
  const openHistory = () => { if (screen === 'history') return; rememberHome(); enter(() => { setScreen('history'); setActiveRoomId(null); }); };
  const openAddShopping = () => setSheet({ mode: 'shopping', name: '', roomId: '', link: '', source: '' });
  const openEditShopping = (itemId) => {
    const item = shopping.find((i) => i.id === itemId);
    if (!item) return;
    setSheet({ mode: 'editShopping', itemId, name: item.label, roomId: item.roomId || '', link: item.link || '', source: item.source || '' });
  };
  const toggleShopping = (itemId) => {
    setShopping(shopping.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item)));
  };
  const deleteShopping = (itemId) => {
    setShopping(shopping.filter((item) => item.id !== itemId));
  };
  const setSheetLink = (e) => setSheet((s) => ({ ...s, link: e.target.value }));
  const setSheetSource = (e) => setSheet((s) => ({ ...s, source: e.target.value }));

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

  // Deleting a room takes its jobs with it and can't be undone, so it's the one
  // action that asks first.
  const confirmDeleteRoom = () => {
    const room = rooms.find((r) => r.id === activeRoomId);
    if (!room) return;
    const n = room.tasks.length;
    setConfirm({
      title: `Delete ${room.name}?`,
      body: n
        ? `This removes the room and its ${n} job${n === 1 ? '' : 's'}. You can't undo it.`
        : "This removes the room. You can't undo it.",
      confirmLabel: 'Delete',
      onConfirm: () => {
        setRooms(rooms.filter((r) => r.id !== room.id));
        setConfirm(null);
        back('instant');
      },
    });
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
    settle(taskId);
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
    settle(taskId);
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
      setShopping([...shopping, { id: `shop${Date.now()}`, label: name, roomId: s.roomId || '', done: false, link: (s.link || '').trim(), source: (s.source || '').trim() }]);
      setSheet(null);
      return;
    }
    if (s.mode === 'editShopping') {
      setShopping(shopping.map((item) => (item.id !== s.itemId ? item : {
        ...item, label: name, roomId: s.roomId || '', link: (s.link || '').trim(), source: (s.source || '').trim(),
      })));
      setSheet(null);
      return;
    }
    if (s.mode === 'step') {
      next = next.map((r) => (r.id !== s.roomId ? r : {
        ...r, tasks: r.tasks.map((t) => (t.id !== s.taskId ? t : resyncSubs({ ...t, subs: [...(t.subs || []), { id: 'sub' + Date.now(), label: name, done: false }] }))),
      }));
      setExpandedTasks((s2) => ({ ...s2, [s.taskId]: true }));
    } else if (s.mode === 'edit') {
      const isDone = s.status === 'done', isDoing = s.status === 'doing', isStuck = s.status === 'stuck';
      next = next.map((r) => (r.id !== s.roomId ? r : { ...r, tasks: r.tasks.map((t) => (t.id === s.taskId ? {
        ...t, label: name, done: isDone, doing: isDoing, stuck: isStuck,
        stuckReason: isStuck ? (s.stuckReason || '').trim() : '',
        notes: (s.notes || '').trim(),
        completedAt: isDone ? (t.completedAt || Date.now()) : null,
      } : t)) }));
    } else if (s.mode === 'renameRoom') {
      if (next.some((r) => r.id !== s.roomId && r.name.toLowerCase() === name.toLowerCase())) {
        return;
      }
      next = next.map((r) => (r.id !== s.roomId ? r : { ...r, name }));
    } else if (s.mode === 'job' || s.mode === 'capture') {
      const target = next.find((r) => r.id === s.roomId) || next[0];
      const isDone = s.status === 'done', isDoing = s.status === 'doing', isStuck = s.status === 'stuck';
      next = next.map((r) => (r.id !== target.id ? r : {
        ...r, tasks: [...r.tasks, { id: 't' + Date.now(), label: name, done: isDone, doing: isDoing, stuck: isStuck, stuckReason: isStuck ? (s.stuckReason || '').trim() : '', completedAt: isDone ? Date.now() : null, subs: [] }],
      }));
    } else {
      next = [...next, { id: 'r' + Date.now(), name, tasks: [] }];
    }
    setRooms(next);
    setSheet(null);
  };

  const deleteJob = () => {
    const s = sheet;
    setRooms(rooms.map((r) => (r.id !== s.roomId ? r : { ...r, tasks: r.tasks.filter((t) => t.id !== s.taskId) })));
    setSheet(null);
  };
  // Dispatches the sheet's delete button to whichever kind of item it's editing.
  const deleteSheetItem = () => {
    if (sheet?.mode === 'editShopping') { setShopping(shopping.filter((item) => item.id !== sheet.itemId)); setSheet(null); return; }
    deleteJob();
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
  };

  // ── derived render values ──
  const matIsLight = textFor(theme.mat) === '#241A33';
  const matText75 = matIsLight ? 'rgba(36,26,51,.65)' : 'rgba(255,252,243,.75)';

  let allDone = 0, allTotal = 0, roomsDone = 0;

  const gradientSet = theme.palette;
  const roomStats = rooms.map((r, idx) => {
    const bg = pinboardRoomColor(r, gradientSet[idx % gradientSet.length]);
    const done = r.tasks.filter((t) => t.done).length;
    const total = r.tasks.length;
    allDone += done; allTotal += total;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const complete = total > 0 && done === total;
    const stage = stageFor(done, total);
    const openTasks = r.tasks.filter((t) => !t.done);
    const doingTask = openTasks.find((t) => t.doing);
    let slips;
    if (complete) {
      slips = [{ label: 'all done', status: 'complete' }];
    } else if (doingTask) {
      const remaining = openTasks.length - 1;
      slips = [{ label: doingTask.label, status: 'doing' }];
      if (remaining > 0) slips.push({ label: `+${remaining} more inside`, status: '' });
    } else if (openTasks.length > 0) {
      slips = [
        { label: `${openTasks.length} job${openTasks.length === 1 ? '' : 's'} inside`, status: 'open' },
        { decorative: true },
      ];
    } else {
      slips = [{ label: 'empty folder', status: '' }];
    }
    if (complete) roomsDone++;
    return {
      id: r.id, name: r.name, icon: iconFor(r.name), gradient: '#FFFFFF', accent: bg, done, total, pct, complete, stage, textColor: '#202328',
      slips, nextTask: doingTask?.label || openTasks[0]?.label || (complete ? 'Every job is finished.' : 'Add your first job'),
      iconBadgeBg: `${bg}12`,
      subColor: '#757C86',
      barTrack: `${bg}16`,
      barFill: bg,
      addBtnColor: '#8B929C',
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
    const bg = pinboardRoomColor(activeRoom, theme.palette[activeRoomIdx % theme.palette.length]);
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
        rowBg: t.done ? '#F8FAFB' : t.stuck ? '#FFF5F1' : t.doing ? `${bg}09` : 'transparent',
        labelColor: t.done ? 'rgba(36,26,51,.35)' : '#241A33',
        isStuck: !!t.stuck,
        stuckReason: t.stuck ? (t.stuckReason || '') : '',
        notePreview: (t.notes || '').replace(/\s+/g, ' ').trim(),
        strike: t.done ? 'line-through' : 'none',
        checkBg: t.done ? '#241A33' : t.stuck ? '#E2542D' : t.doing ? bg : 'transparent',
        checkColor: t.done ? bg : t.stuck ? '#fff' : t.doing ? textColor : 'transparent',
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
    const finished = (t) => t.isDone && !settling.has(t.id);
    const orderedTasksView = [...tasksView].sort((a, b) => (finished(a) === finished(b) ? 0 : finished(a) ? 1 : -1));
    const visibleTasksView = hideDone ? orderedTasksView.filter((t) => !finished(t)) : orderedTasksView;
    roomDetail = {
      number: [...rooms].sort((a,b)=>artIndex(a.name)-artIndex(b.name)).findIndex(room=>room.id===activeRoom.id)+1,
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
    const isEditShopping = sheet.mode === 'editShopping';
    const anyShoppingSheet = isShoppingSheet || isEditShopping;
    const roomTied = isJob || isEdit || isStep || isRename;
    const sheetRoom = roomTied ? rooms.find((room) => room.id === sheet.roomId) : null;
    const sheetAccent = isCapture ? '#3FAE6B' : roomTied ? pinboardRoomColor(sheetRoom, roomColor(rooms, theme, sheet.roomId)) : (isRoomMode || anyShoppingSheet) ? theme.palette[1] : theme.accent;
    const sheetTitleText = textFor(sheetAccent);
    sheetView = {
      accent: sheetAccent,
      titleText: sheetTitleText,
      titleBadgeBg: sheetTitleText === '#241A33' ? 'rgba(36,26,51,.12)' : 'rgba(255,255,255,.22)',
      icon: anyShoppingSheet ? 'shopping_cart' : (isEdit || isRename) ? 'edit' : isStep ? 'playlist_add' : isRoomMode ? 'add_home' : 'add_task',
      name: sheet.name,
      title: isShoppingSheet ? 'add shopping item' : isEditShopping ? 'edit shopping item' : isEdit ? 'edit job' : isRename ? 'rename room' : isStep ? 'add a step' : isRoomMode ? 'add a room' : isCapture ? 'quick add' : '+ add a job',
      fieldLabel: anyShoppingSheet ? 'item' : isRoomMode || isRename ? 'room name' : isStep ? 'step' : 'job',
      placeholder: anyShoppingSheet ? 'e.g. paint rollers' : isRoomMode || isRename ? 'room name…' : isStep ? 'new step…' : isCapture ? 'what needs doing…' : 'e.g. tile the splashback',
      showDelete: isEdit || isEditShopping,
      saveLabel: anyShoppingSheet ? (isEditShopping ? 'save' : 'add item') : (isEdit || isRename) ? 'save' : isRoomMode ? 'add room' : isStep ? 'add step' : 'add job',
      inputMode: 'text',
      showRoomPick: isCapture || isJob || anyShoppingSheet,
      roomId: sheet.roomId || '',
      roomOptions: anyShoppingSheet ? [{ id: '', name: 'no room' }, ...rooms.map((r) => ({ id: r.id, name: r.name }))] : (isCapture || isJob) ? rooms.map((r) => ({ id: r.id, name: r.name })) : [],
      showStatus: isCapture || isJob || isEdit,
      showEditActions: isEdit,
      showNotes: isEdit,
      showLink: anyShoppingSheet,
      showSource: anyShoppingSheet,
      link: sheet.link || '',
      source: sheet.source || '',
      stuckReason: sheet.stuckReason || '',
      notes: sheet.notes || '',
      status: sheet.status || 'todo',
    };
  }

  const historyEntries = completionHistory(rooms);
  const isHome = screen === 'home' && !!rooms.length;
  const isRoom = screen === 'room' && !!roomDetail;
  const isShopping = screen === 'shopping';
  const isHistory = screen === 'history';


  if (sheetView) lastSheetView.current = sheetView;
  useEffect(() => {
    if (sheetView) return undefined;
    const last = lastSheetView.current;
    lastSheetView.current = null;
    if (!last || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    setLeavingSheet(last);
    const t = setTimeout(() => setLeavingSheet(null), 240);
    return () => clearTimeout(t);
  }, [!!sheetView]); // eslint-disable-line react-hooks/exhaustive-deps
  const shownSheet = sheetView || leavingSheet;
  const stageRef = useRef(null);
  useSwipeBack(stageRef, screen !== 'home' && !shownSheet && !confirm, () => back('instant'));

  return (
    <div
      className={`hq-app-shell${isHome ? ' hq-app-shell--home' : ''}`}
      style={{
        minHeight: '100dvh',
        background: theme.mat,
        color: '#241A33',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        '--hq-folder-paper': theme.cream,
        '--hq-board-blue': '#4164FF',
        '--hq-board-coral': '#F5546D',
        '--hq-board-lime': '#CCF74C',
      }}
    >

      <div className="hq-app-stage" ref={stageRef} style={{ maxWidth: 480, margin: '0 auto', position: 'relative', minHeight: '100dvh' }}>
        {/* No top padding — each screen's pinned header supplies its own, so
            spacing looks the same whether it's stuck to the top or not. */}
        <div style={{ padding: '0 16px max(64px, calc(env(safe-area-inset-bottom) + 52px))', boxSizing: 'border-box' }}>

          {/* Home stays mounted (just hidden) while another screen is open, so
              going back shows it immediately instead of rebuilding every card
              and reloading its art, which left Safari blank for a moment. */}
          <div hidden={!isHome}>
            <HomeDashboard rooms={bentoRooms} overallPct={overallPct} allDone={allDone} allTotal={allTotal} roomsDone={roomsDone}
              shoppingCount={shopping.filter((item) => !item.done).length} completedCount={historyEntries.length}
              onShopping={openShopping} onHistory={openHistory} onCapture={openCapture} onAddRoom={openAddRoom}
              morphRoomId={morphRoomId} />
          </div>

          {isRoom && (
            <RoomDetail
              theme={theme}
              matText75={matText75}
              roomDetail={roomDetail}
              onBack={goHome}
              onRename={openRenameRoom}
              onDelete={confirmDeleteRoom}
              onShopping={openShopping}
              onHistory={openHistory}
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
              onEdit={openEditShopping}
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

        {shownSheet && (
          <SheetModal
            sheet={shownSheet}
            leaving={!sheetView}
            theme={theme}
            onClose={closeSheet}
            onStop={stopClick}
            onNameChange={setSheetName}
            onRoomChange={setSheetRoom}
            onStatusChange={setSheetStatus}
            onStuckReasonChange={setSheetStuckReason}
            onNotesChange={setSheetNotes}
            onLinkChange={setSheetLink}
            onSourceChange={setSheetSource}
            onAddStep={() => setSheet({ mode: 'step', roomId: sheet.roomId, taskId: sheet.taskId, name: '' })}
            onMoveUp={() => moveJob(-1)}
            onMoveDown={() => moveJob(1)}
            onKeyDown={sheetKeyDown}
            onSave={saveSheet}
            onDelete={deleteSheetItem}
          />
        )}

        {confirm && (
          <ConfirmDialog
            confirm={confirm}
            theme={theme}
            onCancel={() => setConfirm(null)}
            onStop={stopClick}
          />
        )}

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


























