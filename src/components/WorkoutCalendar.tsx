import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Flame, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface WorkoutCalendarProps {
  userId: string;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function WorkoutCalendar({ userId }: WorkoutCalendarProps) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [attendance, setAttendance] = useState<any[]>([]);
  const [selected, setSelected] = useState<Date>(today);
  const [dayExercises, setDayExercises] = useState<any[]>([]);

  // Load month attendance
  useEffect(() => {
    if (!userId) return;
    const start = new Date(viewYear, viewMonth, 1);
    const end = new Date(viewYear, viewMonth + 1, 1);
    supabase
      .from("attendance")
      .select("*")
      .eq("user_id", userId)
      .gte("checked_in_at", start.toISOString())
      .lt("checked_in_at", end.toISOString())
      .then(({ data }) => setAttendance(data || []));
  }, [userId, viewMonth, viewYear]);

  // Load exercises for selected day
  useEffect(() => {
    if (!userId) return;
    const dow = selected.getDay() || 7; // Sun=7
    supabase
      .from("workout_schedules")
      .select("*, exercises(*)")
      .eq("user_id", userId)
      .eq("day_of_week", dow)
      .order("order_index")
      .then(({ data }) => setDayExercises(data || []));
  }, [userId, selected]);

  const grid = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) cells.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) cells.push(new Date(viewYear, viewMonth, d));
    return cells;
  }, [viewMonth, viewYear]);

  const attMap = useMemo(() => {
    const m: Record<string, string> = {};
    attendance.forEach((a) => {
      const k = new Date(a.checked_in_at).toDateString();
      m[k] = a.status || "present";
    });
    return m;
  }, [attendance]);

  const streak = useMemo(() => {
    let s = 0;
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    for (let i = 0; i < 60; i++) {
      const d = new Date(t);
      d.setDate(d.getDate() - i);
      if (attMap[d.toDateString()] === "present") s++;
      else if (i > 0) break;
    }
    return s;
  }, [attMap]);

  const goPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const goNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const presentDays = Object.values(attMap).filter((s) => s === "present").length;
  const absentDays = Object.values(attMap).filter((s) => s === "absent").length;

  return (
    <div className="rounded-2xl border border-sky/20 bg-card/60 backdrop-blur-md p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button onClick={goPrev} className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/60 text-foreground hover:bg-secondary">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="font-heading text-lg tracking-wider text-foreground min-w-[110px] text-center">
            {MONTH_LABELS[viewMonth]} {viewYear}
          </p>
          <button onClick={goNext} className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/60 text-foreground hover:bg-secondary">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-ember/15 px-3 py-1 ring-1 ring-ember/30">
          <Flame className="h-3.5 w-3.5 text-ember" />
          <span className="text-xs font-bold text-ember font-body">{streak} day streak</span>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-body py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">
        {grid.map((date, i) => {
          if (!date) return <div key={i} />;
          const k = date.toDateString();
          const status = attMap[k];
          const isToday = k === today.toDateString();
          const isSelected = k === selected.toDateString();
          const isSunday = date.getDay() === 0;
          return (
            <button
              key={i}
              onClick={() => setSelected(date)}
              className={`relative aspect-square rounded-lg flex items-center justify-center text-sm font-body font-bold transition-all
                ${isSelected ? "ring-2 ring-primary scale-105" : "ring-1 ring-transparent"}
                ${isToday ? "bg-primary text-primary-foreground shadow-glow" : ""}
                ${!isToday && status === "present" ? "bg-success/25 text-success" : ""}
                ${!isToday && status === "absent" ? "bg-destructive/25 text-destructive" : ""}
                ${!isToday && !status && isSunday ? "bg-secondary/30 text-muted-foreground/60" : ""}
                ${!isToday && !status && !isSunday ? "bg-secondary/40 text-foreground/70 hover:bg-secondary/70" : ""}
              `}
            >
              {date.getDate()}
              {status === "present" && !isToday && (
                <span className="absolute bottom-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-success" />
              )}
            </button>
          );
        })}
      </div>

      {/* Stats row */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-success/10 ring-1 ring-success/20 px-2 py-1.5 text-center">
          <p className="text-[9px] text-success/80 uppercase tracking-wider font-body font-bold">Present</p>
          <p className="text-base font-bold text-success font-body">{presentDays}</p>
        </div>
        <div className="rounded-lg bg-destructive/10 ring-1 ring-destructive/20 px-2 py-1.5 text-center">
          <p className="text-[9px] text-destructive/80 uppercase tracking-wider font-body font-bold">Absent</p>
          <p className="text-base font-bold text-destructive font-body">{absentDays}</p>
        </div>
        <div className="rounded-lg bg-primary/10 ring-1 ring-primary/20 px-2 py-1.5 text-center">
          <p className="text-[9px] text-primary/80 uppercase tracking-wider font-body font-bold">Target</p>
          <p className="text-base font-bold text-primary font-body">{presentDays}/24</p>
        </div>
      </div>

      {/* Selected day exercises */}
      <div className="mt-4 border-t border-border/50 pt-3">
        <div className="flex items-center justify-between mb-2">
          <p className="font-heading text-base tracking-wider text-sky">
            {DAY_LABELS[selected.getDay()].toUpperCase()}, {MONTH_LABELS[selected.getMonth()]} {selected.getDate()}
          </p>
          {attMap[selected.toDateString()] === "present" && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-success font-body uppercase tracking-wider">
              <CheckCircle2 className="h-3 w-3" /> Present
            </span>
          )}
          {attMap[selected.toDateString()] === "absent" && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-destructive font-body uppercase tracking-wider">
              <XCircle className="h-3 w-3" /> Absent
            </span>
          )}
        </div>
        {selected.getDay() === 0 ? (
          <p className="text-center text-sm text-muted-foreground font-body py-3">🛌 Rest Day — Sunday Off</p>
        ) : dayExercises.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground font-body py-3">No workout scheduled</p>
        ) : (
          <div className="space-y-1.5">
            {dayExercises.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground font-body truncate">{s.exercises?.name}</p>
                  <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">
                    {s.exercises?.body_part}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="text-xs font-bold text-sky font-body">
                    {s.exercises?.sets || 3} × {s.exercises?.reps || "12"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
