"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import type { CraftItem } from "@/content/craft";
import type { BoardConfig } from "@/content/config";
import { useSound } from "@/lib/sound";
import { usePrefersReducedMotion } from "@/lib/useMediaQuery";
import {
  buildPattern,
  instancesIn,
  visibility,
  type Instance,
} from "@/lib/craftPattern";

/** Movement under this is a click, not a drag. */
const DRAG_THRESHOLD = 4;
/** Below this the glide is invisible and only costs frames. */
const STOP = 0.05;
/** How far the pan may travel before the live set is recomputed. */
const RECOMPUTE_AFTER = 120;
/** How far the pointer may wander and still count as dwelling on a tile. */
const DWELL_SLOP = 6;

/** A copy on the board, and whether it was part of the first screen - those
 *  load eagerly because they are the page; the rest load as they are found. */
type LiveInstance = Instance & { eager: boolean };

type Hover = {
  key: string;
  item: CraftItem;
  /** Screen rectangle of the tile the card is attached to. */
  rect: { left: number; top: number; width: number; height: number };
};

/**
 * The board, with no edges.
 *
 * The works are laid out once into a masonry block, and that block is the
 * repeating unit: every tile is drawn at every multiple of the block's width
 * and height, so panning in any direction only ever uncovers more work. Only
 * the copies that touch the viewport exist in the DOM - typically twenty or
 * thirty - and the set is recomputed when the pan has moved far enough to
 * matter, not every frame.
 *
 * The pan itself is written straight onto the world's transform from rAF. At
 * 60fps a React state update per pointermove re-renders every tile, and the
 * drag visibly stutters.
 *
 * Tiles take no pointer events; hover is hit-tested against their rectangles.
 * That is what lets a tile fade and scale without its hit area lagging behind,
 * and what makes a 600ms dwell measurable at all.
 */
