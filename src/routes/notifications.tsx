import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Bell, Activity, Dumbbell, Users, AlertTriangle, FileText, CheckCheck, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({ component: NotificationsPage });

type Category = "posture" | "workout" | "report" | "community" | "system";

type Item = {
  id: string; category: Category; title: string; body: string; detail: string;
  time: string; ago: string; unread?: boolean;
  action: { label: string; to: "/posture-monitor" | "/workout" | "/community"; search?: Record<string, string> };
};

const SEED: Item[] = [
  { id: "1", category: "posture", title: "Posture alert", body: "Slouching for 15 minutes. Reset!", time: "2m", ago: "2 minutes ago", unread: true,
    detail: "You've been leaning forward for the last 15 minutes. Sit back, let your shoulders drop and bring your ears over your shoulders.",
    action: { label: "Open Posture Monitor", to: "/posture-monitor" } },
  { id: "2", category: "workout", title: "Workout reminder", body: "Mobility session in 5 min.", time: "20m", ago: "20 minutes ago", unread: true,
    detail: "Your neck mobility session starts in 5 minutes. It takes about 8 minutes and needs no equipment.",
    action: { label: "Go to Workout", to: "/workout" } },
  { id: "3", category: "report", title: "Report ready", body: "Morning report available.", time: "1h", ago: "1 hour ago", unread: true,
    detail: "Your morning session report is ready, with your average score, time in good posture and the areas to work on.",
    action: { label: "View report", to: "/posture-monitor", search: { report: "1" } } },
  { id: "4", category: "community", title: "New reply", body: "Maria replied to your post.", time: "3h", ago: "3 hours ago",
    detail: "Maria Santos replied to your post in Community.",
    action: { label: "Open Community", to: "/community" } },
  { id: "5", category: "system", title: "Camera disconnected", body: "Reconnect to resume.", time: "1d", ago: "Yesterday",
    detail: "The camera disconnected during your last session, so monitoring paused. Reconnect it to resume.",
    action: { label: "Reconnect camera", to: "/posture-monitor" } },
];

const META: Record<Category, { icon: typeof Bell; tone: string; label: string }> = {
  posture: { icon: Activity, tone: "text-primary bg-primary/10 border-primary/30", label: "Posture" },
  workout: { icon: Dumbbell, tone: "text-secondary bg-secondary/10 border-secondary/30", label: "Workout" },
  report: { icon: FileText, tone: "text-primary bg-primary/10 border-primary/30", label: "Report" },
  community: { icon: Users, tone: "text-success bg-success/10 border-success/30", label: "Community" },
  system: { icon: AlertTriangle, tone: "text-warning bg-warning/10 border-warning/30", label: "System" },
};

function NotificationsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState(SEED);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const unread = items.filter((n) => n.unread).length;
  const list = tab === "unread" ? items.filter((n) => n.unread) : items;

  const markRead = (id: string) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, unread: false } : x)));

  const open = (n: Item) => {
    markRead(n.id);
    navigate({ to: n.action.to, search: n.action.search as never });
  };

  return (
    <div className="fold:max-w-[640px]">
      <div className="flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Back
        </Link>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">Notifications</h1>
          <p className="text-xs text-muted-foreground">Stay on top of your posture journey.</p>
        </div>
        <button
          onClick={() => setItems((xs) => xs.map((x) => ({ ...x, unread: false })))}
          disabled={!unread}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10 disabled:opacity-40"
        >
          <CheckCheck className="h-3.5 w-3.5" /> Mark all read
        </button>
      </div>

      <div className="mt-4">
        {/* list */}
        <section>
          <div className="mb-3 inline-flex rounded-xl bg-muted/40 p-1">
            {(["all", "unread"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold transition",
                  tab === t ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t === "all" ? "All" : "Unread"}
                {t === "unread" && unread > 0 && (
                  <span className="rounded-full bg-primary px-1.5 text-[10px] leading-4 text-primary-foreground">{unread}</span>
                )}
              </button>
            ))}
          </div>

          {list.length === 0 ? (
            <div className="glass-card flex flex-col items-center gap-2 py-12 text-center">
              <BellOff className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">You're all caught up.</p>
            </div>
          ) : (
            <div className="glass-card overflow-hidden p-1.5">
              {list.map((n) => {
                const m = META[n.category]; const Icon = m.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => open(n)}
                    className="relative flex w-full items-start gap-3 rounded-xl p-3 text-left transition hover:bg-muted/30"
                  >
                    <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full border", m.tone)}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className={cn("truncate text-sm", n.unread ? "font-semibold" : "font-medium text-foreground/85")}>{n.title}</span>
                        <span className="ml-auto shrink-0 text-[10.5px] text-muted-foreground">{n.time}</span>
                      </span>
                      <span className="mt-0.5 flex items-center gap-2">
                        <span className="truncate text-xs text-muted-foreground">{n.body}</span>
                        {n.unread && <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-primary" />}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
