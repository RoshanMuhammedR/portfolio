/**
 * Every tunable number the interactive surfaces use, in one typed place.
 *
 * Components import from here and never hard-code a magic number, so a value
 * can be changed once and land everywhere. Values marked (ref) were measured on
 * the reference build; changing them changes how closely the two match.
 *
 * Three layers stack on top of each other:
 *   1. these defaults,
 *   2. rows in `site_settings`, merged over them at request time (lib/settings),
 *   3. content in Supabase, edited in /studio.
 */
export const siteConfig = {
  home: {
    /** The works column on `/`, which scrolls itself forever. */
    marquee: {
      enabled: true,
      /** "down" = cards travel top -> bottom, which is what was asked for. */
      direction: "down" as "down" | "up",
      /** Constant in px per second, so the pace does not follow content height. */
      speedPxPerSec: 28,
      pauseOnHover: true,
      /** 0 pauses under the pointer; 0.25 leaves a slow crawl. */
      hoverSpeedFactor: 0,
      /** Height of a fade-out at the top and bottom of the column. Off: the
       *  cards run cleanly to the edges. Set above 0 to fade them out. */
      edgeFadePx: 0,
      /** Wheel and touch drag add to the offset while it runs. */
      wheelScrub: true,
      /** Repeat the rows until one set is at least this many viewports tall. */
      minTrackViewports: 2,
    },
  },

  works: {
    /** The tilted ring of work images on `/works`. (ref) */
    ring: {
      /** How far the ring is tipped towards the viewer. */
      tiltDeg: 23,
      /** The ring's diameter budget, as container query units. */
      spanCqw: 78,
      spanCqh: 96,
      /** Tile width is the ring's chord, clamped into this range. */
      tileMinPx: 112,
      tileMaxPx: 380,
      /** Height as a fraction of width. */
      tileAspect: 0.68,
      /** How much bigger the focused card gets, and its ceiling. */
      frontScale: 2.9,
      focusMaxCqw: 72,
      /** Perspective distance = radius x this. */
      perspectiveFactor: 4.1,
      /** Coming forward, going back, and the cross-fade of the others. */
      frontMs: 480,
      returnMs: 340,
      fadeMs: 320,
      /** Idle rotation speed. */
      idleDegPerSec: 6,
      /** Grace period before an unfocused ring returns, so row-to-row
       *  movement does not flash through the release state. */
      releaseDelayMs: 150,
      /** Past this many works the ring shows a window of the nearest ones. */
      maxItems: 24,
      /** Drag sensitivity and how quickly the throw dies away. */
      dragDegPerPx: 0.25,
      inertiaFriction: 0.94,
    },
  },

  about: {
    /** The physics scene of the owner's interests on `/about`. (ref) */
    scene: {
      gravity: -30,
      /** Device pixel ratio ceiling - past this the gain is invisible. */
      dprMax: 1.5,
      shadowOpacity: 0.15,
      dropInOnLoad: true,
      /** Dwell before the hover card appears. */
      infoDelayMs: 250,
      maxObjects: 24,
    },
  },

  writings: {
    list: {
      /** "number" gives the reference's 003 / 002 / 001; "date" the month. */
      rowMeta: "number" as "number" | "date",
      previewFadeMs: 200,
      /** Shown when no row is held. Null leaves the panel empty. */
      idleIllustrationUrl: null as string | null,
    },
    article: {
      /** The hero, in px. (ref) */
      bannerHeight: 350,
      bannerMaxWidth: 550,
      /** Where the article column starts, under the hero. (ref) */
      spreadTopPx: 252,
      /** Sticky offset of the "On this page" list. (ref) */
      tocTopPx: 120,
      tocMaxWidth: 180,
      /** 2 lists h2 only; 3 adds h3. */
      tocDepth: 2 as 2 | 3,
    },
  },

  craft: {
    /** The infinite board on `/craft`. (ref) */
    board: {
      columns: 4,
      tileWidth: 350,
      gap: 40,
      padding: 40,
      /** The pattern repeats every (pattern size x this). */
      patternScale: 1.2,
      /** How faint a tile at the very edge gets. */
      minVisibility: 0.35,
      /** Everything inside this fraction of the viewport is at full strength. */
      focusRect: 0.6,
      /** Scale at minimum visibility. */
      scaleMin: 0.9,
      opacityMs: 350,
      transformMs: 450,
      /** Dwell before the info card appears. */
      hoverDelayMs: 600,
      clickAction: "lightbox" as "lightbox" | "link",
      friction: 0.94,
      wheelSpeed: 1,
      /** A slow ambient drift. Off by default, and always off under
       *  prefers-reduced-motion. */
      idleDriftPxPerSec: 0,
      initialPan: { x: -200, y: -80 },
    },
  },
} as const;

/** The shape callers read. `as const` above keeps every number as its own
 *  literal type (`28`, `-200`), which no runtime value could ever be assigned
 *  to; this widens numbers and booleans back to their base types, keeps the
 *  string unions, and drops readonly so an override can be merged in. */
export type SiteConfig = {
  home: { marquee: Widen<typeof siteConfig.home.marquee> };
  works: { ring: Widen<typeof siteConfig.works.ring> };
  about: { scene: Widen<typeof siteConfig.about.scene> };
  writings: {
    list: Widen<typeof siteConfig.writings.list>;
    article: Omit<Widen<typeof siteConfig.writings.article>, "tocDepth"> & {
      tocDepth: 2 | 3;
    };
  };
  craft: { board: Widen<typeof siteConfig.craft.board> };
};

type Widen<T> = T extends number
  ? number
  : T extends boolean
    ? boolean
    : T extends string | null
      ? T
      : { -readonly [K in keyof T]: Widen<T[K]> };

export type MarqueeConfig = SiteConfig["home"]["marquee"];
export type RingConfig = SiteConfig["works"]["ring"];
export type SceneConfig = SiteConfig["about"]["scene"];
export type WritingsListConfig = SiteConfig["writings"]["list"];
export type ArticleConfig = SiteConfig["writings"]["article"];
export type BoardConfig = SiteConfig["craft"]["board"];

/** A plain, deeply-mutable copy. The frozen literal above is the record of
 *  intent; this is what gets merged into and handed to components. */
export function defaultConfig(): SiteConfig {
  return structuredClone(siteConfig) as SiteConfig;
}
