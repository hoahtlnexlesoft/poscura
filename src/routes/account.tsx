import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { User, Crown, Gift, Copy, Check, Plus, Trash2, Pencil, AlertTriangle, CreditCard, Ticket, ChevronRight, Facebook, Apple, Send, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PLANS } from "@/lib/plans";
import { cn } from "@/lib/utils";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

const INITIAL_PERSONAL = {
  fullName: "Marc John",
  gender: "Male",
  age: "32 years",
  height: "175 cm",
  weight: "70 kg",
  occupation: "Software developer",
  yearsInRole: "3-5 years",
  weeklyHours: "40-50 hours",
  posturalStatus: "I feel my pain in neck, need to improve as soon as possible",
};

type ConnectionStatus = "connected" | "disconnected";
type Connection = { id: string; name: string; icon: React.ReactNode; status: ConnectionStatus };

function UnifiedAccountSection() {
  const [connections, setConnections] = useState<Connection[]>([
    { id: "facebook", name: "Facebook", icon: <span className="h-7 w-7 rounded-full bg-[#1877F2] text-white flex items-center justify-center"><Facebook className="h-4 w-4" /></span>, status: "connected" },
    { id: "google", name: "Google", icon: <span className="h-7 w-7 rounded-full bg-white border border-border flex items-center justify-center text-xs font-bold">G</span>, status: "connected" },
    { id: "apple", name: "Apple ID", icon: <span className="h-7 w-7 rounded-full bg-black text-white flex items-center justify-center"><Apple className="h-4 w-4" /></span>, status: "disconnected" },
  ]);
  const [email, setEmail] = useState("marc.john@example.com");
  const [editOpen, setEditOpen] = useState(false);
  const [draftEmail, setDraftEmail] = useState(email);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  function toggle(id: string) {
    setConnections((cs) => cs.map((c) => (c.id === id ? { ...c, status: c.status === "connected" ? "disconnected" : "connected" } : c)));
  }

  return (
    <>
      <Section
        title="Account Information"
        action={
          <Button size="icon" variant="ghost" className="text-primary h-7 w-7" aria-label="Edit account information" onClick={() => { setDraftEmail(email); setEditOpen(true); }}>
            <Pencil className="h-4 w-4" />
          </Button>
        }
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Sign-in</h3>
            <div className="divide-y divide-border">
              <InfoRow
                label="Sign up"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white border border-border text-[10px] font-bold">G</span>
                    Google
                  </span>
                }
              />
              <InfoRow label="Email" value={email} />
            </div>
            <button
              type="button"
              onClick={() => { setCurrentPwd(""); setNewPwd(""); setConfirmPwd(""); setPwdOpen(true); }}
              className="mt-3 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Change password <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="border-t border-border pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Connected Accounts</h3>
            <ul className="space-y-3">
              {connections.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {c.icon}
                    <span className="text-sm font-medium">{c.name}</span>
                  </div>
                  {c.status === "connected" ? (
                    <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10" onClick={() => toggle(c.id)}>Disconnect</Button>
                  ) : (
                    <Button size="sm" onClick={() => toggle(c.id)}>Connect</Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Account Information</DialogTitle>
            <DialogDescription>Update your email address.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Email</label>
            <Input type="email" value={draftEmail} onChange={(e) => setDraftEmail(e.target.value)} className="mt-1" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={() => { setEmail(draftEmail); setEditOpen(false); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pwdOpen} onOpenChange={setPwdOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current password and a new password.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Current Password</label>
              <Input type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">New Password</label>
              <Input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Confirm New Password</label>
              <Input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwdOpen(false)}>Cancel</Button>
            <Button onClick={() => setPwdOpen(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

type FamilyMember = { id: string; name: string; email: string; initials: string; status: "Activated" | "Pending"; color: string };
const INITIAL_FAMILY: FamilyMember[] = [
  { id: "f1", name: "Bruce Willis", email: "bruce.willis@example.com", initials: "BW", status: "Activated", color: "bg-blue-500" },
  { id: "f2", name: "Sarah M.", email: "sarah@gmail.com", initials: "SM", status: "Pending", color: "bg-emerald-500" },
];

function FamilyMembersSection() {
  const MAX = 4;
  const [members, setMembers] = useState<FamilyMember[]>(INITIAL_FAMILY);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function send() {
    const trimmed = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) { setError("Please enter a valid email."); return; }
    if (members.some((m) => m.email.toLowerCase() === trimmed.toLowerCase())) { setError("This email is already invited."); return; }
    if (members.length >= MAX) { setError(`You can invite up to ${MAX} members.`); return; }
    const name = trimmed.split("@")[0];
    const initials = name.slice(0, 2).toUpperCase();
    const palette = ["bg-blue-500", "bg-emerald-500", "bg-orange-500", "bg-purple-500", "bg-pink-500"];
    setMembers((m) => [...m, { id: `f${Date.now()}`, name, email: trimmed, initials, status: "Pending", color: palette[m.length % palette.length] }]);
    setEmail(""); setError(""); setOpen(false);
  }

  return (
    <section className="glass-card p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-sm font-semibold">Family Members</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">{members.length}/{MAX} members</p>
        </div>
        <Button size="icon" variant="outline" className="rounded-full h-8 w-8" onClick={() => { setError(""); setEmail(""); setOpen(true); }} disabled={members.length >= MAX} aria-label="Add family member">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {members.length === 0 ? (
        <p className="text-xs text-muted-foreground">No family members yet.</p>
      ) : (
        <ul className="divide-y divide-border">
          {members.map((m) => (
            <li key={m.id} className="py-2.5 flex items-center gap-3">
              <div className={cn("h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0", m.color)}>{m.initials}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold truncate">{m.name}</span>
                  <Badge variant="secondary" className={cn("text-[9px] px-1.5 py-0", m.status === "Activated" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-amber-100 text-amber-700 hover:bg-amber-100")}>{m.status}</Badge>
                </div>
                <div className="text-[10px] text-muted-foreground truncate">{m.email}</div>
              </div>
              <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive h-8 w-8" onClick={() => setMembers((x) => x.filter((y) => y.id !== m.id))} aria-label={`Remove ${m.name}`}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Family Member</DialogTitle>
            <DialogDescription>Enter the email address of the family member you'd like to invite. They'll receive an invitation to join your plan.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
            <Input type="email" placeholder="name@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} onKeyDown={(e) => { if (e.key === "Enter") send(); }} autoFocus />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={send} disabled={!email.trim()}><Send className="h-4 w-4" /> Send Invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export const Route = createFileRoute("/account")({ component: AccountPage });

function AccountPage() {
  const router = useRouter();
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
        <h1 className="text-base font-semibold">My Account</h1>
      </header>
      <div className="p-4 space-y-4">
        <Tabs defaultValue="info">
          <div className="-mx-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            <TabsList className="inline-flex w-max min-w-full bg-muted/50 mx-4 gap-1">
              <TabsTrigger value="info" className="text-sm px-4 py-2">Information</TabsTrigger>
              <TabsTrigger value="subscription" className="text-sm px-4 py-2">Plan</TabsTrigger>
              <TabsTrigger value="payment" className="text-sm px-4 py-2">Payment</TabsTrigger>
              <TabsTrigger value="invite" className="text-sm px-4 py-2">Invite</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="info" className="space-y-4 mt-3 fold:space-y-0 fold:columns-2 fold:gap-4 fold:[&>*]:break-inside-avoid fold:[&>*]:mb-4"><AccountInfo /></TabsContent>
          <TabsContent value="subscription" className="space-y-4 mt-3 fold:space-y-0 fold:columns-2 fold:gap-4 fold:[&>*]:break-inside-avoid fold:[&>*]:mb-4"><SubscriptionTab /></TabsContent>
          <TabsContent value="payment" className="space-y-4 mt-3 fold:space-y-0 fold:columns-2 fold:gap-4 fold:[&>*]:break-inside-avoid fold:[&>*]:mb-4"><PaymentTab /></TabsContent>
          <TabsContent value="invite" className="space-y-4 mt-3 fold:space-y-0 fold:columns-2 fold:gap-4 fold:[&>*]:break-inside-avoid fold:[&>*]:mb-4"><InviteTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Section({ title, action, children, id }: { title: string; action?: React.ReactNode; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function AvatarSection() {
  const [avatar, setAvatar] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => setAvatar(r.result as string); r.readAsDataURL(f);
  };
  return (
    <section className="glass-card p-4 flex flex-col items-center">
      <div className="relative">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-border flex items-center justify-center overflow-hidden">
          {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <User className="h-10 w-10 text-muted-foreground" />}
        </div>
        <button onClick={() => inputRef.current?.click()} className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
      </div>
      <div className="mt-2 font-semibold text-sm">Marc John</div>
    </section>
  );
}

function AccountInfo() {
  const [personal, setPersonal] = useState(INITIAL_PERSONAL);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState(personal);

  return (
    <>
      <AvatarSection />
      <UnifiedAccountSection />
      <Section
        title="Personal Information"
        action={
          <Button size="icon" variant="ghost" className="text-primary h-7 w-7" aria-label="Edit personal information" onClick={() => { setDraft(personal); setEditOpen(true); }}>
            <Pencil className="h-4 w-4" />
          </Button>
        }
      >
        <div className="space-y-1 text-sm">
          <InfoRow label="Full Name" value={personal.fullName} />
          <InfoRow label="Gender" value={personal.gender} />
          <InfoRow label="Age" value={personal.age} />
          <InfoRow label="Height" value={personal.height} />
          <InfoRow label="Weight" value={personal.weight} />
          <InfoRow label="Occupation" value={personal.occupation} />
          <InfoRow label="Years In Role" value={personal.yearsInRole} />
          <InfoRow label="Weekly Hours" value={personal.weeklyHours} />
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground">Current Postural Status</div>
          <p className="mt-1 text-sm font-semibold">{personal.posturalStatus}</p>
        </div>
      </Section>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 gap-3">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-base sm:text-lg">Edit Personal Information</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">Update your details and save changes.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
            {([
              ["fullName", "Full Name", true], ["gender", "Gender", false], ["age", "Age", false],
              ["height", "Height", false], ["weight", "Weight", false], ["occupation", "Occupation", true],
              ["yearsInRole", "Years In Role", false], ["weeklyHours", "Weekly Hours", false],
            ] as const).map(([key, label, full]) => (
              <div key={key} className={full ? "col-span-2" : ""}>
                <label className="text-[11px] sm:text-xs text-muted-foreground">{label}</label>
                <Input
                  value={draft[key]}
                  onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                  className="mt-1 h-9 text-sm"
                />
              </div>
            ))}
            <div className="col-span-2">
              <label className="text-[11px] sm:text-xs text-muted-foreground">Current Postural Status</label>
              <Input
                value={draft.posturalStatus}
                onChange={(e) => setDraft({ ...draft, posturalStatus: e.target.value })}
                className="mt-1 h-9 text-sm"
              />
            </div>
          </div>
          <DialogFooter className="flex-row gap-2 sm:gap-2">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button size="sm" className="flex-1 sm:flex-none" onClick={() => { setPersonal(draft); setEditOpen(false); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <FamilyMembersSection />

      <section className="rounded-xl border-2 border-destructive/30 bg-destructive/5 p-4">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <h2 className="text-sm font-semibold text-destructive">Danger Zone</h2>
        </div>
        <p className="text-[11px] text-muted-foreground mb-3">Irreversible actions. Please be certain before proceeding.</p>
        <div className="flex flex-col gap-2 p-3 rounded-lg border border-destructive/30 bg-card">
          <div>
            <div className="text-sm font-semibold">Delete Account</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Permanently remove your account and all associated data. This cannot be undone.</p>
          </div>
          <Button variant="destructive" size="sm" className="w-full"><Trash2 className="h-3.5 w-3.5" /> Delete Account</Button>
        </div>
      </section>
    </>
  );
}

type Voucher = { code: string; status: "Redeemed" | "Available"; note: string };
const INITIAL_VOUCHERS: Voucher[] = [
  { code: "WELCOME10", status: "Redeemed", note: "Redeemed Apr 12" },
  { code: "SPRING2026", status: "Redeemed", note: "Redeemed Mar 03" },
  { code: "POSCURA-FREE5", status: "Available", note: "5 free monitoring hours" },
  { code: "FRIEND-2026", status: "Available", note: "1 month Premium trial" },
];

type AddOn = { id: string; hours: number; price: number; badge?: string };
const ADDONS: AddOn[] = [
  { id: "a5", hours: 5, price: 50000, badge: "Most popular" },
  { id: "a50", hours: 50, price: 250000, badge: "Save 30%" },
  { id: "a100", hours: 100, price: 320000, badge: "Save 40%" },
];

type SubHistoryItem = { plan: string; note: string; price: string; date: string };
const SUB_HISTORY: SubHistoryItem[] = [
  { plan: "Family", note: "Upgraded from Individual", price: "$29", date: "2 July, 2025" },
  { plan: "Individual", note: "Renew", price: "$29", date: "2 July, 2025" },
  { plan: "Individual", note: "Started", price: "$29", date: "2 July, 2025" },
  { plan: "Individual", note: "Started", price: "$19", date: "2 Jan, 2025" },
  { plan: "Freemium", note: "Signed up", price: "$0", date: "1 Jan, 2025" },
];

function SubscriptionTab() {
  const [browseOpen, setBrowseOpen] = useState(false);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [purchased, setPurchased] = useState<{ id: string; hours: number; price: number; date: string }[]>([
    { id: "p1", hours: 5, price: 50000, date: "Mar 14" },
  ]);
  const [vouchers, setVouchers] = useState<Voucher[]>(INITIAL_VOUCHERS);

  function addPurchase(addon: { hours: number; price: number }) {
    setPurchased((p) => [...p, { id: `p${Date.now()}`, hours: addon.hours, price: addon.price, date: "Today" }]);
    setBrowseOpen(false);
  }

  function redeemVoucher(code: string) {
    setVouchers((vs) => {
      const exists = vs.find((v) => v.code.toLowerCase() === code.toLowerCase());
      if (exists) {
        return vs.map((v) => v.code === exists.code ? { ...v, status: "Redeemed", note: "Redeemed Today" } : v);
      }
      return [...vs, { code, status: "Redeemed", note: "Redeemed Today" }];
    });
    setRedeemOpen(false);
  }

  function scrollToPlans() {
    document.getElementById("upgrade-your-plan")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <Section title="Current Plan">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-base font-bold">Freemium</div>
            <div className="text-xs text-muted-foreground">Free forever — limited features</div>
          </div>
          <Button size="sm" onClick={scrollToPlans}>Upgrade</Button>
        </div>
      </Section>

      <Section title="Usage This Month">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <Stat label="Monitoring Hours" value="0.1/5.0" />
          <Stat label="Workout Sessions" value="2/15" />
          <Stat label="Posture Monitor" value="1" />
        </div>
      </Section>

      <SubscriptionHistorySection />

      <Section
        title="Add-ons"
        action={
          <Button variant="outline" size="sm" onClick={() => setBrowseOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Browse
          </Button>
        }
      >
        {purchased.length > 0 ? (
          <ul className="divide-y divide-border text-sm">
            {purchased.map((p) => (
              <li key={p.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{p.hours} Monitoring Hours</div>
                  <div className="text-[10px] text-muted-foreground">Purchased {p.date}</div>
                </div>
                <span className="text-xs font-medium">{p.price.toLocaleString()} VND</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">No add-ons purchased yet.</p>
        )}
      </Section>

      <Section
        title="Voucher History"
        action={
          <Button variant="outline" size="sm" onClick={() => setRedeemOpen(true)}>
            <Ticket className="h-3.5 w-3.5" /> Redeem
          </Button>
        }
      >
        <ul className="text-xs divide-y divide-border">
          {vouchers.map((v) => (
            <li key={v.code} className="py-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono truncate">{v.code}</span>
                <Badge variant={v.status === "Redeemed" ? "secondary" : "default"} className="text-[9px]">{v.status}</Badge>
              </div>
              <span className="text-muted-foreground text-[10px] shrink-0">{v.note}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Upgrade Your Plan" id="upgrade-your-plan">
        <div className="space-y-3">
          {PLANS.map((p) => (
            <div key={p.id} className={cn("relative rounded-2xl border p-4 flex flex-col",
              p.highlighted ? "border-primary/60 bg-gradient-to-br from-primary/10 to-secondary/5 shadow-lg" : "border-border bg-card")}>
              {p.badge && (
                <span className="absolute -top-2.5 left-4 text-[10px] font-semibold uppercase tracking-wider bg-gradient-to-r from-primary to-secondary text-primary-foreground px-2 py-0.5 rounded-full">
                  {p.badge}
                </span>
              )}
              <div className="text-xs font-medium text-muted-foreground">{p.name}</div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold">{p.price}</span>
                <span className="text-[10px] text-muted-foreground">{p.cadence}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">{p.tagline}</p>
              <ul className="mt-3 space-y-1.5 text-xs flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 text-secondary shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild={!p.current}
                size="sm"
                disabled={p.current}
                variant={p.highlighted ? "default" : "outline"}
                className={cn("mt-4 w-full", p.highlighted && "bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90")}
              >
                {p.current ? <span>Current plan</span> : <Link to="/checkout" search={{ plan: p.id }}>Choose Plan</Link>}
              </Button>
            </div>
          ))}
        </div>
      </Section>

      <BrowseAddOnsDialog open={browseOpen} onOpenChange={setBrowseOpen} onConfirm={addPurchase} />
      <RedeemVoucherDialog
        open={redeemOpen}
        onOpenChange={setRedeemOpen}
        vouchers={vouchers.filter((v) => v.status === "Available")}
        onRedeem={redeemVoucher}
      />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-2">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="text-sm font-bold mt-0.5">{value}</div>
    </div>
  );
}

function SubscriptionHistorySection() {
  const [expanded, setExpanded] = useState(false);
  const items = expanded ? SUB_HISTORY : SUB_HISTORY.slice(0, 3);
  return (
    <Section title="Subscription History">
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-center justify-between rounded-lg border border-dashed border-border p-2.5">
            <div>
              <div className="text-sm font-semibold">{it.plan}</div>
              <div className="text-[10px] text-muted-foreground">{it.note}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold">{it.price}</div>
              <div className="text-[10px] text-secondary">{it.date}</div>
            </div>
          </li>
        ))}
      </ul>
      {SUB_HISTORY.length > 3 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 w-full text-xs text-primary hover:underline flex items-center justify-center gap-1"
        >
          {expanded ? "View Less" : "View More"}
          <ChevronRight className={`h-3.5 w-3.5 transition-transform ${expanded ? "-rotate-90" : "rotate-90"}`} />
        </button>
      )}
    </Section>
  );
}

function BrowseAddOnsDialog({
  open, onOpenChange, onConfirm,
}: { open: boolean; onOpenChange: (v: boolean) => void; onConfirm: (addon: { hours: number; price: number }) => void }) {
  const [selected, setSelected] = useState<string>(ADDONS[0].id);
  const chosen = ADDONS.find((a) => a.id === selected) ?? ADDONS[0];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Browse Add-ons</DialogTitle>
          <DialogDescription>Choose a monitoring hours package.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {ADDONS.map((a) => {
            const active = a.id === selected;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelected(a.id)}
                className={cn(
                  "w-full text-left rounded-xl border p-3 transition flex items-center justify-between gap-3",
                  active ? "border-primary/60 bg-primary/5 ring-1 ring-primary/40" : "border-border"
                )}
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold">{a.hours} hours</span>
                    {a.badge && <Badge variant="secondary" className="text-[9px]">{a.badge}</Badge>}
                  </div>
                  <div className="mt-0.5 text-base font-bold">{a.price.toLocaleString()} VND</div>
                </div>
                <span className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0",
                  active ? "border-primary bg-primary" : "border-muted-foreground/40")}>
                  {active && <Check className="h-3 w-3 text-primary-foreground" />}
                </span>
              </button>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onConfirm({ hours: chosen.hours, price: chosen.price })}>Purchase</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RedeemVoucherDialog({
  open, onOpenChange, vouchers, onRedeem,
}: { open: boolean; onOpenChange: (v: boolean) => void; vouchers: Voucher[]; onRedeem: (code: string) => void }) {
  const [manual, setManual] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Redeem Voucher</DialogTitle>
          <DialogDescription>Pick an available voucher or enter a code.</DialogDescription>
        </DialogHeader>
        {vouchers.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Available</div>
            <ul className="divide-y divide-border rounded-lg border border-border">
              {vouchers.map((v) => (
                <li key={v.code} className="p-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-mono text-xs font-medium truncate">{v.code}</div>
                    <div className="text-[10px] text-muted-foreground">{v.note}</div>
                  </div>
                  <Button size="sm" onClick={() => onRedeem(v.code)}>Redeem</Button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="space-y-2">
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Or enter a code</div>
          <div className="flex gap-2">
            <Input placeholder="Voucher code" value={manual} onChange={(e) => setManual(e.target.value)} />
            <Button disabled={!manual.trim()} onClick={() => { onRedeem(manual.trim().toUpperCase()); setManual(""); }}>
              Redeem
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PaymentTab() {
  return (
    <>
      <Section title="Payment Methods">
        <div className="rounded-lg border border-border p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <div>
              <div className="text-sm font-medium">Visa •••• 4242</div>
              <div className="text-[10px] text-muted-foreground">Expires 08/27</div>
            </div>
          </div>
          <Button variant="ghost" size="sm"><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
        <Button variant="outline" size="sm" className="mt-3 w-full"><Plus className="h-3.5 w-3.5" /> Add card</Button>
      </Section>
      <Section title="History">
        <ul className="divide-y divide-border text-xs">
          <li className="py-2 flex justify-between"><span>Premium Monthly</span><span className="text-muted-foreground">Apr 01 · $9.99</span></li>
          <li className="py-2 flex justify-between"><span>10hr Add-on</span><span className="text-muted-foreground">Mar 14 · $5.00</span></li>
        </ul>
      </Section>
    </>
  );
}

function InviteTab() {
  const code = "POSCURA-SAM-9F2K";
  const [copied, setCopied] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  function copy() { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  return (
    <>
      <Section title="Your Referral Code">
        <button onClick={copy} className="w-full flex items-center justify-between rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3">
          <span className="font-mono font-bold text-sm">{code}</span>
          {copied ? <Check className="h-4 w-4 text-secondary" /> : <Copy className="h-4 w-4 text-primary" />}
        </button>
        <div className="mt-3 rounded-lg border border-border bg-card/50 p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Gift className="h-3.5 w-3.5 text-primary" />
            Share Poscura &amp; Earn Rewards
          </div>
          <div className="text-[11px] text-muted-foreground leading-relaxed">
            When a new user successfully signs up: <span className="font-semibold text-foreground">You receive: 300 mins</span> | <span className="font-semibold text-foreground">Your friend receives: 300 mins</span>
          </div>
          <div className="text-[11px] text-muted-foreground leading-relaxed">
            When 5 invited friends upgrade → 🎁 <span className="text-foreground">You receive a 10% off Voucher</span>
          </div>
        </div>
      </Section>
      <Section title="Invited Friends" action={<Button size="sm" variant="outline" onClick={() => setInviteOpen(true)}>Invite</Button>}>
        <ul className="space-y-2 text-xs">
          <li className="rounded-lg border border-border p-2.5 flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] text-muted-foreground">07/02/2025 10:24</div>
              <div className="font-semibold mt-0.5">Sandra Miller</div>
              <div className="text-muted-foreground">sandra@gmail.com</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[11px]">Sign up</div>
              <div className="text-secondary font-semibold mt-0.5">You earn +300 mins</div>
            </div>
          </li>
          <li className="rounded-lg border border-border p-2.5 flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] text-muted-foreground">06/28/2025 18:02</div>
              <div className="font-semibold mt-0.5">Minh Nguyen</div>
              <div className="text-muted-foreground">minh@gmail.com</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[11px]">Upgrade Paid Plan</div>
            </div>
          </li>
          <li className="rounded-lg border border-border p-2.5 flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] text-muted-foreground">06/15/2025 09:11</div>
              <div className="font-semibold mt-0.5">Sandra Miller</div>
              <div className="text-muted-foreground">sandra@gmail.com</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[11px]">Sign up</div>
              <div className="text-secondary font-semibold mt-0.5">You earn +300 mins</div>
            </div>
          </li>
        </ul>
      </Section>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invite friend</DialogTitle></DialogHeader>
          <Input placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={() => { setInviteOpen(false); setEmail(""); }}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
