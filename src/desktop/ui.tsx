import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared building blocks for the desktop layouts: one card style, one title style, one button set. */

export function Panel({ title, icon, action, children, className, bodyClass }: {
  title?: ReactNode; icon?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; bodyClass?: string;
}) {
  return (
    <section className={cn("rounded-[24px] border border-white/[0.06] bg-[#0d1320]/80 shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]", className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 px-6 pt-5 max-[559px]:px-5">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">{icon}{title}</h2>
          {action}
        </header>
      )}
      <div className={cn("p-6 max-[559px]:px-5", (title || action) && "pt-4", bodyClass)}>{children}</div>
    </section>
  );
}

export function PageHead({ title, subtitle, back, actions }: { title: ReactNode; subtitle?: ReactNode; back?: () => void; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div className="flex items-center gap-3">
        {back && (
          <button onClick={back} aria-label="Back" className={btn.icon}>
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
        )}
        <div>
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-[13.5px] text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export const Eyebrow = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground", className)}>{children}</div>
);

const focus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60";
export const btn = {
  primary: cn("inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-6 text-[14px] font-semibold text-white shadow-[0_12px_30px_-14px] shadow-primary transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50", focus),
  outline: cn("inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/10 px-4 text-[13px] font-semibold text-foreground/85 transition hover:border-primary/50 hover:bg-primary/10 hover:text-foreground active:scale-[0.98]", focus),
  ghost: cn("inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-primary transition hover:bg-primary/10", focus),
  icon: cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.08] text-foreground/80 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground active:scale-95", focus),
};

/** wide desktop content column */
export const Page = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("mx-auto w-full max-w-[1180px]", className)}>{children}</div>
);
