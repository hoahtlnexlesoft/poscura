import { useEffect, useRef, useState } from "react";
import { Dumbbell, Clock, Eye, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, History, Play, Share2, Tag, Volume2, VolumeX, CalendarClock, Pause } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Panel, PageHead, btn, Page, Eyebrow } from "./ui";
import { ScheduleDialog } from "./DeskDashboard";
import { NoWorkoutsToday } from "@/components/NoWorkoutsToday";
import { NoHistory } from "@/components/NoHistory";
import { TODAYS_WORKOUTS, TODAY_TIME, NEXT_WORKOUT } from "@/lib/todays-workouts";

const PROGRAM = {
  name: "Posture & Neck Strengthening Program",
  tag: "Posture Correction",
  desc: "A beginner-friendly routine to improve neck posture, reduce pain, and enhance overall spinal health.",
  sessions: 91, exercises: 4, weeks: 4, done: 0,
};
const EXERCISES = [
  { name: "Active Lateral Neck Flexion", desc: "Actively tilt head to both sides", sessions: 28, phase: "Warm up", hue: "from-[#1d3fbf] to-[#0e1f66]" },
  { name: "Light Isometric Lateral Flexion", desc: "Create gentle pushing force into hand while keeping the head still", sessions: 21, phase: "Main", hue: "from-[#6b2bd9] to-[#2e1166]" },
  { name: "Deep Neck Flexor Training", desc: "Strengthen deep neck flexor muscles", sessions: 28, phase: "Main", hue: "from-[#7a2bd9] to-[#331166]" },
  { name: "Seated Thoracic Rotation", desc: "Gentle upper back rotation while seated", sessions: 14, phase: "Cool down", hue: "from-[#1f8a4c] to-[#0b3a22]" },
];
const HISTORY = [
  { name: "Neck & Shoulder Alignment Routine", end: "Nov 13, 2026", pct: 4 },
  { name: "Posture & Neck Wellness", end: "Oct 8, 2026", pct: 2 },
  { name: "Upper Back Mobility", end: "Sep 2, 2026", pct: 37 },
];
const PHASE = { "Warm up": "bg-sky-500/12 text-sky-300 ring-sky-400/25", Main: "bg-primary/12 text-primary ring-primary/25", "Cool down": "bg-success/12 text-success ring-success/25" } as const;

// same program the Program screen shows, so Details opens what the card says
const CURRENT = { name: "Shoulder & Neck Relief", sessions: 39, exercises: 4, start: "Nov 20, 2026", end: "Dec 18, 2026", done: 0 };

