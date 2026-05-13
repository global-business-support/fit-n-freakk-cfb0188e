import { useState, useEffect } from "react";
import { X, Loader2, RefreshCw, Save, BadgeCheck, IndianRupee, Plus, Check, Trash2, CalendarDays, Dumbbell, KeyRound, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { adminResetMemberPassword } from "@/lib/admin-actions.functions";

const DAYS = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface MemberEditDialogProps {
  member: any;
  exercises: any[];
  onClose: () => void;
  onSaved: () => void;
}

function generateMemberId(name: string, phone: string): string {
  const first = name.split(" ")[0] || name;
  const nameSlug = (first.replace(/[^a-zA-Z]/g, "").slice(0, 4) || "USER").toUpperCase().padEnd(4, "X");
  const digits = (phone || "").replace(/\D/g, "");
  const phoneSlug = digits.slice(-4).padStart(4, "0");
  return `${nameSlug}${phoneSlug}`;
}

export function MemberEditDialog({ member, exercises, onClose, onSaved }: MemberEditDialogProps) {
  const [tab, setTab] = useState<"profile" | "schedule" | "fees">("profile");
  const [saving, setSaving] = useState(false);

  // Profile fields
  const [name, setName] = useState(member.name || "");
  const [phone, setPhone] = useState(member.phone || "");
  const [age, setAge] = useState(member.age?.toString() || "");
  const [height, setHeight] = useState(member.height || "");
  const [weight, setWeight] = useState(member.weight?.toString() || "");
  const [memberId, setMemberId] = useState(member.member_id || "");

  // Fees
  const [fees, setFees] = useState<any[]>([]);
  const [newFeeAmount, setNewFeeAmount] = useState("");
  const [newFeeMonth, setNewFeeMonth] = useState(new Date().toISOString().slice(0, 7));

  // Schedule
  const [schedules, setSchedules] = useState<any[]>([]);
  const [scheduleDay, setScheduleDay] = useState(1);
  const [scheduleExercise, setScheduleExercise] = useState("");

  useEffect(() => {
    loadMemberData();
  }, [member.user_id]);

  const loadMemberData = async () => {
    const [feesRes, schedRes] = await Promise.all([
      supabase.from("fees").select("*").eq("user_id", member.user_id).order("created_at", { ascending: false }),
      supabase.from("workout_schedules").select("*, exercises(name, body_part)").eq("user_id", member.user_id).order("day_of_week").order("order_index"),
    ]);
    setFees(feesRes.data || []);
    setSchedules(schedRes.data || []);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await supabase.from("profiles").update({
        name: name.trim(),
        phone: phone.trim() || null,
        age: age ? parseInt(age) : null,
        height: height || null,
        weight: weight ? parseFloat(weight) : null,
        member_id: memberId || null,
      }).eq("user_id", member.user_id);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const regenerateMemberId = async () => {
    const base = generateMemberId(name, phone);
    let final = base;
    let attempt = 0;
    while (attempt < 5) {
      const { error } = await supabase
        .from("profiles")
        .update({ member_id: final })
        .eq("user_id", member.user_id);
      if (!error) {
        setMemberId(final);
        onSaved();
        break;
      }
      attempt++;
      final = `${base}${Math.floor(Math.random() * 90 + 10)}`;
    }
  };

  const addFee = async () => {
    if (!newFeeAmount || !newFeeMonth) return;
    await supabase.from("fees").insert({
      user_id: member.user_id,
      amount: parseFloat(newFeeAmount),
      month: newFeeMonth,
      status: "pending",
    });
    setNewFeeAmount("");
    loadMemberData();
  };

  const updateFeeStatus = async (id: string, status: "approved" | "rejected" | "pending") => {
    await supabase.from("fees").update({
      status,
      approved_at: status === "approved" ? new Date().toISOString() : null,
    }).eq("id", id);
    loadMemberData();
  };

  const assignSchedule = async () => {
    if (!scheduleExercise) return;
    await supabase.from("workout_schedules").insert({
      user_id: member.user_id,
      exercise_id: scheduleExercise,
      day_of_week: scheduleDay,
    });
    setScheduleExercise("");
    loadMemberData();
  };

  const removeSchedule = async (id: string) => {
    await supabase.from("workout_schedules").delete().eq("id", id);
    loadMemberData();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in p-0 md:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full md:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl md:rounded-3xl border border-sky/30 bg-card shadow-glow"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 backdrop-blur-xl px-5 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary overflow-hidden ring-2 ring-sky/30 shrink-0">
              {member.photo_url ? (
                <img src={member.photo_url} alt={member.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-primary-foreground font-heading text-lg">
                  {(member.name || "?").charAt(0)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="font-heading text-xl tracking-wider truncate">{member.name}</h2>
              {member.member_id && (
                <p className="text-[10px] text-sky uppercase tracking-[0.2em] font-body inline-flex items-center gap-1">
                  <BadgeCheck className="h-3 w-3" /> {member.member_id}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-3 border-b border-border">
          {[
            { k: "profile" as const, label: "Profile" },
            { k: "schedule" as const, label: "Schedule" },
            { k: "fees" as const, label: "Fees" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={cn(
                "flex-1 py-2.5 text-xs uppercase tracking-wider font-body font-bold transition-all border-b-2",
                tab === t.k
                  ? "text-sky border-sky"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* PROFILE TAB */}
          {tab === "profile" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider font-body">Full Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary border-border h-11" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider font-body">Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-secondary border-border h-11" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider font-body">Age</Label>
                  <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="bg-secondary border-border h-11 text-center" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider font-body">Height</Label>
                  <Input value={height} onChange={(e) => setHeight(e.target.value)} className="bg-secondary border-border h-11 text-center" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider font-body">Weight (kg)</Label>
                  <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="bg-secondary border-border h-11 text-center" />
                </div>
              </div>

              {/* Member ID */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <Label className="text-xs uppercase tracking-wider font-body inline-flex items-center gap-1.5">
                  <BadgeCheck className="h-3.5 w-3.5 text-sky" /> Member ID
                </Label>
                <div className="flex gap-2">
                  <Input value={memberId} onChange={(e) => setMemberId(e.target.value.toUpperCase())} className="bg-secondary border-border h-11 font-heading tracking-[0.2em]" placeholder="NAME1234" />
                  <Button type="button" onClick={regenerateMemberId} variant="outline" size="default" className="h-11 shrink-0">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground font-body">Auto-generates from first 4 letters of name + last 4 digits of phone</p>
              </div>

              <Button onClick={saveProfile} disabled={saving} className="w-full bg-gradient-primary text-primary-foreground" size="lg">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
              </Button>
            </div>
          )}

          {/* SCHEDULE TAB */}
          {tab === "schedule" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-sky/20 bg-secondary/40 p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <select className="w-full rounded-lg bg-secondary border border-border p-2.5 text-sm font-body" value={scheduleDay} onChange={(e) => setScheduleDay(parseInt(e.target.value))}>
                    {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                      <option key={d} value={d}>{DAYS[d]}</option>
                    ))}
                  </select>
                  <select className="w-full rounded-lg bg-secondary border border-border p-2.5 text-sm font-body" value={scheduleExercise} onChange={(e) => setScheduleExercise(e.target.value)}>
                    <option value="">Pick exercise...</option>
                    {exercises.map((ex: any) => (
                      <option key={ex.id} value={ex.id}>{ex.name} ({ex.body_part})</option>
                    ))}
                  </select>
                </div>
                <Button onClick={assignSchedule} disabled={!scheduleExercise} size="sm" className="w-full bg-gradient-primary text-primary-foreground">
                  <Plus className="h-4 w-4 mr-1" /> Assign to {DAYS[scheduleDay]}
                </Button>
              </div>

              {/* Day-wise schedule */}
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                  const items = schedules.filter((s: any) => s.day_of_week === day);
                  return (
                    <div key={day} className={cn(
                      "rounded-xl border p-3",
                      items.length > 0 ? "border-primary/30 bg-card" : "border-border bg-card/50 opacity-60"
                    )}>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className={cn("font-heading text-sm tracking-wider", items.length > 0 ? "text-primary" : "text-muted-foreground")}>
                          <CalendarDays className="h-3.5 w-3.5 inline mr-1.5" />
                          {DAYS[day]}
                        </p>
                        <span className="text-[10px] uppercase tracking-wider font-body font-bold text-muted-foreground">
                          {items.length === 0 ? "Rest day" : `${items.length} exercises`}
                        </span>
                      </div>
                      {items.map((s: any) => (
                        <div key={s.id} className="flex items-center justify-between rounded-lg bg-secondary/40 px-2.5 py-1.5 mt-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <Dumbbell className="h-3.5 w-3.5 text-sky shrink-0" />
                            <span className="text-sm font-body truncate">{s.exercises?.name}</span>
                          </div>
                          <button onClick={() => removeSchedule(s.id)} className="text-destructive hover:text-destructive/80 shrink-0">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* FEES TAB */}
          {tab === "fees" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-success/20 bg-secondary/40 p-3 space-y-2">
                <Label className="text-xs uppercase tracking-wider font-body">Add Fee Entry</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="month" value={newFeeMonth} onChange={(e) => setNewFeeMonth(e.target.value)} className="bg-secondary border-border h-11" />
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input type="number" placeholder="Amount" value={newFeeAmount} onChange={(e) => setNewFeeAmount(e.target.value)} className="bg-secondary border-border h-11 pl-9" />
                  </div>
                </div>
                <Button onClick={addFee} size="sm" disabled={!newFeeAmount} className="w-full bg-gradient-primary text-primary-foreground">
                  <Plus className="h-4 w-4 mr-1" /> Add Fee
                </Button>
              </div>

              {fees.length === 0 && (
                <div className="py-8 text-center text-muted-foreground font-body text-sm">
                  No fees recorded yet
                </div>
              )}

              {fees.map((f: any) => (
                <div key={f.id} className="rounded-xl border border-border bg-card p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-heading text-base tracking-wider">₹{f.amount}</p>
                      <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">{f.month}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "text-[10px] font-body font-bold uppercase tracking-wider px-2 py-1 rounded-full",
                        f.status === "approved" ? "bg-success/15 text-success" :
                          f.status === "rejected" ? "bg-destructive/15 text-destructive" :
                            "bg-warning/15 text-warning"
                      )}>{f.status}</span>
                      {f.status !== "approved" && (
                        <button onClick={() => updateFeeStatus(f.id, "approved")} className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success hover:bg-success/20">
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      {f.status !== "rejected" && (
                        <button onClick={() => updateFeeStatus(f.id, "rejected")} className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
