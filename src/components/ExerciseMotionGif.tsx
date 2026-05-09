import { Activity } from "lucide-react";

// Real human exercise demonstration GIFs (fitnessprogramer.com) keyed by normalized exercise name.
// Falls back to body-part GIF if the exercise isn't mapped.
const FP = (slug: string) => `https://fitnessprogramer.com/wp-content/uploads/${slug}.gif`;

const EXERCISE_GIFS: Record<string, string> = {
  // ===== CHEST =====
  "bench press": FP("2021/02/Bench-Press"),
  "barbell bench press": FP("2021/02/Bench-Press"),
  "barbell press": FP("2021/02/Bench-Press"),
  "incline bench press": FP("2021/02/Incline-Bench-Press"),
  "decline bench press": FP("2021/02/Decline-Barbell-Bench-Press"),
  "dumbbell fly": FP("2021/02/DUMBBELL-FLY"),
  "flat dumbbell fly": FP("2021/02/DUMBBELL-FLY"),
  "incline dumbbell fly": FP("2021/02/Incline-Dumbbell-Fly"),
  "dumbbell pullover": FP("2021/02/Dumbbell-Pullover"),
  "barbell pull over": FP("2021/02/Barbell-Pullover"),
  "chest dips": FP("2021/02/Chest-Dip"),
  "chest press": FP("2021/02/Machine-Chest-Press"),
  "seated chest press": FP("2021/02/Machine-Chest-Press"),
  "hammer press": FP("2021/02/Hammer-Strength-Chest-Press"),
  "cable crossover": FP("2021/02/Cable-Crossover"),
  "pec deck fly": FP("2021/02/Pec-Deck-Fly"),
  "push ups": FP("2021/02/Push-Up"),
  "smith press": FP("2021/04/Smith-Machine-Bench-Press"),
  "svend press": FP("2021/04/Svend-Press"),
  "incline dumbbell press": FP("2021/02/Incline-Dumbbell-Press"),

  // ===== BACK =====
  "deadlift": FP("2021/02/Deadlift"),
  "romanian deadlift": FP("2021/02/Romanian-Deadlift"),
  "sumo deadlift": FP("2021/02/Sumo-Deadlift"),
  "lat pull down": FP("2021/02/Lat-Pulldown"),
  "wide grip lat pulldown": FP("2021/02/Wide-Grip-Lat-Pulldown"),
  "bent over row": FP("2021/02/Bent-Over-Barbell-Row"),
  "bent over barbell row": FP("2021/02/Bent-Over-Barbell-Row"),
  "seated row": FP("2021/02/Seated-Cable-Row"),
  "cable row": FP("2021/02/Seated-Cable-Row"),
  "low cable back row": FP("2021/02/Seated-Cable-Row"),
  "t-bar row": FP("2021/02/T-Bar-Row"),
  "inverted row": FP("2021/04/Inverted-Row"),
  "back extension": FP("2021/02/Back-Extension"),
  "face pull down": FP("2021/02/Face-Pull"),
  "cable face pull up": FP("2021/02/Face-Pull"),
  "shrugs": FP("2021/04/Dumbbell-Shrug"),
  "seated dumbbell shrug": FP("2021/04/Dumbbell-Shrug"),
  "standing dumbbell shrug": FP("2021/04/Dumbbell-Shrug"),

  // ===== SHOULDERS =====
  "shoulder press": FP("2021/02/Dumbbell-Shoulder-Press"),
  "overhead shoulder press": FP("2021/02/Dumbbell-Shoulder-Press"),
  "seated shoulder press": FP("2021/02/Dumbbell-Shoulder-Press"),
  "seated military press": FP("2021/02/Military-Press"),
  "seated arnold press": FP("2021/02/Arnold-Press"),
  "lateral raise": FP("2021/02/Dumbbell-Lateral-Raise"),
  "lateral raises": FP("2021/02/Dumbbell-Lateral-Raise"),
  "side lateral raise": FP("2021/02/Dumbbell-Lateral-Raise"),
  "front raise": FP("2021/02/Dumbbell-Front-Raise"),
  "reverse dumbbell press": FP("2021/02/Reverse-Grip-Dumbbell-Bench-Press"),
  "seated rear delt fly": FP("2021/02/Rear-Delt-Fly"),
  "upright row": FP("2021/02/Barbell-Upright-Row"),
  "side bench upright row": FP("2021/02/Barbell-Upright-Row"),
  "reverse bench upright row": FP("2021/02/Barbell-Upright-Row"),
  "low pulley raise": FP("2021/04/Cable-Front-Raise"),

  // ===== BICEPS / ARMS =====
  "bicep curl": FP("2021/02/Dumbbell-Curl"),
  "barbell bicep curl": FP("2021/02/Barbell-Curl"),
  "barbell curl narrow grip": FP("2021/02/Close-Grip-Barbell-Curl"),
  "barbell curl wide grip": FP("2021/04/Wide-Grip-Standing-Barbell-Curl"),
  "hammer curl": FP("2021/02/Hammer-Curl"),
  "hammer curls": FP("2021/02/Hammer-Curl"),
  "cross body hammer curl": FP("2021/04/Cross-Body-Hammer-Curl"),
  "alternating dumbbell curl": FP("2021/02/Alternate-Dumbbell-Curl"),
  "concentration curl": FP("2021/02/Concentration-Curl"),
  "preacher curl": FP("2021/02/Preacher-Curl"),
  "incline bicep curl": FP("2021/02/Incline-Dumbbell-Curl"),
  "spider curl": FP("2021/04/Spider-Curl"),
  "long head curl": FP("2021/02/Incline-Dumbbell-Curl"),
  "short head curl": FP("2021/02/Preacher-Curl"),
  "seating curls": FP("2021/02/Dumbbell-Curl"),
  "standing curls": FP("2021/02/Dumbbell-Curl"),

  // ===== TRICEPS =====
  "tricep dip": FP("2021/02/Bench-Dip"),
  "tricep dips": FP("2021/02/Bench-Dip"),
  "tricep kickback": FP("2021/02/Triceps-Kickback"),
  "tricep rope pushdown": FP("2021/02/Pushdown"),
  "reverse grip pushdown": FP("2021/02/Reverse-Grip-Tricep-Pushdown"),
  "skull crusher": FP("2021/02/Skullcrusher"),
  "dumbbell skullcrusher": FP("2021/02/Dumbbell-Skullcrusher"),
  "overhead extension": FP("2021/02/Triceps-Extension"),
  "overhead tricep extension": FP("2021/02/Triceps-Extension"),
  "overhead barbell tricep extension": FP("2021/02/Barbell-Triceps-Extension"),
  "rope cable overhead": FP("2021/04/Cable-Rope-Overhead-Triceps-Extension"),

  // ===== LEGS / GLUTES =====
  "squats": FP("2021/02/BARBELL-SQUAT"),
  "setup squat": FP("2021/02/BARBELL-SQUAT"),
  "sumo squat": FP("2021/02/Sumo-Squat"),
  "leg press": FP("2021/02/Leg-Press"),
  "lunges": FP("2021/02/Lunge"),
  "walking lunges": FP("2021/02/Walking-Lunge"),
  "side lunges": FP("2021/04/Side-Lunge"),
  "step up": FP("2021/02/Step-Up"),
  "wall sit": FP("2021/04/Wall-Sit"),
  "lying leg curls": FP("2021/02/Lying-Leg-Curl"),
  "seated ham curls": FP("2021/02/Seated-Leg-Curl"),
  "leg extension": FP("2021/02/Leg-Extension"),
  "weighted glute bridges": FP("2021/02/Barbell-Hip-Thrust"),

  // ===== CALVES =====
  "standing calf raise": FP("2021/02/Standing-Calf-Raise"),
  "seated calf raise": FP("2021/02/Seated-Calf-Raise"),
  "single leg calf raise": FP("2021/04/Single-Leg-Calf-Raise"),
  "donkey calf raise": FP("2021/02/Donkey-Calf-Raise"),
  "leg press calf raise": FP("2021/04/Leg-Press-Calf-Raise"),
  "hack squat calf raise": FP("2021/04/Hack-Squat-Calf-Raise"),

  // ===== ABS / CORE =====
  "crunches": FP("2021/02/Crunch"),
  "high crunches": FP("2021/02/Crunch"),
  "knee crunches": FP("2021/02/Crunch"),
  "long arm crunches": FP("2021/04/Long-Arm-Crunch"),
  "raised leg crunches": FP("2021/04/Crunch-With-Legs-Up"),
  "reverse crunches": FP("2021/02/Reverse-Crunch"),
  "decline crunch": FP("2021/02/Decline-Crunch"),
  "cross crunches": FP("2021/02/Cross-Body-Crunch"),
  "crossover crunches": FP("2021/02/Cross-Body-Crunch"),
  "bicycle crunches": FP("2021/02/Bicycle-Crunch"),
  "standing crunch": FP("2021/04/Standing-Cable-Crunch"),
  "plank crunches": FP("2021/04/Plank-Knee-To-Elbow"),
  "sit-ups": FP("2021/02/Sit-Up"),
  "plank": FP("2021/02/Plank"),
  "elbow plank": FP("2021/02/Plank"),
  "side plank": FP("2021/02/Side-Plank"),
  "side plank crunches": FP("2021/04/Side-Plank-Crunch"),
  "star plank": FP("2021/04/Star-Plank"),
  "plank rolls": FP("2021/02/Plank"),
  "plank shoulder taps": FP("2021/04/Plank-Shoulder-Tap"),
  "hollow hold": FP("2021/04/Hollow-Body-Hold"),
  "dead bug": FP("2021/04/Dead-Bug"),
  "russian twist": FP("2021/02/Russian-Twist"),
  "seated twist": FP("2021/02/Russian-Twist"),
  "sitting twist": FP("2021/02/Russian-Twist"),
  "leg raises": FP("2021/02/Lying-Leg-Raise"),
  "hanging leg raises": FP("2021/02/Hanging-Leg-Raise"),
  "arm leg raises": FP("2021/04/Bird-Dog"),
  "flutter kicks": FP("2021/02/Flutter-Kicks"),
  "scissors": FP("2021/02/Scissor-Kick"),
  "toe taps": FP("2021/04/Toe-Tap"),
  "heel touches": FP("2021/02/Heel-Touch"),
  "knee to elbow": FP("2021/04/Plank-Knee-To-Elbow"),
  "knee to elbow v2": FP("2021/04/Plank-Knee-To-Elbow"),
  "knee - in twist": FP("2021/02/Russian-Twist"),
  "side jack knives": FP("2021/04/Side-Jackknife"),
  "v with rotations": FP("2021/02/V-Up"),
  "wipers": FP("2021/04/Windshield-Wiper"),
  "half wipers exercise": FP("2021/04/Windshield-Wiper"),
  "climber taps": FP("2021/02/Mountain-Climber"),
  "crunch kicks": FP("2021/02/Crunch"),
  "pulse up": FP("2021/02/Reverse-Crunch"),
  "hundreds": FP("2021/04/Pilates-Hundred"),
  "l-sit": FP("2021/04/L-Sit"),
  "seated knee up": FP("2021/02/Seated-Knee-Tuck"),
  "sitting punches": FP("2021/02/Russian-Twist"),

  // ===== CARDIO =====
  "burpees": FP("2021/02/Burpee"),
  "mountain climbers": FP("2021/02/Mountain-Climber"),
  "jumping jacks": FP("2021/02/Jumping-Jack"),
  "jump rope": FP("2021/02/Jump-Rope"),
  "box jumps": FP("2021/04/Box-Jump"),
  "hiit sprint": FP("2021/02/High-Knees"),
};

