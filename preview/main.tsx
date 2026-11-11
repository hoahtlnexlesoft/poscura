import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter, createHashHistory } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "../src/routeTree.gen";
import { Route as RootRoute } from "../src/routes/__root";
import "../src/styles.css";

// The app's root route renders a full <html> document shell for server rendering.
// This static preview renders into #root, so drop that shell here (source stays untouched).
(RootRoute.options as { shellComponent?: unknown }).shellComponent = undefined;

/* ---------------- Preview-only bootstrap (device viewer) ----------------
 * The viewer page embeds this file in an <iframe>. Inside claude.ai the frame
 * can be sandboxed, so we never rely on the parent touching our DOM/storage:
 *  - start-up options come in through window.name (readable cross-origin)
 *  - later navigation comes in through postMessage
 *  - we report the current route back through postMessage
 */

// 1) storage may be blocked in sandboxed frames: fall back to memory
(function ensureStorage() {
  try {
    const k = "__poscura_probe";
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
  } catch {
    const mem = new Map<string, string>();
    const shim: Storage = {
      get length() { return mem.size; },
      clear: () => mem.clear(),
      getItem: (k) => (mem.has(k) ? mem.get(k)! : null),
      key: (i) => Array.from(mem.keys())[i] ?? null,
      removeItem: (k) => { mem.delete(k); },
      setItem: (k, v) => { mem.set(k, String(v)); },
    };
    try { Object.defineProperty(window, "localStorage", { configurable: true, value: shim }); } catch {}
  }
})();

type Boot = { layout?: string; auth?: boolean };
let boot: Boot = {};
try { boot = JSON.parse(window.name || "{}"); } catch {}
if (boot.layout) document.documentElement.dataset.layout = boot.layout;

const AUTH_KEY = "poscura.auth";
const DEMO_USER = { email: "sam@poscura.app", firstName: "Sam", lastName: "Miller", initials: "SM", plan: "Freemium" };
function hasUser() { try { return !!localStorage.getItem(AUTH_KEY); } catch { return false; } }

// auth must be settled before the app's AuthGate runs, or it redirects to /login
async function applyAuth(want: boolean | undefined) {
  if (want === undefined || want === hasUser()) return false;
  const { signIn, signOut } = await import("../src/lib/auth-store");
  if (want) { try { localStorage.setItem(AUTH_KEY, JSON.stringify(DEMO_USER)); } catch {} signIn(DEMO_USER.email); }
  else signOut();
  return true;
}

const inFrame = window.parent !== window;
function tell(msg: Record<string, unknown>) { if (inFrame) window.parent.postMessage({ poscura: true, ...msg }, "*"); }

(async () => {
  await applyAuth(boot.auth);

  const router = createRouter({ routeTree, context: { queryClient: new QueryClient() }, history: createHashHistory() });
  router.subscribe("onResolved", () => tell({ type: "route", path: router.state.location.pathname }));

  window.addEventListener("message", async (e) => {
    const m = e.data;
    if (!m || m.poscura !== true || m.type !== "go") return;
    await applyAuth(m.auth);
    const cur = router.state.location.pathname;
    if (cur !== m.path) router.history.push(m.path);
    else tell({ type: "route", path: cur });
  });

  // edge-swipe back (from the left 32px, like iOS) — touch and mouse
  let sx: number | null = null, sy = 0, t0 = 0;
  const start = (x: number, y: number) => { if (x <= 32) { sx = x; sy = y; t0 = Date.now(); } };
  const end = (x: number, y: number) => {
    if (sx === null) return;
    const dx = x - sx, dy = Math.abs(y - sy);
    sx = null;
    if (dx > 80 && dy < 60 && Date.now() - t0 < 800 && router.state.location.pathname !== "/") router.history.back();
  };
  document.addEventListener("touchstart", (e) => start(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  document.addEventListener("touchend", (e) => end(e.changedTouches[0].clientX, e.changedTouches[0].clientY), { passive: true });
  document.addEventListener("pointerdown", (e) => { if (e.pointerType === "mouse") start(e.clientX, e.clientY); });
  document.addEventListener("pointerup", (e) => { if (e.pointerType === "mouse") end(e.clientX, e.clientY); });

  createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />);
  tell({ type: "ready" });
})();
