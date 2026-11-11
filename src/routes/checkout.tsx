import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Check, Crown, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PLANS, getPlan } from "@/lib/plans";
import { cn } from "@/lib/utils";

const searchSchema = z.object({ plan: z.string().optional() });

export const Route = createFileRoute("/checkout")({
  validateSearch: searchSchema,
  component: CheckoutPage,
});

function CheckoutPage() {
  const { plan: planParam } = Route.useSearch();
  const navigate = useNavigate();

  const initial = useMemo(() => {
    const fromParam = planParam && getPlan(planParam);
    if (fromParam && !fromParam.current) return fromParam.id;
    return PLANS.find((p) => p.highlighted && !p.current)?.id ?? PLANS[1].id;
  }, [planParam]);

  const [selected, setSelected] = useState(initial);
  const plan = getPlan(selected) ?? PLANS[1];

  const tax = +(plan.priceNumeric * 0.13).toFixed(2);
  const total = +(plan.priceNumeric + tax).toFixed(2);

  return (
    <div className="space-y-4 fold:grid fold:grid-cols-[1.15fr_1fr] fold:gap-x-5 fold:gap-y-4 fold:space-y-0 fold:items-start">
      <Button variant="ghost" size="sm" asChild className="fold:col-span-2 fold:justify-self-start">
        <Link to="/account"><ArrowLeft className="h-4 w-4" /> Back</Link>
      </Button>

      <div className="fold:col-span-2">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" /> Checkout
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Complete payment to upgrade.</p>
      </div>

      <section className="glass-card p-4 fold:col-start-1">
        <h2 className="text-sm font-semibold mb-3">Select plan</h2>
        <RadioGroup value={selected} onValueChange={setSelected} className="space-y-2">
          {PLANS.filter((p) => !p.current).map((p) => (
            <label key={p.id} htmlFor={`plan-${p.id}`}
              className={cn("flex items-start gap-3 rounded-xl border p-3 cursor-pointer",
                selected === p.id ? "border-primary/60 bg-primary/5" : "border-border")}>
              <RadioGroupItem id={`plan-${p.id}`} value={p.id} className="mt-1" />
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="font-semibold text-sm">{p.name}</div>
                  <div><span className="text-base font-bold">{p.price}</span><span className="text-[10px] text-muted-foreground ml-1">{p.cadence}</span></div>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{p.tagline}</div>
              </div>
            </label>
          ))}
        </RadioGroup>
      </section>

      <section className="glass-card p-4 fold:col-start-1">
        <h2 className="text-sm font-semibold mb-3">Billing</h2>
        <div className="space-y-3">
          <Field id="name" label="Full name" defaultValue="Sam Miller" />
          <Field id="email" label="Email" defaultValue="sam@poscura.app" type="email" />
          <Field id="address" label="Address" defaultValue="123 Posture Lane" />
        </div>
      </section>

      <section className="glass-card p-4 fold:col-start-1">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Lock className="h-4 w-4" /> Payment
        </h2>
        <div className="space-y-3">
          <Field id="card" label="Card number" defaultValue="4242 4242 4242 4242" />
          <div className="grid grid-cols-2 gap-3">
            <Field id="exp" label="Expiry" defaultValue="08/27" />
            <Field id="cvc" label="CVC" defaultValue="123" />
          </div>
        </div>
      </section>

      <section className="glass-card p-4 fold:col-start-2 fold:row-start-3 fold:row-span-3 fold:sticky fold:top-[72px]">
        <h2 className="text-sm font-semibold mb-3">Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span>{plan.name}</span><span className="font-bold">{plan.price}</span></div>
          <ul className="text-xs space-y-1 pt-2 border-t border-border">
            {plan.features.slice(0, 3).map((f) => (
              <li key={f} className="flex items-start gap-2"><Check className="h-3.5 w-3.5 text-secondary shrink-0 mt-0.5" /><span>{f}</span></li>
            ))}
          </ul>
          <div className="pt-2 border-t border-border space-y-1 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${plan.priceNumeric.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>${tax.toFixed(2)}</span></div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-border"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </div>
          <Button className="w-full mt-2" onClick={() => navigate({ to: "/account" })}>Pay ${total.toFixed(2)}</Button>
        </div>
      </section>
    </div>
  );
}

function Field({ id, label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { id: string; label: string }) {
  return (
    <div>
      <Label htmlFor={id} className="text-[11px] text-muted-foreground">{label}</Label>
      <Input id={id} className="mt-1" {...props} />
    </div>
  );
}
