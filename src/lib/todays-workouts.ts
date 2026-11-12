/** Today's exercises, as in the live Poscura app. */
export const TODAY_TIME = "04:55 PM";

export const TODAYS_WORKOUTS = [
  { name: "Active Lateral Neck Flexion", done: 0, sessions: 1, programDone: 1, programTotal: 28 },
  { name: "Deep Neck Flexor Training", done: 0, sessions: 2, programDone: 0, programTotal: 28 },
  { name: "Isometric Neck Flexion", done: 0, sessions: 2, programDone: 0, programTotal: 21 },
  { name: "Posterior Neck Muscle Stretch", done: 0, sessions: 2, programDone: 0, programTotal: 21 },
  { name: "Seated Thoracic Rotation", done: 0, sessions: 1, programDone: 0, programTotal: 14 },
];

export const NEXT_WORKOUT = TODAYS_WORKOUTS[0].name;

/** Order used by the Workout Progress card in the live app. */
export const PROGRESS_ORDER = [
  "Active Lateral Neck Flexion",
  "Isometric Neck Flexion",
  "Deep Neck Flexor Training",
  "Posterior Neck Muscle Stretch",
  "Seated Thoracic Rotation",
].map((n) => TODAYS_WORKOUTS.find((w) => w.name === n)!);
