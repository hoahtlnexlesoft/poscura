import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import noPlan from "@/assets/no-plan.png";

/** Workout before the first posture scan: there's no plan yet, monitoring creates it. */
export function NoWorkoutPlan() {
  return (
    <section className="relative mx-auto flex max-w-[880px] flex-col items-center overflow-hidden rounded-[28px] border border-white/[0.07] bg-gradient-to-b from-[#0d1b33] to-card px-6 pb-9 pt-10 text-center">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-8 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
      <img src={noPlan} alt="" className="relative w-[230px] fold:w-[270px]" />
      <h2 className="relative mt-7 text-[22px] font-semibold tracking-tight">No Workouts Plan</h2>
      <p className="relative mt-2 max-w-[360px] text-[14px] leading-relaxed text-muted-foreground">Run monitoring to receive a personalized workout.</p>
      <Link to="/posture-monitor"
        className="relative mt-7 inline-flex h-12 w-full max-w-[280px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-8 text-[15px] font-semibold text-white shadow-[0_14px_32px_-14px] shadow-primary transition hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
        <Play className="h-4 w-4 fill-current" /> Start Monitoring
      </Link>
    </section>
  );
}
