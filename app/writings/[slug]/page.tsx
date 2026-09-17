import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleLayout } from "@/components/writings/ArticleLayout";
import { renderMarkdown } from "@/lib/markdown";
import { getWriting, getWritingNeighbours } from "@/lib/content";
import { getSiteConfig } from "@/lib/settings";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const piece = await getWriting(slug);
  if (!piece) return { title: "Not found" };

  const description = piece.seo_description ?? piece.excerpt ?? undefined;
  const cover = piece.cover_image_url ?? undefined;

  return {
    title: piece.title,
    description,
    openGraph: {
      title: piece.title,
      description,
      type: "article",
      publishedTime: piece.published_at ?? undefined,
      images: cover ? [{ url: cover, alt: piece.cover_alt ?? piece.title }] : undefined,
    },
  };
}

export default async function WritingPage({ params }: Params) {
  const { slug } = await params;
  const piece = await getWriting(slug);
  if (!piece) notFound();

  const config = await getSiteConfig();
  const depth =
    piece.toc_depth === 3 ? 3 : piece.toc_depth === 2 ? 2 : config.writings.article.tocDepth;

  const [{ content, headings, readingMinutes }, neighbours] = await Promise.all([
    renderMarkdown(piece.body, { tocDepth: depth }),
    getWritingNeighbours(slug),
  ]);

  const date = piece.published_at
    ? new Date(piece.published_at).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <ArticleLayout
      title={piece.title}
      date={date}
      readingMinutes={piece.reading_minutes ?? readingMinutes}
      cover={piece.cover_image_url ?? null}
      coverAlt={piece.cover_alt ?? null}
      coverHeight={piece.cover_height ?? config.writings.article.bannerHeight}
      // A post can opt out of the list even when it has the headings for one.
      headings={piece.toc_enabled === false ? [] : headings}
      config={config.writings.article}
      previous={neighbours.previous}
      next={neighbours.next}
    >
      {content}
    </ArticleLayout>
  );
}
