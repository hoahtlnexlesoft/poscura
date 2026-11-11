import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Play, Pause, Sparkles, Target, TrendingUp, Lightbulb, RotateCcw, Share2, Facebook, Twitter, Linkedin, MessageCircle, Send, Users, X } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Props {
  workoutName: string;
  recordedVideoUrl?: string | null;
  onClose: () => void;
}

const shareTargets = [
  { name: "Facebook", icon: Facebook, color: "text-[#1877F2]", url: (u: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
  { name: "X (Twitter)", icon: Twitter, color: "text-foreground", url: (u: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}` },
  { name: "LinkedIn", icon: Linkedin, color: "text-[#0A66C2]", url: (u: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}` },
  { name: "WhatsApp", icon: MessageCircle, color: "text-[#25D366]", url: (u: string) => `https://wa.me/?text=${encodeURIComponent(u)}` },
  { name: "Telegram", icon: Send, color: "text-[#229ED9]", url: (u: string) => `https://t.me/share/url?url=${encodeURIComponent(u)}` },
];

const highlights = [
  "Maintained steady tempo across all reps",
  "Clean alignment in the starting position",
  "Strong shoulder retraction throughout the set",
];

const improvements = [
  { label: "Neck alignment", from: 62, to: 81 },
  { label: "Shoulder symmetry", from: 70, to: 88 },
  { label: "Core engagement", from: 55, to: 74 },
];

export function WorkoutAssessment({ workoutName, recordedVideoUrl, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [postText, setPostText] = useState("");
  const [showHighlights, setShowHighlights] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [showImprovements, setShowImprovements] = useState(true);
  const [showAdvice, setShowAdvice] = useState(true);
  const navigate = useNavigate();
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    return () => { if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const publishToCommunity = () => {
    try {
      sessionStorage.setItem("community:share", JSON.stringify({
        kind: "workout",
        text: postText.trim(),
        title: workoutName,
        highlights: showHighlights ? highlights : [],
        improvements: showImprovements ? improvements : [],
        advice: showAdvice ? "Focus on a slower eccentric phase to build endurance in the stabilizing muscles around your shoulder blades." : "",
        showStats,
      }));
    } catch {}
    setComposerOpen(false);
    toast.success("Published to Poscura Community");
    navigate({ to: "/community" });
  };

  const togglePlay = () => {
    const v = videoRef.current; if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };

  const replay = () => {
    const v = videoRef.current; if (!v) return;
    v.currentTime = 0; v.play(); setPlaying(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="inline-flex items-center gap-1 text-sm text-muted-foreground">
          <ChevronLeft className="h-4 w-4" /> Assessment
        </button>
        <button onClick={() => setShareOpen(true)} aria-label="Share" className="h-9 w-9 rounded-lg border border-border bg-card flex items-center justify-center text-primary">
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share exercise progress</DialogTitle>
            <DialogDescription>Choose where you'd like to share your progress.</DialogDescription>
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
              <h4 className="font-semibold text-sm">{workoutName}</h4>

              <Toggle label="Stats (Accuracy · Reps · Score)" checked={showStats} onChange={setShowStats} />
              {showStats && (
                <div className="grid grid-cols-3 gap-2">
                  <MiniStat label="Accuracy" value="86%" />
                  <MiniStat label="Reps" value="12/12" />
                  <MiniStat label="Score" value="82" />
                </div>
              )}

              <Toggle label="Highlights" checked={showHighlights} onChange={setShowHighlights} />
              {showHighlights && (
                <ul className="space-y-1 text-[11px] text-foreground/80 list-disc pl-4 marker:text-primary">
                  {highlights.map((h) => <li key={h}>{h}</li>)}
                </ul>
              )}

              <Toggle label="Improvements" checked={showImprovements} onChange={setShowImprovements} />
              {showImprovements && (
                <div className="space-y-1 text-[11px]">
                  {improvements.map((i) => (
                    <div key={i.label} className="flex justify-between">
                      <span className="text-muted-foreground">{i.label}</span>
                      <span className="font-semibold">{i.to} <span className="text-success">(+{i.to - i.from})</span></span>
                    </div>
                  ))}
                </div>
              )}

              <Toggle label="Expert Advice" checked={showAdvice} onChange={setShowAdvice} />
              {showAdvice && (
                <p className="text-[11px] text-foreground/80">Focus on a slower eccentric phase to build endurance in the stabilizing muscles around your shoulder blades.</p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setComposerOpen(false)} className="px-3 py-2 rounded-lg border border-border text-sm">Cancel</button>
              <button onClick={publishToCommunity} className="px-3 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-semibold">Post to Community</button>
            </div>
          </div>
        </div>
      )}

      <section className="glass-card p-4 space-y-3">
        <div>
          <h2 className="font-semibold text-sm">{workoutName}</h2>
          <p className="text-xs text-muted-foreground">Recorded session</p>
        </div>
        <div className="aspect-video rounded-xl overflow-hidden bg-muted border border-border">
          {recordedVideoUrl ? (
            <video ref={videoRef} src={recordedVideoUrl} controls className="w-full h-full object-cover" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No recording available</div>
          )}
        </div>
        <div className="flex justify-center gap-2">
          <button onClick={togglePlay} className="h-9 w-9 rounded-lg border border-border bg-card flex items-center justify-center" disabled={!recordedVideoUrl}>
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button onClick={replay} className="h-9 w-9 rounded-lg border border-border bg-card flex items-center justify-center" disabled={!recordedVideoUrl}>
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Accuracy" value="86%" tone="primary" />
          <Stat label="Reps" value="12/12" tone="success" />
          <Stat label="Score" value="82" tone="secondary" />
        </div>
      </section>

      <section className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Highlights</h3>
        </div>
        <ul className="space-y-1.5 text-xs text-foreground/80">
          {highlights.map((h) => (
            <li key={h} className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />{h}</li>
          ))}
        </ul>
      </section>

      <section className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-4 w-4 text-secondary" />
          <h3 className="font-semibold text-sm">Accuracy Breakdown</h3>
        </div>
        <div className="space-y-2 text-xs">
          {[{ label: "Form", pct: 88 }, { label: "Range", pct: 79 }, { label: "Tempo", pct: 92 }].map((m) => (
            <div key={m.label}>
              <div className="flex justify-between mb-1"><span>{m.label}</span><span className="font-semibold">{m.pct}%</span></div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${m.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">Improvements</h2>
        </div>
        <div className="space-y-2">
          {improvements.map((i) => (
            <div key={i.label} className="rounded-xl border border-border p-3 bg-card flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">{i.label}</div>
                <div className="text-lg font-bold">{i.to}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-success font-semibold">+{i.to - i.from}</div>
                <div className="text-[10px] text-muted-foreground">from {i.from}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-4 w-4 text-warning" />
          <h2 className="font-semibold text-sm">Expert Advice</h2>
        </div>
        <p className="text-xs text-foreground/85">Focus on a slower eccentric phase to build endurance in the stabilizing muscles around your shoulder blades.</p>
      </section>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "primary" | "secondary" | "success" }) {
  const cls = tone === "primary" ? "border-primary/30 bg-primary/5" : tone === "secondary" ? "border-secondary/30 bg-secondary/5" : "border-success/30 bg-success/5";
  return (
    <div className={`rounded-xl border p-2 ${cls}`}>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-base font-bold mt-0.5">{value}</div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background/60 border border-border p-2">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="text-sm font-bold">{value}</div>
    </div>
  );
}
