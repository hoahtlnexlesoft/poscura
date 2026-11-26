import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, ChevronRight, Play, Tag, CalendarClock, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { TODAYS_WORKOUTS, TODAY_TIME, PROGRESS_ORDER } from "@/lib/todays-workouts";
import { cn } from "@/lib/utils";
import { Panel, Eyebrow, btn, Page } from "./ui";
import { FirstScan } from "@/components/FirstScan";
import { NoWorkoutsArt } from "@/components/EmptyArt";
import { SegGauge } from "./SegGauge";
import { Bust, BustLegend } from "./Bust";

const progressDone = TODAYS_WORKOUTS.reduce((a, w) => a + w.programDone, 0);
const progressTotal = TODAYS_WORKOUTS.reduce((a, w) => a + w.programTotal, 0);

export function DeskDashboard({ empty, fresh }: { empty?: boolean; fresh?: boolean }) {
  if (fresh) return <Page><FirstScan /></Page>;
  return (
    <Page className="grid grid-cols-[minmax(0,1fr)_380px] items-start gap-6 max-[1099px]:grid-cols-1">
      <div className="space-y-6">
        <Highlights />
        <Summary />
      </div>
      <div className="sticky top-6 space-y-6">
        {empty ? <NoWorkouts /> : <><TodaysWorkouts /><WorkoutProgress /></>}
      </div>
    </Page>
  );
}

function Highlights() {
  return (
    <Panel title="Posture Highlights">
      <div className="relative overflow-hidden rounded-[18px] border border-destructive/25 bg-gradient-to-br from-destructive/[0.10] via-destructive/[0.04] to-transparent p-5">
        <div className="flex items-center gap-2 text-[14px] font-semibold text-destructive">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/15"><AlertTriangle className="h-4 w-4" /></span>
          New Risk Detected
        </div>
        <p className="mt-3 text-[13.5px] leading-relaxed text-foreground/80">
          <span className="font-semibold text-foreground">Spine &amp; Torso</span> — New assessment shows a severe coronal spine tilt, 29.4° angle, causing a brief
          54-second muscle strain. Early detection of this single joint issue can prevent cascading shifts and protect overall spinal stability. Stay proactive!
        </p>
        <Link to="/posture-monitor" search={{ report: "1" }} className={cn(btn.ghost, "-ml-3 mt-3")}>
          View detail report <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <p className="mt-4 text-center text-[12px] text-muted-foreground">
        For wellness and habit awareness only. Based on <a className="text-primary hover:underline" href="#">MediaPipe Pose</a> and{" "}
        <a className="text-primary hover:underline" href="#">Digital Photogrammetry</a> research.
      </p>
    </Panel>
  );
}

function Summary() {
  return (
    <Panel title="Posture Summary">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-5">
        <div>
          <Eyebrow>Average score</Eyebrow>
          <SegGauge value={92} size={170} className="mt-4" />
        </div>
        <div className="text-right">
          <Eyebrow>Monitoring time</Eyebrow>
          <div className="mt-3 flex items-center gap-2">
            <TimeBox v="02" l="hrs" /><span className="pb-5 text-xl text-muted-foreground">:</span><TimeBox v="46" l="min" />
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-[18px] bg-[radial-gradient(60%_60%_at_50%_45%,rgba(59,139,255,0.08),transparent_70%)] pt-2">
        <Bust />
        <div className="mt-4"><BustLegend /></div>
      </div>
      <p className="mt-6 border-t border-white/[0.05] pt-4 text-center text-[12px] leading-relaxed text-muted-foreground">
        Poscura is for wellness awareness only and does not provide medical advice. All exercises and tips are recommendations for wellness maintenance.
        Always consult a physician for medical concerns. View <a className="text-primary hover:underline" href="#">Terms of Service</a> for more details.
      </p>
    </Panel>
  );
}

const TimeBox = ({ v, l }: { v: string; l: string }) => (
  <div className="text-center">
    <div className="flex h-14 w-16 items-center justify-center rounded-2xl border border-primary/25 bg-primary/[0.07] text-[24px] font-semibold tabular-nums">{v}</div>
    <div className="mt-1.5 text-[11.5px] text-muted-foreground">{l}</div>
  </div>
);

