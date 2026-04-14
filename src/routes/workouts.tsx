import { createFileRoute } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { Dumbbell, Play, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/workouts")({
  head: () => ({
    meta: [
      { title: "Workouts — Feet & Freakk" },
      { name: "description", content: "Daily workout plans" },
    ],
  }),
  component: WorkoutsPage,
});

const workoutPlan = [
  {
    day: 1,
    name: "Chest",
    exercises: [
      { name: "Bench Press", sets: 4, reps: "8-10", description: "Flat barbell bench press for overall chest development" },
      { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", description: "Target upper chest with incline angle" },
      { name: "Cable Flyes", sets: 3, reps: "12-15", description: "Isolation movement for chest squeeze" },
      { name: "Push-ups", sets: 3, reps: "To failure", description: "Bodyweight finisher for pump" },
    ],
  },
  {
    day: 2,
    name: "Back",
    exercises: [
      { name: "Deadlift", sets: 4, reps: "6-8", description: "Compound movement for overall back strength" },
      { name: "Pull-ups", sets: 4, reps: "8-12", description: "Bodyweight lat builder" },
      { name: "Barbell Rows", sets: 3, reps: "10-12", description: "Horizontal pull for mid-back thickness" },
      { name: "Face Pulls", sets: 3, reps: "15-20", description: "Rear delt and upper back health" },
    ],
  },
  {
    day: 3,
    name: "Legs",
    exercises: [
      { name: "Squats", sets: 4, reps: "8-10", description: "King of all exercises for leg development" },
      { name: "Romanian Deadlift", sets: 3, reps: "10-12", description: "Hamstring and glute focus" },
      { name: "Leg Press", sets: 3, reps: "12-15", description: "Quad builder with machine support" },
      { name: "Calf Raises", sets: 4, reps: "15-20", description: "Standing calf raises for lower leg" },
    ],
  },
  {
    day: 4,
    name: "Shoulders",
    exercises: [
      { name: "Overhead Press", sets: 4, reps: "8-10", description: "Standing barbell press for deltoid strength" },
      { name: "Lateral Raises", sets: 4, reps: "12-15", description: "Isolation for side deltoid width" },
      { name: "Arnold Press", sets: 3, reps: "10-12", description: "Rotational press for full delt engagement" },
      { name: "Reverse Flyes", sets: 3, reps: "15", description: "Rear delt isolation for balanced shoulders" },
    ],
  },
  {
    day: 5,
    name: "Cardio",
    exercises: [
      { name: "HIIT Treadmill", sets: 8, reps: "30s sprint / 60s walk", description: "High intensity interval training" },
      { name: "Battle Ropes", sets: 4, reps: "30 seconds", description: "Full body cardio and conditioning" },
      { name: "Jump Rope", sets: 5, reps: "2 minutes", description: "Classic cardio for coordination and endurance" },
      { name: "Rowing Machine", sets: 1, reps: "2000m", description: "Full body endurance rowing" },
    ],
  },
];

function WorkoutsPage() {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-lg px-4 py-3">
        <div className="mx-auto max-w-lg">
          <h1 className="text-2xl font-heading tracking-wider">WORKOUTS</h1>
          <p className="text-xs text-muted-foreground font-body">5-Day Split Program</p>
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

        {/* Workout Days */}
        <div className="space-y-3">
          {workoutPlan.map((day) => (
            <div key={day.day} className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                className="flex w-full items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-heading text-lg tracking-wider">DAY {day.day}: {day.name.toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground font-body">{day.exercises.length} exercises</p>
                  </div>
                </div>
                <ChevronRight
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform",
                    expandedDay === day.day && "rotate-90"
                  )}
                />
              </button>

              {expandedDay === day.day && (
                <div className="border-t border-border px-4 pb-4 pt-2 space-y-3">
                  {day.exercises.map((exercise, i) => (
                    <div key={i} className="rounded-lg bg-secondary/50 p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-sm font-body">{exercise.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 font-body">{exercise.description}</p>
                          <div className="flex gap-3 mt-2">
                            <span className="text-xs font-semibold text-primary font-body">{exercise.sets} sets</span>
                            <span className="text-xs font-semibold text-ember font-body">{exercise.reps} reps</span>
                          </div>
                        </div>
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                          <Play className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
