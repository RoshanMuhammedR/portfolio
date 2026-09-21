import Link from "next/link";
import type { ReactNode } from "react";
import { AutoImage } from "@/components/media/AutoImage";
import { Toc } from "@/components/writings/Toc";
import type { ArticleConfig } from "@/content/config";
import type { Heading } from "@/lib/markdown";
import type { WritingNeighbour } from "@/lib/content";

/**
 * The article spread: a hero that bleeds past the column, the prose in a
 * 550px measure, and the quick-nav list in the right margin.
 *
 * The hero and the spread share grid rows and overlap on purpose - the spread
 * is pushed down by `spreadTopPx` and sits above, which is what lets the hero's
 * mask fade into the page rather than ending on a hard edge.
 */
export function ArticleLayout({
  title,
  date,
  readingMinutes,
  cover,
  coverAlt,
  coverHeight,
  headings,
  config,
  previous,
  next,
  children,
}: {
  title: string;
  date: string | null;
  readingMinutes: number | null;
  cover: string | null;
  coverAlt: string | null;
  coverHeight: number;
  headings: Heading[];
  config: ArticleConfig;
  previous: WritingNeighbour | null;
  next: WritingNeighbour | null;
  children: ReactNode;
}) {
  // Two headings is the point at which a list of them is worth the space.
  const hasToc = headings.length >= 2;

  const meta = [date, readingMinutes ? `${readingMinutes} min read` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="page-grid">
      {cover ? (
        <div
          className="writing-banner"
          style={{
            height: coverHeight,
            maxWidth: config.bannerMaxWidth,
          }}
          aria-hidden={coverAlt ? undefined : true}
        >
          <AutoImage
            src={cover}
            alt={coverAlt ?? ""}
            priority
            width={1100}
            height={700}
            sizes="(max-width: 1049px) 85vw, 550px"
          />
        </div>
      ) : null}

      <div
        className={`writing-spread${hasToc ? " has-toc" : ""}`}
        style={{ marginTop: cover ? config.spreadTopPx : 0 }}
      >
        <article className="writing-article">
          <Link href="/writings" className="writing-crumb">
            [ / Writings ]
          </Link>
          <h1 className="writing-title">{title}</h1>
          {meta ? <p className="writing-meta">{meta}</p> : null}

          <div className="writing-prose">{children}</div>

          {previous || next ? (
            <nav className="writing-pagination" aria-label="More writing">
              {previous ? (
                <Link href={`/writings/${previous.slug}`} className="writing-page-link">
                  <span className="writing-page-label">Previous</span>
                  <span className="writing-page-title">{previous.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  href={`/writings/${next.slug}`}
                  className="writing-page-link is-next"
                >
                  <span className="writing-page-label">Next</span>
                  <span className="writing-page-title">{next.title}</span>
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
        </article>

        {hasToc ? (
          <Toc
            headings={headings}
            topPx={config.tocTopPx}
            maxWidthPx={config.tocMaxWidth}
          />
        ) : null}
      </div>
    </div>
  );
}
