import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Check, CheckCircle2, Clock, Eye, Square } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------------
 * Live posture view (demo): a seated person at a desk, seen from the side,
 * with angle lines, coaching banners and a Good / Adjust / Poor status bar.
 * There is no real pose detection yet — the view cycles through a scripted
 * sequence so the screen can be reviewed end to end.
 * ---------------------------------------------------------------------- */

type Level = "good" | "adjust" | "poor";
type Area = "shoulders" | "torso" | "neck";
type Pose = { lean: number; neck: number; shrug: number };

interface Phase {
  key: string;
  level: Level;
  /** coaching banner (none while posture is simply good) */
  banner?: {
    tone: "warn" | "bad" | "ok"; kicker?: string; title: string; note?: string;
    /** other areas still off, e.g. "+1 more: Head forward 20°" */
    more?: string;
    /** what was just fixed before this one, e.g. "Leaning forward fixed. Now this one." */
    fixed?: string;
  };
  status: { word: string; note: string };
  pose: Pose;
  score: number;
  /** which angle lines are flagged */
  flags?: Area[];
  ms: number;
}

const GOOD = { word: "Good", note: "Keep it up." };
const BETTER = { tone: "ok" as const, title: "Better. Keep it there.", note: "Corrected in 5 s." };

const PHASES: Phase[] = [
  { key: "good", level: "good", score: 82, ms: 6000, pose: { lean: 4, neck: 12, shrug: 0 }, status: GOOD },
  {
    key: "shoulders", level: "adjust", flags: ["shoulders"], score: 70, ms: 6000,
    pose: { lean: 7, neck: 15, shrug: 12 },
    banner: { tone: "warn", kicker: "Shoulders & Upper Back · Shoulders raised 14°", title: "Let your shoulders drop away from your ears." },
    status: { word: "Adjust", note: "Shoulders raised 14°" },
  },
  { key: "fixed-1", level: "good", score: 78, ms: 4000, pose: { lean: 5, neck: 13, shrug: 0 }, banner: BETTER, status: GOOD },
  {
    key: "lean", level: "poor", flags: ["torso"], score: 54, ms: 6500,
    pose: { lean: 32, neck: 48, shrug: 2 },
    banner: { tone: "bad", kicker: "Spine & Torso · Leaning forward 32°", title: "Sit back so the chair supports your lower back." },
    status: { word: "Poor", note: "Leaning forward 32°" },
  },
  { key: "fixed-2", level: "good", score: 77, ms: 4000, pose: { lean: 5, neck: 13, shrug: 0 }, banner: BETTER, status: GOOD },
  {
    key: "lean-head", level: "poor", flags: ["torso", "neck"], score: 48, ms: 6500,
    pose: { lean: 30, neck: 50, shrug: 2 },
    banner: { tone: "bad", kicker: "Spine & Torso · Leaning forward 30°", title: "Sit back so the chair supports your lower back.", more: "+1 more: Head forward 20°" },
    status: { word: "Poor", note: "2 areas · Leaning forward 30°, Head forward 20°" },
  },
  {
    key: "head", level: "poor", flags: ["neck"], score: 62, ms: 6000,
    pose: { lean: 6, neck: 26, shrug: 0 },
    banner: { tone: "bad", kicker: "Head & Neck · Head forward 20°", title: "Chin back a little, ears over shoulders.", fixed: "Leaning forward fixed. Now this one." },
    status: { word: "Poor", note: "Head forward 20°" },
  },
  { key: "fixed-3", level: "good", score: 79, ms: 4000, pose: { lean: 5, neck: 13, shrug: 0 }, banner: BETTER, status: GOOD },
];

const LEVEL_TEXT: Record<Level, string> = { good: "text-success", adjust: "text-warning", poor: "text-destructive" };

