// Map each gym machine to the list of exercise name keywords typically performed on it.
// Matching is case-insensitive "contains". A machine entry can also pull all exercises
// of a given body_part via `bodyParts`.

export interface MachineExerciseMap {
  /** Exercise name keywords (substring match, case-insensitive) */
  keywords?: string[];
  /** Pull every exercise from these body_part categories */
  bodyParts?: string[];
}

export const MACHINE_EXERCISES: Record<string, MachineExerciseMap> = {
  "Lat Pull Down": {
    keywords: ["lat pull", "wide grip lat", "face pull down", "pull down"],
  },
  "Seated Row Machine": {
    keywords: ["seated row", "cable row", "low cable back row", "t-bar row", "bent over row"],
  },
  "Long Pull Machine": {
    keywords: ["seated row", "cable row", "low cable back row"],
  },
  "T-Bar Row": {
    keywords: ["t-bar row", "bent over row", "bent over barbell row"],
  },
  "Chest Press Machine (Plate Loaded)": {
    keywords: ["chest press", "seated chest press", "bench press"],
  },
  "Pec Fly Machine": {
    keywords: ["pec deck", "pec fly", "dumbbell fly", "cable crossover", "flat dumbbell fly", "incline dumbbell fly"],
  },
  "Cable Crossover": {
    keywords: ["cable crossover", "cable pushdown", "cable kickback", "cable pull through", "low pulley", "cable face pull", "rope cable", "tricep rope"],
  },
  "Functional Trainer (Dual Adjustable Pulley)": {
    keywords: ["cable", "ft shrug", "ft upright", "low pulley", "rope cable", "tricep rope"],
  },
  "Biceps Curl Machine": {
    keywords: ["bicep curl", "preacher curl", "standing curl", "seating curl", "spider curl", "concentration curl", "short head curl", "long head curl"],
  },
  "Triceps Press Machine": {
    keywords: ["tricep", "overhead extension", "cable pushdown", "reverse grip pushdown", "diamond pushback", "skull crusher", "skullcrusher", "close grip bench"],
  },
  "Shoulder Press Machine": {
    keywords: ["shoulder press", "seated shoulder press", "seated military press", "seated arnold", "overhead shoulder press", "barbell standing press", "behind the neck press", "alternate dumbbell press"],
  },
  "Rear Delt Machine": {
    keywords: ["rear delt", "bent over reverse fly", "bent over lateral", "dumbbell bentover"],
  },
  "Leg Extension": {
    keywords: ["leg extension"],
    bodyParts: ["Legs"],
  },
  "Leg Curl": {
    keywords: ["leg curl", "lying leg curl", "seated ham curl"],
  },
  "Leg Press 45 Degree": {
    keywords: ["leg press", "high stance leg press", "legs press", "leg press calf"],
  },
  "Seated Leg Press": {
    keywords: ["leg press", "high stance leg press", "legs press"],
  },
  "Super / Hack Squat Machine": {
    keywords: ["hack squat", "hack squat calf"],
  },
  "Inner Thigh (Adductor) Machine": {
    keywords: ["inner leg", "inner thigh", "adductor"],
  },
  "Outer Thigh (Abductor) Machine": {
    keywords: ["abductor", "side lunge", "fire hydrant", "booty band", "side lunges"],
  },
  "Smith Machine": {
    keywords: ["smith press", "barbell squat", "barbell back squat", "bench press", "barbell shrug", "barbell front raise", "upright row"],
  },
  "Power Cage (Squat Rack)": {
    keywords: ["back squat", "barbell squat", "front squat", "deadlift", "romanian deadlift", "sumo deadlift", "bench press", "good morning", "barbell press"],
  },
  "Olympic Bench": {
    keywords: ["bench press", "barbell bench press", "close grip bench", "incline dumbbell press", "dumbbell fly", "flat dumbbell fly", "incline dumbbell fly"],
  },
  "Adjustable Bench": {
    keywords: ["incline dumbbell", "incline bicep", "dumbbell fly", "flat dumbbell fly", "decline crunch", "alternate dumbbell press", "preacher curl", "seated arnold", "seated military"],
  },
  "Dip & Chin Station": {
    keywords: ["tricep dip", "chest dip", "hanging leg raise", "pulse up", "dip machine", "inverted row"],
  },
  "Roman Chair": {
    keywords: ["back extension", "hanging leg raise", "hyperextension", "side plank crunches"],
  },
  "Seated Calf Raise": {
    keywords: ["calf raise", "seated calf", "standing calf", "single leg calf", "donkey calf", "leg press calf", "hack squat calf"],
  },
  "Forearm Machine": {
    keywords: ["hammer curl", "wrist curl", "forearm"],
  },
  "Dumbbells": {
    keywords: ["dumbbell", "hammer curl", "goblet squat", "alternating dumbbell"],
  },
  "Barbells": {
    keywords: ["barbell", "deadlift", "bench press", "back squat", "front squat", "romanian deadlift", "sumo deadlift", "good morning"],
  },
  "Kettlebells": {
    keywords: ["goblet squat", "kettlebell", "swing"],
  },
  // Cardio machines
  "Treadmill": { bodyParts: ["Cardio"] },
  "Spin Bike": { bodyParts: ["Cardio"] },
  "Cross Trainer": { bodyParts: ["Cardio"] },
  "Air Rower": { bodyParts: ["Cardio"] },
  "Stair Climber": { bodyParts: ["Cardio"] },
  "SKI Erg": { bodyParts: ["Cardio"] },
};

export interface ExerciseLite {
  id: string;
  name: string;
  body_part: string;
  thumbnail_url?: string | null;
  video_url?: string | null;
}

export function getExercisesForMachine(machineName: string, allExercises: ExerciseLite[]): ExerciseLite[] {
  const cfg = MACHINE_EXERCISES[machineName];
  if (!cfg) return [];
  const seen = new Set<string>();
  const result: ExerciseLite[] = [];

  const lowerKeywords = (cfg.keywords || []).map((k) => k.toLowerCase());
  const bodyParts = (cfg.bodyParts || []).map((b) => b.trim().toLowerCase());

  for (const ex of allExercises) {
    if (seen.has(ex.id)) continue;
    const nameLc = ex.name.toLowerCase();
    const bpLc = (ex.body_part || "").trim().toLowerCase();
    const matchKw = lowerKeywords.some((k) => nameLc.includes(k));
    const matchBp = bodyParts.includes(bpLc);
    if (matchKw || matchBp) {
      seen.add(ex.id);
      result.push(ex);
    }
  }
  return result.sort((a, b) => a.name.localeCompare(b.name));
}
