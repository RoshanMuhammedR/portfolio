"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * A media query as an external store.
 *
 * `useSyncExternalStore` rather than state-in-an-effect: the browser already
 * holds the answer, and copying it into React state means the value a layout
 * decision reads can briefly disagree with the value the browser has.
 *
 * The server has no viewport, so it always reports false; components use that
 * to render the layout that works everywhere and let the client widen it.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** True when the visitor has asked for less movement. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** The width at which the rail fits and the page becomes two columns. */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1050px)");
}
