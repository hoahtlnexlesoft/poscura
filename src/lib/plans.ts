export type Plan = {
  id: string;
  name: string;
  price: string;
  priceNumeric: number;
  cadence: string;
  tagline: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  badge?: string;
  current?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "freemium",
    name: "Freemium",
    price: "$0",
    priceNumeric: 0,
    cadence: "forever",
    tagline: "Start your posture journey, free.",
    features: [
      "20 monitoring hours / month",
      "Basic posture insights",
      "5 AI session reports / month",
      "Community access",
    ],
    cta: "Current plan",
    current: true,
  },
  {
    id: "premium-monthly",
    name: "Premium",
    price: "$9.99",
    priceNumeric: 9.99,
    cadence: "/ month",
    tagline: "Unlimited insight, every moment.",
    features: [
      "Unlimited monitoring hours",
      "Advanced posture analytics",
      "Unlimited AI reports",
      "Personalized workout programs",
      "Discomfort tracking & trends",
      "Priority support",
    ],
    cta: "Upgrade to Premium",
    highlighted: true,
    badge: "Most popular",
  },
  {
    id: "premium-annual",
    name: "Premium Annual",
    price: "$89.99",
    priceNumeric: 89.99,
    cadence: "/ year",
    tagline: "Save 25% with yearly billing.",
    features: [
      "Everything in Premium",
      "2 months free",
      "Early access to new features",
      "Annual posture health report",
    ],
    cta: "Go Annual",
  },
];

export function getPlan(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}
