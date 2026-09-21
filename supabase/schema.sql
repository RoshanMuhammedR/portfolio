-- Portfolio content schema.
--
-- Two tables, both world-readable where published and writable only by one
-- account. The site reads them with the publishable key; the studio writes them
-- as a signed-in user. Images are NOT stored here - only their URL.
--
-- Applied to the live project as migration `portfolio_content_schema`. To set
-- up a fresh project: SQL Editor -> New query -> paste this file -> Run.

-- ---------------------------------------------------------------- craft ----
create table if not exists public.craft_items (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  caption     text,
  href        text,
  image_url   text,
  -- Board coordinates, in px. The studio writes these when a tile is dragged.
  x           integer not null default 0,
  y           integer not null default 0,
  w           integer not null default 320,
  h           integer not null default 200,
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ------------------------------------------------------------- writings ----
create table if not exists public.writings (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  excerpt      text,
  -- Markdown. Rendered to React elements on the server, never injected as HTML.
  body         text not null default '',
  published    boolean not null default false,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists writings_published_idx
  on public.writings (published, published_at desc);

-- ---------------------------------------------------------------- owner ----
-- CHANGE THIS EMAIL if the site ever changes hands. It is the only thing
-- standing between a signed-up stranger and the content. It must exist before
-- the policies below, which resolve it when they are created.
create or replace function public.is_site_owner()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'roshanmuhammed50@gmail.com';
$$;

-- ------------------------------------------------------------------ rls ----
-- One SELECT policy per table (published rows for everyone, all rows for the
-- owner) rather than two overlapping ones, and writes split by command so none
-- of them re-grants SELECT. `(select ...)` lets Postgres evaluate the owner
-- check once per statement instead of once per row.
alter table public.craft_items enable row level security;
alter table public.writings    enable row level security;

drop policy if exists "read published craft" on public.craft_items;
create policy "read published craft"
  on public.craft_items for select
  using (published = true or (select public.is_site_owner()));

drop policy if exists "owner inserts craft" on public.craft_items;
create policy "owner inserts craft"
  on public.craft_items for insert to authenticated
  with check ((select public.is_site_owner()));

drop policy if exists "owner updates craft" on public.craft_items;
create policy "owner updates craft"
  on public.craft_items for update to authenticated
  using ((select public.is_site_owner()))
  with check ((select public.is_site_owner()));

drop policy if exists "owner deletes craft" on public.craft_items;
create policy "owner deletes craft"
  on public.craft_items for delete to authenticated
  using ((select public.is_site_owner()));

drop policy if exists "read published writings" on public.writings;
create policy "read published writings"
  on public.writings for select
  using (published = true or (select public.is_site_owner()));

drop policy if exists "owner inserts writings" on public.writings;
create policy "owner inserts writings"
  on public.writings for insert to authenticated
  with check ((select public.is_site_owner()));

drop policy if exists "owner updates writings" on public.writings;
create policy "owner updates writings"
  on public.writings for update to authenticated
  using ((select public.is_site_owner()))
  with check ((select public.is_site_owner()));

drop policy if exists "owner deletes writings" on public.writings;
create policy "owner deletes writings"
  on public.writings for delete to authenticated
  using ((select public.is_site_owner()));

-- ------------------------------------------------------------- updated_at --
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists craft_items_touch on public.craft_items;
create trigger craft_items_touch
  before update on public.craft_items
  for each row execute function public.touch_updated_at();

drop trigger if exists writings_touch on public.writings;
create trigger writings_touch
  before update on public.writings
  for each row execute function public.touch_updated_at();

-- ===========================================================================
-- Six interactive features (docs/HANDOVER-next-features.md).
--
-- Applied as the numbered files in supabase/migrations/. They are repeated
-- here, in order, so a fresh project can be recreated from this one file.
-- The seed (0007) is deliberately NOT repeated here: it is content, not schema.
-- ===========================================================================

-- ------------------------------------------------ 0001_projects ----
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

-- ------------------------------------------------ 0002_interests ----
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

-- ------------------------------------------------ 0003_writings_rich ----
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

-- ------------------------------------------------ 0004_craft_meta ----
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

-- ------------------------------------------------ 0005_site_settings ----
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

-- ------------------------------------------------ 0006_media_bucket ----
--
-- Covers, previews, textures, models and craft captures. Public to read - they
-- are all published on the site anyway - and writable only by the owner, so the
-- publishable key in the browser cannot be used to fill the bucket.

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
