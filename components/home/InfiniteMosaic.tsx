"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { MarqueeConfig } from "@/content/config";
import { useIsDesktop, usePrefersReducedMotion } from "@/lib/useMediaQuery";

/**
 * The works column, scrolling itself forever.
 *
 * The rows are rendered twice - set A and a clone - and the track is moved by a
 * rAF loop rather than a CSS keyframe. Keyframes would tie the speed to the
 * content height, so adding a project would silently make the column faster;
 * here the speed is px per second whatever is in it, and the same on a 60Hz and
 * a 120Hz display because every frame multiplies by its own delta.
 *
 * The wrap is seamless because the translation is folded into [-H, 0) every
 * frame, where H is set A's height plus one row gap: at either end of that
 * range the two sets line up exactly, so there is no frame where a seam shows.
 *
 * The clone is `inert` and `aria-hidden`, so a keyboard or a screen reader
 * meets every card exactly once.
 */
export function InfiniteMosaic({
  rows,
  config,
}: {
  rows: ReactNode;
  config: MarqueeConfig;
}) {
  const isDesktop = useIsDesktop();
  const reduced = usePrefersReducedMotion();
  const animated = config.enabled && isDesktop && !reduced;

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);

  /** How many times set A repeats, so one set is at least
   *  `minTrackViewports` tall and the loop is never visibly short. */
  const [repeat, setRepeat] = useState(1);

  const offset = useRef(0);
  const period = useRef(1);
  const factor = useRef(1);
  const targetFactor = useRef(1);
  const frame = useRef<number | null>(null);
  const paused = useRef(false);

  const paint = useCallback(() => {
    const track = trackRef.current;
    if (track) {
      track.style.transform = `translate3d(0, ${offset.current}px, 0)`;
    }
  }, []);

  /** Fold any offset into [-H, 0), where the two sets coincide. */
  const wrap = useCallback(() => {
    const H = period.current;
    if (H <= 0) return;
    offset.current = (((offset.current % H) + H) % H) - H;
  }, []);

  /* ---- measure ---- */
  useEffect(() => {
    if (!animated) return;
    const set = setRef.current;
    const viewport = viewportRef.current;
    if (!set || !viewport) return;

    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      // The seam sits one track gap below set A's last row, so that gap is part
      // of the period; leave it out and the loop jumps by 20px every cycle.
      const gap = parseFloat(getComputedStyle(track).rowGap || "0") || 0;
      const height = set.offsetHeight + gap;
      if (height <= 0) return;
      period.current = height;

      // Repeat the content until one set is tall enough that the loop does not
      // read as a short cycle. Measured per copy, so this converges in one step.
      const perCopy = height / repeat;
      const wanted = Math.max(
        1,
        Math.ceil((config.minTrackViewports * viewport.clientHeight) / perCopy),
      );
      if (wanted !== repeat) setRepeat(wanted);
      wrap();
      paint();
    };

    // ResizeObserver fires once on observe, which is the initial measurement;
    // calling measure() here as well would set state during the effect body.
    const observer = new ResizeObserver(measure);
    observer.observe(set);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [animated, repeat, config.minTrackViewports, wrap, paint]);

  /* ---- the loop ---- */
  useEffect(() => {
    if (!animated) {
      if (trackRef.current) trackRef.current.style.transform = "";
      return;
    }

    const sign = config.direction === "down" ? 1 : -1;
    offset.current = config.direction === "down" ? -period.current : 0;
    let last = performance.now();

    function step(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // Ease towards the target rather than snapping, so a hover reads as the
      // column slowing down rather than stopping dead.
      factor.current += (targetFactor.current - factor.current) * Math.min(1, dt * 10);

      if (!paused.current) {
        offset.current += sign * config.speedPxPerSec * factor.current * dt;
        wrapInner();
        paintInner();
      }
      frame.current = requestAnimationFrame(step);
    }

    function wrapInner() {
      const H = period.current;
      if (H <= 0) return;
      offset.current = (((offset.current % H) + H) % H) - H;
    }
    function paintInner() {
      const track = trackRef.current;
      if (track) {
        track.style.transform = `translate3d(0, ${offset.current}px, 0)`;
      }
    }

    frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    };
  }, [animated, config.direction, config.speedPxPerSec]);

  /* ---- pause when it cannot be seen ---- */
  useEffect(() => {
    if (!animated) return;
    const viewport = viewportRef.current;
    if (!viewport) return;

    let onScreen = true;
    const settle = () => {
      paused.current = document.hidden || !onScreen;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        settle();
      },
      { threshold: 0 },
    );
    observer.observe(viewport);
    document.addEventListener("visibilitychange", settle);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", settle);
    };
  }, [animated]);

  /* ---- scrub, and pause on focus ---- */
  useEffect(() => {
    if (!animated) return;
    const viewport = viewportRef.current;
    if (!viewport) return;

    const nudge = (by: number) => {
      offset.current += by;
      wrap();
      paint();
    };

    const onWheel = (e: WheelEvent) => {
      if (!config.wheelScrub) return;
      // One notch should feel like one notch, not a leap.
      const by = Math.max(-200, Math.min(200, -e.deltaY));
      e.preventDefault();
      nudge(by);
    };

    let dragging = false;
    let lastY = 0;
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      dragging = true;
      lastY = e.clientY;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      nudge(e.clientY - lastY);
      lastY = e.clientY;
    };
    const onPointerUp = () => {
      dragging = false;
    };

    // A card that has just taken focus must be on screen, and must stay there.
    const onFocusIn = (e: FocusEvent) => {
      targetFactor.current = 0;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const card = target.getBoundingClientRect();
      const box = viewport.getBoundingClientRect();
      if (card.top < box.top) nudge(box.top - card.top + 20);
      else if (card.bottom > box.bottom) nudge(box.bottom - card.bottom - 20);
    };
    const onFocusOut = (e: FocusEvent) => {
      if (viewport.contains(e.relatedTarget as Node)) return;
      targetFactor.current = 1;
    };

    viewport.addEventListener("wheel", onWheel, { passive: false });
    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", onPointerUp);
    viewport.addEventListener("pointercancel", onPointerUp);
    viewport.addEventListener("focusin", onFocusIn);
    viewport.addEventListener("focusout", onFocusOut);
    return () => {
      viewport.removeEventListener("wheel", onWheel);
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", onPointerUp);
      viewport.removeEventListener("pointercancel", onPointerUp);
      viewport.removeEventListener("focusin", onFocusIn);
      viewport.removeEventListener("focusout", onFocusOut);
    };
  }, [animated, config.wheelScrub, wrap, paint]);

  /* ---- the static column ---- */
  if (!animated) {
    return (
      <div
        className={reduced && isDesktop ? "home-marquee is-still" : undefined}
      >
        <div className="mosaic">{rows}</div>
      </div>
    );
  }

  const copies = Array.from({ length: repeat }, (_, i) => (
    <div className="mosaic" key={i}>
      {rows}
    </div>
  ));

  return (
    <div
      ref={viewportRef}
      className={`home-marquee${config.edgeFadePx > 0 ? " has-fade" : ""}`}
      style={
        config.edgeFadePx > 0
          ? ({ "--marquee-fade": `${config.edgeFadePx}px` } as React.CSSProperties)
          : undefined
      }
      onMouseEnter={
        config.pauseOnHover
          ? () => {
              targetFactor.current = config.hoverSpeedFactor;
            }
          : undefined
      }
      onMouseLeave={
        config.pauseOnHover
          ? () => {
              targetFactor.current = 1;
            }
          : undefined
      }
    >
      <div ref={trackRef} className="home-marquee-track">
        <div ref={setRef} className="home-marquee-set">
          {copies}
        </div>
        {/* The clone exists only to fill the seam. Nothing in it is reachable:
            every card in it is the same card as one in the set above. */}
        <div className="home-marquee-set" aria-hidden="true" inert>
          {copies}
        </div>
      </div>
    </div>
  );
}