export function InfiniteCraftBoard({
  items,
  config,
}: {
  items: CraftItem[];
  config: BoardConfig;
}) {
  const reduced = usePrefersReducedMotion();
  const { play } = useSound();

  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const nodes = useRef<Map<string, HTMLElement>>(new Map());

  const pattern = useMemo(() => buildPattern(items, config), [items, config]);

  const pan = useRef({ ...config.initialPan });
  const velocity = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const captured = useRef(false);
  const moved = useRef(false);
  const origin = useRef({ x: 0, y: 0 });
  const last = useRef({ x: 0, y: 0, t: 0 });
  const frame = useRef<number | null>(null);
  const computedAt = useRef({ x: NaN, y: NaN });

  const [live, setLive] = useState<LiveInstance[]>([]);
  const [hover, setHover] = useState<Hover | null>(null);
  const [lightbox, setLightbox] = useState<CraftItem | null>(null);
  /** The copy a keyboard user has reached through the index list. */
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  /** The tiles that were on screen at first paint. Those load eagerly - they
   *  are the page - and everything uncovered by panning loads lazily. */
  const firstScreen = useRef<Set<string> | null>(null);

  const dwell = useRef<number | null>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const dwellFrom = useRef({ x: 0, y: 0 });

  /* ---- which copies exist ---- */
  const recompute = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const w = viewport.clientWidth;
    const h = viewport.clientHeight;

    // `initialPan` is the reference's, tuned for a desktop window. On a phone a
    // tile is nearly as wide as the screen, and that offset leaves every tile
    // straddling an edge - all of them dimmed, none in focus. Start there with
    // the first work centred instead.
    const first = pattern.tiles[0];
    if (Number.isNaN(computedAt.current.x) && w < 768 && first) {
      pan.current = {
        x: Math.round(w / 2 - (first.x + first.w / 2)),
        y: Math.round(h / 2 - (first.y + first.h / 2)),
      };
    }

    const next = instancesIn(
      pattern,
      {
        left: -pan.current.x,
        top: -pan.current.y,
        right: -pan.current.x + w,
        bottom: -pan.current.y + h,
      },
      config.tileWidth + config.gap,
    );
    computedAt.current = { ...pan.current };
    const onFirstScreen = (firstScreen.current ??= new Set(
      next.map((instance) => instance.key),
    ));
    setLive(
      next.map((instance) => ({
        ...instance,
        eager: onFirstScreen.has(instance.key),
      })),
    );
  }, [pattern, config.tileWidth, config.gap]);

  /** The world transform, the dot field's parallax, and every tile's
   *  brightness - all of it written imperatively, once per frame. */
  const paint = useCallback(() => {
    const viewport = viewportRef.current;
    const world = worldRef.current;
    if (!viewport || !world) return;

    world.style.transform = `translate3d(${pan.current.x}px, ${pan.current.y}px, 0)`;
    if (dotsRef.current) {
      dotsRef.current.style.backgroundPosition = `${pan.current.x % 18}px ${
        pan.current.y % 18
      }px`;
    }

    const w = viewport.clientWidth;
    const h = viewport.clientHeight;
    for (const [, node] of nodes.current) {
      const x = Number(node.dataset.x) + pan.current.x;
      const y = Number(node.dataset.y) + pan.current.y;
      const v = visibility(
        x + Number(node.dataset.w) / 2,
        y + Number(node.dataset.h) / 2,
        w,
        h,
        config,
      );
      node.style.opacity = String(v);
      node.style.transform = reduced
        ? ""
        : `scale(${config.scaleMin + (1 - config.scaleMin) * v})`;
    }
  }, [config, reduced]);

  /* ---- the glide ---- */
  const glide = useCallback(() => {
    function stepFrame() {
      velocity.current.x *= config.friction;
      velocity.current.y *= config.friction;
      pan.current.x += velocity.current.x;
      pan.current.y += velocity.current.y;
      paint();

      if (
        Math.hypot(
          pan.current.x - computedAt.current.x,
          pan.current.y - computedAt.current.y,
        ) > RECOMPUTE_AFTER
      ) {
        recompute();
      }

      if (
        Math.abs(velocity.current.x) > STOP ||
        Math.abs(velocity.current.y) > STOP
      ) {
        frame.current = requestAnimationFrame(stepFrame);
      } else {
        frame.current = null;
      }
    }
    frame.current = requestAnimationFrame(stepFrame);
  }, [config.friction, paint, recompute]);

  /* ---- first paint, and resize ---- */
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(() => {
      recompute();
      paint();
    });
    observer.observe(viewport);
    return () => {
      observer.disconnect();
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [recompute, paint]);

  // Tiles that have just been added need their opacity and scale before the
  // browser paints them, or they flash in at full strength.
  useEffect(() => {
    paint();
  }, [live, paint]);

  /* ---- the idle drift ---- */
  useEffect(() => {
    if (reduced || config.idleDriftPxPerSec <= 0) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!dragging.current && frame.current === null) {
        pan.current.x -= config.idleDriftPxPerSec * dt;
        paint();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, config.idleDriftPxPerSec, paint]);

  /* ---- hover, by hit test ---- */
  const clearDwell = useCallback(() => {
    if (dwell.current !== null) window.clearTimeout(dwell.current);
    dwell.current = null;
    setHover(null);
  }, []);

  const tileAt = useCallback((clientX: number, clientY: number) => {
    for (const [key, node] of nodes.current) {
      const rect = node.getBoundingClientRect();
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        return { key, node, rect };
      }
    }
    return null;
  }, []);

  const armDwell = useCallback(
    (clientX: number, clientY: number, delay: number) => {
      if (dwell.current !== null) window.clearTimeout(dwell.current);
      dwellFrom.current = { x: clientX, y: clientY };
      dwell.current = window.setTimeout(() => {
        if (
          dragging.current ||
          frame.current !== null ||
          Math.hypot(
            pointer.current.x - dwellFrom.current.x,
            pointer.current.y - dwellFrom.current.y,
          ) > DWELL_SLOP
        ) {
          return;
        }
        const hit = tileAt(pointer.current.x, pointer.current.y);
        if (!hit) return;
        const instance = live.find((i) => i.key === hit.key);
        if (!instance) return;
        setHover({
          key: hit.key,
          item: instance.tile.item,
          rect: {
            left: hit.rect.left,
            top: hit.rect.top,
            width: hit.rect.width,
            height: hit.rect.height,
          },
        });
      }, delay);
    },
    [live, tileAt],
  );

  /* ---- input ---- */
  /** The info card lives inside the board, so pointer events on it arrive
   *  here too; they belong to the card's links, not to a drag or a hit test. */
  const onCard = (e: React.PointerEvent) =>
    Boolean(cardRef.current?.contains(e.target as Node));

  const onPointerDown = (e: React.PointerEvent) => {
    if (onCard(e)) return;
    dragging.current = true;
    captured.current = false;
    moved.current = false;
    velocity.current = { x: 0, y: 0 };
    origin.current = { x: e.clientX, y: e.clientY };
    last.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    pointer.current = { x: e.clientX, y: e.clientY };
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
    clearDwell();
    // Touch has no hover, so a long press stands in for one.
    if (e.pointerType !== "mouse") armDwell(e.clientX, e.clientY, 500);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    pointer.current = { x: e.clientX, y: e.clientY };

    if (!dragging.current) {
      if (onCard(e)) {
        if (dwell.current !== null) window.clearTimeout(dwell.current);
        return;
      }
      const hit = tileAt(e.clientX, e.clientY);
      const viewport = viewportRef.current;
      if (viewport) viewport.classList.toggle("is-hovering", Boolean(hit));
      if (!hit) {
        clearDwell();
      } else if (!hover || hover.key !== hit.key) {
        if (hover) setHover(null);
        armDwell(e.clientX, e.clientY, config.hoverDelayMs);
      }
      return;
    }

    if (!moved.current) {
      const travelled = Math.hypot(
        e.clientX - origin.current.x,
        e.clientY - origin.current.y,
      );
      if (travelled < DRAG_THRESHOLD) return;
      moved.current = true;
      clearDwell();
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
    paint();
    if (
      Math.hypot(
        pan.current.x - computedAt.current.x,
        pan.current.y - computedAt.current.y,
      ) > RECOMPUTE_AFTER
    ) {
      recompute();
    }

    velocity.current = { x: (dx / dt) * 16, y: (dy / dt) * 16 };
    last.current = { x: e.clientX, y: e.clientY, t: now };
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    viewportRef.current?.classList.remove("is-dragging");

    if (!moved.current) {
      // A tap, not a drag: open whatever is under the pointer.
      const hit = tileAt(e.clientX, e.clientY);
      const instance = hit ? live.find((i) => i.key === hit.key) : null;
      if (instance) {
        play("click");
        if (config.clickAction === "lightbox") setLightbox(instance.tile.item);
        else if (instance.tile.item.href) {
          window.open(instance.tile.item.href, "_blank", "noopener,noreferrer");
        }
      }
      return;
    }

    if (!reduced && frame.current === null) glide();
  };

  /** Wheel and trackpad pan; the board is the page here, so it takes the
   *  gesture rather than letting the document scroll behind it. */
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      clearDwell();
      pan.current.x -= e.deltaX * config.wheelSpeed;
      pan.current.y -= e.deltaY * config.wheelSpeed;
      paint();
      recompute();
    };
    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, [config.wheelSpeed, paint, recompute, clearDwell]);

  const focusWork = (itemId: string) => {
    const viewport = viewportRef.current;
    const tile = pattern.tiles.find((t) => t.item.id === itemId);
    if (!viewport || !tile) return;
    if (dwell.current !== null) window.clearTimeout(dwell.current);

    const w = viewport.clientWidth;
    const h = viewport.clientHeight;
    // The copy nearest to what is on screen now, so focus never sends the
    // board on a long trip.
    const kx = Math.round(
      (-pan.current.x + w / 2 - (tile.x + tile.w / 2)) / pattern.periodW,
    );
    const ky = Math.round(
      (-pan.current.y + h / 2 - (tile.y + tile.h / 2)) / pattern.periodH,
    );
    const x = tile.x + kx * pattern.periodW;
    const y = tile.y + ky * pattern.periodH;

    velocity.current = { x: 0, y: 0 };
    pan.current = { x: w / 2 - (x + tile.w / 2), y: h / 2 - (y + tile.h / 2) };
    paint();
    recompute();

    const key = `${tile.key}:${kx}:${ky}`;
    const box = viewport.getBoundingClientRect();
    setFocusedKey(key);
    setHover({
      key,
      item: tile.item,
      rect: {
        left: box.left + w / 2 - tile.w / 2,
        top: box.top + h / 2 - tile.h / 2,
        width: tile.w,
        height: tile.h,
      },
    });
  };

  const blurWork = () => {
    setFocusedKey(null);
    setHover(null);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setLightbox(null);
      clearDwell();
      return;
    }
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
    paint();
    recompute();
  };

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightbox]);

  const cardPlacement = hover ? placeCard(hover.rect) : null;

  return (
    <>
      <div
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={(e) => {
          if (!onCard(e)) clearDwell();
        }}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="application"
        aria-label="Craft board. Drag to explore, or pan with the arrow keys."
        aria-roledescription="pannable canvas"
        className="craft-board"
      >
        <div
          ref={dotsRef}
          className="dot-field pointer-events-none absolute inset-0"
          aria-hidden="true"
        />

        <div ref={worldRef} className="absolute inset-0 will-change-transform">
          {live.map((instance) => (
            <div
              key={instance.key}
              ref={(el) => {
                if (el) nodes.current.set(instance.key, el);
                else nodes.current.delete(instance.key);
              }}
              data-x={instance.x}
              data-y={instance.y}
              data-w={instance.tile.w}
              data-h={instance.tile.h}
              data-focused={instance.key === focusedKey ? "true" : undefined}
              className="craft-item"
              style={{
                left: instance.x,
                top: instance.y,
                width: instance.tile.w,
                height: instance.tile.h,
                transitionDuration: `${config.opacityMs}ms, ${config.transformMs}ms`,
                // The tile behind an open lightbox steps aside, the way the
                // reference's does.
                visibility:
                  lightbox && lightbox.id === instance.tile.item.id
                    ? "hidden"
                    : undefined,
              }}
            >
              {instance.tile.item.image ? (
                <img
                  src={instance.tile.item.image}
                  alt=""
                  draggable={false}
                  loading={instance.eager ? "eager" : "lazy"}
                  decoding="async"
                  className="craft-item-media"
                />
              ) : (
                <div
                  className="craft-item-media craft-item-glow"
                  style={{ backgroundImage: instance.tile.item.glow }}
                >
                  <span>{instance.tile.item.title}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* The dwell card. Placed against the tile, clamped to the viewport. */}
        {hover && cardPlacement ? (
          <div
            ref={cardRef}
            className="craft-info site-panel"
            style={cardPlacement}
            role="note"
            onPointerLeave={clearDwell}
          >
            <p className="craft-info-title">{hover.item.title}</p>
            {hover.item.description ? (
              <p className="craft-info-text">{hover.item.description}</p>
            ) : hover.item.caption ? (
              <p className="craft-info-text">{hover.item.caption}</p>
            ) : null}
            {hover.item.tags && hover.item.tags.length > 0 ? (
              <ul className="craft-info-tags">
                {hover.item.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            ) : null}
            <p className="craft-info-links">
              {hover.item.year ? <span>{hover.item.year}</span> : null}
              {hover.item.href ? (
                <a
                  href={hover.item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Live demo
                </a>
              ) : null}
              {hover.item.sourceUrl ? (
                <a
                  href={hover.item.sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Source
                </a>
              ) : null}
            </p>
          </div>
        ) : null}
      </div>

      {/* Every work, reachable without panning. Visually hidden because the
          board says the same thing in pictures - and a work that takes focus
          here is brought to the middle of the board, outlined, with its card
          open, so a keyboard user sees exactly what a pointer user does. */}
      <ul className="craft-index" aria-label="Every piece on the board">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={item.href ?? "#"}
              target={item.href ? "_blank" : undefined}
              rel={item.href ? "noreferrer noopener" : undefined}
              onFocus={() => focusWork(item.id)}
              onBlur={blurWork}
            >
              {item.title}
            </a>
            {item.description ? <span>{item.description}</span> : null}
            {item.sourceUrl ? (
              <a href={item.sourceUrl} target="_blank" rel="noreferrer noopener">
                Source
              </a>
            ) : null}
          </li>
        ))}
      </ul>

      {lightbox ? (
        <Lightbox item={lightbox} onClose={() => setLightbox(null)} />
      ) : null}
    </>
  );
}

/** Beside the tile where there is room, clamped so the card is never cut off. */
function placeCard(rect: Hover["rect"]): React.CSSProperties {
  const WIDTH = 300;
  const GAP = 14;
  const roomRight = window.innerWidth - rect.left - rect.width;
  const left =
    roomRight > WIDTH + GAP + 20
      ? rect.left + rect.width + GAP
      : Math.max(12, rect.left - WIDTH - GAP);

  const top = Math.min(
    window.innerHeight - 24,
    Math.max(12, rect.top + rect.height / 2 - 60),
  );
  return { left, top, width: WIDTH };
}

function Lightbox({
  item,
  onClose,
}: {
  item: CraftItem;
  onClose: () => void;
}) {
  return (
    <div className="craft-lightbox" role="dialog" aria-modal="true" aria-label={item.title}>
      <button
        type="button"
        className="craft-lightbox-backdrop craft-lightbox-chrome-on"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="craft-lightbox-body">
        {item.image ? (
          <img src={item.image} alt={item.title} className="craft-lightbox-img" />
        ) : (
          <div
            className="craft-lightbox-img craft-item-glow"
            style={{ backgroundImage: item.glow, width: 720, height: 450 }}
          >
            <span>{item.title}</span>
          </div>
        )}
        <p className="craft-lightbox-caption craft-lightbox-chrome-on">
          <span className="craft-lightbox-title">{item.title}</span>
          {item.description ?? item.caption ? (
            <span>{item.description ?? item.caption}</span>
          ) : null}
          {item.href ? (
            <a href={item.href} target="_blank" rel="noreferrer noopener">
              Open live demo
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          ) : null}
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="craft-lightbox-close"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
