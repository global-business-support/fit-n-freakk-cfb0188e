import { Activity } from "lucide-react";

const BODY_GIFS: Record<string, string> = {
  chest: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Bench-Press.gif",
  back: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Lat-Pulldown.gif",
  shoulders: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shoulder-Press.gif",
  biceps: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Curl.gif",
  arms: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Curl.gif",
  triceps: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Pushdown.gif",
  legs: "https://fitnessprogramer.com/wp-content/uploads/2021/02/BARBELL-SQUAT.gif",
  glutes: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Hip-Thrust.gif",
  abs: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Crunch.gif",
  core: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Plank.gif",
  cardio: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Burpee.gif",
  traps: "https://fitnessprogramer.com/wp-content/uploads/2021/04/Dumbbell-Shrug.gif",
};

const BENEFITS: Record<string, string> = {
  chest: "Chest thickness + push strength",
  back: "V-shape back + pulling power",
  shoulders: "Wide shoulder cap growth",
  biceps: "Arm peak and curl strength",
  arms: "Biceps/triceps arm size",
  triceps: "Arm size + lockout power",
  legs: "Quads, hamstrings and strength",
  glutes: "Glute shape + hip power",
  abs: "Core definition + stability",
  core: "Core control + posture",
  cardio: "Fat burn + stamina",
  traps: "Upper-back thickness",
};

function normalizePart(bodyPart: string) {
  const value = bodyPart.toLowerCase();
  if (value.includes("glute") || value.includes("hip")) return "glutes";
  if (value.includes("leg") || value.includes("quad") || value.includes("ham") || value.includes("calf") || value.includes("thigh")) return "legs";
  if (value.includes("abs") || value.includes("oblique")) return "abs";
  if (value.includes("core")) return "core";
  if (value.includes("back") || value.includes("lat") || value.includes("row")) return "back";
  if (value.includes("shoulder") || value.includes("delt")) return "shoulders";
  if (value.includes("bicep")) return "biceps";
  if (value.includes("tricep")) return "triceps";
  if (value.includes("arm")) return "arms";
  if (value.includes("chest") || value.includes("press")) return "chest";
  if (value.includes("cardio") || value.includes("fat")) return "cardio";
  if (value.includes("trap") || value.includes("shrug")) return "traps";
  return "legs";
}

export function ExerciseMotionGif({ bodyPart, title, compact = false }: { bodyPart: string; title?: string; compact?: boolean }) {
  const key = normalizePart(bodyPart || "legs");
  const gif = BODY_GIFS[key];
  return (
    <div className="relative overflow-hidden rounded-xl border border-sky/30 bg-secondary/50 shadow-card">
      <img src={gif} alt={`${title || bodyPart} animated exercise form`} loading="lazy" className={`${compact ? "h-24" : "aspect-video"} w-full object-cover mix-blend-screen`} />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
      <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
        <Activity className="h-3.5 w-3.5 shrink-0 text-primary animate-pulse" />
        <p className="truncate text-[10px] font-bold uppercase tracking-wider text-sky font-body">{BENEFITS[key]}</p>
      </div>
    </div>
  );
}