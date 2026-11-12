import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/support/")({ component: SupportPage });

const TOPICS = [
  { id: "all", label: "All Topics" },
  { id: "getting", label: "Getting Started" },
  { id: "reports", label: "Reports & Progress" },
  { id: "plans", label: "Plans & Referrals" },
  { id: "privacy", label: "Privacy & Support" },
] as const;

const faqs: { topic: string; question: string; answer: string }[] = [
  {
    topic: "getting",
    question: "What is Poscura and how does it work?",
    answer:
      "Think of Poscura as an AI coach right in your pocket. It uses camera-based tracking to actively monitor your body alignment while you work. By catching slouching patterns early, the app creates customized workout plans targeting your exact pain points, helping you build healthier sitting habits and feel less stiff.",
  },
  {
    topic: "getting",
    question: "How does real-time posture monitoring work?",
    answer:
      "When you start a monitoring session, Poscura's AI continuously observes your body alignment through your camera, focusing on four key zones: Head & Neck, Shoulders & Upper Back, Spine & Torso, and Pelvic & Lower Back. It detects slouching patterns and alerts you instantly if misalignment is detected.",
  },
  {
    topic: "reports",
    question: "What's included in my Posture Insight Report?",
    answer:
      "Your report includes a detailed analysis of posture angles across four key body regions, risk assessment highlights (biggest improvements, repeated issues, new risks detected), and expert-backed recommendations for improvement.",
  },
  {
    topic: "getting",
    question: "How are workout programs personalized?",
    answer:
      "Your personalized workout plan is designed around your specific posture issues, discomfort history, and personal profile. Each program includes a balanced mix of stretching, mobility, and strengthening exercises tailored to your needs.",
  },
  {
    topic: "reports",
    question: "Can I track my long-term improvement, and will my routines adapt?",
    answer:
      "Absolutely! Here is how the loop works:\n\nTrack Progress: Poscura saves your history so you can compare weekly or monthly reports to see real improvements in alignment and pain reduction.\n\nSmart Adaptation: As your body strengthens, the AI dynamically updates your workout difficulty and targets new areas to sustain your long-term health.",
  },
  {
    topic: "plans",
    question: "How to upgrade my subscription plan?",
    answer:
      "Tap My Account > Plan to view options and upgrade instantly.",
  },
  {
    topic: "plans",
    question: "How can I invite friends to track posture together and earn rewards?",
    answer:
      "Go to My Account > Invite to share your unique Referral Code. Look at the rewards you both unlock:\n\nOn Sign-up: Both you and your friend instantly get 300 bonus minutes of tracking time when they join.\n\nOn Upgrade: When 5 of your referred friends upgrade their plan, you'll unlock a 10% off Voucher!",
  },
  {
    topic: "privacy",
    question: "Is my camera video stored or shared?",
    answer:
      "No. Poscura only uses your camera to read your posture angles during a session. Your reports keep the angles and scores, not the video.",
  },
];

function SupportPage() {
  const router = useRouter();
  const [topic, setTopic] = useState<string>("all");
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const list = faqs
    .map((f, i) => ({ ...f, n: i + 1 }))
    .filter((f) => (topic === "all" || f.topic === topic) && (!query || (f.question + " " + f.answer).toLowerCase().includes(query)));

  return (
    <div className="-mx-4 -mt-4 min-h-full flex flex-col">
      <header className="h-14 sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border flex items-center px-4 gap-2">
        <button
          onClick={() => router.history.back()}
          aria-label="Back"
          className="h-9 w-9 -ml-2 rounded-full flex items-center justify-center hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold">FAQs</h1>
      </header>

      <div className="relative p-4 pt-6 flex-1 fold:px-6 fold:pt-8">
        <div aria-hidden className="pointer-events-none absolute -top-10 -left-10 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" /> Help center
          </span>
          <h2 className="mt-3 text-[26px] font-bold leading-tight tracking-tight fold:text-[32px]">
            Frequently{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Asked Questions</span>
          </h2>
          <p className="mt-2 max-w-[460px] text-sm leading-relaxed text-muted-foreground">
            Everything you need to know about Poscura — your AI-powered posture coach.
          </p>

          <div className="mt-5 flex max-w-[500px] items-center gap-2 rounded-xl border border-border bg-card/60 px-3 h-10 focus-within:border-primary/50 transition-colors">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search questions..."
              className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {q && (
              <button onClick={() => setQ("")} aria-label="Clear search" className="text-muted-foreground"><X className="h-4 w-4" /></button>
            )}
          </div>

          <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden fold:mx-0 fold:flex-wrap fold:px-0">
            {TOPICS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTopic(t.id)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                  topic === t.id
                    ? "border-transparent bg-gradient-to-r from-primary to-secondary text-white"
                    : "border-border bg-card/60 text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-4 border-t border-border pt-4">
            {list.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No questions match your search.</p>
            ) : (
              <Accordion type="single" collapsible className="space-y-2.5">
                {list.map((faq) => (
                  <AccordionItem
                    key={faq.n}
                    value={`item-${faq.n}`}
                    className="rounded-xl border border-border bg-card/60 px-3.5 data-[state=open]:border-primary/40 transition-colors"
                  >
                    <AccordionTrigger className="gap-3 py-3.5 text-left text-sm font-semibold hover:no-underline">
                      <span className="flex items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                          {String(faq.n).padStart(2, "0")}
                        </span>
                        {faq.question}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="whitespace-pre-line pl-10 text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
