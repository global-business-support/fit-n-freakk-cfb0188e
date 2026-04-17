import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LiveBackground } from "@/components/LiveBackground";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — Feet & Freakk" },
      { name: "description", content: "Set a new secure password" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase auto-handles the recovery token from URL hash
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setValidSession(true);
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValidSession(true);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters for safety.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsLoading(false);
    if (error) {
      setError(error.message);
    } else {
      await supabase.auth.signOut();
      navigate({ to: "/login" });
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 overflow-hidden">
      <LiveBackground />

      <div className="w-full max-w-sm space-y-6 relative z-10">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
            <ShieldCheck className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="mt-4 text-3xl font-heading tracking-[0.18em] bg-gradient-primary bg-clip-text text-transparent">
            NEW PASSWORD
          </h1>
          <p className="mt-1 text-sm text-muted-foreground font-body">
            Choose a strong password to keep your account safe
          </p>
        </div>

        {!validSession ? (
          <div className="rounded-xl bg-warning/10 border border-warning/30 p-4 text-sm text-warning-foreground text-center font-body">
            Verifying reset link... If this takes too long, request a new link.
          </div>
        ) : (
          <>
            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive font-body">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-2xl border border-sky/20 bg-card/60 backdrop-blur-xl p-6 shadow-card"
            >
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider font-body text-sky">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky/70" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    className="pl-9 pr-10 bg-secondary/60 border-border h-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
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

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider font-body text-sky">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky/70" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    className="pl-9 bg-secondary/60 border-border h-11"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-primary text-primary-foreground shadow-glow"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
