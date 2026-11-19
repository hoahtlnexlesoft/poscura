import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Check, Play, Users } from "lucide-react";
import { cn } from "@/lib/utils";

/** Score bands from the product spec: ring colour + coaching message. */
export function scoreBand(score: number) {
  if (score >= 90) return { ring: "var(--success)", message: "Excellent form! You followed the guide closely. Keep the same slow, steady pace next time." };
  if (score >= 75) return { ring: "var(--primary)", message: "Good work! A solid result with a little room to improve. A slower pace on the harder steps will help." };
  if (score >= 50) return { ring: "var(--warning)", message: "Nice effort! There's room for improvement. Don't be discouraged: everyone starts somewhere, and showing up is what matters most." };
  return { ring: "var(--destructive)", message: "Every session counts. This one was hard, and that's okay. Take it slowly, one step at a time, and it will get easier." };
}

export function ScoreRing({ score, size = 120, stroke = 9 }: { score: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const { ring } = scoreBand(score);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-white/10" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={ring} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.2,.8,.2,1)" }} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-semibold tabular-nums" style={{ fontSize: size * 0.27 }}>{score}</span>
    </div>
  );
}

type Props = {
  workoutName: string;
  session: number;
  sessions: number;
  score: number;
  next?: { name: string; session: number; sessions: number };
  onEvaluation: () => void;
  onContinue?: () => void;
  onDone: () => void;
};

/** Shown right after Finish: score, coaching line, discomfort check, next session in today's round. */
export function SessionResult({ workoutName, session, sessions, score, next, onEvaluation, onContinue, onDone }: Props) {
  const navigate = useNavigate();
  const [fine, setFine] = useState(false);
  const title = `${workoutName}: session ${session} of ${sessions}`;
  const { message } = scoreBand(score);

  const share = () => {
    try {
      sessionStorage.setItem("community:share", JSON.stringify({ kind: "result", title, score, text: `${title} · ${score} accuracy` }));
    } catch {}
    navigate({ to: "/community" });
  };

  return (
    <div data-screen="Session result" className="mx-auto w-full max-w-[560px] space-y-3 land:max-w-none land:space-y-0 hinge-split land:items-start">
      <section className="relative overflow-hidden rounded-[22px] border border-border bg-[radial-gradient(120%_90%_at_100%_0%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_60%),radial-gradient(90%_80%_at_0%_100%,color-mix(in_oklab,var(--secondary)_16%,transparent),transparent_60%)] bg-card px-5 pb-5 pt-6 text-center">
        <div className="flex justify-center"><ScoreRing score={score} /></div>
        <h1 className="mt-4 text-[19px] font-semibold leading-snug tracking-tight">{title}</h1>
        <p className="mx-auto mt-2 max-w-[340px] text-[13px] leading-relaxed text-muted-foreground">{message}</p>
        <button onClick={onEvaluation}
          className="mt-4 inline-flex h-10 items-center rounded-full border border-border bg-background/60 px-5 text-[13px] font-medium transition hover:border-primary/50 hover:text-primary">
          See step-by-step evaluation
        </button>
      </section>

      <div className="space-y-3">
        <section className="rounded-[18px] border border-border bg-card p-4">
          {fine ? (
            <p className="flex items-center gap-2 text-[13px] text-muted-foreground"><Check className="h-4 w-4 text-success" /> Glad to hear it. Nothing to log.</p>
          ) : (
            <>
              <h2 className="text-[13.5px] font-medium">Did anything hurt during this?</h2>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <button onClick={() => setFine(true)} className="h-11 rounded-full border border-border bg-background text-[13px] font-medium transition hover:border-primary/50">No, I'm fine</button>
                <button onClick={() => navigate({ to: "/discomfort" })} className="h-11 rounded-full bg-gradient-to-r from-primary to-secondary text-[13px] font-semibold text-white transition hover:opacity-95">Yes, log it</button>
              </div>
            </>
          )}
        </section>

        {next && onContinue && (
          <section className="flex items-center gap-3 rounded-[18px] border border-border bg-card p-4">
            <div className="min-w-0 flex-1">
              <div className="truncate text-[11px] text-muted-foreground">Next in this round · session {next.session} of {next.sessions}</div>
              <div className="mt-0.5 truncate text-[15px] font-semibold">{next.name}</div>
            </div>
            <button onClick={onContinue} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-secondary px-4 text-[13px] font-semibold text-white transition hover:opacity-95">
              <Play className="h-3.5 w-3.5 fill-current" /> Continue
            </button>
          </section>
        )}

        <div className={cn("grid grid-cols-[1fr_1.15fr] gap-2.5 pt-1")}>
          <button onClick={share} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-card text-[13.5px] font-medium transition hover:border-primary/50">
            <Users className="h-4 w-4" /> Share
          </button>
          <button onClick={onDone} className="h-12 rounded-full bg-gradient-to-r from-primary to-secondary text-[13.5px] font-semibold text-white shadow-[0_10px_30px_-14px] shadow-primary transition hover:opacity-95">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
