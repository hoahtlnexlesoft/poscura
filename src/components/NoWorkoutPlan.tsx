import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import noPlan from "@/assets/no-plan.png";

/** Workout before the first posture scan: there's no plan yet, monitoring creates it. Light, centred, no box. */
export function NoWorkoutPlan() {
  return (
    <section className="relative flex min-h-[calc(100dvh-220px)] flex-col items-center justify-center px-6 py-10 text-center">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-[62%] rounded-full bg-primary/10 blur-3xl" />
      <img src={noPlan} alt="" className="relative w-[180px] opacity-95 fold:w-[200px]" />
      <h2 className="relative mt-6 text-[18px] font-semibold tracking-tight">No Workouts Plan</h2>
      <p className="relative mt-1.5 max-w-[300px] text-[13px] leading-relaxed text-muted-foreground">Run monitoring to receive a personalized workout.</p>
      <Link to="/posture-monitor"
        className="relative mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-5 text-[13.5px] font-semibold text-white shadow-[0_10px_24px_-14px] shadow-primary transition hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
        <Play className="h-3.5 w-3.5 fill-current" /> Start Monitoring
      </Link>
    </section>
  );
}
