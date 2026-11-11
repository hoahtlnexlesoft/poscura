import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Calendar as CalendarIcon, Timer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({ component: OnboardingPage });

type Gender = "female" | "male" | "others";
type Duration = "30" | "60" | "custom";

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
  const [occupation, setOccupation] = useState("Officer Worker");
  const [years, setYears] = useState("Under 1 Year");
  const [hoursPerWeek, setHoursPerWeek] = useState("Under 20 hours");

  // Step 2
  const [duration, setDuration] = useState<Duration>("custom");
  const [customHours, setCustomHours] = useState(0);
  const [status, setStatus] = useState("");
  const [referral, setReferral] = useState("");

  return (
    <div className="min-h-[calc(100vh-2rem)] flex flex-col fold:max-w-[560px] fold:mx-auto fold:w-full">
      {step === 2 && (
        <button
          onClick={() => setStep(1)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
      )}

      {step === 1 ? (
        <div className="space-y-5 flex-1">
          <div>
            <h1 className="text-2xl font-bold">Welcome To Poscura!</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Let's set up your profile to customize your experience.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name*">
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" />
            </Field>
            <Field label="Last Name*">
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Marc" />
            </Field>
          </div>

          <div>
            <Label>Gender</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {(["female", "male", "others"] as Gender[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={cn(
                    "h-16 rounded-xl border text-sm capitalize transition",
                    gender === g
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border",
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <Field label="Date Of Birth">
            <div className="relative">
              <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              <CalendarIcon className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Height">
              <div className="relative">
                <Input value={height} onChange={(e) => setHeight(e.target.value)} placeholder='3&apos; 3"' />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">ft-in</span>
              </div>
            </Field>
            <Field label="Weight">
              <div className="relative">
                <Input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="0" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">kg</span>
              </div>
            </Field>
          </div>

          <Field label="Occupation">
            <Select value={occupation} onChange={setOccupation} options={["Officer Worker", "Student", "Driver", "Healthcare", "Other"]} />
          </Field>

          <Field label="Years In Role">
            <Select value={years} onChange={setYears} options={["Under 1 Year", "1-3 Years", "3-5 Years", "5+ Years"]} />
          </Field>

          <Field label="Weekly Hours">
            <Select value={hoursPerWeek} onChange={setHoursPerWeek} options={["Under 20 hours", "20-40 hours", "40+ hours"]} />
          </Field>

          <Button className="w-full h-12 mt-4" onClick={() => setStep(2)}>
            Continue
          </Button>
        </div>
      ) : (
        <div className="space-y-5 flex-1">
          <div>
            <h1 className="text-2xl font-bold">Tracking Preferences</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Tell us how you'd like to track your posture
            </p>
          </div>

          <div>
            <Label>Monitoring Duration</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {([
                { id: "30", label: "30 mins" },
                { id: "60", label: "1 hr" },
                { id: "custom", label: "Custom" },
              ] as { id: Duration; label: string }[]).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDuration(d.id)}
                  className={cn(
                    "h-20 rounded-xl border flex flex-col items-center justify-center gap-1 transition",
                    duration === d.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border",
                  )}
                >
                  <Timer className="h-5 w-5" />
                  <span className="text-xs">{d.label}</span>
                </button>
              ))}
            </div>
          </div>

          {duration === "custom" && (
            <Field label="Set Custom Duration (Hour)">
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  value={customHours}
                  onChange={(e) => setCustomHours(Number(e.target.value))}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">hour</span>
              </div>
            </Field>
          )}

          <div>
            <Label>Current Poscural Status</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Tell us about your recent spinal comfort. Have you noticed any stiffness or pain?
            </p>
            <textarea
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="Please enter your message"
              className="mt-2 w-full min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center space-y-3">
            <div>
              <p className="font-bold">Have a referral code?</p>
              <p className="text-xs text-muted-foreground mt-0.5">Enter it here to claim your reward</p>
            </div>
            <div className="flex gap-2">
              <Input
                value={referral}
                onChange={(e) => setReferral(e.target.value)}
                placeholder="RFC_01289"
                className="bg-background"
              />
              <Button variant="outline" className="border-primary/40 text-primary">
                Apply
              </Button>
            </div>
          </div>

          <Button
            className="w-full h-12 mt-4"
            onClick={() => navigate({ to: "/posture-monitor" })}
          >
            Start Posture Monitor
          </Button>
        </div>
      )}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-semibold">{children}</label>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

type SelectProps = {
  value: string;
  onChange: (v: string) => void;
  options: string[];
};

function Select(props: SelectProps) {
  const { value, onChange, options } = props;
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}
