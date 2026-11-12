import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Play, Camera, Activity, Settings } from "lucide-react";
import { ScoreGauge } from "@/components/ScoreGauge";
import { DiscomfortDialog } from "@/components/DiscomfortDialog";
import { SessionReport } from "@/components/SessionReport";
import { MonitoringTimeLeft } from "@/components/MonitoringTimeLeft";
import { CameraSettingDialog } from "@/components/CameraSettingDialog";
import { LivePostureView } from "@/components/LivePostureView";

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
    <div className="space-y-4 fold:grid fold:grid-cols-[1.25fr_1fr] fold:gap-4 fold:space-y-0 fold:items-start">
      {!running && <MonitoringTimeLeft />}


      <section className="rounded-2xl border border-border bg-gradient-to-br from-card via-background to-background overflow-hidden fold:col-start-1">
        {!running ? (
          <div className="h-[clamp(300px,calc(100dvh-290px),640px)] relative flex flex-col items-center justify-center gap-3 px-4 text-center">
            <button
              onClick={() => setShowCameraSetting(true)}
              className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm border border-border text-[10px] text-muted-foreground"
            >
              <Settings className="h-3 w-3" /> {cameraSource}
            </button>
            <button className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm border border-border text-[10px] text-muted-foreground">
              Setup Guide
            </button>
            <Camera className="h-12 w-12 text-muted-foreground/40" strokeWidth={1.5} />
            <div className="text-sm text-muted-foreground">Camera feed will appear here</div>
            <button onClick={handleStart}
              className="mt-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold text-sm flex items-center gap-2 shadow-lg glow-primary">
              <Play className="h-4 w-4 fill-current" /> Start monitoring
            </button>
          </div>
        ) : (
          <LivePostureView timeLeft={`${mm}:${ss}`} onEnd={handleStop} />
        )}
      </section>

      <section className="glass-card p-4 fold:col-start-2 fold:row-start-1 fold:row-span-2">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">History</h2>
        </div>
        <div className="space-y-2">
          {history.map((m) => (
            <button key={m.date} onClick={() => setShowReport(true)}
              className="w-full text-left p-3 rounded-xl bg-card border border-border flex items-center gap-3">
              <ScoreGauge value={m.score} size={80} />
              <div className="flex-1">
                <div className="font-semibold text-sm">{m.date}</div>
                <div className="text-[11px] text-primary mt-0.5">View detail ›</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{m.duration}</div>
                <div className="text-[10px] text-muted-foreground">min</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <DiscomfortDialog open={showDiscomfort} onClose={() => setShowDiscomfort(false)} onSubmit={handleDone} onSkip={handleDone} />
      <CameraSettingDialog open={showCameraSetting} onClose={() => setShowCameraSetting(false)} onConnect={(s) => setCameraSource(s)} />
    </div>
  );
}
