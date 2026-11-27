import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Check, X, User, Users, Zap, TicketX } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { primaryBtn } from "@/components/CheckoutBits";
import { getPlan, priceFor, formatVND, type BillingCycle } from "@/lib/plans";
import { VOUCHERS, MORE_VOUCHERS, voucherFits, voucherRate, voucherUntil, type Voucher } from "@/lib/vouchers";

const ICONS = { freemium: Zap, individual: User, family: Users } as const;
const vnd = (n: number) => `${n.toLocaleString("vi-VN")}đ`;

/* Phones: a full-width sheet that slides up from the bottom. Wide screens: a centred dialog. */
export const sheetClass = "flex max-h-[min(680px,calc(100dvh-32px))] max-w-[440px] flex-col gap-0 overflow-hidden rounded-[28px] border-white/[0.08] bg-[#0e1524] p-0 shadow-[0_40px_100px_-30px_rgba(0,0,0,.9)] [&>button:last-child]:hidden max-[599px]:inset-x-0 max-[599px]:bottom-0 max-[599px]:top-auto max-[599px]:w-full max-[599px]:max-w-none max-[599px]:max-h-[88dvh] max-[599px]:translate-x-0 max-[599px]:translate-y-0 max-[599px]:rounded-b-none max-[599px]:border-x-0 max-[599px]:border-b-0 max-[599px]:data-[state=open]:slide-in-from-bottom-1/2 max-[599px]:data-[state=closed]:slide-out-to-bottom-1/2 max-[599px]:data-[state=open]:zoom-in-100 max-[599px]:data-[state=closed]:zoom-out-100";

/** Subscribe as a checkout sheet over the plan list: same content as the live app —
 *  Subscribe to <plan>, vouchers, payment details, Confirm. Vouchers apply in place (tap a ticket),
 *  so there is only ever one sheet. Closing it leaves you on the plans. */
