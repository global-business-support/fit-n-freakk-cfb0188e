import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { LiveBackground } from "@/components/LiveBackground";
import { InlineVideoPlayer } from "@/components/InlineVideoPlayer";
import { WorkoutHistoryCalendar } from "@/components/WorkoutHistoryCalendar";
import { Dumbbell, ChevronRight, LogIn, Play } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/workouts")({
  head: () => ({
    meta: [
      { title: "Workouts — Feet & Freakk" },
      { name: "description", content: "Browse exercises for men and women with muscle diagrams and full video tutorials." },
    ],
  }),
  component: WorkoutsPage,
});

const DAY_PLAN: { key: string; label: string; focus: string | null }[] = [
  { key: "Mon", label: "Mon", focus: "Chest" },
  { key: "Tue", label: "Tue", focus: "Back" },
  { key: "Wed", label: "Wed", focus: "Legs" },
  { key: "Thu", label: "Thu", focus: "Shoulders" },
  { key: "Fri", label: "Fri", focus: "Arms" },
  { key: "Sat", label: "Sat", focus: "Abs" },
  { key: "Sun", label: "Sun", focus: null }, // mixed / free pick
];

function WorkoutsPage() {
  const { user, profile } = useAuth();
  const [gender, setGender] = useState<"male" | "female">("male");
  const [exercises, setExercises] = useState<any[]>([]);
  const [expandedPart, setExpandedPart] = useState<string | null>(null);
  const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0..Sun=6
  const [activeDay, setActiveDay] = useState<number>(todayIdx);

  useEffect(() => {
    if (profile?.gender === "female" || profile?.gender === "male") {
      setGender(profile.gender);
    }
  }, [profile]);

  useEffect(() => {
    loadExercises();
  }, [gender]);

  const loadExercises = async () => {
    const { data } = await supabase
      .from("exercises")
      .select("*")
      .or(`gender_target.eq.${gender},gender_target.eq.both`)
      .order("body_part");
    setExercises(data || []);
  };

  const bodyParts = [...new Set(exercises.map((e: any) => e.body_part))].sort();
  const day = DAY_PLAN[activeDay];
  const dayExercises = day.focus
    ? exercises.filter((e: any) => (e.body_part || "").toLowerCase() === day.focus!.toLowerCase())
    : // Sunday: mix — one from each body part
      bodyParts.map((bp) => exercises.find((e: any) => e.body_part === bp)).filter(Boolean) as any[];

  return (
    <div className="relative min-h-screen pb-20 overflow-hidden">
      <LiveBackground />
      <header className="sticky top-0 z-40 border-b border-sky/20 bg-card/70 backdrop-blur-xl px-4 py-3">
        <div className="mx-auto max-w-lg flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-heading tracking-wider bg-gradient-primary bg-clip-text text-transparent truncate">WORKOUTS</h1>
            <p className="text-xs text-muted-foreground font-body">{user ? "Exercises with muscle diagrams" : "Free preview · Tap any exercise"}</p>
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
        {/* Workout history calendar — signed-in members only */}
        {user && <WorkoutHistoryCalendar userId={user.id} />}

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

        {/* Day-wise plan */}
        <div className="rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-md p-3 space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="font-heading text-base tracking-wider text-primary">DAY PLAN</p>
            <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">
              {day.focus ? `Focus: ${day.focus}` : "Sunday · Mix / Free pick"}
            </p>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {DAY_PLAN.map((d, i) => (
              <button
                key={d.key}
                onClick={() => setActiveDay(i)}
                className={cn(
                  "rounded-lg py-2 text-[11px] font-bold uppercase font-body transition-all",
                  activeDay === i
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : i === todayIdx
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "bg-secondary/60 text-muted-foreground"
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {dayExercises.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground font-body py-4">
                No exercises for this focus yet.
              </p>
            ) : (
              dayExercises.slice(0, 8).map((ex: any) => (
                <Link
                  key={ex.id}
                  to="/exercise/$id"
                  params={{ id: ex.id }}
                  className="flex items-center justify-between gap-2 rounded-lg bg-secondary/40 p-2.5 hover:bg-secondary/60 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold font-body truncate">{ex.name}</p>
                    <p className="text-[10px] text-sky font-body uppercase tracking-wider">{ex.body_part}</p>
                  </div>
                  <Play className="h-4 w-4 text-primary shrink-0" />
                </Link>
              ))
            )}
          </div>
          <p className="text-[10px] text-center text-muted-foreground font-body">
            Want different exercises? Pick any body part below 👇
          </p>
        </div>

        {/* Body part groups */}
        <div className="space-y-3">
          {bodyParts.map((part) => {
            const partExercises = exercises.filter((e: any) => e.body_part === part);
            const isOpen = expandedPart === part;
            return (
              <div key={part} className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setExpandedPart(isOpen ? null : part)}
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
                  <ChevronRight className={cn("h-5 w-5 text-muted-foreground transition-transform", isOpen && "rotate-90")} />
                </button>

                {isOpen && (
                  <div className="border-t border-border px-4 pb-4 pt-3 space-y-4 animate-fade-in">
                    <div className="space-y-3">
                      {partExercises.map((exercise: any) => (
                        <ExerciseCard key={exercise.id} exercise={exercise} />
                      ))}
                    </div>
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
      </main>
      <BottomNav />
    </div>
  );
}

function ExerciseCard({ exercise }: { exercise: any }) {
  if (!exercise) return null;
  const impact = getExerciseImpact(exercise.body_part);
  return (
    <div className="rounded-lg bg-secondary/50 p-3 space-y-3">
      <div className="min-w-0 space-y-1.5">
        <p className="font-semibold text-sm font-body truncate">{exercise.name}</p>
        <p className="text-[11px] font-body text-sky uppercase tracking-wider">Impact: {impact}</p>
        {exercise.description && (
          <p className="text-xs text-muted-foreground font-body line-clamp-2">{exercise.description}</p>
        )}
        <div className="flex gap-3">
          {exercise.sets && <span className="text-xs font-semibold text-primary font-body">{exercise.sets} sets</span>}
          {exercise.reps && <span className="text-xs font-semibold text-ember font-body">{exercise.reps} reps</span>}
        </div>
      </div>
      {exercise.gif_url && (isVideoMedia(exercise.gif_url) ? (
        <video
          src={exercise.gif_url}
          className="w-full aspect-video rounded-lg border border-border object-cover bg-black"
          autoPlay
          muted
          loop
          playsInline
          controls
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-black">
          <img
            src={exercise.gif_url}
            alt={`${exercise.name} animation`}
            className="w-full aspect-video object-cover"
            loading="lazy"
          />
        </div>
      ))}
      {exercise.video_url ? (
        <InlineVideoPlayer url={exercise.video_url} title={exercise.name} thumbnailUrl={exercise.thumbnail_url} />
      ) : !exercise.gif_url ? (
        <div className="aspect-video rounded-lg bg-secondary flex items-center justify-center text-muted-foreground/40">
          <Play className="h-6 w-6" />
        </div>
      ) : null}
    </div>
  );
}

function getExerciseImpact(bodyPart: string) {
  const value = (bodyPart || "").toLowerCase();
  if (value.includes("chest")) return "Chest size, push strength";
  if (value.includes("back")) return "Back width, pulling power";
  if (value.includes("shoulder")) return "Shoulder caps, upper-body shape";
  if (value.includes("bicep")) return "Biceps peak, arm strength";
  if (value.includes("tricep")) return "Triceps size, lockout power";
  if (value.includes("arm")) return "Full arm growth";
  if (value.includes("leg") || value.includes("quad") || value.includes("ham")) return "Leg strength, quads and hamstrings";
  if (value.includes("glute")) return "Glute shape, hip power";
  if (value.includes("calf")) return "Calf shape, ankle drive";
  if (value.includes("abs") || value.includes("core")) return "Core strength, definition";
  if (value.includes("cardio")) return "Stamina, fat burn";
  return "Target muscle growth";
}

function isVideoMedia(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url || "");
}
