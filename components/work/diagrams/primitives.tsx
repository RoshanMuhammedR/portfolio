import type { ReactNode } from "react";

/**
 * Shared SVG vocabulary for the architecture diagrams.
 *
 * Diagrams are hand-placed rather than generated: there are three of them, they
 * never change shape at runtime, and a layout engine would cost more bytes than
 * the coordinates it replaces.
 */

export function ArrowDefs({ id }: { id: string }) {
  return (
    <defs>
      <marker
        id={`${id}-head`}
        viewBox="0 0 8 8"
        refX="7"
        refY="4"
        markerWidth="7"
        markerHeight="7"
        orient="auto-start-reverse"
      >
        <path d="M0 0 L8 4 L0 8 z" className="fill-ink-faint" />
      </marker>
    </defs>
  );
}

type BoxProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub?: string;
  accent?: boolean;
};

export function Box({ x, y, w, h, title, sub, accent }: BoxProps) {
  const cx = x + w / 2;
  const cy = y + h / 2;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        strokeWidth={1}
        className={
          accent
            ? "fill-accent-dim stroke-accent"
            : "fill-surface-2 stroke-line-strong"
        }
      />
      <text
        x={cx}
        y={sub ? cy - 2 : cy + 5}
        textAnchor="middle"
        fontSize={14}
        className={accent ? "fill-accent" : "fill-ink"}
      >
        {title}
      </text>
      {sub ? (
        <text x={cx} y={cy + 16} textAnchor="middle" fontSize={11} className="fill-ink-dim">
          {sub}
        </text>
      ) : null}
    </g>
  );
}

export function Arrow({
  id,
  d,
  dashed,
}: {
  id: string;
  d: string;
  dashed?: boolean;
}) {
  return (
    <path
      d={d}
      fill="none"
      strokeWidth={1}
      strokeDasharray={dashed ? "3 3" : undefined}
      className="stroke-line-strong"
      markerEnd={`url(#${id}-head)`}
    />
  );
}

export function EdgeLabel({
  x,
  y,
  children,
  anchor = "middle",
}: {
  x: number;
  y: number;
  children: ReactNode;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={10.5} className="fill-ink-faint">
      {children}
    </text>
  );
}

export function LaneLabel({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <text x={x} y={y} fontSize={10.5} letterSpacing="1.6" className="fill-accent">
      {children}
    </text>
  );
}

/**
 * Wraps a diagram in a horizontally scrollable frame. The SVG keeps a fixed
 * minimum width so labels stay legible on a phone — scrolling a diagram beats
 * shrinking its type to four pixels.
 */
export function DiagramFrame({
  title,
  caption,
  minWidth,
  viewBox,
  children,
}: {
  title: string;
  caption: string;
  minWidth: number;
  viewBox: string;
  children: ReactNode;
}) {
  return (
    <figure>
      {/* The caption below is the accessible description, so the SVG carries a
          name only — otherwise the diagram gets announced three times over. */}
      <div className="overflow-x-auto border border-line bg-surface">
        <svg
          role="img"
          aria-label={title}
          viewBox={viewBox}
          className="font-mono"
          style={{ minWidth, width: "100%", display: "block" }}
        >
          {children}
        </svg>
      </div>
      <figcaption className="mono-label mt-3 leading-relaxed normal-case">
        {caption}
      </figcaption>
    </figure>
  );
}
