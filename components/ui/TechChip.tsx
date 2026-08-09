import { cn } from "@/lib/cn";

/** Hairline-bordered token for a technology name. No colour coding, no icons. */
export function TechChip({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center border border-line px-2 py-1 font-mono text-[0.6875rem] leading-none tracking-wide text-ink-dim",
        className,
      )}
    >
      {label}
    </span>
  );
}

export function TechChipRow({
  items,
  className,
}: {
  items: readonly string[];
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {items.map((item) => (
        <li key={item}>
          <TechChip label={item} />
        </li>
      ))}
    </ul>
  );
}
