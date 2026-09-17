/** 220 words a minute, the figure the reference's own meta line uses.
 *
 *  Its own module so the studio can compute it in the browser without pulling
 *  the whole remark/shiki pipeline into the client bundle. */
export function readingTime(source: string): number {
  const words = source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`\-[\]()!]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}
