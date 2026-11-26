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
        <stop offset="0" stopColor="#1b2a45" />
        <stop offset="1" stopColor="#0f1829" />
      </linearGradient>
      <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="var(--color-primary)" stopOpacity="0.35" />
        <stop offset="1" stopColor="var(--color-primary)" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

/** Calendar page with an empty "today" — no sessions scheduled for the day. */
export function NoWorkoutsArt({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const cells = Array.from({ length: 15 }, (_, i) => i);
  return (
    <svg viewBox="0 0 200 160" className={cn("h-auto w-[160px]", className)} aria-hidden>
      <Defs id={id} />
      <ellipse cx="100" cy="86" rx="86" ry="66" fill={`url(#${id}-glow)`} />
      {/* back page */}
      <rect x="52" y="34" width="104" height="92" rx="16" fill="#152238" opacity="0.7" transform="rotate(-6 104 80)" />
      {/* calendar */}
      <rect x="46" y="38" width="108" height="96" rx="16" fill={`url(#${id}-glass)`} stroke="rgba(255,255,255,0.1)" />
      <path d="M46 54a16 16 0 0 1 16-16h76a16 16 0 0 1 16 16v6H46z" fill={`url(#${id}-brand)`} />
      {[72, 100, 128].map((x) => <rect key={x} x={x - 2.5} y="31" width="5" height="14" rx="2.5" fill="#cfe2ff" />)}
      {cells.map((i) => {
        const c = i % 5, r = Math.floor(i / 5);
        const x = 58 + c * 18, y = 70 + r * 18;
        const today = i === 7;
        return today
          ? <rect key={i} x={x - 1} y={y - 1} width="14" height="14" rx="4.5" fill="none" stroke={`url(#${id}-brand)`} strokeWidth="2" strokeDasharray="3 2.5" />
          : <rect key={i} x={x} y={y} width="12" height="12" rx="3.5" fill="rgba(255,255,255,0.08)" />;
      })}
      {/* small "rest" badge */}
      <circle cx="150" cy="122" r="15" fill="#0f1829" stroke={`url(#${id}-brand)`} strokeWidth="2" />
      <path d="M156 116.5a8 8 0 1 1-9.5 11.5a6.5 6.5 0 0 0 9.5-11.5z" fill={`url(#${id}-brand)`} />
    </svg>
  );
}

/** A plan sheet still to be written, with scan corners — the plan comes from the first scan. */
export function NoPlanArt({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 200 160" className={cn("h-auto w-[170px]", className)} aria-hidden>
      <Defs id={id} />
      <ellipse cx="100" cy="82" rx="88" ry="68" fill={`url(#${id}-glow)`} />
      {/* scan corners */}
      <g stroke={`url(#${id}-brand)`} strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M44 40v-10a8 8 0 0 1 8-8h10" /><path d="M138 22h10a8 8 0 0 1 8 8v10" />
        <path d="M156 120v10a8 8 0 0 1-8 8h-10" /><path d="M62 138h-10a8 8 0 0 1-8-8v-10" />
      </g>
      {/* plan sheet */}
      <rect x="62" y="34" width="76" height="92" rx="14" fill={`url(#${id}-glass)`} stroke="rgba(255,255,255,0.1)" />
      <rect x="86" y="28" width="28" height="12" rx="6" fill="#26385a" stroke="rgba(255,255,255,0.12)" />
      {[56, 74, 92].map((y, i) => (
        <g key={y}>
          <rect x="74" y={y} width="10" height="10" rx="3" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.6" strokeDasharray="2.5 2" />
          <rect x="90" y={y + 2} width={i === 1 ? 26 : 36} height="6" rx="3" fill="rgba(255,255,255,0.1)" />
        </g>
      ))}
      {/* scan line */}
      <rect x="54" y="108" width="92" height="3" rx="1.5" fill={`url(#${id}-brand)`} />
      <rect x="54" y="102" width="92" height="12" rx="6" fill="var(--color-secondary)" opacity="0.12" />
      {/* sparkle */}
      <path d="M150 52l2.6 6.4 6.4 2.6-6.4 2.6-2.6 6.4-2.6-6.4-6.4-2.6 6.4-2.6z" fill={`url(#${id}-brand)`} />
      <circle cx="48" cy="72" r="3" fill="var(--color-secondary)" opacity="0.7" />
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
      <rect x="36" y="18" width="128" height="124" rx="28" fill={`url(#${id}-glass)`} stroke="rgba(255,255,255,0.08)" />
      {/* desk + chair */}
      <rect x="112" y="92" width="38" height="4" rx="2" fill="#3a4d6e" />
      <rect x="140" y="96" width="4" height="34" rx="2" fill="#2c3c58" />
      <rect x="128" y="80" width="16" height="11" rx="2" fill="#2c3c58" />
      <path d="M70 72v38a6 6 0 0 0 6 6h22" stroke="#3a4d6e" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M84 118v12m-10 0h20" stroke="#2c3c58" strokeWidth="4" strokeLinecap="round" />
      {/* figure, upright, with the spine traced */}
      <circle cx="92" cy="46" r="9" fill="#cfe2ff" />
      <path d="M90 57c-6 2-9 8-9 16v30h18l8 26" stroke="#cfe2ff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M95 64l18 22h10" stroke="#cfe2ff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M88 58v44" stroke={`url(#${id}-brand)`} strokeWidth="2.4" strokeLinecap="round" strokeDasharray="1 5" />
      {/* scan frame + line */}
      <g stroke={`url(#${id}-brand)`} strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M60 40v-8a6 6 0 0 1 6-6h8" /><path d="M118 26h8a6 6 0 0 1 6 6v8" />
        <path d="M132 112v8a6 6 0 0 1-6 6h-8" /><path d="M74 126h-8a6 6 0 0 1-6-6v-8" />
      </g>
      <rect x="54" y="84" width="84" height="3" rx="1.5" fill={`url(#${id}-brand)`} />
      <rect x="54" y="78" width="84" height="14" rx="7" fill="var(--color-secondary)" opacity="0.12" />
    </svg>
  );
}
