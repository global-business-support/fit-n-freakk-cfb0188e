import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, User, Phone, ChevronLeft, Loader2, Copy, CheckCircle2, BadgeCheck, MessageCircle, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — Feet & Freakk" },
      { name: "description", content: "Create your gym account" },
    ],
  }),
  component: RegisterPage,
});

// Generate Member ID: first 4 letters of FIRST name (uppercase) + last 4 digits of phone
function generateMemberId(firstName: string, phone: string): string {
  const nameSlug = (firstName.replace(/[^a-zA-Z]/g, "").slice(0, 4) || "USER").toUpperCase().padEnd(4, "X");
  const digits = phone.replace(/\D/g, "");
  const phoneSlug = digits.slice(-4).padStart(4, "0");
  return `${nameSlug}${phoneSlug}`;
}

function RegisterPage() {
  const [userType, setUserType] = useState<"member" | "sub_user">("member");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [fitnessLevel, setFitnessLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [savedEmail, setSavedEmail] = useState<string>("");
  const [savedPhone, setSavedPhone] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile) {
      setError("Profile photo is mandatory!");
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required!");
      return;
    }
    setError("");
    setIsLoading(true);

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    const { error: signUpError } = await signUp(email, password, {
      name: fullName,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone,
      age: parseInt(age),
      height,
      weight: parseFloat(weight),
      gender,
      fitness_level: fitnessLevel,
      user_type: userType,
    });

    if (signUpError) {
      setError(signUpError);
      setIsLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user && photoFile) {
      const ext = photoFile.name.split(".").pop();
      const path = `${user.id}/profile.${ext}`;
      const { data: uploadData } = await supabase.storage.from("media").upload(path, photoFile, { upsert: true });
      if (uploadData) {
        const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
        await supabase.from("profiles").update({ photo_url: publicUrl }).eq("user_id", user.id);
      }
    }

    // Generate Member ID from FIRST name + last 4 digits of phone
    const id = generateMemberId(firstName, phone);
    if (user) {
      let finalId = id;
      let attempt = 0;
      while (attempt < 5) {
        const { error: idErr } = await supabase
          .from("profiles")
          .update({ member_id: finalId })
          .eq("user_id", user.id);
        if (!idErr) break;
        attempt++;
        finalId = `${id}${Math.floor(Math.random() * 90 + 10)}`;
      }
      setMemberId(finalId);
    } else {
      setMemberId(id);
    }
    setSavedEmail(email);
    setSavedPhone(phone);
    setIsLoading(false);
  };

  const handleContinue = () => {
    navigate({ to: "/dashboard" });
  };

  const copyMemberId = async () => {
    if (!memberId) return;
    await navigator.clipboard.writeText(memberId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    if (!memberId) return;
    const message = encodeURIComponent(
      `🏋️ Welcome to Feet & Freakk!\n\n` +
      `Your Member ID: *${memberId}*\n` +
      `Login Email: ${savedEmail}\n\n` +
      `Use your email and password to login at the app.\n` +
      `Show this Member ID at the gym front desk for quick check-in.\n\n` +
      `Train hard. Track smarter. 💪`
    );
    // Pre-fill WhatsApp with the user's own phone number so they can send to themselves
    const cleanPhone = savedPhone.replace(/\D/g, "");
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${message}`
      : `https://wa.me/?text=${message}`;
    window.open(url, "_blank");
  };

  // Success screen with Member ID
  if (memberId) {
    return (
      <div className="min-h-screen bg-background px-4 py-6 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-aurora" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-sky/15 rounded-full blur-3xl animate-aurora-slow" />
        </div>
        <div className="relative z-10 w-full max-w-sm space-y-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/20 ring-4 ring-success/30">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <div>
            <h1 className="text-3xl font-heading tracking-[0.18em] bg-gradient-primary bg-clip-text text-transparent">
              WELCOME ABOARD
            </h1>
            <p className="mt-2 text-sm text-muted-foreground font-body">
              {firstName}, your account is ready. Save your Member ID below.
            </p>
          </div>

          <div className="rounded-2xl border border-sky/30 bg-card/60 backdrop-blur-xl p-6 shadow-glow space-y-3">
            <div className="flex items-center justify-center gap-2 text-sky">
              <BadgeCheck className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.2em] font-body">Your Member ID</span>
            </div>
            <div className="text-3xl font-heading tracking-[0.3em] text-foreground font-bold">
              {memberId}
            </div>
            <button
              type="button"
              onClick={copyMemberId}
              className="inline-flex items-center gap-2 text-xs text-sky hover:text-primary font-body uppercase tracking-wider"
            >
              {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy ID"}
            </button>
            <p className="text-[11px] text-muted-foreground font-body pt-2 border-t border-border">
              Login uses your email <span className="text-sky">{savedEmail}</span>.
              Show this ID at the gym for quick check-in.
            </p>
          </div>

          {/* Share to WhatsApp - so user can save credentials on their phone */}
          <div className="space-y-2">
            <Button
              type="button"
              onClick={shareOnWhatsApp}
              size="lg"
              className="w-full bg-success hover:bg-success/90 text-success-foreground font-semibold"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Send to WhatsApp
            </Button>
            <p className="text-[10px] text-muted-foreground font-body inline-flex items-center gap-1.5">
              <Mail className="h-3 w-3" /> Save your Member ID — you'll need it for gym check-in
            </p>
          </div>

          <Button onClick={handleContinue} size="lg" className="w-full bg-gradient-primary text-primary-foreground shadow-glow">
            Continue to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 -right-20 w-96 h-96 bg-ember/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="mx-auto max-w-sm space-y-6 relative z-10">
        <div className="flex items-center gap-3">
          <Link to="/login" className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-heading tracking-wider">CREATE ACCOUNT</h1>
            <p className="text-xs text-muted-foreground font-body">Join Feet & Freakk today</p>
          </div>
        </div>

        {/* User Type Selection */}
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider font-body">Account Type</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setUserType("member")}
              className={cn(
                "rounded-xl border py-3 text-sm font-semibold uppercase tracking-wider font-body transition-all",
                userType === "member"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-secondary text-muted-foreground hover:border-primary/30"
              )}
            >
              🏋️ Member
            </button>
            <button
              type="button"
              onClick={() => setUserType("sub_user")}
              className={cn(
                "rounded-xl border py-3 text-sm font-semibold uppercase tracking-wider font-body transition-all",
                userType === "sub_user"
                  ? "border-ember bg-ember/10 text-ember"
                  : "border-border bg-secondary text-muted-foreground hover:border-ember/30"
              )}
            >
              👁️ Viewer
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground font-body text-center">
            {userType === "member" ? "Full access: exercises, progress tracking, schedule" : "View-only: watch gym videos & browse machines"}
          </p>
        </div>

        {/* Photo Upload */}
        <div className="flex justify-center">
          <label className="group relative cursor-pointer">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-secondary transition-colors group-hover:border-primary">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <Camera className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Camera className="h-3.5 w-3.5" />
            </div>
            <input type="file" accept="image/*" capture="user" className="hidden" onChange={handlePhotoChange} />
          </label>
        </div>
        <p className="text-center text-xs text-muted-foreground font-body">Photo is mandatory *</p>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive font-body">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* First + Last name side-by-side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-body">First Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Rahul" className="pl-9 bg-secondary border-border h-11" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-body">Last Name</Label>
              <Input placeholder="Sharma" className="bg-secondary border-border h-11" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>
          <p className="text-[10px] text-sky/80 font-body -mt-2">
            💡 Member ID = first 4 letters of first name + last 4 digits of phone
          </p>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider font-body">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="+91 XXXXX XXXXX" className="pl-9 bg-secondary border-border h-11" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider font-body">Gender</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["male", "female"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={cn(
                    "rounded-lg border py-2.5 text-sm font-semibold uppercase tracking-wider font-body transition-all",
                    gender === g
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-secondary text-muted-foreground hover:border-primary/30"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider font-body">Fitness Level</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["beginner", "intermediate", "advanced"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setFitnessLevel(lvl)}
                  className={cn(
                    "rounded-lg border py-2.5 text-xs font-semibold uppercase tracking-wider font-body transition-all",
                    fitnessLevel === lvl
                      ? "border-ember bg-ember/10 text-ember"
                      : "border-border bg-secondary text-muted-foreground hover:border-ember/30"
                  )}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground font-body">
              {fitnessLevel === "beginner" && "🌱 New to gym — light weights & basics"}
              {fitnessLevel === "intermediate" && "💪 6+ months experience — moderate intensity"}
              {fitnessLevel === "advanced" && "🔥 1+ year — heavy weights & complex moves"}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-body">Age</Label>
              <Input placeholder="25" type="number" className="bg-secondary border-border h-11 text-center" value={age} onChange={(e) => setAge(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-body">Height</Label>
              <Input placeholder={'5\'10"'} className="bg-secondary border-border h-11 text-center" value={height} onChange={(e) => setHeight(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-body">Weight</Label>
              <Input placeholder="75" type="number" className="bg-secondary border-border h-11 text-center" value={weight} onChange={(e) => setWeight(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider font-body">Email</Label>
            <Input type="email" placeholder="your@email.com" className="bg-secondary border-border h-11" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider font-body">Password</Label>
            <Input type="password" placeholder="Create a password (min 6 chars)" className="bg-secondary border-border h-11" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>

          <Button type="submit" variant="ember" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground font-body">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
