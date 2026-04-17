import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ChevronLeft, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LiveBackground } from "@/components/LiveBackground";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — Feet & Freakk" },
      { name: "description", content: "Reset your gym account password securely" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 overflow-hidden">
      <LiveBackground />

      <div className="w-full max-w-sm space-y-6 relative z-10">
        <Link to="/login" className="inline-flex items-center gap-1 text-sm text-sky hover:underline font-body">
          <ChevronLeft className="h-4 w-4" /> Back to login
        </Link>

        <div className="text-center">
          <h1 className="text-3xl font-heading tracking-[0.18em] bg-gradient-primary bg-clip-text text-transparent">
            FORGOT PASSWORD
          </h1>
          <p className="mt-2 text-sm text-muted-foreground font-body">
            Enter your email and we'll send a secure reset link
          </p>
        </div>

        {sent ? (
          <div className="rounded-2xl border border-success/30 bg-success/10 p-6 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
            <h2 className="text-lg font-heading tracking-wider text-success">EMAIL SENT</h2>
            <p className="text-sm text-foreground font-body">
              Check <span className="font-semibold">{email}</span> for a password reset link. The link expires in 1 hour for your safety.
            </p>
            <Link to="/login">
              <Button variant="outline" className="mt-2">Return to Login</Button>
            </Link>
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
                <Label htmlFor="email" className="text-xs uppercase tracking-wider font-body text-sky">
                  Registered Email
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

              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
              </Button>

              <p className="text-[11px] text-center text-muted-foreground font-body leading-relaxed">
                🔒 Your data is safe. We never share emails. Reset links expire in 1 hour.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
