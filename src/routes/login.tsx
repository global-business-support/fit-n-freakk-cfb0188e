import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, BadgeCheck, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useBranding } from "@/hooks/use-branding";
import { supabase } from "@/integrations/supabase/client";
import loginBg from "@/assets/login-bg.jpg";
import { resolveMemberLoginEmail } from "@/lib/member-auth.functions";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Member Login — Feet & Freakk" },
      { name: "description", content: "Sign in with your Member ID" },
    ],
  }),
  component: LoginPage,
});

// Curated public workout/gym YouTube videos for the animated background grid
const BG_VIDEOS = [
  "PHpRgCu0SBg", // intense workout
  "UBMk30rjy0o", // push ups
  "U0bhE67HuDY", // deadlift
  "rT7DgCr-3pg", // squat
  "ykJmrZ5v0Oo", // bench
  "2pLT-olgUJs", // pull ups
];

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [memberId, setMemberId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [exerciseThumbs, setExerciseThumbs] = useState<string[]>([]);
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { appName, logoUrl } = useBranding();
  const memberIdInputRef = useRef<HTMLInputElement>(null);

  // Pull a few exercise videos from DB to use as animated previews
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("exercises")
        .select("video_url, thumbnail_url")
        .not("video_url", "is", null)
        .limit(8);
      if (data) {
        const thumbs = data
          .map((e: any) => {
            if (e.thumbnail_url) return e.thumbnail_url;
            const url: string = e.video_url || "";
            const m = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/);
            return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
          })
          .filter(Boolean) as string[];
        setExerciseThumbs(thumbs);
      }
    })();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const cleaned = memberId.trim();
    if (!cleaned) {
      setError("Please enter your Member ID");
      setIsLoading(false);
      return;
    }

    try {
      let emailToUse: string | null = null;
      if (cleaned.includes("@")) {
        emailToUse = cleaned;
      } else {
        const resolved = await resolveMemberLoginEmail({ data: { identifier: cleaned } });
        if (!resolved.email) {
          setError("Member ID not found. Please check and try again.");
          setIsLoading(false);
          return;
        }
        emailToUse = resolved.email;
      }

      const { error: signErr } = await signIn(emailToUse, password);
      if (signErr) {
        setError("Wrong password. Please try again.");
        setIsLoading(false);
      } else {
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      setError(err?.message || "Login failed. Please try again.");
      setIsLoading(false);
    }
  };

  // Build the visual tile sources: prefer real exercise thumbs, fall back to YouTube preview thumbs of curated IDs
  const tiles =
    exerciseThumbs.length >= 6
      ? exerciseThumbs.slice(0, 8)
      : [
          ...exerciseThumbs,
          ...BG_VIDEOS.map((id) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`),
        ].slice(0, 8);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Cinematic background image */}
      <div className="fixed inset-0 z-0">
        <img
          src={loginBg}
          alt="Athletic woman training in dark gym"
          className="absolute inset-0 h-full w-full object-cover scale-110 animate-ken-burns"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.08 0.04 250 / 0.7) 0%, oklch(0.1 0.05 250 / 0.85) 50%, oklch(0.06 0.03 250 / 0.95) 100%)",
          }}
        />
        <div className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-primary/30 blur-[140px] animate-aurora" />
        <div className="absolute bottom-0 -right-20 h-96 w-96 rounded-full bg-sky/20 blur-[140px] animate-aurora-slow" />
      </div>

      {/* Top-right login button (quick focus) */}
      <div className="fixed top-4 right-4 z-30">
        <Button
          type="button"
          size="sm"
          onClick={() => memberIdInputRef.current?.focus()}
          className="bg-gradient-primary text-white font-heading tracking-wider shadow-glow hover:opacity-90"
        >
          <Lock className="h-4 w-4 mr-2" /> LOGIN
        </Button>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 grid gap-10 lg:grid-cols-[1.1fr_minmax(320px,400px)] items-start">
        {/* Animated workout video tiles wall */}
        <div className="hidden lg:block">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.3em] text-sky-300/80 font-body">Live training feed</p>
            <h2 className="mt-1 text-3xl font-heading tracking-wider text-white">
              FUEL YOUR <span className="text-primary">FIRE</span>
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-3 [perspective:1200px]">
            {tiles.map((src, i) => (
              <div
                key={i}
                className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-sky-300/20 shadow-glow animate-tile-float"
                style={{
                  animationDelay: `${i * 0.4}s`,
                  transform: `rotateY(${i % 2 ? -6 : 6}deg) rotateX(${i % 3 ? 4 : -4}deg)`,
                }}
              >
                <img
                  src={src}
                  alt="Workout preview"
                  className="absolute inset-0 h-full w-full object-cover scale-110 animate-tile-pan"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[9px] font-heading tracking-widest text-white">LIVE</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Login form */}
        <div className="w-full max-w-sm mx-auto lg:mx-0 space-y-6">
          <div className="text-center lg:text-left">
            <div className="mx-auto lg:mx-0 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-primary shadow-glow ring-1 ring-sky/30 overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt={appName} className="h-full w-full object-cover" />
              ) : (
                <Dumbbell className="h-8 w-8 text-primary-foreground" />
              )}
            </div>
            <h1 className="mt-4 text-3xl font-heading tracking-[0.18em] text-white drop-shadow-[0_2px_24px_rgba(125,211,252,0.7)]">
              {appName.toUpperCase()}
            </h1>
            <p className="mt-1 text-sm text-sky-200/90 font-body tracking-wider">
              Train hard. Track smarter.
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-destructive/20 border border-destructive/40 backdrop-blur-md px-4 py-3 text-sm text-white font-body">
              {error}
            </div>
          )}

          <div className="shine-border rounded-2xl">
            <div className="shine-border-inner" />
            <form
              onSubmit={handleLogin}
              className="relative space-y-4 rounded-2xl p-6 overflow-hidden bg-card/60 backdrop-blur-xl"
            >
              <div className="animate-shimmer-sweep" />

              <div className="space-y-2">
                <Label htmlFor="memberId" className="text-xs uppercase tracking-wider font-body text-sky-200">
                  Member ID
                </Label>
                <div className="relative">
                  <BadgeCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-300/80" />
                  <Input
                    id="memberId"
                    ref={memberIdInputRef}
                    type="text"
                    placeholder="e.g. NAME1234"
                    className="pl-9 bg-white/5 border-sky-300/20 text-white placeholder:text-sky-200/40 h-11 uppercase tracking-wider font-body"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
                <p className="text-[10px] text-sky-200/60 font-body">
                  Admin? Use your email address instead.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs uppercase tracking-wider font-body text-sky-200">
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] text-sky-300 hover:text-white font-body uppercase tracking-wider hover:underline"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-300/80" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-9 pr-10 bg-white/5 border-sky-300/20 text-white placeholder:text-sky-200/40 h-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-300/70 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-primary text-white font-semibold tracking-wider shadow-glow hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "SIGN IN"}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-sky-200/80 font-body">
            New here?{" "}
            <Link to="/register" className="text-white hover:text-sky-300 underline-offset-4 hover:underline font-semibold">
              Register as Member
            </Link>
          </p>

          <p className="text-center text-xs text-sky-200/60 font-body">
            <Link to="/explore" className="hover:text-white underline-offset-4 hover:underline">
              ← Back to public exercise library
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
