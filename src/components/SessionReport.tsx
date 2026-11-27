import { ChevronLeft, Share2, TrendingUp, AlertTriangle, CheckCircle2, Facebook, Twitter, Linkedin, MessageCircle, Send, Users, X, Sparkles, AlertOctagon, Clock3, CalendarClock, type LucideIcon } from "lucide-react";
import { BodyMap } from "@/components/BodyMap";
import { ScoreRing, scoreBand } from "@/components/SessionResult";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { BackButton } from "@/components/BackButton";

interface Props {
  onClose: () => void;
}

const shareTargets = [
  { name: "Facebook", icon: Facebook, color: "text-[#1877F2]", url: (u: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
  { name: "X", icon: Twitter, color: "text-foreground", url: (u: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}` },
  { name: "LinkedIn", icon: Linkedin, color: "text-[#0A66C2]", url: (u: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}` },
  { name: "WhatsApp", icon: MessageCircle, color: "text-[#25D366]", url: (u: string) => `https://wa.me/?text=${encodeURIComponent(u)}` },
  { name: "Telegram", icon: Send, color: "text-[#229ED9]", url: (u: string) => `https://t.me/share/url?url=${encodeURIComponent(u)}` },
];

const sessionShare = {
  title: "Posture Session Report",
  score: 86,
  duration: "20:00",
  status: "Great",
  improvement: 8,
  improvementText: "Shoulder line improved by 5° vs last week. You held a stable posture throughout most of the session.",
  guidance: [
    "Stand or stretch every 20–30 min; use micro-breaks for chin-tucks.",
    "Sit with core engaged, pelvis neutral.",
    "Strengthen deep neck flexors, mid-back, core.",
  ],
  recommendation: { name: "Shoulder & Neck Relief", tag: "Postural strength & endurance", sessions: 10, exercises: 4 },
};

const SCORE = 74;
const ALIGN = [
  { label: "Balanced", pct: 65, bar: "bg-success" },
  { label: "Slight", pct: 15, bar: "bg-[#3b82f6]" },
  { label: "Moderate", pct: 10, bar: "bg-warning" },
  { label: "Significant", pct: 10, bar: "bg-destructive" },
];

function Stat({ value, unit, label, tone }: { value: string; unit: string; label: string; tone?: string }) {
  return (
    <div className="px-3 py-3 text-center">
      <div className={cn("text-[20px] font-semibold leading-none tabular-nums tracking-tight", tone)}>
        {value}{unit && <span className="ml-0.5 text-[11px] font-medium text-muted-foreground">{unit}</span>}
      </div>
      <div className="mt-1.5 text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

function Insight({ icon: Icon, tone, title, text }: { icon: LucideIcon; tone: string; title: string; text: string }) {
  return (
    <div className="flex gap-3 py-3 first:pt-0 last:pb-0">
      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl", tone)}><Icon className="h-4 w-4" /></span>
      <div className="min-w-0">
        <div className="text-[13.5px] font-semibold">{title}</div>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

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

export function SessionReport({ onClose }: Props) {
  const [shareOpen, setShareOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("17:00");
  const [postText, setPostText] = useState("");
  const [incScore, setIncScore] = useState(true);
  const [incDuration, setIncDuration] = useState(true);
  const [incStatus, setIncStatus] = useState(true);
  const [incImprovementPct, setIncImprovementPct] = useState(true);
  const [incBiggest, setIncBiggest] = useState(true);
  const [incGuidance, setIncGuidance] = useState(true);
  const [incRecommendation, setIncRecommendation] = useState(true);
  const navigate = useNavigate();
  const band = scoreBand(SCORE);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const publishToCommunity = () => {
    try {
      sessionStorage.setItem("community:share", JSON.stringify({
        kind: "session",
        text: postText.trim(),
        title: sessionShare.title,
        score: incScore ? sessionShare.score : null,
        duration: incDuration ? sessionShare.duration : null,
        status: incStatus ? sessionShare.status : null,
        improvement: incImprovementPct ? sessionShare.improvement : null,
        improvementText: incBiggest ? sessionShare.improvementText : "",
        guidance: incGuidance ? sessionShare.guidance : [],
        recommendation: incRecommendation ? sessionShare.recommendation : null,
        showStats: true,
      }));
    } catch {}
    setComposerOpen(false);
    toast.success("Published to Community");
    navigate({ to: "/community" });
  };

  return (
    <div className="space-y-4 land:grid land:grid-cols-2 hinge-split land:items-start land:gap-x-6 land:gap-y-4 land:space-y-0">
      {/* ---------- header ---------- */}
      <div className="page-head flex items-center gap-3 land:col-span-2">
        <BackButton onClick={onClose} />
        <div className="min-w-0 flex-1">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Session report</div>
          <h1 className="truncate text-[19px] font-semibold leading-tight tracking-tight">Aug 13, 2025</h1>
        </div>
        <span className="hidden shrink-0 items-center gap-1.5 text-[12px] text-muted-foreground min-[380px]:flex"><Clock3 className="h-3.5 w-3.5" /> 10:30 AM · 20 min</span>
        <button onClick={() => setShareOpen(true)} aria-label="Share" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] text-foreground/80 transition hover:border-primary/40 hover:text-primary active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share posture summary</DialogTitle>
            <DialogDescription>Choose where you'd like to share.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3">
            {shareTargets.map((t) => (
              <a key={t.name} href={t.url(shareUrl)} target="_blank" rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-card">
                <t.icon className={`h-6 w-6 ${t.color}`} />
                <span className="text-xs">{t.name}</span>
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
              <h4 className="font-semibold text-sm">{sessionShare.title}</h4>

              <ShareToggle label="Posture Score" checked={incScore} onChange={setIncScore} />
              {incScore && (
                <div className="rounded-lg bg-background/60 border border-border p-2 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Score</span>
                  <span className="text-lg font-bold text-primary">{sessionShare.score}</span>
                </div>
              )}

              <ShareToggle label="Duration" checked={incDuration} onChange={setIncDuration} />
              {incDuration && (
                <div className="rounded-lg bg-background/60 border border-border p-2 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Duration</span>
                  <span className="text-lg font-bold">{sessionShare.duration}</span>
                </div>
              )}

              <ShareToggle label="Status" checked={incStatus} onChange={setIncStatus} />
              {incStatus && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/15 text-success text-[11px] font-semibold">
                  <CheckCircle2 className="h-3 w-3" /> {sessionShare.status}
                </div>
              )}

              <ShareToggle label="Improvement %" checked={incImprovementPct} onChange={setIncImprovementPct} />
              {incImprovementPct && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-[11px] font-semibold">
                  <TrendingUp className="h-3 w-3" /> {sessionShare.improvement}% from last session
                </div>
              )}

              <ShareToggle label="Biggest Improvement" checked={incBiggest} onChange={setIncBiggest} />
              {incBiggest && (
                <div className="rounded-lg border border-success/30 bg-success/5 p-2 text-[11px] text-foreground/80">{sessionShare.improvementText}</div>
              )}

              <ShareToggle label="Smart Guidance" checked={incGuidance} onChange={setIncGuidance} />
              {incGuidance && (
                <ul className="rounded-lg border border-primary/20 bg-primary/5 p-2 text-[11px] text-foreground/80 list-disc pl-4 space-y-1 marker:text-primary">
                  {sessionShare.guidance.map((g) => <li key={g}>{g}</li>)}
                </ul>
              )}

              <ShareToggle label="Recommended Workout" checked={incRecommendation} onChange={setIncRecommendation} />
              {incRecommendation && (
                <div className="rounded-lg border border-border bg-background/60 p-2">
                  <div className="text-xs font-semibold">{sessionShare.recommendation.name}</div>
                  <span className="inline-block text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary mt-1">{sessionShare.recommendation.tag}</span>
                  <div className="flex gap-1.5 mt-1.5 text-[10px]">
                    <span className="px-1.5 py-0.5 rounded-md bg-card border border-border">{sessionShare.recommendation.sessions} sessions</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-card border border-border">{sessionShare.recommendation.exercises} exercises</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setComposerOpen(false)} className="px-3 py-2 rounded-lg border border-border text-sm">Cancel</button>
              <button onClick={publishToCommunity} className="px-3 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-semibold transition enabled:hover:brightness-110 active:scale-[0.98]">Post to Community</button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- left: score + alignment ---------- */}
      <div className="space-y-4 land:col-start-1 land:row-start-2 land:sticky land:top-[72px] desk:top-6">
        <section className="relative overflow-hidden rounded-[22px] border border-white/[0.07] bg-gradient-to-b from-primary/[0.08] to-transparent p-5">
          <div className="flex items-center gap-5">
            <ScoreRing score={SCORE} size={124} label="Score" />
            <div className="min-w-0">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Posture score</div>
              <div className="mt-1 text-[20px] font-semibold leading-tight tracking-tight">{band.label}</div>
              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-[11.5px] font-semibold text-success ring-1 ring-inset ring-success/20">
                <TrendingUp className="h-3 w-3" /> +15% <span className="font-normal text-foreground/60">vs last session</span>
              </div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 divide-x divide-white/[0.06] rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <Stat value="20" unit="min" label="Duration" />
            <Stat value="13" unit="min" label="Balanced" tone="text-success" />
            <Stat value="2" unit="" label="Alerts" tone="text-warning" />
          </div>
        </section>

        <section className="rounded-[22px] border border-white/[0.07] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold tracking-tight">Alignment</h2>
            <span className="rounded-full bg-success/12 px-2.5 py-0.5 text-[11px] font-semibold text-success ring-1 ring-inset ring-success/20">Mostly balanced</span>
          </div>
          <div className="mt-4 flex h-2 w-full gap-1">
            {ALIGN.map((a) => <div key={a.label} className={cn("rounded-full", a.bar)} style={{ width: `${a.pct}%` }} />)}
          </div>
          <ul className="mt-4 divide-y divide-white/[0.05]">
            {ALIGN.map((a) => (
              <li key={a.label} className="flex items-center gap-3 py-1.5 text-[13px]">
                <span className={cn("h-2 w-2 shrink-0 rounded-full", a.bar)} />
                <span className="flex-1 text-foreground/85">{a.label}</span>
                <span className="tabular-nums text-muted-foreground">{Math.round((a.pct / 100) * 20)} min</span>
                <span className="w-10 text-right font-semibold tabular-nums">{a.pct}%</span>
              </li>
            ))}
          </ul>
        </section>

      </div>

      {/* ---------- right: insights + next step ---------- */}
      <div className="space-y-4 land:col-start-2 land:row-start-2">
        <section className="rounded-[22px] border border-white/[0.07] p-5">
          <h2 className="text-[15px] font-semibold tracking-tight">Highlights</h2>
          <div className="mt-3 divide-y divide-white/[0.05]">
            <Insight icon={TrendingUp} tone="bg-success/12 text-success" title="Biggest improvement" text={sessionShare.improvementText} />
            <Insight icon={AlertTriangle} tone="bg-destructive/12 text-destructive" title="New risk · Head & neck" text="Extended forward head tilt can strain neck muscles." />
          </div>
        </section>

        <section className="rounded-[22px] border border-white/[0.07] p-5">
          <div className="mb-3 flex items-end justify-between gap-2">
            <div>
              <h2 className="text-[15px] font-semibold tracking-tight">Posture analysis</h2>
              <p className="mt-0.5 text-[12px] text-muted-foreground">Tap a region for detail</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive" />Serious</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-warning" />Risky</span>
            </div>
          </div>
          <BodyMap head="serious" shoulders="serious" spine="risky" pelvis="risky" className="!max-w-[170px]"
            onPartClick={(p) => navigate({ to: "/body-part/$part", params: { part: p }, search: { from: "session" } })} />
        </section>
        <section className="rounded-[22px] border border-white/[0.07] p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-[15px] font-semibold tracking-tight">Smart guidance</h2>
          </div>
          <ol className="mt-3 space-y-2.5">
            {sessionShare.guidance.map((g, i) => (
              <li key={g} className="flex gap-3 text-[13px] leading-relaxed text-foreground/85">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/12 text-[11px] font-semibold text-primary">{i + 1}</span>
                {g}
              </li>
            ))}
          </ol>
        </section>

        <section className="overflow-hidden rounded-[22px] border border-white/[0.07]">
          <div className="relative bg-gradient-to-br from-primary/25 via-primary/[0.08] to-secondary/15 p-5">
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-primary">Recommended for you</div>
            <h3 className="mt-1 text-[17px] font-semibold tracking-tight">{sessionShare.recommendation.name}</h3>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">{sessionShare.recommendation.tag}</p>
            <div className="mt-3 flex gap-2 text-[11.5px]">
              <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-foreground/80">{sessionShare.recommendation.sessions} sessions</span>
              <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-foreground/80">{sessionShare.recommendation.exercises} exercises</span>
            </div>
          </div>
          <div className="p-4">
            <button onClick={() => setScheduleOpen(true)}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary text-[15px] font-semibold text-white shadow-[0_10px_30px_-12px] shadow-primary transition hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
              <CalendarClock className="h-4 w-4" /> Set schedule
            </button>
          </div>
        </section>
      </div>

      {scheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setScheduleOpen(false)}>
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-center relative pb-4 border-b border-border">
              <h3 className="text-base font-semibold">Set Schedule</h3>
              <button onClick={() => setScheduleOpen(false)} aria-label="Close"
                className="absolute right-0 top-0 h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/40 flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="pt-5 space-y-4">
              <div>
                <label className="text-sm font-semibold">Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-primary/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label className="text-sm font-semibold">Start Time</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
            </div>
            <button onClick={() => {
              if (!startDate) { toast.error("Please select a start date"); return; }
              setScheduleOpen(false);
              toast.success(`Scheduled for ${startDate} at ${startTime}`);
            }} className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-semibold hover:opacity-90">
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
