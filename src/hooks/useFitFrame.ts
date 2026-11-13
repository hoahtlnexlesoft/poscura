import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Sizes a 9:16 frame to use all the height left on screen.
 * `belowRef` (optional) is content that must stay visible under the frame (e.g. the status bar).
 * Returns a ref for the full-width wrapper and the frame's pixel size (null until measured).
 */
export function useFitFrame(belowRef?: React.RefObject<HTMLElement | null>, ratio = 9 / 16, minH = 300) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  const fit = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const main = el.closest("main");
    const padBottom = main ? parseFloat(getComputedStyle(main).paddingBottom) || 0 : 16;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const below = belowRef?.current?.offsetHeight ?? 0;
    // 2px for the card's borders
    const availH = Math.max(minH, window.innerHeight - top - below - padBottom - 4);
    // On foldables the card shrinks to the 9:16 frame, so size from the layout bound, not the card itself.
    const bound = el.closest("[data-fit-bound]") as HTMLElement | null;
    const twoCol = window.matchMedia("(min-width: 600px)").matches;
    const rail = document.documentElement.dataset.layout === "rail";
    const maxW = bound && (twoCol || rail) ? bound.clientWidth * (twoCol ? 0.6 : 1) - 2 : el.clientWidth;
    const w = Math.min(maxW, availH * ratio);
    const next = { w: Math.round(w), h: Math.round(w / ratio) };
    // ignore 1–2px wobble (e.g. a scrollbar appearing) so a resize can't feed back into itself and make the frame jitter
    setBox((b) => (b && Math.abs(b.w - next.w) <= 2 && Math.abs(b.h - next.h) <= 3 ? b : next));
  }, [belowRef, ratio, minH]);

  useEffect(() => {
    fit();
    const ro = new ResizeObserver(fit);
    if (wrapRef.current) ro.observe(wrapRef.current);
    if (belowRef?.current) ro.observe(belowRef.current);
    window.addEventListener("resize", fit);
    const t = window.setTimeout(fit, 120); // after fonts / top bar settle
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
      window.clearTimeout(t);
    };
  }, [fit, belowRef]);

  return { wrapRef, box };
}
