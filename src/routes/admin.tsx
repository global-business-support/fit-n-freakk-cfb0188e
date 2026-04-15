import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Check, X, IndianRupee, Users, Dumbbell, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Feet & Freakk" },
      { name: "description", content: "Admin management panel" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"fees" | "members" | "exercises">("fees");
  const [pendingFees, setPendingFees] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && (!user || role !== "admin")) navigate({ to: "/dashboard" });
  }, [loading, user, role, navigate]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [feesRes, profilesRes, exRes] = await Promise.all([
      supabase.from("fees").select("*").eq("status", "pending").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*"),
      supabase.from("exercises").select("*").order("body_part"),
    ]);
    setPendingFees(feesRes.data || []);
    setMembers(profilesRes.data || []);
    setExercises(exRes.data || []);
  };

  const handleFeeAction = async (feeId: string, action: "approved" | "rejected") => {
    await supabase.from("fees").update({ status: action, approved_at: new Date().toISOString() }).eq("id", feeId);
    setPendingFees((prev) => prev.filter((f) => f.id !== feeId));
  };

  const getMemberName = (userId: string) => {
    return members.find((m: any) => m.user_id === userId)?.name || "Unknown";
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-lg px-4 py-3">
        <div className="mx-auto max-w-lg">
          <h1 className="text-2xl font-heading tracking-wider">ADMIN PANEL</h1>
          <p className="text-xs text-muted-foreground font-body">Manage everything</p>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4 space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {([
            { key: "fees" as const, label: "Fee Approvals", icon: IndianRupee, count: pendingFees.length },
            { key: "members" as const, label: "Members", icon: Users, count: members.length },
            { key: "exercises" as const, label: "Exercises", icon: Dumbbell, count: exercises.length },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider font-body transition-all",
                tab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
              {t.count > 0 && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/20 text-[10px]">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Fee Approvals */}
        {tab === "fees" && (
          <div className="space-y-3">
            {pendingFees.length === 0 && (
              <div className="py-12 text-center text-muted-foreground font-body">
                <IndianRupee className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>No pending fee approvals</p>
              </div>
            )}
            {pendingFees.map((fee: any) => (
              <div key={fee.id} className="rounded-xl border border-warning/30 bg-card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-heading text-lg tracking-wider">{getMemberName(fee.user_id)}</p>
                    <p className="text-xs text-muted-foreground font-body mt-0.5">{fee.month}</p>
                    <p className="text-xl font-heading text-primary mt-1">₹{fee.amount}</p>
                    {fee.notes && <p className="text-xs text-muted-foreground font-body mt-1">{fee.notes}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFeeAction(fee.id, "approved")}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleFeeAction(fee.id, "rejected")}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Members Detail */}
        {tab === "members" && (
          <div className="space-y-3">
            {members.map((m: any) => (
              <div key={m.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  {m.photo_url ? (
                    <img src={m.photo_url} alt={m.name} className="h-12 w-12 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-lg font-heading">{m.name?.charAt(0)}</div>
                  )}
                  <div className="flex-1">
                    <p className="font-heading text-lg tracking-wider">{m.name}</p>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground font-body">
                      {m.age && <span>{m.age}y</span>}
                      {m.height && <><span>•</span><span>{m.height}</span></>}
                      {m.weight && <><span>•</span><span>{m.weight}kg</span></>}
                      {m.gender && <><span>•</span><span className="capitalize">{m.gender}</span></>}
                    </div>
                    {m.phone && <p className="text-xs text-muted-foreground font-body mt-1">📞 {m.phone}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Exercises */}
        {tab === "exercises" && (
          <div className="space-y-3">
            {exercises.map((ex: any) => (
              <div key={ex.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-heading text-lg tracking-wider">{ex.name}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-body uppercase">{ex.body_part}</span>
                      <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-body uppercase">{ex.gender_target}</span>
                    </div>
                    {ex.description && <p className="text-xs text-muted-foreground font-body mt-2">{ex.description}</p>}
                    {ex.sets && <p className="text-xs text-primary font-body mt-1">{ex.sets} sets × {ex.reps}</p>}
                  </div>
                  {ex.video_url && (
                    <a href={ex.video_url} target="_blank" className="text-xs text-primary underline font-body">Video</a>
                  )}
                </div>
              </div>
            ))}
            {exercises.length === 0 && (
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
