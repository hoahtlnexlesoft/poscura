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
            {voucher ? (
              /* applied: the same ticket as in the picker, tap to change */
              <div role="button" tabIndex={0} onClick={() => setPicking(true)} onKeyDown={(e) => e.key === "Enter" && setPicking(true)}
                className="group relative flex w-full cursor-pointer items-stretch overflow-hidden rounded-[18px] bg-gradient-to-r from-primary/[0.14] to-secondary/[0.05] text-left ring-1 ring-inset ring-primary/40 transition hover:ring-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                <span className="flex w-[72px] shrink-0 flex-col items-center justify-center bg-gradient-to-br from-primary to-secondary py-3 text-white">
                  <span className="text-[19px] font-bold leading-none tracking-tight">{voucher.off.replace(/\s*OFF/i, "")}</span>
                  <span className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.2em] opacity-80">Off</span>
                </span>
                <span className="min-w-0 flex-1 px-3.5 py-2.5">
                  <span className="block truncate text-[14px] font-semibold">{voucher.name}</span>
                  <span className="mt-1 flex items-center gap-2">
                    <span className="rounded-md bg-white/[0.07] px-1.5 py-0.5 font-mono text-[11.5px] font-semibold tracking-wider text-foreground/80">{voucher.code}</span>
                    <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-success"><Check className="h-3 w-3" strokeWidth={3} />Applied</span>
                  </span>
                </span>
                <span className="flex items-center gap-0.5 pr-2">
                  <span className="hidden text-[12px] font-semibold text-primary group-hover:inline">Change</span>
                  <button aria-label="Remove voucher" onClick={(e) => { e.stopPropagation(); setVoucher(null); }}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-white/[0.08] hover:text-foreground"><X className="h-4 w-4" /></button>
                </span>
              </div>
            ) : (
              <button onClick={() => setPicking(true)}
                className="group flex w-full items-center gap-3 rounded-[18px] bg-white/[0.035] px-3.5 py-3 text-left ring-1 ring-inset ring-white/[0.08] transition hover:bg-white/[0.05] hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-inset ring-primary/20"><Ticket className="h-[18px] w-[18px]" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold">Select voucher</span>
                </span>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
              </button>
            )}

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
      <VoucherPicker open={picking} planId={plan.id} price={price} empty={!!novouchers} selected={voucher}
        onClose={() => setPicking(false)} onDone={(v) => { setVoucher(v); setPicking(false); }} />
    </div>
  );
}

