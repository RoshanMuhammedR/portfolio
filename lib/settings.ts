import { z } from "zod";
import { defaultConfig, type SiteConfig } from "@/content/config";
import { getSupabase } from "@/lib/supabase/server";

/**
 * Runtime overrides for `content/config.ts`.
 *
 * `site_settings` holds one row per group, keyed by its path ("craft.board"),
 * whose `value` is a partial of that group. Anything that does not validate is
 * dropped and the default stands - a bad row must never be able to take a page
 * down, and an out-of-range number must never be able to make one unusable
 * (a 4000px/s marquee, a board that fades every tile to nothing).
 */

const marquee = z
  .object({
    enabled: z.boolean(),
    direction: z.enum(["down", "up"]),
    speedPxPerSec: z.number().min(0).max(400),
    pauseOnHover: z.boolean(),
    hoverSpeedFactor: z.number().min(0).max(1),
    edgeFadePx: z.number().min(0).max(240),
    wheelScrub: z.boolean(),
    minTrackViewports: z.number().min(1).max(6),
  })
  .partial()
  .strict();

const ring = z
  .object({
    tiltDeg: z.number().min(0).max(70),
    spanCqw: z.number().min(20).max(120),
    spanCqh: z.number().min(20).max(140),
    tileMinPx: z.number().min(40).max(600),
    tileMaxPx: z.number().min(80).max(900),
    tileAspect: z.number().min(0.2).max(2),
    frontScale: z.number().min(1).max(6),
    focusMaxCqw: z.number().min(20).max(100),
    perspectiveFactor: z.number().min(1).max(12),
    frontMs: z.number().min(0).max(3000),
    returnMs: z.number().min(0).max(3000),
    fadeMs: z.number().min(0).max(3000),
    idleDegPerSec: z.number().min(0).max(90),
    releaseDelayMs: z.number().min(0).max(2000),
    maxItems: z.number().int().min(1).max(200),
    dragDegPerPx: z.number().min(0).max(3),
    inertiaFriction: z.number().min(0).max(0.999),
  })
  .partial()
  .strict();

const scene = z
  .object({
    gravity: z.number().min(-120).max(0),
    dprMax: z.number().min(1).max(3),
    shadowOpacity: z.number().min(0).max(1),
    dropInOnLoad: z.boolean(),
    infoDelayMs: z.number().min(0).max(3000),
    maxObjects: z.number().int().min(1).max(64),
  })
  .partial()
  .strict();

const writingsList = z
  .object({
    rowMeta: z.enum(["number", "date"]),
    previewFadeMs: z.number().min(0).max(2000),
    idleIllustrationUrl: z.string().url().nullable(),
  })
  .partial()
  .strict();

const article = z
  .object({
    bannerHeight: z.number().min(0).max(900),
    bannerMaxWidth: z.number().min(200).max(1600),
    spreadTopPx: z.number().min(0).max(1200),
    tocTopPx: z.number().min(0).max(600),
    tocMaxWidth: z.number().min(80).max(400),
    tocDepth: z.union([z.literal(2), z.literal(3)]),
  })
  .partial()
  .strict();

const board = z
  .object({
    columns: z.number().int().min(1).max(12),
    tileWidth: z.number().min(120).max(900),
    gap: z.number().min(0).max(240),
    padding: z.number().min(0).max(240),
    patternScale: z.number().min(1).max(4),
    minVisibility: z.number().min(0).max(1),
    focusRect: z.number().min(0).max(1),
    scaleMin: z.number().min(0.2).max(1),
    opacityMs: z.number().min(0).max(3000),
    transformMs: z.number().min(0).max(3000),
    hoverDelayMs: z.number().min(0).max(4000),
    clickAction: z.enum(["lightbox", "link"]),
    friction: z.number().min(0).max(0.999),
    wheelSpeed: z.number().min(0).max(5),
    idleDriftPxPerSec: z.number().min(0).max(120),
    initialPan: z.object({ x: z.number(), y: z.number() }).strict(),
  })
  .partial()
  .strict();

/** Every key the table accepts, and where each one lands in the config. */
const GROUPS = {
  "home.marquee": { schema: marquee, path: ["home", "marquee"] },
  "works.ring": { schema: ring, path: ["works", "ring"] },
  "about.scene": { schema: scene, path: ["about", "scene"] },
  "writings.list": { schema: writingsList, path: ["writings", "list"] },
  "writings.article": { schema: article, path: ["writings", "article"] },
  "craft.board": { schema: board, path: ["craft", "board"] },
} as const;

export type SettingsKey = keyof typeof GROUPS;
export const settingsKeys = Object.keys(GROUPS) as SettingsKey[];

/** The schema for one key, so the studio can validate before it writes. */
export function schemaFor(key: SettingsKey) {
  return GROUPS[key].schema;
}

type Row = { key: string; value: unknown };

/** Overlays one validated group onto a mutable config. */
function apply(config: SiteConfig, key: SettingsKey, value: unknown) {
  const parsed = GROUPS[key].schema.safeParse(value);
  if (!parsed.success) return;

  const [a, b] = GROUPS[key].path as [keyof SiteConfig, string];
  const group = (config[a] as Record<string, unknown>)[b] as Record<
    string,
    unknown
  >;
  Object.assign(group, parsed.data);
}

/**
 * Defaults with any valid overrides merged in.
 *
 * A missing table, a failed query and an empty table are all the same answer:
 * the defaults. The page must render with no backend at all.
 */
export async function getSiteConfig(): Promise<SiteConfig> {
  const config = defaultConfig();
  const supabase = getSupabase();
  if (!supabase) return config;

  // A project that has not had migration 0005 applied answers 404 with an
  // empty body, which the client throws on; the defaults have to survive that.
  let data: Row[] | null = null;
  try {
    const result = await supabase.from("site_settings").select("key,value");
    if (result.error) return config;
    data = (result.data ?? []) as Row[];
  } catch {
    return config;
  }

  for (const row of data) {
    if ((settingsKeys as string[]).includes(row.key)) {
      apply(config, row.key as SettingsKey, row.value);
    }
  }
  return config;
}
