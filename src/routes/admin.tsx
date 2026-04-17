import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { LiveBackground } from "@/components/LiveBackground";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useAuth } from "@/hooks/use-auth";
import { useBranding } from "@/hooks/use-branding";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Check, X, IndianRupee, Users, Dumbbell, Plus, Trash2, Cog, ShieldCheck, CalendarDays, Settings as SettingsIcon, Loader2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [tab, setTab] = useState<"fees" | "exercises" | "machines" | "roles" | "schedules" | "settings">("fees");
  const [pendingFees, setPendingFees] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);

  // Branding state
  const [brandName, setBrandName] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBrandName(appName);
  }, [appName]);

  // New exercise form
  const [newEx, setNewEx] = useState({ name: "", body_part: "", description: "", sets: "", reps: "", video_url: "", gender_target: "both" });
  const [showExForm, setShowExForm] = useState(false);

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
    if (!loading && (!user || (role !== "admin" && role !== "manager"))) navigate({ to: "/dashboard" });
  }, [loading, user, role, navigate]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [feesRes, profilesRes, exRes, machRes] = await Promise.all([
      supabase.from("fees").select("*").eq("status", "pending").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*"),
      supabase.from("exercises").select("*").order("body_part"),
      supabase.from("machines").select("*").order("name"),
    ]);
    setPendingFees(feesRes.data || []);
    setMembers(profilesRes.data || []);
    setExercises(exRes.data || []);
    setMachines(machRes.data || []);
  };

  const handleFeeAction = async (feeId: string, action: "approved" | "rejected") => {
    await supabase.from("fees").update({ status: action, approved_at: new Date().toISOString() }).eq("id", feeId);
    setPendingFees((prev) => prev.filter((f) => f.id !== feeId));
  };

  const getMemberName = (userId: string) => members.find((m: any) => m.user_id === userId)?.name || "Unknown";

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
      created_by: user?.id,
    });
    setNewEx({ name: "", body_part: "", description: "", sets: "", reps: "", video_url: "", gender_target: "both" });
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

  const tabs = [
    { key: "fees" as const, label: "Fees", icon: IndianRupee, count: pendingFees.length },
    { key: "exercises" as const, label: "Exercises", icon: Dumbbell, count: exercises.length },
    { key: "machines" as const, label: "Machines", icon: Cog, count: machines.length },
    { key: "schedules" as const, label: "Schedule", icon: CalendarDays, count: 0 },
    { key: "roles" as const, label: "Roles", icon: ShieldCheck, count: 0 },
    { key: "settings" as const, label: "Brand", icon: SettingsIcon, count: 0 },
  ];

  return (
    <div className="relative min-h-screen pb-20 overflow-hidden">
      <LiveBackground />
      <header className="sticky top-0 z-40 border-b border-sky/20 bg-card/70 backdrop-blur-xl px-4 py-3">
        <div className="mx-auto max-w-lg">
          <h1 className="text-2xl font-heading tracking-wider bg-gradient-primary bg-clip-text text-transparent">ADMIN PANEL</h1>
          <p className="text-xs text-muted-foreground font-body">Manage everything in {appName}</p>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-lg px-4 py-4 space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map((t) => (
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

            {/* Current Schedule */}
            {scheduleUser && userSchedules.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-heading text-lg tracking-wider">{getMemberName(scheduleUser)}'S SCHEDULE</h3>
                {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                  const dayItems = userSchedules.filter((s: any) => s.day_of_week === day);
                  if (dayItems.length === 0) return null;
                  return (
                    <div key={day} className="rounded-xl border border-border bg-card p-3">
                      <p className="font-heading text-sm tracking-wider text-primary mb-2">{DAY_NAMES[day]}</p>
                      {dayItems.map((s: any) => (
                        <div key={s.id} className="flex items-center justify-between py-1">
                          <span className="text-sm font-body">{s.exercises?.name || "Unknown"}</span>
                          <button onClick={() => removeSchedule(s.id)} className="text-destructive hover:text-destructive/80">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })}
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
                {["manager", "member", "sub_user"].map((r) => (
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

        {/* Branding / Settings */}
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
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
