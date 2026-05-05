import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { LiveBackground } from "@/components/LiveBackground";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useAuth } from "@/hooks/use-auth";
import { useBranding } from "@/hooks/use-branding";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Check, X, IndianRupee, Users, Dumbbell, Plus, Trash2, Cog, ShieldCheck, CalendarDays, Settings as SettingsIcon, Loader2, Image as ImageIcon, Package, Salad, Wallet, Download, Power, Sparkles, ImagePlus, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { downloadAdminExcel } from "@/lib/excel-export";
import { LanguageToggle } from "@/components/LanguageToggle";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Feet & Freakk" },
      { name: "description", content: "Admin management panel" },
    ],
  }),
  component: AdminPage,
});

const DAY_NAMES = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function AdminPage() {
  const { user, role, loading } = useAuth();
  const { appName, logoUrl, refresh: refreshBranding } = useBranding();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"fees" | "exercises" | "machines" | "roles" | "schedules" | "settings" | "products" | "plans" | "salary" | "export" | "posts" | "attendance" | "chart">("fees");
  const [pendingFees, setPendingFees] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [salaries, setSalaries] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [attMember, setAttMember] = useState<string>("");
  const [attMonth, setAttMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [attRows, setAttRows] = useState<any[]>([]);
  const [downloading, setDownloading] = useState(false);

  // Product form
  const [newProd, setNewProd] = useState({ name: "", description: "", price: "", image_url: "", category: "" });
  const [showProdForm, setShowProdForm] = useState(false);

  // Salary form
  const [newSal, setNewSal] = useState({ user_id: "", amount: "", month: "", notes: "" });

  // Branding state
  const [brandName, setBrandName] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Auto-logout state
  const [autoLogoutEnabled, setAutoLogoutEnabled] = useState(false);
  const [autoLogoutMinutes, setAutoLogoutMinutes] = useState("2");
  const [savingLogout, setSavingLogout] = useState(false);

  useEffect(() => {
    supabase
      .from("app_settings")
      .select("key,value")
      .in("key", ["auto_logout_enabled", "auto_logout_minutes"])
      .then(({ data }) => {
        const map = Object.fromEntries((data ?? []).map((r: any) => [r.key, r.value]));
        setAutoLogoutEnabled(map.auto_logout_enabled === "true");
        if (map.auto_logout_minutes) setAutoLogoutMinutes(map.auto_logout_minutes);
      });
  }, []);

  useEffect(() => {
    setBrandName(appName);
  }, [appName]);

  // New exercise form
  const [newEx, setNewEx] = useState({ name: "", body_part: "", description: "", sets: "", reps: "", video_url: "", gender_target: "both", difficulty: "beginner" });
  const [showExForm, setShowExForm] = useState(false);
  const [exVideoUploading, setExVideoUploading] = useState(false);
  const exVideoInputRef = useRef<HTMLInputElement>(null);

  // New machine form
  const [newMachine, setNewMachine] = useState({ name: "", description: "", how_to_use: "", image_url: "", video_url: "" });
  const [showMachineForm, setShowMachineForm] = useState(false);

  // Schedule assignment
  const [scheduleUser, setScheduleUser] = useState("");
  const [scheduleDay, setScheduleDay] = useState(1);
  const [scheduleExercise, setScheduleExercise] = useState("");
  const [userSchedules, setUserSchedules] = useState<any[]>([]);

  // Role management
  const [selectedMember, setSelectedMember] = useState("");
  const [newRole, setNewRole] = useState<string>("manager");

  useEffect(() => {
    if (loading) return;
    if (!user || (role !== "admin" && role !== "manager")) {
      navigate({ to: "/dashboard" });
      return;
    }
    loadData();
  }, [loading, user, role, navigate]);

  const loadData = async () => {
    const [feesRes, profilesRes, exRes, machRes, prodRes, planRes, salRes, postsRes] = await Promise.all([
      supabase.from("fees").select("*").eq("status", "pending").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*"),
      supabase.from("exercises").select("*").order("body_part"),
      supabase.from("machines").select("*").order("name"),
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("ai_fitness_plans").select("*").order("created_at", { ascending: false }),
      supabase.from("salaries").select("*").order("paid_at", { ascending: false }),
      supabase.from("member_posts" as any).select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    setPendingFees(feesRes.data || []);
    setMembers(profilesRes.data || []);
    setExercises(exRes.data || []);
    setMachines(machRes.data || []);
    setProducts(prodRes.data || []);
    setPlans(planRes.data || []);
    setSalaries(salRes.data || []);
    setPosts((postsRes as any).data || []);
  };

  const setPostStatus = async (id: string, status: "approved" | "rejected") => {
    await supabase.from("member_posts" as any).update({ status, approved_by: user?.id, approved_at: new Date().toISOString() } as any).eq("id", id);
    setPosts((arr) => arr.map((p) => (p.id === id ? { ...p, status } : p)));
  };
  const deletePost = async (id: string) => {
    await supabase.from("member_posts" as any).delete().eq("id", id);
    setPosts((arr) => arr.filter((p) => p.id !== id));
  };

  const loadAttendanceMonth = async (uid: string, ym: string) => {
    setAttMember(uid);
    setAttMonth(ym);
    if (!uid) { setAttRows([]); return; }
    const start = new Date(`${ym}-01T00:00:00`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    const { data } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", uid)
      .gte("checked_in_at", start.toISOString())
      .lt("checked_in_at", end.toISOString())
      .order("checked_in_at");
    setAttRows(data || []);
  };

  // ───── Products ─────
  const addProduct = async () => {
    if (!newProd.name || !newProd.price) return;
    await supabase.from("products").insert({
      name: newProd.name,
      description: newProd.description || null,
      price: parseFloat(newProd.price),
      image_url: newProd.image_url || null,
      category: newProd.category || null,
      created_by: user?.id,
    });
    setNewProd({ name: "", description: "", price: "", image_url: "", category: "" });
    setShowProdForm(false);
    loadData();
  };

  const deleteProduct = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    setProducts((p) => p.filter((x) => x.id !== id));
  };

  // ───── Diet Plans ─────
  const togglePlan = async (planId: string, isActive: boolean) => {
    await supabase.from("ai_fitness_plans").update({ is_active: !isActive }).eq("id", planId);
    setPlans((p) => p.map((x) => (x.id === planId ? { ...x, is_active: !isActive } : x)));
  };

  const deletePlan = async (planId: string) => {
    await supabase.from("ai_fitness_plans").delete().eq("id", planId);
    setPlans((p) => p.filter((x) => x.id !== planId));
  };

  // ───── Salary ─────
  const addSalary = async () => {
    if (!newSal.user_id || !newSal.amount || !newSal.month) return;
    await supabase.from("salaries").insert({
      user_id: newSal.user_id,
      amount: parseFloat(newSal.amount),
      month: newSal.month,
      notes: newSal.notes || null,
      created_by: user?.id,
    });
    setNewSal({ user_id: "", amount: "", month: "", notes: "" });
    loadData();
  };

  const deleteSalary = async (id: string) => {
    await supabase.from("salaries").delete().eq("id", id);
    setSalaries((s) => s.filter((x) => x.id !== id));
  };

  // ───── Excel Export ─────
  const handleExport = async () => {
    setDownloading(true);
    try {
      await downloadAdminExcel();
    } finally {
      setDownloading(false);
    }
  };

  const handleFeeAction = async (feeId: string, action: "approved" | "rejected") => {
    await supabase.from("fees").update({ status: action, approved_at: new Date().toISOString() }).eq("id", feeId);
    setPendingFees((prev) => prev.filter((f) => f.id !== feeId));
  };

  const getMemberName = (userId: string) => members.find((m: any) => m.user_id === userId)?.name || "Unknown";

  const uploadExerciseVideo = async (file: File) => {
    if (!file || !user) return;
    setExVideoUploading(true);
    try {
      const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
      const path = `${user.id}/exercise-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("media")
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
      if (upErr) { alert("Upload failed: " + upErr.message); return; }
      const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
      setNewEx((s) => ({ ...s, video_url: pub.publicUrl }));
    } finally {
      setExVideoUploading(false);
      if (exVideoInputRef.current) exVideoInputRef.current.value = "";
    }
  };

  const addExercise = async () => {
    if (!newEx.name || !newEx.body_part) return;
    await supabase.from("exercises").insert({
      name: newEx.name,
      body_part: newEx.body_part,
      description: newEx.description || null,
      sets: newEx.sets ? parseInt(newEx.sets) : null,
      reps: newEx.reps || null,
      video_url: newEx.video_url || null,
      gender_target: newEx.gender_target,
      difficulty: newEx.difficulty,
      created_by: user?.id,
    } as any);
    setNewEx({ name: "", body_part: "", description: "", sets: "", reps: "", video_url: "", gender_target: "both", difficulty: "beginner" });
    setShowExForm(false);
    loadData();
  };

  const deleteExercise = async (id: string) => {
    await supabase.from("exercises").delete().eq("id", id);
    setExercises((prev) => prev.filter((e) => e.id !== id));
  };

  const addMachine = async () => {
    if (!newMachine.name) return;
    await supabase.from("machines").insert({
      name: newMachine.name,
      description: newMachine.description || null,
      how_to_use: newMachine.how_to_use || null,
      image_url: newMachine.image_url || null,
      video_url: newMachine.video_url || null,
      created_by: user?.id,
    });
    setNewMachine({ name: "", description: "", how_to_use: "", image_url: "", video_url: "" });
    setShowMachineForm(false);
    loadData();
  };

  const deleteMachine = async (id: string) => {
    await supabase.from("machines").delete().eq("id", id);
    setMachines((prev) => prev.filter((m) => m.id !== id));
  };

  const assignSchedule = async () => {
    if (!scheduleUser || !scheduleExercise) return;
    await supabase.from("workout_schedules").insert({
      user_id: scheduleUser,
      exercise_id: scheduleExercise,
      day_of_week: scheduleDay,
      created_by: user?.id,
    });
    loadUserSchedule(scheduleUser);
  };

  const loadUserSchedule = async (userId: string) => {
    setScheduleUser(userId);
    const { data } = await supabase.from("workout_schedules").select("*, exercises(name)").eq("user_id", userId).order("day_of_week").order("order_index");
    setUserSchedules(data || []);
  };

  const removeSchedule = async (id: string) => {
    await supabase.from("workout_schedules").delete().eq("id", id);
    setUserSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const changeRole = async () => {
    if (!selectedMember || !newRole) return;
    await supabase.from("user_roles").update({ role: newRole as "admin" | "manager" | "member" | "sub_user" }).eq("user_id", selectedMember);
    if (newRole === "manager") {
      // Grant default permissions
      const perms = ["manage_members", "manage_exercises", "manage_machines"];
      for (const p of perms) {
        await supabase.from("manager_permissions").upsert({ user_id: selectedMember, permission: p, granted_by: user?.id }, { onConflict: "user_id,permission" });
      }
    }
    setSelectedMember("");
  };

  if (loading) return null;

  const saveAppName = async () => {
    await supabase.from("app_settings").upsert(
      { key: "app_name", value: brandName, updated_at: new Date().toISOString(), updated_by: user?.id },
      { onConflict: "key" }
    );
    await refreshBranding();
  };

  const uploadLogo = async (file: File) => {
    if (!file || !user) return;
    setUploadingLogo(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `logo-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("branding")
        .upload(path, file, { cacheControl: "3600", upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("branding").getPublicUrl(path);
      await supabase.from("app_settings").upsert(
        { key: "logo_url", value: pub.publicUrl, updated_at: new Date().toISOString(), updated_by: user.id },
        { onConflict: "key" }
      );
      await refreshBranding();
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeLogo = async () => {
    await supabase.from("app_settings").upsert(
      { key: "logo_url", value: "", updated_at: new Date().toISOString(), updated_by: user?.id },
      { onConflict: "key" }
    );
    await refreshBranding();
  };

  const saveAutoLogout = async () => {
    if (!user) return;
    setSavingLogout(true);
    try {
      await Promise.all([
        supabase.from("app_settings").upsert(
          { key: "auto_logout_enabled", value: autoLogoutEnabled ? "true" : "false", updated_at: new Date().toISOString(), updated_by: user.id },
          { onConflict: "key" }
        ),
        supabase.from("app_settings").upsert(
          { key: "auto_logout_minutes", value: autoLogoutMinutes, updated_at: new Date().toISOString(), updated_by: user.id },
          { onConflict: "key" }
        ),
      ]);
    } finally {
      setSavingLogout(false);
    }
  };

  const pendingPostsCount = posts.filter((p) => p.status === "pending").length;
  const tabs = [
    { key: "posts" as const, label: "Posts", icon: ImagePlus, count: pendingPostsCount },
    { key: "fees" as const, label: "Fees", icon: IndianRupee, count: pendingFees.length },
    { key: "attendance" as const, label: "Attend.", icon: CalendarDays, count: 0 },
    { key: "exercises" as const, label: "Exercises", icon: Dumbbell, count: exercises.length },
    { key: "chart" as const, label: "Chart", icon: BookOpen, count: 0 },
    { key: "machines" as const, label: "Machines", icon: Cog, count: machines.length },
    { key: "products" as const, label: "Products", icon: Package, count: products.length },
    { key: "plans" as const, label: "Diet", icon: Salad, count: plans.length },
    { key: "salary" as const, label: "Salary", icon: Wallet, count: salaries.length },
    { key: "schedules" as const, label: "Schedule", icon: CalendarDays, count: 0 },
    { key: "roles" as const, label: "Roles", icon: ShieldCheck, count: 0 },
    { key: "export" as const, label: "Export", icon: Download, count: 0 },
    { key: "settings" as const, label: "Brand", icon: SettingsIcon, count: 0 },
  ];

  return (
    <div className="relative min-h-screen pb-20 overflow-hidden">
      <LiveBackground />
      <header className="sticky top-0 z-40 border-b border-sky/20 bg-card/70 backdrop-blur-xl px-4 py-3">
        <div className="mx-auto max-w-lg flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading tracking-wider bg-gradient-primary bg-clip-text text-transparent">ADMIN PANEL</h1>
            <p className="text-xs text-muted-foreground font-body">Manage everything in {appName}</p>
          </div>
          <LanguageToggle />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-lg px-4 py-4 space-y-4">
        {/* 3D Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "shrink-0 flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider font-body transition-all duration-200",
                tab === t.key
                  ? "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-[0_8px_20px_-8px_hsl(var(--primary)/0.7),inset_0_1px_0_rgba(255,255,255,0.3)] -translate-y-0.5"
                  : "bg-gradient-to-br from-secondary/80 to-secondary/40 text-muted-foreground border border-white/5 shadow-[0_4px_10px_-4px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] hover:text-foreground hover:-translate-y-0.5"
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
              {t.count > 0 && (
                <span className="ml-0.5 flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-background/40 text-[10px] ring-1 ring-white/10">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Posts moderation */}
        {tab === "posts" && (
          <div className="space-y-3">
            {posts.length === 0 && (
              <div className="py-12 text-center text-muted-foreground font-body">
                <ImagePlus className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>No member posts yet</p>
              </div>
            )}
            {posts.map((p: any) => (
              <div key={p.id} className={cn("rounded-2xl border bg-card/80 backdrop-blur-md overflow-hidden",
                p.status === "pending" ? "border-warning/40" : p.status === "approved" ? "border-success/30" : "border-destructive/30")}>
                <div className="flex items-center justify-between p-3">
                  <div>
                    <p className="font-heading text-base tracking-wider">{getMemberName(p.user_id)}</p>
                    <p className="text-[10px] uppercase tracking-wider font-body text-muted-foreground">{p.type} · {new Date(p.created_at).toLocaleString()}</p>
                  </div>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider font-body font-bold",
                    p.status === "approved" ? "bg-success/15 text-success" : p.status === "rejected" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning")}>
                    {p.status}
                  </span>
                </div>
                {p.media_url && (p.type === "reel"
                  ? <video src={p.media_url} controls className="w-full max-h-72 bg-black" />
                  : <img src={p.media_url} alt="post" className="w-full max-h-72 object-cover" />)}
                {p.type === "progress" && p.progress_data && (
                  <div className="grid grid-cols-4 gap-2 p-3 bg-secondary/30 text-center">
                    {["weight", "waist", "chest", "arms"].map((k) => (
                      <div key={k}>
                        <p className="text-[9px] uppercase font-body text-muted-foreground">{k}</p>
                        <p className="font-heading text-sm text-primary">{p.progress_data[k] || "—"}</p>
                      </div>
                    ))}
                  </div>
                )}
                {p.caption && <p className="p-3 text-sm font-body text-foreground/90">{p.caption}</p>}
                <div className="flex gap-2 p-3 pt-0">
                  {p.status !== "approved" && (
                    <Button variant="ember" size="sm" onClick={() => setPostStatus(p.id, "approved")} className="flex-1">
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                  )}
                  {p.status !== "rejected" && (
                    <Button variant="outline" size="sm" onClick={() => setPostStatus(p.id, "rejected")} className="flex-1">
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  )}
                  <button onClick={() => deletePost(p.id)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Monthly attendance grid */}
        {tab === "attendance" && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-sky/30 bg-card/80 backdrop-blur-md p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs uppercase tracking-wider font-body">Member</Label>
                  <select className="w-full mt-1 rounded-lg bg-secondary border border-border p-2.5 text-sm font-body" value={attMember} onChange={(e) => loadAttendanceMonth(e.target.value, attMonth)}>
                    <option value="">Choose...</option>
                    {members.map((m: any) => <option key={m.user_id} value={m.user_id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider font-body">Month</Label>
                  <input type="month" className="w-full mt-1 rounded-lg bg-secondary border border-border p-2.5 text-sm font-body" value={attMonth} onChange={(e) => loadAttendanceMonth(attMember, e.target.value)} />
                </div>
              </div>
            </div>
            {attMember && (() => {
              const [y, m] = attMonth.split("-").map(Number);
              const daysInMonth = new Date(y, m, 0).getDate();
              const firstDow = new Date(y, m - 1, 1).getDay();
              const byDay: Record<number, any> = {};
              attRows.forEach((r) => {
                const d = new Date(r.checked_in_at).getDate();
                byDay[d] = r;
              });
              const totalPresent = Object.values(byDay).filter((r: any) => r.status !== "absent").length;
              const totalOff = Object.values(byDay).filter((r: any) => r.status === "absent").length;
              return (
                <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-md p-4">
                  <div className="flex justify-between mb-3">
                    <p className="font-heading tracking-wider">{getMemberName(attMember)}</p>
                    <p className="text-xs font-body"><span className="text-success">Present {totalPresent}</span> · <span className="text-destructive">Off {totalOff}</span></p>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {["S","M","T","W","T","F","S"].map((d, i) => <p key={i} className="text-[10px] text-center font-body text-muted-foreground">{d}</p>)}
                    {Array.from({ length: firstDow }).map((_, i) => <div key={`b${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const r = byDay[day];
                      const isPresent = r && r.status !== "absent";
                      const isOff = r && r.status === "absent";
                      return (
                        <div key={day} className={cn(
                          "aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-body border",
                          isPresent && "bg-success/20 text-success border-success/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]",
                          isOff && "bg-destructive/20 text-destructive border-destructive/40",
                          !r && "bg-secondary/30 text-muted-foreground border-border/50"
                        )}>
                          <span className="font-bold">{day}</span>
                          {r && <span className="text-[8px]">{isPresent ? "✓" : "off"}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Beginner chart */}
        {tab === "chart" && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-sky/30 bg-card/80 backdrop-blur-md p-4">
              <p className="font-heading text-lg tracking-wider text-sky">BEGINNER STARTER CHART</p>
              <p className="text-xs text-muted-foreground font-body">Body-part wise exercises tagged "beginner". Tag exercises in the Exercises tab.</p>
            </div>
            {Array.from(new Set(exercises.map((e: any) => e.body_part))).map((bp) => {
              const list = exercises.filter((e: any) => e.body_part === bp && (e.difficulty === "beginner" || !e.difficulty));
              if (list.length === 0) return null;
              return (
                <div key={bp as string} className="rounded-2xl border border-border bg-card/80 backdrop-blur-md p-4">
                  <p className="font-heading text-base tracking-wider text-primary mb-2">{(bp as string).toUpperCase()} <span className="text-xs text-muted-foreground">({list.length})</span></p>
                  <div className="space-y-1.5">
                    {list.map((ex: any) => (
                      <div key={ex.id} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
                        <span className="text-sm font-body">{ex.name}</span>
                        {ex.sets && <span className="text-xs text-ember font-body">{ex.sets}×{ex.reps}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

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
                    <button onClick={() => handleFeeAction(fee.id, "approved")} className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors">
                      <Check className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleFeeAction(fee.id, "rejected")} className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Exercises Management */}
        {tab === "exercises" && (
          <div className="space-y-3">
            <Button variant="ember" size="sm" onClick={() => setShowExForm(!showExForm)} className="w-full">
              <Plus className="h-4 w-4 mr-1" /> Add Exercise
            </Button>

            {showExForm && (
              <div className="rounded-xl border border-ember/30 bg-card p-4 space-y-3">
                <Input placeholder="Exercise name" className="bg-secondary border-border" value={newEx.name} onChange={(e) => setNewEx({ ...newEx, name: e.target.value })} />
                <Input placeholder="Body part (e.g. Chest, Back, Legs)" className="bg-secondary border-border" value={newEx.body_part} onChange={(e) => setNewEx({ ...newEx, body_part: e.target.value })} />
                <Input placeholder="Description" className="bg-secondary border-border" value={newEx.description} onChange={(e) => setNewEx({ ...newEx, description: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Sets" type="number" className="bg-secondary border-border" value={newEx.sets} onChange={(e) => setNewEx({ ...newEx, sets: e.target.value })} />
                  <Input placeholder="Reps (e.g. 8-12)" className="bg-secondary border-border" value={newEx.reps} onChange={(e) => setNewEx({ ...newEx, reps: e.target.value })} />
                </div>
                <Input placeholder="Video URL (YouTube/Drive)" className="bg-secondary border-border" value={newEx.video_url} onChange={(e) => setNewEx({ ...newEx, video_url: e.target.value })} />
                <div className="flex gap-2">
                  {["both", "male", "female"].map((g) => (
                    <button key={g} onClick={() => setNewEx({ ...newEx, gender_target: g })} className={cn("rounded-lg border px-3 py-1.5 text-xs font-body uppercase", newEx.gender_target === g ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}>
                      {g}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="ember" size="sm" onClick={addExercise}>Save</Button>
                  <Button variant="outline" size="sm" onClick={() => setShowExForm(false)}>Cancel</Button>
                </div>
              </div>
            )}

            {exercises.map((ex: any) => (
              <div key={ex.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-heading text-lg tracking-wider">{ex.name}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-body uppercase">{ex.body_part}</span>
                      <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-body uppercase">{ex.gender_target}</span>
                    </div>
                    {ex.sets && <p className="text-xs text-primary font-body mt-1">{ex.sets} sets × {ex.reps}</p>}
                    {ex.video_url && (
                      <div className="mt-2"><VideoPlayer url={ex.video_url} title={ex.name} size="sm" /></div>
                    )}
                  </div>
                  <button onClick={() => deleteExercise(ex.id)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Machines Management */}
        {tab === "machines" && (
          <div className="space-y-3">
            <Button variant="ember" size="sm" onClick={() => setShowMachineForm(!showMachineForm)} className="w-full">
              <Plus className="h-4 w-4 mr-1" /> Add Machine
            </Button>

            {showMachineForm && (
              <div className="rounded-xl border border-ember/30 bg-card p-4 space-y-3">
                <Input placeholder="Machine name" className="bg-secondary border-border" value={newMachine.name} onChange={(e) => setNewMachine({ ...newMachine, name: e.target.value })} />
                <Input placeholder="Description" className="bg-secondary border-border" value={newMachine.description} onChange={(e) => setNewMachine({ ...newMachine, description: e.target.value })} />
                <textarea placeholder="How to use this machine..." className="w-full rounded-lg bg-secondary border border-border p-3 text-sm font-body min-h-[80px] resize-none" value={newMachine.how_to_use} onChange={(e) => setNewMachine({ ...newMachine, how_to_use: e.target.value })} />
                <Input placeholder="Image URL" className="bg-secondary border-border" value={newMachine.image_url} onChange={(e) => setNewMachine({ ...newMachine, image_url: e.target.value })} />
                <Input placeholder="Video URL" className="bg-secondary border-border" value={newMachine.video_url} onChange={(e) => setNewMachine({ ...newMachine, video_url: e.target.value })} />
                <div className="flex gap-2">
                  <Button variant="ember" size="sm" onClick={addMachine}>Save</Button>
                  <Button variant="outline" size="sm" onClick={() => setShowMachineForm(false)}>Cancel</Button>
                </div>
              </div>
            )}

            {machines.map((m: any) => (
              <div key={m.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-heading text-lg tracking-wider">{m.name}</p>
                    {m.description && <p className="text-xs text-muted-foreground font-body mt-1">{m.description}</p>}
                    {m.video_url && (
                      <div className="mt-2"><VideoPlayer url={m.video_url} title={m.name} size="sm" /></div>
                    )}
                  </div>
                  <button onClick={() => deleteMachine(m.id)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Schedule Assignment */}
        {tab === "schedules" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <Label className="text-xs uppercase tracking-wider font-body">Select Member</Label>
              <select className="w-full rounded-lg bg-secondary border border-border p-2.5 text-sm font-body" value={scheduleUser} onChange={(e) => loadUserSchedule(e.target.value)}>
                <option value="">Choose member...</option>
                {members.map((m: any) => (
                  <option key={m.user_id} value={m.user_id}>{m.name}</option>
                ))}
              </select>

              {scheduleUser && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs uppercase tracking-wider font-body">Day</Label>
                      <select className="w-full rounded-lg bg-secondary border border-border p-2.5 text-sm font-body" value={scheduleDay} onChange={(e) => setScheduleDay(parseInt(e.target.value))}>
                        {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                          <option key={d} value={d}>{DAY_NAMES[d]}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider font-body">Exercise</Label>
                      <select className="w-full rounded-lg bg-secondary border border-border p-2.5 text-sm font-body" value={scheduleExercise} onChange={(e) => setScheduleExercise(e.target.value)}>
                        <option value="">Choose...</option>
                        {exercises.map((ex: any) => (
                          <option key={ex.id} value={ex.id}>{ex.name} ({ex.body_part})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button variant="ember" size="sm" onClick={assignSchedule} className="w-full">
                    <Plus className="h-4 w-4 mr-1" /> Assign Exercise
                  </Button>
                </>
              )}
            </div>

            {/* Current Schedule - day-wise visual */}
            {scheduleUser && (
              <div className="space-y-2">
                <h3 className="font-heading text-lg tracking-wider flex items-center justify-between">
                  <span>{getMemberName(scheduleUser).toUpperCase()}'S WEEKLY PLAN</span>
                  <span className="text-xs text-muted-foreground font-body">{userSchedules.length} total</span>
                </h3>
                {userSchedules.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center">
                    <CalendarDays className="h-6 w-6 mx-auto mb-2 text-muted-foreground/40" />
                    <p className="text-xs text-muted-foreground font-body">No exercises assigned yet</p>
                  </div>
                ) : (
                  [1, 2, 3, 4, 5, 6, 7].map((day) => {
                    const dayItems = userSchedules.filter((s: any) => s.day_of_week === day);
                    return (
                      <div key={day} className={cn(
                        "rounded-xl border bg-card p-3",
                        dayItems.length > 0 ? "border-primary/30" : "border-border opacity-60"
                      )}>
                        <div className="flex items-center justify-between mb-2">
                          <p className={cn(
                            "font-heading text-sm tracking-wider",
                            dayItems.length > 0 ? "text-primary" : "text-muted-foreground"
                          )}>
                            {DAY_NAMES[day]}
                          </p>
                          <span className="text-[10px] uppercase tracking-wider font-body font-bold text-muted-foreground">
                            {dayItems.length === 0 ? "Rest" : `${dayItems.length} ex`}
                          </span>
                        </div>
                        {dayItems.map((s: any) => (
                          <div key={s.id} className="flex items-center justify-between rounded-lg bg-secondary/40 px-2.5 py-1.5 mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <Dumbbell className="h-3.5 w-3.5 text-sky shrink-0" />
                              <span className="text-sm font-body truncate">{s.exercises?.name || "Unknown"}</span>
                            </div>
                            <button onClick={() => removeSchedule(s.id)} className="text-destructive hover:text-destructive/80 shrink-0 ml-2">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        {/* Role Management */}
        {tab === "roles" && role === "admin" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <Label className="text-xs uppercase tracking-wider font-body">Promote Member</Label>
              <select className="w-full rounded-lg bg-secondary border border-border p-2.5 text-sm font-body" value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)}>
                <option value="">Choose member...</option>
                {members.map((m: any) => (
                  <option key={m.user_id} value={m.user_id}>{m.name}</option>
                ))}
              </select>
              <div className="flex gap-2">
                {["admin", "manager", "member", "sub_user"].map((r) => (
                  <button key={r} onClick={() => setNewRole(r)} className={cn("rounded-lg border px-3 py-1.5 text-xs font-body uppercase", newRole === r ? "border-ember bg-ember/10 text-ember" : "border-border text-muted-foreground")}>
                    {r === "sub_user" ? "Viewer" : r}
                  </button>
                ))}
              </div>
              <Button variant="ember" size="sm" onClick={changeRole} disabled={!selectedMember} className="w-full">
                <ShieldCheck className="h-4 w-4 mr-1" /> Update Role
              </Button>
              <p className="text-[10px] text-muted-foreground font-body">
                Manager = can manage exercises, machines & members. Viewer = can only watch videos & browse machines.
              </p>
            </div>
          </div>
        )}

        {/* PRODUCTS Management */}
        {tab === "products" && (
          <div className="space-y-3">
            <Button variant="ember" size="sm" onClick={() => setShowProdForm(!showProdForm)} className="w-full">
              <Plus className="h-4 w-4 mr-1" /> Add Product
            </Button>
            {showProdForm && (
              <div className="rounded-xl border border-ember/30 bg-card p-4 space-y-3">
                <Input placeholder="Product name" className="bg-secondary border-border" value={newProd.name} onChange={(e) => setNewProd({ ...newProd, name: e.target.value })} />
                <Input placeholder="Category (Supplements, Apparel...)" className="bg-secondary border-border" value={newProd.category} onChange={(e) => setNewProd({ ...newProd, category: e.target.value })} />
                <Input placeholder="Price (₹)" type="number" className="bg-secondary border-border" value={newProd.price} onChange={(e) => setNewProd({ ...newProd, price: e.target.value })} />
                <Input placeholder="Image URL" className="bg-secondary border-border" value={newProd.image_url} onChange={(e) => setNewProd({ ...newProd, image_url: e.target.value })} />
                <textarea placeholder="Description" className="w-full rounded-lg bg-secondary border border-border p-3 text-sm font-body min-h-[60px] resize-none" value={newProd.description} onChange={(e) => setNewProd({ ...newProd, description: e.target.value })} />
                <div className="flex gap-2">
                  <Button variant="ember" size="sm" onClick={addProduct}>Save</Button>
                  <Button variant="outline" size="sm" onClick={() => setShowProdForm(false)}>Cancel</Button>
                </div>
              </div>
            )}
            {products.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground font-body">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>No products yet</p>
              </div>
            ) : products.map((p: any) => (
              <div key={p.id} className="rounded-xl border border-border bg-card p-4 flex gap-3">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="h-16 w-16 rounded-lg object-cover ring-1 ring-border" />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-secondary flex items-center justify-center"><Package className="h-6 w-6 text-muted-foreground" /></div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-heading text-base tracking-wider truncate">{p.name}</p>
                  {p.category && <p className="text-[10px] text-muted-foreground font-body uppercase">{p.category}</p>}
                  <p className="text-sm text-primary font-heading">₹{p.price}</p>
                </div>
                <button onClick={() => deleteProduct(p.id)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 self-start">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* DIET PLANS — activate / cancel */}
        {tab === "plans" && (
          <div className="space-y-3">
            {plans.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground font-body">
                <Salad className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>No diet plans created yet</p>
                <p className="text-[10px] mt-1">Members generate plans via AI Coach</p>
              </div>
            ) : plans.map((p: any) => (
              <div key={p.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-base tracking-wider truncate">{getMemberName(p.user_id)}</p>
                    <p className="text-[10px] text-muted-foreground font-body uppercase">{p.goal} · {p.duration_days}d</p>
                    <span className={cn("inline-block mt-1 rounded-full px-2 py-0.5 text-[10px] font-body uppercase tracking-wider",
                      p.is_active ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                    )}>
                      {p.is_active ? "Active" : "Cancelled"}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => togglePlan(p.id, p.is_active)} className={cn("flex h-8 w-8 items-center justify-center rounded-lg",
                      p.is_active ? "bg-warning/10 text-warning hover:bg-warning/20" : "bg-success/10 text-success hover:bg-success/20"
                    )} title={p.is_active ? "Cancel plan" : "Activate plan"}>
                      <Power className="h-4 w-4" />
                    </button>
                    <button onClick={() => deletePlan(p.id)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SALARY */}
        {tab === "salary" && (
          <div className="space-y-3">
            <div className="rounded-xl border border-ember/30 bg-card p-4 space-y-3">
              <Label className="text-xs uppercase tracking-wider font-body">Add salary payment</Label>
              <select className="w-full rounded-lg bg-secondary border border-border p-2.5 text-sm font-body" value={newSal.user_id} onChange={(e) => setNewSal({ ...newSal, user_id: e.target.value })}>
                <option value="">Choose staff member...</option>
                {members.map((m: any) => (<option key={m.user_id} value={m.user_id}>{m.name}</option>))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Amount ₹" type="number" className="bg-secondary border-border" value={newSal.amount} onChange={(e) => setNewSal({ ...newSal, amount: e.target.value })} />
                <Input placeholder="Month e.g. April 2026" className="bg-secondary border-border" value={newSal.month} onChange={(e) => setNewSal({ ...newSal, month: e.target.value })} />
              </div>
              <Input placeholder="Notes (optional)" className="bg-secondary border-border" value={newSal.notes} onChange={(e) => setNewSal({ ...newSal, notes: e.target.value })} />
              <Button variant="ember" size="sm" onClick={addSalary} className="w-full"><Plus className="h-4 w-4 mr-1" /> Record Payment</Button>
            </div>
            {salaries.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground font-body">
                <Wallet className="h-8 w-8 mx-auto mb-2 opacity-30" /><p>No salary records yet</p>
              </div>
            ) : salaries.map((s: any) => (
              <div key={s.id} className="rounded-xl border border-border bg-card p-3 flex items-center justify-between">
                <div>
                  <p className="font-heading text-base tracking-wider">{getMemberName(s.user_id)}</p>
                  <p className="text-[10px] text-muted-foreground font-body uppercase">{s.month}</p>
                  {s.notes && <p className="text-[10px] text-muted-foreground font-body">{s.notes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-heading text-success">₹{s.amount}</p>
                  <button onClick={() => deleteSalary(s.id)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EXPORT */}
        {tab === "export" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-sky/30 bg-gradient-card p-5 space-y-3 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                  <Download className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-heading text-xl tracking-wider text-sky">DATA EXPORT</h3>
                  <p className="text-xs text-muted-foreground font-body">Download everything as Excel (.xlsx)</p>
                </div>
              </div>
              <ul className="text-xs text-muted-foreground font-body space-y-1 pl-1">
                <li>• Members, Roles, Attendance</li>
                <li>• Fees, Salary, Diet Plans</li>
                <li>• Products, Exercises, Machines</li>
              </ul>
              <Button onClick={handleExport} disabled={downloading} className="w-full bg-gradient-primary text-primary-foreground" size="lg">
                {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Download className="h-4 w-4 mr-2" /> Download Excel</>}
              </Button>
              <p className="text-[10px] text-muted-foreground font-body">File downloads to your device. Refresh anytime to pull latest data.</p>
            </div>
          </div>
        )}

        {tab === "settings" && role === "admin" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-sky/30 bg-gradient-card p-4 space-y-4 shadow-card">
              <div>
                <h3 className="font-heading text-lg tracking-wider text-sky mb-1">APP LOGO</h3>
                <p className="text-xs text-muted-foreground font-body">Upload your gym logo (square image works best)</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-2xl bg-gradient-primary ring-2 ring-sky/30 overflow-hidden flex items-center justify-center shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-primary-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])}
                  />
                  <Button
                    size="sm"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="w-full bg-gradient-primary text-primary-foreground"
                  >
                    {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ImageIcon className="h-4 w-4 mr-1" /> Upload Logo</>}
                  </Button>
                  {logoUrl && (
                    <Button size="sm" variant="outline" onClick={removeLogo} className="w-full">
                      <Trash2 className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-sky/30 bg-gradient-card p-4 space-y-3 shadow-card">
              <div>
                <h3 className="font-heading text-lg tracking-wider text-sky mb-1">APP NAME</h3>
                <p className="text-xs text-muted-foreground font-body">Shown across the app & login screen</p>
              </div>
              <Input
                placeholder="e.g. Feet & Freakk"
                className="bg-secondary/60 border-border h-11"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
              <Button
                size="sm"
                onClick={saveAppName}
                disabled={!brandName.trim() || brandName === appName}
                className="w-full bg-gradient-primary text-primary-foreground"
              >
                Save Name
              </Button>
            </div>

            {/* Auto-logout settings */}
            <div className="rounded-2xl border border-sky/30 bg-gradient-card p-4 space-y-3 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading text-lg tracking-wider text-sky mb-1">AUTO-LOGOUT</h3>
                  <p className="text-xs text-muted-foreground font-body">
                    Sign out members automatically after a period of inactivity
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoLogoutEnabled((v) => !v)}
                  className={cn(
                    "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                    autoLogoutEnabled ? "bg-gradient-primary" : "bg-secondary border border-border"
                  )}
                  aria-pressed={autoLogoutEnabled}
                  aria-label="Toggle auto-logout"
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-all",
                      autoLogoutEnabled ? "left-[22px]" : "left-0.5"
                    )}
                  />
                </button>
              </div>

              <div className={cn("space-y-2", !autoLogoutEnabled && "opacity-50 pointer-events-none")}>
                <Label className="text-xs uppercase tracking-wider font-body text-sky-200">
                  Inactivity duration
                </Label>
                <div className="grid grid-cols-4 gap-1.5">
                  {["2", "5", "10", "30"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setAutoLogoutMinutes(m)}
                      className={cn(
                        "rounded-lg py-2 text-xs font-body uppercase tracking-wider transition border",
                        autoLogoutMinutes === m
                          ? "bg-gradient-primary text-white border-transparent shadow-glow"
                          : "border-sky/20 text-sky-200/80 bg-secondary/40 hover:border-sky/50"
                      )}
                    >
                      {m} min
                    </button>
                  ))}
                </div>
              </div>

              <Button
                size="sm"
                onClick={saveAutoLogout}
                disabled={savingLogout}
                className="w-full bg-gradient-primary text-primary-foreground"
              >
                {savingLogout ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Auto-Logout"}
              </Button>
              <p className="text-[10px] text-muted-foreground font-body">
                Admins are exempt. Members will be signed out after {autoLogoutMinutes} min of no activity.
              </p>
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
