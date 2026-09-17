-- 0006_media_bucket
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
