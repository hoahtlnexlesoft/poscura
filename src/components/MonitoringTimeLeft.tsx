import { Crown, Clock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-store";

type Props = {
  used?: number;
  monthly?: number;
  reward?: number;
  addon?: number;
};

function formatHM(m: number) {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return { h: String(h).padStart(2, "0"), m: String(mm).padStart(2, "0") };
}

export function MonitoringTimeLeft({
  used = 10,
  monthly = 290,
  reward = 75,
  addon = 120,
}: Props) {
  const user = useAuth();
  if (user && user.plan !== "Freemium") return null;

  const total = used + monthly + reward + addon;
  const remaining = monthly + reward + addon;
  const usedPct = (used / total) * 100;
  const { h, m } = formatHM(remaining);

  return (
    <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-2.5 flex items-center gap-2.5">
      <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
        <Clock className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium truncate">
            Time Left
          </span>
          <span className="ml-auto text-sm font-bold tabular-nums">
            {h}<span className="text-[10px] text-muted-foreground font-medium">h</span> {m}<span className="text-[10px] text-muted-foreground font-medium">m</span>
          </span>
        </div>
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all" style={{ width: `${usedPct}%` }} />
        </div>
      </div>
      <Link
        to="/checkout"
        className="shrink-0 inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 transition"
      >
        <Crown className="h-2.5 w-2.5" />
        Upgrade
      </Link>
    </div>
  );
}
