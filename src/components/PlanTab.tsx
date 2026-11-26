import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ChevronRight, Star, CircleCheck, Check, Ticket, Plus, Copy, X, PackagePlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PlanPicker } from "@/components/PlanPicker";
import { AddOnDialog } from "@/components/AddOnDialog";
import { VOUCHERS, type Voucher } from "@/lib/vouchers";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/** Which plan the demo user is on. Freemium, a paid personal plan, or covered by a business. */
export type PlanKind = "free" | "individual" | "business";

const vnd = (n: number) => `₫${n.toLocaleString("en-US")}`;

type Hist = { plan: string; cycle: string; status: "Active" | "Expired" | "Cancelled"; price: string; date: string; period: string; paid: string };
const HISTORY: Record<PlanKind, Hist[]> = {
  free: [
    { plan: "Freemium", cycle: "Monthly", status: "Active", price: "Free", date: "Nov 17, 2026", period: "Nov 17 – Dec 17, 2026", paid: "No payment needed" },
    { plan: "Freemium", cycle: "Monthly", status: "Expired", price: "Free", date: "Oct 17, 2026", period: "Oct 17 – Nov 17, 2026", paid: "No payment needed" },
    { plan: "Freemium", cycle: "Monthly", status: "Expired", price: "Free", date: "Sep 17, 2026", period: "Sep 17 – Oct 17, 2026", paid: "No payment needed" },
    { plan: "Freemium", cycle: "Monthly", status: "Expired", price: "Free", date: "Aug 17, 2026", period: "Aug 17 – Sep 17, 2026", paid: "No payment needed" },
  ],
  individual: [
    { plan: "Individual", cycle: "Monthly", status: "Active", price: vnd(299000), date: "Oct 26, 2026", period: "Oct 26 – Nov 26, 2026", paid: "Visa •••• 4417 · WCSM2026 −10%" },
    { plan: "Freemium", cycle: "Monthly", status: "Expired", price: "Free", date: "Sep 26, 2026", period: "Sep 26 – Oct 26, 2026", paid: "No payment needed" },
    { plan: "Freemium", cycle: "Monthly", status: "Expired", price: "Free", date: "Aug 26, 2026", period: "Aug 26 – Sep 26, 2026", paid: "No payment needed" },
    { plan: "Freemium", cycle: "Monthly", status: "Expired", price: "Free", date: "Jul 26, 2026", period: "Jul 26 – Aug 26, 2026", paid: "No payment needed" },
  ],
  business: [
    { plan: "Professional", cycle: "Business", status: "Active", price: "Covered", date: "Nov 23, 2026", period: "From Nov 23, 2026 · renews with your team", paid: "Paid by Uyen86SME" },
    { plan: "Freemium", cycle: "Monthly", status: "Expired", price: "Free", date: "Oct 23, 2026", period: "Oct 23 – Nov 23, 2026", paid: "No payment needed" },
    { plan: "Freemium", cycle: "Monthly", status: "Expired", price: "Free", date: "Sep 23, 2026", period: "Sep 23 – Oct 23, 2026", paid: "No payment needed" },
    { plan: "Freemium", cycle: "Monthly", status: "Expired", price: "Free", date: "Aug 23, 2026", period: "Aug 23 – Sep 23, 2026", paid: "No payment needed" },
  ],
};

const BENEFITS = ["Unlimited monitoring time", "Personalized workout plans", "Progress tracking and reporting", "AI chatbot support", "Team management", "Advanced analytics", "Priority support"];

type AddOn = { id: string; name: string; hours: string; price: number; date: string };
const ADDON_SHOP = [
  { id: "light", name: "Light Monitoring", hours: "+10 hours / month", price: 119000 },
  { id: "heavy", name: "Heavy Monitoring", hours: "+40 hours / month", price: 299000 },
];

