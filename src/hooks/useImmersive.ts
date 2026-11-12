import { useEffect } from "react";

/** Hide the app navigation while an inner flow is on screen. */
export function useImmersive() {
  useEffect(() => {
    const el = document.documentElement;
    el.dataset.immersive = "1";
    return () => { delete el.dataset.immersive; };
  }, []);
}
