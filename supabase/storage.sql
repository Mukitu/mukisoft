-- ============================================================
-- MukiSoft Technology — storage bucket setup
-- File: supabase/storage.sql
--
-- Creates the `mukisoft-media` bucket for admin image uploads.
-- Run in the Supabase SQL editor after running the schema migration.
-- ============================================================

-- Create a public bucket with an explicit 50 MB per-object size limit.
-- Without an explicit file_size_limit, Supabase may default to a very
-- small limit (or 0 on some plans), which causes the upload error
-- "The object exceeded the maximum allowed size" even for normal
-- photos. 50 MB comfortably fits any portfolio image and is well
-- below the free-tier storage quota.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'mukisoft-media',
  'mukisoft-media',
  true,
  52428800, -- 50 MB
  array[
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'image/avif',
    'application/pdf'
  ]
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Allow admins to upload, update, replace, and delete files in the bucket.
drop policy if exists "mukisoft-media admin read" on storage.objects;
create policy "mukisoft-media admin read"
  on storage.objects for select
  using (
    bucket_id = 'mukisoft-media'
    and public.is_admin()
  );

drop policy if exists "mukisoft-media admin insert" on storage.objects;
create policy "mukisoft-media admin insert"
  on storage.objects for insert
  with check (
    bucket_id = 'mukisoft-media'
    and public.is_admin()
  );

drop policy if exists "mukisoft-media admin update" on storage.objects;
create policy "mukisoft-media admin update"
  on storage.objects for update
  using (
    bucket_id = 'mukisoft-media'
    and public.is_admin()
  )
  with check (
    bucket_id = 'mukisoft-media'
    and public.is_admin()
  );

drop policy if exists "mukisoft-media admin delete" on storage.objects;
create policy "mukisoft-media admin delete"
  on storage.objects for delete
  using (
    bucket_id = 'mukisoft-media'
    and public.is_admin()
  );

-- Allow anyone to read public objects in the bucket.
drop policy if exists "mukisoft-media public read" on storage.objects;
create policy "mukisoft-media public read"
  on storage.objects for select
  using (bucket_id = 'mukisoft-media');