const BODY_GIFS: Record<string, string> = {
  chest: FP("2021/02/Bench-Press"),
  back: FP("2021/02/Lat-Pulldown"),
  shoulders: FP("2021/02/Dumbbell-Shoulder-Press"),
  biceps: FP("2021/02/Dumbbell-Curl"),
  arms: FP("2021/02/Dumbbell-Curl"),
  triceps: FP("2021/02/Pushdown"),
  legs: FP("2021/02/BARBELL-SQUAT"),
  glutes: FP("2021/02/Barbell-Hip-Thrust"),
  abs: FP("2021/02/Crunch"),
  core: FP("2021/02/Plank"),
  cardio: FP("2021/02/Burpee"),
  traps: FP("2021/04/Dumbbell-Shrug"),
  calves: FP("2021/02/Standing-Calf-Raise"),
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
  calves: "Calf shape + ankle drive",
};

function normalizePart(bodyPart: string) {
  const value = (bodyPart || "").toLowerCase();
  if (value.includes("calf") || value.includes("calves")) return "calves";
  if (value.includes("glute") || value.includes("hip")) return "glutes";
  if (value.includes("leg") || value.includes("quad") || value.includes("ham") || value.includes("thigh")) return "legs";
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

function normalizeName(name: string) {
  return (name || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function ExerciseMotionGif({
  bodyPart,
  title,
  compact = false,
}: {
  bodyPart: string;
  title?: string;
  compact?: boolean;
}) {
  const key = normalizePart(bodyPart || "legs");
  const nameKey = normalizeName(title || "");
  const gif = EXERCISE_GIFS[nameKey] || BODY_GIFS[key];
  return (
    <div className="relative overflow-hidden rounded-xl border border-sky/30 bg-secondary/50 shadow-card">
      <img
        src={gif}
        alt={`${title || bodyPart} animated exercise demonstration`}
        loading="lazy"
        className={`${compact ? "h-24" : "aspect-video"} w-full object-cover`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
      <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
        <Activity className="h-3.5 w-3.5 shrink-0 text-primary animate-pulse" />
        <p className="truncate text-[10px] font-bold uppercase tracking-wider text-sky font-body">
          {BENEFITS[key]}
        </p>
      </div>
    </div>
  );
}
