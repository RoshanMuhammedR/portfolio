"use server";

import type { ReactNode } from "react";
import { renderMarkdown } from "@/lib/markdown";

/**
 * The studio's live preview.
 *
 * It runs the *same* pipeline the published page runs, on the server, and hands
 * the rendered elements back. A second, simpler renderer in the browser would
 * drift from the real one, and the first time it drifted would be the time a
 * post looked right here and wrong in public.
 */
export async function renderPreview(source: string): Promise<ReactNode> {
  const { content } = await renderMarkdown(source, { tocDepth: 3 });
  return <div className="writing-prose">{content}</div>;
}
