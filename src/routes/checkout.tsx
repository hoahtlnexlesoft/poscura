import { createFileRoute, useRouter } from "@tanstack/react-router";
import { z } from "zod";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { PlanPicker } from "@/components/PlanPicker";

const searchSchema = z.object({ plan: z.string().optional() });

export const Route = createFileRoute("/checkout")({
  validateSearch: searchSchema,
  component: ChoosePlanPage,
});

function ChoosePlanPage() {
  const router = useRouter();
  return (
    <div className="pb-4">
      <header className="relative flex h-11 items-center justify-center">
        <button
          onClick={() => router.history.back()}
          aria-label="Back"
          className="absolute left-0 flex h-9 w-9 -ml-1.5 items-center justify-center rounded-full hover:bg-muted"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-base font-medium">Choose Your Plan</h1>
      </header>

      <div className="mt-4 text-center">
        <h2 className="inline-block border-b-2 border-primary px-6 pb-3 text-[15px] font-semibold">Unlock All Features</h2>
      </div>

      {/* cards sit side by side when there is room (open foldables), stacked on phones */}
      <PlanPicker className="mt-5" />

      <div className="mt-6 text-center text-sm leading-relaxed">
        <button onClick={() => toast("No previous purchases found")} className="font-medium text-primary hover:underline">
          Restore Purchase
        </button>
        <div className="text-muted-foreground">
          <button type="button" className="text-primary hover:underline">Terms Of Service</button> and{" "}
          <button type="button" className="text-primary hover:underline">Privacy policy</button>
        </div>
      </div>
    </div>
  );
}
