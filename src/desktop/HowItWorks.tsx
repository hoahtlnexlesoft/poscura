import { useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { ArrowLeft, Check, RefreshCw, AlertTriangle, TrendingUp, Play, Square, Dumbbell, Target, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { btn, Page } from "./ui";
import { SegGauge } from "./SegGauge";
import { Bust } from "./Bust";

/** "How Poscura Works" — the app's 6-step walkthrough, same copy, redrawn illustrations */
const STEPS: { title: string; body: ReactNode; art: () => ReactNode }[] = [
  {
    title: "Real-Time Monitoring & Discomfort Tracking",
    body: "Poscura continuously monitors your body alignment as you work, instantly spotting fatigue and poor sitting habits. By syncing this data with your personal discomfort log, our AI pinpoints the exact source of your tension and recommends targeted stretches for immediate relief.",
    art: () => <ArtMonitor />,
  },
  {
    title: "AI Analysis & Risk Assessment",
    body: (
      <>
        The AI tracks your body alignment to identify slouching patterns, highlight areas of tension, and suggest a clear plan for better posture:
        <ul className="mt-3 space-y-1.5">
          {["Posture Analysis", "Risk Assessment Highlights", "Smart Guidance", "Personalized Workout Program"].map((x) => (
            <li key={x} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" />{x}</li>
          ))}
        </ul>
      </>
    ),
    art: () => <ArtRisk />,
  },
  {
    title: "Recommended Workout & Plan",
    body: "Based on your data, the AI builds a custom recovery roadmap. This plan is specifically designed to address your tension points and strengthen the muscles needed to maintain better posture naturally.",
    art: () => <ArtPlan />,
  },
  {
    title: "Execute Your Personalized Workout",
    body: (
      <>
        Follow a recovery schedule built around your daily goals. Each session features high-quality video tutorials, step-by-step coaching, and interactive progress checks.
        <br />Stay motivated: hit milestones, and track your consistency as you transform your habits.
      </>
    ),
    art: () => <ArtExecute />,
  },
  {
    title: "Track Progress & Improvement",
    body: "Monitor your performance, unlock milestones, and stay motivated as you improve. Recheck your posture after each workout cycle to track alignment, comfort, and score improvements.",
    art: () => <ArtProgress />,
  },
  {
    title: "Continue Posture Monitoring & Manage Improvement",
    body: "The journey doesn't stop once you feel better. The AI evolves with you, generating advanced plans to further refine your posture and core strength, ensuring your body stays resilient and pain-free long-term.",
    art: () => <ArtContinue />,
  },
];

export function HowItWorks() {
  const [i, setI] = useState(0);
  const navigate = useNavigate();
  const last = i === STEPS.length - 1;
  const s = STEPS[i];
  return (
    <Page className="flex min-h-[calc(100dvh-140px)] flex-col">
      <Stepper i={i} onGo={setI} />
      <div key={i} className="mt-8 grid flex-1 grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] items-center gap-10 animate-in fade-in slide-in-from-right-2 duration-300">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primary">Step {i + 1} of {STEPS.length}</div>
          <h1 className="mt-3 text-[30px] font-semibold leading-tight tracking-tight">{s.title}</h1>
          <div className="mt-4 text-[14.5px] leading-relaxed text-muted-foreground">{s.body}</div>
        </div>
        <div className="relative flex min-h-[420px] items-center justify-center rounded-[28px] border border-white/[0.06] bg-[radial-gradient(70%_70%_at_50%_45%,rgba(59,139,255,0.12),transparent_70%),linear-gradient(180deg,#0d1422,#080c14)] p-8">
          {/* illustrations are drawn at 540px and scaled to the panel */}
          <div className="[zoom:.74] min-[1440px]:[zoom:.9] min-[1640px]:[zoom:1]">{s.art()}</div>
        </div>
      </div>
      <div className="mt-8 flex items-center justify-between border-t border-white/[0.06] pt-6">
        <button onClick={() => navigate({ to: "/" })} className={btn.ghost}>Skip for now</button>
        <div className="flex items-center gap-3">
          {i > 0 && <button onClick={() => setI(i - 1)} aria-label="Previous step" className={cn(btn.icon, "h-11 w-11")}><ArrowLeft className="h-4 w-4" /></button>}
          <button onClick={() => (last ? navigate({ to: "/" }) : setI(i + 1))} className={cn(btn.primary, "min-w-[140px]")}>{last ? "Finish" : "Next"}</button>
        </div>
      </div>
    </Page>
  );
}

function Stepper({ i, onGo }: { i: number; onGo: (n: number) => void }) {
  return (
    <ol className="mx-auto flex items-center">
      {STEPS.map((_, n) => {
        const done = n < i, on = n === i, lastDot = n === STEPS.length - 1;
        return (
          <li key={n} className="flex items-center">
            <button onClick={() => onGo(n)} aria-label={`Step ${n + 1}`} aria-current={on ? "step" : undefined}
              className={cn("flex h-8 w-8 items-center justify-center rounded-full text-[12.5px] font-semibold tabular-nums transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                on ? "bg-primary text-white shadow-[0_0_0_5px_color-mix(in_oklab,var(--color-primary)_20%,transparent)]"
                  : done ? "bg-primary/15 text-primary hover:bg-primary/25"
                  : "bg-white/[0.05] text-muted-foreground ring-1 ring-inset ring-white/10 hover:text-foreground")}>
              {lastDot ? <RefreshCw className="h-3.5 w-3.5" /> : done ? <Check className="h-3.5 w-3.5" /> : n + 1}
            </button>
            {n < STEPS.length - 1 && <span className={cn("mx-1.5 h-[2px] w-12 rounded-full", n < i ? "bg-primary/60" : "bg-white/[0.08]")} />}
          </li>
        );
      })}
    </ol>
  );
}

/* ---------- illustrations: built from the app's own UI pieces ---------- */
const Card = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div className={cn("rounded-2xl border border-white/[0.08] bg-[#111a2b]/95 p-4 shadow-[0_24px_60px_-20px_rgba(0,0,0,.8)] backdrop-blur", className)}>{children}</div>
);
const Alert = ({ tone, title, text, className }: { tone: "red" | "amber" | "green"; title: string; text: string; className?: string }) => {
  const c = { red: "border-destructive/30 bg-destructive/[0.10] text-destructive", amber: "border-warning/30 bg-warning/[0.08] text-warning", green: "border-success/30 bg-success/[0.08] text-success" }[tone];
  return (
    <div className={cn("w-[260px] rounded-xl border p-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,.8)]", c, className)}>
      <div className="flex items-center gap-1.5 text-[12px] font-semibold">{tone === "green" ? <TrendingUp className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}{title}</div>
      <p className="mt-1 text-[11px] leading-snug text-foreground/75">{text}</p>
    </div>
  );
};
function LiveTile({ className }: { className?: string }) {
  return (
    <Card className={cn("w-[300px] p-0 overflow-hidden", className)}>
      <div className="relative h-[190px] bg-[linear-gradient(160deg,#2a3346,#151b27)]">
        <svg viewBox="0 0 300 190" className="absolute inset-0 h-full w-full" aria-hidden>
          <circle cx="150" cy="64" r="26" fill="#3a465d" /><path d="M96 190 C 100 130 120 104 150 102 C 180 104 200 130 204 190 Z" fill="#3a465d" />
          <line x1="150" y1="98" x2="176" y2="60" stroke="#ef4444" strokeWidth="2.5" /><circle cx="176" cy="60" r="4" fill="#fff" /><circle cx="150" cy="98" r="4" fill="#fff" />
          <text x="182" y="58" fill="#fff" fontSize="10">Tragus</text><text x="156" y="112" fill="#fff" fontSize="10">C7</text>
        </svg>
        <div className="absolute right-2 top-2 space-y-1 text-[10px]">
          {[["Head & Neck", "bg-destructive"], ["Spine & Torso", "bg-success"], ["Shoulder & Upper back", "bg-success"], ["Pelvis & Lower back", "bg-success"]].map(([l, c]) => (
            <div key={l} className="flex items-center gap-1.5 rounded-md bg-black/55 px-2 py-1"><span className={cn("h-1.5 w-1.5 rounded-full", c)} />{l}</div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <SegGauge value={74} size={64} />
        <span className="inline-flex items-center gap-1 rounded-full bg-destructive px-3 py-1 text-[11px] font-semibold text-white"><Square className="h-2.5 w-2.5 fill-current" /> Stop</span>
        <span className="text-right text-[10px] text-muted-foreground">Time left<div className="text-[15px] font-semibold tabular-nums text-foreground">19:15</div></span>
      </div>
    </Card>
  );
}
function ArtMonitor() {
  return (
    <div className="relative h-[360px] w-[520px]">
      <LiveTile className="absolute right-4 top-6" />
      <Card className="absolute left-4 top-14 w-[190px]">
        <div className="text-[11px] leading-snug text-primary">Tap the areas where you feel pain or discomfort during the day.</div>
        <div className="mt-3 flex justify-center">
          <svg viewBox="0 0 80 170" className="h-[170px]" aria-hidden>
            <circle cx="40" cy="16" r="11" fill="#2f63d9" /><rect x="22" y="30" width="36" height="58" rx="10" fill="#2f63d9" />
            <rect x="22" y="30" width="18" height="22" rx="6" fill="#ef4444" /><rect x="36" y="34" width="8" height="54" fill="#f5a524" />
            <rect x="8" y="34" width="12" height="52" rx="6" fill="#2f63d9" /><rect x="60" y="34" width="12" height="52" rx="6" fill="#2f63d9" />
            <rect x="24" y="90" width="14" height="74" rx="7" fill="#2f63d9" /><rect x="42" y="90" width="14" height="74" rx="7" fill="#2f63d9" />
          </svg>
        </div>
      </Card>
    </div>
  );
}
function ArtRisk() {
  return (
    <div className="relative h-[380px] w-[540px]">
      <LiveTile className="absolute right-0 top-0 scale-[.85] origin-top-right" />
      <Alert tone="green" title="Biggest Improvement" text="Lumbar Spine Angle improved by 7° since your last session. Your core strengthening exercises are paying off!" className="absolute left-0 top-4" />
      <Alert tone="amber" title="Repeated Issues" text="Pelvic & Lower Back — Pelvic tilt has increased since the last monitoring session, rising from 10° to 15°." className="absolute left-14 top-[124px]" />
      <Alert tone="red" title="New Risk Detected" text="Head & Neck — Extended forward or side head tilt can strain neck muscles and may contribute to neck or spine curvature." className="absolute left-0 top-[236px]" />
      <Alert tone="amber" title="Worsening Issue" text="Pelvic & Lower Back — This increase places added stress on the lower back and should be prioritized in your plan." className="absolute -right-2 bottom-[-20px]" />
    </div>
  );
}
function ArtPlan() {
  return (
    <div className="relative h-[380px] w-[520px]">
      <Card className="absolute left-10 top-0 w-[260px]">
        <div className="flex items-center justify-between"><span className="text-[13px] font-semibold">Squeeze Blades</span><span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">Warm up</span></div>
        <div className="mt-3 rounded-xl bg-white/[0.03] p-3 text-center"><div className="text-[11px] text-muted-foreground">Accuracy Average</div><SegGauge value={60} size={110} className="mt-2" /></div>
        <div className="mt-3 rounded-xl bg-white/[0.03] p-3"><div className="text-[11px] text-muted-foreground">Today's Sessions</div><div className="mt-1 text-[12.5px] font-semibold">Chest Stretch</div><div className="text-[10.5px] text-destructive">Incompleted</div></div>
        <div className="mt-3 space-y-1.5 text-[11px]">
          {[["Overall", "text-primary"], ["Key Improvement", "text-success"], ["Advice", "text-warning"]].map(([l, c]) => <div key={l} className={cn("rounded-lg bg-white/[0.03] px-2.5 py-1.5", c)}>{l}</div>)}
        </div>
      </Card>
      <LiveTile className="absolute right-0 bottom-0 scale-[.8] origin-bottom-right" />
    </div>
  );
}
function ArtExecute() {
  return (
    <div className="relative h-[380px] w-[520px]">
      <Card className="absolute left-14 top-0 w-[300px] p-0 overflow-hidden">
        <div className="relative flex h-[150px] items-center justify-center bg-[linear-gradient(160deg,#3b4a63,#1b2333)]">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur"><Play className="ml-0.5 h-5 w-5 fill-white text-white" /></span>
          <div className="absolute inset-x-3 bottom-2 flex items-center gap-2 text-[10px] text-white/80">33:00 | 45:00<span className="h-1 flex-1 rounded-full bg-white/20"><span className="block h-full w-3/4 rounded-full bg-primary" /></span></div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2 text-center text-[10.5px]">
            {[["Every", "1 day(s)"], ["Per day", "3 time"], ["Repeat", "4 hr"]].map(([a, b]) => <div key={a} className="rounded-lg bg-white/[0.03] py-1.5"><div className="text-muted-foreground">{a}</div><div className="font-semibold">{b}</div></div>)}
          </div>
          <ol className="mt-3 space-y-1.5 text-[11.5px]">
            {["Setup Position Start", "Chin Tuck 1", "Back To Setup Position Start", "Chin Tuck 2", "Setup Position End"].map((x, n) => (
              <li key={x} className="flex items-center gap-2"><span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[9.5px] font-semibold", n === 0 ? "bg-primary text-white" : n === 4 ? "bg-success text-white" : "border border-primary text-primary")}>{n === 4 ? "End" : n + 1}</span>{x}</li>
            ))}
          </ol>
        </div>
      </Card>
      <Card className="absolute right-6 top-10 w-[130px] text-center"><Target className="mx-auto h-8 w-8 text-primary" /><div className="mt-2 text-[12px] font-semibold">Exercise Goal</div></Card>
      <Card className="absolute bottom-2 -left-16 w-[130px] text-center"><Dumbbell className="mx-auto h-8 w-8 text-secondary" /><div className="mt-2 text-[12px] font-semibold">Necessary Equipment</div></Card>
    </div>
  );
}
function ArtProgress() {
  return (
    <div className="relative h-[380px] w-[520px]">
      <Card className="absolute left-6 top-6 w-[270px]">
        <div className="text-[13px] font-semibold">Today's Sessions</div>
        <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-primary/12 px-2.5 py-2 text-[10.5px] text-primary"><CalendarClock className="h-3.5 w-3.5" /> Next workout: Neck mobility routine · 05:00 PM</div>
        <ul className="mt-2 space-y-1.5 text-[11.5px]">
          {[["Squeeze Blades", "Completed", "text-success"], ["Chest Stretch", "Incompleted", "text-destructive"], ["Cat Cow", "Incompleted", "text-destructive"], ["Chin Tuck with Resistance", "Incompleted", "text-destructive"]].map(([n, st, c]) => (
            <li key={n} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-2.5 py-2"><span className="truncate">{n}</span><span className={cn("text-[10px] font-semibold", c)}>{st}</span></li>
          ))}
        </ul>
      </Card>
      <Card className="absolute right-0 top-0 w-[240px]">
        <div className="text-[13px] font-semibold">Shoulder &amp; Neck Relief</div>
        <div className="text-[10.5px] text-muted-foreground">Postural strength</div>
        <div className="mt-2 grid grid-cols-3 gap-1.5 text-center text-[10px]">{[["Total", "39"], ["Exercises", "4"], ["Duration", "10 min"]].map(([a, b]) => <div key={a} className="rounded-lg bg-white/[0.03] py-1.5"><div className="text-muted-foreground">{a}</div><div className="font-semibold">{b}</div></div>)}</div>
      </Card>
      <Card className="absolute bottom-4 right-4 w-[250px]">
        <div className="flex justify-between text-[13px] font-semibold">Current Program<span className="text-[11px] text-primary">Details ›</span></div>
        <div className="mt-2 flex justify-between text-[11px] text-muted-foreground"><span>40% complete</span><span>25/50</span></div>
        <div className="mt-1.5 h-1.5 rounded-full bg-white/[0.07]"><div className="h-full w-2/5 rounded-full bg-gradient-to-r from-primary to-secondary" /></div>
      </Card>
    </div>
  );
}
function ArtContinue() {
  return (
    <div className="relative h-[400px] w-[540px]">
      <div className="absolute left-1/2 top-0 flex -translate-x-1/2 gap-2">
        {[["Repeated Issues", "text-warning border-warning/40"], ["New Risk Detected", "text-destructive border-destructive/40"], ["Worsening Issue", "text-warning border-warning/40"]].map(([l, c]) => (
          <span key={l} className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full border bg-black/30 px-2.5 py-1 text-[11px] font-semibold", c)}><AlertTriangle className="h-3 w-3" />{l}</span>
        ))}
      </div>
      <Card className="absolute -left-10 top-16 w-[200px]">
        <div className="text-[11px] text-muted-foreground">Aug 13, 2025 · 03:50 PM</div>
        <div className="mt-2 flex justify-center"><SegGauge value={74} size={120} /></div>
        <div className="mt-1 text-center text-[11px] text-success">▲ 15% from last session</div>
        <div className="mt-3 flex h-1.5 gap-0.5">{[["65%", "bg-success"], ["15%", "bg-[#3b8bff]"], ["10%", "bg-warning"], ["10%", "bg-destructive"]].map(([w, c]) => <span key={c} className={cn("rounded-full", c)} style={{ width: w }} />)}</div>
      </Card>
      <div className="absolute -right-16 top-12 origin-top-right scale-[.85]"><Bust head="significant" shoulders="balanced" spine="moderate" /></div>
    </div>
  );
}
