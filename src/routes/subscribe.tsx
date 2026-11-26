import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ChevronLeft, ChevronRight, Ticket, Check, X, User, Users, Zap, TicketX } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useGoBack } from "@/hooks/useGoBack";
import { getPlan, priceFor, formatVND, type BillingCycle } from "@/lib/plans";
import { VOUCHERS, voucherFits, voucherRate, voucherUntil, type Voucher } from "@/lib/vouchers";

export const Route = createFileRoute("/subscribe")({
  validateSearch: z.object({
    plan: z.enum(["individual", "family"]).catch("individual"),
    cycle: z.enum(["monthly", "annual"]).catch("monthly"),
    /** preview only: open the voucher list with no vouchers */
    novouchers: z.coerce.string().optional(),
  }),
  component: SubscribePage,
});

const ICONS = { freemium: Zap, individual: User, family: Users } as const;
const vnd = (n: number) => `${n.toLocaleString("vi-VN")}đ`;

/* the bar at the bottom: actions stay in reach while the details scroll */
function Actions({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-auto border-t border-white/[0.06] bg-background/90 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl land:static land:mx-0 land:mt-2 land:border-0 land:bg-transparent land:p-0 land:backdrop-blur-0">
      <div className="flex gap-3">{children}</div>
    </div>
  );
}
const primaryBtn = "h-12 flex-1 rounded-2xl bg-gradient-to-r from-primary to-secondary text-[15px] font-semibold text-white shadow-[0_12px_28px_-14px] shadow-primary transition hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50";
const outlineBtn = "h-12 flex-1 rounded-2xl border border-white/[0.12] text-[15px] font-semibold text-foreground/85 transition hover:border-white/25 hover:bg-white/[0.04] hover:text-foreground active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60";

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <header className="relative flex h-12 items-center justify-center">
      <button onClick={onBack} aria-label="Back" className="absolute left-0 flex h-10 w-10 -ml-2 items-center justify-center rounded-full transition hover:bg-white/[0.08]">
        <ChevronLeft className="h-6 w-6" />
      </button>
      <h1 className="text-[16px] font-semibold">{title}</h1>
    </header>
  );
}

