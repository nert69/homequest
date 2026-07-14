// Cross-device sync: a household is identified by a short shareable code
// (not a login) — both phones store the same code and read/write the same
// row. Falls back to silent no-ops if Supabase isn't configured, so the app
// still works fully offline/local-only.
import { createClient } from '@supabase/supabase-js';

const HOUSEHOLD_KEY = 'homequest-v1-household';
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const syncEnabled = !!(url && anonKey);

const supabase = syncEnabled ? createClient(url, anonKey) : null;

export function loadHouseholdCode() {
  try { return localStorage.getItem(HOUSEHOLD_KEY) || null; } catch (e) { return null; }
}

export function saveHouseholdCode(code) {
  try { localStorage.setItem(HOUSEHOLD_KEY, code); } catch (e) { /* ignore */ }
}

export function clearHouseholdCode() {
  try { localStorage.removeItem(HOUSEHOLD_KEY); } catch (e) { /* ignore */ }
}

export function generateCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I ambiguity
  let code = '';
  for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
}

const DEFAULT_TIMEOUT_MS = 8000;

// Returns { ok, data }. ok:false means "couldn't reach the server" (network/timeout) —
// distinct from ok:true, data:null which means "server responded, no such household".
export async function fetchHousehold(code, timeoutMs = DEFAULT_TIMEOUT_MS) {
  if (!supabase) return { ok: true, data: null };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const { data, error } = await supabase
      .from('households').select('data, updated_at').eq('code', code)
      .abortSignal(controller.signal).maybeSingle();
    if (error) { console.error('fetchHousehold', error); return { ok: false, data: null }; }
    return { ok: true, data: data || null };
  } catch (e) {
    console.error('fetchHousehold', e);
    return { ok: false, data: null };
  } finally {
    clearTimeout(timer);
  }
}

export async function pushHousehold(code, payload, timeoutMs = DEFAULT_TIMEOUT_MS) {
  if (!supabase) return;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const { error } = await supabase
      .from('households').upsert({ code, data: payload, updated_at: new Date().toISOString() })
      .abortSignal(controller.signal);
    if (error) console.error('pushHousehold', error);
  } catch (e) {
    console.error('pushHousehold', e);
  } finally {
    clearTimeout(timer);
  }
}

// Calls onChange(payload) whenever another device updates this household's row.
// Returns an unsubscribe function.
export function subscribeHousehold(code, onChange) {
  if (!supabase) return () => {};
  const channel = supabase
    .channel('household-' + code)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'households', filter: `code=eq.${code}` }, (payload) => {
      onChange(payload.new);
    })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}
