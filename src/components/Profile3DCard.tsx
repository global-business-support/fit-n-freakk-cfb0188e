import { useRef, useState } from "react";
import { Flame, Trophy, Target, BadgeCheck, Sparkles } from "lucide-react";

interface Profile3DCardProps {
  name: string;
  memberId?: string | null;
  age?: number | null;
  weight?: number | null;
  height?: string | null;
  gender?: string | null;
  photoUrl?: string | null;
  streak: number;
  weeklyTarget: number;
  weeklyDone: number;
}

/**
 * Floating glassmorphism 3D profile card with mouse-tilt parallax.
 * Layered depth: glass surface, backlight glow, holographic shimmer, floating data chips.
 */
export function Profile3DCard({
  name,
  memberId,
  age,
  weight,
  height,
  gender,
  photoUrl,
  streak,
  weeklyTarget,
  weeklyDone,
}: Profile3DCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const initial = name?.charAt(0).toUpperCase() || "M";
  const progress = weeklyTarget > 0 ? Math.min(100, (weeklyDone / weeklyTarget) * 100) : 0;

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    setTilt({ x: x * 10, y: -y * 10 });
  };

  const reset = () => {
    setHovering(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      className="relative"
      style={{ perspective: "1400px" }}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={reset}
    >
      {/* Backlight aura */}
      <div
        className="absolute -inset-6 rounded-[2rem] opacity-70 blur-2xl pointer-events-none transition-all duration-300"
        style={{
          background:
            "radial-gradient(ellipse at center, oklch(0.7 0.18 240 / 0.5), oklch(0.82 0.13 220 / 0.3) 40%, transparent 70%)",
          transform: `translate(${tilt.x * 0.6}px, ${-tilt.y * 0.6}px)`,
        }}
      />

      {/* Running shine border halo */}
      <div className="shine-border absolute -inset-[2px] rounded-[1.85rem] pointer-events-none" aria-hidden>
        <div className="shine-border-inner" />
      </div>

      <div
        ref={ref}
        className={`relative rounded-[1.75rem] overflow-hidden transition-transform duration-200 ease-out will-change-transform ${
          hovering ? "" : "animate-card-rotate"
        }`}
        style={{
          transform: hovering ? `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)` : undefined,
          transformStyle: "preserve-3d",
          background:
            "linear-gradient(135deg, oklch(0.22 0.06 245 / 0.85) 0%, oklch(0.16 0.04 250 / 0.75) 50%, oklch(0.2 0.05 240 / 0.85) 100%)",
          backdropFilter: "blur(28px) saturate(1.4)",
          WebkitBackdropFilter: "blur(28px) saturate(1.4)",
          border: "1px solid oklch(0.7 0.18 240 / 0.35)",
          boxShadow:
            "0 30px 60px -20px oklch(0.05 0.05 250 / 0.8), 0 0 60px -10px oklch(0.7 0.18 240 / 0.4), inset 0 1px 0 oklch(0.95 0.05 235 / 0.15)",
        }}
      >
        {/* Holographic shimmer overlay */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none mix-blend-screen"
          style={{
            background:
              "linear-gradient(115deg, transparent 30%, oklch(0.85 0.15 220 / 0.25) 45%, oklch(0.95 0.08 235 / 0.4) 50%, oklch(0.85 0.15 220 / 0.25) 55%, transparent 70%)",
            transform: `translateX(${tilt.x * 3}px)`,
          }}
        />

        {/* Floating decorative orbs */}
        <div
          className="absolute -top-16 -right-12 h-44 w-44 rounded-full bg-primary/40 blur-3xl pointer-events-none animate-pulse-glow"
          style={{ transform: `translate(${tilt.x * 1.5}px, ${-tilt.y * 1.5}px)` }}
        />
        <div
          className="absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-sky/30 blur-3xl pointer-events-none animate-aurora-slow"
          style={{ transform: `translate(${-tilt.x * 1.5}px, ${tilt.y * 1.5}px)` }}
        />

        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.95 0.05 235) 1px, transparent 1px), linear-gradient(90deg, oklch(0.95 0.05 235) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative p-5" style={{ transform: "translateZ(40px)" }}>
          {/* Top brand strip */}
          <div className="flex items-center justify-between text-[10px] font-body uppercase tracking-[0.25em] text-sky/90 mb-4">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Member Card
            </span>
            {memberId && (
              <span className="flex items-center gap-1 rounded-full bg-sky/15 px-2 py-0.5 ring-1 ring-sky/30 text-sky font-bold">
                <BadgeCheck className="h-3 w-3" /> {memberId}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Avatar with floating ring */}
            <div className="relative shrink-0" style={{ transform: "translateZ(60px)" }}>
              <div className="absolute -inset-1.5 rounded-2xl bg-gradient-primary opacity-80 blur-md animate-pulse-glow" />
              <div className="relative h-24 w-24 overflow-hidden rounded-2xl ring-2 ring-sky/60 bg-gradient-primary shadow-glow">
                {photoUrl ? (
                  <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl font-heading text-primary-foreground">
                    {initial}
                  </div>
                )}
              </div>
              {streak > 0 && (
                <div className="absolute -bottom-1.5 -right-1.5 flex items-center gap-0.5 rounded-full bg-gradient-to-r from-warning to-ember px-2 py-0.5 ring-2 ring-card shadow-glow">
                  <Flame className="h-3 w-3 text-warning-foreground fill-warning-foreground" />
                  <span className="text-[10px] font-heading text-warning-foreground">{streak}</span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0" style={{ transform: "translateZ(50px)" }}>
              <p className="text-[10px] uppercase tracking-widest text-sky font-body font-bold">
                Welcome back
              </p>
              <h2 className="font-heading text-3xl tracking-wider text-white leading-tight truncate drop-shadow-[0_2px_8px_rgba(125,211,252,0.5)]">
                {name?.toUpperCase() || "MEMBER"}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-sky-100/80 font-body">
                {age && (
                  <>
                    <span className="font-semibold text-white">{age}y</span>
                    <span className="text-border">•</span>
                  </>
                )}
                {height && (
                  <>
                    <span>{height}</span>
                    <span className="text-border">•</span>
                  </>
                )}
                {weight && <span>{weight}kg</span>}
                {gender && (
                  <>
                    <span className="text-border">•</span>
                    <span className="capitalize">{gender}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Floating stat chips */}
          <div className="mt-5 grid grid-cols-3 gap-2" style={{ transform: "translateZ(30px)" }}>
            <FloatingChip label="Streak" value={`${streak}d`} icon={Flame} accent="ember" />
            <FloatingChip label="Done" value={`${weeklyDone}`} icon={Trophy} accent="success" />
            <FloatingChip label="Goal" value={`${weeklyTarget}`} icon={Target} accent="primary" />
          </div>

          {/* Weekly progress with depth */}
          <div
            className="mt-4 rounded-2xl backdrop-blur-md ring-1 ring-sky/20 p-3"
            style={{
              background: "oklch(0.1 0.04 250 / 0.5)",
              transform: "translateZ(20px)",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-widest font-body font-bold text-sky">
                Weekly Progress
              </span>
              <span className="text-xs font-heading text-white">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary/40">
              <div
                className="h-full rounded-full bg-gradient-primary transition-all duration-700 shadow-glow"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bottom holographic strip */}
        <div className="relative h-1.5 bg-gradient-to-r from-primary via-sky to-primary opacity-80" />
      </div>
    </div>
  );
}

function FloatingChip({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: any;
  accent: "ember" | "success" | "primary";
}) {
  const colors = {
    ember: "text-ember bg-ember/10 ring-ember/30",
    success: "text-success bg-success/10 ring-success/30",
    primary: "text-primary bg-primary/10 ring-primary/30",
  }[accent];

  return (
    <div
      className={`relative rounded-xl ring-1 ${colors} backdrop-blur-md p-2.5 text-center shadow-lg`}
      style={{ background: "oklch(0.1 0.04 250 / 0.4)" }}
    >
      <Icon className={`h-4 w-4 mx-auto mb-1`} />
      <p className="text-lg font-heading text-white leading-none">{value}</p>
      <p className="text-[9px] uppercase tracking-wider font-body font-bold opacity-80 mt-0.5">
        {label}
      </p>
    </div>
  );
}