/** Subscribe: plan summary, optional voucher, what will be charged. */
function SubscribePage() {
  const { plan: planId, cycle, novouchers } = Route.useSearch();
  const navigate = useNavigate();
  const goBack = useGoBack("/account");
  const plan = getPlan(planId)!;
  const Icon = ICONS[plan.id];
  const price = priceFor(plan, cycle as BillingCycle);
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [picking, setPicking] = useState(false);
  const discount = voucher ? Math.round(price * voucherRate(voucher)) : 0;
  const charged = price - discount;
  useEffect(() => { window.scrollTo(0, 0); }, [picking]);

  if (picking) {
    return <VoucherPicker planId={plan.id} empty={!!novouchers} selected={voucher}
      onBack={() => setPicking(false)} onDone={(v) => { setVoucher(v); setPicking(false); }} />;
  }

  return (
    <div className="flex min-h-[calc(100dvh-40px)] flex-col desk:min-h-[calc(100dvh-80px)]">
      <Header title="Subscribe" onBack={goBack} />
      <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col gap-4 pt-3 land:grid land:max-w-none land:grid-cols-2 land:items-start land:gap-x-6 hinge-split">
        {/* plan */}
        <section className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-card px-5 pb-6 pt-7 text-center">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_22%,transparent),transparent_72%)]" />
          <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-[0_14px_34px_-12px] shadow-primary">
            <Icon className="h-7 w-7" />
          </span>
          <h2 className="relative mt-4 text-[20px] font-semibold tracking-tight">Subscribe to {plan.name}</h2>
          <div className="relative mt-1.5 text-[13px] text-muted-foreground">
            <span className="font-semibold text-foreground">{formatVND(price)}</span> / {cycle === "annual" ? "year" : "month"} · {cycle === "annual" ? "Annual" : "Monthly"}
          </div>
        </section>

        <div className="flex flex-1 flex-col gap-4">
        {/* voucher */}
        <button onClick={() => setPicking(true)}
          className="group flex w-full items-center gap-3 rounded-[20px] border border-white/[0.06] bg-card px-4 py-3.5 text-left transition hover:border-primary/30 hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-inset ring-primary/20"><Ticket className="h-[18px] w-[18px]" /></span>
          {voucher ? (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-semibold">{voucher.name}</span>
              <span className="mt-0.5 block text-[12px] text-success"><span className="font-mono font-semibold tracking-wider">{voucher.code}</span> · {voucher.off} applied</span>
            </span>
          ) : (
            <span className="flex-1 text-[14px] font-medium">Select voucher</span>
          )}
          {voucher ? (
            <span role="button" tabIndex={0} aria-label="Remove voucher" onClick={(e) => { e.stopPropagation(); setVoucher(null); }}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-white/[0.08] hover:text-foreground"><X className="h-4 w-4" /></span>
          ) : <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />}
        </button>

        {/* payment details */}
        <section>
          <h3 className="mb-2 px-1 text-[13px] font-semibold text-muted-foreground">Payment Details</h3>
          <div className="overflow-hidden rounded-[20px] border border-white/[0.06] bg-card">
            <div className="flex items-center justify-between px-4 py-3.5 text-[14px]">
              <span className="text-muted-foreground">Subscription</span>
              <span className="font-medium tabular-nums">{vnd(price)}</span>
            </div>
            {voucher && (
              <div className="flex items-center justify-between border-t border-white/[0.05] px-4 py-3.5 text-[14px] animate-in fade-in duration-300">
                <span className="text-muted-foreground">Voucher ({voucher.off.replace(/\s*OFF/i, "")})</span>
                <span className="font-medium tabular-nums text-success">−{vnd(discount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between bg-gradient-to-r from-primary/25 via-primary/10 to-secondary/20 px-4 py-4">
              <span className="text-[14px] font-semibold">Charged amount</span>
              <span key={charged} className="text-[18px] font-bold tabular-nums animate-in fade-in slide-in-from-bottom-1 duration-300">{vnd(charged)}</span>
            </div>
          </div>
        </section>

      <Actions>
        <button onClick={goBack} className={outlineBtn}>Cancel</button>
        <button className={primaryBtn} onClick={() => {
          toast.success(`Subscribed to ${plan.name}`, { description: "Redirecting to secure payment…" });
          navigate({ to: "/account", search: { tab: "plan" } });
        }}>Confirm</button>
      </Actions>
        </div>
      </div>
    </div>
  );
}

/** Vouchers: the ones that fit this plan, or a code typed in. */
function VoucherPicker({ planId, empty, selected, onBack, onDone }: {
  planId: string; empty: boolean; selected: Voucher | null; onBack: () => void; onDone: (v: Voucher | null) => void;
}) {
  const list = empty ? [] : VOUCHERS.filter((v) => v.status === "Active");
  const [pick, setPick] = useState<Voucher | null>(selected);
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const apply = () => {
    const v = VOUCHERS.find((x) => x.code.toLowerCase() === code.trim().toLowerCase());
    if (!v || v.status !== "Active") return setErr("This code isn't valid or has expired.");
    if (!voucherFits(v, planId)) return setErr("This code can't be used with this plan.");
    setErr(""); setPick(v); setCode(""); toast.success(`${v.code} applied`);
  };

  return (
    <div className="flex min-h-[calc(100dvh-40px)] flex-col desk:min-h-[calc(100dvh-80px)]">
      <Header title="Vouchers" onBack={onBack} />
      <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col gap-4 pt-3 land:grid land:max-w-none land:grid-cols-2 land:items-start land:gap-x-6 hinge-split">
        <section className="rounded-[22px] border border-white/[0.06] bg-card p-4">
          <h2 className="px-1 text-[14px] font-semibold">Available Vouchers</h2>
          {list.length ? (
            <ul role="radiogroup" className="mt-3 space-y-2.5">
              {list.map((v) => {
                const ok = voucherFits(v, planId);
                const on = pick?.code === v.code;
                return (
                  <li key={v.code}>
                    <button role="radio" aria-checked={on} disabled={!ok} onClick={() => setPick(on ? null : v)}
                      className={cn("flex w-full items-stretch overflow-hidden rounded-[16px] text-left ring-1 ring-inset transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                        on ? "bg-primary/[0.08] ring-primary/60" : "bg-white/[0.03] ring-white/[0.07] enabled:hover:ring-white/20",
                        !ok && "cursor-not-allowed opacity-50")}>
                      <span className="flex w-[76px] shrink-0 flex-col items-center justify-center bg-gradient-to-br from-primary/30 via-primary/15 to-secondary/25 py-3">
                        <span className="text-[20px] font-bold leading-none">{v.off.replace(/\s*OFF/i, "")}</span>
                        <span className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-foreground/75">Off</span>
                      </span>
                      <span className="min-w-0 flex-1 px-3.5 py-3">
                        <span className="block truncate text-[14px] font-semibold">{v.name}</span>
                        <span className="mt-0.5 block font-mono text-[12px] font-semibold tracking-wider text-foreground/70">{v.code}</span>
                        <span className="mt-1 block text-[11.5px] text-muted-foreground">{ok ? `Valid until ${voucherUntil(v)}` : "Individual plan only"}</span>
                      </span>
                      <span className="flex items-center pr-3.5">
                        <span className={cn("flex h-5 w-5 items-center justify-center rounded-full ring-[1.5px] ring-inset transition", on ? "bg-primary ring-primary" : "ring-white/25")}>
                          {on && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center py-6 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.05] text-muted-foreground ring-1 ring-inset ring-white/[0.08]"><TicketX className="h-5 w-5" /></span>
              <p className="mt-2.5 text-[13.5px] text-muted-foreground">No data</p>
            </div>
          )}
        </section>

        <div className="flex flex-1 flex-col gap-4">
        <section className="rounded-[22px] border border-white/[0.06] bg-card p-4">
          <div className="mb-4 flex items-center gap-3 text-[12px] text-muted-foreground">
            <span className="h-px flex-1 bg-white/[0.07]" /> Or Enter Manually <span className="h-px flex-1 bg-white/[0.07]" />
          </div>

          <label htmlFor="vcode" className="px-1 text-[13px] font-semibold">Voucher code</label>
          <div className="mt-2 flex gap-2">
            <input id="vcode" value={code} onChange={(e) => { setCode(e.target.value); setErr(""); }} onKeyDown={(e) => e.key === "Enter" && code.trim() && apply()}
              placeholder="EG: WELCOME50" autoCapitalize="characters"
              className={cn("h-11 min-w-0 flex-1 rounded-xl border bg-background/50 px-3.5 font-mono text-[14px] uppercase tracking-wider placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground/70 transition focus:outline-none focus:ring-2",
                err ? "border-destructive/60 focus:ring-destructive/30" : "border-white/10 hover:border-white/20 focus:border-primary/60 focus:ring-primary/30")} />
            <button onClick={apply} disabled={!code.trim()}
              className="h-11 shrink-0 rounded-xl border border-white/[0.12] px-5 text-[14px] font-semibold transition enabled:hover:border-primary/50 enabled:hover:bg-primary/10 enabled:hover:text-primary disabled:opacity-40">Apply</button>
          </div>
          <p className={cn("mt-2 px-1 text-[12px]", err ? "text-destructive" : "text-muted-foreground")}>
            {err || "Voucher codes are case-insensitive. Contact support if your code isn't working"}
          </p>
        </section>
      <Actions>
        <button className={primaryBtn} onClick={() => onDone(pick)}>OK</button>
      </Actions>
        </div>
      </div>
    </div>
  );
}
