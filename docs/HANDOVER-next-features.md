# Handover — six interactive features

For the next agent working on `E:\webdev\portfolio`. Read this whole file before
writing code. It covers where the project stands, the conventions you must keep,
and a full spec for each feature: behaviour, data model, admin work, config and
acceptance criteria.

Most specs include values measured from the reference site
([rmoon.me](https://rmoon.me)), which this portfolio is built to match. Where a
value is marked **(ref)** it was measured there; keep it unless you have a
reason not to.

---

## 0. The six features at a glance

| # | Page | What the owner asked for | Reference picture |
|---|---|---|---|
| 1 | Home | The works column on the right scrolls continuously and forever, repeating the works, from top to bottom, at a calm pace | — |
| 2 | Works | A rotating 3D ring carousel. Hovering or clicking a work rotates the ring and zooms that image to the front. Must scale to any number of images | pic 1 (ring of screenshots) |
| 3 | About | Fill the empty right side with an interactive scene of the owner's favourites: movies, anime, football, games, travel, and so on. Assets come from the internet, and every object is interactive | pic 2 (physics collage of objects) |
| 4 | Writings list | Hovering a post shows that post's own image on the right. Configurable in the admin | pic 3 (line-art illustration per post) |
| 5 | Writing article | Rich posts, still pure Markdown: a hero image, figures, callouts, and a quick-nav "On this page" list on the right | pic 4 (hero + TOC) |
| 6 | Craft | An infinite pannable board where every tile is real work, repeated as needed. On-screen tiles are highlighted and off-screen ones fade. Hovering a tile for a moment shows extra info | pic 5 (centre bright, edges dimmed) |

The owner's words, which apply to everything: **"all of these must be added
with proper configuration."** Section 3 defines what that means here.

---

## 1. Where the project stands

### Stack

| | |
|---|---|
| Framework | Next.js 15.5 (App Router), React 19.2, TypeScript |
| Styling | Tailwind CSS v4, CSS-first. Tokens are in `app/globals.css` and there is no `tailwind.config.js` |
| Type | Geist + Geist Mono via `next/font/google` (`app/layout.tsx`) |
| Motion | `motion` 12 is installed (currently unused); most motion is CSS keyframes plus rAF |
| Icons | `lucide-react` |
| Data | Supabase (`@supabase/supabase-js` 2.116), Postgres with RLS |
| Uploads | `app/api/uploads/route.ts` presigns PUTs to **Filebase**. **Filebase is not configured**, so the route returns 501 (see §3.3) |
| Dev tooling | `playwright-core` drives the installed Chrome for screenshots (`scripts/screenshot.mjs`) |

### Routes

| Route | File | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Copy column + `.mosaic` of `WorkCard`s |
| `/works` | `app/works/page.tsx` → `components/works/WorksList.tsx` | 10 rule-rows plus a fixed preview panel (screenshot or glow card) |
| `/about` | `app/about/page.tsx` | Copy column + 5 tilted fact cards (`content/about.ts`) |
| `/writings` | `app/writings/page.tsx` | Rule-rows with dates. Reads Supabase, `revalidate = 60` |
| `/writings/[slug]` | `app/writings/[slug]/page.tsx` | `SplitPage`: title/excerpt on the left, Markdown on the right |
| `/craft` | `app/craft/page.tsx` → `components/craft/CraftCanvas.tsx` | Finite pannable board. Reads Supabase, `revalidate = 60` |
| `/contact` | `app/contact/page.tsx` | Email link |
| `/studio` | `app/studio/page.tsx` | Admin: magic-link sign-in, `CraftEditor`, `WritingsEditor` |
| `/api/uploads` | `app/api/uploads/route.ts` | Filebase presign, owner-only (Supabase JWT + `OWNER_EMAIL`) |

### Key files

```
app/globals.css                    tokens, grid, page-grid, mosaic, rule-row, keyframes, dark theme
app/layout.tsx                     fonts, theme bootstrap script, AppShell
components/shell/AppShell.tsx      fixed rail, corner controls, right plate, mobile drawer, magic-link forwarding
components/shell/Sidebar.tsx       brand + Menu + Connect (links opt in to pointer events)
components/shell/SplitPage.tsx     SplitPage (copy | media), BackCrumb, PageHeading
components/shell/CornerControls.tsx  SoundToggle | ThemeToggle
components/home/WorkCard.tsx       screenshot or glow title card + caption row
components/works/WorksList.tsx     list rows + fixed preview viewer
components/craft/CraftCanvas.tsx   drag/inertia/arrow-key board (finite, clamped)
components/studio/CraftEditor.tsx  drag-to-place board editor, upload, publish
components/studio/WritingsEditor.tsx  list + form (title, slug, excerpt, Markdown body, publish)
lib/content.ts                     getCraftItems, getWritings, getWriting (static fallbacks)
lib/markdown.tsx                   hand-rolled Markdown → React (no HTML passthrough)
lib/sound.tsx                      SoundProvider/useSound: play("hover" | "click" | "open" | "close")
lib/useTheme.ts                    data-theme store (light default, dark remembered)
lib/supabase/{server,browser,types}.ts
content/projects.ts                9 projects (typed), images in public/work/*.webp
content/glows.ts                   gradient stand-ins for projects without screenshots
content/site.ts, content/about.ts, content/portfolioData.ts, content/craft.ts (empty fallback)
supabase/schema.sql                current schema (applied as migration `portfolio_content_schema`)
scripts/screenshot.mjs             capture live sites/pages with installed Chrome
docs/BACKEND.md                    Supabase/Filebase setup guide
public/work/*.webp                 5 live-site screenshots
public/craft/*.webp                12 craft captures
public/crafts/<slug>/index.html    12 live craft demos (copied from E:\webdev\crafts)
```

### Supabase

- Project `uuqewlqyljeryzswyxqr` ("roshanmuhammed50@gmail.com's Project"), region
  `ap-northeast-2`, organisation "roshan". The Supabase MCP is connected in the
  owner's Claude setup.
- `.env.local` (gitignored) holds `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` (a `sb_publishable_…` key) and `OWNER_EMAIL`.
  `.env` holds Resend keys, which are unused right now.
- Tables:
  - `craft_items` (id, title, caption, href, image_url, x, y, w, h, published,
    created_at, updated_at) — **12 published rows**, one per craft.
  - `writings` (id, slug unique, title, excerpt, body Markdown, published,
    published_at, created_at, updated_at) — **3 published posts**.
- Owner check: `public.is_site_owner()` compares `auth.jwt() ->> 'email'` with
  `roshanmuhammed50@gmail.com`.
- RLS pattern, which every new table must copy: one SELECT policy
  `published = true or (select public.is_site_owner())`, plus separate
  INSERT/UPDATE/DELETE policies `to authenticated` using
  `(select public.is_site_owner())`. The `(select …)` wrapper is deliberate
  (initplan caching). There is an `updated_at` trigger via
  `public.touch_updated_at()`.
- The security advisor was clean after the last migration. **Run advisors again
  after every DDL change.**
- Magic link: the owner still has to add `http://localhost:3000/studio` (and the
  production URL) under Auth → URL Configuration → Redirect URLs. Until then,
  `AppShell` forwards `#access_token` / `?code` from any page to `/studio`.

### Git and repos

- Portfolio branch: `rmoon-redesign`. **Nothing is committed yet** (about 55
  changed or untracked entries). Only commit when the owner asks.
- Crafts repo: `E:\webdev\crafts`, 12 self-contained `index.html` pieces, 13
  commits, not pushed. The portfolio serves copies from `public/crafts/`.

### Machine constraints (Windows)

- **C: is about 1 GB from full.** The npm cache is at `E:/webdev/.npm-cache`.
  Put scratch files, captures and downloads on **E:**. When running Playwright,
  set `TEMP`/`TMP` to `E:\webdev\.tmp`.
- Chrome for screenshots: `C:/Program Files (x86)/Google/Chrome/Application/chrome.exe`.

### Gotchas that already cost time

1. **Never run `npm run build` while `npm run dev` is running.** They share
   `.next/`; the build wipes the dev output and pages render with no CSS. Stop
   dev, build, then restart dev.
2. **The fixed rail must not swallow clicks.** Its box is wider than its links
   (the role line), so `<aside>` has `pointer-events-none` and each link has
   `pointer-events-auto`. Any new fixed overlay near the copy column must follow
   the same rule. Check with `document.elementFromPoint`.
3. **Test-harness artifacts, not bugs.** In a hidden or background browser pane,
   `document.hidden` is true: lazy images don't load, and programmatic
   `el.focus()` fires no focus events. A synthetic `mouseover` whose
   `relatedTarget` is a React-managed node is ignored by React. Verify hovers
   with a real pointer move plus `elementFromPoint`.
4. **React Compiler lint rules are on.** `react-hooks/set-state-in-effect` flags
   setState in effect bodies (use `useSyncExternalStore`, derived state, or a
   justified disable for data fetches). A `useCallback` that references itself
   triggers "Cannot access variable before it is declared"; use a hoisted inner
   `function step() {}`.
5. **ESLint flat config has no Node globals.** Node scripts need
   `/* global process, console */`.
6. **Hard-coded dark surfaces break in dark mode.** Dark mode flips the token
   ramps, so a hard-coded dark surface (glow cards, screenshots) must use
   literal colours (`text-white`), never `text-n50`.
7. `@next/next/*` ESLint rules are **not configured**. Don't add disable comments
   for them; the unknown rule name is itself an error.

---

## 2. Design system and conventions (keep these)

### Tokens (`app/globals.css`)

- Neutral ramp `--neutral-50…950` → Tailwind `n50…n950`. Page `n50` (#f9faf9),
  plate/panel `n100`, borders `n200`, rules/dots `n300`, labels `n400`, muted
  `n500`, row names `n600`, ink `n900` (#1a1b18).
- Primary ramp `--primary-50…950` → `p50…p950`. Accent dot `p400` (#5ca59a).
- Dark theme: `[data-theme="dark"]` redefines **both ramps end-for-end**, so
  components never need `dark:` variants. The theme is set before paint by an
  inline script in `app/layout.tsx`.
- `--panel-shadow: 2px 4px 2px rgba(0,0,0,.04)`, `--ease-out: cubic-bezier(.22,1,.36,1)`,
  `--geist-features: "ss04" 1, "kern" 1, "liga" 1, "calt" 1`.

### Grid (measured from the reference, don't change)

- `--grid-margin: 40px`, `--grid-gap: 20px`, `--grid-column-locked: 118px`,
  `--grid-template: repeat(4, 118px) repeat(6, minmax(0, 1fr))`, and
  `--grid-split-x = 592px`.
- `.page-grid`: rows `32px 1fr`, row-gap `100px`, padding `40px`. The first
  content line sits at **y = 172**.
- `.page-copy` spans columns 2–4 (394 wide, content 374). `.page-media` spans
  columns 5–10 with `padding-left: 60px`.
- `.site-right-plate`: fixed from `--grid-split-x` to the right edge, `n100`
  fill, `1px dashed n200` left border, `z-index: 0`. Page content sits at
  `z-index: 1`.
- Breakpoints: **1049px** (rail → mobile bar and drawer, page → single column),
  **767px** (phone padding), **1439px** (mosaic rows collapse to one column).

### Type (current, after the owner asked for slightly larger text)

- Home h1: 28/1.3/700/−0.02em.
- Body: 15/23.
- Nav links: 14/21/500; nav labels 13/19.5.
- `.rule-row-name` and `.rule-row-tags`: 14px.
- `PageHeading`: 20/26 title, 14.5/22 standfirst. `BackCrumb`: 14px.

### Reusable pieces

- `.rule-row`, `.rule-row-name`, `.rule-row-line`, `.rule-row-tags`: list rows
  with a hover plate. The draw-in keyframes (`row-name-in`, `row-draw`,
  `row-tags-in`) are staggered with `--row-start`.
- `.reveal-heading` and `.reveal-line` entrances (`reveal-up` keyframes).
- `.site-panel`, used for floating cards on Craft.
- `.dot-field`, the 18px dot grid.
- `.gradient-text`, the animated green sweep with a dark-mode variant.
- `useSound().play("hover" | "click")` on interactive elements. Sound is off by
  default.

### Rules the owner has approved and still expects

- **Do not change the overall page structure.** Add inside the existing layout.
- **No fabricated claims:** no invented metrics, testimonials, clients or
  favourites. Sample data must say it is sample data.
- Every new motion must respect `prefers-reduced-motion`.
- Every new interaction must work with a keyboard, or have an accessible
  equivalent.
- Every new surface must look right in light and dark themes, at 1608×862
  (reference size) and at 375×812.

---

## 3. Configuration strategy ("proper configuration")

Use three layers. Implement the first two for every feature; the third is
recommended.

### 3.1 Typed defaults in code: `content/config.ts` (new)

One exported object with every tunable value from the feature specs below,
fully typed, with comments. Components import from here and never hard-code
magic numbers.

```ts
// content/config.ts
export const siteConfig = {
  home: {
    marquee: {
      enabled: true,
      direction: "down" as "down" | "up", // "down" = cards travel top → bottom (the owner's words); confirm (§12)
      speedPxPerSec: 28,
      pauseOnHover: true,
      hoverSpeedFactor: 0,                // 0 = pause; 0.25 = slow crawl
      edgeFadePx: 48,
      wheelScrub: true,
      minTrackViewports: 2,               // repeat content until track ≥ 2× viewport
    },
  },
  works: {
    ring: {
      tiltDeg: 23, spanCqw: 78, spanCqh: 96,
      tileMinPx: 112, tileMaxPx: 380, tileAspect: 0.68,
      frontScale: 2.9, focusMaxCqw: 72, perspectiveFactor: 4.1,
      frontMs: 480, returnMs: 340, fadeMs: 320,
      idleDegPerSec: 6, releaseDelayMs: 150, maxItems: 24,
      dragDegPerPx: 0.25, inertiaFriction: 0.94,
    },
  },
  about: {
    scene: {
      gravity: -30, dprMax: 1.5, shadowOpacity: 0.15,
      dropInOnLoad: true, infoDelayMs: 250, maxObjects: 24,
    },
  },
  writings: {
    list: { rowMeta: "number" as "number" | "date", previewFadeMs: 200, idleIllustrationUrl: null as string | null },
    article: { bannerHeight: 350, bannerMaxWidth: 550, spreadTopPx: 252, tocTopPx: 120, tocMaxWidth: 180, tocDepth: 2 },
  },
  craft: {
    board: {
      columns: 4, tileWidth: 350, gap: 40, padding: 40, patternScale: 1.2,
      minVisibility: 0.35, focusRect: 0.6, scaleMin: 0.9,
      opacityMs: 350, transformMs: 450, hoverDelayMs: 600,
      clickAction: "lightbox" as "lightbox" | "link",
      friction: 0.94, wheelSpeed: 1, idleDriftPxPerSec: 0,
      initialPan: { x: -200, y: -80 },
    },
  },
} as const;
```

### 3.2 Content in Supabase, edited in `/studio`

Projects, interests, writing previews, covers and craft metadata live in
tables (§4), each with a studio editor. Keep the existing static fallbacks
(`content/projects.ts` and the others) so the site still renders with no
backend. `lib/content.ts` already shows the pattern.

### 3.3 Runtime overrides (recommended): `site_settings` table

A `site_settings(key text primary key, value jsonb)` table holds overrides for
§3.1, keyed by path (`"craft.board"`). Merge it server-side over the defaults,
validate with `zod` (reject unknown keys and out-of-range numbers), and expose a
**Settings** tab in `/studio` with sliders and toggles. The page still works if
the table is empty.

### 3.4 Uploads: switch to Supabase Storage

Filebase has no credentials, so `/api/uploads` returns 501 today. Every feature
here needs uploads (covers, previews, textures, models, craft captures).
Recommended: create a public `media` bucket in Supabase Storage with owner-only
writes (SQL in §4.6), then add `lib/upload.ts`, which uploads with the signed-in
browser client and returns the public URL. Keep the Filebase route as an option,
but don't depend on it. If you use `next/image` on storage URLs, add the project
host to `images.remotePatterns` in `next.config`.

---

## 4. Database migrations (apply with the Supabase MCP, then run advisors)

Apply these as named migrations, in order. Also append them to
`supabase/schema.sql` so a fresh project can be recreated. Every table follows
the RLS pattern from §1.

### 4.1 `projects` (features 1 and 2; replaces static `content/projects.ts` as the source)

```sql
create table if not exists public.projects (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  subtitle        text,
  description     text,
  tags            text[] not null default '{}',
  kind            text not null default 'project' check (kind in ('project', 'experience')),
  live_url        text,
  repo_url        text,
  image_url       text,
  image_position  text not null default 'center top',
  glow            text,
  show_on_home    boolean not null default true,
  show_on_works   boolean not null default true,
  home_layout     text check (home_layout in ('full', 'pair', 'aside', 'aside-flipped')),
  sort            integer not null default 0,
  published       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.projects enable row level security;
create policy "read published projects" on public.projects for select
  using (published = true or (select public.is_site_owner()));
create policy "owner inserts projects" on public.projects for insert to authenticated
  with check ((select public.is_site_owner()));
create policy "owner updates projects" on public.projects for update to authenticated
  using ((select public.is_site_owner())) with check ((select public.is_site_owner()));
create policy "owner deletes projects" on public.projects for delete to authenticated
  using ((select public.is_site_owner()));
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();
```

Seed it from `content/projects.ts` (9 projects) plus the Konnectify experience
(`kind = 'experience'`, no link, no image). Screenshots already exist at
`/work/*.webp`.

### 4.2 `interests` (feature 3)

```sql
create table if not exists public.interests (
  id           uuid primary key default gen_random_uuid(),
  category     text not null check (category in ('movie', 'anime', 'football', 'game', 'travel', 'music', 'other')),
  title        text not null,
  subtitle     text,
  note         text,
  link_url     text,
  texture_url  text,          -- poster / cover / photo applied to a card, book or polaroid
  model_url    text,          -- optional .glb for object_type = 'model'
  object_type  text not null default 'card'
               check (object_type in ('card', 'book', 'ball', 'controller', 'polaroid', 'model')),
  action       text not null default 'info'
               check (action in ('info', 'flip', 'kick', 'open', 'spin', 'link')),
  scale        real not null default 1,
  pos_x        real,
  pos_z        real,
  rot_y        real,
  credit       text,          -- attribution line the asset's licence requires
  licence      text,          -- e.g. 'CC0', 'CC-BY 4.0', 'TMDB non-commercial'
  sort         integer not null default 0,
  published    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
-- same four RLS policies + touch trigger as projects
```

### 4.3 `writings` additions (features 4 and 5)

```sql
alter table public.writings
  add column if not exists preview_image_url text,
  add column if not exists preview_kind text not null default 'image'
    check (preview_kind in ('image', 'illustration')),
  add column if not exists cover_image_url text,
  add column if not exists cover_alt text,
  add column if not exists cover_height integer not null default 350,
  add column if not exists toc_enabled boolean not null default true,
  add column if not exists toc_depth smallint not null default 2 check (toc_depth between 2 and 3),
  add column if not exists reading_minutes smallint,
  add column if not exists seo_description text;
```

### 4.4 `craft_items` additions (feature 6)

```sql
alter table public.craft_items
  add column if not exists description text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists year smallint,
  add column if not exists source_url text,   -- href stays the live demo
  add column if not exists aspect real,       -- width / height; derived from the capture if null
  add column if not exists sort integer not null default 0;
```

The existing `x, y, w, h` columns stay, but the infinite board lays tiles out
automatically (§10). Keep them only for an optional "manual layout" mode.

### 4.5 `site_settings` (§3.3)

```sql
create table if not exists public.site_settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);
alter table public.site_settings enable row level security;
create policy "settings are public" on public.site_settings for select using (true);
create policy "owner inserts settings" on public.site_settings for insert to authenticated
  with check ((select public.is_site_owner()));
create policy "owner updates settings" on public.site_settings for update to authenticated
  using ((select public.is_site_owner())) with check ((select public.is_site_owner()));
create policy "owner deletes settings" on public.site_settings for delete to authenticated
  using ((select public.is_site_owner()));
```

### 4.6 Storage bucket `media` (§3.4)

```sql
insert into storage.buckets (id, name, public) values ('media', 'media', true)
  on conflict (id) do nothing;
create policy "media is public" on storage.objects for select using (bucket_id = 'media');
create policy "owner uploads media" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (select public.is_site_owner()));
create policy "owner updates media" on storage.objects for update to authenticated
  using (bucket_id = 'media' and (select public.is_site_owner()));
create policy "owner deletes media" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (select public.is_site_owner()));
```

After each migration:
1. `get_advisors` (security and performance).
2. Update `lib/supabase/types.ts`, or generate types with the MCP's
   `generate_typescript_types`.
3. Prove RLS with curl and the publishable key: reads return 200; inserts are
   refused with `42501`.

---

## 5. Feature 1: Home, the infinite auto-scrolling works column

### Goal
The right-hand works column on `/` moves on its own, forever, repeating the
works, at a calm pace. The left copy column stays put.

### Current implementation
`app/page.tsx` renders `.mosaic` inside `.page-media` with 5 hand-written rows
(`is-aside is-flipped`, `is-pair`, …) of `WorkCard`s. The document scrolls
normally, so the copy column scrolls away with it.

### Implementation plan
1. **Move the layout into data.** Build `homeMosaic` from `projects` (§4.1,
   ordered by `sort`, filtered by `show_on_home`) and `home_layout`, with
   `content/projects.ts` as the fallback. Row types: `full`, `pair`, `aside`
   (7fr/3fr), `aside-flipped` (3fr/7fr). A 3fr (narrow) cell should prefer a
   glow card; a wide cell should prefer a screenshot.
2. **Add `components/home/InfiniteMosaic.tsx` (client).**
   - Desktop (≥1050px): `.page-media` becomes a fixed-height viewport
     (`height: 100dvh`, `overflow: hidden`, `margin-top: -40px` like the other
     reference right panels), with a CSS mask fade of `edgeFadePx` at the top
     and bottom. Leave the page itself unscrolled; the copy column is short
     enough.
   - Render a **track** containing the row list **twice**: set A, plus a clone
     with `aria-hidden="true"`, `inert`, and `tabIndex={-1}` on its links. If set
     A is shorter than `minTrackViewports × viewport height`, repeat it until
     it isn't.
   - Animate with **rAF**, not CSS keyframes, so speed stays in px/s whatever
     the content height: `offset += speed * dt * factor`, applied as
     `transform: translate3d(0, y, 0)`. For `direction: "up"`, y goes 0 → −H
     then wraps to 0. For `"down"`, y goes −H → 0 then wraps to −H, where H is
     the measured height of set A plus one row gap. The wrap must be seamless:
     no visible jump.
   - Measure H with a `ResizeObserver` on set A. Card heights are fixed on
     desktop (`h-[345px]`) and use `aspect-ratio` below 1440px.
   - Hover over the column: ease the speed to `hoverSpeedFactor` (default 0 =
     pause) over about 300ms, then ease back.
   - `wheelScrub`: wheel and trackpad input adds to the offset (clamped
     velocity), so visitors can scrub while it runs. Touch drag does the same.
   - Keyboard focus inside the column pauses it and brings the focused card
     fully into view.
   - Pause when `document.hidden` or when the column is off-screen
     (IntersectionObserver).
   - `prefers-reduced-motion`: no auto-scroll. Render set A once and let the
     column scroll natively (`overflow-y: auto`).
   - Below 1050px: no auto-scroll; keep the current stacked list.
3. Keep `WorkCard` as is; only the container changes. Links must stay
   clickable while the track moves (only `transform` changes).

### Config
`siteConfig.home.marquee` (§3.1). Optional override via `site_settings`
`home.marquee`.

### Studio
In a **Projects** tab (shared with feature 2):
- Create, edit and delete projects.
- Upload screenshots.
- Choose `home_layout`, toggle `show_on_home`, and drag to reorder (`sort`).

### Acceptance criteria
- [ ] The column moves continuously in the configured direction at
  `speedPxPerSec`, at the same speed on 60Hz and 120Hz displays.
- [ ] The loop is seamless, with no jump at the wrap, including after a window
  resize.
- [ ] Hover pauses (or slows) smoothly; leaving resumes.
- [ ] Wheel/trackpad scrubbing works and the loop continues afterwards.
- [ ] Clones are not reachable by keyboard or screen reader. Tab order visits
  each real card once.
- [ ] Reduced motion leaves a static, natively scrollable column.
- [ ] Mobile layout is unchanged.
- [ ] Light and dark themes both look right; no CLS; no console errors.

---

## 6. Feature 2: Works, the 3D ring carousel with zoom focus

### Goal
The right side of `/works` becomes a slowly rotating ring of work images,
viewed from slightly above (pic 1). Hovering or focusing a row in the list, or
clicking a card, rotates the ring so that work faces front and **zooms it**:
larger, flat to the viewer, the others fading. It must scale to **any number of
images**.

### Reference behaviour (ref, rmoon.me `/works`, component `works-ring-*`)
```css
.works-ring-stage {
  container-type: size;
  --ring-span: min(78cqw, 96cqh);
  --ring-tile-w: clamp(112px, calc(var(--ring-span) * var(--ring-sin)), 380px);
  --ring-tile-h: calc(var(--ring-tile-w) * .68);
  --ring-tilt: 23deg;
  --ring-radius: calc(var(--ring-tile-w) / (2 * var(--ring-sin)));
  --ring-step: calc(360deg / var(--ring-count));
  --ring-front-scale: 2.9;
  --ring-focus-w: min(72cqw, calc(var(--ring-tile-w) * var(--ring-front-scale)));
  --ring-focus-h: calc(var(--ring-focus-w) * .68);
  --ring-front-z: var(--ring-radius);
  --ring-front-ms: .48s; --ring-return-ms: .34s;
  --ring-front-ease: cubic-bezier(.4, 0, .2, 1);
  display: grid; place-items: center; position: relative;
}
.works-ring-lens { display: grid; place-items: center; width: 100%; height: 100%;
  perspective: calc(var(--ring-radius) * 4.1); perspective-origin: 50% 50%; }
.works-ring { width: 0; height: 0; position: relative; transform-style: preserve-3d;
  transform: rotateX(var(--ring-tilt)) rotateY(var(--ring-spin, 0deg)); }
.works-ring-card { position: absolute; left: 0; top: 0; translate: -50% -50%;
  width: var(--ring-tile-w); height: var(--ring-tile-h); pointer-events: none;
  transform-style: preserve-3d;
  transform: rotateY(calc(var(--i) * var(--ring-step))) rotateX(0) translateZ(var(--ring-radius)) scale(1);
  transition: transform var(--ring-return-ms) var(--ring-front-ease),
              width var(--ring-return-ms) var(--ring-front-ease),
              height var(--ring-return-ms) var(--ring-front-ease), opacity .32s ease; }
.works-ring-card.is-front { width: var(--ring-focus-w); height: auto; pointer-events: auto;
  transform-style: flat; transition-duration: var(--ring-front-ms), var(--ring-front-ms), var(--ring-front-ms), .32s;
  transform: rotateY(calc(var(--i) * var(--ring-step))) rotateX(calc(var(--ring-tilt) * -1)) translateZ(var(--ring-front-z)) scale(1); }
.works-ring-card.is-back .work-media-row { transform: scaleX(-1); }   /* back-facing cards read correctly */
.works-ring-stage.has-focus .works-ring-card { opacity: 0; pointer-events: none; }
.works-ring-stage.has-focus .works-ring-card.is-front { opacity: 1; pointer-events: auto; }
/* entrance: faces fade in .72s, staggered calc(.35s + var(--i) * .06s) */
/* reduced motion: .works-ring-card { transition: transform 1ms, opacity .2s ease } */
```
JavaScript (ref):
- The stage sets `--ring-count = n` and `--ring-sin = sin(π / n)` (5 decimals).
- `--ring-spin` is written from rAF.
- On every spin update, toggle `.is-back` on card `i` when
  `cos((spin + i * 360/n) * π/180) < 0`.
- Focusing a card sets `.is-front` on it and `.has-focus` on the stage.

The geometry is the key to "scales to n": each tile's width is the chord of the
ring (`span × sin(π/n)`), and the radius is `tileW / (2 sin(π/n))`, so tiles
always meet edge to edge. More images automatically means smaller tiles, clamped
between 112 and 380px.

### Current implementation
`components/works/WorksList.tsx`:
- Rows drive `activeId` on mouseenter and focus.
- A fixed viewer panel shows the active project's screenshot (`next/image`) or a
  glow title card, with a caption.
- Entries come from `app/works/page.tsx`: Konnectify plus `content/projects.ts`.

### Implementation plan
1. **Add `components/works/WorksRing.tsx` (client).**
   - Props: `items: { id, title, image?, glow, href? }[]`,
     `focusId: string | null`, `onCardClick(id)`, `config`.
   - Replace the fixed viewer in `WorksList` with the ring, placed in the right
     plate using the reference's `.works-preview` geometry: `grid-column: 5/-1`,
     `grid-row: 1/3`, `height: 100dvh`, `margin-top: -40px`,
     `margin-right: calc(var(--grid-margin) * -1)`, `padding: 20px`.
   - Port the CSS above, with values from `siteConfig.works.ring` written as
     inline custom properties on the stage.
2. **Spin state machine** (rAF, imperative `style.setProperty("--ring-spin")`,
   no React re-render per frame):
   - `idle`: `spin += idleDegPerSec * dt`.
   - `dragging`: pointer drag on the stage rotates it (`dragDegPerPx`). On
     release, inertia (`inertiaFriction`), then back to idle.
   - `focusing(i)`: `target = -i * step`, normalised to the **shortest** angular
     delta from the current spin. Ease there over `frontMs`, then add
     `.is-front` and `.has-focus`.
   - `releasing`: after `releaseDelayMs` with no row hovered or focused, remove
     the classes (cards return over `returnMs`), then resume idle.
   - Moving the pointer from row to row inside the list must not flash through
     `releasing`; that is what the delay is for.
3. **Scaling to n**:
   - n = 0: render nothing.
   - n = 1: a single centred card, no ring.
   - n = 2: two cards back to back, flipping 180°.
   - n ≥ 3: the full ring.
   - n > `maxItems`: show the `maxItems` nearest the current focus in a window,
     or split into two tilted rings. Document whichever you choose.
   - Tile images: `next/image` with small `sizes` (≈ 380px). The focused card
     swaps to a large `sizes` (≈ 70vw) so the zoom is sharp. Preload the focused
     image on row hover.
   - Projects without a screenshot render the existing glow title card as their
     face.
4. **Interaction mapping**:
   - Hover or keyboard-focus a row → `focusing(i)`.
   - Click a non-front card → `focusing(i)`.
   - Click the front card → open `live_url` or `repo_url` in a new tab (no link
     for experience entries).
   - `Escape` → release.
   - Play `useSound().play("hover")` on focus and `play("click")` on open.
5. **Accessibility**: the ring is a visual duplicate of the list, so give the
   stage `aria-hidden="true"` and keep the rows as the real controls. Rows keep
   their `href` and focus styles.
6. **Reduced motion**: no idle spin, no drag inertia. Focusing jumps the spin
   and crossfades (the reference's 1ms transform transition).
7. **Mobile (<1050px)**, matching the reference's `.works-preview.is-rail`:
   - A horizontal scroll-snap rail under the list.
   - `--rail-slide: min(72vw, 340px)`; each slide is `height: var(--rail-slide)`,
     `min-width: calc(var(--rail-slide) * 1.6)`.
   - `border-top: 1px dashed n200`, `bg n100`.
   - No 3D.

### Data and studio
- Read from `projects` (§4.1) with `show_on_works`, ordered by `sort`. Fall back
  to `content/projects.ts`.
- The Projects studio tab (shared with feature 1) controls the image, focal
  point (`image_position`), links, tags, order and visibility.

### Acceptance criteria
- [ ] Idle ring rotates slowly, tilted 23°, tiles edge to edge.
- [ ] Row hover or focus rotates the shortest way; the card comes forward, flat,
  about 2.9× larger (capped at 72cqw); others fade out.
- [ ] Moving between rows retargets without flicker; leaving the list returns
  the ring and resumes idle.
- [ ] Clicking the front card opens the project; clicking another card focuses
  it; `Escape` releases.
- [ ] Verified at n = 1, 2, 3, 8, 20 and 40: no overlap glitches, tiles clamp,
  performance holds (only transform/opacity animate).
- [ ] Back-facing media is not mirrored.
- [ ] Reduced motion honoured; mobile rail works with touch and snap.
- [ ] Light and dark themes both look right; the dashed plate border stays
  visible.

---

## 7. Feature 3: About, the interactive interests scene

### Goal
Fill the empty right side of `/about` (pic 2 shows the reference: a top-down
physics "desk" of real objects) with the **owner's own favourites**: movies,
anime, football, games, travel, and so on. Every object must be interactive.
Assets come from the internet, **with licences respected** (§11).

### Reference behaviour (ref, rmoon.me `/about`)
- Container `.about-scene`: `grid-column: 5/-1; grid-row: 1/3; height: 100dvh;
  margin-top: -40px; margin-right: calc(var(--grid-margin) * -1); overflow:
  hidden; position: relative`. Mobile: `grid-column: 1/-1; height: 340px`.
- Rendering: **three.js** (`WebGLRenderer`, `PerspectiveCamera`, `GLTFLoader`)
  with a **cannon** physics world:
  - `gravity (0, -30, 0)`, `allowSleep = true`, `solver.iterations = 6`.
  - Materials `prop`, `surface` and `ball`; ball contact `restitution .78,
    friction .3`; ball against prop `restitution .55`.
  - Ground is a `ShadowMaterial({ opacity: .15 })` plane, plus invisible walls.
  - Models are loaded as `/models/<name>/scene.gltf`: airpods, coffee-cup,
    gamecube, photo-frame, plant, white-photo-frame. Primitives: dice
    (icosahedrons), a tennis ball (sphere), and books/CDs as textured boxes.
- Each object is `{ group, body, dragHeight, tap }`:
  - Drag lifts it to `dragHeight` and follows the pointer.
  - Release throws it with the pointer's velocity.
  - Tap runs a per-object action (e.g. `toggleOpen` lifts and opens the
    AirPods case; random spin impulses).
- A **Reset** button, `.about-reset`, sits bottom-left of the scene: `left: 20px;
  bottom: 20px; 13px/500; color n400 → n600 on hover`. It calls
  `scene.reset()`.

### Implementation plan
1. **Dependencies**: `three`, `@react-three/fiber` (v9, React 19),
   `@react-three/drei` (useGLTF, useTexture, Html, ContactShadows), and a physics
   engine: `@react-three/rapier` (recommended) or `cannon-es` (mirrors the
   reference). Load the scene with `next/dynamic(() => import(...), { ssr: false })`
   and only when the plate is visible.
2. **Add `components/about/InterestsScene.tsx`**, placed in `.page-media` using
   the reference `.about-scene` geometry (keep the copy column as it is).
3. **Camera and lighting**: a near top-down perspective camera with a narrow FOV
   looking at a "desk". One key light casts soft shadows, plus ambient. The
   ground uses a shadow-only material, so the plate colour (`n100`) shows
   through in both themes.
4. **Object types**, driven by `interests.object_type` (§4.2):
   - `card`: a thin box textured with a poster, key art or photo (movies,
     anime).
   - `book`: a textured box with a spine (manga volumes, travel journal).
   - `ball`: a bouncy sphere (football), using the ball physics material.
   - `controller`: a `.glb` controller model (games).
   - `polaroid`: a thin box with a white border and a photo (travel). Use the
     owner's own photos.
   - `model`: any `.glb` from `model_url` (film clapper, headphones, passport,
     globe, …).
5. **Interactions**, all with mouse and touch:
   - Hover: raise and highlight the object (emissive or outline), show a pointer
     cursor, and after `infoDelayMs` show an `Html` info card (title, subtitle,
     note, link).
   - Drag: lift to `dragHeight`, follow the pointer; release throws with the
     pointer's velocity.
   - Tap, per `action`:
     - `flip`: flip the card to show its back (note/details).
     - `kick`: an upward and forward impulse (football).
     - `open`: open a lid or cover.
     - `spin`: a random angular impulse.
     - `link`: open `link_url`.
     - `info`: pin the info card.
   - **Reset** button (reference styling) restores the initial layout.
   - `dropInOnLoad`: objects fall onto the desk with a small stagger on first
     view.
6. **Accessibility**: a canvas is opaque to assistive technology, so render a
   visually hidden (or small, styled) list of the same interests with their
   notes and links. Keyboard users can Tab through that list; focusing an item
   highlights the matching object.
7. **Performance**:
   - `dpr` capped at `dprMax`; compress `.glb` files with meshopt or draco (e.g.
     `gltf-transform`); keep total scene assets under about 8 MB.
   - `frameloop="demand"` once all bodies sleep; pause when `document.hidden`.
   - Dispose geometries and textures on unmount.
8. **Reduced motion**: no drop-in, no idle motion. Drag still works.
9. **Fallback** when WebGL is unavailable: a static collage of the same items as
   tilted CSS cards (reuse the current fact-card styling).
10. **Content**: the interests are **personal**. Ask the owner for the real list
    (§12). Do not invent favourites. The education fact cards currently on the
    page can become objects too (e.g. a certificate card), or stay in the copy
    column.

### Studio
Add an **Interests** tab:
- Create, edit and delete interests.
- Upload textures, photos and `.glb` models to the `media` bucket.
- Pick category, object type and action; set scale.
- Store **credit and licence** per asset (required for anything not CC0).
- Reorder and publish.
- Optional: an "arrange" mode that saves each object's resting `pos_x`, `pos_z`
  and `rot_y` as its reset layout.

### Acceptance criteria
- [ ] The right side of `/about` is filled at 1608×862; the copy column is
  unchanged.
- [ ] At least 8 objects covering movies, anime, football, games and travel, all
  from the owner's real list.
- [ ] Drag, throw, tap actions, the hover info card and Reset all work, with
  mouse and touch.
- [ ] Holds 60fps on a mid-range laptop, no console errors, WebGL resources
  disposed on navigation.
- [ ] Reduced motion honoured; WebGL fallback renders.
- [ ] Mobile scene is 340px tall.
- [ ] Every non-CC0 asset shows its credit; the TMDB notice appears if TMDB
  images are used (§11).
- [ ] The owner can add or edit interests in `/studio`, and the scene reflects
  them within one minute (revalidate).

---

## 8. Feature 4: Writings list, the per-post hover preview

### Goal
On `/writings`, hovering (or focusing) a post row shows that post's own image or
illustration on the right (pic 3), set per post in `/studio`.

### Reference behaviour (ref)
```css
.writings-preview { grid-column: 5/-1; grid-row: 1/3; height: 100dvh; margin-top: -40px;
  margin-right: calc(var(--grid-margin) * -1); padding: 20px; display: flex; flex-direction: column;
  align-items: center; justify-content: center; overflow-y: auto; pointer-events: none; }  /* aria-hidden + inert */
.writings-preview-img { width: 100%; height: auto; border-radius: 4px; display: block; }
.writings-preview-illustration { width: auto; height: auto; max-width: min(100%, 560px); display: block; }
.writings-preview-fade-enter-active, .writings-preview-fade-leave-active { transition: opacity .2s ease; }
.writings-preview-fade-enter-from, .writings-preview-fade-leave-to { opacity: 0; }   /* mode: out-in */
.writings-row { transform: translate(0); transition: transform .15s ease; }
.writings-row:hover { transform: translate(2px); }
.writings-row:hover::before { background-color: var(--neutral-100); }
.writings-row-number { color: var(--neutral-400); font-size: 13px; }              /* "002", "001" */
/* mobile: .writings-preview { display: none } */
```
- Each post has either `image` or `illustration` (a line-art SVG).
- A background ambient animation on the page is paused while a preview is
  visible.
- The right plate uses the same dashed `n100` treatment.

### Current implementation
`app/writings/page.tsx` is a server component rendering `.rule-row` links with
dates. There is no media side.

### Implementation plan
1. Migration §4.3 (`preview_image_url`, `preview_kind`).
2. **Add `components/writings/WritingsList.tsx` (client).** It receives rows
   from the server page and renders the reference preview panel. Hover or focus
   sets `activeId`, and an out-in 200ms crossfade swaps the image (key on id).
   Use `aria-hidden` plus `inert` on the panel.
3. **Row meta**, per `siteConfig.writings.list.rowMeta`:
   - `"number"`: a zero-padded index by publish order, oldest = `001`, newest
     first (the reference style).
   - `"date"`: the current behaviour.
4. **Idle state** (nothing hovered): show `idleIllustrationUrl` if set,
   otherwise nothing.
5. **Illustrations**: render uploaded SVGs **only via `<img src>`**, never
   inline. `<img>` cannot run scripts inside the SVG.
6. **Preload** each post's preview on list mount (small), or on first row hover,
   so the swap is instant.
7. Below 1050px: no preview (reference).

### Studio
In `WritingsEditor`, add a **Preview** section:
- Upload an image or an SVG illustration to the `media` bucket.
- Choose `preview_kind`.
- Show a thumbnail and a "Remove" button.

### Acceptance criteria
- [ ] Hovering or focusing each row shows that post's image or illustration
  with a 200ms out-in fade; moving between rows swaps cleanly.
- [ ] Posts without a preview show the idle state and don't crash.
- [ ] Rows keep the hover plate and 2px nudge; numbering follows config.
- [ ] Previews are editable in `/studio` and appear within a minute.
- [ ] Hidden on mobile; light and dark themes both look right.

---

## 9. Feature 5: Rich Markdown articles, hero and quick-nav TOC

### Goal
Posts stay **pure Markdown**, but render richly: a hero image ("image lander"),
figures, callouts, galleries, code, tables, hover-image highlights, and a sticky
**"On this page"** nav on the right with active-section tracking (pic 4).

### Reference behaviour (ref, `/writings/portfolio-update`)
```css
.writing-banner { grid-column: 1/-1; grid-row: 1/3; justify-self: center; align-self: start;
  width: 100%; max-width: 550px; height: 350px; margin-top: -40px; overflow: hidden; pointer-events: none; z-index: 1;
  mask-image: linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent); }
  /* the ref paints a shader here, with a vertical mask:
     linear-gradient(180deg, #000 0, #000 60%, rgba(0,0,0,.8) 75%, rgba(0,0,0,.4) 85%, transparent) */
.writing-spread { grid-column: 1/-1; grid-row: 2; display: grid; grid-template-columns: 1fr minmax(0, 550px) 1fr;
  margin-top: 252px; padding-bottom: 80px; position: relative; z-index: 2; }
.writing-spread.has-toc .writing-toc { grid-column: 3; grid-row: 1; position: sticky; top: 120px; align-self: start;
  justify-self: start; display: flex; flex-direction: column; gap: 8px; max-width: 180px; width: 100%;
  margin-left: calc(var(--grid-column-locked) + var(--grid-gap)); margin-right: 12px; }
.writing-toc-label { color: var(--neutral-400); font-size: 12px; font-weight: 500; letter-spacing: -.01em; }
.writing-toc-list { display: flex; flex-direction: column; gap: 6px; list-style: none; }
.writing-toc-link { color: var(--neutral-400); font-size: 13px; font-weight: 500; line-height: 1.35;
  transition: color .15s ease, transform .15s ease; }
.writing-toc-link:hover { color: var(--neutral-700); transform: translate(-2px); }
.writing-toc-link.is-active { color: var(--neutral-900); }
.writing-article { grid-column: 2; display: flex; flex-direction: column; gap: 19px; }
.writing-title { font-size: 32px; font-weight: 600; letter-spacing: -.01em; }
.writing-prose { color: var(--neutral-700); display: flex; flex-direction: column; gap: 1.5em; }
.writing-prose p { font-size: 15px; line-height: 1.5; text-wrap: pretty; }
.writing-prose h2 { color: var(--neutral-600); font-size: 22px; font-weight: 600; margin: 24px 0 0; scroll-margin-top: 100px; }
.writing-figure { margin-inline: -10%; width: 120%; border: 1px solid rgba(0,0,0,.1); border-radius: 8px; overflow: hidden; }
.writing-prose .writing-figure-media { background-color: var(--neutral-100); padding: 8px; }
.writing-prose .writing-figure-media img, video { border-radius: 4px; width: 100%; height: auto; }
.writing-pagination { display: flex; justify-content: space-between; gap: 20px; margin-top: 40px; }
  /* prev/next: label 13px n400; title 15px/600 n700 → n950; hover nudge ±2px */
/* ≤1049px: banner max-width 85vw, spread single column 85vw */
/* ≤767px: banner 180px tall, no negative margins, title 24px, figures full width, TOC hidden */
```
The reference also has an inline **HighlightProse** element: a highlighted
phrase with a small logo whose hover shows an image popover up to 280px wide,
positioned 10px above the cursor and clamped to the viewport.

### Current implementation
- `app/writings/[slug]/page.tsx` uses `SplitPage` (meta on the left, body on the
  right).
- `lib/markdown.tsx` is a small hand-rolled renderer: `#`/`##`/`###`, paragraphs,
  `-`/`1.` lists, `>` quotes, fenced code, bold/italic/code/links (http, mailto
  and relative only). No images, tables, anchors or TOC.

### Implementation plan
1. Migration §4.3 (`cover_*`, `toc_*`, `reading_minutes`, `seo_description`).
2. **Replace the renderer** with a unified pipeline on the server
   (`lib/markdown/`):
   - `remark-parse` → `remark-gfm` (tables, task lists, strikethrough,
     footnotes, autolinks) → `remark-directive` plus a custom plugin → 
     `remark-rehype` (**no raw HTML**; `allowDangerousHtml: false`) →
     `rehype-slug` → `rehype-autolink-headings` → `rehype-pretty-code` (shiki,
     with light and dark themes mapped to the tokens) → React via
     `hast-util-to-jsx-runtime` (or `react-markdown` with the same plugins).
   - Collect a heading outline for the TOC during the transform (h2, plus h3
     when `toc_depth = 3`), slugged with the same `github-slugger` algorithm
     `rehype-slug` uses.
   - URL policy: keep `http(s)`, `mailto` and relative links; external links get
     `rel="noreferrer noopener"`; drop `javascript:` and `data:`. Images come
     only from the `media` bucket, `/public`, or `https:`.
   - `reading_minutes` = words / 220, computed on save and stored.
3. **Supported directives** (document these in `/studio` as a cheat sheet):
   ```md
   :::note / :::tip / :::warning
   Callout body in **Markdown**.
   :::

   ::figure{src="https://…/shot.webp" alt="Dashboard" caption="The queue view" bleed="true"}

   :::gallery{columns="2"}
   ![One](https://…/a.webp)
   ![Two](https://…/b.webp)
   :::

   ::video{src="https://…/clip.mp4" poster="https://…/poster.webp" autoplay="true" loop="true"}

   ::embed{provider="youtube" id="dQw4w9WgXcQ"}

   :highlight[Supabase]{image="https://…/preview.webp" logo="https://…/logo.svg" link="https://supabase.com"}
   ```
   - Plain `![alt](src "caption")` renders as a figure.
   - `bleed="true"` applies the reference `margin-inline: -10%; width: 120%`.
   - `embed` allow-lists providers (youtube, vimeo) and builds the iframe URL
     itself. Never pass a raw URL through.
4. **Frontmatter**, so posts stay portable Markdown:
   - Studio "Import .md" parses YAML frontmatter (`title`, `slug`, `excerpt`,
     `cover`, `coverAlt`, `coverHeight`, `preview`, `previewKind`, `toc`,
     `tocDepth`, `published`, `date`, `description`) into columns, and the rest
     into `body`.
   - "Export .md" writes the same format.
   - Columns stay canonical for list queries.
5. **Add `components/writings/ArticleLayout.tsx`**, a port of the reference
   spread:
   - **Hero** from `cover_image_url`: `next/image`, height `cover_height`
     (default 350), max width 550, horizontal plus vertical mask fades.
     Optional `coverStyle: "plain" | "dither"`, where dither is a CSS/canvas
     halftone matching pic 4's stipple look.
   - Title 32px, meta line (date · reading time), then the prose styles above.
   - **TOC**: sticky `top: 120px`, visible ≥1050px when `toc_enabled` and there
     are at least 2 headings.
     - Active section via IntersectionObserver
       (`rootMargin: "-100px 0px -60% 0px"`), setting `.is-active` and
       `aria-current="true"`.
     - Clicks smooth-scroll (instant under reduced motion) and update the hash
       without adding history spam.
   - **Prev/next** pagination by `published_at`.
   - Keep `[ / Back ]` linking to `/writings`.
6. **Keep the existing three posts rendering.** They use `##` sections, so they
   get a TOC automatically. Give each a cover image, or leave the hero out when
   `cover_image_url` is null.
7. SEO: `generateMetadata` uses `seo_description ?? excerpt` and the cover as
   `openGraph.images`.

### Studio
Upgrade `WritingsEditor`:
- A Markdown editor (CodeMirror 6 via `@uiw/react-codemirror` +
  `@codemirror/lang-markdown`, or keep the textarea) with a **live preview**
  that uses the same pipeline (a server action or a client build of it).
- A toolbar that inserts directive snippets, and image upload that inserts
  `::figure{src=…}`.
- Cover and preview uploads (feature 4), TOC toggle and depth, SEO description.
- Import/Export `.md`.
- Keep explicit Save (no autosave, which could publish half-written text).

### Acceptance criteria
- [ ] Posts are still Markdown in the DB; import and export round-trip without
  loss.
- [ ] Hero, figures (including bleed), callouts, gallery, video, YouTube embed,
  tables, footnotes, code with highlighting and `:highlight` popovers all
  render in light and dark themes.
- [ ] The TOC lists the headings, tracks the active section while scrolling,
  and jumps correctly (headings clear the sticky offset via
  `scroll-margin-top: 100px`).
- [ ] Mobile: banner 180px, single column, no TOC.
- [ ] Security: `<script>`, `<iframe>` and `javascript:` in a body render
  inert; only allow-listed embeds produce iframes.
- [ ] The existing three posts still render and gain a TOC.

---

## 10. Feature 6: Craft, the infinite board with focus highlight and hover info

### Goal
`/craft` becomes **truly infinite**: pan in any direction forever, every tile a
real work (the set repeats; no empty space). Tiles near the centre of the screen
are highlighted and tiles toward the edges fade (pic 5). **Hovering a tile for a
moment shows more information** about that work.

### Reference behaviour (ref, rmoon.me `/craft`)
- **Pattern layout (JS constants):**
  - Tile width `V = 350`, gap `gt = 40`, padding `ft = 40`, `Yt = 4` columns,
    world scale `C = 1.2`.
  - Items are declared as `{ src, id, col, row, height, video? }`.
  - Column x = `40 + col * (350 + 40)`; row height = the tallest item in that
    row; row y = cumulative (`40 + Σ(previous row heights + 40)`).
  - Pattern period width `(lastColumnX + 350) * 1.2`, with an equivalent height
    period. The world wraps both periods, so the board never ends.
  - Initial pan `{ x: -200, y: -80 }`.
- **Highlight:** every rendered tile gets `visibility v ∈ [0, 1]` (the product
  of horizontal and vertical falloffs relative to the viewport) and is styled
  `opacity: v; transform: scale(0.9 + 0.1 * v)`.
- **Transitions:**
  ```css
  .craft-item { position: absolute; border: 1px solid var(--neutral-200); border-radius: 12px; object-fit: cover;
    pointer-events: none; transform-origin: center; will-change: opacity, transform;
    transition: opacity .35s ease, transform .45s cubic-bezier(.16, 1, .3, 1); }
  .craft-dragging .craft-item { transition: none; }
  video.craft-item { background-color: var(--neutral-200); }
  .craft-hovering { cursor: pointer; }  .craft-dragging { cursor: grabbing; }
  ```
  Hover is hit-tested in JS: tiles are `pointer-events: none`, and the board
  compares the pointer against tile rects.
- **Click opens a lightbox:**
  ```css
  .craft-lightbox { position: fixed; inset: 0; z-index: 30; display: flex; align-items: center; justify-content: center; }
  .craft-lightbox-backdrop { position: absolute; inset: 0; background-color: #1716148c; opacity: 0; transition: opacity .35s ease; }
  .craft-lightbox-img { max-height: 70vh; max-width: min(72vw, 960px); border-radius: 12px;
    border: 1px solid color-mix(in srgb, var(--neutral-200) 10%, transparent); }
  .craft-lightbox-caption { color: var(--neutral-100); font-size: 13px; max-width: 60ch; text-align: center; opacity: 0; transition: opacity .35s ease; }
  .craft-lightbox-chrome-on { opacity: 1; }
  /* mobile: img max-height 62vh, max-width 88vw; caption padding-inline 20px */
  ```
  The clicked tile hides (opacity 0) while its lightbox is open; video items
  autoplay, loop and play muted. Wheel pans; Escape closes.

### Current implementation
`components/craft/CraftCanvas.tsx`:
- A finite board, clamped with `SLACK = 160`.
- Drag with a 4px threshold, pointer capture only after movement (so clicks
  still reach links), inertia (`FRICTION = 0.94`), arrow keys.
- Tiles are absolutely positioned from `craft_items.x/y/w/h`, with captions
  below and eager-loaded images; clicking opens `/crafts/<slug>/index.html` in a
  new tab.
- `app/craft/page.tsx` adds the floating intro panel (`.site-panel` at
  `left: 245px; top: 19px; width: 311px`).
- The rail card and corner controls come from `AppShell`.

### Implementation plan
1. Migration §4.4 (`description`, `tags`, `year`, `source_url`, `aspect`,
   `sort`).
2. **Add `components/craft/InfiniteCraftBoard.tsx`**, replacing `CraftCanvas`
   on `/craft`. Keep `CraftCanvas`, or delete it once the studio no longer needs
   it.
   - **Pattern:** masonry from `craft_items` ordered by `sort`, into
     `config.columns` columns of `tileWidth`, each tile's height from `aspect`
     (or the capture's intrinsic size).
     - If there are fewer items than cells, repeat items within the pattern
       using a deterministic shuffle so identical tiles are never adjacent.
     - Compute the pattern period (width and height, times `patternScale`) as
       in the reference.
     - Never leave an empty cell.
   - **Virtualisation:**
     - The world transform is written imperatively from rAF. Don't re-render
       React per frame.
     - Compute the visible world rect (plus one tile of margin). For each
       pattern tile, enumerate instances `x + kx * periodW`, `y + ky * periodH`
       that intersect it.
     - Key instances `${id}:${kx}:${ky}`. Recompute the set in React state only
       when the pan crosses a cell boundary.
     - Typically 20–40 DOM nodes are live.
   - **Highlight:** for each live instance, per frame:
     - `dx = |cx − viewportCx| / (viewportW / 2)`,
       `dy = |cy − viewportCy| / (viewportH / 2)`.
     - Inside `focusRect`, `v = 1`; beyond it,
       `smoothstep(focusRect, 1.15, d)` falls off to `minVisibility`.
     - `v = vx * vy` (clamped to `minVisibility`).
     - Style `opacity = v`, `transform = scale(scaleMin + (1 − scaleMin) * v)`.
     - Transitions are off while dragging and on (`opacityMs` / `transformMs`)
       while settling.
   - **Hover info (dwell):**
     - The pointer hit-tests tiles. After `hoverDelayMs` (600ms) with less than
       6px of pointer travel, no drag and no inertia, show an **info card**
       beside the tile: `.site-panel` styling, 280–320px wide, fade and slide
       200ms, placed on the side with room and clamped to the viewport.
     - Contents: title, `description`, `tags` as small chips, `year`, and links
       to **Live demo** (`href`) and **Source** (`source_url`).
     - Hide on pointer leave, drag start, wheel or Escape. Keyboard focus on a
       tile shows the card immediately.
     - Touch: long-press 500ms.
   - **Click:** `clickAction: "lightbox"` (the reference) opens the lightbox
     with the capture, caption and an **Open live demo** button; `"link"` opens
     the demo directly.
   - **Input:**
     - Drag with inertia (reuse the existing logic, minus the clamp).
     - Wheel and trackpad pan with `deltaX`/`deltaY` × `wheelSpeed`.
     - Arrow keys pan (Shift for bigger steps); touch works.
     - Optional `idleDriftPxPerSec`, a very slow drift for immersion. Off by
       default and disabled under reduced motion.
   - **Immersion:**
     - Offset the dot grid with the pan
       (`background-position: ${x % 18}px ${y % 18}px`).
     - Optionally add a soft vignette using `n50` at the edges.
     - Keep the floating rail card, intro panel and corner controls above the
       board (`z-index`).
   - **Performance:** `decoding="async"`; eager for the first screen, lazy
     beyond; `will-change` only while moving; pause rAF when idle and settled.
   - **Accessibility:**
     - The board is `role="application"` with an `aria-label` (keep the current
       one).
     - Provide a visually hidden list of all works (title, description, links),
       so every piece is reachable without panning.
     - The focus ring must be visible on the focused tile.
   - **Reduced motion:** no inertia, no drift, no scale; opacity highlight
     still applies, without transitions.
3. Keep the 12 existing crafts, captures (`public/craft/*.webp`) and demos
   (`public/crafts/<slug>/index.html`). Backfill `description`, `tags`, `year`
   and `source_url` from the crafts repo README (`E:\webdev\crafts\README.md`
   has a one-line description per piece; the repo is local, so leave
   `source_url` null until it is pushed).

### Studio
Rework `CraftEditor`:
- A list and form: title, caption, description, tags, year, demo link, source
  link, image upload (Supabase Storage), `aspect` (auto-filled from the uploaded
  image), published, drag-to-reorder `sort`.
- A live mini-preview of the repeating pattern.
- Keep "manual x/y layout" only if you implement a manual mode.

### Acceptance criteria
- [ ] Panning in any direction never reaches an edge or an empty area; tiles
  repeat seamlessly with no identical neighbours.
- [ ] Centre tiles are bright; tiles fade and shrink toward the edges; the
  transition settles smoothly after a drag (reference timings).
- [ ] Hovering a tile for about 600ms shows the info card with correct data;
  moving or dragging hides it; keyboard focus and long-press work.
- [ ] Clicking opens the lightbox (or the link, per config); Escape and the
  backdrop close it; demo and source links work.
- [ ] Drag with inertia, wheel, arrow keys and touch all pan; 60fps with 12
  items repeated; DOM stays under about 60 tiles.
- [ ] Reduced motion honoured; light and dark themes both look right; the intro
  panel, rail card and corner controls stay usable over the board.
- [ ] New crafts added in `/studio` appear within a minute.

---

## 11. Asset sourcing and licensing (feature 3)

- **3D models (safest):**
  - [Poly Pizza](https://poly.pizza/) hosts thousands of low-poly models,
    including [Quaternius](https://poly.pizza/u/Quaternius)'s, available as
    GLTF. Quaternius and Kenney models are **CC0** (free for any use, no
    attribution required). Still check the licence shown on each model page;
    other authors on Poly Pizza may use CC-BY.
  - [Kenney](https://kenney.nl/) and Poly Haven ship GLTF/GLB, and are listed
    among CC0 sources in guides such as
    [Cinevva's free 3D model sites](https://app.cinevva.com/guides/free-3d-model-sites).
  - Sketchfab models carry per-model licences (often CC-BY). If you use one,
    fill `credit` and `licence` and show the credit.
  - Good CC0 candidates: a football, game controller, film clapper, popcorn,
    headphones, camera, passport, suitcase, globe, map pin, ticket, plant,
    coffee cup.
- **Movie posters, anime covers, game key art:** these are copyrighted by their
  owners.
  - The [TMDB API](https://www.themoviedb.org/api-terms-of-use) is free for
    non-commercial use **if you attribute TMDB**, in an About or Credits area,
    using an [approved TMDB logo](https://www.themoviedb.org/about/logos-attribution)
    and the notice *"This product uses the TMDB API but is not endorsed or
    certified by TMDB."* See also the
    [TMDB developer FAQ](https://developer.themoviedb.org/docs/faq).
  - For anime and games, check the terms of whichever API you use (e.g. AniList,
    RAWG) before hot-linking or storing images.
  - When in doubt, represent a favourite with a CC0 object plus the title as
    text, rather than the artwork itself.
- **Football:** club crests are trademarks. Prefer a generic ball or a scarf in
  club colours, and put the club name as text.
- **Travel:** use the owner's **own photos**; ask for them. Stock photos from
  sources with clear licences (Unsplash License, Pexels) are the fallback.
- **Pipeline:**
  - Download to **E:** (not C:).
  - Compress GLBs (`npx @gltf-transform/cli optimize in.glb out.glb --compress meshopt`).
  - Resize textures to at most 1024px WebP.
  - Upload through the studio to the `media` bucket.
  - Record `credit` and `licence` for every asset.

---

## 12. Open questions for the owner (ask before building the affected part)

1. **Home direction:** should cards travel **downward** (top → bottom, the
   literal request, now the default) or upward (a classic auto-scroll)? It's
   one config value either way.
2. **About content:** the actual favourites.
   - Movies (titles).
   - Anime (titles).
   - Football (club, players).
   - Games (titles).
   - Travel (places, plus photos).
   - Any other interests.
   
   Nothing in this category may be invented.
3. **Craft click:** lightbox first (reference), or open the live demo directly?
4. **Writings row meta:** numbers `003 / 002 / 001` (reference) or dates
   (current)?
5. **Uploads:** Supabase Storage (recommended; already connected) or Filebase
   (needs `FILEBASE_*` credentials)?
6. **Projects:** move to the `projects` table now (recommended; the admin can
   manage n works), or keep `content/projects.ts` static for this round?

---

## 13. Suggested order of work

1. Foundations: `content/config.ts`; migrations §4.1–4.6 plus advisors; storage
   upload helper; types.
2. Feature 5 (the Markdown pipeline is the base for writings).
3. Feature 4 (list previews; small, reuses uploads).
4. Feature 1 (home marquee; move rows to data).
5. Feature 2 (works ring; shares the Projects studio tab with 1).
6. Feature 6 (infinite craft board; craft metadata in the studio).
7. Feature 3 (the About scene; heaviest, and blocked on the owner's favourites
   and asset licences).
8. Studio Settings tab (§3.3) exposing the config values.

Each step: implement, lint, typecheck, verify in the browser, update
`README.md` and `docs/BACKEND.md` where behaviour or setup changed.

---

## 14. Verification checklist (every feature)

```bash
npm run lint
npx tsc --noEmit
# stop `npm run dev` first — they share .next/
npm run build
npm run dev
```

- Check at **1608×862** (reference size) and **375×812**, in light and dark
  themes, and with reduced motion emulated.
- Confirm interactions with a real pointer. Use
  `document.elementFromPoint(x, y)` to prove nothing invisible covers a target
  (§1, gotchas 2 and 3).
- Supabase: `get_advisors` after DDL; curl with the publishable key to prove
  anon reads work and anon writes fail (`42501`).
- Studio: sign in as the owner, create, edit, publish and delete an item for
  each new table; confirm it appears on the page within the 60-second
  revalidate window.
- No console errors; no hydration warnings (except the intentional
  `suppressHydrationWarning` on `<html>` for the theme attribute).

---

## 15. Useful commands

```bash
# re-capture a page, a live site or a craft (writes PNG; convert to WebP with sharp)
TEMP='E:\webdev\.tmp' TMP='E:\webdev\.tmp' node scripts/screenshot.mjs jobs.json
# jobs.json: [{ "url": "https://…", "out": "E:/webdev/_shots/x.png", "width": 1440, "height": 900, "wait": 2500 }]

# copy an updated craft demo into the site
cp E:/webdev/crafts/<slug>/index.html public/crafts/<slug>/index.html
```

The reference CSS and JS used for this document were downloaded to
`E:\webdev\_ref\` (`all.css`, `all.js`, `page-*.html`), if you need to look up a
value that isn't quoted here.

---

## Sources

- Reference site: [rmoon.me](https://rmoon.me): [/works](https://rmoon.me/works), [/about](https://rmoon.me/about), [/writings](https://rmoon.me/writings), [/writings/portfolio-update](https://rmoon.me/writings/portfolio-update), [/craft](https://rmoon.me/craft)
- [Poly Pizza — free 3D models](https://poly.pizza/) · [Quaternius on Poly Pizza](https://poly.pizza/u/Quaternius) · [Poly Pizza API docs](https://poly.pizza/docs/api/v1.1)
- [Best Free 3D Model Sites for Games (2026) — Cinevva](https://app.cinevva.com/guides/free-3d-model-sites) · [Where to Find Free Game Assets in 2026 — Cinevva](https://app.cinevva.com/guides/game-assets-guide)
- [TMDB API Terms of Use](https://www.themoviedb.org/api-terms-of-use) · [TMDB Logos & Attribution](https://www.themoviedb.org/about/logos-attribution) · [TMDB developer FAQ](https://developer.themoviedb.org/docs/faq)
- [Infinite Canvas: Building a Seamless, Pan-Anywhere Image Space — Codrops](https://tympanus.net/codrops/2026/01/07/infinite-canvas-building-a-seamless-pan-anywhere-image-space/)
