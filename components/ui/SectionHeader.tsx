import { cn } from "@/lib/cn";

type SectionHeaderProps = {
  /** Two-digit spec index, e.g. "01". */
  index: string;
  label: string;
  /** Right-aligned metadata: a year, a count, a status. */
  meta?: string;
  /** Wired to the section's aria-labelledby. */
  headingId?: string;
  className?: string;
};

/**
 * The recurring spec-sheet header: `01 / SELECTED WORK ————————— 2 PROJECTS`.
 * The rule is a flex child so it always fills the gap, at any width.
 */
export function SectionHeader({
  index,
  label,
  meta,
  headingId,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center gap-3 sm:gap-4", className)}>
      <h2 id={headingId} className="mono-label flex shrink-0 items-baseline gap-2 text-ink-dim">
        <span className="text-accent">{index}</span>
        <span aria-hidden="true" className="text-ink-faint">
          /
        </span>
        <span>{label}</span>
      </h2>
      <span aria-hidden="true" className="h-px min-w-4 flex-1 bg-line" />
      {meta ? (
        <span aria-hidden="true" className="mono-label tabular shrink-0">
          {meta}
        </span>
      ) : null}
    </div>
  );
}
