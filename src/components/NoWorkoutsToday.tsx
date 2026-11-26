import { Dumbbell } from "lucide-react";
import { NoWorkoutsArt } from "@/components/EmptyArt";
import { cn } from "@/lib/utils";

/** Today's sessions before a program schedule exists (after the first scan report).
 *  Same header as the filled card, so the page doesn't change shape between states. */
export function NoWorkoutsToday({ className }: { className?: string }) {
  return (
    <section className={cn("relative flex flex-col overflow-hidden rounded-[22px] bg-card p-4 desk:p-5", className)}>
      <div className="flex items-center gap-2">
        <Dumbbell className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold desk:text-[15px]">Today's Sessions</h2>
      </div>
      <div className="relative flex flex-1 flex-col items-center justify-center py-8 text-center">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-[60%] rounded-full bg-primary/10 blur-3xl" />
        <NoWorkoutsArt className="relative w-[150px] fold:w-[170px]" />
        <h3 className="relative mt-5 text-[15px] font-semibold tracking-tight">No Workouts Today</h3>
      </div>
    </section>
  );
}
