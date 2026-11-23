import { useSyncExternalStore } from "react";
import { Activity, Briefcase, Dumbbell, FileText, Users, AlertTriangle, type LucideIcon } from "lucide-react";

/** One list of notifications shared by the mobile Notifications screen and the desktop bell panel,
 *  so read / unread state stays in step between them. */

export type NotiKind = "posture" | "invite" | "workout" | "report" | "community" | "system";

export type Noti = {
  id: string;
  kind: NotiKind;
  text: string;
  /** minutes before "now" — keeps the demo dates relative to today */
  ago: number;
  unread: boolean;
  to: "/posture-monitor" | "/workout" | "/community" | "/account";
  search?: Record<string, string>;
  /** team invitations are answered right in the notification */
  invite?: "pending" | "accepted" | "declined";
};

export const KIND: Record<NotiKind, { label: string; icon: LucideIcon; tone: string }> = {
  posture: { label: "How's your posture?", icon: Activity, tone: "bg-primary/12 text-primary ring-primary/25" },
  invite: { label: "New business invitation", icon: Briefcase, tone: "bg-[#a78bfa]/12 text-[#b9a3ff] ring-[#a78bfa]/25" },
  workout: { label: "Upcoming workout", icon: Dumbbell, tone: "bg-secondary/12 text-secondary ring-secondary/25" },
  report: { label: "Report ready", icon: FileText, tone: "bg-primary/12 text-primary ring-primary/25" },
  community: { label: "Community", icon: Users, tone: "bg-success/12 text-success ring-success/25" },
  system: { label: "Camera", icon: AlertTriangle, tone: "bg-warning/12 text-warning ring-warning/25" },
};

const DAY = 24 * 60;
let items: Noti[] = [
  { id: "n1", kind: "posture", ago: 12, unread: true, to: "/posture-monitor", text: "Scan now to track your alignment and keep your posture on point!" },
  { id: "n2", kind: "invite", ago: 48, unread: true, to: "/account", invite: "pending", text: "Uyen 86 has invited you to join their team on Poscura." },
  { id: "n3", kind: "workout", ago: 95, unread: true, to: "/workout", text: "Posture Correction and Wellness Program | Active Lateral Neck Flexion and 4 more exercises will start in 30 minutes." },
  { id: "n4", kind: "report", ago: DAY + 120, unread: false, to: "/posture-monitor", search: { report: "1" }, text: "Your morning session report is ready: average score 74, mostly balanced." },
  { id: "n5", kind: "workout", ago: DAY + 300, unread: false, to: "/workout", text: "Posture Correction and Wellness Program | Active Lateral Neck Flexion and 4 more exercises will start in 30 minutes." },
  { id: "n6", kind: "community", ago: 2 * DAY + 60, unread: false, to: "/community", text: "Maria replied to your post: “Wall angels changed my afternoons too!”" },
  { id: "n7", kind: "posture", ago: 2 * DAY + 400, unread: false, to: "/posture-monitor", text: "Scan now to track your alignment and keep your posture on point!" },
  { id: "n8", kind: "system", ago: 3 * DAY + 200, unread: false, to: "/posture-monitor", text: "Your camera disconnected during a session. Reconnect it to resume monitoring." },
];

const subs = new Set<() => void>();
const set = (next: Noti[]) => { items = next; subs.forEach((f) => f()); };
const subscribe = (f: () => void) => { subs.add(f); return () => subs.delete(f); };

export function useNotifications() {
  const list = useSyncExternalStore(subscribe, () => items, () => items);
  return {
    items: list,
    unread: list.filter((n) => n.unread).length,
    markRead: (id: string) => set(items.map((n) => (n.id === id ? { ...n, unread: false } : n))),
    markAll: () => set(items.map((n) => ({ ...n, unread: false }))),
    answerInvite: (id: string, a: "accepted" | "declined") => set(items.map((n) => (n.id === id ? { ...n, invite: a, unread: false } : n))),
  };
}

/** "Today, 10:24 AM" style stamps for the list; dates stay relative to the real "now" */
export function stamp(ago: number, now = new Date()) {
  const d = new Date(now.getTime() - ago * 60000);
  if (ago < 60) return `${Math.max(1, ago)}m ago`;
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return `${Math.floor(ago / 60)}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export const badge = (n: number) => (n > 9 ? "9+" : String(n));
