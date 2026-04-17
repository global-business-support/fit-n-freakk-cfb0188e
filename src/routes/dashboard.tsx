import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useBranding } from "@/hooks/use-branding";
import { Users, UserCheck, IndianRupee, TrendingUp, Bell, LogOut, Scale, Flame, Target, Dumbbell, Calendar as CalIcon, ChevronRight, Search } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { MemberCard } from "@/components/MemberCard";
import { MemberHeroCard } from "@/components/MemberHeroCard";
import { TodayWorkoutCard } from "@/components/TodayWorkoutCard";
import { MemberEditDialog } from "@/components/MemberEditDialog";
import { BottomNav } from "@/components/BottomNav";
import { LiveBackground } from "@/components/LiveBackground";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";

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
            <span className="text-xs text-muted-foreground font-body">{filteredMembers.length} of {members.length}</span>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, Member ID or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-border h-11"
            />
          </div>
          <div className="space-y-3">
            {filteredMembers.map((member: any) => (
              <MemberCard
                key={member.user_id || member.name}
                {...member}
                memberId={member.member_id}
                onEdit={() => setEditingMember(member)}
              />
            ))}
            {filteredMembers.length === 0 && (
              <div className="py-12 text-center text-muted-foreground font-body">
                <p>{search ? "No members match your search" : "No members yet"}</p>
              </div>
            )}
          </div>
        </div>
      </main>
      {editingMember && (
        <MemberEditDialog
          member={editingMember}
          exercises={exercises}
          onClose={() => setEditingMember(null)}
          onSaved={loadData}
        />
      )}
      <BottomNav />
    </div>
  );
}

