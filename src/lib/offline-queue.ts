import { supabase } from "@/integrations/supabase/client";

type Table = "attendance" | "workout_completions";
type Item = { id: string; table: Table; row: Record<string, unknown> };
const KEY = "ff_offline_queue";

function read(): Item[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function write(items: Item[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function isOffline() {
  return typeof navigator !== "undefined" && !navigator.onLine;
}

/** Save a row now if online, otherwise queue it to sync later. Returns true if queued. */
export async function insertOrQueue(table: Table, row: Record<string, unknown>) {
  if (!isOffline()) {
    const { data, error } = await supabase.from(table).insert(row as never).select().single();
    if (!error) return { queued: false, data, error: null };
    if (!/fetch|network/i.test(error.message)) return { queued: false, data: null, error };
  }
  const items = read();
  items.push({ id: crypto.randomUUID(), table, row });
  write(items);
  return { queued: true, data: { id: `offline-${Date.now()}`, ...row, checked_in_at: new Date().toISOString() }, error: null };
}

let flushing = false;
export async function flushQueue() {
  if (flushing || isOffline()) return;
  flushing = true;
  try {
    const remaining: Item[] = [];
    for (const it of read()) {
      const { error } = await supabase.from(it.table).insert(it.row as never);
      // keep only network failures; drop duplicates/validation errors
      if (error && /fetch|network/i.test(error.message)) remaining.push(it);
    }
    write(remaining);
  } finally {
    flushing = false;
  }
}

/** Call once from a useEffect. */
export function startOfflineSync() {
  flushQueue();
  window.addEventListener("online", flushQueue);
  return () => window.removeEventListener("online", flushQueue);
}
