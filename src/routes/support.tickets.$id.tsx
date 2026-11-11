import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  Headset,
  ImagePlus,
  Paperclip,
  Send,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  addReply,
  getTicket,
  STATUS_META,
  type Ticket,
  type TicketReply,
} from "@/lib/tickets-store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/support/tickets/$id")({
  component: TicketDetailPage,
});

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function isAdminReply(r: TicketReply) {
  if (r.authorRole) return r.authorRole === "admin";
  return /poscura/i.test(r.author);
}

function TicketDetailPage() {
  const router = useRouter();
  const { id } = Route.useParams();
  const [ticket, setTicket] = useState<Ticket | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<
    { name: string; url: string; type: "image" | "file" } | null
  >(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTicket(getTicket(id));
    setLoaded(true);
  }, [id]);

  const handlePickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      setAttachment({
        name: f.name,
        url: String(reader.result),
        type: "image",
      });
    reader.readAsDataURL(f);
  };

  const handlePickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      setAttachment({
        name: f.name,
        url: String(reader.result),
        type: "file",
      });
    reader.readAsDataURL(f);
  };

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed && !attachment) {
      toast.error("Write a message or attach a file");
      return;
    }
    if (trimmed.length > 1000) {
      toast.error("Message must be under 1000 characters");
      return;
    }
    const updated = addReply(id, {
      message: trimmed,
      attachment,
      author: "You",
      authorRole: "user",
    });
    if (updated) {
      setTicket(updated);
      setMessage("");
      setAttachment(null);
      if (photoInputRef.current) photoInputRef.current.value = "";
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Reply sent");
    }
  };

  if (!loaded) return null;

  if (!ticket) {
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
          <h1 className="text-base font-semibold">Ticket not found</h1>
        </header>
        <div className="p-6 text-sm text-muted-foreground">
          We couldn't find this ticket.
        </div>
      </div>
    );
  }

  const s = STATUS_META[ticket.status];

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
        <h1 className="text-base font-semibold flex-1 truncate">{ticket.id}</h1>
        <span
          className={cn(
            "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium",
            s.className,
          )}
        >
          {s.label}
        </span>
      </header>

      <div className="p-4 flex-1 flex flex-col gap-4 fold:grid fold:grid-cols-[1fr_1.3fr] fold:gap-5 fold:items-start">
        {/* Submission */}
        <section className="glass-card p-4 space-y-3 fold:sticky fold:top-[72px]">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Title
            </p>
            <p className="text-sm font-medium mt-1">{ticket.title}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Support Type
            </p>
            <p className="text-sm font-medium mt-1">{ticket.supportType}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Description
            </p>
            <p className="text-sm mt-1 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>
          {ticket.photos && ticket.photos.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Attached Photos
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ticket.photos.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Attachment ${i + 1}`}
                    className="rounded-lg h-40 w-full object-cover border border-border"
                  />
                ))}
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground pt-1">
            Submitted {formatDateTime(ticket.createdAt)}
          </p>
        </section>

        {/* Conversation */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Conversation
            </h2>
            {ticket.replies && ticket.replies.length > 0 && (
              <span className="text-[11px] text-muted-foreground">
                {ticket.replies.length}{" "}
                {ticket.replies.length === 1 ? "message" : "messages"}
              </span>
            )}
          </div>

          {ticket.replies && ticket.replies.length > 0 ? (
            <ul className="flex flex-col gap-4">
              {ticket.replies.map((r) => {
                const admin = isAdminReply(r);
                return (
                  <li
                    key={r.id}
                    className={cn(
                      "flex gap-3",
                      !admin && "flex-row-reverse",
                    )}
                  >
                    <div
                      className={cn(
                        "h-9 w-9 rounded-full flex items-center justify-center shrink-0",
                        admin ? "bg-primary/15" : "bg-muted",
                      )}
                    >
                      {admin ? (
                        <Headset className="h-5 w-5 text-primary" />
                      ) : (
                        <User className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 max-w-[85%]">
                      <div
                        className={cn(
                          "flex items-center gap-2 mb-1 px-1",
                          !admin && "justify-end",
                        )}
                      >
                        <span className="text-xs font-semibold">
                          {r.author}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] uppercase tracking-wider rounded px-1.5 py-0.5",
                            admin
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {admin ? "Admin" : "You"}
                        </span>
                      </div>
                      <div
                        className={cn(
                          "rounded-2xl border px-4 py-3 space-y-3",
                          admin
                            ? "rounded-tl-sm bg-sky-500/10 dark:bg-sky-400/10 border-sky-500/20"
                            : "rounded-tr-sm bg-primary/10 border-primary/20",
                        )}
                      >
                        {r.message && (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {r.message}
                          </p>
                        )}
                        {r.attachment && r.attachment.type === "image" && (
                          <img
                            src={r.attachment.url}
                            alt={r.attachment.name}
                            className="rounded-lg max-h-56 w-auto border border-border"
                          />
                        )}
                        {r.attachment && r.attachment.type === "file" && (
                          <a
                            href={r.attachment.url}
                            download={r.attachment.name}
                            className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-medium hover:bg-background"
                          >
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">
                              {r.attachment.name}
                            </span>
                          </a>
                        )}
                      </div>
                      <p
                        className={cn(
                          "text-[11px] text-muted-foreground mt-1.5 px-1",
                          !admin && "text-right",
                        )}
                      >
                        {formatDateTime(r.timestamp)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="glass-card p-4 text-sm text-muted-foreground text-center leading-relaxed">
              We're reviewing your issue. You'll be notified when there's a reply.
            </div>
          )}
        </section>
      </div>

      {/* Reply composer */}
      <div className="sticky bottom-0 z-30 bg-background/90 backdrop-blur-xl border-t border-border px-4 py-3 space-y-2">
        {attachment && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-2 py-1.5">
            {attachment.type === "image" ? (
              <img
                src={attachment.url}
                alt={attachment.name}
                className="h-10 w-10 rounded object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded bg-background flex items-center justify-center">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <span className="text-xs flex-1 truncate">{attachment.name}</span>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              aria-label="Remove attachment"
              className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePickPhoto}
          />
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handlePickFile}
          />
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            aria-label="Attach photo"
            className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground shrink-0"
          >
            <ImagePlus className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach file"
            className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground shrink-0"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Reply to support…"
            rows={1}
            maxLength={1000}
            className="min-h-[40px] max-h-32 resize-none flex-1"
          />
          <Button
            type="button"
            size="icon"
            onClick={handleSend}
            aria-label="Send reply"
            className="h-10 w-10 rounded-full shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
