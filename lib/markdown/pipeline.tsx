import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import type { ReactNode } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import type { Root } from "hast";

import { remarkPortfolioDirectives } from "./directives";
import {
  rehypeCollectHeadings,
  rehypeImagesToFigures,
  rehypeUrlPolicy,
  type Heading,
} from "./rehype";
import { proseComponents } from "./components";
import { readingTime } from "./readingTime";

export type { Heading };

export type Rendered = {
  content: ReactNode;
  headings: Heading[];
  /** Words / 220, rounded up. Stored on save; recomputed here as the fallback. */
  readingMinutes: number;
};

/**
 * Markdown to React, on the server.
 *
 * `remark-rehype` runs with raw HTML passthrough off, which is the whole
 * security model: an author's `<script>` or `<iframe>` never becomes a node, so
 * there is nothing downstream to sanitise. Links and images are then put
 * through the URL policy, and the only iframes on the page are the ones the
 * `::embed` directive builds from an allow-listed provider and an opaque id.
 */
export async function renderMarkdown(
  source: string,
  options: { tocDepth?: 2 | 3 } = {},
): Promise<Rendered> {
  const headings: Heading[] = [];

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkPortfolioDirectives)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeImagesToFigures)
    .use(rehypeUrlPolicy)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "wrap",
      properties: { className: ["writing-anchor"] },
    })
    .use(rehypePrettyCode, {
      // Both themes are emitted as CSS variables on every token; the stylesheet
      // picks one from [data-theme], so switching theme costs no re-render.
      theme: { light: "github-light", dark: "github-dark-dimmed" },
      keepBackground: false,
      defaultLang: "text",
    })
    .use(rehypeCollectHeadings(headings, options.tocDepth ?? 2));

  // parse() builds the mdast; run() carries it through the remark transforms,
  // across the rehype bridge, and out as hast. Nothing is ever serialised to a
  // string in between, so there is no HTML to re-parse.
  const tree = await processor.run(processor.parse(source));

  const content = toJsxRuntime(tree as Root, {
    Fragment,
    jsx,
    jsxs,
    components: proseComponents as never,
  });

  return { content, headings, readingMinutes: readingTime(source) };
}
