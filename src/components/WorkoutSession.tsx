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
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="inline-flex items-center gap-1 text-sm text-muted-foreground">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <div className="text-xs text-muted-foreground truncate">{workoutName}</div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="aspect-video bg-black relative">
          <video ref={workoutVideoRef} src={videoSrc} className="w-full h-full object-contain" playsInline muted loop />
          {!running && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white/90">
              <div className="text-center">
                <Play className="h-10 w-10 mx-auto mb-2 opacity-80" />
                <div className="text-xs">Press Start to begin</div>
              </div>
            </div>
          )}
        </div>
        <div className="aspect-video bg-gradient-to-br from-muted via-card to-background relative">
          <video ref={camRef} className="w-full h-full object-cover" playsInline muted />
          {!camReady && (
            <div className="absolute inset-0 flex items-center justify-center text-center text-muted-foreground">
              <div>
                <Camera className="h-8 w-8 mx-auto mb-1" />
                <div className="text-[11px]">Allow camera to record</div>
              </div>
            </div>
          )}
          {running && (
            <div className="absolute top-2 left-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-destructive/20 border border-destructive/40 text-destructive text-[11px] font-medium">
              <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" /> REC
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-4 border-t border-border">
          <div>
            <div className="text-[10px] text-muted-foreground">Elapsed</div>
            <div className="text-xl font-bold tabular-nums">{mm}:{ss}</div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <button onClick={toggleVoice}
              className={`h-10 w-10 rounded-full border-2 flex items-center justify-center ${voiceOn ? "border-primary bg-primary/15 text-primary" : "border-primary text-primary"}`}>
              {voiceOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </button>
            {running ? (
              <button onClick={handleStop} className="px-6 py-2 rounded-full bg-destructive text-destructive-foreground text-sm font-medium flex items-center gap-2 shadow-lg">
                <Square className="h-3.5 w-3.5 fill-current" /> Stop
              </button>
            ) : (
              <button onClick={handleStart} className="px-6 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-medium flex items-center gap-2 shadow-lg glow-primary">
                <Play className="h-3.5 w-3.5 fill-current" /> Start
              </button>
            )}
          </div>
          <div className="w-10" />
        </div>
      </div>
    </div>
  );
}
