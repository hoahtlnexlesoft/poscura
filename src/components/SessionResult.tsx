import { useEffect, useId, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Check, ChevronRight, ListChecks, Play, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Score bands from the product spec: ring colour + coaching message. */
export function scoreBand(score: number) {
  if (score >= 90) return { label: "Excellent form", ring: "var(--success)", ring2: "oklch(0.86 0.15 160)", message: "Excellent form! You followed the guide closely. Keep the same slow, steady pace next time." };
  if (score >= 75) return { label: "Good work", ring: "var(--primary)", ring2: "oklch(0.8 0.12 220)", message: "Good work! A solid result with a little room to improve. A slower pace on the harder steps will help." };
  if (score >= 50) return { label: "Nice effort", ring: "var(--warning)", ring2: "oklch(0.86 0.13 90)", message: "Nice effort! There's room for improvement. Don't be discouraged: everyone starts somewhere, and showing up is what matters most." };
  return { label: "Every session counts", ring: "var(--destructive)", ring2: "oklch(0.75 0.15 30)", message: "Every session counts. This one was hard, and that's okay. Take it slowly, one step at a time, and it will get easier." };
}

/** Accuracy ring: band-coloured gradient arc that sweeps in while the number counts up. */
export function ScoreRing({ score, size = 132, stroke = 8, animate = true, label = "Accuracy" }: { score: number; size?: number; stroke?: number; animate?: boolean; label?: string }) {
  const id = useId().replace(/:/g, "");
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const b = scoreBand(score);
  const [shown, setShown] = useState(animate ? 0 : score);
  useEffect(() => {
    if (!animate) return;
    let raf = 0; const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 1100); const e = 1 - Math.pow(1 - k, 3);
      setShown(Math.round(score * e)); if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score, animate]);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {/* soft halo in the band colour */}
      <div aria-hidden className="absolute inset-[18%] rounded-full opacity-30 blur-2xl" style={{ background: b.ring }} />
      <svg width={size} height={size} className="relative -rotate-90">
        <defs>
          <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={b.ring2} />
            <stop offset="1" stopColor={b.ring} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-white/[0.07]" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#g${id})`} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - shown / 100)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-semibold leading-none tracking-tight tabular-nums" style={{ fontSize: size * 0.3 }}>{shown}</span>
        {size >= 110 && <span className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{label}</span>}
      </div>
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

/**
 * Shown right after Finish. One primary action only: Continue to the next exercise when the round has one,
 * otherwise Done. Everything else stays quiet (a list row, ghost chips, an outline button).
 */
export function SessionResult({ workoutName, session, sessions, score, next, onEvaluation, onContinue, onDone }: Props) {
  const navigate = useNavigate();
  const [fine, setFine] = useState(false);
  const band = scoreBand(score);
  const hasNext = !!(next && onContinue);

  const share = () => {
    const title = `${workoutName}: session ${session} of ${sessions}`;
    try { sessionStorage.setItem("community:share", JSON.stringify({ kind: "result", title, score, text: `${title} · ${score} accuracy` })); } catch {}
    navigate({ to: "/community" });
  };

  return (
    <div data-screen="Session result" className="mx-auto w-full max-w-[520px] space-y-3 land:max-w-none land:space-y-0 hinge-split land:items-start">
      {/* ---------- result ---------- */}
      <section className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-card">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-52"
          style={{ background: `radial-gradient(70% 100% at 50% 0%, color-mix(in oklab, ${band.ring} 16%, transparent), transparent 72%)` }} />
        <div className="relative flex flex-col items-center px-6 pb-4 pt-5 text-center">
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Session complete</span>
          <div className="mt-4"><ScoreRing score={score} size={120} /></div>
          <span className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold" style={{ color: band.ring }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: band.ring }} />{band.label}
          </span>
          <h1 className="mt-1.5 text-[20px] font-semibold leading-tight tracking-tight">{workoutName}</h1>
          <span className="mt-1 text-[12.5px] text-muted-foreground">Session {session} of {sessions}</span>
          <p className="mt-2.5 max-w-[330px] text-[13px] leading-relaxed text-muted-foreground/90">{band.message}</p>
        </div>
        <button onClick={onEvaluation}
          className="relative flex w-full items-center gap-3 border-t border-white/[0.06] px-5 py-3 text-left transition hover:bg-white/[0.03]">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05]"><ListChecks className="h-4 w-4 text-primary" /></span>
          <span className="flex-1 text-[13.5px] font-medium">Step-by-step evaluation</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </section>

      <div className="space-y-3">
        {/* ---------- discomfort check ---------- */}
        <section className="flex min-h-[60px] items-center gap-2 rounded-[18px] border border-white/[0.06] bg-card px-4 py-3">
          {fine ? (
            <p className="flex flex-1 items-center gap-2 text-[13px] text-muted-foreground">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success/15"><Check className="h-3 w-3 text-success" /></span>
              Glad to hear it. Nothing to log.
            </p>
          ) : (
            <>
              <span className="flex-1 whitespace-nowrap text-[13.5px] font-medium">Did anything hurt?</span>
              <button onClick={() => setFine(true)} className="h-8 shrink-0 whitespace-nowrap rounded-full px-2.5 text-[12.5px] font-medium text-muted-foreground transition hover:bg-white/[0.05] hover:text-foreground">No, I'm fine</button>
              <button onClick={() => navigate({ to: "/discomfort" })} className="h-8 shrink-0 whitespace-nowrap rounded-full border border-white/10 px-3 text-[12.5px] font-medium transition hover:border-primary/50 hover:text-primary">Yes, log it</button>
            </>
          )}
        </section>

        {/* ---------- next in round ---------- */}
        {hasNext && (
          <section className="rounded-[18px] border border-white/[0.06] bg-card p-4">
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Up next in this round</div>
            <div className="mt-2 truncate text-[15px] font-semibold">{next!.name}</div>
            <div className="mt-0.5 text-[12px] text-muted-foreground">Session {next!.session} of {next!.sessions}</div>
            <button onClick={onContinue}
              className="mt-3.5 flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-primary to-secondary text-[14px] font-semibold text-white shadow-[0_12px_30px_-16px] shadow-primary transition hover:opacity-95 active:scale-[0.99]">
              <Play className="h-3.5 w-3.5 fill-current" /> Continue
            </button>
          </section>
        )}

        {/* ---------- footer ---------- */}
        <div className="flex gap-2.5 pt-0.5">
          <button onClick={share}
            className="flex h-12 items-center justify-center gap-2 rounded-[14px] border border-white/[0.08] px-5 text-[13.5px] font-medium text-foreground/85 transition hover:border-primary/40 hover:text-foreground">
            <Share2 className="h-4 w-4" /> Share
          </button>
          <button onClick={onDone}
            className={cn("h-12 flex-1 rounded-[14px] text-[14px] font-semibold transition active:scale-[0.99]",
              hasNext ? "bg-white/[0.06] text-foreground hover:bg-white/[0.09]" : "bg-gradient-to-r from-primary to-secondary text-white shadow-[0_12px_30px_-16px] shadow-primary hover:opacity-95")}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
