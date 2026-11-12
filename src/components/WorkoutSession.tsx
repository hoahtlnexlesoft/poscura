import { useImmersive } from "@/hooks/useImmersive";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Settings, Volume2, VolumeX, Camera } from "lucide-react";
import wordmark from "@/assets/poscura-wordmark.png";
import { Figure } from "@/components/ExerciseIntro";
import { guideFor } from "@/lib/exercise-guides";
import { cn } from "@/lib/utils";

interface Props {
  workoutName: string;
  videoSrc?: string;
  session?: number;
  sessions?: number;
  /** guide length in seconds */
  duration?: number;
  onClose: () => void;
  onFinish: (recordedUrl: string | null) => void;
  onNext?: () => void;
}

const fmt = (t: number) => `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

/** Full-screen guided session, as in the live app: vertical guide video, camera picture-in-picture, Back / Start / Next. */
export function WorkoutSession({ workoutName, videoSrc, session = 1, sessions = 1, duration = 73, onClose, onFinish, onNext }: Props) {
  const camRef = useRef<HTMLVideoElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [count, setCount] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(false);
  const [camReady, setCamReady] = useState(false);
  const motion = guideFor(workoutName).motion;
  useImmersive();

  // camera for the picture-in-picture
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (camRef.current) { camRef.current.srcObject = stream; await camRef.current.play().catch(() => {}); }
        setCamReady(true);
      } catch { setCamReady(false); }
    })();
    return () => {
      cancelled = true;
      try { recorderRef.current?.stop(); } catch {}
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // 3-2-1 countdown, then play
  useEffect(() => {
    if (count === null) return;
    if (count === 0) {
      setCount(null); setRunning(true); setElapsed(0);
      startRecorder();
      videoRef.current?.play().catch(() => {});
      return;
    }
    const t = setTimeout(() => setCount((c) => (c === null ? null : c - 1)), 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  // elapsed clock; finishes on its own at the end of the guide
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  useEffect(() => {
    if (running && elapsed >= duration) handleStop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, running]);

  const startRecorder = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    try {
      const rec = new MediaRecorder(streamRef.current);
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.start();
      recorderRef.current = rec;
    } catch {}
  };
  const stopRecorder = (): Promise<string | null> =>
    new Promise((resolve) => {
      const rec = recorderRef.current;
      if (!rec || rec.state === "inactive") return resolve(null);
      rec.onstop = () => resolve(chunksRef.current.length ? URL.createObjectURL(new Blob(chunksRef.current, { type: "video/webm" })) : null);
      rec.stop();
      recorderRef.current = null;
    });

  async function handleStop() {
    setRunning(false);
    videoRef.current?.pause();
    onFinish(await stopRecorder());
  }

  const pct = Math.min(100, (elapsed / duration) * 100);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black text-white">
      {/* stage */}
      <div className="relative min-h-0 flex-1">
        {/* vertical guide video */}
        <div className="absolute inset-0 flex justify-center">
          <div className="relative h-full aspect-[9/16] max-w-full overflow-hidden bg-gradient-to-b from-[#7cc6e6] via-[#4fb2df] to-[#3aa4d4]">
            {videoSrc ? (
              <video ref={videoRef} src={videoSrc} muted={muted} playsInline className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className={cn("absolute inset-x-0 bottom-0 top-[18%]", !running && count === null && "opacity-90")}>
                <Figure motion={running ? motion : "nod"} light />
              </div>
            )}
            <img src={wordmark} alt="Poscura" className="absolute left-[5%] top-[7%] h-[6%] max-h-10 w-auto object-contain" />
          </div>
        </div>

        {/* countdown */}
        {count !== null && count > 0 && (
          <div key={count} className="absolute inset-0 flex items-center justify-center">
            <span className="text-[min(28vw,160px)] font-light leading-none text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.25)] animate-in zoom-in-50 fade-in duration-300">{count}</span>
          </div>
        )}

        {/* top controls */}
        <div className="absolute inset-x-3 top-3 flex items-center gap-2">
          <button onClick={onClose} aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur transition hover:bg-black/55">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/25 bg-black/35 px-3 text-xs font-medium backdrop-blur transition hover:bg-black/50">
            <Settings className="h-3.5 w-3.5" /> Camera Setting
          </button>
          <span className="ml-auto rounded-full border border-white/25 bg-black/35 px-3 py-1 text-xs font-medium backdrop-blur">Session {session}/{sessions}</span>
        </div>

        {/* camera picture-in-picture */}
        <div className="absolute right-3 top-14 aspect-[3/4] w-[24%] min-w-[96px] max-w-[150px] overflow-hidden rounded-xl border border-white/40 bg-[#1b2433] shadow-[0_8px_24px_rgba(0,0,0,0.35)] land:aspect-video land:w-[22%] land:max-w-[180px]">
          <video ref={camRef} className="h-full w-full object-cover [transform:scaleX(-1)]" playsInline muted />
          {!camReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center text-white/60">
              <Camera className="h-5 w-5" />
              <span className="px-2 text-[10px] leading-tight">Allow camera</span>
            </div>
          )}
          {running && (
            <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" /> REC
            </span>
          )}
        </div>

        {/* playback bar */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-10">
          <div className="flex items-center justify-between text-[13px] tabular-nums">
            <span>{fmt(elapsed)} | {fmt(duration)}</span>
            <button onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute" : "Mute"} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10">
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/30">
            <div className="h-full rounded-full bg-white transition-[width] duration-1000 ease-linear" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* bottom actions */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center border-t border-white/10 bg-[#0b1220] px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <button onClick={onClose} className="inline-flex items-center gap-1 justify-self-start text-[15px] font-medium text-primary">
          <ChevronLeft className="h-5 w-5" /> Back
        </button>
        {running ? (
          <button onClick={handleStop} className="h-11 min-w-[120px] rounded-xl bg-destructive px-6 text-[15px] font-semibold text-white transition hover:opacity-90 active:scale-95">
            Finish
          </button>
        ) : (
          <button
            onClick={() => setCount(3)}
            disabled={count !== null}
            className="h-11 min-w-[120px] rounded-xl bg-primary px-6 text-[15px] font-semibold text-primary-foreground transition hover:opacity-90 active:scale-95 disabled:opacity-70"
          >
            Start
          </button>
        )}
        <button
          onClick={onNext}
          disabled={!onNext}
          className="inline-flex items-center gap-1 justify-self-end text-[15px] font-medium text-primary disabled:opacity-40"
        >
          Next <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
