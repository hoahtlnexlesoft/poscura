import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bell, ClipboardList, Crown, Home, Activity, Dumbbell, Users, Settings, HelpCircle, LifeBuoy, CheckCheck,
  ArrowRight, User as UserIcon, LogOut, PanelLeftClose, PanelLeftOpen, ChevronsUpDown,
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
import { useNarrow } from "@/desktop/useDesk";

/* Desktop (≥1200px) chrome: left sidebar + top bar. Below that width the mobile top bar / tab bar take over. */

const NAV = [
  { label: "Dashboard", to: "/", icon: Home },
  { label: "Posture Monitor", to: "/posture-monitor", icon: Activity },
  { label: "Workout", to: "/workout", icon: Dumbbell },
  { label: "Community", to: "/community", icon: Users },
  { label: "Settings", to: "/settings", icon: Settings },
  { label: "How Poscura Works", to: "/how-it-works", icon: HelpCircle },
  { label: "FAQs", to: "/support", icon: LifeBuoy },
] as const;

const SB_KEY = "poscura.sidebar";
function useSidebar() {
  const [pref, setPref] = useState<boolean>(() => { try { return localStorage.getItem(SB_KEY) === "1"; } catch { return false; } });
  // narrow window: fold to the icon rail automatically (Slack-style) without overwriting the saved choice
  const narrow = useNarrow();
  const collapsed = narrow || pref;
  useEffect(() => {
    // the shell's left padding follows the sidebar width
    document.documentElement.style.setProperty("--desk-sb", collapsed ? "76px" : "248px");
  }, [collapsed]);
  useEffect(() => { try { localStorage.setItem(SB_KEY, pref ? "1" : "0"); } catch { /* private mode */ } }, [pref]);
  return [collapsed, (v: boolean | ((c: boolean) => boolean)) => setPref((p) => (typeof v === "function" ? v(narrow || p) : v)), narrow] as const;
}

export function DesktopSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [collapsed, setCollapsed, narrow] = useSidebar();
  return (
    <aside data-desk-sidebar data-collapsed={collapsed || undefined}
      className={cn("fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-white/[0.06] bg-[#0b0f18]/90 pb-5 pt-4 backdrop-blur-xl transition-[width] duration-300 desk:flex", collapsed ? "w-[76px] px-3" : "w-[248px] px-4")}>
      <div className={cn("flex h-11 items-center", collapsed ? "justify-center" : "justify-between pl-2")}>
        {narrow && <Link to="/" aria-label="Poscura"><img src={logo} alt="" className="h-8 w-8 rounded-lg object-contain" /></Link>}
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="" className="h-8 w-8 rounded-lg object-contain" />
            <span className="text-[16px] font-bold tracking-[0.1em]">POSCURA</span>
          </Link>
        )}
        {!narrow && <button onClick={() => setCollapsed((c) => !c)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand" : "Collapse"}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
          {collapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" /> : <PanelLeftClose className="h-[18px] w-[18px]" />}
        </button>}
      </div>

      <nav className="mt-6 flex flex-col gap-1">
        {NAV.map((n) => {
          const on = n.to === "/" ? path === "/" : path.startsWith(n.to);
          return (
            <Link key={n.label} to={n.to} title={collapsed ? n.label : undefined}
              className={cn(
                "group relative flex h-11 items-center rounded-xl text-[14px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                collapsed ? "justify-center" : "gap-3 px-3.5",
                on ? "bg-gradient-to-r from-primary to-secondary text-white shadow-[0_10px_24px_-14px] shadow-primary" : "text-foreground/65 hover:bg-white/[0.05] hover:text-foreground",
              )}>
              <n.icon className={cn("h-[18px] w-[18px] shrink-0", !on && "text-muted-foreground group-hover:text-foreground")} />
              {!collapsed && n.label}
            </Link>
          );
        })}
      </nav>

      {/* bottom-left: plan, alerts and the account, like Slack / Linear, so pages get the full height */}
      <SidebarFooter collapsed={collapsed} />
    </aside>
  );
}

const rowBtn = "group relative flex h-10 w-full items-center gap-3 rounded-xl px-3.5 text-[14px] font-medium text-foreground/65 transition hover:bg-white/[0.05] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 data-[state=open]:bg-white/[0.06] data-[state=open]:text-foreground";
const iconBtn = "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] text-foreground/80 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 data-[state=open]:border-primary/50 data-[state=open]:bg-primary/10 data-[state=open]:text-primary";

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  const navigate = useNavigate();
  const user = useAuth();
  const name = user ? `${user.firstName} ${user.lastName}` : "Guest";
  const avatar = (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-[12.5px] font-bold text-white ring-2 ring-white/10">{user?.initials ?? "?"}</span>
  );
  const upgrade = "inline-flex h-10 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary text-[14px] font-semibold text-white shadow-[0_10px_24px_-14px] shadow-primary transition hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60";
  return (
    <div className={cn("mt-auto flex flex-col gap-1 border-t border-white/[0.06] pt-3", collapsed && "items-center")}>
      {/* alerts read like the nav above: icon + label rows (icons only when collapsed) */}
      <NotificationBell collapsed={collapsed} />
      <button onClick={() => navigate({ to: "/discomfort" })} aria-label="Log discomfort" title={collapsed ? "Log discomfort" : undefined}
        className={collapsed ? iconBtn : rowBtn}>
        <ClipboardList className={cn("h-[18px] w-[18px] shrink-0", !collapsed && "text-muted-foreground group-hover:text-foreground")} />
        {!collapsed && "Log discomfort"}
      </button>
      <Link to="/checkout" title={collapsed ? "Upgrade" : undefined} aria-label="Upgrade" className={cn(upgrade, "mt-2", collapsed ? "w-10" : "w-full px-4")}>
        <Crown className="h-4 w-4" />{!collapsed && "Upgrade"}
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger aria-label="Account" style={{ marginTop: 8 }}
          className={cn("group flex items-center rounded-2xl text-left transition hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 data-[state=open]:bg-white/[0.06]",
            collapsed ? "justify-center p-1" : "gap-3 p-2")}>
          {avatar}
          {!collapsed && (<>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-semibold">{name}</span>
              <span className="block truncate text-[11.5px] text-muted-foreground">{user?.email}</span>
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
          </>)}
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="end" sideOffset={14} className="w-56">
          <DropdownMenuLabel>
            <div className="text-[13px] font-semibold">{name}</div>
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
    </div>
  );
}

/** Bell + notification panel. Desktop keeps the panel (users stay on their page); phones open the full screen instead. */
function NotificationBell({ collapsed = false }: { collapsed?: boolean }) {
  const { unread, markAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<NotiTab>("all");
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} className={collapsed ? iconBtn : rowBtn}>
        <Bell className={cn("h-[18px] w-[18px] shrink-0", !collapsed && "text-muted-foreground group-hover:text-foreground")} />
        {!collapsed && <span className="flex-1 text-left">Notifications</span>}
        {unread > 0 && (collapsed
          ? <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-destructive px-1 text-center text-[10px] font-semibold leading-[18px] text-white ring-2 ring-background">{badge(unread)}</span>
          : <span className="min-w-[20px] rounded-full bg-destructive px-1.5 text-center text-[11px] font-semibold leading-[20px] text-white">{badge(unread)}</span>)}
      </PopoverTrigger>
      <PopoverContent side="right" align="end" sideOffset={collapsed ? 30 : 28} collisionPadding={16}
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
