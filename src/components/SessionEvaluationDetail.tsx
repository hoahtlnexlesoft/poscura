import { ChevronLeft, ChevronDown, Calendar, Play, TrendingUp, Sparkles, AlertCircle, Volume2, Maximize2 } from "lucide-react";
import { useState } from "react";
import { ScoreGauge } from "@/components/ScoreGauge";

interface Props {
  date: string;
  time: string;
  score: number;
  onClose: () => void;
}

export function SessionEvaluationDetail({ date, time, score, onClose }: Props) {
  const [evalOpen, setEvalOpen] = useState(true);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="text-base font-bold">Session Details</h1>
        <div className="w-12" />
      </div>

      <section className="glass-card p-4 space-y-4">
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-foreground/70 mt-0.5" />
          <div>
            <div className="text-sm font-semibold">Finished at</div>
            <div className="text-sm font-bold">{date} | {time}</div>
          </div>
        </div>
        <div className="flex justify-center">
          <ScoreGauge value={score} size={160} />
        </div>
      </section>

      <section className="glass-card p-4 space-y-3">
        <button onClick={() => setEvalOpen((v) => !v)} className="w-full flex items-center justify-between">
          <h2 className="font-semibold">Exercise Evaluation</h2>
          <ChevronDown className={`h-4 w-4 transition ${evalOpen ? "" : "-rotate-90"}`} />
        </button>
        {evalOpen && (
          <div className="space-y-2">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-primary mb-1">
                <TrendingUp className="h-4 w-4" /> Overall
              </div>
              <p className="text-xs text-foreground/80">Stable posture and controlled movement throughout most of the exercise.</p>
            </div>
            <div className="rounded-lg border border-success/30 bg-success/5 p-3">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-success mb-1">
                <Sparkles className="h-4 w-4" /> Key Improvement
              </div>
              <p className="text-xs text-foreground/80">Lumbar spine angle improved by 7° since your last session.</p>
            </div>
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-destructive mb-1">
                <AlertCircle className="h-4 w-4" /> Expert Advice
              </div>
              <p className="text-xs text-foreground/80">Avoid extended forward or side head tilt to reduce neck strain.</p>
            </div>
          </div>
        )}
      </section>

      <section className="glass-card p-4 space-y-3">
        <h2 className="font-semibold">Playback</h2>
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-200 via-rose-200 to-orange-300" />
          <div className="absolute inset-0 flex items-center justify-center">
            <button className="h-14 w-14 rounded-full bg-white/30 backdrop-blur-sm border border-white/60 flex items-center justify-center">
              <Play className="h-6 w-6 text-white fill-white" />
            </button>
          </div>
          <div className="absolute bottom-0 inset-x-0 p-3 flex items-center gap-2 bg-gradient-to-t from-black/60 to-transparent text-white text-xs">
            <span className="tabular-nums">00:00 | 02:30</span>
            <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: "0%" }} /></div>
            <Volume2 className="h-4 w-4" />
            <Maximize2 className="h-4 w-4" />
          </div>
        </div>
      </section>
    </div>
  );
}
