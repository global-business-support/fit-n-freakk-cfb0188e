import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useBranding } from "@/hooks/use-branding";
import loginBg from "@/assets/login-bg.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Feet & Freakk" },
      { name: "description", content: "Sign in to your gym account" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
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
    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
      setIsLoading(false);
    } else {
      navigate({ to: "/dashboard" });
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 overflow-hidden">
      {/* Gym girl screensaver background */}
      <div className="fixed inset-0 z-0">
        <img
          src={loginBg}
          alt="Athletic woman training in dark gym"
          className="absolute inset-0 h-full w-full object-cover scale-110 animate-ken-burns"
        />
        {/* Cinematic dark blue gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.08 0.04 250 / 0.55) 0%, oklch(0.1 0.05 250 / 0.75) 50%, oklch(0.06 0.03 250 / 0.95) 100%)",
          }}
        />
        {/* Animated glow accents */}
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
          <h1 className="mt-5 text-4xl font-heading tracking-[0.18em] bg-gradient-primary bg-clip-text text-transparent drop-shadow-[0_2px_20px_rgba(120,180,255,0.5)]">
            {appName.toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-sky/90 font-body tracking-wider">
            Train hard. Track smarter.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-destructive/20 border border-destructive/40 backdrop-blur-md px-4 py-3 text-sm text-destructive-foreground font-body">
            {error}
          </div>
        )}

        <form
          onSubmit={handleLogin}
          className="space-y-4 rounded-2xl border border-sky/30 bg-card/40 backdrop-blur-2xl p-6 shadow-card"
        >
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs uppercase tracking-wider font-body text-sky">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky/70" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="pl-9 bg-secondary/60 border-border h-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs uppercase tracking-wider font-body text-sky">
                Password
              </Label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-sky hover:text-primary font-body uppercase tracking-wider hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky/70" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-9 pr-10 bg-secondary/60 border-border h-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-sky"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground font-body">
          Don't have an account?{" "}
          <Link to="/register" className="text-sky hover:underline font-semibold">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
