import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LiveBackground } from "@/components/LiveBackground";
import { BottomNav } from "@/components/BottomNav";
import { InlineVideoPlayer } from "@/components/InlineVideoPlayer";
import { MemberEditDialog } from "@/components/MemberEditDialog";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BadgeCheck,
  Phone,
  Calendar,
  Ruler,
  Weight,
  IndianRupee,
  Pencil,
  Dumbbell,
  CalendarDays,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/member/$id")({
  head: () => ({
    meta: [
      { title: "Member View — Feet & Freakk" },
      { name: "description", content: "Full member profile and workouts" },
    ],
  }),
  component: AdminMemberView,
});

const DAY_NAMES = ["", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

function AdminMemberView() {
  const { id } = Route.useParams();
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [member, setMember] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [activeDay, setActiveDay] = useState<number>(new Date().getDay() || 7);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user || (role !== "admin" && role !== "manager")) {
      navigate({ to: "/dashboard" });
      return;
    }
    if (id) loadAll();
  }, [loading, user, role, id, navigate]);

  const loadAll = async () => {
    setLoadingData(true);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [pRes, sRes, fRes, aRes, exRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", id).single(),
      supabase
        .from("workout_schedules")
        .select("*, exercises(*)")
        .eq("user_id", id)
        .order("day_of_week")
        .order("order_index"),
      supabase.from("fees").select("*").eq("user_id", id).order("created_at", { ascending: false }),
      supabase
        .from("attendance")
        .select("*")
        .eq("user_id", id)
        .gte("checked_in_at", monthStart.toISOString())
        .order("checked_in_at", { ascending: false }),
      supabase.from("exercises").select("*").order("body_part"),
    ]);
    setMember(pRes.data);
    setSchedules(sRes.data || []);
    setFees(fRes.data || []);
    setAttendance(aRes.data || []);
    setExercises(exRes.data || []);
    setLoadingData(false);
  };

  if (loading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4">
        <p className="text-foreground font-heading text-xl">MEMBER NOT FOUND</p>
        <Link to="/dashboard" className="text-sky underline font-body">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const totalPaid = fees.filter((f: any) => f.status === "approved").reduce((s: number, f: any) => s + Number(f.amount), 0);
  const totalDue = fees.filter((f: any) => f.status === "pending").reduce((s: number, f: any) => s + Number(f.amount), 0);
  const daysWithSchedule = [...new Set(schedules.map((s: any) => s.day_of_week))].sort();
  const dayExercises = schedules.filter((s: any) => s.day_of_week === activeDay);

  return (
    <div className="relative min-h-screen pb-20 overflow-hidden">
      <LiveBackground />

      <header className="sticky top-0 z-40 border-b border-sky/20 bg-card/70 backdrop-blur-xl px-4 py-3">
        <div className="mx-auto max-w-3xl flex items-center justify-between gap-2">
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/60 text-foreground ring-1 ring-border"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0 text-center">
            <h1 className="text-xl font-heading tracking-wider truncate text-sky">
              MEMBER PROFILE
            </h1>
          </div>
          <Button size="sm" variant="ember" onClick={() => setEditing(true)}>
            <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
          </Button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-4 py-5 space-y-5">
        {/* Hero card */}
        <div className="relative overflow-hidden rounded-3xl border border-sky/30 bg-gradient-to-br from-card via-primary/5 to-sky/10 p-5 shadow-glow">
          <div className="absolute -top-20 -right-12 h-56 w-56 rounded-full bg-primary/25 blur-3xl pointer-events-none animate-pulse-glow" />
          <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-sky/20 blur-3xl pointer-events-none animate-aurora-slow" />

          <div className="relative flex flex-col sm:flex-row items-start gap-4">
            <div className="relative shrink-0">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-primary opacity-75 blur-sm" />
              <div className="relative h-24 w-24 overflow-hidden rounded-2xl ring-2 ring-sky/50 bg-gradient-primary">
                {member.photo_url ? (
                  <img src={member.photo_url} alt={member.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-heading text-primary-foreground">
                    {member.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-heading text-3xl tracking-wider text-foreground">
                {member.name?.toUpperCase()}
              </h2>
              {member.member_id && (
                <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-sky/15 px-2.5 py-0.5 ring-1 ring-sky/30">
                  <BadgeCheck className="h-3 w-3 text-sky" />
                  <span className="text-[10px] font-body font-bold uppercase tracking-widest text-sky">
                    {member.member_id}
                  </span>
                </div>
              )}
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Stat icon={Calendar} label="Age" value={member.age ? `${member.age}y` : "—"} />
                <Stat icon={Ruler} label="Height" value={member.height || "—"} />
                <Stat icon={Weight} label="Weight" value={member.weight ? `${member.weight}kg` : "—"} />
                <Stat icon={Phone} label="Phone" value={member.phone || "—"} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          <MiniStat label="Total Paid" value={`₹${totalPaid}`} accent="success" icon={IndianRupee} />
          <MiniStat label="Due" value={`₹${totalDue}`} accent={totalDue > 0 ? "destructive" : "muted"} icon={IndianRupee} />
          <MiniStat label="Visits (mo)" value={`${attendance.length}`} accent="primary" icon={Activity} />
        </div>

        {/* Workout Schedule with videos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-xl tracking-wider text-sky flex items-center gap-2">
              <Dumbbell className="h-5 w-5" /> WORKOUT SCHEDULE
            </h3>
            <span className="text-xs text-muted-foreground font-body">
              {schedules.length} exercises assigned
            </span>
          </div>

          {schedules.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card/50 p-8 text-center">
              <CalendarDays className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-foreground font-heading text-lg tracking-wider">NO SCHEDULE</p>
              <p className="text-xs text-muted-foreground font-body mt-1">
                Click Edit above to assign exercises for each day.
              </p>
            </div>
          ) : (
            <>
              {/* Day picker */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {[1, 2, 3, 4, 5, 6, 7].map((d) => {
                  const has = daysWithSchedule.includes(d);
                  const isActive = d === activeDay;
                  return (
                    <button
                      key={d}
                      onClick={() => setActiveDay(d)}
                      className={cn(
                        "shrink-0 flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 transition-all min-w-[60px]",
                        isActive
                          ? "bg-gradient-primary text-primary-foreground shadow-glow"
                          : has
                          ? "bg-sky/10 text-sky ring-1 ring-sky/30"
                          : "bg-secondary/40 text-muted-foreground"
                      )}
                    >
                      <span className="text-[9px] font-body font-bold tracking-wider">
                        {DAY_NAMES[d].slice(0, 3)}
                      </span>
                      <span className="text-sm font-heading">
                        {schedules.filter((s: any) => s.day_of_week === d).length || "—"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Day exercises with inline videos */}
              {dayExercises.length === 0 ? (
                <div className="rounded-xl bg-card/50 border border-border p-6 text-center">
                  <p className="text-sm text-muted-foreground font-body">
                    No exercises for {DAY_NAMES[activeDay]} — Rest day.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dayExercises.map((s: any) => {
                    const ex = s.exercises;
                    if (!ex) return null;
                    return (
                      <div
                        key={s.id}
                        className="rounded-2xl border border-sky/20 bg-card/60 backdrop-blur-md p-3"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
                            <Dumbbell className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-heading text-lg tracking-wider truncate">{ex.name}</p>
                            <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-muted-foreground font-body uppercase tracking-wider">
                              <span className="text-sky font-bold">{ex.body_part}</span>
                              {ex.sets && (
                                <>
                                  <span className="text-border">•</span>
                                  <span>{ex.sets} sets</span>
                                </>
                              )}
                              {ex.reps && (
                                <>
                                  <span className="text-border">•</span>
                                  <span className="text-ember font-bold">{ex.reps} reps</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        {ex.video_url && (
                          <InlineVideoPlayer url={ex.video_url} title={ex.name} thumbnailUrl={ex.thumbnail_url} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Fees history */}
        <div className="space-y-3">
          <h3 className="font-heading text-xl tracking-wider text-success flex items-center gap-2">
            <IndianRupee className="h-5 w-5" /> FEES HISTORY
          </h3>
          {fees.length === 0 ? (
            <p className="text-sm text-muted-foreground font-body">No fee records yet.</p>
          ) : (
            <div className="space-y-2">
              {fees.map((f: any) => (
                <div key={f.id} className="flex items-center justify-between rounded-xl bg-card/60 border border-border px-4 py-3">
                  <div>
                    <p className="text-sm font-body font-semibold">{f.month}</p>
                    <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">
                      {new Date(f.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-heading">₹{f.amount}</span>
                    <span
                      className={`text-[9px] uppercase font-body font-bold px-2 py-0.5 rounded-full tracking-wider ${
                        f.status === "approved"
                          ? "bg-success/15 text-success"
                          : f.status === "rejected"
                          ? "bg-destructive/15 text-destructive"
                          : "bg-warning/15 text-warning"
                      }`}
                    >
                      {f.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent attendance */}
        <div className="space-y-3">
          <h3 className="font-heading text-xl tracking-wider text-ember flex items-center gap-2">
            <Activity className="h-5 w-5" /> RECENT VISITS
          </h3>
          {attendance.length === 0 ? (
            <p className="text-sm text-muted-foreground font-body">No visits this month.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {attendance.slice(0, 12).map((a: any) => (
                <div key={a.id} className="rounded-lg bg-card/60 border border-border px-3 py-2 text-center">
                  <p className="text-xs font-body font-semibold">
                    {new Date(a.checked_in_at).toLocaleDateString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-body">
                    {new Date(a.checked_in_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {editing && (
        <MemberEditDialog
          member={{ ...member, gender: member.gender || "male" }}
          exercises={exercises}
          onClose={() => setEditing(false)}
          onSaved={loadAll}
        />
      )}
      <BottomNav />
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-card/60 ring-1 ring-border px-2.5 py-1.5">
      <p className="flex items-center gap-1 text-[9px] text-muted-foreground uppercase tracking-wider font-body font-bold">
        <Icon className="h-2.5 w-2.5" /> {label}
      </p>
      <p className="text-sm font-body font-semibold mt-0.5 truncate">{value}</p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: any;
  accent: "success" | "destructive" | "primary" | "muted";
}) {
  const colors = {
    success: "text-success bg-success/10 ring-success/20",
    destructive: "text-destructive bg-destructive/10 ring-destructive/20",
    primary: "text-primary bg-primary/10 ring-primary/20",
    muted: "text-muted-foreground bg-secondary/40 ring-border",
  }[accent];
  return (
    <div className={`rounded-xl ring-1 p-3 ${colors}`}>
      <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-body font-bold opacity-80">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p className="text-xl font-heading mt-0.5">{value}</p>
    </div>
  );
}
