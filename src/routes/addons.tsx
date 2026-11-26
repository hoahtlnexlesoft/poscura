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

  const perHour = Math.round(chosen.price / chosen.hours / 100) * 100;

  return (
    <div className="flex min-h-[calc(100dvh-40px)] flex-col desk:min-h-[calc(100dvh-80px)]">
      <Header title="Get Add-on" onBack={goBack} />
      <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col gap-4 pt-3 land:grid land:max-w-none land:grid-cols-2 land:items-start land:gap-x-6 hinge-split">

        {/* ---------- the packages ---------- */}
        <section className="relative overflow-hidden rounded-[26px] border border-white/[0.07] bg-gradient-to-b from-[#0f1c33] to-card p-5">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/25 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-[0_12px_30px_-12px] shadow-primary"><Clock className="h-6 w-6" /></span>
            <div className="min-w-0">
              <h2 className="text-[19px] font-semibold leading-tight tracking-tight">Get Add-on</h2>
              <p className="mt-0.5 text-[13px] text-muted-foreground">Choose a monitoring hours package that fits your needs.</p>
            </div>
          </div>

          <ul role="radiogroup" aria-label="Monitoring hours" className="relative mt-5 space-y-2.5">
            {PACKS.map((p) => {
              const on = pick === p.id;
              return (
                <li key={p.id}>
                  <button role="radio" aria-checked={on} onClick={() => setPick(p.id)}
                    className={cn("group flex w-full items-center gap-4 rounded-[18px] p-3 pr-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                      on ? "bg-gradient-to-r from-primary/[0.16] to-secondary/[0.06] ring-[1.5px] ring-inset ring-primary shadow-[0_12px_30px_-16px] shadow-primary"
                        : "bg-white/[0.035] ring-1 ring-inset ring-white/[0.07] hover:bg-white/[0.05] hover:ring-white/20")}>
                    {/* hours as the hero number */}
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
        </section>

        {/* ---------- the order ---------- */}
        <div className="flex flex-1 flex-col">
          <section className="rounded-[26px] border border-white/[0.07] bg-card p-5">
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Payment Details</h3>
            <dl className="mt-3 space-y-3 text-[14px]">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Add-on</dt>
                <dd key={chosen.id} className="font-medium animate-in fade-in duration-300">{chosen.hours} monitoring hours</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Price per hour</dt>
                <dd className="font-medium tabular-nums">{vnd(perHour)}</dd>
              </div>
            </dl>
            <div className="mt-4 flex items-end justify-between border-t border-white/[0.07] pt-4">
              <span className="text-[14px] font-semibold">Charged amount</span>
              <span key={chosen.price} className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-[26px] font-bold leading-none tracking-tight text-transparent tabular-nums animate-in fade-in slide-in-from-bottom-1 duration-300">{vnd(chosen.price)}</span>
            </div>
            <div className="mt-6 hidden flex-col gap-2 land:flex">
              <button className={cn(primaryBtn, "flex-none")} onClick={purchase}>Purchase</button>
              <button onClick={goBack} className="h-11 rounded-2xl text-[14px] font-semibold text-muted-foreground transition hover:bg-white/[0.05] hover:text-foreground">Cancel</button>
            </div>
          </section>

          {/* phones: actions stay at the bottom of the screen */}
          <div className="sticky bottom-0 z-20 mt-auto pt-4 land:hidden">
            <Actions>
              <button onClick={goBack} className={outlineBtn}>Cancel</button>
              <button className={primaryBtn} onClick={purchase}>Purchase</button>
            </Actions>
          </div>
        </div>
      </div>
    </div>
  );
}
