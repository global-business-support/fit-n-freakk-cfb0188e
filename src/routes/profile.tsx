import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, LogOut, Loader2, IndianRupee, BadgeCheck, Plus } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Feet & Freakk" },
      { name: "description", content: "Your profile and fees" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Fees
  const [fees, setFees] = useState<any[]>([]);
  const [showAddFee, setShowAddFee] = useState(false);
  const [feeAmount, setFeeAmount] = useState("");
  const [feeMonth, setFeeMonth] = useState("");
  const [feeNotes, setFeeNotes] = useState("");
  const [submittingFee, setSubmittingFee] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setAge(profile.age?.toString() || "");
      setHeight(profile.height || "");
      setWeight(profile.weight?.toString() || "");
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    loadFees();
  }, [user]);

  const loadFees = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("fees")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setFees(data || []);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase
      .from("profiles")
      .update({
        name,
        phone,
        age: age ? parseInt(age) : null,
        height: height || null,
        weight: weight ? parseFloat(weight) : null,
      })
      .eq("user_id", user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const submitFee = async () => {
    if (!user || !feeAmount || !feeMonth) return;
    setSubmittingFee(true);
    await supabase.from("fees").insert({
      user_id: user.id,
      amount: parseFloat(feeAmount),
      month: feeMonth,
      notes: feeNotes || null,
      payment_date: new Date().toISOString(),
      status: "pending",
    });
    setFeeAmount("");
    setFeeMonth("");
    setFeeNotes("");
    setShowAddFee(false);
    setSubmittingFee(false);
    loadFees();
  };

  if (loading) return null;

  const totalPaid = fees.filter((f: any) => f.status === "approved").reduce((s: number, f: any) => s + Number(f.amount), 0);
  const totalDue = fees.filter((f: any) => f.status === "pending").reduce((s: number, f: any) => s + Number(f.amount), 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-lg px-4 py-3">
        <div className="mx-auto max-w-lg flex items-center justify-between">
          <h1 className="text-2xl font-heading tracking-wider">PROFILE</h1>
          <button onClick={signOut} className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground hover:text-destructive">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4 space-y-5">
        {/* Avatar & Member ID */}
        <div className="flex flex-col items-center gap-2">
          {profile?.photo_url ? (
            <img src={profile.photo_url} alt={profile.name} className="h-24 w-24 rounded-2xl object-cover border-2 border-primary/30" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-secondary border-2 border-dashed border-border">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
          {profile?.member_id && (
            <div className="flex items-center gap-1.5 rounded-full bg-sky/15 px-3 py-1 ring-1 ring-sky/30">
              <BadgeCheck className="h-3.5 w-3.5 text-sky" />
              <span className="text-xs font-body font-bold uppercase tracking-widest text-sky">{profile.member_id}</span>
            </div>
          )}
        </div>

        {/* Profile fields */}
        <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
          <h2 className="font-heading text-lg tracking-wider text-sky">PERSONAL DETAILS</h2>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider font-body">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary border-border h-11" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider font-body">Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-secondary border-border h-11" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-body">Age</Label>
              <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="bg-secondary border-border h-11 text-center" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-body">Height</Label>
              <Input value={height} onChange={(e) => setHeight(e.target.value)} className="bg-secondary border-border h-11 text-center" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-body">Weight (kg)</Label>
              <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="bg-secondary border-border h-11 text-center" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider font-body">Email</Label>
            <Input value={user?.email || ""} disabled className="bg-secondary/50 border-border h-11 text-muted-foreground" />
          </div>
          <Button variant="ember" size="lg" className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? "Saved ✓" : "Save Changes"}
          </Button>
        </div>

        {/* Fees Section */}
        <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg tracking-wider text-success flex items-center gap-2">
              <IndianRupee className="h-5 w-5" /> FEES
            </h2>
            <button
              onClick={() => setShowAddFee(!showAddFee)}
              className="flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary ring-1 ring-primary/30 hover:bg-primary/25 transition-colors"
            >
              <Plus className="h-3 w-3" /> Submit Payment
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-success/10 ring-1 ring-success/20 p-3">
              <p className="text-[10px] text-success/80 uppercase tracking-wider font-body font-bold">Paid</p>
              <p className="text-2xl font-heading text-success">₹{totalPaid}</p>
            </div>
            <div className={`rounded-xl ring-1 p-3 ${totalDue > 0 ? "bg-destructive/10 ring-destructive/20" : "bg-secondary/40 ring-border"}`}>
              <p className={`text-[10px] uppercase tracking-wider font-body font-bold ${totalDue > 0 ? "text-destructive/80" : "text-muted-foreground"}`}>
                Due
              </p>
              <p className={`text-2xl font-heading ${totalDue > 0 ? "text-destructive" : "text-muted-foreground"}`}>₹{totalDue}</p>
            </div>
          </div>

          {showAddFee && (
            <div className="space-y-2 rounded-xl bg-secondary/40 p-3 ring-1 ring-primary/20">
              <Input
                placeholder="Amount (₹)"
                type="number"
                value={feeAmount}
                onChange={(e) => setFeeAmount(e.target.value)}
                className="bg-card border-border h-10"
              />
              <Input
                placeholder="Month (e.g. April 2026)"
                value={feeMonth}
                onChange={(e) => setFeeMonth(e.target.value)}
                className="bg-card border-border h-10"
              />
              <Input
                placeholder="Notes (optional)"
                value={feeNotes}
                onChange={(e) => setFeeNotes(e.target.value)}
                className="bg-card border-border h-10"
              />
              <div className="flex gap-2">
                <Button variant="ember" size="sm" onClick={submitFee} disabled={submittingFee || !feeAmount || !feeMonth} className="flex-1">
                  {submittingFee ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowAddFee(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {fees.length > 0 && (
            <div className="space-y-1.5 mt-2">
              <p className="text-[10px] uppercase tracking-widest font-body font-bold text-muted-foreground">Recent Payments</p>
              {fees.slice(0, 6).map((f: any) => (
                <div key={f.id} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
                  <span className="text-xs font-body">{f.month}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-body font-semibold">₹{f.amount}</span>
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
      </main>
      <BottomNav />
    </div>
  );
}
