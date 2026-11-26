import { useEffect, useRef, useState } from "react";
import { ChevronLeft, MessageSquareText, ScanLine, Video, Play, Pause, RotateCcw, AlertCircle, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScoreRing } from "@/components/SessionResult";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { stepsFor, stepBand, coachFocus, type StepScore } from "@/lib/stepEval";

type Props = {
  exerciseName: string;
  score: number;
  /** e.g. "Today, 16:45" */
  when: string;
  /** the session's own recording, when there is one (camera sessions in this preview) */
  videoUrl?: string | null;
  onBack: () => void;
};

/** One session's AI form check: score, accuracy per step, coach comment and the playback of the weakest step.
 *  Reached from the session result ("Step-by-step evaluation") and from any point of the accuracy chart. */
export function SessionEvaluation({ exerciseName, score, when, videoUrl, onBack }: Props) {
  const items = stepsFor(exerciseName, score);
  const focus = coachFocus(items);
  const [how, setHow] = useState(false);
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="space-y-4 land:grid land:grid-cols-2 hinge-split land:items-start land:gap-x-6 land:gap-y-4 land:space-y-0">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-[13px] font-medium text-muted-foreground transition hover:text-foreground land:col-span-2">
        <ChevronLeft className="h-4 w-4" /> {exerciseName}
      </button>

      <div className="space-y-4">
        <section className="flex items-center gap-4 rounded-[22px] border border-white/[0.06] bg-card p-4">
          <ScoreRing score={score} size={60} stroke={5} />
          <div className="min-w-0">
            <div className="text-[16px] font-semibold">{when}</div>
            <div className="mt-0.5 text-[12.5px] text-muted-foreground">Accuracy Score {score} out of 100</div>
          </div>
        </section>

        <section className="rounded-[22px] border border-white/[0.06] bg-card p-5">
          <h2 className="text-[14px] font-semibold">Accuracy, step by step</h2>
          <ol className="mt-4">
            {items.map((it, i) => {
              const b = stepBand(it.score);
              const weak = focus?.idx.includes(i);
              return (
                <li key={it.title} className="relative flex gap-3.5 pb-5 last:pb-0">
                  {i < items.length - 1 && <span aria-hidden className="absolute bottom-0 left-[13px] top-7 w-px bg-white/[0.08]" />}
                  <span className={cn("relative z-[1] flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12.5px] font-semibold tabular-nums ring-1 ring-inset",
                    weak ? b.solid : b.dot)}
                    style={weak ? { boxShadow: `0 0 0 4px color-mix(in oklab, ${b.color} 20%, transparent)` } : undefined}>{i + 1}</span>
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
          <button onClick={() => setHow(true)} className="mt-4 text-[12.5px] font-semibold text-primary transition hover:underline">How it's measured</button>
        </section>
      </div>

      <div className="space-y-4">
        <section className="rounded-[22px] border border-white/[0.06] bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-[14px] font-semibold"><MessageSquareText className="h-4 w-4 text-primary" /> Coach comment</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10.5px] font-semibold text-primary ring-1 ring-inset ring-primary/20"><ScanLine className="h-3 w-3" /> AI form check</span>
          </div>
          {focus ? (
            <div className="mt-3">
              <div className="flex gap-2.5">
                <span className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full ring-[1.5px]" style={{ color: focus.band.color, boxShadow: `inset 0 0 0 1.5px ${focus.band.color}` }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: focus.band.color }} />
                </span>
                <div className="min-w-0 text-[13.5px] leading-relaxed">
                  <span className={cn("font-semibold", focus.band.text)}>{focus.band.label}</span>
                  <span className="font-semibold"> · {focus.many ? `Steps ${focus.idx.slice(0, -1).map((i) => i + 1).join(", ")} and ${focus.idx[focus.idx.length - 1] + 1}` : `Step ${focus.idx[0] + 1}, ${items[focus.idx[0]].title}`}</span>
                  <p className="mt-1 text-[13px] text-muted-foreground">{focus.message}</p>
                  {focus.many && (
                    <ul className="mt-2 space-y-1">
                      {focus.idx.map((i) => (
                        <li key={i} className="flex items-center gap-2 text-[13px] font-semibold"><span className="h-1 w-1 rounded-full" style={{ background: focus.band.color }} />Step {i + 1}, {items[i].title}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-3 flex gap-2.5 text-[13.5px] leading-relaxed"><CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />Perfect form! Every step matched the guide. Keep the same steady pace next time.</p>
          )}
          <p className="mt-4 text-[11.5px] leading-relaxed text-muted-foreground/70">AI compares each step with the guide's ideal posture. Simulated in this preview.</p>
        </section>

        {/* a perfect session has nothing to review */}
        {focus && <Playback step={items[focus.idx[0]]} videoUrl={videoUrl} />}
      </div>

      <Dialog open={how} onOpenChange={setHow}>
        <DialogContent className="max-w-[420px] rounded-[24px]">
          <DialogHeader>
            <DialogTitle>How it's measured</DialogTitle>
            <DialogDescription className="leading-relaxed">
              During each rep, Poscura tracks your body's key points with the camera and compares them with the guide's ideal posture for that step. 100 means a perfect match.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2 text-[13px]">
            {[95, 80, 65, 40].map((s) => { const b = stepBand(s); return (
              <li key={b.key} className="flex items-center gap-2.5"><span className={cn("h-2 w-2 rounded-full", b.bar)} /><span className={cn("font-semibold", b.text)}>{b.label}</span>
                <span className="ml-auto tabular-nums text-muted-foreground">{b.key === "perfect" ? "90–100" : b.key === "almost" ? "75–89" : b.key === "building" ? "60–74" : "below 60"}</span></li>
            ); })}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const DURATION = 30; // seconds of playback, 10 reps
const REPS = 10;

/** Replay of the weakest step: rep-by-rep timeline, the step's score on top. */
function Playback({ step, videoUrl }: { step: StepScore; videoUrl?: string | null }) {
  const b = stepBand(step.score);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const raf = useRef(0);
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000; last = now;
      setT((v) => { const n = Math.min(DURATION, v + dt); if (n >= DURATION) setPlaying(false); return n; });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing]);
  const ended = t >= DURATION;
  const rep = Math.min(REPS, Math.floor((t / DURATION) * REPS) + 1);
  const toggle = () => { if (ended) { setT(0); setPlaying(true); } else setPlaying((p) => !p); };
  const fmt = (s: number) => `0:${String(Math.floor(s)).padStart(2, "0")}`;
  // the figure leans with each rep, so the playback reads as motion
  const phase = Math.sin((t / DURATION) * REPS * Math.PI * 2);

  return (
    <section className="rounded-[22px] border border-white/[0.06] bg-card p-5">
      <h2 className="flex items-center gap-2 text-[14px] font-semibold"><Video className="h-4 w-4 text-primary" /> Playback</h2>
      <div className="relative mt-3 aspect-[16/11] overflow-hidden rounded-[16px] bg-gradient-to-b from-[#0d1422] to-[#05080f] ring-1 ring-inset ring-white/[0.06]">
        {videoUrl ? (
          <video src={videoUrl} className="absolute inset-0 h-full w-full object-cover" muted playsInline />
        ) : (
          <svg viewBox="0 0 200 140" className="absolute inset-0 h-full w-full" aria-hidden>
            <g stroke="rgb(148 197 255)" strokeWidth="2.2" fill="none" strokeLinecap="round" transform={`translate(100 0) rotate(${phase * 4} 0 70)`}>
              <circle cx={phase * 3} cy="38" r="9" />
              <path d={`M${phase * 2} 47 L0 88 M0 58 L-18 80 M0 58 L18 80 M0 88 L-10 122 M0 88 L10 122`} />
            </g>
          </svg>
        )}
        <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2 text-[11.5px] font-medium">
          <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur">
            <AlertCircle className={cn("h-3.5 w-3.5 shrink-0", b.text)} />
            <span className="truncate">{step.title}</span>
            <span className={cn("font-semibold tabular-nums", b.text)}>{step.score}</span>
          </span>
          <span className="shrink-0 rounded-full bg-black/50 px-2.5 py-1 tabular-nums backdrop-blur">Rep {rep} of {REPS}</span>
        </div>
        {!playing && (
          <button onClick={toggle} aria-label={ended ? "Replay" : "Play"}
            className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#0b1220] shadow-lg transition hover:scale-105 active:scale-95">
            {ended ? <RotateCcw className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-px fill-current" />}
          </button>
        )}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button onClick={toggle} aria-label={playing ? "Pause" : ended ? "Replay" : "Play"} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground/85 transition hover:bg-white/[0.06]">
          {playing ? <Pause className="h-4 w-4 fill-current" /> : ended ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
        </button>
        {/* scrubber with one tick per rep */}
        <div className="relative h-5 flex-1 cursor-pointer" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setT(Math.max(0, Math.min(DURATION, ((e.clientX - r.left) / r.width) * DURATION))); }}>
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/[0.1]" />
          <div className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary" style={{ width: `${(t / DURATION) * 100}%` }} />
          {Array.from({ length: REPS - 1 }, (_, i) => (
            <span key={i} className="absolute top-1/2 h-2.5 w-px -translate-y-1/2 bg-white/25" style={{ left: `${((i + 1) / REPS) * 100}%` }} />
          ))}
          <span className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow" style={{ left: `${(t / DURATION) * 100}%` }} />
        </div>
        <span className="shrink-0 text-[11.5px] tabular-nums text-muted-foreground">{fmt(t)} / {fmt(DURATION)}</span>
      </div>
    </section>
  );
}