/* ---------- small building blocks ---------- */
function Card({ title, action, children, className, id }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={cn("rounded-[22px] border border-white/[0.06] bg-card p-5", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
const outlineBtn = "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-white/10 px-3.5 text-[12.5px] font-semibold text-foreground/85 transition hover:border-primary/50 hover:bg-primary/10 hover:text-foreground active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60";
const gradBtn = "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-secondary px-4 text-[13px] font-semibold text-white shadow-[0_10px_26px_-14px] shadow-primary transition hover:brightness-110 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60";
const statusTone = { Used: "bg-primary/12 text-primary ring-primary/25", Active: "bg-success/12 text-success ring-success/25", Expired: "bg-white/[0.05] text-muted-foreground ring-white/10", Cancelled: "bg-destructive/12 text-destructive ring-destructive/25" };

function MoreButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className="mx-auto mt-4 flex h-9 items-center gap-1 rounded-full px-3 text-[12.5px] font-semibold text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
      View all ({count}) <ChevronRight className="h-4 w-4" />
    </button>
  );
}

/** Full list in a modal, so the cards on the page keep their height and the two columns stay level */
function ListModal({ open, onOpenChange, title, subtitle, filters, children }: {
  open: boolean; onOpenChange: (v: boolean) => void; title: string; subtitle?: string;
  filters?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(640px,calc(100dvh-48px))] w-[calc(100vw-32px)] max-w-[460px] flex-col gap-0 overflow-hidden rounded-[22px] p-0">
        <DialogHeader className="border-b border-white/[0.06] px-5 pb-4 pt-5 text-left">
          <DialogTitle className="text-[17px]">{title}</DialogTitle>
          {subtitle && <DialogDescription className="text-[12.5px]">{subtitle}</DialogDescription>}
          {filters && <div className="pt-2">{filters}</div>}
        </DialogHeader>
        <div className="mac-scroll min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

function HistRow({ h }: { h: Hist }) {
  return (
    <li className="rounded-[16px] border border-white/[0.06] bg-white/[0.02] p-3.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[14px] font-semibold">{h.plan} · {h.cycle}</span>
        <span className="shrink-0 text-[14px] font-semibold tabular-nums">{h.price}</span>
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-3">
        <span className={cn("rounded-full px-2 py-px text-[10.5px] font-semibold ring-1 ring-inset", statusTone[h.status])}>{h.status}</span>
        <span className="text-[11.5px] text-muted-foreground">{h.date}</span>
      </div>
    </li>
  );
}

type VFilter = "All" | "Active" | "Used" | "Expired";
function VoucherFilter({ value, onChange }: { value: VFilter; onChange: (v: VFilter) => void }) {
  return (
    <div role="tablist" className="inline-flex rounded-full border border-white/[0.06] bg-white/[0.03] p-1">
      {(["All", "Active", "Used", "Expired"] as const).map((f) => {
        const n = f === "All" ? VOUCHERS.length : VOUCHERS.filter((v) => v.status === f).length;
        return (
          <button key={f} role="tab" aria-selected={value === f} onClick={() => onChange(f)}
            className={cn("flex h-8 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
              value === f ? "bg-white/[0.09] text-foreground" : "text-muted-foreground hover:text-foreground")}>
            {f}<span className="text-[11px] tabular-nums text-muted-foreground">{n}</span>
          </button>
        );
      })}
    </div>
  );
}

function Confirm({ trigger, title, body, action, onConfirm }: { trigger: React.ReactNode; title: string; body: string; action: string; onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="max-w-[380px] rounded-[22px]">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{body}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="rounded-full">Keep it</AlertDialogCancel>
          <AlertDialogAction className="rounded-full bg-destructive text-white hover:bg-destructive/90" onClick={onConfirm}>{action}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* Upgrade → the plans: scroll to them (phones), and always flash them so it's clear where to pick, even when they're already beside you (two-pane) */
const toUpgrade = () => {
  const el = document.getElementById("upgrade-your-plan");
  if (!el) return;
  const r = el.getBoundingClientRect();
  if (r.top < 0 || r.top > window.innerHeight * 0.6) el.scrollIntoView({ behavior: "smooth", block: "start" });
  el.classList.remove("plan-flash"); void el.offsetWidth; el.classList.add("plan-flash");
  window.setTimeout(() => el.classList.remove("plan-flash"), 1600);
};

/* ---------- voucher as a ticket: discount stub, perforation, details ---------- */
function VoucherTicket({ v }: { v: Voucher }) {
  const [copied, setCopied] = useState(false);
  const [mm, dd, rest] = v.until.split("/");
  const end = new Date(`${rest.slice(0, 4)}-${mm}-${dd}T${rest.slice(5) || "23:59"}`);
  const days = Math.ceil((end.getTime() - Date.now()) / 86400000);
  const live = v.status === "Active";
  const soon = live && days >= 0 && days <= 7;
  const pct = v.off.replace(/\s*OFF/i, "");
  const copy = () => {
    navigator.clipboard?.writeText(v.code);
    setCopied(true); toast.success(`Copied ${v.code}`);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <li className={cn("group relative flex overflow-hidden rounded-[18px] bg-gradient-to-r from-white/[0.05] to-white/[0.02] ring-1 ring-inset ring-white/[0.07] transition hover:ring-primary/30", !live && "opacity-60 saturate-50")}>
      {/* stub */}
      <div className="relative flex w-[92px] shrink-0 flex-col items-center justify-center bg-gradient-to-br from-primary/30 via-primary/15 to-secondary/25 py-4">
        <span className="text-[26px] font-bold leading-none tracking-tight">{pct}</span>
        <span className="mt-1 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-foreground/75">Off</span>
      </div>
      {/* perforation with notches */}
      <div aria-hidden className="relative w-0 border-l-[1.5px] border-dashed border-white/15">
        <span className="absolute -left-[9px] -top-[9px] h-[18px] w-[18px] rounded-full bg-card" />
        <span className="absolute -bottom-[9px] -left-[9px] h-[18px] w-[18px] rounded-full bg-card" />
      </div>
      {/* details */}
      <div className="min-w-0 flex-1 p-3.5 pl-4">
        <div className="flex items-start justify-between gap-2">
          <div className="line-clamp-2 text-[14px] font-semibold leading-snug">{v.name}</div>
          <span className={cn("shrink-0 rounded-full px-2 py-px text-[10.5px] font-semibold ring-1 ring-inset", statusTone[v.status])}>{v.status}</span>
        </div>
        <button onClick={copy} aria-label={`Copy code ${v.code}`}
          className="mt-2 inline-flex h-8 items-center gap-2 rounded-lg border border-dashed border-primary/40 bg-primary/[0.08] px-2.5 font-mono text-[12.5px] font-semibold tracking-[0.08em] text-foreground transition hover:border-primary/70 hover:bg-primary/15 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
          {v.code}
          {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5 text-primary" />}
        </button>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-muted-foreground">
          <span>{v.status === "Expired" ? "Expired on" : v.status === "Used" ? "Used · was valid until" : "Valid until"} {end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          {soon && <span className="rounded-full bg-warning/12 px-2 py-px font-semibold text-warning ring-1 ring-inset ring-warning/25">{days <= 1 ? "Ends today" : `${days} days left`}</span>}
        </div>
      </div>
    </li>
  );
}

/* ---------- covered by a business: who pays, since when, and the two ways out ---------- */
function BusinessPlanCard() {
  return (
    <section className="relative overflow-hidden rounded-[22px] border border-white/[0.07] bg-card">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(80%_100%_at_0%_0%,color-mix(in_oklab,var(--color-success)_14%,transparent),transparent_70%),radial-gradient(60%_90%_at_100%_0%,color-mix(in_oklab,var(--color-primary)_14%,transparent),transparent_70%)]" />
      <div className="relative p-5">
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Current plan</span>
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset", statusTone.Active)}>
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Active
          </span>
        </div>

        <div className="mt-2 text-[24px] font-bold leading-tight tracking-tight">Professional</div>
        <div className="mt-0.5 text-[13px] text-muted-foreground">Business member · <span className="text-foreground/90">Uyen86SME</span></div>

        <div className="mt-4 flex gap-2.5 rounded-[16px] border border-success/20 bg-success/[0.06] p-3.5">
          <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          <div className="min-w-0">
            <div className="text-[13.5px] font-semibold">Covered by Uyen86SME</div>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">All Professional benefits are active. You can also choose a personal plan at any time.</p>
          </div>
        </div>

        <Confirm
          trigger={<button className={cn(outlineBtn, "mt-3 h-11 w-full justify-center text-[13.5px] hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive")}>Leave Business</button>}
          title="Leave Uyen86SME?"
          body="You lose the Professional benefits your business pays for and move back to Freemium. Your history and reports stay with you."
          action="Leave business"
          onConfirm={() => toast("You left Uyen86SME")}
        />
      </div>
    </section>
  );
}

/* ---------- the tab ---------- */
export function PlanTab({ plan, noAddons = false, buyAddon = false }: { plan: PlanKind; noAddons?: boolean; buyAddon?: boolean }) {
  const [buy, setBuy] = useState(buyAddon);
  const [addons, setAddons] = useState<AddOn[]>(noAddons ? [] : [
    { id: "h1", name: "Heavy Monitoring", hours: "+40 hours / month", price: 299000, date: "Jun 24, 2026" },
    { id: "l1", name: "Light Monitoring", hours: "+10 hours / month", price: 119000, date: "May 25, 2026" },
  ]);
  const navigate = useNavigate();
  const [histOpen, setHistOpen] = useState(false);
  const [vouOpen, setVouOpen] = useState(false);
  const [vf, setVf] = useState<VFilter>("All");
  const vList = vf === "All" ? VOUCHERS : VOUCHERS.filter((v) => v.status === vf);
  const hist = HISTORY[plan];
  const unlimited = plan !== "free";

  return (
    <>
      {/* ---------- wide screens: account sections on the left, plans to upgrade to on the right; one column on phones (upgrade last) ---------- */}
      {plan === "business" ? (
      <div className="space-y-4 fold:grid fold:grid-cols-2 fold:items-start fold:gap-4 fold:space-y-0 land:gap-x-6 hinge-split land:items-start">
        <div className="space-y-4 fold:flex fold:flex-col fold:gap-4 fold:space-y-0">
        <BusinessPlanCard />
        <div className="fold:hidden">
          <Card title="Professional benefits" className="scroll-mt-20">
            <ul className="grid gap-y-3">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-center gap-2.5 text-[13.5px]">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15"><Check className="h-3 w-3 text-success" /></span>
                  {b}
                </li>
              ))}
            </ul>
          </Card>
        </div>


        <Card title="Usage this month">
          <div className="grid grid-cols-3 divide-x divide-white/[0.06] rounded-[16px] border border-white/[0.06] bg-white/[0.02]">
            {[
              { l: "Hours", v: unlimited ? "∞" : "0.8", of: unlimited ? "unlimited" : "of 20.2 h", pct: unlimited ? null : 4 },
              { l: "Sessions", v: "10", of: unlimited ? "unlimited" : "of 112", pct: unlimited ? null : 9 },
              { l: "Reports", v: "6", of: "this month", pct: null },
            ].map((u) => (
              <div key={u.l} className="px-3 py-3">
                <div className="text-[11.5px] text-muted-foreground">{u.l}</div>
                <div className="mt-1 text-[19px] font-semibold leading-none tabular-nums">{u.v}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">{u.of}</div>
                {u.pct !== null && <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full rounded-full bg-primary" style={{ width: `${u.pct}%` }} /></div>}
              </div>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-muted-foreground">Resets on Nov 26, 2026.</p>
        </Card>
        <Card title="Add-ons" action={<button onClick={() => setBuy(true)} className={outlineBtn}><Plus className="h-3.5 w-3.5" /> Browse add-ons</button>}>
          {addons.length ? (
            <ul className="space-y-2">
              {addons.map((a) => (
                <li key={a.id} className="rounded-[16px] border border-white/[0.06] bg-white/[0.02] p-3.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[14px] font-semibold">{a.name}</span>
                    <span className="shrink-0 text-[14px] font-semibold tabular-nums">{vnd(a.price)}</span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-3 text-[11.5px] text-muted-foreground">
                    <span className={cn("rounded-full px-2 py-px text-[10.5px] font-semibold ring-1 ring-inset", statusTone.Active)}>Active</span>
                    <span>{a.date}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            /* nothing bought yet: one compact line, the header button is the way in */
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary ring-1 ring-inset ring-primary/25"><PackagePlus className="h-[18px] w-[18px]" /></span>
              <div className="min-w-0">
                <div className="text-[13.5px] font-semibold">No add-ons yet</div>
                <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">Need more monitoring time? Add extra hours anytime.</p>
              </div>
            </div>
          )}
        </Card>
        <Card title="Subscription history">
          <ul className="space-y-2">
            {hist.slice(0, 2).map((h, i) => <HistRow key={i} h={h} />)}
          </ul>
          {hist.length > 2 && <MoreButton count={hist.length} onClick={() => setHistOpen(true)} />}
        </Card>
        <Card title="Vouchers" action={<span className="text-[12px] text-muted-foreground">{VOUCHERS.filter((x) => x.status === "Active").length} active · tap a code to copy</span>}>
          <ul className="space-y-3">
            {VOUCHERS.filter((v) => v.status === "Active").slice(0, 2).map((v) => <VoucherTicket key={v.code} v={v} />)}
          </ul>
          {VOUCHERS.length > 2 && <MoreButton count={VOUCHERS.length} onClick={() => setVouOpen(true)} />}
        </Card>
        </div>
        {/* wide screens: benefits alone on the right */}
        <div className="hidden fold:flex fold:flex-col fold:gap-4">
          <Card id="member-benefits" title="Professional benefits" className="scroll-mt-20">
            <ul className="grid gap-y-3">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-center gap-2.5 text-[13.5px]">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15"><Check className="h-3 w-3 text-success" /></span>
                  {b}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
      ) : (
      <div className="space-y-4 fold:grid fold:grid-cols-2 fold:items-start fold:gap-4 fold:space-y-0 land:gap-x-6 hinge-split land:items-start">
        <div className="space-y-4 fold:flex fold:flex-col fold:gap-4 fold:space-y-0">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Current plan</div>
              <div className="mt-1.5 text-[24px] font-bold leading-tight tracking-tight">
                {plan === "free" ? "Freemium" : "Individual"}
              </div>
              <div className="mt-0.5 text-[13px] text-muted-foreground">
                {plan === "free" && "Free forever. No billing."}
                {plan === "individual" && <><span className="font-semibold text-foreground">{vnd(299000)}</span> / month</>}
              </div>
            </div>
            {plan === "individual" ? (
              <div className="shrink-0 text-right">
                <Confirm
                  trigger={<button className={cn(outlineBtn, "hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive")}>Cancel plan</button>}
                  title="Cancel your Individual plan?"
                  body="You keep Individual until Nov 26, 2026. After that you move to Freemium and your limits go back to 20 hours a month."
                  action="Cancel plan"
                  onConfirm={() => toast("Plan cancelled. Individual stays active until Nov 26, 2026.")}
                />
                <div className="mt-2.5 text-[11.5px] text-muted-foreground">Next billing</div>
                <div className="text-[13px] font-semibold text-success">26 Nov, 2026</div>
              </div>
            ) : null}
          </div>

          {(
            <div className="mt-4 flex items-center justify-between gap-3 rounded-[16px] bg-gradient-to-r from-primary/20 via-primary/[0.08] to-transparent p-3.5 ring-1 ring-inset ring-primary/20">
              <p className="text-[13px] font-medium">{plan === "free" ? "Upgrade your plan to access advanced tools." : "Get team features with Family or Professional."}</p>
              <button onClick={toUpgrade} className={gradBtn}><Star className="h-3.5 w-3.5 fill-current" /> Upgrade</button>
            </div>
          )}
        </Card>
        <Card title="Usage this month">
          <div className="grid grid-cols-3 divide-x divide-white/[0.06] rounded-[16px] border border-white/[0.06] bg-white/[0.02]">
            {[
              { l: "Hours", v: unlimited ? "∞" : "0.8", of: unlimited ? "unlimited" : "of 20.2 h", pct: unlimited ? null : 4 },
              { l: "Sessions", v: "10", of: unlimited ? "unlimited" : "of 112", pct: unlimited ? null : 9 },
              { l: "Reports", v: "6", of: "this month", pct: null },
            ].map((u) => (
              <div key={u.l} className="px-3 py-3">
                <div className="text-[11.5px] text-muted-foreground">{u.l}</div>
                <div className="mt-1 text-[19px] font-semibold leading-none tabular-nums">{u.v}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">{u.of}</div>
                {u.pct !== null && <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full rounded-full bg-primary" style={{ width: `${u.pct}%` }} /></div>}
              </div>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-muted-foreground">Resets on {plan === "free" ? "Dec 17, 2026" : "Nov 26, 2026"}.</p>
        </Card>
        <Card title="Add-ons" action={<button onClick={() => setBuy(true)} className={outlineBtn}><Plus className="h-3.5 w-3.5" /> Browse add-ons</button>}>
          {addons.length ? (
            <ul className="space-y-2">
              {addons.map((a) => (
                <li key={a.id} className="rounded-[16px] border border-white/[0.06] bg-white/[0.02] p-3.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[14px] font-semibold">{a.name}</span>
                    <span className="shrink-0 text-[14px] font-semibold tabular-nums">{vnd(a.price)}</span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-3 text-[11.5px] text-muted-foreground">
                    <span className={cn("rounded-full px-2 py-px text-[10.5px] font-semibold ring-1 ring-inset", statusTone.Active)}>Active</span>
                    <span>{a.date}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            /* nothing bought yet: one compact line, the header button is the way in */
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary ring-1 ring-inset ring-primary/25"><PackagePlus className="h-[18px] w-[18px]" /></span>
              <div className="min-w-0">
                <div className="text-[13.5px] font-semibold">No add-ons yet</div>
                <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">Need more monitoring time? Add extra hours anytime.</p>
              </div>
            </div>
          )}
        </Card>
        <Card title="Subscription history">
          <ul className="space-y-2">
            {hist.slice(0, 2).map((h, i) => <HistRow key={i} h={h} />)}
          </ul>
          {hist.length > 2 && <MoreButton count={hist.length} onClick={() => setHistOpen(true)} />}
        </Card>
        <Card title="Vouchers" action={<span className="text-[12px] text-muted-foreground">{VOUCHERS.filter((x) => x.status === "Active").length} active · tap a code to copy</span>}>
          <ul className="space-y-3">
            {VOUCHERS.filter((v) => v.status === "Active").slice(0, 2).map((v) => <VoucherTicket key={v.code} v={v} />)}
          </ul>
          {VOUCHERS.length > 2 && <MoreButton count={VOUCHERS.length} onClick={() => setVouOpen(true)} />}
        </Card>
        </div>
      <section id="upgrade-your-plan" className="mt-4 scroll-mt-20 fold:mt-0 rounded-[22px] border border-white/[0.06] bg-card p-5">
        <h2 className="mb-4 text-center text-[17px] font-semibold tracking-tight">Upgrade your plan</h2>
        <PlanPicker currentId={plan === "free" ? "freemium" : plan === "individual" ? "individual" : "none"} />
      </section>
      </div>
      )}

      <AddOnDialog open={buy} onOpenChange={setBuy}
        onPurchased={(p) => setAddons((xs) => [{ id: `${p.id}${Date.now()}`, name: `${p.hours} hours`, hours: `+${p.hours} hours`, price: p.price, date: "Nov 26, 2026" }, ...xs])} />
      <ListModal open={histOpen} onOpenChange={setHistOpen} title="Subscription history" subtitle={`${hist.length} periods, newest first`}>
        <ul className="space-y-2">{hist.map((h, i) => <HistRow key={i} h={h} />)}</ul>
      </ListModal>

      <ListModal open={vouOpen} onOpenChange={setVouOpen} title="Vouchers" subtitle="Tap a code to copy it."
        filters={<VoucherFilter value={vf} onChange={setVf} />}>
        {vList.length
          ? <ul className="space-y-3">{vList.map((v) => <VoucherTicket key={v.code} v={v} />)}</ul>
          : <p className="py-10 text-center text-[13px] text-muted-foreground">No {vf.toLowerCase()} vouchers.</p>}
      </ListModal>

    </>
  );
}

