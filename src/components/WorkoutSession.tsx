import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Mic, MicOff, Play, Square, Camera } from "lucide-react";

interface Props {
  workoutName: string;
  videoSrc?: string;
  onClose: () => void;
  onFinish: (recordedUrl: string | null) => void;
}

export function WorkoutSession({ workoutName, videoSrc, onClose, onFinish }: Props) {
  const camRef = useRef<HTMLVideoElement | null>(null);
  const workoutVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [voiceOn, setVoiceOn] = useState(false);
  const [camReady, setCamReady] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (camRef.current) { camRef.current.srcObject = stream; await camRef.current.play().catch(() => {}); }
        setCamReady(true);
      } catch { setCamReady(false); }
    })();
    return () => {
      cancelled = true;
      stopRecorder();
      stopVoice();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      rec.onstop = () => {
        if (chunksRef.current.length === 0) return resolve(null);
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        resolve(URL.createObjectURL(blob));
      };
      rec.stop();
      recorderRef.current = null;
    });

  const handleStart = async () => {
    setElapsed(0); setRunning(true); startRecorder();
    if (workoutVideoRef.current) { workoutVideoRef.current.currentTime = 0; workoutVideoRef.current.play().catch(() => {}); }
  };

  const handleStop = async () => {
    setRunning(false);
    workoutVideoRef.current?.pause();
    const url = await stopRecorder();
    stopVoice();
    onFinish(url);
  };

  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setVoiceOn(false); return; }
    const r = new SR();
    r.continuous = true; r.interimResults = false; r.lang = "en-US";
    r.onresult = (e: any) => {
      const text = Array.from(e.results).map((res: any) => res[0].transcript).join(" ").toLowerCase();
      if (text.includes("start") && !running) handleStart();
      else if ((text.includes("stop") || text.includes("end")) && running) handleStop();
    };
    r.onend = () => { if (voiceOn) { try { r.start(); } catch {} } };
    try { r.start(); recognitionRef.current = r; setVoiceOn(true); } catch { setVoiceOn(false); }
  };

  const stopVoice = () => {
    setVoiceOn(false);
    try { recognitionRef.current?.stop(); } catch {}
    recognitionRef.current = null;
  };

  const toggleVoice = () => (voiceOn ? stopVoice() : startVoice());

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onClose} aria-label="Back" className="flex h-9 w-9 -ml-1.5 items-center justify-center rounded-full hover:bg-muted">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Guided session</div>
          <h1 className="truncate text-lg font-bold leading-tight">{workoutName}</h1>
        </div>
        {running && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 bg-destructive/15 px-2.5 py-1 text-[11px] font-semibold text-destructive">
            <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" /> REC {mm}:{ss}
          </span>
        )}
      </div>

      <div className="grid gap-3 land:grid-cols-2 land:gap-x-6">
        {/* guide video */}
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#0d1a33] via-[#0a1222] to-[#070b14] land:aspect-auto land:h-[calc(100dvh-170px)]">
          {videoSrc && <video ref={workoutVideoRef} src={videoSrc} className="absolute inset-0 h-full w-full object-cover" playsInline muted loop />}
          <div aria-hidden className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
          <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/80 backdrop-blur">Guide</span>
          {!running && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur">
                <Play className="ml-0.5 h-6 w-6 fill-white text-white" />
              </span>
              <div>
                <div className="text-sm font-semibold text-white">{workoutName}</div>
                <div className="mt-0.5 text-[11px] text-white/55">The guide plays when you press Start</div>
              </div>
            </div>
          )}
        </div>

        {/* your camera + controls */}
        <div className="flex flex-col gap-3 land:h-[calc(100dvh-170px)]">
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-background to-background land:aspect-auto land:flex-1">
            <video ref={camRef} className="absolute inset-0 h-full w-full object-cover [transform:scaleX(-1)]" playsInline muted />
            <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/80 backdrop-blur">You</span>
            {!camReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-center text-muted-foreground">
                <Camera className="h-7 w-7" />
                <div className="text-[11px]">Allow camera access to record your form</div>
              </div>
            )}
          </div>

          <div className="glass-card grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleVoice}
                aria-label={voiceOn ? "Turn voice control off" : "Turn voice control on"}
                className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${voiceOn ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
              >
                {voiceOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </button>
              <span className="hidden text-[11px] leading-tight text-muted-foreground min-[380px]:block">{voiceOn ? "Say \u201cstop\u201d" : "Voice off"}</span>
            </div>
            {running ? (
              <button onClick={handleStop} aria-label="Stop" className="flex h-14 w-14 items-center justify-center rounded-full border border-destructive/50 bg-destructive/15 text-destructive shadow-[0_0_0_5px_color-mix(in_oklab,var(--color-destructive)_8%,transparent)] transition hover:bg-destructive/25 active:scale-95">
                <Square className="h-5 w-5 fill-current" />
              </button>
            ) : (
              <button onClick={handleStart} aria-label="Start" className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-[0_10px_30px_-10px] shadow-primary transition hover:opacity-95 active:scale-95">
                <Play className="ml-0.5 h-5 w-5 fill-current" />
              </button>
            )}
            <div className="text-right leading-none">
              <div className="text-[9px] font-medium uppercase tracking-[0.1em] text-muted-foreground">Elapsed</div>
              <div className="mt-1.5 text-[20px] font-semibold tabular-nums">{mm}:{ss}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