/* ---------------- geometry helpers ---------------- */
type V = { x: number; y: number };
const rad = (d: number) => (d * Math.PI) / 180;
const add = (a: V, b: V): V => ({ x: a.x + b.x, y: a.y + b.y });
const mul = (a: V, k: number): V => ({ x: a.x * k, y: a.y * k });
/** "up" along a body segment leaning forward (to the left) by `a` degrees */
const up = (a: number): V => ({ x: -Math.sin(rad(a)), y: -Math.cos(rad(a)) });
/** "forward" (toward the desk) for a segment leaning by `a` degrees */
const fwd = (a: number): V => ({ x: -Math.cos(rad(a)), y: Math.sin(rad(a)) });
const dist = (a: V, b: V) => Math.hypot(a.x - b.x, a.y - b.y);

/** two-bone IK: elbow position for shoulder s, wrist w, bone lengths l1 & l2 (elbow bends down) */
function elbow(s: V, w: V, l1: number, l2: number): V {
  const d = Math.min(Math.max(dist(s, w), Math.abs(l1 - l2) + 1), l1 + l2 - 0.5);
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const ux = (w.x - s.x) / d, uy = (w.y - s.y) / d;
  const p = { x: s.x + ux * a, y: s.y + uy * a };
  const e1 = { x: p.x - uy * h, y: p.y + ux * h };
  const e2 = { x: p.x + uy * h, y: p.y - ux * h };
  return e1.y > e2.y ? e1 : e2;
}

/** smooth closed path through points (Catmull-Rom → cubic Bézier) */
function smooth(pts: V[]): string {
  const n = pts.length;
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d + " Z";
}

/* fixed anchors of the scene (viewBox 360 × 640, person faces left) */
const HIP: V = { x: 236, y: 430 };
const KNEE: V = { x: 156, y: 440 };
const ANKLE: V = { x: 150, y: 584 };
const TOE: V = { x: 118, y: 597 };
const WRIST: V = { x: 112, y: 357 };

function body(p: Pose) {
  const a1 = p.lean * 0.55, a2 = p.lean * 1.45; // lower / upper spine (upper curls more when slouching)
  const mid = add(HIP, mul(up(a1), 80));
  const c7 = add(mid, mul(up(a2), 80));
  const shoulder = add(add(c7, add(mul(fwd(a2), 15), mul(up(a2), -17))), { x: 0, y: -p.shrug });
  const neckTop = add(c7, mul(up(p.neck), 28));
  const head = add(neckTop, add(mul(up(p.neck), 26), mul(fwd(p.neck), 4)));
  const ear = add(head, add(mul(fwd(p.neck), -9), mul(up(p.neck), -3))); // ear sits toward the back of the head
  const elb = elbow(shoulder, WRIST, 78, 74);

  const hunch = p.lean * 0.3;
  const torso = smooth([
    add(HIP, { x: 24, y: 12 }), // seat, back
    add(HIP, add(mul(fwd(a1), -24), mul(up(a1), 18))),
    add(mid, mul(fwd((a1 + a2) / 2), -(23 + hunch * 0.6))),
    add(mid, add(mul(up(a2), 46), mul(fwd(a2), -(22 + hunch)))), // upper back curve
    add(c7, add(mul(fwd(a2), -8), mul(up(a2), -2))),
    add(c7, add(mul(fwd(a2), 8), { x: 0, y: -p.shrug * 0.7 })), // trapezius (rises with shrug)
    add(shoulder, add(mul(fwd(a2), 13), mul(up(a2), -6))), // front of shoulder
    add(mid, add(mul(up(a2), 40), mul(fwd(a2), 28))), // chest
    add(mid, mul(fwd((a1 + a2) / 2), 27)), // waist front
    add(HIP, add(mul(fwd(a1), 31), mul(up(a1), 10))), // belly
    add(HIP, { x: -26, y: 16 }), // lap
  ]);
  const rs = add(shoulder, add(mul(up(a2), 13), mul(fwd(a2), -2)));
  const ls = add(shoulder, add(mul(up(a2), -15), mul(fwd(a2), 4)));
  return { mid, c7, shoulder, rs, ls, neckTop, head, ear, elb, torso, a2 };
}

