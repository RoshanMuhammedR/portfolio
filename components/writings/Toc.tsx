"use client";

import { useEffect, useRef, useState } from "react";
import type { Heading } from "@/lib/markdown";

/**
 * "On this page".
 *
 * The active entry is decided by an IntersectionObserver over the headings
 * themselves rather than by scroll arithmetic, so it stays right through
 * images loading, embeds resizing and a window resize. The top margin clears
 * the sticky offset; the bottom one keeps a heading from claiming the list
 * while it is still near the floor.
 */
export function Toc({
  headings,
  topPx,
  maxWidthPx,
}: {
  headings: Heading[];
  topPx: number;
  maxWidthPx: number;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    const targets = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (targets.length === 0) return;

    const order = headings.map((h) => h.id);
    const visible = seen.current;
    visible.clear();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) visible.add(id);
          else visible.delete(id);
        }
        // The topmost heading currently in the band wins; with none in it, the
        // last one passed stays lit rather than the list going blank.
        const first = order.find((id) => visible.has(id));
        if (first) setActiveId(first);
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  const jump = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
    setActiveId(id);
    // replaceState, so running down the list does not fill the back button.
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <nav
      className="writing-toc"
      aria-label="On this page"
      style={{ top: topPx, maxWidth: maxWidthPx }}
    >
      <p className="writing-toc-label">On this page</p>
      <ul className="writing-toc-list">
        {headings.map((heading) => (
          <li key={heading.id} data-depth={heading.depth}>
            <a
              href={`#${heading.id}`}
              onClick={(e) => jump(e, heading.id)}
              aria-current={activeId === heading.id ? "true" : undefined}
              className={`writing-toc-link${
                activeId === heading.id ? " is-active" : ""
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
