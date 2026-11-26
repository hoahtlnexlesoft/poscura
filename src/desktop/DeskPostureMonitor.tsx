import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock, Crown, Play, RotateCw, Settings, Square, BookOpen } from "lucide-react";
import { DiscomfortDialog } from "@/components/DiscomfortDialog";
import { SessionReport } from "@/components/SessionReport";
import { CameraSettingDialog } from "@/components/CameraSettingDialog";
import { cn } from "@/lib/utils";
import { Panel, Eyebrow, btn, Page } from "./ui";
import { SegGauge } from "./SegGauge";

const SESSION = 30 * 60;
const HISTORY = [
  { date: "Nov 17, 2026", min: 16, score: 91 },
  { date: "Nov 9, 2026", min: 2, score: 82 },
  { date: "Nov 9, 2026", min: 5, score: 78 },
  { date: "Nov 2, 2026", min: 24, score: 86 },
  { date: "Oct 28, 2026", min: 12, score: 73 },
];

export function DeskPostureMonitor({ initialReport }: { initialReport?: boolean }) {
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(SESSION);
  const [discomfort, setDiscomfort] = useState(false);
  const [report, setReport] = useState(!!initialReport);
  const [camOpen, setCamOpen] = useState(false);
  const [cam, setCam] = useState("Camera Setting");
  const [more, setMore] = useState(false);
  const [spin, setSpin] = useState(false);
  const t = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    if (!running) return;
    t.current = setInterval(() => setLeft((s) => (s <= 1 ? (stop(), 0) : s - 1)), 1000);
    return () => clearInterval(t.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);
  const stop = () => { setRunning(false); clearInterval(t.current); setDiscomfort(true); };

  if (report) return <Page><SessionReport onClose={() => setReport(false)} /></Page>;

  const mm = String(Math.floor(left / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");

  return (
    <Page className="grid grid-cols-[minmax(0,1fr)_340px] items-start gap-6 max-[1099px]:grid-cols-1">
      {/* ---------- camera stage ---------- */}
      <section className="overflow-hidden rounded-[24px] border border-white/[0.06] bg-black">
        <div className="relative aspect-[16/10] bg-[radial-gradient(80%_70%_at_50%_45%,#0f1828,#05070b_75%)]">
          <div className="absolute inset-x-4 top-4 z-10 flex justify-between">
            <button onClick={() => setCamOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3.5 text-[12.5px] font-medium text-foreground/85 backdrop-blur transition hover:border-white/25 hover:bg-black/70">
              <Settings className="h-3.5 w-3.5" /> {cam}
            </button>
            <button className="inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3.5 text-[12.5px] font-medium text-foreground/85 backdrop-blur transition hover:border-white/25 hover:bg-black/70">
              <BookOpen className="h-3.5 w-3.5" /> Setup Guide
            </button>
          </div>

          {running ? <FramingGuide /> : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-white/[0.04] ring-1 ring-inset ring-white/10"><Camera className="h-7 w-7 text-muted-foreground" strokeWidth={1.6} /></span>
              <p className="text-[13.5px] text-muted-foreground">Camera feed will appear here</p>
              <button onClick={() => { setLeft(SESSION); setRunning(true); }} className={btn.primary}><Play className="h-4 w-4 fill-current" /> Start Monitoring</button>
            </div>
          )}
        </div>
        {/* session bar: same height idle and running, so the stage never jumps */}
        <div className="flex h-[72px] items-center justify-between gap-4 border-t border-white/[0.06] bg-[#0b111c] px-6">
          <div>
            <Eyebrow>Session</Eyebrow>
            <div className="mt-1 text-[20px] font-semibold tabular-nums">{running ? `${mm}:${ss}` : "30:00"}</div>
          </div>
          <div className="text-[12.5px] text-muted-foreground">{running ? "Monitoring" : "Not started"}</div>
          {running
            ? <button onClick={stop} className="inline-flex h-10 items-center gap-2 rounded-full bg-destructive px-5 text-[13.5px] font-semibold text-white transition hover:brightness-110 active:scale-[0.98]"><Square className="h-3.5 w-3.5 fill-current" /> Stop</button>
            : <span className="w-[86px]" />}
        </div>
      </section>

      {/* ---------- right: time left + history ---------- */}
      <div className="space-y-6">
        <Panel>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/12 text-primary"><Clock className="h-4 w-4" /></span><Eyebrow>Time left</Eyebrow></span>
            <span className="text-[22px] font-semibold tabular-nums">30<span className="text-[13px] text-muted-foreground">h</span> 13<span className="text-[13px] text-muted-foreground">m</span></span>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full w-[3%] rounded-full bg-gradient-to-r from-primary to-secondary" /></div>
          <Link to="/checkout" className={cn(btn.outline, "mt-4 w-full")}><Crown className="h-4 w-4 text-warning" /> Upgrade</Link>
        </Panel>

        <Panel title="History" action={
          <button onClick={() => { setSpin(true); setTimeout(() => setSpin(false), 900); }} aria-label="Refresh" className={cn(btn.icon, "h-8 w-8")}><RotateCw className={cn("h-3.5 w-3.5", spin && "animate-spin")} /></button>
        } bodyClass="px-3 pb-3">
          <ul className="space-y-1">
            {(more ? HISTORY : HISTORY.slice(0, 3)).map((h, i) => (
              <li key={i}>
                <button onClick={() => setReport(true)} className="group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                  <SegGauge value={h.score} size={72} segments={5} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold">{h.date}</div>
                    <div className="mt-0.5 flex items-center gap-1 text-[12px] text-muted-foreground"><Clock className="h-3 w-3" /> {h.min} min</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                </button>
              </li>
            ))}
          </ul>
          <button onClick={() => setMore((m) => !m)} className={cn(btn.ghost, "mx-auto mt-1 flex")}>{more ? "View less" : "View more"} <ChevronDown className={cn("h-4 w-4 transition", more && "rotate-180")} /></button>
        </Panel>
      </div>

      <DiscomfortDialog open={discomfort} onClose={() => setDiscomfort(false)} onSubmit={() => { setDiscomfort(false); setReport(true); }} onSkip={() => { setDiscomfort(false); setReport(true); }} />
      <CameraSettingDialog open={camOpen} onClose={() => setCamOpen(false)} onConnect={(s) => setCam(s)} />
    </Page>
  );
}

/** red framing guide shown while the body isn't fully in frame */
function FramingGuide() {
  const corner = "absolute h-10 w-10 border-destructive";
  return (
    <div className="absolute inset-5 top-16 rounded-xl bg-destructive/[0.12]">
      <span className={cn(corner, "left-0 top-0 rounded-tl-xl border-l-4 border-t-4")} />
      <span className={cn(corner, "right-0 top-0 rounded-tr-xl border-r-4 border-t-4")} />
      <span className={cn(corner, "bottom-0 left-0 rounded-bl-xl border-b-4 border-l-4")} />
      <span className={cn(corner, "bottom-0 right-0 rounded-br-xl border-b-4 border-r-4")} />
      <div className="absolute inset-x-0 top-3 flex flex-col items-center text-[13px] font-medium"><ChevronDown className="h-5 w-5" />Show head in frame</div>
      <div className="absolute inset-x-0 bottom-3 flex flex-col-reverse items-center text-[13px] font-medium"><ChevronUp className="h-5 w-5" />Show hip in frame</div>
      <ChevronRight className="absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2" />
      <ChevronLeft className="absolute right-3 top-1/2 h-6 w-6 -translate-y-1/2" />
      <div className="absolute inset-0 flex items-center justify-center text-[14px] font-medium">Keep your torso in frame</div>
    </div>
  );
}
