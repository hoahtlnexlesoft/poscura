import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bell, ClipboardList, Crown, Home, Activity, Dumbbell, Users, Settings, HelpCircle, LifeBuoy, CheckCheck,
  ArrowRight, User as UserIcon, LogOut, PanelLeftClose,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotiFilter, NotiList, type NotiTab } from "@/components/NotificationList";
import { useNotifications, badge } from "@/lib/notifications";
import { useAuth, signOut } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import logo from "@/assets/poscura-logo.png";

/* Desktop (≥1200px) chrome: left sidebar + top bar. Below that width the mobile top bar / tab bar take over. */

const NAV = [
  { label: "Dashboard", to: "/", icon: Home },
  { label: "Posture Monitor", to: "/posture-monitor", icon: Activity },
  { label: "Workout", to: "/workout", icon: Dumbbell },
  { label: "Community", to: "/community", icon: Users },
  { label: "Settings", to: "/settings", icon: Settings },
  { label: "How Poscura Works", to: "/support", icon: HelpCircle },
] as const;

export function DesktopSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <aside data-desk-sidebar className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r border-white/[0.06] bg-sidebar/60 px-4 pb-5 pt-5 backdrop-blur-xl desk:flex">
      <div className="flex h-11 items-center justify-between px-2">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="" className="h-8 w-8 rounded-lg object-contain" />
          <span className="text-[17px] font-bold tracking-[0.08em]">POSCURA</span>
        </Link>
        <button aria-label="Collapse sidebar" className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground">
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      <nav className="mt-7 flex flex-col gap-1">
        {NAV.map((n) => {
          const on = n.to === "/" ? path === "/" : path.startsWith(n.to);
          return (
            <Link key={n.label} to={n.to}
              className={cn(
                "group flex h-11 items-center gap-3 rounded-xl px-3.5 text-[14px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                on ? "bg-gradient-to-r from-primary to-secondary text-white shadow-[0_10px_24px_-14px] shadow-primary" : "text-foreground/70 hover:bg-white/[0.05] hover:text-foreground",
              )}>
              <n.icon className={cn("h-[18px] w-[18px]", !on && "text-muted-foreground group-hover:text-foreground")} />
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-white/[0.06] bg-gradient-to-br from-primary/15 via-transparent to-secondary/10 p-4">
        <div className="flex items-center gap-2 text-[13px] font-semibold"><Crown className="h-4 w-4 text-warning" /> Go Premium</div>
        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">Unlimited monitoring time and full session reports.</p>
        <Link to="/checkout" className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold text-primary transition hover:gap-1.5">
          See plans <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </aside>
  );
}

const iconBtn = "relative flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] text-foreground/80 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 data-[state=open]:border-primary/50 data-[state=open]:bg-primary/10 data-[state=open]:text-primary";

export function DesktopTopBar() {
  const navigate = useNavigate();
  const user = useAuth();
  return (
    <header className="sticky top-0 z-30 hidden h-16 items-center justify-end gap-2.5 border-b border-white/[0.06] bg-background/80 px-8 backdrop-blur-xl desk:flex">
      <Link to="/checkout"
        className="mr-1 inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-4 text-[14px] font-semibold text-white shadow-[0_10px_24px_-14px] shadow-primary transition hover:brightness-110 active:scale-[0.98]">
        <Crown className="h-4 w-4" /> Upgrade
      </Link>
      <NotificationBell />
      <button onClick={() => navigate({ to: "/discomfort" })} aria-label="Log discomfort" title="Log discomfort" className={iconBtn}>
        <ClipboardList className="h-[18px] w-[18px]" />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger aria-label="Account" className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-[13px] font-bold text-white ring-2 ring-white/10 transition hover:ring-primary/50 focus-visible:outline-none focus-visible:ring-primary/70">
          {user?.initials ?? "?"}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="text-[13px] font-semibold">{user ? `${user.firstName} ${user.lastName}` : "Guest"}</div>
            <div className="text-[11.5px] font-normal text-muted-foreground">{user?.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate({ to: "/account" })}><UserIcon className="h-4 w-4" /> My Account</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}><Settings className="h-4 w-4" /> Settings</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate({ to: "/support" })}><LifeBuoy className="h-4 w-4" /> Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => { signOut(); navigate({ to: "/login" }); }}>
            <LogOut className="h-4 w-4" /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

/** Bell + notification panel. Desktop keeps the panel (users stay on their page); phones open the full screen instead. */
function NotificationBell() {
  const { unread, markAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<NotiTab>("all");
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} className={iconBtn}>
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-destructive px-1 text-center text-[10px] font-semibold leading-[18px] text-white ring-2 ring-background">{badge(unread)}</span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={10}
        className="flex w-[400px] flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-[#121a2a] p-0 shadow-[0_24px_64px_-12px_rgba(0,0,0,.8),0_0_0_1px_rgba(0,0,0,.4)]">
        <div className="border-b border-white/[0.06] px-4 pb-3 pt-4">
          <div className="flex items-center justify-between gap-3 pl-1">
            <h2 className="text-[16px] font-semibold tracking-tight">Notifications</h2>
            <button onClick={markAll} disabled={!unread}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-medium text-primary transition enabled:hover:bg-primary/10 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
              <CheckCheck className="h-4 w-4" /> Mark all as read
            </button>
          </div>
          <NotiFilter tab={tab} onTab={setTab} className="mt-3" />
        </div>
        <div className="mac-scroll max-h-[min(520px,calc(100vh-200px))] overflow-y-auto px-1.5 py-3">
          <NotiList tab={tab} compact onOpen={() => setOpen(false)} />
        </div>
        <Link to="/notifications" onClick={() => setOpen(false)}
          className="flex h-11 items-center justify-center gap-1.5 border-t border-white/[0.06] text-[13px] font-semibold text-primary transition hover:bg-primary/[0.06]">
          View all notifications <ArrowRight className="h-4 w-4" />
        </Link>
      </PopoverContent>
    </Popover>
  );
}