export function SubscribeSheet({ planId, cycle, open, onOpenChange, emptyVouchers = false, manyVouchers = false }: {
  planId: string | null; cycle: BillingCycle; open: boolean; onOpenChange: (v: boolean) => void; emptyVouchers?: boolean; manyVouchers?: boolean;
}) {
  const navigate = useNavigate();
  const plan = planId ? getPlan(planId) : undefined;
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [codeOpen, setCodeOpen] = useState(false);
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [showAll, setShowAll] = useState(false);
  // only vouchers this plan can use, biggest discount first
  const list = !planId || emptyVouchers ? [] : (manyVouchers ? [...VOUCHERS, ...MORE_VOUCHERS] : VOUCHERS)
    .filter((v) => v.status === "Active" && voucherFits(v, planId))
    .sort((a, b) => voucherRate(b) - voucherRate(a));
  // opening the sheet pre-applies the best voucher; tap another to swap, tap it again to remove
  useEffect(() => { if (open) { setVoucher(list[0] ?? null); setCodeOpen(false); setCode(""); setErr(""); setShowAll(false); } }, [open, planId, emptyVouchers, manyVouchers]);
  if (!plan) return null;
  const Icon = ICONS[plan.id];
  const price = priceFor(plan, cycle);
  const discount = voucher ? Math.round(price * voucherRate(voucher)) : 0;
  const charged = price - discount;
  const applyCode = () => {
    const v = VOUCHERS.find((x) => x.code.toLowerCase() === code.trim().toLowerCase());
    if (!v || v.status !== "Active") return setErr("This code isn't valid or has expired.");
    if (!voucherFits(v, plan.id)) return setErr("This code can't be used with this plan.");
    setErr(""); setCode(""); setCodeOpen(false); setShowAll(true); setVoucher(v);
  };
  const confirm = () => {
    onOpenChange(false);
    toast.success(`Subscribed to ${plan.name}`, { description: "Redirecting to secure payment…" });
    navigate({ to: "/account", search: { tab: "plan" } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={sheetClass} onOpenAutoFocus={(e) => e.preventDefault()}>
        {/* grabber: reads as a sheet on phones */}
        <span aria-hidden className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-white/20 min-[600px]:hidden" />
        <div className="flex items-center gap-3 px-5 pb-1 pt-4 min-[600px]:pt-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-[0_10px_24px_-12px] shadow-primary"><Icon className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-[17px] font-semibold tracking-tight">Subscribe to {plan.name}</DialogTitle>
            <DialogDescription className="text-[12.5px] text-muted-foreground">{formatVND(price)} / {cycle === "annual" ? "year" : "month"}</DialogDescription>
          </div>
          <button onClick={() => onOpenChange(false)} aria-label="Close" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] text-muted-foreground transition hover:border-white/20 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"><X className="h-4 w-4" /></button>
        </div>

        <div className="mac-scroll min-h-0 flex-1 overflow-y-auto">
          {/* vouchers: tap a ticket to apply, tap again to remove */}
          <div className="pt-4">
            <div className="flex items-center justify-between px-5">
              <h3 className="flex items-center gap-1.5 text-[12.5px] font-semibold text-muted-foreground">
                Vouchers{list.length > 0 && <span className="rounded-full bg-white/[0.06] px-1.5 text-[10.5px] tabular-nums leading-4">{list.length}</span>}
                {showAll && list.length > 3 && <button onClick={() => setShowAll(false)} className="ml-1 rounded text-[12px] font-medium text-muted-foreground/80 underline-offset-2 hover:text-foreground hover:underline">Show less</button>}
              </h3>
              <button onClick={() => { setCodeOpen((o) => !o); setErr(""); }}
                className="rounded-md text-[12.5px] font-semibold text-primary transition hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                {codeOpen ? "Cancel" : "Enter code"}
              </button>
            </div>

            {codeOpen && (
              <div className="px-5 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className={cn("flex items-center gap-1.5 rounded-xl border bg-white/[0.03] p-1 pl-3 transition focus-within:ring-2",
                  err ? "border-destructive/60 focus-within:ring-destructive/25" : "border-white/10 focus-within:border-primary/60 focus-within:ring-primary/25")}>
                  <label htmlFor="vcode" className="sr-only">Voucher code</label>
                  <input id="vcode" autoFocus value={code} onChange={(e) => { setCode(e.target.value); setErr(""); }}
                    onKeyDown={(e) => e.key === "Enter" && code.trim() && applyCode()} placeholder="Voucher code" autoCapitalize="characters"
                    className="h-8 min-w-0 flex-1 bg-transparent font-mono text-[13.5px] uppercase tracking-wider placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground/70 focus:outline-none" />
                  <button onClick={applyCode} disabled={!code.trim()}
                    className="h-8 shrink-0 rounded-lg bg-primary px-3.5 text-[12.5px] font-semibold text-white transition enabled:hover:brightness-110 disabled:bg-white/[0.06] disabled:text-muted-foreground">Apply</button>
                </div>
                {err && <p className="mt-1.5 px-1 text-[11.5px] text-destructive">{err}</p>}
              </div>
            )}

            {list.length ? (
              <div role="radiogroup" aria-label="Vouchers" className={cn("grid grid-cols-3 gap-2 px-5 pt-2", showAll && list.length > 9 && "mac-scroll max-h-[132px] overflow-y-auto pb-1 pr-4")}>
                {(showAll || list.length <= 3 ? list : list.slice(0, 2)).map((v) => {
                  const on = voucher?.code === v.code;
                  return (
                    <div key={v.code} className="relative min-w-0 animate-in fade-in duration-200">
                      <button role="radio" aria-checked={on} onClick={() => setVoucher(on ? null : v)}
                        title={`${v.name} · ${v.code} · valid until ${voucherUntil(v)}`}
                        className={cn("group relative flex h-9 w-full items-stretch overflow-hidden rounded-[10px] text-left transition active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                          on ? "bg-primary/[0.12]" : "bg-white/[0.03] hover:bg-white/[0.06]")}>
                        <span className={cn("flex w-[32px] shrink-0 items-center justify-center text-[11px] font-bold tracking-tight transition",
                          on ? "bg-gradient-to-b from-primary to-secondary text-white" : "bg-primary/[0.14] text-primary")}>
                          {v.off.replace(/\s*OFF/i, "")}
                        </span>
                        {/* perforation */}
                        <span aria-hidden className={cn("w-0 border-l border-dashed transition", on ? "border-white/30" : "border-white/[0.12]")} />
                        <span className="flex min-w-0 flex-1 flex-col justify-center px-2">
                          <span className="truncate font-mono text-[11px] font-semibold leading-[13px] tracking-wide">{v.code}</span>
                          <span className="truncate text-[9.5px] leading-[12px] text-muted-foreground">{v.name}</span>
                        </span>
                        <span aria-hidden className={cn("pointer-events-none absolute inset-0 rounded-[10px] transition",
                          on ? "ring-[1.5px] ring-inset ring-primary" : "ring-1 ring-inset ring-white/[0.08] group-hover:ring-white/20")} />
                      </button>
                      {on && <span aria-hidden className="pointer-events-none absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary ring-2 ring-[#0e1524] animate-in zoom-in-50 duration-200"><Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} /></span>}
                    </div>
                  );
                })}
                {!showAll && list.length > 3 && (
                  <button onClick={() => setShowAll(true)}
                    className="flex h-9 items-center justify-center rounded-[10px] border border-dashed border-white/[0.14] text-[12px] font-semibold text-muted-foreground transition hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                    +{list.length - 2} more
                  </button>
                )}
              </div>
            ) : (
              !codeOpen && (
                <div className="px-5 pt-2">
                  <button onClick={() => setCodeOpen(true)}
                    className="group flex h-9 w-full items-center gap-2.5 rounded-[10px] border border-dashed border-white/[0.12] px-3 text-left transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                    <TicketX className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                    <span className="flex-1 text-[12.5px] text-muted-foreground">No vouchers available</span>
                  </button>
                </div>
              )
            )}
          </div>

          <div className="px-5 pb-5">
            <h3 className="mt-4 text-[12.5px] font-semibold text-muted-foreground">Payment Details</h3>
            <div className="mt-2 overflow-hidden rounded-[16px] ring-1 ring-inset ring-white/[0.08]">
              <div className="flex items-center justify-between px-3.5 py-2.5 text-[13.5px]">
                <span className="text-muted-foreground">Subscription</span>
                <span className="font-medium tabular-nums">{vnd(price)}</span>
              </div>
              {voucher && (
                <div className="flex items-center justify-between border-t border-white/[0.06] px-3.5 py-2.5 text-[13.5px] animate-in fade-in duration-300">
                  <span className="text-muted-foreground">Voucher <span className="font-mono text-[12px] tracking-wider text-foreground/70">{voucher.code}</span></span>
                  <span className="font-medium tabular-nums text-success">−{vnd(discount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-white/[0.06] bg-white/[0.035] px-3.5 py-3">
                <span className="text-[14px] font-semibold">Charged amount</span>
                <span key={charged} className="text-[18px] font-bold tabular-nums tracking-tight animate-in fade-in slide-in-from-bottom-1 duration-300">{vnd(charged)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.06] bg-white/[0.02] px-5 pb-[max(18px,env(safe-area-inset-bottom))] pt-4">
          <button className={cn(primaryBtn, "h-12 w-full flex-none")} onClick={confirm}>Confirm · {vnd(charged)}</button>
          <button onClick={() => onOpenChange(false)} className="mt-1.5 h-10 w-full rounded-xl text-[13.5px] font-semibold text-muted-foreground transition hover:text-foreground">Cancel</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
