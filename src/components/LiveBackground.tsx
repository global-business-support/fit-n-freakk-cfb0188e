/**
 * Animated screensaver / live wallpaper background.
 * Place once near the root of a page (absolute, behind content).
 */
export function LiveBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Deep gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at top, oklch(0.22 0.08 250) 0%, oklch(0.12 0.03 250) 60%, oklch(0.08 0.02 250) 100%)",
        }}
      />

      {/* Aurora blobs */}
      <div className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-primary/25 blur-[120px] animate-aurora" />
      <div
        className="absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full bg-sky/20 blur-[140px] animate-aurora-slow"
        style={{ animationDelay: "3s" }}
      />
      <div
        className="absolute -bottom-40 left-1/4 h-[26rem] w-[26rem] rounded-full bg-primary/15 blur-[120px] animate-aurora"
        style={{ animationDelay: "6s" }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.9 0.05 230) 1px, transparent 1px), linear-gradient(90deg, oklch(0.9 0.05 230) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Floating dots */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-sky/40 animate-float-slow"
          style={{
            top: `${(i * 37) % 100}%`,
            left: `${(i * 53) % 100}%`,
            width: `${4 + (i % 3) * 2}px`,
            height: `${4 + (i % 3) * 2}px`,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${10 + (i % 5) * 2}s`,
          }}
        />
      ))}
    </div>
  );
}
