import { Trophy, Flame, Target } from "lucide-react";

interface MemberHeroCardProps {
  name: string;
  age?: number | null;
  weight?: number | null;
  height?: string | null;
  photoUrl?: string | null;
  streak: number;
  weeklyTarget: number;
  weeklyDone: number;
}

export function MemberHeroCard({ name, age, weight, height, photoUrl, streak, weeklyTarget, weeklyDone }: MemberHeroCardProps) {
  const initial = name?.charAt(0).toUpperCase() || "M";
  const progress = weeklyTarget > 0 ? Math.min(100, (weeklyDone / weeklyTarget) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-sky/30 bg-gradient-to-br from-card via-primary/5 to-sky/10 p-5 shadow-glow">
      {/* Decorative orbs */}
      <div className="absolute -top-20 -right-12 h-56 w-56 rounded-full bg-primary/25 blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-sky/20 blur-3xl pointer-events-none animate-aurora-slow" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_oklch(0.7_0.18_240_/_0.15),_transparent_60%)] pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-4">
          {/* Avatar with ring */}
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-primary opacity-75 blur-sm animate-pulse-glow" />
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl ring-2 ring-sky/50 bg-gradient-primary">
              {photoUrl ? (
                <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-heading text-primary-foreground">
                  {initial}
                </div>
              )}
            </div>
            {streak > 0 && (
              <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 rounded-full bg-gradient-to-r from-warning to-ember px-2 py-0.5 ring-2 ring-card shadow-glow">
                <Flame className="h-3 w-3 text-warning-foreground fill-warning-foreground" />
                <span className="text-[10px] font-heading text-warning-foreground">{streak}</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-sky font-body font-bold">Welcome back</p>
            <h2 className="font-heading text-3xl tracking-wider text-foreground leading-tight truncate">
              {name?.toUpperCase() || "MEMBER"}
            </h2>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground font-body">
              {age && <><span className="font-semibold text-foreground">{age}y</span><span className="text-border">•</span></>}
              {height && <><span>{height}</span><span className="text-border">•</span></>}
              {weight && <span>{weight}kg</span>}
            </div>
          </div>
        </div>

        {/* Weekly progress */}
        <div className="mt-5 rounded-2xl bg-card/60 backdrop-blur-sm ring-1 ring-border p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] uppercase tracking-widest font-body font-bold text-foreground">Weekly Goal</span>
            </div>
            <span className="text-xs font-heading text-primary">
              {weeklyDone}<span className="text-muted-foreground">/{weeklyTarget}</span>
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary/60">
            <div
              className="h-full rounded-full bg-gradient-primary transition-all duration-700 shadow-glow"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">
              {progress >= 100 ? "🔥 Crushed it!" : progress >= 50 ? "Keep going!" : "Let's start!"}
            </span>
            {streak > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-ember font-body font-bold">
                <Trophy className="h-3 w-3" /> {streak} DAY STREAK
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
