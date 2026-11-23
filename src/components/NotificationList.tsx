import { useNavigate } from "@tanstack/react-router";
import { BellOff, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { KIND, stamp, useNotifications, type Noti } from "@/lib/notifications";

export type NotiTab = "all" | "unread";

/** All / Unread segmented filter, shared by the mobile screen and the desktop bell panel */
export function NotiFilter({ tab, onTab, className }: { tab: NotiTab; onTab: (t: NotiTab) => void; className?: string }) {
  const { items, unread } = useNotifications();
  return (
    <div role="tablist" className={cn("inline-flex rounded-full border border-white/[0.06] bg-white/[0.03] p-1", className)}>
      {(["all", "unread"] as const).map((t) => (
        <button key={t} role="tab" aria-selected={tab === t} onClick={() => onTab(t)}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
            tab === t ? "bg-white/[0.09] text-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" : "text-muted-foreground hover:text-foreground",
          )}>
          {t === "all" ? "All" : "Unread"}
          <span className={cn("min-w-5 rounded-full px-1.5 text-center text-[10.5px] font-semibold leading-[18px] tabular-nums",
            t === "unread" && unread > 0 ? "bg-primary text-primary-foreground" : "bg-white/[0.07] text-muted-foreground")}>
            {t === "all" ? items.length : unread}
          </span>
        </button>
      ))}
    </div>
  );
}

export function NotiList({ tab, onOpen, compact }: { tab: NotiTab; onOpen?: () => void; compact?: boolean }) {
  const { items } = useNotifications();
  const list = tab === "unread" ? items.filter((n) => n.unread) : items;
  if (list.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-inset ring-white/[0.06]">
          <BellOff className="h-5 w-5 text-muted-foreground" />
        </span>
        <div>
          <div className="text-[14px] font-semibold">You're all caught up</div>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">New updates on workouts, your plan and subscription show up here.</p>
        </div>
      </div>
    );
  }
  return (
    <ul className="space-y-1.5">
      {list.map((n) => <li key={n.id}><NotiRow n={n} onOpen={onOpen} compact={compact} /></li>)}
    </ul>
  );
}

function NotiRow({ n, onOpen, compact }: { n: Noti; onOpen?: () => void; compact?: boolean }) {
  const navigate = useNavigate();
  const { markRead, answerInvite } = useNotifications();
  const k = KIND[n.kind];
  const Icon = k.icon;
  const open = () => {
    markRead(n.id);
    onOpen?.();
    navigate({ to: n.to, search: n.search as never });
  };
  return (
    <div
      role="button" tabIndex={0} onClick={open}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } }}
      className={cn(
        "group relative flex cursor-pointer gap-3 rounded-2xl border p-3.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        n.unread ? "border-primary/20 bg-primary/[0.05] hover:border-primary/35 hover:bg-primary/[0.08]" : "border-white/[0.05] bg-white/[0.015] hover:border-white/[0.1] hover:bg-white/[0.05]",
      )}>
      <span className={cn("flex shrink-0 items-center justify-center rounded-xl ring-1 ring-inset", k.tone, compact ? "h-8 w-8" : "h-9 w-9")}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{k.label}</span>
          {n.unread && <span aria-label="Unread" className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />}
          <span className="ml-auto shrink-0 text-[11px] tabular-nums text-muted-foreground">{stamp(n.ago)}</span>
        </div>
        <p className={cn("mt-1 text-[13.5px] leading-snug", n.unread ? "font-medium text-foreground" : "text-foreground/75")}>{n.text}</p>

        {n.kind === "invite" && (
          n.invite === "pending" ? (
            <div className="mt-2.5 flex gap-2" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => { answerInvite(n.id, "accepted"); toast.success("You joined Uyen 86's team"); }}
                className="h-8 rounded-full bg-gradient-to-r from-primary to-secondary px-4 text-[12.5px] font-semibold text-white transition hover:brightness-110 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                Accept
              </button>
              <button onClick={() => { answerInvite(n.id, "declined"); toast("Invitation declined"); }}
                className="h-8 rounded-full border border-white/10 px-4 text-[12.5px] font-medium text-muted-foreground transition hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                Decline
              </button>
            </div>
          ) : (
            <div className={cn("mt-2 inline-flex items-center gap-1 text-[12px] font-medium", n.invite === "accepted" ? "text-success" : "text-muted-foreground")}>
              {n.invite === "accepted" && <Check className="h-3.5 w-3.5" />}
              {n.invite === "accepted" ? "Joined the team" : "Declined"}
            </div>
          )
        )}
      </div>
    </div>
  );
}
