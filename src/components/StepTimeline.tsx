import { cn } from "@/lib/utils";

/** Vertical stepper used across exercise screens (matches the web app):
 *  filled blue start, outlined middle steps, green finish, joined by a line. */
export function StepTimeline({ items, className }: { items: { title: string; text: string }[]; className?: string }) {
  return (
    <ol className={cn("animate-in fade-in px-1 pt-1 duration-300", className)}>
      {items.map((st, idx) => {
        const first = idx === 0, last = idx === items.length - 1 && items.length > 1;
        return (
          <li key={idx} className="relative flex gap-4 pb-5 last:pb-0">
            {idx < items.length - 1 && <span aria-hidden className="absolute bottom-0 left-[15px] top-8 w-px bg-gradient-to-b from-primary/60 to-primary/25" />}
            <span className={cn(
              "relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold tabular-nums",
              first ? "bg-primary text-white shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-primary)_18%,transparent)]"
                : last ? "bg-success text-white shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-success)_18%,transparent)]"
                : "border-[1.5px] border-primary bg-background text-primary",
            )}>{idx + 1}</span>
            <div className="min-w-0 pt-1">
              <div className="text-[14px] font-semibold leading-tight">{st.title}</div>
              {st.text && <div className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{st.text}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
