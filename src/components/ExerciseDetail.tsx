import { ChevronLeft, ChevronDown, Play, Volume2, Maximize2, TrendingUp, Sparkles, AlertCircle, Target, Dumbbell, Share2, Facebook, Twitter, Linkedin, MessageCircle, Send, Users, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ScoreGauge } from "@/components/ScoreGauge";
import { SessionEvaluationDetail } from "@/components/SessionEvaluationDetail";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

const shareTargets = [
  { name: "Facebook", icon: Facebook, color: "text-[#1877F2]", url: (u: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
  { name: "X (Twitter)", icon: Twitter, color: "text-foreground", url: (u: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}` },
  { name: "WhatsApp", icon: MessageCircle, color: "text-[#25D366]", url: (u: string) => `https://wa.me/?text=${encodeURIComponent(u)}` },
  { name: "Telegram", icon: Send, color: "text-[#229ED9]", url: (u: string) => `https://t.me/share/url?url=${encodeURIComponent(u)}` },
  { name: "LinkedIn", icon: Linkedin, color: "text-[#0A66C2]", url: (u: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}` },
];

const EVAL_OVERALL = "Stable posture and controlled movement throughout.";
const EVAL_IMPROVEMENT = "Lumbar improved by 7° since last session.";
const EVAL_ADVICE = "Avoid extended forward or side head tilt.";
const ACCURACY_AVG = 76;

interface Props {
  exerciseName: string;
  badge: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

type Phase = "warm" | "main" | "cool";

const steps: Record<Phase, { title: string; description: string; marker: "Start" | "End" | number }[]> = {
  warm: [
    { marker: "Start", title: "Setup Position", description: "Maintain a neutral head and neck alignment." },
    { marker: 2, title: "Chin Tuck 1", description: "Focus on relaxed jaw and neck muscles while tucking." },
    { marker: 3, title: "Return", description: "Return to start position correctly." },
    { marker: 4, title: "Chin Tuck 2", description: "Lengthen the back of your neck." },
    { marker: "End", title: "Complete", description: "" },
  ],
  main: [
    { marker: "Start", title: "Begin Main Set", description: "Engage core and maintain steady breathing." },
    { marker: 2, title: "Repetition 1", description: "Controlled tempo throughout." },
    { marker: "End", title: "Main Set Complete", description: "" },
  ],
  cool: [
    { marker: "Start", title: "Cool Down", description: "Lower intensity and stretch." },
    { marker: "End", title: "Done", description: "" },
  ],
};

const accuracySeries = [55, 78, 72, 70, 74, 73, 71, 75, 76, 74, 70, 73, 76, 78, 80, 82];

function ShareToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between text-xs cursor-pointer">
      <span className="font-medium">{label}</span>
      <button type="button" onClick={() => onChange(!checked)}
        className={`h-5 w-9 rounded-full transition-colors relative ${checked ? "bg-primary" : "bg-muted"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-background transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
      </button>
    </label>
  );
}

export function ExerciseDetail({ exerciseName, badge, onClose, onPrev, onNext }: Props) {
  const [phase, setPhase] = useState<Phase>("warm");
  const [chartOpen, setChartOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [sessionDetail, setSessionDetail] = useState<{ date: string; time: string; score: number } | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [postText, setPostText] = useState("");
  const [incTitle, setIncTitle] = useState(true);
  const [incAccuracy, setIncAccuracy] = useState(true);
  const [incOverall, setIncOverall] = useState(true);
  const [incImprovement, setIncImprovement] = useState(true);
  const [incAdvice, setIncAdvice] = useState(true);
  const navigate = useNavigate();
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const publishToCommunity = () => {
    try {
      sessionStorage.setItem("community:share", JSON.stringify({
        kind: "exercise",
        text: postText.trim(),
        title: incTitle ? exerciseName : "",
        accuracyAverage: incAccuracy ? ACCURACY_AVG : null,
        overall: incOverall ? EVAL_OVERALL : "",
        improvement: incImprovement ? EVAL_IMPROVEMENT : "",
        advice: incAdvice ? EVAL_ADVICE : "",
      }));
    } catch {}
    setComposerOpen(false);
    toast.success("Published to Poscura Community");
    navigate({ to: "/community" });
  };

  if (sessionDetail) {
    return <SessionEvaluationDetail date={sessionDetail.date} time={sessionDetail.time} score={sessionDetail.score} onClose={() => setSessionDetail(null)} />;
  }

  return (
    <div className="space-y-4 land:grid land:grid-cols-2 land:items-start land:gap-x-6 land:gap-y-4 land:space-y-0">
      <div className="flex items-center justify-between land:col-span-2">
        <button onClick={onClose} className="inline-flex items-center gap-1 text-sm text-muted-foreground">
          <ChevronLeft className="h-4 w-4" /> Details
        </button>
        <div className="flex items-center gap-3 text-xs">
          {onPrev && <button onClick={onPrev} className="text-primary">Prev</button>}
          {onNext && <button onClick={onNext} className="text-primary">Next</button>}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap land:col-span-2">
        <h1 className="text-xl font-bold flex-1">{exerciseName}</h1>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-medium">{badge}</span>
        <button onClick={() => setShareOpen(true)} aria-label="Share" className="h-9 w-9 rounded-lg border border-border bg-card flex items-center justify-center text-primary">
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share exercise</DialogTitle>
            <DialogDescription>Choose where you'd like to share.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3">
            {shareTargets.map((t) => (
              <a key={t.name} href={t.url(shareUrl)} target="_blank" rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-card">
                <t.icon className={`h-6 w-6 ${t.color}`} />
                <span className="text-xs text-center">{t.name}</span>
              </a>
            ))}
            <button onClick={() => { setShareOpen(false); setComposerOpen(true); }} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-card">
              <Users className="h-6 w-6 text-primary" />
              <span className="text-xs">Community</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {composerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/70 backdrop-blur-sm" onClick={() => setComposerOpen(false)}>
          <div className="w-full max-w-md glass-card p-5 space-y-3 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold">Share to Poscura Community</h3>
                <p className="text-[11px] text-muted-foreground">Toggle sections to include or remove before posting.</p>
              </div>
              <button onClick={() => setComposerOpen(false)} aria-label="Close"><X className="h-4 w-4" /></button>
            </div>

            <textarea value={postText} onChange={(e) => setPostText(e.target.value)} rows={3} placeholder="Add a caption…"
              className="w-full rounded-xl border border-primary/40 bg-background p-3 text-sm focus:outline-none focus:border-primary resize-none" />

            <div className="rounded-2xl border border-border bg-card/50 p-4 space-y-3">
              <ShareToggle label="Exercise title" checked={incTitle} onChange={setIncTitle} />
              {incTitle && <div className="text-sm font-semibold">{exerciseName}</div>}

              <ShareToggle label="Accuracy Average" checked={incAccuracy} onChange={setIncAccuracy} />
              {incAccuracy && (
                <div className="flex items-center gap-2 text-xs">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  <span className="text-muted-foreground">Accuracy Average</span>
                  <span className="ml-auto font-bold text-base">{ACCURACY_AVG}%</span>
                </div>
              )}

              <ShareToggle label="Overall" checked={incOverall} onChange={setIncOverall} />
              {incOverall && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-2 text-[11px] text-foreground/80">{EVAL_OVERALL}</div>
              )}

              <ShareToggle label="Improvement" checked={incImprovement} onChange={setIncImprovement} />
              {incImprovement && (
                <div className="rounded-lg border border-success/30 bg-success/5 p-2 text-[11px] text-foreground/80">{EVAL_IMPROVEMENT}</div>
              )}

              <ShareToggle label="Advice" checked={incAdvice} onChange={setIncAdvice} />
              {incAdvice && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-2 text-[11px] text-foreground/80">{EVAL_ADVICE}</div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setComposerOpen(false)} className="px-3 py-2 rounded-lg border border-border text-sm">Cancel</button>
              <button onClick={publishToCommunity} className="px-3 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-semibold">Post to Community</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 land:sticky land:top-[72px]">
      <section className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-primary" />
          <div className="text-sm font-semibold">Accuracy Average</div>
        </div>
        <div className="flex flex-col items-center">
          <ScoreGauge value={76} size={140} />
          <div className="w-full mt-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span><span className="font-bold">2</span><span className="text-muted-foreground">/40 sessions</span></span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: "5%" }} />
            </div>
          </div>
        </div>
      </section>

      <section className="glass-card p-4">
        <button onClick={() => setChartOpen((v) => !v)} className="w-full flex items-center justify-between">
          <h2 className="font-semibold text-sm">Accuracy Over Time</h2>
          <ChevronDown className={`h-4 w-4 transition ${chartOpen ? "" : "-rotate-90"}`} />
        </button>
        {chartOpen && (
          <div className="mt-3">
            <AccuracyChart data={accuracySeries} onPointClick={(i, v) => setSessionDetail({ date: `Session ${i + 1}`, time: "06:00 PM", score: v })} />
          </div>
        )}
      </section>

      </div>

      <div className="space-y-4">
      <section className="rounded-2xl border-2 border-secondary/30 bg-gradient-to-br from-secondary/10 to-transparent p-4">
        <div className="flex items-center gap-2 mb-3">
          <Dumbbell className="h-4 w-4 text-secondary" />
          <div className="text-sm font-semibold">Today's Session</div>
        </div>
        <div className="rounded-xl border border-border bg-card/80 p-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">Cat Cow</h3>
            <span className="inline-block text-[10px] px-1.5 py-0.5 rounded-md bg-destructive/15 text-destructive font-medium mt-0.5">Incompleted</span>
          </div>
          <button className="h-9 w-9 rounded-full border-2 border-primary text-primary flex items-center justify-center">
            <Play className="h-3.5 w-3.5 fill-current" />
          </button>
        </div>
      </section>


      <section className="glass-card p-4">
        <h2 className="font-semibold text-sm mb-3">Exercise Evaluation</h2>
        <div className="space-y-2">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-1">
              <TrendingUp className="h-3.5 w-3.5" /> Overall
            </div>
            <p className="text-xs text-foreground/80">Stable posture and controlled movement throughout.</p>
          </div>
          <div className="rounded-lg border border-success/30 bg-success/5 p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-success mb-1">
              <Sparkles className="h-3.5 w-3.5" /> Improvement
            </div>
            <p className="text-xs text-foreground/80">Lumbar improved by 7° since last session.</p>
          </div>
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive mb-1">
              <AlertCircle className="h-3.5 w-3.5" /> Advice
            </div>
            <p className="text-xs text-foreground/80">Avoid extended forward or side head tilt.</p>
          </div>
        </div>
      </section>

      <section className="glass-card p-4 space-y-3">
        <button onClick={() => setDetailsOpen((v) => !v)} className="w-full flex items-center justify-between">
          <h2 className="font-semibold text-sm">Exercise Details</h2>
          <ChevronDown className={`h-4 w-4 transition ${detailsOpen ? "" : "-rotate-90"}`} />
        </button>
        {detailsOpen && (
          <>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-emerald-200 via-teal-300 to-cyan-400">
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="h-12 w-12 rounded-full bg-white/30 backdrop-blur-sm border border-white/60 flex items-center justify-center">
                  <Play className="h-5 w-5 text-white fill-white" />
                </button>
              </div>
              <div className="absolute bottom-0 inset-x-0 p-2 flex items-center gap-2 bg-gradient-to-t from-black/60 text-white text-xs">
                <span className="tabular-nums">33:00 | 45:00</span>
                <div className="flex-1 h-1 bg-white/30 rounded-full"><div className="h-full bg-primary" style={{ width: "73%" }} /></div>
                <Volume2 className="h-3.5 w-3.5" /><Maximize2 className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-xs text-foreground/80">Relieves tension and improves mobility in the shoulders and neck.</p>
            <div className="grid grid-cols-3 gap-2">
              <Meta label="Every" value="1" suffix="day" />
              <Meta label="Per day" value="3" suffix="time" />
              <Meta label="Repeat" value="4" suffix="hr" />
            </div>
            <div className="flex items-center gap-2">
              {(["warm", "main", "cool"] as Phase[]).map((p) => (
                <button key={p} onClick={() => setPhase(p)}
                  className={`px-3 py-1 rounded-full border text-xs font-medium ${phase === p ? "border-primary text-primary bg-primary/5" : "border-border"}`}>
                  {p === "warm" ? "Warm" : p === "main" ? "Main" : "Cool"}
                </button>
              ))}
            </div>
            <ol className="relative space-y-3 pl-2">
              {steps[phase].map((s, idx) => {
                const isStart = s.marker === "Start";
                const isEnd = s.marker === "End";
                return (
                  <li key={idx} className="relative pl-9">
                    {idx !== steps[phase].length - 1 && <span className="absolute left-3 top-7 bottom-[-0.75rem] w-px bg-border" />}
                    <span className={`absolute left-0 top-0 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isStart ? "bg-primary text-primary-foreground" : isEnd ? "bg-success text-white" : "bg-card border border-primary/40 text-primary"
                    }`}>{s.marker}</span>
                    <h4 className="text-xs font-semibold">{s.title}</h4>
                    {s.description && <p className="text-[11px] text-foreground/75 mt-0.5">{s.description}</p>}
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </section>
      </div>
    </div>
  );
}

function Meta({ label, value, suffix }: { label: string; value: string; suffix: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-2">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div><span className="text-base font-bold">{value}</span><span className="text-[10px] text-muted-foreground ml-1">{suffix}</span></div>
    </div>
  );
}

function AccuracyChart({ data, onPointClick }: { data: number[]; onPointClick?: (i: number, v: number) => void }) {
  const w = 360, h = 180, pad = 28, max = 100;
  const stepX = (w - pad * 2) / (data.length - 1);
  const points = data.map((v, i) => `${pad + i * stepX},${h - pad - (v / max) * (h - pad * 2)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      {[0, 50, 100].map((y) => (
        <line key={y} x1={pad} x2={w - pad} y1={h - pad - (y / max) * (h - pad * 2)} y2={h - pad - (y / max) * (h - pad * 2)}
          stroke="var(--color-border)" strokeDasharray="2 4" />
      ))}
      <polyline fill="none" stroke="var(--color-primary)" strokeWidth="2" points={points} />
      {data.map((v, i) => (
        <circle key={i} cx={pad + i * stepX} cy={h - pad - (v / max) * (h - pad * 2)} r="4"
          fill="var(--color-primary)" className="cursor-pointer" onClick={() => onPointClick?.(i, v)} />
      ))}
    </svg>
  );
}

