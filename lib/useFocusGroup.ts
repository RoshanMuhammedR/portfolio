"use client";

import { useCallback, useState } from "react";

/**
 * Click-to-focus, one independent group at a time.
 *
 * The page runs three of these — the experience highlights, the projects, and
 * the stack columns. Picking an item holds it and drops its siblings; picking
 * it again releases. Each group keeps its own state, so the three never
 * interfere with each other.
 *
 * The dimming itself is CSS (see `.strip-group` in globals.css); this only
 * decides what is picked and hands back the attributes that say so. `depth`
 * names how far the siblings drop, which differs per group.
 */
export function useFocusGroup(depth: "hl" | "proj" | "col") {
  const [picked, setPicked] = useState<string | null>(null);

  const toggle = useCallback((id: string) => {
    setPicked((current) => (current === id ? null : id));
  }, []);

  /** Spread onto the element wrapping the items. */
  const groupProps = {
    className: "strip-group",
    "data-depth": depth,
    "data-any": picked !== null ? "true" : "false"
  };

  /** Spread onto each item. They are buttons, so this is keyboard-reachable. */
  const itemProps = useCallback(
    (id: string) => ({
      type: "button" as const,
      onClick: () => toggle(id),
      "data-on": picked === id ? "true" : "false",
      "aria-pressed": picked === id
    }),
    [picked, toggle]
  );

  return { groupProps, itemProps };
}
