import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { useState } from "react";
import { Play, Calendar, Dumbbell, Clock, CheckCircle2, XCircle, AlertTriangle, Eye, ChevronRight } from "lucide-react";
import { WorkoutSession } from "@/components/WorkoutSession";
import { ExerciseIntro } from "@/components/ExerciseIntro";
import { WorkoutAssessment } from "@/components/WorkoutAssessment";
import { WorkoutProgramDetail } from "@/components/WorkoutProgramDetail";
import { ExerciseDetail } from "@/components/ExerciseDetail";
import { NEXT_WORKOUT, TODAYS_WORKOUTS, TODAY_TIME } from "@/lib/todays-workouts";

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
  | { kind: "intro"; name: string }
  | { kind: "session"; name: string }
  | { kind: "assessment"; name: string; recordedUrl: string | null }
  | { kind: "exercise"; name: string }
  | { kind: "program" };

function WorkoutPage() {
  const { session } = Route.useSearch();
  const [view, setView] = useState<View>(session ? { kind: "intro", name: session } : { kind: "list" });

  if (view.kind === "intro") {
    const w = TODAYS_WORKOUTS.find((x) => x.name === view.name);
    return <ExerciseIntro name={view.name} session={(w?.done ?? 0) + 1} sessions={w?.sessions ?? 1} onBack={() => setView({ kind: "list" })} onStart={() => setView({ kind: "session", name: view.name })} />;
  }
  if (view.kind === "session") {
    const idx = TODAYS_WORKOUTS.findIndex((x) => x.name === view.name);
    const w = TODAYS_WORKOUTS[idx];
    const next = idx >= 0 ? TODAYS_WORKOUTS[idx + 1] : undefined;
    return (
      <WorkoutSession
        workoutName={view.name}
        session={(w?.done ?? 0) + 1}
        sessions={w?.sessions ?? 1}
        onClose={() => setView({ kind: "list" })}
        onFinish={(url) => setView({ kind: "assessment", name: view.name, recordedUrl: url })}
        onNext={next ? () => setView({ kind: "intro", name: next.name }) : undefined}
      />
    );
  }
  if (view.kind === "assessment") return <WorkoutAssessment workoutName={view.name} recordedVideoUrl={view.recordedUrl} onClose={() => setView({ kind: "list" })} />;
  if (view.kind === "exercise") return <ExerciseDetail exerciseName={view.name} badge="Completed" onClose={() => setView({ kind: "list" })} />;
  if (view.kind === "program") return <WorkoutProgramDetail onClose={() => setView({ kind: "list" })} onStartSession={(name) => setView({ kind: "intro", name })} />;

  return (
    <div className="space-y-4 fold:grid fold:grid-cols-2 fold:gap-4 land:gap-x-6 hinge-split fold:space-y-0 fold:items-start">
      <div className="fold:col-span-2">
        <h1 className="text-xl font-bold">Workout</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Personalized routines from your posture data.</p>
      </div>

      <section className="glass-card p-4 space-y-3 fold:col-start-1 fold:row-start-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Today's Sessions</h2>
          </div>
          <div className="flex min-w-0 flex-1 basis-full items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-[11px] text-primary min-[520px]:basis-auto">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Next: <span className="font-semibold">{NEXT_WORKOUT}</span> at <span className="font-semibold">{TODAY_TIME}</span></span>
          </div>
        </div>
        <div className="space-y-2">
          {TODAYS_WORKOUTS.map((w) => {
            const completed = w.done >= w.sessions;
            return (
              <div key={w.name} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold leading-snug">{w.name}</h3>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">Scheduled at {TODAY_TIME}</div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${completed ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                      {completed ? "Completed" : "Incompleted"}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${completed ? "text-success" : "text-destructive"}`}>
                      {completed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                      {completed ? "Great job!" : "Try your best!"} {w.done}/{w.sessions}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => (completed ? setView({ kind: "exercise", name: w.name }) : setView({ kind: "intro", name: w.name }))}
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 text-xs font-semibold transition hover:border-primary/50 hover:text-primary"
                >
                  {completed ? <Eye className="h-3.5 w-3.5" /> : <Play className="h-3 w-3 fill-current" />}
                  {completed ? "View" : "Start"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <div className="space-y-4 fold:col-start-2 fold:row-start-2">
      <section className="glass-card p-4">
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

      <section className="glass-card p-4">
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
    </div>
  );
}
