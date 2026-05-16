import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Check, X, Plus, Loader2, Flame, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface WeekDayStripProps {
  userId: string;
}

// day_of_week convention: Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6, Sun=7
const DAYS = [
  { key: 1, short: "MON", full: "Monday", focus: "chest" as string | null },
  { key: 2, short: "TUE", full: "Tuesday", focus: "back" },
  { key: 3, short: "WED", full: "Wednesday", focus: "legs" },
  { key: 4, short: "THU", full: "Thursday", focus: "shoulders" },
  { key: 5, short: "FRI", full: "Friday", focus: "arms" },
  { key: 6, short: "SAT", full: "Saturday", focus: "abs" },
  { key: 7, short: "SUN", full: "Sunday", focus: null }, // mix
];

const normalizeText = (v: string) =>
  (v || "").toLowerCase().replace(/&/g, " and ").replace(/[\s\-_]+/g, " ").replace(/[^a-z0-9 ]/g, "").trim();

const normalizeBodyPart = (bp: string) => {
  const k = normalizeText(bp);
  const aliases: Record<string, string> = {
    ab: "abs", abs: "abs", core: "abs",
    arm: "arms", arms: "arms",
    bicep: "biceps", biceps: "biceps",
    calf: "calves", calves: "calves",
    glute: "glutes", glutes: "glutes",
    leg: "legs", legs: "legs",
    shoulder: "shoulders", shoulders: "shoulders",
    tricep: "triceps", triceps: "triceps",
  };
  return aliases[k] ?? k;
};

const titleCase = (v: string) =>
  normalizeText(v).split(" ").filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

const focusMatch = (bp: string, focus: string) => {
  const n = normalizeBodyPart(bp);
  if (focus === "arms") return ["arms", "biceps", "triceps"].includes(n);
  if (focus === "legs") return ["legs", "calves", "glutes", "quads", "hamstrings"].includes(n);
  if (focus === "abs") return n === "abs";
  return n === focus;
};

const dedupeByName = <T extends { id: string; name: string; video_url?: string | null; gif_url?: string | null }>(list: T[]) => {
  const m = new Map<string, T>();
  for (const e of list) {
    const k = normalizeText(e.name);
    if (!k) continue;
    const cur = m.get(k);
    const has = !!e.video_url || !!e.gif_url;
    const curHas = cur && (!!cur.video_url || !!cur.gif_url);
    if (!cur || (has && !curHas)) m.set(k, e);
  }
  return Array.from(m.values());
};

// JS getDay(): Sun=0..Sat=6 → our: Sun=7, Mon=1..Sat=6
const todayDow = () => {
  const d = new Date().getDay();
  return d === 0 ? 7 : d;
};

