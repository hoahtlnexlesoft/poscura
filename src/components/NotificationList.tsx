import { useNavigate } from "@tanstack/react-router";
import { BellOff } from "lucide-react";
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
  const today = list.filter((n) => n.ago < 24 * 60);
  const earlier = list.filter((n) => n.ago >= 24 * 60);
  return (
    <div className="space-y-4">
      {[["Today", today], ["Earlier", earlier]].map(([label, xs]) => (xs as Noti[]).length > 0 && (
        <section key={label as string}>
          <h3 className="mb-1 px-3 text-[11.5px] font-semibold text-muted-foreground">{label as string}</h3>
          <ul className="space-y-1">
            {(xs as Noti[]).map((n) => <li key={n.id}><NotiRow n={n} onOpen={onOpen} compact={compact} /></li>)}
          </ul>
        </section>
      ))}
    </div>
  );
}

function NotiRow({ n, onOpen, compact }: { n: Noti; onOpen?: () => void; compact?: boolean }) {
  const navigate = useNavigate();
  const { markRead } = useNotifications();
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
        "group relative flex cursor-pointer gap-3 overflow-hidden rounded-xl px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        // unread: tinted row; read rows stay quiet
        n.unread ? "bg-primary/[0.08] hover:bg-primary/[0.12]" : "hover:bg-white/[0.04]",
      )}>
      <span className={cn("flex shrink-0 items-center justify-center rounded-full ring-1 ring-inset", k.tone, compact ? "h-9 w-9" : "h-10 w-10", !n.unread && "opacity-60 saturate-50")}>
        <Icon className="h-4 w-4" />
      </span>
      <div className={cn("min-w-0 flex-1", n.unread ? "pr-11" : "pr-1")}>
        <div className="flex items-baseline gap-1.5 text-[12px] text-muted-foreground">
          <span className={cn("truncate font-semibold", n.unread ? "text-foreground" : "text-foreground/55")}>{k.label}</span>
          <span aria-hidden>·</span>
          <span className="shrink-0 tabular-nums">{stamp(n.ago)}</span>
        </div>
        <p className={cn("mt-0.5 text-[13.5px] leading-snug", compact && "line-clamp-2", n.unread ? "font-medium text-foreground" : "text-muted-foreground/80")}>{n.text}</p>

      </div>
      {n.unread && <span className="absolute right-3 top-3 rounded-full bg-primary px-1.5 py-px text-[10px] font-bold uppercase tracking-wide text-white">New</span>}
    </div>
  );
}
