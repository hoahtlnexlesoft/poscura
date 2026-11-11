import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Bell, Activity, Dumbbell, Users, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/notifications")({ component: NotificationsPage });

type Category = "posture" | "workout" | "community" | "system";

const items: { id: string; category: Category; title: string; body: string; time: string; unread?: boolean }[] = [
  { id: "1", category: "posture", title: "Posture alert", body: "Slouching for 15 minutes. Reset!", time: "2m", unread: true },
  { id: "2", category: "workout", title: "Workout reminder", body: "Mobility session in 5 min.", time: "20m", unread: true },
  { id: "3", category: "posture", title: "Report ready", body: "Morning report available.", time: "1h", unread: true },
  { id: "4", category: "community", title: "New reply", body: "Maria replied to your post.", time: "3h" },
  { id: "5", category: "system", title: "Camera disconnected", body: "Reconnect to resume.", time: "1d" },
];

const meta: Record<Category, { icon: typeof Bell; tone: string }> = {
  posture: { icon: Activity, tone: "text-primary bg-primary/10 border-primary/30" },
  workout: { icon: Dumbbell, tone: "text-secondary bg-secondary/10 border-secondary/30" },
  community: { icon: Users, tone: "text-success bg-success/10 border-success/30" },
  system: { icon: AlertTriangle, tone: "text-warning bg-warning/10 border-warning/30" },
};

function NotificationsPage() {
  return (
    <div className="space-y-4 fold:max-w-[640px] fold:mx-auto">
      <div className="flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
          <ChevronLeft className="h-4 w-4" /> Back
        </Link>
        <button className="text-xs text-primary">Mark all read</button>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
          <Bell className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Notifications</h1>
          <p className="text-xs text-muted-foreground">Stay on top of your posture journey.</p>
        </div>
      </div>

      <div className="glass-card divide-y divide-border">
        {items.map((n) => {
          const m = meta[n.category]; const Icon = m.icon;
          return (
            <div key={n.id} className="flex items-start gap-3 p-3">
              <div className={`h-9 w-9 rounded-full border flex items-center justify-center shrink-0 ${m.tone}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm">{n.title}</h3>
                  {n.unread && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
