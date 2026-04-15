import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Camera, LogOut, Loader2 } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Feet & Freakk" },
      { name: "description", content: "Your profile" },
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

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from("profiles").update({
      name,
      phone,
      age: age ? parseInt(age) : null,
      height: height || null,
      weight: weight ? parseFloat(weight) : null,
    }).eq("user_id", user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return null;

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

      <main className="mx-auto max-w-lg px-4 py-4 space-y-4">
        <div className="flex justify-center">
          {profile?.photo_url ? (
            <img src={profile.photo_url} alt={profile.name} className="h-24 w-24 rounded-2xl object-cover border-2 border-primary/30" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-secondary border-2 border-dashed border-border">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="space-y-4">
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
        </div>

        <Button variant="ember" size="lg" className="w-full" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? "Saved ✓" : "Save Changes"}
        </Button>
      </main>
      <BottomNav />
    </div>
  );
}
