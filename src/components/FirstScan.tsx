import { Link } from "@tanstack/react-router";
import { ScanLine } from "lucide-react";
import firstScan from "@/assets/first-scan.png";

/** Dashboard before the first posture scan: one welcome card and a single way in. */
export function FirstScan() {
  return (
    <section className="relative mx-auto flex max-w-[880px] flex-col items-center overflow-hidden rounded-[28px] border border-white/[0.07] bg-gradient-to-b from-[#0d1b33] to-card px-6 pb-7 pt-10 text-center">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-6 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <img src={firstScan} alt="" className="relative h-44 w-44 rounded-full shadow-[0_24px_60px_-24px] shadow-primary/70 ring-1 ring-white/10 fold:h-52 fold:w-52" />
      <h1 className="relative mt-7 text-[22px] font-semibold tracking-tight">Welcome to Poscura!</h1>
      <p className="relative mt-3 text-[15px] text-foreground/80">Ready for better Posture?</p>
      <p className="relative mt-1.5 max-w-[520px] text-[14px] leading-relaxed text-muted-foreground">Start with your first scan to unlock personalized insights and improvement plans</p>
      <Link to="/posture-monitor"
        className="relative mt-7 inline-flex h-12 w-full max-w-[280px] items-center justify-center gap-2 rounded-full px-8 bg-gradient-to-r from-primary to-secondary text-[15px] font-semibold text-white shadow-[0_14px_32px_-14px] shadow-primary transition hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
        <ScanLine className="h-[18px] w-[18px]" /> Run monitor
      </Link>
    </section>
  );
}
