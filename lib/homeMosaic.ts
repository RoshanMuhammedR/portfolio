import type { HomeLayout } from "@/lib/supabase/types";
import type { WorkItem } from "@/lib/content";

/**
 * The Home mosaic, as data.
 *
 * Rows are built by walking the works in order: the first work of a row decides
 * that row's shape from its `home_layout`, and the row then takes as many works
 * as the shape holds. That is what lets the studio reorder the mosaic without
 * anyone hand-writing rows again.
 */

export type MosaicRow = {
  id: string;
  layout: HomeLayout;
  works: WorkItem[];
};

/** How many works each shape holds. */
const WIDTH: Record<HomeLayout, number> = {
  full: 1,
  pair: 2,
  aside: 2,
  "aside-flipped": 2,
};

/**
 * Which cell in a row is the narrow one, so a work with no screenshot can be
 * put there and a work with one can take the wide side.
 *   aside          7fr 3fr  -> the second cell is narrow
 *   aside-flipped  3fr 7fr  -> the first cell is narrow
 */
export function isNarrowCell(layout: HomeLayout, index: number): boolean {
  if (layout === "aside") return index === 1;
  if (layout === "aside-flipped") return index === 0;
  return false;
}

/**
 * How wide a cell's screenshot is drawn, for `next/image`'s `sizes`. The numbers
 * are the page grid's: 40px margins, four 118px columns, 20px gutters and the
 * media column's 60px inset leave `100vw - 692px` for the column, and a row
 * splits that around a 20px gap (7fr 3fr for the asides). Below 1440px every
 * row is a single stack; below 1050px the page is one column with 20px sides.
 */
export function cellImageSizes(layout: HomeLayout): string {
  const wide =
    layout === "full"
      ? "calc(100vw - 692px)"
      : layout === "pair"
        ? "calc(50vw - 356px)"
        : "calc(70vw - 498px)";
  return [
    "(max-width: 1049px) calc(100vw - 40px)",
    "(max-width: 1439px) calc(100vw - 692px)",
    wide,
  ].join(", ");
}

export function buildMosaic(works: WorkItem[]): MosaicRow[] {
  const rows: MosaicRow[] = [];
  let at = 0;

  while (at < works.length) {
    const head = works[at];
    const remaining = works.length - at;

    // A row that cannot be filled becomes a full-width one rather than
    // leaving a hole where its partner should be.
    const layout: HomeLayout =
      remaining === 1 ? "full" : (head.homeLayout ?? "pair");

    const take = Math.min(WIDTH[layout], remaining);
    rows.push({ id: head.id, layout, works: works.slice(at, at + take) });
    at += take;
  }

  return rows;
}
