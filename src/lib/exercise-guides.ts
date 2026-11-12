export type Motion = "tilt" | "nod" | "turn" | "lookdown" | "twist";

export type ExerciseGuide = {
  area: string;
  minutes: string;
  perDay: string;
  reps: string;
  hold: string;
  goal: string;
  need: string;
  motion: Motion;
  warmUp: { title: string; text: string }[];
  steps: { title: string; text: string }[];
  coolDown: { title: string; text: string }[];
  tip: string;
};

const SHOULDER_WARMUP = [
  { title: "Settle in", text: "Sit near the front of the chair, feet flat, hip-width apart." },
  { title: "Shoulder rolls", text: "Roll your shoulders back slowly 5 times." },
];
const BREATHE_COOLDOWN = [
  { title: "Breathe", text: "Three slow breaths, letting your shoulders drop on each out-breath." },
  { title: "Check in", text: "Notice how your neck feels compared with before you started." },
];

export const EXERCISE_GUIDES: Record<string, ExerciseGuide> = {
  "Active Lateral Neck Flexion": {
    area: "Head & Neck", minutes: "about 1 min", perDay: "1×", reps: "5 / side", hold: "3 s",
    goal: "Ease the sides of the neck", need: "Just a chair", motion: "tilt",
    warmUp: SHOULDER_WARMUP,
    steps: [
      { title: "Sit tall", text: "Shoulders relaxed, eyes ahead." },
      { title: "Tilt", text: "Bring one ear toward the same shoulder without lifting the shoulder." },
      { title: "Back to centre", text: "Hold, return to centre, then tilt to the other side." },
    ],
    coolDown: BREATHE_COOLDOWN,
    tip: "Start on your right · Keep your nose pointing forward",
  },
  "Deep Neck Flexor Training": {
    area: "Head & Neck", minutes: "about 2 min", perDay: "2×", reps: "10", hold: "5 s",
    goal: "Strengthen the front of the neck", need: "Just a chair", motion: "nod",
    warmUp: SHOULDER_WARMUP,
    steps: [
      { title: "Sit tall", text: "Back against the chair, eyes level." },
      { title: "Small nod", text: "Gently tuck your chin as if making a double chin." },
      { title: "Hold and release", text: "Hold, then relax back to neutral." },
    ],
    coolDown: BREATHE_COOLDOWN,
    tip: "Keep the movement small · Don't push your head down",
  },
  "Isometric Neck Flexion": {
    area: "Head & Neck", minutes: "about 1 min", perDay: "2×", reps: "5", hold: "5 s",
    goal: "Build neck stability", need: "Your hand", motion: "nod",
    warmUp: SHOULDER_WARMUP,
    steps: [
      { title: "Hand on forehead", text: "Place your palm flat on your forehead." },
      { title: "Press gently", text: "Push your head into your hand while your hand resists, so nothing moves." },
      { title: "Release", text: "Ease off slowly and rest a moment." },
    ],
    coolDown: BREATHE_COOLDOWN,
    tip: "About a third of your full effort · Keep breathing",
  },
  "Posterior Neck Muscle Stretch": {
    area: "Head & Neck", minutes: "about 2 min", perDay: "2×", reps: "3", hold: "20 s",
    goal: "Release the back of the neck", need: "Just a chair", motion: "lookdown",
    warmUp: SHOULDER_WARMUP,
    steps: [
      { title: "Sit tall", text: "Shoulders relaxed, hands on your thighs." },
      { title: "Chin to chest", text: "Slowly lower your chin toward your chest." },
      { title: "Hold", text: "Feel the stretch along the back of the neck, then lift slowly." },
    ],
    coolDown: BREATHE_COOLDOWN,
    tip: "Let your head hang · No bouncing",
  },
  "Seated Thoracic Rotation": {
    area: "Spine & Torso", minutes: "about 2 min", perDay: "1×", reps: "5 / side", hold: "2 s",
    goal: "Free up the upper back", need: "A chair without arms", motion: "twist",
    warmUp: SHOULDER_WARMUP,
    steps: [
      { title: "Arms crossed", text: "Sit tall and cross your arms over your chest." },
      { title: "Rotate", text: "Turn your upper body to one side, keeping your hips still." },
      { title: "Back to centre", text: "Return slowly, then turn to the other side." },
    ],
    coolDown: BREATHE_COOLDOWN,
    tip: "Start on your right · Turn from the mid-back",
  },
};

const FALLBACK: ExerciseGuide = {
  area: "Head & Neck", minutes: "about 1 min", perDay: "2×", reps: "5 / side", hold: "2 s",
  goal: "Loosen a stiff neck", need: "Just a chair", motion: "turn",
  warmUp: SHOULDER_WARMUP,
  steps: [
    { title: "Sit tall", text: "Shoulders relaxed, eyes ahead." },
    { title: "Turn", text: "Slowly turn your head to one side, to a gentle stretch." },
    { title: "Back to centre", text: "Come back to centre, then do the other side." },
  ],
  coolDown: BREATHE_COOLDOWN,
  tip: "Start on your right · Turn slowly, no bouncing",
};

export function guideFor(name: string): ExerciseGuide {
  return EXERCISE_GUIDES[name] ?? FALLBACK;
}
