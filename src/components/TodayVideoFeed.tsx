import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InlineVideoPlayer } from "./InlineVideoPlayer";
import { Flame, Sparkles, Dumbbell } from "lucide-react";

const DAY_NAMES = ["", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

interface TodayVideoFeedProps {
  userId: string;
}

export function TodayVideoFeed({ userId }: TodayVideoFeedProps) {
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const todayDay = new Date().getDay() || 7;

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("workout_schedules")
      .select("*, exercises(*)")
      .eq("user_id", userId)
      .eq("day_of_week", todayDay)
      .order("order_index")
      .then(({ data }) => {
        setExercises(data || []);
        setLoading(false);
      });
  }, [userId, todayDay]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Flame className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-sky font-body font-bold">
              Today's Workout
            </p>
            <h3 className="font-heading text-xl tracking-wider text-foreground leading-none">
              {DAY_NAMES[todayDay]}
            </h3>
          </div>
        </div>
        {exercises.length > 0 && (
          <span className="rounded-full bg-primary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary font-body ring-1 ring-primary/30">
            {exercises.length} videos
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-48 animate-pulse rounded-xl bg-secondary/30" />
          <div className="h-48 animate-pulse rounded-xl bg-secondary/30" />
        </div>
      ) : exercises.length === 0 ? (
        <div className="rounded-2xl border border-sky/20 bg-card/50 backdrop-blur-md p-8 text-center">
          <Sparkles className="h-8 w-8 mx-auto mb-2 text-sky/60" />
          <p className="text-foreground font-heading text-lg tracking-wider">REST DAY</p>
          <p className="text-xs text-muted-foreground font-body mt-1">No exercises scheduled today</p>
        </div>
      ) : (
        <div className="space-y-4">
          {exercises.map((s: any) => {
            const ex = s.exercises;
            if (!ex) return null;
            return (
              <div
                key={s.id}
                className="relative overflow-hidden rounded-2xl border border-sky/20 bg-card/60 backdrop-blur-md p-3"
              >
                {/* Exercise header */}
                <div className="flex items-center gap-3 mb-3">
                  {ex.thumbnail_url ? (
                    <img
                      src={ex.thumbnail_url}
                      alt={ex.name}
                      className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-primary/30 shadow-glow"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
                      <Dumbbell className="h-5 w-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-lg tracking-wider truncate">{ex.name}</p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground font-body uppercase tracking-wider">
                      <span className="text-sky font-bold">{ex.body_part}</span>
                      {ex.sets && (
                        <>
                          <span className="text-border">•</span>
                          <span>{ex.sets} sets</span>
                        </>
                      )}
                      {ex.reps && (
                        <>
                          <span className="text-border">•</span>
                          <span className="text-ember font-bold">{ex.reps} reps</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Inline video — plays in place, never opens new tab */}
                {ex.video_url ? (
                  <InlineVideoPlayer
                    url={ex.video_url}
                    title={ex.name}
                    thumbnailUrl={ex.thumbnail_url}
                  />
                ) : (
                  <div className="aspect-video rounded-xl bg-secondary/40 flex items-center justify-center text-muted-foreground text-xs font-body">
                    No video available
                  </div>
                )}

                {ex.description && (
                  <p className="text-xs text-muted-foreground font-body mt-2 px-1">
                    {ex.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
