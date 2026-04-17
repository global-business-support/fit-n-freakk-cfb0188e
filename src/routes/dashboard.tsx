import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useBranding } from "@/hooks/use-branding";
import { Users, UserCheck, IndianRupee, TrendingUp, Bell, LogOut, Scale, Flame, Target, Dumbbell } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { MemberCard } from "@/components/MemberCard";
import { BottomNav } from "@/components/BottomNav";
import { LiveBackground } from "@/components/LiveBackground";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Feet & Freakk" },
      { name: "description", content: "Gym management dashboard" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, role, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!user) return null;

  return role === "admin" ? <AdminDashboard /> : <MemberDashboard />;
}

function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const { appName, logoUrl } = useBranding();
  const [members, setMembers] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, todayVisitors: 0, pendingFees: 0, revenue: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [profilesRes, feesRes, attendanceRes] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("fees").select("*"),
      supabase.from("attendance").select("*").gte("checked_in_at", new Date().toISOString().split("T")[0]),
    ]);

    const profiles = profilesRes.data || [];
    const fees = feesRes.data || [];
    const todayAttendance = attendanceRes.data || [];

    const approved = fees.filter((f: any) => f.status === "approved");
    const pending = fees.filter((f: any) => f.status === "pending");

    setMembers(profiles.map((p: any) => {
      const memberFees = fees.filter((f: any) => f.user_id === p.user_id);
      const paid = memberFees.filter((f: any) => f.status === "approved").reduce((s: number, f: any) => s + Number(f.amount), 0);
      const due = memberFees.filter((f: any) => f.status === "pending").reduce((s: number, f: any) => s + Number(f.amount), 0);
      const lastVisit = todayAttendance.find((a: any) => a.user_id === p.user_id) ? "Today" : "—";
      return {
        name: p.name,
        age: p.age || 0,
        height: p.height || "—",
        weight: p.weight ? `${p.weight}kg` : "—",
        feesPaid: paid,
        feesRemaining: due,
        lastVisit,
        status: "active" as const,
        gender: (p.gender || "male") as "male" | "female",
        photoUrl: p.photo_url,
      };
    }));

    setStats({
      total: profiles.length,
      todayVisitors: todayAttendance.length,
      pendingFees: pending.reduce((s: number, f: any) => s + Number(f.amount), 0),
      revenue: approved.reduce((s: number, f: any) => s + Number(f.amount), 0),
    });
  };

  return (
    <div className="relative min-h-screen pb-20 overflow-hidden">
      <LiveBackground />
      <header className="sticky top-0 z-40 border-b border-sky/20 bg-card/70 backdrop-blur-xl px-4 py-3">
        <div className="mx-auto max-w-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary shadow-glow overflow-hidden">
              {logoUrl ? <img src={logoUrl} alt={appName} className="h-full w-full object-cover" /> : <Dumbbell className="h-6 w-6 text-primary-foreground" />}
            </div>
            <div>
              <h1 className="text-2xl font-heading tracking-widest bg-gradient-primary bg-clip-text text-transparent">{appName.toUpperCase()}</h1>
              <p className="text-xs text-muted-foreground font-body">Welcome, {profile?.name || "Admin"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/60 text-sky ring-1 ring-sky/20">
              <Bell className="h-5 w-5" />
            </button>
            <button onClick={signOut} className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/60 text-foreground hover:text-destructive ring-1 ring-border">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-lg px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard title="Total Members" value={stats.total} icon={Users} trend="+12 this month" variant="ember" />
          <StatCard title="Today Visitors" value={stats.todayVisitors} icon={UserCheck} variant="success" />
          <StatCard title="Fees Pending" value={`₹${(stats.pendingFees / 1000).toFixed(0)}K`} icon={IndianRupee} variant="warning" />
          <StatCard title="Revenue" value={`₹${(stats.revenue / 1000).toFixed(0)}K`} icon={TrendingUp} trend="+8%" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-heading tracking-wider text-sky">MEMBERS</h2>
            <span className="text-xs text-muted-foreground font-body">{members.length} total</span>
          </div>
          <div className="space-y-3">
            {members.map((member) => (
              <MemberCard key={member.name} {...member} />
            ))}
            {members.length === 0 && (
              <div className="py-12 text-center text-muted-foreground font-body">
                <p>No members yet</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

function MemberDashboard() {
  const { profile, user, signOut } = useAuth();
  const [weightLogs, setWeightLogs] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("weight_logs").select("*").eq("user_id", user.id).order("logged_at", { ascending: false }).limit(10),
      supabase.from("fees").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]).then(([wRes, fRes]) => {
      setWeightLogs(wRes.data || []);
      setFees(fRes.data || []);
    });
  }, [user]);

  const latestWeight = weightLogs[0]?.weight || profile?.weight || 0;
  const previousWeight = weightLogs[1]?.weight || profile?.weight || latestWeight;
  const weightChange = latestWeight - previousWeight;
  const latestCalories = weightLogs[0]?.calories_burned || 0;
  const totalPaid = fees.filter((f: any) => f.status === "approved").reduce((s: number, f: any) => s + Number(f.amount), 0);
  const totalDue = fees.filter((f: any) => f.status === "pending").reduce((s: number, f: any) => s + Number(f.amount), 0);

  return (
    <div className="relative min-h-screen pb-20 overflow-hidden">
      <LiveBackground />

      <header className="sticky top-0 z-40 border-b border-sky/20 bg-card/70 backdrop-blur-xl px-4 py-3">
        <div className="mx-auto max-w-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            {profile?.photo_url ? (
              <img src={profile.photo_url} alt={profile.name} className="h-10 w-10 rounded-xl object-cover" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-heading text-lg">
                {profile?.name?.charAt(0) || "M"}
              </div>
            )}
            <div>
              <h1 className="text-lg font-heading tracking-wider">HI, {(profile?.name || "MEMBER").toUpperCase()}</h1>
              <p className="text-xs text-muted-foreground font-body">Let's crush it today 💪</p>
            </div>
          </div>
          <button onClick={signOut} className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground hover:text-destructive">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4 space-y-4 relative z-10">
        {/* Body Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="h-4 w-4 text-primary" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-body">Weight</span>
            </div>
            <p className="text-2xl font-heading">{latestWeight} KG</p>
            <p className={`text-xs font-body mt-1 ${weightChange < 0 ? "text-success" : weightChange > 0 ? "text-warning" : "text-muted-foreground"}`}>
              {weightChange > 0 ? "+" : ""}{weightChange.toFixed(1)} kg change
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-4 w-4 text-ember" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-body">Calories</span>
            </div>
            <p className="text-2xl font-heading">{latestCalories}</p>
            <p className="text-xs text-muted-foreground font-body mt-1">Burned today</p>
          </div>
        </div>

        {/* Fees Summary */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-heading text-lg tracking-wider mb-3">FEES STATUS</h3>
          <div className="flex gap-6">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-body">Paid</p>
              <p className="text-xl font-heading text-success">₹{totalPaid}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-body">Due</p>
              <p className="text-xl font-heading text-destructive">₹{totalDue}</p>
            </div>
          </div>
          {fees.length > 0 && (
            <div className="mt-3 space-y-2">
              {fees.slice(0, 3).map((f: any) => (
                <div key={f.id} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                  <span className="text-sm font-body">{f.month}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-body font-semibold">₹{f.amount}</span>
                    <span className={`text-[10px] uppercase font-body px-2 py-0.5 rounded-full ${
                      f.status === "approved" ? "bg-success/10 text-success" :
                      f.status === "rejected" ? "bg-destructive/10 text-destructive" :
                      "bg-warning/10 text-warning"
                    }`}>{f.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weight Progress */}
        {weightLogs.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-heading text-lg tracking-wider mb-3">WEIGHT PROGRESS</h3>
            <div className="space-y-2">
              {weightLogs.slice(0, 5).map((log: any) => (
                <div key={log.id} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                  <span className="text-xs text-muted-foreground font-body">
                    {new Date(log.logged_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                  <div className="flex gap-4">
                    <span className="text-sm font-body"><Scale className="inline h-3 w-3 mr-1" />{log.weight} kg</span>
                    {log.calories_burned && <span className="text-sm font-body text-ember"><Flame className="inline h-3 w-3 mr-1" />{log.calories_burned} cal</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => {}}>
            <Flame className="h-5 w-5 text-ember" />
            <span className="text-xs font-body">Log Weight</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => {}}>
            <Target className="h-5 w-5 text-primary" />
            <span className="text-xs font-body">View Workouts</span>
          </Button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
