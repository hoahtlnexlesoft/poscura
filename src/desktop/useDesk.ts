import { useSyncExternalStore } from "react";

/** true on the desktop app / desktop browser (≥1200px wide): pages render their desktop layout */
const Q = "(min-width: 1200px)";
const sub = (f: () => void) => {
  const m = window.matchMedia(Q);
  m.addEventListener("change", f);
  return () => m.removeEventListener("change", f);
};
export function useDesk() {
  return useSyncExternalStore(sub, () => window.matchMedia(Q).matches, () => false);
}
