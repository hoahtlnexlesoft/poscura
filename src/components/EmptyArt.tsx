import { useId } from "react";
import { cn } from "@/lib/utils";

/* Empty-state illustrations, drawn in the app's own style: glass panels, the blue→teal brand gradient,
   thin strokes and a soft glow. One family, so every empty state looks like it belongs to Poscura. */

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-brand`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="var(--color-primary)" />
        <stop offset="1" stopColor="var(--color-secondary)" />
      </linearGradient>
      <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#21324f" />
        <stop offset="1" stopColor="#111b2e" />
      </linearGradient>
      <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.28" />
        <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.06" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0.02" />
      </linearGradient>
      <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="var(--color-primary)" stopOpacity="0.32" />
        <stop offset="0.6" stopColor="var(--color-secondary)" stopOpacity="0.08" />
        <stop offset="1" stopColor="var(--color-primary)" stopOpacity="0" />
      </radialGradient>
      <filter id={`${id}-lift`} x="-30%" y="-30%" width="160%" height="170%">
        <feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#000" floodOpacity="0.55" />
      </filter>
      <filter id={`${id}-shine`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" />
      </filter>
    </defs>
  );
}

/** A day on the calendar with nothing booked: past days done, today an empty dashed slot, a rest badge. */
export function NoWorkoutsArt({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 200 160" className={cn("h-auto w-[160px]", className)} aria-hidden>
      <Defs id={id} />
      <ellipse cx="100" cy="84" rx="92" ry="70" fill={`url(#${id}-glow)`} />
      {/* back sheet, fanned */}
      <rect x="58" y="36" width="96" height="88" rx="18" fill="#17243b" stroke="rgba(255,255,255,0.06)" transform="rotate(8 106 80)" />
      <g filter={`url(#${id}-lift)`}>
        <rect x="44" y="34" width="112" height="100" rx="20" fill={`url(#${id}-glass)`} />
        <rect x="44.5" y="34.5" width="111" height="99" rx="19.5" fill="none" stroke={`url(#${id}-edge)`} />
        {/* header band */}
        <path d="M44 54a20 20 0 0 1 20-20h72a20 20 0 0 1 20 20v4H44z" fill={`url(#${id}-brand)`} />
        <path d="M58 40h84" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />
        {/* rings */}
        {[72, 100, 128].map((x) => (
          <g key={x}><rect x={x - 3} y="26" width="6" height="16" rx="3" fill="#e8f1ff" /><rect x={x - 1} y="28" width="2" height="7" rx="1" fill="#fff" opacity="0.7" /></g>
        ))}
        {/* days: three done, today empty, rest upcoming */}
        {Array.from({ length: 15 }, (_, i) => {
          const c = i % 5, r = Math.floor(i / 5);
          const x = 57 + c * 18, y = 68 + r * 19;
          if (i === 7) return null;
          const done = i === 2 || i === 5 || i === 6;
          return (
            <g key={i}>
              <rect x={x} y={y} width="14" height="14" rx="4.5" fill={done ? "color-mix(in oklab, var(--color-secondary) 22%, transparent)" : "rgba(255,255,255,0.07)"} />
              {done && <path d={`M${x + 4} ${y + 7.2}l2.2 2.2 4-4.4`} stroke="var(--color-secondary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />}
            </g>
          );
        })}
        {/* today: empty, dashed, softly lit */}
        <rect x="88" y="80" width="24" height="24" rx="8" fill="var(--color-primary)" opacity="0.18" filter={`url(#${id}-shine)`} />
        <rect x="92" y="84" width="16" height="16" rx="5" fill="#0f1829" stroke={`url(#${id}-brand)`} strokeWidth="1.8" strokeDasharray="3 2.4" />
      </g>
      {/* rest badge */}
      <g filter={`url(#${id}-lift)`}>
        <circle cx="152" cy="120" r="17" fill="#101a2c" />
        <circle cx="152" cy="120" r="16" fill="none" stroke={`url(#${id}-brand)`} strokeWidth="2" />
        <path d="M157.5 112.5a9 9 0 1 1-11.2 12.6a7.4 7.4 0 0 0 11.2-12.6z" fill={`url(#${id}-brand)`} />
        <path d="M143 109l1.2 2.6 2.6 1.2-2.6 1.2-1.2 2.6-1.2-2.6-2.6-1.2 2.6-1.2z" fill="#e8f1ff" opacity="0.85" />
      </g>
      <circle cx="40" cy="58" r="2.5" fill="var(--color-secondary)" opacity="0.6" />
      <circle cx="166" cy="48" r="1.8" fill="var(--color-primary)" opacity="0.7" />
    </svg>
  );
}

