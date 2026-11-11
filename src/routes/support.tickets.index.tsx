import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, Inbox, Plus } from "lucide-react";
import { useTickets, STATUS_META } from "@/lib/tickets-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/support/tickets/")({ component: TicketsPage });

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function TicketsPage() {
  const router = useRouter();
  const tickets = useTickets();

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
        <h1 className="text-base font-semibold flex-1">My Tickets</h1>
        <Link
          to="/support/report"
          aria-label="New report"
          className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-muted"
        >
          <Plus className="h-5 w-5" />
        </Link>
      </header>

      <div className="p-4 flex-1 flex flex-col">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          My Submitted Issues
        </h2>

        {tickets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 gap-4">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              <Inbox className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">No issues reported yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                When you submit an issue, it'll show up here.
              </p>
            </div>
            <Link
              to="/support/report"
              className="mt-2 inline-flex py-3 px-5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
            >
              Report an Issue
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3 fold:grid fold:grid-cols-2">
            {tickets.map((t) => {
              const s = STATUS_META[t.status];
              return (
                <li key={t.id}>
                  <Link
                    to="/support/tickets/$id"
                    params={{ id: t.id }}
                    className="glass-card p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-foreground">
                          {t.supportType}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium",
                            s.className,
                          )}
                        >
                          {s.label}
                        </span>
                      </div>
                      <p className="text-sm font-medium truncate">{t.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{t.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.id} · {formatDate(t.createdAt)}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
