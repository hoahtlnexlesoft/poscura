import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import logo from "@/assets/poscura-logo.png";
import { signIn } from "@/lib/auth-store";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Enter email and password.");
    if (mode === "signup") {
      if (password !== confirm) return setError("Passwords do not match.");
      if (!agree) return setError("Please agree to Terms & Privacy.");
    }
    signIn(email);
    navigate({ to: "/onboarding" });
  }

  function handleSocial(p: string) { signIn(`user@${p}.com`); navigate({ to: "/onboarding" }); }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="w-full glass-card p-6 space-y-5 fold:max-w-[420px]">
        <div className="flex flex-col items-center text-center">
          <img src={logo} alt="Poscura" className="h-20 w-20 mb-3" />
          <h1 className="text-xl font-bold">{mode === "signin" ? "Welcome To Poscura" : "Create account"}</h1>
          <p className="text-xs text-muted-foreground mt-1">{mode === "signin" ? "Continue your posture journey" : "Start your posture journey"}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <SocialButton label="Google" onClick={() => handleSocial("google")} />
          <SocialButton label="Facebook" onClick={() => handleSocial("facebook")} />
          <SocialButton label="Apple" onClick={() => handleSocial("apple")} />
        </div>

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          <span>or email</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" />
          </div>
          <div className="relative">
            <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input type={showPwd ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9 pr-9" />
            <button type="button" onClick={() => setShowPwd((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label="Toggle">
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {mode === "signup" && (
            <>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input type={showPwd ? "text" : "password"} placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="pl-9" />
              </div>
              <label className="flex items-start gap-2 text-[11px] text-muted-foreground">
                <Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)} className="mt-0.5" />
                <span>I agree to the Terms &amp; Privacy.</span>
              </label>
            </>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button type="submit" className="w-full">{mode === "signin" ? "Sign In" : "Create"}</Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          {mode === "signin" ? "Don't have an account? " : "Have an account? "}
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-primary font-medium">
            {mode === "signin" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}

function SocialButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="h-10 rounded-lg border border-border bg-card text-xs font-medium">{label}</button>;
}
