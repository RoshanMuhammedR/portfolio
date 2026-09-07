"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

/**
 * The plate the page is drawn on.
 *
 * `data-theme` on <html> is the single source of truth: a blocking script in
 * the layout sets it before first paint, the CSS reads it, and the canvas
 * watches it. So this hook subscribes to that attribute rather than keeping a
 * second copy of the answer in React state — with two copies, the one that
 * paints and the one that renders the toggle can disagree.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"]
  });

  // Follow the system, but only while the reader has never chosen for
  // themselves. Writing the attribute is what notifies the observer above.
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystem = () => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }
    document.documentElement.dataset.theme = mq.matches ? "dark" : "light";
  };
  mq.addEventListener("change", onSystem);

  return () => {
    observer.disconnect();
    mq.removeEventListener("change", onSystem);
  };
}

const getSnapshot = (): Theme =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

/** The server cannot know; the bootstrap script corrects it before paint. */
const getServerSnapshot = (): Theme => "light";

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const next: Theme = getSnapshot() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // A blocked store only costs persistence, not the switch itself.
    }
    // The browser chrome is themed by a meta tag that cannot express "whatever
    // the reader picked", so it is kept in step by hand.
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next === "dark" ? "#16181C" : "#ECEEE9");
  }, []);

  return { theme, toggle };
}
