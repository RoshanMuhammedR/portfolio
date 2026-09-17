"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSound } from "@/lib/sound";
import type { CraftItem } from "@/content/craft";

export type { CraftItem };

const FRICTION = 0.94;
/** Below this the drift is invisible and only costs frames. */
const STOP = 0.05;
/** How far past the content you can pull before it stops giving. */
const SLACK = 160;
/** Movement under this is a click, not a drag. */
const DRAG_THRESHOLD = 4;

/**
 * The manual-layout board: tiles at the x/y/w/h stored on each row.
 *
 * Not used by any page. `/craft` renders InfiniteCraftBoard, which lays tiles
 * out from `sort`; this stays only as the renderer for an optional manual-layout
 * mode, should one be wanted (the x/y/w/h columns are still in the table).
 *
 * Drag to explore.
 *
 * The pan is written straight onto the world's transform inside a rAF loop
 * rather than through React state: at 60fps a state update per pointermove
 * re-renders every tile on the board, and the drag visibly stutters once there
 * are more than a handful.
 *
 * The pointer is only captured once it has actually moved. Capturing on
 * pointerdown would retarget the click to the board itself, so a plain click on
 * a tile would never reach its link.
 */
export function CraftCanvas({ items }: { items: CraftItem[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const { play } = useSound();

  const pan = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const captured = useRef(false);
  const moved = useRef(false);
  const origin = useRef({ x: 0, y: 0 });
  const last = useRef({ x: 0, y: 0, t: 0 });
  const frame = useRef<number | null>(null);

  /** The rectangle the pan may travel in, recomputed on resize. */
  const bounds = useRef({ minX: 0, maxX: 0, minY: 0, maxY: 0 });

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport || items.length === 0) return;

    const right = Math.max(...items.map((i) => i.x + i.w));
    const bottom = Math.max(...items.map((i) => i.y + i.h));
    const left = Math.min(...items.map((i) => i.x));
    const top = Math.min(...items.map((i) => i.y));

    bounds.current = {
      minX: Math.min(0, viewport.clientWidth - right - SLACK),
      maxX: Math.max(0, SLACK - left),
      minY: Math.min(0, viewport.clientHeight - bottom - SLACK),
      maxY: Math.max(0, SLACK - top),
    };
  }, [items]);

  const clamp = useCallback(() => {
    const b = bounds.current;
    pan.current.x = Math.min(b.maxX, Math.max(b.minX, pan.current.x));
    pan.current.y = Math.min(b.maxY, Math.max(b.minY, pan.current.y));
  }, []);

  const paint = useCallback(() => {
    const world = worldRef.current;
    if (world) {
      world.style.transform = `translate3d(${pan.current.x}px, ${pan.current.y}px, 0)`;
    }
  }, []);

  /** The loop lives in a hoisted inner function so it can schedule itself
   *  without the callback having to name its own binding before it exists. */
  const startGlide = useCallback(() => {
    function step() {
      velocity.current.x *= FRICTION;
      velocity.current.y *= FRICTION;
      pan.current.x += velocity.current.x;
      pan.current.y += velocity.current.y;
      clamp();
      paint();

      if (
        Math.abs(velocity.current.x) > STOP ||
        Math.abs(velocity.current.y) > STOP
      ) {
        frame.current = requestAnimationFrame(step);
      } else {
        frame.current = null;
      }
    }
    frame.current = requestAnimationFrame(step);
  }, [clamp, paint]);

  useEffect(() => {
    measure();
    paint();
    const onResize = () => {
      measure();
      clamp();
      paint();
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [measure, clamp, paint]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    captured.current = false;
    moved.current = false;
    velocity.current = { x: 0, y: 0 };
    origin.current = { x: e.clientX, y: e.clientY };
    last.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;

    if (!moved.current) {
      const travelled = Math.hypot(
        e.clientX - origin.current.x,
        e.clientY - origin.current.y,
      );
      if (travelled < DRAG_THRESHOLD) return;
      moved.current = true;
    }
    if (!captured.current) {
      viewportRef.current?.setPointerCapture(e.pointerId);
      viewportRef.current?.classList.add("is-dragging");
      captured.current = true;
    }

    const now = performance.now();
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    const dt = Math.max(1, now - last.current.t);

    pan.current.x += dx;
    pan.current.y += dy;
    clamp();
    paint();

    // Velocity in px/frame, so the glide loop can use it directly.
    velocity.current = { x: (dx / dt) * 16, y: (dy / dt) * 16 };
    last.current = { x: e.clientX, y: e.clientY, t: now };
  };

  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    viewportRef.current?.classList.remove("is-dragging");
    if (!moved.current) return;
    play("hover");

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!still && frame.current === null) startGlide();
  };

  /** Arrow keys pan too, so the board is not pointer-only. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 240 : 80;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [step, 0],
      ArrowRight: [-step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    pan.current.x += move[0];
    pan.current.y += move[1];
    clamp();
    paint();
  };

  return (
    <div
      ref={viewportRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="application"
      aria-label="Craft board. Drag to explore, or pan with the arrow keys."
      aria-roledescription="pannable canvas"
      className="relative z-[1] h-dvh w-full cursor-grab touch-none select-none overflow-hidden bg-n50 [&.is-dragging]:cursor-grabbing"
    >
      <div
        className="dot-field pointer-events-none absolute inset-0"
        aria-hidden="true"
      />

      <div ref={worldRef} className="absolute inset-0 will-change-transform">
        {items.map((item) => {
          const tile = item.image ? (
            // Board images can come from the CMS or a remote bucket, so this is
            // a plain img rather than next/image and its host allow-list.
            <img
              src={item.image}
              alt={item.title}
              draggable={false}
              // The board is the whole page, so every tile is content: eager
              // loading avoids grey boxes popping in as the first paint settles.
              loading="eager"
              decoding="async"
              className="h-full w-full rounded-xl border border-n200 bg-n100 object-cover [-webkit-user-drag:none]"
            />
          ) : (
            <>
              <div
                className="h-full w-full rounded-xl border border-n200"
                style={{ backgroundImage: item.glow }}
              />
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-[16px] font-medium text-white">
                {item.title}
              </span>
            </>
          );

          return (
            <div
              key={item.id}
              className="absolute"
              style={{ left: item.x, top: item.y, width: item.w, height: item.h }}
            >
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  draggable={false}
                  // A drag that ends on a tile must not also open it.
                  onClick={(e) => {
                    if (moved.current) e.preventDefault();
                  }}
                  className="relative block h-full w-full transition-transform duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1"
                >
                  {tile}
                </a>
              ) : (
                <div className="relative h-full w-full">{tile}</div>
              )}
              {item.caption ? (
                <p className="mt-2.5 text-[13px] tracking-[-0.01em] text-n500">
                  {item.caption}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
