// Room/task data model, default seed data, and the pure-logic helpers that
// drive the bento grid, theming, and copy. Ported 1:1 from the Claude Design
// prototype (HomeQuest Sticker Board (Gradient Boxes).dc.html).

export const THEMES = {
  camp: {
    mat: '#F3EFE5', cream: '#FFFCF3', accent: '#E8A93F',
    palette: ['#F2542D', '#2E86AB', '#FFB100', '#2F7A5C', '#1B998B', '#E893B3', '#3D348B', '#FFCF44'],
  },
  sunset: {
    mat: '#F6ECDF', cream: '#FFF3E4', accent: '#E8A93F',
    palette: ['#E85D4D', '#F7B32B', '#6A4C93', '#2E9E7A', '#F0A6A0', '#4A6FA5', '#D9552B', '#8E5FBF'],
  },
  ocean: {
    mat: '#EBEFEC', cream: '#EAF6F6', accent: '#6FBDB6',
    palette: ['#1B998B', '#F4A259', '#3D5A80', '#E07A5F', '#98C1D9', '#293241', '#5FD0C6', '#EE6C4D'],
  },
};

const ROOM_ICON_MAP = [
  ['downstairs hall', 'door_front'], ['front', 'house'], ['toilet', 'wc'], ['wc', 'wc'], ['kitchen', 'countertops'],
  ['hall', 'stairs'], ['landing', 'stairs'], ['stairs', 'stairs'], ['living', 'weekend'], ['lounge', 'weekend'],
  ['bed', 'bed'], ['bath', 'bathtub'], ['ensuite', 'shower'], ['shower', 'shower'],
  ['garden', 'yard'], ['yard', 'yard'], ['office', 'desk'], ['study', 'desk'], ['dining', 'table_restaurant'],
  ['garage', 'garage'], ['utility', 'local_laundry_service'], ['laundry', 'local_laundry_service'],
  ['nursery', 'crib'], ['kids', 'crib'], ['attic', 'roofing'], ['loft', 'roofing'], ['porch', 'deck'],
];
const ROOM_ICON_POOL = ['chair', 'light', 'door_front', 'window'];

export const STORAGE_KEY = 'homequest-v1';
export const PLAYER_STORAGE_KEY = STORAGE_KEY + '-player';
export const THEME_STORAGE_KEY = STORAGE_KEY + '-theme';

export function hashOf(str) {
  const l = String(str).toLowerCase();
  let h = 0;
  for (let i = 0; i < l.length; i++) h = (h * 31 + l.charCodeAt(i)) >>> 0;
  return h;
}

export function iconFor(name) {
  const l = String(name).toLowerCase();
  for (const [k, ic] of ROOM_ICON_MAP) if (l.includes(k)) return ic;
  return ROOM_ICON_POOL[hashOf(l) % ROOM_ICON_POOL.length];
}

