# Strip B — handover brief

`StripB.html` is the approved design, as one self-contained file. Open it in a
browser to see the target. Your job is to port it into the site; this file tells
you what is load-bearing and what is not.

---

## What it is

A single full-page composition, 1440 x 4944, in five bands:

| Band | y (strip coords) | Height | Content |
|---|---|---|---|
| Hero | 0 | 820 | name, headline, standfirst, two buttons, location line |
| Experience | 948 | 780 | Konnectify, three highlights |
| Projects | 1856 | 1140 | Saga, AI Trip Planner |
| Stack | 3124 | 1080 | four discipline columns |
| Footer (Night) | 4384 | 560 | dark CTA, résumé, email, name/city strip |

Seam hairlines sit at **y = 884, 1792, 3060**. The ground tilts and the dark
footer rises out of it between **y = 4314 (left) and 4256 (right)**.

## The one rule that shapes everything

**The backdrop is ONE canvas covering the entire page, not one per section.**

This was the fix for the original cut-offs. With a canvas per section, anything
that reached a section edge got guillotined by it. On one surface, the pyramid's
cast shadow, the roads and the concrete bodies cross section boundaries and
finish where they naturally finish. Three bodies deliberately straddle seams.

If you split the canvas back up, the design breaks. Keep `<canvas id="bg">`
absolutely positioned at the root of the page, spanning the full height, with
the copy layered above it.

---

## Do not change

- **Every word of copy.** It is the client's own. No rewording, no reordering, no
  added headings.
- **The section layouts.** Grid structure, column counts, rule weights, spacing.
- **The hero geometry constants** in `scene.boot()` — apex, base corners, the
  vanishing-point scale `sc()`, the road targets `T1`/`T2`, the shadow bands.
  These were tuned over many rounds and approved.
- **Flat fills only in the asset.** No gradients on the pyramid, the shadow, the
  bodies or the roads-as-shapes. Tonal steps do the falloff. (Linear gradients
  *are* used for three fades — the grid fade, the left copy wash, the footer road
  glow — leave those as they are, but do not add more.)
- **The palette:**
  | Token | Hex |
  |---|---|
  | paper | `#F4F2EC` |
  | ink | `#12120F` |
  | grid / hairline | `#DCD8CE` |
  | mint (accent, CTAs only) | `#2FE39B` |
  | concrete | `#DCD7CA` `#B6B0A1` `#CBC5B6` `#A39B8B` |
  | night footer | `#17160F` |
- **Mint is only ever an accent** — CTAs, focus states, seam sweeps. Never a fill.

## Must be preserved in the port

1. **Pointer parallax.** The scene re-renders on pointer move; `ox`/`oy` are the
   cursor offset from centre, eased at `0.07`. Everything in the backdrop drifts.
2. **Click-to-focus, three independent groups.** `hl` (3 highlights), `proj`
   (2 projects), `col` (4 stack columns). Clicking one holds it and drops its
   siblings to 42% / 50% / 38% respectively. Clicking again releases. The three
   groups do not interfere with each other. In the standalone this is the
   `data-group` / `data-pick` wiring at the bottom of the file; in React it is
   three pieces of state.
3. **Hover states** on highlights, projects, feature lines, stack tokens and
   buttons.
4. **The DPR budget.** A 4944-tall canvas at 2x is ~28M pixels of backing store
   and browsers refuse to allocate it — the canvas comes back blank with no
   error. `BUDGET = 17000000` sizes it down to 1.5x, with fallbacks to 1.25x
   and 1x. **Keep this.** Do not "fix" it back to `devicePixelRatio`.
5. **`prefers-reduced-motion`** kills the mint seam sweeps. Keep that rule.
6. **Read the canvas size from `clientWidth`/`clientHeight`, never from the
   `width`/`height` attributes.** Setting `cv.width` reflects onto the attribute,
   so re-reading it compounds on every re-mount and the canvas goes blank. There
   is a comment on this at the top of `boot()`.

---

## What you should change

**Responsiveness.** The design is authored at a fixed 1440px and the standalone
cheats with a fit-to-width `transform: scale()` shim (`#fit`, and the small IIFE
at the bottom). That is a viewing aid, not a port. Replace it:

- Let the copy reflow — the sections are already flex/grid, so give them fluid
  max-widths and a real padding scale instead of the hard `left: 100px`.
- Keep the canvas full-bleed at the true viewport width and re-run `boot()` on
  resize. The scene is written in terms of `W` and `H`, and most x-positions are
  already `W * fraction`, so it adapts — but the **y** constants are absolute and
  will need a vertical scale factor once section heights stop being fixed.
- Below ~900px the pyramid crop wants rethinking rather than squashing. Suggest
  an approach before you implement one.

**Structure.** Split it into real components (hero / experience / projects /
stack / footer + one scene module), move the inline styles into whatever the
project already uses, and pull the repeated content (highlights, projects, stack
columns) into data arrays.

**Accessibility.** The focus groups are click-only divs today. Make them real
buttons, keyboard-reachable, with `aria-pressed`. The canvas is decorative —
give it `aria-hidden="true"`.

---

## Suggested first prompt

> Read HANDOVER.md, then open StripB.html in full. Do not write any code yet —
> first tell me how you would split it into components for this codebase, and how
> you would make it responsive without breaking the single-canvas rule or the
> geometry constants. Once I approve the plan, implement it in small steps and
> show me a diff at each step.

Ask for the plan first. The value in this file is the geometry, and it is easy to
lose in a one-shot rewrite.
