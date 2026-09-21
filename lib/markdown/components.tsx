import type { ReactNode } from "react";
import { AutoImage } from "@/components/media/AutoImage";
import { HighlightMark } from "@/components/writings/HighlightMark";

/**
 * What each directive renders as.
 *
 * Styling lives in `app/globals.css` under `.writing-*`, ported from the
 * reference, so the classes here are names rather than a wall of utilities and
 * the prose rhythm is set in one place.
 *
 * Attribute names avoid every HTML attribute the hast -> JSX bridge would
 * rename on the way through (`autoplay` becomes `autoPlay`, and so on), so what
 * a directive writes is what a component receives.
 */

type Block = { children?: ReactNode };

export function Callout({
  tone = "note",
  label,
  children,
}: Block & { tone?: string; label?: string }) {
  const heading = label ?? TONE_LABEL[tone] ?? "Note";
  return (
    <aside className="writing-callout" data-tone={tone}>
      <p className="writing-callout-label">{heading}</p>
      <div className="writing-callout-body">{children}</div>
    </aside>
  );
}

const TONE_LABEL: Record<string, string> = {
  note: "Note",
  tip: "Tip",
  warning: "Careful",
};

export function FigureBlock({
  src,
  alt = "",
  caption,
  bleed,
}: {
  src?: string;
  alt?: string;
  caption?: string;
  bleed?: string;
}) {
  if (!src) return null;
  return (
    <figure className="writing-figure" data-bleed={bleed ? "true" : undefined}>
      <div className="writing-figure-media">
        <AutoImage src={src} alt={alt} sizes="(max-width: 1049px) 92vw, 660px" />
      </div>
      {caption ? (
        <figcaption className="writing-figure-caption">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

export function VideoBlock({
  src,
  poster,
  caption,
  autoplaying,
  looping,
  bleed,
}: {
  src?: string;
  poster?: string;
  caption?: string;
  autoplaying?: string;
  looping?: string;
  bleed?: string;
}) {
  if (!src) return null;
  const auto = Boolean(autoplaying);
  return (
    <figure className="writing-figure" data-bleed={bleed ? "true" : undefined}>
      <div className="writing-figure-media">
        <video
          src={src}
          poster={poster}
          controls={!auto}
          // An autoplaying video must be muted and inline, or the browser
          // refuses to start it and the reader gets a dead frame.
          autoPlay={auto}
          muted={auto}
          playsInline
          loop={Boolean(looping)}
          preload="metadata"
        />
      </div>
      {caption ? (
        <figcaption className="writing-figure-caption">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

export function EmbedBlock({
  src,
  label,
}: {
  src?: string;
  provider?: string;
  label?: string;
}) {
  if (!src) return null;
  return (
    <div className="writing-embed">
      <iframe
        src={src}
        title={label ?? "Embedded video"}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        // The frame is a third party's page; nothing it does should reach this
        // one beyond playing a video.
        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
}

export function Gallery({ columns = "2", children }: Block & { columns?: string }) {
  return (
    <div className="writing-gallery" data-columns={columns}>
      {children}
    </div>
  );
}

export { HighlightMark };

/** The plain elements, so headings clear the sticky offset and code blocks
 *  scroll rather than stretching the column. */
export const proseComponents = {
  callout: Callout,
  gallery: Gallery,
  figureblock: FigureBlock,
  videoblock: VideoBlock,
  embedblock: EmbedBlock,
  highlightmark: HighlightMark,
} as const;