/** The plan still to be written, inside scan corners — the first scan writes it. */
export function NoPlanArt({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 200 160" className={cn("h-auto w-[170px]", className)} aria-hidden>
      <Defs id={id} />
      <ellipse cx="100" cy="82" rx="92" ry="70" fill={`url(#${id}-glow)`} />
      {/* scan corners */}
      <g stroke={`url(#${id}-brand)`} strokeWidth="3.2" strokeLinecap="round" fill="none">
        <path d="M42 44V32a10 10 0 0 1 10-10h12" /><path d="M136 22h12a10 10 0 0 1 10 10v12" />
        <path d="M158 116v12a10 10 0 0 1-10 10h-12" /><path d="M64 138H52a10 10 0 0 1-10-10v-12" />
      </g>
      {/* clipboard */}
      <g filter={`url(#${id}-lift)`}>
        <rect x="64" y="34" width="72" height="92" rx="16" fill={`url(#${id}-glass)`} />
        <rect x="64.5" y="34.5" width="71" height="91" rx="15.5" fill="none" stroke={`url(#${id}-edge)`} />
        <rect x="84" y="27" width="32" height="14" rx="7" fill="#2a3d61" />
        <rect x="84.5" y="27.5" width="31" height="13" rx="6.5" fill="none" stroke="rgba(255,255,255,0.18)" />
        <circle cx="100" cy="34" r="2.6" fill={`url(#${id}-brand)`} />
        {[56, 74, 92].map((y, i) => (
          <g key={y}>
            <rect x="75" y={y} width="12" height="12" rx="4" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.6" strokeDasharray="2.6 2.2" />
            <rect x="93" y={y + 1.5} width={i === 1 ? 24 : 32} height="4" rx="2" fill="rgba(255,255,255,0.16)" />
            <rect x="93" y={y + 7.5} width={i === 2 ? 16 : 22} height="3" rx="1.5" fill="rgba(255,255,255,0.07)" />
          </g>
        ))}
      </g>
      {/* scan beam */}
      <rect x="50" y="98" width="100" height="18" rx="9" fill="var(--color-secondary)" opacity="0.14" filter={`url(#${id}-shine)`} />
      <rect x="50" y="106" width="100" height="2.6" rx="1.3" fill={`url(#${id}-brand)`} />
      <circle cx="150" cy="107.3" r="3" fill="#e8fffb" />
      {/* sparkles */}
      <path d="M156 50l3 7.2 7.2 3-7.2 3-3 7.2-3-7.2-7.2-3 7.2-3z" fill={`url(#${id}-brand)`} />
      <path d="M46 78l1.6 3.6 3.6 1.6-3.6 1.6-1.6 3.6-1.6-3.6-3.6-1.6 3.6-1.6z" fill="var(--color-secondary)" opacity="0.8" />
    </svg>
  );
}

/** Seated figure inside a scan frame — ready for the first posture scan. */
export function FirstScanArt({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 200 160" className={cn("h-auto w-[190px]", className)} aria-hidden>
      <Defs id={id} />
      <ellipse cx="100" cy="82" rx="90" ry="70" fill={`url(#${id}-glow)`} />
      <g filter={`url(#${id}-lift)`}><rect x="36" y="18" width="128" height="124" rx="28" fill={`url(#${id}-glass)`} /><rect x="36.5" y="18.5" width="127" height="123" rx="27.5" fill="none" stroke={`url(#${id}-edge)`} /></g>
      {/* desk + chair */}
      <rect x="112" y="92" width="38" height="4" rx="2" fill="#3a4d6e" />
      <rect x="140" y="96" width="4" height="34" rx="2" fill="#2c3c58" />
      <rect x="128" y="80" width="16" height="11" rx="2" fill="#2c3c58" />
      <path d="M70 72v38a6 6 0 0 0 6 6h22" stroke="#3a4d6e" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M84 118v12m-10 0h20" stroke="#2c3c58" strokeWidth="4" strokeLinecap="round" />
      {/* figure, upright, with the spine traced */}
      <circle cx="92" cy="45" r="8.5" fill="#dbe8ff" />
      <path d="M90 57c-6 2-9 8-9 16v30h18l8 26" stroke="#dbe8ff" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M95 64l18 22h10" stroke="#dbe8ff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M88 58v44" stroke={`url(#${id}-brand)`} strokeWidth="2.4" strokeLinecap="round" strokeDasharray="1 5" />
      {/* scan frame + line */}
      <g stroke={`url(#${id}-brand)`} strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M60 40v-8a6 6 0 0 1 6-6h8" /><path d="M118 26h8a6 6 0 0 1 6 6v8" />
        <path d="M132 112v8a6 6 0 0 1-6 6h-8" /><path d="M74 126h-8a6 6 0 0 1-6-6v-8" />
      </g>
      <rect x="54" y="84" width="84" height="3" rx="1.5" fill={`url(#${id}-brand)`} />
      <rect x="54" y="78" width="84" height="14" rx="7" fill="var(--color-secondary)" opacity="0.16" filter={`url(#${id}-shine)`} />
      <circle cx="138" cy="85.5" r="2.8" fill="#e8fffb" />
    </svg>
  );
}
