-- pending.sql
--
-- Every migration this project is waiting for, in one paste: 0001-0005, the
-- seed (0007), the media bucket (0006), then the Saga crafts (0008). Open the Supabase dashboard ->
-- SQL Editor -> New query, paste this whole file, and press Run.
--
-- Safe to run more than once: tables and columns are only added when missing,
-- policies are replaced by name, and the seed skips rows that already exist.
-- The dashboard may warn about "destructive operations" - those are the
-- `drop policy if exists` lines that replace a policy with the same name.
--
-- The last statement prints one row so you can see what landed. Expect:
--   projects 10 | craft_described 10 | media_bucket true | media_policies 4
--
-- The numbered files in supabase/migrations/ stay the source of truth; this is
-- them, concatenated, for a project created before they existed. The studio
-- points here whenever a tab finds its table or columns missing.

-- ------------------------------------------------------- 0001_projects ----
-- 0001_projects
--
-- Works and the Home mosaic read from here instead of content/projects.ts, so
-- the owner can add a project without a deploy. The static file stays as the
-- fallback for a site running with no backend.

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
  -- CSS object-position, so a crop lands on the part of the page worth seeing.
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

create index if not exists projects_published_idx
  on public.projects (published, sort);

alter table public.projects enable row level security;

drop policy if exists "read published projects" on public.projects;
create policy "read published projects"
  on public.projects for select
  using (published = true or (select public.is_site_owner()));

drop policy if exists "owner inserts projects" on public.projects;
create policy "owner inserts projects"
  on public.projects for insert to authenticated
  with check ((select public.is_site_owner()));

drop policy if exists "owner updates projects" on public.projects;
create policy "owner updates projects"
  on public.projects for update to authenticated
  using ((select public.is_site_owner()))
  with check ((select public.is_site_owner()));

drop policy if exists "owner deletes projects" on public.projects;
create policy "owner deletes projects"
  on public.projects for delete to authenticated
  using ((select public.is_site_owner()));

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch
  before update on public.projects
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------ 0002_interests ----
-- 0002_interests
--
-- The objects in the About scene. One row per favourite: what it is, what it
-- looks like in the scene, what happens when it is tapped, and - for anything
-- that is not CC0 - the credit its licence requires.

