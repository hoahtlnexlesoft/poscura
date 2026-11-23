import { useImmersive } from "@/hooks/useImmersive";
import { ChevronLeft, ChevronRight, Play, Tag, Share2, X, CalendarClock, Check, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ExerciseDetail } from "@/components/ExerciseDetail";

interface ExerciseListItem {
  name: string;
  description: string;
  badge: string;
  sessions: string;
  thumbnailGradient: string;
}

const todaySessions = [
  { name: "Squeeze Blades", status: "Incompleted" as const, scheduledAt: "05:15 AM", sessionLabel: "0/3", progressPct: 0 },
  { name: "Neck Rotation", status: "Incompleted" as const, scheduledAt: "05:15 AM", sessionLabel: "0/1", progressPct: 0 },
  { name: "Cat Cow", status: "Incompleted" as const, scheduledAt: "05:15 AM", sessionLabel: "0/3", progressPct: 0 },
];

const exerciseList: ExerciseListItem[] = [
  { name: "Squeeze Blades", description: "Strengthens muscles between your shoulder blades", badge: "Warm Up", sessions: "5 sessions", thumbnailGradient: "from-amber-400/35 to-orange-500/25" },
  { name: "Neck Rotation", description: "Improves cervical mobility", badge: "Mobility", sessions: "3 sessions", thumbnailGradient: "from-sky-400/35 to-blue-500/25" },
  { name: "Cat Cow", description: "Mobilizes the spine and relieves back tension", badge: "Flexibility", sessions: "4 sessions", thumbnailGradient: "from-emerald-400/35 to-teal-500/25" },
  { name: "Chest Stretch", description: "Opens the chest, counteracts forward posture", badge: "Cool Down", sessions: "2 sessions", thumbnailGradient: "from-rose-400/35 to-pink-500/25" },
];

interface Props {
  onClose: () => void;
  onStartSession: (name: string) => void;
}

const WEEK_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

type SlotStatus = "done" | "missed" | "upcoming";
type Slot = { time: string; status: SlotStatus };

// mock: schedule per weekday index (0=Mon..6=Sun)
const WEEK_SCHEDULE: Record<number, Slot[]> = {
  0: [{ time: "05:00 PM", status: "done" }, { time: "05:30 PM", status: "done" }],
  1: [{ time: "05:00 PM", status: "done" }, { time: "05:30 PM", status: "missed" }, { time: "07:00 PM", status: "done" }],
  2: [],
  3: [{ time: "05:00 PM", status: "upcoming" }],
  4: [{ time: "05:00 PM", status: "upcoming" }, { time: "05:30 PM", status: "upcoming" }],
  5: [{ time: "05:00 PM", status: "upcoming" }, { time: "05:30 PM", status: "upcoming" }, { time: "07:00 PM", status: "upcoming" }],
  6: [],
};

const SLOT_STYLES: Record<SlotStatus, string> = {
  done: "bg-success/12 text-success ring-1 ring-inset ring-success/25",
  missed: "bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/25",
  upcoming: "bg-white/[0.04] text-foreground/75 ring-1 ring-inset ring-white/[0.07]",
};

