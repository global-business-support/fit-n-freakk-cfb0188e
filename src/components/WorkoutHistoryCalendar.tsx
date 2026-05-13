import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays, Dumbbell, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  userId: string;
}

export function WorkoutHistoryCalendar({ userId }: Props) {
  const [month, setMonth] = useState<Date>(new Date());
  const [completions, setCompletions] = useState<Array<{ completed_on: string; exercises: { name: string; body_part: string } | null }>>([]);
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const start = new Date(month.getFullYear(), month.getMonth(), 1).toISOString().slice(0, 10);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 1).toISOString().slice(0, 10);
    supabase
      .from("workout_completions")
      .select("completed_on, exercises(name, body_part)")
      .eq("user_id", userId)
      .gte("completed_on", start)
      .lt("completed_on", end)
      .order("completed_on", { ascending: false })
      .then(({ data }) => {
        setCompletions((data ?? []) as any);
        setLoading(false);
      });
  }, [userId, month]);

  const dayKey = (d: Date) => d.toISOString().slice(0, 10);
  const completedDays = new Set(completions.map((c) => c.completed_on));
  const selectedKey = selected ? dayKey(selected) : "";
  const dayItems = completions.filter((c) => c.completed_on === selectedKey);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <p className="font-heading text-base tracking-wider">WORKOUT HISTORY</p>
            <p className="text-[11px] text-muted-foreground font-body">
              Tap any day to see what you trained
            </p>
          </div>
        </div>
      </div>

      <div className="p-3">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={setSelected}
          month={month}
          onMonthChange={setMonth}
          modifiers={{ done: (d) => completedDays.has(dayKey(d)) }}
          modifiersClassNames={{
            done: "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1.5 after:w-1.5 after:rounded-full after:bg-primary",
          }}
          className={cn("p-0 pointer-events-auto mx-auto")}
        />
      </div>

      <div className="border-t border-border p-3 space-y-2 bg-card/60">
        <p className="text-xs uppercase tracking-wider font-body text-muted-foreground">
          {selected ? selected.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }) : "Pick a date"}
        </p>
        {loading ? (
          <p className="text-sm text-muted-foreground font-body py-3 text-center">Loading…</p>
        ) : dayItems.length === 0 ? (
          <p className="text-sm text-muted-foreground font-body py-4 text-center">
            No workouts logged on this day.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {dayItems.map((item, i) => (
              <li key={i} className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
                <Dumbbell className="h-4 w-4 text-primary shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-body font-semibold truncate">
                    {item.exercises?.name ?? "Exercise"}
                  </p>
                  {item.exercises?.body_part && (
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body">
                      {item.exercises.body_part}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
