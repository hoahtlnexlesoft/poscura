import { cloneElement, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Check, CheckCircle2, Clock, Eye, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFitFrame } from "@/hooks/useFitFrame";

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
const BETTER = { tone: "ok" as const, title: "Better. Keep it there." };

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
  return e1.x > e2.x ? e1 : e2; // elbow points back, as when resting hands on the thighs
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
const WRIST: V = { x: 176, y: 422 };

function body(p: Pose) {
  const a1 = p.lean * 0.55, a2 = p.lean * 1.45; // lower / upper spine (upper curls more when slouching)
  const mid = add(HIP, mul(up(a1), 80));
  const c7 = add(mid, mul(up(a2), 80));
  const shoulder = add(add(c7, add(mul(fwd(a2), 15), mul(up(a2), -17))), { x: 0, y: -p.shrug });
  const neckTop = add(c7, mul(up(p.neck), 15));
  const head = add(neckTop, add(mul(up(p.neck), 19), mul(fwd(p.neck), 3)));
  // tragus: the ear point drawn in the head's own (rotated) frame
  const th = rad(-p.neck * 0.6);
  const ear = add(head, { x: 7 * Math.cos(th) - 1 * Math.sin(th), y: 7 * Math.sin(th) + 1 * Math.cos(th) });
  const wrist = add(WRIST, { x: -p.lean * 0.95, y: p.lean * 0.12 }); // leaning forward slides the hand toward the knee
  const elb = elbow(shoulder, wrist, 74, 72);

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
  return { mid, c7, shoulder, rs, ls, neckTop, head, ear, elb, wrist, torso, a2 };
}

