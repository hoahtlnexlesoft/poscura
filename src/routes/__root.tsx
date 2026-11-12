import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter, useLocation, useNavigate, HeadContent, Scripts,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { MobileTopBar } from "@/components/MobileTopBar";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/lib/auth-store";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">Please try again.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Try again
          </button>
          <a href="/" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium">Home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Poscura — Mobile" },
      { name: "description", content: "Real-time posture monitoring, workouts, and community on mobile." },
      { name: "theme-color", content: "#0f1726" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate />
    </QueryClientProvider>
  );
}

function AuthGate() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuth();
  const [mounted, setMounted] = useState(false);
  const isLogin = location.pathname === "/login";

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && !user && !isLogin) {
      navigate({ to: "/login" });
    }
  }, [mounted, user, isLogin, navigate]);

  if (isLogin) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-background text-foreground">
        <main className="flex-1 p-4">
          <Outlet />
        </main>
        <Toaster position="top-center" />
      </div>
    );
  }

  if (!mounted || !user) {
    return <div className="min-h-screen bg-background" />;
  }

  const isOnboarding = location.pathname === "/onboarding";
  const hideTopBar = isOnboarding || location.pathname === "/account" || location.pathname === "/settings" || location.pathname === "/support";
  return (
    <div data-app-shell className={`flex flex-col min-h-screen w-full bg-background text-foreground ${isOnboarding ? "land:px-[92px]" : "rail:pr-[92px] land:pl-[92px]"}`}>
      {!hideTopBar && <MobileTopBar />}
      <main className={`flex-1 p-4 ${isOnboarding ? "pb-6" : "pb-24 rail:pb-6"}`}>
        <div className="fold:max-w-[1040px] fold:mx-auto">
          <Outlet />
        </div>
      </main>
      {!isOnboarding && <BottomNav />}
      <Toaster position="top-center" />
    </div>
  );
}
