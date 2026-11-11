import { Check, Crown } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PLANS } from "@/lib/plans";

export function PlansDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Crown className="h-5 w-5 text-primary" />
            Choose your plan
          </DialogTitle>
          <DialogDescription>
            Personal plans to keep your posture aligned at every moment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-2xl border p-4 flex flex-col",
                plan.highlighted
                  ? "border-primary/60 bg-gradient-to-br from-primary/10 to-secondary/5 shadow-lg"
                  : "border-border bg-card"
              )}
            >
              {plan.badge && (
                <span className="absolute -top-2.5 left-4 text-[10px] font-semibold uppercase tracking-wider bg-gradient-to-r from-primary to-secondary text-primary-foreground px-2 py-0.5 rounded-full">
                  {plan.badge}
                </span>
              )}
              <div className="flex items-baseline justify-between">
                <div className="text-sm font-medium text-muted-foreground">{plan.name}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-xs text-muted-foreground">{plan.cadence}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{plan.tagline}</p>

              <ul className="mt-3 space-y-1.5 text-sm flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                    <span className="text-xs">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild={!plan.current}
                className={cn(
                  "mt-4 w-full",
                  plan.highlighted &&
                    "bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90"
                )}
                variant={plan.highlighted ? "default" : "outline"}
                disabled={plan.current}
              >
                {plan.current ? (
                  <span>{plan.cta}</span>
                ) : (
                  <Link to="/checkout" search={{ plan: plan.id }} onClick={() => onOpenChange(false)}>
                    {plan.cta}
                  </Link>
                )}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