export function lumOf(hex) {
  const n = parseInt(String(hex).replace('#', ''), 16);
  return (0.299 * (n >> 16 & 255) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255;
}

export function textFor(bg) {
  return lumOf(bg) > 0.62 ? '#241A33' : '#FFFCF3';
}

export function shapePalette(theme) {
  const bright = theme.palette.filter((c) => lumOf(c) > 0.42);
  return bright.length >= 3 ? bright : theme.palette;
}

export function shapeFor(label, palette) {
  const h = hashOf(label);
  return { stickerColor: palette[(h >>> 3) % palette.length] };
}

export function headlineFor(pct) {
  if (pct <= 0) return 'Nothing’s done yet.\nLet’s fix that.';
  if (pct < 25) return 'Building-site chic.';
  if (pct < 50) return 'Getting somewhere.';
  if (pct < 75) return 'Past the halfway wall.';
  if (pct < 100) return 'Nearly liveable.';
  return 'House. Officially\na home.';
}

export function roomColor(rooms, theme, roomId) {
  const idx = rooms.findIndex((r) => r.id === roomId);
  return theme.palette[(idx < 0 ? 0 : idx) % theme.palette.length];
}

export function mk(id, label, state) {
  const doing = state === 'doing';
  const done = state === true || state === 'done';
  return { id, label, done, doing, completedAt: done ? Date.now() : null, cost: 0, subs: [] };
}

// keep a subs-having task's done/doing in sync with its steps
export function resyncSubs(t) {
  if (!t.subs || !t.subs.length) return { ...t, done: false, doing: false };
  const doneN = t.subs.filter((s) => s.done).length;
  return { ...t, done: doneN === t.subs.length, doing: doneN > 0 && doneN < t.subs.length };
}

export function buildDefaultRooms() {
  return [
    { id: 'front', name: 'Front', tasks: [
      mk('fr1', 'New stones', 'doing'), mk('fr2', 'Outdoor Govee light', 'done'), mk('fr3', 'New house number', false),
      mk('fr4', 'Paint peak', false), mk('fr5', 'Remove moss on driveway', false), mk('fr6', 'Cut down bush', false),
      mk('fr7', 'Remove weeds', false), mk('fr8', 'Ring doorbell', false),
    ] },
    { id: 'dhall', name: 'Downstairs Hallway', tasks: [
      mk('dh1', 'Lampshade', false), mk('dh2', 'Frames', false), mk('dh3', 'Paint', false),
    ] },
    { id: 'dtoilet', name: 'Downstairs Toilet', tasks: [
      mk('dt1', 'Govee bulb', false), mk('dt2', 'Frame', false), mk('dt3', 'Wings put up', false), mk('dt4', 'Mirror put up', false),
      mk('dt5', 'Internal door', false), mk('dt6', 'Replace tiles', false), mk('dt7', 'Fix sealant', false), mk('dt8', 'Paint', false),
    ] },
    { id: 'kitchen', name: 'Kitchen', tasks: [
      mk('k1', 'Internal door', false), mk('k2', 'Blinds', false), mk('k3', 'Frames', false), mk('k4', 'Govee bulbs', false),
      mk('k5', 'Fix sealant', false), mk('k6', 'Paint', false), mk('k7', 'Window sill', false),
    ] },
    { id: 'hallway', name: 'Hallway', tasks: [
      mk('h1', 'Frames', false), mk('h2', 'Internal doors', false), mk('h3', 'Strip banister', false),
      mk('h4', 'Paint', false), mk('h5', 'Carpet', false),
    ] },
    { id: 'living', name: 'Living Room', tasks: [
      mk('l1', 'Coffee table', false), mk('l2', 'Rug', false), mk('l3', 'Wooden floor', false), mk('l4', 'Blinds', false),
      mk('l5', 'Light fixture', false), mk('l6', 'Fix & fill holes', false), mk('l7', 'Internal doors', false),
      mk('l8', 'Paint', false), mk('l9', 'Internal windows', false), mk('l10', 'Radiator', false),
    ] },
    { id: 'bedroom', name: 'Bedroom', tasks: [
      mk('b1', 'Internal door', false), mk('b2', 'Anchor points', false), mk('b3', 'New mirror', false), mk('b4', 'Update frames', false),
      mk('b5', 'Bedside tables', false), mk('b6', 'TV', false), mk('b7', 'Blinds', false), mk('b8', 'Paint', false), mk('b9', 'Frames', false),
    ] },
    { id: 'bathroom', name: 'Bathroom', tasks: [
      mk('ba1', 'Internal door', false), mk('ba2', 'New blinds', false), mk('ba3', 'Reseal shower', false),
      mk('ba4', 'Fix skirting', false), mk('ba5', 'Paint', false),
    ] },
  ];
}

// Packs rooms into a 2-column bento grid with zero gaps, guaranteed.
// Each "unit" below always advances both columns by an equal number of
// rows before the next unit starts, so the grid can never end up with a
// dangling half-filled row. Completed rooms are only ever placed as a
// compact 1x1 'done' cell (or a full-width 'doneWide' if left dangling
// alone at the very end) — never tall/wide/big — so their shorter card
// content never mismatches a taller neighbor.
export function packShapes(rooms) {
  const n = rooms.length;
  const shapes = new Array(n).fill('sm');
  const choices = ['trio', 'wide', 'pair', 'big', 'trio', 'pair', 'wide'];
  let i = 0, choiceIdx = 0, bigUsed = false;
  while (i < n) {
    const remaining = n - i;
    if (rooms[i].complete) {
      if (remaining >= 2) {
        shapes[i] = 'done';
        shapes[i + 1] = rooms[i + 1].complete ? 'done' : 'sm';
        i += 2;
      } else {
        shapes[i] = 'doneWide';
        i += 1;
      }
      continue;
    }
    let unit = choices[choiceIdx % choices.length]; choiceIdx++;
    if (unit === 'big' && bigUsed) unit = 'wide';
    if (unit === 'trio' && remaining < 3) unit = 'wide';
    if (unit === 'pair' && remaining < 2) unit = 'wide';
    if (unit === 'wide') { shapes[i] = 'wide'; i += 1; }
    else if (unit === 'big') { shapes[i] = 'big'; bigUsed = true; i += 1; }
    else if (unit === 'pair') {
      shapes[i] = 'sm';
      shapes[i + 1] = rooms[i + 1].complete ? 'done' : 'sm';
      i += 2;
    } else if (unit === 'trio') {
      shapes[i] = 'tall';
      shapes[i + 1] = rooms[i + 1].complete ? 'done' : 'sm';
      shapes[i + 2] = rooms[i + 2].complete ? 'done' : 'sm';
      i += 3;
    }
  }
  return shapes;
}

export function loadRooms() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (Array.isArray(saved) && saved.length) return saved;
    }
  } catch (e) { /* ignore corrupt storage */ }
  return buildDefaultRooms();
}

export function saveRooms(rooms) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms)); } catch (e) { /* storage full/unavailable */ }
}

export function loadTheme() {
  try {
    const t = localStorage.getItem(THEME_STORAGE_KEY);
    if (t && THEMES[t]) return t;
  } catch (e) { /* ignore */ }
  return 'camp';
}

export function saveTheme(theme) {
  try { localStorage.setItem(THEME_STORAGE_KEY, theme); } catch (e) { /* ignore */ }
}
