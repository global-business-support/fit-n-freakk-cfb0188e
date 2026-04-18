import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, BadgeCheck, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useBranding } from "@/hooks/use-branding";
import { supabase } from "@/integrations/supabase/client";
import loginBg from "@/assets/login-bg.jpg";
import { LoginMascot } from "@/components/LoginMascot";
import { useRef } from "react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Member Login — Feet & Freakk" },
      { name: "description", content: "Sign in with your Member ID" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [memberId, setMemberId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { appName, logoUrl } = useBranding();

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

      // If user typed an email (admin), use it directly
      if (cleaned.includes("@")) {
        emailToUse = cleaned;
      } else {
        // Otherwise treat as Member ID and look up the email
        const { data, error: rpcErr } = await supabase.rpc("get_email_by_member_id", {
          _member_id: cleaned,
        });
        if (rpcErr || !data) {
          setError("Member ID not found. Please check and try again.");
          setIsLoading(false);
          return;
        }
        emailToUse = data as string;
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

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 overflow-hidden">
      {/* Cinematic gym background */}
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
              "linear-gradient(180deg, oklch(0.08 0.04 250 / 0.55) 0%, oklch(0.1 0.05 250 / 0.75) 50%, oklch(0.06 0.03 250 / 0.95) 100%)",
          }}
        />
        <div className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-primary/30 blur-[140px] animate-aurora" />
        <div className="absolute bottom-0 -right-20 h-96 w-96 rounded-full bg-sky/20 blur-[140px] animate-aurora-slow" />
      </div>

      <div className="w-full max-w-sm space-y-8 relative z-10">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-primary shadow-glow ring-1 ring-sky/30 overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt={appName} className="h-full w-full object-cover" />
            ) : (
              <Dumbbell className="h-10 w-10 text-primary-foreground" />
            )}
          </div>
          <h1 className="mt-5 text-4xl font-heading tracking-[0.18em] text-white drop-shadow-[0_2px_24px_rgba(125,211,252,0.7)]">
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

        {/* Shining border wrapper */}
        <div className="shine-border rounded-2xl">
          <div className="shine-border-inner" />
          <form
            onSubmit={handleLogin}
            className="relative space-y-4 rounded-2xl p-6 overflow-hidden"
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
      </div>
    </div>
  );
}
