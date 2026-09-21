import type { Metadata } from "next";
import {
  SplitPage,
  BackCrumb,
  PageHeading,
} from "@/components/shell/SplitPage";
import {
  WritingsList,
  type WritingEntry,
} from "@/components/writings/WritingsList";
import { getWritings } from "@/lib/content";
import { getSiteConfig } from "@/lib/settings";

export const metadata: Metadata = { title: "Writings" };

/** Published pieces appear within the minute, without a redeploy. */
export const revalidate = 60;

function formatDate(iso: string | null, month: "short" | "long" = "short") {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    year: "numeric",
    month,
    ...(month === "long" ? { day: "numeric" } : {}),
  });
}

export default async function WritingsPage() {
  const [writings, config] = await Promise.all([getWritings(), getSiteConfig()]);

  const entries: WritingEntry[] = writings.map((piece) => ({
    id: piece.id,
    slug: piece.slug,
    title: piece.title,
    date: formatDate(piece.published_at),
    longDate: formatDate(piece.published_at, "long"),
    excerpt: piece.excerpt,
    readingMinutes: piece.reading_minutes ?? null,
    preview: piece.preview_image_url ?? null,
    previewKind: piece.preview_kind === "illustration" ? "illustration" : "image",
  }));

  return (
    <SplitPage
      copy={
        <>
          <BackCrumb />
          <PageHeading title="Writings">
            Notes on the systems side of building things.
          </PageHeading>

          {entries.length === 0 ? (
            <p className="mt-[19px] text-[13px] leading-[19.5px] tracking-[-0.01em] text-n500">
              Nothing published yet.
            </p>
          ) : (
            <WritingsList entries={entries} config={config.writings.list} />
          )}
        </>
      }
    />
  );
}
