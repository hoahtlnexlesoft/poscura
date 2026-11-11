import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  value: number;
  max?: number;
  size?: number;
  className?: string;
}

export function ScoreGauge({ value, max = 100, size = 120, className }: ScoreGaugeProps) {
  const pct = Math.max(0, Math.min(1, value / max));
  const r = size / 2 - 10;
  const c = Math.PI * r;
  const offset = c * (1 - pct);
  const color =
    pct >= 0.75 ? "var(--color-success)" : pct >= 0.5 ? "var(--color-warning)" : "var(--color-destructive)";

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)} style={{ width: size, height: size / 2 + 24 }}>
      <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
        <path
          d={`M 10 ${size / 2} A ${r} ${r} 0 0 1 ${size - 10} ${size / 2}`}
          fill="none"
          stroke="var(--color-muted)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d={`M 10 ${size / 2} A ${r} ${r} 0 0 1 ${size - 10} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms ease" }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <div className="text-2xl font-bold tabular-nums">{value}<span className="text-sm text-muted-foreground font-normal">/{max}</span></div>
      </div>
    </div>
  );
}
