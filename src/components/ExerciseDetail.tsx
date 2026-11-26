import { useImmersive } from "@/hooks/useImmersive";
import { ChevronLeft, ChevronDown, ChevronRight, Play, Volume2, Maximize2, TrendingUp, Sparkles, AlertCircle, Lightbulb, Share2, Clock, CircleCheck, Target, Package, Lock, Facebook, Twitter, Linkedin, MessageCircle, Send, Users, X, CalendarClock } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ScoreRing, scoreBand } from "@/components/SessionResult";
import { cn } from "@/lib/utils";
import { StepTimeline } from "@/components/StepTimeline";
import { SessionEvaluation } from "@/components/SessionEvaluation";
import { stepsFor, stepBand } from "@/lib/stepEval";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ScheduleDialog } from "@/desktop/DeskDashboard";
import { BackButton } from "@/components/BackButton";

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
  /** names of the neighbouring exercises, shown on Back / Next so it's clear where they go */
  prevName?: string;
  nextName?: string;
  /** start today's session of this exercise */
  onStart?: () => void;
  /** false when the exercise has no AI evaluation yet (never done): shows the plain detail layout */
  evaluated?: boolean;
  /** e.g. "0/2" for today's session counter */
  sessionLabel?: string;
  /** false when the exercise isn't on the user's schedule yet: the session card asks to schedule it */
  scheduled?: boolean;
}

/** Exercises the demo user has already done, so they have accuracy data and an AI evaluation */
const EVALUATED = new Set(["Squeeze Blades", "Cat Cow"]);
export const hasEvaluation = (name: string) => EVALUATED.has(name);

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
    { marker: "Start", title: "Setup", description: "Sit upright with your spine tall and shoulders relaxed. Rest your hands lightly behind your head, elbows relaxed." },
    { marker: 2, title: "Movement (right side)", description: "Gently turn your head to the right, looking over your right shoulder. Move slowly and only as far as is comfortable." },
    { marker: 3, title: "Return", description: "Slowly bring your head back to the centre." },
    { marker: 4, title: "Movement (left side)", description: "Turn your head to the left with the same control, keep your shoulders relaxed, then return to centre." },
    { marker: "End", title: "Main set complete", description: "" },
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

