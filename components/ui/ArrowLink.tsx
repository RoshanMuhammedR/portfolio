import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ArrowLinkProps = {
  href: string;
  children: ReactNode;
  /** "out" renders ↗ and opens in a new tab; "next" renders → and stays in-app. */
  direction?: "out" | "next";
  className?: string;
};

const Glyph = ({ direction }: { direction: "out" | "next" }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 12 12"
    className={cn(
      "size-3 shrink-0 transition-transform duration-300 ease-out",
      direction === "out"
        ? "group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
        : "group-hover/link:translate-x-1",
    )}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="square"
  >
    {direction === "out" ? (
      <>
        <path d="M3.5 8.5 8.5 3.5" />
        <path d="M4.4 3.5h4.1v4.1" />
      </>
    ) : (
      <>
        <path d="M1.5 6h9" />
        <path d="M7 2.5 10.5 6 7 9.5" />
      </>
    )}
  </svg>
);

/**
 * The single link treatment used across the site: mono caps, an underline that
 * grows from the left on hover, and a glyph that moves in the link's direction.
 */
export function ArrowLink({
  href,
  children,
  direction = "out",
  className,
}: ArrowLinkProps) {
  // next/link is only correct for in-app routes and hashes. Static files
  // (/resume.pdf), mailto:, tel: and absolute URLs must stay plain anchors.
  const isAppRoute = href.startsWith("#") || (href.startsWith("/") && !href.includes("."));
  const opensNewTab = /^https?:/.test(href) || /\.(pdf|png|jpe?g|svg)$/i.test(href);

  const content = (
    <>
      <span className="relative">
        {children}
        <span
          aria-hidden="true"
          className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 ease-out group-hover/link:scale-x-100"
        />
      </span>
      <Glyph direction={direction} />
    </>
  );

  const classes = cn(
    "group/link inline-flex items-center gap-1.5 font-mono text-xs tracking-wider uppercase text-ink-dim transition-colors duration-200 hover:text-accent",
    className,
  );

  if (isAppRoute) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <a
      href={href}
      target={opensNewTab ? "_blank" : undefined}
      rel={opensNewTab ? "noreferrer noopener" : undefined}
      className={classes}
    >
      {content}
    </a>
  );
}
