import { ChevronLeft, ChevronRight, Play, Tag, Share2, X } from "lucide-react";
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
  { name: "Squeeze Blades", description: "Strengthens muscles between your shoulder blades", badge: "Warm Up", sessions: "5 sessions", thumbnailGradient: "from-amber-200 to-orange-300" },
  { name: "Neck Rotation", description: "Improves cervical mobility", badge: "Mobility", sessions: "3 sessions", thumbnailGradient: "from-sky-200 to-blue-300" },
  { name: "Cat Cow", description: "Mobilizes the spine and relieves back tension", badge: "Flexibility", sessions: "4 sessions", thumbnailGradient: "from-emerald-200 to-teal-300" },
  { name: "Chest Stretch", description: "Opens the chest, counteracts forward posture", badge: "Cool Down", sessions: "2 sessions", thumbnailGradient: "from-rose-200 to-pink-300" },
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
  done: "border-success/40 bg-success/10 text-success",
  missed: "border-destructive/40 bg-destructive/10 text-destructive",
  upcoming: "border-border bg-card text-foreground/80",
};

function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function WorkoutProgramDetail({ onClose, onStartSession }: Props) {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <ChevronLeft className="h-4 w-4" /> Workout
        </button>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-medium">
            Cancel
          </button>
          <button onClick={() => setRescheduleOpen(true)} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium">
            Reschedule
          </button>
        </div>
      </div>

      <section className="glass-card p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-lg font-bold">Shoulder &amp; Neck Relief</h1>
            <button onClick={() => toast.success("Share menu")} className="h-8 w-8 rounded-lg border border-border flex items-center justify-center">
              <Share2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[11px] text-foreground/80">
            <Tag className="h-3 w-3" /> Postural strength
          </span>
          <p className="text-xs text-foreground/80">A program to relieve tension and improve mobility in the shoulders and neck.</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1 text-xs">
            <span className="font-semibold">Progress</span>
            <span className="text-muted-foreground">0/40 sessions</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: "0%" }} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-border bg-card p-2">
            <div className="text-[10px] text-muted-foreground">Total</div>
            <div><span className="text-lg font-bold">39</span><span className="text-[10px] text-muted-foreground"> sessions</span></div>
          </div>
          <div className="rounded-xl border border-border bg-card p-2">
            <div className="text-[10px] text-muted-foreground">Exercises</div>
            <div><span className="text-lg font-bold">4</span></div>
          </div>
          <div className="rounded-xl border border-border bg-card p-2">
            <div className="text-[10px] text-muted-foreground">Duration</div>
            <div><span className="text-lg font-bold">4</span><span className="text-[10px] text-muted-foreground"> wks</span></div>
          </div>
        </div>
      </section>

      <section className="glass-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setTab("today")}
            className={`px-4 py-1.5 rounded-full border text-xs font-medium ${tab === "today" ? "border-primary text-primary bg-primary/5" : "border-border"}`}>Today's Sessions</button>
          <button onClick={() => setTab("all")}
            className={`px-4 py-1.5 rounded-full border text-xs font-medium ${tab === "all" ? "border-primary text-primary bg-primary/5" : "border-border"}`}>All Sessions</button>
        </div>

        {tab === "today" ? (
          <div className="space-y-2">
            {todaySessions.map((s) => (
              <div key={s.name} className="rounded-xl border border-border bg-card p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm">{s.name}</h3>
                  <span className="inline-block text-[10px] px-1.5 py-0.5 rounded-md bg-destructive/15 text-destructive font-medium mt-0.5">{s.status}</span>
                  <div className="text-[11px] text-muted-foreground">{s.scheduledAt}</div>
                </div>
                <button onClick={() => onStartSession(s.name)} className="h-9 w-9 rounded-full border-2 border-primary text-primary flex items-center justify-center shrink-0">
                  <Play className="h-3.5 w-3.5 fill-current" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 -mx-4">
            <div className="flex items-center justify-between px-4">
              <button onClick={() => shiftWeek(-1)} className="p-1.5 rounded-md text-muted-foreground"><ChevronLeft className="h-4 w-4" /></button>
              <div className="text-xs font-medium">{monthLabel}</div>
              <button onClick={() => shiftWeek(1)} className="p-1.5 rounded-md text-muted-foreground"><ChevronRight className="h-4 w-4" /></button>
            </div>
            <div className="overflow-x-auto px-4 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
              <div className="grid grid-flow-col auto-cols-[64px] gap-2">
                {dayDates.map((d, i) => {
                  const isToday = isCurrentWeek && i === todayDayIndex;
                  const slots = WEEK_SCHEDULE[i] ?? [];
                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <span className={`text-[10px] font-semibold uppercase ${isToday ? "text-primary" : "text-muted-foreground"}`}>{WEEK_DAYS[i]}</span>
                      <span className={`h-7 w-7 flex items-center justify-center rounded-full text-sm ${isToday ? "bg-primary text-primary-foreground font-semibold" : "text-foreground/80"}`}>
                        {d.getDate()}
                      </span>
                      <div className="w-full flex flex-col gap-1.5 pt-1">
                        {slots.length === 0 ? (
                          <div className="h-7 w-full rounded-md border border-dashed border-border/60" />
                        ) : (
                          slots.map((s, idx) => {
                            const clickable = isToday || s.status === "done" || s.status === "missed";
                            const handleClick = () => {
                              if (isToday) onStartSession(exerciseList[0].name);
                              else if (s.status === "done" || s.status === "missed") setSelectedExercise(exerciseList[0]);
                            };
                            return (
                              <button
                                key={idx}
                                onClick={handleClick}
                                disabled={!clickable}
                                className={`h-7 w-full rounded-md border text-[10px] font-medium flex items-center justify-center ${SLOT_STYLES[s.status]} ${clickable ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
                              >
                                {s.time}
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
          </div>
        )}
      </section>

      <section className="glass-card p-4 space-y-3">
        <h2 className="text-base font-semibold">Exercise List</h2>
        <div className="space-y-2">
          {exerciseList.map((e) => (
            <button key={e.name} onClick={() => setSelectedExercise(e)}
              className="w-full text-left rounded-xl border border-border bg-card p-2 flex gap-3 items-center">
              <div className={`h-14 w-16 rounded-lg bg-gradient-to-br ${e.thumbnailGradient} flex items-center justify-center shrink-0`}>
                <Play className="h-4 w-4 text-white fill-current" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">{e.name}</h3>
                <p className="text-[11px] text-muted-foreground line-clamp-1">{e.description}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary text-primary-foreground font-medium">{e.badge}</span>
                  <span className="text-[10px] text-muted-foreground">{e.sessions}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

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
