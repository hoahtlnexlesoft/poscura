import { useEffect, useState } from "react";

export type TicketStatus =
  | "new"
  | "assigned"
  | "await_response"
  | "resolved"
  | "closed";

export type Ticket = {
  id: string;
  title: string;
  supportType: string;
  description: string;
  photos?: string[] | null;
  status: TicketStatus;
  createdAt: number;
  replies?: TicketReply[];
};

export type TicketReply = {
  id: string;
  author: string;
  authorRole?: "admin" | "user";
  message: string;
  attachment?: { name: string; url: string; type: "image" | "file" } | null;
  timestamp: number;
};

const KEY = "support_tickets_v3";

const ADMIN = "Poscura Support";

const seed: Ticket[] = [
  {
    id: "TKT-1045",
    title: "Double billing charge",
    supportType: "Billing & Subscription",
    description: "Charged twice for the same subscription this month.",
    photos: null,
    status: "closed",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    replies: [
      {
        id: "r-1041-1",
        author: ADMIN,
        message: "Glad it's working. Closing this ticket — reach out anytime.",
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 9,
      },
    ],
  },
];

function read(): Ticket[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      window.localStorage.setItem(KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as Ticket[];
  } catch {
    return [];
  }
}

function write(list: Ticket[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("tickets:updated"));
}

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  useEffect(() => {
    setTickets(read());
    const handler = () => setTickets(read());
    window.addEventListener("tickets:updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("tickets:updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return tickets;
}

export function addTicket(
  t: Omit<Ticket, "id" | "createdAt" | "status" | "replies">,
) {
  const list = read();
  const id = `TKT-${1046 + list.length}`;
  const ticket: Ticket = {
    ...t,
    id,
    createdAt: Date.now(),
    status: "new",
    replies: [],
  };
  write([ticket, ...list]);
  return ticket;
}

export function getTicket(id: string): Ticket | undefined {
  return read().find((t) => t.id === id);
}

export function addReply(
  ticketId: string,
  reply: Omit<TicketReply, "id" | "timestamp" | "author" | "authorRole"> & {
    author?: string;
    authorRole?: "admin" | "user";
  },
): Ticket | undefined {
  const list = read();
  const idx = list.findIndex((t) => t.id === ticketId);
  if (idx === -1) return undefined;
  const newReply: TicketReply = {
    id: `r-${ticketId}-${Date.now()}`,
    author: reply.author ?? "You",
    authorRole: reply.authorRole ?? "user",
    message: reply.message,
    attachment: reply.attachment ?? null,
    timestamp: Date.now(),
  };
  const updated: Ticket = {
    ...list[idx],
    replies: [...(list[idx].replies ?? []), newReply],
    status:
      list[idx].status === "resolved" || list[idx].status === "closed"
        ? list[idx].status
        : "await_response",
  };
  const next = [...list];
  next[idx] = updated;
  write(next);
  return updated;
}


export const SUPPORT_TYPES = [
  "Account & Login",
  "Billing & Subscription",
  "Camera / Monitoring",
  "Workout & Exercises",
  "App Bug / Crash",
  "Feature Request",
  "Other",
];

export const STATUS_META: Record<
  TicketStatus,
  { label: string; className: string }
> = {
  new: {
    label: "New",
    className: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
  },
  assigned: {
    label: "Assigned",
    className:
      "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30",
  },
  await_response: {
    label: "Await Response",
    className:
      "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
  resolved: {
    label: "Resolved",
    className:
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  closed: {
    label: "Closed",
    className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
  },
};
