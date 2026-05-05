/**
 * Body Part Diagram — SVG silhouette with the targeted muscle highlighted.
 * Pure SVG, no network, looks anatomical and clean.
 */

const PART_KEY: Record<string, string> = {
  chest: "chest", pec: "chest", pecs: "chest",
  back: "back", lats: "back", lat: "back",
  shoulder: "shoulders", shoulders: "shoulders", delts: "shoulders", delt: "shoulders",
  biceps: "biceps", bicep: "biceps",
  triceps: "triceps", tricep: "triceps",
  arms: "arms", arm: "arms", forearm: "forearms", forearms: "forearms",
  abs: "abs", core: "abs", abdomen: "abs", stomach: "abs",
  legs: "legs", leg: "legs", quads: "quads", quad: "quads",
  hamstrings: "hamstrings", hamstring: "hamstrings",
  glutes: "glutes", glute: "glutes", butt: "glutes",
  calves: "calves", calf: "calves",
  cardio: "cardio", fullbody: "fullbody", "full body": "fullbody",
};

function normalize(p: string): string {
  return PART_KEY[p.toLowerCase().trim()] || p.toLowerCase().trim();
}

interface Props { bodyPart: string; className?: string }

export function BodyPartDiagram({ bodyPart, className = "" }: Props) {
  const k = normalize(bodyPart);
  // Highlight color
  const hi = "url(#emberGlow)";
  const base = "#1f1f24";
  const stroke = "#3a3a42";

  const isFront = !["back", "hamstrings", "glutes"].includes(k);

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl border border-sky/30 bg-gradient-to-br from-card via-card to-secondary/40 shadow-card ${className}`}>
      <div className="absolute top-3 left-3 z-10 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-body uppercase tracking-wider text-ember">
        Target: {bodyPart}
      </div>
      <svg viewBox="0 0 200 360" className="w-full h-auto block" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="emberGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff7849" />
            <stop offset="100%" stopColor="#e85d3a" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {isFront ? (
          <FrontBody base={base} stroke={stroke} highlight={k} hi={hi} />
        ) : (
          <BackBody base={base} stroke={stroke} highlight={k} hi={hi} />
        )}
      </svg>
    </div>
  );
}

function FrontBody({ base, stroke, highlight, hi }: { base: string; stroke: string; highlight: string; hi: string }) {
  const fill = (key: string) => (highlight === key || highlight === "fullbody" ? hi : base);
  const filter = (key: string) => (highlight === key || highlight === "fullbody" ? "url(#glow)" : undefined);

  return (
    <g stroke={stroke} strokeWidth="1.2">
      {/* Head */}
      <ellipse cx="100" cy="32" rx="20" ry="24" fill={base} />
      {/* Neck */}
      <rect x="92" y="52" width="16" height="12" fill={base} />
      {/* Torso outline */}
      <path d="M60 70 Q60 130 70 180 L130 180 Q140 130 140 70 Z" fill={base} />

      {/* Shoulders */}
      <ellipse cx="58" cy="78" rx="18" ry="14" fill={fill("shoulders")} filter={filter("shoulders")} />
      <ellipse cx="142" cy="78" rx="18" ry="14" fill={fill("shoulders")} filter={filter("shoulders")} />

      {/* Chest */}
      <path d="M70 78 Q85 75 99 80 L99 110 Q85 112 70 105 Z" fill={fill("chest")} filter={filter("chest")} />
      <path d="M130 78 Q115 75 101 80 L101 110 Q115 112 130 105 Z" fill={fill("chest")} filter={filter("chest")} />

      {/* Abs */}
      <g fill={fill("abs")} filter={filter("abs")}>
        <rect x="86" y="115" width="12" height="11" rx="2" />
        <rect x="102" y="115" width="12" height="11" rx="2" />
        <rect x="86" y="129" width="12" height="11" rx="2" />
        <rect x="102" y="129" width="12" height="11" rx="2" />
        <rect x="86" y="143" width="12" height="11" rx="2" />
        <rect x="102" y="143" width="12" height="11" rx="2" />
      </g>

      {/* Biceps */}
      <ellipse cx="48" cy="115" rx="11" ry="22" fill={fill("biceps")} filter={filter("biceps")} />
      <ellipse cx="152" cy="115" rx="11" ry="22" fill={fill("biceps")} filter={filter("biceps")} />

      {/* Forearms */}
      <ellipse cx="42" cy="160" rx="10" ry="20" fill={fill("forearms")} filter={filter("forearms")} />
      <ellipse cx="158" cy="160" rx="10" ry="20" fill={fill("forearms")} filter={filter("forearms")} />

      {/* Hands */}
      <circle cx="40" cy="184" r="7" fill={base} />
      <circle cx="160" cy="184" r="7" fill={base} />

      {/* Hips */}
      <path d="M70 180 L130 180 L135 200 L65 200 Z" fill={base} />

      {/* Quads */}
      <path d="M68 200 Q72 250 80 280 L98 280 Q98 240 95 200 Z" fill={fill("quads")} filter={filter("quads")} />
      <path d="M132 200 Q128 250 120 280 L102 280 Q102 240 105 200 Z" fill={fill("quads")} filter={filter("quads")} />
      {/* Legs alias */}
      {highlight === "legs" && (
        <g fill={hi} filter="url(#glow)" opacity="0.85">
          <path d="M68 200 Q72 250 80 280 L98 280 Q98 240 95 200 Z" />
          <path d="M132 200 Q128 250 120 280 L102 280 Q102 240 105 200 Z" />
        </g>
      )}

      {/* Knees */}
      <ellipse cx="88" cy="285" rx="10" ry="6" fill={base} />
      <ellipse cx="112" cy="285" rx="10" ry="6" fill={base} />

      {/* Calves (front shins) */}
      <ellipse cx="86" cy="320" rx="9" ry="22" fill={fill("calves")} filter={filter("calves")} />
      <ellipse cx="114" cy="320" rx="9" ry="22" fill={fill("calves")} filter={filter("calves")} />

      {/* Feet */}
      <ellipse cx="86" cy="350" rx="10" ry="6" fill={base} />
      <ellipse cx="114" cy="350" rx="10" ry="6" fill={base} />

      {/* Cardio badge — heart pulse over chest */}
      {highlight === "cardio" && (
        <g filter="url(#glow)">
          <path d="M88 95 L94 102 L100 90 L106 105 L112 95" fill="none" stroke="#ff7849" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
    </g>
  );
}

function BackBody({ base, stroke, highlight, hi }: { base: string; stroke: string; highlight: string; hi: string }) {
  const fill = (key: string) => (highlight === key || highlight === "fullbody" ? hi : base);
  const filter = (key: string) => (highlight === key || highlight === "fullbody" ? "url(#glow)" : undefined);
  return (
    <g stroke={stroke} strokeWidth="1.2">
      <ellipse cx="100" cy="32" rx="20" ry="24" fill={base} />
      <rect x="92" y="52" width="16" height="12" fill={base} />
      <path d="M60 70 Q60 130 70 180 L130 180 Q140 130 140 70 Z" fill={base} />
      {/* Lats / Back */}
      <path d="M65 80 Q75 130 90 175 L110 175 Q125 130 135 80 Z" fill={fill("back")} filter={filter("back")} />
      {/* Shoulders rear */}
      <ellipse cx="58" cy="78" rx="18" ry="14" fill={base} />
      <ellipse cx="142" cy="78" rx="18" ry="14" fill={base} />
      {/* Triceps */}
      <ellipse cx="48" cy="115" rx="11" ry="22" fill={fill("triceps")} filter={filter("triceps")} />
      <ellipse cx="152" cy="115" rx="11" ry="22" fill={fill("triceps")} filter={filter("triceps")} />
      <ellipse cx="42" cy="160" rx="10" ry="20" fill={base} />
      <ellipse cx="158" cy="160" rx="10" ry="20" fill={base} />
      <circle cx="40" cy="184" r="7" fill={base} />
      <circle cx="160" cy="184" r="7" fill={base} />
      {/* Glutes */}
      <ellipse cx="86" cy="200" rx="20" ry="15" fill={fill("glutes")} filter={filter("glutes")} />
      <ellipse cx="114" cy="200" rx="20" ry="15" fill={fill("glutes")} filter={filter("glutes")} />
      {/* Hamstrings */}
      <path d="M68 215 Q72 255 80 280 L98 280 Q98 240 95 215 Z" fill={fill("hamstrings")} filter={filter("hamstrings")} />
      <path d="M132 215 Q128 255 120 280 L102 280 Q102 240 105 215 Z" fill={fill("hamstrings")} filter={filter("hamstrings")} />
      <ellipse cx="88" cy="285" rx="10" ry="6" fill={base} />
      <ellipse cx="112" cy="285" rx="10" ry="6" fill={base} />
      {/* Calves */}
      <ellipse cx="86" cy="320" rx="9" ry="22" fill={fill("calves")} filter={filter("calves")} />
      <ellipse cx="114" cy="320" rx="9" ry="22" fill={fill("calves")} filter={filter("calves")} />
      <ellipse cx="86" cy="350" rx="10" ry="6" fill={base} />
      <ellipse cx="114" cy="350" rx="10" ry="6" fill={base} />
    </g>
  );
}
