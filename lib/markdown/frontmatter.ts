import { load, dump } from "js-yaml";

/**
 * YAML frontmatter, so a post is a portable `.md` file rather than a row you
 * can only read through this app.
 *
 * Import parses the block into columns and leaves the rest as `body`; export
 * writes the same block back. The pair round-trips: what comes out of Export
 * and back through Import is the same post.
 */

export type Frontmatter = {
  title?: string;
  slug?: string;
  excerpt?: string;
  cover?: string;
  coverAlt?: string;
  coverHeight?: number;
  preview?: string;
  previewKind?: "image" | "illustration";
  toc?: boolean;
  tocDepth?: 2 | 3;
  published?: boolean;
  date?: string;
  description?: string;
};

const FENCE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/** Scalars only. A post's metadata is a flat list of settings; anything nested
 *  is a mistake, and silently accepting it would put unvalidated shapes into
 *  the database. */
function scalar(value: unknown): string | number | boolean | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "boolean") return value;
  if (value instanceof Date) return value.toISOString();
  return undefined;
}

export function parseFrontmatter(source: string): {
  data: Frontmatter;
  body: string;
} {
  const text = source.replace(/^\uFEFF/, "");
  const match = FENCE.exec(text);
  if (!match) return { data: {}, body: text };

  let parsed: unknown;
  try {
    // js-yaml's default schema has no custom tags, so this cannot construct
    // arbitrary objects - it is the safe loader.
    parsed = load(match[1]);
  } catch {
    // A malformed block is left in the body rather than thrown away.
    return { data: {}, body: text };
  }
  if (!parsed || typeof parsed !== "object") return { data: {}, body: text };

  const raw = parsed as Record<string, unknown>;
  const data: Frontmatter = {};

  const str = (key: keyof Frontmatter) => {
    const value = scalar(raw[key]);
    if (typeof value === "string" && value.trim()) {
      (data[key] as string) = value.trim();
    }
  };

  str("title");
  str("slug");
  str("excerpt");
  str("cover");
  str("coverAlt");
  str("preview");
  str("date");
  str("description");

  const height = scalar(raw.coverHeight);
  if (typeof height === "number") data.coverHeight = Math.round(height);

  if (raw.previewKind === "illustration" || raw.previewKind === "image") {
    data.previewKind = raw.previewKind;
  }
  if (typeof raw.toc === "boolean") data.toc = raw.toc;
  if (raw.tocDepth === 2 || raw.tocDepth === 3) data.tocDepth = raw.tocDepth;
  if (typeof raw.published === "boolean") data.published = raw.published;

  return { data, body: text.slice(match[0].length) };
}

export function serialiseFrontmatter(
  data: Frontmatter,
  body: string,
): string {
  const clean = Object.fromEntries(
    Object.entries(data).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
  if (Object.keys(clean).length === 0) return body;
  return `---\n${dump(clean, { lineWidth: 100 }).trimEnd()}\n---\n\n${body.replace(
    /^\n+/,
    "",
  )}`;
}
