import { History } from "lucide-react";

/** History before any program has ended: one quiet line, nothing to act on yet. */
export function NoHistory() {
  return (
    <div className="flex items-center gap-3 rounded-[16px] bg-white/[0.02] px-3.5 py-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-muted-foreground ring-1 ring-inset ring-white/[0.08]"><History className="h-[18px] w-[18px]" /></span>
      <div className="min-w-0">
        <div className="text-[13.5px] font-semibold">No history yet</div>
        <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">Programs you finish will show up here.</p>
      </div>
    </div>
  );
}
