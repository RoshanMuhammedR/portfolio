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
