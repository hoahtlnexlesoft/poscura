import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, Check, Gift, Minus, Plus, Timer } from "lucide-react";
import logo from "@/assets/poscura-logo.png";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({ component: OnboardingPage });

type Gender = "female" | "male" | "others";
type Duration = "30" | "60" | "custom";

const STEPS = [
  { title: "Your profile", hint: "Basics that shape your plan" },
  { title: "Tracking preferences", hint: "How you'd like to be monitored" },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<Gender>("female");
  const [dob, setDob] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [occupation, setOccupation] = useState("Office Worker");
  const [years, setYears] = useState("Under 1 year");
  const [hoursPerWeek, setHoursPerWeek] = useState("Under 20 h");

  // Step 2
  const [duration, setDuration] = useState<Duration>("custom");
  const [customHours, setCustomHours] = useState(2);
  const [status, setStatus] = useState("");
  const [referral, setReferral] = useState("");

  const next = () => {
    if (step === 1) {
      setStep(2);
      window.scrollTo({ top: 0 });
    } else navigate({ to: "/posture-monitor" });
  };

  return (
    <div className="relative mx-auto w-full pb-24 fold:grid fold:max-w-[980px] fold:grid-cols-[minmax(240px,0.8fr)_1.4fr] land:grid-cols-2 fold:items-start fold:gap-8 hinge-split land:gap-x-6 fold:pb-6">
      {/* ---------- side / header ---------- */}
      <aside className="fold:sticky fold:top-4 fold:glass-card fold:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="h-8 w-8" />
            <span className="text-[15px] font-semibold tracking-tight">Poscura</span>
          </div>
          <span className="text-xs font-medium text-muted-foreground fold:hidden">Step {step} of 2</span>
        </div>

        {/* progress (phone) */}
        <div className="mt-4 grid grid-cols-2 gap-1.5 fold:hidden">
          {[1, 2].map((n) => (
            <span key={n} className={cn("h-1 rounded-full transition-colors", n <= step ? "bg-gradient-to-r from-primary to-secondary" : "bg-muted")} />
          ))}
        </div>

        <h1 className="mt-5 text-[26px] font-bold leading-tight tracking-tight fold:mt-6 fold:text-[28px]">
          {step === 1 ? (
            <>Welcome to <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Poscura</span></>
          ) : (
            "Tracking preferences"
          )}
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {step === 1 ? "Let's set up your profile to personalise your posture plan." : "Tell us how you'd like to track your posture."}
        </p>

        {/* stepper (foldable) */}
        <ol className="mt-6 hidden space-y-1 fold:block">
          {STEPS.map((s, i) => {
            const n = i + 1, done = n < step, on = n === step;
            return (
              <li key={s.title}>
                <button
                  type="button"
                  disabled={n > step}
                  onClick={() => setStep(n as 1 | 2)}
                  className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition", on ? "bg-primary/10" : "hover:bg-muted/40 disabled:hover:bg-transparent")}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      done ? "bg-success text-success-foreground" : on ? "bg-gradient-to-br from-primary to-secondary text-white" : "border border-border text-muted-foreground",
                    )}
                  >
                    {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : n}
                  </span>
                  <span className="min-w-0">
                    <span className={cn("block text-sm font-semibold", !on && !done && "text-muted-foreground")}>{s.title}</span>
                    <span className="block text-[11px] text-muted-foreground">{s.hint}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <p className="mt-6 hidden pl-3 text-[11px] text-muted-foreground fold:block">Takes about a minute. You can change this later in Settings.</p>
      </aside>

      {/* ---------- form ---------- */}
      <div className="mt-6 space-y-3 fold:mt-0">
        {step === 1 ? (
          <>
            <Card title="About you">
              <div className="grid grid-cols-2 gap-3">
                <Field label="First name" required>
                  <TextInput value={firstName} onChange={setFirstName} placeholder="John" />
                </Field>
                <Field label="Last name" required>
                  <TextInput value={lastName} onChange={setLastName} placeholder="Marc" />
                </Field>
              </div>
              <Field label="Gender">
                <Segmented value={gender} onChange={(v) => setGender(v as Gender)} options={[["female", "Female"], ["male", "Male"], ["others", "Others"]]} />
              </Field>
              <Field label="Date of birth">
                <div className="relative">
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className={cn(inputCls, "pr-10 [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0")}
                  />
                  <CalendarIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Height">
                  <TextInput value={height} onChange={setHeight} placeholder={"5' 7\""} unit="ft-in" />
                </Field>
                <Field label="Weight">
                  <TextInput value={weight} onChange={setWeight} placeholder="65" unit="kg" inputMode="decimal" />
                </Field>
              </div>
            </Card>

            <Card title="Your work day" hint="Helps us tune alerts to how long you sit.">
              <Field label="Occupation">
                <Chips value={occupation} onChange={setOccupation} options={["Office Worker", "Student", "Driver", "Healthcare", "Other"]} />
              </Field>
              <Field label="Years in role">
                <Chips value={years} onChange={setYears} options={["Under 1 year", "1–3 years", "3–5 years", "5+ years"]} />
              </Field>
              <Field label="Hours seated per week">
                <Chips value={hoursPerWeek} onChange={setHoursPerWeek} options={["Under 20 h", "20–40 h", "40+ h"]} />
              </Field>
            </Card>
          </>
        ) : (
          <>
            <Card title="Monitoring duration">
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: "30", label: "30 min", sub: "Quick check" },
                  { id: "60", label: "1 hour", sub: "Focused block" },
                  { id: "custom", label: "Custom", sub: "Set hours" },
                ] as { id: Duration; label: string; sub: string }[]).map((d) => {
                  const on = duration === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDuration(d.id)}
                      className={cn(
                        "flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition",
                        on ? "border-primary bg-primary/10 shadow-[0_8px_24px_-14px] shadow-primary" : "border-border bg-card/50 hover:border-primary/40",
                      )}
                    >
                      <Timer className={cn("h-4 w-4", on ? "text-primary" : "text-muted-foreground")} />
                      <span>
                        <span className="block text-sm font-semibold">{d.label}</span>
                        <span className="block text-[10.5px] text-muted-foreground">{d.sub}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              {duration === "custom" && (
                <div className="flex items-center justify-between rounded-xl border border-border bg-card/50 px-3 py-2">
                  <span className="text-sm text-muted-foreground">Hours per session</span>
                  <div className="flex items-center gap-3">
                    <StepBtn label="Fewer hours" onClick={() => setCustomHours((h) => Math.max(1, h - 1))}><Minus className="h-4 w-4" /></StepBtn>
                    <span className="w-6 text-center text-lg font-semibold tabular-nums">{customHours}</span>
                    <StepBtn label="More hours" onClick={() => setCustomHours((h) => Math.min(12, h + 1))}><Plus className="h-4 w-4" /></StepBtn>
                  </div>
                </div>
              )}
            </Card>

            <Card title="Current postural status" hint="Any recent stiffness or pain in your neck, back or shoulders?">
              <textarea
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="e.g. Stiff neck after long meetings"
                className={cn(inputCls, "h-auto min-h-24 resize-none py-2.5 leading-relaxed")}
              />
            </Card>

            <div className="flex items-center gap-3 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 to-secondary/5 p-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Gift className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Have a referral code?</p>
                <div className="mt-2 flex gap-2">
                  <input value={referral} onChange={(e) => setReferral(e.target.value.toUpperCase())} placeholder="RFC_01289" className={cn(inputCls, "h-9 bg-background/60 font-mono text-[13px]")} />
                  <button type="button" disabled={!referral.trim()} className="h-9 shrink-0 rounded-xl border border-primary/50 px-4 text-sm font-semibold text-primary transition hover:bg-primary/10 disabled:opacity-40">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* actions */}
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-background/85 px-4 pb-4 pt-3 backdrop-blur-xl fold:static fold:mt-5 fold:border-0 fold:bg-transparent fold:p-0 fold:backdrop-blur-0">
          <div className="flex gap-2 fold:justify-end">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex h-12 items-center justify-center gap-1.5 rounded-xl border border-border px-4 text-sm font-medium text-muted-foreground transition hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            )}
            <button
              type="button"
              onClick={next}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-sm font-semibold text-white shadow-[0_10px_30px_-12px] shadow-primary transition hover:opacity-95 active:scale-[0.99] fold:max-w-[260px]"
            >
              {step === 1 ? "Continue" : "Start Posture Monitor"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "flex h-11 w-full rounded-xl border border-border bg-card/60 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20";

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="glass-card space-y-4 p-4 fold:p-5">
      <div>
        <h2 className="text-[15px] font-semibold">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="text-primary"> *</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, unit, inputMode }: { value: string; onChange: (v: string) => void; placeholder?: string; unit?: string; inputMode?: "decimal" }) {
  return (
    <div className="relative">
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} inputMode={inputMode} className={cn(inputCls, unit && "pr-12")} />
      {unit && <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{unit}</span>}
    </div>
  );
}

function Segmented({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-card/60 p-1">
      {options.map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "h-9 rounded-lg text-sm font-medium transition",
            value === id ? "bg-gradient-to-r from-primary to-secondary text-white shadow" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Chips({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value === o;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={cn(
              "h-9 rounded-full border px-3.5 text-[13px] font-medium transition",
              on ? "border-primary bg-primary/15 text-primary" : "border-border bg-card/50 text-muted-foreground hover:text-foreground",
            )}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function StepBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-primary/50 hover:text-foreground">
      {children}
    </button>
  );
}
