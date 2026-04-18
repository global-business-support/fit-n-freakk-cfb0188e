import { useState, useEffect } from "react";
import mascotSrc from "@/assets/login-mascot.png";

/**
 * Animated gym girl silhouette beside the login form.
 * Glows, pulses, and shows a "Click me to login!" speech bubble.
 */
export function LoginMascot({ onClick }: { onClick?: () => void }) {
  const [bubble, setBubble] = useState(true);

  useEffect(() => {
    const i = setInterval(() => setBubble((b) => !b), 3500);
    return () => clearInterval(i);
  }, []);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Tap to focus login"
      className="group relative hidden md:flex items-end justify-center select-none"
    >
      {/* Outer glow halo */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[420px] w-[260px] rounded-full bg-primary/40 blur-[80px] animate-mascot-glow" />
      </div>

      {/* Speech bubble */}
      <div
        className={`absolute -top-2 right-0 z-20 transition-all duration-500 ${
          bubble ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
      >
        <div className="relative rounded-2xl bg-white/95 px-3 py-2 text-xs font-bold text-slate-900 font-body shadow-glow animate-mascot-bob">
          👉 Click me to login!
          <div className="absolute -bottom-1 right-6 h-3 w-3 rotate-45 bg-white/95" />
        </div>
      </div>

      <img
        src={mascotSrc}
        alt="Athletic woman ready to train"
        loading="lazy"
        width={768}
        height={1280}
        className="relative h-[460px] w-auto drop-shadow-[0_0_45px_oklch(0.7_0.18_240/0.65)] animate-mascot-pulse transition-transform duration-500 group-hover:scale-[1.03]"
      />
    </button>
  );
}
