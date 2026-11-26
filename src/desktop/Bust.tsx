import { useNavigate } from "@tanstack/react-router";

/** Posture bust with the three weighted regions and their callouts (Posture Summary). */
const TONE = { balanced: "#2fbf71", slight: "#3b8bff", moderate: "#f5a524", significant: "#ef4444" } as const;
type Tone = keyof typeof TONE;

export function Bust({ head = "balanced", shoulders = "balanced", spine = "slight" }: { head?: Tone; shoulders?: Tone; spine?: Tone }) {
  const navigate = useNavigate();
  const go = (part: string) => navigate({ to: "/body-part/$part", params: { part } });
  // figure sits in the middle of a 460-wide stage; callouts left/right, leader lines run straight to them
  const callouts = [
    { part: "head", label: "Head & Neck", w: 50, tone: head, x: 246, y: 74, side: "r" },
    { part: "shoulders", label: "Shoulders & Upper Back", w: 30, tone: shoulders, x: 190, y: 170, side: "l" },
    { part: "spine", label: "Spine & Torso", w: 20, tone: spine, x: 230, y: 236, side: "r" },
  ] as const;
  return (
    <div className="relative mx-auto h-[340px] w-[460px] max-[679px]:[zoom:.84] max-[559px]:[zoom:.7]">
      <svg viewBox="0 0 460 340" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="bustBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a2233" /><stop offset="1" stopColor="#070a10" /></linearGradient>
          <linearGradient id="bustShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgba(255,255,255,0.16)" /><stop offset="1" stopColor="rgba(0,0,0,0.22)" /></linearGradient>
        </defs>
        <g transform="translate(80 0)">
          <ellipse cx="150" cy="318" rx="78" ry="12" fill="#e7ecf5" opacity=".85" />
          <ellipse cx="150" cy="314" rx="74" ry="10" fill="#0b0f17" />
          <path d="M84 206 C 80 250 86 286 98 312 L 202 312 C 214 286 220 250 216 206 Z" fill="url(#bustBody)" />
          <path d="M150 128 C 112 132 74 140 64 170 C 58 190 62 206 84 212 L 216 212 C 238 206 242 190 236 170 C 226 140 188 132 150 128 Z" fill={TONE[shoulders]} />
          <path d="M150 24 C 124 24 110 44 112 72 C 113 90 120 104 128 112 L 128 136 L 172 136 L 172 112 C 180 104 187 90 188 72 C 190 44 176 24 150 24 Z" fill={TONE[head]} />
          <path d="M138 132 L 162 132 L 158 286 L 142 286 Z" fill={TONE[spine]} />
          <path d="M150 24 C 124 24 110 44 112 72 C 113 90 120 104 128 112 L 128 136 L 172 136 L 172 112 C 180 104 187 90 188 72 C 190 44 176 24 150 24 Z" fill="url(#bustShade)" opacity=".35" />
          <path d="M150 128 C 112 132 74 140 64 170 C 58 190 62 206 84 212 L 216 212 C 238 206 242 190 236 170 C 226 140 188 132 150 128 Z" fill="url(#bustShade)" opacity=".3" />
        </g>
        {callouts.map((c) => (
          <g key={c.part}>
            <line x1={c.x} y1={c.y} x2={c.side === "r" ? 318 : 142} y2={c.y} stroke="rgba(255,255,255,.7)" strokeWidth="1.2" />
            <circle cx={c.x} cy={c.y} r="9" fill="rgba(0,0,0,.15)" stroke="#fff" strokeWidth="1.6" />
            <circle cx={c.x} cy={c.y} r="3.5" fill="#fff" />
          </g>
        ))}
      </svg>
      {callouts.map((c) => (
        <button key={c.part} onClick={() => go(c.part)}
          className={"absolute -translate-y-1/2 rounded-xl border border-white/[0.08] bg-[#121a2a]/95 px-3 py-2 backdrop-blur transition hover:border-white/20 hover:bg-[#162036] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 " + (c.side === "r" ? "text-left" : "text-right")}
          style={{ top: c.y, ...(c.side === "r" ? { left: 318 } : { right: 460 - 142 }) }}>
          <div className="max-w-[136px] text-[12.5px] font-semibold leading-snug" style={{ color: TONE[c.tone] }}>{c.label}</div>
          <div className="text-[11.5px] text-muted-foreground">Weighting <span className="font-semibold text-foreground/90">{c.w}%</span></div>
        </button>
      ))}
    </div>
  );
}

export function BustLegend() {
  return (
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-[12.5px] text-foreground/80">
      {([["Balanced", TONE.balanced], ["Slight", TONE.slight], ["Moderate", TONE.moderate], ["Significant", TONE.significant]] as const).map(([l, c]) => (
        <span key={l} className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: c }} />{l}</span>
      ))}
    </div>
  );
}
