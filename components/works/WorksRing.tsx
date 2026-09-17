"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RingConfig } from "@/content/config";
import { usePrefersReducedMotion } from "@/lib/useMediaQuery";

export type RingItem = {
  id: string;
  title: string;
  image?: { src: string; position?: string };
  glow: string;
  href?: string;
};

/**
 * The ring of work images beside the list.
 *
 * The geometry is what makes it scale to any number of works: each tile is the
 * ring's chord, `span x sin(pi / n)`, and the radius is `tileW / (2 sin(pi/n))`,
 * so the tiles always meet edge to edge. More works means smaller tiles, down
 * to the clamp; fewer means bigger, up to it. Nothing is hand-tuned per count.
 *
 * The spin is written straight onto a custom property from rAF. React only
 * re-renders when the focused work changes - once per hover, not once per
 * frame - and the back-facing flag is a data attribute React never writes, so
 * a re-render cannot clear it mid-turn.
 *
 * The ring duplicates what the list already says, so it is hidden from
 * assistive technology; the rows beside it stay the real controls.
 */
export function WorksRing({
  items,
  focusId,
  onFocusIndex,
  onOpen,
  config,
}: {
  items: RingItem[];
  focusId: string | null;
  /** A card was clicked: make it the focused one. */
  onFocusIndex: (id: string) => void;
  /** The focused card was clicked again: open the work. */
  onOpen: (id: string) => void;
  config: RingConfig;
}) {
  const reduced = usePrefersReducedMotion();

  /* ---- which items are on the ring ----
     Past `maxItems` the ring shows a window of that many works, anchored so the
     focused one is always in it. A window rather than two rings: one ring keeps
     the tiles edge to edge, which is the whole look. */
  const [windowStart, setWindowStart] = useState(0);
  const windowed = items.length > config.maxItems;

  const focusIndexInAll = focusId ? items.findIndex((i) => i.id === focusId) : -1;

  const start = useMemo(() => {
    if (!windowed) return 0;
    const max = items.length - config.maxItems;
    if (focusIndexInAll < 0) return Math.min(windowStart, max);
    const half = Math.floor(config.maxItems / 2);
    return Math.max(0, Math.min(max, focusIndexInAll - half));
  }, [windowed, items.length, config.maxItems, focusIndexInAll, windowStart]);

  useEffect(() => {
    if (windowed && start !== windowStart) {
      // Written back so the window stays put once focus is released.
      const id = requestAnimationFrame(() => setWindowStart(start));
      return () => cancelAnimationFrame(id);
    }
  }, [windowed, start, windowStart]);

  const shown = useMemo(
    () => (windowed ? items.slice(start, start + config.maxItems) : items),
    [windowed, items, start, config.maxItems],
  );

  const count = shown.length;
  const focusIndex = focusId ? shown.findIndex((i) => i.id === focusId) : -1;
  const hasFocus = focusIndex >= 0;

  /* ---- the spin ---- */
  const stageRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const spin = useRef(0);
  const velocity = useRef(0);
  const target = useRef<number | null>(null);
  const frame = useRef<number | null>(null);
  const dragging = useRef(false);

  const step = count > 0 ? 360 / count : 360;

  const paint = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.style.setProperty("--ring-spin", `${spin.current}deg`);

    // A card past the quarter turn is being seen from behind; its face has to
    // be flipped back or the screenshot reads mirrored.
    for (let i = 0; i < cardsRef.current.length; i++) {
      const card = cardsRef.current[i];
      if (!card) continue;
      const angle = ((spin.current + i * step) * Math.PI) / 180;
      const back = Math.cos(angle) < 0;
      if (back) card.dataset.back = "1";
      else delete card.dataset.back;
    }
  }, [step]);

  /** The shortest way round to a heading, so the ring never takes the long
   *  way for the sake of a number. */
  const shortestTo = (to: number, from: number) => {
    let delta = (to - from) % 360;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    return from + delta;
  };

  useEffect(() => {
    if (count === 0) return;
    if (reduced) {
      // No idle drift and no easing: focusing jumps, and the cross-fade does
      // the rest of the work.
      if (focusIndex >= 0) spin.current = -focusIndex * step;
      paint();
      return;
    }

    let last = performance.now();

    function tick(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (dragging.current) {
        // The pointer is driving; nothing else touches the spin.
      } else if (target.current !== null) {
        // Ease in, with a time constant that lands inside `frontMs`.
        const k = Math.min(1, dt * (1000 / Math.max(60, config.frontMs)) * 4);
        spin.current += (target.current - spin.current) * k;
        if (Math.abs(target.current - spin.current) < 0.05) {
          spin.current = target.current;
        }
      } else if (Math.abs(velocity.current) > 0.02) {
        spin.current += velocity.current * dt * 60;
        velocity.current *= config.inertiaFriction;
      } else {
        velocity.current = 0;
        spin.current += config.idleDegPerSec * dt;
      }

      paintInner();
      frame.current = requestAnimationFrame(tick);
    }

    function paintInner() {
      const stage = stageRef.current;
      if (!stage) return;
      stage.style.setProperty("--ring-spin", `${spin.current}deg`);
      for (let i = 0; i < cardsRef.current.length; i++) {
        const card = cardsRef.current[i];
        if (!card) continue;
        const angle = ((spin.current + i * step) * Math.PI) / 180;
        if (Math.cos(angle) < 0) card.dataset.back = "1";
        else delete card.dataset.back;
      }
    }

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    };
  }, [
    count,
    reduced,
    step,
    focusIndex,
    paint,
    config.frontMs,
    config.idleDegPerSec,
    config.inertiaFriction,
  ]);

  /** Retarget whenever the focused row changes. Releasing simply drops the
   *  target; the idle drift picks the ring back up from wherever it is. */
  useEffect(() => {
    if (count === 0) return;
    if (focusIndex >= 0) {
      target.current = shortestTo(-focusIndex * step, spin.current);
      velocity.current = 0;
    } else {
      target.current = null;
    }
  }, [focusIndex, step, count]);

  /* ---- drag ---- */
  const dragFrom = useRef(0);
  const dragLast = useRef({ x: 0, t: 0 });

  const onPointerDown = (e: React.PointerEvent) => {
    if (reduced) return;
    dragging.current = true;
    target.current = null;
    velocity.current = 0;
    dragFrom.current = e.clientX;
    dragLast.current = { x: e.clientX, t: performance.now() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragLast.current.x;
    const dt = Math.max(1, performance.now() - dragLast.current.t);
    spin.current += dx * config.dragDegPerPx;
    velocity.current = ((dx * config.dragDegPerPx) / dt) * 16;
    dragLast.current = { x: e.clientX, t: performance.now() };
    paint();
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  /* ---- the geometry ---- */
  const sin = count > 1 ? Math.sin(Math.PI / count) : 1;
  const stageStyle = {
    "--ring-count": count,
    "--ring-sin": sin.toFixed(5),
    "--ring-span": `min(${config.spanCqw}cqw, ${config.spanCqh}cqh)`,
    "--ring-tile-min": `${config.tileMinPx}px`,
    "--ring-tile-max": `${config.tileMaxPx}px`,
    "--ring-aspect": config.tileAspect,
    "--ring-tilt": `${config.tiltDeg}deg`,
    "--ring-front-scale": config.frontScale,
    "--ring-focus-max": `${config.focusMaxCqw}cqw`,
    "--ring-perspective-factor": config.perspectiveFactor,
    "--ring-front-ms": `${config.frontMs}ms`,
    "--ring-return-ms": `${config.returnMs}ms`,
    "--ring-fade-ms": `${config.fadeMs}ms`,
  } as React.CSSProperties;

  if (count === 0) return null;

  return (
    <div
      ref={stageRef}
      className={`works-ring-stage${hasFocus ? " has-focus" : ""}${
        count === 1 ? " is-single" : ""
      }`}
      style={stageStyle}
      aria-hidden="true"
      onPointerDown={count > 1 ? onPointerDown : undefined}
      onPointerMove={count > 1 ? onPointerMove : undefined}
      onPointerUp={count > 1 ? onPointerUp : undefined}
      onPointerCancel={count > 1 ? onPointerUp : undefined}
    >
      <div className="works-ring-lens">
        <div className="works-ring">
          {shown.map((item, i) => (
            <div
              key={item.id}
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              className={`works-ring-card${
                i === focusIndex ? " is-front" : ""
              }`}
              style={{ "--i": i } as React.CSSProperties}
              onClick={() => (i === focusIndex ? onOpen(item.id) : onFocusIndex(item.id))}
            >
              <RingFace item={item} front={i === focusIndex} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** A screenshot where one exists, the tuned title card where one does not -
 *  the same two faces the rest of the site uses for a work. */
function RingFace({ item, front }: { item: RingItem; front: boolean }) {
  return (
    <div
      className="works-ring-face"
      style={item.image ? { background: "#0E0F13" } : { backgroundImage: item.glow }}
    >
      {item.image ? (
        <Image
          src={item.image.src}
          alt=""
          fill
          // The focused card is several times larger, so it asks for a much
          // bigger source; the ring tiles stay small.
          sizes={front ? "70vw" : "380px"}
          className="object-cover"
          style={{ objectPosition: item.image.position ?? "center top" }}
        />
      ) : (
        <span className="works-ring-title">{item.title}</span>
      )}
    </div>
  );
}
