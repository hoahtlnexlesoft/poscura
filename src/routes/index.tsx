import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Play, Clock } from "lucide-react";
import { ScoreGauge } from "@/components/ScoreGauge";
import bodyTorso from "@/assets/body-torso.png";

export const Route = createFileRoute("/")({ component: Dashboard });

const todaysWorkouts = [
  { name: "Squeeze Blades", session: "0/3", time: "05:15 AM" },
  { name: "Neck Rotation", session: "0/1", time: "05:15 AM" },
  { name: "Cat Cow", session: "0/3", time: "05:15 AM" },
];

const progress = [
  { name: "Chin Tucks", done: 2, total: 4 },
  { name: "Shoulder Rolls", done: 3, total: 5 },
  { name: "Wall Angels", done: 2, total: 4 },
];

function Dashboard() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4 fold:grid fold:grid-cols-[1.25fr_1fr] land:grid-cols-2 fold:gap-4 land:gap-x-6 fold:space-y-0 fold:items-start">
      <div className="space-y-4">
      <section className="glass-card p-4">
        <h2 className="text-base font-semibold mb-3">Posture Insights</h2>
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 text-xs leading-relaxed">
          Excellent work! Your latest scan shows perfect alignment. No slouching, pelvic tilt, or forward head posture detected.
        </div>
        <Link to="/posture-monitor" search={{ report: "1" }} className="mt-3 inline-flex items-center gap-1 text-primary text-xs font-medium">
          View session report <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </section>

      <section className="glass-card p-4">
        <h2 className="text-base font-semibold mb-3">Posture Summary</h2>
        <div className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-[10px] text-muted-foreground mb-1">Average score</div>
              <ScoreGauge value={74} size={100} />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground mb-1">Monitoring</div>
              <div className="flex gap-1 tabular-nums">
                <TimeBlock value="22" label="Hrs" />
                <span className="text-base text-muted-foreground self-center">:</span>
                <TimeBlock value="08" label="Min" />
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative w-full max-w-[180px]">
              <img src={bodyTorso} alt="Body" className="w-full h-auto select-none pointer-events-none" draggable={false} />
              <button type="button" aria-label="Head" onClick={() => navigate({ to: "/body-part/$part", params: { part: "head" } })}
                className="absolute top-[2%] left-[32%] w-[36%] h-[28%] rounded-full hover:bg-foreground/5" />
              <button type="button" aria-label="Shoulders" onClick={() => navigate({ to: "/body-part/$part", params: { part: "shoulders" } })}
                className="absolute top-[30%] left-[6%] w-[88%] h-[20%] rounded-2xl hover:bg-foreground/5" />
              <button type="button" aria-label="Spine" onClick={() => navigate({ to: "/body-part/$part", params: { part: "spine" } })}
                className="absolute top-[50%] left-[36%] w-[28%] h-[40%] rounded-2xl hover:bg-foreground/5" />
            </div>
          </div>
          <div className="flex justify-center gap-3 text-[10px]">
            {[
              { color: "bg-success", label: "Good" },
              { color: "bg-sky-500", label: "Mild" },
              { color: "bg-warning", label: "Moderate" },
              { color: "bg-destructive", label: "Severe" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${l.color}`} /><span>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      </div>

      <div className="space-y-4">
      <section className="glass-card p-4">
        <h2 className="text-base font-semibold mb-3">Today's Sessions</h2>
        <div className="rounded-xl bg-primary/10 border border-primary/30 p-3 mb-3">
          <div className="flex items-center gap-2 text-primary text-xs font-medium">
            <Clock className="h-3.5 w-3.5" /> Upcoming: Neck mobility
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Starts at 05:00 PM</div>
        </div>
        <div className="space-y-2">
          {todaysWorkouts.map((w) => (
            <div key={w.name} className="flex items-center gap-2 p-2.5 rounded-xl bg-card border border-border">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{w.name}</div>
                <div className="text-[10px] text-muted-foreground">Session {w.session} · {w.time}</div>
              </div>
              <button className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30">
                <Play className="h-3.5 w-3.5 fill-current" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-card p-4">
        <h2 className="text-base font-semibold mb-3">Workout Progress</h2>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-bold">8</span>
          <span className="text-xs text-muted-foreground">/16 sessions · 50%</span>
        </div>
        <div className="space-y-2 mt-3">
          {progress.map((p) => (
            <div key={p.name}>
              <div className="flex justify-between text-[11px] mb-1">
                <span>{p.name}</span>
                <span className="text-muted-foreground">{p.done}/{p.total}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${(p.done / p.total) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <Link to="/workout" className="mt-3 flex items-center justify-center gap-1 text-primary text-xs font-medium">
          View workout plan <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </section>
      </div>
    </div>
  );
}

function TimeBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="px-2 py-1 rounded-md border border-primary/30 bg-primary/5 text-lg font-bold">{value}</div>
      <div className="text-[9px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}