function TodaysWorkouts() {
  return (
    <Panel title="Today's Workouts" action={<span className="text-[12px] text-muted-foreground">{TODAYS_WORKOUTS.length} sessions</span>} bodyClass="px-3 pb-3">
      <ul className="space-y-1">
        {TODAYS_WORKOUTS.map((w) => (
          <li key={w.name}>
            <Link to="/workout" search={{ session: w.name }}
              className="group flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-semibold">{w.name}</div>
                <div className="mt-0.5 text-[12px] text-muted-foreground">Session {w.done}/{w.sessions} · {TODAY_TIME}</div>
              </div>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary ring-1 ring-inset ring-primary/30 transition group-hover:bg-primary group-hover:text-white">
                <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function WorkoutProgress() {
  const pct = Math.round((progressDone / progressTotal) * 100);
  return (
    <Panel title="Workout progress">
      <div className="flex items-baseline gap-2">
        <span className="text-[34px] font-semibold leading-none tabular-nums">{progressDone}</span>
        <span className="text-[13px] text-muted-foreground">/ {progressTotal} sessions · {pct}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${Math.max(pct, 2)}%` }} /></div>
      <ul className="mt-5 space-y-3.5">
        {PROGRESS_ORDER.slice(0, 4).map((p) => (
          <li key={p.name}>
            <div className="flex justify-between gap-3 text-[12.5px]">
              <span className="truncate text-foreground/85">{p.name}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">{p.programDone}/{p.programTotal}</span>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-primary/80" style={{ width: `${(p.programDone / p.programTotal) * 100}%` }} /></div>
          </li>
        ))}
      </ul>
      <Link to="/workout" className={cn(btn.ghost, "mt-4 -ml-3")}>View workout plan <ChevronRight className="h-4 w-4" /></Link>
    </Panel>
  );
}

export function NoWorkouts() {
  const [open, setOpen] = useState(false);
  return (
    <Panel title="Today's Workouts">
      <div className="flex flex-col items-center pb-5 pt-1 text-center">
        <NoWorkoutsArt className="w-[150px]" />
        <div className="mt-3 text-[15px] font-semibold">No Workouts Scheduled</div>
      </div>
      {/* the program waiting for a schedule */}
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-5 ring-1 ring-inset ring-white/[0.07]">
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-secondary/15 blur-3xl" />
        <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 py-1 text-[11.5px] text-foreground/80 ring-1 ring-inset ring-white/10"><Tag className="h-3 w-3" /> Posture Correction</span>
        <h3 className="relative mt-3 text-[16.5px] font-semibold leading-snug tracking-tight">Posture &amp; Neck Strengthening Program</h3>
        <p className="relative mt-2 text-[12.5px] leading-relaxed text-muted-foreground">A beginner-friendly routine to improve neck posture, reduce pain, and enhance overall spinal health.</p>
        <div className="relative mt-4 flex items-center gap-5 border-t border-white/[0.06] pt-4">
          <div><div className="text-[20px] font-semibold leading-none tabular-nums">91</div><div className="mt-1 text-[11.5px] text-muted-foreground">sessions</div></div>
          <span aria-hidden className="h-8 w-px bg-white/[0.08]" />
          <div><div className="text-[20px] font-semibold leading-none tabular-nums">4</div><div className="mt-1 text-[11.5px] text-muted-foreground">exercises</div></div>
        </div>
        <button onClick={() => setOpen(true)} className={cn(btn.primary, "relative mt-5 w-full")}><CalendarClock className="h-4 w-4" /> Set schedule</button>
      </div>
      <ScheduleDialog open={open} onOpenChange={setOpen} />
    </Panel>
  );
}

export function ScheduleDialog({ open, onOpenChange, onSaved }: { open: boolean; onOpenChange: (v: boolean) => void; onSaved?: (time: string) => void }) {
  const now = new Date();
  const [date, setDate] = useState(now.toISOString().slice(0, 10));
  const [time, setTime] = useState(now.toTimeString().slice(0, 5));
  const field = "mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-background/50 px-3.5 text-[14px] text-foreground [color-scheme:dark] transition hover:border-white/20 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] rounded-[24px] p-6 [&>button:last-child]:hidden">
        <DialogHeader className="flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-[17px]">Set schedule</DialogTitle>
          <DialogClose className={cn(btn.icon, "h-8 w-8")} aria-label="Close"><X className="h-4 w-4" /></DialogClose>
        </DialogHeader>
        <label className="mt-2 block text-[12.5px] font-medium text-muted-foreground">Start date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={field} />
        </label>
        <label className="block text-[12.5px] font-medium text-muted-foreground">Start time
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={field} />
        </label>
        <button className={cn(btn.primary, "mt-2 w-full")} onClick={() => { onOpenChange(false); onSaved?.(time); toast.success("Schedule saved"); }}>Save</button>
      </DialogContent>
    </Dialog>
  );
}
