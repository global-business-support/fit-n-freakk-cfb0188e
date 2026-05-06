import maleChest from "@/assets/muscles/male-chest.jpg";
import maleBack from "@/assets/muscles/male-back.jpg";
import maleShoulders from "@/assets/muscles/male-shoulders.jpg";
import maleArms from "@/assets/muscles/male-arms.jpg";
import maleAbs from "@/assets/muscles/male-abs.jpg";
import maleLegs from "@/assets/muscles/male-legs.jpg";
import femaleGlutes from "@/assets/muscles/female-glutes.jpg";
import femaleLegs from "@/assets/muscles/female-legs.jpg";
import femaleArms from "@/assets/muscles/female-arms.jpg";
import femaleBack from "@/assets/muscles/female-back.jpg";
import femaleCore from "@/assets/muscles/female-core.jpg";
import femaleShoulders from "@/assets/muscles/female-shoulders.jpg";
import { Sparkles, TrendingUp } from "lucide-react";

const MALE: Record<string, string> = {
  chest: maleChest,
  back: maleBack,
  shoulders: maleShoulders, traps: maleShoulders, shrugs: maleShoulders, "upright row": maleShoulders,
  arms: maleArms, biceps: maleArms, triceps: maleArms, forearms: maleArms,
  abs: maleAbs, core: maleAbs,
  legs: maleLegs, quads: maleLegs, hamstrings: maleLegs, calves: maleLegs, glutes: maleLegs,
};
const FEMALE: Record<string, string> = {
  glutes: femaleGlutes, butt: femaleGlutes,
  legs: femaleLegs, quads: femaleLegs, hamstrings: femaleLegs, thighs: femaleLegs, calves: femaleLegs,
  arms: femaleArms, biceps: femaleArms, triceps: femaleArms,
  back: femaleBack,
  core: femaleCore, abs: femaleCore,
  shoulders: femaleShoulders,
};

const GROWTH_TIPS: Record<string, string> = {
  chest: "Builds upper body mass — pectorals, push power & broader frame",
  back: "V-taper width — lats, traps & posture strength",
  shoulders: "Boulder delts — wider frame & overhead strength",
  arms: "Sleeve-busting biceps & triceps — pulling & pressing power",
  biceps: "Peak biceps — arm size & pulling strength",
  triceps: "Horseshoe triceps — 70% of arm size lives here",
  abs: "Shredded core — six-pack visibility & stability",
  core: "Strong midsection — posture, balance & power transfer",
  legs: "Wheels — strength foundation, testosterone & overall mass",
  quads: "Front-leg sweep — quad teardrop & power",
  hamstrings: "Rear leg curve — sprint speed & knee health",
  glutes: "Booty growth — round & lifted glutes, hip strength",
  calves: "Diamond calves — lower-leg shape & ankle power",
  thighs: "Toned thighs — leaner sculpted look & strength",
  cardio: "Fat burn — endurance, heart health & conditioning",
  fullbody: "Total transformation — full muscle activation",
  traps: "Trap mountain — neck & shoulder thickness",
  shrugs: "Trap thickness — yoke development",
};

function pickKey(part: string): string {
  const p = part.toLowerCase().trim();
  // try direct then prefix before " - "
  if (p in GROWTH_TIPS) return p;
  const head = p.split(/[-,/]/)[0].trim();
  if (head in GROWTH_TIPS) return head;
  const tail = p.split(/[-,/]/).slice(-1)[0].trim();
  if (tail in GROWTH_TIPS) return tail;
  return head;
}

interface Props { bodyPart: string; gender: "male" | "female"; className?: string }

export function MusclePhoto({ bodyPart, gender, className = "" }: Props) {
  const key = pickKey(bodyPart);
  const map = gender === "male" ? MALE : FEMALE;
  const src = map[key] || (gender === "male" ? maleAbs : femaleCore);
  const tip = GROWTH_TIPS[key] || "Targeted muscle development & strength gains";

  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-primary/30 bg-black shadow-glow animate-fade-in ${className}`}>
      <div className="relative aspect-[4/5] w-full">
        <img
          src={src}
          alt={`${gender} ${bodyPart} muscle target`}
          loading="lazy"
          width={768}
          height={960}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Pulse highlight ring */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="pointer-events-none absolute inset-0 opacity-60 mix-blend-overlay bg-[radial-gradient(circle_at_50%_55%,rgba(232,93,58,0.45),transparent_55%)] animate-pulse" />

        {/* Top badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 backdrop-blur-sm border border-ember/40">
          <Sparkles className="h-3 w-3 text-ember animate-pulse" />
          <span className="text-[10px] font-heading uppercase tracking-widest text-ember">Target: {bodyPart}</span>
        </div>

        {/* Growth tip overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-start gap-2 rounded-xl bg-black/70 backdrop-blur-md border border-primary/30 p-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <TrendingUp className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-widest font-heading text-ember/90">Growth Zone</p>
              <p className="text-xs text-white font-body leading-snug">{tip}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
