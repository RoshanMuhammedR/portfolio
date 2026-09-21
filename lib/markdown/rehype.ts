import { visit } from "unist-util-visit";
import type { Element, Root, RootContent } from "hast";
import type { Plugin } from "unified";
import { isExternal, safeLinkHref, safeMediaSrc } from "./urls";

export type Heading = { id: string; text: string; depth: 2 | 3 };

/**
 * The URL policy, applied to everything the Markdown parser produced rather
 * than only to the directives.
 *
 * A link whose href does not survive it keeps its text and loses the anchor; an
 * image whose src does not survive it is removed. External links get
 * `rel="noreferrer noopener"` and open in a new tab.
 */
export const rehypeUrlPolicy: Plugin<[], Root> = () => (tree) => {
  visit(tree, "element", (node: Element, index, parent) => {
    if (node.tagName === "a") {
      const href = safeLinkHref(String(node.properties?.href ?? ""));
      if (!href) {
        // Keep the words, drop the anchor: a link that is styled like a link
        // but goes nowhere is worse than plain text.
        if (parent && typeof index === "number") {
          (parent.children as RootContent[]).splice(
            index,
            1,
            ...(node.children as RootContent[]),
          );
          return index;
        }
        delete node.properties?.href;
        return;
      }
      node.properties = { ...node.properties, href };
      if (isExternal(href)) {
        node.properties.target = "_blank";
        node.properties.rel = ["noreferrer", "noopener"];
      }
      return;
    }

    if (node.tagName === "img") {
      const src = safeMediaSrc(String(node.properties?.src ?? ""));
      if (!src) {
        if (parent && typeof index === "number") {
          (parent.children as RootContent[]).splice(index, 1);
          return index;
        }
        return;
      }
      node.properties = { ...node.properties, src };
    }
  });
};

/**
 * `![alt](src "caption")` on its own line becomes a figure, so the common case
 * needs no directive. A paragraph is only converted when the image is the only
 * thing in it - an inline image inside a sentence stays inline.
 */
export const rehypeImagesToFigures: Plugin<[], Root> = () => (tree) => {
  // A gallery's images arrive wrapped in one paragraph, which would make the
  // whole run a single grid cell. Lift them out, one figure per cell.
  visit(tree, "element", (node: Element) => {
    if (node.tagName !== "gallery") return;
    const lifted: RootContent[] = [];
    for (const child of node.children) {
      const candidates =
        child.type === "element" && child.tagName === "p"
          ? child.children
          : [child];
      for (const item of candidates) {
        if (item.type === "element" && item.tagName === "img") {
          lifted.push(toFigure(item));
        } else if (item.type !== "text" || item.value.trim() !== "") {
          lifted.push(item as RootContent);
        }
      }
    }
    node.children = lifted as Element["children"];
  });

  visit(tree, "element", (node: Element, index, parent) => {
    if (node.tagName !== "p" || !parent || typeof index !== "number") return;

    const meaningful = node.children.filter(
      (child) =>
        !(child.type === "text" && child.value.trim() === "") &&
        child.type !== "comment",
    );
    if (meaningful.length !== 1) return;

    const only = meaningful[0];
    if (only.type !== "element" || only.tagName !== "img") return;

    (parent.children as RootContent[])[index] = toFigure(only);
  });
};

/** One image element, as the figure that renders it. */
function toFigure(image: Element): Element {
  const properties = image.properties ?? {};
  return {
    type: "element",
    tagName: "figureblock",
    properties: {
      src: properties.src,
      alt: properties.alt ?? "",
      caption: properties.title ?? null,
    },
    children: [],
  };
}

/**
 * The outline the "On this page" list is built from.
 *
 * Collected after rehype-slug has run, so the ids here are byte-for-byte the
 * ids on the headings and a TOC link can never miss its target.
 */
export function rehypeCollectHeadings(
  into: Heading[],
  depth: 2 | 3,
): Plugin<[], Root> {
  return () => (tree) => {
    visit(tree, "element", (node: Element) => {
      const level =
        node.tagName === "h2" ? 2 : node.tagName === "h3" ? 3 : null;
      if (level === null || level > depth) return;

      const id = node.properties?.id;
      if (typeof id !== "string" || !id) return;

      // GFM's footnotes section ends in a visually hidden "Footnotes" heading.
      // It is a landmark for screen readers, not a section of the piece.
      const classes = node.properties?.className;
      const hidden =
        Array.isArray(classes) && classes.includes("sr-only");
      if (hidden || id === "footnote-label") return;

      into.push({ id, text: textOf(node), depth: level as 2 | 3 });
    });
  };
}

function textOf(node: Element): string {
  let out = "";
  visit(node, "text", (text) => {
    out += text.value;
  });
  return out.trim();
}
