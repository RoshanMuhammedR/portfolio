import { craftItems as staticCraftItems, type CraftItem } from "@/content/craft";
import { GLOWS } from "@/content/glows";
import { projects as staticProjects } from "@/content/projects";
import { experienceData } from "@/content/portfolioData";
import { getSupabase } from "@/lib/supabase/server";
import type {
  CraftRow,
  HomeLayout,
  InterestRow,
  ProjectRow,
  WritingRow,
} from "@/lib/supabase/types";

export type { CraftItem };

/** Cards with no uploaded image fall back to a tinted panel, cycling the
 *  tuned gradients so a board of them does not read as one repeated card. */
const FALLBACK_GLOWS = Object.values(GLOWS);

/**
 * Supabase rejects a select naming a column that does not exist (42703), which
 * would take a page down between deploying this code and running the
 * migrations in supabase/migrations/. So every widened query carries the
 * columns it had before, and falls back to those on that one error.
 */
async function selectOrNarrow<T>(
  wide: () => PromiseLike<{ data: unknown; error: { code?: string } | null }>,
  narrow: () => PromiseLike<{ data: unknown; error: unknown }>,
): Promise<T[] | null> {
  const first = await settle(wide);
  if (first && !first.error) return (first.data ?? []) as T[];
  if (!first || first.error?.code !== "42703") return null;

  const second = await settle(narrow);
  if (!second || second.error) return null;
  return (second.data ?? []) as T[];
}

/**
 * A query that cannot throw.
 *
 * A missing table answers 404 with an empty body, which the client tries to
 * parse as JSON and throws on - so "no backend yet" would otherwise be an
 * unhandled exception on a server component rather than an empty page. Every
 * read here has to degrade to its fallback instead.
 */
