"use client";

import { useCallback, useRef, useState } from "react";
import type { ReactNode } from "react";

/**
 * An inline highlighted phrase whose hover shows a small image popover.
 *
 * The popover is placed against the *cursor* rather than the word, 10px above
 * it, and clamped to the viewport - the reference's behaviour, and the only
 * placement that stays readable when the phrase wraps across two lines.
 *
 * Keyboard reaches it too: the mark is focusable, and focus pins the popover
 * over the word's own box. Escape dismisses it.
 */

const WIDTH = 280;
const GAP = 10;

export function HighlightMark({
  image,
  logo,
  link,
  children,
}: {
  image?: string;
  logo?: string;
  link?: string;
  children?: ReactNode;
}) {
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLSpanElement>(null);

  const place = useCallback((clientX: number, clientY: number) => {
    const half = WIDTH / 2;
    const x = Math.min(
      window.innerWidth - half - 8,
      Math.max(half + 8, clientX),
    );
    setAt({ x, y: Math.max(8, clientY - GAP) });
  }, []);

  const show = (e: React.MouseEvent) => place(e.clientX, e.clientY);
  const hide = () => setAt(null);

  const pin = () => {
    const box = ref.current?.getBoundingClientRect();
    if (box) place(box.left + box.width / 2, box.top);
  };

  const content = (
    <>
      {logo ? <img src={logo} alt="" className="writing-highlight-logo" /> : null}
      {children}
    </>
  );

  return (
    <span className="writing-highlight-wrap">
      <span
        ref={ref}
        tabIndex={0}
        onMouseEnter={show}
        onMouseMove={show}
        onMouseLeave={hide}
        onFocus={pin}
        onBlur={hide}
        onKeyDown={(e) => {
          if (e.key === "Escape") hide();
        }}
        className="writing-highlight"
      >
        {link ? (
          <a href={link} target="_blank" rel="noreferrer noopener">
            {content}
          </a>
        ) : (
          content
        )}
      </span>

      {at && image ? (
        <span
          role="presentation"
          className="writing-highlight-popover"
          style={{ left: at.x, top: at.y, width: WIDTH }}
        >
          <img src={image} alt="" />
        </span>
      ) : null}
    </span>
  );
}
