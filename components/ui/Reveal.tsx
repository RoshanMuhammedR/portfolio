"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type RevealProps = {
  children: ReactNode;
  /** Stagger within a group, in ms. */
  delay?: number;
  as?: ElementType;
  className?: string;
  id?: string;
};

/**
 * Fades content in once as it enters the viewport.
 *
 * Deliberately stateless: the observer flips a `data-revealed` attribute on the
 * DOM node and CSS does the rest, so revealing costs one attribute write and no
 * React re-render. `prefers-reduced-motion` is handled in globals.css, which
 * means content stays visible even if this component never hydrates.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
  id,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      node.dataset.revealed = "true";
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        entry.target.setAttribute("data-revealed", "true");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      id={id}
      className={cn("reveal", className)}
      data-revealed="false"
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
