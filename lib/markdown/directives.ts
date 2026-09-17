import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import type { Plugin } from "unified";
import { safeMediaSrc, safeLinkHref } from "./urls";

/**
 * The directive vocabulary posts are written in.
 *
 * Everything here is a *name plus attributes*, never markup: a post is still
 * portable Markdown, and nothing an author types can become an element the
 * renderer did not choose. Unknown directives are left as text so a typo is
 * visible rather than silently swallowed.
 *
 *   :::note / :::tip / :::warning   a callout, body in Markdown
 *   ::figure{src alt caption bleed} a figure
 *   :::gallery{columns}             a grid of the images inside it
 *   ::video{src poster autoplay loop}
 *   ::embed{provider id}            youtube | vimeo, URL built here
 *   :highlight[text]{image logo link}
 */

type DirectiveNode = {
  type: "textDirective" | "leafDirective" | "containerDirective";
  name: string;
  attributes?: Record<string, string | null | undefined>;
  children: unknown[];
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
  };
};

const CALLOUTS = new Set(["note", "tip", "warning"]);

/** Built here rather than taken from the author, so a raw URL can never end up
 *  in an iframe src. */
const EMBEDS: Record<string, (id: string) => string> = {
  youtube: (id) => `https://www.youtube-nocookie.com/embed/${id}`,
  vimeo: (id) => `https://player.vimeo.com/video/${id}`,
};

/** Provider ids are opaque tokens; anything with a slash, a scheme or a query
 *  in it is not one. */
const EMBED_ID = /^[\w-]{1,64}$/;

const truthy = (value: string | null | undefined) =>
  value === "" || value === "true" || value === "1";

export const remarkPortfolioDirectives: Plugin<[], Root> = () => (tree) => {
  visit(tree, (node) => {
    const directive = node as unknown as DirectiveNode;
    if (
      directive.type !== "textDirective" &&
      directive.type !== "leafDirective" &&
      directive.type !== "containerDirective"
    ) {
      return;
    }

    const attributes = directive.attributes ?? {};
    const data = (directive.data ??= {});

    /* ---- callouts ---- */
    if (directive.type === "containerDirective" && CALLOUTS.has(directive.name)) {
      data.hName = "callout";
      data.hProperties = { tone: directive.name, label: attributes.title ?? null };
      return;
    }

    /* ---- gallery ---- */
    if (directive.type === "containerDirective" && directive.name === "gallery") {
      const columns = Number(attributes.columns ?? 2);
      data.hName = "gallery";
      data.hProperties = {
        columns: Number.isFinite(columns)
          ? String(Math.min(4, Math.max(1, Math.round(columns))))
          : "2",
      };
      return;
    }

    /* ---- figure ---- */
    if (directive.type === "leafDirective" && directive.name === "figure") {
      const src = safeMediaSrc(attributes.src);
      if (!src) return;
      data.hName = "figureblock";
      data.hProperties = {
        src,
        alt: attributes.alt ?? "",
        caption: attributes.caption ?? null,
        bleed: truthy(attributes.bleed) ? "true" : null,
      };
      return;
    }

    /* ---- video ---- */
    if (directive.type === "leafDirective" && directive.name === "video") {
      const src = safeMediaSrc(attributes.src);
      if (!src) return;
      data.hName = "videoblock";
      data.hProperties = {
        src,
        poster: safeMediaSrc(attributes.poster) ?? null,
        caption: attributes.caption ?? null,
        autoplaying: truthy(attributes.autoplay) ? "true" : null,
        looping: truthy(attributes.loop) ? "true" : null,
        bleed: truthy(attributes.bleed) ? "true" : null,
      };
      return;
    }

    /* ---- embed ---- */
    if (directive.type === "leafDirective" && directive.name === "embed") {
      const provider = (attributes.provider ?? "").toLowerCase();
      const id = attributes.id ?? "";
      const build = EMBEDS[provider];
      if (!build || !EMBED_ID.test(id)) return;
      data.hName = "embedblock";
      data.hProperties = {
        src: build(id),
        provider,
        label: attributes.title ?? `${provider} video`,
      };
      return;
    }

    /* ---- inline highlight ---- */
    if (directive.type === "textDirective" && directive.name === "highlight") {
      data.hName = "highlightmark";
      data.hProperties = {
        image: safeMediaSrc(attributes.image) ?? null,
        logo: safeMediaSrc(attributes.logo) ?? null,
        link: safeLinkHref(attributes.link) ?? null,
      };
    }
  });
};
