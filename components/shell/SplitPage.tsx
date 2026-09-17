import type { ReactNode } from "react";

/**
 * The reading layout: a 394px copy column in grid columns 2-4, and the media
 * side in 5-10. Column 1 is left empty for the fixed rail.
 *
 * Under 1050px both become a single stack; the grid class handles that.
 */
export function SplitPage({
  copy,
  media,
  mediaClassName,
}: {
  copy: ReactNode;
  media?: ReactNode;
  /** Extra classes on the media column, for the pages whose right side is a
   *  full-height panel rather than a block of content. */
  mediaClassName?: string;
}) {
  return (
    <div className="page-grid">
      <div className="page-copy">{copy}</div>
      {media ? (
        <div className={`page-media${mediaClassName ? ` ${mediaClassName}` : ""}`}>
          {media}
        </div>
      ) : null}
    </div>
  );
}

/** The "[ / Back ]" crumb every page but Home carries. */
export function BackCrumb({ label = "Back" }: { label?: string }) {
  return (
    <span className="reveal-line block text-[14px] font-normal tracking-[-0.01em] text-n500">
      [ / {label} ]
    </span>
  );
}

/** Page title + standfirst, on the rhythm the reference uses. */
export function PageHeading({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="reveal-line mt-[19px]" style={{ animationDelay: "0.1s" }}>
      <h1 className="text-[20px] font-semibold leading-[26px] tracking-[-0.02em] text-n900">
        {title}
      </h1>
      {children ? (
        <p className="mt-2 text-[14.5px] leading-[22px] tracking-[-0.01em] text-n500">
          {children}
        </p>
      ) : null}
    </div>
  );
}
