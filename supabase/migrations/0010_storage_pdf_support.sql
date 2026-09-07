-- ============================================================
-- MukiSoft Technology — Extend storage bucket for PDF uploads
-- File: supabase/migrations/0010_storage_pdf_support.sql
--
-- The mukisoft-media bucket was originally created with an
-- image-only MIME allow-list. Research papers need to upload PDFs
-- alongside images, so this migration:
--   1. Adds `application/pdf` to the bucket's allowed_mime_types.
--   2. Leaves the bucket public (so gallery images and published
--      research PDFs remain publicly readable via public URLs).
--   3. Keeps the existing admin-only write policies from
--      `supabase/storage.sql`. Storage policies are already correct;
--      we don't recreate them here.
--
-- Idempotent — safe to re-run.
-- ============================================================

do $$
declare
  current_mimes text[];
begin
  select coalesce(allowed_mime_types, '{}'::text[])
    into current_mimes
    from storage.buckets
   where id = 'mukisoft-media';

  if not ('application/pdf'::text = any(current_mimes)) then
    update storage.buckets
       set allowed_mime_types = array_cat(
             coalesce(allowed_mime_types, '{}'::text[]),
             array['application/pdf']
           )
     where id = 'mukisoft-media';
  end if;
end$$;
