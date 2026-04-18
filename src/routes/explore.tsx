import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LiveBackground } from "@/components/LiveBackground";
import { InlineVideoPlayer } from "@/components/InlineVideoPlayer";
import { TiltCard } from "@/components/TiltCard";
import { useBranding } from "@/hooks/use-branding";
import { Dumbbell, Lock, LogIn, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore Workouts — Feet & Freakk" },
      { name: "description", content: "Browse exercise videos and previews — login to unlock full plans." },
    ],
  }),
  component: ExplorePage,
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

function ExplorePage() {
  const { appName, logoUrl } = useBranding();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("exercises")
      .select("*")
      .order("body_part")
      .then(({ data }) => {
        setExercises((data ?? []) as Exercise[]);
        setLoading(false);
      });
  }, []);

  const bodyParts = Array.from(new Set(exercises.map((e) => e.body_part))).sort();
  const visible = filter === "all" ? exercises : exercises.filter((e) => e.body_part === filter);
  const featured = exercises.filter((e) => e.video_url).slice(0, 3);

  return (
    <div className="relative min-h-screen pb-16">
      <LiveBackground />

      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-sky/20 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow overflow-hidden">
              {logoUrl ? <img src={logoUrl} alt={appName} className="h-full w-full object-cover" /> : <Dumbbell className="h-5 w-5 text-primary-foreground" />}
            </div>
            <span className="font-heading text-xl tracking-[0.18em] text-white">{appName.toUpperCase()}</span>
          </Link>
          <Link to="/login">
            <Button size="sm" className="bg-gradient-primary text-white shadow-glow">
              <LogIn className="h-4 w-4 mr-1.5" /> Sign In
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pt-6 space-y-8">
        {/* Hero */}
        <section className="text-center space-y-3">
          <p className="inline-block rounded-full border border-sky/40 bg-sky/10 px-3 py-1 text-[10px] uppercase tracking-[0.25em] font-body text-sky-200">
            Free preview · No login needed
          </p>
          <h1 className="font-heading text-4xl md:text-6xl tracking-[0.12em] text-white drop-shadow-[0_2px_24px_rgba(125,211,252,0.6)]">
            TRAIN HARDER. <span className="text-sky">SMARTER.</span>
          </h1>
          <p className="mx-auto max-w-xl text-sm md:text-base font-body text-sky-100/80">
            Watch our exercise library, then sign in to unlock your personal plan, sets, reps & AI coach.
          </p>
        </section>

        {/* Featured auto-running videos */}
        {featured.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-heading text-2xl tracking-wider text-sky">FEATURED MOVES</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {featured.map((ex) => (
                <TiltCard key={ex.id}>
                  <div className="rounded-2xl border border-sky/30 bg-gradient-card overflow-hidden shadow-card">
                    <InlineVideoPlayer url={ex.video_url!} title={ex.name} thumbnailUrl={ex.thumbnail_url} />
                    <div className="p-3">
                      <p className="font-heading text-lg tracking-wider text-white">{ex.name.toUpperCase()}</p>
                      <p className="text-xs font-body text-sky-200/70 uppercase tracking-wider">{ex.body_part}</p>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </div>
          </section>
        )}

        {/* Filters */}
        <section className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-heading text-2xl tracking-wider text-sky">EXERCISE LIBRARY</h2>
            <div className="flex gap-1.5 overflow-x-auto">
              <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>All</FilterPill>
              {bodyParts.map((bp) => (
                <FilterPill key={bp} active={filter === bp} onClick={() => setFilter(bp)}>{bp}</FilterPill>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sky-200/70 font-body">Loading exercises…</div>
          ) : visible.length === 0 ? (
            <div className="py-12 text-center text-sky-200/70 font-body">No exercises yet.</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((ex) => (
                <TiltCard key={ex.id}>
                  <Link to="/exercise/$id" params={{ id: ex.id }} className="block">
                    <div className="rounded-2xl border border-sky/30 bg-gradient-card p-3 space-y-3 shadow-card hover:border-sky/60 transition">
                      {ex.video_url ? (
                        <InlineVideoPlayer url={ex.video_url} title={ex.name} thumbnailUrl={ex.thumbnail_url} />
                      ) : (
                        <div className="aspect-video rounded-xl bg-secondary/60 flex items-center justify-center">
                          <Dumbbell className="h-10 w-10 text-sky/50" />
                        </div>
                      )}
                      <div>
                        <p className="font-heading text-lg tracking-wider text-white">{ex.name.toUpperCase()}</p>
                        <p className="text-[10px] font-body text-sky-200/70 uppercase tracking-[0.2em]">{ex.body_part}</p>
                      </div>
                      {/* Locked details teaser */}
                      <div className="flex items-center gap-2 rounded-lg border border-sky/20 bg-background/40 px-2.5 py-1.5">
                        <Lock className="h-3.5 w-3.5 text-sky" />
                        <span className="text-[10px] font-body text-sky-200/80 uppercase tracking-wider">
                          Sets, reps & coaching — login to unlock
                        </span>
                      </div>
                    </div>
                  </Link>
                </TiltCard>
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="rounded-3xl border border-sky/40 bg-gradient-card p-6 md:p-10 text-center space-y-3 shadow-glow">
          <Eye className="mx-auto h-8 w-8 text-sky" />
          <h3 className="font-heading text-3xl tracking-wider text-white">UNLOCK FULL EXPERIENCE</h3>
          <p className="text-sm font-body text-sky-100/80 max-w-md mx-auto">
            Get your personal AI fitness plan, attendance tracking, monthly progress & every exercise's full breakdown.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Link to="/login">
              <Button size="lg" className="bg-gradient-primary text-white shadow-glow">
                <LogIn className="h-4 w-4 mr-1.5" /> Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="border-sky/50 text-white">
                Register as Member
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1 text-[11px] uppercase tracking-wider font-body border transition ${
        active
          ? "bg-gradient-primary text-white border-transparent shadow-glow"
          : "border-sky/30 text-sky-200/80 hover:border-sky/60 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
