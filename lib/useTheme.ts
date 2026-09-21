"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

/**
 * `data-theme` on <html> is the single source of truth: a blocking script in
 * the layout sets it before first paint, the CSS reads it, and this hook
 * subscribes to it. Keeping a second copy in React state would let the colours
 * on screen and the toggle's pressed state disagree.
 *
 * Light is the default, as it is on the reference; dark is only ever a choice.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

const getSnapshot = (): Theme =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

/** The server cannot know; the bootstrap script corrects it before paint. */
const getServerSnapshot = (): Theme => "light";

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((next: Theme) => {
    const root = document.documentElement;
    if (next === "dark") root.dataset.theme = "dark";
    else delete root.dataset.theme;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // A blocked store only costs persistence, not the switch itself.
    }
    // Browser chrome is themed by a meta tag that cannot express a reader's
    // choice, so it is kept in step by hand.
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", next === "dark" ? "#0f100e" : "#f9faf9");
  }, []);

  return { theme, setTheme };
}
