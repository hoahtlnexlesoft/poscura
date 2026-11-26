import { useGoBack } from "@/hooks/useGoBack";
import { BackButton } from "@/components/BackButton";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, CheckCheck } from "lucide-react";
import { useNotifications } from "@/lib/notifications";
import { NotiFilter, NotiList, type NotiTab } from "@/components/NotificationList";

export const Route = createFileRoute("/notifications")({ component: NotificationsPage });

function NotificationsPage() {
  const goBackHome = useGoBack("/");
  const { unread, markAll } = useNotifications();
  const [tab, setTab] = useState<NotiTab>("all");

  const markAllBtn = (
    <button onClick={markAll} disabled={!unread}
      className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/10 px-3.5 text-[12.5px] font-medium text-primary transition enabled:hover:border-primary/40 enabled:hover:bg-primary/10 enabled:active:scale-[0.97] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
      <CheckCheck className="h-4 w-4" /> Mark all read
    </button>
  );

  return (
    <div data-screen="Notifications" className="fold:mx-auto fold:max-w-[640px] land:max-w-none hinge-split land:items-start">
      {/* header (on open foldables it becomes the left pane, with the list across the hinge) */}
      <div className="land:sticky land:top-[72px]">
        <BackButton onClick={goBackHome} />
        <div className="mt-3 flex items-end justify-between gap-3 land:block">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight land:text-[26px]">Notifications</h1>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">Updates on workouts, your plan and subscription.</p>
          </div>
          <div className="land:hidden">{markAllBtn}</div>
        </div>
        <NotiFilter tab={tab} onTab={setTab} className="mt-4 land:mt-5" />
        <div className="mt-3 hidden land:block">{markAllBtn}</div>
      </div>

      <div className="mt-4 rounded-[20px] border border-white/[0.06] bg-white/[0.015] px-1.5 py-3 land:mt-0">
        <NotiList tab={tab} />
      </div>
    </div>
  );
}
