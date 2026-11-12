import { useState } from "react";
import { Armchair, ChevronLeft, Play, ShieldCheck, SkipForward, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { guideFor, type Motion } from "@/lib/exercise-guides";

type Tab = "warmUp" | "steps" | "coolDown";
const TABS: { id: Tab; label: string }[] = [
  { id: "warmUp", label: "Warm up" },
  { id: "steps", label: "Steps" },
  { id: "coolDown", label: "Cool down" },
];

/** Short brief shown before a guided session. Start or Skip both open the session. */
export function ExerciseIntro({
  name, session = 1, sessions = 1, onBack, onStart,
}: { name: string; session?: number; sessions?: number; onBack: () => void; onStart: () => void }) {
  const g = guideFor(name);
  const [tab, setTab] = useState<Tab>("steps");
  const items = g[tab];

  return (
    <div className="pb-4">
      <div className="flex items-center gap-2">
        <button onClick={onBack} aria-label="Back" className="flex h-9 w-9 -ml-1.5 items-center justify-center rounded-full hover:bg-muted">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="flex-1" />
        <button
          onClick={onStart}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3.5 text-xs font-semibold text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
        >
          Skip intro <SkipForward className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-2 land:grid land:grid-cols-2 land:items-start land:gap-x-6">
        {/* left: title, demo, numbers */}
        <div className="land:sticky land:top-[72px]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold leading-tight tracking-tight">{name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{g.area} · {g.minutes}</p>
            </div>
            <span className="mt-1 shrink-0 rounded-full bg-muted/60 px-3 py-1 text-xs font-medium">Session {session} of {sessions}</span>
          </div>

          <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-[radial-gradient(60%_70%_at_50%_45%,#11223f,#05080f)]">
            <Figure motion={g.motion} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Animation for now. The demo video is coming.</p>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {[["A day", g.perDay], ["Each session", g.reps], ["Hold", g.hold]].map(([l, v]) => (
              <div key={l} className="rounded-xl bg-muted/40 px-3 py-2.5">
                <div className="text-xs text-muted-foreground">{l}</div>
                <div className="mt-0.5 text-[15px] font-semibold">{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Info icon={<Target className="h-4 w-4" />} label="Goal" value={g.goal} />
            <Info icon={<Armchair className="h-4 w-4" />} label="You need" value={g.need} />
          </div>
        </div>

        {/* right: how to, safety, start */}
        <div className="mt-4 land:mt-0">
          <div className="flex gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "h-9 rounded-full border px-4 text-sm font-medium transition",
                  tab === t.id ? "border-primary/50 bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <ol className="mt-4 space-y-0">
            {items.map((s, i) => (
              <li key={s.title} className="relative flex gap-3.5 pb-4 last:pb-0">
                {i < items.length - 1 && <span aria-hidden className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">{i + 1}</span>
                <div className="pt-0.5">
                  <div className="text-[15px] font-semibold">{s.title}</div>
                  <div className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{s.text}</div>
                </div>
              </li>
            ))}
          </ol>
          {tab === "steps" && <p className="mt-3 text-xs text-muted-foreground">{g.tip}</p>}

          <div className="mt-4 flex gap-2.5 rounded-xl bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            Move slowly and only within a comfortable range. Stop if you feel pain, numbness or dizziness.
          </div>

          <button
            onClick={onStart}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary text-[15px] font-semibold text-white shadow-[0_10px_30px_-12px] shadow-primary transition hover:opacity-95 active:scale-[0.99]"
          >
            <Play className="h-4 w-4 fill-current" /> Start
          </button>
          <p className="mt-2 text-center text-xs text-muted-foreground">Form tracking is simulated in this preview.</p>
        </div>
      </div>
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-2.5 rounded-xl bg-muted/40 px-3 py-2.5">
      <span className="mt-0.5 text-primary">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-[14px] font-medium leading-snug">{value}</div>
      </div>
    </div>
  );
}

/** Simple looping line figure showing the movement. */
function Figure({ motion }: { motion: Motion }) {
  // scale animations pivot on x = 100 by wrapping in translate(100 ·) … translate(-100 ·)
  const headAnim = {
    tilt: <animateTransform attributeName="transform" type="rotate" additive="sum" values="0;-24;0;24;0" dur="5s" repeatCount="indefinite" />,
    nod: <animateTransform attributeName="transform" type="translate" additive="sum" values="0 0;0 5;0 0" dur="2.6s" repeatCount="indefinite" />,
    turn: <animateTransform attributeName="transform" type="scale" additive="sum" values="1 1;0.55 1;1 1;0.55 1;1 1" dur="5s" repeatCount="indefinite" />,
    lookdown: <animateTransform attributeName="transform" type="rotate" additive="sum" values="0;0;20;20;0" keyTimes="0;0.15;0.45;0.8;1" dur="5s" repeatCount="indefinite" />,
    twist: null,
  }[motion];
  return (
    <svg viewBox="0 0 200 125" className="absolute inset-0 h-full w-full" aria-hidden>
      <g stroke="#6fb3ff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* torso + arms */}
        <g transform="translate(100 0)">
          {motion === "twist" && (
            <animateTransform attributeName="transform" type="scale" additive="sum" values="1 1;0.45 1;1 1;0.45 1;1 1" dur="5s" repeatCount="indefinite" />
          )}
          <path transform="translate(-100 0)" d="M100 62 V100 M78 66 H122 M78 66 L74 92 M122 66 L126 92" />
        </g>
        {/* hips + legs on the seat */}
        <path d="M86 100 H114 M86 100 L84 116 M114 100 L116 116" />
        {/* head, pivoting at the base of the neck */}
        <g transform="translate(100 62)">
          {headAnim}
          <g transform="translate(-100 -62)">
            <circle cx="100" cy="46" r="10" />
            <path d="M100 56 V62" />
          </g>
        </g>
      </g>
    </svg>
  );
}
