/**
 * The Craft board's item shape, and its static fallback.
 *
 * The array is empty on purpose: explorations and unreleased work are not
 * something that can be written on someone's behalf. It is filled from Supabase
 * (`craft_items`); with no backend the page says so rather than showing
 * invented work.
 */
export type CraftItem = {
  id: string;
  title: string;
  caption?: string;
  /** Board coordinates, in px. Only the manual-layout renderer reads these;
   *  the infinite board lays tiles out from `sort`. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** A capture of the piece. Without one the tile falls back to `glow`. */
  image?: string;
  glow: string;
  /** The live demo. */
  href?: string;
  /* ---- what the hover card shows (migration 0004) ---- */
  description?: string;
  tags?: string[];
  year?: number;
  sourceUrl?: string;
  /** width / height. Null lets the board measure the capture instead. */
  aspect?: number;
};

export const craftItems: CraftItem[] = [];
