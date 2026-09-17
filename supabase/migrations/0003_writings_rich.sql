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
