export type BillingCycle = "monthly" | "annual";

export type Plan = {
  id: "freemium" | "individual" | "family";
  name: string;
  note?: string;
  /** monthly price in VND; 0 = free */
  monthly: number;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  current?: boolean;
};

/** Annual billing saves 25% versus paying monthly. */
export const ANNUAL_DISCOUNT = 0.25;

export const PLANS: Plan[] = [
  {
    id: "freemium",
    name: "Freemium",
    monthly: 0,
    features: [
      "Limited monitoring time per month",
      "Personalized workout plans",
      "Basic progress tracking and reporting",
    ],
    current: true,
  },
  {
    id: "individual",
    name: "Individual",
    monthly: 299000,
    features: [
      "Unlimited monitoring time",
      "Personalized workout plans",
      "Progress tracking and reporting",
      "AI chatbot support",
    ],
    highlighted: true,
    badge: "Most popular",
  },
  {
    id: "family",
    name: "Family",
    note: "Sharing up to 5 users",
    monthly: 999000,
    features: [
      "Everything in Individual",
      "5 separate user profiles",
      "Family progress dashboard",
      "Priority support",
    ],
  },
];

export function priceFor(plan: Plan, cycle: BillingCycle): number {
  if (cycle === "monthly") return plan.monthly;
  return Math.round((plan.monthly * 12 * (1 - ANNUAL_DISCOUNT)) / 1000) * 1000;
}

export function formatVND(n: number): string {
  return "đ" + n.toLocaleString("vi-VN");
}

export function getPlan(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}
