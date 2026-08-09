"use client";

import { useEffect, useState } from "react";

/**
 * Tracks which section is currently under the header.
 *
 * Uses a top-biased rootMargin so a section becomes "active" as its heading
 * reaches the header band, rather than when it happens to occupy the most
 * pixels — which matches what a reader perceives as the current section.
 */
export function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }

        // Prefer the earliest section still inside the band.
        setActive(ids.find((id) => visible.has(id)) ?? null);
      },
      { rootMargin: "-72px 0px -55% 0px", threshold: 0 },
    );

    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
