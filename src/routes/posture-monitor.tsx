import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Play, Camera, Activity, Settings, RotateCw } from "lucide-react";
import { ScoreGauge } from "@/components/ScoreGauge";
import { DiscomfortDialog } from "@/components/DiscomfortDialog";
import { SessionReport } from "@/components/SessionReport";
import { MonitoringTimeLeft } from "@/components/MonitoringTimeLeft";
import { CameraSettingDialog } from "@/components/CameraSettingDialog";
import { LivePostureView } from "@/components/LivePostureView";
import { useFitFrame } from "@/hooks/useFitFrame";

export const Route = createFileRoute("/posture-monitor")({
  validateSearch: (search: Record<string, unknown>) => ({
    report: typeof search.report === "string" ? search.report : undefined,
  }),
  component: PostureMonitor,
});

const SESSION_SECONDS = 40 * 60;

function PostureMonitor() {
  const search = Route.useSearch() as { report?: string };
  const [running, setRunning] = useState(false);
  const startFooter = useRef<HTMLDivElement>(null);
  const [reloading, setReloading] = useState(false);
  const reloadHistory = () => {
    setReloading(true);
    window.setTimeout(() => setReloading(false), 900);
  };
  const startFit = useFitFrame(startFooter);
  const [remaining, setRemaining] = useState(SESSION_SECONDS);
  const [showDiscomfort, setShowDiscomfort] = useState(false);
  const [showReport, setShowReport] = useState(search.report === "1");
  const [showCameraSetting, setShowCameraSetting] = useState(false);
  const [cameraSource, setCameraSource] = useState("Camera Setting");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) { handleStop(); return 0; }
          return r - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const handleStart = () => { setRemaining(SESSION_SECONDS); setRunning(true); };
  const handleStop = () => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setShowDiscomfort(true);
  };
  const handleDone = () => { setShowDiscomfort(false); setShowReport(true); };

  if (showReport) return <SessionReport onClose={() => setShowReport(false)} />;

  const mm = String(Math.floor((remaining % 3600) / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  const history = [
    { date: "Aug 13, 2025", duration: 20, score: 74 },
    { date: "Aug 12, 2025", duration: 35, score: 81 },
    { date: "Aug 11, 2025", duration: 42, score: 88 },
  ];

  return (
    <div data-fit-bound className="space-y-4 fold:grid fold:grid-cols-[auto_minmax(0,1fr)] fold:grid-rows-[auto_1fr] fold:gap-5 fold:space-y-0 fold:items-stretch">
      <div className="fold:col-start-2 fold:row-start-1 fold:self-start"><MonitoringTimeLeft /></div>


      <section className="rounded-2xl border border-border bg-gradient-to-br from-card via-background to-background overflow-hidden fold:col-start-1 fold:row-start-1 fold:row-span-2 fold:w-fit fold:self-start rail:mx-auto rail:w-fit fold:mx-0!">
        {!running ? (
          <>
          <div ref={startFit.wrapRef} className="flex justify-center bg-[radial-gradient(120%_70%_at_50%_45%,color-mix(in_oklab,var(--color-primary)_7%,transparent),transparent_70%)]">
          <div
            className="@container relative aspect-[9/16] max-w-full flex flex-col items-center justify-center gap-3 px-4 text-center bg-gradient-to-b from-card/80 via-background/60 to-background/60 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
            style={startFit.box ? { width: startFit.box.w, height: startFit.box.h } : { width: "min(100%, calc(max(320px, 100dvh - 250px) * 9 / 16))" }}
          >
            <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
              <button
                onClick={() => setShowCameraSetting(true)}
                aria-label="Camera setting"
                className="inline-flex min-w-0 items-center gap-1 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm border border-border text-[10px] text-muted-foreground"
              >
                <Settings className="h-3 w-3 shrink-0" /> <span className="truncate @max-[300px]:hidden!">{cameraSource}</span>
              </button>
              <button className="inline-flex shrink-0 items-center gap-1 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm border border-border text-[10px] text-muted-foreground">
                Setup Guide
              </button>
            </div>
            <Camera className="h-12 w-12 text-muted-foreground/40" strokeWidth={1.5} />
            <div className="max-w-[220px] text-sm text-muted-foreground @max-[240px]:text-[12.5px]!">Camera feed will appear here</div>
            <button onClick={handleStart}
              className="mt-2 h-11 shrink-0 whitespace-nowrap px-5 @max-[240px]:h-10! @max-[240px]:px-4! @max-[240px]:text-[13px]! @max-[240px]:gap-1.5! rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold text-sm flex items-center gap-2 shadow-lg glow-primary">
              <Play className="h-4 w-4 fill-current" /> Start monitoring
            </button>
          </div>
          </div>
          {/* same height as the live status bar, so starting doesn't resize the 9:16 frame */}
          <div ref={startFooter} className="@container border-t border-white/[0.06]">
            <div className="grid h-[76px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 overflow-hidden px-4 @max-[360px]:px-3 @max-[240px]:gap-1.5 @max-[240px]:px-2.5">
              <div className="min-w-0">
                <div className="text-[9px] font-medium uppercase tracking-[0.1em] text-muted-foreground @max-[240px]:hidden!">Posture now</div>
                <div className="mt-1.5 text-[20px] font-semibold leading-none tracking-tight text-muted-foreground/70 @max-[240px]:mt-0! @max-[240px]:text-[16px]!">Ready</div>
                <div className="mt-1 truncate text-[11px] text-muted-foreground @max-[400px]:hidden!">Sit tall, face the camera</div>
              </div>
              <span className="h-12 w-12 @max-[240px]:h-10! @max-[240px]:w-10!" aria-hidden />
              <div className="text-right leading-none">
                <div className="text-[9px] font-medium uppercase tracking-[0.1em] text-muted-foreground @max-[240px]:hidden!">Session</div>
                <div className="mt-1.5 text-[20px] font-semibold tabular-nums text-muted-foreground/80 @max-[240px]:mt-0! @max-[240px]:text-[16px]!">{String(SESSION_SECONDS / 60).padStart(2, "0")}:00</div>
                <div className="mt-1 whitespace-nowrap text-[11px] text-muted-foreground @max-[240px]:hidden!">Not started</div>
              </div>
            </div>
          </div>
          </>
        ) : (
          <LivePostureView timeLeft={`${mm}:${ss}`} onEnd={handleStop} />
        )}
      </section>

      <div className="space-y-4 fold:col-start-2 fold:row-start-2 fold:self-start">
      <section className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">History</h2>
          <button
            type="button"
            onClick={reloadHistory}
            disabled={reloading}
            aria-label="Reload history"
            title="Reload"
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-primary/50 hover:text-foreground disabled:opacity-60"
          >
            <RotateCw className={`h-3.5 w-3.5 ${reloading ? "animate-spin" : ""}`} />
          </button>
        </div>
        <div className="space-y-2">
          {history.map((m) => (
            <button key={m.date} onClick={() => setShowReport(true)}
              className="w-full text-left p-2.5 rounded-xl bg-card border border-border flex items-center gap-3 transition hover:border-primary/40">
              <ScoreGauge value={m.score} size={60} />
              <div className="flex-1">
                <div className="font-semibold text-sm">{m.date}</div>
                <div className="text-[11px] text-primary mt-0.5">View detail ›</div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold">{m.duration}</div>
                <div className="text-[10px] text-muted-foreground">min</div>
              </div>
            </button>
          ))}
        </div>
      </section>
      </div>

      <DiscomfortDialog open={showDiscomfort} onClose={() => setShowDiscomfort(false)} onSubmit={handleDone} onSkip={handleDone} />
      <CameraSettingDialog open={showCameraSetting} onClose={() => setShowCameraSetting(false)} onConnect={(s) => setCameraSource(s)} />
    </div>
  );
}

