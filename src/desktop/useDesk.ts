import { useSyncExternalStore } from "react";

/** true on the desktop app (any window width, like Slack) or a desktop browser ≥1200px wide */
const Q = "(min-width: 1200px)";
const app = () => typeof document !== "undefined" && document.documentElement.dataset.desktop === "1";
const sub = (f: () => void) => {
  const m = window.matchMedia(Q);
  m.addEventListener("change", f);
  return () => m.removeEventListener("change", f);
};
export function useDesk() {
  return useSyncExternalStore(sub, () => app() || window.matchMedia(Q).matches, () => false);
}

/** narrow desktop-app window (<900px): sidebar folds to its icon rail */
const N = "(max-width: 899px)";
const subN = (f: () => void) => {
  const m = window.matchMedia(N);
  m.addEventListener("change", f);
  return () => m.removeEventListener("change", f);
};
export function useNarrow() {
  return useSyncExternalStore(subN, () => window.matchMedia(N).matches, () => false);
}
