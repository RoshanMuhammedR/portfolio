"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";

export type Cue = "hover" | "click" | "open" | "close";

type SoundContextValue = {
  enabled: boolean;
  toggle: () => void;
  play: (cue: Cue) => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

const STORAGE_KEY = "sound";

/** Short, quiet, and deliberately unmusical - a tick, not a chime.
 *  [frequency Hz, seconds, peak gain] */
const CUES: Record<Cue, [number, number, number]> = {
  hover: [1180, 0.028, 0.016],
  click: [660, 0.05, 0.05],
  open: [520, 0.08, 0.045],
  close: [392, 0.08, 0.04],
};

/* ---- the preference, as an external store ----
   localStorage is the source of truth, the way `data-theme` is for the theme.
   Keeping a second copy in React state means the value that decides whether a
   cue plays and the value the toggle renders can disagree. */

const listeners = new Set<() => void>();

function readEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    // Blocked storage: silence is the right default anyway.
    return false;
  }
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Fires for other tabs only, which is exactly the case the manual notify
  // below cannot cover.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** The server cannot read the preference, and must not guess at it. */
const getServerSnapshot = () => false;

/**
 * Sound is off until asked for, and synthesised rather than loaded: four cues
 * of a few milliseconds each are cheaper as oscillators than as network
 * requests, and nothing has to ship in `public/`.
 *
 * The AudioContext is created on the first play, never at mount - browsers
 * refuse to start one before a gesture, and an autoplay-blocked context logs a
 * warning on every page load.
 */
export function SoundProvider({ children }: { children: React.ReactNode }) {
  const enabled = useSyncExternalStore(
    subscribe,
    readEnabled,
    getServerSnapshot,
  );
  const ctxRef = useRef<AudioContext | null>(null);

  const play = useCallback((cue: Cue) => {
    // Read the store, not the rendered value: this lets the toggle confirm
    // itself with a cue in the same tick it turns sound on.
    if (!readEnabled()) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    try {
      const ctx =
        ctxRef.current ??
        (ctxRef.current = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext)());
      if (ctx.state === "suspended") void ctx.resume();

      const [freq, seconds, peak] = CUES[cue];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      // A 4ms ramp in and an exponential tail out: a square envelope clicks,
      // and the click is louder than the cue itself.
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(peak, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + seconds);

      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + seconds + 0.02);
    } catch {
      // No audio device, or a context the browser will not grant.
    }
  }, []);

  const toggle = useCallback(() => {
    const next = !readEnabled();
    try {
      localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
    } catch {
      // The preference simply will not persist.
    }
    listeners.forEach((notify) => notify());
    if (next) play("click");
  }, [play]);

  const value = useMemo(
    () => ({ enabled, toggle, play }),
    [enabled, toggle, play],
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound(): SoundContextValue {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    throw new Error("useSound must be used inside <SoundProvider>");
  }
  return ctx;
}
