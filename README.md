# Portfolio — Roshan Muhammed R

Live: <https://portfolio-frontend-teal-ten.vercel.app/>

A five-page portfolio behind a fixed left rail: **Home**, **Works**, **About**,
**Writings**, **Craft**. Each page's right side is interactive — a works column
that scrolls itself, a 3D ring of work, a physics desk of favourites, per-post
previews, and an infinite craft board — and all of it is edited from a small
CMS at `/studio`.

## Stack

| | |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 — CSS-first tokens in [`app/globals.css`](app/globals.css), no `tailwind.config.js` |
| Type | Geist + Geist Mono, self-hosted via `next/font` |
| Icons | `lucide-react` |
| 3D | `three` + `cannon-es` (About only, loaded on demand) |
| Markdown | `unified` → `remark-gfm` / `remark-directive` → `rehype-slug` / `rehype-pretty-code` (shiki) → React |
| Validation | `zod` (runtime settings) |
| Content | Supabase (Postgres) — **optional** |
| Images | Supabase Storage (`media` bucket); Filebase remains as an optional alternative |

**The site runs with no environment variables at all.** Without them, Craft and
Writings show their empty states, Home and Works read
[`content/projects.ts`](content/projects.ts), About keeps its education cards,
and `/studio` says it is not configured. See
[`docs/BACKEND.md`](docs/BACKEND.md) to turn the backend on.

This checkout is wired to a Supabase project through `.env.local` (gitignored).
The original schema is applied there as the `portfolio_content_schema`
migration. **The numbered files in
[`supabase/migrations/`](supabase/migrations) are not applied yet** — until they
are, every page keeps working on its fallback, and the studio names the file
each tab is waiting for. [`supabase/pending.sql`](supabase/pending.sql) is all
seven in one paste for the SQL editor.

## Getting started

```bash
npm install
npm run dev
```

| Script | Does |
|---|---|
| `npm run dev` | Dev server on <http://localhost:3000> |
| `npm run build` | Production build (lints and typechecks) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

> Do not run `npm run build` while `npm run dev` is running — they share
> `.next/` and the build wipes the dev server's output, which shows up as a page
> with no CSS. Stop the dev server first.

## The interactive pieces

| Page | What it does | Where |
|---|---|---|
| Home | The works column scrolls itself, forever, at a constant px/s. Hover slows it, the wheel scrubs it, keyboard focus pauses it; the clone that closes the loop is `inert`. | [`InfiniteMosaic`](components/home/InfiniteMosaic.tsx), [`lib/homeMosaic.ts`](lib/homeMosaic.ts) |
| Works | A tilted ring of work images whose tiles are the ring's chord, so any count meets edge to edge. Holding a row turns the ring the short way and brings that work forward, flat; past `maxItems` the ring shows a window of the nearest works. A swipe rail on phones. | [`WorksRing`](components/works/WorksRing.tsx), [`WorksList`](components/works/WorksList.tsx) |
| About | A physics desk of the owner's favourites: drag, throw, and tap to flip, kick, open, spin, follow a link or pin the card. A text list mirrors it for assistive tech; a flat collage replaces it without WebGL. | [`InterestsScene`](components/about/InterestsScene.tsx), [`ThreeScene`](components/about/ThreeScene.tsx) |
| Writings | Holding a row shows that post's own image or line illustration, with an out-in fade. Rows are numbered `003 / 002 / 001` or dated. | [`WritingsList`](components/writings/WritingsList.tsx) |
| Article | Pure Markdown with a hero, figures, callouts, galleries, video, allow-listed embeds, highlighted phrases with image popovers, tables, footnotes and highlighted code — plus a sticky "On this page" list that tracks the section you are in. | [`lib/markdown/`](lib/markdown), [`ArticleLayout`](components/writings/ArticleLayout.tsx) |
| Craft | An infinite board: the works are laid into a masonry block that repeats in both directions. Tiles near the middle are bright, the edges fade; a 600ms dwell (or keyboard focus, or a long press) opens an info card; a click opens a lightbox. | [`InfiniteCraftBoard`](components/craft/InfiniteCraftBoard.tsx), [`lib/craftPattern.ts`](lib/craftPattern.ts) |

Every one of them has a `prefers-reduced-motion` path and a keyboard path, and
is laid out for light and dark at 1608×862 (the reference size) and 375×812.

## Configuration

Three layers, each overriding the one before:

1. **Typed defaults** — [`content/config.ts`](content/config.ts) holds every
   tunable number above (speeds, tilts, delays, falloffs). Components read it
   and hard-code nothing.
2. **Runtime overrides** — rows in the `site_settings` table, keyed by group
   (`"craft.board"`). [`lib/settings.ts`](lib/settings.ts) validates each with
   `zod` and merges it server-side; anything out of range is ignored. The
   studio's **Settings** tab edits them with sliders and toggles.
