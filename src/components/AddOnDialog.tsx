import { useEffect, useState } from "react";
import { Check, Clock, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { primaryBtn } from "@/components/CheckoutBits";

/** Monitoring-hour packages, as in the live app. */
export const PACKS = [
  { id: "h5", hours: 5, price: 96000 },
  { id: "h10", hours: 10, price: 154000 },
  { id: "h15", hours: 15, price: 231000, sale: "Sale 20%", popular: true },
];
const vnd = (n: number) => `₫${n.toLocaleString("en-US")}`;

/** Get Add-on as a popup over the Plan tab (a bottom sheet on phones). */
export function AddOnDialog({ open, onOpenChange, onPurchased }: {
  open: boolean; onOpenChange: (v: boolean) => void; onPurchased?: (p: (typeof PACKS)[number]) => void;
}) {
  const [pick, setPick] = useState(PACKS[0].id);
  useEffect(() => { if (open) setPick(PACKS[0].id); }, [open]);
  const chosen = PACKS.find((p) => p.id === pick)!;
  const purchase = () => {
    onOpenChange(false);
    onPurchased?.(chosen);
    toast.success(`${chosen.hours} hours added`, { description: "Redirecting to secure payment…" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(680px,calc(100dvh-32px))] max-w-[440px] flex-col gap-0 overflow-hidden rounded-[28px] border-white/[0.08] bg-[#0e1524] p-0 shadow-[0_40px_100px_-30px_rgba(0,0,0,.9)] [&>button:last-child]:hidden max-[599px]:inset-x-0 max-[599px]:bottom-0 max-[599px]:top-auto max-[599px]:w-full max-[599px]:max-w-none max-[599px]:max-h-[88dvh] max-[599px]:translate-x-0 max-[599px]:translate-y-0 max-[599px]:rounded-b-none max-[599px]:border-x-0 max-[599px]:border-b-0 max-[599px]:data-[state=open]:slide-in-from-bottom-1/2 max-[599px]:data-[state=closed]:slide-out-to-bottom-1/2 max-[599px]:data-[state=open]:zoom-in-100 max-[599px]:data-[state=closed]:zoom-out-100">
        <div className="relative px-5 pb-4 pt-5">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(70%_100%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_18%,transparent),transparent)]" />
          <div className="relative flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-[0_12px_30px_-12px] shadow-primary"><Clock className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-[18px] font-semibold tracking-tight">Get Add-on</DialogTitle>
              <DialogDescription className="mt-0.5 text-[13px] leading-snug text-muted-foreground">Choose a monitoring hours package that fits your needs.</DialogDescription>
            </div>
            <button onClick={() => onOpenChange(false)} aria-label="Close" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] text-muted-foreground transition hover:border-white/20 hover:text-foreground"><X className="h-4 w-4" /></button>
          </div>
        </div>

        <ul role="radiogroup" aria-label="Monitoring hours" className="mac-scroll flex-1 space-y-2.5 overflow-y-auto px-5 pb-5">
          {PACKS.map((p) => {
            const on = pick === p.id;
            return (
              <li key={p.id}>
                <button role="radio" aria-checked={on} onClick={() => setPick(p.id)}
                  className={cn("group flex w-full items-center gap-4 rounded-[18px] p-3 pr-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                    on ? "bg-gradient-to-r from-primary/[0.16] to-secondary/[0.06] ring-[1.5px] ring-inset ring-primary shadow-[0_12px_30px_-16px] shadow-primary"
                      : "bg-white/[0.035] ring-1 ring-inset ring-white/[0.07] hover:bg-white/[0.05] hover:ring-white/20")}>
                  <span className={cn("flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl transition",
                    on ? "bg-gradient-to-br from-primary to-secondary text-white" : "bg-white/[0.05] text-foreground ring-1 ring-inset ring-white/[0.08]")}>
                    <span className="text-[20px] font-bold leading-none tabular-nums">{p.hours}</span>
                    <span className="mt-0.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] opacity-80">hours</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[14.5px] font-semibold">{p.hours} hours</span>
                      {p.sale && <span className="rounded-full bg-lime-300/10 px-2 py-px text-[10.5px] font-semibold text-lime-300 ring-1 ring-inset ring-lime-300/40">{p.sale}</span>}
                      {p.popular && <span className="rounded-full bg-gradient-to-r from-primary to-secondary px-2 py-px text-[10.5px] font-semibold text-white">Most popular</span>}
                    </span>
                    <span className="mt-1 block text-[17px] font-bold tabular-nums tracking-tight">{vnd(p.price)}</span>
                  </span>
                  <span className={cn("flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full transition", on ? "bg-primary shadow-[0_0_0_4px] shadow-primary/20" : "ring-[1.5px] ring-inset ring-white/25 group-hover:ring-white/40")}>
                    {on && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* footer: the total and the one action */}
        <div className="flex items-center gap-4 border-t border-white/[0.06] bg-white/[0.02] px-5 pb-[max(18px,env(safe-area-inset-bottom))] pt-4">
          <div key={chosen.id} className="min-w-0 flex-1 animate-in fade-in slide-in-from-bottom-1 duration-300">
            <div className="text-[11.5px] text-muted-foreground">{chosen.hours} monitoring hours</div>
            <div className="text-[19px] font-bold tabular-nums">{vnd(chosen.price)}</div>
          </div>
          <button className={cn(primaryBtn, "h-12 flex-none px-7")} onClick={purchase}>Purchase</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