create table if not exists public.interests (
  id           uuid primary key default gen_random_uuid(),
  category     text not null check (category in ('movie', 'anime', 'football', 'game', 'travel', 'music', 'other')),
  title        text not null,
  subtitle     text,
  note         text,
  link_url     text,
  -- Poster, cover or photo applied to a card, book or polaroid.
  texture_url  text,
  -- Optional .glb, used when object_type = 'model'.
  model_url    text,
  object_type  text not null default 'card'
               check (object_type in ('card', 'book', 'ball', 'controller', 'polaroid', 'model')),
  action       text not null default 'info'
               check (action in ('info', 'flip', 'kick', 'open', 'spin', 'link')),
  scale        real not null default 1,
  -- The resting layout the Reset button restores. Null lets the scene place it.
  pos_x        real,
  pos_z        real,
  rot_y        real,
  -- Attribution line the asset's licence requires, and the licence itself.
  credit       text,
  licence      text,
  sort         integer not null default 0,
  published    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists interests_published_idx
  on public.interests (published, sort);

alter table public.interests enable row level security;

drop policy if exists "read published interests" on public.interests;
create policy "read published interests"
  on public.interests for select
  using (published = true or (select public.is_site_owner()));

drop policy if exists "owner inserts interests" on public.interests;
create policy "owner inserts interests"
  on public.interests for insert to authenticated
  with check ((select public.is_site_owner()));

drop policy if exists "owner updates interests" on public.interests;
create policy "owner updates interests"
  on public.interests for update to authenticated
  using ((select public.is_site_owner()))
  with check ((select public.is_site_owner()));

drop policy if exists "owner deletes interests" on public.interests;
create policy "owner deletes interests"
  on public.interests for delete to authenticated
  using ((select public.is_site_owner()));

drop trigger if exists interests_touch on public.interests;
create trigger interests_touch
  before update on public.interests
  for each row execute function public.touch_updated_at();

-- -------------------------------------------------- 0003_writings_rich ----
-- 0003_writings_rich
--
-- What the list preview shows (feature 4) and what the article page needs
-- (feature 5). Every column has a default, so the three existing posts keep
-- rendering untouched.

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

-- ----------------------------------------------------- 0004_craft_meta ----
-- 0004_craft_meta
--
-- What the hover card on the infinite board shows. `x, y, w, h` stay for the
-- optional manual-layout mode; the board itself lays tiles out from `sort`.

alter table public.craft_items
  add column if not exists description text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists year smallint,
  -- `href` stays the live demo; this is the repository behind it.
  add column if not exists source_url text,
  -- width / height. Derived from the capture when null.
  add column if not exists aspect real,
  add column if not exists sort integer not null default 0;

create index if not exists craft_items_published_idx
  on public.craft_items (published, sort);

-- -------------------------------------------------- 0005_site_settings ----
-- 0005_site_settings
--
-- Runtime overrides for content/config.ts, one row per group, keyed by path
-- ("craft.board"). Readable by everyone because the values are already visible
-- in the rendered page; only the owner may write them. lib/settings.ts
-- validates every value before it is merged, so a bad row is inert.

create table if not exists public.site_settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "settings are public" on public.site_settings;
create policy "settings are public"
  on public.site_settings for select using (true);

drop policy if exists "owner inserts settings" on public.site_settings;
create policy "owner inserts settings"
  on public.site_settings for insert to authenticated
  with check ((select public.is_site_owner()));

drop policy if exists "owner updates settings" on public.site_settings;
create policy "owner updates settings"
  on public.site_settings for update to authenticated
  using ((select public.is_site_owner()))
  with check ((select public.is_site_owner()));

drop policy if exists "owner deletes settings" on public.site_settings;
create policy "owner deletes settings"
  on public.site_settings for delete to authenticated
  using ((select public.is_site_owner()));

drop trigger if exists site_settings_touch on public.site_settings;
create trigger site_settings_touch
  before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- ---------------------------------------- 0007_seed_projects_and_craft ----
-- 0007_seed_projects_and_craft
--
-- Moves the nine projects in content/projects.ts, plus the Konnectify
-- internship, into the table, and fills in the craft metadata the hover card
-- reads. Everything here is already on the site; nothing is invented.
--
-- `glow` stays null: the tuned gradients live in content/glows.ts, keyed by
-- slug, and the column is only for overriding one of them.
--
-- `sort` reproduces the Home mosaic as it is authored today. `home_layout` on
-- the first project of a row sets that row's shape.

insert into public.projects
  (slug, title, subtitle, tags, kind, live_url, repo_url, image_url, image_position,
   show_on_home, show_on_works, home_layout, sort, published)
values
  -- On Works only: there is no screenshot, and Home opens on work that has one.
  ('konnectify', 'Konnectify', 'Software Development Intern',
   '{Internship,Full-stack}', 'experience',
   null, null, null, 'center top',
   false, true, null, 0, true),

  ('saga', 'Saga', 'Agentic RAG knowledge base',
   '{RAG,FastAPI,pgvector}', 'project',
   'https://saga.dedyn.io/', 'https://github.com/RoshanMuhammedR/KB-ULT',
   '/work/saga.webp', 'center',
   true, true, 'full', 1, true),

  ('ai-trip-planner', 'AI Trip Planner', 'Contextual itinerary engine',
   '{React,Gemini,"Places API"}', 'project',
   'https://ai-trip-planner-rho-orcin.vercel.app/', 'https://github.com/RoshanMuhammedR/AI_Trip_Planner',
   '/work/ai-trip-planner.webp', 'center 58%',
   true, true, 'full', 2, true),

  ('sniplink', 'Sniplink', 'URL shortener with cached redirects',
   '{"Java 21","Spring Boot",Redis}', 'project',
   'https://sniplink.dedyn.io/', 'https://github.com/RoshanMuhammedR/sniplink',
   '/work/sniplink.webp', 'center 12%',
   true, true, 'aside', 3, true),

  ('vps-stack', 'vps-stack', 'Scale-to-zero hosting on one VPS',
   '{Docker,Caddy,Python}', 'project',
   'https://github.com/RoshanMuhammedR/vps-stack', 'https://github.com/RoshanMuhammedR/vps-stack',
   null, 'center top',
   true, true, null, 4, true),

  ('ai-resume-analyzer', 'Resume Analyzer', 'Résumé-to-job fit analysis',
   '{"Next.js","Claude API"}', 'project',
   'https://ai-resume-analyzer-blond-pi.vercel.app/', 'https://github.com/RoshanMuhammedR/ai-resume-analyzer',
   '/work/ai-resume-analyzer.webp', 'center top',
   true, true, 'pair', 5, true),

  ('youtube-chat', 'YouTube Chat', 'Chat with a video, jump to the cited moment',
   '{FastAPI,LangChain,Extension}', 'project',
   'https://github.com/RoshanMuhammedR/Youtube-Chat', 'https://github.com/RoshanMuhammedR/Youtube-Chat',
   null, 'center top',
   true, true, null, 6, true),

  ('lumyn', 'Lumyn', 'AI website creator',
   '{"Next.js",NestJS,Prisma}', 'project',
   'https://github.com/RoshanMuhammedR/lumyn', 'https://github.com/RoshanMuhammedR/lumyn',
   null, 'center top',
   true, true, 'aside-flipped', 7, true),

  ('monotask', 'MonoTask', 'MERN task manager',
   '{MongoDB,Express,React}', 'project',
   'https://to-do-mern-y0qk.onrender.com/', 'https://github.com/RoshanMuhammedR/To-Do_MERN',
   '/work/monotask.webp', 'center',
   true, true, null, 8, true),

  -- On Works but not in the Home mosaic, which is authored as five rows.
  ('truthmesh', 'TruthMesh', 'Crowdsourced news verification · hackathon',
   '{Python,Streamlit}', 'project',
   'https://github.com/RoshanMuhammedR/TruthMesh_ZenMinds', 'https://github.com/RoshanMuhammedR/TruthMesh_ZenMinds',
   null, 'center top',
   false, true, null, 9, true)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------- craft ----
-- Descriptions are the one-line summaries from the crafts repo README; the
-- aspect ratios are the captures' own. `source_url` stays null because the
-- repository is local and has not been pushed.
update public.craft_items as c
set description = v.description,
    tags        = v.tags,
    year        = 2026,
    aspect      = v.aspect,
    sort        = v.sort
from (values
  ('/crafts/01-job-queue/index.html',
   'Producers enqueue jobs, workers drain them, failures retry and land in a dead-letter lane after three attempts.',
   '{Queues,Retries,Workers}'::text[], 1.6::real, 1),
  ('/crafts/02-token-bucket/index.html',
   'A rate limiter refilling at a fixed rate; requests without a token get a 429.',
   '{"Rate limiting",Algorithms}'::text[], 1.6::real, 2),
  ('/crafts/03-vector-search/index.html',
   'Top-k retrieval over embedded chunks — move the query, watch the ranking change.',
   '{Embeddings,Retrieval,RAG}'::text[], 1.6::real, 3),
  ('/crafts/04-hash-ring/index.html',
   'Consistent hashing with virtual nodes; adding a server only moves one arc of keys.',
   '{"Consistent hashing",Sharding}'::text[], 1.0::real, 4),
  ('/crafts/05-lru-cache/index.html',
   'Hits move to the front, misses evict the back, under Zipf-shaped traffic.',
   '{Caching,Eviction}'::text[], 1.6::real, 5),
  ('/crafts/06-permission-resolver/index.html',
   'User override, then team policy, then role — with the trace for any cell.',
   '{RBAC,Authorisation}'::text[], 1.6::real, 6),
  ('/crafts/07-workflow-canvas/index.html',
   'A node graph with draggable nodes and wires that follow.',
   '{Canvas,Graphs,Interaction}'::text[], 1.6::real, 7),
  ('/crafts/08-command-palette/index.html',
   'Fuzzy matching with word-start bonuses, grouped and keyboard-first.',
   '{"Fuzzy search",Keyboard}'::text[], 1.0::real, 8),
  ('/crafts/09-magnetic-dock/index.html',
   'Cosine-falloff magnification and a springy launch.',
   '{Motion,Interaction}'::text[], 1.0::real, 9),
  ('/crafts/10-citation-reader/index.html',
   'Every claim in an answer linked to the source chunk it came from.',
   '{RAG,Citations}'::text[], 1.6::real, 10),
  ('/crafts/11-deploy-replay/index.html',
   'A replay of vps-stack''s one-command bring-up.',
   '{Deploys,Docker}'::text[], 1.0::real, 11),
  ('/crafts/12-activity-heatmap/index.html',
   'A year-long calendar heatmap over seeded sample data.',
   '{Dataviz,Calendars}'::text[], 1.6::real, 12)
) as v(href, description, tags, aspect, sort)
where c.href = v.href;

-- --------------------------------------------------- 0006_media_bucket ----
-- Covers, previews, textures, models and craft captures: public to read,
-- writable only by the owner. Storage belongs to Supabase, so this part runs in
-- a block of its own - if the project will not let the SQL editor manage
-- storage policies, only this block is skipped (media_bucket / media_policies
-- in the check below say so) and everything above still applies. Create a
-- public bucket named `media` under Storage instead, then add the four
-- policies from 0006_media_bucket.sql there.
do $$
begin
  insert into storage.buckets (id, name, public)
  values ('media', 'media', true)
  on conflict (id) do nothing;

  drop policy if exists "media is public" on storage.objects;
  create policy "media is public"
    on storage.objects for select
    using (bucket_id = 'media');

  drop policy if exists "owner uploads media" on storage.objects;
  create policy "owner uploads media"
    on storage.objects for insert to authenticated
    with check (bucket_id = 'media' and (select public.is_site_owner()));

  drop policy if exists "owner updates media" on storage.objects;
  create policy "owner updates media"
    on storage.objects for update to authenticated
    using (bucket_id = 'media' and (select public.is_site_owner()))
    with check (bucket_id = 'media' and (select public.is_site_owner()));

  drop policy if exists "owner deletes media" on storage.objects;
  create policy "owner deletes media"
    on storage.objects for delete to authenticated
    using (bucket_id = 'media' and (select public.is_site_owner()));
exception
  when insufficient_privilege then
    raise warning 'media bucket skipped: %', sqlerrm;
end
$$;

-- ------------------------------------------------------ 0008_saga_crafts ----
-- 0008_saga_crafts
--
-- Replaces the twelve original crafts with ten UI pieces rebuilt from Saga
-- (github.com/RoshanMuhammedR/KB-ULT), each a self-contained page under
-- public/crafts/ with its capture in public/craft/.
--
-- Craft rows now carry a `slug`, so a craft set can be synced from a file like
-- this one: re-running it updates the rows by slug instead of duplicating them.
-- Rows made in the studio keep a null slug and are left alone.
--
-- Descriptions and tags come from the craft brief written against the Saga
-- code; nothing here is a metric or a claim about usage.

alter table public.craft_items add column if not exists slug text;
create unique index if not exists craft_items_slug_key on public.craft_items (slug);

-- The original twelve, matched by the demo each one opened.
delete from public.craft_items
where slug is null
  and href in (
    '/crafts/01-job-queue/index.html', '/crafts/02-token-bucket/index.html',
    '/crafts/03-vector-search/index.html', '/crafts/04-hash-ring/index.html',
    '/crafts/05-lru-cache/index.html', '/crafts/06-permission-resolver/index.html',
    '/crafts/07-workflow-canvas/index.html', '/crafts/08-command-palette/index.html',
    '/crafts/09-magnetic-dock/index.html', '/crafts/10-citation-reader/index.html',
    '/crafts/11-deploy-replay/index.html', '/crafts/12-activity-heatmap/index.html'
  );

-- `x, y, w, h` only matter to the manual-layout mode; the infinite board lays
-- tiles out from `sort` and `aspect` (1.6 for the wide captures, 1 for square).
insert into public.craft_items
  (slug, title, caption, href, image_url, x, y, w, h,
   description, tags, year, source_url, aspect, sort, published)
values
  ('streaming-answer', 'Streaming answer', '01 · Streaming answer',
   '/crafts/01-streaming-answer/index.html', '/craft/01-streaming-answer.webp', 280, 200, 408, 255,
   'A question streams into a cited answer: live stage labels, shimmer skeleton, caret, then sources and checks.',
   '{Streaming,"State machine",Chat}', 2026, 'https://github.com/RoshanMuhammedR/KB-ULT', 1.6, 1, true),

  ('retrieval-terminal', 'Retrieval terminal', '02 · Retrieval terminal',
   '/crafts/02-retrieval-terminal/index.html', '/craft/02-retrieval-terminal.webp', 748, 150, 408, 255,
   'A looping readout: a question types itself, a meter fills, passages rank in with scrambled names and scores.',
   '{Timeline,"Text scramble",Loop}', 2026, 'https://github.com/RoshanMuhammedR/KB-ULT', 1.6, 2, true),

  ('citation-jump', 'Citation jump', '03 · Citation jump',
   '/crafts/03-citation-jump/index.html', '/craft/03-citation-jump.webp', 1216, 210, 408, 255,
   'Click a cited passage to open its source with the exact passage highlighted, then step through citations.',
   '{Master–detail,"Document viewer",Navigation}', 2026, 'https://github.com/RoshanMuhammedR/KB-ULT', 1.6, 3, true),

  ('drag-to-chat', 'Drag to chat', '04 · Drag to chat',
   '/crafts/04-drag-to-chat/index.html', '/craft/04-drag-to-chat.webp', 1684, 150, 408, 255,
   'Drag a knowledge-base card onto the Chat tab or composer to attach it; hovering the tab opens chat.',
   '{"Drag and drop","Drop targets",State}', 2026, 'https://github.com/RoshanMuhammedR/KB-ULT', 1.6, 4, true),

  ('slice-sweep', 'Slice sweep', '05 · Slice sweep',
   '/crafts/05-slice-sweep/index.html', '/craft/05-slice-sweep.webp', 280, 520, 408, 255,
   'A list where each row floods with the accent in 37 thin slices on hover and drains to the right on leave.',
   '{Hover,Stagger}', 2026, 'https://github.com/RoshanMuhammedR/KB-ULT', 1.6, 5, true),

  ('edge-glow-card', 'Edge-glow card', '06 · Edge-glow card',
   '/crafts/06-edge-glow-card/index.html', '/craft/06-edge-glow-card.webp', 748, 470, 395, 395,
   'A dashed card whose lit edge turns to face the pointer, over a grid whose gutters glow where you move.',
   '{"Pointer tracking","Conic gradient",SVG}', 2026, 'https://github.com/RoshanMuhammedR/KB-ULT', 1, 6, true),

  ('upload-and-ingest', 'Upload and ingest', '07 · Upload and ingest',
   '/crafts/07-upload-and-ingest/index.html', '/craft/07-upload-and-ingest.webp', 1216, 530, 395, 395,
   'Pick a source type, drop files, and watch each one move through reading, splitting and indexing.',
   '{Dropzone,Progress,"Async states"}', 2026, 'https://github.com/RoshanMuhammedR/KB-ULT', 1, 7, true),

  ('spark-loader', 'Spark loader', '08 · Spark loader',
   '/crafts/08-spark-loader/index.html', '/craft/08-spark-loader.webp', 1684, 470, 395, 395,
   'Labels scramble in, corner pins flicker, the spark fills from below, then its four petals fold to the centre.',
   '{Intro,"SVG mask",Timeline}', 2026, 'https://github.com/RoshanMuhammedR/KB-ULT', 1, 8, true),

  ('menu-reveal', 'Menu reveal', '09 · Menu reveal',
   '/crafts/09-menu-reveal/index.html', '/craft/09-menu-reveal.webp', 280, 840, 395, 395,
   'Hamburger morphs to a close mark while a dashed card scales from its corner and lines rise behind masks.',
   '{Menu,Morph,Stagger}', 2026, 'https://github.com/RoshanMuhammedR/KB-ULT', 1, 9, true),

  ('section-rail', 'Section rail', '10 · Section rail',
   '/crafts/10-section-rail/index.html', '/craft/10-section-rail.webp', 748, 930, 395, 395,
   'A scroll-spy rail: each segment fills as you read, labels slide out on hover, the current name scrambles in.',
   '{Scroll-spy,Progress,Navigation}', 2026, 'https://github.com/RoshanMuhammedR/KB-ULT', 1, 10, true)
on conflict (slug) do update set
  title = excluded.title, caption = excluded.caption, href = excluded.href,
  image_url = excluded.image_url, x = excluded.x, y = excluded.y, w = excluded.w, h = excluded.h,
  description = excluded.description, tags = excluded.tags, year = excluded.year,
  source_url = excluded.source_url, aspect = excluded.aspect, sort = excluded.sort,
  published = excluded.published;

-- ---------------------------------------------------------------- done ----
-- Make the new tables visible to the API straight away.
notify pgrst, 'reload schema';

select
  (select count(*) from public.projects) as projects,
  (select count(*) from public.craft_items where description is not null) as craft_described,
  exists (select 1 from storage.buckets where id = 'media') as media_bucket,
  (select count(*) from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname in ('media is public', 'owner uploads media',
                         'owner updates media', 'owner deletes media')) as media_policies;