export function ExerciseDetail({ exerciseName, badge, onClose, onPrev, onNext, prevName, nextName, onStart, evaluated = hasEvaluation(exerciseName), sessionLabel = "0/2", scheduled = true }: Props) {
  const [sched, setSched] = useState(scheduled);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 4);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const [schedTime, setSchedTime] = useState<string | null>(null);
  const [schedOpen, setSchedOpen] = useState(false);
  useImmersive();
  const [phase, setPhase] = useState<Phase>("main");
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
  const band = scoreBand(ACCURACY_AVG);
  const best = Math.max(...accuracySeries);
  const trend = accuracySeries[accuracySeries.length - 1] - accuracySeries[0];
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const publishToCommunity = () => {
    try {
      sessionStorage.setItem("community:share", JSON.stringify({
        kind: "exercise",
        text: postText.trim(),
        title: incTitle ? exerciseName : "",
        accuracyAverage: evaluated && incAccuracy ? ACCURACY_AVG : null,
        overall: evaluated && incOverall ? EVAL_OVERALL : "",
        improvement: evaluated && incImprovement ? EVAL_IMPROVEMENT : "",
        advice: evaluated && incAdvice ? EVAL_ADVICE : "",
      }));
    } catch {}
    setComposerOpen(false);
    toast.success("Published to Poscura Community");
    navigate({ to: "/community" });
  };

  if (sessionDetail) {
    return <SessionEvaluation exerciseName={exerciseName} score={sessionDetail.score} when={sessionDetail.date} onBack={() => setSessionDetail(null)} />;
  }

  return (
    <div className="space-y-4 land:grid land:grid-cols-2 hinge-split land:items-start land:gap-x-6 land:gap-y-4 land:space-y-0">
      {/* ---------- header: stays pinned while the page scrolls; gets its backdrop once content passes under it ---------- */}
      <div className={cn("sticky top-0 z-30 -mx-4 -mt-4 flex items-center gap-3 border-b px-4 pb-3 pt-4 transition-[background-color,border-color,backdrop-filter] duration-200 land:col-span-2 desk:-mx-8 desk:-mt-7 desk:px-8 desk:pt-7 max-[699px]:desk:-mx-4 max-[699px]:desk:-mt-5 max-[699px]:desk:px-4 max-[699px]:desk:pt-5",
        scrolled ? "border-white/[0.06] bg-background/85 backdrop-blur-xl" : "border-transparent")}>
        <BackButton onClick={onClose} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Exercise</span>
            {/* status / phase tag sits with the title, so the action buttons on the right stay one even row */}
            <span className={cn("rounded-full px-2 py-px text-[10.5px] font-semibold ring-1 ring-inset", badge === "Completed" ? "bg-success/12 text-success ring-success/25" : "bg-primary/12 text-primary ring-primary/25")}>{badge}</span>
          </div>
          <h1 className="mt-0.5 truncate text-[19px] font-semibold leading-tight tracking-tight">{exerciseName}</h1>
        </div>
        <button onClick={() => setShareOpen(true)} aria-label="Share" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] text-foreground/80 transition hover:border-primary/40 hover:text-primary">
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

              {evaluated && (<>
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
              </>)}
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setComposerOpen(false)} className="px-3 py-2 rounded-lg border border-border text-sm">Cancel</button>
              <button onClick={publishToCommunity} className="px-3 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-semibold transition enabled:hover:brightness-110 active:scale-[0.98]">Post to Community</button>
            </div>
          </div>
        </div>
      )}

      {evaluated ? (<>
      {/* ---------- left: score + trend ---------- */}
      <div className="space-y-4 land:sticky land:top-[72px]">
        {/* today's session: first thing under the exercise name (top of the left pane on open foldables, not across the hinge) */}
        {sched ? <TodayCard label={sessionLabel} onStart={onStart} done={badge === "Completed"} time={schedTime} /> : <><ScheduleCard onSchedule={() => setSchedOpen(true)} /><ScheduleDialog open={schedOpen} onOpenChange={setSchedOpen} onSaved={(t) => { setSchedTime(t); setSched(true); }} /></>}
        <section className="relative overflow-hidden rounded-[22px] border border-white/[0.06] bg-card p-5">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-60"
            style={{ background: `radial-gradient(closest-side, color-mix(in oklab, ${band.ring} 22%, transparent), transparent)` }} />
          <div className="relative flex items-center gap-5">
            <ScoreRing score={ACCURACY_AVG} size={118} />
            <div className="min-w-0 flex-1">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Accuracy average</div>
              <div className="mt-1 inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: band.ring }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: band.ring }} />{band.label}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                <Stat label="Best" value={`${best}`} />
                <Stat label="Trend" value={`${trend >= 0 ? "+" : ""}${trend}`} tone={trend >= 0 ? "text-success" : "text-destructive"} />
              </div>
            </div>
          </div>
          <div className="relative mt-5">
            <div className="flex items-baseline justify-between text-[12px]">
              <span className="text-muted-foreground">Program progress</span>
              <span className="tabular-nums"><b className="font-semibold">2</b><span className="text-muted-foreground"> of 40 sessions</span></span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: "5%" }} />
            </div>
          </div>
        </section>

        <section className="rounded-[22px] border border-white/[0.06] bg-card p-5">
          <button onClick={() => setChartOpen((v) => !v)} className="flex w-full items-center gap-2 text-left">
            <h2 className="flex-1 text-[14px] font-semibold">Accuracy over time</h2>
            <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-muted-foreground">Last {accuracySeries.length} sessions</span>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition", !chartOpen && "-rotate-90")} />
          </button>
          {chartOpen && (
            <div className="mt-4">
              <AccuracyChart data={accuracySeries} onPointClick={(i, v) => setSessionDetail({ date: sessionWhen(i, accuracySeries.length), time: "", score: v })} />
              <p className="mt-2 text-[11.5px] text-muted-foreground">Tap a point to see that session's evaluation.</p>
            </div>
          )}
        </section>
      </div>

      {/* ---------- right: today + evaluation + details ---------- */}
      <div className="space-y-4">

        <StepAccuracy exerciseName={exerciseName} />

        <section className="overflow-hidden rounded-[22px] border border-white/[0.06] bg-card">
          <button onClick={() => setDetailsOpen((v) => !v)} className="flex w-full items-center gap-2 px-5 py-4 text-left transition hover:bg-white/[0.03]">
            <h2 className="flex-1 text-[14px] font-semibold">How to do it</h2>
            <span className="text-[12px] text-muted-foreground">{detailsOpen ? "Hide" : "Video & steps"}</span>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition", !detailsOpen && "-rotate-90")} />
          </button>
          {detailsOpen && (
            <div className="border-t border-white/[0.05] p-4"><HowTo phase={phase} setPhase={setPhase} /></div>
          )}
        </section>
      </div>
      </>) : (<>
      {/* ---------- not evaluated yet: today's session + why there's no score (left), how to do it (right) ---------- */}
      <div className="space-y-4 land:sticky land:top-[72px]">
        {/* today's session: first thing under the exercise name (top of the left pane on open foldables, not across the hinge) */}
        {sched ? <TodayCard label={sessionLabel} onStart={onStart} done={badge === "Completed"} time={schedTime} /> : <><ScheduleCard onSchedule={() => setSchedOpen(true)} /><ScheduleDialog open={schedOpen} onOpenChange={setSchedOpen} onSaved={(t) => { setSchedTime(t); setSched(true); }} /></>}
        <section className="relative overflow-hidden rounded-[22px] border border-dashed border-white/[0.1] bg-gradient-to-br from-primary/[0.07] via-transparent to-secondary/[0.05] p-5">
          <div className="flex items-start gap-3.5">
            {/* ghost of the score ring this card will become */}
            <div className="relative h-14 w-14 shrink-0">
              <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90">
                <circle cx="36" cy="36" r="31" fill="none" stroke="currentColor" strokeWidth="5" className="text-white/[0.07]" />
                <circle cx="36" cy="36" r="31" fill="none" stroke="url(#ghostRing)" strokeWidth="5" strokeLinecap="round" strokeDasharray="2 9" />
                <defs><linearGradient id="ghostRing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--color-primary)" /><stop offset="1" stopColor="var(--color-secondary)" /></linearGradient></defs>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center"><Sparkles className="h-5 w-5 text-primary" /></span>
            </div>
            <div className="min-w-0">
              <h2 className="text-[14.5px] font-semibold">Your progress starts here</h2>
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">Finish your first session and Poscura scores your accuracy, tracks your progress and gives you personal advice here.</p>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-[22px] border border-white/[0.06] bg-card p-4">
        <h2 className="mb-3 px-1 text-[14px] font-semibold">How to do it</h2>
        <HowTo phase={phase} setPhase={setPhase} withExtras />
      </section>
      </>)}

      {/* ---------- move through the exercises in order: Back / Next, as on the session screen ---------- */}
      {(onPrev || onNext) && (
        /* floating capsule at the bottom centre: always in reach, covers almost nothing */
        <nav aria-label="Exercises" className="sticky bottom-4 z-30 mx-auto flex w-max items-center rounded-full border border-white/[0.1] bg-[#121a2a]/90 p-1 shadow-[0_18px_40px_-12px_rgba(0,0,0,.75)] backdrop-blur-xl land:col-start-2">
          <button onClick={onPrev ?? onClose} title={onPrev ? `Previous: ${prevName ?? ""}` : "Back to the list"}
            className="inline-flex h-12 max-w-[200px] items-center gap-1.5 rounded-full pl-2.5 pr-4 text-left transition hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
            <ChevronLeft className="h-[18px] w-[18px] shrink-0 text-foreground/70" />
            <span className="min-w-0">
              <span className="block text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{onPrev ? "Previous" : "Back"}</span>
              <span className="block truncate text-[13px] font-semibold text-foreground/90">{onPrev ? prevName : "All exercises"}</span>
            </span>
          </button>
          <span aria-hidden className="mx-0.5 h-7 w-px bg-white/[0.12]" />
          <button onClick={onNext} disabled={!onNext} title={nextName ? `Next: ${nextName}` : undefined}
            className="inline-flex h-12 max-w-[200px] items-center gap-1.5 rounded-full pl-4 pr-2.5 text-right transition enabled:hover:bg-primary/10 disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
            <span className="min-w-0">
              <span className="block text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Next</span>
              <span className="block truncate text-[13px] font-semibold text-primary">{nextName ?? "Last exercise"}</span>
            </span>
            <ChevronRight className="h-[18px] w-[18px] shrink-0 text-primary" />
          </button>
        </nav>
      )}
    </div>
  );
}

