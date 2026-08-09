/**
 * Fixed blueprint grid behind everything. Pure CSS — two repeating gradients
 * and a radial mask — so it never repaints on scroll and costs no JS.
 */
export function GridBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 blueprint-grid [--grid-size:72px] sm:[--grid-size:96px]"
    />
  );
}