function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function WorkoutProgramDetail({ onClose, onStartSession }: Props) {
  useImmersive();
  const [tab, setTab] = useState<"today" | "all">("today");
  const [selectedExercise, setSelectedExercise] = useState<ExerciseListItem | null>(null);
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("17:00");

  const saveReschedule = () => {
    if (!startDate) {
      toast.error("Please select a start date");
      return;
    }
    setRescheduleOpen(false);
    toast.success(`Rescheduled to ${startDate} at ${startTime}`);
  };

  const todayDate = new Date();
  const todayWeekStart = startOfWeek(todayDate);
  const isCurrentWeek = todayWeekStart.getTime() === weekStart.getTime();
  const todayDayIndex = (todayDate.getDay() + 6) % 7;
  const monthLabel = `${String(weekStart.getMonth() + 1).padStart(2, "0")}/${weekStart.getFullYear()}`;
  const dayDates: Date[] = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d;
  }), [weekStart]);

  const shiftWeek = (delta: number) => {
    const next = new Date(weekStart); next.setDate(next.getDate() + delta * 7);
    setWeekStart(startOfWeek(next));
  };

  if (selectedExercise) {
    return <ExerciseDetail exerciseName={selectedExercise.name} badge={selectedExercise.badge} onClose={() => setSelectedExercise(null)} />;
  }

  const next = todaySessions[0];
  return (
    <div className="space-y-4 land:grid land:grid-cols-2 hinge-split land:items-start land:gap-x-6 land:gap-y-4 land:space-y-0">
      {/* ---------- header ---------- */}
      <div className="flex items-center gap-3 land:col-span-2">
        <button onClick={onClose} aria-label="Back" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] text-foreground/80 transition hover:border-primary/40 hover:text-foreground">
          <ChevronLeft className="h-[18px] w-[18px]" />
        </button>
        <span className="flex-1 text-[15px] font-semibold">Program</span>
        <button onClick={() => setRescheduleOpen(true)} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/[0.08] px-3.5 text-[12.5px] font-medium text-foreground/85 transition hover:border-primary/40 hover:text-foreground">
          <CalendarClock className="h-4 w-4" /> Reschedule
        </button>
        <button onClick={() => toast.success("Share menu")} aria-label="Share" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] text-foreground/80 transition hover:border-primary/40 hover:text-primary">
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      {/* ---------- left: program hero ---------- */}
      <section className="relative overflow-hidden rounded-[22px] border border-white/[0.06] bg-card land:sticky land:top-[72px]">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(90%_100%_at_0%_0%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_70%),radial-gradient(70%_90%_at_100%_0%,color-mix(in_oklab,var(--secondary)_16%,transparent),transparent_70%)]" />
        <div className="relative p-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-foreground/80 ring-1 ring-inset ring-white/[0.08]">
            <Tag className="h-3 w-3" /> Postural strength
          </span>
          <h1 className="mt-3 text-[22px] font-semibold leading-tight tracking-tight">Shoulder &amp; Neck Relief</h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">A program to relieve tension and improve mobility in the shoulders and neck.</p>

          <div className="mt-5 grid grid-cols-3 divide-x divide-white/[0.06] rounded-[16px] border border-white/[0.06] bg-background/40">
            {[["39", "sessions"], ["4", "exercises"], ["4", "weeks"]].map(([v, l]) => (
              <div key={l} className="px-3 py-3 text-center">
                <div className="text-[20px] font-semibold leading-none tabular-nums">{v}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <div className="flex items-baseline justify-between text-[12px]">
              <span className="text-muted-foreground">Progress</span>
              <span className="tabular-nums"><b className="font-semibold">0</b><span className="text-muted-foreground"> of 40 sessions · 0%</span></span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full w-[2%] rounded-full bg-gradient-to-r from-primary to-secondary" />
            </div>
          </div>
        </div>

        {/* the one primary action: start the next session */}
        <div className="relative flex items-center gap-3 border-t border-white/[0.06] bg-white/[0.02] px-5 py-4">
          <div className="min-w-0 flex-1">
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Up next</div>
            <div className="mt-0.5 truncate text-[14.5px] font-semibold">{next.name} <span className="font-normal text-muted-foreground">· {next.scheduledAt}</span></div>
          </div>
          <button onClick={() => onStartSession(next.name)} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-secondary px-4 text-[13px] font-semibold text-white shadow-[0_10px_26px_-14px] shadow-primary transition hover:brightness-110 active:scale-[0.98]">
            <Play className="h-3.5 w-3.5 fill-current" /> Start
          </button>
        </div>
      </section>

      <div className="space-y-4">
        {/* ---------- sessions ---------- */}
        <section className="rounded-[22px] border border-white/[0.06] bg-card p-4">
          <div className="grid grid-cols-2 rounded-full border border-white/[0.06] bg-white/[0.03] p-1">
            {([["today", "Today"], ["all", "This week"]] as const).map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)}
                className={cn("h-8 rounded-full text-[12.5px] font-medium transition", tab === id ? "bg-white/[0.09] text-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" : "text-muted-foreground hover:text-foreground")}>
                {label}
              </button>
            ))}
          </div>

          {tab === "today" ? (
            <ol className="mt-3 overflow-hidden rounded-[16px] border border-white/[0.06]">
              {todaySessions.map((s, i) => (
                <li key={s.name} className={cn("flex items-center gap-3 px-3.5 py-3", i > 0 && "border-t border-white/[0.05]")}>
                  <div className="w-[58px] shrink-0">
                    <div className="text-[13px] font-semibold tabular-nums">{s.scheduledAt.replace(" AM", "").replace(" PM", "")}</div>
                    <div className="text-[10.5px] text-muted-foreground">{s.scheduledAt.slice(-2)}</div>
                  </div>
                  <span className="h-8 w-px bg-white/[0.07]" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-semibold">{s.name}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-warning" /> Not started · {s.sessionLabel}
                    </div>
                  </div>
                  <button onClick={() => onStartSession(s.name)} aria-label={`Start ${s.name}`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary ring-1 ring-inset ring-primary/25 transition hover:bg-primary hover:text-white">
                    <Play className="h-3.5 w-3.5 translate-x-px fill-current" />
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <button onClick={() => shiftWeek(-1)} aria-label="Previous week" className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground"><ChevronLeft className="h-4 w-4" /></button>
                <div className="text-[12.5px] font-medium tabular-nums">Week of {weekStart.getDate()}/{monthLabel}</div>
                <button onClick={() => shiftWeek(1)} aria-label="Next week" className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground"><ChevronRight className="h-4 w-4" /></button>
              </div>
              <div className="-mx-4 mt-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="grid auto-cols-[minmax(40px,1fr)] grid-flow-col gap-1">
                  {dayDates.map((d, i) => {
                    const isToday = isCurrentWeek && i === todayDayIndex;
                    const slots = WEEK_SCHEDULE[i] ?? [];
                    return (
                      <div key={i} className={cn("flex flex-col items-center gap-1.5 rounded-[14px] px-1 pb-2 pt-2", isToday && "bg-primary/10 ring-1 ring-inset ring-primary/25")}>
                        <span className={cn("text-[10px] font-semibold tracking-wider", isToday ? "text-primary" : "text-muted-foreground")}>{WEEK_DAYS[i]}</span>
                        <span className={cn("text-[15px] font-semibold tabular-nums", !isToday && "text-foreground/85")}>{d.getDate()}</span>
                        <div className="mt-1 flex w-full flex-col gap-1">
                          {slots.length === 0 ? (
                            <div className="flex h-7 items-center justify-center text-[10px] text-muted-foreground/50">Rest</div>
                          ) : (
                            slots.map((sl, idx) => {
                              const clickable = isToday || sl.status === "done" || sl.status === "missed";
                              const handleClick = () => {
                                if (isToday) onStartSession(exerciseList[0].name);
                                else if (sl.status === "done" || sl.status === "missed") setSelectedExercise(exerciseList[0]);
                              };
                              return (
                                <button key={idx} onClick={handleClick} disabled={!clickable}
                                  className={cn("flex h-7 w-full items-center justify-center gap-0.5 rounded-[8px] text-[10px] font-semibold tabular-nums transition", SLOT_STYLES[sl.status], clickable ? "cursor-pointer hover:brightness-125" : "cursor-default")}>
                                  {sl.status === "done" && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                                  {sl.time.replace(" PM", "").replace(" AM", "")}
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" />Done</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive" />Missed</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-white/25" />Upcoming</span>
              </div>
            </div>
          )}
        </section>

        {/* ---------- exercises ---------- */}
        <section className="overflow-hidden rounded-[22px] border border-white/[0.06] bg-card">
          <div className="flex items-baseline gap-2 px-5 pb-2 pt-4">
            <h2 className="text-[14px] font-semibold">Exercises</h2>
            <span className="text-[12px] text-muted-foreground">{exerciseList.length}</span>
          </div>
          {exerciseList.map((e, i) => (
            <button key={e.name} onClick={() => setSelectedExercise(e)}
              className={cn("flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/[0.03]", i > 0 && "border-t border-white/[0.05]")}>
              <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br ring-1 ring-inset ring-white/[0.08]", e.thumbnailGradient)}>
                <Play className="h-4 w-4 translate-x-px fill-white/90 text-white/90" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-semibold">{e.name}</div>
                <div className="mt-1 flex items-center gap-2 text-[11.5px] text-muted-foreground">
                  <span className="shrink-0 rounded-full bg-primary/12 px-2 py-0.5 text-[10.5px] font-semibold text-primary">{e.badge}</span>
                  <span className="inline-flex items-center gap-1 whitespace-nowrap"><Clock3 className="h-3 w-3" />{e.sessions}</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </section>
      </div>

      {rescheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setRescheduleOpen(false)}>
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-center relative pb-4 border-b border-border">
              <h3 className="text-base font-semibold">Set Schedule</h3>
              <button onClick={() => setRescheduleOpen(false)} aria-label="Close"
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
            <button onClick={saveReschedule}
              className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-semibold hover:opacity-90">
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