/** Vouchers, as a modal over the order (a bottom sheet on phones): type a code, or pick one that fits this plan. */
function VoucherPicker({ open, planId, price, empty, selected, onClose, onDone }: {
  open: boolean; planId: string; price: number; empty: boolean; selected: Voucher | null; onClose: () => void; onDone: (v: Voucher | null) => void;
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
  const save = pick ? Math.round(price * voucherRate(pick)) : 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[min(680px,calc(100dvh-32px))] max-w-[460px] flex-col gap-0 overflow-hidden rounded-[28px] border-white/[0.08] bg-[#0e1524] p-0 shadow-[0_40px_100px_-30px_rgba(0,0,0,.9)] [&>button:last-child]:hidden max-[599px]:bottom-0 max-[599px]:top-auto max-[599px]:max-h-[88dvh] max-[599px]:translate-y-0 max-[599px]:rounded-b-none">
        {/* header + code entry stay on top; only the list scrolls */}
        <div className="relative border-b border-white/[0.06] px-5 pb-4 pt-5">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(70%_100%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_16%,transparent),transparent)]" />
          <div className="relative flex items-center justify-between">
            <DialogTitle className="text-[18px] font-semibold tracking-tight">Vouchers</DialogTitle>
            <button onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] text-muted-foreground transition hover:border-white/20 hover:text-foreground"><X className="h-4 w-4" /></button>
          </div>
          <DialogDescription className="sr-only">Enter a voucher code or pick an available voucher.</DialogDescription>
          <label htmlFor="vcode" className="sr-only">Voucher code</label>
          <div className={cn("relative mt-4 flex items-center gap-2 rounded-2xl border bg-white/[0.03] p-1.5 pl-3.5 transition focus-within:ring-2",
            err ? "border-destructive/60 focus-within:ring-destructive/25" : "border-white/10 focus-within:border-primary/60 focus-within:ring-primary/25")}>
            <Ticket className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input id="vcode" value={code} onChange={(e) => { setCode(e.target.value); setErr(""); }} onKeyDown={(e) => e.key === "Enter" && code.trim() && apply()}
              placeholder="Enter voucher code, e.g. WELCOME50" autoCapitalize="characters"
              className="h-9 min-w-0 flex-1 bg-transparent font-mono text-[14px] uppercase tracking-wider placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground/70 focus:outline-none" />
            <button onClick={apply} disabled={!code.trim()}
              className="h-9 shrink-0 rounded-xl bg-primary px-4 text-[13px] font-semibold text-white transition enabled:hover:brightness-110 disabled:bg-white/[0.06] disabled:text-muted-foreground">Apply</button>
          </div>
          <p className={cn("relative mt-2 px-1 text-[11.5px]", err ? "text-destructive" : "text-muted-foreground")}>
            {err || "Voucher codes are case-insensitive. Contact support if your code isn't working"}
          </p>
        </div>

        <div className="mac-scroll flex-1 overflow-y-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">Available Vouchers</h3>
            {list.length > 0 && <span className="text-[12px] text-muted-foreground">{list.length}</span>}
          </div>
          {list.length ? (
            <ul role="radiogroup" className="mt-3 space-y-3">
              {list.map((v) => {
                const ok = voucherFits(v, planId);
                const on = pick?.code === v.code;
                return (
                  <li key={v.code}>
                    <button role="radio" aria-checked={on} disabled={!ok} onClick={() => setPick(on ? null : v)}
                      className={cn("group relative flex w-full items-stretch overflow-hidden rounded-[18px] text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                        on ? "bg-gradient-to-r from-primary/[0.16] to-secondary/[0.06] ring-[1.5px] ring-inset ring-primary shadow-[0_12px_30px_-16px] shadow-primary"
                          : "bg-white/[0.035] ring-1 ring-inset ring-white/[0.07] enabled:hover:bg-white/[0.05] enabled:hover:ring-white/20",
                        flash === v.code && "plan-flash",
                        !ok && "cursor-not-allowed opacity-45 saturate-50")}>
                      {/* ticket stub */}
                      <span className={cn("flex w-[78px] shrink-0 flex-col items-center justify-center py-3.5 transition",
                        on ? "bg-gradient-to-br from-primary to-secondary text-white" : "bg-gradient-to-br from-primary/35 via-primary/15 to-secondary/25")}>
                        <span className="text-[20px] font-bold leading-none tracking-tight">{v.off.replace(/\s*OFF/i, "")}</span>
                        <span className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.2em] opacity-80">Off</span>
                      </span>
                      {/* perforation with notches */}
                      <span aria-hidden className="relative w-0 border-l-[1.5px] border-dashed border-white/15">
                        <span className="absolute -left-[8px] -top-[8px] h-4 w-4 rounded-full bg-[#0e1524]" />
                        <span className="absolute -bottom-[8px] -left-[8px] h-4 w-4 rounded-full bg-[#0e1524]" />
                      </span>
                      <span className="min-w-0 flex-1 px-4 py-3">
                        <span className="block truncate text-[14px] font-semibold">{v.name}</span>
                        <span className="mt-1 inline-block rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-[11.5px] font-semibold tracking-wider text-foreground/80">{v.code}</span>
                        <span className="mt-1.5 block text-[11.5px] text-muted-foreground">{ok ? `Valid until ${voucherUntil(v)}` : "Individual plan only"}</span>
                      </span>
                      <span className="flex items-center pr-4">
                        <span className={cn("flex h-[22px] w-[22px] items-center justify-center rounded-full transition", on ? "bg-primary shadow-[0_0_0_4px] shadow-primary/20" : "ring-[1.5px] ring-inset ring-white/25 group-hover:ring-white/40")}>
                          {on && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.05] text-muted-foreground ring-1 ring-inset ring-white/[0.08]"><TicketX className="h-5 w-5" /></span>
              <p className="mt-3 text-[13.5px] text-muted-foreground">No data</p>
            </div>
          )}
        </div>

        {/* footer: what you save, and the one action */}
        <div className="flex items-center gap-4 border-t border-white/[0.06] bg-white/[0.02] px-5 pb-[max(18px,env(safe-area-inset-bottom))] pt-4">
          <div className="min-w-0 flex-1">
            {pick ? (
              <div key={pick.code} className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                <div className="text-[11.5px] text-muted-foreground">You save</div>
                <div className="text-[17px] font-bold tabular-nums text-success">{vnd(save)}</div>
              </div>
            ) : <div className="text-[12.5px] text-muted-foreground">No voucher selected</div>}
          </div>
          <button className={cn(primaryBtn, "h-12 flex-none px-7")} onClick={() => onDone(pick)}>{pick ? "Use voucher" : "OK"}</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
