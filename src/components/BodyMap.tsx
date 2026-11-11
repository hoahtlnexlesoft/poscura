import { cn } from "@/lib/utils";
import bodyFull from "@/assets/body-full.png";

type Severity = "serious" | "risky" | "normal" | "neutral";
type Part = "head" | "shoulders" | "spine" | "pelvis";

interface BodyMapProps {
  head?: Severity;
  shoulders?: Severity;
  spine?: Severity;
  pelvis?: Severity;
  className?: string;
  onPartClick?: (part: Part) => void;
}

const zones: Record<Part, { top: string; left: string; width: string; height: string }> = {
  head:      { top: "0%",   left: "28%", width: "44%", height: "30%" },
  shoulders: { top: "30%",  left: "0%",  width: "100%", height: "22%" },
  spine:     { top: "32%",  left: "40%", width: "20%", height: "45%" },
  pelvis:    { top: "77%",  left: "8%",  width: "84%", height: "23%" },
};

const ringColor: Record<Severity, string> = {
  serious: "ring-destructive/70 bg-destructive/10",
  risky: "ring-warning/70 bg-warning/10",
  normal: "ring-success/60 bg-success/10",
  neutral: "ring-transparent bg-transparent",
};

export function BodyMap({
  head = "neutral",
  shoulders = "neutral",
  spine = "neutral",
  pelvis = "neutral",
  className,
  onPartClick,
}: BodyMapProps) {
  const severities: Record<Part, Severity> = { head, shoulders, spine, pelvis };

  return (
    <div className={cn("relative w-full max-w-[280px] mx-auto select-none", className)}>
      <img src={bodyFull} alt="Body posture map" className="w-full h-auto pointer-events-none" draggable={false} />
      {(Object.keys(zones) as Part[]).map((part) => {
        const z = zones[part];
        const sev = severities[part];
        return (
          <button
            key={part}
            type="button"
            onClick={onPartClick ? () => onPartClick(part) : undefined}
            aria-label={part}
            style={{ top: z.top, left: z.left, width: z.width, height: z.height }}
            className={cn(
              "absolute rounded-2xl transition focus:outline-none",
              onPartClick ? "cursor-pointer hover:ring-2 hover:bg-foreground/5" : "cursor-default",
              sev !== "neutral" && "ring-1",
              ringColor[sev],
            )}
          />
        );
      })}
    </div>
  );
}
