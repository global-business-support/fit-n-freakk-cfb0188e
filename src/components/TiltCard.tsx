import Tilt from "react-parallax-tilt";
import type { ReactNode } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  intensity?: "subtle" | "strong";
}

/**
 * Subtle 3D tilt wrapper for cards. Hover/touch tilts the element slightly
 * with a glare highlight. Use `intensity="strong"` for detail/hero cards.
 */
export function TiltCard({ children, className, intensity = "subtle" }: TiltCardProps) {
  const strong = intensity === "strong";
  return (
    <Tilt
      tiltMaxAngleX={strong ? 14 : 6}
      tiltMaxAngleY={strong ? 14 : 6}
      glareEnable
      glareMaxOpacity={strong ? 0.35 : 0.18}
      glareColor="#ffffff"
      glarePosition="all"
      glareBorderRadius="16px"
      transitionSpeed={1500}
      scale={strong ? 1.03 : 1.01}
      className={className}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </Tilt>
  );
}
