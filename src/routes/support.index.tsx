import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { LifeBuoy, ArrowLeft, ListChecks } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/support/")({ component: SupportPage });

const faqs = [
  {
    question: "What is Poscura and how does it work?",
    answer:
      "Think of Poscura as an AI coach right in your pocket. It uses camera-based tracking to actively monitor your body alignment while you work. By catching slouching patterns early, the app creates customized workout plans targeting your exact pain points, helping you build healthier sitting habits and feel less stiff.",
  },
  {
    question: "How does real-time posture monitoring work?",
    answer:
      "When you start a monitoring session, Poscura's AI continuously observes your body alignment through your camera, focusing on four key zones: Head & Neck, Shoulders & Upper Back, Spine & Torso, and Pelvic & Lower Back. It detects slouching patterns and alerts you instantly if misalignment is detected.",
  },
  {
    question: "What's included in my Posture Insight Report?",
    answer:
      "Your report includes a detailed analysis of posture angles across four key body regions, risk assessment highlights (biggest improvements, repeated issues, new risks detected), and expert-backed recommendations for improvement.",
  },
  {
    question: "How are workout programs personalized?",
    answer:
      "Your personalized workout plan is designed around your specific posture issues, discomfort history, and personal profile. Each program includes a balanced mix of stretching, mobility, and strengthening exercises tailored to your needs.",
  },
  {
    question: "Can I track my long-term improvement, and will my routines adapt?",
    answer:
      "Absolutely! Here is how the loop works:\n\nTrack Progress: Poscura saves your history so you can compare weekly or monthly reports to see real improvements in alignment and pain reduction.\n\nSmart Adaptation: As your body strengthens, the AI dynamically updates your workout difficulty and targets new areas to sustain your long-term health.",
  },
  {
    question: "How to upgrade my subscription plan?",
    answer:
      "Tap My Account > Plan to view options and upgrade instantly.",
  },
  {
    question: "How can I invite friends to track posture together and earn rewards?",
    answer:
      "Go to My Account > Invite to share your unique Referral Code. Look at the rewards you both unlock:\n\nOn Sign-up: Both you and your friend instantly get 300 bonus minutes of tracking time when they join.\n\nOn Upgrade: When 5 of your referred friends upgrade their plan, you'll unlock a 10% off Voucher!",
  },
];

function SupportPage() {
  const router = useRouter();

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
        <h1 className="text-base font-semibold">Support</h1>
      </header>

      <div className="p-4 flex-1 flex flex-col gap-6 fold:grid fold:grid-cols-[1fr_1.4fr] fold:gap-5 fold:items-start">
        <section className="glass-card p-6 text-center space-y-4 fold:sticky fold:top-[72px]">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <LifeBuoy className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Report an Issue</h2>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Something not working right? Let us know and we'll help you out.
            </p>
          </div>
          <Link
            to="/support/report"
            className="w-full inline-flex items-center justify-center py-3.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Report
          </Link>
          <Link
            to="/support/tickets"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-primary hover:underline"
          >
            <ListChecks className="h-4 w-4" />
            View my tickets
          </Link>
        </section>

        <section className="flex-1">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="glass-card overflow-hidden">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="px-4 last:border-b-0">
                <AccordionTrigger className="text-sm py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </div>
  );
}
