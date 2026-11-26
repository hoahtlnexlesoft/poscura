/* AI form check, per step of an exercise (simulated in the prototype). */

export type StepScore = { title: string; score: number };

/** Steps of the exercises the demo user has done; others use DEFAULT_STEPS. */
export const STEP_SCORES: Record<string, StepScore[]> = {
  "Cat Cow": [
    { title: "Start on hands and knees", score: 78 },
    { title: "Arch your back (cow)", score: 74 },
    { title: "Round your spine (cat)", score: 91 },
  ],
  "Squeeze Blades": [
    { title: "Sit tall, arms relaxed", score: 84 },
    { title: "Squeeze your shoulder blades", score: 72 },
    { title: "Hold, then release slowly", score: 88 },
  ],
  "Chin Tucks": [
    { title: "Sit or stand upright", score: 87 },
    { title: "Glide your chin straight back", score: 79 },
    { title: "Hold, then relax", score: 98 },
  ],
};
export const DEFAULT_STEPS: StepScore[] = [
  { title: "Sit or stand upright", score: 78 },
  { title: "Turn your head to one side", score: 74 },
  { title: "Return to centre, then switch sides", score: 91 },
];

export type StepBand = { key: "perfect" | "almost" | "building" | "practising"; label: string; msg: string; text: string; bar: string; dot: string; solid: string; color: string };

/** Four bands: ≥90 perfect · 75–89 almost there · 60–74 building up · <60 keep practising */
export function stepBand(score: number): StepBand {
  if (score >= 90) return { key: "perfect", label: "Perfect form", msg: "You've mastered this step. Keep that feeling every rep.", text: "text-success", bar: "bg-success", dot: "bg-success/15 text-success ring-success/30", solid: "bg-success text-white ring-success", color: "var(--color-success)" };
  if (score >= 75) return { key: "almost", label: "Almost there", msg: "Great work. You're just a touch away from perfect.", text: "text-sky-400", bar: "bg-sky-400", dot: "bg-sky-400/15 text-sky-300 ring-sky-400/30", solid: "bg-sky-400 text-[#06121f] ring-sky-400", color: "rgb(56 189 248)" };
  if (score >= 60) return { key: "building", label: "Building up", msg: "Good start. Focus on this step next time and watch it improve.", text: "text-warning", bar: "bg-warning", dot: "bg-warning/15 text-warning ring-warning/30", solid: "bg-warning text-[#1b1406] ring-warning", color: "var(--color-warning)" };
  return { key: "practising", label: "Keep practising", msg: "Every expert started here. Go slowly and it'll click.", text: "text-destructive", bar: "bg-destructive", dot: "bg-destructive/15 text-destructive ring-destructive/30", solid: "bg-destructive text-white ring-destructive", color: "var(--color-destructive)" };
}

const clamp = (n: number) => Math.max(20, Math.min(100, Math.round(n)));

/** Step scores of one session: the exercise's step profile shifted so it averages to the session score. */
export function stepsFor(exercise: string, score?: number): StepScore[] {
  const base = STEP_SCORES[exercise] ?? DEFAULT_STEPS;
  if (score == null) return base;
  const mean = base.reduce((s, x) => s + x.score, 0) / base.length;
  // strong sessions are even across steps; weaker ones keep the exercise's own weak spot
  const spread = score >= 90 ? 0.3 : 1;
  return base.map((x) => ({ ...x, score: clamp(score + (x.score - mean) * spread) }));
}

/** The coach comment: the weakest step (or steps, when tied). Null when every step is perfect. */
export function coachFocus(items: StepScore[]) {
  const min = Math.min(...items.map((x) => x.score));
  const band = stepBand(min);
  if (band.key === "perfect") return null;
  const idx = items.map((x, i) => (x.score === min ? i : -1)).filter((i) => i >= 0);
  const many = idx.length > 1;
  const close: Record<StepBand["key"], string> = {
    perfect: "",
    almost: many ? "These steps matched the guide least, but they're very close. Next time, take them a little slower." : "This step matched the guide least, but it's very close. Next time, take it a little slower.",
    building: many ? "Good start. Focus on these steps next time and watch them improve. These steps matched the guide least, so go over them again in the exercise guide." : "Good start. Focus on this step next time and watch it improve. This step matched the guide least, so go over it again in the exercise guide.",
    practising: many ? "Every expert started here. Go slowly and it'll click. These steps matched the guide least, so go over them again in the exercise guide." : "Every expert started here. Go slowly and it'll click. This step matched the guide least, so go over it again in the exercise guide.",
  };
  return { band, idx, many, message: close[band.key] };
}
