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

/** Seated person at a desk inside a scan frame, spine traced — the first posture scan.
 *  Vector redraw of the original illustration, so it stays crisp at any size. */
export function FirstScanArt({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 220 200" className={cn("h-auto w-[180px]", className)} aria-hidden>
      <Defs id={id} />
      <linearGradient id={`${id}-sweater`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#c9ced8" /><stop offset="1" stopColor="#8d94a3" />
      </linearGradient>
      <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#22d3ee" stopOpacity="0" /><stop offset="0.15" stopColor="#22d3ee" />
        <stop offset="0.85" stopColor="#34d399" /><stop offset="1" stopColor="#34d399" stopOpacity="0" />
      </linearGradient>
      <ellipse cx="110" cy="104" rx="100" ry="82" fill={`url(#${id}-glow)`} />

      {/* desk */}
      <rect x="120" y="118" width="80" height="6" rx="2" fill="#b8ad9a" />
      <rect x="182" y="124" width="6" height="56" rx="2" fill="#9b917f" />
      <rect x="126" y="124" width="4" height="10" rx="1.5" fill="#9b917f" />
      {/* laptop */}
      <path d="M142 117l6-14h30l-4 14z" fill="#3b4558" />
      <rect x="136" y="115.5" width="46" height="3" rx="1.5" fill="#596579" />

      {/* chair */}
      <rect x="56" y="74" width="8" height="58" rx="4" fill="#1f2b44" />
      <rect x="58" y="128" width="58" height="10" rx="5" fill="#22325a" />
      <rect x="84" y="138" width="6" height="26" rx="2" fill="#2a3346" />
      <path d="M62 172h50M87 164v8" stroke="#2a3346" strokeWidth="5" strokeLinecap="round" />
      {[62, 87, 112].map((x) => <circle key={x} cx={x} cy="176" r="4" fill="#1a2233" />)}

      {/* legs */}
      <path d="M74 128h44l10 44" stroke="#151b26" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M124 172h12" stroke="#0e131c" strokeWidth="9" strokeLinecap="round" />
      {/* torso (upright) */}
      <path d="M68 72c0-10 8-17 18-17h4c10 0 16 8 16 18v52H70z" fill={`url(#${id}-sweater)`} />
      {/* arm to the keyboard */}
      <path d="M96 76l10 34h30" stroke="#a9afbc" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="139" cy="110" r="5" fill="#e8c4a6" />
      {/* neck + head */}
      <rect x="84" y="44" width="10" height="14" rx="4" fill="#e1b896" />
      <circle cx="90" cy="36" r="13" fill="#e8c4a6" />
      <path d="M77 34c0-10 7-16 15-16 8 0 13 5 13 11-6-2-12 0-16 3-4 1-8 4-8 10-3-2-4-5-4-8z" fill="#1b1f29" />
      <circle cx="98" cy="35" r="1.3" fill="#3a2a22" />

      {/* spine, traced */}
      <path d="M84 50v28M80 84v36M80 126h30l8 36" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="3 4" fill="none" opacity="0.95" />

      {/* scan beam at elbow height */}
      <rect x="40" y="102" width="150" height="16" rx="8" fill="#22d3ee" opacity="0.14" filter={`url(#${id}-shine)`} />
      <rect x="40" y="108.5" width="150" height="3" rx="1.5" fill={`url(#${id}-beam)`} />

      {/* scan corners */}
      <g stroke={`url(#${id}-brand)`} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M44 38V28a10 10 0 0 1 10-10h8" /><path d="M144 18h8a10 10 0 0 1 10 10v10" />
        <path d="M162 128v10a10 10 0 0 1-10 10h-8" /><path d="M62 148h-8a10 10 0 0 1-10-10v-10" />
      </g>
    </svg>
  );
}
