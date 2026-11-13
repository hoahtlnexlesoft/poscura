import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import bodyImg from "@/assets/body-discomfort.png";

export const Route = createFileRoute("/discomfort")({ component: DiscomfortPage });

type Part = "head" | "neck" | "leftShoulder" | "rightShoulder" | "upperBack" | "midBack" | "lowerBack" | "leftHip" | "rightHip" | "leftKnee" | "rightKnee";

const partLabels: Record<Part, string> = {
  head: "Head", neck: "Neck", leftShoulder: "L Shoulder", rightShoulder: "R Shoulder",
  upperBack: "Upper back", midBack: "Mid back", lowerBack: "Lower back",
  leftHip: "L Hip", rightHip: "R Hip", leftKnee: "L Knee", rightKnee: "R Knee",
};

function DiscomfortPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<Part>>(new Set());
  const [hours, setHours] = useState(0);
  const [levels, setLevels] = useState<Record<string, number>>({});

  const toggle = (p: Part) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(p)) next.delete(p);
      else { next.add(p); setLevels((l) => ({ ...l, [p]: l[p] ?? 3 })); }
      return next;
    });

  const severityFor = (v: number) => {
    if (v <= 0) return null;
    if (v <= 3) return { label: "Mild", badge: "bg-sky-100 text-sky-600", accent: "accent-sky-500" };
    if (v <= 6) return { label: "Moderate", badge: "bg-amber-100 text-amber-600", accent: "accent-amber-500" };
    return { label: "Severe", badge: "bg-red-100 text-red-600", accent: "accent-red-500" };
  };

  return (
    <div className="space-y-4 fold:grid fold:grid-cols-2 fold:gap-x-5 land:gap-x-6 hinge-split fold:gap-y-4 fold:space-y-0 fold:items-start">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground fold:col-span-2 fold:justify-self-start">
        <ChevronLeft className="h-4 w-4" /> Back
      </Link>

      <div className="fold:col-span-2">
        <h1 className="text-xl font-bold">Log Discomfort</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Tap areas where you feel pain. Multiple allowed.</p>
      </div>

      <div className="glass-card p-4 flex flex-col items-center fold:col-start-1 fold:row-start-3 fold:sticky fold:top-[72px]">
        <div className="relative w-full max-w-[280px] fold:max-w-[230px] land:max-w-[190px]">
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
            <button key={p} type="button" onClick={() => toggle(p)} aria-label={partLabels[p]} style={style}
              className={cn("absolute transition rounded-xl border",
                selected.has(p) ? "bg-primary/40 border-primary ring-2 ring-primary" : "bg-transparent border-transparent")} />
          ))}
        </div>
        {selected.size > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
            {[...selected].map((p) => (
              <button key={p} onClick={() => toggle(p)} className="text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                {partLabels[p]} ✕
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4 fold:col-start-2 fold:row-start-3">
      <div className="glass-card p-4 space-y-4">
        <div>
          <label className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Hours seated today: <span className="text-foreground font-medium">{hours}</span>
          </label>
          <input type="range" min={0} max={24} value={hours} onChange={(e) => setHours(Number(e.target.value))} className="mt-2 w-full accent-primary" />
        </div>

        {selected.size > 0 && (
          <div className="space-y-3">
            <label className="text-xs text-muted-foreground">Discomfort level</label>
            {[...selected].map((p) => {
              const v = levels[p] ?? 0;
              const sev = severityFor(v);
              return (
                <div key={p}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{partLabels[p]}</span>
                    {sev && <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", sev.badge)}>{sev.label}</span>}
                  </div>
                  <input type="range" min={0} max={10} value={v}
                    onChange={(e) => setLevels((l) => ({ ...l, [p]: Number(e.target.value) }))}
                    className={cn("w-full", sev?.accent ?? "accent-muted-foreground")} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={() => navigate({ to: "/" })} className="flex-1 py-2.5 rounded-lg border border-primary/40 text-primary text-sm font-medium">
          Skip
        </button>
        <button onClick={() => navigate({ to: "/" })} className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-medium shadow-lg">
          Submit
        </button>
      </div>
      </div>
    </div>
  );
}
