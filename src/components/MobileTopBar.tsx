import { Bell, ClipboardList, Menu, LogOut, UserCircle, ChevronRight, User as UserIcon, CreditCard, Gift, Mail, Settings as SettingsIcon, HelpCircle, LifeBuoy, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, Link } from "@tanstack/react-router";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAuth, signOut } from "@/lib/auth-store";
import logo from "@/assets/poscura-logo.png";

const PRIMARY_ITEMS = [
  { label: "My Account", icon: UserIcon, to: "/account" as const },
  { label: "Settings", icon: SettingsIcon, to: "/settings" as const },
];

const SECONDARY_ITEMS = [
  { label: "How Poscura Works", icon: HelpCircle, to: "/support" as const },
  { label: "Support", icon: LifeBuoy, to: "/support" as const },
];

export function MobileTopBar() {
  const navigate = useNavigate();
  const user = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const go = (to: "/account" | "/settings" | "/support" | "/login" | "/checkout") => {
    setMenuOpen(false);
    navigate({ to });
  };

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-background/80 backdrop-blur-xl sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <button
          data-tb-inline
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="h-9 w-9 rounded-full bg-card border border-border flex items-center justify-center"
        >
          <Menu className="h-4 w-4" />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Poscura" className="h-8 w-8 rounded-lg object-contain" />
          <div className="leading-tight">
            <div className="font-bold text-sm tracking-tight">Poscura</div>
          </div>
        </Link>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-full sm:max-w-sm p-0 flex flex-col gap-0 overflow-y-auto bg-background [&>button]:hidden">
          <SheetTitle className="sr-only">Menu</SheetTitle>

          {/* Close bar */}
          <div className="flex items-center justify-between px-4 pt-4">
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="h-9 w-9 rounded-full bg-card border border-border flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
            <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
              <img src={logo} alt="Poscura" className="h-7 w-7 rounded-lg object-contain" />
              <span className="font-bold text-sm tracking-tight">Poscura</span>
            </Link>
            <div className="h-9 w-9" />
          </div>

          {/* Profile card */}
          <div className="px-4 pt-3">
            <div className="relative rounded-2xl p-3.5 bg-gradient-to-br from-primary to-secondary text-white shadow-[var(--shadow-card)] overflow-hidden">
              <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-white/15 blur-3xl" />
              <div className="relative flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-white/95 text-primary text-base font-bold flex items-center justify-center shadow ring-2 ring-white/40 shrink-0">
                  {user?.initials ?? "?"}
                </div>
                <div className="leading-tight min-w-0 flex-1">
                  <div className="font-semibold text-sm truncate">
                    {user ? `${user.firstName} ${user.lastName.charAt(0)}.` : "Guest"}
                  </div>
                  <div className="text-[11px] text-white/80 truncate">{user?.email ?? "Sign in to continue"}</div>
                  <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur border border-white/30 text-[10px] font-semibold">
                    <span className="h-1 w-1 rounded-full bg-white" />
                    {user?.plan ?? "Freemium"}
                  </div>
                </div>
                <button
                  onClick={() => go("/checkout")}
                  className="relative h-8 px-3 rounded-lg bg-white text-primary text-xs font-semibold flex items-center gap-1 shadow hover:bg-white/95 transition-colors shrink-0"
                >
                  Upgrade
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="flex-1 px-4 py-5 space-y-5">
            <div>
              <div className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Account</div>
              <div className="rounded-2xl bg-card border border-border overflow-hidden">
                {PRIMARY_ITEMS.map((item, i) => (
                  <button
                    key={item.label}
                    onClick={() => go(item.to)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-muted/40 transition-colors ${i > 0 ? "border-t border-border" : ""}`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                        <item.icon className="h-4 w-4 text-foreground" />
                      </span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Help</div>
              <div className="rounded-2xl bg-card border border-border overflow-hidden">
                {SECONDARY_ITEMS.map((item, i) => (
                  <button
                    key={item.label}
                    onClick={() => go(item.to)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-muted/40 transition-colors ${i > 0 ? "border-t border-border" : ""}`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                        <item.icon className="h-4 w-4 text-foreground" />
                      </span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => { signOut(); go("/login"); }}
              className="w-full h-11 rounded-2xl bg-card border border-border text-destructive text-sm font-semibold flex items-center justify-center gap-2 hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>

          <div className="px-4 py-5 text-center text-xs text-muted-foreground border-t border-border">
            <div className="flex items-center justify-center gap-2 mb-1">
              <img src={logo} alt="Poscura" className="h-5 w-5" />
              <span className="font-semibold text-foreground tracking-wide">POSCURA</span>
            </div>
            <div>Version 1.1.0</div>
            <div>© 2025 Poscura — All rights reserved</div>
          </div>
        </SheetContent>
      </Sheet>

      {/* iPhone Duo: the same actions as a vertical toolbar on the trailing edge, under the status bar.
          Portalled to <body> so the header's backdrop blur doesn't trap the fixed position. */}
      {mounted && createPortal(<div data-side-toolbar className="fixed right-3 top-[84px] landscape:top-[60px] z-40 w-[72px] flex-col items-center gap-2 py-2.5 rounded-[28px] border border-sidebar-border bg-sidebar/85 backdrop-blur-xl shadow-[0_18px_40px_-12px_rgba(0,0,0,.6)]">
        <button onClick={() => setMenuOpen(true)} aria-label="Open menu"
          className="h-10 w-10 rounded-full flex items-center justify-center text-sidebar-foreground/80 hover:bg-white/5">
          <Menu className="h-[18px] w-[18px]" />
        </button>
        <span aria-hidden className="h-px w-7 bg-sidebar-border" />
        <button onClick={() => navigate({ to: "/discomfort" })} aria-label="Log discomfort"
          className="h-10 w-10 rounded-full flex items-center justify-center text-sidebar-foreground/80 hover:bg-white/5">
          <ClipboardList className="h-[18px] w-[18px]" />
        </button>
        <button onClick={() => navigate({ to: "/notifications" })} aria-label="Notifications"
          className="relative h-10 w-10 rounded-full flex items-center justify-center text-sidebar-foreground/80 hover:bg-white/5">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-0.5 right-0 text-[9px] px-1 rounded-full bg-destructive text-destructive-foreground font-semibold">9+</span>
        </button>
      </div>, document.body)}

      <div data-tb-inline className="flex items-center gap-1.5">
        <button onClick={() => navigate({ to: "/discomfort" })} aria-label="Log discomfort"
          className="h-9 w-9 rounded-full bg-card border border-border flex items-center justify-center">
          <ClipboardList className="h-4 w-4" />
        </button>
        <button onClick={() => navigate({ to: "/notifications" })} aria-label="Notifications"
          className="relative h-9 w-9 rounded-full bg-card border border-border flex items-center justify-center">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 text-[9px] px-1 rounded-full bg-destructive text-destructive-foreground font-semibold">9+</span>
        </button>
        {!user && (
          <Link to="/login" className="h-9 px-3 rounded-full bg-card border border-border flex items-center text-xs font-medium">
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
