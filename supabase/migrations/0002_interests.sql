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
