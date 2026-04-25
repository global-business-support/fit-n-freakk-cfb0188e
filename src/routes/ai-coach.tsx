import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { LiveBackground } from "@/components/LiveBackground";
import { BottomNav } from "@/components/BottomNav";
import { Sparkles, ArrowLeft, Target, Flame, Salad, Dumbbell, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/ai-coach")({
  head: () => ({
    meta: [{ title: "AI Fitness Coach — Feet & Freakk" }],
  }),
  component: AICoachPage,
});

function AICoachPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<any | null>(null);
  const [planRow, setPlanRow] = useState<any | null>(null);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    goal: "weight_loss",
    current_weight: "",
    target_weight: "",
    height_cm: "",
    age: "",
    gender: "male",
    activity_level: "moderate",
    duration_days: 60,
  });

  // Public access: anyone can generate a plan; saving requires login (handled in handleGenerate)

  useEffect(() => {
    if (!user) return;
    if (profile) {
      setForm((f) => ({
        ...f,
        current_weight: profile.weight ? String(profile.weight) : f.current_weight,
        height_cm: profile.height ? String(profile.height).replace(/[^\d.]/g, "") : f.height_cm,
        age: profile.age ? String(profile.age) : f.age,
        gender: profile.gender || f.gender,
      }));
    }
    supabase
      .from("ai_fitness_plans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setPlanRow(data);
          setPlan(data.plan_data);
        }
      });
  }, [user, profile]);

  const handleGenerate = async () => {
    if (!form.current_weight || !form.target_weight || !form.height_cm || !form.age) {
      toast.error("Please fill all fields");
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-fitness-plan", {
        body: {
          goal: form.goal,
          current_weight: Number(form.current_weight),
          target_weight: Number(form.target_weight),
          height_cm: Number(form.height_cm),
          age: Number(form.age),
          gender: form.gender,
          activity_level: form.activity_level,
          duration_days: Number(form.duration_days),
        },
      });
      if (error) throw error;
      if (!data?.plan) throw new Error("No plan returned");

      setPlan(data.plan);

      // Only persist for logged-in users
      if (user) {
        const { data: saved, error: saveErr } = await supabase
          .from("ai_fitness_plans")
          .insert({
            user_id: user.id,
            goal: form.goal,
            current_weight: Number(form.current_weight),
            target_weight: Number(form.target_weight),
            height_cm: Number(form.height_cm),
            age: Number(form.age),
            gender: form.gender,
            activity_level: form.activity_level,
            duration_days: Number(form.duration_days),
            plan_data: data.plan,
          })
          .select()
          .single();
        if (!saveErr) setPlanRow(saved);
      }
      toast.success(user ? "Your personalized plan is ready! 🔥" : "Plan ready! Sign in to save it.");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate plan");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-24 overflow-hidden">
      <LiveBackground />
      <header className="sticky top-0 z-40 border-b border-sky/20 bg-card/70 backdrop-blur-xl px-4 py-3">
        <div className="mx-auto max-w-lg flex items-center gap-3">
          <Link to={user ? "/dashboard" : "/explore"} className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/60">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-xl tracking-widest bg-gradient-primary bg-clip-text text-transparent">
                AI FITNESS COACH
              </h1>
              <p className="text-[10px] text-muted-foreground font-body">Personalized plan in seconds</p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-lg px-4 py-4 space-y-4">
        {/* Form */}
        <div className="rounded-2xl border border-sky/20 bg-card/60 backdrop-blur-md p-4 space-y-3">
          <p className="font-heading text-lg tracking-wider text-foreground">YOUR DETAILS</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs uppercase tracking-wider font-body">Goal</Label>
              <select
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
                className="w-full mt-1 rounded-lg bg-secondary/60 px-3 py-2.5 font-body text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="weight_loss">🔥 Weight Loss (Fat burn)</option>
                <option value="weight_gain">💪 Weight Gain (Bulk)</option>
                <option value="muscle_gain">🏋️ Muscle Gain (Lean)</option>
                <option value="maintain">⚖️ Maintain & Tone</option>
              </select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider font-body">Current weight (kg)</Label>
              <Input
                type="number"
                value={form.current_weight}
                onChange={(e) => setForm({ ...form, current_weight: e.target.value })}
                placeholder="70"
                className="mt-1 bg-secondary/60"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider font-body">Target weight (kg)</Label>
              <Input
                type="number"
                value={form.target_weight}
                onChange={(e) => setForm({ ...form, target_weight: e.target.value })}
                placeholder="65"
                className="mt-1 bg-secondary/60"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider font-body">Height (cm)</Label>
              <Input
                type="number"
                value={form.height_cm}
                onChange={(e) => setForm({ ...form, height_cm: e.target.value })}
                placeholder="170"
                className="mt-1 bg-secondary/60"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider font-body">Age</Label>
              <Input
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                placeholder="25"
                className="mt-1 bg-secondary/60"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider font-body">Gender</Label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full mt-1 rounded-lg bg-secondary/60 px-3 py-2.5 font-body text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider font-body">Plan duration (days)</Label>
              <select
                value={form.duration_days}
                onChange={(e) => setForm({ ...form, duration_days: Number(e.target.value) })}
                className="w-full mt-1 rounded-lg bg-secondary/60 px-3 py-2.5 font-body text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
                <option value={180}>6 months</option>
              </select>
            </div>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-gradient-primary text-primary-foreground font-heading text-lg tracking-widest h-12 shadow-glow"
          >
            {generating ? (
              <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> BUILDING YOUR PLAN...</>
            ) : plan ? (
              <><RefreshCw className="h-5 w-5 mr-2" /> REGENERATE PLAN</>
            ) : (
              <><Sparkles className="h-5 w-5 mr-2" /> GENERATE AI PLAN</>
            )}
          </Button>
        </div>

        {/* Plan Display */}
        {plan && (
          <>
            <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 to-sky/10 backdrop-blur-md p-4 shine-border">
              <div className="shine-border-inner rounded-2xl" />
              <div className="relative">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-primary">
                    <Target className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-heading text-lg tracking-wider text-foreground">YOUR MISSION</p>
                    <p className="text-sm text-foreground/90 font-body mt-1">{plan.summary}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="rounded-lg bg-ember/15 ring-1 ring-ember/30 p-2.5">
                    <p className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-body font-bold text-ember">
                      <Flame className="h-3 w-3" /> Daily Calories
                    </p>
                    <p className="text-xl font-bold text-ember font-body">{plan.daily_calories} kcal</p>
                  </div>
                  <div className="rounded-lg bg-success/15 ring-1 ring-success/30 p-2.5">
                    <p className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-body font-bold text-success">
                      <Target className="h-3 w-3" /> Outcome
                    </p>
                    <p className="text-xs font-bold text-success font-body line-clamp-2">{plan.expected_outcome}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Schedule */}
            <div>
              <p className="font-heading text-lg tracking-wider text-sky mb-2 px-1">📅 WEEKLY SCHEDULE</p>
              <div className="space-y-2">
                {plan.weekly_schedule?.map((day: any, i: number) => (
                  <div
                    key={i}
                    className={`rounded-2xl border backdrop-blur-md p-3 ${
                      day.rest
                        ? "border-muted/30 bg-secondary/30"
                        : "border-sky/20 bg-card/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${day.rest ? "bg-muted/40 text-muted-foreground" : "bg-primary/20 text-primary"}`}>
                          {day.rest ? "😴" : <Dumbbell className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-heading text-base tracking-wider text-foreground leading-none">{day.day.toUpperCase()}</p>
                          <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">{day.focus}</p>
                        </div>
                      </div>
                      {!day.rest && day.exercises && (
                        <span className="text-[10px] font-bold text-sky font-body">{day.exercises.length} exercises</span>
                      )}
                    </div>
                    {!day.rest && day.exercises && (
                      <div className="space-y-1 mt-2">
                        {day.exercises.map((ex: any, j: number) => (
                          <div key={j} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
                            <p className="text-sm font-body font-bold text-foreground flex-1 truncate">{ex.name}</p>
                            <p className="text-xs font-bold text-ember font-body shrink-0 ml-2">
                              {ex.sets} × {ex.reps}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Diet Tips */}
            {plan.diet_tips && (
              <div className="rounded-2xl border border-success/30 bg-success/10 backdrop-blur-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/30">
                    <Salad className="h-5 w-5 text-success" />
                  </div>
                  <p className="font-heading text-lg tracking-wider text-foreground">DIET TIPS</p>
                </div>
                <ul className="space-y-2">
                  {plan.diet_tips.map((tip: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm font-body text-foreground/90">
                      <span className="text-success font-bold shrink-0">{i + 1}.</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
