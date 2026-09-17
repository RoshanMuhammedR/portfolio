import { renderMarkdown } from "./pipeline";

export { renderMarkdown } from "./pipeline";
export { readingTime } from "./readingTime";
export type { Heading, Rendered } from "./pipeline";
export {
  parseFrontmatter,
  serialiseFrontmatter,
  type Frontmatter,
} from "./frontmatter";

/**
 * The simple entry point: Markdown in, prose out.
 *
 * Callers that need the heading outline (the article page, for its quick-nav
 * list) use `renderMarkdown` directly instead.
 */
export async function Markdown({ source }: { source: string }) {
  const { content } = await renderMarkdown(source);
  return <div className="writing-prose">{content}</div>;
}