/* chart point → when that session happened: the last one is today, one session a day before it */
function sessionWhen(i: number, n: number) {
  const back = n - 1 - i;
  if (back === 0) return "Today, 16:00";
  if (back === 1) return "Yesterday, 16:00";
  const d = new Date(); d.setDate(d.getDate() - back);
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, 16:00`;
}

/* "HH:MM" from the schedule dialog → "05:15 AM" */
function fmt12(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${String(h % 12 || 12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/* the exercise isn't on the schedule yet: same slot as today's session, one clear call to action */
function ScheduleCard({ onSchedule }: { onSchedule: () => void }) {
  return (
    <section className="flex items-center gap-3 rounded-[20px] border border-white/[0.06] bg-card px-4 py-3.5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-white/[0.04] ring-1 ring-inset ring-white/[0.08]">
        <CalendarClock className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Schedule</div>
        <div className="mt-0.5 text-[14.5px] font-semibold">Not scheduled yet</div>
      </div>
      <button onClick={onSchedule} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-secondary px-4 text-[13px] font-semibold text-white shadow-[0_10px_26px_-14px] shadow-primary transition hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
        <CalendarClock className="h-3.5 w-3.5" /> Schedule
      </button>
    </section>
  );
}

function TodayCard({ label, onStart, done, time }: { label?: string; onStart?: () => void; done?: boolean; time?: string | null }) {
  // sits right under the exercise name, so it shows when and how far along, not the name again
  return (
    <section className="flex items-center gap-3 rounded-[20px] border border-white/[0.06] bg-card px-4 py-3.5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-emerald-400/25 to-sky-500/20 ring-1 ring-inset ring-white/[0.08]">
        <Clock className="h-5 w-5 text-emerald-300" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Today's session</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[14.5px] font-semibold">
          {done ? "All done" : time ? fmt12(time) : "05:15 AM"}
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] font-normal text-muted-foreground">
            <span className={cn("h-1.5 w-1.5 rounded-full", done ? "bg-success" : "bg-warning")} /> {done ? (label ? `Session ${label}` : "Completed") : `Not started${label ? ` · Session ${label}` : ""}`}
          </span>
        </div>
      </div>
      {done ? (
        // every session for today is finished: a calm status, not another call to action
        <span className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-success/12 px-4 text-[13px] font-semibold text-success ring-1 ring-inset ring-success/25">
          <CircleCheck className="h-4 w-4" /> Done
        </span>
      ) : (
        <button onClick={onStart} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-secondary px-4 text-[13px] font-semibold text-white shadow-[0_10px_26px_-14px] shadow-primary transition hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
          <Play className="h-3.5 w-3.5 fill-current" /> Start
        </button>
      )}
    </section>
  );
}

/* ---------- AI evaluation, per step of the exercise (bands and data shared with the session evaluation) ---------- */
function StepAccuracy({ exerciseName }: { exerciseName: string }) {
  const items = stepsFor(exerciseName);
  const weakest = items.reduce((w, it, i) => (it.score < items[w].score ? i : w), 0);
  const wb = stepBand(items[weakest].score);
  return (
    <section className="rounded-[22px] border border-white/[0.06] bg-card p-5">
      <h2 className="text-[14px] font-semibold">Accuracy, step by step</h2>
      <p className="mt-0.5 text-[12px] text-muted-foreground">Last session · Today, 16:00</p>
      <ol className="mt-4">
        {items.map((it, i) => {
          const b = stepBand(it.score);
          const focus = i === weakest;
          return (
            <li key={it.title} className="relative flex gap-3.5 pb-5 last:pb-0">
              {i < items.length - 1 && <span aria-hidden className="absolute bottom-0 left-[13px] top-7 w-px bg-white/[0.08]" />}
              <span className={cn("relative z-[1] flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12.5px] font-semibold tabular-nums ring-1 ring-inset",
                focus ? b.solid : b.dot)} style={focus ? { boxShadow: `0 0 0 4px color-mix(in oklab, ${b.color} 20%, transparent)` } : undefined}>{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[14px] font-semibold leading-snug">{it.title}</span>
                  <span className={cn("shrink-0 text-[13px] font-semibold tabular-nums", b.text)}>{it.score}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                  <div className={cn("h-full rounded-full transition-[width] duration-700", b.bar)} style={{ width: `${it.score}%` }} />
                </div>
                <div className={cn("mt-2 text-[12.5px] font-semibold", b.text)}>{b.label}</div>
                <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">{b.msg}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-5 rounded-[16px] bg-white/[0.04] p-4 ring-1 ring-inset ring-white/[0.05]">
        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground"><Lightbulb className="h-3.5 w-3.5 text-warning" /> What to improve</div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/90">
          <span className={cn("font-semibold", wb.text)}>{wb.label}</span> · Step {weakest + 1}, “{items[weakest].title}”. This step matched the guide least, so follow its points closely in How to do it.
        </p>
      </div>
    </section>
  );
}

/** Video, schedule, goal / equipment and the step list. Shared by both detail layouts. */
function HowTo({ phase, setPhase, withExtras }: { phase: Phase; setPhase: (p: Phase) => void; withExtras?: boolean }) {
  return (
    <div className="space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-[16px] bg-gradient-to-br from-emerald-300/80 via-teal-400/70 to-sky-500/70">
        <div className="absolute inset-0 flex items-center justify-center">
          <button aria-label="Play video" className="flex h-12 w-12 items-center justify-center rounded-full border border-white/60 bg-white/25 backdrop-blur-md transition hover:bg-white/40 active:scale-95">
            <Play className="h-5 w-5 translate-x-px fill-white text-white" />
          </button>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/60 px-3 pb-2 pt-6 text-[11px] text-white">
          <span className="tabular-nums">0:33 / 0:45</span>
          <div className="h-1 flex-1 rounded-full bg-white/30"><div className="h-full rounded-full bg-white" style={{ width: "73%" }} /></div>
          <Volume2 className="h-3.5 w-3.5" /><Maximize2 className="h-3.5 w-3.5" />
        </div>
      </div>
      <p className="text-[13px] leading-relaxed text-muted-foreground">Relieves tension and improves mobility in the shoulders and neck.</p>
      <div className="grid grid-cols-3 divide-x divide-white/[0.06] rounded-[14px] border border-white/[0.06]">
        <Meta label="Every" value="1" suffix="day" />
        <Meta label="Per day" value="3" suffix="times" />
        <Meta label="Repeat" value="4" suffix="hr" />
      </div>
      {withExtras && (
        <div className="grid grid-cols-2 gap-3">
          <Extra icon={Target} label="Goal" text="Improve mobility and reduce muscle tension in the neck." tone="bg-primary/12 text-primary" />
          <Extra icon={Package} label="You need" text="No equipment. A chair or a yoga mat is enough." tone="bg-secondary/12 text-secondary" />
        </div>
      )}
      <div className="grid grid-cols-3 rounded-full border border-white/[0.06] bg-white/[0.03] p-1">
        {(["warm", "main", "cool"] as Phase[]).map((p) => (
          <button key={p} onClick={() => setPhase(p)}
            className={cn("h-8 rounded-full text-[12.5px] font-medium transition", phase === p ? "bg-white/[0.09] text-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" : "text-muted-foreground hover:text-foreground")}>
            {p === "warm" ? "Warm up" : p === "main" ? "Main" : "Cool down"}
          </button>
        ))}
      </div>
      <StepTimeline key={phase} items={steps[phase].filter((st) => st.description).map((st) => ({ title: st.title, text: st.description }))} />
    </div>
  );
}

function Extra({ icon: Icon, label, text, tone }: { icon: typeof Target; label: string; text: string; tone: string }) {
  return (
    <div className="rounded-[16px] border border-white/[0.06] bg-white/[0.02] p-3.5">
      <span className={cn("flex h-8 w-8 items-center justify-center rounded-[10px]", tone)}><Icon className="h-4 w-4" /></span>
      <div className="mt-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
      <p className="mt-0.5 text-[12.5px] leading-snug text-foreground/85">{text}</p>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={cn("text-[17px] font-semibold tabular-nums leading-tight", tone)}>{value}</div>
    </div>
  );
}

function Meta({ label, value, suffix }: { label: string; value: string; suffix: string }) {
  return (
    <div className="px-3 py-2.5 text-center">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-0.5"><span className="text-[17px] font-semibold tabular-nums">{value}</span><span className="ml-1 text-[11px] text-muted-foreground">{suffix}</span></div>
    </div>
  );
}

/** Smooth area chart: gradient fill, faint 50/100 guides, last point labelled; every point opens that session. */
function AccuracyChart({ data, onPointClick }: { data: number[]; onPointClick?: (i: number, v: number) => void }) {
  const w = 360, h = 170, padX = 14, top = 18, bottom = 22;
  const x = (i: number) => padX + (i * (w - padX * 2)) / (data.length - 1);
  const y = (v: number) => top + (1 - v / 100) * (h - top - bottom);
  const pts = data.map((v, i) => [x(i), y(v)] as const);
  const line = pts.reduce((d, [px, py], i) => {
    if (i === 0) return `M${px},${py}`;
    const [qx, qy] = pts[i - 1]; const cx = (qx + px) / 2;
    return `${d} C${cx},${qy} ${cx},${py} ${px},${py}`;
  }, "");
  const area = `${line} L${x(data.length - 1)},${h - bottom} L${x(0)},${h - bottom} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full overflow-visible">
      <defs>
        <linearGradient id="acc-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-primary)" stopOpacity=".32" />
          <stop offset="1" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="acc-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--color-primary)" />
          <stop offset="1" stopColor="var(--color-secondary)" />
        </linearGradient>
      </defs>
      {[50, 100].map((g) => (
        <g key={g}>
          <line x1={padX} x2={w - padX} y1={y(g)} y2={y(g)} stroke="white" strokeOpacity=".06" strokeDasharray="3 5" />
          <text x={w - padX} y={y(g) - 4} textAnchor="end" fontSize="9" fill="currentColor" className="text-muted-foreground">{g}</text>
        </g>
      ))}
      <path d={area} fill="url(#acc-fill)" />
      <path d={line} fill="none" stroke="url(#acc-line)" strokeWidth="2.5" strokeLinecap="round" />
      {pts.map(([px, py], i) => (
        <g key={i} className="cursor-pointer" onClick={() => onPointClick?.(i, data[i])}>
          <circle cx={px} cy={py} r="11" fill="transparent" />
          <circle cx={px} cy={py} r={i === pts.length - 1 ? 0 : 2.6} fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth="1.6" />
        </g>
      ))}
      <circle cx={last[0]} cy={last[1]} r="9" fill="var(--color-secondary)" opacity=".2" />
      <circle cx={last[0]} cy={last[1]} r="4.5" fill="var(--color-secondary)" stroke="var(--color-card)" strokeWidth="2" />
      <g transform={`translate(${last[0] - 16} ${last[1] - 26})`}>
        <rect width="32" height="18" rx="9" fill="var(--color-secondary)" />
        <text x="16" y="12.5" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#06121f">{data[data.length - 1]}</text>
      </g>
      <text x={x(0)} y={h - 6} fontSize="9" fill="currentColor" className="text-muted-foreground">S1</text>
      <text x={x(data.length - 1)} y={h - 6} textAnchor="end" fontSize="9" fill="currentColor" className="text-muted-foreground">S{data.length}</text>
    </svg>
  );
}
