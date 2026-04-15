import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Scale, Flame, TrendingDown, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "My Progress — Feet & Freakk" },
      { name: "description", content: "Track your fitness progress" },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [weight, setWeight] = useState("");
  const [caloriesBurned, setCaloriesBurned] = useState("");
  const [caloriesConsumed, setCaloriesConsumed] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (user) loadLogs();
  }, [user]);

  const loadLogs = async () => {
    const { data } = await supabase.from("weight_logs").select("*").eq("user_id", user!.id).order("logged_at", { ascending: false });
    setLogs(data || []);
  };

  const handleSave = async () => {
    if (!weight || !user) return;
    setSaving(true);
    await supabase.from("weight_logs").insert({
      user_id: user.id,
      weight: parseFloat(weight),
      calories_burned: caloriesBurned ? parseFloat(caloriesBurned) : null,
      calories_consumed: caloriesConsumed ? parseFloat(caloriesConsumed) : null,
      notes: notes || null,
    });
    setWeight("");
    setCaloriesBurned("");
    setCaloriesConsumed("");
    setNotes("");
    setShowForm(false);
    setSaving(false);
    loadLogs();
  };

  const firstWeight = logs.length > 0 ? logs[logs.length - 1].weight : 0;
  const currentWeight = logs.length > 0 ? logs[0].weight : 0;
  const totalChange = currentWeight - firstWeight;

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -right-20 w-72 h-72 bg-success/3 rounded-full blur-3xl animate-pulse" />
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-lg px-4 py-3">
        <div className="mx-auto max-w-lg flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading tracking-wider">MY PROGRESS</h1>
            <p className="text-xs text-muted-foreground font-body">Track weight & calories</p>
          </div>
          <Button variant="ember" size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" />
            Log
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4 space-y-4 relative z-10">
        {/* Summary Cards */}
        {logs.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <Scale className="h-4 w-4 mx-auto text-primary mb-1" />
              <p className="text-lg font-heading">{currentWeight}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-body">Current KG</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <p className="text-lg font-heading">{firstWeight}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-body">Start KG</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              {totalChange <= 0 ? <TrendingDown className="h-4 w-4 mx-auto text-success mb-1" /> : <TrendingUp className="h-4 w-4 mx-auto text-warning mb-1" />}
              <p className={`text-lg font-heading ${totalChange <= 0 ? "text-success" : "text-warning"}`}>
                {totalChange > 0 ? "+" : ""}{totalChange.toFixed(1)}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase font-body">Change KG</p>
            </div>
          </div>
        )}

        {/* Log Form */}
        {showForm && (
          <div className="rounded-xl border border-primary/30 bg-card p-4 space-y-3">
            <h3 className="font-heading text-lg tracking-wider">LOG TODAY</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs uppercase tracking-wider font-body">Weight (kg) *</Label>
                <Input type="number" placeholder="75" value={weight} onChange={(e) => setWeight(e.target.value)} className="bg-secondary border-border mt-1" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider font-body">Calories Burned</Label>
                <Input type="number" placeholder="500" value={caloriesBurned} onChange={(e) => setCaloriesBurned(e.target.value)} className="bg-secondary border-border mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider font-body">Calories Consumed</Label>
              <Input type="number" placeholder="2000" value={caloriesConsumed} onChange={(e) => setCaloriesConsumed(e.target.value)} className="bg-secondary border-border mt-1" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider font-body">Notes</Label>
              <Input placeholder="Feeling good..." value={notes} onChange={(e) => setNotes(e.target.value)} className="bg-secondary border-border mt-1" />
            </div>
            <Button variant="ember" className="w-full" onClick={handleSave} disabled={saving || !weight}>
              {saving ? "Saving..." : "Save Log"}
            </Button>
          </div>
        )}

        {/* History */}
        <div className="space-y-2">
          {logs.map((log: any, i: number) => {
            const prev = logs[i + 1];
            const change = prev ? log.weight - prev.weight : 0;
            return (
              <div key={log.id} className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-body">
                      {new Date(log.logged_at).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    {log.notes && <p className="text-xs text-muted-foreground/70 font-body mt-0.5">{log.notes}</p>}
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-sm font-semibold font-body">{log.weight} kg</p>
                      {change !== 0 && (
                        <p className={`text-[10px] font-body ${change < 0 ? "text-success" : "text-warning"}`}>
                          {change > 0 ? "+" : ""}{change.toFixed(1)}
                        </p>
                      )}
                    </div>
                    {log.calories_burned && (
                      <div>
                        <p className="text-sm font-semibold text-ember font-body flex items-center gap-1">
                          <Flame className="h-3 w-3" />{log.calories_burned}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-body">burned</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {logs.length === 0 && !showForm && (
            <div className="py-12 text-center text-muted-foreground font-body">
              <Scale className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>No progress logs yet</p>
              <p className="text-xs mt-1">Tap "Log" to start tracking</p>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
