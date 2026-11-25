import { useState } from "react";
import { toast } from "sonner";
import {
  Star, CircleCheck, Check, ChevronDown, CalendarClock, CreditCard, Ticket, Building2, Plus, Copy, LogOut, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PlanPicker } from "@/components/PlanPicker";
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

type Voucher = { name: string; code: string; off: string; until: string };
const VOUCHERS: Voucher[] = [
  { name: "Voucher Individual Only", code: "CODE1111", off: "80% OFF", until: "12/11/2026 10:11" },
  { name: "SNTKDEDVD", code: "ANTRUONG98", off: "10% OFF", until: "12/10/2026 17:47" },
  { name: "WorldCup2026", code: "WCSM2026", off: "10% OFF", until: "11/28/2026 11:45" },
  { name: "Welcome back", code: "WELCOME10", off: "10% OFF", until: "01/15/2027 23:59" },
];

/* ---------- small building blocks ---------- */
function Card({ title, action, children, className }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-[22px] border border-white/[0.06] bg-card p-5", className)}>
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
const statusTone = { Active: "bg-success/12 text-success ring-success/25", Expired: "bg-white/[0.05] text-muted-foreground ring-white/10", Cancelled: "bg-destructive/12 text-destructive ring-destructive/25" };

function MoreButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="mx-auto mt-3 flex h-9 items-center gap-1 rounded-full px-3 text-[12.5px] font-semibold text-primary transition hover:bg-primary/10">
      {open ? "View less" : "View more"} <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
    </button>
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

const toUpgrade = () => document.getElementById("upgrade-your-plan")?.scrollIntoView({ behavior: "smooth", block: "start" });

/* ---------- voucher as a ticket: discount stub, perforation, details ---------- */
function VoucherTicket({ v }: { v: Voucher }) {
  const [copied, setCopied] = useState(false);
  const [mm, dd, rest] = v.until.split("/");
  const end = new Date(`${rest.slice(0, 4)}-${mm}-${dd}T${rest.slice(5) || "23:59"}`);
  const days = Math.ceil((end.getTime() - Date.now()) / 86400000);
  const soon = days >= 0 && days <= 7;
  const pct = v.off.replace(/\s*OFF/i, "");
  const copy = () => {
    navigator.clipboard?.writeText(v.code);
    setCopied(true); toast.success(`Copied ${v.code}`);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <li className="group relative flex overflow-hidden rounded-[18px] bg-gradient-to-r from-white/[0.05] to-white/[0.02] ring-1 ring-inset ring-white/[0.07] transition hover:ring-primary/30">
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
        <div className="line-clamp-2 text-[14px] font-semibold leading-snug">{v.name}</div>
        <button onClick={copy} aria-label={`Copy code ${v.code}`}
          className="mt-2 inline-flex h-8 items-center gap-2 rounded-lg border border-dashed border-primary/40 bg-primary/[0.08] px-2.5 font-mono text-[12.5px] font-semibold tracking-[0.08em] text-foreground transition hover:border-primary/70 hover:bg-primary/15 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
          {v.code}
          {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5 text-primary" />}
        </button>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-muted-foreground">
          <span>Valid until {end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          {soon && <span className="rounded-full bg-warning/12 px-2 py-px font-semibold text-warning ring-1 ring-inset ring-warning/25">{days <= 1 ? "Ends today" : `${days} days left`}</span>}
        </div>
      </div>
    </li>
  );
}

/* ---------- the tab ---------- */
export function PlanTab({ plan }: { plan: PlanKind }) {
  const [addons, setAddons] = useState<AddOn[]>([
    { id: "h1", name: "Heavy Monitoring", hours: "+40 hours / month", price: 299000, date: "Jun 24, 2026" },
    { id: "l1", name: "Light Monitoring", hours: "+10 hours / month", price: 119000, date: "May 25, 2026" },
  ]);
  const [browse, setBrowse] = useState(false);
  const [histOpen, setHistOpen] = useState(false);
  const [vouOpen, setVouOpen] = useState(false);
  const hist = HISTORY[plan];
  const unlimited = plan !== "free";

  return (
    <>
      {/* ---------- left: plan, usage, benefits ---------- */}
      <div className="space-y-4 fold:col-start-1">
        {/* current plan */}
        <Card className={cn(plan === "business" && "border-success/25 bg-gradient-to-b from-success/[0.06] to-card")}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Current plan</div>
              <div className="mt-1.5 text-[24px] font-bold leading-tight tracking-tight">
                {plan === "free" ? "Freemium" : plan === "individual" ? "Individual" : "Professional"}
              </div>
              <div className="mt-0.5 text-[13px] text-muted-foreground">
                {plan === "free" && "Free forever. No billing."}
                {plan === "individual" && <><span className="font-semibold text-foreground">{vnd(299000)}</span> / month · Visa •••• 4417</>}
                {plan === "business" && <>Business member · <span className="text-foreground/90">Uyen86SME</span></>}
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
            ) : (
              <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset", statusTone.Active)}>Active</span>
            )}
          </div>

          {plan === "business" ? (
            <>
              <div className="mt-4 flex gap-2.5 rounded-[16px] bg-success/[0.08] p-3.5 ring-1 ring-inset ring-success/20">
                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <div>
                  <div className="text-[13.5px] font-semibold">Covered by Uyen86SME</div>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">All Professional benefits are active. You can also choose a personal plan at any time.</p>
                </div>
              </div>
              <Confirm
                trigger={<button className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/10 text-[13.5px] font-semibold text-foreground/85 transition hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"><LogOut className="h-4 w-4" /> Leave business</button>}
                title="Leave Uyen86SME?"
                body="You lose the Professional benefits your business pays for and move back to Freemium. Your history and reports stay with you."
                action="Leave business"
                onConfirm={() => toast("You left Uyen86SME")}
              />
            </>
          ) : (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-[16px] bg-gradient-to-r from-primary/20 via-primary/[0.08] to-transparent p-3.5 ring-1 ring-inset ring-primary/20">
              <p className="text-[13px] font-medium">{plan === "free" ? "Upgrade your plan to access advanced tools." : "Get team features with Family or Professional."}</p>
              <button onClick={toUpgrade} className={gradBtn}><Star className="h-3.5 w-3.5 fill-current" /> Upgrade</button>
            </div>
          )}
        </Card>

        {/* usage */}
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

        {plan === "business" && (
          <Card title="Professional benefits">
            <ul className="grid gap-2.5 sm:grid-cols-2 fold:grid-cols-1">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-center gap-2.5 text-[13.5px]">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15"><Check className="h-3 w-3 text-success" /></span>
                  {b}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {/* ---------- right: history, add-ons, vouchers ---------- */}
      <div className="space-y-4 fold:col-start-2">
        <Card title="Subscription history">
          <ul className="space-y-2">
            {(histOpen ? hist : hist.slice(0, 3)).map((h, i) => (
              <li key={i} className="rounded-[16px] border border-white/[0.06] bg-white/[0.02] p-3.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[14px] font-semibold">{h.plan} · {h.cycle}</span>
                  <span className="shrink-0 text-[14px] font-semibold tabular-nums">{h.price}</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-3">
                  <span className={cn("rounded-full px-2 py-px text-[10.5px] font-semibold ring-1 ring-inset", statusTone[h.status])}>{h.status}</span>
                  <span className="text-[11.5px] text-muted-foreground">{h.date}</span>
                </div>
                <div className="mt-2.5 space-y-1 border-t border-white/[0.05] pt-2.5 text-[12px] text-muted-foreground">
                  <div className="flex items-start gap-1.5"><CalendarClock className="mt-px h-3.5 w-3.5 shrink-0" /> {h.period}</div>
                  <div className="flex items-start gap-1.5">{h.price === "Covered" ? <Building2 className="mt-px h-3.5 w-3.5 shrink-0" /> : <CreditCard className="mt-px h-3.5 w-3.5 shrink-0" />} {h.paid}</div>
                </div>
              </li>
            ))}
          </ul>
          {hist.length > 3 && <MoreButton open={histOpen} onClick={() => setHistOpen((v) => !v)} />}
        </Card>

        <Card title="Add-ons" action={<button onClick={() => setBrowse(true)} className={outlineBtn}><Plus className="h-3.5 w-3.5" /> Browse add-ons</button>}>
          {addons.length ? (
            <ul className="space-y-2">
              {addons.map((a) => (
                <li key={a.id} className="rounded-[16px] border border-white/[0.06] bg-white/[0.02] p-3.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[14px] font-semibold">{a.name}</span>
                    <span className="shrink-0 text-[14px] font-semibold tabular-nums">{vnd(a.price)}</span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-3 text-[11.5px] text-muted-foreground">
                    <span className="flex items-center gap-2"><span className={cn("rounded-full px-2 py-px text-[10.5px] font-semibold ring-1 ring-inset", statusTone.Active)}>Active</span>{a.hours}</span>
                    <span>{a.date}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="text-[13px] text-muted-foreground">No add-ons yet.</p>}
        </Card>

        <Card title="Vouchers" action={<span className="text-[12px] text-muted-foreground">{VOUCHERS.length} active · tap a code to copy</span>}>
          <ul className="space-y-3">
            {(vouOpen ? VOUCHERS : VOUCHERS.slice(0, 3)).map((v) => <VoucherTicket key={v.code} v={v} />)}
          </ul>
          {VOUCHERS.length > 3 && <MoreButton open={vouOpen} onClick={() => setVouOpen((v) => !v)} />}
        </Card>
      </div>

      {/* ---------- last: plans to upgrade to ---------- */}
      <section id="upgrade-your-plan" className="scroll-mt-20 rounded-[22px] border border-white/[0.06] bg-card p-5 fold:col-span-2">
        <h2 className="mb-4 text-center text-[17px] font-semibold tracking-tight">Upgrade your plan</h2>
        <PlanPicker currentId={plan === "free" ? "freemium" : plan === "individual" ? "individual" : "none"} />
      </section>

      <Dialog open={browse} onOpenChange={setBrowse}>
        <DialogContent className="max-w-sm rounded-[22px]">
          <DialogHeader>
            <DialogTitle>Browse add-ons</DialogTitle>
            <DialogDescription>Extra monitoring hours on top of your plan, renewed monthly.</DialogDescription>
          </DialogHeader>
          <ul className="space-y-2">
            {ADDON_SHOP.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 rounded-[16px] border border-white/[0.08] p-3.5">
                <div>
                  <div className="text-[14px] font-semibold">{a.name}</div>
                  <div className="text-[12px] text-muted-foreground">{a.hours} · {vnd(a.price)}</div>
                </div>
                <button className={gradBtn} onClick={() => {
                  setAddons((xs) => [{ id: `${a.id}${Date.now()}`, name: a.name, hours: a.hours, price: a.price, date: "Nov 25, 2026" }, ...xs]);
                  setBrowse(false); toast.success(`${a.name} added`);
                }}>Add</button>
              </li>
            ))}
          </ul>
          <DialogFooter>
            <button onClick={() => setBrowse(false)} className={outlineBtn}><X className="h-3.5 w-3.5" /> Close</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