/* ---------------- component ---------------- */
export function LivePostureView({ timeLeft, onEnd }: { timeLeft: string; onEnd: () => void }) {
  const statusRef = useRef<HTMLDivElement>(null);
  const { wrapRef, box } = useFitFrame(statusRef);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const phase = PHASES[phaseIdx];
  const showLines = true; // angle lines are always shown

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
    const vel = { lean: 0, neck: 0, shrug: 0 };
    const W = 3.2; // spring stiffness (rad/s): ~1 s to settle, eases in and out
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = target.current;
      (["lean", "neck", "shrug"] as const).forEach((key) => {
        if (reduce) { cur[key] = t.pose[key]; return; }
        const acc = W * W * (t.pose[key] - cur[key]) - 2 * W * vel[key]; // critically damped
        vel[key] += acc * dt;
        cur[key] += vel[key] * dt;
      });
      cur.score += (t.score - cur.score) * Math.min(1, dt * 2.5);
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

  const scene = (
        <svg viewBox="58 136 268 476" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" role="img" aria-label="Seated posture with angle lines">
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
              <stop offset="0" stopColor="#9a3240" />
              <stop offset="1" stopColor="#5e1a24" />
            </linearGradient>
            <linearGradient id="lp-pants" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#87303b" />
              <stop offset="1" stopColor="#561821" />
            </linearGradient>
            <linearGradient id="lp-shade" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0" stopColor="#000" stopOpacity="0.28" />
              <stop offset="0.45" stopColor="#000" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lp-hair" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#3b2c24" />
              <stop offset="1" stopColor="#1c1410" />
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
          {/* ceiling with light panels (seen at an angle, like a desk camera) */}
          <path d="M -400 0 L 760 0 L 760 150 L -400 190 Z" fill="#141c2c" />
          <g fill="#dfe8f6">
            <path d="M 70 92 L 132 88 L 128 104 L 64 108 Z" opacity="0.55" />
            <path d="M 196 82 L 262 78 L 262 93 L 194 97 Z" opacity="0.5" />
            <path d="M 300 74 L 360 71 L 362 85 L 300 88 Z" opacity="0.4" />
            <path d="M 0 126 L 46 123 L 40 136 L -8 139 Z" opacity="0.35" />
            <path d="M 150 128 L 206 125 L 204 137 L 146 140 Z" opacity="0.32" />
          </g>
          <g filter="url(#lp-soft)" opacity="0.45">
            <ellipse cx="98" cy="98" rx="40" ry="10" fill="#9fc2ff" />
            <ellipse cx="228" cy="88" rx="40" ry="10" fill="#9fc2ff" />
          </g>
          {/* back wall: blurred posters, a window strip and a desk partition */}
          <g filter="url(#lp-soft)" opacity="0.7">
            <rect x="150" y="196" width="150" height="70" rx="4" fill="#1d3a6b" />
            <rect x="160" y="208" width="64" height="8" rx="3" fill="#7fa8e6" opacity="0.5" />
            <rect x="160" y="224" width="96" height="6" rx="3" fill="#7fa8e6" opacity="0.35" />
            <rect x="-60" y="190" width="150" height="56" rx="4" fill="#2b3f5e" />
            <rect x="310" y="186" width="90" height="90" rx="4" fill="#24324a" />
          </g>
          <rect x="-400" y="300" width="1160" height="22" fill="#1a2335" opacity="0.9" />
          <rect x="-400" y="600" width="1160" height="400" fill="#0a0f1a" />
          <ellipse cx="200" cy="604" rx="130" ry="10" fill="#000" opacity="0.45" filter="url(#lp-soft)" />

          {/* saddle stool: cream seat on a single gas lift */}
          <g>
            <rect x="238" y="466" width="9" height="108" fill="#8d96a6" />
            <rect x="236" y="500" width="13" height="26" rx="3" fill="#2a2f38" />
            <path d="M 242 572 L 194 590 M 243 572 L 292 590 M 243 572 L 250 594" stroke="#2a2f38" strokeWidth="7" strokeLinecap="round" />
            <circle cx="194" cy="594" r="5" fill="#1b1f26" /><circle cx="292" cy="594" r="5" fill="#1b1f26" /><circle cx="250" cy="598" r="5" fill="#1b1f26" />
            <path d="M 184 446 C 190 436 212 440 240 440 C 268 440 290 432 300 440 C 306 450 298 464 280 466 C 254 470 214 470 196 464 C 184 460 180 452 184 446 Z" fill="#e8e1d2" />
            <path d="M 188 458 C 214 466 262 467 296 452" stroke="#b9b09d" strokeWidth="2" fill="none" />
          </g>

          {/* desk + monitor */}
          <g>
            <rect x="-10" y="372" width="182" height="11" rx="2" fill="#2a3448" />
            <rect x="12" y="383" width="8" height="217" fill="#1d2536" />
            <rect x="150" y="383" width="8" height="217" fill="#1d2536" />
            <rect x="58" y="344" width="7" height="28" fill="#3a4357" />
            <rect x="40" y="368" width="44" height="5" rx="2" fill="#3a4357" />
            <rect x="0" y="262" width="122" height="84" rx="4" fill="#0d1320" stroke="#3a4357" strokeWidth="3" />
            <rect x="6" y="268" width="110" height="72" rx="2" fill="url(#lp-screen)" opacity="0.7" />
          </g>

          {/* torso (shirt) */}
          <path d={b.torso} fill="url(#lp-top)" />
          <path d={b.torso} fill="none" stroke="#ff9aa0" strokeOpacity="0.16" strokeWidth="1.5" />
          {/* shirt shading along the back */}
          <path d={b.torso} fill="url(#lp-shade)" />
          {/* loose tee: soft folds across the back and above the waist */}
          <g stroke="#3a0e15" strokeOpacity="0.28" strokeWidth="2" fill="none" strokeLinecap="round">
            <path d={`M ${b.mid.x + 14} ${b.mid.y - 30} q -8 14 -2 30`} />
            <path d={`M ${b.mid.x - 6} ${b.mid.y + 26} q 14 8 30 4`} />
            <path d={`M ${b.mid.x - 14} ${b.mid.y + 40} q 16 6 34 0`} />
          </g>

          {/* legs: loose shorts to just above the knee, calves, socks and sneakers */}
          <path d={`M ${KNEE.x - 8} ${KNEE.y - 6} C ${KNEE.x - 16} ${KNEE.y + 40}, ${ANKLE.x - 12} ${ANKLE.y - 50}, ${ANKLE.x - 7} ${ANKLE.y - 4} L ${ANKLE.x + 9} ${ANKLE.y - 4} C ${ANKLE.x + 14} ${ANKLE.y - 60}, ${KNEE.x + 26} ${KNEE.y + 30}, ${KNEE.x + 16} ${KNEE.y - 8} Z`} fill="url(#lp-skin)" />
          <path d={`M ${HIP.x + 4} ${HIP.y + 4} L ${KNEE.x} ${KNEE.y}`} stroke="url(#lp-skin)" strokeWidth="38" strokeLinecap="round" />
          <path d={`M ${HIP.x + 6} ${HIP.y + 2} L ${HIP.x + (KNEE.x - HIP.x) * 0.8} ${HIP.y + (KNEE.y - HIP.y) * 0.8}`} stroke="url(#lp-pants)" strokeWidth="46" strokeLinecap="round" />
          <path d={`M ${HIP.x + (KNEE.x - HIP.x) * 0.8 - 2} ${HIP.y + (KNEE.y - HIP.y) * 0.8 - 22} L ${HIP.x + (KNEE.x - HIP.x) * 0.8 + 3} ${HIP.y + (KNEE.y - HIP.y) * 0.8 + 22}`} stroke="#4a121a" strokeOpacity="0.5" strokeWidth="2" />
          <path d={`M ${HIP.x - 20} ${HIP.y - 4} Q ${HIP.x - 50} ${HIP.y + 6} ${HIP.x - 66} ${HIP.y + 2}`} stroke="#4a121a" strokeOpacity="0.35" strokeWidth="2" fill="none" />
          <path d={`M ${HIP.x + 18} ${HIP.y - 12} Q ${HIP.x - 10} ${HIP.y - 18} ${HIP.x - 38} ${HIP.y - 8}`} stroke="#3a0e15" strokeOpacity="0.55" strokeWidth="3" fill="none" strokeLinecap="round" />
          <rect x={ANKLE.x - 8} y={ANKLE.y - 10} width="18" height="12" rx="3" fill="#e9ebef" />
          <path d={`M ${ANKLE.x + 12} ${ANKLE.y - 2} C ${ANKLE.x - 2} ${ANKLE.y - 6}, ${TOE.x - 8} ${TOE.y - 8}, ${TOE.x - 10} ${TOE.y + 1} L ${ANKLE.x + 13} ${ANKLE.y + 13} Z`} fill="#c9ccd3" />
          <path d={`M ${TOE.x - 10} ${TOE.y + 1} L ${ANKLE.x + 13} ${ANKLE.y + 13}`} stroke="#8a8f99" strokeWidth="3" />

          {/* neck */}
          <path d={`M ${b.c7.x - 3} ${b.c7.y + 6} L ${b.neckTop.x} ${b.neckTop.y}`} stroke="url(#lp-skin)" strokeWidth="23" strokeLinecap="round" />
          <path d={`M ${b.c7.x - 14} ${b.c7.y + 4} Q ${b.c7.x - 4} ${b.c7.y + 12} ${b.c7.x + 8} ${b.c7.y + 2}`} stroke="#4a121a" strokeWidth="5" fill="none" strokeLinecap="round" />

          {/* head — side profile facing the desk */}
          <g transform={`translate(${b.head.x} ${b.head.y}) rotate(${-pose.neck * 0.6})`}>
            <path
              d="M 2 -30 C 16 -30 25 -19 25 -5 C 25 7 20 15 13 20 L 4 23 C -2 27 -9 28 -14 26 C -18 25 -20 22 -19 19 C -21 17 -21 15 -19.5 13.5 C -21.5 12 -21.5 10 -20 8.5 C -21 7 -21.5 5.5 -22 4.5 C -25 3.5 -28 1.5 -27.5 -0.5 C -27 -3 -23.5 -6 -22 -9 C -23 -12 -23 -16 -21.5 -21 C -18 -27 -9 -30 2 -30 Z"
              fill="url(#lp-skin)"
            />
            {/* jaw & cheek shading */}
            <path d="M 10 18 C 2 22 -8 24 -14 22" stroke="#b3785a" strokeOpacity="0.35" strokeWidth="2" fill="none" />
            {/* ear */}
            <ellipse cx="9" cy="0" rx="5" ry="7.5" fill="#e3ad8c" />
            <path d="M 10 -4 C 7 -3 7 3 10 4" stroke="#b9805f" strokeWidth="1.4" fill="none" />
            {/* stubble along the jaw and chin */}
            <path d="M 12 14 C 6 22 -4 26 -14 26 C -18 25 -20 22 -19 19 C -14 21 -6 20 2 16 C 6 12 10 8 12 4 Z" fill="#3a2a22" opacity="0.18" />
            {/* eye, brow, lips */}
            <path d="M -18 -6 C -16 -7.8 -13 -7.8 -11.5 -6.2 C -13 -5 -16 -5 -18 -6 Z" fill="#2a1c17" />
            <path d="M -20.5 -11.5 C -17 -14 -13 -13.8 -9.5 -12.4" stroke="#2e211b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M -20.5 11 C -18.8 11.6 -17.4 11.6 -16.4 11" stroke="#9a5c4c" strokeWidth="1.3" fill="none" strokeLinecap="round" />
            {/* short cropped hair, sideburn in front of the ear */}
            <path d="M -21 -18 C -20 -28 -8 -35 6 -34 C 20 -33 28 -22 27 -8 C 26.5 0 25 6 22 10 C 21 4 18 -2 15 -5 C 13 -8 8 -11 4 -11 L 3 -2 C 1 -3 0 -8 -1 -12 C -7 -15 -14 -16 -21 -18 Z" fill="url(#lp-hair)" />
          </g>

          {/* near arm: hand resting on the thigh */}
          <path d={`M ${b.shoulder.x} ${b.shoulder.y} L ${b.elb.x} ${b.elb.y}`} stroke="url(#lp-skin)" strokeWidth="19" strokeLinecap="round" />
          <path d={`M ${b.elb.x} ${b.elb.y} L ${b.wrist.x} ${b.wrist.y}`} stroke="url(#lp-skin)" strokeWidth="16" strokeLinecap="round" />
          {/* short t-shirt sleeve over the upper arm */}
          <path d={`M ${b.shoulder.x} ${b.shoulder.y - 2} L ${b.shoulder.x + (b.elb.x - b.shoulder.x) * 0.5} ${b.shoulder.y + (b.elb.y - b.shoulder.y) * 0.5}`} stroke="url(#lp-top)" strokeWidth="27" strokeLinecap="round" />
          <path d={`M ${b.shoulder.x + (b.elb.x - b.shoulder.x) * 0.47} ${b.shoulder.y + (b.elb.y - b.shoulder.y) * 0.47} L ${b.shoulder.x + (b.elb.x - b.shoulder.x) * 0.52} ${b.shoulder.y + (b.elb.y - b.shoulder.y) * 0.52}`} stroke="#4a121a" strokeOpacity="0.6" strokeWidth="27" />
          <path d={`M ${b.wrist.x + 4} ${b.wrist.y - 6} C ${b.wrist.x - 10} ${b.wrist.y - 8}, ${b.wrist.x - 24} ${b.wrist.y - 3}, ${b.wrist.x - 25} ${b.wrist.y + 3} C ${b.wrist.x - 22} ${b.wrist.y + 8}, ${b.wrist.x - 6} ${b.wrist.y + 9}, ${b.wrist.x + 4} ${b.wrist.y + 6} Z`} fill="url(#lp-skin)" />

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
              { p: b.ear, hot: flagged("neck"), c: lineColor("neck"), label: "Tragus", dx: 10, dy: -9 },
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
            <AngleBadge x={b.c7.x + 14} y={b.c7.y - 14} value={neckDeg} color={flagged("neck") ? lineColor("neck") : "#fff"} big={flagged("neck")} />
            {flagged("shoulders") && (
              <AngleBadge x={b.ls.x - 46} y={b.ls.y + 14} value={14} color={lineColor("shoulders")} big />
            )}
          </g>
        </svg>
  );

  return (
    <div>
      {/* ---------- live view ---------- */}
      {/* 9:16 camera frame, sized by the screen height so the status bar stays in view */}
      <div ref={wrapRef} className="relative isolate flex justify-center overflow-hidden bg-[#04070d]">
        {/* blurred copy of the camera fills the space beside the 9:16 frame */}
        <div aria-hidden className="pointer-events-none absolute -inset-6 -z-10 scale-110 opacity-80 blur-2xl saturate-[1.3]">
          {cloneElement(scene, { viewBox: "0 120 400 500", preserveAspectRatio: "xMidYMid slice", role: undefined, "aria-label": undefined })}
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[#04070d]/40" />
      <div
        className="@container relative aspect-[9/16] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_0_40px_rgba(0,0,0,0.55)] max-w-full overflow-hidden bg-[#070b14]"
        style={box ? { width: box.w, height: box.h } : { width: "min(100%, calc(max(320px, 100dvh - 290px) * 9 / 16))" }}
      >
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

        {scene}

        {/* coaching card over the empty room above the head */}
        {phase.banner && (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#070b14]/80 to-transparent" />
            <div className="absolute inset-x-3 top-3">
              <CoachBanner key={phase.key} {...phase.banner} />
            </div>
          </>
        )}
      </div>
      </div>

      {/* ---------- status bar ---------- */}
      <div ref={statusRef} className="@container border-t border-white/[0.06]">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-4 py-3 @max-[360px]:px-3">
          <div className="min-w-0">
            <div className="text-[9px] font-medium uppercase tracking-[0.1em] text-muted-foreground">Posture now</div>
            <div className={cn("mt-1.5 text-[20px] font-semibold leading-none tracking-tight transition-colors", LEVEL_TEXT[phase.level])}>{phase.status.word}</div>
            <div className="mt-1 truncate text-[11px] text-muted-foreground @max-[400px]:hidden!">{phase.status.note}</div>
          </div>
          <button
            type="button"
            onClick={onEnd}
            aria-label="Stop monitoring"
            title="Stop monitoring"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-destructive/50 bg-destructive/15 text-destructive shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-destructive)_8%,transparent)] transition hover:bg-destructive/25 active:scale-95"
          >
            <Square className="h-4 w-4 fill-current" />
          </button>
          <div className="text-right leading-none">
            <div className="text-[9px] font-medium uppercase tracking-[0.1em] text-muted-foreground">Time left</div>
            <div className="mt-1.5 text-[20px] font-semibold tabular-nums">{timeLeft}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">Session avg <b className="font-semibold text-foreground tabular-nums">{avg}</b></div>
          </div>
        </div>
      </div>
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
          <span className="shrink-0 whitespace-nowrap text-[14px] font-medium text-white">{title}</span>
          {note && <span className="min-w-0 truncate text-[11.5px] text-white/55">{note}</span>}
        </div>
      </div>
    );
  }
  // "Area · Issue 14°" → area, issue, degrees
  const [area, issueRaw] = (kicker ?? "").split(" · ");
  const deg = issueRaw?.match(/(\d+)°/)?.[1];
  const issue = issueRaw?.replace(/\s*\d+°/, "");
  return (
    <div
      className="relative overflow-hidden rounded-[18px] backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-300"
      style={{
        background: `linear-gradient(100deg, color-mix(in oklab, ${t.color} 20%, #0a0f19) 0%, rgba(10,15,25,.86) 55%)`,
        boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${t.color} 30%, rgba(255,255,255,.06)), 0 16px 36px -18px color-mix(in oklab, ${t.color} 60%, transparent)`,
      }}
    >
      <span aria-hidden className="absolute inset-y-3 left-0 w-[3px] rounded-r-full" style={{ background: t.color }} />
      <div className="py-3 pl-4 pr-3.5 @max-[300px]:py-2.5 @max-[300px]:pl-3.5">
        {issue && (
          <div className="flex items-center gap-2">
            <span
              className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full @max-[300px]:hidden!"
              style={{ background: `color-mix(in oklab, ${t.color} 22%, transparent)`, color: t.color }}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
            </span>
            <span className="shrink-0 whitespace-nowrap text-[12.5px] font-semibold" style={{ color: t.color }}>{issue}</span>
            {area && <span className="min-w-0 truncate text-[11px] text-white/40 @max-[340px]:hidden!">{area}</span>}
            {deg && (
              <span className="ml-auto shrink-0 text-[17px] font-bold leading-none tabular-nums" style={{ color: t.color }}>
                {deg}°
              </span>
            )}
          </div>
        )}
        <p className="mt-2 text-[clamp(15px,2dvh,17px)] font-medium leading-snug tracking-[-0.01em] text-white @max-[300px]:mt-1.5 @max-[300px]:text-[13.5px]!">{title}</p>
        {note && <p className="mt-1 text-[11.5px] text-white/55">{note}</p>}
        {(more || fixed) && (
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/[0.07] pt-2 text-[11.5px]">
            {fixed && (
              <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 className="h-3.5 w-3.5" /> {fixed}</span>
            )}
            {more && <span className="text-white/60">{more}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