export function WeekDayStrip({ userId }: WeekDayStripProps) {
  const [selectedDay, setSelectedDay] = useState<number>(todayDow());
  const [scheduled, setScheduled] = useState<any[]>([]);
  const [allExercises, setAllExercises] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Set<number>>(new Set()); // dows present this week
  const [editing, setEditing] = useState(false);
  const [picking, setPicking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Record<string, string>>({}); // exercise_id -> completion row id
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Load scheduled exercises for selected day
  const loadDay = async () => {
    const { data } = await supabase
      .from("workout_schedules")
      .select("*, exercises(*)")
      .eq("user_id", userId)
      .eq("day_of_week", selectedDay)
      .order("order_index");
    setScheduled(data || []);
  };

  useEffect(() => {
    if (!userId) return;
    loadDay();
  }, [userId, selectedDay]);

  const loadCompletions = async () => {
    const { data } = await supabase
      .from("workout_completions")
      .select("id, exercise_id")
      .eq("user_id", userId)
      .eq("scheduled_day", selectedDay)
      .eq("completed_on", todayKey);
    const map: Record<string, string> = {};
    (data || []).forEach((row: any) => { map[row.exercise_id] = row.id; });
    setCompleted(map);
  };

  useEffect(() => {
    if (!userId) return;
    loadCompletions();
  }, [userId, selectedDay, todayKey]);

  // Load all exercises for picker — filtered by user's gender
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("gender")
        .eq("user_id", userId)
        .maybeSingle();
      const gender = (profile?.gender || "both").toLowerCase();
      const { data } = await supabase
        .from("exercises")
        .select("*")
        .or(`gender_target.eq.both,gender_target.eq.${gender}`)
        .order("body_part");
      setAllExercises(data || []);
    })();
  }, [userId]);

  // Load this week attendance to highlight present days
  useEffect(() => {
    if (!userId) return;
    const weekStart = new Date();
    const day = weekStart.getDay(); // Sun=0..Sat=6
    const diffToMon = day === 0 ? -6 : 1 - day;
    weekStart.setDate(weekStart.getDate() + diffToMon);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    supabase
      .from("attendance")
      .select("checked_in_at,status")
      .eq("user_id", userId)
      .eq("status", "present")
      .gte("checked_in_at", weekStart.toISOString())
      .lt("checked_in_at", weekEnd.toISOString())
      .then(({ data }) => {
        const set = new Set<number>();
        (data || []).forEach((a: any) => {
          const d = new Date(a.checked_in_at).getDay();
          set.add(d === 0 ? 7 : d);
        });
        setAttendance(set);
      });
  }, [userId]);

  const scheduledIds = new Set(scheduled.map((s) => s.exercise_id));

  const toggleExercise = async (exerciseId: string) => {
    if (scheduledIds.has(exerciseId)) {
      // remove
      const row = scheduled.find((s) => s.exercise_id === exerciseId);
      if (!row) return;
      setSaving(true);
      const { error } = await supabase.from("workout_schedules").delete().eq("id", row.id);
      setSaving(false);
      if (error) { toast.error("Could not remove exercise"); return; }
      toast.success("Removed");
      loadDay();
    } else {
      // add
      setSaving(true);
      const { error } = await supabase.from("workout_schedules").insert({
        user_id: userId,
        exercise_id: exerciseId,
        day_of_week: selectedDay,
        order_index: scheduled.length,
      });
      setSaving(false);
      if (error) { toast.error("Could not add exercise"); return; }
      toast.success("Added");
      loadDay();
    }
  };

  const toggleDone = async (exerciseId: string) => {
    setCompletingId(exerciseId);
    const completionId = completed[exerciseId];
    if (completionId) {
      const { error } = await supabase.from("workout_completions").delete().eq("id", completionId).eq("user_id", userId);
      setCompletingId(null);
      if (error) { toast.error("Could not remove done"); return; }
      setCompleted((prev) => {
        const next = { ...prev };
        delete next[exerciseId];
        return next;
      });
      return;
    }

    const { data, error } = await supabase
      .from("workout_completions")
      .insert({ user_id: userId, exercise_id: exerciseId, scheduled_day: selectedDay, completed_on: todayKey })
      .select("id")
      .single();
    setCompletingId(null);
    if (error) { toast.error("Could not mark done"); return; }
    setCompleted((prev) => ({ ...prev, [exerciseId]: data.id }));
    toast.success("Exercise done ✔");
  };

  const dayInfo = DAYS.find((d) => d.key === selectedDay)!;
  const dayLabel = dayInfo.full;
  const dayFocus = dayInfo.focus;
  const isSunday = selectedDay === 7;
  const doneCount = scheduled.filter((s) => completed[s.exercise_id]).length;

  // Dedupe + normalize for picker
  const uniqueExercises = useMemo(() => dedupeByName(allExercises), [allExercises]);

  // Suggested exercises for the day (focus-matched, or mix for Sunday)
  const suggested = useMemo(() => {
    if (isSunday) {
      const groups = ["chest", "back", "legs", "shoulders", "arms", "abs"];
      return groups.flatMap((g) => uniqueExercises.filter((e) => focusMatch(e.body_part, g)).slice(0, 1));
    }
    if (!dayFocus) return [];
    return uniqueExercises.filter((e) => focusMatch(e.body_part, dayFocus));
  }, [uniqueExercises, dayFocus, isSunday]);

  // Group all exercises by normalized body part for picker
  const grouped = useMemo(() => {
    const g: Record<string, any[]> = {};
    uniqueExercises.forEach((e) => {
      const k = titleCase(normalizeBodyPart(e.body_part || "Other")) || "Other";
      if (!g[k]) g[k] = [];
      g[k].push(e);
    });
    // sort: focus group first
    const focusKey = dayFocus ? titleCase(dayFocus) : "";
    const entries = Object.entries(g).sort(([a], [b]) => {
      if (a === focusKey) return -1;
      if (b === focusKey) return 1;
      return a.localeCompare(b);
    });
    return entries;
  }, [uniqueExercises, dayFocus]);

  return (
    <div className="rounded-2xl border border-sky/20 bg-card/60 backdrop-blur-md p-4 space-y-4">
      {/* Day strip */}
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg tracking-wider text-sky">WEEKLY PLAN</h3>
        <div className="flex items-center gap-1.5 rounded-full bg-ember/15 px-2.5 py-1 ring-1 ring-ember/30">
          <Flame className="h-3 w-3 text-ember" />
          <span className="text-[10px] font-bold text-ember font-body uppercase tracking-wider">
            {attendance.size}/6 this week
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DAYS.map((d) => {
          const isSelected = d.key === selectedDay;
          const isToday = d.key === todayDow();
          const hasAttendance = attendance.has(d.key);
          const isRest = d.key === 7;
          return (
            <button
              key={d.key}
              onClick={() => { setSelectedDay(d.key); setEditing(false); setPicking(false); }}
              className={`relative flex flex-col items-center justify-center py-2 rounded-lg text-[10px] font-bold font-body uppercase tracking-wider transition-all
                ${isSelected ? "bg-primary text-primary-foreground shadow-glow scale-105" : ""}
                ${!isSelected && isToday ? "bg-sky/20 text-sky ring-1 ring-sky/40" : ""}
                ${!isSelected && !isToday && hasAttendance ? "bg-success/15 text-success" : ""}
                ${!isSelected && !isToday && !hasAttendance && isRest ? "bg-secondary/30 text-muted-foreground/60" : ""}
                ${!isSelected && !isToday && !hasAttendance && !isRest ? "bg-secondary/50 text-foreground/70 hover:bg-secondary" : ""}
              `}
            >
              {d.short}
              {hasAttendance && !isSelected && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-success" />
              )}
            </button>
          );
        })}
      </div>

      {/* Day header */}
      <div className="flex items-center justify-between border-t border-border/40 pt-3">
        <div>
          <p className="font-heading text-xl tracking-wider text-foreground">{dayLabel.toUpperCase()}</p>
          <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">
            {isSunday ? "Mix · pick anything" : `Focus: ${titleCase(dayFocus || "")} • ${scheduled.length} picked • ${doneCount} done`}
          </p>
        </div>
        <button
          onClick={() => { setEditing(!editing); setPicking(false); }}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider font-body ring-1 transition-all
            ${editing ? "bg-ember/20 text-ember ring-ember/40" : "bg-secondary/60 text-foreground ring-border hover:bg-secondary"}`}
        >
          {editing ? <Check className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
          {editing ? "Done" : "Edit"}
        </button>
      </div>

      {/* Suggested for this day (when nothing scheduled) */}
      {scheduled.length === 0 && !picking && suggested.length > 0 && (
        <div className="rounded-xl bg-secondary/30 p-3 space-y-2">
          <p className="text-[10px] font-bold text-ember uppercase tracking-wider font-body">
            Suggested for {dayLabel} {isSunday ? "(mix)" : `· ${titleCase(dayFocus || "")}`}
          </p>
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {suggested.map((ex) => (
              <label
                key={ex.id}
                className="flex items-center gap-2.5 rounded-lg bg-background/40 px-2.5 py-1.5 cursor-pointer hover:bg-background/70 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={scheduledIds.has(ex.id)}
                  onChange={() => toggleExercise(ex.id)}
                  disabled={saving}
                  className="h-4 w-4 accent-primary cursor-pointer"
                />
                <span className="text-xs font-bold font-body text-foreground flex-1 truncate">{ex.name}</span>
                <span className="text-[9px] text-muted-foreground font-body uppercase tracking-wider">
                  {titleCase(normalizeBodyPart(ex.body_part))}
                </span>
              </label>
            ))}
          </div>
          <button
            onClick={() => { setEditing(true); setPicking(true); }}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary/15 text-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider font-body ring-1 ring-primary/30 hover:bg-primary/25"
          >
            <Plus className="h-3 w-3" /> Browse all exercises
          </button>
        </div>
      )}

      {scheduled.length > 0 && (
        <div className="space-y-2">
          {scheduled.map((s) => {
            const key = `${selectedDay}-${s.id}`;
            const done = !!completed[key];
            return (
              <div
                key={s.id}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ring-1 transition-all
                  ${done ? "bg-success/10 ring-success/30" : "bg-secondary/40 ring-border/50"}`}
              >
                <button
                  onClick={() => toggleDone(s.id)}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-1 transition-all
                    ${done ? "bg-success text-success-foreground ring-success" : "bg-background ring-border hover:ring-primary"}`}
                  aria-label="Mark done"
                >
                  {done && <CheckCircle2 className="h-4 w-4" />}
                </button>
                {s.exercises?.thumbnail_url && (
                  <img
                    src={s.exercises.thumbnail_url}
                    alt={s.exercises?.name || "Exercise"}
                    className="h-12 w-12 shrink-0 rounded-lg object-cover ring-1 ring-sky/30 shadow-glow"
                    loading="lazy"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold font-body truncate ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {s.exercises?.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">
                    {s.exercises?.body_part} • {s.exercises?.sets || 3} × {s.exercises?.reps || "12"}
                  </p>
                </div>
                {editing && (
                  <button
                    onClick={() => toggleExercise(s.exercise_id)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-destructive/15 text-destructive ring-1 ring-destructive/30 hover:bg-destructive/25"
                    aria-label="Remove"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add more button when editing */}
      {editing && !picking && (
        <button
          onClick={() => setPicking(true)}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary/40 text-primary py-2.5 text-xs font-bold uppercase tracking-wider font-body hover:bg-primary/10"
        >
          <Plus className="h-3.5 w-3.5" /> Add more exercises
        </button>
      )}

      {/* Picker — checkbox list grouped by body part */}
      {editing && picking && (
        <div className="rounded-xl border border-sky/30 bg-background/40 p-3 space-y-3 max-h-80 overflow-y-auto">
          <div className="flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur py-1 -mx-3 px-3 border-b border-border/40">
            <p className="font-heading text-sm tracking-wider text-sky">PICK EXERCISES</p>
            <div className="flex items-center gap-2">
              {saving && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
              <button onClick={() => setPicking(false)} className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground font-body">
                Close
              </button>
            </div>
          </div>
          {grouped.map(([part, list]) => (
            <div key={part}>
              <p className="text-[10px] font-bold text-ember uppercase tracking-wider font-body mb-1.5">{part}</p>
              <div className="space-y-1">
                {list.map((ex) => {
                  const checked = scheduledIds.has(ex.id);
                  return (
                    <label
                      key={ex.id}
                      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors
                        ${checked ? "bg-primary/15 ring-1 ring-primary/30" : "bg-secondary/40 hover:bg-secondary/70"}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleExercise(ex.id)}
                        disabled={saving}
                        className="h-4 w-4 accent-primary cursor-pointer"
                      />
                      <span className="text-xs font-bold font-body text-foreground flex-1 truncate">{ex.name}</span>
                      <span className="text-[9px] text-muted-foreground font-body uppercase tracking-wider">
                        {ex.sets || 3}×{ex.reps || "12"}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
