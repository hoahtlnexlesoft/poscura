import { useState } from "react";
import { Camera, Wifi, Search, ChevronRight, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onClose: () => void;
  onConnect: (source: string) => void;
}

const DETECTED = [
  { brand: "Hikvision", model: "DS-2CD2143G2" },
  { brand: "Dahua", model: "IPC-HFW2431T" },
  { brand: "Reolink", model: "RLC-820A" },
];

export function CameraSettingDialog({ open, onClose, onConnect }: Props) {
  const [selected, setSelected] = useState<string>("built-in");
  const [url, setUrl] = useState("");

  const handleConnect = () => {
    onConnect(selected === "built-in" ? "Built-in Camera" : selected);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md rounded-2xl border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-base">Camera Setting</DialogTitle>
          <DialogDescription className="text-xs">
            Choose a camera source for posture monitoring.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Built-in */}
          <button
            onClick={() => setSelected("built-in")}
            className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition ${
              selected === "built-in"
                ? "border-primary bg-primary/10"
                : "border-border bg-background"
            }`}
          >
            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
              <Camera className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Built-in camera</div>
              <div className="text-[11px] text-muted-foreground">
                Default · uses your device camera
              </div>
            </div>
            {selected === "built-in" && <Check className="h-4 w-4 text-primary" />}
          </button>

          {/* External */}
          <div className="p-3 rounded-xl border border-border bg-background space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">External camera</span>
              </div>
              <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-primary/40 text-primary text-[11px]">
                <Search className="h-3 w-3" /> Scan network
              </button>
            </div>

            <div>
              <div className="text-[11px] text-muted-foreground mb-1.5">
                Detected cameras
              </div>
              <div className="space-y-1.5">
                {DETECTED.map((c) => {
                  const id = `${c.brand}|${c.model}`;
                  return (
                    <button
                      key={id}
                      onClick={() => setSelected(id)}
                      className={`w-full p-2.5 rounded-lg border flex items-center gap-2 text-left transition ${
                        selected === id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card"
                      }`}
                    >
                      <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs flex-1">
                        <span className="font-semibold">{c.brand}</span>
                        <span className="text-muted-foreground"> | {c.model}</span>
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-muted-foreground mb-1.5">
                Or enter a camera URL manually
              </div>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="rtsp:// or http:// stream URL"
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleConnect}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-semibold shadow-lg glow-primary"
          >
            Connect
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
