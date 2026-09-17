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