function MemberDashboard() {
  const { profile, user, signOut } = useAuth();
  const [weightLogs, setWeightLogs] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [weeklyDone, setWeeklyDone] = useState(0);
  const [weeklyTarget, setWeeklyTarget] = useState(0);

  useEffect(() => {
    if (!user) return;
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    Promise.all([
      supabase.from("weight_logs").select("*").eq("user_id", user.id).order("logged_at", { ascending: false }).limit(10),
      supabase.from("fees").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("attendance").select("*").eq("user_id", user.id).gte("checked_in_at", weekStart.toISOString()).order("checked_in_at", { ascending: false }),
      supabase.from("workout_schedules").select("day_of_week").eq("user_id", user.id),
    ]).then(([wRes, fRes, aRes, sRes]) => {
      setWeightLogs(wRes.data || []);
      setFees(fRes.data || []);
      setAttendance(aRes.data || []);
      setWeeklyDone((aRes.data || []).length);
      const uniqueDays = new Set((sRes.data || []).map((s: any) => s.day_of_week));
      setWeeklyTarget(uniqueDays.size);
    });
  }, [user]);

  const streak = (() => {
    if (attendance.length === 0) return 0;
    let s = 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dates = new Set(attendance.map((a: any) => new Date(a.checked_in_at).toDateString()));
    for (let i = 0; i < 30; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      if (dates.has(d.toDateString())) s++;
      else if (i > 0) break;
    }
    return s;
  })();

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
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Dumbbell className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-heading tracking-widest bg-gradient-primary bg-clip-text text-transparent">FEET & FREAKK</h1>
          </div>
          <div className="flex gap-2">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/60 text-sky ring-1 ring-sky/20">
              <Bell className="h-5 w-5" />
              {totalDue > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse" />}
            </button>
            <button onClick={signOut} className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/60 text-foreground hover:text-destructive ring-1 ring-border">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4 space-y-4 relative z-10">
        <MemberHeroCard
          name={profile?.name || "Member"}
          age={profile?.age}
          weight={profile?.weight}
          height={profile?.height}
          photoUrl={profile?.photo_url}
          streak={streak}
          weeklyTarget={weeklyTarget || 4}
          weeklyDone={weeklyDone}
        />

        {user && <TodayWorkoutCard userId={user.id} />}

        <div className="grid grid-cols-2 gap-3">
          <Link to="/progress" className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card to-primary/5 p-4 transition-all hover:border-primary/50 hover:shadow-glow">
            <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-primary/15 blur-2xl pointer-events-none group-hover:bg-primary/25 transition-colors" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <Scale className="h-5 w-5 text-primary" />
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body font-bold mt-2">Weight</p>
              <p className="text-2xl font-heading">{latestWeight} <span className="text-sm text-muted-foreground">KG</span></p>
              <p className={`text-[10px] font-body font-bold uppercase tracking-wider mt-1 ${weightChange < 0 ? "text-success" : weightChange > 0 ? "text-warning" : "text-muted-foreground"}`}>
                {weightChange === 0 ? "—" : `${weightChange > 0 ? "▲" : "▼"} ${Math.abs(weightChange).toFixed(1)} kg`}
              </p>
            </div>
          </Link>

          <Link to="/progress" className="group relative overflow-hidden rounded-2xl border border-ember/20 bg-gradient-to-br from-card to-ember/5 p-4 transition-all hover:border-ember/50 hover:shadow-glow">
            <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-ember/15 blur-2xl pointer-events-none group-hover:bg-ember/25 transition-colors" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <Flame className="h-5 w-5 text-ember" />
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-ember transition-colors" />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body font-bold mt-2">Calories</p>
              <p className="text-2xl font-heading">{latestCalories}</p>
              <p className="text-[10px] text-muted-foreground font-body font-bold uppercase tracking-wider mt-1">Burned today</p>
            </div>
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading text-lg tracking-wider flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-success" /> FEES STATUS
            </h3>
            {totalDue > 0 && <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] uppercase tracking-wider font-body font-bold text-destructive">Action needed</span>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-success/10 ring-1 ring-success/20 p-3">
              <p className="text-[10px] text-success/80 uppercase tracking-wider font-body font-bold">Paid</p>
              <p className="text-2xl font-heading text-success">₹{totalPaid}</p>
            </div>
            <div className={`rounded-xl ring-1 p-3 ${totalDue > 0 ? "bg-destructive/10 ring-destructive/20" : "bg-secondary/40 ring-border"}`}>
              <p className={`text-[10px] uppercase tracking-wider font-body font-bold ${totalDue > 0 ? "text-destructive/80" : "text-muted-foreground"}`}>Due</p>
              <p className={`text-2xl font-heading ${totalDue > 0 ? "text-destructive" : "text-muted-foreground"}`}>₹{totalDue}</p>
            </div>
          </div>
          {fees.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {fees.slice(0, 2).map((f: any) => (
                <div key={f.id} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
                  <span className="text-xs font-body">{f.month}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-body font-semibold">₹{f.amount}</span>
                    <span className={`text-[9px] uppercase font-body font-bold px-2 py-0.5 rounded-full tracking-wider ${
                      f.status === "approved" ? "bg-success/15 text-success" :
                      f.status === "rejected" ? "bg-destructive/15 text-destructive" :
                      "bg-warning/15 text-warning"
                    }`}>{f.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Link to="/progress" className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card/60 backdrop-blur-sm p-3 hover:border-primary/40 transition-all">
            <Flame className="h-5 w-5 text-ember" />
            <span className="text-[10px] font-body font-bold uppercase tracking-wider">Log Weight</span>
          </Link>
          <Link to="/workouts" className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card/60 backdrop-blur-sm p-3 hover:border-primary/40 transition-all">
            <Target className="h-5 w-5 text-primary" />
            <span className="text-[10px] font-body font-bold uppercase tracking-wider">Workouts</span>
          </Link>
          <Link to="/attendance" className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card/60 backdrop-blur-sm p-3 hover:border-primary/40 transition-all">
            <CalIcon className="h-5 w-5 text-sky" />
            <span className="text-[10px] font-body font-bold uppercase tracking-wider">Check-in</span>
          </Link>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
