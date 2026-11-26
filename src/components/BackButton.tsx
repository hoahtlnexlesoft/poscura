import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/** The one Back button used on every page: a round, outlined 36px button with a chevron. */
export function BackButton({ onClick, className, label = "Back" }: { onClick?: () => void; className?: string; label?: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label}
      className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] text-foreground/80 transition hover:border-primary/40 hover:bg-white/[0.04] hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60", className)}>
      <ChevronLeft className="h-[18px] w-[18px]" />
    </button>
  );
}
