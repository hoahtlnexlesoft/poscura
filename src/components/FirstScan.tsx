import { Link } from "@tanstack/react-router";
import { ScanLine } from "lucide-react";
import { FirstScanArt } from "@/components/EmptyArt";

/** Dashboard before the first posture scan: one welcome card and a single way in. */
export function FirstScan() {
  return (
    <section className="relative mx-auto flex min-h-[calc(100dvh-180px)] max-w-[880px] flex-col items-center justify-center px-6 py-10 text-center">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-[62%] rounded-full bg-primary/10 blur-3xl" />
      {/* soft light behind the figure (no hard disc), so the dark suit and chair still read on the dark page */}
      <div className="relative flex items-center justify-center">
        <span aria-hidden className="absolute h-[190px] w-[190px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-primary)_30%,transparent)_0%,color-mix(in_oklab,var(--color-primary)_10%,transparent)_45%,transparent_70%)]" />
        <FirstScanArt className="relative w-[180px] drop-shadow-[0_18px_30px_rgba(0,0,0,.45)] fold:w-[200px]" />
      </div>
      <h1 className="relative mt-6 text-[20px] font-semibold tracking-tight">Welcome to Poscura!</h1>
      <p className="relative mt-2 text-[14px] text-foreground/80">Ready for better Posture?</p>
      <p className="relative mt-1 max-w-[420px] text-[13px] leading-relaxed text-muted-foreground">Start with your first scan to unlock personalized insights and improvement plans</p>
      <Link to="/posture-monitor"
        className="relative mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 bg-gradient-to-r from-primary to-secondary text-[13.5px] font-semibold text-white shadow-[0_10px_24px_-14px] shadow-primary transition hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
        <ScanLine className="h-[18px] w-[18px]" /> Run monitor
      </Link>
    </section>
  );
}
