/**
 * Stand-ins for product shots, used wherever a project has no live screenshot.
 * Two stops each, dark enough that white type sits on them at full contrast,
 * and distinct enough that neighbouring cards do not read as one repeated tile.
 */
const glow = (a: string, b: string) =>
  `radial-gradient(120% 90% at 50% 118%, ${a} 0%, ${b} 46%, #0E0F13 100%)`;

export const GLOWS: Record<string, string> = {
  saga: glow("#2C4B7C", "#151A24"),
  "ai-trip-planner": glow("#1F5C48", "#14201C"),
  konnectify: glow("#4A3A6B", "#1C1826"),
  sniplink: glow("#3B3470", "#17162A"),
  "vps-stack": glow("#2F5A45", "#131C17"),
  "ai-resume-analyzer": glow("#1E5E48", "#121C18"),
  "youtube-chat": glow("#6B2F33", "#221517"),
  lumyn: glow("#5C4A1F", "#1F1A10"),
  monotask: glow("#4A4A48", "#1A1A19"),
  truthmesh: glow("#2F4A6B", "#141A22"),
};
