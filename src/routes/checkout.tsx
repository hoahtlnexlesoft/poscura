import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Check, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { BillingToggle, PlanCards } from "@/components/PlanPicker";
import type { BillingCycle } from "@/lib/plans";

const searchSchema = z.object({ plan: z.string().optional() });

export const Route = createFileRoute("/checkout")({
  validateSearch: searchSchema,
  component: ChoosePlanPage,
});

function ChoosePlanPage() {
  const router = useRouter();
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  return (
    <div className="pb-4 land:grid land:grid-cols-2 land:items-start land:gap-x-6">
      {/* left pane on open foldables: title, billing and links */}
      <div className="land:sticky land:top-[72px]">
        <header className="relative flex h-11 items-center justify-center land:justify-start land:pl-10">
          <button
            onClick={() => router.history.back()}
            aria-label="Back"
            className="absolute left-0 flex h-9 w-9 -ml-1.5 items-center justify-center rounded-full hover:bg-muted"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-base font-medium">Choose Your Plan</h1>
        </header>

        <div className="mt-4 text-center land:mt-8 land:text-left">
          <h2 className="inline-block border-b-2 border-primary px-6 pb-3 text-[15px] font-semibold land:hidden">Unlock All Features</h2>
          <div className="hidden land:block">
            <h2 className="text-[28px] font-bold leading-tight tracking-tight">
              Unlock <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">all features</span>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Pick the plan that fits you. Switch or cancel any time.</p>
            <ul className="mt-5 space-y-2.5 text-[13px]">
              {["Unlimited monitoring time", "Personalized workout plans", "Progress tracking and reporting"].map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success/15 text-success"><Check className="h-3 w-3" strokeWidth={3} /></span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-5 land:mt-7 land:[&>div]:mx-0">
          <BillingToggle cycle={cycle} onChange={setCycle} />
        </div>

        <FooterLinks className="hidden land:block land:mt-8 land:text-left" />
      </div>

      {/* plans */}
      <div className="land:pt-1">
        <PlanCards cycle={cycle} className="mt-5 land:mt-0" />
        <FooterLinks className="mt-6 text-center land:hidden" />
      </div>
    </div>
  );
}

function FooterLinks({ className }: { className?: string }) {
  return (
    <div className={`text-sm leading-relaxed ${className ?? ""}`}>
      <button onClick={() => toast("No previous purchases found")} className="font-medium text-primary hover:underline">
        Restore Purchase
      </button>
      <div className="text-muted-foreground">
        <button type="button" className="text-primary hover:underline">Terms Of Service</button> and{" "}
        <button type="button" className="text-primary hover:underline">Privacy policy</button>
      </div>
    </div>
  );
}
