import { useState } from "react";
import { X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import bodyImg from "@/assets/body-discomfort-dialog.png";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onSkip: () => void;
}

type Part =
  | "head" | "neck" | "leftShoulder" | "rightShoulder"
  | "upperBack" | "midBack" | "lowerBack"
  | "leftHip" | "rightHip" | "leftKnee" | "rightKnee";

const partLabels: Record<Part, string> = {
  head: "Head & Neck", neck: "Neck",
  leftShoulder: "Left Shoulder", rightShoulder: "Right Shoulder",
  upperBack: "Upper Back", midBack: "Mid Back", lowerBack: "Lower Back",
  leftHip: "Left Hip", rightHip: "Right Hip",
  leftKnee: "Left Knee", rightKnee: "Right Knee",
};

function severityFor(v: number) {
  if (v <= 0) return null;
  if (v <= 3) return { label: "Mild", badge: "bg-sky-100 text-sky-600", color: "accent-sky-500" };
  if (v <= 6) return { label: "Moderate", badge: "bg-amber-100 text-amber-600", color: "accent-amber-500" };
  return { label: "Severe", badge: "bg-red-100 text-red-600", color: "accent-red-500" };
}

export function DiscomfortDialog({ open, onClose, onSubmit, onSkip }: Props) {
  const [selected, setSelected] = useState<Set<Part>>(new Set());
  const [hours, setHours] = useState(0);
  const [levels, setLevels] = useState<Record<string, number>>({});

  if (!open) return null;

  const toggle = (p: Part) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(p)) next.delete(p);
      else {
        next.add(p);
        setLevels((l) => ({ ...l, [p]: l[p] ?? 3 }));
      }
      return next;
    });

  const isOn = (p: Part) => selected.has(p);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
      <div className="glass-card w-full max-w-md max-h-[92vh] overflow-auto rounded-b-none sm:rounded-2xl">
        <div className="flex items-center justify-between px-4 h-14 border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-10">
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-card border border-border flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
          <h2 className="font-semibold text-sm">Log Discomfort</h2>
          <div className="w-8" />
        </div>

        <div className="p-4 space-y-4">
          <p className="text-xs text-muted-foreground">
            Tap areas where you feel pain. Multiple selections allowed.
          </p>

          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-[280px]">
              <img src={bodyImg} alt="Body" className="w-full h-auto pointer-events-none select-none" draggable={false} />
              {([
                { p: "head", style: { top: "2%", left: "38%", width: "24%", height: "12%", borderRadius: "50%" } },
                { p: "neck", style: { top: "13%", left: "42%", width: "16%", height: "5%" } },
                { p: "leftShoulder", style: { top: "16%", left: "10%", width: "26%", height: "10%", borderRadius: "40%" } },
                { p: "rightShoulder", style: { top: "16%", left: "64%", width: "26%", height: "10%", borderRadius: "40%" } },
                { p: "upperBack", style: { top: "21%", left: "35%", width: "30%", height: "11%" } },
                { p: "midBack", style: { top: "32%", left: "36%", width: "28%", height: "10%" } },
                { p: "lowerBack", style: { top: "41%", left: "30%", width: "40%", height: "10%" } },
                { p: "leftHip", style: { top: "50%", left: "24%", width: "24%", height: "9%" } },
                { p: "rightHip", style: { top: "50%", left: "52%", width: "24%", height: "9%" } },
                { p: "leftKnee", style: { top: "67%", left: "30%", width: "18%", height: "6%" } },
                { p: "rightKnee", style: { top: "67%", left: "52%", width: "18%", height: "6%" } },
              ] as Array<{ p: Part; style: React.CSSProperties }>).map(({ p, style }) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => toggle(p)}
                  aria-label={partLabels[p]}
                  style={style}
                  className={cn(
                    "absolute transition-colors rounded-xl border",
                    isOn(p)
                      ? "bg-primary/40 border-primary ring-2 ring-primary"
                      : "bg-transparent border-transparent hover:bg-primary/15"
                  )}
                />
              ))}
            </div>
          </div>

          {selected.size > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {[...selected].map((p) => (
                <button key={p} onClick={() => toggle(p)} className="text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                  {partLabels[p]} ✕
                </button>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Hours seated today
              </label>
              <input type="range" min={0} max={24} value={hours} onChange={(e) => setHours(Number(e.target.value))} className="mt-2 w-full accent-primary" />
              <div className="text-xs text-muted-foreground text-right">{hours} hours</div>
            </div>

            {selected.size > 0 && (
              <div className="space-y-3">
                {[...selected].map((p) => {
                  const v = levels[p] ?? 0;
                  const sev = severityFor(v);
                  return (
                    <div key={p} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{partLabels[p]}</span>
                        {sev && <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", sev.badge)}>{sev.label}</span>}
                      </div>
                      <input type="range" min={0} max={10} value={v}
                        onChange={(e) => setLevels((l) => ({ ...l, [p]: Number(e.target.value) }))}
                        className={cn("w-full", sev?.color ?? "accent-muted-foreground")} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={onSkip} className="flex-1 py-2.5 rounded-lg border border-primary/40 text-primary text-sm font-medium">
              Skip
            </button>
            <button onClick={onSubmit} className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-medium shadow-lg">
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
