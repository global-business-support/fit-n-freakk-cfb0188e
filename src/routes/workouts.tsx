import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { LiveBackground } from "@/components/LiveBackground";
import { InlineVideoPlayer } from "@/components/InlineVideoPlayer";
import { Dumbbell, ChevronRight, LogIn, Play } from "lucide-react";
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
      { name: "description", content: "Browse exercises for men and women with muscle diagrams and full video tutorials." },
    ],
  }),
  component: WorkoutsPage,
});

function WorkoutsPage() {
  const { user, profile } = useAuth();
  const [gender, setGender] = useState<"male" | "female">("male");
  const [exercises, setExercises] = useState<any[]>([]);
  const [expandedPart, setExpandedPart] = useState<string | null>(null);

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
                  <div className="border-t border-border px-4 pb-4 pt-3 space-y-4">
                    <BodyPartDiagram bodyPart={part} className="max-w-[260px] mx-auto" />
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
  return (
    <div className="rounded-lg bg-secondary/50 p-3 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm font-body">{exercise.name}</p>
          {exercise.description && (
            <p className="text-xs text-muted-foreground mt-0.5 font-body line-clamp-2">{exercise.description}</p>
          )}
          <div className="flex gap-3 mt-2">
            {exercise.sets && <span className="text-xs font-semibold text-primary font-body">{exercise.sets} sets</span>}
            {exercise.reps && <span className="text-xs font-semibold text-ember font-body">{exercise.reps} reps</span>}
          </div>
        </div>
      </div>
      {exercise.video_url ? (
        <InlineVideoPlayer url={exercise.video_url} title={exercise.name} thumbnailUrl={exercise.thumbnail_url} />
      ) : (
        <div className="aspect-video rounded-lg bg-secondary flex items-center justify-center text-muted-foreground/40">
          <Play className="h-6 w-6" />
        </div>
      )}
    </div>
  );
}
