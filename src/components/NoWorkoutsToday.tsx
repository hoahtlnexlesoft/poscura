import noWorkouts from "@/assets/no-workouts.png";
import { cn } from "@/lib/utils";

/** Today's sessions before a program schedule exists (after the first scan report). */
export function NoWorkoutsToday({ className }: { className?: string }) {
  return (
    <section className={cn("relative flex flex-col items-center overflow-hidden rounded-[22px] border border-white/[0.06] bg-card px-6 py-10 text-center", className)}>
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-8 h-56 w-56 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <img src={noWorkouts} alt="" className="relative h-40 w-40 rounded-full fold:h-48 fold:w-48" />
      <h2 className="relative mt-6 text-[18px] font-semibold tracking-tight">No Workouts Today</h2>
    </section>
  );
}
