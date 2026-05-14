import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LiveBackground } from "@/components/LiveBackground";
import { InlineVideoPlayer } from "@/components/InlineVideoPlayer";
import { TiltCard } from "@/components/TiltCard";
import { useBranding } from "@/hooks/use-branding";
import { Dumbbell, Lock, LogIn, Eye, Sparkles, Cog, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  gif_url?: string | null;
  description: string | null;
  sets: number | null;
  reps: string | null;
}

function ExplorePage() {
  const { appName, logoUrl } = useBranding();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [nameFilter, setNameFilter] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [namesOpen, setNamesOpen] = useState(false);
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

  // Dedupe by name (normalize spaces/punct, case-insensitive). Prefer entries with media.
  const normalizeName = (n: string) =>
    (n || "")
      .toLowerCase()
      .replace(/[\s\-_]+/g, " ")
      .replace(/[^a-z0-9 ]/g, "")
      .trim();
  const dedupeByName = (list: Exercise[]) => {
    const map = new Map<string, Exercise>();
    for (const ex of list) {
      const key = normalizeName(ex.name);
      if (!key) continue;
      const existing = map.get(key);
      const hasMedia = !!ex.video_url || !!ex.gif_url;
      const existingHasMedia = existing && (!!existing.video_url || !!existing.gif_url);
      if (!existing || (hasMedia && !existingHasMedia)) map.set(key, ex);
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  };

  const uniqueExercises = dedupeByName(exercises);
  const playable = uniqueExercises.filter((e) => !!e.video_url || !!e.gif_url);
  const pool = showAll ? uniqueExercises : playable;
  const bodyParts = Array.from(new Set(pool.map((e) => e.body_part))).sort();
  let visible = filter === "all" ? pool : pool.filter((e) => e.body_part === filter);
  if (nameFilter) visible = visible.filter((e) => e.name.toLowerCase() === nameFilter.toLowerCase());
  const featured = playable.filter((e) => !!e.gif_url).concat(playable.filter((e) => !e.gif_url)).slice(0, 3);
  const allNames = Array.from(new Set(uniqueExercises.map((e) => e.name).filter(Boolean))).sort((a, b) => a.localeCompare(b));

  return (
    <div className="relative min-h-screen pb-24">
      <LiveBackground />

      {/* Top bar — small login icon top-right */}
      <header className="sticky top-0 z-30 border-b border-sky/20 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow overflow-hidden">
              {logoUrl ? <img src={logoUrl} alt={appName} className="h-full w-full object-cover" /> : <Dumbbell className="h-5 w-5 text-primary-foreground" />}
            </div>
            <span className="font-heading text-xl tracking-[0.18em] text-white">{appName.toUpperCase()}</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link to="/login" aria-label="Sign in">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-white shadow-glow ring-1 ring-white/10 hover:scale-105 transition-transform"
              >
                <LogIn className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pt-6 space-y-8">
        {/* Hero */}
        <section className="text-center space-y-3">
          <p className="inline-block rounded-full border border-sky/40 bg-sky/10 px-3 py-1 text-[10px] uppercase tracking-[0.25em] font-body text-sky-200">
            Full library · No login needed
          </p>
          <h1 className="font-heading text-4xl md:text-6xl tracking-[0.12em] text-white drop-shadow-[0_2px_24px_rgba(125,211,252,0.6)]">
            TRAIN HARDER. <span className="text-sky">SMARTER.</span>
          </h1>
          <p className="mx-auto max-w-xl text-sm md:text-base font-body text-sky-100/80">
            Browse workouts, generate an AI plan and explore gym machines — all without signing in.
          </p>
          {/* Quick-access tiles */}
          <div className="grid grid-cols-3 gap-2 max-w-md mx-auto pt-4">
            <Link to="/workouts" className="flex flex-col items-center gap-1.5 rounded-2xl border border-sky/30 bg-card/60 backdrop-blur-md p-3 hover:border-sky/60 transition">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                <Dumbbell className="h-5 w-5 text-white" />
              </div>
              <span className="text-[10px] font-body uppercase tracking-wider text-white">Workouts</span>
            </Link>
            <Link to="/ai-coach" className="flex flex-col items-center gap-1.5 rounded-2xl border border-sky/30 bg-card/60 backdrop-blur-md p-3 hover:border-sky/60 transition">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-[10px] font-body uppercase tracking-wider text-white">AI Coach</span>
            </Link>
            <Link to="/machines" className="flex flex-col items-center gap-1.5 rounded-2xl border border-sky/30 bg-card/60 backdrop-blur-md p-3 hover:border-sky/60 transition">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                <Cog className="h-5 w-5 text-white" />
              </div>
              <span className="text-[10px] font-body uppercase tracking-wider text-white">Machines</span>
            </Link>
          </div>
        </section>

        {/* Featured auto-running videos */}
        {featured.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-heading text-2xl tracking-wider text-sky">FEATURED MOVES</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {featured.map((ex) => (
                <TiltCard key={ex.id}>
                  <div className="rounded-2xl border border-sky/30 bg-gradient-card overflow-hidden shadow-card">
                    <AutoExerciseMedia exercise={ex} />
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
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-heading text-2xl tracking-wider text-sky">EXERCISE LIBRARY</h2>
              <span className="rounded-full bg-sky/15 border border-sky/30 px-2 py-0.5 text-[10px] uppercase tracking-wider font-body text-sky-100">
                {visible.length} {showAll ? "total" : "with video"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={namesOpen} onOpenChange={setNamesOpen}>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-full border border-sky/40 bg-card/60 px-3 py-1 text-[10px] uppercase tracking-wider font-body text-sky-100 hover:border-sky/70 transition"
                  >
                    <List className="h-3.5 w-3.5" /> Names ({allNames.length})
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>All Exercises</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => { setNameFilter(null); setNamesOpen(false); }}
                      className={`rounded-full px-3 py-1 text-xs font-body border transition ${!nameFilter ? "bg-gradient-primary text-white border-transparent" : "border-sky/30 text-sky-200/80 hover:border-sky/60"}`}
                    >
                      Show all
                    </button>
                    {allNames.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => { setNameFilter(n); setFilter("all"); setNamesOpen(false); }}
                        className={`rounded-full px-3 py-1 text-xs font-body border transition ${nameFilter === n ? "bg-gradient-primary text-white border-transparent" : "border-sky/30 text-sky-200/80 hover:border-sky/60"}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              <button
                type="button"
                onClick={() => setShowAll((s) => !s)}
                className="rounded-full border border-sky/40 bg-card/60 px-3 py-1 text-[10px] uppercase tracking-wider font-body text-sky-100 hover:border-sky/70 transition"
              >
                {showAll ? "Show videos only" : "Show all exercises"}
              </button>
            </div>
          </div>
          {nameFilter && (
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/20 border border-primary/40 px-3 py-1 text-[11px] font-body text-white">
                Filter: {nameFilter}
              </span>
              <button
                type="button"
                onClick={() => setNameFilter(null)}
                className="text-[11px] font-body text-sky-200/80 hover:text-white underline"
              >
                Clear
              </button>
            </div>
          )}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>All</FilterPill>
            {bodyParts.map((bp) => (
              <FilterPill key={bp} active={filter === bp} onClick={() => setFilter(bp)}>{bp}</FilterPill>
            ))}
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
                      {ex.gif_url ? (
                        <AutoExerciseMedia exercise={ex} />
                      ) : ex.video_url ? (
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
      <BottomNav />
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

function AutoExerciseMedia({ exercise }: { exercise: Exercise }) {
  const mediaUrl = exercise.gif_url;
  if (mediaUrl) {
    const isVideo = /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(mediaUrl);
    return isVideo ? (
      <video
        src={mediaUrl}
        className="aspect-video w-full rounded-xl border border-sky/30 bg-black object-cover"
        autoPlay
        muted
        loop
        playsInline
        controls={false}
        preload="metadata"
      />
    ) : (
      <img
        src={mediaUrl}
        alt={`${exercise.name} animation`}
        className="aspect-video w-full rounded-xl border border-sky/30 bg-black object-cover"
        loading="lazy"
      />
    );
  }
  return exercise.video_url ? <InlineVideoPlayer url={exercise.video_url} title={exercise.name} thumbnailUrl={exercise.thumbnail_url} /> : null;
}
