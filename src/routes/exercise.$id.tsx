import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { LiveBackground } from "@/components/LiveBackground";
import { InlineVideoPlayer } from "@/components/InlineVideoPlayer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Dumbbell, Lock, Repeat, Layers, Activity, LogIn } from "lucide-react";

export const Route = createFileRoute("/exercise/$id")({
  head: () => ({
    meta: [
      { title: "Exercise — Feet & Freakk" },
      { name: "description", content: "Exercise details with video and instructions." },
    ],
  }),
  component: ExerciseDetailPage,
});

interface Exercise {
  id: string;
  name: string;
  body_part: string;
  video_url: string | null;
  thumbnail_url: string | null;
  description: string | null;
  sets: number | null;
  reps: string | null;
}

function ExerciseDetailPage() {
  const { id } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [ex, setEx] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("exercises").select("*").eq("id", id).single().then(({ data }) => {
      setEx(data as Exercise | null);
      setLoading(false);
    });
  }, [id]);

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!ex) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-center px-4">
        <p className="font-heading text-2xl text-white">Exercise not found</p>
        <Link to="/explore"><Button variant="outline">Back to library</Button></Link>
      </div>
    );
  }

  const isLoggedIn = !!user;

  return (
    <div className="relative min-h-screen pb-16">
      <LiveBackground />

      <header className="sticky top-0 z-30 border-b border-sky/20 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <button
            onClick={() => (isLoggedIn ? navigate({ to: "/dashboard" }) : navigate({ to: "/explore" }))}
            className="flex items-center gap-1.5 text-sky-200 hover:text-white font-body text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          {!isLoggedIn && (
            <Link to="/login">
              <Button size="sm" className="bg-gradient-primary text-white shadow-glow">
                <LogIn className="h-4 w-4 mr-1.5" /> Sign In
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-4 pt-6 space-y-6">
        {/* 3D rotating hero card */}
        <div className="[perspective:1400px]">
          <div className="rounded-3xl border border-sky/40 bg-gradient-card overflow-hidden shadow-glow animate-detail-rotate">
            {ex.video_url ? (
              <InlineVideoPlayer url={ex.video_url} title={ex.name} thumbnailUrl={ex.thumbnail_url} />
            ) : (
              <div className="aspect-video flex items-center justify-center bg-secondary/60">
                <Dumbbell className="h-16 w-16 text-sky/50" />
              </div>
            )}
            <div className="p-5 space-y-1">
              <p className="text-[10px] font-body text-sky-200/70 uppercase tracking-[0.25em]">{ex.body_part}</p>
              <h1 className="font-heading text-3xl md:text-4xl tracking-[0.12em] text-white">{ex.name.toUpperCase()}</h1>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatBlock icon={Layers} label="Sets" value={isLoggedIn ? (ex.sets ? String(ex.sets) : "—") : "•••"} locked={!isLoggedIn} />
          <StatBlock icon={Repeat} label="Reps" value={isLoggedIn ? (ex.reps || "—") : "•••"} locked={!isLoggedIn} />
          <StatBlock icon={Activity} label="Body" value={ex.body_part} />
        </div>

        {/* Description */}
        <div className="rounded-2xl border border-sky/30 bg-gradient-card p-5 shadow-card space-y-2">
          <h2 className="font-heading text-xl tracking-wider text-sky">HOW TO PERFORM</h2>
          {isLoggedIn ? (
            <p className="text-sm font-body text-sky-100/85 whitespace-pre-line leading-relaxed">
              {ex.description || "No description provided yet."}
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-body text-sky-100/60 line-clamp-2 blur-[2px] select-none">
                {ex.description || "Step-by-step instructions, breathing pattern, common mistakes and pro tips are available for members."}
              </p>
              <div className="flex items-center gap-2 rounded-xl border border-sky/40 bg-background/40 p-3">
                <Lock className="h-4 w-4 text-sky shrink-0" />
                <span className="text-xs font-body text-sky-100/85 flex-1">
                  Full instructions, sets, reps and personal coaching unlock after login.
                </span>
                <Link to="/login">
                  <Button size="sm" className="bg-gradient-primary text-white">Unlock</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatBlock({
  icon: Icon,
  label,
  value,
  locked = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  locked?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-sky/30 bg-gradient-card p-3 text-center shadow-card relative overflow-hidden">
      {locked && <Lock className="absolute top-1.5 right-1.5 h-3 w-3 text-sky/70" />}
      <Icon className="mx-auto h-5 w-5 text-sky" />
      <p className="mt-1 font-heading text-xl tracking-wider text-white">{value}</p>
      <p className="text-[10px] font-body uppercase tracking-wider text-sky-200/70">{label}</p>
    </div>
  );
}
