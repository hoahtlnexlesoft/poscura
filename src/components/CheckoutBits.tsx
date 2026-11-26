import { ChevronLeft } from "lucide-react";
import { BackButton } from "@/components/BackButton";

/* Shared by the checkout screens (Subscribe, Vouchers, Get Add-on). */

/* the bar at the bottom: actions stay in reach while the details scroll */
export function Actions({ children, note }: { children: React.ReactNode; note?: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-auto border-t border-white/[0.06] bg-background/90 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl land:static land:mx-0 land:mt-2 land:border-0 land:bg-transparent land:p-0 land:backdrop-blur-0">
      {note}
      <div className="flex gap-3">{children}</div>
    </div>
  );
}
export const primaryBtn = "h-12 flex-1 rounded-2xl bg-gradient-to-r from-primary to-secondary text-[15px] font-semibold text-white shadow-[0_12px_28px_-14px] shadow-primary transition hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50";
export const outlineBtn = "h-12 flex-1 rounded-2xl border border-white/[0.12] text-[15px] font-semibold text-foreground/85 transition hover:border-white/25 hover:bg-white/[0.04] hover:text-foreground active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60";

export function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <header className="page-head flex items-center gap-3">
      <BackButton onClick={onBack} />
      <h1 className="text-[17px] font-semibold">{title}</h1>
    </header>
  );
}

