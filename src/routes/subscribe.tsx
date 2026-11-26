import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ChevronLeft, ChevronRight, Ticket, Check, X, User, Users, Zap, TicketX } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useGoBack } from "@/hooks/useGoBack";
import { Actions, Header, primaryBtn, outlineBtn } from "@/components/CheckoutBits";
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

/** Subscribe: the plan on one side (what you get), the order on the other (voucher, total, confirm). */
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
  const per = cycle === "annual" ? "year" : "month";
  const confirm = () => {
    toast.success(`Subscribed to ${plan.name}`, { description: "Redirecting to secure payment…" });
    navigate({ to: "/account", search: { tab: "plan" } });
  };

  return (
    <div className="flex min-h-[calc(100dvh-40px)] flex-col desk:min-h-[calc(100dvh-80px)]">
      <Header title="Subscribe" onBack={goBack} />
      <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col gap-4 pt-3 land:grid land:max-w-none land:grid-cols-2 land:items-start land:gap-x-6 hinge-split">

        {/* ---------- the plan: what you're getting ---------- */}
        <section className="relative overflow-hidden rounded-[26px] border border-white/[0.07] bg-gradient-to-b from-[#0f1c33] to-card p-6">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/25 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-secondary/15 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-[0_12px_30px_-12px] shadow-primary"><Icon className="h-6 w-6" /></span>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Subscribe to</div>
              <h2 className="text-[22px] font-semibold leading-tight tracking-tight">{plan.name}</h2>
            </div>
            <span className="ml-auto rounded-full bg-white/[0.06] px-2.5 py-1 text-[11.5px] font-semibold text-foreground/80 ring-1 ring-inset ring-white/10">{cycle === "annual" ? "Annual" : "Monthly"}</span>
          </div>
          <div className="relative mt-6 flex items-baseline gap-1.5">
            <span className="text-[34px] font-bold leading-none tracking-tight">{formatVND(price)}</span>
            <span className="text-[14px] text-muted-foreground">/ {per}</span>
          </div>
          {plan.note && <p className="relative mt-1.5 text-[12.5px] text-muted-foreground">{plan.note}</p>}
          <ul className="relative mt-6 space-y-3 border-t border-white/[0.07] pt-5">
            {plan.features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-[14px]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15"><Check className="h-3 w-3 text-success" strokeWidth={3} /></span>{f}
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- the order: voucher, payment details, confirm ---------- */}
        <div className="flex flex-1 flex-col">
          <section className="rounded-[26px] border border-white/[0.07] bg-card p-5">
            <button onClick={() => setPicking(true)}
              className={cn("group flex w-full items-center gap-3 rounded-[16px] border border-dashed px-3.5 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                voucher ? "border-success/40 bg-success/[0.06]" : "border-white/15 hover:border-primary/50 hover:bg-primary/[0.05]")}>
              <Ticket className={cn("h-5 w-5 shrink-0", voucher ? "text-success" : "text-primary")} />
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

            <h3 className="mt-6 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Payment Details</h3>
            <dl className="mt-3 space-y-3 text-[14px]">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Subscription</dt>
                <dd className="font-medium tabular-nums">{vnd(price)}</dd>
              </div>
              {voucher && (
                <div className="flex items-center justify-between animate-in fade-in duration-300">
                  <dt className="text-muted-foreground">Voucher ({voucher.off.replace(/\s*OFF/i, "")})</dt>
                  <dd className="font-medium tabular-nums text-success">−{vnd(discount)}</dd>
                </div>
              )}
            </dl>
            <div className="mt-4 flex items-end justify-between border-t border-white/[0.07] pt-4">
              <span className="text-[14px] font-semibold">Charged amount</span>
              <span key={charged} className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-[26px] font-bold leading-none tracking-tight text-transparent tabular-nums animate-in fade-in slide-in-from-bottom-1 duration-300">{vnd(charged)}</span>
            </div>

            {/* wide screens: the actions finish the order card */}
            <div className="mt-6 hidden flex-col gap-2 land:flex">
              <button className={cn(primaryBtn, "flex-none")} onClick={confirm}>Confirm</button>
              <button onClick={goBack} className="h-11 rounded-2xl text-[14px] font-semibold text-muted-foreground transition hover:bg-white/[0.05] hover:text-foreground">Cancel</button>
            </div>
          </section>

          {/* phones: actions stay at the bottom of the screen */}
          <div className="sticky bottom-0 z-20 mt-auto pt-4 land:hidden">
            <Actions>
              <button onClick={goBack} className={outlineBtn}>Cancel</button>
              <button className={primaryBtn} onClick={confirm}>Confirm</button>
            </Actions>
          </div>
        </div>
      </div>
      <VoucherPicker open={picking} planId={plan.id} empty={!!novouchers} selected={voucher}
        onClose={() => setPicking(false)} onDone={(v) => { setVoucher(v); setPicking(false); }} />
    </div>
  );
}

/** Vouchers, as a modal over the order (a bottom sheet on phones): pick one that fits this plan, or type a code. */
function VoucherPicker({ open, planId, empty, selected, onClose, onDone }: {
  open: boolean; planId: string; empty: boolean; selected: Voucher | null; onClose: () => void; onDone: (v: Voucher | null) => void;
}) {
  const list = empty ? [] : VOUCHERS.filter((v) => v.status === "Active");
  const [pick, setPick] = useState<Voucher | null>(selected);
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [flash, setFlash] = useState<string | null>(null);
  // each time it opens, start from what the order already has
  useEffect(() => { if (open) { setPick(selected); setCode(""); setErr(""); } }, [open, selected]);
  const apply = () => {
    const v = VOUCHERS.find((x) => x.code.toLowerCase() === code.trim().toLowerCase());
    if (!v || v.status !== "Active") return setErr("This code isn't valid or has expired.");
    if (!voucherFits(v, planId)) return setErr("This code can't be used with this plan.");
    setErr(""); setPick(v); setCode(""); setFlash(v.code); window.setTimeout(() => setFlash(null), 1200);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[min(720px,calc(100dvh-32px))] max-w-[480px] flex-col gap-0 overflow-hidden rounded-[26px] border-white/[0.08] bg-[#0f1726] p-0 [&>button:last-child]:hidden max-[599px]:bottom-0 max-[599px]:top-auto max-[599px]:max-h-[88dvh] max-[599px]:translate-y-0 max-[599px]:rounded-b-none">
        <div className="flex items-center justify-between px-5 pb-2 pt-5">
          <DialogTitle className="text-[17px]">Vouchers</DialogTitle>
          <button onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-white/[0.08] hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <DialogDescription className="sr-only">Pick an available voucher or enter a code.</DialogDescription>

        <div className="mac-scroll flex-1 overflow-y-auto px-5 pb-4">
          <h3 className="mt-2 text-[13px] font-semibold text-muted-foreground">Available Vouchers</h3>
          {list.length ? (
            <ul role="radiogroup" className="mt-2.5 space-y-2.5">
              {list.map((v) => {
                const ok = voucherFits(v, planId);
                const on = pick?.code === v.code;
                return (
                  <li key={v.code}>
                    <button role="radio" aria-checked={on} disabled={!ok} onClick={() => setPick(on ? null : v)}
                      className={cn("flex w-full items-stretch overflow-hidden rounded-[16px] text-left ring-1 ring-inset transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                        on ? "bg-primary/[0.08] ring-primary/60" : "bg-white/[0.03] ring-white/[0.07] enabled:hover:ring-white/20",
                        flash === v.code && "plan-flash",
                        !ok && "cursor-not-allowed opacity-50")}>
                      <span className="flex w-[72px] shrink-0 flex-col items-center justify-center bg-gradient-to-br from-primary/30 via-primary/15 to-secondary/25 py-3">
                        <span className="text-[19px] font-bold leading-none">{v.off.replace(/\s*OFF/i, "")}</span>
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

          <div className="my-5 flex items-center gap-3 text-[12px] text-muted-foreground">
            <span className="h-px flex-1 bg-white/[0.07]" /> Or Enter Manually <span className="h-px flex-1 bg-white/[0.07]" />
          </div>
          <label htmlFor="vcode" className="text-[13px] font-semibold">Voucher code</label>
          <div className="mt-2 flex gap-2">
            <input id="vcode" value={code} onChange={(e) => { setCode(e.target.value); setErr(""); }} onKeyDown={(e) => e.key === "Enter" && code.trim() && apply()}
              placeholder="EG: WELCOME50" autoCapitalize="characters"
              className={cn("h-11 min-w-0 flex-1 rounded-xl border bg-background/50 px-3.5 font-mono text-[14px] uppercase tracking-wider placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground/70 transition focus:outline-none focus:ring-2",
                err ? "border-destructive/60 focus:ring-destructive/30" : "border-white/10 hover:border-white/20 focus:border-primary/60 focus:ring-primary/30")} />
            <button onClick={apply} disabled={!code.trim()}
              className="h-11 shrink-0 rounded-xl border border-white/[0.12] px-5 text-[14px] font-semibold transition enabled:hover:border-primary/50 enabled:hover:bg-primary/10 enabled:hover:text-primary disabled:opacity-40">Apply</button>
          </div>
          <p className={cn("mt-2 text-[12px]", err ? "text-destructive" : "text-muted-foreground")}>
            {err || "Voucher codes are case-insensitive. Contact support if your code isn't working"}
          </p>
        </div>

        {/* what the button will do, so choosing a card reads as applied */}
        <div className="border-t border-white/[0.06] px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-4">
          {pick && (
            <p key={pick.code} className="mb-3 flex items-center justify-center gap-1.5 text-[13px] text-success animate-in fade-in slide-in-from-bottom-1 duration-300">
              <Check className="h-4 w-4" strokeWidth={3} /><span className="font-mono font-semibold tracking-wider">{pick.code}</span> · {pick.off.replace(/\s*OFF/i, "")} off applied
            </p>
          )}
          <button className={cn(primaryBtn, "w-full flex-none")} onClick={() => onDone(pick)}>{pick ? "Use voucher" : "OK"}</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
