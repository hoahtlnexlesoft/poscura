import { Dumbbell } from "lucide-react";
import { NoWorkoutsArt } from "@/components/EmptyArt";
import { cn } from "@/lib/utils";

/** Today's sessions before a program schedule exists (after the first scan report).
 *  Same header as the filled card, so the page doesn't change shape between states. */
export function NoWorkoutsToday({ className }: { className?: string }) {
  return (
    <section className={cn("relative flex flex-col px-1 py-2 desk:px-2", className)}>
      <div className="flex items-center gap-2">
        <Dumbbell className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold desk:text-[15px]">Today's Sessions</h2>
      </div>
      <div className="relative flex flex-1 flex-col items-center justify-center py-8 text-center">
                <NoWorkoutsArt className="relative w-[180px] fold:w-[210px]" />
        <h3 className="relative mt-4 text-[16px] font-semibold tracking-tight">No Workouts Today</h3>
      </div>
    </section>
  );
}
