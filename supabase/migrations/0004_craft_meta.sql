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
