"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSound } from "@/lib/sound";
import { WorksRing, type RingItem } from "@/components/works/WorksRing";
import type { RingConfig } from "@/content/config";

export type WorkEntry = {
  id: string;
  name: string;
  tags: string[];
  href?: string;
  glow: string;
  image?: { src: string; position?: string };
  /** One line, shown under the rail slide on a phone. */
  caption: string;
};

/**
 * The list is the page; the ring beside it is a viewer.
 *
 * Pointer hover and keyboard focus both drive it, so the ring is not something
 * only a mouse can reach. Leaving a row does not release the ring at once: a
 * short delay means moving down the list retargets smoothly instead of
 * flashing through the released state between every pair of rows.
 *
 * Nothing is a link unless the work is actually reachable - Konnectify is
 * proprietary and stays inert.
 */
export function WorksList({
  entries,
  config,
}: {
  entries: WorkEntry[];
  config: RingConfig;
}) {
  const [focusId, setFocusId] = useState<string | null>(null);
  const release = useRef<number | null>(null);
  const { play } = useSound();

  useEffect(
    () => () => {
      if (release.current !== null) window.clearTimeout(release.current);
    },
    [],
  );

  const hold = (id: string) => {
    if (release.current !== null) window.clearTimeout(release.current);
    if (id !== focusId) {
      setFocusId(id);
      play("hover");
    }
  };

  const letGo = () => {
    if (release.current !== null) window.clearTimeout(release.current);
    release.current = window.setTimeout(
      () => setFocusId(null),
      config.releaseDelayMs,
    );
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFocusId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const ringItems: RingItem[] = entries.map((entry) => ({
    id: entry.id,
    title: entry.name,
    image: entry.image,
    glow: entry.glow,
    href: entry.href,
  }));

  const open = (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry?.href) return;
    play("click");
    window.open(entry.href, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="contents">
      <ul
        className="mt-[19px] flex w-full list-none flex-col gap-3"
        onMouseLeave={letGo}
      >
        {entries.map((entry, i) => {
          const inner = (
            <>
              <span className="rule-row-name animate-[row-name-in_450ms_var(--ease-out)_var(--row-start)_both]">
                {entry.name}
              </span>
              <span
                className="rule-row-line animate-[row-draw_550ms_var(--ease-out)_calc(var(--row-start)+120ms)_both]"
                aria-hidden="true"
              />
              <span className="rule-row-tags animate-[row-tags-in_280ms_var(--ease-out)_calc(var(--row-start)+670ms)_both]">
                {entry.tags.join(" • ")}
              </span>
            </>
          );

          const handlers = {
            onMouseEnter: () => hold(entry.id),
            onFocus: () => hold(entry.id),
            onBlur: letGo,
          };

          return (
            <li
              key={entry.id}
              style={
                {
                  "--row-start": `${0.5 + i * 0.07}s`,
                } as React.CSSProperties
              }
            >
              {entry.href ? (
                <Link
                  href={entry.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  {...handlers}
                  onClick={() => play("click")}
                  className="rule-row"
                >
                  {inner}
                </Link>
              ) : (
                <div {...handlers} tabIndex={0} className="rule-row cursor-pointer">
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-[14px] leading-[21px] tracking-[-0.01em] text-n500">
        Konnectify&rsquo;s product is proprietary — no link, no screenshot.
      </p>

      {/* The ring, in the right plate. */}
      <div className="works-preview">
        <WorksRing
          items={ringItems}
          focusId={focusId}
          onFocusIndex={setFocusId}
          onOpen={open}
          config={config}
        />
      </div>

      {/* Under 1050px there is no room for a ring, so the works become a rail
          you swipe. Same images, no 3D. */}
      <div className="works-rail" aria-hidden="true">
        {entries.map((entry) => (
          <div key={entry.id} className="works-rail-slide">
            <div
              className="works-rail-face"
              style={
                entry.image
                  ? { background: "#0E0F13" }
                  : { backgroundImage: entry.glow }
              }
            >
              {entry.image ? (
                <Image
                  src={entry.image.src}
                  alt=""
                  fill
                  sizes="72vw"
                  className="object-cover"
                  style={{ objectPosition: entry.image.position ?? "center top" }}
                />
              ) : (
                <span className="works-rail-title">{entry.name}</span>
              )}
            </div>
            <p className="works-rail-caption">{entry.caption}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
