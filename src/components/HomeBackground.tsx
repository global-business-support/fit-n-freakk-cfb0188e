import homeBg from "@/assets/home-bg.jpg";

/**
 * Home page screensaver background — gym girl photo with cinematic dark blue overlay
 * and animated aurora glow accents. 3D feel via depth gradients.
 */
export function HomeBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Hero image with slow zoom */}
      <img
        src={homeBg}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover scale-110 animate-ken-burns"
      />

      {/* Cinematic dark blue overlay — top to bottom darkening for content readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.08 0.04 250 / 0.65) 0%, oklch(0.1 0.05 250 / 0.85) 40%, oklch(0.06 0.03 250 / 0.95) 100%)",
        }}
      />

      {/* Animated aurora glow accents */}
      <div className="absolute top-1/4 -left-32 h-[28rem] w-[28rem] rounded-full bg-primary/35 blur-[140px] animate-aurora" />
      <div
        className="absolute top-2/3 -right-32 h-[32rem] w-[32rem] rounded-full bg-sky/25 blur-[140px] animate-aurora-slow"
        style={{ animationDelay: "3s" }}
      />
      <div
        className="absolute -bottom-40 left-1/4 h-[26rem] w-[26rem] rounded-full bg-primary/20 blur-[120px] animate-aurora"
        style={{ animationDelay: "6s" }}
      />

      {/* Subtle grid for tech depth */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.9 0.05 230) 1px, transparent 1px), linear-gradient(90deg, oklch(0.9 0.05 230) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}
