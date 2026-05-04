import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useBranding } from "@/hooks/use-branding";
import { Users, UserCheck, IndianRupee, TrendingUp, Bell, LogOut, Dumbbell, Search } from "lucide-react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { StatCard } from "@/components/StatCard";
import { MemberCard } from "@/components/MemberCard";
import { Profile3DCard } from "@/components/Profile3DCard";
import { TodayVideoFeed } from "@/components/TodayVideoFeed";
import { MemberEditDialog } from "@/components/MemberEditDialog";
import { BottomNav } from "@/components/BottomNav";
import { LiveBackground } from "@/components/LiveBackground";
import { HomeBackground } from "@/components/HomeBackground";
import { AttendanceToggle } from "@/components/AttendanceToggle";
import { WeekDayStrip } from "@/components/WeekDayStrip";
import { MemberPostUpload } from "@/components/MemberPostUpload";
import { CommunityFeed } from "@/components/CommunityFeed";
import { useInactivityLogout } from "@/hooks/use-inactivity-logout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";

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
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  if (!user) return null;

  return role === "admin" ? <AdminDashboard /> : <MemberDashboard />;
}

function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const { appName, logoUrl } = useBranding();
  const [members, setMembers] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, todayVisitors: 0, pendingFees: 0, revenue: 0 });
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [profilesRes, feesRes, attendanceRes, exRes] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("fees").select("*"),
      supabase.from("attendance").select("*").gte("checked_in_at", new Date().toISOString().split("T")[0]),
      supabase.from("exercises").select("*").order("body_part"),
    ]);

    const profiles = profilesRes.data || [];
    const fees = feesRes.data || [];
    const todayAttendance = attendanceRes.data || [];

    const approved = fees.filter((f: any) => f.status === "approved");
    const pending = fees.filter((f: any) => f.status === "pending");

    setMembers(
      profiles.map((p: any) => {
        const memberFees = fees.filter((f: any) => f.user_id === p.user_id);
        const paid = memberFees
          .filter((f: any) => f.status === "approved")
          .reduce((s: number, f: any) => s + Number(f.amount), 0);
        const due = memberFees
          .filter((f: any) => f.status === "pending")
          .reduce((s: number, f: any) => s + Number(f.amount), 0);
        const lastVisit = todayAttendance.find((a: any) => a.user_id === p.user_id) ? "Today" : "—";
        return {
          ...p,
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
      })
    );

    setExercises(exRes.data || []);

    setStats({
      total: profiles.length,
      todayVisitors: todayAttendance.length,
      pendingFees: pending.reduce((s: number, f: any) => s + Number(f.amount), 0),
      revenue: approved.reduce((s: number, f: any) => s + Number(f.amount), 0),
    });
  };

  const filteredMembers = members.filter((m: any) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.member_id?.toLowerCase().includes(q) ||
      m.phone?.includes(q)
    );
  });

  return (
    <div className="relative min-h-screen pb-20 overflow-hidden">
      <LiveBackground />
      <header className="sticky top-0 z-40 border-b border-sky/20 bg-card/70 backdrop-blur-xl px-4 py-3">
        <div className="mx-auto max-w-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary shadow-glow overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt={appName} className="h-full w-full object-cover" />
              ) : (
                <Dumbbell className="h-6 w-6 text-primary-foreground" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-heading tracking-widest bg-gradient-primary bg-clip-text text-transparent">
                {appName.toUpperCase()}
              </h1>
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
            <span className="text-xs text-muted-foreground font-body">
              {filteredMembers.length} of {members.length}
            </span>
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
              <div key={member.user_id || member.name} className="space-y-2">
                <MemberCard {...member} memberId={member.member_id} onEdit={() => setEditingMember(member)} />
                <Link
                  to="/admin/member/$id"
                  params={{ id: member.user_id }}
                  className="flex items-center justify-center gap-1 rounded-xl bg-primary/15 hover:bg-primary/25 text-primary text-[11px] font-bold uppercase tracking-wider font-body py-2 ring-1 ring-primary/30 transition-colors"
                >
                  View Full Profile & Workouts →
                </Link>
              </div>
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
  const [attendance, setAttendance] = useState<any[]>([]);
  const [weeklyDone, setWeeklyDone] = useState(0);
  const [weeklyTarget, setWeeklyTarget] = useState(0);

  useInactivityLogout();

  useEffect(() => {
    if (!user) return;
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    Promise.all([
      supabase
        .from("attendance")
        .select("*")
        .eq("user_id", user.id)
        .gte("checked_in_at", weekStart.toISOString())
        .order("checked_in_at", { ascending: false }),
      supabase.from("workout_schedules").select("day_of_week").eq("user_id", user.id),
    ]).then(([aRes, sRes]) => {
      setAttendance(aRes.data || []);
      setWeeklyDone((aRes.data || []).length);
      const uniqueDays = new Set((sRes.data || []).map((s: any) => s.day_of_week));
      setWeeklyTarget(uniqueDays.size);
    });
  }, [user]);

  const streak = (() => {
    if (attendance.length === 0) return 0;
    let s = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates = new Set(attendance.map((a: any) => new Date(a.checked_in_at).toDateString()));
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (dates.has(d.toDateString())) s++;
      else if (i > 0) break;
    }
    return s;
  })();

  return (
    <div className="relative min-h-screen pb-20 overflow-hidden">
      {/* Gym girl screensaver background */}
      <HomeBackground />

      <header className="sticky top-0 z-40 border-b border-sky/20 bg-card/40 backdrop-blur-xl px-4 py-3">
        <div className="mx-auto max-w-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Dumbbell className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-heading tracking-widest bg-gradient-primary bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(125,211,252,0.5)]">
              FEET & FREAKK
            </h1>
          </div>
          <div className="flex gap-2 items-center">
            <LanguageToggle />
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md text-sky ring-1 ring-sky/30">
              <Bell className="h-5 w-5" />
            </button>
            <button
              onClick={signOut}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md text-white hover:text-destructive ring-1 ring-white/20"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-5 space-y-5 relative z-10">
        {/* 3D Glassmorphism Profile Card */}
        <Profile3DCard
          name={profile?.name || "Member"}
          memberId={profile?.member_id}
          age={profile?.age}
          weight={profile?.weight}
          height={profile?.height}
          gender={profile?.gender}
          photoUrl={profile?.photo_url}
          streak={streak}
          weeklyTarget={weeklyTarget || 4}
          weeklyDone={weeklyDone}
        />

        {/* Today's Present/Absent toggle */}
        {user && <AttendanceToggle userId={user.id} />}

        {/* AI Coach CTA */}
        <Link
          to="/ai-coach"
          className="relative block overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/20 via-card/60 to-sky/15 backdrop-blur-md p-4 hover:scale-[1.01] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-heading text-lg tracking-wider text-foreground">AI FITNESS COACH</p>
              <p className="text-xs text-muted-foreground font-body">Get a personalized workout & diet plan</p>
            </div>
            <span className="font-heading text-2xl text-primary">→</span>
          </div>
          <span className="animate-shimmer-sweep" />
        </Link>

        {/* Mon-Sun day strip with editable exercises per day */}
        {user && <WeekDayStrip userId={user.id} />}

        {/* Today's videos — auto-embedded, play in place */}
        {user && <TodayVideoFeed userId={user.id} />}
      </main>
      <BottomNav />
    </div>
  );
}