export function DeskWorkoutHome({ empty, noHistory, onProgram, onExercise, onStart }: { empty?: boolean; noHistory?: boolean; onProgram: () => void; onExercise: (n: string) => void; onStart: (n: string) => void }) {
  const [more, setMore] = useState(false);
  const pct = Math.round((CURRENT.done / CURRENT.sessions) * 100);
  return (
    <Page>
      <PageHead title="Workout" subtitle="Personalized workout plans" />
      <div className="grid grid-cols-[minmax(0,1fr)_400px] items-start gap-6 max-[1099px]:grid-cols-1">
      {empty ? <NoWorkoutsToday className="rounded-[24px] min-h-[320px]" /> : <TodaysSessions onExercise={onExercise} onStart={onStart} />}
      <div className="space-y-6">
        <Panel title="Current Program" icon={<CalendarDays className="h-4 w-4 text-primary" />}
          action={<button onClick={onProgram} className={btn.ghost}>Details <ChevronRight className="h-4 w-4" /></button>}>
          <button onClick={onProgram} className="group w-full rounded-[20px] border border-white/[0.06] bg-gradient-to-br from-primary/[0.07] via-transparent to-secondary/[0.05] p-5 text-left transition hover:border-primary/30">
            <h3 className="text-[16px] font-semibold leading-snug tracking-tight">{CURRENT.name}</h3>
            <dl className="mt-5 grid grid-cols-4 max-[639px]:grid-cols-2 max-[639px]:[&>*:nth-child(3)]:border-l-0 max-[639px]:[&>*:nth-child(n+3)]:border-t max-[639px]:[&>*]:border-white/[0.06] divide-x divide-white/[0.06] rounded-2xl border border-white/[0.06] bg-background/30">
              {[["Total", CURRENT.sessions], ["Exercises", CURRENT.exercises], ["Start", CURRENT.start], ["End", CURRENT.end]].map(([l, v]) => (
                <div key={l} className="px-3 py-3">
                  <dt className="text-[12px] text-muted-foreground">{l}</dt>
                  <dd className={cn("mt-1 font-semibold tabular-nums", typeof v === "number" ? "text-[19px]" : "text-[12.5px] leading-tight")}>{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex justify-between text-[12.5px]"><span className="font-semibold">{pct}% completed</span><span className="tabular-nums text-muted-foreground">{CURRENT.done}/{CURRENT.sessions}</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${Math.max(pct, 1)}%` }} /></div>
          </button>
        </Panel>

        <Panel title="Workout History" icon={<History className="h-4 w-4 text-secondary" />} bodyClass="px-3 pb-3">
          {noHistory ? <div className="px-3 pb-1"><NoHistory /></div> : <><ul className="space-y-1">
            {(more ? HISTORY : HISTORY.slice(0, 2)).map((h) => (
              <li key={h.name}>
                <button onClick={onProgram} className="group flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left transition hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                                    <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold">{h.name}</span>
                    <span className="text-[12px] text-muted-foreground">End <span className="text-destructive">{h.end}</span></span>
                  </span>
                  <span className="w-16 shrink-0">
                    <span className="block text-right text-[12.5px] font-semibold tabular-nums text-foreground/90">{h.pct}%</span>
                    <span className="mt-1 block h-1 overflow-hidden rounded-full bg-white/[0.06]"><span className="block h-full rounded-full bg-secondary" style={{ width: `${h.pct}%` }} /></span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                </button>
              </li>
            ))}
          </ul>
          <button onClick={() => setMore((m) => !m)} className={cn(btn.ghost, "mx-auto mt-1 flex")}>{more ? "View less" : "View more"} <ChevronDown className={cn("h-4 w-4 transition", more && "rotate-180")} /></button></>}
        </Panel>
      </div>
      </div>
    </Page>
  );
}

function TodaysSessions({ onExercise, onStart }: { onExercise: (n: string) => void; onStart: (n: string) => void }) {
  return (
    <Panel title="Today's Sessions" icon={<Dumbbell className="h-4 w-4 text-primary" />} bodyClass="px-3 pb-3">
      <div className="mx-3 mb-2 flex items-center gap-2 rounded-xl bg-primary/[0.08] px-3.5 py-2.5 text-[12.5px] text-primary ring-1 ring-inset ring-primary/20">
        <Clock className="h-3.5 w-3.5 shrink-0" /><span className="min-w-0">Next: <span className="font-semibold">{NEXT_WORKOUT}</span> at <span className="whitespace-nowrap font-semibold">{TODAY_TIME}</span></span>
      </div>
      <ul className="space-y-1">
        {TODAYS_WORKOUTS.map((w) => {
          const done = w.done >= w.sessions;
          return (
            <li key={w.name} className="group flex items-center gap-4 rounded-2xl px-3 py-3 transition hover:bg-white/[0.04]">
              <button onClick={() => onExercise(w.name)} className="min-w-0 flex-1 text-left focus-visible:outline-none">
                <div className="truncate text-[14.5px] font-semibold transition group-hover:text-primary">{w.name}</div>
                <div className="mt-1 flex items-center gap-2 text-[12px] text-muted-foreground">
                  <span className={cn("rounded-full px-2 py-px text-[11px] font-semibold ring-1 ring-inset", done ? "bg-success/12 text-success ring-success/25" : "bg-destructive/12 text-destructive ring-destructive/25")}>{done ? "Completed" : "Incompleted"}</span>
                  {TODAY_TIME} · {w.done}/{w.sessions}
                </div>
              </button>
              <button onClick={() => (done ? onExercise(w.name) : onStart(w.name))} aria-label={done ? `View ${w.name}` : `Start ${w.name}`}
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-white/[0.1] bg-background px-4 text-[13px] font-semibold transition hover:border-primary/50 hover:text-primary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                {done ? <Eye className="h-4 w-4" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                {done ? "View" : "Start"}
              </button>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

export function DeskProgram({ onBack }: { onBack: () => void }) {
  const [sched, setSched] = useState(false);
  const [video, setVideo] = useState<string | null>(null);
  if (video) return <DeskVideo title={video} onBack={() => setVideo(null)} />;
  return (
    <Page>
      <PageHead title="Workout" back={onBack} actions={<>
        <button className={btn.icon} aria-label="Share" onClick={() => toast.success("Link copied")}><Share2 className="h-4 w-4" /></button>
        <button className={cn(btn.primary, "h-10 px-5 text-[13px]")} onClick={() => setSched(true)}><CalendarClock className="h-4 w-4" /> Set schedule</button>
      </>} />
      <div className="space-y-6">
        <Panel>
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <h2 className="text-[22px] font-semibold tracking-tight">{PROGRAM.name}</h2>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 py-1 text-[12px] text-foreground/80 ring-1 ring-inset ring-white/10"><Tag className="h-3 w-3" /> {PROGRAM.tag}</span>
              <p className="mt-3 max-w-[640px] text-[13.5px] leading-relaxed text-muted-foreground">{PROGRAM.desc}</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-8 max-[899px]:grid-cols-1 max-[899px]:gap-5">
            <div>
              <div className="flex justify-between text-[12.5px]"><Eyebrow>Progress</Eyebrow><span className="tabular-nums text-muted-foreground">{PROGRAM.done}/{PROGRAM.sessions} session(s)</span></div>
              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full w-[1%] rounded-full bg-gradient-to-r from-primary to-secondary" /></div>
            </div>
            <dl className="grid grid-cols-3 divide-x divide-white/[0.06] rounded-2xl border border-white/[0.06] bg-background/30">
              {[["Sessions", PROGRAM.sessions, ""], ["Exercises", PROGRAM.exercises, ""], ["Duration", PROGRAM.weeks, "weeks"]].map(([l, v, u]) => (
                <div key={l as string} className="px-6 py-3">
                  <dt className="text-[12px] text-muted-foreground">{l}</dt>
                  <dd className="mt-0.5 text-[19px] font-semibold tabular-nums">{v}{u && <span className="ml-1 text-[12px] font-normal text-muted-foreground">{u}</span>}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Panel>

        <Panel title="Exercise list">
          <ul className="grid grid-cols-2 gap-3 max-[699px]:grid-cols-1">
            {EXERCISES.map((e) => (
              <li key={e.name}>
                <button onClick={() => setVideo(e.name)} className="group flex w-full items-center gap-4 rounded-[18px] border border-white/[0.06] bg-white/[0.015] p-3 text-left transition hover:border-white/15 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                  <span className={cn("relative flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br", e.hue)}>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur transition group-hover:scale-110 group-hover:bg-white/30"><Play className="ml-0.5 h-4 w-4 fill-white text-white" /></span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold">{e.name}</span>
                    <span className="mt-0.5 block truncate text-[12.5px] text-muted-foreground">{e.desc}</span>
                    <span className="mt-2 flex items-center gap-2">
                      <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[11.5px] text-foreground/75">{e.sessions} sessions</span>
                      <span className={cn("rounded-full px-2 py-0.5 text-[11.5px] font-semibold ring-1 ring-inset", PHASE[e.phase as keyof typeof PHASE])}>{e.phase}</span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <ScheduleDialog open={sched} onOpenChange={setSched} />
    </Page>
  );
}

/** exercise video, full window like the app's player */
export function DeskVideo({ title, onBack }: { title: string; onBack: () => void }) {
  const [t, setT] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const total = 73;
  const iv = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  useEffect(() => {
    if (!playing) return;
    iv.current = setInterval(() => setT((x) => (x >= total ? (setPlaying(false), total) : x + 1)), 1000);
    return () => clearInterval(iv.current);
  }, [playing]);
  const f = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center gap-3 p-4">
        <button onClick={onBack} aria-label="Back" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"><ChevronLeft className="h-5 w-5" /></button>
        <span className="text-[14px] font-semibold text-white/90">{title}</span>
      </div>
      <button onClick={() => setPlaying((p) => !p)} className="group relative mx-auto flex aspect-[9/16] min-h-0 flex-1 items-center justify-center bg-gradient-to-b from-[#5fb4d4] to-[#3a8db0]" aria-label={playing ? "Pause" : "Play"}>
        <span className="text-[120px] font-light text-white">{Math.min(4, Math.floor(t / 18) + 1)}</span>
        <span className={cn("absolute flex h-16 w-16 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition", playing ? "opacity-0 group-hover:opacity-100" : "opacity-100")}>
          {playing ? <Pause className="h-6 w-6 fill-current" /> : <Play className="ml-1 h-6 w-6 fill-current" />}
        </span>
      </button>
      <div className="flex items-center gap-4 px-5 py-4 text-[12.5px] tabular-nums text-white/85">
        <span>{f(t)} / {f(total)}</span>
        <input type="range" min={0} max={total} value={t} onChange={(e) => setT(+e.target.value)} aria-label="Seek" className="h-1 flex-1 cursor-pointer accent-primary" />
        <button onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute" : "Mute"} className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10">
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