3. **Content** — projects, interests, writings and craft live in Supabase and
   are edited in their own studio tabs. Pages revalidate every 60 seconds.

## Layout of the source

| Path | Holds |
|---|---|
| [`components/shell/AppShell.tsx`](components/shell/AppShell.tsx) | The frame: fixed rail on desktop, drawer on phones |
| [`components/shell/SplitPage.tsx`](components/shell/SplitPage.tsx) | The copy column / media column split every page uses |
| [`components/home/`](components/home) | Work cards and the self-scrolling column |
| [`components/works/`](components/works) | The list and the ring |
| [`components/about/`](components/about) | The physics desk, its fallback collage |
| [`components/writings/`](components/writings) | List previews, the article spread, the quick-nav list |
| [`components/craft/`](components/craft) | The infinite board; `CraftCanvas` is an unused manual x/y renderer kept for an optional manual-layout mode |
| [`components/studio/`](components/studio) | The editors — projects, writings, craft, interests, settings |
| [`content/config.ts`](content/config.ts) | Every tunable value, typed |
| [`content/portfolioData.ts`](content/portfolioData.ts) | Identity, experience, projects, stack |
| [`content/projects.ts`](content/projects.ts) | The static fallback for Home and Works |
| [`lib/content.ts`](lib/content.ts) | Reads Supabase, falls back to static content, survives missing migrations |
| [`lib/settings.ts`](lib/settings.ts) | Validates and merges `site_settings` |
| [`lib/markdown/`](lib/markdown) | The Markdown pipeline, directives, URL policy, frontmatter |
| [`lib/upload.ts`](lib/upload.ts) | Studio uploads to Supabase Storage |
| [`lib/sound.tsx`](lib/sound.tsx) | The sound cues, synthesised — no audio files |
| [`supabase/schema.sql`](supabase/schema.sql) | The whole schema, for a fresh project |
| [`supabase/migrations/`](supabase/migrations) | The same changes as numbered steps, plus the seed |
| [`supabase/pending.sql`](supabase/pending.sql) | Those steps as one paste, for a project created before them |
| [`scripts/screenshot.mjs`](scripts/screenshot.mjs) | Captures live sites and craft pieces with the installed Chrome |
| `public/work/` · `public/craft/` · `public/crafts/` | Project screenshots, craft captures, and the live craft demos |

## The design system

Tokens, grid and type are matched to the reference build the design is based on,
measured from the live site rather than eyeballed:

| | |
|---|---|
| Grid | 10 columns — `repeat(4, 118px) repeat(6, minmax(0,1fr))`, 40px margins, 20px gutters |
| Split | `--grid-split-x` = 592px; the media side is a `--neutral-100` plate with a 1px **dashed** left edge |
| Rhythm | 40px top padding, a 32px brand row, 100px row-gap — which is why every page's first line sits at y=172 |
| Heading | 28px / 700 / 1.3 / -0.02em on Home; 20px / 26px elsewhere |
| Body | 15px / 23px / -0.01em |
| Nav | 14px / 500 / 21px; labels 13px |
| Ramps | `--neutral-50..950`, `--primary-50..950` in [`app/globals.css`](app/globals.css) |

Light is the default, as on the reference. The bottom-left corner holds the
sound toggle and a light/dark switch; a dark choice is remembered and applied
before first paint, so it never flashes.

## Content

- **Projects** — nine public repositories from
  [github.com/RoshanMuhammedR](https://github.com/RoshanMuhammedR), plus the
  Konnectify internship. Five have live screenshots. Once migration 0001 and
  the seed (0007) are applied they live in the `projects` table; until then,
  in `content/projects.ts`.
- **Craft** — twelve self-contained pieces from the `../crafts` repository. Their
  captures are in `public/craft/`, working copies in `public/crafts/` (every
  tile opens a live demo), and their descriptions, tags and order in the
  `craft_items` table.
- **Writings** — three posts in the `writings` table, editable at `/studio`.
  Covers and list previews are uploaded per post.
- **About** — the favourites on the desk are the owner's own and are entered in
  the studio's **Interests** tab. None ship with the repo.

Re-capture after changing a piece or a deployment. Stop `npm run dev` first if
you will build afterwards:

```bash
node scripts/screenshot.mjs jobs.json
```

## Two things worth knowing

**Screenshots are real captures.** Every image on a project card was taken from
its live deployment with `scripts/screenshot.mjs`. Projects without a reachable
deployment — and Konnectify, which is proprietary — keep a title card rather
than mocked-up browser chrome.

**Nothing on the page is invented.** Every claim traces to the résumé or the
academic record — see the product principles in [`PRODUCT.md`](PRODUCT.md).
That is why About's desk ships empty: favourites are not something the repo can
guess at. Any artwork on it that is not CC0 carries its credit on the page.
