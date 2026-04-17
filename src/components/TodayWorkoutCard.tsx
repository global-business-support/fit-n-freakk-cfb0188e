import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Flame, Play, ChevronRight, Dumbbell, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const DAY_NAMES = ["", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const DAY_SHORT = ["", "MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function TodayWorkoutCard({ userId }: { userId: string }) {
  const [todayExercises, setTodayExercises] = useState<any[]>([]);
  const [weekMap, setWeekMap] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const todayDay = new Date().getDay() || 7;

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("workout_schedules")
      .select("*, exercises(*)")
      .eq("user_id", userId)
      .order("order_index")
      .then(({ data }) => {
        const all = data || [];
        setTodayExercises(all.filter((s: any) => s.day_of_week === todayDay));
        const map: Record<number, number> = {};
        all.forEach((s: any) => {
          map[s.day_of_week] = (map[s.day_of_week] || 0) + 1;
        });
        setWeekMap(map);
        setLoading(false);
      });
  }, [userId, todayDay]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card to-sky/10 p-5 shadow-glow">
      {/* Decorative glows */}
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/30 blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-sky/20 blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Flame className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-sky font-body font-bold">Today's Plan</p>
              <h3 className="font-heading text-xl tracking-wider text-foreground leading-none">{DAY_NAMES[todayDay]}</h3>
            </div>
          </div>
          <Link to="/workouts" className="flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary font-body ring-1 ring-primary/30 hover:bg-primary/30 transition-colors">
            View All <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Week strip */}
        <div className="mt-4 grid grid-cols-7 gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7].map((d) => {
            const count = weekMap[d] || 0;
            const isToday = d === todayDay;
            const hasWorkout = count > 0;
            return (
              <div
                key={d}
                className={cn(
                  "relative flex flex-col items-center gap-1 rounded-xl py-2 transition-all",
                  isToday
                    ? "bg-gradient-primary text-primary-foreground shadow-glow scale-105"
                    : hasWorkout
                    ? "bg-sky/10 text-sky ring-1 ring-sky/30"
                    : "bg-secondary/40 text-muted-foreground"
                )}
              >
                <span className="text-[9px] font-body font-bold tracking-wider">{DAY_SHORT[d]}</span>
                <span className="text-sm font-heading">{count > 0 ? count : "—"}</span>
                {isToday && <span className="absolute -top-1 right-0.5 h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />}
              </div>
            );
          })}
        </div>

        {/* Exercises preview */}
        <div className="mt-4">
          {loading ? (
            <div className="h-20 animate-pulse rounded-xl bg-secondary/30" />
          ) : todayExercises.length === 0 ? (
            <div className="rounded-xl bg-card/60 ring-1 ring-border p-4 text-center">
              <Sparkles className="h-5 w-5 mx-auto mb-1 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground font-body">Rest day! No exercises scheduled.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayExercises.slice(0, 3).map((s: any) => (
                <div key={s.id} className="flex items-center gap-3 rounded-xl bg-card/70 ring-1 ring-border p-2.5 backdrop-blur-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Dumbbell className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-sm truncate">{s.exercises?.name}</p>
                    <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">
                      {s.exercises?.body_part}
                      {s.exercises?.sets && ` • ${s.exercises.sets}×${s.exercises.reps || ""}`}
                    </p>
                  </div>
                  {s.exercises?.video_url && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ember/15 text-ember">
                      <Play className="h-3.5 w-3.5 fill-current" />
                    </div>
                  )}
                </div>
              ))}
              {todayExercises.length > 3 && (
                <Link to="/workouts" className="block text-center text-xs font-body font-bold text-primary uppercase tracking-wider py-1 hover:text-sky transition-colors">
                  +{todayExercises.length - 3} more exercises →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
