import { cn } from "@/lib/utils";

/** Segmented half-ring score gauge (the app's score look), colour by band */
export function bandColor(v: number) {
  return v >= 85 ? "var(--color-success)" : v >= 70 ? "#3b8bff" : v >= 50 ? "var(--color-warning)" : "var(--color-destructive)";
}

export function SegGauge({ value, size = 180, segments = 5, stroke, className, label = true }: {
  value: number; size?: number; segments?: number; stroke?: number; className?: string; label?: boolean;
}) {
  const sw = stroke ?? Math.max(6, size * 0.085);
  const r = size / 2 - sw / 2;
  const cx = size / 2, cy = size / 2;
  const gap = 4; // degrees between segments
  const span = (180 - gap * (segments - 1)) / segments;
  const filled = (value / 100) * 180;
  const col = bandColor(value);
  const arc = (a0: number, a1: number) => {
    const p = (a: number) => [cx - r * Math.cos((a * Math.PI) / 180), cy - r * Math.sin((a * Math.PI) / 180)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
  };
  return (
    <div className={cn("relative inline-block", className)} style={{ width: size, height: size / 2 + sw / 2 }}>
      <svg width={size} height={size / 2 + sw / 2} viewBox={`0 0 ${size} ${size / 2 + sw / 2}`} aria-hidden>
        {Array.from({ length: segments }, (_, i) => {
          const a0 = i * (span + gap), a1 = a0 + span;
          const fillTo = Math.min(a1, Math.max(a0, filled));
          return (
            <g key={i}>
              <path d={arc(a0, a1)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={sw} />
              {fillTo > a0 && <path d={arc(a0, fillTo)} fill="none" stroke={col} strokeWidth={sw} />}
            </g>
          );
        })}
      </svg>
      {label && (
        <div className="absolute inset-x-0 bottom-0 text-center leading-none">
          <span className="font-semibold tabular-nums tracking-tight" style={{ fontSize: size * 0.24 }}>{value}</span>
          <span className="text-muted-foreground" style={{ fontSize: size * 0.09 }}>/100</span>
        </div>
      )}
    </div>
  );
}