/* ---------------- component ---------------- */
export function LivePostureView({ timeLeft, onEnd }: { timeLeft: string; onEnd: () => void }) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const phase = PHASES[phaseIdx];
  const [showLines, setShowLines] = useState(true);

  // advance through the scripted phases
  useEffect(() => {
    const t = setTimeout(() => setPhaseIdx((i) => (i + 1) % PHASES.length), phase.ms);
    return () => clearTimeout(t);
  }, [phaseIdx, phase.ms]);

  // animate pose + score toward the current phase
  const [pose, setPose] = useState<Pose>(PHASES[0].pose);
  const [score, setScore] = useState(PHASES[0].score);
  const target = useRef({ pose: phase.pose, score: phase.score });
  target.current = { pose: phase.pose, score: phase.score };
  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, last = performance.now();
    const cur = { ...PHASES[0].pose, score: PHASES[0].score };
    const tick = (now: number) => {
      const k = reduce ? 1 : Math.min(1, ((now - last) / 1000) * 2.6);
      last = now;
      const t = target.current;
      cur.lean += (t.pose.lean - cur.lean) * k;
      cur.neck += (t.pose.neck - cur.neck) * k;
      cur.shrug += (t.pose.shrug - cur.shrug) * k;
      cur.score += (t.score - cur.score) * k;
      setPose({ lean: cur.lean, neck: cur.neck, shrug: cur.shrug });
      setScore(Math.round(cur.score));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // session average, sampled every second
  const samples = useRef({ sum: 0, n: 0 });
  const [avg, setAvg] = useState(PHASES[0].score);
  const scoreRef = useRef(score);
  scoreRef.current = score;
  useEffect(() => {
    const t = setInterval(() => {
      samples.current.sum += scoreRef.current;
      samples.current.n += 1;
      setAvg(Math.round(samples.current.sum / samples.current.n));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const b = useMemo(() => body(pose), [pose]);
  const torsoDeg = Math.round(pose.lean);
  const neckDeg = Math.round(pose.neck - pose.lean); // head forward, measured against the torso

  const flagged = (a: Area) => !!phase.flags?.includes(a);
  const lineColor = (a: Area) =>
    flagged(a) ? (phase.level === "poor" ? "var(--color-destructive)" : "var(--color-warning)") : "var(--color-primary)";

  return (
    <div>
      {/* ---------- live view ---------- */}
      <div className="relative h-[clamp(300px,calc(100dvh-330px),620px)] overflow-hidden bg-[#070b14]">
        {/* state tint */}
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: phase.level === "good" ? 0 : 1,
            background:
              phase.level === "poor"
                ? "radial-gradient(120% 80% at 50% 45%, color-mix(in oklab, var(--color-destructive) 30%, transparent), transparent 70%)"
                : "radial-gradient(120% 80% at 50% 45%, color-mix(in oklab, var(--color-warning) 22%, transparent), transparent 70%)",
          }}
        />

        <svg viewBox="0 150 360 466" className="absolute inset-0 h-full w-full" role="img" aria-label="Seated posture with angle lines">
          <defs>
            <radialGradient id="lp-room" cx="50%" cy="45%" r="45%">
              <stop offset="0" stopColor="#1b2840" />
              <stop offset="1" stopColor="#070b14" />
            </radialGradient>
            <linearGradient id="lp-skin" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f0c3a3" />
              <stop offset="1" stopColor="#c98d6c" />
            </linearGradient>
            <linearGradient id="lp-top" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#d6404a" />
              <stop offset="1" stopColor="#8f1d29" />
            </linearGradient>
            <linearGradient id="lp-pants" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2b3954" />
              <stop offset="1" stopColor="#18213a" />
            </linearGradient>
            <linearGradient id="lp-hair" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#3a2a22" />
              <stop offset="1" stopColor="#1a120e" />
            </linearGradient>
            <linearGradient id="lp-screen" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#8ec1ff" stopOpacity="0" />
              <stop offset="1" stopColor="#8ec1ff" stopOpacity="0.35" />
            </linearGradient>
            <filter id="lp-soft" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
            <filter id="lp-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* room */}
          <rect x="-400" y="0" width="1160" height="640" fill="url(#lp-room)" />
          <g opacity="0.5" filter="url(#lp-soft)">
            <rect x="196" y="70" width="120" height="150" rx="6" fill="#22324e" />
            <rect x="40" y="96" width="110" height="70" rx="6" fill="#1c2a44" />
          </g>
          <rect x="-400" y="600" width="1160" height="400" fill="#0a0f1a" />
          <ellipse cx="200" cy="604" rx="130" ry="10" fill="#000" opacity="0.45" filter="url(#lp-soft)" />

          {/* chair */}
          <g fill="#151d2e" stroke="#26324a" strokeWidth="1.5">
            <path d="M 284 452 L 300 300 Q 304 286 316 290 L 318 296 L 306 452 Z" />
            <rect x="186" y="444" width="112" height="14" rx="7" />
            <rect x="238" y="458" width="10" height="112" />
            <path d="M 186 590 L 300 590 L 296 580 L 190 580 Z" />
          </g>

          {/* desk + laptop */}
          <g>
            <rect x="-10" y="372" width="182" height="11" rx="2" fill="#2a3448" />
            <rect x="12" y="383" width="8" height="217" fill="#1d2536" />
            <rect x="150" y="383" width="8" height="217" fill="#1d2536" />
            <path d="M 34 300 L 44 366 L 50 366 L 40 298 Z" fill="#9aa7bd" />
            <path d="M 44 304 L 160 360 L 160 366 L 46 362 Z" fill="url(#lp-screen)" opacity="0.6" />
            <rect x="44" y="364" width="98" height="8" rx="2" fill="#b7c2d4" />
          </g>

          {/* far arm (behind the body) */}
          <path d={`M ${b.shoulder.x + 6} ${b.shoulder.y + 4} L ${b.elb.x + 8} ${b.elb.y - 2} L ${WRIST.x + 12} ${WRIST.y - 4}`}
            fill="none" stroke="#a0626b" strokeOpacity="0.55" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />

          {/* legs */}
          <path d={`M ${HIP.x} ${HIP.y + 6} L ${KNEE.x} ${KNEE.y}`} stroke="url(#lp-pants)" strokeWidth="38" strokeLinecap="round" />
          <path d={`M ${KNEE.x} ${KNEE.y} L ${ANKLE.x} ${ANKLE.y}`} stroke="url(#lp-pants)" strokeWidth="26" strokeLinecap="round" />
          <path d={`M ${ANKLE.x + 6} ${ANKLE.y + 4} L ${TOE.x} ${TOE.y}`} stroke="#0e121b" strokeWidth="14" strokeLinecap="round" />

          {/* torso */}
          <path d={b.torso} fill="url(#lp-top)" />
          <path d={b.torso} fill="none" stroke="#ff8a8f" strokeOpacity="0.18" strokeWidth="2" />

          {/* neck + head */}
          <path d={`M ${b.c7.x - 2} ${b.c7.y + 4} L ${b.neckTop.x} ${b.neckTop.y}`} stroke="url(#lp-skin)" strokeWidth="17" strokeLinecap="round" />
          <g transform={`translate(${b.head.x} ${b.head.y}) rotate(${-pose.neck * 0.75})`}>
            <path d="M 14 -16 C 30 -12 32 6 20 14 L 10 4 Z" fill="url(#lp-hair)" />
            <ellipse cx="0" cy="0" rx="23" ry="27" fill="url(#lp-skin)" />
            <path d="M -22 -6 C -28 -2 -28 4 -23 6 Z" fill="#d79f80" />
            <path d="M -21 13 C -16 22 -6 26 4 24" stroke="#b9805f" strokeOpacity="0.5" strokeWidth="2" fill="none" />
            <path d="M -24 -10 C -24 -30 2 -36 18 -24 C 26 -16 26 -2 22 6 C 16 -4 6 -10 -2 -12 C -10 -14 -18 -14 -24 -10 Z" fill="url(#lp-hair)" />
            <circle cx="24" cy="-22" r="10" fill="url(#lp-hair)" />
            <ellipse cx="6" cy="2" rx="4" ry="6" fill="#c48868" />
          </g>

          {/* near arm */}
          <path d={`M ${b.shoulder.x} ${b.shoulder.y} L ${b.elb.x} ${b.elb.y}`} stroke="url(#lp-top)" strokeWidth="18" strokeLinecap="round" />
          <path d={`M ${b.elb.x} ${b.elb.y} L ${WRIST.x} ${WRIST.y}`} stroke="url(#lp-skin)" strokeWidth="13" strokeLinecap="round" />
          <ellipse cx={WRIST.x - 9} cy={WRIST.y + 2} rx="11" ry="6" fill="url(#lp-skin)" />

          {/* ---------- angle lines (same marks as the running app) ---------- */}
          <g className="transition-opacity duration-300" opacity={showLines ? 1 : 0}>
            {/* vertical references */}
            <line x1={HIP.x} y1={HIP.y} x2={HIP.x} y2={HIP.y - 150} stroke="#fff" strokeOpacity="0.45" strokeDasharray="4 5" />
            <line x1={b.c7.x} y1={b.c7.y} x2={b.c7.x} y2={b.c7.y - 70} stroke="#fff" strokeOpacity="0.45" strokeDasharray="4 5" />

            {/* angle wedges between the vertical and each segment */}
            <Wedge at={HIP} to={b.c7} r={54} color={lineColor("torso")} />
            <Wedge at={b.c7} to={b.ear} r={30} color={lineColor("neck")} />

            {/* segments: Mid hip → C7 → Tragus, and the shoulder line RS – LS */}
            <line x1={HIP.x} y1={HIP.y} x2={b.c7.x} y2={b.c7.y} stroke={lineColor("torso")} strokeWidth="3" strokeLinecap="round" filter="url(#lp-glow)" />
            <line x1={b.c7.x} y1={b.c7.y} x2={b.ear.x} y2={b.ear.y} stroke={lineColor("neck")} strokeWidth="3" strokeLinecap="round" filter="url(#lp-glow)" />
            <line x1={b.rs.x} y1={b.rs.y} x2={b.ls.x} y2={b.ls.y} stroke={flagged("shoulders") ? lineColor("shoulders") : "#ffffff"} strokeOpacity={flagged("shoulders") ? 1 : 0.85} strokeWidth="2.5" strokeLinecap="round" />

            {/* joints: small solid dots */}
            {[
              { p: b.ear, hot: flagged("neck"), c: lineColor("neck"), label: "Tragus", dx: 9, dy: -6 },
              { p: b.c7, hot: flagged("neck") || flagged("torso"), c: flagged("neck") ? lineColor("neck") : lineColor("torso"), label: "C7", dx: 9, dy: 4 },
              { p: b.rs, hot: flagged("shoulders"), c: lineColor("shoulders"), label: "RS", dx: -19, dy: 2 },
              { p: b.ls, hot: flagged("shoulders"), c: lineColor("shoulders"), label: "LS", dx: -17, dy: 6 },
              { p: HIP, hot: flagged("torso"), c: lineColor("torso"), label: "Mid hip", dx: 9, dy: 14 },
            ].map((j) => (
              <g key={j.label}>
                {j.hot && <circle cx={j.p.x} cy={j.p.y} r="11" fill={j.c} opacity="0.25" />}
                <circle cx={j.p.x} cy={j.p.y} r="4.5" fill={j.hot ? j.c : "#ffffff"} stroke="#0b1220" strokeWidth="1.5" />
                <text x={j.p.x + j.dx} y={j.p.y + j.dy} fontSize="10" fontWeight="600" fontFamily="Quicksand, sans-serif" fill="#fff" stroke="#070b14" strokeWidth="3" paintOrder="stroke">{j.label}</text>
              </g>
            ))}

            {/* angle values beside their wedges */}
            <AngleBadge x={HIP.x - 34} y={HIP.y - 22} value={torsoDeg} color={flagged("torso") ? lineColor("torso") : "#fff"} big={flagged("torso")} />
            <AngleBadge x={b.c7.x + 10} y={b.c7.y - 38} value={neckDeg} color={flagged("neck") ? lineColor("neck") : "#fff"} big={flagged("neck")} />
            {flagged("shoulders") && (
              <AngleBadge x={b.ls.x - 46} y={b.ls.y + 14} value={14} color={lineColor("shoulders")} big />
            )}
          </g>
        </svg>

        {/* top row: live indicator + angle lines toggle */}
        <div className="absolute inset-x-3.5 top-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] font-medium text-white/70">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
            </span>
            Live
            <span className="text-white/30">·</span>
            <span className="text-white/50">Tilt 10°</span>
          </div>
          <button
            type="button"
            onClick={() => setShowLines((v) => !v)}
            className="rounded-full border border-white/12 bg-black/45 px-2.5 py-1 text-[10.5px] font-medium text-white/80 backdrop-blur-md"
          >
            {showLines ? "Hide angle lines" : "Show angle lines"}
          </button>
        </div>

        {/* coaching card sits over the legs, so head and back stay in view */}
        {phase.banner && (
          <>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#070b14]/90 via-[#070b14]/50 to-transparent" />
            <div className="absolute inset-x-3 bottom-3">
              <CoachBanner key={phase.key} {...phase.banner} />
            </div>
          </>
        )}
      </div>

      {/* ---------- status bar ---------- */}
      <div className="space-y-3 border-t border-white/[0.06] px-4 pb-4 pt-3">
        <div className="flex items-center gap-3">
          <SegmentGauge value={score} level={phase.level} />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span className={cn("text-[22px] font-semibold leading-none tracking-tight transition-colors", LEVEL_TEXT[phase.level])}>{phase.status.word}</span>
              <span className="text-[11px] text-muted-foreground">Avg <b className="font-semibold text-foreground tabular-nums">{avg}</b></span>
            </div>
            <div className="mt-1 line-clamp-2 text-[11px] leading-snug text-muted-foreground">{phase.status.note}</div>
          </div>
          <div className="shrink-0 border-l border-white/[0.08] pl-3 text-right leading-none">
            <div className="text-[9px] font-medium uppercase tracking-[0.1em] text-muted-foreground">Time left</div>
            <div className="mt-1.5 text-[20px] font-semibold tabular-nums">{timeLeft}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onEnd}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-destructive/45 bg-destructive/12 text-[13.5px] font-semibold text-destructive transition hover:bg-destructive/20 active:scale-[.99]"
        >
          <Square className="h-3 w-3 fill-current" /> Stop
        </button>
      </div>
    </div>
  );
}

/** half-ring of segments; filled up to the score, tinted by posture level */
function SegmentGauge({ value, level }: { value: number; level: Level }) {
  const n = 10, filled = Math.round((Math.max(0, Math.min(100, value)) / 100) * n);
  const color = level === "good" ? "var(--color-success)" : level === "adjust" ? "var(--color-warning)" : "var(--color-destructive)";
  const cx = 34, cy = 34, r = 29, gap = 4;
  const seg = (k: number) => {
    const a0 = 180 + (k * 180) / n + gap / 2, a1 = 180 + ((k + 1) * 180) / n - gap / 2;
    const p = (a: number) => [cx + r * Math.cos(rad(a)), cy + r * Math.sin(rad(a))];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  };
  return (
    <div className="relative h-[40px] w-[68px] shrink-0" aria-label={`Score ${value} of 100`}>
      <svg viewBox="0 0 68 38" className="h-[38px] w-[68px]" aria-hidden>
        {Array.from({ length: n }, (_, k) => (
          <path key={k} d={seg(k)} fill="none" strokeWidth="6" stroke={k < filled ? color : "var(--color-muted)"} style={{ transition: "stroke 400ms ease" }} />
        ))}
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center text-[17px] font-bold leading-none tabular-nums">{value}</div>
    </div>
  );
}

/** filled sector between the vertical (up) and the direction from `at` to `to` */
function Wedge({ at, to, r, color }: { at: V; to: V; r: number; color: string }) {
  const ang = Math.atan2(to.x - at.x, -(to.y - at.y)); // 0 = straight up, negative = leaning left
  if (Math.abs(ang) < 0.02) return null;
  const end = { x: at.x + r * Math.sin(ang), y: at.y - r * Math.cos(ang) };
  const sweep = ang < 0 ? 0 : 1;
  return (
    <path d={`M ${at.x} ${at.y} L ${at.x} ${at.y - r} A ${r} ${r} 0 0 ${sweep} ${end.x.toFixed(1)} ${end.y.toFixed(1)} Z`}
      fill={color} fillOpacity="0.34" stroke={color} strokeOpacity="0.6" strokeWidth="1" />
  );
}

function AngleBadge({ x, y, value, color, big }: { x: number; y: number; value: number; color: string; big?: boolean }) {
  return (
    <text
      x={x}
      y={y}
      fontFamily="Quicksand, sans-serif"
      fontWeight="700"
      fontSize={big ? 18 : 12.5}
      fill={color}
      stroke="#070b14"
      strokeWidth="3"
      paintOrder="stroke"
    >
      {value}°
    </text>
  );
}

function CoachBanner({ tone, kicker, title, note, more, fixed }: NonNullable<Phase["banner"]>) {
  const t = {
    warn: { color: "var(--color-warning)", icon: Eye },
    bad: { color: "var(--color-destructive)", icon: AlertTriangle },
    ok: { color: "var(--color-success)", icon: CheckCircle2 },
  }[tone];
  const Icon = t.icon;
  if (tone === "ok") {
    // positive feedback: a light, compact pill instead of a full card
    return (
      <div className="flex justify-center">
        <div className="inline-flex max-w-full items-center gap-2.5 rounded-full border border-success/30 bg-[color-mix(in_oklab,var(--color-success)_16%,#06120e)]/85 py-1.5 pl-1.5 pr-4 shadow-[0_10px_28px_-14px_var(--color-success)] backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
            <Check className="h-4 w-4" strokeWidth={3} />
          </span>
          <span className="truncate text-[14px] font-medium text-white">{title}</span>
          {note && <span className="hidden shrink-0 text-[11.5px] text-white/55 min-[360px]:inline">{note}</span>}
        </div>
      </div>
    );
  }
  return (
    <div
      className="flex items-start gap-2.5 rounded-2xl border-[1.5px] border-dashed bg-black/75 px-3.5 py-3 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300"
      style={{
        borderColor: `color-mix(in oklab, ${t.color} 85%, transparent)`,
        boxShadow: `0 12px 32px -14px color-mix(in oklab, ${t.color} 55%, transparent)`,
      }}
    >
      <Icon className="mt-[2px] h-5 w-5 shrink-0" style={{ color: t.color }} strokeWidth={1.9} />
      <div className="min-w-0">
        {kicker && (
          <div className="text-[9.5px] font-medium uppercase leading-tight tracking-[0.04em]" style={{ color: t.color }}>
            {kicker}
          </div>
        )}
        <div className={cn("text-[clamp(15px,2.1dvh,18px)] font-normal leading-[1.25] tracking-[-0.005em] text-white", kicker && "mt-1")}>{title}</div>
        {note && <div className="mt-1 text-[11.5px] text-white/55">{note}</div>}
        {more && <div className="mt-1.5 text-[11.5px] text-white/80">{more}</div>}
        {fixed && (
          <div className="mt-1.5 flex items-center gap-1 text-[11.5px] text-success">
            <CheckCircle2 className="h-3.5 w-3.5" /> {fixed}
          </div>
        )}
      </div>
    </div>
  );
}
