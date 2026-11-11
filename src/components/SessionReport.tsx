import { ChevronLeft, Share2, TrendingUp, AlertTriangle, CheckCircle2, Facebook, Twitter, Linkedin, MessageCircle, Send, Users, X, Sparkles, AlertOctagon } from "lucide-react";
import { BodyMap } from "@/components/BodyMap";
import { ScoreGauge } from "@/components/ScoreGauge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onClose} aria-label="Back" className="h-9 w-9 rounded-lg border border-border bg-card flex items-center justify-center">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-sm font-semibold">Aug 13, 2025</h1>
            <p className="text-[11px] text-muted-foreground">10:30 AM · 20 min</p>
          </div>
        </div>
        <button onClick={() => setShareOpen(true)} aria-label="Share" className="h-9 w-9 rounded-lg border border-border bg-card flex items-center justify-center">
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
              <button onClick={publishToCommunity} className="px-3 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-semibold">Post to Community</button>
            </div>
          </div>
        </div>
      )}

      <section className="glass-card p-5">
        <h2 className="text-sm font-semibold mb-3">Posture Score</h2>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Average score</div>
            <ScoreGauge value={74} size={130} />
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-[11px] font-semibold">
              <TrendingUp className="h-3 w-3" /> 15%
              <span className="text-foreground/70 font-normal ml-1">from last session</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Duration</div>
            <div className="text-3xl font-bold leading-none mt-1">20</div>
            <div className="text-xs text-muted-foreground mt-1">minutes</div>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Alignment Level</h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-success/15 text-success font-medium">Balanced</span>
          </div>
          <div className="flex h-2.5 w-full overflow-hidden rounded-full">
            <div className="bg-success" style={{ width: "65%" }} />
            <div className="bg-[#3b82f6]" style={{ width: "15%" }} />
            <div className="bg-warning" style={{ width: "10%" }} />
            <div className="bg-destructive" style={{ width: "10%" }} />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-y-1 text-[11px]">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" />Balanced (65%)</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#3b82f6]" />Slight (15%)</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-warning" />Moderate (10%)</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive" />Significant (10%)</span>
          </div>
        </div>
      </section>

      <section className="glass-card p-5">
        <div className="mb-4 flex items-end justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold">Posture analysis</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Tap a region for detail</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" />Serious</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" />Risky</span>
          </div>
        </div>
        <div className="flex justify-center">
          <BodyMap head="serious" shoulders="serious" spine="risky" pelvis="risky" className="!max-w-[180px]"
            onPartClick={(p) => navigate({ to: "/body-part/$part", params: { part: p }, search: { from: "session" } })} />
        </div>
      </section>

      <section className="glass-card p-5 border-success/30 bg-success/5">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-5 w-5 text-success" />
          <h3 className="font-semibold text-sm">Biggest Improvement</h3>
        </div>
        <p className="text-xs text-foreground/80">{sessionShare.improvementText}</p>
      </section>

      <section className="glass-card p-5 border-destructive/30 bg-destructive/5">
        <div className="flex items-center gap-2 mb-2">
          <AlertOctagon className="h-5 w-5 text-destructive" />
          <h3 className="font-semibold text-sm text-destructive">New Risk</h3>
        </div>
        <p className="text-xs text-foreground/80">
          <span className="font-semibold text-foreground">Head & Neck</span> — Extended forward head tilt can strain neck muscles.
        </p>
      </section>

      <section className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-sm">Smart Guidance</h2>
        </div>
        <ul className="space-y-1.5 text-xs text-foreground/85 list-disc pl-5 marker:text-primary">
          {sessionShare.guidance.map((g) => <li key={g}>{g}</li>)}
        </ul>
      </section>

      <section className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-sm">Recommended Workout</h2>
        </div>
        <div className="rounded-xl border border-border p-4">
          <h3 className="font-semibold text-sm">{sessionShare.recommendation.name}</h3>
          <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary mt-1">{sessionShare.recommendation.tag}</span>
          <div className="flex gap-2 mt-2 text-[11px]">
            <span className="px-2 py-0.5 rounded-md bg-card border border-border">{sessionShare.recommendation.sessions} sessions</span>
            <span className="px-2 py-0.5 rounded-md bg-card border border-border">{sessionShare.recommendation.exercises} exercises</span>
          </div>
          <button onClick={() => setScheduleOpen(true)}
            className="mt-4 w-full py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold text-sm hover:opacity-90">
            Set Schedule
          </button>
        </div>
      </section>

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
