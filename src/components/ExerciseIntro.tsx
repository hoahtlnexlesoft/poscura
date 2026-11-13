import { useImmersive } from "@/hooks/useImmersive";
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
  useImmersive();
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

      <div className="mt-2 land:grid land:grid-cols-2 hinge-split land:items-start land:gap-x-6">
        {/* left: title, demo, numbers */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold leading-tight tracking-tight">{name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{g.area} · {g.minutes}</p>
            </div>
            <span className="mt-1 shrink-0 rounded-full bg-muted/60 px-3 py-1 text-xs font-medium">Session {session} of {sessions}</span>
          </div>

          <div className="relative mt-4 aspect-[16/10] land:aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-[radial-gradient(60%_70%_at_50%_45%,#11223f,#05080f)]">
            <Figure motion={g.motion} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Preview loop · the full demo video is coming.</p>

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

/** Looping demo of the movement, styled as a video. */
export function Figure({ motion, light = false }: { motion: Motion; light?: boolean }) {
  const D = "5s";
  const head = {
    tilt: <animateTransform attributeName="transform" type="rotate" additive="sum" values="0;-22;0;22;0" dur={D} repeatCount="indefinite" />,
    nod: <animateTransform attributeName="transform" type="translate" additive="sum" values="0 0;0 4;0 0" dur="2.6s" repeatCount="indefinite" />,
    turn: <animateTransform attributeName="transform" type="scale" additive="sum" values="1 1;0.8 1;1 1;0.8 1;1 1" dur={D} repeatCount="indefinite" />,
    lookdown: <animateTransform attributeName="transform" type="translate" additive="sum" values="0 0;0 0;0 9;0 9;0 0" keyTimes="0;0.15;0.45;0.8;1" dur={D} repeatCount="indefinite" />,
    twist: <animateTransform attributeName="transform" type="scale" additive="sum" values="1 1;0.82 1;1 1;0.82 1;1 1" dur={D} repeatCount="indefinite" />,
  }[motion];
  // the face slides sideways when the head turns
  const face = motion === "turn"
    ? <animateTransform attributeName="transform" type="translate" values="0 0;-6 0;0 0;6 0;0 0" dur={D} repeatCount="indefinite" />
    : motion === "lookdown"
      ? <animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 5;0 5;0 0" keyTimes="0;0.15;0.45;0.8;1" dur={D} repeatCount="indefinite" />
      : null;
  return (
    <>
      <svg viewBox={light ? "56 18 88 112" : "0 0 200 125"} preserveAspectRatio={light ? "xMidYMax meet" : "xMidYMid slice"} className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="ei-skin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f0c3a3" /><stop offset="1" stopColor="#c98d6c" /></linearGradient>
          <linearGradient id="ei-tee" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8a4644" /><stop offset="1" stopColor="#4f2526" /></linearGradient>
          <linearGradient id="ei-hair" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7a5640" /><stop offset="1" stopColor="#3e2a1e" /></linearGradient>
        </defs>
        {/* back wall + chair back */}
        {!light && (
          <>
            <rect x="0" y="0" width="200" height="125" fill="#0c1628" />
            <rect x="30" y="18" width="46" height="30" rx="2" fill="#16284a" opacity="0.7" />
            <rect x="132" y="22" width="40" height="22" rx="2" fill="#16284a" opacity="0.5" />
          </>
        )}
        <rect x="64" y="70" width="72" height="60" rx="10" fill={light ? "#2a7fa6" : "#141c2c"} opacity={light ? 0.35 : 1} />
        {/* torso */}
        <g transform="translate(100 0)">
          {motion === "twist" && <animateTransform attributeName="transform" type="scale" additive="sum" values="1 1;0.78 1;1 1;0.78 1;1 1" dur={D} repeatCount="indefinite" />}
          <g transform="translate(-100 0)">
            <path d="M70 86 C70 76 80 72 92 70 L108 70 C120 72 130 76 130 86 L134 128 L66 128 Z" fill="url(#ei-tee)" />
            {motion === "twist" ? (
              <path d="M76 98 C88 106 112 106 124 98" stroke="url(#ei-skin)" strokeWidth="8" strokeLinecap="round" fill="none" />
            ) : (
              <>
                <path d="M70 86 L66 128" stroke="url(#ei-skin)" strokeWidth="8" strokeLinecap="round" />
                <path d="M130 86 L134 128" stroke="url(#ei-skin)" strokeWidth="8" strokeLinecap="round" />
              </>
            )}
          </g>
        </g>
        {/* head pivots at the base of the neck */}
        <g transform="translate(100 72)">
          {head}
          <g transform="translate(-100 -72)">
            <rect x="94" y="56" width="12" height="16" rx="5" fill="#c98d6c" />
            <ellipse cx="85" cy="47" rx="3" ry="5" fill="#d9a07e" />
            <ellipse cx="115" cy="47" rx="3" ry="5" fill="#d9a07e" />
            <ellipse cx="100" cy="45" rx="14" ry="17" fill="url(#ei-skin)" />
            <g>
              {face}
              <ellipse cx="94.5" cy="45" rx="1.6" ry="1.1" fill="#2a1c17" />
              <ellipse cx="105.5" cy="45" rx="1.6" ry="1.1" fill="#2a1c17" />
              <path d="M91.5 41.5 Q94.5 40 97.5 41.5 M102.5 41.5 Q105.5 40 108.5 41.5" stroke="#4a3222" strokeWidth="1.3" fill="none" strokeLinecap="round" />
              <path d="M100 46 L99 51 L101.5 51.5" stroke="#b47a5b" strokeWidth="1" fill="none" strokeLinecap="round" />
              <path d="M96.5 55 Q100 56.5 103.5 55" stroke="#9a5c4c" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </g>
            <path d="M86 42 C85 30 93 25 101 26 C110 26 116 32 114.5 42 C112 36 106 33 100 34 C94 33 89 36 86 42 Z" fill="url(#ei-hair)" />
          </g>
        </g>
      </svg>
      {!light && (<>
      {/* video chrome */}
      <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/80 backdrop-blur">Demo</span>
      <div className="absolute inset-x-3 bottom-3 flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 backdrop-blur"><Play className="ml-px h-3 w-3 fill-white text-white" /></span>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
          <div className="h-full w-full origin-left rounded-full bg-white/85 [animation:ei-progress_5s_linear_infinite]" />
        </div>
        <span className="text-[10.5px] tabular-nums text-white/80">0:05</span>
      </div>
      <style>{"@keyframes ei-progress{from{transform:scaleX(0)}to{transform:scaleX(1)}}"}</style>
      </>)}
    </>
  );
}
