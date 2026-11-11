import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Activity, Dumbbell, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Monitor", url: "/posture-monitor", icon: Activity },
  { title: "Workout", url: "/workout", icon: Dumbbell },
  { title: "Community", url: "/community", icon: Users },
];

export function BottomNav() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-sidebar/95 backdrop-blur-xl border-t border-sidebar-border safe-bottom rail:inset-x-auto rail:right-3 rail:top-1/2 rail:bottom-auto rail:-translate-y-1/2 rail:w-[72px] rail:py-3 rail:rounded-[28px] rail:border rail:border-sidebar-border rail:bg-sidebar/85 rail:shadow-[0_18px_40px_-12px_rgba(0,0,0,.6)] rail:flex rail:items-center">
      <div className="grid grid-cols-4 max-w-md mx-auto rail:grid-cols-1 rail:gap-2 rail:w-full">
        {items.map((item) => {
          const active = currentPath === item.url;
          return (
            <Link key={item.url} to={item.url}
              className={cn("flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition",
                active ? "text-primary" : "text-sidebar-foreground/70")}>
              <span className={cn("flex items-center justify-center rail:h-8 rail:w-14 rail:rounded-full rail:transition", active && "rail:bg-primary/15")}>
                <item.icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_8px_var(--color-primary)]")} />
              </span>
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
