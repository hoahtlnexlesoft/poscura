import { useEffect, useState } from "react";
import { SubscribeSheet } from "@/components/SubscribeSheet";
import { Check, User, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLANS, formatVND, priceFor, ANNUAL_DISCOUNT, type BillingCycle, type Plan } from "@/lib/plans";

const ICONS = { freemium: Zap, individual: User, family: Users } as const;

export function BillingToggle({ cycle, onChange }: { cycle: BillingCycle; onChange: (c: BillingCycle) => void }) {
  const annual = cycle === "annual";
  const seg = (on: boolean) =>
    cn("relative z-10 flex h-9 min-w-[112px] items-center justify-center gap-1.5 rounded-full px-5 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
      on ? "text-white" : "text-muted-foreground hover:text-foreground");
  return (
    /* segmented control: the sliding pill shows the chosen cycle */
    <div role="radiogroup" aria-label="Billing cycle" className="relative mx-auto mt-2 grid w-max grid-cols-2 rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
      <span aria-hidden className={cn("absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-gradient-to-r from-primary to-secondary shadow-[0_6px_18px_-6px] shadow-primary/60 transition-transform duration-300", annual && "translate-x-full")} />
      <button type="button" role="radio" aria-checked={!annual} onClick={() => onChange("monthly")} className={seg(!annual)}>Monthly</button>
      <button type="button" role="radio" aria-checked={annual} onClick={() => onChange("annual")} className={seg(annual)}>
        Annual
        {/* saving tag rides on the segment's corner, so the control stays compact in narrow columns */}
        <span className="pointer-events-none absolute -top-2.5 right-1 whitespace-nowrap rounded-full bg-warning px-1.5 py-px text-[9.5px] font-bold text-[#1b1406] shadow-[0_4px_10px_-4px_rgba(0,0,0,.6)]">Save up to 25%</span>
      </button>
    </div>
  );
}

function PlanCard({ plan, cycle, onSubscribe }: { plan: Plan; cycle: BillingCycle; onSubscribe?: (id: string) => void }) {
  const Icon = ICONS[plan.id];
  const price = priceFor(plan, cycle);
  const free = plan.monthly === 0;
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-card/70 p-5",
        plan.current && "border-warning/80",
        plan.highlighted && "border-primary/40 shadow-[0_10px_40px_-12px] shadow-primary/40",
        !plan.current && !plan.highlighted && "border-border",
        plan.badge && "mt-[26px] @[620px]:mt-0",
      )}
    >
      {plan.badge && (
        <span className="absolute -top-[26px] left-4 rounded-t-lg bg-gradient-to-r from-primary to-secondary px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          {plan.badge}
        </span>
      )}
      <div className="flex items-center gap-2">
        <Icon className="h-[18px] w-[18px] text-primary" fill={plan.id === "freemium" ? "currentColor" : "none"} />
        <span className="text-base font-bold uppercase tracking-wide">{plan.name}</span>
      </div>
      <p className="mt-0.5 min-h-[16px] text-[11px] text-muted-foreground">{plan.note}</p>

      {/* keyed by cycle so the price visibly swaps when Monthly / Annual changes */}
      <div key={cycle} className="mt-4 animate-in fade-in slide-in-from-bottom-1 duration-300">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[28px] font-bold leading-none tracking-tight">{free ? "Free" : formatVND(price)}</span>
          <span className="text-sm text-muted-foreground">{free ? "forever" : cycle === "annual" ? "/ year" : "/ month"}</span>
        </div>
        {!free && cycle === "annual" && (
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px]">
            <span className="text-muted-foreground line-through">{formatVND(plan.monthly * 12)}</span>
            <span className="rounded-full bg-warning/15 px-1.5 py-px text-[10.5px] font-bold text-warning">Save {Math.round(ANNUAL_DISCOUNT * 100)}%</span>
            <span className="text-muted-foreground">≈ {formatVND(Math.round(price / 12 / 1000) * 1000)} / month</span>
          </div>
        )}
      </div>

      <ul className="mt-4 flex-1 space-y-2 text-[13px]">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" strokeWidth={3} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {plan.current ? (
        <button disabled className="mt-5 h-11 w-full rounded-xl border border-border text-sm font-medium text-muted-foreground transition hover:border-primary/40 hover:bg-white/[0.04] hover:text-foreground">
          Current plan
        </button>
      ) : free ? (
        // already on a paid plan: nothing to buy here (downgrading is "Cancel plan" on the current plan)
        null
      ) : (
        <button
          type="button"
          onClick={() => onSubscribe?.(plan.id)}
          className={cn(
            "mt-5 h-11 w-full rounded-xl text-sm font-semibold transition hover:opacity-90 active:scale-[0.98]",
            plan.highlighted
              ? "bg-gradient-to-r from-primary to-secondary text-white"
              : "border border-primary text-primary hover:bg-primary/10",
          )}
        >
          Subscribe
        </button>
      )}
    </div>
  );
}

/** Plan cards only; side by side when there is room. */
export function PlanCards({ cycle, className, currentId, onSubscribe }: { cycle: BillingCycle; className?: string; currentId?: string; onSubscribe?: (id: string) => void }) {
  return (
    <div className={cn("@container", className)}>
      <div className="grid gap-3 @[620px]:grid-cols-3 @[620px]:items-stretch @[620px]:gap-4 @[620px]:pt-[26px]">
        {PLANS.map((p) => (
          <PlanCard key={p.id} plan={currentId ? { ...p, current: p.id === currentId } : p} cycle={cycle} onSubscribe={onSubscribe} />
        ))}
      </div>
    </div>
  );
}

/** Monthly/annual toggle + plan cards. */
/** currentId marks which card is the user's plan (defaults to the one flagged in PLANS) */
export function PlanPicker({ className, currentId, heading, subscribe, emptyVouchers, manyVouchers }: {
  className?: string; currentId?: string; heading?: React.ReactNode;
  /** open the checkout sheet for this plan right away (deep links / preview screens) */
  subscribe?: string; emptyVouchers?: boolean; manyVouchers?: boolean;
}) {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [sheet, setSheet] = useState<string | null>(subscribe ?? null);
  useEffect(() => { setSheet(subscribe ?? null); }, [subscribe]);
  return (
    <div className={cn("space-y-5", className)}>
      {heading ? (
        /* heading and the switch share one row on wide screens, so the cards fit without scrolling */
        <div className="flex flex-col items-center gap-4 fold:flex-row fold:justify-between fold:gap-6">
          {heading}
          <div className="pt-1.5 [&>div]:mx-0"><BillingToggle cycle={cycle} onChange={setCycle} /></div>
        </div>
      ) : <BillingToggle cycle={cycle} onChange={setCycle} />}
      <PlanCards cycle={cycle} currentId={currentId} onSubscribe={setSheet} />
      <SubscribeSheet planId={sheet} cycle={cycle} open={!!sheet} onOpenChange={(o) => !o && setSheet(null)} emptyVouchers={emptyVouchers} manyVouchers={manyVouchers} />
    </div>
  );
}
