/**
 * The shapes the site reads back.
 *
 * Columns added by supabase/migrations/0003 and 0004 are typed optional rather
 * than nullable: a database that has not had those migrations applied yet
 * simply does not return the key, and every caller has to cope with that
 * (lib/content.ts retries with the narrower select).
 */

export type CraftRow = {
  id: string;
  title: string;
  caption: string | null;
  href: string | null;
  image_url: string | null;
  x: number;
  y: number;
  w: number;
  h: number;
  published: boolean;
  /* ---- 0004_craft_meta ---- */
  description?: string | null;
  tags?: string[] | null;
  year?: number | null;
  source_url?: string | null;
  aspect?: number | null;
  sort?: number | null;
  /* ---- 0008_saga_crafts: set for rows synced from a migration ---- */
  slug?: string | null;
};

export type WritingRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  published: boolean;
  published_at: string | null;
  /* ---- 0003_writings_rich ---- */
  preview_image_url?: string | null;
  preview_kind?: "image" | "illustration" | null;
  cover_image_url?: string | null;
  cover_alt?: string | null;
  cover_height?: number | null;
  toc_enabled?: boolean | null;
  toc_depth?: number | null;
  reading_minutes?: number | null;
  seo_description?: string | null;
};

export type ProjectKind = "project" | "experience";
export type HomeLayout = "full" | "pair" | "aside" | "aside-flipped";

export type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  tags: string[];
  kind: ProjectKind;
  live_url: string | null;
  repo_url: string | null;
  image_url: string | null;
  image_position: string;
  glow: string | null;
  show_on_home: boolean;
  show_on_works: boolean;
  home_layout: HomeLayout | null;
  sort: number;
  published: boolean;
};

export type InterestCategory =
  | "movie"
  | "anime"
  | "football"
  | "game"
  | "travel"
  | "music"
  | "other";

export type InterestObjectType =
  | "card"
  | "book"
  | "ball"
  | "controller"
  | "polaroid"
  | "model";

export type InterestAction =
  | "info"
  | "flip"
  | "kick"
  | "open"
  | "spin"
  | "link";

export type InterestRow = {
  id: string;
  category: InterestCategory;
  title: string;
  subtitle: string | null;
  note: string | null;
  link_url: string | null;
  texture_url: string | null;
  model_url: string | null;
  object_type: InterestObjectType;
  action: InterestAction;
  scale: number;
  pos_x: number | null;
  pos_z: number | null;
  rot_y: number | null;
  credit: string | null;
  licence: string | null;
  sort: number;
  published: boolean;
};

export type SettingsRow = {
  key: string;
  value: unknown;
};
