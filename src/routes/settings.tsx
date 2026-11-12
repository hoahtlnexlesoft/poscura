import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Mic, Clock, Languages, ArrowLeft, ShieldAlert, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

type SectionProps = {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
};

type RowProps = {
  label: string;
  children: React.ReactNode;
};

function SettingsPage() {
  const router = useRouter();
  const [language, setLanguage] = useState("en");
  
  const [voice, setVoice] = useState(false);
  const [allowNotifications, setAllowNotifications] = useState(true);
  const [postureAlerts, setPostureAlerts] = useState(false);
  const [workoutReminders, setWorkoutReminders] = useState(false);
  const [communityNotifications, setCommunityNotifications] = useState(true);

  return (
    <div className="-mx-4 -mt-4">
      <header className="h-14 sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border flex items-center px-4 gap-2">
        <button
          onClick={() => router.history.back()}
          aria-label="Back"
          className="h-9 w-9 -ml-2 rounded-full flex items-center justify-center hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold">Settings</h1>
      </header>
      <div className="p-4 space-y-4 fold:space-y-0 fold:columns-2 fold:gap-4 fold:[&>*]:break-inside-avoid fold:[&>*]:mb-4">

      <Section icon={Languages} title="Language">
        <Row label="App language">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
            </SelectContent>
          </Select>
        </Row>
      </Section>

      <Section icon={Clock} title="Monitoring">
        <Row label="Session length">
          <Select defaultValue="40">
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="20">20 min</SelectItem>
              <SelectItem value="40">40 min</SelectItem>
              <SelectItem value="60">60 min</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        
      </Section>

      <Section icon={Mic} title="Voice">
        <Row label="Wake word"><span className="text-[15px] text-muted-foreground">Motion Future</span></Row>
        <Row label="Voice activation" hint="Always listen for wake word">
          <Switch checked={voice} onCheckedChange={setVoice} />
        </Row>
      </Section>

      <Section icon={Bell} title="Notifications">
        <Row label="Allow notifications"><Switch checked={allowNotifications} onCheckedChange={setAllowNotifications} /></Row>
        <Row label="Posture alerts"><Switch checked={postureAlerts} onCheckedChange={setPostureAlerts} disabled={!allowNotifications} /></Row>
        <Row label="Workout reminders"><Switch checked={workoutReminders} onCheckedChange={setWorkoutReminders} disabled={!allowNotifications} /></Row>
        <Row label="Community notifications"><Switch checked={communityNotifications} onCheckedChange={setCommunityNotifications} disabled={!allowNotifications} /></Row>
      </Section>

      <Section icon={ShieldAlert} title="Legal Information">
        <LinkRow label="Terms Of Service" />
        <LinkRow label="Privacy Policy" />
      </Section>
      </div>
    </div>
  );
}

function Section(props: SectionProps) {
  const { icon: Icon, title, children } = props;

  return (
    <section className="glass-card px-4 pt-4 pb-1">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-[18px] w-[18px] text-primary" />
        <h2 className="text-[15px] font-semibold">{title}</h2>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}

function Row(props: RowProps & { hint?: string }) {
  const { label, children, hint } = props;

  return (
    <div className="py-3">
      <div className="flex items-center justify-between gap-3 min-h-[28px]">
        <span className="text-[15px] text-foreground">{label}</span>
        {children}
      </div>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function LinkRow({ label }: { label: string }) {
  return (
    <button type="button" className="flex w-full items-center justify-between py-3.5 text-left text-[15px] hover:text-primary transition-colors">
      {label}
      <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
    </button>
  );
}