async function settle<T extends { data: unknown; error: unknown }>(
  run: () => PromiseLike<T>,
): Promise<T | null> {
  try {
    return await run();
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------- craft ---- */

const CRAFT_BASE = "id,title,caption,href,image_url,x,y,w,h,published";
const CRAFT_WIDE = `${CRAFT_BASE},description,tags,year,source_url,aspect,sort`;

export function rowToCraftItem(row: CraftRow, index: number): CraftItem {
  return {
    id: row.id,
    title: row.title,
    caption: row.caption ?? undefined,
    href: row.href ?? undefined,
    x: row.x,
    y: row.y,
    w: row.w,
    h: row.h,
    image: row.image_url ?? undefined,
    glow: FALLBACK_GLOWS[index % FALLBACK_GLOWS.length],
    description: row.description ?? undefined,
    tags: row.tags ?? undefined,
    year: row.year ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    aspect: row.aspect ?? undefined,
  };
}

/** Supabase when it is configured, the static file when it is not. A failed
 *  query is treated the same as no backend: the page still renders. */
export async function getCraftItems(): Promise<CraftItem[]> {
  const supabase = getSupabase();
  if (!supabase) return staticCraftItems;

  const rows = await selectOrNarrow<CraftRow>(
    () =>
      supabase
        .from("craft_items")
        .select(CRAFT_WIDE)
        .eq("published", true)
        .order("sort", { ascending: true })
        .order("created_at", { ascending: true }),
    () =>
      supabase
        .from("craft_items")
        .select(CRAFT_BASE)
        .eq("published", true)
        .order("created_at", { ascending: true }),
  );

  if (!rows) return staticCraftItems;
  return rows.map(rowToCraftItem);
}

/* ---------------------------------------------------------- writings ---- */

const WRITING_LIST_BASE = "id,slug,title,excerpt,published_at";
const WRITING_LIST_WIDE = `${WRITING_LIST_BASE},preview_image_url,preview_kind,reading_minutes`;

export type WritingSummary = Pick<
  WritingRow,
  | "id"
  | "slug"
  | "title"
  | "excerpt"
  | "published_at"
  | "preview_image_url"
  | "preview_kind"
  | "reading_minutes"
>;

export async function getWritings(): Promise<WritingSummary[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const rows = await selectOrNarrow<WritingSummary>(
    () =>
      supabase
        .from("writings")
        .select(WRITING_LIST_WIDE)
        .eq("published", true)
        .order("published_at", { ascending: false }),
    () =>
      supabase
        .from("writings")
        .select(WRITING_LIST_BASE)
        .eq("published", true)
        .order("published_at", { ascending: false }),
  );

  return rows ?? [];
}

const WRITING_BASE = "id,slug,title,excerpt,body,published,published_at";
const WRITING_WIDE =
  `${WRITING_BASE},preview_image_url,preview_kind,cover_image_url,cover_alt,` +
  `cover_height,toc_enabled,toc_depth,reading_minutes,seo_description`;

export async function getWriting(slug: string): Promise<WritingRow | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const rows = await selectOrNarrow<WritingRow>(
    () =>
      supabase
        .from("writings")
        .select(WRITING_WIDE)
        .eq("slug", slug)
        .eq("published", true)
        .limit(1),
    () =>
      supabase
        .from("writings")
        .select(WRITING_BASE)
        .eq("slug", slug)
        .eq("published", true)
        .limit(1),
  );

  return rows?.[0] ?? null;
}

/** Prev/next on an article, by publish order. Cheap enough to fetch whole:
 *  the list is already read for /writings and is a handful of rows. */
export type WritingNeighbour = { slug: string; title: string };

export async function getWritingNeighbours(
  slug: string,
): Promise<{ previous: WritingNeighbour | null; next: WritingNeighbour | null }> {
  const all = await getWritings();
  const at = all.findIndex((w) => w.slug === slug);
  if (at === -1) return { previous: null, next: null };

  // The list is newest first, so the *older* piece is the one after it.
  const older = all[at + 1];
  const newer = all[at - 1];
  return {
    previous: older ? { slug: older.slug, title: older.title } : null,
    next: newer ? { slug: newer.slug, title: newer.title } : null,
  };
}

/* ---------------------------------------------------------- projects ---- */

/** One work, however it was authored: a table row or the static file. */
export type WorkItem = {
  /** The slug; stable across both sources and used as the React key. */
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  tags: string[];
  kind: "project" | "experience";
  /** The live site when there is one, otherwise the repository. */
  href?: string;
  repoUrl?: string;
  image?: { src: string; position?: string };
  glow: string;
  showOnHome: boolean;
  showOnWorks: boolean;
  homeLayout: HomeLayout | null;
};

const PROJECT_COLUMNS =
  "id,slug,title,subtitle,description,tags,kind,live_url,repo_url,image_url," +
  "image_position,glow,show_on_home,show_on_works,home_layout,sort,published";

function rowToWorkItem(row: ProjectRow, index: number): WorkItem {
  return {
    id: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? "",
    description: row.description ?? undefined,
    tags: row.tags ?? [],
    kind: row.kind,
    href: row.live_url ?? row.repo_url ?? undefined,
    repoUrl: row.repo_url ?? undefined,
    image: row.image_url
      ? { src: row.image_url, position: row.image_position }
      : undefined,
    glow:
      row.glow ?? GLOWS[row.slug] ?? FALLBACK_GLOWS[index % FALLBACK_GLOWS.length],
    showOnHome: row.show_on_home,
    showOnWorks: row.show_on_works,
    homeLayout: row.home_layout,
  };
}

/**
 * The static fallback: the Konnectify internship, then the nine projects, in
 * the order the Home mosaic is authored in. Kept in step with migration 0007.
 */
function staticWorkItems(): WorkItem[] {
  const konnectify = experienceData[0];
  const order = [
    "saga",
    "ai-trip-planner",
    "sniplink",
    "vps-stack",
    "ai-resume-analyzer",
    "youtube-chat",
    "lumyn",
    "monotask",
    "truthmesh",
  ];
  const layouts: Record<string, HomeLayout> = {
    saga: "full",
    "ai-trip-planner": "full",
    sniplink: "aside",
    "ai-resume-analyzer": "pair",
    lumyn: "aside-flipped",
  };

  const experience: WorkItem = {
    id: "konnectify",
    title: konnectify.company,
    subtitle: konnectify.role,
    description: konnectify.summary,
    tags: ["Internship", "Full-stack"],
    kind: "experience",
    glow: GLOWS.konnectify,
    // On Works only: there is no screenshot, and Home opens on work that has one.
    showOnHome: false,
    showOnWorks: true,
    homeLayout: null,
  };

  const rest = order.map((slug) => {
    const project = staticProjects.find((p) => p.id === slug)!;
    return {
      id: project.id,
      title: project.title,
      subtitle: project.subtitle,
      tags: project.tags,
      kind: "project" as const,
      href: project.href,
      repoUrl: project.repoUrl,
      image: project.image,
      glow: project.glow,
      // TruthMesh is on Works only; the mosaic is authored as five rows.
      showOnHome: slug !== "truthmesh",
      showOnWorks: true,
      homeLayout: layouts[slug] ?? null,
    };
  });

  return [experience, ...rest];
}

export async function getWorkItems(): Promise<WorkItem[]> {
  const supabase = getSupabase();
  if (!supabase) return staticWorkItems();

  const result = await settle(() =>
    supabase
      .from("projects")
      .select(PROJECT_COLUMNS)
      .eq("published", true)
      .order("sort", { ascending: true }),
  );

  // No table yet, or no rows in it: the static file is still the truth.
  const data = result?.data as ProjectRow[] | null | undefined;
  if (!result || result.error || !data || data.length === 0) {
    return staticWorkItems();
  }
  return data.map(rowToWorkItem);
}

/* --------------------------------------------------------- interests ---- */

const INTEREST_COLUMNS =
  "id,category,title,subtitle,note,link_url,texture_url,model_url,object_type," +
  "action,scale,pos_x,pos_z,rot_y,credit,licence,sort,published";

/**
 * The About scene's objects. There is no static fallback on purpose: someone's
 * favourite films are not something this repository can guess at, so an empty
 * table means the page keeps its fact cards instead.
 */
export async function getInterests(): Promise<InterestRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const result = await settle(() =>
    supabase
      .from("interests")
      .select(INTEREST_COLUMNS)
      .eq("published", true)
      .order("sort", { ascending: true }),
  );

  if (!result || result.error || !result.data) return [];
  return result.data as unknown as InterestRow[];
}
