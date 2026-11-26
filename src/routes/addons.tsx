import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useGoBack } from "@/hooks/useGoBack";
import { Actions, Header, primaryBtn, outlineBtn } from "@/components/CheckoutBits";

export const Route = createFileRoute("/addons")({ component: GetAddOn });

/** Monitoring-hour packages, as in the live app. */
const PACKS = [
  { id: "h5", hours: 5, price: 96000 },
  { id: "h10", hours: 10, price: 154000 },
  { id: "h15", hours: 15, price: 231000, sale: "Sale 20%", popular: true },
];
const vnd = (n: number) => `₫${n.toLocaleString("en-US")}`;

function GetAddOn() {
  const navigate = useNavigate();
  const goBack = useGoBack("/account");
  const [pick, setPick] = useState(PACKS[0].id);
  const chosen = PACKS.find((p) => p.id === pick)!;
  const purchase = () => {
    toast.success(`${chosen.hours} hours added`, { description: "Redirecting to secure payment…" });
    navigate({ to: "/account", search: { tab: "plan" } });
  };

  return (
    <div className="flex min-h-[calc(100dvh-40px)] flex-col desk:min-h-[calc(100dvh-80px)]">
      <Header title="Get Add-on" onBack={goBack} />
      <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col gap-4 pt-3">
        <section className="relative overflow-hidden rounded-[26px] border border-white/[0.07] bg-card p-5">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_20%,transparent),transparent_72%)]" />
          <div className="relative flex flex-col items-center px-2 pb-2 pt-3 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-[0_12px_30px_-12px] shadow-primary"><Clock className="h-6 w-6" /></span>
            <h2 className="mt-4 text-[20px] font-semibold tracking-tight">Get Add-on</h2>
            <p className="mt-1 text-[13.5px] text-muted-foreground">Choose a monitoring hours package that fits your needs.</p>
          </div>

          <ul role="radiogroup" aria-label="Monitoring hours" className="relative mt-5 space-y-2.5">
            {PACKS.map((p) => {
              const on = pick === p.id;
              return (
                <li key={p.id}>
                  <button role="radio" aria-checked={on} onClick={() => setPick(p.id)}
                    className={cn("flex w-full items-center gap-4 rounded-[18px] px-4 py-3.5 text-left ring-1 ring-inset transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                      on ? "bg-primary/[0.08] ring-primary/60 shadow-[0_10px_30px_-18px] shadow-primary" : "bg-white/[0.03] ring-white/[0.07] hover:ring-white/20")}>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[15px] font-semibold">{p.hours} hours</span>
                        {p.sale && <span className="rounded-full px-2 py-px text-[11px] font-semibold text-lime-300 ring-1 ring-inset ring-lime-300/50">{p.sale}</span>}
                        {p.popular && <span className="rounded-full bg-gradient-to-r from-primary to-secondary px-2 py-px text-[11px] font-semibold text-white">Most popular</span>}
                      </span>
                      <span className="mt-1 block text-[18px] font-bold tabular-nums tracking-tight">{vnd(p.price)}</span>
                    </span>
                    <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-[1.5px] ring-inset transition", on ? "bg-primary ring-primary" : "ring-white/25")}>
                      {on && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <Actions>
          <button onClick={goBack} className={outlineBtn}>Cancel</button>
          <button className={primaryBtn} onClick={purchase}>Purchase</button>
        </Actions>
      </div>
    </div>
  );
}
