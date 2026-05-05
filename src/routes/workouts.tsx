import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { LiveBackground } from "@/components/LiveBackground";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Dumbbell, Play, ChevronRight, CalendarDays, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { BodyPartDiagram } from "@/components/BodyPartDiagram";

export const Route = createFileRoute("/workouts")({
  head: () => ({
    meta: [
      { title: "Workouts — Feet & Freakk" },
      { name: "description", content: "Exercise videos and workout plans" },
    ],
  }),
  component: WorkoutsPage,
});

const DAY_NAMES = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function WorkoutsPage() {
  const { user, profile, role, loading: _loading } = useAuth();
  const [gender, setGender] = useState<"male" | "female">("male");
  const [exercises, setExercises] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [expandedPart, setExpandedPart] = useState<string | null>(null);
  const [view, setView] = useState<"schedule" | "library">("schedule");

  // Public access: no login required. If user is logged in, prefill their gender.
  useEffect(() => {
    if (profile?.gender) setGender(profile.gender as "male" | "female");
  }, [profile]);

  useEffect(() => {
    loadExercises();
  }, [gender]);

  useEffect(() => {
    if (user && role !== "sub_user") loadSchedule();
  }, [user, role]);

  const loadExercises = async () => {
    const { data } = await supabase
      .from("exercises")
      .select("*")
      .or(`gender_target.eq.${gender},gender_target.eq.both`)
      .order("body_part");
    setExercises(data || []);
  };

  const loadSchedule = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("workout_schedules")
      .select("*, exercises(*)")
      .eq("user_id", user.id)
      .order("order_index");
    setSchedule(data || []);
  };

  // Sub-users only see exercise videos
  const isSubUser = role === "sub_user";
  const bodyParts = [...new Set(exercises.map((e: any) => e.body_part))];

  // Today's day (1=Mon)
  const todayDay = new Date().getDay() || 7;

  useEffect(() => {
    if (schedule.length > 0) setExpandedDay(todayDay);
  }, [schedule]);

  return (
    <div className="relative min-h-screen pb-20 overflow-hidden">
      <LiveBackground />
      <header className="sticky top-0 z-40 border-b border-sky/20 bg-card/70 backdrop-blur-xl px-4 py-3">
        <div className="mx-auto max-w-lg flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-heading tracking-wider bg-gradient-primary bg-clip-text text-transparent truncate">{isSubUser ? "VIDEOS" : "WORKOUTS"}</h1>
            <p className="text-xs text-muted-foreground font-body">{isSubUser ? "Watch exercise videos" : user ? "Your exercise schedule & library" : "Free preview · Sign in to save your plan"}</p>
          </div>
          {!user && (
            <Link to="/login">
              <Button size="sm" className="bg-gradient-primary text-white shadow-glow shrink-0 h-9 px-3">
                <LogIn className="h-4 w-4 mr-1" /> Sign In
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-lg px-4 py-4 space-y-4">
        {/* Gender Toggle */}
        <div className="grid grid-cols-2 gap-2">
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={cn(
                "rounded-xl border py-2.5 text-sm font-semibold uppercase tracking-wider font-body transition-all",
                gender === g
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30"
              )}
            >
              {g} Workouts
            </button>
          ))}
        </div>

        {/* View Toggle (members only) */}
        {!isSubUser && schedule.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setView("schedule")}
              className={cn(
                "rounded-lg border py-2 text-xs font-semibold uppercase tracking-wider font-body transition-all",
                view === "schedule" ? "border-ember bg-ember/10 text-ember" : "border-border bg-card text-muted-foreground"
              )}
            >
              <CalendarDays className="inline h-3.5 w-3.5 mr-1" />My Schedule
            </button>
            <button
              onClick={() => setView("library")}
              className={cn(
                "rounded-lg border py-2 text-xs font-semibold uppercase tracking-wider font-body transition-all",
                view === "library" ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
              )}
            >
              <Dumbbell className="inline h-3.5 w-3.5 mr-1" />All Exercises
            </button>
          </div>
        )}

        {/* Schedule View */}
        {!isSubUser && view === "schedule" && schedule.length > 0 && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => {
              const dayExercises = schedule.filter((s: any) => s.day_of_week === day);
              if (dayExercises.length === 0) return null;
              const isToday = day === todayDay;
              return (
                <div key={day} className={cn("rounded-xl border bg-card overflow-hidden", isToday ? "border-ember/50" : "border-border")}>
                  <button
                    onClick={() => setExpandedDay(expandedDay === day ? null : day)}
                    className="flex w-full items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg text-sm font-heading", isToday ? "bg-ember/10 text-ember" : "bg-primary/10 text-primary")}>
                        {DAY_NAMES[day].slice(0, 3).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <p className="font-heading text-lg tracking-wider">{DAY_NAMES[day].toUpperCase()}</p>
                        <p className="text-xs text-muted-foreground font-body">{dayExercises.length} exercises {isToday && "• TODAY"}</p>
                      </div>
                    </div>
                    <ChevronRight className={cn("h-5 w-5 text-muted-foreground transition-transform", expandedDay === day && "rotate-90")} />
                  </button>
                  {expandedDay === day && (
                    <div className="border-t border-border px-4 pb-4 pt-2 space-y-3">
                      {dayExercises.map((s: any) => (
                        <ExerciseCard
                          key={s.id}
                          exercise={s.exercises}
                          compareOptions={dayExercises
                            .map((d: any) => d.exercises)
                            .filter((e: any) => e?.video_url && e.id !== s.exercises?.id)
                            .map((e: any) => ({ url: e.video_url, title: e.name }))}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* No Schedule Message */}
        {!isSubUser && view === "schedule" && schedule.length === 0 && (
          <div className="py-12 text-center text-muted-foreground font-body">
            <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>No schedule assigned yet</p>
            <p className="text-xs mt-1">Your trainer will assign exercises</p>
          </div>
        )}

        {/* Library / Sub-user view */}
        {(isSubUser || view === "library") && (
          <div className="space-y-3">
            {bodyParts.map((part) => {
              const partExercises = exercises.filter((e: any) => e.body_part === part);
              return (
                <div key={part} className="rounded-xl border border-border bg-card overflow-hidden">
                  <button
                    onClick={() => setExpandedPart(expandedPart === part ? null : part)}
                    className="flex w-full items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Dumbbell className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-heading text-lg tracking-wider">{part.toUpperCase()}</p>
                        <p className="text-xs text-muted-foreground font-body">{partExercises.length} exercises</p>
                      </div>
                    </div>
                    <ChevronRight className={cn("h-5 w-5 text-muted-foreground transition-transform", expandedPart === part && "rotate-90")} />
                  </button>

                  {expandedPart === part && (
                    <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
                      <BodyPartDiagram bodyPart={part} className="max-w-[260px] mx-auto" />
                      {partExercises.map((exercise: any) => (
                        <ExerciseCard
                          key={exercise.id}
                          exercise={exercise}
                          compareOptions={partExercises
                            .filter((e: any) => e.video_url && e.id !== exercise.id)
                            .map((e: any) => ({ url: e.video_url, title: e.name }))}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {bodyParts.length === 0 && (
              <div className="py-12 text-center text-muted-foreground font-body">
                <Dumbbell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>No exercises added yet</p>
              </div>
            )}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}

function ExerciseCard({ exercise, compareOptions }: { exercise: any; compareOptions?: Array<{ url: string; title?: string }> }) {
  if (!exercise) return null;
  return (
    <div className="rounded-lg bg-secondary/50 p-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-semibold text-sm font-body">{exercise.name}</p>
          {exercise.description && <p className="text-xs text-muted-foreground mt-0.5 font-body">{exercise.description}</p>}
          <div className="flex gap-3 mt-2">
            {exercise.sets && <span className="text-xs font-semibold text-primary font-body">{exercise.sets} sets</span>}
            {exercise.reps && <span className="text-xs font-semibold text-ember font-body">{exercise.reps} reps</span>}
          </div>
        </div>
        {exercise.video_url ? (
          <VideoPlayer url={exercise.video_url} title={exercise.name} size="sm" compareOptions={compareOptions} />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground/30 shrink-0">
            <Play className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
}
