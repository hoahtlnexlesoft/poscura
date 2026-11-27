import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useGoBack } from "@/hooks/useGoBack";
import { z } from "zod";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { PlanPicker } from "@/components/PlanPicker";
import { BackButton } from "@/components/BackButton";

const searchSchema = z.object({ plan: z.string().optional(), subscribe: z.enum(["individual", "family"]).optional(), novouchers: z.coerce.string().optional(), manyvouchers: z.coerce.string().optional() });

export const Route = createFileRoute("/checkout")({
  validateSearch: searchSchema,
  component: ChoosePlanPage,
});

function ChoosePlanPage() {
  const router = useRouter();
  const goBack = useGoBack("/account");
  const { subscribe, novouchers, manyvouchers } = Route.useSearch();
  return (
    <div className="pb-1">
      <header className="page-head flex items-center gap-3">
        <BackButton onClick={goBack} />
        <h1 className="text-[17px] font-semibold">Choose Your Plan</h1>
      </header>

      {/* cards sit side by side when there is room (open foldables), stacked on phones */}
      <PlanPicker className="mt-3 space-y-4" subscribe={subscribe} emptyVouchers={!!novouchers} manyVouchers={!!manyvouchers} heading={
        <h2 className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-[24px] font-bold tracking-tight text-transparent">Unlock All Features</h2>
      } />

      <div className="mt-4 text-center text-sm leading-relaxed">
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
