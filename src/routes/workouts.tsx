import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { Dumbbell, Play, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/workouts")({
  head: () => ({
    meta: [
      { title: "Workouts — Feet & Freakk" },
      { name: "description", content: "Exercise videos and workout plans" },
    ],
  }),
  component: WorkoutsPage,
});

function WorkoutsPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [gender, setGender] = useState<"male" | "female">("male");
  const [exercises, setExercises] = useState<any[]>([]);
  const [expandedPart, setExpandedPart] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (profile?.gender) setGender(profile.gender as "male" | "female");
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

  const bodyParts = [...new Set(exercises.map((e: any) => e.body_part))];

  // Fallback static data if no exercises in DB
  const staticWorkouts = [
    { part: "Chest", exercises: [
      { name: "Bench Press", sets: 4, reps: "8-10", description: "Flat barbell bench press", video_url: null },
      { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", description: "Upper chest focus", video_url: null },
      { name: "Cable Flyes", sets: 3, reps: "12-15", description: "Chest isolation", video_url: null },
    ]},
    { part: "Back", exercises: [
      { name: "Deadlift", sets: 4, reps: "6-8", description: "Full back compound", video_url: null },
      { name: "Pull-ups", sets: 4, reps: "8-12", description: "Lat builder", video_url: null },
      { name: "Barbell Rows", sets: 3, reps: "10-12", description: "Mid-back thickness", video_url: null },
    ]},
    { part: "Legs", exercises: [
      { name: "Squats", sets: 4, reps: "8-10", description: "King of leg exercises", video_url: null },
      { name: "Romanian Deadlift", sets: 3, reps: "10-12", description: "Hamstring focus", video_url: null },
      { name: "Leg Press", sets: 3, reps: "12-15", description: "Quad builder", video_url: null },
    ]},
    { part: "Shoulders", exercises: [
      { name: "Overhead Press", sets: 4, reps: "8-10", description: "Deltoid strength", video_url: null },
      { name: "Lateral Raises", sets: 4, reps: "12-15", description: "Side delt width", video_url: null },
    ]},
    { part: "Arms", exercises: [
      { name: "Barbell Curls", sets: 3, reps: "10-12", description: "Bicep builder", video_url: null },
      { name: "Tricep Dips", sets: 3, reps: "10-12", description: "Tricep mass", video_url: null },
    ]},
  ];

  const useStatic = exercises.length === 0;
  const displayParts = useStatic ? staticWorkouts.map(w => w.part) : bodyParts;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-lg px-4 py-3">
        <div className="mx-auto max-w-lg">
          <h1 className="text-2xl font-heading tracking-wider">WORKOUTS</h1>
          <p className="text-xs text-muted-foreground font-body">Exercise videos & plans</p>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4 space-y-4">
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

        {/* Body Parts */}
        <div className="space-y-3">
          {displayParts.map((part) => {
            const partExercises = useStatic
              ? staticWorkouts.find(w => w.part === part)?.exercises || []
              : exercises.filter((e: any) => e.body_part === part);

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
                      <p className="font-heading text-lg tracking-wider">{(part as string).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground font-body">{partExercises.length} exercises</p>
                    </div>
                  </div>
                  <ChevronRight className={cn("h-5 w-5 text-muted-foreground transition-transform", expandedPart === part && "rotate-90")} />
                </button>

                {expandedPart === part && (
                  <div className="border-t border-border px-4 pb-4 pt-2 space-y-3">
                    {partExercises.map((exercise: any, i: number) => (
                      <div key={i} className="rounded-lg bg-secondary/50 p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-sm font-body">{exercise.name}</p>
                            {exercise.description && <p className="text-xs text-muted-foreground mt-0.5 font-body">{exercise.description}</p>}
                            <div className="flex gap-3 mt-2">
                              <span className="text-xs font-semibold text-primary font-body">{exercise.sets} sets</span>
                              <span className="text-xs font-semibold text-ember font-body">{exercise.reps} reps</span>
                            </div>
                          </div>
                          {exercise.video_url ? (
                            <a href={exercise.video_url} target="_blank" className="flex h-8 w-8 items-center justify-center rounded-lg bg-ember/10 text-ember shrink-0">
                              <Play className="h-4 w-4" />
                            </a>
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground/30 shrink-0">
                              <Play className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
