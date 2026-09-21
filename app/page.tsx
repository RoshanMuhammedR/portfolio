import Link from "next/link";
import { SplitPage } from "@/components/shell/SplitPage";
import { WorkCard } from "@/components/home/WorkCard";
import { InfiniteMosaic } from "@/components/home/InfiniteMosaic";
import { siteIdentity } from "@/content/site";
import { getWorkItems } from "@/lib/content";
import { getSiteConfig } from "@/lib/settings";
import { buildMosaic, cellImageSizes, isNarrowCell } from "@/lib/homeMosaic";

/** The works come from the database, so a new one appears within the minute. */
export const revalidate = 60;

/**
 * Written for the person hiring: the stack, what has been built on it, and what
 * comes next. Every claim is on the résumé; the employer and the degree live on
 * About, not here. Eleven lines at 1608x862 keeps "Let's talk" above the fold.
 */
const paragraphs = [
  <>
    That means product surfaces in Next.js and React, APIs in NestJS and
    FastAPI, and the PostgreSQL, Redis and queue layers underneath that keep
    them fast.
  </>,
  <>
    Most recently I built fine-grained role permissions, usage credits metered
    in Redis, and a faster workflow builder for a no-code automation platform.
  </>,
  <>
    I&rsquo;m most interested in AI products people can trust, like Saga, my
    RAG knowledge base that cites its sources. If you&rsquo;re hiring for a
    full-stack role, I&rsquo;d love to hear what you&rsquo;re building.
  </>,
];

/** Not logos - the stack, set as marks. Nothing here is a client, and every
 *  mark is on the résumé. */
const stackMarks = [
  "TypeScript",
  "React",
  "Next.js",
  "NestJS",
  "FastAPI",
  "PostgreSQL",
  "Redis",
  "BullMQ",
  "Docker",
];

export default async function HomePage() {
  const [works, config] = await Promise.all([getWorkItems(), getSiteConfig()]);

  const rows = buildMosaic(works.filter((work) => work.showOnHome));

  const mosaicRows = (
    <>
      {rows.map((row, rowIndex) => (
        <div
          key={row.id}
          className={`mosaic-row ${
            row.layout === "aside-flipped"
              ? "is-aside is-flipped"
              : `is-${row.layout}`
          }`}
        >
          {row.works.map((work, i) => (
            <div key={work.id} className="mosaic-cell">
              <WorkCard
                title={work.title}
                subtitle={work.subtitle}
                tags={work.tags}
                href={work.href}
                glow={work.glow}
                // A narrow cell cannot show a screenshot at a readable size, so
                // it falls back to the title card the glow is there for.
                image={isNarrowCell(row.layout, i) ? undefined : work.image}
                sizes={cellImageSizes(row.layout)}
                // The first two rows fill the column at load.
                priority={rowIndex < 2}
              />
            </div>
          ))}
        </div>
      ))}
    </>
  );

  return (
    <SplitPage
      mediaClassName="page-media-marquee"
      copy={
        <>
          <h1 className="reveal-heading text-[28px] font-bold leading-[1.3] tracking-[-0.02em] text-n900">
            <span className="block">I&rsquo;m {siteIdentity.name}</span>
            <span className="gradient-text block">
              I build full-stack products, end to end.
            </span>
          </h1>

          <div className="mt-8 flex flex-col gap-5">
            {paragraphs.map((p, i) => (
              <p
                key={i}
                style={{ animationDelay: `${0.62 + i * 0.08}s` }}
                className="reveal-line text-[15px] leading-[23px] tracking-[-0.01em] text-n900"
              >
                {p}
              </p>
            ))}
          </div>

          <ul
            style={{ animationDelay: "0.9s" }}
            className="reveal-line mt-11 grid grid-cols-3 gap-x-5 gap-y-[21px]"
          >
            {stackMarks.map((mark) => (
              <li
                key={mark}
                className="text-[14px] leading-none tracking-[-0.01em] text-n500 transition-colors duration-[120ms] hover:text-n900"
              >
                {mark}
              </li>
            ))}
          </ul>

          <div
            style={{ animationDelay: "1.05s" }}
            className="reveal-line mt-8 flex flex-wrap items-center gap-x-4 gap-y-3"
          >
            <Link
              href="/contact"
              className="rounded-lg bg-n900 px-5 py-3 text-[14px] font-medium leading-none tracking-[-0.01em] text-n50 transition-colors duration-[120ms] hover:bg-p700"
            >
              Let&rsquo;s talk
            </Link>
            {/* The recruiter's first click: the PDF itself, in a new tab. */}
            <a
              href={siteIdentity.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[14px] font-medium leading-none tracking-[-0.01em] text-n900 underline decoration-n300 underline-offset-4 transition-colors duration-[120ms] hover:decoration-n900"
            >
              Résumé
            </a>
            <span className="flex items-center gap-2 text-[14px] tracking-[-0.01em] text-n500">
              <span
                className="h-2 w-2 shrink-0 rounded-[2px] bg-p400"
                aria-hidden="true"
              />
              {siteIdentity.availability}
            </span>
          </div>
        </>
      }
      media={<InfiniteMosaic rows={mosaicRows} config={config.home.marquee} />}
    />
  );
}
