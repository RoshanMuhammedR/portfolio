"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSound } from "@/lib/sound";
import type { WritingsListConfig } from "@/content/config";

export type WritingEntry = {
  id: string;
  slug: string;
  title: string;
  date: string;
  /** "15 September 2026" - the panel's meta line. */
  longDate: string;
  excerpt: string | null;
  readingMinutes: number | null;
  preview: string | null;
  previewKind: "image" | "illustration";
};

/**
 * The list is the page; the panel beside it is a viewer.
 *
 * Hover and keyboard focus both drive it, so the picture is not something only
 * a mouse can reach - and because every word in the panel is already in the row
 * that drives it, the panel itself is hidden from assistive technology.
 *
 * At rest it shows the newest piece rather than an empty plate - unless an idle
 * illustration is configured - and a piece with no picture yet is shown by its
 * opening instead: date, title and excerpt, set like the first page of it.
 *
 * The swap is out-in, the reference's timing: the old image fades out, then the
 * new one fades in, rather than the two crossing over each other. That is run
 * from the event handlers and a timer rather than from an effect, so React
 * never has to reconcile a state change it caused itself.
 */
export function WritingsList({
  entries,
  config,
}: {
  entries: WritingEntry[];
  config: WritingsListConfig;
}) {
  const idleId = config.idleIllustrationUrl ? null : (entries[0]?.id ?? null);
  const [shown, setShown] = useState<string | null>(idleId);
  const [visible, setVisible] = useState(true);
  const pending = useRef<string | null>(idleId);
  const timer = useRef<number | null>(null);
  const { play } = useSound();

  // Preview images are small and there are only a handful; fetching them up
  // front is what makes the first hover instant instead of blank.
  useEffect(() => {
    for (const entry of entries) {
      if (entry.preview) {
        const image = new Image();
        image.src = entry.preview;
      }
    }
  }, [entries]);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const hold = (id: string | null) => {
    if (pending.current === id) return;
    pending.current = id;

    if (timer.current !== null) window.clearTimeout(timer.current);
    setVisible(false);
    timer.current = window.setTimeout(() => {
      setShown(pending.current);
      setVisible(true);
    }, config.previewFadeMs);
  };

  const active = entries.find((entry) => entry.id === shown) ?? null;
  const source = active ? active.preview : config.idleIllustrationUrl;
  const kind = active ? active.previewKind : "illustration";
  const fade = {
    opacity: visible ? 1 : 0,
    transitionDuration: `${config.previewFadeMs}ms`,
  };

  const total = entries.length;

  return (
    <div className="contents">
      <ul
        className="mt-[19px] flex w-full list-none flex-col gap-3"
        onMouseLeave={() => hold(idleId)}
      >
        {entries.map((entry, i) => (
          <li
            key={entry.id}
            style={{ "--row-start": `${0.4 + i * 0.07}s` } as React.CSSProperties}
          >
            <Link
              href={`/writings/${entry.slug}`}
              onMouseEnter={() => {
                hold(entry.id);
                play("hover");
              }}
              onFocus={() => hold(entry.id)}
              onBlur={() => hold(idleId)}
              onClick={() => play("click")}
              className="rule-row writings-row"
            >
              <span className="rule-row-name animate-[row-name-in_450ms_var(--ease-out)_var(--row-start)_both]">
                {entry.title}
              </span>
              <span
                className="rule-row-line animate-[row-draw_550ms_var(--ease-out)_calc(var(--row-start)+120ms)_both]"
                aria-hidden="true"
              />
              <span className="rule-row-tags writings-row-meta animate-[row-tags-in_280ms_var(--ease-out)_calc(var(--row-start)+670ms)_both]">
                {config.rowMeta === "number"
                  ? String(total - i).padStart(3, "0")
                  : entry.date}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Inert as well as aria-hidden: without it the panel's own image would
          still be a tab stop in browsers that focus scrollable regions. */}
      <div className="writings-preview" aria-hidden="true" inert>
        {source ? (
          <img
            key={source}
            src={source}
            alt=""
            className={
              kind === "illustration"
                ? "writings-preview-illustration"
                : "writings-preview-img"
            }
            style={fade}
          />
        ) : active ? (
          <div key={active.id} className="writings-preview-text" style={fade}>
            <p className="writings-preview-meta">
              {active.readingMinutes
                ? `${active.longDate} · ${active.readingMinutes} min read`
                : active.longDate}
            </p>
            <p className="writings-preview-title">{active.title}</p>
            {active.excerpt ? (
              <p className="writings-preview-excerpt">{active.excerpt}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
