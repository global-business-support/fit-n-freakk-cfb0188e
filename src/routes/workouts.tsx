import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { LiveBackground } from "@/components/LiveBackground";
import { InlineVideoPlayer } from "@/components/InlineVideoPlayer";
import { WorkoutHistoryCalendar } from "@/components/WorkoutHistoryCalendar";
import { Dumbbell, ChevronRight, LogIn, Play, Check, CheckCircle2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/workouts")({
  head: () => ({
    meta: [
      { title: "Workouts — Feet & Freakk" },
      { name: "description", content: "Day-wise workouts for men and women — pick exercises, mark complete and track history." },
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
  { key: "Sun", label: "Sun", focus: null },
];

const normalizeTextKey = (value: string) =>
  (value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[\s\-_]+/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();

const normalizeBodyPart = (bodyPart: string) => {
  const key = normalizeTextKey(bodyPart);
  const aliases: Record<string, string> = {
    ab: "abs",
    abs: "abs",
    core: "abs",
    arm: "arms",
    arms: "arms",
    bicep: "biceps",
    biceps: "biceps",
    calf: "calves",
    calves: "calves",
    glute: "glutes",
    glutes: "glutes",
    leg: "legs",
    legs: "legs",
    shoulder: "shoulders",
    shoulders: "shoulders",
    tricep: "triceps",
    triceps: "triceps",
  };
  return aliases[key] ?? key;
};

const formatLabel = (value: string) =>
  normalizeTextKey(value)
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const dedupeExercisesByName = (list: any[]) => {
  const map = new Map<string, any>();
  for (const exercise of list) {
    const key = normalizeTextKey(exercise?.name || "");
    if (!key) continue;
    const current = map.get(key);
    const hasMedia = !!exercise.gif_url || !!exercise.video_url;
    const currentHasMedia = !!current?.gif_url || !!current?.video_url;
    if (!current || (hasMedia && !currentHasMedia)) map.set(key, exercise);
  }
  return Array.from(map.values()).sort((a, b) => (a.name || "").localeCompare(b.name || ""));
};

const focusMatch = (bodyPart: string, focus: string) => {
  const bp = normalizeBodyPart(bodyPart);
  const f = focus.toLowerCase();
  if (f === "arms") return ["arms", "biceps", "triceps"].includes(bp);
  if (f === "legs") return ["legs", "quad", "quads", "hamstring", "hamstrings", "calves", "glutes"].includes(bp);
  if (f === "abs") return bp.includes("abs") || bp.includes("core");
  if (f === "shoulders") return bp === "shoulders";
  if (f === "back") return bp === "back";
  if (f === "chest") return bp === "chest";
  return bp === f;
};

function WorkoutsPage() {
  const { user, profile } = useAuth();
  const [gender, setGender] = useState<"male" | "female" | "both">("both");
  const [exercises, setExercises] = useState<any[]>([]);
  const [expandedPart, setExpandedPart] = useState<string | null>(null);
  const todayIdx = (new Date().getDay() + 6) % 7;
  const [activeDay, setActiveDay] = useState<number>(todayIdx);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [completions, setCompletions] = useState<Record<string, string>>({}); // exercise_id -> latest date
  const todayKey = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (profile?.gender === "female" || profile?.gender === "male") {
      setGender(profile.gender);
    }
  }, [profile]);

  useEffect(() => {
    let q = supabase.from("exercises").select("*").order("body_part");
    if (gender !== "both") {
      q = q.or(`gender_target.eq.${gender},gender_target.eq.both`) as any;
    }
    q.then(({ data }) => setExercises(data || []));
  }, [gender]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("workout_completions")
      .select("exercise_id, completed_on")
      .eq("user_id", user.id)
      .order("completed_on", { ascending: false })
      .then(({ data }) => {
        const map: Record<string, string> = {};
        for (const r of data ?? []) {
          if (!map[r.exercise_id]) map[r.exercise_id] = r.completed_on as string;
        }
        setCompletions(map);
      });
  }, [user, activeDay]);

  const uniqueExercises = useMemo(() => dedupeExercisesByName(exercises), [exercises]);
  const bodyParts = useMemo(() => {
    const groups = new Map<string, { key: string; label: string; exercises: any[] }>();
    for (const exercise of uniqueExercises) {
      const key = normalizeBodyPart(exercise.body_part);
      if (!key) continue;
      const group = groups.get(key) ?? { key, label: formatLabel(key), exercises: [] };
      group.exercises.push(exercise);
      groups.set(key, group);
    }
    return Array.from(groups.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [uniqueExercises]);
  const day = DAY_PLAN[activeDay];
  const dayExercises = useMemo(() => {
    if (day.focus) return uniqueExercises.filter((e: any) => focusMatch(e.body_part, day.focus!));
    // Sunday mix — 2 from each major group
    const groups = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Abs"];
    return groups.flatMap((g) => uniqueExercises.filter((e: any) => focusMatch(e.body_part, g)).slice(0, 2));
  }, [uniqueExercises, day]);

  // Auto-select first 5 by default whenever day/exercises change
  useEffect(() => {
    if (dayExercises.length === 0) return;
    setSelected((prev) => {
      const hasAny = dayExercises.some((ex: any) => prev[ex.id]);
      if (hasAny) return prev;
      const next: Record<string, boolean> = {};
      dayExercises.slice(0, 5).forEach((ex: any) => { next[ex.id] = true; });
      return next;
    });
  }, [dayExercises]);

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const markComplete = async (exId: string) => {
    if (!user) {
      toast.error("Please sign in to track workouts");
      return;
    }
    const { error } = await supabase.from("workout_completions").insert({
      user_id: user.id,
      exercise_id: exId,
      scheduled_day: activeDay,
      completed_on: todayKey,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setCompletions((c) => ({ ...c, [exId]: todayKey }));
    toast.success("Marked complete ✔");
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
  };

  return (
    <div className="relative min-h-screen pb-20 overflow-hidden">
      <LiveBackground />
      <header className="sticky top-0 z-40 border-b border-sky/20 bg-card/70 backdrop-blur-xl px-4 py-3">
        <div className="mx-auto max-w-lg flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-heading tracking-wider bg-gradient-primary bg-clip-text text-transparent truncate">WORKOUTS</h1>
            <p className="text-xs text-muted-foreground font-body">{user ? "Day-wise plan · pick & track" : "Free preview"}</p>
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
        {user && <WorkoutHistoryCalendar userId={user.id} />}

        {/* Gender Toggle — male / female / both */}
        <div className="grid grid-cols-3 gap-2">
          {(["male", "female", "both"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={cn(
                "rounded-xl border py-2.5 text-xs font-semibold uppercase tracking-wider font-body transition-all",
                gender === g
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30"
              )}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Day-wise plan */}
        <div className="rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-md p-3 space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="font-heading text-base tracking-wider text-primary">DAY PLAN</p>
            <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">
              {day.focus ? `${day.label} · ${day.focus}` : "Sun · Mix"}
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

          <p className="text-[10px] text-center text-muted-foreground font-body">
            ✓ auto-selected · tap to add/remove · mark complete to save date
          </p>

          <div className="space-y-2">
            {dayExercises.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground font-body py-4">
                No exercises for this focus yet.
              </p>
            ) : (
              dayExercises.map((ex: any) => {
                const isSel = !!selected[ex.id];
                const doneOn = completions[ex.id];
                const doneToday = doneOn === todayKey;
                return (
                  <div
                    key={ex.id}
                    className={cn(
                      "rounded-lg border p-2.5 transition-all",
                      isSel ? "border-primary/50 bg-primary/5" : "border-border bg-secondary/30"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggle(ex.id)}
                        className={cn(
                          "h-5 w-5 shrink-0 rounded border flex items-center justify-center transition",
                          isSel ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40"
                        )}
                        aria-label="Select exercise"
                      >
                        {isSel && <Check className="h-3.5 w-3.5" />}
                      </button>
                      <Link
                        to="/exercise/$id"
                        params={{ id: ex.id }}
                        className="min-w-0 flex-1"
                      >
                        <p className="text-sm font-bold font-body truncate">{ex.name}</p>
                        <p className="text-[10px] text-sky font-body uppercase tracking-wider">
                          {ex.body_part}
                          {doneOn && (
                            <span className={cn("ml-2", doneToday ? "text-emerald-400" : "text-muted-foreground")}>
                              · last done {formatDate(doneOn)}
                            </span>
                          )}
                        </p>
                      </Link>
                      {doneToday ? (
                        <span className="flex items-center gap-1 text-[10px] font-body uppercase tracking-wider text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" /> Done
                        </span>
                      ) : (
                        <button
                          onClick={() => markComplete(ex.id)}
                          className="rounded-md bg-gradient-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-1 shadow-glow"
                        >
                          Done
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Body part groups (browse all) */}
        <div className="space-y-3">
          {bodyParts.map((part) => {
            const isOpen = expandedPart === part.key;
            return (
              <div key={part.key} className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setExpandedPart(isOpen ? null : part.key)}
                  className="flex w-full items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Dumbbell className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-heading text-lg tracking-wider">{part.label.toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground font-body">{part.exercises.length} exercises</p>
                    </div>
                  </div>
                  <ChevronRight className={cn("h-5 w-5 text-muted-foreground transition-transform", isOpen && "rotate-90")} />
                </button>

                {isOpen && (
                  <div className="border-t border-border px-4 pb-4 pt-3 space-y-4 animate-fade-in">
                    <div className="space-y-3">
                      {part.exercises.map((exercise: any) => (
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
        isVideoMedia(exercise.video_url) && !exercise.gif_url ? (
          <video
            src={exercise.video_url}
            className="w-full aspect-video rounded-lg border border-border object-cover bg-black"
            autoPlay
            muted
            loop
            playsInline
            controls
            preload="metadata"
          />
        ) : (
          <InlineVideoPlayer url={exercise.video_url} title={exercise.name} thumbnailUrl={exercise.thumbnail_url} />
        )
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
