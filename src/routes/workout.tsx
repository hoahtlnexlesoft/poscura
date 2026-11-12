import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { useState } from "react";
import { Play, Calendar, Dumbbell, Clock, CheckCircle2, XCircle, AlertTriangle, Eye, ChevronRight } from "lucide-react";
import { WorkoutSession } from "@/components/WorkoutSession";
import { WorkoutAssessment } from "@/components/WorkoutAssessment";
import { WorkoutProgramDetail } from "@/components/WorkoutProgramDetail";
import { ExerciseDetail } from "@/components/ExerciseDetail";

export const Route = createFileRoute("/workout")({
  validateSearch: z.object({ session: z.string().optional() }),
  component: WorkoutPage,
});

type TodayWorkout = {
  name: string; time: string;
  status: "Completed" | "Incompleted";
  tone: "success" | "warning" | "danger";
  message: string;
};

const today: TodayWorkout[] = [
  { name: "Squeeze Blades", time: "05:00AM", status: "Completed", tone: "success", message: "Great job! 1/1 done" },
  { name: "Chest Stretch", time: "05:00AM", status: "Incompleted", tone: "danger", message: "Try your best! 0/1" },
  { name: "Cat Cow", time: "05:00AM", status: "Incompleted", tone: "warning", message: "Nice work! 1/5" },
  { name: "Neck Rotation", time: "05:00AM", status: "Incompleted", tone: "danger", message: "Try your best! 0/1" },
];

type View =
  | { kind: "list" }
  | { kind: "session"; name: string }
  | { kind: "assessment"; name: string; recordedUrl: string | null }
  | { kind: "exercise"; name: string }
  | { kind: "program" };

function WorkoutPage() {
  const { session } = Route.useSearch();
  const [view, setView] = useState<View>(session ? { kind: "session", name: session } : { kind: "list" });

  if (view.kind === "session") return <WorkoutSession workoutName={view.name} onClose={() => setView({ kind: "list" })} onFinish={(url) => setView({ kind: "assessment", name: view.name, recordedUrl: url })} />;
  if (view.kind === "assessment") return <WorkoutAssessment workoutName={view.name} recordedVideoUrl={view.recordedUrl} onClose={() => setView({ kind: "list" })} />;
  if (view.kind === "exercise") return <ExerciseDetail exerciseName={view.name} badge="Completed" onClose={() => setView({ kind: "list" })} />;
  if (view.kind === "program") return <WorkoutProgramDetail onClose={() => setView({ kind: "list" })} onStartSession={(name) => setView({ kind: "session", name })} />;

  return (
    <div className="space-y-4 fold:grid fold:grid-cols-2 fold:gap-4 land:gap-x-6 fold:space-y-0 fold:items-start">
      <div className="fold:col-span-2">
        <h1 className="text-xl font-bold">Workout</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Personalized routines from your posture data.</p>
      </div>

      <section className="glass-card p-4 space-y-3 fold:col-start-1 fold:row-start-2 fold:row-span-2">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Today's Sessions</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-[11px] text-primary">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>Next: <span className="font-semibold">Neck mobility</span> at <span className="font-semibold">05:00 PM</span></span>
        </div>
        <div className="space-y-2">
          {today.map((w) => {
            const isCompleted = w.status === "Completed";
            const toneText = w.tone === "success" ? "text-success" : w.tone === "warning" ? "text-warning" : "text-destructive";
            const ToneIcon = w.tone === "success" ? CheckCircle2 : w.tone === "warning" ? AlertTriangle : XCircle;
            return (
              <div key={w.name} className="rounded-xl bg-card border border-border p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold truncate">{w.name}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${isCompleted ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>{w.status}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">{w.time}</div>
                  <div className={`flex items-center gap-1.5 text-[11px] font-medium ${toneText}`}>
                    <ToneIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{w.message}</span>
                  </div>
                </div>
                <button onClick={() => isCompleted ? setView({ kind: "exercise", name: w.name }) : setView({ kind: "session", name: w.name })}
                  aria-label={isCompleted ? "View" : "Start"}
                  className="h-10 w-10 rounded-full border-2 border-primary text-primary flex items-center justify-center shrink-0">
                  {isCompleted ? <Eye className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="glass-card p-4 fold:col-start-2 fold:row-start-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Current Program</h2>
          </div>
          <button onClick={() => setView({ kind: "program" })} className="text-xs text-primary font-medium flex items-center gap-1">
            Details <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <button onClick={() => setView({ kind: "program" })}
          className="w-full text-left rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold">Shoulder &amp; Neck Relief</h3>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-lg border border-border bg-background p-2">
              <div className="text-muted-foreground">Sessions</div>
              <div className="text-base font-bold mt-0.5">39</div>
            </div>
            <div className="rounded-lg border border-border bg-background p-2">
              <div className="text-muted-foreground">Exercises</div>
              <div className="text-base font-bold mt-0.5">4</div>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1 text-[11px]">
              <span className="font-semibold">40% complete</span>
              <span className="text-muted-foreground">25/50</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: "40%" }} />
            </div>
          </div>
        </button>
      </section>

      <section className="glass-card p-4 fold:col-start-2 fold:row-start-3">
        <div className="flex items-center gap-2 mb-3">
          <Dumbbell className="h-4 w-4 text-secondary" />
          <h2 className="text-sm font-semibold">History</h2>
        </div>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <button key={i} onClick={() => setView({ kind: "program" })}
              className="w-full rounded-xl border border-border bg-card p-3 text-left flex items-center justify-between">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold truncate">Neck Mobility</h3>
                <div className="text-[11px] text-muted-foreground">Ended Sep 5, 2025 · 50%</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
