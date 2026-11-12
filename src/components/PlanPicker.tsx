import { useState } from "react";
import { Check, User, Users, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PLANS, formatVND, priceFor, type BillingCycle, type Plan } from "@/lib/plans";

const ICONS = { freemium: Zap, individual: User, family: Users } as const;

export function BillingToggle({ cycle, onChange }: { cycle: BillingCycle; onChange: (c: BillingCycle) => void }) {
  const annual = cycle === "annual";
  return (
    <div className="mx-auto flex w-max items-center gap-3 rounded-full border border-border bg-card/60 py-2 pl-5 pr-4">
      <button
        type="button"
        onClick={() => onChange("monthly")}
        className={cn("text-sm font-semibold transition-colors", annual ? "text-muted-foreground" : "text-primary")}
      >
        Monthly
      </button>
      <button
        type="button"
        role="switch"
        aria-checked={annual}
        aria-label="Bill annually"
        onClick={() => onChange(annual ? "monthly" : "annual")}
        className="relative h-7 w-[52px] shrink-0 rounded-full border border-border bg-muted/70 transition-colors"
      >
        <span
          className={cn(
            "absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_10px] shadow-primary/50 transition-[left]",
            annual ? "left-[27px]" : "left-[3px]",
          )}
        />
      </button>
      <button type="button" onClick={() => onChange("annual")} className="text-left leading-tight">
        <span className={cn("block text-sm font-semibold transition-colors", annual ? "text-primary" : "text-muted-foreground")}>Annual</span>
        <span className="block text-[10px] font-semibold text-warning">Save up to 25%</span>
      </button>
    </div>
  );
}

function PlanCard({ plan, cycle }: { plan: Plan; cycle: BillingCycle }) {
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

      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="text-[28px] font-bold leading-none tracking-tight">{free ? "Free" : formatVND(price)}</span>
        <span className="text-sm text-muted-foreground">{free ? "forever" : cycle === "annual" ? "/ year" : "/ month"}</span>
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
        <button disabled className="mt-5 h-11 w-full rounded-xl border border-border text-sm font-medium text-muted-foreground">
          Current plan
        </button>
      ) : (
        <button
          type="button"
          onClick={() => toast.success(`${plan.name} plan · ${cycle === "annual" ? "Annual" : "Monthly"}`, { description: "Redirecting to secure payment…" })}
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

/** Monthly/annual toggle + plan cards. Cards sit side by side when there is room. */
export function PlanPicker({ className }: { className?: string }) {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  return (
    <div className={cn("@container space-y-5", className)}>
      <BillingToggle cycle={cycle} onChange={setCycle} />
      <div className="grid gap-3 @[620px]:grid-cols-3 @[620px]:items-stretch @[620px]:gap-4 @[620px]:pt-[26px]">
        {PLANS.map((p) => (
          <PlanCard key={p.id} plan={p} cycle={cycle} />
        ))}
      </div>
    </div>
  );
}
